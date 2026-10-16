'use strict';

// Independent physical checks. The speed-dependent implementation is private
// to the animation: no drag-law calculation is part of the student lesson.
const assert = require('node:assert/strict');
const Physics = require('./models.js');
const Terminal = require('./terminal-model.js');
const g = 9.81;
let states = 0, checks = 0;
const near = (actual, expected, label, tolerance = 1e-5) => {
  assert.ok(Number.isFinite(actual), `${label}: nonfinite value ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${label}: ${actual} differs from ${expected}`);
  checks++;
};
const reference = {m:75,body:2,canopy:1,open:20,deploy:1};
function finiteState(p, t) {
  const before = JSON.stringify(p), r = Terminal.state(p, t);
  assert.equal(JSON.stringify(p), before, 'calculating a state does not mutate parameters');
  for (const key of ['t','v','s','a','weight','drag','net','resultant','openingFraction','T','terminalBefore','terminalAfter','terminalCurrent','openTime','openingDuration','m']) {
    assert.ok(Number.isFinite(r[key]), `finite ${key} at ${t}`); checks++;
  }
  assert.ok(r.t >= 0 && r.t <= 60, 'time is clamped to the displayed experiment');
  assert.ok(r.v >= -1e-10 && r.s >= -1e-10, 'the object keeps descending and displacement is nonnegative');
  assert.ok(r.drag >= -1e-10, 'drag arrow points upward while motion is downward');
  assert.ok(r.openingFraction >= 0 && r.openingFraction <= 1, 'canopy fraction is bounded');
  near(r.weight, r.m*g, 'weight is mass times the fixed gravitational field');
  near(r.net, r.weight-r.drag, 'signed force resultant', 1e-9);
  near(r.resultant, r.net, 'resultant alias uses the same downward-positive sign', 1e-9);
  near(r.m*r.a, r.net, 'Newton force balance', 1e-9);
  near(r.T, 60, 'complete timeline lasts sixty seconds', 1e-12);
  assert.ok(typeof r.phase === 'string' && typeof r.status === 'string', 'states provide a qualitative observation');
  states++;
  return r;
}

const release = finiteState(reference, 0);
near(release.v,0,'released from rest',1e-12);
near(release.s,0,'release displacement',1e-12);
near(release.drag,0,'no drag at release in still air',1e-12);
near(release.a,g,'release acceleration is g',1e-12);
near(release.openingFraction,0,'parachute initially closed',1e-12);
near(release.terminalBefore,52.201532544552755,'independent initial limiting speed',1e-9);
near(release.terminalAfter,6.345938540562076,'independent open-canopy limiting speed',1e-8);

// Closed-canopy quadratic resistance has a known analytical solution. This
// checks the numerical trajectory against an independently derived reference.
for (const t of [.1,1,5,10,19.9,20]) {
  const r=finiteState(reference,t), vt=Math.sqrt(75*g/.27), q=g*t/vt;
  near(r.v,vt*Math.tanh(q),'pre-opening analytic velocity',2e-6);
  near(r.s,vt*vt/g*Math.log(Math.cosh(q)),'pre-opening analytic displacement',2e-6);
  near(r.a,g/(Math.cosh(q)**2),'pre-opening analytic acceleration',3e-6);
}

const openingStart=finiteState(reference,20);
const beforeOpening=finiteState(reference,20-1e-6), afterOpening=finiteState(reference,20+1e-6);
assert.ok(Math.abs(afterOpening.v-beforeOpening.v)<1e-4,'opening does not jump velocity');
assert.ok(Math.abs(afterOpening.s-beforeOpening.s)<.001,'opening does not jump position');
assert.ok(Math.abs(afterOpening.drag-beforeOpening.drag)<.001,'smooth deployment does not jump force');
assert.ok(openingStart.v>0 && openingStart.a>0,'the first limiting speed is approached from below');
const slowing=finiteState(reference,21.5);
assert.ok(slowing.v>0 && slowing.a<0,'upward acceleration slows motion that is still downward');
assert.ok(slowing.drag>slowing.weight,'drag exceeds weight while the parachutist slows');
assert.ok(slowing.v<openingStart.v,'downward speed decreases after deployment starts');
assert.ok(slowing.openingFraction>0 && slowing.openingFraction<1,'deployment has a finite duration');
const fullyOpen=finiteState(reference,23);
near(fullyOpen.openingFraction,1,'canopy fully opens after three seconds',1e-12);
assert.ok(fullyOpen.v>fullyOpen.terminalAfter,'speed remains above the new terminal level during slowing');

// Once the canopy is fully open, the exact solution with that initial speed
// supplies an independent post-deployment anchor, including displacement.
for(const dt of [.1,1,5,10,30]) {
  const r=finiteState(reference,23+dt), vt=fullyOpen.terminalAfter, q=g*dt/vt, h=Math.tanh(q);
  const expected=vt*(fullyOpen.v+vt*h)/(vt+fullyOpen.v*h);
  const distance=vt*vt/g*Math.log(Math.cosh(q)+fullyOpen.v/vt*Math.sinh(q));
  near(r.v,expected,'post-opening analytic velocity',3e-5);
  near(r.s-fullyOpen.s,distance,'post-opening analytic displacement',3e-5);
}
const end=finiteState(reference,60);
assert.ok(end.v>1,'terminal descent has nonzero speed');
near(end.v,end.terminalAfter,'new lower steady falling speed',2e-6);
near(end.drag,end.weight,'balanced forces at final terminal descent',2e-6);
near(end.a,0,'near-zero terminal acceleration',2e-6);
assert.ok(end.terminalAfter<end.terminalBefore,'the open canopy has a lower limiting speed');
assert.deepEqual(Terminal.state(reference,-10),release,'negative time clamps to release');
assert.deepEqual(Terminal.state(reference,600),end,'time after the display clamps to the end');

let trajectories=0;
for(const m of [50,75,110]) for(const body of [0,1,2]) for(const canopy of [0,1,2]) for(const open of [5,20,30]) for(const deploy of [0,1]) {
  const p={m,body,canopy,open,deploy}, initial=finiteState(p,0), late=finiteState(p,60);
  const trajectory=Terminal.sample(p,121);
  assert.ok(Array.isArray(trajectory) && trajectory.length===121,'sampling returns the requested number of states');
  near(trajectory[0].t,0,'sample starts at release'); near(trajectory.at(-1).t,60,'sample includes the end');
  let last=trajectory[0];
  for(const r of trajectory) {
    finiteState(p,r.t);
    assert.ok(r.t>=last.t && r.s>=last.s-1e-8,'sample time and downward position increase');
    near(r.weight,initial.weight,'weight remains constant throughout opening',1e-12);
    assert.ok(r.openingFraction>=last.openingFraction,'opening never reverses');
    assert.ok(r.v<=initial.terminalBefore+1e-7,'no state exceeds the initial body-only limiting speed');
    if(!deploy) {near(r.openingFraction,0,'disabled canopy remains closed');assert.ok(r.a>=-1e-8,'body-only descent never slows from rest');}
    last=r;
  }
  if(deploy) {
    near(late.openingFraction,1,'enabled canopy fully opens');
    near(late.v,late.terminalAfter,'all allowed canopies approach their lower limiting speed',3e-5);
  } else near(late.v,late.terminalBefore,'no deployment retains the first terminal speed',3e-5);
  // Integrate acceleration with a small central interval and compare it with
  // the actual velocity change; also check that graph gradient means speed.
  for(const t of [1,4,open+.5,open+1.5,open+3.5,45]) {
    const h=.002,l=Terminal.state(p,t-h),r=Terminal.state(p,t+h),c=Terminal.state(p,t);
    near((r.v-l.v)/(2*h),c.a,'slope of velocity graph agrees with acceleration',.002);
    near((r.s-l.s)/(2*h),c.v,'slope of displacement agrees with velocity',.001);
  }
  trajectories++;
}

// Comparisons reflect qualitative parameter changes without asking students
// to use a drag law: larger area lowers terminal speed, mass raises it, and
// posture changes the closed-canopy effective area.
for(const canopy of [0,1]) assert.ok(Terminal.state({...reference,canopy},60).terminalAfter>Terminal.state({...reference,canopy:canopy+1},60).terminalAfter);
for(const body of [0,1]) assert.ok(Terminal.state({...reference,body},0).terminalBefore>Terminal.state({...reference,body:body+1},0).terminalBefore);
assert.ok(Terminal.state({...reference,m:110},60).terminalAfter>Terminal.state({...reference,m:50},60).terminalAfter);
for(const p of [{},{m:NaN,body:Infinity,canopy:-100,open:'invalid',deploy:0},{m:1e6,body:30,canopy:30,open:100,deploy:1}]) for(const t of [0,1,60,-1,100]) finiteState(p,t);

// The injected lesson is the one used by the browser, while other lessons
// retain their models. Its public formula never teaches a resistance law.
const active=Physics.M.find(m=>m.id==='newton');
assert.ok(active && active.controls.every(c=>c.key!=='k'),'no coefficient calculation control');
assert.ok(!/\\(?:frac\{d|ln)|e\^|kv|v_T.*\\frac/.test(active.formula),'student formula contains no drag solution or calculus');
const activeParams=Physics.defaults(active);
near(Physics.duration(active,activeParams),60,'active browser duration');
for(const t of [0,20,21.5,23,60]) {
  const got=Physics.calc('newton',activeParams,t), expected=Terminal.state(activeParams,t);
  for(const key of ['v','s','a','weight','drag']) near(got[key],expected[key],`active lesson uses new state: ${key}`,1e-12);
}
console.log(`PASS: ${states} terminal-motion states, ${checks} numerical checks, ${trajectories} complete parameter trajectories. Independent analytical anchors before/after deployment, continuous position/velocity/force, Newton balance, limiting speeds, graph derivatives, all control bounds, parameter trends, sanitisation and active browser integration.`);
