import fs from 'fs';
const ed=(f,pairs)=>{ let s=fs.readFileSync(f,'utf8'); const crlf=s.includes('\r\n'); s=s.replace(/\r\n/g,'\n');
 for(const [a,b] of pairs){ const n=s.split(a).length-1; if(n!==1) throw Error(f+': '+n+' x '+a.slice(0,60)); s=s.replace(a,()=>b); }
 fs.writeFileSync(f,crlf?s.replace(/\n/g,'\r\n'):s); };
ed('src/controls.js',[
 ["hero === 'reaper' ? ['his skill', kb('skill2') + ' (CHOSEN)', pd('skill2')] : ['skill two', kb('skill2') + ' (equipped)', pd('skill2')],",
  "['skill two', kb('skill2') + ' (FROM LEVEL 30)', pd('skill2')],   /* (Daniel 11-01) ONE slot from the start, a second at level 30 */"],
 ["['skill', kb('throw') + ' (equipped)', pd('throw')],", "['skill', kb('throw') + ' (THE ONE EQUIPPED)', pd('throw')],"],
]);
ed('src/coop-help.js',[["Y skill one   RT skill two   BACK emote","Y skill   RT skill two (LEVEL 30)   BACK emote"]]);
ed('src/level.js',[["'F AND G: SKILLS FROM THE TALENT TREE (Q). ANY NOT YET LEARNED ARE LENT HERE. USE BOTH.'","'F AND G: SKILLS FROM THE TALENT TREE (Q). YOU KEEP ONE SLOT, A SECOND FROM LEVEL 30; THE YARD LENDS TWO. USE BOTH.'"]]);
ed('src/store.js',[["F/G slot  X more","F slot  X more"]]);
