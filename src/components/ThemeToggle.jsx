import React from 'react'
import { useTheme } from '../themes/ThemeProvider.jsx'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="cta-btn"
      style={{ minWidth: 110 }}
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}
