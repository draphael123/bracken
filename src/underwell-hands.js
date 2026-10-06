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
import * as UWD from './redraw/underwell_dress.js';
import * as CT from './carry-throw.js';

/* THE OIL: rehang = s before a spare rope is lowered where one burnt (claude/underwell fix pass: no softlock, a cost); burn = s a lit cell on a floor burns (burnDeep: a cell in a gutter's slot, deep oil - it burns long, so the worms under it stay down while you cross); spread = s before it lights the cells beside it; back = s before wet oil dries / spent oil seeps back; tick/dmg =
   the fire on a hero standing in it (unblockable); foeDmg on a creature in it; nestBurn = s a nest takes to burn away; relight = s before a torch's
   bracket has a flame again; pourCells = how many cells one sip wets */
export const OIL = { rehang: 30, burn: 6, burnDeep: 16, spread: 0.04, back: 25, tick: 0.5, dmg: 13, foeDmg: 14, nestBurn: 1.0, relight: 12, pourR: 48, pourCells: 3, lampFall: 0.6, torchFall: 0.35, heatRows: 12 };
/* THE CAST's numbers: the thirsty scorpion's pull (px/s, sight px), the dust's blindness (s), a slick's width in cells */
/* A NEST under a blade: a brood scorpion out of it every `spill` s, at most `max` of them alive from one nest */
export const NEST = { spill: 0.6, max: 4, spray: 10 };   /* spray: what the nest's venom does to the one hacking at it (unblockable, a stack of venom) */
/* THE TORCH IN YOUR HAND (claude/underwell2, Daniel 10-06: "TORCHES = PICK UP + THROW"). E takes a torch out of its cresset (takeR px across, the cresset up to reachUp px
   over your feet); carried, it lights your way (light px) and THE BROOD SHY FROM IT (they will not come within shyR px; they back off at shyV px/s); ATTACK throws it
   in the told arc (src/carry-throw.js: UP lobs, DOWN tosses short) - where it lands it lights the oil; it lies burning lie s (E takes it up again) and in oil it catches
   in catchT s; a blow knocks it from your hand (it lies at your feet); swimming puts it out; it needs a hand, so no climbing with it (E sets it down).
   On a foe: hit, x fireMul on the drowned dead, x thiefMul on an oil thief (their coats are soaked) */
export const TORCH = { takeR: 22, reachUp: 66, reachDown: 10, lie: 8, catchT: 0.6, shyR: 40, shyV: 46, light: 78, hit: 14, fireMul: 3, thiefMul: 2 };
/* THE OIL THIEF's FLASK (claude/underwell2): it breaks where it lands - slick cells of lamp oil (they join any oil beside them, gone on a respawn); a direct hit splashes
   you for dmg (no shield keeps oil off you: the red !! over his head says so - get out from under it). His LANTERN: when he falls it falls, and lights the oil he stands in */
export const FLASK = { g: 700, cells: 5, dmg: 6, hitR: 12 };
export const CAST = { thirstV: 60, thirstSight: 260, blind: 2.2, slick: 3, smotherR: 30, smotherEvery: 0.45, smotherAge: 0.7 };   /* smotherR: px of the dust scorpion's cloud ahead of it; smotherEvery: s between two cells of fire it chokes */
export const OIL_SKIN = 'oilscorpion', DUST_SKIN = 'dustscorpion', THIRST_SKIN = 'thirstscorpion', SPIT_SKIN = 'spitscorpion';
export const THIEF_SKIN = 'oilthief', BAT_SKIN = 'cisternbat', DROWNED_SKIN = 'drowneddead';   /* (claude/underwell2) the three new reskins: the sapper's, the bat's and the zombie's machines */
const NO_FEAR = new Set(['firescorpion']);
/* (claude/underwell2, Daniel 10-06: "oil drawn floating on the wall sides") WHICH SIDE A VERTICAL RUN OF OIL IS DRAWN ON: a wall streak lies flush on the rock beside it
   (-1: the rock is to its left, 1: to its right); a standpipe (L.lines' 4th field 'pipe') stands free (0). tools/underwell-aloft.mjs reads the same answer */
export const oilSide = (get, T, x, y, pipe) => (pipe ? 0 : get(x - 1, y) === T.SOLID ? -1 : get(x + 1, y) === T.SOLID ? 1 : 0);   /* the fire scorpion walks through fire */

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
        n: { lit: 0, lamp: 0, spread: 0, wet: 0, doused: 0, nests: 0, boiled: 0, ropes: 0, burns: 0, foeBurns: 0, slicks: 0, patchLit: 0, blinds: 0, smothered: 0, drunk: 0, spits: 0, flushed: 0, nudges: 0 } };
      const add = (x, y, vertical, pipe) => { const k = key(x, y); if (UW.cells.has(k)) return; const c = { x, y, st: 'oil', t: 0, age: 0, vertical: !!vertical, pipe: !!pipe, side: vertical ? oilSide(ctx.cellGet, ctx.T, x, y, pipe) : 0, seed: (x * 7 + y * 13) % 31, deep: !vertical && ctx.cellGet(x, y - 1) === ctx.T.SOLID && ctx.cellGet(x, y + 1) === ctx.T.SOLID }; UW.cells.set(k, c); UW.list.push(c); };
      for (const [x0, x1, y] of L.seeps || []) for (let x = x0; x <= x1; x++) add(x, y, false);
      /* (claude/underwell2) OIL FLOATS ON THE WATER: a floor cell under standing water is drawn on the water's surface (fl: px it is lifted) */
      for (const c of UW.list) { const p = (L.pools || []).find(q => c.x * TS + 8 >= q.x0 && c.x * TS + 8 <= q.x1 && q.y > c.y * TS && q.y < (c.y + 1) * TS + 2); if (p) c.fl = Math.round((c.y + 1) * TS - (p.y + 3)); }
      for (const [x, y0, y1, kind] of L.lines || []) for (let y = y0; y <= y1; y++) add(x, y, true, kind === 'pipe');
      UW.sconces = L.ents.filter(e => e.t === 'sconce').map(e => { let below = null; for (let y = e.y; y < L.H; y++) { const c = UW.cells.get(key(e.x, y)); if (c) { below = c; break; } } let ceil = e.y - 1; while (ceil > 0 && ctx.cellGet(e.x, ceil) !== ctx.T.SOLID) ceil--; return { id: e.id, x: e.x, y: e.y, st: 'up', t: 0, below, ceil }; });
      const lp = L.ents.find(e => e.t === 'greatlamp'); if (lp) { let fy = lp.y; while (fy < L.H - 1 && ctx.cellGet(lp.x, fy + 1) === ctx.T.AIR) fy++; UW.lamp = { x: lp.x, top: lp.top || lp.y - 6, y: lp.y, floor: fy, st: 'up', t: 0, swing: 0 }; }
      UW.nests = (L.nests || []).map(m => ({ ...m, open: false, burn: 0 }));
      UW.ropes = (L.ropes || []).map(r => ({ ...r, burnt: false }));
      const f = L.ents.find(e => e.t === 'fountain'); if (f) UW.fountain = { x: f.x * TS + 8, y: (f.y + 1) * TS, tx: f.x, ty: f.y, full: false };
      UW.sand = L.sand || [];
      /* EVERY ROPE IN THE LEVEL (claude/underwell2: the firebreak ropes and the Queen's ladders): its column and rows, for the lit edge drawn over the dark */
      UW.ropeRuns = []; for (let x = 0; x < L.W; x++) { let y0 = -1; for (let y = 0; y <= L.H; y++) { const net = y < L.H && ctx.cellGet(x, y) === ctx.T.NET; if (net && y0 < 0) y0 = y; if (!net && y0 >= 0) { UW.ropeRuns.push({ x, y0, y1: y - 1 }); y0 = -1; } } }
    } else {
      for (const c of UW.list) { c.st = 'oil'; c.t = 0; c.age = 0; if (c.slick) c.gone = true; }
      UW.list = UW.list.filter(c => !c.gone); UW.cells = new Map(UW.list.map(c => [key(c.x, c.y), c]));
      for (const s of UW.sconces) { s.st = 'up'; s.t = 0; }
      { let hung = 0; for (const r of UW.ropes) if (r.burnt) { r.burnt = false; hung++; for (let y = r.y0; y <= r.y1; y++) ctx.cellSet(r.x, y, ctx.T.NET); } if (hung && ctx.retile) ctx.retile(); }   /* (claude/underwell2, Daniel 10-06 "a rope that isn't drawn": a cell set back to rope had no picture until the tiles were resolved again) */
      for (const m of UW.nests) if (!m.open) m.burn = 0;
    }
    UW.torches = []; for (const pp of ctx.players) if (pp.carry && pp.carry.t === 'uwtorch') pp.carry = null;   /* (a respawn: the torch in your hand is gone, the cressets are lit again) */
    UW.stalls = {}; UW.glint = null; UW.stallKey = null;
    for (const pp of ctx.players) { pp.uwBlind = 0; pp.uwBurnK = 0; }
    if (window.BK) Object.assign(window.BK, { underwell: () => UW, underwellHands: () => H });
    /* THE PHONE (src/touch-interact.js): TAKE at a torch (ahead of the skin's POUR), and THROW on the context button while you carry one (the attack button throws too) */
    if (window.BK && window.BK.touchVerbs && !window.BK.touchVerbs.includes(H.touchVerb)) window.BK.touchVerbs.unshift(H.touchVerb);
    if (window.BK && window.BK.touchCtx && !window.BK.touchCtx.includes(H.touchCtx)) window.BK.touchCtx.unshift(H.touchCtx);
  };
  H.on = () => !!UW;
  H.state = () => UW;

  /* ---------- THE OIL ---------- */
  const ignite = (c, why) => { if (!c || c.st !== 'oil') return false; c.st = 'fire'; c.t = c.deep ? OIL.burnDeep : OIL.burn; c.age = 0; UW.n.spread++; return true; };
  const neighbours = c => { const out = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const q = cellAt(c.x + dx, c.y + dy); if (q) out.push(q); } return out; };
  H.fireAt = (tx, ty) => { const c = cellAt(tx, ty); return !!(c && c.st === 'fire'); };
  /* light the oil under a falling torch or lamp: the cell it lands in, and `spread` cells either side at once (the lamp's splash) */
  const lightAt = (c, splash) => { if (!c) return; let n = 0; for (let dx = -splash; dx <= splash; dx++) n += ignite(cellAt(c.x + dx, c.y)) ? 1 : 0;
    if (n) { UW.n.lit++; ctx.sfx.fireWhoosh ? ctx.sfx.fireWhoosh() : ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(c.x * 16 + 8, c.y * 16 + 10, 12, ['#ff8a2a', '#ffd36b', '#c8281e'], 70, 0.6);
      const P = ctx.hero(); if (P && once('caught')) ctx.number(P.x, P.y - 34, 'THE OIL CATCHES', '#ff9a5c'); }
    else if (c.st === 'wet' && once('wetFall')) { const P = ctx.hero(); if (P) ctx.number(P.x, P.y - 34, 'WET OIL: IT WILL NOT CATCH', '#7ab8e8'); } };

  /* ---------- INTERACT (E): THE DRY FOUNTAIN ---------- */
  H.interact = P => {
    if (!UW) return false;
    if (H.torchInteract(P)) return true;
    if (!UW.fountain) return false; const f = UW.fountain;
    if (Math.abs(f.x - P.x) > 26 || Math.abs(f.y - P.y) > 20 || f.full) return false;
    if (ctx.questGot() >= ctx.questN()) { f.full = true; for (const v of UW.vault) { v.open = true; for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) ctx.cellOpen(x, y); }
      const wt = ctx.wt && ctx.wt(); if (wt && wt.wells) wt.wells.push({ x: f.x, y: f.y, arena: false, deep: false, up: false, wind: 0, jar: 0, left: 0, fountain: true });   /* a spring from now on */
      ctx.sfx.splash && ctx.sfx.splash(); ctx.shake(3); ctx.burst(f.x, f.y - 16, 18, ['#7ab8e8', '#e8f4f8', '#3a7ab8'], 70, 0.8); ctx.number(f.x, f.y - 40, 'THE FOUNTAIN RUNS: ITS VAULT OPENS', '#8fd160'); }
    else ctx.number(f.x, f.y - 40, 'THE DRY FOUNTAIN WANTS THREE BRASS TAPS', '#ffd36b');
    return true;
  };

  /* ---------- THE TORCH IN YOUR HAND (claude/underwell2): take it (E), carry it (a light; the brood shy from it), throw it (ATTACK, the told arc) ---------- */
  const isTorch = q => !!(q && q.t === 'uwtorch');
  const held = P => (P && isTorch(P.carry) ? P.carry : null);
  const handAt = P => ({ x: P.x + (P.face || 1) * 6, y: P.y - 20 });
  const solidPx = (px, py, falling) => { const tx = Math.floor(px / 16), ty = Math.floor(py / 16); const t = ctx.cellGet(tx, ty);
    if (t === ctx.T.SOLID) return true; if (falling && t === ctx.T.ONEWAY && py - ty * 16 < 6) return true; return false; };
  const nestAtPx = (px, py) => UW.nests.find(m => !m.open && px >= m.x0 * 16 - 2 && px <= (m.x1 + 1) * 16 + 2 && py >= m.y0 * 16 && py <= (m.y1 + 1) * 16);
  const foeAtPx = (px, py) => ctx.enemies().find(e => e.alive && !e.harmless && !e.boss && !(e.t === 'zombie' && (e.mode === 'buried' || e.mode === 'riseTell')) && Math.abs(e.x - px) < (e.w || 10) / 2 + 4 && py > e.y - (e.h || 14) - 4 && py < e.y + 2);
  const inWater = (px, py) => (ctx.L.pools || []).some(p => px >= p.x0 && px <= p.x1 && py >= p.y && py <= (p.bottom || p.y + 64));
  /* the told arc from the hand, the way it would fly now (stepTorches steps the same numbers: src/carry-throw.js stepArc) */
  H.arcOf = P => { const h = handAt(P), v = CT.launchOf('torch', P, ctx.keys ? ctx.keys() : {}); return CT.predictArc('torch', h.x, h.y, v, solidPx, { stopAt: (x, y) => nestAtPx(x, y) || foeAtPx(x, y) || null }); };
  const newTorch = (P, from) => ({ t: 'uwtorch', thrKind: 'torch', state: 'held', holder: P, x: P.x, y: P.y - 20, vx: 0, vy: 0, lieT: 0, catchT: 0, noClimb: true, from,
    launch: PP => CT.launchOf('torch', PP, ctx.keys ? ctx.keys() : {}) });
  const takeable = P => { for (const q of UW.torches) if (q.state === 'lie' && Math.abs(q.x - P.x) <= TORCH.takeR && Math.abs(q.y - P.y) <= 18) return { lying: q };
    for (const sc of UW.sconces) { if (sc.st !== 'up') continue; const sx = sc.x * 16 + 8, sy = sc.y * 16; if (Math.abs(sx - P.x) <= TORCH.takeR && P.y - sy <= TORCH.reachUp && P.y - sy >= -TORCH.reachDown) return { sconce: sc }; }
    return null; };
  H.takeable = P => (UW ? takeable(P) : null);
  const groundY = (x, y) => { const tx = Math.floor(x / 16); let ty = Math.floor((y - 4) / 16); for (let k = 0; k < 8; k++, ty++) if (ctx.standable(tx, ty + 1) && ctx.cellGet(tx, ty) !== ctx.T.SOLID) return (ty + 1) * 16; return null; };
  const cellUnder = q => { const tx = Math.floor(q.x / 16), ty = Math.floor((q.y - 1) / 16); return cellAt(tx, ty) || null; };
  /* E: set a carried torch down; take a lying one up; take one out of its cresset */
  H.torchInteract = P => {
    const h = held(P); if (h) { P.carry = null; h.state = 'lie'; h.holder = null; h.x = P.x + (P.face || 1) * 8; const gy = groundY(h.x, P.y); h.y = gy === null ? P.y : gy; h.lieT = TORCH.lie; h.catchT = TORCH.catchT; UW.n.setDown = (UW.n.setDown || 0) + 1;
      ctx.sfx.clank && ctx.sfx.clank(); const c = cellUnder(h); if (c && c.st === 'oil') ctx.number(P.x, P.y - 34, 'THE TORCH IS IN THE OIL: TAKE IT UP OR GET OUT', '#ff9a5c'); return true; }
    if (P.carry || P.dead) return false; const tk = takeable(P); if (!tk) return false;
    let q = tk.lying; if (q) { q.state = 'held'; q.holder = P; q.hurtWas = P.hurt > 0; }
    else { q = newTorch(P, tk.sconce.id); q.hurtWas = P.hurt > 0; UW.torches.push(q); tk.sconce.st = 'taken'; tk.sconce.t = OIL.relight; }
    P.carry = q; UW.n.taken = (UW.n.taken || 0) + 1; ctx.sfx.clank && ctx.sfx.clank(); ctx.burst(P.x, P.y - 22, 6, ['#ffd36b', '#ff9a5c'], 30, 0.4);
    if (once('takeTorch')) ctx.number(P.x, P.y - 34, 'ATTACK THROWS IT: UP LOBS IT, DOWN TOSSES IT SHORT', '#ffd36b');
    return true; };
  /* a torch reaches what it falls on: the oil there catches, a nest catches, a foe is struck (and fire-hurt) */
  const strikeFoe = (q, e) => { const mul = e.cnSkin === DROWNED_SKIN ? TORCH.fireMul : e.cnSkin === THIEF_SKIN ? TORCH.thiefMul : 1; ctx.hurtFoe(e, TORCH.hit * mul); UW.n.torchHits = (UW.n.torchHits || 0) + 1;
    ctx.burst(e.x, e.y - (e.h || 14) / 2, 10, ['#ff8a2a', '#ffd36b', '#c8281e'], 60, 0.5); ctx.sparks(e.x, e.y - 8, Math.sign(q.vx) || 1, 5);
    if (mul > 1 && once('fireTakes' + e.cnSkin)) ctx.number(e.x, e.y - 34, e.cnSkin === DROWNED_SKIN ? 'FIRE TAKES THE DROWNED DEAD' : 'THEIR COATS ARE SOAKED IN OIL: FIRE TAKES THEM', '#ff9a5c'); };
  const landTorch = (q, why) => { q.vx = 0; q.vy = 0; const gy = groundY(q.x, q.y); if (gy !== null) q.y = gy; q.state = 'lie'; q.lieT = TORCH.lie; q.catchT = 0.05; UW.n.torchLand = (UW.n.torchLand || 0) + 1;
    ctx.sfx.clank && ctx.sfx.clank(); ctx.burst(q.x, q.y - 4, 6, ['#ffd36b', '#ff8a2a'], 40, 0.4); UW.lastLand = { x: Math.round(q.x), y: Math.round(q.y), why }; };
  const stepTorches = dt => {
    for (const q of UW.torches) {
      if (q.state === 'held') { const P = q.holder;
        if (!P || P.dead || P.carry !== q) { if (P && P.carry === q) P.carry = null; if (P && P.dead) { q.state = 'gone'; continue; } q.state = 'lie'; q.lieT = TORCH.lie; q.catchT = TORCH.catchT; q.holder = null; continue; }
        const h = handAt(P); q.x = h.x; q.y = h.y;
        if (P.swim) { P.carry = null; q.state = 'gone'; ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(q.x, q.y, 8, ['#e8f4f8', '#9aa39a'], 40, 0.5); ctx.number(P.x, P.y - 34, 'THE WATER PUTS YOUR TORCH OUT', '#7ab8e8'); continue; }
        if (P.hurt > 0 && !q.hurtWas) { P.carry = null; q.state = 'lie'; q.holder = null; q.x = P.x; const gy = groundY(P.x, P.y); q.y = gy === null ? P.y : gy; q.lieT = TORCH.lie; q.catchT = TORCH.catchT; q.hurtWas = true; UW.n.knocked = (UW.n.knocked || 0) + 1;
          ctx.number(P.x, P.y - 34, 'THE TORCH FALLS FROM YOUR HAND', '#ff9a5c'); continue; }
        q.hurtWas = P.hurt > 0;
        { const k = ctx.keys ? ctx.keys() : null; if (k && k.up && ctx.cellGet(Math.floor(P.x / 16), Math.floor((P.y - 8) / 16)) === ctx.T.NET && once('climbTorch')) ctx.number(P.x, P.y - 34, 'A TORCH NEEDS YOUR HAND: THROW IT OR SET IT DOWN', '#ffd36b'); }
        continue; }
      if (q.state === 'fly') { UW.n.thrown = (UW.n.thrown || 0) + (q.counted ? 0 : 1); q.counted = true; q.holder = null; const px = q.x, py = q.y; CT.stepArc(q, dt, CT.KINDS.torch.g);
        const m = nestAtPx(q.x, q.y); if (m) { m.burn = Math.max(m.burn, 0.01); UW.n.nestTorch = (UW.n.nestTorch || 0) + 1; ctx.burst(q.x, q.y, 12, ['#ff8a2a', '#ffd36b'], 60, 0.5); if (once('nestTorch')) ctx.number(q.x, q.y - 30, 'THE TORCH SETS THE NEST ALIGHT', '#ff9a5c'); q.state = 'gone'; UW.lastLand = { x: Math.round(q.x), y: Math.round(q.y), why: 'nest' }; continue; }
        const e = foeAtPx(q.x, q.y); if (e) { strikeFoe(q, e); q.x = px; landTorch(q, 'foe'); continue; }
        const v = cellAt(Math.floor(q.x / 16), Math.floor(q.y / 16)); if (v && v.vertical && v.st === 'oil') { lightAt(v, 0); q.state = 'gone'; UW.lastLand = { x: Math.round(q.x), y: Math.round(q.y), why: 'streak' }; continue; }   /* a streak of oil on a wall or a standpipe: it catches */
        if (inWater(q.x, q.y)) { const oc = cellAt(Math.floor(q.x / 16), Math.floor((q.y + 8) / 16)); if (oc && oc.st === 'oil') { lightAt(oc, 0); q.state = 'gone'; UW.lastLand = { x: Math.round(q.x), y: Math.round(q.y), why: 'oilwater' }; if (once('oilWater')) ctx.number(q.x, q.y - 30, 'THE OIL ON THE WATER CATCHES', '#ff9a5c'); continue; }
          q.state = 'gone'; ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(q.x, q.y, 10, ['#e8f4f8', '#9aa39a'], 40, 0.6); if (once('torchWater')) ctx.number(q.x, q.y - 30, 'THE WATER PUTS IT OUT', '#7ab8e8'); continue; }
        if (solidPx(q.x + Math.sign(q.vx) * CT.KINDS.torch.r, py, false) && !solidPx(px, py, false)) { q.x = px; q.y = py; landTorch(q, 'wall'); continue; }
        if (q.vy < 0 && solidPx(q.x, q.y - CT.KINDS.torch.r, false)) q.vy = 0;
        if (q.vy >= 0 && solidPx(q.x, q.y + CT.KINDS.torch.r, true)) { landTorch(q, 'floor'); continue; }
        if (q.y > ctx.L.H * 16 || q.x < 0 || q.x > ctx.L.W * 16) q.state = 'gone';
        continue; }
      if (q.state === 'lie') { q.lieT -= dt;
        const c = cellUnder(q); if (c && c.st === 'oil') { q.catchT -= dt; if (q.catchT <= 0) { lightAt(c, 0); q.state = 'gone'; continue; } }
        if (c && c.st === 'fire') { q.state = 'gone'; continue; }
        if (q.lieT <= 0) { q.state = 'gone'; ctx.burst(q.x, q.y - 3, 4, ['#3a2a20', '#9aa39a'], 20, 0.5); } } }
    UW.torches = UW.torches.filter(q => q.state !== 'gone');
  };
  /* THE BROOD SHY FROM A TORCH (held up, or lying lit): the near ones back away from it, and none steps within TORCH.shyR (H.fear) */
  const SHY = new Set(['venomscorpion', OIL_SKIN, DUST_SKIN, THIRST_SKIN, SPIT_SKIN]);
  const shyOf = e => (e.t === 'scorpion' || e.t === 'slinger') && !e.elite && SHY.has(e.cnSkin);
  const torchNear = (x, y, r) => (UW.torches || []).find(q => (q.state === 'held' || q.state === 'lie') && Math.abs(q.x - x) < r && Math.abs(q.y - y) < 40) || null;
  H.torchNear = (x, y, r) => (UW ? torchNear(x, y, r) : null);
  /* LIGHT HERE (the cistern bats scatter from it): a torch in hand or lying, burning oil, a lit cresset, an oil thief's lantern */
  H.lightAt = (x, y, r) => { if (!UW) return false; if (torchNear(x, y, r)) return true; for (const c of UW.list) if (c.st === 'fire' && Math.abs(c.x * 16 + 8 - x) < r && Math.abs(c.y * 16 + 8 - y) < r) return true;
    for (const sc of UW.sconces) if (sc.st === 'up' && Math.abs(sc.x * 16 + 8 - x) < r * 0.6 && Math.abs(sc.y * 16 - y) < r * 0.6) return true;
    for (const e of ctx.enemies()) if (e.alive && e.cnSkin === THIEF_SKIN && Math.abs(e.x - x) < r * 0.7 && Math.abs(e.y - 12 - y) < r * 0.7) return true; return false; };
  H.touchVerb = c => { if (!UW || !c.P) return null; if (held(c.P)) return { verb: 'SET DOWN', key: 'talk' }; return !c.P.carry && takeable(c.P) ? { verb: 'TAKE', key: 'talk' } : null; };
  H.touchCtx = c => (UW && c.P && held(c.P) ? { label: 'THROW', key: 'atk' } : null);

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
    if (shyOf(e) && torchNear(x, y - 8, TORCH.shyR)) { UW.n.shied = (UW.n.shied || 0) + 1; return true; }   /* (claude/underwell2) a torch in your hand: they will not step up to it */
    const f = H.fireAt(tx, ty) || H.fireAt(tx, ty + 1); if (f && !e.uwFeared) { e.uwFeared = 1; if (once('fear')) { const P = ctx.hero(); if (P && Math.abs(P.x - e.x) < 220) ctx.number(e.x, e.y - 26, 'THE BROOD WILL NOT CROSS FIRE', '#ffd36b'); } } return f; };
  /* ---------- THE HEAT DRIVES A SANDWORM UNDER (main.js: the worm's world.flood): burning oil over its bed ---------- */
  H.heat = s => { if (!UW || !s.bed) return false; const x0 = Math.floor(s.bed[0] / 16) - 1, x1 = Math.floor(s.bed[1] / 16) + 1, ry = Math.floor((s.y - 1) / 16);
    for (const c of UW.list) if (c.st === 'fire' && c.x >= x0 && c.x <= x1 && c.y <= ry && c.y >= ry - OIL.heatRows) return true; return false; };
  H.flushed = e => { if (!UW) return; UW.n.flushed++; if (once('flush')) ctx.number(e.x, e.y - 26, 'THE HEAT DRIVES IT UNDER', '#ff9a5c'); };

  /* ---------- THE CAST ---------- */
  const groundRow = (x, y) => { const tx = Math.floor(x / 16); let ty = Math.floor((y - 2) / 16); for (let k = 0; k < 4; k++, ty++) if (ctx.standable(tx, ty + 1) && ctx.cellGet(tx, ty) === ctx.T.AIR) return ty; return null; };
  /* AN OIL SLICK where an oil scorpion struck or died: CAST.slick new cells of oil on the floor there (they join any oil beside them; gone on a respawn) */
  const slick = (x, y, w) => { const ty = groundRow(x, y); if (ty === null) return 0; const tx = Math.floor(x / 16); let n = 0; const wide = w || CAST.slick;
    for (let dx = w ? -Math.floor((wide - 1) / 2) : -1; dx <= (w ? Math.ceil((wide - 1) / 2) : CAST.slick - 2); dx++) { const cx = tx + dx; if (ctx.cellGet(cx, ty) !== ctx.T.AIR || !ctx.standable(cx, ty + 1)) continue; const k = key(cx, ty); const c0 = UW.cells.get(k);
      if (c0) { if (c0.st === 'spent' || c0.st === 'wet') { c0.st = 'oil'; c0.t = 0; } continue; }
      const c = { x: cx, y: ty, st: 'oil', t: 0, age: 0, vertical: false, seed: (cx * 7) % 31, slick: true }; UW.cells.set(k, c); UW.list.push(c); n++; }
    if (n && !w) { UW.n.slicks++; ctx.burst(tx * 16 + 8, (ty + 1) * 16 - 2, 6, ['#141018', '#4a3e66', '#8a6ab8'], 30, 0.5); const P = ctx.hero(); if (P && Math.abs(P.x - x) < 200 && once('slick')) ctx.number(x, y - 26, 'IT LEAVES A SLICK OF OIL', '#b08ad8'); } return n; };
  /* AN OIL THIEF's FLASK, one step (main.js's bomb list hands it here): it flies as his charge flew and BREAKS where it lands - oil on the floor, a splash on you */
  H.flaskStep = (b, dt) => { if (!UW) return false; const TS = 16, tx0 = Math.floor(b.x / TS);
    b.vy += FLASK.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; const tx = Math.floor(b.x / TS), ty = Math.floor(b.y / TS);
    let hitHero = null; for (const pp of ctx.players) if (!pp.dead && Math.abs(pp.x - b.x) < FLASK.hitR && b.y > pp.y - 26 && b.y < pp.y + 2) hitHero = pp;
    const floor = b.vy > 0 && (ctx.solidAt(tx, ty) || (ctx.oneWayAt(tx, ty) && b.y - ty * TS < 6)), wall = ctx.solidAt(tx, ty) && !ctx.solidAt(tx0, ty), water = (ctx.L.pools || []).some(p => b.x >= p.x0 && b.x <= p.x1 && b.y >= p.y);
    if (!(hitHero || floor || wall || water || b.y > ctx.L.H * TS)) return true;
    b.dead = true; UW.n.flasks = (UW.n.flasks || 0) + 1; ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.splash && ctx.sfx.splash(); ctx.burst(b.x, b.y - 4, 12, ['#141018', '#4a3e66', '#3a5a30', '#c8d8c0'], 60, 0.5);
    if (hitHero) ctx.asPlayer(hitHero, () => ctx.hurtHero(b.x, FLASK.dmg, { unblockable: true, noKnock: true, name: 'THE OIL FLASK' }));
    if (!water) { const n = slick(b.x, Math.min(b.y, (ty + (floor ? 0 : 1)) * TS), FLASK.cells); if (n) { UW.n.flaskOil = (UW.n.flaskOil || 0) + n; const P = ctx.hero(); if (P && Math.abs(P.x - b.x) < 220 && once('flask')) ctx.number(b.x, b.y - 30, 'HIS FLASK BREAKS: LAMP OIL WHERE IT LANDS', '#b08ad8'); } }
    return true; };
  H.floorFire = (px, row) => { if (!UW) return false; const tx = Math.floor(px / 16); for (const c of UW.list) if (c.st === 'fire' && !c.vertical && Math.abs(c.x - tx) <= 1 && (row === undefined || Math.abs(c.y - row) <= 1)) return true; return false; };   /* (claude/underwell2) THE QUEEN's burrow runs into burning floor oil */
  /* a blow from a desert machine's 'hit' event, before it is known to land (main.js updateDesertFoe) */
  H.onBlow = (e, v) => { if (!UW || !e.cnSkin) return; if (e.cnSkin === OIL_SKIN && v.what === 'sting' && !e.uwSlick) { e.uwSlick = 1; slick((v.box[0] + v.box[1]) / 2, e.y); } };
  /* ...and when it lands (landed: it took health off the hero) */
  H.onHit = (e, v, landed, P) => { if (!UW || !e.cnSkin || !landed || !P) return;
    if (e.cnSkin === DUST_SKIN && v.what === 'claw') { P.uwBlind = CAST.blind; UW.n.blinds++; if (once('blind')) ctx.number(P.x, P.y - 30, 'GRIT IN YOUR EYES', '#c8b48a'); }
    if (e.cnSkin === THIRST_SKIN && v.what === 'sting') { const sk = P.skin; if (sk && sk.sips > 0) { sk.sips--; UW.n.drunk++; ctx.burst(P.x, P.y - 14, 6, ['#7ab8e8', '#e8f4f8'], 40, 0.4); ctx.number(P.x, P.y - 30, 'IT DRINKS FROM YOUR SKIN', '#7ab8e8'); } }
    if (e.cnSkin === SPIT_SKIN && v.stone) { venomOn(P, 1, VENOM); UW.n.spits++; if (once('spit')) ctx.number(P.x, P.y - 30, 'VENOM: YOUR STAMINA COMES BACK SLOWER', '#8fe04a'); } };
  H.onDeath = e => { if (!UW) return; if (e.cnSkin === OIL_SKIN) slick(e.x, e.y);
    if (e.cnSkin === THIEF_SKIN) { const tx = Math.floor(e.x / 16), ty = Math.floor((e.y - 1) / 16); let n = 0; for (let dx = -1; dx <= 1; dx++) { const c = cellAt(tx + dx, ty); if (c && c.st === 'oil') { lightAt(c, 0); n++; break; } }
      ctx.burst(e.x, e.y - 6, 8, ['#ffd36b', '#a4742a', '#ff8a2a'], 40, 0.5); UW.n.lanterns = (UW.n.lanterns || 0) + 1; if (n && once('lantern')) ctx.number(e.x, e.y - 30, 'HIS LANTERN FALLS INTO HIS OWN OIL', '#ff9a5c'); } };
  /* THE THIRSTY SCORPION: it smells your skin from far off and comes for it (before its machine steps) */
  H.preStep = (e, s, w, dt) => { if (!UW) return;
    if (shyOf(e) && s.mode === 'walk') { const q = torchNear(s.x, s.y - 8, TORCH.shyR); if (q) { const d = Math.sign(s.x - q.x) || -(s.face || 1); s.x += d * TORCH.shyV * dt; s.face = -d; UW.n.backed = (UW.n.backed || 0) + 1;
      if (once('shy')) ctx.number(e.x, e.y - 26, 'THE BROOD SHY FROM YOUR TORCH', '#ffd36b'); return; } }
    if (e.cnSkin !== THIRST_SKIN || s.mode !== 'walk') return; const P = ctx.hero(); if (!P || P.dead || !(P.skin && P.skin.sips > 0)) return;
    const d = P.x - s.x; if (Math.abs(d) > CAST.thirstSight || Math.abs(d) < 18 || Math.abs(P.y - s.y) > 48) return; s.face = Math.sign(d); s.x += Math.sign(d) * CAST.thirstV * dt;
    if (once('thirst') && Math.abs(d) < 200) ctx.number(e.x, e.y - 26, 'IT SMELLS THE WATER IN YOUR SKIN', '#7ab8e8'); };

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!UW) return; UW.clock += dt; const hb = ctx.attackBox(), P0 = ctx.hero(), TS = ctx.TS;
    /* THE FIRE CRACKLES (claude/underwellart): the nearer the burning oil, the more of it you hear (the existing ember sfx, thinned by distance) */
    if (P0 && !P0.dead && ctx.sfx.ember) { let near = 0; for (const c of UW.list) if (c.st === 'fire' && Math.abs(c.x * TS + 8 - P0.x) < 200 && Math.abs(c.y * TS - P0.y) < 80) near++; if (near && Math.random() < Math.min(0.09, 0.012 * near) * dt * 60) ctx.sfx.ember(); }
    /* THE OIL's clock */
    for (const c of UW.list) {
      if (c.st === 'fire') { c.age += dt; c.t -= dt;
        if (c.age >= OIL.spread) for (const q of neighbours(c)) ignite(q);
        if (c.t <= 0) { c.st = 'spent'; c.t = OIL.back; } }
      else if (c.st === 'wet' || c.st === 'spent') { c.t -= dt; if (c.t <= 0) { c.st = 'oil'; c.t = 0; } } }
    /* THE WALL TORCHES: a blow on a lit one knocks it down into the oil */
    for (const s of UW.sconces) {
      if (s.st === 'up' && hb && ctx.overlap(hb, { l: s.x * TS - 12, r: s.x * TS + 28, t: s.y * TS - 6, b: (s.y + 3) * TS })) { if (once('strikeTorch')) { const P = ctx.hero(); ctx.number(P.x, P.y - 34, 'E TAKES THE TORCH OUT OF ITS CRESSET', '#ffd36b'); } }   /* (claude/underwell2: strike-to-drop is gone - you TAKE it and THROW it) */
      else if (s.st === 'taken') { s.t -= dt; if (s.t <= 0) { s.st = 'up'; s.t = 0; } }
      else if (s.st === 'fall') { s.t -= dt; if (s.t <= 0) { s.st = 'down'; s.t = OIL.relight; if (s.below) lightAt(s.below, 0); else ctx.dust(s.x * TS + 8, (s.y + 2) * TS, 4); } }
      else if (s.st === 'down') { s.t -= dt; if (s.t <= 0) { s.st = 'up'; s.t = 0; } } }
    stepTorches(dt);
    /* THE GREAT LAMP: a blow on its chain (or the lamp) and it comes down into the hall's oil */
    const lp = UW.lamp; if (lp) {
      if (lp.st === 'up') { lp.swing *= Math.pow(0.2, dt); if (hb && ctx.overlap(hb, { l: lp.x * TS - 26, r: lp.x * TS + 42, t: lp.top * TS, b: (lp.y + 1) * TS + 4 })) { lp.st = 'fall'; lp.t = 0; ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(lp.x * TS + 8, lp.y * TS, 1, 6); ctx.number(lp.x * TS + 8, lp.y * TS - 20, 'THE CHAIN GIVES: THE LAMP FALLS INTO THE OIL', '#ffd36b'); } }
      else if (lp.st === 'fall') { lp.t += dt; const k = Math.min(1, lp.t / OIL.lampFall); lp.dy = (lp.floor - lp.y) * k * k;
        if (k >= 1) { lp.st = 'down'; lp.dy = lp.floor - lp.y; UW.n.lamp++; ctx.shake(6); ctx.sfx.heavy && ctx.sfx.heavy(); lightAt(cellAt(lp.x, lp.floor) || UW.list.find(c => c.x === lp.x && !c.vertical), 3);
          ctx.number(lp.x * TS + 8, lp.floor * TS - 30, 'THE GREAT LAMP FALLS: THE HALL BURNS', '#ff9a5c'); } } }
    /* THE NESTS: fire against one and it burns away; a BLADE on one turns off the chitin and the nest SPILLS ITS BROOD (a venom scorpion out of it, NEST.spill s
       apart, NEST.max alive from one nest) - hacking at a nest is how you fill a tunnel with scorpions */
    for (const m of UW.nests) { if (m.open) continue; m.cd = Math.max(0, (m.cd || 0) - dt); m.out = (m.out || []).filter(q => q.alive);
      if (hb && m.cd <= 0 && ctx.overlap(hb, { l: m.x0 * TS - 4, r: (m.x1 + 1) * TS + 4, t: m.y0 * TS, b: (m.y1 + 1) * TS })) { m.cd = NEST.spill; ctx.sparks((m.x0 + m.x1 + 1) * 8, (m.y1 - 1) * TS, ctx.hero().face || 1, 3);
        { const P = ctx.hero(), h0 = P.hp; ctx.hurtHero((m.x0 + m.x1 + 1) * 8, NEST.spray, { unblockable: true, noKnock: true, name: 'THE NEST VENOM' }); if (P.hp < h0) { venomOn(P, 1, VENOM); UW.n.sprayed = (UW.n.sprayed || 0) + 1; }
          ctx.burst((m.x0 + m.x1 + 1) * 8, (m.y1 - 1) * TS, 8, ['#8fe04a', '#5c8a24', '#e8dcb0'], 60, 0.5); if (once('spray')) ctx.number(P.x, P.y - 34, 'THE NEST SPITS VENOM: BURN IT', '#8fe04a'); }
        if (m.out.length < NEST.max && ctx.spawn) { const side = ctx.hero().x < m.x0 * TS ? -1 : 1, b = ctx.spawn({ t: 'scorpion', x: side < 0 ? m.x0 - 1 : m.x1 + 1, y: m.y1, face: side < 0 ? -1 : 1, cnSkin: 'venomscorpion', squad: 'spill' });
          if (b) { m.out.push(b); UW.n.spilled = (UW.n.spilled || 0) + 1; ctx.burst(b.x, b.y - 6, 10, ['#e8dcb0', '#5a4630', '#8fe04a'], 60, 0.6); ctx.sfx.hiss && ctx.sfx.hiss(); if (once('spill')) ctx.number(b.x, b.y - 30, 'THE NEST SPILLS ITS BROOD', '#ff9a5c'); } } }
      let hot = false; for (let y = m.y0; y <= m.y1 + 1 && !hot; y++) for (let x = m.x0 - 1; x <= m.x1 + 1 && !hot; x++) if (H.fireAt(x, y)) hot = true;
      if (hot || m.burn > 0) { if (m.burn === 0) { ctx.sfx.fireWhoosh ? ctx.sfx.fireWhoosh() : ctx.sfx.hiss && ctx.sfx.hiss(); } m.burn += dt;
        if (m.burn >= OIL.nestBurn) { m.open = true; UW.n.nests++; for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) ctx.cellOpen(x, y);
          ctx.burst((m.x0 + m.x1 + 1) * 8, (m.y0 + m.y1 + 1) * 8, 20, ['#ff8a2a', '#e8dcb0', '#1a0e08'], 80, 0.8); const P = ctx.hero(); if (P) ctx.number(P.x, P.y - 34, 'THE NEST BURNS AWAY', '#8fd160'); } } }
    /* A DRIP over burning oil boils dry; a ROPE whose foot is in the fire burns to ash */
    const wt = ctx.wt && ctx.wt();
    if (wt && wt.wells) for (const w of wt.wells) { if (!w.jar || w.left <= 0) continue; const tx = Math.floor(w.x / 16), ty = Math.floor((w.y - 1) / 16);
      if (H.fireAt(tx, ty) || H.fireAt(tx - 1, ty) || H.fireAt(tx + 1, ty)) { w.left = 0; w.boiled = true; UW.n.boiled++; ctx.burst(w.x, w.y - 12, 10, ['#e8f4f8', '#c8d0d8'], 40, 0.8); const P = ctx.hero(); if (P) ctx.number(P.x, P.y - 34, 'THE FIRE BOILS THE DRIP DRY', '#ff9a5c'); } }
    for (const r of UW.ropes) { if (!r.burnt) continue; r.t -= dt; if (r.t > 0) continue; r.burnt = false; for (let y = r.y0; y <= r.y1; y++) ctx.cellSet(r.x, y, ctx.T.NET); if (ctx.retile) ctx.retile();   /* (claude/underwell2: the spare rope is DRAWN - it was climbable and invisible) */
      const P = ctx.hero(); if (P && Math.abs(P.x - r.x * 16) < 300) ctx.number(P.x, P.y - 34, 'A SPARE ROPE UNCOILS', '#ffd36b'); }
    for (const r of UW.ropes) { if (r.burnt || !H.fireAt(r.x, r.y1)) continue; r.burnt = true; r.t = OIL.rehang; UW.n.ropes++;
      for (let y = r.y0; y <= r.y1; y++) { ctx.cellSet(r.x, y, ctx.T.AIR); if (y % 3 === 0) ctx.burst(r.x * 16 + 8, y * 16 + 8, 3, ['#ff8a2a', '#3a2a20'], 30, 0.6); }
      const P = ctx.hero(); if (P) ctx.number(P.x, P.y - 34, 'THE ROPE BURNS TO ASH', '#ff9a5c'); }
    /* THE QUEEN BURNS THROUGH THE OIL (fix pass): while she clings to a wall alight, the lamp oil streaked down it burns with her (drawn) */
    const q = ctx.queen && ctx.queen(); if (q && q.S && UW.L.queenOil && q.S.burn && q.S.pose === 'wall' && UW.L.queenOil[q.S.wall]) { const [qx, qy0, qy1] = UW.L.queenOil[q.S.wall];
      for (let y = qy0; y <= qy1; y++) { const c = cellAt(qx, y); if (c) { if (c.st !== 'fire') c.age = 0; c.st = 'fire'; c.t = Math.max(c.t, 1.0); } } }
    /* A FIRE SCORPION's burning patch lights any oil it touches */
    for (const p of (ctx.patches ? ctx.patches() : [])) { const tx = Math.floor(p.x / 16), ty = Math.round(p.y / 16) - 1; let n = 0; for (let dx = -1; dx <= 1; dx++) n += ignite(cellAt(tx + dx, ty)) ? 1 : 0; if (n) { UW.n.patchLit++; if (once('patchLit')) ctx.number(p.x, p.y - 28, 'ITS FIRE TAKES THE OIL', '#ff9a5c'); } }
    /* THE DUST SCORPION'S CLOUD SMOTHERS FIRE (claude/dustscorp): the brood will not cross fire, so a dust scorpion stops at the edge of your firebreak - and its cloud (CAST.smotherR px) chokes
       the burning oil there, one cell every CAST.smotherEvery s, spent (it seeps back after OIL.back s, so it cannot be lit again at once). A thin or short fire is eaten from its edge and the
       scorpion walks on; a deep gutter (burnDeep) outlasts it, a wet cell was never alight - or kill it before it reaches the flame. Fire does not smother IT back: it simply will not enter. */
    for (const e of ctx.enemies()) { if (!e.alive || e.cnSkin !== DUST_SKIN || !e.st) continue; e.uwSmT = Math.max(0, (e.uwSmT || 0) - dt); e.uwPuff = Math.max(0, (e.uwPuff || 0) - dt); if (e.uwSmT > 0) continue;
      const ex = e.x, ty = Math.floor((e.y - 1) / 16); let best = null, bd = 1e9;
      for (let dy = 0; dy <= 1; dy++) for (let tx = Math.floor((ex - CAST.smotherR) / 16); tx <= Math.floor((ex + CAST.smotherR) / 16); tx++) { const c = cellAt(tx, ty + dy); if (!c || c.st !== 'fire' || c.age < CAST.smotherAge) continue; const d = Math.abs(c.x * 16 + 8 - ex); if (d <= CAST.smotherR + 8 && d < bd) { bd = d; best = c; } }
      if (best) { best.st = 'spent'; best.t = OIL.back; e.uwSmT = CAST.smotherEvery; e.uwPuff = 0.5; UW.n.smothered++; ctx.burst(best.x * 16 + 8, best.y * 16 + 8, 8, ['#c8b48a', '#ece0b4', '#6a6458'], 40, 0.6); ctx.sfx.hiss && ctx.sfx.hiss();
        const P = ctx.hero(); if (P && !P.dead && Math.abs(P.x - ex) < 260 && once('smother')) ctx.number(ex, e.y - 26, 'ITS DUST SMOTHERS THE FIRE', '#c8b48a'); } }
    /* THE FIRE ON HEROES (a tick, unblockable) and on creatures standing in it (the fire scorpion is at home in it) */
    for (const pp of ctx.players) { if (pp.dead) continue; pp.uwBlind = Math.max(0, (pp.uwBlind || 0) - dt); pp.uwBurnK = Math.max(0, (pp.uwBurnK || 0) - dt);
      const tx = Math.floor(pp.x / 16), ty = Math.floor((pp.y - 1) / 16); const lit = H.fireAt(tx, ty) || H.fireAt(Math.floor((pp.x - 5) / 16), ty) || H.fireAt(Math.floor((pp.x + 5) / 16), ty);
      if (lit && pp.uwBurnK <= 0) { pp.uwBurnK = OIL.tick; UW.n.burns++; ctx.asPlayer(pp, () => ctx.hurtHero(ctx.hero().x, OIL.dmg, { unblockable: true, noKnock: true, name: 'THE BURNING OIL' })); if (once('burnt')) ctx.number(pp.x, pp.y - 30, 'THE OIL BURNS: GET OUT OF IT', '#ff9a5c'); } }
    for (const e of ctx.enemies()) { const soaked = e.cnSkin === DROWNED_SKIN || e.cnSkin === THIEF_SKIN; if (!e.alive || (!e.st && !soaked) || e.cnSkin === 'firescorpion' || e.t === 'sandworm' || e.boss || (e.t === 'zombie' && (e.mode === 'buried' || e.mode === 'riseTell'))) continue; e.uwBurnK = Math.max(0, (e.uwBurnK || 0) - dt);
      const tx = Math.floor(e.x / 16), ty = Math.floor((e.y - 1) / 16); if (e.uwBurnK <= 0 && H.fireAt(tx, ty)) { e.uwBurnK = OIL.tick; UW.n.foeBurns++; const mul = e.cnSkin === DROWNED_SKIN ? TORCH.fireMul : e.cnSkin === THIEF_SKIN ? TORCH.thiefMul : 1; ctx.hurtFoe(e, OIL.foeDmg * mul);
        if (mul > 1 && once('fireTakes' + e.cnSkin)) ctx.number(e.x, e.y - 34, e.cnSkin === DROWNED_SKIN ? 'FIRE TAKES THE DROWNED DEAD' : 'THEIR COATS ARE SOAKED IN OIL: FIRE TAKES THEM', '#ff9a5c'); } }
    /* THE FIRST LOOK at a thing: a line once (what it is, never the trick) */
    if (P0 && !P0.dead) { const near = (x, y, r) => Math.abs(x - P0.x) < r && Math.abs(y - P0.y) < 40;
      if (UW.list.some(c => c.st === 'oil' && !c.vertical && near(c.x * 16 + 8, (c.y + 1) * 16, 40)) && once('oil')) ctx.number(P0.x, P0.y - 34, 'LAMP OIL ON THE FLOOR: IT BURNS', '#b08ad8');
      for (const s of UW.sconces) if (s.st === 'up' && near(s.x * 16 + 8, (s.y + 2) * 16, 56) && once('torch')) ctx.number(P0.x, P0.y - 34, 'A TORCH: E TAKES IT, ATTACK THROWS IT ON THE OIL', '#ffd36b'); }
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
    if (kind === 'skin2') { const P = ctx.hero(); return P && P.skin && P.skin.sips >= 2 ? 'two' : 'low'; }   /* (the exam's two old fires want two sips) */
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
    { const plan = UWD.planDress(UW.L, ctx.T); if (!H.noSupports) UWD.drawSupports(g, cx, cy, vw, time, plan, UW.L); UWD.drawDress(g, cx, cy, vw, time, plan); }   /* the dressing and what holds the ledges up (src/redraw/underwell_dress.js) */
    for (const [x0, x1, y] of UW.sand) if (inX(x0 * TS, (x1 - x0) * TS + 40)) UWA.drawSand(g, R(x0 * TS - cx), R(y * TS - cy), (x1 - x0 + 1) * TS, time);
    for (const [x0, x1, y] of UW.L.seeps || []) if (x1 - x0 > 20 && ctx.cellGet(x0 + 1, y - 1) !== ctx.T.AIR && ctx.cellGet(x0 + 1, y + 1) !== ctx.T.AIR && inX(x0 * TS, (x1 - x0) * TS + 40)) UWA.drawGutter(g, R((x0 + 1) * TS - cx), R(y * TS - cy), (x1 - x0 - 1) * TS);   /* a gutter's grate (a slot in the rock) */
    for (const c of UW.list) { const x = c.x * TS; if (!inX(x)) continue; UWA.drawCell(g, R(x - cx), R(c.y * TS - cy) - (c.fl || 0), c.st, c.st === 'fire' ? Math.min(1, c.t / OIL.burn) : 0, time, c.vertical, c.seed, c.deep, c.side, c.pipe); }
    const Ph = ctx.hero();
    for (const d of UW.L.decor || []) if (d.kind === 'husk' && inX(d.x * TS, 60)) UWA.drawHusk(g, R(d.x * TS + 8 - cx), R((d.y + 1) * TS - cy));   /* her cast shell by her door */
    for (const m of UW.nests) { if (m.open) continue; const x = m.x0 * TS; if (!inX(x)) continue;
      const near = Ph && !Ph.dead && Math.abs(Ph.x - (m.x0 + m.x1 + 1) * 8) < 56 && Ph.y > m.y0 * TS && Ph.y <= (m.y1 + 2) * TS, q = near ? R(Math.sin(time * 38) * 1.2) : 0;   /* THE NEST QUIVERS as a blade comes near it (the tell before it spills) */
      UWA.drawNest(g, R(x - cx) + q, R(m.y0 * TS - cy), (m.x1 - m.x0 + 1) * TS, (m.y1 - m.y0 + 1) * TS, Math.min(1, m.burn / OIL.nestBurn), time); }
    for (const s of UW.sconces) { const x = s.x * TS + 8; if (!inX(x)) continue; const fallDy = s.st === 'fall' && s.below ? ((s.below.y - s.y) * TS) * (1 - s.t / OIL.torchFall) : 0;
      UWA.drawSconce(g, R(x - cx), R(s.y * TS - cy), s.st === 'down' || s.st === 'taken' ? 'down' : 'up', s.st === 'down' || s.st === 'taken' ? 1 - s.t / OIL.relight : 1, time, fallDy, R((s.ceil + 1) * TS - cy)); }
    for (const q of UW.torches || []) if (inX(q.x)) UWA.drawHandTorch(g, R(q.x - cx), R(q.y - cy), q.state, q.state === 'held' && q.holder ? q.holder.face || 1 : Math.sign(q.vx) || 1, time, q.state === 'lie' ? Math.min(1, q.lieT / TORCH.lie) : 1);
    const lp = UW.lamp; if (lp && inX(lp.x * TS, 60)) UWA.drawLamp(g, R(lp.x * TS + 8 - cx), R(lp.top * TS - cy), R((lp.y + 1) * TS + (lp.dy || 0) - cy), lp.st, time, lp.st === 'up' ? Math.sin(time * 0.9) * 2 : 0);
    const f = UW.fountain; if (f && inX(f.x)) UWA.drawFountain(g, R(f.x - cx), R(f.y - cy), f.full, ctx.questGot(), time);
    /* the dust scorpions' grit while their claw is up (the tell: a yellow mark, and the grit) */
    for (const e of ctx.enemies()) if (e.alive && e.cnSkin === DUST_SKIN && e.st && e.st.mode === 'clawTell' && inX(e.x)) { g.fillStyle = '#c8b48a'; for (let i = 0; i < 6; i++) g.fillRect(R(e.x - cx + (e.face || 1) * (6 + ((time * 40 + i * 5) % 18))), R(e.y - 6 - (i % 3) * 3 - cy), 2, 2); }
    /* the dust scorpions' cloud: a haze of grit always about one (it is what smothers the fire), thick for half a second after it chokes a cell */
    for (const e of ctx.enemies()) if (e.alive && e.cnSkin === DUST_SKIN && e.st && inX(e.x)) { const k = (e.uwPuff || 0) > 0 ? 18 : 6; g.fillStyle = '#c8b48a'; for (let i = 0; i < k; i++) { const a = time * 1.3 + i * 2.4, rr = 8 + ((i * 7) % 5) * 4 + (e.uwPuff > 0 ? 6 : 0); g.fillRect(R(e.x - cx + Math.cos(a) * rr * (CAST.smotherR / 30)), R(e.y - 8 - cy + Math.sin(a * 1.1) * 5), 1 + (i % 2), 1); } }
    if (UW.glint) drawGlint(g, R(UW.glint.x - cx), R(UW.glint.y - 18 - cy), vw, vh, time);
  };
  /* THE LIGHT (claude/underwellart): every lit torch, burning cell, burning nest, the great lamp, the running fountain and each candle niche is a hole in the dark (main.js's dark pass calls
     holes) and throws a warm pool over it (pools, in drawOver) */
  const lit = (cx, cy) => { const out = [], vw = ctx.VW(), TS = ctx.TS; if (!UW) return out;
    for (const s of UW.sconces) if (s.st === 'up') out.push({ x: s.x * TS + 8, y: s.y * TS + 2, r: 54, a: 0.34 });
    for (const q of UW.torches || []) out.push({ x: q.x, y: q.y - 2, r: q.state === 'lie' ? 50 : TORCH.light, a: 0.32 });   /* (claude/underwell2) the torch in your hand lights your way */
    for (const e of ctx.enemies()) if (e.alive && e.cnSkin === THIEF_SKIN) { const x = e.x + (e.face || 1) * 5; if (x > cx - 60 && x < cx + vw + 60) out.push({ x, y: e.y - 12, r: 46, a: 0.26 }); }   /* an oil thief's lantern */
    let n = 0; for (const c of UW.list) if (c.st === 'fire') { const x = c.x * TS + 8; if (x < cx - 60 || x > cx + vw + 60) continue; if (c.vertical || (c.x + c.y) % 2 === 0) out.push({ x, y: c.y * TS + 6, r: c.vertical ? 24 : 36, a: 0.3 }); }
    for (const m of UW.nests) if (!m.open && m.burn > 0) out.push({ x: (m.x0 + m.x1 + 1) * TS / 2, y: (m.y0 + m.y1 + 1) * TS / 2, r: 60, a: 0.4 });
    const lp = UW.lamp; if (lp && lp.st !== 'down') out.push({ x: lp.x * TS + 8, y: (lp.y + 1) * TS - 8, r: 120, a: 0.4, lamp: true });
    const f = UW.fountain; if (f && f.full) out.push({ x: f.x, y: f.y - 20, r: 40, a: 0.16, cool: true });
    for (const c of UWD.planDress(UW.L, ctx.T).candles) if (c.x > cx - 60 && c.x < cx + vw + 60) out.push({ x: c.x, y: c.y, r: 28, a: 0.22 });
    return out; };
  H.holes = (hole, cx, cy) => { if (!UW) return; for (const q of lit(cx, cy)) if (q.x > cx - q.r * 1.4 && q.x < cx + ctx.VW() + q.r * 1.4) hole(q.x - cx, q.y - cy, q.r * 1.2, 1); };
  /* over everything: the warm pools, and the grit in your eyes */
  H.drawOver = (g, cx, cy, time) => { if (!UW) return; const P = ctx.hero(), vw = ctx.VW(), R = Math.round;
    g.globalCompositeOperation = 'lighter'; for (const q of lit(cx, cy)) { if (q.x < cx - q.r || q.x > cx + vw + q.r || q.y < cy - q.r || q.y > cy + ctx.VH() + q.r) continue; if (q.cool) { g.globalAlpha = 1; UWA.lightPool(g, R(q.x - cx), R(q.y - cy), q.r, 0.1, time, q.x); continue; } UWA.lightPool(g, R(q.x - cx), R(q.y - cy), q.r, q.a, time, q.x); }
    { const lp = UW.lamp; if (lp && lp.st !== 'down' && lp.x * ctx.TS > cx - 120 && lp.x * ctx.TS < cx + vw + 120) { const x = R(lp.x * ctx.TS + 8 - cx), y = R((lp.y + 1) * ctx.TS - 8 - cy), gr = g.createLinearGradient(0, y, 0, y + 170); gr.addColorStop(0, 'rgba(255,170,80,0.22)'); gr.addColorStop(1, 'rgba(255,140,50,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y); g.lineTo(x + 90, y + 170); g.lineTo(x - 90, y + 170); g.closePath(); g.fill(); } }   /* THE GREAT LAMP'S CONE */
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    /* THE TOLD THROW (claude/underwell2): while a torch is in your hand, the arc it would fly and a ring where it would land - over the dark, so it is never hidden */
    if (P && !P.dead && held(P)) { const arc = H.arcOf(P); UW.arc = arc; CT.drawArc(g, arc, cx, cy, time, '#ffd36b'); } else UW.arc = null;
    if (H.drawRopes) H.drawRopes(g, cx, cy, time);
    if (P && P.uwBlind > 0) UWA.drawBlind(g, P.x - cx, P.y - 14 - cy, ctx.VW(), ctx.VH(), Math.min(1, P.uwBlind / CAST.blind)); };
  /* EVERY ROPE IS SEEN IN THE DARK (claude/underwell2, Daniel 10-06): over the dark pass, a warm lit edge down both sides of every rope cell in view - faint far off, bright
     within ROPE_NEAR px of you (the rope's own picture is src/redraw/underwell_tiles.js ropeTile, x 6-9 of its tile). tools/underwell.mjs measures its contrast */
  const ROPE_NEAR = 120;
  H.drawRopes = (g, cx, cy, time) => { if (!UW || !UW.ropeRuns) return; const vw = ctx.VW(), vh = ctx.VH(), P = ctx.hero(), R = Math.round;
    for (const r of UW.ropeRuns) { const x = r.x * 16; if (x < cx - 16 || x > cx + vw + 16 || (r.y1 + 1) * 16 < cy || r.y0 * 16 > cy + vh) continue;
      const near = P && !P.dead && Math.abs(P.x - (x + 8)) < ROPE_NEAR && P.y > r.y0 * 16 - 60 && P.y < (r.y1 + 1) * 16 + 80;
      for (let y = r.y0; y <= r.y1; y++) { if (ctx.cellGet(r.x, y) !== ctx.T.NET) continue; const sx = R(x - cx), sy = R(y * 16 - cy);
        g.globalAlpha = near ? 0.75 + 0.2 * Math.sin(time * 4 + y) : 0.4; g.fillStyle = '#ffd890'; g.fillRect(sx + 5, sy, 1, 16); g.fillRect(sx + 10, sy, 1, 16);
        g.globalAlpha = near ? 0.55 : 0.3; g.fillStyle = '#e8b870'; g.fillRect(sx + 7, sy, 2, 16); }
      g.globalAlpha = 1; } };
  H.read = () => UW && { n: { ...UW.n }, cells: { oil: UW.list.filter(c => c.st === 'oil').length, fire: UW.list.filter(c => c.st === 'fire').length, wet: UW.list.filter(c => c.st === 'wet').length, spent: UW.list.filter(c => c.st === 'spent').length },
    nests: UW.nests.map(m => ({ id: m.id, open: m.open })), ropes: UW.ropes.map(r => ({ id: r.id, burnt: r.burnt })), sconces: UW.sconces.map(s => ({ id: s.id, st: s.st })), lamp: UW.lamp && UW.lamp.st,
    fountain: UW.fountain && UW.fountain.full, glint: UW.glint && UW.glint.key, lastNudge: UW.lastNudge || null,
    torches: (UW.torches || []).map(q => ({ st: q.state, x: Math.round(q.x), y: Math.round(q.y), from: q.from })), lastLand: UW.lastLand || null, arc: UW.arc && UW.arc.land ? { x: Math.round(UW.arc.land.x), y: Math.round(UW.arc.land.y) } : null };
  return H;
}
