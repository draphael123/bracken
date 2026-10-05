// src/underwell-hands.js - THE UNDERWELL's HANDS (claude/underwell, the greybox). src/underwell.js builds the level; this binds its rule to the game:
// THE OIL (per cell: oil / burning / wet / spent - it burns OIL.burn s and runs to the cells beside it; a pour wets it, and wet oil will not catch;
// wet oil dries and spent oil seeps back after OIL.back s), THE WALL TORCHES (strike one: it falls into the oil under it; its bracket's ember catches
// again after OIL.relight s), THE GREAT LAMP (strike its chain: it falls into the brood hall's oil), THE BROOD NESTS (fire takes them), what fire
// does to the rest (it boils a drip dry, burns a rope ladder to ash until you respawn, drives a sandworm under, holds the brood back and burns them,
// and it burns YOU), THE DRY FOUNTAIN (three brass taps: it runs, and its vault opens), and THE CAST's twists (src/underwell.js: an oil scorpion's
// slick, a fire scorpion's patch that lights the oil, the dust scorpion's grit, the thirsty scorpion that drinks your skin, the spitter's venom).
// THE SKIN itself is THE WELL TOWN's (src/well-town-hands.js: L.skinRule) - this module is one of its pourables.
// main.js calls: reset, on, update, interact, pourable, fear, heat, flushed, onBlow, onHit, onDeath, preStep, drawWorld, drawOver, read.
// Every teaching line goes through ctx.number with a line listed in src/hint-lines.js (the hint box); the nudges are STUCK_HANDS data.
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';
import { STUCK_HANDS } from './stuck-spots.js';
import { venomOn, VENOM } from './desert-foes2.js';
import * as UWA from './redraw/underwell_art.js';

/* THE OIL: burn = s a lit cell burns; spread = s before it lights the cells beside it; back = s before wet oil dries / spent oil seeps back; tick/dmg =
   the fire on a hero standing in it (unblockable); foeDmg on a creature in it; nestBurn = s a nest takes to burn away; relight = s before a torch's
   bracket has a flame again; pourCells = how many cells one sip wets */
export const OIL = { burn: 10, spread: 0.04, back: 25, tick: 0.5, dmg: 5, foeDmg: 14, nestBurn: 1.0, relight: 12, pourR: 48, pourCells: 3, lampFall: 0.6, torchFall: 0.35, heatRows: 12 };
/* THE CAST's numbers: the thirsty scorpion's pull (px/s, sight px), the dust's blindness (s), a slick's width in cells */
export const CAST = { thirstV: 60, thirstSight: 260, blind: 2.2, slick: 3 };
export const OIL_SKIN = 'oilscorpion', DUST_SKIN = 'dustscorpion', THIRST_SKIN = 'thirstscorpion', SPIT_SKIN = 'spitscorpion';
const NO_FEAR = new Set(['firescorpion']);   /* the fire scorpion walks through fire */

export function makeUnderwellHands(ctx) {
  let UW = null;
  const H = {};
  const key = (x, y) => y * 4096 + x;
  const cellAt = (x, y) => (UW ? UW.cells.get(key(x, y)) : null);
  const once = k => { if (UW.said[k]) return false; UW.said[k] = 1; return true; };

  /* ---------- RESET: a fresh load lays the oil; a respawn makes it oil again (the torches lit, the ropes hung), and burnt nests stay burnt ---------- */
  H.reset = () => {
    const L = ctx.L; if (!L || !L.underwell) { UW = null; return; }
    const TS = ctx.TS;
    if (!UW || UW.L !== L) {
      UW = { L, said: {}, clock: 0, cells: new Map(), list: [], sconces: [], lamp: null, nests: [], ropes: [], fountain: null, vault: (L.vaultDoors || []).map(m => ({ ...m, open: false })),
        n: { lit: 0, lamp: 0, spread: 0, wet: 0, doused: 0, nests: 0, boiled: 0, ropes: 0, burns: 0, foeBurns: 0, slicks: 0, patchLit: 0, blinds: 0, drunk: 0, spits: 0, flushed: 0, nudges: 0 } };
      const add = (x, y, vertical) => { const k = key(x, y); if (UW.cells.has(k)) return; const c = { x, y, st: 'oil', t: 0, age: 0, vertical: !!vertical, seed: (x * 7 + y * 13) % 31 }; UW.cells.set(k, c); UW.list.push(c); };
      for (const [x0, x1, y] of L.seeps || []) for (let x = x0; x <= x1; x++) add(x, y, false);
      for (const [x, y0, y1] of L.lines || []) for (let y = y0; y <= y1; y++) add(x, y, true);
      UW.sconces = L.ents.filter(e => e.t === 'sconce').map(e => { let below = null; for (let y = e.y; y < L.H; y++) { const c = UW.cells.get(key(e.x, y)); if (c) { below = c; break; } } return { id: e.id, x: e.x, y: e.y, st: 'up', t: 0, below }; });
      const lp = L.ents.find(e => e.t === 'greatlamp'); if (lp) { let fy = lp.y; while (fy < L.H - 1 && ctx.cellGet(lp.x, fy + 1) === ctx.T.AIR) fy++; UW.lamp = { x: lp.x, top: lp.top || lp.y - 6, y: lp.y, floor: fy, st: 'up', t: 0, swing: 0 }; }
      UW.nests = (L.nests || []).map(m => ({ ...m, open: false, burn: 0 }));
      UW.ropes = (L.ropes || []).map(r => ({ ...r, burnt: false }));
      const f = L.ents.find(e => e.t === 'fountain'); if (f) UW.fountain = { x: f.x * TS + 8, y: (f.y + 1) * TS, tx: f.x, ty: f.y, full: false };
      UW.sand = L.sand || [];
    } else {
      for (const c of UW.list) { c.st = 'oil'; c.t = 0; c.age = 0; if (c.slick) c.gone = true; }
      UW.list = UW.list.filter(c => !c.gone); UW.cells = new Map(UW.list.map(c => [key(c.x, c.y), c]));
      for (const s of UW.sconces) { s.st = 'up'; s.t = 0; }
      for (const r of UW.ropes) if (r.burnt) { r.burnt = false; for (let y = r.y0; y <= r.y1; y++) ctx.cellSet(r.x, y, ctx.T.NET); }
      for (const m of UW.nests) if (!m.open) m.burn = 0;
    }
    UW.stalls = {}; UW.glint = null; UW.stallKey = null;
    for (const pp of ctx.players) { pp.uwBlind = 0; pp.uwBurnK = 0; }
    if (window.BK) Object.assign(window.BK, { underwell: () => UW, underwellHands: () => H });
  };
  H.on = () => !!UW;
  H.state = () => UW;

  /* ---------- THE OIL ---------- */
  const ignite = (c, why) => { if (!c || c.st !== 'oil') return false; c.st = 'fire'; c.t = OIL.burn; c.age = 0; UW.n.spread++; return true; };
  const neighbours = c => { const out = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const q = cellAt(c.x + dx, c.y + dy); if (q) out.push(q); } return out; };
  H.fireAt = (tx, ty) => { const c = cellAt(tx, ty); return !!(c && c.st === 'fire'); };
  /* light the oil under a falling torch or lamp: the cell it lands in, and `spread` cells either side at once (the lamp's splash) */
  const lightAt = (c, splash) => { if (!c) return; let n = 0; for (let dx = -splash; dx <= splash; dx++) n += ignite(cellAt(c.x + dx, c.y)) ? 1 : 0;
    if (n) { UW.n.lit++; ctx.sfx.fireWhoosh ? ctx.sfx.fireWhoosh() : ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(c.x * 16 + 8, c.y * 16 + 10, 12, ['#ff8a2a', '#ffd36b', '#c8281e'], 70, 0.6);
      const P = ctx.hero(); if (P && once('caught')) ctx.number(P.x, P.y - 34, 'THE OIL CATCHES', '#ff9a5c'); }
    else if (c.st === 'wet' && once('wetFall')) { const P = ctx.hero(); if (P) ctx.number(P.x, P.y - 34, 'WET OIL: IT WILL NOT CATCH', '#7ab8e8'); } };

  /* ---------- INTERACT (E): THE DRY FOUNTAIN ---------- */
  H.interact = P => {
    if (!UW || !UW.fountain) return false; const f = UW.fountain;
    if (Math.abs(f.x - P.x) > 26 || Math.abs(f.y - P.y) > 20 || f.full) return false;
    if (ctx.questGot() >= ctx.questN()) { f.full = true; for (const v of UW.vault) { v.open = true; for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) ctx.cellOpen(x, y); }
      const wt = ctx.wt && ctx.wt(); if (wt && wt.wells) wt.wells.push({ x: f.x, y: f.y, arena: false, deep: false, up: false, wind: 0, jar: 0, left: 0, fountain: true });   /* a spring from now on */
      ctx.sfx.splash && ctx.sfx.splash(); ctx.shake(3); ctx.burst(f.x, f.y - 16, 18, ['#7ab8e8', '#e8f4f8', '#3a7ab8'], 70, 0.8); ctx.number(f.x, f.y - 40, 'THE FOUNTAIN RUNS: ITS VAULT OPENS', '#8fd160'); }
    else ctx.number(f.x, f.y - 40, 'THE DRY FOUNTAIN WANTS THREE BRASS TAPS', '#ffd36b');
    return true;
  };

  /* ---------- THE POUR (src/well-town-hands.js asks pourables()): the near oil in front of you, burning or not ---------- */
  const pourCells = P => { if (!UW) return null; const face = P.face || 1, row = Math.floor((P.y - 1) / 16);
    let best = null, bd = 1e9;
    for (const c of UW.list) { if (c.vertical || c.st === 'wet' || c.st === 'spent') continue; if (c.y < row - 1 || c.y > row + 1) continue;
      const d = (c.x * 16 + 8 - P.x) * face; if (d < -8 || d > OIL.pourR) continue; if (d < bd) { bd = d; best = c; } }
    if (!best) return null; const out = []; for (let i = 0; i < OIL.pourCells; i++) { const q = cellAt(best.x + face * i, best.y); if (q && !q.vertical) out.push(q); } return out; };
  H.pourable = { aim: P => { const cs = pourCells(P); return cs && cs.length ? { x: cs[0].x * 16 + 8, y: cs[0].y * 16 + 12 } : null; },
    pour: P => { const cs = pourCells(P); if (!cs || !cs.length) return false; let out = 0; for (const c of cs) { if (c.st === 'fire') out++; c.st = 'wet'; c.t = OIL.back; } UW.n.wet += cs.length; UW.n.doused += out;
      ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(cs[0].x * 16 + 8, cs[0].y * 16 + 10, 12, ['#e8f4f8', '#9aa39a', '#7ab8e8'], 50, 0.8);
      ctx.number(P.x, P.y - 30, out ? 'THE OIL FIRE GOES OUT' : 'WET OIL: IT WILL NOT CATCH', out ? '#8fd160' : '#7ab8e8'); return true; } };

  /* ---------- THE BROOD WILL NOT CROSS FIRE (main.js asks before a creature of the desert's machines steps): the cell ahead burning ---------- */
  H.fear = (e, x, y) => { if (!UW || NO_FEAR.has(e.cnSkin) || (e.t !== 'scorpion' && e.t !== 'slinger')) return false; const tx = Math.floor(x / 16), ty = Math.floor((y - 1) / 16);
    const f = H.fireAt(tx, ty) || H.fireAt(tx, ty + 1); if (f && !e.uwFeared) { e.uwFeared = 1; if (once('fear')) { const P = ctx.hero(); if (P && Math.abs(P.x - e.x) < 220) ctx.number(e.x, e.y - 26, 'THE BROOD WILL NOT CROSS FIRE', '#ffd36b'); } } return f; };
  /* ---------- THE HEAT DRIVES A SANDWORM UNDER (main.js: the worm's world.flood): burning oil over its bed ---------- */
  H.heat = s => { if (!UW || !s.bed) return false; const x0 = Math.floor(s.bed[0] / 16) - 1, x1 = Math.floor(s.bed[1] / 16) + 1, ry = Math.floor((s.y - 1) / 16);
    for (const c of UW.list) if (c.st === 'fire' && c.x >= x0 && c.x <= x1 && c.y <= ry && c.y >= ry - OIL.heatRows) return true; return false; };
  H.flushed = e => { if (!UW) return; UW.n.flushed++; if (once('flush')) ctx.number(e.x, e.y - 26, 'THE HEAT DRIVES IT UNDER', '#ff9a5c'); };

  /* ---------- THE CAST ---------- */
  const groundRow = (x, y) => { const tx = Math.floor(x / 16); let ty = Math.floor((y - 2) / 16); for (let k = 0; k < 4; k++, ty++) if (ctx.standable(tx, ty + 1) && ctx.cellGet(tx, ty) === ctx.T.AIR) return ty; return null; };
  /* AN OIL SLICK where an oil scorpion struck or died: CAST.slick new cells of oil on the floor there (they join any oil beside them; gone on a respawn) */
  const slick = (x, y) => { const ty = groundRow(x, y); if (ty === null) return; const tx = Math.floor(x / 16); let n = 0;
    for (let dx = -1; dx <= CAST.slick - 2; dx++) { const cx = tx + dx; if (ctx.cellGet(cx, ty) !== ctx.T.AIR || !ctx.standable(cx, ty + 1)) continue; const k = key(cx, ty); const c0 = UW.cells.get(k);
      if (c0) { if (c0.st === 'spent' || c0.st === 'wet') { c0.st = 'oil'; c0.t = 0; } continue; }
      const c = { x: cx, y: ty, st: 'oil', t: 0, age: 0, vertical: false, seed: (cx * 7) % 31, slick: true }; UW.cells.set(k, c); UW.list.push(c); n++; }
    if (n) { UW.n.slicks++; ctx.burst(tx * 16 + 8, (ty + 1) * 16 - 2, 6, ['#141018', '#4a3e66', '#8a6ab8'], 30, 0.5); const P = ctx.hero(); if (P && Math.abs(P.x - x) < 200 && once('slick')) ctx.number(x, y - 26, 'IT LEAVES A SLICK OF OIL', '#b08ad8'); } };
  /* a blow from a desert machine's 'hit' event, before it is known to land (main.js updateDesertFoe) */
  H.onBlow = (e, v) => { if (!UW || !e.cnSkin) return; if (e.cnSkin === OIL_SKIN && v.what === 'sting' && !e.uwSlick) { e.uwSlick = 1; slick((v.box[0] + v.box[1]) / 2, e.y); } };
  /* ...and when it lands (landed: it took health off the hero) */
  H.onHit = (e, v, landed, P) => { if (!UW || !e.cnSkin || !landed || !P) return;
    if (e.cnSkin === DUST_SKIN && v.what === 'claw') { P.uwBlind = CAST.blind; UW.n.blinds++; if (once('blind')) ctx.number(P.x, P.y - 30, 'GRIT IN YOUR EYES', '#c8b48a'); }
    if (e.cnSkin === THIRST_SKIN && v.what === 'sting') { const sk = P.skin; if (sk && sk.sips > 0) { sk.sips--; UW.n.drunk++; ctx.burst(P.x, P.y - 14, 6, ['#7ab8e8', '#e8f4f8'], 40, 0.4); ctx.number(P.x, P.y - 30, 'IT DRINKS FROM YOUR SKIN', '#7ab8e8'); } }
    if (e.cnSkin === SPIT_SKIN && v.stone) { venomOn(P, 1, VENOM); UW.n.spits++; if (once('spit')) ctx.number(P.x, P.y - 30, 'VENOM: YOUR STAMINA COMES BACK SLOWER', '#8fe04a'); } };
  H.onDeath = e => { if (!UW || e.cnSkin !== OIL_SKIN) return; slick(e.x, e.y); };
  /* THE THIRSTY SCORPION: it smells your skin from far off and comes for it (before its machine steps) */
  H.preStep = (e, s, w, dt) => { if (!UW || e.cnSkin !== THIRST_SKIN || s.mode !== 'walk') return; const P = ctx.hero(); if (!P || P.dead || !(P.skin && P.skin.sips > 0)) return;
    const d = P.x - s.x; if (Math.abs(d) > CAST.thirstSight || Math.abs(d) < 18 || Math.abs(P.y - s.y) > 48) return; s.face = Math.sign(d); s.x += Math.sign(d) * CAST.thirstV * dt;
    if (once('thirst') && Math.abs(d) < 200) ctx.number(e.x, e.y - 26, 'IT SMELLS THE WATER IN YOUR SKIN', '#7ab8e8'); };

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!UW) return; UW.clock += dt; const hb = ctx.attackBox(), P0 = ctx.hero(), TS = ctx.TS;
    /* THE OIL's clock */
    for (const c of UW.list) {
      if (c.st === 'fire') { c.age += dt; c.t -= dt;
        if (c.age >= OIL.spread) for (const q of neighbours(c)) ignite(q);
        if (c.t <= 0) { c.st = 'spent'; c.t = OIL.back; } }
      else if (c.st === 'wet' || c.st === 'spent') { c.t -= dt; if (c.t <= 0) { c.st = 'oil'; c.t = 0; } } }
    /* THE WALL TORCHES: a blow on a lit one knocks it down into the oil */
    for (const s of UW.sconces) {
      if (s.st === 'up' && hb && ctx.overlap(hb, { l: s.x * TS - 4, r: s.x * TS + 20, t: s.y * TS - 6, b: (s.y + 3) * TS })) { s.st = 'fall'; s.t = OIL.torchFall; ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(s.x * TS + 8, s.y * TS + 4, ctx.hero().face || 1, 4); }
      else if (s.st === 'fall') { s.t -= dt; if (s.t <= 0) { s.st = 'down'; s.t = OIL.relight; if (s.below) lightAt(s.below, 0); else ctx.dust(s.x * TS + 8, (s.y + 2) * TS, 4); } }
      else if (s.st === 'down') { s.t -= dt; if (s.t <= 0) { s.st = 'up'; s.t = 0; } } }
    /* THE GREAT LAMP: a blow on its chain (or the lamp) and it comes down into the hall's oil */
    const lp = UW.lamp; if (lp) {
      if (lp.st === 'up') { lp.swing *= Math.pow(0.2, dt); if (hb && ctx.overlap(hb, { l: lp.x * TS - 26, r: lp.x * TS + 42, t: lp.top * TS, b: (lp.y + 1) * TS + 4 })) { lp.st = 'fall'; lp.t = 0; ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(lp.x * TS + 8, lp.y * TS, 1, 6); ctx.number(lp.x * TS + 8, lp.y * TS - 20, 'THE CHAIN GIVES', '#ffd36b'); } }
      else if (lp.st === 'fall') { lp.t += dt; const k = Math.min(1, lp.t / OIL.lampFall); lp.dy = (lp.floor - lp.y) * k * k;
        if (k >= 1) { lp.st = 'down'; lp.dy = lp.floor - lp.y; UW.n.lamp++; ctx.shake(6); ctx.sfx.heavy && ctx.sfx.heavy(); lightAt(cellAt(lp.x, lp.floor) || UW.list.find(c => c.x === lp.x && !c.vertical), 3);
          ctx.number(lp.x * TS + 8, lp.floor * TS - 30, 'THE GREAT LAMP FALLS: THE HALL BURNS', '#ff9a5c'); } } }
    /* THE NESTS: fire against one and it burns away */
    for (const m of UW.nests) { if (m.open) continue;
      let hot = false; for (let y = m.y0; y <= m.y1 + 1 && !hot; y++) for (let x = m.x0 - 1; x <= m.x1 + 1 && !hot; x++) if (H.fireAt(x, y)) hot = true;
      if (hot || m.burn > 0) { if (m.burn === 0) { ctx.sfx.fireWhoosh ? ctx.sfx.fireWhoosh() : ctx.sfx.hiss && ctx.sfx.hiss(); } m.burn += dt;
        if (m.burn >= OIL.nestBurn) { m.open = true; UW.n.nests++; for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) ctx.cellOpen(x, y);
          ctx.burst((m.x0 + m.x1 + 1) * 8, (m.y0 + m.y1 + 1) * 8, 20, ['#ff8a2a', '#e8dcb0', '#1a0e08'], 80, 0.8); const P = ctx.hero(); if (P) ctx.number(P.x, P.y - 34, 'THE NEST BURNS AWAY', '#8fd160'); } } }
    /* A DRIP over burning oil boils dry; a ROPE whose foot is in the fire burns to ash */
    const wt = ctx.wt && ctx.wt();
    if (wt && wt.wells) for (const w of wt.wells) { if (!w.jar || w.left <= 0) continue; const tx = Math.floor(w.x / 16), ty = Math.floor((w.y - 1) / 16);
      if (H.fireAt(tx, ty) || H.fireAt(tx - 1, ty) || H.fireAt(tx + 1, ty)) { w.left = 0; w.boiled = true; UW.n.boiled++; ctx.burst(w.x, w.y - 12, 10, ['#e8f4f8', '#c8d0d8'], 40, 0.8); const P = ctx.hero(); if (P) ctx.number(P.x, P.y - 34, 'THE FIRE BOILS THE DRIP DRY', '#ff9a5c'); } }
    for (const r of UW.ropes) { if (r.burnt || !H.fireAt(r.x, r.y1)) continue; r.burnt = true; UW.n.ropes++;
      for (let y = r.y0; y <= r.y1; y++) { ctx.cellSet(r.x, y, ctx.T.AIR); if (y % 3 === 0) ctx.burst(r.x * 16 + 8, y * 16 + 8, 3, ['#ff8a2a', '#3a2a20'], 30, 0.6); }
      const P = ctx.hero(); if (P) ctx.number(P.x, P.y - 34, 'THE ROPE BURNS TO ASH', '#ff9a5c'); }
    /* A FIRE SCORPION's burning patch lights any oil it touches */
    for (const p of (ctx.patches ? ctx.patches() : [])) { const tx = Math.floor(p.x / 16), ty = Math.round(p.y / 16) - 1; let n = 0; for (let dx = -1; dx <= 1; dx++) n += ignite(cellAt(tx + dx, ty)) ? 1 : 0; if (n) { UW.n.patchLit++; if (once('patchLit')) ctx.number(p.x, p.y - 28, 'ITS FIRE TAKES THE OIL', '#ff9a5c'); } }
    /* THE FIRE ON HEROES (a tick, unblockable) and on creatures standing in it (the fire scorpion is at home in it) */
    for (const pp of ctx.players) { if (pp.dead) continue; pp.uwBlind = Math.max(0, (pp.uwBlind || 0) - dt); pp.uwBurnK = Math.max(0, (pp.uwBurnK || 0) - dt);
      const tx = Math.floor(pp.x / 16), ty = Math.floor((pp.y - 1) / 16); const lit = H.fireAt(tx, ty) || H.fireAt(Math.floor((pp.x - 5) / 16), ty) || H.fireAt(Math.floor((pp.x + 5) / 16), ty);
      if (lit && pp.uwBurnK <= 0) { pp.uwBurnK = OIL.tick; UW.n.burns++; ctx.asPlayer(pp, () => ctx.hurtHero(ctx.hero().x, OIL.dmg, { unblockable: true, noKnock: true, name: 'THE BURNING OIL' })); if (once('burnt')) ctx.number(pp.x, pp.y - 30, 'THE OIL BURNS: GET OUT OF IT', '#ff9a5c'); } }
    for (const e of ctx.enemies()) { if (!e.alive || !e.st || e.cnSkin === 'firescorpion' || e.t === 'sandworm' || e.boss) continue; e.uwBurnK = Math.max(0, (e.uwBurnK || 0) - dt);
      const tx = Math.floor(e.x / 16), ty = Math.floor((e.y - 1) / 16); if (e.uwBurnK <= 0 && H.fireAt(tx, ty)) { e.uwBurnK = OIL.tick; UW.n.foeBurns++; ctx.hurtFoe(e, OIL.foeDmg); } }
    /* THE FIRST LOOK at a thing: a line once (what it is, never the trick) */
    if (P0 && !P0.dead) { const near = (x, y, r) => Math.abs(x - P0.x) < r && Math.abs(y - P0.y) < 40;
      if (UW.list.some(c => c.st === 'oil' && !c.vertical && near(c.x * 16 + 8, (c.y + 1) * 16, 40)) && once('oil')) ctx.number(P0.x, P0.y - 34, 'LAMP OIL ON THE FLOOR: IT BURNS', '#b08ad8');
      for (const s of UW.sconces) if (s.st === 'up' && near(s.x * 16 + 8, (s.y + 2) * 16, 56) && once('torch')) ctx.number(P0.x, P0.y - 34, 'A WALL TORCH OVER THE OIL', '#ffd36b'); }
    stall(P0, dt);
  };

  /* ---------- THE GLINT AND THE NUDGE (the route list: src/stuck-spots.js STUCK_HANDS.underwell) ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'nest') { const m = UW.nests.find(q => q.id === id); return m ? (m.open ? 'open' : 'shut') : ''; }
    if (kind === 'rope') { const r = UW.ropes.find(q => q.id === id); return r ? (r.burnt ? 'burnt' : 'hung') : ''; }
    if (kind === 'lamp') return UW.lamp ? UW.lamp.st : '';
    if (kind === 'torch') { const s = UW.sconces.find(q => q.id === id); return s ? s.st : ''; }
    if (kind === 'fire') { const f = (ctx.wt && ctx.wt() || {}).fires || []; const q = f.find(z => z.x0 === +id); return q ? (q.lit ? 'lit' : 'out') : ''; }
    if (kind === 'skin') { const P = ctx.hero(); return P && P.skin && P.skin.sips > 0 ? 'some' : 'empty'; }
    return ''; };
  H.handsState = n => (UW ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const TS = ctx.TS;
    const r = resolve('underwell', Math.floor(P.x / TS), Math.floor((P.y - 1) / TS), { TS, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { UW.glint = null; UW.stallKey = null; return; } const t = r.targets[0]; UW.glint = { key: r.key, x: t.x, y: t.y };
    const C = UW.stalls[r.key] = UW.stalls[r.key] || newStall(); if (r.key !== UW.stallKey) { UW.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, UW.clock, false)) { UW.n.nudges++; UW.lastNudge = r.line; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- DRAWING (greybox: src/redraw/underwell_art.js) ---------- */
  H.drawWorld = (g, cx, cy, time) => {
    if (!UW) return; const R = Math.round, vw = ctx.VW(), vh = ctx.VH(), TS = ctx.TS, inX = (x, m = 40) => x > cx - m && x < cx + vw + m;
    for (const [x0, x1, y] of UW.sand) if (inX(x0 * TS, (x1 - x0) * TS + 40)) UWA.drawSand(g, R(x0 * TS - cx), R(y * TS - cy), (x1 - x0 + 1) * TS, time);
    for (const [x0, x1, y] of UW.L.seeps || []) if (x1 - x0 > 20 && ctx.cellGet(x0 + 1, y - 1) !== ctx.T.AIR && ctx.cellGet(x0 + 1, y + 1) !== ctx.T.AIR && inX(x0 * TS, (x1 - x0) * TS + 40)) UWA.drawGutter(g, R((x0 + 1) * TS - cx), R(y * TS - cy), (x1 - x0 - 1) * TS);   /* a gutter's grate (a slot in the rock) */
    for (const c of UW.list) { const x = c.x * TS; if (!inX(x)) continue; UWA.drawCell(g, R(x - cx), R(c.y * TS - cy), c.st, c.st === 'fire' ? c.t / OIL.burn : 0, time, c.vertical, c.seed); }
    for (const m of UW.nests) { if (m.open) continue; const x = m.x0 * TS; if (!inX(x)) continue; UWA.drawNest(g, R(x - cx), R(m.y0 * TS - cy), (m.x1 - m.x0 + 1) * TS, (m.y1 - m.y0 + 1) * TS, Math.min(1, m.burn / OIL.nestBurn), time); }
    for (const s of UW.sconces) { const x = s.x * TS + 8; if (!inX(x)) continue; const fallDy = s.st === 'fall' && s.below ? ((s.below.y - s.y) * TS) * (1 - s.t / OIL.torchFall) : 0;
      UWA.drawSconce(g, R(x - cx), R(s.y * TS - cy), s.st === 'down' ? 'down' : 'up', s.st === 'down' ? 1 - s.t / OIL.relight : 1, time, fallDy); }
    const lp = UW.lamp; if (lp && inX(lp.x * TS, 60)) UWA.drawLamp(g, R(lp.x * TS + 8 - cx), R(lp.top * TS - cy), R((lp.y + 1) * TS + (lp.dy || 0) - cy), lp.st, time, lp.st === 'up' ? Math.sin(time * 0.9) * 2 : 0);
    const f = UW.fountain; if (f && inX(f.x)) UWA.drawFountain(g, R(f.x - cx), R(f.y - cy), f.full, ctx.questGot(), time);
    /* the dust scorpions' grit while their claw is up (the tell: a yellow mark, and the grit) */
    for (const e of ctx.enemies()) if (e.alive && e.cnSkin === DUST_SKIN && e.st && e.st.mode === 'clawTell' && inX(e.x)) { g.fillStyle = '#c8b48a'; for (let i = 0; i < 6; i++) g.fillRect(R(e.x - cx + (e.face || 1) * (6 + ((time * 40 + i * 5) % 18))), R(e.y - 6 - (i % 3) * 3 - cy), 2, 2); }
    if (UW.glint) drawGlint(g, R(UW.glint.x - cx), R(UW.glint.y - 18 - cy), vw, vh, time);
  };
  /* over everything: the grit in your eyes */
  H.drawOver = (g, cx, cy) => { if (!UW) return; const P = ctx.hero(); if (P && P.uwBlind > 0) UWA.drawBlind(g, P.x - cx, P.y - 14 - cy, ctx.VW(), ctx.VH(), Math.min(1, P.uwBlind / CAST.blind)); };
  H.read = () => UW && { n: { ...UW.n }, cells: { oil: UW.list.filter(c => c.st === 'oil').length, fire: UW.list.filter(c => c.st === 'fire').length, wet: UW.list.filter(c => c.st === 'wet').length, spent: UW.list.filter(c => c.st === 'spent').length },
    nests: UW.nests.map(m => ({ id: m.id, open: m.open })), ropes: UW.ropes.map(r => ({ id: r.id, burnt: r.burnt })), sconces: UW.sconces.map(s => ({ id: s.id, st: s.st })), lamp: UW.lamp && UW.lamp.st,
    fountain: UW.fountain && UW.fountain.full, glint: UW.glint && UW.glint.key, lastNudge: UW.lastNudge || null };
  return H;
}
