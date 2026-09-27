/* Conventional current follows the solved signed branch current, not the reference arrow.
   A shared linear scale keeps visual dot flux proportional to branch current. */
const CircuitFlow=(()=>{
  function analyze(circuit,result){
    const branches=Object.create(null),nodes=Object.create(null);
    circuit.nodes.forEach(n=>nodes[n.id]={incoming:[],outgoing:[],totalIn:0,totalOut:0});
    if(!result?.ok)return {ok:false,max:0,active:0,branches,nodes};
    const rawMax=Math.max(0,...circuit.parts.map(p=>Math.abs(result.branches[p.id].current)));
    const voltageScale=Math.max(0,...Object.values(result.voltages||{}).map(Math.abs),...circuit.parts.filter(p=>p.kind==='V').map(p=>Math.abs(p.value)));
    const reference=Math.max(rawMax,...circuit.parts.map(p=>p.kind==='R'?voltageScale/p.value:p.kind==='I'?Math.abs(p.value):0));
    // A zero-current open circuit can have round-off in V_a − V_b. Do not amplify
    // that residue into a full-speed animation. This tolerance scales with the givens.
    const threshold=Math.max(rawMax*1e-10,reference*Number.EPSILON*32*(circuit.nodes.length+circuit.parts.length));
    const max=rawMax>threshold?rawMax:0;
    let active=0;
    for(const p of circuit.parts){
      const current=result.branches[p.id].current,magnitude=Math.abs(current);
      // Suppress only relative round-off, so uniformly tiny currents can still be seen.
      const moving=max>0&&magnitude>threshold&&!(p.kind==='S'&&!p.closed);
      const direction=moving?Math.sign(current):0,from=direction<0?p.b:p.a,to=direction<0?p.a:p.b;
      branches[p.id]={id:p.id,current,magnitude,direction,from,to,ratio:moving?magnitude/max:0};
      if(moving){
        active++;nodes[from].outgoing.push(branches[p.id]);nodes[to].incoming.push(branches[p.id]);
        nodes[from].totalOut+=magnitude;nodes[to].totalIn+=magnitude;
      }
    }
    return {ok:true,max,active,branches,nodes};
  }
  const offset=(branch,time)=>-branch.direction*branch.ratio*time*100;
  return {analyze,offset};
})();
if(typeof module!=='undefined')module.exports=CircuitFlow;
