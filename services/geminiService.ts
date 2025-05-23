
import { GoogleGenAI } from "@google/genai";

// IMPORTANT: The API key is expected to be set as an environment variable.
// process.env.API_KEY will be used directly.
// Do not add any UI or code to manage the API key in the frontend.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API Key not found in environment variables. Summary generation will be disabled.");
}

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const generateGameSummary = async (
  teamAName: string,
  teamAScore: number,
  teamBName: string,
  teamBScore: number
): Promise<string> => {
  if (!ai) {
    return "Error: Gemini API client is not initialized. API Key might be missing.";
  }

  let winnerText;
  if (teamAScore > teamBScore) {
    winnerText = `${teamAName} won against ${teamBName}.`;
  } else if (teamBScore > teamAScore) {
    winnerText = `${teamBName} won against ${teamAName}.`;
  } else {
    winnerText = `The match between ${teamAName} and ${teamBName} ended in a draw.`;
  }

  const prompt = `
Generate a brief and engaging sports game summary for a netball match.
The final score was:
- Team "${teamAName}": ${teamAScore} points
- Team "${teamBName}": ${teamBScore} points

${winnerText}

Please provide a short, enthusiastic commentary on the game's outcome, highlighting any significant score differences or a close contest. Output should be plain text, suitable for a quick update.
Example: "What a thrilling match! Team X narrowly defeated Team Y 35-34 in a nail-biter finish!" OR "Team A dominated the court today, cruising to a 50-25 victory over Team B."
`;

  try {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating game summary via Gemini API:", error);
    if (error instanceof Error) {
        // Avoid showing complex/technical error messages directly to the user.
        return `Could not generate summary. An API error occurred. (Details: ${error.message})`;
    }
    return "An unknown error occurred while generating the game summary.";
  }
};
    