/* Lesson 3: a live projectile, two independent motions and one physical clock.
 * Geometry is isotropic; TeX labels are supplied by PhysicsVisualMath.svgMath.
 */
(function (scope) {
  'use strict';
  const C=Object.freeze({bg:'#000000',ink:'#f1f4fa',muted:'#b4bfd0',grid:'#344257',axis:'#8594aa',horizontal:'#58c4dd',vertical:'#f4d345',gravity:'#e2a4b6',runs:['#c5b7ec','#e8a7b7','#91bcb2','#88b5ef']});
  const EPS=1e-9;
  const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const bound=(value,low,high,fallback=0)=>Math.max(low,Math.min(high,finite(value,fallback)));
  const clean=p=>({u:bound(p&&p.u,1,30,20),theta:bound(p&&p.theta,-90,90,45),h:bound(p&&p.h,0,20,1.5),g:bound(p&&p.g,.5,20,9.81)});
  const zero=value=>Math.abs(value)<EPS?0:value;
  const n=value=>Math.round(finite(value)*1000)/1000;
  const f=(value,digits=2)=>zero(value).toFixed(digits).replace(/\.0+$/,'').replace(/(\.\d)0$/,'$1');
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function analyse(params,elapsed=0){
    const p=clean(params),angle=p.theta*Math.PI/180,ux=zero(p.u*Math.cos(angle)),uy=zero(p.u*Math.sin(angle));
    const discriminant=Math.sqrt(uy*uy+2*p.g*p.h);
    // The rationalised positive root remains accurate for a downward launch.
    const T=uy<0?(p.h===0?0:2*p.h/(discriminant-uy)):(uy+discriminant)/p.g;
    const time=bound(elapsed,0,T),x=ux*time,y=time>=T?0:Math.max(0,p.h+uy*time-.5*p.g*time*time),vy=zero(uy-p.g*time);
    const apexTime=uy>EPS?uy/p.g:null,hasApex=apexTime!==null&&apexTime<=T+EPS;
    return {...p,ux,uy,time,T,x:zero(x),y:zero(y),vx:ux,vy,speed:Math.hypot(ux,vy),R:zero(ux*T),H:p.h+(uy>0?uy*uy/(2*p.g):0),apexTime,futureApex:hasApex,hasApex,equalHeight:p.h<=EPS,vertical:Math.abs(ux)<EPS,drop:.5*p.g*time*time};
  }
  function ticks(high,count=4){
    const raw=Math.max(high,EPS)/count,power=10**Math.floor(Math.log10(raw)),fraction=raw/power;
    const step=(fraction<=1?1:fraction<=2?2:fraction<=5?5:10)*power,values=[];
    for(let value=0;value<=high+EPS&&values.length<10;value+=step)values.push(zero(value));
    return values;
  }
  function render(options={}){
    const p=clean(options.params),full=analyse(p),r=analyse(p,options.time),T=full.T,t=r.time,stage=Math.round(bound(options.stage,0,4));
    const compact=!!options.compact,W=compact?460:900,H=compact?880:660,flags=options.flags||{};
    const runs=(Array.isArray(options.runs)?options.runs:[]).slice(0,4).map((run,index)=>({params:clean(run.params),full:analyse(run.params),label:String(run.label||String.fromCharCode(65+index)).slice(0,22),color:C.runs[index],dash:['5 5','2 5','10 4','8 3 2 3'][index]}));
    const legendRows=runs.length?(compact?Math.ceil(runs.length/2):1):0;
    const graph=compact?{x:64,y:108+24*legendRows,w:344,h:258-24*legendRows}:{x:68,y:112+24*legendRows,w:440,h:290-24*legendRows};
    const maxX=Math.max(2,full.R,...runs.map(run=>run.full.R)),maxY=Math.max(2,full.H,...runs.map(run=>run.full.H));
    // A metre has the same pixel length in each direction. Scales use complete
    // flights and comparisons, so scrubbing the clock cannot resize the curve.
    const scale=Math.min((graph.w-70)/maxX,(graph.h-60)/maxY),ox=graph.x+16,oy=graph.y+graph.h-16;
    const X=x=>ox+x*scale,Y=y=>oy-y*scale;
    const axisMaxX=(graph.x+graph.w-ox)/scale,axisMaxY=(oy-graph.y+4)/scale;
    const text=(x,y,value,size=compact?17:15,color=C.ink,anchor='start')=>`<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" style="font-family:Arial,Helvetica,sans-serif;font-size:${size}px;fill:${color}">${esc(value)}</text>`;
    const math=(x,y,tex,size=26,color=C.ink,anchor='start',width=compact?400:310)=>{
      if(scope&&scope.PhysicsVisualMath&&typeof scope.PhysicsVisualMath.svgMath==='function')return scope.PhysicsVisualMath.svgMath(x,y,tex,size,color,anchor,width);
      // Missing shared TeX support must never masquerade as plain-text maths.
      return `<g class="projectile-math-unavailable" data-tex="${esc(tex)}"><title>${esc('Mathematical expression: '+tex)}</title></g>`;
    };
    const line=(x,y,x2,y2,color=C.axis,width=1.5,dash='',opacity=1)=>`<line x1="${n(x)}" y1="${n(y)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''} opacity="${opacity}"/>`;
    const dot=(x,y,radius=4,color=C.ink,opacity=1)=>`<circle cx="${n(x)}" cy="${n(y)}" r="${radius}" fill="${color}" opacity="${opacity}"/>`;
    const polygon=(points,color,opacity=1)=>`<polygon points="${points.map(pt=>pt.map(n).join(',')).join(' ')}" fill="${color}" opacity="${opacity}"/>`;
    const arrow=(x,y,x2,y2,color=C.ink,width=2,dash='')=>{
      const length=Math.hypot(x2-x,y2-y);if(length<.5)return dot(x,y,2,color);
      const angle=Math.atan2(y2-y,x2-x),head=Math.min(8,length*.38),wing=head*.5;
      return line(x,y,x2,y2,color,width,dash)+polygon([[x2,y2],[x2-head*Math.cos(angle)+wing*Math.sin(angle),y2-head*Math.sin(angle)-wing*Math.cos(angle)],[x2-head*Math.cos(angle)-wing*Math.sin(angle),y2-head*Math.sin(angle)+wing*Math.cos(angle)]],color);
    };
    const path=(params,end,color,width=2,dash='',opacity=1)=>{
      const count=end>EPS?120:1,points=Array.from({length:count+1},(_,index)=>{const q=analyse(params,end*index/count);return[X(q.x),Y(q.y)];});
      return `<polyline points="${points.map(pt=>pt.map(n).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''} opacity="${opacity}"/>`;
    };
    const titles=['Resolve the launch','One clock, two motions','What happens at the apex?','Build the trajectory','Predict the landing'];
    let svg=`<g class="projectile-visual" data-projectile-stage="${stage}"><rect width="${W}" height="${H}" fill="${C.bg}"/>`;
    svg+=text(compact?24:30,34,'ONE FLIGHT · TWO MOTIONS',compact?16:14,C.muted);
    svg+=math(W-(compact?24:30),35,String.raw`t=${f(t)}\,\mathrm{s}`,compact?20:19,C.ink,'end',150);
    svg+=text(graph.x,graph.y-22,'VERTICAL POSITION / m',compact?16:14,C.muted);
    // Tick the visible physical extent, not merely each data extent. Otherwise
    // labels bunch together for a tall vertical or very shallow trajectory.
    for(const value of ticks(axisMaxY,compact?3:4))svg+=line(ox,Y(value),graph.x+graph.w,Y(value),C.grid,1,'3 7')+text(ox-12,Y(value)+5,f(value,1),compact?16:14,C.muted,'end');
    for(const value of ticks(axisMaxX,compact?3:4))svg+=line(X(value),oy-4,X(value),oy+4,C.axis,1.4)+text(X(value),oy+26,f(value,1),compact?16:14,C.muted,'middle');
    svg+=line(ox,graph.y-4,ox,oy,C.axis,1.7)+line(ox,oy,graph.x+graph.w+5,oy,C.axis,1.7);
    svg+=text(graph.x+graph.w,oy+51,'HORIZONTAL POSITION / m',compact?16:14,C.muted,'end');
    svg+=`<defs><clipPath id="projectile-scene-plot"><rect x="${graph.x-4}" y="${graph.y-8}" width="${graph.w+16}" height="${graph.h+26}"/></clipPath></defs><g clip-path="url(#projectile-scene-plot)">`;
    for(const run of runs){
      svg+=path(run.params,run.full.T,run.color,2,run.dash,.78);
      if(flags.ghosts!==false){const q=analyse(run.params,t);svg+=dot(X(q.x),Y(q.y),4,run.color,.85);}
    }
    svg+=path(p,T,C.axis,1.8,'4 6',.85)+path(p,t,C.ink,3.5);
    const px=X(r.x),py=Y(r.y);
    if(flags.projections!==false){
      svg+=line(px,py,px,oy,C.horizontal,1.4,'4 5',.8)+line(ox,py,px,py,C.vertical,1.4,'4 5',.8);
      svg+=dot(px,oy,4,C.horizontal)+dot(ox,py,4,C.vertical);
    }
    if(stage===2&&full.hasApex){
      const apex=analyse(p,full.apexTime),ax=X(apex.x),ay=Y(apex.y);
      svg+=line(ox,ay,ax,ay,C.vertical,1.5,'3 5',.9)+dot(ax,ay,5,C.vertical);
      if(full.ux>EPS)svg+=arrow(ax,ay,ax+Math.min(55,graph.w*.15),ay,C.horizontal,2.8);
    }
    // These are velocity arrows, with a separate shared scale for both components.
    const maxSpeed=Math.max(1,Math.hypot(full.ux,full.uy),analyse(p,T).speed,...runs.flatMap(run=>[run.params.u,analyse(run.params,run.full.T).speed]));
    const velocityScale=Math.min(1.8,52/maxSpeed);
    if(flags.components!==false){
      svg+=arrow(px,py,px+r.vx*velocityScale,py,C.horizontal,2.5);
      svg+=arrow(px,py,px,py-r.vy*velocityScale,C.vertical,2.5);
      if(stage!==0)svg+=arrow(px,py,px+r.vx*velocityScale,py-r.vy*velocityScale,C.ink,1.7);
    }
    svg+=dot(X(0),Y(p.h),4,C.horizontal)+dot(px,py,6,C.ink);
    if(stage===4)svg+=dot(X(full.R),Y(0),5,C.vertical);
    svg+='</g>';
    if(stage===2&&full.hasApex)svg+=text(graph.x+28,graph.y+18,'Yellow dot: full-flight apex',compact?14:14,C.vertical);
    const rx=compact?28:550,ry=compact?448:122,main=compact?29:28,body=compact?17:16;
    svg+=text(rx,ry,String(stage+1).padStart(2,'0')+' / '+titles[stage],compact?18:16,C.muted);
    if(stage===0){
      svg+=math(rx,ry+43,String.raw`u_x=u\cos\theta`,main,C.horizontal);
      svg+=math(rx,ry+83,String.raw`u_y=u\sin\theta`,main,C.vertical);
      svg+=math(rx,ry+127,String.raw`u_x=${f(r.ux)}\,\mathrm{m\,s^{-1}}`,compact?27:25,C.horizontal);
      svg+=math(rx,ry+165,String.raw`u_y=${f(r.uy)}\,\mathrm{m\,s^{-1}}`,compact?27:25,C.vertical);
      svg+=text(rx,ry+201,'Resolve velocity before using SUVAT.',body,C.muted);
    }else if(stage===1){
      svg+=math(rx,ry+42,String.raw`x(t)=\color{#58c4dd}{u_x t}`,main);
      svg+=math(rx,ry+87,String.raw`y(t)=h+\color{#f4d345}{u_y t}-\color{#e2a4b6}{\frac12gt^2}`,compact?27:24);
      svg+=math(rx,ry+129,String.raw`a_x=0,\qquad a_y=-g`,compact?27:25);
      svg+=text(rx,ry+167,'The horizontal clock is the vertical clock.',body,C.muted);
      svg+=text(rx,ry+196,'Gravity changes only vertical velocity.',body,C.muted);
    }else if(stage===2){
      if(full.hasApex){
        svg+=math(rx,ry+44,String.raw`v_y=u_y-gt`,main,C.vertical);
        svg+=math(rx,ry+86,String.raw`v_y=0\ \Rightarrow\ t_{\mathrm{apex}}=\frac{u_y}{g}`,compact?25:23,C.vertical);
        svg+=math(rx,ry+128,String.raw`v_x=u_x,\qquad a_y=-g`,compact?26:24);
        svg+=math(rx,ry+168,String.raw`H=h+\frac{u_y^2}{2g}=${f(full.H)}\,\mathrm{m}`,compact?25:23);
        svg+=text(rx,ry+205,full.vertical?'Vertical launch: momentarily at rest.':'At the apex, motion continues to the right.',body,C.muted);
      }else{
        svg+=math(rx,ry+44,String.raw`u_y\leq0`,main,C.vertical);
        svg+=math(rx,ry+87,String.raw`v_y=u_y-gt\leq0`,main);
        svg+=math(rx,ry+128,String.raw`H=h=${f(full.H)}\,\mathrm{m}`,main);
        svg+=text(rx,ry+169,'There is no later apex above the launch.',body,C.muted);
        svg+=text(rx,ry+200,'The maximum height is the starting height.',body,C.muted);
      }
    }else if(stage===3){
      if(!full.vertical){
        svg+=math(rx,ry+44,String.raw`t=\frac{x}{u_x}`,main,C.horizontal);
        svg+=math(rx,ry+91,String.raw`y=h+\frac{u_y}{u_x}x-\frac{g}{2u_x^2}x^2`,compact?26:23);
        svg+=math(rx,ry+137,String.raw`=h+(\tan\theta)x`,compact?27:25,C.vertical);
        svg+=math(rx,ry+180,String.raw`\phantom{=h}\!-\frac{g}{2u^2\cos^2\theta}x^2`,compact?26:24,C.gravity);
        svg+=text(rx,ry+214,'Eliminating the clock reveals a parabola.',body,C.muted);
      }else{
        svg+=math(rx,ry+44,String.raw`u_x=0,\qquad x(t)=0`,main,C.horizontal);
        svg+=math(rx,ry+88,String.raw`y(t)=h+u_y t-\frac12gt^2`,compact?27:24);
        svg+=text(rx,ry+132,'A vertical launch traces a vertical line.',body,C.muted);
        svg+=text(rx,ry+165,'Keep time as the parameter here.',body,C.muted);
        svg+=text(rx,ry+199,'Do not divide by horizontal velocity.',body,C.muted);
      }
    }else{
      svg+=math(rx,ry+44,String.raw`0=h+u_yT-\frac12gT^2`,compact?27:24);
      svg+=math(rx,ry+91,String.raw`T=\frac{u_y+\sqrt{u_y^2+2gh}}{g}`,compact?27:25);
      svg+=math(rx,ry+137,String.raw`R=u_xT=${f(full.R)}\,\mathrm{m}`,compact?28:26,C.horizontal);
      if(full.equalHeight&&full.uy>EPS){
        svg+=math(rx,ry+181,String.raw`h=0:\quad R=\frac{u^2\sin(2\theta)}{g}`,compact?25:23,C.vertical);
        svg+=text(rx,ry+214,'Equal heights: complementary angles agree.',body,C.muted);
      }else if(T<=EPS){
        svg+=math(rx,ry+180,String.raw`T=0,\qquad R=0`,main,C.vertical);
        svg+=text(rx,ry+214,'Ground contact occurs immediately.',body,C.muted);
      }else{
        svg+=text(rx,ry+179,'Use the launch height in the root above.',body,C.muted);
        svg+=text(rx,ry+210,'Equal-height range shortcuts do not apply.',body,C.muted);
      }
    }
    // The lower panel links geometry to the same live numbers, without hiding
    // the complete trajectory while a symbolic derivation changes view.
    const by=compact?728:473,bx=compact?28:68,bw=compact?404:766;
    svg+=line(bx,by-19,bx+bw,by-19,C.grid,1);
    if(stage===0){
      svg+=text(bx,by+4,'A RIGHT TRIANGLE OF VELOCITIES',compact?16:14,C.muted);
      const ax=bx+45,ay=by+(compact?69:92),ss=compact?1.4:2.3,dx=r.ux*ss,dy=-r.uy*ss;
      svg+=arrow(ax,ay,ax+dx,ay,C.horizontal,3)+arrow(ax+dx,ay,ax+dx,ay+dy,C.vertical,3)+arrow(ax,ay,ax+dx,ay+dy,C.ink,2);
      const labelX=compact?bx+153:bx+230;
      svg+=math(labelX,by+43,String.raw`u^2=u_x^2+u_y^2`,compact?25:27,C.ink,'start',compact?242:460);
      svg+=math(labelX,by+86,String.raw`\theta=${f(p.theta,0)}^{\circ}`,compact?25:27,C.muted,'start',compact?242:460);
    }else if(stage===1){
      svg+=text(bx,by+4,'THE SAME INSTANT IN BOTH DIRECTIONS',compact?16:14,C.muted);
      svg+=math(bx,by+46,String.raw`x=${f(r.ux)}(${f(t)})\approx${f(r.x)}\,\mathrm{m}`,compact?25:27,C.horizontal,'start',bw);
      svg+=math(bx,by+91,String.raw`y=${f(p.h)}+(${f(r.uy)} )(${f(t)})-${f(r.drop)}\approx${f(r.y)}\,\mathrm{m}`,compact?22:27,C.vertical,'start',bw);
    }else if(stage===2){
      svg+=text(bx,by+4,'VELOCITY AND ACCELERATION ARE DIFFERENT',compact?16:14,C.muted);
      svg+=math(bx,by+48,String.raw`\vec v=\begin{pmatrix}${f(r.vx)}\\${f(r.vy)}\end{pmatrix}\,\mathrm{m\,s^{-1}}`,compact?25:27,C.ink,'start',compact?215:330);
      svg+=math(compact?bx+234:bx+414,by+48,String.raw`\vec a=\begin{pmatrix}0\\-${f(p.g)}\end{pmatrix}\,\mathrm{m\,s^{-2}}`,compact?23:27,C.gravity,'start',compact?170:350);
      svg+=text(bx,by+105,'Acceleration points down throughout the flight.',compact?16:17,C.muted);
    }else if(stage===3){
      svg+=text(bx,by+4,'THE POINT STILL FOLLOWS THE PHYSICAL CLOCK',compact?16:14,C.muted);
      svg+=math(bx,by+50,String.raw`(x,y)=(${f(r.x)},\,${f(r.y)})\,\mathrm{m}`,compact?27:31,C.ink,'start',bw);
      svg+=text(bx,by+94,full.vertical?'One horizontal position, many different heights.':compact?'Change the angle; drag time to trace the curve.':'Change the angle to change the parabola; drag time to trace it.',compact?16:17,C.muted);
    }else{
      svg+=text(bx,by+4,'FIRST CONTACT WITH THE GROUND',compact?16:14,C.muted);
      svg+=math(bx,by+51,String.raw`T=${f(full.T)}\,\mathrm{s}`,compact?27:31,C.vertical,'start',compact?180:320);
      svg+=math(compact?bx+208:bx+390,by+51,String.raw`R=${f(full.R)}\,\mathrm{m}`,compact?27:31,C.horizontal,'start',compact?196:370);
      svg+=text(bx,by+96,'Final velocity means velocity just before impact.',compact?16:17,C.muted);
    }
    const footer=stage===4&&full.equalHeight&&full.uy>EPS?(compact?'Complementary angles: equal speed, gravity and heights.':'Complementary angles need the same speed, gravity and landing height.'):full.vertical?'Vertical launch · horizontal position stays fixed.':stage===2?'Zero vertical velocity does not mean zero acceleration.':compact?'No drag · constant gravity · one shared clock':'No air resistance · constant downward gravity · one shared clock';
    svg+=text(W/2,H-18,footer,compact?14:15,C.muted,'middle');
    runs.forEach((run,index)=>{const lx=compact?24+(index%2)*218:30+index*211,ly=compact?62+Math.floor(index/2)*24:63;svg+=line(lx,ly,lx+18,ly,run.color,2,run.dash)+text(lx+24,ly+5,run.label,compact?14:13,run.color);});
    svg+='</g>';
    const ariaLabel='Live projectile lesson, view '+(stage+1)+': '+titles[stage]+'. Time '+f(t)+' seconds of '+f(T)+' seconds before first ground contact. Horizontal position '+f(r.x)+' metres; height '+f(r.y)+' metres. Horizontal velocity '+f(r.vx)+' metres per second; vertical velocity '+f(r.vy)+' metres per second. Range '+f(full.R)+' metres; maximum height '+f(full.H)+' metres. '+(full.hasApex?'The apex occurs '+f(full.apexTime)+' seconds after launch.':'There is no apex after launch; the projectile starts horizontally or downwards.')+(full.vertical?' Vertical launch: horizontal position is zero; do not divide by horizontal velocity.':'')+' Cyan identifies horizontal motion; yellow identifies vertical launch motion; pink identifies the effect of gravity. Both directions share one clock. Axis metres share one geometric scale.';
    return {svg,viewBox:`0 0 ${W} ${H}`,ariaLabel};
  }
  const api=Object.freeze({render,analyse});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(scope)scope.ProjectileVisualLab=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
