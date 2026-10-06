// src/puppeteer-hands.js - THE PUPPETEER'S HANDS (claude/puppeteer, PUPPETEER3; THEATRE3; PUPPETEER2). src/puppeteer.js is the fight, pure and proved in
// tools/puppeteer.mjs; this binds it to the world and makes every hit READ:
//   - A BLOW ON A PUPPET in its slack window (strings slack, a gold outline, a timer pip: claude/theatre4) lands like any blow; any other time it CLANKS (a grey spark, STRINGS TAUT every time). In the NIGHT a puppet out of the
//     spotlights is dark: the blow clanks and the line says fight in the light.
//   - A CUT is a SNAP: a hit-stop, a shake, the cut length whipping away, the limb limp, said once. A dropped puppet lies in a heap with a ring counting out.
//   - THE LEVER (the pin rail at the stage door) is CHAINED - a padlocked chain across it; a strike clunks, said once. Both puppets down: the chain falls
//     away, the lever GLINTS (src/stuck-guide.js drawGlint) and the cue sounds. RIDE UP: on the gallery he REELS - a gold ring, OPEN, his time and the
//     visit's share of his health under him. Then his bar whirls (the gallery glows red) and every hero on it is THROWN back down (main.js fling).
//   - HIS TWO SLOW ATTACKS: the prop drop (a growing shadow, the sandbag or a painted piece falling onto it) and the snare line (a line from the grid with a
//     red bar at a told height - both heights marked across the stage while it is told - swept across).
//   - THE SCENES: STORM (the wing curtains billow, then the gust: streaks; main.js's wind pass shoves through windShove), NIGHT (the dark, two spotlights
//     from the grid, a little light round every hero), INFERNO (iron trapdoors in the boards: glow and smoke, then flames), SEA (a painted wave flat rises in
//     a wing, then rolls). Each scene's name is written over the stage as it comes in.
// main.js calls: spawn*, update, strike, hurtPuppet, warded, take, cap, windShove, batten, drawBack, drawBatten, drawRig, drawTells, camY, end, read.
// Every teaching line is a src/hint-lines.js line through ctx.number (the hint box).
import * as PM from './puppeteer.js';
import { bakeStageSkins } from './redraw/puppeteer_art.js';
import { drawGlint } from './stuck-guide.js';
const { PUP } = PM;

export function makePuppeteerHands(ctx) {
  let show = null, SK = null, dark = null;
  const orig = new Map();
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'puppeteer' ? ctx.L.arena : null);
  const battenOf = () => (ctx.movers || []).find(m => m.batten) || null;
  const skins = () => SK || (SK = bakeStageSkins());
  const hurt = (name, fn) => { const P = ctx.P, h0 = P.hp; fn(); if (show) { const k = String(name); show.hurt = show.hurt || {}; show.hurt[k] = (show.hurt[k] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const once = (k, fn) => { if (show && !show['said_' + k]) { show['said_' + k] = true; fn(); } };
  H.show = () => show;
  H.on = () => !!(show && A());
  H.clear = () => { show = null; };
  const cellI = (x, y) => y * ctx.LW() + x;
  function tile(x, y, kind) { const i = cellI(x, y), T = ctx.T; if (!orig.has(i)) orig.set(i, ctx.cellGet(i));
    if (kind === 'air') ctx.cellSet(i, T.AIR, null);
    else if (kind === 'ledge') ctx.cellSet(i, T.ONEWAY, skins().flatTop);
    else { const o = orig.get(i); ctx.cellSet(i, o[0], o[1]); } }
  /* THE IRON GRATING of the fly gallery. Anything that re-resolves the level's tile sprites (the theatre's flats and traps do, at load) wears it off, so it is laid again whenever it is missing (H.update) */
  function grate() { const S = A(); if (!S) return; const st = S.stage, G = Math.round(st.gallery / ctx.TS), gr = skins().grate;
    for (let x = Math.round(st.gx0 / ctx.TS); x < Math.round(st.gx1 / ctx.TS); x++) { const i = cellI(x, G), c = ctx.cellGet(i); if (c[0] === ctx.T.ONEWAY && c[1] !== gr[x % 3]) ctx.cellSet(i, ctx.T.ONEWAY, gr[x % 3]); } }
  H.spawnBoss = base => { const S = A(); if (!S) return null; const st = S.stage;
    for (const [i, o] of orig) ctx.cellSet(i, o[0], o[1]); orig.clear();
    show = PM.newShow({ x0: S.x0, x1: S.x1, floor: S.floor, gallery: st.gallery, gx0: st.gx0, gx1: st.gx1, sx: st.sx, TS: ctx.TS, y0: S.y0 }, Math.random);   /* (the fight's dice shuffle the scenes: a seeded run - bossLab - gets the same order every time) */
    grate();
    const b = battenOf(); if (b) { b.st = 'down'; b.t = 0; b.y = b.down; } show.batten = b;
    for (const pp of ctx.players) { pp.pupFloor = undefined; pp.pupStill = 0; }
    const e = PM.newPuppeteer({ ...base, t: 'puppeteer', w: PUP.w, h: PUP.h, hp: ctx.EHP.puppeteer, maxHp: ctx.EHP.puppeteer, noGrav: true, markH: PUP.markH, face: -1 });
    e.y = st.gallery; return e; };
  H.spawnPuppet = (t, base) => { if (!show) return null; const d = PM.PUPPETS[t];
    const p = { ...base, t, w: d.w, h: d.h, bodyK: d.bodyK, noGrav: true, face: base.face || -1, markH: t === 'masterpiece' ? 100 : t === 'marionette' ? 58 : 36 };
    PM.newPuppet(p, show); if (t !== 'masterpiece') p.y = show.A.floor; return p; };
  H.owns = e => e.t === 'puppeteer' || PM.isPuppet(e);
  H.frame = e => PM.pupFrame(e);
  H.bigF = e => (e.t === 'marionette' ? PUP.brute.scale : 1);

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => { if (SK) grate();
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
      band: (kind, fy, x0, x1, d, name, key, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead || pp.pupBand === key) return;
        if (P.x < x0 || P.x > x1 || Math.abs(P.y - fy) > 30) return; const hb = ctx.duckBox(P);
        if (PM.bandCatches(kind, fy, { t: hb.t, b: hb.b })) { pp.pupBand = key; const h0 = P.hp; hurt(name, () => ctx.damagePlayer(P.x - (e.face || 1) * 10, d, { who: e, name, unblockable: true }));
          if (o.snare && P.hp < h0 && !P.dead) P.snare = Math.max(P.snare || 0, o.snare); } }); },   /* (THE SNARE LINE: caught, the line holds you a moment) */
      tile: (x, y, kind) => tile(x, y, kind),
      /* THE SLAM BREAKS THE BOARDS (phase 2): rows R and R+1 of its columns fall in (the pit's floor is R+2) - and mend */
      pit: (x0, x1, open) => { for (let x = x0; x <= x1; x++) { if (x <= S.stage.sx + 3 || x >= S.wallR) continue; for (const y of [R0, R0 + 1]) tile(x, y, open ? 'air' : 'floor'); } if (open) { ctx.shakeCam(5); ctx.burst((x0 + x1 + 1) / 2 * ctx.TS, S.floor, 18, ['#6a4a2a', '#3a2a1a', '#c9a86a'], 110, 0.6); } },
      summon: (t, x, y) => { const n0 = ctx.enemies.length; ctx.spawnEnt({ t, x: Math.floor(x / ctx.TS), y: Math.floor(y / ctx.TS) - 1, face: -1 }); const q = ctx.enemies.slice(n0).find(q => q.t === t); if (q) { q.x = x; q.y = y; } return null; },
      pack: p => { p.alive = false; ctx.burst(p.x, p.y - 14, 8, ['#c89a60', '#e8c23a'], 50, 0.5); },
      /* THE KNOCKBACK: thrown off the gallery, down through it to the stage (not a teleport: a throw, and the fall) */
      fling: (h, dir) => { if (h.pp) ctx.fling(h.pp, dir, PUP.knockVx); },
    });
    for (const v of evs) {
      if (v.t === 'phase') ctx.enrage(e);
      if (v.t === 'heap') { ctx.shakeCam(4); ctx.hitstop(0.06); ctx.burst(v.p.x, v.p.y - 12, 14, ['#c89a60', '#e8c23a', '#fff6c8'], 90, 0.6); if (!show.saidHeap) { show.saidHeap = true; ctx.number(v.p.x, v.p.y - 40, 'ONE DOWN: HIS BAR DROPS', '#8fd160'); } }
      if (v.t === 'slam') ctx.shakeCam(4);
      if (v.t === 'stomp' || v.t === 'prop') ctx.shakeCam(3);
      if (v.t === 'cancel') ctx.sparks(v.p.x, v.p.y - 20, v.p.face || 1, 8);
      if (v.t === 'unchain') { show.chainFall = { t: 0, x: S.stage.pinX, y: S.floor - 20 }; ctx.shakeCam(3); }
      if (v.t === 'stagger') { ctx.shakeCam(6); ctx.hitstop(0.08); ctx.burst(e.x, e.y - 20, 14, ['#ffd36b', '#fff6c8'], 90, 0.5); }
      if (v.t === 'knock') { ctx.shakeCam(6); ctx.burst(e.x, e.y - 20, 16, ['#c9a86a', '#fff6c8', '#6a4a2a'], 160, 0.5); }
      if (v.t === 'sceneTell') show.title = { name: PM.SCENES[v.to].name, t: 2.4 };
      if (v.t === 'sceneDone' || v.t === 'restrung') ctx.shakeCam(2);
      if (v.t === 'flame') ctx.shakeCam(2);
      if (v.t === 'wave') ctx.shakeCam(2);
    }
    if (show.title) { show.title.t -= dt; if (show.title.t <= 0) show.title = null; }
    if (show.chainFall) { show.chainFall.t += dt; if (show.chainFall.t > 1.2) show.chainFall = null; }
    H.lastEvents = evs;
  };
  /* THE STORM's GUST, from main.js's wind pass (updateMoorWind: after the ground's friction, the way the moor and the Windcaller's howl shove) */
  H.windShove = (dt, shove) => { if (!show || !A()) return; const G = show.gust, P = ctx.P; if (!G || G.ph !== 'on' || !P || P.dead) return;
    const S = A(); if (P.x < S.x0 || P.x > S.x1 || Math.abs(P.y - S.stage.gallery) < 6) return;
    shove(G.dir, PUP.storm.shove, dt); };

  /* ---------- A HERO'S SWING: the strings, the lever ---------- */
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
    /* THE WOOD TURNS THE BLADE: a slack string on a puppet that is not spent - a clank, a grey spark, and the first time, said */
    for (const k of show.clanks.splice(0)) clank(k.at.x, k.at.y, k.p);
    /* THE LEVER: chained until both puppets are down (a clunk, said once); free, it sends the batten up */
    const b = battenOf(), S = A(); if (!b || !S) return;
    const px = S.stage.pinX, py = S.floor;
    if (seen && seen.has(b)) return;
    if (ctx.overlap(hb, { l: px - 7, r: px + 7, t: py - 30, b: py })) { if (seen) seen.add(b);
      const r = PM.pinStrike(b, show.free);
      if (r === 'free') { show.n.pin++; SOUND.release(); ctx.shakeCam(3); ctx.burst(px, py - 24, 8, ['#c9a86a', '#e8dcc0'], 60, 0.4); }
      else if (r === 'locked') { show.n.locked++; SOUND.locked(); ctx.sparks(px, py - 16, P.face || 1, 4); once('locked', () => ctx.number(px, py - 40, 'THE LEVER IS CHAINED: DROP BOTH PUPPETS', '#9aa39a')); }
      else ctx.SFX.clank(); }
  };
  /* THE CLANK (THEATRE3): wood that is not spent turns the blade - heard, seen, and said once (readability: never "nothing works"). In the NIGHT's dark, the dark is why */
  function clank(x, y, p) { ctx.SFX.clank(); ctx.sparks(x, y, (ctx.P && ctx.P.face) || 1, 7); ctx.burst(x, y, 6, ['#9aa39a', '#c9d1dc', '#fff6e0'], 60, 0.25); ctx.hitstop(0.03);
    /* (claude/theatre4, design standard B10) A TURNED BLOW SAYS SO EVERY TIME, over the puppet: STRINGS TAUT - or IN THE DARK at night (drawn in drawTells, never through number()'s word filter) */
    const dk = p && p.dark && PM.spent(p); if (p) { p.sayW = dk ? 'IN THE DARK' : 'STRINGS TAUT'; p.sayT = 0.9; p.clankT = 0.25; }
    if (dk) { once('dark', () => ctx.number(x, y - 24, 'IN THE DARK: STRIKE IT IN THE LIGHT', '#9ad0ff')); return; }
    once('clank', () => ctx.number(x, y - 24, 'STRINGS TAUT: STRIKE A PUPPET WHEN ITS STRINGS GO SLACK', '#9aa39a')); }
  /* (claude/theatre4) THE BODY'S READ, from main.js's foe pass (q = the sprite as drawn: set, frame, x, y, face, sx, sy, rot). under(): before the sprite -
     a GOLD OUTLINE round a hittable puppet. over(): after it - a GREY-STEEL tint on one that is not. Both remembered, so the NIGHT's dark (drawn later, in
     drawTells) can draw them again over itself: no puppet is ever drawn invisible while it matters */
  const OUTLINE = [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, 1], [-1, 1], [1, -1]];
  function rim(q, col, a) { if (!ctx.drawTinted || !q) return; for (const [ox, oy] of OUTLINE) ctx.drawTinted(q.set, null, q.frame, q.x + ox, q.y + oy, q.face, q.sx, q.sy, q.rot, col, a); }
  H.under = (p, q) => { p.pupQ = q; p.pupQT = ctx.time; if (PM.hurtable(p)) rim(q, '#ffd36b', 1); };
  H.over = (p, q) => { if (!PM.hurtable(p) && !PM.heaped(p) && ctx.drawTinted) ctx.drawTinted(q.set, null, q.frame, q.x, q.y, q.face, q.sx, q.sy, q.rot, '#8a96a8', (p.clankT > 0 ? 0.55 : 0.32)); };
  H.slump = p => PM.hurtable(p);
  /* A BLOW ON A PUPPET: in its told recovery (strings slack, gold, and lit) it lands like any blow and takes its health; any other time it clanks. A heap takes nothing */
  H.hurtPuppet = (p, dmg, fromX) => {
    if (!show || PM.heaped(p)) { ctx.SFX.stone(); return; }
    if (!PM.hurtable(p)) { show.n.clank = (show.n.clank || 0) + 1; clank(p.x, p.y - (p.h || 20) / 2, p); return; }
    const d = Math.max(1, Math.round(dmg)), dir = Math.sign(p.x - fromX) || 1;
    p.hp = Math.max(0, p.hp - d); p.flash = 0.12; p.hitT = 0.25;
    if (p.t === 'harlequin') p.x += dir * 10; else if (p.t === 'marionette') p.x += dir * 3;
    ctx.SFX.hit && ctx.SFX.hit(); ctx.sparks(p.x, p.y - (p.h || 20) / 2, dir, 5); ctx.number(p.x, p.y - (p.h || 20) - 8, d, '#fff6e0'); ctx.hitstop(0.03);
    show.n.hitPuppet = (show.n.hitPuppet || 0) + d;
  };
  H.warded = e => { if (!(e.wardSaid > ctx.time)) { e.wardSaid = ctx.time + 5; ctx.number(e.x, e.y - 60, show && PM.slackNow(e, show) ? 'THE LEVER IS FREE: RIDE UP TO HIM' : 'OUT OF REACH: DROP HIS PUPPETS FIRST', '#9aa39a'); } };
  H.take = e => PM.pupTake(e);
  /* A VISIT TAKES AT MOST PUP.visitCap OF HIM: a blow in the stagger lands whole until the visit's share is spent (then the knockback comes at once) */
  H.cap = (e, dmg) => { if (!show || !PM.pupOpen(e)) return dmg; const d = Math.max(0, Math.min(dmg, show.visitLeft)); show.visitLeft -= d; return d; };
  H.barName = b => (PM.pupOpen(b) ? 'THE PUPPETEER  REELING' : show && PM.slackNow(b, show) ? 'THE PUPPETEER  THE LEVER IS FREE' : b.phase >= 3 ? 'THE PUPPETEER  THE MASTERPIECE' : b.phase === 2 ? 'THE PUPPETEER  TOGETHER' : 'THE PUPPETEER');
  H.batten = (m, dt) => { PM.stepBatten(m, dt); if (m.st === 'rise' && Math.random() < dt * 8) SOUND.creak(); };
  H.camY = ty => { const S = A(); if (!S) return ty; const VH = ctx.VH(), top = S.y0 - 8, bot = S.floor + 3 * ctx.TS;
    if (bot - top <= VH) return (top + bot) / 2 - VH / 2;
    const P = ctx.P; return Math.max(P.y - VH + 40, Math.min(ty, P.y - 60)); };
  H.end = e => { if (!show) return;
    for (const p of show.puppets) if (p.alive) { p.mode = 'heap'; p.y = show.A.floor; p.str.forEach(s => { s.cut = true; }); p.downT = 0; ctx.burst(p.x, p.y - 12, 10, ['#c89a60', '#e8c23a', '#b8382c'], 60, 0.6); }
    show.drops.length = 0; show.snare = null; show.gust = null; show.wave = null; show.trap = null; show.spots = null; for (const p of show.puppets) p.dark = false;
    show.curtain = 0.001; SOUND.curtain(); };
  const ironCells = () => { const S = A(); if (!S || !SK) return 0; const st = S.stage, G = Math.round(st.gallery / ctx.TS); let n = 0; for (let x = Math.round(st.gx0 / ctx.TS); x < Math.round(st.gx1 / ctx.TS); x++) if (SK.grate.includes(ctx.cellGet(cellI(x, G))[1])) n++; return n; };
  H.read = () => show && { iron: ironCells(), mode: ctx.boss && ctx.boss.mode, cast: ctx.boss && ctx.boss.cast, n: { ...show.n }, free: show.free, cycle: show.cycle, scene: show.scene, sceneKey: PM.sceneKey(show), order: show.order.slice(), shifted: show.shifted,
    slack: show.slack, visitLeft: show.visitLeft, drops: show.drops.length, snare: show.snare && { ...show.snare }, gust: show.gust && { ...show.gust }, wave: show.wave && { ...show.wave }, trap: show.trap && { ...show.trap }, spots: show.spots && show.spots.map(s => Math.round(s.x)), hurt: { ...(show.hurt || {}) },
    batten: show.batten && { st: show.batten.st, y: show.batten.y, up: show.batten.up, down: show.batten.down, x: show.batten.x, w: show.batten.w },
    puppets: show.puppets.map(p => ({ t: p.t, x: Math.round(p.x), y: Math.round(p.y), mode: p.mode, alive: p.alive, hp: p.hp, maxHp: p.maxHp, left: PM.stringsLeft(p), downT: p.downT, dark: !!p.dark })),
    strings: ctx.boss ? PM.stringsOf(ctx.boss, show).map(s => ({ t: s.p.t, k: s.k, limb: s.limb, taut: s.taut, x0: Math.round(s.x0), y0: Math.round(s.y0), x1: Math.round(s.x1), y1: Math.round(s.y1) })) : [] };

  /* ================= DRAWING ================= */
  const R = (x) => Math.round(x);
  /* THE PAINTED FLATS, one palette and one motif per scene */
  function flatPaint(g, x, y, w, h, key, k) {
    const pal = { storm: ['#2a3040', '#4a5468', '#9aa6bc'], night: ['#0e1430', '#1e2a50', '#f4ecc0'], inferno: ['#4a1408', '#a8340e', '#ffb040'], sea: ['#0e2a4a', '#1e5a8a', '#e8f4ff'] }[key] || ['#3a2a1a', '#5a4a2a', '#c9a86a'];
    g.globalAlpha = k; g.fillStyle = pal[0]; g.fillRect(x, y, w, h);
    if (key === 'storm') { for (let i = 0; i < w; i += 10) { g.fillStyle = pal[1]; g.beginPath(); g.ellipse(x + i + 5, y + 6, 7, 4, 0, 0, 7); g.fill(); } g.fillStyle = pal[2]; for (let i = 3; i < w; i += 13) { g.fillRect(x + i, y + 10, 1, 4); g.fillRect(x + i + 1, y + 14, 1, 3); } }
    else if (key === 'night') { g.fillStyle = pal[2]; g.beginPath(); g.arc(x + w - 8, y + 6, 3, 0, 7); g.fill(); g.fillStyle = pal[0]; g.beginPath(); g.arc(x + w - 7, y + 5, 3, 0, 7); g.fill(); g.fillStyle = pal[2]; for (let i = 2; i < w - 12; i += 7) g.fillRect(x + i, y + 3 + (i * 5) % (h - 6), 1, 1); }
    else if (key === 'inferno') { for (let i = 0; i < w; i += 6) { g.fillStyle = pal[1]; g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + 3, y + 3 + (i % 5)); g.lineTo(x + i + 6, y + h); g.fill(); g.fillStyle = pal[2]; g.fillRect(x + i + 2, y + h - 6, 2, 4); } }
    else if (key === 'sea') { for (let i = 0; i < w; i += 8) { g.fillStyle = pal[1]; g.beginPath(); g.arc(x + i + 4, y + 8, 4, Math.PI, 0); g.fill(); g.fillStyle = pal[2]; g.fillRect(x + i + 1, y + 7, 3, 1); } }
    g.fillStyle = '#6a4a1a'; g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h); g.globalAlpha = 1;
  }
  H.drawBack = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), st = S.stage, TS = ctx.TS, sx = st.sx, R0 = st.R;
    const gy = R(st.gallery - cy);
    g.fillStyle = '#3a3a46'; g.fillRect(R(st.gx0 - cx), gy - 22, R(st.gx1 - st.gx0), 2); g.fillStyle = '#6a6a7a'; g.fillRect(R(st.gx0 - cx), gy - 22, R(st.gx1 - st.gx0), 1);
    for (let x = st.gx0 + 6; x < st.gx1; x += 32) { const px = R(x - cx); g.fillStyle = '#2a2a34'; g.fillRect(px, gy - 22, 2, 22);
      g.fillStyle = '#e0d0a0'; g.fillRect(px - 2, gy - 25, 1, 5); g.fillRect(px + 3, gy - 25, 1, 5);
      g.fillStyle = '#b8a070'; g.fillRect(px + 4, R(S.y0 - cy), 1, gy - 24 - R(S.y0 - cy)); g.beginPath(); g.ellipse(px + 4, gy - 16, 3, 4, 0, 0, 7); g.strokeStyle = '#b8a070'; g.lineWidth = 1; g.stroke(); }
    const e = ctx.boss && ctx.boss.t === 'puppeteer' ? ctx.boss : null, ch = show.change || (e && e.mode === 'scene' ? { t: e.modeT, len: PUP.sceneT } : null), k = ch ? 1 - Math.max(0, ch.t) / ch.len : 1;
    const drawSet = (idx, kk, dir) => { const key = PM.SCENES[idx].key; for (const [x0, x1, h] of PM.SCENES[idx].flats) { const w = (x1 - x0 + 1) * TS, xOff = dir * (1 - kk) * 220;
      flatPaint(g, R((sx + x0) * TS - cx + xOff), R((R0 - h) * TS + 4 - cy), w, h * TS - 4, key, Math.max(0, Math.min(1, dir ? kk : 1))); } };
    if (ch) { drawSet(show.scene, 1 - k, 1); drawSet(show.nextScene, k, -1); }
    else drawSet(show.scene, 1, 0);
    /* THE WING CURTAINS: in the STORM they billow before a gust (the way it will blow) and stream through it */
    const G = show.gust, bil = G ? (G.ph === 'tell' ? (1 - G.t / G.len) * 10 : 14 + 3 * Math.sin(time * 12)) * G.dir : 0, top = R(S.y0 - cy), fl = R(S.floor - cy);
    for (const [wx, side] of [[S.x0, 1], [S.x1, -1]]) { const x = R(wx - cx);
      for (let y = top; y < fl; y += 4) { const sway = PM.sceneKey(show) === 'storm' ? bil * Math.sin((y - top) / (fl - top) * Math.PI) * (G ? 1 : 0) + Math.sin(time * 2 + y * 0.05) * 1.2 : 0;
        g.fillStyle = (y >> 2) % 2 ? '#6a1020' : '#8a1a2a'; g.fillRect(side > 0 ? x : x - 10, y, 10, 4); if (sway) { g.fillStyle = '#7a1424'; g.fillRect(R((side > 0 ? x + 10 : x - 10) + Math.min(0, sway)), y, R(Math.abs(sway)), 4); } } }
  };
  H.drawBatten = (m, cx, cy) => { const g = ctx.g(), S = A(); if (!S) return; const x = R(m.x - cx), y = R(m.y - cy), top = R(S.y0 + 6 - cy), fl = R(S.floor - cy);
    g.fillStyle = '#9aa3b0'; g.fillRect(x + 2, top, 1, y - top); g.fillRect(x + m.w - 3, top, 1, y - top);
    const fh = Math.max(0, Math.min(40, fl - y - 4)); if (fh > 0) { g.fillStyle = '#2a3a6a'; g.fillRect(x + 1, y + 4, m.w - 2, fh); g.fillStyle = '#e8ecf4'; g.beginPath(); g.arc(x + m.w - 9, y + 12, 3, 0, 7); g.fill();
      for (let i = 0; i < 5; i++) { g.fillStyle = '#fff6e0'; g.fillRect(x + 3 + i * 6, y + 8 + (i * 7) % 20, 1, 1); } g.fillStyle = '#1a2440'; g.fillRect(x + 1, y + 4 + fh - 1, m.w - 2, 1); }
    g.fillStyle = '#4a4e5a'; g.fillRect(x, y, m.w, 4); g.fillStyle = '#8a929e'; g.fillRect(x, y, m.w, 1); g.fillStyle = '#23252c'; g.fillRect(x, y + 3, m.w, 1);
    for (const dx of [3, m.w - 4]) { g.fillStyle = '#c9d1dc'; g.fillRect(x + dx - 1, y - 2, 3, 2); } };
  /* THE RIG, THE LEVER AND ITS CHAIN, HIS LINE AND THE STRINGS (after the bodies) */
  H.drawRig = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), st = S.stage, e = ctx.boss && ctx.boss.t === 'puppeteer' ? ctx.boss : null;
    g.fillStyle = '#5a5a66'; for (let x = st.gx0 + 12; x < st.gx1; x += 64) { g.fillRect(R(x - cx), R(S.y0 - cy), 1, R(st.gallery - S.y0)); }
    const b = show.batten; if (b) { const k = PM.sandbagK(b), bx = R(b.x + b.w / 2 - cx), top = R(S.y0 + 6 - cy);
      g.fillStyle = '#2a2a34'; g.beginPath(); g.arc(bx, top, 4, 0, 7); g.fill(); g.fillStyle = '#8a919c'; g.fillRect(bx - 1, top - 1, 2, 2);
      const sx = R(S.x0 + 3 - cx), sy = R(S.y0 + 20 + (S.floor - S.y0 - 36) * k - cy);
      g.fillStyle = '#9aa3b0'; g.fillRect(sx + 3, top, 1, sy - top); g.fillStyle = '#7a6a4a'; g.fillRect(sx, sy, 8, 12); g.fillStyle = '#9a8a62'; g.fillRect(sx + 1, sy + 1, 6, 3); g.fillStyle = '#4a3a2a'; g.fillRect(sx, sy + 11, 8, 1);
      /* THE LEVER: the pin rail, and its handle - up while it holds the batten down, thrown when the batten flies */
      const px = R(st.pinX - cx), py = R(S.floor - cy);
      g.fillStyle = '#3a3a46'; g.fillRect(px - 2, py - 28, 5, 28); g.fillStyle = '#6a6a7a'; g.fillRect(px - 2, py - 28, 1, 28);
      for (const yy of [8, 14, 20]) { g.fillStyle = '#c8a050'; g.fillRect(px - 4, py - 28 + yy, 9, 2); g.fillStyle = '#fff0b0'; g.fillRect(px - 4, py - 28 + yy, 1, 1); }
      const thrown = b.st !== 'down', ang = thrown ? 0.9 : -0.9; g.strokeStyle = '#8a929e'; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 0.5, py - 14); g.lineTo(px + 0.5 + Math.sin(ang) * 14, py - 14 - Math.cos(ang) * 14); g.stroke();
      g.fillStyle = '#b8382c'; g.beginPath(); g.arc(px + 0.5 + Math.sin(ang) * 14, py - 14 - Math.cos(ang) * 14, 2.5, 0, 7); g.fill();
      /* CHAINED: a chain wound across it and a padlock (until both puppets are down) */
      if (!show.free) { for (let i = 0; i < 7; i++) { const t = i / 6, lx = px - 6 + t * 13, ly = py - 26 + t * 18; g.strokeStyle = i % 2 ? '#c9d1dc' : '#8a929e'; g.lineWidth = 1; g.beginPath(); g.ellipse(R(lx) + 0.5, R(ly) + 0.5, 2.5, 1.5, 0.9, 0, 7); g.stroke(); }
        for (let i = 0; i < 7; i++) { const t = i / 6, lx = px + 7 - t * 13, ly = py - 26 + t * 18; g.strokeStyle = i % 2 ? '#c9d1dc' : '#8a929e'; g.beginPath(); g.ellipse(R(lx) + 0.5, R(ly) + 0.5, 2.5, 1.5, -0.9, 0, 7); g.stroke(); }
        g.fillStyle = '#c8a050'; g.fillRect(px - 3, py - 15, 7, 6); g.strokeStyle = '#c8a050'; g.beginPath(); g.arc(px + 0.5, py - 15, 2.5, Math.PI, 0); g.stroke(); g.fillStyle = '#3a2a1a'; g.fillRect(px, py - 13, 1, 2); }
      /* the chain falling away */
      if (show.chainFall) { const t = show.chainFall.t; g.globalAlpha = Math.max(0, 1 - t / 1.2); for (let i = 0; i < 8; i++) { const lx = px - 6 + i * 2 + (i - 4) * 18 * t, ly = py - 24 + i * 2 + 160 * t * t; g.strokeStyle = '#c9d1dc'; g.lineWidth = 1; g.beginPath(); g.ellipse(R(lx) + 0.5, Math.min(py - 1, R(ly)) + 0.5, 2.5, 1.5, i, 0, 7); g.stroke(); } g.globalAlpha = 1; } }
    if (!e) return;
    /* HIS LINE: the rope he hangs from, thick, from the grid to his bar; slack (the lever free, or reeling), it hangs in a wave */
    const slack = e.mode === 'slack' || e.mode === 'staggered';
    { const l = PM.hangLine(e, show), y1 = slack ? e.y - 16 : l.y1;
      g.fillStyle = '#c9a86a'; if (!slack) g.fillRect(R(l.x0 - cx) - 1, R(l.y0 - cy), 2, R(y1 - l.y0));
      else for (let y = l.y0; y < y1; y += 2) g.fillRect(R(l.x0 + Math.sin(y * 0.15 + time * 3) * 3 - cx), R(y - cy), 1, 2); }
    const master = show.puppets.find(p => p.t === 'masterpiece' && p.alive);
    const bar = PM.barOf(e, !!master && e.phase >= 3 && !slack);
    g.fillStyle = '#6a4a2a'; g.fillRect(R(bar.x0 - cx), R(bar.y - cy), R(bar.x1 - bar.x0) + 1, 3); if (!slack) g.fillRect(R((bar.x0 + bar.x1) / 2 - cx), R(bar.y - 5 - cy), 2, 10);
    /* THE STRINGS, always drawn: straight and bright (white, gold in a windup: the bonus cut) - never a thin line you can miss */
    for (const s of PM.stringsOf(e, show)) {
      const x0 = s.x0 - cx, y0 = s.y0 - cy, x1 = s.x1 - cx, y1 = s.y1 - cy;
      if (s.slack) {   /* (claude/theatre4) SLACK: it droops - the puppet can be hit and the string cut */
        g.strokeStyle = '#e8dcb0'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.quadraticCurveTo(s.mx - cx, (s.my - cy) * 2 - (y0 + y1) / 2, R(x1) + 0.5, R(y1) + 0.5); g.stroke();
        g.fillStyle = '#ffd36b'; g.fillRect(R(x1) - 1, R(y1) - 1, 3, 3); continue; }
      { const k = 0.5 + 0.5 * Math.sin(time * 14 + s.i); g.globalAlpha = (s.taut ? 0.3 : 0.2) + 0.25 * k; g.strokeStyle = s.taut ? '#ffd36b' : '#9ad0ff'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.globalAlpha = 1; }   /* TAUT: a glow down its length - steel blue, or gold in a windup (the bonus cut) */
      g.strokeStyle = s.taut ? '#fff6c8' : '#dfe8f4'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke();
      g.fillStyle = s.taut ? '#ffd36b' : '#9aa3b0'; g.fillRect(R(x1) - 1, R(y1) - 1, 3, 3); }   /* the knot at the limb: where the string holds */
    /* the cut ends, and the lengths whipping away */
    for (const p of show.puppets) { if (!p.alive || p.mode === 'packed') continue; const S2 = PM.STRINGS[p.t], bb = PM.barOf(e, p.t === 'masterpiece'), n = S2.length;
      p.str.forEach((st2, i) => { if (!st2.cut) return; const x0 = bb.x0 + (bb.x1 - bb.x0) * (n === 1 ? 0.5 : i / (n - 1)); g.fillStyle = '#c9c0b0'; g.fillRect(R(x0 - cx), R(bb.y - cy), 1, 8 + ((i * 3) % 5)); }); }
    if (show.whips) { for (const w of show.whips) { w.t -= 1 / 60; w.vy += 400 / 60; w.x += w.vx / 60; w.y += w.vy / 60; g.globalAlpha = Math.max(0, w.t / 0.7); g.strokeStyle = '#fff6c8'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(w.x - cx), R(w.y - cy)); g.quadraticCurveTo(R(w.x - cx) + 6, R(w.y - cy) - 10, R(w.x - cx) - 3, R(w.y - cy) - 22); g.stroke(); g.globalAlpha = 1; }
      show.whips = show.whips.filter(w => w.t > 0); }
  };
  /* THE NIGHT: the dark over the stage, with the spotlights' pools and a little light round every hero cut out of it (an offscreen layer: overlapping lights stay lit) */
  function drawNight(g, S, cx, cy, time) {
    const VW = ctx.VW(), VH = ctx.VH(); if (!dark) { const d = (g.canvas && g.canvas.ownerDocument) ? g.canvas.ownerDocument.createElement('canvas') : null; if (!d) return; dark = d; }
    if (dark.width !== VW || dark.height !== VH) { dark.width = VW; dark.height = VH; }
    const d = dark.getContext('2d'); d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, VW, VH);
    d.fillStyle = 'rgba(4,6,18,' + PUP.night.dark + ')'; d.fillRect(R(S.x0 - cx) - 12, R(S.y0 - cy) - 8, R(S.x1 - S.x0) + 24, R(S.floor - S.y0) + 48);
    d.globalCompositeOperation = 'destination-out';
    const top = S.y0 - cy, fl = S.floor - cy, H2 = PUP.night.half;
    for (const s of show.spots) { const x = s.x - cx; d.fillStyle = 'rgba(0,0,0,0.55)'; d.beginPath(); d.moveTo(x - 6, top); d.lineTo(x + 6, top); d.lineTo(x + H2, fl); d.lineTo(x - H2, fl); d.closePath(); d.fill();
      d.fillStyle = 'rgba(0,0,0,1)'; d.beginPath(); d.ellipse(x, fl - 26, H2, 34, 0, 0, 7); d.fill(); }
    for (const pp of ctx.players) { if (!pp || pp.dead) continue; d.fillStyle = 'rgba(0,0,0,0.85)'; d.beginPath(); d.arc(pp.x - cx, pp.y - 12 - cy, 18, 0, 7); d.fill(); }
    g.drawImage(dark, 0, 0);
    for (const s of show.spots) { const x = R(s.x - cx); g.globalAlpha = 0.18 + 0.04 * Math.sin(time * 3 + s.x); g.fillStyle = '#fff2c0'; g.beginPath(); g.ellipse(x, R(fl) - 1, H2, 4, 0, 0, 7); g.fill(); g.globalAlpha = 0.5; g.fillStyle = '#fff6c8'; g.fillRect(x - 4, R(top), 9, 3); g.globalAlpha = 1; }
  }
  /* THE TELLS AND THE READS (over everything) */
  H.drawTells = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), e = ctx.boss && ctx.boss.t === 'puppeteer' && ctx.boss.alive ? ctx.boss : null, st = S.stage, TS = ctx.TS;
    const pulse = 0.5 + 0.5 * Math.sin(time * 18), key = PM.sceneKey(show), fl = R(S.floor - cy);
    if (key === 'night' && show.spots && e) { drawNight(g, S, cx, cy, time);
      /* (claude/theatre4) NEVER INVISIBLE: every standing puppet is drawn again over the dark - in a pool with its gold outline, in the dark as a grey-steel silhouette */
      for (const p of show.puppets) { if (!p.alive || PM.heaped(p) || p.mode === 'packed' || !p.pupQ || p.pupQT !== time) continue; const q = p.pupQ;
        if (PM.hurtable(p)) rim(q, '#ffd36b', 1); else if (p.dark && ctx.drawTinted) { rim(q, '#3a4458', 0.8); ctx.drawTinted(q.set, null, q.frame, q.x, q.y, q.face, q.sx, q.sy, q.rot, '#8a96a8', 0.8); } } }
    g.globalAlpha = 0.35 + 0.1 * Math.sin(time * 2); g.fillStyle = '#ffd36b'; g.fillRect(R(st.gx0 - cx), R(st.gallery - cy), R(st.gx1 - st.gx0), 1); g.globalAlpha = 1;
    const ch = show.change || (e && e.mode === 'scene' ? { t: e.modeT, len: PUP.sceneT } : null);
    if (ch) { const k = 1 - Math.max(0, ch.t) / ch.len; g.globalAlpha = 0.25 * Math.sin(Math.PI * k); g.fillStyle = '#05030a'; g.fillRect(0, 0, 4000, 4000); g.globalAlpha = 1; }
    /* INFERNO: the iron trapdoors in the boards - glowing and smoking before they burn, then the flames; the strips between are plain boards */
    if (key === 'inferno' && e) { const T = show.trap; PM.TRAPS.forEach((tr, i) => { const [x0, x1] = PM.trapPx(show.A, i), X0 = R(x0 - cx), w = R(x1 - x0), mine = T && PM.trapSet(i) === T.set;
      g.fillStyle = '#2a2a30'; g.fillRect(X0, fl - 1, w, 2); for (let x = 2; x < w; x += 5) { g.fillStyle = '#5a5a66'; g.fillRect(X0 + x, fl - 1, 2, 1); }
      if (mine && T.ph === 'tell') { const k = 1 - T.t / T.len; g.globalAlpha = 0.25 + 0.5 * k * pulse; g.fillStyle = '#ff7a2a'; g.fillRect(X0, fl - 3, w, 3); g.globalAlpha = 0.35 * k;
        for (let j = 0; j < 4; j++) { g.fillStyle = '#5a4a4a'; g.beginPath(); g.arc(X0 + 4 + j * (w - 8) / 3, fl - 6 - ((time * 30 + j * 7) % 18), 3, 0, 7); g.fill(); } g.globalAlpha = 1; }
      if (mine && T.ph === 'burn') { for (let x = 0; x < w; x += 3) { const hgt = PUP.inferno.top * (0.6 + 0.4 * Math.abs(Math.sin(time * 16 + x * 0.7 + i))); g.fillStyle = '#c8340e'; g.fillRect(X0 + x, R(fl - hgt), 3, R(hgt)); g.fillStyle = '#ffb040'; g.fillRect(X0 + x + 1, R(fl - hgt * 0.7), 1, R(hgt * 0.7)); g.fillStyle = '#fff2a0'; g.fillRect(X0 + x + 1, R(fl - hgt * 0.3), 1, R(hgt * 0.3)); } } }); }
    /* SEA: the wave flat rising in its wing, then rolling */
    if (key === 'sea' && show.wave) { const W = show.wave, wx = R(W.x - cx), hgt = W.ph === 'tell' ? R(18 * (1 - W.t / W.len)) : 18;
      g.fillStyle = '#1e5a8a'; g.beginPath(); g.moveTo(wx - 12, fl); g.quadraticCurveTo(wx - 6 * W.dir, fl - hgt * 1.4, wx + 10 * W.dir, fl - hgt); g.lineTo(wx + 12 * W.dir, fl); g.closePath(); g.fill();
      g.fillStyle = '#e8f4ff'; for (let j = 0; j < 4; j++) g.fillRect(wx + (6 + j * 2) * W.dir - 1, fl - hgt + j * 2, 2, 1);
      if (W.ph === 'tell') { g.globalAlpha = 0.3 + 0.4 * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(R(S.x0 - cx), fl - PUP.lowTop, R(S.x1 - S.x0), 1); g.globalAlpha = 1; } }
    /* THE STORM's gust: streaks across the stage the way it blows */
    if (key === 'storm' && show.gust && show.gust.ph === 'on') { const G = show.gust; g.globalAlpha = 0.45; g.fillStyle = '#c9d8f0';
      for (let j = 0; j < 14; j++) { const y = R(S.y0 - cy) + 20 + (j * 37) % R(S.floor - S.y0 - 24), x = R(S.x0 - cx) + ((j * 97 + time * 420 * G.dir) % (S.x1 - S.x0) + (S.x1 - S.x0)) % (S.x1 - S.x0); g.fillRect(x, y, 14, 1); } g.globalAlpha = 1; }
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
      const hh = p.t === 'masterpiece' ? 96 : p.t === 'marionette' ? 66 : 30, ww = p.t === 'masterpiece' ? 40 : p.t === 'marionette' ? 30 : 16;
      if (PM.hurtable(p)) {   /* THE WINDOW (claude/theatre4: the shared read, B10): slack strings and a GOLD outline (main.js -> H.under), and a TIMER PIP over its head - the window running out */
        const wk = PM.winK(p), tw = Math.max(14, ww), ty = fy - hh - 10; g.fillStyle = '#1e1624'; g.fillRect(px - (tw >> 1) - 1, R(ty) - 1, tw + 2, 4); g.fillStyle = pulse > 0.5 ? '#fff6c8' : '#ffd36b'; g.fillRect(px - (tw >> 1), R(ty), R(tw * wk), 2);
        g.globalAlpha = 0.18 + 0.12 * pulse; g.fillStyle = '#ffd36b'; g.beginPath(); g.ellipse(px + 0.5, fy - 1, ww / 2 + 6, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
      else if (p.dark && (p.mode === 'recover' || p.mode === 'stagger')) {   /* SPENT, BUT IN THE DARK: a dashed grey ring - bring it into the light */
        g.globalAlpha = 0.55; g.strokeStyle = '#9aa3b0'; g.lineWidth = 1; g.setLineDash && g.setLineDash([3, 3]); g.beginPath(); g.ellipse(px + 0.5, fy - hh / 2, ww / 2 + 4, hh / 2 + 4, 0, 0, 7); g.stroke(); g.setLineDash && g.setLineDash([]); g.globalAlpha = 1; }
      if (p.sayT > 0) { p.sayT -= 1 / 60; p.clankT = Math.max(0, (p.clankT || 0) - 1 / 60); g.globalAlpha = Math.min(1, p.sayT / 0.3); ctx.text(p.sayW || 'STRINGS TAUT', px, R(fy - hh - 18 - (0.9 - p.sayT) * 14), p.sayW === 'IN THE DARK' ? '#9ad0ff' : '#c9d1dc', 'center', 6); g.globalAlpha = 1; }   /* (claude/theatre4) the turned blow's word, rising */
      if (p.mode === 'stompTell') { g.globalAlpha = 0.35 + 0.45 * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(p.stompX - cx), R(S.floor - 2 - cy), PUP.master.stompHalf, 5, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (p.mode === 'reachTell' || p.mode === 'reach') bandDraw(g, 'high', p.reachY || st.gallery, p.x - PUP.master.reachSpan, p.x + PUP.master.reachSpan, p.mode === 'reachTell' ? k : -1, cx, cy, time);
      if (p.mode === 'reach') { const r = p.reachR || 0, sx2 = R(p.x - cx), sy = R(p.y - 62 - cy), ry = p.reachY || st.gallery;
        for (const d of [-1, 1]) { const tx = R(p.x + d * r - cx), ty = R(ry - 18 - cy); g.strokeStyle = '#b8844c'; g.lineWidth = 4; g.beginPath(); g.moveTo(sx2, sy); g.lineTo(tx, ty); g.stroke(); } } }
    /* THE PROP DROP: a shadow growing where it will land, and the sandbag (or a painted piece of the set) coming down onto it */
    for (const d of show.drops) { const k = 1 - Math.max(0, d.t) / d.len, sx = R(d.x - cx), sy = R(d.fy - cy);
      g.globalAlpha = 0.25 + 0.5 * k; g.fillStyle = '#3a0a10'; g.beginPath(); g.ellipse(sx + 0.5, sy - 1, d.half * (0.4 + 0.6 * k), 3, 0, 0, 7); g.fill();
      g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(sx + 0.5, sy - 1, d.half, 4, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      const top = S.y0 - 10, py = R(top + (d.fy - 6 - top) * k * k - cy);
      g.fillStyle = '#9aa3b0'; g.fillRect(sx, R(top - cy), 1, py - 10 - R(top - cy));
      if (!d.piece) { g.fillStyle = '#7a6a4a'; g.fillRect(sx - 6, py - 10, 12, 12); g.fillStyle = '#9a8a62'; g.fillRect(sx - 5, py - 9, 10, 3); g.fillStyle = '#4a3a2a'; g.fillRect(sx - 6, py + 1, 12, 1); }
      else { g.fillStyle = '#5a3a1a'; g.fillRect(sx - 14, py - 14, 28, 15); flatPaint(g, sx - 13, py - 13, 26, 13, key, 1); } }
    /* THE SNARE LINE: told at its wing (and its height marked the width of the stage), then the line and its red bar swept across */
    if (show.snare && e) { const sn = show.snare, [bt, bb] = PM.snareBand(sn.kind, S.floor), x = R(sn.x - cx), w2 = PUP.snare.bar / 2;
      if (sn.ph === 'tell') { const k = 1 - sn.t / sn.len; g.globalAlpha = 0.2 + 0.45 * k * (0.6 + 0.4 * Math.sin(time * 30)); g.fillStyle = '#ff6b6b'; g.fillRect(R(S.x0 - cx), R(bt - cy), R(S.x1 - S.x0), 1); g.fillRect(R(S.x0 - cx), R(bb - 1 - cy), R(S.x1 - S.x0), 1); g.globalAlpha = 1; }
      g.fillStyle = '#e8e0c8'; g.fillRect(x, R(S.y0 - cy), 1, R(bt - S.y0));
      g.fillStyle = '#ff6b6b'; g.fillRect(R(x - w2), R(bt - cy), PUP.snare.bar, R(bb - bt)); g.fillStyle = '#fff6c8'; g.fillRect(R(x - w2), R(bt - cy), PUP.snare.bar, 1); }
    /* THE KNOCKBACK, told: his bar whirls and the whole gallery glows red */
    if (e && e.mode === 'knockTell') { const k = 1 - Math.max(0, e.modeT) / PUP.knockTell; g.globalAlpha = 0.25 + 0.5 * k * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(R(st.gx0 - cx), R(st.gallery - 26 - cy), R(st.gx1 - st.gx0), 1); g.fillRect(R(st.gx0 - cx), R(st.gallery - 2 - cy), R(st.gx1 - st.gx0), 2);
      g.strokeStyle = '#ff9a5c'; g.lineWidth = 2; g.beginPath(); g.arc(R(e.x - cx), R(e.y - 20 - cy), 14 + 4 * k, time * 12, time * 12 + 4); g.stroke(); g.globalAlpha = 1; }
    /* HE REELS: a gold ring, OPEN, the time running out under him - and the visit's share of his health */
    if (e && PM.pupOpen(e)) { const full = PUP.staggerT, k = Math.max(0, e.openT || 0) / full, cap = Math.max(1, Math.round(e.maxHp * PUP.visitCap)), v = Math.max(0, show.visitLeft) / cap;
      g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(e.x - cx), R(e.y - 18 - cy), 18, 24, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#1e1624'; g.fillRect(R(e.x - 16 - cx), R(e.y + 3 - cy), 32, 7); g.fillStyle = '#ffd36b'; g.fillRect(R(e.x - 15 - cx), R(e.y + 4 - cy), R(30 * k), 2); g.fillStyle = '#ff6b6b'; g.fillRect(R(e.x - 15 - cx), R(e.y + 7 - cy), R(30 * v), 2);
      ctx.text('OPEN', R(e.x - cx), R(e.y - 54 - cy), pulse > 0.5 ? '#fff6c8' : '#ffd36b', 'center', 8); }
    /* THE LEVER IS FREE: the house glint (as the canal and the gorge) while the batten waits at the bottom */
    if (e && show.free && show.batten && show.batten.st === 'down') drawGlint(g, R(st.pinX - cx), R(S.floor - 34 - cy), ctx.VW(), ctx.VH(), time);
    /* the scene's name, as it comes in */
    if (show.title) { g.globalAlpha = Math.min(1, show.title.t / 0.5); ctx.text(show.title.name, R((S.x0 + S.x1) / 2 - cx), R(S.y0 + 26 - cy), '#ffd36b', 'center', 8); g.globalAlpha = 1; }
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
  const S_ = ctx.SFX, play = (...ks) => { for (const k of ks) if (typeof S_[k] === 'function') S_[k](); };
  const SOUND = {
    jabTell: () => S_.tell && S_.tell(), jab: () => S_.foeSlash(), kickTell: () => S_.pupCreak(), kick: () => S_.throwWhoosh(), dart: () => S_.throwWhoosh(),
    chopTell: () => S_.tell && S_.tell(true), chop: () => { S_.foeSlash(); S_.pupThud(); }, grabTell: () => S_.pupCreak(), grab: () => S_.throwWhoosh(),
    slamTell: () => { S_.pupCreak(); S_.tell && S_.tell(true); }, slam: () => { S_.pupThud(); S_.golemStomp(); },
    heap: () => S_.pupClatter(), collapse: () => { S_.pupClatter(); S_.golemStomp(); },
    fly: () => S_.pupCreak(), rise: () => S_.ropeHaul(), masterTell: () => { S_.ropeHaul(); S_.pupCreak(); },
    swatTell: () => S_.pupCreak(), swat: () => S_.throwWhoosh(), stompTell: () => S_.pupCreak(), stomp: () => { S_.pupThud(); S_.golemStomp(); }, reachTell: () => S_.pupCreak(), reach: () => S_.throwWhoosh(),
    sceneTell: () => S_.pupScene(),
    /* PUPPETEER2: his two slow attacks, the lever's chain, the visit and the knockback, the scenes */
    dropTell: () => { S_.ropeHaul(); S_.tell && S_.tell(true); }, propLand: () => { S_.pupThud(); S_.golemStomp(); },
    snareTell: () => { play('pupKnot'); S_.tell && S_.tell(true); }, snare: () => S_.pupWhip(),
    unchain: () => { play('forgeChain', 'pupSnap', 'gateLift'); }, locked: () => { S_.clank(); play('forgeChain'); },
    stagger: () => { S_.pupThud(); S_.pupCreak(); play('bossHurt'); }, knockTell: () => S_.pupWhipTell(), knock: () => { S_.pupWhip(); S_.throwWhoosh(); },
    gustTell: () => play('gustRise'), gust: () => play('gust'), flameTell: () => play('hiss'), flame: () => play('pyreBoom', 'emberBurst'), waveTell: () => play('gustRise'), wave: () => play('waveCrash', 'splash'),
    snap: () => { S_.pupSnap(); S_.pupSnap(); }, release: () => { S_.pupSnap(); S_.ropeHaul(); }, creak: () => S_.pupCreak(), curtain: () => S_.pupCurtain(),
  };
  return H;
}
