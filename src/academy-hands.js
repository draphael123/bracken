// src/academy-hands.js - THE MAGE ACADEMY's HANDS (claude/academy, the OPUS GREYBOX; drawn by claude/academyart). src/academy.js lays the school; this runs it:
//   THE LECTERNS   touch (or strike) one: its CANTRIP is yours while you stay in its room (L.ac.rooms); another lectern swaps it. The Examination's three are
//                  lit by THE HEADMISTRESS one phase at a time (ctx.arenaLit).
//   LEVITATION     hold JUMP in the air: float up at LEV.rise, LEV.meter s per airtime (refilled on landing)                     -> player()
//   BLINK          the DODGE button: a BL.dist teleport the way you hold/face - through WARD RAILS (L.ac.rails and the Headmistress's), never through stone -> blink()
//   CONJURE STEP   JUMP in the air: a 3-cell ONEWAY step under your feet, CJ.life s (it flickers its last CJ.warn s), CJ.max a hero  -> player()
//   THE PITS       a hero whose feet pass L.ac.catchY is filed back onto his last firm footing for PIT.dmg (spare: never a death)
//   SHORTCUT RUNES struck: their shutter cells lift (a cellar or an alcove that pays)
//   THE SPELLBOOK FLOCK (the one new foe) - its own small machine: wheel, told GATHER (yellow !), STREAM through where you were, SCATTERED by a block.
// Every tile it changes is kept (original) and put back on a reset. DRAWING: src/redraw/academy_art.js (claude/academyart).
// main.js calls (one tagged line each): on, reset, update, player, blink, strike, spawn, flock, takeFlock, drawBack, drawOver, drawFlock. tools/academy.mjs drives it in node.
import { AC_SAY, SPELL_NAME, SPELL_HOW } from './ac-lines.js'; import * as ART from './redraw/academy_art.js';

export const LEV = { rise: 112, meter: 1.4 };
export const BL = { dist: 80, min: 20, cd: 0.45, inv: 0.18, hang: 0.12 };
export const CJ = { life: 2.2, warn: 0.6, max: 2, cd: 0.22, w: 3, grace: 0.5 };
export const PIT = { dmg: 14 };
export const TOUCH = { dx: 14, dy: 26 };
export const FLOCK = { hp: 30, books: 5, orbit: 26, sense: 190, up: 150, down: 84, tell: 0.7, speed: 300, run: 0.75, dmg: 8, scatter: 1.5, cd: 2.2, regroup: 1.4 };
const SOUND = { learn: s => (s.ui || s.tell)(), ends: s => (s.puff || s.tell)(), float: s => (s.whoosh || s.tell)(), blink: s => (s.whoosh || s.tell)(), fizzle: s => (s.clank || s.thud || s.tell)(),
  step: s => (s.ui || s.tell)(), stepGone: s => (s.puff || s.tell)(), filed: s => (s.thud)(), rune: s => (s.clank || s.thud)(), gather: s => (s.tell)(), stream: s => (s.whoosh || s.tell)(), scatter: s => (s.puff || s.thud)() };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
export const SPELL_COL = { levitate: '#9fd8ff', blink: '#d8a0ff', conjure: '#ffd36b' };

export function makeAcademyHands(ctx) {
  const H = {}; let S = null;
  const TS = ctx.TS, L = () => ctx.L, ac = () => (L() && L().ac) || null;
  const snd = k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} };
  const say = (x, y, t, col) => ctx.number && ctx.number(x, y, t, col || '#ffd36b');
  const now = () => (S ? S.t : 0);
  H.on = () => !!(L() && L().academy);
  H.show = () => S;
  const heroes = () => (ctx.players() || []).filter(p => p && !p.dead);
  const fresh = () => ({ t: 0, cells: new Map(), hero: new Map(), steps: [], runes: new Set(), tmp: new Map(), safe: new Map(), told: {},
    n: { learned: 0, ended: 0, floats: 0, blinks: 0, railBlinks: 0, fizzles: 0, steps: 0, filed: 0, runes: 0, gathers: 0, streams: 0, streamHits: 0, scattered: 0 } });
  const hint = (k, m) => { if (S.told[k]) return; S.told[k] = 1; ctx.hint && ctx.hint(m); };
  /* ---------------- THE TILES this level changes: every original kept, every one put back on a reset ---------------- */
  const cellAt = (x, y) => { const L0 = L(); if (x < 0 || y < 0 || x >= L0.W || y >= L0.H) return ctx.T.SOLID; return L0.grid[y * L0.W + x]; };
  H.setCell = (x, y, t) => { const L0 = L(); if (x < 0 || y < 0 || x >= L0.W || y >= L0.H) return; const k = y * L0.W + x; if (!S.cells.has(k)) S.cells.set(k, L0.grid[k]); ctx.cellSet(x, y, t); };
  H.restoreCell = (x, y) => { const L0 = L(), k = y * L0.W + x; if (!S.cells.has(k)) return; ctx.cellSet(x, y, S.cells.get(k)); S.cells.delete(k); };
  H.reset = () => { if (!H.on()) { S = null; return; }
    if (S && S.L === L()) for (const [k, v] of S.cells) { const L0 = L(); ctx.cellSet(k % L0.W, Math.floor(k / L0.W), v); }
    S = fresh(); S.L = L(); const G = ac(); if (G) for (const r of G.runes) for (const [x, y] of r.cells) H.setCell(x, y, ctx.T.SOLID); };   /* THE SHUTTERS: open in the built grid (the reach and quality tools read the secret), shut in play until the rune is struck */
  /* ---------------- A HERO'S CANTRIP ---------------- */
  const st = p => { if (!S.hero.has(p)) S.hero.set(p, { spell: null, room: null, floatT: 0, floated: false, blinkCd: 0, railT: -9, stepCd: 0, stepT: -9, onStep: false }); return S.hero.get(p); };
  H.state = p => (S ? st(p) : null);
  H.spellOf = p => (S ? st(p).spell : null);
  const roomOf = x => { const G = ac(), A = L().arena, c = Math.floor(x / TS); if (A && c >= A.wallL + 1 && c < A.wallR) return { id: 'arena', x0: A.wallL + 1, x1: A.wallR - 1, spell: null };
    return (G.rooms || []).find(r => c >= r.x0 && c <= r.x1) || null; };
  H.teach = (p, spell, rm) => { const s = st(p); if (s.spell === spell) return false; const was = s.spell; s.spell = spell; s.room = rm || (roomOf(p.x) || {}).id || null; s.floatT = 0; S.n.learned++; snd('learn');
    say(p.x, p.y - 34, (was ? AC_SAY.swap + ': ' : AC_SAY.learned + ': ') + SPELL_NAME[spell], SPELL_COL[spell]); hint('spell:' + spell, SPELL_NAME[spell] + ': ' + SPELL_HOW[spell]); return true; };
  H.forget = (p, quiet) => { const s = st(p); if (!s.spell) return; s.spell = null; s.room = null; S.n.ended++; dropSteps(p); if (!quiet) { snd('ends'); say(p.x, p.y - 34, AC_SAY.ends, '#8aa0c0'); } };
  const lit = c => !c.arena || !!(ctx.arenaLit && ctx.arenaLit(c.id));
  function stepLecterns() { const G = ac();
    for (const p of heroes()) { const s = st(p), rm = roomOf(p.x);
      if (s.spell && (!rm || rm.id !== s.room)) H.forget(p);   /* IT LASTS THE LESSON: out of the room, the spell is gone */
      for (const c of G.lecterns) if (lit(c) && Math.abs(c.x - p.x) < TOUCH.dx && Math.abs(c.y - p.y) < TOUCH.dy) H.teach(p, c.spell, rm ? rm.id : c.room); } }
  /* ---------------- LEVITATION and CONJURE STEP (after gravity, before the move: main.js's SKY.player spot) ---------------- */
  H.player = (dt, p, jumpHeld) => { if (!S || !p || p.dead || !H.on()) return; const s = st(p);
    s.blinkCd = Math.max(0, s.blinkCd - dt); s.stepCd = Math.max(0, s.stepCd - dt);
    if (p.ground) { s.floatT = 0; s.floated = false; p.acFloat = false; }
    const free = !p.ground && !p.climb && !p.swim && !(p.hurt > 0) && !p.plunge && !p.dead;
    if (s.spell === 'levitate') {
      const can = free && jumpHeld && s.floatT < LEV.meter && p.vy > -LEV.rise;
      if (can) { if (!p.acFloat) { S.n.floats++; snd('float'); } p.vy = -LEV.rise; s.floatT += dt; s.floated = true; p.acFloat = true; p.canCut = false; }
      else p.acFloat = false; }
    if (s.spell === 'conjure' && free && p.jbuf > 0 && !(p.coyote > 0) && s.stepCd <= 0) { p.jbuf = 0; conjure(p, s); } };
  function conjure(p, s) { const ty = Math.floor((p.y + 6) / TS), tx = Math.floor(p.x / TS), cells = [];
    for (let x = tx - 1; x <= tx + 1; x++) if (cellAt(x, ty) === ctx.T.AIR && cellAt(x, ty - 1) === ctx.T.AIR) cells.push([x, ty]);
    if (!cells.length) { say(p.x, p.y - 30, AC_SAY.fizzle, '#8aa0c0'); snd('fizzle'); return; }
    const mine = S.steps.filter(q => q.p === p); if (mine.length >= CJ.max) { killStep(mine[0]); S.steps = S.steps.filter(q => q.t > 0); }
    for (const [x, y] of cells) H.setCell(x, y, ctx.T.ONEWAY);
    S.steps.push({ p, cells, t: CJ.life, x: tx, y: ty, key: 'st' + (++S.n.steps) }); s.stepCd = CJ.cd;
    p.y = ty * TS; p.vy = 0; snd('step'); }
  function killStep(q) { for (const [x, y] of q.cells) if (cellAt(x, y) === ctx.T.ONEWAY) H.restoreCell(x, y); q.t = 0; }
  function dropSteps(p) { for (const q of S.steps) if (!p || q.p === p) killStep(q); S.steps = S.steps.filter(q => q.t > 0); }
  H.dispelAll = () => { const n = S ? S.steps.length : 0; if (S) dropSteps(null); return n; };
  H.steps = () => (S ? S.steps.map(q => ({ x: q.x, y: q.y, t: q.t, cells: q.cells.length })) : []);
  /* standing on a conjured step now, or left one within CJ.grace s (the Headmistress's P3 reads it) */
  H.onStep = p => { if (!S) return false; const s = st(p); return s.onStep || now() - s.stepT < CJ.grace; };
  function stepSteps(dt) {
    for (const q of S.steps) { q.t -= dt; if (q.t <= 0) { killStep(q); snd('stepGone'); } }
    S.steps = S.steps.filter(q => q.t > 0);
    for (const p of heroes()) { const s = st(p), tx = Math.floor(p.x / TS), ty = Math.floor((p.y + 2) / TS);
      s.onStep = !!p.ground && S.steps.some(q => q.cells.some(([x, y]) => y === ty && Math.abs(x - tx) <= 1)); if (s.onStep) s.stepT = now(); } }
  /* ---------------- BLINK (main.js: before the dodge reads its buffer; true = the press is spent) ---------------- */
  const railAt = (x, y) => (ac().rails || []).some(r => r.x === x && y >= r.y0 && y <= r.y1) || [...S.tmp.values()].some(r => r.x === x && y >= r.y0 && y <= r.y1);
  const bodyCells = (cx, fy) => { const out = []; for (let x = Math.floor((cx - 5) / TS); x <= Math.floor((cx + 4) / TS); x++) for (let y = Math.floor((fy - 14) / TS); y <= Math.floor((fy - 1) / TS); y++) out.push([x, y]); return out; };
  const solid = t => t === ctx.T.SOLID || t === ctx.T.PALISADE || t === ctx.T.CRATE || t === ctx.T.CRYST;
  H.blink = (p, held) => { if (!S || !H.on() || !p || p.dead) return false; const s = st(p); if (s.spell !== 'blink') return false;
    if (s.blinkCd > 0 || p.hurt > 0) return true;
    const dir = held || p.face || 1; let best = 0, rail = false;
    for (let d = 4; d <= BL.dist; d += 4) { const cx = p.x + dir * d, cells = bodyCells(cx, p.y);
      if (cells.some(([x, y]) => solid(cellAt(x, y)) && !railAt(x, y))) break;   /* stone stops a blink: never through a wall */
      if (cells.some(([x, y]) => railAt(x, y))) { rail = true; continue; }       /* a rail is passed, never stood in */
      if (d >= BL.min) best = d; }
    if (!best) { S.n.fizzles++; snd('fizzle'); say(p.x, p.y - 30, AC_SAY.fizzle, '#8aa0c0'); s.blinkCd = BL.cd * 0.5; return true; }
    const x0 = p.x; p.x += dir * best; p.face = dir; p.vx = dir * 60; if (!p.ground) p.vy = Math.min(p.vy, 0); p.inv = Math.max(p.inv || 0, BL.inv); p.acBlinkT = BL.hang;
    const crossed = rail && (ac().rails || []).concat([...S.tmp.values()]).some(r => (r.x * TS + 8 - x0) * (r.x * TS + 8 - p.x) < 0);
    s.blinkCd = BL.cd; S.n.blinks++; if (crossed) { S.n.railBlinks++; s.railT = now(); } snd('blink');
    if (ctx.blinkFx) ctx.blinkFx(x0, p.x, p.y);
    return true; };
  H.blinkedRail = (p, within = 1.5) => !!S && now() - st(p).railT <= within;
  /* THE HEADMISTRESS's WARD RAIL (her P2): a told column of SOLID the blink passes; dropped, its cells come back */
  H.tempRail = (id, x, y0, y1) => { if (!S) return; H.dropRail(id); const r = { id, x, y0, y1 }; S.tmp.set(id, r); for (let y = y0; y <= y1; y++) if (cellAt(x, y) === ctx.T.AIR) H.setCell(x, y, ctx.T.SOLID); };
  H.dropRail = id => { if (!S) return; const r = S.tmp.get(id); if (!r) return; S.tmp.delete(id); for (let y = r.y0; y <= r.y1; y++) H.restoreCell(r.x, y); };
  H.rails = () => (S ? [...S.tmp.values()] : []);
  /* ---------------- THE PITS ---------------- */
  function stepPits() { const G = ac(), L0 = L();
    for (const p of heroes()) {
      if (p.ground) { const tx = Math.floor(p.x / TS), ty = Math.floor((p.y + 2) / TS); if (L0.grid[ty * L0.W + tx] === ctx.T.SOLID && !S.cells.has(ty * L0.W + tx)) S.safe.set(p, { x: p.x, y: p.y }); }
      if (p.y <= G.catchY) continue; const s = (ctx.pitSafe && ctx.pitSafe(p)) || S.safe.get(p) || { x: L0.START.x * TS + 8, y: (L0.START.y + 1) * TS };
      p.x = s.x; p.y = s.y; p.vx = 0; p.vy = 0; S.n.filed++; snd('filed'); say(p.x, p.y - 30, AC_SAY.filed, '#ff6b6b');
      ctx.asPlayer(p, () => ctx.damage(p.x, PIT.dmg, { name: 'THE PIT', unblockable: true, spare: true, noKnock: true })); } }
  /* ---------------- THE STEP ---------------- */
  H.update = dt => { if (!H.on()) return; if (!S) H.reset(); S.t += dt;
    for (const p of heroes()) { st(p); if (p.acBlinkT > 0) { p.acBlinkT -= dt; p.vy = Math.min(p.vy, 0); } }
    stepLecterns(); stepSteps(dt); stepPits(); };
  /* ---------------- A HERO'S BLOW: a lectern (learn), a rune ---------------- */
  const hitBox = (hb, x, y, r) => hb.l < x + r && hb.r > x - r && hb.t < y + r && hb.b > y - r;
  H.strike = (hb, by) => { if (!H.on() || !hb) return; if (!S) H.reset(); const G = ac(), who = by || (ctx.hero && ctx.hero());
    if (who) for (const c of G.lecterns) if (lit(c) && hitBox(hb, c.x, c.y - 10, 10)) { const rm = roomOf(who.x); H.teach(who, c.spell, rm ? rm.id : c.room); }
    for (const r of G.runes) if (!S.runes.has(r.id) && hitBox(hb, r.x, r.y - 10, 10)) { S.runes.add(r.id); for (const [x, y] of r.cells) H.restoreCell(x, y); S.n.runes++; snd('rune'); say(r.x, r.y - 28, AC_SAY.lifted, '#ffe9a0'); } };
  /* ---------------- THE SPELLBOOK FLOCK ---------------- */
  H.spawn = (e, base) => { if (e.t !== 'acbooks') return null; return { ...base, t: 'acbooks', w: 18, h: 12, hp: FLOCK.hp, maxHp: FLOCK.hp, noGrav: true, mode: 'wheel', modeT: 0, hx: base.x, hy: base.y - 8, y: base.y - 8, squad: e.squad, cd: 0.6, anim: 0 }; };
  H.takeFlock = (e, dmg) => (e.mode === 'scattered' ? dmg * 2 : dmg);
  H.flock = (e, dt) => { if (!S) H.reset(); e.anim += dt; e.modeT -= dt; e.cd = Math.max(0, e.cd - dt);
    if (e.mode === 'scattered') { if (e.modeT <= 0) { e.mode = 'regroup'; e.modeT = FLOCK.regroup; } return; }
    if (e.mode === 'regroup') { e.x += (e.hx - e.x) * Math.min(1, dt * 2.5); e.y += (e.hy - e.y) * Math.min(1, dt * 2.5); if (e.modeT <= 0) { e.mode = 'wheel'; e.cd = FLOCK.cd; } return; }
    if (e.mode === 'gatherTell') { if (e.modeT <= 0) { e.mode = 'stream'; e.modeT = FLOCK.run; const dx = e.tx - e.x, dy = e.ty - e.y, d = Math.hypot(dx, dy) || 1; e.vx = dx / d * FLOCK.speed; e.vy = dy / d * FLOCK.speed; e.hit = false; S.n.streams++; snd('stream'); } return; }
    if (e.mode === 'stream') { e.x += e.vx * dt; e.y += e.vy * dt; e.face = Math.sign(e.vx) || e.face;
      for (const p of heroes()) { if (e.hit || Math.abs(p.x - e.x) > 12 || Math.abs((p.y - 8) - e.y) > 14) continue; e.hit = true; let r = null; ctx.asPlayer(p, () => { r = ctx.damage(e.x, FLOCK.dmg, { who: e, name: 'A SPELLBOOK FLOCK' }); });
        if (r === 'blocked') { e.mode = 'scattered'; e.modeT = FLOCK.scatter; S.n.scattered++; snd('scatter'); say(e.x, e.y - 14, AC_SAY.scattered, '#ffd36b'); return; } S.n.streamHits++; }
      if (e.modeT <= 0) { e.mode = 'regroup'; e.modeT = FLOCK.regroup; } return; }
    /* wheel: round the shelf it nests on; a hero in reach (it looks further UP than down: it hunts the floating) draws a told GATHER */
    e.x += ((e.hx + Math.cos(e.anim * 1.3) * 30) - e.x) * Math.min(1, dt * 2); e.y += ((e.hy + Math.sin(e.anim * 2.1) * 10) - e.y) * Math.min(1, dt * 2);
    const t = heroes().filter(p => Math.abs(p.x - e.x) < FLOCK.sense && p.y - e.y < FLOCK.down && e.y - p.y < FLOCK.up).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
    if (t && e.cd <= 0) { e.mode = 'gatherTell'; e.modeT = FLOCK.tell; e.tx = t.x + Math.sign(t.x - e.x) * 30; e.ty = t.y - 8; e.face = Math.sign(t.x - e.x) || 1; S.n.gathers++; snd('gather'); hint('flock', AC_SAY.flock); } };
  /* ---------------- WHAT A TOOL READS ---------------- */
  H.read = () => S && { t: +S.t.toFixed(2), spells: heroes().map(p => st(p).spell), steps: S.steps.length, rails: S.tmp.size, runes: S.runes.size, n: { ...S.n } };
  /* ================= THE DRAWING (src/redraw/academy_art.js, claude/academyart) ================= */
  H.openExit = () => { if (S) S.exitOpen = true; };   /* the Headmistress closes the register: the Examination's gate shows light */
  H.drawBack = (g, cx, cy, VW, VH, time) => { if (!H.on() || !S) return; const L0 = L(), at = (x, y) => cellAt(x, y);
    ART.drawBackdrop(g, cx, cy, VW, VH, time, ac(), L0, { exitOpen: !!S.exitOpen }); ART.drawDecor(g, cx, cy, VW, VH, time, L0, at, ctx.T); };
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!H.on() || !S) return; const G = ac(), x = v => R(v - cx), y = v => R(v - cy);
    for (const c of G.lecterns) { const px = x(c.x), py = y(c.y); if (px < -24 || px > VW + 24) continue; ART.drawLectern(g, px, py, c.spell, lit(c), time); }
    const rl = (r, k, temp) => { const px = x(r.x * TS), top = y(r.y0 * TS), bot = y((r.y1 + 1) * TS); if (px < -TS || px > VW) return; ART.drawRail(g, px, top, bot, time, k, temp); };
    (G.rails || []).forEach((r, k) => rl(r, k, false)); [...S.tmp.values()].forEach((r, i) => rl(r, i + 9, true));
    for (const q of S.steps) { const fl = q.t < CJ.warn && (time * 12) % 2 < 1, xs = q.cells.map(c => c[0]); q.cells.forEach(([cx2, cy2], i) => ART.drawStep(g, x(cx2 * TS), y(cy2 * TS), !xs.includes(cx2 - 1), !xs.includes(cx2 + 1), fl, time, i)); }
    for (const r of G.runes) { const done = S.runes.has(r.id); ART.drawRune(g, x(r.x), y(r.y), done, time); if (!done) for (const [sx, sy] of r.cells) { const px = x(sx * TS), py = y(sy * TS); if (px > -TS && px < VW) g.drawImage(ART.shutterTile(sx + sy), px, py); } }
    for (const p of heroes()) { const s = st(p); if (!s.spell) continue; const o = { float: !!p.acFloat }; if (s.spell === 'levitate') o.meter = 1 - Math.min(1, s.floatT / LEV.meter); ART.drawAura(g, x(p.x), y(p.y) - 36, s.spell, o, time); } };
  H.drawFlock = (g, e, cx, cy, time) => ART.drawFlock(g, e, cx, cy, time, FLOCK);
  return H;
}
