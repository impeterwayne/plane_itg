# Plane ITG (`plane_itg`)

> **Pure CLI tool and Node.js client for Plane ITG: task synchronization, offline evidence crawling, video keyframe extraction, and git worktree linking.**

[![Self-Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- **Pure CLI Architecture**:
  - Fast, scriptable, and automated execution with zero TUI overhead.
  - Machine-readable `--json` output and safe `--dry-run` simulation on all commands.
- **Evidence & Media Crawler**:
  - Downloads native Plane `<image-component>` embedded images.
  - Scrapes and archives Lightshot (`prnt.sc`) screenshots.
  - Downloads full MP4 video recordings and poster images from `streamable.com`.
  - Downloads issue attachments directly from the Plane REST API.
- **Video Keyframe & Storyboard Extraction**:
  - Uses `ffmpeg` to detect scene transitions and extract 1-second keyframe sequences.
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

## 🚀 Quick Start

### 1. Installation

```bash
# Link globally
npm link

# Or run directly
node bin/cli.js <command>
```

### 2. CLI Usage

```bash
# View active configuration and resolved project
plane-itg config

# Save your Plane API key
plane-itg auth plane_api_your_key_here

# Browse or search available projects
plane-itg projects
plane-itg projects "android"

# Link a project ID or key to current workspace
plane-itg project COD

# Synchronize all tasks and download evidence
plane-itg sync

# Synchronize specific categories only
plane-itg sync --categories backlog,todo

# List issues directly in terminal
plane-itg issues
plane-itg issues "login"

# Open an issue or project in the default browser
plane-itg open COD-101
```

All commands support `--dry-run` and `--json`:
```bash
plane-itg sync --categories backlog,todo --dry-run
plane-itg issues "login" --json
```

---

## ⚙️ Configuration

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

## 🧪 Testing

Run the automated self-test suite:

```bash
npm test
# or
node test/self-test.js
```

---

## 📄 License

MIT © Nguyen Khac Cuong
