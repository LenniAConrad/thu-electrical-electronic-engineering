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
  return `${wire('M80 80H170 M80 80V132 M80 188V240H410V80H290')}<circle cx="80" cy="160" r="28" fill="white" stroke="#68419a" stroke-width="2.5"/>${text(80,155,'+','text-anchor="middle"')}${text(80,177,'−','text-anchor="middle"')}${text(80,45,`${p.v} V`,'text-anchor="middle"')}<rect x="170" y="65" width="120" height="30" fill="#f3eef9" stroke="#68419a" stroke-width="2"/>${text(230,53,thevenin?'2 Ω':parallel?'3 Ω':`${p.r} Ω`,'text-anchor="middle"')}${thevenin?`<rect x="395" y="140" width="30" height="70" fill="#edf6f4" stroke="#198069" stroke-width="2"/>${text(450,180,`${p.r} Ω`)}`:''}${parallel?`${wire('M130 80V175H175 M285 175H350V80')}<rect x="175" y="160" width="110" height="30" fill="#edf6f4" stroke="#198069" stroke-width="2"/>${text(230,210,`${p.r} Ω`,'text-anchor="middle"')}${text(230,132,`${fmt(result.upper)} A`,'text-anchor="middle"')}`:''}${wire('M320 55H370 M362 48L370 55L362 62')}${text(345,38,`${fmt(parallel?result.upper:result.current)} A`,'text-anchor="middle"')}${text(245,280,parallel?`At the junction: ${fmt(result.total)} A = ${fmt(result.upper)} A + ${fmt(result.lower)} A`:thevenin?`Load voltage: ${fmt(result.voltage)} V`:'Voltage drives current through the resistance.','text-anchor="middle"')}`;
 }
 function phasorPicture(p){
  const angle=2*Math.PI*p.time,shift=rad(p.phase),cx=115,cy=150,r=72;
  const endpoint=a=>[cx+r*Math.cos(a),cy-r*Math.sin(a)];
  const [vx,vy]=endpoint(angle),[ix,iy]=endpoint(angle+shift);
  const path=offset=>Array.from({length:121},(_,i)=>`${i?'L':'M'}${280+230*i/120},${150-65*Math.sin(2*Math.PI*i/120+offset)}`).join(' ');
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#d7e3de"/>${wire('M30 150H210 M115 65V235 M275 150H515')}<path d="M${cx} ${cy}L${vx} ${vy}" stroke="#198069" stroke-width="3"/><circle cx="${vx}" cy="${vy}" r="5" fill="#198069"/><path d="M${cx} ${cy}L${ix} ${iy}" stroke="#68419a" stroke-width="3"/><circle cx="${ix}" cy="${iy}" r="5" fill="#68419a"/><path d="${path(0)}" fill="none" stroke="#198069" stroke-width="3"/><path d="${path(shift)}" fill="none" stroke="#68419a" stroke-width="3"/><path d="M${280+230*p.time} 65V235" stroke="#8d98a6" stroke-dasharray="4 4"/>${text(35,35,'Voltage · teal')}${text(290,35,'Current · purple')}${text(35,275,'Rotating phasors')}${text(285,275,'One complete cycle')}`;
 }
 function wave(id,p,result){
  const phase=result.phase||0,time=p.time||0,single=id==='waves';
  const path=(offset,amp=1)=>Array.from({length:161},(_,i)=>`${i?'L':'M'}${40+i*2.875},${150-70*amp*Math.sin(2*Math.PI*i/160+rad(offset))}`).join(' ');
  const amplitude=single?p.v/12:1;
  return `${wire('M40 50V245 M40 150H500')}<path d="${path(single?phase:0,amplitude)}" fill="none" stroke="#198069" stroke-width="3"/>${single?'':`<path d="${path(phase)}" fill="none" stroke="#68419a" stroke-width="3"/>`}<path d="M${40+460*time} 55V245" stroke="#8d98a6" stroke-dasharray="4 4"/>${text(40,30,single?'Voltage (fixed vertical scale)':'Voltage · teal')}${single?'':text(290,30,'Current · purple')}${text(40,273,'0')}${text(455,273,'1 cycle')}${text(45,70,single?'16.97 V':'1')}${text(45,235,single?'−16.97 V':'−1')}`;
 }
 function vectors(id,p,result){
  const x=id==='series'?p.r:result.p,y=id==='series'?p.x:result.q,scale=155/Math.max(1,Math.abs(x),Math.abs(y)),endX=100+x*scale,endY=155-y*scale;
  return `${wire('M65 155H470 M100 275V35')}<path d="M100 155H${endX}V${endY}Z" fill="#f3eef9" stroke="#68419a" stroke-width="2.5"/><circle cx="${endX}" cy="${endY}" r="5" fill="#198069"/>${text(270,135,id==='series'?`R = ${fmt(x)} Ω`:`P = ${fmt(x)} W`)}${text(270,175,id==='series'?`X = ${fmt(y)} Ω`:`Q = ${fmt(y)} var`)}${text(100,305,id==='series'?`|Z| = ${fmt(result.magnitude)} Ω`:`S = ${fmt(result.s)} VA`)}`;
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
 function mount(root,id,previous={},onChange=()=>{}){
  const spec=specs[id];if(!spec)return;
  const values={};for(const [key,,min,max,,initial] of spec.controls){const n=Number(previous[key]);values[key]=Number.isFinite(n)&&n>=min&&n<=max?n:initial;}
  root.classList.add('inline-experiment');root.innerHTML=`<span class="try-label">Try it yourself</span><h3>${spec.title}</h3><p>${spec.action}</p><svg class="experiment-picture" viewBox="0 0 560 320" role="img" aria-label="${spec.title}"></svg><div class="experiment-controls">${spec.controls.map(([key,label,min,max,step,,unit])=>`<label><span>${label}<output data-value="${key}"></output></span><input type="range" data-control="${key}" aria-label="${label}" min="${min}" max="${max}" step="${step}" value="${values[key]}"></label>`).join('')}</div><p class="experiment-result" aria-live="polite"></p><p class="experiment-note">${spec.notice}</p>`;
  function update(){const r=model(id,values);root.querySelector('svg').innerHTML=svg(id,values);root.querySelector('svg').setAttribute('aria-label',spec.title+'. '+resultText(id,values,r));for(const [key,,,,,,unit] of spec.controls)root.querySelector(`[data-value="${key}"]`).textContent=`${fmt(values[key])} ${unit}`;root.querySelector('.experiment-result').textContent=resultText(id,values,r);}
  root.querySelectorAll('input').forEach(input=>input.oninput=()=>{values[input.dataset.control]=Number(input.value);update();onChange({...values});});update();
 }
 return {specs,model,svg,mount,fmt};
})();
