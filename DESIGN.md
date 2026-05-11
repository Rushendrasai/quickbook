# Design Brief

## Direction

QuickBook — Service availability calendar with emerald green primary and clean card-based interface for service providers and clients.

## Tone

Professional yet approachable; friendly accessibility for mobile users managing service bookings without corporate coldness.

## Differentiation

Medium-rounded cards (12-24px) with emerald accents on soft cool backgrounds create premium simplicity distinct from flat booking tools.

## Color Palette

| Token      | OKLCH             | Role                     |
| ---------- | ----------------- | ------------------------ |
| background | 0.99 0.005 260    | Soft cool white base     |
| foreground | 0.15 0.01 260     | Dark slate text          |
| primary    | 0.5 0.2 160       | Emerald CTA + accents    |
| card       | 1.0 0.0 0         | Pure white surfaces      |
| accent     | 0.5 0.2 160       | Same as primary          |
| muted      | 0.95 0.01 260     | Subtle backgrounds       |
| destructive| 0.55 0.22 25      | Error/warning states     |

## Typography

- Display: Plus Jakarta Sans — headings, service names, day labels
- Body: Plus Jakarta Sans — UI labels, descriptions, form text
- Scale: hero `text-2xl md:text-3xl font-black`, h2 `text-xl font-bold`, label `text-xs font-semibold uppercase`, body `text-sm md:text-base`

## Elevation & Depth

Cards elevated via subtle cool shadows (`shadow-sm`); header/footer have minimal borders; no drop shadows on buttons.

## Structural Zones

| Zone    | Background     | Border           | Notes                                |
| ------- | -------------- | ---------------- | ------------------------------------ |
| Header  | White          | border-b muted   | Emerald logo icon, left-aligned     |
| Content | Soft off-white | —                | 3-column grid desktop, 1-col mobile |
| Ad Top  | Muted bg       | —                | Responsive image container          |
| Modal   | White overlay  | backdrop blur    | Centered, max-w-md, emerald CTA     |
| Ad Bot  | Muted bg       | —                | Before footer                       |
| Footer  | Soft off-white | border-t muted   | Links + copyright                   |

## Spacing & Rhythm

Cards use p-4 md:p-8 for breathing room; slots grouped with space-y-2; modal has vertical stack p-8; footer sections separated by py-6 borders.

## Component Patterns

- Buttons: `rounded-xl` emerald bg, `hover:bg-emerald-700` no shadow, disabled `bg-slate-100 text-slate-400 cursor-not-allowed line-through`
- Cards: `rounded-3xl border border-slate-200 shadow-sm` white background
- Badges/Labels: `text-xs font-bold uppercase tracking-widest` with muted color
- Input fields: `rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-600`

## Motion

- Entrance: Fade-in on load, no choreography
- Hover: Button scale `active:scale-95`, subtle color transitions
- Decorative: None; focus on usability

## Constraints

- Mobile-first: single column, expand to 3-col grid at md breakpoint
- Touch targets: minimum 44px (buttons via p-3 md:p-4)
- Contrast: WCAG AA+ maintained (dark text on light, light text on emerald)
- No animations except hover feedback; prioritize accessibility

## Signature Detail

Emerald green accent on slate/white with rounded cards creates premium-casual booking experience; medium border radius (12-24px) signals friendliness without playfulness.
