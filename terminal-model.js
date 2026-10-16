/* A smooth illustrative fall, used to explore force balance rather than teach a drag law.
 * Internal model: still air, fixed mass/gravity, quadratic resistance and a canopy
 * that deploys smoothly over three seconds. No landing or equipment safety model.
 */
(function(root){
  'use strict';
  const DT=.01,T=60,G=9.81,OPENING=3,cache=new Map();
  const bodyCoefficients=[.15,.21,.27],canopyCoefficients=[10,18,30];
  const finite=(v,f)=>Number.isFinite(Number(v))?Number(v):f;
  const bound=(v,lo,hi,f)=>Math.max(lo,Math.min(hi,finite(v,f)));
  function clean(p={}){return{m:bound(p.m,50,110,75),body:Math.round(bound(p.body,0,2,2)),canopy:Math.round(bound(p.canopy,0,2,1)),open:bound(p.open,5,30,20),deploy:finite(p.deploy,1)>=.5?1:0};}
  function openingFraction(p,t){if(!p.deploy)return 0;const q=bound((t-p.open)/OPENING,0,1,0);return q*q*q*(10-15*q+6*q*q);}
  function coefficient(p,t){return bodyCoefficients[p.body]+canopyCoefficients[p.canopy]*openingFraction(p,t);}
  function acceleration(p,t,v){return G-coefficient(p,t)*v*Math.abs(v)/p.m;}
  function solution(params){
    const p=clean(params),key=JSON.stringify(p);if(cache.has(key))return cache.get(key);
    const values=[{t:0,v:0,s:0,a:G}];let v=0,s=0;
    for(let i=0;i<Math.round(T/DT);i++){
      const t=i*DT,k1v=acceleration(p,t,v),k1s=v,k2v=acceleration(p,t+DT/2,v+DT*k1v/2),k2s=v+DT*k1v/2,k3v=acceleration(p,t+DT/2,v+DT*k2v/2),k3s=v+DT*k2v/2,k4v=acceleration(p,t+DT,v+DT*k3v),k4s=v+DT*k3v;
      v=Math.max(0,v+DT*(k1v+2*k2v+2*k3v+k4v)/6);s+=DT*(k1s+2*k2s+2*k3s+k4s)/6;
      values.push({t:(i+1)*DT,v,s,a:acceleration(p,(i+1)*DT,v)});
    }
    const out={p,values};cache.set(key,out);if(cache.size>20)cache.delete(cache.keys().next().value);return out;
  }
  function hermite(y0,y1,d0,d1,q){const q2=q*q,q3=q2*q;return(2*q3-3*q2+1)*y0+(q3-2*q2+q)*DT*d0+(-2*q3+3*q2)*y1+(q3-q2)*DT*d1;}
  function state(params,time=0){
    const {p,values}=solution(params),t=bound(time,0,T,0),i=Math.min(values.length-2,Math.floor(t/DT)),a0=values[i],a1=values[i+1],q=bound((t-a0.t)/DT,0,1,0);
    const v=Math.max(0,hermite(a0.v,a1.v,a0.a,a1.a,q)),s=Math.max(0,hermite(a0.s,a1.s,a0.v,a1.v,q)),weight=p.m*G,drag=coefficient(p,t)*v*v,net=weight-drag,a=net/p.m,opening=openingFraction(p,t);
    const terminalBefore=Math.sqrt(weight/bodyCoefficients[p.body]),terminalAfter=Math.sqrt(weight/(bodyCoefficients[p.body]+canopyCoefficients[p.canopy])),terminalCurrent=Math.sqrt(weight/coefficient(p,t));
    let phase,status;
    if(t===0){phase='release';status='Released from rest: weight starts the fall.';}
    else if(p.deploy&&t>=p.open&&t<p.open+OPENING){phase='opening';status=a<0?'The canopy grows; the skydiver is still falling but slows down.':'The canopy is opening; compare drag with weight.';}
    else if(Math.abs(net)/weight<.01){phase=opening===1?'new-terminal':'terminal';status=opening===1?'Approaching a lower terminal speed.':'Approaching terminal speed: the forces nearly balance.';}
    else if(a>0){phase='speeding-up';status='Falling faster: upward drag grows as speed increases.';}
    else{phase='slowing-down';status='Still moving down, with an upward resultant: slowing down.';}
    return{t,v,s,a,weight,drag,net,resultant:net,openingFraction:opening,phase,status,T,terminalBefore,terminalAfter,terminalCurrent,vt:terminalBefore,openTime:p.open,openingDuration:OPENING,m:p.m,deploy:!!p.deploy,g:G};
  }
  function sample(params,count=241){count=Math.round(bound(count,2,2001,241));return Array.from({length:count},(_,i)=>state(params,T*i/(count-1)));}
  const control=(key,label,min,max,step,value,unit,options)=>({key,label,min,max,step,value,unit,...(options?{options}: {})});
  const model={id:'newton',title:'Drag & terminal velocity',group:'02 / FORCES',kind:'terminal',duration:T,controls:[
    control('m','Total mass',50,110,5,75,'kg'),
    control('body','Body position',0,2,1,2,'',[{value:0,label:'Tucked'},{value:1,label:'Relaxed'},{value:2,label:'Spread out'}]),
    control('deploy','Parachute',0,1,1,1,'',[{value:0,label:'No opening'},{value:1,label:'Open during the fall'}]),
    control('canopy','Canopy size',0,2,1,1,'',[{value:0,label:'Small'},{value:1,label:'Medium'},{value:2,label:'Large'}]),
    control('open','Start opening at',5,30,1,20,'s')
  ],formula:String.raw`\begin{aligned}F_{\mathrm{net}}&=W-F_D\\F_D=W&\ \Rightarrow\ a=0\end{aligned}`,note:'Down is positive. Air resistance opposes the fall. The canopy opens gradually; the diagram follows the skydiver and does not show a landing. This is an illustrative model, not a parachute design calculation.'};
  const api=Object.freeze({state,sample,duration:()=>T,clean,model});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.TerminalModel=api;
  if(root.Physics){
    const oldCalc=root.Physics.calc,oldDuration=root.Physics.duration,index=root.Physics.M.findIndex(m=>m.id==='newton');
    if(index>=0)root.Physics.M[index]=model;
    root.Physics.calc=(id,p,t)=>id==='newton'?state(p,t):oldCalc(id,p,t);
    root.Physics.duration=(m,p)=>m.id==='newton'?T:oldDuration(m,p);
    root.Physics.outputs.newton=[['v','Downward speed','m/s'],['drag','Upward air resistance','N'],['weight','Downward weight','N'],['a','Downward acceleration','m/s²']];
  }
})(typeof window==='undefined'?globalThis:window);
