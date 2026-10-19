/* Small, deterministic circuit models shared by the homepage and topic experiments. */
const LessonExperiments=(()=>{
 const fmt=n=>Number(n.toFixed(3)).toString(),rad=x=>x*Math.PI/180;
 const specs={
  ohm:{title:'How much current will flow?',action:'Keep the voltage fixed and double the resistance. What happens to the current?',controls:[['v','Battery voltage',1,12,1,6,'V'],['r','Resistance',1,12,1,3,'Ω']],notice:'An ideal DC voltage source and an ohmic resistor. The arrow is the positive reference direction.'},
  kcl:{title:'Follow a current as it splits',action:'Increase the lower branch resistance. Predict which branch will carry more current.',controls:[['r','Lower branch resistance',1,12,1,6,'Ω'],['v','Supply voltage',1,12,1,6,'V']],notice:'Two parallel resistor branches: the upper branch is fixed at 3 Ω. Both have the same voltage.'},
  thevenin:{title:'What changes when you connect a load?',action:'Increase the load resistance. Watch the load voltage rise while its current falls.',controls:[['r','Load resistance',1,20,1,4,'Ω'],['v','Open-circuit voltage',2,20,1,12,'V']],notice:'A Thévenin source with a fixed 2 Ω internal resistance. The voltmeter would draw no current in the open-circuit limit.'},
  waves:{title:'Build a sine wave',action:'Change the phase first, then the RMS voltage. Notice which change shifts the wave and which makes it taller.',controls:[['v','RMS voltage',1,12,1,6,'V'],['phase','Phase',-180,180,15,0,'°'],['time','Time within a cycle',0,1,.005,0,'cycles']],notice:'One cycle is shown. Peak = √2 × RMS for this sinusoid. The horizontal position is time divided by the period.'},
  phasors:{title:'Watch the angle become a time shift',action:'Move the current phase above and below the voltage phase. Predict when current leads.',controls:[['phase','Current phase',-180,180,15,-60,'°'],['time','Time within a cycle',0,1,.005,0,'cycles']],notice:'Voltage phase is 0°. Both waveforms are normalized to their own peaks; their heights do not compare volts with amperes.'},
  inductor:{title:'Why does higher frequency reduce current?',action:'Double the angular frequency. Compare the RMS current, then move through one cycle.',controls:[['omega','Angular frequency',50,500,50,100,'rad/s'],['time','Time within a cycle',0,1,.005,0,'cycles']],notice:'Ideal L = 0.2 H with 10 V RMS applied. The normalized current lags voltage by 90° in sinusoidal steady state.'},
  capacitor:{title:'Why does higher frequency increase current?',action:'Double the angular frequency. Compare the RMS current, then move through one cycle.',controls:[['omega','Angular frequency',50,500,50,100,'rad/s'],['time','Time within a cycle',0,1,.005,0,'cycles']],notice:'Ideal C = 100 μF with 10 V RMS applied. The normalized current leads voltage by 90° in sinusoidal steady state.'},
  series:{title:'Add impedances as vectors',action:'Move reactance from negative to positive. Find the point where current and voltage are in phase.',controls:[['r','Resistance',1,12,1,3,'Ω'],['x','Net reactance',-12,12,1,-4,'Ω']],notice:'Z = R + jX at one frequency; X is inductive reactance minus capacitive reactance. The supply is 10 V RMS.'},
  power:{title:'Separate consumed and returned energy',action:'Move the phase difference toward 90°. Apparent power stays fixed; what happens to active power?',controls:[['phase','Voltage − current phase',-90,90,5,45,'°'],['s','Apparent power',5,100,5,50,'VA']],notice:'A passive sinusoidal load. Q is positive for an inductive load and negative for a capacitive load.'}
 };
 function model(id,p){
  switch(id){
   case 'ohm':return {current:p.v/p.r,voltage:p.v,power:p.v*p.v/p.r};
   case 'kcl':return {upper:p.v/3,lower:p.v/p.r,total:p.v/3+p.v/p.r};
   case 'thevenin':return {current:p.v/(2+p.r),voltage:p.v*p.r/(2+p.r)};
   case 'waves':return {peak:p.v*Math.SQRT2,instant:p.v*Math.SQRT2*Math.sin(2*Math.PI*p.time+rad(p.phase)),phase:p.phase};
   case 'phasors':return {phase:p.phase,voltage:Math.sin(2*Math.PI*p.time),current:Math.sin(2*Math.PI*p.time+rad(p.phase))};
   case 'inductor':return {reactance:p.omega*.2,current:10/(p.omega*.2),phase:-90};
   case 'capacitor':return {reactance:1/(p.omega*.0001),current:10*p.omega*.0001,phase:90};
   case 'series':return {magnitude:Math.hypot(p.r,p.x),angle:Math.atan2(p.x,p.r)*180/Math.PI,current:10/Math.hypot(p.r,p.x)};
   case 'power':return {p:p.s*Math.cos(rad(p.phase)),q:p.s*Math.sin(rad(p.phase)),s:p.s};
  }
 }
 const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${s}</text>`;
 const wire=d=>`<path d="${d}" fill="none" stroke="#526b70" stroke-width="2.5"/>`;
 function circuit(p,result,kind='ohm'){
  const parallel=kind==='kcl',thevenin=kind==='thevenin';
  const resistor=(x,y,w,h,label,lx,ly)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white" stroke="#68419a" stroke-width="2.5"/>${text(lx,ly,label,'text-anchor="middle"')}`;
  const dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="4" fill="#526b70"/>`;
  const arrow=(x,y,label)=>`${wire(`M${x} ${y}h45 m-8 -7l8 7 -8 7`)}${text(x+22,y-13,label,'text-anchor="middle"')}`;
  // Wires end at resistor terminals: no hidden short through the load.
  let picture=wire('M80 80H190 M80 80V132 M80 188V260H420');
  picture+=`<circle cx="80" cy="160" r="28" fill="white" stroke="#68419a" stroke-width="2.5"/>${text(80,155,'+','text-anchor="middle"')}${text(80,177,'−','text-anchor="middle"')}${text(80,45,`${p.v} V`,'text-anchor="middle"')}`;
  picture+=resistor(190,65,110,30,thevenin?'2 Ω':parallel?'3 Ω':`${p.r} Ω`,245,53);
  picture+=wire(thevenin?'M300 80H420V135 M420 210V260':'M300 80H420V260');
  if(thevenin)picture+=resistor(405,135,30,75,`${p.r} Ω`,485,180);
  if(parallel)picture+=wire('M140 80V190H190 M300 190H360V80')+resistor(190,175,110,30,`${p.r} Ω`,245,235)+dot(140,80)+dot(360,80)+arrow(200,145,`${fmt(result.lower)} A`);
  picture+=arrow(320,55,`${fmt(parallel?result.upper:result.current)} A`);
  return picture;
 }
 function phasorPicture(p){
  const angle=2*Math.PI*p.time,shift=rad(p.phase),cx=115,cy=150,r=72;
  const endpoint=a=>[cx+r*Math.cos(a),cy-r*Math.sin(a)];
  const [vx,vy]=endpoint(angle),[ix,iy]=endpoint(angle+shift);
  const path=offset=>Array.from({length:121},(_,i)=>`${i?'L':'M'}${280+230*i/120},${150-65*Math.sin(2*Math.PI*i/120+offset)}`).join(' ');
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#d7e3de"/>${wire('M30 150H210 M115 65V235 M275 150H515')}<path d="M${cx} ${cy}L${vx} ${vy}" stroke="#198069" stroke-width="3"/><circle cx="${vx}" cy="${vy}" r="5" fill="#198069"/><path d="M${cx} ${cy}L${ix} ${iy}" stroke="#68419a" stroke-width="3" stroke-dasharray="7 4"/><circle cx="${ix}" cy="${iy}" r="5" fill="#68419a"/><path d="${path(0)}" fill="none" stroke="#198069" stroke-width="3"/><path d="${path(shift)}" fill="none" stroke="#68419a" stroke-width="3" stroke-dasharray="7 4"/><path d="M${280+230*p.time} 65V235" stroke="#8d98a6" stroke-dasharray="4 4"/>${text(35,35,'Voltage — solid')}${text(290,35,'Current — dashed')}${text(35,275,'Rotating phasors')}${text(285,275,'One complete cycle')}`;
 }
 function wave(id,p,result){
  const phase=result.phase||0,time=p.time||0,single=id==='waves';
  const path=(offset,amp=1)=>Array.from({length:161},(_,i)=>`${i?'L':'M'}${40+i*2.875},${150-70*amp*Math.sin(2*Math.PI*i/160+rad(offset))}`).join(' ');
  const amplitude=single?p.v/12:1;
  return `${wire('M40 50V245 M40 150H500')}<path d="${path(single?phase:0,amplitude)}" fill="none" stroke="#198069" stroke-width="3"/>${single?'':`<path d="${path(phase)}" fill="none" stroke="#68419a" stroke-width="3" stroke-dasharray="7 4"/>`}<path d="M${40+460*time} 55V245" stroke="#8d98a6" stroke-dasharray="4 4"/>${text(40,30,single?'Voltage (fixed vertical scale)':'Voltage — solid')}${single?'':text(290,30,'Current — dashed')}${text(40,273,'0')}${text(455,273,'1 cycle')}${wire('M35 80H45 M35 220H45')}${text(48,75,single?'16.97 V':'1')}${text(48,240,single?'−16.97 V':'−1')}`;
 }
 function vectors(id,p,result){
  const x=id==='series'?p.r:result.p,y=id==='series'?p.x:result.q;
  // A fixed scale lets a parameter change change the vector, not the axes.
  const scale=id==='series'?8:1.05,endX=115+x*scale,endY=155-y*scale;
  return `${wire('M70 155H280 M115 285V25')}<path d="M115 155H${endX}V${endY}Z" fill="#f3eef9" stroke="#68419a" stroke-width="2.5"/><circle cx="${endX}" cy="${endY}" r="5" fill="#198069"/>${text(290,100,id==='series'?`R = ${fmt(x)} Ω`:`P = ${fmt(x)} W`)}${text(290,155,id==='series'?`X = ${fmt(y)} Ω`:`Q = ${fmt(y)} var`)}${text(290,210,id==='series'?`|Z| = ${fmt(result.magnitude)} Ω`:`S = ${fmt(result.s)} VA`)}${text(125,30,id==='series'?'+jX':'+Q')}${text(250,180,id==='series'?'R':'P')}${text(75,180,'0')}`;
 }
 function resultText(id,p,r){switch(id){
  case 'ohm':return `I = ${p.v} / ${p.r} = ${fmt(r.current)} A. Power = ${fmt(r.power)} W.`;
  case 'kcl':return `${fmt(r.total)} A enters; ${fmt(r.upper)} A + ${fmt(r.lower)} A leaves. Charge is conserved.`;
  case 'thevenin':return `Load current = ${fmt(r.current)} A. Load voltage = ${fmt(r.voltage)} V, below the ${p.v} V open-circuit value.`;
  case 'waves':return `Peak = ${fmt(r.peak)} V. At ${(p.time*100).toFixed(0)}% of a cycle, u = ${fmt(r.instant)} V.`;
  case 'phasors':return p.phase===0?'Voltage and current are in phase.':`Current ${p.phase>0?'leads':'lags'} voltage by ${Math.abs(p.phase)}°. At ±180°, the waves are in opposition.`;
  case 'inductor':case 'capacitor':return `Reactance = ${fmt(r.reactance)} Ω; RMS current = ${fmt(r.current)} A. Current ${id==='inductor'?'lags':'leads'} voltage by 90°.`;
  case 'series':return `|Z| = ${fmt(r.magnitude)} Ω; I = ${fmt(r.current)} A RMS. Current ${r.angle>0?'lags':r.angle<0?'leads':'is in phase with'} voltage${r.angle?` by ${fmt(Math.abs(r.angle))}°`:''}.`;
  case 'power':return `P = ${fmt(r.p)} W; Q = ${fmt(r.q)} var; S = ${r.s} VA. Power factor = ${fmt(Math.cos(rad(p.phase)))}.`;
 }}
 function svg(id,p){const r=model(id,p);return id==='phasors'?phasorPicture(p):['ohm','kcl','thevenin'].includes(id)?circuit(p,r,id):['series','power'].includes(id)?vectors(id,p,r):wave(id,p,r);}
 // Measure alternative narration at the current width. Disclosures remain free to grow.
 function reserveText(element,alternatives){
  let width=0;
  const measure=()=>{if(!element.isConnected||!element.clientWidth)return;width=element.clientWidth;
   const probe=element.cloneNode(false);probe.removeAttribute('id');probe.removeAttribute('aria-live');probe.removeAttribute('role');probe.setAttribute('aria-hidden','true');Object.assign(probe.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',width:width+'px',minHeight:'0',height:'auto'});element.after(probe);
   let height=0;for(const value of alternatives){probe.textContent=value;height=Math.max(height,probe.getBoundingClientRect().height);}probe.remove();element.style.minHeight=Math.ceil(height)+'px';
  };
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(element.clientWidth!==width)measure();}):null;observer?.observe(element);measure();document.fonts?.ready.then(measure);
  return ()=>observer?.disconnect();
 }
 function mount(root,id,previous={},onChange=()=>{}){
  const spec=specs[id];if(!spec)return;
  const values={};for(const [key,,min,max,step,initial] of spec.controls){const n=Number(previous[key]);values[key]=Number.isFinite(n)&&n>=min&&n<=max?min+Math.round((n-min)/step)*step:initial;}
  const timed='time' in values;
  root.classList.add('inline-experiment');root.innerHTML=`<span class="try-label">Try it yourself</span><h3>${spec.title}</h3><p>${spec.action}</p><div class="experiment-figure" tabindex="0" role="region" aria-label="${spec.title}: diagram"><svg class="experiment-picture" viewBox="0 0 560 320" role="img" aria-label="${spec.title}"></svg></div><div class="experiment-controls">${spec.controls.map(([key,label,min,max,step,,unit])=>`<label><span>${label}<output data-value="${key}"></output></span><input type="range" data-control="${key}" aria-label="${label}" min="${min}" max="${max}" step="${step}" value="${values[key]}"></label>`).join('')}</div>${timed?'<div class="experiment-playback" aria-label="Cycle playback"><button type="button" data-play>Play cycle</button><button type="button" data-step="-1">← Previous</button><button type="button" data-step="1">Next →</button><button type="button" data-replay>Replay</button></div><p class="playback-status" role="status">Paused. Step through the cycle or press Play.</p>':''}<p class="experiment-result" aria-live="polite"></p><details class="experiment-assumptions"><summary>How to read this model</summary><p class="experiment-note">${spec.notice}</p></details>`;
  const result=root.querySelector('.experiment-result'),plot=root.querySelector('svg');
  let frame=null,last=null,playing=false,offscreen=false,destroyed=false;
  function update(){const r=model(id,values);plot.innerHTML=svg(id,values);plot.setAttribute('aria-label',spec.title+'. '+resultText(id,values,r));for(const [key,,,,,,unit] of spec.controls){root.querySelector(`[data-value="${key}"]`).textContent=`${fmt(values[key])} ${unit}`;root.querySelector(`[data-control="${key}"]`).value=values[key];}result.textContent=resultText(id,values,r);}
  function change(){update();onChange({...values});}
  function pause(){playing=false;last=null;if(frame!==null)cancelAnimationFrame(frame);frame=null;result.setAttribute('aria-live','polite');if(timed){root.querySelector('[data-play]').textContent='Play cycle';root.querySelector('.playback-status').textContent=values.time===1?'Cycle complete. Replay or step back.':'Paused. Each step moves one eighth of a cycle.';} }
  function tick(now){if(!playing||destroyed||document.hidden||!root.isConnected||offscreen){pause();return;}if(last!==null){values.time=Math.min(1,values.time+(now-last)/6000);change();}last=now;if(values.time>=1){pause();return;}frame=requestAnimationFrame(tick);}
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  function play(){if(motion.matches){pause();root.querySelector('.playback-status').textContent='Reduced motion is on. Use Previous, Next or the time slider.';return;}if(document.hidden||offscreen||destroyed)return;if(values.time>=1)values.time=0;playing=true;last=null;result.setAttribute('aria-live','off');root.querySelector('[data-play]').textContent='Pause';root.querySelector('.playback-status').textContent='Playing one cycle in six seconds.';frame=requestAnimationFrame(tick);}
  root.querySelectorAll('input').forEach(input=>input.oninput=()=>{pause();values[input.dataset.control]=Number(input.value);change();});
  if(timed){root.querySelector('[data-play]').onclick=()=>playing?pause():play();root.querySelectorAll('[data-step]').forEach(button=>button.onclick=()=>{pause();values.time=Math.max(0,Math.min(1,Math.round(values.time*8)/8+Number(button.dataset.step)/8));change();});root.querySelector('[data-replay]').onclick=()=>{pause();values.time=0;change();play();};}
  const visibility=()=>{if(document.hidden)pause();},reduce=e=>{if(e.matches)pause();},disclosure=e=>{if(e.target.open)pause();};
  document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',reduce);const article=root.closest('article')||root;article.addEventListener('toggle',disclosure,true);
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{offscreen=!entries[0].isIntersecting;if(offscreen)pause();}):null;observer?.observe(root);
  update();
  let variants=[{...values}];for(const [key,,min,max,step,initial] of spec.controls)variants=variants.flatMap(p=>[min,max,initial,Math.min(max,min+step)].map(n=>({...p,[key]:n})));
  const release=reserveText(result,variants.map(p=>resultText(id,p,model(id,p))));
  return {pause,destroy(){destroyed=true;pause();release();observer?.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',reduce);article.removeEventListener('toggle',disclosure,true);}};
 }
 return {specs,model,svg,mount,fmt,reserveText};
})();
