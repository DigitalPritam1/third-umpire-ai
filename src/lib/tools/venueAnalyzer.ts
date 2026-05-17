import fs from "fs";
import path from "path";

/**
 * Gemini function declaration for venue analysis.
 * Defined as a plain object to avoid @google/genai import issues.
 */
export const venueAnalyzerFunctionDeclaration = {
  name: "analyze_venue_conditions",
  description:
    "Analyze IPL venue characteristics including pitch behavior, dew impact, average scores, and tactical recommendations.",
  parameters: {
    type: "object",
    properties: {
      venue: {
        type: "string",
        description: "The stadium name, for example Wankhede Stadium, Mumbai.",
      },
    },
    required: ["venue"],
  },
};

/**
 * Reads venue data from local JSON and returns structured analysis.
 */
export async function analyzeVenueConditions(venue: string) {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "venues.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const venues = JSON.parse(raw);
    const normalizedVenue = venue.toLowerCase().trim();
    const venueData = venues.find((v: any) => v.name.toLowerCase() === normalizedVenue) || null;

    if (!venueData) {
      return {
        venue,
        pitchType: "Unknown",
        dewImpact: "Moderate",
        averageFirstInningsScore: 170,
        chasingAdvantage: "Balanced",
        tacticalNotes: "No specific venue data found. Use generic IPL strategy assumptions.",
      };
    }

    return {
      venue: venueData.name,
      pitchType: venueData.pitchType,
      dewImpact: venueData.dewImpact,
      averageFirstInningsScore: venueData.averageFirstInningsScore,
      chasingAdvantage: venueData.chasingAdvantage,
      tacticalNotes: venueData.tacticalNotes,
    };
  } catch (error) {
    console.error("Venue analyzer error:", error);
    return {
      venue,
      pitchType: "Unknown",
      dewImpact: "Moderate",
      averageFirstInningsScore: 170,
      chasingAdvantage: "Balanced",
      tacticalNotes: "Venue analysis failed. Falling back to generic IPL assumptions.",
    };
  }
}
