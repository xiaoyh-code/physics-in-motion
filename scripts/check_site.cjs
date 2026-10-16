#!/usr/bin/env node
'use strict';

// Run from any directory: node /path/to/interactive/scripts/check_site.cjs
// The tests use built-in Node modules, Python 3 and the bundled KaTeX files.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const failures = [];
const relative = filename => path.relative(root, filename).split(path.sep).join('/');

function run(args, label, options = {}) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 600_000,
    maxBuffer: 8 * 1024 * 1024,
    ...options
  });
  if (result.status !== 0 || result.error) {
    failures.push(label);
    console.error(`FAIL ${label}`);
    if (result.error) console.error(result.error.message);
    if (result.stdout.trim()) console.error(result.stdout.trim());
    if (result.stderr.trim()) console.error(result.stderr.trim());
    return false;
  }
  if (result.stdout.trim()) console.log(result.stdout.trim());
  if (result.stderr.trim()) console.error(result.stderr.trim());
  return true;
}

function scriptsIn(directory, recursive = false) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return recursive ? scriptsIn(filename, true) : [];
    return entry.isFile() && /\.(?:js|cjs)$/.test(entry.name) ? [filename] : [];
  }).sort();
}

const major = Number(process.versions.node.split('.')[0]);
if (major < 20) {
  console.error(`Node.js 20 or newer is required; found ${process.version}.`);
  process.exit(1);
}

const python = spawnSync('python3', ['--version'], { encoding: 'utf8' });
if (python.status !== 0 || python.error) {
  console.error('Python 3 is required for independent ZIP and SVG/XML checks.');
  process.exit(1);
}

const sourceFiles = [...scriptsIn(root), ...scriptsIn(path.join(root, 'scripts'), true)];
let validSyntax = 0;
for (const filename of sourceFiles) {
  if (run(['--check', filename], `syntax: ${relative(filename)}`)) validSyntax++;
}
console.log(`Syntax: ${validSyntax}/${sourceFiles.length} JavaScript files passed.`);

let assetCount = 0;
for (const page of ['index.html', 'course-overview.html']) {
  const filename = path.join(root, page);
  if (!fs.existsSync(filename)) {
    failures.push(`missing entry page: ${page}`);
    console.error(`FAIL missing entry page: ${page}`);
    continue;
  }
  const html = fs.readFileSync(filename, 'utf8');
  // Script, stylesheet and image references are static in these entry pages.
  // Anchor navigation and external URLs do not represent bundled runtime assets.
  const tags = html.matchAll(/<(script|link|img)\b[^>]*>/gi);
  for (const [tag, kind] of tags) {
    if (kind.toLowerCase() === 'link' && !/\brel\s*=\s*["']stylesheet["']/i.test(tag)) continue;
    const attribute = kind.toLowerCase() === 'link' ? 'href' : 'src';
    const match = tag.match(new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
    if (!match || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(match[2])) continue;
    const resource = decodeURIComponent(match[2].split(/[?#]/)[0]);
    const resolved = path.resolve(path.dirname(filename), resource);
    const contained = resolved.startsWith(root + path.sep);
    if (!resource || !contained || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      const label = `missing/invalid asset in ${page}: ${match[2]}`;
      failures.push(label);
      console.error(`FAIL ${label}`);
    } else assetCount++;
  }
}
console.log(`Entry assets: ${assetCount} local script, stylesheet and image references checked.`);

const tests = fs.readdirSync(root).filter(name => /^test_.*\.cjs$/.test(name)).sort();
if (tests.length === 0) {
  failures.push('no test suites found');
  console.error('FAIL no test_*.cjs suites found.');
}
let passed = 0;
for (const test of tests) {
  console.log(`\nRunning ${test}`);
  if (run([path.join(root, test)], test)) passed++;
}
console.log(`\nTest suites: ${passed}/${tests.length} passed.`);
if (failures.length) {
  console.error(`Site checks failed (${failures.length}): ${failures.join('; ')}`);
  process.exitCode = 1;
} else {
  console.log('Site checks passed. Browser/touch visual review remains a separate manual check.');
}
