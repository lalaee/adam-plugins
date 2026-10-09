# Foundations

## Meaning before styling

Gaia makes shared care easier: one record, less remembering, useful patterns without targets. The mood is warm, capable, personal, and unhurried. Character comes from the drawings and precise proportions, not baby-pink/blue coding, clinical white cards, rainbow activity categories, or decorative dashboard widgets.

## Palette and depth

Use semantic roles. These are the principal roles; the complete theme, including status, glass, referent, and caregiver colors, is in `../assets/tokens.json`.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas fallback | #F2F2ED | #1A1B13 |
| Card / surface | #DBDBCF | #484936 |
| Nested / pressed surface | #D4D5C4 | #6C6E53 |
| Inset well | #E3E5D8 | #2B2C20 |
| Primary ink | #1D1D1B | #F2F2ED |
| Secondary ink | #5A5B48 | #DBDBCF |
| Tertiary ink, large text only | #76785E | #A9AB9D |
| Action | #45502B | #C6C7B2 |
| Pressed action | #38421F | #6C6E53 |
| Text on action | #F2F2ED | #1A1B13 |
| Accent | #FEE951 | #FEE951 |
| Chart mark | #45502B | #DBDBCF |
| Chart track | #E3E5D8 | #2B2C20 |

The light palette is warm grey with a trace of green, not saturated mint. The ground uses two static passes: eight vertical sampled stops plus a very weak cool-to-white diagonal sheen. Dark ground goes near-black olive to suit night feeds. Exact stops and locations are bundled; do not invent a generic two-color sage gradient.

The ground grades; card fills stay flat. A glass card may add a faint top sheen, bright hairline top lip, darker remaining edges, and a restrained drop shadow. A large blur cloud is not elevation. Do not replace the card fill with yellow. The denser yellow illustration collage belongs to the **app icon**, not the default product background.

Spend yellow sparingly: a small spot per drawing, the selected nav ring, a measured data marker, or a purposeful brand moment. It is not the default primary button color. Informational caregiver/referent colors are narrow exceptions, not permission to give each activity a hue. For arbitrary fills calculate readable ink rather than assuming white text.

Body text needs at least 4.5:1 contrast; large text and essential non-text controls need at least 3:1. Do not apply tertiary ink to small copy. Dark theme `accentText` is yellow; only use it on a sufficiently dark, verified background. Color never carries a state or series identity alone.

## Typography

Figtree carries display and large static figures. Inter carries prose, labels, annotations, and clocks; running timers use tabular numerals. Both use actual 400/500 cuts. The custom wordmark is separate from both.

| Native role | Family / weight | Size / line height | Tracking |
| --- | --- | --- | --- |
| Screen title | Figtree 500 | 26 / 32 | -0.6 |
| Card title | Figtree 500 | 20 / 24 | -0.36 |
| Body | Inter 400, 500 for emphasis | 15 / 22 | -0.1 |
| Label | Inter 400 | 14 / 20 | -0.08 |
| Value paired with label | Inter 500 | 14 / 20 | -0.12 |
| Overline | Inter 500 | 11 / 14 | 1.6, uppercase |
| Primary figure | Figtree 500 | 64 / 64 | -2.9 |
| Secondary figure | Figtree 500 | 24 / 28 | -0.53 |
| Running clock | Inter 500, tabular | 26 / 32 | -0.65 |
| Unit | Inter 500 | 14 / 18 | -0.08 |
| Tab label | Inter 500 | 11 / 14 | 0.1 |

Native scale: 11, 14, 15, 20, 24, 26, 64. Use at most three sizes in a component. A label and its value differ by ink/weight, not another size. Let long figures fall back to the secondary metric role instead of squeezing labels or collapsing to an unreadably small number. Enable larger text and allow containers to reflow; bundled per-role scale limits describe existing constrained chrome, not a reason to disable accessibility.

Marketing headlines are responsive Figtree 500, not restricted to native sizes: the website hero currently spans 32–58px with about 1.06 line height and -0.022em tracking. Body is Inter 400, usually 16–18px; no 700/800 headline weight.

## Layout and mark

Main spacing is an 8pt rhythm. Gutter 16, card inset 24, gap 16, group gap 32. Small optical adjustments are allowed; do not turn them into a second grid. Structural cards/sheets use radius 24, controls use pills; small chips may use radius 8/12. A native visual add control is 40pt but its touch area must reach at least 44pt.

Preserve the original wordmark's viewBox and strokes. As a practical new-layout clearance rule, leave at least one dot-height around it; this is guidance, not a measured historical logo specification. Use ink on light and warm light ink on dark. Do not stretch, retype, outline twice, recolor each letter, or add a new symbol to it. iOS app icon PNGs are square masters: let the platform mask them, rather than exporting pre-rounded transparent corners.
