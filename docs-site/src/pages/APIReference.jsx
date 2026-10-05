import React from 'react'
import { Link } from 'react-router-dom'

const endpoints = [
  {
    category: 'Countries',
    endpoints: [
      { method: 'GET', path: '/api/countries', desc: 'List all 250+ countries with full metadata' },
      { method: 'GET', path: '/api/countries?name={name}', desc: 'Search countries by name (fuzzy match)' },
      { method: 'GET', path: '/api/countries?code={cca2}', desc: 'Lookup by ISO 3166-1 alpha-2 code' },
      { method: 'GET', path: '/api/countries?all=true', desc: 'Full registry dump (for offline sync)' },
    ]
  },
  {
    category: 'News & Events',
    endpoints: [
      { method: 'GET', path: '/api/news', desc: 'Global or country-filtered news feed' },
      { method: 'GET', path: '/api/news?q={query}', desc: 'Full-text search across headlines & descriptions' },
      { method: 'GET', path: '/api/news?category={cat}', desc: 'Filter by category (politics, business, tech, etc.)' },
      { method: 'GET', path: '/api/gdelt', desc: 'GDELT events with tone, location, and URLs' },
      { method: 'GET', path: '/api/gdelt-geo', desc: 'GeoJSON FeatureCollection for map overlay' },
      { method: 'GET', path: '/api/news-alerts', desc: 'Server-sent events for breaking news' },
    ]
  },
  {
    category: 'Weather',
    endpoints: [
      { method: 'GET', path: '/api/weather?lat={lat}&lon={lon}', desc: 'Current + hourly + 7-day forecast + AQI + UV' },
      { method: 'GET', path: '/api/weather?city={name}', desc: 'Weather by city name (geocoded)' },
    ]
  },
  {
    category: 'Markets',
    endpoints: [
      { method: 'GET', path: '/api/markets?type=metals&currency={CCY}', desc: 'Precious metals spot prices' },
      { method: 'GET', path: '/api/markets?type=ticker&country={name}', desc: 'Benchmark indices for a country' },
      { method: 'GET', path: '/api/markets?type=forex&currency={CCY}', desc: 'FX rates vs base currency' },
      { method: 'GET', path: '/api/markets?type=commodities&currency={CCY}', desc: 'Energy, metals, agriculture futures' },
    ]
  },
  {
    category: 'Economics',
    endpoints: [
      { method: 'GET', path: '/api/economics?iso3={code}', desc: 'World Bank macro indicators (GDP, inflation, debt, etc.)' },
    ]
  },
  {
    category: 'Search & Geo',
    endpoints: [
      { method: 'GET', path: '/api/search?q={query}', desc: 'Geocoding via Mapbox + Nominatim fallback' },
      { method: 'GET', path: '/api/geo?country={name}&level=states', desc: 'Administrative subdivisions (states/provinces)' },
      { method: 'GET', path: '/api/geo?country={name}&state={name}&level=cities', desc: 'Cities within a state/province' },
    ]
  },
  {
    category: 'AI & Intelligence',
    endpoints: [
      { method: 'POST', path: '/api/ai', desc: 'AI briefing — body: {prompt, location?}' },
      { method: 'GET', path: '/api/stability', desc: 'GDELT-based conflict/stress heatmap' },
    ]
  },
  {
    category: 'Auth (if enabled)',
    endpoints: [
      { method: 'POST', path: '/api/auth/login', desc: 'Email/password → JWT' },
      { method: 'POST', path: '/api/auth/register', desc: 'Create account' },
      { method: 'POST', path: '/api/auth/refresh', desc: 'Refresh access token' },
    ]
  }
]

const authNote = (
  <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-300">
    <strong>Authentication:</strong> Most endpoints are public. Authenticated endpoints require <code className="font-mono bg-bg px-1.5 py-0.5 rounded">Authorization: Bearer <token></code> header. JWT expires in 15min; use /api/auth/refresh to renew.
  </div>

const rateLimitNote = (
  <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300">
    <strong>Rate Limits:</strong> 120 req/min per IP globally; 20 req/min on /api/ai. Returns 429 with <code className="font-mono bg-bg px-1.5 py-0.5 rounded">Retry-After</code> header.
  </div>

export default function APIReference() {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <p className="text-sm font-mono font-medium text-accent uppercase tracking-wider mb-4">API Reference</p>
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">REST API Reference</h1>
        <p className="text-text-muted max-w-2xl mx-auto">All endpoints return JSON. Rate limited to 120 req/min (20/min for AI). All timestamps ISO 8601 UTC.</p>
      </header>

      {rateLimitNote}

      <div className="space-y-10">
        {Object.entries({
          Countries: endpoints.filter(e => e.category === 'Countries').flatMap(e => e.endpoints),
          'News & Events': endpoints.filter(e => e.category === 'News & Events').flatMap(e => e.endpoints),
          Weather: endpoints.filter(e => e.category === 'Weather').flatMap(e => e.endpoints),
          Markets: endpoints.filter(e => e.category === 'Markets').flatMap(e => e.endpoints),
          Economics: endpoints.filter(e => e.category === 'Economics').flatMap(e => e.endpoints),
          'Search & Geo': endpoints.filter(e => e.category === 'Search & Geo').flatMap(e => e.endpoints),
          'AI & Intelligence': endpoints.filter(e => e.category === 'AI & Intelligence').flatMap(e => e.endpoints),
          Auth: endpoints.filter(e => e.category === 'Auth (if enabled)').flatMap(e => e.endpoints),
        }).map(([category, eps]) => (
          <section key={category} className="animate-slide-in">
            <header className="mb-4 pb-3 border-b border-border">
              <h2 className="text-xl font-bold">{category}</h2>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="text-left text-text-muted font-mono text-xs uppercase tracking-wider border-b border-border">
                    <th className="pb-2 pr-4 text-left w-24">Method</th>
                    <th className="pb-2 pr-4 text-left">Path</th>
                    <th className="pb-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {eps.map((ep) => (
                    <tr key={ep.path} className="hover:bg-surface-hover transition-colors">
                      <td className="py-3 pr-4 font-mono font-medium">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' :
                          ep.method === 'POST' ? 'bg-blue-500/10 text-blue-400' :
                          ep.method === 'PUT' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {ep.method}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-text font-medium">
                        <code>{ep.path}</code>
                      </td>
                      <td className="py-3 text-text-muted">{ep.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default APIReference