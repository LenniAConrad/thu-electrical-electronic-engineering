from playwright.sync_api import sync_playwright
from pathlib import Path
import json, os
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8766').rstrip('/')
out=Path('.build/qa');out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1440,'height':1100});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/learn.html')
 lessons=page.evaluate('Lessons.map(l=>({id:l.id,answer:l.answer,options:!!l.options}))')
 for l in lessons:
  page.goto(BASE+'/learn.html#'+l['id'])
  page.wait_for_selector('#quick-answer')
  if l['options']:page.select_option('#quick-answer',l['answer'])
  else:page.fill('#quick-answer',str(l['answer']))
  page.locator('#quick-check button.primary').click()
  assert 'Correct' in page.inner_text('#quick-feedback'),(l,page.inner_text('#quick-feedback'))
  assert page.locator('.katex-error').count()==0,l
 page.goto(BASE+'/learn.html#inductor');page.screenshot(path=str(out/'learning-desktop.png'),full_page=True)
 page.goto(BASE+'/hw3.html')
 probs=page.evaluate('HW3.problems.map(p=>({id:p.id,fields:p.fields}))')
 for q in probs:
  page.evaluate('(id)=>{document.getElementById(id).open=true}',q['id'])
  form=page.locator('[data-problem="'+q['id']+'"]')
  for f in q['fields']:form.locator('[name="'+f['key']+'"]').fill(str(f['answer']))
  form.locator('button.primary').click()
  assert 'All answers correct' in form.locator('.feedback').inner_text(),q
 assert page.locator('.katex-error').count()==0,page.locator('.katex-error').all_text_contents()
 page.screenshot(path=str(out/'hw3-desktop.png'),full_page=True)
 page.goto(BASE+'/circuit-lab.html')
 page.locator('#example').select_option('current');page.locator('#load-example').click()
 page.locator('details').last.evaluate('(el)=>el.open=true')
 assert page.locator('#equations .katex').count()>3
 assert page.locator('.katex-error').count()==0,page.locator('.katex-error').all_text_contents()
 page.locator('#equations').screenshot(path=str(out/'equations.png'))
 page.goto(BASE+'/index.html#h2-4')
 page.locator('#formula-reference').evaluate('(el)=>el.open=true');page.locator('[data-formula-scope="all"]').click()
 assert page.locator('#formulas .katex').count()==22
 assert page.locator('.katex-error').count()==0,page.locator('.katex-error').all_text_contents()
 for url in ['learn.html#inductor','hw3.html','circuit-lab.html','index.html']:
  page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'/'+url)
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),url
  if url.startswith('learn'):page.screenshot(path=str(out/'learning-mobile.png'),full_page=True)
 # No network dependencies for math or interactive learning.
 page.goto(BASE+'/learn.html#waves');page.context.set_offline(True);page.locator('a[href="#inductor"]').click();assert page.locator('.katex').count()>0
 # Failed answers, assisted attempts, retry, and storage survive a reload.
 page.context.set_offline(False)
 page.goto(BASE+'/learn.html#inductor')
 page.evaluate("localStorage.removeItem('eee-foundations-v1')");page.reload()
 page.fill('#quick-answer','999');page.locator('#quick-check button.primary').click();assert 'Not quite' in page.inner_text('#quick-feedback')
 page.click('#solution-button');page.fill('#quick-answer','100');page.locator('#quick-check button.primary').click();assert 'used the explanation' in page.inner_text('#quick-feedback')
 assert '0 of 9' in page.inner_text('#learning-progress')
 page.click('#try-again');page.fill('#quick-answer','100');page.locator('#quick-check button.primary').click();page.reload();assert '1 of 9' in page.inner_text('#learning-progress')
 page.goto(BASE+'/hw3.html#p23');page.evaluate("localStorage.removeItem('eee-hw3-v1')");page.reload()
 page.locator('[data-solution="p23"]').evaluate('(e)=>e.open=true');page.wait_for_timeout(100)
 form=page.locator('[data-problem="p23"]');q=next(q for q in probs if q['id']=='p23')
 for f in q['fields']:form.locator('[name="'+f['key']+'"]').fill(str(f['answer']))
 form.locator('button.primary').click();assert 'used the worked steps' in form.locator('.feedback').inner_text()
 form.locator('[data-retry]').click()
 for f in q['fields']:form.locator('[name="'+f['key']+'"]').fill(str(f['answer']))
 form.locator('button.primary').click();page.reload();assert '1 of 6' in page.inner_text('#hw-progress')
 page.set_viewport_size({'width':1440,'height':1100})
 for id in ['p114','p116','p117','p23','p24','p25']:
  page.locator('#'+id).evaluate('(e)=>e.open=true');page.locator('#'+id+' .circuit-picture').first.screenshot(path=str(out/(id+'.png')))
 assert not errors,errors
 print('PASS: 9 learning checks, all 6 HW03 answer forms, KaTeX equations and 22 references, mobile widths, offline interaction, no browser errors')
 b.close()
