# Installation & Multi-Agent Setup Guide

`cinematic-3d-animation` follows the open **Agent Skills (`SKILL.md`)** specification (`agentskills.io`). Because it uses standard YAML frontmatter, Markdown references, templates, and zero-dependency Node scripts, you can install it cleanly into virtually any agentic AI coding assistant—per project or globally.

---

## Quick One-Command Installer

Run from inside `/Users/macos/Developer/cinematic-3d-animation` (or point `node` to `scripts/install.mjs`):

```bash
# Install for your current project across ALL major agent directories (.agents, .claude, .opencode, .cursor)
node /Users/macos/Developer/cinematic-3d-animation/scripts/install.mjs --target all --project /path/to/your-project

# Or install globally in your home directory so every workspace sees it automatically:
node /Users/macos/Developer/cinematic-3d-animation/scripts/install.mjs --target all --scope global
```

> **Tip**: By default `install.mjs` creates a clean directory symlink (instant updates, zero duplication). Add `--copy` if you want standalone copied files (which automatically skips heavy `docs/media/` demo videos unless `--with-media` is passed). Use `--dry-run` first to preview exact paths.

---

## Agent-by-Agent Discovery Paths

| Agentic AI Tool | Project-Scoped Path | Global / User-Scoped Path | Notes & Invocation |
| :-- | :-- | :-- | :-- |
| **Google Antigravity** | `.agents/skills/cinematic-3d-animation/` | `~/.agents/skills/cinematic-3d-animation/` *(or `~/.gemini/config/` via `skills.json`)* | Auto-discovered via progressive disclosure; invoke naturally or via skill trigger. |
| **Claude Code** | `.claude/skills/cinematic-3d-animation/` | `~/.claude/skills/cinematic-3d-animation/` | Auto-loads metadata at startup; invoke via `/cinematic-3d-animation` or natural request. |
| **OpenCode** | `.opencode/skills/cinematic-3d-animation/` *(also scans `.agents/skills/` & `.claude/skills/`)* | `~/.config/opencode/skills/cinematic-3d-animation/` | Use `/skills` to verify loaded status; progressive disclosure active. |
| **OpenAI Codex CLI** | `.agents/skills/cinematic-3d-animation/` | `~/.codex/skills/cinematic-3d-animation/` *(and `~/.agents/skills/`)* | Vendor-neutral `.agents/skills/` works out of the box. |
| **Cursor** | `.cursor/skills/cinematic-3d-animation/` *(also reads `.agents/skills/`)* | `~/.cursor/skills/cinematic-3d-animation/` | Loads `SKILL.md` on demand when creating/editing 3D animation projects. |
| **Generic / Other Agents** *(Windsurf, Aider, Cline, Chat UIs)* | Keep anywhere in repo | — | Reference `cinematic-3d-animation/SKILL.md` in `AGENTS.md`, `.windsurfrules`, or your first prompt. |

---

## Manual Installation (Without `install.mjs`)

### Antigravity / Universal (`.agents/skills`)
```bash
mkdir -p .agents/skills
ln -s /Users/macos/Developer/cinematic-3d-animation .agents/skills/cinematic-3d-animation
```

### Claude Code
```bash
mkdir -p ~/.claude/skills
ln -s /Users/macos/Developer/cinematic-3d-animation ~/.claude/skills/cinematic-3d-animation
```

### OpenCode
```bash
mkdir -p ~/.config/opencode/skills
ln -s /Users/macos/Developer/cinematic-3d-animation ~/.config/opencode/skills/cinematic-3d-animation
```

---

## Verifying Installation

1. Run the bundled self-tests:
   ```bash
   node scripts/install.mjs --self-test
   node scripts/parse-script-outline.mjs --self-test
   node scripts/wav-rms-viseme-aligner.mjs --self-test
   ```
2. Inside your AI agent session, ask:
   > *"List available skills and confirm `cinematic-3d-animation` is loaded."*
3. Start producing in **Idea Mode** or **Script Mode**:
   - **Idea Mode**: `Use cinematic-3d-animation to build a 90s rainy train-station story called "The Last Train Home" in English.`
   - **Script Mode**: `Use cinematic-3d-animation with --script ./my-script.md --format 16:9`

---

## Uninstalling

```bash
node /Users/macos/Developer/cinematic-3d-animation/scripts/install.mjs --target all --scope project --project /path/to/your-project --uninstall
```
