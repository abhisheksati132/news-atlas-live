import React from 'react'
import Globe3D from './components/Globe3D.jsx'

export default function Hero() {
  return (
    <section className="apple-glass" style={{ padding: 40, marginTop: 20, maxWidth: 1100, position: 'relative', overflow: 'hidden' }}>
      <Globe3D />
      <h1 style={{ fontSize: 'clamp(28px, 6vw, 52px)', margin: 0, fontWeight: 800, letterSpacing: '0.02em' }}>
        GLOBAL SITUATIONAL AWARENESS
      </h1>
      <p style={{ color: '#cbd5e1', fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 700 }}>
        Real-time intelligence, geo data, and market telemetry presented in an ultra-premium glass UI.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <a href="/terminal" className="cta-btn">LAUNCH TERMINAL</a>
        <a href="#briefing" className="sec-btn">VIEW BRIEFING</a>
      </div>
    </section>
  )
}
