// Feature-owned check declarations. Runtime values stay with the runner; manifests contain no host paths.
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
export function readChecks(root) {
  const entries=readdirSync(join(root,'tools/checks')).filter(f=>f.endsWith('.json')).sort().map(file=>{
    const r={order:9000,subset:'match',...JSON.parse(readFileSync(join(root,'tools/checks',file),'utf8'))};
    if(!/^[a-z0-9-]+$/.test(r.name)||!Number.isFinite(r.order)||!['match','always','exact','full'].includes(r.subset)
      ||!Array.isArray(r.args)||!r.args.length||r.args.some(a=>typeof a!=='string'&&(!a||!['suiteStart','runTag'].includes(a.runtime)))
      ||(r.port!==undefined&&(!Number.isInteger(r.port)||r.port<0||r.port>50))
      ||(r.timeout!==undefined&&(!Number.isFinite(r.timeout)||r.timeout<=0)))throw new Error('invalid check manifest: '+file);
    return r;
  }).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name));
  const seen=new Set();for(const r of entries){if(seen.has(r.name))throw new Error('duplicate check manifest: '+r.name);seen.add(r.name);}
  return entries;
}
export function registerChecks(entries,{want,shard,take,node,portFor,suiteStart,runTag,onSkip}) {
  const results=[];
  for(const r of entries){
    if(r.subset==='full'&&want.length)continue;
    if(r.subset==='exact'&&want.length&&!want.includes(r.name)){onSkip();continue;}
    if(!(r.subset==='always'&&want.length&&!shard)&&!take(r.name))continue;
    const runtime={suiteStart:String(suiteStart),runTag};
    results.push({name:r.name,cmd:node,args:[...r.args.map(a=>typeof a==='string'?a:runtime[a.runtime]),
      ...(want.length?(r.subsetArgs||[]):[])],
      ...(r.port===undefined?{}:{env:{PORT:String(portFor(r.port))}}),...(r.timeout?{timeout:r.timeout}:{})});
  }
  return results;
}
