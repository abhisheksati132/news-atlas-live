# Layouts Reference

## Core Layout Patterns

Every premium UI is built from a small set of layout primitives. Master these and you can build anything.

## The Container

Every page needs a max-width container. Without it, content stretches to unreadable widths.

```css
.container {
  width: 100%;
  max-width: 1280px;   /* 80rem — standard for marketing pages */
  margin: 0 auto;
  padding: 0 24px;     /* gutter on small screens */
}
/* Narrow container for text-heavy content */
.container-sm { max-width: 768px; margin: 0 auto; padding: 0 24px; }
/* Wide container for dashboards */
.container-lg { max-width: 1536px; margin: 0 auto; padding: 0 24px; }
```

## Flexbox Patterns

### Row with Space Between (nav, header bars)
```css
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
```

### Centered Content (hero, CTA sections)
```css
.flex-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
```

### Horizontal Button Group
```css
.btn-group {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
/* Center on mobile */
@media (max-width: 640px) {
  .btn-group {
    flex-direction: column;
    width: 100%;
  }
  .btn-group > * { width: 100%; }
}
```

### Vertical Stack (form fields, card content)
```css
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stack-sm { gap: 8px; }
.stack-lg { gap: 24px; }
.stack-xl { gap: 32px; }
```

## CSS Grid Patterns

### Auto-Responsive Grid (no media queries needed)
```css
/* Cards automatically flow to fill available space */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
```
This is the most useful grid pattern. Cards fill the space naturally — no breakpoints required.

### Fixed Column Grids
```css
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

/* Responsive collapse */
@media (max-width: 1024px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px)  { .grid-3 { grid-template-columns: 1fr; } }
@media (max-width: 640px)  { .grid-2 { grid-template-columns: 1fr; } .grid-4 { grid-template-columns: 1fr; } }
```

### Asymmetric Grid (content + sidebar)
```css
.grid-sidebar {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
}
@media (max-width: 1024px) {
  .grid-sidebar { grid-template-columns: 1fr; }
}
```

### Dashboard Grid (stat cards + main content)
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto 1fr;
  gap: 24px;
}
/* Stats span full width as individual cards */
.stat-card { /* each occupies 1 column */ }
/* Main content spans 3 cols, sidebar 1 col */
.main-content { grid-column: span 3; }
.sidebar { grid-column: span 1; }

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
  .main-content { grid-column: span 2; }
  .sidebar { grid-column: span 2; }
}
@media (max-width: 640px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .main-content, .sidebar { grid-column: span 1; }
}
```

## Page Layout Patterns

### 1. Centered Marketing Page
```
┌──────────────────────────────────┐
│           Glass Nav              │
├──────────────────────────────────┤
│                                  │
│         Hero (centered)          │
│    max-w-800, 128px top pad      │
│                                  │
├──────────────────────────────────┤
│     Features Grid (3-col)        │
│        max-w-1280                │
├──────────────────────────────────┤
│      Testimonials Grid           │
├──────────────────────────────────┤
│       CTA Section                │
├──────────────────────────────────┤
│          Footer                  │
└──────────────────────────────────┘
```

### 2. Sidebar + Content (Dashboard)
```
┌────────┬─────────────────────────┐
│        │     Header Bar          │
│  Side  ├─────────────────────────┤
│  bar   │ ┌──┐ ┌──┐ ┌──┐ ┌──┐   │
│  w-60  │ │  │ │  │ │  │ │  │   │
│  glass │ └──┘ └──┘ └──┘ └──┘   │
│        ├─────────────────────────┤
│        │   Main Content Area     │
│        │                         │
│        │                         │
└────────┴─────────────────────────┘
```
```css
.app-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 24px 16px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
}
.main {
  padding: 32px;
  overflow-y: auto;
}
@media (max-width: 1024px) {
  .app-layout { grid-template-columns: 1fr; }
  .sidebar { display: none; } /* or transform: translateX(-100%) for mobile drawer */
}
```

### 3. Split Hero (Left text, Right image)
```
┌──────────────────────────────────┐
│           Glass Nav              │
├────────────────┬─────────────────┤
│                │                 │
│  Headline      │   Product       │
│  Subtext       │   Screenshot    │
│  [CTA] [CTA]   │   or 3D         │
│                │                 │
├────────────────┴─────────────────┤
```
```css
.split-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  min-height: 80vh;
  padding: 128px 0 96px;
}
@media (max-width: 768px) {
  .split-hero {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
    padding: 96px 0 64px;
  }
}
```

### 4. Holy Grail (Header + Sidebar + Content + Right sidebar)
```css
.holy-grail {
  display: grid;
  grid-template: "header header header" 64px
                 "left   main   right" 1fr
                 "footer footer footer" auto
                 / 240px 1fr 300px;
  min-height: 100vh;
}
.header { grid-area: header; }
.left   { grid-area: left; }
.main   { grid-area: main; }
.right  { grid-area: right; }
.footer { grid-area: footer; }

@media (max-width: 1280px) {
  .holy-grail { grid-template: "header header" 64px / 240px 1fr; }
  .right { display: none; }
}
@media (max-width: 768px) {
  .holy-grail { grid-template: "header" 64px / 1fr; }
  .left { display: none; }
}
```

## Spacing Between Sections

```css
/* Consistent section spacing */
section { padding: 80px 0; }
section + section { padding-top: 0; } /* avoid double padding */

/* Or use gap on a parent */
.page-sections {
  display: flex;
  flex-direction: column;
  gap: 80px; /* consistent 80px between all sections */
}

@media (max-width: 768px) {
  section { padding: 48px 0; }
  .page-sections { gap: 48px; }
}
```

## Centering Patterns

```css
/* Absolute center (modals, loading overlays) */
.absolute-center {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Constrained centered text */
.centered-text {
  max-width: 36rem;    /* 576px — optimal reading width */
  margin: 0 auto;
  text-align: center;
}

/* Centered form/card */
.centered-card {
  max-width: 480px;
  margin: 0 auto;
  padding: 96px 24px;
}
```

## Aspect Ratio Patterns

```css
/* For images, videos, embeds */
.aspect-video { aspect-ratio: 16 / 9; }
.aspect-square { aspect-ratio: 1 / 1; }
.aspect-card { aspect-ratio: 4 / 3; }   /* nice for feature images */

/* Product screenshot with glass frame */
.screenshot-frame {
  border-radius: 16px;
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  aspect-ratio: 16 / 10;
}
```

## Z-Index Scale

Keep z-index predictable:
```css
--z-base:      0;
--z-raised:    10;     /* cards, raised surfaces */
--z-dropdown:  20;     /* dropdown menus */
--z-sticky:    30;     /* sticky headers */
--z-overlay:   40;     /* modal backdrops */
--z-modal:     50;     /* modal content, nav */
--z-toast:     60;     /* toast notifications */
--z-tooltip:   70;     /* tooltips */
--z-max:       9999;   /* grain texture, loading overlays */
```
