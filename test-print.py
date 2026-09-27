"""Print UI, deterministic worksheet content, page bounds and actual PDF pagination."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os, re, subprocess

BASE=os.environ.get('BASE_URL','http://localhost:8765/').rstrip('/')+'/'
OUT=Path('.build/print-review');OUT.mkdir(parents=True,exist_ok=True)

def bounds(page):
    problems=page.locator('.sheet').evaluate_all('''els=>els.flatMap((e,i)=>{
      const box=e.getBoundingClientRect(),foot=e.querySelector('.sheet-footer').getBoundingClientRect();
      const problems=[];
      if(e.scrollHeight>e.clientHeight+1||foot.bottom>box.bottom-50)problems.push({page:i+1,issue:'page overflow'});
      for(const svg of e.querySelectorAll('svg')){
        const rect=svg.getBoundingClientRect();
        for(const text of svg.querySelectorAll('text')){
          const r=text.getBoundingClientRect();
          if(r.left<rect.left-1||r.right>rect.right+1||r.top<rect.top-1||r.bottom>rect.bottom+1)problems.push({page:i+1,text:text.textContent,issue:'clipped label'});
        }
      }
      return problems;
    })''')
    assert not problems,problems

with sync_playwright() as p:
    browser=p.chromium.launch();page=browser.new_page(viewport={'width':1366,'height':1000})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'#random/h2-2/12345');page.wait_for_selector('#diagram svg')
    saved=page.evaluate('JSON.stringify(localStorage)')
    with page.expect_popup() as popup:
        page.locator('#print-worksheet').click()
    sheet=popup.value;sheet.wait_for_selector('.sheet')
    assert sheet.locator('#sheet-homework').input_value()=='2'
    assert sheet.locator('#sheet-mode').input_value()=='random'
    assert sheet.locator('#sheet-seed').input_value()=='12345'
    assert sheet.locator('.key-sheet').count()==0
    assert saved==page.evaluate('JSON.stringify(localStorage)')
    sheet.close()
    for hw,count in [(1,14),(2,11)]:
        for mode in ['official','random']:
            page.goto(BASE+f'worksheet.html?homework={hw}&mode={mode}&seed=12345&answers=1')
            page.wait_for_selector('.sheet');page.emulate_media(media='print');bounds(page)
            total=count+(count+2)//3
            assert page.locator('.sheet').count()==total
            assert page.locator('.exercise-sheet').count()==count
            assert page.locator('.exercise-sheet input').count()==0
            # Statements, values, choices and answer keys use exactly the same model as practice.
            assert page.evaluate('''([hw,mode])=>Questions.filter(q=>q.set===hw).every(base=>{
              const q=PracticeModels.build(base.id,mode==='random'?12345:null),e=document.querySelector(`[data-question="${q.id}"]`),key=document.querySelector(`[data-answer-question="${q.id}"]`);
              const values=[...key.querySelectorAll('dd')].map(x=>x.textContent);
              return e.querySelector('.print-statement').innerHTML===q.statement&&e.querySelectorAll('.blank').length===q.fields.length&&q.fields.every((f,i)=>{
                const value=f.type==='choice'?f.options.find(o=>o[0]===String(f.answer))[1]:(typeof f.answer==='number'?PracticeModels.fmt(f.answer):f.answer)+(f.unit?' '+f.unit:'');
                return values[i]===value;
              });
            })''',[hw,mode])
            dest=OUT/f'hw{hw}-{mode}.pdf'
            page.pdf(path=str(dest),prefer_css_page_size=True,print_background=True)
            info=subprocess.check_output(['pdfinfo',str(dest)],text=True)
            assert int(re.search(r'Pages:\s+(\d+)',info)[1])==total,info
            text=subprocess.check_output(['pdftotext','-layout',str(dest),'-'],text=True)
            pages=text.split('\f');assert len([t for t in pages if t.strip()])==total
            refs=page.locator('.exercise-sheet h2').all_text_contents()
            for i,ref in enumerate(refs):
                assert ref in pages[i],(i,ref)
                assert 'Answer key' not in pages[i]
                assert re.search(rf'{i+1}\s*/\s*{total}',pages[i]),(i,'footer')
            print(f'HW {hw} {mode}: {count} exercises, {total} PDF pages; all fit.')
    for hw in [1,2]:
        for seed in [1,31,80,4294967295]:
            page.goto(BASE+f'worksheet.html?homework={hw}&mode=random&seed={seed}&answers=1')
            page.wait_for_selector('.sheet');bounds(page)
    page.emulate_media(media='screen')
    before=page.locator('#sheets').inner_html();page.reload();page.wait_for_selector('.sheet')
    assert page.locator('#sheets').inner_html()==before
    page.locator('#sheet-new').click()
    assert page.locator('#sheets').inner_html()!=before
    assert page.locator('#sheet-seed').input_value()!='4294967295'
    page.locator('#sheet-answers').uncheck();assert page.locator('.key-sheet').count()==0
    # A print click calls the native dialog; invalid sheet numbers cannot print stale content.
    page.evaluate('()=>{window.printCalls=0;window.print=()=>{window.printCalls++}}')
    page.locator('#print').click();assert page.evaluate('window.printCalls')==1
    page.locator('#sheet-seed').fill('0');page.locator('#print').click()
    assert page.evaluate('window.printCalls')==1
    page.locator('#sheet-seed').fill('12345');page.locator('#sheet-seed').press('Tab')
    for width in [390,1366]:
        page.set_viewport_size({'width':width,'height':1000})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
        page.screenshot(path=str(OUT/f'preview-{width}.png'))
    page.goto(BASE+'#h1-8');page.wait_for_selector('#diagram svg')
    page.set_viewport_size({'width':320,'height':850})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert page.locator('#print-worksheet').is_visible()
    if BASE.startswith('http://localhost'):
        page.goto(Path('worksheet.html').resolve().as_uri()+'?homework=2&mode=random&seed=12345')
        page.wait_for_selector('.sheet');assert page.locator('.exercise-sheet').count()==11
        page.context.set_offline(True);page.reload();page.wait_for_selector('.sheet')
        assert page.locator('.exercise-sheet').count()==11
    assert not errors,errors
    browser.close()
print('Print checks passed: PDFs, page bounds, values, answer keys, seeds, print action, mobile and offline.')
