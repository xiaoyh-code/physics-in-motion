#!/usr/bin/env node
'use strict';

// Run from any directory. Rebuilds only the Lesson 6 ZIPs and their QA extraction.
// Student packaging uses the same dependency-free exporter as the browser UI.
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const siteRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(siteRoot, '../..');
const studentZip = path.join(workspaceRoot, 'Physics_in_Motion_Lesson6_Student.zip');
const teacherZip = path.join(workspaceRoot, 'Physics_in_Motion_Lesson6_Teacher.zip');
const extraction = path.join(workspaceRoot, 'output/playwright/student-site-lesson6-verified');
const excludedParts = new Set(['.cache', '.git', '.local', '.playwright-cli', '__pycache__', 'node_modules', 'output', 'test-results']);

async function walk(directory) {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || excludedParts.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(absolute));
    else if (entry.isFile()) result.push(absolute);
  }
  return result;
}

function checkedRelative(absolute) {
  const relative = path.relative(siteRoot, absolute).split(path.sep).join('/');
  if (!relative || relative.startsWith('../') || path.isAbsolute(relative)) throw new Error('Package source escapes the website directory.');
  return relative;
}

async function main() {
  execFileSync('python3', [path.join(__dirname, 'build_site_manifest.py')], { stdio: 'inherit' });
  const manifest = JSON.parse(await fs.readFile(path.join(siteRoot, 'site-files.json'), 'utf8'));
  const runtime = new Set(manifest.files);
  const required = [
    'index.html', 'motion-visual.js', 'displacement-visual.js', 'projectile.js', 'projectile-visual.js', 'forces-visual.js', 'force-drag-model.js', 'forces-interaction.js', 'terminal-model.js', 'terminal-visual.js', 'terminal-lesson.js', 'collision-model.js', 'collision-visual.js', 'collision-lesson.js',
    'visual-math.js', 'motion-lesson.js', 'visual-type.css', 'opening-content.js',
    'course-overview.html', 'course-overview.css', 'course-overview.js', 'curriculum-map-data.js',
    'lesson-introductions-data.js', 'lesson-introductions.js', 'LESSON_INTRO_SOURCES.md',
    'resources/curriculum/2026-2027_Physics_Annual_Teaching_Plan.docx',
    'resources/curriculum/2026-2027_Physics_Annual_Teaching_Plan.pdf',
    'resources/curriculum/2026-2027_Edexcel_IAL_Course_Map.svg',
    'resources/curriculum/2026-2027_Edexcel_IAL_Course_Map.pptx',
    'resources/curriculum/2026-2027_Edexcel_IAL_Course_Map.pdf',
    'resources/curriculum/2026-2027_Edexcel_IAL_Course_Map_Preview.png'
  ];
  for (const relative of required) if (!runtime.has(relative)) throw new Error(`Required website file is absent from the manifest: ${relative}`);
  for (const absolute of await walk(path.join(siteRoot, 'fonts'))) {
    const relative = checkedRelative(absolute);
    if (!runtime.has(relative)) throw new Error(`Local font or notice is absent from the manifest: ${relative}`);
  }

  const teacherFiles = new Set(runtime);
  for (const absolute of await walk(path.join(siteRoot, 'resources'))) {
    const relative = checkedRelative(absolute);
    if (/\.(?:typ|py|json)$/i.test(relative)) teacherFiles.add(relative);
  }
  // Keep the authoring scene and chapter timing sources; generated math/render
  // caches are deliberately excluded because these scripts recreate them.
  for (const entry of await fs.readdir(path.join(siteRoot, 'worked_media/source'), { withFileTypes: true })) {
    if (entry.isFile() && /\.(?:py|json)$/i.test(entry.name)) teacherFiles.add(`worked_media/source/${entry.name}`);
  }
  for (const entry of await fs.readdir(__dirname, { withFileTypes: true })) {
    if (entry.isFile() && /\.(?:py|cjs)$/i.test(entry.name) && !entry.name.startsWith('test')) teacherFiles.add(`scripts/${entry.name}`);
  }
  teacherFiles.add('worked_prompts.json');
  for (const relative of ['LESSON5_VERIFICATION.md', 'LESSON5_CONTENT_NOTES.md', 'LESSON5_REA_REFERENCE.md', 'LESSON6_VERIFICATION.md', 'LESSON6_CONTENT_NOTES.md']) {
    try { await fs.access(path.join(siteRoot, relative)); teacherFiles.add(relative); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }

  // Whitelisting the site tree keeps account/CLI state and unrelated private
  // documents outside both archives. Check selected text for embedded secrets.
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/,
    /\b(?:api[_-]?key|access[_-]?token|secret[_-]?key)\s*[:=]\s*['"][A-Za-z0-9_./+=-]{24,}['"]/i
  ];
  for (const relative of teacherFiles) {
    if (relative.split('/').some(part => excludedParts.has(part) || part.startsWith('.')) || /(?:^|\/)test[_-]/i.test(relative)) throw new Error(`Unexpected non-delivery file: ${relative}`);
    if (/\.(?:js|cjs|py|json|html|css|md|typ|txt)$/i.test(relative)) {
      const text = await fs.readFile(path.join(siteRoot, relative), 'utf8');
      if (secretPatterns.some(pattern => pattern.test(text))) throw new Error(`Possible embedded credential in selected source; inspect locally before packaging: ${relative}`);
    }
  }

  const libraryContext = { window: {} };
  vm.runInNewContext(await fs.readFile(path.join(siteRoot, 'lesson-resources-data.js'), 'utf8'), libraryContext, { timeout: 1000 });
  if (!libraryContext.window.LESSON_RESOURCES) throw new Error('The bundled resource library could not be read.');
  globalThis.location = new URL('http://packaging.local/index.html');
  globalThis.document = { baseURI: globalThis.location.href };
  globalThis.fetch = async requested => {
    const url = new URL(requested);
    if (url.origin !== 'http://packaging.local') throw new Error('Packaging may only read local website files.');
    const relative = decodeURIComponent(url.pathname.slice(1));
    const absolute = path.resolve(siteRoot, relative);
    checkedRelative(absolute);
    try { return new Response(await fs.readFile(absolute)); }
    catch (error) { if (error.code === 'ENOENT') return new Response('Missing file', { status: 404 }); throw error; }
  };
  const { buildSite } = require('../resource-export.js');
  const studentBlob = await buildSite({ library: JSON.parse(JSON.stringify(libraryContext.window.LESSON_RESOURCES)) });
  await fs.writeFile(studentZip, Buffer.from(await studentBlob.arrayBuffer()));

  const verification = [
    'import hashlib, json, pathlib, shutil, sys, zipfile',
    'config = json.load(sys.stdin)',
    'site = pathlib.Path(config["siteRoot"])',
    'with zipfile.ZipFile(config["teacherZip"], "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:',
    '    for relative in config["teacherFiles"]:',
    '        archive.write(site / relative, "interactive/" + relative)',
    '    archive.writestr("interactive/resources/motion/Insert/", b"")',
    'for kind in ("student", "teacher"):',
    '    prefix = "" if kind == "student" else "interactive/"',
    '    with zipfile.ZipFile(config[kind + "Zip"]) as archive:',
    '        assert archive.testzip() is None, kind + " ZIP CRC check failed"',
    '        names = set(archive.namelist())',
    '        assert len(names) == len(archive.infolist()), "Duplicate ZIP paths"',
    '        assert all(prefix + name in names for name in config["required"]), kind + " required assets missing"',
    '        assert all(not name.startswith("/") and ".." not in pathlib.PurePosixPath(name).parts for name in names)',
    '        assert not any(part in {".local", ".git", ".playwright-cli", "__pycache__", "output", "node_modules"} for name in names for part in pathlib.PurePosixPath(name).parts)',
    '        resource_script = archive.read(prefix + "lesson-resources-data.js").decode()',
    '        assert "LESSON_LIBRARY_MODE = \'" + kind + "\'" in resource_script, kind + " mode incorrect"',
    '        if kind == "student":',
    '            manifest = json.loads(archive.read("site-files.json"))',
    '            assert set(manifest["files"]) == names, "Student manifest differs from ZIP contents"',
    '            assert not any("/source/" in name or name.endswith((".typ", ".py", ".cjs")) for name in names), "Authoring/test source in student site"',
    '            destination = pathlib.Path(config["extraction"])',
    '            if destination.exists(): shutil.rmtree(destination)',
    '            destination.mkdir(parents=True)',
    '            archive.extractall(destination)',
    '        original = "resources/curriculum/2026-2027_Physics_Annual_Teaching_Plan.docx"',
    '        assert archive.read(prefix + original) == (site / original).read_bytes(), "Original plan changed"',
    '        print(f"{kind.title()}: {len(names)} entries, CRC/content/mode/original-plan verified")',
    'for key in ("studentZip", "teacherZip"):',
    '    artifact = pathlib.Path(config[key])',
    '    print(f"{artifact.name}: {artifact.stat().st_size:,} bytes; SHA256 {hashlib.sha256(artifact.read_bytes()).hexdigest()}")',
    'print("Student QA extraction: " + config["extraction"])'
  ].join('\n');
  execFileSync('python3', ['-c', verification], {
    input: JSON.stringify({ siteRoot, studentZip, teacherZip, extraction, required, teacherFiles: [...teacherFiles].sort() }),
    stdio: ['pipe', 'inherit', 'inherit']
  });
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
