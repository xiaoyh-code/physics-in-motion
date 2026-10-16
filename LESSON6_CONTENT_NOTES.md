# Lesson 6 content notes — One-dimensional collision

The copy, investigation and assessment are original teaching material. Existing Pearson book and specification links give broad IAL mechanics context; no new exact specification point, textbook paragraph, diagram or official examination question is claimed here. The lesson starts with observable motion, then reveals the optional mathematical explanation.

## Teaching sequence

1. Watch two cars move along one horizontal track, meet and either stick or bounce according to the selected collision behaviour. The main teaching case is sticking.
2. Change one mass or initial velocity and compare the motion at the same point in the timeline. Right is positive for both cars. Mass is positive; velocity and momentum can be negative or zero.
3. Reveal momentum as mass multiplied by signed velocity. Car A uses subscript 1 and car B uses subscript 2. Two left/right velocities are signed values on one axis; no i/j notation is introduced.
4. Equal and opposite contact forces act over the same interval, giving equal and opposite impulses. Each impulse equals that car's change in momentum. The two changes therefore cancel when external impulse is negligible.
5. Rearranging gives conservation of total momentum. In a sticking collision the two final velocities are equal, so the initial total momentum divided by combined mass gives the common final velocity.

The main equation is \(m_1u_1+m_2u_2=m_1v_1+m_2v_2\). For sticking, \(v_1=v_2=v\), hence \(v=(m_1u_1+m_2u_2)/(m_1+m_2)\). Individual momentum is generally not conserved. Momentum conservation does not imply conservation of kinetic energy. Deformation, sound and thermal stores can receive energy during a sticking collision.

## Model boundaries and edge cases

The isolated horizontal two-car model has constant masses and negligible external impulse during contact. Impact is idealised as instantaneous: position remains continuous while velocity can change at the collision time. A physical contact force history or finite deformation is not inferred from the visual transition.

The cars start separated. The left car must approach the right car to meet. Equal velocities, a separating pair, or an approach that is too slow to meet within the displayed interval must not show a fabricated collision. A predicted post-collision result belongs to a later collision and must not be presented as the current observed velocity before contact. Opposite signed momenta can cancel completely, leaving the joined cars stationary after contact.

A bounce comparison is optional. Conservation of momentum still applies, but it is insufficient by itself to determine two different final velocities; an additional collision rule is needed. Restitution derivation remains outside this lesson's core explanation, and lesson 16's elastic-collision content is unchanged.

## Assessment linked to the live default

The original three-part question now uses the live-compatible default: car A has mass \(2.0\,\mathrm{kg}\) and initial velocity \(+4.0\,\mathrm{m\,s^{-1}}\); car B has mass \(2.0\,\mathrm{kg}\) and is initially stationary. They stick together. The common final velocity is \(+2.0\,\mathrm{m\,s^{-1}}\). A's momentum change is \(-4.0\,\mathrm{kg\,m\,s^{-1}}\), while B's is \(+4.0\,\mathrm{kg\,m\,s^{-1}}\). Total initial and final momentum are each \(+8.0\,\mathrm{kg\,m\,s^{-1}}\).

The three parts retain the previous total of 8 marks: common velocity (3), both signed momentum changes and cancellation (3), and negligible external frictional impulse during the short contact interval (2). Part (a) provides a numerical check for the value 2; its worked answer and mark scheme also require the correct units and rightward direction. Parts (b) and (c) use written self-assessment. There is no restitution calculation or kinetic-energy calculation in this question.

## Files and presentation

Only the `momentum` entries in `content.js`, `opening-content.js` and `lesson-introductions-data.js` were revised. Other lesson copy was preserved. Equations and mathematical quantities use TeX delimiters for the site's local KaTeX renderer. Ordinary text inherits the established Arial typography. The shared lesson controller is responsible for keeping calculations hidden until the student opens the explanation.
