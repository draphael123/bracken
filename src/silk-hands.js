// src/silk-hands.js - THE SILK UNDERCROFT's HANDS (claude/silk, the OPUS GREYBOX). src/silk-undercroft.js lays the undercroft; this runs it:
//   BOUNCE      the taut webs are the game's own spring cells (T.BOUNCER): drawn here, tight, shimmering.
//   CUT         a blow on an ANCHOR knot: a COCOON drops on what is under it (FOE.cocoon to a foe), a BRIDGE swings down into a ramp (the ramp cells AIR until then).
//   BURN        a blow on a SCONCE gives that hero a TORCH (TORCH.t s; a light: the dark mask's hole); a torch-bearer's blow (or touch) burns a STICKY WALL away
//               (SOLID while whole) and an EGG SAC. STICKY GOO slows a hero to GOO.cap and PINS a foe where it stands.
//   EGG SACS    linger by one SAC.linger s (it pulses: told) and it bursts - SAC.n spiderlings. A blow without a torch bursts it at once.
//   THE NET     a hero who falls past sk.catchY is put back on the last firm footing (NET.dmg, spare: never a death).
//   FOES        SPIDERLINGS and WEB-SPITTERS are the existing spider in their own skins (cnSkin 'skling' / 'skspitter'): main.js hands them here before updateSpider.
//               THE SILK LURKER ('silklurker'), the level's one new foe: it hides on the roof; its THREAD drops first (told), then it drops; it bites on the floor,
//               climbs its thread home - cut the thread while it climbs and it falls, STUNNED (x2).
// Every cell this module changes is kept and put back on a reset. GREYBOX DRAWING (the sonnet art lane draws the final).
// main.js calls (one tagged line each): on, reset, update, strike, spawn, mine, foe, takeFoe, drawBack, drawOver, drawFoe, holes.
import { SK_SAY } from './sk-lines.js';

export const TORCH = { t: 30, r: 72, sconceR: 56, touch: 12 };
export const SAC = { reach: 36, linger: 1.0, decay: 0.5, n: 3, r: 22 };
export const GOO = { cap: 40 };
export const NET = { dmg: 16 };
export const FOE = { cocoon: 60, cocoonW: 22, cocoonG: 900 };
export const LING = { hp: 8, speed: 100, sense: 160, senseY: 40, tell: 0.35, reach: 16, dmg: 6, cd: 1.0, walk: 30 };
export const SPIT = { hp: 30, sense: 220, senseY: 120, tell: 0.7, speed: 150, dmg: 6, snare: 1.2, cd: 2.6, life: 2.6, r: 8 };
export const LURK = { hp: 40, sense: 40, tell: 0.8, drop: 360, dmg: 14, ground: 2.4, biteTell: 0.5, bite: 10, biteReach: 18, climb: 70, stun: 1.6, cd: 3.0, w: 12, h: 12 };
const SOUND = { torch: s => (s.ui || s.tell)(), out: s => (s.puff || s.thud || s.tell)(), cut: s => (s.crack || s.thud)(), burn: s => (s.sizzle || s.puff || s.thud)(),
  burst: s => (s.squelch || s.thud)(), caught: s => (s.thud)(), drop: s => (s.whoosh || s.tell)(), thread: s => (s.hiss || s.tell)(), bite: s => (s.hiss || s.tell)(), spit: s => (s.puff || s.tell)() };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };

export function makeSilkHands(ctx) {
  const H = {}; let S = null;
  const TS = ctx.TS, L = () => ctx.L, sk = () => (L() && L().sk) || null;
  const snd = k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} };
  const say = (x, y, t, col) => ctx.number && ctx.number(x, y, t, col || '#ffd36b');
  const hint = (k, m) => { if (S.told[k]) return; S.told[k] = 1; ctx.hint && ctx.hint(m); };
  H.on = () => !!(L() && L().silk);
  H.show = () => S;
  const heroes = () => (ctx.players() || []).filter(p => p && !p.dead);
  const fresh = () => ({ t: 0, cells: new Map(), cut: {}, wall: {}, sac: {}, torch: new Map(), cocoons: [], globs: [], safe: new Map(), told: {}, pinned: new Map(),
    n: { cuts: 0, cocoonHits: 0, bridges: 0, torches: 0, burned: 0, sacsBurned: 0, bursts: 0, hatched: 0, caught: 0, threads: 0, drops: 0, threadCuts: 0, snares: 0, bites: 0 } });
  const tile = (x, y) => { const L0 = L(); return x < 0 || y < 0 || x >= L0.W || y >= L0.H ? ctx.T.SOLID : L0.grid[y * L0.W + x]; };
  const stand = t => t === ctx.T.SOLID || t === ctx.T.ONEWAY || t === ctx.T.BOUNCER || t === ctx.T.PLANK || t === ctx.T.SHELF;
  /* ---------------- THE CELLS this level changes: every original kept, every one put back on a reset ---------------- */
  H.setCell = (x, y, t) => { const L0 = L(); if (x < 0 || y < 0 || x >= L0.W || y >= L0.H) return; const k = y * L0.W + x; if (!S.cells.has(k)) S.cells.set(k, L0.grid[k]); ctx.cellSet(x, y, t); };
  H.reset = () => { if (!H.on()) { S = null; return; }
    if (S && S.L === L()) for (const [k, v] of S.cells) { const L0 = L(); ctx.cellSet(k % L0.W, Math.floor(k / L0.W), v); }
    S = fresh(); S.L = L(); const G = sk(); if (!G) return;
    for (const w of G.walls) { S.wall[w.id] = { st: 'whole', t: 0 }; for (let y = w.y0; y <= w.y1; y++) H.setCell(w.x, y, ctx.T.SOLID); }   /* the sticky walls stand whole */
    for (const a of G.anchors) { S.cut[a.id] = false; if (a.kind === 'bridge') for (const [x, y] of a.ramp) H.setCell(x, y, ctx.T.AIR); }   /* the bridges hang high: no ramp yet */
    for (const s of G.sacs) S.sac[s.id] = { st: 'whole', t: 0 }; };
  /* ---------------- TORCHES ---------------- */
  H.hasTorch = p => !!S && (S.torch.get(p) || 0) > 0;
  H.giveTorch = p => { S.torch.set(p, TORCH.t); S.n.torches++; snd('torch'); say(p.x, p.y - 34, SK_SAY.torchOn, '#ffb04a'); };
  H.lightsNow = () => { const G = sk(), out = []; if (!G || !S) return out;
    for (const p of heroes()) if (H.hasTorch(p)) out.push({ x: p.x, y: p.y - 14, r: TORCH.r, kind: 'torch' });
    for (const s of G.sconces) out.push({ x: s.x, y: s.y - 14, r: TORCH.sconceR, kind: 'sconce' });
    for (const s of G.sacs) if (S.sac[s.id].st === 'whole') out.push({ x: s.x, y: s.y - 6, r: SAC.r, kind: 'sac' });
    return out; };
  /* ---------------- CUT ---------------- */
  H.cutAnchor = id => { const G = sk(), a = G.anchors.find(q => q.id === id); if (!a || a.kind === 'knot' || S.cut[id]) return false; S.cut[id] = true; S.n.cuts++; snd('cut'); say(a.x, a.y - 16, SK_SAY.cut, '#e6e6ee');
    if (a.kind === 'cocoon') S.cocoons.push({ x: a.cocoon.col * TS + 8, y: a.cocoon.top * TS, vy: 0, floorY: a.cocoon.floor * TS, id });
    if (a.kind === 'bridge') { for (const [x, y] of a.hold) H.setCell(x, y, ctx.T.AIR); for (const [x, y] of a.ramp) H.setCell(x, y, ctx.T.ONEWAY); S.n.bridges++; say(a.hold[a.hold.length - 1][0] * TS, a.hold[0][1] * TS, SK_SAY.fell, '#e6e6ee'); }
    return true; };
  function stepCocoons(dt) { for (const c of S.cocoons) { if (c.done) continue; c.vy += FOE.cocoonG * dt; c.y += c.vy * dt; if (c.y < c.floorY) continue; c.y = c.floorY; c.done = true; snd('burst');
      for (const e of (ctx.enemies() || [])) if (e.alive && !e.boss && Math.abs(e.x - c.x) < FOE.cocoonW && Math.abs(e.y - c.floorY) < 28) { S.n.cocoonHits++; if (ctx.hurt) ctx.hurt(e, FOE.cocoon, c.x); else { e.hp -= FOE.cocoon; if (e.hp <= 0) e.alive = false; } } } }
  /* ---------------- BURN ---------------- */
  H.burnWall = id => { const w = S.wall[id]; if (!w || w.st !== 'whole') return false; w.st = 'burning'; w.t = 0.5; snd('burn'); const G = sk(), ww = G.walls.find(q => q.id === id); say(ww.x * TS + 8, ww.y1 * TS, SK_SAY.burned, '#ffb04a'); return true; };
  function stepWalls(dt) { for (const ww of sk().walls) { const w = S.wall[ww.id]; if (w.st !== 'burning') continue; w.t -= dt; if (w.t > 0) continue; w.st = 'gone'; S.n.burned++; for (let y = ww.y0; y <= ww.y1; y++) H.setCell(ww.x, y, ctx.T.AIR); } }
  /* ---------------- EGG SACS ---------------- */
  const burst = s => { const st = S.sac[s.id]; if (st.st !== 'whole') return; st.st = 'burst'; S.n.bursts++; snd('burst'); say(s.x, s.y - 20, SK_SAY.hatch, '#ff9a5c'); for (let i = 0; i < SAC.n; i++) H.ling(s.x + (i - 1) * 10, s.y); };
  const burnSac = s => { const st = S.sac[s.id]; if (st.st !== 'whole') return; st.st = 'burned'; S.n.sacsBurned++; snd('burn'); say(s.x, s.y - 20, SK_SAY.burned, '#ffb04a'); };
  H.ling = (x, y) => { S.n.hatched++; const e = { x, y, vx: 0, vy: 0, face: 1, alive: true, dying: 0, anim: Math.random() * 3, flash: 0, stagger: 0, t: 'spider', cnSkin: 'skling', w: 10, h: 8, hp: LING.hp, maxHp: LING.hp, restY: y + 26, drop: 0, mode: 'walk', modeT: 0, cd: 0.8, noGrav: true, skInit: 1 };
    if (ctx.addFoe) ctx.addFoe(e); return e; };
  function stepSacs(dt) { for (const s of sk().sacs) { const st = S.sac[s.id]; if (st.st !== 'whole') continue;
      const by = heroes().some(p => Math.abs(p.x - s.x) < SAC.reach && Math.abs(p.y - s.y) < 30);
      if (by && heroes().some(p => H.hasTorch(p) && Math.abs(p.x - s.x) < TORCH.touch && Math.abs(p.y - s.y) < 24)) { burnSac(s); continue; }
      st.t = by ? st.t + dt : Math.max(0, st.t - dt * SAC.decay); if (by) hint('sac', SK_SAY.sac); if (st.t >= SAC.linger) burst(s); } }
  /* ---------------- GOO ---------------- */
  const onGoo = (x, y) => sk().goos.some(g => x >= g.x0 * TS && x < (g.x1 + 1) * TS && Math.abs(y - (g.y + 1) * TS) < 6);
  function stepGoo() { for (const p of heroes()) if (p.ground && onGoo(p.x, p.y)) { if (Math.abs(p.vx || 0) > GOO.cap) p.vx = Math.sign(p.vx) * GOO.cap; if (!p.gooSaid || S.t - p.gooSaid > 2.5) { p.gooSaid = S.t; say(p.x, p.y - 26, SK_SAY.stuck, '#e6e6ee'); hint('goo', SK_SAY.sticky); } }
    for (const e of (ctx.enemies() || [])) { if (!e.alive || e.boss) continue; if (onGoo(e.x, e.y)) { if (!S.pinned.has(e)) S.pinned.set(e, e.x); e.x = S.pinned.get(e); e.pinned = true; } else if (S.pinned.has(e)) { S.pinned.delete(e); e.pinned = false; } } }
  /* ---------------- THE NET ---------------- */
  function stepNet() { const G = sk(), L0 = L();
    for (const p of heroes()) {
      if (p.ground) { const tx = Math.floor(p.x / TS), ty = Math.floor((p.y + 2) / TS); if (L0.grid[ty * L0.W + tx] === ctx.T.SOLID) S.safe.set(p, { x: p.x, y: p.y }); }
      if (p.y <= G.catchY) continue; const s = S.safe.get(p) || { x: L0.START.x * TS + 8, y: (L0.START.y + 1) * TS };
      p.x = s.x; p.y = s.y; p.vx = 0; p.vy = 0; S.n.caught++; snd('caught'); say(p.x, p.y - 30, SK_SAY.caught, '#ff6b6b');
      ctx.asPlayer(p, () => ctx.damage(p.x, NET.dmg, { name: 'THE SILK NET', unblockable: true, spare: true, noKnock: true })); } }
  /* ---------------- THE STEP ---------------- */
  H.update = dt => { if (!H.on()) return; if (!S) H.reset(); S.t += dt;
    for (const [p, t] of S.torch) { if (t <= 0) continue; const n = t - dt; S.torch.set(p, n); if (n <= 0) { snd('out'); say(p.x, p.y - 34, SK_SAY.torchOut, '#8a8a98'); } }
    for (const p of heroes()) if (H.hasTorch(p)) for (const ww of sk().walls) if (S.wall[ww.id].st === 'whole' && Math.abs(p.x - (ww.x * TS + 8)) < TORCH.touch + 6 && p.y > ww.y0 * TS && p.y - 20 < (ww.y1 + 1) * TS) H.burnWall(ww.id);
    stepCocoons(dt); stepWalls(dt); stepSacs(dt); stepGoo(); stepGlobs(dt); stepNet(); };
  /* ---------------- A HERO'S BLOW: a knot, a sconce, a sticky wall, a sac, a lurker's thread ---------------- */
  const hitBox = (hb, x, y, r) => hb.l < x + r && hb.r > x - r && hb.t < y + r && hb.b > y - r;
  H.strike = (hb, by) => { if (!H.on() || !hb) return; if (!S) H.reset(); const G = sk(), once = o => !ctx.hitOnce || ctx.hitOnce(o), who = by || (ctx.hero && ctx.hero());
    for (const a of G.anchors) if (a.kind !== 'knot' && !S.cut[a.id] && hitBox(hb, a.x, a.y, 9) && once(a)) H.cutAnchor(a.id);
    for (const s of G.sconces) if (who && hitBox(hb, s.x, s.y - 14, 9) && once(s)) H.giveTorch(who);
    for (const ww of G.walls) if (S.wall[ww.id].st === 'whole' && hb.l < ww.x * TS + 16 && hb.r > ww.x * TS && hb.t < (ww.y1 + 1) * TS && hb.b > ww.y0 * TS && once(ww)) {
      if (who && H.hasTorch(who)) H.burnWall(ww.id); else { say(ww.x * TS + 8, hb.t, SK_SAY.stuck, '#e6e6ee'); hint('wall', SK_SAY.torch); } }
    for (const s of G.sacs) if (S.sac[s.id].st === 'whole' && hitBox(hb, s.x, s.y - 6, 8) && once(s)) { if (who && H.hasTorch(who)) burnSac(s); else burst(s); }
    for (const e of (ctx.enemies() || [])) if (e.alive && e.t === 'silklurker' && (e.mode === 'climb' || e.mode === 'hide') && e.y - 14 > e.homeY && hb.l < e.x + 4 && hb.r > e.x - 4 && hb.t < e.y - 14 && hb.b > e.homeY && once(e.thread || (e.thread = {}))) {
      e.mode = 'fallen'; e.modeT = LURK.stun; e.vy = 0; S.n.threadCuts++; snd('cut'); say(e.x, e.y - 20, SK_SAY.fell, '#ffd36b'); e.thread = {}; } };
  /* ================= THE FOES ================= */
  H.mine = e => (e.t === 'spider' && (e.cnSkin === 'skling' || e.cnSkin === 'skspitter')) || e.t === 'silklurker';
  const floorUnder = (x, y) => { const tx = Math.floor(x / TS); for (let ty = Math.floor((y - 4) / TS); ty < L().H; ty++) if (stand(tile(tx, ty))) return ty * TS; return null; };
  H.spawn = (e, base) => { if (e.t !== 'silklurker') return null; const homeY = base.y - 2; const fy = floorUnder(base.x, homeY + 24);
    return { ...base, t: 'silklurker', w: LURK.w, h: LURK.h, hp: LURK.hp, maxHp: LURK.hp, noGrav: true, mode: 'hide', modeT: 0, homeY, y: homeY, floorY: fy === null ? homeY + 200 : fy, squad: e.squad, cd: 0 }; };
  H.takeFoe = (e, dmg) => (e.t === 'silklurker' && e.mode === 'fallen' ? dmg * 2 : dmg);
  const hitP = (p, e, d, name, o = {}) => { let r = null; ctx.asPlayer(p, () => { r = ctx.damage(e.x, d, { who: e, name, ...o }); }); return r; };
  const nearest = e => heroes().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || null;
  H.foe = (e, dt) => { if (!S) H.reset(); e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = Math.max(0, (e.cd || 0) - dt);
    if (e.t === 'silklurker') return lurk(e, dt);
    if (!e.skInit) { e.skInit = 1; e.noGrav = true; const hp = e.cnSkin === 'skspitter' ? SPIT.hp : LING.hp; e.hp = hp; e.maxHp = hp; e.mode = e.cnSkin === 'skspitter' ? 'watch' : 'walk'; e.modeT = 0; const fy = floorUnder(e.x, e.y); if (fy !== null) e.y = fy; }
    e.restY = e.y + 26;   /* (the spider's thread line in main.js draws nothing for a skin) */
    if (e.cnSkin === 'skspitter') return spitter(e, dt); return ling(e, dt); };
  function ling(e, dt) { const p = nearest(e); if (e.pinned) return;
    if (e.mode === 'biteTell') { if (e.modeT <= 0) { e.mode = 'walk'; e.cd = LING.cd; if (p && Math.abs(p.x - e.x) < LING.reach && Math.abs(p.y - e.y) < 16) { S.n.bites++; hitP(p, e, LING.dmg, 'A SPIDERLING'); } } return; }
    const chase = p && Math.abs(p.x - e.x) < LING.sense && Math.abs(p.y - e.y) < LING.senseY; const dir = chase ? (Math.sign(p.x - e.x) || 1) : (e.face || 1), sp = chase ? LING.speed : LING.walk;
    if (chase && Math.abs(p.x - e.x) < LING.reach - 2 && e.cd <= 0) { e.mode = 'biteTell'; e.modeT = LING.tell; e.face = dir; say(e.x, e.y - 16, '!', '#ffd36b'); return; }
    const nx = e.x + dir * sp * dt, ty = Math.floor((e.y + 2) / TS), tx = Math.floor((nx + dir * 5) / TS);
    if (!stand(tile(tx, ty)) || tile(tx, ty - 1) === ctx.T.SOLID) { e.face = -dir; return; } e.x = nx; e.face = dir; }
  function spitter(e, dt) { const p = nearest(e);
    if (e.mode === 'spitTell') { if (e.modeT <= 0) { e.mode = 'watch'; e.cd = SPIT.cd; snd('spit'); const a = e.aim, dx = a.x - e.x, dy = a.y - (e.y - 6), d = Math.hypot(dx, dy) || 1; S.globs.push({ x: e.x, y: e.y - 6, vx: dx / d * SPIT.speed, vy: dy / d * SPIT.speed, t: SPIT.life, by: e }); } return; }
    if (p && e.cd <= 0 && Math.abs(p.x - e.x) < SPIT.sense && Math.abs(p.y - e.y) < SPIT.senseY) { e.mode = 'spitTell'; e.modeT = SPIT.tell; e.aim = { x: p.x, y: p.y - 10 }; e.face = Math.sign(p.x - e.x) || 1; hint('spitter', SK_SAY.spitter); } }
  function stepGlobs(dt) { for (const g of S.globs) { g.x += g.vx * dt; g.y += g.vy * dt; g.t -= dt; if (tile(Math.floor(g.x / TS), Math.floor(g.y / TS)) === ctx.T.SOLID) g.t = 0;
      for (const p of heroes()) if (g.t > 0 && Math.abs(p.x - g.x) < SPIT.r && g.y > p.y - 24 && g.y < p.y + 2) { g.t = 0; const r = hitP(p, g.by || { x: g.x }, SPIT.dmg, 'A WEB-SPITTER');
        if (r !== 'blocked') { p.snare = Math.max(p.snare || 0, SPIT.snare); S.n.snares++; say(p.x, p.y - 30, SK_SAY.snared, '#ff6b6b'); } } }
    S.globs = S.globs.filter(g => g.t > 0); }
  function lurk(e, dt) { const p = nearest(e);
    switch (e.mode) {
      case 'hide': e.y = e.homeY; if (p && e.cd <= 0 && Math.abs(p.x - e.x) < LURK.sense && p.y > e.homeY + 20 && Math.abs(p.y - e.floorY) < 40) { e.mode = 'threadTell'; e.modeT = LURK.tell; S.n.threads++; snd('thread'); hint('lurker', SK_SAY.lurker); } return;
      case 'threadTell': if (e.modeT <= 0) { e.mode = 'drop'; snd('drop'); S.n.drops++; } return;
      case 'drop': e.y += LURK.drop * dt; for (const q of heroes()) if (!e.dropHit && Math.abs(q.x - e.x) < LURK.w && q.y > e.y - 6 && q.y - 22 < e.y) { e.dropHit = true; hitP(q, e, LURK.dmg, 'THE SILK LURKER'); }
        if (e.y >= e.floorY) { e.y = e.floorY; e.mode = 'ground'; e.modeT = LURK.ground; e.dropHit = false; } return;
      case 'ground': if (p && e.cd <= 0 && Math.abs(p.x - e.x) < LURK.biteReach && Math.abs(p.y - e.y) < 20) { e.mode = 'biteTell'; e.modeT = LURK.biteTell; e.face = Math.sign(p.x - e.x) || 1; return; }
        if (e.modeT <= 0) { e.mode = 'climb'; } return;
      case 'biteTell': if (e.modeT <= 0) { e.mode = 'ground'; e.modeT = Math.max(e.modeT, 0.6); e.cd = 1.0; snd('bite'); if (p && Math.abs(p.x - e.x) < LURK.biteReach + 2 && Math.abs(p.y - e.y) < 20) hitP(p, e, LURK.bite, 'THE SILK LURKER'); } return;
      case 'climb': e.y -= LURK.climb * dt; if (e.y <= e.homeY) { e.y = e.homeY; e.mode = 'hide'; e.cd = LURK.cd; } return;
      case 'fallen': e.vy = (e.vy || 0) + 900 * dt; e.y = Math.min(e.floorY, e.y + e.vy * dt); if (e.modeT <= 0) { e.mode = 'climb'; e.vy = 0; } return;
    } }
  /* ---------------- WHAT A TOOL READS ---------------- */
  H.read = () => S && { t: +S.t.toFixed(2), walls: Object.values(S.wall).map(w => w.st), cut: Object.keys(S.cut).filter(k => S.cut[k]), sacs: Object.values(S.sac).map(s => s.st), torches: heroes().map(p => +(S.torch.get(p) || 0).toFixed(1)), n: { ...S.n } };
  /* ================= THE DARK: every torch, sconce and sac is a hole ================= */
  H.holes = (hole, cx, cy) => { if (!S) return; for (const l of H.lightsNow()) hole(l.x - cx, l.y - cy, l.r * 1.25); };
  /* ================= THE GREYBOX DRAWING ================= */
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  /* behind the tiles: THE MANOR'S FOUNDATIONS overhead (the landmark), the hanging silk sheets, the net over every pit */
  H.drawBack = (g, cx, cy, VW, VH, time) => { if (!H.on() || !S) return; const x = X(cx), y = Y(cy), G = sk();
    const off = -cx * 0.3; for (let i = -1; i < Math.ceil(VW / 96) + 2; i++) { const bx = R(((i * 96 + off) % (VW + 192) + VW + 192) % (VW + 192) - 96); rect(g, bx, 0, 90, 34, 'rgba(70,64,72,0.9)'); rect(g, bx, 34, 90, 3, 'rgba(40,36,42,0.9)'); rect(g, bx + 40, 10, 10, 8, 'rgba(255,176,74,' + (0.15 + 0.1 * Math.sin(time + i)).toFixed(2) + ')'); }   /* the manor's footings, a cellar grate lit */
    for (let i = 0; i < 10; i++) { const sx = ((i * 131 - cx * 0.5) % (VW + 60) + VW + 60) % (VW + 60) - 30; rect(g, sx, 34, 1, VH * 0.7, 'rgba(230,230,240,0.10)'); rect(g, sx - 10, 40 + (i % 4) * 22, 20, 1, 'rgba(230,230,240,0.08)'); }
    for (const pt of G.pits) { const a = x(pt.x0 * TS), b = x((pt.x1 + 1) * TS); if (b < 0 || a > VW) continue; const ny = y(G.catchY - 24); for (let k = a; k < b; k += 8) rect(g, k, ny + ((k / 8) % 2) * 3, 8, 1, 'rgba(220,220,235,0.35)'); } };
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!H.on() || !S) return; const x = X(cx), y = Y(cy), G = sk();
    for (const w of G.webs) for (let c = w.x0; c <= w.x1; c++) { const px = x(c * TS), py = y(w.y * TS); rect(g, px, py, TS, 2, 'rgba(240,240,250,' + (0.7 + 0.3 * Math.sin(time * 6 + c)).toFixed(2) + ')'); rect(g, px + 7, py - 3, 2, 3, 'rgba(240,240,250,0.5)'); }   /* TAUT: drawn tight, shimmering */
    for (const a of G.anchors) { if (a.kind === 'knot') continue; const cut = S.cut[a.id], kx = x(a.x), ky = y(a.y);
      rect(g, kx - 3, ky - 3, 6, 6, cut ? '#5a5a64' : ((time * 3) % 2 < 1 ? '#ffffff' : '#c8c8d4'));
      if (!cut) { g.strokeStyle = 'rgba(235,235,245,0.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(kx + 0.5, ky); const tx = a.kind === 'cocoon' ? x(a.cocoon.col * TS + 8) : x(a.hold[0][0] * TS), ty = a.kind === 'cocoon' ? y(a.cocoon.top * TS + 10) : y(a.hold[0][1] * TS); g.lineTo(tx + 0.5, ty); g.stroke();
        if (a.kind === 'cocoon') { rect(g, tx - 5, ty, 10, 16, '#d8d8e0'); rect(g, tx - 5, ty + 5, 10, 1, '#a8a8b4'); rect(g, x(a.cocoon.col * TS + 8) - 1, y(1 * TS), 2, ty - y(TS), 'rgba(235,235,245,0.4)'); }
        if (a.kind === 'bridge') for (const [hx, hy] of a.hold) rect(g, x(hx * TS), y(hy * TS), TS, 2, 'rgba(240,240,250,0.8)'); }
      else if (a.kind === 'bridge') for (const [rx, ry] of a.ramp) rect(g, x(rx * TS), y(ry * TS), TS, 2, 'rgba(240,240,250,0.8)'); }
    for (const c of S.cocoons) if (!c.done) rect(g, x(c.x) - 5, y(c.y), 10, 16, '#d8d8e0'); else rect(g, x(c.x) - 8, y(c.floorY) - 4, 16, 4, 'rgba(216,216,224,0.6)');
    for (const ww of G.walls) { const st = S.wall[ww.id]; if (st.st === 'gone') continue; const px = x(ww.x * TS), top = y(ww.y0 * TS), h = (ww.y1 - ww.y0 + 1) * TS;
      rect(g, px, top, TS, h, st.st === 'burning' ? ((time * 12) % 2 < 1 ? '#ff9a3a' : '#ffd36b') : 'rgba(225,225,235,0.85)');
      if (st.st === 'whole') for (let k = 0; k < h; k += 6) rect(g, px + (k % 12 ? 3 : 9), top + k, 4, 1, '#a8a8b8'); }
    for (const s of G.sconces) { const px = x(s.x), py = y(s.y); rect(g, px - 3, py - 12, 6, 3, '#4a4048'); rect(g, px - 2, py - 18 + Math.sin(time * 9 + s.x) * 1, 4, 6, '#ffb04a'); }   /* THE ONE ACCENT: torch amber */
    for (const s of G.sacs) { const st = S.sac[s.id], px = x(s.x), py = y(s.y); if (st.st === 'whole') { const k = st.t / SAC.linger; rect(g, px - 5, py - 12, 10, 12, 'rgba(150,220,120,' + (0.35 + 0.5 * k * ((time * (4 + 10 * k)) % 2 < 1 ? 1 : 0.3)).toFixed(2) + ')'); } else rect(g, px - 6, py - 3, 12, 3, st.st === 'burned' ? '#3a3030' : 'rgba(150,220,120,0.4)'); }
    for (const gp of G.goos) rect(g, x(gp.x0 * TS), y((gp.y + 1) * TS) - 3, (gp.x1 - gp.x0 + 1) * TS, 3, 'rgba(230,230,240,0.7)');
    for (const gl of S.globs) rect(g, x(gl.x) - 3, y(gl.y) - 3, 6, 6, '#d8e8c8');
    for (const p of heroes()) if (H.hasTorch(p)) { const px = x(p.x) + (p.face || 1) * 7, py = y(p.y) - 16; rect(g, px - 1, py, 2, 8, '#5a4030'); rect(g, px - 2, py - 5 + Math.sin(time * 14) * 1, 4, 5, (S.torch.get(p) || 0) < 4 && (time * 6) % 2 < 1 ? '#8a5020' : '#ffb04a'); }
    for (const e of (ctx.enemies() || [])) if (e.alive && e.t === 'silklurker' && e.mode !== 'hide') { const red = e.mode === 'threadTell' && (time * 10) % 2 < 1; g.strokeStyle = red ? '#ff4a2a' : 'rgba(235,235,245,0.85)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x(e.x) + 0.5, y(e.homeY)); g.lineTo(x(e.x) + 0.5, y(e.mode === 'threadTell' ? e.floorY : e.y - 10)); g.stroke(); } };
  H.drawFoe = (g, e, cx, cy, time) => { const ex = R(e.x - cx), ey = R(e.y - cy), tell = e.mode === 'biteTell' || e.mode === 'threadTell', st = e.mode === 'fallen';
    for (let i = 0; i < 3; i++) { rect(g, ex - 12, ey - 8 + i * 3, 6, 1, '#2a2a30'); rect(g, ex + 6, ey - 8 + i * 3, 6, 1, '#2a2a30'); }
    rect(g, ex - 6, ey - 12, 12, 10, st ? '#8a7a5a' : tell ? '#e6e6ee' : '#3a3a44'); rect(g, ex - 3 + (e.face || 1) * 3, ey - 9, 2, 2, '#ff4a2a'); if (st) rect(g, ex - 7, ey - 15, 14, 2, '#ffd36b'); };
  return H;
}
