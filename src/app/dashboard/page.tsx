/**
 * Dashboard Page (Server Component)
 *
 * Validates the session server-side and pre-loads transcripts for
 * instant render. Hands data to the Client Component for interactivity.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ClientDashboard from "./ClientDashboard";

export const metadata = {
  title: "Dashboard — Audio Transcriber",
  description: "Upload audio files and view your transcription history.",
};

export default async function DashboardPage() {
  // Server-side session check (zero client round-trip)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  // Pre-load transcripts for instant first render
  const transcripts = await prisma.transcript.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, text: true, createdAt: true },
  });

  return (
    <ClientDashboard
      user={{ name: session.user.name, email: session.user.email }}
      initialTranscripts={transcripts.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(), // serialise Date for client boundary
      }))}
    />
  );
}
