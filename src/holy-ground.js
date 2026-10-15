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
  bossOutMul: 1.0,    // (claude/paltune) his blow on a boss while OFF his ground
  bossBurn: 0.3,      // (claude/paltune) the burn on a BOSS: x this (a slow boss stands in the circle all fight; wood fell 75 -> 38 s)
  heal: 0.02,         // of max health a second, mended standing in his own circle (a partner in it: half)
  hitMul: 1.3,        // his blows inside his own circle
  empower: { cost: 35, r: 60, life: 12, burnMul: 2, flare: 12 },   // EMPOWERED CONSECRATE: Light spent, a flare on the tap, a bigger, longer, hotter circle
  smite: { cost: 20, mul: 1.5 },                                   // SMITE: the overhead inside the circle, its waves holy
  throw: { cost: 60, dmg: 9, reach: 112, t: 1.4 },                 // THE HAMMER THROW: out and back (PALADIN 3: three pips of Conviction)
  judge: 100,                                                      // JUDGEMENT: the whole bar
  cover: { st: 10, light: 5 },                                     // the AEGIS turning a blow for a partner in his circle: his wind, his Light
  /* PALADIN 3 (claude/paladin3, Daniel 10-14): CONVICTION - the Light store read as FIVE PIPS (pip px of Light each). Earned by blows landing (as Light was), a
     BLOCK (+block), a PERFECT GUARD on the beat (+parry, and a HOLY FLASH that staggers the attacker). C SPENDS BY TIER: 1 = SMITE, 3 = RADIANCE (a burst) or
     UP+C the HAMMER THROW, 5 = SUNFALL (the finisher). Every spend lights the HALLOWED AURA: his holy ground at his feet, travelling with him, base + perPip s a pip */
  conv: { pip: 20, pips: 5, block: 20, parry: 40 },
  aura: { r: 34, base: 2, perPip: 0.8 },
  smiteQ: { cost: 20, mul: 1.6, reach: 28, stagger: 0.5 },       // SMITE (1 pip): a quick holy strike in front of him
  burst: { cost: 60, r: 56, dmg: 14, stagger: 0.7 },             // RADIANCE (3 pips): a burst of light all round him
  verdict: { every: 0.5, max: 4, reach: 110, dy: 60, mul: 1.15, hold: 2.4 },   // VERDICT (hold X): a sigil a beat on the nearest foes ahead, then light strikes them all
  arc: { float: 0.35, second: 0.09 },                            // HEAVEN'S ARC (up in the air): the whirl's second hit at atk s, a slight float
  flash: { r: 34, stagger: 0.6 },                                // the PERFECT GUARD's holy flash
};
/* CONVICTION PIPS: whole pips held (the Light store / HG.conv.pip) */
export const pipsOf = o => Math.floor(((o && o.light) || 0) / HG.conv.pip + 1e-6);
/* SPEND LIGHT: true and taken if the owner has n of it, else false and nothing taken (the boss calls this on itself too) */
export function spendLight(o, n) { if (!o || (o.light || 0) < n - 1e-9) return false; o.light -= n; return true; }

/* THE CIRCLE'S COLOURS by side (claude/palart). 'foe' is the same gold for now so a player reads the boss's circle as the same thing - LIT CHURCH 2 can retint
   it here (floor / rim / runes / the dark line under it) without touching the draw. */
export const HG_PAL = { hero: { floor: '#ffd36b', hot: '#fff6c8', emp: '#ffffff', rune: '#ffe9a0', under: '#5a3a08' } };
HG_PAL.foe = { ...HG_PAL.hero };

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
  /* FOLLOW: the HALLOWED AURA walks with him every frame (no re-plant flash: move's c.at is the plant ring) */
  function follow(c, x, y) { if (!c || c.out) return; c.x = x; c.y = y; }
  /* A CIRCLE THAT COVERS THIS BODY and is someone else's whose owner passes ok(owner) - the aegis covering a partner */
  const covering = (b, ok) => circles.find(c => !c.out && c.owner !== b && inside(c, b) && ok(c.owner)) || null;
  function update(dt) {
    for (const w of wards) w.t += dt; wards = wards.filter(w => w.t < w.max);
    for (const c of circles) { if (c.out) continue; c.life -= dt; c.tick -= dt;
      if (c.life <= 0) { c.out = true; continue; }
      if (c.tick <= 0) { c.tick = HG.tick;
        for (const t of api.targets(c)) if (inside(c, { x: t.x, y: t.y })) { const d = Math.max(1, Math.round(HG.burn * c.burnMul)); stats.burns++; stats.burnDmg += d; api.hurt(t, d, c); } }
      for (const b of api.healers(c)) if (inside(c, b) && api.heal) { const n = (b === c.owner ? 1 : 0.5) * HG.heal * dt; stats.healed += n; api.heal(b, n, c); }
      if (api.parts && Math.random() < dt * (c.emp ? 26 : 14)) api.parts({ x: c.x + (Math.random() - 0.5) * c.r * 2, y: c.y - 1, vx: 0, vy: -24 - Math.random() * 20, life: 0.8, max: 0.8, col: Math.random() < 0.5 ? '#fff6c8' : '#ffd36b', size: 1, grav: -6, glow: true }); }
    circles = circles.filter(c => !c.out);
  }
  /* A WARD FLASH on a partner the aegis just turned a blow for (main.js calls ward(partner) when covering() takes the blow): a shield of light drawn
     round him for a beat, a ring going out, and the tether to him flaring */
  let wards = [];
  const ward = b => { if (b) wards.push({ b, t: 0, max: 0.45 }); };
  /* THE SHIELD, as pixels: the outline of a heater shield, 7 wide and 8 tall, a cross inside it */
  const SHIELD = [[-3, -4], [-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [3, -4], [-3, -3], [3, -3], [-3, -2], [3, -2], [-3, -1], [3, -1], [-3, 0], [3, 0], [-2, 1], [2, 1], [-1, 2], [1, 2], [0, 3]];
  const RUNES = [[[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]], [[0, 0], [2, 0], [0, 1], [2, 1], [1, 2], [1, 3]], [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [2, 2], [0, 3], [2, 3]], [[0, 0], [1, 0], [2, 0], [2, 1], [1, 2], [0, 3]]];   /* four 3 x 4 runes: an arrow, a fork, a ladder, a hook */
  const hash = i => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s); };
  /* DRAWN THE WHOLE TIME (A3). claude/palart: THE GROUND SIGIL - a rim of light (a dark line under it so it reads on a bright floor), a band of RUNES round it
     (twelve, sixteen when empowered, turning slowly), a sun-and-cross in the middle; a post of light at each edge and a cap on it; EMPOWERED: whiter, a
     second ring, taller posts and two more behind, motes rising off the whole floor; PLANTED or MOVED: a 1 px ring runs out from the middle to the rim;
     GOING OUT: the rim blinks and the runes go dark one after another, clockwise, the sun last. Owner-agnostic: the colours come from HG_PAL[c.side], so
     LIT CHURCH 2's boss circle ('foe') is this same draw in its own tint. */
  function draw(cx, cy) { const g = api.g(), now = time();
    for (const c of circles) { const pal = HG_PAL[c.side] || HG_PAL.hero, x = Math.round(c.x - cx), y = Math.round(c.y - cy), k = Math.min(1, c.life / 0.5), going = c.life < HG.warn, blinkOff = going && Math.floor(now * 8) % 2 === 0;
      const grow = Math.min(1, (now - c.at) / 0.18), r = Math.max(4, c.r * grow), hot = c.emp ? pal.emp : pal.hot, N = c.emp ? 16 : 12, lit = going ? Math.ceil(N * c.life / HG.warn) : N;
      g.globalAlpha = 0.4 * k; g.strokeStyle = pal.under; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, r, 6, 0, 0, 7); g.stroke();   /* the dark line under the rim, a pixel below it */
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = (c.emp ? 0.3 : 0.2) * k; g.fillStyle = pal.floor; g.beginPath(); g.ellipse(x, y - 1, r, 7, 0, 0, 7); g.fill();
      g.globalAlpha = (blinkOff ? 0.25 : 0.7) * k; g.strokeStyle = hot; g.beginPath(); g.ellipse(x, y - 1, r, 6, 0, 0, 7); g.stroke();           /* the rim */
      g.globalAlpha = 0.45 * k; g.beginPath(); g.ellipse(x, y - 1, Math.max(2, r - 6), 4, 0, 0, 7); g.stroke();                                       /* the inner line the runes sit inside */
      if (c.emp) { g.globalAlpha = (0.4 + 0.15 * Math.sin(now * 5)) * k; g.strokeStyle = pal.emp; g.beginPath(); g.ellipse(x, y - 1, r * (0.62 + 0.04 * Math.sin(now * 3)), 4.4, 0, 0, 7); g.stroke(); }
      /* THE RUNES: round the band, turning slowly (an empowered one twice as fast); the far half dimmer, the near half bright */
      const rot = now * (c.emp ? 0.5 : 0.26), rb = r - 3;
      g.globalCompositeOperation = 'source-over';   /* (the glyphs are solid colour over a dark underlay, so they read on a bright floor as well as a dark one) */
      for (let i = 0; i < N; i++) { if (i >= lit) break; const a = rot + i * 6.2832 / N, s = Math.sin(a), px = Math.round(x + Math.cos(a) * rb) - 1, py = Math.round(y - 1 + s * 4.6) - 2, gl = RUNES[(i * 7 + (c.emp ? 1 : 0)) & 3], al = (s < 0 ? 0.6 : 1) * k * (blinkOff ? 0.5 : 1);
        g.globalAlpha = 0.55 * al; g.fillStyle = pal.under; for (const [dx, dy] of gl) g.fillRect(px + dx, py + dy + 1, 1, 1);
        g.globalAlpha = al; g.fillStyle = s < 0 ? pal.floor : pal.rune; for (const [dx, dy] of gl) g.fillRect(px + dx, py + dy, 1, 1); }
      g.globalCompositeOperation = 'lighter';
      /* THE SUN AND CROSS: a cross lying on the floor (long across, short in depth), four rays on its diagonals, a white heart; the pulse is the sun breathing */
      { const sunOn = !going || c.life > 0.35 * HG.warn, pu = 0.75 + 0.25 * Math.sin(now * 3.2), ar = c.emp ? 13 : 9, av = c.emp ? 4 : 3;
        if (sunOn) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.5 * k * pu; g.fillStyle = pal.under; g.fillRect(x - ar, y, ar * 2 + 1, 1); g.fillRect(x + 1, y - 1 - av, 1, av * 2 + 1);   /* (the underlay) */
          g.globalAlpha = 0.95 * k * pu; g.fillStyle = pal.rune; g.fillRect(x - ar, y - 1, ar * 2 + 1, 1); g.fillRect(x, y - 1 - av, 1, av * 2 + 1);
          g.globalAlpha = 0.7 * k * pu; g.fillStyle = hot; for (const [dx, dy] of [[-3, -2], [3, -2], [-3, 1], [3, 1]]) g.fillRect(x + Math.round(dx * (c.emp ? 1.5 : 1)), y - 1 + dy, 1, 1);
          g.globalAlpha = k; g.fillStyle = pal.emp; g.fillRect(x - 1, y - 1, 3, 1); g.fillRect(x, y - 2, 1, 3);
          if (c.emp) { g.globalAlpha = 0.5 * k * pu; g.strokeStyle = hot; g.beginPath(); g.ellipse(x, y - 1, 5, 2.4, 0, 0, 7); g.stroke(); } g.globalCompositeOperation = 'lighter'; } }
      /* THE EDGE POSTS: a column of light at each side of the rim, a cap on it (a cross when it is empowered) and, empowered, two more standing behind */
      const ph = c.emp ? 17 : 9;
      const post = (ex, ey, h, al) => { g.globalAlpha = (blinkOff ? 0.2 : 0.6) * k * al; g.fillStyle = hot; g.fillRect(ex, ey - h, 1, h); g.globalAlpha = 0.25 * k * al; g.fillStyle = pal.floor; g.fillRect(ex - 1, ey - h + 2, 3, h - 2);
        g.globalAlpha = (0.35 + 0.3 * Math.sin(now * 6 + ex)) * k * al * (blinkOff ? 0.4 : 1); g.fillStyle = pal.emp; g.fillRect(ex, ey - h - 1, 1, 1); if (c.emp) { g.fillRect(ex - 1, ey - h, 3, 1); g.fillRect(ex, ey - h - 2, 1, 3); }
        g.globalAlpha = 0.5 * k * al; g.fillStyle = pal.emp; g.fillRect(ex - 1, ey, 3, 1); };   /* (its foot: a flat spark on the floor) */
      for (const s of [-1, 1]) post(Math.round(x + s * r), y - 1, ph, 1);
      if (c.emp) for (const s of [-1, 1]) post(Math.round(x + s * r * 0.55), y - 5, 11, 0.55);
      /* MOTES: rise off the floor, more when empowered (deterministic in time: no state to keep) */
      { const n = c.emp ? 12 : 5, rise = c.emp ? 24 : 13; g.fillStyle = hot; for (let i = 0; i < n; i++) { const u = (now * 0.55 + hash(i * 3.1 + 1)) % 1; g.globalAlpha = (1 - u) * 0.85 * k * (going ? 0.5 : 1); g.fillRect(Math.round(x + (hash(i + 7) - 0.5) * 2 * (r - 6)), Math.round(y - 2 - u * rise), 1, 1); } }
      /* PLANT / MOVE: a 1 px ring runs outward from the middle to past the rim and fades (an empowered one runs two, the second a beat behind) */
      for (let q = 0; q < (c.emp ? 2 : 1); q++) { const age = now - c.at - q * 0.12, D = 0.42; if (age > 0 && age < D) { const u = age / D, rr = Math.max(1, r * (0.1 + 1.1 * u)); g.globalAlpha = (1 - u) * (q ? 0.7 : 1) * k; g.strokeStyle = pal.emp; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, rr, Math.max(0.6, rr * 6 / Math.max(6, r)), 0, 0, 7); g.stroke(); } }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    /* THE AEGIS TETHER: while a paladin holds the aegis over a partner standing in his circle, a thin line of light runs from his shield hand to the partner,
       a spark running down it; the host (api.tethers) says who is covered. A ward flash (ward()) brightens it for a beat. */
    if (api.tethers) for (const c of circles) { const pal = HG_PAL[c.side] || HG_PAL.hero;
      for (const t of api.tethers(c) || []) { const a = t.a, b = t.b, ax = a.x + (a.face || 1) * 6, ay = a.y - 10, bx = b.x, by = b.y - 9, dist = Math.hypot(bx - ax, by - ay), n = Math.max(4, Math.round(dist / 3)), fl = wards.some(w => w.b === b) ? 1 : 0;
        for (let i = 0; i <= dist; i++) { const u = i / dist, px = Math.round(ax - cx + (bx - ax) * u), py = Math.round(ay - cy + (by - ay) * u - Math.sin(u * Math.PI) * 4 + Math.sin(now * 8 + u * 9) * 0.8), pulse = (i + Math.floor(now * 18)) % 4 === 0;   /* a solid thread, a bright bead running down it, a dark line under it so it reads on a bright floor */
          g.globalAlpha = 0.3; g.fillStyle = pal.under; g.fillRect(px, py + 1, 1, 1);
          g.globalAlpha = fl ? 1 : pulse ? 1 : 0.7; g.fillStyle = pulse || fl ? pal.emp : pal.hot; g.fillRect(px, py, 1, fl ? 2 : 1); }
        g.globalCompositeOperation = 'lighter';
        const us = (now * 1.6) % 1; g.globalAlpha = 0.95; g.fillStyle = pal.emp; g.fillRect(Math.round(ax - cx + (bx - ax) * us) - 1, Math.round(ay - cy + (by - ay) * us - Math.sin(us * Math.PI) * 4) - 1, 2, 2);   /* the spark going to him */
        g.globalAlpha = 0.8; g.fillStyle = pal.hot; const gx = Math.round(bx - cx), gy = Math.round(by - cy); g.fillRect(gx - 1, gy, 3, 1); g.fillRect(gx, gy - 1, 1, 3);   /* the glint where it meets him, and at the shield */
        g.fillRect(Math.round(ax - cx) - 1, Math.round(ay - cy), 3, 1); g.fillRect(Math.round(ax - cx), Math.round(ay - cy) - 1, 1, 3);
        g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; } }
    for (const w of wards) { const u = w.t / w.max, a = 1 - u, bx = Math.round(w.b.x - cx), by = Math.round(w.b.y - 9 - cy), pal = HG_PAL.hero;
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.45 * a; g.fillStyle = pal.floor; g.beginPath(); g.ellipse(bx, by, 6 + 5 * u, 8 + 5 * u, 0, 0, 7); g.fill();               /* the flash on him */
      g.globalAlpha = a; g.strokeStyle = pal.emp; g.lineWidth = 1; g.beginPath(); g.ellipse(bx, by, 7 + 9 * u, 9 + 9 * u, 0, 0, 7); g.stroke();   /* the ring going out */
      g.globalAlpha = Math.min(1, a * 1.6); g.fillStyle = pal.hot; for (const [dx, dy] of SHIELD) g.fillRect(bx + dx, by + dy, 1, 1);                 /* the shield of light */
      g.fillStyle = pal.emp; g.fillRect(bx - 1, by - 1, 3, 1); g.fillRect(bx, by - 2, 1, 4);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  }
  const clear = () => { circles = []; wards = []; };
  const read = () => ({ circles: circles.map(c => ({ x: Math.round(c.x), y: Math.round(c.y), r: c.r, life: +c.life.toFixed(2), emp: c.emp, side: c.side, owner: c.owner && c.owner.n ? c.owner.n : c.owner && c.owner.t || null })), stats: { ...stats } });
  return { plant, empower, move, follow, inside, of, standing, covering, ward, update, draw, clear, read, list: () => circles, stats };
}
