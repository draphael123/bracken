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

export const TRAITS_SHIP = false;
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

/* THE SHARED SIX (hero-agnostic code is SHARED lane's job; here only the rows, the unlock and the slot rule). legacy: the catalog id a hero already has for it.
   needs: the campaign level id whose first clear (by ANY hero: the account) unlocks it. */
export const SHARED_TRAITS = [
  { id: 'airRoll', name: 'AIR ROLL', what: 'roll in the air', needs: 'stockade', needsName: 'THE STOCKADE', legacy: { knight: 'airRoll' } },
  { id: 'lightStep', name: 'LIGHT STEP', what: 'a lighter foot', needs: 'kings', needsName: 'KINGSWOOD', legacy: { knight: 'lightStep' } },
  { id: 'momentum', name: 'MOMENTUM', what: 'speed carries', needs: 'moor', needsName: 'GALE MOOR', legacy: { knight: 'momentum' } },
  { id: 'hangCut', name: 'HANGING CUT', what: 'a cut from a ledge', needs: 'spire', needsName: 'THE MONASTERY', legacy: { knight: 'hangCut' } },
  { id: 'airDash', name: 'SLIPSTREAM', what: 'a dash in the air', needs: 'fields', needsName: 'THE HEXED FIELDS', legacy: { knight: 'airDash' } },
  { id: 'execute', name: 'EXECUTIONER', what: 'a foe under a quarter health dies to a heavy blow (never a boss)', needs: 'folly', needsName: "THE MAGE'S FOLLY", legacy: { knight: 'execute', reaper: 'winnow' } },
];
const SHARED_BY_ID = Object.fromEntries(SHARED_TRAITS.map(s => [s.id, s]));
export const isShared = id => !!SHARED_BY_ID[id];
export const sharedOf = id => SHARED_BY_ID[id] || null;
export const sharedUnlocked = (p, id) => { const s = SHARED_BY_ID[id]; if (!s) return false; for (const d of Object.values((p && p.done) || {})) if (d && typeof d === 'object' && d[s.needs]) return true; return false; };

/* THE SPLIT. Knight is SEEDED (plan sec 2) to prove the path; TRAITDATA-A/B fill the rest. */
export const TRAIT_SPLIT = {
  knight: {
    core: ['thirdCut', 'parry', 'sunder', 'holdLine', 'bulwark'],
    traits: ['plated', 'vengeance', 'evasion', 'bleed', 'bash', 'bounding', 'flurry', 'unbroken', 'counterstroke', 'endlessSky'],
    merged: {},
    folded: { riposte: 'block:A' },   /* RIPOSTE -> the L27 block fork's A side (FORKS lane); until then it is a slottable trait */
    retired: [],
    shared: ['airRoll', 'airDash', 'lightStep', 'momentum', 'hangCut', 'execute'],   /* the knight's ids that left his list for the shared six */
    defaults: ['vengeance', 'bash'],
    /* today's order, spread to L18; the DEFAULT trait is learned FIRST (the plan's slot-1 default must exist at L1-2). TRAITDATA-A may re-level. */
    learnAt: { vengeance: 2, bounding: 4, plated: 5, evasion: 7, bleed: 8, bash: 10, flurry: 12, unbroken: 14, counterstroke: 16, endlessSky: 18, riposte: 6 },
  },
  pyro: null, paladin: null, pirate: null, reaper: null, warden: null, geomancer: null, berserker: null, ranger: null,   /* TRAITDATA-A (warden, ranger, geomancer) / -B (pyro, pirate, reaper, berserker); paladin rides his rework lane */
};

const NODE = {};   /* hero -> id -> catalog node (own lookup: no import of progression.js) */
for (const n of SKILLS) (NODE[n.hero] = NODE[n.hero] || {})[n.id] = n;
const splitOf = h => { const s = TRAIT_SPLIT[h]; return s && ((s.core && s.core.length) || (s.traits && s.traits.length)) ? s : null; };
export const hasSplit = h => !!splitOf(h);

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
  const row = (id, tkind) => { const n = NODE[h] && NODE[h][id]; return n ? Object.assign({}, n, { tkind, level: tkind === 'core' ? n.level : learnLevel(h, id), baseLevel: n.level }) : null; };
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
  if (core.length) bits.push(core.length > 1 ? 'CORE: ' + NODE[h][core[0]].name + ' +' + (core.length - 1) + ' MORE.' : 'CORE: ' + NODE[h][core[0]].name + '.');
  if (got.length) bits.push(got.length > 1 ? 'TRAIT LEARNED: ' + NODE[h][got[0]].name + ' +' + (got.length - 1) + ' MORE.' : 'TRAIT LEARNED: ' + NODE[h][got[0]].name + '.');
  const grow = RANK_AT.slice(1).filter(n => from < n && to >= n);
  if (grow.length) bits.push('YOUR TRAITS GROW (RANK ' + ROMAN[RANK_AT.indexOf(grow[grow.length - 1])] + ').');
  if (from < SECOND_TRAIT_SLOT_LEVEL && to >= SECOND_TRAIT_SLOT_LEVEL) bits.push('A SECOND TRAIT SLOT.');
  return bits.length ? ' ' + bits.join(' ') : '';
}
