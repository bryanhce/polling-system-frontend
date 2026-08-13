# Aethelgard Voice: Frontend Design

## Purpose and scope

This document defines the mobile-first user experience for the MVP polling
frontend. It supports one open-ended answer per poll experience:

1. Enter the product.
2. Create a poll or join an existing one.
3. Submit an answer.
4. Watch the anonymized answer feed update.
5. Close a poll when authorised to do so.

The first release is deliberately narrow. Authentication screens, user
management, search, sharing workflows, analytics, and a poll dashboard are out
of scope. Poll types other than open-ended text are also out of scope.

The source system design is [`../polling-system/SDD.md`](../polling-system/SDD.md).
Where this document describes live updates or viewer ownership/answer status,
the backend contract needs to supply that information; see [API contract and
state mapping](#api-contract-and-state-mapping).

## Product principles

- **Fast to participate.** A visitor should understand the question and reach
  the answer field without needing to learn the product.
- **Results stay visible.** Participants can see the live conversation before
  and after responding.
- **Friendly but clear.** The interface is playful, never ambiguous about
  whether a poll is open, an answer was accepted, or an action failed.
- **One task per screen.** Creation is a focused composer; participation puts
  the question, answer action, and feed in a predictable order.
- **Accessible by default.** The same meaningful actions work with touch,
  keyboard, screen reader, and at a 320 px viewport width.

## Information architecture and routes

| Route | Screen | Primary user goal |
| --- | --- | --- |
| `/` | Landing | Create a poll or enter a poll ID/link. |
| `/polls/new` | Create poll | Compose and launch an open-ended poll. |
| `/polls/:pollId` | Active or closed poll | Read the question, answer when open, and view results. |

Creating a poll navigates directly to `/polls/:pollId`. The route is also the
canonical destination for a joined poll and preserves the final results after a
poll has closed.

## Page specifications

### Landing page

The landing page gives equal visibility to creation and joining while making
creation the first action on small screens.

- `AppShell` contains a compact wordmark that links to `/`, a main landmark,
  and a simple footer only when useful.
- `LandingHero` presents the product name, a short promise such as “Ask one
  good question. Hear every voice.”, and one expressive illustration made from
  CSS shapes/dots rather than essential content.
- The primary, full-width mobile CTA is **Create a poll** and links to
  `/polls/new`.
- `JoinPollForm` follows in its own bubble card. It accepts a poll ID or a
  complete poll URL, normalises a pasted URL to its ID, and routes to the
  matching poll on submit.
- Invalid or empty input receives inline form feedback; a not-found response
  is shown on the destination route, not guessed on the landing page.

At tablet and desktop widths, the hero and join card may sit side by side. The
creation CTA remains visually primary and both paths retain 44 px minimum
controls.

### Create poll page

`PollComposer` is a single, centered form with a maximum readable line length.
It contains:

- A “New poll” eyebrow and concise instruction.
- Required **Question** textarea, with visible required indicator and live
  character count/guidance.
- Optional **Description** textarea, labelled as supporting context.
- Inline field errors connected with `aria-describedby`; submission stays on
  the page until all validation passes.
- A full-width **Launch poll** primary button on mobile. While submitting, it
  is disabled, retains its label context (“Launching poll…”), and prevents
  duplicate requests.

On a successful create response, navigate to the returned poll ID immediately.
For a network or server failure, retain entered text and show a non-technical
error message with a retry action.

### Active poll page

The poll page begins with a `PollHeader` and `QuestionCard`:

- The question is the page `h1`; description is rendered only when supplied.
- `LiveStatus` announces **Live** with a non-colour status indicator, while
  `PollMeta` shows the answer count.
- Copy describes the feed as anonymized; do not fabricate names, avatars, or
  individual identity metadata.

For a participant who has not answered, place `AnswerComposer` immediately
below the question on mobile, before the feed. The composer includes a labelled
textarea, answer-length guidance, and **Send answer**. The send button is
disabled only for invalid/empty input or an in-flight request; errors are
inline and announced via a polite live region.

For an owner, show a secondary/destructive **Close poll** action near the
poll status. It opens `ClosePollDialog`; it must not be the only way to learn
the current state. The owner continues to see the feed and does not need an
answer composer unless the product expressly permits creator participation.
This MVP assumes the creator is an observer/owner, not a participant.

On wider screens (from approximately 1024 px, only when the layout has room),
use a two-column grid: a sticky left context/action column and a right results
column. On smaller widths, collapse to one column in this order: question,
action or composer, results. Do not make key actions depend on reaching the
end of a long feed.

### Submitted-answer state

After a successful answer, replace—not merely disable—the composer with a mint
confirmation bubble: “Answer sent — thanks for adding your voice.” Keep the
question, live status, answer count, and feed in place. Move focus to the
confirmation only when submission was initiated with the keyboard; otherwise
leave focus stable and announce success in the live region.

If the API reports an existing answer, present the same locked layout with
copy such as “You have already shared an answer for this poll.” Do not reveal
or imply an identity in the feed.

### Closed-poll page

The same route renders a closed state when `status` is `closed` or when a close
operation succeeds. Preserve the question, description, final count, and
answer feed. Replace the live badge with a clearly labelled **Closed** badge,
remove answer controls, and display a neutral final-results message. Include a
prominent **Create a poll** or **Back home** CTA. No countdown, reconnect
indicator, or answer-submit control is shown.

## Supporting and failure states

All states use a reusable `EmptyState` shell with a meaningful heading, short
explanation, and an available next action.

| Situation | UI treatment | Next action |
| --- | --- | --- |
| Initial poll load | Question card and feed skeletons; announce loading once. | None required. |
| Initial answers load | Keep loaded poll header visible; show feed skeleton rows. | None required. |
| Empty active results | Friendly empty feed bubble: “No answers yet. Be the first to chime in.” | Answer when eligible. |
| Feed reconnecting | Keep existing answers visible; compact “Reconnecting live updates…” status. | Automatic retry; manual refresh if retry fails. |
| Poll not found (`404`) | “We couldn’t find that poll.” | Go home or enter another ID. |
| Answer already recorded (`409`) | Submitted/locked state, not a generic error. | Continue reading results. |
| Poll closes before submit (`403` or a refreshed closed status) | Remove composer, show “This poll just closed.” | View final results or go home. |
| Forbidden close (`403`) | Keep poll open UI; toast and inline action feedback: “Only this poll’s creator can close it.” | Continue viewing. |
| Close conflicts (`409`) | Refresh or transition to closed state: “This poll was already closed.” | View final results. |
| Close/poll resource missing (`404`) | Poll-not-found state after revalidation. | Go home. |
| Answer/create network error | Preserve text, show inline error and retry. | Retry submission. |
| Unexpected server error | Calm error state without exposing implementation detail. | Retry or go home. |

## Component system

Build the page-specific screens from the following reusable pieces:

| Component | Responsibility |
| --- | --- |
| `AppShell` | Page canvas, landmarks, responsive content widths, decorative background. |
| `LandingHero` | Product promise, artwork, and creation CTA. |
| `JoinPollForm` | Poll ID/link parsing, validation, and navigation. |
| `PollComposer` | Question/description fields, counters, validation, and creation submission. |
| `PollHeader` | Page heading, owner controls, state/status, and metadata composition. |
| `QuestionCard` | Question and optional description in the primary reading surface. |
| `AnswerComposer` | Answer field, count/guidance, submission lifecycle, and local errors. |
| `AnswerFeed` | Newest-first, anonymized answer rows; loading, empty, and reconnect states. |
| `LiveStatus` | Text plus visual status indicator for live, reconnecting, and closed. |
| `PollMeta` | Answer count and secondary poll information. |
| `ClosePollDialog` | Destructive-action confirmation and close request lifecycle. |
| `EmptyState` | Not found, empty results, and recoverable failure layouts. |
| Feedback primitives | Toast/sonner for transient feedback, inline alert for actionable errors, skeletons for loading. |

Use shadcn/ui components backed by Radix primitives and style them in the
product theme: `Button`, `Card`, `Input`, `Textarea`, `Badge`, `AlertDialog`,
`Tooltip`, `Skeleton`, `Toast`/Sonner, and `ScrollArea`. Native semantics remain
the source of truth; wrappers must not remove labels, focus handling, or dialog
behaviour supplied by the primitives.

## Visual direction

The interface is a light, fun-bubbly conversation space: rounded cards, soft
coloured shadows, and sparse decorative dots, squiggles, or bubbles around the
edges. Decoration is hidden from assistive technology and never overlaps
content or reduces contrast.

### Semantic tokens

Implement tokens as CSS custom properties consumed by Tailwind CSS v4 theme
utilities. These values are a starting palette and must be contrast-checked in
their final text/background pairing.

| Token | Suggested value | Use |
| --- | --- | --- |
| `--canvas` | `#FFF9ED` | Warm cream application background. |
| `--surface` | `#FFFFFF` | Cards and inputs. |
| `--ink` | `#17213A` | Primary navy text and icons. |
| `--muted-ink` | `#536078` | Supporting text. |
| `--border` | `#D7DCEA` | Neutral borders and separators. |
| `--primary` | `#6D3DF2` | Electric-violet primary actions and focus accent. |
| `--secondary` | `#16BFC6` | Aqua accents and informational state. |
| `--danger` | `#D94C5A` | Coral destructive actions and errors. |
| `--highlight` | `#FFD85C` | Sunny-yellow decorative highlight. |
| `--success` | `#35B987` | Mint confirmation and live-positive state. |

Never communicate live, closed, success, or error status by colour alone.
Violet or coral buttons must have text/icon contrast that meets WCAG AA; body
text uses ink or muted ink on a light surface rather than coloured text on
cream.

### Type, shape, and motion

- Pair a rounded expressive display face (for example, **Baloo 2** or
  **Fredoka**) for short headings with **Inter**, **Atkinson Hyperlegible**, or
  another highly legible sans-serif for UI/body text. Do not use the display
  face for long copy or form inputs.
- Use a base 16 px body size and a compact, responsive heading scale. Preserve
  comfortable line height for questions and answers.
- Use 16–24 px corner radii for cards and controls. Buttons and inputs retain
  unmistakable borders or shadows in every state.
- Use low-elevation, offset soft shadows tinted from violet/aqua at low
  opacity; avoid depth that muddies text edges.
- Limit transitions to brief opacity, colour, and small transform changes.
  Respect `prefers-reduced-motion: reduce` by removing non-essential movement.

## Layout and responsive rules

- Start at 320 px with 16 px gutters; increase to 20 px when available.
- Give touch controls a minimum 44 × 44 px interactive area, including icon
  buttons and close-dialog controls.
- Use a centered content column around 640–720 px for landing forms, creation,
  and participant flow. A page maximum around 1120–1200 px supports the
  desktop owner/results layout.
- Permit an internal `ScrollArea` only for intentionally bounded desktop result
  panels. On mobile, use normal document scrolling so content and focus remain
  predictable.
- Use `min-width: 0`, wrapping labels, and responsive type to prevent long
  questions or answers from causing horizontal scrolling.
- Do not rely on hover. Hover may enrich desktop affordances but cannot reveal
  controls, instructions, status, or confirmation unavailable to touch users.

## Interaction and accessibility requirements

- Use one `h1` per page and logical heading hierarchy for results sections.
- Associate every input and textarea with a persistent visible label; do not
  use placeholder text as its label.
- Show a 2 px or stronger visible `:focus-visible` ring using the primary token
  with sufficient contrast on both canvas and surfaces.
- Surface validation errors next to their fields, link them with
  `aria-describedby`, and use `aria-invalid` when invalid.
- Announce answer counts and incoming feed updates politely without interrupting
  typing. Batch live announcements (for example, “3 new answers”) rather than
  reading each incoming answer automatically.
- `ClosePollDialog` has an explicit title, clear irreversible-action copy,
  **Cancel** as the least destructive default, focus trapping while open, and
  focus restoration to the trigger on dismissal.
- Feed items remain readable in newest-first visual and DOM order. Do not
  silently move keyboard focus when new answers arrive.
- Test keyboard-only operation, screen-reader names/status, 200% zoom, and
  320 px, tablet, and desktop widths before release.

## API contract and state mapping

The current SDD defines the following endpoints:

| User action | Endpoint | Frontend behaviour |
| --- | --- | --- |
| Create a poll | `POST /api/v1/polls` | Submit question and optional description; on `201`, route to `/polls/:pollId`. |
| Read poll | `GET /api/v1/polls/:pollId` | Load question, description, and `active`/`closed` status; `404` renders not found. |
| Load answers | `GET /api/v1/polls/:pollId/answers?limit=&offset=` | Render newest-first feed when the response is ordered that way; otherwise request/contract a descending order. |
| Submit answer | `POST /api/v1/polls/:pollId/answers` | On `201`, lock the composer for this client session and refresh/insert the answer. `403` transitions to closed-before-submit; `404` is not found. |
| Close poll | `PATCH /api/v1/polls/:pollId/close` | After confirmation, transition to closed on `200`; use explicit `404`/`409` feedback. |

### Required additions for the planned experience

The SDD currently states that duplicate answers are not prevented and its poll
response contains no viewer role. The following are required before the UI can
truthfully implement the owner-only and already-answered states in this design:

- A reliable viewer identity mechanism (auth, signed participant token, or
  equivalent) and a `viewer`/permissions field on poll detail, for example
  `isCreator` and `hasAnswered`.
- Server enforcement that returns `409 Conflict` for a duplicate answer by the
  same viewer. Client-side locking alone is only a convenience and cannot
  enforce the rule.
- A `403 Forbidden` response for a close request made by a non-creator. The
  current SDD only documents `200`, `404`, and `409` for close.
- Answer count in poll detail or an answer-list pagination response. The
  frontend should not infer a total from one page of results.
- An SSE endpoint and event schema for real-time delivery, for example
  `GET /api/v1/polls/:pollId/events` emitting `answer.created` with an
  anonymized answer and total count, plus `poll.closed` with final count.

Until those additions are available, hide owner-only controls unless the app
has a trustworthy ownership signal, do not claim a person can answer only once,
and use a refresh action or bounded polling instead of presenting a live feed.

### SSE lifecycle

When the SSE contract is available:

1. Load poll detail and the first answer page before opening the stream.
2. Connect while the poll is active; expose a compact reconnecting state when
   disconnected without clearing loaded results.
3. Deduplicate events by answer ID, prepend new answers, and replace the count
   with the server-provided total.
4. On `poll.closed`, close the connection and immediately render the closed
   state.
5. On repeated reconnect failure, preserve the feed and offer manual refresh;
   retry using a capped, jittered backoff.

## Delivery checklist

- [ ] All components use the semantic token system and Tailwind v4 utilities.
- [ ] Create, join, active, submitted, closed, loading, empty, not-found,
  already-answered, forbidden-close, closed-before-submit, and recoverable
  error states are implemented.
- [ ] API additions above are agreed before enabling ownership, one-answer, or
  live-result claims in the UI.
- [ ] Keyboard, screen-reader, visible-focus, contrast, reduced-motion, and
  responsive checks pass.
- [ ] The app is tested at 320 px, tablet, and desktop widths with long
  questions and long answers.
