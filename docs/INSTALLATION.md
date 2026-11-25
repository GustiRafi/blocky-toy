# Installation & Multi-Agent Setup Guide (`BLOCKY TOY`)

**BLOCKY TOY** (`blocky-toy`) follows the open **Agent Skills (`SKILL.md`)** specification (`agentskills.io`). Because it uses standard YAML frontmatter, Markdown references, templates, and zero-dependency Node scripts, you can install it cleanly into virtually any agentic AI coding assistant—per project or globally.

---

## Quick One-Command Installer

Run via `npx blocky-toy` (once published to npm) or directly from `/Users/macos/Developer/blocky-toy`:

```bash
# Via npx (once published):
npx blocky-toy --target all --project /path/to/your-project

# Or from a local clone across ALL major agent directories (.agents, .claude, .opencode, .cursor):
node /Users/macos/Developer/blocky-toy/scripts/install.mjs --target all --project /path/to/your-project

# Or install globally in your home directory so every workspace sees it automatically:
node /Users/macos/Developer/blocky-toy/scripts/install.mjs --target all --scope global
```

> **Tip**: Local clones default to a clean directory symlink; `npx` automatically defaults to standalone `--copy` (skipping heavy `docs/media/` assets) so installs never break if the `_npx` cache clears. Use `--dry-run` first to preview exact paths.

---

## Agent-by-Agent Discovery Paths

| Agentic AI Tool | Project-Scoped Path | Global / User-Scoped Path | Notes & Invocation |
| :-- | :-- | :-- | :-- |
| **Google Antigravity** | `.agents/skills/blocky-toy/` | `~/.agents/skills/blocky-toy/` *(or `~/.gemini/config/` via `skills.json`)* | Auto-discovered via progressive disclosure; invoke naturally or via `/blocky-toy`. |
| **Claude Code** | `.claude/skills/blocky-toy/` | `~/.claude/skills/blocky-toy/` | Auto-loads metadata at startup; invoke via `/blocky-toy` or natural request. |
| **OpenCode** | `.opencode/skills/blocky-toy/` *(also scans `.agents/skills/` & `.claude/skills/`)* | `~/.config/opencode/skills/blocky-toy/` | Use `/skills` to verify loaded status; progressive disclosure active. |
| **OpenAI Codex CLI** | `.agents/skills/blocky-toy/` | `~/.codex/skills/blocky-toy/` *(and `~/.agents/skills/`)* | Vendor-neutral `.agents/skills/` works out of the box. |
| **Cursor** | `.cursor/skills/blocky-toy/` *(also reads `.agents/skills/`)* | `~/.cursor/skills/blocky-toy/` | Loads `SKILL.md` on demand when creating/editing 3D animation projects. |
| **Generic / Other Agents** *(Windsurf, Aider, Cline, Chat UIs)* | Keep anywhere in repo | — | Reference `blocky-toy/SKILL.md` in `AGENTS.md`, `.windsurfrules`, or your first prompt. |

---

## Manual Installation (Without `install.mjs`)

### Antigravity / Universal (`.agents/skills`)
```bash
mkdir -p .agents/skills
ln -s /Users/macos/Developer/blocky-toy .agents/skills/blocky-toy
```

### Claude Code
```bash
mkdir -p ~/.claude/skills
ln -s /Users/macos/Developer/blocky-toy ~/.claude/skills/blocky-toy
```

### OpenCode
```bash
mkdir -p ~/.config/opencode/skills
ln -s /Users/macos/Developer/blocky-toy ~/.config/opencode/skills/blocky-toy
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
   > *"List available skills and confirm `blocky-toy` (BLOCKY TOY) is loaded."*
3. Start producing in **Idea Mode** or **Script Mode**:
   - **Idea Mode**: `Use blocky-toy to build a 90s rainy train-station story called "The Last Train Home" in English.`
   - **Script Mode**: `/blocky-toy --script ./my-script.md` *(defaults to `9:16` Reels; pass `--format landscape` or `--format 16:9` for widescreen)*

---

## Uninstalling

```bash
node /Users/macos/Developer/blocky-toy/scripts/install.mjs --target all --scope project --project /path/to/your-project --uninstall
```
