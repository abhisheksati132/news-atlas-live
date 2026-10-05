import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const steps = [
  {
    number: '01',
    title: 'Open the App',
    desc: 'Visit the deployed app or run locally. No signup required — just open and explore.',
    code: null
  },
  {
    number: '02',
    title: 'Select a Country',
    desc: 'Click any country on the globe, search via Ctrl+K, or use the country picker. The sidebar loads its full profile instantly.',
    code: '// Click a country on the globe\n// or press Ctrl+K and type "Japan"'
  },
  {
    number: '03',
    title: 'Explore Data Tabs',
    title: 'Tabs',
    desc: 'Switch between Intelligence, News, Markets, Weather, and Economic tabs. Each loads real-time data for the selected country.',
    code: '// Tabs: Intel | News | Markets | Weather | Economic\n// Keyboard: 1-5 to switch tabs'
  },
  {
    number: '04',
    title: 'Pin & Compare',
    desc: 'Pin countries for quick access. Enable Compare Mode to view two countries side-by-side with synchronized charts.',
    code: '// Click pin icon → "Compare" → select second country'
  },
  {
    number: '05',
    title: 'Ask the AI',
    desc: 'Open the AI Assistant (backtick key) and ask anything: security risks, economic drivers, climate outlook, or custom queries.',
    code: '` > Summarize Japan\'s economic outlook\n> Compare India vs China GDP growth'
  },
  {
    number: '06',
    title: 'Export & Share',
    desc: 'Download intelligence dossiers as Markdown, share deep links with ?country=Japan&tab=markets, or pin countries for team workspaces.',
    code: '// URL: /app?country=Japan&tab=markets\n// Click "Download Dossier" button'
  }
]

export default function GettingStarted() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <header className="mb-12 text-center">
        <p className="text-sm font-mono font-medium text-accent uppercase tracking-wider mb-4">Getting Started</p>
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">Get up and running in 6 steps</h1>
        <p className="text-text-muted max-w-xl mx-auto">From zero to intelligence briefing in under a minute.</p>
    </header>

    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        {steps.map((step, i) => (
          <article
            key={step.number}
            className={`relative p-6 rounded-xl border transition-all duration-300 ${
              activeStep === i
                ? 'bg-surface border-accent/50 shadow-lg shadow-accent/10'
                : 'bg-surface border-border hover:border-border-hover'
            }`}
            onClick={() => setActiveStep(i)}
          >
            <div className="flex items-start gap-4">
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg font-mono
                ${activeStep === i ? 'bg-accent text-accent-text' : 'bg-surface border border-border text-text-muted'}
              `}>
                {step.number}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                {step.code && (
                  <pre className="mt-3 p-3 bg-bg rounded font-mono text-xs text-text-muted overflow-x-auto">
                    <code>{step.code}</code>
                  </pre>
                )}
              </div>
            </div>
            {step.title && step.code && !step.code.includes('number') && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-mono text-text-faint">Step {step.number}</span>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="mt-10 p-6 bg-surface border border-border rounded-xl">
        <h3 className="font-semibold mb-3">Quick Reference</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-bg rounded-lg">
            <p className="font-medium mb-2">Keyboard Shortcuts</p>
            <dl className="space-y-1 text-sm text-text-muted">
              <div className="flex justify-between"><dt>1-5</dt><dd>Switch tabs</dd></div>
              <div className="flex justify-between"><dt>Ctrl+K</dt><dd>Search</dd></div>
              <div className="flex justify-between"><dt>`</dt><dd>AI Assistant</dd></div>
              <div className="flex justify-between"><dt>Esc</dt><dd>Close modals</dd></div>
              <div className="flex justify-between"><dt>R</dt><dd>Reset view</dd></div>
            </dl>
          </div>
          <div className="p-3 bg-bg rounded-lg">
            <p className="font-medium mb-2">URL Patterns</p>
            <dl className="space-y-1 text-sm text-text-muted font-mono">
              <div><dt>/app</dt><dd>Dashboard</dd></div>
              <div><dt>/app?country=Japan</dt><dd>Deep link</dd></div>
              <div><dt>/country/japan/</dt><dd>SEO page</dd></div>
            </dl>
          </div>
          <div className="p-3 bg-bg rounded-lg">
            <p className="font-medium mb-2">Environment Variables</p>
            <ul className="space-y-1 text-sm text-text-muted font-mono">
              <li>VITE_MAPBOX_TOKEN</li>
              <li>VITE_SENTRY_DSN</li>
              <li>GROQ_API_KEY (server)</li>
              <li>NEWS_API_KEY (server)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GettingStarted