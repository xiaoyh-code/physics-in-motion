'use strict';

// Independent physics invariants plus SVG structure checks for the live lesson.
// The TeX spy keeps this suite DOM-free; browser verification checks KaTeX output.
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const texCalls = [];
global.PhysicsVisualMath = {
  svgMath(...args) {
    texCalls.push(args);
    return `<g data-tex="${esc(JSON.stringify(args))}"/>`;
  }
};
const ProjectileVisual = require('./projectile-visual.js');
const Projectile = require('./projectile.js');
let states = 0, checks = 0, frames = 0;

function near(actual, expected, label, tolerance = 1e-9) {
  assert.ok(Number.isFinite(actual), `${label}: non-finite ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${label}: ${actual} differs from ${expected}`);
  checks += 1;
}
function finiteNumbers(state, label) {
  for (const [key, value] of Object.entries(state)) {
    if (typeof value === 'number') {
      assert.ok(Number.isFinite(value), `${label}.${key}: ${value}`);
      checks += 1;
    }
  }
}

function checkState(params, requestedTime) {
  const state = ProjectileVisual.analyse(params, requestedTime);
  finiteNumbers(state, 'projectile analysis');
  const angle = params.theta * Math.PI / 180;
  const ux = Math.abs(params.theta) === 90 ? 0 : params.u * Math.cos(angle);
  const uy = params.u * Math.sin(angle);
  const initialEnergy = params.u * params.u / 2 + params.g * params.h;
  const T = state.T;
  assert.ok(T >= 0, 'flight time must be nonnegative');
  near(state.time, Math.max(0, Math.min(T, requestedTime)), 'time clamped at first contact');
  near(state.ux, ux, 'resolved horizontal launch velocity');
  near(state.uy, uy, 'resolved vertical launch velocity');
  near(state.vx, ux, 'horizontal velocity stays constant');
  near(state.vy + params.g * state.time, uy, 'vertical velocity change is gravitational impulse per mass');
  near(state.speed * state.speed, state.vx * state.vx + state.vy * state.vy, 'velocity triangle magnitude');
  // Integrate the *velocity graph* by a trapezium, independently of the
  // displacement decomposition used to present the animation.
  near(state.x, (ux + state.vx) / 2 * state.time, 'horizontal displacement is velocity graph area');
  near(state.y - params.h, (uy + state.vy) / 2 * state.time, 'vertical displacement is signed velocity graph area');
  near(state.speed * state.speed / 2 + params.g * state.y, initialEnergy, 'specific mechanical energy is conserved', 1e-8);
  near(state.R, ux * T, 'range uses the actual first-contact duration');
  near(state.drop, (uy - state.vy) * state.time / 2, 'gravity drop matches the changing-velocity triangle');
  near(params.h + (uy - params.g * T / 2) * T, 0, 'landing root satisfies the vertical motion equation', 1e-8);
  assert.ok(uy - params.g * T <= 1e-8, 'first contact occurs on the descending part of the trajectory');
  assert.ok(state.y >= -1e-8 && state.y <= state.H + 1e-8, 'height stays between ground and trajectory maximum');
  if (uy > 1e-9) {
    near(state.apexTime, uy / params.g, 'apex when vertical velocity is zero');
    near(state.H, params.h + uy * uy / (2 * params.g), 'maximum height from vertical energy');
    assert.equal(state.futureApex, true, 'upward launches have an airborne apex');
    assert.ok(state.apexTime > 0 && state.apexTime <= T + 1e-8);
  } else {
    assert.equal(state.apexTime, null, 'downward/horizontal launch has no future turning apex');
    assert.equal(state.futureApex, false);
    near(state.H, params.h, 'a downward launch is highest at release');
  }
  near(state.T, Projectile.flightTime(params), 'renderer and model agree on physical duration');
  const modelState = Projectile.calculate(params, requestedTime);
  for (const [renderKey, modelKey] of [['time', 't'], ['x', 'x'], ['y', 'y'], ['vx', 'vx'], ['vy', 'vy'], ['speed', 'v'], ['R', 'R'], ['H', 'H']]) {
    near(state[renderKey], modelState[modelKey], `model/renderer agreement: ${renderKey}`, 1e-8);
  }
  states += 1;
  return state;
}

const anchors = [
  { params: { u: 12, theta: 0, h: 5, g: 10 }, time: 1, T: 1, x: 12, y: 0, vy: -10, H: 5 },
  // 8 - 6t - 5t² vanishes at t=.8. This is not a same-height range case.
  { params: { u: 12, theta: -30, h: 8, g: 10 }, time: .8, T: .8, x: 8.313843876330612, y: 0, vy: -14, H: 8 },
  { params: { u: 10, theta: 90, h: 0, g: 10 }, time: 1, T: 2, x: 0, y: 5, vy: 0, H: 5 },
  { params: { u: 10, theta: -90, h: 20, g: 10 }, time: 1, T: 1.2360679774997896, x: 0, y: 5, vy: -20, H: 20 },
  { params: { u: 20, theta: 45, h: 1.5, g: 9.81 }, time: 1, T: 2.985635322202875, x: 14.142135623730951, y: 10.73713562373095, vy: 4.332135623730949, H: 11.693679918450558 },
  // Regression: the former six-second presentation horizon must not truncate it.
  { params: { u: 30, theta: 90, h: 20, g: .5 }, time: 60, T: 120.6630035524124, x: 0, y: 920, vy: 0, H: 920 }
];
for (const anchor of anchors) {
  const state = checkState(anchor.params, anchor.time);
  for (const key of ['T', 'x', 'y', 'vy', 'H']) near(state[key], anchor[key], `independent reference ${key}`);
}
for (const theta of [-90, -30, 0]) {
  const params = { u: 20, theta, h: 0, g: 9.81 };
  const state = checkState(params, 100);
  near(state.T, 0, 'ground-level non-upward launch has zero airborne time');
  near(state.x, 0, 'zero airborne range');
  near(state.y, 0, 'ground contact stays on the ground');
  near(state.time, 0, 'zero-duration presentation remains at release');
}

// Complementary ranges follow from equal launch/landing heights. They do not
// hold for raised launches, and the shorter flight is not shown in slow motion.
for (const theta of [10, 20, 30, 40]) {
  const low = { u: 20, theta, h: 0, g: 9.81 };
  const high = { ...low, theta: 90 - theta };
  const a = checkState(low, 0), b = checkState(high, 0);
  near(a.R, b.R, 'complementary ranges only at equal launch/landing height');
  assert.ok(b.T > a.T && b.H > a.H, 'higher launch has greater flight time and maximum height');
  const raisedA = checkState({ ...low, h: 1.5 }, 0), raisedB = checkState({ ...high, h: 1.5 }, 0);
  assert.ok(Math.abs(raisedA.R - raisedB.R) > .05, 'raised launch does not preserve complementary ranges');
}

// Every selectable angle, crossed with parameter extremes; all four parameters
// also get a joint bounds/middle sweep. No arbitrary animation duration is used.
const parameterCases = [];
for (let theta = -90; theta <= 90; theta += 1) {
  parameterCases.push({ u: 1, theta, h: 0, g: 20 });
  parameterCases.push({ u: 30, theta, h: 20, g: .5 });
}
for (const u of [1, 20, 30]) for (const theta of [-90, -30, 0, 30, 45, 60, 90]) {
  for (const h of [0, 1.5, 20]) for (const g of [.5, 9.81, 20]) parameterCases.push({ u, theta, h, g });
}
for (const params of parameterCases) {
  const flight = Projectile.flightTime(params);
  let previousX = -1;
  for (const time of [-1, 0, flight / 4, flight / 2, flight, flight + 1]) {
    const state = checkState(params, time);
    assert.ok(state.x + 1e-8 >= previousX, 'horizontal progress never reverses for the supported launch angles');
    previousX = state.x;
  }
  const uy = params.u * Math.sin(params.theta * Math.PI / 180);
  if (uy > 1e-9) {
    const apex = checkState(params, uy / params.g);
    near(apex.vy, 0, 'vertical velocity vanishes at the apex');
    near(apex.y, apex.H, 'apex reaches maximum height');
    near(apex.speed, Math.abs(apex.vx), 'horizontal motion continues at apex');
  }
  // A centred finite difference checks the graph tangent away from clamps.
  if (flight > 1e-6) {
    const middleTime = flight / 2, dt = flight / 10000;
    const before = ProjectileVisual.analyse(params, middleTime - dt);
    const middle = ProjectileVisual.analyse(params, middleTime);
    const after = ProjectileVisual.analyse(params, middleTime + dt);
    near((after.x - before.x) / (2 * dt), middle.vx, 'trajectory horizontal tangent is vx', 1e-7);
    near((after.y - before.y) / (2 * dt), middle.vy, 'trajectory vertical tangent is vy', 1e-7);
    near((after.vx - before.vx) / (2 * dt), 0, 'horizontal acceleration from velocity slope', 1e-7);
    near((after.vy - before.vy) / (2 * dt), -params.g, 'vertical acceleration from velocity slope', 1e-7);
  }
}

function checkFrame(params, time, options = {}) {
  const input = { params, time, duration: Projectile.flightTime(params), result: Projectile.calculate(params, time), runs: [], flags: {}, compact: false, stage: 0, ...options };
  const before = JSON.stringify(input), previousCalls = texCalls.length;
  const output = ProjectileVisual.render(input);
  assert.equal(JSON.stringify(input), before, 'pure renderer does not mutate caller state');
  assert.equal(typeof output.svg, 'string');
  assert.ok(output.svg.length > 100, 'renderer returns a populated SVG scene');
  assert.ok(!/\b(?:NaN|Infinity|undefined)\b/.test(output.svg), `invalid SVG at ${JSON.stringify({ params, time, stage: input.stage, compact: input.compact })}`);
  const box = output.viewBox.trim().split(/[\s,]+/).map(Number);
  assert.ok(box.length === 4 && box.every(Number.isFinite) && box[2] > 0 && box[3] > 0, 'viewBox is finite with positive dimensions');
  assert.equal(typeof output.ariaLabel, 'string');
  assert.ok(output.ariaLabel.length > 20 && !/\b(?:NaN|Infinity|undefined)\b/.test(output.ariaLabel), 'accessible description is meaningful and finite');
  assert.ok(texCalls.length > previousCalls, 'formulae use the shared TeX renderer in every lesson stage');
  frames += 1;
  return output;
}

const xmlFrames = [];
const edgeParams = [...anchors.map(anchor => anchor.params), ...[-90, -30, 0].map(theta => ({ u: 20, theta, h: 0, g: 9.81 })), { u: 1, theta: 89, h: .1, g: 20 }, { u: 30, theta: 1, h: 20, g: .5 }];
for (const params of edgeParams) {
  const T = Projectile.flightTime(params), uy = params.u * Math.sin(params.theta * Math.PI / 180);
  const times = [...new Set([0, T / 2, T, ...(uy > 1e-9 ? [uy / params.g] : [])])];
  for (const time of times) for (const stage of [0, 1, 2, 3, 4]) for (const compact of [false, true]) {
    xmlFrames.push(checkFrame(params, time, { stage, compact }));
  }
}
const runs = [
  { params: { u: 20, theta: 30, h: 0, g: 9.81 }, label: 'Run A' },
  { params: { u: 20, theta: 60, h: 0, g: 9.81 }, label: 'Run <B> & comparison' },
  { params: { u: 30, theta: 90, h: 20, g: .5 }, label: 'Run C' },
  { params: { u: 20, theta: -90, h: 0, g: 9.81 }, label: 'Run D' }
].map(run => ({ ...run, T: Projectile.flightTime(run.params) }));
const comparison = checkFrame(anchors[4].params, 1, { runs, stage: 4 });
assert.ok(comparison.svg.includes('Run D'), 'all four saved runs are represented');
assert.ok(!comparison.svg.includes('Run <B>'), 'saved-run labels cannot inject SVG markup');
assert.ok(comparison.svg.includes('Run &lt;B&gt;'), 'saved-run labels retain escaped readable text');
xmlFrames.push(comparison);
for (const components of [false, true]) for (const projections of [false, true]) for (const ghosts of [false, true]) {
  for (const compact of [false, true]) for (const stage of [0, 1, 2, 3, 4]) {
    xmlFrames.push(checkFrame(anchors[4].params, 1, { runs, compact, stage, flags: { components, projections, ghosts } }));
  }
}

// A stale duration/result must not shorten a changed low-gravity trajectory.
const longFlight = anchors[5].params;
const stale = checkFrame(longFlight, 60, { duration: 6, result: Projectile.calculate(anchors[4].params, 1), stage: 4 });
const current = checkFrame(longFlight, 60, { stage: 4 });
assert.equal(stale.svg, current.svg, 'renderer derives its physical trajectory from the current parameters');
xmlFrames.push(stale, current);

function renderedTex(params, stage) {
  const start = texCalls.length;
  xmlFrames.push(checkFrame(params, 0, { stage }));
  return texCalls.slice(start).map(args => args[2]);
}
const verticalTex = renderedTex(anchors[2].params, 3);
assert.ok(verticalTex.some(tex => tex.includes('x(t)=0')), 'vertical launch retains the parametric trajectory');
assert.ok(!verticalTex.some(tex => tex.includes('\\frac{x}{u_x}')), 'vertical trajectory never divides by zero horizontal velocity');
assert.ok(!renderedTex(anchors[4].params, 4).some(tex => tex.includes('\\sin(2\\theta)')), 'raised launch does not present the equal-height range shortcut');
assert.ok(renderedTex({ u: 20, theta: -30, h: 0, g: 9.81 }, 4).some(tex => tex.includes('T=0')), 'zero-duration ground contact is stated explicitly');

// Same scale in each direction preserves the physical shape of a trajectory.
// Use a horizontal launch so the known fall and horizontal range provide two
// independent metre lengths without depending on the renderer's origin.
const shapeFrame = checkFrame(anchors[0].params, anchors[0].T, { stage: 1 });
xmlFrames.push(shapeFrame);
const activePolyline = [...shapeFrame.svg.matchAll(/<polyline\b[^>]*>/g)].find(match => match[0].includes('stroke="#f1f4fa"'));
assert.ok(activePolyline, 'current trajectory is drawn as a separate solid path');
const points = /points="([^"]+)"/.exec(activePolyline[0])[1].split(/\s+/).map(point => point.split(',').map(Number));
const firstPoint = points[0], lastPoint = points.at(-1);
near((lastPoint[0] - firstPoint[0]) / anchors[0].x, (lastPoint[1] - firstPoint[1]) / anchors[0].H, 'horizontal and vertical metres share one scale', 1e-4);
const referenceCurve = frame => [...frame.svg.matchAll(/<polyline\b[^>]*>/g)].find(match => match[0].includes('stroke="#8594aa"'))[0];
const initialFrame = checkFrame(anchors[4].params, 0), elapsedFrame = checkFrame(anchors[4].params, 2);
xmlFrames.push(initialFrame, elapsedFrame);
assert.equal(referenceCurve(initialFrame), referenceCurve(elapsedFrame), 'scrubbing time does not resize the full-flight reference curve');

// Validate the actual authored TeX as well as the DOM-free spy. This catches
// malformed equations in derivations, exam answers, feedback and guide prose.
const katex = require('./vendor/katex/katex.js');
const sceneExpressions = new Set(texCalls.map(args => args[2]));
for (const tex of sceneExpressions) katex.renderToString(tex, { throwOnError: true });
const contentContext = { window: { LESSON_CONTENT: {} } };
vm.createContext(contentContext);
vm.runInContext(fs.readFileSync(require.resolve('./opening-content.js'), 'utf8'), contentContext);
let authoredTexExpressions = 0;
function validateContent(value, key = '') {
  if (Array.isArray(value)) return value.forEach(item => validateContent(item));
  if (value && typeof value === 'object') return Object.entries(value).forEach(([childKey, child]) => validateContent(child, childKey));
  if (typeof value !== 'string') return;
  if (key === 'tex') {
    katex.renderToString(value, { throwOnError: true });
    authoredTexExpressions += 1;
    return;
  }
  const proseWithoutMath = value.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => {
    katex.renderToString(tex, { throwOnError: true });
    authoredTexExpressions += 1;
    return '';
  });
  assert.ok(!/[₀-₉⁰¹²³⁴⁵⁶⁷⁸⁹θπ]/.test(proseWithoutMath), 'projectile mathematical notation in prose uses TeX delimiters');
}
validateContent(contentContext.window.OPENING_GUIDES.projectile);
validateContent(contentContext.window.LESSON_CONTENT.projectile);
assert.ok(authoredTexExpressions >= 50, 'projectile guide, derivation, checkpoint and exam maths are authored in TeX');

const parsed = spawnSync('python3', ['-c', [
  'import json, sys, xml.etree.ElementTree as ET',
  'frames = json.load(sys.stdin)',
  'for frame in frames:',
  '    root = ET.fromstring(\'<svg xmlns="http://www.w3.org/2000/svg" viewBox="\' + frame["viewBox"] + \'">\' + frame["svg"] + \'</svg>\')',
  '    assert len(root) > 0',
  'print(f"Validated {len(frames)} SVG documents")'
].join('\n')], { input: JSON.stringify(xmlFrames), encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 });
assert.equal(parsed.status, 0, parsed.stderr);
console.log(`PASS: ${states} projectile analysis states; ${checks} numerical checks; ${frames} finite TeX-based frames; ${authoredTexExpressions} authored and ${sceneExpressions.size} distinct scene TeX expressions. Flight/contact, signed vertical motion, energy, tangent slopes, vertical/zero-time cases, 120-second low-gravity flight, complementary-angle conditions, isotropic/fixed scales, all five stages/layouts/flags/four runs. ${parsed.stdout.trim()}.`);
