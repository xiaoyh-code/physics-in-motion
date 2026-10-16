/* Original lesson motivations and targets. Sources establish textbook progression
   and syllabus scope; no textbook prose, questions or illustrations are copied.
   Detailed chapter/page mapping: LESSON_INTRO_SOURCES.md. */
(function () {
  'use strict';

  window.LESSON_INTRO_SOURCES = {
    pearsonBook1: {
      title: 'Pearson Edexcel IAL Physics Student Book 1 - official sample',
      url: 'https://www.pearson.com/content/dam/one-dot-com/one-dot-com/international-schools/pdfs/secondary-curriculum/international-a-levels/science/International-A-Level-Physics-Student-Book-sample.pdf'
    },
    pearsonBook2: {
      title: 'Pearson Edexcel IAL Physics Student Book 2 - official sample',
      url: 'https://www.pearson.com/content/dam/one-dot-com/one-dot-com/international-schools/pdfs/secondary-curriculum/international-a-levels/science/International-A-Level-Physics-Student-Book-2-sample.pdf'
    },
    ialSpecification: {
      title: 'Pearson Edexcel IAL Physics - 2018 specification, Issue 3',
      url: 'https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Physics/2018/Specification%20and%20Sample%20Assessment/9781446957783_IAL_Physics_Iss3.pdf'
    }
  };

  window.LESSON_INTRODUCTIONS = {
    motion: {
      why: 'To make a robot stop at the edge of a platform, its current speed is only the beginning. A velocity-time graph shows how velocity changes and its signed area gives displacement, linking acceleration and displacement to the constant-acceleration equations used in IAL mechanics.',
      question: 'Can two robots reach the same final velocity but travel different distances getting there?',
      outcomes: [
        'Read acceleration from the gradient of a velocity-time graph.',
        'Use signed graph area to determine displacement.',
        String.raw`Build \(v=u+at\) and \(s=ut+\tfrac12at^2\) for constant acceleration.`
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    displacement: {
      why: 'A delivery robot may travel several metres yet finish beside its starting point. Distance travelled tells you about travel and wear; displacement tells you where it ends up. Tracking a reversal shows why sign consistency matters when you choose a SUVAT equation with constant acceleration.',
      question: 'If a robot brakes, stops and rolls backwards, is its displacement the distance its wheels have covered?',
      outcomes: [
        'Distinguish signed displacement from total distance travelled.',
        'Locate a turn by finding when velocity changes sign.',
        'Select and use a constant-acceleration equation with consistent signs.'
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    projectile: {
      why: 'A parcel leaving a conveyor keeps moving sideways while it falls. To position the receiving tray, an engineer needs both motions at once. Resolving the launch velocity lets you use a common flight time to connect horizontal travel with vertical acceleration. This brings together the vectors and kinematics studied earlier in IAL mechanics.',
      question: 'Does moving sideways require a horizontal force when air resistance is absent?',
      outcomes: [
        'Resolve launch velocity into horizontal and vertical components.',
        'Use the same elapsed time for both independent motions.',
        'Predict flight time and landing position when air resistance is neglected.'
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    vectors: {
      why: 'A force arrow tells us how strong a push or pull is and which way it acts. Begin with familiar horizontal and vertical axes: right and up are positive, while left and down are negative. Split each force into those two directions, then do one signed calculation on each axis. The two totals describe a single resultant force. This gives a foundation for equilibrium and later mechanics.',
      question: 'Drag one force tip left, then up. What changes in its horizontal and vertical components? When you drag the resultant instead, why must one original force stay fixed?',
      outcomes: [
        'Read force arrows using ordinary x/y axes and positive or negative components.',
        'Split each force into horizontal and vertical parts, then add each axis separately.',
        'Find the resultant magnitude and direction, or find one original force when the other is fixed.'
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    newton: {
      why: 'A parachutist can be falling quickly even when the force arrows balance. Watching the arrows and the velocity–time curve together separates motion from acceleration. Start by observing how resistance grows with speed, then open the parachute to see why a larger area can produce a lower steady falling speed.',
      question: 'When a parachute opens, does the upward resultant make the parachutist move upward, or slow their downward motion?',
      outcomes: [
        'Compare weight and drag to explain speeding up, slowing down and steady descent.',
        'Explain terminal velocity as balanced forces with nonzero falling speed.',
        'Read the effect of parachute opening from force arrows and a velocity–time graph, without a drag-force calculation.'
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    momentum: {
      why: 'Two cars can lock together and leave the collision moving more slowly, in the opposite direction, or at rest. Mass and signed velocity explain which outcome occurs. Treating the pair as one system lets us predict their shared motion without calculating the rapidly changing contact force. This builds the momentum-conservation reasoning used in IAL mechanics.',
      question: 'If the approaching cars have equal and opposite momenta and stick together, what will you see after contact?',
      outcomes: [
        'Observe how changing either mass or initial velocity changes a sticking collision.',
        'Use a common right-positive direction to compare the signed momenta before and after contact.',
        String.raw`Derive \(m_1u_1+m_2u_2=m_1v_1+m_2v_2\), then predict the common velocity when the cars stick.`
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    momentum2d: {
      why: 'When objects meet from different directions, adding their speeds cannot predict the direction of the combined motion. Momentum must be accounted for along two axes. This lesson extends the one-dimensional model to a sticking collision and introduces IAL Year 2 mechanics, where vector components connect the approach paths to the final velocity.',
      question: 'Which way will two objects move after they approach at right angles and stick together?',
      outcomes: [
        'Resolve the initial momenta along two perpendicular axes.',
        'Conserve each component when external impulse is negligible.',
        'Find the combined object’s final speed and direction.'
      ],
      sourceIds: ['pearsonBook1', 'pearsonBook2', 'ialSpecification']
    },
    impulse: {
      why: 'A protective foam insert changes how long a dropped device takes to stop. Even if the device’s momentum change is the same, spreading it over more time changes the average force. Building on Newton’s laws and momentum, this IAL Year 2 topic turns the area under a force-time graph into a useful measure of an impact.',
      question: 'Why can a thicker foam insert reduce the average force while stopping the same device?',
      outcomes: [
        'Calculate impulse from the signed change in momentum.',
        'Read impulse as the area under a force-time graph.',
        'Predict how contact duration changes the average resultant force.'
      ],
      sourceIds: ['pearsonBook1', 'pearsonBook2', 'ialSpecification']
    },
    kinetic: {
      why: 'A moving inspection robot carries both momentum and kinetic energy, but these describe different aspects of its motion. Reversing its direction changes one while leaving the other’s value unchanged at the same speed. Comparing their dependence on mass and velocity prepares you for collision analysis and the IAL Year 2 relationship between energy and momentum.',
      question: 'If a robot reverses direction at the same speed, what happens to its momentum and kinetic energy?',
      outcomes: [
        'Compare the velocity dependence of momentum and kinetic energy.',
        'Explain why negative momentum can accompany positive kinetic energy.',
        'Derive E_k = p²/(2m), an IAL Year 2 result for non-relativistic motion.'
      ],
      sourceIds: ['pearsonBook1', 'pearsonBook2', 'ialSpecification']
    },
    moments: {
      why: 'A door is easier to turn when you push farther from its hinges. Force alone cannot describe that turning effect: the perpendicular distance from the pivot matters too. Moments let you predict whether a lever balances and determine an unknown load. They also prepare you to analyse structures that must resist both sliding and rotation.',
      question: 'How could a smaller force balance a larger force on opposite sides of a pivot?',
      outcomes: [
        'Calculate a moment using the perpendicular distance to the pivot.',
        'Compare clockwise and anticlockwise turning effects.',
        'Apply both force balance and moment balance for static equilibrium.'
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    beam: {
      why: 'Moving a heavy display along a shelf changes how much load each bracket carries, even though the total weight stays the same. Treating the shelf as a beam turns an everyday design problem into force and moment equations. You can then predict the support reactions and include the beam’s own weight at its centre if it is uniform.',
      question: 'Which bracket carries more load when a display is moved towards one end of a shelf?',
      outcomes: [
        'Draw the load, beam weight and support reactions.',
        'Choose a pivot that removes an unknown reaction from the moment equation.',
        'Calculate both reactions and check their sum against the total weight.'
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    work: {
      why: 'Pulling a wheeled suitcase at a steeper angle changes how much of your force acts along its path. Work quantifies the energy transferred by that component during a displacement. This gives you a bridge from force diagrams to energy calculations, including cases where a force transfers energy away from an object or does no work.',
      question: 'For the same pull and horizontal displacement, how does changing the handle angle change the work done?',
      outcomes: [
        'Identify the force component along a displacement.',
        'Calculate signed work using W = Fs cos θ for a constant force.',
        'Distinguish work by one force from net work and kinetic-energy change.'
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    energy: {
      why: 'An inspection camera falling down a shaft speeds up as it loses height. Following its energy provides another way to predict the speed, without first calculating the fall time. This lesson connects gravitational potential and kinetic energy, then makes the assumptions visible: a fixed gravitational field and negligible air resistance keep the model’s mechanical energy constant.',
      question: 'Could two cameras of different masses reach the same speed after falling through the same height?',
      outcomes: [
        'Calculate changes in gravitational potential and kinetic energy.',
        'Use energy conservation to predict a fall speed.',
        'Explain how air resistance would alter the mechanical-energy account.'
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    efficiency: {
      why: 'Two battery-powered pumps can receive the same energy yet deliver different useful outputs. To compare them, you must first define what counts as useful, then account for the remaining transfers. Efficiency turns that energy budget into a ratio. It helps connect conservation of energy with practical choices about machines, while keeping dissipated energy in the account.',
      question: 'If two pumps take the same input energy, how can one deliver more useful output?',
      outcomes: [
        'Identify the useful output for a stated purpose.',
        'Calculate efficiency using energy or power over the same interval.',
        'Account for dissipated energy without treating it as destroyed.'
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    power: {
      why: 'Two hoists can raise the same load to the same height yet finish at different times. Their energy transfers can be equal while their powers differ. Combining work with time lets you specify a motor’s required mechanical output and connect it to force and speed. The constant-speed model makes clear which starting and stopping effects are excluded.',
      question: 'What changes in the required mechanical power if a hoist must lift the same load twice as quickly?',
      outcomes: [
        'Calculate mechanical power from work done per unit time.',
        'Relate lifting power to weight and vertical speed.',
        'Distinguish mechanical output power from a motor’s input power.'
      ],
      sourceIds: ['pearsonBook1', 'ialSpecification']
    },
    elastic: {
      why: 'A cart that rebounds can leave a very different energy budget from one that sticks to its partner. Momentum conservation alone does not tell you which kind of collision occurred. Comparing total kinetic energy before and after introduces the elastic and inelastic distinction developed in IAL Year 2. The restitution slider is an optional modelling extension.',
      question: 'Can two collisions conserve momentum equally well but leave different amounts of kinetic energy?',
      outcomes: [
        'Check total momentum for a system with negligible external impulse.',
        'Classify a collision by comparing total kinetic energy before and after.',
        'Explore restitution as an optional parameter for the rebound model.'
      ],
      sourceIds: ['pearsonBook1', 'pearsonBook2', 'ialSpecification']
    }
  };
})();
