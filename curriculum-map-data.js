/* Curriculum audit of the teacher-supplied annual plan, not a record of completed
   teaching or a claim of full IAL unit coverage. Word prose (w:t) AND maths (m:t)
   were read from the source DOCX. All judgements below are original analysis. */
(function () {
  'use strict';

  const specUrl = 'https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Physics/2018/Specification%20and%20Sample%20Assessment/9781446957783_IAL_Physics_Iss3.pdf';
  const ref = (unit, points, topic, printedPage) => ({
    unit, points, topic, printedPage,
    sourceId: 'ialSpecification',
    url: specUrl + '#page=' + (printedPage + 4)
  });
  const evidence = (section, quote) => ({ sourceId: 'schoolPlan', section, quote });

  window.CURRICULUM_MAP = {
    canvaEditUrl: 'https://www.canva.com/design/DAHYIehZXmU/tKVgk-ogkVpFgoVBDRhQ5Q/edit',
    title: '2026/27 Physics: School Plan to Edexcel IAL',
    schoolYear: '2026/27',
    checkedDate: '2026-10-16',
    qualification: 'Pearson Edexcel International Advanced Level Physics',
    specification: '2018 specification, Issue 3 (July 2021)',
    introduction: 'This annual course develops mechanics, energy, waves and thermal physics, with selected objectives already reaching IAL Year 2. The map shows where the written school plan aligns with specific IAL topics and which requirements need additional teaching or clearer evidence.',
    caveat: 'These are judgements about planned objectives, not completed teaching, assessment results or full IAL unit coverage. A matching topic title alone does not establish IAL depth, mathematical fluency or practical competence.',
    siteScope: 'The current 16 interactive lessons develop mechanics and energy. Later annual-plan blocks shown here are course destinations, not claims that their interactive lessons are already available.',
    extractionNote: 'Both ordinary Word text and Office Math runs were read in document order. The downloadable original is the authoritative school document. The map normalises topic names for comparison; it does not silently repair or replace the source document’s equations.',
    sources: {
      schoolPlan: {
        title: 'Original 2026/27 Physics Annual Teaching Plan',
        originalFilename: '2627_PHY_Annual_Teaching_Plan_0828_F4BC.docx',
        url: 'resources/curriculum/2026-2027_Physics_Annual_Teaching_Plan.docx',
        pdfUrl: 'resources/curriculum/2026-2027_Physics_Annual_Teaching_Plan.pdf',
        description: 'Teacher-supplied document; evidence quotations refer to its teaching schedule and content headings.'
      },
      ialSpecification: {
        title: 'Pearson Edexcel IAL Physics 2018 specification, Issue 3',
        url: specUrl,
        description: 'Official specification statements are the basis for the topic references. Printed page numbers are used.'
      }
    },
    classifications: {
      substantial: {
        label: 'Substantial topic match',
        description: 'The plan explicitly includes the main ideas or equations of the identified IAL topic. This is not a claim that the whole unit or every assessment skill is covered.'
      },
      partial: {
        label: 'Partial match',
        description: 'Some relevant objectives are explicit, but the IAL treatment needs further concepts, mathematical development or evidence of the stated method.'
      },
      extra: {
        label: 'Additional foundation',
        description: 'Useful school-course content or background, without a direct match to the named IAL requirement at the depth stated in the plan.'
      },
      not_listed: {
        label: 'Not listed in plan',
        description: 'The annual plan does not explicitly state this IAL requirement. This records an evidence gap, not proof that it will never be taught.'
      }
    },

    // Seven concise rows intended for an editable one-page annual-plan summary.
    summaryRows: [
      {
        id: 'mechanics', weeks: '1-10',
        schoolFocus: 'Motion, forces, momentum and moments',
        ialLink: 'Selected Unit 1 mechanics + Unit 4 momentum',
        classification: 'substantial',
        judgement: 'Substantial topic match',
        nextStep: 'Make graph skills and projectile coverage explicit.'
      },
      {
        id: 'energy', weeks: '11-17',
        schoolFocus: 'Energy, work, power and resources',
        ialLink: 'Unit 1 energy and efficiency',
        classification: 'substantial',
        judgement: 'Substantial topic match',
        nextStep: 'Develop angled-force work and quantitative applications.'
      },
      {
        id: 'waves', weeks: '21-26',
        schoolFocus: 'Waves, light, sound and Doppler effect',
        ialLink: 'Selected Unit 2 waves + Unit 5 Doppler',
        classification: 'partial',
        judgement: 'Partial match',
        nextStep: 'Add interference, diffraction, polarisation and quantum physics.'
      },
      {
        id: 'density', weeks: '27-31',
        schoolFocus: 'Density, pressure and hydrostatics',
        ialLink: 'Unit 1 density; pressure is additional foundation',
        classification: 'partial',
        judgement: 'Partial match',
        nextStep: 'Add upthrust, viscosity and solid-material mechanics.'
      },
      {
        id: 'thermal-transfer', weeks: '31-36',
        schoolFocus: 'Conduction, convection and radiation',
        ialLink: 'Foundation for thermal and radiation study',
        classification: 'extra',
        judgement: 'Additional foundation',
        nextStep: 'Do not equate this with Unit 5 thermodynamics.'
      },
      {
        id: 'thermal-gases', weeks: '36-42',
        schoolFocus: 'Heat, internal energy and ideal gases',
        ialLink: 'Unit 5 thermodynamics: 125, 128-130, 132',
        classification: 'substantial',
        judgement: 'Substantial topic match',
        nextStep: 'Verify derivations and specified practical methods.'
      },
      {
        id: 'practical-assessment', weeks: 'Across year; 43-44',
        schoolFocus: 'Practical work, review and examination',
        ialLink: 'Units 3 and 6 practical skills need explicit evidence',
        classification: 'partial',
        judgement: 'Partial match',
        nextStep: 'Teach planning, graphs, uncertainty and evaluation throughout.'
      }
    ],
    summaryGapNote: 'Further teaching is needed for Unit 1 materials, Unit 2 circuits and advanced wave/quantum topics, the remaining Unit 4 and Unit 5 topics, and Units 3/6 practical methods. No complete IAL unit is certified by this map.',

    detailedRows: [
      {
        id: 'motion-forces', weeks: '1-10',
        schoolFocus: 'Motion and force resolution',
        classification: 'partial',
        matches: [
          ref('Unit 1', '1.3.1', 'Constant-acceleration equations', 16),
          ref('Unit 1', '1.3.5-6, 8-9', 'Vectors, force diagrams and Newton’s second law', 16)
        ],
        evidence: [
          evidence('Force and Motion / Motion', 'be able to use the equations for uniformly accelerated motion in one dimension'),
          evidence('Force and Motion / Force resolution', 'be able to resolve a vector into two components at right angles to each other by drawing and by calculation'),
          evidence('Force and Motion / Force resolution', 'Use of the term ‘terminal velocity’ is expected.')
        ],
        scopeNote: 'The written plan gives direct equation and force objectives. Motion-graph interpretation, explicit scalar/vector definitions, projectile independence and Newton’s third-law pairs need clearer specification.',
        nextStep: 'Add displacement-, velocity- and acceleration-time graphs, signed area, consistent signs, projectile components and force-pair reasoning.',
        siteLessonIds: ['motion', 'displacement', 'projectile', 'vectors', 'newton']
      },
      {
        id: 'momentum-collisions', weeks: '1-10',
        schoolFocus: 'Momentum, impulse and collisions',
        classification: 'substantial',
        matches: [
          ref('Unit 1', '1.3.13-14', 'Momentum and one-dimensional conservation', 16),
          ref('Unit 4', '4.3.81, 83, 85-86', 'Impulse, two-dimensional collisions and collision energy', 28)
        ],
        evidence: [
          evidence('Force and Motion / Chapter 4: Momentum', 'understand how to apply conservation of linear momentum to problems in two dimensions'),
          evidence('Force and Motion / Chapter 4: Momentum', 'understand how to determine whether a collision is elastic or inelastic'),
          evidence('Force and Motion / Chapter 4: Momentum', 'for the kinetic energy of a non-relativistic particle')
        ],
        scopeNote: 'This block explicitly reaches selected Year 2 objectives; it is not merely an introductory momentum survey. The presence of these topics does not establish coverage of the rest of Unit 4.',
        nextStep: 'Require component diagrams, signed impulse, conservation conditions, energy comparisons and the energy-momentum derivation. Treat restitution as optional.',
        siteLessonIds: ['momentum', 'momentum2d', 'impulse', 'kinetic', 'elastic']
      },
      {
        id: 'moments-beams', weeks: '1-10',
        schoolFocus: 'Turning effects, centre of gravity and supported beams',
        classification: 'substantial',
        matches: [ref('Unit 1', '1.3.15-16', 'Moments and equilibrium of an extended body', 17)],
        evidence: [
          evidence('Force and Motion / Chapter 5: The turning effect of forces', 'use the principle of moments for a simple system of parallel forces acting in one plane'),
          evidence('Force and Motion / Chapter 5: The turning effect of forces', 'understand how the upward forces on a light beam, supported at its ends, vary with the position of a heavy object placed on the beam')
        ],
        scopeNote: 'The plan explicitly includes both turning effects and changing support reactions. Distinguish a light beam from a uniform beam with significant self-weight.',
        nextStep: 'Use free-body diagrams and apply both force balance and moment balance, choosing a useful pivot.',
        siteLessonIds: ['moments', 'beam']
      },
      {
        id: 'energy-work-power', weeks: '11-17',
        schoolFocus: 'Energy transfer, work, power and efficiency',
        classification: 'substantial',
        matches: [ref('Unit 1', '1.3.17-22', 'Work, energy conservation, power and efficiency', 17)],
        evidence: [
          evidence('Energy Resources and Energy Transfer / Chapter 14: Energy transfer', 'use the principle of conservation of energy'),
          evidence('Energy Resources and Energy Transfer / Chapter 16: Work and power', 'understand how conservation of energy produces a link between gravitational potential energy, kinetic energy and work'),
          evidence('Energy Resources and Energy Transfer / Chapter 16: Work and power', 'describe power as the rate of transfer of energy or the rate of doing work')
        ],
        scopeNote: 'The explicit equations and energy accounts give a substantial match to these selected Unit 1 topics. Work for a force at an angle needs development beyond the stated parallel-force formula.',
        nextStep: 'Add angled-force work, net-work reasoning, multi-stage quantitative problems and a clear input denominator for efficiency.',
        siteLessonIds: ['work', 'energy', 'efficiency', 'power']
      },
      {
        id: 'energy-resources', weeks: '11-17',
        schoolFocus: 'Energy resources and electricity generation',
        classification: 'extra',
        matches: [],
        evidence: [evidence('Energy Resources and Energy Transfer / Chapter 17: Energy resources and electricity generation', 'describe the advantages and disadvantages of methods of large-scale electricity production from various renewable and non-renewable resources')],
        relatedRefs: [
          ref('Unit 4', '4.4.105-110', 'Quantitative electromagnetic induction', 30),
          ref('Unit 5', '5.4.133-136', 'Nuclear energetics and fusion/fission', 34)
        ],
        scopeNote: 'A qualitative resource survey supports context, but does not establish the induction or nuclear-physics requirements referenced here.',
        nextStep: 'Keep the resource comparison as application context; teach the required field, induction and nuclear models separately.',
        siteLessonIds: []
      },
      {
        id: 'wave-basics-sound', weeks: '21-26',
        schoolFocus: 'Wave quantities, wave types and sound',
        classification: 'partial',
        matches: [ref('Unit 2', '2.3.33-36, 55', 'Wave quantities, transverse/longitudinal motion and interfaces', 20)],
        relatedRefs: [ref('Unit 2', '2.3.37-44', 'Wave graphs, superposition, stationary waves and intensity', 20)],
        evidence: [
          evidence('Waves / Chapter 10: Properties of waves', 'explain the difference between longitudinal and transverse waves'),
          evidence('Waves / Chapter 13: Sound', 'investigate the speed of sound in air'),
          evidence('Waves / Chapter 13: Sound', 'understand how an oscilloscope and microphone can be used to display a sound wave')
        ],
        scopeNote: 'Wave definitions and basic relationships are explicit. The plan does not specify the full IAL treatment of wave graphs, phase, superposition, stationary waves, intensity or a vibrating-string investigation.',
        nextStep: 'Develop spatial/time graph reasoning, phase and path difference, interference, stationary waves and the prescribed sound-measurement technique.',
        siteLessonIds: []
      },
      {
        id: 'em-spectrum', weeks: '21-26',
        schoolFocus: 'Electromagnetic spectrum, uses and hazards',
        classification: 'extra',
        matches: [],
        relatedRefs: [ref('Unit 2', '2.3.57-63', 'Photon and quantum models', 21)],
        evidence: [evidence('Waves / Chapter 11: The electromagnetic spectrum', 'know the order of the electromagnetic spectrum in terms of decreasing wavelength and increasing frequency')],
        scopeNote: 'The spectrum survey is useful foundation. Naming bands, applications and hazards is not evidence of the IAL photon model, photoelectric equation or discrete atomic spectra.',
        nextStep: 'Add photon energy, threshold/work-function reasoning, photoelectric evidence and atomic transitions.',
        siteLessonIds: []
      },
      {
        id: 'refraction-tir', weeks: '21-26',
        schoolFocus: 'Reflection, refraction and total internal reflection',
        classification: 'substantial',
        matches: [ref('Unit 2', '2.3.45-48, 55', 'Refraction, critical angle and total internal reflection', 20)],
        evidence: [
          evidence('Waves / Chapter 12: Light waves', 'investigate the refractive index of glass, using a glass block (practical)'),
          evidence('Waves / Chapter 12: Light waves', 'describe the role of total internal reflection in transmitting information along optical fibres and in prisms')
        ],
        scopeNote: 'These optics topics are directly named, including measurement of refractive index. The general two-medium relation and n = c/v need explicit attention beyond the written air-to-material form.',
        nextStep: 'Use n₁ sin θ₁ = n₂ sin θ₂, link refractive index to wave speed and justify when total internal reflection is possible.',
        siteLessonIds: []
      },
      {
        id: 'doppler', weeks: '21-26',
        schoolFocus: 'Qualitative Doppler effect',
        classification: 'substantial',
        matches: [ref('Unit 5', '5.6.169', 'Relative motion and an observed frequency shift', 36)],
        evidence: [evidence('Waves / Chapter 10: Properties of waves', 'when its source is moving relative to an observer and that this is known as the Doppler effect')],
        scopeNote: 'The qualitative Doppler objective is a direct Year 2 link. It does not establish cosmological redshift calculations, Hubble’s law or broader astrophysics.',
        nextStep: 'If progressing to the rest of Unit 5, add electromagnetic redshift and cosmological applications separately.',
        siteLessonIds: []
      },
      {
        id: 'density', weeks: '27-31',
        schoolFocus: 'Density and its measurement',
        classification: 'substantial',
        matches: [ref('Unit 1', '1.4.23', 'Density', 18)],
        evidence: [evidence('Solids, Liquids and Gases / Chapter 18: density and pressure', 'investigate density using direct measurements of mass and volume (practical)')],
        scopeNote: 'The density objective is explicit. One matched quantity does not establish the rest of the Unit 1 materials section.',
        nextStep: 'Develop uncertainty in mass/volume measurements and then teach upthrust, fluid drag and solid-material behaviour.',
        siteLessonIds: []
      },
      {
        id: 'pressure-hydrostatics', weeks: '27-31',
        schoolFocus: 'Pressure, force/area and hydrostatic pressure',
        classification: 'extra',
        matches: [],
        relatedRefs: [
          ref('Unit 1', '1.4.24', 'Upthrust as a distinct requirement', 18),
          ref('Unit 5', '5.3.130', 'Ideal-gas pressure as a later application', 33)
        ],
        evidence: [evidence('Solids, Liquids and Gases / Chapter 18: density and pressure', 'understand how the pressure at a point in a gas or liquid at rest acts equally in all directions')],
        scopeNote: 'Hydrostatic pressure is valuable background, but the written objectives do not explicitly include upthrust. The ideal-gas link is established in the later thermal block, not by hydrostatics alone.',
        nextStep: 'Distinguish hydrostatic pressure, buoyancy and molecular explanations of gas pressure.',
        siteLessonIds: []
      },
      {
        id: 'thermal-transfer', weeks: '31-36',
        schoolFocus: 'Conduction, convection and radiation',
        classification: 'extra',
        matches: [],
        relatedRefs: [ref('Unit 5', '5.6.161-163', 'Black-body curves and quantitative radiation laws', 36)],
        evidence: [evidence('Energy Resources and Energy Transfer / Chapter 15: Thermal energy', 'describe how thermal energy transfer may take place by conduction, convection and radiation')],
        scopeNote: 'This block provides qualitative thermal background. Surface/temperature effects on emission do not establish black-body curves, Stefan-Boltzmann calculations or Wien’s law.',
        nextStep: 'Use it to support energy accounts, then teach the separate quantitative radiation requirements when entering Unit 5 astrophysics.',
        siteLessonIds: []
      },
      {
        id: 'thermal-energy', weeks: '36-42',
        schoolFocus: 'Heat capacity, phase change and internal energy',
        classification: 'substantial',
        matches: [ref('Unit 5', '5.3.125, 128', 'Specific heat, latent heat and molecular internal energy', 33)],
        evidence: [
          evidence('Solids, Liquids and Gases / Chapter 19: Solids, liquids and gases', 'be able to use the equations ΔE=mcΔθ and ΔE=LΔm'),
          evidence('Solids, Liquids and Gases / Chapter 19: Solids, liquids and gases', 'understand the concept of internal energy as the random distribution of potential and kinetic energy amongst molecules')
        ],
        scopeNote: 'The written plan explicitly includes IAL equations and internal energy, so this is a substantial topic match. A temperature-time graph or heat-capacity experiment does not by itself establish the prescribed latent-heat method.',
        nextStep: 'Assess quantitative energy budgets and molecular explanations; confirm the latent-heat practical and correction for unwanted energy transfers.',
        siteLessonIds: []
      },
      {
        id: 'ideal-gases', weeks: '36-42',
        schoolFocus: 'Absolute temperature, gas laws and kinetic theory',
        classification: 'substantial',
        matches: [ref('Unit 5', '5.3.129-130, 132', 'Absolute temperature, ideal gases and mean molecular kinetic energy', 33)],
        evidence: [
          evidence('Solids, Liquids and Gases / Chapter 19: Solids, liquids and gases', 'be able to use the equation pV=NkT for an ideal gas'),
          evidence('Solids, Liquids and Gases / Chapter 19: Solids, liquids and gases', 'be able to derive and use the equation')
        ],
        scopeNote: 'The plan explicitly states the ideal-gas equation and the derivation linking mean molecular kinetic energy to absolute temperature. This goes beyond a qualitative gas-law introduction.',
        nextStep: 'Verify the kinetic-theory derivation, particle-number conventions and conditions; carry out the specified pressure-volume investigation.',
        siteLessonIds: []
      },
      {
        id: 'practical-skills', weeks: 'Across the year',
        schoolFocus: 'Named practical activities and experimental assessment',
        classification: 'partial',
        matches: [],
        relatedRefs: [
          ref('Unit 3', '3.3-3.5', 'Planning, measurement and processing/evaluation', 25),
          ref('Unit 6', '6.3-6.5', 'Planning, measurement and analysis including uncertainty', 39)
        ],
        evidence: [
          evidence('Waves / Chapter 12: Light waves', 'investigate the refractive index of glass, using a glass block (practical)'),
          evidence('Solids, Liquids and Gases / Chapter 19: Solids, liquids and gases', 'investigate the specific heat capacity of materials including water and some solids')
        ],
        scopeNote: 'Named experiments and an experiment assessment show opportunities to develop skills. They do not establish instrument selection, calibration, controls, graph methods, uncertainty, evaluation or the exact required core-practical procedures.',
        nextStep: 'Attach an explicit methods-and-analysis sequence to each activity, and assess transfer to unfamiliar experimental situations.',
        siteLessonIds: []
      }
    ],

    gaps: [
      {
        id: 'unit1-motion-gaps', classification: 'not_listed',
        title: 'Complete the motion representations',
        refs: [ref('Unit 1', '1.3.2-4, 7, 12', 'Graphs, scalar/vector language, projectiles and force pairs', 16)],
        note: 'These requirements are not explicit in the listed motion/force objectives. The site already offers some bridging lessons, but their presence is not evidence of the annual plan’s full teaching sequence.'
      },
      {
        id: 'unit1-materials', classification: 'not_listed',
        title: 'Develop the materials strand',
        refs: [ref('Unit 1', '1.4.24-32', 'Upthrust, viscosity, elastic response, stress/strain and Young modulus', 18)],
        note: 'Density and hydrostatics are listed; upthrust, Stokes-law conditions, Hooke’s law, elastic strain energy, stress/strain graphs, Young modulus and the associated methods need an explicit teaching plan.'
      },
      {
        id: 'unit2-wave-quantum', classification: 'not_listed',
        title: 'Move beyond basic wave and ray models',
        refs: [
          ref('Unit 2', '2.3.37, 39-44', 'Wave graphs, phase, interference, stationary waves and intensity', 20),
          ref('Unit 2', '2.3.49-54, 56-63', 'Polarisation, diffraction, pulse-echo and quantum models', 21)
        ],
        note: 'The named waves, spectrum and optics topics do not establish these further requirements, including diffraction gratings, de Broglie waves, photon energy, photoelectric evidence and line spectra.'
      },
      {
        id: 'unit2-circuits', classification: 'not_listed',
        title: 'Add the electric-circuits strand',
        refs: [ref('Unit 2', '2.4.64-80', 'Charge/current, circuit laws, resistivity, dividers, e.m.f. and internal resistance', 22)],
        note: 'Electricity generation as an energy-resource topic is not a replacement for quantitative circuit analysis and its practical techniques.'
      },
      {
        id: 'remaining-unit4', classification: 'not_listed',
        title: 'Plan the remaining Year 2 mechanics and fields',
        refs: [
          ref('Unit 4', '4.3.87-91', 'Circular motion', 28),
          ref('Unit 4', '4.4.92-110', 'Fields, capacitors and induction', 29),
          ref('Unit 4', '4.5.111-124', 'Nuclear/particle models and accelerators', 31)
        ],
        note: 'Selected advanced momentum objectives do not establish the remainder of Unit 4. Generic electricity production does not demonstrate field or induction calculations.'
      },
      {
        id: 'remaining-unit5', classification: 'not_listed',
        title: 'Plan the rest of Unit 5 beyond the thermal block',
        refs: [
          ref('Unit 5', '5.4.133-142', 'Nuclear decay and energetics', 34),
          ref('Unit 5', '5.5.143-153', 'Simple harmonic motion, damping and resonance', 35),
          ref('Unit 5', '5.6.154-168, 170-171', 'Gravitation, radiation, stars and cosmology', 36)
        ],
        note: 'The plan explicitly includes qualitative Doppler effect (169). That does not establish quantitative redshift, Hubble’s law or the other astrophysics objectives; thermal radiation background does not establish black-body laws.'
      },
      {
        id: 'core-practicals', classification: 'not_listed',
        title: 'Specify the required practical methods',
        refs: [
          ref('Unit 1', '1.3.11; 1.4.26, 31', 'Mechanics/materials core practicals', 16),
          ref('Unit 2', '2.3.38, 43, 52; 2.4.72, 78', 'Waves and circuits core practicals', 20),
          ref('Unit 4', '4.3.82, 84; 4.4.103', 'Impulse, collisions and capacitor investigations', 28),
          ref('Unit 5', '5.3.126-127, 131; 5.4.140; 5.5.149', 'Thermal, gas, radiation and resonance investigations', 33)
        ],
        note: 'A broad activity title may overlap a required experiment without matching its apparatus or analysis. Record what was planned, performed and analysed; assess Unit 3/6 skills explicitly rather than inferring them from an experiment count.'
      }
    ],

    calendar: [
      { weeks: '17-18', event: 'Christmas holiday' },
      { weeks: '19', event: 'Study week' },
      { weeks: '20', event: 'Examination' },
      { weeks: '23-24', event: 'Lunar New Year holiday' },
      { weeks: '43', event: 'Study week' },
      { weeks: '44', event: 'Examination' }
    ],
    calendarNote: 'Week ranges and overlaps are retained from the source plan. The map does not convert them into contact hours or an IAL coverage percentage.',
    canvaFooter: 'Source: school 2026/27 annual plan + Pearson Edexcel IAL Physics 2018 specification, Issue 3. Planned topic alignment only; not a claim of completed teaching or complete unit coverage.'
  };

  // Presentation-friendly aliases for the one-page summary renderer.
  const summaryDetails = {
    mechanics: ['Units 1 and 4', 'Selected mechanics, impulse and collision topics'],
    energy: ['Unit 1', 'Energy, work, power and efficiency (17-22)'],
    waves: ['Units 2 and 5', 'Basic waves, refraction, TIR and qualitative Doppler'],
    density: ['Unit 1', 'Density (23); pressure as additional foundation'],
    'thermal-transfer': ['Foundation', 'Conduction, convection and radiation'],
    'thermal-gases': ['Unit 5', 'Thermodynamics (125, 128-130, 132)'],
    'practical-assessment': ['Units 3 and 6', 'Experimental methods and analysis skills']
  };
  for (const row of window.CURRICULUM_MAP.summaryRows) {
    row.schoolTopic = row.schoolFocus;
    row.ialUnits = summaryDetails[row.id][0];
    row.ialTopics = summaryDetails[row.id][1];
    row.limits = row.nextStep;
  }
})();
