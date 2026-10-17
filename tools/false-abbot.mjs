// tools/false-abbot.mjs — THE FALSE ABBOT (src/false-abbot.js) proved in Node: every windup told before its blow, the
// yellow ones answerable two ways and the red ones one, THE RITE that cannot be out-swung, and THE OPENING CAUSED -
// the great bell downs him when he is under it and does nothing when he is not, and two of his own attacks are what
// put him there (claude/abbot2: THE BELL ROPE in THE PROCESSION's place - he swings TOWARD you and lands on your mark, so
// standing past the bell baits him under it - a stated design change, Daniel 10-15). The rite is a kneeling prayer that
// heals ~8% and is SPOILED by striking the sanctus bell or a plunge. usage: node tools/false-abbot.mjs
import { readFileSync } from 'node:fs';
import { ABBOT, ABBOT_FRAMES, updateFalseAbbot, abbotBellRung, abbotOpen, abbotBlessed, abbotTake, abbotFrame, abbotSanctus, abbotSpoil, abbotPraying } from '../src/false-abbot.js';
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const DT = 1 / 60, FLOOR = 480, BELL = 900, A = { x0: 32, x1: 1504, floor: FLOOR };

/* a fight rig. `block` decides what the player's guard does with a blow: true = it is turned. */
function rig(o = {}) {
  const P = { x: o.px ?? 1000, y: FLOOR, dead: false };
  const e = { t: 'abbot', x: o.x ?? 1100, y: FLOOR, hp: o.hp ?? ABBOT.hp, maxHp: ABBOT.hp, alive: true, mode: o.mode || 'stalk',
    modeT: o.modeT ?? 0, cd: o.cd ?? 0, anim: 0, face: -1, turn: o.turn ?? 0, phase: 1, addT: 99 };
  const log = { hits: [], said: [], fires: [], sounds: [], shoves: [], reels: [], blessed: 0, dazed: 0, broke: 0, spent: 0, summons: 0 };
  let adds = o.adds ?? 0, bellCold = false;
  const c = { P, A,
    hit: (x, d, hard, name) => { const turned = !hard && (o.block ?? false); log.hits.push({ x, d, hard, name, turned }); return turned ? 'blocked' : 'hit'; },
    say: (m, red, quiet) => log.said.push({ m, red: !!red, quiet: !!quiet }),
    sound: s => log.sounds.push(s), shake: () => {}, dust: () => {},
    shove: (vx, vy) => log.shoves.push([vx, vy]), reel: x => log.reels.push(x),
    fire: (x, life, delay) => log.fires.push({ x, life, delay }),
    blessFlock: () => { log.blessed += adds; return adds; },
    breakBlessings: () => { log.broke++; }, dazeFlock: () => { log.dazed++; },
    adds: () => adds, summon: () => { adds++; log.summons++; },
    bellSpend: () => { log.spent++; bellCold = true; }, bellCold: () => bellCold,
  };
  return { P, e, c, log, setAdds: n => { adds = n; }, run: (s, dt = DT) => { for (let i = 0; i < Math.round(s / dt); i++) updateFalseAbbot(e, dt, c); } };
}
/* run him until he starts the named windup, then return the rig sitting on it */
function until(mode, o = {}, secs = 40) {
  const r = rig(o);
  for (let i = 0; i < secs / DT; i++) { updateFalseAbbot(r.e, DT, r.c); if (r.e.mode === mode) return r; }
  return null;
}
console.log('THE FALSE ABBOT');

// ---- every blow is told, and long enough to answer ----
{ const seen = new Map(), r = rig({ px: 1060, x: 1100, hp: 200 });   /* hurt, so phase two's knell is in the order too */
  let last = '';
  for (let i = 0; i < 60 * 240; i++) { updateFalseAbbot(r.e, DT, r.c);
    if (r.e.mode.endsWith('Tell') && r.e.mode !== last) seen.set(r.e.mode, ABBOT.tell[r.e.mode.slice(0, -4)]);
    last = r.e.mode; if (i % 900 === 0) r.P.x = [700, 1060, 1400][(i / 900) % 3]; }
  const want = Object.keys(ABBOT.tell).map(k => k + 'Tell');
  ok(want.every(m => seen.has(m)), `all ${want.length} windups come up: ${[...seen.keys()].sort().join(', ')}`);
  const short = [...seen.entries()].filter(([, t]) => t < 0.5);
  ok(short.length === 0, `and every one is told at least 0.5 s ahead (shortest ${Math.min(...seen.values()).toFixed(2)} s)`); }

// ---- the marks: three red, three yellow, and the rite wears none ----
{ const said = {};
  for (const [what, o] of [['censer', { px: 1080, x: 1100 }], ['cast', { px: 950, x: 1100 }], ['swing', { px: 600, x: 1100 }], ['gleam', { px: 600, x: 1100 }],
                           ['coals', { px: 1080, x: 1100 }], ['rite', { px: 1080, x: 1100, adds: 2 }], ['knell', { px: 1080, x: 1100, hp: 100 }]]) {
    const r = rig(o); const mode = what + 'Tell';
    for (let i = 0; i < 60 * 200 && !said[what]; i++) { updateFalseAbbot(r.e, DT, r.c);
      if (r.e.mode === mode) said[what] = r.log.said[r.log.said.length - 1]; } }
  const got = Object.keys(said).filter(k => said[k]);
  ok(got.length === 7, `each windup says itself as it starts (${got.length}/7)`);
  ok(said.swing && said.swing.red && said.coals && said.coals.red && said.knell && said.knell.red,
    'THE BELL ROPE, THE COALS and THE KNELL wear the red mark: nothing turns them');
  ok(said.censer && !said.censer.red && said.cast && !said.cast.red && said.gleam && !said.gleam.red, 'THE CENSER, THE CHAIN and FALSE LIGHT wear the yellow one: a shield turns them');
  ok(said.rite && said.rite.quiet && /BELL/.test(said.rite.m), 'and THE RITE wears none at all - it throws no blow (the QUIET list) - but it says what to do: ' + (said.rite && said.rite.m)); }

// ---- THE CENSER, THE CHAIN and FALSE LIGHT are blockable; THE SLAM and THE KNELL are not ----
{ const soft = [], hard = [];
  for (const [what, bucket] of [['censer', soft], ['cast', soft], ['knell', hard]]) {
    const r = rig({ mode: what + 'Tell', modeT: 0.01, px: 1090, x: 1100, hp: what === 'knell' ? 100 : ABBOT.hp });
    r.run(1.2); bucket.push(...r.log.hits.map(h => h.hard)); }
  { const r = until('gleamTell', { px: 600, x: 1100 }); r.run(ABBOT.tell.gleam + 0.05); r.run(ABBOT.lightT + 0.1); soft.push(...r.log.hits.map(h => h.hard)); }
  { const r = until('swingTell', { px: 600, x: 1100 }); r.e.orb = null; r.P.x = r.e.swTo; r.run(ABBOT.tell.swing + ABBOT.swingT + 0.05); hard.push(...r.log.hits.filter(h => h.name === 'THE CENSER SLAM').map(h => h.hard)); }   /* (a false light thrown before it may still be in the air: that one is the light's, not the rope's) */
  ok(soft.length >= 3 && soft.every(h => h === false), `the censer, the chain and the false light are blows a shield can turn (${soft.length} landed, none unblockable)`);
  ok(hard.length >= 2 && hard.every(h => h === true), `the rope's censer slam and the knell are not (${hard.length} landed, all unblockable)`); }

// ---- FALSE LIGHT: lobbed onto a MARKED spot, and you can step off it ----
{ const r = until('gleamTell', { px: 600, x: 1100 });
  ok(!!r && ABBOT.tell.gleam >= 0.5 && r.e.lightAim !== undefined, `FALSE LIGHT is told ${ABBOT.tell.gleam} s, its mark on you`);
  r.run(ABBOT.tell.gleam + 0.02); const tx = r.e.orb && r.e.orb.tx;
  ok(!!r.e.orb && Math.abs(tx - 600) < 4, `it is thrown at the spot you stood on (${tx})`);
  r.P.x = tx + ABBOT.lightR + 12; r.run(ABBOT.lightT + 0.1);
  ok(!r.e.orb && r.log.hits.length === 0, 'stepped off the mark, the burst finds nobody');
  const q = until('gleamTell', { px: 600, x: 1100 }); q.run(ABBOT.tell.gleam + ABBOT.lightT + 0.15);
  ok(q.log.hits.some(h => h.name === 'FALSE LIGHT'), 'stood on it, it lands'); }

// ---- THE COALS are floor fire, laid along the boards ----
{ const r = rig({ mode: 'coalsTell', modeT: 0.01 }); r.run(0.6);
  ok(r.log.fires.length === ABBOT.coals, `THE COALS lay ${r.log.fires.length} fires along the boards`);
  const xs = r.log.fires.map(f => f.x), span = Math.max(...xs) - Math.min(...xs);
  ok(span >= ABBOT.coalStep * (ABBOT.coals - 1) - 1, `spread over ${Math.round(span)} px, not in a heap`); }

// ---- THE OPENING IS CAUSED: the bell only answers with him under it ----
{ const near = rig({ x: BELL + 10 }); const got = abbotBellRung(near.e, BELL, near.c);
  ok(got === 'down' && abbotOpen(near.e), 'THE BELL, with him under it: the note goes through the rite and he is DOWN');
  ok(near.log.broke === 1 && near.log.dazed === 1, 'and every blessing on the roof breaks at once, and the congregation is dazed');
  ok(abbotTake(near.e) === ABBOT.downMul, `a blow in that window is worth ${ABBOT.downMul}x`);
  const far = rig({ x: BELL + ABBOT.bellUnder + 30 }); const no = abbotBellRung(far.e, BELL, far.c);
  ok(no === 'cold' && !abbotOpen(far.e), 'THE SAME BELL, with him anywhere else: nothing. The opening is the PLACE, not the bell');
  ok(far.log.broke === 0, 'and it breaks nothing');
  const air = rig({ x: BELL + 5 }); air.e.mode = 'swing'; air.e.modeT = 0.3;
  ok(abbotBellRung(air.e, BELL, air.c) === 'cold', 'and swinging OVER it on the rope is not under it'); }

// ---- and two of his OWN attacks are what put him there ----
{ /* THE CHAIN, GUARDED, hauls HIM toward the player - so a player standing past the bell walks him under it */
  const r = rig({ mode: 'castTell', modeT: 0.01, x: 1100, px: 1000, block: true });
  const x0 = r.e.x; r.run(1.0);
  ok(r.e.x < x0 - ABBOT.castPull * 0.9, `THE CHAIN GUARDED HAULS HIM: ${Math.round(x0 - r.e.x)} px toward the shield that turned it`);
  ok(r.log.said.some(s => /HAULS HIM/.test(s.m)), 'and it says so');
  /* taken, it does the opposite: it reels YOU in */
  const q = rig({ mode: 'castTell', modeT: 0.01, x: 1100, px: 1000, block: false });
  const qx = q.e.x; q.run(0.3);   /* while the cast is still running: after it he walks again, and that is not the chain */
  ok(q.log.reels.length === 1 && Math.abs(q.e.x - qx) < 2, `TAKEN, the chain reels YOU in instead, and he does not move (${q.log.reels.length} reel, he moved ${Math.round(Math.abs(q.e.x - qx))} px)`);
  /* THE BELL ROPE: always TOWARD you, onto the spot you stood on, told by its own mark before he leaves the floor */
  const sw = until('swingTell', { px: 700, x: 1100 });
  ok(!!sw && sw.e.swTo < sw.e.x && Math.abs(sw.e.swTo - 700) < 2, `THE BELL ROPE swings toward you, onto your spot: from ${sw && Math.round(sw.e.x)} to ${sw && Math.round(sw.e.swTo)}`);
  ok(sw.log.sounds.includes('rope'), 'the rope jerks and its bell clangs first (the tell is heard)');
  const mark = sw.e.swTo; sw.P.x = 640; sw.run(ABBOT.tell.swing + ABBOT.swingT * 0.5);
  ok(sw.e.mode === 'swing' && sw.e.y < FLOOR - ABBOT.swingH * 0.6, `he is off the boards, on the rope (${Math.round(FLOOR - sw.e.y)} px up)`);
  sw.run(ABBOT.swingT * 0.5 + 0.05);
  ok(Math.abs(sw.e.x - mark) < 1 && sw.e.mode === 'land' && !sw.log.hits.some(h => h.name === 'THE CENSER SLAM'), `he lands ON THE MARK (${Math.round(sw.e.x)}), and a hero who stepped off it is not slammed`);
  const sr = until('swingTell', { px: 1500, x: 1100 });
  ok(!!sr && sr.e.swTo > sr.e.x, 'with you on his other side he swings the other way: it is always TOWARD you');
  /* AND SO THE BAIT: stand just past the great bell and he comes down under it himself - the rope does the procession's old job */
  const bait = until('swingTell', { px: BELL - 25, x: 1150 });
  bait.run(ABBOT.tell.swing + 0.02); bait.P.x = BELL - 25 - ABBOT.slamR - 14; bait.run(ABBOT.swingT + 0.05);
  ok(Math.abs(bait.e.x - BELL) < ABBOT.bellUnder, `STAND PAST THE BELL AND HE LANDS UNDER IT: ${Math.round(bait.e.x - BELL)} px from it`);
  ok(abbotBellRung(bait.e, BELL, bait.c) === 'down', 'and the bell rung then puts him down'); }

// ---- THE RITE: he kneels and prays, it heals him and wards him, and that is what makes the bell the answer ----
{ const r = rig({ mode: 'riteTell', modeT: 0.01, hp: 1000 }); r.setAdds(3); r.run(0.6);
  ok(abbotBlessed(r.e), 'THE RITE blesses HIM, not only his goblins');
  ok(r.e.hp - 1000 >= Math.floor(ABBOT.hp * 0.075), `and the prayer HEALS him ~8% (${r.e.hp - 1000} of ${ABBOT.hp})`);
  ok(abbotTake(r.e) === ABBOT.wardTake && ABBOT.wardTake >= 0.4 && ABBOT.wardTake < 1, `a warded Abbot takes ${ABBOT.wardTake} of every blow: B15's floor, never a wall`);
  ok(r.log.blessed === 3, `his congregation is blessed with him (${r.log.blessed})`);
  /* THE CLAIM THE WHOLE FIGHT RESTS ON, measured both ways: a hero who only swings against the ward, and one who
     uses the bell. If the first is not far worse than the second, the opening is decoration. */
  const swung = (withBell) => { const q = rig({ px: 1060, x: 1100 }); let t = 0, sinceBell = 0;
    while (q.e.hp > 0 && t < 400) { updateFalseAbbot(q.e, DT, q.c); t += DT; sinceBell += DT;
      if (Math.floor(t / (1 / 3)) !== Math.floor((t - DT) / (1 / 3))) q.e.hp -= 14 * abbotTake(q.e);   /* three light blows a second, the hero's best case */
      if (withBell) { q.P.x = BELL - 30;
        if (sinceBell > 7 && Math.abs(q.e.x - BELL) < ABBOT.bellUnder) { abbotBellRung(q.e, BELL, q.c); sinceBell = 0; } } }
    return t; };
  const noBell = swung(false), withBell = swung(true);
  /* THE ABSOLUTE NUMBER IS A FLOOR, NOT THE RULE. This harness's hero lands three light blows a second for the whole
     fight: never blocking, never dodging, never interrupted, with no congregation on him. Nobody plays like that, so
     what it measures is the BEST CASE for brute force. The rule that matters is the ratio below - the bell has to be
     worth at least double - and this only catches the ward going soft enough to make the fight trivial. */
  ok(noBell > 35, `SWINGING ALONE, in a best case nobody gets: ${Math.round(noBell)} s of unbroken hitting (it was 19 s when the ward was half and the rite was one move in ten)`);
  ok(withBell < noBell * 0.5, `AND THE BELL IS THE FIGHT, not decoration: ${Math.round(withBell)} s with it against ${Math.round(noBell)} s without - it has to be worth at least double`);
  const warded = (() => { const q = rig({ px: 1060, x: 1100 }); let on = 0, n = 0;
    for (let i = 0; i < 60 * 120; i++) { updateFalseAbbot(q.e, DT, q.c); n++; if (abbotBlessed(q.e)) on++; } return on / n; })();
  ok(warded > 0.6, `the ward is his STANDING condition, not an event: up ${Math.round(warded * 100)}% of two minutes`); }

// ---- THE RITE SPOILED: the sanctus bell struck, a plunge on him, or (kept) a stagger on the prayer ----
{ const r = until('riteTell', { px: 1060, x: 1100, adds: 2, hp: 1000 });
  ok(!!r && ABBOT.tell.rite >= 2, `THE PRAYER is a clear kneel, ${ABBOT.tell.rite} s long`);
  const sb = abbotSanctus(r.e);
  ok(!!sb && Math.sign(sb.x - r.e.x) === -Math.sign(r.P.x - r.e.x), `its SANCTUS BELL stands on a post BEHIND him (${sb && Math.round(sb.x - r.e.x)} px; you are on the other side): go round, or come down on him`);
  r.P.x = 1160; r.run(0.3);
  ok(abbotSanctus(r.e) && Math.abs(abbotSanctus(r.e).x - sb.x) < 1 && r.e.face === -1, 'on his knees he does not turn round to follow you, so the bell stays where it is');
  const hp0 = r.e.hp; ok(abbotSpoil(r.e, 'sanctus'), 'a blow on the sanctus bell takes'); r.run(DT * 2);
  ok(r.e.mode === 'spoiled' && !abbotBlessed(r.e), 'STRIKE IT and the RITE IS SPOILED: nobody is blessed');
  r.run(ABBOT.tell.rite); ok(r.e.hp <= hp0 && !abbotBlessed(r.e), `and he is NOT healed (${r.e.hp - hp0})`);
  ok(r.log.said.some(s => /RITE SPOILED/.test(s.m)), 'and it says so');
  let re = false; for (let i = 0; i < 60 * (ABBOT.riteCd - ABBOT.tell.rite - 0.2); i++) { updateFalseAbbot(r.e, DT, r.c); if (r.e.mode === 'riteTell') re = true; }
  ok(!re, `and he cannot kneel again for a while (${ABBOT.riteCd} s): he fights unwarded - that is what spoiling it buys`);
  const pl = until('riteTell', { px: 1060, x: 1100 }); abbotSpoil(pl.e, 'plunge'); pl.run(DT * 2);
  ok(pl.e.mode === 'spoiled' && pl.log.said.some(s => /RITE SPOILED/.test(s.m)), 'A PLUNGE on him spoils it the same way');
  const st = until('riteTell', { px: 1080, x: 1100, adds: 2 }); st.e.stagger = 0.6; st.run(DT * 2);
  ok(st.e.mode === 'spoiled' && !abbotBlessed(st.e), 'and the old way stays: a blow that staggers him on it spoils it too');
  const nb = rig({ px: 1060, x: 1100 }); ok(!abbotSpoil(nb.e, 'sanctus') && !abbotPraying(nb.e), 'a sanctus blow when he is not praying does nothing');
  const q = until('riteTell', { px: 1080, x: 1100, adds: 2 }); q.run(ABBOT.tell.rite + 0.1);
  ok(abbotBlessed(q.e), 'left alone, the same prayer wards him'); }

// ---- the congregation: a trickle, and never more than four ----
{ const r = rig({ px: 1060, x: 1100 }); r.e.addT = 0; let worst = 0;
  for (let i = 0; i < 60 * 120; i++) { updateFalseAbbot(r.e, DT, r.c); worst = Math.max(worst, r.c.adds()); }
  ok(worst <= ABBOT.adds, `THE CONGREGATION never has more than ${ABBOT.adds} on the floor at once (worst ${worst})`);
  ok(r.log.summons >= ABBOT.adds, `and it keeps coming: ${r.log.summons} up the ladder in two minutes`); }

// ---- phase two: the rope is his too, and it costs the room its answer ----
{ const r = rig({ px: 1060, x: 1100, hp: ABBOT.hp }); r.run(0.2);
  ok(r.e.phase !== 2, 'at full health he does not touch the rope');
  const q = rig({ px: 1060, x: 1100, hp: ABBOT.hp * 0.4 }); q.run(0.2);
  ok(q.e.phase === 2 && q.log.said.some(s => /ROPE/.test(s.m)), 'under half he takes it himself, and says so');
  let knelled = false; for (let i = 0; i < 60 * 120 && !knelled; i++) { updateFalseAbbot(q.e, DT, q.c); if (q.e.mode === 'knell') knelled = true; }
  ok(knelled && q.log.spent > 0, 'THE KNELL rings the great bell for him - and spends it, so the room owes you a wait for your own'); }

// ---- the frames: every mode has one, and hurt is last ----
{ const modes = ['idle', 'stalk', 'censerTell', 'censer', 'castTell', 'cast', 'haul', 'swingTell', 'swing', 'land', 'gleamTell', 'gleam', 'coalsTell', 'coals', 'riteTell', 'rite', 'spoiled', 'knellTell', 'knell', 'downed', 'sleep', 'wake'];
  const fs = modes.map(m => abbotFrame({ mode: m, anim: 0, vx: 0, hurtT: 0 }));
  ok(fs.every(f => Number.isInteger(f) && f >= 0 && f < ABBOT_FRAMES), `the frame table answers every mode (${Math.min(...fs)}-${Math.max(...fs)})`);
  ok(abbotFrame({ mode: 'stalk', anim: 0, vx: 0, hurtT: 0.2 }) === 17, 'and hurt is frame 17, over everything but a named mode');
  /* B16: every move its OWN windup and release pose - the rope's three, the light's two, the prayer and its spoiling */
  const own = ['swingTell', 'swing', 'land', 'gleamTell', 'gleam', 'riteTell', 'spoiled'].map(m => abbotFrame({ mode: m, anim: 0 }));
  ok(new Set(own).size === own.length && own.every(f => ![0, 1, 2, 17].includes(f)), `B16: the rope, the light and the prayer each have their own poses (${own.join(',')})`); }

/* THE WARD HAS TO HOLD AGAINST FIRE TOO, and that cannot be tested from this module because the burn tick lives in
   main.js - which is exactly how it went wrong. It wrote `e.hp -= 2` straight into the boss, so fire walked through a
   FIFTH-DAMAGE ward at full strength and the Pyromancer's 4/4 against him measured nothing. The rule is pinned at the
   source, because a convention nothing checks is a wish. */
{ const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const tick = main.split(String.fromCharCode(10)).find(l => l.includes('e.burnTick = 0.3'));
  ok(!!tick, 'the burn tick is still in main.js');
  ok(!!tick && tick.includes('wardedDamage(e, 2)'), 'BURN BYPASSES EVERY WARD AGAIN: the tick must go through wardedDamage, not write e.hp directly');
  ok(!!tick && !/e[.]hp -= 2[^0-9]/.test(tick), 'the burn tick writes e.hp directly again');
  ok(/function wardedDamage\(e, dmg(, blow)?(, tag = blow)?\)/.test(main), 'wardedDamage is gone: the wards are inline again and burn will be skipping them');
  ok(Math.max(1, Math.round(2 * ABBOT.wardTake)) === 1, 'a burn tick through the rite should be 1, not ' + Math.max(1, Math.round(2 * ABBOT.wardTake))); }

console.log(fails ? `\n${fails} FAILED` : '\nall false abbot checks pass');
process.exit(fails ? 1 : 0);
