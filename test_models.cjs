const assert=require('node:assert/strict');const {M,defaults,duration,calc}=require('./models.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
let n=0;
for(const m of M){const cases=[defaults(m)];for(const c of m.controls)for(const value of[c.min,c.max])cases.push({...defaults(m),[c.key]:value});for(const p of cases){const T=duration(m,p);for(const t of[0,T/2,T]){const r=calc(m.id,p,t);for(const [k,v]of Object.entries(r))assert.ok(Number.isFinite(v),`${m.id}.${k}`);if(['motion','displacement'].includes(m.id))near(r.v*r.v,p.u*p.u+2*p.a*r.s);if(['momentum','elastic'].includes(m.id)){near(r.Pi,r.Pf);near(r.v2-r.v1,p.e*(p.u1-p.u2));assert.ok(r.loss>=-1e-8);if(p.e===1)near(r.Ki,r.Kf)}if(m.id==='energy')near(r.U+r.K,r.E);if(m.id==='beam'){near(r.RA+r.RB,p.W+p.Wb);near(r.RB*p.L,p.W*r.x+p.Wb*p.L/2)}if(m.id==='efficiency')near(r.useful+r.waste,r.input);if(m.id==='impulse')near(r.F*p.dt,r.J);if(m.id==='kinetic')near(r.K,r.p*r.p/(2*p.m));if(m.id==='power')near(r.W,r.P*t);if(m.id==='newton'){near(p.m*r.a,p.m*p.g-r.drag);assert.ok(r.v<=r.vt+1e-8)}n++;}}}
const p={m1:2,m2:1,u1:6,u2:0,e:0};near(calc('momentum',p,4).v1,4);near(calc('momentum',p,4).loss,12);
near(calc('momentum2d',{m1:2,m2:1,ux:3,uy:8},4).v,10/3);
near(calc('impulse',{m:.2,u:8,v:-6,dt:.1},.1).J,-2.8);
near(calc('work',{F:10,d:5,angle:60},4).W,25);
global.window={};require('./content.js');const C=window.LESSON_CONTENT;assert.equal(Object.keys(C).length,15);let parts=0;for(const [id,c] of Object.entries(C)){assert.ok(c.derivation.length>=3);for(const part of c.exam.parts){assert.equal(part.marks,part.points.length,id);parts++;}}
console.log(`PASS: ${n} analytical states across 15 models; conservation laws, endpoint/edge cases, ${parts} exam parts.`);
