import React from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    category: 'Globe & Map',
    items: [
      { title: 'Interactive 3D Globe', desc: 'Mapbox GL JS v3 with satellite, streets, and dark modes. Click any country to load its full profile.' },
      { title: 'Data Layers', desc: 'Toggle GDP per capita, GDP growth, and custom data overlays with quantile-bucketed color scales.' },
      { title: 'Day/Night Terminator', desc: 'Real-time day/night shadow with seasonal accuracy.' },
      { title: 'Auto-Rotate & Fly-To', desc: 'Smooth camera animations with configurable duration and easing.' },
    ]
  },
  {
    category: 'News & Intelligence',
    items: [
      { title: 'Live News Feed', desc: 'Real-time articles from NewsAPI, Google News RSS, and GDELT with sentiment tagging.' },
      { title: 'GDELT Events', desc: 'Global event monitoring with tone analysis, geo-location, and 72-hour rolling window.' },
      { title: 'AI Assistant', desc: 'Ask questions about any country — get sourced briefings on security, economy, climate.' },
      { title: 'Sentiment Analysis', desc: 'Automated CRITICAL/NEUTRAL/POSITIVE tagging per article with color-coded badges.' },
    ]
  },
  {
    category: 'Markets & Economy',
    items: [
      { title: 'Benchmark Indices', desc: 'Country-specific indices (NIFTY 50, S&P 500, Nikkei 225, etc.) with real-time quotes.' },
      { title: 'Forex Matrix', desc: 'Live FX rates across 14+ currency pairs with Frankfurter/ECB sources.' },
      { title: 'Commodities & Metals', desc: 'Gold, silver, platinum, palladium, oil, gas, and agricultural futures.' },
      { title: 'World Bank Macro', desc: 'GDP, inflation, unemployment, debt/GDP, and per-capita from World Bank API.' },
    ]
  },
  {
    category: 'Weather & Environment',
    items: [
      { title: 'Hourly & 7-Day Forecast', desc: 'Temperature, precipitation, wind, humidity, UV index, visibility, cloud base.' },
      { title: 'Air Quality & UV', desc: 'European AQI, UV index with risk levels, and health recommendations.' },
      { title: 'Radar Overlay', desc: 'RainViewer precipitation radar as animated map layer.' },
      { title: 'Solar & Lunar', desc: 'Sunrise/sunset, moon phase, twilight times, and day length.' },
    ]
  },
  {
    category: 'Developer Experience',
    items: [
      { title: 'AI Assistant', desc: 'Chat with context-aware assistant — supports /compare, /weather, /layer commands.' },
      { title: 'Command Palette', desc: 'Ctrl+K to search countries, actions, and docs instantly.' },
      { title: 'Offline-First', desc: 'Service worker caches data; pins, notes, and bookmarks persist locally.' },
      { title: 'Keyboard-First', desc: '1-5 for tabs, Ctrl+K search, \` for AI, Esc to close modals.' },
    ]
  }
]

export default function Features() {
  return (
    <div className="animate-fade-in">
      <header className="mb-12 text-center">
        <p className="text-sm font-mono font-medium text-accent uppercase tracking-wider mb-4">Core Capabilities</p>
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to build real-time intelligence dashboards</h1>
        <p className="text-text-muted max-w-2xl mx-auto">Every feature is designed for speed, clarity, and depth — from the globe down to the data point.</      </p>
    </header>

    <div className="space-y-12">
      {features.map((section, idx) => (
        <section key={section.category} className="animate-slide-in" style={{ animationDelay: `${idx * 100}ms` }}>
          <header className="mb-6">
            <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">{section.category}</span>
            <h2 className="text-2xl font-bold mt-2"> {section.category}</h2>
          </header>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {section.items.map((item, i) => (
              <article key={item.title} className="bg-surface border border-border rounded-xl p-6 group hover:border-border-hover hover:shadow-elevated transition-all duration-300" role="listitem">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default Features