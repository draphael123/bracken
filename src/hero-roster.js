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
/* ACCOUNT-WIDE UNLOCKS (claude/heroroster2, Daniel 11-07): the roster is the DEVICE's list of owned heroes - a hero bought OR EARNED in any save is playable in every save, old and new.
   A hero is bought with silver or gold, but the boss that opens his sale is a FEAT (src/main.js HEROES feat): a feat beaten in any save is remembered here too (feats), so the sale is open in every save.
   Spent silver and gold stay spent in the save that spent them: nothing is refunded and an owned hero is never charged again. */
export const HERO_FEATS = ['boss:unburied', 'boss:church', 'boss:warcairn'];   /* the feats that gate a hero's sale: the Blood Knight, the Paladin, the Berserker Chieftain (HEROES in main.js) */
/* THE WAR CAIRN's SWITCH (claude/warcairn, scratch/brief-crownpath-1028.md Q2/Q5, Daniel 10-28): false until THE WAR CAIRN ships (after its art pass). Flip it IN THE BATCH THAT SHIPS
   THE LEVEL and THE BERSERKER is no longer sold to anyone who has not beaten THE BERSERKER CHIEFTAIN (feat 'boss:warcairn', then 10 silver - the Blood Knight's rule; src/main.js
   HEROES reads it). A slot or a device roster that already owns him keeps him either way (lockOf only gates heroes you do not own), and gets THE CHIEFTAIN'S AXES for beating him */
export const WARCAIRN_SHIPS = true;   /* flipped in BATCH129 (Daniel approved War Cairn 10-29; music picks approved) */
/* the lines a locked card says (size 6, 320 wide: textfit heropick strict). Hero-specific where the way in is not just the store. */
const HOW = { reaper: 'BEAT HIM IN THE UNBURIED, THEN BUY: 10 SILVER', paladin: 'BEAT HIM IN THE LIT CHURCH, THEN BUY: 10 SILVER', ...(WARCAIRN_SHIPS ? { berserker: 'BEAT HIM AT THE WAR CAIRN, THEN BUY: 10 SILVER' } : {}) };
export const howTo = (h, ruleShips = HERO_RULE_SHIPS) => ruleShips ? 'BEAT HIM, THEN 10 SILVER' : (HOW[h] || 'BUY IN THE STORE - 10 SILVER');

const get = (s, k) => { try { return s.getItem(k); } catch { return null; } };
const norm = ids => { const set = new Set(STARTERS); for (const h of ids || []) if (HERO_IDS.includes(h)) set.add(h); return HERO_IDS.filter(h => set.has(h)); };
const normFeats = fs => HERO_FEATS.filter(f => (fs || []).includes(f));
const normOwn = ids => HERO_IDS.filter(h => (ids || []).includes(h));   /* the heroes some save actually OWNS: unlike the pick list the four starters are in it only when a save owns them - an unbought starter is buyable in every save */
export const rosterText = (ids, feats, own) => { const fs = normFeats(feats), o = { v: 1, heroes: norm(ids) }; if (fs.length) o.feats = fs; if (Array.isArray(own)) o.own = normOwn(own); return JSON.stringify(o); };
/* a roster text judged: returns the hero list, or throws with the reason */
export function parseRoster(raw) {
  let o; try { o = JSON.parse(raw); } catch { throw Error('the hero roster is not readable'); }
  if (!o || typeof o !== 'object' || !Array.isArray(o.heroes)) throw Error('the hero roster has no hero list');
  return norm(o.heroes);
}
/* the hero-gating feats a roster text holds (never throws: a text with none, or one that does not read, holds none) */
export function parseFeats(raw) { try { const o = JSON.parse(raw); return o && typeof o === 'object' && Array.isArray(o.feats) ? normFeats(o.feats) : []; } catch { return []; } }
/* the OWNED list a roster text holds, or null when it has none (a roster from before account-wide unlocks: the caller works it out from the slots) */
export function parseOwn(raw) { try { const o = JSON.parse(raw); return o && typeof o === 'object' && Array.isArray(o.own) ? normOwn(o.own) : null; } catch { return null; } }
/* the hero-gating feats done in any slot (PROG.bossDown[id], which is what main.js featDone('boss:<id>') reads) */
export function featsInSlots(slotRaws) {
  const out = [];
  for (const raw of slotRaws) { if (!raw) continue; try { const p = JSON.parse(raw), bd = p && p.bossDown; if (bd && typeof bd === 'object') for (const f of HERO_FEATS) if (bd[f.slice(5)]) out.push(f); } catch {} }
  return normFeats(out);
}
/* the heroes the DEVICE owns, straight from a storage, for a page that does not run the game (co-op, the online guest): the stored owned list (else the last good copy's; else the roster's non-starters,
   the way an old roster is read). Reads only; writes nothing. */
export function rosterOwned(storage) {
  for (const k of [ROSTER_KEY, ROSTER_KEY + LASTGOOD]) { const raw = get(storage, k); if (raw) { const o = parseOwn(raw); if (o) return o; try { return parseRoster(raw).filter(h => !STARTERS.includes(h)); } catch {} } }
  return [];
}
/* the roster's PICK list (the new game's), straight from a storage: the stored text, else the last good copy, else just the starters */
export function rosterHeroes(storage) {
  for (const k of [ROSTER_KEY, ROSTER_KEY + LASTGOOD]) { const raw = get(storage, k); if (raw) { try { return parseRoster(raw); } catch {} } }
  return STARTERS.slice();
}
/* every hero a slot OWNS (hs[h] === true; the one it plays when he is owned): slotRaws are the slots' raw texts (a slot that does not read is skipped - the slots have their own safety) */
export function ownedInSlots(slotRaws) {
  const out = [];
  for (const raw of slotRaws) { if (!raw) continue; try { const p = JSON.parse(raw), hs = p && p.heroes; if (hs && typeof hs === 'object') for (const h in hs) if (hs[h] === true) out.push(h); if (p && p.hero && hs && hs[p.hero]) out.push(p.hero); } catch {} }
  return normOwn(out);
}
/* the pick list: every hero owned in any slot, and the four starters */
export const heroesInSlots = slotRaws => norm(ownedInSlots(slotRaws));
/* THE BOOT READ. -> { heroes, feats, own, state: 'ok' | 'migrated' | 'restored' | 'rebuilt', wrote } (state says how the roster came to be; wrote: it reached storage) */
export function loadRoster(storage, slotRaws = () => []) {
  const raw = get(storage, ROSTER_KEY); let heroes, state, feats = [], own = null;
  const fromSlots = () => { const rs = slotRaws(); heroes = heroesInSlots(rs); feats = featsInSlots(rs); own = ownedInSlots(rs); };
  if (raw === null || raw === '') { fromSlots(); state = 'migrated'; }
  else { try { heroes = parseRoster(raw); feats = parseFeats(raw); own = parseOwn(raw); state = 'ok'; }
    catch { keepCorruptCopy(storage, ROSTER_KEY, raw); const lg = get(storage, ROSTER_KEY + LASTGOOD);
      try { heroes = parseRoster(lg); feats = parseFeats(lg); own = parseOwn(lg); state = 'restored'; } catch { fromSlots(); state = 'rebuilt'; } } }
  /* a roster from before the owned list: the slots say which starters a save really owns, and every non-starter on the roster was bought */
  if (!own) own = normOwn([...ownedInSlots(slotRaws()), ...heroes.filter(h => !STARTERS.includes(h))]);
  const text = rosterText(heroes, feats, own), r = state === 'ok' && raw === text ? { ok: true } : safeSet(storage, ROSTER_KEY, text);
  if (r.ok) { try { if (get(storage, ROSTER_KEY + LASTGOOD) !== text) storage.setItem(ROSTER_KEY + LASTGOOD, text); } catch {} }
  return { heroes, feats, own, state, wrote: !!r.ok };
}
/* A HERO BOUGHT (or carried by a slot that was just opened), or a feat earned: add them. cur is what the caller holds ({ heroes, feats, own }); ids are the heroes the open save OWNS (they go on the pick list AND the owned
   list), addFeats the hero-gating feats it has beaten. Returns { heroes, feats, own, added, addedFeats, addedOwn } - nothing is written when nothing is new. */
export function noteRoster(storage, cur, ids = [], addFeats = []) {
  const heroes = cur.heroes || STARTERS.slice(), feats = cur.feats || [], own = cur.own || [];
  const nextH = norm([...heroes, ...ids]), nextO = normOwn([...own, ...ids]), nextF = normFeats([...feats, ...addFeats]);
  const added = nextH.filter(h => !heroes.includes(h)), addedOwn = nextO.filter(h => !own.includes(h)), addedFeats = nextF.filter(f => !feats.includes(f));
  if (!added.length && !addedOwn.length && !addedFeats.length) return { heroes, feats, own, added, addedOwn, addedFeats };
  const text = rosterText(nextH, nextF, nextO), r = safeSet(storage, ROSTER_KEY, text);
  if (r.ok) { try { storage.setItem(ROSTER_KEY + LASTGOOD, text); } catch {} }
  return { heroes: nextH, feats: nextF, own: nextO, added, addedOwn, addedFeats, ok: !!r.ok };
}
/* the older, heroes-only call (the pick list; the owned list the storage holds is kept as it is) */
export function addHeroes(storage, heroes, ids, feats = [], addFeats = []) {
  const next = norm([...heroes, ...(ids || [])]), added = next.filter(h => !heroes.includes(h));
  const nextFeats = normFeats([...(feats || []), ...(addFeats || [])]), addedFeats = nextFeats.filter(f => !(feats || []).includes(f));
  if (!added.length && !addedFeats.length) return { heroes, feats, added, addedFeats };
  const text = rosterText(next, nextFeats, parseOwn(get(storage, ROSTER_KEY)) || undefined), r = safeSet(storage, ROSTER_KEY, text);
  if (r.ok) { try { storage.setItem(ROSTER_KEY + LASTGOOD, text); } catch {} }
  return { heroes: next, feats: nextFeats, added, addedFeats, ok: !!r.ok };
}
export { CORRUPT, LASTGOOD };
