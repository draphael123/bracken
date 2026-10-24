// Observe the original visibility oracle, retaining its samples, thresholds and assertions.
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
let source=readFileSync('tools/no-hidden-hits.mjs','utf8').replaceAll('\r\n','\n');
const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('Visibility trace boundary changed: '+a.slice(0,70));source=source.replace(a,b);};
replace("from './cdp.mjs'",'from '+JSON.stringify(pathToFileURL(resolve('tools/cdp.mjs')).href));
replace('const out = { levels: [], tunnel: [] };','const out = { levels: [], tunnel: [], trace: [] };');
replace('e.alive = al; return moved(A, B);',`e.alive = al; const result=moved(A,B);if(result.n<MIN_PX&&out.trace.length<20){
 const fields=o=>Object.fromEntries(Object.entries(o).filter(([k,v])=>v===null||['number','string','boolean'].includes(typeof v)));
 const picture=data=>{const c=document.createElement('canvas');c.width=BK.view.buf.width;c.height=BK.view.buf.height;c.getContext('2d').putImageData(new ImageData(data,c.width,c.height),0,0);return c.toDataURL('image/png');};
 out.trace.push({time:BK.time,level:BK.L.id,result,foe:fields(e),player:fields(BK.P),view:fields(BK.view),nearby:BK.enemies().filter(q=>q!==e&&q.alive&&Math.hypot(q.x-e.x,q.y-e.y)<80).map(fields),withFoe:picture(A),withoutFoe:picture(B)});
 }return result;`);
if(process.argv.includes('--verify-only')){execFileSync(process.execPath,['--input-type=module','--check'],{input:source});console.log('PASS original visibility oracle with diagnostic readback only');}
else{mkdirSync('gate-data',{recursive:true});process.env.NO_HIDDEN_RESULT=resolve('gate-data/no-hidden-trace.json');await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));}
