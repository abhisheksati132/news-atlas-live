import React from 'react'
import Layout from './components/Layout.jsx'
import Hero from './Hero.jsx'
import Features from './Features.jsx'
import Navbar from './components/Navbar.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import GlassesTerminal from './GlassesTerminal.jsx'
import ThreeDTilt from './components/ThreeDTilt.jsx'
import ParallaxBackground from './components/ParallaxBackground.jsx'
import './styles/app.css'

export default function App() {
  return (
    <Layout>
      <Navbar />
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
