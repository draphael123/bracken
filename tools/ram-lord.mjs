// tools/ram-lord.mjs - THE RAM LORD, REWORKED (claude/scree2, src/ram-lord.js; Daniel 10-08 "the boss could be better").
//   NODE  he is a DUELIST off the chip (FULL_DAMAGE, with its reason) whose horns guard by angle (GUARD 'horns': beaten from behind or from the air, never
//         from his front on the ground); his openings are STUNNED (the cliff) and the wall crash, read by the boss rule (OPEN_RULE); his two overhangs stand
//         inside the fold, their fall lines inside it and clear of each other, a hero's knock spot outside its own line; no flock call (no adds) - his
//         one new move a phase is in updateRam (P2 off the wall, P3 the horn sweep); the stile's sign tells the overhang (A6).
//   PAGE  in his fight (god mode, foes his own): the prop does nothing while he is not in its line... a knock with him under it STUNS him (gold, x2: a blow
//         lands twice what it does from behind), then he is WARDED (every blade turned) and the overhang is spent, loosening again later; a blade from his
//         front is turned, from behind it lands; at two-thirds the fold's floor becomes scree running to the banked wall; at a third told rocks rain (each
//         with its ring) and he sweeps his horns.
//   PORT=8741 node tools/ram-lord.mjs     exit 1 on any failure
import { LEVELS } from '../src/level.js';
import { FULL_DAMAGE, OPEN_RULE } from '../src/boss-greed.js';
import { GUARD } from '../src/boss-read.js';
import { RAM, LIP, ramLips, lipSpot, inZone, ramGuard, ramOpenMode } from '../src/ram-lord.js';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
console.log('== NODE');
const L = LEVELS.find(l => l.id === 'scree').build(), A = L.arena;
ok(typeof FULL_DAMAGE.ram === 'string' && FULL_DAMAGE.ram.length > 40, 'off the chip: FULL_DAMAGE.ram with its reason');
ok(GUARD.ram === 'horns', 'his horns guard by angle (GUARD horns)');
ok(OPEN_RULE.ram && ramOpenMode({ mode: 'stun' }) && ramOpenMode({ mode: 'crash' }) && !ramOpenMode({ mode: 'pace' }), 'his openings: stunned (the cliff) and the wall crash');
{ const e = { x: 100, face: 1, mode: 'pace' }; ok(ramGuard(e, 130, false) === 'horns' && ramGuard(e, 70, false) === null && ramGuard(e, 130, true) === null && ramGuard({ ...e, ward: 1 }, 70, false) === 'ward' && ramGuard({ ...e, mode: 'stun' }, 130, false) === null, 'the front at his height turns, behind or from the air lands, the ward turns everything, an opening takes everything'); }
const lips = ramLips(A);
ok(lips.length === 2 && lips.every(l => l.z0 >= A.x0 + 16 && l.z1 <= A.x1 - 16 && !inZone(l, lipSpot(l)) && lipSpot(l) > A.x0 + 16 && lipSpot(l) < A.x1 - 16), 'two overhangs, their fall lines inside the fold, each knock spot inside the fold and off its own line');
ok(lips[0].z1 < lips[1].z0, 'the two fall lines do not overlap');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), upd = main.slice(main.indexOf('function updateRam'), main.indexOf('function traceBeams'));
ok(!/'callTell'; e\.modeT/.test(upd) && /sweepTell/.test(upd) && /RLD\.ramStep/.test(upd), 'no flock call (no adds); the horn sweep and the overhang step are in his update');
ok(L.ents.some(e => e.t === 'sign' && /OVERHANG/.test(e.text || '') && /PROP/.test(e.text || '')), 'the stile\'s sign tells the overhang and its prop');
ok(RAM.stunT >= 3 && RAM.wardT >= 2.5 && RAM.wardT <= 3.5 && LIP.rearm >= 5, 'the stun is >= 3 s, the ward ~3 s (B3), a spent overhang loosens again after >= 5 s');
console.log('== PAGE');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const RL = await import('/src/ram-lord.js');
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'scree')); BK.state = 'play'; BK.god = true; BK.sim(5);
    const L = BK.level, A = L.arena, TS = 16, out = {};
    for (const e of BK.enemies()) if (!e.boss && e.t !== 'ram') e.alive = false;
    BK.tp(Math.floor((A.x0 + A.x1) / 2 / TS), Math.round(A.floor / TS) - 1); for (let i = 0; i < 200 && !BK.bossActive; i++) BK.sim(1);
    const b = BK.boss; out.active = !!BK.bossActive && b && b.t === 'ram'; BK.sim(120);
    const lips = BK.ramLips(); out.lips = lips.length; const lip = lips[0], k = BK.keys, P = BK.P;
    const freeze = () => { b.mode = 'pace'; b.modeT = 99; b.vx = 0; b.y = A.floor; b.ward = 0; };
    /* the ram away from the line: a knock drops rock on nothing */
    freeze(); b.x = (A.x0 + A.x1) / 2; P.x = RL.lipSpot(lip); P.y = A.floor; P.face = lip.side; BK.sim(2); BK.press('atk'); for (let i = 0; i < 60; i++) { freeze(); BK.sim(1); }
    out.awayState = lip.state; out.awayMode = b.mode;
    lip.state = 'armed'; lip.t = 0; lip.hitBy = false;
    /* the ram in the line: STUNNED */
    freeze(); b.x = (lip.z0 + lip.z1) / 2; P.x = RL.lipSpot(lip); P.face = lip.side; BK.sim(2); BK.press('atk'); let stunAt = -1;
    for (let i = 0; i < 90; i++) { if (b.mode !== 'stun') { b.modeT = 99; b.vx = 0; b.x = (lip.z0 + lip.z1) / 2; } BK.sim(1); if (b.mode === 'stun' && stunAt < 0) stunAt = i; }
    out.stun = b.mode === 'stun'; out.stunAt = stunAt; out.open = BK.bossOpen(b); out.lipAfter = lip.state;
    /* x2 in the stun against the same blow from behind outside it */
    const hold = (f, m) => { b.face = f; if (m) { b.mode = m; b.modeT = 99; } b.vx = 0; };   /* he paces toward you: held facing one way for the swing */
    const hit = (m) => { const f = b.face || 1, h0 = b.hp; P.x = b.x - f * 30; P.face = f; P.y = A.floor; for (let i = 0; i < 10; i++) { hold(f, m); BK.sim(1); } BK.press('atk'); for (let i = 0; i < 30; i++) { hold(f, m); BK.sim(1); } return h0 - b.hp; };
    out.stunHit = hit('stun');
    b.ward = 0; b.greedLog = []; out.behindHit = hit('pace');
    /* the front, at his height: turned */
    b.ward = 0; { const f = b.face || 1, h0 = b.hp; P.x = b.x + f * 30; P.face = -f; P.y = A.floor; for (let i = 0; i < 10; i++) { hold(f, 'pace'); BK.sim(1); } BK.press('atk'); for (let i = 0; i < 30; i++) { hold(f, 'pace'); BK.sim(1); } out.frontHit = h0 - b.hp; }
    /* the stun ends: WARDED, and a blade from behind is turned */
    b.mode = 'stun'; b.modeT = 0.05; BK.sim(8); out.ward = b.ward; out.wardHit = hit('pace');
    /* the phases change the fold */
    b.ward = 0; b.hp = Math.floor(b.maxHp * 0.6); for (let i = 0; i < 4; i++) { b.modeT = 99; BK.sim(1); } out.p2 = b.phase; out.floor = (L.scree || []).some(z => z.ramFold);
    b.hp = Math.floor(b.maxHp * 0.3); let rain = 0; for (let i = 0; i < 300; i++) { b.modeT = 99; b.mode = 'pace'; BK.sim(1); rain = Math.max(rain, BK.rocks().filter(q => q.tx !== undefined && q.thrown).length); }
    out.p3 = b.phase; out.rain = rain; out.errors = 0; return out; })()`, 600000);
  console.log(JSON.stringify(r));
  ok(r.active && r.lips === 2, 'his fight starts and the fold has its two overhangs');
  ok(r.awayState !== 'armed' && r.awayMode !== 'stun', 'a knock with him off the line drops the rock on nothing (' + r.awayState + ', he is ' + r.awayMode + ')');
  ok(r.stun && r.open && r.stunAt >= 25 && r.stunAt <= 70, 'a knock with him under it (the press, the swing coming round, then the creak): the overhang comes down (' + r.stunAt + ' frames from the press) and he is STUNNED - open');
  ok(r.lipAfter === 'spent', 'the overhang is spent after it falls');
  ok(r.frontHit === 0, 'a blade from his front at his height is turned (' + r.frontHit + ')');
  ok(r.behindHit > 0 && r.stunHit >= r.behindHit * 3, 'from behind it lands (' + r.behindHit + '); stunned the same blow lands x2 the full blow - x4 the angle\'s half (' + r.stunHit + ')');
  ok(r.ward > 1.5 && r.wardHit === 0, 'the stun over, he is WARDED (' + (+r.ward).toFixed(1) + ' s) and a blade from behind is turned');
  ok(r.p2 >= 2 && r.floor, 'at two-thirds the fold slides: its floor is scree');
  ok(r.p3 === 3 && r.rain >= 1, 'at a third the cliff comes down: told rocks rain on the fold (' + r.rain + ' at once)');
  ok(!pg.errors.length, 'no page errors' + (pg.errors.length ? ': ' + pg.errors[0] : ''));
} finally { await pg.close(); }
console.log(fails ? '\nFAIL  ram-lord: ' + fails : '\nok  ram-lord: a beast duelist off the chip, guarding by angle; the cliff stuns him (gold, x2), the wall too, a ward after each; three phases change the fold');
process.exit(fails ? 1 : 0);
