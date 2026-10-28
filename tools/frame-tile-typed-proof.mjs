// Preserve the complete original A/B/A comparison; adapt only serving and output boundaries.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';import {freemem} from 'node:os';
import {recipe,ROOT,GAME,OUT} from './frame-tile-typed-lab.mjs';
const id=process.argv[2],verify=process.argv.includes('--verify-only');
if(!verify){assert(['undercrown','lamplit','hanging','hurricane','minecart'].includes(id));assert(process.argv.includes('--control'));assert(process.argv.includes('--baseline='+GAME));assert(!process.argv.some(a=>a.startsWith('--present=')));}
const r=recipe(),original=fs.readFileSync(ROOT+'/tools/load-perf-compare.mjs','utf8');let text=original;const replacements=[];
const replace=(before,after)=>{assert.equal(text.split(before).length,2,before.slice(0,80));text=text.replace(before,after);replacements.push({before,after});};
replace("const root=process.cwd(),out=resolve('gate-data/'+id),before=resolve('../perf-before');",'const root='+JSON.stringify(ROOT)+',out=resolve('+JSON.stringify(OUT)+"+'/arena-'+id),before=root;");
replace("const added=spawnSync('git',['worktree','add','--detach',before,baselineRef],{encoding:'utf8'});assert.equal(added.status,0,added.stderr);\ncopyLabHarness(root,before);",'// Identical original game source for controls; the candidate receives served experimental bytes.');
replace("const{openPage}=await import(pathToFileURL(join(cwd,'tools/cdp.mjs')));let pg=await openPage","const openPage=options=>openReusePage(name==='after',options);let pg=await openPage");
replace('rows[name]={pixels,samples,arena,',"rows[name]={frameTileTimingInfo,frameTileInfo:name===\"after\"?await pg.evalp(\"BK.frameTilePatternInfo()\"):null,reuseServed:[...pg.reuseServed],reuseErrors:[...pg.reuseErrors],pixels,samples,arena,");
replace("const arena=await pg.evalp('!!BK.bossActive'),bitmapTiming=", "const frameTileTimingInfo=name===\"after\"?await pg.evalp(\"BK.frameTilePatternInfo()\"):null;const arena=await pg.evalp('!!BK.bossActive'),bitmapTiming=");
replace('assert.deepEqual(pg.errors,[]);','assert.deepEqual(pg.errors,[]);assert.deepEqual(pg.reuseErrors,[]);');
replace("commit:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim()",'commit:'+JSON.stringify(GAME));
replace("writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\\n');",'receipt.recipe='+JSON.stringify(r.proof)+";receipt.served=Object.fromEntries(Object.entries(rows).map(([k,r])=>[k,{urls:r.reuseServed,errors:r.reuseErrors}]));writeFileSync(join(out,'raw-rows.json'),JSON.stringify(rows,null,2)+'\\n');writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\\n');");
let restored=text;for(const {before,after}of [...replacements].reverse())restored=restored.replace(after,before);assert.equal(restored,original);
text=text.replace(/from(['"])(\.\/[^'"]+)\1/g,(_,q,p)=>'from '+JSON.stringify(pathToFileURL(path.resolve(ROOT,'tools',p)).href));
text='import {openReusePage} from '+JSON.stringify(pathToFileURL(path.resolve(ROOT,'tools/frame-tile-typed-lab.mjs')).href)+';\n'+text;
execFileSync(process.execPath,['--input-type=module','--check'],{input:text});
const proof={...r.proof,originalComparisonSha256:createHash('sha256').update(original).digest('hex'),allOriginalTimingPixelsStateRngAssertionsRetained:true,framesPerVariant:120,threeFiveSecondFpsSamplesPerVariant:true,originalFiveArenaSettingsUnchanged:true,replacements};
if(verify){console.log(JSON.stringify(proof));}else{
 const dir=OUT+'/arena-'+id;assert(!fs.existsSync(dir+'/receipt.json'),'do not overwrite an occurrence or rerun for greener timing');fs.mkdirSync(dir,{recursive:true});
 const admission={time:new Date().toISOString(),freeMB:Math.floor(freemem()/1048576),requiredMB:4352};fs.writeFileSync(dir+'/admission.json',JSON.stringify(admission,null,2)+'\n');assert(admission.freeMB>=4352,'original local browser admission');
 fs.writeFileSync(dir+'/adapter-source-proof.json',JSON.stringify(proof,null,2)+'\n');
 await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
 assert.equal(execFileSync('git',['status','--porcelain'],{cwd:ROOT,encoding:'utf8'}).trim(),'');
}
