import React from 'react'

export default function Sparkline({ data = [] , height = 60, color = '#3b82f6'}){
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const w = Math.max(data.length * 8, 80)
  const h = height
  const points = data.map((v,i)=>{
    const x = (i/(data.length-1))*(w-6) + 3
    const y = h - ((v - min)/(max - min || 1))*(h-6) - 3
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-label="sparkline">
      <polyline fill="none" stroke={color} strokeWidth={2} points={points} />
    </svg>
  )
}
