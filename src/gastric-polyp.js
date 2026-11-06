// src/gastric-polyp.js - THE GASTRIC POLYP, THE WHALE's one new foe (claude/whale, the greybox, 2026-11-06; brief-whale-1025 FOES "ONE NEW FOE: THE GASTRIC POLYP",
// plan-water-1105 item 9 / Q5 rec "Gastric Polyp is the one new foe"). PURE: no DOM, no main.js - src/whale-hands.js binds it to the world and draws it (GREYBOX).
// A stalk rooted in the whale's flesh - the level's RANGED foe. ITS ONE THING: THE BREATH DECIDES WHEN IT CAN BE HIT.
//   ON THE EXHALE it SWELLS OUT of the flesh (told: GP.swell s of it bulging up, the flesh around it reddening) and stands out, spitting.
//   ON THE INHALE it SHRINKS back INTO THE FLESH (a knot on the floor, eyes shut): it spits nothing, and a blow finds only flesh (x GP.inK, the word 'IN THE FLESH').
//   So a player who calls the exhale with a nerve calls the polyp out too - and one who calls the inhale shuts it away to pass it.
// ONE TOLD MOVE (! = a guard answers it): THE BILE SPIT - it rears back, cheeks swelling (GP.spit.tell s), then spits a glob in a high arc at where you stand;
//   a guard takes it, a step aside dodges it. It splashes and is gone (no pool: the level's bile is breath, not damage).
export const GP = {
  hp: 30, w: 12, h: 20, hIn: 6, markH: 30, see: 170, seeY: 100,
  swell: 0.45, shrink: 0.35, outK: 0.35,
  spit: { tell: 0.7, flight: 0.9, g: 640, r: 12, dmg: 12, rec: 0.6, cd: 2.2 },
  inK: 0.3,
};
export const GP_SAY = { flesh: 'IN THE FLESH', out: 'IT SWELLS OUT' };
export const GP_TELLS = { spitTell: { mark: '!', answer: 'block' } };
/* is it OUT of the flesh by the breath now? (the hands pass the breath: k 0 drained .. 1 flooded, ph = the kit phase) */
export const gpOutBy = (k, ph) => ph === 'warn' || ph === 'rise' || ph === 'high' || (ph !== 'fall' && k >= GP.outK);
export const gpIn = e => e.mode === 'in' || e.mode === 'shrink';

export function spawnPolyp(base, ent, hp) {
  return { ...base, t: 'gastricpolyp', w: GP.w, h: GP.hIn, hp: hp || GP.hp, face: ent.face || -1, mode: 'in', modeT: 0, cd: 0.8 + Math.random() * 0.8, noGrav: true, anchored: true, noPull: true, vx: 0, vy: 0, globs: [], n: 0 };
}
/* a blow on it: whole when it is out, x GP.inK in the flesh (never nothing: it is a foe, not a wall) */
export const polypTake = e => (gpIn(e) ? GP.inK : 1);

/* ONE FRAME. h = the nearest hero { x, y, alive } | null; c = { breath() -> { k, ph }, mark(m), sound(k), hit(box, dmg, name, o) -> 'hit'|'blocked'|null,
   floorY(x, y) -> the top of the first flesh at or under y (px) | null, say(e, word), splash(x, y) } */
export function stepPolyp(e, dt, h, c) {
  stepGlobs(e, dt, c);
  if (!e.alive) return;
  e.modeT -= dt; e.cd = Math.max(0, e.cd - dt);
  const b = c.breath(), out = gpOutBy(b.k, b.ph);
  if (!out && !gpIn(e) && e.mode !== 'spit') { e.mode = 'shrink'; e.modeT = GP.shrink; c.sound && c.sound('squelch'); }
  switch (e.mode) {
    case 'in': e.h = GP.hIn; if (out) { e.mode = 'swell'; e.modeT = GP.swell; c.sound && c.sound('squelch'); } return;
    case 'shrink': e.h = GP.hIn + (GP.h - GP.hIn) * Math.max(0, e.modeT / GP.shrink); if (e.modeT <= 0) { e.mode = 'in'; e.h = GP.hIn; } return;
    case 'swell': e.h = GP.hIn + (GP.h - GP.hIn) * (1 - Math.max(0, e.modeT / GP.swell)); if (e.modeT <= 0) { e.mode = 'out'; e.h = GP.h; e.modeT = 0.3; } return;
    case 'spitTell': if (h) e.face = Math.sign(h.x - e.x) || e.face; if (h && e.modeT > 0.2) e.aim = { x: h.x, y: c.floorY(h.x, h.y - 4) ?? h.y };
      if (e.modeT <= 0) { spit(e, c); e.mode = 'spit'; e.modeT = 0.15; } return;
    case 'spit': if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = GP.spit.rec; e.cd = GP.spit.cd; } return;
    case 'rec': if (e.modeT <= 0) { e.mode = 'out'; e.modeT = 0.2; } return;
    default: {   /* OUT: it watches; in range it spits */
      e.mode = 'out'; e.h = GP.h;
      const near = !!(h && h.alive && Math.abs(h.x - e.x) < GP.see && Math.abs(h.y - e.y) < GP.seeY);
      if (near) e.face = Math.sign(h.x - e.x) || e.face;
      if (near && e.cd <= 0 && e.modeT <= 0) { e.mode = 'spitTell'; e.modeT = GP.spit.tell; c.mark('!'); c.sound && c.sound('tell'); }
    }
  }
}
function spit(e, c) {
  const A = e.aim || { x: e.x + e.face * 80, y: e.y }, x0 = e.x + e.face * 4, y0 = e.y - GP.h + 4, T = GP.spit.flight;
  e.globs.push({ id: ++e.n, x: x0, y: y0, vx: (A.x - x0) / T, vy: (A.y - y0) / T - 0.5 * GP.spit.g * T, t: T + 0.6 }); e.aim = null; c.sound && c.sound('spit');
}
function stepGlobs(e, dt, c) {
  for (const g of e.globs) { g.t -= dt; g.vy += GP.spit.g * dt; g.x += g.vx * dt; g.y += g.vy * dt;
    if (c.hit([g.x - 5, g.x + 5, g.y - 5, g.y + 5], GP.spit.dmg, 'THE BILE SPIT', { key: 'gp' + (e.id0 || '') + ':' + g.id, blockable: true })) g.t = 0;
    const fy = g.vy > 0 ? c.floorY(g.x, g.y - 6) : null; if (fy != null && g.y >= fy) { g.t = 0; c.splash && c.splash(g.x, fy); } }
  e.globs = e.globs.filter(g => g.t > 0);
}
