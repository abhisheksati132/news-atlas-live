import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('newsatlas-theme') : '');
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
    }
    localStorage.setItem('newsatlas-theme', theme || '')
  }, [theme])

  const toggle = () => {
    setTheme((t) => (t === 'dark' ? '' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme: theme || 'light', toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
