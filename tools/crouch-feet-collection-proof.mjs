// Compare the original complete measurement body with the yielding body, one hero at a time to bound the control's memory.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {openPage} from './cdp.mjs';
const base='af6d16cf6ecac7713d5b9a33b534c2cb5aeb6fb1', file='tools/crouch-feet.mjs';
const old=execFileSync('git',['show',base+':'+file],{encoding:'utf8'}),current=readFileSync(file,'utf8');
const heroes=['knight','warden','pirate','paladin','geomancer','reaper','pyro','berserker'];
const keys=['crouch','lowGuard','set','reload','crouchShot','trip','lowPoke','kneel','sense','harvest','ward'];
const originalAssertions=old.split(/\r?\n/).filter(l=>l.startsWith('assert.'));
for(const line of originalAssertions)assert(current.includes(line),'original assertion changed: '+line);
const body=(src,h)=>{let s=src.match(/rows = await pg.evalp\(`([\s\S]*?)`\);/)[1];s=s.replace('$'+'{JSON.stringify(HEROES)}',JSON.stringify([h])).replace('$'+'{JSON.stringify(KEYS)}',JSON.stringify(keys));
  const needle='feet:c.feet';assert(s.includes(needle));return s.replace(needle,"pixelHash:(()=>{let n=2166136261;for(const v of c.getContext('2d').getImageData(0,0,c.width,c.height).data)n=Math.imul(n^v,16777619)>>>0;return n;})(),"+needle);};
const pg=await openPage({audio:false,fonts:false,seed:1008}),results=[];
try{await pg.evalp('BK.manualSimulation=true');for(const hero of heroes){const before=await pg.evalp(body(old,hero));await pg.evalp('window.__brackenLabCollect()');const after=await pg.evalp(body(current,hero));assert.deepEqual(after,before,hero+' measurements or sprite hashes changed');results.push({hero,rows:after.length,sha256:createHash('sha256').update(JSON.stringify(after)).digest('hex')});console.log(hero+': '+after.length+' exact measurements and sprite hashes');await pg.evalp('window.__brackenLabCollect()');}}
finally{await pg.close();}
const receipt={time:new Date().toISOString(),base,source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),complete:true,originalAssertions:originalAssertions.length,totalRows:results.reduce((n,r)=>n+r.rows,0),results};
mkdirSync('gate-data',{recursive:true});writeFileSync('gate-data/crouch-feet-collection-proof.json',JSON.stringify(receipt,null,2)+'\n');
