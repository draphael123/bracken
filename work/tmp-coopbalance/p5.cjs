const fs=require('fs');
function patch(f,a,b){let s=fs.readFileSync(f,'utf8');const crlf=s.includes('\r\n');if(crlf){s=s.replace(/\r\n/g,'\n');}const n=s.split(a).length-1;if(n!==1)throw new Error(f+': '+n+' matches for '+a.slice(0,50));s=s.replace(a,()=>b);if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(f,s);}
patch('src/ai-companion.js',`export const COOP = { hp: [1, 1, 2, 2.6, 3.2], dmg: [1, 1, 1.35, 1.45, 1.5] };`,`export const COOP = { hp: [1, 1, 2, 2.6, 3.2], dmg: [1, 1, 1.35, 1.45, 1.5], aiAsHuman: false };   /* aiAsHuman: the LAB's two-bot fights - a bot standing in for a second PERSON counts as one */`);
patch('src/ai-companion.js',`const ai = b && b.ai && !b.labHuman;`,`const ai = b && b.ai && !b.labHuman && !COOP.aiAsHuman;`);
