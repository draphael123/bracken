// src/owl4.js - THE OWL REEVE 4 / THE HANGING VILLAGE REWORK FLAG and its numbers (claude/owl4, 11-10; plan scratch/lane-reports/owl4-plan.md, brief
// scratch/brief-owl4-1109.md). Pure data + helpers: no imports, so src/level.js, src/main.js, src/hanging-ropes.js and the Node tools can all read it.
//
// OFF (OWL4_SHIPS false, no override) = master exactly: the same level, the same Reeve, the same bag.
// ON:
//   1. THE PERCH FIX: she never rests, lands, grips or lies without a drawn real support (owlRestX keeps every floor landing off THE DROP; owlGrip puts
//      her beak on a drawn rope; perchesFromRopes builds her perches from the rope defs, one source; takeoff + wake are perched modes a cut can drop).
//   2. THE SANDBAGS: the crown's two counterweight bags are optional weapons (a bag that falls or swings onto her while she is LOW: SLAMMED).
//   3. TWO NEW TOLD ATTACKS: SILENT STOOP (both phases) and NET CAST (phase two; ropecut 3 -> 2).
//   4. THE VILLAGE LAMPS (strike to light, cut the cord to drop it: an oil pool) and the SHADOW GOBLIN (hurt only when lit).
//   5. B15: she is never fully invulnerable - under her ward a blow still lands at the 0.4 chip.
// The override for review and the tune lane: ?owl4=1 on the page (?level=hanging&owl4=1, or ?boss=owl&owl4=1), globalThis.BRACKEN_OWL4 = true (tools/cdp.mjs
// sets it from the env BRACKEN_OWL4=1, so boss-rates' reloads keep it), or BRACKEN_OWL4=1 in a Node tool's env.
export const OWL4_SHIPS = false;
export function owl4On() {
  if (OWL4_SHIPS) return true;
  try { if (globalThis.BRACKEN_OWL4 === true || globalThis.BRACKEN_OWL4 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]owl4=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_OWL4 === '1') return true; } catch { /* no node */ }
  return false;
}
const TS = 16;
/* THE NUMBERS (the tune lane owns them: knobs in order SLAMMED duration/mult -> stoop tell/speed -> net time -> bag weights) */
export const OWL4 = {
  floor: 0.4,                 /* B15: a blow under her ward / outside an opening lands at no less than this x */
  restPad: 12,                /* px past a hole's edge where she may stand (>= 8) */
  footDy: 0,                  /* (R5, Q6) rest modes sit at floor - 8 + footDy; the browser walk measures the float, a confirmed 8 px sets this to 8 */
  /* her bag: phase one gains the STOOP, phase two the NET (and the STOOP stays); ropecut 3 -> 2. No move above ~20% of a phase */
  bag: { 1: { swoop: 3, skim: 2, fan: 2, plunge: 2, gust: 2, screech: 1, bough: 2, pellet: 2, stoop: 2 },
         2: { swoop: 3, skim: 2, fan: 1, plunge: 2, gust: 2, screech: 1, bough: 2, lampdrop: 2, pellet: 2, ropecut: 2, stoop: 2, net: 2 } },
  /* A1 SILENT STOOP */
  stoop: { up: 0.5, tell: [1.0, 0.85], lock: 0.3, v: 520, eyeDx: 160, eyeUp: 150, hitW: 16, hitH: 20, open: 1.4, mul: 1.5, dmgK: 1 },
  /* A2 NET CAST (phase two): two bundles hang from the dead bough from the start */
  net: { go: 1.4, tell: [0.9, 0.8], follow: 0.5, w: 72, carryUp: 110, g: 900, netted: 1.4, mash: 0.15, dmg: 8, open: 2.0, mul: 1.6, bundles: [[34, 3], [76, 3]] },
  /* SLAMMED: a sandbag meets her LOW */
  slam: { lie: [2.2, 1.9], mul: 1.6, hp: 0.02, lowNear: 22, bagReach: 18, bagW: 11, hint: 'THE SANDBAG HANGS OVER HER: CUT THE DECK' },
  /* the sandbag swing: any blow on a bag whose deck is up */
  swing: { amp: 72, period: 1.6, swings: 1.5, pull: 0.35, pullPx: 12, knock: 120 },
  /* the crown's west deck knot moves clear of the deck's own boards (the tie reads 24 px from the deck's heart, 32-48 from the bag line, off the vines + the drop) */
  knotMove: { 'cw-crown-w': [47, 19] },
};
/* THE VILLAGE LAMP: struck to light (burns longer than the crown's), its cord cut to DROP it */
export const HV_LAMP = { burn: 8, flick: 1.5, cool: 2.5, r: 64 };
export const LAMP_DROP = { pool: 5, w: 56, tick: 0.7, dmg: 8, rehang: 12, g: 700 };
/* THE SHADOW GOBLIN: a goblin that only a light can hurt */
export const SHADOW = { reveal: 0.6, revealCd: 3, hint: 'BRING IT INTO THE LIGHT', glance: 'IT SLIPS THE BLOW' };
/* THE LEVEL PASS: which floors (ent rows) get village lamps and Shadow Goblins, teach -> test -> exam. A lamp is { x, hang, cord, anchor }: hang null = a floor lamp you strike;
   a number = a lamp hung that many rows up (its ent row) off a gallows arm at row `anchor`, tied off at a red-and-gold knot 3 tiles on - cut it and it falls (src/hanging-ropes.js
   lampcord). No soft-lock: every Shadow Goblin has a re-lightable lamp within 6 tiles on its floor and light on >= 40% of its +-7 tile patrol (tools/owl4-rules.mjs). */
export const HV_LAMPS = {
  mill:  { row: 65, lamps: [{ x: 20, hang: null }], gobs: [24] },                                                   /* TEACH: one beside a lamp you strike (the mill floor) */
  rook:  { row: 51, lamps: [{ x: 48, hang: 50, cord: 'lamp-rook', anchor: 45 }], gobs: [48] },                      /* TEST: one under a hung lamp you strike, then cut onto it (the rookery) */
  stair: { row: 37, lamps: [{ x: 30, hang: null }, { x: 51, hang: null }], gobs: [33, 45] },                        /* EXAM: two, beside the stair's own snuffers (the lantern stair) */
};
export const SIGNS = { weights: 'A SANDBAG ON HER WHILE SHE IS LOW SLAMS HER DOWN. STRIKE ONE, OR CUT A DECK KNOT.' };

/* ---- THE PERCH FIX ---- */
/* the nearest standing board for a floor rest at x: the arena's width, off every hole (L.arena.drops [[x0, x1] tile cols]) by restPad past its edge */
export function owlRestX(A, x, drops, ts = TS, pad = OWL4.restPad) {
  const hs = (drops || (A && A.drops) || []).map(([a, b]) => [a * ts - pad, (b + 1) * ts + pad]);
  let v = Math.max(A.x0 + 14, Math.min(A.x1 - 14, x));
  for (let k = 0; k < 4; k++) { const h = hs.find(([a, b]) => v > a && v < b); if (!h) break; v = (v - h[0] < h[1] - v) ? h[0] : h[1]; v = Math.max(A.x0 + 14, Math.min(A.x1 - 14, v)); }
  return v;
}
export const owlOverDrop = (A, x, drops, ts = TS) => (drops || (A && A.drops) || []).some(([a, b]) => x > a * ts - 2 && x < (b + 1) * ts + 2);
/* her perches, built from the rope defs (one source): the centre of each tied perch plank, k order */
export function perchesFromRopes(lv, ts = TS) {
  const ps = ((lv && lv.ropes) || []).filter(r => r.kind === 'perch').sort((a, b) => a.k - b.k);
  return ps.length ? ps.map(r => ({ x: (r.x0 + r.x1 + 1) * ts / 2, y: r.row * ts, k: r.k, id: r.id, x0: r.x0 * ts, x1: (r.x1 + 1) * ts })) : null;
}
/* where her beak goes on a rope target (src/hanging-ropes.js owlTargets): the nearer of the two drawn ropes of a perch/ledge, a hand's width under the iron eye's
   rope end; a deck's own rope at the live deck. fromX = where she is flying from */
export function owlGrip(t, fromX) {
  if (!t) return null;
  if (t.kind === 'counter') return { x: t.x, y: t.y - 30 };
  const rs = t.rx && t.rx.length ? t.rx : [t.x];
  const x = rs.reduce((a, b) => Math.abs(b - fromX) < Math.abs(a - fromX) ? b : a);
  return { x, y: t.y - 20 };
}

/* ---- THE SANDBAG SWING: x offset (px) of a struck bag t s after the blow, dir = the way the blow sent it; null once it hangs still ---- */
export function bagSwingX(t, dir) {
  const S = OWL4.swing; if (t < 0) return 0;
  if (t < S.pull) return -dir * S.pullPx * Math.sin(Math.PI * t / S.pull);
  const u = t - S.pull; if (u > S.swings * S.period) return null;
  return dir * S.amp * Math.sin(2 * Math.PI * u / S.period);
}

/* ---- THE SHADOW GOBLIN: is a point in any light? lights = [{ x, y, r }] ---- */
export function shadowLit(x, y, lights) {
  for (const l of lights || []) if (l && Math.hypot(x - l.x, y - l.y) < l.r) return true;
  return false;
}
