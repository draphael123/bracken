// src/longwater3-hands.js - THE LONG WATER 3 IN THE GAME (claude/longwater3, the greybox, 2026-11-07). src/longwater3.js is the level (data), src/pool-crab.js and
// src/tide-herald.js the two brains (pure); this binds them to the world, and is the level's own wiring of THE TIDE KIT (src/tide-kit.js).
// ONLY a level with L.lw3: everything here is inert anywhere else (on() is false), so the flag-off game is unchanged.
//   THE TIDES     L.tides through the kit: THE BAY (the village's clock: the cove, the flats, the loft cove), THE MILL RACE, THE HARBOUR (the exam), THE TIDE FLATS
//                 (the Herald's). Kept OFF L.tides on purpose: claude/water1's generic wiring steps any L.tides level (fold into one wiring after both merge).
//   THE VERBS     a blow on a SEA BELL calls its tide in (kit: three strokes, then it comes); on a SLUICE WHEEL holds it out (the wheel then needs LW3_HANDS.wheelCool s to
//                 wind back: one turn per tide, not a spam). The flats' bell and wheel go to THE TIDE HERALD's brain too.
//   THE BOATS     kit floats: beached at low water, afloat at high, platforms either way (main.js carries the riders on m.dy). A MOORED boat is held under at her rest
//                 row (swamped) until her mooring is cut.
//   FISH TRAPS    one rope each: a blow cuts it, the trap drops (crushes a foe under it: LW3.trap.dmg, room damage) and spills its catch (coins) where it lands.
//   THE RACE      a hero in the race's water under the mill is carried back (LW3.race.carry px/s, more than a swim) - only the wheel's held-out water lets you through.
//   THE JELLIES   a tide's `bites` box while it is live: a swimmer in it is stung (LW3.stingers) - the jellies come in with the tide.
//   THE TIDE-POOL CRAB (src/pool-crab.js) and THE TIDE HERALD 2 (src/tide-herald.js): spawn, step, every blow on them; the crab's drawing (the Herald keeps master's
//                 sheet - his mode names are master's - and gets his reads drawn over him here).
// main.js calls: on, owns, clear, spawnEnt, updateEnt, take, update, mover, drawBack, drawMover, drawEnt, drawOver, barName, end, read.
import { gauge, floatY, kOf, lineY, bites as tideBites } from './tide-kit.js';
import { LW3 } from './longwater3.js';
import * as PCM from './pool-crab.js';
import * as THM from './tide-herald.js';
const R = Math.round, TS = 16;
export const LW3_HANDS = { wheelCool: 10, bellCool: 4, trapW: 12, moorW: 10, hideT: 6 };
export const LW3_SAY = { bell: 'THE SEA BELL: THE TIDE COMES IN', sluice: 'THE SLUICE WHEEL HOLDS THE SEA OUT', wound: 'THE WHEEL IS STILL WINDING BACK', race: 'THE RACE CARRIES YOU BACK',
  stung: 'JELLIES: THEY CAME IN WITH THE TIDE', trap: 'THE TRAP DROPS', moor: 'THE BOAT IS LOOSE: THE TIDE WILL LIFT HER', moored: 'SHE IS MOORED UNDER: CUT HER ROPE' };
const ease = f => { const x = Math.max(0, Math.min(1, f)); return x * x * (3 - 2 * x); };
const invEase = k => { let a = 0, b = 1; for (let i = 0; i < 20; i++) { const m = (a + b) / 2; if (ease(m) < k) a = m; else b = m; } return (a + b) / 2; };

export function makeLongWater3Hands(ctx) {
  const H = {}; let S = null, Q = null, WORD = null;
  const lv = () => ctx.L, TK = () => (ctx.pfh && ctx.pfh.kit()) || null;   /* (claude/lw3b) the kit is the generic wiring's (src/pirate-fleet-hands.js): stepped once, there; this level rides its hooks (H.water) */
  const on = () => !!(lv() && lv().lw3);
  H.on = on;
  H.owns = e => !!e && (e.t === 'poolcrab' || (e.t === 'herald' && !!e.lw3));
  H.drawsSelf = e => !!e && e.t === 'poolcrab';
  const tideS = id => TK() && TK().tides.find(s => s.id === id);
  const dur = (T, ph) => (T.cycle[ph] ?? 3) / (T.rate || 1);
  H.clear = () => {
    S = null; Q = null; WORD = null; if (!on()) return;
    const L = lv();
    S = { told: {}, traps: (L.lw3Traps || []).map(t => ({ ...t, st: 'hang', py: t.y * TS + 4, vy: 0, keyed: new Set() })), moors: Object.fromEntries((L.lw3Moors || []).map(m => [m.id, { ...m, cut: false }])),
      locals: (L.lw3Props || []).filter(p => p.kind === 'local').map((p, i) => ({ ...p, px: p.x * TS + 8, hide: 0, dir: i % 2 ? 1 : -1, t: Math.random() * 3 })),
      gulls: (L.lw3Props || []).filter(p => p.kind === 'gulls').map(p => ({ ...p, up: 0, t: Math.random() * 4 })), sting: new Map(), raceT: 0, calledHigh: false, dip: 0, swim: 0 };
  };
  const isHero = b => ctx.players.includes(b);
  const near = (x, r) => { const P = ctx.hero(); return !!(P && Math.abs(P.x - x) < r); };

  /* ---------- SPAWNING ---------- */
  H.spawnEnt = (base, e) => {
    if (!on()) return null;
    if (e.t === 'poolcrab') { const c = PCM.spawnCrab(base, e, ctx.EHP.poolcrab); c.tide = (lv().tides.find(t => t.id === 'harbour') && e.x >= 586) ? 'harbour' : 'bay'; return c; }
    if (e.t === 'lw3herald') { const A = lv().arena; if (!A) return null;
      Q = THM.newFight({ x0: A.x0, x1: A.x1, floor: A.floor, stones: A.stones, bellX: A.bellX, sluiceX: A.sluiceX }); WORD = null;
      for (const pp of ctx.players) pp.thKeys = null;
      return { ...base, t: 'herald', lw3: true, w: THM.TH.w, h: THM.TH.h, hp: THM.TH.hp, maxHp: THM.TH.hp, markH: THM.TH.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, hitT: 0, y: A.floor, noPull: true }; }
    return null;
  };

  /* ---------- HURTING A HERO (every seat; keyed once a blow) ---------- */
  const keyed = (pp, key) => { pp.thKeys = pp.thKeys || new Map(); if (pp.thKeys.size > 160) pp.thKeys.clear(); if (pp.thKeys.has(key)) return true; pp.thKeys.set(key, 1); return false; };
  function hitAll(e, bx, d, name, o = {}) { let res = null;
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
      if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return; if (keyed(pp, (o.key || name) + ':' + (e.id0 || e.t))) return;
      const r = ctx.damagePlayer(e.x, d, { who: e, name, blow: name, unblockable: !o.blockable, low: !!o.low }); if (r === 'blocked') res = 'blocked'; else if (!res && r) res = 'hit'; });
    return res; }
  const markAt = (e, m) => { if (m) ctx.number(e.x, e.y - (e.markH || e.h + 12), m, m === '!' ? '#ffd36b' : '#ff6b6b'); };

  /* ---------- A FOE OF OURS, ONE FRAME ---------- */
  H.updateEnt = (e, dt) => {
    if (!S || !e.alive) return;
    if (e.hurtT > 0) e.hurtT -= dt;
    const hs = ctx.players.filter(pp => !pp.dead && ctx.upright(pp));
    if (e.t === 'poolcrab') { let h = null, d = 1e9; for (const pp of hs) { const q = Math.abs(pp.x - e.x) + Math.abs(pp.y - e.y); if (q < d) { d = q; h = pp; } }
      e.id0 = e.id0 || ('c' + R(e.home));
      PCM.stepCrab(e, dt, h ? { x: h.x, y: h.y, alive: true } : null, { k: () => kOf(TK(), e.tide), mark: m => markAt(e, m), sound: k => ctx.sound(k), hit: (bx, dmg, name, o) => hitAll(e, bx, dmg, name, o),
        say: (b, w) => { if (near(b.x, 260)) ctx.number(b.x, b.y - 22, w, '#e8d8b0'); }, move: (b, dx) => ctx.moveBody(b, dx, 0) });
      /* it keeps to the sand: a crab over a pool's edge drops into it */
      const tx = Math.floor(e.x / TS); if (!ctx.isSolid(tx, Math.floor((e.y + 0.5) / TS))) { const ny = e.y + 160 * dt, row = Math.floor(ny / TS); e.y = ctx.isSolid(tx, row) ? row * TS : ny; }
      return; }
    if (e.t === 'herald' && e.lw3 && Q) {
      if (!ctx.bossActive || e !== ctx.boss) return;
      if (e.mode === 'wake' && !Q.woke) { Q.woke = true; ctx.number(e.x, e.y - 90, THM.TH_SAY.woke, '#ffd36b'); const sq = tideS('square'); if (sq) { sq.ph = 'low'; sq.t = dur(sq.T, 'low'); } }
      THM.stepHerald(e, Q, dt, ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, block: !!pp.block })), world(e));
      e.phase = Q.ph;
      if (/Tell$|^raise$/.test(e.mode)) { const k = Object.keys(THM.MOVES).find(m => THM.MOVES[m].tell === e.mode); if (k && (!WORD || WORD.k !== k)) WORD = { k, t: ctx.time() }; } else WORD = null;
      placeHerald(e, dt); e.vx = dt > 0 ? (e.x - (e.px0 ?? e.x)) / dt : 0; e.px0 = e.x;   /* (master's sheet walks him by |vx|) */
    }
  };
  /* he stands ON the water where there is water over the flats; on the stones and the mud he stands on the ground; mired he sinks to the knee */
  function groundY(x) { const tx = Math.floor(x / TS); for (let ty = 20; ty < lv().H; ty++) if (ctx.isSolid(tx, ty)) return ty * TS; return lv().arena.floor; }
  function placeHerald(e, dt) {
    const gy = groundY(e.x), sy = lineY(TK(), 'square'), k = kOf(TK(), 'square');
    const want = e.mode === 'mired' ? gy + 5 : k > THM.TH.waterK && sy < gy ? sy : gy;
    e.y += (want - e.y) * Math.min(1, dt * 10); if (Math.abs(want - e.y) < 0.5) e.y = want;
  }
  function world(e) {
    return {
      tide: () => { const g = gauge(TK(), 'square') || { k: 0, ph: 'low' }; return { k: g.k, ph: g.ph, held: g.held }; },
      tideCmd: cmd => squareCmd(cmd),
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => ctx.sound(k), mark: m => markAt(e, m),
      hit: (bx, d, name, o) => hitAll(e, bx, d, name, o),
      surfaceY: () => lineY(TK(), 'square'),
      ringWard: ee => ctx.ring(ee.x, ee.y - 18, 30, '#9ab0c0'),
      fx: (k, x, y) => { if (k === 'mud') { ctx.shake(5); ctx.burst(x, y - 4, 22, ['#6a5a44', '#8a7a5a', '#cfc0a0'], 90, 0.6, -50); } if (k === 'spout') ctx.burst(x, y - 4, 10, ['#7cc8c8', '#e8f4f0'], 120, 0.5, -160); },
    };
  }
  /* THE FLATS' TIDE AS THE HERALD'S FIGHT SAYS (kit state, written directly: the kit has no 'boss' verbs) */
  function squareCmd(cmd) {
    const s = tideS('square'); if (!s) return; const T = s.T;
    if (cmd === 'called') { S.calledHigh = true; return; }   /* the kit already started the warn; a called high is short (update) */
    if (cmd === 'his') { s.hold = 0; if (s.k < 1) { s.ph = 'rise'; s.t = dur(T, 'rise') * (1 - invEase(s.k)); s.wd = 0; } else { s.ph = 'high'; s.t = 9; } return; }
    if (cmd === 'break') { s.hold = 0; s.ph = 'turn'; s.t = THM.TH.recall + 0.6; s.toll = 0; return; }   /* the sea hangs at the turn while he calls it back */
    if (cmd === 'drop') { s.ph = 'fall'; s.t = dur(T, 'fall') * invEase(Math.max(0.001, s.k)); s.hold = T.verbs.find(v => v.t === 'sluice').hold || 5; return; }
    if (cmd === 'dip') { s.hold = 0; s.ph = 'fall'; s.t = dur(T, 'fall') * invEase(Math.max(0.001, s.k)); S.dip = 0.5; return; }
  }

  /* ---------- A BLOW ON ONE OF OURS ---------- */
  H.take = (e, dmg, blow, tag, top) => {   /* (tag: the hero blow's verbs, tools/blow-tags.mjs) */
    if (e.t === 'poolcrab') { const r = PCM.crabTake(e, top); if (r.word && near(e.x, 300)) ctx.number(e.x, e.y - 20, r.word, '#e8d8b0'); return Math.round(dmg * r.k); }
    if (e.t === 'herald' && e.lw3 && Q) { const r = THM.takeAt(e, Q, kOf(TK(), 'square')); if (r.word && blow && ctx.turned) { const P = ctx.hero(); ctx.turned(e, P ? P.x : e.x, r.word, { stop: false }); }
      if (blow) Q.n.landed++; return Math.max(1, Math.round(dmg * Math.max(THM.TH.k.floor, r.k))); }
    return dmg;
  };

  /* ---------- ONE FRAME OF THE LEVEL ---------- */
  H.update = dt => {
    if (!TK() || !S) return; const L = lv(), P = ctx.hero();
    /* (the tide's step, its tolls and THE FLATS' sea between step and write run in the generic wiring, through H.water below) */
    /* THE RACE: carried back under the mill */
    for (const r of L.lw3Races || []) for (const pp of ctx.players) { if (pp.dead || !pp.swim) continue; const tx = pp.x / TS; if (tx < r.x0 || tx > r.x1 + 1) continue;
      ctx.moveBody(pp, r.dir * r.carry * dt, 0); if (pp === P && !S.told.race) { S.told.race = 1; ctx.number(pp.x, pp.y - 34, LW3_SAY.race, '#bfe6f5'); }
      if (Math.random() < dt * 20) ctx.parts().push({ x: pp.x + (Math.random() - 0.5) * 30, y: pp.y - 8 - Math.random() * 16, vx: r.dir * 160, vy: 0, life: 0.4, max: 0.4, col: '#dff2f8', size: 1, grav: 0 }); }
    /* THE JELLIES: a swimmer in a live bite box is stung */
    for (const pp of ctx.players) { if (pp.dead || !pp.swim) continue; const b = tideBites(TK(), Math.floor(pp.x / TS), Math.floor((pp.y - 6) / TS)); if (!b) continue;
      const t = (S.sting.get(pp) || 0) - dt; if (t <= 0) { S.sting.set(pp, LW3.stingers.every); ctx.asPlayer(pp, () => ctx.damagePlayer(pp.x + 4, LW3.stingers.dmg, { name: 'THE JELLIES', blow: 'jellies', unblockable: true, quiet: true }));
        if (pp === P && !S.told.stung) { S.told.stung = 1; ctx.number(pp.x, pp.y - 34, LW3_SAY.stung, '#e2c8ff'); } } else S.sting.set(pp, t); }
    /* THE UNDERTOW: the Herald's P2 drag */
    if (Q && Q.pull > 0) for (const pp of ctx.players) { if (pp.dead) continue; const dx = Q.pullX - pp.x; if (Math.abs(dx) > THM.TH.undertow.r || Math.abs(dx) < 10) continue;
      const half = THM.onStone(Q, pp.x) || pp.block; ctx.moveBody(pp, Math.sign(dx) * (half ? THM.TH.undertow.pullHalf : Q.pull) * dt, 0);
      if (Math.random() < dt * 30) ctx.parts().push({ x: pp.x + (Math.random() - 0.5) * 20, y: pp.y - 4, vx: Math.sign(dx) * 120, vy: -10, life: 0.35, max: 0.35, col: '#7cc8c8', size: 1, grav: 0 }); }
    /* THE TRAPS */
    for (const t of S.traps) { if (t.st !== 'fall') continue; t.vy = Math.min(600, t.vy + LW3.trap.g * dt); t.py += t.vy * dt; const x = t.x * TS + 8;
      for (const e of ctx.enemies()) { if (!e.alive || t.keyed.has(e) || e === ctx.boss) continue; if (Math.abs(e.x - x) < 12 && e.y >= t.py && e.y - (e.h || 12) <= t.py + 12) { t.keyed.add(e); ctx.hurtFoe(e, LW3.trap.dmg, x); } }
      if (ctx.isSolid(t.x, Math.floor((t.py + 12) / TS))) { t.st = 'down'; t.py = Math.floor((t.py + 12) / TS) * TS - 12; ctx.sound('crack'); ctx.burst(x, t.py + 10, 14, ['#c8b890', '#8a7a5a', '#e8dcc0'], 90, 0.5, -60);
        if (t.kind === 'coins') for (let i = 0; i < t.n; i++) ctx.coin(x + (i - t.n / 2) * 4, t.py + 6); } }
    /* THE VILLAGE: locals duck in at the bell, gulls lift when you come */
    for (const l of S.locals) { l.t += dt; if (l.hide > 0) { l.hide -= dt; continue; } const home = l.home * TS + 8; l.px += l.dir * 14 * dt; if (Math.abs(l.px - home) > 40) l.dir = -Math.sign(l.px - home); }
    for (const gl of S.gulls) { gl.t += dt; const close = near(gl.x * TS, 48); gl.up = Math.max(0, Math.min(1, gl.up + (close ? 3 : -0.6) * dt)); }
  };
  const tideNear = id => { const P = ctx.hero(); if (!P) return false; const T = lv().tides.find(t => t.id === id); if (!T) return false;
    const ps = lv().pools.filter(p => (T.pools || []).includes(p.id)); return ps.some(p => P.x > p.x0 - 400 && P.x < p.x1 + 400); };

  /* ---------- THE GADGETS: a trap's rope, a mooring (claude/seagadget: declared to the one hook, src/sea-gadget.js - a blow AND any hero's shot / spell / thrown weapon cuts them; a bell / a wheel is a kit verb the same hook strikes, through H.water.verb) ---------- */
  H.gadgets = () => { if (!TK() || !S) return []; const out = [];
    for (const t of S.traps) out.push({ id: 'trap:' + t.id, box: () => { if (t.st !== 'hang') return null; const x = t.x * TS + 8; return { l: x - LW3_HANDS.trapW / 2 - 2, r: x + LW3_HANDS.trapW / 2 + 2, t: t.py - 10, b: t.py + 12 }; },
      strike: () => { const x = t.x * TS + 8; t.st = 'fall'; t.vy = 0; ctx.sound('snip'); if (!S.told.trap) { S.told.trap = 1; ctx.number(x, t.py - 16, LW3_SAY.trap, '#e8d8b0'); } } });
    for (const id in S.moors) { const m = S.moors[id];
      out.push({ id: 'moor:' + id, box: () => { if (m.cut) return null; const x = m.x * TS + 8, y = (m.y + 1) * TS; return { l: x - LW3_HANDS.moorW, r: x + LW3_HANDS.moorW, t: y - 26, b: y }; },
        strike: () => { const x = m.x * TS + 8, y = (m.y + 1) * TS; m.cut = true; ctx.sound('snip'); ctx.burst(x, y - 10, 8, ['#c8b890', '#8a7a5a'], 60, 0.4, -40); ctx.number(x, y - 34, LW3_SAY.moor, '#bfe6f5'); } }); }
    return out; };

  /* ---------- A MOVER OF OURS: a boat where her tide puts her (held under at her mooring until it is cut) ---------- */
  H.mover = (m, dt) => {
    if (m.lw3 !== 'float' || !TK()) return false;
    const oy = m.y, moored = m.moor && S && S.moors[m.moor] && !S.moors[m.moor].cut;
    const y = moored ? m.rest : floatY(TK(), m.fid); if (y != null) m.y = y; m.x = m.x0; m.dx = 0; m.dy = m.y - oy;
    if (moored && m === nearMoored() && kOf(TK(), m.tide) > 0.6 && !S.told.moored) { S.told.moored = 1; ctx.number(m.x + m.w / 2, m.y - 30, LW3_SAY.moored, '#9ab0c0'); }
    return true;
  };
  const nearMoored = () => { const P = ctx.hero(); if (!P) return null; return lv().moversExtra.find(q => q.lw3 === 'float' && q.moor && Math.abs(q.x + q.w / 2 - P.x) < 90) || null; };

  /* ---------- DRAWING (GREYBOX: the art pass owes the bells, wheels, boats, traps, crabs, the village, the lighthouse and the Herald's new poses) ---------- */
  H.drawBack = (g, cx, cy, t) => {
    if (!S) return; const VW = ctx.VW(), L = lv();
    /* THE TIDE-CLOCK LIGHTHOUSE on the headland: in view the whole level - far back (parallax), its dial the bay's tide (A3) */
    { const wx = 645 * TS, px = R((wx - cx) * 0.12 + VW * 0.78), base = R(30 * TS - cy * 0.12 - 40); const gb = gauge(TK(), 'bay');
      g.globalAlpha = 0.55; g.fillStyle = '#a8b4bc'; g.fillRect(px - 6, base - 70, 12, 70); g.fillStyle = '#8a969e'; g.fillRect(px - 8, base - 74, 16, 6);
      g.fillStyle = '#e8c070'; g.fillRect(px - 4, base - 82, 8, 8);   /* the lantern: amber */
      const dx = px, dy = base - 50; g.fillStyle = '#dfe8ec'; g.beginPath(); g.arc(dx, dy, 7, 0, Math.PI * 2); g.fill();
      if (gb) { const a = Math.PI * (0.75 + 1.5 * gb.k); g.strokeStyle = gb.tell && Math.sin(t * 12) > 0 ? '#ffd36b' : '#2a4a5a'; g.lineWidth = 2; g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx + Math.cos(a) * 6, dy + Math.sin(a) * 6); g.stroke(); g.lineWidth = 1; }
      g.globalAlpha = 1; }
    /* the village (props) */
    for (const p of L.lw3Props || []) { const x = R(p.x * TS + 8 - cx), y = R((p.y + 1) * TS - cy); if (x < -60 || x > VW + 60) continue;
      if (p.kind === 'smokehouse') { g.fillStyle = '#4a4440'; g.fillRect(x - 12, y - 26, 24, 26); g.fillStyle = '#6a5e54'; g.fillRect(x - 14, y - 30, 28, 5); g.fillStyle = '#e8c070'; g.fillRect(x - 3, y - 14, 6, 6);
        if (Math.random() < 0.15) ctx.parts().push({ x: p.x * TS + 8 + (Math.random() - 0.5) * 6, y: (p.y + 1) * TS - 32, vx: 6 + Math.random() * 6, vy: -14 - Math.random() * 8, life: 1.6, max: 1.6, col: 'rgba(220,226,230,0.5)', size: 2, grav: -2 }); }
      if (p.kind === 'millwheel') { g.strokeStyle = '#3a3a3a'; g.lineWidth = 2; const a = t * (kOf(TK(), 'race') > 0.3 ? 1.6 : 0.1); g.beginPath(); g.arc(x, y - 22, 20, 0, Math.PI * 2); g.stroke();
        for (let i = 0; i < 6; i++) { const b = a + i * Math.PI / 3; g.beginPath(); g.moveTo(x, y - 22); g.lineTo(x + Math.cos(b) * 20, y - 22 + Math.sin(b) * 20); g.stroke(); } g.lineWidth = 1; }
      if (p.kind === 'lighthouse') { g.fillStyle = '#b8c4cc'; g.fillRect(x - 9, y - 120, 18, 120); g.fillStyle = '#a03a30'; g.fillRect(x - 9, y - 90, 18, 8); g.fillRect(x - 9, y - 50, 18, 8);
        g.fillStyle = '#e8c070'; g.fillRect(x - 6, y - 134, 12, 12); const gb = gauge(TK(), 'bay'); g.fillStyle = '#eef4f6'; g.beginPath(); g.arc(x, y - 104, 9, 0, Math.PI * 2); g.fill();
        if (gb) { const a = Math.PI * (0.75 + 1.5 * gb.k); g.strokeStyle = '#1a2a34'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 104); g.lineTo(x + Math.cos(a) * 8, y - 104 + Math.sin(a) * 8); g.stroke(); g.lineWidth = 1; } } }
    for (const l of S.locals) { if (l.hide > 0) continue; const x = R(l.px - cx), y = R((l.y + 1) * TS - cy); if (x < -20 || x > VW + 20) continue; g.fillStyle = '#5a6a72'; g.fillRect(x - 3, y - 12, 6, 9); g.fillStyle = '#e0c8a8'; g.fillRect(x - 2, y - 15, 4, 3); g.fillStyle = '#3a3a3a'; g.fillRect(x - 2, y - 3, 2, 3); g.fillRect(x + 1, y - 3, 2, 3); }
    for (const gl of S.gulls) { const x = R(gl.x * TS + 8 - cx), y = R((gl.y + 1) * TS - cy); if (x < -30 || x > VW + 30) continue; g.fillStyle = '#8a7a5a'; g.fillRect(x - 3, y - 2, 6, 2);
      for (let i = 0; i < 3; i++) { const hx = x - 8 + i * 8 + R(Math.sin(gl.t * 3 + i) * 2), hy = y - 4 - R(gl.up * (10 + i * 6)) - (gl.up > 0 ? R(Math.abs(Math.sin(gl.t * 14 + i)) * 2) : 0);
        g.fillStyle = '#eef0f0'; g.fillRect(hx - 2, hy - 2, 4, 3); g.fillStyle = '#9aa0a4'; if (gl.up > 0.2) { g.fillRect(hx - 5, hy - 3 + R(Math.sin(gl.t * 20 + i)), 3, 1); g.fillRect(hx + 2, hy - 3 + R(Math.sin(gl.t * 20 + i)), 3, 1); } } }
    /* the bells and the wheels */
    for (const T0 of TK().tides) for (const v of T0.verbs) { const x = R(v.x * TS + 8 - cx), y = R((v.y + 1) * TS - cy); if (x < -30 || x > VW + 30) continue;
      if (v.t === 'bell') { g.fillStyle = '#3a3a44'; g.fillRect(x - 1, y - 24, 2, 24); g.fillRect(x - 7, y - 24, 14, 2); const sw = R(Math.sin(t * 18) * 3 * v.swing);
        g.fillStyle = '#b08a3a'; g.fillRect(x - 5 + sw, y - 22, 10, 9); g.fillStyle = '#e0c070'; g.fillRect(x - 4 + sw, y - 21, 2, 7); }
      if (v.t === 'sluice') { const held = T0.hold > 0, a = held ? t * 4 : 0; g.strokeStyle = '#6a6e74'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 14, 9, 0, Math.PI * 2); g.stroke();
        for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 2; g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + Math.cos(b) * 9, y - 14 + Math.sin(b) * 9); g.stroke(); } g.lineWidth = 1;
        g.fillStyle = '#4a4e54'; g.fillRect(x - 2, y - 6, 4, 6);
        if (held) { const k = T0.hold / (v.hold || 6); g.fillStyle = '#ffd36b'; g.fillRect(x - 10, y - 28, R(20 * k), 2); }
        else if (v.cool > 0) { g.fillStyle = '#9ab0c0'; g.fillRect(x - 10, y - 28, R(20 * Math.min(1, v.cool / LW3_HANDS.wheelCool)), 1); } } }
    /* the moorings */
    for (const id in S.moors) { const m = S.moors[id]; const x = R(m.x * TS + 8 - cx), y = R((m.y + 1) * TS - cy); if (x < -30 || x > VW + 30) continue;
      g.fillStyle = '#5a5048'; g.fillRect(x - 2, y - 14, 4, 14); if (!m.cut) { const b = lv().moversExtra.find(q => q.fid === m.boat); if (b) { g.strokeStyle = '#c8b890'; g.beginPath(); g.moveTo(x, y - 10); g.lineTo(R(b.x + b.w - cx), R(b.y - cy) + 2); g.stroke(); } } }
    /* the jellies in a live bite box */
    for (const T0 of TK().tides) for (const b of T0.T.bites || []) { const live = T0.T.mode !== 'manual' && (b.when === 'high' ? T0.k >= (b.at ?? 0.85) : T0.k <= (b.at ?? 0.15)); if (!live) continue;
      const ly = lineY(TK(), T0.id); for (let i = 0; i < 8; i++) { const wx = (b.x0 + ((i * 37) % (b.x1 - b.x0 + 1))) * TS + 8, wy = Math.max(ly + 10, (b.y0 + ((i * 13) % (b.y1 - b.y0 + 1))) * TS) + Math.sin(t * 2 + i) * 6;
        const x = R(wx - cx), y = R(wy - cy); if (x < -10 || x > VW + 10) continue; g.globalAlpha = 0.7; g.fillStyle = '#e2c8ff'; g.fillRect(x - 3, y - 2, 6, 3); g.fillStyle = '#c8a8e8'; g.fillRect(x - 2, y + 1, 1, 3); g.fillRect(x + 1, y + 1, 1, 3); g.globalAlpha = 1; } }
  };
  H.drawMover = (g, m, cx, cy) => {
    if (m.lw3 !== 'float') return false; const x = R(m.x - cx), y = R(m.y - cy), w = R(m.w);
    /* a tarred, barnacled fishing boat: her deck the platform (timber is right here: she IS a boat) */
    g.fillStyle = '#2a2622'; g.beginPath(); g.moveTo(x - 2, y); g.lineTo(x + w + 2, y); g.lineTo(x + w - 4, y + 10); g.lineTo(x + 4, y + 10); g.closePath(); g.fill();
    g.fillStyle = '#4a3e34'; g.fillRect(x, y, w, 2); g.fillStyle = '#c8c0b0'; for (let i = 4; i < w - 2; i += 7) g.fillRect(x + i, y + 6, 2, 1);
    g.fillStyle = '#6a5a48'; g.fillRect(x + R(w / 2) - 1, y - 18, 2, 18); return true;
  };
  H.drawEnt = (g, e, cx, cy, t) => {
    if (e.t !== 'poolcrab') return; const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1;
    if (e.mode === 'buried') { g.fillStyle = '#c8b890'; g.fillRect(x - 6, y - 1, 12, 1); g.fillStyle = '#2a2020'; g.fillRect(x - 3, y - 4, 1, 3); g.fillRect(x + 2, y - 4, 1, 3); g.fillStyle = '#f0e8d0'; g.fillRect(x - 3, y - 5, 1, 1); g.fillRect(x + 2, y - 5, 1, 1); return; }
    if (e.mode === 'emerge' || e.mode === 'digTell') { for (let i = 0; i < 4; i++) { g.fillStyle = '#c8b890'; g.fillRect(x - 7 + R(Math.random() * 14), y - 2 - R(Math.random() * 4), 2, 2); } }
    const flip = e.mode === 'flipped', sink = e.mode === 'emerge' ? R(6 * Math.max(0, e.modeT / PCM.PC.emerge)) : e.mode === 'digTell' ? R(6 * (1 - Math.max(0, e.modeT / PCM.PC.dig))) : 0;
    g.fillStyle = flip ? '#e8c8a8' : '#b8483a'; g.fillRect(x - 7, y - 7 + sink, 14, 6); g.fillStyle = '#e07060'; g.fillRect(x - 6, y - 8 + sink, 12, 2);
    g.fillStyle = '#7a2a22'; for (const dx of [-6, -3, 3, 6]) g.fillRect(x + dx, y - 2 + sink, 1, 2);
    if (!flip) { const up = e.mode === 'pinchTell', open = e.mode === 'rec'; g.fillStyle = open ? '#ffd36b' : '#c9563d';
      g.fillRect(x + f * 7 - (f < 0 ? 4 : 0), y - (up ? 14 : 8) + sink, 4, 4); g.fillRect(x - f * 7 - (f > 0 ? 3 : 0), y - 7 + sink, 3, 3);
      g.fillStyle = '#1a1414'; g.fillRect(x - 2, y - 10 + sink, 1, 2); g.fillRect(x + 1, y - 10 + sink, 1, 2); }
    if (PCM.pcOpen(e) && Math.sin(t * 10) > 0) { g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(x, y - 5, 10, 0, Math.PI * 2); g.stroke(); }
  };
  H.drawOver = (g, cx, cy, t) => {
    if (!S) return; const L = lv(), VW = ctx.VW();
    /* the race's current streaks while it runs */
    for (const r of L.lw3Races || []) { if (kOf(TK(), r.id) < 0.3) continue; const ly = lineY(TK(), r.id); for (let i = 0; i < 10; i++) { const wx = (r.x0 + ((i * 7 + R(t * 9)) % (r.x1 - r.x0 + 1))) * TS, wy = ly + 12 + (i * 11) % 80;
      const x = R(wx - cx), y = R(wy - cy); if (x < -20 || x > VW) continue; g.fillStyle = 'rgba(223,242,248,0.5)'; g.fillRect(x, y, 8, 1); } }
    /* the traps (over the water: a basket on one rope) */
    for (const tr of S.traps) { const x = R(tr.x * TS + 8 - cx), y = R(tr.py - cy); if (x < -20 || x > VW + 20) continue;
      if (tr.st === 'hang') { g.strokeStyle = '#c8b890'; g.beginPath(); g.moveTo(x, R((tr.y - 3) * TS - cy)); g.lineTo(x, y); g.stroke(); g.fillStyle = '#3a3a34'; g.fillRect(x - 10, R((tr.y - 3) * TS - cy) - 2, 20, 2); }
      g.fillStyle = '#6a5e48'; g.fillRect(x - 6, y, 12, 12); g.fillStyle = '#8a7e64'; for (let i = 0; i < 12; i += 3) g.fillRect(x - 6 + i, y, 1, 12); if (tr.kind === 'coins' && tr.st === 'hang') { g.fillStyle = '#ffd34a'; g.fillRect(x - 2, y + 4, 4, 3); } }
    /* THE HERALD's reads: gold ring + timer open, grey warded, the move's word, the wave's crest, the water spears, the undertow */
    const B = ctx.boss; if (Q && B && B.lw3 && B.alive) { const x = R(B.x - cx), y = R(B.y - cy);
      if (THM.thOpen(B)) { const k = B.open / (B.mode === 'mired' ? (Q.ph === 2 ? THM.TH.mireP2 : THM.TH.mire) : THM.TH.thrust.reel); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 18, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
        g.fillStyle = '#ffd36b'; g.fillRect(x - 16, y - 54, R(32 * k), 2); }
      else if (Q.ward > 0) { g.strokeStyle = '#9ab0c0'; g.beginPath(); g.arc(x, y - 18, 26, 0, Math.PI * 2); g.stroke(); }
      if (B.mode === 'callTell') { g.strokeStyle = 'rgba(124,200,200,' + (0.4 + 0.4 * Math.sin(t * 12)) + ')'; g.beginPath(); g.arc(x, y - 30, 10 + ((t * 30) % 16), 0, Math.PI * 2); g.stroke(); }
      if (WORD && ctx.text) { const M = THM.MOVES[WORD.k]; if (M) ctx.text(THM.MOVE_NAME[WORD.k] + ': ' + M.answer, x, y - 66, M.mark === '!' ? '#ffd36b' : '#ff6b6b'); }
      if (Q.wave) { const wx = R(Q.wave.x - cx), top = R(lineY(TK(), 'square') - cy) - 20, bot = R(L.arena.floor - cy) + 2; g.globalAlpha = 0.85; g.fillStyle = '#7cc8c8'; g.beginPath(); g.moveTo(wx - Q.wave.dir * 30, bot); g.quadraticCurveTo(wx - Q.wave.dir * 4, top - 2, wx + Q.wave.dir * 6, top + 4); g.lineTo(wx + Q.wave.dir * 4, bot); g.closePath(); g.fill(); g.globalAlpha = 1; }
      for (const s of Q.spears) { const sx = R(s.x - cx), fy = R(L.arena.floor - cy); if (s.t < 0) { if (Math.sin(t * 30) > 0) { g.fillStyle = '#7cc8c8'; g.fillRect(sx - 6, fy - 3, 12, 2); } continue; }
        const hh = R(54 * Math.min(1, s.t / 0.12) * (1 - Math.max(0, s.t - 0.35) / 0.2)); g.globalAlpha = 0.85; g.fillStyle = '#4aa0a8'; g.fillRect(sx - 5, fy - hh, 10, hh); g.fillStyle = '#e8f4f0'; g.fillRect(sx - 2, fy - hh, 4, Math.min(8, hh)); g.globalAlpha = 1; }
      if (Q.pull > 0) { for (let i = 0; i < 12; i++) { const a = t * 4 + i, r = 30 + ((t * 80 + i * 13) % 140); g.fillStyle = '#7cc8c8'; g.fillRect(x + R(Math.cos(a) * r), y - 6 - (i % 3) * 4, 3, 1); } } }
  };
  /* ---------- THE WATER HOOKS (the generic wiring's ctx.hooks(): this level's words, sounds, verbs, the Herald's flats, the foam and the gauge on the one kit) ---------- */
  H.water = {
    gadgets: () => H.gadgets(),   /* (claude/seagadget) the trap ropes and the moorings, struck by a blow or any hero's shot through the ONE hook */
    noRespawn: true,   /* (kept from the level's own wiring: a load starts the tides at their first phase, not tideRespawn's safe phase) */
    tide(ev) { if (!S) return false; const P = ctx.hero();
      if (ev.t === 'toll' && tideNear(ev.id)) ctx.sound(ev.turn ? 'tollTurn' : 'toll');
      if (ev.t === 'toll' && ev.id === 'bay') for (const l of S.locals) l.hide = LW3_HANDS.hideT;   /* the village hears its bell: in they go */
      if (ev.t === 'phase' && ev.id === 'race' && ev.ph === 'warn' && near(LW3.race.x0 * TS, 500)) ctx.number(P.x, P.y - 34, 'THE RACE IS COMING BACK', '#bfe6f5');
      return true; },
    step(dt) { if (!S) return; const sq = tideS('square');   /* THE FLATS: the Herald's sea (between the kit's step and its write) */
      if (sq && Q && ctx.boss && ctx.boss.lw3 && ctx.boss.alive && ctx.bossActive) {
        if (S.calledHigh && sq.ph === 'high') { sq.t = Math.min(sq.t, LW3.square.calledHigh); S.calledHigh = false; }
        if (S.dip > 0) { S.dip -= dt; if (S.dip <= 0 && Q.sea === 'his') squareCmd('his'); }
        else if (Q.sea === 'his' && ctx.boss.mode !== 'mired') { if (sq.ph === 'high') sq.t = Math.max(sq.t, 5); else if (sq.ph === 'low' || sq.ph === 'fall' || sq.ph === 'turn' || sq.ph === 'warn') squareCmd('his'); }
      } },
    pre() { return S && TK() ? gauge(TK(), 'square') : undefined; },   /* the flats' tide before the blow (the Herald's bell / sluice answers compare it) */
    verb(v, hb, sqBefore) { if (!S) return false;
      const vv = tideS(v.tide).verbs.find(q => q.x === v.x && q.y === v.y);
      if (v.t === 'sluice' && vv) vv.cool = LW3_HANDS.wheelCool;
      ctx.sound(v.t === 'bell' ? 'bell' : 'wheel');
      if (v.t === 'bell' && !S.told.bell) { S.told.bell = 1; ctx.number(v.x * TS + 8, v.y * TS - 20, LW3_SAY.bell, '#bfe6f5'); }
      if (v.t === 'sluice' && !S.told.sluice) { S.told.sluice = 1; ctx.number(v.x * TS + 8, v.y * TS - 20, LW3_SAY.sluice, '#bfe6f5'); }
      if (v.tide === 'square' && Q && ctx.boss && ctx.boss.lw3) { if (v.t === 'bell') THM.bellStruck(ctx.boss, Q, world(ctx.boss), sqBefore); else THM.sluiceStruck(ctx.boss, Q, world(ctx.boss), sqBefore); }
      return true; },
    miss(hb) { if (!S) return;
      for (const T0 of TK().tides) for (const q of T0.verbs) if (q.t === 'sluice' && q.cool > 1.3) { const x = q.x * TS + 8, y = (q.y + 1) * TS;
        if (hb.l < x + 11 && hb.r > x - 11 && hb.t < y - 4 && hb.b > y - 30 && !S.told.wound) { S.told.wound = 1; ctx.number(x, y - 34, LW3_SAY.wound, '#9ab0c0'); } } },
    foam(g, x0, x1, y, t, ph) { if (!S || x1 <= x0) return; y -= 1; g.fillStyle = ph === 'warn' ? 'rgba(255,255,255,0.85)' : 'rgba(223,242,248,0.6)'; for (let x = x0 - (x0 % 6) + R(t * 20) % 6; x < x1; x += 6) g.fillRect(x, y, 3, 1); },
    /* THE A3 GAUGE: the tide you are by (the bay, the race, the harbour, the flats) - art owed: the dial */
    gauge(g, t, P) { if (!S) return; const L = lv(), T0 = TK().tides.find(q => (q.T.pools || []).some(id => { const p = L.pools.find(pp => pp.id === id); return p && P.x >= p.x0 - 200 && P.x <= p.x1 + 40; })); if (!T0) return;
      const gg = gauge(TK(), T0.id), x = 6, y = 30, h = 24; g.fillStyle = 'rgba(10,14,22,0.7)'; g.fillRect(x, y, 10, h + 4);
      g.fillStyle = gg.tell && Math.sin(t * 16) > 0 ? '#ffffff' : '#7cc8e8'; const fh = R(h * gg.k); g.fillRect(x + 2, y + 2 + h - fh, 6, Math.max(1, fh));
      if (gg.coming === 'in') { g.fillStyle = '#ffd36b'; g.fillRect(x + 11, y + 2, 3, 3); } if (gg.coming === 'out') { g.fillStyle = '#9ab0c0'; g.fillRect(x + 11, y + h - 2, 3, 3); }
      if (gg.held) { g.fillStyle = '#ffd36b'; g.fillRect(x, y + h + 6, R(10 * Math.min(1, gg.holdLeft / 10)), 2); } },
  };
  H.barName = e => 'THE TIDE HERALD' + (e.mode === 'mired' && e.open > 0 ? '  IN THE MUD' : e.mode === 'reel' && e.open > 0 ? '  PARRIED' : Q && Q.ward > 0 ? '  WARDED' : Q && Q.ph === 2 && Q.sea === 'his' ? '  THE SEA IS HIS' : e.mode === 'callTell' ? '  CALLING THE SEA' : '');
  H.end = e => { if (Q && e && (!e.alive || e.hp <= 0)) { Q.dead = true; Q.wave = null; Q.spears = []; Q.pull = 0; ctx.number(e.x, e.y - 70, THM.TH_SAY.down, '#7cc8c8'); }
    const s = tideS('square'); if (s) { s.hold = 0; s.ph = 'fall'; s.t = 1.2; } if (Q) Q.sea = 'free'; };
  H.read = () => S && { tides: TK().tides.map(s => ({ id: s.id, ...gauge(TK(), s.id) })), traps: S.traps.map(t => ({ id: t.id, st: t.st })), moors: Object.values(S.moors).map(m => ({ id: m.id, cut: m.cut })),
    herald: Q && { ph: Q.ph, sea: Q.sea, lured: Q.lured, wet: Q.wet, ward: Q.ward, n: { ...Q.n },
      plan: ctx.boss && ctx.boss.lw3 ? THM.thPlan(ctx.boss, Q, gauge(TK(), 'square'), lv().arena.bellX, lv().arena.sluiceX) : null } };
  H.herald = () => Q; H.kit = () => TK(); H.state = () => S;
  return H;
}
