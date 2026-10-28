// src/gale-harpy.js - THE GALE HARPY, a SHARED FOE MODULE (claude/rookery2, the OPUS GREYBOX, 2026-10-27; brief scratch/brief-rookery2-1027.md A2).
// THE ROOKERY is her first home; WINDCALLER 4 and THE ROC (the Sky Road) are meant to reuse this file as it is - it knows nothing about the rookery. A level's hands
// call galeStep(e, dt, w) for each of her every frame (w: the world, below), and draw her with drawGale / drawGust (placeholder poses: the sonnet art lane draws her).
//
// WHAT SHE IS: a harpy who HOVERS AT A PERCH (e.hx, e.hy: her home) and BEATS A GUST in a cone. She never dives.
//   hover     she bobs at her perch, facing you; when you are inside her reach (GALE.reach px, below or level with her) and her beat is ready, she TELLS
//   tell      WINGS SPREAD BACK for GALE.tell s (0.6): a yellow !, the cone drawn faint along where it will blow, her own whistle. SHE IS HITTABLE HERE - a blow in the tell
//             (any blow: e.stagger > 0) BREAKS THE GUST (no gust, she tumbles a beat, 'broken')
//   gust      she beats GALE.T s: everything in the cone is SHOVED away from her (GALE.push px/s): a hero (a shield BRACES - half the shove, no lift), the loose things a
//             level hands her (w.props: rocks, eggs, light props - each { x, y, vx, vy, light }), and a hero riding a harpy (w.riders: his harpy's path is pushed off line,
//             it springs back). Used well it blows you UP / OVER a gap (a jump into it carries); badly placed, it knocks you off a ledge (A10: a fall is a climb / hurts).
//   recover   GALE.recover s, then hover with her beat on GALE.cd
// FAIR (the brief): low HP (GALE.hp - two blows of most heroes); never stacks a gust with a dive in the same GALE.noStack s window - w.lastDive() is when any harpy near last
//   released a dive: a tell that would end inside that window waits (holds its tell, still hittable); and w.gusted(t) tells the level when a gust went off, so a dive that
//   would release inside the window waits too. One beat at a time per harpy; her tell is always longer than the window.
// API: GALE (numbers), GALE_SAY (her capital lines: every one is in src/hint-lines.js), newGale(o) (the fields a spawned body needs), galeStep(e, dt, w), inCone(e, x, y),
//   coneOf(e) ({ x0, y0, dir, len, half }), drawGust(g, e, cx, cy, time), galeFrame(e) (which harpy frame she wears: 4 = wings back, 2 = the beat, else the flap).
export const GALE = { hp: 26, tell: 0.6, T: 0.5, recover: 0.6, cd: 3.2, first: 1.2, reach: 150, len: 128, half: 34, push: 270, lift: 150, brace: 0.5, noStack: 0.5, broken: 0.7, bob: 4 };
export const GALE_SAY = { gust: 'A GALE HARPY: HIT HER IN THE TELL', broken: 'THE GUST IS BROKEN', braced: 'BRACED', shoved: 'THE GUST TAKES YOU' };
export function newGale(o = {}) { return { galeCd: GALE.first, galeMode: 'hover', galeT: 0, galeN: { tells: 0, gusts: 0, broken: 0, shoved: 0, braced: 0, held: 0 }, ...o }; }
/* her cone: from her chest, toward where she faces, GALE.len long, GALE.half px either side of its line at its far end (a widening wedge) */
export function coneOf(e) { const dir = e.face || -1; return { x0: e.x + dir * 6, y0: e.y + 2, dir, len: GALE.len, half: GALE.half }; }
export function inCone(e, x, y) { const c = coneOf(e), dx = (x - c.x0) * c.dir; if (dx < -4 || dx > c.len) return false; const w = 8 + (c.half - 8) * Math.max(0, dx) / c.len; return Math.abs(y - c.y0) <= w + 10; }
/* ---------- ONE FRAME. w: { heroes(): [{ x, y, ground, blocking, push(vx, vy), alive }], time(), lastDive(), gusted(t), props(): [{ x, y, vx, vy, light }], riders(): [{ x, y, shove(dx, dy) }],
   say(x, y, text, col), sound(k), mark(e, '!'), seen() } ---------- */
export function galeStep(e, dt, w) {
  const now = w.time(), hs = w.heroes().filter(h => h.alive), P = hs.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
  e.galeCd = (e.galeCd ?? GALE.first) - dt; e.anim = e.anim || 0;
  if (P && w.seen && Math.abs(P.x - e.x) < 200) w.seen();
  /* a blow in the tell breaks the gust (B: hittable in the tell) */
  if (e.galeMode === 'tell' && e.stagger > 0) { e.galeMode = 'broken'; e.galeT = GALE.broken; e.galeN.broken++; w.say(e.x, e.y - 18, GALE_SAY.broken, '#8fd160'); w.sound('broken'); }
  const home = () => { e.y += (e.hy + Math.sin(e.anim * 2.3) * GALE.bob - e.y) * Math.min(1, dt * 3); e.x += (e.hx - e.x) * Math.min(1, dt * 3); };
  switch (e.galeMode) {
    case 'tell': { e.galeT -= dt; e.mode = 'galeTell'; home();
      if (e.galeT <= 0) { if (now - w.lastDive() < GALE.noStack) { e.galeT = 0.05; e.galeN.held++; break; }   /* (never a gust in a dive's window: she holds her tell) */
        e.galeMode = 'gust'; e.galeT = GALE.T; e.galeN.gusts++; e.gustHit = new Set(); w.gusted(now); w.sound('gust'); }
      break; }
    case 'gust': { e.galeT -= dt; e.mode = 'gust'; home();
      for (const h of hs) if (inCone(e, h.x, h.y - 10) && !e.gustHit.has(h)) { e.gustHit.add(h);
        if (h.blocking) { h.push(e.face * GALE.push * GALE.brace, 0); e.galeN.braced++; if (!e.saidBrace) { e.saidBrace = 1; w.say(h.x, h.y - 30, GALE_SAY.braced, '#8fd160'); } }
        else { h.push(e.face * GALE.push, -GALE.lift); e.galeN.shoved++; if (!e.saidShove) { e.saidShove = 1; w.say(h.x, h.y - 30, GALE_SAY.shoved, '#ff9a5c'); } } }
      for (const q of (w.props ? w.props() : [])) if (inCone(e, q.x, q.y)) { q.vx = (q.vx || 0) + e.face * GALE.push * (q.light ? 0.9 : 0.4) * dt * 6; if (q.light) q.vy = Math.min(q.vy || 0, -60); }
      for (const r of (w.riders ? w.riders() : [])) if (inCone(e, r.x, r.y)) r.shove(e.face * 90 * dt, -30 * dt);
      if (e.galeT <= 0) { e.galeMode = 'recover'; e.galeT = GALE.recover; }
      break; }
    case 'broken': case 'recover': { e.galeT -= dt; e.mode = e.galeMode === 'broken' ? 'downed' : 'hover'; if (e.galeMode === 'broken') e.y += 20 * dt; else home();
      if (e.galeT <= 0) { e.galeMode = 'hover'; e.galeCd = GALE.cd; }
      break; }
    default: { e.mode = 'hover'; home(); if (P) e.face = Math.sign(P.x - e.x) || e.face;
      if (P && e.galeCd <= 0 && !(e.stagger > 0) && Math.abs(P.x - e.x) < GALE.reach && P.y > e.y - 24 && P.y - e.y < GALE.reach) {
        e.galeMode = 'tell'; e.galeT = GALE.tell; e.galeN.tells++; e.face = Math.sign(P.x - e.x) || e.face; w.mark(e, '!'); w.sound('tell');
        if (!e.saidTell && w.firstTell) { e.saidTell = 1; w.firstTell(e); } } }
  }
}
export const galeFrame = e => e.mode === 'galeTell' ? 4 : e.mode === 'gust' ? 2 : e.mode === 'downed' ? 3 : Math.floor((e.anim || 0) * 6) % 2;
/* THE TOLD CONE (claude/rookery2art): in the TELL the cone is two dashed gold edges with a few pale ribbons GATHERING along it (the wind she is about to throw), each brighter as the tell
   runs out; in the BEAT nine S-curved wind ribbons race out of her wings, tapering, with sparkle heads, and grit and feathers torn along the cone */
export function drawGust(g, e, cx, cy, time) {
  if (e.mode !== 'galeTell' && e.mode !== 'gust') return; const c = coneOf(e), x0 = Math.round(c.x0 - cx), y0 = Math.round(c.y0 - cy), d = c.dir;
  const ribbon = (off, ph, k, a, col, head) => { const n = 14; g.fillStyle = col;
    for (let i = 0; i < n; i++) { const t = i / n, kk = (k - t * 0.35 + 1) % 1, xx = x0 + d * c.len * Math.min(1, kk + 0.02), wd = 8 + (c.half - 8) * kk, yy = y0 + off * wd + Math.sin(kk * 9 + ph + time * 6) * 3 * kk; g.globalAlpha = a * (1 - t); g.fillRect(Math.round(xx), Math.round(yy), 2, 1); }
    if (head) { const xx = x0 + d * c.len * k, wd = 8 + (c.half - 8) * k, yy = y0 + off * wd + Math.sin(k * 9 + ph + time * 6) * 3 * k; g.globalAlpha = a; g.fillStyle = '#ffffff'; g.fillRect(Math.round(xx), Math.round(yy) - 1, 2, 3); } };
  if (e.mode === 'galeTell') { const k = 1 - Math.max(0, e.galeT) / GALE.tell; g.globalAlpha = 0.2 + 0.4 * k; g.strokeStyle = '#ffe9a0'; g.setLineDash && g.setLineDash([3, 3]);
    g.beginPath(); g.moveTo(x0, y0 - 8); g.lineTo(x0 + d * c.len, y0 - c.half); g.moveTo(x0, y0 + 8); g.lineTo(x0 + d * c.len, y0 + c.half); g.stroke(); g.setLineDash && g.setLineDash([]);
    for (let i = 0; i < 4; i++) ribbon((i - 1.5) / 1.6, i * 1.7, ((time * 1.2 + i * 0.25) % 1) * (0.35 + 0.65 * k), 0.25 + 0.4 * k, '#e8f0ff', false);
    g.globalAlpha = 1; return; }
  for (let i = 0; i < 9; i++) ribbon((i - 4) / 4.6, i * 0.9, (time * 2.6 + i / 9) % 1, 0.85, i % 3 === 0 ? '#ffffff' : '#d4e4f4', true);
  for (let i = 0; i < 12; i++) { const k = (time * 2 + i * 0.083) % 1, xx = x0 + d * c.len * k, wd = 8 + (c.half - 8) * k, yy = y0 + (((i * 37) % 13) - 6) / 6.5 * wd + Math.sin(time * 9 + i) * 2;   /* grit and torn feathers */
    g.globalAlpha = 0.9 * (1 - k * 0.6); if (i % 4 === 0) { g.fillStyle = '#e6e4ec'; g.fillRect(Math.round(xx), Math.round(yy), 3, 1); g.fillStyle = '#c0bece'; g.fillRect(Math.round(xx) + 1, Math.round(yy) + 1, 2, 1); } else { g.fillStyle = i % 2 ? '#9a96a4' : '#c8c4d0'; g.fillRect(Math.round(xx), Math.round(yy), 1, 1); } }
  g.globalAlpha = 1;
}
