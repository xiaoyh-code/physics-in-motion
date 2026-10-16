(function(){
  'use strict';
  const node=id=>document.getElementById(id);
  function el(tag,text,parent,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;if(parent)parent.append(n);return n;}
  function render(id){
    const root=node('lessonIntroduction'),data=window.LESSON_INTRODUCTIONS?.[id];if(!root)return;
    root.replaceChildren();root.hidden=!data;node('lessonIntro').hidden=!!data;if(!data)return;
    el('h2','Why learn this?',root).id='lessonWhyHeading';
    el('p',data.why,root,'lesson-why');el('p',data.question,root,'lesson-question');
    const detail=el('details',undefined,root);el('summary','Learning targets & textbook references',detail);
    const list=el('ul',undefined,detail,'lesson-targets');data.outcomes.forEach(text=>el('li',text,list));
    const sources=el('div',undefined,detail,'lesson-sources');
    data.sourceIds.forEach(id=>{const source=window.LESSON_INTRO_SOURCES[id];if(!source)return;const a=el('a',source.title+' ↗',sources);a.href=source.url;a.target='_blank';a.rel='noopener';});
    prose(root);
  }
  function init(){document.addEventListener('physics-topic-change',e=>render(e.detail.id));render(window.labDebug?.getState().id||'motion');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
