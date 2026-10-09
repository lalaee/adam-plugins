# Provenance and maintenance

This package was assembled from Gaia's working brand sources on 8 October 2026. It is a portable snapshot, not a live release-status or legal-compliance record.

## Source map for maintainers

These repository-relative paths document origin; they are not dependencies required to use the skill.

| Package material | Gaia source |
| --- | --- |
| Theme roles and palette | `src/design/tokens/semantic.ts`, `primitives.ts` |
| Type, spacing, timing | `src/design/tokens/typography.ts`, `layout.ts`, `motion.ts` |
| UI rules | `src/design/components/`, `src/features/home/`, `src/features/activityArt.ts` |
| Activity and character drawings | `src/design/illustrations/paths.ts`, `cast.ts` |
| Current art corrections | `scripts/hand/studio/corrections.mjs` |
| Custom wordmark | `scripts/icon/wordmark.json` |
| Icon masters | `assets/icon.png`, `icon-dark.png`, `icon-tinted.png` |
| Website voice and expression | `site/build.mjs`, `site/copy/en.mjs` |
| Self-hosted font subsets and licenses | `site/fonts/` |

Gaia illustration assets originate in the project's generated/traced drawing pipeline. This package includes Gaia's exported artwork, **not external analysis reference images**, raw generation services, or their credentials. No independent rights-clearance review has been performed. Font subsets are unmodified Figtree and Inter Google Fonts distributions with their original SIL Open Font Licenses included.

Older source comments conflict with implementation: yellow add controls and the procedural `scripts/illustration/scenes.mjs` contract are obsolete for the current traced artwork. Current native add glyphs use the action role. Current drawings are filled ink/accent paths, generated upstream by `scripts/hand/studio/build.mjs`; never edit baked paths to make corrections. The standing-mother drawing includes the smaller-nose correction. Do not treat the old oversized-nose prompt as approved future direction.

Some marketing-context files contain release-specific or stale statements (including old platform/language/analytics facts). The skill keeps durable design intent and routes factual claims to verification instead of copying those assertions.

## Refresh

In a Gaia source checkout, `node scripts/brand/build-skill-assets.mjs` refreshes the bundled assets and token snapshot. Review documentation when the actual system changes. The generated manifest stores SHA-256 digests so accidental resource changes can be detected by the package checker.

Inside the portable skill, run `node scripts/check-package.mjs`. This checks resource digests, SVG structure, required roles, font licenses, broken local Markdown links, and obvious private-path/credential leakage. It does not prove legal clearance, claim accuracy, or visual quality.

Public package scope: brand guidance, tokens, artwork, font subsets/licenses, a labeled visual board, and local utilities. Excluded: accounts, contact details, child records/photos, support ZIPs, tracking identifiers, logs, API/configuration secrets, deployment settings, store upload receipts, and review correspondence.
