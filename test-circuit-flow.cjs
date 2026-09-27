const assert=require('node:assert/strict'),Solver=require('./circuit-solver.js'),Flow=require('./circuit-flow.js');
const circuit={ground:'g',nodes:['g','a'].map(id=>({id,name:id,x:100,y:100})),parts:[{id:'V1',kind:'V',a:'a',b:'g',value:12},{id:'R1',kind:'R',a:'a',b:'g',value:1000},{id:'R2',kind:'R',a:'a',b:'g',value:2000}]};
const near=(a,b)=>assert(Math.abs(a-b)<1e-12,`${a} != ${b}`);
let result=Solver.solve(circuit),flow=Flow.analyze(circuit,result);assert(result.ok);assert.equal(flow.active,3);
assert.equal(flow.branches.V1.from,'g');assert.equal(flow.branches.V1.to,'a');assert.equal(flow.branches.V1.direction,-1);
assert.equal(flow.branches.R1.from,'a');assert.equal(flow.branches.R1.to,'g');assert.equal(flow.branches.R1.direction,1);
near(flow.branches.R1.ratio/flow.branches.R2.ratio,2);near(flow.nodes.a.totalIn,.018);near(flow.nodes.a.totalOut,.018);
assert.equal(flow.nodes.a.incoming.length,1);assert.equal(flow.nodes.a.outgoing.length,2);
assert(Flow.offset(flow.branches.V1,1)>0);assert(Flow.offset(flow.branches.R1,1)<0);
for(const node of Object.values(flow.nodes))near(node.totalIn,node.totalOut);
// Changing a resistor's reference reverses its sign, not its physical flow.
const reversed=structuredClone(circuit);[reversed.parts[1].a,reversed.parts[1].b]=[reversed.parts[1].b,reversed.parts[1].a];flow=Flow.analyze(reversed,Solver.solve(reversed));assert.equal(flow.branches.R1.direction,-1);assert.equal(flow.branches.R1.from,'a');assert.equal(flow.branches.R1.to,'g');
// No movement in zero-current branches, open switches, or unsolved networks.
circuit.parts[0].value=0;flow=Flow.analyze(circuit,Solver.solve(circuit));assert.equal(flow.active,0);
assert.equal(Flow.analyze(circuit,{ok:false}).active,0);
const switched={ground:'g',nodes:['g','a','b'].map(id=>({id,name:id,x:100,y:100})),parts:[{id:'V1',kind:'V',a:'a',b:'g',value:12},{id:'R1',kind:'R',a:'a',b:'b',value:1000},{id:'S1',kind:'S',a:'b',b:'g',value:0,closed:false}]};
result=Solver.solve(switched);assert(result.ok);assert.equal(Flow.analyze(switched,result).active,0);
const longOpen=structuredClone(switched);longOpen.nodes.push({id:'c',name:'c',x:100,y:200});longOpen.parts[2].a='c';longOpen.parts.push({id:'R2',kind:'R',a:'b',b:'c',value:2000});
assert.equal(Flow.analyze(longOpen,Solver.solve(longOpen)).active,0);
switched.parts[2].closed=true;flow=Flow.analyze(switched,Solver.solve(switched));assert.equal(flow.active,3);assert.equal(flow.branches.S1.direction,1);
// A uniformly tiny current remains visible; negligible round-off does not.
circuit.parts[0].value=1e-12;flow=Flow.analyze(circuit,Solver.solve(circuit));assert.equal(flow.active,3);near(flow.branches.R1.ratio/flow.branches.R2.ratio,2);
flow=Flow.analyze(circuit,{ok:true,branches:{V1:{current:-.01},R1:{current:.01},R2:{current:1e-18}}});assert.equal(flow.branches.R2.direction,0);
console.log('Current flow passed: physical direction, reference reversal, proportional speed, junction balance, zero current, open/closed switches, invalid circuits and tiny currents.');
