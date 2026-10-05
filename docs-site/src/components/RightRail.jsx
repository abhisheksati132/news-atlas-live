import React, { useEffect, useRef } from 'react'

export default function RightRail({ onClose }) {
  const headingsRef = useRef([])
  const observerRef = useRef(null)
  const activeIdRef = useRef(null)

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('#main-content h2, #main-content h3'))
    headingsRef.current = headings

    if (headings.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeIdRef.current = entry.target.id
          }
        }
      },
      {
        rootMargin: '-80px 0px -66% 0px',
        threshold: 0.1
      }
    )

    headings.forEach((h) => observerRef.current.observe(h))

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const headings = Array.from(document.querySelectorAll('#main-content h2, #main-content h3'))
    .filter((h) => h.id)
    .map((h) => ({ id: h.id, text: h.textContent, level: h.tagName }))

  if (headings.length === 0) {
    return (
      <div className="p-4 text-center text-text-faint text-sm">
        No headings on this page
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-faint">
          On this page
        </h3>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          aria-label="Close navigation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav aria-label="Page navigation">
        <ul className="space-y-1" role="list">
          {(() => {
            const groups = {}
            document.querySelectorAll('#main-content h2[id], #main-content h3[id]').forEach((h) => {
              if (!h.id) return
              const h2 = h.tagName === 'H2' ? h : document.querySelector(`#${h.id} ~ h2[id], h2[id] ~ #${h.id}`)
              const key = h.tagName === 'H2' ? h.id : (document.querySelector(`h2[id]`).id)
              if (!groups[key]) groups[key] = []
              groups[key].push({ id: h.id, text: h.textContent, level: h.tagName })
            })
            return Object.entries(groups).map(([h2Id, items]) => {
              const h2El = document.getElementById(h2Id)
              return (
                <li key={h2Id} className="space-y-1">
                  <span className="px-2 py-1 text-xs font-semibold text-text-muted uppercase tracking-wider">{h2El?.textContent}</span>
                  <ul className="space-y-1 ml-2 border-l border-border pl-2">
                    {items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block px-2 py-1 text-sm text-text-muted hover:text-text transition-colors rounded"
                          onClick={() => {
                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
          })()}
        </ul>
      </nav>
    </div>
  )
}

export default RightRail