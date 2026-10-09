# Native UI

## Screen anatomy

Use one static ground across the screen. Headers, spaces, and rows are transparent; groups sit in inset rounded surfaces rather than full-width opaque bands. Keep screen titles at the gutter and card contents a further 24pt inside: those deliberately do not share a left edge.

The Activity screen has a personal header, one featured activity, and a two-column grid. The featured activity is user-reorderable, not always feeding. Place the edit-layout icon at the far right of the child-name/age header, with an accessible label and ample touch target. Multiple children have a deliberate child switcher; records, age, timers, and insights must visibly belong to the selected child.

The native tab bar is a floating pill: Activity, History, Trends, Growth, Account. Selection uses a drawn yellow ring, not a font-weight jump that changes widths. Pad scrolling content by the tab bar's actual occupied space plus bottom inset so the final row and controls remain reachable.

Full-screen editors need a real safe-area header and reachable bottom controls. A modal's close/Cancel and Done must not intersect the iOS status bar, and its footer must not cover the last draggable card or input. Bottom sheets need keyboard-aware scrolling, centered input text/placeholder, and a visible dismissal path. Do not fix clipping with hardcoded phone-height offsets.

## Cards and controls

- Featured card: activity drawing at 88pt in a stable square slot, add control opposite, title/recency beneath, and an optional metric or food pills. It starts around 208pt minimum height and can grow. A “Show more” row belongs to recent details, not the primary log action.
- Grid tile: drawing at 56pt, title, concise recency/value, small add control. Minimum height around 156pt; permit larger text to grow it.
- Primary button: action fill and text-on-action, rounded pill, normally 48/56pt height. Secondary is a light well; ghost is readable text; destructive is the semantic danger pair.
- Add button: a glass circle with an action-colored plus in current native UI. Do not confuse it with a yellow add disc. Marketing artwork may use an approved dark-ink plus treatment only if it matches the screen being advertised; never describe an outdated screenshot as current native UI.
- Fields use inset wells, persistent specific labels, and explicit units. Distinguish “First baby's name” and “Second baby's name”; use each child's actual name when editing their measurements. Optional family-name guidance should not masquerade as a value.
- Functional chevrons, close, check, calendar, and edit icons use clean conventional glyphs; baby-care illustrations are identity, not replacements for every utility icon.

## Charts and insight cards

The mark is theme `chartMark`, the track `chartTrack`. Prefer single-series charts or small multiples. Use labels or shapes for necessary differences; do not invent a categorical rainbow.

Nap predictions lead Trends but stay in the same surface family. A light inset result panel can hold a likely next-nap range, recent wake-window distribution, and clearly labeled statistics. A yellow bar that looks like progress must represent a real, explained progress value; otherwise remove it. Do not use a yellow background to imply certainty or importance.

When showing a distribution, explain points = recent wake windows, highlighted band = typical range, and line = typical/median value **only after confirming that is what the actual algorithm renders**. Distinguish duration axes (“2h 21m”) from clock-time predictions (“11:12–11:42 AM”). Stack statistic columns on narrow screens or with larger type instead of letting labels collide. Future nap sketches communicate uncertainty, not a prescribed day.

Growth uses genuine WHO references and a child's actual measurements. Percentiles are context, not scores. A plot intended to be edge-to-edge should reach the card's right edge while labels/legend retain readable insets; clip the plot at the rounded boundary, not its data one padding-width early. Preserve units and the full data domain. Never hand-draw medically meaningful reference curves for a demo.

History is newest-first within the selected day and can reach the full saved history. “Nothing logged” is a factual empty state, not a substitute for a failed query. A timer shows real elapsed time, not a frozen duration captured when Save was pressed.

## Example composition, not a feature mandate

For a new insight card: neutral surface → small context drawing + Figtree title → light result well → one clear metric/range → one short explanation. Use a real synthetic fixture for design previews and label it demo data. Avoid adding a score, streak, target, or celebratory treatment unless it is part of the requested feature.
