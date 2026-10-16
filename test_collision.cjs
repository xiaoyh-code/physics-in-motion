'use strict';

// These checks use center separation, conservation laws and the independent
// reduced-mass energy identity; they do not duplicate the renderer equations.
const assert = require('node:assert/strict');
const Physics = require('./models.js');
const Collision = require('./collision-model.js');
let states = 0, checks = 0, experiments = 0;
const near = (actual, expected, label, tolerance = 1e-10) => {
  assert.ok(Number.isFinite(actual), `${label}: nonfinite ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${label}: ${actual} differs from ${expected}`);
  checks++;
};
const reference = {m1:2,m2:2,u1:4,u2:0,e:0};
function state(p,t) {
  const before=JSON.stringify(p), r=Collision.state(p,t);
  assert.equal(JSON.stringify(p),before,'state does not mutate its parameters');
  for(const key of ['t','T','m1','m2','u1','u2','e','x1','x2','v1','v2','currentV1','currentV2','Pi','Pf','p1','p2','P','Ki','Kf','K','loss']) {
    assert.ok(Number.isFinite(r[key]),`finite ${key} at t=${t}`); checks++;
  }
  assert.ok(r.t>=0 && r.t<=r.T,'time remains in the displayed experiment');
  assert.ok(r.x2-r.x1>=2-1e-9,'the two 2 m carts never overlap');
  near(r.P,r.m1*r.currentV1+r.m2*r.currentV2,'instantaneous signed total momentum');
  near(r.p1,r.m1*r.currentV1,'cart A signed momentum');
  near(r.p2,r.m2*r.currentV2,'cart B signed momentum');
  near(r.P,r.Pi,'momentum is conserved at every displayed time');
  near(r.Pi,r.m1*r.u1+r.m2*r.u2,'initial signed total momentum');
  near(r.Pf,r.m1*r.v1+r.m2*r.v2,'final signed total momentum');
  near(r.Pf,r.Pi,'pre-impact and post-impact momentum totals agree');
  near((r.m1*r.x1+r.m2*r.x2)/(r.m1+r.m2),(-5*r.m1+5*r.m2)/(r.m1+r.m2)+r.Pi*r.t/(r.m1+r.m2),'isolated center of mass moves uniformly through contact');
  near(r.K,.5*r.m1*r.currentV1**2+.5*r.m2*r.currentV2**2,'instantaneous kinetic energy');
  near(r.Ki,.5*r.m1*r.u1**2+.5*r.m2*r.u2**2,'initial kinetic energy');
  near(r.Kf,.5*r.m1*r.v1**2+.5*r.m2*r.v2**2,'final kinetic energy');
  near(r.T,6,'six-second experiment');
  assert.ok(typeof r.phase==='string'&&typeof r.status==='string','a qualitative state is supplied');
  if(r.tc!==null) {
    near(r.tc,8/(r.u1-r.u2),'first bumper contact follows 8 m initial clear gap');
    assert.ok(r.u1>r.u2 && r.tc>0,'finite collision requires initial approach');
    assert.equal(r.hasCollision,true,'finite future contact is identified');
    assert.equal(r.collisionInRun,r.tc<=r.T,'future contact is distinguished from contact in this run');
    assert.equal(r.collided,r.t>=r.tc,'the velocity branch changes exactly at contact');
  } else {
    assert.ok(r.u1<=r.u2,'separating, parallel or stopped carts never have a collision time');
    assert.equal(r.hasCollision,false,'no fabricated future collision');
    assert.equal(r.collisionInRun,false,'no fabricated event in the experiment');
    assert.equal(r.collided,false,'no collision branch for separating carts');
  }
  if(!r.collided) {
    near(r.currentV1,r.u1,'A retains launch velocity before contact');
    near(r.currentV2,r.u2,'B retains launch velocity before contact');
    near(r.x1,-5+r.u1*r.t,'A moves uniformly before contact');
    near(r.x2,5+r.u2*r.t,'B moves uniformly before contact');
    near(r.K,r.Ki,'kinetic energy remains constant before contact');
  } else {
    near(r.currentV1,r.v1,'A has outgoing velocity after contact');
    near(r.currentV2,r.v2,'B has outgoing velocity after contact');
    near(r.x2-r.x1,2+(r.v2-r.v1)*(r.t-r.tc),'carts separate from bumper contact');
    near(r.K,r.Kf,'post-collision kinetic energy remains constant');
  }
  states++;
  return r;
}

const release=state(reference,0), contact=state(reference,2), end=state(reference,6);
near(release.x1,-5,'A starts left'); near(release.x2,5,'B starts right');
near(contact.x1,3,'A center at the reference contact'); near(contact.x2,5,'B center at reference contact');
near(contact.x2-contact.x1,2,'cart bumpers touch without geometric overlap');
near(end.currentV1,2,'equal masses stick at 2 m/s'); near(end.currentV2,2,'both carts share final velocity');
near(end.P,8,'reference total momentum is 8 kg m/s'); near(end.Ki,16,'reference initial energy'); near(end.Kf,8,'reference final energy');
assert.deepEqual(Collision.state(reference,-100),release,'negative time clamps to release');
assert.deepEqual(Collision.state(reference,100),end,'late time clamps to the experiment end');

for(const m1 of [.5,1,2,5]) for(const m2 of [.5,1.5,3,5]) for(const u1 of [-8,-3,0,.25,1,4,8]) for(const u2 of [-8,-2,0,.25,2,5,8]) for(const e of [0,1]) {
  const p={m1,m2,u1,u2,e}, first=state(p,0), last=state(p,6);
  for(const t of [.1,.75,1.5,2,3.25,5.999]) state(p,t);
  if(first.hasCollision) {
    // Restitution and total momentum are independent constraints on the
    // solution, including signed same-direction and head-on collisions.
    near(first.v2-first.v1,e*(u1-u2),'relative separation speed follows collision behaviour');
    near(m1*(first.v1-u1),-m2*(first.v2-u2),'opposite impulses transfer equal signed momentum');
    const reduced=m1*m2/(m1+m2), expectedLoss=.5*reduced*(1-e*e)*(u1-u2)**2;
    near(first.Ki-first.Kf,expectedLoss,'independent reduced-mass kinetic-energy loss');
    near(first.loss,expectedLoss,'reported energy loss agrees with its physical identity');
    assert.ok(first.Kf<=first.Ki+1e-9,'passive collisions never create kinetic energy');
    if(e===0) near(first.v1,first.v2,'sticking carts share one velocity');
    if(e===1) near(first.Kf,first.Ki,'elastic collisions conserve kinetic energy');
    if(first.collisionInRun) {
      const epsilon=1e-8, left=state(p,Math.max(0,first.tc-epsilon)), at=state(p,first.tc), right=state(p,Math.min(6,first.tc+epsilon));
      near(at.x2-at.x1,2,'exact contact has zero clear bumper gap');
      assert.ok(Math.abs(left.x1-right.x1)<=2e-6&&Math.abs(left.x2-right.x2)<=2e-6,'positions remain continuous across the ideal velocity jump');
      near(at.contactX1,at.x1,'reported A contact center'); near(at.contactX2,at.x2,'reported B contact center');
    } else {
      assert.equal(last.collided,false,'contact later than six seconds does not occur during this run');
      near(last.K,last.Ki,'future collision does not alter current energy');
    }
  } else {
    near(first.v1,u1,'no-contact A velocity is unchanged'); near(first.v2,u2,'no-contact B velocity is unchanged');
    near(first.loss,0,'no energy loss without contact');
    assert.ok(last.x2-last.x1>=release.x2-release.x1,'non-approaching carts retain or increase separation');
  }
  experiments++;
}

// Distinct useful demonstrations: cancellation is zero momentum, not zero
// incoming motion, while a light cart can rebound from a heavier cart.
const cancel=state({m1:2,m2:2,u1:4,u2:-4,e:0},6);
near(cancel.P,0,'equal and opposite momenta cancel'); near(cancel.currentV1,0,'head-on sticking pair rests'); near(cancel.currentV2,0,'both stopped after impact');
assert.ok(cancel.Ki>0&&cancel.loss>0,'zero momentum does not imply zero initial kinetic energy');
const rebound=state({m1:.5,m2:5,u1:8,u2:0,e:1},6);
assert.ok(rebound.currentV1<0&&rebound.currentV2>0,'light cart rebounds from a heavy stationary cart');
const catchup=state({m1:2,m2:3,u1:-1,u2:-5,e:0},6);
assert.ok(catchup.collided&&catchup.currentV1<0,'two left-moving carts can collide when the right cart catches the left cart');
const later=state({m1:2,m2:2,u1:.25,u2:0,e:0},6);
assert.equal(later.tc,32,'very slow approach has a physically later event'); assert.equal(later.collisionInRun,false,'later impact is not brought forward for visual convenience');

// Adding a common reference-frame velocity cannot change the contact time,
// the relative motion, or the energy dissipated in a given collision.
for(const e of [0,1])for(const boost of [-2,2])for(const t of [0,1,2,4,6]) {
  const a=state({m1:1,m2:3,u1:4,u2:0,e},t),b=state({m1:1,m2:3,u1:4+boost,u2:boost,e},t);
  near(b.tc,a.tc,'contact time is invariant under a uniform velocity boost');
  near(b.currentV1,a.currentV1+boost,'A velocity transforms with the reference frame');
  near(b.currentV2,a.currentV2+boost,'B velocity transforms with the reference frame');
  near(b.x1,a.x1+boost*t,'A position transforms with the reference frame');
  near(b.x2,a.x2+boost*t,'B position transforms with the reference frame');
  near(b.loss,a.loss,'energy transferred to other stores is frame independent');
}
const exchange=state({m1:2,m2:2,u1:3,u2:-2,e:1},6);
near(exchange.currentV1,-2,'equal elastic masses exchange the first velocity');
near(exchange.currentV2,3,'equal elastic masses exchange the second velocity');

for(const p of [{},{m1:NaN,m2:Infinity,u1:'bad',u2:null,e:NaN},{m1:-100,m2:1000,u1:-99,u2:99,e:2}]) for(const t of [-1,0,2,6,100,NaN]) state(p,t);
if(typeof Collision.sample==='function') {
  const samples=Collision.sample(reference,121);
  assert.equal(samples.length,121,'sample respects requested resolution');
  near(samples[0].t,0,'sample begins at release'); near(samples.at(-1).t,6,'sample reaches the end');
}
const active=Physics.M.find(m=>m.id==='momentum');
assert.ok(active,'the lesson exists');
const params=Physics.defaults(active);
near(Physics.duration(active,params),6,'browser runs the collision timeline');
for(const t of [0,1.99,2,2.01,6]) {
  const got=Physics.calc('momentum',params,t), expected=Collision.state(params,t);
  for(const key of ['x1','x2','currentV1','currentV2','Pi','Pf','K']) near(got[key],expected[key],`active browser collision model ${key}`);
}
console.log(`PASS: ${states} collision states, ${checks} numerical conservation and geometry checks, ${experiments} parameter experiments. Signed momentum, equal impulses, independent reduced-mass energy loss, exact bumper contact, continuous positions, sticking/elastic response, same-direction/head-on/separating/stationary/future-contact cases, clamped input and active browser model injection.`);
