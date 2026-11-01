// tools/gorm3.mjs - KING GORM 3 (claude/gorm3, Daniel 11-01; Node, no page): his three new things, checked on his hands and AI in a fake world
// (the same fake world as tools/gorm2.mjs):
//   THE PITCH POT (P1): thrown only at a hero PERCHED over the hall floor for GORM.pot.perch s - never at a hero on the floor, not when he comes down
//     in the windup; told (potTell, then pot); it lands where he stood (the ring), hurts in its burst, leaves a burning-pitch patch (a drain) that
//     goes out; a cooldown between throws; on the litter and on his feet.
//   THE SCEPTRE THROW (P2): told (sceptreTell), out LOW (hits a hero on the ground, a jump clears it), back HIGH (hits a standing hero, a duck clears
//     it), back to his hand (sceptreCatch), the club back after.
//   THE ENRAGE (P2 at GORM.rageAt): told (rageTell, no blow), the music lifts, the horn calls ONE boar (no hounds), his cooldowns run faster;
//     THE BURNING CHARGE only in rage: told (burnChargeTell), runs the glade, a fire trail behind (a drain) that fades; jumped, it misses.
//   Openings still work in rage (a cage holds him); B15's 0.4 is unchanged; every new release comes straight out of its own windup.
import './gorm2-dom.mjs';
import { LEVELS, T } from '../src/level.js';
import { GORM, gormTake } from '../src/gorm.js';
import { makeGormHands } from '../src/gorm-hands.js';
import { updateGorm, perched } from '../src/gorm-king.js';
import { MARK, BY_HAND } from '../src/marks.js';
import { POSES } from '../src/redraw/gorm_poses.js';
const TS = 16; let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'kings'), L = lv.build(), G = L.gorm, W = L.W, gl = L.glade;
const cell = (x, y) => L.grid[y * W + x], solid = (x, y) => cell(x, y) === T.SOLID, oneway = (x, y) => cell(x, y) === T.ONEWAY || cell(x, y) === T.PLANK;
const cages = L.ents.filter(e => e.t === 'dropcage' && e.boss);
function world() {
  const lvl = { ...L, arena: L.arena, glade: L.glade, gorm: G }; const props = cages.map(c => ({ t: 'dropcage', x: c.x * TS + 8, y: (c.y + 1) * TS, y0: (c.y + 1) * TS, dropped: false, landed: 0, hit: new Set(), boss: true, resetT: 0, big: true }));
  const P = { x: 430 * TS, y: 14 * TS, vx: 0, vy: 0, hp: 140, maxHp: 140, h: 18, face: 1, ground: true, dead: 0 };
  const king = { t: 'king', stage: 'court', x: 448 * TS, y: 14 * TS, w: 68, h: 45, hp: 900, maxHp: 900, alive: true, mode: 'carried', modeT: 1, phase: 1, face: -1, anim: 0 };
  const W0 = { L: lvl, P, props, enemies: [king], king, bossActive: true, drains: {}, hits: [], music: null, t: 0 };
  const ctx = { get L() { return W0.L; }, TS, T, sfx: {}, P: () => P, enemies: () => W0.enemies, boss: () => king, bossActive: () => W0.bossActive, props: () => props, keys: () => ({}), time: () => W0.t, VW: () => 640, VH: () => 360,
    number: () => {}, burst: () => {}, dust: () => {}, part: () => {}, shake: () => {}, zoom: () => {}, ring: () => {}, damage: (x, d, o) => { W0.hits.push((o && o.name) || '?'); return 'hit'; }, hurt: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; },
    drain: (id, r) => { W0.drains[id] = r; }, drainStop: id => { delete W0.drains[id]; }, endFight: () => { W0.bossActive = false; }, solid: (tx, ty) => solid(tx, ty), solidPx: (x, y, f) => solid(Math.floor(x / TS), Math.floor(y / TS)) || (!!f && oneway(Math.floor(x / TS), Math.floor(y / TS)) && (y % TS) < 6),
    moveBody: (e, dx, dy) => { e.x += dx; e.y = Math.min(e.y + dy, (e.stage === 'glade' ? gl.floor : 14 * TS)); return { ground: true }; }, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, text: () => {}, hint: () => {}, spawn: e => { W0.enemies.push(e); return e; }, ehp: () => 10,
    music: on => { W0.music = on; } };
  const H = makeGormHands(ctx); H.reset();
  const c = { arena: () => W0.L.arena, P: () => P, hands: H, enemies: () => W0.enemies, gormData: () => G, number: () => {}, sfx: {}, shake: () => {}, zoom: () => {}, dust: () => {}, burst: () => {}, part: () => {}, ring: () => {},
    damage: (x, d, o) => { W0.hits.push((o && o.name) || '?'); return 'hit'; }, moveBody: (e, dx, dy) => { e.x += dx; return { ground: true }; }, dmg: { grab: 22, litter: 24, sweep: 20, club: 18 }, music: on => { W0.music = on; } };
  const modes = []; let last = '';
  const step = (n, fn) => { for (let i = 0; i < n; i++) { W0.t += 0.01; if (fn) fn(i); updateGorm(king, 0.01, c); H.update(0.01); if (king.mode !== last) { modes.push(king.mode); last = king.mode; } } };
  return { W0, H, c, P, king, step, modes };
}
const pre = (order, m) => { const out = []; for (let i = 1; i < order.length; i++) if (order[i] === m) out.push(order[i - 1]); return out; };
const deck = G.hall.ropes[1].deck, deckY = deck[2], deckX = (deck[0] + deck[1]) / 2;

console.log('THE PITCH POT (P1)');
ok(oneway(Math.floor(deckX / TS), deckY / TS) || solid(Math.floor(deckX / TS), deckY / TS), 'a rope\'s deck is a surface over his floor (where a hero perches)');
{ const { W0, H, P, king, step, modes } = world();
  P.x = king.x - 140; P.y = 14 * TS; step(1500, () => { P.x = king.x - 140; for (const q of W0.enemies) if (q.t === 'royalboar') q.alive = false; });
  ok(!modes.includes('potTell') && H.read().n.pots === 0, 'NEVER at a hero on his floor (15 s on the floor: no pot) ' + modes.filter(m => /pot/.test(m)).join(','));
  ok(perched({ ground: true, y: deckY }, 14 * TS) && !perched({ ground: true, y: 14 * TS }, 14 * TS) && !perched({ ground: false, y: deckY }, 14 * TS), 'perched = standing over his floor (on a deck), not on the floor, not in the air');
  let at = -1; P.x = deckX; P.y = deckY; P.ground = true; const t0 = W0.t;
  for (let i = 0; i < 800 && !(H.read().n.pots >= 1 && !H.read().pots.length); i++) step(1, () => { P.x = deckX; P.y = deckY; P.ground = true; if (at < 0 && king.mode === 'potTell') at = W0.t - t0; for (const q of W0.enemies) if (q.t === 'royalboar') q.alive = false; });
  ok(at >= GORM.pot.perch - 0.02 && at < GORM.pot.perch + 2.5, 'perched on a deck: the pot is told after ' + at.toFixed(2) + ' s (>= ' + GORM.pot.perch + ' s up there)');
  ok(pre(modes, 'pot').every(m => m === 'potTell') && modes.includes('pot'), 'the throw comes straight out of its windup (potTell -> pot)');
  ok(H.read().n.pots >= 1 && W0.hits.includes('A PITCH POT'), 'it lands where he stood: the burst hurts a hero still on the ring (' + H.read().n.pots + ' pots)');
  step(5, () => { P.x = deckX; P.y = deckY; });
  const pz = H.read().pitch; ok(pz.length >= 1 && pz.every(z => Math.abs(z.y - deckY) < 2), 'a burning-pitch patch on the deck where it burst');
  ok(W0.drains.gormpitch > 0, 'standing in the pitch: a DRAIN (A13, no stagger)');
  const nPots = H.read().n.pots; let tells = 0, lastM = ''; const t1 = W0.t;
  step(Math.round((GORM.pot.every - 1.6) * 100), () => { P.x = deckX + 60; P.y = deckY; P.ground = true; if (king.mode === 'potTell' && lastM !== 'potTell') tells++; lastM = king.mode; for (const q of W0.enemies) if (q.t === 'royalboar') q.alive = false; });
  ok(tells === 0 && H.read().n.pots === nPots, 'a cooldown: no second pot inside ' + GORM.pot.every + ' s (a deterrent, not spam)');
  step(Math.round(GORM.pot.patchT * 100) + 50, () => { P.x = deckX + 60; P.y = 14 * TS; P.ground = true; });
  ok(H.read().pitch.length === 0 && !W0.drains.gormpitch, 'the pitch goes out after ' + GORM.pot.patchT + ' s');
  /* down off the deck during the windup: no throw */
  king.potT = 0; king.mode = 'carried'; king.modeT = 0; P.x = deckX; P.y = deckY; let told = false; const n0 = H.read().n.pots;
  step(400, () => { if (king.mode === 'potTell') told = true; if (told) { P.y = 14 * TS; P.ground = true; } else { P.y = deckY; P.ground = true; } for (const q of W0.enemies) if (q.t === 'royalboar') q.alive = false; });
  ok(told && H.read().n.pots === n0, 'down on his floor before the release: the pot is NOT thrown (never at the ground)');
  /* on his feet (the litter broken) he throws it too */
  king.phase = 2; king.mode = 'walk'; king.modeT = 0; king.h = 60; king.potT = 0; king.perchT = 0; const m0 = modes.length;
  step(500, () => { P.x = deckX; P.y = deckY; P.ground = true; for (const q of W0.enemies) if (q.t === 'royalboar') q.alive = false; });
  ok(modes.slice(m0).includes('potTell') && modes.slice(m0).includes('pot'), 'on his feet (the litter broken) he lobs it too');
}

console.log('THE SCEPTRE THROW (P2)');
const toGlade = () => { const w = world(); w.H.skipTo('glade'); w.W0.bossActive = true; Object.assign(w.king, { huntN: 2, mode: 'walk', modeT: 0, ward: 0, open: 0, clubT: 99, logT: 99, quakeT: 99, shakeT: 99, sceptreT: 0 }); w.P.y = gl.floor; w.P.ground = true; return w; };
{ const { W0, H, P, king, step, modes } = toGlade(); P.x = king.x - 150;
  let seen = null; step(300, () => { if (!seen && H.read().sceptres.length) seen = H.read().sceptres[0]; if (H.read().sceptres.length) { const s = H.read().sceptres[0]; P.x = Math.round(s.x0 + s.dir * s.R * 0.6); } });
  ok(pre(modes, 'sceptreOut').every(m => m === 'sceptreTell') && modes.includes('sceptreOut'), 'told: sceptreTell -> sceptreOut (' + modes.join(' ').slice(0, 120) + ')');
  ok(seen && seen.R >= GORM.sceptre.rMin * 0.4 && seen.x0 + seen.dir * seen.R > gl.x0 && seen.x0 + seen.dir * seen.R < gl.x1, 'out past the hero, inside the glade (range ' + (seen && Math.round(seen.R)) + ' px)');
  ok(W0.hits.filter(h => h === 'THE SCEPTRE').length === 2, 'a hero standing in its path is hit by the LOW pass out and the HIGH pass back: ' + W0.hits.join(','));
  step(100); ok(modes.includes('sceptreCatch') && pre(modes, 'sceptreCatch').every(m => m === 'sceptreOut'), 'back to his hand: the catch pose'); ok(king.club === true && H.read().sceptres.length === 0, 'the club back in his hand after the catch'); }
{ const { W0, H, P, king, step } = toGlade(); P.x = king.x - 150;
  step(400, () => { const s = H.read().sceptres[0]; if (!s) { P.y = gl.floor; P.ground = true; P.ducking = false; return; } P.x = Math.round(s.x0 + s.dir * s.R * 0.6); const back = s.u >= 0.5;
    if (!back && Math.abs(P.x - s.x) < 30) { P.y = gl.floor - 30; P.ground = false; } else { P.y = gl.floor; P.ground = true; } P.ducking = back; });
  ok(W0.hits.filter(h => h === 'THE SCEPTRE').length === 0, 'JUMPED out, DUCKED back: it misses both passes (' + W0.hits.join(',') + ')'); }
{ const { W0, H, P, king, step } = toGlade(); P.x = king.x - 150;
  step(400, () => { const s = H.read().sceptres[0]; if (!s) return; P.x = Math.round(s.x0 + s.dir * s.R * 0.6); P.ducking = true; });
  ok(W0.hits.filter(h => h === 'THE SCEPTRE').length === 1, 'ducking only: the LOW pass still hits (feet height), the high pass goes over (' + W0.hits.join(',') + ')'); }

console.log('THE ENRAGE + THE BURNING CHARGE (P2 at ' + GORM.rageAt + ')');
{ const { W0, H, P, king, step, modes } = toGlade(); king.sceptreT = 99; P.x = king.x - 200;
  step(300, () => { P.x = king.x - 200; }); ok(!king.rage && !modes.includes('burnChargeTell'), 'no burning charge before the rage (it is rage-only)');
  king.hp = king.maxHp * (GORM.rageAt - 0.01); const boars0 = W0.enemies.filter(q => q.t === 'royalboar').length, hounds0 = W0.enemies.filter(q => q.t === 'hound').length; const m0 = modes.length;
  step(Math.round((GORM.rage.tellT + 2.2) * 100), () => { P.x = king.x - 200; });
  const ms = modes.slice(m0);
  ok(king.rage && ms[0] === 'rageTell' && W0.music === true, 'at ' + Math.round(GORM.rageAt * 100) + '% of his bar: rageTell (told, no blow), the music lifts: ' + ms.slice(0, 4).join(' '));
  ok(W0.enemies.filter(q => q.t === 'royalboar').length === boars0 + 1 && W0.enemies.filter(q => q.t === 'hound').length === hounds0 && pre(ms, 'horn').every(m => m === 'hornTell'), 'his horn calls ONE LAST BOAR (no hounds), told');
  ok(!W0.hits.length, 'the transition throws no blow');
  for (const q of W0.enemies) if (q.t === 'royalboar') q.alive = false;
  king.burnT = 99; const ct = king.clubT = 10; step(100); ok(Math.abs((ct - king.clubT) - GORM.rage.tempo) < 0.05, 'his cooldowns run x' + GORM.rage.tempo + ' (clubT fell ' + (ct - king.clubT).toFixed(2) + ' in 1 s)');
  king.clubT = 99; king.logT = 99; king.quakeT = 99; king.shakeT = 99; king.sceptreT = 99; king.burnT = 0; king.mode = 'walk'; king.modeT = 0; king.x = gl.x1 - 120; P.x = king.x - 260; P.y = gl.floor; P.ground = true; W0.hits.length = 0; const m1 = modes.length;
  let trailMax = 0, laneSeen = false; step(500, () => { trailMax = Math.max(trailMax, H.read().trail.length); if (H.read().lane) laneSeen = true; if (king.mode === 'burnCharge') P.x = Math.max(gl.x0 + 30, Math.min(gl.x1 - 30, P.x)); });
  const cm = modes.slice(m1);
  ok(cm.includes('burnChargeTell') && pre(cm, 'burnCharge').every(m => m === 'burnChargeTell') && cm.includes('burnChargeEnd'), 'THE BURNING CHARGE: told, run, skid: ' + cm.join(' '));
  ok(laneSeen, 'its lane drawn on the floor in the windup');
  ok(W0.hits.includes('THE BURNING CHARGE'), 'a hero on the floor in his path is run down');
  ok(trailMax >= 20, 'a fire trail behind him across the glade (' + trailMax + ' segments; he ends ' + Math.round((king.x - gl.x0) / TS) + ' tiles from the west wall)');
  const z = H.read().trail.slice().sort((a, b) => b.t - a.t)[0]; P.x = (z.x0 + z.x1) / 2; P.y = gl.floor; P.ground = true; king.burnT = 99; step(5, () => { P.x = (z.x0 + z.x1) / 2; }); ok(W0.drains.gormtrail > 0, 'standing in the trail: a DRAIN (A13)');
  step(Math.round(GORM.rage.trailT * 100) + 20, () => { P.x = gl.x1 - 30; }); ok(H.read().trail.length === 0 && !W0.drains.gormtrail, 'the trail fades after ' + GORM.rage.trailT + ' s');
  /* jumped */
  king.burnT = 0; king.mode = 'walk'; king.modeT = 0; king.x = gl.x1 - 120; P.x = king.x - 260; W0.hits.length = 0;
  step(500, () => { if (king.mode === 'burnCharge' && Math.abs(P.x - king.x) < 60) { P.y = gl.floor - 40; P.ground = false; } else { P.y = gl.floor; P.ground = true; } });
  ok(!W0.hits.includes('THE BURNING CHARGE'), 'JUMPED: the charge passes under (' + W0.hits.join(',') + ')');
  /* openings still work in rage */
  const cB = G.glade.hangs.filter(q => q.kind === 'cage')[0]; king.mode = 'walk'; king.ward = 0; king.x = cB.x; king.burnT = 99; H.strike({ l: cB.pegs[0] - 4, r: cB.pegs[0] + 4, t: 14 * TS - 20, b: 14 * TS - 2 });
  let held = false; step(200, () => { king.x = cB.x; if (king.mode === 'held') held = true; }); ok(held && king.rage, 'ENRAGED, a cage from the oak still HOLDS him (openings work in rage)');
}
console.log('MARKS, POSES, B15');
ok(['potTell', 'sceptreTell', 'burnChargeTell'].every(m => MARK['king|' + m] === '!!' && BY_HAND['king|' + m] === '!!') && MARK['king|rageTell'] === '', 'the marks: !! over the pot, the sceptre and the charge (no shield takes the low pass / the ring / the ram); none over the rage (no blow)');
ok(['potTell', 'pot', 'potTellUp', 'potUp', 'sceptreTell', 'sceptreOut', 'sceptreCatch', 'rageTell', 'burnChargeTell', 'burnCharge', 'burnChargeEnd'].every(m => POSES[m] && POSES[m][2]), 'every new mode has its pose (windup and release, each its own prop until the ART lane bakes frames)');
ok(GORM.chip >= 0.4 && gormTake({ mode: 'walk', rage: true }) === null && gormTake({ mode: 'held', rage: true }) === GORM.take.held, 'B15: ENRAGED a blade still lands at ' + GORM.chip + ' outside an opening; held x' + GORM.take.held);
console.log(bad ? '\ngorm3: ' + bad + ' FAILED' : '\nok  gorm3');
process.exit(bad ? 1 : 0);
