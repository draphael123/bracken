// Read-only state logging around the original mark oracle; all original comparisons/assertions remain.
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
let source=readFileSync('tools/mark-integrity.mjs','utf8').replaceAll('\r\n','\n');
const replace=(before,after)=>{if(source.split(before).length!==2)throw Error('Mark trace boundary changed: '+before.slice(0,60));source=source.replace(before,after);};
replace("from './cdp.mjs'",'from '+JSON.stringify(pathToFileURL(resolve('tools/cdp.mjs')).href));
source="import {mkdirSync,writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';const trace=[];mkdirSync('gate-data',{recursive:true});\n"+source;
replace("BK.manualSimulation = true; const M = await import('/src/marks.js');","BK.manualSimulation = true; const M = await import('/src/marks.js'),UM=await import('/src/undead-mage.js');const diagnostics=[];let previousModeState=null;");
replace('return n; }\n    finally',`if(n===0&&e.t==='undeadmage'){const fields=o=>Object.fromEntries(['mode','modeT','spell','anim','enraged','hurtT','x','y','realm','open'].map(k=>[k,o[k]??null]));diagnostics.push({time:BK.time,actual:fields(snap),previous:previousModeState,counterfactual:fields(e),frames:{actual:UM.undeadFrame(snap,UM.UNDEADMAGE_F),counterfactual:UM.undeadFrame(e,UM.UNDEADMAGE_F)},player:[BK.P.x,BK.P.y],view:Object.fromEntries(Object.entries(BK.view).filter(([k,v])=>v==null||!['object','function'].includes(typeof v)))});}return n; }\n    finally`);
replace('if (!key) prevMode = e.mode;',"if(!key){prevMode=e.mode;previousModeState=Object.fromEntries(['mode','modeT','spell','anim','enraged','hurtT','x','y','realm','open'].map(k=>[k,e[k]??null]));}");
replace('return { rows };','return { rows,diagnostics };');
replace("    await pg.send('Memory.simulatePressureNotification'","    if(r.diagnostics?.length)trace.push({row,...r});writeFileSync('gate-data/mark-trace.json',JSON.stringify({time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),trace},null,2)+'\\n');\n    await pg.send('Memory.simulatePressureNotification'");
if(process.argv.includes('--verify-only')){execFileSync(process.execPath,['--input-type=module','--check'],{input:source});console.log('PASS original mark oracle with state-only diagnostic instrumentation');}
else await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
