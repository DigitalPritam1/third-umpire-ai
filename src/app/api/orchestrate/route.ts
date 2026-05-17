import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { MatchState, FinalDecisionPayload } from "@/types";
import { 
  calculateWinProbability, 
  calculateWinProbabilityDeclaration 
} from "@/lib/tools/winProbability";
import { 
  analyzeVenueConditions, 
  venueAnalyzerFunctionDeclaration 
} from "@/lib/tools/venueAnalyzer";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const STATS_ANALYST_PROMPT = "You are the Head Data Analyst for an IPL franchise. Your job is strictly mathematical and contextual. You will receive the current match state. You must use the provided tools (analyze_venue_conditions, calculateWinProbability) to gather data. Summarize the match situation, the required run rate, the pitch conditions, and the historical venue data into a concise, factual report. DO NOT propose a tactical decision. Only provide the data and context.";

const STRATEGIST_PROMPT = "You are an elite, aggressive IPL Captain (think MS Dhoni or Rohit Sharma). You will receive a factual match report from your Stats Analyst. Based ONLY on this data, propose the single best tactical decision for the next over (e.g., bowling changes, field placements, Impact Player usage). Be bold, decisive, and specific. State your primary strategy and briefly explain the cricketing logic behind it.";

const ADVOCATE_PROMPT = "You are the Head Coach of an IPL franchise, acting as the Devil's Advocate. You will receive the Tactical Strategist's proposed plan. Your job is to aggressively challenge it. Identify the biggest risks, flaws, or worst-case scenarios of their plan based on the match context. Then, propose one alternative strategy that mitigates these risks. Be critical but constructive.";

const COMMENTATOR_PROMPT = "You are a legendary cricket commentator (like Harsha Bhogle or Ian Bishop). You will receive the final agreed-upon tactical decision. Translate this dry, strategic decision into 2-3 sentences of thrilling, natural-sounding commentary. Use appropriate cricket terminology, build tension, and make it sound like you are speaking live on television to millions of fans. Do not use bullet points or technical JSON.";

const SYNTHESIZER_PROMPT = `You are the final Output Formatting Engine. You will receive the outputs of the Stats Analyst, Strategist, Devil's Advocate, and Commentator. Your ONLY job is to synthesize this into a strict JSON payload. Extract the final tactical decision, generate a Confidence Score (0-100) based on how much the Advocate disagreed with the Strategist, and include the commentary and alternative strategy. YOU MUST OUTPUT VALID JSON ONLY matching this schema:
{
  "tacticalDecision": "String",
  "confidenceScore": 85,
  "winProbabilityDelta": "String (+X% or -X%)",
  "commentaryExplanation": "String",
  "alternativeStrategy": {
    "strategy": "String",
    "reasoning": "String"
  },
  "keyFactors": ["String", "String", "String"]
}`;

export async function POST(req: Request) {
  try {
    const matchState: MatchState = await req.json();
    
    // 1. Stats Analyst (with tools)
    const analystChat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: STATS_ANALYST_PROMPT,
        tools: [{
          functionDeclarations: [
            calculateWinProbabilityDeclaration,
            venueAnalyzerFunctionDeclaration
          ]
        }]
      }
    });
    
    let analystResponse = await analystChat.sendMessage({
      message: `Current Match State: ${JSON.stringify(matchState)}`
    });
    
    // Handle Tool Execution
    if (analystResponse.functionCalls && analystResponse.functionCalls.length > 0) {
      const toolResponses = [];
      for (const call of analystResponse.functionCalls) {
        if (call.name === "calculateWinProbability") {
          const args = call.args as any;
          const result = calculateWinProbability(args.runsRequired, args.ballsRemaining, args.wicketsInHand);
          toolResponses.push({
            name: "calculateWinProbability",
            response: result
          });
        } else if (call.name === "analyze_venue_conditions") {
          const args = call.args as any;
          const result = await analyzeVenueConditions(args.venue);
          toolResponses.push({
            name: "analyze_venue_conditions",
            response: result
          });
        }
      }
      analystResponse = await analystChat.sendMessage({
        message: toolResponses
      });
    }
    const analystOutput = analystResponse.text;

    // 2. Tactical Strategist
    const strategistResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Stats Analyst Report:\n${analystOutput}`,
      config: { systemInstruction: STRATEGIST_PROMPT }
    });
    const strategistOutput = strategistResponse.text;

    // 3. Devil's Advocate
    const advocateResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Match State: ${JSON.stringify(matchState)}\nStrategist's Proposed Plan:\n${strategistOutput}`,
      config: { systemInstruction: ADVOCATE_PROMPT }
    });
    const advocateOutput = advocateResponse.text;

    // 4. Commentator
    const commentatorResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Strategist's Proposed Plan:\n${strategistOutput}`,
      config: { systemInstruction: COMMENTATOR_PROMPT }
    });
    const commentatorOutput = commentatorResponse.text;

    // 5. Synthesizer
    const finalSynthesisContext = `
      Stats Analyst: ${analystOutput}
      Strategist: ${strategistOutput}
      Devil's Advocate: ${advocateOutput}
      Commentator: ${commentatorOutput}
    `;
    
    const synthesizerResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalSynthesisContext,
      config: { 
        systemInstruction: SYNTHESIZER_PROMPT,
        responseMimeType: "application/json"
      }
    });

    const finalJsonText = synthesizerResponse.text || "{}";
    console.log("[Synthesizer raw output]:", finalJsonText.slice(0, 300));
    
    // Strip markdown fences if model wraps in ```json ... ```
    const cleaned = finalJsonText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const finalPayload: FinalDecisionPayload = JSON.parse(cleaned);

    return NextResponse.json(finalPayload);
    
  } catch (error) {
    console.error("Agent Orchestration Error:", error);
    return NextResponse.json({ error: "Failed to process match state" }, { status: 500 });
  }
}
