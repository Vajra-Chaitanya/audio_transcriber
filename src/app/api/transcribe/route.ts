/**
 * POST /api/transcribe
 *
 * Accepts a multipart form with an "audio" field.
 * Validates the file, calls the Gemini service, and persists the transcript.
 * Returns the saved Transcript record as JSON.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { transcribeAudio } from "@/services/gemini";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Maximum accepted file size: 10 MB (Gemini inline limit)
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Only these MIME types are accepted at the API boundary
const ALLOWED_MIME_PREFIXES = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a", "audio/ogg", "audio/webm"];

export async function POST(req: Request) {
  try {
    // ── 1. Authentication ─────────────────────────────────────────────────────
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Parse & validate FormData ──────────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No audio file provided." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 10 MB limit. Please upload a shorter audio clip." },
        { status: 400 }
      );
    }

    const isAllowedType = ALLOWED_MIME_PREFIXES.some((prefix) =>
      file.type.startsWith(prefix.split("/")[0]) && (
        // Accept any audio/* type sent by the browser
        file.type.startsWith("audio/")
      )
    );

    if (!isAllowedType && !file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: `Unsupported file type "${file.type}". Please upload an MP3, WAV, or M4A file.` },
        { status: 400 }
      );
    }

    // ── 3. Transcribe via Gemini service layer ────────────────────────────────
    const transcriptText = await transcribeAudio(file);

    // ── 4. Persist to database ────────────────────────────────────────────────
    const transcript = await prisma.transcript.create({
      data: {
        text: transcriptText,
        userId: session.user.id,
      },
    });

    return NextResponse.json(transcript, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/transcribe] Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to transcribe audio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
