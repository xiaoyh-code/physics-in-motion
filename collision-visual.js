/* Lesson 6: two cars, one horizontal direction, one conserved total.
 * Time, velocities and momentum all come from the same collision state.
 * Cars are schematic fixed-size drawings: their facing bumpers map to the
 * model's physical front positions, so they meet without overlapping.
 */
(function (scope) {
  'use strict';
  const C=Object.freeze({bg:'#000000',ink:'#f1f4fa',muted:'#b4bfd0',grid:'#344257',axis:'#8594aa',A:'#58c4dd',B:'#f4d345',runs:['#c5b7ec','#e8a7b7','#91bcb2','#88b5ef']});
  const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const bound=(value,low,high,fallback=0)=>Math.max(low,Math.min(high,finite(value,fallback)));
  const n=value=>Math.round(finite(value)*1000)/1000;
  const f=(value,digits=2)=>finite(Math.abs(value)<.5*10**-digits?0:value).toFixed(digits).replace(/\.0+$/,'').replace(/(\.\d)0$/,'$1');
  const signed=value=>(finite(value)>0?'+':'')+f(value);
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const titles=['Observe the collision','Compare velocities','Give momentum a direction','Follow the transfer','Keep the total'];
  function model(){
    if(scope&&scope.CollisionModel)return scope.CollisionModel;
    if(typeof require==='function')return require('./collision-model.js');
    throw new Error('CollisionModel must load before CollisionVisualLab.');
  }
  function render(options={}){
    const engine=model(),params=engine.clean?engine.clean(options.params||{}):options.params||{},initial=engine.state(params,0),T=Math.max(.01,finite(initial.T,6)),time=bound(options.time,0,T),r=engine.state(params,time);
    const compact=!!options.compact,showWorking=options.showWorking===true,stage=Math.round(bound(options.stage,0,4)),flags=options.flags||{};
    const W=compact?460:900,H=showWorking?(compact?1318:966):(compact?750:590),carWidth=compact?80:116,roadY=250;
    const saved=(flags.ghosts===false?[]:Array.isArray(options.runs)?options.runs:[]).slice(0,4).map((run,index)=>({params:run.params||{},label:String(run.label||String.fromCharCode(65+index)).slice(0,20),color:C.runs[index],dash:['5 5','2 5','10 4','8 3 2 3'][index]}));
    const allParams=[params,...saved.map(run=>run.params)],extremes=[],velocities=[],momenta=[];
    allParams.forEach(p=>{
      const a=engine.state(p,0),z=engine.state(p,T),samples=[a,z];
      if(a.collisionInRun&&Number.isFinite(a.tc))samples.push(engine.state(p,a.tc));
      samples.forEach(q=>{extremes.push(finite(q.x1)+1,finite(q.x2)-1);});
      velocities.push(a.u1,a.u2);momenta.push(a.m1*a.u1,a.m2*a.u2,a.Pi);
      if(a.collisionInRun){velocities.push(a.v1,a.v2);momenta.push(a.m1*a.v1,a.m2*a.v2);}
    });
    const minX=Math.min(...extremes),maxX=Math.max(...extremes),span=Math.max(8,maxX-minX),left=carWidth+28,right=W-left,positionScale=(right-left)/span;
    const X=x=>left+(finite(x)-(minX+maxX-span)/2)*positionScale;
    const maxVelocity=Math.max(1,...velocities.map(v=>Math.abs(finite(v)))),velocityScale=(compact?142:134)/maxVelocity;
    const maxMomentum=Math.max(1,...momenta.map(p=>Math.abs(finite(p)))),momentumScale=(compact?112:120)/maxMomentum;
    const text=(x,y,value,size=compact?21:17,color=C.ink,anchor='start',weight=400)=>`<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" style="font-family:Arial,Helvetica,sans-serif;font-size:${size}px;font-weight:${weight};fill:${color}">${esc(value)}</text>`;
    const math=(x,y,tex,size=compact?27:25,color=C.ink,anchor='start',width=compact?404:380)=>{
      if(scope&&scope.PhysicsVisualMath&&typeof scope.PhysicsVisualMath.svgMath==='function')return scope.PhysicsVisualMath.svgMath(x,y,tex,size,color,anchor,width);
      return `<g class="collision-math-unavailable" data-tex="${esc(tex)}"><title>${esc('Mathematical expression: '+tex)}</title></g>`;
    };
    const line=(x,y,x2,y2,color=C.axis,width=1.5,dash='',opacity=1)=>`<line x1="${n(x)}" y1="${n(y)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''} opacity="${opacity}"/>`;
    const dot=(x,y,radius=4,color=C.ink,opacity=1)=>`<circle cx="${n(x)}" cy="${n(y)}" r="${radius}" fill="${color}" opacity="${opacity}"/>`;
    const arrow=(x,y,x2,y2,color,width=3,opacity=1,dash='')=>{
      const length=Math.hypot(x2-x,y2-y);if(length<.1)return dot(x,y,3,color,opacity);
      const angle=Math.atan2(y2-y,x2-x),head=Math.min(11,length*.43),wing=head*.5;
      return `<g opacity="${opacity}">`+line(x,y,x2,y2,color,width,dash)+`<polygon points="${n(x2)},${n(y2)} ${n(x2-head*Math.cos(angle)+wing*Math.sin(angle))},${n(y2-head*Math.sin(angle)-wing*Math.cos(angle))} ${n(x2-head*Math.cos(angle)-wing*Math.sin(angle))},${n(y2-head*Math.sin(angle)+wing*Math.cos(angle))}" fill="${color}"/></g>`;
    };
    const wrap=(value,x,y,width=compact?40:86,size=compact?21:19,color=C.ink)=>{
      const rows=[''];String(value).split(' ').forEach(word=>{const i=rows.length-1;if((rows[i]+' '+word).trim().length>width)rows.push(word);else rows[i]+=(rows[i]?' ':'')+word;});
      return rows.map((row,i)=>text(x,y+i*(size+8),row,size,color)).join('');
    };
    function car(which,state,color,ghost=false,rowOffset=0){
      const front=X(which==='A'?finite(state.x1)+1:finite(state.x2)-1),cx=front+(which==='A'?-1:1)*carWidth/2,y=roadY+rowOffset,w=carWidth;
      const group=`<g class="collision-car${ghost?' collision-car-ghost':''}" data-car="${which}" data-physical-center="${finite(which==='A'?state.x1:state.x2)}" data-physical-length="2" data-current-velocity="${finite(which==='A'?state.currentV1:state.currentV2)}" data-front-x="${n(front)}" data-car-center="${n(cx)}" data-car-left="${n(cx-w/2)}" data-car-right="${n(cx+w/2)}" data-car-width="${w}" transform="translate(${n(cx)},${n(y)})"${ghost?' opacity=".25"':''}>`;
      const body=`<path d="M ${n(-w/2)} -15 L ${n(-w/2)} -35 Q ${n(-w/2)} -42 ${n(-w/2+9)} -42 L ${n(-w*.29)} -42 L ${n(-w*.17)} -60 Q ${n(-w*.13)} -65 ${n(-w*.03)} -65 L ${n(w*.19)} -65 Q ${n(w*.24)} -65 ${n(w*.29)} -57 L ${n(w*.4)} -42 L ${n(w/2-5)} -42 Q ${n(w/2)} -42 ${n(w/2)} -35 L ${n(w/2)} -15 Z" fill="${ghost?'none':C.bg}" stroke="${color}" stroke-width="${ghost?1.8:2.7}"${ghost?' stroke-dasharray="4 5"':''}/>`;
      const windows=`<path d="M ${n(-w*.2)} -45 L ${n(-w*.09)} -59 L ${n(w*.14)} -59 L ${n(w*.25)} -45 Z" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-width="1.2"/><path d="M ${n(w*.02)} -59 V -45" stroke="${color}" stroke-width="1.2"/>`;
      const wheels=[-w*.29,w*.28].map(x=>`<circle cx="${n(x)}" cy="-15" r="10" fill="${C.bg}" stroke="${color}" stroke-width="2.5"/><circle cx="${n(x)}" cy="-15" r="3" fill="${color}"/>`).join('');
      const label=ghost?'':text(0,-83,'CAR '+which,compact?21:18,color,'middle',600);
      return group+body+windows+wheels+label+'</g>';
    }
    let svg=`<g class="collision-visual" data-collision-stage="${stage}" data-show-working="${showWorking}" data-time="${time}" data-position-scale="${positionScale}" data-velocity-scale="${velocityScale}" data-momentum-scale="${momentumScale}" data-momentum-before="${finite(r.Pi)}" data-momentum-current="${finite(r.P)}" data-momentum-after="${finite(r.Pf)}" data-collided="${!!r.collided}" data-collision-time="${r.tc===null?'none':r.tc}"><rect width="${W}" height="${H}" fill="${C.bg}"/>`;
    svg+=text(compact?24:30,34,'TWO CARS · ONE LINE',compact?21:17,C.muted)+math(W-(compact?24:30),35,String.raw`t=${f(time)}\,\mathrm{s}`,compact?25:23,C.ink,'end',154);
    svg+=arrow(W-(compact?145:193),69,W-(compact?28:32),69,C.ink,2.2)+text(compact?24:30,75,'Right is positive',compact?19:17,C.ink);
    svg+=math(compact?24:30,119,String.raw`m_A=${f(r.m1)}\,\mathrm{kg}`,compact?26:25,C.A,'start',190)+math(W-(compact?24:30),119,String.raw`m_B=${f(r.m2)}\,\mathrm{kg}`,compact?26:25,C.B,'end',190);
    // A fixed run-wide camera includes the endpoints and the one velocity
    // discontinuity. It cannot crop a car as the learner scrubs either way.
    svg+=line(24,roadY-2,W-24,roadY-2,C.axis,1.8)+line(24,roadY+7,W-24,roadY+7,C.grid,1,'5 9');
    saved.forEach((run,index)=>{
      const s=engine.state(run.params,time),ay=roadY+22+index*12;
      svg+=`<g data-saved-run="${index}" data-saved-a-front="${n(X(s.x1+1))}" data-saved-b-front="${n(X(s.x2-1))}" opacity=".65">`+line(X(s.x1+1),ay,X(s.x2-1),ay,run.color,1,run.dash)+dot(X(s.x1+1),ay,3,run.color)+`<rect x="${n(X(s.x2-1)-3)}" y="${n(ay-3)}" width="6" height="6" fill="${run.color}"/></g>`;
    });
    if(r.collisionInRun&&Number.isFinite(r.tc)){
      const contact=X(finite(r.contactX1)+1),near=Math.abs(time-r.tc)<.055;
      svg+=`<g data-contact-front="${n(contact)}">`+line(contact,146,contact,roadY+11,C.muted,1.1,'3 6',.35);
      if(near)svg+=dot(contact,roadY-33,24,C.ink,.1)+dot(contact,roadY-33,13,C.ink,.12);
      svg+='</g>';
    }
    svg+=car('A',r,C.A)+car('B',r,C.B);
    const collisionSoon=r.collisionInRun&&!r.collided,status=r.collided?(finite(r.e)<.5?'After contact · joined together':'After contact · separating'):collisionSoon?'Before contact · approaching':r.hasCollision?'No contact within these six seconds':'No contact · the gap does not close';
    const statusY=compact?340:333;
    svg+=wrap(status,compact?24:30,statusY,compact?34:80,compact?22:23,C.ink);
    const caption=r.collided?(finite(r.e)<.5?'The cars share one final velocity.':'Each car has a new velocity.'):collisionSoon?'Scrub across contact. Which car changes more?':r.hasCollision?'The cars approach, but need a longer time.':'Change the starting velocities to bring them together.';
    svg+=wrap(caption,compact?24:30,statusY+(compact?63:34),compact?42:85,compact?19:18,C.muted);
    function velocity(which,v,u,color){
      const isA=which==='A',cx=compact?230:(isA?225:675),labelX=compact?24:(isA?30:480),labelY=compact?(isA?461:564):425,arrowY=labelY+39,numberX=compact?436:(isA?430:870);
      let result=text(labelX,labelY,'CAR '+which,compact?20:17,color,'start',600)+math(numberX,labelY,String.raw`v_${which}=${signed(v)}\,\mathrm{m\,s^{-1}}`,compact?26:24,color,'end',compact?245:235);
      result+=line(cx-velocityScale*maxVelocity,arrowY,cx+velocityScale*maxVelocity,arrowY,C.grid,1)+line(cx,arrowY-9,cx,arrowY+9,C.axis,1.2);
      if(showWorking&&flags.projections!==false&&r.collided)result+=`<g data-initial-velocity="${which}" data-velocity-value="${n(u)}">`+arrow(cx,arrowY-7,cx+finite(u)*velocityScale,arrowY-7,color,2,.4,'5 5')+'</g>';
      if(flags.components!==false)result+=`<g data-current-velocity="${which}" data-velocity-value="${n(v)}" data-arrow-length="${n(Math.abs(v)*velocityScale)}">`+arrow(cx,arrowY,cx+finite(v)*velocityScale,arrowY,color,stage===1?4.8:3.7)+'</g>';
      return result;
    }
    svg+=velocity('A',finite(r.currentV1),finite(r.u1),C.A)+velocity('B',finite(r.currentV2),finite(r.u2),C.B);
    if(showWorking&&flags.projections!==false&&r.collided){
      const keyY=compact?533:394;
      svg+='<g data-velocity-legend="true">'+line(compact?24:30,keyY-5,compact?47:55,keyY-5,C.ink,2.6)+text(compact?56:65,keyY,'Now',compact?17:16,C.muted);
      svg+=line(compact?142:148,keyY-5,compact?165:173,keyY-5,C.ink,2,'5 5',.6)+text(compact?174:183,keyY,'Before contact',compact?17:16,C.muted)+'</g>';
    }
    const legendY=compact?641:509;
    saved.forEach((run,index)=>{const lx=compact?24+(index%2)*220:30+index*216,ly=legendY+(compact?Math.floor(index/2)*27:0);svg+=line(lx,ly,lx+18,ly,run.color,2,run.dash)+text(lx+26,ly+5,run.label,compact?17:15,run.color);});
    const ideaY=compact?704:560;
    const ideas=['Compare the motion before and after contact.','An arrow shows direction as well as speed.','Mass and velocity both affect momentum.','One car gains the momentum the other loses.','The two-car total stays the same.'];
    svg+=wrap(String(stage+1).padStart(2,'0')+' / '+ideas[stage],compact?24:30,ideaY,compact?41:90,compact?20:19,C.muted);
    if(showWorking){
      const headerY=compact?787:615;
      svg+=line(compact?24:30,headerY-29,W-(compact?24:30),headerY-29,C.grid,1)+text(compact?24:30,headerY,'SIGNED MOMENTA',compact?20:17,C.muted);
      svg+=math(W-(compact?24:30),headerY,String.raw`\mathrm{kg\,m\,s^{-1}}`,compact?23:21,C.muted,'end',180);
      function momentumPanel(label,col,top,values){
        const zero=compact?230:col+215,valX=compact?436:col+430,labelX=compact?24:col+30;
        let result=text(labelX,top,label,compact?22:20,C.ink,'start',600)+line(zero,top+17,zero,top+157,C.axis,1.2);
        [['A',values[0],C.A],['B',values[1],C.B],['Total',values[0]+values[1],C.ink]].forEach(([name,value,color],index)=>{
          const y=top+47+index*44,length=finite(value)*momentumScale,end=zero+length;
          result+=text(labelX,y+5,name,compact?20:17,color);
          result+=`<g data-momentum-panel="${esc(label)}" data-momentum-car="${name}" data-momentum-value="${n(value)}" data-bar-length="${n(Math.abs(length))}">`+line(zero-120,y,zero+120,y,C.grid,1)+`<rect x="${n(Math.min(zero,end))}" y="${n(y-7)}" width="${n(Math.abs(length))}" height="14" fill="${color}" fill-opacity="${stage===2||stage===4?'.9':'.68'}"/>`+dot(end,y,3,color)+'</g>';
          result+=math(valX,y+7,signed(value),compact?24:23,color,'end',compact?83:84);
        });
        return result;
      }
      svg+=momentumPanel(r.collisionInRun?'Before contact':'Initially',0,compact?832:659,[finite(r.m1)*finite(r.u1),finite(r.m2)*finite(r.u2)]);
      svg+=momentumPanel('At this instant',compact?0:450,compact?1032:659,[finite(r.p1),finite(r.p2)]);
      const equationY=compact?1241:867;
      if(stage===3){
        const changeA=finite(r.p1)-finite(r.m1)*finite(r.u1),changeB=finite(r.p2)-finite(r.m2)*finite(r.u2);
        svg+=math(compact?24:30,equationY-39,String.raw`\Delta p_A=${signed(changeA)}`,compact?24:24,C.A,'start',compact?205:400);
        svg+=math(W-(compact?24:30),equationY-39,String.raw`\Delta p_B=${signed(changeB)}`,compact?24:24,C.B,'end',compact?205:400);
        svg+=math(compact?24:30,equationY,String.raw`\Delta p_A=-\Delta p_B`,compact?29:30,C.ink,'start',compact?410:800);
      }
      else svg+=math(compact?24:30,equationY,String.raw`m_Au_A+m_Bu_B=m_Av_A+m_Bv_B`,compact?27:30,C.ink,'start',compact?410:830);
      svg+=wrap(r.collisionInRun?'No external horizontal impulse acts on the two-car system.':'The total also stays constant when the cars do not meet.',compact?24:30,equationY+43,compact?43:92,compact?18:17,C.muted);
    }
    svg+='</g>';
    const direction=value=>Math.abs(finite(value))<1e-9?'at rest':finite(value)>0?'moving right':'moving left';
    const description='Live one-dimensional collision. '+titles[stage]+'. Time '+f(time)+' seconds. '+status+'. Car A has mass '+f(r.m1)+' kilograms and is '+direction(r.currentV1)+' at speed '+f(Math.abs(r.currentV1))+' metres per second. Car B has mass '+f(r.m2)+' kilograms and is '+direction(r.currentV2)+' at speed '+f(Math.abs(r.currentV2))+' metres per second. '+(r.collisionInRun?'Their bumpers meet at '+f(r.tc)+' seconds. ':'')+'The position and velocity scales stay fixed throughout the run. Right is positive. '+(showWorking?'Before-contact and current signed-momentum bars share one scale; the two-car total is conserved.':'Calculations are hidden so students can observe the cars first.');
    return {svg,description,ariaLabel:description,viewBox:`0 0 ${W} ${H}`,aspectRatio:W/H};
  }
  const api=Object.freeze({render});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(scope)scope.CollisionVisualLab=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
