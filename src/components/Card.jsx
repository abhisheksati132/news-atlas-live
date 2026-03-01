import React from 'react'

const CardInner = React.memo(function CardInner({ title, children }) {
  return (
    <div className="feat-card" style={{ minHeight: 120 }}>
      {title && <div className="text-xs font-mono text-blue-400/60 tracking-widest mb-2">{title}</div>}
      <div style={{ fontWeight: 700, color: '#fff' }}>{title ? null : null}{children}</div>
    </div>
  )
})

export default CardInner
