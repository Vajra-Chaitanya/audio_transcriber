/**
 * GET /api/transcripts
 *
 * Returns all transcripts belonging to the authenticated user,
 * ordered newest-first. Used by the dashboard to hydrate client state
 * without a full page reload.
 *
 * DELETE /api/transcripts?id=<transcriptId>
 *
 * Deletes a single transcript that belongs to the authenticated user.
 */

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("frontend_auth")?.value === "true";

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: "No user" }, { status: 500 });

    const transcripts = await prisma.transcript.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, text: true, createdAt: true },
    });

    return NextResponse.json(transcripts);
  } catch (error: unknown) {
    console.error("[GET /api/transcripts] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcripts." },
      { status: 500 }
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("frontend_auth")?.value === "true";

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: "No user" }, { status: 500 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing transcript id." },
        { status: 400 }
      );
    }

    // Verify the transcript belongs to the current user before deleting
    const transcript = await prisma.transcript.findFirst({
      where: { id, userId: user.id },
    });

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found." },
        { status: 404 }
      );
    }

    await prisma.transcript.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[DELETE /api/transcripts] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete transcript." },
      { status: 500 }
    );
  }
}
