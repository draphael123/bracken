// src/gq6s3.js - GQ6S3 (Daniel 11-13 17:14, Highcrown pass 6 item 3, slice S3): THE ARENA BURNS AWAY and you CLIMB. One switch, SHIPS OFF (?gq6s3=1 / BRACKEN_GQ6S3=1 / globalThis.BRACKEN_GQ6S3 = true). S3 on implies S2 on (src/gq6s2.js).
// ON, on the tower top (phase 2), three steps driven by HER HEALTH (never by a clock: only reflected stones hurt her, so a timer would punish a slow hero):
//   85 pct  the DECK burns away      -> THE HOARDINGS (tile row 16: the parapet walks joined across the cupola, cols 874-930), ladders at the deck's two ends (cols 873 / 931)
//   70 pct  the hoardings' ends burn -> THE BELL LOFT (tile row 12, cols 888-916), ladders at its two ends (887 / 917), standing on the hoardings' unburnt middle
//   50 pct  the loft burns           -> THE BELL-CAGE ROOF (S2's 12-tile platform, tile row 7), its ladder at the WEST END (col 895) standing on the loft's unburnt foot
// EVERY STEP IS TOLD: 3.0 s of smouldering seams + smoke + the 'crumble' sound + "THE FIRE CLIMBS - GO UP!" and the next tier's ladders glow gold; at the end the span catches ('crack'), she blinks up ("SHE CLIMBS", 0.6 s) and
// HOLDS every attack until each living seat is on the new tier. A burnt span is a PERMANENT fire floor under the bay rule (3 hp / 0.8 s, a push up, spare: it never kills) - no holes, a fall costs time and a little blood, never a death.
// LADDERS sit at the END of a floor, never in it: the top rung is at the floor's own tile row, so there is no hole to walk into and no one-tile gap in the climb (the game's climb drops a hero off a rung with no net at his feet).
// THE LAST RESORT (bots, a hero who will not climb): if nobody is on the new tier 45 s after it was reached, or a seat is still below 60 s into the hold, the tower lifts whoever is below onto the tier (S2's stand-in, longer).
// UNCHANGED: reflected stones are the damage (8 pct a shard, daze after 4), blows chip 0.5x, her bar, the dmgK. On every tier up there her list is S2's (sweep, lash, crown, volley, boulder, rockfall, the rage's Mountain); on the final platform S2's reshapes stand.
// The tier numbers are pure functions of the tower table (TW) so they follow the +96 slide: see tierGeom / spansFor.
export const GQ6S3_SHIPS = false;
export function gq6s3On() {
  try { if (globalThis.BRACKEN_GQ6S3 === false || globalThis.BRACKEN_GQ6S3 === '0') return false; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq6s3=0\b/.test(location.search || '')) return false; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ6S3 === '0') return false; } catch { /* no node */ }
  if (GQ6S3_SHIPS) return true;
  try { if (globalThis.BRACKEN_GQ6S3 === true || globalThis.BRACKEN_GQ6S3 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq6s3=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ6S3 === '1') return true; } catch { /* no node */ }
  return false;
}
export const S3 = gq6s3On();
export const S3N = {
  steps: [0.85, 0.70, 0.50],     // her bar at which tier 0 / 1 / 2 burns away (Daniel: 85 / 70 / 50)
  gapMin: 4,                     // s between two steps (a threshold waits until she is free, like the rage)
  tell: 3.0, climbTell: 0.6,     // s: the told burn (smoulder), and the last stretch of it where she says "SHE CLIMBS"
  liftHold: 60, liftOn: 45,      // s: the last-resort lift (a seat still below at the end of the hold / nobody on the tier after a fall)
  slack: 12, up: 54,             // a hero is 'on' a tier within slack px of its ends (the ladder's top rung stands 8 px outside) and up <= 54 px over its floor (a jump is 51 px); the ladder's own tier is 64 px up
  arriveIn: 120,                 // px in from the end of the hero's side where she lands
  ladRows: { t1: 4, t2: 4, fin: 5 },   // rungs per ladder (the top rung is at the floor row)
  respawnIn: 24,                 // a downed seat comes back this far in from the tier's west end (src/main.js bleedBack, A.respawn)
  words: { burn: 'THE FIRE CLIMBS - GO UP!', climbs: 'SHE CLIMBS', t1: 'THE HOARDINGS', t2: 'THE BELL LOFT', safe: 'THE LADDER FOOT HOLDS' },
  hints: [
    'THE DECK IS BURNING AWAY. CLIMB A LADDER AT EITHER END OF THE DECK UP TO THE HOARDINGS - SHE WAITS FOR YOU THERE.',
    'THE HOARDINGS BURN FROM THE ENDS. CLIMB THE LADDER AT THE UNBURNT MIDDLE UP TO THE BELL LOFT.',
    'THE BELL LOFT BURNS. THE LADDER FOOT IS SAFE: CLIMB UP TO THE BELL-CAGE ROOF AND FINISH HER THERE.' ],
  burnDmg: { fire: 3, every: 0.8, push: 150 },   // the bay rule (GQ3.esc), proved equal in tools/gq6s3.mjs
  maxFireCost: 12,               // hp: the most a slowest-hero walk to the ladder may cost on a span that is burning (4 ticks) - proved
};
/* the tier tables, from the tower's own table (tiles; px = tile * TS). TW = src/gq3-tower.js TW. k = 1 hoardings, 2 bell loft, 3 final (platform: S2's pfGeom columns). */
export function tierGeom(TW, k, TS = 16, fin = null) {
  const D = TW.DECK, P = TW.PARAPETS, deckStand = D.floor - 1;
  if (k === 1) { const row = P.row, c0 = P.w[0], c1 = P.e[1], lads = [c0 - 1, c1 + 1], hoard = [P.w[1] + 1, P.e[0] - 1], lowStand = deckStand;
    return mk(1, row, c0, c1, lads, lowStand, [[c0 + 4, row - 1], [D.x0 + 14, row - 1], [D.x1 - 14, row - 1], [c1 - 4, row - 1]].map((p, i) => ({ id: 't1r' + i, x: p[0], y: p[1], noStorm: true })), { hoard }); }
  if (k === 2) { const t1 = tierGeom(TW, 1, TS), row = 12, c0 = D.x0 + 16, c1 = D.x0 + 44, lads = [c0 - 1, c1 + 1];
    return mk(2, row, c0, c1, lads, t1.row - 1, [[D.x0 + 17, row - 1], [D.x1 - 17, row - 1]].map((p, i) => ({ id: 't2r' + i, x: p[0], y: p[1], noStorm: true })), {}); }
  if (k === 3 && fin) { const t2 = tierGeom(TW, 2, TS); return { ...fin, k: 3, lads: [fin.c0 - 1], ladX: (fin.c0 - 1) * TS + 8, lowStand: t2.row - 1, slack: S3N.slack, up: 70, name: null, hoard: null }; }
  return null;
  function mk(kk, row, c0, c1, ladsC, lowStand, rings, extra) { return { k: kk, row, stand: row - 1, c0, c1, x0: c0 * TS, x1: (c1 + 1) * TS, floor: row * TS, lads: ladsC, ladX: ladsC[0] * TS + 8, lowStand, rings, slack: S3N.slack, up: S3N.up, w: c1 - c0 + 1, name: kk === 1 ? S3N.words.t1 : S3N.words.t2, ...extra }; }
}
/* the span a step sets alight (px) and the floor it is on: step 0 = the deck, 1 = the hoardings' outer ends (the ladder feet at lads[1] / lads[1] stay), 2 = the loft except the final ladder's foot (3 tiles either side) */
export function spansFor(TW, step, TS = 16, fin = null) {
  const D = TW.DECK;
  if (step === 0) return [{ x0: (D.x0 + 1) * TS, x1: D.x1 * TS, y: D.floor * TS, id: 'deck' }];
  const t1 = tierGeom(TW, 1, TS), t2 = tierGeom(TW, 2, TS);
  if (step === 1) { const fw = t2.lads[0], fe = t2.lads[1]; return [{ x0: t1.x0, x1: fw * TS, y: t1.floor, id: 'hoardW' }, { x0: (fe + 1) * TS, x1: t1.x1, y: t1.floor, id: 'hoardE' }]; }
  if (step === 2 && fin) { const lad = fin.c0 - 1; return [{ x0: t2.x0, x1: (lad - 2) * TS, y: t2.floor, id: 'loftW' }, { x0: (lad + 4) * TS, x1: t2.x1, y: t2.floor, id: 'loftE' }]; }
  return [];
}
/* where she lands on a tier: arriveIn px in from the end on the side the hero is on (so the heroes' ladder is behind them and she is in front) */
export const arriveX = (g, hx) => (hx < (g.x0 + g.x1) / 2 ? g.x0 + S3N.arriveIn : g.x1 - S3N.arriveIn);
