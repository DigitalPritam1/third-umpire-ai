"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Home, LayoutDashboard, MessageSquare, History, TrendingUp, Users, CloudRain, Settings, 
  Mic, Sun, ChevronDown, CheckCircle2, AlertTriangle, LineChart, Target, Star, Volume2, VolumeX,
  Wind, Droplets, CloudSun, BarChart2, Shield, Crown, Zap, Activity, Loader2, RefreshCw
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const DEMO_SCENARIOS = [
  {
    id: "bumrah_death",
    label: "💥 MI Death Overs",
    desc: "162/4 in 16.2, need 19 off 22",
    state: { innings:"2nd", over:"16", ball:"2", score:"162/4", wickets:"6", target:"181", striker:"Hardik Pandya", nonStriker:"Suryakumar Yadav", venue:"Wankhede", pitch:"Two-paced" }
  },
  {
    id: "csk_powerplay",
    label: "🏏 CSK Powerplay Crisis",
    desc: "30/3 in 6 overs, top order gone",
    state: { innings:"1st", over:"6", ball:"0", score:"30/3", wickets:"7", target:"0", striker:"Ravindra Jadeja", nonStriker:"MS Dhoni", venue:"Chepauk", pitch:"Turning" }
  },
  {
    id: "rcb_chase",
    label: "🔥 RCB Chase",
    desc: "Target 210, 80 off 30 balls",
    state: { innings:"2nd", over:"15", ball:"0", score:"130/2", wickets:"8", target:"210", striker:"Virat Kohli", nonStriker:"Phil Salt", venue:"Chinnaswamy", pitch:"Flat" }
  },
  {
    id: "mi_middle",
    label: "⚡ DC Middle Overs",
    desc: "110/1 in 12, building platform",
    state: { innings:"1st", over:"12", ball:"0", score:"110/1", wickets:"9", target:"0", striker:"KL Rahul", nonStriker:"Jake Fraser-McGurk", venue:"Arun Jaitley", pitch:"Flat" }
  },
];

// ── NO MOCK DATA ON MOUNT. All state is initialised empty and filled from live Cricbuzz API ──



// Generate a win probability curve for a chasing team over 20 overs
function generateWinProbabilityCurve(currentOver: number, currentScore: number, targetRuns: number, wicketsInHand: number): number[] {
  const points: number[] = [];
  const totalOvers = 20;

  for (let ov = 0; ov <= totalOvers; ov++) {
    if (ov > currentOver) {
      points.push(-1); // future — not plotted
      continue;
    }
    // Estimate score at this over (linear projection)
    const estScore = ov === 0 ? 0 : Math.round((currentScore / currentOver) * ov);
    const ballsLeft = (totalOvers - ov) * 6;
    const runsLeft = targetRuns - estScore;
    const estWickets = Math.max(0, Math.round(wicketsInHand * (ov / currentOver)));

    if (ballsLeft <= 0) { points.push(runsLeft <= 0 ? 100 : 0); continue; }
    if (runsLeft <= 0) { points.push(100); continue; }

    const rrr = runsLeft / (ballsLeft / 6);
    let prob = 50;
    if (rrr > 14) prob -= 40;
    else if (rrr > 12) prob -= 28;
    else if (rrr > 10) prob -= 15;
    else if (rrr > 9) prob -= 8;
    else if (rrr < 7) prob += 20;
    else if (rrr < 6) prob += 35;
    prob += (estWickets - 4) * 4;
    points.push(Math.min(Math.max(prob, 2), 98));
  }
  return points;
}

// Convert probability array to SVG path string (viewBox 0 0 100 100)
function toSvgPath(points: number[], totalPoints: number): string {
  const validPoints = points.filter(p => p >= 0);
  if (validPoints.length === 0) return "";
  return validPoints.map((p, i) => {
    const x = (i / (totalPoints)) * 100;
    const y = 100 - p; // invert: higher prob = lower y
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}


export default function Dashboard() {
  const [impactPlayer, setImpactPlayer] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [bulletinImage, setBulletinImage] = useState<string | null>(null);
  const [isBulletinLoading, setIsBulletinLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // ── Live Match State (all blank until filled from Cricbuzz API) ──────────
  const [liveMatchId, setLiveMatchId] = useState<string | null>(null);
  const [liveMatchLabel, setLiveMatchLabel] = useState("");
  const [liveBowlers, setLiveBowlers] = useState<any[]>([]);
  const [isLiveDataLoading, setIsLiveDataLoading] = useState(false);
  const [liveDataError, setLiveDataError] = useState("");

  // Form state — starts blank, filled from Cricbuzz scorecard
  const [innings, setInnings] = useState("");
  const [over, setOver] = useState("");
  const [ball, setBall] = useState("0");
  const [score, setScore] = useState("");
  const [wickets, setWickets] = useState("");
  const [target, setTarget] = useState("");
  const [striker, setStriker] = useState("");
  const [nonStriker, setNonStriker] = useState("");
  const [venue, setVenue] = useState("");
  const [pitch, setPitch] = useState("Flat");

  function mapVenueName(apiVenue: string): string {
    if (!apiVenue) return "Wankhede";
    const v = apiVenue.toLowerCase();
    if (v.includes("wankhede")) return "Wankhede";
    if (v.includes("chepauk") || v.includes("chidambaram")) return "Chepauk";
    if (v.includes("chinnaswamy")) return "Chinnaswamy";
    if (v.includes("eden")) return "Eden Gardens";
    if (v.includes("narendra modi") || v.includes("motera")) return "Narendra Modi";
    if (v.includes("arun jaitley") || v.includes("kotla")) return "Arun Jaitley";
    if (v.includes("rajiv gandhi") || v.includes("uppal")) return "Rajiv Gandhi";
    if (v.includes("ekana")) return "BRSABV Ekana";
    if (v.includes("sawai mansingh")) return "Sawai Mansingh";
    if (v.includes("punjab") || v.includes("himachal") || v.includes("dharamsala") || v.includes("mullanpur")) return "Punjab Cricket";
    return "Wankhede";
  }


  // ── Auto-fetch live IPL match on page load ───────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setIsLiveDataLoading(true);
        const res = await fetch("/api/live-matches");
        if (!res.ok) return;
        const data = await res.json();
        const iplMatch = (data.matches ?? []).find(
          (m: any) => m.seriesName?.toLowerCase().includes("ipl") || m.seriesName?.toLowerCase().includes("indian premier")
        ) ?? data.matches?.[0];
        if (iplMatch?.matchId) {
          await loadScorecardForMatch(iplMatch.matchId, iplMatch.team1.shortName + " vs " + iplMatch.team2.shortName, iplMatch.venue);
        }
      } catch { /* silent */ } finally {
        setIsLiveDataLoading(false);
      }
    })();
  }, []);

  // ── Fetch full scorecard and populate all form fields ────────────────────
  const loadScorecardForMatch = async (matchId: string, label: string, fallbackVenue?: string) => {
    setIsLiveDataLoading(true);
    setLiveDataError("");
    setLiveMatchId(matchId);
    setLiveMatchLabel(label);
    try {
      const res = await fetch(`/api/scorecard?matchId=${matchId}`);
      const d = await res.json();
      if (!res.ok || d.error) { setLiveDataError(d.error); return; }

      setScore(d.score ?? "");
      const overNum = String(Math.floor(parseFloat(d.overs) || 0));
      const ballNum = String(Math.round((parseFloat(d.overs) % 1) * 10) || 0);
      setOver(overNum);
      setBall(ballNum);
      setInnings(d.currentInnings === 2 ? "2nd" : "1st");
      if (d.target) setTarget(String(d.target));
      setWickets(String(d.wicketsLeft ?? ""));
      if (d.striker)    setStriker(d.striker);
      if (d.nonStriker) setNonStriker(d.nonStriker);
      
      const venueStr = (d.venue && d.venue !== "Unknown") ? d.venue : fallbackVenue;
      setVenue(mapVenueName(venueStr || ""));
      
      if (d.bowlers?.length) setLiveBowlers(d.bowlers);
    } catch (e: any) {
      setLiveDataError(e.message);
    } finally {
      setIsLiveDataLoading(false);
    }
  };

  const refreshLiveData = () => {
    if (liveMatchId) loadScorecardForMatch(liveMatchId, liveMatchLabel);
  };

  const STREAMING_AGENTS = [
    { label: "📊 Stats Analyst", delay: 0 },
    { label: "🧠 Tactical Strategist", delay: 2000 },
    { label: "😈 Devil's Advocate", delay: 4000 },
    { label: "🎙️ Match Commentator", delay: 6000 },
    { label: "⭐ Decision Synthesizer", delay: 8000 },
  ];

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null); // clear stale result immediately
    setAnalysisLogs([]);


    // Stream fake logs while API processes
    const logMessages = [
      { agent: "Stats Analyst", color: "bg-indigo-600", icon: "chart", time: new Date().toLocaleTimeString(), text: `Analyzing: ${score} in ${over}.${ball} overs at ${venue}. Pitch: ${pitch}.` },
      { agent: "Stats Analyst", color: "bg-indigo-600", icon: "chart", time: new Date().toLocaleTimeString(), text: "Running venue analysis tool... Calculating win probability..." },
      { agent: "Tactical Strategist", color: "bg-purple-600", icon: "target", time: new Date().toLocaleTimeString(), text: "Reviewing stats report. Formulating primary tactical plan..." },
      { agent: "Devil's Advocate", color: "bg-rose-600", icon: "alert", time: new Date().toLocaleTimeString(), text: "Challenging the proposed strategy. Identifying risks and alternatives..." },
      { agent: "Match Commentator", color: "bg-emerald-600", icon: "mic", time: new Date().toLocaleTimeString(), text: "Translating decision into natural cricket commentary..." },
      { agent: "Decision Synthesizer", color: "bg-amber-500", icon: "star", time: new Date().toLocaleTimeString(), text: "Synthesizing all agent outputs into final JSON payload...", isLast: true },
    ];

    // Stream logs with delays
    logMessages.forEach((log, i) => {
      setTimeout(() => setAnalysisLogs(prev => [...prev, log]), i * 1800);
    });

    try {
      const oversBowled = parseFloat(`${over}.${ball}`);
      const ballsRemaining = Math.round((20 - oversBowled) * 6);
      const wicketsInHand = parseInt(wickets);
      const targetRuns = parseInt(target);
      const [runs] = score.split('/').map(Number);
      const runsRequired = targetRuns - runs;

      const payload = {
        innings: innings === "2nd" ? 2 : 1,
        matchPhase: parseFloat(over) <= 6 ? "Powerplay" : parseFloat(over) <= 15 ? "Middle Overs" : "Death Overs",
        battingTeam: "CSK", bowlingTeam: "MI",
        currentScore: { runs, wickets: 10 - wicketsInHand, oversBowled },
        targetRuns, pitchConditions: pitch, dewFactor: true, venue,
        striker, nonStriker, availableBowlers: [], impactPlayerAvailable: impactPlayer,
      };

      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("[API Response]:", data);
        if (data?.tacticalDecision) {
          setTimeout(() => {
            setResult(data);
            saveToHistory(data, { score, over, venue, innings });
            generateBulletin(data, { score, over, venue });
          }, logMessages.length * 1800);

        } else {
          console.error("[API] Unexpected response shape:", data);
          showVoiceToast("⚠️ API returned unexpected data. Check console.");
        }
      } else {
        const errText = await res.text();
        console.error("[API Error]:", res.status, errText);
        showVoiceToast(`❌ API Error ${res.status} — check server console`);
      }
    } catch (e) {
      console.error("Analysis failed:", e);
      showVoiceToast("❌ Network error — is the server running?");
    } finally {
      setTimeout(() => setIsAnalyzing(false), logMessages.length * 1800 + 500);
    }
  };

  const loadScenario = (s: typeof DEMO_SCENARIOS[0]) => {
    setInnings(s.state.innings);
    setOver(s.state.over);
    setBall(s.state.ball);
    setScore(s.state.score);
    setWickets(s.state.wickets);
    setTarget(s.state.target);
    setStriker(s.state.striker);
    setNonStriker(s.state.nonStriker);
    setVenue(s.state.venue);
    setPitch(s.state.pitch);
    setAnalysisLogs([]);
  };

  // ── IMAGEN — Generate tactical bulletin artwork ───────────────────────────
  const generateBulletin = async (data: any, ctx: { score: string; over: string; venue: string }) => {
    setBulletinImage(null);
    setIsBulletinLoading(true);
    try {
      const res = await fetch("/api/generate-bulletin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: data.tacticalDecision,
          venue: ctx.venue,
          score: ctx.score,
          over: ctx.over,
          confidence: data.confidenceScore,
          winDelta: data.winProbabilityDelta,
          commentaryLine: data.commentaryExplanation,
        }),
      });
      const imgData = await res.json();
      if (imgData.imageUrl) setBulletinImage(imgData.imageUrl);
    } catch (e) {
      console.warn("[Imagen] Failed:", e);
    } finally {
      setIsBulletinLoading(false);
    }
  };

  // ── GEMINI TTS — Speak the commentary line ───────────────────────────────
  const speakCommentary = async (text: string) => {
    if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) { setIsSpeaking(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.play();
    } catch (e) {
      console.warn("[TTS] Failed:", e);
      setIsSpeaking(false);
    }
  };

  const [activeScenario, setActiveScenario] = useState("bumrah_death");

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [tacticHistory, setTacticHistory] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("captain_cool_history") || "[]"); }
    catch { return []; }
  });

  const saveToHistory = (data: any, ctx: { score: string; over: string; venue: string; innings: string }) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString("en-IN"),
      score: ctx.score,
      over: ctx.over,
      venue: ctx.venue,
      innings: ctx.innings,
      decision: data?.tacticalDecision || "Unknown",
      confidence: data?.confidenceScore || 0,
      winDelta: data?.winProbabilityDelta || "N/A",
    };
    const updated = [entry, ...tacticHistory].slice(0, 20);
    setTacticHistory(updated);
    if (typeof window !== "undefined") localStorage.setItem("captain_cool_history", JSON.stringify(updated));
  };

  // ── LIVE CRICBUZZ MATCH STATE ────────────────────────────────────────────────
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [liveFetchState, setLiveFetchState] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [liveError, setLiveError] = useState("");

  const fetchLiveMatches = async () => {
    setLiveFetchState("loading");
    setLiveError("");
    try {
      const res = await fetch("/api/live-matches");
      const data = await res.json();
      if (!res.ok || data.error) {
        setLiveError(data.error || `HTTP ${res.status}`);
        setLiveFetchState("error");
      } else {
        setLiveMatches(data.matches || []);
        setLiveFetchState("done");
      }
    } catch (e: any) {
      setLiveError(e.message);
      setLiveFetchState("error");
    }
  };

  const loadLiveMatch = async (m: any) => {
    setIsLiveOpen(false);
    const label = `${m.team1.shortName} vs ${m.team2.shortName}`;
    showVoiceToast(`⏳ Loading live scorecard: ${label}…`);
    await loadScorecardForMatch(String(m.matchId), label, m.venue);
    showVoiceToast(`✅ Loaded: ${label} — ${m.statusText}`);
  };


  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceToast, setVoiceToast] = useState<string | null>(null);


  const showVoiceToast = (msg: string) => {
    setVoiceToast(msg);
    setTimeout(() => setVoiceToast(null), 3500);
  };

  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showVoiceToast("Voice input not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) { setIsListening(false); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setVoiceTranscript("");
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setVoiceTranscript(transcript);

      // Parse score — e.g. "score is 145 for 3" or "145 slash 3"
      const scoreMatch = transcript.match(/(\d+)\s*(?:for|slash|\/)\s*(\d+)/);
      if (scoreMatch) {
        setScore(`${scoreMatch[1]}/${scoreMatch[2]}`);
        setWickets(String(10 - parseInt(scoreMatch[2])));
      }

      // Parse over — e.g. "over 16" or "16th over"
      const overMatch = transcript.match(/(?:over|overs?)\s+(\d+)|(?:(\d+))(?:th|st|nd|rd)?\s+over/);
      if (overMatch) setOver(overMatch[1] || overMatch[2]);

      // Parse target — e.g. "target 185" or "chasing 185"
      const targetMatch = transcript.match(/(?:target|chasing|chase)\s+(\d+)/);
      if (targetMatch) { setTarget(targetMatch[1]); setInnings("2nd"); }

      // Parse venue keywords
      if (transcript.includes("wankhede") || transcript.includes("mumbai"))    setVenue("Wankhede");
      if (transcript.includes("chepauk") || transcript.includes("chennai"))    setVenue("Chepauk");
      if (transcript.includes("chinnaswamy") || transcript.includes("bangalore")) setVenue("Chinnaswamy");
      if (transcript.includes("eden") || transcript.includes("kolkata"))        setVenue("Eden Gardens");
      if (transcript.includes("ahmedabad") || transcript.includes("narendra"))  setVenue("Narendra Modi");

      // Parse pitch
      if (transcript.includes("turning") || transcript.includes("spin"))  setPitch("Turning");
      if (transcript.includes("flat") || transcript.includes("batting"))  setPitch("Flat");
      if (transcript.includes("seam") || transcript.includes("green"))    setPitch("Green/Seaming");

      // Parse innings
      if (transcript.includes("first innings") || transcript.includes("1st innings"))  setInnings("1st");
      if (transcript.includes("second innings") || transcript.includes("2nd innings")) setInnings("2nd");

      showVoiceToast(`✅ Parsed: "${transcript}"`);
      setIsListening(false);
    };

    recognition.onerror = () => {
      showVoiceToast("Couldn't hear you. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
  };

  const currentOverNum = parseFloat(`${over}.${ball}`);
  const currentScoreNum = parseInt(score.split('/')[0]) || 0;
  const targetNum = parseInt(target) || 181;
  const wicketsInHandNum = parseInt(wickets) || 6;

  // Derived match calculations
  const wicketsFallen = 10 - wicketsInHandNum;
  const ballsRemaining = Math.max(0, Math.round((20 - currentOverNum) * 6));
  const runsRequired = Math.max(0, targetNum - currentScoreNum);
  const rrr = ballsRemaining > 0 ? (runsRequired / (ballsRemaining / 6)) : 0;
  const matchPhase = currentOverNum <= 6 ? "Powerplay" : currentOverNum <= 15 ? "Middle Overs" : "Death Overs";

  // Venue-based conditions
  const VENUE_CONDITIONS: Record<string, { dew: string; weather: string; avgScore: number; pitchDetail: string }> = {
    "Wankhede":      { dew: "High",     weather: "26°C, Humid",   avgScore: 185, pitchDetail: "Flat/Pacey" },
    "Chepauk":       { dew: "Low",      weather: "32°C, Hot",     avgScore: 165, pitchDetail: "Turning" },
    "Chinnaswamy":   { dew: "Moderate", weather: "24°C, Pleasant",avgScore: 195, pitchDetail: "Flat/High" },
    "Eden Gardens":  { dew: "High",     weather: "28°C, Humid",   avgScore: 175, pitchDetail: "Balanced" },
    "Narendra Modi": { dew: "Moderate", weather: "33°C, Dry",     avgScore: 180, pitchDetail: "Pace/Bounce" },
  };
  const venueInfo = VENUE_CONDITIONS[venue] || { dew: "Moderate", weather: "28°C", avgScore: 170, pitchDetail: pitch };

  // Batting/Bowling team derived from innings
  const battingTeam  = innings === "1st" ? "CSK" : "CSK";
  const bowlingTeam  = innings === "1st" ? "MI"  : "MI";
  const battingColor = "text-yellow-400";
  const bowlingColor = "text-indigo-400";


  // Dynamic win probability curves
  const cskCurve = useMemo(() => generateWinProbabilityCurve(currentOverNum, currentScoreNum, targetNum, wicketsInHandNum), [currentOverNum, currentScoreNum, targetNum, wicketsInHandNum]);
  const miCurve = useMemo(() => cskCurve.map(p => p < 0 ? -1 : 100 - p), [cskCurve]);

  const cskPath = useMemo(() => toSvgPath(cskCurve, 20), [cskCurve]);
  const miPath = useMemo(() => toSvgPath(miCurve, 20), [miCurve]);

  const currentCSKProb = cskCurve[Math.floor(currentOverNum)] ?? 50;
  const currentMIProb = 100 - currentCSKProb;
  const markerX = (currentOverNum / 20) * 100;
  const markerY = 100 - currentCSKProb;

  return (
    <div className="min-h-screen bg-transparent text-white/90 font-sans flex flex-col selection:bg-indigo-500/30">
      
      {/* TOP NAVBAR */}
            {/* Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-[20%] right-[-20%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="relative z-10 h-16 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl border-white/5 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-2 border-white/10">
            <Shield className="w-5 h-5 text-slate-900 fill-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gradient leading-tight">CAPTAIN COOL AI</h1>
            <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Your AI IPL Strategist</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">AI STRATEGY MODE</span>
          <span className="text-xs text-white/40 ml-2">Powered by</span>
          {/* Google Gemini Logo */}
          <svg className="h-4 w-auto" viewBox="0 0 28 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="10" fontSize="10" fontWeight="700" fill="#4285F4">G</text>
            <text x="6" y="10" fontSize="10" fontWeight="700" fill="#EA4335">e</text>
            <text x="11" y="10" fontSize="10" fontWeight="700" fill="#FBBC05">m</text>
            <text x="18" y="10" fontSize="10" fontWeight="700" fill="#4285F4">i</text>
            <text x="21" y="10" fontSize="10" fontWeight="700" fill="#34A853">n</text>
            <text x="26" y="10" fontSize="10" fontWeight="700" fill="#EA4335">i</text>
          </svg>
          <span className="text-xs text-indigo-400 font-bold">2.5</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Matches */}
          <button
            onClick={() => { setIsLiveOpen(true); if (liveFetchState === "idle") fetchLiveMatches(); }}
            className="flex items-center gap-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 hover:border-rose-500/60 transition-all px-4 py-2 rounded-full text-sm font-medium text-rose-300"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Live Matches
          </button>

          {/* Voice Input */}
          <button
            onClick={handleVoiceInput}
            className={`flex items-center gap-2 transition-all border px-4 py-2 rounded-full text-sm font-medium ${
              isListening
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse shadow-lg shadow-rose-500/20'
                : 'bg-white/[0.03] hover:bg-[#1E293B] border-white/10'
            }`}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'text-rose-400' : 'text-purple-400'}`} />
            <span>{isListening ? "Listening..." : "Voice Input"}</span>
          </button>
          <button className="p-2 text-white/60 hover:text-white transition-colors">
            <Sun className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 pl-4 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center overflow-hidden border border-slate-700">
               <span className="text-xs font-bold text-black">CSK</span>
            </div>
            <span className="text-sm font-medium">IPL Fan</span>
            <ChevronDown className="w-4 h-4 text-white/40" />
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-white/[0.02] backdrop-blur-xl border-white/5 border-r border-white/10 flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar">
          <nav className="p-4 space-y-1.5">
            <NavItem icon={<Home />} label="Match Strategist" active onClick={() => document.getElementById("match-strategist")?.scrollIntoView({ behavior: "smooth" })} />
            <NavItem icon={<LayoutDashboard />} label="Live Dashboard" onClick={() => { setIsLiveOpen(true); if (liveFetchState === "idle") fetchLiveMatches(); }} />
            <NavItem icon={<MessageSquare />} label="Agent Debate" onClick={() => document.getElementById("agent-debate")?.scrollIntoView({ behavior: "smooth" })} />
            <NavItem icon={<History />} label="Tactical History" onClick={() => setIsHistoryOpen(true)} count={tacticHistory.length} />
            <NavItem icon={<TrendingUp />} label="Win Probability" onClick={() => document.getElementById("win-probability")?.scrollIntoView({ behavior: "smooth" })} />
            <NavItem icon={<Users />} label="Player Matchups" onClick={() => document.getElementById("player-matchups")?.scrollIntoView({ behavior: "smooth" })} />
            <NavItem icon={<CloudRain />} label="Pitch & Conditions" onClick={() => document.getElementById("pitch-conditions")?.scrollIntoView({ behavior: "smooth" })} />
            <NavItem icon={<Settings />} label="Settings" onClick={() => showVoiceToast("Settings panel coming soon")} />
          </nav>

          <div className="p-4">
            <div className="bg-gradient-to-b from-[#1E1B4B] to-[#0F172A] border border-indigo-500/30 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <Shield className="w-16 h-16 text-indigo-400 fill-indigo-400" />
              </div>
              <Star className="w-5 h-5 text-amber-400 mb-2 fill-amber-400" />
              <h3 className="text-sm font-bold text-white mb-1">CAPTAIN MODE</h3>
              <p className="text-xs text-indigo-200/70 mb-4">Think like Dhoni.<br/>Decide like a Legend.</p>
              <div className="w-full h-24 bg-indigo-900/40 rounded-lg border border-indigo-500/20 overflow-hidden relative">
                 {/* Fake Dhoni Silhouette */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 bg-yellow-500/80 rounded-t-full blur-[2px]" />
                 <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0F172A] to-transparent" />
              </div>
            </div>

            <div className="mt-4 glass-card border-gradient before:rounded-3xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase">Impact Player</p>
                  <p className="text-xs font-bold text-fuchsia-400">Available</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main id="match-strategist" className="animate-fadeSlideIn flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar">

          {/* DEMO MODE SCENARIO PICKER */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" /> Demo Mode
            </span>
            <div className="flex gap-2 flex-wrap">
              {DEMO_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { loadScenario(s); setActiveScenario(s.id); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeScenario === s.id
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800/50 border-white/10 text-white/60 hover:text-white/90 hover:border-slate-600'
                  }`}
                >
                  {s.label}
                  <span className="text-[10px] opacity-60">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-5">
            {/* Dynamic Scorecard */}
            <div className="flex-1 glass-card border-gradient before:rounded-3xl flex items-stretch overflow-hidden">
              {/* Batting Team Side */}
              <div className="flex-1 p-5 flex items-center gap-4 bg-gradient-to-r from-yellow-500/5 to-transparent">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                  <span className={`text-xl font-black ${battingColor}`}>{battingTeam}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{battingTeam === "CSK" ? "Chennai Super Kings" : "Mumbai Indians"}</p>
                  <h2 className={`text-4xl font-black ${battingColor} transition-all duration-300`}>{score}</h2>
                  <p className="text-sm text-white/60 mt-1">
                    Overs {over}.{ball} <span className="text-white/40">(20)</span>
                    <span className={`ml-3 text-xs font-bold px-2 py-0.5 rounded-full ${
                      matchPhase === 'Powerplay' ? 'bg-indigo-500/20 text-indigo-400' :
                      matchPhase === 'Death Overs' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>{matchPhase}</span>
                  </p>
                </div>
              </div>

              {/* Center Context */}
              <div className="px-8 py-5 flex flex-col items-center justify-center border-x border-white/10 relative">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                <p className="text-xs font-bold text-white/60 tracking-widest mb-1">TATA IPL {new Date().getFullYear()}</p>
                <p className="text-xs text-white/40 mb-3 text-center whitespace-nowrap">{venue} Stadium</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-fuchsia-400 text-xs font-bold border border-emerald-500/20">
                    {innings} Innings
                  </span>
                </div>
                {innings === "2nd" && runsRequired > 0 && (
                  <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Need</p>
                    <p className="text-lg font-black text-white">{runsRequired} off {ballsRemaining}b</p>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-400 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </div>
              </div>

              {/* Bowling Team Side */}
              <div className="flex-1 p-5 flex flex-col items-end justify-center bg-gradient-to-l from-blue-500/5 to-transparent">
                <div className="flex items-center gap-4 text-right mb-2">
                  <div>
                    <p className="text-sm font-medium text-white/80">{bowlingTeam === "MI" ? "Mumbai Indians" : "Chennai Super Kings"}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className={`text-sm font-black ${bowlingColor}`}>{bowlingTeam}</span>
                  </div>
                </div>
                <div className="text-right">
                  {innings === "2nd" ? (
                    <>
                      <p className={`text-2xl font-black ${bowlingColor}`}>Target {targetNum}</p>
                      <p className="text-sm font-bold mt-1">
                        <span className={`${rrr > 12 ? 'text-rose-400' : rrr > 9 ? 'text-amber-400' : 'text-fuchsia-400'}`}>
                          RRR {rrr.toFixed(2)}
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={`text-2xl font-black ${bowlingColor}`}>Bowling</p>
                      <p className="text-sm font-bold text-white/60 mt-1">{wicketsInHandNum} wkts left</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Match Conditions */}
            <div id="pitch-conditions" className="w-[300px] glass-card border-gradient before:rounded-3xl p-5">
              <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-4">Match Conditions</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <ConditionItem icon={<Wind />} label="Pitch" value={pitch} />
                <ConditionItem
                  icon={<Droplets />}
                  label="Dew Factor"
                  value={venueInfo.dew}
                  highlight={venueInfo.dew === "High"}
                />
                <ConditionItem icon={<CloudSun />} label="Weather" value={venueInfo.weather} />
                <ConditionItem icon={<BarChart2 />} label="Avg 1st Inn Score" value={String(venueInfo.avgScore)} />
              </div>
            </div>
          </div>

          {/* MIDDLE ROW: INPUT -> DEBATE -> DECISION */}
          <div className="grid grid-cols-12 gap-5 items-stretch">
            
            {/* COLUMN 1: INPUT */}
            <div id="player-matchups" className="col-span-3 glass-card border-gradient before:rounded-3xl p-5 flex flex-col">
              <div className="flex justify-between items-start mb-5 flex-col gap-2">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Match Situation</h3>
                  <button onClick={handleAnalyze} disabled={isAnalyzing}
                    className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-fuchsia-500/20 border-gradient before:rounded-full">
                    {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    {isAnalyzing ? "Analyzing..." : "Analyze ⚡"}
                  </button>
                </div>
                {liveMatchId ? (
                  <div className="flex items-center gap-2 bg-indigo-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-[10px] font-medium text-fuchsia-400 truncate">{liveMatchLabel} (Live Data)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-800/50 border border-white/10 px-2 py-1 rounded-lg w-full">
                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="text-[10px] font-medium text-amber-500 truncate">No live match loaded</span>
                  </div>
                )}
              </div>


              <div className="space-y-3 flex-1 overflow-y-auto pr-1">

                {/* Row 1: Innings / Over / Ball */}
                <div className="grid grid-cols-3 gap-2">
                  <FormSelect label="Innings" value={innings} onChange={setInnings} options={["1st","2nd"]} />
                  <FormSelect label="Over" value={over} onChange={setOver}
                    options={Array.from({length:20},(_,i)=>String(i+1))} />
                  <FormSelect label="Ball" value={ball} onChange={setBall}
                    options={["0","1","2","3","4","5"]} />
                </div>

                {/* Row 2: Score / Wickets / Target */}
                <div className="grid grid-cols-3 gap-2">
                  <FormInput label="Score" value={score} onChange={setScore} placeholder="162/4" />
                  <FormInput label="Wickets Left" value={wickets} onChange={setWickets} placeholder="6" type="number" />
                  <FormInput label="Target" value={target} onChange={setTarget} placeholder="181" type="number" />
                </div>

                {/* Row 3: Venue / Pitch */}
                <div className="grid grid-cols-2 gap-2">
                  <FormSelect label="Venue" value={venue} onChange={setVenue}
                    options={["Wankhede","Chepauk","Chinnaswamy","Eden Gardens","Narendra Modi","Arun Jaitley","Rajiv Gandhi","BRSABV Ekana","Sawai Mansingh","Punjab Cricket"]} />

                  <FormSelect label="Pitch" value={pitch} onChange={setPitch}
                    options={["Flat","Two-paced","Turning","Green/Seaming","Pace/Bounce"]} />
                </div>

                {/* Row 4: Striker / Non-Striker */}
                <div className="grid grid-cols-2 gap-2">
                  <FormInput label="Striker" value={striker} onChange={setStriker} placeholder="Hardik Pandya" />
                  <FormInput label="Non-Striker" value={nonStriker} onChange={setNonStriker} placeholder="Tim David" />
                </div>

                {/* Bowlers Remaining — from live Cricbuzz scorecard */}
                <div>
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Bowlers {liveBowlers.length > 0 ? "(Live ✓)" : ""}</p>
                    {liveMatchId && (
                      <button onClick={refreshLiveData} disabled={isLiveDataLoading}
                        className="flex items-center gap-1 text-[9px] text-indigo-400 hover:text-blue-300 disabled:opacity-40 transition-colors">
                        <RefreshCw className={`w-2.5 h-2.5 ${isLiveDataLoading ? "animate-spin" : ""}`} />
                        Refresh
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isLiveDataLoading && <span className="text-[10px] text-white/40 animate-pulse">Loading live data…</span>}
                    {!isLiveDataLoading && liveBowlers.length > 0
                      ? liveBowlers.map((b: any, i: number) => (
                          <BowlerBadge key={i} name={b.name} overs={b.overs} active={i === liveBowlers.length - 1} />
                        ))
                      : !isLiveDataLoading && (
                          <span className="text-[10px] text-slate-600 italic">
                            {liveMatchId ? "No bowler data yet" : "Click 🔴 Live Matches to load real data"}
                          </span>
                        )
                    }
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/80">Impact Player Available?</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60 font-medium">{impactPlayer ? "Yes" : "No"}</span>
                  <Switch checked={impactPlayer} onCheckedChange={setImpactPlayer} className="data-[state=checked]:bg-emerald-500" />
                </div>
              </div>
            </div>


            {/* COLUMN 2: DEBATE TIMELINE - LIVE */}
            <div id="agent-debate" className="col-span-4 glass-card border-gradient before:rounded-3xl p-5 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Agent Debate Timeline</h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin text-indigo-400 mr-1" />}
                  <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-blue-400' : 'bg-rose-500'} animate-pulse`} />
                  {isAnalyzing ? <span className="text-indigo-400">Processing</span> : "Live"}
                </div>
              </div>

              <div className="relative flex-1 pl-4 overflow-y-auto max-h-[380px] pr-1">
                <div className="absolute top-0 bottom-0 left-[27px] w-px border-l-2 border-dashed border-white/10" />
                <div className="space-y-5">
                  {analysisLogs.map((log: any, i: number) => (
                    <TimelineItem
                      key={i}
                      icon={log.icon === "chart" ? <LineChart /> : log.icon === "target" ? <Target /> : log.icon === "alert" ? <AlertTriangle /> : log.icon === "mic" ? <Mic /> : <Star />}
                      color={log.color}
                      title={log.agent.toUpperCase()}
                      time={log.time}
                      text={log.text}
                      isLast={log.isLast}
                    />
                  ))}
                  {isAnalyzing && analysisLogs.length === 0 && (
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" /> Starting analysis...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 3: FINAL DECISION */}
            <div className="col-span-5 space-y-5 flex flex-col">
              
              {/* Main Decision Card */}
              <div className="bg-gradient-to-br from-indigo-950/40 to-fuchsia-950/20 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden">
                {/* Background glowing effect */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-fuchsia-500/20 blur-3xl rounded-full" />
                
                <div className="flex justify-between items-start relative z-10">
                  <h3 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-4">Final Tactical Decision</h3>
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>

                <div className="relative z-10 flex pr-24 mb-4">
                  <div>
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2 text-fuchsia-300">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-lg font-semibold">Agents deliberating...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xl text-indigo-100 font-medium">Captain's Decision</p>
                        <h2 className="text-2xl font-black text-white tracking-tight leading-snug my-1">{result?.tacticalDecision || "Awaiting analysis..."}</h2>
                      </>
                    )}
                  </div>
                </div>

                {/* IMAGEN Tactical Bulletin */}
                <div className="absolute bottom-0 right-0 w-44 h-36 rounded-xl overflow-hidden">
                  {isBulletinLoading && (
                    <div className="w-full h-full bg-slate-800/60 animate-pulse flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
                      <span className="text-[9px] text-white/40">Imagen generating...</span>
                    </div>
                  )}
                  {bulletinImage && !isBulletinLoading && (
                    <img
                      src={bulletinImage}
                      alt="AI Tactical Bulletin"
                      className="w-full h-full object-cover rounded-xl border border-blue-500/20 shadow-lg shadow-blue-900/40"
                    />
                  )}
                  {!bulletinImage && !isBulletinLoading && (
                    <div className="absolute bottom-0 right-4 w-32 h-36 bg-gradient-to-t from-blue-900 to-blue-500 rounded-t-full border-2 border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <div className="w-full h-full opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent rounded-t-full" />
                    </div>
                  )}
                </div>


              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 gap-5 flex-1">
                {/* Confidence Score */}
                <div className="glass-card border-gradient before:rounded-3xl p-5 flex flex-col">
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Confidence Score</h3>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="32" fill="transparent" stroke="#1E293B" strokeWidth="8"/>
                        <circle cx="40" cy="40" r="32" fill="transparent" stroke="#10B981" strokeWidth="8" strokeDasharray="201" strokeDashoffset="14" strokeLinecap="round"/>
                      </svg>
                      <span className="text-xl font-black text-white">{result?.confidenceScore ?? 93}%</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-fuchsia-400">{(result?.confidenceScore ?? 93) >= 80 ? "Very High" : (result?.confidenceScore ?? 93) >= 60 ? "High" : "Moderate"}</p>
                      <p className="text-xs text-white/40">Confidence</p>
                    </div>
                  </div>
                </div>

                {/* Win Prob Impact */}
                <div className="glass-card border-gradient before:rounded-3xl p-5 flex flex-col">
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Win Probability Impact</h3>
                  <div className="flex-1 flex flex-col justify-center relative">
                    <h2 className="text-3xl font-black text-fuchsia-400 mb-1">{result?.winProbabilityDelta || "+8.7%"}</h2>
                    <p className="text-xs text-white/60 mb-2">Win Probability Increase</p>
                    {/* Mini Sparkline */}
                    <svg viewBox="0 0 100 30" className="w-full h-8 overflow-visible mt-2">
                      <path d="M0,25 L20,25 L40,20 L60,15 L80,5 L100,0" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="100" cy="0" r="3" fill="#10B981" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* COMMENTARY ROW */}
          {result?.commentaryExplanation && (
            <div className="bg-white/[0.03] border border-indigo-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] rounded-2xl p-5 mb-5 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Mic className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest mb-1">Live AI Commentary</p>
                <p className="text-base font-medium text-emerald-50 leading-relaxed">
                  "{result.commentaryExplanation}"
                </p>
              </div>
              <button
                onClick={() => speakCommentary(result.commentaryExplanation)}
                title={isSpeaking ? "Stop TTS" : "Hear with Gemini TTS"}
                className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-all shadow-lg ${
                  isSpeaking
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-rose-500/20 animate-pulse"
                    : "bg-indigo-500/10 border-emerald-500/40 text-fuchsia-400 hover:bg-fuchsia-500/20 shadow-indigo-500/10"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isSpeaking ? "Stop Audio" : "Listen Live"}
              </button>
            </div>
          )}

          {/* BOTTOM ROW: CHARTS & INSIGHTS */}
          <div className="grid grid-cols-12 gap-5 pb-5">
            
            {/* Win Probability Chart - DYNAMIC */}
            <div id="win-probability" className="col-span-4 glass-card border-gradient before:rounded-3xl p-5 flex flex-col h-[260px]">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Win Probability</h3>
                <span className="text-[10px] text-white/40">Over {over}.{ball}</span>
              </div>
              <div className="flex items-center gap-4 mb-3 text-xs font-bold">
                <span className="flex items-center gap-1 text-yellow-500"><span className="w-2 h-0.5 bg-yellow-500" /> CSK {currentCSKProb.toFixed(0)}%</span>
                <span className="flex items-center gap-1 text-blue-500"><span className="w-2 h-0.5 bg-indigo-500" /> MI {currentMIProb.toFixed(0)}%</span>
              </div>
              <div className="flex-1 relative border-l border-b border-white/10 mt-1 ml-7 mb-5">
                {/* Y-Axis */}
                <span className="absolute -left-7 top-0 text-[9px] text-white/40">100%</span>
                <span className="absolute -left-7 top-1/4 text-[9px] text-white/40">75%</span>
                <span className="absolute -left-7 top-2/4 text-[9px] text-white/40">50%</span>
                <span className="absolute -left-7 top-3/4 text-[9px] text-white/40">25%</span>
                <span className="absolute -left-7 bottom-0 text-[9px] text-white/40">0%</span>
                {/* X-Axis */}
                <span className="absolute -bottom-5 left-0 text-[9px] text-white/40">0</span>
                <span className="absolute -bottom-5 left-1/4 -translate-x-1/2 text-[9px] text-white/40">5 OV</span>
                <span className="absolute -bottom-5 left-2/4 -translate-x-1/2 text-[9px] text-white/40">10 OV</span>
                <span className="absolute -bottom-5 left-3/4 -translate-x-1/2 text-[9px] text-white/40">15 OV</span>
                <span className="absolute -bottom-5 right-0 text-[9px] text-white/40">20</span>

                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                  {/* 50% midline */}
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="2,2" />
                  {/* CSK area fill */}
                  {cskPath && <path d={`${cskPath} V100 H0 Z`} fill="rgba(234,179,8,0.06)" />}
                  {/* MI area fill */}
                  {miPath && <path d={`${miPath} V0 H0 Z`} fill="rgba(59,130,246,0.06)" />}
                  {/* CSK line */}
                  {cskPath && <path d={cskPath} fill="none" stroke="#EAB308" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
                  {/* MI line */}
                  {miPath && <path d={miPath} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
                  {/* Live marker vertical line */}
                  <line x1={markerX} y1="0" x2={markerX} y2="100" stroke="#64748B" strokeWidth="0.8" strokeDasharray="2,2" />
                  {/* Live dot on CSK line */}
                  <circle cx={markerX} cy={markerY} r="2.5" fill="#EAB308" stroke="#060B14" strokeWidth="1" />
                  <circle cx={markerX} cy={100 - markerY} r="2.5" fill="#3B82F6" stroke="#060B14" strokeWidth="1" />
                </svg>

                {/* Live Tooltip */}
                <div
                  className="absolute bg-white/[0.02] backdrop-blur-xl border-white/5 border border-slate-700 rounded-lg px-2.5 py-2 text-[10px] shadow-xl z-10 pointer-events-none"
                  style={{ left: `${Math.min(markerX, 70)}%`, top: "10%" }}
                >
                  <p className="font-bold text-white/80 mb-1">OV {over}.{ball}</p>
                  <p className="text-yellow-400 font-semibold">CSK: {currentCSKProb.toFixed(1)}%</p>
                  <p className="text-indigo-400 font-semibold">MI: {currentMIProb.toFixed(1)}%</p>
                </div>
              </div>
            </div>


            {/* Key Insights - DYNAMIC */}
            <div className="col-span-4 glass-card border-gradient before:rounded-3xl p-5 relative overflow-hidden h-[260px]">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Key Insights</h3>
              {isAnalyzing ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                      <div className={`h-3 bg-slate-800 rounded animate-pulse`} style={{width: `${60 + i * 8}%`}} />
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3 z-10 relative pr-16">
                  {(result?.keyFactors || [
                    "Hardik Pandya struggles vs spin in middle overs (SR 118)",
                    "Bumrah's economy in death overs at Wankhede: 6.1",
                    "Dew factor is high - chasing team advantage increases.",
                    "Matheesha Pathirana has bowled 3 overs in death, impact reducing."
                  ]).map((text: string, i: number) => (
                    <InsightItem key={i} text={text} />
                  ))}
                </ul>
              )}
              {/* Brain Graphic */}
              <div className="absolute bottom-4 right-2 w-28 h-28 opacity-20">
                <svg viewBox="0 0 24 24" className="w-full h-full text-indigo-400" fill="currentColor">
                  <path d="M13 3C10.8 3 9 4.8 9 7c0 .7.2 1.4.5 2H7C5.3 9 4 10.3 4 12s1.3 3 3 3h.5c-.3.6-.5 1.3-.5 2 0 2.2 1.8 4 4 4 1.5 0 2.8-.8 3.5-2 .7 1.2 2 2 3.5 2 2.2 0 4-1.8 4-4 0-.7-.2-1.4-.5-2H21c1.7 0 3-1.3 3-3s-1.3-3-3-3h-2.5c.3-.6.5-1.3.5-2 0-2.2-1.8-4-4-4z" />
                </svg>
              </div>
            </div>

            {/* Alternative Strategies - DYNAMIC */}
            <div className="col-span-4 flex flex-col gap-3 h-[260px]">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Alternative Strategies</h3>
                {result?.alternativeStrategy && !isAnalyzing && (
                  <span className="text-[10px] text-fuchsia-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> AI Generated
                  </span>
                )}
              </div>
              {isAnalyzing ? (
                <>
                  <div className="flex-1 glass-card border-gradient before:rounded-3xl p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-800 rounded w-3/4" />
                        <div className="h-2 bg-slate-800 rounded w-full" />
                        <div className="h-2 bg-slate-800 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 glass-card border-gradient before:rounded-3xl p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                        <div className="h-2 bg-slate-800 rounded w-full" />
                        <div className="h-2 bg-slate-800 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <AltStrategyCard
                    label="ALT 1"
                    title={result?.alternativeStrategy?.strategy || "Hold Bumrah, Use Coetzee"}
                    desc={result?.alternativeStrategy?.reasoning || "Introduce a slower bowler with off-cutters and back-of-length deliveries to dry up runs."}
                    impact="+3.1%"
                    highlight
                  />
                  <AltStrategyCard
                    label="ALT 2"
                    title="Conservative Field Tightening"
                    desc={result?.commentaryExplanation ? "Restrict boundaries and dry up runs, forcing batters into false shots." : "Introduce spin to exploit any turn and break the batting momentum."}
                    impact="+1.8%"
                  />
                </>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* TACTICAL HISTORY SLIDE-OVER PANEL */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)} />
          {/* Panel */}
          <div className="w-[400px] bg-white/[0.02] backdrop-blur-xl border-white/5 border-l border-white/10 h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">Tactical History</h2>
                <span className="text-[10px] bg-indigo-600/30 text-indigo-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">{tacticHistory.length} saved</span>
              </div>
              <div className="flex items-center gap-3">
                {tacticHistory.length > 0 && (
                  <button
                    onClick={() => { setTacticHistory([]); localStorage.removeItem("captain_cool_history"); }}
                    className="text-[10px] text-white/40 hover:text-rose-400 transition-colors"
                  >Clear all</button>
                )}
                <button onClick={() => setIsHistoryOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* History list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {tacticHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-white/40">
                  <History className="w-12 h-12 opacity-20" />
                  <div>
                    <p className="text-sm font-semibold text-white/60">No analyses yet</p>
                    <p className="text-xs mt-1">Run your first analysis to see history here</p>
                  </div>
                </div>
              ) : (
                tacticHistory.map((entry: any) => (
                  <div key={entry.id} className="bg-white/[0.03] border border-white/10 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40 font-mono">{entry.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          entry.confidence >= 80 ? 'bg-fuchsia-500/20 text-fuchsia-400' :
                          entry.confidence >= 60 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-700 text-white/60'
                        }`}>{entry.confidence}% conf.</span>
                        <span className="text-[10px] font-bold text-fuchsia-400">{entry.winDelta}</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-white/90 mb-2 group-hover:text-white transition-colors">{entry.decision}</p>
                    <div className="flex items-center gap-3 text-[10px] text-white/40">
                      <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3" /> {entry.score}</span>
                      <span>Ov {entry.over}</span>
                      <span className="flex items-center gap-1"><CloudSun className="w-3 h-3" /> {entry.venue}</span>
                      <span className="ml-auto text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Replay →</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer tip */}
            <div className="px-4 py-3 border-t border-white/10 text-[10px] text-slate-600 text-center">
              Last 20 analyses saved locally in your browser
            </div>
          </div>
        </div>
      )}

      {/* LIVE MATCHES MODAL (Cricbuzz) */}
      {isLiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsLiveOpen(false)} />
          <div className="relative bg-white/[0.02] backdrop-blur-xl border-white/5 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-sm font-bold text-white">Live Matches</h2>
                <span className="text-[10px] text-white/40">via Cricbuzz</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchLiveMatches}
                  disabled={liveFetchState === "loading"}
                  className="text-[10px] text-indigo-400 hover:text-blue-300 disabled:opacity-40 font-semibold border border-blue-500/30 px-2 py-1 rounded-full transition-colors"
                >
                  {liveFetchState === "loading" ? "Fetching…" : "↻ Refresh"}
                </button>
                <button onClick={() => setIsLiveOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 max-h-[420px] overflow-y-auto">
              {liveFetchState === "loading" && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-sm text-white/60">Fetching live matches from Cricbuzz…</p>
                </div>
              )}

              {liveFetchState === "error" && (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                  <AlertTriangle className="w-8 h-8 text-rose-400" />
                  <p className="text-sm font-semibold text-rose-300">Failed to load live data</p>
                  <p className="text-xs text-white/40 max-w-xs">{liveError}</p>
                  <div className="mt-2 text-xs text-white/40 bg-slate-800/50 rounded-lg px-4 py-3 text-left w-full">
                    <p className="font-semibold text-white/80 mb-1">To fix:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to <span className="text-indigo-400">rapidapi.com</span> → search "Cricbuzz Cricket"</li>
                      <li>Subscribe to the free plan</li>
                      <li>Copy your <span className="text-amber-400">X-RapidAPI-Key</span></li>
                      <li>Add to <span className="text-green-400">.env.local</span> as <span className="text-green-400">RAPIDAPI_KEY=...</span></li>
                      <li>Restart the server</li>
                    </ol>
                  </div>
                </div>
              )}

              {liveFetchState === "done" && liveMatches.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-white/40">
                  <Activity className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No live T20/IPL matches right now.</p>
                  <p className="text-xs text-slate-600">Try again during a match window.</p>
                </div>
              )}

              {liveFetchState === "done" && liveMatches.length > 0 && (
                <div className="space-y-3">
                  {liveMatches.map((m) => (
                    <button
                      key={m.matchId}
                      onClick={() => loadLiveMatch(m)}
                      className="w-full text-left bg-white/[0.03] hover:bg-white/[0.05] border border-transparent hover:border-white/10 hover:shadow-[0_0_15px_rgba(232,121,249,0.1)] rounded-xl p-4 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.seriesName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.state === "In Progress" ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-white/60'}`}>
                          {m.state === "In Progress" ? "🔴 LIVE" : m.state}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{m.team1.shortName} <span className="text-white/60 font-normal text-xs">{m.team1.scoreStr}</span></p>
                          <p className="text-xs text-white/80 mt-0.5">{m.team2.shortName} <span className="text-white/60">{m.team2.scoreStr}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/40">{m.venue}</p>
                          {m.target && <p className="text-[10px] text-amber-400 mt-0.5">Target: {m.target}</p>}
                          <p className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 font-semibold">Load into dashboard →</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-fuchsia-400 mt-2">{m.statusText}</p>
                    </button>
                  ))}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VOICE TOAST NOTIFICATION */}
      {voiceToast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-white/[0.02] backdrop-blur-xl border-white/5 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white/90 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 max-w-md">
          <Mic className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{voiceToast}</span>
        </div>
      )}

      {/* LISTENING OVERLAY */}
      {isListening && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-white/[0.02] backdrop-blur-xl border-white/5/90 border border-rose-500/30 rounded-3xl px-10 py-8 flex flex-col items-center gap-4 shadow-2xl backdrop-blur-sm">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center">
                <Mic className="w-8 h-8 text-rose-400" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping" />
              <div className="absolute inset-[-8px] rounded-full border border-rose-500/20 animate-ping" style={{animationDelay: '0.3s'}} />
            </div>
            <p className="text-rose-300 font-bold text-sm tracking-wide">Listening...</p>
            <p className="text-white/40 text-xs text-center max-w-[200px]">
              Say: <span className="text-white/80">"Score is 145 for 3, over 14, target 180 at Wankhede"</span>
            </p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="h-10 border-t border-white/10 bg-white/[0.02] backdrop-blur-xl border-white/5 flex items-center justify-between px-6 shrink-0 text-[10px] text-white/40">
        <div className="flex items-center gap-1">
          Built with <span className="text-red-500">❤️</span> and <span className="font-semibold text-white/80">Google <span className="text-indigo-400">✦</span> Gemini</span>
        </div>
        <div>
          Captain Cool AI may make mistakes. Please use your cricketing judgment.
        </div>
        <div className="flex items-center gap-4">
          {/* Google Cloud Logo */}
          <span className="flex items-center gap-1.5 text-white/60 font-semibold text-[10px]">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M12 6.5C13.9 6.5 15.5 7.6 16.4 9.2l.7 1.2 1.4-.1c.1 0 .2 0 .3 0 2.1 0 3.8 1.7 3.8 3.8s-1.7 3.8-3.8 3.8H6c-2.2 0-4-1.8-4-4 0-2.1 1.6-3.8 3.7-4l1.1-.1.4-1C8.1 7.6 9.9 6.5 12 6.5Z" fill="#4285F4"/>
            </svg>
            Google Cloud
          </span>
          {/* Firebase Logo */}
          <span className="flex items-center gap-1.5 text-white/60 font-semibold text-[10px]">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
              <path d="M5.77 17.15 3 10.5l4.17.94L9.4 5.5 12 11.2 14.6 3l5.63 14.15-1.79 1.1L12 20.5l-6.23-3.35Z" fill="#FFA000"/>
              <path d="M14.6 3 12 11.2 9.4 5.5 11.6 3h3Z" fill="#F57C00"/>
              <path d="M5.77 17.15 12 20.5l6.44-3.35L12 11.2 9.4 5.5l-2.23 5.94L3 10.5l2.77 6.65Z" fill="#FFCA28"/>
            </svg>
            Firebase
          </span>
        </div>
      </footer>

    </div>
  );
}

// --- MICRO COMPONENTS ---

function NavItem({ icon, label, active = false, onClick, count }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, count?: number }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-indigo-600/20 text-indigo-400 font-bold' : 'text-white/60 hover:text-white/90 hover:bg-slate-800/50 font-medium'}`}
    >
      <div className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full">{icon}</div>
      <span className="text-sm flex-1">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] bg-indigo-600/30 text-indigo-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">{count}</span>
      )}
    </div>
  );
}

function ConditionItem({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className={`mt-0.5 [&>svg]:w-4 [&>svg]:h-4 ${highlight ? 'text-amber-400' : 'text-white/40'}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-white/40 uppercase">{label}</p>
        <p className={`text-xs font-semibold ${highlight ? 'text-amber-300' : 'text-white/90'}`}>{value}</p>
      </div>
    </div>
  );
}

function InputSelect({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border-white/5 border border-white/10 rounded-lg p-2 flex justify-between items-center cursor-pointer hover:border-slate-700 transition-colors">
      <div className="flex flex-col">
        <span className="text-[10px] text-white/40 mb-0.5">{label}</span>
        <span className="text-xs font-semibold text-white/90">{value}</span>
      </div>
      <ChevronDown className="w-3 h-3 text-slate-600" />
    </div>
  );
}

// ── REAL interactive form components ──────────────────────────────────────────

const inputBase = "w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white/90 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-fuchsia-500/30 transition-all placeholder-white/30 appearance-none shadow-inner";

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold px-0.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={inputBase + " pr-6 cursor-pointer"}
          style={{ WebkitAppearance: "none" }}
        >
          {options.map(o => <option key={o} value={o} className="bg-white/[0.02] backdrop-blur-xl border-white/5">{o}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold px-0.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputBase}
      />
    </div>
  );
}

// ── Legacy static components (kept for BowlerBadge compatibility) ─────────────

function BowlerBadge({ name, overs, active = false }: { name: string, overs: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${active ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] backdrop-blur-xl border-white/5 border-white/10 text-white/60'}`}>
      <span className={active ? 'text-amber-400 font-semibold' : ''}>{name}</span>
      <span className={active ? 'text-amber-500 font-bold' : 'text-yellow-600'}>{overs}</span>
      <ChevronDown className={`w-3 h-3 ${active ? 'text-amber-500/50' : 'text-slate-600'}`} />
    </div>
  );
}

function TimelineItem({ icon, color, title, time, text, isLast = false }: any) {
  return (
    <div className="relative">
      {/* Connector line is handled by parent, but we need the node */}
      <div className={`absolute -left-[37px] top-1 w-6 h-6 rounded-md ${color} flex items-center justify-center z-10 shadow-lg`}>
        <div className="text-white [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</div>
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`text-[10px] font-bold ${color.replace('bg-', 'text-').replace('500', '400').replace('600', '400')} uppercase tracking-wider`}>{title}</h4>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-white/40">{time}</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          </div>
        </div>
        <p className={`text-xs ${isLast ? 'text-white/90 font-medium' : 'text-white/60'}`}>{text}</p>
      </div>
    </div>
  );
}

function InsightItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
      <span className="text-xs text-white/80 leading-relaxed">{text}</span>
    </li>
  );
}

function AltStrategyCard({ label, title, desc, impact, highlight = false }: any) {
  return (
    <div className={`flex-1 border transition-colors rounded-2xl p-4 flex gap-4 ${highlight ? 'bg-blue-900/20 border-blue-500/30 hover:border-blue-500/50' : 'bg-white/[0.03] border-white/10 hover:border-slate-700/80'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${highlight ? 'bg-indigo-500 shadow-blue-500/30' : 'bg-indigo-600 shadow-blue-600/20'}`}>
        <span className="text-xs font-black text-white">{label}</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-1">
          <h4 className={`text-sm font-bold ${highlight ? 'text-blue-200' : 'text-white/90'}`}>{title}</h4>
          <div className="text-right shrink-0 ml-2">
            <span className="text-[9px] text-white/40 block mb-0.5">Probability Impact</span>
            <span className="text-sm font-black text-fuchsia-400">{impact}</span>
          </div>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{desc}</p>
        <div className={`mt-2 text-[10px] font-semibold uppercase cursor-pointer w-fit border-b ${highlight ? 'text-indigo-400 border-blue-700 hover:text-blue-200' : 'text-white/40 border-slate-700 hover:text-white/80'}`}>View Analysis</div>
      </div>
    </div>
  );
}
