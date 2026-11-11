// src/forks.js - THE POST-L20 A/B FORKS (claude/forkframe = FORKFRAME, plan: scratch/lane-reports/forkplan.md + passiveplan.md sec 4 + sec 7 row 7; Daniel accepted every rec 11-09).
//
// Every hero gets forks on abilities he ALREADY has (dash, chain, block, heavy, spender, signature skills, the L50 ultimate = CAPSTONE) unlocked one rung at a time
// L21-L50, plus (passiveplan) an A/B pair on each worn TRAIT from L20. A fork is picked on a CHOICE CARD when its rung is reached (never defer: it is free to change)
// and swapped for free at THE CROSSROADS board in the inn. No new buttons: a side changes what an existing input does.
//
// THE WHOLE THING SHIPS DARK: FORKS_SHIP is false. While it is false NOTHING reads this file and the game is exactly the base: the Knight keeps his technique cards
// L25-L50 (progression.js hasKit), tech() / upg() read the card as before, no fork card, no CROSSROADS station, no strip. The flag is the one switch
// (the lab may say ?forks=on; tools/forks.mjs uses setForksShip in-process).
//
// PURE: no DOM, no main.js, no progression.js import (progression.js imports THIS file). State comes in as `p` (the save's progress object) and a small ctx.
//
// DATA: forks-<hero>.js files hold `{ key: { slot|trait, ability, name, trade, A:{id,name,what,teach}, B:{...} } }`.
//   key     the fork's stable id inside p.fork[hero]: the slot word ('block', 'heavy', 'spender', 'ult', ...) or 'skill:<catalog id>' for a signature skill, or 'trait:<id>'
//   slot    the ladder rung (FORK_LADDER); a trait fork has `trait: <catalog id>` instead and unlocks at TRAIT_FORK_LEVEL while that trait is WORN
//   A / B   the two sides. `id` is what main.js reads (forkOn(p, h, id, lv, ctx)); name <= 14 chars (text fit), what <= 2 lines, teach = the unlock line
// SAVE: p.fork = { hero: { key: 'A' | 'B', v: 1 } } - no PROGRESSION_VERSION bump (a v2 build must still load it: a rollback build just ignores p.fork).
import { KNIGHT_FORKS } from './forks-knight.js';

export const FORKS_SHIP = false;
let ship = FORKS_SHIP;
export const forksShip = () => ship;
export const setForksShip = v => { ship = !!v; return ship; };   /* tools and the lab only: the shipped value is FORKS_SHIP */

/* THE LADDER (forkplan sec 3): the same rungs for every hero; a hero may leave a rung empty (then that level is a plain level). Rungs avoid 20/25/30/35/40/45/50-milestones except the capstone,
   so no level ever deals two CHOICE cards. */
export const FORK_LADDER = [
  { lv: 21, slot: 'dash' }, { lv: 22, slot: 'skill1' }, { lv: 24, slot: 'chain' }, { lv: 27, slot: 'block' }, { lv: 29, slot: 'skill2' },
  { lv: 32, slot: 'heavy' }, { lv: 36, slot: 'spender' }, { lv: 38, slot: 'skill3' }, { lv: 43, slot: 'sig' }, { lv: 48, slot: 'skill4' }, { lv: 50, slot: 'ult', capstone: true }];
export const TRAIT_FORK_LEVEL = 20;
export const CAPSTONE_LEVEL = 50;
export const NAME_MAX = 14;   /* a fork name on a card (textfit) */
const LADDER_LV = Object.fromEntries(FORK_LADDER.map(r => [r.slot, r.lv]));

/* THE REGISTRY: hero -> { key: entry }. Hero lanes add their file here; tools may register a synthetic fork (registerFork / unregisterFork) for the framework checks. */
const REG = { knight: KNIGHT_FORKS };
export const registerFork = (h, key, entry) => { (REG[h] = REG[h] || {})[key] = entry; };
export const unregisterFork = (h, key) => { if (REG[h]) delete REG[h][key]; };
export const forksOf = h => REG[h] || {};
export const hasForks = h => Object.keys(forksOf(h)).length > 0;
const entryOf = (h, key) => forksOf(h)[key] || null;
export const isTraitFork = e => !!e && !!e.trait;
export const levelOfFork = e => e ? (e.trait ? TRAIT_FORK_LEVEL : (LADDER_LV[e.slot] || 99)) : 99;
export const traitKey = id => 'trait:' + id;
const sideOf = (e, s) => (s === 'A' || s === 'B') && e ? e[s] : null;
export const isCapstone = e => !!e && (e.capstone === true || e.slot === 'ult');

/* a fork entry sorted by the level it opens; ability forks first on a tie */
export const forkList = (h, trait) => Object.entries(forksOf(h)).map(([key, e]) => ({ key, e, level: levelOfFork(e) })).filter(r => trait === undefined ? true : isTraitFork(r.e) === trait)
  .sort((a, b) => a.level - b.level || (a.key < b.key ? -1 : 1));

const mapOf = (p, h) => (p && p.fork && typeof p.fork === 'object' && !Array.isArray(p.fork) && p.fork[h] && typeof p.fork[h] === 'object') ? p.fork[h] : null;
/* the picked side of one fork ('A' | 'B' | null); null while the flag is off or the key is unknown */
export const forkSide = (p, h, key) => { if (!ship) return null; const e = entryOf(h, key), m = mapOf(p, h); return e && m && (m[key] === 'A' || m[key] === 'B') ? m[key] : null; };
export const sideId = (h, key, side) => { const s = sideOf(entryOf(h, key), side); return s ? s.id : null; };
/* find the fork a side id belongs to: { key, e, side } or null */
export function findSide(h, id) { for (const [key, e] of Object.entries(forksOf(h))) for (const s of ['A', 'B']) if (e[s] && e[s].id === id) return { key, e, side: s }; return null; }
/* ctx = { worn(traitId) -> bool, slotted(skillId) -> bool } supplied by main.js; omitted: trait forks and skill forks are judged live (test default) */
const ctxOk = (e, ctx) => {
  if (e.trait) return !ctx || !ctx.worn ? true : !!ctx.worn(e.trait);
  if (typeof e.ability === 'string' && e.ability.startsWith('skill:')) return !ctx || !ctx.slotted ? true : !!ctx.slotted(e.ability.slice(6));
  return true; };
/* THE READ: true only if the side is picked AND the hero's level has reached the rung AND (trait fork) the trait is worn / (skill fork) the skill is slotted. Base behaviour otherwise. */
export function forkOn(p, h, id, lv, ctx) { if (!ship) return false; const f = findSide(h, id); if (!f) return false; if (forkSide(p, h, f.key) !== f.side) return false; if ((lv || 0) < levelOfFork(f.e)) return false; return ctxOk(f.e, ctx); }

/* WHAT IS OWED: ability forks whose rung the level has reached and that hold no valid pick, in ladder order (the level-up card deals the first). Trait forks wait for the trait to be worn. */
export const forksOwed = (p, h, lv) => !ship ? [] : forkList(h, false).filter(r => r.level <= (lv || 0) && !forkSide(p, h, r.key));
export const traitForksOwed = (p, h, lv, worn) => !ship || (lv || 0) < TRAIT_FORK_LEVEL ? [] : forkList(h, true).filter(r => (worn || []).includes(r.e.trait) && !forkSide(p, h, r.key));
export const owedCount = (p, h, lv, worn) => forksOwed(p, h, lv).length + traitForksOwed(p, h, lv, worn).length;

/* THE CARD'S OPTIONS (the shape main.js drawCard already draws: id, name, what, fork, trade, input) - id is the SIDE LETTER here, what the pick records */
export function forkCard(h, key) { const e = entryOf(h, key); if (!e) return null;
  return { kind: 'fork', key, n: levelOfFork(e), title: e.name, trade: e.trade, capstone: isCapstone(e), trait: !!e.trait, slotted: e.ability && String(e.ability).startsWith('skill:'),
    opts: ['A', 'B'].map(s => ({ id: s, side: s, sideId: e[s].id, name: e[s].name, what: e[s].what, fork: true, free: true, trade: e.trade, input: e[s].input || '', capstone: isCapstone(e), rec: false })) }; }

/* PICK or SWAP (one call: the card and the inn board are the same write; free, unlimited). null = done, else the refusal text. */
export function setFork(p, h, key, side, lv) {
  if (!ship) return 'Forks are not open yet'; const e = entryOf(h, key); if (!e) return 'No such fork'; if (side !== 'A' && side !== 'B') return 'Pick A or B';
  if ((lv || 0) < levelOfFork(e)) return 'Locked until level ' + levelOfFork(e);
  p.fork = p.fork && typeof p.fork === 'object' && !Array.isArray(p.fork) ? p.fork : {}; const m = p.fork[h] = (p.fork[h] && typeof p.fork[h] === 'object') ? p.fork[h] : {}; m[key] = side; m.v = 1; return null; }
export const pickFork = setFork;

/* THE INN BOARD'S ROWS (THE CROSSROADS): every fork of this hero, unlocked or not. tab: 'ABILITIES' (ability forks + the capstone) or 'TRAITS'. */
export function boardRows(p, h, lv, tab, ctx) {
  return forkList(h, tab === 'TRAITS').map(({ key, e, level }) => { const side = forkSide(p, h, key), open = (lv || 0) >= level;
    return { key, name: e.name, level, open, side, A: e.A, B: e.B, trade: e.trade, capstone: isCapstone(e), trait: !!e.trait, applies: open && ctxOk(e, ctx),
      note: !open ? 'LEVEL ' + level : !ctxOk(e, ctx) ? (e.trait ? 'WEAR THE TRAIT TO USE IT' : 'APPLIES WHEN YOU SLOT IT') : '' }; }); }

/* THE ROAD STRIP: the built rungs of this hero as pips (the level-up card's strip; the shape main.js drawRoadToL50 draws). [] while the flag is off or the hero has no ability fork. */
export function roadStrip(p, h, lv) {
  if (!ship) return []; const list = forkList(h, false); if (!list.length) return []; let nextSeen = false;
  return list.map(({ key, e, level }) => { const side = forkSide(p, h, key), st = side ? 'taken' : (!nextSeen ? (nextSeen = true, 'next') : 'ahead');   /* the first one not yet picked is the lit pip */
    return { level, key, fork: true, capstone: isCapstone(e), compact: true, state: st, reached: (lv || 0) >= level, side, picked: side ? { id: e[side].id, name: e[side].name } : null,
      options: ['A', 'B'].map(s => ({ id: e[s].id, name: e[s].name, input: e[s].input || '', locked: !!side && side !== s })) }; }); }

/* THE FIRST SAVE CHECK: p.fork must be { hero: { key: 'A'|'B' } }. A bad entry is DROPPED, never an error. While the flag is off an unknown key is kept (a later build may know it). */
export function validateForks(p) {
  if (!p || p.fork === undefined) return; if (!p.fork || typeof p.fork !== 'object' || Array.isArray(p.fork)) { delete p.fork; return; }
  for (const h of Object.keys(p.fork)) { const m = p.fork[h]; if (!m || typeof m !== 'object' || Array.isArray(m)) { delete p.fork[h]; continue; }
    for (const k of Object.keys(m)) { if (k === 'v') { if (!Number.isInteger(m.v)) m.v = 1; continue; } if (m[k] !== 'A' && m[k] !== 'B') { delete m[k]; continue; } if (ship && !entryOf(h, k)) delete m[k]; } } }

/* THE KNIGHT'S LIVE-SAVE MIGRATION (forkplan sec 1, ONE-SHOT, idempotent on p.fork.knight.v; runs only while the flag is on). The technique cards L25-L50 and the upgrade cards are CUT with the flag on
   (progression.js hasKit is false for him), so a save holding them is converted:
     1. each old technique -> its fork side where one is built (KNIGHT_LEGACY); COUNTER-THRUST is now CORE riposte (RECS158-d) and SHIELD HOOK is parked: neither maps.
     2. every ms[n] that held a technique or an upgrade is deleted: that milestone perk is owed again (the card deals a major perk at 25..50).
     3. c.up deleted: each upgrade level is a stat pick again (picksOwed grows by itself once hasKit is false).
     4. one free card respec (cardFree.knight = 1) so the returned picks can be redone.
   Forks for rungs the hero has reached but held no old technique for stay unpicked: their cards are dealt at the next card / inn visit. Returns a small summary (the tool asserts it). */
export const KNIGHT_LEGACY = { klong: ['block', 'A'], kadvance: ['block', 'B'], kpunish: ['heavy', 'A'], klinkcut: ['heavy', 'B'], korders: ['spender', 'B'], kcharge2: ['ult', 'A'], kwheel: ['ult', 'B'] };
const OLD_TECH_IDS = ['kcounter', 'kadvance', 'kpunish', 'klong', 'korders', 'kcharge2', 'klinkcut', 'kshook', 'kwheel'];
export function migrateForks(p) {
  const out = { done: false, picked: [], perksOwed: 0, upgradesReturned: 0 }; if (!ship || !p || !p.card || !p.card.knight || typeof p.card.knight !== 'object') return out;
  p.fork = p.fork && typeof p.fork === 'object' && !Array.isArray(p.fork) ? p.fork : {}; const m = p.fork.knight = (p.fork.knight && typeof p.fork.knight === 'object') ? p.fork.knight : {};
  if ((m.v | 0) >= 1) return out;
  const c = p.card.knight, ms = c.ms && typeof c.ms === 'object' ? c.ms : {}, have = new Set(Object.values(ms));
  for (const [id, [key, side]] of Object.entries(KNIGHT_LEGACY)) { if (!have.has(id) || m[key]) continue; const both = Object.entries(KNIGHT_LEGACY).filter(([, [k2]]) => k2 === key).map(([i]) => i).filter(i => have.has(i));
    const win = both.length > 1 ? both.find(i => KNIGHT_LEGACY[i][1] === 'A') : id; if (win === id) { m[key] = side; out.picked.push(key + ':' + side); } }
  for (const k of Object.keys(ms)) { const id = ms[k]; if (OLD_TECH_IDS.includes(id) || /^u[a-z]+:\d$/.test(String(id))) { delete ms[k]; if (OLD_TECH_IDS.includes(id)) out.perksOwed++; else out.upgradesReturned++; } }
  if (c.up && typeof c.up === 'object') { out.upgradesReturned = Math.max(out.upgradesReturned, Object.values(c.up).reduce((a, n) => a + (n | 0), 0)); delete c.up; }
  p.cardFree = p.cardFree && typeof p.cardFree === 'object' ? p.cardFree : {}; if (out.picked.length || out.perksOwed || out.upgradesReturned) p.cardFree.knight = 1;
  m.v = 1; out.done = true; return out; }

/* THE LEGACY READS (main.js tech() / upg() while the flag is on): the Knight's effect sites still ask for technique and upgrade ids. They are answered from the forks. */
export function legacyTech(p, h, lv, id, ctx) { if (!ship) return null; if (h !== 'knight') return false; if (id === 'kcounter' || id === 'kshook') return false; return forkOn(p, h, id, lv, ctx); }
export function legacyUpg(p, h, lv, id, ctx) { if (!ship) return null; if (h === 'knight' && (id === 'ukeep' || id === 'uwind')) return forkOn(p, h, 'kironlinks', lv, ctx) ? 2 : 0; return 0; }
