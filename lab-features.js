/* Opening lessons: exact stepping, component views and shared-scale comparisons. */
(function(){
  'use strict';
  const topics=new Set(['motion','displacement','projectile','vectors','newton','momentum']);
  const kept={},visibility={},serial={};let comparisonSignature='',compact=false;
  const ink='#12315b',blue='#1757bd',red='#bd2947',grid='#d6e0ed',muted='#526783';
  const labels=['A','B','C','D'],patterns=['8 5','3 5','10 4 2 4','2 3'];
  const node=id=>document.getElementById(id), num=(n,d=2)=>Math.abs(n)<1e-9?'0':Number(n.toFixed(d)).toString();
  const L=(x,y,X,Y,color=grid,width=1,dash='')=>`<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  const txt=(x,y,value,color=muted,size=15)=>`<text x="${x}" y="${y}" style="fill:${color};font-size:${compact?size*1.16:size}px">${esc(value)}</text>`;
  const dot=(x,y,color=blue,r=5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
  const arr=(x,y,X,Y,color=blue)=>{const a=Math.atan2(Y-y,X-x),len=Math.hypot(X-x,Y-y);if(len<.1)return dot(x,y,color,2);const tip=Math.min(10,len*.35);return L(x,y,X,Y,color,2.5)+`<path d="M${X},${Y} L${X-tip*Math.cos(a-.45)},${Y-tip*Math.sin(a-.45)} L${X-tip*Math.cos(a+.45)},${Y-tip*Math.sin(a+.45)} Z" fill="${color}"/>`;};
  const list=()=>kept[model.id]||(kept[model.id]=[]);
  const flags=()=>visibility[model.id]||(visibility[model.id]={components:true,projections:true,ghosts:true});
  const runs=()=>flags().ghosts?list():[];
  const poly=(points,color=blue,dash='',width=2)=>`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  const sample=(id,p,T,key)=>Array.from({length:121},(_,i)=>[T*i/120,calc(id,p,T*i/120)[key]]);

  function plot(id,p,key,at,{x=80,y=202,w=730,h=142,label='',area=false}={}){
    const active=sample(id,p,duration(model,p),key),history=runs().map(run=>({...run,points:sample(id,run.params,run.T,key)}));
    const maxt=Math.max(duration(model,p),...history.map(a=>a.T),.01);
    let values=[0,...active.map(p=>p[1]),...history.flatMap(a=>a.points.map(p=>p[1]))],lo=Math.min(...values),hi=Math.max(...values);
    const padding=Math.max((hi-lo)*.12,.5);lo-=padding;hi+=padding;
    const X=t=>x+t/maxt*w,Y=v=>y+h-(v-lo)/(hi-lo)*h;
    let svg=txt(x,y-22,label,ink)+L(x,y,x,y+h)+L(x,Y(0),x+w,Y(0));
    for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4;svg+=L(x,Y(v),x+w,Y(v),grid,1,'2 5')+txt(x-53,Y(v)+5,num(v,1),muted,13)+txt(X(maxt*i/4)-6,y+h+23,num(maxt*i/4,1),muted,13);}
    svg+=txt(x+w-12,y+h+45,'t / s',muted,13);
    history.forEach((a,i)=>{svg+=poly(a.points.map(([t,v])=>[X(t),Y(v)]),red,patterns[i],1.8);const q=a.points.at(-1);svg+=txt(X(q[0])+4,Y(q[1])-6,a.label,red,12);});
    if(area){const part=active.filter(a=>a[0]<at);part.push([at,calc(id,p,at)[key]]);svg+=`<polygon points="${[[X(0),Y(0)],...part.map(([t,v])=>[X(t),Y(v)]),[X(at),Y(0)]].map(p=>p.join(',')).join(' ')}" fill="${blue}" opacity=".09"/>`;}
    svg+=poly(active.map(([t,v])=>[X(t),Y(v)]),blue,'',2.5);
    const value=calc(id,p,at)[key];
    if(flags().projections)svg+=L(X(at),y,X(at),y+h,red,1,'4 4')+L(x,Y(value),X(at),Y(value),red,1,'4 4');
    return svg+dot(X(at),Y(value),blue);
  }

  function drawMotion(r){
    const id=model.id,T=duration(model,params),all=[{params,T},...runs()];
    const ss=all.flatMap(a=>sample(id,a.params,a.T,'s').map(b=>b[1]));let lo=Math.min(0,...ss),hi=Math.max(0,...ss);const pad=Math.max((hi-lo)*.08,1);lo-=pad;hi+=pad;
    const X=s=>(compact?45:70)+(s-lo)/(hi-lo)*(compact?370:750);
    let svg=txt(40,28,'Straight-line motion · right is positive',ink)+L(compact?45:70,110,compact?420:820,110,grid,2)+L(X(0),99,X(0),120,ink)+txt(X(0)-8,143,'0 m');
    svg+=txt(70,143,num(lo,1)+' m',muted,13)+txt(compact?353:758,143,num(hi,1)+' m',muted,13);
    runs().forEach((a,i)=>{const s=calc(id,a.params,Math.min(time,a.T));svg+=`<circle cx="${X(s.s)}" cy="109" r="13" fill="white" stroke="${red}" stroke-width="1.5" stroke-dasharray="${patterns[i]}"/>`+txt(X(s.s)-5,113,a.label,red,12);});
    svg+=`<rect x="${X(r.s)-13}" y="88" width="26" height="22" fill="${blue}" rx="3"/>`;
    if(flags().components){const maxV=Math.max(1,...all.flatMap(a=>[Math.abs(a.params.u),Math.abs(calc(id,a.params,a.T).v)]));svg+=arr(X(r.s),70,X(r.s)+r.v/maxV*(compact?35:70),70,red)+txt(40,63,'vₓ = '+num(r.v)+' m/s · vᵧ = 0',red,14);}
    return svg+plot(id,params,id==='motion'?'v':'s',time,{label:id==='motion'?(compact?'Velocity / m s⁻¹':'Velocity / m s⁻¹ · area gives displacement'):(compact?'Displacement / m':'Displacement / m · gradient gives velocity'),w:compact?340:730,x:compact?70:80,area:id==='motion'});
  }

  function drawVectors(r){
    const all=[r,...runs().map(a=>calc('vectors',a.params,1))];
    const extent=Math.max(1,...all.flatMap(a=>[Math.abs(a.ax),Math.abs(a.ay),Math.abs(a.bx),Math.abs(a.by),Math.abs(a.rx),Math.abs(a.ry)]))*1.2;
    const sc=(compact?120:142)/extent,ox=compact?230:380,oy=215,P=(x,y)=>[ox+x*sc,oy-y*sc],f=Math.min(1,time);
    let svg=txt(40,28,compact?'Force diagram · equal axis scales':'Force diagram · equal scale on both axes',ink)+L(compact?55:170,oy,compact?410:590,oy)+L(ox,55,ox,368)+txt(compact?415:598,oy+5,'+x')+txt(ox+8,53,'+y');
    svg+=txt(40,390,compact?'A: blue · B: red · R: dark blue':'A: blue   B: red   Resultant R: dark blue · construction, not particle motion',muted,13);
    runs().forEach((a,i)=>{const q=calc('vectors',a.params,1),end=P(q.rx,q.ry);svg+=L(ox,oy,...end,red,2,patterns[i])+txt(end[0]+5,end[1]-8,a.label,red,12);});
    const A=P(r.ax*f,r.ay*f),B=P(r.bx*f,r.by*f),R=P(r.rx*f,r.ry*f);
    svg+=arr(ox,oy,...A,blue)+arr(ox,oy,...B,red)+arr(ox,oy,...R,ink);
    if(flags().components)svg+=arr(ox,oy,...P(r.rx*f,0),blue)+arr(...P(r.rx*f,0),...R,red);
    if(flags().projections)svg+=L(...R,...P(r.rx*f,0),red,1.5,'4 4')+L(...R,...P(0,r.ry*f),blue,1.5,'4 4');
    if(!compact)svg+=txt(650,110,'Horizontal component',blue,14)+txt(650,138,'Rₓ = '+num(r.rx)+' N',blue,19)+txt(650,196,'Vertical component',red,14)+txt(650,224,'Rᵧ = '+num(r.ry)+' N',red,19)+txt(650,282,'Resultant',ink,14)+txt(650,310,'R = '+num(r.R)+' N',ink,19);
    return svg;
  }

  function drawFall(r){
    const all=[{params,T:duration(model,params)},...runs()];const endS=Math.max(1,...all.map(a=>calc('newton',a.params,a.T).s));
    const y=(compact?60:65)+r.s/endS*(compact?55:220),forceScale=(compact?25:52)/Math.max(1,...all.map(a=>a.params.m*a.params.g));
    let svg=txt(35,28,'Falling with drag · down is positive',ink)+L(125,60,125,compact?115:305)+dot(125,y,blue,13)+txt(compact?205:38,compact?73:335,'s = '+num(r.s)+' m',ink,14);
    if(flags().components)svg+=arr(152,y,152,y+r.weight*forceScale,blue)+arr(98,y,98,y-r.drag*forceScale,red)+txt(compact?205:35,compact?107:366,'Weight '+num(r.weight)+' N ↓',blue,13)+txt(compact?205:35,compact?138:389,'Drag '+num(r.drag)+' N ↑',red,13);
    svg+=plot('newton',params,'v',time,{x:compact?75:330,y:compact?198:88,w:compact?340:470,h:compact?142:222,label:'Downward velocity / m s⁻¹'});
    return svg;
  }

  function drawProjectile(r){
    const all=[{params,T:r.T},...runs()];
    const maxX=Math.max(2,...all.map(a=>calc('projectile',a.params,0).R)),maxY=Math.max(2,...all.map(a=>calc('projectile',a.params,0).H));
    const right=compact?425:660;
    const sc=Math.min((compact?350:565)/maxX,(compact?245:265)/maxY)*.92,ox=compact?55:72,oy=335,X=x=>ox+x*sc,Y=y=>oy-y*sc;
    let svg=txt(36,27,compact?'Projectile motion · right + up':'Projectile motion · right and up are positive',ink)+L(ox,45,ox,oy,ink)+L(ox,oy,right,oy,ink)+txt(right-20,oy+38,'x / m')+txt(36,48,'y / m');
    const nice=v=>Math.pow(10,Math.floor(Math.log10(Math.max(v,1e-8))))*(v/Math.pow(10,Math.floor(Math.log10(Math.max(v,1e-8))))>5?10:v/Math.pow(10,Math.floor(Math.log10(Math.max(v,1e-8))))>2?5:2);
    const tick=nice(Math.max(maxX/5,maxY/4));
    for(let v=0;v<=Math.max(maxX,maxY)+tick;v+=tick){if(X(v)<right-8)svg+=L(X(v),55,X(v),oy,grid,1,'2 5')+txt(X(v)-5,oy+23,num(v,1),muted,13);if(Y(v)>50)svg+=L(ox,Y(v),right-10,Y(v),grid,1,'2 5')+txt(30,Y(v)+5,num(v,1),muted,13);}
    runs().forEach((a,i)=>{const pts=Array.from({length:121},(_,j)=>{const q=calc('projectile',a.params,a.T*j/120);return[X(q.x),Y(q.y)]});const q=calc('projectile',a.params,Math.min(time,a.T));svg+=poly(pts,red,patterns[i],1.7)+dot(X(q.x),Y(q.y),red,3)+txt(X(a.params.u*Math.cos(a.params.theta*Math.PI/180)*a.T)+4,oy-9,a.label,red,12);});
    const track=Array.from({length:101},(_,i)=>{const q=calc('projectile',params,time*i/100);return[X(q.x),Y(q.y)]});
    svg+=poly(track,blue,'',2.5);
    if(flags().projections)svg+=L(X(r.x),Y(r.y),X(r.x),oy,blue,1.2,'4 5')+L(X(r.x),Y(r.y),ox,Y(r.y),red,1.2,'4 5')+dot(X(r.x),oy,blue,4)+dot(ox,Y(r.y),red,4)+txt(Math.min(X(r.x)+8,right-100),oy-9,'x = '+num(r.x)+' m',blue,13)+txt(ox+8,Math.max(Y(r.y)-24,65),'y = '+num(r.y)+' m',red,13);
    if(flags().components){const vs=48/Math.max(1,...all.map(a=>Math.sqrt(a.params.u*a.params.u+2*a.params.g*a.params.h))),px=X(r.x),py=Y(r.y);svg+=arr(px,py,px+r.vx*vs,py,blue)+arr(px+r.vx*vs,py,px+r.vx*vs,py-r.vy*vs,red)+arr(px,py,px+r.vx*vs,py-r.vy*vs,ink);}
    svg+=dot(X(r.x),Y(r.y),blue,7);
    if(!compact)svg+=txt(695,82,'Horizontal motion',blue,14)+txt(695,110,'vₓ = '+num(r.vx)+' m/s',blue,17)+txt(695,156,'Vertical motion',red,14)+txt(695,184,'vᵧ = '+num(r.vy)+' m/s',red,17)+txt(695,216,'aᵧ = −'+num(params.g)+' m/s²',red,15)+txt(695,269,'Flight time '+num(r.T)+' s',ink,14)+txt(695,300,'Peak height '+num(r.H)+' m',ink,14);
    svg+=txt(36,395,time>=r.T-1e-8?(r.T===0?(compact?'Ground contact at release.':'Ground contact at release: no airborne interval.'):(compact?'Just before ground contact.':'At ground contact · velocity is immediately before impact.')):(compact?'Both directions share the same time.':'The same time t connects both directions.'),muted,13);
    return svg;
  }

  function draw(r){
    node('scene').setAttribute('role',model.id==='vectors'?'group':'img');node('scene').classList.toggle('force-drag-scene',model.id==='vectors');
    node('scene').classList.toggle('motion-visual',['motion','displacement','projectile','vectors','newton','momentum'].includes(model.id));
    if(!topics.has(model.id)){node('scene').setAttribute('viewBox','0 0 900 410');node('scene').style.aspectRatio='900 / 410';return false;}
    const visualRenderer=model.id==='motion'?window.MotionVisualLab:model.id==='displacement'?window.DisplacementVisualLab:model.id==='projectile'?window.ProjectileVisualLab:model.id==='vectors'?window.ForcesVisualLab:model.id==='newton'?window.TerminalVisualLab:model.id==='momentum'?window.CollisionVisualLab:null;
    if(visualRenderer){
      const scene=visualRenderer.render({params,time,duration:duration(model,params),result:r,runs:runs(),flags:flags(),compact:node('scene').clientWidth<600,stage:window.MotionLesson?.getStage(model.id)||0,displayWidth:node('scene').clientWidth,showWorking:model.id==='vectors'?window.ForceInteraction?.showWorking():model.id==='newton'?window.TerminalLesson?.showExplanation():model.id==='momentum'?window.CollisionLesson?.showWorking():true,camera:model.id==='vectors'?window.ForceInteraction?.getCamera():null});
      if(model.id==='vectors')window.ForceInteraction?.onRender(scene);
      node('scene').setAttribute('role',model.id==='vectors'?'group':'img');node('scene').classList.toggle('force-drag-scene',model.id==='vectors');
      node('scene').innerHTML=scene.svg;node('scene').setAttribute('viewBox',scene.viewBox);
      const dimensions=scene.viewBox.split(/\s+/).map(Number);node('scene').style.aspectRatio=dimensions[2]+' / '+dimensions[3];
      node('scene').setAttribute('aria-label',scene.ariaLabel);window.PhysicsVisualMath?.fitSVG(node('scene'));return true;
    }
    compact=node('scene').clientWidth<600;node('scene').setAttribute('viewBox',compact?'0 0 460 410':'0 0 900 410');node('scene').style.aspectRatio=compact?'460 / 410':'900 / 410';
    const svg=model.id==='projectile'?drawProjectile(r):model.id==='vectors'?drawVectors(r):model.id==='newton'?drawFall(r):drawMotion(r);
    node('scene').innerHTML=svg;
    node('scene').setAttribute('aria-label',model.title+'. '+outputs[model.id].map(([k,l,u])=>l+': '+(model.id==='vectors'&&k==='theta'&&r.R<1e-8?'undefined':num(r[k])+' '+u)).join('; '));
    return true;
  }

  function events(){
    const T=duration(model,params),out=[];
    if(['motion','displacement'].includes(model.id)&&params.a!==0){const t=-params.u/params.a;if(t>1e-8&&t<T)out.push({t,label:'Turning point'});}
    if(model.id==='projectile'){const t=params.u*Math.sin(params.theta*Math.PI/180)/params.g;if(t>1e-8&&t<T)out.push({t,label:'Highest point'});}
    if(model.id==='newton'&&params.deploy){out.push({t:params.open,label:'Canopy starts opening'});out.push({t:params.open+3,label:'Canopy fully open'});}
    if(model.id==='momentum'){const r=calc(model.id,params,time);if(r.collisionInRun)out.push({t:r.tc,label:'Contact'});}
    out.push({t:T,label:model.id==='projectile'?'Ground contact':model.timeline?'Diagram complete':'End'});
    return out;
  }
  function onUpdate(){
    const supported=topics.has(model.id),f=flags(),T=duration(model,params),timeline=!!model.timeline;
    if(node('stepForward')){
      node('stepBack').hidden=node('stepForward').hidden=node('eventJump').hidden=!supported;
      node('displayOptions').hidden=!supported;
      node('stepBack').textContent=timeline?'−25%':'−1 s';node('stepForward').textContent=timeline?'+25%':'+1 s';
      node('stepBack').disabled=time<=1e-8;node('stepForward').disabled=time>=T-1e-8;
      const event=events().find(e=>e.t>time+1e-8);node('eventJump').textContent=event?event.label:'End';node('eventJump').disabled=!event;
      for(const [key,id] of [['components','showComponents'],['projections','showProjections'],['ghosts','showGhosts']])node(id).checked=f[key];
      node('play').disabled=T<=0;
      node('time').disabled=T<=0;node('time').style.setProperty('--range-fill',(T>0?100*time/T:0)+'%');
      node('stepBack').setAttribute('aria-label',timeline?'Step back 25 percent of construction':'Step back one second');
      node('stepForward').setAttribute('aria-label',timeline?'Advance 25 percent of construction':'Advance one second');
      const componentLabel=model.id==='projectile'?'Velocity components':model.id==='vectors'?'Signed components':model.id==='newton'?'Force arrows':'Velocity arrow';
      node('showComponents').parentElement.lastChild.textContent=' '+componentLabel;
      node('showProjections').parentElement.lastChild.textContent=' '+(['projectile','vectors'].includes(model.id)?'Axis projections':'Graph guides');
    }
    if(supported)renderRuns();
  }
  function renderRuns(){
    const box=node('comparison'),signature=JSON.stringify([model.id,list()]);
    node('capture').disabled=list().length>=4;
    if(signature===comparisonSignature&&box.querySelector('.saved-run')){updateRunValues();return;}
    comparisonSignature=signature;box.replaceChildren();
    if(!list().length){tag('p','Keep up to four runs, then change one parameter. '+(model.id==='vectors'?'Vectors':model.id==='momentum'?'Momentum bars':'Curves')+' use one shared scale.',box,'muted');return;}
    tag('p',model.id==='momentum'?'Saved signed total momentum uses the same bar scale as the live pair. Values use the current time.':model.id==='vectors'?'Saved resultant vectors; the live diagram shows both forces and their resultant.':'Full model curves. Values below use the current time, capped at each run’s end.',box,'muted');
    list().forEach((run,i)=>{
      const row=tag('div',undefined,box,'saved-run'),heading=tag('div',undefined,row,'run-heading');
      tag('strong','Run '+run.label,heading);
      const remove=tag('button','Remove',heading,'quiet');remove.setAttribute('aria-label','Remove run '+run.label);remove.onclick=()=>{list().splice(i,1);update(true)};
      tag('p',model.controls.map(c=>c.label+' '+(c.options?c.options.find(o=>o.value===run.params[c.key])?.label:num(run.params[c.key])+' '+c.unit)).join(' · '),row,'muted');
      const t=Math.min(time,run.T),r=calc(model.id,run.params,t),key=outputs[model.id][0];
      tag('p','',row,'run-value');
    });
    updateRunValues();
  }
  function updateRunValues(){
    node('comparison').querySelectorAll('.run-value').forEach((el,i)=>{const run=list()[i],t=Math.min(time,run.T),r=calc(model.id,run.params,t),key=outputs[model.id][0];el.textContent=(model.timeline?'':`Time ${num(t)} s · `)+key[1]+' '+num(r[key[0]])+' '+key[2]+(model.id==='vectors'?' · direction '+(r.R<1e-8?'undefined':num(r.theta)+'°'):'');});
  }
  function guide(){
    const box=node('investigation');if(!box)return;box.replaceChildren();
    const g=window.OPENING_GUIDES?.[model.id];box.hidden=!g;if(!g)return;
    const title=tag('h3',g.question,box);const prompt=tag('p',g.prompt,box);
    const detail=tag('details',undefined,box);tag('summary','Explain the observation',detail);tag('p',g.answer,detail);const expression=tag('div',undefined,detail,'math');math(expression,g.tex);prose(box);
  }
  function examLink(){
    const scenarios={motion:{u:2,a:1.5},vectors:{F:6,angle:0,B:8,beta:90},projectile:{u:20,theta:30,h:0,g:9.81},momentum:{m1:2,m2:2,u1:4,u2:0,e:0}};
    if(!scenarios[model.id])return;
    const row=tag('div',undefined,node('exam'),'exam-lab-link');node('exam').prepend(row);
    const b=tag('button','Use question values in the lab',row);b.onclick=()=>{labDebug.setParams(scenarios[model.id]);node('tab-derive').click();node('scene').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});};
    if(model.id==='motion')tag('p','The question uses the first 4 s; the lab timeline extends to 6 s.',row,'muted');
  }
  function init(){
    if(!node('stepForward'))return;
    window.OpeningLab={draw,onUpdate,supports:id=>topics.has(id),getRuns:()=>structuredClone(list()),events};
    node('stepForward').onclick=()=>{stop();time=Math.min(duration(model,params),time+(model.timeline ? .25 : 1));update(true)};
    node('stepBack').onclick=()=>{stop();time=Math.max(0,time-(model.timeline ? .25 : 1));update(true)};
    node('eventJump').onclick=()=>{stop();const e=events().find(e=>e.t>time+1e-8);if(e)time=e.t;update(true)};
    for(const [key,id] of [['components','showComponents'],['projections','showProjections'],['ghosts','showGhosts']])node(id).onchange=()=>{flags()[key]=node(id).checked;update(true)};
    const oldCapture=node('capture').onclick,oldClear=node('clearCompare').onclick;
    node('capture').onclick=()=>{if(!topics.has(model.id)){oldCapture();return;}if(list().length>=4)return;serial[model.id]=(serial[model.id]||0)+1;list().push({label:String.fromCharCode(64+serial[model.id]),params:{...params},T:duration(model,params)});pinned=null;update(true)};
    node('clearCompare').onclick=()=>{if(!topics.has(model.id)){oldClear();return;}kept[model.id]=[];serial[model.id]=0;update(true)};
    document.addEventListener('physics-topic-change',()=>{node('capture').disabled=false;guide();examLink();onUpdate();update(true)});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
    let lastWidth=0;new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(Math.abs(width-lastWidth)>1){lastWidth=width;update(true)}}).observe(node('scene'));
    guide();examLink();update(true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
