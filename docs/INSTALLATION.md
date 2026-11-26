# Installation, Multi-Agent Setup & Troubleshooting (`BLOCKY TOY`)

**BLOCKY TOY** (`blocky-toy`) follows the open **Agent Skills (`SKILL.md`)** standard. It uses plain Markdown references, templates, and zero-dependency Node.js (`>=18`) scripts, so you can install it per project or globally across **Google Antigravity**, **Claude Code**, **OpenCode**, **OpenAI Codex CLI**, **Cursor**, and generic coding agents.

---

## Prerequisites

- **Node.js `>= 18`** (required to run `npx blocky-toy` and the bundled validator scripts; no `npm install` dependencies needed).
- *(Optional for rendering)* Three.js / WebGL / Godot / Unity, Playwright/Chromium, FFmpeg, and `msedge-tts` depending on your project's 3D pipeline.

---

## Method 1: Quick Install via `npx` / `pnpm dlx` / `bunx` (Recommended)

Run these commands from **your target project directory** (not inside the `blocky-toy` repository itself):

```bash
# 1. Install into the current project (.agents/skills/blocky-toy — works for Antigravity, Codex, OpenCode, Cursor):
npx blocky-toy

# 2. Install into ALL supported agent folders in your project (.agents, .claude, .opencode, .cursor):
npx blocky-toy --target all

# 3. Install for a specific project path:
npx blocky-toy --target all --project /path/to/your-project

# 4. Install globally (available in every workspace on your machine):
npx blocky-toy --target antigravity --scope global   # -> ~/.gemini/config/skills/blocky-toy
npx blocky-toy --target all --scope global           # -> all global agent skill folders

# Always pull the newest release if you previously ran npx:
npx --yes blocky-toy@latest --target all
```

### Using `pnpm` or `Bun`

Both `pnpm` and `Bun` pull from the same npm registry package:

```bash
# pnpm:
pnpm dlx blocky-toy --target all
pnpm dlx blocky-toy --target antigravity --scope global

# Bun:
bunx blocky-toy --target all
# If Node.js is not installed on the machine, run with Bun's runtime:
bunx --bun blocky-toy --target all
```

### Installer CLI Options

| Flag | Description |
| :--- | :--- |
| `--target <name>` | `universal`, `antigravity`, `claude`, `opencode`, `codex`, `cursor`, `all`, or comma-separated (default: `universal`). |
| `--scope <project\|global>` | Install into `--project` repo or user home directory (default: `project`). |
| `--project <path>` | Target project root when `--scope project` (default: current working directory). |
| `--copy` | Copy core skill files (`SKILL.md`, `README.md`, `references/`, `templates/`, `scripts/`). **Auto-enabled** under `npx` / `pnpm dlx` / `bunx` / `node_modules`. |
| `--symlink` | Symlink directory instead of copying (default when running from a local git clone). |
| `--with-media` | Also copy `docs/media/` demo videos & screenshots (only available from a local clone). |
| `--dry-run` | Preview exact destination paths without modifying disk. |
| `--uninstall` | Remove the installed skill folder or symlink cleanly. |
| `--self-test` | Run installer verification inside a temporary directory. |
| `-v`, `--version` | Print package version (`1.1.0`). |
| `-h`, `--help` | Show CLI usage help. |

---

## Method 2: Install from a Local Clone

Useful if you want to edit the skill locally and have changes apply immediately via symlink:

```bash
git clone https://github.com/GustiRafi/blocky-toy.git
cd blocky-toy

# Project-local symlink:
node scripts/install.mjs --target all --project /path/to/your-project

# Global install for Antigravity (~/.gemini/config/skills/blocky-toy) or all agents:
node scripts/install.mjs --target antigravity --scope global
node scripts/install.mjs --target all --scope global
```

---

## Agent-by-Agent Discovery Paths

| Agentic AI Tool | Project-Scoped Path | Global / User-Scoped Path | Notes & Invocation |
| :--- | :--- | :--- | :--- |
| **Google Antigravity** | `.agents/skills/blocky-toy/` *(also `.agent/`, `_agents/`, `_agent/`)* | `~/.gemini/config/skills/blocky-toy/` *(or via `~/.gemini/config/skills.json`)* | Auto-discovered via progressive disclosure; invoke naturally or via `/blocky-toy`. |
| **Claude Code** | `.claude/skills/blocky-toy/` | `~/.claude/skills/blocky-toy/` | Auto-loads metadata at startup; invoke via `/blocky-toy` or natural request. |
| **OpenCode** | `.opencode/skills/blocky-toy/` *(also scans `.agents/skills/` & `.claude/skills/`)* | `~/.config/opencode/skills/blocky-toy/` | Use `/skills` to verify loaded status. |
| **OpenAI Codex CLI** | `.agents/skills/blocky-toy/` | `~/.codex/skills/blocky-toy/` *(and `~/.agents/skills/`)* | Vendor-neutral `.agents/skills/` works out of the box. |
| **Cursor** | `.cursor/skills/blocky-toy/` *(also reads `.agents/skills/`)* | `~/.cursor/skills/blocky-toy/` | Loads `SKILL.md` on demand for 3D animation tasks. |
| **Generic / Other Agents** *(Windsurf, Aider, Cline)* | Any folder inside repo | — | Reference `blocky-toy/SKILL.md` in `AGENTS.md`, `.windsurfrules`, or your prompt. |

---

## Method 3: Manual Installation (Without `install.mjs`)

### Google Antigravity (Project vs. Global)

```bash
# Project-local (inside your workspace root):
mkdir -p .agents/skills
ln -s /path/to/blocky-toy .agents/skills/blocky-toy

# Global (available across all projects):
mkdir -p ~/.gemini/config/skills
ln -s /path/to/blocky-toy ~/.gemini/config/skills/blocky-toy
```

### Registering a Custom Folder via `skills.json` (Antigravity)

If you prefer keeping `blocky-toy` in another directory (for example `~/skills-repo/blocky-toy`), point `.agents/skills.json` (project) or `~/.gemini/config/skills.json` (global) to its **parent directory** (Antigravity scans each `entries` directory one level deep):

```json
{
  "entries": [
    {
      "path": "~/skills-repo"
    }
  ]
}
```

### Claude Code / OpenCode

```bash
# Claude Code (global):
mkdir -p ~/.claude/skills
ln -s /path/to/blocky-toy ~/.claude/skills/blocky-toy

# OpenCode (global):
mkdir -p ~/.config/opencode/skills
ln -s /path/to/blocky-toy ~/.config/opencode/skills/blocky-toy
```

---

## Verifying Installation

1. **Confirm `SKILL.md` exists directly inside the skill folder**:
   ```bash
   # Project-local check:
   ls -la .agents/skills/blocky-toy/SKILL.md

   # Antigravity global check:
   ls -la ~/.gemini/config/skills/blocky-toy/SKILL.md
   ```
2. **Run bundled self-tests** (`npm test` inside repo, or from the installed folder):
   ```bash
   node .agents/skills/blocky-toy/scripts/install.mjs --self-test
   node .agents/skills/blocky-toy/scripts/parse-script-outline.mjs --self-test
   node .agents/skills/blocky-toy/scripts/wav-rms-viseme-aligner.mjs --self-test
   node .agents/skills/blocky-toy/scripts/validate-world-scale.mjs --self-test
   node .agents/skills/blocky-toy/scripts/validate-art-direction.mjs --self-test
   node .agents/skills/blocky-toy/scripts/validate-atmosphere.mjs --self-test
   node .agents/skills/blocky-toy/scripts/validate-world-movement.mjs --self-test
   ```
3. **Verify inside your AI agent session**:
   Ask the agent:
   > *"List available skills and confirm `blocky-toy` (BLOCKY TOY) is loaded."*
4. **Start producing**:
   - **Idea Mode**: `Use blocky-toy to build a 90s rainy train-station story called "The Last Train Home" in English.`
   - **Script Mode**: `/blocky-toy --script ./my-script.md` *(defaults to `9:16` Reels; pass `--format landscape` or `--format 16:9` for widescreen)*

---

## Troubleshooting: Skill Not Showing Up?

### 1. Google Antigravity — Skill Does Not Appear or Does Not Trigger

Check these in order:

1. **Global install went to `~/.agents/skills/` instead of `~/.gemini/config/skills/`**:
   - Antigravity's global customization directory is **`~/.gemini/config/skills/`** (and `~/.gemini/config/skills.json`), while `.agents/skills/` is for **project-local** workspaces.
   - **Fix**: Run `npx blocky-toy --target antigravity --scope global` (or `--target all --scope global`).
2. **Wrong folder nesting (one level too deep or too shallow)**:
   - Antigravity scans `skills/` **exactly one level deep** for `<skill-name>/SKILL.md`.
   - Valid: `.agents/skills/blocky-toy/SKILL.md` or `~/.gemini/config/skills/blocky-toy/SKILL.md`.
   - Invalid: `.agents/skills/blocky-toy/blocky-toy/SKILL.md` or `.agents/blocky-toy/SKILL.md`.
3. **Workspace / `.git` root mismatch**:
   - Antigravity walks upward from your current working directory only up to the repository root (the folder containing `.git`).
   - If you installed `.agents/skills/blocky-toy/` in a parent folder **above** `.git`, or inside a sibling folder outside your open workspace, Antigravity will not discover it.
   - **Fix**: Install directly inside the workspace root (`npx blocky-toy --target antigravity --project /path/to/workspace`), or install globally (`--scope global`).
4. **Start a New Conversation / Reload Window**:
   - Skill discovery runs when a session initializes. After installing or editing `SKILL.md`, start a **New Conversation** (or reload the Antigravity IDE window) so it rescans skill folders.
5. **Progressive disclosure makes it look "inactive" until triggered**:
   - By design, Antigravity only injects a skill's `name` and `description` at startup and reads `SKILL.md` only when activated.
   - **Fix**: Explicitly test by asking *"List all available skills"* or invoke it directly: *"Use the `blocky-toy` skill to ..."* or `/blocky-toy ...`.
6. **Broken / dangling symlink**:
   - If you previously installed via symlink from a local clone or temp folder that was later moved/deleted, `SKILL.md` becomes unreadable.
   - **Fix**: Verify with `cat .agents/skills/blocky-toy/SKILL.md | head -n 10` (or `~/.gemini/config/skills/blocky-toy/SKILL.md`). If missing, reinstall cleanly with `--copy`:
     ```bash
     npx --yes blocky-toy@latest --target antigravity --copy
     ```
7. **Workspace override / duplicate older copy**:
   - Antigravity priority order is: Workspace `.agents/skills/` → `skills.json` → `~/.gemini/config/skills/`.
   - If you updated your global copy (`~/.gemini/config/skills/blocky-toy/`) but still have an old copy in `.agents/skills/blocky-toy/` inside the project, the old workspace copy overrides the global one. Remove or update the project copy.

---

### 2. `npx` Installation Issues

- **`sh: blocky-toy: command not found` when running `npx blocky-toy` inside the `blocky-toy` repo**:
  - Because the repo's own `package.json` is named `blocky-toy`, `npx` assumes it is already in the package directory and looks for `./node_modules/.bin/blocky-toy`.
  - **Fix**: `cd` into your target project directory first before running `npx blocky-toy`, or run `node scripts/install.mjs --target all --project /path/to/your-project`.
- **`npx` runs an older cached version**:
  - Clear or bypass the cache with `@latest`:
    ```bash
    npx --yes blocky-toy@latest --version
    npx --yes blocky-toy@latest --target all
    ```

---

### 3. Claude Code / OpenCode / Codex CLI / Cursor Quick Fixes

- **Claude Code**: Confirm `~/.claude/skills/blocky-toy/SKILL.md` (or `.claude/skills/blocky-toy/SKILL.md`) exists, then start a new `claude` session and run `/blocky-toy` or ask it to list skills.
- **OpenCode**: Run `/skills` inside OpenCode to inspect discovered skills; verify `.opencode/skills/blocky-toy/SKILL.md`, `.agents/skills/blocky-toy/SKILL.md`, or `~/.config/opencode/skills/blocky-toy/SKILL.md`.
- **OpenAI Codex CLI**: Verify `.agents/skills/blocky-toy/SKILL.md` (project) or `~/.codex/skills/blocky-toy/SKILL.md` (global) and restart the Codex session.
- **Cursor**: Verify `.cursor/skills/blocky-toy/SKILL.md` (project) or `~/.cursor/skills/blocky-toy/SKILL.md` (global), then reload Cursor's window if it was already open.
- **Any Agent Fallback**: Paste or reference `@.agents/skills/blocky-toy/SKILL.md` directly in `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, or your first prompt.

---

## Uninstalling & Updating

### Update to the Latest Version
```bash
# Project-local:
npx --yes blocky-toy@latest --target all

# Global:
npx --yes blocky-toy@latest --target all --scope global
```

### Uninstall Cleanly
```bash
# Project-local:
npx blocky-toy --target all --scope project --project /path/to/your-project --uninstall

# Global:
npx blocky-toy --target all --scope global --uninstall
```
