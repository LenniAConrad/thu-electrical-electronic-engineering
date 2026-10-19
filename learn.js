/* Topic reader: answers, hints and experiments stay in this tab’s reading session. */
(()=>{
 const $=id=>document.getElementById(id),esc=MathView.escape;
 const groups=[{id:'dc',title:'How does a circuit work?',subtitle:'DC foundations',ids:['ohm','kcl','thevenin'],outcomes:['Relate voltage, current and resistance.','Write a current balance at a junction.','Predict how a load changes a network’s terminal voltage.']},{id:'ac',title:'What changes when voltage alternates?',subtitle:'AC foundations',ids:['waves','phasors','inductor','capacitor'],outcomes:['Read peak, RMS magnitude and phase from a sine wave.','Connect a phasor angle with timing.','Explain the opposite frequency responses of inductors and capacitors.']},{id:'analysis',title:'How do we solve an AC circuit?',subtitle:'Circuit analysis',ids:['series','power'],outcomes:['Add resistance and reactance as complex numbers.','Find the magnitude and phase of the current.','Distinguish active, reactive and apparent power.']}];
 let saved={};try{const value=JSON.parse(sessionStorage.getItem('eee-reading-session-v2')||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))saved=value;}catch{}
 const record=id=>saved[id]||(saved[id]={});
 function save(){try{sessionStorage.setItem('eee-reading-session-v2',JSON.stringify(saved))}catch{}}
 function outline(current){$('lesson-nav').innerHTML=groups.map(group=>`<section class="topic-group"><h3>${group.subtitle}</h3>${group.ids.map(id=>{const l=Lessons.find(l=>l.id===id),i=Lessons.indexOf(l);return `<a href="#${id}" ${id===current?'aria-current="step"':''}><span class="topic-number">${i+1}</span><span>${l.title}</span></a>`;}).join('')}</section>`).join('');}
 function topicHTML(l,full){const i=Lessons.indexOf(l),r=record(l.id),suffix=full?'-'+l.id:'';
 return `<div class="topic-meta"><span>Topic ${i+1} of ${Lessons.length} · ${l.tag}</span><a href="lectures.html">Full lecture reader</a></div><h2 tabindex="-1">${l.title}</h2><p class="concept">${l.idea}</p><div class="equation-box">${MathView.html(l.math,true)}</div><p>${l.explain}</p><section data-experiment="${l.id}" aria-label="Interactive experiment"></section><details class="worked" ${r.worked?'open':''}><summary>Small worked example</summary><p>${l.example}</p></details><form class="check" id="quick-check${suffix}" data-check="${l.id}"><h3>Quick check</h3><label for="quick-answer${suffix}">${l.prompt}</label>${l.options?`<select id="quick-answer${suffix}" required><option value="">Choose…</option>${l.options.map(([value,label])=>`<option value="${value}" ${r.draft===value?'selected':''}>${label}</option>`).join('')}</select>`:`<input id="quick-answer${suffix}" autocomplete="off" inputmode="decimal" aria-describedby="quick-unit${suffix}" value="${esc(r.draft||'')}"><span id="quick-unit${suffix}"> ${l.unit}</span>`}<div><button class="primary">Check my answer</button> <button type="button" id="hint-button${suffix}" data-hint>Hint</button> <button type="button" id="solution-button${suffix}" data-solution>Show explanation</button></div><p class="feedback" id="quick-feedback${suffix}" role="status" aria-live="polite"></p><p class="check-hint" id="quick-hint${suffix}" ${r.hint||r.assisted?'':'hidden'}>${r.assisted?l.solution:r.hint?l.hint:''}</p><button type="button" id="try-again${suffix}" data-retry ${r.assisted?'':'hidden'}>Try independently again</button></form><section class="transfer"><h3>Where you will use this</h3><p>${l.transfer}</p><a href="${l.link}">${l.label} →</a></section><footer class="lesson-footer">${i?`<a class="button" href="#${Lessons[i-1].id}">← ${Lessons[i-1].title}</a>`:'<a class="button" href="#dc">← DC foundations</a>'}${i<Lessons.length-1?`<a class="button" href="#${Lessons[i+1].id}">${Lessons[i+1].title} →</a>`:'<a class="button" href="index.html#homework">Try the homework →</a>'}</footer>`;}
 function bind(article,l){
  article.experimentController=LessonExperiments.mount(article.querySelector('[data-experiment]'),l.id,record(l.id).experiment||{},values=>{record(l.id).experiment=values;save();});
  const form=article.querySelector('form'),answer=form.querySelector('input,select'),feedback=form.querySelector('.feedback'),hint=form.querySelector('.check-hint');
  function restoreFeedback(){const r=record(l.id);feedback.textContent=r.feedback||'';feedback.className='feedback '+(r.correct?'good':r.feedback?'bad':'');}
  answer.oninput=()=>{const r=record(l.id);r.draft=answer.value;r.feedback='';r.correct=false;answer.removeAttribute('aria-invalid');restoreFeedback();save();};
  form.onsubmit=e=>{e.preventDefault();const r=record(l.id);r.draft=answer.value;let correct=false;try{correct=l.options?answer.value===l.answer:Checker.check({type:'number',answer:l.answer,unit:l.unit},answer.value).ok;}catch{}
   r.correct=correct;r.feedback=correct?(r.assisted?'Correct. You used the explanation; try another attempt when you are ready.':'Correct — '+l.solution):'Not quite. '+l.hint;
   answer.setAttribute('aria-invalid',String(!correct));restoreFeedback();save();};
  form.querySelector('[data-hint]').onclick=()=>{record(l.id).hint=true;hint.hidden=false;hint.textContent=l.hint;save();};
  form.querySelector('[data-solution]').onclick=()=>{record(l.id).assisted=true;hint.hidden=false;hint.textContent=l.solution;form.querySelector('[data-retry]').hidden=false;save();};
  form.querySelector('[data-retry]').onclick=()=>{const r=record(l.id);saved[l.id]={experiment:r.experiment};article.experimentController.destroy();article.innerHTML=topicHTML(l,location.hash==='#all');bind(article,l);save();};
  article.querySelector('.worked').ontoggle=e=>{record(l.id).worked=e.target.open;save();};restoreFeedback();
 }
 const cached=new Map();
 function render(){
  for(const article of document.querySelectorAll('#reader-content article')){article.experimentController?.pause();if(![...cached.values()].includes(article))article.experimentController?.destroy();}
const id=location.hash.slice(1),l=Lessons.find(l=>l.id===id),group=groups.find(g=>g.id===id),full=id==='all';outline(l?.id);$('reader-outline').open=!l&&!full;$('reader-overview').hidden=!!l||full;const content=$('reader-content');content.classList.toggle('full-reading',full);if(full){for(const article of cached.values())article.experimentController?.destroy();cached.clear();}
  if(l||full){$('reader-heading').innerHTML=full?'<h1>All foundation exercises</h1><p>Read all nine topics, experiments and checks. Use the topic map to return to focused reading.</p>':`<p class="eyebrow">${groups.find(g=>g.ids.includes(l.id)).subtitle}</p>`;content.replaceChildren();
   for(const item of full?Lessons:[l]){let article=!full&&cached.get(item.id);if(!article){article=document.createElement('article');article.className='lesson-card';article.id=full?'topic-'+item.id:'lesson';article.tabIndex=-1;article.innerHTML=topicHTML(item,full);content.append(article);bind(article,item);if(!full)cached.set(item.id,article);}else content.append(article);}

   if(l)try{sessionStorage.setItem('eee-reading-position',JSON.stringify({id:l.id}));}catch{}
   document.title=(full?'Foundation exercises':l.title)+' · THU EEE';
  }else{content.innerHTML='';const title=group?.title||'What would you like to learn?';$('reader-heading').innerHTML=`<p class="eyebrow">${group?.subtitle||'Electrical & Electronic Engineering'}</p><h1>${title}</h1><p>Start at the beginning, or choose the topic you’re studying. Each idea includes an experiment, a worked example, and a short check.</p>`;const outcomes=group?.outcomes||['Understand currents and voltages in a DC circuit.','Connect sinusoidal waveforms with phasors and components.','Solve series AC circuits and calculate their power.'];let last;try{last=JSON.parse(sessionStorage.getItem('eee-reading-position')||'null')}catch{}
   $('reader-overview').innerHTML=`<h2>You’ll learn to</h2><ul>${outcomes.map(s=>`<li>${s}</li>`).join('')}</ul>${group?.id==='analysis'?'<p>Before you begin, review <a href="#phasors">phasors</a>, <a href="#inductor">inductors</a> and <a href="#capacitor">capacitors</a>.</p>':''}<div class="lesson-start"><a class="button primary" href="#${group?.ids[0]||'ohm'}">Start ${group?'this part':'the foundations'} →</a><a class="text-link" href="#all">Read all foundation exercises</a></div>${Lessons.some(l=>l.id===last?.id)?`<a class="resume-reading" href="#${last.id}"><span>Pick up where you left off</span><strong>Continue ${Lessons.find(l=>l.id===last.id).title} →</strong></a>`:''}`;
   if(group){for(const section of $('lesson-nav').children)section.hidden=section.querySelector('a').getAttribute('href')!=='#'+group.ids[0];}
   document.title=title+' · THU EEE';
  }

 }
 let printState;
 window.addEventListener('beforeprint',()=>{
  if(printState)return;
  const content=$('reader-content');
  printState={nodes:[...content.childNodes],full:content.classList.contains('full-reading'),details:[...document.querySelectorAll('details')].map(el=>[el,el.open])};
  printState.nodes.forEach(node=>node.experimentController?.pause());
  content.replaceChildren();content.classList.add('full-reading');
  for(const l of Lessons){const article=document.createElement('article');article.className='lesson-card';article.id='print-'+l.id;article.innerHTML=topicHTML(l,true);content.append(article);article.experimentController=LessonExperiments.mount(article.querySelector('[data-experiment]'),l.id,record(l.id).experiment||{});article.querySelectorAll('details').forEach(el=>el.open=true);article.querySelector('.check-hint').hidden=false;article.querySelector('.check-hint').textContent=l.solution;}
 });
 window.addEventListener('afterprint',()=>{
  if(!printState)return;
  const content=$('reader-content');content.querySelectorAll('article').forEach(article=>article.experimentController?.destroy());content.replaceChildren(...printState.nodes);content.classList.toggle('full-reading',printState.full);for(const [el,open] of printState.details)el.open=open;printState=undefined;
 });
 window.addEventListener('hashchange',()=>{render();const target=document.querySelector('#lesson h2')||$('reader-heading').querySelector('h1');if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start'});}});render();
})();
