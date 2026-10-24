// src/village-hands.js - THE BURNING VILLAGE 3 (claude/burning3, Daniel 10-23: "we can use water better in the level, the fire should feel more
// intense, falling debris at points"; scratch/brief-burningvillage3-1023.md). The level's WATER VERBS beyond the bucket kit, its FIRE'S THREE STAGES and
// its TOLD FALLING DEBRIS. The level (src/burning-village.js) returns L.vh = { tanks, oil, debris }; main.js builds this module in villageReset and calls
// update / drawWorld / drawOver. Pure numbers and the pure helpers are exported for tools/village-water.mjs.
//
// 1. BURST (taught: a rain barrel in the Crofts; tested: a rain tank on the Long Street; the exam: the WATER TOWER in the well yard). Strike a full tank
//    and it bursts: a WAVE rolls out both ways (TANKS[kind].r tiles, WAVE.v px/s, drawn full - a wall of water with a foam crest) that puts out the
//    street's fire in reach (the grid, the flame pillars - held out PILLAR_OUT s -, the barn roof's wall, a hot door is cooled: main.js villageSplash),
//    and KNOCKS FOES OVER (stagger KNOCK.t, a hop, a told word); a burning goblin is DOUSED and a wisp put out. One per area, and a burst tank stays burst.
// 2. SOAKED (taught: strike a TROUGH or a WELL beside you; the wave of a burst tank soaks you too). SOAK.t seconds of dripping (a drawn drip, a blue timer
//    bar over your head, the word SOAKED): the village's fire does not burn a SOAKED hero - the flame pillars, the ember pits, the grid's fire, the heaps'
//    barrier, and OIL FIRE, which no water puts out (OIL: a pool of burning oil on the street - a toll when it is crossed dry, free when it is crossed wet).
//    It ends where the Pyromancer's fight begins (his square is the same fight it always was).
// 3. DOUSE A PATH: a BURNING GATE (L.heaps with gate: true, main.js putOutHeap / bucketTargets) is a wall of burning timber that only water opens; a way
//    over the roofs is always beside it (as THE FALLEN HOUSE has). This file draws it.
// 4. FIRE IN THREE STAGES (stageAt): the Road in and the Crofts burn as they always did; the Long Street and the Rooftops burn harder; the Barn and the Well
//    yard are an inferno - taller flames, an ember storm, the red-orange sky climbing, flames licking the roofs of the street's own houses, heat shimmer
//    over every fire and a roar under it all (audio.js blaze2 / blaze3). The square keeps stage 0.8: his fight is the one it always was.
// 5. FALLING DEBRIS, TOLD (DEBRIS): a burning roof drops its tiles, a beam comes down, a chimney falls - never untold: when you come within DEBRIS.reach
//    tiles its SHADOW grows on the ground where it will land, the timber CREAKS, DUST sifts down for DEBRIS[kind].tell s (0.7-0.8), then it falls. It
//    hurts only whoever is under the shadow when it lands (a jump clears it); a beam leaves BURNING GROUND for a few seconds, a chimney leaves a STEP of
//    rubble you can climb. Never a pit.
// main.js calls: reset, on, update, interact (none), soak, drawWorld, drawOver, drawGate, read, state.
/* the lines this level says through number() as variables (routed in src/hint-lines.js SAY_LINES: the hint box draws them; a floating word of capitals the filter drops is never seen) */
export const VH_SAY = {
  soak: 'SOAKED: FIRE CANNOT BURN YOU', hiss: 'HISS: THE FLAMES PASS YOU', dry: 'YOU ARE DRY AGAIN',
  tank: 'THE TANK BURSTS: THE WAVE ROLLS DOWN THE STREET', tower: 'THE TOWER GIVES WAY: THE FLOOD SOAKS YOU', barrel: 'THE BARREL BURSTS: THE WAVE PUTS OUT THE FIRE',
  tiles: 'THE ROOF SHEDS ITS TILES: LEAVE THE SHADOW', beam: 'THE BEAM CREAKS: LEAVE THE SHADOW', chimney: 'THE CHIMNEY GIVES: LEAVE THE SHADOW',
};
export const SOAK = { t: 10 };
export const KNOCK = { t: 1.8, hop: -110, push: 150 };
export const PILLAR_OUT = 14;                       /* s a flame pillar stays out after a wave has passed it */
export const WAVE = { v: 330, life: 1.5, h: { barrel: 12, tank: 16, tower: 22 } };
export const TANKS = {
  barrel: { r: 5, w: 10, h: 15, shake: 2, label: 'THE RAIN BARREL' },
  tank: { r: 9, w: 24, h: 30, shake: 3, label: 'THE RAIN TANK' },
  tower: { r: 15, w: 30, h: 66, shake: 5, label: 'THE WATER TOWER' },
};
export const OIL = { tall: 34, dmg: 0.5 };      /* a toll, not a wall: half of a flame pillar's burn, once a crossing */
export const DEBRIS = {
  reach: 9,                                          /* tiles: you come this near and it is told */
  tiles: { dmg: 10, tell: 0.7, w: 3, fall: 0.22, leave: 'none' },
  beam: { dmg: 16, tell: 0.75, w: 4, fall: 0.24, leave: 'fire' },
  chimney: { dmg: 18, tell: 0.8, w: 2, fall: 0.3, leave: 'step' },
  fireSecs: 5, rearm: 3.5,
};
/* THE FIRE'S STAGES, by column: 0 = the Road in / the Crofts as they always burned, 1 = the Long Street + the Rooftops, 2 = the Barn + the Well yard,
   and the square settles back so the duel is as it was. Linear between the marks. */
const STAGE_MARKS = [[0, 0], [150, 0], [200, 1], [310, 1], [335, 2], [440, 2], [452, 0.8], [999, 0.8]];
export function stageAt(tx) {
  const M = STAGE_MARKS; if (tx <= M[0][0]) return M[0][1];
  for (let i = 1; i < M.length; i++) if (tx <= M[i][0]) { const [x0, y0] = M[i - 1], [x1, y1] = M[i]; return y0 + (y1 - y0) * (tx - x0) / (x1 - x0); }
  return M[M.length - 1][1];
}
/* what a tank's wave has reached after t seconds: the front, in px each way */
export const frontAfter = (kind, t) => Math.min(TANKS[kind].r * 16, Math.max(0, t) * WAVE.v);
const hitBox = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

export function makeVillageHands(ctx) {
  let K = null;
  const H = {};
  const TS = () => ctx.TS;
  const hero = () => ctx.hero();
  H.on = () => !!K;
  H.state = () => K;
  H.collapsed = key => { if (!K || K.collapsed.has(key)) return false; K.collapsed.add(key); return true; };   /* a house of the backdrop falls: once a key per load */
  H.read = () => K && { soak: K.soak, tanks: K.tanks.map(t => ({ id: t.id, kind: t.kind, state: t.state })), debris: K.debris.map(d => ({ id: d.id, kind: d.kind, state: d.state })), waves: K.waves.length, oil: K.oil.length, embers: K.embers.length };

  /* ---------- RESET: a respawn rebuilds the street as it was: full tanks, standing debris, the oil alight ---------- */
  H.reset = () => {
    const L = ctx.L; { const P0 = hero(); if (P0) P0.soaked = 0; }   /* a hero never carries the soak out of the street (or into a respawn) */
    if (!L || !L.vh) { K = null; return; }
    if (K && K.L === L && K.debris) for (const d of K.debris) for (const [x, y] of d.cells || []) { ctx.setTile(x, y, ctx.T.AIR); }   /* the step a chimney left goes with the respawn */
    K = { L, said: {}, clock: 0, soak: 0, soakSaid: false, waves: [], embers: [], collapsed: new Set(), nextDrip: 0, shim: 0,
      tanks: (L.vh.tanks || []).map(t => ({ ...t, px: t.x * TS() + 8, py: (t.y + 1) * TS(), state: 'full', t: 0, leak: 0 })),
      oil: (L.vh.oil || []).map(o => ({ ...o })),
      rafters: (L.vh.rafters || []).map(r => ({ ...r })),
      debris: (L.vh.debris || []).map(d => ({ ...d, state: 'idle', t: 0, cells: [], cd: 0, fx: (d.x + 0.5) * TS() })) };
    const fires = ctx.fires();
    for (const o of K.oil) for (let x = o.x0; x <= o.x1; x++) fires.push({ x: x * TS() + 8, y: (o.row + 1) * TS(), life: 1e9, delay: 0, still: true, oil: true, dmg: Math.round(ctx.DMG.fire * OIL.dmg), tall: OIL.tall });
    if (typeof window !== 'undefined' && window.BK) Object.assign(window.BK, { villageHands: () => H, villageRead: () => H.read() });
  };

  /* ---------- SOAKED ---------- */
  H.soak = (why) => {
    if (!K) return; const P = hero(); if (!P || P.dead || ctx.bossActive()) return;
    const first = K.soak <= 0; K.soak = SOAK.t;
    if (first) { ctx.number(P.x, P.y - 34, VH_SAY.soak, '#9ad0ff'); ctx.sfx.splash && ctx.sfx.splash();
      for (let i = 0; i < 14; i++) ctx.parts().push({ x: P.x + (Math.random() - 0.5) * 8, y: P.y - 18 + Math.random() * 12, vx: (Math.random() - 0.5) * 50, vy: -30 - Math.random() * 40, life: 0.6, max: 0.6, col: Math.random() < 0.5 ? '#9ad0ff' : '#e8f6ff', size: 2, grav: 420 }); }
  };

  /* ---------- A TANK BURSTS ---------- */
  function burst(tk) {
    tk.state = 'burst'; tk.t = 0; tk.leak = 4; K.waves.push({ id: tk.id, kind: tk.kind, x: tk.px, y: tk.py, t: 0, hit: new Set(), soaked: false });
    const a = TANKS[tk.kind]; ctx.sfx.splash && ctx.sfx.splash(); ctx.sfx.crumble ? ctx.sfx.crumble() : ctx.sfx.crack && ctx.sfx.crack(); ctx.shake(a.shake);
    ctx.burst(tk.px, tk.py - a.h / 2, 16 + a.r, ['#9ad0ff', '#e8f6ff', '#6a4a2a', '#4a8ac0'], 90 + a.r * 8, 0.8, 200, 2);
    if (!K.said.burst) { K.said.burst = 1; ctx.number(tk.px, tk.py - a.h - 12, VH_SAY[tk.kind], '#9ad0ff'); }   /* the first burst of a life is said; the wave says the rest */
    /* what the water puts out, the whole reach at once: the grid's fire, the loose flames, the barn roof's wall, a hot door (main.js villageSplash), and
       the flame pillars in reach (held out a while); OIL is never in this list - no water puts out oil */
    ctx.splash(tk.px, tk.py, a.r, a.r + 2);
    for (const f of ctx.fires()) if (f.pillar && Math.abs(f.x - tk.px) < a.r * TS()) { f.outT = PILLAR_OUT; f.delay = Math.max(f.delay, 1); f.tall = 0; }
  }
  function stepWave(w, dt) {
    const P = hero(), a = TANKS[w.kind], front = frontAfter(w.kind, w.t), ex = ctx.enemies();
    for (const e of ex) { if (!e.alive || e.harmless || w.hit.has(e) || e === ctx.boss()) continue;
      if (Math.abs(e.x - w.x) > front || Math.abs(e.y - w.y) > 70) continue;
      w.hit.add(e); const dir = Math.sign(e.x - w.x) || 1;
      if (ctx.isFireFoe(e.t)) e.doused = 4;
      if (e.t === 'emberwisp' && e.alive) { ctx.number(e.x, e.y - e.h - 18, 'PUT OUT', '#9ad0ff'); ctx.hurtEnemy(e, e.hp + 1, w.x, false); continue; }
      if (e.t === 'pyromancer') continue;
      e.stagger = Math.max(e.stagger || 0, KNOCK.t); e.vx = dir * KNOCK.push; if (e.vy !== undefined && !e.noGrav) e.vy = KNOCK.hop;
      if (e.burn > 0) e.burn = 0; ctx.number(e.x, e.y - e.h - 8, 'KNOCKED DOWN', '#9ad0ff'); ctx.burst(e.x, e.y - 6, 8, ['#9ad0ff', '#e8f6ff'], 70, 0.4, 200, 2); }
    if (P && !P.dead && !w.soaked && Math.abs(P.x - w.x) <= front && Math.abs(P.y - w.y) < 60) { w.soaked = true; H.soak('wave'); }
    if (w.t < 0.9 && Math.random() < 0.9) { const side = Math.random() < 0.5 ? -1 : 1, fx = w.x + side * front;
      ctx.parts().push({ x: fx, y: w.y - 4, vx: side * (30 + Math.random() * 60), vy: -60 - Math.random() * 80, life: 0.45, max: 0.45, col: Math.random() < 0.5 ? '#e8f6ff' : '#9ad0ff', size: 2, grav: 420 }); }
  }

  /* ---------- A FALLING THING ---------- */
  function stepDebris(d, dt) {
    const P = hero(), D = DEBRIS[d.kind], cx = d.fx, gy = (d.row + 1) * TS();
    if (d.state === 'idle') { d.cd = Math.max(0, d.cd - dt);
      if (d.cd <= 0 && P && !P.dead && !ctx.bossActive() && Math.abs(P.x - cx) < DEBRIS.reach * TS() && Math.abs(P.y - gy) < 36) {
        d.state = 'tell'; d.t = 0; ctx.sfx.creak && ctx.sfx.creak(); ctx.number(cx, gy - 34, VH_SAY[d.kind], '#ffd36b'); } return; }
    if (d.state === 'tell') { d.t += dt;
      if (Math.random() < dt * 22) ctx.parts().push({ x: cx + (Math.random() - 0.5) * D.w * TS(), y: gy - 96 + Math.random() * 30, vx: (Math.random() - 0.5) * 6, vy: 30 + Math.random() * 30, life: 0.8, max: 0.8, col: Math.random() < 0.5 ? '#8a7a6a' : '#5a4a42', size: 1, grav: 60 });
      if (d.t > D.tell * 0.5 && !d.crk) { d.crk = true; ctx.sfx.creak && ctx.sfx.creak(); }
      if (d.t >= D.tell) { d.state = 'fall'; d.t = 0; d.crk = false; } return; }
    if (d.state === 'fall') { d.t += dt;
      if (d.t >= D.fall) land(d, cx, gy, D);
      return; }
    if (d.state === 'done') { if (d.fireT > 0) d.fireT -= dt; }
  }
  function land(d, cx, gy, D) {
    const P = hero(); d.state = 'done'; d.t = 0; ctx.sfx.heavy && ctx.sfx.heavy(); ctx.shake(3); ctx.dust(cx, gy, 10);
    ctx.burst(cx, gy - 6, 14, d.kind === 'tiles' ? ['#6a4a2a', '#8a6a3a', '#3a2a22'] : ['#ff9a5c', '#5c3a1d', '#ffd36b', '#3a2a22'], 90, 0.7, 260, 2);
    const half = D.w * TS() / 2 + 4;
    if (P && !P.dead && Math.abs(P.x - cx) < half && P.y > gy - 44) ctx.damagePlayer(cx, D.dmg, { unblockable: true, up: true, name: d.kind === 'chimney' ? 'THE CHIMNEY' : d.kind === 'beam' ? 'THE BEAM' : 'THE TILES' });
    if (D.leave === 'fire') { d.fireT = DEBRIS.fireSecs; for (let i = 0; i < 2; i++) ctx.fires().push({ x: (d.x - 1 + i) * TS() + 8, y: gy, life: DEBRIS.fireSecs, delay: 0.05 * i, dmg: Math.round(ctx.DMG.fire * 0.6), tall: 24, debris: true }); }
    if (D.leave === 'step') { const x0 = d.x - Math.floor(D.w / 2), over = P && !P.dead && P.x > x0 * TS() - 6 && P.x < (x0 + D.w) * TS() + 6 && P.y > gy - 40;
      if (!over) for (let i = 0; i < D.w; i++) for (const dy of [0, 1]) { const x = x0 + i, y = d.row - dy; ctx.setTile(x, y, ctx.T.SOLID); d.cells.push([x, y]); } }
    d.cd = DEBRIS.rearm;
  }

  /* ---------- UPDATE ---------- */
  H.update = (dt) => {
    if (!K) return; K.clock += dt; const P = hero();
    if (P) P.soaked = K.soak > 0 && !ctx.bossActive() ? K.soak : 0;
    if (K.soak > 0) { K.soak = Math.max(0, K.soak - dt); if (ctx.bossActive()) K.soak = 0;
      if (P && !P.dead && Math.random() < dt * 9) ctx.parts().push({ x: P.x + (Math.random() - 0.5) * 8, y: P.y - 22 + Math.random() * 14, vx: (Math.random() - 0.5) * 8, vy: 10, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#9ad0ff' : '#e8f6ff', size: 1, grav: 380 });
      /* a soaked hero in a flame HISSES: steam off him, where the fire would have burnt */
      if (P && !P.dead) for (const f of ctx.fires()) if (f.delay <= 0 && (f.oil || f.still || f.pillar) && Math.abs(P.x - f.x) < 10 && P.y > f.y - Math.max(14, f.tall || 0) && P.y <= f.y + 2) { if (Math.random() < dt * 14) ctx.parts().push({ x: P.x + (Math.random() - 0.5) * 8, y: P.y - 10, vx: 0, vy: -40, life: 0.5, max: 0.5, col: '#d8e4ee', size: 2, grav: -30 }); if (!K.said.hiss) { K.said.hiss = 1; ctx.sfx.hiss && ctx.sfx.hiss(); ctx.number(P.x, P.y - 40, VH_SAY.hiss, '#d8e4ee'); } break; }
      if (K.soak <= 0 && P && !P.dead) ctx.number(P.x, P.y - 34, VH_SAY.dry, '#c9b27c'); }
    /* THE TANKS: a strike bursts a full one */
    const hb = ctx.attackBox();
    for (const tk of K.tanks) { const a = TANKS[tk.kind];
      if (tk.state === 'full') { if (hb && P && !P.hitSet.has(tk) && hitBox(hb, { l: tk.px - a.w / 2 - 2, r: tk.px + a.w / 2 + 2, t: tk.py - a.h - 4, b: tk.py + 2 })) { P.hitSet.add(tk); burst(tk); } }
      else { tk.t += dt; tk.leak = Math.max(0, tk.leak - dt); if (tk.leak > 0 && Math.random() < dt * 14) ctx.parts().push({ x: tk.px + (Math.random() - 0.5) * a.w, y: tk.py - a.h * 0.4, vx: (Math.random() - 0.5) * 12, vy: 0, life: 0.4, max: 0.4, col: '#9ad0ff', size: 1, grav: 400 }); } }
    for (const w of K.waves) { w.t += dt; stepWave(w, dt); } K.waves = K.waves.filter(w => w.t < WAVE.life);
    for (const d of K.debris) stepDebris(d, dt);
    /* THE PILLARS A WAVE HAS PASSED stay out (main.js villageTick reads outT) */
    for (const f of ctx.fires()) if (f.pillar && f.outT > 0) { f.outT -= dt; f.delay = Math.max(f.delay, 0.5); f.tall = 0; }
    /* THE EMBER STORM: grows with the stage, wind-driven, never over a tell (it is drawn under the tells' layer) */
    const st = stageAt(ctx.camTile()), cap = Math.round(14 + 40 * st);
    if (K.embers.length < cap && Math.random() < dt * (8 + 26 * st)) K.embers.push({ x: ctx.camX() - 10 + Math.random() * (ctx.VW() + 40), y: ctx.camY() + ctx.VH() * (0.35 + 0.65 * Math.random()), vx: 24 + 30 * st + Math.random() * 30, vy: -(16 + Math.random() * 30 + 14 * st), t: Math.random() * 6, life: 2.4 + Math.random() * 2.2, s: Math.random() < 0.25 ? 2 : 1 });
    for (const m of K.embers) { m.t += dt; m.life -= dt; m.x += (m.vx + Math.sin(m.t * 2.3) * 14) * dt; m.y += m.vy * dt; }
    /* THE BARN'S RAFTERS BURN OVERHEAD: burning bits drip down out of them (never a blow: they are small and drawn dim, and gone before the floor) */
    for (const r of K.rafters) { const x0 = Math.max(r.x0 * TS(), ctx.camX() - 10), x1 = Math.min((r.x1 + 1) * TS(), ctx.camX() + ctx.VW() + 10);
      if (x1 > x0 && K.embers.length < cap + 30 && Math.random() < dt * 22) K.embers.push({ x: x0 + Math.random() * (x1 - x0), y: r.row * TS() + 2, vx: (Math.random() - 0.5) * 10, vy: 22 + Math.random() * 40, t: Math.random() * 6, life: 0.5 + Math.random() * 1.1, s: Math.random() < 0.35 ? 2 : 1, drip: true }); }
    K.embers = K.embers.filter(m => m.life > 0 && m.x < ctx.camX() + ctx.VW() + 60 && m.y > ctx.camY() - 20);
  };

  /* ---------- DRAW: the world layer (under the creatures' tells) ---------- */
  const R = Math.round;
  function oilFlame(g, x, y, time, seed) {
    const h = 26 + Math.round(6 * Math.sin(time * 9 + seed) + 3 * Math.sin(time * 17 + seed * 2));
    for (let r = 0; r < h; r++) { const k = r / h, w = Math.max(1, Math.round(10 * Math.pow(1 - k, 0.65))), lean = Math.round(Math.sin(time * 6 + seed + r * 0.35) * k * 3);
      g.fillStyle = k < 0.16 ? '#ffe08a' : k < 0.38 ? '#ff9a3c' : k < 0.7 ? '#d6401c' : '#6a1810'; g.fillRect(x - (w >> 1) + lean, y - r, w, 1); } }
  function drawBarrel(g, x, y, full, near, time, seed) {
    g.fillStyle = '#5a3a22'; g.fillRect(x - 6, y - 15, 12, 15); g.fillStyle = '#8a6a3a'; for (let k = -5; k < 6; k += 3) g.fillRect(x + k, y - 15, 1, 15);
    g.fillStyle = '#8a919c'; g.fillRect(x - 6, y - 12, 12, 1); g.fillRect(x - 6, y - 4, 12, 1); g.fillStyle = '#2a1c12'; g.fillRect(x - 6, y - 15, 12, 1);
    if (full) { g.fillStyle = '#4a8ac0'; g.fillRect(x - 5, y - 16, 10, 2); g.fillStyle = '#bfe6f5'; g.fillRect(x - 4 + (Math.floor(time * 3 + seed) % 5), y - 16, 2, 1); } }
  function drawTank(g, x, y, full, time, seed) {
    g.fillStyle = '#2a1c12'; g.fillRect(x - 11, y - 8, 3, 8); g.fillRect(x + 8, y - 8, 3, 8); g.fillRect(x - 11, y - 9, 22, 2);
    g.fillStyle = '#6a4a2a'; g.fillRect(x - 12, y - 30, 24, 21); g.fillStyle = '#8a6a3a'; for (let k = -10; k < 11; k += 4) g.fillRect(x + k, y - 30, 2, 21);
    g.fillStyle = '#8a919c'; g.fillRect(x - 12, y - 26, 24, 2); g.fillRect(x - 12, y - 14, 24, 2); g.fillStyle = '#2a1c12'; g.fillRect(x - 12, y - 30, 24, 1);
    g.fillStyle = '#6a6a74'; g.fillRect(x + 11, y - 12, 4, 2); g.fillRect(x + 14, y - 12, 2, 5);                                           /* the spigot */
    if (full) { g.fillStyle = '#4a8ac0'; g.fillRect(x - 10, y - 31, 20, 2); g.fillStyle = '#bfe6f5'; g.fillRect(x - 8 + (Math.floor(time * 2.2 + seed) % 14), y - 31, 3, 1); if (Math.floor(time * 2 + seed) % 3 === 0) { g.fillStyle = '#4a8ac0'; g.fillRect(x + 14, y - 5, 1, 2); } } }
  function drawTower(g, x, y, full, time, seed) {
    g.fillStyle = '#2a1c12';
    for (const dx of [-13, -5, 4, 12]) g.fillRect(x + dx, y - 44, 2, 44);                                                                        /* the legs */
    g.fillStyle = '#3a2a1e'; for (let q = 0; q < 3; q++) { for (let k = 0; k < 24; k++) { g.fillRect(x - 13 + k, y - 38 + q * 12 + Math.round(k * 0.4 * (q % 2 ? -1 : 1)), 2, 1); } }   /* the braces */
    g.fillStyle = '#6a4a2a'; g.fillRect(x - 15, y - 66, 30, 24); g.fillStyle = '#8a6a3a'; for (let k = -13; k < 14; k += 4) g.fillRect(x + k, y - 66, 2, 24);
    g.fillStyle = '#8a919c'; g.fillRect(x - 15, y - 60, 30, 2); g.fillRect(x - 15, y - 48, 30, 2); g.fillStyle = '#2a1c12'; g.fillRect(x - 15, y - 66, 30, 1);
    g.fillStyle = '#3a2a22'; g.beginPath(); g.moveTo(x - 17, y - 66); g.lineTo(x, y - 78); g.lineTo(x + 17, y - 66); g.fill();                    /* the cap */
    g.fillStyle = '#5a3a22'; g.fillRect(x + 15, y - 62, 2, 40); for (let r = 0; r < 40; r += 5) g.fillRect(x + 14, y - 60 + r, 4, 1);                /* the ladder */
    if (full) { g.fillStyle = '#4a8ac0'; for (let k = 0; k < 3; k++) g.fillRect(x - 12 + k * 9, y - 42 + (Math.floor(time * 2 + k + seed) % 3), 1, 3); g.fillStyle = '#bfe6f5'; g.fillRect(x - 14 + (Math.floor(time * 2.6 + seed) % 26), y - 64, 2, 1); } }
  function drawBroken(g, x, y, kind, leak) {
    g.fillStyle = '#2e2018'; g.fillRect(x - 12, y - 1, 24, 1); g.fillStyle = '#3a5a78'; g.globalAlpha = 0.55; g.fillRect(x - 13, y - 1, 26, 2); g.globalAlpha = 1;      /* the puddle */
    g.fillStyle = '#4a3222'; for (const [dx, h, lean] of kind === 'tower' ? [[-13, 40, 0], [-5, 36, 0], [4, 44, 0], [12, 30, 0]] : kind === 'tank' ? [[-11, 9, -1], [-5, 6, 1], [6, 8, 1], [11, 5, -1]] : [[-5, 5, -1], [-1, 3, 1], [4, 4, 1]])
      for (let q = 0; q < h; q++) g.fillRect(x + dx + Math.round(lean * q * 0.2), y - 1 - q, 2, 1);
    g.fillStyle = '#8a919c'; if (kind !== 'barrel') g.fillRect(x - 6, y - 3, 6, 1); else g.fillRect(x + 4, y - 2, 4, 1);                          /* a hoop on the ground */
    if (leak > 0) { g.fillStyle = '#9ad0ff'; g.fillRect(x - 1, y - 10, 1, 9); } }
  function drawWave(g, w, cx, cy, time) {
    const k = w.t / WAVE.life, f = frontAfter(w.kind, w.t), h = Math.round(WAVE.h[w.kind] * Math.max(0.15, 1 - k * 0.9) * Math.min(1, w.t / 0.25 + 0.2)), x0 = R(w.x - f - cx), x1 = R(w.x + f - cx), gy = R(w.y - cy);
    if (x1 < -10 || x0 > ctx.VW() + 10) return;
    g.globalAlpha = 0.5 * (1 - k * 0.7); g.fillStyle = '#4a8ac0'; g.fillRect(x0, gy - h, x1 - x0, h);
    g.globalAlpha = 0.65 * (1 - k * 0.7); g.fillStyle = '#9ad0ff'; g.fillRect(x0, gy - h, x1 - x0, 2); for (let q = x0; q < x1; q += 5) { g.fillRect(q, gy - h + 2 + ((q + Math.floor(time * 12)) % 3), 2, 2 + ((q >> 2) % 3)); }
    g.globalAlpha = 0.9 * (1 - k * 0.6); g.fillStyle = '#e8f6ff'; for (const [fx, d] of [[x0, -1], [x1, 1]]) { for (let r = 0; r < h; r += 2) { const curl = Math.round(Math.sin(r * 0.5 + time * 14) * 1.5) + Math.round(r / h * 4) * d; g.fillRect(fx + curl - 2, gy - r - 2, 4, 2); } }
    g.globalAlpha = 1; }
  H.drawWorld = (g, cx, cy, time) => {
    if (!K) return; const P = hero();
    /* OIL: a slick of black oil under the flames, a bubble of smoke over them */
    for (const o of K.oil) { const x = o.x0 * TS() - cx, w = (o.x1 - o.x0 + 1) * TS(), y = R((o.row + 1) * TS() - cy); if (x > ctx.VW() + 20 || x + w < -20) continue;
      for (let t = o.x0; t <= o.x1; t++) oilFlame(g, R(t * TS() + 8 - cx), y - 3, time, t);   /* the flames of the oil: dark red at the edges, a pale core, black at the tip */
      g.fillStyle = '#0c0808'; g.fillRect(x - 2, y - 2, w + 4, 3); g.fillStyle = '#1e1618'; g.fillRect(x, y - 3, w, 2);
      g.fillStyle = Math.floor(time * 7) % 2 ? '#7a3a1c' : '#4a2616'; for (let q = 3; q < w - 2; q += 7) g.fillRect(x + q + (Math.floor(time * 2 + q) % 2), y - 3, 3, 1);   /* the sheen */
      for (let q = 0; q < 5; q++) { const kk = ((time * 0.45) + q * 0.2 + o.x0 * 0.31) % 1; g.globalAlpha = 0.55 * (1 - kk); g.fillStyle = '#1a1214'; const s = kk < 0.4 ? 3 : 4; g.fillRect(R(x + (q + 0.5) * w / 5 + Math.sin(time + q) * 4 + kk * 8), R(y - 24 - kk * 54), s, s); } g.globalAlpha = 1; }
    for (const tk of K.tanks) { const a = TANKS[tk.kind], x = R(tk.px - cx), y = R(tk.py - cy); if (x < -40 || x > ctx.VW() + 40) continue;
      const near = P && !P.dead && Math.abs(P.x - tk.px) < 70 && Math.abs(P.y - tk.py) < 40;
      if (tk.state === 'full') {
        /* A6: highlighted - a pale outline, a glint over the water, the strike-me ring in reach */
        g.save(); g.globalAlpha = 0.5 + 0.25 * Math.sin(time * 4 + tk.px); const fr = g.fillRect.bind(g); g.fillRect = (p, q, r, s) => { g.fillStyle = '#eef8ff'; fr(p - 1, q, r + 2, s); fr(p, q - 1, r, s + 2); };
        try { (tk.kind === 'tower' ? drawTower : tk.kind === 'tank' ? drawTank : drawBarrel)(g, x, y, true, time, tk.px); } finally { g.fillRect = fr; delete g.fillRect; g.restore(); }
        (tk.kind === 'tower' ? drawTower : tk.kind === 'tank' ? drawTank : drawBarrel)(g, x, y, true, time, tk.px);
        if (near) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 5 + tk.px); g.strokeStyle = '#9ad0ff'; g.beginPath(); g.arc(x, y - a.h / 2, a.w / 2 + 7, 0, 7); g.stroke(); g.globalAlpha = 1; }
      } else drawBroken(g, x, y, tk.kind, tk.leak); }
    for (const w of K.waves) drawWave(g, w, cx, cy, time);
    /* DEBRIS: its shadow on the ground in the tell, the thing itself falling, the heap of what it left */
    for (const d of K.debris) { const D = DEBRIS[d.kind], x = R(d.fx - cx), gy = R((d.row + 1) * TS() - cy), w = D.w * TS(); if (x < -60 || x > ctx.VW() + 60) continue;
      if (d.state === 'tell') { const k = Math.min(1, d.t / D.tell), blink = Math.floor(time * 14) % 2;
        g.globalAlpha = 0.18 + 0.4 * k; g.fillStyle = '#05030a'; g.beginPath(); g.ellipse(x, gy - 1, w / 2 + 4, 3, 0, 0, 7); g.fill();            /* THE SHADOW grows where it will land */
        g.globalAlpha = 0.5 + 0.4 * k; g.strokeStyle = blink ? '#ff6b6b' : '#ffd36b'; g.setLineDash([3, 3]); g.beginPath(); g.ellipse(x, gy - 1, w / 2 + 4, 3, 0, 0, 7); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
        const sh = Math.round(Math.sin(time * 40) * (0.5 + k)); drawThing(g, d.kind, x + sh, gy - 74, w, time, true); }                           /* and the thing, shaking, hung over it */
      else if (d.state === 'fall') { const k = Math.min(1, d.t / D.fall); drawThing(g, d.kind, x, R(gy - 74 + 74 * k * k), w, time, false); }
      else if (d.state === 'done') drawHeap(g, d, x, gy, w, time); }
    for (const r of K.rafters) { const x0 = R(r.x0 * TS() - cx), x1 = R((r.x1 + 1) * TS() - cx); if (x1 < 0 || x0 > ctx.VW()) continue; const y = R((r.row) * TS() - cy), a = Math.min(1, stageAt(ctx.camTile()) / 2);
      const gr = g.createLinearGradient(0, y, 0, y + 46); gr.addColorStop(0, 'rgba(255,110,40,' + (0.34 * a) + ')'); gr.addColorStop(1, 'rgba(255,110,40,0)'); g.fillStyle = gr; g.fillRect(Math.max(0, x0), y, Math.min(ctx.VW(), x1) - Math.max(0, x0), 46);   /* the roof's fire lights the room from above */
      for (let q = Math.max(0, x0); q < Math.min(ctx.VW(), x1); q += 13) { const wob = Math.sin(time * 7 + q * 0.7), h = 3 + Math.round(2 + 2 * wob); g.globalAlpha = 0.55 * a; g.fillStyle = '#ff6b2c'; g.fillRect(q, y, 5, h); g.fillStyle = '#ffd36b'; g.fillRect(q + 1, y, 2, Math.max(1, h - 2)); g.globalAlpha = 1; } }
    for (const m of K.embers) { const x = R(m.x - cx), y = R(m.y - cy); g.globalAlpha = Math.min(1, m.life) * 0.9; g.fillStyle = m.t % 0.6 < 0.3 ? '#ffd36b' : '#ff9a3c'; g.fillRect(x, y, m.s, m.s); } g.globalAlpha = 1;
  };
  function drawThing(g, kind, x, y, w, time, shaking) {      /* x centre, y = its bottom edge on screen */
    if (kind === 'beam') { g.fillStyle = '#1a0e0a'; g.fillRect(x - 6, y - 40, 12, 40); g.fillStyle = '#4a2e1a'; g.fillRect(x - 5, y - 40, 3, 40); g.fillStyle = Math.floor(time * 9) % 2 ? '#ff6b2c' : '#ffd36b'; for (let q = 4; q < 40; q += 9) g.fillRect(x + 2, y - q, 2, 2); g.fillStyle = '#2a1a12'; g.fillRect(x - w / 2, y - 12, w, 5); g.fillStyle = '#ff9a3c'; g.fillRect(x - w / 2 + 2, y - 12, 3, 1); g.fillRect(x + w / 2 - 6, y - 12, 2, 1); }
    else if (kind === 'chimney') { g.fillStyle = '#4a4440'; g.fillRect(x - w / 2, y - 44, w, 44); g.fillStyle = '#6a625c'; for (let r = 0; r < 44; r += 6) for (let c = 0; c < w; c += 8) g.fillRect(x - w / 2 + c + ((r / 6) % 2 ? 4 : 0), y - 44 + r, 6, 1); g.fillStyle = '#1a1412'; g.fillRect(x - w / 2, y - 44, w, 3); g.fillRect(x - w / 2 + 4, y - 30, 3, 14); }
    else { for (const [dx, dy, ww, hh] of [[-w / 2 + 2, 0, 9, 5], [-3, -6, 8, 4], [w / 2 - 12, -2, 9, 5], [-w / 2 + 12, -12, 7, 4], [4, -14, 8, 4]]) { g.fillStyle = '#3a2a22'; g.fillRect(x + dx, y + dy - 6, ww, hh); g.fillStyle = '#8a6a3a'; g.fillRect(x + dx, y + dy - 6, ww, 1); if (Math.floor(time * 7 + dx) % 3 === 0) { g.fillStyle = '#ff9a3c'; g.fillRect(x + dx + 1, y + dy - 6 + hh - 1, 2, 1); } } }
  }
  function drawHeap(g, d, x, gy, w, time) {
    const D = DEBRIS[d.kind];
    if (d.kind === 'chimney') { const x0 = x - w / 2; g.fillStyle = '#3a3430'; g.fillRect(x0, gy - 32, w, 32); g.fillStyle = '#5a524c'; for (let r = 0; r < 32; r += 6) for (let c = 0; c < w; c += 8) g.fillRect(x0 + c + ((r / 6) % 2 ? 4 : 0), gy - 32 + r, 6, 1); g.fillStyle = '#1a1412'; g.fillRect(x0, gy - 32, w, 2); g.fillStyle = Math.floor(time * 5 + x) % 3 ? '#7a2414' : '#c0441c'; g.fillRect(x0 + 5, gy - 18, 2, 1); g.fillRect(x0 + w - 9, gy - 8, 2, 1); return; }
    if (d.kind === 'beam') { const x0 = x - w / 2; g.fillStyle = '#1a0e0a'; g.fillRect(x0, gy - 5, w, 5); g.fillStyle = '#2a1a12'; g.fillRect(x0 + 6, gy - 9, w - 12, 4); g.fillStyle = (d.fireT || 0) > 0 ? (Math.floor(time * 8) % 2 ? '#ff6b2c' : '#ffd36b') : '#4a2a1a'; for (let q = 2; q < w - 2; q += 8) g.fillRect(x0 + q, gy - 6, 3, 1); return; }
    g.fillStyle = '#3a2a22'; g.fillRect(x - w / 2 + 4, gy - 3, w - 8, 3); g.fillStyle = '#8a6a3a'; g.fillRect(x - w / 2 + 8, gy - 4, 6, 1);
  }

  /* ---------- A BURNING GATE (a heap with gate: true; main.js drawHeaps calls this) ---------- */
  H.drawGate = (g, x, top, w, ht, out, time) => {
    if (out) return;
    const g0 = g.globalAlpha;
    /* the glow it throws on the street and the wall round it: a burning gate reads from a screen away */
    { const gr = g.createLinearGradient(x - 22, 0, x + w + 22, 0); gr.addColorStop(0, 'rgba(255,110,40,0)'); gr.addColorStop(0.5, 'rgba(255,120,48,' + (0.32 + 0.06 * Math.sin(time * 9)) + ')'); gr.addColorStop(1, 'rgba(255,110,40,0)'); g.fillStyle = gr; g.fillRect(x - 22, top, w + 44, ht); }
    g.fillStyle = '#1a1210'; g.fillRect(x - 3, top, 4, ht); g.fillRect(x + w - 1, top, 4, ht); g.fillRect(x - 3, top - 3, w + 6, 5);                              /* the posts and the lintel */
    g.fillStyle = '#6a3e1e'; g.fillRect(x - 2, top, 2, ht); g.fillRect(x + w, top, 2, ht);
    g.fillStyle = '#3a2214'; g.fillRect(x + 1, top + 2, w - 2, ht - 2);
    g.fillStyle = '#7a4a24'; for (let q = 3; q < w - 2; q += 5) g.fillRect(x + q, top + 2, 2, ht - 2);                                                                  /* the planks */
    g.fillStyle = '#a05a2a'; for (let q = 3; q < w - 2; q += 5) g.fillRect(x + q, top + 2, 1, ht - 2);
    g.fillStyle = '#8a919c'; for (let r = 10; r < ht - 8; r += 28) g.fillRect(x + 1, top + r, w - 2, 2);                                                               /* the straps */
    for (let r = 4; r < ht - 4; r += 3) { if ((r * 7 + Math.floor(time * 5)) % 5 < 2) { g.fillStyle = '#ff6b2c'; g.fillRect(x + 1 + ((r * 5) % Math.max(1, w - 4)), top + r, 2, 2); } }   /* embers in the grain */
    for (let q = 0; q < 12; q++) { const kk = (time * 1.0 + q * 0.083) % 1, ex = x + 1 + ((q * 5) % Math.max(1, w - 3)), hh = 10 + (q % 4) * 5, ey = top + ht - hh - kk * (ht - hh);
      for (let r = 0; r < hh; r++) { const k2 = r / hh, ww = Math.max(1, Math.round(4 * (1 - k2))); g.globalAlpha = 0.9 * (1 - kk * 0.8); g.fillStyle = k2 < 0.25 ? '#ffe08a' : k2 < 0.6 ? '#ff9a3c' : '#d6401c'; g.fillRect(ex - (ww >> 1) + Math.round(Math.sin(time * 8 + q + r * 0.4) * k2 * 2), R(ey + hh - r), ww, 1); } }   /* the fire climbs every plank */
    g.globalAlpha = g0;
    g.fillStyle = Math.floor(time * 6) % 2 ? '#ffd36b' : '#ff9a3c'; g.fillRect(x - 1, top + ht - 4, w + 2, 4);
    g.globalAlpha = 0.5 + 0.35 * Math.sin(time * 4); g.strokeStyle = '#eef8ff'; g.strokeRect(x - 3.5, top - 2.5, w + 7, ht + 3); g.globalAlpha = g0;   /* A6: the pale outline pulse - water opens this one */
  };
  /* THE FLAME ON A ROOF of the street's own houses (the fire's second and third stages): non-burning dressing, only ever drawn over a roof slab */
  H.stageAtCol = tx => stageAt(tx);

  /* ---------- DRAW: over the world (the soaked bar, the heat shimmer, the stage's wash) ---------- */
  H.drawOver = (g, cx, cy, time) => {
    if (!K) return; const P = hero(), VW = ctx.VW(), VH = ctx.VH();
    if (P && !P.dead && K.soak > 0) { const x = R(P.x - cx), y = R(P.y - cy), k = K.soak / SOAK.t, low = K.soak < 2.5;
      g.fillStyle = '#0c1a2a'; g.fillRect(x - 11, y - 38, 22, 4); g.fillStyle = low && Math.floor(time * 10) % 2 ? '#d8e4ee' : '#4a8ac0'; g.fillRect(x - 10, y - 37, Math.max(1, R(20 * k)), 2); g.fillStyle = '#bfe6f5'; g.fillRect(x - 10, y - 37, Math.max(1, R(20 * k)), 1);
      for (let q = 0; q < 4; q++) { const kk = (time * 1.4 + q * 0.27) % 1; g.globalAlpha = 1 - kk; g.fillStyle = '#9ad0ff'; g.fillRect(x - 6 + q * 4, R(y - 26 + kk * 22), 1, 2); } g.globalAlpha = 1; }
    /* THE HEAT SHIMMER: pale wavering columns over every flame that is up, a hotter fire in a later stage shimmers higher */
    const st = stageAt(ctx.camTile()); let n = 0;
    for (const f of ctx.fires()) { if (f.delay > 0 || f.vent || f.x < cx - 20 || f.x > cx + VW + 20 || !(f.pillar || f.barrier || f.oil || f.still)) continue; if (++n > 7) break;
      const x = R(f.x - cx), y = R(f.y - cy), hgt = Math.round(34 + 22 * st + (f.tall || 0) * 0.5); g.globalAlpha = 0.07 + 0.03 * st; g.fillStyle = '#ffd9a0';
      for (let r = 0; r < hgt; r += 3) g.fillRect(x - 5 + Math.round(Math.sin(time * 9 + r * 0.45 + f.x) * (1 + r / 14)), y - (f.tall || 14) - r, 9, 1);
      g.globalAlpha = 1; }
    if (st > 0.05) { g.globalAlpha = Math.min(0.2, 0.07 * st); const gr = g.createLinearGradient(0, VH, 0, VH * 0.45); gr.addColorStop(0, '#ff6b2c'); gr.addColorStop(1, 'rgba(255,107,44,0)'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }   /* the red-orange the screen is lit by, rising */
  };
  return H;
}
