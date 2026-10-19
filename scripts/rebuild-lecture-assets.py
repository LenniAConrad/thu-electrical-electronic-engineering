from pathlib import Path
import json,hashlib,fitz,io
from PIL import Image
root=Path(__file__).resolve().parents[1];docs=root.parent/'docs';audit=root/'.build/source-audit';assets=root/'assets/lecture-material';assets.mkdir(exist_ok=True)
fitz.TOOLS.mupdf_display_errors(False)
files={
'basic':'L01_Circuit Basic Theory-new.pptx','original':'L01_Circuit Basic Theory.pptx','dc':'L02+L03-E&ETech.pptx','dc-short':'L02-E&ETech.pptx','ac-basics':'Week03 Fundamentals of sinusoidal AC circuits.pdf','ac-pptx':'Week03 Fundamentals of sinusoidal AC circuits.pptx','ac-alt':'L04-L05Fundamentals of sinusoidal AC circuits.pptx','ac2':'Lesson06 AC-2.pdf','resonance':'AC.pptx','lab1':'Experiment 1 - Basic Electrical Instruments.pptx-1012(1).pptx','lab2':'Experiment 2 - Frequency Response of a Series RLC Circuit.pptx'}
content=json.loads((root/'content/lectures.json').read_text());assigned={};images={};manifest={}
for l in content:
 for t in l['topics']:t.pop('variants',None)
for lecture in content:
 for topic in lecture['topics']:
  for ref in topic['sources']:assigned.setdefault((ref['deck'],ref['page']),[]).append({'lecture':lecture['id'],'topic':topic['id']})
for key,name in files.items():
 source=docs/name;pdf=source if source.suffix=='.pdf' else audit/(source.stem+'.pdf');doc=fitz.open(pdf)
 manifest[key]={'file':name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'pages':[]}
 for number,page in enumerate(doc,1):
  record={'page':number}
  if (key,number) in assigned:
   record.update(status='included',sections=assigned[key,number]);name=f'{key}-{number:03}.webp';out=assets/name
   if not out.exists():
    pix=page.get_pixmap(matrix=fitz.Matrix(1800/page.rect.width,1800/page.rect.width),alpha=False)
    im=Image.open(io.BytesIO(pix.tobytes('png')));im.save(out,'WEBP',quality=90,method=6)
   else:im=Image.open(out)
   images[f'{key}:{number}']={'src':'assets/lecture-material/'+name,'width':im.width,'height':im.height}
  elif key=='original' and 10<=number<=37:
   target=number if number<=34 else {35:36,36:38,37:39}[number];record.update(status='parallel-version',equivalent={'deck':'basic','page':target},reason='Same circuit material retained in the updated L01 deck; older unique analysis material is included separately.')
  elif key=='original' and number==64:record.update(status='parallel-version',equivalent={'deck':'basic','page':56},reason='Repeated closing content summary.')
  elif key=='dc-short' and 4<=number<=13:record.update(status='parallel-version',equivalent={'deck':'dc','page':number-1},reason='Corresponding node-potential material in the expanded L02+L03 deck.')
  elif key=='ac-pptx' and number!=7:record.update(status='parallel-version',equivalent={'deck':'ac-basics','page':number},reason='PowerPoint counterpart of the supplied 78-page PDF.')
  elif key=='ac-alt' and number>=2:record.update(status='parallel-version',equivalent={'deck':'ac-basics','page':number+(6 if number<=33 else 7)},reason='Corresponding AC topic retained from the expanded Week03 deck; its additional DC-equivalence review is also included.')
  else:
   reason='Title, outline, closing/thank-you page; substantive material appears in the mapped topic sections.'
   if key in ['basic','original'] and 2<=number<=7:reason='Course administration, contact details, references and assessment rules; omitted from the content-only reader requested by the user.'
   if key=='lab1' and number==2:reason='Grading, attendance and late-submission rules; omitted from the content-only reader. Technical preparation and reporting requirements are included.'
   record.update(status='context-only',reason=reason)
  manifest[key]['pages'].append(record)
 print(key,len(doc),flush=True)
# Keep alternative academic versions available beside their corresponding topic.
for key,deck in manifest.items():
 doc=None
 for item in deck['pages']:
  if item['status']!='parallel-version':continue
  target=item['equivalent'];sections=assigned[(target['deck'],target['page'])]
  for section in sections:
   topic=next(t for l in content if l['id']==section['lecture'] for t in l['topics'] if t['id']==section['topic'])
   topic.setdefault('variants',[]).append({'deck':key,'page':item['page']})
  # The provided PDF is the preferred AC rendering; keep other versions too.
  source=docs/files[key];pdf=source if source.suffix=='.pdf' else audit/(source.stem+'.pdf')
  if doc is None:doc=fitz.open(pdf)
  page=doc[item['page']-1];name=f"{key}-{item['page']:03}.webp";out=assets/name
  if not out.exists():
   pix=page.get_pixmap(matrix=fitz.Matrix(1800/page.rect.width,1800/page.rect.width),alpha=False)
   im=Image.open(io.BytesIO(pix.tobytes('png')));im.save(out,'WEBP',quality=90,method=6)
  else:im=Image.open(out)
  images[f"{key}:{item['page']}"]={'src':'assets/lecture-material/'+name,'width':im.width,'height':im.height}
  item['retained']=True
# Require all substantive unmapped pages to have an explicit parallel-page target.
for deck in manifest.values():
 for p in deck['pages']:
  if p['status']=='parallel-version':
   ref=p['equivalent'];assert (ref['deck'],ref['page']) in assigned,(ref,p)
(root/'content/source-coverage.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(root/'content/lecture-figures.json').write_text(json.dumps(images,ensure_ascii=False,indent=2)+'\n')
(root/'content/lectures.json').write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n')
(root/'lecture-content.js').write_text('/* Generated from content/lectures.json and the audited lecture figures. */\nconst CourseLectures='+json.dumps(content,ensure_ascii=False,separators=(',',':'))+';\nconst LectureFigures='+json.dumps(images,separators=(',',':'))+';\n')
print('Included',len(images),'source pages; accounted for',sum(len(d['pages']) for d in manifest.values()),'pages in',len(manifest),'files')
