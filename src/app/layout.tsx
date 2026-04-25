import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audio Transcriber",
  description: "Upload and transcribe audio using Gemini API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
