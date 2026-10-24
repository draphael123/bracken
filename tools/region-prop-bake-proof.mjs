// Component candidate: four region kits already kept in PROP on every level load.
// Measure whether retaining those same immutable canvases avoids redundant baking, with every byte compared.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const source=readFileSync('src/main.js','utf8'),recipes={};
for(const key of ['flot','city','reef','lw']){
 const at=source.indexOf(key+': ',source.indexOf('function* bakeAllG0('));assert(at>0);
 const begin=source.indexOf('{',at);let depth=0,quote=null,end;
 for(let i=begin;i<source.length;i++){const c=source[i];if(quote){if(c==='\\')i++;else if(c===quote)quote=null;continue;}if(c==='"'||c==="'"){quote=c;continue;}if(c==='{')depth++;else if(c==='}'&&!--depth){end=i+1;break;}}
 assert(end>begin);recipes[key]=source.slice(begin,end);
}
const out=process.env.REGION_PROP_OUT||'gate-data/region-props';mkdirSync(out,{recursive:true});process.env.BRACKEN_PROCESS_LOG=out+'/processes.jsonl';
const pg=await openPage({audio:false,fonts:false,seed:1919});
try{
 const rows=await pg.evalp(`(async()=>{BK.manualSimulation=true;const FLP=await import('/src/flot_props.js'),CTP=await import('/src/city_props.js'),RFP=await import('/src/reef_props.js'),LWP=await import('/src/lw_props.js');
 const recipes=${JSON.stringify(recipes)},build=Object.fromEntries(Object.entries(recipes).map(([k,s])=>[k,()=>eval('('+s+')')])),rows=[];
 const hash=async c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return [...new Uint8Array(await crypto.subtle.digest('SHA-256',d))].map(x=>x.toString(16).padStart(2,'0')).join('');};
 const entries=async(o,p='',out=[])=>{if(o instanceof HTMLCanvasElement){out.push({path:p,w:o.width,h:o.height,hash:await hash(o)});return out;}if(o&&typeof o==='object')for(const [k,v]of Object.entries(o))await entries(v,p+'.'+k,out);return out;};
 const create=Document.prototype.createElement,random=Math.random;let made=0,rng=0;Document.prototype.createElement=function(name,...a){if(name==='canvas')made++;return create.call(this,name,...a);};Math.random=()=>{rng++;return random();};
 try{for(let round=1;round<=3;round++)for(const [key,bake]of Object.entries(build)){const warm=bake(),results=[];for(const variant of ['before','warm','return']){made=0;rng=0;const start=performance.now(),value=variant==='warm'?warm:bake(),ms=performance.now()-start;results.push({variant,ms,canvases:made,rng,entries:await entries(value)});}rows.push({round,key,results});if(typeof gc==='function')gc();}}finally{Document.prototype.createElement=create;Math.random=random;}return rows;})()`,180000);
 assert.deepEqual(pg.errors,[]);
 for(const row of rows){const [a,b,c]=row.results;assert(a.canvases>0);assert.equal(b.canvases,0);assert.equal(a.rng,0);assert.equal(b.rng,0);assert.equal(c.rng,0);assert.deepEqual(a.entries,b.entries);assert.deepEqual(c.entries,b.entries);}
 const receipt={time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),complete:true,diagnosticOnly:true,rounds:3,kits:4,rows};writeFileSync(out+'/receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({complete:true,rows:rows.map(r=>({round:r.round,key:r.key,entries:r.results[0].entries.length,results:r.results.map(({entries,...x})=>x)}))}));
}finally{await pg.close();}
