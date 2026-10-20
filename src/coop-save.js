// src/coop-save.js - CO-OP PROGRESSION, STEP 1: PORTABLE PER-PLAYER SAVES (claude/coopprogress; scratch brief-coopprogress.md, Daniel 10-12 + 10-19).
// A co-op partner - an ONLINE guest on his own browser, or a LOCAL player on this one - plays HIS OWN hero out of one of HIS OWN save slots, and
// what he earns goes back into THAT slot. The host's save is never written with the partner's hero. Pure: every function takes the storage it
// works on (and a channel for the locks), so tools/coop-progress.mjs drives it in node with a fake storage and a fake channel, no page.
//
//   THE SNAPSHOT  snapshotOf(progress, hero, slot): the one hero's part of a save (his XP, card, skills, loadout, ranks, talents, charm, items,
//                 the purse) - small enough for the join message. cleanSnapshot() is the HOST's side: nothing in it is trusted (validated as a save
//                 is, one hero only) and it becomes a SEAT PROFILE: { hero, slot, sword, view, base }. view is the overlay main.js swaps into PROG
//                 for the length of that seat's pass (main.js asPlayer), so his level, kit and talents are his own and what he earns lands in view.
//   THE LEDGER    newLedger(seat, sid): the host's running account of one seat for one SESSION (sid). earnedOf() = what view holds now less what it
//                 held at the join (base), less what is still unbanked (the death cost's carry) at a checkpoint; LEVEL CLEARS are listed. Every
//                 credit is CUMULATIVE for its session and numbered (seq): nextCredit() returns the next one, or null when nothing new.
//   THE CREDIT    applyCredit(storage, key, credit): the PARTNER's side (the guest's own browser, or this one for a local seat). It writes the
//                 difference between this credit and the last one this slot took for the same session (kept in the save: coopCredit[sid]) - so a
//                 credit that arrives twice, late or out of order is never paid twice, and one that never arrives (the link dropped) is covered by the
//                 next. A clear opens the level on HIS road (PROG[id].cleared, done[hero][id]) so its needs-chain successors open as for his own
//                 clear. A slot with no save gets a fresh one. Through the save-safety rules: a damaged or newer slot is refused (told), an old one is
//                 migrated by loadProgress (its backup kept), the write is safeSet's (a full disk is told). opts.xpOnly: XP and levels only (a LINKED
//                 AI COMPANION earns those and nothing else - brief-aicompanions.md 10-14).
//   THE LOCKS     makeLocks({ id, channel }): one character is never open in two places. No storage is written for them (a heartbeat in
//                 localStorage would change the whole-storage snapshots the save checks take): every page that holds slots (the game: its own slot
//                 and its local co-op seats; a guest page: the slot it plays) says so on a BroadcastChannel, answers 'who', and re-says it every few
//                 seconds; a claim nobody has repeated for LOCK_TTL is gone. claim() refuses a slot another page - or another seat of this page - holds.
import { migrateProgress, loadProgress, validateProgress, DEFAULT_HEROES, HERO_IDS } from './progression.js';
import { slotHealth, safeSet } from './save-safety.js';
import { levelOfXp, xpCap } from './xp.js';

export const SLOTS = 5;
export const slotKey = i => 'bracken.progress.' + i;
export const LEGACY_KEY = 'bracken.progress';   /* the single save from before slots: it is slot 1 (main.js readSlot) */
export const slotKeys = () => Array.from({ length: SLOTS }, (_, j) => slotKey(j));
const object = v => !!v && typeof v === 'object' && !Array.isArray(v);
const get = (storage, k) => { try { return storage.getItem(k); } catch { return null; } };
export const slotRawOf = (storage, i) => get(storage, slotKey(i)) || (i === 0 ? get(storage, LEGACY_KEY) : null);

/* THE ONE HERO'S PART OF A SAVE: the maps keyed by hero (only his entry travels) and the few that are the save's own */
export const PER_HERO = ['xp', 'xpGot', 'done', 'card', 'cardFree', 'skillOwned', 'loadouts', 'skillRank', 'talents', 'charmOf'];
export const FLAT = ['charm', 'items', 'coins'];
/* every PROG key main.js swaps while a profiled seat's pass runs (tech is per hero by its 'hero:' prefix) */
export const OVERLAY_KEYS = [...PER_HERO, 'tech', ...FLAT];
export const MAX_CREDIT_SESSIONS = 24;   /* the newest sessions a slot remembers (coopCredit); older ones cannot come back, their links are long gone */

/* the heroes a save may take into co-op: what it owns, and the free starters (anybody may take one, as player two always could) */
export function heroesOf(p) {
  const own = object(p) && object(p.heroes) ? p.heroes : {};
  return HERO_IDS.filter(h => own[h] === true || DEFAULT_HEROES.includes(h));
}
/* A SLOT, IN A LINE: what the pickers show. state: empty / ok / corrupt / newer (save-safety's words) */
export function slotSummary(raw, campaignIds = []) {
  const h = slotHealth(raw, campaignIds);
  if (h.state !== 'ok') return { state: h.state, reason: h.reason, heroes: [] };
  const p = migrateProgress(raw, campaignIds).progress, hero = HERO_IDS.includes(p.hero) ? p.hero : 'knight';
  const lv = x => levelOfXp(((p.xp || {})[x]) || 0), levels = {};
  for (const x of heroesOf(p)) levels[x] = lv(x);
  const woods = new Set(); for (const d of Object.values(p.done || {})) if (object(d)) for (const k of Object.keys(d)) woods.add(k);
  return { state: 'ok', hero, level: lv(hero), heroes: heroesOf(p), levels, coins: p.coins || 0, woods: woods.size };
}
/* WHAT A SEAT PICKER SAYS (claude/coopclarity, Daniel 10-20: "make it clearer in co-op how progression is saved and works"): every line says what happens.
   A save: what it earns and where it goes; an empty one starts a new save; a held one says so (held = true, or the words); a GUEST plays a lent hero. */
export const GUEST_LINE = 'GUEST: PLAYS A LENT HERO - NOTHING IS SAVED', VISIT_LINE = 'JUST VISIT: PLAYS A LENT HERO - NOTHING IS SAVED', HELD_LINE = 'IN USE ELSEWHERE';
export const EXPLAIN_LINES = ['YOUR HERO, YOUR SAVE', 'WHAT YOU EARN HERE IS WRITTEN TO YOUR OWN SAVE', 'AT EVERY SHRINE AND WHEN THE WOOD IS WON'];
export const HOST_NOTE = 'GUESTS NEVER CHANGE YOUR SAVE';
export const summaryLine = (i, s, name = h => String(h || '').toUpperCase(), held = false) => {
  const n = 'SAVE ' + (i + 1), tail = held ? (typeof held === 'string' ? held : HELD_LINE) : null;
  if (s.state === 'corrupt') return n + ' - DAMAGED';
  if (s.state === 'newer') return n + ' - FROM A NEWER BRACKEN';
  if (s.state === 'empty') return n + ' - EMPTY: ' + (tail || 'A NEW SAVE STARTS HERE');
  return n + ' - ' + name(s.hero) + ' LV ' + s.level + ': ' + (tail || 'EARNS XP, SILVER + CLEARS INTO ' + n);
};
/* the SAVED TO cell of a seat (the win card's row): his save, or a guest's nothing */
export const savedTo = (slot, long = false) => (Number.isInteger(slot) && slot >= 0 ? 'SAVE ' + (slot + 1) : long ? 'GUEST - NOT SAVED' : 'GUEST');

/* ===== THE SNAPSHOT (the partner's side) ===== */
export function snapshotOf(p, hero, slot) {
  if (!HERO_IDS.includes(hero)) throw Error('Unknown hero');
  const data = {};
  for (const k of PER_HERO) if (object(p[k]) && p[k][hero] !== undefined) data[k] = { [hero]: p[k][hero] };
  if (object(p.tech)) { const t = {}; for (const [k, v] of Object.entries(p.tech)) if (k.startsWith(hero + ':')) t[k] = v; data.tech = t; }
  if (typeof p.charm === 'string') data.charm = p.charm;
  if (object(p.items)) data.items = p.items;
  data.coins = Number.isFinite(p.coins) && p.coins >= 0 ? p.coins : 0;
  return JSON.parse(JSON.stringify({ v: 1, slot: Number.isInteger(slot) ? slot : -1, hero, sword: typeof p.sword === 'string' ? p.sword : 'steel', heroes: heroesOf(p), data }));
}
/* ===== THE SEAT PROFILE (the host's side): nothing in the snapshot is trusted ===== */
export function cleanSnapshot(snap) {
  if (!object(snap) || snap.v !== 1 || !object(snap.data) || !HERO_IDS.includes(snap.hero)) return null;
  const hero = snap.hero, d = snap.data, view = {};
  try {
    for (const k of PER_HERO) { view[k] = {}; if (object(d[k]) && d[k][hero] !== undefined) view[k][hero] = JSON.parse(JSON.stringify(d[k][hero])); }
    if (view.xp[hero] !== undefined && !(Number.isFinite(view.xp[hero]) && view.xp[hero] >= 0)) return null;
    view.tech = {}; if (object(d.tech)) for (const [k, v] of Object.entries(d.tech)) if (k.startsWith(hero + ':') && Number.isFinite(v)) view.tech[k] = v;
    view.charm = typeof d.charm === 'string' && d.charm.length < 40 ? d.charm : null;
    view.items = {}; if (object(d.items)) for (const [k, v] of Object.entries(d.items)) if (typeof v === 'boolean' || Number.isFinite(v)) view.items[k] = v;
    view.coins = Number.isFinite(d.coins) && d.coins >= 0 ? Math.floor(d.coins) : 0;
    validateProgress({ hero, ...view });   /* the save's own rules (owned skills, loadouts, card picks, unsafe keys) on the hero's part */
  } catch { return null; }
  const heroes = Array.isArray(snap.heroes) ? snap.heroes.filter(h => HERO_IDS.includes(h)) : [hero];
  return { hero, slot: Number.isInteger(snap.slot) ? snap.slot : -1, sword: typeof snap.sword === 'string' && /^[a-zA-Z0-9_-]{1,32}$/.test(snap.sword) ? snap.sword : 'steel',
    heroes: heroes.includes(hero) ? heroes : [hero, ...heroes], view, base: { xp: view.xp[hero] || 0, coins: view.coins } };
}
/* a fresh hero's profile (a local seat on an EMPTY slot, a guest with no save): a new save's part for that hero */
export function freshSeat(hero, slot) { return cleanSnapshot(snapshotOf(migrateProgress(null).progress, hero, slot)); }
/* the profile straight from a slot on THIS browser (a local JOIN; a linked AI companion) - null when the slot cannot be read clean */
export function seatFromSlot(storage, i, hero, campaignIds = []) {
  const raw = slotRawOf(storage, i), h = slotHealth(raw, campaignIds);
  if (h.state === 'empty') return freshSeat(hero, i);
  if (h.state !== 'ok') return null;
  return cleanSnapshot(snapshotOf(migrateProgress(raw, campaignIds).progress, hero, i));
}

/* ===== THE LEDGER (the host's side) ===== */
let sidN = 0;
export const newSid = (tag = '') => (String(tag).replace(/[^A-Za-z0-9]/g, '').slice(0, 12) || 'S') + '-' + Date.now().toString(36) + '-' + (++sidN).toString(36) + Math.floor(Math.random() * 1296).toString(36);
export function newLedger(seat, sid) { return { sid: sid || newSid(), seq: 0, hero: seat.hero, slot: seat.slot, base: { ...seat.base }, view: seat.view, clears: [], last: { xp: 0, coins: 0, clears: 0 }, got: 0 }; }
/* what the seat has earned this session: unbanked (the death cost's carry: { xp, coins }) is what a checkpoint must not pay yet */
export function earnedOf(led, unbanked = null) {
  const v = led.view, h = led.hero, u = unbanked || { xp: 0, coins: 0 };
  return { xp: Math.max(0, Math.round(((v.xp || {})[h] || 0) - led.base.xp - (u.xp || 0))), coins: Math.max(0, Math.floor((v.coins || 0) - led.base.coins - (u.coins || 0))), clears: led.clears.slice() };
}
export function noteClear(led, id) { if (typeof id === 'string' && !led.clears.includes(id)) led.clears.push(id); }
/* the next credit, cumulative and never lower than the last one sent; null when nothing changed (a final one is always sent) */
export function nextCredit(led, unbanked = null, final = false) {
  const e = earnedOf(led, unbanked), xp = Math.max(led.last.xp, e.xp), coins = Math.max(led.last.coins, e.coins);
  if (!final && xp === led.last.xp && coins === led.last.coins && e.clears.length === led.last.clears) return null;
  if (final && led.seq === 0 && !xp && !coins && !e.clears.length) return null;   /* a session that earned nothing writes nothing (an empty slot stays empty) */
  led.seq++; led.last = { xp, coins, clears: e.clears.length };
  return { v: 1, sid: led.sid, seq: led.seq, hero: led.hero, xp, coins, clears: e.clears, final: !!final };
}

/* ===== THE CREDIT (the partner's side) ===== */
export function cleanCredit(c) {
  if (!object(c) || c.v !== 1 || typeof c.sid !== 'string' || !/^[A-Za-z0-9-]{1,64}$/.test(c.sid) || !Number.isInteger(c.seq) || c.seq < 1 || !HERO_IDS.includes(c.hero)) return null;
  if (!(Number.isFinite(c.xp) && c.xp >= 0) || !(Number.isFinite(c.coins) && c.coins >= 0) || !Array.isArray(c.clears) || c.clears.length > 500) return null;
  const clears = [...new Set(c.clears.filter(id => typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id) && !['__proto__', 'constructor', 'prototype'].includes(id)))];
  return { v: 1, sid: c.sid, seq: c.seq, hero: c.hero, xp: Math.floor(c.xp), coins: Math.floor(c.coins), clears, final: !!c.final };
}
/* Returns { ok, dup, fresh, applied: { xp, coins, clears }, why, progress }. Never throws. opts: { campaignIds, now, xpOnly, isLevel(id) } */
export function applyCredit(storage, key, credit, opts = {}) {
  const c = cleanCredit(credit); if (!c) return { ok: false, why: 'A CREDIT THE GAME COULD NOT READ (IGNORED)' };
  const ids = opts.campaignIds || [], legacy = key === slotKey(0) ? get(storage, LEGACY_KEY) : null, raw = get(storage, key) || legacy;
  const health = slotHealth(raw, ids);
  if (health.state === 'corrupt') return { ok: false, why: 'THIS SLOT IS DAMAGED: NOTHING WAS WRITTEN (FIX IT FROM CHOOSE A SAVE)' };
  if (health.state === 'newer') return { ok: false, why: 'THIS SLOT IS FROM A NEWER BRACKEN: NOTHING WAS WRITTEN' };
  let p, fresh = false;
  try { if (raw === null) { p = migrateProgress(null).progress; fresh = true; } else p = loadProgress(storage, key, raw, ids).progress; }
  catch (e) { return { ok: false, why: 'THE SAVE COULD NOT BE OPENED: ' + String((e && e.message) || e).toUpperCase() }; }
  const book = object(p.coopCredit) ? p.coopCredit : {}, prev = object(book[c.sid]) ? book[c.sid] : { seq: 0, xp: 0, coins: 0, clears: [] };
  if (c.seq <= (prev.seq || 0)) return { ok: true, dup: true, applied: { xp: 0, coins: 0, clears: [] } };
  const h = c.hero, dXp = Math.max(0, c.xp - (prev.xp || 0)), dCoins = opts.xpOnly ? 0 : Math.max(0, c.coins - (prev.coins || 0));
  const had = Array.isArray(prev.clears) ? prev.clears : [], newClears = opts.xpOnly ? [] : c.clears.filter(id => !had.includes(id) && (!opts.isLevel || opts.isLevel(id)));
  p.xp = object(p.xp) ? p.xp : {}; const xp0 = p.xp[h] || 0; p.xp[h] = Math.min(Math.max(xp0, xpCap()), xp0 + dXp);
  if (dCoins) p.coins = (p.coins || 0) + dCoins;
  if (newClears.length) { p.done = object(p.done) ? p.done : {}; const d = p.done[h] = object(p.done[h]) ? p.done[h] : {};
    for (const id of newClears) { const lv = object(p[id]) ? p[id] : {}; p[id] = { ...lv, cleared: true }; d[id] = 1; const gw = object(p.xpGot) && object(p.xpGot[h]) ? p.xpGot[h][id] : null; if (object(gw)) delete gw.k; } }
  if (DEFAULT_HEROES.includes(h) && !opts.xpOnly) { p.heroes = object(p.heroes) ? p.heroes : { knight: true }; p.heroes[h] = true; }   /* a free starter he played is his */
  if (fresh) { p.hero = h; p.perHero = 1; p.xpVersion = 1; }
  book[c.sid] = { seq: c.seq, hero: h, xp: Math.max(prev.xp || 0, c.xp), coins: opts.xpOnly ? (prev.coins || 0) : Math.max(prev.coins || 0, c.coins), clears: [...new Set([...had, ...newClears])], t: opts.now || Date.now() };
  const keep = Object.entries(book).sort((a, b) => (b[1].t || 0) - (a[1].t || 0)).slice(0, MAX_CREDIT_SESSIONS); p.coopCredit = Object.fromEntries(keep);
  try { validateProgress(p); } catch (e) { return { ok: false, why: 'THE CREDIT WOULD BREAK THE SAVE: NOTHING WAS WRITTEN' }; }
  const text = JSON.stringify(p), r = safeSet(storage, key, text, slotKeys());
  if (!r.ok) return { ok: false, full: r.full, why: r.full ? 'SAVE FAILED - STORAGE FULL' : 'SAVE FAILED - COULD NOT WRITE' };
  if (get(storage, key) !== text) return { ok: false, why: 'SAVE FAILED - COULD NOT VERIFY' };
  return { ok: true, dup: false, fresh, applied: { xp: p.xp[h] - xp0, coins: dCoins, clears: newClears }, progress: p };
}
/* what a credit said, in the toast's words */
export function creditLine(slot, a) {
  const bits = []; if (a.xp) bits.push('+' + a.xp + ' XP'); if (a.coins) bits.push('+' + a.coins + ' SILVER'); if (a.clears && a.clears.length) bits.push(a.clears.length + (a.clears.length > 1 ? ' WOODS' : ' WOOD') + ' CLEARED');
  return bits.length ? 'SAVE ' + (slot + 1) + ': ' + bits.join(', ') : '';
}
/* the seat-coloured toast at a checkpoint: 'P2 +120 XP, +40 SILVER SAVED TO SAVE 2' */
export function creditToast(n, slot, a) {
  const bits = []; if (a.xp) bits.push('+' + a.xp + ' XP'); if (a.coins) bits.push('+' + a.coins + ' SILVER'); if (a.clears && a.clears.length) bits.push(a.clears.length + (a.clears.length > 1 ? ' WOODS' : ' WOOD') + ' CLEARED');
  return bits.length ? 'P' + n + ' ' + bits.join(', ') + ' SAVED TO SAVE ' + (slot + 1) : '';
}

/* ===== THE LOCKS: one character, one place ===== */
export const LOCK_TTL = 15000, LOCK_BEAT = 5000;
export function makeLocks({ id, channel = null, now = () => Date.now(), ttl = LOCK_TTL } = {}) {
  const me = id || 'p' + Math.floor(Math.random() * 1e9).toString(36), mine = new Map(), theirs = new Map();   /* mine: slot -> { kind, label, role }; theirs: slot -> { id, kind, label, t } */
  const post = m => { try { if (channel) channel.postMessage({ ...m, from: me }); } catch {} };
  const fresh = c => !!c && now() - c.t < ttl;
  function hear(m) {
    if (!object(m) || m.from === me || typeof m.from !== 'string') return;
    if (m.t === 'who') { beat(); return; }
    if (m.t === 'claims' && Array.isArray(m.claims)) {
      for (const [s, c] of [...theirs]) if (c.id === m.from) theirs.delete(s);
      for (const c of m.claims) if (Number.isInteger(c.slot)) theirs.set(c.slot, { id: m.from, kind: String(c.kind || ''), label: String(c.label || ''), t: now() });
    }
  }
  if (channel) { const prevOn = channel.onmessage; channel.onmessage = e => { if (prevOn) try { prevOn(e); } catch {} hear(e && 'data' in e ? e.data : e); }; }
  const claimsOut = () => [...mine].map(([slot, c]) => ({ slot, kind: c.kind, label: c.label }));
  function beat() { post({ t: 'claims', claims: claimsOut() }); }
  /* who else holds this slot: another page (fresh), or another role on this page */
  function holder(slot, role = null) {
    const o = theirs.get(slot); if (fresh(o)) return { ...o, here: false };
    const m = mine.get(slot); if (m && m.role !== role) return { id: me, kind: m.kind, label: m.label, here: true };
    return null;
  }
  function claim(slot, kind, label = '', role = kind) {
    const h = holder(slot, role); if (h) return { ok: false, holder: h };
    for (const [s, c] of [...mine]) if (c.role === role && s !== slot) mine.delete(s);   /* a role holds one slot: taking a new one lets the old go */
    mine.set(slot, { kind, label, role }); beat(); return { ok: true };
  }
  function release(slot, role = null) { const m = mine.get(slot); if (m && (role === null || m.role === role)) { mine.delete(slot); beat(); } }
  const releaseRole = role => { for (const [s, c] of [...mine]) if (c.role === role) mine.delete(s); beat(); };
  return { id: me, claim, release, releaseRole, holder, hear, beat, ask: () => post({ t: 'who' }), mine: () => claimsOut(), others: () => [...theirs].filter(([, c]) => fresh(c)).map(([slot, c]) => ({ slot, ...c })), releaseAll: () => { mine.clear(); beat(); } };
}
export function lockLine(slot, h) {
  const n = 'SAVE ' + (slot + 1);
  if (!h) return '';
  if (h.here) return n + ' IS ALREADY PLAYING HERE' + (h.label ? ' (' + h.label + ')' : '') + ': ONE CHARACTER, ONE PLACE';
  if (h.kind === 'game') return n + ' IS OPEN IN THE GAME IN ANOTHER TAB: PICK ANOTHER, OR OPEN A DIFFERENT SLOT THERE';
  if (h.kind === 'guest') return n + ' IS PLAYING ONLINE CO-OP IN ANOTHER TAB';
  return n + ' IS PLAYING CO-OP IN ANOTHER TAB' + (h.label ? ' (' + h.label + ')' : '');
}
export const levelOf = xp => levelOfXp(xp || 0);
