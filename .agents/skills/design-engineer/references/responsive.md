# Responsive Design Reference

## Breakpoint Strategy

Mobile-first. Base styles = mobile. Enhance upward with `min-width`.

```css
/* Breakpoints */
/* xs: 0px      — phones (base styles, no media query needed) */
/* sm: 640px    — large phones, small tablets */
/* md: 768px    — tablets */
/* lg: 1024px   — small laptops */
/* xl: 1280px   — desktops */
/* 2xl: 1536px  — large screens */

@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

**Why mobile-first?** Because adding complexity is easier than removing it. Start simple, add layout as space allows.

## Fluid Typography with clamp()

Stop using breakpoints for font sizes. Use `clamp()` for smooth scaling:

```css
/* clamp(minimum, preferred, maximum) */
.display { font-size: clamp(2.25rem, 5vw, 3.75rem); }   /* 36px → 60px */
h1       { font-size: clamp(1.875rem, 4vw, 3rem); }      /* 30px → 48px */
h2       { font-size: clamp(1.375rem, 2.5vw, 1.875rem); } /* 22px → 30px */
body     { font-size: clamp(0.9375rem, 1vw, 1rem); }      /* 15px → 16px */
```

This eliminates the need for typography media queries entirely. Text scales smoothly between phone and desktop.

## Responsive Grid Patterns

### Auto-fit Grid (no breakpoints needed)
```css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
```
Cards naturally reflow — 3 columns on desktop, 2 on tablet, 1 on mobile. Zero media queries.

### Manual Grid Collapse
```css
.grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); gap: 20px; }
}
@media (min-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); gap: 24px; }
}
```

### Sidebar Collapse
```css
.layout {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 1024px) {
  .layout { grid-template-columns: 240px 1fr; }
}
```

## Responsive Spacing

```css
/* Section padding scales down on mobile */
section {
  padding: 48px 0;            /* mobile base */
}
@media (min-width: 768px) {
  section { padding: 64px 0; }
}
@media (min-width: 1024px) {
  section { padding: 80px 0; }
}

/* Hero gets dramatic spacing on desktop */
.hero {
  padding: 96px 0 64px;
}
@media (min-width: 1024px) {
  .hero { padding: 128px 0 96px; }
}

/* Container gutter */
.container {
  padding: 0 16px;
}
@media (min-width: 640px) {
  .container { padding: 0 24px; }
}
@media (min-width: 1280px) {
  .container { padding: 0 32px; }
}
```

Or use `clamp()` for fluid spacing:
```css
section { padding: clamp(48px, 8vw, 96px) 0; }
.container { padding: 0 clamp(16px, 3vw, 32px); }
```

## Mobile Navigation

### Hamburger Menu Pattern
```html
<nav>
  <a href="#" class="nav-logo">Brand</a>

  <!-- Desktop nav -->
  <div class="nav-desktop">
    <a href="#">Features</a>
    <a href="#">Pricing</a>
    <a href="#" class="btn-primary" style="height:40px; padding:0 20px; font-size:0.875rem;">Get started</a>
  </div>

  <!-- Mobile hamburger -->
  <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>

<!-- Mobile drawer -->
<div class="nav-drawer" aria-hidden="true">
  <a href="#">Features</a>
  <a href="#">Pricing</a>
  <a href="#" class="btn-primary" style="width:100%;">Get started</a>
</div>
```

```css
/* Hamburger icon */
.nav-toggle {
  display: none; /* hidden on desktop */
  flex-direction: column; gap: 5px;
  width: 40px; height: 40px;
  align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer;
  padding: 0;
}
.nav-toggle span {
  display: block; width: 20px; height: 2px;
  background: var(--text-primary);
  transition: all 0.25s ease;
  border-radius: 2px;
}
/* Animate to X when open */
.nav-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-toggle.open span:nth-child(2) { opacity: 0; }
.nav-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile drawer */
.nav-drawer {
  position: fixed;
  top: 64px; left: 0; right: 0; bottom: 0;
  background: var(--bg-primary);
  padding: 24px;
  display: flex; flex-direction: column; gap: 8px;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 49;
}
.nav-drawer.open { transform: translateX(0); }
.nav-drawer a {
  display: block; padding: 14px 16px;
  font-size: 1.0625rem; font-weight: 500;
  color: var(--text-primary); text-decoration: none;
  border-radius: 12px;
  transition: background 0.15s;
}
.nav-drawer a:hover { background: rgba(255,255,255,0.05); }

/* Show hamburger, hide desktop nav on mobile */
@media (max-width: 768px) {
  .nav-desktop { display: none; }
  .nav-toggle { display: flex; }
}
```

```javascript
// Toggle mobile nav
const toggle = document.querySelector('.nav-toggle');
const drawer = document.querySelector('.nav-drawer');
toggle.addEventListener('click', () => {
  const open = toggle.classList.toggle('open');
  drawer.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  drawer.setAttribute('aria-hidden', !open);
});
```

## Touch Targets

```css
/* Minimum touch target: 48px (Google) or 44px (Apple/WCAG) */
button, a, [role="button"], input[type="checkbox"], input[type="radio"] {
  min-height: 44px;
  min-width: 44px;
}

/* On mobile, make buttons full-width for easier tapping */
@media (max-width: 640px) {
  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
```

## Responsive Images

```css
/* Fluid images — never overflow container */
img { max-width: 100%; height: auto; display: block; }

/* Responsive image with aspect ratio */
.img-responsive {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 16px;
}

/* Art direction with <picture> */
/*
<picture>
  <source media="(min-width: 1024px)" srcset="hero-desktop.webp">
  <source media="(min-width: 640px)" srcset="hero-tablet.webp">
  <img src="hero-mobile.webp" alt="Hero image" loading="lazy">
</picture>
*/
```

## Responsive Tables

Tables are notoriously hard on mobile. Two approaches:

### Approach 1: Horizontal Scroll
```css
.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--border);
  border-radius: 16px;
}
.table-responsive table { min-width: 600px; }
```

### Approach 2: Card Layout on Mobile
```css
@media (max-width: 640px) {
  table, thead, tbody, tr, th, td { display: block; }
  thead { display: none; }
  tr {
    padding: 16px;
    border-bottom: 1px solid var(--border);
  }
  td {
    display: flex; justify-content: space-between;
    padding: 6px 0; border: none;
    text-align: right;
  }
  td::before {
    content: attr(data-label);
    font-weight: 500; text-align: left;
    color: var(--text-tertiary);
  }
}
```

## Responsive Typography Rules

```
Desktop (1024px+):
  Display: 60px
  H1: 48px
  H2: 30px
  Body: 16px
  Section padding: 80-128px

Tablet (768px):
  Display: 48px  (-20%)
  H1: 36px
  H2: 26px
  Body: 16px (same)
  Section padding: 64px

Mobile (< 640px):
  Display: 36px  (-40%)
  H1: 30px
  H2: 22px
  Body: 15-16px (same or slightly smaller)
  Section padding: 48px
```

With `clamp()`, you don't need these breakpoints — the scaling is automatic.

## Common Responsive Mistakes

1. **Text too small on mobile** — Body text should be ≥ 15px on mobile. Never go below 14px.
2. **Buttons too narrow on mobile** — Make CTAs full-width on mobile (< 640px).
3. **Too many columns on tablet** — 3 columns usually needs to become 2 on tablet, not stay at 3.
4. **Horizontal scroll** — Test every page at 320px width. Nothing should overflow.
5. **Fixed widths** — Never use `width: 500px` on responsive elements. Use `max-width` instead.
6. **Hover-only interactions** — Touch devices can't hover. Ensure all hover effects have tap equivalents.
7. **Small close buttons** — Modal/toast close buttons need ≥ 44px touch target on mobile.

## Testing Checklist

```
[ ] 375px  — iPhone SE (smallest common phone)
[ ] 390px  — iPhone 14
[ ] 768px  — iPad Mini
[ ] 1024px — iPad landscape / small laptop
[ ] 1280px — Standard laptop
[ ] 1920px — Desktop monitor
[ ] 2560px — Wide/ultra-wide monitor (content shouldn't stretch)
```
