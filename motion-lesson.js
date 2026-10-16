/* Live visual reasoning for the opening six lessons. Forces use construction progress. */
(function () {
  'use strict';
  const motionPhases = [
    ['Motion', 'Two views, one clock', 'Play the motion or drag the time slider. The trolley and the point on the velocity–time graph always show the same instant. Change initial velocity or acceleration to see both respond.'],
    ['Gradient', 'A change in velocity becomes a gradient', String.raw`The vertical change is \(v-u\) and the horizontal interval is \(t\). Their ratio is acceleration. A straight velocity–time line means constant acceleration, including when velocity passes through zero.`],
    ['Small areas', 'A small area measures a small displacement', String.raw`Over a short time interval, \(\Delta s\approx v\,\Delta t\). Add the signed strips under the graph to obtain displacement. Area below zero contributes negatively.`],
    ['Split area', 'Two contributions to one journey', String.raw`The cyan contribution is \(ut\); the amber contribution is \(\tfrac12at^2\). Add these signed quantities to obtain displacement. Under reversal, they can overlap and cancel; distance instead adds the magnitudes of the areas above and below zero.`],
    ['Equation', 'The geometry gives the equation', String.raw`The rectangle gives \(ut\). The signed triangle gives \(\tfrac12(v-u)t=\tfrac12at^2\). Together they give \(s=ut+\tfrac12at^2\). Try another set of values: the same relationship holds while acceleration stays constant.`]
  ];
  const displacementPhases = [
    ['Position', 'A journey becomes a displacement curve', 'Play or scrub time to connect the trolley with its displacement–time curve. Displacement locates the trolley relative to its start; distance adds every part of the route, including motion before a reversal.'],
    ['Gradient', 'The tangent gives signed velocity', 'Read the instantaneous velocity from the tangent to the displacement–time curve. A downward slope means negative velocity. At a turning point the tangent is horizontal: velocity is zero, while acceleration can remain nonzero.'],
    ['Signed areas', 'Add areas with their signs', String.raw`Let \(A_+\ge0\) be the area above zero and \(A_-\le0\) the signed area below zero on the velocity–time graph. Displacement is \(s=A_++A_-\); distance is \(d=A_+-A_-\), adding both magnitudes.`],
    ['Build SUVAT', 'Build displacement from two contributions', String.raw`The cyan rectangle contributes \(ut\) and the amber triangle contributes \(\tfrac12at^2\). Their signed sum is \(s=ut+\tfrac12at^2\). These contributions can overlap and cancel during deceleration; they are not separate distances travelled.`],
    ['Eliminate time', 'Connect velocity and displacement directly', String.raw`Multiply \(s=ut+\tfrac12at^2\) by \(2a\), then add \(u^2\) to complete \((u+at)^2\). Since \(v=u+at\), this gives \(v^2=u^2+2as\) without dividing by acceleration or time. Squaring velocity removes its direction: use the motion to choose its sign.`]
  ];
  const projectilePhases = [
    ['Resolve launch', 'One launch vector, two components', String.raw`Resolve the initial velocity into \(u_x=u\cos\theta\) and \(u_y=u\sin\theta\). Cyan follows the horizontal component; amber follows the vertical component. The trajectory uses equal horizontal and vertical length scales.`],
    ['One clock', 'Two independent motions share one clock', String.raw`At the same time \(t\), horizontal motion gives \(x=u_x t\), while vertical motion gives \(y=h+u_y t-\tfrac12gt^2\). Gravity changes \(v_y\); it leaves \(v_x\) constant in this model.`],
    ['Apex', 'Zero vertical velocity does not mean zero acceleration', String.raw`At an airborne apex, \(v_y=0\), but \(a_y=-g\). The horizontal velocity remains \(v_x=u_x\). A horizontal or downward launch has its highest point at release; there is no later upward apex.`],
    ['Trajectory', 'Eliminate the shared time to build the curve', String.raw`When \(u_x\ne0\), substitute \(t=x/u_x\) into the vertical equation to obtain \(y=h+x\tan\theta-\dfrac{gx^2}{2u^2\cos^2\theta}\). A vertical launch has \(u_x=0\), so keep the time equations instead of dividing by zero.`],
    ['Range', 'Let the landing height determine the flight time', String.raw`Solve \(y(T)=0\) for the first ground contact and use \(R=u_xT\). The shortcut \(R=u^2\sin(2\theta)/g\) and equal ranges for complementary angles require equal launch and landing heights and an upward launch. At ground level, a horizontal or downward release has \(T=0\).`]
  ];
  const forcePhases = [
    ['Resolve A', 'Begin with horizontal and vertical directions', String.raw`Right is positive on the \(x\)-axis; up is positive on the \(y\)-axis. Drag A's tip to see its two signed parts: \(F_{Ax}=F_A\cos\alpha\) and \(F_{Ay}=F_A\sin\alpha\). A negative part means left or down. Both parts together replace the original force.`],
    ['Resolve B', 'Split the second force along the same axes', String.raw`Drag B's tip. Its horizontal part is \(F_{Bx}=F_B\cos\beta\); its vertical part is \(F_{By}=F_B\sin\beta\). Read each as a one-dimensional force. Measure both angles anticlockwise from the positive \(x\)-axis, keeping the component signs.`],
    ['Add components', 'Do one signed sum on each axis', String.raw`Horizontally, \(F_{Rx}=F_{Ax}+F_{Bx}\). Vertically, \(F_{Ry}=F_{Ay}+F_{By}\). Treat these as two separate one-dimensional calculations. Opposite signs cancel. The totals locate the resultant tip on the same force scale.`],
    ['Head to tail', 'The arrows explain the same two sums', String.raw`Slide a drawn copy of B to A's tip without turning or resizing it. The resultant joins the original start to the final tip. Dragging the resultant while keeping A fixed finds \(F_{Bx}=F_{Rx}-F_{Ax}\) and \(F_{By}=F_{Ry}-F_{Ay}\). Keeping B fixed finds A instead; the resultant alone cannot determine both forces uniquely.`],
    ['Resultant', 'Find the strength and direction of one combined force', String.raw`Use \(F_R=\sqrt{F_{Rx}^{\,2}+F_{Ry}^{\,2}}\). When \(F_{Rx}\ne0\), \(\tan\theta_R=F_{Ry}/F_{Rx}\); use the signs to choose the correct quadrant. A zero horizontal total gives a vertical force; a zero vertical total gives a horizontal force. When both totals are zero, the resultant has no direction. An equal force in the opposite direction would balance the two original forces.`]
  ];
  const terminalPhases = [
    ['Observe fall','A falling object meets the air','Start from rest and follow the fall. Weight acts downward. Air resistance acts upward and grows as the object moves faster.'],
    ['Compare forces','Compare the two arrow lengths','A larger downward weight gives a downward resultant and increasing downward speed. Balanced forces give no acceleration, while the object can keep falling.'],
    ['Speed graph','A flatter curve means less acceleration','The gradient shows how quickly the downward speed changes. A nearly level part means nearly constant speed; it does not mean the skydiver has stopped.'],
    ['Canopy opens','The parachute grows while the skydiver falls','Opening increases the area meeting the air. If drag becomes greater than weight, the resultant is upward, so the downward-moving skydiver slows. Once fully open, slowing reduces drag toward balance.'],
    ['Terminal speed','Balance is possible at a lower speed',String.raw`At terminal speed, \(F_D=W\) and \(a=0\). Weight and air resistance both remain present. The open canopy allows this balance at a lower downward speed.`]
  ];
  const collisionPhases = [
    ['Observe','Follow two cars along one track','Watch the approach, contact and motion afterwards. The cars only meet if the gap closes within the displayed time. Right is positive; left is negative.'],
    ['Velocities','One direction convention before and after',String.raw`Use signed velocities: \(u_1,u_2\) before contact and \(v_1,v_2\) afterwards. The arrows share one scale. A reversal changes the sign, while sticking makes the two final velocities equal.`],
    ['Signed momenta','Mass turns each velocity into momentum',String.raw`For each car, \(p=mv\). The before and current bars share one signed scale. Leftward momentum is negative; opposite contributions cancel in the total.`],
    ['Transfer','An exchange within one system',String.raw`The two cars exert equal and opposite forces over the same contact time. Their impulses are opposite, so \(\Delta p_1=-\Delta p_2\). The animation idealises contact as instantaneous; the bars compare the resulting momentum changes.`],
    ['Conservation','The pair keeps the same total momentum',String.raw`With negligible external impulse, \(m_1u_1+m_2u_2=m_1v_1+m_2v_2\). For sticking, \(v_1=v_2=v\), giving \(v=(m_1u_1+m_2u_2)/(m_1+m_2)\). Momentum conservation alone does not require kinetic energy conservation.`]
  ];
  const phasesByTopic = { motion: motionPhases, displacement: displacementPhases, projectile: projectilePhases, vectors: forcePhases, newton: terminalPhases, momentum: collisionPhases };
  const presetsByTopic = {
    motion: [['Trolley example', { u: 2, a: 1.5 }, 4, 3], ['Reverse direction', { u: -4, a: 2 }, 6, 3], ['Constant velocity', { u: 3, a: 0 }, 4, 4]],
    displacement: [['Reversing trolley', { u: 4, a: -1 }, 6, 2], ['At the turning point', { u: 4, a: -1 }, 4, 1], ['No acceleration', { u: 3, a: 0 }, 4, 4]],
    projectile: [['Elevated launch', {u:20,theta:45,h:1.5,g:9.81}, state=>state.duration*.55, 1], ['At the apex', {u:20,theta:45,h:0,g:9.81}, state=>state.params.u*Math.sin(state.params.theta*Math.PI/180)/state.params.g, 2], ['Equal-height range', {u:20,theta:30,h:0,g:9.81}, state=>state.duration, 4]],
    newton: [['Without a parachute', {m:75,body:2,canopy:1,open:20,deploy:0}, 30, 1], ['During opening', {m:75,body:2,canopy:1,open:20,deploy:1}, 21.5, 3], ['Later balance', {m:75,body:2,canopy:1,open:20,deploy:1}, 40, 4]],
    momentum: [['Stick together', {m1:2,m2:2,u1:4,u2:0,e:0}, 3, 4], ['Opposite momenta', {m1:2,m2:2,u1:4,u2:-4,e:0}, 2, 2], ['Catch up & bounce', {m1:2,m2:2,u1:6,u2:2,e:1}, 3, 1]],
    vectors: [['Perpendicular forces', {F:6,angle:0,B:8,beta:90}, 1, 4], ['Opposite forces', {F:50,angle:35,B:50,beta:-145}, 1, 4], ['Third quadrant', {F:6,angle:180,B:8,beta:-90}, 1, 4]]
  };
  const stages = { motion: 0, displacement: 0, projectile: 0, vectors: 0, newton: 0, momentum: 0 };
  let currentId = 'motion', phases = motionPhases, stage = 0, root, caption, stageTitle, explanation, instruction, buttons = [], presetButtons = [];
  const get = id => document.getElementById(id);
  function element(tag, text, parent, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    if (parent) parent.append(node);
    return node;
  }
  function refreshText() {
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(stage === index)));
    stageTitle.textContent = phases[stage][1];
    explanation.textContent = phases[stage][2];
    prose(explanation);
  }
  function selectStage(next, animate = true) {
    stage = Math.max(0, Math.min(phases.length - 1, next));
    stages[currentId] = stage;
    refreshText();
    if (window.labDebug?.getState().id !== currentId) return;
    const at = window.labDebug.getState().time;
    window.labDebug.setTime(at);
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) get('scene').animate([{ opacity: .55 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
  }
  function syncTopic() {
    const id = window.labDebug?.getState().id, active = !!phasesByTopic[id];
    root.hidden = caption.hidden = !active;
    get('liveLab').classList.toggle('motion-live-lab', active);
    get('liveLab').querySelector('.experiment .panel-top h2').textContent = id === 'momentum' ? 'Watch two cars exchange momentum' : id === 'newton' ? 'Watch the fall. Explain the changing forces.' : id === 'vectors' ? 'Build the resultant from two forces' : id === 'projectile' ? 'Build a projectile from two motions' : id === 'displacement' ? 'From displacement to SUVAT' : active ? 'An equation you can explore' : 'Experiment';
    if (active) {
      currentId = id; phases = phasesByTopic[id]; stage = stages[id];
      instruction.textContent = id === 'newton' ? 'Choose an idea to investigate. Every view follows the same fall, parameter settings and time. No drag-force formula is required.' : id === 'vectors' ? 'Start with X and Y directions, then explore how two one-dimensional sums give the combined force. Drag A, B or R in any view. Play or scrub the construction to reveal each step; progress is not physical time.' : 'Choose a view. Play, pause or scrub time; every shape follows the parameters you set.';
      buttons.forEach((button,index) => button.lastElementChild.textContent = phases[index][0]);
      presetButtons.forEach((button,index) => button.textContent = presetsByTopic[id][index][0]);
      refreshText();
    }
    window.ForceInteraction?.onUpdate();
    window.TerminalLesson?.onUpdate();
    window.CollisionLesson?.onUpdate();
  }
  function init() {
    const scene = get('scene'); if (!scene) return;
    root = element('div', undefined, undefined, 'motion-lesson-tools'); root.id = 'motionLessonTools';
    scene.before(root);
    if(get('forceDirectTools'))root.after(get('forceDirectTools'));
    if(get('terminalObservationTools'))root.after(get('terminalObservationTools'));
    if(get('collisionObservationTools'))root.after(get('collisionObservationTools'));
    instruction = element('p', '', root, 'motion-lesson-instruction');
    const group = element('div', undefined, root, 'motion-views'); group.setAttribute('role', 'group'); group.setAttribute('aria-label', 'Visual reasoning views');
    buttons = phases.map(([label], index) => {
      const button = element('button', undefined, group); button.type = 'button';
      element('span', String(index + 1).padStart(2, '0'), button, 'motion-view-number');
      element('span', label, button);
      button.setAttribute('aria-controls', 'scene motionStageCaption');
      button.onclick = () => selectStage(index);
      button.onkeydown = event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % phases.length;
        if (event.key === 'ArrowLeft') next = (index + phases.length - 1) % phases.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = phases.length - 1;
        if (next !== undefined) { event.preventDefault(); selectStage(next); buttons[next].focus(); }
      };
      return button;
    });
    const presets = element('div', undefined, root, 'motion-presets');
    element('span', 'Try a case', presets, 'motion-preset-label');
    presetsByTopic.motion.forEach(([label],index) => {
      const button = element('button', label, presets); button.type = 'button';
      presetButtons.push(button);
      button.onclick = () => { const [,values,at,phase] = presetsByTopic[currentId][index]; stage = phase; stages[currentId] = stage; refreshText(); window.labDebug.setParams(values); window.labDebug.setTime(typeof at==='function'?at(window.labDebug.getState()):at); };
    });
    caption = element('div', undefined, undefined, 'motion-stage-caption'); caption.id = 'motionStageCaption'; caption.setAttribute('aria-live', 'polite');
    stageTitle = element('h3', '', caption); explanation = element('p', '', caption);
    scene.after(caption);
    window.MotionLesson = Object.freeze({ getStage: id => stages[id || window.labDebug?.getState().id] || 0, selectStage });
    document.addEventListener('physics-topic-change', syncTopic);
    syncTopic();
    if (phasesByTopic[window.labDebug?.getState().id]) window.labDebug.setTime(window.labDebug.getState().time);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
