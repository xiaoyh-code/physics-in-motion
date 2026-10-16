# Lesson 2 and annual course guide — verification, 16 October 2026

## Live visual reasoning

- Lesson 2's five SVG views share the lab's physical clock and parameters: displacement curve, tangent velocity, signed velocity–time areas, rectangle/triangle SUVAT construction, and elimination of time. Lessons 1 and 2 create no video element. The two other existing video lessons remain available.
- Independent analytical checks passed: general models 351 states; opening/projectile checks 648 states; lesson-1 renderer 8,250 states; lesson-2 renderer 8,248 states with 101,070 numerical checks, 489 render frames and 488 parsed SVG XML documents.
- Browser checks verified direct `#displacement` loading, five view buttons, three presets, parameter edits retaining time, time scrubbing, turning-point stepping, zero acceleration, per-topic view state, comparison runs and topic round trips. The four-run capture button now correctly remains disabled after returning to a capped topic; clearing runs enables it.
- Reversing trolley: u = 4 m/s, a = −1 m/s², t = 6 s gives v = −2 m/s, displacement +6 m, distance 10 m, signed areas +8 m and −2 m; direction changes at 4 s. At 4 s, v = 0 while a remains −1 m/s².
- The written SUVAT derivation now completes a square without division by a or t, matching the zero-acceleration case in the live view. Squared velocity does not encode direction.
- CMU Serif loads from local OTF files: `document.fonts.check('16px "CMU Serif"')` returned true; computed heading and SVG text styles both select CMU Serif. Its original SIL OFL notices accompany exports.
- A 375 px browser viewport used the 460 × 800 compact SVG and had no document overflow. Desktop and mobile screenshots are in the root `output/playwright` QA folder.

## Annual guide and lesson introductions

- Sixteen original motivations, observation questions and three targets per lesson are present, with official Pearson textbook/specification links. Lesson 1's graph description explicitly uses **signed area for displacement**.
- The source annual-plan DOCX is byte-identical to the supplied original: SHA-256 `55c84ef0cab69be1735cc7b5731116ec8da2c6b8043c27ffc54e51f0f5904f3e`. A separate 15-page landscape PDF is labelled a layout-adapted reading copy; its source and QA notes are in `resources/curriculum/README.md`.
- The year guide renders seven summary rows, fifteen detailed groups, seven gaps, twenty-eight source quotations and twenty-one specific IAL connection references. Unmatched school objectives explicitly say there is no direct IAL match established by that entry; foundation content is distinguished from substantive topic alignment.
- At widths 1440, 375 and 320 px, the year guide had no horizontal overflow or script errors. All detail/gap controls opened. Thirteen observed text/background combinations passed AA contrast, with the lowest ratio 5.58:1. The PDF embed is loaded only when requested; direct DOCX/PDF links work without JavaScript.
- The editable course map contains native text and vector shapes, seven full summary rows, source hyperlinks and scope caveats. The PDF is one A3 landscape page; SVG and final PDF renders were inspected for clipping. The additional native A3 PPTX contains 67 separate Arial text boxes and vector shapes, with each table cell independent. Its final reimported render and geometry checks passed.
- The annual map records planned objectives rather than mastery or full IAL unit completion. Current live-site scope remains sixteen first-term mechanics/energy lessons; later annual blocks are future course destinations.

## Kimi skill and desktop delegation

- The local Kimi app completed one bounded text-only draft review. Selected wording was independently reviewed and incorporated; Kimi did not research or verify official syllabus statements. See `KIMI_REVIEW.md`.
- The global `delegate-to-kimi` skill and `agents/openai.yaml` now default to the local desktop app and existing login. CLI use requires an explicit request. `quick_validate.py` returned `Skill is valid!`; metadata and four independent workflow scenarios passed review.

## Packaging

`scripts/package_lesson2.cjs` rebuilds the manifest and both Lesson2 distribution archives. Student packaging uses the same `PhysicsResourceExport.buildSite` implementation as the browser's export action; teacher mode and editable sources are retained separately. Font assets, licences, year-guide resources and the original school-plan DOCX are included. ZIP CRC/content verification and extracted-student browser checks are performed before delivery.

## Canva desktop result

The signed-in Canva desktop app imported the PPTX as a separate design titled **2026–27 Physics 課程導讀 · School Plan → Edexcel IAL**. The resulting page is labelled A4 landscape by Canva; the local source PPTX and print PDF remain A3. All seven rows align cleanly in the final Canva screenshot. Selecting the first school-topic cell exposes the native Arial/font-size/bold/alignment toolbar, confirming editable text rather than a flattened image. Canva reported all changes saved. The teacher-only link in the course guide opens this design; the exported student page hides that editor section. No sharing permissions were changed.
