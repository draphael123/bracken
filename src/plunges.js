// src/plunges.js - EIGHT DISTINCT PLUNGES, the four NEW ones (claude/plunges, Daniel 10-11 / 10-14, scratch/brief-plunges.md).
//
// Every hero's plunge owns ONE job and every one still produces the B14 FROM ABOVE key (main.js hurtAs('plunge', ...)), so a keyed boss
// answers all eight, and PLUNGE THE HELM / the plate family stay as they were (a plunge comes over a guard):
//   KNIGHT     POGO        vertical mobility (today)          WARDEN  VAULT      horizontal travel (today)
//   PYRO       FIREDROP    the safe strike from height        DEATH KNIGHT  THE CULL   the area round the landing (today)
//   PALADIN    HAMMER OF DAWN  POISE BREAKER: one heavy slam, big poise damage, a guard broken; holy light = a SAFE landing on spikes and thorns
//   FREEBOOTER BOARDING    CONTROL: lands on a foe's back and RIDES it ~1.5 s, steering it through the knock-into rules, then leaps off
//                          with a second jump. Never a boss, a mini, an elite or a brute: those he just strikes (and pogos off)
//   GEOMANCER  EARTHFALL   TERRAIN: a stone spike rises where she lands - a hit, and a one-tile step for a few seconds that never blocks
//                          a route or a gate and that no reach tool counts as a way
//   BERSERKER  AXE SPIN    SHRED: both axes spun on one target - five quick hits that stack REND fast (the 4th cracks it as a heavy)
// The numbers and the pure rules live here (so tools/plunges.mjs can read them without a page); main.js owns the world and calls them.
import { BRUTES } from './knock-into.js';

export const HAMMER = {
  dmg: 1.15,          // x the plunge's damage: one heavy slam (the knight's pogo is 1.0)
  poise: 34,          // added to the foe's poise bar on top of a plunge's own 12: a light bar (24) always breaks, a heavy one (40) breaks, a mini / boss leans 1.4x
  bossPoise: 1.4,
  eliteMul: 0.6,      // an elite's bar (110) is his opening: the slam is a heavy to it, scaled
  landT: 0.9,         // s after landing that spikes and thorns cannot bite him (the holy light), counted from the landing
  light: 14,          // the Light the slam pays (HAMMERFALL's own gain, kept)
  glow: '#ffe6a0', hot: '#fff6c8',
};
export const BOARD = {
  hitMul: 0.4,        // the landing's own blow: a fraction of a plunge - he wants it alive under him
  t: 1.5,             // s of the ride
  speed: 84,          // px/s the steered foe walks (a common foe's pace, a little over)
  leapVy: -350,       // the SECOND JUMP off it (a base jump is -320, a pogo -330)
  leapVx: 70,
  minHp: 1,
  hurtFree: 0.35,     // s of mercy on the dismount (so a leap off is not into the next blow)
  col: '#bfe6f5', rope: '#c9b27c',
};
export const EARTH = {
  mul: 1.0,           // the spike's blow, x a sword cut
  life: 3.5,          // s the step stands (GEO.life is 4: this one is shorter, it is a step, not a wall), cracking for its last second
  h: 1,               // one tile high
  reach: 44,          // px: a foe this near the landing is where the spike rises; otherwise it rises one tile AHEAD of her
  head: 4,            // tiles of open air that must stand over it: never in a tunnel, a gap or under a ledge it could jam
  gateR: 3,           // tiles: never within this of a gate, a door, a plate, a lever or a way out
  col: '#a8a696', rune: '#e8a83a',
  reachTool: false,   // THE RULE: no reach tool counts this as a way (src/main.js wayBuild reads the base grid; tools/reach-heroes.mjs D)
};
export const SPIN = {
  hits: 5, gap: 0.085, mul: 0.34,   // five quick cuts of a third of a plunge (a plunge itself is the first, FROM ABOVE, and the rest are plain blows)
  rend: 4,            // the fourth stack cracks it (src/berserker.js BZ.rend.n); the spin stacks even out of a frenzy
  end: 0.18,          // s of settle at the end before he rebounds
  hop: -250,          // the rebound off the shredded foe (a pogo is -330: this one is a hop out of it)
  col: ['#ff9a5c', '#c9d1dc'],
};

/* who a boarding may ride: a common foe on its feet. NEVER a boss, a mini, an elite, a big one, a brute, a flyer, a thing that cannot be moved.
   o: { knockSkip: Set, fly: Set } from main.js (KNOCK_SKIP and the flyers) */
export function boardable(e, o = {}) {
  if (!e || !e.alive || e.harmless || e.gone > 0) return false;
  if (e.maxHp || e.mini || e.elite || e.big || e.xpRole || e.turncoat || e.mounted || e.noGrav || e.pinned > 0 || e.ridden) return false;
  if (BRUTES.has(e.t)) return false;
  if (o.fly && o.fly.has(e.t)) return false;
  if (o.knockSkip && o.knockSkip.has(e.t) && !e.trainer) return false;   // (a yard's still goblin is straw inside: it is rideable so the yard can teach it)
  return true;
}
/* which foes a boarding refuses, and why it is told (the word over a boss he plunges instead) */
export const refusal = e => !e ? null : (e.maxHp || e.mini || e.xpRole) ? 'TOO BIG TO RIDE' : (e.elite || e.big || BRUTES.has(e.t)) ? 'TOO HEAVY TO RIDE' : null;

/* THE EARTHFALL SPOT: pure, so a tool can drive it with a grid. q: { x, y, face, anchor?: { x, y } (the foe she landed ON), foes: [{ x, y }], floorRow(tx, fromTy) -> row | null,
   open(tx, ty) -> bool (air with nothing solid), blocked(tx, fy) -> string | null (gate, door, plate...) }. Returns { tx, fy, onFoe } or { why } */
export function earthSpot(q, TS = 16) {
  const hx = Math.floor(q.x / TS), hy = Math.floor((q.y + 1) / TS);
  const cands = [];
  if (q.anchor) {   // she came down ON a head: the step rises BESIDE that foe (never under it, never lifting it), on the side she faces first
    const ax = Math.floor(q.anchor.x / TS), ay = Math.floor((q.anchor.y + 1) / TS);
    cands.push({ tx: ax + q.face, ref: ay, onFoe: false }, { tx: ax - q.face, ref: ay, onFoe: false }, { tx: ax + 2 * q.face, ref: ay, onFoe: false });
  } else {
    const near = (q.foes || []).filter(f => Math.abs(f.x - q.x) <= EARTH.reach && Math.abs(f.y - q.y) <= 28).sort((a, b) => Math.abs(a.x - q.x) - Math.abs(b.x - q.x))[0];
    if (near) cands.push({ tx: Math.floor(near.x / TS), ref: hy, onFoe: true });
    cands.push({ tx: hx + q.face, ref: hy, onFoe: false }, { tx: hx - q.face, ref: hy, onFoe: false }, { tx: hx + 2 * q.face, ref: hy, onFoe: false });
  }
  let why = 'NO ROOM';
  for (const c of cands) {
    if (c.tx === hx && !c.onFoe && !q.anchor) continue;
    const fy = q.floorRow(c.tx, c.ref - 1); if (fy === null || fy === undefined) { why = 'NO FLOOR'; continue; }
    if (Math.abs(fy - c.ref) > 1) { why = 'NO FLOOR'; continue; }
    let roomy = true; for (let k = 1; k <= EARTH.head; k++) if (!q.open(c.tx, fy - k)) { roomy = false; break; }
    if (!roomy) { why = 'NO HEADROOM'; continue; }
    const b = q.blocked ? q.blocked(c.tx, fy) : null; if (b) { why = b; continue; }
    return { tx: c.tx, fy, onFoe: c.onFoe };
  }
  return { why };
}

/* the words these plunges float (main.js adds them to MOVE_WORDS: number() drops any other sentence) */
export const WORDS = ['HAMMER OF DAWN', 'GUARD BROKEN', 'SAFE LANDING', 'BOARDED', 'OFF THE BACK', 'TOO BIG TO RIDE', 'TOO HEAVY TO RIDE', 'EARTHFALL', 'A STEP OF STONE', 'AXE SPIN', 'SHREDDED'];

/* ONE HINT LINE EACH, on the first plunge (lessonHint-style, PROG.lessons.plunge_<hero>): short, true to what the code does */
export const HINT = {
  paladin: 'HAMMER OF DAWN: THE SLAM BREAKS A GUARD AND RATTLES THE BIGGEST POISE. ITS LIGHT KEEPS THE SPIKES OFF YOU WHERE YOU LAND.',
  pirate: 'BOARDING: LAND ON A SMALL FOE AND RIDE IT. STEER IT INTO SPIKES, A DROP OR WATER. JUMP TO LEAP OFF.',
  geomancer: 'EARTHFALL: A STONE SPIKE RISES WHERE YOU LAND AND HITS. IT STANDS A FEW SECONDS AS A STEP.',
  berserker: 'AXE SPIN: LAND ON A FOE AND THE AXES SHRED IT. EVERY CUT STACKS REND: THE FOURTH CRACKS IT.',
};
/* the controls card / moves list row: [label, what it is for] per hero (src/controls.js cardRows reads the label) */
export const ROW = {
  paladin: ['dawn hammer', 'HAMMER OF DAWN: ONE HEAVY SLAM THAT BREAKS A GUARD AND POISE'],
  pirate: ['boarding', 'BOARDING: RIDE A SMALL FOE AND STEER IT INTO A HAZARD'],
  geomancer: ['earthfall', 'EARTHFALL: A STONE SPIKE THAT HITS AND STANDS AS A STEP'],
  berserker: ['axe spin', 'AXE SPIN: SHRED ONE FOE, STACKING REND'],
};
export const NEW_PLUNGE = new Set(Object.keys(ROW));
