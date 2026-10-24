'use strict';

const { readConfig } = require('./context');

const TABLE = {
  plane: ['\u{EAB3}', 'PL', 'cod-checklist', '#BB9AF7'],
  link: ['\u{EB15}', 'LN', 'cod-link', '#7AA2F7'],
  'link-broken': ['\u{F0338}', '!!', 'md-link_off', '#F7768E'],
  add: ['\u{EA60}', '+', 'cod-add', '#9ECE6A'],
  done: ['\u{F00C}', 'ok', 'fa-check', '#9ECE6A'],
  issue: ['\u{EB0C}', '#', 'cod-issues', '#BB9AF7'],
  search: ['\u{EA6D}', '?', 'cod-search', '#7DCFFF'],
  edit: ['\u{EA73}', 'ed', 'cod-edit', '#E0AF68'],
  empty: ['\u{EC07}', '..', 'cod-circle_small'],
  alert: ['\u{F421}', '!!', 'oct-alert', '#F7768E'],
};

let style = null;

function iconStyle() {
  if (style) return style;
  if (process.argv.includes('--ascii-icons')) {
    style = 'ascii';
    return style;
  }
  const configured = (readConfig('icons.json') || {}).style;
  style = configured === 'ascii' ? 'ascii' : 'nerd';
  return style;
}

function icon(name) {
  const entry = TABLE[name];
  if (!entry) return '';
  return iconStyle() === 'ascii' ? entry[1] : entry[0];
}

function sgr(name) {
  const hex = (TABLE[name] || [])[3];
  if (!hex) return '';
  const n = parseInt(hex.slice(1), 16);
  return `\x1b[38;2;${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}m`;
}

module.exports = { TABLE, icon, sgr, iconStyle };
