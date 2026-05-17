import { FunctionDeclaration, Type } from "@google/genai";

/**
 * Calculates win probability based on a simple heuristic.
 */
export function calculateWinProbability(
  runsRequired: number,
  ballsRemaining: number,
  wicketsInHand: number
): { winProbability: number } {
  if (ballsRemaining <= 0) {
    return { winProbability: runsRequired <= 0 ? 100 : 0 };
  }
  
  if (runsRequired <= 0) {
    return { winProbability: 100 };
  }

  // Calculate required run rate
  const rrr = runsRequired / (ballsRemaining / 6);
  
  // Base probability
  let baseProb = 50;
  
  // Adjust based on RRR
  if (rrr > 12) baseProb -= 30;
  else if (rrr > 10) baseProb -= 15;
  else if (rrr < 8) baseProb += 20;
  else if (rrr < 6) baseProb += 35;
  
  // Adjust based on wickets
  baseProb += (wicketsInHand - 5) * 5;
  
  // Clamp between 1 and 99
  const winProbability = Math.min(Math.max(baseProb, 1), 99);
  
  return { winProbability };
}

/**
 * Gemini Tool Declaration for Win Probability
 */
export const calculateWinProbabilityDeclaration: FunctionDeclaration = {
  name: "calculateWinProbability",
  description: "Calculate the current win probability of the batting team based on runs required, balls remaining, and wickets in hand.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      runsRequired: {
        type: Type.INTEGER,
        description: "The number of runs the batting team needs to win.",
      },
      ballsRemaining: {
        type: Type.INTEGER,
        description: "The number of legal deliveries left in the innings.",
      },
      wicketsInHand: {
        type: Type.INTEGER,
        description: "The number of wickets the batting team has remaining.",
      },
    },
    required: ["runsRequired", "ballsRemaining", "wicketsInHand"],
  },
};
