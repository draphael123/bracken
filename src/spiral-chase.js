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
// ledges): a stone newel stands up the middle (painted: src/redraw/fallen_tower.js 'spiral'), and the stair winds round it - NINE
// flights (claude/archmage2b, Daniel 10-02: "longer and harder" - three new ones), each a different problem, each turning at a landing
// against the wall:
//   1 THE STAIR          whole steps. He only throws FIRE here: the first spell of his fight, met first on foot
//   2 THE BROKEN STAIR   a step has fallen out: a real jump over the gap, under his FIRE and his ICE
//   3 THE PENDULUM       (new) two of the clock's great weights swing over the gaps: let one swing back over you, go as it turns
//   4 THE FAILING STAIR  two steps are the tower's failing stone (src/tower-collapse.js), and he lays his DEATH MARK: the ring says
//                        move, the stone says do not stop
//   5 THE ICE STAIR      (new) his frost FREEZES THE STEPS IT FALLS ON: slick for a few seconds (L.slick), you slide on them
//   6 THE STONES         the steps are broken to their cores, two tiles each - guard his ICE and FIRE on a foothold
//   7 THE BOOK GAUNTLET  (new) his books come off the wall ahead of you, shake, and fly down the stair at you: guard, or jump them
//   8 THE GALLERY        one long failing walk to the far wall under his MARK
//   9 THE LAST STAIR     all three spells, a gap and a failing step, and the carpet at the top
//
// THE RISING DARK (claude/towerscroll; made to MATTER by claude/archmage2b - Daniel 10-02: "the chase up to the Undead Archmage has poison -
// it doesn't do anything", and scratch/audit-stuck.md #1: it rose 11-15 px/s from the first step and never reached a moving hero). HIS
// DARK MAGIC floods up the stairwell from THE MOMENT YOU COME OUT OF HIS RING at the foot (a banner over the screen, and a dark band on
// its bottom edge the whole climb), at 30 px/s and SURGING faster, each surge told (a banner, thunder and a flash) before it comes. It is
// src/chase.js's chaser (RISE, handed to the level as L.chases): a vertical chase going up, and when it reaches you it HURTS (21: about 28 after the damage scale) and
// THROWS YOU UP onto the nearest step over it (knockTo), then holds a moment so it cannot hit twice. Its rubber band keeps it fair: close
// under you it creeps (rubber.slow), so a hero who keeps climbing stays ahead of it and one who stops is caught; and it NEVER RISES PAST
// THE LANDING OVER YOU until you have stood on it (caps) - a mistake costs health and a scramble, never a soft-lock under it. ONE
// checkpoint, at the stair's foot (the engine's rule: a shrine just before the start line). The top floor is its safe line.
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

/* THE STAIR TOWER, in tiles. Interior columns x0..x1, open rows top..floor-1 (floor: set from the flights below); the level's grid is W wide
   (the Falling Tower is 72). You come out of his ring at `arrive`, on the right: the first flight runs left (claude/archmage2b) */
export const SPIRAL = { x0: 80, x1: 105, top: 70, floor: 0, W: 110, arrive: 103, check: 101 };
/* THE NINE FLIGHTS, foot to top, as they are DRAWN UP: every flight laid out as if it ran right, a step [x0, len, rise, 'fail'?] (rise: rows
   over the landing under it), and a flight that runs left mirrored across the tower. The built FLIGHTS below carry real tiles: a step is
   [x0, len, row] (row: the ledge's own row; you stand on the row over it) with 'fail' for the tower's failing stone. Every flight ends on a
   LANDING against a wall; the ninth's is the top floor, where the carpet lies. Each step is a jump a hero really makes (checkpoint-stand's
   real jump, 5 columns: two rows up and three across, one up and four, or flat and five): tools/tower-chase.mjs walks it with that fill.
   No gap is wider than 2 tiles (claude/towerscroll). The new flights carry their own hazard:
     pend   [x, rise]  a PENDULUM pivoted over the tile edge x (drawn-up frame), its weight at its lowest at chest height over the step `rise` -
                       the HIGHER lip of its gap: it sweeps a hero there, and over the lower lip it passes over his head
     books  true       his books come off the wall the flight runs to
     frost  true       his ice freezes the steps it falls on */
const DRAWN = [
  { name: 'THE STAIR', steps: [[86, 4, 2], [90, 4, 4], [94, 4, 6], [98, 4, 8]], land: [102, 4, 10], spells: ['fire'] },
  { name: 'THE BROKEN STAIR', steps: [[85, 4, 2], [91, 5, 3], [96, 4, 5]], land: [101, 5, 7], spells: ['fire', 'ice'] },
  { name: 'THE PENDULUM', steps: [[85, 4, 2], [91, 7, 3], [100, 3, 4]], land: [103, 3, 6], spells: ['fire'], pend: [[90, 3], [99, 4]] },
  { name: 'THE FAILING STAIR', steps: [[85, 4, 2], [89, 4, 4, 'fail'], [93, 4, 6], [97, 4, 8, 'fail']], land: [102, 4, 10], spells: ['mark', 'fire'] },
  { name: 'THE ICE STAIR', steps: [[86, 5, 2], [93, 5, 3]], land: [100, 6, 5], spells: ['ice', 'fire'], frost: true },
  { name: 'THE STONES', steps: [[86, 2, 2], [90, 2, 3], [94, 2, 4], [98, 2, 5]], land: [101, 5, 7], spells: ['ice', 'fire'] },
  { name: 'THE BOOK GAUNTLET', steps: [[85, 6, 2], [93, 6, 3]], land: [101, 5, 5], spells: ['fire'], books: true },
  { name: 'THE GALLERY', steps: [[85, 4, 2], [89, 11, 4, 'fail']], land: [102, 4, 6], spells: ['mark', 'fire'] },
  { name: 'THE LAST STAIR', steps: [[85, 4, 2], [91, 4, 3, 'fail']], land: [97, 9, 5], spells: ['fire', 'ice', 'mark'], top: true },
];
const TOP_LAND = 79;   /* the top floor's row: fixed - the carpet and the door into his hall stand on it (TOP, L.sanctum.in) */
export const FLIGHTS = (() => { const S = SPIRAL, n = DRAWN.length, mx = (x0, len) => S.x0 + S.x1 + 1 - x0 - len, out = [];
  let base = TOP_LAND + DRAWN.reduce((a, F) => a + F.land[2], 0); S.floor = base;
  DRAWN.forEach((F, k) => { const dir = (n - 1 - k) % 2 ? 1 : -1, X = (x0, len) => dir > 0 ? x0 : mx(x0, len);   /* the ninth runs left, to the carpet */
    const steps = F.steps.map(([x0, len, rise, f]) => f ? [X(x0, len), len, base - rise, f] : [X(x0, len), len, base - rise]);
    const land = [X(F.land[0], F.land[1]), F.land[1], base - F.land[2]];
    const o = { name: F.name, dir, steps, land, spells: F.spells.slice() };
    if (F.pend) o.pend = F.pend.map(([x, r]) => ({ x: dir > 0 ? x : S.x0 + S.x1 + 1 - x, row: base - r }));
    if (F.books) o.books = true; if (F.frost) o.frost = true; if (F.top) o.top = true;
    out.push(o); base = land[2]; });
  return out; })();
/* THE TOP: the carpet laid before the door into his hall, and the carpet's own retry spot five tiles back from it (boarding the carpet
   sets the door checkpoint there; it is not a checkpoint on the stair) */
export const TOP = { carpet: 86, row: 78, check: 81 };
/* THE RISING DARK: the stair's chase for src/chase.js, the camera TIED to it (its surface is kept 16-40 px up from the screen's bottom - show,
   edge - so you see what is coming, but you keep 60% of the screen over you: showKeep), in world px on the y axis, going up (dir -1).
   IT STARTS AT ENTRY (trigger: the hero's middle standing on the stair's floor - you come out of his ring onto it), rises from gap0 under
   that, and stops just under the top floor (end). zone keeps it to the stair tower (the tower's own floors share its rows). CAPS: it never
   rises past the underside of the next landing over you until your feet have stood at that landing's height. knockTo: the ledges it
   throws you up onto. The speeds are px/s up the stairwell; every surge is told. */
export const RISE = (() => { const TS = 16, S = SPIRAL, lastLand = FLIGHTS[FLIGHTS.length - 1].land[2];
  return { id: 'towerscroll', name: 'HIS DARK MAGIC', say: 'HIS DARK MAGIC RISES: CLIMB!', axis: 'y', dir: -1,
    trigger: S.floor * TS - 4, end: (lastLand + 1) * TS + 6, gap0: 110,
    curve: [[0, 30], [330, 36, 'THE DARK SURGES'], [660, 42, 'IT SURGES AGAIN']], lead: 1.6, accel: 30,
    rubber: { min: 72, max: 170, slow: 0.4, catch: 1.2 }, contact: 'hurt', dmg: 21, hold: 1.2, band: true,   /* (dmg 21: about 28 at normal health, after the game's damage scale) */
    caps: FLIGHTS.map(F => ({ reach: F.land[2] * TS - 8, stop: (F.land[2] + 1) * TS + 6 })),
    knockTo: [...FLIGHTS.flatMap(F => F.steps.map(s => s.slice(0, 3))), ...FLIGHTS.map(F => F.land.slice(0, 3))],
    autoscroll: true, edge: 40, show: 16, showKeep: 0.6, glow: 200, look: 'dark',
    zone: [(S.x0 - 1) * TS, (S.x1 + 2) * TS, S.top * TS, (S.floor + 1) * TS], checkpoint: [S.check, S.floor - 1] }; })();
/* THE NEW FLIGHTS' HAZARDS (claude/archmage2b). Numbers in px and seconds.
   PEND: the clock's weights. Its arm swings th radians either way in `period` s; the weight (r) is at its lowest at chest height over the
   step it hangs by, and rises to the arc's ends - so only near the bottom of its swing does it reach a standing hero. It is a weight, not
   a spell: no shield turns it (hard), and it knocks you back.
   BOOK: his books off the wall ahead: a book shakes in its niche `tell` s at your chest or your knees (told: a ! over it and its shudder),
   then flies at you at `v`; a shield turns it, a jump clears it. One every `every` s while you are on that flight.
   FROST: his ice lances freeze the step you stand on and the next one up for `secs` s. */
export const PEND = { arm: 80, th: 0.75, period: 2.8, r: 7, dmg: 16, cd: 0.9, low: 14 };
export const BOOK = { tell: 0.7, v: 165, every: 1.25, dmg: 12, r: 5 };
export const FROST = { secs: 4.5 };

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
    for (const [x0, len, row, f] of F.steps) { ledge(x0, len, row); if (f === 'fail') crumbles.push({ x0, x1: x0 + len - 1, row, count: 2.5, kind: 'spiral' }); }   /* three beats shown (3, 2, 1), as the level's rule line says (claude/archmage2b: the last stair's counted two) */
    const [lx, ll, lr] = F.land; ledge(lx, ll, lr);
  }
  /* THE WAY IN: his ring on the crown's parapet (tower-ascent.js puts that one) lets you out here, at the stair's foot - and the stair's
     one checkpoint stands beside it, just under the rising dark's start line (src/chase.js's rule) */
  ent('ringdoor', S.arrive, S.floor - 1, { id: 'spiral-foot' });
  ent('check', S.check, S.floor - 1);
  ent('sign', S.x1 - 1, S.floor - 1, { text: 'HIS DARK RISES UNDER YOU FROM HERE: KEEP CLIMBING. IT BURNS AND THROWS YOU, AND IT WAITS UNDER EVERY LANDING YOU HAVE NOT REACHED.' });
  /* THE NEW FLIGHTS ARE SIGNED where they begin, on the landing under them, by its wall (claude/archmage2b): the verb, not the trick */
  FLIGHTS.forEach((F, k) => { const say = F.pend ? 'THE CLOCK\'S WEIGHTS SWING OVER THE GAPS: LET ONE SWING BACK OVER YOU, AND GO AS IT TURNS.' : F.frost ? 'HIS FROST FREEZES THE STEPS IT FALLS ON: THEY ARE SLICK FOR A FEW BEATS.' : F.books ? 'HIS BOOKS FLY DOWN THIS STAIR AT YOU: GUARD THEM, OR JUMP THEM.' : null;
    if (!say || !k) return; const [lx, ll, lr] = FLIGHTS[k - 1].land; ent('sign', F.dir > 0 ? lx + 1 : lx + ll - 2, lr - 1, { text: say });   /* (a tile in from the wall: a sign against it runs into the stone) */ });
  ent('magechase', FLIGHTS[0].land[0] + 2, FLIGHTS[0].land[2] - CHASE.up, { face: -1 });
  return { ...S, flights: FLIGHTS.map(F => ({ ...F })), carpet: { ...TOP } };
}
const TELL = { fire: 'fireTell', ice: 'iceTell', mark: 'markTell' };
const SAY = { fireTell: 'FIRE: GUARD IT', iceTell: 'FROST: GUARD IT', markTell: 'THE DEATH MARK: STEP OUT OF THE RING', frostTell: 'FROST: IT FREEZES THE STEPS' };

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
    e.spell = spell; e.mode = TELL[spell]; e.modeT = MAGE.tell[spell]; c.say(SAY[spell === 'ice' && FLIGHTS[Math.min(FLIGHTS.length - 1, next)].frost ? 'frostTell' : e.mode], spell === 'mark'); return; }
  if (e.modeT > 0) { e.face = Math.sign(P.x - e.x) || e.face; return; }
  // ---- the spell goes ----
  const hx = e.x + e.face * 12, hy = e.y - 34, aim = Math.atan2(py - hy, P.x - hx);
  const shot = (a, sp, r, dmg, kind, col) => e.shots.push({ x: hx, y: hy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a, sp, r, dmg, kind, col, t: 4 });
  if (e.spell === 'fire') { for (const s of next >= CHASE.pairFrom ? [-CHASE.pairFan / 2, CHASE.pairFan / 2] : [0]) shot(aim + s, MAGE.boltV, 5, MAGE.dmg.fire, 'fire', '#ff9b49'); c.sound('mageBolt'); }
  else if (e.spell === 'ice') { for (let i = -2; i <= 2; i++) shot(aim + i * 0.3, 120, 4, MAGE.dmg.ice, 'ice', '#9be2ff'); c.sound('hiss');
    /* THE ICE STAIR (claude/archmage2b): his frost FREEZES the step you stand on and the next one up - slick for FROST.secs */
    if (FLIGHTS[Math.min(FLIGHTS.length - 1, next)].frost && c.freeze) for (const q of frostSteps(P, Math.min(FLIGHTS.length - 1, next))) c.freeze(q[0], q[0] + q[1] - 1, q[2], FROST.secs); }
  else if (e.spell === 'mark') { e.deathMark = { x: P.x, y: py, r: CHASE.markR, t: CHASE.markFuse, T: CHASE.markFuse }; e.mode = 'markWait'; e.modeT = 99; c.sound('crack'); return; }
  e.mode = 'wait'; e.modeT = CHASE.gap;
}

/* THE LEDGES OF FLIGHT k in climbing order: the landing under it (or the stair's floor), its steps, its landing */
export const flightSeq = k => [k === 0 ? [SPIRAL.x0, SPIRAL.x1 - SPIRAL.x0 + 1, SPIRAL.floor] : FLIGHTS[k - 1].land, ...FLIGHTS[k].steps, FLIGHTS[k].land];
/* WHAT HIS FROST FREEZES: the ledge your feet are on (if it is a step of flight k) and the next one up the flight - never the floor */
export function frostSteps(P, k) {
  const seq = flightSeq(k), feet = Math.round(P.y / 16), tx = P.x / 16;
  let at = seq.findIndex(([x0, len, row]) => row === feet && tx >= x0 - 0.3 && tx <= x0 + len + 0.3);
  if (at < 0) at = 0; return seq.slice(Math.max(1, at), at + 2);
}
/* THE FLIGHT YOUR FEET ARE ON: past landing i you are on flight i + 1 (the stair's floor is the first flight's) */
export function flightAt(P) { const feet = Math.round(P.y / 16); let k = 0; for (let i = 0; i < FLIGHTS.length; i++) if (feet <= FLIGHTS[i].land[2]) k = i + 1; return Math.min(FLIGHTS.length - 1, k); }
/* THE PENDULUMS, every one on the stair, with the phase each swings at: the two of a flight swing against each other */
export const PENDS = FLIGHTS.flatMap((F, k) => (F.pend || []).map((p, j) => ({ ...p, k, ph: j * Math.PI })));
/* WHERE A WEIGHT IS at time t: its pivot, its arm's angle and the weight at the end of it */
export function pendPos(p, t) { const low = p.row * 16 - PEND.low, px = p.x * 16, py = low - PEND.arm, a = PEND.th * Math.sin(t * Math.PI * 2 / PEND.period + p.ph);
  return { px, py, a, x: px + Math.sin(a) * PEND.arm, y: py + Math.cos(a) * PEND.arm }; }
/* DOES A WEIGHT REACH a hero standing (feet y) at x - his body's middle (13 over his feet) within its weight and his half-height */
export const pendReach = (q, x, y) => Math.hypot(q.x - x, q.y - (y - 13)) < PEND.r + 11;
/* THE BOT'S EYE (src/lab.js chaseClimb): is it safe to walk on at v px/s for `secs` s from (x, feet y), going dir - no weight meets it on
   the way - and is it safe to stay where it is that long */
export function pendSafe(t, x, y, dir, secs = 1.1, v = 80, yAt = null) {
  let go = true, stay = true;
  for (const p of PENDS) { if (Math.abs(p.x * 16 - x) > 140 || Math.abs(p.row * 16 - y) > 60) continue;
    for (let s = 0; s <= secs; s += 0.05) { const q = pendPos(p, t + s); const hx = x + dir * v * s; if (go && pendReach(q, hx, yAt ? yAt(hx) : y)) go = false; if (stay && pendReach(q, x, y)) stay = false; } }
  return { go, stay };
}
/* THE NEW FLIGHTS' HAZARDS, ONE STEP (claude/archmage2b). H: the state main.js keeps (newStairFx); c: { P, hit(x, y, dmg, hard, blow),
   say(msg, hard), sound(k), solid(x, y), on: the hero is on the stair (and alive, not on the carpet) }. The weights swing always; his books
   fly only while you are on their flight. */
export const newStairFx = () => ({ t: 0, cd: 0, books: [], bookT: 0.6, n: 0, told: {} });
export function updateStairFx(H, dt, c) {
  const { P } = c; H.t += dt; H.cd = Math.max(0, H.cd - dt);
  if (!c.on) { H.books.length = 0; return; }
  const k = flightAt(P), F = FLIGHTS[k];
  if ((F.pend || F.books || F.frost) && !H.told[k]) { H.told[k] = true; c.say(F.pend ? 'THE CLOCK\'S WEIGHTS: GO AS ONE TURNS' : F.books ? 'HIS BOOKS COME OFF THE WALL' : 'HIS FROST FREEZES THE STEPS', false); }
  // ---- THE WEIGHTS ----
  if (!P.dead && H.cd <= 0) for (const p of PENDS) { if (Math.abs(p.k - k) > 1) continue; const q = pendPos(p, H.t);
    if (pendReach(q, P.x, P.y)) { H.cd = PEND.cd; c.hit(q.x, q.y, PEND.dmg, true, 'pend'); c.sound('thud'); break; } }
  // ---- HIS BOOKS, on their flight: told in their niche, then flying down the stair at you ----
  if (F.books && !P.dead) { H.bookT -= dt;
    if (H.bookT <= 0 && P.ground) { H.bookT = BOOK.every; const from = F.dir < 0 ? SPIRAL.x0 * 16 + 6 : (SPIRAL.x1 + 1) * 16 - 6, low = (H.n++ % 2) === 1;
      H.books.push({ x: from, y: P.y - (low ? 5 : 15), vx: -F.dir * BOOK.v, tell: BOOK.tell, T: BOOK.tell, low }); c.sound('charge'); } }
  for (const b of H.books) { if (b.tell > 0) { b.tell -= dt; if (b.tell <= 0) c.sound('mageBolt'); continue; }
    b.x += b.vx * dt; if (b.x < (SPIRAL.x0 - 1) * 16 || b.x > (SPIRAL.x1 + 2) * 16 || (c.solid && c.solid(b.x + Math.sign(b.vx) * 4, b.y))) { b.gone = true; continue; }
    if (!b.hit && !P.dead && Math.abs(P.x - b.x) < BOOK.r + 6 && Math.abs((P.y - 13) - b.y) < BOOK.r + 12) { b.hit = true; b.gone = true; c.hit(b.x, b.y, BOOK.dmg, false, 'book'); } }
  H.books = H.books.filter(b => !b.gone);
}
/* THEIR DRAWING (world space): the weights on their chains from a bracket, the books shaking in their niches and flying */
export function drawStairFx(g, H, cx, cy, VW, VH, time) {
  for (const p of PENDS) { const q = pendPos(p, H.t), px = Math.round(q.px - cx), py = Math.round(q.py - cy), x = Math.round(q.x - cx), y = Math.round(q.y - cy);
    if (Math.max(px, x) < -20 || Math.min(px, x) > VW + 20 || y < -20 || py > VH + 20) continue;
    g.fillStyle = '#2a2632'; g.fillRect(px - 6, py - 3, 12, 4); g.fillStyle = '#6a6274'; g.fillRect(px - 6, py - 3, 12, 1);   /* the bracket */
    g.strokeStyle = '#8a8070'; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke();
    g.strokeStyle = '#4a4438'; g.lineWidth = 1; g.beginPath(); g.moveTo(px + 1, py); g.lineTo(x + 1, y); g.stroke();
    g.fillStyle = '#3a2e1c'; g.beginPath(); g.arc(x, y, PEND.r + 1, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#b08a3a'; g.beginPath(); g.arc(x, y, PEND.r, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e6c46a'; g.fillRect(x - 3, y - 4, 3, 2);   /* the brass weight, its shine */
    const w = Math.cos(H.t * Math.PI * 2 / PEND.period + p.ph), sp = Math.abs(w);
    if (sp > 0.7) { g.fillStyle = 'rgba(230,196,106,' + ((sp - 0.7) * 1.2).toFixed(2) + ')'; g.fillRect(x - Math.sign(w) * 10 - 1, y - 1, 3, 2); } }   /* a streak at the bottom of the swing, where it hurts */
  for (const b of H.books) { const sh = b.tell > 0 ? Math.round(Math.sin(time * 60) * 1.5) : 0, x = Math.round(b.x - cx) + sh, y = Math.round(b.y - cy);
    if (x < -20 || x > VW + 20 || y < -20 || y > VH + 20) continue;
    if (b.tell > 0) { g.fillStyle = 'rgba(40,20,30,0.7)'; g.fillRect(Math.round(b.x - cx) - 7, y - 6, 14, 12);   /* its niche in the wall */
      g.fillStyle = Math.floor(time * 8) % 2 ? '#ff6b6b' : '#ffd36b'; g.fillRect(x - 1, y - 16, 2, 6); g.fillRect(x - 1, y - 8, 2, 2); }   /* ! - told */
    const flap = b.tell > 0 ? 0 : Math.round(Math.sin(time * 30) * 2);
    g.fillStyle = '#5a2a2a'; g.fillRect(x - 5, y - 3 - flap, 10, 6 + flap); g.fillStyle = '#e8dcc0'; g.fillRect(x - 4, y - 1, 8, 2); g.fillStyle = '#c8a040'; g.fillRect(x - 5, y - 3 - flap, 10, 1); }
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
