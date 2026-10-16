/* Lesson 1: live mathematical scene. Pure SVG, driven by the lab's physical clock. */
(function (scope) {
  'use strict';
  const C = Object.freeze({bg:'#000000', ink:'#f1f4fa', muted:'#b4bfd0', grid:'#344257', axis:'#8594aa', initial:'#58c4dd', gain:'#f4d345', negative:'#e2a4b6', runs:['#c5b7ec','#e8a7b7','#91bcb2','#88b5ef']});
  const EPS = 1e-9;
  const finite = (value, fallback=0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const bound = (value, low, high, fallback=0) => Math.max(low, Math.min(high, finite(value, fallback)));
  const clean = p => ({u:bound(p && p.u,-8,12,2),a:bound(p && p.a,-4,4,1.5)});
  const zero = v => Math.abs(v)<EPS ? 0 : v;
  const f = (value, digits=2) => zero(value).toFixed(digits).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1').replace('-','−');
  const signed = value => (zero(value)>0?'+':'')+f(value);
  const tf = (value, digits=2) => f(value,digits).replace('−','-');
  const ts = value => (zero(value)>0?'+':'')+tf(value);
  const eq = value => Math.abs(Number(tf(value))-zero(value))<1e-9?'=':'\\approx';
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n = value => Math.round(finite(value)*1000)/1000;

  /** Exact constant-acceleration analysis, including total path length after reversal. */
  function analyse(params, elapsed) {
    const {u,a}=clean(params), time=bound(elapsed,0,6);
    const initialContribution=u*time, accelerationContribution=.5*a*time*time;
    const displacement=initialContribution+accelerationContribution, velocity=u+a*time;
    const candidate=Math.abs(a)>EPS ? -u/a : null;
    const turningTime=candidate!==null && candidate>EPS && candidate<time-EPS ? candidate : null;
    const turningPosition=turningTime===null ? null : u*turningTime+.5*a*turningTime*turningTime;
    const distance=turningTime===null ? Math.abs(displacement) : Math.abs(turningPosition)+Math.abs(displacement-turningPosition);
    return {u,a,time,initialContribution:zero(initialContribution),accelerationContribution:zero(accelerationContribution),displacement:zero(displacement),distance:zero(distance),turningTime,velocity:zero(velocity)};
  }

  function stepSize(range, count=4) {
    const raw=Math.max(range,EPS)/count, power=10**Math.floor(Math.log10(raw)), fraction=raw/power;
    return (fraction<=1?1:fraction<=2?2:fraction<=5?5:10)*power;
  }
  function ticks(low, high, count=4) {
    const step=stepSize(high-low,count), values=[];
    for(let v=Math.ceil((low-EPS)/step)*step;v<=high+EPS && values.length<12;v+=step) values.push(zero(v));
    return values;
  }
  function extrema(params,T) {
    const end=analyse(params,T), values=[0,end.displacement];
    if(end.turningTime!==null)values.push(analyse(params,end.turningTime).displacement);
    return values;
  }
  function render(options={}) {
    const p=clean(options.params), T=bound(options.duration,.1,6,6), t=bound(options.time,0,T), r=analyse(p,t);
    const compact=!!options.compact, W=compact?460:900, H=compact?700:570;
    const stage=Math.round(bound(options.stage,0,4)), flags=options.flags||{};
    const runs=(Array.isArray(options.runs)?options.runs:[]).slice(0,4).map((run,i)=>({params:clean(run.params),T:bound(run.T,.1,6,T),label:String(run.label || String.fromCharCode(65+i)).slice(0,22),color:C.runs[i],dash:['5 5','2 5','10 4','8 3 2 3'][i]}));
    const horizon=Math.max(T,...runs.map(run=>run.T));
    const legendRows=runs.length?(compact?Math.ceil(runs.length/2):1):0;
    const graph=compact?{x:62,y:95+24*legendRows,w:350,h:222-24*legendRows}:{x:70,y:104+24*legendRows,w:420,h:249-24*legendRows};
    const allVelocities=[0,p.u,p.u+p.a*T,...runs.flatMap(run=>[run.params.u,run.params.u+run.params.a*run.T])];
    let vLow=Math.min(...allVelocities),vHigh=Math.max(...allVelocities);
    if(vHigh-vLow<1){vLow-=1;vHigh+=1;}
    const vPad=(vHigh-vLow)*.14;
    vLow-=vPad;vHigh+=vPad;
    const x=time=>graph.x+time/horizon*graph.w, y=velocity=>graph.y+graph.h-(velocity-vLow)/(vHigh-vLow)*graph.h;
    const y0=y(0), yU=y(p.u), yV=y(r.velocity), xt=x(t);
    const fs=compact?17:15;
    const family="var(--visual-text-font,Arial,Helvetica,sans-serif)";
    const text=(X,Y,content,size=fs,color=C.ink,anchor='start',extra='')=>`<text x="${n(X)}" y="${n(Y)}" text-anchor="${anchor}" style="fill:${color};font:${size}px ${family};${extra}">${esc(content)}</text>`;
    const math=(X,Y,tex,size=28,color=C.ink,anchor='start',width=compact?400:320)=>{
      const engine=scope&&scope.PhysicsVisualMath;
      if(engine&&typeof engine.svgMath==='function')return engine.svgMath(X,Y,tex,size,color,anchor,width);
      return `<g class="motion-math-unavailable" data-tex="${esc(tex)}"><title>${esc('Mathematical expression: '+tex)}</title></g>`;
    };
    const line=(X,Y,X2,Y2,color=C.axis,width=1.5,dash='',opacity=1)=>`<line x1="${n(X)}" y1="${n(Y)}" x2="${n(X2)}" y2="${n(Y2)}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''} opacity="${opacity}"/>`;
    const dot=(X,Y,radius=4,color=C.ink,opacity=1)=>`<circle cx="${n(X)}" cy="${n(Y)}" r="${radius}" fill="${color}" opacity="${opacity}"/>`;
    const polygon=(points,color,opacity=.23,stroke=color,width=1)=>`<polygon points="${points.map(pt=>pt.map(n).join(',')).join(' ')}" fill="${color}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${width}"/>`;
    const arrow=(X,Y,X2,Y2,color=C.ink,width=2)=>{
      const length=Math.hypot(X2-X,Y2-Y);
      if(length<.5)return dot(X,Y,2.2,color);
      const angle=Math.atan2(Y2-Y,X2-X),head=Math.min(8,length*.4),wing=head*.52;
      return line(X,Y,X2,Y2,color,width)+polygon([[X2,Y2],[X2-head*Math.cos(angle)+wing*Math.sin(angle),Y2-head*Math.sin(angle)-wing*Math.cos(angle)],[X2-head*Math.cos(angle)-wing*Math.sin(angle),Y2-head*Math.sin(angle)+wing*Math.cos(angle)]],color,1,color,0);
    };
    const semantic=(X,Y,tex,size=30)=>math(X,Y,tex,size);
    const velocityTex=String.raw`v={\color{${C.initial}}u}+{\color{${C.gain}}at}`;
    const displacementTex=String.raw`s={\color{${C.initial}}ut}+{\color{${C.gain}}\frac12at^2}`;
    let svg=`<g class="motion-visual" data-motion-stage="${stage}"><rect width="${W}" height="${H}" fill="${C.bg}"/>`;
    svg+=text(compact?24:30,34,'ONE CLOCK · TWO VIEWS',compact?15:14,C.muted);
    svg+=math(W-(compact?24:30),35,String.raw`t${eq(t)}${tf(t)}\,\mathrm{s}`,compact?19:18,C.ink,'end',150);
    svg+=math(graph.x,graph.y-24,String.raw`\text{VELOCITY}\,/\,\mathrm{m\,s^{-1}}`,compact?16:14,C.muted,'start',300);
    // Area is always signed. Negative actual area is hatched as well as labelled.
    if(stage===2 && t>EPS){
      const crossing=Math.abs(p.a)>EPS?-p.u/p.a:null;
      const breaks=[0,...(crossing!==null && crossing>0 && crossing<t?[crossing]:[]),t];
      for(let i=1;i<breaks.length;i++){
        const lo=breaks[i-1],hi=breaks[i],v0=p.u+p.a*lo,v1=p.u+p.a*hi,negative=(v0+v1)<0;
        const pts=[[x(lo),y0],[x(lo),y(v0)],[x(hi),y(v1)],[x(hi),y0]];
        svg+=polygon(pts,negative?C.negative:C.initial,negative?.22:.19,negative?C.negative:C.initial,1);
        if(negative){
          const left=x(lo),right=x(hi);
          for(let xx=left+10;xx<right;xx+=16){
            const localTime=(xx-graph.x)/graph.w*horizon,yy=y(p.u+p.a*localTime);
            svg+=line(xx,y0+3,xx,Math.max(y0+3,yy-2),C.negative,1,'3 4',.5);
          }
        }
      }
    }
    if(stage>=3 && t>EPS){
      svg+=polygon([[x(0),y0],[xt,y0],[xt,yU],[x(0),yU]],C.initial,.2,C.initial,1.4);
      svg+=polygon([[x(0),yU],[xt,yU],[xt,yV]],C.gain,.24,C.gain,1.5);
      // Dashed interior rays distinguish a signed, overlapping triangle from the rectangle.
      if(p.u*p.a<0){
        for(let k=1;k<8;k++){
          const q=k/8,xx=x(t*q),yy=y(p.u+p.a*t*q);
          svg+=line(xx,yU,xx,yy,C.gain,1,'3 4',.65);
        }
      }
    }
    // Sparse shared axes. Scales depend on full runs, never elapsed time.
    for(const velocity of ticks(vLow,vHigh)){
      svg+=line(graph.x,y(velocity),graph.x+graph.w,y(velocity),C.grid,1,'3 7');
      svg+=text(graph.x-12,y(velocity)+5,f(velocity,1),fs,C.muted,'end');
    }
    svg+=line(graph.x,graph.y,graph.x,graph.y+graph.h,C.axis,1.5)+line(graph.x,y0,graph.x+graph.w+6,y0,C.axis,1.8);
    for(const time of ticks(0,horizon,compact?3:4)){
      svg+=line(x(time),y0-4,x(time),y0+4,C.axis,1.5);
      svg+=text(x(time),graph.y+graph.h+25,f(time,1),fs,C.muted,'middle');
    }
    svg+=text(graph.x+graph.w,graph.y+graph.h+49,'TIME / s',compact?15:14,C.muted,'end');
    // Whole-run dashed curves and current curve form a single physical coordinate system.
    for(const run of runs){
      svg+=line(x(0),y(run.params.u),x(run.T),y(run.params.u+run.params.a*run.T),run.color,2,run.dash,.75);
      if(flags.ghosts!==false){const rt=Math.min(t,run.T);svg+=dot(x(rt),y(run.params.u+run.params.a*rt),4,run.color,.8);}
    }
    svg+=line(x(0),yU,x(T),y(p.u+p.a*T),C.axis,1.6,'4 6',.7);
    svg+=line(x(0),yU,xt,yV,C.ink,3.5);
    if(flags.projections!==false){
      svg+=line(xt,y0,xt,yV,C.axis,1.25,'3 5',.85);
      if(stage===1){
        svg+=line(x(0),yU,xt,yU,C.initial,2,'5 4')+line(xt,yU,xt,yV,C.gain,3);
      }
    }
    svg+=dot(x(0),yU,3.5,C.initial)+dot(xt,yV,5,C.ink);
    if(stage===2 && t>EPS){
      const dt=Math.min(.3,t),ta=t-dt,va=p.u+p.a*ta;
      svg+=polygon([[x(ta),y0],[xt,y0],[xt,yV],[x(ta),y(va)]],C.gain,.44,C.gain,1.4);
      const bracketY=y0+(r.velocity>=0?18:-18),bracketLabelY=bracketY+(r.velocity>=0?18:-9);
      svg+=line(x(ta),bracketY,xt,bracketY,C.gain,1.3)+line(x(ta),bracketY-3,x(ta),bracketY+3,C.gain,1.3)+line(xt,bracketY-3,xt,bracketY+3,C.gain,1.3);
      svg+=math(Math.min(graph.x+graph.w-2,Math.max(graph.x+25,(x(ta)+xt)/2)),bracketLabelY,String.raw`\Delta t`,fs,C.gain,'middle',64);
    }
    if(stage>=3 && t/horizon>.35){
      if(Math.abs(yU-y0)>28)svg+=math((x(0)+xt)/2,(y0+yU)/2+6,'ut',compact?22:23,C.initial,'middle',100);
      if(Math.abs(yV-yU)>65)svg+=math(x(t*.74),y(p.u+p.a*t*.33)+6,String.raw`\frac12at^2`,compact?20:22,C.gain,'middle',120);
    }
    if(r.turningTime!==null && stage>=2){
      svg+=dot(x(r.turningTime),y0,4,C.gain)+math(x(r.turningTime),y0-12,'v=0',compact?16:14,C.gain,'middle',100);
    }
    // Responsive reasoning block: right on desktop, below the graph on narrow screens.
    const rx=compact?30:548, ry=compact?397:114, size=compact?28:30, body=compact?17:16;
    const sectionNames=['Motion becomes a graph','Read the gradient','Add the small displacements','Split the signed area','The picture becomes an equation'];
    svg+=text(rx,ry,String(stage+1).padStart(2,'0')+' / '+sectionNames[stage],compact?17:16,C.muted);
    if(stage===0){
      svg+=semantic(rx,ry+44,velocityTex,size);
      svg+=math(rx,ry+82,String.raw`${tf(p.u)}+(${tf(p.a)})\times${tf(t)}`,compact?23:23);
      svg+=math(rx,ry+125,String.raw`v${eq(r.velocity)}${tf(r.velocity)}\,\mathrm{m\,s^{-1}}`,size);
      if(!compact)svg+=text(rx,ry+166,p.a===0?'Zero acceleration: velocity stays constant.':'The trolley and dot share the same time.',body,C.muted);
    }else if(stage===1){
      svg+=math(rx,ry+44,t<EPS?String.raw`a=\frac{\mathrm{d}v}{\mathrm{d}t}`:String.raw`a=\frac{v-u}{t}`,size);
      svg+=math(rx,ry+90,String.raw`{\color{${C.gain}}\Delta v=at${eq(p.a*t)}${ts(p.a*t)}\,\mathrm{m\,s^{-1}}}`,compact?24:25);
      svg+=math(rx,ry+132,String.raw`a${eq(p.a)}${tf(p.a)}\,\mathrm{m\,s^{-2}}`,size,C.gain);
      if(!compact)svg+=text(rx,ry+173,t<EPS?'At the start, use the constant line slope.':'Constant slope means constant acceleration.',body,C.muted);
    }else if(stage===2){
      svg+=math(rx,ry+43,String.raw`\Delta s\approx v\,\Delta t`,size);
      svg+=math(rx,ry+85,String.raw`\text{signed area}${eq(r.displacement)}${tf(r.displacement)}\,\mathrm{m}`,compact?25:27,C.initial);
      const dt=Math.min(.3,t),prior=analyse(p,t-dt),ds=r.displacement-prior.displacement;
      svg+=math(rx,ry+126,String.raw`\Delta t${eq(dt)}${tf(dt)}\,\mathrm{s}:\quad\Delta s${eq(ds)}${ts(ds)}\,\mathrm{m}`,compact?20:21,C.gain);
      if(!compact)svg+=text(rx,ry+167,'Below the time axis counts negatively.',body,C.muted);
    }else if(stage===3){
      svg+=math(rx,ry+42,String.raw`ut${eq(r.initialContribution)}${ts(r.initialContribution)}\,\mathrm{m}`,compact?25:27,C.initial);
      svg+=math(rx,ry+86,String.raw`\frac12at^2${eq(r.accelerationContribution)}${ts(r.accelerationContribution)}\,\mathrm{m}`,compact?25:27,C.gain);
      svg+=math(rx,ry+132,String.raw`s${eq(r.displacement)}${tf(r.displacement)}\,\mathrm{m}`,size);
      if(!compact)svg+=text(rx,ry+173,p.u*p.a<0?'Opposite signs: overlapping areas cancel.':'Two contributions to the same journey.',body,C.muted);
    }else{
      svg+=semantic(rx,ry+43,displacementTex,size);
      svg+=math(rx,ry+89,String.raw`(${ts(r.initialContribution)})+(${ts(r.accelerationContribution)})`,compact?23:24);
      svg+=math(rx,ry+135,String.raw`s${eq(r.displacement)}${tf(r.displacement)}\,\mathrm{m}`,compact?31:34);
      if(!compact)svg+=math(rx,ry+176,String.raw`\text{distance}${eq(r.distance)}${tf(r.distance)}\,\mathrm{m}`,body,C.muted);
    }
    // Full-duration position scale includes any interior turning point and comparison runs.
    const positions=[...extrema(p,T),...runs.flatMap(run=>extrema(run.params,run.T))];
    let sLow=Math.min(...positions),sHigh=Math.max(...positions);
    const sSpan=Math.max(4,sHigh-sLow),sPad=sSpan*.17;
    sLow-=sPad;sHigh+=sPad;
    const track={x:compact?52:75,w:compact?352:750,y:compact?614:466};
    const X=position=>track.x+(position-sLow)/(sHigh-sLow)*track.w;
    svg+=text(track.x,track.y-57,'POSITION / m',compact?16:14,C.muted);
    svg+=math(track.x+track.w,track.y-56,String.raw`x${eq(r.displacement)}${tf(r.displacement)}\,\mathrm{m}`,compact?20:20,C.ink,'end',200);
    svg+=line(track.x,track.y,track.x+track.w,track.y,C.axis,1.6);
    for(const value of ticks(sLow,sHigh,compact?3:5)){
      svg+=line(X(value),track.y-4,X(value),track.y+4,C.axis,1.4)+text(X(value),track.y+27,f(value,1),fs,C.muted,'middle');
    }
    svg+=line(X(0),track.y-9,X(0),track.y+9,C.initial,2);
    if(t>EPS)svg+=line(X(0),track.y,X(r.displacement),track.y,C.ink,4);
    if(r.turningTime!==null){
      const turningPosition=analyse(p,r.turningTime).displacement;
      svg+=dot(X(turningPosition),track.y,3.5,C.gain)+text(X(turningPosition),track.y+49,'turn',compact?16:14,C.gain,'middle');
    }
    const trolley=(position,color,opacity=1)=>{
      const xx=X(position),yy=track.y-19;
      return `<g opacity="${opacity}"><rect x="${n(xx-12)}" y="${n(yy-10)}" width="24" height="17" rx="4" fill="${color}"/>`+dot(xx-7,yy+10,3,color)+dot(xx+7,yy+10,3,color)+'</g>';
    };
    if(flags.ghosts!==false)for(const run of runs)svg+=trolley(analyse(run.params,Math.min(t,run.T)).displacement,run.color,.45);
    svg+=trolley(r.displacement,C.ink);
    if(flags.components!==false && Math.abs(r.velocity)>EPS){
      const vx=X(r.displacement),length=Math.min(46,12+Math.abs(r.velocity)*1.1)*Math.sign(r.velocity);
      svg+=arrow(vx,track.y-40,vx+length,track.y-40,C.ink,2);
    }
    if(stage===2 && t>EPS){
      const ta=Math.max(0,t-.3),previous=analyse(p,ta).displacement;
      svg+=line(X(previous),track.y+7,X(r.displacement),track.y+7,C.gain,6);
    }
    const note=stage===3 && p.u*p.a<0?'Signed contributions can overlap and cancel.':r.turningTime!==null?'A reversal adds distance beyond the displacement magnitude.':stage===1 && t<EPS?'At the start, use slope; the zero-over-zero ratio is undefined.':stage===4?'Constant acceleration · signed displacement':'Right is positive · graph and track share one clock';
    svg+=text(W/2,H-19,note,compact?16:15,C.muted,'middle');
    if(runs.length){
      runs.forEach((run,index)=>{
        const legendX=compact?24+(index%2)*218:30+index*211,legendY=compact?61+Math.floor(index/2)*24:62;
        svg+=line(legendX,legendY,legendX+18,legendY,run.color,2,run.dash);
        svg+=text(legendX+24,legendY+5,run.label,compact?14:13,run.color);
      });
    }
    svg+='</g>';
    const ariaLabel='Live velocity–time and position diagrams. Time '+f(t)+' seconds; initial velocity '+f(p.u)+' metres per second; acceleration '+f(p.a)+' metres per second squared; velocity '+f(r.velocity)+' metres per second; signed displacement '+f(r.displacement)+' metres; distance '+f(r.distance)+' metres. Cyan rectangle: initial-velocity contribution '+signed(r.initialContribution)+' metres. Amber triangle: acceleration contribution '+signed(r.accelerationContribution)+' metres.'+(r.turningTime!==null?' Direction reverses at '+f(r.turningTime)+' seconds.':'');
    return {svg,viewBox:`0 0 ${W} ${H}`,ariaLabel};
  }
  const api=Object.freeze({render,analyse});
  if(typeof module!=='undefined' && module.exports)module.exports=api;
  if(scope)scope.MotionVisualLab=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
