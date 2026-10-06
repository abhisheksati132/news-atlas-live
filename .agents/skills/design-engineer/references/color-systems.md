# Color Systems Reference

## Building a Color Atmosphere

The difference between AI output and professional design isn't the color choice — it's the **color system**. A professional designs a coordinated world where every surface, glow, shadow, and accent belongs together. AI picks "a blue."

## Step 1: Choose One Brand Color

Everything derives from this single choice.

| Product Type | Recommended Hue | Example | Why |
|-------------|-----------------|---------|-----|
| SaaS / Tech | Indigo, Blue | `#6366f1` | Trust + innovation |
| Creative / Design | Purple, Violet | `#8b5cf6` | Creativity + premium |
| Health / Wellness | Emerald, Teal | `#10b981` | Growth + calm |
| Finance / FinTech | Blue, Cyan | `#0ea5e9` | Trust + precision |
| E-commerce | Orange, Amber | `#f59e0b` | Energy + urgency |
| Social / Community | Pink, Rose | `#ec4899` | Warmth + engagement |
| Enterprise / B2B | Slate Blue | `#6366f1` | Authority + reliability |
| Education | Teal, Green | `#14b8a6` | Growth + knowledge |

## Step 2: Derive the Full Palette from One Color

Given brand color `#6366f1` (indigo), derive:

```css
/* Primary brand scale */
--brand-50:  #eef2ff;    /* tinted backgrounds, selected states */
--brand-100: #e0e7ff;    /* hover backgrounds */
--brand-200: #c7d2fe;    /* borders on brand elements */
--brand-300: #a5b4fc;    /* less prominent brand elements */
--brand-400: #818cf8;    /* icons, secondary brand */
--brand-500: #6366f1;    /* THE brand color — CTAs, links, active states */
--brand-600: #4f46e5;    /* hover on primary CTA */
--brand-700: #4338ca;    /* active/pressed CTA */
--brand-800: #3730a3;    /* dark brand surfaces */
--brand-900: #312e81;    /* darkest brand */

/* Functional shortcuts */
--brand:        var(--brand-500);
--brand-hover:  var(--brand-600);
--brand-active: var(--brand-700);
--brand-subtle: rgba(99, 102, 241, 0.1);    /* tinted background */
--brand-glow:   rgba(99, 102, 241, 0.15);   /* ambient light */
--brand-ring:   rgba(99, 102, 241, 0.4);    /* focus ring */
```

**The rule**: For hover, go 1 step darker (500 → 600). For active/press, go 2 steps (500 → 700). For subtle backgrounds, use the brand at 10% opacity.

## Step 3: Build the Neutral Scale

### Dark Theme — Zinc Scale (Recommended)
```css
--gray-50:  #fafafa;     /* primary text */
--gray-100: #f4f4f5;
--gray-200: #e4e4e7;
--gray-300: #d4d4d8;
--gray-400: #a1a1aa;     /* secondary text */
--gray-500: #71717a;     /* tertiary text, placeholders */
--gray-600: #52525b;
--gray-700: #3f3f46;
--gray-800: #27272a;     /* raised surfaces */
--gray-900: #18181b;     /* default surface */
--gray-950: #09090b;     /* page background */
```

### Light Theme — Same Scale, Inverted Usage
```css
/* background: lightest → darkest for elevation */
--bg-primary:  #fafafa;   /* page bg — warm off-white, NEVER #fff */
--bg-surface:  #ffffff;   /* cards, panels */
--bg-raised:   #f4f4f5;   /* recessed areas, code blocks */

/* text: darkest → lightest for hierarchy */
--text-primary:   #18181b;  /* headings, body */
--text-secondary: #71717a;  /* subtitles, meta */
--text-tertiary:  #a1a1aa;  /* captions, disabled */
```

## Step 4: Semantic Colors

Every interface needs success, warning, error, and info states. Here's a complete set that works on both themes:

```css
/* Success — green */
--success:        #22c55e;
--success-subtle: rgba(34, 197, 94, 0.1);
--success-text:   #16a34a;   /* light theme text */
--success-border: rgba(34, 197, 94, 0.3);

/* Warning — amber */
--warning:        #f59e0b;
--warning-subtle: rgba(245, 158, 11, 0.1);
--warning-text:   #d97706;
--warning-border: rgba(245, 158, 11, 0.3);

/* Error — red */
--error:          #ef4444;
--error-subtle:   rgba(239, 68, 68, 0.1);
--error-text:     #dc2626;
--error-border:   rgba(239, 68, 68, 0.3);

/* Info — blue */
--info:           #3b82f6;
--info-subtle:    rgba(59, 130, 246, 0.1);
--info-text:      #2563eb;
--info-border:    rgba(59, 130, 246, 0.3);
```

**Usage pattern for status messages:**
```css
.alert-error {
  background: var(--error-subtle);
  border: 1px solid var(--error-border);
  color: var(--error-text);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.875rem;
}
```

## The 60-30-10 Rule in Practice

```
60% — Neutral background (--bg-primary, --bg-surface)
      This is the canvas. It should be calm and unnoticeable.

30% — Text and surfaces (--text-primary, --text-secondary, --bg-raised)
      This is the content layer. It carries information.

10% — Brand accent (--brand, --brand-subtle, --brand-glow)
      This is the star. CTAs, active states, key highlights.
      Because it's rare, it's powerful.
```

**Common mistake**: Using brand color on too many elements. If everything is purple, nothing is highlighted. Brand color should appear on:
- Primary CTAs
- Active navigation states
- Key data highlights
- Focus rings
- One or two text accents (badge, link)

## Dark Theme: Elevation = Lighter

This is counterintuitive but critical. In dark mode, higher surfaces are **lighter**, not darker:

```
Layer 0 (page):    #09090b  ← darkest
Layer 1 (surface): #18181b  ← slightly lighter
Layer 2 (card):    #27272a  ← lighter still
Layer 3 (popup):   #3f3f46  ← lightest
```

Shadows in dark mode should be near-black (`rgba(0,0,0,0.5)`), not gray. The lightness of the surface itself creates the elevation feeling.

## Light Theme: Elevation = Shadow

In light mode, higher surfaces get **shadows**, not different background colors:

```
Layer 0 (page):    #fafafa + no shadow
Layer 1 (surface): #ffffff + shadow-sm (0 1px 3px rgba(0,0,0,0.04))
Layer 2 (card):    #ffffff + shadow-md (0 4px 12px rgba(0,0,0,0.06))
Layer 3 (popup):   #ffffff + shadow-lg (0 8px 24px rgba(0,0,0,0.08))
```

## Gradient Recipes

### Hero Ambient Glow (Dark)
```css
background-image:
  radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent),
  radial-gradient(ellipse 60% 40% at 80% 50%, rgba(168, 85, 247, 0.08), transparent);
```

### CTA Gradient
```css
background: linear-gradient(135deg, var(--brand-500), var(--brand-400));
/* Or with secondary color: */
background: linear-gradient(135deg, #6366f1, #8b5cf6);
```

### Gradient Border (for featured cards)
```css
.card-featured::before {
  content: '';
  position: absolute; inset: -1px;
  border-radius: inherit; padding: 1px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

### Text Gradient
```css
background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

## Quick Color Palette Generator

If you need to derive a full palette from any hex color, use these rules:

1. **Subtle bg**: brand at 10% opacity → `rgba(R, G, B, 0.1)`
2. **Glow**: brand at 15% opacity → `rgba(R, G, B, 0.15)`
3. **Hover**: darken 8% (mix with black)
4. **Active**: darken 15%
5. **Ring/focus**: brand at 40% opacity
6. **Border accent**: brand at 30% opacity

This works for ANY color. You don't need a full 50-900 scale — just these 6 derivatives cover 95% of UI needs.
