# Portfolio refinement

## Brief
Moaaz Magdy, Cairo-based Business & Data Analyst. Audience: recruiters and clients. Goal: understand his analytical work, inspect projects, then contact him. Preserve the existing paper, calligraphy, Cairo stamps, floral marks and companions. This is a refinement, not a new identity. Astro and the existing GSAP paper deck remain; existing document navigation avoids introducing a second router.

## Concepts considered
| Territory | Idea / anchor | Signature / screenshot | Emotion | Originality / fit / feasibility / portability |
|---|---|---|---|---|
| Place | Correspondence from Cairo, anchored in Moaaz's city and collected landmark stamps | A personal letter opens onto a desk of analytical reports | Welcoming and curious | 4 / 5 / 5 / 2 |
| Profession | The evidence desk, anchored in operational reconciliation and inspectable reports | Reports turn forward one at a time | Clear and trustworthy | 4 / 5 / 5 / 3 |
| Process | A working notebook, anchored in experiments and tools shared publicly | Questions connect to working examples | Thoughtful and practical | 3 / 4 / 5 / 3 |

Chosen: Correspondence from Cairo, refining the existing evidence desk rather than replacing it.

## Concept card
Idea: A personal introduction from Cairo leads to a desk of useful analytical work.
Metaphor: Correspondence, stamps, paper reports.
Signature: Existing GSAP-driven tumble deck; reports tip forward like papers being examined.
Emotion: A warm welcome with a clear professional purpose.
Motion verb: Lift, turn, settle.
Screenshot: Arabic name and flowers with a legible English identity and direct route to the work.

## System
Palette: ground #f5eed7, ink #302d28, muted #625b51, line #b8a98f, accent #31596d, curtain #faf6ed.
Typography: retain self-hosted Zodiak display and Manrope UI; existing Arabic calligraphy and Astoria are identity assets, not new font additions. Body 16/24, meta 14/20, work headings 36/40; the timeline remains deliberately more compact.
Grid: 12 desktop columns, 4 mobile columns; outer padding 24 mobile / 48 desktop, capped reading width 60ch. Fixed controls have reserved top space. Section height follows content on phones and short screens.
Shape: paper and stamp silhouettes retained. No new card system.
Motion: existing GSAP deck; 450ms cubic-bezier(.32,.72,0,1) for paper interactions; existing native navigation, without a transition layer. No extra loader. Quiet idle flowers retained, disabled in reduced motion. Sound defaults to opt-in.

## Composition
Opening: [navigation] / [calligraphy + portrait] / [English name + role] / [work link + guide]
Introduction: [name] / [personal text | Cairo stamp] / [action stamps]
Work: [visible section title + project index] / [paper deck] / [tool stamps]
Experience: [heading] / [alternating timeline; vertical list on phone]
Contact: [envelope] / [invitation] / [contact + booking]

## Genericness check
Keep the owner's existing Arabic lettering, Cairo landmark stamps, actual reports and playful companions. Add clarity rather than a conventional replacement hero or additional spectacle. Remove the automatic welcome overlay as the weakest accessory; keep the tour available on request.

## Content
No invented employers, results or imagery. Resume content is outside this refinement. The corrected Mattlob end date is September to November 2026, as explicitly supplied by the owner.

## Validation
Production builds, HTML audit, desktop/mobile/reduced-motion screenshots, keyboard and hover checks. Separate screenshot-only critics assess each pass. A trial of native CSS view transitions was removed after real navigation exposed browser AbortErrors. Scores are estimates, not Awwwards awards. Any unmet targets are recorded honestly in the final validation notes.

## Final validation, 12 November 2026
- Production build and the existing eight project-lab checks pass. Astro type checking remains unavailable without the optional @astrojs/check dependency.
- Static audit: 23 pages, zero FAIL. Existing metadata-length and punctuation warnings remain.
- Latest homepage axe WCAG scan: zero violations. Keyboard project switching, real menu navigation, opt-in tour start/Escape dismissal pass with no browser errors.
- Final focused homepage checks: 390x844, 1024x600, 1440x900; no horizontal overflow. Inner-page second pass: eight page types at desktop/phone widths, no overflow, no hidden reduced-motion headings/body copy, no browser errors; genuine 404 status retained.
- Measured throttled homepage LCP about 2.04 seconds, CLS .001 in the preceding screenshot pass. Final content adds the project summary beneath the deck, not above the fold. Measurements are local headless estimates, not field data.
- Independent baseline critic: 6.50/10. Separate final critic: 7.71/10. Neither score is an award or an external Awwwards decision. The 8-in-every-category ambition has not been reached; this pass preserves the owner's existing design.
- Remaining opportunities: stronger readable project findings, more differentiated project rows, a closer palette match between companions and stationery, subtler control feedback with more visible movement. The earlier inner-page pass also measured CLS above .05 on About and 404; font/layout stabilization deserves a future focused pass.
- No invented content or placeholder assets were added. Existing professional facts and supplied correction to Mattlob dates were retained.
