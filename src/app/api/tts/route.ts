import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Charon", // Deep, authoritative sports voice
            },
          },
        },
      } as any,
    });

    const audioData =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      return NextResponse.json({ error: "No audio generated" }, { status: 500 });
    }

    const audioBuffer = Buffer.from(audioData, "base64");

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(audioBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[tts]", err?.message);
    return NextResponse.json({ error: err?.message || "TTS failed" }, { status: 500 });
  }
}
