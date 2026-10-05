import React from 'react'
import { Link } from 'react-router-dom'

const components = [
  {
    category: 'Layout',
    items: [
      { name: 'Sidebar', path: '/components/sidebar', desc: 'Collapsible navigation with search, categories, and theme toggle' },
      { name: 'TopBar', path: '/components/topbar', desc: 'Header with search, theme toggle, notifications, user menu' },
      { name: 'RightRail', path: '/components/rightrail', desc: 'On-this-page navigation with scroll-spy headings' },
      { name: 'Layout', path: '/components/layout', desc: 'Responsive shell: sidebar + topbar + main + right rail' },
    ]
  },
  {
    category: 'Data Display',
    items: [
      { name: 'DataTable', path: '/components/datatable', desc: 'Sortable, filterable, virtualized table with column resizing' },
      { name: 'StatCard', path: '/components/statcard', desc: 'Metric card with value, trend, sparkline, and unit' },
      { name: 'Sparkline', path: '/components/sparkline', desc: 'Tiny canvas sparkline with up/down color coding' },
      { name: 'Badge', path: '/components/badge', desc: 'Status chips (success/warning/danger) with optional icon' },
      { name: 'Tooltip', path: '/components/tooltip', desc: 'Accessible tooltip with delay, offset, and portal' },
    ]
  },
  {
    category: 'Forms & Input',
    items: [
      { name: 'SearchInput', path: '/components/searchinput', desc: 'Debounced search with autocomplete dropdown and highlight' },
      { name: 'Select', path: '/components/select', desc: 'Accessible select with groups, search, and multi-select' },
      { name: 'DateRangePicker', path: '/components/daterangepicker', desc: 'Presets + custom range with calendar popover' },
      { name: 'Toggle', path: '/components/toggle', desc: 'Animated switch with label and description' },
      { name: 'FileUpload', path: '/components/fileupload', desc: 'Drag-drop zone with preview, validation, progress' },
    ]
  },
  {
    category: 'Feedback',
    items: [
      { name: 'Toast', path: '/components/toast', desc: 'Queue-based notifications with types, auto-dismiss, actions' },
      { name: 'Modal', path: '/components/modal', desc: 'Focus-trapped, scroll-locked, portal-rendered dialog' },
      { name: 'Skeleton', path: '/components/skeleton', desc: 'Loading placeholders matching content shape' },
      { name: 'Progress', path: '/components/progress', desc: 'Linear/circular progress with indeterminate mode' },
      { name: 'EmptyState', path: '/components/emptystate', desc: 'Illustrated empty states with action button' },
    ]
  },
  {
    category: 'Map & Visualization',
    items: [
      { name: 'Globe', path: '/components/globe', desc: 'Mapbox GL wrapper with layers, fly-to, popups, hover' },
      { name: 'Choropleth', path: '/components/choropleth', desc: 'Data-driven country fills with quantile buckets + legend' },
      { name: 'Sparkline', path: '/components/sparkline', desc: 'Mini canvas charts for metrics rows' },
      { name: 'Chart', path: '/components/chart', desc: 'Recharts wrapper: line, bar, area, donut with theme sync' },
      { name: 'Heatmap', path: '/components/heatmap', desc: 'WebGL heatmap layer for density visualization' },
    ]
  },
  {
    category: 'Feedback',
    items: [
      { name: 'Toast', path: '/components/toast', desc: 'Queue-based notifications with types, auto-dismiss, actions' },
      { name: 'Modal', path: '/components/modal', desc: 'Focus-trapped, scroll-locked, portal-rendered dialog' },
      { name: 'Skeleton', path: '/components/skeleton', desc: 'Loading placeholders matching content shape' },
      { name: 'Progress', path: '/components/progress', desc: 'Linear/circular progress with indeterminate mode' },
      { name: 'EmptyState', path: '/components/emptystate', desc: 'Illustrated empty states with action button' },
    ]
  }
]

export default function Components() {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <p className="text-sm font-mono font-medium text-accent uppercase tracking-wider mb-4">Component Library</p>
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">Reusable UI Components</h1>
        <p className="text-text-muted max-w-2xl mx-auto">All components are theme-aware, accessible, and built with Tailwind + React. Copy-paste ready.</      </p>
    </header>

    <div className="space-y-12">
      {components.map((section, idx) => (
        <section key={section.category} className="animate-slide-in" style={{ animationDelay: `${idx * 100}ms` }}>
          <header className="mb-6">
            <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">{section.category}</span>
            <h2 className="text-2xl font-bold mt-2">{section.category}</h2>
          </header>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {section.items.map((item) => (
              <article key={item.name} className="bg-surface border border-border rounded-xl p-6 group hover:border-border-hover hover:shadow-elevated transition-all duration-300" role="listitem">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <path d="M9 9h6v6H9z" />
                      <path d="M15 9h6v6h-6z" />
                    </svg>
                  </div>
                  <div>
                    <Link to={item.path} className="font-semibold text-lg hover:text-accent transition-colors">{item.name}</Link>
                    <p className="text-text-muted text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
                <Link to={item.path} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors mt-4">
                  View docs <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 5 19" /></svg>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default Components