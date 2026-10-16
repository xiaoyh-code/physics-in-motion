'use strict';

const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const Collision=require('./collision-model.js');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const calls=[];
global.PhysicsVisualMath={svgMath(...args){calls.push(args);return `<g data-tex="${escape(args[2])}"/>`;}};
const Visual=require('./collision-visual.js');
const reference={m1:2,m2:2,u1:4,u2:0,e:0};
let frames=0,checks=0;const xml=[];
const near=(actual,expected,label,tolerance=1e-8)=>{
  assert.ok(Number.isFinite(actual),`${label}: nonfinite ${actual}`);
  assert.ok(Math.abs(actual-expected)<=tolerance*Math.max(1,Math.abs(expected)),`${label}: ${actual} differs from ${expected}`);checks++;
};
function tag(svg,selector){const item=[...svg.matchAll(/<[a-zA-Z][^>]*>/g)].find(match=>match[0].includes(selector));assert.ok(item,`element containing ${selector}`);return item[0];}
function attr(source,name){const value=source.match(new RegExp(`\\b${name}="([^"]*)"`));assert.ok(value,`attribute ${name}`);return value[1];}
function frame(params,time,options={}){
  const input={params,time,runs:[],stage:0,showWorking:false,compact:false,flags:{components:true,projections:true,ghosts:true},...options},before=JSON.stringify(input),firstCall=calls.length,out=Visual.render(input),r=Collision.state(params,time);
  assert.equal(JSON.stringify(input),before,'rendering leaves caller state and saved comparisons unchanged');
  assert.ok(typeof out.svg==='string'&&out.svg.length>500,'live SVG scene exists');
  assert.ok(!/\b(?:NaN|Infinity)\b/.test(out.svg),'all geometry and labels are finite');
  assert.ok(out.ariaLabel.length>70&&!/\b(?:NaN|Infinity)\b/.test(out.ariaLabel),'accessible description conveys a finite physical state');
  assert.ok(!/<(?:video|iframe)\b/.test(out.svg),'geometry is interactive rather than an embedded video');
  const dimensions=out.viewBox.split(/\s+/).map(Number),W=dimensions[2];
  assert.ok(dimensions.length===4&&dimensions.every(Number.isFinite)&&dimensions[2]>0&&dimensions[3]>0,'responsive finite viewBox');
  const root=tag(out.svg,'data-collision-stage='),positionScale=Number(attr(root,'data-position-scale')),velocityScale=Number(attr(root,'data-velocity-scale')),momentumScale=Number(attr(root,'data-momentum-scale'));
  assert.ok(positionScale>0&&velocityScale>0&&momentumScale>0,'physical scales remain positive');
  near(Number(attr(root,'data-time')),r.t,'drawn time follows clamped model time');
  near(Number(attr(root,'data-collision-stage')),input.stage,'selected reasoning view');
  assert.equal(attr(root,'data-show-working'),String(input.showWorking),'working gate is explicit');
  assert.equal(attr(root,'data-collided'),String(r.collided),'drawing uses actual collision branch');
  near(Number(attr(root,'data-momentum-before')),r.Pi,'initial momentum root metadata');
  near(Number(attr(root,'data-momentum-current')),r.P,'current momentum root metadata');
  near(Number(attr(root,'data-momentum-after')),r.Pf,'outgoing total momentum root metadata');
  const A=tag(out.svg,'data-car="A"'),B=tag(out.svg,'data-car="B"');
  for(const [car,name,x,v]of[[A,'A',r.x1,r.currentV1],[B,'B',r.x2,r.currentV2]]){
    near(Number(attr(car,'data-physical-center')),x,`${name} car center corresponds to model`);
    near(Number(attr(car,'data-current-velocity')),v,`${name} velocity corresponds to current branch`);
    near(Number(attr(car,'data-physical-length')),2,`${name} physical cart length`);
    assert.ok(Number(attr(car,'data-car-left'))>=-1e-3&&Number(attr(car,'data-car-right'))<=W+1e-3,`${name} stays inside the camera`);
  }
  const frontA=Number(attr(A,'data-front-x')),frontB=Number(attr(B,'data-front-x'));
  near(frontB-frontA,(r.x2-r.x1-2)*positionScale,'drawn clear gap follows actual bumper separation',.001);
  assert.ok(frontB>=frontA-.001,'drawn car bodies never overlap');
  if(r.collisionInRun&&Math.abs(r.t-r.tc)<1e-10)near(frontA,frontB,'both bumpers meet at exact event',.001);
  if(input.flags.components)for(const [name,value]of[['A',r.currentV1],['B',r.currentV2]]){
    const arrow=tag(out.svg,`data-current-velocity="${name}"`);
    near(Number(attr(arrow,'data-velocity-value')),value,`${name} current velocity label`,.001);
    near(Number(attr(arrow,'data-arrow-length')),Math.abs(value)*velocityScale,`${name} arrow has proportional speed`,.001);
    if(Math.abs(value)>.001){const shaft=tag(out.svg.slice(out.svg.indexOf(arrow)),'<line ');near((Number(attr(shaft,'x2'))-Number(attr(shaft,'x1')))/velocityScale,value,`${name} actual arrow points along signed velocity`,.002);}
  }
  const panels=[...out.svg.matchAll(/<g data-momentum-panel="([^"]*)" data-momentum-car="([^"]*)"[^>]*>/g)];
  assert.equal(panels.length,input.showWorking?6:0,'signed-momentum computations appear only on demand');
  if(input.showWorking)for(const match of panels){
    const values=match[1]==='Before contact'?[r.m1*r.u1,r.m2*r.u2,r.Pi]:[r.p1,r.p2,r.P];
    const expected=values[['A','B','Total'].indexOf(match[2])];
    near(Number(attr(match[0],'data-momentum-value')),expected,'momentum panel uses signed physical value',.001);
    near(Number(attr(match[0],'data-bar-length')),Math.abs(expected)*momentumScale,'momentum bars share magnitude scale',.001);
  }
  for(const args of calls.slice(firstCall))if(!input.showWorking)assert.ok(!/\\Delta|p_A|p_B|m_Au_A|m_Bu_B/.test(args[2]),'default observation scene contains no momentum computation');
  xml.push(out);frames++;return{out,positionScale,velocityScale,momentumScale};
}

const cases=[reference,{m1:.5,m2:5,u1:8,u2:0,e:1},{m1:5,m2:.5,u1:3,u2:-8,e:0},{m1:2,m2:2,u1:4,u2:-4,e:0},{m1:1,m2:3,u1:-1,u2:-5,e:1},{m1:2,m2:2,u1:-4,u2:4,e:0},{m1:2,m2:2,u1:0,u2:0,e:0},{m1:2,m2:3,u1:.25,u2:0,e:1}];
for(const p of cases)for(const compact of [false,true])for(const stage of [0,1,2,3,4])for(const showWorking of [false,true]){
  const r=Collision.state(p,0),times=[0,.2,1.999,2,3,6];if(r.collisionInRun)times.push(r.tc-1e-6,r.tc,r.tc+1e-6);
  let scale=null;
  for(const time of times){const f=frame(p,time,{compact,stage,showWorking}),scales=[f.positionScale,f.velocityScale,f.momentumScale];if(scale)assert.deepEqual(scales,scale,'scrubbing never changes physical scales');scale=scales;}
}
const runs=cases.slice(0,4).map((params,index)=>({params,T:6,label:'Saved '+index}));
for(const compact of [false,true])for(const components of [false,true])for(const projections of [false,true])for(const ghosts of [false,true])for(const stage of [0,1,2,3,4]){
  const f=frame(reference,3,{compact,stage,showWorking:true,runs,flags:{components,projections,ghosts}});
  near([...f.out.svg.matchAll(/data-saved-run="/g)].length,ghosts?4:0,'saved comparison visibility');
  if(ghosts)for(const run of runs)assert.ok(f.out.svg.includes(run.label),'each saved run has an identifiable legend');
}
const unsafe='<b>& comparison',safe=frame(reference,1,{runs:[{params:reference,T:6,label:unsafe}]});
assert.ok(!safe.out.svg.includes(unsafe)&&safe.out.svg.includes('&lt;b&gt;&amp; comparison'),'saved labels are escaped');
for(const time of [-2,99,NaN])frame(reference,time);
const katex=require('./vendor/katex/katex.js'),uniqueTex=new Set(calls.map(args=>args[2]));for(const tex of uniqueTex)katex.renderToString(tex,{throwOnError:true});
global.PhysicsVisualMath=require('./visual-math.js');const real=frame(reference,3,{showWorking:true});assert.ok(real.out.svg.includes('katex'),'real optional maths uses the locally bundled TeX renderer');
const parsed=spawnSync('python3',['-c','import json,sys,xml.etree.ElementTree as E\nframes=json.load(sys.stdin)\nfor frame in frames: E.fromstring(\'<svg xmlns="http://www.w3.org/2000/svg" viewBox="\'+frame["viewBox"]+\'">\'+frame["svg"]+\'</svg>\')\nprint(len(frames))'],{input:JSON.stringify(xml),encoding:'utf8',maxBuffer:1024*1024});
assert.equal(parsed.status,0,parsed.stderr);
console.log(`PASS: ${frames} collision SVG scenes, ${checks} geometry/state checks, ${uniqueTex.size} distinct valid TeX expressions, ${parsed.stdout.trim()} well-formed SVG/XML documents. Five reasoning views, desktop/mobile, signed velocity arrows, shared proportional momentum bars, exact bumpers, fixed camera, hidden default calculations, four comparisons, escaped labels and finite no-contact cases.`);
