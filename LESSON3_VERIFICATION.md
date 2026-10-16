# Lesson 3: Projectile motion — verification, 16 October 2026

## Analytical renderer checks

`node test_projectile_visual.cjs` passed with **3,619 analysis states, 144,235 numerical checks, 399 finite rendered frames and 399 parsed SVG XML documents**. The checks cover all five views, desktop and compact layouts, visibility options, four comparison runs, equal-axis geometry and scales that stay fixed while scrubbing. A TeX spy verifies that the renderer sends formulae to the shared mathematical typesetter; it does not substitute for checking KaTeX in a browser.

The same suite validated **71 authored content expressions and 209 distinct live-scene TeX expressions with the real bundled KaTeX parser**. `node test_opening.cjs` also passed with **648 states and 16,803 numerical checks**. The projectile guide, assumptions, checkpoint and practice now use TeX for mathematical expressions; the written derivation includes conditional elimination of time for the trajectory.

Independent anchors and boundary cases include:

- A horizontal launch at 12 m/s from 5 m with gravity 10 m/s² has flight time 1 s and range 12 m.
- A downward launch at 12 m/s and −30° from 8 m with gravity 10 m/s² has flight time 0.8 s, range 8.313843876 m and pre-impact vertical velocity −14 m/s.
- A vertical upward launch at 10 m/s from ground level with gravity 10 m/s² reaches its apex at 1 s, has maximum height 5 m and flight time 2 s. Downward acceleration remains 10 m/s² at the apex.
- A horizontal or downward launch at ground level has zero airborne duration. A raised downward launch uses a rationalised landing root to avoid cancellation.
- At the allowed extreme of 30 m/s vertically upward from 20 m with gravity 0.5 m/s², the flight time is 120.663003552 s and maximum height is 920 m.
- Ground-level upward complementary launch angles have equal range. The test does not generalise that result to raised launches.

The checks also compare the renderer's analysis with the existing analytical projectile model and test finite geometry for very short, vertical and zero-duration trajectories. Source inspection confirms that the trajectory uses equal horizontal and vertical length scales, computed from complete flights so scrubbing alone cannot resize the graph.

`node test_models.cjs` passed with 351 analytical states across the original models. The checks for the earlier lessons remain available; this change retains their live controllers and resource workflow.

## Browser verification

The actual browser rendered all five projectile views at **1440, 375 and 320 px** viewport widths with:

- No horizontal document overflow.
- No mathematical labels extending outside the live SVG.
- No `.katex-error` elements; six or seven rendered TeX labels per view.
- Arial selected for ordinary heading text.

Five representative scene frames containing actual KaTeX output also parsed as valid SVG XML. Extreme shallow, vertical and low-gravity flights were inspected after the axis-tick spacing refinement. The compact velocity triangle was moved and scaled so downward launches fit above the footer.

## Local Kimi collaboration

The signed-in local Kimi desktop app completed a bounded text-only teaching review. One observation question was adopted and the landing description was clarified. The coordinating agent independently checked and corrected the physics caveats. Kimi did not edit files, control the website or verify syllabus sources. The review record is `KIMI_LESSON3_REVIEW.md` in the teacher package.

## Scope

The five live views are Resolve launch, One clock, Apex, Trajectory and Range. They explain component resolution, a shared time, vertical velocity at the apex, elimination of time and landing range. The physical model assumes a point particle, no air resistance, constant positive gravity and a horizontal ground surface. Motion stops at the first ground contact; contact velocity is pre-impact. The equal-height range expression applies to an upward launch from the landing level. No bounce is modelled.

Ordinary website content uses Arial with sans-serif fallbacks. Formulae use local TeX rendering with KaTeX's specialised glyph fonts where needed for mathematical layout. The retained CMU Serif assets are unused legacy files with their original licence notices.

The original school plan, curriculum map and per-lesson teacher upload workflow remain part of this site. The course map records planned topic alignment, not assessed mastery or completion of a whole IAL unit. The existing Canva design is unchanged by this lesson update.

## Packaging

`node scripts/package_lesson3.cjs` built separate Lesson 3 student and teacher archives while preserving the earlier distributions. The student archive contains **128 runtime entries**; the teacher archive contains **146 entries**, including this verification record, the Kimi review and editable authoring sources. The required live renderer and shared TeX helper are manifest-checked. ZIP CRCs, unique safe paths, student/teacher mode, student manifest contents and byte identity of the original school-plan DOCX passed validation.

The student archive was extracted to `output/playwright/student-site-lesson3-verified` for browser verification. The script uses the same dependency-free site exporter as the teacher's browser export button. Existing uploaded PDFs and images can continue to be bundled through that button; the packaged baseline contains only the site's bundled resource library.

## Final integration checks

Independent browser review confirmed parameter edits retain time and clamp it to the new flight duration; all five time controls disable for zero flight time. The 120.663-second low-gravity flight, 60-second apex, first contact, vertical-launch branch, presets, written derivation/checkpoint/practice TeX and Arial content all passed. Representative first- and second-lesson views retained readable Arial diagram text without overflow. The generic exam gravity instruction was also converted to TeX after this review; the final browser check found its rendered math annotation and no TeX errors.

Rounded numerical substitutions in the live lower panel use approximation signs. Font-load completion invalidates cached label measurements and refits the current scene, preventing stale fallback-font widths. The extracted student build was opened over localhost: student mode, apex preset, seven live TeX labels and Arial headings passed, with no video, upload input or teacher export control present.
