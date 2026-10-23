// Reference game checkouts must use the complete same harness, including helpers added by another task branch.
import{readFileSync,copyFileSync,mkdirSync,realpathSync}from'node:fs';import{resolve,dirname,relative,join,sep}from'node:path';
export function copyLabHarness(from,to,entries=['cdp.mjs']){
 const source=realpathSync(resolve(from,'tools')),target=resolve(to,'tools'),seen=new Set();
 const visit=file=>{const absolute=resolve(source,file),real=realpathSync(absolute),rel=relative(source,real);if(rel.startsWith('..'+sep)||rel==='..'||resolve(source,rel)!==real)throw new Error('harness dependency leaves tools: '+file);if(seen.has(rel))return;seen.add(rel);
  const code=readFileSync(real,'utf8');for(const m of code.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+\.m?js)['"]/g))visit(relative(source,resolve(dirname(real),m[1])));
  const dest=join(target,rel);mkdirSync(dirname(dest),{recursive:true});copyFileSync(real,dest);
 };
 for(const file of entries)visit(file);return[...seen].sort();
}
