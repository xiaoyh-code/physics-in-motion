/* Analytical projectile motion; presentation time is clamped at first ground contact. */
(function(root){
  'use strict';
  function flightTime(p){
    const uy=p.u*Math.sin(p.theta*Math.PI/180),d=Math.sqrt(uy*uy+2*p.g*p.h);
    // Rationalised root avoids cancellation for downward launches from a small height.
    return uy<0 ? (p.h===0?0:2*p.h/(d-uy)) : (uy+d)/p.g;
  }
  function calculate(p,t){
    const angle=p.theta*Math.PI/180,vx=p.u*Math.cos(angle),uy=p.u*Math.sin(angle),T=flightTime(p);
    t=Math.max(0,Math.min(T,t));
    const x=vx*t,y=t>=T?0:Math.max(0,p.h+uy*t-.5*p.g*t*t),vy=uy-p.g*t;
    return {t,x,y,vx,vy,v:Math.hypot(vx,vy),a:-p.g,ax:0,ay:-p.g,s:x,T,R:vx*T,H:p.h+Math.max(0,uy)**2/(2*p.g),Kspecific:.5*(vx*vx+vy*vy),Uspecific:p.g*y};
  }
  const control=(key,label,min,max,step,value,unit)=>({key,label,min,max,step,value,unit});
  const model={id:'projectile',title:'Projectile motion',group:'01 / MOTION',kind:'projectile',duration:6,
    controls:[control('u','Launch speed',1,30,.5,20,'m/s'),control('theta','Launch angle',-90,90,1,45,'°'),control('h','Starting height',0,20,.1,1.5,'m'),control('g','Gravity',.5,20,.01,9.81,'m/s²')],
    formula:String.raw`x=(u\cos\theta)t,\qquad y=h+(u\sin\theta)t-\frac12gt^2`,
    note:'Right and up are positive. No air resistance; constant downward gravity. The path includes first ground contact; the final velocity is just before impact. No bounce is modelled. Velocity arrows share a scale.'};
  const api={calculate,flightTime,model};
  if(typeof module!=='undefined')module.exports=api;
  root.Projectile=api;
  if(root.Physics){
    const oldCalc=root.Physics.calc,oldDuration=root.Physics.duration;
    root.Physics.M.splice(2,0,model);
    root.Physics.calc=(id,p,t)=>id==='projectile'?calculate(p,t):oldCalc(id,p,t);
    root.Physics.duration=(m,p)=>m.id==='projectile'?flightTime(p):oldDuration(m,p);
    root.Physics.outputs.projectile=[['vx','Horizontal velocity','m/s'],['vy','Vertical velocity','m/s'],['y','Height','m'],['R','Predicted range','m']];
  }
})(typeof window==='undefined'?globalThis:window);
