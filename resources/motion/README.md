# Lesson 1 - Velocity and Time

An original 20-mark sample worksheet for the **Pearson Edexcel International A Level Physics, WPH11, 2018 specification**. This is a bridge resource for the first interactive lesson, not a complete Unit 1 course or an official Pearson question paper.

## Files

| Resource | Pages | Contents |
| --- | --- | --- |
| `Lesson_01_Velocity_Time_QP.pdf` | 3 | 4 MCQ marks, 4 fill-in marks and 12 structured marks, with answer grids and calculation space. |
| `Lesson_01_Velocity_Time_MS.pdf` | 2 | Matching answers, explicit marking points, worked reversal reasoning and a practical interpretation. |
| `Lesson_01_Velocity_Time_QP.typ` | Source | Editable question paper, using the skill's locked A4 school page standard. |
| `Lesson_01_Velocity_Time_MS.typ` | Source | Editable matching marking scheme. |
| `worksheet-page-01.png` to `worksheet-page-03.png` | 3 | Full-page PNG previews of the question paper. |
| `answers-page-01.png` to `answers-page-02.png` | 2 | Full-page PNG previews of the marking scheme. |
| `Insert/` | Empty | Reserved for images added by the teacher. |

The sample uses no supplied or generated diagrams. Students may draw their own velocity-time sketch in their working for Question 5(a)(ii). Every question can be answered using the information already present; there is no missing figure dependency.

## Scope and official references

Checked on **16 October 2026** against primary Pearson material:

- [Pearson Edexcel IAL Physics 2018 qualification page](https://qualifications.pearson.com/en/qualifications/edexcel-international-advanced-levels/physics-2018.html).
- [IAL Physics specification, Issue 3, July 2021](https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Physics/2018/Specification%20and%20Sample%20Assessment/9781446957783_IAL_Physics_Iss3.pdf): section 1.3, printed page 16, points 1-4, for constant-acceleration equations, motion graphs and scalar/vector distinctions; Appendix 10, printed pages 75-81, for practical uncertainty. The numerical acceptable-gradient exercise is explicitly scaffolded and identified as an extension; it does not imply Pearson requires error bars on all graphs.
- [Pearson IAL Physics 2027 qualification page](https://qualifications.pearson.com/en/qualifications/edexcel-international-advanced-levels/physics-2027.html): the replacement specification starts teaching in September 2027. This sample deliberately identifies the current 2018 specification.

The original questions cover acceleration as velocity-time gradient, signed area as displacement, speed during reversal, the constant-acceleration assumption, derivations of `v = u + at` and `s = ut + 1/2 at^2`, displacement versus distance, and a supplied half-gradient-range uncertainty calculation.

## Authoring and verification

Created using the `create-typst-test-paper` skill's mixed question format and templates. The QP page setup remains unchanged: A4, 18 mm top/side margins, 22 mm bottom margin, bottom-left page count and bottom-right bilingual class/student fields. `Insert/` is empty and the QP contains no image calls.

Direct edits to the two `.typ` sources are the normal revision route. Compile from this directory with:

```sh
typst compile Lesson_01_Velocity_Time_QP.typ Lesson_01_Velocity_Time_QP.pdf
typst compile Lesson_01_Velocity_Time_MS.typ Lesson_01_Velocity_Time_MS.pdf
```

`source/author_sample.py` records the original authored content and preserves the template helpers. It rewrites the content of the two existing `.typ` files; direct source edits should not be overwritten by rerunning it.

Verification completed: the skill's `check_qp_policy.py` passed; Typst 0.14.2 compiled both files; all five pages were rendered with Poppler and visually inspected. The paper totals were independently checked as `4 + 4 + 7 + 5 = 20`. Numerical checks: displacement in Q5 is 20 m; the Q6 turn is at 2.0 s, displacement is +12 m and distance is 20 m; absolute acceleration uncertainty is 0.08 m s^-2 and percentage uncertainty is 10%.
