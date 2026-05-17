import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { decision, venue, score, over, confidence, commentaryLine, winDelta } = await req.json();

    const prompt = `
      A dramatic IPL cricket tactical bulletin card. Dark navy blue background with electric blue and gold accents.
      Large bold text overlay: "${decision}".
      Match context: Score ${score}, Over ${over}, at ${venue} stadium.
      Cricket stadium floodlights at night, atmospheric fog, IPL-style graphic design.
      Bottom badge showing confidence ${confidence}% and win probability ${winDelta}.
      Modern sports analytics dashboard aesthetic, cinematic lighting, ultra HD 4K.
      No faces, no real player likenesses. Abstract cricket silhouette in background.
    `.trim();

    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "16:9",
      },
    });

    const image = response.generatedImages?.[0];
    if (!image?.image?.imageBytes) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    // Return as base64 data URL
    const base64 = image.image.imageBytes;
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ imageUrl: dataUrl });
  } catch (err: any) {
    console.error("[generate-bulletin]", err?.message);
    return NextResponse.json({ error: err?.message || "Imagen failed" }, { status: 500 });
  }
}
