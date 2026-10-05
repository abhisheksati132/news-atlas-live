import React, { useState, useEffect } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import RightRail from './components/RightRail'
import Home from './pages/Home'
import Features from './pages/Features'
import GettingStarted from './pages/GettingStarted'
import APIReference from './pages/APIReference'
import Components from './pages/Components'
import NotFound from './pages/NotFound'
import './styles/globals.css'

const routes = [
  { path: '/', element: <Home /> },
  { path: '/features', element: <Features /> },
  { path: '/getting-started', element: <GettingStarted /> },
  { path: '/api', element: <APIReference /> },
  { path: '/components', element: <Components /> },
  { path: '*', element: <NotFound /> }
]

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rightRailOpen, setRightRailOpen] = useState(true)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark'
    }
    return 'dark'
  })
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const contentRef = React.useRef(null)

  return (
    <div className={`min-h-screen bg-bg text-text transition-colors duration-300 ${theme}`}>
      {/* Skip link */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-72 lg:w-80
          bg-surface border-r border-border
          transition-transform duration-300 ease-out
          flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Documentation navigation"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        className="fixed bottom-4 right-4 z-40 lg:hidden p-3 rounded-xl bg-surface border border-border text-text hover:bg-surface-hover transition-colors"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
        aria-expanded={sidebarOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Main layout */}
      <div className="lg:pl-80 flex flex-1 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 w-full border-b border-border bg-bg/80 backdrop-blur-sm lg:ml-80">
          <TopBar onMenuClick={() => setSidebarOpen(true)} theme={theme} onThemeToggle={toggleTheme} />
        </header>

        {/* Main content area */}
        <main
          id="main-content"
          ref={contentRef}
          className="flex-1 lg:ml-80 overflow-auto"
          role="main"
        >
          <div className="max-w-5xl mx-auto px-6 py-8 w-full">
            <Outlet />
          </div>
        </main>

        {/* Right rail */}
        <aside
          className={`
            fixed inset-y-0 right-0 z-20 w-72
            bg-surface border-l border-border
            transition-transform duration-300 ease-out
            hidden lg:block
            ${rightRailOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          aria-label="On this page"
        >
          <RightRail onClose={() => setRightRailOpen(false)} />
        </aside>
      </div>
    </div>
  )
}

export default App