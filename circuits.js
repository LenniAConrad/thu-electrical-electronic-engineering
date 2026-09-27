/* Circuit topologies transcribed from HW01_EET.pdf and HW02_EET_luo.docx. */
const Circuits = (() => {
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const line=(x1,y1,x2,y2,cls='wire')=>`<path class="${cls}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
  const text=(x,y,t,cls='',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${esc(t)}</text>`;
  const dot=(x,y,open=false)=>`<circle class="${open?'terminal':'node'}" cx="${x}" cy="${y}" r="${open?4:3.8}"/>`;
  const arrow=(x1,y1,x2,y2,label='',tx=(x1+x2)/2,ty=(y1+y2)/2-10)=>line(x1,y1,x2,y2,'current')+`<path d="M${x2} ${y2}l-8 -4v8z" fill="#749556" transform="rotate(${Math.atan2(y2-y1,x2-x1)*180/Math.PI} ${x2} ${y2})"/>`+(label?text(tx,ty,label,'accent small label-bg'):'');
  const resistor=(x1,y1,x2,y2,label,offset=24)=>{
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),ang=Math.atan2(dy,dx)*180/Math.PI,mx=(x1+x2)/2,my=(y1+y2)/2;
    const vertical=Math.abs(dy)>Math.abs(dx);
    return `<g transform="translate(${mx} ${my}) rotate(${ang})"><path class="wire" d="M${-len/2} 0H-23M23 0H${len/2}"/><rect class="component" x="-23" y="-8" width="46" height="16"/></g>`+text(mx+(vertical?offset:0),my+(vertical?5:-offset),label,'small label-bg',vertical?(offset>0?'start':'end'):'middle');
  };
  // The plus terminal for a voltage source is endpoint 1; current arrow is endpoint 1 → endpoint 2.
  const source=(x1,y1,x2,y2,label,type='v',side=1)=>{
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,mx=(x1+x2)/2,my=(y1+y2)/2,vertical=Math.abs(dy)>Math.abs(dx);
    let s=line(x1,y1,mx-ux*20,my-uy*20)+line(mx+ux*20,my+uy*20,x2,y2)+`<circle cx="${mx}" cy="${my}" r="20" class="component"/>`;
    if(type==='i')s+=arrow(mx-ux*12,my-uy*12,mx+ux*12,my+uy*12);
    else s+=text(mx-ux*10,my-uy*10+5,'+','small')+text(mx+ux*10,my+uy*10+5,'−','small');
    return s+text(mx+(vertical?side*32:0),my+(vertical?6:side*-32),label,'small label-bg',vertical?(side>0?'start':'end'):'middle');
  };
  const ground=(x,y)=>line(x,y-15,x,y)+line(x-13,y,x+13,y)+line(x-8,y+6,x+8,y+6)+line(x-3,y+12,x+3,y+12);
  const svg=(body,title,w=680,h=350)=>`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}" xmlns="http://www.w3.org/2000/svg"><title>${esc(title)}</title>${body}</svg>`;
  const pair=(kind,n)=>{
    let b='',x=210,top=55,bot=280;
    if(kind==='norton'){
      if(n<2){b+=resistor(x,top,x,165,n===0?'2 Ω':'3 Ω');b+=n===0?source(x,165,x,bot,'10 V'):source(x,bot,x,165,'6 V');b+=line(x,top,420,top)+line(x,bot,420,bot);}
      if(n===2){b+=resistor(x,top,x,150,'2 Ω',-28)+resistor(x,150,x,bot,'3 Ω',-28)+source(335,150,335,bot,'5 V')+line(x,150,335,150)+line(x,top,440,top)+line(x,bot,440,bot)+dot(x,150);}
      if(n===3){b+=source(x,top,x,bot,'5 V', 'v',-1)+resistor(335,top,335,bot,'3 Ω')+line(x,top,440,top)+line(x,bot,440,bot);}
    }else{
      if(n<2){b+=n===0?source(x,top,x,bot,'5 A','i',-1):source(x,bot,x,top,'5 A','i',-1);b+=resistor(340,top,340,bot,n===0?'5 Ω':'10 Ω')+line(x,top,440,top)+line(x,bot,440,bot);}
      if(n===2){b+=resistor(x,top,x,155,'3 Ω',-28)+source(x,155,x,bot,'5 A','i',-1)+resistor(340,top,340,bot,'2 Ω')+line(x,top,440,top)+line(x,bot,440,bot);}
      if(n===3){b+=source(x,bot,x,top,'5 A','i',-1)+resistor(x,top,440,top,'2 Ω')+line(x,bot,440,bot);}
    }
    const out=(kind==='norton'&&n<2)?420:440;
    return svg(b+dot(out,top,true)+dot(out,bot,true)+text(out+25,top+6,'a')+text(out+25,bot+6,'b')+text(340,325,`(${String.fromCharCode(97+n)})`,'small'),`Original circuit (${String.fromCharCode(97+n)}) for source conversion`);
  };
  const branch=()=>{
    let b=source(95,65,290,65,'E₁'); // reverse source polarity below
    b=source(290,65,95,65,'E₁')+source(290,65,570,65,'E₂')+resistor(95,65,95,305,'R₁',25)+resistor(570,65,570,305,'R₂')+source(290,180,290,65,'E₃','v',-1)+resistor(290,180,290,305,'R₃',-25)+resistor(290,305,570,305,'R₄',-28)+line(95,305,290,305)+resistor(290,65,570,305,'R₅',32);
    b+=arrow(67,220,67,155,'I₁',49,179)+arrow(490,43,540,43,'I₂',512,32)+arrow(319,238,319,290,'I₃',342,268)+arrow(325,330,375,330,'I₄',350,355)+arrow(493,205,450,168,'I₅',494,175);
    b+=dot(290,65)+text(300,45,'A','accent')+dot(570,305)+text(592,316,'B','accent')+dot(290,305)+line(290,305,290,330)+ground(290,345)+text(260,365,'0','small');
    return svg(b,'Five-branch network: E1 positive toward A, E2 positive toward A, E3 positive below A; ground at lower left',680,395);
  };
  const diagrams={
    'h1-1':()=>svg(line(95,245,95,205)+source(95,205,95,85,'3 V','v',-1)+line(95,85,215,85)+resistor(215,85,435,85,'3 Ω')+resistor(435,85,590,245,'2 Ω',-28)+line(215,85,215,200)+line(435,85,540,30)+dot(95,245,true)+text(76,268,'A')+dot(590,245,true)+text(610,270,'B')+dot(215,200,true)+dot(540,30,true)+dot(215,85)+dot(435,85)+arrow(126,212,126,157,'I',143,180)+arrow(240,123,240,177,'1 A',266,153)+arrow(524,57,475,82,'2 A',518,95)+arrow(505,124,550,170,'3.5 A',565,136)+arrow(135,290,560,290,'UAB',343,319),'Find I and UAB: 3 V source positive at A, 1 A leaves left junction, 2 A enters right junction, 3.5 A leaves toward B'),
    'h1-2':(order=[0,1,2,3])=>{
      let b='';for(let i=0;i<4;i++){
        const x=45+i*170;let g='';
        if(i===0)g+=source(x+15,75,x+15,210,'','v',-1)+text(x+48,188,'10 V','small label-bg')+resistor(x+15,75,x+115,75,'2 Ω')+line(x+15,210,x+115,210);
        if(i===1)g+=source(x+15,75,x+15,210,'','i',-1)+text(x+48,188,'5 A','small label-bg')+resistor(x+15,75,x+115,75,'2 Ω')+line(x+15,210,x+115,210);
        if(i>=2)g+=(i===2?source(x+15,210,x+15,75,'','i',-1)+text(x+48,188,'5 A','small label-bg'):source(x+15,75,x+15,210,'','v',-1)+text(x+48,188,'10 V','small label-bg'))+resistor(x+73,75,x+73,210,'2 Ω',18)+line(x+15,75,x+135,75)+line(x+15,210,x+135,210);
        const end=x+(i<2?115:135);g+=dot(end,75,true)+dot(end,210,true)+text(end+8,100,'+','small')+text(end+8,190,'−','small')+text(end+8,151,'U','small')+(i===0?arrow(x+50,110,x+100,110,'I',x+76,132):arrow(end-8,110,end-48,110,'I',end-28,132))+text(x+70,250,`(${String.fromCharCode(97+i)})`);
        b+=g;
        const shape=order[i],ox=x+28,oy=385;b+=line(ox-10,oy,ox+113,oy,'axis')+line(ox,oy+13,ox,285,'axis')+text(ox+10,282,'U (V)','small')+text(ox+100,427,'I (A)','small')+(shape===3?'':text(ox-11,405,'0','small'));
        if(shape===0)b+=line(ox,325,ox+85,325)+text(ox-16,329,'10','small');
        if(shape===1)b+=line(ox,325,ox+85,oy)+text(ox-16,329,'10','small')+text(ox+85,402,'5','small');
        if(shape===2)b+=line(ox+70,oy,ox+70,309)+text(ox+70,402,'5','small');
        if(shape===3)b+=line(ox-30,oy,ox+90,305)+text(ox-30,405,'−5','small')+text(ox+7,405,'0','small')+text(ox-14,367,'10','small');
        b+=text(x+70,448,`(${String.fromCharCode(101+i)})`);
      }return svg(b,'Four circuits a–d and four voltage-current characteristic graphs e–h',730,475);
    },
    'h1-3':()=>svg(source(125,290,125,60,'12 A','i',-1)+line(125,60,530,60)+line(125,290,530,290)+resistor(325,60,325,175,'R₁ = 3 Ω',-28)+resistor(325,175,325,290,'R₂ = 3 Ω',-28)+resistor(530,60,530,175,'R₃ = 6 Ω')+resistor(530,175,530,290,'R₄ = 3 Ω')+line(325,175,530,175)+dot(325,175)+dot(530,175)+arrow(392,155,463,155,'I'),'12 A current source feeding a shorted resistor bridge; I is left to right in the bridge'),
    'h1-4':()=>svg(resistor(35,150,185,150,'R₁',-25)+resistor(185,65,360,65,'R₂',-30)+resistor(185,235,360,235,'R₃',-25)+line(185,65,185,235)+resistor(360,65,360,235,'R₄')+resistor(360,65,550,65,'R₅',-30)+resistor(360,235,550,235,'R₆',-25)+line(550,65,550,235)+line(550,150,620,150)+line(620,150,620,315)+resistor(35,315,185,315,'R₇',-25)+line(185,315,620,315)+arrow(50,125,110,125,'I₁')+arrow(220,36,285,36,'I₂')+arrow(220,208,285,208,'I₃')+arrow(331,122,331,182,'I₄',306,156)+arrow(415,36,480,36,'I₅')+arrow(415,208,480,208,'I₆')+arrow(110,286,50,286,'I₇')+dot(185,150)+dot(360,65)+dot(360,235)+dot(550,150),'KCL network with I1=8 A, I2=5 A, I4=-1 A',680,370),
    'h1-7':()=>svg(source(80,65,80,285,'2 V','v',-1)+resistor(80,65,260,65,'2 kΩ')+line(260,65,580,65)+line(80,285,580,285)+resistor(260,65,260,285,'2 kΩ',-27)+source(370,285,370,65,'1 mA','i',-1)+resistor(475,65,475,285,'1 kΩ',20)+resistor(580,65,580,285,'0.5 kΩ',20)+arrow(610,81,610,133,'I',633,111),'Parallel-source network with 2 V, 1 mA, 2 kΩ, 2 kΩ, 1 kΩ and 0.5 kΩ'),
    'h1-8':()=>{
      const a=[140,55],b=[535,55],c=[535,345],d=[140,345],o=[338,200];
      let s=resistor(...a,...b,'50 Ω')+resistor(...b,...c,'10 Ω')+resistor(...d,...c,'10 Ω',-30)+resistor(...a,...d,'300 Ω',-28);
      s+=source(...a,...o,'','v',-1)+source(...b,...o,'')+source(...o,...c,'')+source(...d,...o,'','v',-1)+text(218,101,'5 V','small label-bg')+text(457,101,'20 V','small label-bg')+text(457,316,'10 V','small label-bg')+text(218,316,'2 V','small label-bg');
      [[a,'A'],[b,'B'],[c,'C'],[d,'D']].forEach(([p,n])=>s+=dot(...p)+text(p[0]+(p[0]<300?-20:20),p[1]+6,n));s+=dot(...o)+text(338,184,'O','small');
      s+=arrow(293,176,263,153,'IS₁',254,184)+arrow(378,172,410,146,'IS₂',426,182)+arrow(375,226,407,252,'IS₃',432,230)+arrow(294,231,264,254,'IS₄',244,231);
      s+=arrow(212,26,269,26,'I₁',238,15)+arrow(569,109,569,155,'I₂',590,132)+arrow(220,377,275,377,'I₃',247,398)+arrow(100,110,100,154,'I₄',78,133);
      return svg(s,'Four ideal voltage sources connected from center O to corners A B C D; source-current arrows point outward',680,425);
    },
    'h2-1':()=>svg(`<rect class="component" x="95" y="70" width="170" height="210" rx="7"/>`+text(180,168,'Circuit')+text(180,193,'box')+line(265,95,470,95)+line(265,255,470,255)+resistor(470,95,470,255,'R')+dot(355,95,true)+dot(355,255,true)+text(355,125,'+')+text(355,178,'U')+text(355,232,'−')+arrow(296,68,345,68,'I'),'Circuit box with external load R; U measured positive at upper terminal'),
    'h2-2':()=>svg(`<rect x="45" y="35" width="445" height="290" rx="6" class="wire dashed"/>`+source(85,290,85,70,'8 mA','i',-1)+line(85,70,235,70)+line(235,70,360,70)+resistor(235,70,235,180,'R₁ = 2 kΩ',-25)+source(235,180,235,290,'4 V','v',-1)+resistor(360,70,360,290,'R₂ = 2 kΩ',25)+resistor(360,70,560,70,'R₃ = 4 kΩ',-26)+resistor(560,70,560,290,'R',25)+line(85,290,560,290)+arrow(501,43,551,43,'I')+text(625,118,'+')+text(625,189,'UR')+text(625,255,'−'),'Maximum power network: 8 mA current source, 4 V source, 2 kΩ, 2 kΩ and series 4 kΩ to load R',680,365),
    'h2-3':branch,
    'h2-4':()=>svg(resistor(230,55,230,175,'2 kΩ',-24)+resistor(230,175,230,295,'3 kΩ',-24)+resistor(445,55,445,175,'2 kΩ')+resistor(445,175,445,295,'3 kΩ')+resistor(230,175,445,175,'2 kΩ')+resistor(65,175,230,175,'6 kΩ')+resistor(445,175,610,175,'6 kΩ')+ground(65,225)+line(65,175,65,210)+ground(610,225)+line(610,175,610,210)+dot(230,175)+dot(445,175)+text(248,203,'A')+text(463,203,'B')+dot(230,55,true)+dot(445,55,true)+dot(230,295,true)+dot(445,295,true)+text(230,30,'+12 V')+text(445,30,'−24 V')+text(230,331,'−24 V')+text(445,331,'+12 V'),'Two-node circuit: A connected to +12 V via 2 kΩ, -24 V via 3 kΩ and ground via 6 kΩ; B reversed; A-B 2 kΩ'),
    'h2-5':()=>{
      let b=line(85,55,85,335)+line(585,55,585,335);for(let n=0;n<3;n++){const y=55+90*n;b+=source(85,y,265,y,'E = 110 V')+resistor(265,y,405,y,'R₁ = 2 Ω',-25)+resistor(405,y,585,y,'R₂ = 18 Ω',-25)+arrow(540,y-20,580,y-20,`I${'₁₂₃'[n]}`,560,y-31);}
      b+=line(85,335,305,335)+line(340,335,585,335)+dot(305,335,true)+dot(340,335,true)+line(305,330,336,310)+text(324,368,'K');return svg(b,'Three identical 110 V sources positive at left, each in series with 2 Ω and 18 Ω; switch K across common terminals',680,395);
    },
    'h2-6':branch,
    'h2-7':()=>svg(source(90,290,90,65,'1 A','i',-1)+resistor(90,65,285,65,'2 Ω')+resistor(285,65,490,65,'2 Ω',-30)+resistor(285,65,285,290,'2 Ω',-27)+resistor(490,65,490,290,'2 Ω',-27)+source(595,65,595,290,'8 V')+line(490,65,595,65)+line(90,290,595,290)+dot(285,65)+dot(490,65)+arrow(362,36,422,36,'I'),'Superposition circuit with 1 A source at left and 8 V source at right, four 2 Ω resistors'),
    'h2-8':()=>{
      let b=source(105,65,105,295,'60 V','v',-1)+resistor(105,65,540,65,'10 kΩ')+resistor(105,295,540,295,'6 kΩ',-28)+resistor(540,65,540,295,'30 kΩ',15);
      // Crossing diagonals are NOT connected: a curved crossover makes this explicit.
      b+=resistor(105,65,307,172,'3 kΩ',25)+line(337,188,540,295)+line(307,172,337,188)+resistor(105,295,310,187,'40 kΩ',-27)+`<path class="wire" d="M310 187L313.66 184.68A10 10 0 0 1 331.34 175.32L340 171"/>`+line(340,171,540,65);
      b+=dot(540,65)+dot(540,295)+line(540,65,625,65)+line(540,295,625,295)+dot(625,65,true)+dot(625,295,true)+text(540,39,'A')+text(540,329,'B')+text(655,100,'+')+text(655,191,'U')+text(655,263,'−');return svg(b,'60 V bridge; 10 kΩ top, 6 kΩ bottom, 3 kΩ top-left to B, 40 kΩ bottom-left to A, 30 kΩ between A and B; crossing not connected',700,365);
    },
    'h2-9':()=>svg(source(150,175,150,55,'8 V','v',-1)+source(150,295,150,175,'1 A','i',-1)+source(355,175,355,55,'2 A','i',-1)+source(355,295,355,175,'6 V','v',-1)+resistor(150,175,355,175,'2 Ω')+resistor(565,55,565,295,'2 Ω')+line(150,55,565,55)+line(150,295,565,295)+dot(150,175)+text(127,181,'C')+dot(355,175)+dot(565,55)+dot(565,295)+text(590,62,'A')+text(590,303,'B')+arrow(420,28,492,28,'I'),'Thevenin current circuit: left 8 V source positive below, central 6 V source positive below, 1 A and 2 A sources upward'),
    'h2-10':()=>phasors(null,null),
    'h2-11':()=>svg(text(340,92,'U̇₁ = (6 + j8) V')+text(340,177,'İ = (3 − j3) A')+text(340,262,'U̇₂ = (−6 − j8) V')+text(340,322,'f = 50 Hz · RMS phasors','small'),'Three RMS phasors: U1=6+j8 V, I=3-j3 A, U2=-6-j8 V')
  };
  for(let i=0;i<4;i++){diagrams[`h1-5${'abcd'[i]}`]=()=>pair('norton',i);diagrams[`h1-6${'abcd'[i]}`]=()=>pair('thevenin',i);}
  function phasors(a,b){
    let s=line(90,190,580,190,'axis')+line(320,320,320,25,'axis')+text(586,214,'Re','small')+text(344,31,'Im','small')+text(300,210,'0','small');
    if(a===null&&b===null)s+=text(340,125,'Build your phasor diagram','small')+text(340,151,'Enter RMS values and phases.','small');
    for(const [v,n,color] of [[a,'I₁','#4b8d66'],[b,'I₂','#c28b4f']]){
      if(!v||!Number.isFinite(v.mag)||!Number.isFinite(v.phase)||v.mag<0)continue;
      let r=Math.min(v.mag*7,220),rad=v.phase*Math.PI/180,x=320+r*Math.cos(rad),y=190-r*Math.sin(rad);
      s+=`<path d="M320 190L${x} ${y}" stroke="${color}" stroke-width="3"/><path d="M${x} ${y}l-10 -5v10z" fill="${color}" transform="rotate(${-v.phase} ${x} ${y})"/>`+text(x+(x>=320?18:-18),y-12,n,'small');
    }
    return svg(s,'Interactive RMS phasor diagram using your entered magnitudes and phases',680,355);
  }
  return {get:(id,options)=>diagrams[id]?diagrams[id](options):'',phasors,draw:{line,text,dot,arrow,resistor,source,ground,svg,esc}};
})();
