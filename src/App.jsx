import React from 'react'
import Layout from './components/Layout.jsx'
import Card from './components/Card.jsx'
import GlassPanel from './components/GlassPanel.jsx'
import Hero from './Hero.jsx'
import Features from './Features.jsx'
import './styles/app.css'
import Button from './components/Button.jsx'
import Navbar from './components/Navbar.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import GlassesTerminal from './GlassesTerminal.jsx'
import DocsGallery from './docs/DocsGallery.jsx'
import ThreeDTilt from './components/ThreeDTilt.jsx'
import { runA11yChecks } from './utils/a11y.js'
import ParallaxBackground from './components/ParallaxBackground.jsx'

export default function App(){
  React.useEffect(() => {
    // Run basic accessibility checks in the browser
    if (typeof window !== 'undefined') runA11yChecks()
  }, [])
  // Simple hash-based routing for docs catalog (no external router)
  const [viewDocs, setViewDocs] = React.useState(false)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#docs') setViewDocs(true)
  }, [])
  if (viewDocs) return <DocsGallery />
  return (
    <Layout>
      <ParallaxBackground />
      <ThreeDTilt>
        <Hero />
        <Features />
        <section id="terminal" style={{ padding: 40 }}>
          <GlassesTerminal />
        </section>
      </ThreeDTilt>
    </Layout>
  )
}
