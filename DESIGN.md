# Lekke Logic — design system (UI/UX upgrade, Oct 2026)

Stack: the existing static HTML/CSS/JS site, deployed to Cloudflare Pages. No build step. GSAP 3.12.5
(cdnjs, pinned) drives motion; everything degrades to static HTML without it.

## Brief

- Subject: Lekke Logic (Pty) Ltd, AI-native agency in Johannesburg. Audits, workflow automation,
  document agents, decision systems, custom AI software, UI/UX, marketing sites, security.
- Audience: owners and ops leads at SA SMEs, fintech, SaaS and media teams.
- Job: get a discovery call booked (Calendly popup on every "Book a call").
- Brand kept: paper / ink / orange, Bricolage Grotesque display, Geist body, JetBrains Mono meta,
  the interlocking black and orange "L" spot-art series on a drafting grid.
- Honest content only: every claim, client and price on the site was already there.

## Concept card

```
Idea:        Your team (black L) and the machine (orange L) lock together on one grid.
Metaphor:    A drafting table: pieces are measured, slid along grid lines, and snapped into place.
Signature:   Hero "lock-up": the two L blocks slide in on grid lines and lock; scroll and pointer nudge
             them a grid step at a time. Same driver re-used as the page-transition curtain.
Emotion:     Precise, confident, a little playful ("lekke" = nice, great).
Motion verb: Snap to grid. Short travel, firm ease out (expo.out / power4.out), discrete steps.
Screenshot:  Giant "Strategy. Design. Code. Ship." beside the locked L pair on the drafting grid.
```

Concepts considered: (1) drafting-table lock-up [chosen: anchored in the brand's own mark, high fit,
cheap in code]; (2) "it ships" conveyor/packet line running through the page [more generic, any dev
agency could have it]; (3) "lekke" slang typographic system [weak for a B2B buyer].

## Art direction

| Role | Hex | Use |
|---|---|---|
| ground | #FFFFFF | page |
| paper | #F4F1EA | drafting-grid panels, art mats |
| ink | #0A0A0A | type, the "team" L, dark bands |
| muted | #5E5E5E | secondary text (AA on white and paper) |
| line | rgba(10,10,10,.10) | grid lines and rules |
| accent | #FF5B1F | the "machine" L, CTAs, current state. Text on accent is always ink. |

- No gradients anywhere (Josh's rule). Solid fills only; text over images sits on solid fills.
- Type: Bricolage Grotesque display (negative tracking, -0.04em at hero size), Geist 17px/1.55 body,
  JetBrains Mono 12px meta in uppercase only where it carries information (prices, dates, counts).
- Eyebrow labels removed above headings. Section numbers kept only where the content is a sequence.
- Grid: 12 columns, gutter = --gutter. Section rhythm alternates white / paper / orange / ink.
- Shape: radius 999px for buttons and chips, 4px for panels and images, 0 for grid art.
- Motion: one ease family (expo.out for entrances, power2.inOut for the curtain). Big things 0.9s,
  small things 0.25s. Stagger 40ms. Transform, opacity and clip-path only.

## Composition (home)

```
[nav: brand · links · Book a call]                    mobile: brand · menu button → full-screen sheet
[hero 7/5: H1 + kicker + CTAs | L lock-up stage on drafting grid]
[meta rail: Johannesburg · booking Q3/Q4 2026 · reply in 24h · 7 practices]
[clients: one line, names as large type links]
[manifesto: orange band, "machines" block wipes in]
[services index: numbered rows, price in mono, image reveals beside the hovered row]
[how we work: 4-step rail from process.html, horizontal on desktop, stacked on phone]
[closing CTA: ink band with outlined L pair]
[footer]
```

## Interaction rules

- Primary CTA buttons: fill wipes from the left in the opposite colour, arrow snaps one step.
- Nav links: underline bar snaps in from the left; current page keeps the bar.
- Service rows: row rule turns orange, number and title shift one grid step right, art reveals.
- Inline links in body text keep an underline at rest.
- Focus: 2px ink outline with 3px offset (orange on ink bands). Skip link first in tab order.
- Page transition: orange panel covers on exit, uncovers on enter (sessionStorage flag). Skipped
  under reduced motion and for new-tab, hash and external links.
- Idle: the orange L drifts half a grid step and back every few seconds while the hero is in view.
- Reduced motion: no curtain, no drift, no reveals; everything visible.

## Inner page recipe (second pass, Oct 2026)

Every inner page is composed from the shared components in styles.css (`components v2`), not from v1 cards.

1. Hero: `.hero-grid` 7/5. h1 in `.display` at clamp(48px, 7vw, 112px), tracking -0.045em, one accent word max.
   Lead paragraph max 44ch. Right column: the page's art in `.page-art.draft` (or `.lockup`-style composition).
   Under the hero, a `.rail` of 3 or 4 real facts from the page (durations, price range, location, reply time).
2. Vary the layout family per section; never two of the same in a row:
   index rows (`.si`), pinned image + chapters (`.story`), 4-up rail (`.steps`), editorial split (big number or
   heading left 5/12, body right 7/12), full-bleed orange statement (`.manifesto`), ink CTA band (`.closing`).
3. Fewer boxes and lines. Prefer rules (1px) and white space over bordered cards. At most one boxed panel style per
   page. No three-equal-cards rows. No eyebrow labels above headings; mono meta only where it carries a fact.
4. Images tell the story: every long page has at least 3 illustrations from assets/img (spot, story, work), large
   (not 56px icons). Text never sits on an image.
5. Bands: white / paper / orange / ink, never two of the same adjacent. Accent words on orange bands are handled by
   the shared rule (ink block, orange type); don't colour text orange on orange.
6. Closing: every page ends with one `.closing` ink band (or orange `.manifesto` band) with its own sentence and the
   Book a discovery call button. One closing band per page.
