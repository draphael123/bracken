// tools/wicker-queen.mjs - THE WICKER QUEEN, the Harvest Fair's boss (claude/fair3, L3). src/wicker-queen.js is the fight, docs/briefs/harvest-fair.md the brief.
// PURE (src/wicker-queen.js, no page):
//   - FROZEN WHEN FACED: over a long fuzz with the hero turning at random, she never moves a pixel on a frame a hero looks at her; CO-OP any hero facing
//     her freezes her, and she creeps only when every hero has his back to her
//   - THE RIBBONS TURN WHILE SHE IS FROZEN: a hero who never takes his eyes off her is still lashed, low and high
//   - EVERY ATTACK IS TOLD, with the right mark, answer and height: the sickle (!!, dodge = look, low), the low lash (!!, jump, low), the high lash (!!, duck,
//     high), the crowning (no mark: it throws no blow); each blow comes only after its own windup has run its full told time; the ribbon bands catch a
//     standing hero and miss a jumping one (low) or a ducked one (high)
//   - THE BONFIRE OPENING, ONLY BY FREEZING HER ON THE EMBERS: lured across and frozen on them she catches and burns open (a blow worth more); crossing
//     them unseen, frozen short of them, left alone for a minute, or frozen on them again while they are banked, opens nothing
//   - PHASE 2 (full dark): the look freezes her only NEAR the hero; PHASE 3 (alight): faster, and fire left behind her
//   - THE CROWNING never has more than two of hers alive
// THE LEVEL: the green is her arena (walls, trigger past the door), the door checkpoint stands before it, the elite still guards the door, she is in
//   it, her relic (the fair's one relic slot) waits for her death, and the gate ends the level after it
// IN THE PAGE: the fight wakes past the door; faced she does not move and co-op one facing holds her; her lash hurts a standing hero while he looks at
//   her and passes over a jumping (low) or ducked (high) one; the sickle from behind hurts; lured onto the embers and faced she burns and a blow bites
//   harder; phase two darkens the green and only a near look holds her; phase three lays fire; the crowning keeps two at most; her death drops the relic,
//   the gate opens and walking to it clears the level.
//   node tools/wicker-queen.mjs        (PORT from tools/ports.mjs)
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import * as W from '../src/wicker-queen.js';
import { MARK, ANSWER, HEIGHT, QUIET } from '../src/marks.js';
import { LEVELS } from '../src/level.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, FLOOR = 448;
const A = { x0: 9968, x1: 10672, floor: FLOOR }, EMB = W.embersOf(10472);
const hero = (x, face, o = {}) => ({ x, y: FLOOR, face, alive: true, ...o });
/* a queen and a world. The host moves her by vx; `log` counts what the world was asked to do */
function rig(o = {}) {
  const e = W.newWickerQueen({ t: 'wickerqueen', x: o.x ?? 10600, y: FLOOR, hp: o.hp ?? W.WQ.hp, maxHp: W.WQ.hp, alive: true, face: -1 });
  e.mode = o.mode || 'still'; if (o.lashCd !== undefined) e.lashCd = o.lashCd; if (o.crownCd !== undefined) e.crownCd = o.crownCd;
  const log = { hits: [], lash: [], fires: 0, summons: 0, adds: 0, says: [] };
  const c = { heroes: o.heroes || [hero(10300, -1)], A, embers: o.embers === undefined ? EMB : o.embers, canStep: () => true,
    say: t => log.says.push(t), sound: () => {}, hit: (box, d, name) => log.hits.push({ box, d, name }), lash: (kind, r0, r1) => log.lash.push({ kind, r0, r1 }),
    fire: () => log.fires++, summon: n => { log.summons += n; log.adds = Math.min(99, log.adds + n); }, adds: () => log.adds };
  const step = () => { const ev = W.updateWickerQueen(e, DT, c); e.x = Math.max(A.x0 + 16, Math.min(A.x1 - 16, e.x + e.vx * DT)); return ev; };
  return { e, c, log, step };
}

// ---- FROZEN WHEN FACED (fuzz), and CO-OP ----
{ let movedSeen = 0, moves = 0, frames = 0; const r = rig({ lashCd: 1e9, crownCd: 1e9, embers: null });
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60 * 90; i++) { if (rnd() < 0.03) r.c.heroes[0].face *= -1; if (rnd() < 0.01) r.c.heroes[0].x = 10000 + rnd() * 600;
    const x0 = r.e.x; r.step(); frames++; const seen = r.e.seen; if (r.e.x !== x0) { moves++; if (seen && r.e.mode !== 'rise') movedSeen++; }
    if (r.e.mode === 'sickle' || r.e.mode === 'recover') { r.e.mode = 'still'; r.e.x = 10600; } }
  ok(moves > 200, 'the fuzz never let her move (' + moves + ' moving frames): the test is not testing anything');
  ok(movedSeen === 0, 'she moved on ' + movedSeen + ' frames a hero was looking at her (of ' + frames + ')');
  // co-op: one facing her holds her; both away lets her creep
  const one = rig({ lashCd: 1e9, crownCd: 1e9, heroes: [hero(10300, -1), hero(10400, 1)] }); const x1 = one.e.x; for (let i = 0; i < 120; i++) one.step();
  ok(one.e.x === x1 && one.e.mode === 'still', 'co-op: one hero facing her did not hold her: moved ' + (x1 - one.e.x));
  const both = rig({ lashCd: 1e9, crownCd: 1e9, heroes: [hero(10300, -1), hero(10400, -1)] }); const x2 = both.e.x; for (let i = 0; i < 60; i++) both.step();
  ok(both.e.x < x2 - 20 && both.e.mode === 'creep', 'co-op: with both backs turned she did not creep: ' + (x2 - both.e.x) + ' px, ' + both.e.mode);
  const dead = rig({ lashCd: 1e9, crownCd: 1e9, heroes: [hero(10300, -1), hero(10400, 1, { alive: false })] }); const x3 = dead.e.x; for (let i = 0; i < 60; i++) dead.step();
  ok(dead.e.x < x3 - 20, 'co-op: a dead partner facing her held her'); }

// ---- THE RIBBONS TURN WHILE SHE IS FROZEN; every attack told, with its mark, answer and height ----
{ const r = rig({ heroes: [hero(10300, 1)], crownCd: 1e9, embers: null }); const kinds = new Set(); let tellFrames = {}, cur = null, blowAfterShort = 0, moved = 0;
  for (let i = 0; i < 60 * 30; i++) { const x0 = r.e.x; const ev = r.step(); if (r.e.x !== x0) moved++;
    if (r.e.mode.endsWith('Tell')) { tellFrames[r.e.mode] = (tellFrames[r.e.mode] || 0) + 1; cur = r.e.mode; }
    for (const v of ev) if (v.t === 'lash') { kinds.add(v.kind); const want = v.kind === 'low' ? 'lashLowTell' : 'lashHighTell'; if (cur !== want || (tellFrames[want] || 0) < W.WQ.lashTell * 60 - 1) blowAfterShort++; tellFrames[want] = 0; } }
  ok(moved === 0, 'she moved while a hero looked at her the whole time (' + moved + ' frames)');
  ok(kinds.has('low') && kinds.has('high'), 'the ribbons did not turn while she was frozen, low and high: ' + [...kinds]);
  ok(r.log.lash.length > 20 && r.log.lash.some(l => l.r1 >= W.WQ.lashReach - 1), 'the lash never swept the green');
  ok(blowAfterShort === 0, blowAfterShort + ' lash(es) flew without their full told windup'); }
{ const r = rig({ heroes: [hero(10560, -1)], lashCd: 1e9, crownCd: 1e9, embers: null }); let glowFrames = 0, hitAt = null;   // the sickle, from behind
  for (let i = 0; i < 240 && hitAt === null; i++) { r.step(); if (r.e.mode === 'sickleTell') glowFrames++; if (r.log.hits.length) hitAt = i; }
  ok(hitAt !== null && r.log.hits[0].name === 'THE SICKLE' && r.log.hits[0].d === W.WQ.dmg.sickle, 'the sickle never came from behind: ' + JSON.stringify(r.log.hits));
  ok(glowFrames >= W.WQ.glow * 60 - 1, 'the sickle came after only ' + glowFrames + ' frames of its red glow');
  const q = rig({ heroes: [hero(10560, -1)], lashCd: 1e9, crownCd: 1e9, embers: null }); let glowed = false;
  for (let i = 0; i < 240; i++) { q.step(); if (q.e.mode === 'sickleTell' && !glowed) { glowed = true; q.c.heroes[0].face = 1; } }
  ok(glowed && q.log.hits.length === 0 && q.e.mode === 'still', 'a look during the glow did not cancel the sickle: ' + JSON.stringify({ glowed, hits: q.log.hits.length, mode: q.e.mode })); }
{ ok(MARK['wickerqueen|sickleTell'] === '!!' && ANSWER['wickerqueen|sickleTell'] === 'dodge' && HEIGHT['wickerqueen|sickleTell'] === 'low', 'THE SICKLE is not !! / dodge (the look) / low in src/marks.js');
  ok(MARK['wickerqueen|lashLowTell'] === '!!' && ANSWER['wickerqueen|lashLowTell'] === 'jump' && HEIGHT['wickerqueen|lashLowTell'] === 'low', 'THE LOW LASH is not !! / jump / low in src/marks.js');
  ok(MARK['wickerqueen|lashHighTell'] === '!!' && ANSWER['wickerqueen|lashHighTell'] === 'duck' && HEIGHT['wickerqueen|lashHighTell'] === 'high', 'THE HIGH LASH is not !! / duck / high in src/marks.js');
  ok(MARK['wickerqueen|crownTell'] === '' && !ANSWER['wickerqueen|crownTell'], 'THE CROWNING wears a mark (it throws no blow)');
  const stand = { t: FLOOR - 14, b: FLOOR }, duck = { t: FLOOR - 8, b: FLOOR }, jump = { t: FLOOR - 40, b: FLOOR - 18 };
  ok(W.lashCatches('low', FLOOR, stand) && !W.lashCatches('low', FLOOR, jump) && W.lashCatches('low', FLOOR, duck), 'the LOW ribbon: catches a standing or ducked hero, misses a jumping one');
  ok(W.lashCatches('high', FLOOR, stand) && !W.lashCatches('high', FLOOR, duck), 'the HIGH ribbon: catches a standing hero, misses a ducked one');
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), wu = main.split('\n').find(l => l.startsWith('const windingUp ='));
  ok(/e\.t === 'wickerqueen' && typeof e\.mode === 'string' && e\.mode\.endsWith\('Tell'\)/.test(wu), 'her tells are not in windingUp() (rule A2: they would wind up in silence)'); }

// ---- THE BONFIRE: the only opening, and only by freezing her ON the embers ----
const lure = (turnAt, o = {}) => { const r = rig({ lashCd: 1e9, crownCd: 1e9, ...o }); const h = r.c.heroes[0]; let turned = false, open = 0, modes = new Set();
  for (let i = 0; i < 60 * 12; i++) { if (!turned && turnAt(r.e)) { h.face = 1; turned = true; } r.step(); modes.add(r.e.mode); open = Math.max(open, r.e.open || 0); if (r.e.mode === 'burn') break; }
  return { r, modes, open, x: r.e.x }; };
{ const on = lure(e => W.onEmbers(e.x, EMB) && e.x < EMB.mid);
  ok(on.modes.has('catch') && on.r.e.mode === 'burn' && on.open > 3, 'lured across and frozen on the embers she did not burn open: ' + JSON.stringify({ modes: [...on.modes], open: on.open }));
  ok(W.wqTake(on.r.e) === W.WQ.burnMul && W.wqTake({ mode: 'still' }) === W.WQ.ward && W.WQ.burnMul / W.WQ.ward > 5, 'a blow in the burn is not worth far more than against the standing wicker');
  const early = lure(e => e.x < EMB.x1 + 30 && !W.onEmbers(e.x, EMB));   // turned while she is still short of the embers: frozen off them
  let still = 0; for (let i = 0; i < 120; i++) { early.r.step(); if (early.r.e.mode === 'still') still++; }
  ok(!early.modes.has('catch') && early.r.e.mode === 'still', 'frozen SHORT of the embers she caught anyway: ' + [...early.modes]);
  const unseen = rig({ lashCd: 1e9, crownCd: 1e9, heroes: [hero(10200, -1)] }); const um = new Set(); for (let i = 0; i < 60 * 8; i++) { unseen.step(); um.add(unseen.e.mode); if (unseen.e.mode === 'sickleTell') break; }
  ok(unseen.e.x < EMB.x0 && !um.has('catch') && !um.has('burn'), 'crossing the embers UNSEEN opened her: ' + [...um]);
  const alone = rig({ heroes: [hero(10300, 1)], embers: null }); let op = 0; for (let i = 0; i < 60 * 60; i++) { alone.step(); op = Math.max(op, alone.e.open || 0); if (alone.e.mode === 'sickle') alone.e.mode = 'still'; }
  ok(op === 0 && !alone.e.n.burn, 'A11: left to her own attacks for a minute she opened by herself: ' + op);
  // after a burn the embers are BANKED: frozen on them again at once, nothing
  const r = on.r; for (let i = 0; i < 60 * 5 && r.e.mode !== 'still'; i++) r.step();
  ok(r.e.bank > 0 && !W.onEmbers(r.e.x, EMB), 'after the burn she was not flung off the embers, or they were not banked: ' + JSON.stringify({ x: r.e.x, bank: r.e.bank }));
  r.e.x = EMB.mid; r.c.heroes[0].face = 1; r.c.heroes[0].x = EMB.mid - 150; for (let i = 0; i < 30; i++) r.step();
  ok(r.e.mode !== 'catch' && r.e.mode !== 'burn', 'frozen on BANKED embers she caught again at once'); }

// ---- PHASE 2: the look holds her only near; PHASE 3: faster, and fire behind her ----
{ const far = rig({ hp: W.WQ.hp * 0.6, lashCd: 1e9, crownCd: 1e9, heroes: [hero(10400, 1)], embers: null, x: 10620 }); const x0 = far.e.x; for (let i = 0; i < 30; i++) far.step();
  ok(far.e.phase === 2 && far.e.x < x0 - 10, 'PHASE 2: a hero facing her from ' + (x0 - 10400) + ' px (past the near look) still held her');
  const nearr = rig({ hp: W.WQ.hp * 0.6, lashCd: 1e9, crownCd: 1e9, heroes: [hero(10540, 1)], embers: null, x: 10620 }); const x1 = nearr.e.x; for (let i = 0; i < 60; i++) nearr.step();
  ok(nearr.e.x === x1 && nearr.e.mode === 'still', 'PHASE 2: a hero facing her from 80 px did not hold her');
  const p1 = rig({ lashCd: 1e9, crownCd: 1e9, heroes: [hero(10400, 1)], embers: null, x: 10620 }); const x2 = p1.e.x; for (let i = 0; i < 30; i++) p1.step();
  ok(p1.e.x === x2, 'PHASE 1: the same far look did not hold her (the near rule leaked into phase one)');
  const p3 = rig({ hp: W.WQ.hp * 0.3, lashCd: 1e9, crownCd: 1e9, heroes: [hero(10100, -1)], embers: null, x: 10620 }), p1b = rig({ lashCd: 1e9, crownCd: 1e9, heroes: [hero(10100, -1)], embers: null, x: 10620 });
  for (let i = 0; i < 90; i++) { p3.step(); p1b.step(); }
  ok(p3.e.phase === 3 && (10620 - p3.e.x) > (10620 - p1b.e.x) * 1.3, 'PHASE 3: she is not faster: ' + Math.round(10620 - p3.e.x) + ' vs ' + Math.round(10620 - p1b.e.x));
  ok(p3.log.fires >= 3 && p1b.log.fires === 0, 'PHASE 3: no fire trail behind her (' + p3.log.fires + ', and phase one ' + p1b.log.fires + ')');
  const p3s = rig({ hp: W.WQ.hp * 0.3, lashCd: 1e9, crownCd: 1e9, heroes: [hero(10100, 1)], embers: null, x: 10620 }); const x3 = p3s.e.x; for (let i = 0; i < 30; i++) p3s.step();
  ok(p3s.e.x === x3, 'PHASE 3: alight, the look across the green does not hold her again'); }

// ---- THE CROWNING: at most two of hers alive ----
{ const r = rig({ heroes: [hero(10300, 1)], lashCd: 1e9, crownCd: 0.5, embers: null }); let maxAlive = 0, calls = 0;
  for (let i = 0; i < 60 * 80; i++) { const ev = r.step(); for (const v of ev) if (v.t === 'crown') calls++; if (i % 600 === 300) r.log.adds = Math.max(0, r.log.adds - 1); maxAlive = Math.max(maxAlive, r.log.adds); }
  ok(calls >= 3 && r.log.summons >= 3, 'the crowning did not call (' + calls + ' calls, ' + r.log.summons + ' mummers)');
  ok(maxAlive <= W.WQ.crownCap && W.WQ.crownCap === 2, 'the crowning left ' + maxAlive + ' of hers alive (at most two)'); }

// ---- THE LEVEL ----
const lv = LEVELS.find(l => l.id === 'fair'), L = lv.build(), G = L.green, Ar = L.arena;
{ ok(Ar && Ar.boss === 'wickerqueen', 'the green is not her arena: ' + JSON.stringify(Ar));
  if (Ar) {
    ok(Ar.wallL > G.door && Ar.wallR < 669 && Ar.trigger > Ar.wallL * 16 + 16 && Ar.x1 - Ar.x0 <= 46 * 16, 'the arena walls, trigger or width are wrong: ' + JSON.stringify(Ar));
    ok(Ar.music && Ar.music !== L.music, 'she has no music of her own (the arena plays the level track)');
    const q = L.ents.filter(e => e.t === 'wickerqueen'); ok(q.length === 1 && q[0].x * 16 > Ar.x0 && q[0].x * 16 < Ar.x1 && q[0].x > G.bonfire, 'she is not in the green, past the bonfire: ' + JSON.stringify(q));
    const cks = L.ents.filter(e => e.t === 'check').map(e => e.x);
    ok(cks.some(x => x < G.door && x >= G.door - 40) && !cks.some(x => x * 16 > Ar.x0 && x * 16 < Ar.x1), 'no door checkpoint before the green, or one inside it: ' + cks);
    ok(L.ents.some(e => e.t === 'hobbyhorse' && e.elite && e.gate === G.door), 'the elite hobby-horse no longer guards the door');
    const rel = L.ents.filter(e => e.t === 'relic'); ok(rel.length === 1 && rel[0].bossDrop && rel[0].x * 16 > Ar.x0 && rel[0].x * 16 < Ar.x1, 'her reward is not the fair\'s one relic slot, waiting in the green for her death: ' + JSON.stringify(rel));
    ok(L.gateAfterBoss && L.ents.some(e => e.t === 'gate' && e.x * 16 > Ar.x0 && e.x * 16 < Ar.x1), 'the level does not end at the gate after her death (gateAfterBoss)');
  } }

if (bad.length) { console.error('WICKER-QUEEN (pure + level): ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('wicker-queen pure + level: ok');

// ---- IN THE PAGE ----
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true;
    const fi = LEVELS.findIndex(l => l.id === 'fair'), out = {};
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const boot = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(fi); BK.start(); BK.god = true; BK.sim(5); none();
      const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.P.face = 1; BK.sim(150); return BK.boss; };
    const q = boot(), A = BK.L.arena, G = BK.L.green, fl = A.floor, emb = { x0: G.bonfire * 16 + 8 - 40, x1: G.bonfire * 16 + 8 + 40, mid: G.bonfire * 16 + 8 };
    for (const e of BK.enemies()) if (e !== q) e.alive = false;
    out.woke = { active: BK.bossActive, t: q && q.t, mode: q && q.mode, name: BK.bossName ? BK.bossName() : null };
    const hold = (x, face) => { BK.P.x = x; BK.P.y = fl; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = face; };
    q.lashCd = 99; q.crownCd = 99;
    // 1. FACED: she does not move
    let x0 = q.x; for (let i = 0; i < 180; i++) { hold(q.x - 200, 1); BK.sim(1); } out.faced = { moved: Math.abs(q.x - x0), mode: q.mode };
    // 2. BACK TURNED: she creeps
    x0 = q.x; for (let i = 0; i < 60; i++) { hold(x0 - 200, -1); BK.sim(1); } out.away = { moved: Math.round(x0 - q.x), mode: q.mode };
    // 3. THE RIBBONS while he looks at her: a standing hero is lashed, a jumping one (low) or ducked one (high) is not
    const lashAs = (kind, act) => { q.x = emb.x1 + 60; q.mode = 'still'; q.lashCd = 0; q.lashN = kind === 'low' ? 0 : 1; BK.god = false; BK.P.hp = BK.P.maxHp; BK.P.inv = 0; let hp = BK.P.hp, seen = null;
      for (let i = 0; i < 150; i++) { const standX = G.maypole * 16 + 8 + 100; if (!(act === 'jump' && !BK.P.ground)) { BK.P.x = standX; BK.P.vx = 0; } BK.P.face = 1; BK.P.inv = 0; none();
        if (q.mode === 'lash' || (q.mode.startsWith('lash') && q.modeT < 0.12)) { if (act === 'duck') K.down = true; if (act === 'jump' && BK.P.ground && q.lashR < 60) { BK.press('jump'); K.jump = true; } }
        if (act === 'jump' && !BK.P.ground) K.jump = true;
        seen = seen || q.mode; BK.sim(1); if (q.mode === 'still' && i > 70) break; }
      none(); const lost = hp - BK.P.hp; BK.god = true; BK.P.hp = BK.P.maxHp; return lost; };
    out.lash = { lowStand: lashAs('low', 'stand'), lowJump: lashAs('low', 'jump'), highStand: lashAs('high', 'stand'), highDuck: lashAs('high', 'duck') };
    q.lashCd = 99;
    // 4. THE SICKLE from behind hurts (and wore its red mark)
    BK.god = false; BK.P.hp = BK.P.maxHp; BK.P.inv = 0; q.mode = 'still'; q.x = emb.x0 - 60; let mark = null, hurt = 0;
    for (let i = 0; i < 180; i++) { hold(q.x - 18, -1); BK.P.inv = 0; const h0 = BK.P.hp; BK.sim(1); if (q.mode === 'sickleTell' && !mark) mark = BK.markOf(q); hurt += Math.max(0, h0 - BK.P.hp); if (q.mode === 'recover') break; }
    out.sickle = { mark, hurt }; BK.god = true; BK.P.hp = BK.P.maxHp;
    // 5. THE BONFIRE: lure her across, turn on the embers: she burns, and a blow bites harder than against the standing wicker
    q.mode = 'still'; q.x = emb.x1 + 70; q.bank = 0; let modes = new Set(), turned = false;
    for (let i = 0; i < 60 * 6; i++) { const f = !turned && q.x < emb.mid ? (turned = true, 1) : turned ? 1 : -1; hold(emb.x0 - 60, f); BK.sim(1); modes.add(q.mode); if (q.mode === 'burn') break; }
    out.burn = { modes: [...modes], open: q.open, mode: q.mode };
    const bite = () => { const h0 = q.hp; q.inv = 0; BKT.hurtEnemy(q, 10, q.x - 10, false); const d = h0 - q.hp; q.hp = h0; return d; };
    out.burn.bite = bite(); q.mode = 'still'; q.open = 0; out.burn.cold = bite();
    // 6. PHASE TWO: the green goes dark, and only a near look holds her
    q.hp = Math.floor(q.maxHp * 0.6); q.mode = 'still'; q.x = emb.x1 + 40; for (let i = 0; i < 20; i++) { hold(q.x - 200, 1); BK.sim(1); }
    x0 = q.x; for (let i = 0; i < 40; i++) { hold(x0 - 200, 1); BK.sim(1); } out.dark = { phase: q.phase, dark: +(BK.L.dark || 0).toFixed(2), farMoved: Math.round(x0 - q.x) };
    q.mode = 'still'; x0 = q.x; for (let i = 0; i < 60; i++) { hold(q.x - 70, 1); BK.sim(1); } out.dark.nearMoved = Math.round(Math.abs(x0 - q.x));
    // 7. PHASE THREE: alight, and fire behind her
    q.hp = Math.floor(q.maxHp * 0.3); q.mode = 'still'; q.x = A.x1 - 40; const f0 = BK.fires().length; for (let i = 0; i < 90; i++) { hold(A.x0 + 60, -1); BK.sim(1); }
    out.alight = { phase: q.phase, dark: +(BK.L.dark || 0).toFixed(2), fires: BK.fires().length - f0 };
    // 8. THE CROWNING: at most two of hers
    q.mode = 'still'; q.x = A.x1 - 40; let maxQ = 0; q.crownCd = 0;
    for (let i = 0; i < 60 * 40; i++) { hold(A.x0 + 60, 1); if (q.crownCd > 0.5) q.crownCd = 0.5; BK.P.inv = 99; BK.sim(1); maxQ = Math.max(maxQ, BK.enemies().filter(e => e.alive && e.fromQueen).length); if (i === 1200) for (const e of BK.enemies()) if (e.fromQueen) e.alive = false; }
    out.crown = { calls: q.n.crown, max: maxQ };
    // 9. CO-OP: the warden facing her holds her while the knight's back is turned
    for (const e of BK.enemies()) if (e.fromQueen) e.alive = false;
    q.hp = q.maxHp; q.mode = 'still'; q.x = emb.x1 + 60; BK.coopStart('warden', false); BK.sim(2); const [PA, PB] = BK.players(); q.lashCd = 99; q.crownCd = 99;
    const place = (fa, fb) => { PA.x = q0x - 150; PA.y = fl; PA.vx = 0; PA.face = fa; PB.x = q0x - 120; PB.y = fl; PB.vx = 0; PB.face = fb; }; const q0x = q.x;
    let m1 = 0; for (let i = 0; i < 90; i++) { place(-1, 1); BK.sim(1); m1 = Math.max(m1, Math.abs(q.x - q0x)); }
    let m2 = 0; for (let i = 0; i < 60; i++) { place(-1, -1); BK.sim(1); m2 = Math.max(m2, Math.abs(q.x - q0x)); }
    out.coop = { oneFacing: m1, bothAway: Math.round(m2) }; BK.coopEnd();
    // 10. HER DEATH: the relic, the gate, the level cleared at the gate
    for (const e of BK.enemies()) if (e.fromQueen) e.alive = false;
    const rel = () => BK.props().find(p => p.t === 'relic'); out.death = { relicHidden: !!(rel() && rel().hidden) };
    q.hp = 1; q.mode = 'burn'; q.modeT = 2; q.inv = 0; BKT.hurtEnemy(q, 50, q.x - 10, false); for (let i = 0; i < 420 && !BK.L.gateOpen; i++) { BK.P.inv = 99; BK.sim(1); }   /* the slow beat of her fall, then THE ROAD GOES ON */
    out.death.dead = !q.alive; out.death.active = BK.bossActive; out.death.relicShown = !!(rel() && !rel().hidden); out.death.relicKind = rel() && rel().kind; out.death.gateOpen = !!BK.L.gateOpen;
    const gt = BK.L.ents.find(e => e.t === 'gate'); if (rel()) { BK.P.x = rel().x; BK.P.y = fl; BK.sim(3); } out.death.gotRelic = !!(rel() && rel().got);
    BK.tp(gt.x, gt.y); for (let i = 0; i < 60 && BK.state === 'play'; i++) BK.sim(1); out.death.state = BK.state;
    out.errors = window.__errs || null;
    return out;
  })()`, 900000);
} finally { pg.close(); }
console.log(JSON.stringify(R));
ok(R.woke.active && R.woke.t === 'wickerqueen', 'the fight did not wake past the door: ' + JSON.stringify(R.woke));
ok(R.faced.moved === 0, 'faced, she moved ' + R.faced.moved + ' px in the page');
ok(R.away.moved > 20 && R.away.mode === 'creep', 'with his back turned she did not creep in the page: ' + JSON.stringify(R.away));
ok(R.lash.lowStand > 0 && R.lash.highStand > 0, 'the ribbons did not hurt a standing hero who was looking at her: ' + JSON.stringify(R.lash));
ok(R.lash.lowJump === 0, 'a hero who jumped the LOW ribbon was hurt: ' + JSON.stringify(R.lash));
ok(R.lash.highDuck === 0, 'a hero who ducked the HIGH ribbon was hurt: ' + JSON.stringify(R.lash));
ok(R.sickle.mark === '!!' && R.sickle.hurt > 0, 'the sickle from behind: ' + JSON.stringify(R.sickle));
ok(R.burn.mode === 'burn' && R.burn.modes.includes('catch') && R.burn.open > 2, 'lured onto the embers and faced she did not burn in the page: ' + JSON.stringify(R.burn));
ok(R.burn.bite > R.burn.cold * 4, 'a blow while she burns does not bite far harder than against the standing wicker: ' + JSON.stringify(R.burn));
ok(R.dark.phase === 2 && R.dark.dark >= 0.5 && R.dark.farMoved > 10 && R.dark.nearMoved === 0, 'PHASE 2 in the page (dark green, near look only): ' + JSON.stringify(R.dark));
ok(R.alight.phase === 3 && R.alight.dark < 0.2 && R.alight.fires >= 2, 'PHASE 3 in the page (alight, fire behind her): ' + JSON.stringify(R.alight));
ok(R.crown.calls >= 2 && R.crown.max > 0 && R.crown.max <= 2, 'the crowning in the page: ' + JSON.stringify(R.crown));
ok(R.coop.oneFacing === 0 && R.coop.bothAway > 10, 'co-op in the page: ' + JSON.stringify(R.coop));
ok(R.death.relicHidden && R.death.dead && !R.death.active && R.death.relicShown && R.death.relicKind && R.death.gateOpen && R.death.gotRelic, 'her death: ' + JSON.stringify(R.death));
ok(R.death.state === 'win', 'walking to the gate after her death did not clear the level: ' + R.death.state);
ok(!pg.errors || !pg.errors.length, 'page errors: ' + JSON.stringify(pg.errors));
if (bad.length) { console.error('WICKER-QUEEN (page): ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('wicker-queen: ok (pure, level and page)');
