// src/holy-ground.js — PALADIN 2: HOLY GROUND + LIGHT SPENT (claude/paladin2, Daniel 10-12, scratch/brief-paladin2.md). The Paladin is a
// ZONE-HOLDER, not a swordsman: his core verb is CONSECRATE - he plants ONE holy circle at his feet and fights from it.
//   INSIDE HIS OWN CIRCLE he hits HG.hitMul harder and mends HG.heal of his health a second; foes standing in it BURN (HG.burn every
//   HG.tick s, the dead set alight). One circle per owner: planting again moves it (the old one goes out at once). It stands HG.life s and
//   is drawn the whole time - a gold floor, a rim of light, a post of light at each edge, and the rim blinks for its last HG.warn s.
//   LIGHT IS SPENT (his meter, P.light 0..100: the maul landing, a turned blow and KNEELING BY A HOLY LIGHT fill it - src/crouch-b.js):
//   EMPOWER (C tapped inside the circle, HG.empower.cost) - the circle flares, grows and burns twice as hard; SMITE (the held overhead
//   inside the circle, HG.smite.cost); the HAMMER THROW (UP + C, HG.throw.cost); JUDGEMENT (the full bar, C tapped inside the circle).
//   AEGIS covers a co-op partner who stands in his circle while he holds it (main.js damagePlayer0 asks covering()).
// THE API IS THE OWNER'S, NOT THE HERO'S: an owner is any body with { x, y, light } (a hero, or LIT CHURCH 2's Paladin hero-boss), and the
// circle's side ('hero' | 'foe') says whom it burns - the host's api.targets(circle) gives the bodies standing against it and api.hurt
// does the damage, so the boss fight reuses plant/inside/empower/update/draw as they are and only hands over its own hooks.
// main.js binds it (makeHolyGround) and calls update (updateHoly), draw (drawHoly) and clear (a level load); BK.holy() reads it.
export const HG = {
  r: 44,              // px either side of the middle: about five and a half tiles across
  dy: 30,             // a body this far above or below the circle's floor still stands in it
  life: 9,            // s a circle stands
  warn: 1.5,          // its last seconds: the rim blinks (it is going out)
  cd: 1.2,            // s after a plant before he can plant again (the tap that moves it)
  st: 18,             // stamina to plant one
  tick: 0.4,          // s between burns
  burn: 4,            // damage a burn (before the host's own skill multiplier)
  heal: 0.02,         // of max health a second, mended standing in his own circle (a partner in it: half)
  hitMul: 1.2,        // his blows inside his own circle
  empower: { cost: 35, r: 60, life: 12, burnMul: 2, flare: 12 },   // EMPOWERED CONSECRATE: Light spent, a flare on the tap, a bigger, longer, hotter circle
  smite: { cost: 20, mul: 1.5 },                                   // SMITE: the overhead inside the circle, its waves holy
  throw: { cost: 25, dmg: 9, reach: 112, t: 1.4 },                 // THE HAMMER THROW: out and back
  judge: 100,                                                      // JUDGEMENT: the whole bar
  cover: { st: 10, light: 5 },                                     // the AEGIS turning a blow for a partner in his circle: his wind, his Light
};
/* SPEND LIGHT: true and taken if the owner has n of it, else false and nothing taken (the boss calls this on itself too) */
export function spendLight(o, n) { if (!o || (o.light || 0) < n - 1e-9) return false; o.light -= n; return true; }

export function makeHolyGround(api) {
  let circles = [];
  const stats = { planted: 0, empowered: 0, burns: 0, burnDmg: 0, healed: 0, covered: 0 };
  const time = () => api.time();
  /* IS THIS BODY STANDING IN IT? (its feet inside the rim, near the floor) */
  const inside = (c, b) => !!(c && b && !c.out && Math.abs(b.x - c.x) <= c.r && Math.abs(b.y - c.y) <= HG.dy);
  /* the owner's circle while it stands, or null */
  const of = o => circles.find(c => c.owner === o && !c.out) || null;
  const standing = o => inside(of(o), o);
  /* PLANT: one circle per owner - the old one goes out where it was. o: { r, life, side } */
  function plant(owner, x, y, o = {}) {
    for (const c of circles) if (c.owner === owner) c.out = true;
    const c = { owner, x, y, r: o.r || HG.r, r0: o.r || HG.r, life: o.life || HG.life, max: o.life || HG.life, tick: HG.tick, side: o.side || 'hero', emp: false, at: time(), burnMul: 1 };
    circles.push(c); stats.planted++; return c; }
  /* EMPOWER: bigger, longer, twice as hot (the Light is the caller's to spend - spendLight) */
  function empower(c, o = {}) { if (!c || c.out) return false; const E = HG.empower;
    c.emp = true; c.r = Math.max(c.r, o.r || E.r); c.life = c.max = Math.max(c.life, o.life || E.life); c.burnMul = E.burnMul; c.at = time(); stats.empowered++; return true; }
  /* MOVE: the circle comes with him (HAMMER LEAP) - same life, a new floor */
  function move(c, x, y) { if (!c || c.out) return; c.x = x; c.y = y; c.at = time(); }
  /* A CIRCLE THAT COVERS THIS BODY and is someone else's whose owner passes ok(owner) - the aegis covering a partner */
  const covering = (b, ok) => circles.find(c => !c.out && c.owner !== b && inside(c, b) && ok(c.owner)) || null;
  function update(dt) {
    for (const c of circles) { if (c.out) continue; c.life -= dt; c.tick -= dt;
      if (c.life <= 0) { c.out = true; continue; }
      if (c.tick <= 0) { c.tick = HG.tick;
        for (const t of api.targets(c)) if (inside(c, { x: t.x, y: t.y })) { const d = Math.max(1, Math.round(HG.burn * c.burnMul)); stats.burns++; stats.burnDmg += d; api.hurt(t, d, c); } }
      for (const b of api.healers(c)) if (inside(c, b) && api.heal) { const n = (b === c.owner ? 1 : 0.5) * HG.heal * dt; stats.healed += n; api.heal(b, n, c); }
      if (api.parts && Math.random() < dt * (c.emp ? 26 : 14)) api.parts({ x: c.x + (Math.random() - 0.5) * c.r * 2, y: c.y - 1, vx: 0, vy: -24 - Math.random() * 20, life: 0.8, max: 0.8, col: Math.random() < 0.5 ? '#fff6c8' : '#ffd36b', size: 1, grav: -6, glow: true }); }
    circles = circles.filter(c => !c.out);
  }
  /* DRAWN THE WHOLE TIME (A3): the gold floor, the rim, a post of light at each edge so where it ends reads, the rim blinking as it goes out;
     an empowered circle is whiter and taller-posted. A foe-side circle (the boss's) is drawn the same, so a player reads it as his */
  function draw(cx, cy) { const g = api.g(), now = time();
    for (const c of circles) { const x = Math.round(c.x - cx), y = Math.round(c.y - cy), k = Math.min(1, c.life / 0.5), going = c.life < HG.warn && Math.floor(now * 8) % 2 === 0;
      const grow = Math.min(1, (now - c.at) / 0.18), r = Math.max(4, c.r * grow), hot = c.emp ? '#ffffff' : '#fff6c8';
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = (c.emp ? 0.34 : 0.26) * k; g.fillStyle = '#ffd36b'; g.beginPath(); g.ellipse(x, y - 1, r, 6, 0, 0, 7); g.fill();
      g.globalAlpha = (going ? 0.25 : 0.75) * k; g.strokeStyle = hot; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, r, 5, 0, 0, 7); g.stroke();
      g.globalAlpha = 0.4 * k; g.beginPath(); g.ellipse(x, y - 1, r * (0.55 + 0.08 * Math.sin(now * 4)), 3, 0, 0, 7); g.stroke();
      const ph = c.emp ? 14 : 9;   /* THE EDGE POSTS: a thin column of light at each side of the rim */
      for (const s of [-1, 1]) { const ex = Math.round(x + s * r); g.globalAlpha = (going ? 0.2 : 0.55) * k; g.fillStyle = hot; g.fillRect(ex, y - ph, 1, ph); g.globalAlpha = 0.25 * k; g.fillStyle = '#ffd36b'; g.fillRect(ex - 1, y - ph + 2, 3, ph - 2); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  }
  const clear = () => { circles = []; };
  const read = () => ({ circles: circles.map(c => ({ x: Math.round(c.x), y: Math.round(c.y), r: c.r, life: +c.life.toFixed(2), emp: c.emp, side: c.side, owner: c.owner && c.owner.n ? c.owner.n : c.owner && c.owner.t || null })), stats: { ...stats } });
  return { plant, empower, move, inside, of, standing, covering, update, draw, clear, read, list: () => circles, stats };
}
