// src/ember-ward.js — THE EMBER WARD (claude/ember-ward, Daniel 2026-09-29: "I like it"): THE PYROMANCER'S CROUCH.
//
// Every hero ducks (src/duck.js). Hers is a superset: DOWN held on the ground, stood still, and she drops into the universal duck
// (her hurt box is DUCK_H, a high blow still goes over her, for nothing) AND raises a low half-dome of flame round herself - a
// SHIELD OF FIRE that runs on HEAT:
//   - it BLOCKS every YELLOW blow that reaches it, from either side (a dome has no back): a melee attacker is SINGED (a short burn),
//     a projectile inside its reach MELTS (an arrow, a bolt, a stone, a net, a web)
//   - every block adds WARD HEAT (EMBER.hitHeat a blow, EMBER.seedHeat a projectile) to a small meter over her head; HEAT is her
//     own bar for the ember, the jet and the pyre, and is left alone - this one belongs to the ward
//   - from EMBER.sputter on the ward SPUTTERS (it gutters, spits sparks and pops); at 100 it OVERHEATS: it bursts (a ring that
//     knocks back and scorches what stands round her and burns what is in the air), she STAGGERS (EMBER.stagger) and the ward is
//     LOCKED (EMBER.lock) - down does not raise it until the lock runs out
//   - a PERFECT ward, raised no more than EMBER.perfect before the blow lands, FLARES: the attacker is burnt and knocked back (a
//     boss is only checked), a projectile is thrown back as an ember at whoever loosed it, and the ward VENTS (EMBER.vent heat off).
//     A ward raised again less than EMBER.rearm after it was dropped cannot flare: mashing down is not a parry
//   - a RED blow breaks through, as every guard's does (damagePlayer's `unblockable`, a seed's noBlock/unblockable)
//   - WATER puts it out: in a pool (even wading) it will not light, one that was up goes out in steam, and the heat is quenched
//   - she can TURN while warded (left/right face her the other way), not walk. Heat COOLS only while the ward is down
// Other heroes are untouched. main.js binds it (makeEmberWard) and calls: update (the pyromancer's block of updatePlayer), settle
// (after P.ducking is known), catchSeeds (before the seeds meet her body), takes (in damagePlayer0, after the duck), draw.
// State lives on the hero (P.ember*), so a co-op second hero carries her own. BK.ember() reads it for tools/ember-ward.mjs.
export const EMBER = {
  R: 16,              // the dome's radius, px from her feet: over her crouched head (9-10) and the height a level arrow flies at
  perfect: 0.16,      // THE PERFECT WARD: raised this long or less before the blow lands (the knight's shield is 0.11)
  rearm: 0.3,         // ...and only if it had been down this long first
  hitHeat: 24,        // WARD HEAT a blocked blow adds (four and a sputter, five and it overheats)
  seedHeat: 14,       // ...and a melted projectile
  sputter: 70,        // from here it sputters
  vent: 50,           // a flare takes this much off
  cool: 40,           // heat/s while the ward is down...
  coolDelay: 0.35,    // ...once it has been down this long
  lock: 1.2,          // OVERHEATED: this long before it will light again
  stagger: 0.45,      // ...and she reels this long (P.hurt)
  singe: 0.9,         // the burn a blocked melee attacker takes
  singeReach: 40,     // ...if it is this close
  flareBurn: 2.2, flareKnock: 220, flareStagger: 1.0, flareReach: 52,
  burstR: 46, burstKnock: 260, burstDmg: 4, burstBurn: 1.2,
};

export function makeEmberWard(api) {
  const stats = { raised: 0, blocks: 0, melted: 0, flares: 0, returned: 0, overheats: 0, doused: 0, through: 0 };
  const P = () => api.P;
  const heat = p => p.emberHeat || 0;
  const addParts = (...a) => api.parts.push(...a);
  /* IS SHE IN WATER? any pool she is stood in, wading or deeper (the same pool shape the swim reads) */
  const wet = p => (api.L.pools || []).some(q => !q.dry && p.x > q.x0 && p.x < q.x1 && p.y > q.y + 1 && (q.bottom === undefined || p.y <= q.bottom + 4));
  const foeOf = (who, fromX) => { const f = who && who.alive && !who.harmless ? who : api.nearFoe(fromX); return f && Math.abs(f.x - P().x) < EMBER.flareReach + (f.w || 12) / 2 && Math.abs(f.y - P().y) < 40 ? f : null; };
  const said = (p, k, txt, col, gap = 0.5) => { const t = api.time; p.emberSaid = p.emberSaid || {}; if (t - (p.emberSaid[k] ?? -9) < gap) return false; p.emberSaid[k] = t; api.number(p.x, p.y - 24, txt, col); return true; };

  function douse(p, loud) {
    if (p.emberUp || heat(p) > 0 || loud) { stats.doused++; api.SFX.hiss(); api.smoke(p.x, p.y - 8, 6, 10); said(p, 'out', 'THE WARD GOES OUT', '#bfe6f5', 1.2); }
    p.emberUp = false; p.emberHeat = 0; p.emberDownT = 0;
  }

  /* EVERY FRAME, the pyromancer's own (main.js updatePlayer's pyro block, before her feet are moved) */
  function update(dt, keys, { stunned, dodging, attacking, thrown }) {
    const p = P();
    p.emberLock = Math.max(0, (p.emberLock || 0) - dt); p.emberFlash = Math.max(0, (p.emberFlash || 0) - dt); p.emberBurstT = Math.max(0, (p.emberBurstT || 0) - dt); p.emberMelt = Math.max(0, (p.emberMelt || 0) - dt);
    const want = !!(keys.down && p.ground && !p.climb && !p.cling && !p.swim && !p.dead && !p.plunge && !attacking && !dodging && !stunned && !p.jet && !p.fly && !thrown && !p.pinning
      && (p.emberUp || p.onMover || Math.abs(p.vx) < 40));
    const was = !!p.emberUp;
    if ((want || was) && wet(p)) {   /* WATER PUTS IT OUT: one that was up goes out in steam, and one asked for in a pool will not light */
      if (was) douse(p, true); else if (said(p, 'wet', 'NO FIRE IN THE WATER', '#bfe6f5', 1.5)) api.SFX.hiss();
      p.emberUp = false; p.emberHeat = 0; }
    else p.emberUp = want && !(p.emberLock > 0);
    if (p.swim && heat(p) > 0) p.emberHeat = 0;   /* under: quenched */
    if (want && !p.emberUp && p.emberLock > 0) said(p, 'lock', 'TOO HOT', '#ff6b3c', 0.8);
    if (p.emberUp && !was) {   /* RAISED */
      p.emberT = 0; p.emberCanFlare = (p.emberDownT ?? 9) >= EMBER.rearm; stats.raised++;
      api.SFX.emberWard(); api.ringAt(p.x, p.y - 6, EMBER.R - 4, '#ff9a5c', 0.22);
      for (let i = 0; i < 8; i++) { const a = Math.PI + (i + 0.5) / 8 * Math.PI; addParts({ fire: true, x: p.x + Math.cos(a) * 6, y: p.y + Math.sin(a) * 6, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, life: 0.22, max: 0.22, col: i % 2 ? '#ffd36b' : '#ff9a5c', size: 1, grav: 0 }); } }
    if (p.emberUp) {
      p.emberT += dt; p.emberDownT = 0; p.vx = 0;
      if (keys.left && !keys.right) p.face = -1; else if (keys.right && !keys.left) p.face = 1;   /* SHE TURNS, she does not walk */
      const h = heat(p) / 100, sput = heat(p) >= EMBER.sputter;
      if (Math.random() < dt * (14 + 20 * h)) { const a = Math.PI + Math.random() * Math.PI, r = EMBER.R - 1 - Math.random() * 3;
        addParts({ fire: true, x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r, vx: Math.cos(a) * 6, vy: -18 - Math.random() * 20, life: 0.3, max: 0.3, col: h > 0.7 ? '#fff6c8' : Math.random() < 0.5 ? '#ffd36b' : '#ff9a5c', size: 1, grav: -10 }); }
      if (sput) {   /* SPUTTERING: it spits and pops - it is nearly full */
        if (Math.random() < dt * 18) { const a = Math.PI + Math.random() * Math.PI; addParts({ streak: true, x: p.x + Math.cos(a) * EMBER.R, y: p.y + Math.sin(a) * EMBER.R, vx: Math.cos(a) * (60 + Math.random() * 80), vy: Math.sin(a) * 90 - 30, life: 0.25, max: 0.25, col: '#fff6c8', size: 1, grav: 300 }); }
        p.emberPopT = (p.emberPopT || 0) - dt; if (p.emberPopT <= 0) { p.emberPopT = 0.28 + Math.random() * 0.12; api.SFX.emberSputter(); }
        said(p, 'sput', 'SPUTTERING', '#ffb070', 2.5); }
    } else {
      p.emberT = 0; p.emberDownT = (p.emberDownT ?? 9) + dt;
      if (p.emberDownT > EMBER.coolDelay && heat(p) > 0) p.emberHeat = Math.max(0, heat(p) - EMBER.cool * dt);   /* it cools only while it is down */
    }
    /* what a flare threw back flies as an ember */
    for (const s of api.seeds) if (s.ember && !s.dead && Math.random() < dt * 40) addParts({ fire: true, x: s.x, y: s.y, vx: -s.vx * 0.1, vy: -20, life: 0.22, max: 0.22, col: Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: 1, grav: 0 });
  }
  /* AFTER THE DUCK: the ward is the duck and more, so it stands only while she is ducked (main.js sets P.ducking after update) */
  function settle() { const p = P(); if (p.emberUp && !p.ducking) { p.emberUp = false; p.emberDownT = 0; } }

  const perfectNow = p => p.emberUp && p.emberCanFlare && p.emberT <= EMBER.perfect;
  function addHeat(p, n) { p.emberHeat = Math.min(100, heat(p) + n); if (p.emberHeat >= 100) overheat(p); }

  /* THE PERFECT WARD: it flares. f the attacker (or null for a projectile), and it vents */
  function flare(p, f) {
    stats.flares++; p.emberFlash = 0.32; p.emberHeat = Math.max(0, heat(p) - EMBER.vent);
    api.SFX.emberFlare(); api.hitstop(0.08); api.zoomKick(1.04, 0.2); api.ringAt(p.x, p.y - 6, EMBER.R + 10, '#fff6c8', 0.3); api.ringAt(p.x, p.y - 6, EMBER.R + 4, '#ff9a5c', 0.24);
    api.flame(p.x, p.y - 8, 10, 12, 90, 2); said(p, 'flare', 'FLARE', '#fff6c8', 0.3);
    api.noteParry(); p.parryT = 0.22;
    if (f && f.alive) { const d = Math.sign(f.x - p.x) || p.face;
      api.hurtAs('shot', f, Math.max(4, Math.round(api.swordDmg() * 0.9)), p.x, false);
      if (f.alive) { f.burn = Math.max(f.burn || 0, EMBER.flareBurn); f.heatOwner = p; f.flash = 0.2;
        if (f.maxHp || api.lcBig(f)) f.stagger = Math.max(f.stagger || 0, 0.35);   /* a boss is only checked, as a parry checks it */
        else { f.stagger = Math.max(f.stagger || 0, EMBER.flareStagger); if (!api.knockSkip(f)) f.vx = d * EMBER.flareKnock; }
        p.parryFoe = f; p.parryFoeUntil = api.time + 1.5; }
      api.flame(f.x, f.y - (f.h || 12) / 2, 8, 6, 60, 2); }
  }
  /* OVERHEATED: it bursts - what stands round her is thrown back and scorched, what flies near her burns - and she reels */
  function overheat(p) {
    stats.overheats++; p.emberUp = false; p.emberHeat = 0; p.emberLock = EMBER.lock; p.emberDownT = 0; p.emberBurstT = 0.45;
    p.hurt = Math.max(p.hurt || 0, EMBER.stagger); p.vx = 0;
    api.SFX.emberOverheat(); api.shakeCam(5); api.zoomKick(1.05, 0.25); api.ringAt(p.x, p.y - 6, EMBER.burstR, '#ff6b2c', 0.4); api.ringAt(p.x, p.y - 6, EMBER.burstR - 12, '#ffd36b', 0.3);
    api.flame(p.x, p.y - 6, 22, 16, 120, 3); api.smoke(p.x, p.y - 10, 8, 12);
    api.number(p.x, p.y - 30, 'OVERHEATED', '#ff6b3c');
    for (const e of api.enemies) if (e.alive && !e.harmless && Math.abs(e.x - p.x) < EMBER.burstR + (e.w || 12) / 2 && Math.abs(e.y - p.y) < 34) {
      const d = Math.sign(e.x - p.x) || p.face; api.hurtAs('shot', e, EMBER.burstDmg, p.x, false);
      if (e.alive) { e.burn = Math.max(e.burn || 0, EMBER.burstBurn); e.heatOwner = p; if (!e.maxHp && !api.lcBig(e)) { e.stagger = Math.max(e.stagger || 0, 0.6); if (!api.knockSkip(e)) { e.vx = d * EMBER.burstKnock; e.vy = Math.min(e.vy || 0, -90); } } } }
    for (const s of api.seeds) if (!s.dead && !s.reflected && !s.noBlock && !s.unblockable && Math.hypot(s.x - p.x, s.y - (p.y - 6)) < EMBER.burstR) { s.dead = true; api.burst(s.x, s.y, 3, ['#ff9a5c', '#ffd36b'], 40, 0.25, 0, 1); }
  }

  /* A BLOW ON THE WARD (damagePlayer0, after the duck has let a high one go over). 'blocked', or null: it lands */
  function takes(fromX, dmg, unblockable, who) {
    const p = P(); if (!p.emberUp) return null;
    if (unblockable) { stats.through++; said(p, 'thru', 'THROUGH THE WARD', '#ff6b6b', 0.6); return null; }   /* RED: as every guard, it breaks through */
    stats.blocks++;
    const f = foeOf(who, fromX);
    if (perfectNow(p)) { flare(p, f); return 'blocked'; }
    api.SFX.emberBlock(); api.hitstop(0.035); p.emberMelt = 0.15;
    api.flame(p.x + (Math.sign(fromX - p.x) || p.face) * (EMBER.R - 4), p.y - 8, 5, 3, 50, 2);
    if (f && Math.abs(f.x - p.x) < EMBER.singeReach + (f.w || 12) / 2) { f.burn = Math.max(f.burn || 0, EMBER.singe); f.heatOwner = p; said(p, 'singe', 'SINGED', '#ffb070', 0.8); }   /* the attacker is singed a little */
    addHeat(p, EMBER.hitHeat);
    return 'blocked';
  }
  /* WHAT FLIES INTO THE DOME (main.js, before the seeds meet her body): a yellow projectile melts, or on the beat goes back as an ember.
     A red one flies on through to her. A chain (a drowned knight's) is a haul, not a missile: it goes on to her body, and the ward takes it there */
  function catchSeeds() {
    const p = P(); if (!p.emberUp) return;
    for (const s of api.seeds) {
      if (s.dead || s.reflected || s.chain || s.noBlock || s.unblockable) continue;
      const dx = s.x - p.x, dy = s.y - p.y; if (dy > 2 || Math.hypot(dx, dy) > EMBER.R + 2) continue;
      if (perfectNow(p)) { stats.returned++; s.owner = s.owner || s.from; api.reflectSeed(s); s.ember = true; s.fire = true; flare(p, null); continue; }
      stats.melted++; s.dead = true; p.emberMelt = 0.15;
      api.SFX.emberMelt(); api.burst(s.x, s.y, 5, ['#ff9a5c', '#ffd36b', '#fff6c8'], 40, 0.3, -40, 1); api.smoke(s.x, s.y, 2, 3);
      said(p, 'melt', 'MELTED', '#ffb070', 0.7);
      addHeat(p, EMBER.seedHeat); if (!p.emberUp) return;
    }
  }

  /* DRAWN: the dome (it runs from orange to white as it fills, gutters and gaps when it sputters, blazes white on a flare), the
     overheat's shell of fire, and the WARD HEAT meter - a thin bar just over the top of the dome, over her head, shown while the ward
     is up or holds any heat (grey and emptying while it is locked). Over her head is the one place nothing else of hers is drawn
     when she is crouched: the HUD's HEAT bar is her other fire, and in front of her is where the blows come from. */
  function draw(g, cx, cy) {
    const p = P(); if (p.dead) return;
    const x = Math.round(p.x - cx), y = Math.round(p.y - cy), t = api.time, h = heat(p) / 100, sput = heat(p) >= EMBER.sputter, fl = (p.emberFlash || 0) / 0.32;
    if (p.emberUp) {
      const R = EMBER.R + (fl > 0 ? Math.round(3 * fl) : 0) + (p.emberMelt > 0 ? 1 : 0);
      const rim = fl > 0 ? '#ffffff' : h > 0.7 ? '#fff6c8' : h > 0.4 ? '#ffd36b' : '#ff9a5c', body = fl > 0 ? '#ffd36b' : h > 0.7 ? '#ffb070' : '#ff6b2c';
      g.globalAlpha = (sput ? 0.12 + 0.12 * Math.random() : 0.16 + 0.04 * Math.sin(t * 9)) + 0.25 * fl; g.fillStyle = body;
      g.beginPath(); g.arc(x, y, R, Math.PI, 0); g.closePath(); g.fill();
      const N = 26;
      for (let i = 0; i <= N; i++) { const a = Math.PI + i / N * Math.PI, lick = Math.sin(t * 17 + i * 1.7) > 0.3 ? 1 : 0;
        if (sput && Math.sin(t * 23 + i * 2.3) > 0.55) continue;   /* guttering: gaps in the rim */
        const px = Math.round(x + Math.cos(a) * R), py = Math.round(y + Math.sin(a) * R);
        g.globalAlpha = 0.9; g.fillStyle = rim; g.fillRect(px, py, 1, 1);
        if (lick) { g.globalAlpha = 0.6; g.fillStyle = body; g.fillRect(px, py - 1, 1, 1); } }
      g.globalAlpha = 0.5; g.fillStyle = '#2a0e04'; g.fillRect(x - R - 1, y, 2 * R + 3, 1);   /* the floor it stands on, scorched */
      g.globalAlpha = 1;
    }
    if (p.emberBurstT > 0) { const k = p.emberBurstT / 0.45, r = Math.round(EMBER.burstR * (1 - k * 0.6));
      g.globalAlpha = 0.5 * k; g.fillStyle = '#ff6b2c'; g.beginPath(); g.arc(x, y - 4, r, Math.PI, 0); g.closePath(); g.fill();
      g.globalAlpha = k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.arc(x, y - 4, r, Math.PI, 0); g.stroke(); g.globalAlpha = 1; }
    const lock = (p.emberLock || 0) / EMBER.lock;
    if (p.emberUp || h > 0.01 || lock > 0) {
      const w = 16, bx = x - 8, by = y - EMBER.R - 6;
      g.fillStyle = '#1a0a04'; g.fillRect(bx - 1, by - 1, w + 2, 4);
      g.fillStyle = '#4a2410'; g.fillRect(bx, by, w, 2);
      if (lock > 0) { g.fillStyle = '#8a8480'; g.fillRect(bx, by, Math.round(w * lock), 2); }
      else { g.fillStyle = sput ? (Math.floor(t * 12) % 2 ? '#fff6c8' : '#ff4a2a') : h > 0.4 ? '#ffb070' : '#ff9a5c'; g.fillRect(bx, by, Math.max(h > 0 ? 1 : 0, Math.round(w * h)), 2);
        g.fillStyle = '#ff4a2a'; g.fillRect(bx + Math.round(w * EMBER.sputter / 100), by - 1, 1, 1); }   /* the notch: past it, it sputters */
    }
  }

  /* FOR THE TOOLS (BK.ember) */
  const read = () => { const p = P(); return { up: !!p.emberUp, heat: heat(p), lock: p.emberLock || 0, t: p.emberT || 0, canFlare: !!p.emberCanFlare, perfect: EMBER.perfect, sputter: EMBER.sputter, wet: wet(p), flash: p.emberFlash || 0, stats: { ...stats } }; };
  return { update, settle, takes, catchSeeds, draw, read, resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
