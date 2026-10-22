import assert from'node:assert/strict';import{mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync}from'node:fs';
import{join}from'node:path';import{tmpdir}from'node:os';import{readTellFeatures,writeTellRegistry}from'./tell-registry.mjs';
const root=mkdtempSync(join(tmpdir(),'bracken-tells-'));mkdirSync(join(root,'src/tells'),{recursive:true});
try{
 const dir=join(root,'src/tells'),file=join(dir,'my-feature.json');
 const one={byHand:{'example|swingTell':'!'},answers:{'example|swingTell':'block'},heights:{'example|swingTell':'high'}};
 writeFileSync(file,JSON.stringify(one));assert.equal(readTellFeatures(root).byHand['example|swingTell'],'!');
 writeTellRegistry(root);writeTellRegistry(root,{check:true});assert(readFileSync(join(dir,'data.generated.js'),'utf8').includes('example|swingTell'));
 writeFileSync(join(dir,'duplicate.json'),JSON.stringify(one));assert.throws(()=>readTellFeatures(root),/duplicate/);rmSync(join(dir,'duplicate.json'));
 writeFileSync(file,JSON.stringify({...one,byHand:{'example|swingTell':'!!!'}}));assert.throws(()=>readTellFeatures(root),/invalid mark/);
 writeFileSync(file,JSON.stringify({...one,byHand:{'example|newTell':'!!'}}));assert.throws(()=>writeTellRegistry(root,{check:true}),/stale/);
}finally{rmSync(root,{recursive:true,force:true});}
console.log('ok tell-registry: automatic feature discovery, exact compilation, stale detection, duplicate and invalid-mark rejection');
