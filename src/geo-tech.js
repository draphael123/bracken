// src/geo-tech.js - THE GEOMANCER'S L25-L50 TECHNIQUES (claude/geopack; data in src/tech-geomancer.js). Terrain verbs on HER STONES: SLINGSTONE, TOPPLE / STONE STEP, SEISMIC WELL,
// SHATTER RECALL / CAIRN, GEODE and the two capstones THE GREAT FAULT / THE STONE HOST. makeGeoTech(api, K) is built by makeGeomancer (src/geomancer.js) which owns the
// board; K is the handful of its internals this needs (pieces, crumble, place, freeCell, floorRow, dmg, ...). Nothing here names a hero in main.js: a technique is read
// through api.tech(id) / api.upg(id) (progression.js techOn / upgRank for the local seat), and a cooldown lives on P (per seat).
// THE LAW (brief-l50abilities sec 4): every blow is swordDmg x k (K.dmg), no flat damage; a boss takes the damage and an OPEN (e.disarmOpenT), never a free stagger, a
// pin or an immunity; a foe takes at most `perFoe` hits from one use; one hit-stop per cast; FX dice are Math.random on particles only (game dice are untouched).
export const GT = {
  sling: { k: 1.3, vx: 250, vy: -170, g: 520, life: 1.4, cd: 3, cost: 20, pierce: 1, r: 5 },
  topple: { k: 0.9, len: 60, t: 0.42, hold: 1.0, band: 16 },
  step: { cells: 2, maxCells: 4, cd: 2, cost: 10, reach: 14, floorTol: 10 },
  well: { r: 45, t: 1.2, k: 0.6, cd: 14, pull: 70, slowC: 0.45, slowB: 0.8, band: 26, down: 0.9 },
  shatter: { k: 0.45, r: 34, perFoe: 2, near: 64, down: 0.9 },
  cairn: { n: 3, k: 0.4, perFoe: 2, life: 14, r: 9, max: 9 },
  geode: { k: 2.0, fuse: 1.5, open: 1.5 },
  fault: { waves: 3, gap: 0.7, lead: 0.45, k: 0.8, band: 70, front: 520, cd: 40, shelfLife: 6, shelfW: 3, shelfUp: 3, down: 0.9, open: 1.2 },
  host: { life: 10, k: 0.2, every: 1.25, sp: 110, perFoeHits: 12, cd: 40, reach: 260, band: 70 },
};
const C = { base: '#7c7a6e', hi: '#a8a696', lo: '#5e5c54', dark: '#44423a', moss: '#6f9a4a', rune: '#e8a83a', glow: '#fff0c0', crystal: '#9fe0e8', crystal2: '#d8f6fa' };
export function makeGeoTech(api, K) {
  const TS = api.TS;
  let slings = [], wells = [], slabs = [], mines = [], waves = [], tells = [], hosts = [], geodes = [], shTag = null;
  const P = () => api.P, T = id => !!api.tech(id), U = id => api.upg(id) | 0;
  const foes = () => api.enemies.filter(e => e.alive && !(e.gone > 0) && !e.harmless && !e.turncoat);
  const dmg = k => K.dmg(k, 'geoTech');
  const feetBand = (e, gy, band) => Math.abs(e.y - gy) <= band;
  const cdLeft = key => Math.max(0, (P()[key] || 0) - api.time);
  const free = () => { const p = P(); return !p.dead && p.hp > 0; };
  /* a boss or a mini is OPENED, never staggered or pinned by us (the boss law); the open reuses the field the stone ram / ENTOMB set */
  const open = (e, s) => { e.disarmOpenT = Math.max(e.disarmOpenT || 0, api.time + s); api.number(e.x, e.y - (e.h || 16) - 20, 'OPENED UP', C.rune); };
  const hitstopOnce = (o, s) => { if (o.stopped) return; o.stopped = true; api.hitstop(s); };

  /* ==== L25 SLINGSTONE (UP+C with the board not full) ==== */
  function slingTry() {
    const p = P(), S = GT.sling; if (!T('gsling') || !p.ground || cdLeft('geoSlingAt') > 0) return false;
    if (!api.spend(S.cost)) { api.SFX.clank && api.SFX.clank(); api.number(p.x, p.y - 26, 'NO WIND FOR IT', '#9aa39a'); return false; }
    p.geoSlingAt = api.time + S.cd; api.kitPose && api.kitPose(p, 'gHeave', 0.3);
    slings.push({ x: p.x + p.face * 10, y: p.y - 16, vx: p.face * S.vx, vy: S.vy, hit: new Set(), n: 0, life: S.life, spin: 0, dir: p.face, stopped: false });
    api.dust(p.x + p.face * 10, p.y, 6); api.SFX.geoRise && api.SFX.geoRise(); api.shakeCam(1, p.face);   /* the grind on the lift */
    api.number(p.x, p.y - 34, 'SLINGSTONE', C.rune); return true;
  }
  function stepSlings(dt) {
    const S = GT.sling;
    for (const s of slings) {
      s.life -= dt; s.spin += s.dir * dt * 14; s.vy += S.g * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (api.isSolid(Math.floor(s.x / TS), Math.floor(s.y / TS))) { s.life = 0; api.burst(s.x, s.y, 8, [C.base, C.hi, C.lo], 70, 0.4); api.SFX.geoCrumble && api.SFX.geoCrumble(); continue; }
      for (const e of foes()) {
        if (s.life <= 0 || s.hit.has(e) || !api.overlap({ l: s.x - S.r, r: s.x + S.r, t: s.y - S.r, b: s.y + S.r }, api.box(e))) continue;
        s.hit.add(e); s.n++; api.hurtAs('heavy', e, dmg(S.k), s.x - s.dir * 10, false); api.sparks(e.x, e.y - (e.h || 16) / 2, s.dir, 6);
        api.SFX.geoThud && api.SFX.geoThud(); api.shakeCam(2, s.dir); hitstopOnce(s, 0.05);   /* a flat crack on impact, one stop */
        api.burst(s.x, s.y, 6, [C.base, C.hi, C.lo], 80, 0.35);
        if (s.n > S.pierce) s.life = 0; }
    }
    slings = slings.filter(s => s.life > 0);
  }

  /* ==== L30 A TOPPLE (the stone fist on one of her pillars) ==== */
  function toppleCheck() {
    const p = P(); if (!T('gtopple') || !(p.atk >= 0) || !p.heavySwing || p.heavy || p.swingKind || p.geoTopT === p.lastSwingT) return;
    const b = api.attackBox(); if (!b) return;
    const st = K.pieces().find(q => q.capped && !q.gone && q.kind === 'pillar' && api.overlap(b, { l: q.x0, r: q.x1, t: q.y0, b: q.y1 })); if (!st) return;
    p.geoTopT = p.lastSwingT; topple(st);
  }
  function topple(st) {
    const p = P(), cx = (st.x0 + st.x1) / 2, dir = Math.sign(cx - p.x) || p.face, gy = st.y1, h = Math.max(1, Math.round((st.y1 - st.y0) / TS));
    K.crumble(st, 'topple');
    slabs.push({ x: cx, dir, gy, h, t: 0, len: GT.topple.len + 8 * h, hit: new Set(), first: null, stopped: false, landed: false });
    api.SFX.geoRise && api.SFX.geoRise(); api.shakeCam(2, dir); api.dust(cx, gy, 6);   /* the long grind as it leans */
  }
  function stepSlabs(dt) {
    const S = GT.topple;
    for (const s of slabs) {
      s.t += dt; const k = Math.min(1, s.t / S.t), reach = s.len * k, x0 = s.dir > 0 ? s.x : s.x - reach, x1 = s.dir > 0 ? s.x + reach : s.x;
      if (k >= 0.5 && !s.landed) { s.landed = true; api.SFX.geoThud && api.SFX.geoThud(); api.shakeCam(3, s.dir); }
      for (const e of foes()) {
        if (s.hit.has(e) || !feetBand(e, s.gy, S.band + (e.h || 16) * 0.5) || !api.overlap({ l: x0, r: x1, t: s.gy - 14, b: s.gy + 2 }, api.box(e))) continue;
        s.hit.add(e); api.hurtAs('heavy', e, dmg(S.k), s.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, s.dir, 6); hitstopOnce(s, 0.06);
        if (!e.alive) continue;
        const big = K.isBig(e);
        if (!big && K.liftable(e)) {
          if (!s.first) { s.first = e; e.stagger = Math.max(e.stagger || 0, S.hold); e.vx = 0; api.number(e.x, e.y - (e.h || 16) - 14, 'UNDER THE WEIGHT', C.hi); }   /* the first foe is held beneath it a second: a common foe only */
          else e.stagger = Math.max(e.stagger || 0, 0.3); }
      }
    }
    for (const s of slabs) if (s.t >= GT.topple.t + 0.25) { api.dust(s.x + s.dir * s.len * 0.5, s.gy, 8); api.burst(s.x + s.dir * s.len * 0.8, s.gy - 4, 10, [C.base, C.hi, C.lo, C.moss], 70, 0.5); api.SFX.geoCrumble && api.SFX.geoCrumble(); s.done = true; }
    slabs = slabs.filter(s => !s.done);
  }

  /* ==== L30 B STONE STEP (UP+C beside one of her pillars) ==== */
  function stepTry() {
    const p = P(), S = GT.step; if (!T('gstep') || !p.ground || cdLeft('geoStepAt') > 0) return false;
    const st = K.pieces().filter(q => q.capped && !q.gone && q.kind === 'pillar' && q.x1 - q.x0 === TS && Math.abs(p.y - q.y1) <= S.floorTol && p.x > q.x0 - S.reach && p.x < q.x1 + S.reach)
      .sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - p.x) - Math.abs((b.x0 + b.x1) / 2 - p.x))[0];
    if (!st) return false;
    const have = st.cells.length, want = Math.min(S.cells, S.maxCells - have); if (want <= 0) { api.number(p.x, p.y - 30, 'AS TALL AS IT GROWS', '#9aa39a'); return false; }
    const tx = st.cells[0].tx, top = Math.min(...st.cells.map(c => c.ty)), cells = [];
    for (let k = 1; k <= want; k++) { if (!K.freeCell(tx, top - k)) break; cells.push([tx, top - k]); }
    if (!cells.length) { api.number(p.x, p.y - 30, 'NO ROOM OVERHEAD', '#9aa39a'); return false; }
    const newTop = (top - cells.length) * TS; if (!K.roomAbove(p, newTop)) { api.number(p.x, p.y - 30, 'NO ROOM OVERHEAD', '#9aa39a'); return false; }
    if (!api.spend(S.cost)) { api.SFX.clank && api.SFX.clank(); api.number(p.x, p.y - 26, 'NO WIND FOR IT', '#9aa39a'); return false; }
    K.grow(st, cells);
    p.geoStepAt = api.time + S.cd; p.x = (st.x0 + st.x1) / 2; p.y = newTop; p.vy = -40; p.vx = 0; p.ground = false; p.coyote = 0; p.onMover = null;
    api.kitPose && api.kitPose(p, 'gStep', 0.32); api.dust(p.x, p.y + cells.length * TS, 8); api.ringAt(p.x, p.y + 4, 14, C.rune, 0.25); api.shakeCam(2); api.SFX.geoRise && api.SFX.geoRise();
    api.squash && api.squash(0.8, 1.25, 0.1); api.number(p.x, p.y - 34, 'STONE STEP', C.rune); return true;
  }

  /* ==== L35 SEISMIC WELL (DOWN+C with no stone standing) ==== */
  function wellTry() {
    const p = P(), W = GT.well; if (!T('gwell') || !p.ground || K.standing() > 0 || cdLeft('geoWellAt') > 0) return false;
    const tx = Math.floor((p.x + p.face * 56) / TS), fy = K.floorRow(tx, Math.floor((p.y - 1) / TS), 2); if (fy === null) return false;
    p.geoWellAt = api.time + W.cd; p.atk = -1; p.vx = 0; p.blastT = Math.max(p.blastT || 0, 0.3);
    wells.push({ x: tx * TS + TS / 2, gy: fy * TS, t: 0, popped: false, stopped: false, hit: new Set() });
    api.kitPose && api.kitPose(p, 'gHeave', 0.4); api.SFX.geoQuake && api.SFX.geoQuake(); api.shakeCam(2); api.number(p.x, p.y - 34, 'SEISMIC WELL', C.rune); return true;
  }
  function stepWells(dt) {
    const W = GT.well;
    for (const w of wells) {
      w.t += dt;
      if (!w.popped) {
        for (const e of foes()) {
          if (Math.abs(e.x - w.x) > W.r || !feetBand(e, w.gy, W.band)) continue;
          const big = K.isBig(e); e.geoSlowT = api.time + 0.12; e.geoSlow = big ? W.slowB : W.slowC;   /* slowed; main.js updateEnemies reads it */
          if (!big && K.liftable(e)) { const dx = w.x - e.x, step = Math.sign(dx) * Math.min(Math.abs(dx), W.pull * dt), nx = e.x + step; if (Math.abs(dx) > 3 && !api.isSolid(Math.floor((nx + Math.sign(dx) * 6) / TS), Math.floor((e.y - 8) / TS))) e.x = nx; } }   /* bosses are slowed, never pulled */
        if (api.parts && Math.random() < dt * 40) { const a = Math.random() * 6.28, r = W.r * (0.6 + Math.random() * 0.4); api.parts.push({ x: w.x + Math.cos(a) * r, y: w.gy - 1, vx: -Math.cos(a) * 40, vy: -8, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? C.lo : '#8c6844', size: 1, grav: 0 }); }
        if (w.t >= W.t) {
          w.popped = true; w.popT = 0;
          api.ringAt(w.x, w.gy - 4, 30, C.rune, 0.3); api.ringAt(w.x, w.gy - 2, W.r, C.hi, 0.4); api.dust(w.x - 8, w.gy, 6); api.dust(w.x + 8, w.gy, 6); api.burst(w.x, w.gy - 6, 12, [C.base, C.hi, C.lo, C.rune], 150, 0.5, 300, 2);
          api.SFX.geoThud && api.SFX.geoThud(); api.SFX.geoBlast ? api.SFX.geoBlast() : api.SFX.geoCrumble && api.SFX.geoCrumble(); api.shakeCam(5); hitstopOnce(w, 0.06);   /* a sharp pop, one stop */
          for (const e of foes()) {
            if (Math.abs(e.x - w.x) > W.r + 6 || !feetBand(e, w.gy, W.band)) continue;
            api.hurtAs('heavy', e, dmg(W.k), w.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(e.x - w.x) || 1, 5);
            if (e.alive && !K.isBig(e) && K.liftable(e) && api.floorFoe(e, W.down)) api.number(e.x, e.y - (e.h || 16) - 14, 'KNOCKED DOWN', C.hi); } }
      } else w.popT += dt;
    }
    wells = wells.filter(w => !w.popped || w.popT < 0.5);
  }

  /* ==== L40 A SHATTER RECALL (called by the recall when its stone arrives) ==== */
  const shatterOn = () => T('gshatter');
  const foeNear = x => foes().some(e => Math.abs(e.x - x) <= GT.shatter.near && feetBand(e, P().y, 40));
  /* recall() asks once, before it takes the stones: with a foe near her the stones will burst on arrival; with nothing near they re-plant as before (a tap of DOWN never spends the board for nothing) */
  function shatterWanted() { return shatterOn() && foeNear(P().x); }
  function shatterAt(x, gy) {
    const S = GT.shatter, tag = shTag && api.time - shTag.t < 2.5 ? shTag : (shTag = { t: api.time, m: new Map(), down: new Set(), stopped: false });
    api.ringAt(x, gy - 8, S.r, C.rune, 0.28); api.ringAt(x, gy - 2, S.r * 1.2, C.hi, 0.36); api.dust(x - 6, gy, 5); api.dust(x + 6, gy, 5);
    api.burst(x, gy - 8, 12, [C.base, C.hi, C.lo, C.rune], 170, 0.5, 300, 2); api.SFX.geoCrumble && api.SFX.geoCrumble(); api.SFX.geoBlast && api.SFX.geoBlast(); api.shakeCam(3); hitstopOnce(tag, 0.05);
    for (const e of foes()) {
      const b = api.box(e), dx = Math.max(b.l - x, 0, x - b.r), dy = Math.max(b.t - (gy - 8), 0, (gy - 8) - b.b); if (Math.hypot(dx, dy) > S.r) continue;
      if ((tag.m.get(e) || 0) >= S.perFoe) continue; tag.m.set(e, (tag.m.get(e) || 0) + 1);
      api.hurtAs('heavy', e, dmg(S.k), x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(e.x - x) || 1, 5);
      if (e.alive && !K.isBig(e) && K.liftable(e) && !tag.down.has(e) && api.floorFoe(e, S.down)) { tag.down.add(e); api.number(e.x, e.y - (e.h || 16) - 14, 'THROWN OFF', C.hi); } }
  }

  /* ==== L40 B CAIRN (a broken stone leaves gravel) ==== */
  function crumbled(st, why) {
    if (!T('gcairn') || !st.capped || (why !== 'broken' && why !== 'rammed')) return;
    const C2 = GT.cairn, cx = (st.x0 + st.x1) / 2;
    for (let i = 0; i < C2.n; i++) mines.push({ x: cx + (i - 1) * 11, gy: st.y1, born: api.time, life: C2.life });
    while (mines.length > C2.max) mines.shift();
    api.dust(cx, st.y1, 6); api.number(cx, st.y0 - 22, 'CAIRN', C.hi);
  }
  function stepMines(dt) {
    const M = GT.cairn; if (!mines.length) return;
    for (const m of mines) m.life -= dt;
    for (const m of mines) {
      if (m.life <= 0 || m.gone) continue;
      for (const e of foes()) {
        if (Math.abs(e.x - m.x) > M.r + (e.w || 12) / 2 || !feetBand(e, m.gy, 10)) continue;
        e.cairnN = e.cairnT > api.time ? (e.cairnN | 0) : 0; e.cairnT = api.time + 3;
        if (e.cairnN >= M.perFoe) continue; e.cairnN++; m.gone = true;
        api.hurtAs('heavy', e, dmg(M.k), m.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(e.x - m.x) || 1, 5);
        api.burst(m.x, m.gy - 3, 9, [C.base, C.hi, C.lo, '#8c6844'], 120, 0.4, 320); api.dust(m.x, m.gy, 4); api.ringAt(m.x, m.gy - 3, 12, C.hi, 0.18); api.SFX.geoShard && api.SFX.geoShard(); api.SFX.geoBounce && api.SFX.geoBounce();
        if (e.alive && !K.isBig(e) && K.liftable(e)) e.stagger = Math.max(e.stagger || 0, 0.4);
        break; } }
    mines = mines.filter(m => m.life > 0 && !m.gone);
  }

  /* ==== L45 GEODE (the full-hold pillar finds a foe) ==== */
  function geode(e) {
    if (!T('ggeode') || !e || !e.alive) return false;
    const G = GT.geode, big = K.isBig(e);
    geodes.push({ e, t: 0, big, x: e.x, y: e.y, stopped: false });
    if (big) open(e, G.open); else { e.frozen = Math.max(e.frozen || 0, G.fuse); e.stagger = Math.max(e.stagger || 0, G.fuse); e.vx = 0; api.number(e.x, e.y - (e.h || 16) - 20, 'CRYSTAL', C.crystal); }
    api.ringAt(e.x, e.y - 8, 16, C.crystal, 0.3); api.SFX.geoRise && api.SFX.geoRise(); api.SFX.cutStage && api.SFX.cutStage(3); return true;   /* a growing chime */
  }
  function stepGeodes(dt) {
    const G = GT.geode;
    for (const g of geodes) {
      g.t += dt; if (g.e.alive) { g.x = g.e.x; g.y = g.e.y; if (!g.big) g.e.vx = 0; }
      if (g.t >= G.fuse) { g.done = true;
        if (g.e.alive) { if (!g.big) g.e.frozen = 0; api.hurtAs('heavy', g.e, dmg(G.k), g.x, false); }
        api.burst(g.x, g.y - 8, 18, [C.crystal, C.crystal2, '#ffffff', C.hi], 190, 0.55, 300, 2); api.ringAt(g.x, g.y - 8, 26, C.crystal2, 0.3); api.SFX.geoBlast && api.SFX.geoBlast(); api.SFX.geoShard && api.SFX.geoShard(); api.shakeCam(4); api.hitstop(0.08); } }
    geodes = geodes.filter(g => !g.done);
  }

  /* ==== L50 CAPSTONES. The board (the stones consumed) arrives as [{x, gy, h}]. Both spend it; one 40 s clock on P ==== */
  const capsOn = () => T('gfault') || T('ghost');
  const capReady = () => !capsOn() || api.time >= (P().geoCapAt || 0);
  const capName = () => T('gfault') ? 'THE GREAT FAULT' : T('ghost') ? 'THE STONE HOST' : null;
  function greatFault(stones) {
    const p = P(), F = GT.fault; p.geoCapAt = api.time + F.cd; p.atk = -1; p.vx = 0;
    waves.push({ x: p.x, y: p.y, face: p.face, t: 0, w: 0, hits: [new Set(), new Set(), new Set()], fired: [false, false, false], stopped: false, opened: new Set(), n: Math.min(3, Math.max(1, stones.length)) });
    for (let i = 0; i < F.waves; i++) tells.push({ x: p.x + (i % 2 ? -1 : 1) * p.face * (56 + 36 * Math.floor(i / 2 + 1)), gy: Math.floor((p.y + 1) / TS) * TS, y: p.y, t: 0, at: F.lead + i * F.gap, shelf: false });
    api.kitPose && api.kitPose(p, 'gAval', 0.5); api.hitstop(0.12); api.ringAt(p.x, p.y - 2, 26, C.rune, 0.4); api.dust(p.x, p.y, 10); api.shakeCam(4);
    api.SFX.geoQuake && api.SFX.geoQuake(); api.number(p.x, p.y - 34, 'THE GREAT FAULT', C.rune); return true;
  }
  function raiseShelf(tl) {
    const F = GT.fault, tx = Math.floor(tl.x / TS), fy = K.floorRow(tx, Math.floor((tl.y - 1) / TS), 3); if (fy === null) return;
    const ty = fy - F.shelfUp, cells = []; for (let k = -1; k <= 1; k++) cells.push([tx + k, ty]);
    const placed = K.place('shelf', cells, K.T().ONEWAY, { free: true, life: F.shelfLife });
    if (placed) { api.dust((placed.x0 + placed.x1) / 2, placed.y1, 6); api.SFX.geoRise && api.SFX.geoRise(); }
  }
  function stepWaves(dt) {
    const F = GT.fault;
    for (const w of waves) {
      w.t += dt;
      for (let i = 0; i < F.waves; i++) {
        const t0 = F.lead + i * F.gap; if (w.fired[i] || w.t < t0) continue; w.fired[i] = true; w.cur = i; w.front = 0; w.fronts = (w.fronts || []).concat([{ i, f: 0 }]);
        api.shakeCam(5); api.SFX.geoQuake && api.SFX.geoQuake(); api.SFX.geoThud && api.SFX.geoThud(); api.ringAt(w.x, w.y - 2, 22, C.rune, 0.3); }
      for (const fr of w.fronts || []) {
        const was = fr.f; fr.f = Math.min(api.VW / 2 + 40, fr.f + F.front * dt);
        for (let x = was; x < fr.f; x += 14) for (const s of [-1, 1]) { api.dust(w.x + s * x, Math.floor((w.y + 1) / TS) * TS, 1); }
        for (const e of foes()) {
          const dx = Math.abs(e.x - w.x); if (dx > fr.f || dx < was - 12 || w.hits[fr.i].has(e) || Math.abs(e.y - w.y) > F.band) continue;
          w.hits[fr.i].add(e); const big = K.isBig(e);
          api.hurtAs('heavy', e, dmg(F.k), w.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(e.x - w.x) || 1, 5);
          if (e.alive) { if (big) { if (fr.i === F.waves - 1 && !w.opened.has(e)) { w.opened.add(e); open(e, F.open); } }
            else if (K.liftable(e) && api.floorFoe(e, F.down)) api.number(e.x, e.y - (e.h || 16) - 14, 'THROWN DOWN', C.hi); } } }
    }
    for (const w of waves) if (w.t > F.lead + (F.waves - 1) * F.gap + 1.1) w.done = true;
    waves = waves.filter(w => !w.done);
    for (const tl of tells) { tl.t += dt; if (!tl.shelf && tl.t >= tl.at) { tl.shelf = true; raiseShelf(tl); } }
    tells = tells.filter(tl => !tl.shelf || tl.t < tl.at + 0.5);
  }
  function stoneHost(stones) {
    const p = P(), H = GT.host; p.geoCapAt = api.time + H.cd; p.atk = -1; p.vx = 0;
    const tag = { m: new Map(), stopped: false }, life = H.life;
    for (const s of stones.slice(0, 4)) hosts.push({ x: s.x, y: s.gy, vy: 0, face: Math.sign(P().x - s.x) || -p.face, life, atkT: 0.6, swing: 0, rise: 0, tag, hit: 0 });
    api.kitPose && api.kitPose(p, 'gAval', 0.5); api.hitstop(0.12); api.ringAt(p.x, p.y - 2, 26, C.rune, 0.4); api.shakeCam(4);
    api.SFX.geoQuake && api.SFX.geoQuake(); api.SFX.geoRise && api.SFX.geoRise(); for (const h of hosts) { api.dust(h.x, h.y, 8); api.ringAt(h.x, h.y - 10, 14, C.rune, 0.3); }
    api.number(p.x, p.y - 34, 'THE STONE HOST', C.rune); return true;
  }
  function stepHosts(dt) {
    const H = GT.host;
    for (const g of hosts) {
      g.life -= dt; g.rise = Math.min(1, g.rise + dt * 4); g.atkT -= dt; g.swing = Math.max(0, g.swing - dt);
      const tgt = g.rise < 1 ? null : foes().filter(e => Math.abs(e.x - g.x) < H.reach && Math.abs(e.y - g.y) < H.band).sort((a, b) => Math.abs(a.x - g.x) - Math.abs(b.x - g.x))[0];
      if (tgt) { g.face = Math.sign(tgt.x - g.x) || g.face; const ad = Math.abs(tgt.x - g.x) - (tgt.w || 12) / 2;
        if (ad > 9) { const nx = g.x + g.face * H.sp * dt; if (!api.isSolid(Math.floor((nx + g.face * 6) / TS), Math.floor((g.y - 8) / TS))) g.x = nx; if (Math.random() < dt * 12) api.dust(g.x, g.y, 1); }
        else if (g.atkT <= 0) { g.atkT = H.every; g.swing = 0.2;
          if ((g.tag.m.get(tgt) || 0) < H.perFoeHits) { g.tag.m.set(tgt, (g.tag.m.get(tgt) || 0) + 1);
            api.hurtAs('heavy', tgt, dmg(H.k), g.x, false); api.sparks(tgt.x, tgt.y - 8, g.face, 5); api.SFX.geoThud && api.SFX.geoThud();
            if (tgt.alive && !K.isBig(tgt) && K.liftable(tgt)) tgt.stagger = Math.max(tgt.stagger || 0, 0.25); } } }
      const under = Math.floor((g.y + 1) / TS), gx = Math.floor(g.x / TS); if (!api.isSolid(gx, under) && !api.isOneWay(api.tileAt(gx, under))) { g.vy = Math.min(500, g.vy + 900 * dt); g.y += g.vy * dt; if (g.y > api.LH * TS) g.life = 0; } else { g.vy = 0; g.y = under * TS; }
      if (g.life <= 0) { api.burst(g.x, g.y - 10, 14, [C.base, C.hi, C.moss], 70, 0.6); api.SFX.geoCrumble && api.SFX.geoCrumble(); }
    }
    hosts = hosts.filter(g => g.life > 0);
  }

  /* ==== THE FRAME ==== */
  function update(dt) {
    if (!api.isGeo()) return;
    toppleCheck(); stepSlings(dt); stepSlabs(dt); stepWells(dt); stepMines(dt); stepGeodes(dt); stepWaves(dt); stepHosts(dt);
  }
  /* UP+C when the ultimate did not take it: STONE STEP beside a pillar, else SLINGSTONE. true = it was this (the caller eats the C so the ward does not rise) */
  function upC() { return free() && (stepTry() || slingTry()); }
  function clear() { slings = []; wells = []; slabs = []; mines = []; waves = []; tells = []; hosts = []; geodes = []; shTag = null; }

  /* ==== DRAW (world space; g, cx, cy = the camera) ==== */
  function disc(g, x, y, r, spin) { x = Math.round(x); y = Math.round(y); g.fillStyle = C.dark; g.beginPath(); g.arc(x, y, r + 1, 0, 7); g.fill(); g.fillStyle = C.base; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = C.hi; g.fillRect(x - 1, y - r + 1, Math.max(2, r - 1), 1); g.fillStyle = C.lo; g.fillRect(Math.round(x + Math.cos(spin) * r * 0.5), Math.round(y + Math.sin(spin) * r * 0.5), 2, 2); }
  function draw(g, cx, cy) {
    for (const s of slings) disc(g, s.x - cx, s.y - cy, GT.sling.r, s.spin);
    for (const s of slabs) { const k = Math.min(1, s.t / GT.topple.t), reach = Math.round(s.len * k), x0 = Math.round(s.dir > 0 ? s.x : s.x - reach) - cx, y = Math.round(s.gy) - cy;
      g.fillStyle = C.dark; g.fillRect(x0, y - 9, reach, 10); g.fillStyle = C.base; g.fillRect(x0, y - 8, reach, 8); g.fillStyle = C.hi; g.fillRect(x0, y - 8, reach, 2); g.fillStyle = C.lo; for (let i = 6; i < reach; i += 14) g.fillRect(x0 + i, y - 6, 1, 6);
      g.fillStyle = C.moss; g.fillRect(x0 + 3, y - 9, 5, 1); }
    for (const w of wells) { const x = Math.round(w.x - cx), y = Math.round(w.gy - cy), k = w.popped ? 0 : Math.min(1, w.t / GT.well.t);
      if (!w.popped) { g.fillStyle = '#26241e'; g.fillRect(x - Math.round(GT.well.r * (0.5 + 0.5 * k)), y - 1, Math.round(GT.well.r * (1 + k)), 3); g.fillStyle = C.rune; for (let i = 0; i < 6; i++) { const a = api.time * 5 + i * 1.05, r = GT.well.r * (1 - ((api.time * 1.2 + i / 6) % 1)); g.fillRect(Math.round(x + Math.cos(a) * r), y - 1 - Math.round(Math.abs(Math.sin(a)) * 3), 2, 1); } } }
    for (const m of mines) { const x = Math.round(m.x - cx), y = Math.round(m.gy - cy), a = m.life < 2 ? 0.5 + 0.5 * Math.sin(api.time * 20) : 1; g.globalAlpha = a; g.fillStyle = C.dark; g.fillRect(x - 4, y - 3, 8, 3); g.fillStyle = C.base; g.fillRect(x - 3, y - 4, 4, 2); g.fillRect(x + 1, y - 3, 3, 2); g.fillStyle = C.hi; g.fillRect(x - 2, y - 4, 2, 1); g.fillStyle = C.rune; g.fillRect(x, y - 3, 1, 1); g.globalAlpha = 1; }
    for (const tl of tells) if (!tl.shelf) { const x = Math.round(tl.x - cx), y = Math.round(tl.gy - GT.fault.shelfUp * TS - cy), a = 0.4 + 0.4 * Math.sin(api.time * 30); g.globalAlpha = a; g.fillStyle = C.rune; for (let i = -24; i < 24; i += 8) g.fillRect(x + i, y, 4, 1); g.globalAlpha = 1; }
    for (const w of waves) for (const fr of w.fronts || []) if (fr.f < api.VW / 2 + 40) for (const s of [-1, 1]) { const x = Math.round(w.x + s * fr.f - cx), y = Math.round(Math.floor((w.y + 1) / TS) * TS - cy);
      for (let k = 0; k < 7; k++) { g.fillStyle = k > 4 ? C.hi : k % 2 ? C.base : C.lo; g.fillRect(x - 3 + Math.floor(k / 3), y - 1 - k, Math.max(1, 6 - k), 1); } }
    for (const e of geodes) { const x = Math.round(e.x - cx), y = Math.round(e.y - cy), a = 0.5 + 0.5 * Math.min(1, e.t / GT.geode.fuse); g.globalAlpha = e.big ? 0.8 : a;
      g.fillStyle = C.crystal; g.fillRect(x - 7, y - 4, 3, 4); g.fillRect(x + 5, y - 6, 3, 6); g.fillRect(x - 2, y - 14, 4, 14); g.fillStyle = C.crystal2; g.fillRect(x - 1, y - 14, 1, 10); g.fillRect(x - 6, y - 4, 1, 3); g.globalAlpha = 1;
      if (e.t > GT.geode.fuse * 0.6) { g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 8 + (e.t * 40 | 0) % 5, 1, 2); } }
    for (const h of hosts) { const x = Math.round(h.x - cx), y = Math.round(h.y - cy), hh = Math.round(18 * h.rise), f = h.face, sw = h.swing > 0 ? 4 : 0, bl = h.life < 1.5 && Math.sin(api.time * 30) > 0;
      if (bl) continue; g.fillStyle = C.lo; g.fillRect(x - 5, y - hh, 10, hh); g.fillStyle = C.base; g.fillRect(x - 4, y - hh, 8, hh - 1); g.fillStyle = C.hi; g.fillRect(x - 4, y - hh, 8, 2);
      if (hh > 12) { g.fillStyle = C.rune; g.fillRect(x + f * 2, y - hh + 4, 2, 1); g.fillRect(x - 1, y - hh + 8, 2, 2); g.fillStyle = C.lo; g.fillRect(x + f * (5 + sw) - 2, y - hh + 7, 4, 4); g.fillStyle = C.base; g.fillRect(x - 3, y - 3, 2, 3); g.fillRect(x + 1, y - 3, 2, 3); } }
  }
  return { update, draw, clear, upC, slingTry, stepTry, wellTry, topple, shatterWanted, shatterAt, crumbled, geode, greatFault, stoneHost, capsOn, capReady, capName,
    slings: () => slings, wells: () => wells, slabs: () => slabs, mines: () => mines, waves: () => waves, hosts: () => hosts, geodes: () => geodes };
}
