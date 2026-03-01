import React from 'react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import GlassPanel from '../components/GlassPanel.jsx'

export default function DocsGallery() {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff' }}>Design System Docs</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, marginTop: 12 }}>
        <Card title="Buttons">
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
        </Card>
        <Card title="Cards & Panels">
          <GlassPanel>
            This is a GlassPanel sample inside the docs.
          </GlassPanel>
        </Card>
        <Card title="Sparkline">
          <div style={{ height: 60 }}>
            <svg width="100%" height="60" viewBox="0 0 160 60" preserveAspectRatio="none" aria-label="sparkline sample">
              <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points="0,40 20,28 40,32 60,20 80,24 100,18 120,22 140,12" />
            </svg>
          </div>
        </Card>
        <Card title="Data Viz Panel">
          <div style={{ height: 100, background: 'rgba(59,130,246,0.15)', borderRadius: 12, display:'flex', alignItems:'center', justifyContent:'center' }}>Preview</div>
        </Card>
      </div>
    </div>
  )
}
