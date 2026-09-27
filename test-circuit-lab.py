from playwright.sync_api import sync_playwright
from pathlib import Path
import os, json
BASE=os.environ.get('BASE_URL','http://localhost:8765/').rstrip('/')+'/'
OUT=Path('.build/lab-review');OUT.mkdir(parents=True,exist_ok=True)
KEY='thu-eee-circuit-lab-v1'
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1600,'height':1100},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'circuit-lab.html');page.wait_for_selector('#canvas [data-node]')
 def state():return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
 def clickpoint(x,y):
  pt=page.locator('#canvas').evaluate('(s,xy)=>{const p=new DOMPoint(...xy).matrixTransform(s.getScreenCTM());return {x:p.x,y:p.y}}',[x,y]);page.mouse.click(pt['x'],pt['y'])
 def node(id):page.locator(f'[data-node="{id}"] circle').click()
 def component(kind,a,z):
  page.locator(f'[data-tool="{kind}"]').click();node(a);node(z)
 def load(name):page.locator('#example').select_option(name);page.locator('#load-example').click()
 def solved():assert page.locator('#solve-status').inner_text().startswith('Solved'),page.locator('#solve-status').inner_text()
 def selectpart(id):page.locator(f'#results [data-inspect-part="{id}"]').click()
 def labels():
  issues=page.locator('#canvas').evaluate('''s=>{
    const els=[...s.querySelectorAll('[data-label-node],[data-label-part]')],bounds=s.getBoundingClientRect(),problems=[];
    for(let i=0;i<els.length;i++){
      const a=els[i].getBoundingClientRect();
      if(a.left<bounds.left||a.right>bounds.right||a.top<bounds.top||a.bottom>bounds.bottom)problems.push('clipped '+els[i].textContent);
      for(const head of s.querySelectorAll('.arrow-head')){const b=head.getBoundingClientRect();if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)problems.push([els[i].textContent,'arrowhead']);}
      for(let j=i+1;j<els.length;j++){const b=els[j].getBoundingClientRect();if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)problems.push([els[i].textContent,els[j].textContent]);}
    }return problems;
  }''')
  assert not issues,issues
 # Every starter circuit solves, and its labels fit without overlapping.
 for ex in ['divider','parallel','bridge','current']:
  load(ex);solved();labels();page.locator('.canvas-card').screenshot(path=str(OUT/(ex+'-final.png')))
 load('divider');node('n2');assert 'Kirchhoff' in page.locator('#inspector').inner_text();assert '8 V' in page.locator('#inspector .metric').inner_text()
 page.locator('#equation-details summary').click();assert 'Ground reference' in page.locator('#equations').inner_text()
 # Build from scratch, rather than loading a preset.
 load('blank');page.locator('[data-tool="node"]').click()
 for xy in [(180,480),(180,160),(740,160),(740,480)]:clickpoint(*xy)
 assert len(state()['nodes'])==4
 component('V','n2','n1');component('R','n2','n3');component('R','n3','n4');component('W','n4','n1');solved()
 page.locator('[data-tool="select"]').click();node('n3');assert page.locator('#inspector .metric').inner_text()=='5 V'
 assert 'Substitute the calculated currents' in page.locator('#inspector').inner_text();assert 'Rearrange KCL for the node voltage' in page.locator('#inspector').inner_text()
 selectpart('R1');page.locator('#part-value').fill('-1');page.locator('#part-edit button[type=submit]').click()
 assert page.locator('#edit-error').inner_text();assert state()['parts'][1]['value']==1000
 page.locator('#part-value').fill('2');page.locator('#part-unit').select_option('1000');page.locator('#part-edit button[type=submit]').click();solved()
 assert 'Ohm’s law' in page.locator('#inspector').inner_text();assert '3.33333 mA' in page.locator('#inspector').inner_text()
 page.locator('#reverse-part').click();assert '−3.33333 mA' in page.locator('#inspector .metric').inner_text()
 page.locator('#undo').click();selectpart('R1');assert '3.33333 mA'==page.locator('#inspector .metric').inner_text()
 page.locator('#redo').click();selectpart('R1');assert '−3.33333 mA'==page.locator('#inspector .metric').inner_text();page.locator('#undo').click()
 # Drag a junction, then undo its position change without changing the solution.
 page.locator('[data-tool="select"]').click();pos=page.locator('[data-node=n3] circle').bounding_box();page.mouse.move(pos['x']+pos['width']/2,pos['y']+pos['height']/2);page.mouse.down();page.mouse.move(pos['x']+pos['width']/2+60,pos['y']+pos['height']/2+60,steps=5);page.mouse.up()
 assert state()['nodes'][2]['x']!=740;solved();page.locator('#undo').click();assert state()['nodes'][2]['x']==740
 # Split a wire into two wires at a new junction; currents remain unchanged.
 page.locator('[data-tool=node]').click();clickpoint(460,480);assert len(state()['nodes'])==5;assert len([x for x in state()['parts'] if x['kind']=='W'])==2;solved();page.locator('#undo').click()
 # Open and close a switch, including a non-zero voltage across the open gap.
 selectpart('W1');page.locator('#delete-part').click();component('S','n4','n1');solved()
 page.locator('#switch-state').select_option('open');page.locator('#part-edit button[type=submit]').click();solved();assert page.locator('#inspector .metric').inner_text()=='0 A';assert '10 V' in page.locator('#inspector').inner_text()
 page.locator('#switch-state').select_option('closed');page.locator('#part-edit button[type=submit]').click();solved()
 component('I','n1','n3');solved();assert 'Current source' in page.locator('#inspector h2').inner_text()
 # Ground and deletion changes are reversible.
 before=state();page.locator('[data-tool=ground]').click();node('n3');solved();assert state()['ground']=='n3';page.locator('#undo').click();assert state()==before
 page.locator('[data-tool=select]').click();node('n3');page.locator('#delete-node').click();assert len(state()['nodes'])==3;page.locator('#undo').click();assert state()==before
 # Save/open, reload, and reject malformed input without changing the circuit.
 with page.expect_download() as download:page.locator('#export').click()
 saved=OUT/'custom-circuit.json';download.value.save_as(saved);assert json.loads(saved.read_text())==state()
 load('blank');page.locator('#import').set_input_files(saved);solved();assert state()==before
 page.reload();page.wait_for_selector('#canvas [data-node]');solved();assert state()==before
 page.locator('#import').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"nodes":[]}'});assert 'Could not open' in page.locator('#tool-help').inner_text();assert state()==before
 # Invalid networks suppress results and explain what needs fixing.
 load('divider');component('W','n1','n0');assert 'Conflicting' in page.locator('#solve-status').inner_text();assert page.locator('#results table').count()==0
 page.locator('#undo').click();solved()
 # Multiple components between the same two endpoints stay separately selectable.
 component('R','n1','n2');solved();labels();page.locator('.canvas-card').screenshot(path=str(OUT/'parallel-paths.png'))
 page.locator('[data-tool=select]').click();node('n2')
 for width in [390,768,1366,1600]:
  page.set_viewport_size({'width':width,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  if width in [390,1600]:page.screenshot(path=str(OUT/f'layout-{width}.png'),full_page=True)
 if BASE.startswith('http://localhost'):
  page.goto(Path('circuit-lab.html').resolve().as_uri());page.wait_for_selector('#canvas [data-node]');solved();page.context.set_offline(True);page.reload();page.wait_for_selector('#canvas [data-node]');solved()
 assert not errors,errors;b.close()
print('Circuit editor passed: all presets, building, editing, formulas, drag, wire split, switches, sources, undo/redo, ground, JSON save/open, persistence, invalid circuits, label spacing, mobile and offline.')
