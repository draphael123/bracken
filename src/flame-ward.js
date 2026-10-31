// src/flame-ward.js - THE FLAME WARD, THE PYROMANCER'S BLOCK (claude/pyrokit, Daniel 10-30 20:50-20:52, scratch/brief-pyrokit-1101.md 3A). It replaces
// src/ember-ward.js (THE EMBER FLARE: down held ~0.3 s opened a 0.25 s parry window, then a weak half-damage guard). Daniel's rule (10-30): EVERY
// HERO NEEDS A BLOCK. Hers is a fire shield that goes out quickly, burns what touches it, and cannot be held:
//
//   THE INPUT. TAP C (the block key): a dome of fire round her for WARD.t (0.45 s), however short the tap. It cannot be held past that. After it,
//   WARD.cd (1 s) before the next. C STILL HELD at WARD.fold (0.35 s) is the HELD FIREBALL instead: the ward folds into the ball on the staff that
//   frame (main.js, castFireball) - never ward and fireball on one frame, and a ward on its cooldown never stops a press from charging a ball.
//   DOWN is not the ward any more (claude/crouchfix, Daniel 10-11: a bare press of down flared by accident on every duck); down is STOKE now (main.js).
//   - A YELLOW BLOW IN THE FIRST WARD.perfect (0.15 s) IS A PARRY: cancelled, the attacker SCORCHED (f.burn) and BURN-MARKED, she gains WARD.heatParry,
//     the shared parry -> riposte (src/riposte.js parried), and the cooldown is only WARD.spent. A HEAVY hit-stop (WARD.stopParry) + rings + the parry sound.
//   - A YELLOW BLOW LATER IN THE WARD IS BLOCKED: it costs stamina as the knight's shield does (api.blockCost) - with too little stamina the ward
//     BREAKS and half the blow comes through - she gains WARD.heatBlock, the attacker is scorched. The shared block weight (stop 50 ms, sparks, a ring).
//   - A RED BLOW (or a piercing one) BREAKS THROUGH, as every guard's does.
//   - CONTACT: a foe that touches the dome while it is up takes WARD.contactK x her staff damage (x heat) ONCE per ward, burns WARD.burn s and is marked.
//   - A YELLOW PROJECTILE flying into it melts (heat as a block, no stamina); a Windcaller's bolt is set alight and flies home (api.burnHome).
//   - A MISTIME: a ward that caught, blocked and burned nothing with a threat near ends ROOTED for WARD.rec (blows cost WARD.exposed x) - the ward is
//     not free to throw up all day in a fight. With nothing near it costs nothing. A fold into a fireball is never a mistime.
//   - WATER puts it out: in a pool it will not light.
// main.js binds it (makeFlameWard) and calls: raise (the pyro block of updatePlayer, on the press), fold (the hold reaching WARD.fold), update (every
// frame), takes (damagePlayer0, before the duck), catchSeeds (before the seeds meet her body), exposed (the damage line), draw. State on the hero (P.ward*).
export const WARD = {
  t: 0.45,            // the ward is up this long from the press (a tap or not)
  perfect: 0.15,      // a blow in the first this long of it is a PARRY
  cd: 1.0,            // after a ward ends: this long before the next
  spent: 0.3,         // ...only this long after a parry
  fold: 0.35,         // C held this long: the ward folds into the held fireball (main.js FB.steps[0])
  rec: 0.4,           // THE MISTIME: rooted this long
  exposed: 1.25,      // ...and a blow that lands in it costs this much more
  threat: 160,        // a foe or a projectile this near makes an empty ward a mistime
  R: 22,              // the dome's radius, px: contact and projectiles
  reach: 52,          // a melee attacker this close is the one scorched by a parry/block
  burn: 2.4,          // s of burn on whatever the ward scorches
  contactK: 0.5,      // CONTACT: x her staff damage (swordDmg) x heat, once per foe per ward (brief: ~4 at L1)
  heatParry: 10,      // heat a parry gives
  heatBlock: 4,       // heat a block or a melted projectile gives
  stopParry: 0.10,    // HIT-STOP: the parry (heavy; the flare was 60 ms - the matrix floor; a knight's parry is 90)
  stopContact: 0.05,  // ...a contact burn (once per ward, the shared block row's 50 ms)
};

export function makeFlameWard(api) {
  const stats = { wards: 0, parries: 0, blocks: 0, broken: 0, contacts: 0, melted: 0, through: 0, fizzled: 0, folded: 0, doused: 0 };
  const P = () => api.P;
  const wet = p => (api.L.pools || []).some(q => !q.dry && p.x > q.x0 && p.x < q.x1 && p.y > q.y + 1 && (q.bottom === undefined || p.y <= q.bottom + 4));
  const foeOf = (who, fromX) => { const f = who && who.alive && !who.harmless ? who : api.nearFoe(fromX); return f && Math.abs(f.x - P().x) < WARD.reach + (f.w || 12) / 2 && Math.abs(f.y - P().y) < 40 ? f : null; };
  const threatened = p => api.enemies.some(e => e.alive && !e.harmless && Math.abs(e.x - p.x) < WARD.threat && Math.abs(e.y - p.y) < 60)
    || api.seeds.some(s => !s.dead && !s.reflected && Math.hypot(s.x - p.x, s.y - p.y) < WARD.threat);
  const ready = p => !p.fwUp && !(p.fwCd > 0) && !(p.fwRec > 0) && !p.dead;

  /* THE PRESS (main.js, the frame C goes down, when the bar is not full): up, or a hiss in water. Returns true when it rose */
  function raise() {
    const p = P(); if (!ready(p) || p.swim || p.climb || p.cling) return false;
    if (wet(p)) { stats.doused++; api.SFX.hiss(); api.smoke(p.x, p.y - 8, 4, 8); return false; }
    p.fwUp = true; p.fwT = 0; p.fwDid = false; p.fwHit = new Set(); stats.wards++;
    api.SFX.emberBurst(); api.ringAt(p.x, p.y - 8, 10, '#fff6c8', 0.14);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; api.parts.push({ fire: true, x: p.x + Math.cos(a) * 6, y: p.y - 8 + Math.sin(a) * 6, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, life: 0.2, max: 0.2, col: i % 2 ? '#ffd36b' : '#ff9a5c', size: 1, grav: 0 }); }
    return true;
  }
  /* THE HOLD REACHED WARD.fold: the ward goes into the ball - no mistime, the usual cooldown */
  function fold() { const p = P(); if (!p.fwUp) return; p.fwUp = false; p.fwT = 0; p.fwCd = WARD.cd; stats.folded++; }
  function end(p, cd) { p.fwUp = false; p.fwT = 0; p.fwCd = cd; }

  /* EVERY FRAME (main.js updatePlayer's pyro block) */
  function update(dt, { stunned }) {
    const p = P();
    p.fwCd = Math.max(0, (p.fwCd || 0) - (p.fwUp ? 0 : dt)); p.fwRec = Math.max(0, (p.fwRec || 0) - dt); p.fwFlash = Math.max(0, (p.fwFlash || 0) - dt); p.fwFizz = Math.max(0, (p.fwFizz || 0) - dt);
    if (p.fwUp && (p.dead || stunned || p.swim || p.climb)) { end(p, WARD.cd); return; }
    if (p.fwUp && wet(p)) { stats.doused++; api.SFX.hiss(); api.smoke(p.x, p.y - 8, 6, 10); end(p, WARD.cd); return; }
    if (p.fwUp) {
      p.fwT += dt; if (p.ground) p.vx = 0;   /* planted while it burns (a fold into the ball lets her walk, slowly) */
      contact(p);
      if (p.fwT >= WARD.t) { const did = p.fwDid; end(p, WARD.cd); if (!did && threatened(p)) mistime(p); }
    }
    if (p.fwRec > 0) { p.vx = 0; p.rootT = Math.max(p.rootT || 0, 0.05);
      if (Math.random() < dt * 16) api.parts.push({ x: p.x + (Math.random() - 0.5) * 8, y: p.y - 14 - Math.random() * 4, vx: (Math.random() - 0.5) * 8, vy: -22, life: 0.4, max: 0.4, col: '#8a8480', size: 1, grav: -10 }); }
  }
  /* CONTACT: every foe touching the dome, once a ward - burned, marked, a short heavy-ish freeze (api.fire is main.js's hurtFire: the blow, the mark, the class) */
  function contact(p) {
    for (const e of api.enemies) {
      if (!e.alive || e.harmless || p.fwHit.has(e)) continue;
      const dx = Math.abs(e.x - p.x) - (e.w || 12) / 2, dy = Math.abs((e.y - (e.h || 16) / 2) - (p.y - 8)) - (e.h || 16) / 2;
      if (dx > WARD.R || dy > WARD.R * 0.6) continue;
      p.fwHit.add(e); p.fwDid = true; stats.contacts++;
      api.fire(e, Math.max(1, Math.round(api.swordDmg() * WARD.contactK * api.heatMul())), p.x, { burn: WARD.burn, cls: 'light' });
      api.hitstop(WARD.stopContact); api.flame(e.x, e.y - (e.h || 16) / 2, 6, 6, 60, 2); api.sparks(e.x - Math.sign(e.x - p.x) * (e.w || 12) / 2, e.y - (e.h || 16) / 2, Math.sign(e.x - p.x) || p.face, 5);
    }
  }
  function mistime(p) { stats.fizzled++; p.fwRec = WARD.rec; p.fwFizz = 0.4; p.vx = 0; api.SFX.emberFizzle(); api.smoke(p.x, p.y - 10, 5, 8); api.ringAt(p.x, p.y - 8, WARD.R - 8, '#8a8480', 0.25); }

  /* THE PARRY: in the first WARD.perfect */
  function parry(p, f) {
    end(p, WARD.spent); p.fwDid = true; p.fwFlash = 0.3; p.fwParryAt = api.time; stats.parries++;
    api.SFX.wardParry(); api.hitstop(WARD.stopParry); api.zoomKick(1.05, 0.18); api.shakeCam(2.5, -p.face * 2);
    api.ringAt(p.x, p.y - 8, WARD.R + 12, '#ffffff', 0.3); api.ringAt(p.x, p.y - 8, WARD.R + 2, '#ff9a5c', 0.26); api.flame(p.x, p.y - 8, 12, 12, 90, 2);
    api.streaks(p.x + p.face * 8, p.y - 9, 10, ['#ffffff', '#fff6c8', '#ffd36b'], 220); api.number(p.x, p.y - 28, 'PARRY', '#ffd36b'); api.flash(0.03);
    api.noteParry(); if (api.parried) api.parried(f);   /* the shared parry -> riposte */
    api.gainHeat(WARD.heatParry);
    if (f && f.alive) { f.burn = Math.max(f.burn || 0, WARD.burn); f.heatOwner = p; f.flash = 0.18; api.mark(f); api.flame(f.x, f.y - (f.h || 12) / 2, 10, 6, 70, 2); }
  }
  /* THE BLOCK: later in the ward. 'blocked', or 'broken' (too little stamina: half comes through) */
  function block(p, f, dmg) {
    p.fwDid = true; const cost = api.blockCost(dmg);
    if (p.st < cost) { stats.broken++; p.st = 0; p.stFlash = 0.5; end(p, WARD.cd); api.SFX.guardBreak(); api.number(p.x, p.y - 22, 'WARD BROKEN', '#ffd36b'); api.hitstop(0.08); return 'broken'; }
    p.st -= cost; p.stDelay = api.stDelay; stats.blocks++;
    api.SFX.wardBlock(); api.hitstop(0.05); api.ringAt(p.x, p.y - 8, WARD.R, '#ff9a5c', 0.22); api.sparks(p.x + (Math.sign((f ? f.x : p.x + p.face) - p.x) || p.face) * 12, p.y - 8, Math.sign((f ? f.x : p.x + p.face) - p.x) || p.face, 7);
    api.gainHeat(WARD.heatBlock);
    if (f && f.alive) { f.burn = Math.max(f.burn || 0, WARD.burn * 0.6); f.heatOwner = p; api.mark(f); }
    return 'blocked';
  }
  /* A BLOW ON THE WARD (damagePlayer0, before the duck). 'blocked', 'broken' (the ward broke: the caller halves the blow), or null (it lands) */
  function takes(fromX, dmg, unblockable, who, pierce) {
    const p = P(); if (!p.fwUp) return null;
    if (unblockable || pierce) { stats.through++; return null; }   /* RED: as every guard, it breaks through */
    const f = foeOf(who, fromX);
    if (p.fwT <= WARD.perfect) { parry(p, f); return 'blocked'; }
    return block(p, f, dmg);
  }
  /* WHAT FLIES INTO THE WARD: a yellow projectile melts (a block's heat); a chain or a red one goes on to her body. A parry-beat melt is the parry */
  function catchSeeds() {
    const p = P(); if (!p.fwUp) return;
    for (const s of api.seeds) {
      if (s.dead || s.reflected || s.chain || s.noBlock || s.unblockable) continue;
      if (Math.hypot(s.x - p.x, s.y - (p.y - 8)) > WARD.R + 2) continue;
      if (api.burnHome && api.burnHome(s)) { parry(p, null); return; }   /* (claude/moorpyro) THE WINDCALLER's bolt is set alight and flies home */
      s.dead = true; stats.melted++; p.fwDid = true; api.SFX.emberMelt(); api.burst(s.x, s.y, 5, ['#ff9a5c', '#ffd36b', '#fff6c8'], 40, 0.3, -40, 1); api.smoke(s.x, s.y, 2, 3);
      if (p.fwT <= WARD.perfect) { parry(p, null); return; }
      api.gainHeat(WARD.heatBlock); api.ringAt(p.x, p.y - 8, WARD.R, '#ff9a5c', 0.18);
    }
  }
  const exposed = () => ((P().fwRec || 0) > 0 ? WARD.exposed : 1);

  /* DRAWN (greybox until the art pass: scratch/lane-reports/pyrokit.md ART). THE WARD: a dome that blooms white-hot in its parry beat (a bright rim
     while wardT <= perfect: the beat can be SEEN), then an orange shell with licks of flame, a red rim as it dies. A PARRY: a white flash ring.
     THE MISTIME: grey smoke ring and a grey bar over her head. THE COOLDOWN: a small ember pip under her feet that fills back. */
  function draw(g, cx, cy) {
    const p = P(); if (p.dead) return;
    const x = Math.round(p.x - cx), y = Math.round(p.y - cy) - 8, t = api.time, fl = (p.fwFlash || 0) / 0.3;
    if (p.fwUp) {
      const k = Math.min(1, p.fwT / WARD.t), beat = p.fwT <= WARD.perfect, R = Math.round(8 + (WARD.R - 8) * Math.min(1, p.fwT / 0.08));
      const body = beat ? '#ffd36b' : k < 0.7 ? '#ff9a5c' : '#d8481c', rim = beat ? '#ffffff' : k < 0.7 ? '#ffd36b' : '#ff6b2c';
      g.globalAlpha = 0.36 - 0.16 * k; g.fillStyle = body; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
      g.globalAlpha = beat ? 0.6 : 0.3; g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(x, y, Math.max(2, Math.round(R * 0.35)), 0, Math.PI * 2); g.fill();
      const N = 32;
      for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, lick = !beat && Math.sin(t * 41 + i * 2.1) > 0.2 ? 2 : 0, px = Math.round(x + Math.cos(a) * (R + lick)), py = Math.round(y + Math.sin(a) * (R + lick));
        g.globalAlpha = 0.95; g.fillStyle = rim; g.fillRect(px, py, 1, 1); if (lick) { g.globalAlpha = 0.6; g.fillStyle = body; g.fillRect(px, py - 1, 1, 1); } }
      g.globalAlpha = 1;
    }
    if (fl > 0) { const R = Math.round(WARD.R + 12 * (1 - fl)); g.globalAlpha = 0.45 * fl; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
      g.globalAlpha = fl; g.strokeStyle = '#fff6c8'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if ((p.fwFizz || 0) > 0) { const k = p.fwFizz / 0.4; g.globalAlpha = 0.6 * k; g.strokeStyle = '#8a8480'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, Math.round(WARD.R - 8 + 4 * (1 - k)), 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if ((p.fwRec || 0) > 0) { const w = 14, bx = x - 7, by = y - 24, f = p.fwRec / WARD.rec;
      g.fillStyle = '#1a0a04'; g.fillRect(bx - 1, by - 1, w + 2, 4); g.fillStyle = '#3a3430'; g.fillRect(bx, by, w, 2); g.fillStyle = '#8a8480'; g.fillRect(bx, by, Math.max(1, Math.round(w * f)), 2); }
    else if ((p.fwCd || 0) > 0 && !p.fwUp) { const f = 1 - Math.min(1, p.fwCd / WARD.cd); g.fillStyle = '#3a2016'; g.fillRect(x - 4, y + 10, 8, 1); g.fillStyle = '#ff9a5c'; g.fillRect(x - 4, y + 10, Math.max(1, Math.round(8 * f)), 1); }
  }

  /* FOR THE TOOLS (BK.ward) */
  const read = () => { const p = P(); return { up: !!p.fwUp, t: p.fwT || 0, cd: p.fwCd || 0, rec: p.fwRec || 0, ready: ready(p), wet: wet(p), flash: p.fwFlash || 0, parryAt: p.fwParryAt ?? null, perfect: WARD.perfect, len: WARD.t, stats: { ...stats } }; };
  return { raise, fold, update, takes, catchSeeds, exposed, draw, read, ready: () => ready(P()), resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
