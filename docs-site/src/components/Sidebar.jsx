import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

const navSections = [
  {
    label: 'Core',
    items: [
      { label: 'Introduction', href: '/' },
      { label: 'Features', href: '/features' },
      { label: 'Getting Started', href: '/getting-started' }
    ]
  },
  {
    label: 'API Reference',
    items: [
      { label: 'Overview', href: '/api' },
      { label: 'Authentication', href: '/api/auth' },
      { label: 'Endpoints', href: '/api/endpoints' },
      { label: 'Rate Limits', href: '/api/rate-limits' },
      { label: 'Webhooks', href: '/api/webhooks' }
    ]
  },
  {
    label: 'Components',
    items: [
      { label: 'Overview', href: '/components' },
      { label: 'Map', href: '/components/map' },
      { label: 'Data Panels', href: '/components/panels' },
      { label: 'Charts', href: '/components/charts' },
      { label: 'Forms', href: '/components/forms' }
    ]
  },
  {
    label: 'Guides',
    items: [
      { label: 'Deployment', href: '/guides/deployment' },
      { label: 'Authentication', href: '/guides/auth' },
      { label: 'Customization', href: '/guides/customization' },
      { label: 'Performance', href: '/guides/performance' }
    ]
  }
]

function Sidebar({ onClose }) {
  const location = useLocation()
  const { theme } = useTheme()

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-4 border-b border-border">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5"/>
          <ellipse cx="16" cy="16" rx="5.5" ry="12" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <path d="M4 16h24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span className="text-lg font-semibold tracking-tight">NewsAtlas</span>
      </div>

      <nav aria-label="Documentation navigation">
        {navSections.map((section, sectionIndex) => (
          <section key={section.label} className="mt-6" aria-labelledby={`section-${sectionIndex}`}>
            <h3
              id={`section-${sectionIndex}`}
              className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-faint"
            >
              {section.label}
            </h3>
            <ul className="space-y-1" role="list">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-accent text-accent-text font-semibold'
                          : 'text-text-muted hover:bg-surface-hover hover:text-text'
                        }
                      `}
                      onClick={() => window.innerWidth < 1024 && document.querySelector('aside')?.classList.contains('translate-x-0') && setSidebarOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}

        {/* Theme toggle at bottom */}
        <div className="mt-auto pt-4 border-t border-border">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar