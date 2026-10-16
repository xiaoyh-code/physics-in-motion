# Lesson 1 and teacher resource library — 16 October 2026

## Live animation revision

The first lesson now uses an actual SVG animation inside the existing experiment. `motion-visual.js` renders the live trolley, velocity–time graph, signed area contributions and equations; `motion-lesson.js` provides five reasoning views and presets. The existing playback, speed, time slider, stepping, parameter inputs, display flags and comparison controls drive this one diagram. The previous lesson-1 video player is absent, including after switching away and back.

Browser checks confirmed live playback advances the rendered time, direct numeric inputs and the timeline update velocity/displacement, the constant-velocity preset gives 12 m at 4 s, and the reversal preset gives displacement +12 m and distance 20 m at 6 s. Selecting a view preserves the physical state and pauses playback. Lesson-1 parameter edits now retain the inspected time. The other lessons retain their earlier behavior and worked media. No document overflow at 320 or 390 CSS px; no video element exists on the first lesson. Resource cards remain available below.

`node test_motion_visual.cjs` passes 8,250 physical states, 59,813 numerical checks and 1,732 finite SVG frames; 378 SVG documents also parse independently as XML. Coverage includes signed areas, exact reversal distance, zero acceleration/time, all five views, mobile layouts and four comparison runs. Existing model, opening-lesson and ZIP export tests also pass. Desktop/mobile diagrams and the four-run legend were inspected visually. Source files pass Node syntax checks.

Current screenshots: `../../output/playwright/live-motion-example-desktop.png`, `live-motion-reversal-desktop.png` and `live-motion-reversal-mobile.png`.

## Earlier video and resource-library pass

The following records the initial implementation before the live-animation revision above.

Implemented the user-confirmed first-lesson pass and a reusable resource collection at the end of all 16 lessons. The site preserves its existing English content, notebook typography and blue/red/white interface. Lesson 1's animation uses a distinct dark mathematical canvas with labelled cyan/amber area contributions.

## Teaching materials

- `MotionSolution`: 55.582 seconds, 1280 × 720, 24 fps, five chapters. Timings: 0, 13.125, 23.292, 34.625 and 46.75 seconds.
- Same scenario across animation, exam and Typst example: u = 2.0 m/s, a = 1.5 m/s², t = 4.0 s; v = 8.0 m/s and s = 20 m. The transfer button loads that exact laboratory state.
- Original Typst QP: three pages, 20 marks (MCQ 4, fill 4, structured 12); MS: two pages. Both compile. Locked QP layout policy passes. All five rendered pages were inspected. `Insert/` remains empty and the QP contains no image calls.
- Other lesson animations are retained. Scope and primary Pearson references are recorded in `resources/motion/README.md`.

## Browser checks

Playwright tested the teacher edition on the local server and a separately served exported student edition with independent browser state:

- PDF and JPEG uploads, native embedded PDF display, enlarged images, sample page navigation and Escape/focus return.
- Uploads survive reload and remain associated with the correct lesson. Switching to another lesson shows its separate collection. Test uploads were removed and their removal verified after reload.
- Unsupported JavaScript files are rejected with visible feedback and do not enter the library.
- A chapter played at 1.5× stops at 13.045 seconds before the next chapter, retaining the selected first step.
- Sample papers can be deselected. Export omits their PDF/PNG payloads and serializes an empty library correctly. The student route omits the corresponding paper link when empty.
- A student export containing test PDF/image uploads was unzipped and served separately. Its PDF request returned HTTP 200; teacher upload/remove/export controls were absent and the student library contained file paths rather than blob URLs.
- ZIP CRC validation passed using Python's independent `zipfile` implementation. Packaged inventory matches the ZIP exactly, including uploaded files.
- No horizontal document overflow at 1200, 390 or 320 CSS px. No KaTeX errors or browser console errors in the final teacher pass.

Screenshots are in `../../output/playwright/`, including `lesson1-final-desktop.png`, `lesson1-mobile-resources.png`, `lesson1-worksheet-preview.png` and `lesson1-pdf-embed.png`.

## Automated checks

- `node test_models.cjs`: 351 analytical states and original content checks passed.
- `node test_opening.cjs`: 648 projectile states and 16,803 numerical checks passed.
- `node test_resource_export.cjs`: binary/Unicode ZIP integrity, nested site paths, uploaded files, sample exclusion, exact inventory, and error cases passed.
- New/modified browser JavaScript passes `node --check`.

Local uploads use IndexedDB scoped to the browser and website origin. They do not automatically publish to GitHub Pages. Export requires HTTP(S), includes selected files in a standalone static student website, and performs no external publishing. Native PDF support depends on the browser; a direct file-opening link remains available.
