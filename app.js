(() => {
  'use strict';
  const $=id=>document.getElementById(id),esc=Circuits.draw.esc;
  const storageKey='circuit-pirate-eet-hw1-hw2-v1';
  let store={records:{},last:'h1-1'},canSave=true;
  try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved&&saved.records&&typeof saved.records==='object')store=saved;}catch{canSave=false;}
  store.seeds ||= {};store.randomRecords ||= {};store.working ||= 'steps';
  let current,mode='official',stepIndex=0,started=Date.now(),finished=false,results={},activeFields=[],showGiven=false;
  const freshSeed=()=>{const a=new Uint32Array(1);if(window.crypto?.getRandomValues)crypto.getRandomValues(a);else a[0]=Date.now()+Math.random()*1e7;return a[0]||1;};
  function seedFor(id){return store.seeds[id]||(store.seeds[id]=freshSeed());}
  function path(id=current?.id||'homework',m=mode,seed=null){if(id==='homework')return m==='random'?'random/homework':'homework';return m==='random'?`random/${id}/${seed??seedFor(id)}`:id;}
  function record(){const pool=mode==='official'?store.records:store.randomRecords,key=mode==='official'?current.id:current.id+':'+current.seed;const r=pool[key]||(pool[key]={draft:{},attempts:0,solved:false,assisted:false});r.draft ||= {};r.stepsPassed ||= {};return r;}
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(store));}catch{canSave=false;}$('save-status').textContent=canSave?'Progress saved on this browser':'Progress lasts for this session';}
  function go(id,m=mode,seed=null){const target=path(id,m,seed);if(location.hash.slice(1)===target)render(target);else location.hash=target;}
  const fmt=PracticeModels.fmt;
  const answerText=f=>f.type==='choice'?f.options.find(o=>o[0]===String(f.answer))[1]:typeof f.answer==='number'?fmt(f.answer)+(f.unit?' '+f.unit:''):f.answer;
  function activeStep(){return store.working==='steps'?current.steps[stepIndex]:null;}
  function courseNavigation(){
    $('homework-select').innerHTML='<option value="">All homework</option>'+Course.sets().map(h=>`<option value="${h.id}" ${h.questions.length?'':'disabled'}>${h.title}${h.questions.length?'':' · Not added yet'}</option>`).join('');
    $('homework-select').value=current?String(current.set):'';
    document.querySelectorAll('[data-mode]').forEach(b=>{const yes=b.dataset.mode===mode;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',yes);});
    $('total-progress').textContent=mode==='official'?`${Questions.filter(q=>store.records[q.id]?.solved).length} / ${Questions.length} solved`:`${Object.values(store.randomRecords).filter(r=>r.solved).length} drills solved`;
  }
  function overview(){
    current=null;finished=true;$('exercise-page').hidden=true;$('homework-overview').hidden=false;
    $('exercise-nav').hidden=true;document.querySelector('.nav-heading').hidden=true;$('shuffle').hidden=true;
    document.title=Course.title;courseNavigation();
    $('overview-mode').textContent=mode==='official'?'Official homework':'Random practice';
    $('homework-grid').innerHTML=Course.sets().map(h=>{
      if(!h.questions.length)return `<article class="homework-card unavailable"><span class="homework-number">${String(h.id).padStart(2,'0')}</span><h3>${h.title}</h3><p>Not added yet</p></article>`;
      const solved=h.questions.filter(q=>(mode==='official'?store.records[q.id]:store.randomRecords[q.id+':'+seedFor(q.id)])?.solved).length;
      return `<a class="homework-card" href="#${path(h.questions[0].id)}"><span class="homework-number">${String(h.id).padStart(2,'0')}</span><h3>${h.title}</h3><p>${esc(h.topic)}</p><div class="homework-card-footer"><span>${h.questions.length} exercises · ${solved} solved</span><span aria-hidden="true">→</span></div></a>`;
    }).join('');save();window.scrollTo({top:0,behavior:'instant'});
  }
  function navigation(){
    const items=Questions.filter(q=>q.set===current.set),state=q=>mode==='official'?store.records[q.id]:store.randomRecords[q.id+':'+seedFor(q.id)],done=items.filter(q=>state(q)?.solved).length;
    $('exercise-nav').innerHTML=items.map(q=>{const r=state(q);return `<a class="nav-item ${q.id===current.id?'active':''}" href="#${path(q.id)}" ${q.id===current.id?'aria-current="page"':''}><span class="nav-number">${q.ref}</span><span class="nav-label">${esc(q.title)}</span><span class="nav-status ${r?.solved?'done':''}" aria-label="${r?.solved?'Solved':r?.assisted?'Solution viewed':'Not solved'}">${r?.solved?'✓':r?.assisted?'◐':'○'}</span></a>`;}).join('');
    courseNavigation();
    document.querySelectorAll('[data-working]').forEach(b=>{const yes=b.dataset.working===store.working;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',yes);});
    $('set-name').textContent=Course.sets().find(h=>h.id===current.set)?.topic||'Exercises';$('set-progress').textContent=`${done} / ${items.length}`;
    $('total-progress').textContent=mode==='official'?`${Questions.filter(q=>store.records[q.id]?.solved).length} / ${Questions.length} solved`:`${Object.values(store.randomRecords).filter(r=>r.solved).length} drills solved`;
    $('progress-fill').style.width=`${done/items.length*100}%`;
    $('step-nav').hidden=store.working!=='steps';
    $('step-nav').innerHTML=current.steps.map((s,i)=>`<button data-step="${i}" class="${i===stepIndex?'active':''} ${record().stepsPassed[i]?'passed':''}" ${i===stepIndex?'aria-current="step"':''}><span>${record().stepsPassed[i]?'✓':i+1}</span>${esc(s.title)}</button>`).join('');
  }
  function fields(){
    const draft=record().draft;
    $('fields').innerHTML=activeFields.map(f=>{
      const v=draft[f.key]??'',id='answer-'+f.key,help=id+'-message',group=f.group?`<h3 class="group-heading">${esc(f.group)}</h3>`:'';
      if(f.type==='choice'&&f.options.every(o=>o[1].length<36)&&f.options.length<=4)return group+`<fieldset class="field" data-key="${f.key}"><legend>${esc(f.label)}</legend><div class="choices">${f.options.map(o=>`<label class="choice"><input type="radio" name="${f.key}" value="${esc(o[0])}" ${v===o[0]?'checked':''} aria-describedby="${help}"><span>${esc(o[1])}</span></label>`).join('')}</div><div class="field-message" id="${help}"></div></fieldset>`;
      const input=f.type==='choice'?`<select name="${f.key}" id="${id}" aria-describedby="${help}"><option value="">Choose an answer</option>${f.options.map(o=>`<option value="${esc(o[0])}" ${v===o[0]?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`:`<div class="input-wrap"><input type="text" name="${f.key}" id="${id}" autocomplete="off" spellcheck="false" value="${esc(v)}" aria-describedby="${help}" placeholder="${f.type==='equation'?'Enter an equation':f.type==='expression'?'Enter an expression':'Your answer'}">${f.unit?`<span class="unit" aria-hidden="true">${esc(f.unit)}</span>`:''}</div>`;
      return group+`<div class="field ${['equation','expression'].includes(f.type)?'equation-field':''}" data-key="${f.key}"><label for="${id}">${esc(f.label)}${f.unit?`<span class="sr-only"> in ${esc(f.unit)}</span>`:''}</label>${input}<div class="field-message" id="${help}"></div></div>`;
    }).join('');
  }
  function draw(){
    $('diagram').innerHTML=showGiven?'<div class="circuit-canvas">'+current.diagram()+'</div>':StepVisuals.render(current,activeStep(),record().draft,results);
    $('diagram').hidden=!$('diagram').innerHTML;
    // Diagram controls carry the same values as the answer form.
    if($('diagram-dialog').open)$('large-diagram').innerHTML=showGiven?'<div class="circuit-canvas">'+current.diagram()+'</div>':StepVisuals.render(current,activeStep(),record().draft,results);
    highlightTarget(document.activeElement?.dataset.linked||document.activeElement?.name||'');
  }
  function liveText(){
    $('extra').innerHTML=current.extra||'';
    if(current.waveforms){
      const v=record().draft,num=k=>{try{return Checker.evaluate(v[k]||'')}catch{return NaN}};
      const rows=store.working==='steps'?[['u₁','1'],['i','i'],['u₂','2']][stepIndex]:null;
      $('extra').innerHTML+=(rows?[rows]:[['u₁','1'],['i','i'],['u₂','2']]).map(([label,suffix])=>{const a=num('a'+suffix),w=num('w'+suffix),p=num('p'+suffix);return `<div class="wave-row">${label}(t) = ${Number.isFinite(a)?fmt(a):'□'} sin(${Number.isFinite(w)?fmt(w):'□'}t ${p<0?'−':'+'} ${Number.isFinite(p)?fmt(Math.abs(p)):'□'}°)</div>`;}).join('');
    }
  }
  function showStep(index,scroll=false){
    stepIndex=Math.max(0,Math.min(index,current.steps.length-1));record().stepIndex=stepIndex;finished=false;results={};showGiven=false;
    const step=activeStep();activeFields=step?step.fields:current.fields;
    $('given-circuit').hidden=!step||step.scene==='original';$('given-circuit').textContent='Given circuit';
    $('step-title').textContent=step?step.title:'Circuit';$('step-prompt').textContent=step?.prompt||'';
    $('step-prompt').hidden=!$('step-prompt').textContent;
    $('answer-heading').textContent=step?'Step '+(stepIndex+1)+' · Your answers':'Your answers';
    const symbolic=activeFields.some(f=>['equation','expression'].includes(f.type));
    $('answer-instructions').textContent=symbolic?(step?.prompt||current.instructions||'Use I1… I5, R1… R5, E1… E3, VA and VB. Enter each equation with =.'):'Enter answers on the diagram or below. Fractions, pi and sqrt(2) are accepted.';
    $('feedback').textContent='';$('feedback').className='';$('solution').hidden=true;$('solution').innerHTML='';$('reveal').textContent='Show solution';
    $('check').innerHTML='Check '+(step?'step':'answers')+' <span>↵</span>';
    fields();draw();liveText();navigation();save();
    if(scroll)$('step-nav').scrollIntoView({block:'start',behavior:'smooth'});
  }
  function render(route){
    const parts=String(route||'').split('/');mode=parts[0]==='random'?'random':'official';
    if(!route||route==='homework'||route==='random/homework'){overview();return;}
    $('exercise-page').hidden=false;$('homework-overview').hidden=true;$('exercise-nav').hidden=false;document.querySelector('.nav-heading').hidden=false;$('shuffle').hidden=false;
    const id=mode==='random'?parts[1]:parts[0],valid=Questions.some(q=>q.id===id)?id:Questions[0].id;
    const seed=mode==='random'?(Number(parts[2])>>>0||seedFor(valid)):null;
    if(mode==='random')store.seeds[valid]=seed;
    current=PracticeModels.build(valid,seed);store.last=path(valid,mode,seed);started=Date.now();
    $('eyebrow').textContent=`${mode==='random'?'RANDOM PRACTICE':'OFFICIAL HOMEWORK'} · HW ${String(current.set).padStart(2,'0')} · EXERCISE ${current.ref}`;
    $('title').textContent=current.title;document.title=current.title+' · THU EEE';
    const items=Questions.filter(q=>q.set===current.set);$('position').textContent=`${items.indexOf(items.find(q=>q.id===valid))+1} / ${items.length}`;
    $('topic').textContent=current.topic;$('statement').innerHTML=`<p>${current.statement}</p>`;
    $('source-note').innerHTML=current.note?`<div class="notice">${current.note}</div>`:'';
    $('new-numbers').hidden=mode!=='random';showFormulas(false);$('formula-reference').open=false;
    $('diagram-caption').textContent=current.caption||'';
    $('previous').disabled=Questions.findIndex(q=>q.id===valid)===0;
    $('next').textContent=Questions.findIndex(q=>q.id===valid)===Questions.length-1?'Back to start ↻':'Next exercise →';
    $('timer').textContent='0:00';showStep(record().stepIndex||0);
    window.scrollTo({top:0,behavior:'instant'});
  }
  function showFormulas(all){
    $('formulas').innerHTML=Formulas.render(current.id,all);
    document.querySelectorAll('[data-formula-scope]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.formulaScope==='all')===all)));
  }
  document.querySelectorAll('[data-formula-scope]').forEach(b=>b.addEventListener('click',()=>showFormulas(b.dataset.formulaScope==='all')));
  function values(){const data=new FormData($('answer-form'));return Object.fromEntries(activeFields.map(f=>[f.key,String(data.get(f.key)||'')]))}
  function edited(key,value,fromDiagram=false){
    const r=record();r.draft[key]=value;
    current.steps.forEach((s,i)=>{if(s.fields.some(f=>f.key===key))delete r.stepsPassed[i];});
    finished=false;delete results[key];
    const row=$('fields').querySelector(`[data-key="${key}"]`);
    if(row){row.classList.remove('good','bad');row.querySelector('.field-message').textContent='';row.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));}
    if(fromDiagram){const input=$('fields').querySelector(`[name="${key}"]`);if(input)input.value=value;}
    document.querySelectorAll(`[data-linked="${key}"]`).forEach(input=>{if(input!==document.activeElement)input.value=value;input.closest('.diagram-answer').classList.remove('correct','incorrect');});
    $('check').innerHTML='Check '+(activeStep()?'step':'answers')+' <span>↵</span>';$('feedback').textContent='';
    // Keep the focused diagram input mounted while typing; redraw it on blur.
    if(!fromDiagram)draw();liveText();save();
  }
  $('answer-form').addEventListener('input',e=>{if(e.target.name)edited(e.target.name,e.target.value);});
  function highlightTarget(key){document.querySelectorAll('[data-target]').forEach(el=>el.classList.toggle('active',el.dataset.target===key));}
  document.addEventListener('focusin',e=>highlightTarget(e.target.dataset.linked||e.target.name||''));
  document.addEventListener('focusout',()=>highlightTarget(''));
  function diagramInput(e){if(e.target.dataset.linked)edited(e.target.dataset.linked,e.target.value,true);}
  for(const container of [$('diagram'),$('large-diagram')]){
    container.addEventListener('input',diagramInput);
    container.addEventListener('keydown',e=>{if(e.target.dataset.linked&&e.key==='Enter'){e.preventDefault();if($('diagram-dialog').open)$('diagram-dialog').close();$('answer-form').requestSubmit();}});
    container.addEventListener('focusout',e=>{if(e.target.dataset.linked){liveText();}});
  }
  function next(){const i=Questions.findIndex(q=>q.id===current.id);go(Questions[(i+1)%Questions.length].id);}
  function advance(){
    if(activeStep()){
      if(stepIndex<current.steps.length-1){showStep(stepIndex+1,true);return;}
      const missing=current.steps.findIndex((s,i)=>!record().stepsPassed[i]);if(missing>=0){showStep(missing,true);return;}
    }
    if(mode==='random')newNumbers();else next();
  }
  function newNumbers(){
    const old=JSON.stringify(current.params);let seed=freshSeed();
    for(let i=0;i<20&&JSON.stringify(PracticeModels.build(current.id,seed).params)===old;i++)seed=freshSeed();
    go(current.id,'random',seed);
  }
  $('answer-form').addEventListener('submit',e=>{
    e.preventDefault();if(finished){advance();return;}
    const v=values(),r=record();Object.assign(r.draft,v);r.attempts++;
    const list=activeFields.map(f=>{const result=Checker.check(f,v[f.key]);results[f.key]=result;return result;});
    list.forEach((result,i)=>{const f=activeFields[i],row=$('fields').querySelector(`[data-key="${f.key}"]`);row.classList.toggle('good',result.ok);row.classList.toggle('bad',!result.ok);row.querySelector('.field-message').textContent=result.message;row.querySelectorAll('input,select').forEach(el=>el.setAttribute('aria-invalid',!result.ok));});
    const correct=list.filter(r=>r.ok).length;
    if(correct===list.length){
      if(activeStep())r.stepsPassed[stepIndex]=true;
      const complete=!activeStep()||current.steps.every((s,i)=>r.stepsPassed[i]);
      if(complete&&!r.revealedThisAttempt){r.solved=true;r.bestSeconds=Math.min(r.bestSeconds||Infinity,Math.max(1,Math.round((Date.now()-started)/1000)));}
      finished=true;$('feedback').className='';
      $('feedback').innerHTML=complete?(r.revealedThisAttempt?'All correct. Try again without the solution to record an independent solve.':'<strong>All correct.</strong> Exercise complete.'):'<strong>Step correct.</strong> Continue when you’re ready.';
      $('check').innerHTML=(complete?(mode==='random'?'New numbers':'Next exercise'):stepIndex===current.steps.length-1?'Finish remaining steps':'Next step')+' <span>→</span>';
    }else{$('feedback').className='error';$('feedback').textContent=`${correct} of ${list.length} correct. ${list.some(x=>x.empty)?'Fill in the remaining answers.':'Check the highlighted answers and try again.'}`;}
    draw();navigation();save();
  });
  $('step-nav').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)showStep(Number(b.dataset.step));});
  document.querySelectorAll('[data-working]').forEach(b=>b.addEventListener('click',()=>{store.working=b.dataset.working;showStep(stepIndex);}));
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>go(current?.id||'homework',b.dataset.mode)));
  document.querySelectorAll('[data-home-link]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go('homework');}));
  $('homework-select').addEventListener('change',e=>{const q=Questions.find(q=>q.set===Number(e.target.value));go(q?.id||'homework');});
  $('new-numbers').addEventListener('click',newNumbers);
  $('next').addEventListener('click',next);
  $('previous').addEventListener('click',()=>go(Questions[Math.max(0,Questions.findIndex(q=>q.id===current.id)-1)].id));
  $('shuffle').addEventListener('click',()=>{const pool=Questions.filter(q=>q.set===current.set&&q.id!==current.id);go(pool[Math.floor(Math.random()*pool.length)].id);});
  $('retry').addEventListener('click',()=>{const r=record();r.draft={};r.stepsPassed={};r.revealedThisAttempt=false;r.stepIndex=0;started=Date.now();showStep(0);});
  $('reveal').addEventListener('click',()=>{
    if(!$('solution').hidden){$('solution').hidden=true;$('reveal').textContent='Show solution';return;}
    const r=record();r.assisted=true;r.revealedThisAttempt=true;
    const answers=activeStep()?activeFields:current.fields;
    const allDraft={...r.draft};current.steps.forEach(s=>s.fields.forEach(f=>allDraft[f.key]=String(f.answer)));current.fields.forEach(f=>allDraft[f.key]=String(f.answer));
    $('solution').className='solution';$('solution').innerHTML=`<h3>${activeStep()?'This step':'Solution'}</h3><ul>${answers.map(f=>`<li><strong>${esc(f.label)}:</strong> <span class="formula">${esc(answerText(f))}</span></li>`).join('')}</ul>${activeStep()?'<div class="diagram solution-diagram">'+StepVisuals.render(current,activeStep(),allDraft,{},false)+'</div>':''}<p>${current.solution}</p>`;
    $('solution').hidden=false;$('reveal').textContent='Hide solution';navigation();save();
  });
  $('reset-progress').addEventListener('click',()=>{if(!confirm('Reset all saved answers and progress for both modes?'))return;store.records={};store.randomRecords={};save();render(path());});
  $('given-circuit').addEventListener('click',()=>{showGiven=!showGiven;$('given-circuit').textContent=showGiven?'Step diagram':'Given circuit';draw();});
  $('enlarge').addEventListener('click',()=>{$('large-diagram').innerHTML=showGiven?'<div class="circuit-canvas">'+current.diagram()+'</div>':StepVisuals.render(current,activeStep(),record().draft,results);$('diagram-dialog').showModal();});
  $('close-diagram').addEventListener('click',()=>$('diagram-dialog').close());
  $('diagram-dialog').addEventListener('click',e=>{if(e.target===$('diagram-dialog'))$('diagram-dialog').close();});
  $('diagram-dialog').addEventListener('close',()=>{if(current)draw();});
  window.addEventListener('hashchange',()=>render(location.hash.slice(1)));
  setInterval(()=>{if(!finished&&current){const t=Math.floor((Date.now()-started)/1000);$('timer').textContent=`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;}},1000);
  render(location.hash.slice(1)||'homework');
})();
