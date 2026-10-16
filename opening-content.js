/* Original guided investigations and exam-style practice; not official Pearson questions.
   Load after content.js. This file adds content without replacing existing lessons. */
(function () {
'use strict';
const S = String.raw;
const step = (tex, explanation) => ({tex, explanation});
const part = (prompt, marks, answer, points, numeric=null, unit='') => ({prompt, marks, answer, points, numeric, unit});
window.OPENING_GUIDES = {
 motion: {
  question:'If initial velocity stays fixed, what changes when you increase acceleration?',
  prompt:'1. Keep the current run. 2. Increase only acceleration. 3. Compare velocity at the same time. Is the line steeper? The shaded area shows displacement.',
  answer:'Greater acceleration makes the velocity line steeper. After the same time, velocity is greater. Area below the time axis counts negatively for displacement, but positively for distance.',
  tex:S`\Delta v=(\Delta a)t,\qquad \Delta s=\tfrac12(\Delta a)t^2`
 },
 displacement: {
  question:'Can position decrease while acceleration is positive?',
  prompt:'1. Choose negative initial velocity and positive acceleration so the object turns during the run. 2. Watch it move left, stop briefly, then move right. 3. Keep the run and change initial velocity. Does it turn earlier or later?',
  answer:'Yes. Negative velocity means moving left. Positive acceleration slows that leftward motion, then makes the object move right. At the turn, velocity is zero but acceleration is still positive.',
  tex:S`v=\frac{ds}{dt}=u+at,\qquad t_{\rm turn}=-\frac{u}{a}\quad(a\ne0)`
 },
 projectile: {
  question:'If launch speed stays fixed, does a steeper launch always travel further horizontally?',
  prompt:S`1. Launch upwards from ground level and keep the run. 2. Keep speed fixed and change only the angle; compare ranges. Try \(30^\circ\) and \(60^\circ\). 3. Pause at the highest point. Which velocity arrow is zero?`,
  answer:S`No. With equal launch and landing heights, \(45^\circ\) gives the greatest range; \(30^\circ\) and \(60^\circ\) give the same range. At the highest point of an oblique launch, \(v_y=0\), while \(v_x=u\cos\theta\) remains positive and \(a_y=-g\). A raised launch needs its actual height in the flight-time calculation.`,
  tex:S`v_x=u\cos\theta,\quad v_y=u\sin\theta-gt,\quad R=\frac{u^2\sin2\theta}{g}\ \text{(equal heights)}`
 },
 vectors: {
  question:'How can two ordinary one-dimensional calculations tell us where the resultant arrow points?',
  prompt:S`1. Start with the axes: right and up are positive; left and down are negative. Drag A's tip and read its horizontal and vertical components. 2. Drag B's tip and add the two horizontal values, then the two vertical values. 3. Drag the resultant tip while keeping one original force fixed; watch the other force adjust. Compare equal opposite forces. Scrub construction progress to reveal the explanation; this progress is not physical time.`,
  answer:S`The horizontal total \(F_{Rx}=F_{Ax}+F_{Bx}\) tells you how far left or right the resultant tip lies; the vertical total \(F_{Ry}=F_{Ay}+F_{By}\) tells you how far down or up it lies. Each is a one-dimensional signed sum, measured on the same force scale. Opposing components cancel. If both totals are zero, \(F_R=0\) and there is no direction. To work backwards from a resultant, keep one original force fixed: otherwise many different pairs of forces could give the same resultant. Components replace their original force rather than adding extra forces.`,
  tex:S`F_{Rx}=F_{Ax}+F_{Bx},\qquad F_{Ry}=F_{Ay}+F_{By},\qquad F_R=\sqrt{F_{Rx}^{\,2}+F_{Ry}^{\,2}}`
 },
 newton: {
  question:'How can a parachutist keep falling when the force arrows are balanced?',
  prompt:'1. Play from release and watch weight and upward drag. 2. Pause near the first flat part of the velocity–time graph: is the object stationary? 3. Scrub across parachute opening: watch the canopy grow while the person keeps falling, and compare the force arrows. 4. Change the parachute area or opening time, keep the run, and compare. Observe first; open the explanation only when you are ready.',
  answer:S`Weight stays constant while drag changes with speed and effective area. If \(F_D<W\), the downward speed increases. If \(F_D=W\), acceleration is zero and the object can keep falling steadily. As a parachute opens, its growing area raises drag at the current speed; when \(F_D>W\), the object slows while still moving down. Once fully open, drag decreases as the person slows, towards a new balance and a lower terminal speed. If the parachute opens very early, drag may still be below weight at first.`,
  tex:S`F_{\rm net}=W-F_D,\qquad F_{\rm net}=ma,\qquad F_D=W\ \Rightarrow\ a=0`
 },
 momentum: {
  question:'If two cars stick together, what decides their shared direction and speed?',
  prompt:S`1. Play the default run and scrub across contact. The cars change velocity together when they couple. 2. Keep the run, increase only the mass of stationary car B, and compare the joined cars' motion. 3. Give B a leftward initial velocity and predict whether the pair will move right, left or stop. Take right as positive. 4. Open the explanation to compare each signed momentum and their total before and after contact. The cars only collide if A catches B within the displayed time.`,
  answer:S`The initial total signed momentum determines the shared motion after a sticking collision. A heavier stationary B gives a smaller common speed for the same moving A. Opposite initial momenta can cancel partly or completely: zero total momentum means the joined cars stop. During contact, one car's momentum change is the negative of the other's, so the total stays constant when external impulse is negligible. Momentum conservation does not mean each car keeps its velocity, or that kinetic energy must stay constant.`,
  tex:S`m_1u_1+m_2u_2=(m_1+m_2)v,\qquad v=\frac{m_1u_1+m_2u_2}{m_1+m_2}`
 }
};
window.LESSON_CONTENT.projectile = {
 derivation:[
  step(S`u_x=u\cos\theta,\qquad u_y=u\sin\theta`,'Resolve launch velocity into independent horizontal and vertical components; take upward as positive.'),
  step(S`a_x=0,\quad a_y=-g,\qquad v_x=u\cos\theta,\quad v_y=u\sin\theta-gt`,'Gravity changes vertical velocity but does not change horizontal velocity in the no-drag model.'),
  step(S`x=u\cos\theta\,t,\qquad y=h+u\sin\theta\,t-\tfrac12gt^2`,S`Measure \(x\) from the launch position and \(y\) above the horizontal landing surface.`),
  step(S`u_x\ne0:\quad t=\frac{x}{u_x},\qquad y=h+x\tan\theta-\frac{gx^2}{2u^2\cos^2\theta}`,S`Eliminate the shared time to obtain the parabolic trajectory. For a vertical launch, \(u_x=0\), so this division is invalid: keep \(x(t)=0\) and the time equation for \(y(t)\).`),
  step(S`h=0:\quad 0=t\left(u\sin\theta-\tfrac12gt\right)`,S`For equal launch and landing heights, set \(y=0\). The root \(t=0\) is the launch instant. A later contact requires an upward launch component, \(u\sin\theta>0\).`),
  step(S`h=0,\quad u\sin\theta>0:\qquad T=\frac{2u\sin\theta}{g},\quad R=\frac{u^2\sin2\theta}{g}`,S`Use the later root and \(R=u\cos\theta\,T\), then apply \(\sin2\theta=2\sin\theta\cos\theta\). The range formula assumes equal launch and landing heights.`),
  step(S`h\ge0:\quad T=\frac{u\sin\theta+\sqrt{u^2\sin^2\theta+2gh}}{g},\qquad R=u\cos\theta\,T`,S`Solve the vertical quadratic for the nonnegative first-contact time. When \(h>0\), this root is positive. When \(h=0\) and \(u\sin\theta\le0\), contact occurs immediately: \(T=0\). No bounce or post-impact motion is modelled.`)
 ],
 assumptions:S`Point particle, constant \(g>0\) and negligible air resistance; a horizontal landing surface at \(y=0\); launch speed \(u>0\), launch height \(h\ge0\) and \(-90^\circ\le\theta\le90^\circ\), measured from the rightward horizontal with positive angles upwards. Equal-height flight-time and range expressions require \(h=0\) and \(u\sin\theta>0\). The displayed path ends at the first ground impact; no bounce is modelled.`,
 checkpoint:{question:S`At the highest point of a projectile launched at \(0^\circ<\theta<90^\circ\), with no air resistance:`,options:['Both velocity components and acceleration are zero','Only vertical velocity is zero; horizontal velocity remains and acceleration is downward','Acceleration is horizontal'],correct:1,explanation:S`Gravity acts throughout flight. At the apex, \(v_y=0\), but \(v_x=u\cos\theta>0\) and \(a_y=-g\). Zero vertical velocity does not mean zero acceleration.`},
 exam:{context:S`A ball is launched from level ground at \(20.0\,\mathrm{m\,s^{-1}}\), at \(30.0^\circ\) above the horizontal. It lands on the same level. Neglect air resistance and use \(g=9.81\,\mathrm{m\,s^{-2}}\). These are original exam-style questions, not an official Pearson paper.`,parts:[
  part('Calculate the initial horizontal and vertical velocity components.',3,S`Horizontal: \(u_x=17.3\,\mathrm{m\,s^{-1}}\); vertical: \(u_y=+10.0\,\mathrm{m\,s^{-1}}\).`, [S`Resolve using \(u_x=u\cos\theta\) and \(u_y=u\sin\theta\).`,S`Obtain \(u_x=20\cos30^\circ=17.3205\ldots\,\mathrm{m\,s^{-1}}\).`,S`Obtain \(u_y=20\sin30^\circ=+10.0\,\mathrm{m\,s^{-1}}\).`]),
  part(S`Show that the nonzero flight time is \(T=2u\sin\theta/g\), and hence derive \(R=u^2\sin2\theta/g\).`,4,S`At landing, \(0=u\sin\theta\,T-\tfrac12gT^2\). Taking the nonzero root gives \(T=2u\sin\theta/g\). Horizontal displacement is \(R=u\cos\theta\,T\), giving \(R=u^2\sin2\theta/g\).`,['Write vertical displacement zero with upward-positive signs.',S`Factor and select the nonzero root \(T=2u\sin\theta/g\).`,S`Use constant horizontal velocity to write \(R=u\cos\theta\,T\).`,S`Substitute and use \(\sin2\theta=2\sin\theta\cos\theta\).`]),
  part('Calculate the horizontal range.',2,S`\(35.3\,\mathrm{m}\)`,[S`Substitute \(R=\frac{20.0^2\sin60.0^\circ}{9.81}\).`,S`Obtain \(35.3119\ldots\,\mathrm{m}\), or \(35.3\,\mathrm{m}\) to three significant figures.`],400*Math.sin(Math.PI/3)/9.81,'m'),
  part('State the horizontal velocity, vertical velocity and acceleration at the apex. Explain why the acceleration is not zero.',3,S`\(v_x=17.3\,\mathrm{m\,s^{-1}}\), \(v_y=0\) and \(a_y=-9.81\,\mathrm{m\,s^{-2}}\). The acceleration is vertically downwards because gravity still acts.`, [S`Horizontal velocity remains \(17.3\,\mathrm{m\,s^{-1}}\) because horizontal force is zero.`,'Vertical velocity is instantaneously zero at the apex.',S`Gravity still acts, so acceleration remains \(9.81\,\mathrm{m\,s^{-2}}\) downwards.`]),
  part('The same ball is instead launched from a platform above the landing level. Explain why the equal-height range formula is no longer valid and describe how to calculate the new range.',3,S`The vertical displacement at landing is \(-h\). Solve \(0=h+u\sin\theta\,T-\tfrac12gT^2\) for the positive landing time, then use \(R=u\cos\theta\,T\).`,['Recognise that vertical displacement is no longer zero.','Include launch height in the vertical quadratic and choose the positive landing time.','Multiply flight time by the unchanged horizontal velocity.'])
 ]}
};
})();
