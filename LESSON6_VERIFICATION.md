# Lesson 6 verification — 16 October 2026

## Delivered behaviour

Lesson 6 (`#momentum`) is a live two-car SVG experiment, with no video player. Numeric fields and sliders change either mass or signed initial velocity at the current paused time. Sticking is the default; perfectly elastic rebound is an optional comparison. The six-second timeline, playback speed, stepping, event jump and before/contact/after buttons use the same model state.

Ordinary text uses Arial. Equations, numerical mathematical labels, signed momenta and substitutions are genuinely typeset by the bundled local KaTeX runtime. Momentum calculations, numerical readouts and stepwise derivation are hidden initially. The explicit working checkbox, Derivation tab or Build the derivation route reveals the explanation. Five views share the same parameters and time. Up to four saved runs use shared scales.

## Physical model and limits

Two constant-mass cars move along one horizontal line. Right is positive. Their centres start at −5 m and +5 m; the model length of each car is 2 m, giving an 8 m bumper gap. Contact occurs at `8/(u1-u2)` only for an approaching pair. A constant/opening gap or contact beyond six seconds does not produce a fabricated collision. During a displayed collision, the facing bumpers meet with continuous positions; velocities switch instantaneously under the ideal collision rule. Stuck cars remain joined. There is no finite contact-force or deformation simulation.

The pair has no external horizontal impulse. Total signed momentum is conserved. Sticking generally reduces kinetic energy; the optional elastic rule also conserves kinetic energy. The SVG drawings are schematic fixed sizes, with their facing bumpers mapped to model front positions. The camera includes the full run and saved runs, so its spatial scale remains fixed while scrubbing. Arrow and momentum-bar scales also remain fixed.

## Independent checks

- `node test_collision.cjs`: **14,338 states, 570,801 checks, 1,568 parameter experiments**. Independent momentum, equal/opposite impulse changes, reduced-mass energy loss, exact contact geometry, continuous position, centre-of-mass motion, Galilean boosts, equal-mass elastic velocity exchange, same-direction/head-on/parallel/separating/rest/future-contact cases, sanitisation and actual browser model injection.
- `node test_collision_visual.cjs`: **1,345 scenes, 31,979 checks, 1,345 valid SVG/XML documents and 65 TeX expressions**. Every view, desktop/compact, hidden/expanded working, saved runs and display-flag combinations; signed bars, arrow magnitudes/directions, fixed scales, car bounds, bumper gaps and default calculation gating.
- Real Chromium browser testing: **223 assertions** across desktop and 375/320 px layouts; parameter edits retaining time, both collision rules, all event buttons, no-contact cases, default/expanded maths, five views, keyboard timeline, stepping, Play/Pause/Reset, four-run limit, first-five-lesson regressions, Arial, TeX, no overflow or video and no page errors. A real touch-input timeline drag reached 5.042 s at 320 px. A final reload also verified the Derivation tab and Build the derivation route reveal the working explicitly, while the default remains collapsed.
- The content revision preserves the other fifteen lessons. Eighteen newly authored TeX expressions compile. The original three-part question totals 8 marks and matches the live defaults: two 2 kg cars, A at +4 m/s and B at rest. Common velocity +2 m/s; individual momentum changes −4/+4 kg m/s.
- Targeted regressions: terminal-motion model 451,118 checks; direct-force model 6,333 checks.

Desktop and compact screenshots were visually inspected. The native in-app browser also displays the cars, labels and parameter controls correctly. Evidence is saved in the workspace `output/playwright/` directory.

## Distribution

`scripts/package_lesson6.cjs` rebuilds the static runtime manifest and separate student/teacher ZIPs. The student package is generated through the same resource exporter as the website. ZIP integrity, safe paths, required runtime files, student/teacher modes and the byte-identical original annual teaching plan are checked by the packaging script. The original worksheet upload/export workflow is retained; no new worksheet PDF is required for this animation change. The extracted student package was served separately and verified at 375 px: two cars, no teacher upload/export controls or video, initial calculations hidden, after-contact state at 3 s giving +2 m/s for each car and total momentum 8 kg m/s, then six signed bars and five-view TeX working after expansion. No browser errors, TeX errors or overflow occurred.
