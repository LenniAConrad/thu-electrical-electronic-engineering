/* Small arithmetic parser: no eval, no network, no execution of input as JavaScript. */
const Checker=(()=>{
  const sub={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
  function tokens(input){
    let s=String(input).trim().toLowerCase().replace(/[₀-₉]/g,c=>sub[c]).replace(/[−–]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/π/g,'pi').replace(/√\s*(\d+(?:\.\d+)?)/g,'sqrt($1)').replace(/√/g,'sqrt').replace(/(?<=\d),(?=\d)/g,'.').replace(/\s+/g,'').replace(/_/g,'');
    if(s.length>500)throw Error('Please use a shorter expression.');
    const out=[];let i=0;
    while(i<s.length){
      const m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|^[a-z]+\d*|^[+\-*/^()]/);
      if(!m)throw Error('Use numbers, + − * / ^, parentheses, pi or sqrt(...).');
      out.push(m[0]);i+=m[0].length;
    }
    if(!out.length)throw Error('Enter an answer first.');
    const expanded=[];
    const isValue=t=>t&&(/^[\d.a-z]/.test(t)||t===')');
    for(let k=0;k<out.length;k++){
      const t=out[k],prev=out[k-1];
      if(k&&isValue(prev)&&(t==='('||/^[\d.a-z]/.test(t))&&!(prev==='sqrt'||prev==='abs'))expanded.push('*');
      expanded.push(t);
    }
    return expanded;
  }
  function evaluate(input,env={}){
    const ts=tokens(input);let pos=0,depth=0;
    function atom(){
      if(++depth>60)throw Error('Expression is too deeply nested.');
      let t=ts[pos++],v;
      if(t==='('){v=sum();if(ts[pos++]!==')')throw Error('Check your parentheses.');}
      else if(t==='sqrt'||t==='abs'){
        if(ts[pos++]!=='(')throw Error('Use sqrt(...) or abs(...).');
        const arg=sum();if(ts[pos++]!==')')throw Error('Check your parentheses.');v=t==='sqrt'?Math.sqrt(arg):Math.abs(arg);
      }else if(t==='pi')v=Math.PI;
      else if(t!==undefined&&/^(?:\d|\.)/.test(t))v=Number(t);
      else if(Object.prototype.hasOwnProperty.call(env,t))v=env[t];
      else throw Error(t?`Unknown symbol “${t}”.`:'The expression is incomplete.');
      depth--;return v;
    }
    function power(){let v=atom();if(ts[pos]==='^'){pos++;v=Math.pow(v,unary());}return v;}
    function unary(){if(ts[pos]==='+'){pos++;return unary();}if(ts[pos]==='-'){pos++;return -unary();}return power();}
    function product(){let v=unary();while(ts[pos]==='*'||ts[pos]==='/'){let op=ts[pos++],w=unary();v=op==='*'?v*w:v/w;}return v;}
    function sum(){let v=product();while(ts[pos]==='+'||ts[pos]==='-'){let op=ts[pos++],w=product();v=op==='+'?v+w:v-w;}return v;}
    const value=sum();if(pos!==ts.length)throw Error('Check the expression.');if(!Number.isFinite(value))throw Error('The expression must have a finite real value.');return value;
  }
  function numeric(raw,unit){
    let s=String(raw).trim();
    // Optional units are converted into the unit printed beside the input.
    const families={A:{A:1,mA:.001,'µA':1e-6,uA:1e-6},V:{V:1,mV:.001,kV:1000},'Ω':{'Ω':1,ohm:1,'kΩ':1000,kohm:1000,'MΩ':1e6},Hz:{Hz:1,kHz:1000},W:{W:1,mW:.001},'°':{'°':1,deg:1},'rad/s':{'rad/s':1}};
    let group=Object.values(families).find(g=>Object.hasOwn(g,unit)),factor=1;
    if(group){
      const keys=Object.keys(group).sort((a,b)=>b.length-a.length);
      const match=keys.find(k=>s.endsWith(k));
      if(match){s=s.slice(0,-match.length).trim();factor=group[match]/group[unit];}
    }
    return evaluate(s)*factor;
  }
  const variables=['i1','i2','i3','i4','i5','r1','r2','r3','r4','r5','e1','e2','e3','va','vb'];
  const envs=Array.from({length:12},(_,k)=>Object.fromEntries(variables.map((v,j)=>[v,v[0]==='r'?1+((k+3)*(j+5)*13%29)/3:(((k+7)*(j+11)*17+(k*k*j*3))%101-50)/7])));
  function residual(s,env){const parts=s.split('=');if(parts.length!==2||!parts.every(x=>x.trim()))throw Error('Enter an equation with one = sign.');return evaluate(parts[0],env)-evaluate(parts[1],env);}
  function equivalent(raw,expected,equation){
    let ratio=null,nonzero=0;
    for(const env of envs){
      const a=equation?residual(raw,env):evaluate(raw,env),b=equation?residual(expected,env):evaluate(expected,env);
      if(!equation){if(Math.abs(a-b)>1e-7*Math.max(1,Math.abs(b)))return false;continue;}
      if(Math.abs(b)<1e-8){if(Math.abs(a)>1e-7)return false;continue;}
      if(Math.abs(a)<1e-9)return false;
      const r=a/b;if(ratio===null)ratio=r;
      if(Math.abs(r-ratio)>1e-7*Math.max(1,Math.abs(ratio)))return false;
      nonzero++;
    }
    return !equation||nonzero>2;
  }
  function check(field,raw){
    if(!String(raw).trim())return {ok:false,empty:true,message:'Enter an answer first.'};
    try{
      if(field.type==='choice')return {ok:raw===String(field.answer),message:raw===String(field.answer)?'Correct.':'Not quite. Try again.'};
      if(field.type==='equation'||field.type==='expression'){
        let s=String(raw);if(field.type==='expression'&&s.includes('=')){
          const pair=s.split('=');if(pair.length!==2)throw Error('Use just the expression, or one = sign.');
          if(pair[0].trim().toLowerCase().replace(/_/g,'')!==field.key)throw Error(`Enter the expression for ${field.key.toUpperCase()}.`);s=pair[1];
        }
        const ok=equivalent(s,field.answer,field.type==='equation');return {ok,message:ok?'Correct. Equivalent forms are accepted.':'Check the terms and reference directions.'};
      }
      const value=numeric(raw,field.unit),target=field.answer;
      const diff=field.angle?Math.abs(((value-target+180)%360+360)%360-180):Math.abs(value-target);
      const tolerance=field.angle?.1:target===0?1e-8:Math.max(1e-6,Math.abs(target)*.002);
      const ok=diff<=tolerance;
      return {ok,value,message:ok?'Correct.':Math.abs(value+target)<tolerance&&target!==0?'Magnitude looks right. Check the sign.':'Not quite. Check your calculation and units.'};
    }catch(e){return {ok:false,message:e.message};}
  }
  return {check,evaluate,numeric,equivalent};
})();
if(typeof module!=='undefined')module.exports=Checker;
