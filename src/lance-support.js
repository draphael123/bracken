// src/lance-support.js - THE QUEEN'S BOWS, and the two lookouts they come to (docs/briefs/lance-support.md).
//
// Daniel, 2026-09-25: "have occasional archer support since he lacks ranged moves. I'd like some platforms to be available
// to jump on as well." The bridge had five lookouts over its middle piers and none at its ends, where a charge pins you.
// Now the first pier and the last carry one each, built like the others; and every fifteen seconds while he lives, a horn
// goes on a tower and a plain goblin archer drops onto the end lookout nearer you (never the one you are standing on;
// two of his at most). NEARER, not farther: a foe more than 420 px from you is not updated at all (updateEnemies), and a
// bowman at the far end of a 127-tile bridge would stand there frozen, which is no support.
//
// Both halves read the bridge's own first pier, so the held Stormhold rebuild (claude/stormhold, bridge at 544) takes them
// with one call each: lanceLookouts() in the level builder, lanceSupport() from updateLance.

export const LANCE_SUPPORT = {
  first: 12,     // seconds after he wakes before the first call
  every: 15,     // between calls
  retry: 3,      // a call that found both lookouts held (or you on the only free one) tries again this much later
  max: 2,        // of his bowmen up at once
  tell: 1.2,     // the horn and the sparks on the lookout, before the bowman lands (C1)
  quiet: 1.4,    // he looses nothing for this long after he lands (the archer's own draw, 0.55 s told, follows)
  drop: 40,      // px over the lookout he drops from: off the tower roof
};

/* THE END LOOKOUTS. The bridge's piers are 5 tiles wide and 18 apart from P0; the five in the middle have had a lookout
   since the bridge was built (a five-tile one-way deck three rows over the boards, a bridgetower on the pier under it, a
   brazier on it), and every hero's held jump is 3.17 tiles - the same height reaches these. Returns the lookouts as
   [x0, x1, row] in tiles, which the arena carries as `bows`: where his bowmen come to. */
export function lanceLookouts({ plat, ent }, P0, BY, piers = 7) {
  const out = [];
  for (const k of [0, piers - 1]) { const px0 = P0 + k * 18;
    ent('deco', px0 + 2, BY - 1, { kind: 'bridgetower' });
    plat(px0, BY - 3, 5); ent('brazier', px0 + 4, BY - 4);
    out.push([px0, px0 + 4, BY - 3]); }
  return out;
}

/* THE CALL, once a frame from updateLance while he is up. io: { P, TS, lookouts, bows() (his live bowmen), announce(call),
   tellFx(call, dt), arrive(call) }. A call is { x, y (the lookout's top, px), tx, row, t }. */
export function lanceSupport(e, dt, io) {
  const S = LANCE_SUPPORT, TS = io.TS;
  if (!io.lookouts || !io.lookouts.length) return;
  if (e.supportT === undefined) e.supportT = S.first;
  if (e.bowCall) { const c = e.bowCall; c.t -= dt; e.supportT -= dt;   /* the next call's clock runs through the tell: one every 15 s, not every 16.2 */ io.tellFx(c, dt); if (c.t <= 0) { e.bowCall = null; io.arrive(c); } return; }
  e.supportT -= dt; if (e.supportT > 0) return;
  const bows = io.bows(), P = io.P;
  if (bows.length >= S.max) { e.supportT = S.retry; return; }
  const on = ([x0, x1, row]) => P.x > x0 * TS - 10 && P.x < (x1 + 1) * TS + 10 && P.y > row * TS - 48 && P.y <= row * TS + 6;
  const held = ([x0, x1, row]) => bows.some(b => b.x > x0 * TS - 8 && b.x < (x1 + 1) * TS + 8 && Math.abs(b.y - row * TS) < 20);
  const mid = ([x0, x1]) => (x0 + x1 + 1) * TS / 2;
  const free = io.lookouts.filter(lk => !on(lk) && !held(lk)).sort((a, b) => Math.abs(mid(a) - P.x) - Math.abs(mid(b) - P.x));
  if (!free.length) { e.supportT = S.retry; return; }
  const lk = free[0]; e.supportT = S.every;
  e.bowCall = { x: mid(lk), y: lk[2] * TS, tx: (lk[0] + lk[1]) >> 1, row: lk[2], t: S.tell };
  io.announce(e.bowCall);
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
