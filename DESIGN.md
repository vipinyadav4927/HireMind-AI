# Design Brief

## Direction

Neutral Professional — A sophisticated, trust-building dual-persona platform separating Admin analytics from Candidate interview focus.

## Tone

Refined minimalism without coldness: high professionalism, careful whitespace, muted intentional colors. Enterprise SaaS clarity (Linear/Notion tier).

## Differentiation

Dual visual personalities: Admin sees data-heavy charts/tables/insights; Candidate sees only the interview (full-viewport, distraction-free). Same system, two worlds.

## Color Palette

| Token           | OKLCH         | Role                                   |
| --------------- | ------------- | -------------------------------------- |
| background      | 0.145 0.014 260 | Dark charcoal base, cool neutral       |
| foreground      | 0.95 0.01 260 | Nearly white text, high contrast       |
| card            | 0.18 0.014 260 | Elevated surface for content blocks    |
| primary         | 0.75 0.15 190 | Teal accent, trustworthy, interactive |
| secondary       | 0.22 0.02 260 | Subtle muted layer for inactive state |
| muted           | 0.22 0.02 260 | Background for secondary content       |
| accent          | 0.75 0.15 190 | Same as primary, consistency           |
| destructive     | 0.55 0.2 25   | Red for warnings, tab-switch alerts   |
| border          | 0.28 0.02 260 | Subtle borders, dividers               |
| chart-1         | 0.65 0.18 190 | Teal for analytics                     |
| chart-2         | 0.58 0.16 150 | Jade for secondary metrics             |
| chart-3         | 0.7 0.14 85   | Gold for tertiary data                 |
| chart-4         | 0.52 0.14 305 | Magenta for category contrast          |
| chart-5         | 0.68 0.15 50  | Warm orange for highlight              |

## Typography

- Display: **Space Grotesk** — Modern, confident, geometric sans-serif. Used for hero text, section headers, large UI elements.
- Body: **DM Sans** — Refined clarity, excellent readability. Used for paragraphs, labels, form inputs, interview questions.
- Mono: **JetBrains Mono** — Data display, code snippets, timestamps in admin analytics.
- Scale: Hero `text-5xl md:text-7xl font-bold`, H2 `text-3xl md:text-5xl`, Label `text-sm font-semibold tracking-widest`, Body `text-base md:text-lg`.

## Elevation & Depth

Subtle shadow hierarchy without glow: cards elevated via `shadow-card` (4px blur), modals via `shadow-elevated` (12px blur), quiet elements via `shadow-subtle` (1px blur). Depth through layering, not opacity/glass.

## Structural Zones

| Zone          | Background    | Border              | Notes                                             |
| ------------- | ------------- | ------------------- | ------------------------------------------------- |
| Header        | card          | border-b            | Admin: compact nav; Candidate: invisible/minimal |
| Sidebar       | sidebar       | sidebar-border      | Admin only; clean vertical navigation            |
| Content       | background    | —                   | Main viewport, alternate card layers             |
| Section       | card (alt)    | border              | Data blocks, question panels, result cards       |
| Footer        | muted/15%     | border-t            | Subtle, low visual weight                        |
| Interview Q   | card elevated | —                   | Full-viewport focus, centered, spacious padding  |

## Spacing & Rhythm

Spacious rhythm (16px base unit): 16px gaps between sections, 8px micro-spacing within components. Admin uses dense 2-column grids; Candidate uses centered single-column with maximum 800px width for reading comfort.

## Component Patterns

- **Buttons**: Rounded `rounded-lg`, teal primary `bg-primary text-primary-foreground`, hover state `hover:opacity-90 transition-smooth`, secondary variant `bg-secondary text-secondary-foreground`.
- **Cards**: `rounded-lg shadow-card` with `p-6` padding, `bg-card` background. Alternate sections use `bg-muted/15` for rhythm.
- **Badges**: Small uppercase labels `text-xs font-semibold tracking-widest`, rounded-full, semantic color (primary/secondary/destructive).
- **Input**: `border border-input rounded-lg px-4 py-2 bg-input`, focus ring `focus-visible:ring-2 ring-primary`, placeholder text `text-muted-foreground`.

## Motion

- **Entrance**: Fade-in 0.3s smooth easing for modals, overlays; slide-in from right for sidebar on mobile.
- **Hover**: Button color shift + `transition-smooth` for all interactive elements; question cards subtle lift on hover in admin mode.
- **Decorative**: None; movement is functional only. No bouncing, no auto-play animations.

## Constraints

- **No full-page gradients**; depth via layered surfaces and borders only.
- **Teal primary sparingly** — accent only active states, CTAs, highlights; never background fill.
- **One font pair maximum** — Space Grotesk + DM Sans throughout; JetBrains Mono for data only.
- **Dark mode only** — no light mode variant.

## Signature Detail

Dual-flow UI design: same system renders two completely different visual hierarchies depending on user role (Admin vs. Candidate), achieved through conditional component rendering and spacious interview viewport that eliminates distraction. Professional HR aesthetic meets distraction-free interview zen.
