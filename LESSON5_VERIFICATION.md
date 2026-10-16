# Lesson 5 — live air resistance, parachute opening and terminal velocity

16 October 2026, Asia/Macau.

## Result

The fifth lesson now uses a live parameter-controlled SVG experiment rather than a video. It shows a following-camera person, upward air resistance, downward weight and a synchronized downward-speed graph. The canopy starts opening at the selected time, grows smoothly for three seconds and then retains its fully open size. Its shape and the force/velocity state are recalculated when the timeline is scrubbed backwards or forwards.

Five settings control total mass, body posture, whether the canopy opens, its size and the start of opening. Changing one preserves the current physical time and pauses playback. No-opening mode disables the two irrelevant canopy controls. The 60-second timeline supports playback, pause, reset, one-second steps, event jumps, keyboard input and touch scrubbing. Up to four saved parameter sets use shared graph scales. The figure's frame follows the fall; the animation does not depict ground contact or landing.

Default presentation hides calculations and derivation. Show the force explanation reveals five concept views and elementary locally rendered TeX force relations. Neither the explanations nor the original conceptual practice asks the student to calculate a drag law or solve a differential equation. Ordinary text uses Arial. The reading module has three original explanation stages, an interactive prediction and a misconception reminder, informed by the teacher's screenshots and the supplied revision-page organisation. The screenshots' inconsistent opening-drag sentence was corrected.

## Physics and rendering checks

`node test_terminal.cjs` passed **19,959 motion states, 451,118 numerical checks and 162 complete parameter trajectories**. Independent analytic anchors cover the constant-resistance regimes before and after deployment. Tests also check continuity of speed, position and force; force balance; both limiting speeds; derivatives of the graph; parameter bounds/trends; time clamping and sanitisation; and replacement of the active browser model.

The backend uses a cached numerical resistance model with smooth deployment, fixed gravity, still air and constant total mass. This implementation supplies a coherent illustrative animation. It is not a student formula requirement or a parachute-design model. Very early opening does not automatically cause slowing: the current force comparison determines whether speed rises or falls. Finite-time near-terminal labels describe approximate force balance. Speed remains continuous during opening, and downward motion can coexist with upward resultant force and decreasing speed.

`node test_terminal_visual.cjs` passed **804 scenes, 6,592 geometry/state checks and 805 parsed SVG/XML documents**, with **23 distinct scene expressions and 12 authored expressions** parsed by the real bundled KaTeX. It covers all five views, desktop/compact geometry, visibility options, four saved curves, fixed graph/force scales, proportional force arrows, an exact local graph tangent, and smooth canopy dimensions. It rejects displayed drag-law, exponential and calculus expressions. Force/graph scales depend on the complete run and remain fixed while time is scrubbed.

The original-model baseline suite passed 351 analytical states and the updated 50 original-model exam subparts. The projectile module supplies five more, giving 55 structured subparts across the site. Its old generic linear-drag fallback is retained only for historical baseline compatibility; the active fifth lesson uses TerminalModel and is checked separately above.

## Real-browser checks

The intact website was checked at widths 1440, 375 and 320 px, all five views at each width. There were no horizontal overflows, no SVG text outside the viewBox, no KaTeX errors and no video element. Actual touch events moved the time slider and updated the diagram consistently; keyboard Home/End reached release and 60 seconds. Play/Pause advanced time and Reset restored zero speed with a closed canopy.

At default opening midpoint, time is 21.5 seconds, the canopy opening fraction is 0.5, speed remains downward, and acceleration is upward. Editing mass, posture and size retained that time. No-opening mode disabled canopy controls and the opening shortcut. The four-run limit and shared scales passed; the fully open canopy retained its size later in the fall.

The optional force explanation, all derivation steps and qualitative exam content were inspected without any drag-law/calculus requirement. SPA navigation across lessons 1–5 retained Arial, the correct controls, hidden teacher-only settings in student mode and no video. The browser console recorded no errors or warnings during integrated verification.

The added reading module was checked separately: all three stages appear, the prediction gives explanatory feedback, and default equations remain hidden. Screenshots in output/playwright include lesson5-final-preview.png and terminal-integrated-mobile-375-proof.png. These are QA artifacts, not copied reference-site images.

## Reference and delivery

REA inspected the exact public reference supplied by the teacher. The compact evidence and adaptation record is LESSON5_REA_REFERENCE.md. The content scope and screenshot correction are recorded in LESSON5_CONTENT_NOTES.md. No reference-site photos, videos, questions or paragraphs are redistributed.

`scripts/package_lesson5.cjs` builds new student and teacher archives, preserving earlier Lesson 1–4 deliveries. Required live files, local fonts and TeX assets, ZIP integrity, safe/unique paths, student/teacher mode, runtime manifest equality and the unchanged original school-plan DOCX are verified. Browser-stored teacher uploads can still be included through Export student website; the baseline includes bundled resources only. The annual curriculum map and Canva design are unchanged.
