import fs from 'fs';
let f='src/main.js', s=fs.readFileSync(f,'utf8'); s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{ const n=s.split(a).length-1; if(n!==1) throw Error(n+' x '+a.slice(0,60)); s=s.replace(a,()=>b); };
rep("const slot2 = from < SECOND_SLOT_LEVEL && n >= SECOND_SLOT_LEVEL ? ' A SECOND SKILL SLOT.' : '', pas = (got.length ?","const slot2 = from < SECOND_SLOT_LEVEL && n >= SECOND_SLOT_LEVEL ? ' A SECOND SKILL SLOT.' : '', pas = (got.length ?");
rep("' PASSIVE: ' + got[0].name + '.') : '') + slot2;","' PASSIVE: ' + got[0].name + '.') : '') + slot2;   /* (Daniel 11-01: level 30 opens the second skill slot - said in the level-up line) */");
rep("head + '. FULLY HEALED.' + pas];","head + '. FULLY HEALED.' + pas, head + '. FULLY HEALED.' + slot2];");
fs.writeFileSync(f,s.replace(/\n/g,'\r\n'));
