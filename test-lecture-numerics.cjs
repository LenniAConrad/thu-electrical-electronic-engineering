/* Reconstruct lecture examples from branch connections, independently of the prose and SVGs. */
const assert=require('node:assert/strict');
const close=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
function linear(A,b){A=A.map((r,i)=>[...r,b[i]]);for(let k=0;k<b.length;k++){let p=k;for(let i=k+1;i<b.length;i++)if(Math.abs(A[i][k])>Math.abs(A[p][k]))p=i;[A[k],A[p]]=[A[p],A[k]];assert.ok(Math.abs(A[k][k])>1e-12);const pivot=A[k][k];for(let j=k;j<=b.length;j++)A[k][j]/=pivot;for(let i=0;i<b.length;i++)if(i!==k){const f=A[i][k];for(let j=k;j<=b.length;j++)A[i][j]-=f*A[k][j];}}return A.map(r=>r[b.length]);}
function nodes(n,resistors,known={},injections=[]){const A=Array.from({length:n},()=>Array(n).fill(0)),b=Array(n).fill(0);for(const [a,c,r] of resistors){for(const [i,j] of [[a,c],[c,a]])if(Number.isInteger(i)){A[i][i]+=1/r;if(Number.isInteger(j))A[i][j]-=1/r;else b[i]+=(known[j]||0)/r;}}for(const [i,current] of injections)b[i]+=current;return linear(A,b);}
// Source transformations: two nodes, five resistors, three independent sources.
let v=nodes(2,[[0,'u1',2],[0,'g',4],[0,'u3',4],[0,1,5],[1,'g',4]],{u1:12,u3:16},[[1,3]]);close(v[0],10.2);close(v[1],11.2);close((v[0]-v[1])/5,-.2);
// Bridge: original loaded network, independent of its Thevenin reduction.
v=nodes(2,[[0,'s',20],[0,'g',30],[1,'s',30],[1,'g',20],[0,1,6]],{s:15});close((v[0]-v[1])/6,.1);
// Independent source with reversed voltage-source polarity.
v=nodes(1,[[0,'s',1],[0,'g',2]],{s:-2},[[0,.5]]);close(v[0],-1);close((v[0]+2),1);close(v[0]/2,-.5);close(-v[0]*.5,.5);
// Superposition and fixed source potentials.
v=nodes(1,[[0,'s',3],[0,'g',2]],{s:10},[[0,10]]);close((10-v[0])/3,-2);
v=nodes(1,[[0,'p',3],[0,'n',6]],{p:12,n:-6});close(v[0],6);
// Nodal two-source worked system: account for both branches between the unknown nodes.
v=linear([[3,-2],[-2,3]],[-4,9]);close(v[0],1.2);close(v[1],3.8);
// Four mesh examples, including controlled sources.
close((4-4*2+6*3)/(1+4+6),14/11);
close(25/(10+12*(-5/12))-5,0);
v=linear([[5,-2],[-2,7]],[1,12]);close(v[0],1);close(v[1],2);
v=linear([[4, -2, 3],[-2,5,-3],[1,0,1]],[4.2,0,4.2]);close(v[1],3);
// Controlled nodal example, derive equations by currents at a and b.
// Unknowns [Va,Vb,U,I], Vc=10. KCL plus the two defining control equations.
v=linear([[2,-.5,2,2],[-.5,1,-2,0],[1,-1,1,0],[0,-.5,0,1]],[13,7,4,-5]);
close(v[0],14);close(v[1],6);close(v[2],-4);close(v[3],-2);
// Seven-resistor ladder: three series resistors, three 1-ohm shunts, one 2-ohm output.
v=nodes(3,[[0,'s',1],[0,1,1],[1,2,1],[0,'g',1],[1,'g',1],[2,'g',1],[2,'g',2]],{s:51});close(v[2]/2,1.5);
// Laboratory 1: theoretical measurements and maximum-power point.
v=nodes(1,[[0,'s',1000],[0,'g',4700],[0,'g',2000]],{s:5});close(v[0],2.919254658385093,1e-9);
const base=nodes(1,[[0,'s',1000],[0,'g',4700]],{s:5},[[0,.001]])[0];const rth=2000+1/(1/1000+1/4700);close(base,4.947368421052632);close(rth,2824.561403508772);
const loaded=nodes(2,[[0,'s',1000],[0,'g',4700],[0,1,2000],[1,'g',rth]],{s:5},[[0,.001]]);close(loaded[1],base/2);
// Complex arithmetic derived from real/imaginary components.
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],div=(a,b)=>mul(a,[b[0]/(b[0]**2+b[1]**2),-b[1]/(b[0]**2+b[1]**2)]);
const one=[1,0];
// The selected AC network excludes the voltage source and includes the current source.
const y=add(div(one,[0,10]),div(one,[5,-5]));const va=div(add(div([50,0],[0,10]),[0,10]),y);close(va[0],0);close(va[1],50);
const current=div([50-va[0],-va[1]],[0,10]);close(current[0],-5);close(current[1],-5);const power=mul([50,0],[current[0],-current[1]]);close(power[0],-250);close(power[1],250);
// Frequency selection: reject third harmonic, cancel fundamental reactance.
const L=.12,w=314,c1=1/(9*w*w*L),c2=8/(9*w*w*L);close(3*w*c1-1/(3*w*L),0);close(w*L/(1-w*w*L*c1)-1/(w*c2),0);
// All-pass bridge: constant half magnitude, endpoint phase, and a quarter turn at x=1.
for(const x of [0,.1,1,10,1e5]){const h=div([-1,x],[2,2*x]);close(Math.hypot(...h),.5);}const h=div([-1,1],[2,2]);close(h[0],0);close(h[1],.5);
// Two-source laboratory is weighted by conductance, not a direct voltage sum.
const den=1/2000+1/4700+1/10000;for(const deg of [0,60,120,180]){const b=2.5/Math.sqrt(2),v2=[b*Math.cos(deg*Math.PI/180),b*Math.sin(deg*Math.PI/180)],out=add([5/Math.sqrt(2)/2000/den,0],v2.map(x=>x/4700/den));assert.ok(Math.hypot(...out)<5/Math.sqrt(2));}
console.log('PASS: independent source, bridge, superposition, nodal, mesh, controlled-source, ladder, laboratory, AC-power, filter and phase-shifter calculations.');
