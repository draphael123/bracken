// src/spiral-chase.js - THE SPIRAL STAIR, AND THE UNDEAD ARCHMAGE CHASED UP IT (Daniel, 2026-09-29: "a section climbing up the tower
// after the mini boss (the Sexton) where you go through a PORTAL and CHASE THE ARCHMAGE UP A SPIRAL TOWER as he shoots bolts at you like
// the fight. You eventually reach a PORTAL with a MAGIC CARPET and the fight commences as usual.")
//
// THE WAY IN. The crown's parapet used to hold the door into his hall. It holds HIS RING now (the ring art of his fight, the desert
// inside it): walk into it and you come out at the foot of his spiral stair. The door into his hall - the purple well, with the
// magic carpet laid in front of it - waits at the top of the stair, and stepping onto the carpet starts his fight exactly as before
// (src/carpet.js, src/sanctum.js: nothing of the fight is changed here).
//
// THE PLACE. A stair tower of its own, beside the Falling Tower in the same grid (columns SPIRAL.x0-x1, the tower's own stone and slate
// ledges): a stone newel stands up the middle (painted: src/redraw/fallen_tower.js 'spiral'), and the stair winds round it - six
// flights, each a different problem, each turning at a landing against the wall:
//   1 THE STAIR          whole steps. He only throws FIRE here: the first spell of his fight, met first on foot
//   2 THE BROKEN STAIR   a step has fallen out: a real jump over the gap, under his FIRE and his ICE
//   3 THE FAILING STAIR  two steps are the tower's failing stone (src/tower-collapse.js), and he lays his DEATH MARK: the ring says
//                        move, the stone says do not stop
//   4 THE STONES         the steps are broken to their cores, two tiles each - guard his ICE and FIRE on a foothold
//   5 THE GALLERY        one long failing walk to the far wall under his MARK
//   6 THE LAST STAIR     all three spells, a gap and a failing step, and the carpet at the top
//
// THE RISING DARK (claude/towerscroll, Daniel 2026-09-29: "the fire looks odd" - the brazier fire walls, his wards and the snuffed brazier
// are gone, and the climb is an UPWARD AUTO-SCROLLER). The moment you leave the stair's floor HIS DARK MAGIC floods up the stairwell
// behind you - his ring's green-black, the colour of every door he opens - and the camera rises ahead of it. It is src/chase.js's chaser
// (RISE, handed to the level as L.chases): a vertical chase going up, KILL on contact like a cave-in, its speed-ups told (a banner, thunder
// and a flashing line) before it quickens, and its rubber band keeping it fair: close under you it creeps (rubber.slow), and it never runs
// faster than its told speed (rubber.catch 1; the leash still keeps it on the screen) - and its fastest is under the slowest hero's own
// climb (tools/tower-chase.mjs). ONE checkpoint, at the stair's
// foot (the engine's rule: a shrine just before the start line), so a death restarts the whole climb, which is short. The top floor is
// its safe line: it stops just under it, and the stair behind you is drowned. The 3-tile gaps (flights 2, 4 and 6) are 2 now: a missed jump under a rising kill is a death, and the paladin cleared the old ones by a hair.
//
// THE CHASE (updateMageChase). He is not fought here - he is RUN DOWN. He floats ahead of you and above, over the landing at the end of
// the flight you are on, and he waits there. When you reach that landing he flies on to the next one. He casts only from there, only
// what that flight teaches, and only while he and you are both on the screen (c.onScreen): never from somewhere you cannot see him.
// Every spell is his fight's own, with its fight's tell, its fight's mark (src/marks.js 'magechase|...') and its fight's numbers
// (MAGE.dmg, MAGE.tell, MAGE.boltV):
//   FIREBOLT     fireTell  aimed at you (a PAIR from the third flight)          !   guard it, or step off its line
//   ICE LANCES   iceTell   a fan of five                                        !   guard it, or stand between two of them
//   DEATH MARK   markTell  a ring laid where you stand, gone off in two seconds  !!  step out of it - no shield holds it
// THE CHASE IS THE FIGHT'S TEACHER: a death mark stepped out of FINDS NO ONE and he flinches, open, for a breath - which is his whole
// fight's opening, shown once on foot before the carpet. Here it is only shown: he is out of reach, and a blow that reaches him does
// nothing (main.js hurtEnemy0). At the top he goes through the door ahead of you, and the carpet is left lying in front of it.
import { MAGE, RING_COL } from './undead-mage.js';
import { drawDesertOval } from './sanctum.js';

/* THE STAIR TOWER, in tiles. Interior columns x0..x1, open rows top..floor-1; the level's grid is W wide (the Falling Tower is 72). */
export const SPIRAL = { x0: 80, x1: 105, top: 70, floor: 124, W: 110, arrive: 82, check: 84 };
/* THE SIX FLIGHTS, foot to top. A step is [x0, len, row] (row: the ledge's own row; you stand on the row over it) with 'fail' for the
   tower's failing stone. Every flight ends on a LANDING against a wall; the sixth's is the top floor, where the carpet lies. Each step
   is a jump a hero really makes (checkpoint-stand's real jump, 5 columns: two rows up and three across, one up and four, or flat and
   five): tools/tower-chase.mjs walks it with that fill. The flights turn at the walls, so the one over you runs the other way.
   (claude/towerscroll: no gap is wider than 2 tiles - under the rising dark a missed jump is a death) */
export const FLIGHTS = [
  { name: 'THE STAIR', dir: 1, steps: [[86, 4, 122], [90, 4, 120], [94, 4, 118], [98, 4, 116]], land: [102, 4, 114], spells: ['fire'] },
  { name: 'THE BROKEN STAIR', dir: -1, steps: [[97, 4, 112], [90, 5, 111], [86, 4, 109]], land: [80, 5, 107], spells: ['fire', 'ice'] },
  { name: 'THE FAILING STAIR', dir: 1, steps: [[85, 4, 105], [89, 4, 103, 'fail'], [93, 4, 101], [97, 4, 99, 'fail']], land: [102, 4, 97], spells: ['mark', 'fire'] },
  { name: 'THE STONES', dir: -1, steps: [[98, 2, 95], [94, 2, 94], [90, 2, 93], [86, 2, 92]], land: [80, 5, 90], spells: ['ice', 'fire'] },
  { name: 'THE GALLERY', dir: 1, steps: [[85, 4, 88], [89, 11, 86, 'fail']], land: [102, 4, 84], spells: ['mark', 'fire'] },
  { name: 'THE LAST STAIR', dir: -1, steps: [[97, 4, 82], [91, 4, 81, 'fail']], land: [80, 9, 79], spells: ['fire', 'ice', 'mark'], top: true },
];
/* THE TOP: the carpet laid before the door into his hall, and the carpet's own retry spot five tiles back from it (boarding the carpet
   sets the door checkpoint there; it is not a checkpoint on the stair) */
export const TOP = { carpet: 86, row: 78, check: 81 };
/* THE RISING DARK: the stair's chase for src/chase.js, the camera TIED to it (its surface is kept 16-40 px up from the screen's
   bottom - show, edge - so you see what is coming, and the screen rises with it - but you keep 60% of the screen
   over you (showKeep: he waits over the landing ahead, and he casts only on the screen), so far ahead of it you outrun the frame; its leash, rubber.max x 1.25 = 225 px, keeps you on
   the screen above it), in world px on the y axis, going up (dir -1). It starts when you stand on the
   first step (trigger: the hero's middle over the first step's top), rises from gap0 under that, and stops just under the top floor
   (end: the ledge's underside and a little). zone keeps it to the stair tower (the tower's own floors share its rows). The speeds are
   px/s up the stairwell; every quickening is told. */
export const RISE = (() => { const TS = 16, S = SPIRAL, f0 = FLIGHTS[0].steps[0][2], lastLand = FLIGHTS[FLIGHTS.length - 1].land[2];
  return { id: 'towerscroll', name: 'HIS DARK MAGIC', say: 'HIS DARK MAGIC RISES: CLIMB!', axis: 'y', dir: -1,
    trigger: f0 * TS - 2, end: (lastLand + 1) * TS + 6, gap0: 160,
    curve: [[0, 11], [200, 13, 'THE DARK QUICKENS'], [420, 15, 'IT RISES FASTER']], lead: 1.6, accel: 30,
    rubber: { min: 96, max: 180, slow: 0.8, catch: 1 }, contact: 'kill', autoscroll: true, edge: 40, show: 16, showKeep: 0.6, glow: 200, look: 'dark',
    zone: [(S.x0 - 1) * TS, (S.x1 + 2) * TS, S.top * TS, (S.floor + 1) * TS], checkpoint: [S.check, S.floor - 1] }; })();

export const CHASE = {
  up: 4,          /* rows over a landing he waits at: in the frame with you as you climb to it - and he is gone from it the moment you land */
  fly: 240,       /* px/s from one landing to the next: a swoop up the stairwell, there before you are off the landing */
  near: 3,        /* tiles: you are ON the landing when your feet are on its row and this close to its wall end */
  /* HARDER (claude/undead3, Daniel: "the chase more difficult"): 1.0 s between spells was 0.6, a landing settled in 0.5 s now 0.35, and
     from the third flight on his firebolt comes in a PAIR (pairFrom, pairFan radians apart). Every tell is still his fight's full tell */
  gap: 0.6,       /* s between one spell and the next tell; a new landing waits `settle` first */
  settle: 0.35, pairFrom: 2, pairFan: 0.22,
  flinch: 1.2,    /* s he hangs open when his mark finds no one: the fight's opening, shown */
  range: 330,     /* px: he casts at you from no further */
  get markR() { return MAGE.markR; }, get markFuse() { return MAGE.markFuse; },   /* (read late: undead-mage.js and this file can load in either order) */
};
/* BUILD IT into the tower's grid. `k` is tower-ascent.js's toolkit: rect, ledge, ent, crumbles (the failing stone list), interiors. */
export function buildSpiral(k, T) {
  const { rect, ledge, ent, crumbles, interiors } = k, S = SPIRAL;
  rect(S.x0, S.x1, S.top, S.floor - 1, T.AIR);
  interiors.push([S.x0, S.x1, S.top, S.floor - 1, 'spiral']);
  for (const F of FLIGHTS) {
    for (const [x0, len, row, f] of F.steps) { ledge(x0, len, row); if (f === 'fail') crumbles.push({ x0, x1: x0 + len - 1, row, count: F.top ? 2 : 2.5, kind: 'spiral' }); }
    const [lx, ll, lr] = F.land; ledge(lx, ll, lr);
  }
  /* THE WAY IN: his ring on the crown's parapet (tower-ascent.js puts that one) lets you out here, at the stair's foot - and the stair's
     one checkpoint stands beside it, just under the rising dark's start line (src/chase.js's rule) */
  ent('ringdoor', S.arrive, S.floor - 1, { id: 'spiral-foot' });
  ent('check', S.check, S.floor - 1);
  ent('sign', S.x0 + 1, S.floor - 1, { text: 'HIS DARK MAGIC FLOODS UP THE STAIR BEHIND YOU: CLIMB. GUARD HIS FIRE AND HIS FROST. STEP OUT OF HIS MARK.' });
  ent('magechase', FLIGHTS[0].land[0] + 2, FLIGHTS[0].land[2] - CHASE.up, { face: -1 });
  return { ...S, flights: FLIGHTS.map(F => ({ ...F })), carpet: { ...TOP } };
}
const TELL = { fire: 'fireTell', ice: 'iceTell', mark: 'markTell' };
const SAY = { fireTell: 'FIRE: GUARD IT', iceTell: 'FROST: GUARD IT', markTell: 'THE DEATH MARK: STEP OUT OF THE RING' };

/* WHERE HE WAITS for flight k: over its landing, CHASE.up rows up, at the landing's wall end. Past the last flight: the door. */
export function perchOf(k) {
  if (k >= FLIGHTS.length) return { x: TOP.carpet * 16 + 8, y: (TOP.row - 1) * 16, door: true };
  const [lx, ll, lr] = FLIGHTS[k].land, dir = FLIGHTS[k].dir;
  return { x: (dir > 0 ? lx + ll - 1 : lx + 1) * 16 + 8, y: (lr - CHASE.up) * 16 };
}
/* THE FLIGHT HE IS AHEAD OF YOU ON: the one past your landing */
export const nextOf = e => (e.reached ?? -1) + 1;
/* HOW FAR UP YOU ARE: the last landing your feet have stood on (-1: the foot of the stair). The flights rise away from every landing,
   so a landing whose row you are standing at or over is one you have passed. Only while you stand - a jump is not a landing. */
export function landingOf(P, prev = -1) {
  if (!P.ground) return prev; const feet = Math.round(P.y / 16);
  let k = -1; for (let i = 0; i < FLIGHTS.length; i++) if (feet <= FLIGHTS[i].land[2]) k = i;
  return Math.max(prev, k);
}
export const inSpiral = (S, x, y) => !!S && x >= (S.x0 - 1) * 16 && x < (S.x1 + 2) * 16 && y >= S.top * 16 && y < (S.floor + 1) * 16;

/* ONE STEP OF THE CHASE. c: { P, hit(x, y, dmg, hard, blow), say(msg, hard), sound(k), onScreen(x, y, margin), solid(x, y), inSpiral(P) }.
   (he casts only with his whole body - head to hem - 28 px inside the frame: clear of its edges and of the HUD in its corners)
   e.mode: sleep | wake | fly | wait | fireTell | iceTell | markTell | markWait | gather | enter. */
export function updateMageChase(e, dt, c) {
  const { P } = c;
  if (!e.alive) return;
  e.anim = (e.anim || 0) + dt; e.modeT = (e.modeT || 0) - dt; e.shots ??= []; e.clouds ??= []; e.rings ??= []; e.flashT = Math.max(0, (e.flashT || 0) - dt);
  const py = P.y - 8;
  // ---- what he has thrown: it flies on whatever he is doing, and the stone stops it ----
  for (const q of e.shots) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt;
    if (c.solid && c.solid(q.x, q.y)) { q.t = 0; q.gone = true; continue; }
    if (!q.hit && !P.dead && Math.abs(P.x - q.x) < q.r + 6 && Math.abs(py - q.y) < q.r + 9) { c.hit(q.x, q.y, q.dmg, false, q.kind); q.hit = true; q.t = 0; } }
  e.shots = e.shots.filter(q => q.t > 0);
  // ---- THE DEATH MARK, where you stood ----
  if (e.deathMark) { const m = e.deathMark; m.t -= dt;
    if (m.t <= 0) { e.deathMark = null; e.flashT = 0.3; e.flashX = m.x; e.flashY = m.y; c.sound('heavy');
      if (!P.dead && Math.hypot(P.x - m.x, py - m.y) < m.r) { c.hit(m.x, m.y, MAGE.dmg.mark, true, 'mark'); if (e.mode === 'markWait') { e.mode = 'wait'; e.modeT = CHASE.gap; } }
      else if (e.mode === 'markWait') { e.mode = 'gather'; e.modeT = CHASE.flinch; c.say('THE MARK FINDS NO ONE: IT COMES BACK ON HIM', true); c.sound('crack'); } } }
  if (e.mode === 'sleep') {   /* he waits for you to come through his ring - then he is where the stair you are on sends him */
    if (!c.inSpiral(P) || P.dead) return;
    e.reached = landingOf(P, -1); if (e.reached >= FLIGHTS.length - 1) { e.alive = false; return; }   /* (a retry at the top: he is already through) */
    const p = perchOf(nextOf(e)); e.x = p.x; e.y = p.y; e.face = Math.sign(P.x - e.x) || -1;
    e.mode = 'wake'; e.modeT = 1.2; c.say(e.reached < 0 ? 'THE ARCHMAGE CLIMBS FOR HIS HALL' : 'HE IS STILL CLIMBING', false); c.sound('mageBolt'); return; }
  e.reached = landingOf(P, e.reached ?? -1);
  const next = nextOf(e), want = perchOf(next);
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'wait'; e.modeT = CHASE.settle; } return; }
  if (e.mode === 'gather') { e.y += Math.sin(e.anim * 2) * 4 * dt; if (e.modeT <= 0) { e.mode = 'wait'; e.modeT = CHASE.settle; } return; }
  if (e.mode === 'enter') { if (e.modeT <= 0) e.alive = false; return; }
  /* YOU REACHED HIS LANDING: whatever he was doing, he goes on up (a tell half cast is dropped - he runs, he does not stand and trade) */
  if (e.mode !== 'fly' && e.mode !== 'markWait' && Math.hypot(want.x - e.x, want.y - e.y) > 4) e.mode = 'fly';
  if (e.mode === 'fly') {
    const dx = want.x - e.x, dy = want.y - e.y, d = Math.hypot(dx, dy); e.face = Math.sign(dx) || e.face;
    if (d > 2) { const s = Math.min(d, CHASE.fly * dt); e.x += dx / d * s; e.y += dy / d * s; }
    if (d <= 4) { e.x = want.x; e.y = want.y;
      if (want.door) { e.mode = 'enter'; e.modeT = 0.5; c.say('HE IS THROUGH HIS DOOR. HIS CARPET WAITS', false); c.sound('mageBolt'); return; }
      e.mode = 'wait'; e.modeT = CHASE.settle; e.turn = -1; }   /* a new landing: its flight's first spell first */
    return; }
  if (e.mode === 'markWait') return;
  e.y = want.y + Math.sin(e.anim * 2.3) * 3;   /* he hangs in the air over the landing, breathing */
  if (e.mode === 'wait') {
    e.face = Math.sign(P.x - e.x) || e.face;
    if (e.modeT > 0 || P.dead) return;
    /* NEVER FROM OFF THE SCREEN, NEVER FROM ACROSS THE TOWER: he casts only when you can see him and he is in range of you */
    if (!c.onScreen(e.x, e.y - 46, 28) || !c.onScreen(e.x, e.y, 28) || !c.onScreen(P.x, P.y - 8, 0) || Math.hypot(P.x - e.x, P.y - e.y) > CHASE.range) return;
    const list = FLIGHTS[Math.min(FLIGHTS.length - 1, next)].spells, spell = list[(e.turn = (e.turn ?? -1) + 1) % list.length];
    e.spell = spell; e.mode = TELL[spell]; e.modeT = MAGE.tell[spell]; c.say(SAY[e.mode], spell === 'mark'); return; }
  if (e.modeT > 0) { e.face = Math.sign(P.x - e.x) || e.face; return; }
  // ---- the spell goes ----
  const hx = e.x + e.face * 12, hy = e.y - 34, aim = Math.atan2(py - hy, P.x - hx);
  const shot = (a, sp, r, dmg, kind, col) => e.shots.push({ x: hx, y: hy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a, sp, r, dmg, kind, col, t: 4 });
  if (e.spell === 'fire') { for (const s of next >= CHASE.pairFrom ? [-CHASE.pairFan / 2, CHASE.pairFan / 2] : [0]) shot(aim + s, MAGE.boltV, 5, MAGE.dmg.fire, 'fire', '#ff9b49'); c.sound('mageBolt'); }
  else if (e.spell === 'ice') { for (let i = -2; i <= 2; i++) shot(aim + i * 0.3, 120, 4, MAGE.dmg.ice, 'ice', '#9be2ff'); c.sound('hiss'); }
  else if (e.spell === 'mark') { e.deathMark = { x: P.x, y: py, r: CHASE.markR, t: CHASE.markFuse, T: CHASE.markFuse }; e.mode = 'markWait'; e.modeT = 99; c.sound('crack'); return; }
  e.mode = 'wait'; e.modeT = CHASE.gap;
}

/* HIS RING AS A DOOR (the parapet's way in, and the one you come out of at the stair's foot): his fight's ring - the desert inside and
   his green sparks turning round it - at a door's size, standing on the ground at (x, y). `on` 0..1 lets it open and close. */
export function drawRingDoor(g, x, y, time, on = 1) {
  const k = Math.max(0, Math.min(1, on)), rw = Math.round(13 * k), rh = Math.round(19 * k); if (rw < 2 || rh < 2) return;
  x = Math.round(x); const cy = Math.round(y) - rh - 1;
  g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(111,224,138,0.10)';
  for (let dy = -rh - 4; dy <= rh + 4; dy++) { const R = rh + 4, half = Math.round((rw + 4) * Math.sqrt(Math.max(0, 1 - (dy / R) * (dy / R)))); if (half > 0) g.fillRect(x - half, cy + dy, half * 2, 1); }
  g.globalCompositeOperation = 'source-over';
  drawDesertOval(g, x, cy, rw, rh, time, 0.7);
  const n = 30; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + time * 1.6;
    g.fillStyle = i % 6 === 0 ? RING_COL.rimL : RING_COL.rim; g.fillRect(x + Math.round(Math.cos(a) * (rw + 1)), cy + Math.round(Math.sin(a) * (rh + 1)), 1, 1); }
}
