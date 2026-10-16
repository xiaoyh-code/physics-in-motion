# Content provenance and scope

All derivations, concept checks, contextual questions, model answers and marking points in `content.js` are newly authored for this school resource. They use Pearson Edexcel International A Level-style structured prompts and explicit marks, but they are not official Pearson assessment material, have not been endorsed by Pearson, and do not constitute complete IAL syllabus coverage. Coverage follows the selected first-term mechanics topics. The elastic-collision topic covers conservation of momentum and kinetic energy, relative velocities and the equal-mass result.

Official reference consulted: [Pearson Edexcel International Advanced Level Physics sample assessment materials, first teaching September 2018](https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Physics/2018/Specification%20and%20Sample%20Assessment/International-AL-Physics-SAMs.pdf). The general guidance and Unit 1 question-paper format informed the use of context, separate subparts, explicit mark totals, calculation working and units. No official question wording, numerical scenario or mark scheme has been copied. The concept checks are learning checks with three choices, not replicas of the four-choice Section A paper format.

## Conventions

- SI units unless explicitly stated. Gravitational acceleration is 9.81 m s⁻² wherever required.
- Positive and negative velocities are handled consistently. Impulse may be negative; requested force magnitude is positive.
- Constant-acceleration formulae require constant acceleration. Momentum conservation requires negligible external impulse.
- Collisions that stick conserve momentum but generally reduce kinetic energy.
- Beam weight acts at the centre only for a uniform beam. Force balance and moment balance are both required.
- Work refers to the component of force along displacement. The work–energy theorem uses net work.
- Efficiency is useful output divided by total input for the same interval; the percentage is 100 times this ratio.
- Perfectly elastic collisions conserve kinetic energy as well as momentum. The relative-velocity result assumes a nontrivial one-dimensional collision.
- Numerical-answer fields store unrounded values where helpful. A numerical check is formative and cannot award full exam marks for method, explanation, units or significant figures; students should compare their written solution with the marking points.

## Validation

There are 15 topics, 15 concept checks, 15 derivations with at least three steps each, and 48 original structured exam subparts. The JavaScript was parsed using Node. Numeric targets were recomputed from the stated data, including signed impulse, the two-component collision, support reactions, energy dissipation and graph-based uncertainty estimates. Derivations distinguish defining relationships from consequences and state their modelling assumptions.

## Additional derivation and practical coverage

The displacement lesson explicitly eliminates time to derive v² = u² + 2as and contrasts signed displacement with distance. The drag lesson now teaches qualitative force balance, a smoothly opening parachute and graph interpretation. It requires no drag-law calculation, exponential solution or calculus. Elementary force-balance TeX is optional. The kinetic-energy lesson derives E_k = p²/(2m). The motion practical uses half the range of acceptable velocity–time gradients for an uncertainty estimate (8.0%). The energy practical uses a v²–height graph to infer g = (9.7 ± 0.3) m s⁻² and compare the interval with 9.81 m s⁻². Every subpart has one marking point per allocated mark; the current whole site has 55 structured subparts.


## Lesson 6 live collision revision

The one-dimensional collision now starts with observation of two SVG cars. Its optional signed-momentum bars and TeX derivation connect equal and opposite impulse changes to total momentum conservation, then obtain the common velocity for sticking. Both initial velocities may be positive, negative or zero; no contact is invented for an opening or constant gap, or one that closes after the six-second run. Contact time is computed from the 8 m initial gap. The default practice uses two 2 kg cars at +4 m/s and rest, with three parts worth 8 marks. The correct common velocity is +2 m/s and the momentum changes are −4 and +4 kg m/s. Perfectly elastic rebound is an optional visual comparison. Lesson 16's separate elastic-collision derivation remains unchanged. See `LESSON6_CONTENT_NOTES.md` and `LESSON6_VERIFICATION.md`.
