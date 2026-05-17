export interface MatchState {
  innings: 1 | 2;
  matchPhase: "Powerplay" | "Middle Overs" | "Death Overs";
  battingTeam: string;
  bowlingTeam: string;
  currentScore: {
    runs: number;
    wickets: number;
    oversBowled: number;
  };
  targetRuns?: number; // Only if innings === 2
  pitchConditions: "Flat" | "Turning" | "Two-Paced" | "Green/Seaming";
  dewFactor: boolean;
  venue: string;
  striker: string;
  nonStriker: string;
  availableBowlers: Array<{
    name: string;
    type: "Pace" | "Spin";
    oversLeft: number;
  }>;
  impactPlayerAvailable: boolean;
}

export interface FinalDecisionPayload {
  tacticalDecision: string;
  confidenceScore: number;
  winProbabilityDelta: string;
  commentaryExplanation: string;
  alternativeStrategy: {
    strategy: string;
    reasoning: string;
  };
  keyFactors: string[];
}

export interface DebateLogEntry {
  timestamp: string;
  agent: "Stats Analyst" | "Strategist" | "Devil's Advocate" | "System";
  actionType: "Thinking" | "ToolCall" | "Proposal" | "Critique";
  message: string;
}
