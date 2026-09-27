/* Linear DC modified nodal analysis. I is positive from terminal a to terminal b.
   Voltage sources, wires and closed switches add voltage constraints and unknown currents. */
const CircuitSolver=(()=>{
  const kinds=['R','V','I','W','S'];
  function validate(c){
    if(!c||!Array.isArray(c.nodes)||!Array.isArray(c.parts)||c.nodes.length>24||c.parts.length>48)throw Error('Use up to 24 junctions and 48 components.');
    const ids=new Set(),names=new Set();
    for(const n of c.nodes){if(typeof n.id!=='string'||typeof n.name!=='string'||!/^[a-zA-Z0-9_-]{1,20}$/.test(n.id)||ids.has(n.id)||! /^[a-zA-Z0-9_-]{1,12}$/.test(n.name)||names.has(n.name)||!Number.isFinite(n.x)||!Number.isFinite(n.y))throw Error('Junction names and IDs must be unique.');ids.add(n.id);names.add(n.name);}
    const partIds=new Set();
    for(const p of c.parts){
      if(typeof p.id!=='string'||!/^[a-zA-Z0-9_-]{1,20}$/.test(p.id)||partIds.has(p.id)||!kinds.includes(p.kind)||!ids.has(p.a)||!ids.has(p.b)||p.a===p.b)throw Error('Each component needs two different existing junctions.');
      if(!Number.isFinite(p.value)||(p.kind==='R'&&(p.value<1e-6||p.value>1e9))||(p.kind==='V'&&Math.abs(p.value)>1e6)||(p.kind==='I'&&Math.abs(p.value)>1e3))throw Error('Use R from 1 µΩ to 1 GΩ, voltage within ±1 MV, and current within ±1 kA.');
      if(p.kind==='S'&&typeof p.closed!=='boolean')throw Error('A switch must be open or closed.');
      partIds.add(p.id);
    }
    if(c.ground!==null&&!ids.has(c.ground))throw Error('Select an existing junction as ground.');
    return true;
  }
  function linear(A,b){
    const n=b.length;if(!n)return [];
    // Equilibrate rows and columns before elimination; voltages and currents have different scales.
    const rows=A.map(r=>Math.max(...r.map(Math.abs))||1),m=A.map((r,i)=>r.map(v=>v/rows[i]));
    const cols=Array.from({length:n},(_,j)=>Math.max(...m.map(r=>Math.abs(r[j])))||1);
    const a=m.map((r,i)=>[...r.map((v,j)=>v/cols[j]),b[i]/rows[i]]);let row=0;const pivots=[];
    for(let col=0;col<n&&row<n;col++){
      let pivot=row;for(let i=row+1;i<n;i++)if(Math.abs(a[i][col])>Math.abs(a[pivot][col]))pivot=i;
      if(Math.abs(a[pivot][col])<1e-12)continue;
      [a[row],a[pivot]]=[a[pivot],a[row]];const d=a[row][col];for(let j=col;j<=n;j++)a[row][j]/=d;
      for(let i=0;i<n;i++)if(i!==row){const f=a[i][col];for(let j=col;j<=n;j++)a[i][j]-=f*a[row][j];}
      pivots.push(col);row++;
    }
    if(row<n){
      const scale=Math.max(1,...a.map(r=>Math.abs(r[n])));
      if(a.slice(row).some(r=>Math.abs(r[n])>1e-9*scale))throw Error('Conflicting ideal sources or a forced current with no return path. Check source polarities, short circuits and open branches.');
      throw Error('No unique solution. Check floating junctions, parallel ideal voltage sources, or a loop made only of wires / closed switches.');
    }
    const x=Array(n).fill(0);pivots.forEach((col,i)=>x[col]=a[i][n]/cols[col]);
    if(x.some(v=>!Number.isFinite(v)))throw Error('The values are too extreme for a reliable solution.');
    // Near-zero branch currents can retain elimination roundoff even when every
    // source constraint is satisfied. Bound that error in the equilibrated system.
    const roundoff=128*Number.EPSILON*n*Math.max(1e-12,...x.map((v,j)=>Math.abs(v*cols[j])));
    for(let i=0;i<n;i++){
      const terms=A[i].map((v,j)=>v*x[j]),err=Math.abs(terms.reduce((s,v)=>s+v,0)-b[i]);
      if(err>roundoff*rows[i]+1e-7*Math.max(1e-9,Math.abs(b[i]),terms.reduce((s,v)=>s+Math.abs(v),0)))throw Error('The values are too extreme for a reliable solution.');
    }
    return x;
  }
  function solve(c){
    try{
      validate(c);
      if(!c.nodes.length||!c.parts.length)return {ok:false,message:'Add junctions and connect components to build a circuit.'};
      if(!c.ground)return {ok:false,message:'Choose Ground, then click a junction to set the 0 V reference.'};
      const nodes=c.nodes.filter(n=>n.id!==c.ground),constraints=c.parts.filter(p=>p.kind==='V'||p.kind==='W'||(p.kind==='S'&&p.closed));
      const size=nodes.length+constraints.length,A=Array.from({length:size},()=>Array(size).fill(0)),b=Array(size).fill(0),idx=id=>nodes.findIndex(n=>n.id===id);
      const add=(i,j,v)=>{if(i>=0&&j>=0)A[i][j]+=v;},rhs=(i,v)=>{if(i>=0)b[i]+=v;};
      c.parts.forEach(p=>{
        const x=idx(p.a),y=idx(p.b);
        if(p.kind==='R'){const g=1/p.value;add(x,x,g);add(y,y,g);add(x,y,-g);add(y,x,-g);}
        if(p.kind==='I'){rhs(x,-p.value);rhs(y,p.value);}
        const k=constraints.indexOf(p);if(k>=0){const z=nodes.length+k;add(x,z,1);add(y,z,-1);add(z,x,1);add(z,y,-1);rhs(z,p.kind==='V'?p.value:0);}
      });
      const solution=linear(A,b),voltages=Object.create(null);voltages[c.ground]=0;nodes.forEach((n,i)=>voltages[n.id]=solution[i]);
      const branches=Object.create(null);c.parts.forEach(p=>{
        const voltage=voltages[p.a]-voltages[p.b];let current=0;
        if(p.kind==='R')current=voltage/p.value;else if(p.kind==='I')current=p.value;else if(constraints.includes(p))current=solution[nodes.length+constraints.indexOf(p)];
        branches[p.id]={voltage,current,power:voltage*current};
      });
      const kcl=Object.create(null);c.nodes.forEach(n=>kcl[n.id]=c.parts.reduce((sum,p)=>sum+(p.a===n.id?1:p.b===n.id?-1:0)*branches[p.id].current,0));
      return {ok:true,voltages,branches,kcl,power:c.parts.reduce((s,p)=>s+branches[p.id].power,0)};
    }catch(e){return {ok:false,message:e.message};}
  }
  const num=v=>v===0?'0':Number(v.toPrecision(6)).toString().replaceAll('-','−');
  function quantity(v,unit){
    if(v===0)return '0 '+unit;
    if(Math.abs(v)<1e-9)return num(v)+' '+unit;
    const a=Math.abs(v),scale=a>=1e6?[1e6,'M']:a>=1e3?[1e3,'k']:a>=1?[1,'']:a>=1e-3?[1e-3,'m']:a>=1e-6?[1e-6,'µ']:[1e-9,'n'];
    return num(v/scale[0])+' '+scale[1]+unit;
  }
  function nodeTerms(c,id){
    const name=n=>'V_'+c.nodes.find(x=>x.id===n).name;
    return c.parts.filter(p=>p.a===id||p.b===id).map(p=>{
      const sign=p.a===id?1:-1,other=p.a===id?p.b:p.a;
      let term=p.kind==='R'?`(${name(id)} − ${name(other)}) / ${num(p.value)}`:p.kind==='S'&&!p.closed?'0':`${sign<0?'−':''}I_${p.id}`;
      return {id:p.id,sign,term};
    });
  }
  return {solve,validate,num,quantity,nodeTerms};
})();
if(typeof module!=='undefined')module.exports=CircuitSolver;
