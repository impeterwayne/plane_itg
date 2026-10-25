#!/usr/bin/env node
'use strict';

const path = require('node:path');
const plane = require('../lib/plane');

const pkg = require('../package.json');

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const jsonOutput = argv.includes('--json');

function printHelp(code = 0) {
  process.stdout.write(`
plane v${pkg.version} — Interactive TUI & CLI for Plane ITG task sync & offline evidence crawler

Usage:
  plane [command] [options]

Commands:
  (default) / tui            Launch the interactive Plane TUI
  sync                       Sync Plane tasks, comments, evidence & generate TASK_LIST.md
  issues [query]             List and filter issues for the current project
  projects [query]           List available projects in Plane workspace
  project [id|key]           View or set active project ID for current workspace
  auth [api-key]             View or set Plane API key
  open [issue-id]            Open issue or project in web browser
  config                     Display active resolved Plane configuration

Options:
  --categories <cat,cat...>  Task scopes: all, backlog, todo, in_progress, done, cancelled
  --worktree <path>          Target directory/workspace (default: current directory)
  --dry-run                  Simulate command and output JSON without making changes
  --json                     Output result in machine-readable JSON format
  --help, -h                 Show this help message
  --version, -V              Show version number

Examples:
  plane
  plane sync
  plane sync --categories backlog,todo
  plane issues "login"
  plane project COD
  plane auth plane_api_xxx
  plane open COD-101
\n`);
  process.exit(code);
}

if (argv.includes('--help') || argv.includes('-h')) {
  printHelp(0);
}

if (argv.includes('--version') || argv.includes('-V')) {
  process.stdout.write(`v${pkg.version}\n`);
  process.exit(0);
}

const nonFlags = argv.filter((a) => !a.startsWith('--'));
const command = nonFlags[0] || 'tui';
const arg1 = nonFlags[1];

function getWorktreeTarget() {
  const wtIdx = argv.indexOf('--worktree');
  if (wtIdx !== -1 && argv[wtIdx + 1]) {
    return path.resolve(argv[wtIdx + 1]);
  }
  return process.cwd();
}

function getCategories() {
  const catIdx = argv.indexOf('--categories');
  if (catIdx !== -1 && argv[catIdx + 1]) {
    return argv[catIdx + 1].split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  }
  return ['all'];
}

async function run() {
  const targetPath = getWorktreeTarget();
  const cfg = plane.config(targetPath);

  switch (command) {
    case 'tui': {
      if (dryRun) {
        process.stdout.write(
          `${JSON.stringify({
            command: 'tui',
            dryRun: true,
            targetPath,
            configured: plane.isConfigured(cfg),
            config: {
              baseUrl: cfg.baseUrl,
              workspaceSlug: cfg.workspaceSlug,
              projectId: cfg.projectId || null,
              hasApiKey: Boolean(cfg.apiKey),
            },
          })}\n`
        );
        return;
      }
      const { App, requireTTY } = require('../lib/app');
      const { planeView } = require('../lib/views');
      requireTTY('plane');
      new App({
        view: planeView,
        cwd: targetPath,
        popup: false,
        escapeQuits: true,
      }).start();
      break;
    }

    case 'config': {
      const summary = {
        command: 'config',
        dryRun,
        configPath: plane.configPath(),
        isConfigured: plane.isConfigured(cfg),
        baseUrl: cfg.baseUrl,
        workspaceSlug: cfg.workspaceSlug,
        projectId: cfg.projectId || null,
        apiKey: cfg.apiKey ? `${cfg.apiKey.slice(0, 10)}…` : null,
        parentRoot: cfg.parentRoot || null,
      };
      if (jsonOutput || dryRun) {
        process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
      } else {
        process.stdout.write(`Plane Configuration:\n`);
        process.stdout.write(`  Config file:    ${summary.configPath}\n`);
        process.stdout.write(`  Status:         ${summary.isConfigured ? 'Configured' : 'Incomplete'}\n`);
        process.stdout.write(`  Base URL:       ${summary.baseUrl}\n`);
        process.stdout.write(`  Workspace Slug: ${summary.workspaceSlug}\n`);
        process.stdout.write(`  Project ID:     ${summary.projectId || '(none)'}\n`);
        process.stdout.write(`  API Key:        ${summary.apiKey || '(none)'}\n`);
        if (summary.parentRoot) {
          process.stdout.write(`  Workspace Root: ${summary.parentRoot}\n`);
        }
      }
      break;
    }

    case 'auth':
    case 'key': {
      const newKey = arg1;
      if (!newKey) {
        const masked = cfg.apiKey ? `${cfg.apiKey.slice(0, 10)}…` : '(none)';
        if (jsonOutput || dryRun) {
          process.stdout.write(
            `${JSON.stringify({ command: 'auth', dryRun, hasKey: Boolean(cfg.apiKey), keyMasked: masked })}\n`
          );
        } else {
          process.stdout.write(`Current API Key: ${masked}\n`);
        }
        return;
      }

      if (dryRun) {
        process.stdout.write(
          `${JSON.stringify({ command: 'auth', dryRun: true, action: 'saveApiKey', apiKeyMasked: `${newKey.slice(0, 6)}…` })}\n`
        );
        return;
      }

      const res = plane.saveApiKey(newKey);
      if (!res.ok) {
        process.stderr.write(`Error: ${res.error}\n`);
        process.exit(1);
      }
      if (jsonOutput) {
        process.stdout.write(`${JSON.stringify({ success: true, saved: true })}\n`);
      } else {
        process.stdout.write(`Saved Plane API key to ${plane.configPath()}\n`);
      }
      break;
    }

    case 'project': {
      if (!arg1) {
        if (jsonOutput || dryRun) {
          process.stdout.write(
            `${JSON.stringify({
              command: 'project',
              dryRun,
              projectId: cfg.projectId || null,
              parentRoot: cfg.parentRoot || null,
            })}\n`
          );
        } else {
          process.stdout.write(`Active Project ID: ${cfg.projectId || '(none)'}\n`);
          if (cfg.parentRoot) process.stdout.write(`Workspace: ${cfg.parentRoot}\n`);
        }
        return;
      }

      const targetId = arg1;
      if (dryRun) {
        process.stdout.write(
          `${JSON.stringify({ command: 'project', dryRun: true, targetPath, projectId: targetId })}\n`
        );
        return;
      }

      const res = plane.saveWorkspaceProjectId(targetPath, targetId);
      if (jsonOutput) {
        process.stdout.write(`${JSON.stringify(res)}\n`);
      } else {
        process.stdout.write(`Linked project ID "${res.projectId}" to ${res.parentRoot}\n`);
      }
      break;
    }

    case 'projects': {
      if (dryRun) {
        process.stdout.write(
          `${JSON.stringify({ command: 'projects', dryRun: true, query: arg1 || null })}\n`
        );
        return;
      }

      if (!cfg.apiKey) {
        process.stderr.write(`Error: Plane API key not configured. Run "plane auth <api-key>"\n`);
        process.exit(1);
      }

      const allProjs = await plane.projects(cfg);
      const filtered = arg1 ? plane.filterProjects(allProjs, arg1) : allProjs;

      if (jsonOutput) {
        process.stdout.write(`${JSON.stringify(filtered, null, 2)}\n`);
      } else {
        process.stdout.write(`Found ${filtered.length} project(s):\n\n`);
        for (const p of filtered) {
          const isCur = p.id === cfg.projectId ? ' *' : '  ';
          process.stdout.write(`${isCur} [${p.identifier || '---'}] ${p.name} (id: ${p.id})\n`);
        }
      }
      break;
    }

    case 'issues':
    case 'list': {
      if (dryRun) {
        process.stdout.write(
          `${JSON.stringify({ command: 'issues', dryRun: true, query: arg1 || null })}\n`
        );
        return;
      }

      if (!plane.isConfigured(cfg)) {
        process.stderr.write(`Error: Plane is not fully configured (check API key and project ID).\n`);
        process.exit(1);
      }

      const allIssues = await plane.issues(cfg);
      const filtered = arg1 ? plane.filterIssues(allIssues, arg1) : allIssues;

      if (jsonOutput) {
        process.stdout.write(`${JSON.stringify(filtered, null, 2)}\n`);
      } else {
        process.stdout.write(`Found ${filtered.length} issue(s):\n\n`);
        for (const item of filtered) {
          const tag = item.identifier ? `${item.identifier}-${item.sequence}` : `#${item.sequence}`;
          process.stdout.write(`  ${tag.padEnd(10)} [${item.stateName}] ${item.name} (${item.priority})\n`);
        }
      }
      break;
    }

    case 'open': {
      const issueId = arg1;
      let targetUrl = null;
      if (!issueId) {
        targetUrl = plane.webUrl(null, cfg);
      } else {
        targetUrl = `${cfg.baseUrl.replace(/\/+$/, '')}/${cfg.workspaceSlug}/projects/${cfg.projectId}/issues/${issueId}`;
      }

      if (dryRun) {
        process.stdout.write(`${JSON.stringify({ command: 'open', dryRun: true, url: targetUrl })}\n`);
        return;
      }

      plane.openBrowser(targetUrl);
      if (jsonOutput) {
        process.stdout.write(`${JSON.stringify({ opened: true, url: targetUrl })}\n`);
      } else {
        process.stdout.write(`Opened ${targetUrl}\n`);
      }
      break;
    }

    case 'sync': {
      const categories = getCategories();
      if (dryRun) {
        process.stdout.write(
          `${JSON.stringify({
            command: 'sync',
            dryRun: true,
            targetPath,
            categories,
            isConfigured: plane.isConfigured(cfg),
            parentRoot: cfg.parentRoot || null,
          })}\n`
        );
        return;
      }

      if (!plane.isConfigured(cfg)) {
        process.stderr.write(`Error: Plane is not fully configured. API key or project ID missing.\n`);
        process.exit(1);
      }

      process.stdout.write(`Starting Plane sync for ${targetPath}…\n`);
      const res = await plane.syncProject(targetPath, cfg, { categories }, (msg) => {
        if (!jsonOutput) {
          process.stdout.write(`  ${msg}\n`);
        }
      });

      if (jsonOutput) {
        process.stdout.write(`${JSON.stringify(res, null, 2)}\n`);
      } else {
        process.stdout.write(
          `\n✔ Synced ${res.taskCount} tasks, ${res.evidenceCount} evidence items → ${res.path}\n`
        );
      }
      break;
    }

    default: {
      process.stderr.write(`Unknown command: ${command}\n`);
      printHelp(1);
    }
  }
}

run().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
