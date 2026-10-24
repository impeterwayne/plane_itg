'use strict';

const { spawnSync, spawn } = require('node:child_process');

const BIN = process.env.HERDR_BIN_PATH || 'herdr';

function herdr(args) {
  const res = spawnSync(BIN, args, { encoding: 'utf8', windowsHide: true });
  if (res.error) throw new Error(`spawn ${BIN}: ${res.error.message}`);
  const out = (res.stdout || '').trim();
  if (res.status !== 0) {
    throw new Error(`herdr ${args.join(' ')} exited ${res.status}: ${(res.stderr || out).trim()}`);
  }
  if (!out) return {};
  try {
    const parsed = JSON.parse(out);
    if (parsed && parsed.error) throw new Error(JSON.stringify(parsed.error));
    return parsed.result || parsed;
  } catch (e) {
    return { _raw: out };
  }
}

function tryHerdr(args) {
  try {
    return herdr(args);
  } catch (_) {
    return null;
  }
}

const paneList = () => (tryHerdr(['pane', 'list']) || {}).panes || [];
const paneCurrent = () => (tryHerdr(['pane', 'current']) || {}).pane || null;
const paneRename = (paneId, label) => tryHerdr(['pane', 'rename', paneId, label]);
const paneClose = (paneId) => tryHerdr(['pane', 'close', paneId]);

const tabList = () => (tryHerdr(['tab', 'list']) || {}).tabs || [];
const tabClose = (tabId) => tryHerdr(['tab', 'close', tabId]);

function focusPane(paneId) {
  tryHerdr(['pane', 'zoom', paneId, '--on']);
  tryHerdr(['pane', 'zoom', paneId, '--off']);
}

function detachedHerdr(args) {
  const child = spawn(BIN, args, { detached: true, stdio: 'ignore', windowsHide: true });
  child.unref();
}

module.exports = {
  BIN,
  herdr,
  tryHerdr,
  paneList,
  paneCurrent,
  focusPane,
  paneRename,
  paneClose,
  tabList,
  tabClose,
  detachedHerdr,
};
