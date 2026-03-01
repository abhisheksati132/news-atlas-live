import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/app.css'
import { ThemeProvider } from './themes/ThemeProvider.jsx'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}
