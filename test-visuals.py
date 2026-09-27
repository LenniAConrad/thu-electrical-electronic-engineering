from playwright.sync_api import sync_playwright
from pathlib import Path
import json, os
BASE=os.environ.get('BASE_URL','http://localhost:8765/').rstrip('/')+'/'
OUT=Path('.build/visual-review');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1600,'height':1100})
 page.goto(BASE+'#h1-1');page.wait_for_selector('#diagram svg')
 report=page.evaluate('''()=>{
 const host=document.createElement('div');host.className='diagram';host.style='position:absolute;top:0;left:0;width:1100px';document.body.append(host);
 const found=new Map();let cases=0;
 for(const base of Questions)for(const seed of [null,1,9,31,80]){
  const q=PracticeModels.build(base.id,seed),draft={};q.steps.forEach(s=>s.fields.forEach(f=>draft[f.key]=String(f.answer)));q.fields.forEach(f=>draft[f.key]=String(f.answer));
  for(const step of [null,...q.steps])for(const values of [{},draft]){
   host.innerHTML=StepVisuals.render(q,step,values);cases++;
   const svg=host.querySelector('svg'),bounds=svg.getBoundingClientRect();
   const texts=[...host.querySelectorAll('svg text')].filter(t=>t.textContent.trim()),heads=[...host.querySelectorAll('.arrow-head')];
   const overlap=(a,b)=>{a=a.getBoundingClientRect();b=b.getBoundingClientRect();return Math.min(a.right,b.right)-Math.max(a.left,b.left)>3&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>3;};
   for(let i=0;i<texts.length;i++){
    const box=texts[i].getBoundingClientRect();if(box.left<bounds.left-1||box.right>bounds.right+1||box.top<bounds.top-1||box.bottom>bounds.bottom+1){const key=[q.id,texts[i].textContent,'clipped'].join('|');if(!found.has(key))found.set(key,{id:q.id,seed,scene:step?.scene||'direct',pair:[texts[i].textContent,'clipped']});}
    for(let j=i+1;j<texts.length;j++)if(overlap(texts[i],texts[j])){
     const key=[q.id,step?.scene||'direct',texts[i].textContent,texts[j].textContent].join('|');if(!found.has(key))found.set(key,{id:q.id,seed,scene:step?.scene||'direct',pair:[texts[i].textContent,texts[j].textContent]});
    }
    for(const head of heads)if(overlap(texts[i],head)){
     const key=[q.id,step?.scene||'direct',texts[i].textContent,'arrowhead'].join('|');if(!found.has(key))found.set(key,{id:q.id,seed,scene:step?.scene||'direct',pair:[texts[i].textContent,'arrowhead']});
    }
   }
  }
 }
 host.remove();return {cases,overlaps:[...found.values()]};
}''')
 Path('.build/visual-review/collisions.json').write_text(json.dumps(report,indent=2))
 print(json.dumps(report,indent=2))
 assert not report['overlaps'],report['overlaps']
 # Focus identifies the requested quantity without placing badges on components.
 page.goto(BASE+'#h1-8');page.locator('[data-step="2"]').click()
 page.locator('#diagram [data-linked=is1]').focus()
 assert page.locator('#diagram [data-target=is1].active').count()==1
 page.locator('#diagram [data-linked=is1]').fill('-0.29')
 assert page.locator('[name=is1]').input_value()=='-0.29'
 page.keyboard.press('Tab')
 # Ensure drawings stay legible and answer controls remain inside their card.
 for width in [320,390,768,1024,1366,1600]:
  page.set_viewport_size({'width':width,'height':1000})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  assert page.locator('#diagram svg').evaluate('(s)=>s.getBoundingClientRect().width>=s.viewBox.baseVal.width'),width
  assert page.locator('#diagram').evaluate("(d)=>[...d.querySelectorAll('input')].every(i=>{const a=i.getBoundingClientRect(),b=d.getBoundingClientRect();return a.left>=b.left&&a.right<=b.right})"),width
  if width in [390,1366,1600]:page.screenshot(path=str(OUT/f'layout-{width}.png'),full_page=True)
 # The enlarged original diagram must also scroll inside the dialog on a phone.
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'#h2-9')
 page.locator('#given-circuit').click();page.locator('#enlarge').click()
 assert page.locator('#large-diagram .circuit-canvas').count()==1
 assert page.locator('#diagram-dialog').evaluate('(d)=>d.scrollWidth<=d.clientWidth')
 page.keyboard.press('Escape')
 page.set_viewport_size({'width':1600,'height':1100})
 for qid,step in [('h1-2',0),('h2-3',1),('h2-10',1),('h2-11',0)]:
  page.goto(BASE+'#'+qid);page.locator(f'[data-step="{step}"]').click()
  page.evaluate('([id,i])=>{const q=PracticeModels.build(id),draft={};q.steps.forEach(s=>s.fields.forEach(f=>draft[f.key]=String(f.answer)));document.querySelector("#diagram").innerHTML=StepVisuals.render(q,q.steps[i],draft)}',[qid,step])
  page.locator('#diagram').screenshot(path=str(OUT/(qid+'.png')))
 # Identical phasors use one arrow, without hiding that both vectors coincide.
 page.evaluate('()=>{const q=PracticeModels.build("h2-10");document.querySelector("#diagram").innerHTML=StepVisuals.phasors(q,{rms1:"10",rms2:"10",phase1:"30",phase2:"30"})}')
 assert page.locator('#diagram .arrow-head').count()==1
 assert 'coincident phasors' in page.locator('#diagram').inner_text()
 page.locator('#diagram').screenshot(path=str(OUT/'coincident-phasors.png'))
 print('Visual checks passed: label spacing, clipping, focus, six viewport widths, modal, and coincident phasors.')
 b.close()
