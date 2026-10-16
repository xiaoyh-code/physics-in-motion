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
const DisplacementVisual = require('./displacement-visual.js');

const model = Physics.M.find(item => item.id === 'displacement');
const T = Physics.duration(model, Physics.defaults(model));
let checks = 0, states = 0, frames = 0;

function near(actual, expected, label) {
  assert.ok(Number.isFinite(actual), `${label} is not finite: ${actual}`);
  assert.ok(Math.abs(actual - expected) <= 1e-10 * Math.max(1, Math.abs(expected)), `${label}: ${actual} differs from ${expected}`);
  checks += 1;
}

// Piecewise trapezoidal integration is independent of the SUVAT decomposition.
// Its positive and negative velocity regions distinguish displacement/distance.
function graphAreas(params, time) {
  const knots = [0, time / 4, time / 2, time * 3 / 4, time];
  if (params.a !== 0) {
    const root = -params.u / params.a;
    if (root > 0 && root < time) knots.push(root);
  }
  knots.sort((a, b) => a - b);
  let positive = 0, negative = 0;
  for (let i = 1; i < knots.length; i += 1) {
    const leftVelocity = params.u + params.a * knots[i - 1];
    const rightVelocity = params.u + params.a * knots[i];
    const area = (leftVelocity + rightVelocity) / 2 * (knots[i] - knots[i - 1]);
    if (area > 0) positive += area;
    else negative += area;
  }
  return { positive, negative };
}

function checkState(params, time) {
  const state = DisplacementVisual.analyse(params, time);
  const areas = graphAreas(params, time);
  const velocity = params.u + params.a * time;
  near(state.velocity, velocity, 'signed velocity from acceleration');
  near(state.initialContribution, params.u * time, 'initial contribution');
  near(state.accelerationContribution, params.a * time * time / 2, 'acceleration contribution');
  near(state.positiveArea, areas.positive, 'positive velocity graph area');
  near(state.negativeArea, areas.negative, 'signed negative velocity graph area');
  near(state.displacement, areas.positive + areas.negative, 'signed displacement');
  near(state.distance, areas.positive - areas.negative, 'total distance travelled');
  near(state.initialContribution + state.accelerationContribution, state.displacement, 'SUVAT contributions sum');
  near(state.velocitySquared, velocity * velocity, 'squared final velocity');
  near(state.initialVelocitySquared, params.u * params.u, 'squared initial velocity');
  near(state.twiceAccelerationDisplacement, 2 * params.a * state.displacement, 'signed 2as term');
  near(state.velocitySquared, state.initialVelocitySquared + state.twiceAccelerationDisplacement, 'time-eliminated SUVAT invariant');
  assert.ok(state.positiveArea >= -1e-9 && state.negativeArea <= 1e-9, 'velocity-area signs must be explicit');
  assert.ok(state.distance + 1e-9 >= Math.abs(state.displacement), 'distance is at least displacement magnitude');
  const turning = params.a === 0 ? null : -params.u / params.a;
  if (turning !== null && turning > 0 && turning < time) near(state.turningTime, turning, 'internal reversal time');
  else assert.equal(state.turningTime, null, 'boundary/future zeros are not elapsed internal reversals');
  states += 1;
  return state;
}

const anchors = [
  { params: { u: 4, a: -1 }, t: 6, v: -2, s: 6, d: 10, positive: 8, negative: -2, turn: 4 },
  { params: { u: 4, a: -1 }, t: 2, v: 2, s: 6, d: 6, positive: 6, negative: 0, turn: null },
  { params: { u: 4, a: -1 }, t: 4, v: 0, s: 8, d: 8, positive: 8, negative: 0, turn: null },
  { params: { u: -4, a: 1 }, t: 6, v: 2, s: -6, d: 10, positive: 2, negative: -8, turn: 4 },
  { params: { u: 3, a: -1 }, t: 6, v: -3, s: 0, d: 9, positive: 4.5, negative: -4.5, turn: 3 },
  { params: { u: 12, a: -4 }, t: 6, v: -12, s: 0, d: 36, positive: 18, negative: -18, turn: 3 },
  { params: { u: -8, a: 0 }, t: 6, v: -8, s: -48, d: 48, positive: 0, negative: -48, turn: null },
  { params: { u: 0, a: -4 }, t: 6, v: -24, s: -72, d: 72, positive: 0, negative: -72, turn: null },
  { params: { u: 0, a: 0 }, t: 0, v: 0, s: 0, d: 0, positive: 0, negative: 0, turn: null }
];
for (const anchor of anchors) {
  const state = checkState(anchor.params, anchor.t);
  for (const [key, expected] of Object.entries({ velocity: anchor.v, displacement: anchor.s, distance: anchor.d, positiveArea: anchor.positive, negativeArea: anchor.negative })) near(state[key], expected, `reference ${key}`);
  if (anchor.turn === null) assert.equal(state.turningTime, null);
  else near(state.turningTime, anchor.turn, 'reference turning time');
}

// At the same position, the trolley can pass in opposite directions. Squared
// velocity agrees at both times and cannot determine the direction of travel.
const outward = DisplacementVisual.analyse({ u: 4, a: -1 }, 2);
const returning = DisplacementVisual.analyse({ u: 4, a: -1 }, 6);
near(outward.displacement, returning.displacement, 'same position before/after turn');
near(outward.velocitySquared, returning.velocitySquared, 'same squared speed in opposite directions');
near(outward.velocity, -returning.velocity, 'velocity sign is preserved separately');
assert.ok(returning.velocity < 0 && returning.velocitySquared > 0, 'v² must not overwrite signed v');
near(returning.initialVelocitySquared, 16, 'initial v² anchor');
near(returning.twiceAccelerationDisplacement, -12, 'negative 2as anchor');
near(returning.velocitySquared, 4, 'cancellation leaves positive v²');

// Full selectable parameter grid, plus exact reversal points and each side of
// the turn. Distance must increase even while displacement begins to decrease.
const uControl = model.controls.find(control => control.key === 'u');
const aControl = model.controls.find(control => control.key === 'a');
for (let ui = 0; ui <= Math.round((uControl.max - uControl.min) / uControl.step); ui += 1) {
  for (let ai = 0; ai <= Math.round((aControl.max - aControl.min) / aControl.step); ai += 1) {
    const params = { u: uControl.min + ui * uControl.step, a: aControl.min + ai * aControl.step };
    const times = new Set([0, T / 4, T / 2, T * 3 / 4, T]);
    const turn = params.a === 0 ? null : -params.u / params.a;
    if (turn > 0 && turn < T) [turn / 2, turn, (turn + T) / 2].forEach(time => times.add(time));
    let previousDistance = -1;
    for (const time of [...times].sort((a, b) => a - b)) {
      const state = checkState(params, time);
      assert.ok(state.distance + 1e-9 >= previousDistance, 'travelled distance never decreases');
      previousDistance = state.distance;
    }
  }
}

function checkFrame(params, time, options = {}) {
  const input = { params, time, duration: T, result: Physics.calc('displacement', params, time), runs: [], flags: {}, compact: false, stage: 4, ...options };
  const before = JSON.stringify(input);
  const priorMathCalls = texCalls.length;
  const output = DisplacementVisual.render(input);
  assert.ok(texCalls.length >= priorMathCalls + 3, 'every view must send equations through the shared TeX renderer');
  assert.equal(JSON.stringify(input), before, 'pure renderer must preserve its inputs');
  assert.equal(typeof output.svg, 'string');
  assert.ok(output.svg.length > 0);
  assert.ok(!/\b(?:NaN|Infinity)\b/.test(output.svg) && !/="[^"]*\bundefined\b[^"]*"/.test(output.svg), `non-finite SVG: ${JSON.stringify({ params, time, stage: input.stage, compact: input.compact })}`);
  assert.ok(!/displacement-math-unavailable/.test(output.svg), 'shared TeX helper is available');
  for (const textNode of output.svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)) {
    assert.ok(!/[=≈Δ½²⁻]/.test(textNode[1]), 'mathematical expressions must not masquerade as SVG text');
  }
  assert.equal(typeof output.viewBox, 'string');
  const dimensions = output.viewBox.trim().split(/[\s,]+/).map(Number);
  assert.ok(dimensions.length === 4 && dimensions.every(Number.isFinite) && dimensions[2] > 0 && dimensions[3] > 0, 'finite positive viewBox');
  assert.equal(typeof output.ariaLabel, 'string');
  assert.ok(output.ariaLabel.length > 10 && !/\b(?:NaN|Infinity)\b/.test(output.ariaLabel), 'useful finite accessible description');
  frames += 1;
  return output;
}

// Selected render states cover every reveal, bounds, stationary motion, tangent
// at v=0, sign cancellation, compact layout and all comparison/display flags.
const xmlFrames = [];
const renderParams = [...anchors.map(anchor => anchor.params), { u: 12, a: 4 }, { u: -8, a: -4 }];
for (const params of renderParams) for (const time of [0, 2, 4, T]) {
  for (const stage of [0, 1, 2, 3, 4]) for (const compact of [false, true]) xmlFrames.push(checkFrame(params, time, { stage, compact }));
}
const runs = [
  { params: { u: 4, a: -1 }, T, label: 'Run A' },
  { params: { u: -4, a: 1 }, T, label: 'Run <B> & comparison' },
  { params: { u: 12, a: 4 }, T, label: 'Run C' },
  { params: { u: -8, a: -4 }, T, label: 'Run D' }
];
assert.ok(checkFrame({ u: 4, a: -1 }, T, { runs }).svg.includes('Run D'), 'all four kept runs remain visible');
for (const components of [false, true]) for (const projections of [false, true]) for (const ghosts of [false, true]) {
  for (const compact of [false, true]) for (const time of [0, 4, T]) xmlFrames.push(checkFrame({ u: 4, a: -1 }, time, { compact, runs, flags: { components, projections, ghosts } }));
}
const parsed = spawnSync('python3', ['-c', [
  'import json, sys, xml.etree.ElementTree as ET',
  'frames = json.load(sys.stdin)',
  'for frame in frames:',
  `    ET.fromstring('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + frame["viewBox"] + '">' + frame["svg"] + '</svg>')`,
  'print(f"Validated {len(frames)} SVG documents")'
].join('\n')], { input: JSON.stringify(xmlFrames), encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 });
assert.equal(parsed.status, 0, parsed.stderr);

for (const key of ['initialContribution', 'accelerationContribution', 'displacement', 'distance', 'velocity', 'positiveArea', 'negativeArea', 'velocitySquared', 'initialVelocitySquared', 'twiceAccelerationDisplacement']) {
  near(DisplacementVisual.analyse({ u: 4, a: -1 }, -1)[key], DisplacementVisual.analyse({ u: 4, a: -1 }, 0)[key], `negative-time clamp ${key}`);
  near(DisplacementVisual.analyse({ u: 4, a: -1 }, T + 1)[key], DisplacementVisual.analyse({ u: 4, a: -1 }, T)[key], `end-time clamp ${key}`);
}

assert.ok([...uniqueTex].some(tex => tex.includes(String.raw`\frac12at^2`)), 'the acceleration area uses a genuine TeX fraction and superscript');
assert.ok([...uniqueTex].some(tex => tex.includes(String.raw`\color{#58c4dd}`) && tex.includes(String.raw`\color{#f4d345}`)), 'coloured terms retain semantic sign information');
assert.ok([...uniqueTex].some(tex => tex.includes(String.raw`\mathrm{m\,s^{-2}}`)), 'acceleration units use genuine TeX exponents');
assert.ok([...uniqueTex].some(tex => tex.includes('v^2=u^2+2as')), 'time elimination retains the squared-velocity identity');
assert.ok([...uniqueTex].some(tex => tex.includes('s=A_{+}+A_{-}')), 'displacement adds the signed areas');
assert.ok([...uniqueTex].some(tex => tex.includes('d=A_{+}-A_{-}')), 'distance subtracts the negative signed area');
checkFrame({u:2,a:1.5},1.234,{stage:0});
assert.ok(texCalls.slice(-6).some(args => args[2].includes(String.raw`\approx`)), 'rounded physical values are labelled approximate');

console.log(`PASS: ${states} displacement states, ${checks} numerical checks, ${frames} finite frames; signed regions/distance, turning tangent, negative velocity with positive v², zero acceleration/time, all five stages and four comparisons. ${parsed.stdout.trim()}; ${uniqueTex.size} unique expressions parsed by real KaTeX.`);
