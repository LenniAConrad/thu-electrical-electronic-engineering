/* Local KaTeX renderer. No evaluation of expressions or untrusted HTML. */
const MathView=(()=>{
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const literal=s=>String(s).replace(/[\\{}%$&#_^~]/g,c=>'\\'+c);
  function html(tex,display=false){
    if(typeof katex==='undefined')return `<span class="math-fallback">${escape(tex)}</span>`;
    return `<span class="math-render">${katex.renderToString(tex,{displayMode:display,throwOnError:false,strict:'ignore',trust:false,output:'htmlAndMathml'})}</span>`;
  }
  function plain(text){
    // Convert the lab's small, known equation grammar to TeX. Grouped quotients
    // become true fractions; node/component names are always escaped as text.
    const tokens=String(text).replaceAll('−','-').match(/\d+(?:\.\d+)?(?:e[+-]?\d+)?|[A-Za-zµμΩ]+(?:_[A-Za-z0-9_-]+)?\d*|[^\s]/g)||[];
    let pos=0;
    const atom=()=>{
      const t=tokens[pos++];if(t===undefined)return '';
      if(t==='('||t==='['){const close=t==='('?')':']',inside=expr(close);if(tokens[pos]===close)pos++;return {tex:`\\left${t}${inside}\\right${close}`,inside};}
      if(t==='-'||t==='+'){const a=atom();return {tex:t+(a.tex??a)};}
      if(/^\d.*e/i.test(t)){const [a,b]=t.split(/e/i);return {tex:`${a}\\times10^{${Number(b)}}`};}
      if(t.includes('_')){const [a,...rest]=t.split('_');const b=rest.join('_');return {tex:`${literal(a)}_{\\mathrm{${literal(b)}}}`};}
      const symbols={'×':'\\times','·':'\\cdot','→':'\\to','≈':'\\approx','Ω':'\\Omega','°':'{}^\\circ','∥':'\\parallel','Σ':'\\sum','π':'\\pi','ω':'\\omega','φ':'\\varphi','∞':'\\infty'};
      if(symbols[t])return {tex:symbols[t]+' '};
      if(/^[A-Za-zµμΩ]{2,}\d*$/.test(t)||['V','A','W'].includes(t))return {tex:`\\mathrm{${literal(t).replace('Ω','\\Omega').replace(/[µμ]/,'\\mu ')}}`};
      return {tex:literal(t)};
    };
    function expr(close){let out=[];while(pos<tokens.length&&tokens[pos]!==close){if(tokens[pos]==='+'||tokens[pos]==='-'){out.push(tokens[pos++]);continue;}let a=atom();while(tokens[pos]==='/'){pos++;const b=atom();a={tex:`\\frac{${a.inside??a.tex}}{${b.inside??b.tex}}`};}if(pos>1&&/^(?:V|A|W|mA|kV|mV|µA|μA|kΩ|Ω)$/.test(tokens[pos-1])&&/\d/.test(tokens[pos-2]||''))a.tex='\\,'+a.tex;out.push(a.tex);}return out.join(' ');}
    return expr(null);
  }
  function render(root=document){root.querySelectorAll('[data-tex]').forEach(el=>{const tex=el.dataset.tex;if(el.dataset.mathRendered===tex)return;el.innerHTML=html(tex,el.dataset.display==='true');el.dataset.mathRendered=tex;});}
  if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>render());
  return {html,plain,render,escape};
})();
if(typeof module!=='undefined')module.exports=MathView;
