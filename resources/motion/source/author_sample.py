from pathlib import Path
root=Path(__file__).resolve().parent.parent
qp=root/'Lesson_01_Velocity_Time_QP.typ'
ms=root/'Lesson_01_Velocity_Time_MS.typ'
# Preserve the complete helper library and the locked QP page block verbatim.
q=qp.read_text().split('#align(center)[\n  #text(size: 17pt')[0]
m=ms.read_text().split('#align(center)[\n  #text(size: 18pt')[0]
qp.write_text(q+r'''
#align(center)[
  #text(size: 17pt, weight: "bold")[#paper-title]
  #v(1.5mm)
  #text(size: 12pt, weight: "bold")[#paper-subtitle]
  #v(1mm)
  #text(size: 10pt)[#paper-subject]
]
#v(3mm)
#block(width: 100%, inset: 6pt, stroke: thin, fill: rgb("#fbfbfb"))[
  *Total: #total-marks marks* #h(8mm) *Suggested time: 30 minutes*

  Answer all questions. Show working. Give units and sensible significant figures.
]
#text(size: 8.5pt, style: "italic")[Original practice; not an official Pearson paper. Calculator and ruler permitted.]
#v(3mm)
#section-heading([Part A: MULTIPLE CHOICE QUESTIONS], 4)
#text(size: 8.5pt)[Choose one answer per question. Write your answers in the grid.]
#v(2mm)
#numbered-questions((
  [The gradient of a velocity-time graph gives
    #choices([distance.], [acceleration.], [displacement.], [average speed.])],
  [An area below the time axis on a velocity-time graph contributes
    #choices([negative displacement.], [negative distance.], [positive acceleration.], [zero speed.])],
  [A trolley has velocity $-3.0 " m s"^(-1)$ and acceleration $+2.0 " m s"^(-2)$. Its speed is
    #choices([increasing.], [zero.], [decreasing.], [constant.])],
  [Which condition is required to use $s = u t + 1/2 a t^2$ for one-dimensional motion?
    #choices([speed is constant.], [initial velocity is zero.], [displacement is positive.], [acceleration is constant.])],
), spacing: 3mm)
#v(1mm)
#answer-grid(4, columns: 4, row-height: 10mm)
#v(4mm)
#section-heading([Part B: FILL IN THE BLANKS], 4)
#text(size: 8.5pt)[Write one word, unit or formula in each numbered answer box. No word bank is supplied.]
#v(2mm)
#numbered-questions((
  [Velocity is a #fill-slot(1) quantity because direction matters.],
  [The SI unit of acceleration is #fill-slot(2).],
  [On a velocity-time graph, signed area gives #fill-slot(3).],
  [Average speed equals total #fill-slot(4) divided by total time.],
), spacing: 2mm)
#v(2mm)
#answer-grid(4, columns: 4, row-height: 12mm)

#pagebreak()
#section-heading([Part C: STRUCTURED QUESTIONS], 12)
#v(5mm)
#question-title(5, [From a graph to an equation], 7)

A trolley moves along a straight track with initial velocity $u$ and constant acceleration $a$. Its velocity after elapsed time $t$ is $v$ and its displacement is $s$.

#part-title("a", [Deriving the relationships])
#calculation-question("i", [Starting with the definition of acceleration, derive $v = u + a t$.], 2, height: 29mm)
#calculation-question("ii", [Using the area under a straight velocity-time graph, derive $s = u t + 1/2 a t^2$ for positive $u$ and positive $a$. You may draw your own sketch as part of your working.], 3, height: 55mm)

#part-title("b", [Using the relationship])
#calculation-question("i", [The trolley has $u = 2.0 " m s"^(-1)$ and $a = 1.5 " m s"^(-2)$. Calculate its displacement after $4.0 " s"$.], 2, height: 40mm)
#question-total(5, 7)

#pagebreak()
#text(size: 10pt, weight: "bold")[Part C: STRUCTURED QUESTIONS (continued)]
#v(5mm)
#question-title(6, [Direction and experimental uncertainty], 5)

#part-title("a", [A trolley reverses direction])
A trolley has initial velocity $-4.0 " m s"^(-1)$ and constant acceleration $+2.0 " m s"^(-2)$ for $6.0 " s"$. Take motion to the right as positive.

#calculation-question("i", [Calculate the time when the trolley reverses direction.], 1, height: 22mm)
#calculation-question("ii", [Calculate its displacement during the $6.0 " s"$.], 1, height: 26mm)
#calculation-question("iii", [Calculate the total distance travelled during the $6.0 " s"$.], 1, height: 34mm)

#part-title("b", [A motion-sensor experiment])
In a separate experiment, a velocity-time graph has best-fit gradient $0.80 " m s"^(-2)$. The steepest and shallowest acceptable gradients are $0.88 " m s"^(-2)$ and $0.72 " m s"^(-2)$.

#calculation-question("i", [Estimate the absolute uncertainty in acceleration using half the gradient range, then calculate the percentage uncertainty.], 2, height: 37mm)
#question-total(6, 5)
#v(5mm)
#align(center)[#text(weight: "bold")[END OF PAPER]]
''')
ms.write_text(m+r'''
#align(center)[
  #text(size: 18pt, weight: "bold")[#paper-title]
  #v(1.5mm)
  #text(size: 12.5pt, weight: "bold")[Sample Worksheet - Marking Scheme]
  #v(1mm)
  #text(size: 10pt)[#paper-subject]
]
#v(3mm)
#block(inset: 6pt, width: 100%, stroke: 0.5pt)[
  *Total: 20 marks.* Original practice; not an official Pearson marking scheme.

  Award equivalent valid physics. Each *[1]* is one distinct marking point. Allow consequential arithmetic when the subsequent method is correct, within the stated part maximum. Numerical answers require units.
]
#v(4mm)
#section-heading([Part A: MULTIPLE CHOICE QUESTIONS], 4)
#table(
  columns: (0.7fr, 0.7fr, 4.6fr, 0.6fr),
  table.header([*Question*], [*Answer*], [*Notes*], [*Marks*]),
  [1], [B], [The velocity-time gradient is acceleration.], [1],
  [2], [A], [Areas below the axis count negatively for displacement.], [1],
  [3], [C], [Positive acceleration reduces the magnitude of this negative velocity.], [1],
  [4], [D], [Acceleration must be constant over the interval.], [1],
)
#v(4mm)
#section-heading([Part B: FILL IN THE BLANKS], 4)
#table(
  columns: (0.7fr, 5.3fr, 0.6fr),
  table.header([*Blank*], [*Answer*], [*Marks*]),
  [1], [vector], [1],
  [2], [$"m s"^(-2)$ / $"m"/"s"^2$], [1],
  [3], [displacement], [1],
  [4], [distance], [1],
)
#v(4mm)
#section-heading([Part C: STRUCTURED QUESTIONS], 12)
#qhead(5, [From a graph to an equation], 7)
#ms-table((
  [(a)(i)], [Uses $a = (v - u) / t$ *[1]*; rearranges $a t = v - u$ to obtain $v = u + a t$ *[1]*.], [2],
  [(a)(ii)], [States displacement is the area under the velocity-time graph *[1]*; expresses this as rectangle plus triangle, $s = u t + 1/2 (v - u) t$ *[1]*; substitutes $v - u = a t$ to obtain $s = u t + 1/2 a t^2$ *[1]*.

  Accept trapezium area $s = 1/2 (u + v)t$ followed by substitution and expansion, with the same three ideas. A sketch is optional.], [3],
  [(b)(i)], [Uses $s = 2.0(4.0) + 1/2 (1.5)(4.0)^2$ *[1]*; $s = 20 " m"$ *[1]*.], [2],
))
#align(right)[*Total for Question 5 = 7 marks*]

#pagebreak()
#text(size: 10pt, weight: "bold")[Part C: STRUCTURED QUESTIONS (continued)]
#qhead(6, [Direction and experimental uncertainty], 5)
#ms-table((
  [(a)(i)], [At a turn $v = 0$: $0 = -4.0 + 2.0t$, hence $t = 2.0 " s"$ *[1]*.], [1],
  [(a)(ii)], [$s = u t + 1/2 a t^2 = -4.0(6.0) + 1/2 (2.0)(6.0)^2 = +12 " m"$ *[1]*. Accept $12 " m"$ rightwards.], [1],
  [(a)(iii)], [The trolley travels $4.0 " m"$ left before the turn, then $16 " m"$ right. Total distance $= 4.0 + 16 = 20 " m"$ *[1]*.], [1],
  [(b)(i)], [Absolute uncertainty $Delta a = (0.88 - 0.72)/2 = 0.08 " m s"^(-2)$ *[1]*; percentage uncertainty $= (0.08/0.80) times 100% = 10%$ *[1]*.], [2],
))
#align(right)[*Total for Question 6 = 5 marks*]
#v(5mm)
#text(size: 12pt, weight: "bold")[Worked reasoning for the reversal]

The velocity at $6.0 " s"$ is $v = -4.0 + 2.0(6.0) = +8.0 " m s"^(-1)$. The velocity-time line crosses zero at $2.0 " s"$.

The area below the axis is a triangle of magnitude $1/2 times 2.0 times 4.0 = 4.0 " m"$. It contributes $-4.0 " m"$ to displacement.

The area above the axis is a triangle of magnitude $1/2 times 4.0 times 8.0 = 16 " m"$. It contributes $+16 " m"$ to displacement.

Therefore displacement $= -4.0 + 16 = +12 " m"$, while distance $= 4.0 + 16 = 20 " m"$. A zero velocity at one instant does not mean the acceleration is zero.

#v(4mm)
#text(size: 12pt, weight: "bold")[Interpreting the practical result]

The gradient of the velocity-time line estimates acceleration. Using the specified half-range method, the result can be reported as $a = (0.80 plus.minus 0.08) " m s"^(-2)$. The percentage uncertainty has no physical unit.

This acceptable-gradient method is a scaffolded extension. Repeating measurements may reduce the influence of random scatter; a systematic offset needs a calibration or zero check.

#v(4mm)
#table(
  columns: (1fr, auto),
  [Part A], [4 marks],
  [Part B], [4 marks],
  [Question 5], [7 marks],
  [Question 6], [5 marks],
  [*Total*], [*20 marks*],
)
#v(5mm)
#align(center)[#text(weight: "bold")[END OF MARKING SCHEME]]
''')
print(qp, ms, sep='\n')
