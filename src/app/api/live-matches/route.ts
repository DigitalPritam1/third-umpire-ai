import { NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com";

function rapidFetch(path: string) {
  return fetch(`https://${RAPIDAPI_HOST}${path}`, {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
    next: { revalidate: 30 },
  });
}

function extractScore(inngs: any) {
  if (!inngs) return null;
  return {
    runs: inngs.runs ?? inngs.score ?? 0,
    wickets: inngs.wickets ?? 0,
    overs: inngs.overs ?? inngs.pOver ?? "0",
  };
}

export async function GET() {
  if (!RAPIDAPI_KEY) {
    return NextResponse.json(
      { error: "RAPIDAPI_KEY not configured in .env.local" },
      { status: 500 }
    );
  }

  try {
    const res = await rapidFetch("/matches/v1/live");
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json(
        { error: `Cricbuzz returned ${res.status}: ${txt.slice(0, 300)}` },
        { status: res.status }
      );
    }

    const raw = await res.json();
    const allMatches: any[] = [];

    for (const typeMatch of raw?.typeMatches ?? []) {
      for (const seriesMatch of typeMatch?.seriesMatches ?? []) {
        const wrapper = seriesMatch?.seriesAdWrapper ?? seriesMatch;
        const seriesName: string = wrapper?.seriesName ?? "";
        const matchList: any[] = wrapper?.matches ?? [];

        for (const m of matchList) {
          const info = m?.matchInfo;
          const scoreData = m?.matchScore;
          if (!info) continue;

          const isIPL =
            seriesName.toLowerCase().includes("ipl") ||
            seriesName.toLowerCase().includes("indian premier");
          const isT20 =
            info?.matchFormat === "T20" ||
            (info?.matchDescription ?? "").toLowerCase().includes("t20");

          // Include IPL always; include other T20s if live
          const state: string = info?.state ?? "";
          const isLive = state === "In Progress" || state === "live";
          if (!isIPL && !isT20) continue;
          if (!isIPL && !isLive) continue;

          const t1 = info?.team1 ?? {};
          const t2 = info?.team2 ?? {};

          const t1ScoreRaw = scoreData?.team1Score?.inngs1;
          const t2ScoreRaw = scoreData?.team2Score?.inngs1;
          const t1s = extractScore(t1ScoreRaw);
          const t2s = extractScore(t2ScoreRaw);

          // Determine who is currently batting
          // If team2 has innings data, they are batting (2nd innings)
          const currentInnings = t2s ? 2 : 1;
          const battingScore = t2s ?? t1s;
          const batting = currentInnings === 2 ? t2 : t1;
          const bowling = currentInnings === 2 ? t1 : t2;

          const scoreStr = battingScore
            ? `${battingScore.runs}/${battingScore.wickets}`
            : "Yet to bat";
          const oversStr = battingScore
            ? String(battingScore.overs)
            : "0";

          // First innings total for target calculation
          const firstInnTotal = t1s ? t1s.runs : 0;
          const target = currentInnings === 2 ? firstInnTotal + 1 : null;

          allMatches.push({
            matchId: info?.matchId,
            matchDesc: info?.matchDesc ?? info?.matchDescription ?? "",
            seriesName,
            venue: info?.venueInfo?.ground ?? info?.venueInfo?.city ?? "Unknown",
            state,
            statusText: info?.status ?? state,
            currentInnings,
            team1: {
              id: t1?.teamId,
              name: t1?.teamName ?? t1?.name ?? "",
              shortName: t1?.teamSName ?? t1?.shortName ?? "",
              scoreStr: t1s ? `${t1s.runs}/${t1s.wickets}` : "Yet to bat",
              overs: t1s ? String(t1s.overs) : "0",
            },
            team2: {
              id: t2?.teamId,
              name: t2?.teamName ?? t2?.name ?? "",
              shortName: t2?.teamSName ?? t2?.shortName ?? "",
              scoreStr: t2s ? `${t2s.runs}/${t2s.wickets}` : "Yet to bat",
              overs: t2s ? String(t2s.overs) : "0",
            },
            // Easy-access fields for dashboard form auto-fill
            currentScore: scoreStr,
            currentOvers: oversStr,
            target,
            wicketsLeft: battingScore ? 10 - battingScore.wickets : 10,
            battingTeam: batting?.teamSName ?? batting?.shortName ?? "",
            bowlingTeam: bowling?.teamSName ?? bowling?.shortName ?? "",
          });
        }
      }
    }

    return NextResponse.json({
      matches: allMatches,
      total: allMatches.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[live-matches]", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
