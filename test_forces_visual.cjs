'use strict';

// Independent vector geometry and authored TeX checks for the live lesson.
// Construction progress is not physical time; the applied forces stay fixed.
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const texCalls = [];
global.PhysicsVisualMath = {
  svgMath(...args) {
    texCalls.push(args);
    return `<g data-tex="${esc(JSON.stringify(args))}"/>`;
  }
};
const ForcesVisual = require('./forces-visual.js');
const Physics = require('./models.js');
const rad = Math.PI / 180;
let states = 0, checks = 0, frames = 0;
const near = (actual, expected, label, tol = 1e-9) => {
  assert.ok(Number.isFinite(actual), `${label}: non-finite ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), `${label}: ${actual} differs from ${expected}`);
  checks += 1;
};
function checkState(params, progress) {
  const state = ForcesVisual.analyse(params, progress);
  for (const [key, value] of Object.entries(state)) if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `finite ${key}`);
    checks += 1;
  }
  const ax = params.F * Math.cos(params.angle * rad), ay = params.F * Math.sin(params.angle * rad);
  const bx = params.B * Math.cos(params.beta * rad), by = params.B * Math.sin(params.beta * rad);
  near(state.ax, ax, 'A horizontal signed component');
  near(state.ay, ay, 'A vertical signed component');
  near(state.bx, bx, 'B horizontal signed component');
  near(state.by, by, 'B vertical signed component');
  near(state.rx, ax + bx, 'head-to-tail horizontal endpoint');
  near(state.ry, ay + by, 'head-to-tail vertical endpoint');
  near(state.R, Math.hypot(ax + bx, ay + by), 'resultant length', 1e-8);
  near(state.ax * state.ax + state.ay * state.ay, params.F * params.F, 'resolving A preserves length');
  near(state.bx * state.bx + state.by * state.by, params.B * params.B, 'resolving B preserves length');
  // The cosine rule is independent of summing the Cartesian coordinates above.
  near(state.R * state.R, params.F * params.F + params.B * params.B + 2 * params.F * params.B * Math.cos((params.angle - params.beta) * rad), 'cosine-rule resultant', 1e-8);
  assert.ok(state.R >= Math.abs(params.F - params.B) - 1e-8, 'reverse triangle bound');
  assert.ok(state.R <= params.F + params.B + 1e-8, 'triangle upper bound');
  near(state.progress, Math.max(0, Math.min(1, progress)), 'construction progress clamp');
  if (state.R > 1e-8) {
    near(state.R * Math.cos(state.theta * rad), state.rx, 'direction recovers signed horizontal component', 1e-8);
    near(state.R * Math.sin(state.theta * rad), state.ry, 'direction recovers signed vertical component', 1e-8);
    assert.equal(state.zeroResultant, false);
    const model = Physics.calc('vectors', params, 0);
    near(((state.theta - model.theta + 540) % 360) - 180, 0, 'model direction agrees modulo a full turn', 1e-8);
  } else {
    assert.equal(state.theta, null, 'a zero-length resultant has no numerical direction');
    assert.equal(state.zeroResultant, true);
  }
  for (const key of ['ax', 'ay', 'bx', 'by', 'rx', 'ry', 'R']) {
    near(state[key], Physics.calc('vectors', params, 0)[key], `analytical model agreement: ${key}`, 1e-8);
  }
  // A reverse resultant is the equilibrant; this states force balance only.
  near(state.ax + state.bx - state.rx, 0, 'equilibrant horizontal balance');
  near(state.ay + state.by - state.ry, 0, 'equilibrant vertical balance');
  states += 1;
  return state;
}
const anchor = { F: 6, angle: 0, B: 8, beta: 90 };
const rightAngle = checkState(anchor, .5);
near(rightAngle.rx, 6, 'independent 6 east reference');
near(rightAngle.ry, 8, 'independent 8 north reference');
near(rightAngle.R, 10, 'independent 6-8-10 triangle');
near(rightAngle.theta, 53.13010235415598, 'independent direction north of east');
for (const angle of [-180, -135, -90, -45, 0]) {
  const opposite = checkState({ F: 50, angle, B: 50, beta: angle + 180 }, 1);
  near(opposite.R, 0, 'equal opposite cancellation');
  assert.equal(opposite.theta, null);
}
for (const [params, expected] of [
  [{ F: 6, angle: 180, B: 8, beta: 90 }, 126.86989764584402],
  [{ F: 6, angle: -180, B: 8, beta: -90 }, -126.86989764584402],
  [{ F: 6, angle: 0, B: 8, beta: -90 }, -53.13010235415598],
  [{ F: 0, angle: 123, B: 8, beta: -90 }, -90],
  [{ F: 6, angle: 180, B: 0, beta: -145 }, 180]
]) near(checkState(params, 1).theta, expected, 'independent axis/quadrant direction');
assert.equal(checkState({ F: 0, angle: 0, B: 0, beta: 90 }, 0).theta, null);
near(checkState({ F: 25, angle: 35, B: 75, beta: 35 }, 0).R, 100, 'same-direction forces add magnitudes');
near(checkState({ F: 75, angle: 0, B: 25, beta: 180 }, 0).R, 50, 'opposite unequal forces subtract magnitudes');

// All selectable angles, combined with zero/nonzero and opposite-direction cases.
const parameterCases = [];
for (let angle = -180; angle <= 180; angle++) {
  parameterCases.push({ F: 0, angle, B: 100, beta: -angle });
  parameterCases.push({ F: 100, angle, B: 100, beta: angle > 0 ? angle - 180 : angle + 180 });
}
for (const F of [0, 1, 6, 50, 100]) for (const B of [0, 1, 8, 50, 100]) {
  for (const angle of [-180, -90, -35, 0, 35, 90, 180]) for (const beta of [-180, -90, -20, 0, 45, 90, 180]) parameterCases.push({ F, angle, B, beta });
}
for (const params of parameterCases) {
  const initial = checkState(params, -.5);
  for (const progress of [0, .25, .5, 1, 1.5]) {
    const current = checkState(params, progress);
    for (const key of ['ax', 'ay', 'bx', 'by', 'rx', 'ry', 'R']) near(current[key], initial[key], `construction does not change ${key}`);
    assert.equal(current.theta, initial.theta, 'construction does not rotate the resultant');
  }
  const swapped = ForcesVisual.analyse({ F: params.B, angle: params.beta, B: params.F, beta: params.angle }, .5);
  near(swapped.rx, initial.rx, 'vector addition commutes horizontally');
  near(swapped.ry, initial.ry, 'vector addition commutes vertically');
  near(swapped.R, initial.R, 'addition order does not change magnitude');
  // Rotate both physical vectors by a quarter turn. The coordinate transform
  // is checked directly, rather than simply recomputing atan2.
  const turn = angle => angle > 90 ? angle - 270 : angle + 90;
  const rotated = ForcesVisual.analyse({ ...params, angle: turn(params.angle), beta: turn(params.beta) }, .5);
  near(rotated.rx, -initial.ry, 'quarter turn maps x to minus y', 1e-8);
  near(rotated.ry, initial.rx, 'quarter turn maps y to x', 1e-8);
  near(rotated.R, initial.R, 'rotation preserves resultant magnitude', 1e-8);
}

const xmlFrames = [];
function checkFrame(params, progress, options = {}) {
  const input = { params, time: progress, duration: 1, runs: [], flags: {}, compact: false, stage: 0, ...options };
  const before = JSON.stringify(input), start = texCalls.length;
  const output = ForcesVisual.render(input);
  assert.equal(JSON.stringify(input), before, 'renderer is pure and does not mutate inputs');
  assert.ok(typeof output.svg === 'string' && output.svg.length > 100);
  assert.ok(!/\b(?:NaN|Infinity)\b/.test(output.svg), 'finite SVG geometry and labels');
  const box = output.viewBox.trim().split(/[\s,]+/).map(Number);
  assert.ok(box.length === 4 && box.every(Number.isFinite) && box[2] > 0 && box[3] > 0);
  assert.ok(typeof output.ariaLabel === 'string' && output.ariaLabel.length > 30);
  assert.ok(!/\b(?:NaN|Infinity)\b/.test(output.ariaLabel));
  assert.ok(texCalls.length > start, 'each stage calls the real shared TeX-label interface');
  assert.ok(Number.isFinite(output.scale) && output.scale > 0, 'one scale in pixels per newton');
  assert.ok(output.origin && Number.isFinite(output.origin.x) && Number.isFinite(output.origin.y));
  assert.ok(output.plotBounds && output.plotBounds.width > 0 && output.plotBounds.height > 0);
  assert.deepEqual(output.camera, { scale: output.scale, origin: output.origin, plotBounds: output.plotBounds }, 'dragging can freeze the exact force camera');
  // All three endpoints are directly operable in every construction view,
  // including progress zero. Coordinates are final forces, not partial traces.
  const stateForHandles = ForcesVisual.analyse(params, progress);
  for (const [name, x, y] of [['A', stateForHandles.ax, stateForHandles.ay], ['B', stateForHandles.bx, stateForHandles.by], ['R', stateForHandles.rx, stateForHandles.ry]]) {
    const handle = [...output.svg.matchAll(/<g\b[^>]*>/g)].find(match => match[0].includes(`data-force-handle="${name}"`));
    assert.ok(handle, `${name} has a direct manipulation handle`);
    assert.ok(/tabindex="0"/.test(handle[0]), `${name} handle is keyboard reachable`);
    assert.ok(/role="button"/.test(handle[0]), `${name} handle has an interactive role`);
    const attribute = key => Number(handle[0].match(new RegExp(`${key}="([^"]+)"`))[1]);
    near(attribute('data-force-x'), x, `${name} handle signed x force`, .001);
    near(attribute('data-force-y'), y, `${name} handle signed y force`, .001);
    near(attribute('data-handle-x'), output.origin.x + x * output.scale, `${name} handle drawn x endpoint`, .001);
    near(attribute('data-handle-y'), output.origin.y - y * output.scale, `${name} handle drawn y endpoint`, .001);
    checks += 3;
  }
  const b = output.plotBounds, o = output.origin, s = ForcesVisual.analyse(params, progress);
  // Read the actual SVG geometry, independent of the returned scale metadata.
  // This catches accidental unequal x/y transforms and vector distortion.
  function drawnForce(name) {
    const tag = [...output.svg.matchAll(/<g\b[^>]*>/g)].find(match => match[0].includes(`data-force="${name}"`));
    assert.ok(tag, `drawn ${name} vector geometry is inspectable`);
    return Object.fromEntries([...tag[0].matchAll(/data-(start-x|start-y|end-x|end-y)="([^"]+)"/g)].map(match => [match[1], Number(match[2])]));
  }
  for (const [name, dx, dy] of [['A-outline',s.ax,s.ay],['B-outline',s.bx,s.by],...(input.stage===3?[['B-translating',s.bx,s.by]]:[])]) {
    const g = drawnForce(name);
    assert.ok(Math.abs(g['end-x']-g['start-x']-dx*output.scale)<.002, `${name} actual horizontal pixels use shared scale`);
    assert.ok(Math.abs(g['end-y']-g['start-y']+dy*output.scale)<.002, `${name} actual vertical pixels use shared scale`);
    checks+=2;
  }
  if (input.stage===3) {
    const g=drawnForce('B-translating'), q=s.progress*s.progress*(3-2*s.progress);
    assert.ok(Math.abs(g['start-x']-o.x-s.ax*q*output.scale)<.002, 'B tail translates towards A head horizontally');
    assert.ok(Math.abs(g['start-y']-o.y+s.ay*q*output.scale)<.002, 'B tail translates towards A head vertically');
    checks+=2;
  }
  for (const [x, y] of [[0,0],[s.ax,s.ay],[s.bx,s.by],[s.rx,s.ry]]) {
    const px = o.x + output.scale * x, py = o.y - output.scale * y;
    assert.ok(px >= b.x - 1e-6 && px <= b.x + b.width + 1e-6, 'all actual vector endpoints fit horizontally');
    assert.ok(py >= b.y - 1e-6 && py <= b.y + b.height + 1e-6, 'all actual vector endpoints fit vertically');
  }
  frames += 1;
  xmlFrames.push(output);
  return output;
}
const edgeParams = [anchor,
  { F: 0, angle: -180, B: 0, beta: 180 },
  { F: 100, angle: 0, B: 100, beta: 180 },
  { F: 100, angle: 180, B: 100, beta: -90 },
  { F: 100, angle: 90, B: 100, beta: 0 },
  { F: 100, angle: -135, B: 100, beta: 135 },
  { F: 0, angle: 35, B: 8, beta: -90 },
  { F: 6, angle: 180, B: 0, beta: -20 }
];
for (const params of edgeParams) for (const compact of [false, true]) for (const stage of [0,1,2,3,4]) {
  let scale = null, origin = null;
  for (const progress of [0,.25,.5,.75,1]) {
    const frame = checkFrame(params, progress, { compact, stage });
    if (scale !== null) {
      near(frame.scale, scale, 'scrubbing construction does not resize the force scale');
      assert.deepEqual(frame.origin, origin, 'scrubbing does not move the coordinate origin');
    }
    scale = frame.scale; origin = frame.origin;
  }
}
const runs = [
  {params:anchor,label:'Run A'},
  {params:edgeParams[2],label:'Run <B> & comparison'},
  {params:edgeParams[3],label:'Run C'},
  {params:edgeParams[4],label:'Run D'}
];
for (const components of [false,true]) for (const projections of [false,true]) for (const ghosts of [false,true]) {
  for (const compact of [false,true]) for (const stage of [0,1,2,3,4]) checkFrame(anchor,.7,{runs,compact,stage,flags:{components,projections,ghosts}});
}
const labels = checkFrame(anchor,1,{runs});
assert.ok(labels.svg.includes('Run D'), 'four saved comparisons are represented');
assert.ok(!labels.svg.includes('Run <B>'), 'run labels cannot inject SVG markup');
assert.ok(labels.svg.includes('Run &lt;B&gt;'), 'run labels retain escaped text');
const initialCamera = ForcesVisual.render({params:anchor,time:1,duration:1,stage:4}).camera;
const movingFrame = ForcesVisual.render({params:{F:40,angle:155,B:8,beta:90},time:1,duration:1,stage:4,camera:initialCamera});
near(movingFrame.scale, initialCamera.scale, 'pointer movement freezes force scale');
assert.deepEqual(movingFrame.origin, initialCamera.origin, 'pointer movement freezes origin');
assert.deepEqual(movingFrame.plotBounds, initialCamera.plotBounds, 'pointer movement freezes plot area');
const staticFrame = ForcesVisual.render({params:anchor,time:1,duration:1,stage:4,interactive:false});
assert.ok(!/data-force-handle=/.test(staticFrame.svg), 'noninteractive previews can suppress drag controls');

// The default classroom playground may hide calculation panels while keeping
// exactly the same forces available to drag. Its quiet X/Y arrows identify
// components without displaying equations or turning them into extra forces.
let cleanFrames = 0;
for (const params of edgeParams) for (const compact of [false, true]) {
  let camera = null;
  for (const stage of [0,1,2,3,4]) for (const progress of [0,.5,1]) {
    const before = texCalls.length;
    const output = ForcesVisual.render({params,time:progress,duration:1,stage,compact,showWorking:false,runs:[],flags:{}});
    const state = ForcesVisual.analyse(params);
    assert.equal(output.viewBox, `0 0 ${compact ? 460 : 900} 560`, 'clean mode uses the large force playground');
    assert.ok(output.svg.includes('data-show-working="false"'));
    assert.ok(!output.svg.includes('X AND Y COMPONENTS'), 'clean mode hides the numerical component strip');
    assert.ok(!output.svg.includes('One force, two one-dimensional parts.'), 'clean mode hides derivation panels');
    for (const call of texCalls.slice(before)) assert.match(call[2], /^F_\{[AB][xy]\}$/, 'clean mode labels only the quiet component arrows');
    for (const [name, x, y] of [['A', state.ax, state.ay], ['B', state.bx, state.by], ['R', state.rx, state.ry]]) {
      const match = output.svg.match(new RegExp(`<g data-force="${name}-outline"[^>]*>`));
      assert.ok(match, `${name} force stays complete at every construction progress`);
      const value = key => Number(match[0].match(new RegExp(`data-${key}="([^"]+)"`))[1]);
      near(value('end-x') - value('start-x'), x * output.scale, `clean ${name} complete horizontal force`, .001);
      near(value('end-y') - value('start-y'), -y * output.scale, `clean ${name} complete vertical force`, .001);
      assert.ok(output.svg.includes(`data-force-handle="${name}"`), `${name} remains directly interactive`);
    }
    for (const name of ['A','B']) for (const direction of ['x','y']) {
      const match = output.svg.match(new RegExp(`<g data-force="${name}-${direction}-helper"[^>]*>\\s*<(?:g|circle)\\b[^>]*opacity="([^"]+)"`));
      assert.ok(match && Number(match[1]) < .4, 'component helpers remain quieter than the actual force arrows');
    }
    if (camera) assert.deepEqual(output.camera, camera, 'clean construction stages/progress never alter the force camera');
    camera = output.camera;
    xmlFrames.push(output); frames++; cleanFrames++;
  }
}

const katex = require('./vendor/katex/katex.js');
const sceneTex = new Set(texCalls.map(args=>args[2]));
const beginnerNotation = tex => {
  assert.ok(!/\\(?:vec|overrightarrow|hat)\b|\\begin\{(?:p|b|B|v|V)?matrix\}|\\mathbf\s*\{[ij]\}/.test(tex), `beginner lesson uses scalar x/y equations instead of abstract vector notation: ${tex}`);
};
for (const tex of sceneTex) {katex.renderToString(tex,{throwOnError:true});beginnerNotation(tex);}
const context = {window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(require.resolve('./content.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(require.resolve('./opening-content.js'),'utf8'),context);
let authoredTex = 0;
function validateWritten(value,key='') {
  if(Array.isArray(value)) return value.forEach(item=>validateWritten(item));
  if(value && typeof value==='object') return Object.entries(value).forEach(([k,v])=>validateWritten(v,k));
  if(typeof value!=='string') return;
  if(key==='tex') {katex.renderToString(value,{throwOnError:true});beginnerNotation(value);authoredTex++;return;}
  const prose=value.replace(/\\\(([\s\S]*?)\\\)/g,(_,tex)=>{katex.renderToString(tex,{throwOnError:true});beginnerNotation(tex);authoredTex++;return '';});
  assert.ok(!/[₀-₉⁰¹²³⁴⁵⁶⁷⁸⁹θαβπ√]/.test(prose), `mathematical prose uses TeX: ${prose}`);
}
validateWritten(context.window.LESSON_CONTENT.vectors);
validateWritten(context.window.OPENING_GUIDES.vectors);
assert.ok(authoredTex >= 35, 'derivation/checkpoint/answers/guide all use authored TeX');
// Re-render one scene with actual KaTeX rather than the spy and parse its XHTML.
global.PhysicsVisualMath = require('./visual-math.js');
const actual = ForcesVisual.render({params:anchor,time:1,duration:1,stage:4});
assert.ok(actual.svg.includes('katex'), 'live mathematical labels contain actual typeset KaTeX');
xmlFrames.push(actual);
const parsed = spawnSync('python3',['-c',[
  'import json,sys,xml.etree.ElementTree as ET',
  'frames=json.load(sys.stdin)',
  'for frame in frames:',
  '    root=ET.fromstring(\'<svg xmlns="http://www.w3.org/2000/svg" viewBox="\'+frame["viewBox"]+\'">\'+frame["svg"]+\'</svg>\')',
  '    assert len(root)>0',
  'print(f"Validated {len(frames)} SVG documents")'
].join('\n')],{input:JSON.stringify(xmlFrames),encoding:'utf8',maxBuffer:2*1024*1024});
assert.equal(parsed.status,0,parsed.stderr);
console.log(`PASS: ${states} force analysis states; ${checks} numerical checks; ${frames} finite TeX-based frames (${cleanFrames} clean playground frames); ${authoredTex} authored / ${sceneTex.size} distinct scene TeX expressions. Full angle and magnitude bounds, four quadrants, zero/opposite/single force, cosine rule, triangle inequality, commutativity, rotation, progress invariance, equal/fixed scale, all stages/layouts/flags and four runs. ${parsed.stdout.trim()}.`);
