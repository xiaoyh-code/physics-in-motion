# Teacher uploads and student sharing

Each lesson ends with **Lesson resources**. The local teacher edition accepts PDF, PNG, JPEG, WebP and GIF files, up to 30 MB each. Choose several files or drop them into the upload area. Select **Preview** to read a PDF inside the page or enlarge an image. Download links retain your original filename. **Remove** removes an uploaded file from that lesson.

Files are saved in IndexedDB in the current browser, on this device, for this website address. Switching lessons keeps each lesson's files separate. Reloading restores saved files. A different browser, address or port uses separate storage; clearing website data deletes the saved uploads. The page reports when storage is unavailable. Keep the original teaching files as your backup.

The first lesson includes a 20-mark sample QP and matching MS made with the **create-typst-test-paper** skill. Uncheck **Include the Typst sample papers** if you want to show only your own material. Other lessons are ready for your uploads. The editable sample sources and empty `Insert/` folder are in `resources/motion/`.

## Run the local teacher website

Start a local server in this `interactive` folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`. Use that same address and port to return to the same saved library. Opening `index.html` directly may support upload/preview in some browsers, but exporting requires the local server.

## Export for students or GitHub Pages

1. Upload the files to the relevant lessons. Decide whether to include the sample papers.
2. Select **Export student website**. This downloads `Physics-in-Motion-student-site.zip`, including the interactive lessons, animation files, local math fonts and selected teaching files.
3. Unzip it. `index.html` must be at the root of the folder you publish.
4. To test locally, serve that exported folder on another port. To publish later, add its contents to the folder configured for your GitHub Pages site. No external publishing occurs when you export.

The exported edition displays the selected resources directly from bundled files. It hides upload, removal and export controls and does not read the teacher browser's uploaded-file database. Students can open/download the files without importing a library. The teacher edition remains here for future edits; exporting does not remove your uploads.

PDF display uses the browser's native PDF viewer. If a browser cannot embed a PDF, **Open PDF** remains available. Typst sample pages also have individual PNG previews. Uploaded PDFs are not converted into images.

If a sample resource or runtime file changes, refresh the export inventory before the next export:

```sh
python3 scripts/build_site_manifest.py
```

The student ZIP includes the compiled sample PDFs and previews. The editable `.typ` sources and authoring scripts remain in the teacher project.
