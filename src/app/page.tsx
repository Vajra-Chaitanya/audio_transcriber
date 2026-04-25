import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      {/* Animated background elements */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Navbar minimal */}
      <nav className="landing-nav">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="navbar-brand">
            <div className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </div>
            Audio Transcriber
          </div>
          <Link href="/login" className="btn btn-secondary" style={{ padding: "0.5rem 1.25rem", borderRadius: "1.5rem" }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero">
        <div className="container">
          <div className="hero-content animate-fade-up">
            <div className="hero-badge">✨ Powered by Google Gemini AI</div>
            
            <h1 className="hero-title">
              Turn Speech into Text with <br/>
              <span className="text-gradient">Superhuman Accuracy</span>
            </h1>
            
            <p className="hero-subtitle">
              Upload your audio files and let our advanced AI generate perfect transcripts in seconds. Designed for professionals who need fast, reliable, and secure transcription.
            </p>
            
            <div className="hero-actions">
              <Link href="/login" className="btn btn-lg pulse-shadow">
                Get Started
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            </div>
            
            <div className="hero-features">
              <div className="feature">
                <div className="feature-icon">🚀</div>
                <span>Lightning Fast</span>
              </div>
              <div className="feature">
                <div className="feature-icon">🎯</div>
                <span>Highly Accurate</span>
              </div>
              <div className="feature">
                <div className="feature-icon">🔒</div>
                <span>Private & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Wave at bottom */}
      <div className="hero-wave"></div>
    </div>
  );
}
