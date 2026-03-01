import React, { useEffect, useRef } from 'react'

// A lightweight 3D tilt wrapper for a premium look on hover/move
export default function ThreeDTilt({ children, maxTilt = 8, perspective = 1000 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Disable on devices that don't support hover (e.g., most touch devices)
    if (!window.matchMedia('(hover: hover)').matches) {
      el.style.transform = ''
      return
    }
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      const rotateY = (px - 0.5) * maxTilt * 2
      const rotateX = -(py - 0.5) * maxTilt * 2
      el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }
    const onLeave = () => {
      el.style.transform = 'rotateX(0deg) rotateY(0deg)'
    }
    el.style.transformStyle = 'preserve-3d'
    el.style.transition = 'transform 0.15s ease-out'
    el.style.willChange = 'transform'
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [maxTilt])

  return (
    <div ref={ref} style={{ display: 'contents', perspective }}>
      {children}
    </div>
  )
}
