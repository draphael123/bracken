import assert from'node:assert/strict';import{mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';
import{MAIN_REGISTRIES,readMainFeatures,writeMainRegistries}from'./main-registry.mjs';
const root=mkdtempSync(join(tmpdir(),'bracken-main-registry-'));mkdirSync(join(root,'src/registries'),{recursive:true});
try{
 const main=join(root,'src/main.js'),feature=join(root,'src/registries/example.json');
 writeFileSync(main,['/* registry:BEGIN IMPORTS */\n/* registry:END IMPORTS */',...Object.keys(MAIN_REGISTRIES).map(id=>'/* registry:BEGIN '+id+' */\n/* registry:END '+id+' */')].join('\n'));
 const one={imports:["import { EXAMPLE } from './example.js';"],entries:{EHP:{key:'example',value:'EXAMPLE.hp',order:9000}}};
 writeFileSync(feature,JSON.stringify(one));assert.equal(readMainFeatures(root).EHP[0].key,'example');writeMainRegistries(root);writeMainRegistries(root,{check:true});
 assert(readFileSync(main,'utf8').includes('example: EXAMPLE.hp,'));assert(readFileSync(main,'utf8').includes(one.imports[0]));
 const good=readFileSync(main,'utf8');writeFileSync(main,good.replace('example: EXAMPLE.hp,','<<<<<<< ours\nexample: 12,\n=======\nexample: 34,\n>>>>>>> theirs'));
 writeMainRegistries(root);assert.equal(readFileSync(main,'utf8'),good,'a generated-block merge conflict must be resolved from feature declarations');
 writeFileSync(main,readFileSync(main,'utf8').replace('EXAMPLE.hp,','999,'));assert.throws(()=>writeMainRegistries(root,{check:true}),/stale/);writeMainRegistries(root);
 writeFileSync(join(root,'src/registries/collision.json'),JSON.stringify(one));assert.throws(()=>readMainFeatures(root),/duplicate/);
}finally{rmSync(root,{recursive:true,force:true});}
console.log('ok main-registry: automatic features/imports, exact order, stale-output detection and collision rejection');
