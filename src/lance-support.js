// src/lance-support.js - THE QUEEN'S LANCE's numbers, his bridge's lookouts, its gate towers and their bells, the signal ropes and the
// main gate's great bell (claude/lance4; the fight is updateLance in src/main.js; scratch/brief-lance4-1029.md, Daniel 10-29 20:04: all recs).
//
// LANCE 4 (Daniel 10-29: "it doesn't really incorporate level mechanics, whether it's bells, gates, or zip lines ... remove the horse"):
//   ON FOOT from the first frame (the horse, its barding, rear, wheel and founder are gone). TEMPO CLASSES: LIGHT (the thrust), MEDIUM
//   (the low sweep, the shield wall, the spear volley), HEAVY (the lance charge, the lance vault) - each class its own sound and stamp, no
//   two heavies back to back, guard after every heavy. The shield bash is cut. The fire cages leave the bridge (Q3).
//   P1 THE BELLS AND THE GATES: three GATE TOWERS (piers 1, 3, 5), each with an ALARM BELL on its lookout and a portcullis under it. Ring
//      one: three tolls, and HE ANSWERS THE BELL - his next move is a lance charge at that tower. The third toll drops the gate: on him,
//      PINNED; ahead of him, a gate across his lane he runs into (OVERRUN). A bell winds back in 10 s.
//   P2 THE ZIP LINES: he hauls the bells up. Three SIGNAL ROPES (tower 1 -> pier 2, 3 -> 4, 5 -> 6) ride over his head: drop off one and
//      plunge onto his helm (HELM RUNG), or strike a rope's deck post while he stands under its run - it frays, parts and WHIPS down on
//      him (WHIPPED). Re-strung in 14 s. His charge tears planks from here on; the vault and the shield wall join.
//   P3 THE MAIN GATE: he falls back under the main gate as it comes down. Its bars SPLIT his tower shield (or he casts it off): two-handed,
//      faster, x0.7 everywhere. THE GREAT BELL on the gatehouse hoarding drops the portcullis on him at once (PINNED, x2). The pennant
//      adds THE STONES (the castle's mangonel: told rings on the deck).

/* EVERY NUMBER OF HIS, in one place (tools/lance4.mjs reads them). Seconds, px, px/s, fractions of his health. */
export const LANCE4 = {
  p2: 0.67, p3: 0.33,  // the phases: at 67% he stops the bells (the ropes), at 33% he falls back to the main gate
  walk: 46, sprint: 236,
  heavyGap: 0.8,       // s of guard after every HEAVY (and never two heavies back to back)
  thrust: { tell: 0.40, tell3: 0.35, active: 0.15, rec: 0.5, whiff: 0.75, reach: 96, every: 3 },   // LIGHT
  sweep: { tell: 0.60, active: 0.3, rec: 0.7, reach: 36, every: 3.4 },                              // MEDIUM, jumped
  couch: 1.0, chargeEvery: 6.5, overrun: 1.5,   // HEAVY: couched, a sprint, and a whiff or a gate ends it OVERRUN (the point in the boards)
  volley: { tell: 0.85, fall: 1.1, n: [3, 3, 5], spread: 38, hit: 13, stick: 1.4, every: [7, 8, 6] },   // MEDIUM: a shadow under each spear
  crack: { tell: 0.75, w: 2, max: 4 },          // from P2 his charge tears planks: told, a jump for every hero, at most four gaps
  pennant: { tell: 0.8, every: 13, first: 9 },
  ballista: { tell: 1.1, sp: 560, y: 14 },
  oil: { tell: 1.2, burn: 2.4, w: 4 },
  stones: { tell: 1.2, n: 3, spread: 46, hit: 14, w: 2 },   // P3: the castle's mangonel - three told rings on the deck; each breaks the planks it lands on
  vault: { tell: 0.95, up: 0.55, perch: 0.7, planted: 1.7, every: 9 },      // HEAVY (P2+)
  wall: { tell: 0.6, t: 3.0, sp: 38, push: 46, every: 10, turned: 1.4 },    // MEDIUM (P2 only: P3 has no shield)
  bell: { tolls: 3, span: 1.2, rewind: 10, hold: 3.0, pin: 3.4, mul: 1.6, dmg: 40, catchX: 16 },   // a gate tower's bell and its portcullis
  great: { pin: 4.0, mul: 2, dmg: 60, rewind: 12 },                         // the main gate's great bell (P3)
  rung: 2.2, rungEvery: 6,       // HELM RUNG: dazed (x1.5); not twice inside rungEvery s
  whipped: 1.6, whipHurt: 6, fray: 0.5, restring: 14,   // CUT THE LINE: the fray, the whip (x1.5), the crew's re-stringing
  haul: 1.2,                     // HE STOPS THE BELLS (P2's turn): braced, not an opening
  split: 1.0, castOff: 8, bare: 0.7,   // THE SHIELD SPLIT (x1.5 while it goes), or cast off this long into P3; shieldless he takes x0.7 from anywhere
  open: { overrun: 1.5, rung: 1.5, whipped: 1.5, wallTurned: 1.5, recover: 1.5, reel: 1.5, stumble: 1.5, planted: 1.6, split: 1.5 },   // his openings (B15: 1.5-2x; pinned reads its bell)
  heroDmg: { knight: 1.15, warden: 1.05, pyro: 0.65 },   // (claude/lance4tune) a hero's blows against him, x (knight takes the reach, pyro stands off)
  gateClose: 40,                 // s the main gate takes to come down in P3 (it stops at 85% until he falls, then SLAMS)
};
export const HEAVY_MODES = new Set(['couch', 'vaultTell']);   // the moves of the HEAVY class (tempo rule: never two back to back)

/* WHAT HE SAYS (number() routes these: the short ones float as MOVE_WORDS, the teaching ones go to the hint box - src/hint-lines.js) */
export const LANCE_WORD = { charges: 'HE CHARGES', spears: 'SPEARS', wall: 'SHIELD WALL', vaults: 'HE VAULTS', pennant: 'THE PENNANT', ballista: 'BALLISTA', oil: 'BOILING OIL', stones: 'STONES' };
export const LANCE_SAY = {
  answer: 'HE ANSWERS THE BELL', overrun: 'HE OVERRUNS: CUT HIM', gate: 'THE GATE HAS HIM: CUT HIM', intoGate: 'HE RUNS INTO THE GATE: CUT HIM',
  stops: 'HE STOPS THE BELLS', rung: 'HELM RUNG: CUT HIM', whipped: 'THE LINE WHIPS DOWN ON HIM: CUT HIM', frays: 'THE LINE FRAYS',
  split: 'THE BARS SPLIT HIS SHIELD', castOff: 'HE CASTS THE SHIELD OFF', great: 'THE GREAT BELL: THE GATE HAS HIM', point: 'THE POINT STICKS: CUT HIM',
  turned: 'THE WALL IS TURNED: CUT HIM', fallback: 'HE FALLS BACK TO THE GATE', portcullis: 'THE PORTCULLIS IS COMING DOWN',
  slam: 'THE MAIN GATE SLAMS SHUT', round: 'ROUND BY THE SUPPLY CARTS', climbs: 'HE CLIMBS BACK', planks: 'THE PLANKS GO', parried: 'PARRIED',
  tip: 'HIS SHIELD FACES YOU. GET ROUND HIM OR COME DOWN ON HIM - AND RING A TOWER BELL: HE ANSWERS IT.',
  tip2: 'RIDE A SIGNAL ROPE OVER HIM AND DROP ON HIS HELM - OR STRIKE A ROPE POST WHILE HE IS UNDER ITS LINE.',
  tip3: 'RING THE GREAT BELL ON THE GATEHOUSE WHILE HE STANDS UNDER THE MAIN GATE.',
};

/* A TOWER BELL (or the great bell), pure: strike it and it tolls `tolls` times over `span` s; the last toll is the drop. It cannot be rung
   again until it has wound back (rewind s); hauled up (pr.up) it cannot be reached. Returns true if the strike rang it. */
export function bellStrike(pr, X = LANCE4) {
  if (pr.up || pr.rewind > 0 || pr.ringT >= 0) return false;
  pr.ringT = 0; pr.tolled = 0; pr.rewind = pr.great ? X.great.rewind : X.bell.rewind; pr.rewind0 = pr.rewind; return true;
}
/* one frame of a bell: its rings fade, its rewind runs; returns the tolls this frame ('toll' / 'drop') */
export function bellStep(pr, dt, X = LANCE4) {
  const out = []; if (pr.ringT === undefined) pr.ringT = -1;
  if (pr.rewind > 0) pr.rewind = Math.max(0, pr.rewind - dt);
  pr.rings = (pr.rings || []).filter(r => (r.t += dt) < 0.8);
  if (pr.ringT >= 0) { pr.ringT += dt; const n = pr.great ? 1 : X.bell.tolls, gap = n > 1 ? X.bell.span / (n - 1) : 0;
    while (pr.tolled < n && pr.ringT >= pr.tolled * gap) { pr.tolled++; pr.rings.push({ t: 0 }); out.push(pr.tolled === n ? 'drop' : 'toll'); }
    if (pr.tolled >= n) pr.ringT = -1; }
  return out;
}
/* is he under its gate? (the bars find whoever stands in the column: feet on the deck, within catchX + half his body) */
export const bellHas = (e, pr, TS, X = LANCE4) => !!e && e.alive && Math.abs(e.x - pr.gx) < X.bell.catchX + (e.w || 26) / 2 && e.y > pr.gy0 * TS && e.grounded !== false;

/* A SIGNAL ROPE'S CUT (pure, on a zipline entry): struck at its post it frays for `fray` s, then PARTS - it hangs slack (cut s) until the
   tower crew has it strung again. ropeFray starts it (false if it is already going or gone); ropeTick returns 'parted' on the frame it goes. */
export function ropeFray(z, X = LANCE4) { if (z.fray > 0 || z.cut > 0) return false; z.fray = X.fray; return true; }
export function ropeTick(z, dt, X = LANCE4) {
  if (z.whip > 0) z.whip = Math.max(0, z.whip - dt);
  if (z.cut > 0) { z.cut = Math.max(0, z.cut - dt); return null; }
  if (z.fray > 0) { z.fray -= dt; if (z.fray <= 0) { z.fray = 0; z.cut = X.restring; z.cut0 = X.restring; z.whip = 0.6; return 'parted'; } }
  return null;
}
/* is he under its run? (between its two ends, on his feet) */
export const underRope = (e, z) => !!e && e.x > Math.min(z.x0, z.x1) - 6 && e.x < Math.max(z.x0, z.x1) + 6;

/* THE BELL, THE TOWER'S PORTCULLIS AND THE SIGNAL ROPES' POSTS, DRAWN: src/stormhold-art.js (claude/lance4art) */
import * as SHA from './stormhold-art.js';
export const drawLanceBell = SHA.drawLanceBell, drawBellGate = SHA.drawBellGate, drawRopeCut = SHA.drawRopeCut;

/* THE END LOOKOUTS. The bridge's piers are 5 tiles wide and 18 apart from P0; the five in the middle have had a lookout since the
   bridge was built (a five-tile one-way deck three rows over the boards, a bridgetower on the pier under it, a brazier on it), and
   every hero's held jump is 3.17 tiles - the same height reaches these. The first pier and the last carry one each, built like the
   others: with them every pier has one - the perches his LANCE VAULT goes up onto, and where the ballista's bolt cannot reach you.
   Returns the two as [x0, x1, row] in tiles. */
export function lanceLookouts({ plat, ent }, P0, BY, piers = 7) {
  const out = [];
  for (const k of [0, piers - 1]) { const px0 = P0 + k * 18;
    ent('deco', px0 + 2, BY - 1, { kind: 'bridgetower' });
    plat(px0, BY - 3, 5); ent('brazier', px0 + 4, BY - 4);
    out.push([px0, px0 + 4, BY - 3]); }
  return out;
}

/* THE BRIDGE GATE (claude/bosswave2, Daniel 10-03 from scratch/audit-rules.md: "the Lance ignores his level's rule" - STORMHOLD is
   THREE GATES). A portcullis hangs under the first tower lookout on its own winch, built as the Keep Gate's (a 'winch' with drop, and
   bossGate). From the lookout - where his charge cannot reach you - strike the winch as he runs under it, and the gate comes down
   on HIM: pinned under the bars, the lance useless, open (main.js lanceOpen 'planted', x1.6) for LANCE_GATE.pin s, and the iron's
   own blow lands whole (it is the room's, not the chip's). Struck early or late it is only a gate across his lane: he runs into it
   on its far side (his old 'into the wall'), and it winds back up after the winch's hold. */
export const LANCE_GATE = {
  pin: 3.4,      // s pinned under it (an opening of 3 s or more: tools/boss-openings.mjs)
  dmg: 40,       // the bars' own blow (a fire cage's is 60: the gate is the cheaper, repeatable one)
  catchX: 12,    // px either side of the gate's column, plus half his body, that the bars find him in
  hold: 7,       // s the winch takes to wind it back up after he throws it off
};
/* is he under it? (the bars come down on whatever stands in the column: his feet below the gate's top row) */
/* (and THE GOBLIN QUEEN's hall grate, the same prop with a bell for its winch: HIGHCROWN's rule, EVERY HALL HAS A BELL AND A GATE THAT DROPS WITH IT) */
export const gateHas = (e, pr, TS) => !!e && e.alive && (e.t === 'lance' || e.t === 'gqueen') && Math.abs(e.x - (pr.gate * TS + 8)) < LANCE_GATE.catchX + (e.w || 20) / 2 && e.y > pr.gy0 * TS;
/* THE CATCH. io: { TS, hurt(e, dmg, x), say(e, txt), fx() }. The gate rests on him (pr.pinned): no tiles close in his column while he is under it */
export function gateCatch(e, pr, io) {
  pr.pinned = e; pr.pinMode = 'planted'; pr.open = LANCE_GATE.pin + 0.5;
  e.mode = 'planted'; e.modeT = LANCE_GATE.pin; e.stagger = LANCE_GATE.pin; e.vx = 0; e.gated = (e.gated || 0) + 1;
  io.say(e, 'THE GATE HAS HIM: CUT HIM'); io.fx(); io.hurt(e, LANCE_GATE.dmg, pr.gate * io.TS + 8);
}
/* every frame for the gate's winch: he threw it off (his pin over, or he fell) - it goes back up on the winch, which needs its hold to rewind */
export function gateStep(pr) { if (pr.pinned && (!pr.pinned.alive || pr.pinned.mode !== (pr.pinMode || 'planted'))) { pr.pinned = null; pr.open = LANCE_GATE.hold; } }
/* THE GATE, DRAWN: up, its teeth show under the lookout (so you can see it is there to drop); down on him, the bars rest on his helm */
export function drawLanceGate(g, pr, cx, cy, TS, time) {
  const x = Math.round(pr.gate * TS + 8 - cx), top = pr.gy0 * TS - cy, e = pr.pinned;
  const bars = (y0, y1) => SHA.drawPortcullis(g, x, y0, y1);   /* (src/stormhold-art.js) */
  if (pr.bell) { const bx = Math.round(pr.x - cx), by = Math.round(pr.y - cy), sw = pr.open > 0 ? Math.sin(time * 9) * 3 * Math.min(1, pr.open / 3) : 0;   /* THE HALL BELL: on its rope from the beam, swinging while its grate is down */
    g.fillStyle = '#5a4a3a'; g.fillRect(bx, by - 40, 1, 24); g.fillStyle = '#8a6a2a'; g.fillRect(bx - 5 + Math.round(sw), by - 16, 11, 12); g.fillStyle = '#c9a040'; g.fillRect(bx - 4 + Math.round(sw), by - 16, 3, 11); g.fillRect(bx - 7 + Math.round(sw), by - 5, 15, 3); g.fillStyle = '#3a2a1a'; g.fillRect(bx + Math.round(sw * 1.5), by - 2, 2, 2);
    if (!(pr.open > 0)) { const k = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.3 + 0.4 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(bx, by - 9, 9 + k, 10 + k, 0, 0, 7); g.stroke(); g.globalAlpha = 1; } }
  if (e) { const hy = Math.round(e.y - (e.h || 30) - cy); bars(Math.round(top) - 6, Math.max(Math.round(top), hy)); return; }
  if (pr.open > 0) return;   /* down across the lane: the gate's own tiles draw it */
  bars(Math.round(top) - 10, Math.round(top) - 2);
  const k = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.35 + 0.35 * k; g.fillStyle = '#ffd36b'; g.fillRect(x - 9, Math.round(top) - 1, 18, 1); g.globalAlpha = 1;   /* a glint along its foot: it will come down */
}
