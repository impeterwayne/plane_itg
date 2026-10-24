# Plane ITG (plane_itg)

> **Plane REST API client, offline task list synchronizer, evidence crawler, and multi-worktree manager for Plane ITG.**

[![Self-Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- **Interactive Terminal TUI**:
  - Full-screen terminal user interface with keyboard and mouse navigation.
  - Live search filters (`/`) for tasks and projects.
  - Interactive project switcher (`p`) and scope selector (`s`).
  - Direct API key entry (`k`) with interactive terminal or native GUI prompts.
- **Evidence & Media Crawler**:
  - Automatically downloads native Plane `<image-component>` embedded images.
  - Scrapes and archives Lightshot (`prnt.sc`) screenshots.
  - Scrapes and downloads full MP4 recordings and poster images from `streamable.com`.
  - Downloads issue attachments directly from the Plane REST API.
- **Video Keyframe & Storyboard Extraction**:
  - Uses `ffmpeg` to detect scene transitions and extract 1-second keyframe sequences.
  - Generates tiled JPEG storyboards (`<mediaId>_storyboard.jpg`) for instant visual overview.
  - Writes individual keyframe files (`frame_01_00.0s.jpg`, etc.) for fine-grained inspection.
- **Offline Markdown Documentation**:
  - Writes comprehensive `plane/TASK_LIST.md` summarizing tasks by state (Backlog, Todo, In Progress, Done, Cancelled).
  - Generates individual per-task files (`plane/evidence/<taskID>/<taskID>.md`) with full description, comments, local media links, and embedded HTML5 `<video>` tags.
- **Multi-Worktree Sync**:
  - Automatically discovers git parent repository and all active git worktrees.
  - Symlinks or junctions `plane/` across all worktrees so your task list and evidence remain in sync everywhere.
- **Herdr Workspace & Plugin Integration**:
  - Ready to run inside [Herdr](https://herdr.dev) as a modal popup (`plane-popup`) or standalone CLI tool.
  - Zero external npm dependencies — built exclusively with native Node.js built-ins.

---

## 🚀 Quick Start

### 1. Standalone CLI Usage

```bash
# Launch interactive TUI
node bin/cli.js

# Or install globally / link locally
npm link
plane-itg
```

### 2. Common CLI Commands

```bash
# Display active configuration and resolved project
plane-itg config

# Set your Plane API key
plane-itg auth plane_api_your_key_here

# Browse or search available projects
plane-itg projects
plane-itg projects "android"

# Link a project ID or key to current workspace
plane-itg project COD

# Sync tasks and download evidence
plane-itg sync

# Sync specific categories only
plane-itg sync --categories backlog,todo

# List issues directly in terminal
plane-itg issues
plane-itg issues "login"

# Open issue or project in default browser
plane-itg open COD-101
```

All commands support `--dry-run` and `--json` for scripting and automated agent pipelines:
```bash
plane-itg sync --dry-run --json
```

---

## ⚙️ Configuration

Plane ITG resolves credentials and settings in the following order of precedence:

1. **Local project config**:
   - `.plane.json` (in workspace root or `.herdr/`)
   - `plane.json`
2. **Environment Variables**:
   - `PLANE_API_KEY` / `HERDR_PLANE_API_KEY`
   - `PLANE_PROJECT_ID` / `HERDR_PLANE_PROJECT_ID`
3. **CodingSpace settings**:
   - Automatically reads mapped projects from `CodingSpace/workspaces.json`.
4. **Global User Config**:
   - `~/.config/plane_itg/plane.json`
   - `~/.config/herdr/plugin-config/herdr-launcher/plane.json`

### `plane.json` Format

```json
{
  "baseUrl": "https://plane.itgproduct.com",
  "workspaceSlug": "product",
  "apiKey": "plane_api_...",
  "projectPlaneIds": {
    "/home/peter/Quest/herdr_launcher": "uuid-for-herdr",
    "/home/peter/Quest/plane_itg": "uuid-for-plane"
  }
}
```

---

## 🖥️ Herdr Plugin Integration

Link this plugin directly into your running Herdr session:

```bash
herdr plugin link /home/peter/Quest/plane_itg
```

Then add the shortcut to `~/.config/herdr/config.toml`:

```toml
[[keys.command]]
key = "prefix+alt+p"
type = "plugin_action"
command = "plane-itg.tool-plane"
description = "Plane tasks popup"
```

---

## 🧪 Testing

Run the automated self-test suite:

```bash
node test/self-test.js
# or
npm test
```

---

## 📄 License

MIT © Peter Wayne
