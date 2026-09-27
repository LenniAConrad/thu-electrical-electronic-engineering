const Questions = (() => {
  const n=(key,label,answer,unit='',extra={})=>({key,label,answer,unit,type:'number',...extra});
  const choice=(key,label,answer,options)=>({key,label,answer,options,type:'choice'});
  const equation=(key,label,answer,extra={})=>({key,label,answer,type:'equation',...extra});
  const expression=(key,label,answer)=>({key,label,answer,type:'expression'});
  const q=(id,ref,title,topic,statement,fields,hint,solution,extra={})=>({id,set:Number(id.match(/^h(\d+)-/)[1]),ref,title,topic,statement,fields,hint,solution,...extra});
  const qs=[
    q('h1-1','1','Current & voltage','KCL · KVL','In the diagram, the current I is [Fill in 1] A, and the voltage U<sub>AB</sub> is [Fill in 2] V.',[
      n('i','Current I',2.5,'A'),n('u','Voltage UAB',14.5,'V')
    ],'Start at the right junction: how much current must arrive through the 3 Ω resistor? Then work back toward A.',
    'At the right junction, i + 2 = 3.5, so i = 1.5 A through the 3 Ω resistor. At the left junction, I = 1.5 + 1 = 2.5 A.<br>From A to B: UAB = 3 + 3 × 1.5 + 2 × 3.5 = 14.5 V.'),
    q('h1-2','2','Match the characteristics','Source characteristics','Please indicate the volt-ampere characteristics of circuits (a), (b), (c), and (d): (fill in the letters)',
      ['f','g','h','e'].map((v,i)=>choice('c'+i,`Circuit (${String.fromCharCode(97+i)})`,v,['e','f','g','h'].map(x=>[x,`Curve (${x})`]))),
      'Pay attention to the current reference direction. An ideal voltage source fixes U; an ideal current source fixes I.',
      '(a) U = 10 − 2I → (f).<br>(b) I = 5 A → (g).<br>(c) U = 10 + 2I → (h).<br>(d) U = 10 V → (e).'),
    q('h1-3','3','The shorted bridge','Current division','In the circuit shown in the diagram, the current I is (A) 3 A (B) 2 A (C) 6 A (D) 12 A.',[
      choice('i','Current I','2',[['3','A · 3 A'],['2','B · 2 A'],['6','C · 6 A'],['12','D · 12 A']])
    ],'The middle wire makes the two midpoint voltages equal. Treat the upper pair and lower pair as separate parallel combinations.',
    'The upper resistors give 3 ∥ 6 = 2 Ω, so the voltage across them is 12 × 2 = 24 V. Their currents are 8 A on the left and 4 A on the right. The lower 3 Ω resistors each carry 6 A. The middle wire carries I = 8 − 6 = 2 A to the right (B).'),
    q('h1-4','1.3','Follow the current','Kirchhoff’s current law','The circuit is shown in Figure P1.3. Given I₁ = 8 A, I₂ = 5 A, I₄ = −1 A, find the current I₃ and I₅–I₇.',[
      n('i3','I₃',3,'A'),n('i5','I₅',6,'A'),n('i6','I₆',2,'A'),n('i7','I₇',8,'A')
    ],'At every junction, total current entering equals total current leaving. Keep the negative sign on I₄.',
    'I₃ = I₁ − I₂ = 8 − 5 = 3 A.<br>I₅ = I₂ − I₄ = 5 − (−1) = 6 A.<br>I₆ = I₃ + I₄ = 3 + (−1) = 2 A.<br>I₇ = I₅ + I₆ = 6 + 2 = 8 A.')
  ];
  const convStatement='Try to convert the voltage sources in each circuit shown in Figure P1.5 into current sources. If conversion is not possible, please provide reasons.';
  const convSolutions=[
    'IN = 10 / 2 = 5 A, directed from b to a (upward). The 2 Ω resistor is in parallel with the current source.',
    'The open-circuit voltage Va − Vb is −6 V. IN = −6 / 3 = −2 A for an upward reference, so the equivalent source is 2 A downward with 3 Ω in parallel.',
    'The 3 Ω resistor is in parallel with an ideal 5 V source and cannot change its terminal voltage. Convert the remaining 5 V source and series 2 Ω: IN = 2.5 A upward, RN = 2 Ω.',
    'The ideal 5 V source is directly across a–b, so its output resistance is zero. A finite Norton current would require IN = 5 / 0. No finite current-source equivalent exists; the parallel 3 Ω resistor does not change that.'
  ];
  for(let i=0;i<4;i++)qs.push(q(`h1-5${'abcd'[i]}`,`1.5${'abcd'[i]}`,`Voltage → current (${'abcd'[i]})`,'Source conversion',convStatement,i<3?[
    n('in','Current-source magnitude',[5,2,2.5][i],'A'),choice('direction','Current direction',i===1?'down':'up',[['up','Upward · b → a'],['down','Downward · a → b']]),n('r','Parallel resistance',[2,3,2][i],'Ω')
  ]:[choice('possible','Finite current-source equivalent?','no',[['yes','Yes'],['no','No']]),choice('reason','Reason','zero',[['zero','Ideal voltage source across terminals: zero output resistance'],['series','The output resistance is infinite'],['parallel','A parallel resistor always prevents conversion']])],
  i===3?'Look at what directly fixes the voltage at a and b.':'Find the open-circuit voltage Va − Vb and the series resistance. Then IN = Uoc / R.',convSolutions[i]));
  const vSolutions=[
    'The downward 5 A source makes Va − Vb = −5 × 5 = −25 V. Equivalent: 25 V with its positive terminal at b (bottom), in series with 5 Ω.',
    'Va − Vb = 5 × 10 = 50 V. Equivalent: 50 V with its positive terminal at a (top), in series with 10 Ω.',
    'The 3 Ω resistor in series with an ideal current source does not change the external current. Thus Va − Vb = −5 × 2 = −10 V. Equivalent: 10 V, positive at b, in series with 2 Ω.',
    'There is no finite resistor in parallel with the ideal current source. Its output resistance is infinite, and no finite Thévenin voltage-source equivalent exists. The series 2 Ω resistor does not limit the ideal source current.'
  ];
  for(let i=0;i<4;i++)qs.push(q(`h1-6${'abcd'[i]}`,`1.6${'abcd'[i]}`,`Current → voltage (${'abcd'[i]})`,'Source conversion','Try to convert each current source in the circuit shown in Figure P1.6 into a voltage source. If it cannot be converted, please explain the reason.',i<3?[
    n('v','Voltage-source magnitude',[25,50,10][i],'V'),choice('polarity','Positive terminal',i===1?'top':'bottom',[['top','a · top'],['bottom','b · bottom']]),n('r','Series resistance',[5,10,2][i],'Ω')
  ]:[choice('possible','Finite voltage-source equivalent?','no',[['yes','Yes'],['no','No']]),choice('reason','Reason','infinite',[['zero','Zero output resistance'],['infinite','Ideal current source without a parallel path: infinite output resistance'],['series','Any series resistor prevents conversion']])],
  i===3?'Which resistor provides a parallel path for the ideal current source?':'Determine the open-circuit voltage. The parallel resistance becomes the series resistance.',vSolutions[i]));
  qs.push(
    q('h1-7','1.7','Combine the sources','Source conversion','Using the method of equivalent interchange between voltage sources and current sources, find the current I in the circuit shown in Figure P1.7.',[n('i','Current I · downward',1,'mA')],
    'Convert 2 V in series with 2 kΩ into a Norton source. Combine the two current sources and all four parallel resistors.',
    'The voltage-source branch becomes 1 mA upward in parallel with 2 kΩ. Total source current is 2 mA.<br>1 / Req = 1 / 2000 + 1 / 2000 + 1 / 1000 + 1 / 500 = 0.004 S, so Req = 250 Ω.<br>U = 2 mA × 250 Ω = 0.5 V. Therefore I = 0.5 V / 0.5 kΩ = 1 mA downward.'),
    q('h1-8','1.12','Four ideal sources','Node voltages · KCL','Find the currents of the ideal voltage sources in the circuit shown in P1.12.',[
      n('is1','IS₁ · O → A',-0.29,'A'),n('is2','IS₂ · O → B',3.3,'A'),n('is3','IS₃ · O → C',-4.2,'A'),n('is4','IS₄ · O → D',1.19,'A')
    ],'Choose O as 0 V. The ideal voltage sources directly determine the four corner voltages.',
    'VA = 5 V, VB = 20 V, VC = −10 V, VD = 2 V.<br>I₁ = (5 − 20) / 50 = −0.30 A; I₂ = (20 + 10) / 10 = 3 A; I₃ = (2 + 10) / 10 = 1.2 A; I₄ = (5 − 2) / 300 = 0.01 A.<br>KCL gives IS₁ = I₁ + I₄ = −0.29 A; IS₂ = I₂ − I₁ = 3.3 A; IS₃ = −I₂ − I₃ = −4.2 A; IS₄ = I₃ − I₄ = 1.19 A.'),
    q('h2-1','1.9','Inside the circuit box','Thévenin equivalent','A resistor, R, was connected to a circuit box as shown in Figure 1.9. The voltage, U, was measured. The resistance was changed, and the voltage was measured again. The results are shown in the table. Determine the Thévenin equivalent of the circuit within the box and predict the voltage, U, when R = 8 kΩ.',[
      n('vth','Thévenin voltage · top positive',12,'V'),n('rth','Thévenin resistance',4,'kΩ'),n('u','U when R = 8 kΩ',8,'V')
    ],'Use U = Vth × R / (Rth + R) for both measurements. This gives two equations in two unknowns.',
    'Using kΩ: 4 = Vth × 2 / (Rth + 2) and 6 = Vth × 4 / (Rth + 4). These yield Rth = 4 kΩ and Vth = 12 V.<br>For R = 8 kΩ, U = 12 × 8 / (4 + 8) = 8 V.',{extra:'<table class="small-table"><thead><tr><th>R</th><th>U</th></tr></thead><tbody><tr><td>2 kΩ</td><td>4 V</td></tr><tr><td>4 kΩ</td><td>6 V</td></tr></tbody></table>'}),
    q('h2-2','1.12','Maximum power','Thévenin · Power','The circuit is shown in Figure P1.12. I = 8 mA, U = 4 V, R₁ = R₂ = 2 kΩ, R₃ = 4 kΩ. What is the value of R (in kΩ) that can achieve the maximum power? What is the maximum power achieved on R?',[
      n('r','Load resistance R',5,'kΩ'),n('p','Maximum power on R',5,'mW')
    ],'For maximum power, match R to the Thévenin resistance seen from the load. Open the current source and short the voltage source when finding Rth.',
    'With independent sources deactivated, Rth = R₃ + (R₁ ∥ R₂) = 4 + 1 = 5 kΩ.<br>With the load open, no current flows in R₃. The internal node satisfies (V − 4) / 2 + V / 2 = 8 (V/kΩ = mA), giving Vth = 10 V.<br>R = Rth = 5 kΩ; Pmax = Vth² / (4Rth) = 100 / 20000 W = 5 mW.'),
    q('h2-3','1.18','Write the branch equations','Branch-current method','As shown in Figure P1.18, the branch current method is required to calculate the current of each branch. Please list the necessary equations.',[
      equation('a','KCL at A','I1+I5=I2+I3'),equation('b','KCL at B','I2+I4=I5'),equation('left','KVL · left loop (R₁, R₃)','R1*I1+R3*I3=E1+E3'),equation('right','KVL · right loop (R₂, R₅)','R2*I2+R5*I5=-E2'),equation('lower','KVL · lower loop (R₃, R₄, R₅)','R3*I3+R4*I4+R5*I5=E3')
    ],'There are five branch currents. Use two independent KCL equations and three independent KVL equations. Follow the marked current and source directions.',
    'At A: I₁ + I₅ = I₂ + I₃. At B: I₂ + I₄ = I₅.<br>The left loop gives R₁I₁ + R₃I₃ = E₁ + E₃.<br>The right loop gives R₂I₂ + R₅I₅ = −E₂.<br>The lower loop gives R₃I₃ + R₄I₄ + R₅I₅ = E₃.<br>These five independent equations determine the five branch currents when the component values are supplied.',{instructions:'Use I1… I5, R1… R5 and E1… E3. Enter each equation with =. Reordered terms and constant multiples are accepted.',caption:'A, B and the reference node are added to identify the equation inputs.'}),
    q('h2-4','1.19','Two node potentials','Node-potential method','The circuit is shown in Figure P1.19. Use the node potential method to calculate the potentials at points A and B.',[
      n('va','Potential VA',-3.5,'V'),n('vb','Potential VB',-6.5,'V')
    ],'Write one KCL equation at each node. Use the marked ground symbols as the 0 V reference.',
    'Using resistances in kΩ:<br>(VA − 12)/2 + (VA + 24)/3 + VA/6 + (VA − VB)/2 = 0.<br>(VB + 24)/2 + (VB − 12)/3 + VB/6 + (VB − VA)/2 = 0.<br>These simplify to 3VA − VB = −4 and −VA + 3VB = −16. Solving gives VA = −3.5 V and VB = −6.5 V.'),
    q('h2-5','1.20','Open or closed?','Switching · Parallel branches','In the circuit shown in Figure P1.20, given E = 110 V, R₁ = 2 Ω, R₂ = 18 Ω, when switch K is closed and is open, what are the values of I₁, I₂, I₃ respectively?',[
      ...[1,2,3].map(i=>n('closed'+i,`I${'₁₂₃'[i-1]} · K closed`,-5.5,'A',{group:i===1?'Switch closed':undefined})),
      ...[1,2,3].map(i=>n('open'+i,`I${'₁₂₃'[i-1]} · K open`,0,'A',{group:i===1?'Switch open':undefined}))
    ],'Closed K makes the left and right rails equipotential. With K open, all three identical branches have the same current, and their total must be zero.',
    'Closed: 0 = E + (R₁ + R₂)I, so each rightward current is −110 / 20 = −5.5 A. The actual current flows leftward.<br>Open: each branch has I = (Vleft − Vright − E) / 20. KCL requires 3I = 0, so I₁ = I₂ = I₃ = 0 A, and Vleft − Vright = 110 V.'),
    q('h2-6','1.21','Set up node analysis','Node-potential method','Using the node potential method to analyze the circuit shown in Figure P1.21, find the current I.',[
      equation('a','Node A equation','(VA-E1)/R1+(VA-E2-VB)/R2+(VA+E3)/R3+(VA-VB)/R5=0'),
      equation('b','Node B equation','(VB-VA+E2)/R2+VB/R4+(VB-VA)/R5=0'),
      expression('i1','I₁ in terms of node potentials','(E1-VA)/R1'),expression('i2','I₂ in terms of node potentials','(VA-E2-VB)/R2'),expression('i3','I₃ in terms of node potentials','(VA+E3)/R3'),expression('i4','I₄ in terms of node potentials','-VB/R4'),expression('i5','I₅ in terms of node potentials','(VB-VA)/R5')
    ],'Use the bottom-left rail as ground. Express each branch current in VA and VB, accounting for the polarity of the series voltage sources.',
    'The supplied sheet repeats the symbolic five-branch figure from 1.18, labels it “Fig. P1.19”, and gives neither numerical values nor a single arrow I. A unique numerical answer for I cannot be determined.<br>For the displayed network, use the two node equations shown in the answers. Then I₁ = (E₁ − VA)/R₁, I₂ = (VA − E₂ − VB)/R₂, I₃ = (VA + E₃)/R₃, I₄ = −VB/R₄, I₅ = (VB − VA)/R₅.',
    {note:'The sheet repeats the figure from 1.18 and does not specify a current I or component values. Practice the node equations and the five labelled currents here.',instructions:'Use VA, VB, E1… E3 and R1… R5. Ground is the lower-left rail. Enter equations for the first two fields, expressions for the currents.',caption:'The figure is preserved; A, B and ground are added for node analysis.'}),
    q('h2-7','1.23','Add the contributions','Superposition','Use the superposition principle to find I in the circuit shown in Figure P1.23.',[n('i','Current I · rightward',-1.5,'A')],
    'Keep one independent source active at a time. Replace the other voltage source with a short, or the other current source with an open circuit.',
    'With only the 1 A source active, the 8 V source is shorted. The current splits equally between two 2 Ω paths, contributing +0.5 A.<br>With only the 8 V source active, the 1 A source is opened. The middle node is at 4 V, contributing (4 − 8)/2 = −2 A.<br>I = 0.5 − 2 = −1.5 A.'),
    q('h2-8','1.25','A bridge, simplified','Thévenin’s theorem','Use Thevenin’s Theorem to find U = ? in the circuit shown in Figure P1.25.',[n('u','Voltage U = VA − VB',6,'V')],
    'Treat 30 kΩ as the load. Remove it to find the open-circuit voltage between A and B. The crossing diagonals are not connected.',
    'With 30 kΩ removed, VA = 60 × 40/(10 + 40) = 48 V, and VB = 60 × 6/(3 + 6) = 40 V, so Vth = 8 V.<br>Short the 60 V source: Rth = (10 ∥ 40) + (3 ∥ 6) = 8 + 2 = 10 kΩ.<br>Reconnect 30 kΩ: U = 8 × 30/(10 + 30) = 6 V.',{caption:'The diagonal wires cross without a connection.'}),
    q('h2-9','1.26','Find the load current','Thévenin’s theorem','Use Thevenin’s Theorem to find the current I = ? in the circuit shown in Figure P1.26.',[n('i','Current I · toward A, then A → B',-2,'A')],
    'Remove the right-hand 2 Ω load. Use a supernode around A and C. Check both voltage-source polarities carefully.',
    'Take B = 0 V. The middle junction is −6 V. The 8 V source gives VC = VA + 8.<br>With the load open, the 1 A and 2 A sources inject 3 A into the A–C supernode. Thus (VC + 6)/2 = 3, giving VC = 0 and Vth = VA = −8 V.<br>Deactivate the sources: the two voltage sources become shorts and current sources become opens; Rth = 2 Ω.<br>I = −8/(2 + 2) = −2 A.'),
    q('h2-10','2.1','Read the sinusoidal currents','RMS · Frequency · Phasors','Given the currents i₁ = 20√2 sin(1000t + 30°) A and i₂ = 30 sin(1000t − 20°) A, find the frequency, effective value, and initial phase of each current, and draw the phasor diagrams of i₁ and i₂ on the same coordinate. Compare their phase relationship, indicating whether one leads or lags behind the other.',[
      n('f1','Frequency f₁',1000/(2*Math.PI),'Hz',{group:'Current i₁'}),n('rms1','Effective value I₁',20,'A'),n('phase1','Initial phase φ₁',30,'°',{angle:true}),
      n('f2','Frequency f₂',1000/(2*Math.PI),'Hz',{group:'Current i₂'}),n('rms2','Effective value I₂',30/Math.sqrt(2),'A'),n('phase2','Initial phase φ₂',-20,'°',{angle:true}),
      choice('lead','Phase relationship','leads',[['leads','i₁ leads i₂'],['lags','i₁ lags i₂'],['same','They are in phase']]),n('difference','Phase difference',50,'°')
    ],'The angular frequency is ω, so f = ω/(2π). RMS current is peak current divided by √2. Use the sine reference of the given waveforms.',
    'Both currents have f = 1000/(2π) ≈ 159.155 Hz.<br>I₁ = 20 A RMS, φ₁ = +30°. I₂ = 30/√2 ≈ 21.213 A RMS, φ₂ = −20°.<br>With the sine reference, İ₁ = 20∠30° A and İ₂ = 21.213∠−20° A. i₁ leads i₂ by 30 − (−20) = 50°.',
    {instructions:'Use the sine reference. Your RMS values and phases draw the phasors above.',extra:'<div class="formula-block">i₁ = 20√2 sin(1000t + 30°) A<br>i₂ = 30 sin(1000t − 20°) A</div>',caption:'The diagram shows your entries. Arrow lengths represent RMS current.'}),
    q('h2-11','2.2','From phasors to waveforms','Complex numbers · Sinusoids','Write out the instantaneous value function formulas corresponding to each of the following phasors (f = 50 Hz): U̇₁ = (6 + j8) V, İ = (3 − j3) A, U̇₂ = (−6 − j8) V.',[
      n('a1','Peak amplitude Û₁',10*Math.sqrt(2),'V',{group:'u₁(t) = Û₁ sin(ω₁t + φ₁)'}),n('w1','Angular frequency ω₁',100*Math.PI,'rad/s'),n('p1','Initial phase φ₁',Math.atan2(8,6)*180/Math.PI,'°',{angle:true}),
      n('ai','Peak amplitude Î',6,'A',{group:'i(t) = Î sin(ωᵢt + φᵢ)'}),n('wi','Angular frequency ωᵢ',100*Math.PI,'rad/s'),n('pi','Initial phase φᵢ',-45,'°',{angle:true}),
      n('a2','Peak amplitude Û₂',10*Math.sqrt(2),'V',{group:'u₂(t) = Û₂ sin(ω₂t + φ₂)'}),n('w2','Angular frequency ω₂',100*Math.PI,'rad/s'),n('p2','Initial phase φ₂',Math.atan2(-8,-6)*180/Math.PI,'°',{angle:true})
    ],'The phasors are RMS values. Convert each complex number into magnitude and angle, multiply the magnitude by √2, and use ω = 2πf. Watch the quadrant of U̇₂.',
    'ω = 100π rad/s for all three.<br>u₁(t) = 10√2 sin(100πt + 53.130°) V.<br>i(t) = 6 sin(100πt − 45°) A.<br>u₂(t) = 10√2 sin(100πt − 126.870°) V. The equivalent phase 233.130° is also correct.',{instructions:'Build each sine-form expression with its peak amplitude, angular frequency and phase. Phases are in degrees; t is in seconds.',waveforms:true})
  );
  return qs;
})();
if(typeof module!=='undefined')module.exports=Questions;
