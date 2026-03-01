import React, { Suspense, lazy } from 'react'
import Card from './components/Card.jsx'
import ChartCard from './components/ChartCard.jsx'
const DataVizPanel = lazy(() => import('./components/DataVizPanel.jsx'))

export default function Features(){
  return (
    <section id="features" style={{ padding: 40 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
        <Card title="3D Geospatial Visualization">Interactive globe with real-time overlays.</Card>
        <Card title="AI-Powered Briefings">Synthesize sources into SITREPs and projections.</Card>
        <Card title="Live Market Telemetry">Global indices, crypto, forex, and commodities.</Card>
        <Card title="Secure Access">Role-based access with a glassy surface UI.</Card>
      </div>
      <div style={{ marginTop: 20 }}>
        <Suspense fallback={<div>Loading data visuals…</div>}>
          <DataVizPanel country="USA,IND,GBR,JPN,CHN" />
        </Suspense>
      </div>
    </section>
  )
}
