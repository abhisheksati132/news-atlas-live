import React from 'react'
import { useTheme } from '../hooks/useTheme'

export default function TopBar({ onMenuClick, theme, onThemeToggle }) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-bg/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
          aria-label="Open navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5"/>
            <ellipse cx="16" cy="16" rx="5.5" ry="12" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M4 16h24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-lg font-semibold tracking-tight">NewsAtlas</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-text-muted font-mono">
          <kbd className="px-1.5 py-0.5 bg-bg rounded">Ctrl</kbd>
          <span className="text-text-faint">/</span>
          <kbd className="px-1.5 py-0.5 bg-bg rounded">K</kbd>
          <span className="text-text-faint">Search</span>
        </div>

        <button
          onClick={() => {}}
          className="p-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
          aria-label="Command palette"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <button
          onClick={() => {}}
          className="p-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
          aria-label="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>
      </div>
    </header>
  )
}

export default TopBar