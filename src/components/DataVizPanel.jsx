import React from 'react'
import ChartCard from './ChartCard.jsx'
import Sparkline from './Sparkline.jsx'
import useEconomicsData from '../hooks/useEconomicsData.js'
import GlassPanel from './GlassPanel.jsx'

export default function DataVizPanel({ country = 'USA' }) {
  const { data, loading, error } = useEconomicsData(country)

  // If multiple countries are returned, data.countries is an array
  const countries = data?.countries || []
  const fxRates = data?.fx || {}
  const crypto = data?.crypto || []

  const renderCountryCard = (c) => {
    const series = (c?.history || []).map((d) => Number(d.value)).filter((v) => !Number.isNaN(v))
    return (
      <div key={c.country} className="feat-card" style={{ minHeight: 120, padding: 16 }}>
        <div className="text-xs font-mono text-blue-400/60 tracking-widest mb-2">{c.country}</div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width: 180, height: 60 }}>
            <Sparkline data={series} height={60} />
          </div>
          <div style={{ color:'#cbd5e1' }}>Latest: {c?.latest?.value ?? 'n/a'}</div>
        </div>
      </div>
    )
  }

  return (
    <GlassPanel title="Data Viz">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 }}>
        {countries.length > 0
          ? countries.map((cc) => renderCountryCard(cc))
          : (
              <div className="text-slate-400">No country data yet. Use Phase 2: real data.</div>
            )}
      </div>
      <div style={{ marginTop: 16, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {Object.entries(fxRates).length > 0 && (
          <div className="glass-pill" style={{ padding:'6px 12px', borderRadius:999, border:'1px solid rgba(255,255,255,.25)' }}>
            FX: USD base available
          </div>
        )}
        {crypto.length > 0 && (
          <div className="glass-pill" style={{ padding:'6px 12px', borderRadius:999, border:'1px solid rgba(255,255,255,.25)' }}>
            Crypto: top5
          </div>
        )}
      </div>
      {loading && <div className="text-slate-400" style={{ marginTop: 12 }}>Loading economics data...</div>}
      {error && <div className="text-red-400" style={{ marginTop: 12 }}>{error.message}</div>}
    </GlassPanel>
  )
}
