/* Lesson 2: live displacement, tangents, signed areas and constant-acceleration proof. */
(function (scope) {
  'use strict';
  const C=Object.freeze({bg:'#000000',ink:'#f1f4fa',muted:'#b4bfd0',grid:'#344257',axis:'#8594aa',initial:'#58c4dd',gain:'#f4d345',negative:'#e2a4b6',runs:['#c5b7ec','#e8a7b7','#91bcb2','#88b5ef']});
  const EPS=1e-9;
  const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const bound=(value,low,high,fallback=0)=>Math.max(low,Math.min(high,finite(value,fallback)));
  const clean=p=>({u:bound(p&&p.u,-8,12,4),a:bound(p&&p.a,-4,4,-1)});
  const zero=value=>Math.abs(value)<EPS?0:value;
  const f=(value,digits=2)=>zero(value).toFixed(digits).replace(/\.0+$/,'').replace(/(\.\d)0$/,'$1').replace('-','−');
  const signed=value=>(zero(value)>0?'+':'')+f(value);
  const tf=(value,digits=2)=>f(value,digits).replace('−','-');
  const ts=value=>(zero(value)>0?'+':'')+tf(value);
  const eq=value=>Math.abs(Number(tf(value))-zero(value))<1e-9?'=':'\\approx';
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=value=>Math.round(finite(value)*1000)/1000;

  /** Signed area, total path length and SUVAT invariants, without division by a or t. */
  function analyse(params,elapsed) {
    const {u,a}=clean(params),time=bound(elapsed,0,6);
    const initialContribution=u*time,accelerationContribution=.5*a*time*time;
    const displacement=initialContribution+accelerationContribution,velocity=u+a*time;
    const candidate=Math.abs(a)>EPS?-u/a:null;
    const turningTime=candidate!==null&&candidate>EPS&&candidate<time-EPS?candidate:null;
    const primitive=q=>u*q+.5*a*q*q;
    const pieces=[0,...(turningTime===null?[]:[turningTime]),time];
    let positiveArea=0,negativeArea=0;
    for(let i=1;i<pieces.length;i++){
      const area=primitive(pieces[i])-primitive(pieces[i-1]);
      if(area>=0)positiveArea+=area;else negativeArea+=area;
    }
    return {u,a,time,initialContribution:zero(initialContribution),accelerationContribution:zero(accelerationContribution),displacement:zero(displacement),distance:zero(positiveArea-negativeArea),turningTime,velocity:zero(velocity),positiveArea:zero(positiveArea),negativeArea:zero(negativeArea),velocitySquared:zero(velocity*velocity),initialVelocitySquared:zero(u*u),twiceAccelerationDisplacement:zero(2*a*displacement)};
  }
  function ticks(low,high,count=4){
    const raw=Math.max(high-low,EPS)/count,power=10**Math.floor(Math.log10(raw)),fraction=raw/power;
    const step=(fraction<=1?1:fraction<=2?2:fraction<=5?5:10)*power,values=[];
    for(let value=Math.ceil((low-EPS)/step)*step;value<=high+EPS&&values.length<12;value+=step)values.push(zero(value));
    return values;
  }
  function positionExtrema(params,T){
    const end=analyse(params,T),values=[0,end.displacement];
    if(end.turningTime!==null)values.push(analyse(params,end.turningTime).displacement);
    return values;
  }
  function paddedRange(values,minSpan=1,padding=.15){
    let low=Math.min(...values),high=Math.max(...values);
    if(high-low<minSpan){const middle=(low+high)/2;low=middle-minSpan/2;high=middle+minSpan/2;}
    const pad=(high-low)*padding;return {low:low-pad,high:high+pad};
  }
  function render(options={}){
    const p=clean(options.params),T=bound(options.duration,.1,6,6),t=bound(options.time,0,T),r=analyse(p,t);
    const compact=!!options.compact,W=compact?460:900,H=compact?840:640;
    const stage=Math.round(bound(options.stage,0,4)),flags=options.flags||{};
    const runs=(Array.isArray(options.runs)?options.runs:[]).slice(0,4).map((run,index)=>({params:clean(run.params),T:bound(run.T,.1,6,T),label:String(run.label||String.fromCharCode(65+index)).slice(0,22),color:C.runs[index],dash:['5 5','2 5','10 4','8 3 2 3'][index]}));
    const horizon=Math.max(T,...runs.map(run=>run.T)),legendRows=runs.length?(compact?Math.ceil(runs.length/2):1):0;
    const graph=compact?{x:64,y:100+24*legendRows,w:348,h:250-24*legendRows}:{x:74,y:110+24*legendRows,w:420,h:280-24*legendRows};
    const allPositions=[...positionExtrema(p,T),...runs.flatMap(run=>positionExtrema(run.params,run.T))];
    const positionRange=paddedRange(allPositions,2),trackRange=paddedRange(allPositions,4,.18);
    const velocities=[0,p.u,p.u+p.a*T,...runs.flatMap(run=>[run.params.u,run.params.u+run.params.a*run.T])];
    const velocityRange=paddedRange(velocities,2);
    const squareRange=paddedRange([0,...velocities.map(v=>v*v)],2);
    const curveStage=stage===0||stage===1,squareStage=stage===4;
    const vertical=curveStage?positionRange:squareStage?squareRange:velocityRange;
    const x=coordinate=>graph.x+(squareStage?(coordinate-positionRange.low)/(positionRange.high-positionRange.low):coordinate/horizon)*graph.w;
    const y=coordinate=>graph.y+graph.h-(coordinate-vertical.low)/(vertical.high-vertical.low)*graph.h;
    const xStart=x(squareStage?0:0),y0=y(0);
    const fs=compact?18:15,body=compact?17:16;
    const family="var(--visual-text-font,Arial,Helvetica,sans-serif)";
    const text=(X,Y,content,size=fs,color=C.ink,anchor='start')=>`<text x="${n(X)}" y="${n(Y)}" text-anchor="${anchor}" style="fill:${color};font-family:${family};font-size:${size}px">${esc(content)}</text>`;
    const math=(X,Y,tex,size=28,color=C.ink,anchor='start',width=compact?400:320)=>{
      const engine=scope&&scope.PhysicsVisualMath;
      if(engine&&typeof engine.svgMath==='function')return engine.svgMath(X,Y,tex,size,color,anchor,width);
      return `<g class="displacement-math-unavailable" data-tex="${esc(tex)}"><title>${esc('Mathematical expression: '+tex)}</title></g>`;
    };
    const line=(X,Y,X2,Y2,color=C.axis,width=1.5,dash='',opacity=1)=>`<line x1="${n(X)}" y1="${n(Y)}" x2="${n(X2)}" y2="${n(Y2)}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''} opacity="${opacity}"/>`;
    const dot=(X,Y,radius=4,color=C.ink,opacity=1)=>`<circle cx="${n(X)}" cy="${n(Y)}" r="${radius}" fill="${color}" opacity="${opacity}"/>`;
    const polygon=(points,color,opacity=.22,stroke=color,width=1)=>`<polygon points="${points.map(pt=>pt.map(n).join(',')).join(' ')}" fill="${color}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${width}"/>`;
    const arrow=(X,Y,X2,Y2,color=C.ink,width=2)=>{
      const length=Math.hypot(X2-X,Y2-Y);if(length<.5)return dot(X,Y,2,color);
      const angle=Math.atan2(Y2-Y,X2-X),head=Math.min(8,length*.4),wing=head*.52;
      return line(X,Y,X2,Y2,color,width)+polygon([[X2,Y2],[X2-head*Math.cos(angle)+wing*Math.sin(angle),Y2-head*Math.sin(angle)-wing*Math.cos(angle)],[X2-head*Math.cos(angle)-wing*Math.sin(angle),Y2-head*Math.sin(angle)+wing*Math.cos(angle)]],color,1,color,0);
    };
    const displacementTex=String.raw`s={\color{${C.initial}}ut}+{\color{${C.gain}}\frac12at^2}`;
    const pointFor=(params,q)=>{const state=analyse(params,q);return squareStage?[x(state.displacement),y(state.velocitySquared)]:[x(q),y(curveStage?state.displacement:state.velocity)];};
    const curve=(params,end,color,width=3,dash='',opacity=1)=>{
      const count=Math.max(1,Math.ceil(end/6*96)),points=Array.from({length:count+1},(_,index)=>pointFor(params,end*index/count));
      return `<polyline points="${points.map(pt=>pt.map(n).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''} opacity="${opacity}"/>`;
    };
    let svg=`<g class="displacement-visual" data-displacement-stage="${stage}"><rect width="${W}" height="${H}" fill="${C.bg}"/>`;
    svg+=text(compact?24:30,34,'THE SHAPE OF A JOURNEY',compact?15:14,C.muted)+math(W-(compact?24:30),35,String.raw`t${eq(t)}${tf(t)}\,\mathrm{s}`,compact?20:18,C.ink,'end',150);
    svg+=math(graph.x,graph.y-24,curveStage?String.raw`\text{DISPLACEMENT}\,/\,\mathrm{m}`:squareStage?String.raw`\text{SQUARED SPEED}\,/\,\mathrm{m^2\,s^{-2}}`:String.raw`\text{VELOCITY}\,/\,\mathrm{m\,s^{-1}}`,compact?16:14,C.muted,'start',330);
    if(stage===2&&t>EPS){
      const crossing=Math.abs(p.a)>EPS?-p.u/p.a:null,breaks=[0,...(crossing!==null&&crossing>0&&crossing<t?[crossing]:[]),t];
      for(let i=1;i<breaks.length;i++){
        const lo=breaks[i-1],hi=breaks[i],v0=p.u+p.a*lo,v1=p.u+p.a*hi,negative=v0+v1<0;
        svg+=polygon([[x(lo),y0],[x(lo),y(v0)],[x(hi),y(v1)],[x(hi),y0]],negative?C.negative:C.initial,.23,negative?C.negative:C.initial,1.3);
        if(negative)for(let xx=x(lo)+10;xx<x(hi);xx+=15){const q=(xx-graph.x)/graph.w*horizon;svg+=line(xx,y0+3,xx,Math.max(y0+3,y(p.u+p.a*q)-2),C.negative,1,'3 4',.7);}
      }
    }
    if(stage===3&&t>EPS){
      const xt=x(t),yu=y(p.u),yv=y(r.velocity);
      svg+=polygon([[x(0),y0],[xt,y0],[xt,yu],[x(0),yu]],C.initial,.22,C.initial,1.4);
      svg+=polygon([[x(0),yu],[xt,yu],[xt,yv]],C.gain,.24,C.gain,1.5);
      if(p.u*p.a<0)for(let k=1;k<8;k++){const q=t*k/8;svg+=line(x(q),yu,x(q),y(p.u+p.a*q),C.gain,1,'3 4',.65);}
      if(t/horizon>.4&&Math.abs(yu-y0)>35)svg+=math(x(t*.45),(yu+y0)/2+6,'ut',compact?23:24,C.initial,'middle',110);
      if(t/horizon>.4&&Math.abs(yv-yu)>65)svg+=math(x(t*.77),y(p.u+p.a*t*.32)+6,String.raw`\frac12at^2`,compact?21:22,C.gain,'middle',125);
    }
    // All scales use full run extrema. The time slider only changes the solid trace.
    for(const value of ticks(vertical.low,vertical.high))svg+=line(graph.x,y(value),graph.x+graph.w,y(value),C.grid,1,'3 7')+text(graph.x-12,y(value)+5,f(value,1),fs,C.muted,'end');
    const axisX=squareStage?x(0):graph.x;
    svg+=line(axisX,graph.y,axisX,graph.y+graph.h,C.axis,1.5)+line(graph.x,y0,graph.x+graph.w+5,y0,C.axis,1.8);
    const horizontalTicks=squareStage?ticks(positionRange.low,positionRange.high,compact?3:4):ticks(0,horizon,compact?3:4);
    for(const value of horizontalTicks)svg+=line(x(value),y0-4,x(value),y0+4,C.axis,1.5)+text(x(value),graph.y+graph.h+27,f(value,1),fs,C.muted,'middle');
    svg+=text(graph.x+graph.w,graph.y+graph.h+51,squareStage?'DISPLACEMENT / m':'TIME / s',compact?16:14,C.muted,'end');
    // The clip only trims optional tangent extensions; data and labels keep their full scales.
    svg+=`<defs><clipPath id="displacement-scene-plot"><rect x="${graph.x-2}" y="${graph.y-2}" width="${graph.w+4}" height="${graph.h+4}"/></clipPath></defs><g clip-path="url(#displacement-scene-plot)">`;
    for(const run of runs){svg+=curve(run.params,run.T,run.color,2,run.dash,.75);if(flags.ghosts!==false){const pt=pointFor(run.params,Math.min(t,run.T));svg+=dot(...pt,4,run.color,.8);}}
    svg+=curve(p,T,C.axis,1.7,'4 6',.7)+curve(p,t,C.ink,3.5);
    const current=pointFor(p,t);
    if(flags.projections!==false){svg+=line(current[0],y0,current[0],current[1],C.axis,1.3,'3 5',.8);if(curveStage)svg+=line(graph.x,current[1],current[0],current[1],C.axis,1.1,'3 5',.65);}
    if(stage===1){
      const pixelsPerSecond=Math.abs(r.velocity)/(vertical.high-vertical.low)*graph.h;
      const dt=Math.min(.85,Math.max(.12,64/Math.max(pixelsPerSecond,EPS))),left=Math.max(0,t-dt),right=Math.min(T,t+dt);
      svg+=line(x(left),y(r.displacement+r.velocity*(left-t)),x(right),y(r.displacement+r.velocity*(right-t)),C.gain,3.5);
      if(Math.abs(r.velocity)<EPS)svg+=line(Math.max(graph.x,current[0]-42),current[1],Math.min(graph.x+graph.w,current[0]+42),current[1],C.gain,3.5);
    }
    svg+=dot(...pointFor(p,0),3.5,C.initial)+dot(...current,5,C.ink)+'</g>';
    const fullTurn=Math.abs(p.a)>EPS?-p.u/p.a:null;
    if(fullTurn!==null&&fullTurn>EPS&&fullTurn<=t+EPS&&fullTurn<=T){
      const turnState=analyse(p,fullTurn),tx=squareStage?x(turnState.displacement):x(fullTurn),ty=y(curveStage?turnState.displacement:0);
      svg+=dot(tx,ty,4,C.gain);
      if(stage===1||stage===2)svg+=math(Math.max(graph.x+28,Math.min(graph.x+graph.w-28,tx)),ty-14,'v=0',compact?17:15,C.gain,'middle',100);
    }
    // Prose and formulae sit beside the graph on desktop, below it on mobile.
    const rx=compact?30:550,ry=compact?435:120,main=compact?30:31;
    const titles=['Read the position curve','The tangent is velocity','Signed area or total distance?','Build the displacement equation','Remove time from the equation'];
    svg+=text(rx,ry,String(stage+1).padStart(2,'0')+' / '+titles[stage],compact?17:16,C.muted);
    if(stage===0){
      svg+=math(rx,ry+44,displacementTex,main);
      svg+=math(rx,ry+90,String.raw`(${ts(r.initialContribution)})+(${ts(r.accelerationContribution)})`,compact?25:26);
      svg+=math(rx,ry+136,String.raw`s${eq(r.displacement)}${ts(r.displacement)}\,\mathrm{m}`,main);
      svg+=math(rx,ry+176,String.raw`v${eq(r.velocity)}${ts(r.velocity)}\,\mathrm{m\,s^{-1}}`,compact?19:18,C.muted);
    }else if(stage===1){
      svg+=math(rx,ry+44,String.raw`\frac{\mathrm{d}s}{\mathrm{d}t}=v`,main,C.gain);
      svg+=math(rx,ry+92,String.raw`v=u+at${eq(r.velocity)}${ts(r.velocity)}\,\mathrm{m\,s^{-1}}`,compact?24:25);
      svg+=math(rx,ry+136,String.raw`a${eq(p.a)}${ts(p.a)}\,\mathrm{m\,s^{-2}}`,compact?27:28);
      svg+=text(rx,ry+177,Math.abs(r.velocity)<EPS&&Math.abs(p.a)>EPS?'Zero velocity can have nonzero acceleration.':r.velocity<0?'Negative slope: moving towards the left.':r.velocity>0?'Positive slope: moving towards the right.':'Zero slope: position stays constant.',body,C.muted);
    }else if(stage===2){
      svg+=math(rx,ry+40,String.raw`A_{+}${eq(r.positiveArea)}${ts(r.positiveArea)}\,\mathrm{m}`,compact?25:25,C.initial);
      svg+=math(rx,ry+82,String.raw`A_{-}${eq(r.negativeArea)}${ts(r.negativeArea)}\,\mathrm{m}`,compact?25:25,C.negative);
      svg+=math(rx,ry+126,String.raw`s=A_{+}+A_{-}${eq(r.displacement)}${ts(r.displacement)}\,\mathrm{m}`,compact?27:28);
      svg+=math(rx,ry+171,String.raw`d=A_{+}-A_{-}${eq(r.distance)}${tf(r.distance)}\,\mathrm{m}`,compact?27:28);
      if(!compact)svg+=text(rx,ry+209,'Distance adds both area magnitudes.',body,C.muted);
    }else if(stage===3){
      svg+=math(rx,ry+43,displacementTex,main);
      svg+=math(rx,ry+90,String.raw`ut${eq(r.initialContribution)}${ts(r.initialContribution)}\,\mathrm{m}`,compact?26:27,C.initial);
      svg+=math(rx,ry+136,String.raw`\frac12at^2${eq(r.accelerationContribution)}${ts(r.accelerationContribution)}\,\mathrm{m}`,compact?26:27,C.gain);
      svg+=math(rx,ry+182,String.raw`s${eq(r.displacement)}${ts(r.displacement)}\,\mathrm{m}`,main);
      if(!compact)svg+=text(rx,ry+221,p.u*p.a<0?'Opposite signs: overlapping areas cancel.':'Both terms describe the same journey.',body,C.muted);
    }else{
      svg+=math(rx,ry+42,String.raw`2as=a(u+v)t`,compact?25:26);
      svg+=math(rx,ry+84,String.raw`=(u+v)(v-u)`,compact?26:27);
      svg+=math(rx,ry+129,String.raw`v^2=u^2+2as`,main);
      svg+=math(rx,ry+172,String.raw`${tf(r.velocitySquared)}${[r.velocitySquared,r.initialVelocitySquared,r.twiceAccelerationDisplacement].every(value=>eq(value)==='=')?'=':String.raw`\approx`}${tf(r.initialVelocitySquared)}+(${ts(r.twiceAccelerationDisplacement)})`,compact?26:27);
      svg+=math(rx,ry+212,String.raw`v${eq(r.velocity)}${ts(r.velocity)}\,\mathrm{m\,s^{-1}}`,compact?19:18,C.muted);
    }
    // A physical position track shares the same parameters, clock and saved runs.
    const track={x:compact?52:76,w:compact?352:750,y:compact?754:540};
    const X=position=>track.x+(position-trackRange.low)/(trackRange.high-trackRange.low)*track.w;
    svg+=text(track.x,track.y-58,'POSITION / m',compact?17:14,C.muted)+math(track.x+track.w,track.y-57,String.raw`x${eq(r.displacement)}${ts(r.displacement)}\,\mathrm{m}`,compact?21:20,C.ink,'end',210);
    svg+=line(track.x,track.y,track.x+track.w,track.y,C.axis,1.6);
    for(const value of ticks(trackRange.low,trackRange.high,compact?3:5))svg+=line(X(value),track.y-4,X(value),track.y+4,C.axis,1.4)+text(X(value),track.y+27,f(value,1),fs,C.muted,'middle');
    svg+=line(X(0),track.y-9,X(0),track.y+9,C.initial,2);
    if(t>EPS)svg+=line(X(0),track.y,X(r.displacement),track.y,C.ink,4);
    if(fullTurn!==null&&fullTurn>EPS&&fullTurn<=t+EPS&&fullTurn<=T){const turningPosition=analyse(p,fullTurn).displacement;svg+=dot(X(turningPosition),track.y,3.5,C.gain)+text(X(turningPosition),track.y+48,'turn',compact?17:14,C.gain,'middle');}
    const trolley=(position,color,opacity=1)=>{const xx=X(position),yy=track.y-19;return `<g opacity="${opacity}"><rect x="${n(xx-12)}" y="${n(yy-10)}" width="24" height="17" rx="4" fill="${color}"/>`+dot(xx-7,yy+10,3,color)+dot(xx+7,yy+10,3,color)+'</g>';};
    if(flags.ghosts!==false)for(const run of runs)svg+=trolley(analyse(run.params,Math.min(t,run.T)).displacement,run.color,.45);
    svg+=trolley(r.displacement,C.ink);
    if(flags.components!==false&&Math.abs(r.velocity)>EPS){const xx=X(r.displacement),length=Math.min(46,12+Math.abs(r.velocity)*1.1)*Math.sign(r.velocity);svg+=arrow(xx,track.y-40,xx+length,track.y-40,C.ink,2);}
    const footer=stage===4?'Squared speed does not determine direction.':stage===3&&p.u*p.a<0?'Signed contributions overlap and cancel.':stage===1&&Math.abs(r.velocity)<EPS&&Math.abs(p.a)>EPS?'A horizontal tangent can have nonzero acceleration.':stage===2?'Displacement uses signs; distance uses magnitudes.':r.turningTime!==null?'The trolley reverses; distance keeps increasing.':'Right is positive · one shared physical clock';
    svg+=text(W/2,H-19,footer,compact?16:15,C.muted,'middle');
    runs.forEach((run,index)=>{const lx=compact?24+(index%2)*218:30+index*211,ly=compact?61+Math.floor(index/2)*24:62;svg+=line(lx,ly,lx+18,ly,run.color,2,run.dash)+text(lx+24,ly+5,run.label,compact?14:13,run.color);});
    svg+='</g>';
    const ariaLabel='Live displacement lesson, view '+(stage+1)+': '+titles[stage]+'. Time '+f(t)+' seconds; initial velocity '+f(p.u)+' metres per second; acceleration '+f(p.a)+' metres per second squared; velocity '+signed(r.velocity)+' metres per second; displacement '+signed(r.displacement)+' metres; distance '+f(r.distance)+' metres. Positive velocity–time area '+f(r.positiveArea)+' metres; negative area '+f(r.negativeArea)+' metres. Cyan initial-velocity contribution '+signed(r.initialContribution)+' metres; amber acceleration contribution '+signed(r.accelerationContribution)+' metres.'+(r.turningTime!==null?' Direction reversed at '+f(r.turningTime)+' seconds.':'')+(stage===4?' Squared speed does not encode the direction of motion.':'');
    return {svg,viewBox:`0 0 ${W} ${H}`,ariaLabel};
  }
  const api=Object.freeze({render,analyse});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(scope)scope.DisplacementVisualLab=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
