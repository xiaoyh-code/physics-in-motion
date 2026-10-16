// Selectable mixed-format QP template based on EXAMQP_0615.typ.

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

#set text(font: ("New Computer Modern", "Arial Unicode MS"), size: 11pt)
#set par(leading: 0.66em, spacing: 0.45em, justify: false)
#set table(inset: 5pt, stroke: 0.55pt)

#let thin = 0.45pt + black
#let blank(w) = box(width: w)[#line(length: 100%)]
#let mark-label(n) = if n == 1 { "1 mark" } else { str(n) + " marks" }

// LOCKED QP PAGE SETUP: keep this block unchanged for every generated paper.
#set page(
  paper: "a4",
  margin: (top: 18mm, bottom: 22mm, left: 18mm, right: 18mm),
  numbering: "1 of 1",
  number-align: bottom + left,
  background: context [
    #place(bottom + right, dx: -17mm, dy: -13mm)[
      #text(size: 9pt)[班級(Class): #blank(22mm)  學號(No): #blank(22mm)]
    ]
  ],
)

#let section-heading(title, marks) = grid(
  columns: (1fr, auto),
  gutter: 6pt,
  align: (left, right),
  [#text(weight: "bold")[#title]],
  [#text(weight: "bold")[#(mark-label(marks))]],
)

// Multiple-choice format.
#let choices(a, b, c, d) = table(
  columns: (1fr, 1fr),
  inset: 5.2pt,
  stroke: 0.35pt + gray,
  [*A.* #a], [*B.* #b],
  [*C.* #c], [*D.* #d],
)

#let numbered-questions(items, start: 1, spacing: 5mm) = enum(
  numbering: n => strong(str(n) + "."),
  start: start,
  spacing: spacing,
  ..items,
)

#let answer-grid(count, columns: 10, start: 1, row-height: 14mm) = {
  let cells = range(count).map(i => box(
    width: 100%,
    height: row-height,
    inset: 4pt,
  )[#text(weight: "bold")[#(str(start + i) + ":")]])
  table(columns: (1fr,) * columns, inset: 0pt, stroke: 0.7pt, ..cells)
}

// Fill-in-the-blanks format.
#let fill-slot(n, width: 20mm) = box(
  width: width,
  inset: (bottom: 1.5pt),
  stroke: (bottom: thin),
)[#align(center)[#text(size: 8pt, weight: "bold")[[#n]]]]

// Structured-question formats.
#let qline(body, marks) = grid(
  columns: (1fr, auto),
  gutter: 6pt,
  align: (left, right),
  [#body],
  [#text(weight: "bold")[(#marks)]],
)

#let question-title(n, title, marks) = qline(
  [#text(weight: "bold")[#(str(n) + ".") #title]],
  marks,
)

#let part-title(label, title) = [
  #v(2mm)
  #text(weight: "bold")[#label. #title]
  #v(1mm)
]

#let subquestion(label, body, marks) = qline(
  [#text(weight: "bold")[#label.] #body],
  marks,
)

#let answer-lines(count: 2, gap: 7mm) = [
  #for _ in range(count) [
    #v(gap)
    #line(length: 100%, stroke: 0.45pt + gray)
  ]
]

#let working-space(height: 35mm) = block(width: 100%, height: height)

#let short-question(label, body, marks, lines: 2) = [
  #subquestion(label, body, marks)
  #answer-lines(count: lines)
]

#let calculation-question(label, body, marks, height: 35mm) = [
  #subquestion(label, body, marks)
  #working-space(height: height)
]

#let explanation-question(label, body, marks, lines: 4) = [
  #subquestion(label, body, marks)
  #answer-lines(count: lines)
]

#let question-total(n, marks) = align(right)[
  #text(weight: "bold")[Total for Question #n = #marks marks]
]



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
