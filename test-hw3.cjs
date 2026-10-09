const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({});
for(const file of ['circuits.js','circuit-solver.js','checker.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
vm.runInContext(fs.readFileSync('hw3.js','utf8').split('\n(()=>{')[0]+';globalThis.api={HW3,CircuitSolver,Checker}',ctx);
const {HW3,CircuitSolver,Checker}=ctx.api;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function solve(parts){const ids=[...new Set(parts.flatMap(p=>[p.a,p.b]))];const r=CircuitSolver.solve({nodes:ids.map(id=>({id,name:id,x:0,y:0})),ground:'g',parts});assert.ok(r.ok,r.message);return r;}
const part=(id,kind,a,b,value)=>({id,kind,a,b,value});
// Reconstruct the three official DC diagrams independently of the displayed steps.
const a=solve([
 part('R1','R','a','l',6),part('R2','R','a','r',3),part('R3','R','l','g',12),part('R4','R','r','g',24),part('E','V','l','r',36),
 part('zero','V','a','b',0),part('R5','R','b','v24',4),part('V24','V','v24','g',24),part('R6','R','b','v4',4),part('V4','V','g','v4',4),part('R7','R','b','i',4),part('I2','I','i','g',2)]);
near(a.branches.zero.current,-1.5);near(a.voltages.a,3);near(a.voltages.b,3);
const bparts=[part('R1','R','n','v33',6),part('V33','V','v33','g',33),part('R2','R','n','g',3),part('I5','I','g','n',5),part('R3','R','n','vs',8),part('Vs','V','vs','g',6)];
near(solve(bparts).branches.R3.current,1.5);near(solve([...bparts,part('load','R','n','g',2)]).branches.load.current,5);
const cparts=[part('V12','V','v12','g',12),part('Rleft','R','v12','g',5),part('R2','R','v12','a',2),part('R1','R','a','b',1),part('R3','R','b','c',3),part('R6','R','b','g',6),part('R5','R','c','g',5),part('I5','I','a','c',5),part('I2','I','b','a',2)];
near(solve(cparts).voltages.c,12.5);const loaded=solve([...cparts,part('load','R','c','g',2.5)]);near(loaded.branches.load.power,15.625);
const passive=cparts.filter(p=>p.kind!=='I').map(p=>p.kind==='V'?{...p,value:0}:p);near(solve([...passive,part('test','I','g','c',1)]).voltages.c,2.5);
function answers(id){return Object.fromEntries(HW3.problems.find(p=>p.id===id).fields.map(f=>[f.key,f.answer]));}
let v=answers('p23');near(1/(50*v.c*1e-6),100);near(50*v.l,100);near(v.pc,30+90);near(v.pl,30-90);near(v.ic/Math.SQRT2,1);
v=answers('p24');const ph=(mag,deg)=>[mag*Math.cos(deg*Math.PI/180),mag*Math.sin(deg*Math.PI/180)],ur=ph(v.ur,v.pr),uc=ph(v.uc,v.pc);near(ur[0]+uc[0],10);near(ur[1]+uc[1],0);near(v.ur/(v.i/1000),20000);near(v.uc/(v.i/1000),1/(1000*Math.PI*1e-8));
v=answers('p25');near(v.r,50);near(1000*v.l/1000,50);near((v.up/Math.SQRT2)*Math.cos((v.pu+30)*Math.PI/180),50);
assert.equal(Checker.check({answer:200,unit:'μF'},'0.0002 F').ok,true);assert.equal(Checker.check({answer:50,unit:'mH'},'0.05 H').ok,true);
const MathView=require('./math-render.js'),katex=require('./assets/katex/katex.min.js');
for(const text of ['-I_I1 + (V_A - V_B) / 2000 = 0','V_A = [V_B / 2000 - (I_I1)] / (1 / 2000)','V_A_B - V_long-name = 0 V','I = -1.5e-6 A'])assert.doesNotThrow(()=>katex.renderToString(MathView.plain(text),{throwOnError:true}));
assert.ok(MathView.plain('(V_A - V_B) / 2000').replaceAll(' ','').includes('\\frac{V_{\\mathrm{A}}-V_{\\mathrm{B}}}{2000}'));
console.log('HW03 verified independently: source/switch circuits, maximum power, AC KVL and power, units and equation rendering.');
