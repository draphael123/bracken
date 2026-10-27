// src/lance-support.js - THE QUEEN'S LANCE's numbers, his bridge's lookouts and its gate (claude/stormhold3; the fight is updateLance
// in src/main.js; scratch/brief-stormhold3-1024.md, Daniel's 10-25 appendix).
//
// THE REWORK (Daniel 10-25 live): MOUNTED phase one on a barded charger whose CHARGE splinters the bridge into gaps; the FIRE CAGE
// unhorses him (phase two, on foot with lance and tower shield: the LANCE VAULT and the SHIELD WALL are his own); a SPEAR VOLLEY on
// marked spots; the PENNANT calls the gatehouse's BALLISTA or BOILING OIL (the horn and its archers are the Palisade Wood
// Hornsman's trick now, so they are gone from here); and THE LAST STAND under the main gate's portcullis, which slams when he falls.

/* EVERY NUMBER OF HIS, in one place (tools/lance3.mjs reads them). Seconds, px, px/s, fractions of his health. */
export const LANCE3 = {
  founder: 0.68,      // mounted and never caged: at this much of his health the charger founders and throws him anyway (B13: no waiting room)
  lastStand: 0.33,    // on foot: at this he falls back to the main gate (phase three)
  saddle: 20,         // px the rider sits over the charger's hooves (greybox draw)
  riderScale: 1.2, footScale: 1.35, horseScale: 1.45,   // BIGGER (Daniel 10-25: "a proper Queen's champion"): he was 1.15
  ride: 70, gallop: 236, walk: 46,
  couch: 1.0,         // HE LEVELS IT (!!) before the charge
  chargeEvery: 6.5,
  wheel: 1.5,         // open after a charge, turning the charger at its end (x1.5)
  thrown: 3.0,        // open when a cage (or a gate) puts him on the boards (x1.5)
  founderThrown: 2.0, // ...and when the charger founders under him
  rise: 0.9,
  rearTell: 0.6, rearReach: 44,   // HE REARS (!!): the charger's forehooves, close in
  volley: { tell: 0.75, fall: 1.1, n: [3, 3, 5], spread: 38, hit: 13, stick: 1.4, every: [7, 8, 6] },   // SPEARS (!): a shadow under each, 1.1 s to land
  crack: { tell: 0.75, w: 2, max: 4 },   // a span's middle two planks crack (told) then go - a hop for every hero, standing; at most four gaps on the bridge
  pennant: { tell: 0.8, every: 13, first: 9 },
  ballista: { tell: 1.1, sp: 560, y: 14 },   // its line down the deck at chest height (14 px over the boards): jump it, duck it, or be on a lookout
  oil: { tell: 1.2, burn: 2.4, w: 4 },       // a strip four tiles wide under you: the pour, then it burns
  vault: { tell: 0.6, up: 0.55, perch: 0.55, planted: 1.7, every: 9 },
  wall: { tell: 0.6, t: 3.0, sp: 38, push: 46, every: 10, turned: 1.4 },
  gateClose: 40,      // s the main gate's portcullis takes to come down (it stops at 85% until he falls, then SLAMS)
};

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
  const bars = (y0, y1) => { g.fillStyle = '#2a2a34'; g.fillRect(x - 9, y0, 18, 2); g.fillRect(x - 9, y1 - 2, 18, 2);
    for (let k = -8; k <= 8; k += 4) { g.fillStyle = '#4a4a58'; g.fillRect(x + k - 1, y0, 2, y1 - y0); g.fillStyle = '#8a8a9c'; g.fillRect(x + k - 1, y0, 1, y1 - y0); }
    g.fillStyle = '#c9c9d6'; for (let k = -8; k <= 8; k += 4) g.fillRect(x + k - 1, y1, 2, 2); };   /* the spikes at its foot */
  if (pr.bell) { const bx = Math.round(pr.x - cx), by = Math.round(pr.y - cy), sw = pr.open > 0 ? Math.sin(time * 9) * 3 * Math.min(1, pr.open / 3) : 0;   /* THE HALL BELL: on its rope from the beam, swinging while its grate is down */
    g.fillStyle = '#5a4a3a'; g.fillRect(bx, by - 40, 1, 24); g.fillStyle = '#8a6a2a'; g.fillRect(bx - 5 + Math.round(sw), by - 16, 11, 12); g.fillStyle = '#c9a040'; g.fillRect(bx - 4 + Math.round(sw), by - 16, 3, 11); g.fillRect(bx - 7 + Math.round(sw), by - 5, 15, 3); g.fillStyle = '#3a2a1a'; g.fillRect(bx + Math.round(sw * 1.5), by - 2, 2, 2);
    if (!(pr.open > 0)) { const k = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.3 + 0.4 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(bx, by - 9, 9 + k, 10 + k, 0, 0, 7); g.stroke(); g.globalAlpha = 1; } }
  if (e) { const hy = Math.round(e.y - (e.h || 30) - cy); bars(Math.round(top) - 6, Math.max(Math.round(top), hy)); return; }
  if (pr.open > 0) return;   /* down across the lane: the gate's own tiles draw it */
  bars(Math.round(top) - 10, Math.round(top) - 2);
  const k = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.35 + 0.35 * k; g.fillStyle = '#ffd36b'; g.fillRect(x - 9, Math.round(top) - 1, 18, 1); g.globalAlpha = 1;   /* a glint along its foot: it will come down */
}
