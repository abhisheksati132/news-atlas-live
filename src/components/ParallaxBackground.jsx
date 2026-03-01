import React, { useEffect, useRef } from 'react'

// Lightweight decorative parallax layers that respond to mouse movement
export default function ParallaxBackground({ layers = null }) {
  const wrap = useRef(null)

  // Default three subtle layers if none provided
  const defaultLayers = [
    { id: 'par1', depth: 60, color: 'rgba(59,130,246,0.25)' },
    { id: 'par2', depth: 120, color: 'rgba(6,182,212,0.20)' },
    { id: 'par3', depth: 180, color: 'rgba(16,24,40,0.25)' }
  ]

  const layersData = layers || defaultLayers

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const rx = (e.clientX - rect.left) / rect.width - 0.5
      const ry = (e.clientY - rect.top) / rect.height - 0.5
      layersData.forEach((layer, i) => {
        const depth = layer.depth
        const tx = rx * (depth / 2)
        const ty = ry * (depth / 2)
        const elChild = el.querySelector('#' + layer.id)
        if (elChild) {
          elChild.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
        }
      })
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [layersData])

  return (
    <div ref={wrap} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-label="background parallax layers">
      {layersData.map((l, idx) => (
        <div key={l.id} id={l.id} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: l.color, mixBlendMode: 'screen', filter: 'blur(0.5px)', zIndex: -idx, transform: 'translateZ(0)', willChange: 'transform' }} />
      ))}
    </div>
  )
}
