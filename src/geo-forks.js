// src/geo-forks.js - THE NEW BODIES OF THE GEOMANCER'S FORK SIDES (claude/geofork; data in src/forks-geomancer.js). Donor: claude/geopack's src/geo-tech.js (TOPPLE, SHATTER RECALL, CAIRN, GEODE, GREAT FAULT, STONE HOST),
// re-tuned for the fork frame: each side is read through fk(id) (= main.js gb(id): picked AND level reached AND slotted/worn, false flag off) and nothing here runs unless a side is picked.
// makeGeoForks(api, K, fk) is built by makeGeomancer (src/geomancer.js), which owns the board; K = the handful of its internals this needs. Pure: no DOM, no main.js.
// THE LAW (forkplan sec 2 rule 4): every blow is swordDmg x k (K.dmg), no flat damage; a boss takes damage and, where noted, an OPENING (e.disarmOpenT, the told window ENTOMB uses), never a free stagger,
// a pin, a freeze or an immunity; a foe takes at most `perFoe` hits from one use; one hit-stop per cast; particle dice are Math.random, game dice are untouched.
// The two CAPSTONES keep MOUNTAIN COLLAPSE's damage budget (n stones x avalanche.boss 8.0 on a boss, x avalanche.roll 2.0 on a common) so a capstone is a side-grade, not a trap (geopack Q1): see GF.fault / GF.host.
export const GF = {
  mine: { k: 0.5, life: 8, r: 9, stagger: 0.4 },                                  /* RUBBLE ROLL: one pebble mine */
  topple: { k: 0.9, len: 60, t: 0.42, hold: 1.0, band: 16, near: 112 },            /* TOPPLE: the slab the fist drives over */
  shatter: { k: 0.45, r: 34, perFoe: 2, near: 64, down: 0.9 },                     /* SHATTER RECALL */
  cairn: { n: 3, k: 0.4, perFoe: 2, life: 14, r: 9, max: 9 },                      /* CAIRN */
  geode: { fuse: 1.5, k: 1.5, open: 1.2 },                                         /* GEODE */
  fault: { waves: 3, gap: 0.7, lead: 0.45, band: 70, front: 520, shelfLife: 6, shelfW: 3, shelfUp: 3, down: 0.9, open: 1.2 },   /* GREAT FAULT: per wave k = avalanche.boss x n / 3 (boss), avalanche.roll x n / 3 (common) */
  host: { life: 10, every: 1.25, sp: 110, perFoeHits: 24, reach: 260, band: 70, k: 1.0 },   /* STONE HOST: k 1.0 a swing x 8 swings = avalanche.boss per golem */
};
const C = { base: '#7c7a6e', hi: '#a8a696', lo: '#5e5c54', dark: '#44423a', moss: '#6f9a4a', rune: '#e8a83a', glow: '#fff0c0', crystal: '#9fe0e8', crystal2: '#d8f6fa' };
export function makeGeoForks(api, K, fk, AV) {
  const TS = api.TS;
  let mines = [], slabs = [], waves = [], tells = [], hosts = [], geodes = [], shTag = null;
  const P = () => api.P;
  const foes = () => api.enemies.filter(e => e.alive && !(e.gone > 0) && !e.harmless && !e.turncoat);
  const dmg = (k, key) => K.dmg(k, key || null);
  const open = (e, s) => { e.disarmOpenT = Math.max(e.disarmOpenT || 0, api.time + s); api.number(e.x, e.y - (e.h || 16) - 20, 'OPENED UP', C.rune); };
  const stopOnce = (o, s) => { if (o.stopped) return; o.stopped = true; api.hitstop(s); };
  const band = (e, gy, b) => Math.abs(e.y - gy) <= b;
  const hurt = (e, k, x, key) => { api.hurtAs('heavy', e, dmg(k, key), x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(e.x - x) || 1, 5); };

  /* ==== L21 A RUBBLE ROLL: the burrow comes up on a pebble mine (one at a time) ==== */
  function surface() {
    if (!fk('grubble')) return null; const p = P(), gy = Math.floor((p.y + 1) / TS) * TS;
    mines = mines.filter(m => m.kind !== 'pebble'); mines.push({ kind: 'pebble', x: p.x, gy, life: GF.mine.life, born: api.time });
    api.dust(p.x, gy, 4); api.number(p.x, p.y - 30, 'PEBBLE MINE', C.hi); return true;
  }
  /* ==== L36 B CAIRN: a stone a foe breaks leaves gravel ==== */
  function crumbled(st, why) {
    if (!fk('gcairn') || !st.capped || (why !== 'broken' && why !== 'rammed')) return;
    const cx = (st.x0 + st.x1) / 2;
    for (let i = 0; i < GF.cairn.n; i++) mines.push({ kind: 'gravel', x: cx + (i - 1) * 11, gy: st.y1, life: GF.cairn.life, born: api.time });
    while (mines.filter(m => m.kind === 'gravel').length > GF.cairn.max) { const i = mines.findIndex(m => m.kind === 'gravel'); mines.splice(i, 1); }
    api.dust(cx, st.y1, 6); api.number(cx, st.y0 - 22, 'CAIRN', C.hi);
  }
  function stepMines(dt) {
    if (!mines.length) return;
    for (const m of mines) m.life -= dt;
    for (const m of mines) {
      if (m.life <= 0 || m.gone) continue; const pebble = m.kind === 'pebble', k = pebble ? GF.mine.k : GF.cairn.k;
      for (const e of foes()) {
        if (Math.abs(e.x - m.x) > (pebble ? GF.mine.r : GF.cairn.r) + (e.w || 12) / 2 || !band(e, m.gy, 10) || e.flying) continue;
        e.geoMineN = e.geoMineT > api.time ? (e.geoMineN | 0) : 0; e.geoMineT = api.time + 3; if (!pebble && e.geoMineN >= GF.cairn.perFoe) continue; e.geoMineN++; m.gone = true;
        hurt(e, k, m.x); api.burst(m.x, m.gy - 3, 9, [C.base, C.hi, C.lo, '#8c6844'], 120, 0.4, 320); api.dust(m.x, m.gy, 4); api.ringAt(m.x, m.gy - 3, 12, C.hi, 0.18); api.SFX.geoShard && api.SFX.geoShard();
        if (e.alive && !K.isBig(e) && K.liftable(e)) e.stagger = Math.max(e.stagger || 0, pebble ? GF.mine.stagger : 0.4);
        break; } }
    mines = mines.filter(m => m.life > 0 && !m.gone);
  }

  /* ==== L24 A TOPPLE: the third blow drives the nearest of her standing stones over (never the last) ==== */
  function toppleFist() {
    if (!fk('gtopple')) return false; const p = P(), own = K.pieces().filter(q => q.capped && !q.gone && q.kind === 'pillar'); if (own.length < 2) return false;
    const st = own.filter(q => (((q.x0 + q.x1) / 2) - p.x) * p.face > -4 && Math.abs(((q.x0 + q.x1) / 2) - p.x) <= GF.topple.near && Math.abs(p.y - q.y1) <= 24)
      .sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - p.x) - Math.abs((b.x0 + b.x1) / 2 - p.x))[0]; if (!st) return false;
    const cx = (st.x0 + st.x1) / 2, gy = st.y1, h = Math.max(1, Math.round((st.y1 - st.y0) / TS));
    K.crumble(st, 'topple'); slabs.push({ x: cx, dir: p.face, gy, h, t: 0, len: GF.topple.len + 8 * h, hit: new Set(), first: null, stopped: false, landed: false });
    api.SFX.geoRise && api.SFX.geoRise(); api.shakeCam(2, p.face); api.dust(cx, gy, 6); api.number(cx, st.y0 - 14, 'TOPPLE', C.hi); return true;
  }
  function stepSlabs(dt) {
    const S = GF.topple;
    for (const s of slabs) {
      s.t += dt; const k = Math.min(1, s.t / S.t), reach = s.len * k, x0 = s.dir > 0 ? s.x : s.x - reach, x1 = s.dir > 0 ? s.x + reach : s.x;
      if (k >= 0.5 && !s.landed) { s.landed = true; api.SFX.geoThud && api.SFX.geoThud(); api.shakeCam(3, s.dir); }
      for (const e of foes()) {
        if (s.hit.has(e) || !band(e, s.gy, S.band + (e.h || 16) * 0.5) || !api.overlap({ l: x0, r: x1, t: s.gy - 14, b: s.gy + 2 }, api.box(e))) continue;
        s.hit.add(e); hurt(e, S.k, s.x); stopOnce(s, 0.06); if (!e.alive) continue;
        if (!K.isBig(e) && K.liftable(e)) { if (!s.first) { s.first = e; e.stagger = Math.max(e.stagger || 0, S.hold); e.vx = 0; api.number(e.x, e.y - (e.h || 16) - 14, 'UNDER THE WEIGHT', C.hi); } else e.stagger = Math.max(e.stagger || 0, 0.3); } } }   /* a boss takes the blow only */
    for (const s of slabs) if (s.t >= S.t + 0.25) { api.dust(s.x + s.dir * s.len * 0.5, s.gy, 8); api.burst(s.x + s.dir * s.len * 0.8, s.gy - 4, 10, [C.base, C.hi, C.lo, C.moss], 70, 0.5); api.SFX.geoCrumble && api.SFX.geoCrumble(); s.done = true; }
    slabs = slabs.filter(s => !s.done);
  }
  /* L24 B SHARD FIST: two shards flat ahead, one chest-high and one low (they ride geomancer.js's own shards list, so its step does the hit and the stagger) */
  function shardFist() {
    if (!fk('gshards')) return false; const p = P(), list = K.shards();
    for (const [dy, vy] of [[-16, -22], [-5, 8]]) list.push({ x: p.x + p.face * 14, y: p.y + dy, vx: p.face * 340, vy, g: 100, life: 0.5, hit: new Set(), big: true, dmg: dmg(0.45) });
    api.SFX.geoShard && api.SFX.geoShard(); api.sparks(p.x + p.face * 14, p.y - 12, p.face, 4); return true;
  }

  /* ==== L32 A GEODE: the pillar's first small foe is sealed in crystal and bursts; a boss is opened, never sealed ==== */
  function geode(e) {
    if (!fk('ggeode') || !e || !e.alive) return false; const big = K.isBig(e);
    geodes.push({ e, t: 0, big, x: e.x, y: e.y });
    if (big) open(e, GF.geode.open); else { e.frozen = Math.max(e.frozen || 0, GF.geode.fuse); e.stagger = Math.max(e.stagger || 0, GF.geode.fuse); e.vx = 0; api.number(e.x, e.y - (e.h || 16) - 20, 'CRYSTAL', C.crystal); }
    api.ringAt(e.x, e.y - 8, 16, C.crystal, 0.3); api.SFX.geoRise && api.SFX.geoRise(); api.SFX.cutStage && api.SFX.cutStage(3); return true;
  }
  function stepGeodes(dt) {
    for (const g of geodes) {
      g.t += dt; if (g.e.alive) { g.x = g.e.x; g.y = g.e.y; if (!g.big) g.e.vx = 0; }
      if (g.t >= GF.geode.fuse) { g.done = true;
        if (g.e.alive) { if (!g.big) g.e.frozen = 0; hurt(g.e, GF.geode.k, g.x); }
        api.burst(g.x, g.y - 8, 18, [C.crystal, C.crystal2, '#ffffff', C.hi], 190, 0.55, 300, 2); api.ringAt(g.x, g.y - 8, 26, C.crystal2, 0.3); api.SFX.geoBlast && api.SFX.geoBlast(); api.SFX.geoShard && api.SFX.geoShard(); api.shakeCam(4); api.hitstop(0.08); } }
    geodes = geodes.filter(g => !g.done);
  }

  /* ==== L36 A SHATTER RECALL: asked once by recall(); with a foe near her the stones burst where they arrive (spent), with nothing near they re-plant as before ==== */
  const foeNear = x => foes().some(e => Math.abs(e.x - x) <= GF.shatter.near && band(e, P().y, 40));
  const shatterWanted = () => fk('gshatter') && foeNear(P().x);
  function shatterAt(x, gy) {
    const S = GF.shatter, tag = shTag && api.time - shTag.t < 2.5 ? shTag : (shTag = { t: api.time, m: new Map(), down: new Set(), stopped: false });
    api.ringAt(x, gy - 8, S.r, C.rune, 0.28); api.ringAt(x, gy - 2, S.r * 1.2, C.hi, 0.36); api.dust(x - 6, gy, 5); api.dust(x + 6, gy, 5);
    api.burst(x, gy - 8, 12, [C.base, C.hi, C.lo, C.rune], 170, 0.5, 300, 2); api.SFX.geoCrumble && api.SFX.geoCrumble(); api.SFX.geoBlast && api.SFX.geoBlast(); api.shakeCam(3); stopOnce(tag, 0.05);
    for (const e of foes()) {
      const b = api.box(e), dx = Math.max(b.l - x, 0, x - b.r), dy = Math.max(b.t - (gy - 8), 0, (gy - 8) - b.b); if (Math.hypot(dx, dy) > S.r) continue;
      if ((tag.m.get(e) || 0) >= S.perFoe) continue; tag.m.set(e, (tag.m.get(e) || 0) + 1); hurt(e, S.k, x);
      if (e.alive && !K.isBig(e) && K.liftable(e) && !tag.down.has(e) && api.floorFoe(e, S.down)) { tag.down.add(e); api.number(e.x, e.y - (e.h || 16) - 14, 'THROWN OFF', C.hi); } }
  }

  /* ==== L50 A THE GREAT FAULT: the board is spent; three fault waves run out BOTH ways, each hitting every foe on the floor band once and raising a one-way shelf (told by dashes first) ==== */
  function greatFault(stones) {
    const p = P(), F = GF.fault, n = Math.max(1, stones.length);
    waves.push({ x: p.x, y: p.y, t: 0, hits: [new Set(), new Set(), new Set()], fired: [false, false, false], fronts: [], opened: new Set(), n, stopped: false });
    for (let i = 0; i < F.waves; i++) tells.push({ x: p.x + (i % 2 ? -1 : 1) * p.face * (56 + 36 * Math.floor(i / 2 + 1)), gy: Math.floor((p.y + 1) / TS) * TS, y: p.y, t: 0, at: F.lead + i * F.gap, shelf: false });
    p.atk = -1; p.vx = 0; api.kitPose && api.kitPose(p, 'gAval', 0.5); api.hitstop(0.12); api.ringAt(p.x, p.y - 2, 26, C.rune, 0.4); api.dust(p.x, p.y, 10); api.shakeCam(4);
    api.SFX.geoQuake && api.SFX.geoQuake(); api.number(p.x, p.y - 34, 'THE GREAT FAULT', C.rune); return true;
  }
  function raiseShelf(tl) {
    const F = GF.fault, tx = Math.floor(tl.x / TS), fy = K.floorRow(tx, Math.floor((tl.y - 1) / TS), 3); if (fy === null) return;
    const ty = fy - F.shelfUp, cells = []; for (let k = -1; k <= 1; k++) cells.push([tx + k, ty]);
    const placed = K.place('shelf', cells, K.T().ONEWAY, { free: true, life: F.shelfLife });
    if (placed) { api.dust((placed.x0 + placed.x1) / 2, placed.y1, 6); api.SFX.geoRise && api.SFX.geoRise(); }
  }
  function stepWaves(dt) {
    const F = GF.fault;
    for (const w of waves) {
      w.t += dt;
      for (let i = 0; i < F.waves; i++) { const t0 = F.lead + i * F.gap; if (w.fired[i] || w.t < t0) continue; w.fired[i] = true; w.fronts.push({ i, f: 0 });
        api.shakeCam(5); api.SFX.geoQuake && api.SFX.geoQuake(); api.SFX.geoThud && api.SFX.geoThud(); api.ringAt(w.x, w.y - 2, 22, C.rune, 0.3); }
      for (const fr of w.fronts) {
        const was = fr.f; fr.f = Math.min(api.VW / 2 + 40, fr.f + F.front * dt);
        for (let x = was; x < fr.f; x += 14) for (const s of [-1, 1]) api.dust(w.x + s * x, Math.floor((w.y + 1) / TS) * TS, 1);
        for (const e of foes()) {
          const dx = Math.abs(e.x - w.x); if (dx > fr.f || dx < was - 12 || w.hits[fr.i].has(e) || Math.abs(e.y - w.y) > F.band) continue;
          w.hits[fr.i].add(e); const big = K.isBig(e), k = (big ? AV.boss : AV.roll) * w.n / 3;   /* per wave: a third of the collapse's whole budget at n = 3 */
          hurt(e, k, w.x, 'boulder');
          if (e.alive) { if (big) { if (fr.i === F.waves - 1 && !w.opened.has(e)) { w.opened.add(e); open(e, F.open); } }
            else if (K.liftable(e) && api.floorFoe(e, F.down)) api.number(e.x, e.y - (e.h || 16) - 14, 'THROWN DOWN', C.hi); } } }
    }
    for (const w of waves) if (w.t > F.lead + (F.waves - 1) * F.gap + 1.1) w.done = true;
    waves = waves.filter(w => !w.done);
    for (const tl of tells) { tl.t += dt; if (!tl.shelf && tl.t >= tl.at) { tl.shelf = true; raiseShelf(tl); } }
    tells = tells.filter(tl => !tl.shelf || tl.t < tl.at + 0.5);
  }
  /* ==== L50 B THE STONE HOST: every standing stone wakes as a golem where it stood ==== */
  function stoneHost(stones) {
    const p = P(), H = GF.host, tag = { m: new Map() };
    for (const s of stones.slice(0, 4)) hosts.push({ x: s.x, y: s.gy, vy: 0, face: Math.sign(p.x - s.x) || -p.face, life: H.life, atkT: 0.6, swing: 0, rise: 0, tag });
    p.atk = -1; p.vx = 0; api.kitPose && api.kitPose(p, 'gAval', 0.5); api.hitstop(0.12); api.ringAt(p.x, p.y - 2, 26, C.rune, 0.4); api.shakeCam(4);
    api.SFX.geoQuake && api.SFX.geoQuake(); api.SFX.geoRise && api.SFX.geoRise(); for (const h of hosts) { api.dust(h.x, h.y, 8); api.ringAt(h.x, h.y - 10, 14, C.rune, 0.3); }
    api.number(p.x, p.y - 34, 'THE STONE HOST', C.rune); return true;
  }
  function stepHosts(dt) {
    const H = GF.host;
    for (const g of hosts) {
      g.life -= dt; g.rise = Math.min(1, g.rise + dt * 4); g.atkT -= dt; g.swing = Math.max(0, g.swing - dt);
      const tgt = g.rise < 1 ? null : foes().filter(e => Math.abs(e.x - g.x) < H.reach && Math.abs(e.y - g.y) < H.band).sort((a, b) => Math.abs(a.x - g.x) - Math.abs(b.x - g.x))[0];
      if (tgt) { g.face = Math.sign(tgt.x - g.x) || g.face; const ad = Math.abs(tgt.x - g.x) - (tgt.w || 12) / 2;
        if (ad > 9) { const nx = g.x + g.face * H.sp * dt; if (!api.isSolid(Math.floor((nx + g.face * 6) / TS), Math.floor((g.y - 8) / TS))) g.x = nx; if (Math.random() < dt * 12) api.dust(g.x, g.y, 1); }
        else if (g.atkT <= 0) { g.atkT = H.every; g.swing = 0.2;
          if ((g.tag.m.get(tgt) || 0) < H.perFoeHits) { g.tag.m.set(tgt, (g.tag.m.get(tgt) || 0) + 1); hurt(tgt, H.k, g.x, 'boulder'); api.SFX.geoThud && api.SFX.geoThud();
            if (tgt.alive && !K.isBig(tgt) && K.liftable(tgt)) tgt.stagger = Math.max(tgt.stagger || 0, 0.25); } } }
      const under = Math.floor((g.y + 1) / TS), gx = Math.floor(g.x / TS); if (!api.isSolid(gx, under) && !api.isOneWay(api.tileAt(gx, under))) { g.vy = Math.min(500, g.vy + 900 * dt); g.y += g.vy * dt; if (g.y > api.LH * TS) g.life = 0; } else { g.vy = 0; g.y = under * TS; }
      if (g.life <= 0) { api.burst(g.x, g.y - 10, 14, [C.base, C.hi, C.moss], 70, 0.6); api.SFX.geoCrumble && api.SFX.geoCrumble(); }
    }
    hosts = hosts.filter(g => g.life > 0);
  }

  /* ==== THE FRAME ==== */
  function update(dt) { if (!mines.length && !slabs.length && !waves.length && !tells.length && !hosts.length && !geodes.length) return; stepMines(dt); stepSlabs(dt); stepGeodes(dt); stepWaves(dt); stepHosts(dt); }
  function clear() { mines = []; slabs = []; waves = []; tells = []; hosts = []; geodes = []; shTag = null; }

  /* ==== DRAW (world space; g, cx, cy = the camera). Greybox in the house stone palette: art owed ==== */
  function draw(g, cx, cy) {
    for (const m of mines) { const x = Math.round(m.x - cx), y = Math.round(m.gy - cy), a = m.life < 2 ? 0.5 + 0.5 * Math.sin(api.time * 20) : 1; g.globalAlpha = a; g.fillStyle = C.dark; g.fillRect(x - 4, y - 3, 8, 3); g.fillStyle = C.base; g.fillRect(x - 3, y - 4, 4, 2); g.fillRect(x + 1, y - 3, 3, 2); g.fillStyle = m.kind === 'pebble' ? C.rune : C.hi; g.fillRect(x - 1, y - 5, 2, 1); g.globalAlpha = 1; }
    for (const s of slabs) { const k = Math.min(1, s.t / GF.topple.t), reach = Math.round(s.len * k), x0 = Math.round(s.dir > 0 ? s.x : s.x - reach) - cx, y = Math.round(s.gy) - cy;
      g.fillStyle = C.dark; g.fillRect(x0, y - 9, reach, 10); g.fillStyle = C.base; g.fillRect(x0, y - 8, reach, 8); g.fillStyle = C.hi; g.fillRect(x0, y - 8, reach, 2); g.fillStyle = C.lo; for (let i = 6; i < reach; i += 14) g.fillRect(x0 + i, y - 6, 1, 6); }
    for (const tl of tells) if (!tl.shelf) { const x = Math.round(tl.x - cx), y = Math.round(tl.gy - GF.fault.shelfUp * TS - cy); g.globalAlpha = 0.4 + 0.4 * Math.sin(api.time * 30); g.fillStyle = C.rune; for (let i = -24; i < 24; i += 8) g.fillRect(x + i, y, 4, 1); g.globalAlpha = 1; }
    for (const w of waves) for (const fr of w.fronts) if (fr.f < api.VW / 2 + 40) for (const s of [-1, 1]) { const x = Math.round(w.x + s * fr.f - cx), y = Math.round(Math.floor((w.y + 1) / TS) * TS - cy);
      for (let k = 0; k < 7; k++) { g.fillStyle = k > 4 ? C.hi : k % 2 ? C.base : C.lo; g.fillRect(x - 3 + Math.floor(k / 3), y - 1 - k, Math.max(1, 6 - k), 1); } }
    for (const e of geodes) { const x = Math.round(e.x - cx), y = Math.round(e.y - cy), a = 0.5 + 0.5 * Math.min(1, e.t / GF.geode.fuse); g.globalAlpha = e.big ? 0.8 : a;
      g.fillStyle = C.crystal; g.fillRect(x - 7, y - 4, 3, 4); g.fillRect(x + 5, y - 6, 3, 6); g.fillRect(x - 2, y - 14, 4, 14); g.fillStyle = C.crystal2; g.fillRect(x - 1, y - 14, 1, 10); g.globalAlpha = 1; }
    for (const h of hosts) { const x = Math.round(h.x - cx), y = Math.round(h.y - cy), hh = Math.round(18 * h.rise), f = h.face, sw = h.swing > 0 ? 4 : 0; if (h.life < 1.5 && Math.sin(api.time * 30) > 0) continue;
      g.fillStyle = C.lo; g.fillRect(x - 5, y - hh, 10, hh); g.fillStyle = C.base; g.fillRect(x - 4, y - hh, 8, hh - 1); g.fillStyle = C.hi; g.fillRect(x - 4, y - hh, 8, 2);
      if (hh > 12) { g.fillStyle = C.rune; g.fillRect(x + f * 2, y - hh + 4, 2, 1); g.fillStyle = C.lo; g.fillRect(x + f * (5 + sw) - 2, y - hh + 7, 4, 4); g.fillStyle = C.base; g.fillRect(x - 3, y - 3, 2, 3); g.fillRect(x + 1, y - 3, 2, 3); } }
  }
  return { update, draw, clear, surface, crumbled, toppleFist, shardFist, geode, shatterWanted, shatterAt, greatFault, stoneHost,
    mines: () => mines, slabs: () => slabs, waves: () => waves, hosts: () => hosts, geodes: () => geodes };
}
