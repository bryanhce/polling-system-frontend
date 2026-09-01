# Aethelgard Voice: Frontend Design & UI Guide

## Purpose

This document defines the visual design system, themes, component styling, and responsive layout rules for the Aethelgard Voice frontend.

---

## Visual Direction & Theme

The visual design is a light, playful, fun-bubbly conversation space: rounded cards, soft colored shadows, and clean modern typography.

### Semantic Tokens

Tailwind CSS v4 is the frontend styling system. It is configured with `@tailwindcss/vite`, imported in the global stylesheet, and defines the following semantic design tokens as theme variables (`bg-canvas`, `text-ink`, `border-border`, `bg-primary`, etc.):

| Token | Suggested Value | Purpose |
| :--- | :--- | :--- |
| `--canvas` | `#FFF9ED` | Warm cream application background. |
| `--surface` | `#FFFFFF` | Cards, inputs, and interactive surfaces. |
| `--ink` | `#17213A` | Primary navy text and icons. |
| `--muted-ink` | `#536078` | Supporting text, captions, and hints. |
| `--border` | `#D7DCEA` | Neutral borders and dividers. |
| `--primary` | `#6D3DF2` | Electric-violet primary actions and focus accent. |
| `--secondary` | `#16BFC6` | Aqua accents and informational state. |
| `--danger` | `#D94C5A` | Coral destructive actions and error feedback. |
| `--highlight` | `#FFD85C` | Sunny-yellow decorative highlights. |
| `--success` | `#35B987` | Mint confirmation and live-positive status. |

Never communicate live, closed, success, or error status by color alone. Ensure text and interactive elements meet WCAG AA contrast standards on their respective backgrounds.

---

## Typography, Shape, and Motion

### Typography Scale & Font Pairing
- **Display Font**: Use a rounded expressive display face (**Arial Rounded MT Bold**, **Baloo 2**, or **Fredoka**) for short headings (`h1`, `h2`, cards). Do not use the display face for long body copy or form inputs.
- **Body Font**: Use **Inter** or standard system sans-serif for UI, forms, and body text.
- **Base Size**: Use a base 16 px (`text-base`) body size with comfortable line height (`leading-normal` to `leading-relaxed`).

### Tailwind Styling & Conventions
- **Standard Utilities**: Always prefer standard Tailwind CSS utility classes (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`, etc.).
- **Avoid Arbitrary Numbers**: Do not use arbitrary bracketed values (e.g. `text-[0.98rem]`, `text-[0.8rem]`, `text-[1rem]`). Map sizes to standard Tailwind scale.
- **Custom / Bracketed Values**: Reserve arbitrary values (`-[...]`) strictly for decorative artwork, bespoke box-shadow offsets, or fluid responsive clamp layouts where standard classes cannot achieve the required effect.

### Shapes, Radii & Shadows
- **Corner Radii**: Use 16–24 px (`rounded-2xl` to `rounded-3xl`) for cards, bubbles, and interactive controls.
- **Shadows**: Use low-elevation, offset soft shadows tinted from violet or aqua (`rgba(109,61,242,0.1)` or `rgba(22,191,198,0.1)`) to maintain a playful card-floating aesthetic without muddying text edges.
- **Borders**: Inputs, cards, and modal dialogs maintain clear, subtle borders (`border border-border` or `border-[1.5px]`).

### Motion & Transitions
- Keep transitions subtle and brief (150 ms) for background color, transform, and box-shadow states (e.g. `hover:-translate-y-0.5`).
- Always respect `motion-reduce:transition-none` to eliminate motion for users with reduced-motion preferences.

---

## Layout and Responsive Rules

- **Mobile-First**: Start layouts at 320 px with 16 px (`px-4`) gutters, expanding to 20–32 px (`sm:px-8`, `lg:px-10`) on larger viewports.
- **Touch Targets**: All interactive elements (buttons, inputs, links, close dialog triggers) must maintain a minimum 44 × 44 px touch area.
- **Content Widths**:
  - Centered forms (Landing join card, Create poll form): ~640–780 px max width.
  - Desktop 2-column active poll layout: Max width ~1160 px (`max-w-290`).
- **Desktop Two-Column Split (`lg:` breakpoint)**:
  - Left column (`minmax(0, 0.84fr)`): Sticky question and composer card.
  - Right column (`minmax(0, 1.16fr)`): Anonymous answer feed.
  - Mobile view collapses gracefully to a single vertical column: Question $\rightarrow$ Composer $\rightarrow$ Feed.
- **Text Wrapping & Overflow**: Always use `min-w-0`, `break-words`, `[overflow-wrap:anywhere]`, and `whitespace-pre-wrap` to prevent long unbroken strings from overflowing containers horizontally.

---

## Component Visual Specifications

### 1. Landing Page (`LandingHero`, `ConversationArtwork`, `JoinPollSection`)
- **`LandingHero`**: Bold display heading with electric-violet emphasis, concise value proposition, and a prominent primary CTA button with hover elevation.
- **`ConversationArtwork`**: Decorative CSS speech bubbles, floating orbit rings, and spark elements (`✦`) hidden from assistive technology (`aria-hidden="true"`).
- **`JoinPollSection`**: Rounded bubble card with aqua shadow accent, rotated arrow badge, clear label, input field, and high-contrast join action button.

### 2. Create Poll Page (`CreatePollIntroduction`, `CreatePollForm`, `PollTextarea`)
- **`CreatePollIntroduction`**: Centered display title with uppercase "New poll" eyebrow tag.
- **`PollTextarea`**: Reusable labeled textarea with character count indicator (`0/500`, `0/2000`), clear focus outline (`outline-3 outline-primary outline-offset-3`), and inline error alert.

### 3. Active Poll Page (`QuestionCard`, `LiveStatus`, `AnswerComposer`, `AnswerFeed`, `AnswerListItem`)
- **`QuestionCard`**: Floating white card with violet drop shadow, display question title, optional scrollable description, live status badge, and copy-link button.
- **`LiveStatus`**: Rounded pill badge with distinct color and non-color text indicator ("Live" in mint with green dot / "Closed" in neutral slate).
- **`AnswerComposer`**: Input section with character limit hint, keyboard submit indicator, and disabled state styling during submission.
- **`SubmittedAnswerConfirmation`**: Soft mint confirmation bubble with positive check indicator, replacing the composer after response submission.
- **`AnswerFeed`**: Newest-first answer feed with header ("Anonymous answers" and voice count badge) and smooth scrolling.
- **`AnswerListItem`**: Dedicated answer card with `max-h-48`, `overflow-y-auto`, `break-words`, and `whitespace-pre-wrap` to support multi-line responses and prevent horizontal overflow.
- **`ClosePollDialog`**: Accessible modal dialog with backdrop blur, irreversible warning label in danger coral, and distinct Cancel vs. Destructive action buttons.
- **`EmptyState`**: Dashed border card with playful spark icon and friendly message when no answers have been submitted yet.

---

## Accessibility & Interaction Guidelines

- **Semantic HTML**: One `h1` per page, logical heading hierarchy (`h1` $\rightarrow$ `h2`), and proper landmark regions (`<main>`, `<section>`, `<dialog>`).
- **Focus Indicators**: Consistent 3 px outline in primary violet (`outline-3 outline-primary outline-offset-3`) on `:focus-visible`.
- **Form Association**: Every field and textarea must be explicitly associated with a visible `<label>` via `htmlFor`/`id` and linked to helper/error text with `aria-describedby`.
- **Live Regions**: Announce dynamic updates (e.g. answer submission success, live counts) using `aria-live="polite"`.
- **Dialog Accessibility**: Modal dialogs must trap focus when open and restore focus to trigger buttons on dismissal.
