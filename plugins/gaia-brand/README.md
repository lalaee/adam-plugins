# Gaia Brand

Gaia Baby Tracker's portable brand system: native UI, websites, illustrations, motion, typography, and voice. Includes the actual light/dark tokens, custom wordmarks, icons, 121 illustrations, licensed font subsets, and a labeled visual brand board. No Gaia source checkout, API keys, paid tools, or account is required.

## Install

### Claude Code

```sh
claude plugin marketplace add adamperlis/adam-plugins
claude plugin install gaia-brand@adam-plugins
```

### Codex

Add this marketplace using the repository's [installation instructions](../../README.md#install), then install **Gaia Brand** from Adam Plugins. For a standalone skill installation, copy the entire `skills/gaia-brand` folder into `~/.codex/skills/gaia-brand`.

## Use

- Codex: `$gaia-brand design a Gaia landing page for shared caregiving.`
- Claude Code: ask it to use the Gaia Brand skill, or invoke its installed skill command.
- Other agents: read [SKILL.md](skills/gaia-brand/SKILL.md) and the relevant linked references.

[Read the skill](skills/gaia-brand/SKILL.md) · [Brand board source](skills/gaia-brand/assets/brand-board.html) · [Static brand board](skills/gaia-brand/assets/brand-board.svg)

The brand board is a visual reference, not an app screenshot. Check product claims against the actual release.

## Rights

Instructions, documentation, and helper code are MIT-licensed. Gaia's logos, illustrations, icons, tokens, and brand-reference assets remain reserved; including them here does not grant permission to rebrand another product as Gaia. Font files retain their included SIL Open Font Licenses. Unmodified package redistribution is permitted with the notices intact. See [LICENSE.md](LICENSE.md).

## Validate

```sh
node skills/gaia-brand/scripts/check-package.mjs
```
