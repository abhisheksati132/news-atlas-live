# Animations Reference

## Philosophy

Animation should feel **intentional**, not decorative. Every movement must answer: "What does this help the user understand?" Good animation guides attention, provides feedback, and creates spatial continuity. Bad animation is distracting eye candy.

**Three rules:**
1. Fast: ≤ 300ms for micro-interactions, ≤ 500ms for entrances
2. Purposeful: every animation has a reason (feedback, transition, hierarchy)
3. Respectful: always disable via `prefers-reduced-motion`

## Easing Functions

```css
/* Use these — never linear for UI elements */
--ease-out:     cubic-bezier(0.16, 1, 0.3, 1);     /* spring-like exit — best for entrances */
--ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);      /* general purpose — Material standard */
--ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);  /* playful overshoot — use sparingly */
--ease-in-out:  cubic-bezier(0.65, 0, 0.35, 1);     /* symmetric — good for looping */

/* Quick reference */
Micro-interactions (hover, press):  0.15–0.2s ease
Entrances (fade in, slide up):      0.3–0.5s ease-out
Exits (fade out, slide away):       0.15–0.25s ease-in
Page transitions:                   0.3–0.4s ease-smooth
```

## Micro-Interactions

### Button Hover + Press
```css
.btn {
  transition: all 0.2s ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--brand-glow);
}
.btn:active {
  transform: translateY(0) scale(0.97);
  transition-duration: 0.1s;  /* snappy press */
}
```

### Card Hover Lift
```css
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  border-color: var(--border-strong);
}
```

### Link Underline Slide
```css
.link {
  position: relative;
  text-decoration: none;
  color: var(--brand);
}
.link::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0; height: 2px;
  background: var(--brand);
  transition: width 0.25s ease;
}
.link:hover::after { width: 100%; }
```

### Icon Arrow Slide (CTA)
```css
.btn svg {
  margin-left: 8px;
  transition: transform 0.2s ease;
}
.btn:hover svg {
  transform: translateX(3px);
}
```

### Toggle Switch Slide
```css
.toggle::after {
  transition: transform 0.2s ease;
}
.toggle:checked::after {
  transform: translateX(20px);
}
```

### Input Focus Glow
```css
input {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-subtle);
}
```

## Entrance Animations

### Fade In + Slide Up (sections, cards)
```css
.fade-up {
  opacity: 0;
  transform: translateY(24px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.fade-up:nth-child(1) { transition-delay: 0s; }
.fade-up:nth-child(2) { transition-delay: 0.1s; }
.fade-up:nth-child(3) { transition-delay: 0.2s; }
.fade-up:nth-child(4) { transition-delay: 0.3s; }
```

### Fade In + Scale (modals, popovers)
```css
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal { animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
```

### Slide In from Side (drawers, sidebars)
```css
@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
.drawer { animation: slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
```

### Slide Down (dropdowns, accordions)
```css
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dropdown { animation: slideDown 0.15s ease; }
```

## Scroll-Triggered Reveals

```javascript
// Intersection Observer — lightweight, no dependencies
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // animate once, don't repeat
    }
  });
}, {
  threshold: 0.1,      // trigger when 10% visible
  rootMargin: '0px 0px -40px 0px'  // slight offset for better timing
});

document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));
```

**Best practice**: Only animate elements below the fold. Hero content should be immediately visible — don't make users wait for the most important content.

## Loading States

### Skeleton Shimmer
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--bg-raised) 25%,
    rgba(255,255,255,0.06) 50%,
    var(--bg-raised) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
```

### Pulse Dot (inline loading indicator)
```css
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.loading-dots span {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--brand);
  animation: pulse 1.4s ease infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
```

### Spinner (use sparingly — prefer skeleton)
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinner {
  width: 20px; height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

## Decorative Animations

### Floating Element (hero illustrations)
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.floating { animation: float 4s ease-in-out infinite; }
```

### Pulse Glow (attention ring on CTAs)
```css
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 var(--brand-glow); }
  50% { box-shadow: 0 0 20px 4px var(--brand-glow); }
}
.pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
```

### Gradient Shift (hero backgrounds)
```css
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animated-gradient {
  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #6366f1);
  background-size: 300% 300%;
  animation: gradientShift 8s ease infinite;
}
```

### Counter / Number Ticker
```javascript
// Animate numbers (e.g., "10,000+ teams")
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
```

## Page Transitions (SPA)

```css
/* Fade between pages */
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-exit {
  opacity: 1;
}
.page-exit-active {
  opacity: 0;
  transition: opacity 0.15s ease;
}
```

## Performance Tips

1. **Only animate `transform` and `opacity`** — these are GPU-accelerated. Animating `width`, `height`, `top`, `left`, `padding`, `margin` causes layout thrashing.
2. **Use `will-change` sparingly** — only on elements that are about to animate: `will-change: transform, opacity;`. Remove after animation completes.
3. **Avoid animating box-shadow alone** — it's expensive. Fake it: animate the opacity of a pseudo-element that has the shadow pre-applied.
4. **Cap at 60fps** — if animation feels smooth, it's fast enough. Don't use `requestAnimationFrame` for simple CSS transitions.
5. **Stagger, don't synchronize** — 5 cards fading in at once looks like a flash. Stagger by 80-120ms each.

## Reduced Motion (Non-Negotiable)

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

**Always include this.** ~30% of iOS users have reduced motion enabled. It's not just an accessibility checkbox — it's a significant portion of your users.
