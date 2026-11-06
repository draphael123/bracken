// src/gorge-falls.js - RED GORGE 3, THE MATRIARCH'S NEW ARENA: THE THREE FALLS (claude/redgorge3, 11-06, the OPUS GREYBOX; brief scratch/brief-redgorge3-1014.md,
// plan scratch/plan-desert-1105.md s1.4 "AT THE HORN THE FLOOD COMES" - Daniel approved 11-05 14:07). Pure data + the flag + the falls' water: no imports, so
// src/raptor-matriarch.js and src/red-gorge.js both read it without a cycle.
//
// OFF (RG3_SHIPS false, no override) = master exactly: RG2's 40-wide nest ledge, the lever stun (a wave down the channel), the two standpipe baskets, the bridges.
// ON (Daniel 10-14: "the ring needs to be different"; "a little clunky"):
//   * A WIDER CANYON FLOOR (48 columns) with THREE WATERFALLS. Each is dammed at the canyon's lip by its own SLUICE, and each sluice has ITS OWN LEVER, spread out:
//     A = LOW (down on the channel floor by the west bank), B = ON A LEDGE (a rock shelf over the west broad pillar), C = ACROSS THE FLOOR (on the east bank).
//   * TWO VERBS: KITE + PULL. Lure her under a fall (she pounces where you stand, she stalks you, she skids after a whiff), pull THAT fall's lever: a told TRICKLE
//     (F3.trickleT), then the fall CRASHES down (F3.pourT): caught under it on the ground she is STUNNED, knocked down, OPEN (the gold ring + timer, B10; her ward
//     after, B3 - at x0.4 here, never nothing). In the air (her leap) the water misses her. A hero under a pour takes a blow too (told by the trickle).
//   * SHE LEARNS: the fall that just stunned her is the one she SHIES from (she will not walk into it, her pounce lands beside it - said); use another.
//   * EACH SLUICE REFILLS on its own TOLD clock (F3.refillT, a gauge at its lip). P1's old lure, the horn's leap and her screech are trimmed (the fight is the two verbs).
//   * PHASE TWO: ONE STANDPIPE BASKET under the centre fall - pull ANY full lever and its water runs into the pipe: the basket rises (eased: one smooth ride) to her
//     wall; a blow from it knocks her off, STUNNED (RG2's verb, kept). The rope bridges and the perch are trimmed.
//   * PHASE THREE: the dam cracks as in RG2 (all three falls run, the floor floods, the pillar tops); the sluices are drowned.
// The override for review and the tune lane: ?rg3=1 on the page, globalThis.BRACKEN_RG3 = true, or BRACKEN_RG3=1 in a Node tool's env.
export const RG3_SHIPS = false;
export function rg3On() {
  if (RG3_SHIPS) return true;
  try { if (globalThis.BRACKEN_RG3 === true || globalThis.BRACKEN_RG3 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]rg3=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_RG3 === '1') return true; } catch { /* no node */ }
  return false;
}

/* THE ARENA (local columns 0..47; R = the bed row, top = the pillar tops' row, as RG2's STAGE: every top is two rows over the channel floor).
   tops: W bank | gap 4-11 (FALL A, lever A on its floor) | N1 | gap | B1 (LEDGE over it: lever B) | gap 22-25 (FALL B, THE STANDPIPE BASKET) | B2 | gap | N2 |
   gap 36-43 (FALL C) | E bank (lever C). A fall's column is c +- F3.hw px (c = its centre column); every fall stands over the channel floor, never a top */
export const STAGE3 = { W: 48, R: 24, top: 22, door: 6, wallRow: 9, bridgeRow: 13, v3: true,
  tops: [{ id: 'W', x0: 0, x1: 3, kind: 'bank' }, { id: 'N1', x0: 12, x1: 13, kind: 'narrow' }, { id: 'B1', x0: 18, x1: 21, kind: 'broad' },
    { id: 'B2', x0: 26, x1: 29, kind: 'broad' }, { id: 'N2', x0: 34, x1: 35, kind: 'narrow' }, { id: 'E', x0: 44, x1: 47, kind: 'bank' }],
  falls: [{ id: 'A', c: 8, lever: 'A' }, { id: 'B', c: 24, lever: 'B' }, { id: 'C', c: 40, lever: 'C' }],
  /* where: 'floor' = the channel floor (row R-1), 'top' = a top (row top-1), a number = the surface row of a ledge (you stand on it at that row's top) */
  levers: [{ id: 'A', x: 4, where: 'floor', say: 'LOW' }, { id: 'B', x: 20, where: 19, say: 'ON THE LEDGE' }, { id: 'C', x: 44, where: 'top', say: 'ACROSS THE FLOOR' }],
  ledges: [{ x0: 18, x1: 21, row: 19 }],   /* one-way rock shelf (theme: a sandstone lip, never wood): a plain three-row jump up off B1 */
  bridges: [],                             /* (trimmed: the perch and its posts were RG2's third verb) */
  planks: [6, 41],                         /* the dam's loose timbers in the two wide reaches (phase three's stepping stones, as RG2) */
  baskets: [{ id: 'P', x0: 23, lever: '*' }],   /* ONE STANDPIPE BASKET, under the centre fall: any lever's water fills its pipe */
  start: 45 };
export const F3 = {
  hw: 24,          /* a fall's half-width, px (three tiles of white water) */
  underIn: 12,     /* she is UNDER a fall when her body overlaps its column by this much (px) */
  trickleT: 0.5,   /* the TELL: the sluice creaks open, a thin trickle runs down the fall's line (heroes: get out from under) */
  pourT: 1.1,      /* the CRASH: the fall runs this long; caught under it on the ground she is stunned */
  refillT: 7.0,    /* each sluice refills on its own told clock (the gauge at its lip) */
  heroDmg: 10,     /* a hero under a pour: one blow a pour (unblockable, no knock) */
  ease: true,      /* phase two: the basket's ride is eased (smoothstep), one smooth set piece */
};
export const SAY3 = { stun: 'THE FALL STUNS HER: STRIKE', air: 'SHE IS IN THE AIR: THE FALL MISSES HER', warded: 'HER WARD: SHE SHRUGS OFF THE WATER',
  rule: 'KITE HER UNDER A FALL, THEN PULL THAT FALL\'S LEVER', under: 'SHE IS UNDER THE FALL: PULL ITS LEVER (E)', shy: 'SHE KNOWS THAT FALL: KITE HER UNDER ANOTHER',
  hold: 'SHE WILL NOT BREAK: STUN HER UNDER A FALL', empty: 'THE SLUICE IS REFILLING: WATCH ITS GAUGE', open: 'THE SLUICE OPENS: THE FALL COMES',
  walls: 'ON THE WALLS: ANY LEVER FILLS THE STANDPIPE - RIDE THE BASKET UP', press: 'THE STANDPIPE FILLS: RIDE THE BASKET UP', full: 'FULL', drowned: 'THE DAM IS CRACKED: THE SLUICES ARE DROWNED' };
/* phase one's passes (THE LURE and THE SCREECH trimmed: she stalks and pounces at you, which is what the kite uses). B17: four told attacks (+ RG2's follow-up) */
export const CYCLES3_P1 = [['pounce', 'rake', 'sweep', 'pounce', 'scree'], ['rake', 'pounce', 'scree', 'pounce', 'sweep'], ['pounce', 'sweep', 'rake', 'pounce', 'scree'], ['scree', 'pounce', 'rake', 'pounce', 'sweep']];
export const CYCLES3_P2 = [['run', 'dive', 'run', 'dive'], ['run', 'brood', 'run', 'dive', 'run', 'volley'], ['run', 'volley', 'run', 'dive', 'run', 'brood']];   /* (no perch: no bridges) */

/* ---------- THE FALLS' WATER (pure; S = the fight, G = its geometry from src/raptor-matriarch.js geom) ---------- */
/* G.falls: [{ id, cx, l, r, lever }] (px). S.falls: { [id]: { st: 'full'|'trickle'|'pour'|'refill', t, fill, pid } } */
export const newFalls = G => Object.fromEntries(G.falls.map(f => [f.id, { st: 'full', t: 0, fill: 1, pid: 0 }]));
export const fallFull = (S, id) => !!(S.falls && S.falls[id] && S.falls[id].st === 'full');
/* the fall whose column a body [x - half, x + half] is UNDER (overlap >= F3.underIn), or null. f: filter */
export function fallOver(G, x, half, f) { for (const q of G.falls) { if (f && !f(q)) continue; const ov = Math.min(x + half, q.r) - Math.max(x - half, q.l); if (ov >= Math.min(F3.underIn, half)) return q; } return null; }
/* a pouring fall over this body, or null */
export const pourOver = (S, x, half) => fallOver(S.G, x, half, q => S.falls[q.id].st === 'pour');
/* E AT A LEVER. ph 1: 'released' | 'empty' (refilling) | 'busy' (its fall runs). ph 2: any full lever fills THE STANDPIPE: 'pressed' | 'busy' | 'empty'. ph 3: 'drowned' */
export function pullFall(S, id) { const F = S.falls && S.falls[id]; if (!F) return 'empty';
  if (S.ph === 3) return 'drowned';
  if (S.ph === 2) { const B = S.press.P; if (!B) return 'empty'; if (B.charge > 0) return 'busy'; if (F.st !== 'full') return 'empty'; F.st = 'refill'; F.fill = 0; F.t = 0; F.toPipe = 1; B.charge = S.pressT || 8; S.n.presses = (S.n.presses || 0) + 1; return 'pressed'; }
  if (F.st === 'trickle' || F.st === 'pour') return 'busy'; if (F.st !== 'full') return 'empty';
  F.st = 'trickle'; F.t = F3.trickleT; F.toPipe = 0; S.n.releases++; S.n.pulls = S.n.pulls || {}; S.n.pulls[id] = (S.n.pulls[id] || 0) + 1; return 'released'; }
/* one frame of the three sluices: trickle -> pour -> refill -> full. c: { sound, shake, fx, number } */
export function stepFalls(S, dt, c) { const G = S.G;
  for (const q of G.falls) { const F = S.falls[q.id];
    if (S.ph === 3) { F.st = 'flood'; F.fill = 1; continue; }   /* THE DAM CRACKS: all three run (drawn), nothing to pull */
    if (F.st === 'trickle') { F.t -= dt; if (F.t <= 0) { F.st = 'pour'; F.t = F3.pourT; F.pid = ++S.pourN; c.sound('burst'); c.shake(4); c.fx('burst', q.cx, G.floorY); } }
    else if (F.st === 'pour') { F.t -= dt; if (F.t <= 0) { F.st = 'refill'; F.fill = 0; F.t = 0; } }
    else if (F.st === 'refill') { F.fill = Math.min(1, F.fill + dt / F3.refillT); if (F.fill >= 1) { F.st = 'full'; F.toPipe = 0; if (c.number) c.number(q.cx, G.topY - 120, 'SLUICE ' + q.id + ': ' + SAY3.full, '#7ab8e8'); } }
  } }
/* SHE SHIES from the fall that just stunned her (S.shy): a landing x under it moves to its nearer edge, clear of it (half = her half-width) */
export function shyShift(G, S, x, half) { if (!S.shy) return x; const q = G.falls.find(f => f.id === S.shy); if (!q || !fallOver(G, x, half, f => f === q)) return x;
  const k = Math.min(F3.underIn, half) - 3, lx = q.l - half + k, rx = q.r + half - k; return Math.abs(x - lx) <= Math.abs(x - rx) ? lx : rx; }
/* THE STANDPIPE's ride, eased: h 0..1 -> the share of the climb (smoothstep) */
export const easeRide = h => (F3.ease ? h * h * (3 - 2 * h) : h);
