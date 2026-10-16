# Lessons 1, 2 and 4 — live TeX and force construction verification

16 October 2026. The fourth lesson now follows the live five-view visual-reasoning approach used in lessons 1–3. The first two scene renderers have also been migrated to genuine local TeX. Ordinary website text uses Arial, with Helvetica/sans-serif fallbacks; specialised formula glyphs retain KaTeX's mathematical fonts.

## Independent analytical checks

The following suites passed against the final renderers:

| Suite | Analysis states | Numerical checks | Finite rendered frames | Parsed SVG documents |
|---|---:|---:|---:|---:|
| Motion | 8,250 | 59,813 | 1,734 | 378 |
| Displacement | 8,248 | 101,070 | 490 | 488 |
| Forces | 11,696 | 493,231 | 481 | 482 |
| Projectile regression | 3,619 | 144,235 | 399 | 399 |

The actual bundled KaTeX parser validated 1,758 distinct motion scene expressions, 223 displacement expressions, and 76 force scene expressions plus 36 written force expressions. A separate authored-content sweep parsed 151 TeX expressions across the first four lessons, their guides and introductions without errors. The 648-state opening-model suite passed 16,803 numerical checks. The general model suite passed 351 analytical states across the original fifteen models and verified 49 original-model exam subparts; including projectile, the site has 54 original structured subparts.

Force checks use independent anchors (6 N east and 8 N north give 10 N at 53.130102 degrees), single and zero forces, equal opposite forces, all four quadrants, all selectable angles, magnitude limits, cosine-rule and triangle bounds, commutativity and rotation. Construction progress never changes the analytical forces. Tests read actual SVG arrow endpoints to check equal horizontal and vertical scales and a translated B arrow's invariant length and direction. The scale stays fixed when only progress changes. All five views, compact layouts, visibility flags and four saved resultants are covered.

The first two suites retain signed-area/distance, reversal, tangent, constant-acceleration and zero-time checks. At zero elapsed time, the gradient view uses the derivative instead of an undefined division. Rounded numerical substitutions use approximation signs.

## Browser verification

Independent real-browser checks inspected all five force views and both earlier lessons at viewport widths 1440, 375 and 320 px. The first two lesson migration checks included 30 principal scenes and 270 zero-time, reversal and constant-velocity edge views. TeX labels stayed inside the scene and the document did not overflow horizontally. Ordinary scene text and headings computed to Arial. Genuine fractions, subscripts, vector symbols and equations rendered without KaTeX errors.

The integrated fourth lesson passed view selection and keyboard navigation, slider/keyboard scrubbing, parameter edits while retaining construction progress, zero-resultant direction, all quadrants and the three presets. Play/Pause advances construction at approximately 0.16 of the diagram per second at 1x. Applied force values remain fixed. All four live lessons have no video element; the fifth lesson's retained video still appears.

The common relationship and numerical panels for lessons 1, 2 and 4 use aligned TeX lines. Final 320 px and 1440 px integration checks across the first four lessons found no document or relationship-panel horizontal overflow, no KaTeX errors, Arial headings and live TeX scene labels.

Representative screenshots are in the workspace's output/playwright folder, including lesson4-final-preview.png, lesson4-independent-mobile320.png, forces-renderer-mid-translation.png and the opening-tex motion/displacement sets. Screenshots and tests are QA artifacts rather than student-site assets.

## Teaching boundaries and local Kimi review

The force diagram assumes coplanar forces concurrent at a particle. Angles are anticlockwise from the positive horizontal axis. The slider is geometric construction progress within the selected view, not physical time. Components represent the original force; they are not extra forces. Translating an arrow is vector addition, not relocating an actual rigid-body force application point. A zero resultant has undefined direction. The equilibrant gives translational force balance; a rigid body also needs zero net moment for full equilibrium.

The signed-in local Kimi desktop app completed a bounded original-text review. Its observation question and ambiguity checks informed the introduction, sign/quadrant explanations and construction-progress wording. Codex independently checked the physics and corrected an out-of-range angle example and positive-versus-nonnegative wording. No CLI, folder access or new tool permissions were used. See KIMI_LESSON4_REVIEW.md in the teacher package.

## Packaging

Run node scripts/package_lesson4.cjs to rebuild the Lesson 4 student and teacher archives. The student package uses the same dependency-free website exporter as the browser button. Both packages include all four live renderers, the shared local TeX renderer and fonts, introductions, annual plan and editable curriculum map. The teacher package additionally includes authoring sources and these review records. The script checks required assets, ZIP CRCs, unique safe paths, student/teacher mode, student manifest equality and byte identity of the original school-plan DOCX. Earlier Lesson 1–3 archives remain available separately.

The baseline package includes the bundled resource library. The teacher's local uploaded PDFs and images can continue to be included through Export student website; browser-stored uploads are not silently copied into the baseline package. Publishing to GitHub Pages remains a later action. The original annual plan and existing Canva design are unchanged by this lesson update.
