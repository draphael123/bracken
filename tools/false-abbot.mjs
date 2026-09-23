// tools/false-abbot.mjs — THE FALSE ABBOT (src/false-abbot.js) proved in Node: every windup told before its blow, the
// yellow ones answerable two ways and the red ones one, THE RITE that cannot be out-swung, and THE OPENING CAUSED -
// the great bell downs him when he is under it and does nothing when he is not, and two of his own attacks are what
// put him there. usage: node tools/false-abbot.mjs
import { ABBOT, updateFalseAbbot, abbotBellRung, abbotOpen, abbotBlessed, abbotTake, abbotFrame } from '../src/false-abbot.js';
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
    last = r.e.mode; if (i % 900 === 0) r.P.x = 1000 + (i % 3) * 60; }
  const want = Object.keys(ABBOT.tell).map(k => k + 'Tell');
  ok(want.every(m => seen.has(m)), `all six windups come up: ${[...seen.keys()].sort().join(', ')}`);
  const short = [...seen.entries()].filter(([, t]) => t < 0.5);
  ok(short.length === 0, `and every one is told at least 0.5 s ahead (shortest ${Math.min(...seen.values()).toFixed(2)} s)`); }

// ---- the marks: two red, two yellow, and the rite wears none ----
{ const said = {};
  for (const [what, o] of [['censer', { px: 1080, x: 1100 }], ['cast', { px: 800, x: 1100 }], ['process', { px: 700, x: 1100 }],
                           ['coals', { px: 1080, x: 1100 }], ['rite', { px: 1080, x: 1100, adds: 2 }], ['knell', { px: 1080, x: 1100, hp: 100 }]]) {
    const r = rig(o); const mode = what + 'Tell';
    for (let i = 0; i < 60 * 200 && !said[what]; i++) { updateFalseAbbot(r.e, DT, r.c);
      if (r.e.mode === mode) said[what] = r.log.said[r.log.said.length - 1]; } }
  const got = Object.keys(said).filter(k => said[k]);
  ok(got.length === 6, `each windup says itself as it starts (${got.length}/6)`);
  ok(said.process && said.process.red && said.coals && said.coals.red && said.knell && said.knell.red,
    'THE PROCESSION, THE COALS and THE KNELL wear the red mark: nothing turns them');
  ok(said.censer && !said.censer.red && said.cast && !said.cast.red, 'THE CENSER and THE CHAIN wear the yellow one: a shield turns them');
  ok(said.rite && said.rite.quiet, 'and THE RITE wears none at all - it throws no blow (the QUIET list)'); }

// ---- THE CENSER and THE CHAIN are blockable; THE PROCESSION, THE COALS and THE KNELL are not ----
{ const soft = [], hard = [];
  for (const [what, bucket] of [['censer', soft], ['cast', soft], ['process', hard], ['knell', hard]]) {
    const r = rig({ mode: what + 'Tell', modeT: 0.01, px: 1090, x: 1100, hp: what === 'knell' ? 100 : ABBOT.hp });
    if (what === 'process') r.e.procDir = -1;
    r.run(1.2); bucket.push(...r.log.hits.map(h => h.hard)); }
  ok(soft.length && soft.every(h => h === false), `the censer and the chain are blows a shield can turn (${soft.length} landed, none unblockable)`);
  ok(hard.length && hard.every(h => h === true), `the procession and the knell are not (${hard.length} landed, all unblockable)`); }

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
  ok(far.log.broke === 0, 'and it breaks nothing'); }

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
  /* THE PROCESSION walks a straight line and does not turn out of it */
  const p = until('process', { px: 900, x: 1100 });
  const dir = p.e.procDir; p.P.x = 1400;              /* the player runs the other way mid-walk: he must not follow */
  const sx = p.e.x; p.run(ABBOT.processT * 0.6);
  ok(dir === -1 && p.e.x < sx - 40 && p.e.procDir === -1, `THE PROCESSION holds its line: ${Math.round(sx - p.e.x)} px the way it started, with the player behind him`); }

// ---- THE RITE: he blesses himself, and that is what makes the bell the answer ----
{ const r = rig({ mode: 'riteTell', modeT: 0.01 }); r.setAdds(3); r.run(0.6);
  ok(abbotBlessed(r.e), 'THE RITE blesses HIM, not only his goblins');
  ok(abbotTake(r.e) === ABBOT.wardTake, `and a warded Abbot takes a FIFTH of every blow (${ABBOT.wardTake})`);
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

// ---- the OTHER answer: the rite broken on its windup ----
{ const r = until('riteTell', { px: 1080, x: 1100, adds: 2 });
  r.e.stagger = 0.6; r.run(DT * 2);
  ok(r.e.mode === 'spoiled' && !abbotBlessed(r.e), 'A BLOW ON THE WINDUP SPOILS THE RITE: the censer spills and nobody is blessed');
  ok(r.log.said.some(s => /RITE BREAKS/.test(s.m)), 'and it says so');
  const q = until('riteTell', { px: 1080, x: 1100, adds: 2 }); q.run(ABBOT.tell.rite + 0.1);
  ok(abbotBlessed(q.e), 'left alone, the same windup wards him'); }

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
{ const modes = ['idle', 'stalk', 'censerTell', 'censer', 'castTell', 'cast', 'haul', 'processTell', 'process', 'coalTell', 'coals', 'riteTell', 'rite', 'knellTell', 'knell', 'downed', 'sleep', 'wake'];
  const fs = modes.map(m => abbotFrame({ mode: m, anim: 0, vx: 0, hurtT: 0 }));
  ok(fs.every(f => Number.isInteger(f) && f >= 0 && f <= 17), `the frame table answers every mode (${Math.min(...fs)}-${Math.max(...fs)})`);
  ok(abbotFrame({ mode: 'stalk', anim: 0, vx: 0, hurtT: 0.2 }) === 17, 'and hurt is the last frame, over everything but a named mode'); }

console.log(fails ? `\n${fails} FAILED` : '\nall false abbot checks pass');
process.exit(fails ? 1 : 0);
