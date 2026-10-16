/* Local teacher library. Files stay on this device until the teacher exports a student site. */
(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const teacher = window.LESSON_LIBRARY_MODE !== 'student';
  const bundled = window.LESSON_RESOURCES || {};
  const memory = new Map(), urls = new Map();
  const orderedFiles = () => [...memory.values()].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0) || a.id.localeCompare(b.id));
  let database, persistent = false, storageReady = false, topic = 'motion', currentResources = [], preview, opener;
  let busy = false, message = '', suppressed = {};
  try { suppressed = JSON.parse(localStorage.getItem('physics-resource-samples-hidden') || '{}'); } catch (_) {}

  function el(name, text, parent, className) {
    const node = document.createElement(name);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    if (parent) parent.append(node);
    return node;
  }
  function link(text, href, parent, download) {
    const a = el('a', text, parent, 'resource-link'); a.href = href;
    if (download) a.download = download;
    else { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }
  function fileURL(record) {
    if (!urls.has(record.id)) urls.set(record.id, URL.createObjectURL(record.blob));
    return urls.get(record.id);
  }
  function localResources(id) {
    return orderedFiles().filter(file => file.topic === id).map(file => ({
      id: file.id, title: file.name.replace(/\.[^.]+$/, ''), kind: file.kind,
      src: fileURL(file), pdf: file.kind === 'pdf' ? fileURL(file) : undefined,
      local: true, filename: file.name, description: 'Your teaching material',
      meta: (file.kind === 'pdf' ? 'PDF' : 'Image') + ' · ' + size(file.blob.size)
    }));
  }
  const size = bytes => bytes < 1024 * 1024 ? Math.max(1, Math.round(bytes / 1024)) + ' KB' : (bytes / 1024 / 1024).toFixed(1) + ' MB';
  const resourcesFor = id => [
    ...(teacher && suppressed[id] ? [] : (bundled[id]?.resources || [])),
    ...(teacher ? localResources(id) : [])
  ];
  function transact(action, value) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('files', 'readwrite');
      transaction.objectStore('files')[action](value);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error('The file could not be saved.'));
      transaction.onabort = () => reject(transaction.error || new Error('The file could not be saved.'));
    });
  }
  async function openDatabase() {
    try {
      database = await new Promise((resolve, reject) => {
        const request = indexedDB.open('physics-teacher-resources-v1', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Close another open version of this site and reload to enable saved uploads.'));
      });
      const records = await new Promise((resolve, reject) => {
        const request = database.transaction('files').objectStore('files').getAll();
        request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
      });
      records.forEach(record => memory.set(record.id, record)); persistent = true;
      database.onversionchange = () => { database.close(); persistent = false; render(topic); };
    } catch (_) { persistent = false; }
  }
  async function validate(file) {
    if (file.size > 30 * 1024 * 1024) throw new Error(file.name + ': the limit is 30 MB per file.');
    const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
    const ascii = new TextDecoder('ascii').decode(bytes);
    let kind, extension, mime;
    if (ascii.includes('%PDF-')) { kind = 'pdf'; extension = 'pdf'; mime = 'application/pdf'; }
    else if (bytes[0] === 0x89 && ascii.slice(1, 4) === 'PNG') { kind = 'image'; extension = 'png'; mime = 'image/png'; }
    else if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) { kind = 'image'; extension = 'jpg'; mime = 'image/jpeg'; }
    else if (/^GIF8[79]a/.test(ascii)) { kind = 'image'; extension = 'gif'; mime = 'image/gif'; }
    else if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') { kind = 'image'; extension = 'webp'; mime = 'image/webp'; }
    else throw new Error(file.name + ': choose a PDF, PNG, JPEG, WebP or GIF file.');
    return { kind, extension, blob: new Blob([file], { type: mime }) };
  }
  async function addFiles(files) {
    if (busy || !storageReady || !files.length) return;
    busy = true;
    const target = topic, failures = []; let added = 0;
    message = 'Adding your files…'; render(topic);
    for (const file of files) {
      try {
        const verified = await validate(file);
        const id = globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
        const record = { id, topic: target, name: file.name, createdAt: Math.max(Date.now(), ...[...memory.values()].map(record => (record.createdAt || 0) + 1)), ...verified };
        if (persistent) await transact('put', record);
        memory.set(id, record); added++;
      } catch (error) { failures.push(error.message); }
    }
    busy = false;
    message = (added ? added + (added === 1 ? ' file added' : ' files added') + ' to ' + titleFor(target) + '. ' : '') + failures.join(' ');
    render(topic);
  }
  function titleFor(id) { return window.Physics?.M?.find(item => item.id === id)?.title || id; }
  async function removeFile(resource) {
    if (busy) return;
    busy = true;
    try {
      if (persistent) await transact('delete', resource.id);
      memory.delete(resource.id);
      if (urls.has(resource.id)) { URL.revokeObjectURL(urls.get(resource.id)); urls.delete(resource.id); }
      message = resource.filename + ' removed from this lesson.';
    } catch (_) { message = 'The file could not be removed. Please try again.'; }
    busy = false; render(topic);
    byId('resourceFiles')?.focus();
  }
  function renderRoute(id) {
    const live = ['motion','displacement','projectile','vectors','newton','momentum'].includes(id);
    const route = byId('lessonRoute'); route.replaceChildren(); route.hidden = !live;
    byId('lessonIntro').textContent = live
      ? 'Change the motion. Watch the graph and equation respond. Then practise on paper.'
      : 'Change a parameter. Watch the motion. Explain the relationship.';
    if (!live) return;
    [['01', 'Explore the animation', 'liveLab'], ['02', 'Build the derivation', 'derive'], ['03', 'Work on paper', 'lessonResources']].forEach(([number, title, target]) => {
      if (target === 'lessonResources' && !teacher && !resourcesFor(id).length) return;
      const a = el('a', undefined, route); a.href = '#' + target;
      el('span', number, a, 'route-number'); el('span', title, a); el('span', '↓', a, 'route-arrow');
      a.onclick = event => { event.preventDefault(); if(target==='derive'){if(id==='momentum')window.CollisionLesson?.revealWorking();byId('tab-derive').click();} byId(target).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); };
    });
    route.style.gridTemplateColumns = 'repeat(' + route.childElementCount + ', minmax(0, 1fr))';
  }
  function render(id) {
    topic = id;
    const root = byId('lessonResources'); if (!root) return;
    renderRoute(id); root.replaceChildren();
    currentResources = resourcesFor(id); root.hidden = !teacher && !currentResources.length;
    if (root.hidden) return;
    const heading = el('div', undefined, root, 'resource-section-head');
    const headings = el('div', undefined, heading);
    el('p', id === 'motion' ? '03 / WORK ON PAPER' : 'WORK ON PAPER', headings, 'resource-kicker');
    const h = el('h2', 'Lesson resources', headings); h.id = 'resourcesHeading';
    el('p', bundled[id]?.subtitle || 'Read, annotate and practise with the materials for this lesson.', headings, 'resource-intro');
    if (teacher) {
      const exportButton = el('button', 'Export student website ↓', heading, 'resource-export');
      exportButton.disabled = busy || !storageReady; exportButton.onclick = exportSite;
      const uploader = el('div', undefined, root, 'resource-uploader');
      const label = el('label', undefined, uploader, 'upload-label'); label.htmlFor = 'resourceFiles';
      el('strong', 'Add your PDF or images', label);
      el('span', 'Choose files or drop them here · PDF, PNG, JPEG, WebP, GIF · up to 30 MB each', label);
      const input = el('input', undefined, uploader); input.id = 'resourceFiles'; input.type = 'file'; input.multiple = true;
      input.accept = 'application/pdf,image/png,image/jpeg,image/webp,image/gif'; input.disabled = busy || !storageReady;
      input.onchange = () => addFiles(Array.from(input.files));
      let dragDepth = 0;
      uploader.ondragenter = event => { event.preventDefault(); dragDepth++; uploader.classList.add('drag-over'); };
      uploader.ondragover = event => event.preventDefault();
      uploader.ondragleave = () => { if (--dragDepth <= 0) uploader.classList.remove('drag-over'); };
      uploader.ondrop = event => { event.preventDefault(); dragDepth = 0; uploader.classList.remove('drag-over'); addFiles(Array.from(event.dataTransfer.files)); };
      const help = el('p', !storageReady ? 'Opening your saved teaching files…' : persistent
        ? 'Saved in this browser on this device. Export the student website to include these files when sharing or publishing to GitHub Pages.'
        : 'Browser storage is unavailable: uploads last only while this page stays open. Export the student website before closing it.', root, 'resource-storage');
      help.id = 'resourceStorageHelp'; input.setAttribute('aria-describedby', help.id);
      if (bundled[id]?.resources?.length) {
        const toggleLabel = el('label', undefined, root, 'resource-sample-toggle');
        const toggle = el('input', undefined, toggleLabel); toggle.type = 'checkbox'; toggle.checked = !suppressed[id];
        el('span', 'Include the Typst sample papers', toggleLabel);
        toggle.onchange = () => { suppressed[id] = !toggle.checked; try { localStorage.setItem('physics-resource-samples-hidden', JSON.stringify(suppressed)); } catch (_) {} render(topic); byId('lessonResources').querySelector('.resource-sample-toggle input')?.focus(); };
      }
    }
    const status = el('p', message, root, 'resource-status'); status.id = 'resourceStatus'; status.setAttribute('role', 'status');
    if (!currentResources.length) {
      el('p', teacher ? 'Add the worksheet you want your students to use. It will appear here in this lesson.' : 'No resources are included for this lesson.', root, 'resource-empty');
      return;
    }
    const grid = el('div', undefined, root, 'resource-grid');
    currentResources.forEach(resource => {
      const card = el('article', undefined, grid, 'resource-card');
      const thumbnail = el('button', undefined, card, 'resource-thumbnail'); thumbnail.type = 'button'; thumbnail.setAttribute('aria-label', 'Preview ' + resource.title);
      const imageSrc = resource.pages?.[0]?.src || (resource.kind === 'image' ? resource.src : null);
      if (imageSrc) { const image = el('img', undefined, thumbnail); image.src = imageSrc; image.alt = ''; image.loading = 'lazy'; image.decoding = 'async'; }
      else { el('span', 'PDF', thumbnail, 'pdf-file-mark'); el('span', resource.title, thumbnail, 'pdf-file-title'); el('span', 'Open embedded preview ↗', thumbnail, 'pdf-file-hint'); }
      thumbnail.onclick = () => showPreview(resource, thumbnail);
      const body = el('div', undefined, card, 'resource-card-body');
      el('p', resource.meta || (resource.kind === 'image' ? 'IMAGE' : 'PDF'), body, 'resource-meta');
      el('h3', resource.title, body); if (resource.description) el('p', resource.description, body, 'resource-description');
      const actions = el('div', undefined, body, 'resource-card-actions');
      const button = el('button', 'Preview', actions); button.onclick = () => showPreview(resource, button);
      link(resource.pdf ? 'Download PDF ↓' : 'Download image ↓', resource.pdf || resource.src, actions, resource.filename || resource.pdf?.split('/').pop());
      if (resource.local) { const remove = el('button', 'Remove', body, 'resource-remove quiet'); remove.disabled = busy; remove.setAttribute('aria-label', 'Remove ' + resource.title); remove.onclick = () => removeFile(resource); }
    });
    if (currentResources.some(resource => resource.sample)) {
      el('p', 'The Typst sample is an original Edexcel IAL Unit 1 practice resource, not an official Pearson paper.' + (teacher ? ' Add your own material to extend or replace it.' : ''), root, 'resource-storage');
    }
  }
  function previewPage(index) {
    if (!preview) return;
    const pages = preview.resource.pages || [];
    preview.index = Math.max(0, Math.min(Math.max(0, pages.length - 1), index));
    const resource = preview.resource, page = pages[preview.index];
    const image = byId('previewImage'), frame = byId('previewFrame');
    image.hidden = !page && resource.kind !== 'image';
    frame.hidden = !!page || resource.kind === 'image';
    if (page || resource.kind === 'image') {
      image.src = page?.src || resource.src; image.alt = page?.alt || resource.title;
      byId('previewFullImage').href = image.src;
      if (frame.hasAttribute('src')) frame.removeAttribute('src');
    } else { image.removeAttribute('src'); frame.src = resource.pdf || resource.src; frame.title = resource.title + ' PDF preview'; }
    byId('previewFullImage').hidden = image.hidden;
    byId('previewInstructions').textContent = pages.length > 1 ? 'Use the arrow keys to change pages.' : resource.kind === 'pdf' ? 'Use the PDF viewer controls to read all pages.' : 'Read the image here or open it at full size.';
    byId('previewPage').textContent = pages.length ? 'Page ' + (preview.index + 1) + ' of ' + pages.length : resource.kind === 'image' ? 'Image preview' : 'PDF viewer';
    byId('previousPage').hidden = byId('nextPage').hidden = pages.length < 2;
    byId('previousPage').disabled = preview.index === 0;
    byId('nextPage').disabled = preview.index >= pages.length - 1;
    byId('previewCaption').textContent = page?.alt || (resource.kind === 'pdf' && !pages.length ? 'If your browser cannot display the PDF, use Open PDF above.' : resource.title);
    byId('previewPDF').href = resource.pdf || resource.src;
    byId('previewPDF').textContent = resource.kind === 'image' ? 'Open image ↗' : 'Open PDF ↗';
    byId('previewHeading').textContent = resource.title;
  }
  function showPreview(resource, button) {
    window.labDebug?.setTime(window.labDebug.getState().time);
    document.querySelectorAll('video').forEach(video => video.pause());
    preview = { resource, index: 0 }; opener = button; previewPage(0);
    byId('resourcePreview').showModal();
  }
  async function exportSite() {
    if (busy || !storageReady) return;
    busy = true; message = 'Preparing your student website…'; render(topic);
    try {
      const library = structuredClone(bundled), uploads = [];
      for (const id of new Set([...Object.keys(bundled), ...[...memory.values()].map(record => record.topic)])) {
        library[id] = { ...(library[id] || {}), resources: suppressed[id] ? [] : [...(bundled[id]?.resources || [])] };
        for (const record of orderedFiles()) {
          if (record.topic !== id) continue;
          const path = 'uploads/' + id + '/' + record.id + '.' + record.extension;
          uploads.push({ path, blob: record.blob });
          library[id].resources.push({ id: record.id, title: record.name.replace(/\.[^.]+$/, ''), kind: record.kind,
            src: path, ...(record.kind === 'pdf' ? { pdf: path } : {}), filename: record.name, meta: (record.kind === 'pdf' ? 'PDF' : 'Image') + ' · ' + size(record.blob.size) });
        }
      }
      const pathsFor = resource => [resource.pdf, resource.src, ...(resource.pages || []).map(page => page.src)].filter(Boolean);
      const includedPaths = new Set(Object.values(library).flatMap(lesson => (lesson.resources || []).flatMap(pathsFor)));
      const excludePaths = [...new Set(Object.values(bundled).flatMap(lesson => (lesson.resources || []).flatMap(pathsFor)))].filter(path => !includedPaths.has(path));
      const blob = await window.PhysicsResourceExport.buildSite({ library, uploads, excludePaths, onProgress: text => { const status = byId('resourceStatus'); if (status) status.textContent = text; } });
      const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'Physics-in-Motion-student-site.zip'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      message = 'Student website exported. Unzip it to preview, or publish its contents to GitHub Pages. It includes your teaching files and hides the teacher upload controls.';
    } catch (error) { message = 'Export could not finish. ' + error.message; }
    busy = false; render(topic);
  }
  async function init() {
    const frame = el('iframe', undefined, byId('previewImage').parentElement); frame.id = 'previewFrame'; frame.className = 'preview-pdf-frame'; frame.hidden = true;
    byId('previewImage').after(frame);
    byId('closePreview').onclick = () => byId('resourcePreview').close();
    byId('previousPage').onclick = () => previewPage(preview.index - 1);
    byId('nextPage').onclick = () => previewPage(preview.index + 1);
    byId('resourcePreview').addEventListener('close', () => { byId('previewFrame').removeAttribute('src'); byId('previewImage').removeAttribute('src'); preview = null; if (opener?.isConnected) opener.focus(); });
    byId('resourcePreview').addEventListener('keydown', event => {
      if (!preview || !preview.resource.pages?.length) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); previewPage(preview.index + (event.key === 'ArrowLeft' ? -1 : 1)); }
    });
    document.addEventListener('physics-topic-change', event => {
      if (byId('resourcePreview').open) byId('resourcePreview').close();
      message = ''; render(event.detail.id);
    });
    if (teacher) await openDatabase();
    storageReady = true;
    render(window.labDebug?.getState().id || 'motion');
    window.PhysicsLessonResources = { refresh: () => render(topic), getFiles: () => [...memory.values()].map(({ blob, ...record }) => ({ ...record, size: blob.size })) };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
