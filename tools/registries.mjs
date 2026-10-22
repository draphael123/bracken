// The generated lists are reproducible build artifacts. Feature branches edit their own declarations.
import{spawnSync}from'node:child_process';import{fileURLToPath}from'node:url';
import{writeTellRegistry}from'./tell-registry.mjs';
import{writeMainRegistries}from'./main-registry.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
export function generateRegistries(){
 writeMainRegistries();
 writeTellRegistry();
 for(const tool of ['tools/tells.mjs','tools/modulepreload.mjs']){
  const r=spawnSync(process.execPath,[tool,'--write'],{cwd:root,encoding:'utf8'});
  if(r.status!==0)throw Error('registry generation failed: '+(r.stdout||'')+(r.stderr||'')+(r.error?.message||''));
 }
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){generateRegistries();console.log('registries: tells and modulepreloads generated from feature files and the import graph');}
