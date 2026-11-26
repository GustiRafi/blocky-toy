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

export function resolveDefaultInstallMode(args, skillRoot = SKILL_ROOT) {
  if (args.includes('--copy')) return 'copy';
  if (args.includes('--symlink')) return 'symlink';
  // Temporary npx/dlx cache and node_modules paths can be evicted or upgraded, so default to standalone copy
  if (
    skillRoot.includes(`${path.sep}_npx${path.sep}`) ||
    skillRoot.includes(`${path.sep}node_modules${path.sep}`)
  ) {
    return 'copy';
  }
  return 'symlink';
}

function readPackageVersion() {
  const pkgPath = path.join(SKILL_ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) return 'unknown';
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function isDirectCliInvocation() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(__filename);
  } catch {
    return path.resolve(process.argv[1]) === path.resolve(__filename);
  }
}

function runSelfTest() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cinematic-skill-install-test-'));
  try {
    const allTargets = resolveInstallPaths({ target: 'all', scope: 'project', projectDir: tmpRoot });
    if (allTargets.length !== 4) {
      throw new Error(`Expected 4 unique project install paths (deduped universal/codex), got ${allTargets.length}`);
    }
    if (resolveDefaultInstallMode([], `${path.sep}tmp${path.sep}_npx${path.sep}abc${path.sep}blocky-toy`) !== 'copy') {
      throw new Error('Expected _npx cache invocation to default to copy mode');
    }
    if (resolveDefaultInstallMode([], `${path.sep}usr${path.sep}local${path.sep}lib${path.sep}node_modules${path.sep}blocky-toy`) !== 'copy') {
      throw new Error('Expected node_modules invocation to default to copy mode');
    }
    if (resolveDefaultInstallMode([], SKILL_ROOT) !== 'symlink') {
      throw new Error('Expected local repo invocation to default to symlink mode');
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
      `SELF-TEST PASSED: verified project paths for Antigravity/Universal, Claude Code, OpenCode, Codex, Cursor (${allTargets.length} dirs) + npx/node_modules copy-mode fallback.`
    );
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

function printHelp() {
  console.log(`BLOCKY TOY — 3D Animation Skill Installer

Usage:
  npx blocky-toy --target <target> [options]
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
  --copy                     Copy core skill files instead of symlinking (auto under npx)
  --symlink                  Force directory symlink instead of copying
  --with-media               Include docs/media screenshots & demo MP4 when using --copy
  --dry-run                  Preview exact destination paths without modifying disk
  --uninstall                Remove installed skill directory/symlink
  --self-test                Run installer verification inside a temp directory
  -v, --version              Print package version
  -h, --help                 Show this help message
`);
}

function parseCliArgs(args) {
  const VALUE_FLAGS = new Set(['--target', '--scope', '--project']);
  const BOOL_FLAGS = new Set([
    '--copy',
    '--symlink',
    '--with-media',
    '--dry-run',
    '--uninstall',
  ]);
  const parsed = {
    target: 'universal',
    scope: 'project',
    projectDir: process.cwd(),
    includeMedia: false,
    dryRun: false,
    uninstall: false,
  };

  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (VALUE_FLAGS.has(token)) {
      const value = args[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error(`Missing value for ${token}`);
      }
      if (token === '--target') parsed.target = value;
      else if (token === '--scope') parsed.scope = value;
      else if (token === '--project') parsed.projectDir = value;
      i++;
    } else if (BOOL_FLAGS.has(token)) {
      if (token === '--with-media') parsed.includeMedia = true;
      else if (token === '--dry-run') parsed.dryRun = true;
      else if (token === '--uninstall') parsed.uninstall = true;
    } else {
      throw new Error(`Unknown option "${token}". Run with --help for usage.`);
    }
  }
  return parsed;
}

if (isDirectCliInvocation()) {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  if (args.includes('--version') || args.includes('-v')) {
    console.log(readPackageVersion());
    process.exit(0);
  }
  if (args.includes('--self-test')) {
    runSelfTest();
    process.exit(0);
  }

  let options;
  try {
    options = parseCliArgs(args);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  if (options.scope !== 'project' && options.scope !== 'global') {
    console.error(`Invalid --scope "${options.scope}". Use "project" or "global".`);
    process.exit(1);
  }

  const mode = resolveDefaultInstallMode(args);
  const entries = resolveInstallPaths({
    target: options.target,
    scope: options.scope,
    projectDir: options.projectDir,
  });
  for (const e of entries) {
    console.log(`Target: ${e.label}`);
    installToPath(e.dest, {
      mode,
      dryRun: options.dryRun,
      includeMedia: options.includeMedia,
      uninstall: options.uninstall,
    });
  }
}
