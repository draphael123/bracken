// tools/coop-progress.mjs - CO-OP PROGRESSION STEP 1, THE SAVE API IN NODE (claude/coopprogress; src/coop-save.js). No page: a fake storage, a fake
// BroadcastChannel hub. It proves:
//   A. THE SNAPSHOT is one hero's part of a save and survives the trip; the HOST trusts none of it (a tampered one - an owned skill no catalog has,
//      negative XP, an unsafe key, an unknown hero - is refused, never seated)
//   B. THE LEDGER: what the seat earned is what its overlay holds less the join's base, less the unbanked carry at a checkpoint; credits are
//      cumulative and numbered, never lower than the last, and nothing new sends nothing (a final one always goes)
//   C. THE CREDIT: XP, silver and LEVEL CLEARS land in the chosen slot - a clear opens its needs-chain successor on HIS road (main.js levelLocked's
//      rule); every other key of the slot is untouched; NEVER DOUBLE-CREDIT: the same credit twice, an older one late, and a rejoin's new session
//      each pay exactly once; a LOST credit is covered by the next (partial on a drop); a slot with no save gets a FRESH one; an old (v0/v1) save is
//      migrated with its backup kept; a DAMAGED or NEWER slot is refused with a told reason and not written; a full disk is told; xpOnly (a linked AI
//      companion) pays XP and nothing else; the remembered sessions are capped
//   D. THE LOCKS: one character, one place - another page's claim refuses the slot (and says where), a seat of this page cannot take player one's
//      slot, a claim nobody repeats expires, a released slot is free, a 'who' is answered
//   E. LOCAL SLOT PICK: seatFromSlot reads this browser's slot (an empty one is a fresh hero; a damaged one is refused), the summaries say each slot
//   node tools/coop-progress.mjs
import { LEVELS } from '../src/level.js';
import * as CS from '../src/coop-save.js';
import { migrateProgress, PROGRESSION_VERSION } from '../src/progression.js';
import { xpFloor, levelOfXp, xpCap } from '../src/xp.js';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); else if (process.env.CP_VERBOSE) console.log('  ok   ' + m); };
const CAMP = LEVELS.filter(l => !l.hidden).map(l => l.id);
const isLevel = id => LEVELS.some(l => l.id === id);
class Store { constructor(o = {}) { this.m = new Map(Object.entries(o)); this.full = false; } get length() { return this.m.size; } key(i) { return [...this.m.keys()][i] ?? null; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { if (this.full) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } }
const K = CS.slotKey;
/* a played save: the warden at level 7 with a skill and her card, a cleared wood and a medal, coins */
const played = () => { const p = migrateProgress(null).progress; Object.assign(p, { hero: 'warden', heroes: { knight: true, warden: true }, coins: 140, xp: { warden: xpFloor(7), knight: 50 }, done: { warden: { wood: 1 } }, wood: { cleared: true, medal: 2 }, perHero: 1, xpVersion: 1, guestSentinel: 'keep me' }); p.card = { warden: { v: 2, e: 2, m: 3, ms: { 5: 'tough' } } }; return p; };

// ---------- A. the snapshot ----------
{
  const p = played(), s = CS.snapshotOf(p, 'warden', 1);
  ok(s.hero === 'warden' && s.slot === 1 && s.data.xp.warden === xpFloor(7) && !('knight' in s.data.xp), 'A: the snapshot carries the one hero (warden XP, not the knight\'s)');
  ok(s.data.coins === 140 && JSON.stringify(s.data.card) === JSON.stringify({ warden: p.card.warden }), 'A: ...his purse and his card');
  ok(JSON.stringify(s).length < 4000, 'A: it is small enough for the join message: ' + JSON.stringify(s).length + ' bytes');
  ok(s.heroes.includes('warden') && s.heroes.includes('knight') && s.heroes.includes('ranger') && !s.heroes.includes('pyro'), 'A: the heroes he may take: owned + free starters: ' + s.heroes);
  const seat = CS.cleanSnapshot(JSON.parse(JSON.stringify(s)));
  ok(seat && seat.hero === 'warden' && seat.base.xp === xpFloor(7) && seat.base.coins === 140 && levelOfXp(seat.view.xp.warden) === 7, 'A: the host seats him at his own level 7 with his own purse');
  const bad = [
    ['an owned skill no catalog has', x => { x.data.skillOwned = { warden: { notASkill: true } }; }],
    ['negative XP', x => { x.data.xp.warden = -5; }],
    ['an unknown hero', x => { x.hero = 'dragon'; }],
    ['a loadout of a skill not owned', x => { x.data.loadouts = { warden: ['skewer'] }; }],
    ['an unsafe key', x => { x.data.items = JSON.parse('{"__proto__":{"heart":true}}'); x.data.card = JSON.parse('{"warden":{"__proto__":{"v":1}}}'); }],
    ['a card pick over the cap', x => { x.data.card.warden.v = 999; }],
    ['not an object', x => { x.data = 'nope'; }],
  ];
  for (const [what, f] of bad) { const t = JSON.parse(JSON.stringify(s)); f(t); ok(CS.cleanSnapshot(t) === null, 'A: a tampered snapshot is refused - ' + what); }
  const neg = JSON.parse(JSON.stringify(s)); neg.data.coins = -50; const sn = CS.cleanSnapshot(neg); ok(sn && sn.base.coins === 0, 'A: a negative purse is read as an empty one');
  const f = CS.freshSeat('ranger', 3); ok(f && f.hero === 'ranger' && f.base.xp === 0 && f.base.coins === 0 && f.slot === 3, 'A: a fresh hero (no save) seats at nothing');
}

// ---------- B. the ledger ----------
let C1, C2, C3, led;
{
  const seat = CS.cleanSnapshot(CS.snapshotOf(played(), 'warden', 1)); led = CS.newLedger(seat, CS.newSid('ABCD'));
  ok(CS.nextCredit(led) === null, 'B: nothing earned, nothing sent');
  ok(CS.nextCredit(led, null, true) === null && led.seq === 0, 'B: a session that earned nothing sends nothing even at its end (an empty slot stays empty)');
  seat.view.xp.warden += 300; seat.view.coins += 12;   /* (what main.js's swapped PROG takes in his pass: gainXp, a gold drop) */
  const atCp = CS.earnedOf(led, { xp: 100, coins: 2 }); ok(atCp.xp === 200 && atCp.coins === 10, 'B: at a checkpoint the unbanked carry is held back: ' + JSON.stringify(atCp));
  C1 = CS.nextCredit(led, { xp: 100, coins: 2 }); ok(C1 && C1.seq === 1 && C1.xp === 200 && C1.coins === 10 && C1.clears.length === 0, 'B: credit 1 (checkpoint): ' + JSON.stringify(C1));
  ok(CS.nextCredit(led, { xp: 100, coins: 2 }) === null, 'B: the same checkpoint again sends nothing');
  CS.noteClear(led, 'marsh'); CS.noteClear(led, 'marsh');
  C2 = CS.nextCredit(led); ok(C2 && C2.seq === 2 && C2.xp === 300 && C2.coins === 12 && C2.clears.join() === 'marsh', 'B: credit 2 (the clear, everything banked): ' + JSON.stringify(C2));
  seat.view.xp.warden -= 50;   /* the death cost took some back */
  const c = CS.nextCredit(led, null, true); ok(c && c.xp === 300 && c.final, 'B: a credit is never lower than the last one sent (a death after it), and a final one always goes');
  seat.view.xp.warden += 150; C3 = CS.nextCredit(led, null, true); ok(C3.seq === 4 && C3.xp === 400, 'B: cumulative: credit 4 says 400 in all: ' + C3.xp);
}

// ---------- C. the credit ----------
{
  const P = played(), raw = JSON.stringify(P), st = new Store({ [K(1)]: raw, [K(2)]: '{"hero":"pyro"}', 'bracken.settings': '{"music":false}' });
  const others = () => JSON.stringify([K(2), 'bracken.settings'].map(k => st.getItem(k)));
  const o0 = others(), opts = { campaignIds: CAMP, isLevel };
  const r1 = CS.applyCredit(st, K(1), C1, opts); const s1 = JSON.parse(st.getItem(K(1)));
  ok(r1.ok && !r1.dup && r1.applied.xp === 200 && r1.applied.coins === 10, 'C: credit 1 lands: ' + JSON.stringify(r1.applied || r1.why));
  ok(s1.xp.warden === xpFloor(7) + 200 && s1.coins === 150 && s1.xp.knight === 50 && s1.guestSentinel === 'keep me' && s1.wood.medal === 2, 'C: ...in the chosen slot only: XP and silver up, the rest kept');
  ok(others() === o0, 'C: every other slot and key of this browser is untouched');
  const r1b = CS.applyCredit(st, K(1), C1, opts); ok(r1b.ok && r1b.dup && JSON.parse(st.getItem(K(1))).xp.warden === xpFloor(7) + 200, 'C: NEVER DOUBLE-CREDIT: the same credit twice pays once');
  /* a lost one: credit 2 never came; credit 4 (final) comes - and then credit 2, late */
  const r3 = CS.applyCredit(st, K(1), C3, opts), s3 = JSON.parse(st.getItem(K(1)));
  ok(r3.ok && s3.xp.warden === xpFloor(7) + 400 && s3.coins === 152, 'C: a LOST credit is covered by the next (cumulative): XP +400, silver +12 in all: ' + (s3.xp.warden - xpFloor(7)) + ' / ' + (s3.coins - 140));
  ok(s3.marsh && s3.marsh.cleared === true && s3.done.warden.marsh === 1, 'C: the clear the lost credit carried is on his road');
  const r2 = CS.applyCredit(st, K(1), C2, opts); ok(r2.ok && r2.dup && JSON.parse(st.getItem(K(1))).xp.warden === xpFloor(7) + 400, 'C: an OLDER credit arriving late is ignored');
  /* a rejoin is a new session: his new snapshot already holds the old one's earnings, and the new ledger starts from it */
  const seat2 = CS.cleanSnapshot(CS.snapshotOf(JSON.parse(st.getItem(K(1))), 'warden', 1)), led2 = CS.newLedger(seat2, CS.newSid('ABCD'));
  ok(led2.sid !== led.sid && seat2.base.xp === xpFloor(7) + 400, 'C: a REJOIN snapshots the credited save as its base (a new session)');
  seat2.view.xp.warden += 25; const R = CS.nextCredit(led2, null, true); CS.applyCredit(st, K(1), R, opts); CS.applyCredit(st, K(1), R, opts); CS.applyCredit(st, K(1), C3, opts);
  ok(JSON.parse(st.getItem(K(1))).xp.warden === xpFloor(7) + 425, 'C: ...and pays only its own 25, once, beside the old session (replayed too)');
  /* the road: a clear opens its needs-chain successor exactly as his own clear does (main.js levelLocked: lv.needs && !PROG[lv.needs].cleared) */
  const succ = LEVELS.find(l => l.needs && l.needs !== 'wood' && l.needs !== 'marsh' && !l.hidden && LEVELS.some(q => q.id === l.needs)), pre = succ.needs;
  const locked = p => !!(succ.needs && !(p[succ.needs] && p[succ.needs].cleared) && !(p[succ.id] && p[succ.id].cleared));
  const st2 = new Store({ [K(0)]: JSON.stringify(played()) }); ok(locked(JSON.parse(st2.getItem(K(0)))), 'C: before: ' + succ.id + ' is locked on his road (needs ' + pre + ')');
  const L = CS.newLedger(CS.cleanSnapshot(CS.snapshotOf(played(), 'warden', 0))); CS.noteClear(L, pre); CS.noteClear(L, 'notALevel');
  const rr = CS.applyCredit(st2, K(0), CS.nextCredit(L), opts); const p2 = JSON.parse(st2.getItem(K(0)));
  ok(rr.ok && !locked(p2) && p2[pre].cleared && p2.done.warden[pre] === 1, 'C: after a clear WITH A FRIEND, ' + succ.id + ' is open on his road');
  ok(!('notALevel' in p2) && !p2.done.warden.notALevel, 'C: an id that is no level is not written');
  /* a fresh one: no save in the slot */
  const st3 = new Store(), Lf = CS.newLedger(CS.freshSeat('ranger', 4)); Lf.view.xp.ranger = 90; Lf.view.coins = 7; CS.noteClear(Lf, 'wood');
  const rf = CS.applyCredit(st3, K(4), CS.nextCredit(Lf, null, true), opts), pf = JSON.parse(st3.getItem(K(4)) || 'null');
  ok(rf.ok && rf.fresh && pf && pf.hero === 'ranger' && pf.heroes.ranger && pf.xp.ranger === 90 && pf.coins === 7 && pf.wood.cleared && pf.progressionVersion === PROGRESSION_VERSION, 'C: a slot with NO SAVE gets a fresh one, his ranger in it: ' + JSON.stringify(pf && { hero: pf.hero, xp: pf.xp, coins: pf.coins }));
  const re = migrateProgress(st3.getItem(K(4)), CAMP); ok(re && !re.changed, 'C: ...and it opens clean as a current save');
  /* an old save (version 0: talents, no progressionVersion) is migrated through loadProgress, its backup kept */
  const v0 = JSON.stringify({ hero: 'knight', heroes: { knight: true }, coins: 30, wood: { cleared: true } }), st4 = new Store({ [K(2)]: v0 });
  const L4 = CS.newLedger(CS.cleanSnapshot(CS.snapshotOf(migrateProgress(v0, CAMP).progress, 'knight', 2))); L4.view.xp.knight += 40;
  const r4 = CS.applyCredit(st4, K(2), CS.nextCredit(L4, null, true), opts), p4 = JSON.parse(st4.getItem(K(2)));
  const bk = [...st4.m.keys()].find(k => k.startsWith(K(2) + '.before-progression-'));
  ok(r4.ok && p4.progressionVersion === PROGRESSION_VERSION && p4.wood.cleared && bk && st4.getItem(bk) === v0, 'C: an OLD save is migrated (its exact raw text kept as the backup) and credited');
  /* the legacy single save (slot 1 before slots) */
  const st5 = new Store({ 'bracken.progress': JSON.stringify(played()) }); const L5 = CS.newLedger(CS.cleanSnapshot(CS.snapshotOf(played(), 'warden', 0))); L5.view.coins += 3;
  const r5 = CS.applyCredit(st5, K(0), CS.nextCredit(L5, null, true), opts); ok(r5.ok && JSON.parse(st5.getItem(K(0))).coins === 143 && JSON.parse(st5.getItem(K(0))).guestSentinel === 'keep me', 'C: the legacy single save is slot 1 and is credited as one');
  /* refused: damaged, newer; the full disk */
  const dam = '{"hero":"knight", broken', st6 = new Store({ [K(1)]: dam }); const r6 = CS.applyCredit(st6, K(1), C1, opts);
  ok(!r6.ok && /DAMAGED/.test(r6.why) && st6.getItem(K(1)) === dam, 'C: a DAMAGED slot is refused, told, and not written: ' + r6.why);
  const newer = JSON.stringify({ progressionVersion: PROGRESSION_VERSION + 1 }), st7 = new Store({ [K(1)]: newer }); const r7 = CS.applyCredit(st7, K(1), C1, opts);
  ok(!r7.ok && /NEWER/.test(r7.why) && st7.getItem(K(1)) === newer, 'C: a slot from a NEWER BRACKEN is refused, told, and not written');
  const st8 = new Store({ [K(1)]: raw }); st8.full = true; const r8 = CS.applyCredit(st8, K(1), C1, opts);
  ok(!r8.ok && r8.full && /STORAGE FULL/.test(r8.why) && st8.getItem(K(1)) === raw, 'C: a FULL disk is told (SAVE FAILED - STORAGE FULL) and the slot is as it was');
  for (const junk of [null, {}, { ...C1, sid: '../x' }, { ...C1, seq: 0 }, { ...C1, xp: -1 }, { ...C1, hero: 'dragon' }, { ...C1, clears: 'wood' }]) ok(!CS.applyCredit(new Store({ [K(1)]: raw }), K(1), junk, opts).ok, 'C: a credit that cannot be read is ignored: ' + JSON.stringify(junk).slice(0, 50));
  const cl = CS.cleanCredit({ ...C2, clears: ['marsh', '__proto__', 'a/b', 'marsh'] }); ok(cl && cl.clears.join() === 'marsh', 'C: a clear id that is no id is dropped');
  /* xpOnly: the LINKED AI COMPANION earns XP and levels only */
  const st9 = new Store({ [K(3)]: raw }); const r9 = CS.applyCredit(st9, K(3), C2, { ...opts, xpOnly: true }), p9 = JSON.parse(st9.getItem(K(3)));
  ok(r9.ok && p9.xp.warden === xpFloor(7) + 300 && p9.coins === 140 && !p9.marsh, 'C: xpOnly (a linked companion) pays XP, not silver or clears');
  /* the XP cap */
  const top = played(); top.xp.warden = xpCap() - 10; const st10 = new Store({ [K(1)]: JSON.stringify(top) }), L10 = CS.newLedger(CS.cleanSnapshot(CS.snapshotOf(top, 'warden', 1))); L10.view.xp.warden += 500;
  CS.applyCredit(st10, K(1), CS.nextCredit(L10, null, true), opts); ok(JSON.parse(st10.getItem(K(1))).xp.warden === xpCap(), 'C: XP stops at level fifty');
  /* the remembered sessions are capped */
  const st11 = new Store({ [K(1)]: raw }); for (let i = 0; i < CS.MAX_CREDIT_SESSIONS + 6; i++) CS.applyCredit(st11, K(1), { v: 1, sid: 'S' + i, seq: 1, hero: 'warden', xp: 1, coins: 0, clears: [] }, { ...opts, now: 1000 + i });
  const b11 = JSON.parse(st11.getItem(K(1))).coopCredit; ok(Object.keys(b11).length === CS.MAX_CREDIT_SESSIONS && b11['S' + (CS.MAX_CREDIT_SESSIONS + 5)] && !b11.S0, 'C: the slot remembers the newest ' + CS.MAX_CREDIT_SESSIONS + ' sessions');
  ok(CS.creditLine(1, { xp: 40, coins: 3, clears: ['a'] }) === 'SAVE 2: +40 XP, +3 SILVER, 1 WOOD CLEARED' && CS.creditLine(0, { xp: 0, coins: 0, clears: [] }) === '', 'C: the toast line says it: ' + CS.creditLine(1, { xp: 40, coins: 3, clears: ['a'] }));
  /* (claude/coopclarity) the pickers say what happens, the toast says where it went, the win card's cell says whose save */
  { const sm = { state: 'ok', hero: 'pyro', level: 6 }, nm = h => h.toUpperCase();
    ok(CS.summaryLine(1, sm, nm) === 'SAVE 2 - PYRO LV 6: EARNS XP, SILVER + CLEARS INTO SAVE 2', 'C2: a save line says what is earned and where it goes: ' + CS.summaryLine(1, sm, nm));
    ok(CS.summaryLine(0, { state: 'empty' }, nm) === 'SAVE 1 - EMPTY: A NEW SAVE STARTS HERE' && /IN USE ELSEWHERE$/.test(CS.summaryLine(2, sm, nm, true)) && /DAMAGED/.test(CS.summaryLine(3, { state: 'corrupt' }, nm)), 'C2: empty / held / damaged lines');
    ok(/NOTHING IS SAVED/.test(CS.GUEST_LINE) && /NOTHING IS SAVED/.test(CS.VISIT_LINE) && CS.HOST_NOTE === 'GUESTS NEVER CHANGE YOUR SAVE' && CS.EXPLAIN_LINES.length === 3, 'C2: guest / visit / host lines');
    ok(CS.creditToast(2, 1, { xp: 120, coins: 40, clears: [] }) === 'P2 +120 XP, +40 SILVER SAVED TO SAVE 2' && CS.creditToast(2, 1, { xp: 0, coins: 0, clears: [] }) === '', 'C2: the checkpoint toast: ' + CS.creditToast(2, 1, { xp: 120, coins: 40, clears: [] }));
    ok(CS.savedTo(2) === 'SAVE 3' && CS.savedTo(-1) === 'GUEST' && CS.savedTo(-1, true) === 'GUEST - NOT SAVED', 'C2: the win card SAVED TO cell'); }
}

// ---------- D. the locks ----------
{
  const hub = []; const chan = () => { const c = { onmessage: null, postMessage: m => { for (const o of hub) if (o !== c && o.onmessage) o.onmessage({ data: JSON.parse(JSON.stringify(m)) }); } }; hub.push(c); return c; };
  let t = 0; const now = () => t;
  const game = CS.makeLocks({ id: 'game', channel: chan(), now }), guest = CS.makeLocks({ id: 'guest', channel: chan(), now });
  ok(game.claim(0, 'game', 'THE GAME', 'p1').ok, 'D: the game holds its own slot 1');
  const g0 = guest.claim(0, 'guest', 'ONLINE'); ok(!g0.ok && g0.holder.kind === 'game', 'D: a guest page in another tab cannot take it: ' + CS.lockLine(0, g0.holder));
  ok(guest.claim(1, 'guest', 'ONLINE').ok, 'D: ...it takes slot 2');
  ok(!game.claim(1, 'seat', 'P2', 'seat2').ok, 'D: and the game cannot seat slot 2 locally while the guest page plays it');
  const s0 = game.claim(0, 'seat', 'P2', 'seat2'); ok(!s0.ok && s0.holder.here && /ALREADY PLAYING HERE/.test(CS.lockLine(0, s0.holder)), 'D: a local seat cannot take player one\'s slot: ' + CS.lockLine(0, s0.holder));
  ok(game.claim(2, 'seat', 'P2', 'seat2').ok && !game.claim(2, 'seat', 'P3', 'seat3').ok, 'D: P2 holds slot 3; P3 cannot take it too');
  ok(game.claim(3, 'seat', 'P2', 'seat2').ok && !game.holder(2, 'seat3'), 'D: a role takes one slot: P2 moving to slot 4 frees slot 3');
  const late = CS.makeLocks({ id: 'late', channel: chan(), now }); late.ask();
  ok(late.holder(0) && late.holder(0).kind === 'game' && late.holder(1).kind === 'guest', 'D: a page that opens later asks WHO and hears every claim');
  game.release(3, 'seat2'); ok(!late.holder(3) && late.claim(3, 'game', 'THE GAME', 'p1').ok, 'D: a released slot is free');
  t = CS.LOCK_TTL + 1; ok(!game.holder(1), 'D: a claim nobody has repeated for ' + CS.LOCK_TTL / 1000 + ' s (the tab crashed) expires');
  guest.beat(); ok(game.holder(1) && game.holder(1).kind === 'guest', 'D: ...and a heartbeat keeps it');
  const solo = CS.makeLocks({ id: 'solo' }); ok(solo.claim(0, 'game').ok && !solo.claim(0, 'seat', '', 'seat2').ok, 'D: without a channel (old browser) the page still guards its own seats');
}

// ---------- E. the local slot pick ----------
{
  const st = new Store({ [K(0)]: JSON.stringify(played()), [K(2)]: '{"broken', [K(3)]: JSON.stringify({ progressionVersion: 99 }) });
  const sums = [0, 1, 2, 3, 4].map(i => CS.slotSummary(CS.slotRawOf(st, i), CAMP));
  ok(sums[0].state === 'ok' && sums[0].hero === 'warden' && sums[0].level === 7 && sums[0].woods === 1 && sums[1].state === 'empty' && sums[2].state === 'corrupt' && sums[3].state === 'newer', 'E: each slot summarised: ' + sums.map((s, i) => CS.summaryLine(i, s)).join(' | '));
  const a = CS.seatFromSlot(st, 0, 'warden', CAMP), b = CS.seatFromSlot(st, 1, 'knight', CAMP), c = CS.seatFromSlot(st, 2, 'knight', CAMP);
  ok(a && a.base.xp === xpFloor(7) && a.slot === 0 && b && b.base.xp === 0 && b.slot === 1 && c === null, 'E: seatFromSlot: a played slot seats its hero, an empty one a fresh hero, a damaged one nobody');
  ok(st.getItem(K(1)) === null && st.length === 3, 'E: reading slots for the pick writes nothing');
}

if (fails.length) { for (const f of fails) console.log('FAIL ' + f); console.log('coop-progress: ' + fails.length + ' failed'); process.exit(1); }
console.log('coop-progress: OK - snapshot (one hero, host trusts none of it), ledger (cumulative, carry held back), credit (XP/silver/clears + road, never double, lost covered, fresh, migrated, damaged/newer/full told, xpOnly), locks, local slot pick');
