'use strict';
const assert = require('node:assert/strict');
const { calculate, flightTime, model } = require('./projectile.js');
const Physics = require('./models.js');

let checks = 0;
function near(actual, expected, label, relativeTolerance = 1e-10) {
  assert.ok(Number.isFinite(actual), `${label}: non-finite ${actual}`);
  assert.ok(Math.abs(actual - expected) <= relativeTolerance * Math.max(1, Math.abs(expected)),
    `${label}: ${actual} differs from ${expected}`);
  checks++;
}
function finiteState(state, label) {
  for (const [key, value] of Object.entries(state)) {
    assert.ok(Number.isFinite(value), `${label}.${key}: non-finite ${value}`);
    checks++;
  }
}
function assertSamePhysicalState(actual, expected, label) {
  for (const key of ['t', 'x', 'y', 'vx', 'vy', 'v', 'ax', 'ay', 'Kspecific', 'Uspecific']) {
    near(actual[key], expected[key], `${label}.${key}`);
  }
}

// Independently calculated reference states from the inspected projectile example.
const reference = { u: 20, theta: 45, h: 1.5, g: 9.81 };
near(flightTime(reference), 2.985635322202875, 'reference flight time');
const atOne = calculate(reference, 1);
near(atOne.x, 14.142135623730951, 'reference x at 1 s');
near(atOne.y, 10.73713562373095, 'reference y at 1 s');
near(atOne.vx, 14.142135623730951, 'reference vx at 1 s');
near(atOne.vy, 4.332135623730949, 'reference vy at 1 s');
near(atOne.R, 42.22325964959471, 'reference range');

// A horizontal launch and an oblique downward launch have distinct nonzero
// flight times. The latter is easy to check directly: 8 - 6t - 5t² = 0 at t=.8.
const horizontal = { u: 12, theta: 0, h: 5, g: 10 };
near(flightTime(horizontal), 1, 'horizontal launch flight time');
near(calculate(horizontal, 1).R, 12, 'horizontal launch range');
near(calculate(horizontal, 1).vy, -10, 'horizontal launch impact velocity');
const downward = { u: 12, theta: -30, h: 8, g: 10 };
near(flightTime(downward), 0.8, 'downward launch flight time');
near(calculate(downward, 0.8).vy, -14, 'downward launch impact velocity');

// Contact from the ground at a non-upward angle has zero airborne duration.
// This is the initial contact state, not a model of the post-impact motion.
for (const theta of [-90, -30, 0]) {
  const p = { u: 20, theta, h: 0, g: 9.81 };
  assert.equal(flightTime(p), 0, `ground launch ${theta}° has T=0`);
  const contact = calculate(p, 0);
  finiteState(contact, `ground launch ${theta}°`);
  near(contact.x, 0, 'zero flight range');
  near(contact.y, 0, 'zero flight height');
  assertSamePhysicalState(calculate(p, 100), contact, 'zero-duration clamp');
}

// A vertical upward throw returns to the launch height after 2 s; gravity
// continues to act at the apex even though the vertical velocity is zero.
const vertical = { u: 10, theta: 90, h: 0, g: 10 };
near(flightTime(vertical), 2, 'vertical throw flight time');
near(calculate(vertical, 1).y, 5, 'vertical apex height');
near(calculate(vertical, 1).vy, 0, 'vertical apex vertical velocity');
near(calculate(vertical, 1).ay, -10, 'nonzero apex acceleration');
near(calculate(vertical, 2).x, 0, 'vertical throw has no horizontal range');

// Complementary launch angles have equal ranges only at equal launch and
// landing heights. Preserve the condition instead of teaching a universal rule.
const low = { u: 20, theta: 30, h: 0, g: 9.81 };
const high = { ...low, theta: 60 };
near(calculate(low, 0).R, 35.311943069701876, '30° ground-level range');
near(calculate(low, 0).R, calculate(high, 0).R, 'complementary equal-height ranges');
assert.ok(flightTime(high) > flightTime(low), 'higher angle has longer flight time');
assert.ok(calculate(high, 0).H > calculate(low, 0).H, 'higher angle has greater maximum height');
assert.ok(Math.abs(calculate({ ...low, h: 1.5 }, 0).R - calculate({ ...high, h: 1.5 }, 0).R) > 0.1,
  'raised launches do not retain complementary equal ranges');

// The rationalised root must not cancel to zero for a very small positive
// height and a fast downward launch. This catches a numerically unstable root.
const smallHeight = { u: 30, theta: -90, h: 1e-12, g: 9.81 };
assert.ok(flightTime(smallHeight) > 0, 'tiny-height downward flight time remains positive');
assert.ok(Math.abs(flightTime(smallHeight) / (smallHeight.h / 30) - 1) < 1e-10,
  'tiny-height downward flight time approaches height / downward speed');

// Exercise independent physical invariants across the full UI parameter bounds,
// including below-horizontal, horizontal, vertical and zero-duration cases.
let states = 0;
for (const u of [1, 20, 30]) for (const theta of [-90, -30, 0, 30, 45, 90]) {
  for (const h of [0, 1.5, 20]) for (const g of [0.5, 9.81, 20]) {
    const p = { u, theta, h, g }, T = flightTime(p), E = 0.5 * u * u + g * h;
    assert.ok(Number.isFinite(T) && T >= 0, 'flight time must be finite and nonnegative');
    const initial = calculate(p, 0), final = calculate(p, T);
    assertSamePhysicalState(calculate(p, -1), initial, 'negative-time clamp');
    assertSamePhysicalState(calculate(p, T + 1), final, 'post-contact clamp');
    near(final.y, 0, 'landing is on the ground');
    near(final.x, final.R, 'landing coordinate equals range');
    near(final.v * final.v, u * u + 2 * g * h, 'impact speed from energy conservation');
    assert.ok(final.vy <= 1e-9, 'first ground contact is not ascending');
    for (const t of [0, T / 4, T / 2, T]) {
      const state = calculate(p, t);
      finiteState(state, 'parameter sweep');
      near(state.Kspecific + state.Uspecific, E, 'specific mechanical energy is conserved');
      near(state.vx, initial.vx, 'horizontal velocity is constant');
      near(state.ax, 0, 'horizontal acceleration is zero');
      near(state.ay, -g, 'vertical acceleration is downward');
      near(state.v * state.v, state.vx * state.vx + state.vy * state.vy, 'speed is component magnitude');
      assert.ok(state.y >= 0 && state.y <= state.H + 1e-8, 'height remains within ground and maximum');
      states++;
    }
  }
}

// There is no mass in the no-drag trajectory. Energies are per unit mass.
assert.ok(!model.controls.some(control => control.key === 'm' || control.key === 'mass'),
  'mass must not be a trajectory control in the no-drag model');
assert.ok(model.controls.find(control => control.key === 'g').min > 0,
  'gravity control must exclude the g=0 singularity of the landing formula');
assertSamePhysicalState(calculate({ ...reference, mass: 1 }, 1), calculate({ ...reference, mass: 10 }, 1),
  'adding a mass value does not change the trajectory');

// Early-lesson special cases used by event jumping and component comparison.
const turning = Physics.calc('displacement', { u: 4, a: -1 }, 4);
near(turning.v, 0, 'turning event velocity');
near(turning.s, 8, 'turning event displacement');
near(Physics.calc('displacement', { u: 4, a: -1 }, 6).s, 6, 'after-turn signed displacement');
near(Physics.calc('motion', { u: 2, a: 0 }, 6).v, 2, 'zero-acceleration constant velocity');
near(Physics.calc('motion', { u: 2, a: 0 }, 6).s, 12, 'zero-acceleration displacement');
const cancelled = Physics.calc('vectors', { F: 6, angle: 0, B: 6, beta: 180 }, 1);
near(cancelled.R, 0, 'opposite forces cancel');
near(cancelled.rx, 0, 'cancelled horizontal component');
near(cancelled.ry, 0, 'cancelled vertical component');
// Direction is deliberately not asserted at zero magnitude: it is undefined
// and every readout/comparison should suppress the numeric atan2 placeholder.

console.log(`PASS: ${states} projectile states; ${checks} numerical checks; ground contact, clamping, apex, complementary angles, energy, mass independence and early-lesson edges.`);
