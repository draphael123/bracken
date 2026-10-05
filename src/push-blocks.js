// push-blocks.js — PUSHABLE BLOCKS (backlog #12, approved by Daniel 2026-09-28, queued for Highcrown, the Burial
// Caverns, the Monastery and the future pyramids). Built once here so every design lane can place one with a
// single ent('pushblock', x, y) and never touch this file again.
//
// A block is a mover (main.js's `movers` list), the same family as a raft or a lily pad, so it gets the engine's
// existing "stand on top of a mover" landing for free (updatePlayer's mover-landing pass) and resets to its
// placed spot on every death or checkpoint reload for free too (spawnEntities rebuilds every mover from L.ents
// on every attempt, exactly like a plate or a dropcage) - so a block can never be pushed somewhere that
// soft-locks a level; worst case, it goes back where it started.
//
// THE FEEL: heavy and slow. PB.speed is about a third of the hero's own run (RUN 92 in main.js), so pushing one
// reads as work, not a shove. It falls under gravity like anything else with no floor under it, and stops the
// moment its foot row is solid or one-way footing - never mid-air, never through a wall.
//
// THE WALL RULE, both ways: the same tile/AABB test that stops a block short of a wall or another block also
// holds the hero out of the block when it cannot give any further, so nobody can wedge it (or themselves) into
// a wall. A block only moves when a grounded hero is walking INTO the side it can still move away from.
//
// THE PLATE: main.js's own pressure-plate check (search `pr.t === 'plate'`) reads a resting block the same way
// it already reads the hero and a foe - proximity to the plate, nothing block-specific - so a pushed block holds
// a plate down exactly like standing on it would.
const TS = 16;
export const PB = { size: TS, speed: 26 /* ~1/3 of RUN (92): heavy, not a shove */, grav: 1000, fallCap: 300 };

// A fresh block at its placed tile (px, py are the same centre/baseline pixel coords main.js hands every ent).
export function newPushBlock(px, py) {
  const w = PB.size, h = PB.size, x = px - w / 2, y = py - h;
  return { kind: 'pushblock', x, y, x0: x, y0: y, w, h, vx: 0, vy: 0, dx: 0, dy: 0, ground: false, scrapeT: 0 };
}

// True if any tile under the block's foot row (at world-y `y`, spanning its own width) is solid or one-way
// footing. isOneWay never needs a from-above guard here: a block only ever arrives at a tile falling, so it is
// always coming from above.
function footRow(c, left, right, y) {
  const ty = Math.floor(y / TS);
  for (let tx = Math.floor((left + 1) / TS); tx <= Math.floor((right - 1) / TS); tx++)
    if (c.isSolid(tx, ty) || c.isOneWay(c.tileAt(tx, ty))) return true;
  return false;
}
// True if the tile column just past the block's leading edge (in push direction `dir`), at the block's own
// height, is solid - a wall stops it exactly where a wall should.
function wallAhead(c, m, newX, dir) {
  const lead = dir > 0 ? newX + m.w : newX - 1, tx = Math.floor(lead / TS);
  const ty0 = Math.floor((m.y + 1) / TS), ty1 = Math.floor((m.y + m.h - 1) / TS);
  for (let ty = ty0; ty <= ty1; ty++) if (c.isSolid(tx, ty)) return true;
  return false;
}
// True if moving to newX would overlap another block. Never itself.
function blockAhead(c, m, newX) {
  const bb = { l: newX, r: newX + m.w, t: m.y, b: m.y + m.h };
  for (const q of c.blocks) if (q !== m && c.overlap(bb, { l: q.x, r: q.x + q.w, t: q.y, b: q.y + q.h })) return true;
  return false;
}

// c: { players, box, overlap, isSolid, isOneWay, tileAt, blocks, sound, dust }
// box(b) -> {l,r,t,b}; overlap(a,b) -> bool; blocks -> every pushblock this frame (this one included).
export function updatePushBlock(m, dt, c) {
  const oldY = m.y;
  m.dx = 0; m.dy = 0; m.scrapeT = Math.max(0, m.scrapeT - dt);

  // ---- GRAVITY: falls until its own foot row is solid or one-way footing ----
  if (!footRow(c, m.x, m.x + m.w, m.y + m.h + 0.5)) {
    m.ground = false; m.vy = Math.min(PB.fallCap, (m.vy || 0) + PB.grav * dt);
    let ny = m.y + m.vy * dt;
    if (footRow(c, m.x, m.x + m.w, ny + m.h + 0.5)) {
      ny = Math.floor((ny + m.h) / TS) * TS - m.h; m.vy = 0; m.ground = true;
      if (oldY < ny - 2) { c.sound && c.sound('land'); c.dust && c.dust(m.x + m.w / 2, m.y + m.h, 8); }
    }
    m.y = ny;
  } else { m.vy = 0; m.ground = true; }
  m.dy = m.y - oldY;

  // ---- THE HERO'S SIDE OF IT: a grounded hero overlapping a side, walking in, pushes it; otherwise it is
  // simply solid, and the hero is held at its edge (the same test both ways: nobody clips through, nobody
  // wedges it into a wall it cannot pass) ----
  if (!m.ground) return;
  const bb = { l: m.x, r: m.x + m.w, t: m.y, b: m.y + m.h };
  for (const P of (c.players || [])) {
    if (!P || P.dead || P.climb || P.swim) continue;
    const pb = c.box(P);
    if (!(pb.b > bb.t + 3 && pb.t < bb.b - 2)) continue;   // roughly foot-level with the block, not standing on it or clean over it
    if (!c.overlap(pb, bb)) continue;
    const fromLeft = pb.l < bb.l - 0.01;
    const dir = fromLeft ? 1 : -1;
    const walkingIn = P.ground && ((fromLeft && P.vx > 8) || (!fromLeft && P.vx < -8));
    const step = PB.speed * dt;
    if (walkingIn && !wallAhead(c, m, m.x + dir * step, dir) && !blockAhead(c, m, m.x + dir * step)) {
      m.x += dir * step; bb.l = m.x; bb.r = m.x + m.w;
      P.x = fromLeft ? Math.min(P.x + dir * step, bb.l) : Math.max(P.x + dir * step, bb.r); P.vx = dir * PB.speed;   /* carried with it, but never past its edge: faster than the block (any run, even a wade), the hero walked into it a little more each frame until his side passed its edge, and the else below put him out on the FAR side (claude/unburied4) */
      if (m.scrapeT <= 0) { m.scrapeT = 0.3; c.sound && c.sound('scrape'); c.dust && c.dust(fromLeft ? bb.l : bb.r, m.y + m.h - 2, 2); }
    } else {
      // a wall in front, another block, or just leaning on it the wrong way: it does not give
      P.x = fromLeft ? bb.l - P.w / 2 - 0.02 : bb.r + P.w / 2 + 0.02;
    }
  }
}
