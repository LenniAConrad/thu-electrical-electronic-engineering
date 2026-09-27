const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console,URLSearchParams});for(const f of ['circuits.js','questions.js','practice-models.js','exercise-playgrounds.js','circuit-solver.js','phasor-lab.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);vm.runInContext('globalThis.api={Questions,PracticeModels,ExercisePlaygrounds,CircuitSolver,PhasorMath}',ctx);
const {Questions,PracticeModels:P,ExercisePlaygrounds:E,CircuitSolver:S,PhasorMath:M}=ctx.api;
const near=(a,b,msg)=>assert(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${msg}: ${a} != ${b}`);let count=0;
for(const base of Questions)for(const seed of [null,...Array.from({length:100},(_,i)=>i+1)]){
 const q=P.build(base.id,seed),p=q.params,initial=E.build(q);assert.equal(E.read('?'+E.url(q).split('?')[1]).seed,seed);assert(E.back(q).includes(q.id));
 if(initial.kind==='ac'){
  if(q.id==='h2-10'){near(M.polar(p.rms1,p.ph1).peak,p.rms1*Math.sqrt(2),'peak');near(M.sample(M.polar(p.rms2,p.ph2),0),p.peak2*Math.sin(p.ph2*Math.PI/180),'sample');}
  else for(const z of [p.z1,p.zi,p.z2]){const a=M.rectangular(...z);near(a.rms,Math.hypot(...z),'magnitude');near(a.real,z[0],'real');near(M.sample(a,0),z[1]*Math.sqrt(2),'quadrant');}count++;continue;
 }
 for(const variant of initial.variants.length?initial.variants:['a']){
  const m=E.build(q,variant),c=m.circuit,s=S.solve(c);assert(s.ok,q.id+': '+s.message);assert(c.nodes.every(n=>n.x>=60&&n.x<=920&&n.y>=60&&n.y<=560));
  const v=id=>s.voltages[id],i=id=>s.branches[id].current,eq=(a,b)=>near(a,b,q.id),ans=key=>q.fields.find(f=>f.key===key)?.answer;
  if(q.id==='h1-1'){eq(v('A'),p.u);eq(i('V1'),p.total);eq(i('R1'),p.mid);}
  if(q.id==='h1-2'){const u=v('a'),current=i('RL');if(variant==='a')eq(u,p.v-p.r*current);if(variant==='b')eq(-current,p.i);if(variant==='c')eq(u,p.v-p.r*current);if(variant==='d')eq(u,p.v);}
  if(q.id==='h1-3')eq(i('Bridge'),Number(ans('i')));
  if(q.id==='h1-4'){eq(i('R1'),p.i1);eq(i('R2'),p.i2);eq(i('R4'),p.i4);for(const j of [3,5,6,7])eq(i('R'+j),ans('i'+j));}
  if(/^h1-[56]/.test(q.id)){
   if(p.part<3)eq(v('a'),q.id[3]==='5'?p.sign*p.v:p.sign*p.i*p.r);
   if(q.id==='h1-5d')eq(v('a'),p.v);if(q.id==='h1-6d')eq(i('RL'),p.i);
   c.parts.find(x=>x.id==='SL').closed=true;const loaded=S.solve(c);assert(loaded.ok);
   if(p.part<3)eq(loaded.voltages.a,(q.id[3]==='5'?p.sign*p.v:p.sign*p.i*p.r)*10/(10+p.r));
   if(q.id==='h1-6d'){c.parts.find(x=>x.id==='SL').closed=false;assert(!S.solve(c).ok);}
  }
  if(q.id==='h1-7')eq(i('RL')*1000,p.i);
  if(q.id==='h1-8'){eq(-i('VA'),ans('is1'));eq(-i('VB'),ans('is2'));eq(i('VC'),ans('is3'));eq(-i('VD'),ans('is4'));}
  if(q.id==='h2-1')eq(v('A'),ans('u'));
  if(q.id==='h2-2'){c.parts.find(x=>x.id==='RL').value=p.rth*1000;const max=S.solve(c);eq(max.branches.RL.power*1000,p.power);assert(max.branches.RL.power>s.branches.RL.power);}
  if(['h2-3','h2-6'].includes(q.id)){const pp=q.random?p:P.build(q.id,1).params;for(let j=1;j<=5;j++)eq(i('R'+j),pp['i'+j]);eq(v('A'),pp.va);eq(v('B'),pp.vb);if(!q.random)assert(m.notes.join(' ').includes('symbolic'));}
  if(q.id==='h2-4'){eq(v('A'),p.va);eq(v('B'),p.vb);}
  if(q.id==='h2-5'){for(let j=1;j<=3;j++)eq(i('R2_'+j),p.i);c.parts.find(x=>x.id==='K').closed=false;const open=S.solve(c);assert(open.ok);for(let j=1;j<=3;j++)eq(open.branches['R2_'+j].current,0);}
  if(q.id==='h2-7')eq(i('R2'),p.i);
  if(q.id==='h2-8')eq(v('A')-v('B'),p.u);
  if(q.id==='h2-9')eq(i('RL'),p.i);
  count++;
 }
}
assert.throws(()=>E.read('?exercise=h1-1&seed=bad'));assert.throws(()=>E.read('?exercise=missing'));near(M.difference(350,10),-20,'wrapped phase');
console.log(`Exercise playgrounds: ${count} official/random models and subcircuits; source polarities, units, homework answers, loaded conversions, switch states and AC reconstruction passed.`);
