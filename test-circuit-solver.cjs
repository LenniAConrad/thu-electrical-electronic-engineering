const assert=require('node:assert/strict'),S=require('./circuit-solver.js');
const n=(id)=>({id,name:id,x:100,y:100}),p=(id,kind,a,b,value,closed=true)=>({id,kind,a,b,value,closed});
const c=(parts,ground='g')=>({nodes:[...new Set(parts.flatMap(p=>[p.a,p.b]))].map(n),parts,ground});
const near=(a,b)=>assert(Math.abs(a-b)<=1e-8*Math.max(1e-3,Math.abs(b)),`${a} != ${b}`);
function good(circuit){const r=S.solve(circuit);assert(r.ok,r.message);Object.values(r.kcl).forEach(i=>near(i,0));near(r.power,0);return r;}
let circuit=c([p('V1','V','a','g',12),p('R1','R','a','b',1000),p('R2','R','b','c',2000),p('W1','W','c','g',0)]),r=good(circuit);
near(r.voltages.b,8);near(r.branches.R1.current,.004);near(r.branches.V1.current,-.004);near(r.branches.V1.power,-.048);near(r.branches.W1.current,.004);
const regrounded=good({...circuit,ground:'b'});near(regrounded.voltages.g,-8);near(regrounded.voltages.a,4);near(regrounded.branches.R2.current,.004);
circuit.parts[3]=p('S1','S','c','g',0,false);r=good(circuit);near(r.branches.S1.current,0);near(r.branches.S1.voltage,12);near(r.voltages.b,12);
circuit.parts[3].closed=true;r=good(circuit);near(r.branches.S1.current,.004);
r=good(c([p('I1','I','g','a',.006),p('R1','R','a','b',1000),p('R2','R','b','g',2000)]));near(r.voltages.a,18);near(r.voltages.b,12);near(r.branches.I1.power,-.108);
// A floating voltage source between two resistive nodes (supernode).
r=good(c([p('V1','V','a','b',6),p('R1','R','a','g',2000),p('R2','R','b','g',1000)]));near(r.voltages.a,4);near(r.voltages.b,-2);near(r.branches.V1.current,-.002);
// Balanced and unbalanced bridge, including zero current in a real resistor.
const bridge=[p('V1','V','a','g',10),p('R1','R','a','b',1000),p('R2','R','b','g',1000),p('R3','R','a','d',1000),p('R4','R','d','g',1000),p('R5','R','b','d',1000)];
r=good(c(bridge));near(r.branches.R5.current,0);bridge[4].value=2000;r=good(c(bridge));near(r.voltages.b,70/13);near(r.voltages.d,80/13);near(r.branches.R5.current,-1/1300);
for(const parts of [[p('V1','V','a','g',10),p('W1','W','a','g',0)],[p('V1','V','a','g',10),p('V2','V','a','g',12)],[p('I1','I','g','a',.01)]])assert.match(S.solve(c(parts)).message,/Conflicting/);
for(const parts of [[p('V1','V','a','g',10),p('V2','V','a','g',10)],[p('W1','W','g','a',0),p('W2','W','a','b',0),p('W3','W','b','g',0)],[p('R1','R','a','b',100),p('R2','R','g','d',100)]])assert.match(S.solve(c(parts)).message,/unique/);
assert.match(S.solve({...c([p('R1','R','g','a',100)]),ground:null}).message,/Ground/);
assert(!S.solve(c([p('R1','R','a','g',0)])).ok);assert(!S.solve(c([p('R1','R','a','a',100)])).ok);
assert(!S.solve(c([p('S1','S','a','g',0,'false')])).ok);
// Construct independent solutions: prescribe node voltages, derive current injections
// from resistor currents, then require the solver to recover the prescribed voltages.
for(let seed=1;seed<=250;seed++){
 const vs={g:0,a:(seed%13)-6,b:(seed%7)+1,d:-(seed%5)-1,e:(seed%11)+2},names=Object.keys(vs),parts=[];
 for(let i=1;i<names.length;i++)parts.push(p('R'+parts.length,'R',names[i],names[i-1],[1,10,1000,1e6][(i+seed)%4]));
 parts.push(p('R5','R','a','e',10*(seed%5+1)),p('R6','R','b','g',100*(seed%7+1)));
 for(const id of names.slice(1)){
  const injected=parts.filter(p=>p.kind==='R').reduce((sum,p)=>sum+(p.a===id?(vs[p.a]-vs[p.b])/p.value:p.b===id?(vs[p.b]-vs[p.a])/p.value:0),0);
  parts.push(p('I'+id,'I','g',id,injected));
 }
 r=good(c(parts));for(const id of names)near(r.voltages[id],vs[id]);
}
for(const ohms of [1e-6,1,1e3,1e9]){r=good(c([p('V1','V','a','g',1),p('R1','R','a','g',ohms)]));near(r.branches.R1.current,1/ohms);}
assert.equal(S.quantity(1e-15,'A'),'1e−15 A');
assert.equal(S.num(-.004),'−0.004');assert.equal(S.quantity(.004,'A'),'4 mA');
console.log('DC solver passed: 250 constructed networks, sources, supernodes, ground changes, switches, wires, bridge balance, KCL/power conservation, extreme resistances and invalid circuits.');
