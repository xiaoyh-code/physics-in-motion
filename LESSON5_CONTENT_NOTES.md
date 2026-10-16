# Lesson 5 content notes — Drag & terminal velocity

Status: original teaching copy prepared from the teacher's two attached textbook screenshots. The teacher subsequently supplied the [Save My Exams terminal-velocity page](https://www.savemyexams.com/igcse/physics/edexcel/19/revision-notes/1-forces-and-motion/1-2-forces-movement-and-changing-shape/1-2-7-terminal-velocity/), inspected on 16 October 2026 for its teaching layout. Existing introductory book/specification links provide broad course context, and are not a claim that these screenshots or this new practice are official Pearson material.

## Website layout reference

The reference moves from a short definition and falling-object notes to a staged skydiver diagram, then a worked exercise, revealed answers and an exam tip. This lesson uses that readable progression with its own interactive scene and four original conceptual checks. Its paragraphs, questions, answers and pictures are not reproduced. Physics explanations were developed from the teacher's screenshots and elementary force balance, rather than treating this IGCSE layout reference as an IAL syllabus mapping.

## Learning sequence

The student observes the force arrows and the downward velocity–time graph before opening the optional explanation. Weight is downward and constant in this model. Air resistance acts upward during downward motion through still air. Increasing speed increases resistance for a fixed body/parachute configuration.

1. At release from rest, air resistance is zero and weight gives a downward resultant.
2. While air resistance is smaller than weight, the object accelerates down. As resistance grows, the downward resultant and acceleration become smaller while downward speed still increases.
3. At terminal velocity, resistance balances weight. Acceleration is zero and the velocity–time graph is horizontal at a nonzero falling speed.
4. Opening a parachute increases effective area and raises resistance at the existing speed. If resistance exceeds weight, the resultant and acceleration point upward while the person is still moving downward, so the downward speed falls. Velocity remains continuous.
5. As the person slows, resistance falls until it again balances weight. The same person with an open parachute approaches a lower terminal speed.

The optional equations only express force balance and Newton's second law: net force = weight − drag, net force = mass × acceleration, and drag = weight implies zero acceleration. No prescribed drag law, drag coefficient calculation, exponential solution, logarithm, calculus or numerical terminal-speed calculation is a learning requirement here. The scene may use an internal resistance model to make its animation continuous; that is an illustrative model rather than an equation students must memorise.

## Screenshot correction

The parachute screenshot contains an internally inconsistent sentence: it says opening causes drag to decrease, before describing drag greater than weight and upward resultant force. The new original copy states that opening increases effective area and initially increases resistance at the existing speed. Resistance decreases later, as the parachutist slows. No photographed textbook paragraph or illustration has been copied into the website.

## Important edge cases

Opening very early does not automatically produce upward resultant force: at zero speed through still air drag is zero, and the resultant may remain downward until drag grows. Therefore the displayed explanation must follow the actual force balance. The practice question explicitly opens the parachute after the first steady-speed stage, so its initial slowing description is unambiguous.

The simulation treats descent in one vertical dimension, through still air, released from rest, with constant mass and gravitational field. Buoyancy, wind, lift and ground contact are omitted. A downward-positive sign convention is used. Smooth curves approach the terminal balance progressively; a visually nearly flat segment should not be used to claim an exact finite-time equality from the underlying numerical model. The latest design uses a three-second deployment interval: the canopy grows while the person continues to fall, then stops growing when fully inflated. Its area does not grow forever, and velocity must remain continuous throughout inflation. Resistance can rise during deployment even while speed is decreasing, because the effective area is still increasing; the simpler statement that resistance falls as speed falls applies once the configuration is fixed. The displayed force comparison must use the current state rather than assuming that every instant after opening has the same force balance.

## Conceptual practice

The previous unrelated horizontal-trolley numerical exercise has been replaced by four qualitative parts totalling 10 marks: initial forces (2), decreasing acceleration and first terminal stage (3), parachute opening and graph shape (3), and final force balance (2). It is original practice, not an official past-paper question. Mark points assess explanations using force balance and graph gradient, without calculating drag.

## Files revised

Only the `newton` lesson blocks were changed in `content.js`, `opening-content.js`, and `lesson-introductions-data.js`. Other lesson content and shared rendering helpers were preserved. Mathematical content uses TeX strings; body prose uses the site's established Arial styling.

## Planned parameter language

The sidebar uses mass, body posture, canopy size, opening time and whether the parachute deploys. Body posture is described as tucked, relaxed or spread; canopy sizes are small, medium or large. These comparisons invite observation of relative forces and graph shapes. They do not introduce a drag coefficient students must calculate. A no-deployment run retains the body-only configuration; the lower open-canopy terminal stage should only be described for runs that actually deploy.
