/* Deterministic, constrained practice families. Official questions are never mutated. */
const PracticeModels=(()=>{
  const clone=x=>JSON.parse(JSON.stringify(x));
  const fmt=x=>Number(x.toFixed(3)).toString();
  const n=(key,label,answer,unit='V')=>({key,label,answer,unit,type:'number'});
  const eq=(key,label,answer)=>({key,label,answer,type:'equation'});
  const rng=seed=>{let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}};
  function build(id,seed=null){
    const base=Questions.find(q=>q.id===id);if(!base)throw Error('Unknown exercise');
    const q=clone(base),random=seed!==null,r=rng(seed||1),pick=a=>a[Math.floor(r()*a.length)],int=(a,b)=>a+Math.floor(r()*(b-a+1));
    const p={},labels={},steps=[];q.random=random;q.seed=seed;q.params=p;
    const set=(key,value)=>{const f=q.fields.find(f=>f.key===key);if(!f)throw Error('Unknown answer '+key);f.answer=value;};
    const get=key=>clone(q.fields.find(f=>f.key===key));
    const step=(title,fields,scene='original',prompt='',pins=[])=>steps.push({title,fields,scene,prompt,pins});
    const final=(title='Finish',keys=q.fields.map(f=>f.key),scene='original',pins=[])=>step(title,keys.map(get),scene,'',pins);
    const pin=(key,x,y,label)=>({key,x,y,label});
    const replace=(from,to)=>labels[from]=to;
    if(id==='h1-1'){
      Object.assign(p,random?{j1:int(1,4),j2:int(1,4),mid:pick([1,1.5,2,2.5,3]),r1:int(2,6),r2:int(2,6),v:int(2,12)}:{j1:1,j2:2,mid:1.5,r1:3,r2:2,v:3});
      p.out=p.mid+p.j2;p.total=p.mid+p.j1;p.u1=p.mid*p.r1;p.u2=p.out*p.r2;p.u=p.v+p.u1+p.u2;
      for(const [a,b] of [['1 A',p.j1+' A'],['2 A',p.j2+' A'],['3.5 A',p.out+' A'],['3 Ω',p.r1+' Ω'],['2 Ω',p.r2+' Ω'],['3 V',p.v+' V']])replace(a,b);
      set('i',p.total);set('u',p.u);
      step('Right junction',[n('mid','Current through the top resistor',p.mid,'A')],'original','Find the left-to-right current in the top resistor.',[pin('mid',360,85,'i')]);
      final('Left junction',['i'],'original',[pin('i',95,180,'I')]);
      step('Resistor voltage drops',[n('drop1','Drop across the top resistor',p.u1),n('drop2','Drop toward B',p.u2)],'original','Use the currents you found to calculate each voltage drop.',[pin('drop1',325,85,'U₁'),pin('drop2',510,160,'U₂')]);
      final('A to B',['u'],'original',[pin('u',350,290,'UAB')]);
      q.solution=`i = ${p.out} − ${p.j2} = ${p.mid} A; I = ${p.mid} + ${p.j1} = ${p.total} A.<br>UAB = ${p.v} + ${p.r1} × ${p.mid} + ${p.r2} × ${p.out} = ${p.u} V.`;
    }else if(id==='h1-2'){
      p.r=random?pick([2,3,4,5]):2;p.i=random?int(2,6):5;p.v=p.r*p.i;
      p.curveOrder=[0,1,2,3];
      if(random)for(let i=3;i>0;i--){const j=int(0,i);[p.curveOrder[i],p.curveOrder[j]]=[p.curveOrder[j],p.curveOrder[i]];}
      const letters=[1,2,3,0].map(shape=>'efgh'[p.curveOrder.indexOf(shape)]);
      letters.forEach((letter,i)=>set('c'+i,letter));
      replace('2 Ω',p.r+' Ω');replace('10 V',p.v+' V');replace('5 A',p.i+' A');replace('10',String(p.v));replace('5',String(p.i));replace('−5','−'+p.i);
      ['a','b','c','d'].forEach((c,i)=>final('Circuit ('+c+')',['c'+i],'characteristic-'+i));
      q.solution=`(a) U = ${p.v} − ${p.r}I → ${letters[0]}.<br>(b) I = ${p.i} A → ${letters[1]}.<br>(c) U = ${p.v} + ${p.r}I → ${letters[2]}.<br>(d) U = ${p.v} V → ${letters[3]}.`;
    }else if(id==='h1-3'){
      p.a=random?pick([3,6,9]):3;p.b=random?pick([2,4,6]):3;p.is=random?6*int(1,5):12;
      p.ru=2*p.a/3;p.rd=p.b/2;p.ul=p.is*2/3;p.ur=p.is/3;p.low=p.is/2;p.i=p.ul-p.low;
      replace('12 A',p.is+' A');replace('R₁ = 3 Ω','R₁ = '+p.a+' Ω');replace('R₃ = 6 Ω','R₃ = '+2*p.a+' Ω');replace('R₂ = 3 Ω','R₂ = '+p.b+' Ω');replace('R₄ = 3 Ω','R₄ = '+p.b+' Ω');
      if(random){
        const choices=[p.is/4,p.i,p.is/2,p.is];
        for(let i=3;i>0;i--){const j=int(0,i);[choices[i],choices[j]]=[choices[j],choices[i]];}
        q.fields[0].answer=String(p.i);q.fields[0].options=choices.map((v,i)=>[String(v),'ABCD'[i]+' · '+v+' A']);
        q.statement='In the circuit shown in the diagram, the current I is '+choices.map((v,i)=>'('+'ABCD'[i]+') '+v+' A').join(' ')+'.';
      }
      step('Reduce the parallel pairs',[n('rup','Upper equivalent resistance',p.ru,'Ω'),n('rdown','Lower equivalent resistance',p.rd,'Ω')],'bridge-equivalent',`Upper pair: ${p.a} Ω and ${2*p.a} Ω. Lower pair: ${p.b} Ω and ${p.b} Ω. The source supplies ${p.is} A.`,[pin('rup',430,110,'Rup'),pin('rdown',430,245,'Rdown')]);
      step('Current division',[n('upperleft','Upper-left current',p.ul,'A'),n('upperright','Upper-right current',p.ur,'A'),n('lower','Each lower current',p.low,'A')],'original','Determine the currents meeting the midpoint wire.',[pin('upperleft',325,115,'I₁'),pin('upperright',530,115,'I₃'),pin('lower',325,235,'I₂')]);
      final('Bridge current');q.solution=`Upper currents: ${fmt(p.ul)} A and ${fmt(p.ur)} A. Each lower branch carries ${fmt(p.low)} A.<br>I = ${fmt(p.ul)} − ${fmt(p.low)} = ${fmt(p.i)} A.`;
    }else if(id==='h1-4'){
      p.i2=random?int(3,9):5;p.i3=random?int(2,5):3;p.i4=random?pick([-2,-1,1,2]):-1;p.i1=p.i2+p.i3;
      // With positive passive resistors, both outgoing bridge branches must conduct rightward.
      if(random&&p.i3+p.i4<=0)p.i4=-1;
      set('i3',p.i3);set('i5',p.i2-p.i4);set('i6',p.i3+p.i4);set('i7',p.i1);
      if(random)q.statement=base.statement.replace(/8 A|5 A|−1 A/g,value=>({'8 A':p.i1+' A','5 A':p.i2+' A','−1 A':String(p.i4).replace('-','−')+' A'})[value]);
      [['i3',270,235],['i5',455,65],['i6',455,235],['i7',105,315]].forEach(([key,x,y])=>final('Find '+get(key).label,[key],'original',[pin(key,x,y,get(key).label)]));
      q.solution=`I₃ = I₁ − I₂ = ${p.i3} A; I₅ = I₂ − I₄ = ${p.i2-p.i4} A; I₆ = I₃ + I₄ = ${p.i3+p.i4} A; I₇ = I₅ + I₆ = ${p.i1} A.`;
    }else if(/^h1-[56]/.test(id)){
      const voltage=id[3]==='5',part='abcd'.indexOf(id.at(-1));p.conversion=voltage?'norton':'thevenin';p.part=part;
      if(voltage){
        const rs=[2,3,2,0],vs=[10,6,5,5];p.r=random&&part<3?pick([2,3,4,5,6]):rs[part];p.v=random?(part<3?p.r*pick([1,1.5,2,3,4]):int(3,12)):vs[part];p.sign=part===1?-1:1;
        replace(vs[part]+' V',p.v+' V');if(part<3)replace(rs[part]+' Ω',p.r+' Ω');
        // In (b) there is only one resistor; in (c), don't overwrite its independent 3 Ω shunt.
        if(part===2&&p.r!==2){labels['2 Ω']=p.r+' Ω';delete labels['3 Ω'];}
        if(part<3){set('in',p.v/p.r);set('r',p.r);step('Open-circuit voltage',[n('voc','Va − Vb',p.sign*p.v)],'original','Find the signed voltage between the open terminals.',[pin('voc',440,55,'a')]);final('Draw the Norton equivalent',undefined,'norton',[pin('in',180,160,'IN'),pin('r',350,160,'RN')]);}
        else final('Can it be converted?');
        q.solution=part<3?`Va − Vb = ${p.sign*p.v} V. IN = |Uoc| / R = ${fmt(p.v/p.r)} A, ${p.sign>0?'upward':'downward'}, with ${p.r} Ω in parallel.`:base.solution.replaceAll('5 V',p.v+' V').replace('5 / 0',p.v+' / 0');
      }else{
        const rs=[5,10,2,Infinity];p.r=random&&part<3?pick([2,3,4,5,6,8]):rs[part];p.i=random?int(1,6):5;p.sign=part===1||part===3?1:-1;
        replace('5 A',p.i+' A');if(part<3)replace(rs[part]+' Ω',p.r+' Ω');
        if(part<3){set('v',p.i*p.r);set('r',p.r);step('Open-circuit voltage',[n('voc','Va − Vb',p.sign*p.i*p.r)],'original','Find the terminal voltage with no external load.',[pin('voc',440,55,'a')]);final('Draw the Thévenin equivalent',undefined,'thevenin',[pin('v',150,180,'Vth'),pin('r',330,65,'Rth')]);}
        else final('Can it be converted?');
        q.solution=part<3?`Va − Vb = ${p.sign*p.i*p.r} V. The equivalent voltage source has magnitude ${p.i*p.r} V, positive at ${p.sign>0?'a':'b'}, and ${p.r} Ω in series.`:base.solution;
      }
    }else if(id==='h1-7'){
      p.r=random?pick([1,2,4]):1;p.in=random?int(1,4):1;p.is=random?int(1,4):1;p.v=2*p.r*p.in;p.total=p.in+p.is;p.req=p.r/4;p.u=p.total*p.req;p.i=p.u/(p.r/2);
      replace('2 V',p.v+' V');replace('1 mA',p.is+' mA');replace('2 kΩ',2*p.r+' kΩ');replace('1 kΩ',p.r+' kΩ');replace('0.5 kΩ',p.r/2+' kΩ');set('i',p.i);
      step('Convert the voltage branch',[n('converted','Converted source current',p.in,'mA')],'conversion-branch',`Convert the ${p.v} V source in series with ${2*p.r} kΩ to a parallel current-source model.`,[pin('converted',180,180,'IN')]);
      step('Combine the sources and resistors',[n('total','Total upward current',p.total,'mA'),n('req','Equivalent parallel resistance',p.req,'kΩ')],'combined-norton',`Combine the converted source with ${p.is} mA. The four parallel resistances are ${2*p.r}, ${2*p.r}, ${p.r} and ${p.r/2} kΩ.`,[pin('total',180,180,'Ieq'),pin('req',350,180,'Req')]);
      step('Common voltage',[n('voltage','Voltage across the parallel network',p.u)],'combined-norton','Use the total current and equivalent resistance.',[pin('voltage',470,65,'U')]);
      final('Load current',['i'],'original',[pin('i',580,140,'I')]);q.solution=`IN = ${p.v}/${2*p.r} = ${p.in} mA. Ieq = ${p.total} mA, Req = ${p.req} kΩ.<br>U = ${p.u} V; I = ${p.u}/${p.r/2} = ${p.i} mA.`;
    }else if(id==='h1-8'){
      Object.assign(p,random?{va:5*int(1,4),vb:5*int(2,6),vc:-5*int(1,4),vd:5*int(1,3),rt:pick([5,10]),rr:pick([5,10]),rb:pick([5,10]),rl:pick([5,10])}:{va:5,vb:20,vc:-10,vd:2,rt:50,rr:10,rb:10,rl:300});
      p.i1=(p.va-p.vb)/p.rt;p.i2=(p.vb-p.vc)/p.rr;p.i3=(p.vd-p.vc)/p.rb;p.i4=(p.va-p.vd)/p.rl;
      replace('5 V',p.va+' V');replace('20 V',p.vb+' V');replace('10 V',-p.vc+' V');replace('2 V',p.vd+' V');replace('50 Ω',p.rt+' Ω');replace('10 Ω',[p.rr+' Ω',p.rb+' Ω']);replace('300 Ω',p.rl+' Ω');
      [p.i1+p.i4,p.i2-p.i1,-p.i2-p.i3,p.i3-p.i4].forEach((v,i)=>set('is'+(i+1),v));
      step('Corner potentials',['a','b','c','d'].map(c=>n('v'+c,'V'+c.toUpperCase(),p['v'+c])),'original','Set the center O to 0 V. Use each source polarity.',[pin('va',140,55,'A'),pin('vb',535,55,'B'),pin('vc',535,345,'C'),pin('vd',140,345,'D')]);
      step('Outer resistor currents',[1,2,3,4].map(i=>n('outer'+i,'I'+i,p['i'+i],'A')),'original','Apply Ohm’s law to each outer resistor. Follow its reference arrow.',[pin('outer1',330,55,'I₁'),pin('outer2',535,200,'I₂'),pin('outer3',330,345,'I₃'),pin('outer4',140,200,'I₄')]);
      final('Source currents');q.solution=`Corner voltages: ${p.va}, ${p.vb}, ${p.vc}, ${p.vd} V.<br>Outer currents: ${[p.i1,p.i2,p.i3,p.i4].map(fmt).join(', ')} A.<br>Apply KCL at each corner to find the four outward source currents.`;
    }else if(id==='h2-1'){
      p.r=random?2*int(1,5):4;p.v=random?6*int(2,6):12;p.load=2*p.r;p.r1=p.r/2;p.r2=p.r;p.u1=p.v/3;p.u2=p.v/2;
      set('vth',p.v);set('rth',p.r);set('u',2*p.v/3);q.fields.find(f=>f.key==='u').label=`U when R = ${p.load} kΩ`;
      if(random)q.statement=base.statement.replace('8 kΩ',p.load+' kΩ');
      q.extra=`<table class="small-table"><tr><th>R</th><th>U</th></tr><tr><td>${p.r1} kΩ</td><td>${p.u1} V</td></tr><tr><td>${p.r2} kΩ</td><td>${p.u2} V</td></tr></table>`;
      final('Find the hidden source',['vth','rth'],'thevenin',[pin('vth',150,180,'Vth'),pin('rth',330,65,'Rth')]);final('Connect the new load',['u'],'loaded-thevenin',[pin('u',510,175,'U')]);
      q.solution=`U = Vth R/(Rth + R). The two measurements give Vth = ${p.v} V and Rth = ${p.r} kΩ. With ${p.load} kΩ connected, U = ${fmt(2*p.v/3)} V.`;
    }else if(id==='h2-2'){
      const a=random?int(1,3):1,d=random?int(1,3):1,c=random?int(1,4):2;p.r1=2*a;p.r3=4*a;p.v=2*a*c;p.is=10*d-c;p.vth=10*a*d;p.rth=5*a;p.power=p.vth*p.vth/(4*p.rth);
      replace('8 mA',p.is+' mA');replace('4 V',p.v+' V');replace('R₁ = 2 kΩ','R₁ = '+p.r1+' kΩ');replace('R₂ = 2 kΩ','R₂ = '+p.r1+' kΩ');replace('R₃ = 4 kΩ','R₃ = '+p.r3+' kΩ');set('r',p.rth);set('p',p.power);
      if(random)q.statement=base.statement.replace(/8 mA|4 V|2 kΩ|4 kΩ/g,value=>({'8 mA':p.is+' mA','4 V':p.v+' V','2 kΩ':p.r1+' kΩ','4 kΩ':p.r3+' kΩ'})[value]);
      step('Remove the load',[n('vth','Open-circuit voltage',p.vth)],'power-open','With the load removed, no current flows through R₃.',[pin('vth',560,70,'Vth')]);
      step('Deactivate the sources',[n('rth','Resistance seen from the load',p.rth,'kΩ')],'power-off','Open the current source and short the voltage source.',[pin('rth',560,70,'Rth')]);
      final('Match the load',undefined,'loaded-thevenin',[pin('r',510,175,'R')]);q.solution=`Vth = (${p.v} + ${p.is} × ${p.r1})/2 = ${p.vth} V. Rth = ${p.r3} + ${p.r1}/2 = ${p.rth} kΩ.<br>Match R = Rth. Pmax = Vth²/(4Rth) = ${p.power} mW.`;
    }else if(id==='h2-3'||id==='h2-6'){
      if(random){
        const a=int(1,3),b=int(1,3),e=int(1,3);p.r=pick([1,2,3]);p.i1=a+3*b+e;p.i2=-(a+b);p.i3=2*a+5*b+e;p.i4=a+2*b;p.i5=b;
        p.va=-p.r*(a+3*b);p.vb=-p.r*(a+2*b);p.e1=p.r*e;p.e2=p.r*a;p.e3=p.r*(3*a+8*b+e);
        ['₁','₂','₃','₄','₅'].forEach(t=>replace('R'+t,'R'+t+' = '+p.r+' Ω'));['₁','₂','₃'].forEach((t,i)=>replace('E'+t,'E'+t+' = '+p['e'+(i+1)]+' V'));
        q.note='';q.caption='';q.extra='';q.instructions='Use the labelled reference arrows. Negative currents flow opposite to their arrows.';
        q.statement=id==='h2-3'?base.statement:'Using the node potential method to analyze the circuit shown in Figure P1.21, find the currents I₁–I₅.';
        if(id==='h2-6')q.note='Practice variant: component values are supplied; find all five labelled currents. The homework figure does not specify a single current I.';
        q.fields=(id==='h2-6'?[n('va','Node potential VA',p.va),n('vb','Node potential VB',p.vb)]:[]).concat([1,2,3,4,5].map(i=>n('i'+i,'I'+i,p['i'+i],'A')));
      }
      if(id==='h2-3'){
        step('KCL at the two nodes',random?[eq('a','KCL at A','I1+I5=I2+I3'),eq('b','KCL at B','I2+I4=I5')]:[get('a'),get('b')],'original','Use I1, I2, I3, I4 and I5 in your equations.');
        step('Three independent loops',random?[eq('left','Left loop',`${p.r}*I1+${p.r}*I3=${p.e1+p.e3}`),eq('right','Right loop',`${p.r}*I2+${p.r}*I5=${-p.e2}`),eq('lower','Lower loop',`${p.r}*I3+${p.r}*I4+${p.r}*I5=${p.e3}`)]:[get('left'),get('right'),get('lower')],'loops','Write one equation for each highlighted loop.');
        if(random){q.fields=steps.flatMap(s=>s.fields);q.instructions='Use I1… I5. Enter each equation with =. Reordered terms and constant multiples are accepted.';}
      }else{
        step('Node A',random?[eq('a','Node A equation',`(VA-${p.e1})/${p.r}+(VA-${p.e2}-VB)/${p.r}+(VA+${p.e3})/${p.r}+(VA-VB)/${p.r}=0`)]:[get('a')],'node-a','Add the currents leaving A. Account for each source polarity.');
        step('Node B',random?[eq('b','Node B equation',`(VB-VA+${p.e2})/${p.r}+VB/${p.r}+(VB-VA)/${p.r}=0`)]:[get('b')],'node-b','Add the currents leaving B.');
        if(random)final('Solve the node voltages',['va','vb'],'original',[pin('va',290,65,'A'),pin('vb',570,305,'B')]);
        final('Branch currents',['i1','i2','i3','i4','i5']);
      }
      if(random)q.solution=id==='h2-3'?`I₁ + I₅ = I₂ + I₃; I₂ + I₄ = I₅.<br>${p.r}I₁ + ${p.r}I₃ = ${p.e1+p.e3}; ${p.r}I₂ + ${p.r}I₅ = ${-p.e2}; ${p.r}I₃ + ${p.r}I₄ + ${p.r}I₅ = ${p.e3}.`:`VA = ${p.va} V; VB = ${p.vb} V.<br>I₁ = (E₁ − VA)/R₁, I₂ = (VA − E₂ − VB)/R₂, I₃ = (VA + E₃)/R₃, I₄ = −VB/R₄, I₅ = (VB − VA)/R₅.<br>Currents: ${[1,2,3,4,5].map(i=>p['i'+i]).join(', ')} A.`;
    }else if(id==='h2-4'){
      p.pos=random?12*int(1,4):12;p.neg=random?12*int(1,4):24;p.r=random?int(1,3):1;p.va=(11*p.pos-9*p.neg)/24;p.vb=(9*p.pos-11*p.neg)/24;
      replace('+12 V','+'+p.pos+' V');replace('−24 V','−'+p.neg+' V');[2,3,6].forEach(a=>replace(a+' kΩ',a*p.r+' kΩ'));set('va',p.va);set('vb',p.vb);
      step('Node A equation',[eq('eqA','KCL at A',`(VA-${p.pos})/${2*p.r}+(VA+${p.neg})/${3*p.r}+VA/${6*p.r}+(VA-VB)/${2*p.r}=0`)],'node-a','Use VA and VB; resistances are in kΩ.');
      step('Node B equation',[eq('eqB','KCL at B',`(VB+${p.neg})/${2*p.r}+(VB-${p.pos})/${3*p.r}+VB/${6*p.r}+(VB-VA)/${2*p.r}=0`)],'node-b','Use VA and VB; resistances are in kΩ.');
      final('Solve the two potentials',undefined,'original',[pin('va',230,175,'A'),pin('vb',445,175,'B')]);q.solution=`At A: (VA − ${p.pos})/${2*p.r} + (VA + ${p.neg})/${3*p.r} + VA/${6*p.r} + (VA − VB)/${2*p.r} = 0.<br>At B: (VB + ${p.neg})/${2*p.r} + (VB − ${p.pos})/${3*p.r} + VB/${6*p.r} + (VB − VA)/${2*p.r} = 0.<br>VA = ${p.va} V; VB = ${p.vb} V.`;
    }else if(id==='h2-5'){
      p.r1=random?int(1,5):2;p.r2=random?pick([10,20,30])-p.r1:18;p.e=random?(p.r1+p.r2)*pick([1,2,3,4,5]):110;p.i=-p.e/(p.r1+p.r2);
      replace('E = 110 V','E = '+p.e+' V');replace('R₁ = 2 Ω','R₁ = '+p.r1+' Ω');replace('R₂ = 18 Ω','R₂ = '+p.r2+' Ω');[1,2,3].forEach(i=>set('closed'+i,p.i));
      if(random)q.statement=base.statement.replace('110 V',p.e+' V').replace('2 Ω',p.r1+' Ω').replace('18 Ω',p.r2+' Ω');
      final('Close the switch',['closed1','closed2','closed3'],'switch-closed');final('Open the switch',['open1','open2','open3'],'original');q.solution=`Closed: the rails have zero voltage difference. Each rightward current is −E/(R₁ + R₂) = ${p.i} A.<br>Open: identical branches have identical currents, and their sum is zero. All three currents are 0 A.`;
    }else if(id==='h2-7'){
      p.r=random?pick([2,4,6]):2;p.is=random?2*int(1,3):1;p.v=random?2*p.r*int(1,5):8;p.fromI=p.is/2;p.fromV=-p.v/(2*p.r);p.i=p.fromI+p.fromV;
      replace('2 Ω',p.r+' Ω');replace('1 A',p.is+' A');replace('8 V',p.v+' V');set('i',p.i);
      step('Current source only',[n('fromI','Current-source contribution',p.fromI,'A')],'superposition-current','Replace the ideal voltage source with a wire.',[pin('fromI',385,65,'I′')]);
      step('Voltage source only',[n('fromV','Voltage-source contribution',p.fromV,'A')],'superposition-voltage','Replace the ideal current source with an open circuit.',[pin('fromV',385,65,'I″')]);
      final('Add the contributions',['i'],'original',[pin('i',385,65,'I')]);q.solution=`Current source alone: I′ = ${p.is}/2 = ${p.fromI} A.<br>Voltage source alone: I″ = −${p.v}/(2 × ${p.r}) = ${p.fromV} A.<br>I = I′ + I″ = ${p.i} A.`;
    }else if(id==='h2-8'){
      p.s=random?pick([1,2,3]):1;p.e=random?60*int(1,3):60;p.vth=p.e*2/15;p.rth=10*p.s;p.load=30*p.s;p.u=p.e/10;
      replace('60 V',p.e+' V');[10,6,3,40,30].forEach(v=>replace(v+' kΩ',v*p.s+' kΩ'));set('u',p.u);
      step('Remove the 30 kΩ load'.replace('30',String(p.load)),[n('openA','Open-circuit VA',p.e*.8),n('openB','Open-circuit VB',p.e*2/3)],'bridge-open','Take the lower-left node as 0 V and use the two independent voltage dividers.',[pin('openA',540,65,'A'),pin('openB',540,295,'B')]);
      step('Thévenin voltage',[n('vth','VA − VB with the load removed',p.vth)],'bridge-open','Subtract the two open-circuit node potentials.',[pin('vth',625,65,'Vth')]);
      step('Deactivate the voltage source',[n('rth','Thévenin resistance',p.rth,'kΩ')],'bridge-off','Short the source. Find the resistance seen between A and B.',[pin('rth',625,65,'Rth')]);
      final('Reconnect the load',['u'],'loaded-thevenin',[pin('u',510,175,'U')]);q.solution=`Open circuit: VA = ${fmt(p.e*.8)} V and VB = ${fmt(p.e*2/3)} V, so Vth = ${p.vth} V.<br>Rth = (${10*p.s} ∥ ${40*p.s}) + (${3*p.s} ∥ ${6*p.s}) = ${p.rth} kΩ.<br>U = Vth × ${p.load}/(${p.rth} + ${p.load}) = ${p.u} V.`;
    }else if(id==='h2-9'){
      p.r=random?pick([2,4,6]):2;p.i1=random?int(1,3):1;p.i2=random?int(1,4):2;p.e1=random?p.r*int(2,6):8;p.e2=random?p.r*int(1,5):6;p.vc=p.r*(p.i1+p.i2)-p.e2;p.vth=p.vc-p.e1;p.rth=p.r;p.load=p.r;p.i=p.vth/(2*p.r);
      replace('2 Ω',p.r+' Ω');replace('1 A',p.i1+' A');replace('2 A',p.i2+' A');replace('8 V',p.e1+' V');replace('6 V',p.e2+' V');set('i',p.i);
      step('Open the load branch',[n('vc','Open-circuit VC',p.vc)],'current-open','Set B to 0 V. Apply KCL to the A–C supernode.',[pin('vc',150,175,'C')]);
      step('Open-circuit voltage',[n('vth','VA − VB',p.vth)],'current-open','Use the 8 V source polarity.'.replace('8',String(p.e1)),[pin('vth',565,55,'A')]);
      step('Deactivate all sources',[n('rth','Thévenin resistance',p.rth,'Ω')],'current-off','Short the voltage sources and open the current sources.',[pin('rth',565,55,'Rth')]);
      final('Reconnect the load',['i'],'loaded-thevenin',[pin('i',510,175,'I')]);q.solution=`VC = ${p.r}(${p.i1} + ${p.i2}) − ${p.e2} = ${p.vc} V. Vth = VC − ${p.e1} = ${p.vth} V.<br>Rth = ${p.r} Ω. I = ${p.vth}/(${p.r} + ${p.r}) = ${p.i} A.`;
    }else if(id==='h2-10'){
      p.f=random?pick([25,50,60,100,200]):1000/(2*Math.PI);p.rms1=random?int(2,12):20;p.peak2=random?2*int(2,12):30;p.rms2=p.peak2/Math.sqrt(2);p.ph1=random?pick([-60,-30,0,30,60]):30;p.ph2=random?pick([-60,-15,15,45,75]):-20;
      set('f1',p.f);set('f2',p.f);set('rms1',p.rms1);set('rms2',p.rms2);set('phase1',p.ph1);set('phase2',p.ph2);set('difference',Math.abs(p.ph1-p.ph2));set('lead',p.ph1===p.ph2?'same':p.ph1>p.ph2?'leads':'lags');
      if(random){q.statement=base.statement.replace('20√2 sin(1000t + 30°)',`${p.rms1}√2 sin(${2*p.f}πt ${p.ph1<0?'−':'+'} ${Math.abs(p.ph1)}°)`).replace('30 sin(1000t − 20°)',`${p.peak2} sin(${2*p.f}πt ${p.ph2<0?'−':'+'} ${Math.abs(p.ph2)}°)`);q.extra='';}
      final('Frequency and RMS',['f1','rms1','f2','rms2'],'sine-given');final('Draw the phasors',['phase1','phase2'],'phasors');final('Compare the phases',['lead','difference'],'phasors');
      q.solution=`f = ω/(2π) = ${fmt(p.f)} Hz. RMS currents are ${fmt(p.rms1)} A and ${fmt(p.rms2)} A. Phases: ${p.ph1}° and ${p.ph2}°.<br>${p.ph1===p.ph2?'i₁ and i₂ are in phase.':`i₁ ${p.ph1>p.ph2?'leads':'lags'} i₂ by ${Math.abs(p.ph1-p.ph2)}°.`}`;
    }else if(id==='h2-11'){
      p.f=random?pick([25,50,60,100]):50;const scale=random?int(1,3):2;
      p.z1=random?[pick([-1,1])*3*scale,pick([-1,1])*4*scale]:[6,8];const a=random?int(1,6):3;p.zi=[a,-a];p.z2=random?[pick([-1,1])*4*scale,pick([-1,1])*3*scale]:[-6,-8];
      for(const [suffix,z] of [['1',p.z1],['i',p.zi],['2',p.z2]]){set('a'+suffix,Math.hypot(...z)*Math.sqrt(2));set('w'+suffix,2*Math.PI*p.f);set('p'+suffix,Math.atan2(z[1],z[0])*180/Math.PI);}
      const zstr=z=>`${z[0]} ${z[1]<0?'−':'+'} j${Math.abs(z[1])}`;
      if(random)q.statement=base.statement.replace('50 Hz',p.f+' Hz').replace('6 + j8',zstr(p.z1)).replace('3 − j3',zstr(p.zi)).replace('−6 − j8',zstr(p.z2));
      replace('U̇₁ = (6 + j8) V',`U̇₁ = (${zstr(p.z1)}) V`);replace('İ = (3 − j3) A',`İ = (${zstr(p.zi)}) A`);replace('U̇₂ = (−6 − j8) V',`U̇₂ = (${zstr(p.z2)}) V`);replace('f = 50 Hz · RMS phasors',`f = ${p.f} Hz · RMS phasors`);
      for(const [suffix,label] of [['1','u₁'],['i','i'],['2','u₂']])final('Build '+label+'(t)',['a'+suffix,'w'+suffix,'p'+suffix],'waveform-'+suffix);
      q.solution=`Use peak = √2 × RMS magnitude, ω = 2πf = ${2*p.f}π rad/s and φ = atan2(imaginary, real). Use the correct quadrant. Two decimal places for phase are sufficient.`;
    }
    if(!steps.length)final();
    q.steps=steps;q.labels=labels;q.diagram=()=>{
      const counts={};let diagram=Circuits.get(id,p.curveOrder).replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g,(all,start,value,end)=>{
        if(!Object.hasOwn(labels,value))return all;let target=labels[value];if(Array.isArray(target)){let i=counts[value]||0;counts[value]=i+1;target=target[Math.min(i,target.length-1)];}return start+Circuits.draw.esc(target)+end;
      });
      return diagram.replace(/aria-label="[^"]*"/,'aria-label="'+Circuits.draw.esc(q.title+(random?' — randomized values':''))+'"').replace(/<title>.*?<\/title>/,'<title>'+Circuits.draw.esc(q.title)+'</title>');
    };
    // Generic hints never carry a previous version’s numerical constants.
    if(random)q.hint='Use the same method as the matching homework exercise. Step by step shows the intermediate circuits and quantities.';
    return q;
  }
  return {build,fmt};
})();
