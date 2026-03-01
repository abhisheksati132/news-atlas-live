import React from 'react'
import Navbar from './Navbar.jsx'

export default function Layout({ children }) {
  return (
    <div>
      <header>
        <Navbar />
      </header>
      <main style={{ padding: '0 16px' }}>{children}</main>
      <footer style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>NewsAtlas © {new Date().getFullYear()}</footer>
    </div>
  )
}
