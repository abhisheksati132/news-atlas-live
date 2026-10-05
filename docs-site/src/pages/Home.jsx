import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="mb-16 text-center" aria-labelledby="hero-title">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-border text-xs font-mono font-medium text-accent mb-6 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="font-mono font-medium text-accent">v2.4.0 · Updated today</span>
        </div>

        <h1 id="hero-title" className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
          NewsAtlas <span className="text-text-muted">Documentation</span>
        </h1>
        <p className="text-lg lg:text-xl text-text-muted max-w-2xl mx-auto mb-10 animate-fade-in">
          Build real-time geopolitical intelligence dashboards with live news, markets, weather, and macroeconomic data on an interactive 3D globe.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          <Link
            to="/getting-started"
            className="btn-primary px-8 py-3 text-base font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            Get Started
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 5 19" />
            </svg>
          </a>
          <Link
            to="/features"
            className="btn-secondary px-8 py-3 text-base font-semibold rounded-lg transition-all"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-16" aria-label="Statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="list">
          {[
            { value: '240+', label: 'Countries & Territories' },
            { value: '6', label: 'Live Data Streams' },
            { value: '<2s', label: 'Country Brief Time' },
            { value: '99.9%', label: 'Uptime SLA' }
          ].map((stat, i) => (
            <article key={stat.label} className="bg-surface border border-border rounded-xl p-6 text-center group hover:border-border-hover transition-colors" role="listitem">
              <div className="text-3xl lg:text-4xl font-bold font-mono text-accent mb-2">{stat.value}</div>
              <p className="text-text-muted text-sm font-medium">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Features preview */}
      <section aria-labelledby="features-title" className="mb-16">
        <header className="mb-8 text-center">
          <h2 id="features-title" className="text-2xl lg:text-3xl font-bold mb-4">Core Capabilities</h2>
          <p className="text-text-muted max-w-xl mx-auto">Everything you need to build real-time intelligence dashboards</p>
        </header>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 0 28" />
                  <path d="M12 2a15.3 15.3 0 0 0 0 28" />
                </svg>
              ),
              title: 'Interactive Globe',
              desc: 'Click any country to load real-time intelligence — news, markets, weather, and economics on a 3D globe.'
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 16H20" />
                  <path d="M6 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6" />
                  <path d="M4 15h16" />
                  <path d="M12 15v4" />
                </svg>
              ),
              title: 'Live News & Events',
              desc: 'Real-time news feeds with sentiment analysis, GDELT events, and topic clustering per country.'
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="20" />
                  <path d="M4 18v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                  <path d="M2 10V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6" />
                  <path d="M2 18h20" />
                </svg>
              ),
              title: 'Markets & Economics',
              desc: 'Live indices, forex, commodities, crypto, plus World Bank macro indicators for every country.'
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20" />
                  <path d="M5 12h14" />
                  <path d="M18 5a4 4 0 0 1 4 4" />
                  <path d="M18 19a4 4 0 0 0-4 4" />
                </svg>
              ),
              title: 'Weather & Climate',
              desc: 'Hourly forecasts, 7-day outlook, air quality, UV index, and radar overlay per location.'
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.5" />
                  <path d="M3.3 7 3.3 17" />
                  <path d="M12 7v10" />
                  <path d="M21 7l-8 4" />
                </svg>
              ),
              title: 'AI Assistant',
              desc: 'Ask questions about any country — get sourced, concise briefings on security, economy, climate.'
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3 7 7" />
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                </svg>
              ),
              title: 'Offline-First',
              desc: 'Works offline with cached data. Pins, notes, and bookmarks persist locally.'
            }
          ].map((feature, i) => (
            <article key={i} className="bg-surface border border-border rounded-xl p-6 group hover:border-border-hover transition-colors" role="listitem">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center" aria-labelledby="cta-title">
        <h2 id="cta-title" className="text-2xl lg:text-3xl font-bold mb-4">
          Ready to explore?
          <br /><span className="text-text-muted">Free to use, no signup required.</span>
        </h2>
        <Link to="/getting-started" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base font-semibold rounded-lg mt-6">
          Launch NewsAtlas
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 5 19" />
          </svg>
        </Link>
      </section>
    </div>
  )
}

export default Home