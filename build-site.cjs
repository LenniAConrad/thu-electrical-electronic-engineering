const fs=require('node:fs'),path=require('node:path');
// Publish only runtime assets; source sheets, tests and local output are excluded.
const output=path.join(__dirname,'.build','site');
fs.mkdirSync(output,{recursive:true});
for(const file of ['learn.html','learn.js','learning.css','hw3.html','hw3.js','math-render.js','math.css','index.html','style.css','visual-polish.css','course.js','circuits.js','questions.js','checker.js','practice-models.js','step-visuals.js','formulas.js','app.js','worksheet.html','worksheet.css','worksheet.js','circuit-lab.html','circuit-lab.css','circuit-lab.js','circuit-solver.js','circuit-flow.js','exercise-playgrounds.js','phasor-lab.html','phasor-lab.js','phasor-lab.css'])fs.copyFileSync(path.join(__dirname,file),path.join(output,file));
fs.cpSync(path.join(__dirname,'assets'),path.join(output,'assets'),{recursive:true});
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Built static site in .build/site');
