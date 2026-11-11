// src/traits.js - CORE PASSIVES AND EQUIPPABLE TRAITS (claude/traitframe; docs: scratch/lane-reports/passiveplan.md sec 2-4, Daniel accepted every rec 11-09).
//
// Today every passive (catalog `active:false`) is ON from its level. The split: a hero's CORE passives stay always-on (his kit's identity); his TRAITS are LEARNED
// by level but WORN in slots (1 from the start, a 2nd at L20) and RANK with his level (I 70% / II 85% / III 100% = today's value); SHARED traits belong to the
// account (unlocked by a first clear) and slot into any hero.
//
// THE WHOLE THING SHIPS DARK: TRAITS_SHIP is false, and while it is false NOTHING in the game reads this file (passiveOn, tal(), the menu and the level-up
// line all fall back to today's all-passives-on). The flag is the one switch the joint tune (TRAITTUNE lane) flips. tools/traits.mjs may turn it on in-process
// (setTraitsShip) and a lab URL may say ?traits=on (main.js).
//
// PURE: no DOM, no main.js. The catalog (progression-catalog.js) is the only import, so progression.js can import this file with no cycle.
//
// HOW THE DATA LANES FILL IT (TRAITDATA-A / -B / SHARED): TRAIT_SPLIT[hero] below. A hero with NO entry (or an entry with empty core+traits) is not split:
// every passive of his stays always on, exactly as today. An entry needs:
//   core:    [catalog ids]   always on at their catalog level (as today)
//   traits:  [catalog ids]   learned at learnAt[id] ?? the catalog level, ON only while worn in a slot the hero's level has
//   merged:  { hostTraitId: [catalog ids] }  the second passive IS that trait's rank-III / fork side: it is on exactly when the host is on
//   folded:  { id: 'forkKey:side' }  stays a SLOTTABLE trait until its fork side ships (FOLD RULE); then add the id to `retired`
//   retired: [ids]           kept in the catalog, never slots, never on (validate still accepts them in an old save)
//   defaults:[a, b]          slot-1 default / 2nd default (a save with no p.traits[hero], bots, AI partners, the lab)
//   learnAt: { id: level }   re-levels a trait's arrival (<= L18 so every trait reaches rank III at L20); core keeps its catalog level
// An id a split hero's catalog has but this table lists NOWHERE is OFF while the flag is on (the cuts), so list every passive.
import { SKILLS } from './progression-catalog.js';
import { TRAIT_SPLIT_B } from './traits-b.js';   /* TRAITDATA-B rows (pyro, pirate, reaper, berserker) */

export const TRAITS_SHIP = true;
let ship = TRAITS_SHIP;
export const traitsShip = () => ship;
export const setTraitsShip = v => { ship = !!v; return ship; };   /* tools and the lab only: the shipped value is TRAITS_SHIP */

export const RANK = [0.70, 0.85, 1.0];   /* rank I (to L9), II (L10-19), III (L20+ = today's value) */
export const RANK_AT = [0, 10, 20];
export const traitRank = lv => Math.max(0, RANK_AT.filter(n => (lv || 0) >= n).length - 1);   /* 0..2 (index into RANK) */
export const traitMul = lv => RANK[traitRank(lv)];
export const TRAIT_SLOT_LEVELS = [0, 20];
export const MAX_TRAIT_SLOTS = TRAIT_SLOT_LEVELS.length;
export const SECOND_TRAIT_SLOT_LEVEL = TRAIT_SLOT_LEVELS[1];
export const traitSlotsAt = lv => TRAIT_SLOT_LEVELS.filter(n => (lv || 0) >= n).length;

/* region ids VERIFIED against src/level.js LEVELS (SHARED lane 11-09): stockade kings moor spire fields mage ('mage' = THE MAGE'S FOLLY; 'folly' was a guess). tools/traits.mjs re-checks them against level.js.
   THE SHARED SIX (hero-agnostic code is SHARED lane's job; here only the rows, the unlock and the slot rule). legacy: the catalog id a hero already has for it.
   needs: the campaign level id whose first clear (by ANY hero: the account) unlocks it. */
export const SHARED_TRAITS = [
  { id: 'airRoll', name: 'AIR ROLL', what: 'roll in the air', needs: 'stockade', needsName: 'THE STOCKADE', legacy: { knight: 'airRoll', pirate: 'swash' } },
  { id: 'lightStep', name: 'LIGHT STEP', what: 'a lighter foot', needs: 'kings', needsName: 'KINGSWOOD', legacy: { knight: 'lightStep' } },
  { id: 'momentum', name: 'MOMENTUM', what: 'speed carries', needs: 'moor', needsName: 'GALE MOOR', legacy: { knight: 'momentum' } },
  { id: 'hangCut', name: 'HANGING CUT', what: 'a cut from a ledge', needs: 'spire', needsName: 'THE MONASTERY', legacy: { knight: 'hangCut' } },
  { id: 'airDash', name: 'SLIPSTREAM', what: 'a dash in the air', needs: 'fields', needsName: 'THE HEXED FIELDS', legacy: { knight: 'airDash' } },
  { id: 'execute', name: 'EXECUTIONER', what: 'a foe under a quarter health dies to a heavy blow (never a boss)', needs: 'mage', needsName: "THE MAGE'S FOLLY", legacy: { knight: 'execute', reaper: 'winnow' } },
];
const SHARED_BY_ID = Object.fromEntries(SHARED_TRAITS.map(s => [s.id, s]));
export const isShared = id => !!SHARED_BY_ID[id];
export const sharedOf = id => SHARED_BY_ID[id] || null;
export const sharedUnlocked = (p, id) => { const s = SHARED_BY_ID[id]; if (!s) return false; for (const d of Object.values((p && p.done) || {})) if (d && typeof d === 'object' && d[s.needs]) return true; return false; };

/* THE SPLIT. Knight is SEEDED (plan sec 2) to prove the path; TRAITDATA-A/B fill the rest. */
export const TRAIT_SPLIT = {
  knight: {
    core: ['thirdCut', 'parry', 'sunder', 'holdLine', 'bulwark', 'riposte'],   /* RIPOSTE is CORE (RECS158-d, Daniel 11-10): always on at its level, no slot; the Crusader duel fell 92 -> 50% (built bot) without it */
    traits: ['plated', 'vengeance', 'evasion', 'bleed', 'bash', 'bounding', 'flurry', 'unbroken', 'counterstroke', 'endlessSky'],
    merged: {},
    folded: {},   /* (riposte moved to core, RECS158-d; the L27 block fork's A side no longer folds it) */
    retired: [],
    shared: ['airRoll', 'airDash', 'lightStep', 'momentum', 'hangCut', 'execute'],   /* the knight's ids that left his list for the shared six */
    defaults: ['vengeance', 'bash'],
    /* today's order, spread to L18; the DEFAULT trait is learned FIRST (the plan's slot-1 default must exist at L1-2). TRAITDATA-A may re-level. */
    learnAt: { vengeance: 2, bounding: 4, plated: 5, evasion: 7, bleed: 8, bash: 10, flurry: 12, unbroken: 14, counterstroke: 16, endlessSky: 18 },
  },
  /* TRAITDATA-A (claude/traitdata-a): WARDEN, RANGER, GEOMANCER (knight above). Ids are catalog ids; every catalog passive of the hero is listed once (a CUT sits in retired: kept, never on). */
  warden: {   /* reach is the verb */
    core: ['keenPoint', 'wideGuard', 'standFast', 'ringing', 'sendBack'],
    traits: ['vaulter', 'throughAndThrough', 'giveGround', 'exact', 'widerRow', 'everReady', 'pinTwist', 'freeHand', 'skirmisher', 'spitted'],
    merged: { vaulter: ['longVault'], throughAndThrough: ['driveHome'], freeHand: ['airPoint'] },   /* the second passive IS the host's rank-III side */
    folded: { openPoint: 'L24:POINTED', counterpoise: 'L27:HAFT CATCH', spearhead: 'L24:RUN THROUGH B', holdTheLine: 'L29:PHALANX' },   /* slottable traits until the WARDEN fork lane ships the side (FOLD RULE); the fork keys are provisional */
    retired: ['deepSet'],   /* CUT (= the tip rule) */
    shared: [],
    defaults: ['vaulter', 'everReady'],
    /* today's order spread to L18 (vaulter 3 -> 2 ... skirmisher 24 -> 18); folded ids arrive by L18 too */
    learnAt: { vaulter: 2, throughAndThrough: 4, giveGround: 5, exact: 7, widerRow: 8, everReady: 10, pinTwist: 12, freeHand: 14, spitted: 16, skirmisher: 18, openPoint: 6, counterpoise: 13, spearhead: 17, holdTheLine: 18 },
  },
  ranger: {   /* distance and breath */
    core: ['rgDeep', 'rgFletch', 'rgSteady', 'rgFar', 'rgBashLong'],
    traits: ['rgKeen', 'rgLongMark', 'rgBashBack', 'rgToothed', 'rgSoftStep', 'rgBodkin', 'rgCover', 'rgKill', 'rgEagle', 'rgLast'],
    merged: { rgLongMark: ['rgTrail'] },
    folded: { rgSnares: 'L29:SNARE B', rgHighFlip: 'L21:HIGH FLIP B', rgAirDraw: 'L21:HIGH FLIP B', rgTwin: 'L32:SPLIT SHOT A' },
    retired: ['rgApex'],   /* CUT (mark stacking) */
    shared: [],
    defaults: ['rgKill', 'rgCover'],
    /* the two DEFAULTS arrive early (rgKill 2, rgCover 10); the rest follow today's order */
    learnAt: { rgKill: 2, rgLongMark: 4, rgKeen: 5, rgBashBack: 7, rgSoftStep: 8, rgCover: 10, rgToothed: 12, rgBodkin: 14, rgEagle: 16, rgLast: 18, rgSnares: 6, rgHighFlip: 9, rgAirDraw: 14, rgTwin: 17 },
  },
  geomancer: {   /* the map is her resource: 4 core, 5 old traits + 4 NEW ones (NEW_TRAITS below; they are not in the catalog, so the flag-off game never sees them) */
    core: ['geoLasting', 'geoReturn', 'geoHardLand', 'geoTall'],
    traits: ['geoRumble', 'geoAftershock', 'geoShrapnel', 'geoBulwark', 'geoFourth', 'geoGravel', 'geoLode', 'geoScree', 'geoMoss'],
    merged: { geoRumble: ['geoWideQuake'] },
    folded: {},
    retired: [],
    shared: [],
    defaults: ['geoAftershock', 'geoShrapnel'],
    words: { geoBulwark: { name: 'DEEP ROOTS' } },   /* the knight owns BULWARK */
    learnAt: { geoAftershock: 2, geoRumble: 4, geoShrapnel: 5, geoGravel: 7, geoMoss: 8, geoLode: 10, geoScree: 12, geoBulwark: 14, geoFourth: 16 },
  },
  pyro: null, paladin: null, pirate: null, reaper: null, berserker: null,   /* TRAITDATA-B (pyro, pirate, reaper, berserker); paladin rides his rework lane */
};

/* NEW TRAITS (TRAITDATA-A): passives that never existed in the catalog. They live HERE, not in SKILLS, so with TRAITS_SHIP off nothing in the game can see them (no level-up line, no tree row, never on).
   passiveOn / tal() ask isNewTrait() when the flag is on. level = arrival (learnAt overrides). */
export const NEW_TRAITS = [
  { id: 'geoGravel', hero: 'geomancer', name: 'GRAVEL', desc: 'foes beside a standing stone of hers move a quarter slower. commons and elites only', active: false, level: 7 },
  { id: 'geoLode', hero: 'geomancer', name: 'LODESTONE', desc: 'the recall drags the small foes it passes a tile along its path', active: false, level: 10 },
  { id: 'geoScree', hero: 'geomancer', name: 'SCREE', desc: 'the stone fist plants its knee stone with a small ripple along the ground', active: false, level: 12 },
  { id: 'geoMoss', hero: 'geomancer', name: 'MOSSBACK', desc: 'standing against a stone of hers mends her a little: the stone gives up three in a hundred of her health, then is bare', active: false, level: 8 },
];
export const isNewTrait = (h, id) => NEW_TRAITS.some(n => n.hero === h && n.id === id);

Object.assign(TRAIT_SPLIT, TRAIT_SPLIT_B);   /* claude/traitdata-b: its four heroes' rows live in traits-b.js */

const NODE = {};   /* hero -> id -> catalog node (own lookup: no import of progression.js) */
for (const n of SKILLS) (NODE[n.hero] = NODE[n.hero] || {})[n.id] = n;
for (const n of NEW_TRAITS) (NODE[n.hero] = NODE[n.hero] || {})[n.id] = n;
const splitOf = h => { const s = TRAIT_SPLIT[h]; return s && ((s.core && s.core.length) || (s.traits && s.traits.length)) ? s : null; };
export const hasSplit = h => !!splitOf(h);
/* a card name that differs from the catalog (split.names, shown only while the flag is on) and a row tag ('JET' / 'BLOODWORMS': split.tags) */
export const nameOf = (h, id) => { const s = splitOf(h), n = NODE[h] && NODE[h][id]; return (ship && s && s.names && s.names[id]) || (ship && s && s.words && s.words[id] && s.words[id].name) || (n ? n.name : id); };
export const tagOf = (h, id) => { const s = splitOf(h); return (s && s.tags && s.tags[id]) || ''; };

/* what an id is for this hero: 'core' | 'trait' | 'merged' | 'folded' | 'shared' | 'retired' | 'cut' | null (not a passive of his) */
export function kindOf(h, id) {
  const s = splitOf(h), n = NODE[h] && NODE[h][id]; if (!s || !n || n.active) return null;
  if ((s.retired || []).includes(id)) return 'retired';
  if ((s.core || []).includes(id)) return 'core';
  if ((s.traits || []).includes(id)) return 'trait';
  if (s.folded && s.folded[id]) return 'folded';
  if (s.merged) for (const host of Object.keys(s.merged)) if (s.merged[host].includes(id)) return 'merged';
  if ((s.shared || []).includes(id)) return 'shared';
  return 'cut';
}
/* a card name the split changes (geoBulwark -> DEEP ROOTS); only the menu and the level-up line read it, and only while the flag is on */
export const traitWord = (h, id) => { const s = splitOf(h), n = NODE[h] && NODE[h][id]; return (s && s.words && s.words[id]) ? Object.assign({}, n, s.words[id]) : n; };
export const mergedHost = (h, id) => { const s = splitOf(h); if (s && s.merged) for (const host of Object.keys(s.merged)) if (s.merged[host].includes(id)) return host; return null; };
/* ids a hero may WEAR in a slot: his traits and folded ones, and the shared six */
export const slottable = h => { const s = splitOf(h); return s ? [...(s.traits || []), ...Object.keys(s.folded || {}).filter(id => !(s.retired || []).includes(id)), ...SHARED_TRAITS.map(x => x.id)] : []; };
export const isSlottable = (h, id) => slottable(h).includes(id);
export const learnLevel = (h, id) => { const s = splitOf(h), n = NODE[h] && NODE[h][id]; return s && s.learnAt && s.learnAt[id] != null ? s.learnAt[id] : (n ? n.level : 99); };
export const coreIds = h => (splitOf(h) || { core: [] }).core.slice();
export const traitIds = h => { const s = splitOf(h); return s ? [...s.traits, ...Object.keys(s.folded || {}).filter(id => !(s.retired || []).includes(id))] : []; };
export const defaultsAt = (h, lv) => { const s = splitOf(h); if (!s) return []; return (s.defaults || []).slice(0, traitSlotsAt(lv)); };
/* learned: a hero's own trait by its level (or owned by an older save); a shared trait by the account's first clear */
export const learned = (p, h, id, lv) => {
  if (isShared(id)) return sharedUnlocked(p, id);
  const n = NODE[h] && NODE[h][id]; if (!n) return false;
  return (lv || 0) >= learnLevel(h, id) || !!(p && p.skillOwned && p.skillOwned[h] && p.skillOwned[h][id]);
};
/* what is WORN at this level: p.traits[hero] cut to the slots the level has; a hero whose save has none wears his defaults (bots, partners, a save before the flip) */
let pvpEven = false;   /* a PvP duel at EVEN L1 (pvp-duel.js): core only, no traits worn by anyone */
export const setPvpEvenTraits = v => { pvpEven = !!v; };
let labSpec = null;   /* the boss lab's ?traits=core|def|<id>,<id> (main.js): overrides what every hero wears, for tune lanes */
export const setLabTraits = spec => { labSpec = spec; };
export const wornOf = (p, h, lv) => {
  if (pvpEven) return [];
  if (labSpec) return (labSpec === 'core' ? [] : labSpec === 'def' ? defaultsAt(h, lv) : labSpec.filter(id => isSlottable(h, id))).slice(0, traitSlotsAt(lv));
  const slots = traitSlotsAt(lv), t = p && p.traits && Array.isArray(p.traits[h]) ? p.traits[h] : null;
  return (t || defaultsAt(h, lv)).slice(0, slots).filter(id => typeof id === 'string');
};
/* THE GATE (passiveOn calls it when the flag is on and the hero is split). A trait is on only if worn in a slot the level has AND learned. */
export function traitGate(p, h, id, lv) {
  const k = kindOf(h, id); if (k === null) return false;
  const n = NODE[h][id];
  if (k === 'core') return (lv || 0) >= n.level || !!(p && p.skillOwned && p.skillOwned[h] && p.skillOwned[h][id]);
  if (k === 'retired' || k === 'cut') return false;
  const worn = wornOf(p, h, lv);
  if (k === 'merged') { const host = mergedHost(h, id); return worn.includes(host) && learned(p, h, host, lv); }
  if (k === 'shared') { const sid = id; return worn.includes(sid) && learned(p, h, sid, lv); }
  return worn.includes(id) && learned(p, h, id, lv);   /* trait / folded */
}
/* a worn shared trait for ANY hero (tal() asks this for a shared id, whatever the hero's own catalog has) */
export const sharedOn = (p, h, id, lv) => isShared(id) && wornOf(p, h, lv).includes(id) && sharedUnlocked(p, id);
/* the number a trait scales by: RANK I/II/III while the flag is on and the id is a trait (or its merge); 1 for core and for everything while the flag is off */
export const traitScale = (p, h, id, lv) => { if (!ship) return 1; const k = kindOf(h, id); return k === 'trait' || k === 'folded' || k === 'merged' || k === 'shared' || (!k && isShared(id)) ? traitMul(lv) : 1; };

/* how far a worn trait is BELOW rank III: 1 at rank I, 0.5 at II, 0 at III (and 0 while the flag is off). For a trait whose price shrinks with rank (PLATED's back-cover wind, FLURRY's cost). */
export const rankLack = s => Math.max(0, (1 - s) / 0.3);
/* THE SAVE: p.traits = { hero: [id|null, id|null] }, no version bump. A bad entry is DROPPED, never an error. Returns true if it changed anything. */
export function validateTraits(p) {
  if (!p || typeof p !== 'object' || p.traits === undefined) return false;
  if (!p.traits || typeof p.traits !== 'object' || Array.isArray(p.traits)) { delete p.traits; return true; }
  let cut = false;
  for (const h of Object.keys(p.traits)) {
    const v = p.traits[h];
    if (!NODE[h] || !Array.isArray(v)) { delete p.traits[h]; cut = true; continue; }
    const ok = new Set(slottable(h)), seen = new Set(), out = [];
    for (const id of v.slice(0, MAX_TRAIT_SLOTS)) { if (id === null) { out.push(null); continue; } if (typeof id === 'string' && ok.has(id) && !seen.has(id)) { seen.add(id); out.push(id); } else { out.push(null); cut = true; } }
    while (out.length && out[out.length - 1] === null) out.pop();
    if (v.length > MAX_TRAIT_SLOTS || out.length !== v.length) cut = true;
    p.traits[h] = out;
  }
  return cut;
}
/* MIGRATION: every split hero with xp and no p.traits[h] gets his defaults (slot 2's too from L20). Idempotent. Not run while the flag is off (a save stays byte-identical);
   wornOf's own default fallback covers a hero migrated later. levelOf: xp -> level (progression.js passes levelOfXp). */
export function migrateTraits(p, levelOf, force) {
  if (!ship && !force) return false;
  if (!p || typeof p !== 'object') return false;
  let changed = false;
  for (const h of Object.keys(TRAIT_SPLIT)) {
    if (!hasSplit(h)) continue;
    const xp = p.xp && Number.isFinite(p.xp[h]) ? p.xp[h] : 0; if (!(xp > 0)) continue;
    if (!p.traits || typeof p.traits !== 'object' || Array.isArray(p.traits)) p.traits = {};
    if (Array.isArray(p.traits[h])) continue;
    p.traits[h] = defaultsAt(h, levelOf(xp)).slice(); changed = true;
  }
  return changed;
}
/* WEAR / UNWEAR: wearTrait(p, h, id|null, index, lv) -> an error line or null. A trait worn in the other slot swaps places; a learned one only. */
export function wearTrait(p, h, id, index, lv) {
  const slots = traitSlotsAt(lv);
  if (index < 0 || index >= slots) return index === 1 ? 'A second trait slot opens at level ' + SECOND_TRAIT_SLOT_LEVEL : 'Slot is locked';
  if (!p || typeof p !== 'object') return 'No save';
  const base = (p.traits && Array.isArray(p.traits[h])) ? p.traits[h].slice(0, MAX_TRAIT_SLOTS) : defaultsAt(h, 99).slice();
  while (base.length < MAX_TRAIT_SLOTS) base.push(null);
  if (id !== null) {
    if (!isSlottable(h, id)) return 'Not a trait you can wear';
    if (!learned(p, h, id, lv)) return isShared(id) ? 'Clear ' + sharedOf(id).needsName + ' first' : 'Learned at level ' + learnLevel(h, id);
    const at = base.indexOf(id); if (at >= 0 && at !== index) base[at] = base[index];   /* a swap */
  }
  base[index] = id;
  while (base.length && base[base.length - 1] === null) base.pop();
  if (!p.traits || typeof p.traits !== 'object' || Array.isArray(p.traits)) p.traits = {};
  p.traits[h] = base; return null;
}

/* THE MENU ROWS (main.js skills TRAITS tab): core, then traits, then shared. tkind drives the label; level is the arrival level shown as 'LV n'. */
export function traitRows(h) {
  const s = splitOf(h); if (!s) return [];
  const row = (id, tkind) => { const n = NODE[h] && NODE[h][id]; return n ? Object.assign({}, traitWord(h, id), { name: nameOf(h, id), tag: tagOf(h, id), tkind, level: tkind === 'core' ? n.level : learnLevel(h, id), baseLevel: n.level }) : null; };
  const out = [];
  for (const id of s.core) out.push(row(id, 'core'));
  for (const id of traitIds(h)) out.push(row(id, 'trait'));
  for (const sh of SHARED_TRAITS) out.push({ id: sh.id, name: sh.name, desc: sh.what + '. unlocked by clearing ' + sh.needsName, active: false, hero: h, tkind: 'shared', level: 99, needs: sh.needs, needsName: sh.needsName });
  return out.filter(Boolean);
}
export const ROMAN = ['I', 'II', 'III'];
/* the right-hand label of a menu row */
export function rowLabel(p, h, r, lv) {
  if (r.tkind === 'core') return lv >= r.level || (p && p.skillOwned && p.skillOwned[h] && p.skillOwned[h][r.id]) ? 'CORE' : 'LV ' + r.level;
  const worn = wornOf(p, h, lv).indexOf(r.id);
  if (!learned(p, h, r.id, lv)) return r.tkind === 'shared' ? 'CLEAR ' + r.needsName.replace(/^THE /, '') : 'LV ' + r.level;
  return (worn >= 0 ? 'S' + (worn + 1) + ' ' : '') + ROMAN[traitRank(lv)];
}

/* THE LEVEL-UP LINE's trait words: what a level-up from `from` to `to` brings. Returns '' while the flag is off or the hero is not split. */
export function traitUpText(h, from, to) {
  if (!ship || !hasSplit(h)) return '';
  const s = splitOf(h), bits = [];
  const got = [...(s.traits || []), ...Object.keys(s.folded || {})].filter(id => learnLevel(h, id) > from && learnLevel(h, id) <= to && NODE[h][id]).sort((a, b) => learnLevel(h, a) - learnLevel(h, b));
  const core = (s.core || []).filter(id => NODE[h][id] && NODE[h][id].level > from && NODE[h][id].level <= to);
  if (core.length) bits.push(core.length > 1 ? 'CORE: ' + nameOf(h, core[0]) + ' +' + (core.length - 1) + ' MORE.' : 'CORE: ' + nameOf(h, core[0]) + '.');
  if (got.length) bits.push(got.length > 1 ? 'TRAIT LEARNED: ' + nameOf(h, got[0]) + ' +' + (got.length - 1) + ' MORE.' : 'TRAIT LEARNED: ' + nameOf(h, got[0]) + '.');
  const grow = RANK_AT.slice(1).filter(n => from < n && to >= n);
  if (grow.length) bits.push('YOUR TRAITS GROW (RANK ' + ROMAN[RANK_AT.indexOf(grow[grow.length - 1])] + ').');
  if (from < SECOND_TRAIT_SLOT_LEVEL && to >= SECOND_TRAIT_SLOT_LEVEL) bits.push('A SECOND TRAIT SLOT.');
  return bits.length ? ' ' + bits.join(' ') : '';
}
