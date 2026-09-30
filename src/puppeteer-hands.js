// src/puppeteer-hands.js - THE PUPPETEER'S HANDS (claude/puppeteer, PUPPETEER3). src/puppeteer.js is the fight, pure and proved in tools/puppeteer.mjs;
// this binds it to the world and makes every hit READ:
//   - A BLOW ON A PUPPET lands like any blow (a flash, a knock, the number, a clack) and takes its health; its bar sits under it, cracked as it falls.
//   - A CUT is a SNAP: a hit-stop, a shake, the cut length whipping away into the flies, the limb it held falling limp and that attack gone - said once
//     in the hint box. A dropped puppet lies in a heap with a ring counting out its time.
//   - HE hangs from his CONTROL BAR on a line from the grid: the line is drawn thick, his bar sinks when a puppet drops, and with both down he is dragged
//     to the boards - a gold ring, OPEN, a timer, "HE'S DOWN - STRIKE HIM". From the gallery his line can be struck (the hard way): it glows when you are
//     up there and it is ready.
// Also the batten and the pin rail, the iron fly gallery and its rail, the painted flats of the scene changes, the broken boards of the Brute's slam
// (phase 2), the tells (the chop's arc, the slam's red band and crack, the grab's reach, the Harlequin's jab and kick, the masterpiece's stomp and
// reach, his whip), the curtain. main.js calls: spawn*, update, strike, hurtPuppet (a blow on a puppet, from hurtEnemy0), batten, drawBack, drawBatten,
// drawRig, drawTells, camY, end, read. Every teaching line is a src/hint-lines.js line through ctx.number (the hint box).
import * as PM from './puppeteer.js';
import { bakeStageSkins } from './redraw/puppeteer_art.js';
const { PUP } = PM;

export function makePuppeteerHands(ctx) {
  let show = null, SK = null;
  const orig = new Map();
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'puppeteer' ? ctx.L.arena : null);
  const battenOf = () => (ctx.movers || []).find(m => m.batten) || null;
  const skins = () => SK || (SK = bakeStageSkins());
  const hurt = (name, fn) => { const P = ctx.P, h0 = P.hp; fn(); if (show) { const k = String(name); show.hurt = show.hurt || {}; show.hurt[k] = (show.hurt[k] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  H.show = () => show;
  H.on = () => !!(show && A());
  H.clear = () => { show = null; };
  const cellI = (x, y) => y * ctx.LW() + x;
  function tile(x, y, kind) { const i = cellI(x, y), T = ctx.T; if (!orig.has(i)) orig.set(i, ctx.cellGet(i));
    if (kind === 'air') ctx.cellSet(i, T.AIR, null);
    else if (kind === 'ledge') ctx.cellSet(i, T.ONEWAY, skins().flatTop);
    else { const o = orig.get(i); ctx.cellSet(i, o[0], o[1]); } }
  H.spawnBoss = base => { const S = A(); if (!S) return null; const st = S.stage;
    for (const [i, o] of orig) ctx.cellSet(i, o[0], o[1]); orig.clear();
    show = PM.newShow({ x0: S.x0, x1: S.x1, floor: S.floor, gallery: st.gallery, gx0: st.gx0, gx1: st.gx1, sx: st.sx, TS: ctx.TS, y0: S.y0 });
    const G = Math.round(st.gallery / ctx.TS); for (let x = Math.round(st.gx0 / ctx.TS); x < Math.round(st.gx1 / ctx.TS); x++) { const i = cellI(x, G); if (ctx.cellGet(i)[0] === ctx.T.ONEWAY) ctx.cellSet(i, ctx.T.ONEWAY, skins().grate[x % 3]); }
    const b = battenOf(); if (b) { b.st = 'down'; b.t = 0; b.y = b.down; } show.batten = b;
    for (const pp of ctx.players) { pp.pupFloor = undefined; pp.pupStill = 0; }
    const e = PM.newPuppeteer({ ...base, t: 'puppeteer', w: PUP.w, h: PUP.h, hp: ctx.EHP.puppeteer, maxHp: ctx.EHP.puppeteer, noGrav: true, markH: PUP.markH, face: -1 });
    e.y = st.gallery; return e; };
  H.spawnPuppet = (t, base) => { if (!show) return null; const d = PM.PUPPETS[t];
    const p = { ...base, t, w: d.w, h: d.h, noGrav: true, face: base.face || -1, markH: t === 'masterpiece' ? 100 : t === 'marionette' ? 58 : 36 };
    PM.newPuppet(p, show); if (t !== 'masterpiece') p.y = show.A.floor; return p; };
  H.owns = e => e.t === 'puppeteer' || PM.isPuppet(e);
  H.frame = e => PM.pupFrame(e);
  H.bigF = e => (e.t === 'marionette' ? PUP.brute.scale : 1);

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!show) return;
    const S = A(); if (!S) return;
    show.batten = battenOf();
    const heroes = ctx.players.map(pp => { pp.pupStill = pp.ground && Math.abs(pp.vx || 0) < 8 ? (pp.pupStill || 0) + dt : 0;
      const h = { x: pp.x, y: pp.y, face: pp.face || 1, alive: ctx.upright(pp), ground: !!pp.ground, lastFloor: pp.pupFloor, stillT: pp.pupStill, pp };
      h.lastFloor = pp.pupFloor = PM.heroFloor(show, h); return h; });
    const R0 = S.stage.R;
    const evs = PM.stepShow(e, show, dt, {
      heroes,
      say: m => { if (m === '!' || m === '!!') ctx.number(e.x, e.y - 60, m, m === '!' ? '#ffd36b' : '#ff6b6b'); },
      number: (x, y, line, col) => ctx.number(x, y, line, col),
      sound: k => { const fn = SOUND[k]; if (fn) fn(); },
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead) return;
        if (ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, o.duck ? ctx.duckBox(P) : ctx.box(P))) { const h0 = P.hp; hurt(name, () => ctx.damagePlayer(o.from ?? e.x, d, { who: e, name, unblockable: !!o.unblockable, up: !!o.up }));
          if (o.grab && P.hp < h0 && !P.dead) P.snare = Math.max(P.snare || 0, 0.6); } }); },
      band: (kind, fy, x0, x1, d, name, key) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead || pp.pupBand === key) return;
        if (P.x < x0 || P.x > x1 || Math.abs(P.y - fy) > 30) return; pp.pupBand = key; const hb = ctx.duckBox(P);
        if (PM.bandCatches(kind, fy, { t: hb.t, b: hb.b })) hurt(name, () => ctx.damagePlayer(P.x - (e.face || 1) * 10, d, { who: e, name, unblockable: true })); }); },
      tile: (x, y, kind) => tile(x, y, kind),
      /* THE SLAM BREAKS THE BOARDS (phase 2): rows R and R+1 of its columns fall in (the pit's floor is R+2) - and mend */
      pit: (x0, x1, open) => { for (let x = x0; x <= x1; x++) { if (x <= S.stage.sx + 3 || x >= S.wallR) continue; for (const y of [R0, R0 + 1]) tile(x, y, open ? 'air' : 'floor'); } if (open) { ctx.shakeCam(5); ctx.burst((x0 + x1 + 1) / 2 * ctx.TS, S.floor, 18, ['#6a4a2a', '#3a2a1a', '#c9a86a'], 110, 0.6); } },
      summon: (t, x, y) => { const n0 = ctx.enemies.length; ctx.spawnEnt({ t, x: Math.floor(x / ctx.TS), y: Math.floor(y / ctx.TS) - 1, face: -1 }); const q = ctx.enemies.slice(n0).find(q => q.t === t); if (q) { q.x = x; q.y = y; } return null; },
      pack: p => { p.alive = false; ctx.burst(p.x, p.y - 14, 8, ['#c89a60', '#e8c23a'], 50, 0.5); },
    });
    for (const v of evs) {
      if (v.t === 'phase') ctx.enrage(e);
      if (v.t === 'heap') { ctx.shakeCam(4); ctx.hitstop(0.06); ctx.burst(v.p.x, v.p.y - 12, 14, ['#c89a60', '#e8c23a', '#fff6c8'], 90, 0.6); if (!show.saidHeap) { show.saidHeap = true; ctx.number(v.p.x, v.p.y - 40, 'ONE DOWN: HIS BAR DROPS', '#8fd160'); } }
      if (v.t === 'slam' || v.t === 'stomp') ctx.shakeCam(4);
      if (v.t === 'downed') { ctx.shakeCam(8); ctx.dust(e.x, S.floor, 14); ctx.hitstop(0.08); }
      if (v.t === 'cancel') ctx.sparks(v.p.x, v.p.y - 20, v.p.face || 1, 8);
      if (v.t === 'sceneDone' || v.t === 'restrung') ctx.shakeCam(2);
    }
    H.lastEvents = evs;
  };

  /* ---------- A HERO'S SWING: the strings, his line (from the gallery), the pin rail ---------- */
  H.strike = hb => {
    if (!show || !hb) return; const e = ctx.boss; if (!e || e.t !== 'puppeteer' || !e.alive || !ctx.bossActive) return;
    const P = ctx.P, seen = P.hitSet;
    for (const c of PM.strikeStrings(e, show, hb, seen)) { P.pupCutAt = ctx.time;
      /* THE SNAP: a hit-stop, a shake, the cut length whipping away, the limb limp - and the first time, said */
      SOUND.snap(); ctx.hitstop(c.gold ? 0.12 : 0.08); ctx.shakeCam(c.gold ? 5 : 3);
      show.whips = (show.whips || []).concat({ x: c.at.x, y: c.at.y, vx: (Math.random() - 0.5) * 140, vy: -260, t: 0.7 });
      ctx.burst(c.at.x, c.at.y, 12, ['#ffd36b', '#fff6c8', '#c9c0b0'], 120, 0.4);
      if (c.p.t === 'harlequin') ctx.number(c.at.x, c.at.y - 20, 'CUT: THE HARLEQUIN DROPS', '#8fd160');
      else if (c.limb === 'arm') ctx.number(c.at.x, c.at.y - 20, 'THE ARM GOES LIMP: NO MORE CHOP OR GRAB', '#8fd160');
      else if (c.limb === 'back') ctx.number(c.at.x, c.at.y - 20, 'THE BACK GOES LIMP: NO MORE SLAM', '#8fd160');
      else ctx.number(c.at.x, c.at.y - 20, 'A STRING PARTS', '#8fd160'); }
    /* THE HARD WAY: his line, struck from the gallery */
    if (Math.abs(P.y - show.A.gallery) < 8 && PM.strikeLine(e, show, hb)) { SOUND.snap(); SOUND.land(); ctx.hitstop(0.1); ctx.shakeCam(6); ctx.burst(e.x, e.y - 30, 16, ['#ffd36b', '#fff6c8'], 120, 0.5); ctx.number(e.x, e.y - 60, 'JOLTED: STRIKE HIM', '#ffd36b'); }
    const b = battenOf(), S = A(); if (!b || !S) return;
    const px = S.stage.pinX, py = S.floor;
    if (seen && seen.has(b)) return;
    if (ctx.overlap(hb, { l: px - 7, r: px + 7, t: py - 30, b: py })) { if (seen) seen.add(b);
      const r = PM.pinStrike(b, show.free);
      if (r === 'free') { show.n.pin++; SOUND.release(); ctx.shakeCam(3); ctx.burst(px, py - 24, 8, ['#c9a86a', '#e8dcc0'], 60, 0.4); }
      else ctx.SFX.clank(); }
  };
  /* A BLOW ON A PUPPET: it lands like any blow and takes its health. A heap takes nothing (it is already down) */
  H.hurtPuppet = (p, dmg, fromX) => {
    if (!show || PM.heaped(p)) { ctx.SFX.stone(); return; }
    const d = Math.max(1, Math.round(dmg)), dir = Math.sign(p.x - fromX) || 1;
    p.hp = Math.max(0, p.hp - d); p.flash = 0.12; p.hitT = 0.25;
    if (p.t === 'harlequin') p.x += dir * 10; else if (p.t === 'marionette') p.x += dir * 3;
    ctx.SFX.hit && ctx.SFX.hit(); ctx.sparks(p.x, p.y - (p.h || 20) / 2, dir, 5); ctx.number(p.x, p.y - (p.h || 20) - 8, d, '#fff6e0'); ctx.hitstop(0.03);
    show.n.hitPuppet = (show.n.hitPuppet || 0) + d;
  };
  H.warded = e => { if (!(e.wardSaid > ctx.time)) { e.wardSaid = ctx.time + 5; ctx.number(e.x, e.y - 60, 'OUT OF REACH: DROP HIS PUPPETS FIRST', '#9aa39a'); } };
  H.take = e => PM.pupTake(e);
  H.barName = b => (PM.pupOpen(b) ? 'THE PUPPETEER  OPEN' : b.phase >= 3 ? 'THE PUPPETEER  THE MASTERPIECE' : b.phase === 2 ? 'THE PUPPETEER  TOGETHER' : 'THE PUPPETEER');
  H.batten = (m, dt) => { PM.stepBatten(m, dt); if (m.st === 'rise' && Math.random() < dt * 8) SOUND.creak(); };
  H.camY = ty => { const S = A(); if (!S) return ty; const VH = ctx.VH(), top = S.y0 - 8, bot = S.floor + 3 * ctx.TS;
    if (bot - top <= VH) return (top + bot) / 2 - VH / 2;
    const P = ctx.P; return Math.max(P.y - VH + 40, Math.min(ty, P.y - 60)); };
  H.end = e => { if (!show) return;
    for (const p of show.puppets) if (p.alive) { p.mode = 'heap'; p.y = show.A.floor; p.str.forEach(s => { s.cut = true; }); p.downT = 0; ctx.burst(p.x, p.y - 12, 10, ['#c89a60', '#e8c23a', '#b8382c'], 60, 0.6); }
    show.curtain = 0.001; SOUND.curtain(); };
  const ironCells = () => { const S = A(); if (!S || !SK) return 0; const st = S.stage, G = Math.round(st.gallery / ctx.TS); let n = 0; for (let x = Math.round(st.gx0 / ctx.TS); x < Math.round(st.gx1 / ctx.TS); x++) if (SK.grate.includes(ctx.cellGet(cellI(x, G))[1])) n++; return n; };
  H.read = () => show && { iron: ironCells(), mode: ctx.boss && ctx.boss.mode, n: { ...show.n }, free: show.free, cycle: show.cycle, scene: show.scene, hurt: { ...(show.hurt || {}) },
    batten: show.batten && { st: show.batten.st, y: show.batten.y, up: show.batten.up, down: show.batten.down, x: show.batten.x, w: show.batten.w },
    puppets: show.puppets.map(p => ({ t: p.t, x: Math.round(p.x), y: Math.round(p.y), mode: p.mode, alive: p.alive, hp: p.hp, maxHp: p.maxHp, left: PM.stringsLeft(p), downT: p.downT })),
    strings: ctx.boss ? PM.stringsOf(ctx.boss, show).map(s => ({ t: s.p.t, k: s.k, limb: s.limb, taut: s.taut, x0: Math.round(s.x0), y0: Math.round(s.y0), x1: Math.round(s.x1), y1: Math.round(s.y1) })) : [] };

  /* ================= DRAWING ================= */
  const R = (x) => Math.round(x);
  function flatPaint(g, x, y, w, h, scene, k) {
    const pal = scene === 1 ? ['#2a4a2a', '#3a6a38', '#5a8a48'] : scene === 2 ? ['#4a4a5a', '#6a6a7a', '#8a8aa0'] : ['#1a2a4a', '#2a4a6a', '#e8ecf4'];
    g.globalAlpha = k; g.fillStyle = pal[0]; g.fillRect(x, y, w, h);
    if (scene === 1) for (let i = 0; i < w; i += 9) { g.fillStyle = pal[1]; g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + 4, y + 6); g.lineTo(x + i + 8, y + h); g.fill(); g.fillStyle = '#3a2a1a'; g.fillRect(x + i + 3, y + h - 6, 2, 6); }
    else if (scene === 2) { for (let yy = y + 4; yy < y + h; yy += 6) { g.fillStyle = pal[1]; g.fillRect(x, yy, w, 1); } for (let i = 0; i < w; i += 8) { g.fillStyle = pal[2]; g.fillRect(x + i, y, 4, 3); } }
    else { for (let i = 0; i < w; i += 7) { g.fillStyle = pal[1]; g.fillRect(x + i, y + 6 + ((i / 7) % 2) * 4, 5, 2); } g.fillStyle = pal[2]; g.fillRect(x + (w >> 1), y + 3, 1, h - 6); }
    g.fillStyle = '#6a4a1a'; g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h); g.globalAlpha = 1;
  }
  H.drawBack = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), st = S.stage, TS = ctx.TS, sx = st.sx, R0 = st.R;
    const gy = R(st.gallery - cy);
    g.fillStyle = '#3a3a46'; g.fillRect(R(st.gx0 - cx), gy - 22, R(st.gx1 - st.gx0), 2); g.fillStyle = '#6a6a7a'; g.fillRect(R(st.gx0 - cx), gy - 22, R(st.gx1 - st.gx0), 1);
    for (let x = st.gx0 + 6; x < st.gx1; x += 32) { const px = R(x - cx); g.fillStyle = '#2a2a34'; g.fillRect(px, gy - 22, 2, 22);
      g.fillStyle = '#e0d0a0'; g.fillRect(px - 2, gy - 25, 1, 5); g.fillRect(px + 3, gy - 25, 1, 5);
      g.fillStyle = '#b8a070'; g.fillRect(px + 4, R(S.y0 - cy), 1, gy - 24 - R(S.y0 - cy)); g.beginPath(); g.ellipse(px + 4, gy - 16, 3, 4, 0, 0, 7); g.strokeStyle = '#b8a070'; g.lineWidth = 1; g.stroke(); }
    const e = ctx.boss && ctx.boss.t === 'puppeteer' ? ctx.boss : null, changing = e && e.mode === 'scene', k = changing ? 1 - Math.max(0, e.modeT) / PUP.sceneT : 1;
    const drawSet = (idx, kk, dir) => { for (const [x0, x1, h] of PM.SCENES[idx].flats) { const w = (x1 - x0 + 1) * TS, xOff = dir * (1 - kk) * 220;
      flatPaint(g, R((sx + x0) * TS - cx + xOff), R((R0 - h) * TS + 4 - cy), w, h * TS - 4, idx, Math.max(0, Math.min(1, dir ? kk : 1))); } };
    if (changing) { drawSet(show.scene, 1 - k, 1); drawSet(show.nextScene, k, -1); }
    else drawSet(show.scene, 1, 0);
  };
  H.drawBatten = (m, cx, cy) => { const g = ctx.g(), S = A(); if (!S) return; const x = R(m.x - cx), y = R(m.y - cy), top = R(S.y0 + 6 - cy), fl = R(S.floor - cy);
    g.fillStyle = '#9aa3b0'; g.fillRect(x + 2, top, 1, y - top); g.fillRect(x + m.w - 3, top, 1, y - top);
    const fh = Math.max(0, Math.min(40, fl - y - 4)); if (fh > 0) { g.fillStyle = '#2a3a6a'; g.fillRect(x + 1, y + 4, m.w - 2, fh); g.fillStyle = '#e8ecf4'; g.beginPath(); g.arc(x + m.w - 9, y + 12, 3, 0, 7); g.fill();
      for (let i = 0; i < 5; i++) { g.fillStyle = '#fff6e0'; g.fillRect(x + 3 + i * 6, y + 8 + (i * 7) % 20, 1, 1); } g.fillStyle = '#1a2440'; g.fillRect(x + 1, y + 4 + fh - 1, m.w - 2, 1); }
    g.fillStyle = '#4a4e5a'; g.fillRect(x, y, m.w, 4); g.fillStyle = '#8a929e'; g.fillRect(x, y, m.w, 1); g.fillStyle = '#23252c'; g.fillRect(x, y + 3, m.w, 1);
    for (const dx of [3, m.w - 4]) { g.fillStyle = '#c9d1dc'; g.fillRect(x + dx - 1, y - 2, 3, 2); } };
  /* THE RIG, HIS LINE AND THE STRINGS (after the bodies) */
  H.drawRig = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), st = S.stage, e = ctx.boss && ctx.boss.t === 'puppeteer' ? ctx.boss : null;
    g.fillStyle = '#5a5a66'; for (let x = st.gx0 + 12; x < st.gx1; x += 64) { g.fillRect(R(x - cx), R(S.y0 - cy), 1, R(st.gallery - S.y0)); }
    const b = show.batten; if (b) { const k = PM.sandbagK(b), bx = R(b.x + b.w / 2 - cx), top = R(S.y0 + 6 - cy);
      g.fillStyle = '#2a2a34'; g.beginPath(); g.arc(bx, top, 4, 0, 7); g.fill(); g.fillStyle = '#8a919c'; g.fillRect(bx - 1, top - 1, 2, 2);
      const sx = R(S.x0 + 3 - cx), sy = R(S.y0 + 20 + (S.floor - S.y0 - 36) * k - cy);
      g.fillStyle = '#9aa3b0'; g.fillRect(sx + 3, top, 1, sy - top); g.fillStyle = '#7a6a4a'; g.fillRect(sx, sy, 8, 12); g.fillStyle = '#9a8a62'; g.fillRect(sx + 1, sy + 1, 6, 3); g.fillStyle = '#4a3a2a'; g.fillRect(sx, sy + 11, 8, 1);
      const px = R(st.pinX - cx), py = R(S.floor - cy);
      g.fillStyle = '#3a3a46'; g.fillRect(px - 2, py - 28, 5, 28); g.fillStyle = '#6a6a7a'; g.fillRect(px - 2, py - 28, 1, 28);
      for (const yy of [8, 14, 20]) { g.fillStyle = '#c8a050'; g.fillRect(px - 4, py - 28 + yy, 9, 2); g.fillStyle = '#fff0b0'; g.fillRect(px - 4, py - 28 + yy, 1, 1); }
      g.fillStyle = '#9aa3b0'; g.fillRect(px - 1, py - 26, 1, 20);
      if (b.st === 'down' && !(b.t > 0)) { const k2 = 0.5 + 0.5 * Math.sin(time * 6); g.globalAlpha = 0.25 + 0.3 * k2; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(px - 6.5, py - 31.5, 14, 32); g.globalAlpha = 1; } }
    if (!e) return;
    /* HIS LINE: the rope he hangs from, thick, from the grid to his bar; from the gallery, when it can be struck, it glows */
    if (!['downed', 'descend', 'haul'].includes(e.mode)) { const l = PM.hangLine(e, show), ready = show.joltCd <= 0 && ctx.P && Math.abs(ctx.P.y - show.A.gallery) < 8 && Math.abs(ctx.P.x - l.x0) < 90;
      g.fillStyle = '#c9a86a'; g.fillRect(R(l.x0 - cx) - 1, R(l.y0 - cy), 2, R(l.y1 - l.y0)); if (ready) { g.globalAlpha = 0.35 + 0.35 * Math.sin(time * 8); g.fillStyle = '#ffd36b'; g.fillRect(R(l.x0 - cx) - 2, R(l.y0 - cy), 4, R(l.y1 - l.y0)); g.globalAlpha = 1; } }
    const master = show.puppets.find(p => p.t === 'masterpiece' && p.alive);
    const bar = PM.barOf(e, !!master && e.phase >= 3);
    g.fillStyle = '#6a4a2a'; g.fillRect(R(bar.x0 - cx), R(bar.y - cy), R(bar.x1 - bar.x0) + 1, 3); g.fillRect(R((bar.x0 + bar.x1) / 2 - cx), R(bar.y - 5 - cy), 2, 10);
    /* THE STRINGS, always drawn: straight and bright (white, gold in a windup: the bonus cut) - never a thin line you can miss */
    for (const s of PM.stringsOf(e, show)) {
      const x0 = s.x0 - cx, y0 = s.y0 - cy, x1 = s.x1 - cx, y1 = s.y1 - cy;
      if (s.taut) { const k = 0.5 + 0.5 * Math.sin(time * 14 + s.i); g.globalAlpha = 0.3 + 0.25 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.globalAlpha = 1; }
      g.strokeStyle = s.taut ? '#fff6c8' : '#e8e0c8'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke();
      g.fillStyle = s.taut ? '#ffd36b' : '#e8e0c8'; g.fillRect(R(x1) - 1, R(y1) - 1, 3, 3); }   /* the knot at the limb: where the string holds */
    /* the cut ends, and the lengths whipping away */
    for (const p of show.puppets) { if (!p.alive || p.mode === 'packed') continue; const S2 = PM.STRINGS[p.t], bb = PM.barOf(e, p.t === 'masterpiece'), n = S2.length;
      p.str.forEach((st2, i) => { if (!st2.cut) return; const x0 = bb.x0 + (bb.x1 - bb.x0) * (n === 1 ? 0.5 : i / (n - 1)); g.fillStyle = '#c9c0b0'; g.fillRect(R(x0 - cx), R(bb.y - cy), 1, 8 + ((i * 3) % 5)); }); }
    if (show.whips) { for (const w of show.whips) { w.t -= 1 / 60; w.vy += 400 / 60; w.x += w.vx / 60; w.y += w.vy / 60; g.globalAlpha = Math.max(0, w.t / 0.7); g.strokeStyle = '#fff6c8'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(w.x - cx), R(w.y - cy)); g.quadraticCurveTo(R(w.x - cx) + 6, R(w.y - cy) - 10, R(w.x - cx) - 3, R(w.y - cy) - 22); g.stroke(); g.globalAlpha = 1; }
      show.whips = show.whips.filter(w => w.t > 0); }
  };
  /* THE TELLS AND THE READS (over everything) */
  H.drawTells = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), e = ctx.boss && ctx.boss.t === 'puppeteer' && ctx.boss.alive ? ctx.boss : null, st = S.stage, TS = ctx.TS;
    const pulse = 0.5 + 0.5 * Math.sin(time * 18);
    g.globalAlpha = 0.35 + 0.1 * Math.sin(time * 2); g.fillStyle = '#ffd36b'; g.fillRect(R(st.gx0 - cx), R(st.gallery - cy), R(st.gx1 - st.gx0), 1); g.globalAlpha = 1;
    if (e && e.mode === 'scene') { const k = 1 - Math.max(0, e.modeT) / PUP.sceneT; g.globalAlpha = 0.25 * Math.sin(Math.PI * k); g.fillStyle = '#05030a'; g.fillRect(0, 0, 4000, 4000); g.globalAlpha = 1; }
    if (e) for (const p of show.puppets) { if (p.mode === 'packed') continue;
      const px = R(p.x - cx), fy = R((p.floorY ?? p.y) - cy);
      /* HEALTH: a bar under every standing puppet; a DROPPED one shows the ring counting out how long it stays down */
      if (!PM.heaped(p) && p.alive && p.maxHp) { const w = p.t === 'masterpiece' ? 40 : p.t === 'marionette' ? 30 : 20, k = Math.max(0, p.hp / p.maxHp);
        g.fillStyle = '#1e1624'; g.fillRect(px - (w >> 1) - 1, fy + 3, w + 2, 4); g.fillStyle = k > 0.5 ? '#8fd160' : k > 0.25 ? '#e8c23a' : '#ff6b6b'; g.fillRect(px - (w >> 1), fy + 4, R(w * k), 2);
        for (let i = 1; i < 4; i++) { g.fillStyle = '#1e1624'; g.fillRect(px - (w >> 1) + R(w * i / 4), fy + 4, 1, 2); } }
      if (p.mode === 'heap' && p.downT > 0) { const full = PUP.downT[p.t] || 6, k = p.downT / full; g.strokeStyle = '#c9d1dc'; g.lineWidth = 2; g.beginPath(); g.arc(px + 0.5, fy - 18.5, 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke(); }
      const k = p.tellLen ? 1 - Math.max(0, p.modeT) / p.tellLen : 0, f = p.face || 1;
      if (p.mode === 'slamTell') { const r = PUP.brute.slamReach; g.globalAlpha = 0.25 + 0.5 * k * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(px - r, fy - PUP.brute.slamTop, 2 * r, 1); g.fillRect(px - r, fy - 1, 2 * r, 2);
        if (e.phase >= 2) { g.fillStyle = '#1e0a10'; for (let i = -1; i <= 1; i++) g.fillRect(px - 16 + i * 10, fy - 1, 8, 2); } g.globalAlpha = 1; }
      if (p.mode === 'chopTell') { g.globalAlpha = 0.3 + 0.5 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(px + f * 6, fy - 26, PUP.brute.chopReach - 6, f > 0 ? -Math.PI / 2 : Math.PI / 2 + Math.PI / 2, f > 0 ? Math.PI / 4 : Math.PI * 3 / 4 + Math.PI / 2); g.stroke(); g.globalAlpha = 1; }
      if (p.mode === 'grabTell') { g.globalAlpha = 0.3 + 0.5 * k * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.strokeRect(f > 0 ? px : px - PUP.brute.grabReach, fy - 40, PUP.brute.grabReach, 40); g.globalAlpha = 1; }
      if (p.mode === 'kickTell') { g.globalAlpha = 0.3 + 0.5 * k * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(f > 0 ? px : px - PUP.harl.kickReach, fy - PUP.lowTop, PUP.harl.kickReach, 1); g.globalAlpha = 1; }
      if (p.mode === 'recover' && p.t === 'marionette') { g.globalAlpha = 0.4 + 0.3 * pulse; g.fillStyle = '#8fd160'; g.fillRect(px - 10, fy - 70, 21, 1); g.globalAlpha = 1; }   /* his recovery: the window, a green bar over him */
      if (p.mode === 'stompTell') { g.globalAlpha = 0.35 + 0.45 * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(p.stompX - cx), R(S.floor - 2 - cy), PUP.master.stompHalf, 5, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (p.mode === 'reachTell' || p.mode === 'reach') bandDraw(g, 'high', p.reachY || st.gallery, p.x - PUP.master.reachSpan, p.x + PUP.master.reachSpan, p.mode === 'reachTell' ? k : -1, cx, cy, time);
      if (p.mode === 'reach') { const r = p.reachR || 0, sx2 = R(p.x - cx), sy = R(p.y - 62 - cy), ry = p.reachY || st.gallery;
        for (const d of [-1, 1]) { const tx = R(p.x + d * r - cx), ty = R(ry - 18 - cy); g.strokeStyle = '#b8844c'; g.lineWidth = 4; g.beginPath(); g.moveTo(sx2, sy); g.lineTo(tx, ty); g.stroke(); } } }
    if (e && (e.mode === 'whipLowTell' || e.mode === 'whipHighTell' || e.mode === 'whip')) { const f = e.face || 1, kind = e.mode === 'whip' ? e.whipKind : e.mode === 'whipLowTell' ? 'low' : 'high';
      bandDraw(g, kind, st.gallery, f > 0 ? e.x : e.x - PUP.whipReach, f > 0 ? e.x + PUP.whipReach : e.x, e.mode === 'whip' ? -1 : 1 - Math.max(0, e.modeT) / PUP.whipTell, cx, cy, time); }
    /* HE IS OPEN: a gold ring, OPEN, and the time running out under him */
    if (e && PM.pupOpen(e)) { const full = e.mode === 'downed' ? PUP.downOpenT : PUP.joltT, k = Math.max(0, e.modeT) / full;
      g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(e.x - cx), R(e.y - 18 - cy), 18, 24, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#1e1624'; g.fillRect(R(e.x - 16 - cx), R(e.y + 3 - cy), 32, 4); g.fillStyle = '#ffd36b'; g.fillRect(R(e.x - 15 - cx), R(e.y + 4 - cy), R(30 * k), 2);
      ctx.text('OPEN', R(e.x - cx), R(e.y - 54 - cy), pulse > 0.5 ? '#fff6c8' : '#ffd36b', 'center', 8); }
    const c = show.curtain || 0, cw = S.x1 - S.x0, top = R(S.y0 - cy), x0 = R(S.x0 - cx);
    if (c > 0) show.curtain = Math.min(1, c + 1 / 90);
    const drop = c > 0 ? Math.min(1, c * 1.4) : 0, hgt = 12 + R((S.floor - S.y0 - 12) * drop * (c < 0.8 ? 1 : 1 - (c - 0.8) * 5));
    g.fillStyle = '#6a1020'; g.fillRect(x0, top, cw, hgt); g.fillStyle = '#8a1a2a'; for (let x = 0; x < cw; x += 12) g.fillRect(x0 + x, top, 5, hgt);
    g.fillStyle = '#e8c23a'; g.fillRect(x0, top + hgt - 2, cw, 2); for (let x = 2; x < cw; x += 6) g.fillRect(x0 + x, top + hgt, 2, 2);
  };
  function bandDraw(g, kind, fy, x0, x1, k, cx, cy, time) {
    const [t, b] = PM.whipBand(kind, fy);
    if (k >= 0) { g.globalAlpha = 0.2 + 0.45 * k * (0.6 + 0.4 * Math.sin(time * 30)); g.fillStyle = '#ff6b6b';
      g.fillRect(R(x0 - cx), R(t - cy), R(x1 - x0), 1); g.fillRect(R(x0 - cx), R(b - 1 - cy), R(x1 - x0), 1); g.globalAlpha = 1; }
  }

  /* ---------- HIS SOUNDS ---------- */
  const S_ = ctx.SFX, SOUND = {
    jabTell: () => S_.tell && S_.tell(), jab: () => S_.foeSlash(), kickTell: () => S_.pupCreak(), kick: () => S_.throwWhoosh(), dart: () => S_.throwWhoosh(),
    chopTell: () => S_.tell && S_.tell(true), chop: () => { S_.foeSlash(); S_.pupThud(); }, grabTell: () => S_.pupCreak(), grab: () => S_.throwWhoosh(),
    slamTell: () => { S_.pupCreak(); S_.tell && S_.tell(true); }, slam: () => { S_.pupThud(); S_.golemStomp(); },
    heap: () => S_.pupClatter(), collapse: () => { S_.pupClatter(); S_.golemStomp(); },
    fly: () => S_.pupCreak(), rise: () => S_.ropeHaul(), masterTell: () => { S_.ropeHaul(); S_.pupCreak(); },
    descend: () => S_.pupCreak(), ascend: () => S_.ropeHaul(),
    whipTell: () => S_.pupWhipTell(), whip: () => S_.pupWhip(),
    swatTell: () => S_.pupCreak(), swat: () => S_.throwWhoosh(), stompTell: () => S_.pupCreak(), stomp: () => { S_.pupThud(); S_.golemStomp(); }, reachTell: () => S_.pupCreak(), reach: () => S_.throwWhoosh(),
    sceneTell: () => S_.pupScene(), land: () => S_.pupThud(),
    snap: () => { S_.pupSnap(); S_.pupSnap(); }, release: () => { S_.pupSnap(); S_.ropeHaul(); }, creak: () => S_.pupCreak(), curtain: () => S_.pupCurtain(),
  };
  return H;
}
