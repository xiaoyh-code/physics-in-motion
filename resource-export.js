/* Dependency-free student-site export. ZIP entries use the portable STORE method. */
(function (root) {
  'use strict';

  const UTF8 = new TextEncoder();
  const MAX_32 = 0xffffffff;
  const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, value) => {
    let crc = value;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    return crc >>> 0;
  });

  function crc32(bytes) {
    let crc = MAX_32;
    for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 255] ^ (crc >>> 8);
    return (crc ^ MAX_32) >>> 0;
  }

  function safePath(value) {
    if (typeof value !== 'string' || !value || value.includes('\\') || value.includes('\0') ||
        value.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(value) || /[?#]/.test(value) ||
        value.split('/').some(part => !part || part === '.' || part === '..')) {
      throw new Error(`Invalid export file path: ${String(value)}`);
    }
    return value;
  }

  async function bytesOf(value) {
    if (typeof value === 'string') return UTF8.encode(value);
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    if (value && typeof value.arrayBuffer === 'function') return new Uint8Array(await value.arrayBuffer());
    throw new TypeError('Each export file must contain a Blob, string, or byte array.');
  }

  function dosTimestamp(date) {
    const year = Math.min(2107, Math.max(1980, date.getFullYear()));
    return {
      date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
    };
  }

  /** Build a UTF-8 ZIP: entries are { path, data } or { path, blob }. */
  async function buildZip(entries) {
    if (!Array.isArray(entries) || entries.length > 65535) {
      throw new Error('This export supports up to 65,535 files.');
    }
    const chunks = [];
    const directory = [];
    const seen = new Set();
    const stamp = dosTimestamp(new Date());
    let offset = 0;
    let directorySize = 0;

    for (const entry of entries) {
      const path = safePath(entry.path);
      if (seen.has(path)) throw new Error(`Duplicate export file: ${path}`);
      seen.add(path);
      const name = UTF8.encode(path);
      const bytes = await bytesOf(entry.data === undefined ? entry.blob : entry.data);
      if (name.length > 65535 || bytes.byteLength > MAX_32 || offset + 30 + name.length + bytes.byteLength > MAX_32) {
        throw new Error('This export is too large for a standard ZIP. Please use smaller media files.');
      }
      const crc = crc32(bytes);
      const local = new Uint8Array(30 + name.length);
      const localView = new DataView(local.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0x0800, true); // Names are UTF-8.
      localView.setUint16(10, stamp.time, true);
      localView.setUint16(12, stamp.date, true);
      localView.setUint32(14, crc, true);
      localView.setUint32(18, bytes.byteLength, true);
      localView.setUint32(22, bytes.byteLength, true);
      localView.setUint16(26, name.length, true);
      local.set(name, 30);
      chunks.push(local, bytes);

      const central = new Uint8Array(46 + name.length);
      const centralView = new DataView(central.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0x0800, true);
      centralView.setUint16(12, stamp.time, true);
      centralView.setUint16(14, stamp.date, true);
      centralView.setUint32(16, crc, true);
      centralView.setUint32(20, bytes.byteLength, true);
      centralView.setUint32(24, bytes.byteLength, true);
      centralView.setUint16(28, name.length, true);
      centralView.setUint32(42, offset, true);
      central.set(name, 46);
      directory.push(central);
      directorySize += central.byteLength;
      offset += local.byteLength + bytes.byteLength;
    }
    if (offset + directorySize + 22 > MAX_32) {
      throw new Error('This export is too large for a standard ZIP. Please use smaller media files.');
    }
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(8, entries.length, true);
    endView.setUint16(10, entries.length, true);
    endView.setUint32(12, directorySize, true);
    endView.setUint32(16, offset, true);
    return new Blob([...chunks, ...directory, end], { type: 'application/zip' });
  }

  function libraryScript(library) {
    const json = JSON.stringify(library, null, 2);
    if (json === undefined) throw new TypeError('Provide the lesson resource library before exporting.');
    const escaped = json.replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    return `// Shared lesson resources for the exported student website.\nwindow.LESSON_LIBRARY_MODE = 'student';\nwindow.LESSON_RESOURCES = ${escaped};\n`;
  }

  /** Package the current static site with the selected library and uploaded files. */
  async function buildSite({ library, uploads = [], excludePaths = [], onProgress = () => {} } = {}) {
    if (!root.location || root.location.protocol === 'file:') {
      throw new Error('Export needs a local web server. In this website folder, run “python3 -m http.server 8000”, then open http://localhost:8000 and export again.');
    }
    if (!Array.isArray(uploads)) throw new TypeError('Uploaded files must be an array.');
    if (!Array.isArray(excludePaths)) throw new TypeError('Excluded files must be an array.');
    const excluded = new Set(excludePaths.map(path => {
      safePath(path);
      if (path === 'site-files.json' || path.startsWith('vendor/') || /\.(?:html?|m?js|css|woff2?|ttf|otf)$/i.test(path)) {
        throw new Error(`Required website runtime files cannot be excluded: ${path}`);
      }
      return path;
    }));
    const serializedLibrary = libraryScript(library);
    const base = new URL('.', (root.document && root.document.baseURI) || root.location.href);
    const report = message => { if (typeof onProgress === 'function') onProgress(message); };
    report('Reading the website file list…');
    const manifestResponse = await root.fetch(new URL('site-files.json', base), { cache: 'no-store' });
    if (!manifestResponse.ok) throw new Error('The website file list could not be loaded. Refresh the page and try again.');
    const manifest = await manifestResponse.json();
    const listedPaths = Array.isArray(manifest) ? manifest : manifest.files;
    if (!Array.isArray(listedPaths) || !listedPaths.includes('index.html') || !listedPaths.includes('lesson-resources-data.js')) {
      throw new Error('The website file list is incomplete. Rebuild site-files.json before exporting.');
    }
    const seenManifest = new Set();
    for (const path of listedPaths) {
      safePath(path);
      if (seenManifest.has(path)) throw new Error(`Duplicate website file: ${path}`);
      seenManifest.add(path);
    }
    const paths = listedPaths.filter(path => !excluded.has(path));
    if (!paths.includes('site-files.json')) paths.push('site-files.json');
    const unique = new Set(paths);
    const uploadEntries = uploads.map(upload => {
      const path = safePath(upload.path);
      if (!path.startsWith('uploads/')) throw new Error('Uploaded export files must be inside the uploads folder.');
      if (unique.has(path)) throw new Error(`Duplicate export file: ${path}`);
      unique.add(path);
      return { path, blob: upload.blob };
    });
    const packagedManifest = JSON.stringify({ version: 1, files: [...unique].sort() }, null, 2) + '\n';
    const entries = new Array(paths.length);
    let next = 0;
    let loaded = 0;
    const loadFile = async () => {
      while (next < paths.length) {
        const index = next++;
        const path = paths[index];
        if (path === 'lesson-resources-data.js') {
          entries[index] = { path, data: serializedLibrary };
        } else if (path === 'site-files.json') {
          entries[index] = { path, data: packagedManifest };
        } else {
          const response = await root.fetch(new URL(path.split('/').map(encodeURIComponent).join('/'), base), { cache: 'no-store' });
          if (!response.ok) throw new Error(`Could not read ${path}. Refresh the page and try again.`);
          entries[index] = { path, blob: await response.blob() };
        }
        loaded += 1;
        report(`Collecting website files: ${loaded} / ${paths.length}`);
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, paths.length) }, loadFile));
    report(`Packing website and ${uploadEntries.length} uploaded file${uploadEntries.length === 1 ? '' : 's'}…`);
    const blob = await buildZip([...entries, ...uploadEntries]);
    report('Student website ready.');
    return blob;
  }

  const api = Object.freeze({ buildSite, buildZip });
  root.PhysicsResourceExport = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
