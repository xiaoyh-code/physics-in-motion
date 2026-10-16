/* Observe first; force-balance explanations are an explicit opt-in. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);let tools,showExplanation=false,lastStatus='';
  const active=()=>window.labDebug?.getState().id==='newton';
  function el(tag,text,parent,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;if(parent)parent.append(n);return n;}
  function renderControls(box,params){
    box.replaceChildren();box.className='terminal-controls';
    el('p','Change one setting, then scrub the same moment again. You do not need a drag-force formula.',box,'terminal-controls-help');
    for(const c of window.TerminalModel.model.controls){
      const label=el('label',undefined,box,'terminal-control');el('span',c.label,label);let input;
      if(c.options){input=el('select',undefined,label);for(const o of c.options){const option=el('option',o.label,input);option.value=o.value;}}
      else{input=el('input',undefined,label);input.type='number';input.min=c.min;input.max=c.max;input.step='any';}
      input.id='param-'+c.key;input.value=params[c.key];if(c.unit)el('span',c.unit,label,'unit-label');
      input.onchange=()=>{if(input.value.trim()===''||!Number.isFinite(Number(input.value))){onUpdate();return;}const value=Math.max(c.min,Math.min(c.max,Number(input.value)));window.labDebug.editParams({[c.key]:value});input.value=value;};
    }
    el('p','The canopy takes three seconds to inflate after the selected opening time. Size changes the fully open canopy.',box,'terminal-controls-help');
  }
  function onUpdate(){
    const isActive=active();document.body.classList.toggle('terminal-concept-page',isActive&&!showExplanation);
    $('liveLab')?.classList.toggle('terminal-live-lab',isActive);
    if($('terminalStudyNotes'))$('terminalStudyNotes').hidden=!isActive;$('liveLab')?.classList.toggle('terminal-explaining',isActive&&showExplanation);
    if(tools)tools.hidden=!isActive;
    if(!isActive){if($('controls'))$('controls').classList.remove('terminal-controls');return;}
    $('controls')?.classList.add('terminal-controls');
    const state=window.labDebug.getState(),r=state.result;
    const heading=document.querySelector('.parameters .panel-top h2');if(heading)heading.textContent='Try a different fall';
    for(const c of window.TerminalModel.model.controls){const input=$('param-'+c.key);if(input){if(document.activeElement!==input)input.value=state.params[c.key];input.disabled=['canopy','open'].includes(c.key)&&!state.params.deploy;}}
    if($('motionLessonTools'))$('motionLessonTools').hidden=!showExplanation;
    if($('motionStageCaption'))$('motionStageCaption').hidden=!showExplanation;
    if($('terminalOpenJump'))$('terminalOpenJump').disabled=!state.params.deploy;
    if($('terminalObservation')&&lastStatus!==r.status){$('terminalObservation').textContent=r.status;lastStatus=r.status;}
  }
  function init(){
    const scene=$('scene');if(!scene)return;
    tools=el('section',undefined,undefined,'terminal-observation-tools');tools.id='terminalObservationTools';tools.setAttribute('aria-label','Observe the fall');
    el('p','Watch the upward air resistance and downward weight. Drag time to connect the arrows with the speed graph.',tools,'terminal-observe-prompt');
    const jumps=el('div',undefined,tools,'terminal-jumps');
    for(const [label,at,id]of[['Release',()=>0,'terminalReleaseJump'],['Canopy opening',s=>s.params.open+1.5,'terminalOpenJump'],['Later in the fall',()=>40,'terminalLaterJump']]){const b=el('button',label,jumps);b.type='button';b.id=id;b.onclick=()=>window.labDebug.setTime(at(window.labDebug.getState()));}
    const label=el('label',undefined,tools,'terminal-explanation-toggle'),input=el('input',undefined,label);input.type='checkbox';input.id='showTerminalExplanation';el('span','Show the force explanation',label);input.onchange=()=>{showExplanation=input.checked;window.labDebug.setTime(window.labDebug.getState().time);onUpdate();};
    const status=el('p','',tools,'terminal-observation-status');status.id='terminalObservation';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    scene.before(tools);const motionTools=$('motionLessonTools');if(motionTools)motionTools.after(tools);
    const notes=el('section',undefined,undefined,'terminal-study-notes');notes.id='terminalStudyNotes';notes.setAttribute('aria-labelledby','terminalStudyHeading');
    el('p','OBSERVE → EXPLAIN',notes,'kicker');el('h2','Read the fall in three stages',notes).id='terminalStudyHeading';
    const definition=el('p','Terminal velocity is a steady falling velocity reached when air resistance balances weight. The person is still moving; the acceleration is zero.',notes,'terminal-definition');
    const stages=el('div',undefined,notes,'terminal-reading-stages');
    for(const [n,title,text] of [
      ['01','Before the parachute opens','From rest, the skydiver speeds up. Air resistance grows, while weight stays the same. The gap between the forces shrinks, so speed increases more slowly.'],
      ['02','As the canopy grows','A larger area meets the air. When air resistance exceeds weight, the resultant is upward. The skydiver can still move downward while slowing down. Speed does not jump instantly.'],
      ['03','With the canopy fully open','As the skydiver slows, air resistance falls. The two forces approach balance again at a lower falling speed. The open canopy then keeps the same size.']
    ]){const row=el('article',undefined,stages);el('span',n,row,'terminal-reading-number');const body=el('div',undefined,row);el('h3',title,body);el('p',text,body);}
    const check=el('div',undefined,notes,'terminal-quick-check');el('h3','Pause and predict',check);el('p','A skydiver is moving downward but slowing down. Which way is the resultant force?',check);const actions=el('div',undefined,check,'terminal-check-actions'),feedback=el('p','',check,'terminal-check-feedback');feedback.setAttribute('role','status');
    for(const answer of ['Upward','Downward','There is no resultant']){const b=el('button',answer,actions);b.type='button';b.onclick=()=>{feedback.textContent=answer==='Upward'?'Yes. An upward resultant reduces the downward velocity; it does not mean the person is already moving upward.':'Look at the change in velocity. Slowing a downward fall requires an upward resultant, so air resistance must exceed weight.';};}
    const tip=el('aside',undefined,notes,'terminal-concept-tip');el('strong','Keep these ideas separate',tip);el('p','Air resistance is a force, not air pressure. Balanced forces mean no acceleration; they do not require the object to be at rest.',tip);
    const source=el('p',undefined,notes,'terminal-reading-source');el('span','Further reading: ',source);const link=el('a','Terminal velocity · Edexcel IGCSE',source);link.href='https://www.savemyexams.com/igcse/physics/edexcel/19/revision-notes/1-forces-and-motion/1-2-forces-movement-and-changing-shape/1-2-7-terminal-velocity/';link.target='_blank';link.rel='noopener';
    $('liveLab').after(notes);

    document.addEventListener('physics-topic-change',()=>{lastStatus='';onUpdate();});onUpdate();
  }
  window.TerminalLesson=Object.freeze({renderControls,onUpdate,showExplanation:()=>showExplanation});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
