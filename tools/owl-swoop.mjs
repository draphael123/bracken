// tools/owl-swoop.mjs - THE OWL REEVE 2's PAIRS AND HER NEW MOVES, IN THE PAGE (claude/owl2, Daniel 2026-10-08).
//
// Daniel: "duck under the swoop". Her SWOOP runs at head height along a told HIGH line: a crouched hero is under her talons (not
// invulnerable - just not where she is), a standing one is in them. Her SKIM runs at the ankles: a jump clears it. For EVERY hero:
//   - down held on the boards ducks him (BK.duck().ducking) and his hurt box is DUCK_H tall
//   - a swoop run straight through him while he is ducked takes NOTHING, and she does pass through him (the control is real)
//   - the same swoop through him standing takes his blood (the control)
// And for the fight:
//   - THE BOUGH SHAKE: her cones fall in the shadows she drew - a hero in a shadow is struck, one in a gap between them is not
//   - THE LAMP DROP (phase two): she takes a lit floor lantern (it goes dark on its post), and its oil burns a strip of the boards under
//     where she held it: a hero in the strip is burned, one out of it is not
//   - the lamp crash is her big opening (x2 of a blow, the gold read), a blow outside one lands 0.4 (B15, off the twentieth), and as an
//     opening ends she wards (B3: nothing lands for OWL_WARD s, told)
//   - HER CYCLE: over 60 draws from her bag in each phase no move is more than 35% of them
//   - the page throws nothing
//   node tools/owl-swoop.mjs        (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { DUCK_H } from '../src/duck.js';
import { HEIGHT, ANSWER, MARK } from '../src/marks.js';

const HEROES = ['knight', 'pyro', 'paladin', 'pirate', 'reaper', 'warden', 'geomancer'];
const bad = [];
for (const [k, h, a] of [['owl|swoopTell', 'high', 'duck'], ['owl|skimTell', 'low', 'jump'], ['owl|shakeTell', 'low', 'dodge'], ['owl|lampTell', 'low', 'dodge']]) {
  if (HEIGHT[k] !== h) bad.push(`${k}: HEIGHT ${HEIGHT[k]}, not ${h}`); if (ANSWER[k] !== a) bad.push(`${k}: ANSWER ${ANSWER[k]}, not ${a}`); if (MARK[k] !== '!!') bad.push(`${k}: MARK ${MARK[k]}, not !!`); }

const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1; const out = { heroes: [], err: null };
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk', 'dodge']) K[k] = false; };
    let owl = null; const X = 45 * 16 + 8;
    const boot = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hanging')); BK.state = 'play'; BK.start(); BK.god = true; BK.sim(5); BK.reset();
      const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(150); none();
      owl = BK.enemies().find(e => e.t === 'owl' && e.alive); for (const e of BK.enemies()) if (e !== owl) e.alive = false;
      for (const p of BK.props()) if (p.owl) { p.lit = false; p.lampT = 0; p.wasBurning = false; }
      BK.god = false; return owl; };
    const home = () => { for (const e of BK.enemies()) if (e !== owl) e.alive = false; BK.P.x = X; BK.P.y = BK.L.arena.floor; BK.P.vx = 0; BK.P.vy = 0; none(); BK.sim(30); BK.P.hp = BK.P.maxHp; BK.P.inv = 0; BK.P.grace = 0; };
    /* her swoop, from her middle perch, run at a hero held at X: returns what he lost and whether she went through him */
    const swoop = duck => { home(); Object.assign(owl, { mode: 'takeoff', modeT: 0, willSwoop: true, grab: false, ward: 0, hitT: 0, eyesT: 99, x: owl.perches[1].x, y: owl.perches[1].y });
      let lost = 0, crossed = false, side = Math.sign(owl.x - BK.P.x), ducked = 0, frames = 0, swooped = false;
      for (let k = 0; k < 360; k++) { K.down = duck; const hp0 = BK.P.hp, m0 = owl.mode; BK.P.inv = 0; BK.sim(1); frames++; if (BK.P.hp < hp0 && (m0 === 'swoop' || owl.mode === 'swoop' || owl.mode === 'carry')) lost += hp0 - BK.P.hp;   /* (her talons only: the reaper's and the geomancer's own crouch twists move their blood about, src/crouch-b.js) */ if (BK.duck().ducking) ducked++;
        if (owl.mode === 'swoop') { swooped = true; if (Math.sign(owl.x - BK.P.x) !== side && side !== 0) crossed = true; side = Math.sign(owl.x - BK.P.x) || side; }
        if (swooped && owl.mode !== 'swoop') break; }
      none(); return { lost, crossed, swooped, ducked, frames, box: BK.duck().box.b - BK.duck().box.t };
    };
    for (const h of ${JSON.stringify(HEROES)}) { boot(h); if (!owl) return { err: 'no owl' };
      home(); K.down = true; BK.sim(12); const r = { h, ducking: BK.duck().ducking, duckH: BK.duck().box.b - BK.duck().box.t }; none(); BK.sim(10);
      r.duck = swoop(true); r.stand = swoop(false); out.heroes.push(r); }
    /* THE BOUGH SHAKE: a hero in a shadow, then one in a gap */
    boot('warden'); const shake = inGap => { home(); Object.assign(owl, { mode: 'boughGo', modeT: 0, tx: X, ward: 0, eyesT: 99 }); BK.sim(1);
      const xs = owl.shade ? owl.shade.slice() : []; if (!xs.length) return { err: 'no shadows' };
      const near = xs.sort((a, b) => Math.abs(a - X) - Math.abs(b - X)); const tx = inGap ? (near[0] + near[1]) / 2 : near[0]; BK.P.x = tx; BK.P.vx = 0; BK.P.hp = BK.P.maxHp;
      let lost = 0, fell = 0; for (let k = 0; k < 240; k++) { const hp0 = BK.P.hp; BK.P.inv = 0; BK.P.x = tx; BK.P.vx = 0; BK.sim(1); if (BK.P.hp < hp0) lost += hp0 - BK.P.hp; if (owl.cones) fell = owl.cones.filter(c => c.done).length; if (owl.mode === 'fly') break; }
      return { lost, shadows: xs.length, gap: Math.round(Math.abs(near[1] - near[0])), fell }; };
    out.shadeIn = shake(false); out.shadeGap = shake(true);
    /* THE LAMP DROP: phase two, one lamp lit */
    const drop = stayIn => { home(); owl.phase = 2; const lamp = BK.props().find(p => p.owl && !p.perch); lamp.lit = true; lamp.lampT = 14; lamp.wasBurning = true;
      Object.assign(owl, { mode: 'lampGo', modeT: 2.2, lampPr: lamp, ward: 0, eyesT: 99, x: owl.perches[1].x, y: owl.perches[1].y, oil: null, douseT: 99, ropeDone: true });
      let lost = 0, took = false, burned = 0, oilSeen = null, dropX = null; for (let k = 0; k < 480; k++) { const hp0 = BK.P.hp; BK.P.inv = 0;
        if (owl.mode === 'lampTell' && dropX === null) dropX = owl.dropX;
        if (dropX !== null && !stayIn) { BK.P.x = dropX + 90; BK.P.vx = 0; } else if (dropX !== null) { BK.P.x = dropX; BK.P.vx = 0; }
        BK.sim(1); if (BK.P.hp < hp0) lost += hp0 - BK.P.hp; if (owl.carryLamp && !lamp.lit) took = true; if (owl.oil) { oilSeen = oilSeen || { x0: owl.oil.x0, x1: owl.oil.x1 }; burned++; } if (oilSeen && !owl.oil) break; }
      lamp.lit = false; return { lost, took, burned, oil: oilSeen, dropX }; };
    out.dropIn = drop(true); out.dropOut = drop(false);
    /* THE NUMBERS: a blow on her in a lamp crash, on the boards, outside an opening, and in her ward */
    boot('knight'); home(); const blow = (set) => { Object.assign(owl, { mode: 'screech', modeT: 9, next: 1, lampT: 0, ward: 0, broken: 0, poise: 0, greedLog: [], greedT: 0, greedCd: 1e9, chipAcc: 0, x: X + 10, y: BK.L.arena.floor - 8 }, set); const h0 = owl.hp; BKT.hurtAs('light', owl, 20, owl.x - 12, false); const t = h0 - owl.hp; owl.hp = h0; return t; };
    out.dmg = { lampCrash: blow({ mode: 'crash', modeT: 2.5, lampT: 4 }), boards: blow({ mode: 'grounded', modeT: 3 }), outside: blow({}), ward: blow({ ward: 3 }) };
    { let s = 0; for (let i = 0; i < 10; i++) s += blow({}); out.dmg.outside10 = s; }
    /* the ward comes up as an opening ends, told */
    home(); Object.assign(owl, { mode: 'crash', modeT: 0.05, lampT: 4, ward: 0, openMax: 0, stagger: 0.05 }); for (let k = 0; k < 30; k++) BK.sim(1); out.wardAfter = owl.ward;
    /* HER CYCLE: draw her bag 60 times a phase, the hero on the boards beside her */
    const cycle = ph => { home(); owl.phase = ph; owl.bag = null; owl.moves = {}; owl.lastMove = null; const lamp = BK.props().find(p => p.owl && !p.perch);
      for (let n = 0; n < 60; n++) { lamp.lit = true; lamp.lampT = 14; Object.assign(owl, { mode: 'sit', modeT: 0, perchI: 1, hits: 0, x: owl.perches[1].x, y: owl.perches[1].y, hootCd: 99, skimCd: 0, ropeDone: true, douseT: 99 });
        for (const e of BK.enemies()) if (e !== owl) e.alive = false; BK.P.x = X; BK.P.y = BK.L.arena.floor; BK.P.hp = BK.P.maxHp; BK.sim(1); }
      lamp.lit = false; return owl.moves; };
    out.cycle1 = cycle(1); out.cycle2 = cycle(2);
    return out;
  })()`, 600000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }

if (R.err) bad.push(R.err);
else {
  for (const r of R.heroes) {
    console.log('hero', JSON.stringify(r));
    if (!r.ducking) bad.push(`${r.h}: down held on the boards did not duck`);
    if (r.duckH !== DUCK_H) bad.push(`${r.h}: ducked hurt box ${r.duckH} px, not DUCK_H ${DUCK_H}`);
    if (!r.duck.swooped || !r.duck.crossed) bad.push(`${r.h}: her swoop did not run through the ducked hero (${JSON.stringify(r.duck)})`);
    if (r.duck.lost > 0) bad.push(`${r.h}: ducked under the swoop and lost ${r.duck.lost}`);
    if (!(r.stand.lost > 0)) bad.push(`${r.h}: standing in the swoop lost nothing (the control): ${JSON.stringify(r.stand)}`);
  }
  console.log('bough', JSON.stringify(R.shadeIn), JSON.stringify(R.shadeGap));
  if (R.shadeIn.err || R.shadeGap.err) bad.push('the bough shake: ' + (R.shadeIn.err || R.shadeGap.err));
  else { if (!(R.shadeIn.lost > 0)) bad.push('the bough shake: a hero in a shadow was not struck'); if (R.shadeGap.lost > 0) bad.push('the bough shake: a hero in the gap between shadows was struck');
    if (!(R.shadeIn.shadows >= 4)) bad.push('the bough shake: fewer than four shadows'); if (!(R.shadeIn.gap >= 30)) bad.push('the bough shake: the gap between shadows is ' + R.shadeIn.gap + ' px (a hero must stand in it)'); }
  console.log('lamp', JSON.stringify(R.dropIn), JSON.stringify(R.dropOut));
  if (!R.dropIn.took) bad.push('the lamp drop: she never took the lamp off its post');
  if (!R.dropIn.oil || !(R.dropIn.burned > 60)) bad.push('the lamp drop: no strip of oil burned for a second or more');
  if (!(R.dropIn.lost > 0)) bad.push('the lamp drop: a hero in the strip was not burned'); if (R.dropOut.lost > 0) bad.push('the lamp drop: a hero out of the strip was burned');
  const D = R.dmg; console.log('blows of 20', JSON.stringify(D), 'ward after an opening', R.wardAfter);
  if (D.lampCrash !== 40) bad.push(`a blow of 20 in her lamp crash took ${D.lampCrash}, not 40 (x2)`);
  if (!(D.boards >= 28 && D.boards <= 32)) bad.push(`a blow of 20 on her on the boards took ${D.boards}, not ~30 (x1.5)`);
  if (!(D.outside10 >= 79 && D.outside10 <= 81)) bad.push(`ten blows of 20 outside an opening took ${D.outside10}, not 80 (0.4: B15, off the twentieth)`);
  if (D.ward !== 0) bad.push(`a blow in her ward took ${D.ward}, not 0 (B3)`);
  if (!(R.wardAfter > 2.4)) bad.push(`no ward as her opening ended (${R.wardAfter})`);
  for (const [ph, c] of [[1, R.cycle1], [2, R.cycle2]]) { const n = Object.values(c).reduce((a, b) => a + b, 0); console.log('cycle ' + ph, n, JSON.stringify(c));
    if (n < 55) bad.push(`phase ${ph}: only ${n} moves drawn`); for (const [k, v] of Object.entries(c)) if (v / n > 0.35) bad.push(`phase ${ph}: ${k} is ${Math.round(100 * v / n)}% of her cycle (> 35%)`);
    if (!(c.bough > 0)) bad.push(`phase ${ph}: no bough shake`); if (ph === 2 && !(c.lampdrop > 0)) bad.push('phase 2: no lamp drop'); if (ph === 1 && c.lampdrop) bad.push('phase 1: a lamp drop (it is phase two\'s move)'); }
}
assert.deepEqual(bad, [], 'the owl reeve 2:\n  ' + bad.join('\n  '));
console.log(`the reeve holds: ${R.heroes.length} heroes duck under her swoop for nothing and are struck standing, the bough's shadows and the lamp's strip strike only who stands in them, x2 in the lamp crash, 0.4 outside, her ward after, and no move over 35% of her cycle`);
