// Selectable marking-scheme template matching question-paper.typ.

#let paper-title = "Lesson 1: Velocity and Time"
#let paper-subtitle = "Edexcel IAL Bridge - Sample Worksheet"
#let paper-subject = "Physics - WPH11 (2018 specification)"
#let total-marks = 20
#let include-mcq = true
#let include-fill = true
#let include-structured = true
#let mcq-part = "A"
#let fill-part = "B"
#let structured-part = "C"

#set text(font: ("New Computer Modern", "Arial Unicode MS"), size: 10.3pt)
#set par(leading: 0.66em, spacing: 0.42em, justify: false)
#set table(inset: 5pt, stroke: 0.5pt)

#let mark-label(n) = if n == 1 { "1 mark" } else { str(n) + " marks" }

#set page(
  paper: "a4",
  margin: (top: 16mm, bottom: 18mm, left: 16mm, right: 16mm),
  numbering: "1 of 1",
  number-align: bottom + center,
)

#let section-heading(title, marks) = grid(
  columns: (1fr, auto),
  gutter: 6pt,
  align: (left, right),
  [#text(size: 12.5pt, weight: "bold")[#title]],
  [#text(weight: "bold")[#(mark-label(marks))]],
)

#let qhead(n, title, marks) = [
  #v(4mm)
  #grid(
    columns: (1fr, auto),
    gutter: 6pt,
    align: (left, right),
    [#text(size: 12.5pt, weight: "bold")[Question #n: #title]],
    [#text(weight: "bold")[#(mark-label(marks))]],
  )
  #line(length: 100%, stroke: 0.8pt + black)
  #v(1.5mm)
]

#let ms-table(body) = table(
  columns: (0.9fr, 5fr, 0.75fr),
  table.header([*Part*], [*Answer / marking points*], [*Marks*]),
  ..body,
)



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
