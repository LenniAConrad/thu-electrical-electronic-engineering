const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console});
for(const file of ['circuits.js','questions.js','checker.js','practice-models.js','step-visuals.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
vm.runInContext('globalThis.api={Questions,Checker,PracticeModels,StepVisuals}',ctx);
const {Questions,Checker,PracticeModels,StepVisuals}=ctx.api;
const near=(a,b,msg)=>assert(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),msg+': '+a+' vs '+b);
let steps=0,variants=0;
for(const original of Questions){
 const q=PracticeModels.build(original.id);
 for(const f of original.fields){const updated=q.fields.find(x=>x.key===f.key);assert(updated,original.id+'/'+f.key);if(typeof f.answer==='number')near(updated.answer,f.answer,'Official answer unchanged');else assert.equal(updated.answer,f.answer);}
 for(const seed of Array.from({length:120},(_,i)=>i+1)){
  const model=PracticeModels.build(original.id,seed),p=model.params,draft={},all=model.steps.flatMap(s=>s.fields).concat(model.fields);
  assert.equal(JSON.stringify(model.params),JSON.stringify(PracticeModels.build(original.id,seed).params),'seed reproducibility');
  for(const f of all){assert(f,model.id+' undefined field');assert(Checker.check(f,String(f.answer)).ok,model.id+' '+f.key+' '+f.answer);draft[f.key]=String(f.answer);if(f.type==='number'){assert(Number.isFinite(f.answer),model.id+' finite');if(!['h2-10','h2-11'].includes(model.id))near(f.answer*100,Math.round(f.answer*100),'Tidy exact decimal');}}
  for(const s of model.steps){const svg=StepVisuals.render(model,s,{},{});assert(svg.startsWith('<svg'),model.id);assert(!svg.includes('NaN')&&!svg.includes('undefined'),model.id+' invalid SVG');assert(StepVisuals.render(model,s,draft,{}).includes('</svg>'));steps++;}
  const a=k=>model.fields.find(f=>f.key===k).answer;
  if(model.id==='h1-1'){near(a('i')-p.j1,p.out-p.j2,'KCL');near(a('u'),p.v+p.r1*(p.out-p.j2)+p.r2*p.out,'KVL');}
  if(model.id==='h1-3'){near(a('i'),p.is*(2*p.a)/(3*p.a)-p.is/2,'Bridge');}
  if(model.id==='h1-7'){near(p.u/(2*p.r)+p.u/(2*p.r)+p.u/p.r+p.u/(p.r/2),p.v/(2*p.r)+p.is,'Norton KCL');}
  if(model.id==='h1-8')near([1,2,3,4].reduce((s,i)=>s+a('is'+i),0),0,'Source KCL');
  if(model.id==='h2-1'){near(p.v*p.r1/(p.r+p.r1),p.u1,'Measurement 1');near(p.v*p.r2/(p.r+p.r2),p.u2,'Measurement 2');near(a('u'),p.v*p.load/(p.r+p.load),'Load divider');}
  if(model.id==='h2-2'){near((p.vth-p.v)/p.r1+p.vth/p.r1,p.is,'Open-circuit KCL');near(p.rth,p.r3+p.r1/2,'Rth');near(a('p'),p.vth*p.vth/(4*p.rth),'Power');}
  if(['h2-3','h2-6'].includes(model.id)){
   near(p.i1+p.i5,p.i2+p.i3,'KCL A');near(p.i2+p.i4,p.i5,'KCL B');near(p.r*(p.i1+p.i3),p.e1+p.e3,'KVL left');near(p.r*(p.i2+p.i5),-p.e2,'KVL right');near(p.r*(p.i3+p.i4+p.i5),p.e3,'KVL lower');near(p.i1,(p.e1-p.va)/p.r,'I1 from nodes');
  }
  if(model.id==='h2-4'){near((p.va-p.pos)/(2*p.r)+(p.va+p.neg)/(3*p.r)+p.va/(6*p.r)+(p.va-p.vb)/(2*p.r),0,'Node A');near((p.vb+p.neg)/(2*p.r)+(p.vb-p.pos)/(3*p.r)+p.vb/(6*p.r)+(p.vb-p.va)/(2*p.r),0,'Node B');}
  if(model.id==='h2-5')near(a('closed1')*(p.r1+p.r2)+p.e,0,'Closed KVL');
  if(model.id==='h2-7'){const va=(p.is*p.r+p.v)/2;near(a('i'),(va-p.v)/p.r,'Independent nodal superposition');}
  if(model.id==='h2-8'){const current=a('u')/(30*p.s),va=.8*p.e-current*8*p.s,vb=2*p.e/3+current*2*p.s;near(va-vb,a('u'),'Loaded bridge KCL');}
  if(model.id==='h2-9'){const va=a('i')*p.r;near((va+p.e1+p.e2)/p.r+va/p.r,p.i1+p.i2,'Supernode');}
  variants++;
 }
 const signatures=new Set(Array.from({length:30},(_,i)=>JSON.stringify(PracticeModels.build(original.id,i+1).params)));
 assert(signatures.size>=4,original.id+' needs actual variety');
}
console.log(`Verified ${variants} seeded variants, ${steps} visual steps, official-answer preservation, tidy arithmetic, and independent circuit-law checks.`);
