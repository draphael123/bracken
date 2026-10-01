// src/ember-ward.js - THE EMBER FLARE (claude/emberflare, Daniel 2026-10-01). It was THE EMBER WARD: down held raised a dome of fire
// that blocked everything for as long as she stood there, and Daniel's verdict was "strictly better than a regular guard". He turned
// down every tuning lever (heat drain, singe, chip, cooldown) and chose a different thing: a TIMED FLARE.
//
//   THE INPUT SPLIT. Every hero ducks (src/duck.js): down HELD on the ground is the plain duck, a high blow goes over her - that is her
//   sustained guard and it is unchanged. A PRESS of down (the key going down, not the key being down) is the FLARE: a ~0.25 s burst of
//   fire round her. Down held on and on flares once, at the press; to flare again, let go and press.
//   - A BLOW CAUGHT IN THE WINDOW (a yellow blow of any height, or a yellow projectile inside her reach) is CANCELLED, its attacker is
//     SCORCHED (the game's own burn: f.burn) and she GAINS HEAT (EMBER.heat on P.heat, the bar the ember, the jet and the pyre run on).
//     The flare is spent on the one blow, and cannot be pressed again for EMBER.spent.
//   - A MISTIME, a flare that catches nothing with a threat near (a live foe or a hostile projectile within EMBER.threat), FIZZLES: she
//     is rooted and EXPOSED for EMBER.rec (blows cost EMBER.exposed x) and cannot flare again. With nothing near it costs nothing, so a
//     crouch in a quiet place is not a trap.
//   - A RED blow breaks through, as every guard's does. WATER puts it out: in a pool the flare will not light.
// Other heroes are untouched. main.js binds it (makeEmberWard) and calls: update (the pyromancer's block of updatePlayer), settle
// (after P.ducking is known), catchSeeds (before the seeds meet her body), takes (in damagePlayer0, before the duck), exposed (the
// damage line), draw. State lives on the hero (P.ember*), so a co-op second hero carries her own. BK.ember() reads it for the tools.
export const EMBER = {
  window: 0.25,       // THE FLARE: this long from the press
  rec: 0.5,           // THE MISTIME: rooted, exposed and unable to flare this long
  exposed: 1.5,       // ...and a blow that lands in it costs this much more
  spent: 0.3,         // after a catch: this long before the next press can flare
  heat: 22,           // HEAT (P.heat, 0-100) a caught blow or projectile gives
  burn: 1.6,          // the burn the attacker takes, seconds
  reach: 52,          // a melee attacker this close (centre to centre, less half its width) is the one caught
  R: 20,              // the flare's radius, px: a projectile this near is caught
  threat: 160,        // a foe or projectile this near makes a miss a mistime
};

export function makeEmberWard(api) {
  const stats = { flares: 0, caught: 0, melted: 0, missed: 0, fizzled: 0, through: 0, doused: 0 };
  const P = () => api.P;
  const addParts = (...a) => api.parts.push(...a);
  /* IS SHE IN WATER? any pool she is stood in, wading or deeper (the same pool shape the swim reads) */
  const wet = p => (api.L.pools || []).some(q => !q.dry && p.x > q.x0 && p.x < q.x1 && p.y > q.y + 1 && (q.bottom === undefined || p.y <= q.bottom + 4));
  const foeOf = (who, fromX) => { const f = who && who.alive && !who.harmless ? who : api.nearFoe(fromX); return f && Math.abs(f.x - P().x) < EMBER.reach + (f.w || 12) / 2 && Math.abs(f.y - P().y) < 40 ? f : null; };
  /* IS ANYTHING NEAR ENOUGH TO HAVE BEEN WORTH A FLARE? a live foe on her level, or a hostile projectile, within EMBER.threat */
  const threatened = p => api.enemies.some(e => e.alive && !e.harmless && Math.abs(e.x - p.x) < EMBER.threat && Math.abs(e.y - p.y) < 60)
    || api.seeds.some(s => !s.dead && !s.reflected && Math.hypot(s.x - p.x, s.y - p.y) < EMBER.threat);

  function douse(p) { stats.doused++; api.SFX.hiss(); api.smoke(p.x, p.y - 8, 6, 10); p.emberUp = false; p.emberT = 0; }

  /* EVERY FRAME, the pyromancer's own (main.js updatePlayer's pyro block, before her feet are moved) */
  function update(dt, keys, { stunned, dodging, attacking, thrown }) {
    const p = P();
    p.emberRec = Math.max(0, (p.emberRec || 0) - dt); p.emberSpent = Math.max(0, (p.emberSpent || 0) - dt); p.emberFlash = Math.max(0, (p.emberFlash || 0) - dt); p.emberFizz = Math.max(0, (p.emberFizz || 0) - dt);
    const press = !!keys.down && !p.emberDownWas; p.emberDownWas = !!keys.down;
    const can = !!(p.ground && !p.climb && !p.cling && !p.swim && !p.dead && !p.plunge && !attacking && !dodging && !stunned && !(p.hurt > 0) && !p.jet && !p.fly && !thrown && !p.pinning);
    const dry = wet(p);
    if (p.emberUp && (!can || dry)) { if (dry && can) douse(p); else { p.emberUp = false; p.emberT = 0; } }   /* WATER PUTS IT OUT; a blow or a swing ends it with no penalty of its own */
    else if (press && can && !p.emberUp && !(p.emberRec > 0) && !(p.emberSpent > 0)) {
      if (dry) { api.SFX.hiss(); }
      else { /* PRESSED: the window opens, she is planted */
        p.emberUp = true; p.emberT = 0; p.vx = 0; stats.flares++;
        api.SFX.emberBurst(); api.ringAt(p.x, p.y - 8, 8, '#fff6c8', 0.12);
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; addParts({ fire: true, x: p.x + Math.cos(a) * 5, y: p.y - 8 + Math.sin(a) * 5, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, life: 0.2, max: 0.2, col: i % 2 ? '#ffd36b' : '#ff9a5c', size: 1, grav: 0 }); } } }
    if (p.emberUp) {
      p.emberT += dt; p.vx = 0;
      if (p.emberT >= EMBER.window) miss(p);   /* the window shut with nothing in it */
    }
    if (p.emberRec > 0) { p.vx = 0; p.rootT = Math.max(p.rootT || 0, 0.05);   /* EXPOSED: rooted, smoking */
      if (Math.random() < dt * 16) addParts({ x: p.x + (Math.random() - 0.5) * 8, y: p.y - 14 - Math.random() * 4, vx: (Math.random() - 0.5) * 8, vy: -22, life: 0.4, max: 0.4, col: '#8a8480', size: 1, grav: -10 }); }
  }
  /* THE WINDOW SHUT WITH NOTHING IN IT: with a threat near it is a mistime (rooted, exposed, no flare); with none it fades and costs nothing */
  function miss(p) {
    p.emberUp = false; p.emberT = 0; stats.missed++;
    if (!threatened(p)) return;
    stats.fizzled++; p.emberRec = EMBER.rec; p.emberFizz = 0.4; p.vx = 0;
    api.SFX.emberFizzle(); api.smoke(p.x, p.y - 10, 5, 8); api.ringAt(p.x, p.y - 8, EMBER.R - 8, '#8a8480', 0.25);
  }
  /* A flare ends here only if she has left the ground or been hit; down let go does not end it - a tap is a flare (main.js sets P.ducking after update) */
  function settle() { const p = P(); if (p.emberUp && (p.dead || p.hurt > 0 || !p.ground)) { p.emberUp = false; p.emberT = 0; } }
  /* THE DAMAGE LINE: while the mistime lasts a blow costs more */
  const exposed = () => ((P().emberRec || 0) > 0 ? EMBER.exposed : 1);

  /* A BLOW OR PROJECTILE CAUGHT IN THE WINDOW: cancelled, the attacker scorched, heat gained, the flare spent */
  function caught(p, f, kind) {
    p.emberUp = false; p.emberT = 0; p.emberSpent = EMBER.spent; p.emberFlash = 0.3; stats[kind === 'seed' ? 'melted' : 'caught']++;
    api.SFX.emberFlare(); api.hitstop(0.06); api.zoomKick(1.03, 0.15); api.ringAt(p.x, p.y - 8, EMBER.R + 8, '#ffffff', 0.28); api.ringAt(p.x, p.y - 8, EMBER.R, '#ff9a5c', 0.22);
    api.flame(p.x, p.y - 8, 9, 10, 80, 2); api.noteParry();
    api.gainHeat(EMBER.heat);
    if (f && f.alive) { f.burn = Math.max(f.burn || 0, EMBER.burn); f.heatOwner = p; f.flash = 0.15; api.flame(f.x, f.y - (f.h || 12) / 2, 8, 6, 60, 2); }
  }
  /* A BLOW ON THE FLARE (damagePlayer0, before the duck - a high blow is caught too). 'blocked', or null: it lands */
  function takes(fromX, dmg, unblockable, who) {
    const p = P(); if (!p.emberUp) return null;
    if (unblockable) { stats.through++; return null; }   /* RED: as every guard, it breaks through */
    caught(p, foeOf(who, fromX), 'blow');
    return 'blocked';
  }
  /* WHAT FLIES INTO THE FLARE (main.js, before the seeds meet her body): a yellow projectile melts. A red one flies on through to her.
     A chain (a drowned knight's) is a haul, not a missile: it goes on to her body, and the flare takes it there */
  function catchSeeds() {
    const p = P(); if (!p.emberUp) return;
    for (const s of api.seeds) {
      if (s.dead || s.reflected || s.chain || s.noBlock || s.unblockable) continue;
      if (Math.hypot(s.x - p.x, s.y - (p.y - 8)) > EMBER.R + 2) continue;
      s.dead = true; api.SFX.emberMelt(); api.burst(s.x, s.y, 5, ['#ff9a5c', '#ffd36b', '#fff6c8'], 40, 0.3, -40, 1); api.smoke(s.x, s.y, 2, 3);
      caught(p, null, 'seed'); return;
    }
  }

  /* DRAWN. THE FLARE: three beats of one round burst - a white-hot core and a thin ring while it is young, a wide orange shell with
     licks of flame at its height, a red ember ring as it dies - so the window can be SEEN closing. A CATCH: the shell blazes white and
     throws a second ring. THE MISTIME: grey, a small smoking ring, and a grey bar over her head that empties as the recovery runs out. */
  function draw(g, cx, cy) {
    const p = P(); if (p.dead) return;
    const x = Math.round(p.x - cx), y = Math.round(p.y - cy) - 8, t = api.time, fl = (p.emberFlash || 0) / 0.3;
    if (p.emberUp) {
      const k = Math.min(1, p.emberT / EMBER.window), beat = k < 0.34 ? 0 : k < 0.7 ? 1 : 2, R = Math.round(6 + (EMBER.R - 6) * (1 - (1 - k) * (1 - k)));
      const core = ['#ffffff', '#fff6c8', '#ff9a5c'][beat], body = ['#ffd36b', '#ff9a5c', '#d8481c'][beat];
      g.globalAlpha = 0.42 - 0.18 * k; g.fillStyle = body; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.55 * (1 - 0.6 * k); g.fillStyle = core; g.beginPath(); g.arc(x, y, Math.max(2, Math.round(R * 0.45)), 0, Math.PI * 2); g.fill();
      const N = 28;
      for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, lick = beat === 1 && Math.sin(t * 41 + i * 2.1) > 0 ? 2 : 0, px = Math.round(x + Math.cos(a) * (R + lick)), py = Math.round(y + Math.sin(a) * (R + lick));
        g.globalAlpha = 0.95; g.fillStyle = core; g.fillRect(px, py, 1, 1); if (lick) { g.globalAlpha = 0.6; g.fillStyle = body; g.fillRect(px, py, 1, 1); } }
      g.globalAlpha = 1;
    }
    if (fl > 0) { const R = Math.round(EMBER.R + 10 * (1 - fl)); g.globalAlpha = 0.5 * fl; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
      g.globalAlpha = fl; g.strokeStyle = '#fff6c8'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if ((p.emberFizz || 0) > 0) { const k = p.emberFizz / 0.4; g.globalAlpha = 0.6 * k; g.strokeStyle = '#8a8480'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, Math.round(EMBER.R - 8 + 4 * (1 - k)), 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if ((p.emberRec || 0) > 0) { const w = 14, bx = x - 7, by = y - 24, f = p.emberRec / EMBER.rec;
      g.fillStyle = '#1a0a04'; g.fillRect(bx - 1, by - 1, w + 2, 4); g.fillStyle = '#3a3430'; g.fillRect(bx, by, w, 2); g.fillStyle = '#8a8480'; g.fillRect(bx, by, Math.max(1, Math.round(w * f)), 2); }
  }

  /* FOR THE TOOLS (BK.ember) */
  const read = () => { const p = P(); return { flare: !!p.emberUp, up: !!p.emberUp, t: p.emberT || 0, rec: p.emberRec || 0, spent: p.emberSpent || 0, window: EMBER.window, wet: wet(p), flash: p.emberFlash || 0, stats: { ...stats } }; };
  return { update, settle, takes, catchSeeds, exposed, draw, read, resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
