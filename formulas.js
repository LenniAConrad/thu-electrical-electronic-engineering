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
    return (all?Object.keys(entries):map[id]).map(key=>{const [name,formula,note]=entries[key];return `<div class="formula-item" data-formula="${key}"><dt>${name}</dt><dd>${formula}</dd>${note?`<dd class="formula-note">${note}</dd>`:''}</div>`;}).join('');
  }
  return {render,map,entries};
})();
