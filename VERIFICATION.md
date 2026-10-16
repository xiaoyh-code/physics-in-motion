# Verification — 15 October 2026

- Node syntax checks passed for model, UI and content scripts.
- 351 analytical states checked across 15 models, including minimum/maximum parameter values and initial/midpoint/final times. Checks cover momentum conservation, restitution, kinetic-energy loss, free-fall energy, beam force/moment balance, impulse, kinetic energy versus momentum, lifting power and linear-drag force balance.
- 48 structured subparts: mark allocations match the number of marking points. Numerical targets were independently recalculated during content creation.
- Chromium/Playwright exercised all 15 topics and revealed every derivation step; no page errors, TeX parse errors or invalid SVG numeric values were observed. Desktop screenshots inspected across topics.
- UI checks passed for parameter updates, playback, timeline, pinned comparison, derivation reveal, exam numeric feedback, frozen-parameter challenges, recorded data, least-squares gradient and CSV download. The CSV contents were inspected.
- Direct file opening verified local KaTeX rendering and parameter interaction. No remote asset is required. The rendered student interface was checked for unintended Chinese text.
- 390 px mobile layout checked for horizontal page overflow. Blue/red/white desktop, mobile and exam views visually inspected. Primary foreground colours are dark blue/red on white; graph series use light blue/red on dark blue and labels supplement colour.
- The original entry page redirects to the interactive edition after navigation; the former video edition is retained as `../video_edition.html`.

Limits: checks do not constitute an official syllabus audit or examiner validation. Numeric feedback uses a 1% tolerance and does not award reasoning marks. Diagram geometry may rescale, and static diagram-reveal animations are identified as such. Student data is stored locally in the browser, without a remote backup.

Typography update: Arial verified through computed styles for body, headings and SVG labels; KaTeX_Main remains the mathematical font. Desktop exam view inspected and 390 px mobile width checked without horizontal page overflow.

## Manim visual worked solutions

- Four original Manim CE 0.22.0 scenes rendered as silent H.264 MP4, 1280 × 720 at 24 fps. Durations: motion 27.75 s; displacement 31.75 s; vectors 29.75 s; Newton 29.25 s.
- Visually inspected one settled frame from every chapter (16 frames). Corrected transparent vector-math backgrounds, uniform equation sizing, the average-velocity overbar, and the Newton force-diagram/graph transition. The Newton fourth chapter displays the vertical force diagram.
- Independently checked the fixed question results and assumptions against the existing exam content. All 16 TeX reasoning expressions passed strict KaTeX parsing. The two-leg displacement journey and horizontal trolley are explicitly separate scenarios from the live models.
- Chromium exercised all 16 paused chapter seeks and reasoning reveals. Each clip's first chapter was played to its automatic stop, 0.08 s before the next chapter. No browser page errors or media errors occurred.
- The local Python server does not provide HTTP Range responses. HTTP(S) clips now load through local Blob URLs, making the complete clip seekable. Direct file opening also passed a chapter seek and local formula-rendering check.
- Confirmed pause on leaving the practice tab, pause/source release when switching topics, visibility of this feature only on the first four topics, prediction-note retention between steps, keyboard reasoning reveal, and no horizontal page overflow at 390 px. Desktop and mobile screenshots inspected.
- Existing model checks still pass: 351 analytical states and 48 structured exam subparts. These new videos illustrate fixed-data worked examples; they do not substitute for the adjustable live models or assess written predictions.


## Opening lab and interface update

- Existing 351-state suite and 48 original exam subparts still pass. New projectile suite passes 648 sampled states / 16,803 numerical checks, including exact contact, time clamping, downward launch, low speed from height, apex acceleration, complementary angles and conservation of specific mechanical energy.
- Browser exercised all 16 topics, all derivation reveals and 53 structured subparts, without page errors, TeX errors or nonfinite SVG values.
- Verified physical-time stepping, event jumps to apex/contact, parameter-change pause/reset, immutable saved parameters, four-run limit, individual removal, clearing, saved-run visibility, component/projection controls and question-value loading. Force construction uses percentage steps.
- Checked zero flight time, zero-resultant accessible direction and bounded arrow geometry for a 1 m/s downward launch from 20 m in g = 20 m/s². Later-topic diagrams remain visible on the redesigned light canvas.
- Opening lesson and practice layouts checked at 390 px without page overflow; compact diagrams have their own viewBox and aspect ratio. Desktop, comparison, hover and mobile screenshots visually inspected. Keyboard tab navigation and a retained Manim chapter seek passed. Local file opening passed stepping and local formula rendering.
- Original four Manim worked videos remain available. No external hosting or student-answer upload was added.
