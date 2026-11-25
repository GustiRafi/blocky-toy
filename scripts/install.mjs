#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, '..');
const SKILL_NAME = 'blocky-toy';

const TARGET_MAP = {
  universal: {
    label: 'Universal Agent Skills (.agents/skills — Antigravity, OpenCode, Codex, Gemini CLI)',
    projectRel: path.join('.agents', 'skills', SKILL_NAME),
    globalAbs: () => path.join(os.homedir(), '.agents', 'skills', SKILL_NAME),
  },
  antigravity: {
    label: 'Google Antigravity (.agents/skills)',
    projectRel: path.join('.agents', 'skills', SKILL_NAME),
    globalAbs: () => path.join(os.homedir(), '.agents', 'skills', SKILL_NAME),
  },
  claude: {
    label: 'Claude Code (.claude/skills)',
    projectRel: path.join('.claude', 'skills', SKILL_NAME),
    globalAbs: () => path.join(os.homedir(), '.claude', 'skills', SKILL_NAME),
  },
  opencode: {
    label: 'OpenCode (.opencode/skills)',
    projectRel: path.join('.opencode', 'skills', SKILL_NAME),
    globalAbs: () => path.join(os.homedir(), '.config', 'opencode', 'skills', SKILL_NAME),
  },
  codex: {
    label: 'OpenAI Codex CLI (.agents/skills | ~/.codex/skills)',
    projectRel: path.join('.agents', 'skills', SKILL_NAME),
    globalAbs: () => path.join(os.homedir(), '.codex', 'skills', SKILL_NAME),
  },
  cursor: {
    label: 'Cursor Skills (.cursor/skills)',
    projectRel: path.join('.cursor', 'skills', SKILL_NAME),
    globalAbs: () => path.join(os.homedir(), '.cursor', 'skills', SKILL_NAME),
  },
};

const CORE_ITEMS = ['SKILL.md', 'README.md', 'references', 'templates', 'scripts'];

function copySkillFiles(destDir, includeMedia = false) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const item of CORE_ITEMS) {
    const src = path.join(SKILL_ROOT, item);
    const dst = path.join(destDir, item);
    if (!fs.existsSync(src)) continue;
    fs.cpSync(src, dst, { recursive: true, force: true });
  }
  if (includeMedia) {
    const docsSrc = path.join(SKILL_ROOT, 'docs');
    if (fs.existsSync(docsSrc)) {
      fs.cpSync(docsSrc, path.join(destDir, 'docs'), { recursive: true, force: true });
    }
  }
}

export function resolveInstallPaths({ target, scope, projectDir }) {
  const targets =
    target === 'all'
      ? ['universal', 'claude', 'opencode', 'codex', 'cursor']
      : target.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

  const resolved = [];
  const seenPaths = new Set();

  for (const t of targets) {
    const spec = TARGET_MAP[t];
    if (!spec) {
      throw new Error(
        `Unknown target "${t}". Valid targets: ${Object.keys(TARGET_MAP).join(', ')}, all`
      );
    }
    const dest =
      scope === 'global' ? spec.globalAbs() : path.resolve(projectDir, spec.projectRel);
    if (!seenPaths.has(dest)) {
      seenPaths.add(dest);
      resolved.push({ target: t, label: spec.label, dest });
    }
  }
  return resolved;
}

function installToPath(dest, { mode, dryRun, includeMedia, uninstall }) {
  if (dryRun) {
    console.log(`[DRY-RUN] ${uninstall ? 'REMOVE' : mode.toUpperCase()} -> ${dest}`);
    return;
  }

  if (fs.existsSync(dest) || fs.lstatSync(dest, { throwIfNoEntry: false })) {
    fs.rmSync(dest, { recursive: true, force: true });
  }

  if (uninstall) {
    console.log(`[REMOVED] ${dest}`);
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (mode === 'symlink') {
    fs.symlinkSync(SKILL_ROOT, dest, 'dir');
    console.log(`[LINKED] ${dest} -> ${SKILL_ROOT}`);
  } else {
    copySkillFiles(dest, includeMedia);
    console.log(`[COPIED] ${dest} (core skill files${includeMedia ? ' + docs/media' : ''})`);
  }
}

function runSelfTest() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cinematic-skill-install-test-'));
  try {
    const allTargets = resolveInstallPaths({ target: 'all', scope: 'project', projectDir: tmpRoot });
    if (allTargets.length !== 4) {
      throw new Error(`Expected 4 unique project install paths (deduped universal/codex), got ${allTargets.length}`);
    }
    for (const entry of allTargets) {
      installToPath(entry.dest, { mode: 'copy', dryRun: false, includeMedia: false, uninstall: false });
      const skillMd = path.join(entry.dest, 'SKILL.md');
      if (!fs.existsSync(skillMd)) throw new Error(`Missing SKILL.md at ${entry.dest}`);
      if (fs.existsSync(path.join(entry.dest, 'docs', 'media'))) {
        throw new Error(`Unexpected heavy docs/media copied into lightweight copy at ${entry.dest}`);
      }
    }
    const globalOpenCode = resolveInstallPaths({ target: 'opencode', scope: 'global', projectDir: tmpRoot });
    if (!globalOpenCode[0].dest.endsWith(path.join('.config', 'opencode', 'skills', SKILL_NAME))) {
      throw new Error(`Unexpected OpenCode global path: ${globalOpenCode[0].dest}`);
    }
    console.log(
      `SELF-TEST PASSED: verified project paths for Antigravity/Universal, Claude Code, OpenCode, Codex, Cursor (${allTargets.length} dirs) + lightweight copy.`
    );
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

function printHelp() {
  console.log(`BLOCKY TOY — 3D Animation Skill Installer

Usage:
  node scripts/install.mjs --target <target> [options]

Targets:
  universal     .agents/skills/ (Antigravity, OpenCode, Codex CLI, Gemini CLI)
  antigravity   .agents/skills/ (project) or ~/.agents/skills/ (global)
  claude        .claude/skills/ (project) or ~/.claude/skills/ (global)
  opencode      .opencode/skills/ (project) or ~/.config/opencode/skills/ (global)
  codex         .agents/skills/ (project) or ~/.codex/skills/ (global)
  cursor        .cursor/skills/ (project) or ~/.cursor/skills/ (global)
  all           Install into universal + claude + opencode + codex + cursor

Options:
  --scope <project|global>   Install inside target repo or user home (default: project)
  --project <path>           Target project root for --scope project (default: cwd)
  --copy                     Copy core skill files instead of symlinking
  --with-media               Include docs/media screenshots & demo MP4 when using --copy
  --dry-run                  Preview exact destination paths without modifying disk
  --uninstall                Remove installed skill directory/symlink
  --self-test                Run installer verification inside a temp directory
`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  if (args.includes('--self-test')) {
    runSelfTest();
    process.exit(0);
  }

  const getArg = (flag, fallback = null) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : fallback;
  };

  const target = getArg('--target', 'universal');
  const scope = getArg('--scope', 'project');
  const projectDir = getArg('--project', process.cwd());
  const mode = args.includes('--copy') ? 'copy' : 'symlink';
  const includeMedia = args.includes('--with-media');
  const dryRun = args.includes('--dry-run');
  const uninstall = args.includes('--uninstall');

  if (scope !== 'project' && scope !== 'global') {
    console.error(`Invalid --scope "${scope}". Use "project" or "global".`);
    process.exit(1);
  }

  const entries = resolveInstallPaths({ target, scope, projectDir });
  for (const e of entries) {
    console.log(`Target: ${e.label}`);
    installToPath(e.dest, { mode, dryRun, includeMedia, uninstall });
  }
}
