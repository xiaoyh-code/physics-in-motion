'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const Physics = require('./models.js');
// Validate every authored expression with the real local KaTeX engine while
// retaining compact XML for the geometry sweeps. Browser checks cover layout.
const realMath = require('./visual-math.js');
const texCalls = [];
const uniqueTex = new Set();
const escapeTex = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
global.PhysicsVisualMath = { svgMath(...args) {
  const [x, y, tex, size, color, anchor, width] = args;
  assert.ok([x,y,size,width].every(Number.isFinite) && size >= 10 && width > 0, 'finite TeX layout arguments');
  if (!uniqueTex.has(tex)) {
    const markup = realMath.typeset(tex);
    assert.ok(markup.includes('katex-mathml') && markup.includes('<math'), 'genuine TeX requires semantic MathML');
    uniqueTex.add(tex);
  }
  texCalls.push(args);
  return `<g data-tex="${escapeTex(tex)}"/>`;
} };
const MotionVisual = require('./motion-visual.js');

const motion = Physics.M.find(model => model.id === 'motion');
const T = Physics.duration(motion, Physics.defaults(motion));
let checks = 0, states = 0, frames = 0;

function near(actual, expected, label, tolerance = 1e-10) {
  assert.ok(Number.isFinite(actual), `${label} is not finite: ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${label}: ${actual} differs from ${expected}`);
  checks += 1;
}

// Integrate an independent piecewise-linear velocity graph. Splitting at its
// zero crossing makes trapezoidal signed/absolute areas exact, even on reversal.
function graphAreas(params, t) {
  const points = [0, t / 4, t / 2, 3 * t / 4, t];
  if (params.a !== 0) {
    const crossing = -params.u / params.a;
    if (crossing > 0 && crossing < t) points.push(crossing);
  }
  points.sort((a, b) => a - b);
  let signed = 0, absolute = 0;
  for (let i = 1; i < points.length; i += 1) {
    const left = params.u + params.a * points[i - 1];
    const right = params.u + params.a * points[i];
    const width = points[i] - points[i - 1];
    signed += (left + right) * width / 2;
    absolute += (Math.abs(left) + Math.abs(right)) * width / 2;
  }
  return { signed, absolute };
}

function checkState(params, t) {
  const state = MotionVisual.analyse(params, t);
  const areas = graphAreas(params, t);
  near(state.velocity, params.u + params.a * t, 'velocity from a constant gradient');
  near(state.initialContribution, params.u * t, 'signed initial-velocity rectangle');
  near(state.accelerationContribution, params.a * t * t / 2, 'signed acceleration triangle');
  near(state.displacement, areas.signed, 'displacement equals signed graph area');
  near(state.distance, areas.absolute, 'distance equals absolute graph area');
  near(state.initialContribution + state.accelerationContribution, state.displacement, 'decomposition preserves displacement');
  near(state.velocity * state.velocity, params.u * params.u + 2 * params.a * state.displacement, 'SUVAT invariant');
  assert.ok(state.distance + 1e-9 >= Math.abs(state.displacement), 'distance cannot be less than displacement magnitude');
  const crossing = params.a === 0 ? null : -params.u / params.a;
  if (crossing !== null && crossing > 0 && crossing < t) near(state.turningTime, crossing, 'internal turning time');
  else assert.equal(state.turningTime, null, 'a boundary or future zero is not an internal reversal');
  states += 1;
  return state;
}

function checkFrame(params, time, options = {}) {
  const input = { params, time, duration: T, result: Physics.calc('motion', params, time), runs: [], flags: {}, compact: false, stage: 4, ...options };
  const before = JSON.stringify(input);
  const priorMathCalls = texCalls.length;
  const rendered = MotionVisual.render(input);
  assert.ok(texCalls.length >= priorMathCalls + 3, 'every view must send equations through the shared TeX renderer');
  assert.equal(JSON.stringify(input), before, 'render must not mutate its inputs');
  assert.equal(typeof rendered.svg, 'string');
  assert.ok(rendered.svg.length > 0, 'renderer must provide SVG markup');
  assert.ok(!/\b(?:NaN|Infinity)\b/.test(rendered.svg) && !/="[^"]*\bundefined\b[^"]*"/.test(rendered.svg),
    `SVG must not contain invalid placeholders: ${JSON.stringify({ params, time, stage: input.stage, compact: input.compact })}`);
  assert.ok(!/motion-math-unavailable/.test(rendered.svg), 'shared TeX helper is available');
  for (const textNode of rendered.svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)) {
    assert.ok(!/[=≈Δ½²⁻]/.test(textNode[1]), 'mathematical expressions must not masquerade as SVG text');
  }
  assert.equal(typeof rendered.viewBox, 'string');
  const box = rendered.viewBox.trim().split(/[\s,]+/).map(Number);
  assert.equal(box.length, 4, 'viewBox has four coordinates');
  assert.ok(box.every(Number.isFinite) && box[2] > 0 && box[3] > 0, 'viewBox must define finite positive dimensions');
  assert.equal(typeof rendered.ariaLabel, 'string');
  assert.ok(rendered.ariaLabel.trim().length > 10, 'diagram must have a useful accessible label');
  assert.ok(!/\b(?:NaN|Infinity|undefined)\b/.test(rendered.ariaLabel), 'accessible label must not contain invalid placeholders');
  frames += 1;
  return rendered;
}

// Hand-calculated anchors separate signed area from total distance travelled.
const references = [
  { params: { u: 2, a: 2 }, t: 6, v: 14, s: 48, d: 48 },
  { params: { u: 4, a: -2 }, t: 6, v: -8, s: -12, d: 20 },
  { params: { u: -4, a: 2 }, t: 6, v: 8, s: 12, d: 20 },
  { params: { u: 4, a: -1 }, t: 6, v: -2, s: 6, d: 10 },
  { params: { u: -8, a: 0 }, t: 6, v: -8, s: -48, d: 48 },
  { params: { u: 0, a: 4 }, t: 6, v: 24, s: 72, d: 72 },
  { params: { u: 12, a: -4 }, t: 6, v: -12, s: 0, d: 36 },
  { params: { u: -8, a: 4 }, t: 6, v: 16, s: 24, d: 40 },
  { params: { u: 12, a: 4 }, t: 6, v: 36, s: 144, d: 144 },
  { params: { u: -8, a: -4 }, t: 6, v: -32, s: -120, d: 120 },
  { params: { u: 0, a: 0 }, t: 0, v: 0, s: 0, d: 0 }
];
for (const reference of references) {
  const state = checkState(reference.params, reference.t);
  near(state.velocity, reference.v, 'hand-calculated velocity');
  near(state.displacement, reference.s, 'hand-calculated displacement');
  near(state.distance, reference.d, 'hand-calculated distance');
}

// Every selectable u/a pair is tested across the playback interval. This covers
// endpoint signs, all reversal positions, stationary motion and zero acceleration.
const uControl = motion.controls.find(control => control.key === 'u');
const aControl = motion.controls.find(control => control.key === 'a');
for (let ui = 0; ui <= Math.round((uControl.max - uControl.min) / uControl.step); ui += 1) {
  for (let ai = 0; ai <= Math.round((aControl.max - aControl.min) / aControl.step); ai += 1) {
    const params = { u: uControl.min + ui * uControl.step, a: aControl.min + ai * aControl.step };
    const times = new Set([0, T / 4, T / 2, 3 * T / 4, T]);
    const crossing = params.a === 0 ? null : -params.u / params.a;
    if (crossing > 0 && crossing < T) [crossing / 2, crossing, (crossing + T) / 2].forEach(t => times.add(t));
    let lastDistance = -1;
    for (const t of [...times].sort((a, b) => a - b)) {
      const state = checkState(params, t);
      assert.ok(state.distance + 1e-9 >= lastDistance, 'distance must not decrease as playback advances');
      lastDistance = state.distance;
    }
    checkFrame(params, T, { compact: (ui + ai) % 2 === 0, stage: (ui + ai) % 5 });
  }
}

// Parse representative full SVG documents independently to catch unescaped text,
// malformed paths/attributes or invalid nesting in each reveal and compact mode.
const xmlFrames = [];
for (const { params } of references) {
  for (const t of [0, T / 2, T]) for (const stage of [0, 1, 2, 3, 4]) for (const compact of [false, true]) {
    xmlFrames.push(checkFrame(params, t, { stage, compact }));
  }
}
const keptRuns = [
  { params: { u: 2, a: 2 }, T, label: 'Run A' },
  { params: { u: -4, a: 2 }, T, label: 'Run <B> & comparison' },
  { params: { u: 6, a: -1 }, T, label: 'Run C' },
  { params: { u: -8, a: -4 }, T, label: 'Run D' }
];
assert.ok(checkFrame({ u: 4, a: -2 }, T, { runs: keptRuns }).svg.includes('Run D'),
  'All four kept runs supported by the laboratory must remain visible.');
for (const components of [false, true]) for (const projections of [false, true]) for (const ghosts of [false, true]) {
  for (const compact of [false, true]) for (const time of [0, T / 2, T]) {
    xmlFrames.push(checkFrame({ u: 4, a: -2 }, time, { compact, runs: keptRuns, flags: { components, projections, ghosts } }));
  }
}
const parsed = spawnSync('python3', ['-c', [
  'import json, sys, xml.etree.ElementTree as ET',
  'frames = json.load(sys.stdin)',
  'for frame in frames:',
  `    ET.fromstring('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + frame["viewBox"] + '">' + frame["svg"] + '</svg>')`,
  'print(f"Validated {len(frames)} SVG documents")'
].join('\n')], { input: JSON.stringify(xmlFrames), encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 });
assert.equal(parsed.status, 0, parsed.stderr);

// Analyse clamps to the actual lab timeline; it never exposes negative time or
// an arbitrary post-lesson state when a caller receives a stale scrub value.
for (const key of ['initialContribution', 'accelerationContribution', 'displacement', 'distance', 'velocity']) {
  near(MotionVisual.analyse({ u: 4, a: -2 }, -1)[key], MotionVisual.analyse({ u: 4, a: -2 }, 0)[key], `negative-time clamp ${key}`);
  near(MotionVisual.analyse({ u: 4, a: -2 }, T + 1)[key], MotionVisual.analyse({ u: 4, a: -2 }, T)[key], `end-time clamp ${key}`);
}


assert.ok([...uniqueTex].some(tex => tex.includes(String.raw`\frac12at^2`)), 'the acceleration area uses a genuine TeX fraction and superscript');
assert.ok([...uniqueTex].some(tex => tex.includes(String.raw`\color{#58c4dd}`) && tex.includes(String.raw`\color{#f4d345}`)), 'coloured terms retain semantic sign information');
assert.ok([...uniqueTex].some(tex => tex.includes(String.raw`\mathrm{m\,s^{-2}}`)), 'acceleration units use genuine TeX exponents');
const zeroTimeMathStart = texCalls.length;
checkFrame({u:4,a:-1},0,{stage:1});
assert.ok(texCalls.slice(zeroTimeMathStart).some(args=>args[2].includes(String.raw`\frac{\mathrm{d}v}{\mathrm{d}t}`)), 'at zero time, show a derivative instead of an undefined ratio');
checkFrame({u:2,a:1.5},1.234,{stage:0});
assert.ok(texCalls.slice(-6).some(args => args[2].includes(String.raw`\approx`)), 'rounded physical values are labelled approximate');

console.log(`PASS: ${states} motion states, ${checks} numerical checks, ${frames} finite SVG frames; signed areas, reversal distance, zero acceleration/time, all stages and compact layouts. ${parsed.stdout.trim()}; ${uniqueTex.size} unique expressions parsed by real KaTeX.`);
