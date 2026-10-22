import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {readChecks,registerChecks} from './check-registry.mjs';
const root=import.meta.dirname+'/..', checks=readChecks(root);
assert.equal(new Set(checks.map(r=>r.name)).size,checks.length);assert.equal(checks[0].name,'syntax');assert.equal(checks.at(-1).name,'profile-leaks');
const opts={want:[],shard:null,take:()=>true,node:'node',portFor:i=>1000+i,suiteStart:123,runTag:'abc123',onSkip(){}};
const all=registerChecks(checks,opts);assert.equal(all.length,checks.length);assert(all.at(-1).args.includes('123'));assert(all.at(-1).args.includes('abc123'));
const subset=registerChecks(checks,{...opts,want:['fonts'],take:n=>n==='fonts'});
assert.deepEqual(subset.map(r=>r.name),['syntax','fonts']);assert(subset[0].args.includes('--changed'));
assert(!registerChecks(checks,{...opts,want:['textfit'],take:n=>n.includes('textfit')}).some(r=>r.name==='textfit-full'));
assert(registerChecks(checks,{...opts,want:['textfit-full'],take:n=>n.includes('textfit-full')}).some(r=>r.name==='textfit-full'));
const temp=mkdtempSync(join(tmpdir(),'bracken-registry-'));mkdirSync(join(temp,'tools/checks'),{recursive:true});
try{const file=join(temp,'tools/checks/new-feature.json'),one={name:'new-feature',order:9000,subset:'match',args:['tools/new-feature.mjs']};
 writeFileSync(file,JSON.stringify(one));assert.equal(readChecks(temp)[0].name,'new-feature','a new file is discovered without editing a shared list');
 writeFileSync(join(temp,'tools/checks/duplicate.json'),JSON.stringify(one));assert.throws(()=>readChecks(temp),/duplicate/);
}finally{rmSync(temp,{recursive:true,force:true});}
console.log('ok check-registry: all '+checks.length+' descriptors, subset rules, runtime isolation and automatic new-feature discovery');
