'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync, spawnSync } = require('node:child_process');

let passed = 0;
let failed = 0;
const rootDir = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (condition) {
    passed += 1;
    process.stdout.write(`  ✔ ${message}\n`);
  } else {
    failed += 1;
    process.stderr.write(`  ✖ ${message}\n`);
  }
}

function runJson(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd || rootDir,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (res.status !== 0 && !opts.allowError) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}\n${res.stderr || res.stdout}`);
  }
  const out = (res.stdout || '').trim();
  try {
    return JSON.parse(out);
  } catch (err) {
    throw new Error(`Failed to parse JSON from ${cmd} ${args.join(' ')}: ${out}\n${err.message}`);
  }
}

async function runTests() {
  process.stdout.write('\n=== Plane-ITG Pure CLI Self-Test Suite ===\n\n');

  // 1. Syntax Validation
  process.stdout.write('▶ 1. JavaScript Syntax Verification\n');
  const jsFiles = [
    'bin/cli.js',
    'bin/plane.js',
    'lib/context.js',
    'lib/gitx.js',
    'lib/plane.js',
    'scripts/self-test.js',
    'test/self-test.js',
  ];

  for (const f of jsFiles) {
    const full = path.join(rootDir, f);
    if (!fs.existsSync(full)) {
      assert(false, `File exists: ${f}`);
      continue;
    }
    try {
      execFileSync(process.execPath, ['-c', full], { encoding: 'utf8' });
      assert(true, `Syntax valid: ${f}`);
    } catch (err) {
      assert(false, `Syntax valid: ${f} — ${err.message}`);
    }
  }

  // 2. CLI Entrypoints & Dry-Run Support
  process.stdout.write('\n▶ 2. Pure CLI Entrypoints & Dry-Run Support\n');
  const cliJs = path.join(rootDir, 'bin', 'cli.js');

  const cliHelpRes = spawnSync(process.execPath, [cliJs, '--help'], { encoding: 'utf8' });
  assert(cliHelpRes.status === 0 && cliHelpRes.stdout.includes('plane-itg'), 'cli --help displays usage');

  const cliVerRes = spawnSync(process.execPath, [cliJs, '--version'], { encoding: 'utf8' });
  assert(cliVerRes.status === 0 && cliVerRes.stdout.startsWith('v'), 'cli --version displays version');

  const cliSyncDry = runJson(process.execPath, [cliJs, 'sync', '--dry-run', '--categories', 'backlog,todo']);
  assert(cliSyncDry.command === 'sync', 'cli sync --dry-run reports command = sync');
  assert(cliSyncDry.categories.includes('backlog'), 'cli sync parsed categories backlog');
  assert(cliSyncDry.categories.includes('todo'), 'cli sync parsed categories todo');

  const cliIssuesDry = runJson(process.execPath, [cliJs, 'issues', 'login', '--dry-run']);
  assert(cliIssuesDry.command === 'issues', 'cli issues --dry-run reports command = issues');
  assert(cliIssuesDry.query === 'login', 'cli issues parsed query');

  const cliProjectsDry = runJson(process.execPath, [cliJs, 'projects', 'mobile', '--dry-run']);
  assert(cliProjectsDry.command === 'projects', 'cli projects --dry-run reports command = projects');
  assert(cliProjectsDry.query === 'mobile', 'cli projects parsed query');

  const cliAuthDry = runJson(process.execPath, [cliJs, 'auth', 'test_key', '--dry-run']);
  assert(cliAuthDry.command === 'auth', 'cli auth --dry-run reports command = auth');

  const cliProjectDry = runJson(process.execPath, [cliJs, 'project', 'TEST-PROJ', '--dry-run']);
  assert(cliProjectDry.command === 'project', 'cli project --dry-run reports command = project');
  assert(cliProjectDry.projectId === 'TEST-PROJ', 'cli project parsed project id');

  const cliConfigDry = runJson(process.execPath, [cliJs, 'config', '--dry-run']);
  assert(cliConfigDry.command === 'config', 'cli config --dry-run reports command = config');
  assert(cliConfigDry.baseUrl === 'https://plane.itgproduct.com', 'cli config defaults to plane.itgproduct.com');

  const cliOpenDry = runJson(process.execPath, [cliJs, 'open', 'DEMO-101', '--dry-run']);
  assert(cliOpenDry.command === 'open', 'cli open --dry-run reports command = open');
  assert(cliOpenDry.url.includes('DEMO-101'), 'cli open generated issue url');

  // 3. Core Plane Integration & Configuration
  process.stdout.write('\n▶ 3. Core Plane Integration & Configuration\n');
  const plane = require('../lib/plane');
  const context = require('../lib/context');

  assert(plane.DEFAULT_PLANE_CONFIG.baseUrl === 'https://plane.itgproduct.com', 'plane default baseUrl matches ITG');
  assert(plane.DEFAULT_PLANE_CONFIG.workspaceSlug === 'product', 'plane default workspaceSlug is product');

  const prevConfig = context.readConfig(plane.CONFIG_FILE);
  const saveRes = plane.saveApiKey('plane_api_test_save_key_999');
  assert(saveRes.ok === true && saveRes.apiKey === 'plane_api_test_save_key_999', 'plane.saveApiKey saves key');

  const testCfg = plane.config(rootDir);
  assert(testCfg.baseUrl === 'https://plane.itgproduct.com', 'resolved cfg baseUrl falls back to default');
  assert(testCfg.apiKey === 'plane_api_test_save_key_999', 'resolved cfg apiKey retrieves saved key');

  // Restore config
  if (prevConfig) {
    context.writeConfig(plane.CONFIG_FILE, prevConfig);
  }

  // Project matching and filters
  const sampleProjs = [
    { id: 'uuid-1', identifier: 'COD', name: 'Coding Space' },
    { id: 'uuid-2', identifier: 'AND', name: 'Mobile Android App' },
    { id: 'uuid-3', identifier: 'POR', name: 'Portal ITG' },
  ];

  assert(plane.findProject(sampleProjs, 'uuid-1')?.name === 'Coding Space', 'findProject finds by exact id');
  assert(plane.findProject(sampleProjs, 'cod')?.name === 'Coding Space', 'findProject finds by identifier');
  assert(plane.findProject(sampleProjs, 'Android')?.id === 'uuid-2', 'findProject finds by partial name');
  assert(plane.findProject(sampleProjs, 'nonexistent') === null, 'findProject returns null on missing');

  const filteredProjs = plane.filterProjects(sampleProjs, 'portal');
  assert(filteredProjs.length === 1 && filteredProjs[0].id === 'uuid-3', 'filterProjects filters by search string');

  const sampleIssues = [
    { id: 'i1', sequence: 101, name: 'Login crash on launch', identifier: 'COD', stateName: 'Backlog', priority: 'urgent' },
    { id: 'i2', sequence: 102, name: 'Add dark mode setting', identifier: 'COD', stateName: 'Todo', priority: 'medium' },
    { id: 'i3', sequence: 201, name: 'Fix camera permission', identifier: 'AND', stateName: 'In Progress', priority: 'high' },
  ];

  assert(plane.filterIssues(sampleIssues, 'crash').length === 1, 'filterIssues filters by issue title');
  assert(plane.filterIssues(sampleIssues, '102').length === 1, 'filterIssues filters by sequence number');
  assert(plane.filterIssues(sampleIssues, 'and-201').length === 1, 'filterIssues filters by tag COD-101 / AND-201');

  // Media extraction tests
  const sampleHtml = `
    <p>Bug report:</p>
    <image-component src="asset-img-uuid-1"></image-component>
    <img src="https://example.com/screenshot.png" />
    <a href="https://prnt.sc/test1234">Screenshot</a>
    <a href="https://streamable.com/demovid99">Recording</a>
  `;
  const mediaRefs = plane.extractMediaReferences(sampleHtml);
  assert(mediaRefs.some((m) => m.kind === 'plane-image' && m.src === 'asset-img-uuid-1'), 'extractMediaReferences detects <image-component>');
  assert(mediaRefs.some((m) => m.kind === 'image' && m.src.includes('screenshot.png')), 'extractMediaReferences detects <img>');
  assert(mediaRefs.some((m) => m.kind === 'prnt.sc' && m.mediaId === 'test1234'), 'extractMediaReferences detects prnt.sc link');
  assert(mediaRefs.some((m) => m.kind === 'streamable' && m.mediaId === 'demovid99'), 'extractMediaReferences detects streamable link');

  // 4. Worktree Resolution & Multi-Worktree Linking
  process.stdout.write('\n▶ 4. Worktree Resolution & Symlinking\n');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plane-itg-test-'));
  const parentRepo = path.join(tmpDir, 'MainRepo');
  const linkedWorktree = path.join(tmpDir, 'MainRepo.worktrees', 'FeatureWorktree');
  fs.mkdirSync(path.join(parentRepo, '.git'), { recursive: true });
  fs.mkdirSync(linkedWorktree, { recursive: true });
  fs.writeFileSync(path.join(linkedWorktree, '.git'), `gitdir: ${path.join(parentRepo, '.git', 'worktrees', 'FeatureWorktree')}\n`);

  fs.mkdirSync(path.join(parentRepo, 'plane'), { recursive: true });
  fs.writeFileSync(path.join(parentRepo, 'plane', 'TASK_LIST.md'), '# Plane Tasks\n');

  const ensureRes = plane.ensureWorktreePlane(linkedWorktree, parentRepo);
  assert(ensureRes.ok === true, 'ensureWorktreePlane returns ok');
  assert(fs.existsSync(path.join(linkedWorktree, 'plane', 'TASK_LIST.md')), 'ensureWorktreePlane linked plane/ to worktree');

  // Markdown Generation
  const stateMap = new Map([
    ['s1', { id: 's1', name: 'Backlog', group: 'backlog' }],
    ['s2', { id: 's2', name: 'Todo', group: 'unstarted' }],
    ['s3', { id: 's3', name: 'In Progress', group: 'started' }],
  ]);
  const issuesWithStates = [
    { id: 't1', sequence_id: 1, name: 'Task One', state: 's1', priority: 'urgent' },
    { id: 't2', sequence_id: 2, name: 'Task Two', state: 's2', priority: 'medium' },
  ];
  const taskListMd = plane.generateTaskListMD(
    { workspaceSlug: 'product', projectId: 'proj-1' },
    issuesWithStates,
    stateMap,
    new Map(),
    { name: 'Demo Project', identifier: 'DEMO' }
  );
  assert(taskListMd.includes('DEMO-1'), 'generateTaskListMD includes task tag DEMO-1');
  assert(taskListMd.includes('Task One'), 'generateTaskListMD includes Task One title');
  assert(taskListMd.includes('DEMO-1.md'), 'generateTaskListMD links to per-task DEMO-1.md');

  const perTaskMd = plane.generateTaskMD(
    { baseUrl: 'https://plane.itgproduct.com', workspaceSlug: 'product', projectId: 'proj-1' },
    issuesWithStates[0],
    'DEMO-1',
    [{ comment_html: '<p>Fix scheduled for next release</p>', created_at: '2026-10-24' }],
    [{ type: 'image', mediaId: 'shot-1', webUrl: 'https://example.com/shot.png', localPath: './shot-1.png' }]
  );
  assert(perTaskMd.includes('# DEMO-1: Task One'), 'generateTaskMD has proper title header');
  assert(perTaskMd.includes('Fix scheduled for next release'), 'generateTaskMD includes comments');
  assert(perTaskMd.includes('![shot-1](./shot-1.png)'), 'generateTaskMD links evidence images');

  // Cleanup tmp dir
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (_) {}

  process.stdout.write(`\nSummary: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  process.stderr.write(`Fatal error during test run: ${err.stack || err}\n`);
  process.exit(1);
});
