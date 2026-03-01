import React from 'react'

export default function Globe3D(){
  return (
    <div aria-label="3D globe" style={{ position:'absolute', width: '360px', height:'360px', left:'50%', top:'20%', transform:'translate(-50%, -50%)', zIndex:0 }}>
      <svg viewBox="0 0 360 360" width="100%" height="100%" style={{ filter: 'drop-shadow(0 6px 28px rgba(0,0,0,.4))' }}>
        <defs>
          <radialGradient id="globeShade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="1"/>
          </radialGradient>
        </defs>
        <circle cx="180" cy="180" r="170" fill="url(#globeShade)" stroke="#93c5fd" strokeWidth="2"/>
        {/* simple longitude/latitude lines */}
        {Array.from({length:12}).map((_,i)=>{
          const a = (i/12) * Math.PI * 2
          const x1 = 180 + 160 * Math.cos(a)
          const y1 = 180 + 160 * Math.sin(a)
          return <line key={i} x1={180} y1={0} x2={180} y2={360} stroke="rgba(255,255,255,.15)" />
        })}
        {/* equator */}
        <circle cx="180" cy="180" r="140" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
        <animateTransform attributeName="transform" type="rotate" from="0 180 180" to="360 180 180" dur="40s" repeatCount="indefinite" />
      </svg>
    </div>
  )
}
