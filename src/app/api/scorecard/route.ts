import { NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com";

function rapidFetch(path: string) {
  return fetch(`https://${RAPIDAPI_HOST}${path}`, {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
    next: { revalidate: 15 },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");

  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });
  if (!RAPIDAPI_KEY) return NextResponse.json({ error: "RAPIDAPI_KEY not set" }, { status: 500 });

  try {
    // Fetch live scorecard
    const [scoreRes, infoRes] = await Promise.all([
      rapidFetch(`/mcenter/v1/${matchId}/hscard`),
      rapidFetch(`/mcenter/v1/${matchId}`),
    ]);

    if (!scoreRes.ok) {
      return NextResponse.json({ error: `Scorecard API ${scoreRes.status}` }, { status: scoreRes.status });
    }

    const scoreData = await scoreRes.json();
    const infoData = infoRes.ok ? await infoRes.json() : null;

    const scorecard: any[] = scoreData?.scorecard ?? [];
    if (!scorecard.length) {
      return NextResponse.json({ error: "No scorecard data yet" }, { status: 404 });
    }

    // Get the latest innings (last in array)
    const latestInnings = scorecard[scorecard.length - 1];
    const previousInnings = scorecard.length > 1 ? scorecard[0] : null;

    // Extract batsmen (currently at crease = not out or batting)
    const batsmen: any[] = latestInnings.batsman ?? [];
    const atCrease = batsmen.filter((b: any) => !b.outdec || b.outdec.trim() === "" || b.outdec.toLowerCase() === "batting");

    // Extract bowlers
    const bowlers: any[] = latestInnings.bowler ?? [];
    const currentBowler = bowlers.length > 0 ? bowlers[bowlers.length - 1] : null;

    // Extract totals from root of innings object
    const runs: number = latestInnings.score ?? 0;
    const wickets: number = latestInnings.wickets ?? 0;
    const overs: string = String(latestInnings.overs ?? "0");

    // First innings total for target
    const firstInningsRuns: number = previousInnings?.score ?? 0;
    const target = scorecard.length > 1 ? firstInningsRuns + 1 : null;

    // Match info
    const matchHeader = infoData?.matchHeader ?? {};
    const venue = matchHeader?.venue?.name ?? matchHeader?.seriesName ?? "Unknown";
    const team1 = matchHeader?.team1 ?? {};
    const team2 = matchHeader?.team2 ?? {};
    const matchDesc = matchHeader?.matchDescription ?? "";
    const status = matchHeader?.status ?? "";

    return NextResponse.json({
      matchId,
      currentInnings: scorecard.length,
      score: `${runs}/${wickets}`,
      overs: String(overs),
      target,
      wicketsLeft: 10 - wickets,
      striker: atCrease[0]?.name ?? "",
      nonStriker: atCrease[1]?.name ?? "",
      currentBowler: currentBowler?.name ?? "",
      bowlers: bowlers.map((b: any) => ({
        name: b.name,
        overs: b.overs ?? "0",
        wickets: b.wickets ?? 0,
        runs: b.runs ?? 0,
        economy: b.economy ?? "0",
      })),
      venue,
      team1: team1?.name ?? team1?.teamName ?? "",
      team2: team2?.name ?? team2?.teamName ?? "",
      matchDesc,
      status,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[scorecard]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
