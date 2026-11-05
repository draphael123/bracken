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

/* ======================================================================================================================================================================
   THE GUST HARPY (claude/harpypass, 2026-11-05; Daniel 11-02 21:51: "hovers, flaps a wind blast that pushes you mid-jump, knock it down to stop it; reusable in the Rookery,
   Gale Moor and the Sky Road"). The gale harpy's cousin, in this same shared file (the gale harpy holds a perch and beats a CONE that shoves whatever stands in it; the gust
   harpy HUNTS YOUR JUMP and throws a TRAVELLING BLAST). Like the gale harpy she knows nothing about any level: a level's hands call gustStep(e, dt, w) and drawBlasts.
   WHAT SHE IS: a small storm-blue harpy who HOVERS ON A SHORT BEAT (e.hx +/- GUST.sway, bobbing) and keeps her height about a jump over you (her lane: GUST.over px over
     your feet, never more than GUST.climb px off her home) - so her blast crosses the arc of your jump.
   hover     facing you; when you are inside GUST.reach (and her lane can see you) and her beat is ready she TELLS
   gustTell  WINGS RAISED HIGH for GUST.tell s: a yellow !, a dashed arrow lane drawn along where the blast will run, her whistle. HITTABLE.
   gust      she claps her wings down: a BLAST (a crescent of wind GUST.h tall) runs along her lane at GUST.v px/s for GUST.life s. It does NO DAMAGE - it PUSHES:
               a hero IN THE AIR is thrown GUST.push px/s along it (mid-jump: off the line of the jump); a hero ON HIS FEET only leans (x GUST.ground);
               a GUARD up (block / ward / crouch-brace) BRACES: x GUST.brace, in the air too; a hero who ANSWERS IT (the hero's perfect guard - the parry tap, the deflect,
               the ward on the beat: w.heroes()[i].answer) TURNS IT BACK: the blast reverses and, if it reaches her, KNOCKS HER DOWN. A blast dies on rock.
   KNOCK HER DOWN TO STOP HER: any blow (melee, a jump strike, an arrow, a bolt, a fireball, a hook) while she hovers or tells, or her own blast turned back, KNOCKS HER OUT
     OF THE AIR: she tumbles to the footing under her (w.floorBelow) and lies GROUNDED, flapping, for GUST.down s (open - and two blows of most heroes end her: GUST.hp),
     then climbs back to her beat (GUST.rise s). Into a drop with no footing (w.floorBelow null, past w.voidY) she is gone.
   FAIR: one blast alive per harpy (she never blasts while her last one still runs), never in a dive's window (w.lastDive, as the gale harpy), and the first beat
     waits GUST.first s after she sees you. Her tell is always told: wings up + the lane + the whistle.
   API: GUST, GUST_SAY, newGust(o), gustStep(e, dt, w), gustFrame(e), drawBlasts(g, e, cx, cy, time), blastHits(b, x, y) (pure, for tools).
   ====================================================================================================================================================================== */
export const GUST = { hp: 22, reach: 176, see: 96, tell: 0.62, cd: 2.9, first: 1.3, v: 150, life: 1.35, h: 36, w: 14, push: 245, ground: 0.25, brace: 0.4, lift: 0, down: 5.5, rise: 1.4,
  grav: 560, sway: 18, bob: 3, over: 22, climb: 30, turnV: 1.25, pushT: 0.35, noStack: 0.5 };
export const GUST_SAY = { blast: 'A GUST HARPY: KNOCK HER DOWN', down: 'KNOCKED OUT OF THE AIR', turned: 'TURNED BACK ON HER', braced: 'BRACED', shoved: 'THE BLAST TAKES YOU' };
export function newGust(o = {}) { return { gMode: 'hover', gT: 0, gCd: GUST.first, blasts: [], gN: { tells: 0, blasts: 0, shoved: 0, leaned: 0, braced: 0, turned: 0, downed: 0, held: 0 }, ...o }; }
/* is a point (a hero's middle) inside a blast's crescent? */
export const blastHits = (b, x, y) => Math.abs(x - b.x) < GUST.w / 2 + 6 && Math.abs(y - b.y) < GUST.h / 2;
function knockDown(e, w, why) { if (e.gMode === 'downed' || e.gMode === 'grounded') return; e.gMode = 'downed'; e.gT = 0; e.gVy = -40; e.gN.downed++; e.mode = 'downed';
  w.say(e.x, e.y - 18, why === 'turned' ? GUST_SAY.turned : GUST_SAY.down, '#8fd160'); w.sound('down'); }
/* ---------- ONE FRAME. w: { heroes(): [{ x, y, ground, blocking, answer, alive, key, push(vx, vy, t) }], time(), lastDive?(), solid?(x, y) (px), floorBelow(x, y) (px of the
   footing's top under a point, or null), voidY (px), kill(e), say(x, y, text, col), sound(k), mark(e, '!'), seen?(), firstTell?(e) } ---------- */
export function gustStep(e, dt, w) {
  const now = w.time(), hs = w.heroes().filter(h => h.alive), P = hs.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
  e.gCd = (e.gCd ?? GUST.first) - dt; e.anim = e.anim || 0; e.blasts = e.blasts || []; e.gN = e.gN || newGust().gN; e.gMode = e.gMode || 'hover';
  if (P && w.seen && Math.abs(P.x - e.x) < 200) w.seen();
  /* THE BLASTS run their lane */
  for (const b of e.blasts) { b.life -= dt; b.x += b.dir * GUST.v * (b.turned ? GUST.turnV : 1) * dt;
    if (w.solid && w.solid(b.x + b.dir * 6, b.y)) b.life = 0;
    if (b.turned) { if (e.gMode !== 'downed' && e.gMode !== 'grounded' && Math.abs(e.x - b.x) < 12 && Math.abs(e.y - b.y) < GUST.h / 2) { b.life = 0; knockDown(e, w, 'turned'); } continue; }
    for (const h of hs) { const k = h.key ?? h; if (b.hit.has(k) || !blastHits(b, h.x, h.y - 10)) continue; b.hit.add(k);
      if (h.answer) { b.turned = true; b.dir = -b.dir; b.life = Math.max(b.life, Math.abs(e.x - b.x) / (GUST.v * GUST.turnV) + 0.2); e.gN.turned++; w.say(h.x, h.y - 30, GUST_SAY.turned, '#8fd160'); w.sound('turned'); break; }
      if (h.blocking) { h.push(b.dir * GUST.push * GUST.brace, 0, GUST.pushT); e.gN.braced++; if (!e.saidBrace) { e.saidBrace = 1; w.say(h.x, h.y - 30, GUST_SAY.braced, '#8fd160'); } }
      else if (!h.ground) { h.push(b.dir * GUST.push, -GUST.lift, GUST.pushT); e.gN.shoved++; if (!e.saidShove) { e.saidShove = 1; w.say(h.x, h.y - 30, GUST_SAY.shoved, '#ff9a5c'); } }
      else { h.push(b.dir * GUST.push * GUST.ground, 0, GUST.pushT * 0.6); e.gN.leaned++; } } }
  e.blasts = e.blasts.filter(b => b.life > 0);
  /* A BLOW KNOCKS HER OUT OF THE AIR (hover, tell, the clap or the climb home) */
  if (e.stagger > 0 && (e.gMode === 'hover' || e.gMode === 'tell' || e.gMode === 'clap' || e.gMode === 'rise')) knockDown(e, w, 'blow');
  const home = ty => { e.y += (ty + Math.sin(e.anim * 2.3) * GUST.bob - e.y) * Math.min(1, dt * 3); e.x += (e.hx + Math.sin(e.anim * 0.9) * GUST.sway - e.x) * Math.min(1, dt * 2); };
  const laneY = () => P ? Math.max(e.hy - GUST.climb, Math.min(e.hy + GUST.climb, P.y - GUST.over)) : e.hy;
  switch (e.gMode) {
    case 'tell': { e.gT -= dt; e.mode = 'gustTell'; home(e.lane ?? e.hy);
      if (e.gT <= 0) { if (w.lastDive && now - w.lastDive() < GUST.noStack) { e.gT = 0.05; e.gN.held++; break; }
        e.gMode = 'clap'; e.gT = 0.35; e.gN.blasts++; e.blasts.push({ x: e.x + e.face * 8, y: e.y + 2, dir: e.face, life: GUST.life, hit: new Set(), turned: false }); w.sound('blast'); }
      break; }
    case 'clap': { e.gT -= dt; e.mode = 'gust'; home(e.lane ?? e.hy); if (e.gT <= 0) { e.gMode = 'hover'; e.gCd = GUST.cd; } break; }
    case 'downed': { e.mode = 'downed'; e.gVy = Math.min(320, (e.gVy || 0) + GUST.grav * dt); e.y += e.gVy * dt; e.x += Math.sin(e.anim * 7) * 10 * dt;
      const f = w.floorBelow(e.x, e.y - 4);
      if (f !== null && f !== undefined && e.y >= f - 4) { e.y = f - 4; e.gMode = 'grounded'; e.gT = GUST.down; w.sound('thud'); }
      else if ((f === null || f === undefined) && w.voidY !== undefined && e.y > w.voidY) { e.blasts = []; w.kill(e); }
      break; }
    case 'grounded': { e.mode = 'downed'; e.gT -= dt; if (e.gT <= 0) { e.gMode = 'rise'; e.gT = GUST.rise; e.stagger = 0; } break; }
    case 'rise': { e.mode = 'hover'; e.gT -= dt; e.x += (e.hx - e.x) * Math.min(1, dt * 2.2); e.y += (e.hy - e.y) * Math.min(1, dt * 2.2); if (e.gT <= 0) { e.gMode = 'hover'; e.gCd = Math.max(e.gCd, 1); } break; }
    default: { e.gMode = 'hover'; e.mode = 'hover'; e.lane = laneY(); home(e.lane); if (P) e.face = Math.sign(P.x - e.x) || e.face;
      if (P && e.gCd <= 0 && !(e.stagger > 0) && !e.blasts.length && Math.abs(P.x - e.x) < GUST.reach && Math.abs(P.y - 10 - e.y) < GUST.see) {
        e.gMode = 'tell'; e.gT = GUST.tell; e.gN.tells++; e.face = Math.sign(P.x - e.x) || e.face; w.mark(e, '!'); w.sound('tell');
        if (!e.saidTell && w.firstTell) { e.saidTell = 1; w.firstTell(e); } } }
  }
}
/* which harpy frame she wears: 4 = wings up (the tell), 2 = the clap, 3 = knocked down / grounded, else the flap */
export const gustFrame = e => e.mode === 'gustTell' ? 4 : e.mode === 'gust' ? 2 : e.mode === 'downed' ? 3 : Math.floor((e.anim || 0) * 7) % 2;
/* THE TOLD LANE and THE BLAST (GREYBOX, the art lane redraws): in the TELL a dashed gold line runs along her lane with chevrons drifting out (where it will go); a BLAST is a
   tall pale crescent of wind (three nested arcs, grit in it) racing along the lane; turned back it flashes green */
import * as HFX from './redraw/harpy_fx_art.js';   /* (claude/harpyart) the lane's chevrons and the blast crescent, in pixels */
let fxOff = false;
export function drawBlasts(g, e, cx, cy, time) {
  if (!fxOff) { try {
    if (e.mode === 'gustTell') HFX.drawGustTell(g, e.x - cx, e.y + 2 - cy, e.face || 1, Math.min(GUST.reach, GUST.v * GUST.life), 1 - Math.max(0, e.gT) / GUST.tell, time);
    for (const b of e.blasts || []) HFX.drawGustBlast(g, b.x - cx, b.y - cy, b.dir, GUST.h, b.life, !!b.turned, time);
    return; } catch (err) { fxOff = true; } }
  const R = Math.round;
  if (e.mode === 'gustTell') { const k = 1 - Math.max(0, e.gT) / GUST.tell, y = R(e.y + 2 - cy), x0 = R(e.x - cx), d = e.face || 1, len = Math.min(GUST.reach, GUST.v * GUST.life);
    g.globalAlpha = 0.25 + 0.45 * k; g.fillStyle = '#ffe9a0'; for (let s = 10; s < len; s += 8) g.fillRect(R(x0 + d * s), y, 4, 1);
    for (let i = 0; i < 3; i++) { const s = ((time * 70 + i * len / 3) % len), q = R(x0 + d * s); g.fillRect(q, y - 3, 1, 1); g.fillRect(q - d, y - 2, 1, 1); g.fillRect(q - 2 * d, y - 1, 1, 1); g.fillRect(q - d, y + 2, 1, 1); g.fillRect(q, y + 3, 1, 1); g.fillRect(q - 2 * d, y + 1, 1, 1); }
    g.globalAlpha = 1; }
  for (const b of e.blasts || []) { const x = R(b.x - cx), y = R(b.y - cy), d = b.dir, a = Math.min(1, b.life / 0.3);
    for (let k = 0; k < 3; k++) { g.globalAlpha = a * (0.9 - k * 0.25); g.strokeStyle = b.turned ? '#b8f08a' : k ? '#d4e4f4' : '#ffffff'; g.lineWidth = k ? 1 : 2; g.beginPath();
      g.arc(x - d * (k * 5 + 4), y, GUST.h / 2 - k * 3, d > 0 ? -1.1 : Math.PI - 1.1, d > 0 ? 1.1 : Math.PI + 1.1); g.stroke(); }
    g.lineWidth = 1; g.globalAlpha = a; g.fillStyle = '#c8c4d0'; for (let i = 0; i < 5; i++) { const yy = y - GUST.h / 2 + 4 + ((i * 7 + Math.floor(time * 30)) % (GUST.h - 8)); g.fillRect(R(x - d * (8 + (i * 5) % 12)), yy, 2, 1); }
    g.globalAlpha = 1; }
}
