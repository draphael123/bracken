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
/* THE SHRIEKER's skin (greybox): the crag harpy's frames, darkened to a blood-red (her crest is drawn over her: harpyOver) - main.js SPR.shrieker */
export function bakeShriekerSet(Hs) {
  const R = Hs.R.map(c => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(130,28,36,0.5)'; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over'; return o; });
  const white = R.map(c => whiten(c));
  return { R, L: R.map(flipX), white: { R: white, L: white.map(flipX) }, ax: Hs.ax, ay: Hs.ay, w: Hs.w, h: Hs.h };
}
export const K = { aim: 0.75, diveV: 300, diveDmg: 11, stun: 2.2, respawn: 4.5, markW: 18, fold: 0.5,
  shriek: { reach: 15, tell: 0.9, mark: 1.3, cd: 5.6, swoop: 1.7, call: 18, gap: 0.32, low: 40, hi: 78 } };
export const KIND = { drop: 'crackfloor', span: 'crackpillar', nest: 'cracknest', steps: 'crackslab' };   /* the ent kind at a mark (src/rookery.js) - the guide's done names it */
export const RK_SAY = {
  scream: 'SHE SCREAMS: OFF THE MARK', breaks: 'HER DIVE BREAKS THE ROCK', drop: 'THE FLOOR GIVES WAY', span: 'THE PILLAR FALLS ACROSS', nest: 'THE NEST COMES DOWN',
  steps: 'THE SLAB SLIDES DOWN', stunned: 'STUNNED IN THE RUBBLE', roost: 'THE ROOST SENDS ANOTHER', marked: 'THE SHRIEKER MARKS YOU',
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
    S = { L: lv, cs, said: keep ? keep.said : new Set(), sec: -1, banner: null, marks: [], dives: new Set(),
      n: keep ? keep.n : { baits: 0, breaks: 0, byKind: { drop: 0, span: 0, nest: 0, steps: 0 }, stunned: 0, screams: 0, called: 0, respawns: 0, diveHits: 0, diveBlocks: 0 } };
    for (const e of ctx.enemies()) if (e.alive && (e.t === 'harpy' || e.t === 'shrieker')) { e.rkDive = null; e.rkAim = null;
      if (e.rkRoost) { const c = S.cs.get(e.rkRoost); if (c && !c.e) c.e = e; }
      if (e.rkShriek) { e.rkCd = 1.5; e.rkSm = 'hover'; } }
  };

  /* ---------- A DIVE AT A SPOT (a bait, a shrieker's call): straight at it; what it meets breaks ---------- */
  function startAim(e, tx, ty, t, why) {
    e.rkAim = { tx, ty, t, why }; e.mode = 'aim'; e.modeT = t + 1; e.face = Math.sign(tx - e.x) || e.face;
    sfx('screech'); ctx.number(e.x, e.y - 14, '!!', '#ff6b6b');
  }
  function startDive(e) {
    const a = e.rkAim; e.rkAim = null; const d = Math.hypot(a.tx - e.x, a.ty - 6 - e.y) || 1;
    e.rkDive = { fx: e.x, fy: e.y, tx: a.tx, ty: a.ty - 6, t: 0, T: Math.max(0.18, d / K.diveV), hit: false, why: a.why }; e.mode = 'dive'; S.dives.add(e);
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
      if (res === 'hit') S.n.diveHits++; } }
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
    if (e.rkDive) { diveStep(e, dt); return true; }
    if (e.rkAim) { e.rkAim.t -= dt; e.face = Math.sign(e.rkAim.tx - e.x) || e.face; e.mode = 'aim';
      e.x += (Math.sin((e.anim || 0) * 9) * 6) * dt;   /* (she shivers on the air, wings back) */
      if (e.stagger > 0) { e.rkAim = null; e.mode = 'rise'; e.modeT = 1; return true; }
      if (e.rkAim.t <= 0) startDive(e); return true; }
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
        const tx = P.x, ty = P.ground ? P.y : (() => { const t = Math.floor(P.x / TS); for (let y = Math.floor(P.y / TS); y < (L().H || 60); y++) if (ctx.solidAt(t, y) || ctx.tileAt(t, y) === ctx.T.ONEWAY) return y * TS; return P.y; })();
        S.marks.push({ x: tx, y: ty, t: Q.mark, T: Q.mark }); if (once('marked')) say(tx, ty - 40, 'marked', '#ff6b6b'); sfx('screech'); sfx('queenShriek');
        /* every harpy in earshot dives AT THE MARK, one after another */
        const callers = ctx.enemies().filter(q => q.alive && q !== e && q.t === 'harpy' && !q.rkShriek && !q.rkDive && !q.rkAim && !(q.stagger > 0) && q.mode !== 'downed' && Math.abs(q.x - tx) < Q.call * TS && Math.abs(q.y - ty) < 14 * TS)
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

  /* ---------- THE GUIDE's props (src/stuck-spots.js reads `on`), the tools, the pilot bot ---------- */
  H.props = () => { if (!S) return []; const out = [];
    for (const c of S.cs.values()) { const d = c.d; out.push({ t: KIND[d.load], id: c.id, x: markX(d, TS), y: markY(d, TS), on: c.state !== 'whole' }); }
    return out; };
  H.hoist = id => { const c = S && S.cs.get(id); return c ? { state: c.state === 'whole' ? 'hang' : 'cut', d: c.d } : null; };
  H.breakCrack = id => { const c = S && S.cs.get(id); return c ? smash(c, null) : false; };
  H.read = () => S ? { cracks: [...S.cs.values()].map(c => ({ id: c.id, load: c.d.load, state: c.state, harpy: !!(c.e && c.e.alive) })), marks: S.marks.length, banner: S.banner ? S.banner.name : null, sec: S.sec, n: JSON.parse(JSON.stringify(S.n)) } : null;

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
    /* THE EGG NESTS on the ledges (twigs, bones, a pale egg or two) */
    for (const [nx0, ny0] of (lv.rkNests || [])) { const x = R(nx0 * TS + 8 - cx), y = R((ny0 + 1) * TS - cy); if (x < -30 || x > VW + 30) continue;
      rect(g, x - 9, y - 4, 18, 4, C.twig); for (let k = 0; k < 4; k++) rect(g, x - 9 + k * 5, y - 6 + (k % 2), 4, 2, C.bone); rect(g, x - 4, y - 9, 4, 5, '#efe6cf'); rect(g, x + 1, y - 8, 4, 4, '#e2d8bc'); }
    /* THE ROOSTS: a bone nest on a knob of crag where a harpy lives */
    for (const c of S.cs.values()) { const d = c.d; if (!d.roost) continue; const x = R(d.roost[0] * TS + 8 - cx), y = R((d.roost[1] + 1) * TS - cy); if (x < -40 || x > VW + 40) continue;
      rect(g, x - 9, y, 18, 4, C.rockD); rect(g, x - 11, y - 4, 22, 5, C.twig); for (let k = 0; k < 5; k++) rect(g, x - 10 + k * 5, y - 6 - (k % 2), 4, 2, C.bone); }
    for (const c of S.cs.values()) { const d = c.d, mx = markX(d, TS), my = markY(d, TS), sx = R(mx - cx), sy = R(my - cy);
      if (sx < -160 || sx > VW + 160) continue;
      const cells = crackCells(d, (x, y) => ctx.solidAt(x, y)), whole = c.state === 'whole';
      /* THE MARK on the rock: split, limed white, a ring painted on it - and it glints */
      if (whole) { rect(g, sx - K.markW, sy, K.markW * 2, 3, C.lime); crackLines(g, sx - K.markW, sy, K.markW * 2, d.cleat[0]);
        g.strokeStyle = Math.floor(time * 3) % 2 ? C.gold : 'rgba(255,211,107,0.6)'; g.beginPath(); g.ellipse ? g.ellipse(sx, sy - 1, 11, 3, 0, 0, Math.PI * 2) : g.rect(sx - 11, sy - 3, 22, 4); g.stroke();
        ghostCells(g, cells, cx, cy, time); }
      const top = d.top !== undefined ? d.top : d.cleat[1] - 4;
      if (d.load === 'span') { const bx = R(d.x * TS + 8 - cx), foot = R((d.cleat[1] + 1) * TS - cy), ty = R(top * TS - cy), dir = Math.sign(d.span[0] - d.x) || 1;
        if (whole || c.state === 'break') { g.save(); g.translate(bx, foot); g.rotate(dir * (c.state === 'break' ? c.fold * c.fold : 0) * Math.PI / 2);
          rect(g, -7, ty - foot, 14, foot - ty, C.rock); rect(g, -7, ty - foot, 3, foot - ty, C.rockL); rect(g, -8, ty - foot - 3, 16, 4, C.lime); crackLines(g, -7, -14, 14, 3); g.restore(); }
        else { const s0 = R(d.span[0] * TS - cx), s1 = R((d.span[1] + 1) * TS - cx), yy = R(d.span[2] * TS - cy); rect(g, s0, yy, s1 - s0, 8, C.rock); rect(g, s0, yy, s1 - s0, 2, C.lime); for (let x = s0 + 6; x < s1; x += 13) rect(g, x, yy + 3, 1, 4, C.crack); } }
      else if (d.load === 'nest') { const ax = R(d.x * TS + 8 - cx), ay = R(top * TS - cy), s0 = R(d.span[0] * TS - cx), s1 = R((d.span[1] + 1) * TS - cx), ny = R(d.span[2] * TS - cy);
        if (whole) { rect(g, Math.min(sx, ax) - 2, ay - 3, Math.abs(ax - sx) + 4, 5, C.rock); crackLines(g, Math.min(sx, ax), ay - 3, Math.abs(ax - sx), 7);   /* the cracked arm */
          for (let k = 0; k < 3; k++) rect(g, ax - 1 + k * 0, ay + 2 + k * 5, 2, 4, C.twig);   /* the lashing */
          const nx = (s0 + s1) / 2, nw = s1 - s0; rect(g, nx - nw / 2, ay + 16, nw, 8, C.twig); for (let k = 0; k < nw; k += 5) rect(g, nx - nw / 2 + k, ay + 14 + (k % 3), 4, 2, C.bone); rect(g, nx - 4, ay + 10, 8, 6, '#efe6cf'); }
        else if (c.state === 'break') { const k = c.fold; rect(g, s0, ay + 16 + (ny - ay - 16) * k * k, s1 - s0, 8, C.twig); }
        else { rect(g, s0, ny, s1 - s0, 6, C.twig); for (let k = 0; k < s1 - s0; k += 5) rect(g, s0 + k, ny - 2 + (k % 3), 4, 2, C.bone); } }
      else if (d.load === 'steps') { const xs = cells.map(q => q[0]), x0 = Math.min(...xs), x1 = Math.max(...xs) + 1, ty = R(top * TS - cy);
        if (whole) { rect(g, R(x0 * TS - cx), ty, (x1 - x0) * TS, 10, C.rock); rect(g, R(x0 * TS - cx), ty, (x1 - x0) * TS, 2, C.lime); crackLines(g, R(x0 * TS - cx), ty, (x1 - x0) * TS, 5); }
        else if (c.state === 'break') rect(g, R(x0 * TS - cx), ty + (sy - ty) * c.fold * c.fold * 0.7, (x1 - x0) * TS, 10, C.rock);
        else for (const [x, y, k] of cells) { rect(g, R(x * TS - cx), R(y * TS - cy), 16, k === 'O' ? 4 : 16, C.rock); rect(g, R(x * TS - cx), R(y * TS - cy), 16, 2, C.lime); } }
      else if (d.load === 'drop' && !whole) { rect(g, sx - 12, sy + 2, 4, 3, C.rockD); rect(g, sx + 8, sy + 3, 5, 2, C.rockD); }
    }
    /* THE DIVE LINES: a red dotted line from an aiming harpy to her spot, a ring on it */
    for (const e of ctx.enemies()) if (e.alive && e.rkAim) { const a = e.rkAim, x0 = e.x - cx, y0 = e.y - cy, x1 = a.tx - cx, y1 = a.ty - cy, n = Math.max(2, Math.floor(Math.hypot(x1 - x0, y1 - y0) / 7));
      g.fillStyle = Math.floor(time * 12) % 2 ? C.red : '#ffb0a0'; for (let i = 1; i < n; i++) g.fillRect(R(x0 + (x1 - x0) * i / n), R(y0 + (y1 - y0) * i / n), 2, 2);
      g.strokeStyle = C.red; g.beginPath(); g.ellipse ? g.ellipse(R(x1), R(y1), 12, 3, 0, 0, Math.PI * 2) : g.rect(R(x1) - 12, R(y1) - 3, 24, 6); g.stroke(); }
    /* THE SHRIEKER'S MARK */
    for (const m of S.marks) { const x = R(m.x - cx), y = R(m.y - cy), k = m.t / m.T; g.globalAlpha = 0.5 + 0.5 * k; g.strokeStyle = C.red; g.lineWidth = 2; g.beginPath(); g.ellipse ? g.ellipse(x, y - 1, 14, 4, 0, 0, Math.PI * 2) : g.rect(x - 14, y - 4, 28, 6); g.stroke();
      g.lineWidth = 1; rect(g, x - 5, y - 6, 10, 2, C.red); rect(g, x - 1, y - 10, 2, 10, C.red); g.globalAlpha = 1; }
    /* THE AREA BANNER */
    if (S.banner && ctx.text) { const a = Math.min(1, S.banner.t / 0.6, (3.4 - S.banner.t) / 0.4); g.globalAlpha = Math.max(0, a); ctx.text(S.banner.name, R(VW / 2), 34, '#ece8dc', 'center', 8); g.globalAlpha = 1; }
  };
  /* a harpy's overlay: the shrieker's crest and her scream rings */
  H.harpyOver = (g, e, cx, cy, time) => { if (!S || !e.alive) return; const x = R(e.x - cx), y = R(e.y - cy);
    if (e.rkShriek) { rect(g, x - 3, y - 12, 2, 5, '#c0302a'); rect(g, x, y - 13, 2, 6, '#e04a3a'); rect(g, x + 3, y - 12, 2, 5, '#c0302a');
      if (e.rkSm === 'tell') { const k = (time * 3) % 1; g.strokeStyle = 'rgba(255,90,74,' + (1 - k).toFixed(2) + ')'; g.beginPath(); g.arc(x + e.face * 6, y - 4, 6 + k * 22, 0, Math.PI * 2); g.stroke(); } } };
  /* THE LANDMARK (parallax): THE MONASTERY ROOF far below and behind you, THE ROC'S PEAK ahead, growing as you climb */
  H.drawSky = (g, cx, cy, VW, VH) => { if (!S) return; const lv = L(), W = (lv.W || 420) * TS, k = Math.max(0, Math.min(1, cx / Math.max(1, W - VW)));
    const mx = R(VW * 0.18 - cx * 0.05), my = R(VH * 0.78 + k * 30);   /* the monastery: its long roof and bell tower, sinking as you climb */
    g.fillStyle = 'rgba(70,64,82,0.55)'; g.fillRect(mx - 50, my - 14, 100, 14); g.beginPath(); g.moveTo(mx - 56, my - 14); g.lineTo(mx, my - 34); g.lineTo(mx + 56, my - 14); g.fill();
    g.fillRect(mx + 30, my - 58, 14, 44); g.beginPath(); g.moveTo(mx + 26, my - 58); g.lineTo(mx + 37, my - 74); g.lineTo(mx + 48, my - 58); g.fill();
    g.fillStyle = 'rgba(255,210,120,0.6)'; g.fillRect(mx + 35, my - 50, 4, 5);
    const px = R(VW * 0.86 - cx * 0.08 + W * 0.08 * 0), py = R(VH * 0.62 - k * 40);   /* the Roc's peak: a crag spire with her eyrie's masts on it */
    g.fillStyle = 'rgba(96,104,124,0.6)'; g.beginPath(); g.moveTo(px - 70, VH); g.lineTo(px - 14, py); g.lineTo(px + 6, py - 18 - k * 20); g.lineTo(px + 24, py + 6); g.lineTo(px + 80, VH); g.fill();
    g.fillStyle = 'rgba(40,36,44,0.6)'; for (const dx of [-6, 4, 14]) g.fillRect(px + dx, py - 30 - k * 20, 1, 16); };
  return H;
}
