/* Direct manipulation of a force tip; the shared lab still owns parameters. */
(function () {
  'use strict';
  const $=id=>document.getElementById(id), labels={A:'force A',B:'force B',R:'resultant R'};
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const format=v=>Math.abs(v)<.0005?'0':Number(v.toFixed(2)).toString();
  let selected='R',hold='A',showWorking=false,placeSelected=false,drag=null,lastScene=null,tools,live,rule,buttons=[],ignoreClickUntil=0;
  const active=()=>window.labDebug?.getState().id==='vectors';
  function element(tag,text,parent,cls) {
    const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;if(parent)parent.append(n);return n;
  }
  function refreshTools() {
    if(!tools)return;
    tools.hidden=!active();
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chooseForce===selected)));
    rule.textContent=hold==='A'?'Moving R keeps A fixed and recalculates B.':'Moving R keeps B fixed and recalculates A.';
    $('forceHold').value=hold;
  }
  function describe(limited=false,edge=false) {
    if(!active()||!live)return;
    const c=window.ForceDragModel.components(window.labDebug.getState().params),prefix=limited?'Reached the 100 N force limit. ':edge?'Diagram edge reached. Release to reframe, then continue; or edit the values. ':'';
    live.textContent=prefix||(showWorking?'Resultant along X: '+format(c.rx)+' N; along Y: '+format(c.ry)+' N.':'Three arrow tips, one shared X/Y scale.');
  }
  function usePoint(target,point,{constrain=false,focus=false}={}) {
    if(!active())return;
    const p=window.labDebug.getState().params,c=window.ForceDragModel.components(p);let edge=false;
    // Keep all three original arrow tips within the frozen plot while dragging.
    // The later radial force limit also stays in this convex region.
    if(constrain&&lastScene?.camera) {
      const cam=drag?.camera||lastScene.camera,b=cam.plotBounds,o=cam.origin,s=cam.scale,m=26;
      let x0=(b.x+m-o.x)/s,x1=(b.x+b.width-m-o.x)/s,y0=(o.y-(b.y+b.height-m))/s,y1=(o.y-(b.y+m))/s;
      let dx=0,dy=0;
      if(target==='A'){dx=c.bx;dy=c.by;}
      if(target==='B'){dx=c.ax;dy=c.ay;}
      if(target==='R'){dx=-(hold==='A'?c.ax:c.bx);dy=-(hold==='A'?c.ay:c.by);}
      const next={x:clamp(point.x,Math.max(x0,x0-dx),Math.min(x1,x1-dx)),y:clamp(point.y,Math.max(y0,y0-dy),Math.min(y1,y1-dy))};edge=Math.hypot(next.x-point.x,next.y-point.y)>1e-8;point=next;
    }
    const out=window.ForceDragModel.moveForce(p,target,point,hold);
    window.labDebug.editParams(out.params);
    describe(out.limited,edge);
    if(focus)$('scene').querySelector(`[data-force-handle="${target}"]`)?.focus({preventScroll:true});
  }
  function coordinates(event) {
    const scene=$('scene'),matrix=scene.getScreenCTM();if(!matrix||!lastScene?.camera)return null;
    const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(drag?.screenInverse||matrix.inverse()),cam=drag?.camera||lastScene.camera;
    return {x:(p.x-cam.origin.x)/cam.scale,y:(cam.origin.y-p.y)/cam.scale,svgX:p.x,svgY:p.y};
  }
  function currentPoint(target) {
    const c=window.ForceDragModel.components(window.labDebug.getState().params);
    return target==='A'?{x:c.ax,y:c.ay}:target==='B'?{x:c.bx,y:c.by}:{x:c.rx,y:c.ry};
  }
  function nudge(dx,dy,amount=1,focus=false) {
    const p=currentPoint(selected);usePoint(selected,{x:p.x+dx*amount,y:p.y+dy*amount},{focus});
  }
  function finish(event) {
    if(!drag||(event&&event.pointerId!==drag.id))return;
    const id=drag.id;drag=null;$('scene').classList.remove('force-dragging');
    if($('scene').hasPointerCapture(id))$('scene').releasePointerCapture(id);
    ignoreClickUntil=performance.now()+350;
    if(active()){const notice=live?.textContent||'';window.labDebug.setTime(window.labDebug.getState().time);if(/^(Reached|Diagram edge)/.test(notice))live.textContent=notice;}
  }
  function init() {
    const scene=$('scene');if(!scene)return;
    tools=element('div',undefined,undefined,'force-direct-tools');tools.id='forceDirectTools';scene.before(tools);
    element('p','Drag the circular tips of A, B or R. Or choose one below, then tap a position on the X/Y diagram.',tools,'force-direct-help');
    const row=element('div',undefined,tools,'force-direct-row');
    const choose=element('div',undefined,row,'force-chooser');choose.setAttribute('role','group');choose.setAttribute('aria-label','Choose a force to position');
    for(const [id,name] of [['A','Force A'],['B','Force B'],['R','Resultant R']]) {
      const b=element('button',name,choose);b.type='button';b.dataset.chooseForce=id;b.setAttribute('aria-controls','scene');
      b.onclick=()=>{selected=id;placeSelected=true;ignoreClickUntil=0;refreshTools();live.textContent='Choose a position for '+labels[id]+', or use the movement buttons.';};buttons.push(b);
    }
    const label=element('label','When moving R',row,'force-hold-label'),select=element('select',undefined,label);select.id='forceHold';
    for(const [value,text]of[['A','Keep A fixed'],['B','Keep B fixed']]){const o=element('option',text,select);o.value=value;}
    select.onchange=()=>{hold=select.value;refreshTools();describe();};
    rule=element('p','',tools,'force-direct-rule');
    const detail=element('details',undefined,tools,'force-keyboard-tools');element('summary','Move without dragging',detail);
    element('p','Choose A, B or R, then move its tip by 1 N along X or Y. A focused arrow tip also supports the arrow keys; hold Shift for 5 N.',detail);
    const pad=element('div',undefined,detail,'force-nudge-pad');
    for(const [name,dx,dy]of[['Left on X',-1,0],['Right on X',1,0],['Down on Y',0,-1],['Up on Y',0,1]]){
      const b=element('button',name,pad);b.type='button';b.onclick=()=>nudge(dx,dy);
    }
    const workingLabel=element('label',undefined,tools,'force-working-toggle'),working=element('input',undefined,workingLabel);working.type='checkbox';working.id='showForceWorking';element('span','Show X/Y working',workingLabel);
    working.onchange=()=>{showWorking=working.checked;placeSelected=false;finish();window.labDebug.setTime(window.labDebug.getState().time);onUpdate();};
    live=element('p','',undefined,'force-direct-status');scene.after(live);live.setAttribute('role','status');live.setAttribute('aria-live','polite');
    scene.addEventListener('touchstart',event=>{
      if(active()&&!placeSelected&&event.target.closest('[data-force-handle]'))event.preventDefault();
    },{passive:false});
    scene.addEventListener('pointerdown',event=>{
      const handle=event.target.closest('[data-force-handle]');if(!active()||!handle||event.button!==0||drag||placeSelected)return;
      const at=coordinates(event);if(!at)return;event.preventDefault();selected=handle.dataset.forceHandle;
      const point=currentPoint(selected);drag={id:event.pointerId,target:selected,camera:lastScene.camera,screenInverse:scene.getScreenCTM().inverse(),offset:{x:point.x-at.x,y:point.y-at.y}};
      scene.setPointerCapture(event.pointerId);scene.classList.add('force-dragging');refreshTools();
      window.labDebug.pause();
    });
    scene.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.id||!active())return;event.preventDefault();const at=coordinates(event);if(!at)return;
      usePoint(drag.target,{x:at.x+drag.offset.x,y:at.y+drag.offset.y},{constrain:true});
    });
    scene.addEventListener('pointerup',finish);scene.addEventListener('pointercancel',finish);scene.addEventListener('lostpointercapture',finish);
    scene.addEventListener('click',event=>{
      if(!active()||performance.now()<ignoreClickUntil||(!placeSelected&&event.target.closest('[data-force-handle]')))return;
      const at=coordinates(event),b=lastScene?.camera.plotBounds;if(!at||!b||at.svgX<b.x||at.svgX>b.x+b.width||at.svgY<b.y||at.svgY>b.y+b.height)return;
      placeSelected=false;usePoint(selected,at,{constrain:true});
    });
    scene.addEventListener('keydown',event=>{
      const handle=event.target.closest('[data-force-handle]');if(!active()||!handle)return;
      if(event.key==='Enter'||event.key===' '){event.preventDefault();selected=handle.dataset.forceHandle;placeSelected=true;ignoreClickUntil=0;refreshTools();live.textContent='Choose a position for '+labels[selected]+'.';return;}
      const step={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowDown:[0,-1],ArrowUp:[0,1]}[event.key];if(!step)return;
      event.preventDefault();placeSelected=false;selected=handle.dataset.forceHandle;refreshTools();nudge(...step,event.shiftKey?5:1,true);
    });
    document.addEventListener('physics-topic-change',()=>{finish();lastScene=null;refreshTools();if(active())window.labDebug.setTime(window.labDebug.getState().time);describe();});
    window.addEventListener('resize',()=>finish());refreshTools();describe();
  }
  function renderControls(box,params) {
    placeSelected=false;ignoreClickUntil=0;
    box.replaceChildren();box.classList.add('force-value-controls');
    element('p','Drag the arrows or edit these values. Angles start from the rightward X direction.',box,'force-values-help');
    for(const [target,title,magnitudeKey,angleKey] of [['A','Force A','F','angle'],['B','Force B','B','beta'],['R','Resultant R','resultantMagnitude','resultantAngle']]) {
      const section=element('fieldset',undefined,box,'force-value-group');section.dataset.forceGroup=target;element('legend',title,section);
      for(const [key,name,unit,min,max]of[[magnitudeKey,'Magnitude','N',0,target==='R'?200:100],[angleKey,'Angle','°',-180,180]]) {
        const label=element('label',name,section),input=element('input',undefined,label);input.type='number';input.step='any';input.min=min;input.max=max;input.id='param-'+key;
        input.setAttribute('aria-label',title+' '+name.toLowerCase()+' in '+(unit==='N'?'newtons':'degrees'));element('span',unit,label,'unit-label');
        input.onchange=()=>{
          const v=Number(input.value);if(input.value===''||!Number.isFinite(v)){onUpdate();return;}
          const value=clamp(v,min,max);placeSelected=false;
          if(target!=='R')window.labDebug.editParams({[key]:value});
          else {
            const c=window.labDebug.getState().result,magnitude=key===magnitudeKey?value:c.R,angle=key===angleKey?value:(c.R<1e-8?0:c.theta),r=angle*Math.PI/180;
            usePoint('R',{x:magnitude*Math.cos(r),y:magnitude*Math.sin(r)});
          }
          input.value=format(key==='resultantMagnitude'?window.labDebug.getState().result.R:key==='resultantAngle'?(window.labDebug.getState().result.R<1e-8?0:window.labDebug.getState().result.theta):window.labDebug.getState().params[key]);
          describe();
        };
      }
      const readout=element('p','',section,'force-xy-readout');readout.id='forceXY-'+target;
      if(target==='R')element('p','R combines A and B; it is not an extra applied force.',section,'force-resultant-note');
    }
    // Initial render occurs before labDebug exists; metadata values suffice.
    for(const key of ['F','angle','B','beta'])$('param-'+key).value=format(params[key]);
  }
  function onUpdate() {
    const id=window.labDebug?.getState().id;
    document.body.classList.toggle('force-interaction-page',id==='vectors');
    $('liveLab')?.classList.toggle('force-direct-lab',id==='vectors');
    const heading=document.querySelector('.parameters .panel-top h2');if(heading)heading.textContent=id==='vectors'?'Force values':'Parameters';
    if(id!=='vectors'){document.body.classList.remove('force-simple-page'); $('controls')?.classList.remove('force-value-controls');return; }
    const state=window.labDebug.getState(),c=window.ForceDragModel.components(state.params);
    const values={...state.params,resultantMagnitude:state.result.R,resultantAngle:state.result.R<1e-8?'':state.result.theta};
    for(const [key,value] of Object.entries(values)) {
      const field=$('param-'+key);if(field&&document.activeElement!==field)field.value=value===''?'':format(value);
    }
    const angle=$('param-resultantAngle');if(angle){angle.disabled=state.result.R<1e-8;angle.placeholder=angle.disabled?'Undefined':'';}
    for(const [target,x,y] of [['A',c.ax,c.ay],['B',c.bx,c.by],['R',c.rx,c.ry]]) {
      const p=$('forceXY-'+target);if(p)p.textContent='X: '+format(x)+' N · Y: '+format(y)+' N';
    }
    refreshTools();describe();
    document.body.classList.toggle('force-simple-page',!showWorking);
    $('liveLab').classList.toggle('force-working-visible',showWorking);
    if($('motionLessonTools'))$('motionLessonTools').hidden=!showWorking;
    if($('motionStageCaption'))$('motionStageCaption').hidden=!showWorking;
  }
  window.ForceInteraction=Object.freeze({renderControls,onUpdate,showWorking:()=>showWorking,getCamera:()=>drag?.camera||null,onRender:output=>{lastScene=output;},isDragging:()=>!!drag});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
