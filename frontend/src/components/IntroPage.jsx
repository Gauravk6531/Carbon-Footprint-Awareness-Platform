import React, { useState, useEffect, useRef } from 'react';

/* ──────────────────────────────────────────────
   IntroPage
   - Plays logo_anim.mp4 centred on screen
   - Fades in app name below with typed subtitle
   - Shows "Launch EcoMind AI" CTA button
   - On click → fade-out transition → calls onEnter()
────────────────────────────────────────────── */
const IntroPage = ({ onEnter }) => {
  const videoRef = useRef(null);

  // Animation phases
  const [videoVisible,    setVideoVisible]    = useState(false);  // logo fade-in
  const [titleVisible,    setTitleVisible]    = useState(false);  // name fade-in
  const [subtitleVisible, setSubtitleVisible] = useState(false);  // sub fade-in
  const [btnVisible,      setBtnVisible]      = useState(false);  // button fade-in
  const [typedText,       setTypedText]       = useState('');     // typewriter
  const [exiting,         setExiting]         = useState(false);  // exit fade-out
  const [btnHovered,      setBtnHovered]      = useState(false);

  const FULL_TEXT = 'Your AI-powered Carbon Footprint Coach';

  // Sequenced animation timeline
  useEffect(() => {
    const t1 = setTimeout(() => setVideoVisible(true), 100);
    const t2 = setTimeout(() => setTitleVisible(true), 900);
    const t3 = setTimeout(() => setSubtitleVisible(true), 1500);
    const t4 = setTimeout(() => setBtnVisible(true), 2600);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!subtitleVisible) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(FULL_TEXT.slice(0, i));
      if (i >= FULL_TEXT.length) clearInterval(interval);
    }, 38);
    return () => clearInterval(interval);
  }, [subtitleVisible]);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 700);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        zIndex: 9999,
        overflow: 'hidden',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* ── Subtle background grid (like Google Cloud hero) ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Large gradient blobs */}
        <div style={{
          position: 'absolute',
          top: '-120px', left: '-120px',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,115,232,0.06) 0%, transparent 70%)',
          animation: 'gcBlob1 8s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px', right: '-80px',
          width: '420px', height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,168,83,0.06) 0%, transparent 70%)',
          animation: 'gcBlob2 10s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute',
          top: '30%', right: '15%',
          width: '280px', height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,188,4,0.04) 0%, transparent 70%)',
          animation: 'gcBlob3 12s ease-in-out infinite alternate',
        }} />

        {/* Dot grid pattern */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.25 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="gc-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#dadce0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gc-dots)" />
        </svg>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0',
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '600px',
          width: '100%',
        }}
      >
        {/* ── Logo video ── */}
        <div
          style={{
            opacity: videoVisible ? 1 : 0,
            transform: videoVisible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
            transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.34,1.56,0.64,1)',
            marginBottom: '32px',
          }}
        >
          {/* Glow ring behind video */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              position: 'absolute',
              inset: '-16px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(26,115,232,0.14) 0%, transparent 70%)',
              animation: videoVisible ? 'gcPulse 3s ease-in-out infinite' : 'none',
            }} />
            <video
              ref={videoRef}
              src="/logo_anim.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
                boxShadow: '0 4px 24px rgba(26,115,232,0.18), 0 1px 4px rgba(0,0,0,0.12)',
                background: '#f8f9fa',
              }}
            />
          </div>
        </div>

        {/* ── App name ── */}
        <div
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)',
            marginBottom: '12px',
          }}
        >
          <h1
            style={{
              fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: '400',
              color: '#202124',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Eco<span style={{
              color: '#1a73e8',
              fontWeight: '500',
            }}>Mind</span>
            <span style={{
              color: '#34a853',
              fontWeight: '500',
              marginLeft: '8px',
            }}>AI</span>
          </h1>
        </div>

        {/* ── Subtitle (typewriter) ── */}
        <div
          style={{
            opacity: subtitleVisible ? 1 : 0,
            transition: 'opacity 0.5s ease',
            marginBottom: '48px',
            minHeight: '28px',
          }}
        >
          <p
            style={{
              fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
              fontSize: 'clamp(14px, 2.2vw, 18px)',
              fontWeight: '400',
              color: '#5f6368',
              lineHeight: '1.5',
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            {typedText}
            <span
              style={{
                display: 'inline-block',
                width: '2px',
                height: '1.1em',
                background: '#1a73e8',
                marginLeft: '2px',
                verticalAlign: 'text-bottom',
                animation: 'gcBlink 1s step-end infinite',
                opacity: typedText.length >= FULL_TEXT.length ? 0 : 1,
              }}
            />
          </p>
        </div>

        {/* ── CTA Button ── */}
        <div
          style={{
            opacity: btnVisible ? 1 : 0,
            transform: btnVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Primary CTA — "Launch EcoMind AI" */}
          <button
            onClick={handleEnter}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '0 32px',
              height: '48px',
              borderRadius: '4px',
              border: 'none',
              background: btnHovered ? '#1557b0' : '#1a73e8',
              color: '#ffffff',
              fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
              fontSize: '15px',
              fontWeight: '500',
              letterSpacing: '0.01em',
              cursor: 'pointer',
              boxShadow: btnHovered
                ? '0 2px 6px 2px rgba(60,64,67,0.15), 0 1px 2px rgba(60,64,67,0.30)'
                : '0 1px 3px 1px rgba(60,64,67,0.15), 0 1px 2px rgba(60,64,67,0.30)',
              transition: 'background 280ms cubic-bezier(0.4,0,0.2,1), box-shadow 280ms, transform 200ms',
              transform: btnHovered ? 'translateY(-1px)' : 'none',
              outline: 'none',
            }}
          >
            {/* Arrow icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            Launch EcoMind AI
          </button>

          {/* Skip hint */}
          <div
            style={{
              fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
              fontSize: '12px',
              color: '#9aa0a6',
              letterSpacing: '0.02em',
            }}
          >
            Click to enter · Your carbon coach awaits
          </div>
        </div>

        {/* ── Google-style colored dots decoration ── */}
        <div
          style={{
            marginTop: '64px',
            opacity: btnVisible ? 0.6 : 0,
            transition: 'opacity 0.5s ease 0.3s',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          {['#4285f4', '#ea4335', '#fbbc04', '#34a853'].map((color, i) => (
            <div
              key={i}
              style={{
                width: i === 1 ? '8px' : '6px',
                height: i === 1 ? '8px' : '6px',
                borderRadius: '50%',
                background: color,
                animation: `gcDot 1.8s ease-in-out ${i * 0.15}s infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* ── Powered by line ── */}
        <div
          style={{
            marginTop: '16px',
            opacity: btnVisible ? 1 : 0,
            transition: 'opacity 0.5s ease 0.4s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{
            fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
            fontSize: '11px',
            color: '#9aa0a6',
            letterSpacing: '0.04em',
          }}>
            Powered by Gemini AI · Carbon Footprint Awareness
          </span>
        </div>
      </div>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes gcPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
        @keyframes gcBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes gcDot {
          from { transform: translateY(0); }
          to   { transform: translateY(-4px); }
        }
        @keyframes gcBlob1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.1); }
        }
        @keyframes gcBlob2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-30px, -40px) scale(1.08); }
        }
        @keyframes gcBlob3 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-20px, 20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default IntroPage;
