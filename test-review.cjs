/* Independent topology audit. MNA solves the drawn networks from component givens,
   rather than reusing the generators' equivalent-circuit formulas. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console});
for(const file of ['circuits.js','questions.js','checker.js','practice-models.js','step-visuals.js','formulas.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
vm.runInContext('globalThis.api={Questions,PracticeModels,Checker,Formulas}',ctx);
const {Questions,PracticeModels,Checker,Formulas}=ctx.api;
const near=(a,b,label)=>assert(Math.abs(Number(a)-b)<1e-8*Math.max(1,Math.abs(b)),`${label}: ${a} != ${b}`);
function solve(parts){
 const nodes=[...new Set(parts.flatMap(c=>[c[1],c[2]]))].filter(n=>n!=='0'),vs=parts.filter(c=>c[0]==='V'),size=nodes.length+vs.length;
 const matrix=Array.from({length:size},()=>Array(size+1).fill(0)),index=n=>nodes.indexOf(n);
 const add=(r,c,v)=>{if(r>=0&&c>=0)matrix[r][c]+=v;};
 for(const part of parts){const [kind,a,b,value]=part,x=index(a),y=index(b);
  if(kind==='R'){const g=1/value;add(x,x,g);add(y,y,g);add(x,y,-g);add(y,x,-g);}
  if(kind==='I'){add(x,size,-value);add(y,size,value);}
  if(kind==='V'){const z=nodes.length+vs.indexOf(part);add(x,z,1);add(y,z,-1);add(z,x,1);add(z,y,-1);add(z,size,value);}
 }
 for(let c=0;c<size;c++){
  let pivot=c;for(let r=c+1;r<size;r++)if(Math.abs(matrix[r][c])>Math.abs(matrix[pivot][c]))pivot=r;
  assert(Math.abs(matrix[pivot][c])>1e-12,'Network must have a unique solution');[matrix[c],matrix[pivot]]=[matrix[pivot],matrix[c]];
  const d=matrix[c][c];for(let j=c;j<=size;j++)matrix[c][j]/=d;
  for(let r=0;r<size;r++)if(r!==c){const m=matrix[r][c];for(let j=c;j<=size;j++)matrix[r][j]-=m*matrix[c][j];}
 }
 return {v:n=>n==='0'?0:matrix[index(n)][size],i:name=>matrix[nodes.length+vs.findIndex(c=>c[4]===name)][size]};
}
let audited=0;const choiceOrders=new Set(),bridgeAnswers=new Set();let equalPhase=0;
for(const base of Questions)for(const seed of [null,...Array.from({length:100},(_,i)=>i+1)]){
 const q=PracticeModels.build(base.id,seed),p=q.params,a=key=>q.fields.find(f=>f.key===key)?.answer;
 const checked=new Set(),check=(key,value)=>{near(a(key),value,q.id+'/'+key);checked.add(key);};
 assert(Formulas.map[q.id]?.length,'Formula coverage '+q.id);
 assert(Formulas.render(q.id).includes('formula-item'));
 if(seed===null)assert.equal(q.statement,base.statement,'Preserve official statement');
 const svg=q.diagram();for(const [old,replacement] of Object.entries(q.labels)){
  for(const label of Array.isArray(replacement)?replacement:[replacement])assert(svg.includes('>'+label.replaceAll('&','&amp;')+'</text>'),q.id+' diagram missing '+label);
 }
 if(q.id==='h1-1'){
  const s=solve([['V','A','L',p.v],['R','L','R',p.r1],['R','R','0',p.r2],['I','L','0',p.j1],['I','0','R',p.j2],['I','0','A',p.out+p.j1-p.j2]]);
  check('u',s.v('A'));check('i',s.i(undefined));
 }else if(q.id==='h1-2'){
  const shapes=[1,2,3,0];q.fields.forEach((f,i)=>{assert.equal(p.curveOrder['efgh'.indexOf(f.answer)],shapes[i]);checked.add(f.key);});
  choiceOrders.add(q.fields.map(f=>f.answer).join(''));
  // The source and resistor givens must produce the plotted intercepts.
  near(p.v/p.r,p.i,'Characteristic current intercept');
 }else if(q.id==='h1-3'){
  const s=solve([['I','0','T',p.is],['R','T','L',p.a],['R','T','R',2*p.a],['R','L','0',p.b],['R','R','0',p.b],['V','L','R',0,'bridge']]);
  check('i',s.i('bridge'));bridgeAnswers.add(q.fields[0].options.findIndex(o=>o[0]===a('i')));
  assert.equal(new Set(q.fields[0].options.map(o=>o[0])).size,4);
 }else if(q.id==='h1-4'){
  assert(q.statement.includes(`I₁ = ${p.i1} A`)&&q.statement.includes(`I₂ = ${p.i2} A`)&&q.statement.includes(`I₄ = ${String(p.i4).replace('-','−')} A`),'KCL prompt must match givens');
  check('i3',p.i1-p.i2);check('i5',p.i2-p.i4);check('i6',p.i1-p.i2+p.i4);check('i7',p.i1);
  // Exhibit positive resistances realizing every given current, not merely KCL consistency.
  const left=10,upper=p.i4>0?6:4,lower=p.i4>0?4:6;
  const r2=(left-upper)/p.i2,r3=(left-lower)/p.i3,r4=(upper-lower)/p.i4,r5=upper/a('i5'),r6=lower/a('i6');
  assert([r2,r3,r4,r5,r6].every(r=>Number.isFinite(r)&&r>0),'Passive network is physically realizable');
  const s=solve([['V','L','0',left],['R','L','U',r2],['R','L','D',r3],['R','U','D',r4],['R','U','0',r5],['R','D','0',r6]]);
  near((s.v('U')-s.v('D'))/r4,p.i4,'Realizable bridge current');
 }else if(/^h1-[56]/.test(q.id)){
  const toNorton=q.id[3]==='5',part=p.part;
  if(part===3){assert.equal(a('possible'),'no');assert.equal(a('reason'),toNorton?'zero':'infinite');checked.add('possible');checked.add('reason');}
  else {
   const original=toNorton?[['V','X','0',p.sign*p.v],['R','X','a',p.r]]:[['I','0','a',p.sign*p.i],['R','a','0',p.r]];
   if(part===2){if(toNorton)original.push(['R','X','0',3]);else{original[0]=['I','0','X',p.sign*p.i];original.push(['R','X','a',3]);}}
   check('r',p.r);
   if(toNorton){check('in',Math.abs(solve(original).v('a'))/p.r);assert.equal(a('direction'),p.sign>0?'up':'down');checked.add('direction');}
   else{check('v',Math.abs(solve(original).v('a')));assert.equal(a('polarity'),p.sign>0?'top':'bottom');checked.add('polarity');}
   // Equivalents must match terminal voltage under three different external loads.
   for(const load of [1,3,11]){
    const converted=toNorton?[['I','0','a',(a('direction')==='up'?1:-1)*a('in')],['R','a','0',a('r')]]:[['V','X','0',(a('polarity')==='top'?1:-1)*a('v')],['R','X','a',a('r')]];
    near(solve([...original,['R','a','0',load]]).v('a'),solve([...converted,['R','a','0',load]]).v('a'),'Loaded source equivalence');
   }
  }
 }else if(q.id==='h1-7'){
  const s=solve([['V','S','0',p.v],['R','S','A',2*p.r],['R','A','0',2*p.r],['I','0','A',p.is],['R','A','0',p.r],['R','A','0',p.r/2]]);check('i',s.v('A')/(p.r/2));
 }else if(q.id==='h1-8'){
  const s=solve([['V','A','0',p.va,'1'],['V','B','0',p.vb,'2'],['V','C','0',p.vc,'3'],['V','D','0',p.vd,'4'],['R','A','B',p.rt],['R','B','C',p.rr],['R','D','C',p.rb],['R','A','D',p.rl]]);
  for(let i=1;i<=4;i++)check('is'+i,-s.i(String(i)));
 }else if(q.id==='h2-1'){
  const i1=p.u1/p.r1,i2=p.u2/p.r2,r=(p.u2-p.u1)/(i1-i2),v=p.u1+r*i1;
  check('rth',r);check('vth',v);check('u',solve([['V','S','0',v],['R','S','A',r],['R','A','0',p.load]]).v('A'));
 }else if(q.id==='h2-2'){
  for(const given of [`I = ${p.is} mA`,`U = ${p.v} V`,`R₁ = R₂ = ${p.r1} kΩ`,`R₃ = ${p.r3} kΩ`])assert(q.statement.includes(given),'Power prompt must match '+given);
  const net=[['I','0','A',p.is],['V','S','0',p.v],['R','A','S',p.r1],['R','A','0',p.r1],['R','A','L',p.r3]];
  const off=solve([['R','A','0',p.r1],['R','A','0',p.r1],['R','A','L',p.r3],['I','0','L',1]]);
  check('r',off.v('L'));const u=solve([...net,['R','L','0',a('r')]]).v('L');check('p',u*u/a('r'));
  for(const scale of [.5,2]){const r=a('r')*scale,u=solve([...net,['R','L','0',r]]).v('L');assert(u*u/r<a('p'));}
 }else if(['h2-3','h2-6'].includes(q.id)){
  const rs=seed===null?[2,3,5,7,11]:Array(5).fill(p.r),es=seed===null?[13,17,19]:[p.e1,p.e2,p.e3];
  const [r1,r2,r3,r4,r5]=rs,[e1,e2,e3]=es;
  const s=solve([['V','A','L',e1],['V','A','X',e2],['V','Y','A',e3],['R','L','0',r1],['R','X','B',r2],['R','Y','0',r3],['R','0','B',r4],['R','B','A',r5]]);
  const env={va:s.v('A'),vb:s.v('B'),r1,r2,r3,r4,r5,e1,e2,e3,i1:-s.v('L')/r1,i2:(s.v('X')-s.v('B'))/r2,i3:s.v('Y')/r3,i4:-s.v('B')/r4,i5:(s.v('B')-s.v('A'))/r5};
  for(const f of q.fields){if(f.type==='number')check(f.key,env[f.key]);else{const parts=f.answer.split('=');near(Checker.evaluate(parts[0],env),parts.length===2?Checker.evaluate(parts[1],env):env[f.key],q.id+'/'+f.key);checked.add(f.key);}}
  if(q.id==='h2-3')assert(q.fields.every(f=>f.type==='equation'),'Same equation-only task as homework');
 }else if(q.id==='h2-4'){
  const s=solve([['V','P','0',p.pos],['V','N','0',-p.neg],['R','P','A',2*p.r],['R','N','A',3*p.r],['R','A','0',6*p.r],['R','N','B',2*p.r],['R','P','B',3*p.r],['R','B','0',6*p.r],['R','A','B',2*p.r]]);check('va',s.v('A'));check('vb',s.v('B'));
 }else if(q.id==='h2-5'){
  for(const closed of [true,false]){
   const net=[];for(let i=1;i<=3;i++)net.push(['V','L','X'+i,p.e],['R','X'+i,'Y'+i,p.r1],['R','Y'+i,'0',p.r2]);if(closed)net.push(['V','L','0',0]);
   const s=solve(net);for(let i=1;i<=3;i++)check((closed?'closed':'open')+i,s.v('Y'+i)/p.r2);
  }
 }else if(q.id==='h2-7'){
  const s=solve([['I','0','L',p.is],['R','L','A',p.r],['R','A','B',p.r],['R','A','0',p.r],['R','B','0',p.r],['V','B','0',p.v]]);check('i',(s.v('A')-s.v('B'))/p.r);
 }else if(q.id==='h2-8'){
  const s=solve([['V','S','0',p.e],['R','S','A',10*p.s],['R','A','0',40*p.s],['R','S','B',3*p.s],['R','B','0',6*p.s],['R','A','B',30*p.s]]);check('u',s.v('A')-s.v('B'));
 }else if(q.id==='h2-9'){
  const s=solve([['V','C','A',p.e1],['V','0','M',p.e2],['I','0','C',p.i1],['I','M','A',p.i2],['R','C','M',p.r],['R','A','0',p.r]]);check('i',s.v('A')/p.r);
 }else if(q.id==='h2-10'){
  for(const k of ['f1','f2'])check(k,p.f);check('rms1',p.rms1);check('rms2',p.peak2/Math.sqrt(2));check('phase1',p.ph1);check('phase2',p.ph2);check('difference',Math.abs(p.ph1-p.ph2));
  assert.equal(a('lead'),p.ph1===p.ph2?'same':p.ph1>p.ph2?'leads':'lags');checked.add('lead');
  if(p.ph1===p.ph2){equalPhase++;assert(q.solution.includes('in phase'));assert(!q.solution.includes('lags'));}
  if(seed!==null)assert(q.statement.includes(`${p.peak2} sin(`),'Second waveform retains peak-to-RMS calculation');
 }else if(q.id==='h2-11'){
  for(const [suffix,z] of [['1',p.z1],['i',p.zi],['2',p.z2]]){
   const amplitude=a('a'+suffix),angle=a('p'+suffix)*Math.PI/180;
   near(amplitude/Math.sqrt(2)*Math.cos(angle),z[0],'Real phasor reconstruction');near(amplitude/Math.sqrt(2)*Math.sin(angle),z[1],'Imaginary phasor reconstruction');
   checked.add('a'+suffix);checked.add('p'+suffix);check('w'+suffix,2*Math.PI*p.f);
  }
 }
 assert.equal(checked.size,q.fields.length,'Every final answer independently audited: '+q.id);audited++;
}
assert(choiceOrders.size>12,'Characteristic answers vary');assert.equal(bridgeAnswers.size,4);assert(equalPhase>0);
console.log(`Independent review passed: ${audited} models, all 25 exercise cards, every final answer, loaded-source equivalence, waveform reconstruction, diagram labels, formula coverage, and shuffled choices.`);
