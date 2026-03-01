NewsAtlas Design Notes

Purpose
- Provide visual polish and a cohesive design system for the NewsAtlas UI.
- Establish typography, color tokens, and reusable component styling to ensure consistency as the app grows.

Typography
- Headings: Syne (Bold, geometric, techy feel).
- Body/Code: JetBrains Mono for code-like UI elements; system-ui for body text.
- Font loading: Use Google Fonts for Syne and JetBrains Mono where applicable.

Color System (CSS Variables)
- Core tokens defined in public/css/design.css:
- --bg: primary background color
- --text: primary text color
- --primary: primary accent color (blue)
- --secondary: secondary accent color (cyan)
- --emerald, --amber: accent colors for status indicators
- Glass surfaces use rgba white overlays for a glassy effect.

Components and Surfaces
- Cards: .feat-card uses translucent background, rounded corners, subtle borders, and elevation on hover.
- Buttons: .cta-btn and .sec-btn share a consistent gradient, rounded shape, and hover lift.
- Focus: Visible focus outline for accessibility.

Dark Theme
- Introduced via data-theme attribute on the root element; defaults to light mode.
- Dark overrides defined in the CSS under [data-theme="dark"] (colors tweaked for readability).
- How to switch: click Theme button in the header; state is stored in localStorage as 'newsatlas-theme'.

Usage Guidelines
- Reuse components and CSS tokens to keep visuals consistent.
- Prefer glassy panels with subtle borders for depth without reducing contrast.
- When introducing new UI sections, align typography, spacing, and color to the tokens above.

Next steps (optional)
- Add a small UI scale/spacing system to unify spacing tokens (e.g., spacing scale 0-6).
- Create a UI component library (buttons, cards, chips) with a couple of predefined variants.
- Add a design README.md in the UI folder for developers.
