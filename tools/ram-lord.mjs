// PAGE TOOL: launches headless Chrome
// tools/ram-lord.mjs - THE RAM LORD, REWORKED (claude/scree2, src/ram-lord.js; Daniel 10-08 "the boss could be better").
//   NODE  he is a DUELIST off the chip (FULL_DAMAGE, with its reason) whose horns guard by angle (GUARD 'horns': beaten from behind or from the air, never
//         from his front on the ground); his openings are STUNNED (the cliff) and the wall crash, read by the boss rule (OPEN_RULE); his two overhangs stand
//         inside the fold, their fall lines inside it and clear of each other, a hero's knock spot outside its own line; no flock call (no adds) - his
//         one new move a phase is in updateRam (P2 off the wall, P3 the horn sweep); the stile's sign tells the overhang (A6).
//   PAGE  in his fight (god mode, foes his own): the prop does nothing while he is not in its line... a knock with him under it STUNS him (gold, x2: a blow
//         lands twice what it does from behind), then he is WARDED (every blade turned) and the overhang is spent, loosening again later; a blade from his
//         front is turned, from behind it lands; at two-thirds the fold's floor becomes scree running to the banked wall; at a third told rocks rain (each
//         with its ring) and he sweeps his horns.
//   claude/scree3: ONE OPENING PROFILE (RAM.open: the cliff's rock and the wall slam both CRACK for the same hit, open the same window, end at the same cap), THE BOULDER BUTT (his 6th
//         move: told, sounded, hurts a standing hero, misses a jumping one, knocks a prop that stuns him), the stomp's ground-shock look (ram waves, stompFx).
//   PORT=8741 node tools/ram-lord.mjs     exit 1 on any failure
import { LEVELS } from '../src/level.js';
import { FULL_DAMAGE, OPEN_RULE } from '../src/boss-greed.js';
import { GUARD } from '../src/boss-read.js';
import { RAM, LIP, ramLips, lipSpot, inZone, ramGuard, ramOpenMode, openIn, openCap, boulderStart, boulderStep, drawRamWave, stompFx } from '../src/ram-lord.js';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
console.log('== NODE');
const L = LEVELS.find(l => l.id === 'scree').build(), A = L.arena;
ok(typeof FULL_DAMAGE.ram === 'string' && FULL_DAMAGE.ram.length > 40, 'off the chip: FULL_DAMAGE.ram with its reason');
ok(GUARD.ram === 'horns', 'his horns guard by angle (GUARD horns)');
ok(OPEN_RULE.ram && ramOpenMode({ mode: 'stun' }) && ramOpenMode({ mode: 'crash' }) && !ramOpenMode({ mode: 'pace' }), 'his openings: stunned (the cliff) and the wall crash');
{ const e = { x: 100, face: 1, mode: 'pace' }; ok(ramGuard(e, 130, false) === 'horns' && ramGuard(e, 70, false) === null && ramGuard(e, 130, true) === null && ramGuard({ ...e, ward: 1 }, 70, false) === 'ward' && ramGuard({ ...e, mode: 'stun' }, 130, false) === null, 'the front at his height is turned (x0.4, B15), behind or from the air lands, the ward is turned (x0.4), an opening takes everything'); }
const lips = ramLips(A);
ok(lips.length === 2 && lips.every(l => l.z0 >= A.x0 + 16 && l.z1 <= A.x1 - 16 && !inZone(l, lipSpot(l)) && lipSpot(l) > A.x0 + 16 && lipSpot(l) < A.x1 - 16), 'two overhangs, their fall lines inside the fold, each knock spot inside the fold and off its own line');
ok(lips[0].z1 < lips[1].z0, 'the two fall lines do not overlap');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), upd = main.slice(main.indexOf('function updateRam'), main.indexOf('function traceBeams'));
ok(!/'callTell'; e\.modeT/.test(upd) && /sweepTell/.test(upd) && /RLD\.ramStep/.test(upd), 'no flock call (no adds); the horn sweep and the overhang step are in his update');
ok(L.ents.some(e => e.t === 'sign' && /OVERHANG/.test(e.text || '') && /PROP/.test(e.text || '')), 'the stile\'s sign tells the overhang and its prop');
ok(RAM.stunT >= 3 && RAM.wardT >= 1.5 && RAM.wardT <= 3.5 && RAM.frontMul >= 0.4 && RAM.stunMul >= 4 && RAM.crashMul >= 4 && LIP.rearm >= 5, 'the stun is >= 3 s, the ward ~3 s (B3), a spent overhang loosens again after >= 5 s');
{ const O = RAM.open; ok(O && O.impact === 300 && O.t === 3.4 && O.mul === 4 && O.cap === 0.25, 'RAM.open is the one opening profile: impact 300, 3.4 s, x4, a quarter of his blood');
  ok(RAM.stunT === O.t && RAM.stunMul === O.mul && RAM.crashMul === O.mul, 'the stun and the crash read the SAME window and multiplier (no +0.8 s at the bank)');
  const ev = { x: 100, y: 0, h: 30, hp: 6000, maxHp: 6000 }, hurt = [], cc = { say() {}, sfx() {}, hurtE: (e, d) => { hurt.push(d); e.hp -= d; }, hitstop() {} };
  openIn(ev, cc, 'stun'); const s = { m: ev.mode, t: ev.modeT, hurt: hurt[0] }; const ew = { ...ev, hp: 6000, ward: 1 }; hurt.length = 0; openIn(ew, cc, 'crash');
  ok(s.m === 'stun' && s.t === O.t && s.hurt === O.impact && ew.mode === 'crash' && ew.modeT === O.t && hurt.length === 0, 'openIn: stun and crash both start at 3.4 s with the 300 CRACK; a WARDED ram takes no impact');
  const ec = { x: 0, y: 0, h: 30, hp: 6000, maxHp: 6000 }; openIn(ec, { ...cc, hurtE() {} }, 'crash'); ec.hp = ec.crashHp - 6000 * O.cap; openCap(ec, cc); ok(ec.modeT === 0, 'both openings end early at a quarter of his blood taken (openCap)');
  const K = RAM.boulder; ok(K.weight > 0 && K.weight <= 0.2 && K.tell >= 0.8 && K.sp[0] === 150 && K.sp[1] === 175 && K.sp[2] === 190 && K.back === 0.6 && K.r === 10 && K.h === 20, 'the boulder butt: weight ~15%, tell 0.85 s, 150/175/190 px/s, back at 60%, r 10 and 20 px tall');
  const B = { x: 0, floor: 100 }; let hp = 0; const lc = { A: { x0: 0, x1: 480 }, floor: 100, dt: 1 / 60, P: { x: 40, y: 100, dead: false, dodge: 0 }, say() {}, sfx() {}, shake() {}, dust() {}, hurtP: () => { hp++; return 'hit'; }, dmgBoulder: 24 };
  const eb = { phase: 1 }; boulderStart(eb, lc, -1); let frames = 0; while (eb.boulder && frames < 3000) { boulderStep(eb, lc); frames++; } ok(!eb.boulder && frames > 60 * 5 && hp >= 1, 'a boulder falls, rolls the fold, hits the far wall, rolls back and shatters (' + (frames / 60).toFixed(1) + ' s); it hits a hero in its line');
  ok(typeof drawRamWave === 'function' && typeof stompFx === 'function', 'the stomp look: drawRamWave + stompFx exist (ground crack, dust ring, shard ridge)'); }
const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), updSrc = mainSrc.slice(mainSrc.indexOf('function updateRam'), mainSrc.indexOf('function traceBeams')), audioSrc = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
ok(/ramBoulder: 24/.test(mainSrc) && /case 'boulderTell'/.test(updSrc) && /SFX\.hoofScrape/.test(updSrc) && /case 'boulderButt'/.test(updSrc) && /case 'headIn'/.test(updSrc), 'DMG.ramBoulder 24; boulderTell (with a hoof scrape sound), boulderButt (horns in the cliff, stone) and headIn are in his update');
ok(/hoofScrape\(\)/.test(audioSrc) && /stompBoom\(\)/.test(audioSrc) && /boulderRoll\(\)/.test(audioSrc), 'the three new sounds exist: hoofScrape, stompBoom, boulderRoll');
ok(/RLD\.openIn\(e, ramCtx\(e, dt\), 'crash'\)/.test(updSrc) && /RLD\.openCap/.test(updSrc) && !/RAM_DAZE/.test(updSrc), 'the wall crash uses the shared openIn + openCap (no private daze numbers)');
ok(L.ents.some(e => e.t === 'sign' && /BOULDER/.test(e.text || '') && /PROPS/.test(e.text || '')), 'the stile has a sign for the boulder: it knocks the props too');
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
    b.broken = 0; b.poise = 0; b.poiseCd = 0; b.mode = 'stun'; b.modeT = 0.05; BK.sim(8); out.ward = b.ward; out.wardHit = hit('pace');
    /* the phases change the fold */
    b.ward = 0; b.hp = Math.floor(b.maxHp * 0.6); for (let i = 0; i < 4; i++) { b.modeT = 99; BK.sim(1); } out.p2 = b.phase; out.floor = (L.scree || []).some(z => z.ramFold);
    b.hp = Math.floor(b.maxHp * 0.3); let rain = 0; for (let i = 0; i < 300; i++) { b.modeT = 99; b.mode = 'pace'; BK.sim(1); rain = Math.max(rain, BK.rocks().filter(q => q.tx !== undefined && q.thrown).length); }
    out.p3 = b.phase; out.rain = rain; out.errors = 0; return out; })()`, 600000);
  console.log(JSON.stringify(r));
  ok(r.active && r.lips === 2, 'his fight starts and the fold has its two overhangs');
  ok(r.awayState !== 'armed' && r.awayMode !== 'stun', 'a knock with him off the line drops the rock on nothing (' + r.awayState + ', he is ' + r.awayMode + ')');
  ok(r.stun && r.open && r.stunAt >= 25 && r.stunAt <= 70, 'a knock with him under it (the press, the swing coming round, then the creak): the overhang comes down (' + r.stunAt + ' frames from the press) and he is STUNNED - open');
  ok(r.lipAfter === 'spent', 'the overhang is spent after it falls');
  ok(r.frontHit > 0 && r.frontHit < r.behindHit, 'a blade from his front at his height is turned to x0.4, never nothing (B15): ' + r.frontHit + ' against ' + r.behindHit + ' from behind');
  ok(r.behindHit > 0 && r.stunHit >= r.behindHit * 3, 'from behind it lands (' + r.behindHit + '); stunned the same blow lands x2 the full blow - x4 the angle\'s half (' + r.stunHit + ')');
  ok(r.ward > 1.5 && r.wardHit > 0 && r.wardHit < r.behindHit, 'the stun over, he is WARDED (' + (+r.ward).toFixed(1) + ' s) and a blade from behind is turned to x0.4, not nothing (' + r.wardHit + ')');
  ok(r.p2 >= 2 && r.floor, 'at two-thirds the fold slides: its floor is scree');
  ok(r.p3 === 3 && r.rain >= 1, 'at a third the cliff comes down: told rocks rain on the fold (' + r.rain + ' at once)');
  /* claude/scree3: one opening profile, the boulder butt */
  const r2 = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const RL = await import('/src/ram-lord.js');
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'scree')); BK.state = 'play'; BK.god = true; BK.sim(5);
    const L = BK.level, A = L.arena, TS = 16, out = {};
    for (const e of BK.enemies()) if (!e.boss && e.t !== 'ram') e.alive = false;
    BK.tp(Math.floor((A.x0 + A.x1) / 2 / TS), Math.round(A.floor / TS) - 1); for (let i = 0; i < 200 && !BK.bossActive; i++) BK.sim(1);
    const b = BK.boss, P = BK.P, lips = BK.ramLips(); BK.sim(120); const O = RL.RAM.open, K = RL.RAM.boulder;
    const park = () => { b.mode = 'pace'; b.modeT = 99; b.vx = 0; b.y = A.floor; b.ward = 0; b.boulder = null; b.hp = b.maxHp; b.crashHp = undefined; b.stagger = 0; };
    const crash = (ward) => { park(); b.ward = ward; b.x = A.x1 - 60; b.face = 1; b.banks = 0; b.mode = 'charge'; b.modeT = 3; b.vx = 250; P.x = A.x0 + 60; P.y = A.floor; let h0 = b.hp, at = -1, dr = 0; for (let i = 0; i < 90; i++) { h0 = b.hp; b.ward = ward; BK.sim(1); if (b.mode === 'crash' && at < 0) { at = i; dr = h0 - b.hp; break; } } return { at, drop: dr, modeT: b.modeT, hp: b.hp }; };
    out.crash = crash(0); const cr = out.crash; b.hp = b.crashHp - b.maxHp * O.cap - 1; BK.sim(12); out.crashCap = b.mode !== 'crash';
    out.crashWard = crash(2).drop;
    const stunNow = (ward) => { park(); const lip = lips[0]; lip.state = 'armed'; lip.t = 0; lip.hitBy = false; b.ward = ward; b.x = (lip.z0 + lip.z1) / 2; P.x = RL.lipSpot(lip); P.y = A.floor; P.face = lip.side; BK.sim(2); BK.press('atk'); let h0 = b.hp, dr = -1, at = -1; for (let i = 0; i < 120; i++) { if (b.mode !== 'stun') { b.modeT = 99; b.vx = 0; b.x = (lip.z0 + lip.z1) / 2; b.ward = ward; } h0 = b.hp; BK.sim(1); if (b.mode === 'stun' && dr < 0) { dr = h0 - b.hp; at = i; break; } } return { drop: dr, at, modeT: b.modeT }; };
    out.stun = stunNow(0); out.stunPre = [b.mode, b.crashHp, b.hp]; b.hp = b.crashHp - b.maxHp * O.cap - 1; BK.sim(12); out.stunCap = b.mode !== 'stun'; out.stunPost = [b.mode, b.modeT, b.hp];
    out.stunWard = stunNow(2).drop;
    /* the boulder: a standing hero is hurt (and shoved 200), a jumping one is missed */
    BK.god = false; const roll = (py, vy) => { park(); b.x = A.x0 + 40; b.mode = 'pace'; b.modeT = 99; P.x = (A.x0 + A.x1) / 2; P.y = py; P.vy = 0; P.hp = P.maxHp; P.inv = 0; P.hurt = 0; b.boulder = { x: P.x - 60, y: A.floor - K.r, vy: 0, ph: 'roll', dir: 1, sp: K.sp[0], rot: 0, hitT: 0, snd: 0, life: 0 }; const h0 = P.hp; let hit = false; for (let i = 0; i < 70; i++) { if (py < A.floor) { P.y = py; P.vy = 0; } P.x = Math.min(P.x, (A.x0 + A.x1) / 2 + 2); BK.sim(1); if (P.hp < h0) hit = true; } return { hit, lost: h0 - P.hp }; };
    out.rollStand = roll(A.floor, 0); out.rollJump = roll(A.floor - 26, 0); BK.god = true;
    /* a boulder rolled through an ARMED prop with him in his line: STUNNED */
    park(); { const lip = lips[1]; lip.state = 'armed'; lip.t = 0; lip.hitBy = false; const lp = lips[0]; lp.state = 'spent'; lp.t = 99; b.x = (lip.z0 + lip.z1) / 2; P.x = A.x0 + 40; P.y = A.floor;
      b.boulder = { x: lip.x - lip.side * 40, y: A.floor - K.r, vy: 0, ph: 'roll', dir: lip.side, sp: K.sp[0], rot: 0, hitT: 0, snd: 0, life: 0 }; let sa = -1; for (let i = 0; i < 150; i++) { if (b.mode !== 'stun') { b.modeT = 99; b.vx = 0; b.x = (lip.z0 + lip.z1) / 2; b.mode = 'pace'; } BK.sim(1); if (b.mode === 'stun') { sa = i; break; } } out.boulderStun = sa; out.boulderLip = lip.state; }
    /* the move itself: forced into boulderTell it winds up (told), horns the wall, rolls a boulder, keeps his back to you */
    park(); b.boulder = null; b.lastB = false; b.bCd = 0; b.x = A.x1 - 100; b.mode = 'pace'; b.modeT = -1; P.x = A.x0 + 120; P.y = A.floor; const seen = new Set(); let tell = false, rolled = false; const rnd = Math.random; Math.random = () => 0.01;
    for (let i = 0; i < 400; i++) { b.hp = b.maxHp; BK.sim(1); seen.add(b.mode); if (b.boulder) rolled = true; if (b.mode === 'headIn') out.headFace = b.face; }
    Math.random = rnd; out.modes = [...seen]; out.rolled = rolled;
    return out; })()`, 600000);
  console.log(JSON.stringify(r2));
  ok(r2.crash.at >= 0 && r2.crash.drop === 300 && r2.stun.drop === 300, 'CRACK parity: the wall slam hits for ' + r2.crash.drop + ' and the cliff\'s rock for ' + r2.stun.drop + ' - the same 300');
  ok(Math.abs(r2.crash.modeT - 3.4) < 0.05 && Math.abs(r2.stun.modeT - 3.4) < 0.05, 'both open 3.4 s (' + r2.crash.modeT.toFixed(2) + ' / ' + r2.stun.modeT.toFixed(2) + ')');
  ok(r2.crashCap && r2.stunCap, 'both end early at a quarter of his blood taken');
  ok(r2.crashWard === 0, 'a WARDED ram takes no impact from the wall (' + r2.crashWard + ')');
  ok(r2.rollStand.hit && !r2.rollJump.hit, 'the boulder hurts a standing hero (' + r2.rollStand.lost + ') and misses a jumping one');
  ok(r2.boulderStun >= 0 && r2.boulderLip === 'spent', 'a boulder rolled through an armed prop with him in its line STUNS him (frame ' + r2.boulderStun + ')');
  ok(r2.modes.includes('boulderTell') && r2.modes.includes('boulderButt') && r2.modes.includes('headIn') && r2.rolled, 'the move runs: boulderTell, boulderButt (horns in the cliff), headIn; a boulder rolled (' + r2.modes.join(',') + ')');
  ok(!pg.errors.length, 'no page errors' + (pg.errors.length ? ': ' + pg.errors[0] : ''));
} finally { await pg.close(); }
console.log(fails ? '\nFAIL  ram-lord: ' + fails : '\nok  ram-lord: a beast duelist off the chip, guarding by angle; the cliff stuns him (gold, x2), the wall too, a ward after each; three phases change the fold');
process.exit(fails ? 1 : 0);
