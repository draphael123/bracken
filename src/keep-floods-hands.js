// src/keep-floods-hands.js - KEEP 2's WORLD BINDING (claude/keepfloods, OPUS greybox, 11-06). Behind KF_SHIPS: main.js makes these hands only when kfOn().
// The floodgates run on THE WATER KIT (src/tide-kit.js: tideInit / tideStep / tideApply / tideStrike / tideRespawn / gauge - no second engine): every
// chamber is a manual kit chamber on its own pool; the throne room is a manual chamber in phase one (the lever drains it, his decree floods it) and the
// kit's told CYCLE in phase two (the curse tide: 3 tolls in, 1 out). The Drowned King 2 is src/drowned-king2.js; this file hands it the world and draws
// the greybox (levers, the water-line dials, the decree gate, the trident, every tell). The knights placed in a chamber are FLOOR-BOUND (too heavy in their
// plate to rise: main.js updateDrownedKnight reads e.floorBound) - flooded, you swim over them; drained, they walk to you.
import { gauge, kOf } from './tide-kit.js';   /* (claude/sea2) reads only: the kit is built, stepped, written and struck in src/pirate-fleet-hands.js (ctx.pfh), through H.water below */
import { KF_CURSE } from './keep-floods.js';
import { k2Init, k2Step, k2Take, k2Frame, k2Lever, K2 } from './drowned-king2.js';

export function makeKeepFloodsHands(ctx) {
  const TS = ctx.TS;
  let lvRef = null, life = -1, gate = null, shots = [], said = new Set(), lastLeverT = -9;
  const L = () => ctx.L, on = () => !!(L() && L().keepFloods && L().tides), kitOf = () => (ctx.pfh && ctx.pfh.kit()) || null;
  const S = id => { const k = kitOf(); return k && k.tides.find(s => s.id === id); };
  const throneP = () => (L().pools || []).find(p => p.id === 'kfthrone');
  const KT = () => L().kfThrone;
  function arena() {
    const A = L().arena, Th = KT();
    return { x0: A.x0, x1: A.x1, floor: A.floor, y0: A.y0, xmin: (A.wallL + 1) * TS + 16, xmax: A.wallR * TS - 16, ymin: A.y0 + 4 * TS + 32,
      gateX: Th.gateCol * TS + 8, gateCol: Th.gateCol };
  }
  /* THE DECREE GATE: a column of portcullis over the throne room's floor. Down = PORT tiles (solid to every body; a hurled trident goes through the bars) */
  function dropGate(pinOn) {
    const Th = KT(); if (!Th) return; const col = Th.gateCol, y1 = pinOn ? Math.max(Th.top, Math.floor((pinOn.y - pinOn.h) / TS) - 1) : 58;
    gate = gate || { cells: [] };
    for (let y = Th.top; y <= 58; y++) { const was = L().grid[y * L().W + col]; if (y <= y1 && was !== ctx.T.PORT) { gate.cells.push([col, y, was]); ctx.cellSet(col, y, ctx.T.PORT); } }
    gate.down = true; gate.pin = !!pinOn;
    for (const b of ctx.players || []) if (b && !b.dead && Math.abs(b.x - (col * TS + 8)) < 12) b.x = b.x < col * TS + 8 ? col * TS - 7 : (col + 1) * TS + 7;   /* the gate never shuts on you */
    ctx.sfx.gateDrop ? ctx.sfx.gateDrop() : (ctx.sfx.clank(), ctx.sfx.heavy && ctx.sfx.heavy());
  }
  function liftGate() { if (!gate) return; for (const [x, y, t] of gate.cells) ctx.cellSet(x, y, t); gate = null; if (ctx.sfx.gateLift) ctx.sfx.gateLift(); }
  function reset(full) {
    const Lv = L(); if (!Lv) return;
    /* a death / a load (the generic wiring built the kit and respawned it): the chambers stay as their levers left them (marks), the throne room floods, the curse tide waits at high */
    const th = S('throne'); if (th) { th.ph = 'high'; th.k = 1; }
    const cu = S('curse'); if (cu) { cu.ph = 'high'; cu.t = 1e9; cu.k = 1; }
    const tp = throneP(); if (tp) tp.tide = 'throne';
    liftGate(); shots = [];
    capAll();
  }
  function capAll() { for (const p of L().pools || []) if (p.kfPool) { const s = S(p.tide); if (s) p.capped = s.k >= 0.999; } }
  const inChamber = e => (L().kfChambers || []).some(c => e.x >= c.x0 * TS && e.x <= (c.x1 + 1) * TS && e.y > c.top * TS && e.y <= 59 * TS);
  const bossK = () => { const b = ctx.boss; return b && b.t === 'drownedking' && b.alive && b.k2 ? b : null; };

  function c2(e) {
    const P = ctx.hero(), A = arena();
    return { A, P,
      water: () => kOf(kitOf(), throneP() ? throneP().tide : 'throne'),
      flood: ph => { const s = S('throne'); if (s) s.ph = ph; },
      curse: () => { const tp = throneP(), cu = S('curse'); if (tp) tp.tide = 'curse'; if (cu) { cu.ph = 'high'; cu.t = KF_CURSE.high; cu.k = 1; cu.toll = 0; } },
      dropGate: pin => dropGate(pin), liftGate: () => liftGate(),
      move: (b, dx, dy) => ctx.moveBody(b, dx, dy, true) || {},
      solid: (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return tx !== KT().gateCol && ctx.isSolid(tx, ty); },
      hurt: (x, dmg, o) => ctx.damagePlayer(x, dmg, { who: e, ...o }),
      say: (x, y, t, col) => ctx.number(x, y, t, col), mark: (b, m) => ctx.number(b.x, b.y - b.h - 24, m, m === '!!' ? '#ff6b6b' : '#ffd36b'),
      sfx: k => sfx(k), shake: n => ctx.shake(n), shot: o => shots.push(o),
      breath: d => { const p = ctx.hero(); if (p) p.breath = Math.max(0, (p.breath ?? 6) - d); },
    };
  }
  function sfx(k) {
    const X = ctx.sfx, f = { thrust: 'foeSlash', sweep: 'slash', hurl: 'throwWhoosh', stick: 'clank', recall: 'rattle', decree: 'heavy', decreeTell: 'charge', pin: 'stone',
      curse: 'roar', roar: 'roar', grasp: 'stone', leech: 'gasp', prong: 'throwWhoosh', shell: 'clank', drain: 'gateLift', clank: 'clank' }[k];
    if (f && X[f]) X[f](); if (k === 'decree' && X.seaBell) X.seaBell();
  }

  function update(dt) {
    if (!on()) return;
    const Lv = L(), ln = ctx.life();
    if (Lv !== lvRef) { lvRef = Lv; life = ln; said = new Set(); reset(true); }
    else if (ln !== life) { life = ln; reset(false); }
    const P = ctx.hero(), boss = bossK(), fight = !!(ctx.bossActive && boss);
    /* the knights in a chamber are floor-bound (decided once per body) */
    for (const e of ctx.enemies || []) if (e.t === 'drownedknight' && e.floorBound === undefined) e.floorBound = inChamber(e);
    /* the throne room waits flooded, with its gate up, until the fight; the curse tide waits at high until he is cursed */
    if (!fight) { const th = S('throne'); if (th && (th.ph !== 'high' || throneP().tide !== 'throne')) { th.ph = 'high'; throneP().tide = 'throne'; } if (gate && !(boss && boss.pinned)) liftGate(); }
    const cu = S('curse'); if (cu && !(fight && boss.k2.ph === 2)) { cu.ph = 'high'; cu.t = 1e9; cu.k = 1; }
    /* (the kit's step, its events, the pool write and a blow on a lever run in the ONE generic wiring, through H.water below) */
    /* THE CURSED TRIDENT's prongs */
    for (const s of shots) { s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (ctx.isSolid(Math.floor(s.x / TS), Math.floor(s.y / TS))) s.life = 0;
      for (const b of ctx.players || []) if (b && !b.dead && s.life > 0 && Math.abs(b.x - s.x) < 9 && Math.abs((b.y - 10) - s.y) < 12) { s.life = 0; ctx.damagePlayer(s.x, s.dmg, { unblockable: true, who: boss, blow: 'the cursed prong' }); } }
    shots = shots.filter(s => s.life > 0);
    /* first sight of a chamber: its rule, once a load */
    for (const c of Lv.kfChambers || []) if (P && !said.has(c.id) && P.x > c.x0 * TS && P.x < (c.x1 + 1) * TS) { said.add(c.id); ctx.number(P.x, P.y - 46, c.name, '#7ff0e0'); }
  }

  function king(e, dt) {
    if (!on() || e.t !== 'drownedking') return false;
    if (!e.k2) { if (e.mode === 'sleep') return false; k2Init(e); }
    if (!ctx.bossActive && e.mode === 'sleep') return false;
    k2Step(e, dt, c2(e));
    return true;
  }
  const owns = e => on() && e && e.t === 'drownedking' && !!e.k2;
  const take = (e, dmg, plunge, tag) => (void tag, k2Take(e, dmg, plunge));   /* (claude/sea3: every boss hook gets the blow's tag, tools/blow-tags.mjs; the king reads the plunge boolean the caller built from it) */
  const frame = e => (owns(e) ? k2Frame(e) : undefined);

  /* ---------------- THE GREYBOX (art owed: the verdigris lever + the A3 dial, the floodgate frames, the decree gate, the trident, the cursed model) ---------------- */
  function drawOver(g, cx, cy, time) {
    if (!on() || !kitOf()) return;
    const Lv = L(), rect = (x, y, w, h, col, a = 1) => { g.globalAlpha = a; g.fillStyle = col; g.fillRect(Math.round(x - cx), Math.round(y - cy), w, h); g.globalAlpha = 1; };
    const line = (x0, y0, x1, y1, col, a = 1, dash) => { g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 1; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(Math.round(x0 - cx) + 0.5, Math.round(y0 - cy) + 0.5); g.lineTo(Math.round(x1 - cx) + 0.5, Math.round(y1 - cy) + 0.5); g.stroke(); g.restore(); };
    const ring = (x, y, r, col, a = 1) => { g.save(); g.globalAlpha = a; g.strokeStyle = col; g.beginPath(); g.arc(Math.round(x - cx), Math.round(y - cy), r, 0, Math.PI * 2); g.stroke(); g.restore(); };
    /* every lever + its water-line dial (the one A3 drawing; greybox = a bar beside the lever) */
    for (const s of kitOf().tides) for (const v of s.verbs) {
      const x = v.x * TS + 8, y = (v.y + 1) * TS, sw = v.swing || 0, k = s.k;
      rect(x - 2, y - 4, 5, 4, '#3f6f62'); line(x, y - 4, x + (v.thrown ? 6 : -6) * (1 - sw * 0.5), y - 16, '#c9a83a');
      rect(x + 7, y - 22, 4, 20, '#14222a', 0.8); rect(x + 7, y - 2 - Math.round(18 * k), 4, Math.round(18 * k), '#7ff0e0', 0.9);
      const P = ctx.hero(); if (P && Math.abs(P.x - x) < 90 && Math.abs(P.y - y) < 90 && !s.T.throne) rect(x - 1, y - 30 + Math.sin(time * 4) * 2, 3, 3, '#ffd36b', 0.8);
    }
    /* the floodgate frames at each chamber's sumps (greybox: verdigris posts) */
    for (const c of Lv.kfChambers || []) for (const xx of [c.x0, c.x1]) rect(xx * TS + 6, c.sump * TS, 4, (59 - c.sump) * TS, '#3f8f7d', 0.35);
    const Th = Lv.kfThrone, boss = bossK();
    if (!Th) return;
    const gx = Th.gateCol * TS + 8;
    if (gate && gate.down) for (let y = Th.top; y <= 58; y++) { rect(gx - 7, y * TS, 2, TS, '#6a7480'); rect(gx - 1, y * TS, 2, TS, '#6a7480'); rect(gx + 5, y * TS, 2, TS, '#6a7480'); if (y % 2) rect(gx - 7, y * TS + 6, 14, 2, '#4a525c'); }
    if (!boss || !ctx.bossActive) return;
    const e = boss, s = e.k2, A = arena(), cyb = e.y - 16;
    /* the gate column: red while he decrees, gold while he is under it (THE LEVER, NOW) */
    if (e.mode === 'decreeTell') rect(gx - 8, Th.top * TS, 16, (59 - Th.top) * TS, '#ff6b6b', 0.12 + 0.1 * Math.sin(time * 18));
    if (e.underGate && !gate) { rect(gx - 8, Th.top * TS, 16, (59 - Th.top) * TS, '#ffd36b', 0.16 + 0.1 * Math.sin(time * 12)); for (const [lx, ly] of Th.levers) ring(lx * TS + 8, ly * TS + 6, 12 + 2 * Math.sin(time * 10), '#ffd36b', 0.8); }
    /* the trident: in his hand, in flight, in the wall, and the line it will come back down */
    const T = s.tr;
    if (T.out) { line(T.x - Math.sign(T.vx || 1) * 14, T.y, T.x, T.y, '#c9d1dc'); rect(T.x - 1, T.y - 3, 3, 7, '#e8f4f0');
      if (e.mode === 'recallTell') line(T.x, T.y, e.x, cyb, '#ffd36b', 0.7, [2, 3]); }
    else { const ax = e.face; line(e.x + ax * 4, cyb + 8, e.x + ax * 26, cyb - 6, e.cursed ? '#8ff0dc' : '#c9a83a'); }
    if (e.mode === 'thrustTell' && s.aim) line(e.x, cyb, e.x + s.aim[0] * K2.thrustReach, cyb + s.aim[1] * K2.thrustReach, '#ffd36b', 0.5 + 0.3 * Math.sin(time * 20), [3, 2]);
    if (e.mode === 'hurlTell' && s.aim) line(e.x, cyb, e.x + s.aim[0] * 600, cyb + s.aim[1] * 600, '#ff6b6b', 0.5 + 0.3 * Math.sin(time * 20), [3, 2]);
    if (e.mode === 'sweepTell' || e.mode === 'sweep') { g.save(); g.globalAlpha = e.mode === 'sweep' ? 0.7 : 0.35; g.strokeStyle = '#ff6b6b'; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - 4 - cy), K2.sweepR, 8, 0, 0, Math.PI * 2); g.stroke(); g.restore(); }
    if (s.grasp) { const G = s.grasp; rect(G.x0, A.floor - 4, G.x1 - G.x0, 4, G.live > 0 ? '#8ff0dc' : '#ff6b6b', G.live > 0 ? 0.8 : 0.35 + 0.25 * Math.sin(time * 18));
      if (G.live > 0) for (let x = G.x0 + 6; x < G.x1; x += 12) rect(x, A.floor - 14 - 4 * Math.sin(time * 9 + x), 3, 10, '#c9d8c8', 0.9); }
    if (s.leech) { const P = ctx.hero(); if (P) line(e.x, cyb - 6, P.x, P.y - 10, '#8fd160', 0.6 + 0.3 * Math.sin(time * 14)); }
    for (const p of shots) { rect(p.x - 2, p.y - 2, 4, 4, '#8ff0dc', 0.9); }
    /* the gold (open + timer), the grey (ward), the bone (shell), the green (cursed) */
    if (e.open > 0) { ring(e.x, cyb, 26, '#ffd36b', 0.9); rect(e.x - 14, e.y - e.h - 30, Math.round(28 * Math.min(1, e.open / 3)), 2, '#ffd36b'); }
    else if (s.ward > 0) ring(e.x, cyb, 26, '#9aa39a', 0.7);
    else if (!s.shell && s.k < 0.35) ring(e.x, cyb, 24, '#ffd36b', 0.45);   /* BEACHED: open x1 */
    if (s.shell) ring(e.x, cyb, 22, '#e8dcc0', 0.9);
    if (e.cursed) { rect(e.x - 6, e.y - e.h - 2, 2, 2, '#8fd160'); rect(e.x + 4, e.y - e.h - 2, 2, 2, '#8fd160'); }
    if (e.mode === 'curse') rect(A.x0, A.y0, A.x1 - A.x0, A.floor - A.y0, '#0c2018', 0.25 * (1 - e.modeT / K2.curseT));
    /* HIS TIDE (P2): the gauge, top-left, with its tell */
    if (s.ph === 2) { const gg = gauge(kitOf(), 'curse'); if (gg) { g.fillStyle = '#14222a'; g.fillRect(6, 30, 6, 40); g.fillStyle = gg.tell ? (gg.coming === 'in' ? '#ff6b6b' : '#8fd160') : '#7ff0e0'; g.fillRect(6, 70 - Math.round(40 * gg.k), 6, Math.round(40 * gg.k)); } }
    void lastLeverT;
  }

  /* THE WATER HOOKS (claude/sea2: the ONE wiring, src/pirate-fleet-hands.js header): the keep's words, pins and lever answers on the generic kit step / strike */
  const water = {
    signal: 'curse', quiet: true, noStreaks: true, noPosts: true,
    foam() {}, gauge() {},   /* the greybox draws its own water-line dials and the curse gauge (drawOver) */
    step() { if (on()) capAll(); },   /* between the kit's step and its write: which pools are capped (the pins on the throne / curse phases run in update, before the step) */
    tide(ev) {
      const P = ctx.hero(), boss = bossK(), fight = !!(ctx.bossActive && boss), T = S(ev.id) && S(ev.id).T;
      if (ev.t === 'toll' && ev.id === 'curse' && fight) { if (ctx.sfx.seaBell) ctx.sfx.seaBell(); if (ev.n === 1) ctx.number(arena().gateX, arena().floor - 150, ev.turn ? 'HIS TIDE TURNS: IT GOES OUT' : 'HIS TIDE IS COMING', ev.turn ? '#8fd160' : '#ff6b6b'); }
      if (ev.t === 'phase' && T && T.chamber && P && Math.abs(P.x - (T.floods[0].x0 + T.floods[0].x1) * TS / 2) < 500)
        ctx.number(P.x, P.y - 40, ev.ph === 'low' ? T.chamber + ': DRY' : T.chamber + ': FLOODED', ev.ph === 'low' ? '#8fd160' : '#7ff0e0');
      if (ev.t === 'phase' && ev.id === 'curse' && fight && ev.ph === 'low') ctx.number(boss.x, boss.y - 60, 'HE IS BEACHED: NOW', '#8fd160');
      return true;
    },
    pre() { const th = S('throne'); return th ? th.ph : undefined; },   /* the throne's phase before the blow (its water is the fight's, not the kit's toggle) */
    verb(v, hb, ph0) {
      const P = ctx.hero(), boss = bossK(), fight = !!(ctx.bossActive && boss); if (!on() || !P || P.dead) return true;
      if (v.tide === 'throne') {
        const th = S('throne'); if (th) th.ph = ph0;   /* the throne room's water is the fight's (k2Lever), not the kit's toggle */
        ctx.sfx.clank(); lastLeverT = ctx.time();
        const r = fight ? k2Lever(boss, c2(boss)) : null;
        if (!fight) ctx.number(v.x * TS + 8, v.y * TS - 20, 'HIS FLOODGATE. IT ANSWERS IN THE FIGHT', '#9aa39a');
        else if (r === 'spent') ctx.number(v.x * TS + 8, v.y * TS - 20, 'THE CHAIN IS SLACK', '#9aa39a');
      } else if (v.t === 'lever') {
        const m = ctx.marks(), S1 = S(v.tide);
        if (v.thrown) m.add(v.key); else m.delete(v.key);   /* the kit's lever mark: a chamber stays as you left it through a death and a reload */
        ctx.sfx.clank(); if (ctx.sfx.gateLift) ctx.sfx.gateLift(); ctx.shake(3);
        ctx.number(v.x * TS + 8, v.y * TS - 24, S1.ph === 'low' ? 'THE FLOODGATE OPENS: IT DRAINS' : 'THE FLOODGATE SHUTS: IT FLOODS', '#8fd160');
      }
      return true;
    },
  };
  return { on, update, king, water, owns, take, frame, drawOver, reset, debug: () => ({ kit: kitOf(), gate, shots }) };
}
