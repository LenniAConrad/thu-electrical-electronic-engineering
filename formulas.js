/* Basic reference formulas, independent of the exercise's numerical answers. */
const Formulas=(()=>{
  const entries={
    ohm:['Ohm’s law','U = RI; I = (V<sub>A</sub> − V<sub>B</sub>)/R','Current reference: A → B.'],
    voltage:['Voltage','U<sub>AB</sub> = V<sub>A</sub> − V<sub>B</sub>',''],
    kcl:['Kirchhoff’s current law','ΣI<sub>in</sub> = ΣI<sub>out</sub>','At each node.'],
    kvl:['Kirchhoff’s voltage law','ΣU = 0','Signed voltage changes around a closed loop.'],
    series:['Series resistors','R<sub>eq</sub> = R₁ + R₂ + ⋯',''],
    parallel:['Parallel resistors','1/R<sub>eq</sub> = 1/R₁ + 1/R₂ + ⋯<br>R₁ ∥ R₂ = R₁R₂/(R₁ + R₂)',''],
    divider:['Voltage division','U₂ = U R₂/(R₁ + R₂)','Two series resistors; U₂ is across R₂.'],
    currentDivider:['Current division','I₁ = I R₂/(R₁ + R₂); I₂ = I R₁/(R₁ + R₂)','Two parallel resistors; I = I₁ + I₂.'],
    sources:['Ideal sources','Voltage source: U = U<sub>s</sub><br>Current source: I = I<sub>s</sub>','Use the marked polarity and current direction.'],
    conversion:['Source conversion','I<sub>N</sub> = U<sub>th</sub>/R; U<sub>th</sub> = I<sub>N</sub>R<br>R<sub>N</sub> = R<sub>th</sub> = R','For 0 < R < ∞. Positive Uth = Va − Vb corresponds to IN from b to a.'],
    limits:['Ideal-source limits','Ideal voltage source: R<sub>out</sub> = 0<br>Ideal current source: R<sub>out</sub> → ∞','No finite source conversion at these limits.'],
    deactivate:['Deactivate independent sources','U<sub>s</sub> = 0 → short circuit<br>I<sub>s</sub> = 0 → open circuit','For equivalent resistance or superposition.'],
    thevenin:['Thévenin equivalent','U<sub>th</sub> = U<sub>open</sub><br>I<sub>L</sub> = U<sub>th</sub>/(R<sub>th</sub> + R<sub>L</sub>)<br>U<sub>L</sub> = U<sub>th</sub>R<sub>L</sub>/(R<sub>th</sub> + R<sub>L</sub>)','Rth: resistance seen at the load terminals, with independent sources deactivated.'],
    power:['Resistor power','P = UI = I²R = U²/R','Passive sign convention.'],
    maximum:['Maximum power','R<sub>L</sub> = R<sub>th</sub>; P<sub>max</sub> = U<sub>th</sub>²/(4R<sub>th</sub>)','Resistive DC circuit; Rth > 0.'],
    nodes:['Node equations','Σ(V<sub>node</sub> − V<sub>adjacent</sub>)/R = I<sub>injected</sub>','Include any series source voltage with its sign.'],
    superposition:['Superposition','I = I′ + I″ + ⋯; U = U′ + U″ + ⋯','One independent source active at a time. Add signed contributions.'],
    switch:['Ideal switch','Closed: U<sub>K</sub> = 0<br>Open: I<sub>K</sub> = 0',''],
    sinusoid:['Sinusoid','x(t) = X̂ sin(ωt + φ)<br>ω = 2πf; T = 1/f; X = X̂/√2','X is RMS; X̂ is peak.'],
    phasor:['RMS phasor · sine reference','Ẋ = X∠φ = a + jb<br>X = √(a² + b²); φ = atan2(b, a)<br>x(t) = √2 X sin(2πft + φ)','Use the correct quadrant. Convert φ to radians when adding it to 2πft.'],
    phase:['Phase relationship','Δφ = φ₁ − φ₂','Same frequency; reduce Δφ to (−180°, 180°]. Positive: 1 leads 2; negative: 1 lags 2; zero: in phase.'],
    units:['Units','1 kΩ = 10³ Ω; 1 mA = 10⁻³ A<br>V/kΩ = mA; V · mA = mW','']
  };
  const tex={
    ohm:String.raw`U=RI,\qquad I=\frac{V_A-V_B}{R}`,
    voltage:String.raw`U_{AB}=V_A-V_B`,
    kcl:String.raw`\sum I_{\mathrm{in}}=\sum I_{\mathrm{out}}`,
    kvl:String.raw`\sum U=0`,
    series:String.raw`R_{\mathrm{eq}}=R_1+R_2+\cdots`,
    parallel:String.raw`\frac1{R_{\mathrm{eq}}}=\frac1{R_1}+\frac1{R_2}+\cdots,\qquad R_1\parallel R_2=\frac{R_1R_2}{R_1+R_2}`,
    divider:String.raw`U_2=U\frac{R_2}{R_1+R_2}`,
    currentDivider:String.raw`I_1=I\frac{R_2}{R_1+R_2},\qquad I_2=I\frac{R_1}{R_1+R_2}`,
    sources:String.raw`\text{Voltage source: }U=U_s\qquad\text{Current source: }I=I_s`,
    conversion:String.raw`I_N=\frac{U_{\mathrm{th}}}{R},\quad U_{\mathrm{th}}=I_NR,\quad R_N=R_{\mathrm{th}}=R`,
    limits:String.raw`\text{Ideal voltage source: }R_{\mathrm{out}}=0\\\text{Ideal current source: }R_{\mathrm{out}}\to\infty`,
    deactivate:String.raw`U_s=0\Rightarrow\text{short circuit}\\I_s=0\Rightarrow\text{open circuit}`,
    thevenin:String.raw`U_{\mathrm{th}}=U_{\mathrm{open}}\\I_L=\frac{U_{\mathrm{th}}}{R_{\mathrm{th}}+R_L},\qquad U_L=\frac{U_{\mathrm{th}}R_L}{R_{\mathrm{th}}+R_L}`,
    power:String.raw`P=UI=I^2R=\frac{U^2}{R}`,
    maximum:String.raw`R_L=R_{\mathrm{th}},\qquad P_{\max}=\frac{U_{\mathrm{th}}^2}{4R_{\mathrm{th}}}`,
    nodes:String.raw`\sum\frac{V_{\mathrm{node}}-V_{\mathrm{adjacent}}}{R}=I_{\mathrm{injected}}`,
    superposition:String.raw`I=I'+I''+\cdots,\qquad U=U'+U''+\cdots`,
    switch:String.raw`\text{Closed: }U_K=0\qquad\text{Open: }I_K=0`,
    sinusoid:String.raw`x(t)=\hat X\sin(\omega t+\varphi)\\\omega=2\pi f,\qquad T=\frac1f,\qquad X=\frac{\hat X}{\sqrt2}`,
    phasor:String.raw`\underline X=X\angle\varphi=a+jb\\X=\sqrt{a^2+b^2},\quad\varphi=\operatorname{atan2}(b,a)\\x(t)=\sqrt2 X\sin(2\pi ft+\varphi)`,
    phase:String.raw`\Delta\varphi=\varphi_1-\varphi_2`,
    units:String.raw`1\,\mathrm{k\Omega}=10^3\,\Omega,\quad1\,\mathrm{mA}=10^{-3}\,\mathrm A\\\mathrm{V/k\Omega}=\mathrm{mA},\qquad\mathrm V\cdot\mathrm{mA}=\mathrm{mW}`
  };
  const map={
    'h1-1':['ohm','voltage','kcl','kvl'],
    'h1-2':['ohm','kcl','kvl','sources'],
    'h1-3':['parallel','currentDivider','kcl'],
    'h1-4':['kcl'],
    'h1-7':['conversion','parallel','kcl','ohm','units'],
    'h1-8':['voltage','sources','ohm','kcl'],
    'h2-1':['thevenin','divider','units'],
    'h2-2':['nodes','parallel','series','deactivate','thevenin','power','maximum','units'],
    'h2-3':['ohm','kcl','kvl'],
    'h2-4':['voltage','ohm','nodes','kcl','units'],
    'h2-5':['switch','series','kvl','kcl'],
    'h2-6':['voltage','ohm','nodes','kcl'],
    'h2-7':['superposition','deactivate','ohm','currentDivider','divider'],
    'h2-8':['thevenin','deactivate','divider','parallel','series','units'],
    'h2-9':['thevenin','deactivate','voltage','kcl','kvl','ohm'],
    'h2-10':['sinusoid','phasor','phase'],
    'h2-11':['sinusoid','phasor']
  };
  for(const part of 'abcd')for(const type of ['5','6'])map['h1-'+type+part]=['sources','conversion',...(part==='d'?['limits']:['ohm'])];
  function render(id,all=false){
    return (all?Object.keys(entries):map[id]).map(key=>{const [name,formula,note]=entries[key];return `<div class="formula-item" data-formula="${key}"><dt>${name}</dt><dd>${typeof MathView!=='undefined'?MathView.html(tex[key],true):formula}</dd>${note?`<dd class="formula-note">${note}</dd>`:''}</div>`;}).join('');
  }
  return {render,map,entries};
})();
