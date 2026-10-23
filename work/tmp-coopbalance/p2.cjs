const fs=require('fs');
function patch(f,a,b){let s=fs.readFileSync(f,'utf8');const crlf=s.includes('\r\n');if(crlf){s=s.replace(/\r\n/g,'\n');}const n=s.split(a).length-1;if(n!==1)throw new Error(f+': '+n+' matches for '+a.slice(0,50));s=s.replace(a,()=>b);if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(f,s);}
const m='src/main.js';
patch(m,`WARD_PRICE * diffNow().take * (1 + 0.28 * hitTierOf(curId())) * coopMul()));`,`WARD_PRICE * diffNow().take * (1 + 0.28 * hitTierOf(curId())) * coopTake()));`);
patch(m,`takeScale: () => diffNow().take * (1 + 0.28 * hitTierOf(curId())) * coopMul(),`,`takeScale: () => diffNow().take * (1 + 0.28 * hitTierOf(curId())) * coopTake(),`);
patch(m,`const lands = dmg * diffNow().take * (1 + 0.28 * hitTierOf(curId())) * coopMul();`,`const lands = dmg * diffNow().take * (1 + 0.28 * hitTierOf(curId())) * coopTake();`);
