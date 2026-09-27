const StepVisuals=(()=>{
  const {line:L,text:T,dot:D,arrow:A,resistor:R,source:S,ground:G,svg:SVG,esc}=Circuits.draw;
  const f=PracticeModels.fmt;
  const read=(draft,key)=>{try{return Checker.evaluate(draft[key]??'')}catch{return NaN}};
  const value=(draft,key,fallback)=>{const v=read(draft,key);return Number.isFinite(v)?f(v):fallback};
  const open=(x,y1,y2)=>L(x,y1,x,(y1+y2)/2-17)+L(x,(y1+y2)/2+17,x,y2)+D(x,(y1+y2)/2-17,true)+D(x,(y1+y2)/2+17,true);
  function equiv(q,draft,norton,loaded=false){
    const p=q.params,unit=q.id==='h2-9'||/^h1-[56]/.test(q.id)?'Ω':'kΩ';
    let vkey=q.id.startsWith('h1-6')?'v':'vth',rkey=q.id.startsWith('h1-')?'r':'rth';if(q.id==='h2-1')rkey='rth';
    let srcLabel=value(draft,vkey,'Vth')+(Number.isFinite(read(draft,vkey))?' V':'');
    let rLabel=value(draft,rkey,'Rth')+(Number.isFinite(read(draft,rkey))?' '+unit:'');
    let b='';
    if(norton){
      let key=q.id==='h1-7'?'total':'in';if(q.scene==='conversion-branch')key='converted';
      let ilabel=value(draft,key,key==='in'?'IN':'Ieq');if(Number.isFinite(read(draft,key)))ilabel+=q.id==='h1-7'?' mA':' A';
      rkey=q.id==='h1-7'?'req':'r';rLabel=value(draft,rkey,q.id==='h1-7'?'Req':'RN');if(Number.isFinite(read(draft,rkey)))rLabel+=' '+unit;
      const direction=draft.direction;
      if(q.id==='h1-7'||direction==='up')b+=S(180,295,180,65,ilabel,'i',-1);
      else if(direction==='down')b+=S(180,65,180,295,ilabel,'i',-1);
      else b+=L(180,65,180,160)+L(180,200,180,295)+`<circle class="component" cx="180" cy="180" r="20"/>`+T(180,186,'?')+T(135,186,ilabel,'small','end');
      b+=R(350,65,350,295,rLabel)+L(180,65,510,65)+L(180,295,510,295);
    }else{
      if(q.id.startsWith('h1-6')&&!draft.polarity)b+=L(150,65,150,160)+L(150,200,150,295)+`<circle class="component" cx="150" cy="180" r="20"/>`+T(150,186,'?')+T(105,186,srcLabel,'small','end');
      else b+=draft.polarity==='bottom'?S(150,295,150,65,srcLabel,'v',-1):S(150,65,150,295,srcLabel,'v',-1);
      b+=R(150,65,510,65,rLabel)+L(150,295,510,295);
    }
    if(loaded){let load=p.load??p.rth??p.r;let label=q.id==='h2-2'?value(draft,'r','R'):f(load);b+=R(510,65,510,295,label+(label==='R'?'':' '+unit),25)+A(530,89,530,130,'I',556,119);}
    b+=D(510,65,true)+D(510,295,true)+T(535,62,'a')+T(535,304,'b');
    return SVG(b,norton?'Parallel Norton equivalent':'Series Thévenin equivalent',680,365);
  }
  function power(q,off){
    const p=q.params;let b=L(85,70,360,70)+L(85,290,560,290)+R(235,70,235,180,`R₁ = ${p.r1} kΩ`,-27)+R(360,70,360,290,`R₂ = ${p.r1} kΩ`,25)+R(360,70,560,70,`R₃ = ${p.r3} kΩ`,-26)+D(560,70,true)+D(560,290,true)+T(580,77,'a')+T(580,297,'b');
    b+=off?open(85,70,290)+L(235,180,235,290):S(85,290,85,70,p.is+' mA','i',1)+S(235,180,235,290,p.v+' V','v',-1);
    return SVG(b,off?'Current source opened, voltage source shorted, load removed':'Load removed for open-circuit voltage',680,365);
  }
  function bridge(q,off){
    const p=q.params;let b=off?L(105,65,105,295):S(105,65,105,295,p.e+' V','v',-1);
    b+=R(105,65,540,65,10*p.s+' kΩ')+R(105,295,540,295,6*p.s+' kΩ',-28)+R(105,65,307,172,3*p.s+' kΩ',25)+L(307,172,540,295)+R(105,295,310,187,40*p.s+' kΩ',-27)+`<path class="wire" d="M310 187L313.66 184.68A10 10 0 0 1 331.34 175.32L340 171"/>`+L(340,171,540,65);
    b+=L(540,65,625,65)+L(540,295,625,295)+D(540,65)+D(540,295)+D(625,65,true)+D(625,295,true)+T(540,40,'A')+T(540,328,'B');
    if(!off)b+=L(105,295,105,312)+G(105,327);
    return SVG(b,off?'Bridge load removed and voltage source replaced by a short':'Bridge with load removed: two voltage dividers',700,375);
  }
  function currentNetwork(q,off){
    const p=q.params;let b=L(150,55,565,55)+L(150,295,565,295)+R(150,175,355,175,p.r+' Ω')+D(150,175)+T(120,181,'C')+D(355,175)+D(565,55,true)+D(565,295,true)+T(590,62,'A')+T(590,303,'B');
    b+=off?L(150,55,150,175)+open(150,175,295)+open(355,55,175)+L(355,175,355,295):S(150,175,150,55,p.e1+' V','v',-1)+S(150,295,150,175,p.i1+' A','i',-1)+S(355,175,355,55,p.i2+' A','i',-1)+S(355,295,355,175,p.e2+' V','v',-1);
    return SVG(b,off?'Load removed; voltage sources shorted and current sources opened':'Load removed for the A–C supernode',680,365);
  }
  function superposition(q,mode){
    const p=q.params;let b=R(90,65,285,65,p.r+' Ω')+R(285,65,490,65,p.r+' Ω',-30)+R(285,65,285,290,p.r+' Ω',-27)+R(490,65,490,290,p.r+' Ω',-27)+L(490,65,595,65)+L(90,290,595,290)+D(285,65)+D(490,65)+A(362,36,422,36,mode==='current'?'I′':'I″');
    b+=mode==='current'?S(90,290,90,65,p.is+' A','i',-1)+L(595,65,595,290):open(90,65,290)+S(595,65,595,290,p.v+' V');
    return SVG(b,mode==='current'?'Current source active; voltage source replaced with a wire':'Voltage source active; current source branch opened',680,350);
  }
  function phasors(q,draft){
    // One shared scale preserves the ratio of the two RMS magnitudes.
    const mags=[read(draft,'rms1'),read(draft,'rms2')],ph=[read(draft,'phase1'),read(draft,'phase2')];
    const scale=145/Math.max(1,...mags.filter(Number.isFinite));let b=L(70,250,610,250,'axis')+L(335,415,335,80,'axis')+T(615,279,'Re')+T(365,91,'Im')+T(315,278,'0');
    const valid=i=>Number.isFinite(mags[i])&&Number.isFinite(ph[i])&&mags[i]>=0;
    const coincident=valid(0)&&valid(1)&&Math.abs(mags[0]-mags[1])<1e-8&&Math.abs(Math.sin((ph[0]-ph[1])*Math.PI/360))<1e-8;
    [0,1].forEach(i=>{
      const color=i?'#b77a35':'#287951',name=i?'I₂':'I₁',x=85+310*i;
      b+=`<path d="M${x-25} 33h16" stroke="${color}" stroke-width="3"/>`+T(x,39,name+(valid(i)?' = '+f(mags[i])+' ∠ '+f(ph[i])+'° A':''),'phasor-key','start');
      if(!valid(i)||(coincident&&i===1))return;
      const angle=ph[i]*Math.PI/180;b+=Circuits.draw.vector(335,250,335+scale*mags[i]*Math.cos(angle),250-scale*mags[i]*Math.sin(angle),color,3);
    });
    if(coincident)b+=T(340,450,'I₁ = I₂ · coincident phasors','small');
    return SVG(b,'RMS phasors: I1 green, I2 amber; coincident phasors share one arrow',680,475);
  }
  function wave(q,draft,suffix,given=false){
    let b='',max=1,curves=[];const p=q.params;
    if(given)curves=[{a:p.rms1*Math.sqrt(2),w:2*Math.PI*p.f,phase:p.ph1,color:'#287951',name:'i₁'},{a:p.rms2*Math.sqrt(2),w:2*Math.PI*p.f,phase:p.ph2,color:'#bd8246',name:'i₂'}];
    else {const a=read(draft,'a'+suffix),w=read(draft,'w'+suffix),phase=read(draft,'p'+suffix);if([a,w,phase].every(Number.isFinite)&&a>=0&&w>0)curves=[{a,w,phase,color:'#287951',name:suffix==='i'?'i':'u'+(suffix==='1'?'₁':'₂')}];}
    max=Math.max(1,...curves.map(c=>c.a));const end=1/(p.f||50),cy=220;
    b+=L(75,cy,620,cy,'axis')+L(75,65,75,375,'axis')+T(650,cy-12,'t')+T(75,cy+30,'0')+T(350,cy+30,f(end*500)+' ms')+T(610,cy+30,f(end*1000)+' ms')+L(75,90,615,90,'axis dashed')+L(75,350,615,350,'axis dashed');
    if(!given&&!curves.length)b+=T(350,130,'Enter amplitude, frequency and phase','small');
    curves.forEach((c,i)=>{let path='';for(let k=0;k<=220;k++){const t=end*k/220,x=75+540*k/220,y=cy-130*c.a/max*Math.sin(c.w*t+c.phase*Math.PI/180);path+=(k?'L':'M')+x.toFixed(2)+' '+y.toFixed(2);}b+=`<path d="${path}" fill="none" stroke="${c.color}" stroke-width="3"/>`+T(given?185+i*310:340,35,c.name+' · peak '+f(c.a),'small');});
    return SVG(b,given?'The given sinusoidal currents over one period':'Waveform built from your entered amplitude, frequency and phase',680,415);
  }
  function original(q,scene){
    let diagram=q.diagram(),marks='';
    if(scene==='node-a'||scene==='node-b'){
      const pt=q.id==='h2-4'?(scene==='node-a'?[230,175]:[445,175]):(scene==='node-a'?[290,65]:[570,305]);
      marks=`<circle cx="${pt[0]}" cy="${pt[1]}" r="30" fill="#d8efb080" stroke="#65983d" stroke-width="3"/>`;
    }
    if(scene==='loops')marks='<path d="M130 100V280H250V100Z M370 95L530 232V95Z M350 180V280H467Z" fill="#e8f0dc" stroke="#cbdab7" stroke-width="1.5" stroke-linejoin="round"/>';
    if(scene.startsWith('characteristic-')){const i=Number(scene.at(-1));marks=`<rect x="${28+170*i}" y="25" width="160" height="235" rx="10" fill="none" stroke="#80a84c" stroke-width="3"/>`;}
    if(scene==='switch-closed')diagram=diagram.replace('<path class="wire" d="M305 330L336 310"/>',L(305,335,340,335));
    return diagram.replace('</title>','</title>'+marks);
  }
  function scene(q,step,draft){
    const name=step?.scene||'original',p=q.params;q.scene=name;
    if(name==='thevenin')return equiv(q,draft,false);
    if(name==='norton'||name==='combined-norton')return equiv(q,draft,true);
    if(name==='loaded-thevenin')return equiv(q,draft,false,true);
    if(name==='conversion-branch')return SVG(S(180,295,180,65,value(draft,'converted','IN')+' mA','i',-1)+R(350,65,350,295,2*p.r+' kΩ')+L(180,65,510,65)+L(180,295,510,295)+D(510,65,true)+D(510,295,true),'Converted voltage-source branch, before combining with the other branches',680,365);
    if(name==='bridge-equivalent')return SVG(S(160,315,160,45,p.is+' A','i',-1)+L(160,45,430,45)+R(430,45,430,180,value(draft,'rup','Rup')+(Number.isFinite(read(draft,'rup'))?' Ω':''))+R(430,180,430,315,value(draft,'rdown','Rdown')+(Number.isFinite(read(draft,'rdown'))?' Ω':''))+L(160,315,430,315)+D(430,180),'Upper and lower parallel pairs replaced by their series equivalents',680,365);
    if(name==='power-open'||name==='power-off')return power(q,name.endsWith('off'));
    if(name==='bridge-open'||name==='bridge-off')return bridge(q,name.endsWith('off'));
    if(name==='current-open'||name==='current-off')return currentNetwork(q,name.endsWith('off'));
    if(name.startsWith('superposition-'))return superposition(q,name.slice(14));
    if(name==='phasors')return phasors(q,draft);
    if(name==='sine-given')return wave(q,draft,null,true);
    if(name.startsWith('waveform-'))return wave(q,draft,name.slice(9));
    if(q.id==='h2-10')return phasors(q,draft);
    return original(q,name);
  }
  const defaults={
    'h1-1':{i:[95,180,'I'],u:[350,290,'UAB']},'h1-3':{i:[420,175,'I']},'h1-4':{i3:[270,235,'I₃'],i5:[455,65,'I₅'],i6:[455,235,'I₆'],i7:[105,315,'I₇']},
    'h1-8':{is1:[240,125,'IS₁'],is2:[445,125,'IS₂'],is3:[445,280,'IS₃'],is4:[240,280,'IS₄']},'h1-7':{i:[580,180,'I']},
    'h2-4':{va:[230,175,'A'],vb:[445,175,'B']},'h2-5':{closed1:[550,55,'I₁'],closed2:[550,145,'I₂'],closed3:[550,235,'I₃'],open1:[550,55,'I₁'],open2:[550,145,'I₂'],open3:[550,235,'I₃']},
    'h2-7':{i:[385,65,'I']},'h2-8':{u:[625,65,'U']},'h2-9':{i:[470,55,'I']},
    'h2-3':{i1:[95,195,'I₁'],i2:[500,65,'I₂'],i3:[290,245,'I₃'],i4:[410,305,'I₄'],i5:[450,200,'I₅']}
  };defaults['h2-6']={...defaults['h2-3'],va:[290,65,'A'],vb:[570,305,'B']};
  function render(q,step,draft={},results={},editable=true){
    let result=scene(q,step,draft);const fields=step?.fields||q.fields;
    const pins=step?.pins?.length?step.pins:fields.filter(x=>defaults[q.id]?.[x.key]).map(x=>{const [a,b,c]=defaults[q.id][x.key];return {key:x.key,x:a,y:b,label:c}});
    const active=pins.filter(pin=>fields.some(f=>f.key===pin.key&&f.type==='number'));
    const targets=active.map(pin=>`<circle class="diagram-target" data-target="${pin.key}" cx="${pin.x}" cy="${pin.y}" r="20"/>`).join('');
    // Focus highlights sit behind the drawing; no permanent badges obscure its symbols.
    result=result.replace('</title>','</title><g class="diagram-targets" aria-hidden="true">'+targets+'</g>');
    const inputs=active.map(pin=>{
      const field=fields.find(f=>f.key===pin.key),state=results[pin.key],cls=state?(state.ok?'correct':'incorrect'):'';
      return `<div class="diagram-answer ${cls}"><label><span class="diagram-field-name">${esc(field.label)}</span><span class="diagram-input-wrap"><input data-linked="${pin.key}" aria-label="${esc(field.label)} on diagram${field.unit?' in '+esc(field.unit):''}" type="text" autocomplete="off" spellcheck="false" placeholder="?" value="${esc(draft[pin.key]||'')}" ${editable?'':'readonly'}/><span class="diagram-unit">${esc(field.unit||'')}</span></span></label></div>`;
    }).join('');
    return `<div class="circuit-layout"><div class="circuit-canvas" tabindex="0" aria-label="Circuit diagram; scroll horizontally if needed">${result}</div>${inputs?'<div class="diagram-inputs">'+inputs+'</div>':''}</div>`;
  }
  return {render,scene,wave,phasors};
})();
