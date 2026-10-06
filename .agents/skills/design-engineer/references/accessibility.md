# Accessibility Reference

## Why This Isn't Optional

Accessibility isn't a feature — it's a quality standard. Like code that compiles, UI that's accessible is UI that works. ~15% of the world population has a disability. 100% of users benefit from accessible design (keyboard shortcuts, high contrast, clear labels).

**Target: WCAG 2.1 AA** — the widely accepted standard.

## Color Contrast

### Minimum Ratios
```
Normal text (< 24px):         4.5:1 against background
Large text (≥ 24px or ≥ 19px bold): 3:1 against background
UI components & graphics:     3:1 against adjacent colors
```

### Common Failures and Fixes
```css
/* FAIL: light gray text on white */
color: #d4d4d8; background: #ffffff;  /* ratio ~1.8:1 */

/* PASS: use darker gray */
color: #71717a; background: #ffffff;  /* ratio ~5.1:1 */

/* FAIL: brand color text on dark bg (common with purple/blue) */
color: #6366f1; background: #09090b;  /* ratio ~3.7:1 — fails for normal text */

/* PASS: use lighter tint of brand */
color: #818cf8; background: #09090b;  /* ratio ~5.2:1 */
```

### Gradient Text Contrast
Gradient text is tricky — the lightest point in the gradient must still pass contrast. Test the weakest color stop against the background.

```css
/* If gradient goes from #6366f1 to #ec4899, test #ec4899 (lighter) against bg */
```

## Keyboard Navigation

Every interactive element must be reachable by keyboard:

### Focus Order
```
Tab        → moves to next interactive element
Shift+Tab  → moves to previous
Enter      → activates buttons, links
Space      → activates buttons, toggles checkboxes
Escape     → closes modals, dropdowns, menus
Arrow keys → navigates within tabs, menus, radio groups
```

### Focus Indicators
```css
/* NEVER do this: */
*:focus { outline: none; }  /* WCAG failure — removes focus visibility */

/* DO this: */
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--bg-primary), 0 0 0 5px var(--brand);
}

/* The double ring (gap + color) works on any background */
```

### Skip Link
The first focusable element should be a skip link:
```html
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <nav>...</nav>
  <main id="main">...</main>
</body>
```
```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  padding: 12px 24px;
  background: var(--brand);
  color: #ffffff;
  border-radius: 8px;
  font-weight: 600;
  z-index: 100;
  text-decoration: none;
}
.skip-link:focus {
  top: 16px;
}
```

## Semantic HTML

Use the right element for the job. Screen readers and keyboard navigation depend on it.

```html
<!-- WRONG — div soup -->
<div class="nav">
  <div class="link" onclick="go()">Home</div>
</div>
<div class="btn" onclick="submit()">Submit</div>

<!-- RIGHT — semantic elements -->
<nav aria-label="Main navigation">
  <a href="/">Home</a>
</nav>
<button type="submit">Send message</button>
```

### Landmark Elements
```html
<header>     <!-- site header, logo, nav -->
<nav>        <!-- navigation — use aria-label if multiple navs -->
<main>       <!-- primary content — ONE per page -->
<section>    <!-- thematic grouping — use with heading -->
<article>    <!-- self-contained content (blog post, card) -->
<aside>      <!-- tangential content (sidebar, related links) -->
<footer>     <!-- site footer -->
```

### Heading Hierarchy
```html
<!-- Always in order, never skip levels -->
<h1>Page Title</h1>           <!-- ONE per page -->
  <h2>Section</h2>
    <h3>Subsection</h3>
  <h2>Another Section</h2>

<!-- WRONG: -->
<h1>Title</h1>
<h3>Skipped h2!</h3>           <!-- screen readers announce this as nested under h2 that doesn't exist -->
```

## Forms

### Labels (Non-negotiable)
```html
<!-- ALWAYS use explicit labels -->
<label for="email">Email address</label>
<input id="email" type="email" name="email" autocomplete="email">

<!-- Or wrap (implicit label) -->
<label>
  Email address
  <input type="email" name="email" autocomplete="email">
</label>

<!-- NEVER rely on placeholder alone -->
<input placeholder="Email">  <!-- FAIL: placeholder disappears on type, not announced consistently -->
```

### Error Messages
```html
<label for="email">Email address</label>
<input id="email" type="email" aria-describedby="email-error" aria-invalid="true">
<span id="email-error" role="alert" style="color: var(--error-text); font-size: 0.875rem;">
  Please enter a valid email address
</span>
```

### Required Fields
```html
<label for="name">Full name <span aria-hidden="true">*</span></label>
<input id="name" required aria-required="true">
```

### Fieldsets for Related Inputs
```html
<fieldset>
  <legend>Shipping address</legend>
  <label for="street">Street</label>
  <input id="street">
  <label for="city">City</label>
  <input id="city">
</fieldset>
```

## ARIA (Use Sparingly)

**First rule of ARIA: don't use ARIA.** If a native HTML element does what you need, use it. ARIA is for when native elements aren't sufficient.

### Common ARIA Patterns

**Icon-only button:**
```html
<button aria-label="Close dialog">
  <svg><!-- X icon --></svg>
</button>
```

**Navigation with current page:**
```html
<nav aria-label="Main">
  <a href="/" aria-current="page">Home</a>
  <a href="/about">About</a>
</nav>
```

**Expandable section:**
```html
<button aria-expanded="false" aria-controls="faq-1">
  What is your refund policy?
</button>
<div id="faq-1" role="region" hidden>
  Refund policy content...
</div>
```

**Tab interface:**
```html
<div role="tablist" aria-label="Settings">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">General</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">Security</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  General settings content
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  Security settings content
</div>
```

**Modal dialog:**
```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm deletion</h2>
  <p>This action cannot be undone.</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

**Live region (for dynamic updates):**
```html
<!-- Screen reader announces changes automatically -->
<div aria-live="polite" aria-atomic="true">
  3 items in your cart
</div>
```

## Images

```html
<!-- Informative image — describe the content -->
<img src="chart.png" alt="Revenue grew 42% from Q1 to Q2 2025">

<!-- Decorative image — empty alt -->
<img src="decorative-swoosh.svg" alt="">

<!-- Complex image — longer description -->
<figure>
  <img src="architecture.png" alt="System architecture diagram showing three microservices">
  <figcaption>Figure 1: The auth, API, and worker services communicate via message queue</figcaption>
</figure>

<!-- Icon with text — hide icon from screen readers -->
<button>
  <svg aria-hidden="true"><!-- icon --></svg>
  Save changes
</button>
```

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

~30% of iOS users have this enabled. Always include it.

## Color Independence

Never use color alone to convey information:

```html
<!-- WRONG: only color differentiates status -->
<span style="color: green;">Active</span>
<span style="color: red;">Inactive</span>

<!-- RIGHT: icon/text + color -->
<span style="color: var(--success);">&#10003; Active</span>
<span style="color: var(--error);">&#10007; Inactive</span>

<!-- Or use badges with text -->
<span class="badge badge-success">Active</span>
<span class="badge badge-error">Inactive</span>
```

## Dark Mode Accessibility

Dark mode introduces specific contrast challenges:

```css
/* COMMON FAIL: text too close to background in dark mode */
color: #52525b;    /* zinc-600 on zinc-950 → ratio ~2.8:1 FAIL */
color: #71717a;    /* zinc-500 on zinc-950 → ratio ~4.0:1 borderline */
color: #a1a1aa;    /* zinc-400 on zinc-950 → ratio ~6.6:1 PASS */

/* Use zinc-400 (#a1a1aa) as minimum for secondary text in dark mode */
/* Use zinc-500 (#71717a) only for decorative/non-essential text */
```

## Testing Checklist

```
AUTOMATED:
[ ] Run axe DevTools or Lighthouse accessibility audit
[ ] Check all color contrast ratios (use Chrome DevTools contrast picker)

KEYBOARD:
[ ] Tab through entire page — can you reach everything?
[ ] Is focus indicator visible at all times?
[ ] Can you activate every button/link with Enter/Space?
[ ] Can you close every modal/dropdown with Escape?
[ ] Does focus return to trigger after closing modal?

SCREEN READER:
[ ] Every image has appropriate alt text
[ ] Every form input has a visible label
[ ] Headings are in correct order (h1 → h2 → h3)
[ ] ARIA roles are correct on custom widgets
[ ] Live regions announce dynamic changes

VISUAL:
[ ] Page is usable at 200% zoom
[ ] No horizontal scroll at any viewport width
[ ] Text is readable without color (grayscale test)
[ ] Reduced motion is respected
```
