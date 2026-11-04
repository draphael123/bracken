// src/gqueen-hands.js - THE GOBLIN QUEEN 3's HANDS (claude/gqueen3, scratch/plan-goblinqueen3-1104.md; modelled on src/gorm-hands.js: P1 -> flee -> P2 persists across death).
// main.js owns the world and her mode machine (updateGQueen); this file owns what is NEW:
//   - her CROWN and her PORTAL ROCK SHARDS, in their OWN arrays (never `seeds`: the pyro's ember ward, the pirate's hook catch and the ranger's snatch eat seeds)
//   - the PARRY of either one: gqHit() asks damagePlayer and reads the shared parry counter (RP.stats.parries), so every hero's beat path covers it
//   - STUNNED (the main opening), the flee, the escape up the burning hall, the portal step and phase two on THE TOWER TOP (later commits)
// Starting numbers are the plan's (tune lane next week). Art = placeholders (frames 2/6/7/15/16 until the art lane).
export const GQ3 = {
  stunGuard: 1.5, stunRoof: 3.0,       // s after a stun in which no second stun can land (no stunlock, B12); the stun a parry gives on the tower top
  crown: { cd: 7, cd2: 5.5, tell: 0.8, out: 230, reach: 210, hang: 0.15, back: 260, dmg: 16, home: 340, stun: 3.5, stunHp: 0.04, fetch: 1.2, dy: 14, r: 5 },
  portal: { cd: 8, cd2: 6, tell: 1.0, n: 2, n2: 3, glow: 0.9, gap: 0.35, fan: 3, spread: 14, v: 210, dmg: 10, minDist: 90, home: 320, stun: 2.2, stunHp: 0.03, clankHp: 0.01, rows: [12, 13, 14, 15, 16], r: 4 },
};
export const GQ_SAY = { crowned: 'CROWNED', clank: 'CLANK', fetch: 'SHE FETCHES HER CROWN' };

export function makeGQueenHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  const q = () => { const b = ctx.boss(); return b && b.t === 'gqueen' && b.alive ? b : null; };
  const now = () => ctx.time();
  const sfx = k => { const f = ctx.sfx[k]; if (f) f(); };
  const sign = v => (v < 0 ? -1 : 1);
  const G = GQ3;
  H.on = () => !!(L() && L().arena && L().arena.boss === 'gqueen');
  H.load = () => { S = null; };
  H.reset = () => { if (!H.on()) { S = null; return; } S = fresh(); };
  const fresh = () => ({ crown: null, rocks: [], portals: [], cast: null, stunUntil: 0, stunGuardUntil: 0, stuns: 0, said: new Set() });

  /* ONE DOOR for every blow of hers that can be parried: a yellow, blockable damagePlayer, and the answer is whether the shared parry counter moved.
     (Every hero's beat path - the knight's raised shield, the warden's deflect, the pyro's ward, the pirate's catch - calls RP.parried, so all nine are covered with no per-hero code.)
     Never `unblockable`, never `pierce`: a red or a piercing blow is TOO STRONG and is never parried. */
  function gqHit(x, dmg, who, name) {
    const n0 = ctx.parries();
    const r = ctx.damage(x, dmg, { who, name });
    return { res: r, parried: ctx.parries() > n0 };
  }
  H.hit = gqHit;

  /* ---------------- STUNNED: the main opening ---------------- */
  /* A parry on her crown (or a portal shard) stuns her. One stun at a time, and a guard after it so a bot that parries every beat cannot stunlock her (B12). true = it stunned. */
  function stun(e, dur, pct, say) {
    if (!e || !e.alive || e.mode === 'stunned' || now() < S.stunGuardUntil) return false;
    e.mode = 'stunned'; e.modeT = dur; e.vx = 0; e.crownOut = false;
    S.stunGuardUntil = now() + dur + G.stunGuard; S.stunUntil = now() + dur; S.stuns = (S.stuns || 0) + 1;
    if (S.cast) S.cast.stunned = true;
    e.hp -= Math.round(e.maxHp * pct); e.flash = 0.4;
    ctx.number(e.x, e.y - 70, say || GQ_SAY.crowned, '#ffd36b'); ctx.ring(e.x, e.y - 40, 34, '#ffd36b', 0.4);
    ctx.burst(e.x, e.y - 52, 14, ['#ffd36b', '#fff6c8', '#e0b040'], 90, 0.7); sfx('golemShatter'); ctx.shake(6); ctx.zoom(1.08, 0.3);
    if (e.hp <= 0) ctx.hurt(e, 1, e.x);   /* the stun that empties her bar: the blow's own gate (spare / death) takes it */
    return true;
  }
  H.stun = stun;

  /* ---------------- THE CROWN (her boomerang) ---------------- */
  /* tell 0.8 s (the crown lifted, a glint, the caller's chant), then a boomerang at chest height: out 230 px/s to 210 px or a wall, a breath, back 260 px/s. Blockable; duck, jump or roll it.
     PARRIED on either pass: it flies home at 340 px/s and she is STUNNED. A plain block only knocks it to the floor: she walks to fetch it (bare-headed, not open). */
  function launchCrown(e, P0) {
    const c = G.crown, dir = sign(P0.x - e.x);
    e.face = dir; e.crownOut = true;
    S.crown = { x: e.x + dir * 24, y: P0.y - c.dy, x0: e.x + dir * 24, vx: dir * c.out, dir, state: 'out', t: 0, hit: false, pass: 1, home: false };
    sfx('throwWhoosh');
  }
  function crownStep(dt) {
    const c = S.crown, e = q(), P0 = ctx.P(), cc = G.crown;
    if (!c) return;
    if (!e) { S.crown = null; return; }
    c.t += dt; c.spin = (c.spin || 0) + dt * 14;
    if (Math.random() < dt * 30) ctx.part({ x: c.x, y: c.y, vx: 0, vy: 0, life: 0.25, max: 0.25, col: '#ffd36b', size: 1, grav: 0, glow: true });
    if (c.state === 'out') {
      c.x += c.vx * dt;
      if (Math.abs(c.x - c.x0) >= cc.reach || ctx.solid(Math.floor((c.x + c.dir * 6) / TS), Math.floor(c.y / TS))) { c.state = 'hang'; c.t = 0; c.vx = 0; }
    } else if (c.state === 'hang') {
      if (c.t >= cc.hang) { c.state = 'back'; c.vx = -c.dir * cc.back; c.hit = false; c.pass = 2; sfx('throwWhoosh'); }
    } else if (c.state === 'back') {
      c.x += c.vx * dt;
      if (Math.abs(c.x - e.x) < 16 || (c.x - e.x) * c.dir < 0) { S.crown = null; e.crownOut = false; ctx.ring(e.x, e.y - 52, 18, '#e0b040', 0.25); sfx('clank'); return; }
    } else if (c.state === 'home') {
      const dx = e.x - c.x, dy = (e.y - 52) - c.y, dd = Math.hypot(dx, dy) || 1, sp = cc.home * dt;
      if (dd <= sp + 10) { S.crown = null; e.crownOut = false; stun(e, e.stage === 'roof' ? G.stunRoof : cc.stun, cc.stunHp, GQ_SAY.crowned); return; }
      c.x += dx / dd * sp; c.y += dy / dd * sp;
    } else if (c.state === 'floor') {
      return;
    }
    if ((c.state === 'out' || c.state === 'back') && !c.hit && !P0.dead) {
      const hb = ctx.hurtBox();
      if (ctx.overlap({ l: c.x - cc.r - 1, r: c.x + cc.r + 1, t: c.y - cc.r + 1, b: c.y + cc.r - 1 }, hb)) {
        c.hit = true;
        const h = gqHit(c.x - sign(c.vx) * 12, cc.dmg, e, 'HER CROWN');
        if (h.parried) {
          if (now() < S.stunGuardUntil || e.mode === 'stunned') { ctx.number(P0.x, P0.y - 34, GQ_SAY.clank, '#ffd36b'); S.crown = null; e.crownOut = false; sfx('clank'); }
          else { c.state = 'home'; c.home = true; ctx.ring(c.x, c.y, 16, '#fff6c8', 0.3); sfx('clank'); }
        } else if (h.res === 'blocked') { c.state = 'floor'; c.vx = 0; c.y = Math.min(c.y + 10, (L().arena ? L().arena.floor : c.y) - 3); c.t = 0; sfx('clank'); ctx.dust(c.x, c.y, 6); ctx.number(c.x, c.y - 14, GQ_SAY.clank, '#c9c9d6'); }
      }
    }
  }
  /* she is bare-headed and only walks (no other attack) until the crown is back on: the fetch after a plain block */
  function fetchStep(e) {
    const c = S.crown;
    if (!c) { e.mode = 'rec'; e.modeT = 0.5; e.crownOut = false; return 0; }
    e.face = sign(c.x - e.x);
    if (Math.abs(c.x - e.x) < 18 && c.t >= G.crown.fetch) { S.crown = null; e.crownOut = false; e.mode = 'rec'; e.modeT = 0.6; ctx.ring(e.x, e.y - 52, 18, '#e0b040', 0.25); sfx('clank'); return 0; }
    return Math.abs(c.x - e.x) < 18 ? 0 : e.face * 90;
  }

  /* ---------------- HER MODES (called from main.js updateGQueen's switch: returns the walk speed she wants, or undefined = not mine) ---------------- */
  H.mode = (e, dt) => {
    if (!S) return undefined;
    const P0 = ctx.P();
    switch (e.mode) {
      case 'crownTossTell':
        e.face = sign(P0.x - e.x) || e.face;
        if (Math.random() < dt * 24) ctx.part({ x: e.x + e.face * 6 + (Math.random() - 0.5) * 14, y: e.y - 58 - Math.random() * 8, vx: 0, vy: -26, life: 0.35, max: 0.35, col: '#fff6c8', size: 1, grav: 0, glow: true });
        if (e.modeT <= 0) { launchCrown(e, P0); e.mode = 'crownToss'; e.modeT = 6; }
        return 0;
      case 'crownToss':
        if (!S.crown) { e.mode = 'rec'; e.modeT = 0.5; e.crownOut = false; }
        else if (S.crown.state === 'floor') { e.mode = 'crownFetch'; e.modeT = 4; ctx.number(e.x, e.y - 70, GQ_SAY.fetch, '#c9c9d6'); }
        else if (e.modeT <= 0) { S.crown = null; e.crownOut = false; e.mode = 'rec'; e.modeT = 0.5; }
        return 0;
      case 'crownFetch': return fetchStep(e);
      case 'stunned':
        e.vx = 0;
        if (Math.random() < dt * 12) ctx.part({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 60 - Math.random() * 8, vx: 0, vy: -16, life: 0.5, max: 0.5, col: '#ffd36b', size: 2, grav: 0, glow: true });
        if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; ctx.shake(3); sfx('bellow'); }
        return 0;
    }
    return undefined;
  };
  /* her choice, called from 'stand' when she is free to act: true = it set her mode */
  H.choose = (e, ad) => {
    if (!S || e.crownOut || (e.stage && e.stage !== 'hall')) return false;
    const p2 = e.phase >= 2;
    if ((e.crownCd ?? 3) <= 0 && ad > 60) {
      e.crownCd = p2 ? G.crown.cd2 : G.crown.cd; e.mode = 'crownTossTell'; e.modeT = G.crown.tell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('callerChant'); return true;
    }
    return false;
  };
  H.tick = (e, dt) => { if (!S) return; e.crownCd = (e.crownCd ?? 3) - dt; };

  /* ---------------- PER FRAME ---------------- */
  H.update = dt => {
    if (!S) return;
    if (!ctx.bossActive() || !q()) { S.crown = null; return; }
    crownStep(dt);
  };

  /* ---------------- DRAW ---------------- */
  H.drawWorld = (g, cx, cy, t) => {
    if (!S) return;
    const c = S.crown;
    if (c) {
      const x = Math.round(c.x - cx), y = Math.round(c.y - cy);
      g.save(); g.translate(x, y); g.rotate(c.state === 'floor' ? 0.4 : c.spin || 0);
      g.fillStyle = c.home ? '#fff6c8' : '#e0b040'; g.fillRect(-5, 0, 10, 3);
      g.beginPath(); g.moveTo(-5, 0); g.lineTo(-5, -4); g.lineTo(-2, -1); g.lineTo(0, -5); g.lineTo(2, -1); g.lineTo(5, -4); g.lineTo(5, 0); g.fill();
      g.fillStyle = '#c9463d'; g.fillRect(-1, 0, 2, 2); g.restore();
    }
    const e = q();
    if (e && e.mode === 'stunned') { for (let k = 0; k < 3; k++) { const a = t * 4 + k * 2.09; g.fillStyle = '#ffd36b'; g.fillRect(Math.round(e.x - cx + Math.cos(a) * 16), Math.round(e.y - 64 - cy + Math.sin(a) * 4), 2, 2); } }
    if (e && e.mode === 'crownTossTell') { const k = 0.5 + 0.5 * Math.sin(t * 30); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#fff6c8'; g.fillRect(Math.round(e.x - cx + e.face * 6) - 1, Math.round(e.y - 60 - cy), 3, 3); g.globalAlpha = 1; }
  };

  /* ---------------- TOOLS / BOT ---------------- */
  H.shots = () => {
    if (!S) return [];
    const out = [];
    if (S.crown && S.crown.state !== 'floor') out.push({ x: S.crown.x, y: S.crown.y, vx: S.crown.vx, vy: 0, kind: 'crown', home: !!S.crown.home });
    for (const r of S.rocks) if (!r.dead) out.push({ x: r.x, y: r.y, vx: r.vx, vy: r.vy, kind: 'rock', home: !!r.home });
    return out;
  };
  H.stage = () => { const e = q(); return e && e.stage ? e.stage : 'hall'; };
  H.portals = () => (S ? S.portals.map(p => ({ x: p.x, y: p.y, state: p.state })) : []);
  H.read = () => S ? { crown: S.crown ? { ...S.crown } : null, rocks: S.rocks.length, portals: S.portals.length, stunUntil: S.stunUntil, stuns: S.stuns } : null;
  H.test = { toss: () => { const e = q(); if (e && S) { e.mode = 'crownTossTell'; e.modeT = 0.01; } }, stun: (d, p) => stun(q(), d, p || 0) };
  return H;
}
