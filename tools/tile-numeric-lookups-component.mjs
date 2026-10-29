// CLOUD ONLY. Exact pure-table and native-numeric reference components; no Game/FPS claim.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';import {execFileSync} from 'node:child_process';
assert(process.env.CI,'All testing stays in cloud');const mfile=new URL('./tile-numeric-lookups-source/manifest.json',import.meta.url),m=JSON.parse(fs.readFileSync(mfile)),sha=b=>createHash('sha256').update(b).digest('hex'),game=path.resolve(process.env.FIXED_ART_GAME),out=path.resolve(process.env.TILE_NUMERIC_OUT);fs.mkdirSync(out,{recursive:true});assert(!fs.existsSync(out+'/receipt.json'));
assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:game,encoding:'utf8'}).trim(),m.proof.gameController);const r={time:new Date().toISOString(),manifestSha256:sha(fs.readFileSync(mfile)),source:m.proof,workflowController:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),complete:false,rows:[],tableCases:0,lightCases:0,mutationContracts:0,globalRngCalls:0,noBrowserOrNativeGameFrameOrTimingClaim:true};const save=()=>fs.writeFileSync(out+'/receipt.json',JSON.stringify(r,null,2)+'\n');save();
const variants={};const random=Math.random,nativeHypot=Math.hypot,nativeMax=Math.max,hypotDescriptor=Object.getOwnPropertyDescriptor(Math,'hypot'),maxDescriptor=Object.getOwnPropertyDescriptor(Math,'max');let draws=0;Math.random=()=>{draws++;throw Error('No global RNG allowed in these pure recipes');};
try{
 for(const variant of ['baseline','candidate']){
  const dir=out+'/unit-'+variant;fs.mkdirSync(dir+'/src/redraw',{recursive:true});fs.writeFileSync(dir+'/package.json','{"type":"module"}\n');for(const f of ['src/px.js','src/level-tile-cache.js'])fs.copyFileSync(game+'/'+f,dir+'/'+f);
  for(const f of m[variant].filter(f=>f.file==='src/opaque-tile-fill.js'||f.file.startsWith('src/redraw/'))){const bytes=Buffer.from(f.contentBase64,'base64');assert.equal(sha(bytes),f.sha256);if(f.originalSha256)assert.equal(sha(fs.readFileSync(game+'/'+f.file)),f.originalSha256);let text=bytes.toString(),extra='';if(f.file.includes('rootway_tiles'))extra='\nexport {grain as __table};'+(variant==='candidate'?'export const __mirrorSize=()=>_NUMERIC_TILE_TABLE.size;':'');if(f.file.includes('skyroad_tiles'))extra='\nexport {beds as __table};'+(variant==='candidate'?'export const __mirrorSize=()=>_NUMERIC_TILE_TABLE.size;':'');if(f.file.includes('buried_city_tiles')||f.file.includes('sealed_pyramid_tiles'))extra='\nexport {lightAt as __light};'+(variant==='candidate'?'export const __nativeEligible=_LP_NATIVE;':'');fs.writeFileSync(dir+'/'+f.file,text+extra);assert.equal((text+extra).slice(0,-extra.length||undefined),text);}
  variants[variant]={reset:(await import(pathToFileURL(dir+'/src/level-tile-cache.js').href)).resetLevelTileCaches};for(const [key,file]of [['grain','rootway_tiles'],['beds','skyroad_tiles'],['city','buried_city_tiles'],['pyramid','sealed_pyramid_tiles']])variants[variant][key]=await import(pathToFileURL(dir+'/src/redraw/'+file+'.js').href);
 }
 for(const kind of ['grain','beds']){
  const seen=[new WeakMap(),new WeakMap()],next=[0,0];
  for(let scenario=0;scenario<16;scenario++){
   const traces=[[],[]],objects=[0,1].map(which=>({value:scenario%5,[Symbol.toPrimitive](hint){traces[which].push(hint+':'+this.value);return this.value;}})),keys=[0,1,2,3,4,-0,5,-1,0.5,NaN,Infinity,'0','4',0n,Symbol('zone')];
   for(let step=0;step<160;step++){
    if(step%19===0){variants.baseline.reset();variants.candidate.reset();}if(step%17===0)for(const o of objects)o.value=(o.value+1)%5;
    const results=[];for(const [which,variant]of ['baseline','candidate'].entries()){
     const key=step%7===0?objects[which]:keys[(step*7+scenario)%keys.length];try{const value=variants[variant][kind].__table(key);assert(Array.isArray(value));let id=seen[which].get(value);if(id===undefined){id=next[which]++;seen[which].set(value,id);}results.push({ok:true,value,id});}catch(e){results.push({ok:false,name:e.name,message:e.message});}
    }
    assert.equal(results[1].ok,results[0].ok);assert.deepEqual(traces[1],traces[0]);if(results[0].ok){assert.equal(results[1].id,results[0].id);assert.deepEqual(results[1].value,results[0].value);if(step%37===0){results[0].value[0][0]=37;results[1].value[0][0]=37;assert.deepEqual(results[1].value,results[0].value);}}else assert.deepEqual(results[1],results[0]);assert(variants.candidate[kind].__mirrorSize()<=5);r.tableCases++;
   }
  }
  r.rows.push({kind,referenceContentAliasResetFirstFactoryCoercionAndMutationExact:true,cases:16*160,maximumMirrorEntries:5});save();
 }
 const axes=[-Infinity,-1e200,-1024,-33,-32.000000000001,-32,-31.999999999999,-1,-Number.MIN_VALUE,-0,0,Number.MIN_VALUE,0.5,1,31.999999999999,32,32.000000000001,33,1024,1e200,Infinity,NaN],bases=[-Infinity,-100,-4,-3,-2,-1.4,-0,0,1,4,Infinity,NaN];
 for(const kind of ['city','pyramid']){
  assert(variants.candidate[kind].__nativeEligible);let cases=0;
  for(const dx of axes)for(const dy of axes)for(const base of bases)for(const mode of [0,1,2]){
   const I={lamps:[{x:dx,y:dy/1.2},{x:mode?0.25:2048,y:mode?0.5:128}],sun:mode===2?[{x0:710,x1:720}]:[]},a=variants.baseline[kind].__light(I,0,0,base),b=variants.candidate[kind].__light(I,0,0,base);assert(Object.is(b,a),JSON.stringify({kind,dx,dy,base,mode,a,b}));cases++;r.lightCases++;
  }
  r.rows.push({kind,nativeNumericOutputsExact:true,cases});save();
 }
 // Method substitutions and coordinate accessors remain observable in original order.
 for(const kind of ['city','pyramid'])for(const mode of ['coordinate-getters','hypot-function','max-function','hypot-getter','max-getter','hypot-throws','coordinate-changes-method']){
  const results=[];for(const variant of ['baseline','candidate']){
   Object.defineProperty(Math,'hypot',hypotDescriptor);Object.defineProperty(Math,'max',maxDescriptor);const trace=[],thrown=Error('original sentinel'),spyHypot=function(...args){trace.push(['hypot',...args]);if(mode==='hypot-throws')throw thrown;return Reflect.apply(nativeHypot,this,args);},spyMax=function(...args){trace.push(['max',...args]);return Reflect.apply(nativeMax,this,args);};
   if(mode==='hypot-function'||mode==='hypot-throws')Math.hypot=spyHypot;if(mode==='max-function')Math.max=spyMax;
   if(mode==='hypot-getter')Object.defineProperty(Math,'hypot',{configurable:true,get(){trace.push('hypot-get');return nativeHypot;}});if(mode==='max-getter')Object.defineProperty(Math,'max',{configurable:true,get(){trace.push('max-get');return nativeMax;}});
   const lamp={get x(){trace.push('x');if(mode==='coordinate-changes-method')Math.hypot=spyHypot;return 2048;},get y(){trace.push('y');return 100;}},I={lamps:[lamp,{x:0.5,y:1}],sun:[]};try{results.push({ok:true,value:variants[variant][kind].__light(I,0,0,-2),trace});}catch(e){assert.equal(e,thrown);results.push({ok:false,message:e.message,trace});}
  }assert.deepEqual(results[1],results[0]);r.mutationContracts++;Object.defineProperty(Math,'hypot',hypotDescriptor);Object.defineProperty(Math,'max',maxDescriptor);
 }
 assert.equal(draws,0);r.complete=true;r.status='PASS pure-array and native-numeric components only; no Game pixels,loading gain,lifetime,memory,campaign,layout orFPS proof';
}catch(e){r.error=e.stack;r.status='FAIL/Unknown component; preserve failed case and stop before Game timing';process.exitCode=1;}finally{Math.random=random;Object.defineProperty(Math,'hypot',hypotDescriptor);Object.defineProperty(Math,'max',maxDescriptor);r.globalRngCalls=draws;r.time=new Date().toISOString();r.gameSourceUnchanged=execFileSync('git',['status','--porcelain'],{cwd:game,encoding:'utf8'}).trim()==='';assert(r.gameSourceUnchanged);save();console.log(JSON.stringify({complete:r.complete,error:r.error,tableCases:r.tableCases,lightCases:r.lightCases,mutationContracts:r.mutationContracts,globalRngCalls:draws}));}
