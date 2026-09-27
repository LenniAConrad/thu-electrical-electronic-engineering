const assert=require('node:assert/strict');
const c=require('./checker.js'),qs=require('./questions.js');
assert.equal(qs.length,25);assert.equal(new Set(qs.map(q=>q.id)).size,25);
assert.equal(qs.filter(q=>q.set===1).length,14);assert.equal(qs.filter(q=>q.set===2).length,11);
let checks=0;
for(const q of qs)for(const f of q.fields){
  assert(c.check(f,String(f.answer)).ok,`${q.id} / ${f.key}: expected answer must pass`);
  assert(!c.check(f,'').ok);checks+=2;
  if(f.type==='number'){
    assert(!c.check(f,String(f.answer+Math.max(10,Math.abs(f.answer)/4))).ok,`${q.id}/${f.key} rejects wrong number`);checks++;
  }
}
for(const [raw,value] of [['1/2',.5],['sqrt(2)*10',Math.sqrt(2)*10],['20√2',20*Math.sqrt(2)],['100π',100*Math.PI],['2e-3',.002],['−3,5',-3.5],['-2^2',-4],['(-2)^2',4],['2(3+4)',14]]){assert(Math.abs(c.evaluate(raw)-value)<1e-10,raw);checks++;}
assert.equal(c.numeric('0.001 A','mA'),1);assert.equal(c.numeric('5000 ohm','kΩ'),5);assert.equal(c.numeric('5 mW','mW'),5);
assert(c.check({type:'number',unit:'°',answer:-126.86989765,angle:true},'233.1301').ok);
assert(!c.check({type:'number',unit:'A',answer:0},'0.001').ok);
for(const s of ['alert(1)','process.exit()','1/0','sqrt(-1)','NaN','Infinity','1+','1;2','1)'])assert.throws(()=>c.evaluate(s),s);
assert(c.equivalent('I2+I3-I1-I5=0','I1+I5=I2+I3',true));
assert(c.equivalent('2*R1*I1+2*R3*I3=2*E1+2*E3','R1*I1+R3*I3=E1+E3',true));
assert(!c.equivalent('0=0','I1+I5=I2+I3',true));
assert(!c.equivalent('I1-I5=I2+I3','I1+I5=I2+I3',true));
assert(!c.equivalent('R1*I1+R3*I3=E1-E3','R1*I1+R3*I3=E1+E3',true));
assert(c.equivalent('-(VA-E1)/R1','(E1-VA)/R1',false));
assert(c.equivalent('(E1-VA)/R1+(VB-VA+E2)/R2-(VA+E3)/R3+(VB-VA)/R5=0','(VA-E1)/R1+(VA-E2-VB)/R2+(VA+E3)/R3+(VA-VB)/R5=0',true));
console.log(`Passed ${checks}+ answer, parser, equivalence, and coverage checks across all 25 exercises.`);
