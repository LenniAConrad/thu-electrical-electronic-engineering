/* Explicit topology adapters. SI units throughout; assumptions stay visible. */
const ExercisePlaygrounds=(()=>{
  const ac=id=>['h2-10','h2-11'].includes(id);
  function url(q){return (ac(q.id)?'phasor-lab.html':'circuit-lab.html')+'?'+new URLSearchParams({exercise:q.id,...(q.random?{seed:String(q.seed)}:{})});}
  function read(search){const s=new URLSearchParams(search),id=s.get('exercise');if(!id)return null;const raw=s.get('seed');if(raw!==null&&(!/^\d+$/.test(raw)||Number(raw)>4294967295))throw Error('Invalid practice seed.');return PracticeModels.build(id,raw===null?null:Number(raw));}
  function back(q){return 'index.html#'+(q.random?`random/${q.id}/${q.seed}`:q.id);}
  function build(q,variant='a'){
    const id=q.id;let p=q.params;const nodes=[],parts=[],notes=[],variants=id==='h1-2'?['a','b','c','d']:[];
    const n=(id,x,y,name=id)=>{nodes.push({id,name,x,y});return id;};
    const add=(id,kind,a,b,value=0,closed=true)=>parts.push({id,kind,a,b,value,closed});
    const R=(id,a,b,v)=>add(id,'R',a,b,v),V=(id,a,b,v)=>add(id,'V',a,b,v),I=(id,a,b,v)=>add(id,'I',a,b,v),W=(id,a,b)=>add(id,'W',a,b);
    let ground='G';
    function load(closed=false){n('Load',850,360);R('RL','a','Load',10);add('SL','S','Load','b',0,closed);notes.push(`RL = 10 Ω and switch SL are added for testing the terminals. SL starts ${closed?'closed':'open'}; click it to connect or disconnect the load.`);}
    if(ac(id))return {kind:'ac',q};
    if(id==='h1-1'){
      n('G',800,520,'B');n('A',160,160);n('L',430,160);n('R',800,160);V('V1','A','L',p.v);R('R1','L','R',p.r1);R('R2','R','G',p.r2);I('J1','L','G',p.j1);I('J2','G','R',p.j2);I('Jin','G','A',p.total);
      notes.push('The given terminal currents are represented by current sources to close the circuit. Jin = Iout + J1 − J2; A–B is the requested voltage.');
    }else if(id==='h1-2'){
      ground='b';n('b',400,520);n('a',720,140);n('X',260,140);
      if(variant==='a'){V('V1','X','b',p.v);R('R1','X','a',p.r);}
      if(variant==='b'){I('I1','X','b',p.i);R('R1','X','a',p.r);}
      if(variant==='c'){I('I1','b','X',p.i);W('W1','X','a');R('R1','a','b',p.r);}
      if(variant==='d'){V('V1','X','b',p.v);W('W1','X','a');R('R1','a','b',p.r);}
      load(true);notes.push('U = Va − Vb. Homework terminal I equals IRL for (a), and −IRL for (b), (c), (d). Change RL to trace the characteristic.');
    }else if(id==='h1-3'){
      n('G',540,540);n('T',540,100);n('L',340,320);n('R',820,320);n('SrcTop',100,100);n('SrcBottom',100,540);W('WT','SrcTop','T');W('WB','SrcBottom','G');I('IS','SrcBottom','SrcTop',p.is);R('R1','T','L',p.a);R('R2','L','G',p.b);R('R3','T','R',2*p.a);R('R4','R','G',p.b);W('Bridge','L','R');notes.push('The requested I is the current in Bridge, from L to R.');
    }else if(id==='h1-4'){
      const u=p.i4>0?6:4,d=p.i4>0?4:6;
      n('G',850,540);n('Supply',140,100);n('L',320,100);n('U',570,100);n('D',570,370);n('Out',850,250);
      n('Return',140,540);V('SupplyV','Supply','Return',10+2*p.i1);W('Wreturn','Return','G');R('R1','Supply','L',1);R('R2','L','U',(10-u)/p.i2);R('R3','L','D',(10-d)/p.i3);R('R4','U','D',(u-d)/p.i4);R('R5','U','Out',u/(p.i2-p.i4));R('R6','D','Out',d/(p.i3+p.i4));R('R7','Out','G',1);
      notes.push('The homework gives currents, not component values. These illustrative resistances and the added supply reproduce I1, I2 and I4 exactly. Editing them changes the given currents.');
    }else if(/^h1-[56]/.test(id)){
      ground='b';n('b',430,520);n('a',720,120);n('X',240,120);
      if(id[3]==='5'){
        if(p.part===3){V('V1','X','b',p.v);W('W1','X','a');R('Rshunt','a','b',3);}
        else{V('V1',p.sign>0?'X':'b',p.sign>0?'b':'X',p.v);R('R1','a','X',p.r);if(p.part===2)R('Rshunt','X','b',3);}
      }else{
        if(p.part===2){R('Rseries','a','X',3);I('I1','X','b',p.i);R('R1','a','b',p.r);}
        else if(p.part===3){I('I1','b','X',p.i);R('Rseries','X','a',2);}
        else{W('W1','X','a');I('I1',p.sign>0?'b':'X',p.sign>0?'X':'b',p.i);R('R1','a','b',p.r);}
      }
      load(id==='h1-6d');notes.push('Uab = Va − Vb. The given source circuit is shown before conversion.');
      if(id==='h1-6d')notes.push('An ideal current source cannot operate into an open circuit: opening SL has no finite DC solution.');
    }else if(id==='h1-7'){
      n('G',480,520);n('S',140,120);n('A',480,120);n('B',840,120);n('C',840,520);
      V('V1','S','G',p.v);R('R1','S','A',2*p.r*1000);R('R2','A','G',2*p.r*1000);I('IS','G','A',p.is/1000);W('W1','A','B');W('W2','G','C');R('R3','B','C',p.r*1000);R('RL','B','C',p.r*500);notes.push('The requested I is the downward current in RL.');
    }else if(id==='h1-8'){
      n('G',480,320,'O');n('A',170,100);n('B',810,100);n('C',810,540);n('D',170,540);
      for(const c of ['A','B','D'])V('V'+c,c,'G',p['v'+c.toLowerCase()]);V('VC','G','C',-p.vc);
      R('R1','A','B',p.rt);R('R2','B','C',p.rr);R('R3','D','C',p.rb);R('R4','A','D',p.rl);notes.push('Homework source arrows point outward from O: IS1 = −IVA, IS2 = −IVB, IS3 = IVC, IS4 = −IVD.');
    }else if(id==='h2-1'){
      n('G',240,520);n('S',240,120);n('A',780,120);n('B',780,520);V('Vth','S','G',p.v);R('Rth','S','A',p.r*1000);R('RL','A','B',p.load*1000);W('W1','B','G');notes.push('Derived Thévenin equivalent of the black box: its internal circuit is not supplied. The values reveal Vth and Rth. U is the voltage across RL.');
    }else if(id==='h2-2'){
      n('G',470,520);n('A',470,120);n('X',160,320);n('L',820,120);V('V1','X','G',p.v);R('R1','A','X',p.r1*1000);I('IS','G','A',p.is/1000);R('R2','A','G',p.r1*1000);R('R3','A','L',p.r3*1000);R('RL','L','G',1000);notes.push('The unknown load RL starts at a test value of 1 kΩ. Change RL and compare its absorbed power to find the maximum.');
    }else if(id==='h2-3'||id==='h2-6'){
      if(!q.random){p=PracticeModels.build(id,1).params;notes.push('The homework is symbolic. Editable example values are supplied for E1–E3 and R1–R5; the topology is unchanged.');}
      n('G',200,540);n('A',480,100);n('B',840,540);n('L',170,100);n('X',840,100);n('Y',480,320);
      V('E1','A','L',p.e1);V('E2','A','X',p.e2);V('E3','Y','A',p.e3);R('R1','G','L',p.r);R('R2','X','B',p.r);R('R3','Y','G',p.r);R('R4','G','B',p.r);R('R5','B','A',p.r);notes.push('Currents in R1–R5 follow the homework arrows I1–I5.');
      if(id==='h2-6')notes.push('The homework does not identify a single current I; all five branch currents are shown.');
    }else if(id==='h2-4'){
      n('G',500,540);n('P',100,100,'Plus');n('N',900,100,'Minus');n('A',320,310);n('B',680,310);n('PG',100,540);n('NG',900,540);
      V('Vpos','P','PG',p.pos);V('Vneg','N','NG',-p.neg);W('WP','PG','G');W('WN','NG','G');R('R1','P','A',2000*p.r);R('R2','N','A',3000*p.r);R('R3','A','G',6000*p.r);R('R4','N','B',2000*p.r);R('R5','P','B',3000*p.r);R('R6','B','G',6000*p.r);R('R7','A','B',2000*p.r);parts.find(x=>x.id==='R2').position=.3;parts.find(x=>x.id==='R5').position=.3;notes.push('Plus and Minus represent the fixed potential terminals. Click A or B for its node equation.');
    }else if(id==='h2-5'){
      n('L',100,320);n('G',900,320,'Right');
      for(let j=1;j<=3;j++){const y=100+(j-1)*220;n('X'+j,350,y);n('Y'+j,650,y);V('E'+j,'L','X'+j,p.e);R('R1_'+j,'X'+j,'Y'+j,p.r1);R('R2_'+j,'Y'+j,'G',p.r2);}
      n('KL',100,60);n('KR',900,60);W('WK1','L','KL');W('WK2','KR','G');add('K','S','KL','KR');notes.push('K starts closed. Click K to open it. Homework I1–I3 are the currents in R2_1–R2_3.');
    }else if(id==='h2-7'){
      n('G',470,520);n('L',150,120);n('A',470,120);n('B',830,120);I('IS','G','L',p.is);R('R1','L','A',p.r);R('R2','A','B',p.r);R('R3','A','G',p.r);R('R4','B','G',p.r);V('V1','B','G',p.v);notes.push('The requested I is the current in R2 from A to B. Set a source to 0 to inspect the other source’s contribution.');
    }else if(id==='h2-8'){
      n('G',160,540);n('S',160,100);n('A',820,100);n('B',820,540);V('E','S','G',p.e);R('R1','S','A',10000*p.s);R('R2','G','B',6000*p.s);R('R3','S','B',3000*p.s);R('R4','G','A',40000*p.s);R('RL','A','B',30000*p.s);parts.find(x=>x.id==='R3').position=.3;parts.find(x=>x.id==='R4').position=.3;notes.push('U = Va − Vb is the voltage across RL. Crossing branches are not joined.');
    }else if(id==='h2-9'){
      n('G',540,540,'B');n('A',540,100);n('C',160,320);n('X',540,320);n('LoadTop',880,100);n('LoadBottom',880,540);W('WT','A','LoadTop');W('WB','G','LoadBottom');V('E1','C','A',p.e1);V('E2','G','X',p.e2);I('I1','G','C',p.i1);I('I2','X','A',p.i2);R('R1','C','X',p.r);R('RL','LoadTop','LoadBottom',p.r);notes.push('The requested I is the current in RL from A to B.');
    }else throw Error('No playground for this exercise.');
    return {kind:'dc',circuit:{nodes,parts,ground},notes,variants,q};
  }
  return {url,read,back,build};
})();
