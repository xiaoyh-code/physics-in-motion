'use strict';

// Validate the live falling/parachute diagrams independently of the controller.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const Terminal=require('./terminal-model.js');
const calls=[];
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
global.PhysicsVisualMath={svgMath(...args){calls.push(args);return `<g data-tex="${escape(args[2])}"/>`;}};
const Visual=require('./terminal-visual.js');
const reference={m:75,body:2,canopy:1,open:20,deploy:1};
let frames=0,checks=0;
const xmlFrames=[];
const near=(actual,expected,label,tol=1e-5)=>{
  assert.ok(Number.isFinite(actual),`${label}: finite value`);
  assert.ok(Math.abs(actual-expected)<=tol*Math.max(1,Math.abs(expected)),`${label}: ${actual} differs from ${expected}`);checks++;
};
function tag(svg,selector) {
  const match=[...svg.matchAll(/<[a-zA-Z][^>]*>/g)].find(m=>m[0].includes(selector));
  assert.ok(match,`SVG element with ${selector}`);return match[0];
}
function attr(svgTag,name) {
  const found=svgTag.match(new RegExp(`\\b${name}="([^"]*)"`));
  assert.ok(found,`SVG attribute ${name}`);return found[1];
}
function frame(params,time,options={}) {
  const input={params,time,duration:60,runs:[],flags:{components:true,projections:true,ghosts:true},compact:false,stage:0,showWorking:false,...options};
  const before=JSON.stringify(input),start=calls.length,rendered=Visual.render(input),state=Terminal.state(params,time);
  assert.equal(JSON.stringify(input),before,'renderer leaves parameters, flags and saved runs unchanged');
  assert.ok(typeof rendered.svg==='string' && rendered.svg.length>200,'rendered scene is present');
  assert.ok(!/\b(?:NaN|Infinity)\b/.test(rendered.svg),'finite geometry and labels');
  assert.ok(typeof rendered.ariaLabel==='string' && rendered.ariaLabel.length>50,'descriptive accessible diagram');
  assert.ok(!/\b(?:NaN|Infinity)\b/.test(rendered.ariaLabel),'finite accessible values');
  const box=rendered.viewBox.trim().split(/[\s,]+/).map(Number);
  assert.ok(box.length===4 && box.every(Number.isFinite) && box[2]>0 && box[3]>0,'valid responsive viewBox');
  const root=tag(rendered.svg,'data-terminal-stage=');
  assert.equal(Number(attr(root,'data-terminal-stage')),input.stage,'all five observation views are selectable');
  assert.equal(attr(root,'data-show-working'),String(input.showWorking),'default observation / optional working is explicit');
  near(Number(attr(root,'data-time')),state.t,'displayed timeline is clamped',.001);
  const graphMaxSpeed=Number(attr(root,'data-graph-max-speed')),graphMaxTime=Number(attr(root,'data-graph-max-time')),forceScale=Number(attr(root,'data-force-scale'));
  assert.ok(graphMaxSpeed>0 && graphMaxTime>=60 && forceScale>0,'valid shared graph and force scales');
  const point=tag(rendered.svg,'data-current-time=');
  near(Number(attr(point,'data-current-speed')),state.v,'current graph point is actual speed',.001);
  near(Number(attr(point,'data-current-time')),state.t,'graph cursor is actual time',.001);
  assert.ok(state.v<=graphMaxSpeed+1e-8,'current speed stays inside graph scale');
  if(input.stage===2) {
    const tangent=rendered.svg.match(/<g data-speed-tangent="true"[^>]*>(<line[^>]*>)/);
    assert.ok(tangent,'the graph view shows a tangent at the current time');
    near(Number(attr(tangent[0],'data-tangent-gradient')),state.a,'tangent represents current acceleration',1e-9);
    const clip=rendered.svg.match(/<clipPath id="terminal-speed-clip"><rect[^>]*>/);
    assert.ok(clip,'graph provides its drawing bounds');
    const w=Number(attr(clip[0],'width'))-10,h=Number(attr(clip[0],'height'))-10;
    const x1=Number(attr(tangent[1],'x1')),x2=Number(attr(tangent[1],'x2')),y1=Number(attr(tangent[1],'y1')),y2=Number(attr(tangent[1],'y2'));
    const physicalGradient=-(y2-y1)/h*graphMaxSpeed/((x2-x1)/w*graphMaxTime);
    near(physicalGradient,state.a,'actual drawn tangent slope agrees with acceleration',.003);
  }
  if(input.flags.components) for(const [name,value] of [['weight',state.weight],['drag',state.drag]]) {
    const force=tag(rendered.svg,`data-force="${name}"`);
    near(Number(attr(force,'data-force-value')),value,`${name} is physically accurate`,.001);
    near(Number(attr(force,'data-arrow-length')),value*forceScale,`${name} arrow uses one common force scale`,.003);
  }
  const canopy=tag(rendered.svg,'data-opening-fraction=');
  near(Number(attr(canopy,'data-opening-fraction')),state.openingFraction,'parachute follows actual deployment',.001);
  const canopyWidth=Number(attr(canopy,'data-canopy-width')),canopyHeight=Number(attr(canopy,'data-canopy-height'));
  assert.ok(canopyWidth>=0 && canopyHeight>=0,'finite canopy geometry');
  for(const args of calls.slice(start)) {
    const tex=args[2];
    assert.ok(!/\\frac\{d[vsp]|\\(?:ln|int)\b|e\^|(?:k|c)\s*v\^|(?:k|c)v|\\rho/.test(tex),`no drag law or calculus is taught: ${tex}`);
    if(!input.showWorking)assert.ok(!/F_?\{?(?:\\rm\s*)?(?:net|D).*?=|W\s*=|a\s*=/.test(tex),`observe mode contains no force calculations: ${tex}`);
  }
  assert.ok(!/<(?:video|iframe)\b/i.test(rendered.svg),'the lesson uses live geometry');
  assert.ok(!/font-family\s*[:=][^;\n"]*(?:Times|serif)/i.test(rendered.svg.replace(/sans-serif/g,'')),'ordinary diagram labels do not switch to serif');
  xmlFrames.push(rendered);frames++;
  return {rendered,graphMaxSpeed,graphMaxTime,forceScale,canopyWidth,canopyHeight,state};
}

const cases=[reference,{m:50,body:0,canopy:0,open:5,deploy:1},{m:110,body:2,canopy:2,open:30,deploy:1},{m:110,body:0,canopy:1,open:20,deploy:0}];
for(const p of cases)for(const compact of [false,true])for(const stage of [0,1,2,3,4])for(const showWorking of [false,true]) {
  let scale=null,width=-1,height=-1;
  for(const time of [0,1,p.open-.1,p.open,p.open+.5,p.open+1.5,p.open+3,40,60]) {
    const f=frame(p,time,{compact,stage,showWorking});
    const now=[f.graphMaxSpeed,f.graphMaxTime,f.forceScale];
    if(scale)assert.deepEqual(now,scale,'scrubbing does not resize the speed graph or force arrows');
    assert.ok(f.canopyWidth>=width-1e-8 && f.canopyHeight>=height-1e-8,'canopy expands continuously without shrinking');
    scale=now;width=f.canopyWidth;height=f.canopyHeight;
  }
}
const runs=cases.map((params,i)=>({params,T:60,label:'Saved curve '+(i+1)}));
for(const components of [false,true])for(const projections of [false,true])for(const ghosts of [false,true])for(const compact of [false,true])for(const stage of [0,1,2,3,4]) {
  frame(reference,21.5,{runs,compact,stage,flags:{components,projections,ghosts}});
}
const comparison=frame(reference,25,{runs});
for(const run of runs)assert.ok(comparison.rendered.svg.includes(run.label),'every saved comparison has an identifiable legend');
for(const run of runs) for(const r of Terminal.sample(run.params,31)) assert.ok(r.v<=comparison.graphMaxSpeed+1e-7,'saved curves share a graph scale that contains every speed');
const unsafeLabel='<b>& curve',escaped=frame(reference,25,{runs:[{params:reference,T:60,label:unsafeLabel}]});
assert.ok(!escaped.rendered.svg.includes(unsafeLabel) && escaped.rendered.svg.includes('&lt;b&gt;&amp; curve'),'saved labels cannot inject SVG markup');
for(const time of [-5,500])frame(reference,time);

const katex=require('./vendor/katex/katex.js');
const uniqueTex=new Set(calls.map(args=>args[2]));
for(const tex of uniqueTex)katex.renderToString(tex,{throwOnError:true});
const context={window:{}};vm.createContext(context);
for(const file of ['content.js','opening-content.js'])vm.runInContext(fs.readFileSync(require.resolve('./'+file),'utf8'),context);
let authoredTex=0;
function written(value,key='') {
  if(Array.isArray(value))return value.forEach(item=>written(item));
  if(value && typeof value==='object')return Object.entries(value).forEach(([k,v])=>written(v,k));
  if(typeof value!=='string')return;
  const validate=tex=>{
    katex.renderToString(tex,{throwOnError:true});
    assert.ok(!/\\(?:ln|int)\b|\\frac\{d|e\^|(?:k|c)\s*v\^|(?:k|c)v|\\rho/.test(tex),`written lesson needs no drag-law calculation: ${tex}`);authoredTex++;
  };
  if(key==='tex')validate(value);
  else value.replace(/\\\(([\s\S]*?)\\\)/g,(_,tex)=>{validate(tex);return '';});
}
written(context.window.LESSON_CONTENT.newton);written(context.window.OPENING_GUIDES.newton);
assert.ok(authoredTex>=8,'optional explanations and conceptual practice contain valid basic TeX');

global.PhysicsVisualMath=require('./visual-math.js');
const real=Visual.render({params:reference,time:21.5,duration:60,stage:3,showWorking:true,flags:{components:true,projections:true,ghosts:true}});
assert.ok(real.svg.includes('katex'),'the actual renderer typesets optional formulas locally');xmlFrames.push(real);
const parsed=spawnSync('python3',['-c',[
  'import json,sys,xml.etree.ElementTree as ET',
  'frames=json.load(sys.stdin)',
  'for frame in frames:',
  '    root=ET.fromstring(\'<svg xmlns="http://www.w3.org/2000/svg" viewBox="\'+frame["viewBox"]+\'">\'+frame["svg"]+\'</svg>\')',
  '    assert len(root)>0',
  'print(f"Validated {len(frames)} SVG documents")'
].join('\n')],{input:JSON.stringify(xmlFrames),encoding:'utf8',maxBuffer:2*1024*1024});
assert.equal(parsed.status,0,parsed.stderr);
console.log(`PASS: ${frames} terminal scenes, ${checks} geometry/state checks, ${uniqueTex.size} distinct scene TeX / ${authoredTex} authored TeX expressions. All observation views, desktop/mobile layouts, force/projection flags, four saved curves, fixed scales, force-arrow magnitude fidelity, smooth canopy geometry, default hidden calculations and valid live SVG/XHTML. ${parsed.stdout.trim()}.`);
