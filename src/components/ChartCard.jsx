import React from 'react'
import Sparkline from './Sparkline.jsx'

export default function ChartCard({ title, data }) {
  return (
    <div className="feat-card" style={{ padding: 16 }}>
      <div className="text-xs font-mono text-blue-400/60 tracking-widest mb-2">{title}</div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width: 180, height: 60 }}>
          <Sparkline data={data || [5,8,6,9,7,10,6,11]} />
        </div>
        <div style={{ color:'#cbd5e1' }}>Trend</div>
      </div>
    </div>
  )
}
