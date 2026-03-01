import React from 'react'
import GlassPanel from './GlassPanel.jsx'

export default function GlassesTerminal(){
  return (
    <div className="terminal-bg" aria-label="Terminal background container" style={{ padding: 0, margin: 0 }}>
      <GlassPanel title="Terminal">
        <pre style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>[terminal placeholder]</pre>
      </GlassPanel>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex: -1 }} />
    </div>
  )
}
