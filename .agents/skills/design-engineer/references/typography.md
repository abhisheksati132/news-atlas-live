# Typography Reference

## Font Selection by Mood

Don't default to Inter for everything. Pick a font that matches the product's personality.

### Premium Tech / SaaS (Linear, Vercel, Raycast)
```
Heading: Inter or Geist — weight 600-800
Body:    Inter or Geist — weight 400
Why:     geometric precision, surgical clarity, neutral but refined
Google Fonts alternative: Inter (free, variable)
```

### Bold / Confident (Stripe, Notion)
```
Heading: Satoshi, General Sans, or Plus Jakarta Sans — weight 700-800
Body:    Inter or Plus Jakarta Sans — weight 400
Why:     wider letterforms, more personality than Inter, still clean
Google Fonts alternative: Plus Jakarta Sans (free)
```

### Editorial / Premium (WeTransfer, Pitch)
```
Heading: Serif like DM Serif Display, Playfair Display, or Fraunces
Body:    Clean sans like Inter, DM Sans, or Outfit
Why:     serif headings + sans body = instant sophistication
Google Fonts alternative: DM Serif Display + DM Sans (free)
```

### Friendly / Approachable (Slack, Figma)
```
Heading: DM Sans, Outfit, or Nunito — weight 700
Body:    DM Sans, Outfit, or Nunito — weight 400
Why:     rounded letterforms signal warmth and approachability
Google Fonts alternative: DM Sans or Outfit (free)
```

### FinTech / Trust (Revolut, Wise)
```
Heading: Basier Circle, Manrope, or Space Grotesk — weight 600-700
Body:    Same family — weight 400
Why:     geometric but not cold, conveys precision and reliability
Google Fonts alternative: Space Grotesk + Manrope (free)
```

### Minimal / Luxe (Apple, Aesop)
```
Heading: system-ui or SF Pro (on Apple), Instrument Sans
Body:    Same family
Why:     the OS native font says "we're so confident we don't need a custom font"
Google Fonts alternative: Instrument Sans (free)
```

## The Font Pairing Rules

1. **Max two families** — one for headings, one for body. More = visual noise.
2. **If one family, use weight contrast** — 800 heading / 400 body in the same font works beautifully.
3. **Serif heading + sans body** = instant editorial sophistication. Use this for premium/luxury.
4. **Never pair two serifs or two display fonts** — they compete instead of complementing.
5. **Test at real sizes** — a font that looks great at 14px might look wrong at 60px.

## The Type Scale (Concrete Values)

The ratio between your largest and smallest text creates visual drama. This is the single biggest differentiator between template and premium.

### Premium Scale (recommended)
```
Display:    3.75rem  (60px)  — hero headlines only, weight 700-800, tracking -0.03em
            This is the #1 visual upgrade. Most AI uses 36px. Premium uses 60px+.
H1:         3rem     (48px)  — page titles, weight 700, tracking -0.025em
H2:         1.875rem (30px)  — section headings, weight 600, tracking -0.015em
H3:         1.25rem  (20px)  — card titles, weight 600, tracking -0.01em
Body large: 1.125rem (18px)  — lead paragraphs, hero subtext, weight 400
Body:       1rem     (16px)  — standard text, weight 400, line-height 1.6
Small:      0.875rem (14px)  — secondary info, metadata, weight 400
Caption:    0.75rem  (12px)  — labels, timestamps, weight 500, tracking +0.05em, uppercase
```

### Line Heights
```
Display/H1: 1.0 – 1.1  (tight — large text needs less leading)
H2/H3:      1.2 – 1.3
Body:        1.5 – 1.7  (generous — small text needs more leading)
```

### Letter Spacing
```
Display/H1:  -0.025 to -0.03em  (tighten large text — it looks loose otherwise)
Body:         0                   (default tracking)
Caption:     +0.05 to +0.1em     (open small caps / uppercase labels)
```

### Line Length
```
Body text:   36rem (576px) max — 65-75 characters per line
Headings:    can be wider but still benefit from constraint
Hero subtext: 32rem (512px) max — shorter = more impactful
```

## Font Loading Strategy

```html
<!-- Preconnect for speed -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load only the weights you use -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<!-- Or for serif pairing: -->
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">

<!-- Fallback stack -->
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-family: 'DM Serif Display', Georgia, 'Times New Roman', serif;
```

Always include `display=swap` so text renders immediately with fallback, then swaps when the custom font loads.
