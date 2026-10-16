'use strict';

// Independent checks of direct force manipulation. Changing the resultant is
// underdetermined until either A or B is held fixed; the selected force stays
// unchanged, and the other force is recovered from signed x/y differences.
const assert = require('node:assert/strict');
const Drag = require('./force-drag-model.js');
const rad = Math.PI / 180;
let cases = 0, checks = 0;
const near = (actual, expected, label, tolerance = 1e-9) => {
  assert.ok(Number.isFinite(actual), `${label} is finite`);
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${label}: ${actual} != ${expected}`);
  checks++;
};
const xy = p => {
  const ax = p.F * Math.cos(p.angle * rad), ay = p.F * Math.sin(p.angle * rad);
  const bx = p.B * Math.cos(p.beta * rad), by = p.B * Math.sin(p.beta * rad);
  return { ax, ay, bx, by, rx: ax + bx, ry: ay + by };
};
const anchor = { F: 6, angle: 0, B: 8, beta: 90 };
const independentComponents = Drag.components(anchor);
for (const [key, expected] of Object.entries({ ax: 6, ay: 0, bx: 0, by: 8, rx: 6, ry: 8 })) near(independentComponents[key], expected, `shared signed x/y API ${key}`);
assert.throws(() => Drag.moveForce(anchor, 'unsupported', { x: 0, y: 0 }), TypeError, 'unknown handles cannot alter a force');
const sanitised = Drag.moveForce({ F: -12, angle: -999, B: 300, beta: 999 }, 'A', { x: 6, y: 8 });
near(sanitised.params.F, 10, 'invalid source force is replaced by the actual dragged length');
near(sanitised.params.B, 100, 'held magnitude is bounded');
near(sanitised.params.beta, 180, 'held angle is bounded');
const invalidPoint = Drag.moveForce(anchor, 'A', { x: Infinity, y: NaN });
near(invalidPoint.point.x, 0, 'nonfinite pointer x cannot contaminate geometry');
near(invalidPoint.point.y, 0, 'nonfinite pointer y cannot contaminate geometry');
function move(params, target, point, hold = 'A') {
  const original = JSON.stringify({ params, point });
  const result = Drag.moveForce(params, target, point, hold);
  assert.equal(JSON.stringify({ params, point }), original, 'drag calculation does not mutate input');
  for (const key of ['F', 'angle', 'B', 'beta']) assert.ok(Number.isFinite(result.params[key]), `${key} is finite`);
  assert.ok(result.params.F >= 0 && result.params.F <= 100 + 1e-10);
  assert.ok(result.params.B >= 0 && result.params.B <= 100 + 1e-10);
  assert.ok(result.params.angle >= -180 && result.params.angle <= 180);
  assert.ok(result.params.beta >= -180 && result.params.beta <= 180);
  assert.equal(typeof result.limited, 'boolean');
  const c = xy(result.params);
  if (target === 'A' || target === 'R' && hold === 'B') {
    near(result.params.B, params.B, 'held B magnitude');
    near(result.params.beta, params.beta, 'held B angle');
  } else {
    near(result.params.F, params.F, 'held A magnitude');
    near(result.params.angle, params.angle, 'held A angle');
  }
  near(result.point.x, target === 'A' ? c.ax : target === 'B' ? c.bx : c.rx, 'returned actual x endpoint');
  near(result.point.y, target === 'A' ? c.ay : target === 'B' ? c.by : c.ry, 'returned actual y endpoint');
  cases++;
  return result;
}

let r = move(anchor, 'A', { x: -3, y: 4 });
near(r.params.F, 5, '3-4-5 force A');
near(r.params.angle, 126.86989764584402, 'force A points into second quadrant');
near(xy(r.params).rx, -3, 'moving A recalculates resultant x');
near(xy(r.params).ry, 12, 'moving A recalculates resultant y');
assert.equal(r.limited, false);
r = move(anchor, 'B', { x: 12, y: -5 });
near(r.params.B, 13, '5-12-13 force B');
near(r.params.beta, -22.619864948040426, 'force B points into fourth quadrant');
near(xy(r.params).rx, 18, 'moving B recalculates resultant x');
near(xy(r.params).ry, -5, 'moving B recalculates resultant y');
assert.equal(r.limited, false);
r = move(anchor, 'R', { x: -2, y: 5 });
near(xy(r.params).bx, -8, 'inverse x subtraction with A held');
near(xy(r.params).by, 5, 'inverse y subtraction with A held');
near(r.params.B, Math.sqrt(89), 'inverse force B magnitude');
near(xy(r.params).rx, -2, 'requested resultant x is recovered');
near(xy(r.params).ry, 5, 'requested resultant y is recovered');
r = move(anchor, 'R', { x: -2, y: 5 }, 'B');
near(xy(r.params).ax, -2, 'inverse x subtraction with B held');
near(xy(r.params).ay, -3, 'inverse y subtraction with B held');
near(r.params.F, Math.sqrt(13), 'inverse force A magnitude');
near(xy(r.params).rx, -2, 'held B requested resultant x');
near(xy(r.params).ry, 5, 'held B requested resultant y');

for (const [target, point, hold, expected] of [
  ['A', { x: 300, y: 400 }, 'A', { x: 60, y: 80 }],
  ['B', { x: -300, y: 400 }, 'A', { x: -60, y: 80 }],
  ['R', { x: 306, y: 400 }, 'A', { x: 66, y: 80 }],
  ['R', { x: 300, y: 408 }, 'B', { x: 60, y: 88 }]
]) {
  const result = move(anchor, target, point, hold);
  assert.equal(result.limited, true, 'out-of-bound target reports the physical parameter limit');
  near(result.point.x, expected.x, 'closest reachable point x');
  near(result.point.y, expected.y, 'closest reachable point y');
}

// A zero force has no angle; retain its previous control value so the next
// nonzero drag is stable, without manufacturing an atan2(0,0) direction.
for (const initialAngle of [-180, -123.25, 0, 35, 180]) {
  const p = { F: 20, angle: initialAngle, B: 30, beta: -46.25 };
  const a = move(p, 'A', { x: 0, y: 0 });
  near(a.params.F, 0, 'zero A magnitude');
  near(a.params.angle, initialAngle, 'zero A preserves prior angle');
  const b = move(p, 'B', { x: 0, y: 0 });
  near(b.params.B, 0, 'zero B magnitude');
  near(b.params.beta, p.beta, 'zero B preserves prior angle');
  const before = xy(p);
  const rb = move(p, 'R', { x: before.ax, y: before.ay }, 'A');
  near(rb.params.B, 0, 'resultant at A makes B zero');
  near(rb.params.beta, p.beta, 'inverse zero B preserves prior angle');
  const ra = move(p, 'R', { x: before.bx, y: before.by }, 'B');
  near(ra.params.F, 0, 'resultant at B makes A zero');
  near(ra.params.angle, initialAngle, 'inverse zero A preserves prior angle');
}

// Bounded endpoint grid checks use an independent radial projection around the
// unchanged force. The same calculation covers all four quadrants and all
// choices of the held force; axis-aligned targets avoid fragile atan checks.
for (const params of [anchor, { F: 100, angle: -135, B: 0, beta: 165 }, { F: 0, angle: 40, B: 100, beta: 120 }]) {
  const initial = xy(params);
  for (const target of ['A', 'B', 'R']) for (const hold of target === 'R' ? ['A', 'B'] : ['A']) {
    const centre = target !== 'R' ? { x: 0, y: 0 } : hold === 'A' ? { x: initial.ax, y: initial.ay } : { x: initial.bx, y: initial.by };
    for (const x of [-300, -100, -40, 0, 3, 80, 100, 400]) for (const y of [-400, -100, -8, 0, 4, 60, 100, 300]) {
      const dx = x - centre.x, dy = y - centre.y, distance = Math.hypot(dx, dy), ratio = Math.min(1, 100 / (distance || 1));
      const result = move(params, target, { x, y }, hold);
      near(result.point.x, centre.x + dx * ratio, 'radial boundary x');
      near(result.point.y, centre.y + dy * ratio, 'radial boundary y');
      assert.equal(result.limited, distance > 100 + 1e-8, 'limit is reported only for an unreachable point');
      const repeat = Drag.moveForce(result.params, target, result.point, hold);
      near(repeat.point.x, result.point.x, 'dragging to current endpoint is stable in x');
      near(repeat.point.y, result.point.y, 'dragging to current endpoint is stable in y');
    }
  }
}
console.log(`PASS: ${cases} direct-force/inverse-resultant cases; ${checks} numerical checks. Signed x/y reconstruction, either held force, all quadrants, 100 N nearest reachable boundary, zero-angle preservation, input purity and stable endpoint repetition.`);
