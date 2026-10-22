// Feature-owned source expressions, emitted into stable generated blocks so the existing runtime and source audits stay intact.
import{readFileSync,readdirSync,writeFileSync}from'node:fs';import{join}from'node:path';import{fileURLToPath}from'node:url';
const ROOT=fileURLToPath(new URL('..',import.meta.url));
export const MAIN_REGISTRIES={
 DMG:{prefix:'const DMG = '},EHP:{prefix:'const EHP = '},DMG_TUNED:{prefix:'Object.assign(DMG, '},EHP_TUNED:{prefix:'Object.assign(EHP, '},
 BOSS_T:{prefix:'const BOSS_T = ',array:true},BEAST_SHORT:{prefix:'const BEAST_SHORT = '},COLS:{prefix:'const COLS = '},CV_STEP:{prefix:'const CV_STEP = '},
 TIER:{prefix:'const TIER = '},TIER_BOSS:{prefix:'const TIER_BOSS = '},HEROES:{prefix:'const HEROES = ',array:true},HERO_LOOP:{prefix:'const HERO_LOOP = '},
 DK_KEYS:{prefix:'const DK_KEYS = '},WARDEN_KEYS:{prefix:'const WARDEN_KEYS = '},BZ_TEACH:{prefix:'const BZ_TEACH = '},RG_TEACH:{prefix:'const RG_TEACH = '},
 BOSS_HIT:{prefix:'const BOSS_HIT = '},BOSS_HIT_UNDERWATER:{prefix:'Object.assign(BOSS_HIT, '},BOSS_HIT_TUNED:{prefix:'Object.assign(BOSS_HIT, '},
 DUEL_HERO:{prefix:'const DUEL_HERO = '},LP_HERO:{prefix:'const LP_HERO = '},
};
export function readMainFeatures(root=ROOT){
 const out=Object.fromEntries(Object.keys(MAIN_REGISTRIES).map(k=>[k,[]])),seen=new Map(),imports=new Set();
 for(const file of readdirSync(join(root,'src/registries')).filter(f=>f.endsWith('.json')).sort()){
  const data=JSON.parse(readFileSync(join(root,'src/registries',file),'utf8'));
  if(!data.entries||typeof data.entries!=='object')throw Error('invalid registry feature '+file);
  if(data.imports!==undefined){if(!Array.isArray(data.imports)||data.imports.some(s=>typeof s!=='string'||!/^import\s/.test(s)||!/from\s*['"]\.\//.test(s)))throw Error('invalid imports in '+file);for(const line of data.imports)imports.add(line.trim());}
  for(const[id,raw]of Object.entries(data.entries)){
   if(!(id in out))throw Error('unknown main registry '+id+' in '+file);
   for(const r of Array.isArray(raw)?raw:[raw]){
    if(!r||typeof r.key!=='string'||!r.key||typeof r.value!=='string'||!r.value.trim()||
      (r.order!==undefined&&!Number.isFinite(r.order)))throw Error('invalid '+id+' entry in '+file);
    const key=id+'|'+r.key,prior=seen.get(key);
    if(prior&&!(prior===file&&r.legacyDuplicate===true))throw Error('duplicate main registry '+key+' in '+file);
    seen.set(key,file);out[id].push({...r,order:r.order??9000,file});
   }
  }
 }
 for(const rows of Object.values(out))rows.sort((a,b)=>a.order-b.order||a.key.localeCompare(b.key)||a.file.localeCompare(b.file));
 Object.defineProperty(out,'imports',{value:[...imports].sort()});return out;
}
export function mainBlockPattern(id){return new RegExp('/\\* registry:BEGIN '+id+' \\*/[\\s\\S]*?/\\* registry:END '+id+' \\*/','g');}
export function writeMainRegistries(root=ROOT,{check=false}={}){
 const all=readMainFeatures(root),path=join(root,'src/main.js'),original=readFileSync(path,'utf8');let text=original;
 const ir=mainBlockPattern('IMPORTS');if([...text.matchAll(ir)].length!==1)throw Error('missing generated feature imports block');
 text=text.replace(ir,()=> '/* registry:BEGIN IMPORTS */\n'+all.imports.join('\n')+'\n/* registry:END IMPORTS */');
 for(const[id,spec]of Object.entries(MAIN_REGISTRIES)){
  const re=mainBlockPattern(id);if([...text.matchAll(re)].length!==1)throw Error('missing or duplicate generated main block '+id);
  const rows=all[id].map(r=>'  '+(spec.array?'':(/^[A-Za-z_$][\w$]*$/.test(r.key)?r.key:JSON.stringify(r.key))+': ')+r.value+',');
  const block='/* registry:BEGIN '+id+' */\n'+spec.prefix+(spec.array?'[':'{')+'\n'+rows.join('\n')+'\n'+(spec.array?']':'}')+(spec.prefix.startsWith('Object.assign')?');':';')+'\n/* registry:END '+id+' */';
  text=text.replace(re,()=>block);
 }
 if(check&&text!==original)throw Error('main registries are stale: run node tools/registries.mjs');
 if(!check&&text!==original)writeFileSync(path,text);
 return all;
}
