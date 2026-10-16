/* Signed x/y arithmetic for directly moving two forces and their resultant. */
(function (root) {
  'use strict';
  const finite = (n, fallback=0) => Number.isFinite(Number(n)) ? Number(n) : fallback;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  function clean(p={}) {
    return {F:clamp(finite(p.F),0,100),angle:clamp(finite(p.angle),-180,180),B:clamp(finite(p.B),0,100),beta:clamp(finite(p.beta),-180,180)};
  }
  function components(params) {
    const p=clean(params),r=Math.PI/180,zero=n=>Math.abs(n)<1e-12?0:n;
    const ax=zero(p.F*Math.cos(p.angle*r)),ay=zero(p.F*Math.sin(p.angle*r)),bx=zero(p.B*Math.cos(p.beta*r)),by=zero(p.B*Math.sin(p.beta*r));
    return {ax,ay,bx,by,rx:zero(ax+bx),ry:zero(ay+by)};
  }
  function polar(x,y,previousAngle) {
    const magnitude=Math.hypot(x,y);
    return {magnitude:magnitude<1e-10?0:Math.min(100,magnitude),angle:magnitude<1e-10?previousAngle:Math.atan2(y,x)*180/Math.PI};
  }
  function moveForce(params,target,point,hold='A') {
    const p=clean(params),c=components(p),x=finite(point?.x),y=finite(point?.y);
    if(!['A','B','R'].includes(target))throw new TypeError('Choose force A, force B or resultant R.');
    const changesA=target==='A'||(target==='R'&&hold==='B');
    const fixedX=target==='R'?(changesA?c.bx:c.ax):0,fixedY=target==='R'?(changesA?c.by:c.ay):0;
    const dx=x-fixedX,dy=y-fixedY,length=Math.hypot(dx,dy),factor=length>100?100/length:1;
    const next=polar(dx*factor,dy*factor,changesA?p.angle:p.beta);
    const result={...p,...(changesA?{F:next.magnitude,angle:next.angle}:{B:next.magnitude,beta:next.angle})};
    const out=components(result);
    return {params:result,point:target==='A'?{x:out.ax,y:out.ay}:target==='B'?{x:out.bx,y:out.by}:{x:out.rx,y:out.ry},limited:length>100+1e-9};
  }
  const api=Object.freeze({components,moveForce});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ForceDragModel=api;
})(typeof window!=='undefined'?window:globalThis);
