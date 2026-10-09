from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json, os
BASE=os.environ.get('BASE_URL','http://localhost:8765/').rstrip('/')+'/'
OUT=Path('.build/qa');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch()
 page=browser.new_page(viewport={'width':1600,'height':1100},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE)
 expect(page.locator('#homework-overview')).to_be_visible()
 expect(page.locator('#homework-grid a')).to_have_count(3)
 expect(page.locator('#homework-grid .unavailable')).to_have_count(1)
 page.locator('[data-mode=random]').click()
 expect(page.locator('#overview-mode')).to_have_text('Random practice')
 page.locator('#homework-select').select_option('2')
 expect(page.locator('#title')).to_have_text('Inside the circuit box')
 assert '#random/h2-1/' in page.url
 page.locator('.brand').click()
 expect(page.locator('#homework-overview')).to_be_visible()
 expect(page.locator('#overview-mode')).to_have_text('Random practice')
 page.locator('[data-mode=official]').click()
 expect(page.locator('#overview-mode')).to_have_text('Official homework')
 page.locator('#homework-grid a').first.click()
 expect(page.locator('#title')).to_have_text('Current & voltage')
 page.goto(BASE+'#h1-1');page.wait_for_selector('#fields input')
 qs=page.evaluate('Questions.map(q=>({id:q.id,title:q.title}))')
 assert page.locator('.course-meta').inner_text()=='10220074 · Section 0\nInstructor · Luo Haiyun'
 assert page.locator('text=Original sheet').count()==0
 assert page.locator('text=Original homework values').count()==0
 assert page.locator('[data-mode=official]').inner_text()=='Official homework'
 assert page.locator('#eyebrow').inner_text().startswith('OFFICIAL HOMEWORK · HW 01')
 page.locator('#formula-reference summary').click()
 assert page.locator('#formulas [data-formula=kcl]').count()==1
 assert page.locator('#formulas [data-formula=sinusoid]').count()==0
 page.locator('[data-formula-scope=all]').click()
 assert page.locator('#formulas .formula-item').count()==22
 assert page.locator('#formulas [data-formula=sinusoid]').count()==1
 page.locator('#formula-reference').screenshot(path=str(OUT/'all-formulas.png'))
 page.locator('#formula-reference summary').click()
 # Direct diagram typing, form synchronization, and rejection feedback.
 point=page.locator('#diagram [data-linked=mid]');point.fill('999')
 assert page.locator('[name=mid]').input_value()=='999'
 point.press('Enter');assert page.locator('#diagram .diagram-answer.incorrect').count()==1
 page.locator('#diagram [data-linked=mid]').fill('1.5');page.locator('#diagram [data-linked=mid]').press('Enter')
 assert 'Step correct' in page.locator('#feedback').inner_text()
 assert page.locator('#diagram .diagram-answer.correct').count()==1
 page.locator('#enlarge').click();assert page.locator('#diagram-dialog').is_visible();page.keyboard.press('Escape')
 def model(qid,seed):
  return page.evaluate('([id,seed])=>{const q=PracticeModels.build(id,seed);return {id:q.id,steps:q.steps,fields:q.fields}}',[qid,seed])
 def fill(fields):
  for f in fields:
   el=page.locator(f'[name="{f["key"]}"]')
   if f['type']=='choice':
    if el.first.evaluate('(e)=>e.tagName')=='SELECT':el.select_option(str(f['answer']))
    else:page.locator(f'[name="{f["key"]}"][value="{f["answer"]}"]').check()
   else:el.fill(str(f['answer']))
 count=0
 captures={('h1-5a',1),('h1-6a',1),('h1-7',1),('h2-2',1),('h2-4',2),('h2-7',0),('h2-7',1),('h2-8',0),('h2-8',2),('h2-9',2),('h2-10',1),('h2-11',0)}
 for random in [False,True]:
  for idx,q in enumerate(qs):
   seed=100+idx if random else None
   route=f'random/{q["id"]}/{seed}' if random else q['id']
   page.goto(BASE+'#'+route);page.wait_for_function('(route)=>location.hash.slice(1)===route&&document.querySelector("#title").textContent===Questions.find(q=>q.id===route.split("/").filter(v=>v.startsWith("h"))[0]).title',arg=route)
   page.locator('[data-working=steps]').click()
   page.locator('#formula-reference summary').click()
   assert page.locator('#formulas .formula-item').count()>0
   assert ('RANDOM PRACTICE' if random else 'OFFICIAL HOMEWORK') in page.locator('#eyebrow').inner_text()
   page.locator('#formula-reference summary').click()
   m=model(q['id'],seed)
   for i,step in enumerate(m['steps']):
    page.locator(f'[data-step="{i}"]').click()
    assert page.locator('#fields .field').count()==len(step['fields'])
    assert page.locator('#diagram svg').count()==1
    assert page.locator('#diagram svg').evaluate('(svg)=>svg.getBoundingClientRect().width >= svg.viewBox.baseVal.width')
    if not random and (q['id'],i) in captures:
     page.locator('#diagram').screenshot(path=str(OUT/f'{q["id"]}-step{i}.png'))
    fill(step['fields']);page.locator('#check').click()
    feedback=page.locator('#feedback').inner_text()
    assert 'correct' in feedback.lower(),f'{route} step{i}: {feedback}'
    if not random and q['id']=='h2-10' and i==1:page.locator('#diagram').screenshot(path=str(OUT/'phasors-completed.png'))
    if not random and q['id']=='h2-11' and i==0:page.locator('#diagram').screenshot(path=str(OUT/'wave-completed.png'))
    count+=1
   assert 'All correct' in page.locator('#feedback').inner_text(),route
 expect(page.locator('#total-progress')).to_have_text('25 drills solved')
 page.reload();expect(page.locator('#total-progress')).to_have_text('25 drills solved')
 page.locator('[data-mode=official]').click();expect(page.locator('#total-progress')).to_have_text('25 / 25 solved')
 # New numbers change the model and preserve the old official completion.
 page.goto(BASE+'#random/h1-1/777');page.locator('[data-working=direct]').click()
 before=page.evaluate('JSON.stringify(PracticeModels.build("h1-1",777).params)')
 page.locator('#new-numbers').click();page.wait_for_function('!location.hash.endsWith("/777")')
 after=page.evaluate('JSON.stringify(PracticeModels.build("h1-1",Number(location.hash.split("/")[2])).params)')
 assert before!=after
 fill(model('h1-1',int(page.url.split('/')[-1]))['fields']);page.locator('#check').click()
 assert 'All correct' in page.locator('#feedback').inner_text()
 page.locator('[data-mode=official]').click();expect(page.locator('#total-progress')).to_have_text('25 / 25 solved')
 # A revealed fresh exercise is not counted as an independent solve.
 other=browser.new_page(viewport={'width':390,'height':844});other.goto(BASE+'#h1-1')
 other.locator('[data-working=direct]').click();other.locator('#reveal').click()
 other.locator('[name=i]').fill('2.5');other.locator('[name=u]').fill('14.5');other.locator('#check').click()
 expect(other.locator('#total-progress')).to_have_text('0 / 25 solved')
 other.locator('#retry').click();other.locator('[name=i]').fill('2.5');other.locator('[name=u]').fill('14.5');other.locator('#check').click()
 expect(other.locator('#total-progress')).to_have_text('1 / 25 solved')
 # Mobile: diagrams retain readable dimensions inside their scroll area; page itself fits.
 for qid in ['h1-1','h1-2','h1-5a','h2-3','h2-10']:
  other.goto(BASE+'#'+qid);other.locator('[data-working=steps]').click()
  assert other.evaluate('document.documentElement.scrollWidth <= innerWidth'),qid+' page overflow'
  assert other.locator('#diagram svg').evaluate('(svg)=>svg.getBoundingClientRect().width >= svg.viewBox.baseVal.width')
  other.locator('#formula-reference summary').click()
  other.locator('[data-formula-scope=all]').click()
  assert other.evaluate('document.documentElement.scrollWidth <= innerWidth'),qid+' formulas overflow'
  other.screenshot(path=str(OUT/(qid+'-mobile.png')),full_page=True)
 # Return to a clean first exercise for the full desktop preview.
 clean=browser.new_page(viewport={'width':1600,'height':1100});clean.goto(BASE)
 clean.screenshot(path=str(OUT/'desktop.png'),full_page=True)
 clean.set_viewport_size({'width':390,'height':844})
 assert clean.evaluate('document.documentElement.scrollWidth <= innerWidth')
 clean.screenshot(path=str(OUT/'overview-mobile.png'),full_page=True)
 # Offline use remains supported.
 offline=browser.new_page();offline.goto(Path('index.html').resolve().as_uri()+'#h1-1');offline.wait_for_selector('#fields input')
 assert offline.locator('#step-title').inner_text()=='Right junction'
 assert not errors,errors
 print(json.dumps({'cards':len(qs),'guided_steps_checked':count,'modes':['official','random'],'formula_reference':'all 25 cards and all 22 formula entries','diagram_input_sync':'passed','wrong_answer_feedback':'passed','new_numbers':'passed','separate_progress':'passed','reload':'passed','assisted_attempt':'passed','mobile':'5 cases, full-size diagrams, formulas fit without page overflow','offline':'passed','console_errors':errors},indent=2))
 browser.close()
