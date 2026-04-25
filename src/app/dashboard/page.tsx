/**
 * Dashboard Page (Server Component)
 *
 * Validates the session server-side and pre-loads transcripts for
 * instant render. Hands data to the Client Component for interactivity.
 */

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientDashboard from "./ClientDashboard";

export const metadata = {
  title: "Dashboard — Audio Transcriber",
  description: "Upload audio files and view your transcription history.",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("frontend_auth")?.value === "true";

  if (!session) {
    redirect("/login");
  }

  // Pre-load transcripts for instant first render (show all since frontend bypass)
  const transcripts = await prisma.transcript.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, text: true, createdAt: true },
  });

  return (
    <ClientDashboard
      user={{ name: "Demo User", email: "demo@audiotranscriber.com" }}
      initialTranscripts={transcripts.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(), // serialise Date for client boundary
      }))}
    />
  );
}
