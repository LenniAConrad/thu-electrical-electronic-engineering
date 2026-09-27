from playwright.sync_api import sync_playwright
from pathlib import Path
import os
BASE=os.environ.get('BASE_URL','http://localhost:8765/').rstrip('/')+'/'
OUT=Path('.build/flow-review');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1600,'height':1100});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'circuit-lab.html');page.wait_for_selector('[data-flow-part]',state='attached')
 def load(value):page.locator('#example').select_option(value);page.locator('#load-example').click()
 def sample():return page.evaluate('''async()=>{
  const read=()=>Object.fromEntries([...document.querySelectorAll('[data-flow-part]')].map(p=>[p.dataset.flowPart,Number(p.style.strokeDashoffset)]));
  const start=read();for(let i=0;i<7;i++)await new Promise(requestAnimationFrame);return [start,read()];
 }''')
 def movement(sample,key,direction=1):return ((sample[0][key]-sample[1][key])*direction)%40
 assert page.locator('[data-flow-part=V1]').get_attribute('data-direction')=='-1'
 assert page.locator('[data-flow-part=R1]').get_attribute('data-direction')=='1'
 motion=sample();assert movement(motion,'R1')>1;assert movement(motion,'V1',-1)>1
 # Same current moves at the same speed in all series branches, including the return wire.
 assert abs(movement(motion,'R1')-movement(motion,'W1'))<.001
 page.locator('#flow-play').click();assert page.locator('#flow-state').inner_text()=='Paused'
 assert sample()[0]==sample()[1]
 # Inspection leaves animation paused and distinguishes actual/reference direction.
 page.locator('[data-node=n2] circle').click();assert 'In · 4 mA' in page.locator('.junction-flow').inner_text();assert 'Out · 4 mA' in page.locator('.junction-flow').inner_text()
 page.locator('[data-inspect-part=V1]').first.click();assert page.locator('.actual-flow').inner_text()=='Conventional current: 0 → A'
 assert sample()[0]==sample()[1]
 page.locator('#show-flow').uncheck();assert page.locator('[data-flow-part]').count()==0;assert page.locator('#flow-play').is_disabled()
 page.locator('#show-flow').check();assert page.locator('[data-flow-part]').count()==4;assert page.locator('#flow-state').inner_text()=='Paused'
 page.locator('#flow-play').click();load('parallel')
 motion=sample();assert abs(movement(motion,'R1')/movement(motion,'R2')-2)<.01
 page.locator('[data-node=n2] circle').click();text=page.locator('.junction-flow').inner_text();assert 'In · 18 mA' in text and 'Out · 18 mA' in text and '12 mA' in text and '6 mA' in text
 page.locator('#flow-speed').focus();page.locator('#flow-speed').press('End');assert page.locator('#flow-speed-value').inner_text()=='3×'
 assert float(page.locator('#flow-speed').input_value())==3
 page.locator('#flow-speed').evaluate("e=>{e.value='1';e.dispatchEvent(new Event('input'))}")
 page.locator('.canvas-card').screenshot(path=str(OUT/'parallel-flow.png'));page.locator('#inspector').screenshot(path=str(OUT/'junction-flow.png'))
 # Live value changes reverse all branch directions when supply polarity changes.
 load('divider');page.locator('[data-inspect-part=V1]').first.click();page.locator('#part-value').fill('-12');page.locator('#part-edit button[type=submit]').click()
 assert page.locator('[data-flow-part=R1]').get_attribute('data-direction')=='-1';assert page.locator('[data-flow-part=V1]').get_attribute('data-direction')=='1'
 page.locator('#part-value').fill('0');page.locator('#part-edit button[type=submit]').click();assert page.locator('[data-flow-part]').count()==0;assert page.locator('#flow-state').inner_text()=='No current flows'
 # Open the return path with a switch; no current is animated anywhere.
 load('divider');page.locator('[data-inspect-part=W1]').first.click();page.locator('#delete-part').click();page.locator('[data-tool=S]').click();page.locator('[data-node=n3] circle').click();page.locator('[data-node=n0] circle').click()
 assert page.locator('[data-flow-part=S1]').count()==1
 page.locator('#switch-state').select_option('open');page.locator('#part-edit button[type=submit]').click();assert page.locator('[data-flow-part]').count()==0
 page.locator('#switch-state').select_option('closed');page.locator('#part-edit button[type=submit]').click();assert page.locator('[data-flow-part]').count()==4
 page.locator('[data-tool=W]').click();page.locator('[data-node=n1] circle').click();page.locator('[data-node=n0] circle').click();assert 'Conflicting' in page.locator('#solve-status').inner_text();assert page.locator('[data-flow-part]').count()==0
 load('divider')
 for width in [390,768,1366]:
  page.set_viewport_size({'width':width,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  assert page.locator('#flow-play').is_visible()
  if width==390:page.locator('.flow-controls').screenshot(path=str(OUT/'mobile-controls.png'))
 # Reduced motion starts paused, while explicit Play still works.
 reduced=b.new_page(reduced_motion='reduce');reduced.goto(BASE+'circuit-lab.html');reduced.wait_for_selector('[data-flow-part]',state='attached');assert reduced.locator('#flow-state').inner_text()=='Paused';assert reduced.locator('#flow-play').inner_text()=='Play';reduced.locator('#flow-play').click();assert reduced.locator('#flow-state').inner_text()=='Conventional current';reduced.close()
 if BASE.startswith('http://localhost'):
  page.goto(Path('circuit-lab.html').resolve().as_uri());page.wait_for_selector('[data-flow-part]',state='attached');page.context.set_offline(True);page.reload();page.wait_for_selector('[data-flow-part]',state='attached');assert movement(sample(),'R1')>0
 assert not errors,errors;b.close()
print('Current animation passed: motion/sign/speed ratios, pause, visibility, junction splits, live edits, zero/open/invalid circuits, mobile, reduced motion and offline.')
