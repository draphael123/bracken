// src/rookery-hands.js - THE ROOKERY: the level's rule and machines (claude/rookery, the OPUS GREYBOX, 2026-10-25; brief scratch/brief-rookery-1024.md).
// src/rookery.js builds the level; this binds it to the game. main.js owns the world and calls:
//   reset (spawnEntities), update, harpy (every crag harpy's frame, before her own AI; true = handled), props (the guide's), hoist / read (tools, the pilot bot),
//   drawWorld (the cracked rocks, their marks and what they will do, the roosts, the dive lines, the shrieker's mark, the area banner), harpyOver (a shrieker's crest,
//   a harpy's aim line), drawSky (THE MONASTERY ROOF below and behind, THE ROC'S PEAK ahead).
// THE RULE (L.rule): A HARPY'S DIVE BREAKS WHAT IT HITS.
//   A CRACKED ROCK (L.hoists, the Rootway's / the Palisade's data shape, so the guide, the reach fill and the pilot bot read it unchanged: `cleat` is THE MARK, the cell a
//   hero stands in to bait her) is drawn split and guano-white, a pale ring painted on it - and what it will do is DRAWN FIRST (the trebuchet test: a dotted ghost of
//   the hole, the bridge, the platform or the steps). Each one has a ROOST over it (`roost`: a nest on the crag where its harpy lives). STAND ON THE MARK and she
//   SCREAMS, aims (a red line from her to the mark, K.aim s) and DIVES - straight at the mark. Step off it (or block her): she hits the rock, it BREAKS, and she lies
//   STUNNED IN THE RUBBLE (plunge her there). If she is dead the roost sends another (K.respawn s). What it breaks:
//     drop    the cracked floor gives way: a hole into the way below (`clear`: cells to air)
//     span    a cracked PILLAR on the lip topples across the gap: a bridge (`span`: one-way cells)
//     nest    a BONE NEST hangs off a cracked arm over the gap: the arm goes, the nest drops - a platform (`span`)
//     steps   a cracked OVERHANG over the cliff: the slab slides down the face as steps (`steps`, the palisade ramp's shape)
//   Any crag harpy's own dive that ends on a mark breaks it too (the rule is the rule). What breaks STAYS for the attempt (a death lays it again).
// THE HARPY SHRIEKER (a crag harpy with e.rkShriek, skin 'shrieker' - the level's ONE new foe): she hangs high, SCREAMS (a red !!, rings off her, K.shriek.tell s) and
//   MARKS YOUR SPOT (a red ring on the ground); every harpy in earshot dives AT THE MARK, one after another. Off the mark and they hit the rock - stand on a crack
//   and let her mark you, and they break it for you. After a scream she swoops low (open) and climbs back.
// Every capital line it says goes through ctx.number with a line listed here (RK_SAY) and in src/hint-lines.js.
import { canvas, flipX, whiten } from './px.js';
import * as RKW from './redraw/rookery_world.js';
import { drawHang, drawLegs } from './redraw/rookery_hang.js';
import * as RKA from './redraw/rookery_anchor_art.js';
import { GALE, GALE_SAY, galeStep, drawGust } from './gale-harpy.js';   /* (claude/rookery2) THE GALE HARPY: a shared foe module (Windcaller 4 and the Roc reuse it) */   /* (claude/rookeryart) the cracked rocks, nests, roosts, the area plate: drawn there */
/* THE SHRIEKER's skin (greybox): the crag harpy's frames, darkened to a blood-red (her crest is drawn over her: harpyOver) - main.js SPR.shrieker */
export function bakeShriekerSet(Hs) {
  const R = Hs.R.map(c => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(130,28,36,0.5)'; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over'; return o; });
  const white = R.map(c => whiten(c));
  return { R, L: R.map(flipX), white: { R: white, L: white.map(flipX) }, ax: Hs.ax, ay: Hs.ay, w: Hs.w, h: Hs.h };
}
/* (claude/rookery2) CATCH A RIDE (K.ride): a ride harpy dives at a hero on her MOUNT; blocked (or dodged into the rock) she is knocked down, then she LIFTS (K.ride.lift s, slowly,
   gold UP: GRAB): grab her talons (UP or GRAB near her) and she carries you along her fixed path (her dotted feather trail, drawn first) and shakes you off at its end.
   JUMP lets go (normal air control). A carried hero cannot attack. A gust shoves her off line (it springs back); a dive that finds the rider knocks him off. */
export const RIDE = { zone: 3.5, aim: 0.8, cd: 1.6, lift: 1.6, liftV: 26, reach: 26, v: 118, minT: 1.6, maxT: 3.2, hang: 24, shake: 0.25, hop: 150, hp: 30, spring: 3 };
export const K = { aim: 0.75, diveV: 300, diveDmg: 8, stun: 2.2, respawn: 4.5, markW: 18, fold: 0.5,
  shriek: { reach: 15, tell: 0.9, mark: 1.3, cd: 5.6, swoop: 1.7, call: 18, gap: 0.32, low: 40, hi: 78 } };
export const KIND = { drop: 'crackfloor', span: 'crackpillar', nest: 'cracknest', steps: 'crackslab' };   /* the ent kind at a mark (src/rookery.js) - the guide's done names it */
export const RK_SAY = {
  scream: 'SHE SCREAMS: OFF THE MARK', breaks: 'HER DIVE BREAKS THE ROCK', drop: 'THE FLOOR GIVES WAY', span: 'THE PILLAR FALLS ACROSS', nest: 'THE NEST COMES DOWN',
  steps: 'THE SLAB SLIDES DOWN', ride: 'BLOCK HER DIVE, THEN GRAB HER TALONS: UP', grab: 'UP: GRAB', riding: 'SHE CARRIES YOU: JUMP LETS GO', shook: 'SHE SHAKES YOU OFF', letGo: 'YOU LET GO',
  knocked: 'KNOCKED OFF HER TALONS', through: 'SHE FLIES THROUGH IT', gust: GALE_SAY.gust, broken: GALE_SAY.broken, braced: GALE_SAY.braced, shoved: GALE_SAY.shoved, stunned: 'STUNNED IN THE RUBBLE', roost: 'THE ROOST SENDS ANOTHER', marked: 'THE SHRIEKER MARKS YOU',
};
/* the cells a cracked rock lays (or opens) when it breaks: [x, y, 'S'|'O'|'A'] - also read by src/reachcore.js and tools/rookery.mjs */
export function crackCells(d, solidAt) {
  const out = [];
  if (d.load === 'drop') { const [x0, x1, y0, y1] = d.clear; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push([x, y, 'A']); }
  if (d.load === 'span' || d.load === 'nest') for (let x = d.span[0]; x <= d.span[1]; x++) out.push([x, d.span[2], 'O']);
  if (d.load === 'steps') for (const [x0, x1, row, k] of d.steps) for (let x = x0; x <= x1; x++) { if (k === 'O') { out.push([x, row, 'O']); continue; }
    for (let y = row, n = 0; n < 8 && !(solidAt && solidAt(x, y)); y++, n++) out.push([x, y, 'S']); }
  return out;
}
/* (claude/rookery2) A RIDE (L.rkRides): { id, mount [x, y] (the cell a hero stands in), roost [x, y], path [[x, y] ...] (cells her talons pass), land [x, y] (the cell he is shaken off
   into, over footing) } - its points in px, from (fx, fy) */
export function ridePts(d, fx, fy, TS = 16) { return [[fx, fy], ...d.path.map(([x, y]) => [x * TS + 8, y * TS + 8 - RIDE.hang]), [d.land[0] * TS + 8, (d.land[1] + 1) * TS - 6 - RIDE.hang]]; }
export function alongPts(pts, k) { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  let t = k * tot; for (let i = 1; i < pts.length; i++) { if (t <= L[i - 1] || i === pts.length - 1) { const q = L[i - 1] ? Math.min(1, t / L[i - 1]) : 1; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * q, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * q, tot]; } t -= L[i - 1]; }
  return [pts[pts.length - 1][0], pts[pts.length - 1][1], tot]; }
export const markX = (d, TS = 16) => d.cleat[0] * TS + 8;
export const markY = (d, TS = 16) => (d.cleat[1] + 1) * TS;   /* the floor's top under the mark */

export function makeRookeryHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().rookery);
  const say = (x, y, k, col = '#ffd36b') => ctx.number(x, y, RK_SAY[k], col);
  const once = k => { if (S.said.has(k)) return false; S.said.add(k); return true; };
  const sfx = (...ks) => { for (const k of ks) { const f = ctx.sfx[k]; if (f) { try { f(); } catch {} return; } } };
  const lay = d => { for (const [x, y, k] of crackCells(d, (x, y) => ctx.solidAt(x, y))) ctx.cellSet(x, y, k === 'S' ? ctx.T.SOLID : k === 'O' ? ctx.T.ONEWAY : ctx.T.AIR); };

  /* ---------- RESET (every load and every respawn: the grid was laid again, the foes spawned again) ---------- */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.rookery) { S = null; return; }
    const keep = S && S.L === lv ? S : null;
    const cs = new Map();
    for (const d of (lv.hoists || [])) { const was = keep && keep.cs.get(d.id), stay = was && was.state === 'broken';
      cs.set(d.id, stay ? Object.assign(was, { e: null, respawnT: 0 }) : { d, id: d.id, state: 'whole', t: 0, e: null, respawnT: 0, fold: 0 });
      if (stay) lay(d); }
    const rides = new Map(); for (const d of (lv.rkRides || [])) rides.set(d.id, { d, id: d.id, e: null, respawnT: 0, n: 0 });
    S = { L: lv, cs, rides, lastDive: -9, lastGust: -9, said: keep ? keep.said : new Set(), sec: -1, banner: null, marks: [], dives: new Set(),
      n: keep ? keep.n : { rides: 0, grabs: 0, shook: 0, letGo: 0, knocked: 0, rideDives: 0, gusts: 0, galeBroken: 0, baits: 0, breaks: 0, byKind: { drop: 0, span: 0, nest: 0, steps: 0 }, stunned: 0, screams: 0, called: 0, respawns: 0, diveHits: 0, diveBlocks: 0 } };
    for (const e of ctx.enemies()) if (e.alive && (e.t === 'harpy' || e.t === 'shrieker')) { e.rkDive = null; e.rkAim = null;
      if (e.rkRoost) { const c = S.cs.get(e.rkRoost); if (c && !c.e) c.e = e; }
      if (e.rkShriek) { e.rkCd = 1.5; e.rkSm = 'hover'; }
      if (e.rkRide) { const c = S.rides.get(e.rkRide); if (c && !c.e) c.e = e; e.rdCd = 0.6; e.rdLift = true; e.hp = Math.max(e.hp, RIDE.hp); } }
    for (const p of ctx.players()) if (p) p.rkRide = null;
  };

  /* ---------- A DIVE AT A SPOT (a bait, a shrieker's call): straight at it; what it meets breaks ---------- */
  function startAim(e, tx, ty, t, why) {
    e.rkAim = { tx, ty, t, why }; e.mode = 'aim'; e.modeT = t + 1; e.face = Math.sign(tx - e.x) || e.face;
    sfx('screech'); ctx.number(e.x, e.y - 14, '!!', '#ff6b6b');
  }
  function startDive(e) {
    const a = e.rkAim; e.rkAim = null; const d = Math.hypot(a.tx - e.x, a.ty - 6 - e.y) || 1;
    e.rkDive = { fx: e.x, fy: e.y, tx: a.tx, ty: a.ty - 6, t: 0, T: Math.max(0.18, d / K.diveV), hit: false, why: a.why }; e.mode = 'dive'; S.dives.add(e); S.lastDive = ctx.time(); if (e.rkRide) { S.n.rideDives++; e.rdLift = false; }
  }
  /* the cracked rock under a spot (x px, floor y px), if any */
  const crackAt = (x, y) => { for (const c of S.cs.values()) if (c.state === 'whole' && Math.abs(x - markX(c.d, TS)) < K.markW + 4 && Math.abs(y - markY(c.d, TS)) < 14) return c; return null; };
  function smash(c, e) {
    if (!c || c.state !== 'whole') return false; c.state = 'break'; c.t = 0; S.n.breaks++; S.n.byKind[c.d.load]++;
    const x = markX(c.d, TS), y = markY(c.d, TS); ctx.shake(5); sfx('crack', 'stone'); sfx('heavy', 'thud');
    ctx.burst(x, y - 4, 16, ['#e8e4d8', '#9a948a', '#5a564e', '#ffffff'], 110, 0.7); ctx.dust(x, y, 10);
    if (once('breaks')) say(x, y - 34, 'breaks');
    if (c.d.load === 'drop') { lay(c.d); c.state = 'broken'; say(x, y - 22, 'drop', '#8fd160'); }
    return true;
  }
  function impact(e, X, Y) {
    const c = crackAt(X, Y + 6); if (c) smash(c, e);
    e.rkDive = null; S.dives.delete(e);
    if (!e.alive) return;
    e.mode = 'downed'; e.modeT = c ? K.stun : 1.2; e.stagger = e.modeT; e.vy = -40; ctx.dust(e.x, Y, 6);
    if (c) { S.n.stunned++; if (once('stunned')) say(e.x, Y - 20, 'stunned', '#8fd160'); }
  }
  function diveStep(e, dt) {
    const v = e.rkDive; v.t += dt; const k = Math.min(1, v.t / v.T);
    e.x = v.fx + (v.tx - v.fx) * k; e.y = v.fy + (v.ty - v.fy) * k; e.face = Math.sign(v.tx - v.fx) || e.face; e.mode = 'dive';
    if (!v.hit) for (const p of ctx.players()) { if (!p || p.dead) continue; if (Math.abs(p.x - e.x) < 11 && Math.abs((p.y - 8) - e.y) < 13) { v.hit = true;
      let res = null; ctx.asPlayer(p, () => { res = ctx.damage(e.x, K.diveDmg, { who: e, name: 'THE DIVE' }); });
      if (res === 'blocked') { S.n.diveBlocks++; ctx.number(e.x, e.y - 12, 'KNOCKED DOWN', '#8fd160'); impact(e, e.x, Math.min(v.ty + 6, p.y)); return; }
      if (res === 'hit') { S.n.diveHits++; if (p.rkRide) dropRider(p, 'knocked'); } } }
    if (k >= 1) impact(e, v.tx, v.ty + 6);
  }

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!S) return; const lv = L(), ps = ctx.players(), P = ps[0];
    /* a harpy cut down in her dive still comes down on the rock she was diving at */
    for (const e of [...S.dives]) if (!e.alive && e.rkDive) { const v = e.rkDive; impact(e, v.tx, v.ty + 6); }
    for (const c of S.cs.values()) { const d = c.d;
      if (c.state === 'break') { c.t += dt; c.fold = Math.min(1, c.t / K.fold);
        if (c.t >= K.fold) { c.state = 'broken'; lay(d); ctx.shake(4); sfx('heavy', 'thud');
          const cells = crackCells(d), mx = cells.reduce((s, q) => s + q[0], 0) / cells.length, my = Math.min(...cells.map(q => q[1]));
          ctx.dust(mx * TS + 8, my * TS, 12); say(mx * TS + 8, my * TS - 22, d.load, '#8fd160');
          for (const p of ps) if (p && !p.dead) { const tx = Math.floor(p.x / TS), ty = Math.floor((p.y - 1) / TS); if (cells.some(q => q[0] === tx && q[1] === ty && q[2] === 'S')) { let y = ty; while (y > 0 && ctx.solidAt(tx, y - 1)) y--; p.y = y * TS; p.vy = 0; } } }
        continue; }
      if (c.state !== 'whole') continue;
      /* THE ROOST: her harpy, or another one sent */
      if (!c.e || !c.e.alive) { if (c.e && !c.e.alive) { c.e = null; c.respawnT = K.respawn; }
        if (d.roost && (c.respawnT -= dt) <= 0 && P && Math.abs(P.x - markX(d, TS)) < 26 * TS) { const e = ctx.spawn('harpy', d.roost[0], d.roost[1]); if (e) { e.rkRoost = d.id; c.e = e; S.n.respawns++; if (once('roost')) say(e.x, e.y - 14, 'roost', '#c9b27c'); } c.respawnT = K.respawn; } }
      /* THE BAIT: a hero on the mark, on his feet */
      const mx = markX(d, TS), my = markY(d, TS);
      const on = ps.some(p => p && !p.dead && p.ground && Math.abs(p.x - mx) < K.markW && Math.abs(p.y - my) < 6);
      const e = c.e;
      if (on && e && e.alive && !e.rkDive && !e.rkAim && !(e.stagger > 0) && e.mode !== 'downed') {
        S.n.baits++; startAim(e, mx, my, K.aim, c.id); if (once('scream')) say(mx, my - 40, 'scream', '#ff9a5c'); }
    }
    /* (claude/rookery2) THE RIDE ROOSTS: a ride harpy cut down, another is sent */
    for (const c of S.rides.values()) { const d = c.d; if (c.e && c.e.alive) continue; if (c.e && !c.e.alive) { c.e = null; c.respawnT = K.respawn; }
      if ((c.respawnT -= dt) <= 0 && P && Math.abs(P.x - mountX(d)) < 26 * TS) { const e = ctx.spawn('harpy', d.roost[0], d.roost[1]); if (e) { e.rkRide = d.id; e.hp = Math.max(e.hp, RIDE.hp); e.rdCd = 1; e.rdLift = true; c.e = e; S.n.respawns++; } c.respawnT = K.respawn; } }
    for (const p of ps) if (p && p.rkRide && (!p.rkRide.alive || p.dead)) dropRider(p, 'shook');
    /* THE SHRIEKER'S MARKS fade */
    for (const m of S.marks) m.t -= dt; S.marks = S.marks.filter(m => m.t > 0);
    /* THE NAMED AREAS: the banner when you come into one */
    if (P && lv.sections) { const k = lv.sections.findIndex(s => P.x >= s.x0 * TS && P.x < s.x1 * TS); if (k >= 0 && k !== S.sec) { S.banner = { name: lv.sections[k].name, t: 3.4 }; S.sec = k; } }
    if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
  };

  /* ---------- A CRAG HARPY'S FRAME (main.js updateHarpy calls it first; true = handled) ---------- */
  H.harpy = (e, dt) => {
    if (!S || !e.alive) return false;
    if (e.rkShriek) return shriekerStep(e, dt);
    if (e.t === 'galeharpy') { galeStep(e, dt, galeW()); if (e.stagger > 0) e.stagger = Math.max(0, e.stagger - dt); return true; }   /* (claude/rookery2) THE GALE HARPY (src/gale-harpy.js) */
    if (e.rkDive) { diveStep(e, dt); return true; }
    if (e.rkAim) { e.rkAim.t -= dt; e.face = Math.sign(e.rkAim.tx - e.x) || e.face; e.mode = 'aim';
      e.x += (Math.sin((e.anim || 0) * 9) * 6) * dt;   /* (she shivers on the air, wings back) */
      if (e.stagger > 0) { e.rkAim = null; e.mode = 'rise'; e.modeT = 1; return true; }
      if (e.rkAim.t <= 0) { if (ctx.time() - S.lastGust < GALE.noStack) e.rkAim.t = 0.05; else startDive(e); } return true; }   /* (claude/rookery2: never a dive in a gust's window) */
    if (e.rkRide && rideStep(e, dt)) return true;   /* (claude/rookery2) A RIDE HARPY: her mount, her lift, her path */
    /* her OWN dive (the plain crag-harpy AI) that comes down on a mark breaks it */
    if (e.mode === 'dive') { const c = crackAt(e.x, e.y + 10); if (c && e.y + 10 > markY(c.d, TS) - 10) { smash(c, e); e.mode = 'downed'; e.modeT = K.stun; e.stagger = K.stun; e.vy = -40; S.n.stunned++; return true; } }
    return false;
  };
  /* THE SHRIEKER: hangs high, screams, marks your spot, calls the dives; swoops low after */
  function shriekerStep(e, dt) {
    const P = ctx.players()[0], Q = K.shriek; e.rkCd = (e.rkCd || 0) - dt; e.anim = (e.anim || 0); if (P && ctx.seen && Math.abs(P.x - e.x) < 190) ctx.seen('shrieker');
    const floorUnder = () => { const tx = Math.floor(e.x / TS); for (let ty = Math.max(0, Math.floor(e.y / TS)); ty < (L().H || 60); ty++) if (ctx.solidAt(tx, ty) || ctx.tileAt(tx, ty) === ctx.T.ONEWAY) return ty * TS; return e.hy + 6 * TS; };
    if (e.mode === 'downed' || e.stagger > 0) { e.rkSm = 'hover'; return false; }   /* knocked down: the plain AI drops her and lifts her home */
    const m = e.rkSm || 'hover';
    if (m === 'tell') { e.mode = 'aim'; e.face = Math.sign(P.x - e.x) || e.face; e.rkT -= dt;
      if (e.rkT <= 0) { e.rkSm = 'swoop'; e.rkT = Q.swoop; S.n.screams++;
        const tx = P.x, ty = P.rkRide ? P.y - 4 : P.ground ? P.y : (() => { const t = Math.floor(P.x / TS); for (let y = Math.floor(P.y / TS); y < (L().H || 60); y++) if (ctx.solidAt(t, y) || ctx.tileAt(t, y) === ctx.T.ONEWAY) return y * TS; return P.y; })();
        S.marks.push({ x: tx, y: ty, t: Q.mark, T: Q.mark }); if (once('marked')) say(tx, ty - 40, 'marked', '#ff6b6b'); sfx('screech'); sfx('queenShriek');
        /* every harpy in earshot dives AT THE MARK, one after another */
        const callers = ctx.enemies().filter(q => q.alive && q !== e && q.t === 'harpy' && !q.rkShriek && !q.rkDive && !q.rkAim && !(q.stagger > 0) && q.mode !== 'downed' && q.mode !== 'ride' && q.mode !== 'lift' && Math.abs(q.x - tx) < Q.call * TS && Math.abs(q.y - ty) < 14 * TS)
          .sort((a, b) => Math.abs(a.x - tx) - Math.abs(b.x - tx)).slice(0, 3);
        callers.forEach((q, i) => { startAim(q, tx, ty, 0.45 + i * Q.gap, 'call'); S.n.called++; }); }
      return true; }
    if (m === 'swoop') { e.rkT -= dt; const fy = floorUnder(), want = fy - Q.low; e.y += (want - e.y) * Math.min(1, dt * 3); e.x += ((P ? P.x - e.face * 40 : e.hx) - e.x) * Math.min(1, dt * 0.8); e.mode = 'hover';
      if (e.rkT <= 0) { e.rkSm = 'hover'; e.rkCd = Q.cd; } return true; }
    /* hover: high over her home, drifting with you */
    e.mode = 'hover'; e.y += (e.hy + Math.sin((e.anim || 0) * 2.1) * 4 - e.y) * Math.min(1, dt * 2); e.x += (e.hx + Math.sin((e.anim || 0) * 1.1) * 14 - e.x) * Math.min(1, dt * 2);
    e.face = P ? Math.sign(P.x - e.x) || e.face : e.face;
    if (P && !P.dead && e.rkCd <= 0 && Math.abs(P.x - e.x) < Q.reach * TS && P.y > e.y && P.y - e.y < 12 * TS) { e.rkSm = 'tell'; e.rkT = Q.tell; ctx.number(e.x, e.y - 16, '!!', '#ff6b6b'); sfx('screech'); }
    return true;
  }

  /* ---------- (claude/rookery2) CATCH A RIDE ---------- */
  const mountX = d => d.mount[0] * TS + 8, mountY = d => (d.mount[1] + 1) * TS;
  function dropRider(p, why) { const e = p.rkRide; p.rkRide = null; if (!e) return; const c = S.rides.get(e.rkRide); if (c) c.rider = null;
    if (why === 'jump') { p.vy = -RIDE.hop; S.n.letGo++; if (once('letGo')) say(p.x, p.y - 30, 'letGo', '#c8d8e8'); }
    else { p.vy = 20; if (why === 'knocked') { S.n.knocked++; say(p.x, p.y - 30, 'knocked', '#ff6b6b'); } else { S.n.shook++; if (once('shook')) say(p.x, p.y - 30, 'shook', '#c8d8e8'); } }
    p.ground = false; p.vx = 0; e.mode = 'rise'; e.modeT = 1.2; e.rdCd = RIDE.cd + 1; e.rdLift = true; e.rdOff = null; }
  function rideStep(e, dt) {
    const c = S.rides.get(e.rkRide); if (!c) return false; const d = c.d, ps = ctx.players().filter(p => p && !p.dead);
    if (e.mode === 'ride') { const p = c.rider;
      if (!p || p.rkRide !== e || p.dead) { if (p && p.rkRide === e) p.rkRide = null; c.rider = null; e.mode = 'rise'; e.modeT = 1.2; e.rdCd = RIDE.cd; return true; }
      e.rdT += dt; const k = Math.min(1, e.rdT / e.rdTT), [x, y] = alongPts(e.rdPts, k), o = e.rdOff || (e.rdOff = [0, 0]);
      o[0] -= o[0] * Math.min(1, dt * RIDE.spring); o[1] -= o[1] * Math.min(1, dt * RIDE.spring);
      e.face = Math.sign(x - e.x) || e.face; e.x = x + o[0]; e.y = y + o[1];
      /* A HARPY'S FLIGHT BREAKS WHAT IT HITS: a cracked arm on her path (a hung nest) goes as she passes */
      for (const q of S.cs.values()) if (q.state === 'whole' && q.d.load === 'nest' && q.d.x !== undefined && Math.hypot(e.x - (q.d.x * TS + 8), e.y + 8 - (q.d.top * TS + 8)) < 22) { smash(q, e); if (once('through')) say(e.x, e.y - 30, 'through', '#8fd160'); }
      if (k >= 1) dropRider(p, 'shook');
      return true; }
    if (e.mode === 'lift') { e.modeT -= dt; e.y -= RIDE.liftV * dt;
      if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = 1.2; e.rdCd = RIDE.cd; e.rdLift = true; } return true; }
    if (e.mode === 'rise' && !e.rdLift) { e.mode = 'lift'; e.modeT = RIDE.lift; e.rdLift = true; e.stagger = 0; if (once('grab')) say(e.x, e.y - 26, 'grab', '#ffd36b'); return true; }   /* knocked down, she climbs: GRAB HER */
    if (e.mode === 'downed' || e.mode === 'rise' || e.mode === 'dive' || e.mode === 'aim') return false;   /* (the plain AI drops her and lifts her home; a bait dive is handled above) */
    /* hover at her roost: she dives only at a hero on her MOUNT (on his feet) */
    e.rdCd = (e.rdCd || 0) - dt; e.mode = 'hover'; e.y += (e.hy + Math.sin((e.anim || 0) * 2.1) * 4 - e.y) * Math.min(1, dt * 3); e.x += (e.hx + Math.sin((e.anim || 0) * 1.1) * 6 - e.x) * Math.min(1, dt * 3);
    const P = ps.find(p => p.ground && Math.abs(p.x - mountX(d)) < RIDE.zone * TS && Math.abs(p.y - mountY(d)) < 10);
    if (P) e.face = Math.sign(P.x - e.x) || e.face;
    if (P && e.rdCd <= 0 && !(e.stagger > 0) && ctx.time() - S.lastGust > GALE.noStack) { startAim(e, P.x, P.y, RIDE.aim, 'ride'); e.rdLift = false; if (once('ride')) say(mountX(d), mountY(d) - 44, 'ride', '#ffd36b'); }
    return true;
  }
  /* GRAB HER TALONS (main.js updatePlayer, for the hero it is moving: UP held or GRAB pressed) - true = he has her */
  H.tryGrab = p => { if (!S || !p || p.dead || p.rkRide) return false;
    for (const c of S.rides.values()) { const e = c.e; if (!e || !e.alive || e.mode !== 'lift' || c.rider) continue;
      if (Math.abs(p.x - e.x) < RIDE.reach && p.y - e.y > -12 && p.y - e.y < 52) { c.rider = p; p.rkRide = e; p.rkRideHp = p.hp; e.mode = 'ride'; e.rdT = 0; e.rdOff = [0, 0];
        e.rdPts = ridePts(c.d, e.x, e.y, TS); const tot = alongPts(e.rdPts, 1)[2]; e.rdTT = Math.max(RIDE.minT, Math.min(RIDE.maxT, tot / RIDE.v));
        S.n.rides++; S.n.grabs++; c.n++; sfx('screech'); if (once('riding')) say(p.x, p.y - 40, 'riding', '#ffd36b'); return true; } }
    return false; };
  /* THE RIDE (main.js updatePlayer hands a carried hero here instead of moving him): he hangs from her talons; JUMP lets go. false = not riding (any more) */
  H.ride = (p, jump) => { const e = p.rkRide; if (!S || !e) { p.rkRide = null; return false; }
    if (!e.alive || e.mode !== 'ride') { dropRider(p, 'shook'); return false; }
    if (jump) { dropRider(p, 'jump'); return false; }
    p.x = e.x;   /* (only a HARPY'S DIVE that finds him knocks him off her talons - diveStep; a crow's peck just hurts) */ p.y = e.y + RIDE.hang; p.vx = 0; p.vy = 0; p.ground = false; p.onMover = null; return true; };
  /* THE GALE HARPY's world (src/gale-harpy.js) */
  const galeW = () => ({ time: () => ctx.time(), lastDive: () => S.lastDive, gusted: t => { S.lastGust = t; S.n.gusts++; },
    heroes: () => ctx.players().filter(p => p && !p.dead).map(p => ({ x: p.x, y: p.y, ground: !!p.ground, alive: true, blocking: !!(p.block || p.blocking), p,
      push: (vx, vy) => { if (p.rkRide) { const e = p.rkRide; if (e.rdOff) { e.rdOff[0] += vx * 0.12; e.rdOff[1] += vy * 0.05; } return; } p.vx = vx; if (vy) { p.vy = Math.min(p.vy || 0, vy); p.ground = false; } } })),
    riders: () => [...S.rides.values()].filter(c => c.rider && c.e && c.e.rdOff).map(c => ({ x: c.e.x, y: c.e.y + RIDE.hang, shove: (dx, dy) => { c.e.rdOff[0] += dx; c.e.rdOff[1] += dy; } })),
    say: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => k === 'gust' ? sfx('whoosh', 'throwWhoosh', 'tell') : k === 'broken' ? sfx('clank', 'thud') : sfx('tell', 'screech'),
    mark: (e, m) => ctx.number(e.x, e.y - 14, m, '#ffd36b'), seen: () => ctx.seen && ctx.seen('galeharpy'), firstTell: e => { if (once('gust')) say(e.x, e.y - 30, 'gust', '#ffd36b'); } });
  H.galeW = () => S ? galeW() : null;

  /* ---------- THE GUIDE's props (src/stuck-spots.js reads `on`), the tools, the pilot bot ---------- */
  H.props = () => { if (!S) return []; const out = [];
    for (const c of S.cs.values()) { const d = c.d; out.push({ t: KIND[d.load], id: c.id, x: markX(d, TS), y: markY(d, TS), on: c.state !== 'whole' }); }
    return out; };
  H.rideOf = id => { const c = S && S.rides.get(id); return c ? { d: c.d, mode: c.e && c.e.alive ? c.e.mode : 'gone', x: c.e ? c.e.x : 0, y: c.e ? c.e.y : 0, aim: c.e && c.e.rkAim ? { x: c.e.rkAim.tx, t: c.e.rkAim.t } : null, rider: c.rider || null } : null; };
  H.hoist = id => { const c = S && S.cs.get(id); return c ? { state: c.state === 'whole' ? 'hang' : 'cut', d: c.d } : null; };
  H.breakCrack = id => { const c = S && S.cs.get(id); return c ? smash(c, null) : false; };
  H.read = () => S ? { cracks: [...S.cs.values()].map(c => ({ id: c.id, load: c.d.load, state: c.state, harpy: !!(c.e && c.e.alive) })), rides: [...S.rides.values()].map(c => ({ id: c.id, n: c.n, mode: c.e && c.e.alive ? c.e.mode : 'gone', x: c.e ? c.e.x : 0, y: c.e ? c.e.y : 0, rider: !!c.rider })), marks: S.marks.length, banner: S.banner ? S.banner.name : null, sec: S.sec, n: JSON.parse(JSON.stringify(S.n)) } : null;

  /* ---------- DRAWING (GREYBOX: readable shapes; the sonnet art lane redraws every one - see the lane report's ART NOTES) ---------- */
  const R = Math.round;
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  const C = { rock: '#8a8478', rockD: '#5e594f', rockL: '#b4ae9f', lime: '#ece8dc', crack: '#2a2620', bone: '#e6dcc0', boneD: '#a89a78', twig: '#6a5440', ghost: 'rgba(236,232,220,0.38)', red: '#ff5a4a', gold: '#ffd36b' };
  const crackLines = (g, x, y, w, seed) => { g.strokeStyle = C.crack; g.lineWidth = 1; g.beginPath(); let px = x + w * 0.2, py = y; g.moveTo(px, py);
    for (let i = 0; i < 4; i++) { px += w * 0.15 + ((seed * (i + 3)) % 5); py += 3 + ((seed + i) % 3); g.lineTo(R(px), R(py)); } g.stroke(); g.beginPath(); g.moveTo(R(x + w * 0.6), R(y)); g.lineTo(R(x + w * 0.5), R(y + 6)); g.lineTo(R(x + w * 0.7), R(y + 11)); g.stroke(); };
  const ghostCells = (g, cells, cx, cy, t) => { g.fillStyle = C.ghost; for (const [x, y, k] of cells) { const sx = R(x * TS - cx), sy = R(y * TS - cy);
      if (k === 'A') { g.strokeStyle = 'rgba(255,233,160,0.5)'; g.setLineDash && g.setLineDash([2, 3]); g.strokeRect(sx + 0.5, sy + 0.5, 15, 15); g.setLineDash && g.setLineDash([]); }
      else if (k === 'O' || !cells.some(q => q[0] === x && q[1] === y - 1)) g.fillRect(sx + 1, sy, 14, k === 'O' ? 3 : 2); } };
  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const lv = L();
    /* THE EGG NESTS on the ledges (twigs, bones, cream eggs) and THE ROOSTS: a bone nest on a knob of crag where a harpy lives (src/redraw/rookery_world.js) */
    for (const [nx0, ny0] of (lv.rkNests || [])) { const x = R(nx0 * TS + 8 - cx), y = R((ny0 + 1) * TS - cy); if (x < -30 || x > VW + 30) continue; RKW.drawEggs(g, x, y, RKW.zoneIdx(nx0), nx0 & 3); }
    /* (claude/rookery2) THE ANCHORS (L.rkAnchors, src/rookery-anchors.js) - GREYBOX shapes the art lane redraws: a ROCK SPIRE from the footing under a roost / perch / arm
       with the nest LASHED to its tip, a stone BRACKET (corbel) from the crag face, CHAINS from the rock over it. The ride roosts and gale perches get their nest drawn here */
    for (const q of (lv.rkAnchors || [])) { const a = q.a; if (!a) continue; const x = R(q.x * TS + 8 - cx), y = R((q.y + 1) * TS - cy); if (x < -60 || x > VW + 60) continue;   /* (claude/rookery2art) spires, corbels and chains: src/redraw/rookery_anchor_art.js */
      RKA.drawAnchor(g, q, cx, cy, TS, time, RKW.zoneIdx(q.x));
      if (q.what === 'roost' && (lv.rkRides || []).some(d => d.id === q.id) || q.what === 'perch') RKW.drawRoost(g, x, y, RKW.zoneIdx(q.x)); }
    for (const c of S.cs.values()) { const d = c.d; if (!d.roost) continue; const x = R(d.roost[0] * TS + 8 - cx), y = R((d.roost[1] + 1) * TS - cy); if (x < -40 || x > VW + 40) continue; RKW.drawRoost(g, x, y, RKW.zoneIdx(d.roost[0])); }
    for (const c of S.cs.values()) { const d = c.d, mx = markX(d, TS), my = markY(d, TS), sx = R(mx - cx), sy = R(my - cy);
      if (sx < -160 || sx > VW + 160) continue;
      const cells = crackCells(d, (x, y) => ctx.solidAt(x, y)), whole = c.state === 'whole';
      RKW.drawCrack(g, c, { cx, cy, TS, time, cells, solidAt: (x, y) => ctx.solidAt(x, y) });
      /* THE MARK: a lime ring painted on the stone, glinting - and what it will do is DRAWN FIRST (the trebuchet test: a dashed ghost of the hole, the bridge, the platform or the steps) */
      if (whole) { RKW.drawMark(g, sx, sy, time); RKW.drawGhost(g, cells, cx, cy, TS, time); }
    }
    /* THE DIVE LINES: a red dotted line from an aiming harpy to her spot, a ring on it */
    for (const e of ctx.enemies()) if (e.alive && e.rkAim) { const a = e.rkAim, x0 = e.x - cx, y0 = e.y - cy, x1 = a.tx - cx, y1 = a.ty - cy, n = Math.max(2, Math.floor(Math.hypot(x1 - x0, y1 - y0) / 7));
      g.fillStyle = Math.floor(time * 12) % 2 ? C.red : '#ffb0a0'; for (let i = 1; i < n; i++) g.fillRect(R(x0 + (x1 - x0) * i / n), R(y0 + (y1 - y0) * i / n), 2, 2);
      g.strokeStyle = C.red; g.beginPath(); g.ellipse ? g.ellipse(R(x1), R(y1), 12, 3, 0, 0, Math.PI * 2) : g.rect(R(x1) - 12, R(y1) - 3, 24, 6); g.stroke(); }
    /* THE SHRIEKER'S MARK: a red ring and a crossed claw-cut, the scream's rings widening off it */
    for (const m of S.marks) { const x = R(m.x - cx), y = R(m.y - cy), k = m.t / m.T; g.globalAlpha = 0.5 + 0.5 * k; g.strokeStyle = C.red; g.lineWidth = 2; g.beginPath(); g.ellipse ? g.ellipse(x, y - 1, 14, 4, 0, 0, Math.PI * 2) : g.rect(x - 14, y - 4, 28, 6); g.stroke();
      g.lineWidth = 1; rect(g, x - 5, y - 6, 10, 2, C.red); rect(g, x - 1, y - 10, 2, 10, C.red); g.globalAlpha = 0.5 * k; g.beginPath(); g.ellipse ? g.ellipse(x, y - 1, 14 + (1 - k) * 18, 4 + (1 - k) * 5, 0, 0, Math.PI * 2) : g.rect(x - 20, y - 5, 40, 8); g.stroke(); g.globalAlpha = 1; }
    /* (claude/rookery2) THE RIDES: her path drawn FIRST (a dotted feather trail from the mount to where she shakes you off), the mount's talon marks, GRAB over her while
       she lifts, her talons on the rider. GREYBOX: the sonnet art lane draws the trail, the mount, the lift and the carry poses */
    for (const c of S.rides.values()) { const d = c.d, e = c.e, mx = mountX(d), my = mountY(d); if (mx - cx < -200 || mx - cx > VW + 200) continue;
      if (!c.rider) { const pts = ridePts(d, mx, my - RIDE.hang - 10, TS);   /* (claude/rookery2art) HER PATH: a trail of drifting FEATHERS (quill and two barbs, twinkling), ending at a landing ring with a chevron */
        for (let k = 0.04; k < 1; k += 0.045) { const [x, y] = alongPts(pts, k), [x2, y2] = alongPts(pts, Math.min(1, k + 0.012)), ph = Math.floor(time * 4 + k * 20) % 4; if (!ph) continue; const dl = Math.hypot(x2 - x, y2 - y) || 1, ux = (x2 - x) / dl, uy = (y2 - y) / dl, bx = R(x - cx), by = R(y + RIDE.hang - cy);
          for (let i = 0; i < 4; i++) { g.fillStyle = i < 3 ? '#f4f0e8' : '#c8c4d4'; g.fillRect(R(bx + ux * i), R(by + uy * i), 1, 1); } g.fillStyle = ph === 2 ? '#c8c4d4' : '#e6e4ec'; g.fillRect(R(bx + ux * 1 - uy * 1), R(by + uy * 1 + ux * 1), 1, 1); g.fillRect(R(bx + ux * 2 + uy * 1), R(by + uy * 2 - ux * 1), 1, 1); }
        const [lx, ly] = pts[pts.length - 1], rx = R(lx - cx), ry = R(ly + RIDE.hang + 6 - cy), pu = 0.5 + 0.35 * Math.sin(time * 5); g.strokeStyle = 'rgba(255,233,160,' + (0.45 + 0.3 * pu).toFixed(2) + ')'; g.strokeRect(rx - 6.5, ry - 2.5, 13, 3);
        g.fillStyle = 'rgba(255,233,160,' + (0.5 + 0.3 * pu).toFixed(2) + ')'; g.fillRect(rx - 2, ry - 8, 5, 1); g.fillRect(rx - 1, ry - 7, 3, 1); g.fillRect(rx, ry - 6, 1, 1); }
      { const gouge = (x, y) => { g.fillStyle = '#32283a'; g.fillRect(x, y, 1, 3); g.fillRect(x + 2, y, 1, 3); g.fillRect(x + 4, y, 1, 3); g.fillStyle = '#ece8e0'; g.fillRect(x, y - 1, 1, 1); g.fillRect(x + 2, y - 1, 1, 1); g.fillRect(x + 4, y - 1, 1, 1); };
        gouge(R(mx - 11 - cx), R(my - 3 - cy)); gouge(R(mx + 6 - cx), R(my - 3 - cy)); g.fillStyle = '#e6e4ec'; g.fillRect(R(mx - 2 - cx), R(my - 2 - cy), 3, 1); g.fillRect(R(mx + 2 - cx), R(my - 1 - cy), 2, 1); }   /* her mount: claw gouges in the stone, a feather and a splash of guano */
      if (e && e.alive && e.mode === 'lift') { const x = R(e.x - cx), y = R(e.y - cy), a = 0.55 + 0.4 * Math.sin(time * 12); g.globalAlpha = a; g.fillStyle = '#ffd36b'; for (const [sx2, sy2] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const bx = x + sx2 * 14, by = y + 2 + sy2 * 14; g.fillRect(sx2 > 0 ? bx - 4 : bx, sy2 > 0 ? by - 1 : by, 5, 2); g.fillRect(sx2 > 0 ? bx - 1 : bx, sy2 > 0 ? by - 4 : by, 2, 5); } g.globalAlpha = 1;   /* (claude/rookery2art) four gold corner brackets round her, not a box */
        if (ctx.text) ctx.text(RK_SAY.grab, x, y - 22, Math.floor(time * 8) % 2 ? '#ffd36b' : '#fff6e0', 'center', 6); }
      if (e && e.alive && e.mode === 'ride' && c.rider) drawHang(g, R(e.x - cx), R(e.y - cy) + 2, R(c.rider.y - cy), time, { lean: (e.rdOff ? Math.max(-6, Math.min(6, e.rdOff[0] * 0.25)) : 0) }); }
    /* THE AREA PLATE */
    if (S.banner) { const a = Math.max(0, Math.min(1, S.banner.t / 0.6, (3.4 - S.banner.t) / 0.4)); RKW.drawPlate(g, S.banner.name, VW, a, ctx.text); }
  };
  /* a harpy's overlay: the shrieker's crest and her scream rings */
  H.harpyOver = (g, e, cx, cy, time) => { if (!S || !e.alive) return; const x = R(e.x - cx), y = R(e.y - cy);
    if (e.t === 'galeharpy') { drawGust(g, e, cx, cy, time); return; }
    if (e.rkRide && e.mode === 'lift') drawLegs(g, x, y + 3, time);   /* (claude/rookery2art) her legs hang open, claws spread: GRAB them */   /* (claude/rookery2) her cone: told dashed in the tell, streaks in the beat */
    if (e.rkShriek) { rect(g, x - 3, y - 12, 2, 5, '#c0302a'); rect(g, x, y - 13, 2, 6, '#e04a3a'); rect(g, x + 3, y - 12, 2, 5, '#c0302a');
      if (e.rkSm === 'tell') { const k = (time * 3) % 1; g.strokeStyle = 'rgba(255,90,74,' + (1 - k).toFixed(2) + ')'; g.beginPath(); g.arc(x + e.face * 6, y - 4, 6 + k * 22, 0, Math.PI * 2); g.stroke(); } } };
  /* THE SKY AND THE LANDMARKS (parallax): the cold pearl sky and its sun, THE ROC'S PEAK ahead (growing as you climb), THE MONASTERY far below and behind (sinking) - drawn by src/redraw/rookery_backdrop.js (claude/rookeryart; the greybox's flat silhouettes are gone) */
  H.drawSky = (g, cx, cy, VW, VH, time, dY) => { /* the level is dusk the whole way (the game paints its dusk wash over whatever is drawn here), so the sky and the two landmarks are drawn by RKB.drawBackdrop from main.js, after the wash; this stays for the tools */ };
  return H;
}
