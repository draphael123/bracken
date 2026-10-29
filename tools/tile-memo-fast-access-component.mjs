// CLOUD ONLY. Exact reference contract for the new internal memo access API.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
assert(process.env.CI,'All tests must run in cloud');const manifestFile=new URL('./tile-memo-fast-access-source/manifest.json',import.meta.url),m=JSON.parse(fs.readFileSync(manifestFile)),sha=b=>createHash('sha256').update(b).digest('hex'),game=path.resolve(process.env.FIXED_ART_GAME),out=path.resolve(process.env.FIXED_ART_LOADER_OUT);fs.mkdirSync(out,{recursive:true});
const original=fs.readFileSync(game+'/src/level-tile-cache.js'),file=m.candidate.find(x=>x.file==='src/level-tile-cache.js'),candidate=Buffer.from(file.contentBase64,'base64');assert.equal(sha(original),file.originalSha256);assert.equal(sha(candidate),file.sha256);assert(candidate.subarray(0,original.length).equals(original),'Original public API byte-preserved');
const a=await import('data:text/javascript;base64,'+original.toString('base64')),b=await import('data:text/javascript;base64,'+candidate.toString('base64')),rows=[];
const keys=['a','b','',0,-0,NaN,undefined,null,false,1n,Symbol('k'),{},[]],values=[undefined,null,false,0,NaN,'x',2n,Symbol('v'),{},[],new Uint8Array([1,2])];
for(let scenario=0;scenario<64;scenario++){
 const ref=a.levelTileMemo(),fast=b.levelTileMemoAccess(),traces=[[],[]],creations=[0,0];
 const use=(which,key,label,shouldThrow=false)=>{const make=()=>{creations[which]++;return()=>{traces[which].push(label);if(shouldThrow)throw Error('retained factory failure');return values[(label+scenario)%values.length];};};if(!which)return ref(key,make());const hit=fast.peek(key);return hit!==null?hit.value:fast.build(key,make());};
 for(let i=0;i<384;i++){
  if(i%41===0){a.resetLevelTileCaches();b.resetLevelTileCaches();}
  const key=keys[(i*7+scenario)%keys.length],label=(i*13+scenario)%47,throws=i%29===0,results=[];
  for(let which=0;which<2;which++){try{results.push({ok:true,value:use(which,key,label,throws)});}catch(e){results.push({ok:false,error:e.message});}}
  assert.equal(results[1].ok,results[0].ok);if(results[0].ok)assert(Object.is(results[1].value,results[0].value));else assert.equal(results[1].error,results[0].error);assert.deepEqual(traces[1],traces[0]);
 }
 assert(creations[1]<=creations[0]);rows.push({scenario,operations:384,originalFactoriesSupplied:creations[0],candidateFactoriesCreated:creations[1],returnIdentityExceptionsAndFirstFactoryTraceExact:true});
}
for(const resetInside of [false,true]){
 const ref=a.levelTileMemo(),fast=b.levelTileMemoAccess(),traces=[[],[]],marker={};
 for(let which=0;which<2;which++){
  const invoke=(key,factory)=>{if(!which)return ref(key,factory);const hit=fast.peek(key);return hit!==null?hit.value:fast.build(key,factory);};
  const outer=()=>{traces[which].push('outer');const inner=invoke('same',()=>{traces[which].push('inner');if(resetInside)(which?b:a).resetLevelTileCaches();return marker;});return inner;};
  assert.equal(invoke('same',outer),marker);(which?b:a).resetLevelTileCaches();assert.equal(invoke('same',()=>{throw Error('first factory must remain');}),marker);
 }
 assert.deepEqual(traces[1],traces[0]);rows.push({sameKeyReentrantAndResetInsideFactory:resetInside,exact:true});
}
const receipt={time:new Date().toISOString(),complete:true,manifestSha256:sha(fs.readFileSync(manifestFile)),candidateApiSha256:file.sha256,originalApiBytePreserved:true,scenarios:64,operations:64*384,additionalReentrantResetCases:2,rows,noGamePixelsLifetimeFullMemoryLayoutOrFpsClaim:true};fs.writeFileSync(out+'/component.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({complete:true,operations:receipt.operations,reentrantResetCases:2,source:file.sha256}));
