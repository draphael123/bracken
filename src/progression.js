import {LEGACY_NODES, SKILLS} from './progression-catalog.js';
import {levelOfXp, xpFloor, LV_MAX} from './xp.js';
import {retireRelics} from './relics.js';   /* THE RELICS ARE GONE: an old save's found-relic tick is dropped and its vault silver paid */
import {normalizeDeathCost} from './death-cost.js';   /* THE DEATH COST's save shape: an older save has none, and gets an empty one (everything it holds is banked) */
export {LEGACY_NODES, SKILLS};
/* 2 (2026-09-24): PASSIVES COME WITH LEVELS, ABILITIES ARE BOUGHT (docs/briefs/hero-kits.md 1b). A passive is no longer sold
   or slotted: it is on from the hero level the catalog gives it. Version 1 saves are migrated by passivesToLevels below. */
export const PROGRESSION_VERSION = 2;
export const HERO_IDS = ['knight','pyro','paladin','pirate','reaper','warden','geomancer'];   /* THE GEOMANCER (2026-09-24): a third starter */
const object = v => !!v && typeof v === 'object' && !Array.isArray(v);
const clone = v => JSON.parse(JSON.stringify(v));
/* THE THIRD SLOT OPENS AT LEVEL 16, AND THREE IS THE MOST (Daniel 2026-10-04; it was two at every level from 2026-09-23): two from the start,
   a third at 16. A save with a fourth slot filled (the old four-slot days) keeps that ability LEARNED and unslotted (trimSlots, before the save
   is judged). equipped() only reads the slots the level has. */
export const MAX_SLOTS = 3;
export const SLOT_LEVELS = [0, 0, 16];
export const slotsAt = lv => SLOT_LEVELS.filter(n => (lv || 0) >= n).length;
/* THE TOP OF THE LADDER IS DEARER (LEVELING, audit-econ sec.7E: 520 for an L20 capstone was 1.8 woods of gold): the knight's, the Warden's and
   the Geomancer's L12/L14/L17/L20 actives cost 600/700/800/900 (they were 360/400/460/520). The catalog keeps its history; the price is set here. */
export const TOP_PRICE = { 12: 600, 14: 700, 17: 800, 20: 900 };
for (const n of SKILLS) if (n.active && TOP_PRICE[n.level]) n.price = TOP_PRICE[n.level];   /* (batch71: every hero's top actives - HERO KIT's eight L14/L20 skills were priced 400/520 on the old ladder and nothing on tools/talents.mjs's ladder matched) */
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
/* ==== THE LEVEL-UP CHOICE CARD (LEVELING, Daniel 2026-10-03; scratch audit-econ sec.7B) ====
   Growth used to be automatic: +3 health, +5 stamina and +1 damage every second level, to 24 and then a trickle. Now every level is a PICK:
   VIGOR +8 health, ENDURANCE +12 stamina (WEIGHT's stamina economy reads it), MIGHT +1 damage, each capped at CARD_CAP picks - so level 50's
   fifty picks are a forced spread. Under the picks a small base still grows by itself (+2 health, +2 stamina a level, +1 damage every fourth),
   so an even spread at L24 (8/8/8) is +112 health, +144 stamina and +16 damage against the old +88 / +120 / +14: the twenty-odd relic
   buffs that left the game (one carried at a time, lost on death) are paid back here, not added on top. Focus on one stat reaches ~2.5x it.
   MILESTONES at 25, 30, 35, 40, 45 and 50 are a bigger card: one PERK from three, each perk once (PERKS). The save is
   p.card[hero] = {v, e, m, ms:{25:'perk',...}}; a hero with no card (an AI partner, a tool) reads an even spread (evenCard). */
export const CARD = [
 { id: 'v', name: 'VIGOR', what: '+8 HEALTH', hp: 8 },
 { id: 'e', name: 'ENDURANCE', what: '+12 STAMINA', stamina: 12 },
 { id: 'm', name: 'MIGHT', what: '+1 DAMAGE', damage: 1 },
];
export const CARD_CAP = 25;
export const MILESTONES_MINOR = [5, 10, 15, 20];   /* LEVELING2 (Daniel 10-04): the early milestones - one SMALL perk from three, each once */
export const MILESTONES_MAJOR = [25, 30, 35, 40, 45, 50];
export const MILESTONES = [...MILESTONES_MINOR, ...MILESTONES_MAJOR];
export const isMinor = n => MILESTONES_MINOR.includes(n);
/* TECHNIQUE UNLOCKS (s5, a later lane): a NEW MOVE per hero at each of these levels, taught with a short practice. The hook lives here and in main.js
   (techniqueFor / teachTechnique): TECHNIQUES is empty until that lane fills it, {hero: {10: {id, name, what, teach}, 20: {...}, 30: {...}}}. L20/L30 are
   also where SUBCLASSES (parked) would hang: nothing here takes those two levels away from them. */
export const TECH_LEVELS = [10, 20, 30];
export const TECHNIQUES = {};
export const techniqueFor = (h, n) => (TECHNIQUES[h] || {})[n] || null;
export const techniquesArriving = (h, from, to) => TECH_LEVELS.filter(n => n > from && n <= to).map(n => techniqueFor(h, n)).filter(Boolean);
/* THE EARLY PERKS: smaller than the L25+ ones. Each is a hook main.js reads through perkOn() */
export const MINOR_PERKS = [
 { id: 'stride', name: 'LONG STRIDE', what: 'YOUR ROLL CARRIES A BIT FURTHER', minor: true },
 { id: 'mend', name: 'TURNED BLOW', what: 'A BLOW YOU TURN HEALS 3', minor: true },
 { id: 'magnet', name: 'MAGNET', what: 'GOLD IS PULLED FROM FURTHER AWAY', minor: true },
 { id: 'climber', name: 'CLIMBER', what: 'ROPES AND VINES: A QUARTER FASTER', minor: true },
 { id: 'buffer', name: 'LONG BUFFER', what: 'A PRESS IS KEPT A LITTLE LONGER', minor: true },
 { id: 'rest', name: 'STEADY BREATH', what: 'STAMINA WAITS A FIFTH LESS TO RETURN', minor: true },
 { id: 'tonic', name: 'RICH TONIC', what: 'A RED TONIC HEALS 60, NOT 45', minor: true },
 { id: 'grit', name: 'GRIT', what: 'AFTER A HIT YOU ARE SAFE A MOMENT LONGER', minor: true },
];
/* THE HERO'S OWN: at every milestone ONE of the three is the hero's (the third, marked). Two per hero, alternating by milestone, and each pick adds
   a RANK (to HERO_PERK_MAX: ten milestones = five of each): so a hero's own never runs out, and it is never the only way to grow. */
export const HERO_PERK_MAX = 5;
export const HERO_PERKS = {
 knight: [{ id: 'kbash', name: 'STUNNING BASH', what: 'SHIELD BASH STAGGERS 15% LONGER' }, { id: 'kguard', name: 'KEEN GUARD', what: 'THE PERFECT GUARD WINDOW GROWS' }],
 pyro: [{ id: 'pspread', name: 'WILDFIRE', what: 'A BURNING FOE LIGHTS ITS NEIGHBOURS WHEN IT FALLS' }, { id: 'pheat', name: 'HOLD THE HEAT', what: 'HEAT FADES 12% SLOWER' }],
 paladin: [{ id: 'llight', name: 'RADIANT', what: 'THE LIGHT FILLS 8% FASTER' }, { id: 'ljudge', name: 'HEAVY JUDGEMENT', what: 'JUDGEMENT STRIKES 10% HARDER' }],
 pirate: [{ id: 'pricochet', name: 'RICOCHET', what: 'THE BALL GLANCES ON TO A SECOND FOE' }, { id: 'preload', name: 'QUICK LOAD', what: 'THE PISTOL RELOADS 8% SOONER' }],
 reaper: [{ id: 'dward', name: 'THIRSTY WARD', what: 'THE BLOOD WARD FILLS 12% FASTER' }, { id: 'dnova', name: 'DEEP DRAUGHT', what: 'THE NOVA HEALS 10% MORE BLOOD' }],
 warden: [{ id: 'wdef', name: 'LONG DEFLECT', what: 'THE DEFLECT WINDOW LASTS LONGER' }, { id: 'wrec', name: 'SPRING SHAFT', what: 'THE SHAFT RECOVERS 8% SOONER' }],
 geomancer: [{ id: 'gstone', name: 'LASTING STONE', what: 'HER STONE STANDS A FIFTH LONGER' }, { id: 'gward', name: 'WIDE RUNE', what: 'THE RUNE-WARD PERFECT WINDOW GROWS' }],
};
export const ALL_HERO_PERKS = Object.values(HERO_PERKS).flat();
export const heroPerkAt = (h, n) => { const l = HERO_PERKS[h]; return l ? l[Math.max(0, MILESTONES.indexOf(n)) % 2] : null; };
export const perkRank = (p, h, id) => { const c = cardOf(p, h); return c ? Object.values(c.ms || {}).filter(v => v === id).length : 0; };
/* STAT THRESHOLDS (Daniel 10-04): 10 and 20 picks in a stat unlock a small bonus that changes how the build PLAYS. VIGOR: a kill heals 2 /
   a faster, fuller co-op revive. ENDURANCE: rolls cost a fifth less below half stamina / a second wind once a fight. MIGHT: heavy blows push the
   poise bar a quarter harder (never a tap: the heavies-only rule of a boss or mini is untouched) / a staggered foe takes a quarter more from the next blow. */
export const THRESH_AT = [10, 20];
export const THRESH = {
 v: [{ name: 'BLOOD DRAWN', what: 'EVERY KILL HEALS 2' }, { name: 'STEADY HANDS', what: 'CO-OP REVIVES: FASTER, AND UP WITH HALF HEALTH' }],
 e: [{ name: 'LEAN ROLL', what: 'ROLLS COST A FIFTH LESS BELOW HALF STAMINA' }, { name: 'SECOND WIND', what: 'WINDED ONCE A FIGHT? STAMINA SURGES BACK' }],
 m: [{ name: 'HEAVY HAND', what: 'HEAVY BLOWS BREAK POISE A QUARTER FASTER' }, { name: 'FINISHER', what: 'A STAGGERED FOE TAKES A QUARTER MORE FROM THE NEXT BLOW' }],
};
export const thrOn = (p, h, stat, i) => { const c = cardOf(p, h); return !!c && (c[stat] || 0) >= THRESH_AT[i]; };
/* what the card says of a stat's threshold: the next one not yet reached ({i, at, have, name, what}), or null when both are */
export const thrNext = (p, h, stat) => { const c = cardOf(p, h), have = c ? (c[stat] || 0) : 0, i = THRESH_AT.findIndex(a => have < a); return i < 0 ? null : { i, at: THRESH_AT[i], have, ...THRESH[stat][i] }; };
/* THE COUNT FOR THE CARD: the next milestone above this level, and how many levels away it is (null past the last) */
const lvClamp = lv => Math.max(0, Math.min(LV_MAX, Math.floor(lv || 0)));
export const nextMilestone = lv => MILESTONES.find(n => n > lvClamp(lv)) ?? null;
export const levelsToPerk = lv => { const n = nextMilestone(lv); return n === null ? null : n - lvClamp(lv); };
/* THE PERKS: what a milestone card offers, each a hook main.js reads through perkOn(). Several stand where a relic stood (the fleece's stamina,
   the gauntlet's light swing, the banner's thinner blows) - kept, not carried and lost. */
export const PERKS = [
 { id: 'iron', name: 'IRON HIDE', what: 'A TENTH LESS DAMAGE FROM EVERY BLOW' },
 { id: 'lungs', name: 'DEEP LUNGS', what: 'STAMINA COMES BACK A FIFTH FASTER' },
 { id: 'light', name: 'LIGHT HAND', what: 'SWINGS COST A FIFTH LESS STAMINA' },
 { id: 'arcane', name: 'MASTERY', what: 'ABILITIES HIT 15% HARDER' },
 { id: 'heart', name: 'GREAT HEART', what: '+10% MAX HEALTH' },
 { id: 'leech', name: 'BLOODLETTER', what: 'EVERY KILL HEALS 4' },
 { id: 'fleet', name: 'FLEET', what: 'DODGES COST A QUARTER LESS STAMINA' },
 { id: 'focus', name: 'FOCUS', what: 'ABILITY WAITS 15% SHORTER' },
];
export const RESPEC_SILVER = 3;   /* the silver a respec costs (every pick and perk of one hero back on the table); a migrated save's first one is free */
const cardLv = lv => Math.max(0, Math.min(LV_MAX, Math.floor(lv || 0)));
/* an even spread of n picks, VIGOR first: what a hero with no card reads, and what an old save's levels are migrated to */
export const evenCard = lv => { const n = cardLv(lv), b = Math.floor(n / 3), r = n - 3 * b; return { v: b + (r > 0 ? 1 : 0), e: b + (r > 1 ? 1 : 0), m: b, ms: {} }; };
export const cardOf = (p, h) => (p && p.card && object(p.card[h])) ? p.card[h] : null;
export const picksSpent = c => c ? (c.v || 0) + (c.e || 0) + (c.m || 0) : 0;
export const picksOwed = (p, h, lv) => Math.max(0, cardLv(lv) - picksSpent(cardOf(p, h)));
export const milestonesOwed = (p, h, lv) => MILESTONES.filter(n => n <= cardLv(lv) && !((cardOf(p, h) || {}).ms || {})[n]);
export const perkOn = (p, h, id) => { const c = cardOf(p, h); return !!c && Object.values(c.ms || {}).includes(id); };
/* THE THREE A MILESTONE OFFERS: the perks this hero has not taken, turned by hero and level so two heroes see different hands, never more than three */
export function perkOffer(p, h, n) { const c = cardOf(p, h), taken = new Set(Object.values((c && c.ms) || {})), left = (isMinor(n) ? MINOR_PERKS : PERKS).filter(k => !taken.has(k.id));
 const turn = ((HERO_IDS.indexOf(h) + 1) * 3 + Math.floor(n / 5)) % Math.max(1, left.length), rot = left.slice(turn).concat(left.slice(0, turn)), own = heroPerkAt(h, n);
 /* two of the pool, then the hero's own (LEVELING2): a hero with his own at its top rank, or none, gets three of the pool */
 return own && perkRank(p, h, own.id) < HERO_PERK_MAX ? rot.slice(0, 2).concat([{ ...own, own: true, rank: perkRank(p, h, own.id) + 1, minor: isMinor(n) }]) : rot.slice(0, 3); }
const ensureCard = (p, h) => { p.card = object(p.card) ? p.card : {}; if (!object(p.card[h])) p.card[h] = { v: 0, e: 0, m: 0, ms: {} }; const c = p.card[h]; if (!object(c.ms)) c.ms = {}; return c; };
/* ONE PICK. null when it took, else why not (the card says it) */
export function pickCard(p, h, stat, lv) {
 if (!CARD.some(k => k.id === stat)) return 'Unknown pick'; if (!picksOwed(p, h, lv)) return 'No pick owed';
 const c = ensureCard(p, h); if ((c[stat] || 0) >= CARD_CAP) return 'That one is full: ' + CARD_CAP + ' picks';
 c[stat] = (c[stat] || 0) + 1; return null; }
export function pickMilestone(p, h, n, perk, lv) {
 if (!milestonesOwed(p, h, lv).includes(n)) return 'No milestone owed'; if (!perkOffer(p, h, n).some(k => k.id === perk)) return 'Not offered';
 const c = ensureCard(p, h); c.ms[n] = perk; return null; }
/* THE RESPEC: every pick and every perk of this hero back on the table (picksOwed / milestonesOwed are owed again). The silver is the caller's
   (main.js spends RESPEC_SILVER unless p.cardFree[h], a migrated save's free first one). */
export function respecCard(p, h) { const c = ensureCard(p, h); c.v = c.e = c.m = 0; c.ms = {}; if (object(p.cardFree)) delete p.cardFree[h]; return null; }
/* THE GROWTH a hero's level and card give. card omitted (undefined) = an even spread; null = no picks yet. */
export function growthAt(h,lv,card){
 lv=Math.max(0,lv);const ranks=Math.min(lv,24)/12,c=card===undefined?evenCard(lv):(card||{v:0,e:0,m:0,ms:{}}),ms=Object.values(c.ms||{});
 const v=Math.min(CARD_CAP,c.v||0),e=Math.min(CARD_CAP,c.e||0),m=Math.min(CARD_CAP,c.m||0);
 const hp0=({knight:100,pyro:88,paladin:120,pirate:90,reaper:95,warden:100,geomancer:95}[h]||100)+2*lv+8*v;
 return {hp:Math.round(hp0*(ms.includes('heart')?1.1:1)),stamina:100+2*lv+12*e,damage:Math.floor(lv/4)+Math.floor(ranks*(h==='reaper'?1.5:1))+m,ranks,techniqueRank:Math.floor(ranks),skillMultiplier:skillScale(lv)*(ms.includes('arcane')?1.15:1),picks:{v,e,m}};
}
/* THE CARD'S MIGRATION (cardV 1): a save from before the card has levels and no picks. Every hero with XP gets his levels as an even spread
   (so nothing he had shrinks) and one FREE respec to make them his own; milestones (L25+) are left owed, to be chosen. Idempotent. */
export function migrateCard(p) {
 if (p.cardV === 1) return false; p.card = object(p.card) ? p.card : {}; p.cardFree = object(p.cardFree) ? p.cardFree : {};
 for (const h of HERO_IDS) { const lv = levelOfXp((p.xp || {})[h] || 0); if (lv > 0 && !object(p.card[h])) { p.card[h] = evenCard(lv); p.cardFree[h] = 1; } }
 p.cardV = 1; return true; }
/* ==== HEROES ARE BOUGHT WITH SILVER (LEVELING, Daniel 2026-10-03) ====
   A NEW GAME chooses ONE of the DEFAULT_HEROES; the others are unlocked but bought for silver (10 each, like every hero). Buying the first
   extra hero opens CO-OP (the AI partners and the co-op hub with it): coopOpen() is "owns two heroes", or a save from before this. OLD SAVES
   (heroFlow 1 migration): a save with any progress keeps every starter it has played as owned and keeps co-op (coopLegacy: its sofa
   friend may still take any starter, as before). */
export const DEFAULT_HEROES = ['knight', 'warden', 'geomancer'];   /* + the Berserker when he lands */
export const coopOpen = p => !!p && (!!p.coopLegacy || Object.keys(p.heroes || {}).filter(h => p.heroes[h]).length >= 2);
export function migrateHeroes(p) {
 if (p.heroFlow === 1) return false;
 const played = h => ((p.xp || {})[h] || 0) > 0 || Object.keys((p.done || {})[h] || {}).length > 0;
 const legacy = !!p.heroPicked || HERO_IDS.some(played) || Object.keys(p).some(k => object(p[k]) && p[k].cleared);
 if (legacy) { p.heroes = object(p.heroes) ? p.heroes : { knight: true }; for (const h of DEFAULT_HEROES) if (played(h) || p.hero === h) p.heroes[h] = true; p.coopLegacy = true; }
 p.heroFlow = 1; return true; }
export function checksum(raw){let h=14695981039346656037n;for(let i=0;i<raw.length;i++){h^=BigInt(raw.charCodeAt(i));h=BigInt.asUintN(64,h*1099511628211n);}return h.toString(16).padStart(16,'0');}
export function validateProgress(p){
 if(!object(p))throw Error('Save must contain an object.');
 renameSkills(p);
 const inspect=v=>{if(!v||typeof v!=='object')return;for(const key of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(key))throw Error('Unsafe save key. Original retained.');inspect(v[key]);}};inspect(p);
 if(p.hero!==undefined&&!HERO_IDS.includes(p.hero))throw Error('Unknown hero. Original save retained.');
 for(const value of Object.values(p.done||{}))if(!object(value))throw Error('Invalid completion history. Original retained.');
 if(p.progressionVersion && p.progressionVersion>PROGRESSION_VERSION)throw Error('This save needs a newer version of BRACKEN.');
 for(const k of ['coins','silverSpent'])if(p[k]!==undefined&&(!Number.isFinite(p[k])||p[k]<0))throw Error('Invalid '+k+'. Original save retained.');
 for(const k of ['xp','done','talents','skillOwned','loadouts','heroes','items','card','cardFree','skillRank'])if(p[k]!==undefined&&!object(p[k]))throw Error('Invalid '+k+'. Original save retained.');
 for(const [h,c] of Object.entries(p.card||{})){if(!object(c))throw Error('Invalid card: '+h);for(const k of ['v','e','m'])if(c[k]!==undefined&&(!Number.isInteger(c[k])||c[k]<0||c[k]>CARD_CAP))throw Error('Invalid card pick: '+h);if(c.ms!==undefined&&!object(c.ms))throw Error('Invalid card milestones: '+h);}
 for(const v of Object.values(p.xp||{}))if(!Number.isFinite(v)||v<0)throw Error('Invalid XP. Original save retained.');
 for(const [h,v] of Object.entries(p.skillOwned||{})){if(!object(v))throw Error('Invalid skill ownership: '+h);for(const [id,on] of Object.entries(v))if(on!==true||!skillFor(h,id))throw Error('Invalid owned skill: '+id);}
 for(const [h,v] of Object.entries(p.loadouts||{}))if(!Array.isArray(v)||v.length>MAX_SLOTS||v.some(id=>id!==null&&(!skillFor(h,id)||!p.skillOwned?.[h]?.[id]))||new Set(v.filter(Boolean)).size!==v.filter(Boolean).length)throw Error('Invalid loadout: '+h);
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
/* MORE THAN MAX_SLOTS IN A LOADOUT (a save from the four-slot days): the extra slots are dropped - the abilities in them stay owned (skillOwned), only unslotted */
export function trimSlots(p){if(!object(p)||!object(p.loadouts))return false;let cut=false;for(const h of Object.keys(p.loadouts)){const v=p.loadouts[h];if(Array.isArray(v)&&v.length>MAX_SLOTS){p.loadouts[h]=v.slice(0,MAX_SLOTS);cut=true;}}return cut;}
export function migrateProgress(raw, campaignIds=[]){
 const source=raw===null?'{}':raw;let parsed;try{parsed=JSON.parse(source);}catch{throw Error('Unreadable save. Original save retained.');}
 trimSlots(parsed);validateProgress(parsed);const p=clone(parsed);
 if(p.progressionVersion===PROGRESSION_VERSION){normalizeDeathCost(p);retireRelics(p);migrateHeroes(p);migrateCard(p);return {progress:p,receipt:p.progressionReceipt,passiveReceipt:p.passiveReceipt,changed:false};}
 if(!(p.progressionVersion>=1))talentsToSkills(p,parsed,source,campaignIds);
 passivesToLevels(p,source);normalizeDeathCost(p);retireRelics(p);migrateHeroes(p);migrateCard(p);
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
/* SKILL RANKS (LEVELING, audit-econ sec.7E: a gold sink past wood 8). An owned ability may be raised to RANK 2 and RANK 3: each rank hits a quarter
   harder (RANK_MUL on its damage, main.js amul), costs 1.5x / 2.5x its price (to the nearest ten), and waits for the hero's level to pass the
   skill's own by 5 / 10. p.skillRank[hero][id] = 2 or 3; a skill with none is rank 1. */
export const RANK_MAX = 3, RANK_MUL = 0.25;
const RANK_COST = [0, 0, 1.5, 2.5], RANK_GAP = [0, 0, 5, 10];
export const skillRank = (p,h,id) => p?.skillOwned?.[h]?.[id] ? Math.min(RANK_MAX, Math.max(1, p?.skillRank?.[h]?.[id] || 1)) : 0;
export const rankPrice = (n,r) => Math.round(n.price * (RANK_COST[r] || 0) / 10) * 10;
export const rankLevel = (n,r) => n.level + (RANK_GAP[r] || 0);
export function rankUp(p,h,id,lv){
 const n=skillFor(h,id);if(!n||!n.active)return 'Only abilities have ranks';if(!p.skillOwned?.[h]?.[id])return 'Learn it first';const r=skillRank(p,h,id);if(r>=RANK_MAX)return 'Top rank';
 const next=r+1,need=rankLevel(n,next),price=rankPrice(n,next);if(lv<need)return 'Rank '+next+' at level '+need;if((p.coins||0)<price)return 'Need '+(price-(p.coins||0))+' more coins';
 p.skillRank=object(p.skillRank)?p.skillRank:{};p.skillRank[h]=object(p.skillRank[h])?p.skillRank[h]:{};p.skillRank[h][id]=next;p.coins-=price;return null;
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
