PR Title: Phase 5/6 Rollout — Premium 3D UI, DX, CI, Docker & K8s

Summary
- End-to-end rollout delivering performance, accessibility, 3D UI polish, Storybook UI catalog, Lighthouse CI, and production-ready deployment paths (Docker & Kubernetes).

What changed (highlights)
- 3D visuals and depth
  - 3D tilt wrapper for main sections (ThreeDTilt.jsx)
  - Parallax background layers for depth (ParallaxBackground.jsx)
  - Rotating 3D globe in the hero (Globe3D.jsx)
  - All content wrapped in a 3D tilt container for a consistent premium feel

- Data Visualization (Phase 2 polish)
  - GDP sparklines for USA, IND, GBR, JPN, CHN (multi-country view)
  - FX rates shown as chips (EUR, GBP, JPY, INR, CNY)
  - Top-5 crypto dashboard with price and 24h change
  - Data-fetching endpoints: api/economics.js; UI hooks: useEconomicsData.js; DataVizPanel.jsx

- UI/UX polish
  - Amber accents on CTAs and header glow
  - Apple-glass surfaces across major components
  - Skip-to-content and enhanced focus outlines
  - Inline critical CSS for faster first paint

- Developer Experience (DX)
  - Storybook: full coverage for Button, Card, GlassPanel, DataVizPanel, and DataViz variants
  - DocsGallery: in-app preview of UI blocks
  - verify-live.js: quick post-start checks
  - Type-safe-ish: memoized components for lower re-renders

- Deployment & Ops (Phase 4)
  - Docker: Dockerfile.api, Dockerfile.frontend, docker-compose.yml
  - Kubernetes: namespace + api/frontend deployments, services, and ingress
  - Lighthouse CI: integrated with a11y checks

- Documentation
  - README updated with new stack and Phase plan
  - PR_NOTES.md augmented with full phase rollup, rollout plan, and testing steps

How to run (all-in-one flow)
- Local dev: npm ci; npm run dev
- Storybook: npm run storybook (or access at http://localhost:6006)
- Docker: docker-compose up --build -d
- Kubernetes: kubectl apply -f kubernetes/
- Lighthouse: See GH Actions LH results or run lhci locally against http://localhost:5173

What to verify (step-by-step)
- 3D visuals: hover tilt on hero and key sections; parallax depth should respond to mouse
- GDP FX Crypto: verify the Data Viz panel shows multi-country GDP sparklines and FX/crypto figures
- Accessibility: skip link focus, ARIA attributes on controls, keyboard navigation
- Performance: observe X-Response-Time header, ensure lazy-loaded components don’t block initial render
- SEO: meta, OG, canonical are visible in page head

Recommended rollout approach
- Stage canaries in a staging environment, then progressive production rollout via feature flags (e.g., 3D tilt toggle, data viz modes)
- Monitor Lighthouse scores and a11y checks in CI; adjust thresholds as you refine visuals
- Maintain a design notes doc for tokens, spacing, typography, and component patterns (DesignNotes_v5+)

Risks and mitigations
- 3D tilt on mobile devices: disabled by hover detection; ensure a11y fallback is accessible
- Data latency: caching and lazy loading to ensure smooth UX; add retry/backoff for data fetches
- CVS/storage: ensure assets and fonts load with proper preconnect hints, not blocking rendering

Rollout plan (high level)
- Phase 5: Feature flags for 3D visuals and data viz depth; rollout to staging, then production
- Phase 6: Full automation with E2E tests, visual diffs, and TLS/secure deployment
- Phase 7: Optimize for accessibility scores to achieve higher Lighthouse grades

Patch authorship
- OpenCode (you) with AI-assisted scaffolding
