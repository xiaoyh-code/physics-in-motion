#!/usr/bin/env node
'use strict';

// Portable public build. The source folder stays in teacher mode; only dist is
// deployed. Use the same resource exporter as the teacher's browser UI.
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const site = path.resolve(__dirname, '..');
const dist = path.join(site, 'dist');
const zip = path.join(site, 'artifacts', 'Physics_in_Motion_Student.zip');

async function main() {
  execFileSync('python3', [path.join(__dirname, 'build_site_manifest.py')], { stdio: 'inherit' });
  const context = { window: {} };
  vm.runInNewContext(await fs.readFile(path.join(site, 'lesson-resources-data.js'), 'utf8'), context, { timeout: 1000 });
  const library = context.window.LESSON_RESOURCES;
  if (!library || typeof library !== 'object') throw new Error('Missing bundled lesson resource library.');
  globalThis.location = new URL('http://physics-build.local/index.html');
  globalThis.document = { baseURI: globalThis.location.href };
  globalThis.fetch = async requested => {
    const url = new URL(requested);
    if (url.origin !== 'http://physics-build.local') throw new Error('Build reads local files only.');
    const relative = decodeURIComponent(url.pathname.slice(1));
    const absolute = path.resolve(site, relative);
    if (!relative || !absolute.startsWith(site + path.sep)) throw new Error('Invalid build file path.');
    try { return new Response(await fs.readFile(absolute)); }
    catch (error) { if (error.code === 'ENOENT') return new Response('Not found', { status: 404 }); throw error; }
  };
  const { buildSite } = require('../resource-export.js');
  const blob = await buildSite({ library: JSON.parse(JSON.stringify(library)) });
  await fs.mkdir(path.dirname(zip), { recursive: true });
  await fs.writeFile(zip, Buffer.from(await blob.arrayBuffer()));
  execFileSync('python3', ['-c', [
    'import json, pathlib, shutil, sys, zipfile',
    'archive_path, output, source = map(pathlib.Path, sys.argv[1:])',
    'with zipfile.ZipFile(archive_path) as archive:',
    '    assert archive.testzip() is None, "ZIP CRC failed"',
    '    names = archive.namelist()',
    '    assert len(names) == len(set(names)), "Duplicate ZIP entries"',
    '    for name in names:',
    '        p = pathlib.PurePosixPath(name)',
    '        assert not p.is_absolute() and ".." not in p.parts and "\\\\" not in name, "Unsafe ZIP entry"',
    '        assert not any(part in {".git", ".local", ".playwright-cli", "__pycache__", "node_modules", "output"} for part in p.parts)',
    '    assert set(json.loads(archive.read("site-files.json"))["files"]) == set(names)',
    '    assert "LESSON_LIBRARY_MODE = \'student\'" in archive.read("lesson-resources-data.js").decode()',
    '    original = "resources/curriculum/2026-2027_Physics_Annual_Teaching_Plan.docx"',
    '    assert archive.read(original) == (source / original).read_bytes(), "Original annual plan changed"',
    '    assert not any(name.endswith((".cjs", ".py", ".typ")) or "/source/" in name for name in names)',
    '    if output.exists(): shutil.rmtree(output)',
    '    output.mkdir(parents=True)',
    '    archive.extractall(output)',
    'print(f"Public student build: {len(names)} files; manifest, CRC, paths, mode and original plan verified.")'
  ].join('\n'), zip, dist, site], { stdio: 'inherit' });
  // Pages serves the prepared static files without a Jekyll processing step.
  await fs.writeFile(path.join(dist, '.nojekyll'), '');
  console.log('Ready: dist/ and artifacts/Physics_in_Motion_Student.zip');
  console.log('Browser-only IndexedDB uploads are not part of this build. Bundle shared files in resources/ and lesson-resources-data.js.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
