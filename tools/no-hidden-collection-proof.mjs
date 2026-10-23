// Run both complete ordered samples. Compare every result plus the final simulation and random stream.
import assert from 'node:assert/strict';
import {execFileSync,spawn} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const base='f7084c93602ebef2cc89759bcd0e39ae8c359538', file='tools/no-hidden-hits.mjs';
const before=execFileSync('git',['show',base+':'+file],{encoding:'utf8'}),after=readFileSync(file,'utf8');
const added='clear(); await collectRetired(); }',old='clear(); }';
assert.equal(after.replace(added,old).replaceAll('\r\n','\n'),before.replaceAll('\r\n','\n'),'only collection after a completed sample may differ');
mkdirSync('gate-data/no-hidden-collection',{recursive:true});
const run=async(label,src)=>{
  src=src.replace("from './cdp.mjs'","from "+JSON.stringify(pathToFileURL(resolve('tools/cdp.mjs')).href));
  const needle="BK.manualSimulation = true; BK.setHero('knight');";
  assert(src.includes(needle));
  src=src.replace(needle,"const rand=Math.random;let randomCalls=0,randomHash=2166136261;Math.random=()=>{const v=rand();randomCalls++;randomHash=Math.imul(randomHash^(v*4294967296>>>0),16777619)>>>0;return v;};"+needle);
  const end='    return out;';assert(src.includes(end));
  src=src.replace(end,"    out.control={randomCalls,randomHash,time:BK.time,state:BK.state,hero:{x:BK.P.x,y:BK.P.y,vx:BK.P.vx,vy:BK.P.vy,hp:BK.P.hp,st:BK.P.st},foes:BK.enemies().map(e=>({t:e.t,x:e.x,y:e.y,hp:e.hp,mode:e.mode,alive:e.alive}))};return out;");
  const result=resolve('gate-data/no-hidden-collection/'+label+'.json'),log=resolve('gate-data/no-hidden-collection/'+label+'.log');
  const child=spawn(process.execPath,['--input-type=module'],{env:{...process.env,NO_HIDDEN_RESULT:result},stdio:['pipe','pipe','pipe'],windowsHide:true});
  let output='';child.stdout.on('data',d=>{output+=d;process.stdout.write(label+': '+d);});child.stderr.on('data',d=>{output+=d;process.stderr.write(d);});child.stdin.end(src);
  const code=await new Promise((res,rej)=>{child.on('error',rej);child.on('exit',res);});writeFileSync(log,output);assert.equal(code,0,label+' complete original visibility assertions failed');return JSON.parse(readFileSync(result,'utf8'));
};
const a=await run('before',before),b=await run('after',after);assert.deepEqual(b,a,'measurements, simulation or random stream changed');
const receipt={time:new Date().toISOString(),base,source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),complete:true,levels:b.levels.length,tunnelFrames:b.tunnel.map(r=>r.frames),randomCalls:b.control.randomCalls,randomHash:b.control.randomHash,sha256:createHash('sha256').update(JSON.stringify(b)).digest('hex')};
writeFileSync('gate-data/no-hidden-collection/receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
