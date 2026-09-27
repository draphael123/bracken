import {LEGACY_NODES, SKILLS} from './progression-catalog.js';
import {levelOfXp, xpFloor} from './xp.js';
export {LEGACY_NODES, SKILLS};
/* 2 (2026-09-24): PASSIVES COME WITH LEVELS, ABILITIES ARE BOUGHT (docs/briefs/hero-kits.md 1b). A passive is no longer sold
   or slotted: it is on from the hero level the catalog gives it. Version 1 saves are migrated by passivesToLevels below. */
export const PROGRESSION_VERSION = 2;
export const HERO_IDS = ['knight','pyro','paladin','pirate','reaper','warden','geomancer'];   /* THE GEOMANCER (2026-09-24): a third starter */
const object = v => !!v && typeof v === 'object' && !Array.isArray(v);
const clone = v => JSON.parse(JSON.stringify(v));
/* TWO ABILITY SLOTS, AT EVERY LEVEL (Daniel, 2026-09-23): "the UI gets too messy with four". A save that had three or four
   equipped keeps its first two; the rest stay owned and can be swapped in at a shop, the map or a safe shrine. */
export const MAX_SLOTS = 2;
export const slotsAt = () => MAX_SLOTS;
const BY_HERO=Object.fromEntries(HERO_IDS.map(h=>[h,SKILLS.filter(n=>n.hero===h)]));
const BY_ID=Object.fromEntries(HERO_IDS.map(h=>[h,Object.fromEntries(BY_HERO[h].map(n=>[n.id,n]))]));
export const growthNodes=Object.fromEntries(HERO_IDS.map(h=>[h,new Set(LEGACY_NODES.filter(n=>n.hero===h&&n.destination==='growth').map(n=>n.id))]));
export const skillFor = (h,id) => BY_ID[h]?.[id];
export const skillsFor = h => BY_HERO[h]||[];
/* A PASSIVE (active:false in the catalog) is ON from its level, bought or not, and a passive a save paid for before this is on
   whatever its level (it is kept: the coins come back, the technique stays). Never in a slot: two slots are for abilities. */
export const isPassive = (h,id) => { const n=BY_ID[h]?.[id]; return !!n && !n.active; };
export const passiveOn = (p,h,id,lv) => { const n=BY_ID[h]?.[id]; return !!n && !n.active && (lv>=n.level || !!p?.skillOwned?.[h]?.[id]); };
/* the ladder: every passive this hero has, in the order they arrive */
export const passiveLadder = h => skillsFor(h).filter(n=>!n.active).sort((a,b)=>a.level-b.level||a.branch-b.branch||a.row-b.row||a.col-b.col);
/* what a level-up from `from` to `to` brings (from < n.level <= to) */
export const passivesArriving = (h,from,to) => passiveLadder(h).filter(n=>n.level>from&&n.level<=to);
export const skillScale = lv => 1 + Math.min(Math.max(0,lv),24) / 120;
export function growthAt(h,lv){
 lv=Math.max(0,lv);const ranks=Math.min(lv,24)/12;
 return {hp:({knight:100,pyro:88,paladin:120,pirate:90,reaper:95,warden:100,geomancer:95}[h]||100)+3*lv+Math.round(8*ranks),stamina:100+5*lv,damage:Math.floor(lv/2)+Math.floor(ranks*(h==='reaper'?1.5:1)),ranks,techniqueRank:Math.floor(ranks),skillMultiplier:skillScale(lv)};
}
export function checksum(raw){let h=14695981039346656037n;for(let i=0;i<raw.length;i++){h^=BigInt(raw.charCodeAt(i));h=BigInt.asUintN(64,h*1099511628211n);}return h.toString(16).padStart(16,'0');}
export function validateProgress(p){
 if(!object(p))throw Error('Save must contain an object.');
 renameSkills(p);
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
/* A SKILL THAT WAS REPLACED IN ITS OWN SLOT (the Geomancer's LODESTONE became STONE WALL at level 9, 2026-09-24): a save that bought the
   old one owns the new one, in the same loadout slot - the price was the same. Done before the save is judged, so an id no catalog has
   any more is never "Invalid owned skill" (the save refused). */
const RENAMED_SKILLS = { geomancer: { lodestone: 'stoneWall' } };
function renameSkills(p){
 for(const [h,ren] of Object.entries(RENAMED_SKILLS))for(const [from,to] of Object.entries(ren)){
  const own=p.skillOwned&&object(p.skillOwned[h])?p.skillOwned[h]:null;if(own&&own[from]!==undefined){if(own[from]===true)own[to]=true;delete own[from];}
  const lo=p.loadouts&&Array.isArray(p.loadouts[h])?p.loadouts[h]:null;if(lo)for(let i=0;i<lo.length;i++)if(lo[i]===from)lo[i]=lo.includes(to)?null:to;}
}
export function migrateProgress(raw, campaignIds=[]){
 const source=raw===null?'{}':raw;let parsed;try{parsed=JSON.parse(source);}catch{throw Error('Unreadable save. Original save retained.');}
 validateProgress(parsed);const p=clone(parsed);
 if(p.progressionVersion===PROGRESSION_VERSION)return {progress:p,receipt:p.progressionReceipt,passiveReceipt:p.passiveReceipt,changed:false};
 if(!(p.progressionVersion>=1))talentsToSkills(p,parsed,source,campaignIds);
 passivesToLevels(p,source);
 validateProgress(p);return {progress:p,receipt:p.progressionReceipt,passiveReceipt:p.passiveReceipt,changed:true};
}
/* VERSION 0 TO 1: the talent trees became bought skills (the step every version-0 save still takes first). */
function talentsToSkills(p,parsed,source,campaignIds){
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
 p.coins=(p.coins||0)+refund;p.skillOwned=owned;p.loadouts=loadouts;p.progressionVersion=1;
 p.progressionReceipt={from:parsed.progressionVersion||0,to:1,talentVersion:parsed.talentVersion||1,sourceChecksum:checksum(source),points,refund,mapped,warnings};
 // Old data stays available for historical reconciliation, but old destructive tree normalizers must not run.
 p.talentVersion=6;p.talentsBack=0;p.talentsBackHero=0;p.progressionNotice=refund;
}
/* VERSION 1 TO 2: PASSIVES COME WITH LEVELS. Every passive a hero OWNS stays owned (so it stays on, whatever its level), and the
   ones that were BOUGHT give their price back. Bought is exact, not guessed: a version-1 owned passive either came across from the
   old talent trees - it is in progressionReceipt.mapped, and those points were already paid back at 25 a point - or buySkill sold
   it for its catalog price, which is the only other way into skillOwned. So a mapped one pays nothing, and every other one pays its
   price, once: the receipt records each, with the checksum of the save it was read from. A passive leaves every loadout (its slot
   goes empty rather than the ability beside it moving keys), and trailing empty slots are dropped. */
function passivesToLevels(p,source){
 const mapped=new Set(((p.progressionReceipt&&p.progressionReceipt.mapped)||[]).filter(m=>m&&m.destination==='skill').map(m=>m.hero+'/'+m.id));
 const refunded=[],kept=[];let refund=0;p.skillOwned=p.skillOwned||{};p.loadouts=p.loadouts||{};
 for(const h of HERO_IDS){
  for(const id of Object.keys(p.skillOwned[h]||{})){if(!isPassive(h,id))continue;kept.push(h+'/'+id);
   if(!mapped.has(h+'/'+id)){const price=skillFor(h,id).price;refund+=price;refunded.push({hero:h,id,price});}}
  if(p.loadouts[h]){const list=p.loadouts[h].map(id=>id&&isPassive(h,id)?null:id);while(list.length&&list[list.length-1]===null)list.pop();p.loadouts[h]=list;}
 }
 p.coins=(p.coins||0)+refund;
 p.passiveReceipt={from:1,to:2,sourceChecksum:checksum(source),refund,refunded,kept};
 if(refund){p.progressionNotice=(p.progressionNotice||0)+refund;p.passiveNotice=1;}
 p.progressionVersion=PROGRESSION_VERSION;
}
export function loadProgress(storage,key,raw,campaignIds=[]){
 const result=migrateProgress(raw,campaignIds);if(!result.changed)return result;
 const backup=key+'.before-progression-v'+PROGRESSION_VERSION+'.'+checksum(raw===null?'{}':raw);
 // Preserve the exact raw source BEFORE transforming or invoking game defaults. Fail closed if storage is full.
 if(raw!==null){const old=storage.getItem(backup);if(old!==null&&old!==raw)throw Error('Backup identity conflict. Original save retained.');storage.setItem(backup,raw);if(storage.getItem(backup)!==raw)throw Error('Could not verify save backup.');}
 const transformed=JSON.stringify(result.progress),previous=storage.getItem(key);
 try{storage.setItem(key,transformed);if(storage.getItem(key)!==transformed)throw Error('Save write verification failed.');}
 catch(error){try{if(previous===null)storage.removeItem(key);else storage.setItem(key,previous);}catch{}throw error;}
 return {...result,backup:raw===null?null:backup};
}
export const equipped = (p,h,lv) => (p.loadouts?.[h]||[]).slice(0,slotsAt(lv)).map(id=>id&&isPassive(h,id)?null:id);
export function buySkill(p,h,id,lv){
 const n=skillFor(h,id);if(!n)return 'Unknown skill';if(!n.active)return 'Passives come with levels';if(p.skillOwned?.[h]?.[id])return 'Already owned';if(lv<n.level)return 'Requires level '+n.level;if((p.coins||0)<n.price)return 'Need '+(n.price-(p.coins||0))+' more coins';
 p.skillOwned=p.skillOwned||{};p.skillOwned[h]=p.skillOwned[h]||{};p.skillOwned[h][id]=true;p.coins-=n.price;return null;
}
export function equipSkill(p,h,id,index,lv,safe){
 if(!safe)return 'Change skills at a shop, map or safe shrine';if(index<0||index>=slotsAt(lv))return 'Slot is locked';if(id!==null&&isPassive(h,id))return 'Passives are always on';if(id!==null&&!p.skillOwned?.[h]?.[id])return 'Learn it first';
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
