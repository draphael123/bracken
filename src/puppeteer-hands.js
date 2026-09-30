// src/puppeteer-hands.js - THE PUPPETEER'S HANDS (claude/puppeteer, PUPPETEER2). src/puppeteer.js is the fight, pure and proved in tools/puppeteer.mjs;
// this binds it to the world: the blows it throws on the heroes (a high blow is judged against the hero's duck box), a hero's swing on the strings
// (and a grey decoy that snares him) and on the pin rail, the scene changes laid into the grid (flats, trapdoors - and every cell put back on a fresh
// attempt), the spotlight's glare, the batten, and the drawing: the iron fly gallery and its pin rail, the painted flats riding their tracks, the
// strings (slack grey, taut gold, a decoy dull grey with red tags, a half-cut puppet's knot re-tying), his tells (the sandbag's shadow, the spotlight's
// beam, the scenery's frayed rope and red band) and the puppets' (the drop's shadow, the stomp's mark, the bands with an arrow at every hero), OPEN,
// the curtain. main.js calls: spawn*, update, strike, wood, batten, drawBack (before the bodies), drawBatten, drawRig (after them), drawTells (over
// all), camY, end, read. Every teaching line goes through ctx.number with a line listed in src/hint-lines.js (the hint box).
import * as PM from './puppeteer.js';
import { bakeStageSkins } from './redraw/puppeteer_art.js';
const { PUP } = PM;

export function makePuppeteerHands(ctx) {
  let show = null, SK = null;
  const orig = new Map();   /* every grid cell a scene changed: [tile, sprite] as the level laid it (put back on a fresh attempt) */
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'puppeteer' ? ctx.L.arena : null);
  const battenOf = () => (ctx.movers || []).find(m => m.batten) || null;
  const skins = () => SK || (SK = bakeStageSkins());
  /* WHAT HURT: the health each of his blows took, by name (the pilots print it) */
  const hurt = (name, fn) => { const P = ctx.P, h0 = P.hp; fn(); if (show) { const k = String(name); show.hurt = show.hurt || {}; show.hurt[k] = (show.hurt[k] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  H.show = () => show;
  H.on = () => !!(show && A());
  H.clear = () => { show = null; };
  const cellI = (x, y) => y * ctx.LW() + x;
  function tile(x, y, kind) { const i = cellI(x, y), T = ctx.T; if (!orig.has(i)) orig.set(i, ctx.cellGet(i));
    if (kind === 'air') ctx.cellSet(i, T.AIR, null);
    else if (kind === 'ledge') ctx.cellSet(i, T.ONEWAY, skins().flatTop);
    else { const o = orig.get(i); ctx.cellSet(i, o[0], o[1]); } }
  /* SPAWNING: the Puppeteer first (the stage lays him first), then his puppets join his show. A fresh attempt: a fresh show, and the boards as laid */
  H.spawnBoss = base => { const S = A(); if (!S) return null; const st = S.stage;
    for (const [i, o] of orig) ctx.cellSet(i, o[0], o[1]); orig.clear();
    show = PM.newShow({ x0: S.x0, x1: S.x1, floor: S.floor, gallery: st.gallery, gx0: st.gx0, gx1: st.gx1, sx: st.sx, TS: ctx.TS, y0: S.y0 });
    /* THE IRON FLY GALLERY: its cells wear the grating (claude/puppeteer2: "a wood platform that doesn't quite fit") */
    const G = Math.round(st.gallery / ctx.TS); for (let x = Math.round(st.gx0 / ctx.TS); x < Math.round(st.gx1 / ctx.TS); x++) { const i = cellI(x, G); if (ctx.cellGet(i)[0] === ctx.T.ONEWAY) ctx.cellSet(i, ctx.T.ONEWAY, skins().grate[x % 3]); }
    const b = battenOf(); if (b) { b.st = 'down'; b.t = 0; b.y = b.down; } show.batten = b;
    for (const pp of ctx.players) { pp.pupDazzle = 0; pp.pupFloor = undefined; }
    const e = PM.newPuppeteer({ ...base, t: 'puppeteer', w: PUP.w, h: PUP.h, hp: ctx.EHP.puppeteer, maxHp: ctx.EHP.puppeteer, noGrav: true, markH: PUP.markH, face: -1 });
    e.y = st.gallery; return e; };
  H.spawnPuppet = (t, base) => { if (!show) return null; const d = PM.PUPPETS[t];
    const p = { ...base, t, w: d.w, h: d.h, hp: 999, maxHp: 999, noGrav: true,   /* (maxHp: part of the boss's fight - the boss lab and the boss checks leave it standing) */ face: base.face || -1, markH: t === 'masterpiece' ? 100 : 40 };
    PM.newPuppet(p, show); if (t !== 'masterpiece') p.y = show.A.floor; return p; };
  H.owns = e => e.t === 'puppeteer' || PM.isPuppet(e);
  H.frame = e => PM.pupFrame(e);

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!show) return;
    const S = A(); if (!S) return;
    const b = battenOf(); show.batten = b;
    for (const pp of ctx.players) if (pp.pupDazzle > 0) pp.pupDazzle = Math.max(0, pp.pupDazzle - dt);
    const heroes = ctx.players.map(pp => { const h = { x: pp.x, y: pp.y, face: pp.face || 1, alive: ctx.upright(pp), ground: !!pp.ground, lastFloor: pp.pupFloor, pp };
      h.lastFloor = pp.pupFloor = PM.heroFloor(show, h); return h; });
    const evs = PM.stepShow(e, show, dt, {
      heroes,
      say: m => { if (m === '!' || m === '!!') ctx.number(e.x, e.y - 60, m, m === '!' ? '#ffd36b' : '#ff6b6b'); },
      number: (x, y, line, col) => ctx.number(x, y, line, col),
      sound: k => { const fn = SOUND[k]; if (fn) fn(); },
      /* a blow's box on every hero: a HIGH one (o.duck) against his duck box - held down on the ground, it goes over him */
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead) return;
        if (ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, o.duck ? ctx.duckBox(P) : ctx.box(P))) hurt(name, () => ctx.damagePlayer(o.from ?? e.x, d, { who: e, name, unblockable: !!o.unblockable, up: !!o.up })); }); },
      band: (kind, fy, x0, x1, d, name, key) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead || pp.pupBand === key) return;
        if (P.x < x0 || P.x > x1 || Math.abs(P.y - fy) > 30) return; pp.pupBand = key; const hb = ctx.duckBox(P);
        if (PM.bandCatches(kind, fy, { t: hb.t, b: hb.b })) hurt(name, () => ctx.damagePlayer(P.x - (e.face || 1) * 10, d, { who: e, name, unblockable: true })); }); },
      snare: (h, t, d) => ctx.asPlayer(h.pp, () => { const P = ctx.P; if (P.dead) return; P.snare = Math.max(P.snare || 0, t); hurt('THE SNARE', () => ctx.damagePlayer(e.x, d, { who: e, name: 'THE SNARE', unblockable: true, noKnock: true })); }),
      dazzle: (h, t) => { h.pp.pupDazzle = t; SOUND.glare(); },
      tile: (x, y, kind) => tile(x, y, kind),
      summon: (t, x, y) => { const n0 = ctx.enemies.length; ctx.spawnEnt({ t, x: Math.floor(x / ctx.TS), y: Math.floor(y / ctx.TS) - 1, face: -1 }); const q = ctx.enemies.slice(n0).find(q => q.t === t); if (q) { q.x = x; q.y = y; } return null; },
      pack: p => { p.alive = false; ctx.burst(p.x, p.y - 14, 8, ['#c89a60', '#e8c23a'], 50, 0.5); },
    });
    for (const v of evs) {
      if (v.t === 'phase') ctx.enrage(e);
      if (v.t === 'heap' || v.t === 'collapse') ctx.shakeCam(v.t === 'collapse' ? 6 : 2);
      if (v.t === 'drop' || v.t === 'stomp' || v.t === 'sandbagLand' || v.t === 'sceneryLand') ctx.shakeCam(3);
      if (v.t === 'sceneryLand') ctx.burst(v.x, S.floor - 8, 16, ['#3a5a6a', '#8a6a2a', '#e8dcc0'], 90, 0.6);
      if (v.t === 'fallen') { ctx.shakeCam(7); ctx.dust(e.x, S.floor, 10); }
      if (v.t === 'cancel') ctx.sparks(v.p.x, v.p.y - 20, v.p.face || 1, 5);
      if (v.t === 'sceneDone') { ctx.shakeCam(2); for (const [x0, x1, h] of PM.SCENES[show.scene].flats) ctx.dust((show.A.sx + (x0 + x1) / 2) * ctx.TS, S.floor - h * ctx.TS, 8); }
    }
    H.lastEvents = evs;
  };

  /* ---------- A HERO'S SWING: the strings (and a decoy), and the pin rail ---------- */
  H.strike = hb => {
    if (!show || !hb) return; const e = ctx.boss; if (!e || e.t !== 'puppeteer' || !e.alive || !ctx.bossActive) return;
    const P = ctx.P, seen = P.hitSet;
    const cuts = PM.strikeStrings(e, show, hb, seen);
    for (const c of cuts) { P.pupCutAt = ctx.time; SOUND.snap(); ctx.hitstop && ctx.hitstop(0.04);
      const at = c.k === 'new' ? { x: c.p.x, y: c.p.y - 30 } : (c.p.str.find(s => s.cutAt) || {}).cutAt || { x: c.p.x, y: c.p.y - 20 };
      ctx.burst(at.x, at.y, 6, ['#ffd36b', '#fff6c8'], 70, 0.35); }
    /* THE GREY DECOY: a swing that cut nothing real and crossed it - it winds round the blade and holds you */
    if (cuts.decoy && !P.dead) { P.snare = Math.max(P.snare || 0, PUP.decoySnare); if (PUP.decoyDmg > 0) hurt('A DECOY STRING', () => ctx.damagePlayer(e.x, PUP.decoyDmg, { who: e, name: 'A DECOY STRING', unblockable: true, noKnock: true })); SOUND.snare();
      ctx.number(P.x, P.y - 30, 'A DECOY: IT SNARES. WAIT FOR THE GOLD', '#ff6b6b'); }
    const b = battenOf(), S = A(); if (!b || !S) return;
    const px = S.stage.pinX, py = S.floor;
    if (seen && seen.has(b)) return;
    if (ctx.overlap(hb, { l: px - 7, r: px + 7, t: py - 30, b: py })) { if (seen) seen.add(b);
      const r = PM.pinStrike(b, show.free);
      if (r === 'locked') { ctx.SFX.clank(); ctx.number(px, py - 36, 'THE PIN RAIL IS LOCKED', '#9aa39a'); }
      else if (r === 'free') { show.n.pin++; SOUND.release(); ctx.shakeCam(3); ctx.burst(px, py - 24, 8, ['#c9a86a', '#e8dcc0'], 60, 0.4); }
      else ctx.SFX.clank(); }
  };
  H.wood = (e, fromX) => { ctx.SFX.stone(); e.flash = 0.08; ctx.sparks(e.x, e.y - (e.h || 20) / 2, Math.sign(e.x - fromX) || 1, 2);
    if (!(ctx.time - (ctx.P.pupCutAt ?? -9) < 0.4)) ctx.number(e.x, e.y - (e.h || 20) - 10, 'WOOD: CUT THE STRINGS', '#9aa39a'); };
  H.warded = e => { if (!(e.wardSaid > ctx.time)) { e.wardSaid = ctx.time + 5; ctx.number(e.x, e.y - 60, 'THE BARS TAKE IT: CUT HIS STRINGS FIRST', '#9aa39a'); } };
  H.take = e => PM.pupTake(e);
  H.barName = b => (PM.pupOpen(b) ? 'THE PUPPETEER  OPEN' : b.phase >= 3 ? 'THE PUPPETEER  THE MASTERPIECE' : b.phase === 2 ? 'THE PUPPETEER  THE LOFT' : 'THE PUPPETEER');
  H.batten = (m, dt) => { PM.stepBatten(m, dt); if (m.st === 'rise' && Math.random() < dt * 8) SOUND.creak(); };
  H.camY = ty => { const S = A(); if (!S) return ty; const VH = ctx.VH(), top = S.y0 - 8, bot = S.floor + 3 * ctx.TS;
    if (bot - top <= VH) return (top + bot) / 2 - VH / 2;
    const P = ctx.P; return Math.max(P.y - VH + 40, Math.min(ty, P.y - 60)); };
  H.end = e => { if (!show) return;
    for (const p of show.puppets) if (p.alive) { p.mode = 'heap'; p.y = show.A.floor; p.str.forEach(s => { s.cut = true; }); p.decoy = false; ctx.burst(p.x, p.y - 12, 10, ['#c89a60', '#e8c23a', '#b8382c'], 60, 0.6); }
    show.curtain = 0.001; show.lowering = null; show.snare = null; show.mine = null; show.falls = []; for (const pp of ctx.players) pp.pupDazzle = 0; SOUND.curtain(); };
  const ironCells = () => { const S = A(); if (!S || !SK) return 0; const st = S.stage, G = Math.round(st.gallery / ctx.TS); let n = 0; for (let x = Math.round(st.gx0 / ctx.TS); x < Math.round(st.gx1 / ctx.TS); x++) if (SK.grate.includes(ctx.cellGet(cellI(x, G))[1])) n++; return n; };
  H.read = () => show && { iron: ironCells(), mode: ctx.boss && ctx.boss.mode, n: { ...show.n }, free: show.free, line: show.line, cycle: show.cycle, scene: show.scene,
    batten: show.batten && { st: show.batten.st, y: show.batten.y, up: show.batten.up, down: show.batten.down, x: show.batten.x, w: show.batten.w },
    puppets: show.puppets.map(p => ({ t: p.t, x: Math.round(p.x), y: Math.round(p.y), mode: p.mode, alive: p.alive, flown: !!p.flown, left: PM.stringsLeft(p), lvl: p.lvl, decoy: !!p.decoy })),
    strings: ctx.boss ? PM.stringsOf(ctx.boss, show).map(s => ({ t: s.p.t, k: s.k, taut: s.taut, decoy: !!s.decoy, x0: Math.round(s.x0), y0: Math.round(s.y0), x1: Math.round(s.x1), y1: Math.round(s.y1), lowering: !!s.lowering })) : [],
    snare: show.snare, lowering: show.lowering && { t: show.lowering.t }, mine: show.mine && { ...show.mine } };

  /* ================= DRAWING ================= */
  const R = (x) => Math.round(x);
  const dazzled = () => (ctx.P && ctx.P.pupDazzle > 0);
  /* A PAINTED FLAT: a canvas panel on a frame, standing on the boards under its capping rail; painted by the scene (a forest, a castle, a storm) */
  function flatPaint(g, x, y, w, h, scene, k) {
    const pal = scene === 1 ? ['#2a4a2a', '#3a6a38', '#5a8a48'] : scene === 2 ? ['#4a4a5a', '#6a6a7a', '#8a8aa0'] : ['#1a2a4a', '#2a4a6a', '#e8ecf4'];
    g.globalAlpha = k; g.fillStyle = pal[0]; g.fillRect(x, y, w, h);
    if (scene === 1) for (let i = 0; i < w; i += 9) { g.fillStyle = pal[1]; g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + 4, y + 6); g.lineTo(x + i + 8, y + h); g.fill(); g.fillStyle = '#3a2a1a'; g.fillRect(x + i + 3, y + h - 6, 2, 6); }
    else if (scene === 2) { for (let yy = y + 4; yy < y + h; yy += 6) { g.fillStyle = pal[1]; g.fillRect(x, yy, w, 1); } for (let i = 0; i < w; i += 8) { g.fillStyle = pal[2]; g.fillRect(x + i, y, 4, 3); } }
    else { for (let i = 0; i < w; i += 7) { g.fillStyle = pal[1]; g.fillRect(x + i, y + 6 + ((i / 7) % 2) * 4, 5, 2); } g.fillStyle = pal[2]; g.fillRect(x + (w >> 1), y + 3, 1, h - 6); }
    g.fillStyle = '#6a4a1a'; g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h); g.globalAlpha = 1;
  }
  /* BEHIND THE BODIES: the pin rail and rigging along the back of the gallery, and the painted flats (the old riding off, the new riding on) */
  H.drawBack = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), st = S.stage, TS = ctx.TS, sx = st.sx, R0 = st.R;
    /* the fly rail: an iron pipe along the back of the gallery on posts, a belaying pin every post with its line coiled and the line running up */
    const gy = R(st.gallery - cy);
    g.fillStyle = '#3a3a46'; g.fillRect(R(st.gx0 - cx), gy - 22, R(st.gx1 - st.gx0), 2); g.fillStyle = '#6a6a7a'; g.fillRect(R(st.gx0 - cx), gy - 22, R(st.gx1 - st.gx0), 1);
    for (let x = st.gx0 + 6; x < st.gx1; x += 32) { const px = R(x - cx); g.fillStyle = '#2a2a34'; g.fillRect(px, gy - 22, 2, 22);
      g.fillStyle = '#e0d0a0'; g.fillRect(px - 2, gy - 25, 1, 5); g.fillRect(px + 3, gy - 25, 1, 5);
      g.fillStyle = '#b8a070'; g.fillRect(px + 4, R(S.y0 - cy), 1, gy - 24 - R(S.y0 - cy)); g.beginPath(); g.ellipse(px + 4, gy - 16, 3, 4, 0, 0, 7); g.strokeStyle = '#b8a070'; g.lineWidth = 1; g.stroke(); }
    /* the painted flats: this scene's standing, and during a scene change the next one riding in on its track (the track glows) */
    const e = ctx.boss && ctx.boss.t === 'puppeteer' ? ctx.boss : null, changing = e && e.mode === 'scene', k = changing ? 1 - Math.max(0, e.modeT) / PUP.sceneT : 1;
    const drawSet = (idx, kk, dir) => { for (const [x0, x1, h] of PM.SCENES[idx].flats) { const w = (x1 - x0 + 1) * TS, xOff = dir * (1 - kk) * 220;
      flatPaint(g, R((sx + x0) * TS - cx + xOff), R((R0 - h) * TS + 4 - cy), w, h * TS - 4, idx, Math.max(0, Math.min(1, dir ? kk : 1))); } };
    if (changing) { drawSet(show.scene, 1 - k, 1); drawSet(show.nextScene, k, -1);
      for (const [x0, x1] of PM.SCENES[show.nextScene].flats.map(f => [f[0], f[1]])) { g.globalAlpha = 0.4 + 0.4 * Math.sin(time * 12); g.fillStyle = '#ffd36b'; g.fillRect(R((sx + x0) * TS - cx), R(R0 * TS - 2 - cy), (x1 - x0 + 1) * TS, 1); g.globalAlpha = 1; } }
    else drawSet(show.scene, 1, 0);
  };
  /* THE BATTEN (PUPPETEER2): an iron pipe on two steel lines, and a painted flat hung under it - a sky, as far as the boards let you see it */
  H.drawBatten = (m, cx, cy) => { const g = ctx.g(), S = A(); if (!S) return; const x = R(m.x - cx), y = R(m.y - cy), top = R(S.y0 + 6 - cy), fl = R(S.floor - cy);
    g.fillStyle = '#9aa3b0'; g.fillRect(x + 2, top, 1, y - top); g.fillRect(x + m.w - 3, top, 1, y - top);
    const fh = Math.max(0, Math.min(40, fl - y - 4)); if (fh > 0) { g.fillStyle = '#2a3a6a'; g.fillRect(x + 1, y + 4, m.w - 2, fh); g.fillStyle = '#e8ecf4'; g.beginPath(); g.arc(x + m.w - 9, y + 12, 3, 0, 7); g.fill();
      for (let i = 0; i < 5; i++) { g.fillStyle = '#fff6e0'; g.fillRect(x + 3 + i * 6, y + 8 + (i * 7) % 20, 1, 1); } g.fillStyle = '#1a2440'; g.fillRect(x + 1, y + 4 + fh - 1, m.w - 2, 1); }
    g.fillStyle = '#4a4e5a'; g.fillRect(x, y, m.w, 4); g.fillStyle = '#8a929e'; g.fillRect(x, y, m.w, 1); g.fillStyle = '#23252c'; g.fillRect(x, y + 3, m.w, 1);
    for (const dx of [3, m.w - 4]) { g.fillStyle = '#c9d1dc'; g.fillRect(x + dx - 1, y - 2, 3, 2); } };
  /* THE RIG AND THE STRINGS (after the bodies: a string runs over what it holds) */
  H.drawRig = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), st = S.stage, e = ctx.boss && ctx.boss.t === 'puppeteer' ? ctx.boss : null;
    g.fillStyle = '#5a5a66'; for (let x = st.gx0 + 12; x < st.gx1; x += 64) { g.fillRect(R(x - cx), R(S.y0 - cy), 1, R(st.gallery - S.y0)); }   /* the gallery's hangers: steel */
    const b = show.batten; if (b) { const k = PM.sandbagK(b), bx = R(b.x + b.w / 2 - cx), top = R(S.y0 + 6 - cy);
      g.fillStyle = '#2a2a34'; g.beginPath(); g.arc(bx, top, 4, 0, 7); g.fill(); g.fillStyle = '#8a919c'; g.fillRect(bx - 1, top - 1, 2, 2);
      const sx = R(S.x0 + 3 - cx), sy = R(S.y0 + 20 + (S.floor - S.y0 - 36) * k - cy);
      g.fillStyle = '#9aa3b0'; g.fillRect(sx + 3, top, 1, sy - top); g.fillStyle = '#7a6a4a'; g.fillRect(sx, sy, 8, 12); g.fillStyle = '#9a8a62'; g.fillRect(sx + 1, sy + 1, 6, 3); g.fillStyle = '#4a3a2a'; g.fillRect(sx, sy + 11, 8, 1);
      /* THE PIN RAIL: an iron rail on an iron post, its pins turned brass, the line belayed on them */
      const px = R(st.pinX - cx), py = R(S.floor - cy), free = show.free;
      g.fillStyle = '#3a3a46'; g.fillRect(px - 2, py - 28, 5, 28); g.fillStyle = '#6a6a7a'; g.fillRect(px - 2, py - 28, 1, 28);
      for (const yy of [8, 14, 20]) { g.fillStyle = '#c8a050'; g.fillRect(px - 4, py - 28 + yy, 9, 2); g.fillStyle = '#fff0b0'; g.fillRect(px - 4, py - 28 + yy, 1, 1); }
      g.fillStyle = '#9aa3b0'; g.fillRect(px - 1, py - 26, 1, 20);
      if (!free) { g.fillStyle = '#5a6270'; g.fillRect(px - 3, py - 22, 7, 5); g.fillStyle = '#9aa39a'; g.fillRect(px - 2, py - 24, 5, 2); }
      else if (b.st === 'down' && !(b.t > 0)) { const k2 = 0.5 + 0.5 * Math.sin(time * 6); g.globalAlpha = 0.35 + 0.4 * k2; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(px - 6.5, py - 31.5, 14, 32); g.globalAlpha = 1; } }
    if (e && show.line) { const x = R(e.x + 3 - cx); g.fillStyle = '#c9a86a'; g.fillRect(x, R(S.y0 - cy), 1, R(e.y - 40 - S.y0)); }
    if (!e) return;
    const master = show.puppets.find(p => p.t === 'masterpiece' && p.alive);
    const bar = PM.barOf(e, !!master && e.phase >= 3);
    g.fillStyle = '#6a4a2a'; g.fillRect(R(bar.x0 - cx), R(bar.y - cy), R(bar.x1 - bar.x0) + 1, 2); g.fillRect(R((bar.x0 + bar.x1) / 2 - cx), R(bar.y - 4 - cy), 2, 8);
    /* THE STRINGS: slack grey with a sag; taut straight and gold, pulsing (lost in the glare while you are dazzled); a DECOY dull grey, straight, red tags */
    const blind = dazzled();
    for (const s of PM.stringsOf(e, show)) {
      const x0 = s.x0 - cx, y0 = s.y0 - cy, x1 = s.x1 - cx, y1 = s.y1 - cy;
      if (s.decoy) { g.strokeStyle = '#6a6a72'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke();
        for (const t of [0.35, 0.6, 0.85]) { g.fillStyle = '#b8382c'; g.fillRect(R(x0 + (x1 - x0) * t) - 1, R(y0 + (y1 - y0) * t), 3, 2); } continue; }
      if (s.taut && !blind) { const k = 0.5 + 0.5 * Math.sin(time * 14 + s.i);
        g.globalAlpha = 0.25 + 0.2 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        g.globalAlpha = 1; g.strokeStyle = k > 0.5 ? '#fff6c8' : '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke();
        if (s.lowering) { g.fillStyle = '#ffd36b'; g.fillRect(R(x1) - 1, R(y1), 3, 3); } }
      else { g.globalAlpha = 0.7; g.strokeStyle = '#c9c0b0'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.quadraticCurveTo((x0 + x1) / 2 + 3, (y0 + y1) / 2 + 6, R(x1) + 0.5, R(y1) + 0.5); g.stroke(); g.globalAlpha = 1; } }
    /* the cut ends; and on a half-cut puppet, the knot RE-TYING - a ring closing as its time runs out */
    for (const p of show.puppets) { if (!p.alive || p.mode === 'packed') continue; const S2 = PM.STRINGS[p.t], big = p.t === 'masterpiece', bb = PM.barOf(e, big), n = S2.length;
      p.str.forEach((st2, i) => { if (!st2.cut) return; const x0 = bb.x0 + (bb.x1 - bb.x0) * (n === 1 ? 0.5 : i / (n - 1));
        g.fillStyle = '#c9c0b0'; g.fillRect(R(x0 - cx), R(bb.y - cy), 1, 9 + ((i * 3) % 5));
        if (!PM.heaped(p)) { const ax = R(p.x + S2[i].dx * (p.face || 1) - cx), ay = R(p.y - S2[i].up - cy); g.fillRect(ax, ay - 6, 1, 6);
          if (st2.retie !== undefined) { const full = big ? PUP.retieBigT : PUP.retieT, kk = Math.max(0, st2.retie) / full; g.strokeStyle = kk < 0.35 ? '#ff6b6b' : '#e8dcc0'; g.lineWidth = 1;
            g.beginPath(); g.arc(ax + 0.5, ay - 8.5, 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - kk)); g.stroke(); } } }); }
  };
  /* THE TELLS (over everything, so no body hides one) */
  H.drawTells = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), e = ctx.boss && ctx.boss.t === 'puppeteer' && ctx.boss.alive ? ctx.boss : null, st = S.stage, TS = ctx.TS;
    const pulse = 0.5 + 0.5 * Math.sin(time * 18);
    /* THE GALLERY'S LIT EDGE: a warm line along its lip, so the footing reads against the dark of the flies */
    g.globalAlpha = 0.35 + 0.1 * Math.sin(time * 2); g.fillStyle = '#ffd36b'; g.fillRect(R(st.gx0 - cx), R(st.gallery - cy), R(st.gx1 - st.gx0), 1); g.globalAlpha = 1;
    /* A SCENE CHANGE: the lights drop, and the boards that will open flash red */
    if (e && e.mode === 'scene') { const k = 1 - Math.max(0, e.modeT) / PUP.sceneT; g.globalAlpha = 0.25 * Math.sin(Math.PI * k); g.fillStyle = '#05030a'; g.fillRect(0, 0, 4000, 4000); g.globalAlpha = 1;
      for (const [x0, x1] of PM.SCENES[show.nextScene].traps) { g.globalAlpha = 0.4 + 0.5 * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(R((st.sx + x0) * TS - cx), R(S.floor - cy), (x1 - x0 + 1) * TS, 2);
        g.fillRect(R((st.sx + x0) * TS - cx), R(S.floor - cy), 1, 6); g.fillRect(R((st.sx + x1 + 1) * TS - 1 - cx), R(S.floor - cy), 1, 6); g.globalAlpha = 1; } }
    /* HIS OWN: the sandbag's shadow, the spotlight's beam, the scenery's rope and band */
    const M = show.mine;
    if (e && M && e.mode === M.k + 'Tell') { const len = PUP[M.k + 'Tell'], k = 1 - Math.max(0, e.modeT) / len, fy = R(M.floor - cy), mx = R(M.x - cx);
      if (M.k === 'sandbag') { g.globalAlpha = 0.3 + 0.4 * k; g.fillStyle = '#1e0a10'; g.beginPath(); g.ellipse(mx, fy - 1, PUP.sandbagHalf * (0.5 + 0.5 * k), 3, 0, 0, 7); g.fill();
        g.globalAlpha = 0.4 + 0.4 * pulse; g.strokeStyle = '#ff6b6b'; g.beginPath(); g.ellipse(mx, fy - 1, PUP.sandbagHalf + 1, 4, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
        const by = R(st.gallery + 4 - cy); g.fillStyle = '#9aa3b0'; g.fillRect(mx, R(S.y0 - cy), 1, by - R(S.y0 - cy)); g.fillStyle = '#7a6a4a'; g.fillRect(mx - 5, by, 10, 12); g.fillStyle = '#9a8a62'; g.fillRect(mx - 4, by + 1, 8, 3); }
      if (M.k === 'spot') { const ox = R(e.x - cx), oy = R(e.y - 30 - cy); g.globalAlpha = 0.18 + 0.3 * k; g.fillStyle = '#fff6c8'; g.beginPath(); g.moveTo(ox - 3, oy); g.lineTo(ox + 3, oy); g.lineTo(mx + PUP.spotHalf, fy); g.lineTo(mx - PUP.spotHalf, fy); g.fill();
        g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = '#fff6c8'; g.beginPath(); g.ellipse(mx, fy - 2, PUP.spotHalf, 4, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (M.k === 'scenery') { const sy = R(S.y0 + 10 - cy); g.globalAlpha = 0.25 + 0.4 * k * (0.6 + 0.4 * pulse); g.fillStyle = '#ff6b6b'; g.fillRect(mx - PUP.sceneryHalf, sy + 20, 1, fy - sy - 20); g.fillRect(mx + PUP.sceneryHalf, sy + 20, 1, fy - sy - 20); g.globalAlpha = 1;
        g.fillStyle = '#9aa3b0'; g.fillRect(mx - PUP.sceneryHalf + 4, R(S.y0 - cy), 1, sy - R(S.y0 - cy)); if (Math.floor(time * 10) % 2) { g.fillStyle = '#c8a050'; g.fillRect(mx + PUP.sceneryHalf - 5, sy - 6, 2, 2); } else g.fillRect(mx + PUP.sceneryHalf - 4, R(S.y0 - cy), 1, sy - R(S.y0 - cy));   /* one line fraying */
        flatPaint(g, mx - PUP.sceneryHalf, sy, PUP.sceneryHalf * 2, 20, 3, 1); } }
    for (const f of show.falls) { const mx = R(f.x - cx), fy = R(f.y - cy);
      if (f.k === 'sandbag') { g.fillStyle = '#7a6a4a'; g.fillRect(mx - 5, fy - 12, 10, 12); g.fillStyle = '#9a8a62'; g.fillRect(mx - 4, fy - 11, 8, 3); }
      else flatPaint(g, mx - f.half, fy - 20, f.half * 2, 20, 3, 1); }
    if (e) for (const p of show.puppets) { if (!p.alive) continue;
      if (p.mode === 'dropTell' || p.mode === 'drop') { const len = p.tellLen || PM.MOVES.drop.tell, k = p.mode === 'drop' ? 1 : 1 - Math.max(0, p.modeT) / len, half = PM.MOVES.drop.reach;
        g.globalAlpha = 0.3 + 0.4 * k; g.fillStyle = '#1e0a10'; g.beginPath(); g.ellipse(R(p.x - cx), R(p.floorY - 1 - cy), half * (0.5 + 0.5 * k), 3, 0, 0, 7); g.fill();
        g.globalAlpha = 0.4 + 0.4 * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(R(p.x - cx), R(p.floorY - 1 - cy), half + 1, 4, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (p.mode === 'stompTell') { g.globalAlpha = 0.35 + 0.45 * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(p.stompX - cx), R(S.floor - 2 - cy), PUP.stompHalf, 5, 0, 0, 7); g.stroke();
        g.fillStyle = '#ff6b6b'; g.fillRect(R(p.stompX - cx) - 1, R(S.floor - 22 - cy), 3, 12); g.globalAlpha = 1; }
      const mk = p.mode.endsWith('Tell') ? p.mode.slice(0, -4) : null, M2 = mk && PM.MOVES[mk];
      if (M2 && mk !== 'drop') { const k = 1 - Math.max(0, p.modeT) / (p.tellLen || M2.tell), f = p.face || 1, x0 = M2.both ? p.x - M2.reach : f > 0 ? p.x : p.x - M2.reach, x1 = M2.both ? p.x + M2.reach : f > 0 ? p.x + M2.reach : p.x;
        if (M2.h === 'high') bandDraw(g, 'high', p.floorY, x0, x1, k, cx, cy, time);
        else if (!M2.block) bandDraw(g, 'low', p.floorY, x0, x1, k, cx, cy, time); }
      if (p.mode === 'reachTell' || p.mode === 'reach') { const ry = p.reachY || st.gallery; bandDraw(g, 'high', ry, p.x - PUP.reachSpan, p.x + PUP.reachSpan, p.mode === 'reachTell' ? 1 - Math.max(0, p.modeT) / PUP.reachTell : -1, cx, cy, time); }
      if (p.mode === 'reach') { const r = p.reachR || 0, sx = R(p.x - cx), sy = R(p.y - 62 - cy), ry = p.reachY || st.gallery;
        for (const d of [-1, 1]) { const tx = R(p.x + d * r - cx), ty = R(ry - 18 - cy); g.strokeStyle = '#b8844c'; g.lineWidth = 4; g.beginPath(); g.moveTo(sx, sy); g.lineTo(tx, ty); g.stroke(); g.fillStyle = '#e0b87a'; g.beginPath(); g.arc(tx, ty, 4, 0, 7); g.fill(); } } }
    if (show.snare) { const s = show.snare, k = e ? 1 - Math.max(0, e.modeT) / PUP.snareTell : 1;
      g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(R(s.x - cx), R(s.y - 2 - cy), PUP.snareR + 4 - 4 * k, 3, 0, 0, 7); g.stroke();
      g.strokeStyle = '#ffd36b'; g.beginPath(); g.moveTo(R(s.x - cx), R(s.y - 2 - cy)); g.lineTo(R(e ? e.x - cx : s.x - cx), R(e ? e.y - 30 - cy : s.y - 40 - cy)); g.stroke(); g.globalAlpha = 1; }
    if (e && (e.mode === 'whipLowTell' || e.mode === 'whipHighTell' || e.mode === 'whip')) { const f = e.face || 1, kind = e.mode === 'whip' ? e.whipKind : e.mode === 'whipLowTell' ? 'low' : 'high';
      const x0 = f > 0 ? e.x : e.x - PUP.whipReach, x1 = f > 0 ? e.x + PUP.whipReach : e.x;
      bandDraw(g, kind, st.gallery, x0, x1, e.mode === 'whip' ? -1 : 1 - Math.max(0, e.modeT) / PUP.whipTell, cx, cy, time);
      if (e.mode === 'whip') { const [t, b] = PM.whipBand(kind, st.gallery), r = e.whipR || 0; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(e.x - cx), R(e.y - 30 - cy));
        g.lineTo(R(e.x + f * r - cx), R((t + b) / 2 - cy)); g.stroke(); } }
    if (e && PM.pupOpen(e)) { const full = e.mode === 'fallen' ? PUP.fallT : e.onStage ? PUP.restringT : PUP.loftRestringT, k = Math.max(0, e.modeT) / full;
      g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(R(e.x - cx), R(e.y - 18 - cy), 16, 22, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#1e1624'; g.fillRect(R(e.x - 14 - cx), R(e.y + 3 - cy), 28, 3); g.fillStyle = '#ffd36b'; g.fillRect(R(e.x - 13 - cx), R(e.y + 4 - cy), R(26 * k), 1);
      ctx.text('OPEN', R(e.x - cx), R(e.y - 50 - cy), pulse > 0.5 ? '#fff6c8' : '#ffd36b', 'center', 6); }
    const c = show.curtain || 0, cw = S.x1 - S.x0, top = R(S.y0 - cy), x0 = R(S.x0 - cx);
    if (c > 0) show.curtain = Math.min(1, c + 1 / 90);
    const drop = c > 0 ? Math.min(1, c * 1.4) : 0, hgt = 12 + R((S.floor - S.y0 - 12) * drop * (c < 0.8 ? 1 : 1 - (c - 0.8) * 5));
    g.fillStyle = '#6a1020'; g.fillRect(x0, top, cw, hgt); g.fillStyle = '#8a1a2a'; for (let x = 0; x < cw; x += 12) g.fillRect(x0 + x, top, 5, hgt);
    g.fillStyle = '#e8c23a'; g.fillRect(x0, top + hgt - 2, cw, 2); for (let x = 2; x < cw; x += 6) g.fillRect(x0 + x, top + hgt, 2, 2);
    /* DAZZLED: the glare of his spotlight over the whole view, fading - and the strings' gold is lost in it (drawRig) */
    const dz = ctx.P && ctx.P.pupDazzle || 0; if (dz > 0) { const k = Math.min(1, dz / PUP.dazzleT); g.globalAlpha = 0.55 * k; g.fillStyle = '#fff8e0'; g.fillRect(0, 0, 4000, 4000); g.globalAlpha = 1; }
  };
  function bandDraw(g, kind, fy, x0, x1, k, cx, cy, time) {
    const [t, b] = PM.whipBand(kind, fy);
    if (k >= 0) { g.globalAlpha = 0.2 + 0.45 * k * (0.6 + 0.4 * Math.sin(time * 30)); g.fillStyle = '#ff6b6b';
      g.fillRect(R(x0 - cx), R(t - cy), R(x1 - x0), 1); g.fillRect(R(x0 - cx), R(b - 1 - cy), R(x1 - x0), 1);
      for (const pp of ctx.players) { if (Math.abs(pp.y - fy) > 8 || pp.x < x0 || pp.x > x1) continue; const px2 = R(pp.x - cx), py2 = R(pp.y - 32 - cy);
        g.fillRect(px2 - 2, py2, 5, 1); g.fillRect(px2 - 1, kind === 'low' ? py2 - 1 : py2 + 1, 3, 1); g.fillRect(px2, kind === 'low' ? py2 - 2 : py2 + 2, 1, 1); }
      g.globalAlpha = 1; }
  }

  /* ---------- HIS SOUNDS (src/audio.js: pup*) ---------- */
  const S_ = ctx.SFX, SOUND = {
    chopTell: () => S_.tell && S_.tell(), chop: () => S_.foeSlash(), spinTell: () => S_.pupCreak(), spin: () => S_.throwWhoosh(),
    thrustTell: () => S_.tell && S_.tell(), thrust: () => S_.foeSlash(), kickTell: () => S_.pupCreak(), kick: () => S_.throwWhoosh(), swingTell: () => S_.pupCreak(), swing: () => S_.throwWhoosh(),
    dropTell: () => S_.pupCreak(), dropFall: () => S_.throwWhoosh(), dropLand: () => S_.pupThud(), heap: () => S_.pupClatter(), collapse: () => { S_.pupClatter(); S_.golemStomp(); },
    fly: () => S_.pupCreak(), rise: () => S_.ropeHaul(), lower: () => S_.pupCreak(), cutLine: () => S_.pupSnap(), masterTell: () => { S_.ropeHaul(); S_.pupCreak(); },
    descendTell: () => S_.ropeHaul(), descend: () => S_.pupCreak(), restring: () => S_.pupKnot(), ascend: () => S_.ropeHaul(), retie: () => S_.pupKnot(),
    whipTell: () => S_.pupWhipTell(), whip: () => S_.pupWhip(), snareTell: () => S_.pupWhipTell(), snare: () => S_.pupWhip(),
    swatTell: () => S_.pupCreak(), swat: () => S_.throwWhoosh(), stompTell: () => S_.pupCreak(), stomp: () => { S_.pupThud(); S_.golemStomp(); }, reachTell: () => S_.pupCreak(), reach: () => S_.throwWhoosh(),
    sandbagTell: () => S_.pupCreak(), sandbag: () => S_.throwWhoosh(), spotTell: () => S_.pupSpot(), spot: () => S_.pupSpot(), sceneryTell: () => S_.pupCreak(), scenery: () => S_.pupSnap(),
    sceneTell: () => S_.pupScene(), glare: () => S_.pupSpot(),
    yank: () => S_.pupSnap(), land: () => S_.pupThud(),
    snap: () => S_.pupSnap(), release: () => { S_.pupSnap(); S_.ropeHaul(); }, creak: () => S_.pupCreak(), curtain: () => S_.pupCurtain(),
  };
  return H;
}
