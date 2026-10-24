# Agent Development Rules & Guidelines for Plane ITG

Instructions and guidelines for AI coding agents maintaining and extending the `plane_itg` repository and CLI tool.

---

## 1. Feature Implementation Rules

### Rule 1: Always Run & Update Self-Tests
- **Every feature or modification MUST pass self-tests.**
- Run self-tests with:
  ```bash
  node scripts/self-test.js
  # or
  node test/self-test.js
  ```
- When adding a new command, option, or capability, add corresponding assertions to `test/self-test.js` covering syntax, manifest declarations, and `--dry-run` outputs.

### Rule 2: Support `--dry-run` on All CLI Entrypoints
- Every command and sub-command (`sync`, `issues`, `projects`, `auth`, `project`, `open`, `config`, `popup`) **MUST** support the `--dry-run` flag.
- `--dry-run` output must be machine-readable JSON printed to `stdout` containing the resolved action and command parameters without modifying session or file state.

### Rule 3: Zero External npm Dependencies
- The tool and plugin must remain zero-dependency: only standard Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:net`, `node:os`) are allowed.
- No third-party npm runtime dependencies should be introduced.

### Rule 4: Multi-Worktree Consistency
- When synchronizing tasks or generating `plane/TASK_LIST.md`, the output must live inside `plane/` and be linked across all sibling git worktrees via directory junctions / symlinks.
- Do not create redundant copies or exclude `plane/` from git tracking.

---

## 2. Quick Reference Commands

| Task | Command |
| :--- | :--- |
| **Run Self-Tests** | `node test/self-test.js` |
| **Launch Interactive TUI** | `node bin/cli.js` |
| **Sync Backlog & Todo (dry-run)** | `node bin/cli.js sync --categories backlog,todo --dry-run` |
| **List Issues (dry-run)** | `node bin/cli.js issues --dry-run` |
| **Popup Launch (dry-run)** | `node bin/popup.js --dry-run` |
| **Link Plugin to Herdr** | `herdr plugin link .` |
