'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const { buildZip, buildSite } = require('./resource-export.js');

async function inspectWithPython(blob, directory, filename) {
  const zipPath = path.join(directory, filename);
  await fs.writeFile(zipPath, Buffer.from(await blob.arrayBuffer()));
  const inspection = spawnSync('python3', ['-c', [
    'import base64, json, sys, zipfile',
    'with zipfile.ZipFile(sys.argv[1]) as archive:',
    '    assert archive.testzip() is None, "CRC validation failed"',
    '    assert all(item.compress_type == zipfile.ZIP_STORED for item in archive.infolist())',
    '    print(json.dumps({name: base64.b64encode(archive.read(name)).decode() for name in archive.namelist()}))'
  ].join('\n'), zipPath], { encoding: 'utf8' });
  assert.equal(inspection.status, 0, inspection.stderr);
  return Object.fromEntries(Object.entries(JSON.parse(inspection.stdout)).map(([key, value]) => [key, Buffer.from(value, 'base64')]));
}

async function run() {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'physics-export-test-'));
  try {
    const zip = await buildZip([
      { path: 'index.html', data: '<h1>Physics</h1>' },
      { path: 'uploads/motion/工作紙.pdf', blob: new Blob([new Uint8Array([0, 1, 2, 128, 255])]) },
      { path: 'empty.txt', data: '' }
    ]);
    assert.equal(zip.type, 'application/zip');
    const unpacked = await inspectWithPython(zip, temporary, 'format.zip');
    assert.equal(unpacked['index.html'].toString(), '<h1>Physics</h1>');
    assert.deepEqual([...unpacked['uploads/motion/工作紙.pdf']], [0, 1, 2, 128, 255]);
    assert.equal(unpacked['empty.txt'].length, 0);
    for (const unsafe of ['../outside.pdf', '/absolute.pdf', 'uploads/../outside.pdf', 'C:/outside.pdf', 'a\\b.pdf', 'a//b.pdf']) {
      await assert.rejects(buildZip([{ path: unsafe, data: '' }]), /Invalid export file path/);
    }
    await assert.rejects(buildZip([{ path: 'same', data: '' }, { path: 'same', data: '' }]), /Duplicate/);
    await assert.rejects(buildZip([{ path: 'missing-data' }]), /Blob, string, or byte array/);

    const library = { motion: { subtitle: 'A Level practice', resources: [{ id: 'own', title: '</script> 工作紙', pdf: 'uploads/motion/own.pdf' }] } };
    const fetched = [];
    const progress = [];
    const manifest = { version: 1, files: ['index.html', 'lesson-resources-data.js', 'site-files.json', 'vendor/katex/fonts/font.woff2', 'resources/motion/sample.pdf', 'resources/motion/sample-page.png'] };
    const payloads = {
      'index.html': '<script src="lesson-resources-data.js"></script>',
      'site-files.json': JSON.stringify(manifest),
      'vendor/katex/fonts/font.woff2': new Uint8Array([70, 79, 78, 84]),
      'resources/motion/sample.pdf': 'sample paper',
      'resources/motion/sample-page.png': 'sample preview'
    };
    globalThis.location = new URL('http://localhost:8000/physics/course/index.html#motion');
    globalThis.document = { baseURI: 'http://localhost:8000/physics/course/index.html#motion' };
    globalThis.fetch = async url => {
      const relative = new URL(url).pathname.replace('/physics/course/', '');
      fetched.push(relative);
      if (relative === 'site-files.json') return new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/json' } });
      return new Response(payloads[relative], { status: Object.hasOwn(payloads, relative) ? 200 : 404 });
    };
    const site = await buildSite({ library, uploads: [{ path: 'uploads/motion/own.pdf', blob: new Blob(['own worksheet']) }], onProgress: message => progress.push(message) });
    const packaged = await inspectWithPython(site, temporary, 'student-site.zip');
    assert.equal(packaged['index.html'].toString(), payloads['index.html']);
    assert.equal(packaged['uploads/motion/own.pdf'].toString(), 'own worksheet');
    assert.deepEqual([...packaged['vendor/katex/fonts/font.woff2']], [70, 79, 78, 84]);
    const studentContext = { window: {} };
    vm.runInNewContext(packaged['lesson-resources-data.js'].toString(), studentContext);
    assert.equal(studentContext.window.LESSON_LIBRARY_MODE, 'student');
    assert.equal(JSON.stringify(studentContext.window.LESSON_RESOURCES), JSON.stringify(library));
    assert(!fetched.includes('lesson-resources-data.js'), 'The teacher library must be replaced, not copied.');
    assert(progress.at(-1).includes('ready'));
    assert(packaged['lesson-resources-data.js'].toString().includes('\\u003c/script>'));
    fetched.length = 0;
    const withoutSamples = await buildSite({ library, excludePaths: ['resources/motion/sample.pdf', 'resources/motion/sample-page.png'], uploads: [{ path: 'uploads/motion/own.pdf', blob: new Blob(['own worksheet']) }] });
    const filtered = await inspectWithPython(withoutSamples, temporary, 'no-samples.zip');
    assert(!Object.hasOwn(filtered, 'resources/motion/sample.pdf'), 'Unchecked sample PDFs must be absent from the ZIP.');
    assert(!Object.hasOwn(filtered, 'resources/motion/sample-page.png'), 'Unchecked sample previews must be absent from the ZIP.');
    assert(!fetched.includes('resources/motion/sample.pdf') && !fetched.includes('resources/motion/sample-page.png'), 'Excluded files must not be fetched.');
    assert.equal(filtered['uploads/motion/own.pdf'].toString(), 'own worksheet');
    assert.deepEqual(JSON.parse(filtered['site-files.json']).files, Object.keys(filtered).sort(), 'The exported manifest must match the actual ZIP contents.');
    for (const runtime of ['index.html', 'lesson-resources-data.js', 'app.js', 'style.css', 'site-files.json', 'vendor/katex/fonts/font.woff2']) {
      await assert.rejects(buildSite({ library, excludePaths: [runtime] }), /runtime files cannot be excluded/);
    }
    await assert.rejects(buildSite({ library, excludePaths: ['../unsafe.pdf'] }), /Invalid export file path/);
    await assert.rejects(buildSite({ library, excludePaths: 'sample.pdf' }), /must be an array/);
    await assert.rejects(buildSite({ library, uploads: [{ path: 'index.html', blob: new Blob(['overwrite']) }] }), /uploads folder/);
    await assert.rejects(buildSite({ library, uploads: [{ path: 'uploads/same.pdf', blob: new Blob() }, { path: 'uploads/same.pdf', blob: new Blob() }] }), /Duplicate/);
    globalThis.location = new URL('file:///course/index.html');
    await assert.rejects(buildSite({ library }), /python3 -m http.server 8000/);
    console.log('Resource export passed: independent ZIP/CRC verification, Unicode/binary files, student library, uploads, sample exclusion, accurate manifest, nested site paths, and error handling.');
  } finally {
    delete globalThis.location;
    delete globalThis.document;
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
