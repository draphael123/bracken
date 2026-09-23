import {LEGACY_NODES, SKILLS} from './progression-catalog.js';
import {levelOfXp, xpFloor} from './xp.js';
export {LEGACY_NODES, SKILLS};
export const PROGRESSION_VERSION = 1;
export const HERO_IDS = ['knight','pyro','paladin','pirate','reaper','warden'];
const object = v => !!v && typeof v === 'object' && !Array.isArray(v);
const clone = v => JSON.parse(JSON.stringify(v));
export const slotsAt = lv => lv >= 16 ? 4 : lv >= 8 ? 3 : 2;
const BY_HERO=Object.fromEntries(HERO_IDS.map(h=>[h,SKILLS.filter(n=>n.hero===h)]));
const BY_ID=Object.fromEntries(HERO_IDS.map(h=>[h,Object.fromEntries(BY_HERO[h].map(n=>[n.id,n]))]));
export const growthNodes=Object.fromEntries(HERO_IDS.map(h=>[h,new Set(LEGACY_NODES.filter(n=>n.hero===h&&n.destination==='growth').map(n=>n.id))]));
export const skillFor = (h,id) => BY_ID[h]?.[id];
export const skillsFor = h => BY_HERO[h]||[];
export const skillScale = lv => 1 + Math.min(Math.max(0,lv),24) / 120;
export function growthAt(h,lv){
 lv=Math.max(0,lv);const ranks=Math.min(lv,24)/12;
 return {hp:({knight:100,pyro:88,paladin:120,pirate:90,reaper:95,warden:100}[h]||100)+3*lv+Math.round(8*ranks),stamina:100+5*lv,damage:Math.floor(lv/2)+Math.floor(ranks*(h==='reaper'?1.5:1)),ranks,techniqueRank:Math.floor(ranks),skillMultiplier:skillScale(lv)};
}
export function checksum(raw){let h=14695981039346656037n;for(let i=0;i<raw.length;i++){h^=BigInt(raw.charCodeAt(i));h=BigInt.asUintN(64,h*1099511628211n);}return h.toString(16).padStart(16,'0');}
export function validateProgress(p){
 if(!object(p))throw Error('Save must contain an object.');
 const inspect=v=>{if(!v||typeof v!=='object')return;for(const key of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(key))throw Error('Unsafe save key. Original retained.');inspect(v[key]);}};inspect(p);
 if(p.hero!==undefined&&!HERO_IDS.includes(p.hero))throw Error('Unknown hero. Original save retained.');
 for(const value of Object.values(p.done||{}))if(!object(value))throw Error('Invalid completion history. Original retained.');
 if(p.progressionVersion && p.progressionVersion>PROGRESSION_VERSION)throw Error('This save needs a newer version of BRACKEN.');
 for(const k of ['coins','silverSpent'])if(p[k]!==undefined&&(!Number.isFinite(p[k])||p[k]<0))throw Error('Invalid '+k+'. Original save retained.');
 for(const k of ['xp','done','talents','skillOwned','loadouts','heroes','items'])if(p[k]!==undefined&&!object(p[k]))throw Error('Invalid '+k+'. Original save retained.');
 for(const v of Object.values(p.xp||{}))if(!Number.isFinite(v)||v<0)throw Error('Invalid XP. Original save retained.');
 for(const [h,v] of Object.entries(p.skillOwned||{})){if(!object(v))throw Error('Invalid skill ownership: '+h);for(const [id,on] of Object.entries(v))if(on!==true||!skillFor(h,id))throw Error('Invalid owned skill: '+id);}
 for(const [h,v] of Object.entries(p.loadouts||{}))if(!Array.isArray(v)||v.length>4||v.some(id=>id!==null&&(!skillFor(h,id)||!p.skillOwned?.[h]?.[id]))||new Set(v.filter(Boolean)).size!==v.filter(Boolean).length)throw Error('Invalid loadout: '+h);
 return p;
}
export function migrateProgress(raw, campaignIds=[]){
 const source=raw===null?'{}':raw;let parsed;try{parsed=JSON.parse(source);}catch{throw Error('Unreadable save. Original save retained.');}
 validateProgress(parsed);const p=clone(parsed);
 if(p.progressionVersion===PROGRESSION_VERSION)return {progress:p,receipt:p.progressionReceipt,changed:false};
 p.xp=p.xp||{};p.done=p.done||{};
 // Reconstruct only recorded solo progress. Runtime co-op loans and god-mode point counters are never read.
 if(!p.xpVersion){const owner=p.hero||'knight';if(!p.perHero){p.done[owner]=p.done[owner]||{};for(const id of campaignIds)if(p[id]?.cleared)p.done[owner][id]=1;}
  for(const h of HERO_IDS){const n=Object.keys(p.done[h]||{}).length;p.xp[h]=Math.max(p.xp[h]||0,xpFloor(n));}p.xpVersion=1;}
 const warnings=[],points={},owned={},loadouts={},mapped=[];
 for(const h of HERO_IDS){
  const mm=p.talents?.[h]||{};if(!object(mm))throw Error('Invalid legacy talents: '+h);
  const ns=LEGACY_NODES.filter(n=>n.hero===h);let spent=0;owned[h]={};
  for(const [id,rank] of Object.entries(mm)){
   if(rank!==true&&(!Number.isFinite(rank)||rank<0))throw Error('Invalid legacy rank: '+h+'/'+id);
   if(!rank)continue;const n=ns.find(n=>n.id===id);
   if(!n){warnings.push(h+'/'+id+': unknown historical node retained in source backup');continue;}
   const r=rank===true?1:rank;spent+=Math.min(n.max,r)*n.cost;
   if(r>n.max)warnings.push(h+'/'+id+': rank above historical cap');
   if(n.destination==='skill')owned[h][id]=true;
   mapped.push({hero:h,id,rank:r,destination:n.destination});
  }
  // Skills bought before trees existed are still learned skills.
  for(const n of skillsFor(h))if(n.active&&p.items?.[n.id])owned[h][n.id]=true;
  const earned=Math.min(30,levelOfXp(p.xp[h]||0));points[h]=earned;
  if(spent>earned)warnings.push(h+': recorded allocation '+spent+' exceeds earned '+earned+'; refund uses earned XP only');
  const preferred=h===(p.hero||'knight')?[p.skill,p.skill2]:[];
  if(h==='reaper'&&owned[h].summonSkeleton)preferred.unshift('summonSkeleton');
  const order=[...preferred,...skillsFor(h).filter(n=>n.active).map(n=>n.id),...Object.keys(owned[h])];
  loadouts[h]=[...new Set(order.filter(id=>owned[h][id]))].slice(0,slotsAt(levelOfXp(p.xp[h]||0)));
 }
 const refund=25*Object.values(points).reduce((a,b)=>a+b,0);
 p.coins=(p.coins||0)+refund;p.skillOwned=owned;p.loadouts=loadouts;p.progressionVersion=PROGRESSION_VERSION;
 p.progressionReceipt={from:parsed.progressionVersion||0,to:PROGRESSION_VERSION,talentVersion:parsed.talentVersion||1,sourceChecksum:checksum(source),points,refund,mapped,warnings};
 // Old data stays available for historical reconciliation, but old destructive tree normalizers must not run.
 p.talentVersion=6;p.talentsBack=0;p.talentsBackHero=0;p.progressionNotice=refund;
 validateProgress(p);return {progress:p,receipt:p.progressionReceipt,changed:true};
}
export function loadProgress(storage,key,raw,campaignIds=[]){
 const result=migrateProgress(raw,campaignIds);if(!result.changed)return result;
 const backup=key+'.before-progression-v1.'+checksum(raw===null?'{}':raw);
 // Preserve the exact raw source BEFORE transforming or invoking game defaults. Fail closed if storage is full.
 if(raw!==null){const old=storage.getItem(backup);if(old!==null&&old!==raw)throw Error('Backup identity conflict. Original save retained.');storage.setItem(backup,raw);if(storage.getItem(backup)!==raw)throw Error('Could not verify save backup.');}
 const transformed=JSON.stringify(result.progress),previous=storage.getItem(key);
 try{storage.setItem(key,transformed);if(storage.getItem(key)!==transformed)throw Error('Save write verification failed.');}
 catch(error){try{if(previous===null)storage.removeItem(key);else storage.setItem(key,previous);}catch{}throw error;}
 return {...result,backup:raw===null?null:backup};
}
export const equipped = (p,h,lv) => (p.loadouts?.[h]||[]).slice(0,slotsAt(lv));
export function buySkill(p,h,id,lv){
 const n=skillFor(h,id);if(!n)return 'Unknown skill';if(p.skillOwned?.[h]?.[id])return 'Already owned';if(lv<n.level)return 'Requires level '+n.level;if((p.coins||0)<n.price)return 'Need '+(n.price-(p.coins||0))+' more coins';
 p.skillOwned=p.skillOwned||{};p.skillOwned[h]=p.skillOwned[h]||{};p.skillOwned[h][id]=true;p.coins-=n.price;return null;
}
export function equipSkill(p,h,id,index,lv,safe){
 if(!safe)return 'Change skills at a shop, map or safe shrine';if(index<0||index>=slotsAt(lv))return 'Slot is locked';if(id!==null&&!p.skillOwned?.[h]?.[id])return 'Learn it first';
 p.loadouts=p.loadouts||{};const list=p.loadouts[h]=[...(p.loadouts[h]||[])];while(list.length<=index)list.push(null);
 const previous=list.indexOf(id);if(id&&previous>=0&&previous!==index)list[previous]=list[index]||null;list[index]=id;return null;
}

export const exportProgress = p => JSON.stringify(validateProgress(p),null,2);
export function importProgress(storage,key,raw,campaignIds=[]){
 const result=migrateProgress(raw,campaignIds),previous=storage.getItem(key),encoded=JSON.stringify(result.progress);
 if(previous!==null){const backup=key+'.before-import.'+checksum(previous);storage.setItem(backup,previous);if(storage.getItem(backup)!==previous)throw Error('Could not verify import backup.');}
 const sourceKey=key+'.import-source.'+checksum(raw);storage.setItem(sourceKey,raw);if(storage.getItem(sourceKey)!==raw)throw Error('Could not verify imported source.');
 try{storage.setItem(key,encoded);if(storage.getItem(key)!==encoded)throw Error('Could not verify imported save.');}catch(error){try{if(previous===null)storage.removeItem(key);else storage.setItem(key,previous);}catch{}throw error;}
 return result;
}
