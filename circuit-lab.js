(() => {
  'use strict';
  const $=id=>document.getElementById(id),esc=Circuits.draw.esc,{quantity:q,num}=CircuitSolver;
  const key='thu-eee-circuit-lab-v1',clone=x=>JSON.parse(JSON.stringify(x)),undo=[],redo=[];
  const compact=(v,u)=>q(Number(v.toPrecision(3)),u);
  const types={R:'Resistor',V:'Voltage source',I:'Current source',W:'Wire',S:'Switch'};
  const units={R:[['Ω',1],['kΩ',1e3],['MΩ',1e6]],V:[['V',1],['mV',1e-3]],I:[['A',1],['mA',1e-3],['µA',1e-6]]};
  const part=(id,kind,a,b,value=0)=>({id,kind,a,b,value,closed:true});
  function example(which){
    if(which==='blank')return {nodes:[],parts:[],ground:null};
    if(which==='parallel')return {nodes:[['n0','0',160,480],['n1','A',160,160],['n2','B',490,160],['n3','C',820,160],['n4','D',490,480],['n5','E',820,480]].map(([id,name,x,y])=>({id,name,x,y})),parts:[part('V1','V','n1','n0',12),part('W1','W','n1','n2'),part('W2','W','n2','n3'),part('W3','W','n0','n4'),part('W4','W','n4','n5'),part('R1','R','n2','n4',1000),part('R2','R','n3','n5',2000)],ground:'n0'};
    if(which==='bridge')return {nodes:[['n0','0',140,520],['n1','A',140,120],['n2','B',500,120],['n3','C',350,320],['n4','D',760,320],['n5','E',500,520]].map(([id,name,x,y])=>({id,name,x,y})),parts:[part('V1','V','n1','n0',10),part('W1','W','n1','n2'),part('W2','W','n0','n5'),part('R1','R','n2','n3',1000),part('R2','R','n3','n5',1000),part('R3','R','n2','n4',1000),part('R4','R','n4','n5',2000),part('R5','R','n3','n4',1000)],ground:'n0'};
    if(which==='current')return {nodes:[['n0','0',180,480],['n1','A',180,160],['n2','B',740,160],['n3','C',740,480]].map(([id,name,x,y])=>({id,name,x,y})),parts:[part('I1','I','n0','n1',.006),part('R1','R','n1','n2',1000),part('R2','R','n2','n3',2000),part('W1','W','n3','n0')],ground:'n0'};
    return {nodes:[['n0','0',180,480],['n1','A',180,160],['n2','B',740,160],['n3','C',740,480]].map(([id,name,x,y])=>({id,name,x,y})),parts:[part('V1','V','n1','n0',12),part('R1','R','n1','n2',1000),part('R2','R','n2','n3',2000),part('W1','W','n3','n0')],ground:'n0'};
  }
  let circuit=example('divider'),tool='select',pending=null,selected={kind:'node',id:'n2'},result,drag=null,suppressClick=false;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let flow,flowShown=true,flowPlaying=!reducedMotion.matches,flowSpeed=1,flowTime=0,flowFrame=null,flowLast=null,flowPaths=[];
  try{const data=JSON.parse(localStorage.getItem(key));if(data){CircuitSolver.validate(data);circuit=data;selected=null;}}catch{$('save-state').textContent='Using the example circuit';}
  const node=id=>circuit.nodes.find(n=>n.id===id),name=id=>node(id)?.name||'?';
  const newId=(kind,items)=>{let i=1;while(items.some(x=>x.id===kind+i))i++;return kind+i;};
  const nodeOptions=id=>circuit.nodes.map(n=>`<option value="${n.id}" ${n.id===id?'selected':''}>${esc(n.name)}${n.id===circuit.ground?' (ground)':''}</option>`).join('');
  function save(){try{localStorage.setItem(key,JSON.stringify(circuit));$('save-state').textContent='Saved on this browser';}catch{$('save-state').textContent='Use Save circuit to keep a copy';}}
  function commit(before){undo.push(before);if(undo.length>60)undo.shift();redo.length=0;save();render();}
  function change(fn){const before=clone(circuit);fn();commit(before);}
  function setTool(t){tool=t;pending=null;document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===tool));help();draw();}
  function help(){
    $('tool-help').textContent=tool==='select'?'Click a junction or component to inspect it. Drag junctions to rearrange the circuit.':tool==='node'?'Click empty space to add a junction. Click a wire to split it with a new junction.':tool==='ground'?'Click a junction to make it the 0 V reference.':pending?`First terminal: ${name(pending)}. Click a different junction for the second terminal.`:`${types[tool]}: click the first junction, then the second. Edit its value in the panel.`;
  }
  function geometry(p){
    const a=node(p.a),b=node(p.b),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
    const siblings=circuit.parts.filter(x=>(x.a===p.a&&x.b===p.b)||(x.b===p.a&&x.a===p.b));
    // Orient parallel offsets by stable endpoint order, regardless of source direction.
    const offset=(siblings.indexOf(p)-(siblings.length-1)/2)*110*(p.a<p.b?1:-1);
    return {a,b,ux,uy,nx,ny,cx:(a.x+b.x)/2+nx*offset,cy:(a.y+b.y)/2+ny*offset,angle:Math.atan2(dy,dx)*180/Math.PI};
  }
  function drawPart(p){
    const {a,b,ux,uy,nx,ny,cx,cy,angle}=geometry(p),half=p.kind==='R'?34:23;
    const x1=cx-ux*half,y1=cy-uy*half,x2=cx+ux*half,y2=cy+uy*half;
    const chosen=selected?.kind==='part'&&selected.id===p.id,lead=`M${a.x} ${a.y}L${x1} ${y1} M${x2} ${y2}L${b.x} ${b.y}`,hit=`M${a.x} ${a.y}L${cx} ${cy}L${b.x} ${b.y}`;
    let body='';
    if(p.kind==='R')body=`<rect class="part-body" x="${cx-34}" y="${cy-11}" width="68" height="22" transform="rotate(${angle} ${cx} ${cy})"/>`;
    if(p.kind==='V'||p.kind==='I'){
      body=`<circle class="part-body" cx="${cx}" cy="${cy}" r="23"/>`;
      if(p.kind==='V')body+=`<text x="${cx-ux*11}" y="${cy-uy*11+6}" text-anchor="middle">+</text><text x="${cx+ux*11}" y="${cy+uy*11+6}" text-anchor="middle">−</text>`;
      else body+=Circuits.draw.vector(cx-ux*13,cy-uy*13,cx+ux*13,cy+uy*13,'#3c6749',2.5);
    }
    if(p.kind==='W')body=`<path class="part-wire" d="M${x1} ${y1}L${x2} ${y2}"/>`;
    if(p.kind==='S')body=`<circle class="part-body" cx="${x1}" cy="${y1}" r="4"/><circle class="part-body" cx="${x2}" cy="${y2}" r="4"/><path class="part-wire" d="M${x1} ${y1}L${x2+(p.closed?0:nx*25)} ${y2+(p.closed?0:ny*25)}"/>`;
    const value=p.kind==='R'?q(p.value,'Ω'):p.kind==='V'?q(p.value,'V'):p.kind==='I'?q(p.value,'A'):p.kind==='S'?(p.closed?'closed':'open'):'';
    const arrow=p.kind==='W'?'':Circuits.draw.vector(cx-ux*23-nx*43,cy-uy*23-ny*43,cx+ux*23-nx*43,cy+uy*23-ny*43,'#78934d',2);
    const motion=flow?.branches[p.id],dots=flowShown&&motion?.direction?`<path class="flow-dots" data-flow-part="${p.id}" data-direction="${motion.direction}" data-ratio="${motion.ratio}" d="M${a.x} ${a.y}L${x1} ${y1}L${x2} ${y2}L${b.x} ${b.y}" aria-hidden="true"/>`:'';
    return `<g class="part-group ${chosen?'selected':''}" data-part="${p.id}" tabindex="0" role="button" aria-label="${esc(p.id+' '+types[p.kind]+' '+value+' from '+name(p.a)+' to '+name(p.b))}"><path class="part-hit" d="${hit}"/><path class="part-wire" d="${lead}"/>${p.kind==='W'?body:''}${dots}${p.kind==='W'?'':body}${arrow}${p.kind==='W'?'':`<g data-label-part="${p.id}"><text x="0" y="0">${esc(p.id+(value?' · '+value:''))}</text>${result?.ok&&p.kind!=='W'?`<text class="label-small" x="0" y="23">${esc(compact(result.branches[p.id].current,'A'))}</text>`:''}</g>`}</g>`;
  }
  function layoutLabels(){
    const occupied=[],shapes=circuit.nodes.map(n=>({x:n.x-15,y:n.y-15,width:30,height:30})),lines=[];
    circuit.parts.forEach(p=>{
      const g=geometry(p),r=p.kind==='R'?38:27;
      shapes.push({x:g.cx-r,y:g.cy-r,width:r*2,height:r*2});
      lines.push([g.a.x,g.a.y,g.cx,g.cy],[g.cx,g.cy,g.b.x,g.b.y]);
      if(p.kind!=='W')shapes.push({x:g.cx-g.nx*43-Math.abs(g.ux*23)-7,y:g.cy-g.ny*43-Math.abs(g.uy*23)-7,width:Math.abs(g.ux*46)+14,height:Math.abs(g.uy*46)+14});
    });
    const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
    const crosses=(rect,line)=>{let [x,y,u,v]=line;for(let i=0;i<=16;i++){const t=i/16,px=x+(u-x)*t,py=y+(v-y)*t;if(px>=rect.x&&px<=rect.x+rect.width&&py>=rect.y&&py<=rect.y+rect.height)return true;}return false;};
    function place(el,candidates){
      const box=el.getBBox();let best=null;
      candidates.forEach(([x,y,cost=0],i)=>{
        const rect={x:x-box.width/2-5,y:y-box.height/2-4,width:box.width+10,height:box.height+8};
        let score=cost+i*.05+occupied.reduce((s,r)=>s+overlap(rect,r)*100,0)+shapes.reduce((s,r)=>s+overlap(rect,r)*5,0)+lines.filter(l=>crosses(rect,l)).length*60;
        if(rect.x<15||rect.x+rect.width>985||rect.y<15||rect.y+rect.height>625)score+=300;
        if(!best||score<best.score)best={score,rect,x:x-box.width/2-box.x,y:y-box.height/2-box.y};
      });
      el.setAttribute('transform',`translate(${best.x} ${best.y})`);occupied.push(best.rect);
    }
    for(const el of $('canvas').querySelectorAll('[data-label-node]')){
      const n=node(el.dataset.labelNode),candidates=[];
      for(const d of [48,65,85])for(const [dx,dy] of [[1,-1],[-1,-1],[1,1],[-1,1],[0,-1],[1,0],[-1,0]])candidates.push([n.x+dx*d,n.y+dy*d]);
      place(el,candidates);
    }
    for(const el of $('canvas').querySelectorAll('[data-label-part]')){
      const g=geometry(circuit.parts.find(p=>p.id===el.dataset.labelPart)),candidates=[];
      for(const dist of [60,-60,85,-85,115,-115])for(const shift of [0,55,-55,95,-95])candidates.push([g.cx+g.nx*dist+g.ux*shift,g.cy+g.ny*dist+g.uy*shift,Math.abs(shift)*.6+Math.abs(dist)*.1]);
      place(el,candidates);
    }
    const x=Math.min(0,...occupied.map(r=>r.x-15)),y=Math.min(0,...occupied.map(r=>r.y-15)),right=Math.max(1000,...occupied.map(r=>r.x+r.width+15)),bottom=Math.max(640,...occupied.map(r=>r.y+r.height+15));
    $('canvas').setAttribute('viewBox',`${x} ${y} ${right-x} ${bottom-y}`);$('canvas').style.minWidth=(right-x)+'px';
  }
  function draw(){
    $('canvas').innerHTML='<title>Circuit playground</title><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#d8e1ce"/></pattern></defs><rect width="1000" height="640" fill="url(#grid)"/>'+circuit.parts.map(drawPart).join('')+circuit.nodes.map(n=>{
      const ground=n.id===circuit.ground;return `<g class="junction ${selected?.kind==='node'&&selected.id===n.id?'selected':''} ${pending===n.id?'pending':''}" data-node="${n.id}" tabindex="0" role="button" aria-label="Junction ${esc(n.name)}${ground?', ground':''}${result?.ok?', '+q(result.voltages[n.id],'V'):''}"><circle cx="${n.x}" cy="${n.y}" r="8"/><g data-label-node="${n.id}"><text x="0" y="0">${esc(n.name)}</text>${result?.ok?`<text class="label-small" x="0" y="23">${esc(compact(result.voltages[n.id],'V'))}</text>`:''}</g>${ground?`<path class="ground" d="M${n.x} ${n.y+10}v21m-17 0h34m-28 7h22m-16 7h10"/>`:''}</g>`;
    }).join('');
    layoutLabels();
    refreshFlow();
  }

  function paintFlow(){
    for(const el of flowPaths)el.style.strokeDashoffset=String(CircuitFlow.offset(flow.branches[el.dataset.flowPart],flowTime)%40);
  }
  function animateFlow(now){
    flowFrame=null;
    if(!flowShown||!flowPlaying||!flow?.active||document.hidden){flowLast=null;return;}
    if(flowLast!==null)flowTime+=Math.min((now-flowLast)/1000,.1)*flowSpeed;
    flowLast=now;paintFlow();flowFrame=requestAnimationFrame(animateFlow);
  }
  function refreshFlow(){
    if(flowFrame!==null)cancelAnimationFrame(flowFrame);flowFrame=null;flowLast=null;
    flowPaths=[...$('canvas').querySelectorAll('[data-flow-part]')];paintFlow();
    $('flow-play').textContent=flowPlaying?'Pause':'Play';
    $('flow-play').disabled=!flowShown||!flow?.active;$('flow-speed').disabled=!flowShown;
    $('flow-state').textContent=!flowShown?'Hidden':!flow?.ok?'Waiting for a solved circuit':!flow.active?'No current flows':flowPlaying?'Conventional current':'Paused';
    if(flowShown&&flowPlaying&&flow?.active&&!document.hidden)flowFrame=requestAnimationFrame(animateFlow);
  }
  function junctionFlow(n){
    if(!flow?.ok)return '';
    const f=flow.nodes[n.id];
    if(!f.incoming.length&&!f.outgoing.length)return '<section class="junction-flow"><h3>Current at this junction</h3><p>No current flows here.</p></section>';
    const list=items=>items.map(b=>`<li><button type="button" data-inspect-part="${b.id}">${esc(b.id)}</button><span>${esc(q(b.magnitude,'A'))}<small>${esc(name(b.from)+' → '+name(b.to))}</small></span></li>`).join('')||'<li>None</li>';
    return `<section class="junction-flow"><h3>Current at this junction</h3><div class="flow-balance"><div><h4>In · ${esc(q(f.totalIn,'A'))}</h4><ul>${list(f.incoming)}</ul></div><div><h4>Out · ${esc(q(f.totalOut,'A'))}</h4><ul>${list(f.outgoing)}</ul></div></div><p>Σ I in = Σ I out</p></section>`;
  }
  function equationBlock(title,text){return `<div class="formula"><strong>${esc(title)}</strong>${esc(text)}</div>`;}
  function constraint(p){return `V_${name(p.a)} − V_${name(p.b)} = ${num(p.kind==='V'?p.value:0)} V`;}
  function nodeEquation(id){const terms=CircuitSolver.nodeTerms(circuit,id);return (terms.map(t=>t.term).join(' + ').replaceAll('+ −','− ')||'0')+' = 0';}
  function voltageDerivation(n){
    if(!result.ok||n.id===circuit.ground)return '';
    const resistors=circuit.parts.filter(p=>p.kind==='R'&&(p.a===n.id||p.b===n.id));
    if(resistors.length){
      const others=CircuitSolver.nodeTerms(circuit,n.id).filter(t=>!resistors.some(p=>p.id===t.id));
      const sourceTerms=others.map(t=>t.term).join(' + ').replaceAll('+ −','− ')||'0';
      const numerator=resistors.map(p=>`V_${name(p.a===n.id?p.b:p.a)} / ${num(p.value)}`).join(' + ');
      const denominator=resistors.map(p=>`1 / ${num(p.value)}`).join(' + ');
      const values=resistors.map(p=>`${num(result.voltages[p.a===n.id?p.b:p.a])} / ${num(p.value)}`).join(' + ');
      const injected=others.reduce((sum,t)=>sum+t.sign*result.branches[t.id].current,0);
      return equationBlock('Rearrange KCL for the node voltage',`V_${n.name} = [${numerator} − (${sourceTerms})] / (${denominator})`)+equationBlock('Substitute node voltages and source currents',`V_${n.name} = [${values} − (${num(injected)})] / (${denominator}) = ${q(result.voltages[n.id],'V')}`);
    }
    const p=circuit.parts.find(p=>(p.a===n.id||p.b===n.id)&&(p.kind==='V'||p.kind==='W'||p.kind==='S'&&p.closed));
    if(!p)return '';
    const other=p.a===n.id?p.b:p.a,offset=(p.kind==='V'?p.value:0)*(p.a===n.id?1:-1);
    return equationBlock('Node voltage from '+p.id,`V_${n.name} = V_${name(other)} + (${num(offset)}) = ${num(result.voltages[other])} + (${num(offset)}) = ${q(result.voltages[n.id],'V')}`);
  }
  function calculationsNode(n){
    const terms=CircuitSolver.nodeTerms(circuit,n.id),total=result.ok?terms.map(t=>num(t.sign*result.branches[t.id].current)).join(' + ').replaceAll('+ −','− '):'';
    return `<h3>Kirchhoff’s current law</h3><p>Sum of currents leaving ${esc(n.name)} = 0. Voltages are in V, resistances in Ω, and currents in A.</p>${equationBlock('KCL at '+n.name,nodeEquation(n.id))}${result.ok?equationBlock('Substitute the calculated currents (A)',total+(result.kcl[n.id]===0?' = 0 A':' ≈ 0 A')):''}${n.id===circuit.ground?equationBlock('Reference voltage','V_'+n.name+' = 0 V'):''}${circuit.parts.filter(p=>(p.a===n.id||p.b===n.id)&&(p.kind==='V'||p.kind==='W'||p.kind==='S'&&p.closed)).map(p=>equationBlock(p.id+' · voltage constraint',constraint(p))).join('')}${voltageDerivation(n)}<p>All junction equations and voltage constraints are solved together. The substitution uses those solved values.</p>`;
  }
  function calculationsPart(p){
    const va='V_'+name(p.a),vb='V_'+name(p.b),r=result.ok?result.branches[p.id]:null;
    let html=equationBlock('Reference direction',`${p.id}: ${name(p.a)} → ${name(p.b)}; U = ${va} − ${vb}`);
    if(p.kind==='R')html+=equationBlock('Ohm’s law',`I = (${va} − ${vb}) / R`)+(r?equationBlock('Substitution',`I = (${num(result.voltages[p.a])} − ${num(result.voltages[p.b])}) / ${num(p.value)} = ${q(r.current,'A')}`):'');
    if(p.kind==='V')html+=equationBlock('Voltage source',constraint(p))+'<p>Source current is found from KCL at its terminals, together with the rest of the circuit.</p>'+equationBlock('KCL at '+name(p.a),nodeEquation(p.a));
    if(p.kind==='I')html+=equationBlock('Current source',`I = ${q(p.value,'A')}`)+'<p>The terminal voltage follows from the two node voltages.</p>';
    if(p.kind==='W'||p.kind==='S')html+=equationBlock(p.kind==='W'?'Ideal wire':p.closed?'Closed switch':'Open switch',p.kind==='S'&&!p.closed?'I = 0 A':constraint(p))+'<p>'+(p.kind==='S'&&!p.closed?'An open switch carries no current. Its terminal voltage is set by the remaining circuit.':'The current is found from KCL at the connected junctions.')+'</p>';
    if(r)html+=equationBlock('Voltage across the component',`U = ${num(result.voltages[p.a])} − ${num(result.voltages[p.b])} = ${q(r.voltage,'V')}`)+equationBlock('Power · positive absorbed, negative supplied',`P = U × I = ${num(r.voltage)} × ${num(r.current)} = ${q(r.power,'W')}`);
    return html;
  }
  function inspector(){
    const target=selected?.kind==='node'?node(selected.id):circuit.parts.find(p=>p.id===selected?.id);
    if(!target){selected=null;$('inspector').innerHTML='<h2>Explore the circuit</h2><p class="selection-hint">Click a junction to see its voltage and current-balance equation. Click a component to change its value and inspect its current, voltage and power.</p><h3>Build your own</h3><p>Add junctions, then choose a component and click its two endpoints. Drag junctions with Select / move. Set one junction as Ground.</p><div class="node-list">'+circuit.nodes.map(n=>`<button data-inspect-node="${n.id}">${esc(n.name)}</button>`).join('')+'</div>';return;}
    if(selected.kind==='node'){
      $('inspector').innerHTML=`<h2>Junction ${esc(target.name)}</h2>${result.ok?'<p class="metric">'+esc(q(result.voltages[target.id],'V'))+'</p>':''}<form id="node-edit"><div class="edit-fields"><label class="full">Junction name<input id="node-name" value="${esc(target.name)}" maxlength="12" required pattern="[a-zA-Z0-9_-]+"></label></div><div class="edit-actions"><button class="primary" type="submit">Rename</button><button type="button" id="set-ground" ${target.id===circuit.ground?'disabled':''}>Set ground</button><button type="button" class="danger" id="delete-node">Delete junction</button></div><p id="edit-error" class="small-error" role="status"></p></form>${junctionFlow(target)}${calculationsNode(target)}`;
      $('node-edit').onsubmit=e=>{e.preventDefault();const v=$('node-name').value;if(circuit.nodes.some(n=>n.id!==target.id&&n.name===v)){$('edit-error').textContent='Choose a unique junction name.';return;}change(()=>target.name=v);};
      $('set-ground').onclick=()=>change(()=>circuit.ground=target.id);
      $('delete-node').onclick=()=>change(()=>{circuit.nodes=circuit.nodes.filter(n=>n.id!==target.id);circuit.parts=circuit.parts.filter(p=>p.a!==target.id&&p.b!==target.id);if(circuit.ground===target.id)circuit.ground=null;selected=null;});
    }else{
      const p=target,choices=units[p.kind],unit=choices?.find(u=>Math.abs(p.value/u[1])>=1&&Math.abs(p.value/u[1])<1000)||choices?.[0];
      $('inspector').innerHTML=`<h2>${esc(p.id)} · ${types[p.kind]}</h2><form id="part-edit"><div class="edit-fields"><label>First terminal${p.kind==='V'?' (+)':''}<select id="part-a">${nodeOptions(p.a)}</select></label><label>Second terminal${p.kind==='V'?' (−)':''}<select id="part-b">${nodeOptions(p.b)}</select></label>${choices?`<label>Value<input id="part-value" type="number" step="any" required value="${Number((p.value/unit[1]).toPrecision(10))}"></label><label>Unit<select id="part-unit">${choices.map(u=>`<option value="${u[1]}" ${u[1]===unit[1]?'selected':''}>${u[0]}</option>`).join('')}</select></label>`:''}${p.kind==='S'?`<label class="full">Switch state<select id="switch-state"><option value="closed" ${p.closed?'selected':''}>Closed</option><option value="open" ${!p.closed?'selected':''}>Open</option></select></label>`:''}</div><div class="edit-actions"><button class="primary" type="submit">Apply</button><button type="button" id="reverse-part">Reverse terminals</button><button type="button" id="delete-part" class="danger">Delete</button></div><p id="edit-error" class="small-error" role="status"></p></form>${rSummary(p)}${calculationsPart(p)}`;
      $('part-edit').onsubmit=e=>{e.preventDefault();const next={...p,a:$('part-a').value,b:$('part-b').value,value:choices?Number($('part-value').value)*Number($('part-unit').value):0,closed:p.kind==='S'?$('switch-state').value==='closed':p.closed};const copy=clone(circuit);copy.parts=copy.parts.map(x=>x.id===p.id?next:x);try{CircuitSolver.validate(copy);change(()=>Object.assign(p,next));}catch(e){$('edit-error').textContent=e.message;}};
      $('reverse-part').onclick=()=>change(()=>[p.a,p.b]=[p.b,p.a]);
      $('delete-part').onclick=()=>change(()=>{circuit.parts=circuit.parts.filter(x=>x.id!==p.id);selected=null;});
    }
  }
  function rSummary(p){if(!result.ok)return '<p>Resolve the circuit issue to calculate this component.</p>';const r=result.branches[p.id],f=flow.branches[p.id];return `<p class="metric">${esc(q(r.current,'A'))}</p><p>${esc(q(r.voltage,'V'))} across ${esc(name(p.a)+' → '+name(p.b))} · ${esc(q(r.power,'W'))}</p><p class="actual-flow">${f.direction?'Conventional current: '+esc(name(f.from)+' → '+name(f.to)):'No current flows.'}</p>`;}
  function results(){
    $('solve-status').className=result.ok?'':'invalid';$('solve-status').textContent=result.ok?'Solved · Click any junction or component to see its calculations.':result.message;
    $('equations').innerHTML=(circuit.ground?equationBlock('Ground reference','V_'+name(circuit.ground)+' = 0 V'):'')+circuit.nodes.map(n=>equationBlock(n.name+(n.id===circuit.ground?' · ground':''),nodeEquation(n.id))).join('')+circuit.parts.filter(p=>p.kind==='V'||p.kind==='W'||p.kind==='S'&&p.closed).map(p=>equationBlock(p.id,constraint(p))).join('')+circuit.parts.filter(p=>p.kind==='I').map(p=>equationBlock(p.id,'I_'+p.id+' = '+q(p.value,'A'))).join('');
    if(!result.ok){$('results').innerHTML='<p class="result-notice">'+esc(result.message)+'</p>';return;}
    $('results').innerHTML=`<div class="result-tables"><div class="table-scroll"><table><caption>Junction voltages</caption><thead><tr><th>Junction</th><th>Voltage</th></tr></thead><tbody>${circuit.nodes.map(n=>`<tr><td><button data-inspect-node="${n.id}">${esc(n.name)}${n.id===circuit.ground?' (ground)':''}</button></td><td>${esc(q(result.voltages[n.id],'V'))}</td></tr>`).join('')}</tbody></table></div><div class="table-scroll"><table><caption>Component values</caption><thead><tr><th>Component</th><th>Direction</th><th>Voltage</th><th>Current</th><th>Power</th></tr></thead><tbody>${circuit.parts.map(p=>{const r=result.branches[p.id];return `<tr><td><button data-inspect-part="${p.id}">${esc(p.id)}</button></td><td>${esc(name(p.a)+' → '+name(p.b))}</td><td>${esc(q(r.voltage,'V'))}</td><td>${esc(q(r.current,'A'))}</td><td>${esc(q(r.power,'W'))}</td></tr>`;}).join('')}</tbody></table></div></div>`;
  }
  function render(){result=CircuitSolver.solve(circuit);flow=CircuitFlow.analyze(circuit,result);$('undo').disabled=!undo.length;$('redo').disabled=!redo.length;help();draw();inspector();results();}
  function pick(kind,id){selected={kind,id};draw();inspector();if(innerWidth<1150)$('inspector').scrollIntoView({block:'start',behavior:'smooth'});}
  function addNode(x,y){
    if(circuit.nodes.length>=24){$('tool-help').textContent='Maximum 24 junctions. Remove an unused junction first.';return null;}
    const id=newId('n',circuit.nodes);let i=1;while(circuit.nodes.some(n=>n.name==='N'+i))i++;
    const n={id,name:circuit.nodes.length?'N'+i:'0',x:Math.max(80,Math.min(900,Math.round(x/20)*20)),y:Math.max(80,Math.min(540,Math.round(y/20)*20))};
    if(circuit.nodes.some(other=>Math.hypot(other.x-n.x,other.y-n.y)<100)){$('tool-help').textContent='Place junctions at least five grid spaces apart.';return null;}
    circuit.nodes.push(n);if(!circuit.ground&&circuit.nodes.length===1)circuit.ground=n.id;selected={kind:'node',id:n.id};return n;
  }
  function point(e){const pt=new DOMPoint(e.clientX,e.clientY);return pt.matrixTransform($('canvas').getScreenCTM().inverse());}
  function activateNode(id){
    if(tool==='ground'){change(()=>circuit.ground=id);pick('node',id);setTool('select');return;}
    if(types[tool]){
      if(!pending){pending=id;help();draw();return;}
      if(pending===id){$('tool-help').textContent='Choose a different junction for the second terminal.';return;}
      if(circuit.parts.length>=48){$('tool-help').textContent='Maximum 48 components.';return;}
      change(()=>{const p=part(newId(tool,circuit.parts),tool,pending,id,tool==='R'?1000:tool==='V'?10:tool==='I'?.01:0);circuit.parts.push(p);selected={kind:'part',id:p.id};pending=null;});
      return;
    }
    pick('node',id);
  }
  $('canvas').addEventListener('click',e=>{
    if(suppressClick){suppressClick=false;return;}
    const n=e.target.closest('[data-node]'),p=e.target.closest('[data-part]');
    if(n){activateNode(n.dataset.node);return;}
    if(p){
      if(tool==='node'&&circuit.parts.find(x=>x.id===p.dataset.part).kind==='W'){
        if(circuit.parts.length>=48){$('tool-help').textContent='Maximum 48 components.';return;}
        const before=clone(circuit),wire=circuit.parts.find(x=>x.id===p.dataset.part),g=geometry(wire),n=addNode(g.cx,g.cy);
        if(n){const oldB=wire.b;wire.b=n.id;circuit.parts.push(part(newId('W',circuit.parts),'W',n.id,oldB));commit(before);}return;
      }
      pick('part',p.dataset.part);return;
    }
    if(tool==='node'){const before=clone(circuit),pt=point(e);if(addNode(pt.x,pt.y))commit(before);}else if(tool==='select'){selected=null;draw();inspector();}
  });
  $('canvas').addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const n=e.target.closest('[data-node]'),p=e.target.closest('[data-part]');if(n||p){e.preventDefault();if(n)activateNode(n.dataset.node);else pick('part',p.dataset.part);}});
  $('canvas').addEventListener('pointerdown',e=>{const target=e.target.closest('[data-node]');if(tool!=='select'||!target||e.button!==0)return;const pt=point(e);drag={id:target.dataset.node,start:pt,before:clone(circuit),moved:false};$('canvas').setPointerCapture(e.pointerId);});
  $('canvas').addEventListener('pointermove',e=>{if(!drag)return;const pt=point(e);if(Math.hypot(pt.x-drag.start.x,pt.y-drag.start.y)<6&&!drag.moved)return;const n=node(drag.id),x=Math.max(80,Math.min(900,Math.round(pt.x/20)*20)),y=Math.max(80,Math.min(540,Math.round(pt.y/20)*20));if(circuit.nodes.some(v=>v.id!==n.id&&Math.hypot(v.x-x,v.y-y)<100))return;n.x=x;n.y=y;drag.moved=true;selected={kind:'node',id:n.id};draw();});
  $('canvas').addEventListener('pointerup',()=>{if(!drag)return;const d=drag;drag=null;suppressClick=true;setTimeout(()=>suppressClick=false,0);if(d.moved){commit(d.before);}else activateNode(d.id);});
  $('canvas').addEventListener('pointercancel',()=>{if(drag){circuit=drag.before;drag=null;render();}});
  document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){pending=null;setTool('select');}if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.target.closest('input,select,textarea')){e.preventDefault();(e.shiftKey?$('redo'):$('undo')).click();}});
  document.addEventListener('click',e=>{const n=e.target.closest('[data-inspect-node]'),p=e.target.closest('[data-inspect-part]');if(n)pick('node',n.dataset.inspectNode);if(p)pick('part',p.dataset.inspectPart);});
  $('load-example').onclick=()=>{change(()=>{circuit=example($('example').value);selected=null;pending=null;});setTool('select');};
  $('undo').onclick=()=>{if(!undo.length)return;redo.push(clone(circuit));circuit=undo.pop();pending=null;selected=null;save();render();};
  $('redo').onclick=()=>{if(!redo.length)return;undo.push(clone(circuit));circuit=redo.pop();pending=null;selected=null;save();render();};
  $('export').onclick=()=>{const blob=new Blob([JSON.stringify(circuit,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='my-dc-circuit.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('Choose a circuit JSON file smaller than 100 KB.');const next=JSON.parse(await file.text());CircuitSolver.validate(next);if(next.nodes.some(n=>n.x<60||n.x>920||n.y<60||n.y>560))throw Error('Junctions must fit inside the circuit canvas.');change(()=>{circuit=next;selected=null;pending=null;});setTool('select');}catch(error){$('tool-help').textContent='Could not open circuit: '+error.message;}e.target.value='';};
  $('show-flow').onchange=e=>{flowShown=e.target.checked;draw();};
  $('flow-play').onclick=()=>{flowPlaying=!flowPlaying;refreshFlow();};
  $('flow-speed').oninput=e=>{flowSpeed=Number(e.target.value);$('flow-speed-value').textContent=flowSpeed+'×';};
  document.addEventListener('visibilitychange',refreshFlow);
  reducedMotion.addEventListener('change',e=>{if(e.matches){flowPlaying=false;refreshFlow();}});
  render();
})();
