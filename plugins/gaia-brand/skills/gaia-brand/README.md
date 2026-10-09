# Gaia Brand skill

Gaia Baby Tracker's portable visual and verbal system: native UI, websites, illustrations, motion, typography, and marketing. See [SKILL.md](SKILL.md) for agent instructions and [the brand board](assets/brand-board.html) for a local visual reference.

## Install

Unzip the package so the folder is named `gaia-brand`, then copy that whole folder into your agent's skills directory:

- Codex: `~/.codex/skills/gaia-brand/`
- Claude Code, personal: `~/.claude/skills/gaia-brand/`
- Claude Code, project: `.claude/skills/gaia-brand/`

Do not overwrite an existing skill without reviewing it. Reload the agent's skills if necessary. The core instructions and resources are ordinary Markdown/JSON/SVG files; `agents/openai.yaml` is optional Codex UI metadata. Local helpers require Node.js 18 or later; no network account or API key is needed.

Example: “Use $gaia-brand to design a Gaia landing page for shared caregiving.” In Claude Code, invoke `/gaia-brand` or ask it to use the Gaia Brand skill. For another agent, load `SKILL.md` and the relevant linked references.

## Check

```sh
node scripts/check-package.mjs
node scripts/render-illustration.mjs bottle --theme dark --output /tmp/gaia-bottle.svg
```

The brand board is a design reference, not a product screenshot. Product facts need checking against the current release. Read [LICENSE.md](LICENSE.md) before redistribution or asset reuse; font licenses are included separately.
