/* Common navigation; no course or homework storage is migrated or cleared. */
(()=>{
 const path=location.pathname.split('/').pop()||'index.html';
 const header=document.createElement('header');header.className='course-header';
 header.innerHTML=`<a class="course-brand" href="index.html"><span class="course-mark">EEE</span><span><strong>Electrical Engineering</strong><small>LUO HAIYUN · TSINGHUA</small></span></a><button class="course-menu" type="button" aria-expanded="false" aria-controls="course-navigation">Menu</button><nav id="course-navigation" aria-label="Course"><a href="index.html" data-nav="home">Home</a><a href="lectures.html" data-nav="learn">Lectures</a></nav>`;
 document.body.prepend(header);
 const main=document.querySelector('main');if(main){main.id ||= 'main-content';main.tabIndex=-1;const skip=document.createElement('a');skip.className='course-skip';skip.href='#'+main.id;skip.textContent='Skip to content';skip.onclick=e=>{e.preventDefault();main.focus();main.scrollIntoView();};document.body.prepend(skip);}
 const button=header.querySelector('button'),nav=header.querySelector('nav');button.onclick=()=>{const open=nav.classList.toggle('open');button.setAttribute('aria-expanded',String(open));};
 function active(){const target=['learn.html','lectures.html'].includes(path)?'learn':path.includes('lab')?'lab':path==='hw3.html'||path==='worksheet.html'||(path==='index.html'&&location.hash&&location.hash!=='#/')?'practice':'home';for(const a of nav.querySelectorAll('a')){if(a.dataset.nav===target)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}nav.classList.remove('open');button.setAttribute('aria-expanded','false');}
 active();window.addEventListener('hashchange',active);
 const footer=document.createElement('footer');footer.className='course-footer';footer.innerHTML='<span>Student-built study companion · based on the course lectures.</span><a href="lectures.html">All lectures</a>';document.body.append(footer);
 if(path.includes('lab')){const title=document.createElement('div');title.className='lab-page-title';title.innerHTML=`<a class="back-link" href="lectures.html">← Lectures</a><h1>${path==='phasor-lab.html'?'Phasor playground':'Circuit playground'}</h1><p>${path==='phasor-lab.html'?'Connect a rotating phasor to its waveform.':'Build a DC circuit, change its components, and follow the current.'}</p>`;main.before(title);const saveStatus=document.getElementById('save-state');if(saveStatus)title.append(saveStatus);}
})();
