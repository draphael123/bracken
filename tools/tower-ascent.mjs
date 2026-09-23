/* tools/tower-ascent.mjs — THE FALLING TOWER, rebuilt (batch 4, 2026-09-21). Replaces tower-return.mjs, tower-finish.mjs
   and their runtime twins, which pinned the old shape (the Folly walked backwards to an indoor arena).
     BUILT   an upward level: SEVEN floors, each its own room kind, a rope through every divider, a GARRISON row that
             places on every floor, no blanket calm, the elites on this layout, 3 silvers, a checkpoint on every floor
     LONGER  (2026-09-22) THE READING ROOM and THE PENDULUM GALLERY, both LOAD-BEARING: take the flip away and nothing
             over the gallery is reached, take the pendulums away and the cistern is not; and FEWER ZOMBIES (3 + 1 husk)
     REACH   the fill climbs from the Folly's foot to the parapet and every silver/checkpoint; the sky has no footing
     ROOM    (2026-09-23) the crown ends at a DOOR, not a rug on a grass mat; his hall is behind it and the sandy path
             is behind that, reachable only through the second door - see tools/archmage-room.mjs for the room itself
     CARPET  8-way flight at ~160 px/s, normalised diagonals, no falling (the box holds it), knockback pushes it away
     MAGE    every spell told; storm and mark are unblockable and dodged by leaving; the opening is CAUSED (a mark that
             finds no one opens him, one that lands does not); enraged he is faster and blinks more, the sky narrows
     PAGE    a floor falls once you are above it and its rope hole is sealed; a floor you went back under waits; the
             carpet is boarded at the top and starts the fight; a death in the sky puts the tower and the carpet back
   The Folly's own polish checks that lived in tower-finish.mjs are kept here (its runtime twin: folly-runtime.mjs). */
import assert from 'node:assert/strict';
import fs from 'node:fs'; import vm from 'node:vm';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { TOWER, SAND, SWING, gateOccupied } from '../src/tower-ascent.js';
import { CARPET, carpetBox, mountCarpet, stepCarpet, knockCarpet } from '../src/carpet.js';
import { updateUndeadMage, MAGE, UNDEADMAGE_F } from '../src/undead-mage.js';
import { openPage } from './cdp.mjs';

const lv = LEVELS.find(l => l.id === 'fallingtower'), L = lv.build(), W = L.W;
const at = (x, y) => L.grid[y * W + x];
// ---- BUILT ----
assert.equal(lv.needs, 'mage'); assert.equal(L.music, 'fallingtower'); assert.equal(lv.name, 'THE FALLING TOWER');
assert.ok(L.H >= 200 && L.W < 100, 'a tower stood on its end: ' + L.W + 'x' + L.H);
assert.equal(L.towerFloors.length, 7, 'seven floors since the tower was made longer');
assert.equal(L.H, 306, 'and 306 rows (it was 240)');
const kinds = new Set(L.interiors.map(i => i[4])); assert.equal(kinds.size, 7, 'seven floors, seven rooms: ' + [...kinds]);
for (const f of L.towerFloors.slice(0, 6)) { const [x, y0, y1] = f.hole; for (let y = y0; y <= y1; y++) assert.equal(at(x, y), T.NET, f.name + ': the rope goes through its divider'); }
assert.ok(!L.calm || !L.calm.length, 'no blanket calm (the rule the Codex levels broke)');
const garrison = L.ents.filter(e => e.garrison); assert.ok(garrison.length >= 8, 'the GARRISON row places: ' + garrison.length);
const gRows = new Set(garrison.map(e => L.towerFloors.findIndex(f => e.y >= f.top && e.y < f.bot))); assert.ok(gRows.size >= 3, 'and on more than the top floor (stackedFloors): ' + [...gRows]);
const elites = L.ents.filter(e => e.elite); assert.equal(elites.length, 3);
for (const e of elites) { assert.ok(e.x > TOWER.X0 && e.x < TOWER.X1 && e.y > TOWER.SKY && e.y < L.H, 'elite inside the tower: ' + JSON.stringify(e)); assert.notEqual(at(e.x, e.y + 1), T.AIR, 'elite stands on something'); }
assert.equal(L.ents.filter(e => e.t === 'silver').length, 3);
/* A GLYPH IS A RUNE ON THE FLOOR AND A MEND IS A HEALING SHRINE: neither is a creature, and counting them as foes
   put the longer tower at 4.87 a screen against its own 3.5-4.6 band. The band is not widened and the level is not
   thinned - the tower's 94 creatures over 20.75 screens are 4.53. It only ever mattered here because no tower before
   this one had gravity glyphs in it. */
const non = new Set(['check', 'sign', 'coin', 'deco', 'silver', 'stal', 'gate', 'mover', 'undeadmage', 'glyph', 'mend']);
const foes = L.ents.filter(e => !non.has(e.t)), climb = L.START.y - TOWER.SKY;
const density = foes.length / (climb / 12); assert.ok(density >= 3.5 && density <= 4.6, 'foes per screen of climb: ' + density.toFixed(2));
assert.ok(L.arena.carpet && L.arena.boss === 'undeadmage' && L.arena.trigger > L.W * 16, 'the fight is started by the carpet, not by walking');
assert.ok(L.ents.some(e => e.t === 'undeadmage' && e.y < TOWER.SKY), 'he waits in the sky');
// ---- REACH ----
const R = floodReach(L, T, { rides: true });
assert.ok(R.jumpNear(Math.round(L.carpetAt.x / 16), TOWER.SKY), 'the fill climbs to the carpet');
/* THE GATE IS NOT IN THIS LIST ANY MORE. It stands on the sandy path, and the sandy path is behind the second door -
   the climb is not supposed to reach it, and if it ever does, something has gone wrong with the sky. So the gate gets
   its own fill below, started where the door puts you down: the requirement was never 'the gate can be walked to from
   the start', it was 'once you are through, the gate can be walked to', and that is what is asserted now. */
for (const e of L.ents.filter(e => ['silver', 'check'].includes(e.t))) assert.ok(R.jumpNear(e.x, e.y), e.t + ' unreachable at ' + e.x + ',' + e.y);
{ const gate = L.ents.find(e => e.t === 'gate');
  assert.ok(!R.jumpNear(gate.x, gate.y), 'the gate can be climbed to without the door: the level can be finished without the fight');
  const sand = floodReach({ ...L, START: { x: SAND.x0 + 2, y: SAND.row - 1 } }, T, { rides: true });
  assert.ok(sand.jumpNear(gate.x, gate.y), 'through the second door and the gate cannot be walked to: the level cannot be finished'); }
for (const f of L.towerFloors) assert.ok([...R.seen].some(s => { const y = +s.split(',')[1]; return y >= f.top && y < f.bot; }), f.name + ' is climbed');
/* NOTHING TO STAND ON IN THE SKY - still true, and it now has to be said more carefully. The sky rows are no longer
   empty: THE SANDY PATH is built up there (SAND, rows 18-24), where the second door puts you when the Archmage is down.
   What matters is that THE CLIMB CANNOT REACH IT. If the fill ever touches the sand, the sand has become a floor under
   the boss arena and the sky fight has a place to land - so this asserts the flood is clear of the sky rows, and then
   asserts the sand is really there, because an empty sky would pass the first line for the wrong reason. */
assert.ok(![...R.seen].some(s => +s.split(',')[1] < TOWER.SKY - 1), 'the climb reaches into the sky rows: the sky fight has a floor now');
assert.equal(at(SAND.x0 + 4, SAND.row), T.SOLID, 'the sandy path is gone, so the line above passes for the wrong reason');
assert.ok(![...R.seen].some(s => +s.split(',')[1] === SAND.row - 1), 'the sandy path can be WALKED to: it is meant to be reached only through the second door');
const checks = L.ents.filter(e => e.t === 'check').map(e => e.y).sort((a, b) => a - b);
for (const f of L.towerFloors) assert.ok(checks.some(y => y >= f.top - 2 && y < f.bot), 'a checkpoint on ' + f.name); assert.ok(checks[0] <= TOWER.SKY, 'and one on the parapet, for the sky fight');
// ---- THE TWO NEW FLOORS (2026-09-22) ----
{ const F = Object.fromEntries(L.towerFloors.map(f => [f.name, f]));
  const R2 = L.ents.filter(e => e.t === 'glyph');
  assert.equal(R2.length, 2, 'THE READING ROOM has two glyphs'); assert.ok(R2.some(e => e.ceiling) && R2.some(e => !e.ceiling), 'one on the floor, one on the ceiling');
  const read = F['THE READING ROOM'];
  for (const e of R2) assert.ok(e.y > read.top - 1 && e.y < read.bot, 'and both are in the Reading Room: ' + e.y);
  assert.equal(L.glyphBridges.length, 1, 'and the reach model is told the flip joins the room (L.glyphBridges)');
  const sw = L.moversExtra.filter(m => m.kind === 'swing'); assert.equal(sw.length, 3, 'THE PENDULUM GALLERY has three pendulums');
  const gal = F['THE PENDULUM GALLERY'];
  for (const m of sw) { assert.equal(m.arm, SWING.arm); assert.ok(m.py / 16 > gal.top && m.py / 16 < gal.bot, 'each hangs inside the gallery'); }
  assert.ok(new Set(sw.map(m => m.phase)).size === 3 && new Set(sw.map(m => m.period)).size === 3, 'and no two swing together');
  const pit = []; for (let x = TOWER.X0; x <= TOWER.X1; x++) if (at(x, gal.bot - 1) === T.SPIKE) pit.push(x);
  assert.ok(pit.length >= 14, 'the gear pit bites under them: ' + pit.length + ' tiles of spike');
  // FEWER ZOMBIES (Daniel, 2026-09-21): three zombies and one husk in the whole tower - the live one had 8 and 6
  const n = t => L.ents.filter(e => e.t === t).length;
  assert.equal(n('zombie'), 3, 'three zombies in the tower'); assert.equal(n('husk'), 1, 'and one husk');
  assert.ok(L.ents.filter(e => e.t === 'husk')[0].elite, 'and it is the cistern elite, not one more on top of it');
  assert.ok(n('tome') >= 24, 'THE TOMES carry what they carried: ' + n('tome'));
  const perFloor = L.towerFloors.map(f => L.ents.filter(e => e.t === 'tome' && e.y >= f.top && e.y < f.bot).length);
  assert.ok(perFloor.every(k => k >= 2), 'on every floor: ' + perFloor.join(','));
  // AND BOTH NEW FLOORS ARE LOAD-BEARING. Take the rule away and the fill stops at it.
  const noFlip = floodReach({ ...L, glyphBridges: [] }, T, { rides: true });
  assert.ok(!noFlip.jumpNear(40, F['THE READING ROOM'].top + 9), 'without the flip the gallery is out of reach');
  assert.ok(![...noFlip.seen].some(k => +k.split(',')[1] < read.top), 'and so is every floor over it');
  const noSwing = floodReach({ ...L, moversExtra: L.moversExtra.filter(m => m.kind !== 'swing') }, T, { rides: true });
  assert.ok(![...noSwing.seen].some(k => +k.split(',')[1] < gal.top), 'without the pendulums the cistern and everything over it is out of reach'); }
// ---- CARPET ----
{ const P = { x: 500, y: 500, vx: 0, vy: 0 }, box = { x0: 100, x1: 900, y0: 100, y1: 700 };
  mountCarpet(P, { x: 500, y: 500 });
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  for (const [ax, ay] of dirs) { P.x = 500; P.y = 400; P.vx = P.vy = 0; for (let i = 0; i < 60; i++) stepCarpet(P, { ax, ay }, 1 / 60, box);
    const sp = Math.hypot(P.vx, P.vy); assert.ok(sp > CARPET.speed * 0.8 && sp < CARPET.speed * 1.15, 'flies ' + ax + ',' + ay + ' at ' + sp.toFixed(0));
    assert.ok(Math.sign(P.vx) === Math.sign(ax) || ax === 0, 'goes the way it is steered'); assert.ok(Math.sign(P.vy) === Math.sign(ay) || ay === 0); }
  P.x = 500; P.y = 690; for (let i = 0; i < 300; i++) stepCarpet(P, { ax: 0, ay: 1 }, 1 / 60, box); assert.ok(P.y <= box.y1, 'no falling out of the sky');
  P.x = 500; P.y = 400; P.vx = P.vy = 0; const x0 = P.x; for (let i = 0; i < 120; i++) stepCarpet(P, {}, 1 / 60, box); assert.ok(Math.abs(P.x - x0) > 1 && Math.abs(P.x - x0) < 40, 'held still, it drifts - a little');
  P.vx = P.vy = 0; knockCarpet(P, P.x - 30, P.y - 8); assert.ok(P.vx > 150, 'a blow from the left knocks it right'); const kx = P.x; stepCarpet(P, {}, 0.1, box); assert.ok(P.x > kx + 10);
  const A = L.arena, b0 = carpetBox(A, 0), b1 = carpetBox(A, 1); assert.ok(b1.x1 - b1.x0 < (b0.x1 - b0.x0) * 0.7, 'the storm walls close the sky'); assert.ok(b0.y1 < A.floor, 'the sky ends over the crown'); }
// ---- MAGE ----
{ const A = L.arena, box = carpetBox(A, 0);
  const rig = (o = {}) => { const P = { x: 500, y: 500, dead: 0 }, hits = [], said = [], e = { alive: true, hp: 1000, hp0: 1000, x: 700, y: 480, mode: 'hover', modeT: 0, anim: 0, turn: 0, face: -1, blinkT: 99, ...o };
    const c = { P, box, hit: (x, y, d, hard, blow) => hits.push({ d, hard, blow }), say: m => said.push(m), sound: () => {}, venom: () => { P.venomT = 2.4; }, rnd: () => 0.5 }; return { P, e, c, hits, said }; };
  const run = (r, s, dt = 1 / 60) => { for (let i = 0; i < s / dt; i++) updateUndeadMage(r.e, dt, r.c); };
  // every spell comes from a tell, in the order, and the order has all six
  { const r = rig(); const seen = new Set(); for (let i = 0; i < 60 * 40; i++) { updateUndeadMage(r.e, 1 / 60, r.c); if (r.e.mode.endsWith('Tell')) seen.add(r.e.mode); r.P.x = 300 + (i % 400); }
    for (const m of ['fireTell', 'iceTell', 'stormTell', 'poisonTell', 'handTell', 'markTell']) assert.ok(seen.has(m), 'he casts ' + m); }
  // STORM: unblockable, and leaving the column is the answer
  { const r = rig({ mode: 'stormTell', modeT: 0.5, markX: 500, spell: 'storm' }); r.P.x = 560; run(r, 0.6); assert.equal(r.hits.length, 0, 'out of the column is safe');
    const q = rig({ mode: 'stormTell', modeT: 0.1, markX: 500, spell: 'storm' }); run(q, 0.2); assert.ok(q.hits[0] && q.hits[0].hard, 'in it, it is unblockable'); }
  // FIRE / ICE are blockable shots; the fan is five
  { const r = rig({ mode: 'iceTell', modeT: 0, spell: 'ice' }); updateUndeadMage(r.e, 0.01, r.c); assert.equal(r.e.shots.length, 5); assert.ok(r.e.shots.every(q => q.dmg === MAGE.dmg.ice));
    run(r, 3); assert.ok(r.hits.length >= 1 && r.hits.every(h => !h.hard), 'ice is blocked, not unblockable'); }
  // POISON: orbs that become clouds, and the cloud poisons
  { const r = rig({ mode: 'poisonTell', modeT: 0, spell: 'poison' }); r.P.x = 560; r.P.y = 500; updateUndeadMage(r.e, 0.01, r.c); assert.equal(r.e.shots.filter(q => q.kind === 'orb').length, 3);
    run(r, 3); assert.ok(r.e.clouds.length >= 1, 'the orbs burst into clouds'); const cl = r.e.clouds[0]; r.P.x = cl.x; r.P.y = cl.y + 8; r.P.venomT = 0; run(r, 0.2); assert.ok(r.P.venomT > 2, 'the cloud poisons whoever is in it'); }
  // DEATH HAND: it homes, slower than the carpet
  { const r = rig({ mode: 'handTell', modeT: 0, spell: 'hand' }); updateUndeadMage(r.e, 0.01, r.c); const h = r.e.shots.find(q => q.kind === 'hand'); assert.ok(h && h.sp < CARPET.speed * 0.7, 'the hand can be out-flown');
    r.P.y = 300; run(r, 1); assert.ok(h.vy < 0, 'it turns after you'); }
  // THE OPENING IS CAUSED: the same mark, landed on you, opens nothing; flown out of, it opens him
  { const r = rig({ mode: 'markTell', modeT: 0, spell: 'mark' }); updateUndeadMage(r.e, 0.01, r.c); assert.ok(r.e.mark, 'the mark is laid');
    run(r, MAGE.markFuse + 0.1); assert.ok(r.hits.some(h => h.blow === 'mark' && h.hard), 'left on it, the mark lands, unblockable'); assert.notEqual(r.e.mode, 'gather', 'and he is NOT open');
    const q = rig({ mode: 'markTell', modeT: 0, spell: 'mark' }); updateUndeadMage(q.e, 0.01, q.c); q.P.x += 90; run(q, MAGE.markFuse + 0.1);
    assert.equal(q.hits.length, 0); assert.equal(q.e.mode, 'gather', 'flown out of, it comes back on him'); assert.ok(q.e.open > 2, 'the window: ' + q.e.open); }
  // ENRAGE: faster tells, more blinks, pairs, the squeeze
  { const r = rig({ hp: 350 }); run(r, 0.1); assert.ok(r.e.enraged); r.e.mode = 'hover'; r.e.modeT = 0; r.e.blinkT = 99; run(r, 0.05);
    const tell = r.e.modeT; assert.ok(tell < MAGE.tell[r.e.spell] * 0.7, 'enraged tells are faster: ' + tell.toFixed(2));
    const blinks = x => { const s = rig(x); let n = 0, m = ''; for (let i = 0; i < 60 * 30; i++) { updateUndeadMage(s.e, 1 / 60, s.c); if (s.e.mode === 'blinkOut' && m !== 'blinkOut') n++; m = s.e.mode; s.P.x = 300; } return n; };
    const calm = blinks({ blinkT: MAGE.blinkEvery }), mad = blinks({ hp: 350, blinkT: MAGE.blinkEnraged });
    assert.ok(mad >= calm * 2, 'enraged he blinks much more: ' + calm + ' -> ' + mad); run(r, 3.2); assert.equal(r.e.squeeze, 1); }
  assert.ok(UNDEADMAGE_F.idle.length === 2 && UNDEADMAGE_F.enraged.length === 2 && UNDEADMAGE_F.hurt > UNDEADMAGE_F.dead, 'the frame table (hurt LAST)'); }
// ---- THE FOLLY'S POLISH (from tower-finish.mjs) ----
{ assert.ok(gateOccupied(5, [9], [{ x: 0, y: 0 }, { x: 88, y: 160, w: 10, h: 14 }])); assert.ok(!gateOccupied(5, [9], [{ x: 64, y: 160, w: 10, h: 14 }]));
  const m = LEVELS.find(l => l.id === 'mage').build(); assert.ok(!m.pools.some(p => p.acid && !p.magePool)); assert.ok(m.mage.skins.some(z => z[0] === 118 && z[1] === m.W - 1 && z[2] === 0 && z[3] === m.H - 1));
  const s = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), c = vm.createContext({ MG: { A: { sub: 3 } } });
  vm.runInContext(s.slice(s.indexOf('function archGate('), s.indexOf('function homHurt(')), c); assert.equal(c.archGate({ stage: 2, maxHp: 1000 }), 0);
  assert.ok(!/updateCarpet\([^)]*\)[^;]*;[^\n]*function updateSea|function updateSea[\s\S]{0,4000}updateAscent\(/.test(s.slice(s.indexOf('function updateSea('), s.indexOf('function updateSea(') + 4000)), 'the carpet is never hooked inside updateSea'); }
console.log(JSON.stringify({ built: { W: L.W, H: L.H, floors: L.towerFloors.map(f => f.name), foes: foes.length, garrison: garrison.length, density: +density.toFixed(2) }, reach: R.seen.size }));

// ---- PAGE ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
   const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);};
   boot();const F=BK.towerFloors(),hole=F[0].hole;
   // the floor goes once you are over it, and its rope is sealed
   /* ONTO THE GALLERY, not six rows over the divider. The old spot happened to have footing in the five-floor tower;
      in the seven-floor one it is open air over the Reading Room, so the hero fell to its floor - ONE ROW below the
      'above the divider' line - and the library never armed. The test was reading its own bad teleport as a bug in
      the level. Put him somewhere he can stand, well clear of the line, and let the rule be the thing tested. */
   BK.tp(40,F[1].top+9);BK.sim(60);out.stoodAt=Math.round(BK.P.y/16);out.armedOver=F[0].t>0||F[0].front!==null;BK.sim(300);out.done=F[0].done;out.sealed=BK.L.grid[hole[1]*BK.L.W+hole[0]];
   out.cleared=(()=>{let n=0;for(let y=F[0].top;y<F[0].bot;y++)for(let x=12;x<=59;x++)if(BK.L.grid[y*BK.L.W+x])n++;return n;})();
   // a floor you went back under waits for you
   BK.tp(16,F[1].top-9);BK.sim(20);BK.tp(24,F[1].bot-1);BK.sim(200);out.waited=!F[1].done&&F[1].front===null;
   // the carpet, boarded at the top, starts the fight; the crown goes under it
   BK.tp(30,${TOWER.SKY});BK.sim(5);BK.board();BK.sim(5);out.carpet=!!BK.carpet();out.active=BK.bossActive;BK.sim(120);out.crownGone=F[6].done||F[6].front!==null;
   const y0=BK.P.y;for(let i=0;i<120;i++){BK.keys.down=true;BK.sim(1);}BK.keys.down=false;out.floorHeld=BK.P.y<=BK.L.arena.floor;out.fellNot=!!BK.carpet();
   /* THE RISE IS MEASURED FROM THE BOTTOM OF THE DIVE, NOT FROM WHERE HE BOARDED. y0 used to be both: the carpet put
      him on the parapet, which was the lowest point in the arena, so y0-P.y happened to be the climb. Boarding now
      puts him in the middle of the SANCTUM, well above the floor, and the same subtraction measured the distance back
      to his starting height instead - it read -22 for a carpet that was flying perfectly well. */
   out.sank=Math.round(BK.P.y-y0); const yLow=BK.P.y;
   for(let i=0;i<60;i++){BK.keys.up=true;BK.keys.right=true;BK.sim(1);}BK.keys.up=BK.keys.right=false;out.flew=Math.round(yLow-BK.P.y);
   // a death in the sky puts the tower back and the carpet waiting
   BK.god=false;BK.P.hp=0;BK.P.dead=0.01;BK.sim(400);for(let i=0;i<900&&(BK.carpet()||(BK.boss&&BK.boss.mode==='wake'));i++)BK.sim(1);out.retry={carpet:!!BK.carpet(),crown:!F[6].done,below:F[0].done,boss:BK.boss&&BK.boss.alive,mode:BK.boss&&BK.boss.mode};
   return out;})()`, 240000);
  assert.ok(r.armedOver, 'the library arms when you are over its divider'); assert.ok(r.done, 'and falls'); assert.equal(r.sealed, T.SOLID, 'its rope hole is sealed');
  assert.ok(r.cleared < 10, 'nothing of the floor is left standing: ' + r.cleared); assert.ok(r.waited, 'a floor you went back under waits for you');
  assert.ok(r.carpet && r.active, 'boarding the carpet starts the fight'); assert.ok(r.crownGone, 'the crown falls away under the carpet');
  assert.ok(r.floorHeld && r.fellNot, 'there is no falling off the carpet'); assert.ok(r.flew > 40, 'it flies up: ' + r.flew); assert.ok(r.sank > 10, 'and it sinks when you hold down: ' + r.sank);
  assert.ok(!r.retry.carpet && r.retry.crown && r.retry.below && r.retry.boss, 'a retry: the carpet waits again, the crown stands, the floors under it stay gone: ' + JSON.stringify(r.retry));
  assert.deepEqual(pg.errors, []);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
