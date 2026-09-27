from playwright.sync_api import sync_playwright
from pathlib import Path
import os
BASE=os.environ.get('BASE_URL','http://localhost:8765/').rstrip('/')+'/'
OUT=Path('.build/exercise-review');OUT.mkdir(parents=True,exist_ok=True)
KEY='thu-eee-circuit-lab-v1'
with sync_playwright() as p:
 b=p.chromium.launch();context=b.new_context(viewport={'width':1600,'height':1100});page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'circuit-lab.html');page.locator('#load-example').click();saved=page.evaluate('(key)=>localStorage.getItem(key)',KEY)
 page.goto(BASE+'index.html#h1-1');ids=page.evaluate('Questions.map(q=>q.id)')
 def solved():assert page.locator('#solve-status').inner_text().startswith('Solved'),page.locator('#solve-status').inner_text()
 def labels():
  issues=page.locator('#canvas').evaluate('''s=>{
   const els=[...s.querySelectorAll('[data-label-node],[data-label-part]')],bounds=s.getBoundingClientRect(),problems=[];
   const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
   for(let i=0;i<els.length;i++){const a=els[i].getBoundingClientRect();if(a.left<bounds.left||a.right>bounds.right||a.top<bounds.top||a.bottom>bounds.bottom)problems.push('clipped '+els[i].textContent);for(let j=i+1;j<els.length;j++)if(overlap(a,els[j].getBoundingClientRect()))problems.push([els[i].textContent,els[j].textContent]);for(const h of s.querySelectorAll('.arrow-head'))if(overlap(a,h.getBoundingClientRect()))problems.push([els[i].textContent,'arrow']);}return problems;}''')
  assert not issues,(page.url,issues)
 for random in [False,True]:
  for id in ids:
   route=('random/'+id+'/37') if random else id
   page.goto(BASE+'index.html#'+route);page.wait_for_selector('#open-playground')
   href=page.locator('#open-playground').get_attribute('href');assert 'exercise='+id in href
   if random:assert 'seed=37' in href
   page.goto(BASE+href);assert page.locator('#exercise-back').get_attribute('href')=='index.html#'+route
   if id in ['h2-10','h2-11']:
    page.wait_for_selector('.ac-card');assert page.locator('.ac-card').count()==(1 if id=='h2-10' else 3);continue
   page.wait_for_selector('#canvas [data-node]');solved();labels()
   if not random and id in ['h1-4','h2-3','h2-6']:assert 'example' in page.locator('#exercise-notes').inner_text() or 'illustrative' in page.locator('#exercise-notes').inner_text()
   if id=='h1-2':
    for variant in ['a','b','c','d']:page.locator('#exercise-variant').select_option(variant);solved();labels()
   if id=='h2-5':
    page.locator('#results [data-inspect-part="K"]').click();page.locator('#switch-state').select_option('open');page.locator('#part-edit .primary').click();solved();assert page.locator('.flow-dots').count()==0
    page.locator('#reset-exercise').click();solved();assert page.locator('.flow-dots').count()>0
 # Editing an exercise updates calculations without touching the custom circuit.
 page.goto(BASE+'circuit-lab.html?exercise=h1-1');page.locator('#results [data-inspect-part="R1"]').click();before=page.locator('#results').inner_text();page.locator('#part-value').fill('6');page.locator('#part-edit .primary').click();solved();assert page.locator('#results').inner_text()!=before
 page.locator('#reset-exercise').click();assert page.locator('#results').inner_text()==before
 assert page.evaluate('(key)=>localStorage.getItem(key)',KEY)==saved
 page.locator('#canvas [data-node="L"]').press('Enter');assert 'Kirchhoff' in page.locator('#inspector').inner_text()
 # AC controls, projections, input validation, reset, and offline operation.
 page.goto(BASE+'phasor-lab.html?exercise=h2-10');initial=page.locator('#ac-diagrams').inner_text();page.locator('#frequency').fill('50');page.locator('#rms1').fill('10');page.locator('#phase1').fill('0');page.locator('#time').fill('0.25');assert '10' in page.locator('.ac-legend').inner_text();assert '14.142 A' in page.locator('.instant').first.inner_text();assert '20 ms' in page.locator('#time-label').inner_text()
 page.locator('#frequency').fill('0');assert page.locator('#ac-status').inner_text();page.locator('#reset').click();assert page.locator('#ac-diagrams').inner_text()==initial
 page.goto(BASE+'phasor-lab.html?exercise=h2-11&seed=37');context.set_offline(True);page.locator('#real1').fill('3');page.locator('#imag1').fill('4');assert '5 ∠ 53.13° V RMS' in page.locator('.ac-legend').first.inner_text();page.locator('#time').fill('0.5');assert page.locator('.instant').first.inner_text().endswith('−5.657 V') or page.locator('.instant').first.inner_text().endswith('-5.657 V');context.set_offline(False)
 # Narrow screens keep large diagrams scrollable within their cards.
 for width in [390,768]:
  page.set_viewport_size({'width':width,'height':1000})
  for path in ['index.html#h1-1','circuit-lab.html?exercise=h2-4','phasor-lab.html?exercise=h2-11']:
   page.goto(BASE+path);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,path)
   page.screenshot(path=str(OUT/('mobile-'+str(width)+'-'+path.split('.')[0]+'.png')),full_page=True)
 assert not errors,errors
 b.close()
 print('Exercise browser checks passed: all 25 official/random links, all characteristic subcircuits, labels/arrows, switch flow, edits/reset, custom circuit preservation, AC controls, offline operation, and mobile layouts.')
