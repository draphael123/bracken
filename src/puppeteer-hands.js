// src/puppeteer-hands.js - THE PUPPETEER'S HANDS (claude/puppeteer). src/puppeteer.js is the fight, pure and proved in tools/puppeteer.mjs; this binds it
// to the world: the blows it throws on the heroes, a hero's swing on the strings and on the pin rail, the batten that carries you to the loft, and the
// drawing - the rig (the curtain, the grid's lines, the sandbag and the pin rail), the strings (slack and grey, or taut and glowing gold), the tells on
// the boards (the drop's shadow, the stomp's mark, the snare's loop, the whip's and the reach's bands with an arrow at every hero) and the batten.
// main.js owns the world and calls: spawn* (its spawn switch), update (the enemy loop), strike (updateProps, per hero, with his attack box), wood (a blow
// on a puppet's body, from hurtEnemy0), batten (updateMovers), drawBatten / drawRig / drawTells (drawWorld), camY (updateCamera), end (bossEnd), read (BK).
// Every teaching line goes through ctx.number with a line listed in src/hint-lines.js, so it lands in the hint box (never a dropped float).
import * as PM from './puppeteer.js';
const { PUP } = PM;

export function makePuppeteerHands(ctx) {
  let show = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'puppeteer' ? ctx.L.arena : null);
  const battenOf = () => (ctx.movers || []).find(m => m.batten) || null;
  H.show = () => show;
  H.on = () => !!(show && A());
  H.clear = () => { show = null; };
  /* SPAWNING: the Puppeteer first (the stage lays him first), then his puppets join his show. A fresh attempt spawns them all again: a fresh show */
  H.spawnBoss = base => { const S = A(); if (!S) return null; const st = S.stage;
    show = PM.newShow({ x0: S.x0, x1: S.x1, floor: S.floor, gallery: st.gallery, gx0: st.gx0, gx1: st.gx1 });
    const b = battenOf(); if (b) { b.st = 'down'; b.t = 0; b.y = b.down; } show.batten = b;
    const e = PM.newPuppeteer({ ...base, t: 'puppeteer', w: PUP.w, h: PUP.h, hp: ctx.EHP.puppeteer, maxHp: ctx.EHP.puppeteer, noGrav: true, markH: PUP.markH, face: -1 });
    e.y = st.gallery; return e; };
  H.spawnPuppet = (t, base) => { if (!show) return null; const d = PM.PUPPETS[t];
    const p = { ...base, t, w: d.w, h: d.h, hp: 999, maxHp: 999, noGrav: true,   /* (maxHp: part of the boss's fight, like a duelist's bar - the boss lab and the boss checks leave it standing) */ face: base.face || -1, markH: t === 'masterpiece' ? 100 : 40 };
    PM.newPuppet(p, show); if (t !== 'masterpiece') p.y = show.A.floor; return p; };
  H.owns = e => e.t === 'puppeteer' || PM.isPuppet(e);
  H.frame = e => PM.pupFrame(e);

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!show) return;
    const S = A(); if (!S) return;
    const b = battenOf(); show.batten = b;
    const heroes = ctx.players.map(pp => { const h = { x: pp.x, y: pp.y, face: pp.face || 1, alive: ctx.upright(pp), ground: !!pp.ground, lastFloor: pp.pupFloor };
      h.lastFloor = pp.pupFloor = PM.heroFloor(show, h); return h; });
    const evs = PM.stepShow(e, show, dt, {
      heroes,
      say: m => { if (m === '!' || m === '!!') ctx.number(e.x, e.y - 60, m, m === '!' ? '#ffd36b' : '#ff6b6b'); },
      number: (x, y, line, col) => ctx.number(x, y, line, col),
      sound: k => { const fn = SOUND[k]; if (fn) fn(); },
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead) return;
        if (ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) ctx.damagePlayer(o.from ?? e.x, d, { who: e, name, unblockable: !!o.unblockable, up: !!o.up }); }); },
      /* THE WHIP AND THE REACH: a band along the gallery at its height; each hero is judged once a sweep, the moment it reaches him, against his hurt box as it
         stands (ducked, in the air, or standing in it: src/duck.js duckBox) */
      band: (kind, fy, x0, x1, d, name, key) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead || pp.pupBand === key) return;
        if (P.x < x0 || P.x > x1 || Math.abs(P.y - fy) > 30) return; pp.pupBand = key; const hb = ctx.duckBox(P);
        if (PM.bandCatches(kind, fy, { t: hb.t, b: hb.b })) ctx.damagePlayer(P.x - (e.face || 1) * 10, d, { who: e, name, unblockable: true }); }); },
      snare: (h, t, d) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (Math.abs(P.x - h.x) > 2 || P.dead) return;
        P.snare = Math.max(P.snare || 0, t); ctx.damagePlayer(e.x, d, { who: e, name: 'THE SNARE', unblockable: true, noKnock: true }); }); },
      summon: (t, x, y) => { const n0 = ctx.enemies.length; ctx.spawnEnt({ t, x: Math.floor(x / ctx.TS), y: Math.floor(y / ctx.TS) - 1, face: -1 }); const q = ctx.enemies.slice(n0).find(q => q.t === t); if (q) { q.x = x; q.y = y; } return null; },
      pack: p => { p.alive = false; ctx.burst(p.x, p.y - 14, 8, ['#c89a60', '#e8c23a'], 50, 0.5); },
    });
    for (const v of evs) {
      if (v.t === 'phase') ctx.enrage(e);
      if (v.t === 'heap' || v.t === 'collapse') ctx.shakeCam(v.t === 'collapse' ? 6 : 2);
      if (v.t === 'drop' || v.t === 'stomp') ctx.shakeCam(3);
      if (v.t === 'fallen') { ctx.shakeCam(7); ctx.dust(e.x, S.floor, 10); }
      if (v.t === 'cancel') ctx.sparks(v.p.x, v.p.y - 20, v.p.face || 1, 5);
    }
    H.lastEvents = evs;
  };

  /* ---------- A HERO'S SWING: the strings, and the pin rail ---------- */
  H.strike = hb => {
    if (!show || !hb) return; const e = ctx.boss; if (!e || e.t !== 'puppeteer' || !e.alive || !ctx.bossActive) return;
    const P = ctx.P, seen = P.hitSet;
    const cuts = PM.strikeStrings(e, show, hb, seen);
    for (const c of cuts) { P.pupCutAt = ctx.time; SOUND.snap(); ctx.hitstop && ctx.hitstop(0.04);
      const at = c.k === 'new' ? { x: c.p.x, y: c.p.y - 30 } : (c.p.str.find(s => s.cutAt) || {}).cutAt || { x: c.p.x, y: c.p.y - 20 };
      ctx.burst(at.x, at.y, 6, ['#ffd36b', '#fff6c8'], 70, 0.35); }
    /* THE PIN RAIL: struck while the batten is down. Locked (phase 1: his fly line holds it) it clanks and says so */
    const b = battenOf(), S = A(); if (!b || !S) return;
    const px = S.stage.pinX, py = S.floor;
    if (seen && seen.has(b)) return;
    if (ctx.overlap(hb, { l: px - 7, r: px + 7, t: py - 30, b: py })) { if (seen) seen.add(b);
      const r = PM.pinStrike(b, show.free);
      if (r === 'locked') { ctx.SFX.clank(); ctx.number(px, py - 36, 'THE PIN RAIL IS LOCKED', '#9aa39a'); }
      else if (r === 'free') { show.n.pin++; SOUND.release(); ctx.shakeCam(3); ctx.burst(px, py - 24, 8, ['#c9a86a', '#e8dcc0'], 60, 0.4); }
      else ctx.SFX.clank(); }
  };
  /* A BLOW ON A PUPPET'S BODY: wood takes it and nothing comes of it (unless the same swing cut one of its strings) */
  H.wood = (e, fromX) => { ctx.SFX.stone(); e.flash = 0.08; ctx.sparks(e.x, e.y - (e.h || 20) / 2, Math.sign(e.x - fromX) || 1, 2);
    if (!(ctx.time - (ctx.P.pupCutAt ?? -9) < 0.4)) ctx.number(e.x, e.y - (e.h || 20) - 10, 'WOOD: CUT THE STRINGS', '#9aa39a'); };
  /* A WARDED BLOW ON HIM (his hands on the bars), told */
  H.warded = e => { if (!(e.wardSaid > ctx.time)) { e.wardSaid = ctx.time + 5; ctx.number(e.x, e.y - 60, 'THE BARS TAKE IT: CUT HIS STRINGS FIRST', '#9aa39a'); } };
  H.take = e => PM.pupTake(e);
  /* the boss bar says which act it is, and OPEN when he is */
  H.barName = b => (PM.pupOpen(b) ? 'THE PUPPETEER  OPEN' : b.phase >= 3 ? 'THE PUPPETEER  THE MASTERPIECE' : b.phase === 2 ? 'THE PUPPETEER  THE LOFT' : 'THE PUPPETEER');

  /* ---------- THE BATTEN (a mover: kind 'lift', batten: true) ---------- */
  H.batten = (m, dt) => { PM.stepBatten(m, dt); if (m.st === 'rise' && Math.random() < dt * 8) SOUND.creak(); };

  /* ---------- THE CAMERA: the whole stage, floor to grid, when the view is tall enough; else it follows and leans toward him ---------- */
  H.camY = ty => { const S = A(); if (!S) return ty; const VH = ctx.VH(), top = S.y0 - 8, bot = S.floor + 3 * ctx.TS;
    if (bot - top <= VH) return (top + bot) / 2 - VH / 2;
    const P = ctx.P; return Math.max(P.y - VH + 40, Math.min(ty, P.y - 60)); };

  /* ---------- HE FALLS: the puppets drop where they hang, and the curtain comes down ---------- */
  H.end = e => { if (!show) return;
    for (const p of show.puppets) if (p.alive) { p.mode = 'heap'; p.y = show.A.floor; p.str.forEach(s => { s.cut = true; }); ctx.burst(p.x, p.y - 12, 10, ['#c89a60', '#e8c23a', '#b8382c'], 60, 0.6); }
    show.curtain = 0.001; show.lowering = null; show.snare = null; SOUND.curtain(); };
  H.read = () => show && { mode: ctx.boss && ctx.boss.mode, n: { ...show.n }, free: show.free, line: show.line, batten: show.batten && { st: show.batten.st, y: show.batten.y, up: show.batten.up, down: show.batten.down, x: show.batten.x, w: show.batten.w },
    puppets: show.puppets.map(p => ({ t: p.t, x: Math.round(p.x), y: Math.round(p.y), mode: p.mode, alive: p.alive, flown: !!p.flown, left: PM.stringsLeft(p) })),
    strings: ctx.boss ? PM.stringsOf(ctx.boss, show).map(s => ({ t: s.p.t, k: s.k, taut: s.taut, x0: Math.round(s.x0), y0: Math.round(s.y0), x1: Math.round(s.x1), y1: Math.round(s.y1), lowering: !!s.lowering })) : [],
    snare: show.snare, lowering: show.lowering && { t: show.lowering.t } };

  /* ================= DRAWING ================= */
  const R = (x) => Math.round(x);
  /* THE BATTEN: a timber on two lines up to the grid's pulley */
  H.drawBatten = (m, cx, cy) => { const g = ctx.g(), S = A(); if (!S) return; const x = R(m.x - cx), y = R(m.y - cy), top = R(S.y0 + 6 - cy);
    g.fillStyle = '#c9a86a'; g.fillRect(x + 2, top, 1, y - top); g.fillRect(x + m.w - 3, top, 1, y - top);
    g.fillStyle = '#5a3a22'; g.fillRect(x, y, m.w, 7); g.fillStyle = '#8a5a32'; g.fillRect(x, y, m.w, 2); g.fillStyle = '#2a1a10'; g.fillRect(x, y + 6, m.w, 1);
    for (const dx of [3, m.w - 4]) { g.fillStyle = '#c9d1dc'; g.fillRect(x + dx - 1, y - 2, 3, 2); } };
  /* THE RIG AND THE STRINGS (after the bodies: a string runs over what it holds) */
  H.drawRig = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), st = S.stage, e = ctx.boss && ctx.boss.t === 'puppeteer' ? ctx.boss : null;
    /* the gallery's hangers, up to the grid */
    g.fillStyle = '#6a5a44'; for (let x = st.gx0 + 12; x < st.gx1; x += 64) { g.fillRect(R(x - cx), R(S.y0 - cy), 1, R(st.gallery - S.y0)); }
    /* the pulley over the batten, the sandbag on the far line (it falls as the batten rises) and the pin rail */
    const b = show.batten; if (b) { const k = PM.sandbagK(b), bx = R(b.x + b.w / 2 - cx), top = R(S.y0 + 6 - cy);
      g.fillStyle = '#3a2a1c'; g.beginPath(); g.arc(bx, top, 4, 0, 7); g.fill(); g.fillStyle = '#8a919c'; g.fillRect(bx - 1, top - 1, 2, 2);
      const sx = R(S.x0 + 3 - cx), sy = R(S.y0 + 20 + (S.floor - S.y0 - 36) * k - cy);
      g.fillStyle = '#c9a86a'; g.fillRect(sx + 3, top, 1, sy - top); g.fillStyle = '#7a6a4a'; g.fillRect(sx, sy, 8, 12); g.fillStyle = '#9a8a62'; g.fillRect(sx + 1, sy + 1, 6, 3); g.fillStyle = '#4a3a2a'; g.fillRect(sx, sy + 11, 8, 1);
      const px = R(st.pinX - cx), py = R(S.floor - cy), free = show.free;
      g.fillStyle = '#5a3a22'; g.fillRect(px - 2, py - 28, 5, 28); g.fillStyle = '#8a5a32'; g.fillRect(px - 2, py - 28, 5, 2);
      for (const yy of [8, 14, 20]) { g.fillStyle = '#e0c890'; g.fillRect(px - 4, py - 28 + yy, 9, 2); }
      g.fillStyle = '#c9a86a'; g.fillRect(px - 1, py - 26, 1, 20);
      if (!free) { g.fillStyle = '#5a6270'; g.fillRect(px - 3, py - 22, 7, 5); g.fillStyle = '#9aa39a'; g.fillRect(px - 2, py - 24, 5, 2); }   /* the iron lock */
      else if (b.st === 'down' && !(b.t > 0)) { const k2 = 0.5 + 0.5 * Math.sin(time * 6); g.globalAlpha = 0.35 + 0.4 * k2; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(px - 6.5, py - 31.5, 14, 32); g.globalAlpha = 1; } }
    /* the fly line he rides (while he still has it) */
    if (e && show.line) { const x = R(e.x + 3 - cx); g.fillStyle = '#c9a86a'; g.fillRect(x, R(S.y0 - cy), 1, R(e.y - 40 - S.y0)); }
    if (!e) return;
    /* the control bar in his hands, and the great crossbar for the masterpiece */
    const master = show.puppets.find(p => p.t === 'masterpiece' && p.alive);
    const bar = PM.barOf(e, !!master && e.phase >= 3);
    g.fillStyle = '#6a4a2a'; g.fillRect(R(bar.x0 - cx), R(bar.y - cy), R(bar.x1 - bar.x0) + 1, 2); g.fillRect(R((bar.x0 + bar.x1) / 2 - cx), R(bar.y - 4 - cy), 2, 8);
    /* THE STRINGS: slack ones hang grey with a sag; taut ones run straight and glow gold, pulsing - the only thing on the stage that glows that colour */
    for (const s of PM.stringsOf(e, show)) {
      const x0 = s.x0 - cx, y0 = s.y0 - cy, x1 = s.x1 - cx, y1 = s.y1 - cy;
      if (s.taut) { const k = 0.5 + 0.5 * Math.sin(time * 14 + s.i);
        g.globalAlpha = 0.25 + 0.2 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        g.globalAlpha = 1; g.strokeStyle = k > 0.5 ? '#fff6c8' : '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke();
        if (s.lowering) { g.fillStyle = '#ffd36b'; g.fillRect(R(x1) - 1, R(y1), 3, 3); } }
      else { g.globalAlpha = 0.7; g.strokeStyle = '#c9c0b0'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.quadraticCurveTo((x0 + x1) / 2 + 3, (y0 + y1) / 2 + 6, R(x1) + 0.5, R(y1) + 0.5); g.stroke(); g.globalAlpha = 1; } }
    /* the cut ends: a short length hanging from the bar, and the end left on the puppet */
    for (const p of show.puppets) { if (!p.alive || p.mode === 'packed') continue; const S2 = PM.STRINGS[p.t], big = p.t === 'masterpiece', bb = PM.barOf(e, big), n = S2.length;
      p.str.forEach((st2, i) => { if (!st2.cut) return; const x0 = bb.x0 + (bb.x1 - bb.x0) * (n === 1 ? 0.5 : i / (n - 1));
        g.fillStyle = '#c9c0b0'; g.fillRect(R(x0 - cx), R(bb.y - cy), 1, 9 + ((i * 3) % 5)); if (!PM.heaped(p)) g.fillRect(R(p.x + S2[i].dx * (p.face || 1) - cx), R(p.y - S2[i].up - 6 - cy), 1, 6); }); }
  };
  /* THE TELLS ON THE BOARDS (over everything, so no body hides one) */
  H.drawTells = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), e = ctx.boss && ctx.boss.t === 'puppeteer' && ctx.boss.alive ? ctx.boss : null, st = S.stage;
    const pulse = 0.5 + 0.5 * Math.sin(time * 18);
    if (e) for (const p of show.puppets) { if (!p.alive) continue;
      if (p.mode === 'dropTell' || p.mode === 'drop') { const k = p.mode === 'drop' ? 1 : 1 - Math.max(0, p.modeT) / PUP.dropTell;   /* THE DROP: its shadow on the boards under it, growing, red */
        g.globalAlpha = 0.3 + 0.4 * k; g.fillStyle = '#1e0a10'; g.beginPath(); g.ellipse(R(p.x - cx), R(p.floorY - 1 - cy), PUP.dropHalf * (0.5 + 0.5 * k), 3, 0, 0, 7); g.fill();
        g.globalAlpha = 0.4 + 0.4 * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(R(p.x - cx), R(p.floorY - 1 - cy), PUP.dropHalf + 1, 4, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (p.mode === 'stompTell') { g.globalAlpha = 0.35 + 0.45 * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(p.stompX - cx), R(S.floor - 2 - cy), PUP.stompHalf, 5, 0, 0, 7); g.stroke();
        g.fillStyle = '#ff6b6b'; g.fillRect(R(p.stompX - cx) - 1, R(S.floor - 22 - cy), 3, 12); g.globalAlpha = 1; }
      if (p.mode === 'spinTell') { g.globalAlpha = 0.25 + 0.35 * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(R(p.x - PUP.spinReach - cx), R(p.y - PUP.spinTop - cy), PUP.spinReach * 2, 1); g.fillRect(R(p.x - PUP.spinReach - cx), R(p.y - 1 - cy), PUP.spinReach * 2, 1); g.globalAlpha = 1; }
      if (p.mode === 'reachTell' || p.mode === 'reach') bandDraw(g, 'high', st.gallery, p.x - PUP.reachSpan, p.x + PUP.reachSpan, p.mode === 'reachTell' ? 1 - Math.max(0, p.modeT) / PUP.reachTell : -1, cx, cy, time);
      if (p.mode === 'reach') { const r = p.reachR || 0, sx = R(p.x - cx), sy = R(p.y - 62 - cy);   /* the great arm swept along the catwalk */
        for (const d of [-1, 1]) { const tx = R(p.x + d * r - cx), ty = R(st.gallery - 18 - cy); g.strokeStyle = '#b8844c'; g.lineWidth = 4; g.beginPath(); g.moveTo(sx, sy); g.lineTo(tx, ty); g.stroke(); g.fillStyle = '#e0b87a'; g.beginPath(); g.arc(tx, ty, 4, 0, 7); g.fill(); } } }
    if (show.snare) { const s = show.snare, k = e ? 1 - Math.max(0, e.modeT) / PUP.snareTell : 1;   /* THE SNARE: a loop of glowing string on the boards at your feet, drawing tight */
      g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(R(s.x - cx), R(s.y - 2 - cy), PUP.snareR + 4 - 4 * k, 3, 0, 0, 7); g.stroke();
      g.strokeStyle = '#ffd36b'; g.beginPath(); g.moveTo(R(s.x - cx), R(s.y - 2 - cy)); g.lineTo(R(e ? e.x - cx : s.x - cx), R(e ? e.y - 30 - cy : s.y - 40 - cy)); g.stroke(); g.globalAlpha = 1; }
    if (e && (e.mode === 'whipLowTell' || e.mode === 'whipHighTell' || e.mode === 'whip')) { const f = e.face || 1, kind = e.mode === 'whip' ? e.whipKind : e.mode === 'whipLowTell' ? 'low' : 'high';
      const x0 = f > 0 ? e.x : e.x - PUP.whipReach, x1 = f > 0 ? e.x + PUP.whipReach : e.x;
      bandDraw(g, kind, st.gallery, x0, x1, e.mode === 'whip' ? -1 : 1 - Math.max(0, e.modeT) / PUP.whipTell, cx, cy, time);
      if (e.mode === 'whip') { const [t, b] = PM.whipBand(kind, st.gallery), r = e.whipR || 0; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(e.x - cx), R(e.y - 30 - cy));
        g.lineTo(R(e.x + f * r - cx), R((t + b) / 2 - cy)); g.stroke(); } }
    /* HE IS OPEN: a gold ring round him and his bar's time running out under him (claude/archfix: every opening obvious) */
    if (e && PM.pupOpen(e)) { const full = e.mode === 'fallen' ? PUP.fallT : e.onStage ? PUP.restringT : PUP.loftRestringT, k = Math.max(0, e.modeT) / full;
      g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(R(e.x - cx), R(e.y - 18 - cy), 16, 22, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#1e1624'; g.fillRect(R(e.x - 14 - cx), R(e.y + 3 - cy), 28, 3); g.fillStyle = '#ffd36b'; g.fillRect(R(e.x - 13 - cx), R(e.y + 4 - cy), R(26 * k), 1);
      ctx.text('OPEN', R(e.x - cx), R(e.y - 50 - cy), pulse > 0.5 ? '#fff6c8' : '#ffd36b', 'center', 6); }
    /* THE CURTAIN: a red swag across the top of the stage; when he falls it comes down */
    const c = show.curtain || 0, cw = S.x1 - S.x0, top = R(S.y0 - cy), x0 = R(S.x0 - cx);
    if (c > 0) show.curtain = Math.min(1, c + 1 / 90);
    const drop = c > 0 ? Math.min(1, c * 1.4) : 0, hgt = 12 + R((S.floor - S.y0 - 12) * drop * (c < 0.8 ? 1 : 1 - (c - 0.8) * 5));
    g.fillStyle = '#6a1020'; g.fillRect(x0, top, cw, hgt); g.fillStyle = '#8a1a2a'; for (let x = 0; x < cw; x += 12) g.fillRect(x0 + x, top, 5, hgt);
    g.fillStyle = '#e8c23a'; g.fillRect(x0, top + hgt - 2, cw, 2); for (let x = 2; x < cw; x += 6) g.fillRect(x0 + x, top + hgt, 2, 2);
  };
  /* a band along the gallery at the whip's or the reach's height: told (k 0..1 as the tell runs) with an arrow at every hero on the gallery - up: jump it,
     down: duck it - and then the sweep itself (k < 0) */
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
    dropTell: () => S_.pupCreak(), dropFall: () => S_.throwWhoosh(), dropLand: () => S_.pupThud(), heap: () => S_.pupClatter(), collapse: () => { S_.pupClatter(); S_.golemStomp(); },
    fly: () => S_.pupCreak(), rise: () => S_.ropeHaul(), lower: () => S_.pupCreak(), cutLine: () => S_.pupSnap(), masterTell: () => { S_.ropeHaul(); S_.pupCreak(); },
    descendTell: () => S_.ropeHaul(), descend: () => S_.pupCreak(), restring: () => S_.pupKnot(), ascend: () => S_.ropeHaul(),
    whipTell: () => S_.pupWhipTell(), whip: () => S_.pupWhip(), snareTell: () => S_.pupWhipTell(), snare: () => S_.pupWhip(),
    swatTell: () => S_.pupCreak(), swat: () => S_.throwWhoosh(), stompTell: () => S_.pupCreak(), stomp: () => { S_.pupThud(); S_.golemStomp(); }, reachTell: () => S_.pupCreak(), reach: () => S_.throwWhoosh(),
    yank: () => S_.pupSnap(), land: () => S_.pupThud(),
    snap: () => S_.pupSnap(), release: () => { S_.pupSnap(); S_.ropeHaul(); }, creak: () => S_.pupCreak(), curtain: () => S_.pupCurtain(),
  };
  return H;
}
