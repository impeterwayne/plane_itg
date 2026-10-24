#!/usr/bin/env node
'use strict';

if (process.cwd().startsWith('\\\\?\\')) {
  try {
    process.chdir(process.cwd().slice(4));
  } catch (_) {}
}

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');

if (dryRun) {
  process.stdout.write(
    `${JSON.stringify({
      action: 'open',
      plugin: 'plane-itg',
      entrypoint: 'plane-popup',
      tool: 'plane',
    })}\n`
  );
  process.exit(0);
}

const { App, selfPaneId, requireTTY } = require('../lib/app');
const { planeView } = require('../lib/views');

const POPUP = argv.includes('--popup') || process.argv.includes('--popup');

requireTTY('plane-popup');

new App({
  view: planeView,
  paneId: selfPaneId(),
  popup: POPUP,
  escapeQuits: true,
  closesPane: !POPUP,
}).start();
