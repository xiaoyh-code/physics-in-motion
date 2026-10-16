# Project working notes

This repository root is the former `PHYS_SHC_EXP/term1_visuals/interactive/` folder.
Read `README.md`, `TECHNICAL_GUIDE_ZH.md` and `HANDOVER_ZH.md` before maintenance.
Keep student-facing lessons primarily English; handover documents may be Chinese.

## Web UI design preference

When creating or redesigning web interfaces, use `frontend-design` together with
`typeui-fundamentals`. Read both skills and relevant TypeUI reference modules.
Preserve established project styles. Explicit project choices take precedence:
Arial for ordinary text; genuine TeX/KaTeX for mathematical expressions; black,
cyan and amber for upgraded live scenes. Preserve KaTeX mathematical fonts.

## Implementation

- Static HTML/CSS/classic JavaScript. No npm install, framework or backend required.
- Students control SVG animation through parameters and a shared timeline; do not
  replace the live models with video players.
- Keep lesson IDs stable. Model patches must load before `app.js`; visual modules
  before `lab-features.js`. Active newton/momentum models live in their dedicated
  files, not the superseded baseline entries in `models.js`.
- Preserve physics assumptions, signs, meaningful zero cases, fixed comparison
  scales, keyboard access, touch input and compact layouts.
- Check relevant models/rendering after implementation; before publication run
  `node scripts/check_site.cjs` and `node scripts/build_public_site.cjs`.
- Edit source files, not generated `dist/`. Public Pages deploys student mode.
- Browser IndexedDB uploads are local only. Bundle shared resources on disk and
  register them in `lesson-resources-data.js` for automatic deployment.
- Keep credentials, browser state, build outputs and unrelated parent files out of Git.
- Kimi collaboration is for bounded text drafts/review; it is not a website runtime
  dependency or a substitute for physics, source and browser verification.
