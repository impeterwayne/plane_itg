# Plane ITG (`plane_itg`)

> **Interactive TUI, CLI, and Node.js SDK for Plane ITG: task synchronization, offline evidence crawling, video keyframe extraction, and git worktree linking.**

[![npm version](https://img.shields.io/npm/v/plane_itg.svg)](https://www.npmjs.com/package/plane_itg)
[![npm downloads](https://img.shields.io/npm/dm/plane_itg.svg)](https://www.npmjs.com/package/plane_itg)
[![Self-Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](test/self-test.js)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](package.json)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**English** | [Tiếng Việt](README.vi.md)

---

## Features

- **Interactive Terminal TUI**:
  - Full-screen terminal user interface with keyboard and mouse navigation.
  - Live search filters (`/`) for tasks and projects.
  - Interactive project switcher (`p`) and sync scope selector (`s`).
  - Direct API key entry (`k`) with interactive terminal or native GUI prompts.
- **Direct CLI Subcommands**:
  - Scriptable subcommands (`sync`, `issues`, `projects`, `project`, `auth`, `open`, `ffmpeg`, `config`) with `--json` output and safe `--dry-run` simulation.
- **Evidence & Media Crawler**:
  - Downloads native Plane `<image-component>` embedded images.
  - Scrapes and archives Lightshot (`prnt.sc`) screenshots.
  - Downloads full MP4 video recordings and poster images from `streamable.com`.
  - Downloads issue attachments directly from the Plane REST API.
- **Video Keyframe & Storyboard Extraction**:
  - Uses `ffmpeg` to detect scene transitions and extract 1-second keyframe sequences.
  - Automatically detects system `ffmpeg` and downloads/installs a portable `ffmpeg` binary (`~/.config/plane_itg/bin/`) if missing on the user's device.
  - Generates tiled JPEG storyboards (`<mediaId>_storyboard.jpg`) for visual inspection.
  - Writes individual keyframe files (`frame_01_00.0s.jpg`, etc.).
- **Offline Markdown Task Lists**:
  - Generates comprehensive `plane/TASK_LIST.md` organized by state (Backlog, Todo, In Progress, Done, Cancelled).
  - Generates individual per-task files (`plane/evidence/<taskID>/<taskID>.md`) with descriptions, comments, evidence previews, and embedded video tags.
- **Multi-Worktree Sync**:
  - Discovers the parent git repository and all sibling git worktrees.
  - Automatically symlinks/junctions the `plane/` directory across all worktrees.
- **Zero External Dependencies**:
  - Built strictly using Node.js standard modules (`node:fs`, `node:path`, `node:child_process`, `fetch`).

---

## Installation & Quick Start

### Option 1: Install Globally via npm (Recommended)

```bash
npm install -g plane_itg

# Launch the interactive TUI
plane
```

### Option 2: Run Instantly with `npx` (Zero Install)

```bash
# Launch interactive TUI
npx plane_itg

# Or run any CLI subcommand directly
npx plane_itg sync --categories backlog,todo
```

### Option 3: Add to a Project (`package.json` Integration)

Install as a dev or runtime dependency in any repository:

```bash
npm install -D plane_itg
```

Add convenient scripts to your project's `package.json`:

```json
{
  "scripts": {
    "plane": "plane",
    "plane:sync": "plane sync --categories backlog,todo,in_progress",
    "plane:issues": "plane issues"
  }
}
```

### Option 4: Local Development from Source

```bash
git clone https://github.com/impeterwayne/plane_itg.git
cd plane_itg
npm link
```

---

## CLI Usage

```bash
# Launch interactive TUI explicitly
plane tui

# View active configuration and resolved project
plane config

# Save your Plane API key
plane auth plane_api_your_key_here

# Browse or search available projects
plane projects
plane projects "android"

# Link a project ID or key to current workspace
plane project COD

# Synchronize all tasks and download evidence
plane sync

# Synchronize specific categories only
plane sync --categories backlog,todo

# List issues directly in terminal
plane issues
plane issues "login"

# Open an issue or project in the default browser
plane open COD-101

# Check or auto-install portable ffmpeg
plane ffmpeg
```

All commands support `--dry-run` and `--json`:

```bash
plane sync --categories backlog,todo --dry-run
plane issues "login" --json
```

---

## Programmatic Node.js API

You can require `plane_itg` directly in Node.js scripts or automation pipelines:

```js
const plane = require('plane_itg');

async function main() {
  const worktree = process.cwd();

  // 1. Save API key or link project ID programmatically
  plane.saveApiKey(process.env.PLANE_API_KEY);
  plane.saveWorkspaceProjectId(worktree, 'COD');

  // 2. Resolve active configuration for the workspace
  const cfg = plane.config(worktree);

  // 3. Fetch projects or issues
  const allProjects = await plane.projects(cfg);
  const openIssues = await plane.issues(cfg);

  // 4. Synchronize tasks, comments, media evidence, and worktree links
  const result = await plane.sync(worktree, {
    categories: ['backlog', 'todo', 'in_progress'],
  }, (progressMsg) => {
    console.log(progressMsg);
  });

  console.log(`Synced ${result.taskCount} tasks to ${result.path}`);
}

main();
```

### Key Exported Methods

| Method | Description |
| :--- | :--- |
| `plane.config(worktreePath)` | Resolves configuration (`baseUrl`, `workspaceSlug`, `projectId`, `apiKey`, `parentRoot`). |
| `plane.sync(worktreePath, options, onProgress)` | Syncs tasks, comments, media evidence, and generates `plane/TASK_LIST.md`. |
| `plane.syncProject(worktreePath, cfg, options, onProgress)` | Syncs project using an explicit configuration object. |
| `plane.issues(cfg)` | Fetches all issues for the configured project. |
| `plane.projects(cfg)` | Fetches all projects in the Plane workspace. |
| `plane.saveApiKey(apiKey)` | Sanitizes and saves the Plane API key to global config. |
| `plane.saveWorkspaceProjectId(worktreePath, projectId)` | Maps a workspace root path to a Plane project ID or identifier. |
| `plane.ensureWorktreePlane(worktreePath, parentRoot)` | Links `plane/` across sibling git worktrees. |
| `plane.ensureFfmpeg(options, onProgress)` | Detects or auto-installs a portable `ffmpeg` binary. |

---

## Configuration

Plane ITG resolves credentials and settings in the following order:

1. **Local project configuration**:
   - `.plane.json` in the current project or workspace root
   - `plane.json`
2. **Environment Variables**:
   - `PLANE_API_KEY`
   - `PLANE_PROJECT_ID`
3. **CodingSpace settings**:
   - Automatically reads mapped projects from `CodingSpace/workspaces.json`.
4. **Global User Configuration**:
   - `~/.config/plane_itg/plane.json`

### Example `plane.json`

```json
{
  "baseUrl": "https://plane.itgproduct.com",
  "workspaceSlug": "product",
  "apiKey": "plane_api_...",
  "projectPlaneIds": {
    "/path/to/my/project": "uuid-for-project"
  }
}
```

---

## Testing & Publishing

Run the automated self-test suite:

```bash
npm test
# or
node test/self-test.js
```

Preview the npm package tarball contents:

```bash
npm pack --dry-run
```

Publish a new release to npm:

```bash
# Manual publish (runs self-tests automatically via prepublishOnly)
npm login
npm publish

# Or trigger automated GitHub Actions publish via version tag
npm version patch
git push origin main --follow-tags
```

---

## License

[MIT](LICENSE) © Peter Wayne (Nguyen Khac Cuong)
