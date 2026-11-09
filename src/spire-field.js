/* src/spire-field.js - FALLING TOWER 5: THE SPIRE FIELD (claude/ft5b; scratch/brief-fallingtower5-1108.md, scratch/lane-reports/ft5-plan.md sec 3).
   The Undead Archmage's fight moves OUTSIDE, into the one box FT5_ARENA (src/tower-fall5.js, lane ft5a) - ONE CAMERA, no cut:
     PHASE 1 (100 -> 50%)  ON FOOT on six broken spires of the Folly's outbuildings standing out of HIS POISON SEA. The sea rises in three TOLD
                           TIDES tied to his health (85 / 70 / 60%), 4 rows each, then holds (a breather); it ebbs a row while he is open. As a tide
                           comes, a low spire CRACKS (told 1.5 s) and TOPPLES across to its neighbour as a bridge (a route change, never under a
                           hero mid-tell). The poison hurts 21 and throws you onto the nearest top: never kills (FT4's 'spare'), per co-op seat.
                           His kit on foot = the chase rooms' (fire, ice, hand, mark), then from 75% + storm, his rings, the bone storm.
                           OPENINGS: strike his bolt back, his mark finding no one, a dodge through his exit ring, and a CRACKED BUTTRESS struck
                           while he hovers in its fall box (the ghost shows it): the spire's top comes down on him. Every opening drops him onto
                           the nearest spire top, open (x2) for 3 s - on foot you can reach him there (the chase rooms' rule).
                           He goes no lower than 50% on foot (a blow past it: HE HOLDS, his 'down' cut short).
     THE FADE (50%)        his spell finished, he rises, flares and FADES (1.2 s); every platform shimmers (told 1.0 s) and goes, top down (0.5 s);
                           the sea drains; everyone falls ~6-10 rows and a CARPET flies up under each live seat (no damage, i-frames through the
                           whole beat, flasks and meter untouched). He re-forms 1.0 s after the last seat is caught (no 'wake' freeze).
     PHASE 2 (50 -> 0%)    his carpet/hall kit in the SAME box (main.js's own carpet fight: L.arena becomes the carpet box, same x), realms FIRE at
                           40% and ICE at 20% OPENED IN PLACE (the poison realm is retired - its mire is phase 1 now), enraged at 30%.
     THE WIN               his door opens where he falls (L.sanctum, src/sanctum.js) - through it, the SAND rows over the field and THE SUNKEN CARAVAN.
   A death anywhere in the fight: checkpoint 4 (THE CROWN), every tile of the box put back, the whole fight again (plan Q1).
   Pure: no DOM, no main.js. main.js hands its hands in on single tagged hook lines (claude/ft5b); tools/ft5-arena.mjs drives all of it headless.
   Numbers are tiles unless named px or s. Columns are off A.x0, rows off A.runFloor, so FT5_ARENA can move without retyping the field. */
import { SPIRE_LINES } from './spire-lines.js';
import { REALM } from './mage-realms.js';
import { drawField } from './redraw/ft5_art.js';   /* (claude/ft5art) the spire field's paint */
export { SPIRE_LINES, SPIRE_SAY } from './spire-lines.js';

const TS = 16;
/* THE FIELD (dx off A.x0, top = dy off A.runFloor: the row of the spire's top tile; you stand a row over it).
   fallAt: the tide (1..3) that topples it (0: it stands all fight); bridge: [dx0, dx1, dy] the stone it lays when it goes (solid, one row);
   buttress: the cracked buttress on its edge (col dx, standing on the top) and its FALL BOX [dx0, dx1, dy0, dy1] (rows off runFloor) - he must hover in it */
export const SPIRES = [
  { id: 'west',  dx0: 0,  dx1: 6,  top: 0,   fallAt: 1, bridge: [2, 7, -2] },            /* the crown rests on it: you arrive level with it */
  { id: 'gate',  dx0: 8,  dx1: 14, top: -2,  fallAt: 3, bridge: [15, 18, -6] },
  { id: 'bell',  dx0: 19, dx1: 26, top: -7,  fallAt: 0, buttress: { dx: 26, box: [27, 40, -24, -8] } },
  { id: 'well',  dx0: 30, dx1: 35, top: -4,  fallAt: 2, bridge: [27, 38, -7] },           /* goes over between the bell and the moon: one walk from one to the other */
  { id: 'moon',  dx0: 39, dx1: 46, top: -8,  fallAt: 0, buttress: { dx: 39, box: [26, 38, -24, -9] } },
  { id: 'crown', dx0: 49, dx1: 56, top: -10, fallAt: 0, buttress: { dx: 49, box: [36, 48, -26, -11] } },
];
/* MASONRY LEDGES between them (one-way): [dx0, dx1, dy]. Two are CORBELS on a spire's face (the bell's west, the moon's west: joined to it, tools/solid-islands.mjs),
   one hangs over the well spire (its post) */
export const LEDGES = [[17, 18, -4], [29, 33, -9], [37, 38, -6]];
/* THE TIDES (plan 3.2): his health marks, rows a tide, the tell's lead, how long a tide takes to rise, the ebb while he is open (rows) */
export const TIDE = { at: [0.85, 0.7, 0.6], rows: 4, lead: 1.6, riseT: 2.5, ebb: 1, ebbV: 16, drainV: 260, dmg: 21, hold: 1.2 };
/* THE TOPPLE (plan 3.2): its tell, and how long a hero standing on it may hold it before the sea has him anyway */
export const TOPPLE = { tell: 1.5, holdMax: 6 };
/* HIM ON FOOT (plan 3.2): his order by stage (the same spells, tells, numbers), the hp floor, his fall to a top and his open time there (the chase rooms') */
export const P1 = {
  orderA: ['fire', 'ice', 'hand', 'mark'],
  orderB: ['fire', 'storm', 'step', 'ice', 'mark', 'bend', 'bone', 'hand', 'decoy', 'fire', 'trap'],
  stageB: 0.75, hpFloor: 0.5, downT: 3.0, heldDown: 0.35, riseT: 0.5, fallG: 1100, glide: 320,
  ceilUp: 72, ceilBand: 80, ceilV: 90,   /* he hovers no lower than ceilUp px over the ground you stand on, no higher than ceilBand over that: on the screen, over your reach */
};
/* THE FADE (plan 3.3) */
export const FADE = { rise: 0.6, fade: 1.2, tell: 1.0, clear: 0.5, reform: 1.0, firstCast: 1.0, fallV: 420, rugV: 220, rugFrom: 120, catchDy: -1, failsafe: 5, guard: 0.6 };
/* PHASE 2 (plan 3.4): the carpet box (rows off runFloor), his realm marks and kinds, the enrage, and the realm's in-place pull (px/s: the tear draws the carpets in) */
export const P2 = { y0: -15, floor: 3, realmAt: [0.4, 0.2], realmKinds: ['fire', 'ice'], enrageAt: 0.3, pullV: 160 };
/* THE SAND (the desert rows over the field: the win's door puts you here) and the level's end */
export const SAND5 = { row: 6, deep: 12, arrive: 20, gate: 34 };
/* (claude/ft5fix) THE WIN DOOR: the storm walls open as he dies (the enrage had squeezed the carpet box to 60% of its width, and the door - clamped to the arena, not the squeezed box - could hang in the wall), and the door drifts to the nearest carpet if none has gone in (px/s) */
export const WIN5 = { openT: 1.0, glideAfter: 4, glideV: 70, sandGap: 14 };
/* the realm ward chips (plan 3.2 Resist: never invulnerable; GREED.chipBy.undeadmage 0.4 lands it - main.js lets the blow through under FT5) */
export const RESIST = { chip: 0.4 };

const OPENINGS = new Set(['reflected', 'gather', 'breached', 'crushed']);
const LEG = new Set(['fall', 'down', 'rise']);
const FADE_MODES = new Set(['sfRise', 'sfFade', 'sfGone', 'sfReform']);
export const hpFloorOf = e => Math.ceil((e.maxHp || e.hp0 || e.hp) * P1.hpFloor);

/* ---------------------------------------------------------------- BUILD ---------------------------------------------------------------- */
/* the field in absolute tiles (and px boxes) for an FT5_ARENA */
export function fieldOf(A) {
  const X = d => A.x0 + d, Y = d => A.runFloor + d;
  const spires = SPIRES.map(s => ({ id: s.id, x0: X(s.dx0), x1: X(s.dx1), top: Y(s.top), fallAt: s.fallAt,
    bridge: s.bridge ? [X(s.bridge[0]), X(s.bridge[1]), Y(s.bridge[2])] : null,
    buttress: s.buttress ? { col: X(s.buttress.dx), top: Y(s.top) - 3, bot: Y(s.top) - 1, box: [X(s.buttress.box[0]), X(s.buttress.box[1]), Y(s.buttress.box[2]), Y(s.buttress.box[3])] } : null }));
  const ledges = LEDGES.map(([a, b, d]) => [X(a), X(b), Y(d)]);
  const tides = TIDE.at.map((at, k) => ({ at, row: A.sea - TIDE.rows * (k + 1) }));
  const catchRow = A.runFloor + FADE.catchDy;
  const px = { x0: A.x0 * TS, x1: (A.x1 + 1) * TS };
  const p1 = { ...px, y0: (A.runFloor - 22) * TS, floor: A.runFloor * TS };
  const p2 = { ...px, y0: (A.runFloor + P2.y0) * TS, floor: (A.runFloor + P2.floor) * TS };
  return { A: { ...A }, spires, ledges, tides, sea0: A.sea, seaFloor: A.y1, catchRow, p1, p2 };
}
/* kit = { T, rect, ledge, ent, set } (the FT5 builder's painters). Returns { level, calm, skins } for the builder to lay into its level. */
export function buildSpireField(L, A, kit) {
  const { T, rect, ledge, ent } = kit, F = fieldOf(A);
  /* THE SPIRES: rock from the top row down to the sea's floor (the rock under y1 is the world's) */
  for (const s of F.spires) rect(s.x0, s.x1, s.top, A.y1, T.SOLID);
  for (const [x0, x1, row] of F.ledges) ledge(x0, x1 - x0 + 1, row);
  /* HIM, waiting over the spires in his poison (plan 3.1); the fight starts as you step off the crown onto the west spire (spireStep: no camera snap) */
  ent('undeadmage', A.x0 + 30, A.runFloor - 14, { face: -1 });
  ent('sign', A.x0 + 2, A.runFloor - 1, { text: 'STRIKE HIS SPELLS BACK. A CRACKED BUTTRESS BRINGS ITS SPIRE DOWN ON HIM.' });
  /* THE SAND (plan 3.4 win): open sand from one edge of the world to the other, high over the field; the level's end a few steps on */
  const W = L.W;
  rect(0, W - 1, SAND5.row, SAND5.deep, T.SOLID);
  ent('gate', SAND5.gate, SAND5.row - 1);
  ent('sign', SAND5.arrive + 4, SAND5.row - 1, { text: 'THE TOWER IS DOWN BEHIND YOU. AHEAD IS THE SAND, AND THE ROAD TO THE SUNKEN CARAVAN.' });
  const p1 = F.p1, p2 = F.p2;
  const arena = { ...p1, trigger: 1e9, start: [A.x0 + 3, A.runFloor - 1], boss: 'undeadmage', music: 'undeadmage', tint: '#30334e', tintA: 0.06,
    wallL: A.x0 - 1, wallR: A.x1 + 1, spire: true, carpet: false, inPlace: false };   /* trigger 1e9: spireStep starts the fight (the lock eases in, ft4a's tween) */
  const sanctum = { in: { x: -1e5, y: -1e5 }, rug: true, spawn: { x: (p2.x0 + p2.x1) / 2, y: A.runFloor * TS - 40 }, sand: { x: SAND5.arrive * TS + 8, y: SAND5.row * TS }, out: null, open: false, outOpen: 0, t: 0 };
  return {
    level: { arena, sanctum, spireField: { ...F, p1Arena: { ...arena }, p2Arena: { y0: p2.y0, floor: p2.floor, carpet: true, inPlace: true } } },
    calm: [[0, W - 1, 0, SAND5.deep + 1]],
    skins: [...F.spires.map(s => [s.x0, s.x1, s.top, A.y1, 'spire']), ...F.spires.filter(s => s.bridge).map(s => [s.bridge[0], s.bridge[1], s.bridge[2], s.bridge[2], 'spire']), [0, W - 1, SAND5.row, SAND5.deep, 'dune']],   /* (claude/ft5art) the spires and the bridges they lay are the Folly's slate gone violet */
  };
}

/* ---------------------------------------------------------------- RUNTIME ---------------------------------------------------------------- */
/* A LIFE STARTS (main.js spawnEntities hook): every tile of the box back as built, the sea at its start, every spire standing, his fight unstarted.
   restore(x, y) puts the built tile back (main.js: grid0) */
export function spireReset(L, restore) {
  const F = L && L.spireField; if (!F) return;
  const A = F.A;
  if (restore) for (let y = A.y0; y <= A.y1; y++) for (let x = A.x0 - 1; x <= A.x1 + 1; x++) restore(x, y);
  L.hallFadeT = null;   /* the hall's backdrop fades in again at the next catch */
  if (L.arena && F.p1Arena) { for (const k of Object.keys(F.p2Arena)) delete L.arena[k]; Object.assign(L.arena, F.p1Arena); }
  F.rt = { started: false, seaY: F.sea0 * TS, seaTo: F.sea0 * TS, tides: F.tides.map(() => null), spires: F.spires.map(() => ({ st: 'up', t: 0 })),
    butt: F.spires.map(s => (s.buttress ? { st: 'up', t: 0 } : null)), hold: new Map(), ceil: null, lock: null, lockFrom: null, lockT: 0,
    fade: null, rugs: new Map(), phase: 'p1', drained: false, said: {} };
}
/* the tops you can stand on now (above the sea): spire tops still up, the bridges laid, the ledges (wide ones only when he must land on one) */
export function topsOf(F, R, o = {}) {
  const sea = Math.floor(R.seaY / TS), out = [];
  F.spires.forEach((s, i) => { if (R.spires[i].st !== 'gone' && s.top < sea) out.push({ x0: s.x0, x1: s.x1, row: s.top, spire: i }); });
  F.spires.forEach((s, i) => { if (R.spires[i].st === 'gone' && s.bridge && s.bridge[2] < sea) out.push({ x0: s.bridge[0], x1: s.bridge[1], row: s.bridge[2], bridge: i }); });
  if (!o.wide) for (const [x0, x1, row] of F.ledges) if (row < sea) out.push({ x0, x1, row, ledge: true });
  return out;
}
/* the top nearest a point (px): where the poison throws a seat, where he falls when he opens */
export function nearestTop(F, R, x, y, o = {}) {
  let best = null, bd = Infinity;
  for (const t of topsOf(F, R, o)) { if (o.wide && t.x1 - t.x0 < 2) continue; const cx = Math.max((t.x0 + 0.5) * TS, Math.min((t.x1 + 0.5) * TS, x)), d = Math.hypot(cx - x, (t.row * TS - y) * (o.flat ? 0.3 : 1));
    if (d < bd) { bd = d; best = { ...t, x: cx, y: t.row * TS }; } }
  return best;
}
const standingOn = (p, x0, x1, row) => !!p && !p.dead && !p.carpet && p.x > x0 * TS - 6 && p.x < (x1 + 1) * TS + 6 && Math.abs(p.y - row * TS) < 6;
const live = seats => seats.filter(p => p && !p.dead);
const hpFrac = e => e.hp / (e.hp0 || e.maxHp || e.hp);

/* ONE FRAME (main.js hook, beside ft5Update). c: { T, set(x, y, t), boss() -> e|null, active() -> bool, start(), seats() -> [P..], hurt(p, x, dmg),
   place(p, x, y), guard(p, s), mount(p, x, y), strike() -> blow box|null, say(s), sound(k), shake(n), dust(x, y, n), cam() -> {x, y, w, h}, lock(x0, x1), now() } */
export function spireStep(L, P, dt, c) {
  const F = L && L.spireField; if (!F) return; if (!F.rt) spireReset(L, null);
  const R = F.rt, A = F.A, e = c.boss(), seats = c.seats(), fighting = !!(e && e.alive && c.active());
  if (e && e.alive && !e.legStep) e.legStep = (m, d, cc) => spireLeg(L, m, d, cc);   /* undead-mage.js asks it every frame (its c.chase's place) */
  // ---- THE START: off the crown onto the west spire; the camera's lock eases out to the box (0.8 s, ft4a's widen) - no snap ----
  if (!R.started && e && e.alive && !c.active() && !P.dead && P.ground && P.x > (A.x0 + 1) * TS && P.x < A.x1 * TS && P.y <= A.runFloor * TS + 4) {
    R.started = true; c.start(); const cm = c.cam(); R.lockFrom = { x0: Math.min(F.p1.x0, cm.x + 8), x1: Math.max(F.p1.x1, cm.x + cm.w - 8) }; R.lockT = 0; }
  if (R.lockFrom && R.lockT < 0.8) { R.lockT = Math.min(0.8, R.lockT + dt); const k = R.lockT / 0.8, s = k * k * (3 - 2 * k);
    c.lock(R.lockFrom.x0 + (F.p1.x0 - R.lockFrom.x0) * s, R.lockFrom.x1 + (F.p1.x1 - R.lockFrom.x1) * s); }
  // ---- HIS HOVER CEILING (the leg holds him to it): eased off the ground you stand on, so a jump never drags him ----
  { const g = P.ground && !P.carpet ? P.y : R.ceilG ?? P.y; R.ceilG = g; const want = Math.max(F.p1.y0 + 40, g - P1.ceilUp);
    R.ceil = R.ceil == null ? want : R.ceil + Math.max(-P1.ceilV * dt, Math.min(P1.ceilV * dt, want - R.ceil)); }
  if (R.phase === 'p1') {
    // ---- THE TIDES: told (lead), then rising TIDE.rows, then holding; tied to his health ----
    if (fighting && e.sf !== 'fade') F.tides.forEach((td, k) => { if (!R.tides[k] && hpFrac(e) <= td.at && (k === 0 || R.tides[k - 1])) {
      R.tides[k] = { st: 'tell', t: 0 }; c.say(SPIRE_LINES.tide[k]); c.sound('heavy'); c.sound('hiss'); c.shake(4); } });
    R.tides.forEach((q, k) => { if (!q) return; q.t += dt;
      if (q.st === 'tell' && q.t >= TIDE.lead) { q.st = 'rise'; q.t = 0; R.seaTo = F.tides[k].row * TS;
        F.spires.forEach((s, i) => { if (s.fallAt === k + 1 && R.spires[i].st === 'up') { R.spires[i] = { st: 'tell', t: 0 }; c.sound('crack'); } }); }
      else if (q.st === 'rise' && q.t >= TIDE.riseT) q.st = 'held'; });
    const open = !!(e && e.alive && (OPENINGS.has(e.mode) || e.mode === 'down' || e.mode === 'fall'));
    const target = R.seaTo + (open ? TIDE.ebb * TS : 0), v = R.tides.some(q => q && q.st === 'rise') ? TIDE.rows * TS / TIDE.riseT : TIDE.ebbV;
    if (!R.fade) R.seaY += Math.max(-v * dt, Math.min(v * dt, target - R.seaY));   /* (in the fade it drains: fadeStep) */
    // ---- THE TOPPLES: told, then over as a bridge - never while a hero stands on it (it holds the tell, up to holdMax) ----
    F.spires.forEach((s, i) => { const q = R.spires[i]; if (q.st !== 'tell') return; q.t += dt;
      const on = live(seats).some(p => standingOn(p, s.x0, s.x1, s.top));
      if (q.t >= TOPPLE.tell && (!on || q.t >= TOPPLE.tell + TOPPLE.holdMax)) topple(F, R, i, c); });
    // ---- THE CRACKED BUTTRESSES: a blow brings the spire's top down - on him if he hangs in its fall box ----
    const hb = c.strike();
    if (hb && !R.fade) F.spires.forEach((s, i) => { const b = s.buttress, q = R.butt[i]; if (!b || !q || q.st !== 'up' || R.spires[i].st === 'gone') return;
      const bx = { l: b.col * TS, r: (b.col + 1) * TS, t: b.top * TS, b: (b.bot + 1) * TS }; if (!(hb.r > bx.l && hb.l < bx.r && hb.b > bx.t && hb.t < bx.b)) return;
      const inBox = e && e.alive && fighting && boxHas(b.box, e.x, e.y);
      if (inBox && (e.wardHold > 0 || !crushable(e))) { if (!(q.saidT > 0)) { c.say(SPIRE_LINES.warded); q.saidT = 1.5; } return; }
      q.st = 'down'; q.t = 0; c.sound('stone'); c.shake(6); c.dust((b.col + 0.5) * TS, b.top * TS, 10);
      if (inBox) { e.mode = 'crushed'; e.modeT = 1; c.say(SPIRE_LINES.crush); } else c.say(SPIRE_LINES.miss); });
    R.butt.forEach(q => { if (q) { q.t += dt; if (q.saidT > 0) q.saidT -= dt; } });
    // ---- HIS POISON: each seat it reaches is hurt and thrown onto the nearest top (never killed: 'spare'), one hold a seat ----
    seats.forEach((p, i) => { if (!p) return; const h = Math.max(0, (R.hold.get(i) || 0) - dt); R.hold.set(i, h);
      if (R.fade || p.dead || p.carpet || h > 0 || p.y <= R.seaY + 2 || p.x < A.x0 * TS - 8 || p.x > (A.x1 + 1) * TS + 8) return;
      R.hold.set(i, TIDE.hold); c.hurt(p, p.x, TIDE.dmg); const to = nearestTop(F, R, p.x, p.y); if (to && !p.dead) c.place(p, to.x, to.y); });
  }
  // ---- THE FADE AND THE FALL (his leg starts it: spireLeg) ----
  if (R.fade) fadeStep(L, F, R, P, seats, dt, c);
  if (e && e.alive && e.sf === 'p2') realmDraw(L, e, seats, dt);
  winStep(L, F, R, e, seats, dt, P);
}
/* (claude/ft5fix) THE WIN: once he is dead the sky opens (the squeeze eases off), and his door - which main.js opens where he fell - is held inside the carpet box and,
   if nobody has flown to it in WIN5.glideAfter s, drifts to the lead's carpet (the one main.js's door check reads; the nearest live one if the lead is down): the win is never out of reach (solo or co-op) */
export function winStep(L, F, R, e, seats, dt, lead) {
  if (e && !e.alive && e.squeeze > 0) e.squeeze = Math.max(0, e.squeeze - dt / WIN5.openT);
  const S = L.sanctum; if (!S || !S.open || !S.out || L.sandWalk) { R.doorT = 0; return; }
  const b = carpetBoxOf(L.arena);
  S.out.x = Math.max(b.x0 + 24, Math.min(b.x1 - 24, S.out.x)); S.out.y = Math.max(b.y0 + 30, Math.min(b.y1 - 70, S.out.y));
  R.doorT = (R.doorT || 0) + dt; if (R.doorT < WIN5.glideAfter) return;
  let near = null, nd = Infinity; for (const p of (lead && !lead.dead && lead.carpet ? [lead] : live(seats))) if (p.carpet) { const d = Math.hypot(p.x - S.out.x, p.y - S.out.y); if (d < nd) { nd = d; near = p; } }
  if (!near || nd < 1) return; const k = Math.min(nd, WIN5.glideV * dt) / nd;
  S.out.x += (near.x - S.out.x) * k; S.out.y += (near.y - S.out.y) * k;
}
/* the door was entered: every live seat comes through it onto the sand (the lead's own leave did only the lead) */
export function winLeave(L, seats, lead) {
  const S = L.sanctum; if (!S || !S.sand) return;
  let n = 0; for (const p of seats) { if (!p || p === lead || p.dead) continue; n++;
    p.carpet = null; p.vx = p.vy = 0; p.x = S.sand.x + (n % 2 ? -1 : 1) * Math.ceil(n / 2) * WIN5.sandGap; p.y = S.sand.y; p.ground = true; p.climb = false; p.dodge = 0; }
}
function topple(F, R, i, c) {
  const s = F.spires[i], A = F.A; R.spires[i] = { st: 'gone', t: 0 };
  for (let y = s.top; y <= A.y1; y++) for (let x = s.x0; x <= s.x1; x++) c.set(x, y, c.T.AIR);
  if (s.bridge) for (const [x0, x1, row] of F.ledges) if (x0 >= s.bridge[0] && x1 <= s.bridge[1] && row > s.bridge[2]) for (let x = x0; x <= x1; x++) c.set(x, row, c.T.AIR);   /* the ledge under the well's bridge goes with it */
  if (s.bridge) { const [x0, x1, row] = s.bridge; for (let x = x0; x <= x1; x++) c.set(x, row, c.T.SOLID); }
  for (const [j, s2] of F.spires.entries()) if (j !== i && R.spires[j].st === 'gone' && s2.bridge && s2.bridge[1] >= s.x0 - 1 && s2.bridge[0] <= s.x1 + 1 && s2.bridge[2] >= s.top) { const [x0, x1, row] = s2.bridge; for (let x = x0; x <= x1; x++) c.set(x, row, c.T.AIR); }   /* a bridge it carried goes with it */
  c.say(SPIRE_LINES.topple); c.sound('stone'); c.shake(7); c.dust((s.x0 + s.x1 + 1) / 2 * TS, s.top * TS, 16);
}
const boxHas = (b, x, y) => x >= b[0] * TS && x <= (b[1] + 1) * TS && y >= b[2] * TS && y <= (b[3] + 1) * TS + 8;
const crushable = e => !OPENINGS.has(e.mode) && !LEG.has(e.mode) && !FADE_MODES.has(e.mode) && !['wake', 'blinkOut', 'blinkIn', 'realmTell'].includes(e.mode);

/* HIS LEG (undead-mage.js updateUndeadMage asks e.legStep where the chase's c.chase was: after his shots, before his casting). true = it took the frame.
   c is main.js's own ctx for his fight: { P, box, A, say, sound, shake, ... } */
export function spireLeg(L, e, dt, c) {
  const F = L && L.spireField; if (!F || !F.rt || !e.alive) return false;
  const R = F.rt, P = c.P;
  if (!e.sf) { e.sf = 'p1'; e.onFoot = true; e.noRealm = true; e.realmAt = null; }
  if (e.sf === 'p2') return false;
  if (e.sf === 'fade') return fadeLeg(F, R, e, dt, c);
  e.order = hpFrac(e) > P1.stageB ? P1.orderA : P1.orderB; e.noRealm = true;
  /* HELD OVER YOUR REACH: no lower than the ceiling over the ground you stand on, no higher than a band over it (on the screen) */
  if (!LEG.has(e.mode) && R.ceil != null) { e.y = Math.max(R.ceil - P1.ceilBand, Math.min(R.ceil, e.y)); if (e.mode === 'blinkOut' && e.teleY != null) e.teleY = Math.max(R.ceil - P1.ceilBand, Math.min(R.ceil, e.teleY)); }
  /* AN OPENING ON FOOT: he FALLS onto the nearest spire top, open there (the chase rooms' rule) */
  if (OPENINGS.has(e.mode)) { const to = nearestTop(F, R, e.x, e.y, { wide: true, flat: true });
    if (to) { e.fallTo = { x: Math.max((to.x0 + 1) * TS, Math.min(to.x1 * TS, e.x)), y: to.y }; e.mode = 'fall'; e.modeT = 9; e.vy = 0;
      e.deathMark = null; e.bones = null; e.orbit = null; e.script = null; e.void = null; e.fireRing = null; e.chained = false; for (const q of e.rings || []) q.life = Math.min(q.life, q.t + 0.2);
      c.say(SPIRE_LINES.fall, true); c.sound('crack'); return true; } }
  if (e.mode === 'fall') { const T = e.fallTo || { x: e.x, y: e.y }, dx = T.x - e.x; e.x += Math.sign(dx) * Math.min(Math.abs(dx), P1.glide * dt);
    if (e.y < T.y) { e.vy = (e.vy || 0) + P1.fallG * dt; e.y = Math.min(T.y, e.y + e.vy * dt); } else e.y = Math.max(T.y, e.y - 200 * dt);
    if (Math.abs(e.y - T.y) < 1 && Math.abs(dx) < 2) { e.y = T.y; e.vy = 0; const held = e.hp <= hpFloorOf(e); e.mode = 'down'; e.modeT = held ? P1.heldDown : P1.downT; e.open = e.modeT; e.face = Math.sign(P.x - e.x) || 1;
      if (held) c.say(SPIRE_LINES.holds, true); c.sound('heavy'); c.shake(5); }
    return true; }
  if (e.mode === 'down') { if (e.fallTo) e.y = e.fallTo.y; if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = P1.riseT; c.sound('mageBolt'); } return true; }
  if (e.mode === 'rise') { e.y -= 90 * dt; if (e.modeT > 0) return true; e.mode = 'hover'; e.modeT = 0.4; e.fallTo = null; return true; }
  /* 50%: his spell finished, HE FADES - and the towers with him */
  if (e.hp <= hpFloorOf(e) && e.mode === 'hover') { startFade(F, R, e, c); return true; }
  return false;
}
function startFade(F, R, e, c) {
  e.sf = 'fade'; e.mode = 'sfRise'; e.modeT = FADE.rise; e.sfAlpha = 1;
  e.shots = []; e.clouds = []; e.rings = []; e.bones = null; e.orbit = null; e.void = null; e.echoes = []; e.script = null; e.deathMark = null; e.fireRing = null; e.chained = false;
  R.fade = { st: 'rise', t: 0 }; R.tides.forEach(q => { if (q && q.st !== 'held') q.st = 'held'; });
  for (const q of R.spires) if (q.st === 'tell') q.st = 'up';   /* no spire goes over in the fade: they all go together */
  c.say(SPIRE_LINES.fade, true); c.sound('mageBolt'); c.sound('heavy'); c.shake(4);
}
function fadeLeg(F, R, e, dt, c) {
  if (e.mode === 'sfRise') { e.y -= 40 * dt; e.wardHitT = 0.3; if (e.modeT <= 0) { e.mode = 'sfFade'; e.modeT = FADE.fade; R.fade = { st: 'tell', t: 0 }; c.sound('hiss'); } return true; }
  if (e.mode === 'sfFade') { e.sfAlpha = Math.max(0, e.modeT / FADE.fade); e.y -= 10 * dt; if (e.modeT <= 0) { e.mode = 'sfGone'; e.modeT = 99; e.sfAlpha = 0; e.x = (F.p2.x0 + F.p2.x1) / 2; e.y = F.p2.y0 + 70; } return true; }
  if (e.mode === 'sfGone') { e.sfAlpha = 0; if (R.fade && R.fade.st === 'done') { e.mode = 'sfReform'; e.modeT = FADE.reform; e.face = Math.sign(c.P.x - e.x) || -1; c.sound('mageBolt'); } return true; }
  if (e.mode === 'sfReform') { e.sfAlpha = Math.min(1, 1 - e.modeT / FADE.reform); if (e.modeT > 0) return true;
    /* PHASE 2: his carpet/hall kit in the same box - main.js's own carpet fight from here (realms in place, fire 40 / ice 20, enraged at 30) */
    e.sf = 'p2'; e.sfAlpha = undefined; e.onFoot = false; e.order = null; e.noRealm = false; e.realmAt = P2.realmAt.slice(); e.realmN = 0; e.realmKinds = P2.realmKinds.slice(); e.enrageAt = P2.enrageAt;
    e.mode = 'hover'; e.modeT = FADE.firstCast; e.wardHold = 0; e.turn = 0; e.vy = 0; c.say(SPIRE_LINES.reform, true); return true; }
  return true;
}
/* THE FADE's world half: the platforms' shimmer, their clearing top-down, the drain, the fall, a rug up under each live seat */
function fadeStep(L, F, R, P, seats, dt, c) {
  const Fd = R.fade, A = F.A; Fd.t += dt;
  for (const p of live(seats)) c.guard(p, FADE.guard);   /* i-frames through the whole beat */
  R.seaY = Math.min((A.y1 + 2) * TS, R.seaY + TIDE.drainV * dt * (Fd.st === 'rise' ? 0.2 : 1));   /* the sea sinks out of the box: you never fall into poison */
  if (Fd.st === 'tell' && Fd.t >= FADE.tell) { Fd.st = 'clear'; Fd.t = 0; Fd.rows = clearRows(F, c);
    /* a seat far from the lead is leash-pulled to it before the fall (plan 3.3: off-screen partners first) */
    const lead = P, cm = c.cam(); for (const p of live(seats)) if (p !== lead && Math.abs(p.x - lead.x) > cm.w * 0.45) c.place(p, lead.x - 20 * Math.sign(p.x - lead.x || 1), lead.y); }
  if (Fd.st === 'clear') { const n = Fd.rows.length, upto = Math.min(n, Math.ceil(n * Math.min(1, Fd.t / FADE.clear)));
    for (let k = Fd.done || 0; k < upto; k++) for (const [x, y] of Fd.rows[k]) c.set(x, y, c.T.AIR); Fd.done = upto;
    if (upto >= n) { Fd.st = 'fall'; Fd.t = 0; c.sound('stone'); c.shake(5); } }
  if (Fd.st === 'fall' || Fd.st === 'clear') {
    const catchY = F.catchRow * TS, b = carpetBoxOf(F.p2);
    seats.forEach((p, i) => { if (!p || p.dead || p.carpet) return; if (p.vy > FADE.fallV) p.vy = FADE.fallV;
      if (Fd.st !== 'fall') return;
      const rug = R.rugs.get(i) || (R.rugs.set(i, { x: p.x, y: catchY + FADE.rugFrom }), R.rugs.get(i)); rug.x = p.x; rug.y -= FADE.rugV * dt;
      if (p.y >= rug.y - 2 || p.y >= catchY || Fd.t >= FADE.failsafe) { const x = Math.max(b.x0, Math.min(b.x1, p.x)), y = Math.max(b.y0 + 8, Math.min(F.p2.floor - 42, p.y));   /* (over his hall's witchfire: src/sanctum.js fireTop is floor - 26) */
        if (!L.arena.carpet) Object.assign(L.arena, F.p2Arena);   /* the first seat caught: the box is the carpet's (same x, so the lock stays) */
        c.mount(p, x, y); R.rugs.delete(i); if (p === P) c.say(SPIRE_LINES.caught); } });
    if (Fd.st === 'fall' && live(seats).every(p => p.carpet)) { Fd.st = 'done'; R.phase = 'p2'; R.drained = true; }
  }
}
/* every built tile left in the box, top row first (the fade clears them top down) */
function clearRows(F, c) {
  const A = F.A, rows = [];
  for (let y = A.y0; y <= A.y1; y++) { const r = []; for (let x = A.x0; x <= A.x1; x++) if (c.tile(x, y) !== c.T.AIR) r.push([x, y]); if (r.length) rows.push(r); }
  return rows;
}
export const carpetBoxOf = A => ({ x0: A.x0 + 12, x1: A.x1 - 12, y0: A.y0 + 24, y1: A.floor - 4 });   /* carpet.js carpetBox at squeeze 0 (kept here so this file imports nothing heavy) */
/* THE REALM IN PLACE (plan 3.4): through his tear the realm opens round the middle of the same sky - the carpets are drawn in to it while it tears (no pull-cut) */
export function realmDraw(L, e, seats, dt, w = REALM.w) {
  const F = L && L.spireField; if (!F || !e || e.sf !== 'p2' || e.mode !== 'realmTell') return;
  const mid = (L.arena.x0 + L.arena.x1) / 2, lo = mid - w / 2 + 40, hi = mid + w / 2 - 40;
  for (const p of live(seats)) if (p.carpet) { const want = Math.max(lo, Math.min(hi, p.x)); p.x += Math.sign(want - p.x) * Math.min(Math.abs(want - p.x), P2.pullV * dt); }
}

/* THE P1 HP FLOOR (main.js hurtEnemy0 hook): on foot he goes no lower than 50%; at it HE HOLDS - said once, and his 'down' cut short (no gold window does nothing) */
export function floorDmg(L, e, dmg, say) {
  const F = L && L.spireField; if (!F || !e || e.sf === 'p2' || !(dmg > 0)) return dmg;
  const f = hpFloorOf(e), out = Math.max(0, Math.min(dmg, e.hp - f));
  if (e.hp - out <= f) { if (!e.holdSaid) { e.holdSaid = true; if (say) say(SPIRE_LINES.holds); } if (e.mode === 'down') e.modeT = Math.min(e.modeT, P1.heldDown); }
  return out;
}

/* ---------------------------------------------------------------- DRAW (painted by claude/ft5art: src/redraw/ft5_art.js drawField) ---------------------------------------------------------------- */
export function drawSpireField(g, L, cx, cy, time, e, drawRug) {
  const F = L && L.spireField, R = F && F.rt; if (!F || !R) return;
  drawField(g, L, F, R, cx, cy, time, e, drawRug);
}
