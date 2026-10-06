---
name: frontend-ui-design
description: Use this skill when the user asks for UI design, page layout, component design, design-system guidance, frontend implementation specs, UI review, or turning brand/design references into executable frontend UI rules. The skill distills useful frontend UI principles from Notion, Google Material Design, Figma, and Airbnb, without copying proprietary assets.
---

# Frontend UI Design Skill

## Purpose

Use this skill to turn vague UI/brand inspiration into a practical frontend UI design plan.

The goal is not to imitate Notion, Google, Figma, or Airbnb visually. The goal is to extract the strongest reusable design ideas:

- **Notion**: content-first structure, block-based composition, progressive disclosure, low-noise editing experience.
- **Google / Material Design**: scalable design system, semantic tokens, accessibility, component states, cross-platform consistency.
- **Figma**: collaborative canvas thinking, design-to-code alignment, components/variants/variables, inspectable implementation details.
- **Airbnb**: trust-building UI, emotionally clear decision paths, visual evidence, service-journey design, business-semantic components.

Use these ideas to produce UI output that frontend engineers can actually build.

---

## When to use

Use this skill for tasks such as:

- Designing a new product page, dashboard, H5 page, admin system, AI product, SaaS tool, marketplace, or workflow UI.
- Reviewing an existing UI and explaining what is unclear, noisy, inconsistent, or hard to implement.
- Converting a brand reference into page layout, components, tokens, interaction states, and engineering notes.
- Creating frontend component specs from product requirements.
- Defining a UI style guide or design-system direction.
- Producing prompts for image/prototype generation where the design must be coherent and frontend-oriented.

Do not use this skill as a pure branding-writing skill. It must produce executable UI decisions.

---

## Core principle

A good frontend UI design is not just a beautiful static screen. It is the alignment of:

1. **User task**: what the user is trying to complete.
2. **Information architecture**: what content is primary, secondary, hidden, or contextual.
3. **Component model**: what reusable UI units exist and what states they support.
4. **Interaction contract**: how the UI responds to input, loading, error, permission, empty, and edge states.
5. **Visual system**: how color, typography, spacing, radius, elevation, iconography, and motion express hierarchy.
6. **Frontend feasibility**: how the design maps to data, props, slots, tokens, responsive rules, and maintainable code.

When these conflict, prioritize task clarity, trust, accessibility, and implementation stability over decorative expression.

---

## Four reference models

### 1. Notion model: content-first composable workspace

Use this when the product is about writing, organizing, researching, planning, knowledge management, task management, AI-generated reports, or flexible information work.

Reusable frontend UI ideas:

- **Content is the interface**: reduce chrome, borders, and heavy decoration. The user should feel they are manipulating content directly.
- **Block-based composition**: represent paragraphs, cards, tables, charts, tasks, callouts, images, and sections as composable blocks.
- **Progressive disclosure**: advanced actions should appear through hover toolbar, slash command, contextual menu, expandable panel, or advanced settings.
- **Editable and readable states should be close**: avoid unnecessary mode switching. Where possible, make content inspectable, editable, and rearrangeable in place.
- **Low visual noise**: use subtle dividers, neutral text hierarchy, restrained color, and spacious layout.

Frontend implementation implications:

- Prefer a data model such as `Block[]` / `Section[]` / `Widget[]` over hard-coded page HTML.
- Components should support recursive/nested rendering where needed.
- Use stable IDs for drag, selection, comments, anchors, and AI references.
- Provide keyboard-first interactions for creation, movement, deletion, and navigation.
- Handle empty blocks, placeholder text, hover-only actions, focused state, and selection state explicitly.

Use Notion thinking for: knowledge base, PRD analysis, AI report builder, document editor, flexible workspace, dashboard with rearrangeable cards.

---

### 2. Google / Material model: scalable system and accessible components

Use this when the product needs consistency, long-term maintainability, multi-page flows, multiple teams, enterprise users, forms, tables, permissions, dashboards, or cross-platform experience.

Reusable frontend UI ideas:

- **Design system first**: define reusable patterns before designing one-off pages.
- **Semantic tokens**: colors, spacing, typography, radius, shadows, and motion should be named by purpose, not by raw value.
- **States are part of the component**: default, hover, focus, active, selected, disabled, loading, success, warning, error, empty, and skeleton states are required.
- **Accessibility is not optional**: keyboard navigation, focus visibility, contrast, label semantics, and screen-reader-friendly structure must be considered.
- **Hierarchy through surface and containment**: use card/surface/elevation/divider/grouping to clarify relationships.
- **Familiar patterns beat novelty**: for high-frequency or high-risk tasks, use stable patterns users already understand.

Frontend implementation implications:

- Use design tokens through CSS variables, theme objects, or framework tokens. Avoid scattering hard-coded values.
- Component APIs should include state props and semantic variants, for example `variant`, `size`, `status`, `loading`, `disabled`, `selected`.
- Use semantic HTML first; add ARIA only when native semantics are insufficient.
- Every interactive component must define keyboard behavior.
- Build page-level layouts from system primitives: `PageShell`, `Section`, `Card`, `Toolbar`, `FilterBar`, `DataTable`, `Form`, `Drawer`, `Modal`, `Toast`, `EmptyState`.

Use Google thinking for: B-end systems, financial systems, insurance systems, admin portals, data dashboards, cross-platform apps, design systems.

---

### 3. Figma model: collaboration, inspectability, and design-to-code alignment

Use this when the product is collaborative, canvas-like, workflow-heavy, or when design and frontend implementation must stay synchronized.

Reusable frontend UI ideas:

- **Canvas first**: keep the primary working area central; put tools, layers, properties, comments, and history around it.
- **Shared context**: the UI should let different roles understand the same object from different perspectives: PM, designer, developer, QA, operations.
- **Components and variants**: repeated UI pieces should map to component variants, not duplicate static blocks.
- **Variables and modes**: themes, density, breakpoint, role, language, and light/dark mode should be represented as controlled variables.
- **Inspectable details**: frontend engineers should be able to see spacing, behavior, data dependencies, state rules, and component mappings.

Frontend implementation implications:

- Design components should map to real code components and props.
- For each component, define: purpose, props, slots, variants, states, events, data contract, accessibility notes, and edge cases.
- Prefer design-token names that can map directly to code names.
- Use comments/annotations for ambiguous logic instead of relying only on visual layout.
- For complex workflow products, provide panels for object properties, history, comments, and review status.

Use Figma thinking for: low-code tools, design tools, workflow builders, AI workbenches, collaborative review systems, PRD analyzers, task orchestration interfaces.

---

### 4. Airbnb model: trust, evidence, and emotionally clear decision-making

Use this when the UI asks users to make a decision under uncertainty, especially around money, risk, service quality, people, travel, insurance, finance, marketplace transactions, or recommendations.

Reusable frontend UI ideas:

- **Trust is a UI layer**: ratings, evidence, source, explanation, verification, policy, risk, and cost breakdown must be visible at decision points.
- **Visual evidence matters**: use photos, previews, screenshots, sample outputs, map, timeline, or proof blocks when users need confidence.
- **Human context reduces anxiety**: explain who/what is behind the service, why a recommendation is made, and what happens next.
- **Decision path should be emotionally clear**: reduce surprise fees, hidden constraints, vague copy, and irreversible actions.
- **Business-semantic components**: use domain components such as `ListingCard`, `PriceBreakdown`, `TrustBadge`, `ReviewSummary`, `PolicyNotice`, `RecommendationReason`, not only generic cards.

Frontend implementation implications:

- Put risk, price, policy, source, and recommendation rationale near the primary action.
- Never bury critical limitations only inside tooltips or footnotes.
- Make comparison states explicit: selected, recommended, unavailable, uncertain, partially matched.
- Use progressive disclosure for details, but keep high-risk information visible before action.
- Provide fallback UI when trust signals are missing: no rating, no evidence, stale data, incomplete source, low confidence.

Use Airbnb thinking for: travel, local service, ecommerce, insurance planning, financial recommendation, AI answer with sources, product recommendation, transaction flows.

---

## Decision framework

Before designing, classify the task with these questions:

1. **What is the user's primary job?** Browse, compare, edit, analyze, approve, configure, monitor, or transact?
2. **What is the cost of a wrong action?** Low, medium, high, financial/legal/compliance risk?
3. **What is the dominant content type?** Text, structured data, cards, media, map, timeline, workflow, generated answer?
4. **Is the product single-player or collaborative?** Solo, team review, multi-role workflow, public marketplace?
5. **Does the user need flexibility or standardization?** Free-form composition or controlled enterprise flow?
6. **What needs to be trusted?** Data source, recommendation, price, policy, identity, operation result, AI reasoning?

Then choose the dominant model:

| Product situation | Dominant model | Supporting models |
| --- | --- | --- |
| Knowledge/document/report/productivity UI | Notion | Google, Figma |
| Enterprise/admin/financial/insurance system | Google | Figma, Notion, Airbnb for trust |
| Collaborative workflow/canvas/review tool | Figma | Google, Notion |
| Marketplace/recommendation/transaction/risk decision | Airbnb | Google, Figma |
| AI product with generated analysis | Notion + Figma | Google for system, Airbnb for trust |

Do not mix all four styles equally. Pick one dominant interaction model and borrow specific strengths from the others.

---

## Required output format

When applying this skill, produce output in this structure unless the user asks for a different format:

### 1. Design positioning

State the product/page type and the dominant UI model.

Example:

> This page should use a Google-style system foundation, Figma-style inspectable workflow, Notion-style content blocks, and Airbnb-style trust explanation around high-risk decisions.

### 2. Page structure

Describe the layout by regions:

- Header / navigation
- Primary work area
- Secondary context panel
- Action area
- Feedback area
- Empty / loading / error states

Avoid vague phrases like “make it clean”. Explain what is primary, secondary, hidden, sticky, collapsible, or contextual.

### 3. Component inventory

List components with business meaning and frontend mapping.

Required fields:

| Component | Purpose | Key props/data | States | Notes |
| --- | --- | --- | --- | --- |

Prefer business-semantic components first, then primitives.

Example components:

- `RiskSummaryCard`
- `EvidenceBlock`
- `RecommendationReason`
- `ComparisonTable`
- `FilterBar`
- `ActionDrawer`
- `EditableSection`
- `SourceCitation`
- `PolicyNotice`
- `ConfidenceTag`

### 4. Visual system direction

Define:

- Color role, not only color value.
- Typography hierarchy.
- Spacing density.
- Radius and elevation rules.
- Icon usage.
- Illustration/photo usage.
- Motion principle.

Use semantic wording:

```text
color.primary: main action and active navigation
color.surface: page/card background
color.text.primary: main reading text
color.text.secondary: metadata and helper text
color.status.warning: risk or incomplete information
radius.card: container grouping
shadow.popover: temporary floating layer
```

### 5. Interaction and state rules

Cover at least:

- Default
- Hover
- Focus
- Active/pressed
- Selected
- Disabled
- Loading/skeleton
- Empty
- Error
- Permission denied
- Unsaved changes
- Long content overflow
- Mobile/narrow screen behavior

### 6. Frontend implementation notes

Include implementation guidance such as:

- Suggested component hierarchy.
- Data model shape.
- Token mapping.
- Responsive breakpoint behavior.
- Accessibility requirements.
- Performance risks.
- Edge cases.

### 7. Acceptance checklist

End with a checklist that can be used by designer, frontend engineer, and product owner.

---

## Frontend component specification template

Use this template for any important component:

```md
## Component: <ComponentName>

### Purpose
What user problem or business object this component represents.

### Usage
Where it appears and when not to use it.

### Props / data contract
- id: stable identifier
- title: primary label
- description: helper text
- status: default | active | disabled | loading | error | warning | success
- variant: default | compact | detailed
- actions: primary/secondary/context actions

### Slots
- header
- body
- footer
- actions
- metadata

### States
- default
- hover
- focus
- selected
- loading
- empty
- error
- disabled

### Accessibility
- keyboard behavior
- focus order
- label/role semantics
- contrast requirements
- screen reader text

### Responsive behavior
- desktop
- tablet
- mobile

### Edge cases
- long title
- missing data
- stale data
- no permission
- partial loading
- network error
```

---

## Page review checklist

Use this checklist when reviewing UI:

### Task clarity

- Is the user's primary task obvious within 3 seconds?
- Is the primary action visually and semantically clear?
- Are secondary actions less dominant but still discoverable?
- Does the page avoid competing focal points?

### Information architecture

- Is content grouped by user decision path, not only by database fields?
- Are high-frequency fields easy to scan?
- Are advanced details progressively disclosed?
- Is long content handled with anchors, tabs, accordions, sticky summaries, or side panels?

### Trust and risk

- Are data source, time, confidence, limitation, policy, cost, or risk shown where needed?
- Are recommendation reasons visible near the recommendation?
- Are destructive or irreversible actions protected by confirmation and clear consequence copy?
- Are unknown or incomplete states explicitly represented?

### Design system consistency

- Are tokens used consistently?
- Are component variants controlled rather than one-off?
- Are status colors used semantically?
- Are spacing and typography rhythm consistent?

### Frontend feasibility

- Can the page be built from reusable components?
- Are data contracts clear?
- Are loading, empty, error, and permission states designed?
- Are responsive rules defined?
- Are accessibility and keyboard interactions covered?

---

## Default recommendations by product type

### B-end / financial / insurance / AI workbench

Use:

- Google model for system consistency and accessibility.
- Figma model for role collaboration and implementation mapping.
- Notion model for report/document/workflow blocks.
- Airbnb model only for trust, risk explanation, recommendation rationale, and decision confidence.

Avoid:

- Overly playful illustration.
- Heavy lifestyle branding.
- Hiding compliance/risk details.
- Purely decorative glassmorphism.
- Too many gradients or noisy shadows.

### Consumer product / travel / marketplace

Use:

- Airbnb model for trust and emotional decision-making.
- Google model for component stability.
- Figma model for design-system handoff.
- Notion model only where users need flexible content organization.

Avoid:

- Cold enterprise dashboards for exploratory browsing.
- Price/risk/policy ambiguity.
- Image-heavy UI without evidence or comparison clarity.

### Productivity / editor / knowledge base

Use:

- Notion model for block composition and low-noise content manipulation.
- Figma model for collaboration and comments.
- Google model for component states and accessibility.
- Airbnb model only when recommendations or external trust signals are involved.

Avoid:

- Too much visible configuration at first glance.
- Complex panels that distract from content.
- Static documents that cannot be rearranged or inspected.

---

## Prompting rules for generated UI images or prototypes

When asked to generate a UI image/prototype prompt, include:

1. Page purpose and target user.
2. Dominant design model.
3. Layout structure with clear regions.
4. Component inventory.
5. Visual system: palette role, typography, spacing, radius, shadow.
6. Interaction hints if the output is HTML/prototype.
7. Content density and hierarchy.
8. Constraints: avoid copying real logos, avoid clutter, avoid fake brand claims.

Example direction:

```text
Create a clean enterprise AI workbench UI using a Google-style design-system foundation, Notion-style document blocks, and Figma-style inspectable right-side properties panel. Use restrained blue/white/gray tones, semantic status tags, clear evidence cards, and visible loading/empty/error states. Do not use Airbnb visual branding; only borrow its trust-explanation pattern for recommendation reasons and source confidence.
```

---

## Hard rules

- Do not claim to replicate Notion, Google, Figma, or Airbnb's proprietary design systems.
- Do not copy logos, icons, exact layouts, brand assets, or protected visual identity.
- Borrow principles, not assets.
- Do not produce only generic adjectives such as “modern, clean, beautiful”. Convert them into concrete layout, component, token, and state decisions.
- Do not ignore accessibility.
- Do not ignore loading, empty, error, permission, and responsive states.
- Do not recommend complex animation unless it helps orientation, causality, or feedback.
- For high-risk domains such as finance, insurance, healthcare, or legal workflows, prioritize clarity, source visibility, policy/risk explanation, and auditability over emotional design.

---

## Concise mental model

- **Notion** answers: how should information be organized and edited?
- **Google** answers: how should the system stay consistent, accessible, and scalable?
- **Figma** answers: how should design and frontend implementation collaborate?
- **Airbnb** answers: why should the user trust this decision and take action?

A strong frontend UI design skill uses all four, but always chooses one dominant model based on the product task.