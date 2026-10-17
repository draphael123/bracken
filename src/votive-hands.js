// src/votive-hands.js - WAYMEET'S VOTIVE LAMPS (claude/towpathchurch, 2026-10-16; Daniel 10-08, confirmed 10-16: "THE LIT CHURCH opens by lighting Waymeet's 3 votive lamps (each a short detour
// off the route, shared flame verb)" - scratch/brief-crusader2-1016.md section 3, scratch/brief-church2.md section 1). It REPLACES the hidden Towpath bronze-medal gate and the Towpath's
// first-screen church fork. src/level.js waymeet() builds three dark wayside lamps, each on a short loft over the street (a ladder beside it, a plank on its poles) with a BRAZIER
// a few steps from its ladder, and returns them as L.votive = { lamps: [{ id, x, y, kind, name }], sources: [{ id, x, y, kind }] } (a lamp's y is the row its hero stands on).
// THE VERB is THE LIT CHURCH's own, shared (src/flame.js - not a copy): E at a brazier puts a taper in your hand (it burns FLAME.life s; a blow that lands on you puts it out), E at a dark lamp
// with it lights the lamp. Lit lamps are SAVED (PROG.votive[id], per profile) - the hands call ctx.lit(id), which main.js writes and counts; all three lit sets PROG.churchOpen and
// the map shows the hill road to THE LIT CHURCH (main.js votiveLocked / spurTip: 'LIGHT WAYMEET'S VOTIVE LAMPS n/3'). A save that already had the church open (its old Towpath medal,
// or the church cleared) keeps it open (main.js progDefaults' churchMig). Each lamp glints while you are near it and a stall nudge follows after 10 s (STUCK_HANDS.waymeet, A6).
// main.js calls: reset, on, update, interact, holes, drawWorld, drawOver, read, handsState.
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';
import { STUCK_HANDS } from './stuck-spots.js';
import * as SET from './redraw/church_set.js';
import { FLAME, flameNear, takeFlame, tickFlame, flameHoles, drawFlameHand } from './flame.js';

export const VOTIVE_IDS = ['v1', 'v2', 'v3'];   /* WAYMEET's lamps (src/level.js waymeet() hangs them) */
export const VOTIVE_N = VOTIVE_IDS.length;   /* the lamps the hill road asks for */

export function makeVotiveHands(ctx) {
  let K = null;
  const H = {};
  const TS = () => ctx.TS;
  const once = k => { if (K.said[k]) return false; K.said[k] = 1; return true; };
  const number = (x, y, t, col) => ctx.number(x, y, t, col || '#ffd36b');   /* (every teaching line is a src/hint-lines.js line: tools/hint-shown.mjs reads these calls) */
  const px = l => l.x * TS() + 8, py = l => (l.y + 1) * TS();   /* a lamp's / brazier's foot in world px */
  H.on = () => !!K;
  H.state = () => K;
  const lampOf = id => K.lamps.find(l => l.id === id);
  H.lit = () => (K ? K.lamps.filter(l => l.lit).length : 0);

  /* ---------- RESET: a fresh load builds the lamps as the save has them; a respawn keeps them ---------- */
  H.reset = () => {
    const L = ctx.L; if (!L || !L.votive) { K = null; return; }
    const owned = ctx.owned();
    if (!K || K.L !== L) K = { L, said: {}, clock: 0, lamps: L.votive.lamps.map(l => ({ ...l, lit: !!owned[l.id] })), sources: L.votive.sources.map(s => ({ ...s })), glint: null, stalls: {}, stallKey: null,
      n: { lit: 0, flames: 0, flamesOut: 0, flamesDied: 0, nudges: 0 } };
    for (const l of K.lamps) if (owned[l.id]) l.lit = true;
    K.glint = null; K.stalls = {}; K.stallKey = null;
    for (const pp of ctx.players) { pp.lcFlame = 0; pp.lcHp = pp.hp; }
    if (typeof window !== 'undefined' && window.BK) Object.assign(window.BK, { votive: () => H.read(), votiveHands: () => H });
  };

  /* ---------- A LAMP LIT ---------- */
  function light(l) {
    if (!l || l.lit) return false; l.lit = true; K.n.lit++;
    ctx.sfx.ignite ? ctx.sfx.ignite() : ctx.sfx.whoosh && ctx.sfx.whoosh(); ctx.burst(px(l), py(l) - 24, 10, ['#ffd36b', '#fff6c8', '#ff9a3c'], 50, 0.5);
    const n = ctx.lit(l.id);   /* (main.js writes PROG.votive[id], saves, and returns how many burn; the third sets PROG.churchOpen) */
    if (n >= VOTIVE_N) { number(px(l), py(l) - 50, 'THE THIRD LAMP BURNS: THE HILL ROAD TO THE LIT CHURCH IS OPEN', '#8fd160'); if (ctx.shake) ctx.shake(3); }
    else if (n === 2) number(px(l), py(l) - 50, 'TWO OF THREE VOTIVE LAMPS BURN', '#8fd160');
    else number(px(l), py(l) - 50, 'ONE OF THREE VOTIVE LAMPS BURNS', '#8fd160');
    return true; }

  /* ---------- E: a flame at a brazier, a lamp lit with it ---------- */
  H.interact = P => {
    if (!K || P.dead) return false;
    const dark = K.lamps.filter(l => !l.lit && flameNear(P, px(l), py(l), FLAME.useR)).sort((a, b) => Math.abs(px(a) - P.x) - Math.abs(px(b) - P.x))[0];
    if (dark) { if (P.lcFlame > 0) { light(dark); return true; }
      if (K.clock - (K.needSaid || -9) > 2.5) { K.needSaid = K.clock; number(P.x, P.y - 40, 'A VOTIVE LAMP WANTS A FLAME: E AT A BRAZIER TAKES ONE', '#9aa39a'); } return true; }
    const f = K.sources.filter(q => flameNear(P, px(q), py(q), FLAME.takeR)).sort((a, b) => Math.abs(px(a) - P.x) - Math.abs(px(b) - P.x))[0];
    if (f) { K.n.flames++; takeFlame(P, ctx, () => { if (once('flame')) number(P.x, P.y - 44, 'A FLAME: IT BURNS DOWN. A BLOW PUTS IT OUT', '#ffd36b'); }); return true; }
    return false; };
  /* the lit lamps and the braziers burn: the paladin kneels at them (src/crouch-b.js HOLY) */
  H.holyLights = () => (K ? K.sources.map(s => ({ x: px(s), y: py(s) })).concat(K.lamps.filter(l => l.lit).map(l => ({ x: px(l), y: py(l) }))) : []);

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!K) return; K.clock += dt;
    tickFlame(ctx.players, dt, (what, pp) => { if (what === 'died') { K.n.flamesDied++; if (once('flameDied') || K.clock - (K.diedSaid || -9) > 6) { K.diedSaid = K.clock; ctx.number(pp.x, pp.y - 36, 'THE FLAME BURNS OUT', '#9aa39a'); } }
      else { K.n.flamesOut++; ctx.number(pp.x, pp.y - 36, 'THE BLOW PUTS YOUR FLAME OUT', '#ff9a5c'); } });
    stall(ctx.hero(), dt);
  };

  /* ---------- THE GLINT AND THE NUDGE (STUCK_HANDS.waymeet): the brazier for a dark lamp while your hand is empty, the lamp while it holds a flame ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'need') { const l = lampOf(id); if (!l) return ''; return l.lit ? 'done' : ctx.hero() && ctx.hero().lcFlame > 0 ? 'lamp' : 'fire'; }
    if (kind === 'lamp') { const l = lampOf(id); return l ? (l.lit ? 'lit' : 'dark') : ''; }
    return ''; };
  H.handsState = n => (K ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    const r = resolve('waymeet', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { K.glint = null; K.stallKey = null; return; } const t = r.targets[0]; K.glint = { key: r.key, x: t.x, y: t.y, show: r.glint !== 'stall' };
    const C = K.stalls[r.key] = K.stalls[r.key] || newStall(); if (r.key !== K.stallKey) { K.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, K.clock, false)) { K.n.nudges++; K.lastNudge = r.line; K.glint.show = true; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- THE LIGHT IN THE DUSK (main.js's dark pass: a hole for every lit lamp, every brazier, the flame in your hand) ---------- */
  H.holes = (hole, cx, cy) => { if (!K) return; const vw = ctx.VW(), inX = x => x > cx - 120 && x < cx + vw + 120;
    for (const l of K.lamps) if (l.lit && inX(px(l))) hole(px(l) - cx, py(l) - 26 - cy, 84);
    for (const s of K.sources) if (inX(px(s))) hole(px(s) - cx, py(s) - 12 - cy, 64);
    flameHoles(hole, ctx.players, cx, cy); };

  /* ---------- DRAWING: the church's own lamp-stand and brazier (src/redraw/church_set.js, shared), a gold wick-glint on a dark lamp, the guide's glint ---------- */
  const V = { g: null, cx: 0, cy: 0, vw: 320, vh: 180, time: 0, L: null, T: null, lit: () => true, glow: 0.5, stubs: 0, paladinLight: 1 };
  H.drawWorld = (g, cx, cy, time) => {
    if (!K) return; const vw = ctx.VW(), inX = (x, m = 60) => x > cx - m && x < cx + vw + m;
    V.g = g; V.cx = cx; V.cy = cy; V.vw = vw; V.vh = ctx.VH(); V.time = time; V.L = K.L; V.T = ctx.T;
    for (const s of K.sources) if (inX(px(s))) SET.drawSource(V, s);
    for (const l of K.lamps) if (inX(px(l))) { SET.drawLamp(V, l);
      if (!l.lit) { const x = Math.round(px(l) - cx), y = Math.round(py(l) - cy); g.globalAlpha = 0.45 + 0.3 * Math.sin(time * 3 + l.x); g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 46, 3, 3); g.globalAlpha = 1; } }
    if (K.glint && K.glint.show) drawGlint(g, Math.round(K.glint.x - cx), Math.round(K.glint.y - 18 - cy), vw, ctx.VH(), time);
  };
  H.drawOver = (g, cx, cy, time) => { if (!K) return; drawFlameHand(g, ctx.players, cx, cy, time); };
  H.read = () => K && { n: { ...K.n }, lamps: Object.fromEntries(K.lamps.map(l => [l.id, l.lit])), lit: H.lit(), flame: ctx.hero() ? +(ctx.hero().lcFlame || 0).toFixed(1) : 0, glint: K.glint && K.glint.key, lastNudge: K.lastNudge || null };
  return H;
}
