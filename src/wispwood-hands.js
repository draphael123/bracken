// src/wispwood-hands.js - WISPWOOD's HANDS (claude/wispwood, the OPUS GREYBOX). src/wispwood.js lays the wood; this runs it:
//   THE LIGHT      every hero's GHOST LANTERN (lit / out / stolen), the grave candles (12 s), the hanging lamps (until snuffed), the waystones (always), a thief's stolen
//                  flame, and any light THE LANTERN WIDOW lends (ctx.extraLights: her great lantern, her false lights).
//   THE SPECTRAL   every pale branch / bridge / rung cell is ONEWAY while a light reaches it and AIR while none does (8 px of hysteresis; originals kept, put back on a reset).
//   SHADOW HANDS   a pool's hand rises at its nearest UNLIT column within reach of a hero, told, and lunges along the ground to where he stood (block / jump / strike it).
//   WISP THIEVES   their own small machine (drift, told swoop, steal, flee with the flame; struck: the flame comes home; escaped: it drowns - relight at any light).
//   THE BLACK MERE a hero who falls past ww.catchY is dragged back (16, spare) onto the last firm footing.
// DRAWING: src/redraw/wispwood_art.js (claude/wispart). main.js calls (one tagged line each): on, reset, update, strike, spawn, thief, takeThief, drawBack, drawOver,
// drawThief, holes, read. Pure enough for node: tools/wispwood.mjs drives it with a fake ctx.
import { WW_SAY } from './ww-lines.js'; import * as ART from './redraw/wispwood_art.js';

export const LIGHT = { lantern: 72, candle: 60, lamp: 80, stone: 80, thief: 44, hyst: 8, burn: 12, gutter: 2, relight: 15, lanternY: 14 };
export const HAND = { reach: 112, near: 3, tell: 0.7, speed: 300, maxT: 0.6, sink: 0.3, dmg: 10, hold: 0.6, cd: 2.4, w: 10, h: 18 };
export const THIEF = { hp: 18, sense: 200, senseY: 110, tell: 0.6, swoop: 0.5, swoopV: 260, flee: 120, escapeT: 14, escapeD: 520, stun: 1.2, drift: 40, dmg: 4, cd: 1.6 };
export const MERE = { dmg: 8 };
const SOUND = { lit: s => (s.ui || s.tell)(), out: s => (s.puff || s.thud || s.tell)(), handTell: s => (s.tell)(), hand: s => (s.whoosh || s.tell)(), banish: s => (s.puff || s.thud)(),
  swoopTell: s => (s.tell)(), swoop: s => (s.whoosh || s.tell)(), steal: s => (s.ghostWake || s.moan || s.tell)(), back: s => (s.ui || s.tell)(), scorch: s => (s.sizzle || s.puff || s.thud)(),
  drag: s => (s.thud)(), relit: s => (s.ui || s.tell)() };
const R = Math.round;

export function makeWispwoodHands(ctx) {
  const H = {}; let S = null;
  const TS = ctx.TS, L = () => ctx.L, ww = () => (L() && L().ww) || null;
  const snd = k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} };
  const say = (x, y, t, col) => ctx.number && ctx.number(x, y, t, col || '#ffd36b');
  const hint = (k, m) => { if (S.told[k]) return; S.told[k] = 1; ctx.hint && ctx.hint(m); };
  H.on = () => !!(L() && L().wispwood);
  H.show = () => S;
  const heroes = () => (ctx.players() || []).filter(p => p && !p.dead);
  const fresh = () => ({ t: 0, cells: new Map(), spec: [], cand: {}, lamp: {}, lan: new Map(), hands: [], poolCd: {}, safe: new Map(), told: {},
    n: { lit: 0, out: 0, real: 0, vanish: 0, hands: 0, handHits: 0, banished: 0, swoops: 0, steals: 0, scorched: 0, back: 0, drowned: 0, relit: 0, caught: 0 } });
  /* ---------------- THE TILES this level changes (the spectral cells): every original kept, every one put back on a reset ---------------- */
  H.setCell = (x, y, t) => { const L0 = L(); if (x < 0 || y < 0 || x >= L0.W || y >= L0.H) return; const k = y * L0.W + x; if (!S.cells.has(k)) S.cells.set(k, L0.grid[k]); ctx.cellSet(x, y, t); };
  H.reset = () => { if (!H.on()) { S = null; return; }   /* another level: nothing of the wood's is put into its grid */
    if (S && S.L === L()) for (const [k, v] of S.cells) { const L0 = L(); ctx.cellSet(k % L0.W, Math.floor(k / L0.W), v); }   /* (only into the grid the cells came out of) */
    S = fresh(); S.L = L(); S.dark0 = L().dark || 0; const G = ww(); if (!G) return;
    for (const sp of G.spans) for (let x = sp.x0; x <= sp.x1; x++) S.spec.push({ x, y: sp.y, span: sp.id, kind: sp.kind, i: x - sp.x0, n: sp.x1 - sp.x0 + 1, real: true, cx: x * TS + 8, cy: sp.y * TS + 8 });
    for (const c of G.candles) S.cand[c.id] = { on: false, t: 0 };
    for (const c of G.lamps) S.lamp[c.id] = { on: false };
    for (const p of heroes()) S.lan.set(p, { st: 'lit', by: null, t: 0 });
    stepSpectral(0); };
  /* ---------------- THE LANTERNS ---------------- */
  const lan = p => { if (!S.lan.has(p)) S.lan.set(p, { st: 'lit', by: null, t: 0 }); return S.lan.get(p); };
  H.lantern = p => (S ? lan(p) : null);
  H.lanternLit = p => !!S && lan(p).st === 'lit';
  H.steal = (p, by) => { const l = lan(p); if (l.st !== 'lit') return false; l.st = 'stolen'; l.by = by; l.t = 0; S.n.steals++; snd('steal'); say(p.x, p.y - 34, WW_SAY.stolen, '#ff9a5c'); return true; };
  H.giveBack = (p, why = 'back') => { const l = lan(p); if (l.st === 'lit') return false; l.st = 'lit'; l.by = null; l.t = 0; S.n[why === 'relit' ? 'relit' : 'back']++; snd(why === 'relit' ? 'relit' : 'back'); say(p.x, p.y - 34, why === 'relit' ? WW_SAY.relit : WW_SAY.back, '#ffe9a0'); return true; };
  H.drown = (p, msg) => { const l = lan(p); if (l.st === 'lit') return; l.st = 'out'; l.by = null; l.t = 0; S.n.drowned++; say(p.x, p.y - 34, msg || WW_SAY.drowned, '#8aa0c0'); };
  /* ---------------- THE LIGHTS ---------------- */
  H.lightsNow = () => { const G = ww(), out = []; if (!G || !S) return out;
    for (const p of heroes()) if (lan(p).st === 'lit') out.push({ x: p.x, y: p.y - LIGHT.lanternY, r: LIGHT.lantern, kind: 'lantern' });
    for (const c of G.candles) if (S.cand[c.id].on) out.push({ x: c.x, y: c.y - 10, r: LIGHT.candle, kind: 'candle', ref: c });
    for (const c of G.lamps) if (S.lamp[c.id].on) out.push({ x: c.x, y: c.y - 20, r: LIGHT.lamp, kind: 'lamp', ref: c });
    for (const c of G.stones) out.push({ x: c.x, y: c.y - 14, r: LIGHT.stone, kind: 'stone', ref: c });
    for (const e of (ctx.enemies() || [])) if (e.alive && e.t === 'wwthief' && e.flame) out.push({ x: e.x, y: e.y - 6, r: LIGHT.thief, kind: 'thief' });
    if (ctx.extraLights) for (const l of ctx.extraLights() || []) out.push(l);
    return out; };
  const litBy = (lights, x, y, pad = 0) => lights.some(l => Math.hypot(l.x - x, l.y - y) <= l.r + pad);
  H.litAt = (x, y) => litBy(H.lightsNow(), x, y);
  /* ---------------- THE SPECTRAL CELLS ---------------- */
  function stepSpectral() { const lights = H.lightsNow();
    for (const c of S.spec) { const real = litBy(lights, c.cx, c.cy, c.real ? LIGHT.hyst : 0); if (real === c.real) continue; c.real = real;
      if (real) { S.n.real++; const L0 = L(), k = c.y * L0.W + c.x; ctx.cellSet(c.x, c.y, S.cells.has(k) ? S.cells.get(k) : ctx.T.ONEWAY); S.cells.delete(k); }
      else { S.n.vanish++; H.setCell(c.x, c.y, ctx.T.AIR); } } }
  H.realAt = (x, y) => { const c = S && S.spec.find(q => q.x === x && q.y === y); return c ? c.real : null; };
  /* ---------------- CANDLES AND LAMPS ---------------- */
  const lightIt = (kind, c) => { if (kind === 'candle') { S.cand[c.id].on = true; S.cand[c.id].t = LIGHT.burn; } else S.lamp[c.id].on = true; S.n.lit++; snd('lit'); say(c.x, c.y - 28, WW_SAY.lit, '#ffe9a0'); };
  H.light = id => { const G = ww(), c = G.candles.find(q => q.id === id), l = G.lamps.find(q => q.id === id); if (c) lightIt('candle', c); else if (l) lightIt('lamp', l); };
  H.snuff = id => { if (S.cand[id]) S.cand[id].on = false; if (S.lamp[id]) S.lamp[id].on = false; };
  H.lampOn = id => !!(S && ((S.lamp[id] && S.lamp[id].on) || (S.cand[id] && S.cand[id].on)));
  function stepCandles(dt) { for (const c of ww().candles) { const s = S.cand[c.id]; if (!s.on) continue; const was = s.t; s.t -= dt;
    if (was > LIGHT.gutter && s.t <= LIGHT.gutter) say(c.x, c.y - 26, WW_SAY.gutter, '#8aa0c0');
    if (s.t <= 0) { s.on = false; S.n.out++; snd('out'); say(c.x, c.y - 26, WW_SAY.out, '#8aa0c0'); } } }
  /* a dead lantern touched to any lit candle, lamp or waystone burns again; a drowned one catches by itself after LIGHT.relight s (no soft-lock) */
  function stepLanterns(dt) { const G = ww();
    for (const p of heroes()) { const l = lan(p); if (l.st === 'lit') continue; l.t += dt;
      if (l.by === 'widow') continue;   /* THE WIDOW's theft is hers to keep or lose (src/lantern-widow-hands.js) */
      const touch = [...G.candles.filter(c => S.cand[c.id].on), ...G.lamps.filter(c => S.lamp[c.id].on), ...G.stones].some(c => Math.abs(c.x - p.x) < 18 && Math.abs(c.y - p.y) < 30);
      if (touch) H.giveBack(p, 'relit'); else if (l.st === 'out' && l.t >= LIGHT.relight) { l.st = 'lit'; l.t = 0; S.n.relit++; say(p.x, p.y - 34, WW_SAY.catches, '#ffe9a0'); } } }
  /* ---------------- SHADOW HANDS ---------------- */
  function stepHands(dt) { const G = ww(), lights = H.lightsNow();
    for (const k in S.poolCd) S.poolCd[k] = Math.max(0, S.poolCd[k] - dt);
    for (const p of heroes()) { if (S.hands.some(h => h.p === p)) continue; const row = Math.round(p.y / TS) - 1;
      for (const pl of G.pools) { if ((S.poolCd[pl.id] || 0) > 0 || Math.abs(row - pl.y) > HAND.near) continue; const hx = p.x / TS;
        if (hx < pl.x0 - HAND.reach / TS || hx > pl.x1 + 1 + HAND.reach / TS) continue;
        let best = null; for (let x = pl.x0; x <= pl.x1; x++) { const px = x * TS + 8, py = (pl.y + 1) * TS - 8; if (Math.abs(px - p.x) > HAND.reach || litBy(lights, px, py)) continue; if (!best || Math.abs(px - p.x) < Math.abs(best - p.x)) best = px; }
        if (best === null) continue;
        S.hands.push({ p, x: best, x0: best, tx: p.x, y: (pl.y + 1) * TS, st: 'tell', t: HAND.tell, pool: pl.id, key: 'h' + (++S.n.hands) }); S.poolCd[pl.id] = HAND.cd; snd('handTell');
        say(best, (pl.y - 1) * TS, '!', '#ffd36b'); hint('hands', WW_SAY.hands); break; } }
    for (const h of S.hands) { h.t -= dt;
      if (h.st === 'tell') { if (h.t <= 0) { h.st = 'lunge'; h.t = HAND.maxT; snd('hand'); } continue; }
      if (h.st === 'lunge') { const d = h.tx - h.x, step = HAND.speed * dt; h.x += Math.sign(d) * Math.min(Math.abs(d), step);
        for (const p of heroes()) { if (h.hit || Math.abs(p.x - h.x) > HAND.w || p.y < h.y - HAND.h - 8 || p.y > h.y + 4) continue; h.hit = true; const hp0 = p.hp;
          ctx.asPlayer(p, () => { const r = ctx.damage(h.x, HAND.dmg, { name: 'SHADOW HANDS', low: true }); if (r !== 'blocked' && p.hp < hp0) { p.rootT = Math.max(p.rootT || 0, HAND.hold); S.n.handHits++; say(p.x, p.y - 30, WW_SAY.held, '#ff6b6b'); } }); }
        if (h.t <= 0 || Math.abs(h.tx - h.x) < 1) { h.st = 'sink'; h.t = HAND.sink; } continue; } }
    S.hands = S.hands.filter(h => h.st !== 'sink' || h.t > 0); }
  /* ---------------- THE BLACK MERE ---------------- */
  function stepMere() { const G = ww(), L0 = L();
    for (const p of heroes()) {
      if (p.ground) { const tx = Math.floor(p.x / TS), ty = Math.floor((p.y + 2) / TS); if (L0.grid[ty * L0.W + tx] === ctx.T.SOLID) S.safe.set(p, { x: p.x, y: p.y }); }
      if (p.y <= G.catchY) continue; const s = S.safe.get(p) || { x: L0.START.x * TS + 8, y: (L0.START.y + 1) * TS };
      p.x = s.x; p.y = s.y; p.vx = 0; p.vy = 0; S.n.caught++; snd('drag'); say(p.x, p.y - 30, WW_SAY.dragged, '#ff6b6b');
      ctx.asPlayer(p, () => ctx.damage(p.x, MERE.dmg, { name: 'THE BLACK MERE', unblockable: true, spare: true, noKnock: true })); } }
  /* ---------------- WISP THIEVES ---------------- */
  H.spawn = (e, base) => { if (e.t !== 'wwthief') return null; return { ...base, t: 'wwthief', w: 10, h: 10, hp: THIEF.hp, maxHp: THIEF.hp, noGrav: true, mode: 'drift', modeT: 0, hx: base.x, hy: base.y - 8, y: base.y - 8, flame: null, squad: e.squad, cd: 0 }; };
  H.takeThief = (e, dmg) => (e.mode === 'scorched' ? dmg * 2 : dmg);
  H.thief = (e, dt) => { if (!S) H.reset(); e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = Math.max(0, (e.cd || 0) - dt);
    const lit = heroes().filter(p => lan(p).st === 'lit' && Math.abs(p.x - e.x) < THIEF.sense && Math.abs(p.y - e.y) < THIEF.senseY);
    if (e.mode === 'scorched') { if (e.modeT <= 0) { e.mode = 'drift'; e.cd = THIEF.cd; } return; }
    if (e.mode === 'flee') { const away = heroes().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0]; const dir = away ? (Math.sign(e.x - away.x) || 1) : 1;
      e.x += dir * THIEF.flee * dt; e.y += ((e.hy - 30) - e.y) * Math.min(1, dt) ; e.face = dir; e.fleeT = (e.fleeT || 0) + dt;
      const L0 = L(); e.x = Math.max(16, Math.min(L0.W * TS - 16, e.x));
      if (e.fleeT >= THIEF.escapeT || Math.abs(e.x - e.fleeX) >= THIEF.escapeD) { const p = e.flame; e.flame = null; e.mode = 'drift'; e.fleeT = 0; if (p) H.drown(p); } return; }
    if (e.mode === 'swoopTell') { if (e.modeT <= 0) { e.mode = 'swoop'; e.modeT = THIEF.swoop; snd('swoop'); S.n.swoops++; } return; }
    if (e.mode === 'swoop') { const t = e.tgt; if (t) { const dx = t.x - e.x, dy = (t.y - 12) - e.y, d = Math.hypot(dx, dy) || 1; e.x += dx / d * THIEF.swoopV * dt; e.y += dy / d * THIEF.swoopV * dt; e.face = Math.sign(dx) || e.face;
        if (d < 12 && !e.swHit) { e.swHit = true; const hp0 = t.hp; let r = null; ctx.asPlayer(t, () => { r = ctx.damage(e.x, THIEF.dmg, { who: e, name: 'A WISP THIEF' }); });
          if (r === 'blocked') { e.mode = 'scorched'; e.modeT = THIEF.stun; S.n.scorched++; snd('scorch'); say(e.x, e.y - 16, WW_SAY.scorched, '#ffd36b'); return; }
          void hp0; if (H.steal(t, e)) { e.flame = t; e.mode = 'flee'; e.fleeT = 0; e.fleeX = e.x; hint('thief', WW_SAY.thief); return; } } }
      if (e.modeT <= 0) { e.mode = 'drift'; e.cd = THIEF.cd; } return; }
    /* drift: bob around home; a lit lantern in range draws a told swoop */
    e.x += ((e.hx + Math.sin(e.anim * 0.9) * 24) - e.x) * Math.min(1, dt * 1.5); e.y += ((e.hy + Math.sin(e.anim * 1.7) * 8) - e.y) * Math.min(1, dt * 1.5);
    const t = lit.sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
    if (t && e.cd <= 0 && !e.flame) { e.tgt = t; e.swHit = false; e.mode = 'swoopTell'; e.modeT = THIEF.tell; e.face = Math.sign(t.x - e.x) || 1; snd('swoopTell'); } };   /* its yellow ! is src/marks.js's row (main.js draws it over the windup) */
  function stepThieves() { for (const e of (ctx.enemies() || [])) if (e.t === 'wwthief' && !e.alive && e.flame) { const p = e.flame; e.flame = null; if (lan(p).by === e) H.giveBack(p); } }
  /* ---------------- THE STEP ---------------- */
  H.update = dt => { if (!H.on()) return; if (!S) H.reset(); S.t += dt;
    for (const p of heroes()) lan(p);
    stepCandles(dt); stepThieves(); stepLanterns(dt); stepSpectral(); stepHands(dt); stepMere(); };
  /* ---------------- A HERO'S BLOW: a candle, a lamp, a hand ---------------- */
  const hitBox = (hb, x, y, r) => hb.l < x + r && hb.r > x - r && hb.t < y + r && hb.b > y - r;
  H.strike = (hb, by) => { if (!H.on() || !hb) return; if (!S) H.reset(); const G = ww(), once = o => !ctx.hitOnce || ctx.hitOnce(o), who = by || (ctx.hero && ctx.hero());
    const can = who && lan(who).st === 'lit';
    for (const c of G.candles) if (!S.cand[c.id].on && hitBox(hb, c.x, c.y - 8, 9) && once(c)) { if (can) lightIt('candle', c); else say(c.x, c.y - 26, WW_SAY.out, '#8aa0c0'); }
    for (const c of G.lamps) if (!S.lamp[c.id].on && hitBox(hb, c.x, c.y - 18, 9) && once(c)) { if (can) lightIt('lamp', c); else say(c.x, c.y - 30, WW_SAY.out, '#8aa0c0'); }
    for (const h of S.hands) if (h.st !== 'sink' && hitBox(hb, h.x, h.y - 8, 10) && once(h)) { h.st = 'sink'; h.t = HAND.sink; S.n.banished++; snd('banish'); say(h.x, h.y - 24, WW_SAY.banished, '#bfe6f5'); } };
  /* ---------------- WHAT A TOOL READS ---------------- */
  H.read = () => S && { t: +S.t.toFixed(2), real: S.spec.filter(c => c.real).length, spec: S.spec.length, hands: S.hands.map(h => ({ st: h.st, x: R(h.x), tx: R(h.tx) })),
    lanterns: heroes().map(p => lan(p).st), candles: Object.values(S.cand).filter(c => c.on).length, lamps: Object.values(S.lamp).filter(c => c.on).length, n: { ...S.n } };
  /* ================= THE DARK: every light is a hole (main.js's dark mask) ================= */
  H.holes = (hole, cx, cy) => { if (!S) return; for (const l of H.lightsNow()) hole(l.x - cx, l.y - cy, l.r * 1.25); };
  /* ================= THE DRAWING (src/redraw/wispwood_art.js: claude/wispart) ================= */
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  /* behind the tiles: the pale oaks of the far wood, the mist and wisps, THE BLACK MERE, the root-hole exit (webbed shut until the Widow has fallen) */
  H.drawBack = (g, cx, cy, VW, VH, time) => { if (!H.on() || !S) return; const x = X(cx), y = Y(cy), G = ww(), L0 = L();
    ART.drawBackdrop(g, cx, cy, VW, VH, time, L0);
    G.meres.forEach((m, k) => { const a = x(m.x0 * TS), b = x((m.x1 + 1) * TS); if (b < 0 || a > VW) return; ART.drawMere(g, a, b, y(G.catchY - 40), VW, VH, time, k + 1); });
    const eh = L0.arena && L0.arena.exitHole; if (eh && eh.x > cx - 60 && eh.x < cx + VW + 60) ART.drawExitHole(g, x(eh.x), y(G.catchY - 40), !!(ctx.exitOpen && ctx.exitOpen()), time); };
  /* over the world: the pale spans (lit, or their glint), the pools and the hands, candles, lamps, waystones, the heroes' lanterns, a thief's thread */
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!H.on() || !S) return; const x = X(cx), y = Y(cy), G = ww();
    for (const c of S.spec) { const px = x(c.x * TS), py = y(c.y * TS); if (px < -TS || px > VW || py < -TS || py > VH) continue; ART.drawSpectral(g, c, px, py, time); }
    G.pools.forEach((pl, k) => { const a = x(pl.x0 * TS), b = x((pl.x1 + 1) * TS), py = y((pl.y + 1) * TS); if (b < 0 || a > VW) return; ART.drawPool(g, a, b, py, time, k); });
    G.candles.forEach((c, k) => { const px = x(c.x); if (px < -30 || px > VW + 30) return; const s = S.cand[c.id]; ART.drawCandle(g, px, y(c.y), s.on ? (s.t < LIGHT.gutter ? 'gutter' : 'lit') : 'cold', time, k); });
    G.lamps.forEach((c, k) => { const px = x(c.x); if (px < -30 || px > VW + 30) return; ART.drawLamp(g, px, y(c.y), S.lamp[c.id].on, time, k); });
    for (const c of G.stones) { const px = x(c.x); if (px < -30 || px > VW + 30) continue; ART.drawStone(g, px, y(c.y), time); }
    for (const h of S.hands) { const hx = x(h.x), hy = y(h.y);
      if (h.st === 'tell') ART.drawHandTell(g, hx, hy, x(h.tx), 1 - h.t / HAND.tell, time);
      else ART.drawHand(g, hx, hy, h.st === 'sink' ? Math.max(0.1, h.t / HAND.sink) : 1, Math.sign(h.tx - h.x), time); }
    for (const p of heroes()) { const l = lan(p); ART.drawHeroLantern(g, x(p.x) + (p.face || 1) * 7, y(p.y) - 14, p.face || 1, l.st, time); }
    for (const e of (ctx.enemies() || [])) if (e.alive && e.t === 'wwthief' && e.flame) { const p = e.flame; ART.drawTether(g, x(e.x), y(e.y), x(p.x), y(p.y - 14)); } };
  H.drawThief = (g, e, cx, cy, time) => ART.drawThief(g, e, e.x - cx, e.y - cy, time);
  return H;
}
