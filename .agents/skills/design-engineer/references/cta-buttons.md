# CTA Button Reference

## Why CTAs Matter

The CTA button is the single most important UI element on any page. It's where intention becomes action. A premium CTA doesn't just "look nice" — it demands attention, communicates value, and feels satisfying to click.

## The Anatomy of a Premium CTA

### Size — Be Bold
```
Minimum touch target: 48px height (Google), 44px (Apple/WCAG)
Premium CTA height:   48–56px (standard), 56–64px (hero)
Horizontal padding:   ~50% of button height (24–32px for 48px button)
Min width:            140px (prevents tiny awkward buttons)
```

Most AI output makes CTAs too small (36–40px). Premium CTAs are physically larger than you'd expect — they own the space.

### Border Radius — The 30% Rule
```
Radius = ~30% of button height
48px button → 14–16px radius (rounded-xl)
56px button → 16–18px radius (rounded-2xl)

Or fully rounded: border-radius: 9999px (pill shape)
```

Never use sharp corners (4px) on a primary CTA. Rounded corners focus the eye on center content and feel more clickable.

### The Premium CTA Stack

**Hero CTA (the money button)**:
```css
.cta-hero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0 32px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #ffffff;
  background: linear-gradient(135deg, var(--brand), var(--brand-secondary, #8b5cf6));
  border: none;
  border-radius: 14px;
  cursor: pointer;
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.08),
    0 0 0 0 var(--brand-glow);
}

/* Hover — glow + lift */
.cta-hero:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px var(--brand-glow),
    0 2px 8px rgba(0, 0, 0, 0.12);
}

/* Active — satisfying press */
.cta-hero:active {
  transform: translateY(0) scale(0.98);
  box-shadow:
    0 2px 8px var(--brand-glow),
    0 1px 2px rgba(0, 0, 0, 0.1);
  transition-duration: 0.1s;
}

/* Focus — accessible ring */
.cta-hero:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px var(--bg-primary),
    0 0 0 5px var(--brand);
}
```

**Secondary CTA (the companion)**:
```css
.cta-secondary {
  height: 48px;
  padding: 0 24px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
}
/* Light theme variant: */
.cta-secondary-light {
  border: 1px solid #d4d4d8;
  color: #18181b;
}
.cta-secondary-light:hover {
  background: #f4f4f5;
  border-color: #a1a1aa;
}
```

**Ghost CTA (tertiary, icon buttons)**:
```css
.cta-ghost {
  height: 40px;
  padding: 0 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.cta-ghost:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}
```

## CTA Copy — The Science

### The Formula: [Action Verb] + [Value/Outcome]

```
Weak:     Submit, Click here, Learn more, Get started
Okay:     Sign up, Start now, Try it free
Strong:   Start building for free, Get your first report, Open an account
Premium:  Start writing smarter, Ship your first site, Automate your workflow
```

### The First-Person Trick
"Get **my** free report" outperforms "Get **your** free report" — it pre-commits the user mentally.

### Copy Patterns by Page Section
```
Hero primary:    "Start [doing value thing] free"     — action + value + low risk
Hero secondary:  "See how it works" or "Watch demo"   — low commitment alternative
Pricing:         "Start free plan" / "Upgrade to Pro"  — specific to what they get
Final CTA:       "Ready to [outcome]? Start now"       — emotional close
Nav:             "Sign in" (ghost) + "Get started" (primary) — hierarchy
```

### Words that Convert
```
Free, Start, Get, Try, Discover, Build, Ship, Launch, Create, Unlock
Avoid: Submit, Click, Buy now (too aggressive), Learn (too passive)
```

## CTA Placement Rules

1. **Hero section**: primary + secondary side by side. Primary on left (read first in LTR).
2. **One primary per viewport**: multiple primaries = no hierarchy = decision paralysis.
3. **Sticky nav CTA**: smaller version of hero CTA, always visible on scroll.
4. **Final CTA section**: repeat the hero CTA after the reader has seen all the value.
5. **Above the fold**: the hero CTA must be visible without scrolling on desktop AND mobile.

## The Drop Shadow Formula

Premium CTAs cast a colored glow (not generic gray shadow):

```css
/* Use the button's own color at low opacity for the glow */
box-shadow: 0 [Y] [blur] [spread] [brand-color-at-opacity];

/* Concrete values for 48px button: */
box-shadow:
  0 1px 2px rgba(0, 0, 0, 0.06),           /* subtle base shadow */
  0 0 0 0 rgba(99, 102, 241, 0);            /* glow (hidden at rest) */

/* On hover — the glow appears: */
box-shadow:
  0 8px 24px rgba(99, 102, 241, 0.25),      /* brand-colored glow */
  0 2px 8px rgba(0, 0, 0, 0.08);            /* base shadow */
```

## CTA with Icon

Icons inside CTAs add visual weight and guide the eye:

```html
<button class="cta-hero">
  Start building free
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10m-4-4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
</button>
```

```css
.cta-hero svg {
  margin-left: 8px;
  transition: transform 0.2s ease;
}
.cta-hero:hover svg {
  transform: translateX(3px);  /* arrow slides right on hover — delightful */
}
```

## Visual Hierarchy for Multiple CTAs

```
[Hero Section]
  ██████████████████  ← Primary: gradient, 56px, bold      "Start building free →"
  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ← Secondary: outline, 48px, subtle  "Watch demo"

[Pricing Cards]
  Free:        ▒▒▒▒▒▒  ← Secondary outline    "Start free"
  Pro:         ██████  ← Primary gradient      "Upgrade to Pro"
  Enterprise:  ▒▒▒▒▒▒  ← Secondary outline    "Contact sales"

[Final CTA]
  ██████████████████  ← Same primary as hero   "Start building free →"
```
