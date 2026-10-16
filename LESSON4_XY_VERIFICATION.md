# Lesson 4 — direct force editing and introductory X/Y components

16 October 2026. This revision adds direct manipulation to the fourth live lesson and adapts its teaching language to learners who have not met i/j unit vectors. It supersedes the lesson-4 interaction descriptions in the earlier verification record.

## Interaction and teaching model

Force A, force B and the resultant R have draggable tips. Moving A keeps B unchanged; moving B keeps A unchanged. Moving R keeps A fixed by default and finds B from the two signed component differences. The selector can instead keep B fixed and find A. This constraint is explicit because one resultant alone cannot uniquely determine both original forces. R represents the combined effect of A and B, not a third independent applied force.

The side panel contains six editable numeric fields: magnitude and direction of A, B and R. There are no parameter sliders. The result's direction is undefined when its magnitude is zero. A and B retain the lab's 100 N limit. An unreachable requested resultant is projected to the nearest point allowed by the fixed force and the other force's magnitude limit.

During a drag, the force diagram's camera and screen coordinate mapping stay fixed. Pointer capture is on the stable outer SVG. All three original tips remain in the plot; an edge message explains that releasing reframes the diagram so dragging can continue. Numeric fields offer a direct way to set larger changes. Keyboard arrows move a focused tip by 1 N along X/Y, or 5 N with Shift. A chooser followed by tapping a diagram position, four movement buttons and numeric fields provide alternatives to dragging, including when tips overlap. Transparent hit targets measure at least 44 CSS px at the tested mobile sizes. The scene has group semantics so its keyboard-operable controls remain exposed to assistive technology.

Default presentation is a clean diagram. Formula panels, computed component readouts, five derivation views and construction playback are hidden. Pale component helpers distinguish the X/Y parts from the stronger A, B and R arrows. Enable Show X/Y working to reveal the five views, genuine TeX formulae, component calculations and the construction timeline. The timeline reveals geometry; it does not model physical time. Ordinary content uses Arial.

The lesson begins with right/left and up/down sign conventions. Each force splits into ordinary horizontal and vertical components. Students add the X components and Y components in two independent one-dimensional calculations. Formulae use scalar F_A, F_B, F_R and their X/Y subscripts; there are no i/j basis symbols, vector-arrow formulas, column matrices or software atan2 expressions in the student-facing lesson. Inverse tangent is explained with quadrant, axis and zero-resultant cases. The eight derivation steps and four exam subparts totalling eight marks are retained.

## Verification

The pure direct-editing suite passed 796 independent cases and 6,333 numerical checks: reconstruction, either held force, signed quadrants, nearest reachable 100 N boundary, zero-angle preservation, input purity and repeated-endpoint stability.

The force-renderer suite verifies independent force geometry, cosine-rule and triangle bounds, commutativity, rotation, fixed isotropic cameras, actual handle endpoints, all five expanded views, flags and four saved resultants. It rejects i/j basis, vector-arrow and matrix TeX. Real bundled KaTeX parsing and independent XML parsing supplement the numerical checks.

The earlier motion, displacement and projectile regression suites passed unchanged analytical invariants: respectively 8,250 / 8,248 / 3,619 states and 59,813 / 101,070 / 144,235 numerical checks. One unrelated XML subprocess invocation stalled waiting for stdin EOF; the identical tests passed in a bounded rerun, and the same saved XML input parsed independently. No production or regression test sources were changed for that transport issue.

Desktop browser checks cover actual mouse dragging of A/B/R, both inverse constraints, keyboard increments and retained focus, overlapping-tip placement, fractional numeric validity, inverse numeric edits, preserved construction progress and the clean/expanded toggle. Mobile checks use actual touch events rather than synthetic pointer-only events. The status announcement is below the SVG so text wrapping cannot move the diagram during a drag. Starting a drag pauses playback without redrawing its touch target; a nonpassive touch listener prevents native scrolling only when a gesture starts on an actual handle. Other diagram areas retain vertical page scrolling.

## Delivery

The reproducible package script is scripts/package_lesson4_xy.cjs. Both new archives include force-drag-model.js and forces-interaction.js, the live renderer, local KaTeX/fonts and the existing resource library. Required assets, ZIP CRCs, unique safe paths, student/teacher modes, student manifest equality and the unchanged original teaching-plan DOCX are checked. Earlier delivered archives are preserved.

The baseline student archive contains bundled teaching resources. Browser-stored teacher uploads remain available through the site's Export student website action; this baseline does not silently copy them. The annual course map and Canva design are unchanged.

## Final results

The final force-renderer suite passed **11,696 states, 504,773 numerical checks, 721 frames and 722 parsed SVG documents**, including 240 clean-playground frames. It parsed **51 authored expressions and 93 distinct scene expressions** with real KaTeX. Clean-mode checks reject calculation equations and the component-value strip, verify strong full A/B/R arrows independently of construction progress, and verify quiet helper opacity below 0.4. The direct-editing suite passed **796 cases and 6,333 numerical checks**.

Independent real-browser verification passed **221 UI checks**. These include twelve actual touch drags (A/B/R in clean and expanded modes at both 375 and 320 px), all five working views, 44 CSS px hit targets, desktop mouse editing in both modes, two inverse constraints, keyboard and tap alternatives, numeric validity and retained progress. Final touch pointer errors were below 0.000004 N, every drag kept capture to release, and all twelve had zero page-scroll displacement. Touch gestures outside the handles still scrolled the page. No TeX errors or horizontal overflow were found.

The extracted student build was opened over localhost. Student mode, default hidden working, three handles, keyboard force editing and the expandable calculation panel passed; no upload input or force-parameter slider was present. ZIP checks confirmed 131 runtime entries in the student archive and 152 entries in the teacher archive. The user preview was refreshed to the clean default fourth lesson.
