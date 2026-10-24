'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function resolveContext() {
  return { cwd: process.cwd() };
}

function findRepoRoot(dir) {
  if (!dir) return null;
  let current = path.resolve(dir);
  for (let i = 0; i < 40; i += 1) {
    if (fs.existsSync(path.join(current, '.git'))) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function findParentRepoRoot(dir) {
  if (!dir) return null;
  const repoRoot = findRepoRoot(dir);
  if (!repoRoot) return path.resolve(dir);

  const gitEntry = path.join(repoRoot, '.git');
  try {
    const stats = fs.statSync(gitEntry);
    if (stats.isDirectory()) {
      return repoRoot;
    }
    if (stats.isFile()) {
      const content = fs.readFileSync(gitEntry, 'utf8');
      const match = content.match(/^gitdir:\s*(.+)$/m);
      if (match) {
        let gitDir = match[1].trim();
        if (!path.isAbsolute(gitDir)) {
          gitDir = path.resolve(repoRoot, gitDir);
        }
        const commondirFile = path.join(gitDir, 'commondir');
        if (fs.existsSync(commondirFile)) {
          const commonRel = fs.readFileSync(commondirFile, 'utf8').trim();
          const commonGitDir = path.resolve(gitDir, commonRel);
          return path.dirname(commonGitDir);
        }
        const worktreesParent = path.resolve(gitDir, '..', '..');
        if (
          path.basename(path.dirname(gitDir)).toLowerCase() === 'worktrees' &&
          fs.existsSync(path.join(worktreesParent, 'config'))
        ) {
          return path.dirname(worktreesParent);
        }
      }
    }
  } catch (_) {}

  try {
    const { execFileSync } = require('node:child_process');
    const commonDir = execFileSync('git', ['rev-parse', '--git-common-dir'], {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: 3000,
      windowsHide: true,
    }).trim();
    if (commonDir) {
      const resolvedCommon = path.resolve(repoRoot, commonDir);
      return path.dirname(resolvedCommon);
    }
  } catch (_) {}

  return repoRoot;
}

function findAllWorktrees(dir) {
  if (!dir) return [];
  const targetDir = path.resolve(dir);
  const parentRoot = findParentRepoRoot(targetDir) || findRepoRoot(targetDir) || targetDir;
  const found = new Map();

  const add = (p) => {
    if (!p || typeof p !== 'string') return;
    try {
      const resolved = path.resolve(p);
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        const key = resolved.toLowerCase();
        if (!found.has(key)) {
          found.set(key, resolved);
        }
      }
    } catch (_) {}
  };

  add(parentRoot);
  add(targetDir);

  // 1. Try git worktree list --porcelain
  try {
    const { execFileSync } = require('node:child_process');
    const porcelain = execFileSync('git', ['worktree', 'list', '--porcelain'], {
      cwd: parentRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 4000,
      windowsHide: true,
    });
    for (const line of porcelain.split(/\r?\n/)) {
      if (line.startsWith('worktree ')) {
        const wtPath = line.slice('worktree '.length).trim();
        add(wtPath);
      }
    }
  } catch (_) {}

  // 2. Try inspecting .git/worktrees filesystem metadata
  try {
    const gitDir = path.join(parentRoot, '.git');
    if (fs.existsSync(gitDir) && fs.statSync(gitDir).isDirectory()) {
      const wtDir = path.join(gitDir, 'worktrees');
      if (fs.existsSync(wtDir) && fs.statSync(wtDir).isDirectory()) {
        for (const entry of fs.readdirSync(wtDir)) {
          const entryPath = path.join(wtDir, entry);
          const gitdirFile = path.join(entryPath, 'gitdir');
          if (fs.existsSync(gitdirFile)) {
            let target = fs.readFileSync(gitdirFile, 'utf8').trim();
            if (!path.isAbsolute(target)) {
              target = path.resolve(entryPath, target);
            }
            if (path.basename(target).toLowerCase() === '.git') {
              target = path.dirname(target);
            }
            add(target);
          }
        }
      }
    }
  } catch (_) {}

  return Array.from(found.values());
}

function configDir() {
  const home = process.env.HOME || os.homedir() || '.';
  const baseDir =
    process.env.APPDATA ||
    (process.platform === 'darwin'
      ? path.join(home, 'Library', 'Application Support')
      : path.join(home, '.config'));
  return path.join(baseDir, 'plane_itg');
}

function readConfig(name, fallback = null) {
  try {
    const file = path.join(configDir(), name);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (_) {}
  return fallback;
}

function writeConfig(name, value) {
  const dir = configDir();
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
  return file;
}

module.exports = {
  resolveContext,
  findRepoRoot,
  findParentRepoRoot,
  findAllWorktrees,
  configDir,
  readConfig,
  writeConfig,
};
