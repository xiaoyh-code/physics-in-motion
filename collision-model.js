/* An isolated pair on a straight track. Contact is instantaneous in this model;
 * car centres remain one car length apart. No collision is invented for an
 * opening gap or for contact beyond the displayed six-second interval. */
(function(root){
  'use strict';
  const T=6,GAP=8,LENGTH=2;
  const finite=(n,f)=>Number.isFinite(Number(n))?Number(n):f;
  const bound=(n,lo,hi,f)=>Math.max(lo,Math.min(hi,finite(n,f)));
  function clean(p={}){return{m1:bound(p.m1,.5,5,2),m2:bound(p.m2,.5,5,2),u1:bound(p.u1,-8,8,4),u2:bound(p.u2,-8,8,0),e:finite(p.e,0)>=.5?1:0};}
  function state(params,time=0){
    const p=clean(params),{m1,m2,u1,u2,e}=p,t=bound(time,0,T,0),total=m1+m2;
    const Pi=m1*u1+m2*u2,closing=u1-u2,hasCollision=closing>0,tc=hasCollision?GAP/closing:null;
    const collisionInRun=hasCollision&&tc<=T,collided=collisionInRun&&t>=tc;
    const v1=hasCollision?(Pi-m2*e*closing)/total:u1,v2=hasCollision?(Pi+m1*e*closing)/total:u2;
    const contactX1=hasCollision?-5+u1*tc:null,contactX2=hasCollision?5+u2*tc:null;
    const x1=collided?contactX1+v1*(t-tc):-5+u1*t,x2=collided?contactX2+v2*(t-tc):5+u2*t;
    const currentV1=collided?v1:u1,currentV2=collided?v2:u2,p1=m1*currentV1,p2=m2*currentV2;
    const Ki=.5*m1*u1*u1+.5*m2*u2*u2,Kf=.5*m1*v1*v1+.5*m2*v2*v2,K=.5*m1*currentV1**2+.5*m2*currentV2**2;
    const phase=collided?(e===0?'together':'separating'):collisionInRun?'approaching':hasCollision?'later-contact':'no-contact';
    const status=phase==='together'?'After contact: the two cars stick and share one velocity.':phase==='separating'?'After contact: the cars separate. Compare each velocity with its initial value.':phase==='approaching'?'Before contact: follow the two cars as the gap closes.':phase==='later-contact'?'The cars are approaching, but they do not meet within these six seconds.':'The gap is constant or increasing: there is no collision with these velocities.';
    return{...p,t,T,x1,x2,v1,v2,currentV1,currentV2,Pi,Pf:m1*v1+m2*v2,p1,p2,P:p1+p2,Ki,Kf,K,loss:Ki-Kf,tc,hasCollision,collisionInRun,collided,phase,status,contactX1,contactX2};
  }
  const control=(key,label,min,max,step,value,unit)=>({key,label,min,max,step,value,unit});
  const model={id:'momentum',title:'One-dimensional collision',group:'03 / MOMENTUM',kind:'collision',duration:T,controls:[
    control('m1','Car A mass',.5,5,.1,2,'kg'),control('m2','Car B mass',.5,5,.1,2,'kg'),
    control('u1','Car A initial velocity',-8,8,.25,4,'m/s'),control('u2','Car B initial velocity',-8,8,.25,0,'m/s'),
    {...control('e','Collision behaviour',0,1,1,0,''),options:[{value:0,label:'Stick together'},{value:1,label:'Bounce (perfectly elastic)'}]}
  ],formula:String.raw`m_1u_1+m_2u_2=m_1v_1+m_2v_2`,note:'Right is positive. The pair is isolated: external horizontal forces are neglected throughout this run. The cars begin with an 8 m gap. Contact is idealised as instantaneous; their drawing sizes are schematic. Sticking is the main model; perfectly elastic rebound is an optional comparison.'};
  const api=Object.freeze({state,clean,model,duration:()=>T,gap:GAP,carLength:LENGTH});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CollisionModel=api;
  if(root.Physics){const oldCalc=root.Physics.calc,oldDuration=root.Physics.duration,index=root.Physics.M.findIndex(m=>m.id==='momentum');if(index>=0)root.Physics.M[index]=model;
    root.Physics.calc=(id,p,t)=>id==='momentum'?state(p,t):oldCalc(id,p,t);
    root.Physics.duration=(m,p)=>m.id==='momentum'?T:oldDuration(m,p);
    root.Physics.outputs.momentum=[['p1','Car A momentum','kg m/s'],['p2','Car B momentum','kg m/s'],['P','Total momentum','kg m/s'],['K','Total kinetic energy','J']];
  }
})(typeof window==='undefined'?globalThis:window);
