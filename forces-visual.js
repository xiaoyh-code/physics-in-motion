/* Lesson 4: resolve concurrent forces into X and Y parts, then combine them.
 * Progress reveals a geometric construction. It never changes a force.
 * Every mathematical label uses the shared local TeX renderer.
 */
(function (scope) {
  'use strict';
  const C=Object.freeze({bg:'#000000',ink:'#f1f4fa',muted:'#b4bfd0',grid:'#344257',axis:'#8594aa',A:'#58c4dd',B:'#f4d345',runs:['#c5b7ec','#e8a7b7','#91bcb2','#88b5ef']});
  const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const bound=(value,low,high,fallback=0)=>Math.max(low,Math.min(high,finite(value,fallback)));
  const clean=p=>({F:bound(p&&p.F,0,100,50),angle:bound(p&&p.angle,-180,180,35),B:bound(p&&p.B,0,100,30),beta:bound(p&&p.beta,-180,180,-20)});
  const trig=value=>Math.abs(value)<1e-12?0:value;
  const n=value=>Math.round(finite(value)*1000)/1000;
  const f=(value,digits=2)=>{const rounded=Math.abs(value)<.5*10**-digits?0:value;return finite(rounded).toFixed(digits).replace(/\.0+$/,'').replace(/(\.\d)0$/,'$1');};
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function analyse(params,progress=0){
    const p=clean(params),alpha=p.angle*Math.PI/180,beta=p.beta*Math.PI/180;
    const ax=p.F*trig(Math.cos(alpha)),ay=p.F*trig(Math.sin(alpha)),bx=p.B*trig(Math.cos(beta)),by=p.B*trig(Math.sin(beta));
    const sumX=ax+bx,sumY=ay+by,tolerance=1e-10*Math.max(1,p.F,p.B),zeroResultant=Math.hypot(sumX,sumY)<=tolerance;
    const rx=zeroResultant?0:sumX,ry=zeroResultant?0:sumY,R=zeroResultant?0:Math.hypot(rx,ry),theta=zeroResultant?null:Math.atan2(ry,rx)*180/Math.PI;
    return {...p,ax,ay,bx,by,rx,ry,R,theta,zeroResultant,progress:bound(progress,0,1)};
  }
  function tickStep(span){const raw=Math.max(span,1e-9)/4,power=10**Math.floor(Math.log10(raw)),fraction=raw/power;return(fraction<=1?1:fraction<=2?2:fraction<=5?5:10)*power;}
  function render(options={}){
    const duration=finite(options.duration,1),progress=bound(options.progress!==undefined?options.progress:duration>0?finite(options.time)/duration:0,0,1),r=analyse(options.params,progress),stage=Math.round(bound(options.stage,0,4));
    const compact=!!options.compact,showWorking=options.showWorking!==false,W=compact?460:900,H=showWorking?(compact?912:676):560,flags=options.flags||{},interactive=options.interactive!==false;
    const frozenCamera=options.camera&&Number.isFinite(options.camera.scale)&&options.camera.scale>0&&options.camera.origin&&Number.isFinite(options.camera.origin.x)&&Number.isFinite(options.camera.origin.y)?options.camera:null;
    const runs=(flags.ghosts===false?[]:Array.isArray(options.runs)?options.runs:[]).slice(0,4).map((run,index)=>({r:analyse(run.params),label:String(run.label||String.fromCharCode(65+index)).slice(0,20),color:C.runs[index],dash:['5 5','2 5','10 4','8 3 2 3'][index]}));
    const legendRows=runs.length?(compact?Math.ceil(runs.length/2):1):0;
    const defaultPlot=showWorking?{x:compact?66:64,y:133+24*legendRows,width:compact?330:430,height:279-24*legendRows}:{x:compact?66:64,y:(compact?110:120)+24*legendRows,width:compact?330:772,height:(compact?330:340)-24*legendRows};
    const suppliedPlot=frozenCamera&&frozenCamera.plotBounds;
    const plot=suppliedPlot&&['x','y','width','height'].every(key=>Number.isFinite(suppliedPlot[key]))&&suppliedPlot.width>0&&suppliedPlot.height>0?{...suppliedPlot}:defaultPlot;
    // All stages use the same complete construction extents. In particular, a
    // translated B lies between B and A+B, so these endpoints include its path.
    const points=[[0,0],[r.ax,r.ay],[r.bx,r.by],[r.rx,r.ry],...runs.map(run=>[run.r.rx,run.r.ry])];
    // Put the origin in the centre so a learner can drag through either axis.
    // Each direction keeps at least ten newtons of room, including at zero.
    const extentX=Math.max(10,...points.map(p=>Math.abs(p[0]))),extentY=Math.max(10,...points.map(p=>Math.abs(p[1])));
    const scale=frozenCamera?frozenCamera.scale:Math.min((plot.width-80)/(2*extentX),(plot.height-80)/(2*extentY));
    const ox=frozenCamera?frozenCamera.origin.x:plot.x+plot.width/2,oy=frozenCamera?frozenCamera.origin.y:plot.y+plot.height/2;
    const X=x=>ox+x*scale,Y=y=>oy-y*scale;
    const text=(x,y,value,size=compact?17:16,color=C.ink,anchor='start')=>`<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" style="font-family:Arial,Helvetica,sans-serif;font-size:${size}px;fill:${color}">${esc(value)}</text>`;
    const math=(x,y,tex,size=26,color=C.ink,anchor='start',width=compact?404:330)=>{
      if(scope&&scope.PhysicsVisualMath&&typeof scope.PhysicsVisualMath.svgMath==='function')return scope.PhysicsVisualMath.svgMath(x,y,tex,size,color,anchor,width);
      return `<g class="forces-math-unavailable" data-tex="${esc(tex)}"><title>${esc('Mathematical expression: '+tex)}</title></g>`;
    };
    const line=(x,y,x2,y2,color=C.axis,width=1.5,dash='',opacity=1)=>`<line x1="${n(x)}" y1="${n(y)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''} opacity="${opacity}"/>`;
    const dot=(x,y,radius=4,color=C.ink,opacity=1)=>`<circle cx="${n(x)}" cy="${n(y)}" r="${radius}" fill="${color}" opacity="${opacity}"/>`;
    const polygon=(pts,color,opacity=1)=>`<polygon points="${pts.map(p=>p.map(n).join(',')).join(' ')}" fill="${color}" opacity="${opacity}"/>`;
    const arrow=(x,y,x2,y2,color=C.ink,width=2,dash='',opacity=1)=>{
      const length=Math.hypot(x2-x,y2-y);
      if(length<.5)return dot(x,y,2.5,color,opacity);
      const angle=Math.atan2(y2-y,x2-x),head=Math.min(9,length*.36),wing=head*.5;
      return `<g opacity="${opacity}">`+line(x,y,x2,y2,color,width,dash)+polygon([[x2,y2],[x2-head*Math.cos(angle)+wing*Math.sin(angle),y2-head*Math.sin(angle)-wing*Math.cos(angle)],[x2-head*Math.cos(angle)-wing*Math.sin(angle),y2-head*Math.sin(angle)+wing*Math.cos(angle)]],color)+'</g>';
    };
    const force=(name,x,y,dx,dy,color,width=3,dash='',opacity=1)=>`<g data-force="${name}" data-start-x="${n(X(x))}" data-start-y="${n(Y(y))}" data-end-x="${n(X(x+dx))}" data-end-y="${n(Y(y+dy))}">`+arrow(X(x),Y(y),X(x+dx),Y(y+dy),color,width,dash,opacity)+'</g>';
    const projection=(x,y,color,opacity=.5)=>line(X(0),Y(0),X(x),Y(0),color,1.7,'4 5',opacity)+line(X(x),Y(0),X(x),Y(y),color,1.7,'4 5',opacity);
    const rightAngle=(x,y,color)=>{
      if(Math.abs(x*scale)<15||Math.abs(y*scale)<15)return '';
      const sx=Math.sign(x)*9,sy=-Math.sign(y)*9,px=X(x),py=Y(0);
      return `<path d="M ${n(px-sx)} ${n(py)} L ${n(px-sx)} ${n(py+sy)} L ${n(px)} ${n(py+sy)}" fill="none" stroke="${color}" stroke-width="1.5" opacity=".8"/>`;
    };
    const angleArc=(angle,color,tex)=>{
      if(Math.abs(angle)<1e-8)return '';
      const radius=Math.min(34,plot.width*.09),radians=angle*Math.PI/180,endX=ox+radius*Math.cos(radians),endY=oy-radius*Math.sin(radians);
      const path=`<path d="M ${n(ox+radius)} ${n(oy)} A ${radius} ${radius} 0 ${Math.abs(angle)>180?1:0} ${angle>=0?0:1} ${n(endX)} ${n(endY)}" fill="none" stroke="${color}" stroke-width="1.7"/>`;
      const mid=radians/2,lx=bound(ox+(radius+16)*Math.cos(mid),plot.x+22,plot.x+plot.width-22),ly=bound(oy-(radius+16)*Math.sin(mid),plot.y+25,plot.y+plot.height-12);
      return path+math(lx,ly,tex,21,color,'middle',48);
    };
    const titles=['Resolve force A','Resolve force B','Add signed components','Construct head to tail','Read the resultant'];
    let svg=`<g class="forces-visual" data-forces-stage="${stage}" data-show-working="${showWorking}" data-progress="${n(progress)}" data-scale="${scale}"><rect width="${W}" height="${H}" fill="${C.bg}"/>`;
    svg+=text(compact?24:30,33,'TWO CONCURRENT FORCES',compact?16:16,C.muted);
    svg+=text(W-(compact?24:30),33,showWorking?Math.round(progress*100)+'% constructed':'Drag A / B / R',compact?15:15,C.ink,'end');
    [['Force A',C.A],['Force B',C.B],['Resultant',C.ink]].forEach(([label,color],index)=>{const x=compact?24+index*143:30+index*172;svg+=line(x,62,x+19,62,color,3)+text(x+27,67,label,compact?16:16,color);});
    runs.forEach((run,index)=>{const lx=compact?24+(index%2)*218:30+index*211,ly=89+(compact?Math.floor(index/2)*24:0);svg+=line(lx,ly,lx+18,ly,run.color,2,run.dash)+text(lx+24,ly+5,run.label,14,run.color);});
    svg+=text(plot.x,plot.y-13,'Y-AXIS FORCE / N',compact?16:14,C.muted);
    const visibleMinX=(plot.x-ox)/scale,visibleMaxX=(plot.x+plot.width-ox)/scale,visibleMinY=(oy-plot.y-plot.height)/scale,visibleMaxY=(oy-plot.y)/scale;
    const step=tickStep(Math.max(visibleMaxX-visibleMinX,visibleMaxY-visibleMinY));
    for(let i=Math.ceil(visibleMinX/step),count=0;i*step<=visibleMaxX+1e-8&&count<16;i++,count++){
      const value=i*step;if(Math.abs(value)<step*1e-7)continue;
      svg+=line(X(value),plot.y,X(value),plot.y+plot.height,C.grid,1,'3 7',.8)+line(X(value),oy-4,X(value),oy+4,C.axis,1.3)+text(X(value),oy+21,f(value,1),compact?15:14,C.muted,'middle');
    }
    for(let i=Math.ceil(visibleMinY/step),count=0;i*step<=visibleMaxY+1e-8&&count<16;i++,count++){
      const value=i*step;if(Math.abs(value)<step*1e-7)continue;
      svg+=line(plot.x,Y(value),plot.x+plot.width,Y(value),C.grid,1,'3 7',.8)+line(ox-4,Y(value),ox+4,Y(value),C.axis,1.3)+text(ox-10,Y(value)+5,f(value,1),compact?15:14,C.muted,'end');
    }
    svg+=line(plot.x,oy,plot.x+plot.width,oy,C.axis,1.6)+line(ox,plot.y,ox,plot.y+plot.height,C.axis,1.6)+text(ox-9,oy+20,'0',compact?15:14,C.muted,'end');
    svg+=text(plot.x+plot.width,plot.y+plot.height+37,'X-AXIS FORCE / N',compact?16:14,C.muted,'end');
    // The actual three force arrows stay complete and available for direct
    // manipulation. Progress reveals only the X / Y decomposition or a
    // translated construction copy; it never moves these handles.
    if(showWorking)svg+=force('A-outline',0,0,r.ax,r.ay,C.A,2.8,'',.8)+force('B-outline',0,0,r.bx,r.by,C.B,2.8,'',.8)+force('R-outline',0,0,r.rx,r.ry,C.ink,2.4,'',.72);
    for(const run of runs)svg+=force('saved-resultant',0,0,run.r.rx,run.r.ry,run.color,2,run.dash,.76);
    if(showWorking){
    if(stage===0||stage===1){
      const first=stage===0,x=first?r.ax:r.bx,y=first?r.ay:r.by,color=first?C.A:C.B,helper=first?'#afe4ed':'#f9e9a0';
      svg+=polygon([[X(0),Y(0)],[X(x),Y(0)],[X(x),Y(y)]],color,.075)+force(first?'A':'B',0,0,x,y,color,3.5);
      if(flags.projections!==false)svg+=projection(x,y,helper,.3)+'<g opacity=".55">'+rightAngle(x,y,helper)+'</g>';
      if(flags.components!==false){const px=bound(progress*2,0,1),py=bound(progress*2-1,0,1);svg+=force('horizontal-component',0,0,x*px,0,helper,3.2,'',.5)+force('vertical-component',x,0,0,y*py,helper,3.2,'',.5);}
      if((first?r.F:r.B)>0)svg+=angleArc(first?r.angle:r.beta,color,first?String.raw`\alpha`:String.raw`\beta`);
    }else if(stage===2){
      svg+=force('A',0,0,r.ax,r.ay,C.A,2.7,'',.65)+force('B',0,0,r.bx,r.by,C.B,2.7,'',.65);
      if(flags.projections!==false)svg+=projection(r.rx,r.ry,C.ink,.65)+rightAngle(r.rx,r.ry,C.ink);
      if(flags.components!==false){
        const a=bound(progress*4,0,1),b=bound(progress*4-1,0,1),c=bound(progress*4-2,0,1),d=bound(progress*4-3,0,1);
        svg+=force('A-x',0,0,r.ax*a,0,'#afe4ed',3.2,'',.6)+force('B-x',r.ax,0,r.bx*b,0,'#f9e9a0',3.2,'',.6)+force('A-y',r.rx,0,0,r.ay*c,'#afe4ed',3.2,'',.6)+force('B-y',r.rx,r.ay,0,r.by*d,'#f9e9a0',3.2,'',.6);
      }
      svg+=dot(X(r.rx),Y(0),4,C.ink,.7)+dot(X(r.rx),Y(r.ry),4,C.ink,.7);
    }else if(stage===3){
      svg+=force('A',0,0,r.ax,r.ay,C.A,3.6)+force('B-translated-outline',r.ax,r.ay,r.bx,r.by,C.B,2,'4 5',.42)+force('R-outline',0,0,r.rx,r.ry,C.ink,2,'4 5',.5);
      if(flags.projections!==false)svg+=line(X(0),Y(0),X(r.ax),Y(r.ay),C.B,1.2,'2 6',.7)+line(X(r.bx),Y(r.by),X(r.rx),Y(r.ry),C.B,1.2,'2 6',.7);
      // This is a parallel translation of a drawing. B's length and direction
      // stay invariant, and it does not relocate a physical application point.
      const q=progress*progress*(3-2*progress);
      svg+=force('B-translating',r.ax*q,r.ay*q,r.bx,r.by,C.B,3.6)+dot(X(r.ax*q),Y(r.ay*q),3.5,C.B);
      if(progress>.65){const reveal=bound((progress-.65)/.35,0,1);svg+=force('R-reveal',0,0,r.rx*reveal,r.ry*reveal,C.ink,3.4);}
    }else{
      svg+=force('A',0,0,r.ax,r.ay,C.A,2.5,'',.55)+force('B-translated',r.ax,r.ay,r.bx,r.by,C.B,2.5,'',.55)+force('R-outline',0,0,r.rx,r.ry,C.ink,2,'4 5',.55);
      if(flags.projections!==false)svg+=projection(r.rx,r.ry,C.ink,.55)+rightAngle(r.rx,r.ry,C.ink);
      if(flags.components!==false)svg+=force('R-x',0,0,r.rx*progress,0,C.ink,2.7,'5 4',.8)+force('R-y',r.rx,0,0,r.ry*progress,C.ink,2.7,'5 4',.8);
      svg+=force('R',0,0,r.rx*progress,r.ry*progress,C.ink,4.2);
      if(!r.zeroResultant)svg+=angleArc(r.theta,C.ink,String.raw`\theta_R`);
      else svg+=dot(ox,oy,7,C.ink)+math(ox,Math.max(plot.y+28,oy-22),String.raw`F_R=0`,23,C.ink,'middle',120);
    }
    }else{
      // Quiet X / Y helpers support the draggable force picture. They remain
      // subordinate to the three actual force arrows and contain no working.
      [['A',r.ax,r.ay,'#afe4ed'],['B',r.bx,r.by,'#f9e9a0']].forEach(([name,x,y,color])=>{
        if(flags.projections!==false)svg+=projection(x,y,color,.22);
        if(flags.components!==false){
          svg+=force(name+'-x-helper',0,0,x,0,color,2,'',.28)+force(name+'-y-helper',x,0,0,y,color,2,'',.28);
          if(Math.abs(x*scale)>55)svg+=`<g opacity=".55">`+math((ox+X(x))/2,oy+(name==='A'?-14:29),`F_{${name}x}`,compact?22:21,color,'middle',64)+'</g>';
          if(Math.abs(y*scale)>55)svg+=`<g opacity=".55">`+math(X(x)+(name==='A'?16:-16),(oy+Y(y))/2,`F_{${name}y}`,compact?22:21,color,name==='A'?'start':'end',64)+'</g>';
        }
      });
      svg+=force('A-outline',0,0,r.ax,r.ay,C.A,3.6,'',1)+force('B-outline',0,0,r.bx,r.by,C.B,3.6,'',1)+force('R-outline',0,0,r.rx,r.ry,C.ink,4.2,'',1);
    }
    svg+=dot(ox,oy,4,C.ink);
    if(interactive){
      svg+='<g class="force-drag-handles" aria-label="Drag a force arrow tip">';
      [['A',r.ax,r.ay,C.A,'force A'],['B',r.bx,r.by,C.B,'force B'],['R',r.rx,r.ry,C.ink,'resultant force']].forEach(([name,x,y,color,label],index)=>{
        const cx=X(x),cy=Y(y),hit=Math.max(26,22*W/bound(options.displayWidth,180,2000,compact?286:858)),labelX=cx+(index===1?-17:17),labelY=cy+(index===2?24:-16),anchor=index===1?'end':'start';
        const keyHelp='Drag '+label+' in the X and Y directions. Use the arrow keys for one-newton steps, or Shift and arrow keys for five-newton steps.';
        svg+=`<g class="force-drag-handle" data-force-handle="${name}" data-force-x="${n(x)}" data-force-y="${n(y)}" data-handle-x="${n(cx)}" data-handle-y="${n(cy)}" tabindex="0" role="button" aria-label="${esc(keyHelp)}" style="cursor:grab;touch-action:none;outline-offset:6px">`;
        svg+=`<title>${esc('Drag '+label)}</title><circle class="force-handle-hit" cx="${n(cx)}" cy="${n(cy)}" r="${hit}" fill="transparent" pointer-events="all"/>`;
        svg+=`<circle class="force-handle-ring" cx="${n(cx)}" cy="${n(cy)}" r="${compact?9:7}" fill="#000000" stroke="${color}" stroke-width="2.5" pointer-events="none"/>`;
        svg+=dot(cx,cy,2.5,color)+`<text x="${n(labelX)}" y="${n(labelY)}" text-anchor="${anchor}" pointer-events="none" style="font-family:Arial,Helvetica,sans-serif;font-size:${compact?20:18}px;font-weight:700;fill:${color};paint-order:stroke;stroke:#000000;stroke-width:5px;stroke-linejoin:round">${name}</text></g>`;
      });
      svg+='</g>';
    }
    if(showWorking){
    const rx=compact?28:548,ry=compact?482:132,main=compact?28:27,body=compact?16:16;
    svg+=text(rx,ry,String(stage+1).padStart(2,'0')+' / '+titles[stage],compact?18:17,C.muted);
    if(stage===0||stage===1){
      const first=stage===0,letter=first?'A':'B',angle=first?'\\alpha':'\\beta',color=first?C.A:C.B,magnitude=first?r.F:r.B;
      svg+=text(rx,ry+39,'One force, two one-dimensional parts.',body,C.muted);
      svg+=math(rx,ry+88,`F_{${letter}x}=F_${letter}\\cos${angle}`,main,color);
      svg+=math(rx,ry+132,`F_{${letter}y}=F_${letter}\\sin${angle}`,main,color);
      if(magnitude===0){
        svg+=math(rx,ry+176,`F_${letter}=0\\,\\mathrm N`,main-4,color);
        svg+=text(rx,ry+211,'A zero force has no defined direction.',body,C.muted);
      }else{
        svg+=math(rx,ry+176,`F_${letter}\\approx${f(magnitude)}\\,\\mathrm N,\\quad${angle}\\approx${f(first?r.angle:r.beta)}^\\circ`,main-4,color);
        svg+=text(rx,ry+211,'Left and down give negative components.',body,C.muted);
      }
    }else if(stage===2){
      svg+=math(rx,ry+45,String.raw`F_{Rx}=\color{#58c4dd}{F_{Ax}}+\color{#f4d345}{F_{Bx}}`,main);
      svg+=math(rx,ry+89,String.raw`F_{Ry}=\color{#58c4dd}{F_{Ay}}+\color{#f4d345}{F_{By}}`,main);
      svg+=math(rx,ry+140,`F_{Rx}\\approx(${f(r.ax)})+(${f(r.bx)})`,main-4);
      svg+=math(rx,ry+181,`F_{Ry}\\approx(${f(r.ay)})+(${f(r.by)})`,main-4);
      svg+=text(rx,ry+214,'Add X parts; separately add Y parts.',body,C.muted);
    }else if(stage===3){
      svg+=math(rx,ry+46,String.raw`F_{Rx}=F_{Ax}+F_{Bx}`,main);
      svg+=math(rx,ry+91,String.raw`F_{Ry}=F_{Ay}+F_{By}`,main);
      svg+=text(rx,ry+137,'Slide a copy of the B arrow to A\'s tip.',body,C.muted);
      svg+=text(rx,ry+172,'Keep its direction and length unchanged.',body,C.muted);
      svg+=text(rx,ry+207,'The final tip gives the combined force.',body,C.muted);
    }else{
      svg+=math(rx,ry+44,String.raw`F_R=\sqrt{F_{Rx}^{\,2}+F_{Ry}^{\,2}}`,main);
      svg+=math(rx,ry+89,`F_R\\approx${f(r.R)}\\,\\mathrm N`,main+2);
      if(!r.zeroResultant){
        if(Math.abs(r.rx)<1e-8)svg+=math(rx,ry+133,String.raw`F_{Rx}=0`,main-4);
        else svg+=math(rx,ry+133,String.raw`\tan\theta_R=\frac{F_{Ry}}{F_{Rx}}`,main-4);
        svg+=math(rx,ry+176,`\\theta_R\\approx${f(r.theta)}^\\circ`,main);
        svg+=text(rx,ry+213,'Use X and Y signs to choose the direction.',body,C.muted);
      }else{
        svg+=math(rx,ry+135,String.raw`F_{Rx}=F_{Ry}=0`,main);
        svg+=math(rx,ry+178,String.raw`\theta_R\text{ is undefined}`,main-3);
        svg+=text(rx,ry+213,'A zero resultant has no direction.',body,C.muted);
      }
    }
    // Persistent signed scalar rows support an entry-level X / Y model.
    const by=compact?735:493,bx=compact?28:64,bw=compact?404:772;
    svg+=line(bx,by-20,bx+bw,by-20,C.grid,1)+text(bx,by+2,'X AND Y COMPONENTS · NEGATIVE MEANS LEFT OR DOWN',compact?13:14,C.muted);
    const columns=compact?[bx,bx+140,bx+280]:[bx,bx+270,bx+540];
    [['Force A',C.A,r.ax,r.ay,'A'],['Force B',C.B,r.bx,r.by,'B'],['Resultant',C.ink,r.rx,r.ry,'R']].forEach(([label,color,x,y,symbol],index)=>{
      const left=columns[index],width=compact?124:232;
      svg+=text(left,by+33,label,16,color)+math(left,by+71,`F_{${symbol}x}\\approx${f(x)}\\,\\mathrm N`,compact?21:25,color,'start',width)+math(left,by+109,`F_{${symbol}y}\\approx${f(y)}\\,\\mathrm N`,compact?21:25,color,'start',width);
    });
    }
    const footer=showWorking?(compact?'Construction progress only · concurrent forces':'Construction progress only · forces act concurrently at one point · equal force scales on both axes'):(compact?'Drag the arrow tips · X right positive · Y up positive':'Drag A, B or R · the faint lines show X and Y parts · X right is positive · Y up is positive');
    svg+=text(W/2,H-18,footer,compact?14:14,C.muted,'middle')+'</g>';
    const direction=r.zeroResultant?'The resultant is zero and its direction is undefined.':'The resultant direction is '+f(r.theta)+' degrees anticlockwise from positive x.';
    const ariaLabel=showWorking?'Live X and Y force construction, view '+(stage+1)+': '+titles[stage]+'. Construction '+Math.round(progress*100)+' percent; this is not physical time and does not change the forces. Force A has signed components '+f(r.ax)+' newtons horizontally and '+f(r.ay)+' newtons vertically. Force B has signed components '+f(r.bx)+' and '+f(r.by)+' newtons. The resultant has components '+f(r.rx)+' and '+f(r.ry)+' newtons, and magnitude '+f(r.R)+' newtons. '+direction+' Cyan is force A, yellow is force B, and white is their resultant. Forces are concurrent; translating a drawing does not move the application point. Both force axes share one scale. '+(interactive?'Drag the A, B or R arrow tips, or focus them and use the arrow keys.':''):'Interactive force playground. Cyan is force A, yellow is force B, and white is the resultant force. The horizontal axis is X and the vertical axis is Y, with one force scale on both axes. Pale helper lines show the separate X and Y parts. Drag A, B or R, or use the arrow keys. The forces act at one common point.';
    return {svg,viewBox:`0 0 ${W} ${H}`,ariaLabel,scale,origin:{x:ox,y:oy},plotBounds:plot,camera:{scale,origin:{x:ox,y:oy},plotBounds:{...plot}},progress};
  }
  const api=Object.freeze({render,analyse});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(scope)scope.ForcesVisualLab=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
