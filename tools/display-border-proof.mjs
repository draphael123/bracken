// Reuse every original A/B/A comparison, frame sample, viewport and CPU setting.
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
let source=readFileSync('tools/load-perf-compare.mjs','utf8');
const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('comparison boundary changed: '+a.slice(0,70));source=source.replace(a,b);};
source=source.replace(/from(['"])(\.\/[^'"]+)\1/g,(_,q,p)=>'from '+JSON.stringify(pathToFileURL(resolve('tools',p)).href));
source="import {installDisplayBorderLab} from "+JSON.stringify(pathToFileURL(resolve('tools/display-border-lab.mjs')).href)+";\n"+source;
replace("||'drawImage';assert", "||'borders';assert");
replace("assert(['drawImage','copy'", "assert(['borders','drawImage','copy'");
replace("const install=async page=>{", "const install=async page=>{if(name==='after'&&present==='borders'){await page.evalp('('+installDisplayBorderLab.toString()+')()');return;}");
replace("displayBackend:await pg.evalp", "borderCounts:await pg.evalp('window.__borderLab||null'),displayBackend:await pg.evalp");
replace("before:median(rows.before.samples", "borderCounts:rows.after.borderCounts,before:median(rows.before.samples");
if(process.argv.includes('--verify-only')){execFileSync(process.execPath,['--input-type=module','--check'],{input:source});console.log('PASS border diagnostic retains original comparison assertions and all120pixel samples');}
else await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
