// tools/false-abbot.mjs — THE FALSE ABBOT (src/false-abbot.js) proved in Node: every windup told before its blow, the
// yellow ones answerable two ways and the red ones one, THE RITE that cannot be out-swung, and THE OPENINGS CAUSED BY THE
// HOUSE (claude/abbot3, Daniel 10-26 "THE HOUSE ANSWERS THE BLOW" - a stated design change: the great bell no longer downs
// him from under it; each phase a device of the level is turned on him): P1 a bridge's bell struck with him on that bridge
// drops him with it; P2 the basket ridden down brings his chair down and spills him; P3 a plunge on him at his wheel (the
// wheel struck spoils the rite, his censer's smoke lifts you); beaten down at 5%, the great bell is the last blow.
// usage: node tools/false-abbot.mjs
import { readFileSync } from 'node:fs';
import { ABBOT, ABBOT_FRAMES, updateFalseAbbot, abbotBellRung, abbotOpen, abbotBlessed, abbotTake, abbotFrame, abbotSpoil, abbotPraying,
  abbotBridgeBell, abbotInChair, CHAIR_SAY, drawAbbotHouse, abbotWheelStruck, abbotPlunge, abbotClamp, abbotHighSpans, abbotLevelOf, abbotChairY } from '../src/false-abbot.js';
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const DT = 1 / 60, FLOOR = 480, DECK = 384, BELL = 904;
/* the belfry as the level lays it (level.js arena.house, in pixels as main.js abbotHouse() makes it) */
const HOUSE = { deckY: DECK, spans: [[272, 368], [688, 832], [944, 1088], [1184, 1280]], bridges: [{ x0: 368, x1: 688, bells: [296, 696] }, { x0: 1088, x1: 1184, bells: [1080, 1240] }],
  chairX: 536, chairY: 368, pulleyY: 224, basketX: 848, wheels: [{ x: 568, spotX: 664, smokeX: 634 }, { x: 1176, spotX: 1080, smokeX: 1110 }], bellX: BELL };
const A = { x0: 32, x1: 1504, floor: FLOOR, landLo: 224, landHi: 1264, ropes: [424, 680, 1128], house: HOUSE };

/* a fight rig. `block` decides what the player's guard does with a blow: true = it is turned. o.flat: the old floor-only arena */
function rig(o = {}) {
  const P = { x: o.px ?? 1000, y: o.py ?? FLOOR, dead: false, ground: true };
  const e = { t: 'abbot', x: o.x ?? 1100, y: FLOOR, hp: o.hp ?? ABBOT.hp, maxHp: ABBOT.hp, alive: true, mode: o.mode || 'stalk',
    modeT: o.modeT ?? 0, cd: o.cd ?? 0, anim: 0, face: -1, turn: o.turn ?? 0, phase: o.phase ?? 1, addT: 99, riteCd: o.riteCd ?? 0, blessT: o.blessT ?? 0 };
  if (o.phase) e.phase = o.phase;
  const log = { hits: [], said: [], fires: [], sounds: [], shoves: [], reels: [], blessed: 0, dazed: 0, broke: 0, spent: 0, summons: 0, bridges: [], phase3: 0 };
  let adds = o.adds ?? 0, bellCold = false, basket = 0;
  const c = { P, A: o.flat ? { ...A, house: undefined } : A,
    hit: (x, d, hard, name) => { const turned = !hard && (o.block ?? false); log.hits.push({ x, d, hard, name, turned }); return turned ? 'blocked' : 'hit'; },
    say: (m, red, quiet) => log.said.push({ m, red: !!red, quiet: !!quiet }),
    sound: s => log.sounds.push(s), shake: () => {}, dust: () => {},
    shove: (vx, vy) => log.shoves.push([vx, vy]), reel: x => log.reels.push(x),
    fire: (x, life, delay, y) => log.fires.push({ x, life, delay, y }),
    blessFlock: () => { log.blessed += adds; return adds; },
    breakBlessings: () => { log.broke++; }, dazeFlock: () => { log.dazed++; },
    adds: () => adds, summon: () => { adds++; log.summons++; },
    bellSpend: () => { log.spent++; bellCold = true; }, bellCold: () => bellCold,
    bridge: (i, up) => log.bridges.push([i, up]), basketK: () => basket, phase3: () => { log.phase3++; },
  };
  return { P, e, c, log, setAdds: n => { adds = n; }, setBasket: k => { basket = k; }, run: (s, dt = DT) => { for (let i = 0; i < Math.round(s / dt); i++) updateFalseAbbot(e, dt, c); } };
}
/* run him until he starts the named windup, then return the rig sitting on it */
function until(mode, o = {}, secs = 40, each) {
  const r = rig(o);
  for (let i = 0; i < secs / DT; i++) { updateFalseAbbot(r.e, DT, r.c); if (each) each(r); if (r.e.mode === mode) return r; }
  return null;
}
console.log('THE FALSE ABBOT 3: THE HOUSE ANSWERS THE BLOW');

// ---- every blow is told, and long enough to answer ----
{ const seen = new Map(), r = rig({ px: 1060, x: 1100, hp: 1500, riteCd: 999 });   /* phase two: the knell is in the order too */
  let last = '';
  for (let i = 0; i < 60 * 240; i++) { updateFalseAbbot(r.e, DT, r.c);
    if (r.e.mode.endsWith('Tell') && r.e.mode !== last) seen.set(r.e.mode, r.e.modeT + DT);
    last = r.e.mode; if (i % 900 === 0) r.P.x = [700, 1060, 1400][(i / 900) % 3]; r.e.riteCd = 999; }
  const want = Object.keys(ABBOT.tell).filter(k => k !== 'rite').map(k => k + 'Tell');
  ok(want.every(m => seen.has(m)), `all ${want.length} attack windups come up: ${[...seen.keys()].sort().join(', ')}`);
  ok([...seen.values()].every(t => t >= 0.5), `and every one is told at least 0.5 s ahead (shortest ${Math.min(...seen.values()).toFixed(2)} s)`);
  ok(ABBOT.riteT.slice(1).every(t => t >= 2.4), `the rite is a long told kneel in every phase (${ABBOT.riteT.slice(1).join(' / ')} s)`); }

// ---- the marks: three red, three yellow, and the rite wears none ----
{ const said = {};
  for (const [what, o] of [['censer', { px: 1080, x: 1100 }], ['cast', { px: 950, x: 1100 }], ['swing', { px: 600, x: 1100 }], ['gleam', { px: 600, x: 1100 }],
                           ['coals', { px: 1080, x: 1100 }], ['knell', { px: 1080, x: 1100, hp: 1500 }]]) {
    const r = rig({ ...o, riteCd: 999 }); const mode = what + 'Tell';
    for (let i = 0; i < 60 * 200 && !said[what]; i++) { updateFalseAbbot(r.e, DT, r.c); r.e.riteCd = 999;
      if (r.e.mode === mode) said[what] = r.log.said[r.log.said.length - 1]; } }
  for (const ph of [1, 2, 3]) { const r = until('riteTell', { px: 1080, x: 1100, hp: [0, ABBOT.hp, ABBOT.hp * 0.5, ABBOT.hp * 0.25][ph], adds: 2 }, 60);
    said['rite' + ph] = r && r.log.said[r.log.said.length - 1]; }
  ok(Object.values(said).filter(Boolean).length === 9, `each windup says itself as it starts (${Object.values(said).filter(Boolean).length}/9)`);
  ok(said.swing?.red && said.coals?.red && said.knell?.red, 'THE BELL ROPE, THE COALS and THE KNELL wear the red mark: nothing turns them');
  ok(said.censer && !said.censer.red && said.cast && !said.cast.red && said.gleam && !said.gleam.red, 'THE CENSER, THE CHAIN and FALSE LIGHT wear the yellow one: a shield turns them');
  ok(said.rite1?.quiet && /BRIDGE.*BELL/.test(said.rite1.m) && /BASKET.*CHAIR/.test(said.rite2?.m) && /WHEEL.*COME DOWN/.test(said.rite3?.m),
    `and THE RITE wears none (it throws no blow) but says what to do with the house: "${said.rite1?.m}" / "${said.rite2?.m}" / "${said.rite3?.m}"`); }

// ---- THE CENSER, THE CHAIN and FALSE LIGHT are blockable; THE SLAM and THE KNELL are not ----
{ const soft = [], hard = [];
  for (const [what, bucket] of [['censer', soft], ['cast', soft], ['knell', hard]]) {
    const r = rig({ mode: what + 'Tell', modeT: 0.01, px: 1090, x: 1100, hp: what === 'knell' ? 1500 : ABBOT.hp, riteCd: 99 });
    r.run(1.2); bucket.push(...r.log.hits.map(h => h.hard)); }
  { const r = until('gleamTell', { px: 600, x: 1100, riteCd: 99 }); r.run(ABBOT.tell.gleam + 0.05); r.run(ABBOT.lightT + 0.1); soft.push(...r.log.hits.map(h => h.hard)); }
  { const r = until('swingTell', { px: 600, x: 1100, riteCd: 99 }); r.e.orb = null; r.P.x = r.e.swTo; r.run(ABBOT.tell.swing + ABBOT.swingT + 0.05); hard.push(...r.log.hits.filter(h => h.name === 'THE CENSER SLAM').map(h => h.hard)); }
  ok(soft.length >= 3 && soft.every(h => h === false), `the censer, the chain and the false light are blows a shield can turn (${soft.length} landed, none unblockable)`);
  ok(hard.length >= 2 && hard.every(h => h === true), `the rope's censer slam and the knell are not (${hard.length} landed, all unblockable)`); }

// ---- FALSE LIGHT: lobbed onto a MARKED spot, and you can step off it ----
{ const r = until('gleamTell', { px: 600, x: 1100, riteCd: 99 });
  ok(!!r && r.e.lightAim !== undefined, `FALSE LIGHT is told ${ABBOT.tell.gleam} s, its mark on you`);
  r.run(ABBOT.tell.gleam + 0.02); const tx = r.e.orb && r.e.orb.tx;
  ok(!!r.e.orb && Math.abs(tx - 600) < 4, `it is thrown at the spot you stood on (${tx})`);
  r.P.x = tx + ABBOT.lightR + 12; r.run(ABBOT.lightT + 0.1);
  ok(!r.e.orb && r.log.hits.length === 0, 'stepped off the mark, the burst finds nobody');
  const q = until('gleamTell', { px: 600, x: 1100, riteCd: 99 }); q.run(ABBOT.tell.gleam + ABBOT.lightT + 0.15);
  ok(q.log.hits.some(h => h.name === 'FALSE LIGHT'), 'stood on it, it lands'); }

// ---- THE COALS are floor fire, laid along the boards ----
{ const r = rig({ mode: 'coalsTell', modeT: 0.01, riteCd: 99 }); r.run(0.6);
  ok(r.log.fires.length === ABBOT.coals, `THE COALS lay ${r.log.fires.length} fires along the boards`);
  const xs = r.log.fires.map(f => f.x), span = Math.max(...xs) - Math.min(...xs);
  ok(span >= ABBOT.coalStep * (ABBOT.coals - 1) - 1, `spread over ${Math.round(span)} px, not in a heap`); }

// ---- THE CHAIN both ways, and THE BELL ROPE toward you ----
{ const r = rig({ mode: 'castTell', modeT: 0.01, x: 1100, px: 1000, block: true, riteCd: 99 });
  const x0 = r.e.x; r.run(1.0);
  ok(r.e.x < x0 - ABBOT.castPull * 0.9 && r.log.said.some(s => /HAULS HIM/.test(s.m)), `THE CHAIN GUARDED HAULS HIM: ${Math.round(x0 - r.e.x)} px toward the shield that turned it, and says so`);
  const q = rig({ mode: 'castTell', modeT: 0.01, x: 1100, px: 1000, block: false, riteCd: 99 });
  const qx = q.e.x; q.run(0.3);
  ok(q.log.reels.length === 1 && Math.abs(q.e.x - qx) < 2, `TAKEN, the chain reels YOU in instead (${q.log.reels.length} reel)`);
  const sw = until('swingTell', { px: 700, x: 1100, riteCd: 99 });
  ok(!!sw && Math.abs(sw.e.swTo - 700) < 2 && sw.log.sounds.includes('rope'), `THE BELL ROPE swings toward you, onto your spot (${sw && Math.round(sw.e.swTo)}), the rope heard first`);
  const mark = sw.e.swTo; sw.P.x = 640; sw.run(ABBOT.tell.swing + ABBOT.swingT * 0.5);
  ok(sw.e.mode === 'swing' && sw.e.y < FLOOR - ABBOT.swingH * 0.6, `he is off the boards, on the rope (${Math.round(FLOOR - sw.e.y)} px up)`);
  sw.run(ABBOT.swingT * 0.5 + 0.05);
  ok(Math.abs(sw.e.x - mark) < 1 && sw.e.mode === 'land' && !sw.log.hits.some(h => h.name === 'THE CENSER SLAM'), `he lands ON THE MARK, and a hero who stepped off it is not slammed`); }

// ---- THE HOUSE: where he can stand, and the rope takes him UP to you ----
{ const r = rig();
  ok(abbotHighSpans(r.e, HOUSE).length === 2, `the belfry's high boards: two runs while both bridges hang (${JSON.stringify(abbotHighSpans(r.e, HOUSE))})`);
  ok(abbotLevelOf(r.e, HOUSE, { x: 500, y: DECK, ground: true }, FLOOR) === 'high' && abbotLevelOf(r.e, HOUSE, { x: 500, y: FLOOR, ground: true }, FLOOR) === 'floor', 'a hero on a bridge is HIGH, on the floor under it is not');
  const up = until('swingTell', { px: 500, py: DECK, x: 1000, riteCd: 99 });
  ok(!!up && up.e.swDeck === 'high' && up.e.swY === DECK, `you on the bridge, his rope takes him UP onto it (to ${up && up.e.swDeck} at ${up && up.e.swY})`);
  up.run(ABBOT.tell.swing + ABBOT.swingT + 0.05);
  ok(up.e.deck === 'high' && up.e.y === DECK, 'and he lands on the bridge with you');
  up.P.y = FLOOR; up.P.x = 520; let down = false; for (let i = 0; i < 60 * 8 && !down; i++) { updateFalseAbbot(up.e, DT, up.c); up.e.riteCd = 99; if (up.e.mode === 'swing' && up.e.swDeck === 'floor') down = true; }
  ok(down, 'you drop back to the floor and he takes the rope down after you'); }

// ---- P1 THE BELL BRIDGES: he prays mid-bridge under its bell, and the bell drops the bridge WITH HIM ----
{ const r = until('riteTell', { px: 900, x: 1000, hp: ABBOT.hp }, 30);
  const br = r && HOUSE.bridges[r.e.riteBr];
  ok(!!r && r.e.deck === 'high' && br && r.e.x > br.x0 && r.e.x < br.x1, `HE GOES UP ONTO A BRIDGE TO PRAY: bridge ${r && r.e.riteBr}, at ${r && Math.round(r.e.x)} on the boards`);
  const hp0 = r.e.hp; r.run(0.5);
  const res = abbotBridgeBell(r.e, r.e.riteBr, r.c);
  ok(res === 'him' && r.e.mode === 'fall' && r.log.bridges.some(([i, u]) => i === r.e.riteBr && !u), 'STRIKE ITS BELL: the bridge drops (its tiles taken up), and he goes with it');
  r.run(0.6);
  ok(r.e.mode === 'downed' && r.e.y === FLOOR && abbotOpen(r.e) && r.e.hp <= hp0, 'he lands STUNNED below - THE OPENING - and the prayer never healed him');
  ok(abbotTake(r.e) === ABBOT.downMul && r.log.dazed >= 1 && r.log.broke >= 1, `a blow there is worth ${ABBOT.downMul}x; his blessings break and his congregation is dazed`);
  ok(r.log.said.some(s => /THE HOUSE ANSWERS/.test(s.m)), 'and it says THE HOUSE ANSWERS THE BLOW');
  r.run(ABBOT.rehang);
  ok(r.log.bridges.some(([i, u]) => i === r.e.riteBr && u) && r.log.said.some(s => /HAULED BACK/.test(s.m)), `the bridge is hauled back up after ${ABBOT.rehang} s, told first`);
  const q = rig({ px: 900, x: 1000 }); q.run(0.1);
  ok(abbotBridgeBell(q.e, 0, q.c) === 'empty' && q.e.mode !== 'fall' && !abbotOpen(q.e), 'the same bell with him on the floor: the bridge drops empty and he is not touched - the opening is the PLACE');
  ok(abbotBridgeBell(q.e, 0, q.c) === 'down', 'and a bridge that is down cannot drop twice'); }

// ---- P2 THE CHAIR: he prays up in it, out of reach - ride the basket down and it spills him ----
{ const r = until('riteTell', { px: 900, x: 1000, hp: ABBOT.hp * 0.5 }, 30);
  ok(!!r && r.e.phase === 2 && r.log.said.some(s => /CUTS HIS BRIDGES/.test(s.m)) && r.log.bridges.filter(([, u]) => !u).length === 2, 'PHASE TWO: he cuts both bridges down (told)');
  ok(r.e.deck === 'chair' && Math.abs(r.e.x - HOUSE.chairX) < 1 && r.e.y < FLOOR - 90, `and prays IN HIS CHAIR, ${Math.round(FLOOR - r.e.y)} px over the floor, out of a blade's reach`);
  ok(abbotBridgeBell(r.e, 0, r.c) === 'gone', 'the bridges\' bells do nothing now: he cut them');
  for (let k = 0; k <= 1.0001; k += 0.05) { r.setBasket(k); r.run(0.05); if (r.e.mode === 'fall' || r.e.mode === 'downed') break; }
  ok(r.e.mode === 'fall' || r.e.mode === 'downed', 'RIDE THE BASKET DOWN: the chair comes down with it and spills him out');
  r.run(0.8); ok(r.e.mode === 'downed' && abbotOpen(r.e) && !abbotBlessed(r.e), 'he lands stunned = THE OPENING, unwarded');
  ok(r.log.said.some(s => /THROWN OUT/.test(s.m)), 'and it says HIS CHAIR COMES DOWN: HE IS THROWN OUT');
  /* (claude/abbotp2) THE READ: the chair is a ward (B15's 0.4, never less, never a wall), the line names the basket, the spill has a payoff hook, the cue draws */
  { const v = until('riteTell', { px: 900, x: 1000, hp: ABBOT.hp * 0.5 }, 30);
    ok(abbotInChair(v.e) && abbotTake(v.e) === ABBOT.wardTake && ABBOT.wardTake >= 0.4, `a blow that finds him IN HIS CHAIR is turned to B15's ${ABBOT.wardTake} (told WARDED in main.js), never less than 0.4`);
    ok(/BASKET DOWN/.test(CHAIR_SAY.ride) && /CHAIR/.test(CHAIR_SAY.ride) && CHAIR_SAY.ride === v.log.said.filter(s => s.quiet).map(s => s.m).find(m => /BASKET/.test(m)), 'the line he prays under names the action: ' + CHAIR_SAY.ride);
    let spilled = 0; v.c.spill = () => spilled++; for (let k = 0; k <= 1.0001; k += 0.05) { v.setBasket(k); v.run(0.05); if (v.e.mode === 'fall' || v.e.mode === 'downed') break; }
    ok(spilled === 1 && !abbotInChair(v.e) && abbotTake(v.e) === ABBOT.downMul, 'the spill fires its payoff hook once, and the opening is double');
    const cvs = { width: 320, height: 180 }, calls = { arc: 0, rect: 0 }, g = new Proxy({ canvas: cvs }, { get: (t, k) => k in t ? t[k] : (k === 'arc' ? () => calls.arc++ : k === 'fillRect' ? () => calls.rect++ : () => {}), set: (t, k, val) => { t[k] = val; return true; } });
    const sit = until('riteTell', { px: 900, x: 1000, hp: ABBOT.hp * 0.5 }, 30), H2 = { ...HOUSE, basketY0: 448 };
    let threw = null; try { drawAbbotHouse(g, sit.e, H2, 400, 300, 1.2, FLOOR, 0); const n0 = calls.rect; sit.e.deck = 'floor'; drawAbbotHouse(g, sit.e, H2, 400, 300, 1.2, FLOOR, 0); const n1 = calls.rect - n0; sit.e.deck = 'chair'; const n2 = (() => { const a = calls.rect; drawAbbotHouse(g, sit.e, H2, 400, 300, 1.2, FLOOR, 0); return calls.rect - a; })(); ok(n2 > n1, `the basket cue draws only while he sits in the chair (${n2} rects vs ${n1})`); } catch (er) { threw = er; }
    ok(!threw, 'drawAbbotHouse draws the cue without throwing' + (threw ? ': ' + threw.message : '')); }
  const q = until('riteTell', { px: 900, x: 1000, hp: ABBOT.hp * 0.5 }, 30); q.run(ABBOT.riteT[2] + 0.6);
  ok(abbotBlessed(q.e) && (q.e.deck !== 'chair' || q.e.mode === 'swingTell' || q.e.mode === 'swing'), 'left alone the chair rite wards him, and blessed he comes down out of it to fight');
  const w = rig({ px: 900, x: 1000, hp: ABBOT.hp * 0.5 }); w.setBasket(1); let went = false; for (let i = 0; i < 60 * 3; i++) { updateFalseAbbot(w.e, DT, w.c); if (w.e.swDeck === 'chair') went = true; }
  ok(!went, 'with the basket down (the chair on the floor) he does not try to sit in it'); }

// ---- P3 THE WHEEL: he prays at the wheel, his censer smoking; the wheel spoils it, a plunge breaks him ----
{ const r = until('riteTell', { px: 900, x: 1000, hp: ABBOT.hp * 0.25 }, 30);
  ok(!!r && r.e.phase === 3 && r.log.phase3 === 1 && r.log.said.some(s => /WHEEL TURNS FOR HIM/.test(s.m)), 'PHASE THREE: his wheel is set up (told)');
  const wh = HOUSE.wheels[r.e.riteWheel];
  ok(!!wh && Math.abs(r.e.x - wh.spotX) < 1 && r.e.deck === 'floor', `he prays at the wheel nearest you (wheel ${r.e.riteWheel}, at ${Math.round(r.e.x)})`);
  ok(r.e.smoke && Math.abs(r.e.smoke.x - wh.smokeX) < 1, 'his censer is set down beside him and SMOKES: the column that lifts you over him');
  const far = until('riteTell', { px: 600, x: 1300, hp: ABBOT.hp * 0.25 }, 30); ok(far && far.e.riteWheel === 0, 'with you at the west end he takes the west wheel: the device is always near you');
  ok(abbotPlunge(r.e, r.c) && r.e.mode === 'downed' && !r.e.smoke, 'COME DOWN ON HIM: a plunge is THE OPENING');
  const w = until('riteTell', { px: 900, x: 1000, hp: ABBOT.hp * 0.25 }, 30); ok(abbotWheelStruck(w.e), 'a blow on the wheel he prays at takes'); w.run(DT * 2);
  ok(w.e.mode === 'spoiled' && !abbotBlessed(w.e) && w.log.said.some(s => /WHEEL TURNS AGAINST HIM/.test(s.m)), 'STRIKE THE WHEEL: the rite is spoiled, no heal, no ward');
  const b = rig({ px: 900, x: 1000, hp: ABBOT.hp * 0.25, blessT: 3 }); b.run(0.1);
  ok(abbotPlunge(b.e, b.c) && abbotOpen(b.e), 'warded after a prayer, a plunge breaks the ward and opens him too: the house turned on him');
  const p1 = until('riteTell', { px: 900, x: 1000 }, 30); ok(abbotPlunge(p1.e, p1.c) && (p1.run(DT * 2), p1.e.mode === 'spoiled'), 'in phase one a plunge on him praying spoils the rite, as it always did'); }

// ---- THE FINALE: beaten down at 5%, the great bell is the last blow ----
{ const r = rig({ px: 900, x: 1000, hp: ABBOT.hp * 0.08, phase: 3 }); r.run(0.1);
  const big = abbotClamp(r.e, 9999), floorHp = Math.ceil(ABBOT.hp * ABBOT.beatAt);
  ok(r.e.hp - big === floorHp && r.e.beatNow, `in phase three a killing blow beats him DOWN instead, at ${floorHp} (5%)`);
  r.e.hp -= big; r.run(DT * 2);
  ok(r.e.mode === 'beaten' && r.log.said.some(s => /RING THE GREAT BELL/.test(s.m)), 'he kneels, and says RING THE GREAT BELL');
  ok(abbotTake(r.e) === ABBOT.beatTake && ABBOT.beatTake >= 0.4, `the blade on him beaten is B15's floor (${ABBOT.beatTake}): slow, never nothing`);
  ok(abbotBellRung(r.e, BELL, r.c) === 'finish', 'THE GREAT BELL rung now: the note goes through him - the last blow');
  const q = rig({ px: 900, x: 1000, hp: ABBOT.hp * 0.08, phase: 3 }); q.run(0.1); q.e.hp -= abbotClamp(q.e, 9999); q.run(ABBOT.beatT + 0.2);
  ok(q.e.mode !== 'beaten' && q.e.beatCd > 0 && abbotClamp(q.e, 9999) === 9999, 'not rung, he gets up after the window - and then the blade can finish him (never a wall)');
  const n = rig({ px: 900, x: 1000 }); ok(abbotBellRung(n.e, BELL, n.c) === 'cold' && !abbotOpen(n.e), 'any other time the great bell only rings: it is the last blow, not the whole fight');
  ok(abbotClamp(rig({ hp: 100 }).e, 9999) === 9999, 'and in phase one nothing clamps'); }

// ---- THE RITE: it heals him and wards him, and the house is worth far more than the blade ----
{ const r = rig({ mode: 'riteTell', modeT: 0.01, hp: 1000, flat: true }); r.setAdds(3); r.run(0.6);
  ok(abbotBlessed(r.e) && r.e.hp - 1000 >= Math.floor(ABBOT.hp * 0.075), `THE RITE blesses HIM and HEALS him ~8% (${r.e.hp - 1000})`);
  ok(abbotTake(r.e) === ABBOT.wardTake && ABBOT.wardTake >= 0.4 && ABBOT.wardTake < 1, `a warded Abbot takes ${ABBOT.wardTake} of every blow: B15's floor, never a wall`);
  ok(r.log.blessed === 3, `his congregation is blessed with him (${r.log.blessed})`);
  /* THE CLAIM THE FIGHT RESTS ON, measured both ways: a hero who only swings, and one who turns the house on him each time he prays */
  const swung = (useHouse) => { const q = rig({ px: 900, x: 960 }); let t = 0, prayT = 0;
    while (q.e.alive && q.e.hp > 0 && t < 400) { updateFalseAbbot(q.e, DT, q.c); t += DT;
      const reach = Math.abs(q.e.y - FLOOR) < 30;   /* a blade reaches him on the floor only (not on a bridge, not in his chair) */
      if (reach && Math.floor(t / (1 / 3)) !== Math.floor((t - DT) / (1 / 3))) { let d = Math.round(14 * abbotTake(q.e)); d = abbotClamp(q.e, d); q.e.hp -= d; }
      if (q.e.mode === 'beaten' && useHouse) { abbotBellRung(q.e, BELL, q.c); q.e.hp = 0; }
      prayT = abbotPraying(q.e) ? prayT + DT : 0;
      if (useHouse && prayT > 1.0) { const ph = q.e.riteAt;
        if (ph === 1) abbotBridgeBell(q.e, q.e.riteBr, q.c); else if (ph === 2) q.setBasket(1); else abbotPlunge(q.e, q.c); }
      if (useHouse && q.e.phase === 2 && !abbotPraying(q.e) && q.e.mode !== 'fall') q.setBasket(Math.max(0, (q.c.basketK()) - DT)); }
    return t; };
  const noHouse = swung(false), withHouse = swung(true);
  ok(noHouse > 60, `SWINGING ALONE, in a best case nobody gets: ${Math.round(noHouse)} s`);
  ok(withHouse < noHouse * 0.5, `AND THE HOUSE IS THE FIGHT, not decoration: ${Math.round(withHouse)} s with it against ${Math.round(noHouse)} s without - it has to be worth at least double`);
  const warded = (() => { const q = rig({ px: 900, x: 960 }); let on = 0, n = 0;
    for (let i = 0; i < 60 * 120; i++) { updateFalseAbbot(q.e, DT, q.c); n++; if (abbotBlessed(q.e) || abbotPraying(q.e) || q.e.deck !== 'floor') on++; } return on / n; })();
  ok(warded > 0.6, `left alone the house keeps him out of the blade's way: warded, praying or up on his boards ${Math.round(warded * 100)}% of two minutes`); }

// ---- THE RITE SPOILED the old ways too: a stagger on the prayer ----
{ const st = until('riteTell', { px: 1080, x: 1100, adds: 2, flat: true }); st.e.stagger = 0.6; st.run(DT * 2);
  ok(st.e.mode === 'spoiled' && !abbotBlessed(st.e), 'a blow that staggers him on it spoils it');
  let re = false; for (let i = 0; i < 60 * (ABBOT.riteCd - 1.4); i++) { updateFalseAbbot(st.e, DT, st.c); if (st.e.mode === 'riteTell') re = true; }
  ok(!re, `and he cannot kneel again for a while (${ABBOT.riteCd} s): he fights unwarded`);
  const nb = rig({ px: 1060, x: 1100 }); ok(!abbotSpoil(nb.e, 'plunge') && !abbotPraying(nb.e), 'a spoil when he is not praying does nothing'); }

// ---- the congregation: a trickle ----
{ const r = rig({ px: 1060, x: 1100, riteCd: 999 }); r.e.addT = 0; let worst = 0;
  for (let i = 0; i < 60 * 120; i++) { updateFalseAbbot(r.e, DT, r.c); r.e.riteCd = 999; worst = Math.max(worst, r.c.adds()); }
  ok(worst <= ABBOT.adds, `THE CONGREGATION never has more than ${ABBOT.adds} on the floor at once in phase one (worst ${worst})`);
  ok(r.log.summons >= ABBOT.adds, `and it keeps coming: ${r.log.summons} up the ladder in two minutes`); }

// ---- the knell: phase two on ----
{ const q = rig({ px: 1060, x: 1100, hp: ABBOT.hp * 0.5, riteCd: 999 });
  let knelled = false; for (let i = 0; i < 60 * 120 && !knelled; i++) { updateFalseAbbot(q.e, DT, q.c); q.e.riteCd = 999; if (q.e.mode === 'knell') knelled = true; }
  ok(knelled && q.log.spent > 0, 'THE KNELL: from phase two he rings the great bell himself');
  const r = rig({ px: 1060, x: 1100, riteCd: 999 }); let k1 = false; for (let i = 0; i < 60 * 60; i++) { updateFalseAbbot(r.e, DT, r.c); r.e.riteCd = 999; if (r.e.mode === 'knellTell') k1 = true; }
  ok(!k1, 'and not before'); }

// ---- the frames: every mode has one ----
{ const modes = ['idle', 'stalk', 'censerTell', 'censer', 'castTell', 'cast', 'haul', 'swingTell', 'swing', 'land', 'gleamTell', 'gleam', 'coalsTell', 'coals', 'riteTell', 'rite', 'spoiled', 'knellTell', 'knell', 'downed', 'fall', 'beaten', 'sleep', 'wake'];
  const fs = modes.map(m => abbotFrame({ mode: m, anim: 0, vx: 0, hurtT: 0 }));
  ok(fs.every(f => Number.isInteger(f) && f >= 0 && f < ABBOT_FRAMES), `the frame table answers every mode (${Math.min(...fs)}-${Math.max(...fs)})`);
  ok(abbotFrame({ mode: 'stalk', anim: 0, vx: 0, hurtT: 0.2 }) === 17, 'and hurt is frame 17, over everything but a named mode');
  const own = ['swingTell', 'swing', 'land', 'gleamTell', 'gleam', 'riteTell', 'spoiled'].map(m => abbotFrame({ mode: m, anim: 0 }));
  ok(new Set(own).size === own.length && own.every(f => ![0, 1, 2, 17].includes(f)), `B16: the rope, the light and the prayer each have their own poses (${own.join(',')})`);
  ok(abbotChairY(HOUSE, FLOOR, 0) === HOUSE.chairY && abbotChairY(HOUSE, FLOOR, 1) > FLOOR - 10, 'his chair hangs high with the basket up, and is on the floor with it down'); }

/* THE WARD HAS TO HOLD AGAINST FIRE TOO (the burn tick lives in main.js) - pinned at the source */
{ const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const tick = main.split(String.fromCharCode(10)).find(l => l.includes('e.burnTick = 0.3'));
  ok(!!tick && tick.includes('wardedDamage(e, 2)') && !/e[.]hp -= 2[^0-9]/.test(tick), 'the burn tick goes through wardedDamage, not e.hp directly');
  ok(/function wardedDamage\(e, dmg(, blow)?(, tag = blow)?\)/.test(main), 'wardedDamage is still there');
  ok(main.includes('abbotClamp(e, dmg)') && main.includes('abbotPlunge(e, abbotCtx(e))'), 'the hurt path asks the house: the plunge, and the finale\'s floor');
  ok(main.includes("res === 'finish'"), 'the great bell finishes him beaten down'); }

console.log(fails ? `\n${fails} FAILED` : '\nall false abbot checks pass');
process.exit(fails ? 1 : 0);
