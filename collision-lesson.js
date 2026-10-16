/* Observe the collision first. Reveal the signed momentum calculation by choice. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);let tools,showWorking=false,lastStatus='';
  const active=()=>window.labDebug?.getState().id==='momentum';
  function el(tag,text,parent,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;if(parent)parent.append(n);return n;}
  function renderControls(box,params){
    box.replaceChildren();box.className='collision-controls';
    el('p','Positive velocity means right; negative means left. Change one value, then revisit the same instant.',box,'collision-controls-help');
    for(const c of window.CollisionModel.model.controls){
      const group=el('div',undefined,box,'collision-control');
      const label=el('label',undefined,group);label.htmlFor='param-'+c.key;el('span',c.label,label);let field,slider;
      if(c.options){field=el('select',undefined,label);for(const option of c.options){const n=el('option',option.label,field);n.value=option.value;}}
      else{field=el('input',undefined,label);field.type='number';field.min=c.min;field.max=c.max;field.step='any';}
      field.id='param-'+c.key;field.value=params[c.key];if(c.unit)el('span',c.unit,label,'unit-label');
      function set(raw){if(String(raw).trim()===''||!Number.isFinite(Number(raw))){field.value=window.labDebug.getState().params[c.key];return;}
        const value=Math.max(c.min,Math.min(c.max,Number(raw)));window.labDebug.editParams({[c.key]:value});field.value=value;
        if(slider){slider.value=value;slider.style.setProperty('--range-fill',100*(value-c.min)/(c.max-c.min)+'%');}}
      field.onchange=()=>set(field.value);
      if(!c.options){slider=el('input',undefined,group);slider.type='range';slider.min=c.min;slider.max=c.max;slider.step=c.step;slider.value=params[c.key];slider.setAttribute('aria-label',c.label+' slider');slider.style.setProperty('--range-fill',100*(params[c.key]-c.min)/(c.max-c.min)+'%');slider.oninput=()=>set(slider.value);}
    }
    el('p','Start with sticking. The bounce option lets you test whether the same total momentum can give a different outcome.',box,'collision-controls-help');
  }
  function onUpdate(){
    const yes=active();document.body.classList.toggle('collision-observe-page',yes&&!showWorking);$('liveLab')?.classList.toggle('collision-live-lab',yes);$('liveLab')?.classList.toggle('collision-working-visible',yes&&showWorking);
    if(tools)tools.hidden=!yes;if($('collisionStudyNotes'))$('collisionStudyNotes').hidden=!yes;
    if(!yes){$('controls')?.classList.remove('collision-controls');return;}
    $('controls')?.classList.add('collision-controls');const s=window.labDebug.getState(),r=s.result;
    const heading=document.querySelector('.parameters .panel-top h2');if(heading)heading.textContent='Set up the two cars';
    for(const c of window.CollisionModel.model.controls){const field=$('param-'+c.key);if(field&&document.activeElement!==field)field.value=s.params[c.key];const slider=field?.closest('.collision-control')?.querySelector('input[type=range]');if(slider&&document.activeElement!==slider){slider.value=s.params[c.key];slider.style.setProperty('--range-fill',100*(s.params[c.key]-c.min)/(c.max-c.min)+'%');}}
    if($('motionLessonTools'))$('motionLessonTools').hidden=!showWorking;if($('motionStageCaption'))$('motionStageCaption').hidden=!showWorking;
    for(const id of ['collisionBeforeJump','collisionContactJump','collisionAfterJump'])if($(id))$(id).disabled=!r.collisionInRun;
    if($('collisionObservation')&&lastStatus!==r.status){$('collisionObservation').textContent=r.status;lastStatus=r.status;}
  }
  function init(){
    const scene=$('scene');if(!scene)return;
    tools=el('section',undefined,undefined,'collision-observation-tools');tools.id='collisionObservationTools';tools.setAttribute('aria-label','Observe before and after contact');
    el('p','Watch the cars first. Drag the time slider across contact, then compare the directions and arrow lengths.',tools,'collision-observe-prompt');
    const jumps=el('div',undefined,tools,'collision-jumps');
    for(const [label,id,at]of[['Just before','collisionBeforeJump',r=>Math.max(0,r.tc-.001)],['At contact','collisionContactJump',r=>r.tc],['After contact','collisionAfterJump',r=>Math.min(r.T,r.tc+1)]]){const b=el('button',label,jumps);b.id=id;b.type='button';b.onclick=()=>{const r=window.labDebug.getState().result;if(r.collisionInRun)window.labDebug.setTime(at(r));};}
    const label=el('label',undefined,tools,'collision-working-toggle'),check=el('input',undefined,label);check.type='checkbox';check.id='showCollisionWorking';el('span','Show momentum working & derivation',label);check.onchange=()=>{showWorking=check.checked;window.labDebug.setTime(window.labDebug.getState().time);onUpdate();};
    const status=el('p','',tools,'collision-observation-status');status.id='collisionObservation';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    scene.before(tools);if($('motionLessonTools'))$('motionLessonTools').after(tools);
    const notes=el('section',undefined,undefined,'collision-study-notes');notes.id='collisionStudyNotes';notes.setAttribute('aria-labelledby','collisionStudyHeading');
    el('p','OBSERVE → EXPLAIN',notes,'kicker');el('h2','One track. Two cars. One system.',notes).id='collisionStudyHeading';
    el('p','Choose a positive direction and keep it throughout. A car can lose momentum while the other gains it. With negligible external impulse, the total for the pair stays the same.',notes,'collision-definition');
    const rows=el('div',undefined,notes,'collision-reading-stages');for(const [n,title,text]of[
      ['01','Before contact','Follow each car separately. A leftward velocity is negative. The gap closes only when car A is moving faster to the right than car B.'],
      ['02','During the interaction','Each car pushes the other for the same contact time. Their momentum changes are equal in size and opposite in sign. The ideal animation switches velocity at contact; it does not resolve the impact forces.'],
      ['03','After contact','When the cars stick, they share one velocity. They can move right, move left or both stop. Total momentum is conserved, while kinetic energy can be transferred to other forms.']
    ]){const row=el('article',undefined,rows);el('span',n,row,'collision-reading-number');const copy=el('div',undefined,row);el('h3',title,copy);el('p',text,copy);}
    const aside=el('aside',undefined,notes,'collision-concept-tip');el('strong','Pause and predict',aside);el('p','Try equal masses with equal and opposite initial velocities, then stick them together. Can the total momentum be zero while both cars are initially moving?',aside);const answer=el('details',undefined,aside);el('summary','Explain the observation',answer);el('p','Yes. The signed momenta cancel before contact. The combined cars stop after sticking, so the total remains zero. Their initial kinetic energy was positive; momentum conservation does not mean kinetic energy must be conserved.',answer);
    $('liveLab').after(notes);document.addEventListener('physics-topic-change',()=>{lastStatus='';onUpdate();});
    document.addEventListener('physics-tab-change',event=>{if(event.detail.id==='derive'&&active())revealWorking();});onUpdate();
  }
  function revealWorking(){if(!active())return;showWorking=true;if($('showCollisionWorking'))$('showCollisionWorking').checked=true;window.labDebug.setTime(window.labDebug.getState().time);onUpdate();}
  window.CollisionLesson=Object.freeze({renderControls,onUpdate,showWorking:()=>showWorking,revealWorking});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
