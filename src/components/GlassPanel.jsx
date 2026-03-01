import React from 'react'

const GlassPanel = React.memo(function GlassPanel({ children, title }) {
  return (
    <section className="apple-glass" style={{ padding: 16, borderRadius: 16 }}>
      {title && <div className="text-xs font-mono text-blue-400/60 tracking-widest mb-1">{title}</div>}
      <div>{children}</div>
    </section>
  )
})

export default GlassPanel
