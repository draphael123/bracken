// No game edits: canonical human/kit boss-rates, unchanged seeds, duration and simulation.
import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const [level,hero]=process.argv.slice(2);assert(level&&hero);
mkdirSync('gate-data',{recursive:true});
const name=level+'-'+hero,out='gate-data/'+name+'.json';
const args=['--import','./tools/balance-pid-tap.mjs','tools/boss-rates.mjs',level,'--heroes='+hero,'--profile=human','--flasks=kit','--ways=practiced,built','--seeds=24','--built-seeds=12','--jobs=1','--secs=240','--out='+out];
const run=spawnSync(process.execPath,args,{stdio:'inherit',env:{...process.env,HITLOG:'1',BOSS_MODES:'1',BALANCE_PROCESS_LOG:'gate-data/'+name+'.processes.jsonl'}});
assert.equal(run.status,0,'canonical measurement process');
const rows=JSON.parse(readFileSync(out,'utf8'));
assert.equal(rows.length,36);assert.equal(new Set(rows.map(r=>r.way+':'+r.seed)).size,36,'unique way/seed samples');
for(const r of rows){assert(!r.err,JSON.stringify(r));assert.equal(r.hero,hero);assert.equal(r.row,level);assert(r.outcome);assert(Number.isFinite(r.secs));assert(r.flasks0>0,'campaign flasks actually supplied');}
const receipt={commit:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),time:new Date().toISOString(),level,hero,args,complete:true,rows:rows.length};
writeFileSync('gate-data/'+name+'.receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
