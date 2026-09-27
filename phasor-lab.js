const PhasorMath=(()=>{
  const polar=(rms,phase)=>({rms,phase,real:rms*Math.cos(phase*Math.PI/180),imag:rms*Math.sin(phase*Math.PI/180),peak:rms*Math.sqrt(2)});
  const rectangular=(a,b)=>({...polar(Math.hypot(a,b),Math.atan2(b,a)*180/Math.PI),real:a,imag:b});
  const sample=(z,cycles)=>z.peak*Math.sin(2*Math.PI*cycles+z.phase*Math.PI/180);
  const difference=(a,b)=>((a-b+180)%360+360)%360-180;
  return {polar,rectangular,sample,difference};
})();
(()=>{
  if(typeof document==='undefined')return;
  const $=id=>document.getElementById(id),esc=Circuits.draw.esc,fmt=x=>Number(x.toFixed(3)).toString(),colors=['#316c50','#af6c22','#665b99'];
  let q;try{q=ExercisePlaygrounds.read(location.search)||PracticeModels.build('h2-10');if(!['h2-10','h2-11'].includes(q.id))throw Error('Choose an AC exercise.');}catch(e){$('ac-status').textContent=e.message;return;}
  const p=q.params,pair=q.id==='h2-10';
  $('back').href=$('exercise-back').href=ExercisePlaygrounds.back(q);$('exercise-back').textContent=`Homework ${q.set} · ${q.ref} · ${q.title}`;$('exercise-context').textContent=q.random?`Random practice · Seed ${q.seed}`:'Official homework';
  const input=(id,label,value,min=-1e6,max=1e6)=>`<label>${label}<input id="${id}" type="number" step="any" min="${min}" max="${max}" value="${value}" required></label>`;
  function reset(){
    $('inputs').innerHTML=`<fieldset><legend>Frequency</legend>${input('frequency','f / Hz',p.f,1e-6,1e6)}</fieldset>`+(pair?`<fieldset><legend>i₁</legend>${input('rms1','RMS / A',p.rms1,0)}${input('phase1','Phase / °',p.ph1,-3600,3600)}</fieldset><fieldset><legend>i₂</legend>${input('peak2','Peak / A',p.peak2,0)}${input('phase2','Phase / °',p.ph2,-3600,3600)}</fieldset>`:[['1','u₁',p.z1,'V'],['i','i',p.zi,'A'],['2','u₂',p.z2,'V']].map(([id,label,z,unit])=>`<fieldset><legend>${label} · RMS phasor</legend>${input('real'+id,'Real / '+unit,z[0])}${input('imag'+id,'Imaginary / '+unit,z[1])}</fieldset>`).join(''));
    $('time').value=0;render();
  }
  const value=id=>Number($(id).value);
  function diagrams(items,f,cycles,title){
    const max=Math.max(1e-9,...items.map(z=>z.rms)),scale=160/max,peak=max*Math.sqrt(2),t=cycles/f;
    let ph=`<line x1="30" y1="225" x2="420" y2="225" stroke="#bbcbb0"/><line x1="225" y1="30" x2="225" y2="420" stroke="#bbcbb0"/><text x="390" y="249">Re</text><text x="235" y="28">Im</text><circle cx="225" cy="225" r="160" fill="none" stroke="#e3e9dc" stroke-dasharray="5 5"/>`;
    let wave=`<line x1="60" y1="195" x2="660" y2="195" stroke="#bbcbb0"/><line x1="60" y1="45" x2="60" y2="345" stroke="#bbcbb0"/><text x="60" y="385">0</text><text x="337" y="385">T/2</text><text x="630" y="385">T</text><text x="60" y="25">${fmt(peak)} ${items[0].unit} peak</text>`;
    items.forEach((z,i)=>{
      const c=colors[z.color],theta=z.phase*Math.PI/180+2*Math.PI*cycles,x=225+scale*z.rms*Math.cos(theta),y=225-scale*z.rms*Math.sin(theta);
      const tx=225+scale*z.real,ty=225-scale*z.imag;
      ph+=`<line x1="225" y1="225" x2="${tx}" y2="${ty}" stroke="${c}" stroke-dasharray="5 5" opacity=".4"/><g role="button" tabindex="0" data-focus="${z.focus}" aria-label="Edit ${z.name}">${Circuits.draw.vector(225,225,x,y,c,3)}<circle cx="${x}" cy="${y}" r="9" fill="${c}" fill-opacity=".12"/><line x1="${x}" y1="${y}" x2="225" y2="${y}" stroke="${c}" stroke-dasharray="4 5"/></g>`;
      let d='';for(let k=0;k<=240;k++){const a=k/240;d+=(k?'L':'M')+(60+600*a).toFixed(2)+' '+(195-140*PhasorMath.sample(z,a)/peak).toFixed(2);}
      wave+=`<path d="${d}" fill="none" stroke="${c}" stroke-width="3"/><circle cx="${60+600*cycles}" cy="${195-140*PhasorMath.sample(z,cycles)/peak}" r="6" fill="${c}"/>`;
    });
    wave+=`<line x1="${60+600*cycles}" y1="40" x2="${60+600*cycles}" y2="350" stroke="#73886a" stroke-dasharray="4 5"/>`;
    return `<section class="ac-card"><h2>${title}</h2><ul class="ac-legend">${items.map(z=>`<li><button data-focus="${z.focus}" style="color:${colors[z.color]}">${z.name}</button>${fmt(z.rms)} ∠ ${fmt(z.phase)}° ${z.unit} RMS<br><span class="instant">${z.name}(${fmt(t*1000)} ms) = ${fmt(PhasorMath.sample(z,cycles))} ${z.unit}</span></li>`).join('')}</ul><div class="ac-plots"><div class="plot-scroll"><svg viewBox="0 0 450 450" role="img" aria-label="${esc(title)} rotating RMS phasors">${ph}<text x="30" y="448">Outer circle: ${fmt(max)} ${items[0].unit} RMS</text></svg></div><div class="plot-scroll"><svg class="wave" viewBox="0 0 700 420" role="img" aria-label="${esc(title)} sine waveforms over one period">${wave}</svg></div></div><div class="ac-equations">${items.map(z=>`${z.name}(t) = ${fmt(z.peak)} sin(${fmt(2*Math.PI*f)}t ${z.phase<0?'−':'+'} ${fmt(Math.abs(z.phase))}°) ${z.unit} · RMS = ${fmt(z.rms)} ${z.unit}`).join('<br>')}</div></section>`;
  }
  function render(){
    if([...$('inputs').querySelectorAll('input')].some(el=>!el.checkValidity()||!Number.isFinite(Number(el.value)))){$('ac-status').textContent='Enter valid numbers. Frequency must be positive; RMS and peak must be nonnegative. Diagrams retain the last valid values.';return;}
    $('ac-status').textContent='';const f=value('frequency'),cycles=value('time');$('time-label').textContent=`${fmt(cycles/f*1000)} ms · T = ${fmt(1000/f)} ms`;
    if(pair){
      const items=[{...PhasorMath.polar(value('rms1'),value('phase1')),name:'i₁',unit:'A',color:0,focus:'rms1'},{...PhasorMath.polar(value('peak2')/Math.sqrt(2),value('phase2')),name:'i₂',unit:'A',color:1,focus:'peak2'}];
      $('ac-diagrams').innerHTML=diagrams(items,f,cycles,'Compare the currents');const d=PhasorMath.difference(items[0].phase,items[1].phase);
      $('comparison').textContent=items.some(z=>z.rms===0)?'A zero-amplitude signal has no defined phase.':Math.abs(d)<1e-9?'i₁ and i₂ are in phase.':Math.abs(d)===180?'i₁ and i₂ are 180° apart.':`i₁ ${d>0?'leads':'lags'} i₂ by ${fmt(Math.abs(d))}° (modulo 360°).`;
    }else{
      $('ac-diagrams').innerHTML=[['1','u₁','V'],['i','i','A'],['2','u₂','V']].map(([id,name,unit],i)=>diagrams([{...PhasorMath.rectangular(value('real'+id),value('imag'+id)),name,unit,color:i,focus:'real'+id}],f,cycles,name)).join('');
      $('comparison').textContent='Voltages and current use separate scales. For a zero phasor, the waveform is zero and phase is undefined (displayed as 0°).';
    }
  }
  $('inputs').addEventListener('input',render);$('time').addEventListener('input',render);$('reset').onclick=reset;
  $('ac-diagrams').addEventListener('click',e=>{const el=e.target.closest('[data-focus]');if(el)$(el.dataset.focus).focus();});
  $('ac-diagrams').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const el=e.target.closest('[data-focus]');if(el){e.preventDefault();$(el.dataset.focus).focus();}}});
  reset();
})();
