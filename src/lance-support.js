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
