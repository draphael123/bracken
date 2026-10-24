// Read-only trace of the original full Theatre fixture and its unchanged assertions/frame caps.
import {readFileSync} from 'node:fs';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {execFileSync} from 'node:child_process';
const original=pathToFileURL(resolve('tools/theatre.mjs'));
let source=readFileSync(original,'utf8').replaceAll('\r\n','\n');
source=source.replace(/(from\s*|import\s*\(\s*)(['"])(\.[^'"]+)\2/g,(_,prefix,q,spec)=>prefix+JSON.stringify(new URL(spec,original).href));
source=source.replaceAll('import.meta.url',JSON.stringify(original.href));
const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('Theatre trace boundary changed: '+a.slice(0,60));source=source.replace(a,b);};
replace('BK.tp(206 + HX, 33); let dark = 0;',`BK.tp(206 + HX, 33); let dark = 0;out.audienceTrace=[];const audienceSample=phase=>{const fields=o=>Object.fromEntries(Object.entries(o).filter(([k,v])=>v===null||['number','string','boolean'].includes(typeof v)));out.audienceTrace.push({phase,time:BK.time,player:fields(P),foe:fields(dr),show:TH().show,spots:TH().spots.map(s=>({...fields(s),aims:s.aims}))});};`);
replace("if (dr.mode === 'lobTell' || dr.mode === 'bottleTell') dark++;", "if (dr.mode === 'lobTell' || dr.mode === 'bottleTell') dark++;if(i%60===59)audienceSample('dark');");
replace("if (dr.mode === 'lobTell' || dr.mode === 'bottleTell') lit++;", "if (dr.mode === 'lobTell' || dr.mode === 'bottleTell') lit++;if(i%60===59)audienceSample('lit');");
source="import {mkdirSync,writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';\n"+source;
replace('    ok(r.held < 1,', "    mkdirSync('gate-data',{recursive:true});writeFileSync('gate-data/theatre-audience-trace.json',JSON.stringify({time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),...r},null,2)+'\\n');\n    ok(r.held < 1,");
if(process.argv.includes('--verify-only')){execFileSync(process.execPath,['--input-type=module','--check'],{input:source});console.log('PASS original Theatre fixture with state-only audience tracing');}
else await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
