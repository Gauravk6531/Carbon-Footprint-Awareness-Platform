import { useState } from 'react';
import IntroPage from './components/IntroPage';
import ChatInterface from './components/ChatInterface';
import Calculator from './components/Calculator';
import WhatIfSimulator from './components/WhatIfSimulator';
import Dashboard from './components/Dashboard';
import './App.css';

/* ────────────────────────────────────────────────
   EcoMind Logo — top-bar lockup (Google Cloud style)
──────────────────────────────────────────────── */
const EcoMindLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
    <video
      src="/logo_anim.mp4"
      autoPlay loop muted playsInline
      aria-hidden="true"
      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
    />
    <span style={{
      fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
      fontSize: '18px',
      fontWeight: '400',
      color: '#202124',
      letterSpacing: '0.01em',
    }}>
      Eco<span style={{ color: '#1a73e8', fontWeight: '500' }}>Mind</span>
      {' '}
      <span style={{ color: '#34a853', fontWeight: '500' }}>AI</span>
    </span>
  </div>
);

/* ────────────────────────────────────────────────
   Nav icons (Material Design SVGs)
──────────────────────────────────────────────── */
const NavIcons = {
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>
  ),
  calculator: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
    </svg>
  ),
  simulator: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
    </svg>
  ),
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  ),
};

const TABS = [
  { id: 'chat',       label: 'Chat Coach',        subtitle: 'AI-powered guidance' },
  { id: 'calculator', label: 'Calculator',         subtitle: 'Precise measurements' },
  { id: 'simulator',  label: 'What-If Scenarios',  subtitle: 'Explore changes' },
  { id: 'dashboard',  label: 'Dashboard',          subtitle: 'Track your progress' },
];

/* ────────────────────────────────────────────────
   Main Application Shell
──────────────────────────────────────────────── */
const MainApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const active = TABS.find(t => t.id === activeTab);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', width: '100vw',
      overflow: 'hidden',
      fontFamily: '"Google Sans Text", "Google Sans", Roboto, Arial, sans-serif',
      background: '#f8f9fa',
    }}>

      {/* Skip to main — keyboard accessibility */}
      <a href="#main-content" className="skip-to-main">Skip to main content</a>

      {/* ═══════════════════════════════════════
          TOP BAR — Google Cloud header pattern
      ════════════════════════════════════════ */}
      <header role="banner" style={{
        height: '64px', minHeight: '64px',
        background: '#fff',
        borderBottom: '1px solid #dadce0',
        display: 'flex', alignItems: 'center',
        padding: '0 16px 0 24px',
        gap: '0', zIndex: 100,
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.10)',
      }}>
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={sidebarOpen}
          aria-controls="gc-sidebar"
          style={{
            width: '40px', height: '40px',
            border: 'none', background: 'transparent',
            borderRadius: '50%', cursor: 'pointer',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            color: '#5f6368', marginRight: '4px',
            transition: 'background 200ms',
          }}
          className="hamburger-btn"
          onMouseOver={e => e.currentTarget.style.background = '#f1f3f4'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>

        {/* Logo lockup */}
        <div style={{ flexShrink: 0, marginRight: '20px' }}>
          <EcoMindLogo />
        </div>

        {/* Vertical pipe divider */}
        <div style={{
          width: '1px', height: '24px',
          background: '#dadce0', marginRight: '20px', flexShrink: 0,
        }} />

        {/* Active page title */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <div style={{
            fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
            fontSize: '15px', fontWeight: '500', color: '#202124',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {active?.label}
          </div>
          <div style={{
            fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
            fontSize: '12px', color: '#80868b', marginTop: '1px',
          }}>
            {active?.subtitle}
          </div>
        </div>

        {/* Right-side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="docs-btn"
            aria-label="Open API documentation in new tab"
            style={{
              padding: '0 16px', height: '36px',
              border: '1px solid #dadce0', borderRadius: '4px',
              background: 'transparent',
              fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
              fontSize: '14px', fontWeight: '500', color: '#1a73e8',
              cursor: 'pointer', letterSpacing: '0.01em',
              transition: 'background 200ms, border-color 200ms',
              display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(26,115,232,0.04)'; e.currentTarget.style.borderColor = '#1a73e8'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#dadce0'; }}
          >
            API Docs
          </a>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            aria-label="Start carbon coaching chat"
            style={{
              padding: '0 20px', height: '36px',
              border: 'none', borderRadius: '4px',
              background: '#1a73e8', color: '#fff',
              fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
              fontSize: '14px', fontWeight: '500',
              cursor: 'pointer', letterSpacing: '0.01em',
              boxShadow: '0 1px 3px rgba(60,64,67,0.25)',
              transition: 'background 280ms, box-shadow 280ms',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#1557b0'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(60,64,67,0.20)'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.25)'; }}
          >
            Start coaching
          </button>

          <span
            aria-hidden="true"
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#e8f0fe', color: '#1a73e8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
              fontSize: '14px', fontWeight: '500',
              marginLeft: '4px',
            }}
          >
            U
          </span>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          BODY: SIDEBAR + MAIN CONTENT
      ════════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: '1 1 0', overflow: 'hidden' }}>

        {/* ───────────────────────────────────────
            LEFT SIDEBAR — Google Cloud nav style
        ─────────────────────────────────────── */}
        <nav
          id="gc-sidebar"
          className="gc-sidebar"
          aria-label="Main navigation"
          role="tablist"
          style={{
            width: '240px', minWidth: '240px',
            background: '#fff',
            borderRight: '1px solid #dadce0',
            display: 'flex', flexDirection: 'column',
            padding: '16px 0',
            overflowY: 'auto',
          }}
        >
          {/* Section label */}
          <div style={{
            fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
            fontSize: '11px', fontWeight: '600',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#80868b', padding: '0 16px 8px',
          }}>
            Carbon Tools
          </div>

          {/* Tab navigation items */}
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 16px',
                  margin: '1px 8px 1px 0',
                  borderRadius: '0 100px 100px 0',
                  border: 'none',
                  background: isActive ? '#e8f0fe' : 'transparent',
                  color: isActive ? '#1967d2' : '#5f6368',
                  fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                  fontSize: '14px', fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer', textAlign: 'left',
                  width: 'calc(100% - 8px)',
                  transition: 'background 200ms, color 200ms',
                  letterSpacing: '0.01em',
                }}
                onMouseOver={e => { if (!isActive) { e.currentTarget.style.background = '#f1f3f4'; e.currentTarget.style.color = '#202124'; } }}
                onMouseOut={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5f6368'; } }}
              >
                <span style={{ color: 'inherit', display: 'flex', flexShrink: 0 }}>
                  {NavIcons[tab.id]}
                </span>
                {tab.label}
              </button>
            );
          })}

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e8eaed', margin: '16px 16px 16px' }} />

          {/* Resources section */}
          <div style={{
            fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
            fontSize: '11px', fontWeight: '600',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#80868b', padding: '0 16px 8px',
          }}>
            Resources
          </div>

          {['Documentation', 'Tips & Guides', 'About EcoMind'].map(link => (
            <a key={link} href="#main-content"
              aria-label={`Navigate to ${link}`}
              style={{
                display: 'block', padding: '8px 16px',
                margin: '1px 8px 1px 0', borderRadius: '0 100px 100px 0',
                color: '#5f6368', textDecoration: 'none',
                fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
                fontSize: '13px', fontWeight: '400',
                transition: 'background 200ms, color 200ms',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#f1f3f4'; e.currentTarget.style.color = '#202124'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5f6368'; }}
            >
              {link}
            </a>
          ))}

          {/* Eco card at bottom */}
          <div style={{ marginTop: 'auto', padding: '16px' }}>
            <div style={{
              background: '#e6f4ea', borderRadius: '8px', padding: '14px',
            }}>
              <div style={{
                fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                fontSize: '13px', fontWeight: '600', color: '#137333', marginBottom: '4px',
              }}>
                🌿 Your Impact
              </div>
              <div style={{
                fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
                fontSize: '12px', color: '#188038', lineHeight: '1.5',
              }}>
                Track your footprint and help build a sustainable future
              </div>
            </div>
          </div>
        </nav>

        {/* ───────────────────────────────────────
            MAIN CONTENT
        ─────────────────────────────────────── */}
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          style={{
            flex: '1 1 0', overflowY: 'auto',
            background: '#f8f9fa',
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div
            hidden={activeTab !== 'chat'}
            style={{ display: activeTab === 'chat' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: '1 1 0' }}
            role="tabpanel"
            id="panel-chat"
            aria-labelledby="tab-chat"
            tabIndex={0}
          >
            <ChatInterface />
          </div>
          <div
            hidden={activeTab !== 'calculator'}
            style={{ display: activeTab === 'calculator' ? 'block' : 'none' }}
            role="tabpanel"
            id="panel-calculator"
            aria-labelledby="tab-calculator"
            tabIndex={0}
          >
            <Calculator />
          </div>
          <div
            hidden={activeTab !== 'simulator'}
            style={{ display: activeTab === 'simulator' ? 'block' : 'none' }}
            role="tabpanel"
            id="panel-simulator"
            aria-labelledby="tab-simulator"
            tabIndex={0}
          >
            <WhatIfSimulator />
          </div>
          <div
            hidden={activeTab !== 'dashboard'}
            style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}
            role="tabpanel"
            id="panel-dashboard"
            aria-labelledby="tab-dashboard"
            tabIndex={0}
          >
            <Dashboard />
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={e => e.key === 'Escape' && setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.32)', zIndex: 200,
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .gc-sidebar {
            position: fixed !important;
            top: 64px; left: ${sidebarOpen ? '0' : '-256px'} !important;
            height: calc(100vh - 64px);
            z-index: 201;
            transition: left 300ms cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 4px 0 16px rgba(0,0,0,0.12);
          }
          .hamburger-btn { display: flex !important; }
          .docs-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

/* ────────────────────────────────────────────────
   Root App — controls intro vs main routing
──────────────────────────────────────────────── */
const App = () => {
  // Always show intro on first load / refresh
  const [showIntro, setShowIntro] = useState(true);
  const [appVisible, setAppVisible] = useState(false);

  const handleEnter = () => {
    // Show main app (underneath) and fade it in
    setAppVisible(true);
    setTimeout(() => setShowIntro(false), 700); // remove intro after its fade-out
  };

  return (
    <>
      {/* Main app always rendered but invisible until intro exits */}
      <div style={{
        opacity: appVisible ? 1 : 0,
        transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1) 0.3s',
      }}>
        <MainApp />
      </div>

      {/* Intro page sits on top */}
      {showIntro && <IntroPage onEnter={handleEnter} />}
    </>
  );
};

export default App;
