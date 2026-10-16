/* Bundled teaching resources. Local teacher uploads are stored separately in IndexedDB. */
window.LESSON_LIBRARY_MODE = 'teacher';
window.LESSON_RESOURCES = {
  motion: {
    subtitle: 'From velocity–time graphs to Edexcel IAL Unit 1 reasoning.',
    resources: [
      {
        id: 'motion-sample-qp', sample: true, kind: 'pdf',
        title: 'Velocity & time — sample worksheet',
        description: 'Multiple choice, fill in the blanks and structured questions. Derive the equations, explain reversal and interpret uncertainty.',
        meta: 'TYPST SAMPLE · 3 PAGES · 20 MARKS',
        pdf: 'resources/motion/Lesson_01_Velocity_Time_QP.pdf',
        pages: [
          { src: 'resources/motion/worksheet-page-01.png', alt: 'Worksheet page 1: multiple choice and fill in the blanks.' },
          { src: 'resources/motion/worksheet-page-02.png', alt: 'Worksheet page 2: derive velocity and displacement equations, then apply them to the trolley.' },
          { src: 'resources/motion/worksheet-page-03.png', alt: 'Worksheet page 3: direction changes, distance, displacement and acceleration uncertainty.' }
        ]
      },
      {
        id: 'motion-sample-ms', sample: true, kind: 'pdf',
        title: 'Worked answers & marking scheme',
        description: 'Check your method, signs and units with a matching answer scheme and explanations for every question.',
        meta: 'TYPST SAMPLE · 2 PAGES · ANSWERS',
        pdf: 'resources/motion/Lesson_01_Velocity_Time_MS.pdf',
        pages: [
          { src: 'resources/motion/answers-page-01.png', alt: 'Marking scheme page 1: multiple-choice, fill-in and derivation answers.' },
          { src: 'resources/motion/answers-page-02.png', alt: 'Marking scheme page 2: reversal and uncertainty solutions with the 20-mark total.' }
        ]
      }
    ]
  }
};
