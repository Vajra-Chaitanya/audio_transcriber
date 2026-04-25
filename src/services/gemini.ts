/**
 * Gemini Service Layer
 * Encapsulates all Gemini API interactions for audio transcription.
 * Keeps business logic out of route handlers.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Supported audio MIME types accepted by Gemini
const SUPPORTED_MIME_TYPES = [
  "audio/mpeg",       // .mp3
  "audio/wav",        // .wav
  "audio/x-wav",      // .wav (alternate)
  "audio/mp4",        // .m4a
  "audio/x-m4a",     // .m4a (alternate)
  "audio/ogg",        // .ogg
  "audio/webm",       // .webm
] as const;

/**
 * Normalises the browser-reported MIME type to one Gemini accepts.
 * Falls back to "audio/mpeg" when the type is empty or unknown.
 */
function resolveAudioMimeType(fileMime: string): string {
  if (SUPPORTED_MIME_TYPES.includes(fileMime as (typeof SUPPORTED_MIME_TYPES)[number])) {
    return fileMime;
  }
  return "audio/mpeg"; // safe fallback
}

/**
 * Transcribes an audio File using the Gemini 2.5 Flash model.
 *
 * @param file  - The uploaded File object (from FormData)
 * @returns     - The transcription string
 * @throws      - Descriptive Error on API failure
 */
export async function transcribeAudio(file: File): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to your environment variables."
    );
  }

  // Convert file to base64 for inline embedding in the Gemini request
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = resolveAudioMimeType(file.type);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      {
        text: "Transcribe this audio accurately. Return only the spoken text — no commentary, no formatting, no markdown.",
      },
    ]);

    const text = result.response.text().trim();
    if (!text) {
      throw new Error("Gemini returned an empty transcription.");
    }
    return text;
  } catch (err: unknown) {
    // Re-wrap Gemini SDK errors with a friendlier message
    if (err instanceof Error) {
      throw new Error(`Gemini API error: ${err.message}`);
    }
    throw new Error("An unknown error occurred while calling the Gemini API.");
  }
}
