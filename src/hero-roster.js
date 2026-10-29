// src/hero-roster.js - THE DEVICE-LEVEL HERO ROSTER (claude/heroroster, Daniel 10-12).
// A hero BOUGHT in any slot is remembered here, outside the slots (localStorage 'bracken.roster'), so a NEW GAME on any slot can start with
// any hero the device has ever owned. Silver stays per slot; a slot keeps its own heroes and progress. The four free starters are always in it.
//   MIGRATION  the first time (no roster stored) every existing slot is scanned and the roster is seeded with every hero owned anywhere.
//   SAFETY     like a slot (src/save-safety.js): the text is written through safeSet, the last clean text is kept in key + '.lastgood', a damaged
//              text is kept in key + '.corrupt' (never overwritten in silence) and the roster is put back from the last good copy - or, with
//              none, REBUILT from the slots - so a bad roster never locks a hero out. Pure: every function takes the storage it works on.
//   THE HOOK   HERO_RULE_SHIPS (Daniel 10-11: every unlockable hero needs a SILVER price AND a WIN against him) is false until the Pirate Fleet
//              and Lit Church 2 are live; flip it and howTo() says 'BEAT HIM, THEN 10 SILVER' for every hero that is not a starter.
import { keepCorruptCopy, LASTGOOD, CORRUPT, safeSet } from './save-safety.js';

export const ROSTER_KEY = 'bracken.roster';
export const STARTERS = ['knight', 'warden', 'geomancer', 'ranger'];   /* (claude/ranger, Daniel 10-12: THE RANGER is the fourth free starter; THE BERSERKER is bought - a roster that holds him keeps him) */
export const HERO_IDS = ['knight', 'warden', 'geomancer', 'ranger', 'berserker', 'pyro', 'paladin', 'pirate', 'reaper'];
export const HERO_RULE_SHIPS = false;
/* THE WAR CAIRN's SWITCH (claude/warcairn, scratch/brief-crownpath-1028.md Q2/Q5, Daniel 10-28): false until THE WAR CAIRN ships (after its art pass). Flip it IN THE BATCH THAT SHIPS
   THE LEVEL and THE BERSERKER is no longer sold to anyone who has not beaten THE BERSERKER CHIEFTAIN (feat 'boss:warcairn', then 10 silver - the Blood Knight's rule; src/main.js
   HEROES reads it). A slot or a device roster that already owns him keeps him either way (lockOf only gates heroes you do not own), and gets THE CHIEFTAIN'S AXES for beating him */
export const WARCAIRN_SHIPS = false;
/* the lines a locked card says (size 6, 320 wide: textfit heropick strict). Hero-specific where the way in is not just the store. */
const HOW = { reaper: 'BEAT HIM IN THE UNBURIED, THEN BUY: 10 SILVER', ...(WARCAIRN_SHIPS ? { berserker: 'BEAT HIM AT THE WAR CAIRN, THEN BUY: 10 SILVER' } : {}) };
export const howTo = (h, ruleShips = HERO_RULE_SHIPS) => ruleShips ? 'BEAT HIM, THEN 10 SILVER' : (HOW[h] || 'BUY IN THE STORE - 10 SILVER');

const get = (s, k) => { try { return s.getItem(k); } catch { return null; } };
const norm = ids => { const set = new Set(STARTERS); for (const h of ids || []) if (HERO_IDS.includes(h)) set.add(h); return HERO_IDS.filter(h => set.has(h)); };
export const rosterText = ids => JSON.stringify({ v: 1, heroes: norm(ids) });
/* a roster text judged: returns the hero list, or throws with the reason */
export function parseRoster(raw) {
  let o; try { o = JSON.parse(raw); } catch { throw Error('the hero roster is not readable'); }
  if (!o || typeof o !== 'object' || !Array.isArray(o.heroes)) throw Error('the hero roster has no hero list');
  return norm(o.heroes);
}
/* every hero owned in any slot: slotRaws are the slots' raw texts (a slot that does not read is skipped - the slots have their own safety) */
export function heroesInSlots(slotRaws) {
  const out = [];
  for (const raw of slotRaws) { if (!raw) continue; try { const p = JSON.parse(raw), hs = p && p.heroes; if (hs && typeof hs === 'object') for (const h in hs) if (hs[h] === true) out.push(h); if (p && p.hero && hs && hs[p.hero]) out.push(p.hero); } catch {} }
  return norm(out);
}
/* THE BOOT READ. -> { heroes, state: 'ok' | 'migrated' | 'restored' | 'rebuilt', wrote } (state says how the roster came to be; wrote: it reached storage) */
export function loadRoster(storage, slotRaws = () => []) {
  const raw = get(storage, ROSTER_KEY); let heroes, state;
  if (raw === null || raw === '') { heroes = heroesInSlots(slotRaws()); state = 'migrated'; }
  else { try { heroes = parseRoster(raw); state = 'ok'; }
    catch { keepCorruptCopy(storage, ROSTER_KEY, raw); const lg = get(storage, ROSTER_KEY + LASTGOOD);
      try { heroes = parseRoster(lg); state = 'restored'; } catch { heroes = heroesInSlots(slotRaws()); state = 'rebuilt'; } } }
  const text = rosterText(heroes), r = state === 'ok' && raw === text ? { ok: true } : safeSet(storage, ROSTER_KEY, text);
  if (r.ok) { try { if (get(storage, ROSTER_KEY + LASTGOOD) !== text) storage.setItem(ROSTER_KEY + LASTGOOD, text); } catch {} }
  return { heroes, state, wrote: !!r.ok };
}
/* A HERO BOUGHT (or carried by a slot that was just opened): add him. Returns { heroes, added } - added: who is new; nothing is written when nobody is. */
export function addHeroes(storage, heroes, ids) {
  const next = norm([...heroes, ...(ids || [])]), added = next.filter(h => !heroes.includes(h));
  if (!added.length) return { heroes, added };
  const text = rosterText(next), r = safeSet(storage, ROSTER_KEY, text);
  if (r.ok) { try { storage.setItem(ROSTER_KEY + LASTGOOD, text); } catch {} }
  return { heroes: next, added, ok: !!r.ok };
}
export { CORRUPT, LASTGOOD };
