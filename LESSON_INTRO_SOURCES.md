# Lesson introduction sources and scope

Checked on **16 October 2026**. `lesson-introductions-data.js` contains original English motivations, questions and learning targets for all 16 existing models. The examples are newly written teaching scenarios, not textbook extracts, summaries of textbook stories, reproduced exercises or claims that Pearson endorses this site. Source links establish the chapter progression and the distinction between first-year content, later IAL content and optional extensions.

## Primary references

| Data source ID | Primary source | Where consulted |
| --- | --- | --- |
| `pearsonBook1` | [Pearson's official Student Book 1 sample](https://www.pearson.com/content/dam/one-dot-com/one-dot-com/international-schools/pdfs/secondary-curriculum/international-a-levels/science/International-A-Level-Physics-Student-Book-sample.pdf), Miles Hudson, 2018, ISBN 9781292244877 | Course structure on printed p. iv, then the relevant sections listed below. The PDF is 109 pages; its course structure is PDF page 5. |
| `pearsonBook2` | [Pearson's official Student Book 2 sample](https://www.pearson.com/content/dam/one-dot-com/one-dot-com/international-schools/pdfs/secondary-curriculum/international-a-levels/science/International-A-Level-Physics-Student-Book-2-sample.pdf), Miles Hudson, ISBN 9781292244778 | Chapter 5A overview on printed pp. 2-3, then sections 5A.1 pp. 4-5 and 5A.2 pp. 6-8. The PDF is 23 pages; printed p. 4 is PDF page 14. |
| `ialSpecification` | [Pearson's 2018 IAL Physics specification, Issue 3, July 2021](https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Physics/2018/Specification%20and%20Sample%20Assessment/9781446957783_IAL_Physics_Iss3.pdf) | Section 1.3, printed pp. 16-17; section 1.4, printed p. 18; section 4.3, printed p. 28. Specification statements determine the scope labels. |

Both textbook samples are linked by the [publisher's IAL Science resource page](https://www.pearson.com/international-schools/british-curriculum/secondary-curriculum/International-A-Level/science.html), which identifies the first editions separately from the forthcoming 2027 editions. The [publisher's Book 2 contents](https://www.pearson.com/en-au/subject-catalog/p/pearson-edexcel-international-a-level-physics-student-book/GPROG_A101708630030_learnerau-availability) also confirms the sequence of sections 5A.1 and 5A.2. Page references below use the printed textbook numbering, not browser PDF numbering.

## Mapping to the existing lessons

The site has 15 model entries in `models.js`; `projectile.js` inserts the sixteenth. The introductions preserve those exact IDs. The table records curriculum alignment rather than attributing the new examples or prose to a textbook.

| Lesson ID | Textbook progression | Specification points | Scope |
| --- | --- | --- | --- |
| `motion` | Book 1, 1A.1-2 pp. 10-14; 1A.6 pp. 23-25 | 1.3.1-4 | Unit 1 |
| `displacement` | Book 1, 1A.1-2 pp. 10-14; 1A.6 pp. 23-25 | 1.3.1-4 | Unit 1 |
| `projectile` | Book 1, 1A.7-8 pp. 26-29 | 1.3.1, 5, 7 | Unit 1 |
| `vectors` | Book 1, 1A.3 pp. 15-16; 1A.7 pp. 26-27 | 1.3.4-6, 8 | Unit 1 |
| `newton` | Book 1, 1A.5 pp. 20-22; 2A.3-4 pp. 65-69 | 1.3.9-10; 1.4.25 | Unit 1 force balance and terminal velocity; current lesson is qualitative |
| `momentum` | Book 1, 1C.1-2 pp. 48-53 | 1.3.13-14 | Unit 1 conservation; restitution is optional |
| `momentum2d` | Book 1, 1C.2 pp. 50-53, followed by Book 2, 5A.2 pp. 6-8 | 4.3.83-84 | IAL Year 2 / Unit 4 progression |
| `impulse` | Book 1, 1C.1 pp. 48-49, followed by Book 2, 5A.2 pp. 6-8 | 4.3.81-82 | IAL Year 2 / Unit 4 progression |
| `kinetic` | Book 1, 1B.1 pp. 36-38 and 1C.1 pp. 48-49; Book 2, 5A.1 pp. 4-5 | 1.3.13, 18; 4.3.86 | Unit 1 foundation, then a Year 2 relationship |
| `moments` | Book 1, 1A.4 pp. 17-19 | 1.3.15-16 | Unit 1 |
| `beam` | Book 1, 1A.3-5 pp. 15-22 | 1.3.8-9, 15-16 | Unit 1 application |
| `work` | Book 1, 1B.2 pp. 39-41 | 1.3.17, 20 | Unit 1 |
| `energy` | Book 1, 1B.1 pp. 36-38 | 1.3.18-20 | Unit 1 |
| `efficiency` | Book 1, 1B.2 pp. 39-41; efficiency on p. 41 | 1.3.20, 22 | Unit 1 |
| `power` | Book 1, 1B.2 pp. 39-41 | 1.3.17, 21-22 | Unit 1 |
| `elastic` | Book 1, 1C.2 pp. 50-53, followed by Book 2, 5A.1 pp. 4-5 | 4.3.85 | IAL Year 2 classification; restitution is optional |

## Meaning of the extension labels

Terminal velocity is Unit 1 content. The current fifth lesson teaches qualitative force balance and graph reasoning without a drag-law calculation, exponential solution or calculus. Its internal smooth canopy-deployment trajectory is an illustrative numerical model, not a student formula requirement or a full falling-sphere viscosity experiment. The earlier linear-drag equation and exponential solution remain only in the unused baseline model; they do not describe the active fifth lesson.

Two-dimensional momentum conservation, impulse, elastic/inelastic classification and `E_k = p²/(2m)` belong to the full IAL course in Unit 4. They are later progression from these first-term foundations, not topics outside IAL. The coefficient of restitution, its slider and the relative-speed equation are additional modelling tools rather than requirements stated in these physics specification points.

The introductions retain the models' assumptions: one-dimensional constant acceleration for SUVAT; negligible external impulse for collision systems; straight-line translation at non-relativistic speeds for the energy-momentum relationship; static equilibrium for beams; a uniform beam's own weight at its midpoint; work by the selected force distinguished from net work; negligible air resistance for the ideal falling-energy and projectile models; constant speed during the modelled lift.

## Implementation contract

Load `lesson-introductions-data.js` before the script that renders the introduction. It defines `window.LESSON_INTRODUCTIONS` with keys matching every model ID and `window.LESSON_INTRO_SOURCES` with the source records above. Each lesson has one motivation paragraph, one application question, exactly three observable learning outcomes and valid `sourceIds`. All text is plain text for safe DOM rendering; it contains no HTML or executable content.
