"use client";

import { useState, useRef, useCallback } from "react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Transcript {
  id: string;
  text: string;
  createdAt: string; // ISO string
}

interface User {
  name: string;
  email: string;
}

interface Props {
  user: User;
  initialTranscripts: Transcript[];
}

// ── Validation helpers ────────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = ["mp3", "wav", "m4a"];
const MAX_FILE_SIZE_MB = 10;

function validateFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported format ".${ext}". Please use MP3, WAV, or M4A.`;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size is ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
  </svg>
);

const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

const FileAudioIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3.1 4 3.6 4 4v3"/><polyline points="14 2 14 8 20 8"/><path d="M2 15v-1a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0Z"/><path d="M6 14c0-1.7 1.3-3 3-3h2.5c1.7 0 3 1.3 3 3v2.2c0 1.5-1.2 2.8-2.7 2.8H11"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function ClientDashboard({ user, initialTranscripts }: Props) {
  const [transcripts, setTranscripts] = useState<Transcript[]>(initialTranscripts);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    localStorage.removeItem("auth");
    document.cookie = "frontend_auth=; path=/; max-age=0";
    router.push("/");
  };

  // ── Upload logic ──────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Transcription failed. Please try again.");
      }

      setTranscripts((prev) => [data, ...prev]);
      setSuccess("Transcription complete!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setSuccess(""), 5000);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transcripts?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete transcript.");
      }
      setTranscripts((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <div className="brand-icon">
              <MicIcon />
            </div>
            Audio Transcriber
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span className="user-badge">{user.email}</span>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "1.5rem" }}
            >
              <LogOutIcon />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="container dashboard-grid">

        {/* ── Upload Panel ── */}
        <aside>
          <div className="glass-card" style={{ position: "sticky", top: "6rem" }}>
            <h2 className="section-title">
              <UploadIcon />
              Transcribe Audio
            </h2>
            <p className="section-subtitle">
              Upload an audio file (MP3, WAV, M4A). The AI will process it and generate a highly accurate text transcript. Max {MAX_FILE_SIZE_MB}MB.
            </p>

            {/* Status messages */}
            {error && (
              <div id="upload-error" className="alert alert-error" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div id="upload-success" className="alert alert-success" role="status">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {success}
              </div>
            )}

            {/* Hidden file input */}
            <input
              id="audio-file-input"
              type="file"
              accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {/* Drop zone */}
            <div
              id="drop-zone"
              className={`upload-area ${isDragging ? "drag-over" : ""} ${isUploading ? "uploading" : ""}`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              aria-label="Click or drag an audio file here to upload"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="upload-loading">
                  <div className="waveform-container">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                  <p className="upload-text">AI is transcribing...</p>
                  <p className="upload-hint">
                    Extracting speech to text via Gemini
                  </p>
                </div>
              ) : (
                <>
                  <div className="upload-icon">
                    <FileAudioIcon />
                  </div>
                  <p className="upload-text">
                    {isDragging ? "Drop audio here" : "Click to select audio"}
                  </p>
                  <p className="upload-hint">
                    or drag & drop a file here
                  </p>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* ── Transcripts Panel ── */}
        <section>
          <div className="transcripts-header">
            <h2 className="section-title" style={{ marginBottom: 0, gap: '0.75rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}>
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
              </svg>
              Recent Transcripts
            </h2>
            <span className="badge">{transcripts.length} item{transcripts.length !== 1 ? "s" : ""}</span>
          </div>

          {transcripts.length === 0 ? (
            <div className="empty-state glass-card">
              <div className="empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                </svg>
              </div>
              <p className="upload-text">No transcripts found</p>
              <p className="upload-hint">
                Upload your first audio file using the panel on the left.
              </p>
            </div>
          ) : (
            <div id="transcript-list">
              {transcripts.map((t) => (
                <div key={t.id} id={`transcript-${t.id}`} className="transcript-item">
                  <div className="transcript-meta">
                    <span className="transcript-date">
                      {new Date(t.createdAt).toLocaleString(undefined, { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                    </span>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      aria-label="Delete transcript"
                      title="Delete this transcript"
                    >
                      {deletingId === t.id ? (
                        <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      ) : (
                        <TrashIcon />
                      )}
                    </button>
                  </div>
                  <div className="transcript-text">{t.text}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
