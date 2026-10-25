# Agent Development Rules & Guidelines for Plane ITG

Instructions and guidelines for AI coding agents maintaining and extending the `plane_itg` repository and interactive TUI / CLI tool (`plane`).

---

## 1. Feature Implementation Rules

### Rule 1: Standalone TUI + CLI Architecture
- `plane` launches the interactive Terminal User Interface (TUI) by default (`plane` or `plane tui`), while also providing direct CLI subcommands (`sync`, `issues`, `projects`, `auth`, `project`, `open`, `config`).
- All CLI subcommands support `--json` and `--dry-run`.

### Rule 2: Support `--dry-run` on All CLI Entrypoints
- Every command (`tui`, `sync`, `issues`, `projects`, `auth`, `project`, `open`, `config`) **MUST** support the `--dry-run` flag.
- `--dry-run` output must be machine-readable JSON printed to `stdout` containing the resolved action and command parameters without modifying session or file state.

### Rule 3: Zero External npm Dependencies
- The tool must remain zero-dependency: only standard Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:net`, `node:os`) are allowed.
- No third-party npm runtime dependencies should be introduced.

### Rule 4: Always Run & Update Self-Tests
- **Every feature or modification MUST pass self-tests.**
- Run self-tests with:
  ```bash
  node scripts/self-test.js
  # or
  node test/self-test.js
  ```
- When adding a new command, option, or capability, add corresponding assertions to `test/self-test.js` covering syntax and `--dry-run` outputs.

### Rule 5: Multi-Worktree Consistency
- When synchronizing tasks or generating `plane/TASK_LIST.md`, the output must live inside `plane/` and be linked across all sibling git worktrees via directory junctions / symlinks.
- Do not create redundant copies or exclude `plane/` from git tracking.

---

## 2. Quick Reference Commands

| Task | Command |
| :--- | :--- |
| **Run Self-Tests** | `node test/self-test.js` |
| **Launch Interactive TUI** | `node bin/cli.js` |
| **Launch TUI (dry-run)** | `node bin/cli.js tui --dry-run` |
| **Sync Tasks (dry-run)** | `node bin/cli.js sync --dry-run` |
| **List Issues (dry-run)** | `node bin/cli.js issues --dry-run` |
| **Show Config (dry-run)** | `node bin/cli.js config --dry-run` |
| **Set API Key (dry-run)** | `node bin/cli.js auth <key> --dry-run` |
