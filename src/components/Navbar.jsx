import React from 'react'
import { useTheme } from '../themes/ThemeProvider.jsx'

export default function Navbar() {
  const { toggle } = useTheme()
  return (
    <nav className="apple-glass" style={{ padding: '12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div className="w-6 h-6" style={{ borderRadius:999, width:28, height:28, background:'linear-gradient(135deg, #3b82f6, #06b6d4)' }} />
        <div className="amber-glow" style={{ width:8, height:8, borderRadius:999, background:'#f59e0b', boxShadow:'0 0 12px rgba(245,158,11,.8)' }} />
        <div style={{ fontWeight:800, fontSize:16, color:'#fff' }}>NEWSATLAS</div>
      </div>
      <div style={{ display:'flex', gap:12 }}>
        <button className="cta-btn" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>TOP</button>
        <button className="amber-cta" onClick={toggle} aria-label="Toggle theme">Theme</button>
      </div>
    </nav>
  )
}
