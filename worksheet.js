(() => {
  'use strict';
  const $=id=>document.getElementById(id),esc=Circuits.draw.esc;
  const params=new URLSearchParams(location.search),sets=Course.sets().filter(h=>h.questions.length);
  const freshSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0]||1;
  const validSeed=value=>/^\d+$/.test(value)&&Number(value)>=1&&Number(value)<=4294967295;
  $('sheet-homework').innerHTML=sets.map(h=>`<option value="${h.id}">${h.title}</option>`).join('');
  $('sheet-homework').value=String(sets.find(h=>h.id===Number(params.get('homework')))?.id||sets[0].id);
  $('sheet-mode').value=params.get('mode')==='random'?'random':'official';
  $('sheet-seed').value=validSeed(params.get('seed')||'')?params.get('seed'):freshSeed();
  $('sheet-answers').checked=params.get('answers')==='1';
  function answer(f){
    if(f.type==='choice')return f.options.find(o=>o[0]===String(f.answer))?.[1]||String(f.answer);
    return (typeof f.answer==='number'?PracticeModels.fmt(f.answer):f.answer)+(f.unit?' '+f.unit:'');
  }
  function blanks(q){
    return `<div class="answer-blanks ${q.fields.some(f=>f.group)?'grouped-blanks':''}">${q.fields.map(f=>`${f.group?'<h3 class="blank-group">'+esc(f.group)+'</h3>':''}<div class="blank ${['equation','choice'].includes(f.type)?'wide':''}"><span>${esc(f.label)}${f.unit?' ('+esc(f.unit)+')':''}</span>${f.type==='choice'?'<div class="print-choices">'+f.options.map(o=>'<span>□ '+esc(o[1])+'</span>').join('')+'</div>':'<div class="answer-line"></div>'}</div>`).join('')}</div>`;
  }
  function diagram(q){
    if(q.id!=='h2-10')return q.diagram();
    const {line,text,svg}=Circuits.draw;
    return svg(line(75,180,610,180,'axis')+line(335,325,335,35,'axis')+text(615,207,'Re')+text(365,45,'Im')+text(315,207,'0'),'Blank coordinates for drawing both RMS phasors',680,355);
  }
  function render(){
    const random=$('sheet-mode').value==='random',seed=Number($('sheet-seed').value),set=sets.find(h=>h.id===Number($('sheet-homework').value)),withAnswers=$('sheet-answers').checked;
    $('seed-control').hidden=$('sheet-new').hidden=!random;
    if(random&&!validSeed($('sheet-seed').value)){$('sheet-seed').reportValidity();return;}
    const models=set.questions.map(q=>PracticeModels.build(q.id,random?seed:null));
    const label=random?'Random practice · Sheet '+seed:'Official homework';
    const total=models.length+(withAnswers?Math.ceil(models.length/3):0);
    const header=()=>`<header class="sheet-header"><div><strong>${esc(Course.name)}</strong><span>10220074 · Instructor: Luo Haiyun</span></div><div>${esc(set.title)}<span>${esc(label)}</span></div></header>`;
    const footer=i=>`<footer class="sheet-footer"><span>${esc(set.title)} · ${esc(label)}</span><span>${i} / ${total}</span></footer>`;
    let html=models.map((q,i)=>`<article class="sheet exercise-sheet" data-question="${q.id}">${header()}<div class="student-line">Name: <span></span>Date: <span></span></div><h2>Exercise ${esc(q.ref)}</h2><div class="print-statement">${q.statement}</div>${q.note?'<p class="source-note">'+q.note+'</p>':''}<div class="print-diagram">${diagram(q)}</div>${q.extra&&q.id!=='h2-10'?'<div class="print-extra">'+q.extra+'</div>':''}${blanks(q)}<div class="working-space"><span>Working</span></div>${footer(i+1)}</article>`).join('');
    if(withAnswers)for(let i=0;i<models.length;i+=3){
      html+=`<article class="sheet key-sheet">${header()}<h2>Answer key</h2>${models.slice(i,i+3).map(q=>`<section class="key-exercise" data-answer-question="${q.id}"><h3>Exercise ${esc(q.ref)}</h3><dl>${q.fields.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${esc(answer(f))}</dd></div>`).join('')}</dl></section>`).join('')}${footer(models.length+Math.floor(i/3)+1)}</article>`;
    }
    $('sheets').innerHTML=html;
    $('sheet-status').textContent=`${models.length} exercises · ${total} pages${withAnswers?' · Answer key included':''}`;
    document.title=`THU EEE - ${set.title} - ${random?'Practice '+seed:'Official'}`;
    $('back').href='index.html#'+(random?`random/${models[0].id}/${seed}`:models[0].id);
    const query=new URLSearchParams({homework:String(set.id),mode:random?'random':'official'});
    if(random)query.set('seed',String(seed));if(withAnswers)query.set('answers','1');
    // File URLs support printing too, even where history changes are restricted.
    try{history.replaceState(null,'','?'+query);}catch{}
  }
  for(const id of ['sheet-homework','sheet-mode','sheet-answers'])$(id).addEventListener('change',render);
  $('sheet-seed').addEventListener('change',()=>{if(validSeed($('sheet-seed').value)){render();}else{$('sheet-seed').reportValidity();}});
  $('sheet-new').addEventListener('click',()=>{let seed=freshSeed();while(seed===Number($('sheet-seed').value))seed=freshSeed();$('sheet-seed').value=seed;render();});
  $('print').addEventListener('click',()=>{if($('sheet-mode').value==='random'&&!$('sheet-seed').reportValidity())return;window.print();});
  render();
})();
