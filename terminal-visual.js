/* Lesson 5: observe falling, compare forces, then explain terminal speed.
 * The model drives every drawing. A following camera keeps the person visible;
 * graph and force scales use complete runs and never change while scrubbing.
 * No drag equation or drag-coefficient calculation is part of this lesson.
 */
(function (scope) {
  'use strict';
  const C=Object.freeze({bg:'#000000',ink:'#f1f4fa',muted:'#b4bfd0',grid:'#344257',axis:'#8594aa',drag:'#58c4dd',weight:'#f4d345',runs:['#c5b7ec','#e8a7b7','#91bcb2','#88b5ef']});
  const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const bound=(value,min,max,fallback=0)=>Math.max(min,Math.min(max,finite(value,fallback)));
  const n=value=>Math.round(finite(value)*1000)/1000;
  const f=(value,digits=1)=>finite(Math.abs(value)<.5*10**-digits?0:value).toFixed(digits).replace(/\.0+$/,'').replace(/(\.\d)0$/,'$1');
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function model(){
    if(scope&&scope.TerminalModel)return scope.TerminalModel;
    if(typeof require==='function')return require('./terminal-model.js');
    throw new Error('TerminalModel must be loaded before TerminalVisualLab.');
  }
  const titles=['Observe the fall','Compare the forces','Read the speed graph','Open the canopy','Explain terminal speed'];
  function render(options={}){
    const engine=model(),params=engine.clean?engine.clean(options.params||{}):options.params||{},start=engine.state(params,0),T=Math.max(.01,finite(engine.duration?engine.duration(params):start.T,60)),time=bound(options.time,0,T),r=engine.state(params,time);
    const stage=Math.round(bound(options.stage,0,4)),showWorking=options.showWorking===true,compact=!!options.compact,flags=options.flags||{};
    const W=compact?460:900,H=compact?(showWorking?1160:1040):(showWorking?786:652),stroke=compact?3.3:3;
    const current=engine.sample(params,241),saved=(flags.ghosts===false?[]:Array.isArray(options.runs)?options.runs:[]).slice(0,4).map((run,index)=>({params:run.params||{},points:engine.sample(run.params||{},241),label:String(run.label||String.fromCharCode(65+index)).slice(0,20),color:C.runs[index],dash:['5 5','2 5','10 4','8 3 2 3'][index]}));
    const allPoints=current.concat(...saved.map(run=>run.points)),maxTime=Math.max(T,...saved.map(run=>finite(run.points.at(-1)?.t,T))),maxSpeed=Math.max(1,...allPoints.map(q=>finite(q.v)))*1.13;
    // A dense sample of deployment captures the brief peak in drag. The 8%
    // margin keeps every interpolated arrow inside the same fixed force frame.
    const extra=r.deploy?Array.from({length:61},(_,index)=>engine.state(params,finite(r.openTime,finite(params.open,20))+index*finite(r.openingDuration,3)/60)):[];
    const maximumForce=Math.max(1,...current.concat(extra).map(q=>Math.max(finite(q.weight),finite(q.drag))))*1.08,forceScale=156/maximumForce;
    const graph=compact?{x:66,y:570,w:344,h:224}:{x:508,y:152,w:330,h:238},X=t=>graph.x+t/maxTime*graph.w,Y=v=>graph.y+graph.h-v/maxSpeed*graph.h;
    const fx=compact?146:177,headY=258,forceX=compact?330:350,forceY=260,body=bound(params.body,0,2,2),opening=bound(r.openingFraction,0,1),canopySize=bound(params.canopy,0,2,1);
    const canopyWidth=(174+26*canopySize)*opening,canopyHeight=(58+6*canopySize)*opening,canopyY=headY-76*opening;
    const text=(x,y,value,size=compact?20:16,color=C.ink,anchor='start',weight=400)=>`<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" style="font-family:Arial,Helvetica,sans-serif;font-size:${size}px;font-weight:${weight};fill:${color}">${esc(value)}</text>`;
    const math=(x,y,tex,size=compact?26:25,color=C.ink,anchor='start',width=compact?404:380)=>{
      if(scope&&scope.PhysicsVisualMath&&typeof scope.PhysicsVisualMath.svgMath==='function')return scope.PhysicsVisualMath.svgMath(x,y,tex,size,color,anchor,width);
      return `<g class="terminal-math-unavailable" data-tex="${esc(tex)}"><title>${esc('Mathematical expression: '+tex)}</title></g>`;
    };
    const line=(x,y,x2,y2,color=C.axis,width=1.5,dash='',opacity=1)=>`<line x1="${n(x)}" y1="${n(y)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''} opacity="${opacity}"/>`;
    const dot=(x,y,radius=4,color=C.ink,opacity=1)=>`<circle cx="${n(x)}" cy="${n(y)}" r="${radius}" fill="${color}" opacity="${opacity}"/>`;
    const path=(points,color=C.ink,width=3,dash='',opacity=1)=>`<polyline points="${points.map(q=>[n(X(q.t)),n(Y(q.v))].join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''} opacity="${opacity}"/>`;
    const arrow=(x,y,x2,y2,color,width=3)=>{
      const length=Math.hypot(x2-x,y2-y);if(length<.1)return dot(x,y,2,color);
      const angle=Math.atan2(y2-y,x2-x),head=Math.min(10,length*.42),wing=head*.5;
      return line(x,y,x2,y2,color,width)+`<polygon points="${n(x2)},${n(y2)} ${n(x2-head*Math.cos(angle)+wing*Math.sin(angle))},${n(y2-head*Math.sin(angle)-wing*Math.cos(angle))} ${n(x2-head*Math.cos(angle)-wing*Math.sin(angle))},${n(y2-head*Math.sin(angle)+wing*Math.cos(angle))}" fill="${color}"/>`;
    };
    const forceArrow=(name,value,direction,color)=>`<g data-force="${name}" data-force-value="${n(value)}" data-arrow-length="${n(value*forceScale)}">`+arrow(forceX,forceY,forceX,forceY+direction*value*forceScale,color,4)+'</g>';
    let svg=`<g class="terminal-visual" data-terminal-stage="${stage}" data-show-working="${showWorking}" data-time="${n(time)}" data-graph-max-speed="${maxSpeed}" data-graph-max-time="${maxTime}" data-force-scale="${forceScale}"><rect width="${W}" height="${H}" fill="${C.bg}"/>`;
    svg+=text(compact?24:30,34,'FALLING THROUGH AIR',compact?19:16,C.muted)+math(W-(compact?24:30),35,String.raw`t=${f(time)}\,\mathrm{s}`,compact?23:21,C.ink,'end',146);
    [['Weight',C.weight],['Air resistance',C.drag],[compact?'Speed':'Downward speed',C.ink]].forEach(([label,color],index)=>{
      const x=compact?[24,155,322][index]:30+index*170;
      svg+=line(x,65,x+(compact?15:19),65,color,3)+text(x+(compact?22:27),70,label,compact?16:16,color);
    });
    // Reference marks rise through the following camera. They represent motion
    // through air, not a ground or an arbitrary repeatedly resetting height.
    const scroll=(finite(r.s)*.42)%88;
    svg+='<g data-air-reference-marks="true" opacity=".5">';
    for(let row=-1;row<5;row++){
      const y=140+row*88-scroll;
      if(y<122||y>428)continue;
      svg+=line(29,y,29,y+26,C.grid,1.7)+line(compact?423:430,y+19,compact?423:430,y+45,C.grid,1.7);
    }
    svg+='</g>';
    // Original line drawing: a progressively inflated canopy, then a figure
    // whose stance reflects the selected body posture. No external media.
    svg+=`<g class="terminal-canopy" data-opening-fraction="${opening}" data-canopy-width="${canopyWidth}" data-canopy-height="${canopyHeight}" opacity="${opening>0?1:0}">`;
    if(opening>0){
      const half=canopyWidth/2,left=fx-half,right=fx+half,top=canopyY-canopyHeight;
      svg+=`<path d="M ${n(left)} ${n(canopyY)} C ${n(left+half*.12)} ${n(top)} ${n(right-half*.12)} ${n(top)} ${n(right)} ${n(canopyY)} Q ${n(fx)} ${n(canopyY-17*opening)} ${n(left)} ${n(canopyY)} Z" fill="${C.drag}" fill-opacity="${stage===3?.17:.11}" stroke="${C.drag}" stroke-width="2.5"/>`;
      for(const unit of[-1,-.5,0,.5,1]){
        const attach=fx+unit*half;
        svg+=line(attach,canopyY,fx+unit*15,headY+29,C.drag,1.4,'',.7);
        if(Math.abs(unit)<1)svg+=`<path d="M ${n(attach)} ${n(canopyY)} Q ${n(fx+unit*half*.5)} ${n(top+5*opening)} ${n(fx)} ${n(top+16*opening)}" fill="none" stroke="${C.drag}" stroke-width="1" opacity=".55"/>`;
      }
    }
    svg+='</g>';
    const armSpan=(21+body*10)*(1-opening)+24*opening,handY=(headY+42-body*3)*(1-opening)+(headY+13)*opening;
    svg+='<g class="terminal-person" fill="none" stroke="'+C.ink+'" stroke-width="'+stroke+'" stroke-linecap="round" stroke-linejoin="round">';
    svg+=`<circle cx="${fx}" cy="${headY}" r="10" fill="#000000"/><path d="M ${fx} ${headY+12} L ${fx} ${headY+57} M ${fx} ${headY+26} L ${fx-armSpan} ${handY} M ${fx} ${headY+26} L ${fx+armSpan} ${handY} M ${fx} ${headY+57} L ${fx-16-body*3} ${headY+92} M ${fx} ${headY+57} L ${fx+16+body*3} ${headY+92}"/>`;
    svg+='</g>';
    if(flags.components!==false){
      if(stage===1)svg+='<g opacity=".12">'+line(forceX,forceY,forceX,forceY+finite(r.weight)*forceScale,C.weight,14)+line(forceX,forceY,forceX,forceY-finite(r.drag)*forceScale,C.drag,14)+'</g>';
      svg+=forceArrow('weight',Math.max(0,finite(r.weight)),1,C.weight)+forceArrow('drag',Math.max(0,finite(r.drag)),-1,C.drag);
      if(finite(r.drag)>=1e-8)svg+=text(forceX,forceY-finite(r.drag)*forceScale-15,'Air resistance',compact?18:16,C.drag,'middle');
      svg+=text(forceX,forceY+finite(r.weight)*forceScale+23,'Weight',compact?18:16,C.weight,'middle');
      if(finite(r.drag)<1e-8)svg+=text(forceX-15,forceY-16,'No drag at release',compact?17:15,C.drag,'end');
    }
    // This white arrow is explicitly speed, with its own run-wide scale.
    const speedLength=finite(r.v)/maxSpeed*58;
    svg+=`<g data-speed-arrow="true" data-current-speed="${n(r.v)}">`+arrow(fx,headY+106,fx,headY+106+speedLength,C.ink,2.8)+'</g>';
    svg+=text(fx+15,headY+128,finite(r.v)<1e-8?'At rest':'Downward',compact?18:15,C.ink);
    const isAtRest=finite(r.v)<1e-8,balanced=Math.abs(finite(r.net))<=Math.max(1,finite(r.weight))*.012;
    const status=isAtRest?'Released from rest':balanced?'Almost steady downward speed':finite(r.net)>0?'Speeds up downward':'Slows while still moving down';
    const comparison=balanced?'Air resistance nearly balances weight.':finite(r.net)>0?'Weight is greater than air resistance.':'Air resistance is greater than weight.';
    const statusY=compact?472:482;
    svg+=text(compact?24:30,445,'Camera follows the falling person',compact?18:16,C.muted);
    svg+=text(compact?24:30,statusY,status,compact?22:22,C.ink,'start',600)+text(compact?24:30,statusY+31,comparison,compact?18:17,C.muted);
    if(!compact)svg+=line(467,116,467,427,C.grid,1);
    // The complete 60-second experiment fixes the graph scale. Saved traces
    // share this speed axis, so a changed posture/canopy remains comparable.
    svg+=text(graph.x,graph.y-31,'DOWNWARD SPEED',compact?19:16,C.muted);
    for(let i=1;i<=3;i++)svg+=line(graph.x,graph.y+graph.h*i/4,graph.x+graph.w,graph.y+graph.h*i/4,C.grid,1,'3 7',.7);
    svg+=line(graph.x,graph.y,graph.x,graph.y+graph.h,C.axis,1.6)+line(graph.x,graph.y+graph.h,graph.x+graph.w+6,graph.y+graph.h,C.axis,1.6);
    for(let i=0;i<=4;i++){
      const t=maxTime*i/4,x=X(t);
      svg+=line(x,graph.y+graph.h-4,x,graph.y+graph.h+4,C.axis,1.4)+text(x,graph.y+graph.h+27,f(t,0),compact?18:15,C.muted,'middle');
    }
    svg+=text(graph.x-12,graph.y+graph.h+5,'0',compact?18:15,C.muted,'end')+text(graph.x+graph.w,graph.y+graph.h+55,'TIME / s',compact?18:15,C.muted,'end');
    if(flags.projections!==false){
      const before=finite(r.terminalBefore),after=finite(r.terminalAfter);
      if(before>0&&before<maxSpeed){
        svg+=line(graph.x,Y(before),graph.x+graph.w,Y(before),C.axis,1.1,'4 6',.65);
        svg+=text(graph.x+8,Y(before)-11,r.deploy?'Before opening':'Terminal speed',compact?17:14,C.muted);
      }
      if(r.deploy&&after>0&&after<maxSpeed&&Math.abs(Y(before)-Y(after))>42){
        svg+=line(graph.x,Y(after),graph.x+graph.w,Y(after),C.drag,1.1,'4 6',.55)+text(graph.x+8,Y(after)-11,'With open canopy',compact?17:14,C.drag);
      }
    }
    if(r.deploy){
      const open=bound(r.openTime,0,maxTime,finite(params.open,20)),openingEnd=Math.min(maxTime,open+finite(r.openingDuration,3)),ox=X(open),ex=X(openingEnd);
      svg+=`<rect x="${n(ox)}" y="${graph.y}" width="${n(Math.max(0,ex-ox))}" height="${graph.h}" fill="${C.weight}" opacity="${stage===3?.12:.055}"/>`;
      svg+=line(ox,graph.y-3,ox,graph.y+graph.h,C.weight,1.4,'4 5',.8);
      svg+=text(ox,graph.y-10,'Opening',compact?17:14,C.weight,'middle');
    }
    svg+=`<defs><clipPath id="terminal-speed-clip"><rect x="${graph.x-4}" y="${graph.y-5}" width="${graph.w+10}" height="${graph.h+10}"/></clipPath></defs><g clip-path="url(#terminal-speed-clip)">`;
    saved.forEach(run=>{svg+=path(run.points,run.color,2,run.dash,.75);});
    svg+=path(current,C.axis,1.7,'4 6',.7);
    const elapsed=current.filter(q=>q.t<time);elapsed.push(r);svg+=path(elapsed,C.ink,3.7);
    if(stage===2){
      // A tangent is a geometric observation of the current graph gradient;
      // its slope comes from the same physical state, never a fitted chord.
      const span=Math.min(2,maxSpeed*.18/Math.max(.5,Math.abs(finite(r.a)))),left=Math.max(0,time-span),right=Math.min(maxTime,time+span);
      svg+=`<g data-speed-tangent="true" data-tangent-gradient="${finite(r.a)}">`+line(X(left),Y(r.v+r.a*(left-time)),X(right),Y(r.v+r.a*(right-time)),C.weight,2.4,'',.9)+'</g>';
    }
    if(flags.projections!==false)svg+=line(X(time),Y(r.v),X(time),graph.y+graph.h,C.ink,1.2,'3 5',.6)+line(graph.x,Y(r.v),X(time),Y(r.v),C.ink,1.2,'3 5',.5);
    svg+=`<g data-current-time="${n(time)}" data-current-speed="${n(r.v)}" data-current-graph-x="${n(X(time))}" data-current-graph-y="${n(Y(r.v))}">`+dot(X(time),Y(r.v),6,C.ink)+dot(X(time),Y(r.v),10,C.ink,.12)+'</g></g>';
    const legendY=compact?878:448;
    saved.forEach((run,index)=>{const lx=compact?26+(index%2)*215:508+(index%2)*174,ly=legendY+Math.floor(index/2)*26;svg+=line(lx,ly,lx+18,ly,run.color,2,run.dash)+text(lx+25,ly+5,run.label,compact?17:14,run.color);});
    const ideaY=compact?(saved.length>2?949:923):572;
    let idea;
    if(stage===0)idea='Speed changes when the two forces are unequal.';
    else if(stage===1)idea='Weight stays constant throughout the fall.';
    else if(stage===2)idea='A flatter speed graph means less acceleration.';
    else if(stage===3)idea=r.deploy?'The canopy grows over three seconds after opening.':'Switch on the canopy to compare the two plateaux.';
    else idea='Balanced forces allow a steady, nonzero speed.';
    svg+=text(compact?24:30,ideaY,String(stage+1).padStart(2,'0')+' / '+titles[stage],compact?18:16,C.muted);
    if(compact&&idea.length>48){
      const words=idea.split(' '),lines=[''];
      words.forEach(word=>{const last=lines.length-1;if((lines[last]+' '+word).trim().length>45)lines.push(word);else lines[last]+=(lines[last]?' ':'')+word;});
      lines.forEach((value,index)=>{svg+=text(24,ideaY+31+index*27,value,19,C.ink);});
    }else svg+=text(compact?24:30,ideaY+31,idea,compact?19:19,C.ink);
    if(showWorking){
      const wy=compact?1034:675;
      svg+=line(compact?24:30,wy-20,W-(compact?24:30),wy-20,C.grid,1);
      svg+=math(compact?24:30,wy+15,String.raw`W=mg`,compact?27:27,C.weight,'start',compact?190:220);
      svg+=math(compact?230:310,wy+15,String.raw`F_{\rm net}=W-F_D`,compact?25:27,C.ink,'start',compact?206:330);
      svg+=math(compact?24:30,wy+68,String.raw`F_D=W\quad\Rightarrow\quad F_{\rm net}=0,\ a=0`,compact?25:27,C.drag,'start',compact?412:680);
    }
    svg+='</g>';
    const ariaLabel='Live air resistance and terminal-speed experiment. '+titles[stage]+'. Time '+f(time)+' seconds. '+status+'. '+comparison+' Weight is downward and stays constant; air resistance is upward while the person moves down. '+(r.deploy?'The canopy starts opening at '+f(r.openTime)+' seconds, grows gradually over three seconds, then stays open. Current opening '+Math.round(opening*100)+' percent.':'The canopy is not deployed in this run.')+' The white dot and the following-camera person show the same instant. Graph and force-arrow scales stay fixed while time is scrubbed. '+(showWorking?'Basic force explanations are expanded.':'Calculations are hidden so students can observe first.');
    return {svg,viewBox:`0 0 ${W} ${H}`,ariaLabel};
  }
  const api=Object.freeze({render});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(scope)scope.TerminalVisualLab=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
