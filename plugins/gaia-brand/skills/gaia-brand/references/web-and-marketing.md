# Website and marketing

## Tell one story

Lead with shared care: someone can see the last feed without asking. Then show useful nap insight, separate caregiver access, bringing existing history, reviewing a day, trends, and growth context. Close with practical questions and an unmistakable install/download action. This is a flexible narrative, not a requirement to add every section to every page.

The current signature hero uses a real-looking phone and a cast of Gaia drawings as a playful physics layer. Keep headline, download badge, and navigation usable above it. Drawings can be dragged, pushed, and settle around the phone; they must not cover the CTA, form an invisible input blocker, or get permanently trapped above the visible play area. Accessible and reduced-motion versions remain fully useful without physics.

Phone sections use **exploded-out product UI**: a faithful phone view plus a relevant card lifted from that screen, overlapping the phone intentionally. It is not a phone followed by a detached generic web dashboard. Keep coherent perspective, scale, and overlap on mobile as well as desktop. Pair every benefit with the right screen: imports with import UI, growth with growth, nap claims with the actual prediction card.

Keep the marketing ground in Gaia's color family. A scroll narrative may travel light → warm sunset/dusk → dark → dawn/light, but do not turn native screens into the site's changing sky. Change sections briskly enough that readers encounter the return to light; do not bury the whole page in a long dark plateau. The desktop timeline belongs at the far right after the hero. Mobile can show a compact time/progress cue with room from the scrollbar and no obstruction to content.

Comparison/alternative pages use the same visual grammar and page structure: Gaia-led outcome, accurate feature comparison, a relevant product demonstration, switching instructions when supported, FAQ, download CTA. Name competitors to help someone find the page, not to praise them gratuitously or make unverified negative claims. No fake customer quote or citation.

## Performance is part of the identity

Render meaningful copy and download links before JavaScript. Keep a visible fallback if motion cannot initialize. Use transform/opacity parallax with small travel, reveal once, and never repeatedly toggle entire sections invisible at a viewport boundary. Avoid first-entry blinking caused by competing reveal systems.

Use one coordinated scroll/animation loop; Lenis is the website's existing smooth-scroll choice, not a required dependency for every Gaia artifact. Stop physics when settled/offscreen/hidden. Avoid continuous layout measurement, animating large blur/filter regions, and synchronous setup bursts when the hero first explodes. Decode assets before a reveal, reserve image dimensions, and make reducing particle/body count an option on constrained devices. Pointer layers should only capture visible interactive objects. Reduced-motion users get static placements and immediate content.

Self-host the bundled font subsets with `font-display: swap`. Preload only the needed Latin faces; load Latin Extended for Turkish and other extended characters. Fingerprint reusable assets so localized pages share caches. Preserve the effects, but measure the final page on a phone before claiming the animation is smooth.

## Public creative

- OG/social: use the existing wordmark and drawings. A small illustration story on warm paper or a carefully cropped icon-style collage beats a fabricated generic app panel. Keep the readable focal point within platform crops.
- App Store screenshots: start with shared care, then a useful next-nap window, history, growth, and importing. Use a faithful current iOS capture for iOS placements, correct supported-device dimensions/status bar, and no unrelated platform marks. Make promotional captions separate from the actual UI. A web reconstruction is **not** proof of the submitted binary.
- Header/search illustration assets are branding, not app-preview footage. App previews demonstrate the actual product with current store specifications; do not relabel a camera move over illustration artwork as an in-app preview.
- Install instructions need an actual action and destination: “Download Gaia from the App Store,” then open/sign in/add a child as appropriate. An MCP connection is a separate setup path, not an app download. Reconfirm supported clients and authentication rather than promising an untested integration.

Always check current release/platform/pricing facts before publishing. This package deliberately contains no store-account IDs, credentials, user screenshots, device logs, real family photos, deployment commands, or release-specific approval claims.
