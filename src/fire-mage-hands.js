// src/fire-mage-hands.js - THE GOBLIN FIRE MAGE'S HANDS (claude/pyroboss2). src/fire-mage.js is the rules (pure); this binds them to the game: the
// FIRE BOLT in flight (a lobbed arc; a shield takes it, the pyromancer's ward melts it), THE BURNING PATCH where it lands (it burns foes and heroes,
// lights the village's fire grid, runs along grass), THE WATER (a thrown bucket or jug on him or on a patch, the POUR, wading in), and the drawing
// (the bolt, the patches, the ward dome, the steam). main.js updateGobMage runs his modes and calls: lob, douse, wet, pourable, update, drawWorld,
// drawOver, read, reset, onBucket. Every teaching line goes through ctx.number with a line listed in src/fire-mage.js FM_SAY.
import { FM, isFireMage, newPatch, patchStep, lobVel, lobTime } from './fire-mage.js';
import { drawPatch } from './redraw/desert_foes2.js';

export function makeFireMageHands(ctx) {
  let M = null;
  const H = {};
  const R = Math.round;
  const once = k => { if (M.said[k]) return false; M.said[k] = 1; return true; };
  H.reset = () => { const L = ctx.L; if (!L) { M = null; return; }
    const keep = M && M.L === L ? M.said : {};
    M = { L, said: keep, bolts: [], patches: [], n: { lobs: 0, patches: 0, hops: 0, grid: 0, doused: 0, patchOut: 0, wards: 0, turned: 0, patchFoe: 0, patchHero: 0, boltHit: 0, melted: 0 } };
    if (window.BK) Object.assign(window.BK, { fireMages: () => M, fireMageHands: () => H }); };
  H.on = () => !!M;
  const TS = () => ctx.TS;
  /* the floor under a point (a solid or a one-way top), or null */
  const groundY = (x, y) => { const ts = TS(); let ty = Math.floor((y - 2) / ts); for (let k = 0; k < 10; k++, ty++) if (ctx.standable(Math.floor(x / ts), ty)) return ty * ts; return null; };
  const wetAt = (x, y) => (ctx.L.pools || []).some(q => !q.dry && x > q.x0 && x < q.x1 && y > q.y - 4 && (q.bottom === undefined || y <= q.bottom + 6));
  const grassy = () => ctx.grassy();
  const indoors = (tx, ty) => (ctx.L.interiors || []).some(([x0, x1, y0, y1]) => tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1);

  /* HE LOOSES THE FIRE BOLT: lobbed at where you stand */
  H.lob = (e, tx, ty) => { if (!M) return;
    const sx = e.x + (e.face || 1) * 9, sy = e.y - 18, T = lobTime(tx - sx), v = lobVel(sx, sy, tx, ty - 4, FM.lobG, T);
    M.bolts.push({ x: sx, y: sy, vx: v.vx, vy: v.vy, owner: e, t: 0, life: T + 1.2 }); M.n.lobs++;
    ctx.sfx.mageBolt && ctx.sfx.mageBolt(); ctx.sfx.emberBurst && ctx.sfx.emberBurst(); };
  /* A PATCH LIGHTS where a bolt lands: in the village it is the grid's fire (it spreads along what burns), elsewhere a patch of its own */
  function light(x, y, gen) {
    if (wetAt(x, y)) { ctx.burst(x, y - 4, 6, ['#e8f6ff', '#9a9aa4'], 40, 0.4); ctx.sfx.hiss && ctx.sfx.hiss(); return; }   /* into water: it goes out */
    const G = ctx.VG(); if (G && ctx.igniteAt(x, y)) { M.n.grid++; }
    if (M.patches.some(p => !p.out && Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 8)) return;
    M.patches.push(newPatch(x, y, gen)); M.n.patches++;
    ctx.burst(x, y - 6, 12, ['#ff8a2a', '#ffd36b', '#c8281e'], 70, 0.6);
  }
  /* WATER ON HIM (a thrown bucket or jug, the POUR, wading in): his staff goes out - helpless, DOUSED */
  H.douse = e => { if (!M || !isFireMage(e) || !e.alive) return false;
    e.mode = 'doused'; e.modeT = FM.douse.t; e.vx = 0; e.wardT = 0; M.n.doused++;
    ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(e.x, e.y - 14, 14, ['#e8f6ff', '#9a9aa4', '#7ab8e8'], 50, 0.8);
    ctx.number(e.x, e.y - (e.h || 16) - 14, 'DOUSED', '#9ad0ff'); return true; };
  /* water landing at (x, y): every patch within r px goes out */
  H.splash = (x, y, r = 26) => { if (!M) return 0; let n = 0; for (const p of M.patches) if (!p.out && Math.abs(p.x - x) < r && Math.abs(p.y - y) < 24) { p.out = true; n++; }
    if (n) { M.n.patchOut += n; ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(x, y - 6, 10, ['#e8f4f8', '#9aa39a'], 50, 0.6); } return n; };
  /* is there a lit patch here a bucket would land on (main.js bucketTargets) */
  H.patchAt = (x, y) => M ? M.patches.find(p => !p.out && Math.abs(p.x - x) < 16 && Math.abs(p.y - y) < 20) || null : null;
  /* THE POUR (the desert's water skin - the cinder acolyte's road): the near mage or patch in front of you */
  const pourTarget = P => { if (!M) return null; const f = P.face || 1;
    const mage = ctx.enemies().find(e => e.alive && isFireMage(e) && e.mode !== 'doused' && (e.x - P.x) * f > -6 && (e.x - P.x) * f < 56 && Math.abs(e.y - P.y) < 26);
    if (mage) return { mage, x: mage.x, y: mage.y - 10 };
    const p = M.patches.find(q => !q.out && (q.x - P.x) * f > -10 && (q.x - P.x) * f < 56 && Math.abs(q.y - P.y) < 20); return p ? { patch: p, x: p.x, y: p.y - 5 } : null; };
  H.pourable = {
    aim: P => { const t = pourTarget(P); return t ? { x: t.x, y: t.y } : null; },
    pour: P => { const t = pourTarget(P); if (!t) return false; if (t.mage) H.douse(t.mage); else { t.patch.out = true; M.n.patchOut++; ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(t.x, t.y, 10, ['#e8f4f8', '#9aa39a'], 50, 0.6); } return true; } };

  H.update = dt => {
    if (!M) return;
    const P0 = ctx.hero(), heroes = ctx.players.filter(pp => !pp.dead), foes = ctx.enemies().filter(e => e.alive && !e.harmless && !isFireMage(e));
    /* THE BOLTS IN FLIGHT */
    for (const b of M.bolts) { if (b.dead) continue; b.t += dt; b.vy += FM.lobG * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (Math.random() < dt * 30) ctx.parts.push({ x: b.x, y: b.y, vx: -b.vx * 0.1, vy: -20, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: 1, grav: -20 });
      let hit = null; for (const q of heroes) if (Math.abs(q.x - b.x) < 6 + FM.lobR && b.y > q.y - 18 - FM.lobR && b.y < q.y + FM.lobR) { hit = q; break; }
      if (hit) { b.dead = true;
        if (hit.fwUp) { M.n.melted++; ctx.sfx.emberMelt && ctx.sfx.emberMelt(); ctx.burst(b.x, b.y, 5, ['#ff9a5c', '#ffd36b'], 40, 0.3); continue; }   /* the pyromancer's ward melts it */
        M.n.boltHit++; ctx.asPlayer(hit, () => ctx.hurtHero(b.x, FM.lobDmg, { who: b.owner, name: 'THE FIRE BOLT' }));
        const gy = groundY(b.x, Math.max(b.y, hit.y - 8)); if (gy !== null && gy - hit.y < 40) light(b.x, gy, 0); continue; }   /* it bursts on you and the ground under you catches */
      const tx = Math.floor(b.x / TS()), ty = Math.floor((b.y + 2) / TS());
      if (b.vy > 0 && ctx.standable(tx, ty) && b.y + 2 >= ty * TS()) { b.dead = true; light(b.x, ty * TS(), 0); continue; }
      if (ctx.solid(Math.floor((b.x + Math.sign(b.vx || 1) * 3) / TS()), Math.floor(b.y / TS()))) { b.dead = true; const gy = groundY(b.x - Math.sign(b.vx || 1) * 6, b.y); if (gy !== null) light(b.x - Math.sign(b.vx || 1) * 6, gy, 0); continue; }
      if (b.t > b.life || b.y > ctx.L.H * TS()) b.dead = true; }
    M.bolts = M.bolts.filter(b => !b.dead);
    /* THE PATCHES: they burn what stands in them, and on open grass they run a tile each way */
    for (const f of M.patches) { const r = patchStep(f, foes, heroes.map(q => ({ x: q.x, y: q.y, w: q.w || 10, pp: q })), dt);
      for (const e of r.foes) { M.n.patchFoe++; ctx.hurtFoe(e, FM.patch.foe, f.x); }
      for (const q of r.heroes) ctx.asPlayer(q.pp, () => { M.n.patchHero++; ctx.hurtHero(ctx.hero().x, FM.patch.hero, { unblockable: true, noKnock: true, name: 'HIS FIRE' }); });
      if (r.hop && !ctx.VG() && grassy()) for (const dx of [-1, 1]) { const nx = f.x + dx * TS(), tx = Math.floor(nx / TS()), gy = Math.floor(f.y / TS());
        if (ctx.solid(tx, gy) && !ctx.solid(tx, gy - 1) && !indoors(tx, gy - 1) && !wetAt(nx, f.y) && !M.patches.some(q => !q.out && Math.abs(q.x - nx) < 8 && Math.abs(q.y - f.y) < 8)) {
          M.patches.push(newPatch(nx, f.y, f.gen + 1)); M.n.hops++; if (P0 && once('grass') && Math.abs(f.x - P0.x) < 200) ctx.number(f.x, f.y - 24, 'HIS FIRE CATCHES ON THE GRASS', '#ff9a5c'); } } }
    M.patches = M.patches.filter(f => !f.out);
    /* WADING IN puts his staff out; and THE FIRST SIGHT of him says what water does */
    for (const e of ctx.enemies()) { if (!e.alive || !isFireMage(e)) continue;
      if (e.mode !== 'doused' && wetAt(e.x, e.y)) H.douse(e);
      if (P0 && Math.abs(e.x - P0.x) < 170 && Math.abs(e.y - P0.y) < 90) { ctx.seen(e.cnSkin); if (once('first')) ctx.number(e.x, e.y - 40, 'GOBLIN FIRE MAGE: WATER PUTS HIS STAFF OUT', '#ff9a5c'); } }
  };
  /* DRAWING: the patches on the floor, the bolts in flight (drawWorld); his dome and his steam over him (drawOver) */
  H.drawWorld = (g, cx, cy, time) => { if (!M) return; const vw = ctx.VW(), on = x => x > cx - 60 && x < cx + vw + 60;
    for (const f of M.patches) if (on(f.x)) drawPatch(g, f.x - cx, f.y - cy, f.t / f.life, time, FM.patch.w);
    for (const b of M.bolts) { if (!on(b.x)) continue; const x = R(b.x - cx), y = R(b.y - cy), fl = Math.floor(time * 14) % 2;
      g.globalAlpha = 0.35; g.fillStyle = '#ff6b2c'; g.beginPath(); g.arc(x, y, FM.lobR + 3, 0, 7); g.fill(); g.globalAlpha = 1;
      g.fillStyle = '#1a0a04'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#ff6b2c'; g.fillRect(x - 2, y - 3, 4, 6); g.fillRect(x - 3, y - 2, 6, 4); g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 2, 2 + fl, 3); g.fillStyle = '#fff6c8'; g.fillRect(x, y - 1, 1, 1); } };
  H.drawOver = (g, e, cx, cy, time) => { const x = R(e.x - cx), y = R(e.y - cy) - 9;
    if (e.mode === 'flameWard') { const gut = e.modeT <= FM.ward.gutter, k = 1 - Math.max(0, e.modeT) / FM.ward.t, r = 13 + Math.min(1, k * 6) * 3;
      g.globalAlpha = gut ? 0.18 + 0.12 * Math.sin(time * 40) : 0.3; g.fillStyle = gut ? '#c8281e' : '#ff9a5c'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      g.globalAlpha = gut ? 0.5 : 0.9; g.strokeStyle = gut ? '#ff6b2c' : '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (e.mode === 'doused') { for (let q = 0; q < 3; q++) { const k2 = (time * 0.9 + q / 3) % 1; g.globalAlpha = 0.6 * (1 - k2); g.fillStyle = '#d8dce4'; g.fillRect(x - 4 + q * 4 + R(Math.sin(time * 3 + q) * 2), y - 10 - R(k2 * 14), 2, 2); } g.globalAlpha = 1; }   /* the steam off his dead staff */
    if (e.mode === 'spent') { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.beginPath(); g.ellipse(x, y + 9, 9, 3, 0, 0, 7); g.stroke(); g.globalAlpha = 1; } };   /* SPENT: the gold ring of an opening (B10) */
  H.light = (x, y) => { if (M) light(x, y, 0); };   /* (tools/fire-mage.mjs: a patch put down where a bolt would land) */
  H.read = () => M && { n: { ...M.n }, bolts: M.bolts.length, patches: M.patches.map(p => ({ x: R(p.x), y: R(p.y), gen: p.gen, t: +p.t.toFixed(2) })) };
  return H;
}
