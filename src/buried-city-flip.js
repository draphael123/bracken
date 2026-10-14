// src/buried-city-flip.js - THE FLIP, THE BURIED CITY's second verb (claude/buriedcity3, 2026-10-12; scratch/brief-buriedcity3.md 2: "THE HOURGLASS = THE LEVEL'S
// VERB: YOU FLIP IT"). Daniel played Buried City 2 live: the hourglass was "unclear in function" - a picture. Now the city's hourglasses are things you DO:
//   STRIKE ONE (any blow) or turn it (E) and its sand runs BACKWARD for its dur seconds - the drawn gauge on it and over your head empties - and everything it
//   governs (by the glass's id, src/buried-city.js) runs the other way with it:
//     RISERS   buried roofs, stairs and domes rise up out of the sand (their cells written solid: a body inside is lifted onto them)
//     SINKERS  footing that stood as built sinks into the sand (the sand runs the other way) - THE ROOFTOPS' exam
//     BANKS    a drifted bank of sand runs out of a doorway (it drifts back when the glass runs out - never onto a body: it waits till it is clear)
//     DFALLS   a sand-fall off a dune's lip FLOWS UP: a body in it is carried up to the lip (idle, it beats you down like the city's falls)
//   The last WARN s are told: the gauge goes red, the glass ticks, the risers shake, "THE GLASS RUNS OUT". Struck again while it runs, it is turned back to full.
// THE SAND SEA (seas): deep sand between THE ROOFTOPS (a void under its drawn surface). Who sinks into it is SWALLOWED: a bite of him and back to his last
//   footing that does not move (taught twice) - or, in the exam's sea, THE END (A10 amended: an exam pit, once taught, is a real death).
// PURE OF main.js: the hands (src/buried-city-hands.js) give it the world (api: ctx, K, TS, T, number, once, unburyIn); it keeps its state on K.
import * as SET from './redraw/buried_city_set.js';
import * as ART from './redraw/buried_city_flip_art.js';

export const FLIP = { warn: 2.0, rise: 2.2, liftV: -160, beat: 130, bite: 0.27, swallow: 6, strikeR: 12, talkR: 18, refillWait: 0.25, spinT: 0.6,
  boundShield: 0.4, boundBuried: 1.0, slabWarn: 0.8 };   /* (claude/buriedcity4) THE SAND-BOUND: a blow on it while the sand holds it lands at 0.4 (B15's floor; told), buried whole; a timed slab's last 0.8 s is red */

export function makeFlip(api) {
  const { ctx, number, once } = api, TS = () => ctx.TS, T = () => ctx.T;
  const F = {};
  let K = null;
  const px = x => x * TS() + 8;
  /* ---------- RESET: a fresh load or a respawn - every glass run out, every riser down, every sinker and bank as built ---------- */
  F.reset = (K0, fresh) => {
    K = K0; const L = K.L; L.towerFlip = 0;
    K.glasses = (L.glasses || []).map(g => ({ ...g, t: 0, runs: 0, warned: false }));
    K.risers = (L.risers || []).map(r => ({ ...r, up: r.sinks ? 1 : 0, solid: null, shake: 0 }));
    K.banks = (L.banks || []).map(b => ({ ...b, full: 1, solid: null, wait: 0 }));
    K.dfalls = (L.dfalls || []).map(f => ({ ...f }));
    K.seas = (L.seas || []).map(s => ({ ...s }));
    K.tilts = (L.tilts || []).map(t => ({ ...t, dir: 0 })); for (const t of K.tilts) writeTilt(t, true);   /* (claude/buriedcity4) the tilting dunes: idle (mirrored) */
    K.tplats = (L.tplats || []).map(p => ({ ...p, t: 0, up: false })); for (const p of K.tplats) writeSlab(p, false);   /* (claude/buriedcity4) the timed slabs: down */
    K.riserCells = new Set(); for (const r of K.risers) for (let y = r.top; y < r.top + r.rows; y++) for (let x = r.x0; x <= r.x1; x++) K.riserCells.add(y * L.W + x);
    for (const r of K.risers) writeRiser(r, true);
    for (const b of K.banks) writeBank(b, true);
    K.safe = new Map(); K.flipN = K.flipN || { strikes: 0, turns: 0, runs: 0, swallowed: 0, lifted: 0, beaten: 0, rose: 0, sank: 0, ranOut: 0, tilted: 0, slabs: 0, crumbled: 0, held: 0, glanced: 0 };
    if (fresh) K.flipN = { strikes: 0, turns: 0, runs: 0, swallowed: 0, lifted: 0, beaten: 0, rose: 0, sank: 0, ranOut: 0, tilted: 0, slabs: 0, crumbled: 0, held: 0, glanced: 0 };
  };
  const glassOf = id => K.glasses.find(g => g.id === id);
  const running = id => { const g = glassOf(id); return !!g && g.t > 0; };
  F.running = running;
  /* ---------- the cells ---------- */
  function writeRiser(r, force) {
    const want = r.up >= 0.6; if (!force && want === r.solid) return; r.solid = want;
    for (let y = r.top; y < r.top + r.rows; y++) for (let x = r.x0; x <= r.x1; x++) ctx.cellSet(x, y, want ? T().SOLID : T().AIR);
    if (want) { api.unburyIn(r.x0, r.x1, null); if (!force) { K.flipN.rose++; ctx.burst(px((r.x0 + r.x1) / 2), r.top * TS(), 12, ['#e6c98a', '#a87a40'], 70, 0.6); } }
    else if (!force) K.flipN.sank++;
  }
  const bodyIn = (x0, x1, y0, y1) => { const l = x0 * TS() - 6, r = (x1 + 1) * TS() + 6, t = y0 * TS(), b = (y1 + 1) * TS() + 2;
    for (const p of ctx.players) if (!p.dead && p.x > l && p.x < r && p.y > t && p.y - (p.h || 14) < b) return true;
    for (const e of ctx.enemies()) if (e.alive && !e.noGrav && e.x > l && e.x < r && e.y > t && e.y - (e.h || 12) < b) return true; return false; };
  function writeBank(b, force) {
    const want = b.full >= 0.5; if (!force && want === b.solid) return; b.solid = want;
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) ctx.cellSet(x, y, want ? T().SOFT : T().AIR);
  }
  /* (claude/buriedcity4) THE TILTING DUNE: dir +1 rises EAST (as laid in the level: the route), -1 rises WEST (idle, mirrored). Its cells from the high end's row to
     its floor: air over the slope, the slope tile, rock under it */
  function writeTilt(t, force) {
    const want = running(t.glass) ? 1 : -1; if (!force && want === t.dir) return; t.dir = want; const n = t.x1 - t.x0 + 1, T0 = T();
    for (let i = 0; i < n; i++) { const x = t.x0 + i, sr = want > 0 ? t.lo - 1 - i : t.lo - n + i;
      for (let y = t.lo - n; y <= t.floor; y++) ctx.cellSet(x, y, y < sr ? T0.AIR : y === sr ? (want > 0 ? T0.SLOPE_R1 : T0.SLOPE_L1) : T0.SOLID); }
    api.unburyIn(t.x0, t.x1, null); if (!force) { K.flipN.tilted++; ctx.shake(2); ctx.burst(px((t.x0 + t.x1) / 2), (t.lo - n / 2) * TS(), 14, ['#e6c98a', '#a87a40'], 80, 0.6); }
  }
  /* (claude/buriedcity4) A TIMED SAND SLAB: up (a one-way slab of sand) from its glass's strike until its own timer runs out, then it crumbles */
  function writeSlab(p, up) { p.up = up; for (let x = p.x0; x <= p.x1; x++) ctx.cellSet(x, p.y, up ? T().ONEWAY : T().AIR); if (up) api.unburyIn(p.x0, p.x1, null); }
  const raiseSlabs = id => { for (const p of K.tplats) if (p.glass === id) { p.t = p.life; if (!p.up) { writeSlab(p, true); K.flipN.slabs++; ctx.burst(px((p.x0 + p.x1) / 2), p.y * TS(), 8, ['#e6c98a', '#a87a40'], 60, 0.5); } } };
  /* ---------- STRIKE / TURN: a blow or E on a glass ---------- */
  function flip(g, P) {
    if (g.cd > 0) return false; g.cd = 0.35; g.spin = FLIP.spinT; K.flipN.strikes++;
    const was = g.t > 0; g.t = g.dur; g.warned = false; g.runs++; if (!was) K.flipN.runs++; else K.flipN.turns++; raiseSlabs(g.id);
    ctx.sfx.ratchet && ctx.sfx.ratchet(); ctx.sfx.gateLift && ctx.sfx.gateLift(); ctx.shake(2);
    ctx.burst(px(g.x), (g.y + 1) * TS() - 14, 10, ['#f8dc90', '#e6bc68'], 60, 0.5);
    const y = (P ? P.y : (g.y + 1) * TS()) - 34, x = P ? P.x : px(g.x);
    if (was) number(x, y, 'TURNED BACK: THE GLASS IS FULL AGAIN', '#ffd36b');
    else if (once('flip' + g.id)) {
      if (g.id === 'stair') number(x, y, 'THE SAND RUNS BACK UP: A BURIED ROOF RISES', '#8fd160');
      else if (g.id === 'bank') number(x, y, 'THE SAND RUNS OUT OF THE BANK', '#8fd160');
      else if (g.id === 'fall') number(x, y, 'THE SAND-FALL FLOWS UP: STEP IN AND RIDE IT', '#8fd160');
      else if (g.id === 'exam') number(x, y, 'THE ROOF THAT STOOD SINKS - THE REST RISE', '#8fd160');
      else if (g.id === 'works1') number(x, y, 'THE ROOFS YOU CAME BY SINK - TWO RISE AHEAD', '#8fd160');
      else if (g.id === 'works2') number(x, y, 'THE SAND-FALL FLOWS UP: STEP IN AND RIDE IT', '#8fd160');
      else if (g.id === 'works3' || g.id === 'court') number(x, y, 'THE SAND-BOUND IS BURIED: STRIKE IT NOW', '#8fd160');
      else if (g.id === 'ante') number(x, y, 'THE SAND RISES: CROSS BEFORE EACH SLAB CRUMBLES', '#8fd160');
      else number(x, y, 'THE SAND RUNS BACKWARD: THE ROOFS RISE', '#8fd160');
    } else number(x, y, 'THE GLASS IS TURNED', '#ffd36b');
    return true;
  }
  const glassBox = g => ({ l: px(g.x) - 9, r: px(g.x) + 9, t: (g.y + 1) * TS() - 26, b: (g.y + 1) * TS() });
  F.interact = P => { if (!K) return false; for (const g of K.glasses) if (Math.abs(px(g.x) - P.x) <= FLIP.talkR && Math.abs((g.y + 1) * TS() - P.y) <= 20) { flip(g, P); return true; } return false; };
  /* a blow on it (the hands ask each frame: the hero's swing box, once a swing) */
  function strikes() {
    const hb = ctx.atkBox ? ctx.atkBox() : null; if (!hb) return;
    for (const g of K.glasses) { const b = glassBox(g); if (hb.r < b.l || hb.l > b.r || hb.b < b.t || hb.t > b.b) continue; if (ctx.hitOnce && !ctx.hitOnce(g)) continue; flip(g, ctx.hero()); }
  }
  /* ---------- EVERY FRAME ---------- */
  F.update = dt => {
    if (!K) return; const P0 = ctx.hero();
    strikes();
    { const on = !!P0 && K.glasses.some(q => q.t > 0 && Math.abs(P0.x - px(q.x)) < 40 * TS()), f0 = K.L.towerFlip || 0; K.L.towerFlip = on ? Math.min(1, f0 + dt * 1.6) : Math.max(0, f0 - dt * 1.6); }   /* (claude/buriedcity4, brief 6) THE GREAT HOURGLASS on the skyline turns over while a glass near you runs (src/redraw/buried_city_backdrop.js drawTower) */
    for (const g of K.glasses) { g.cd = Math.max(0, (g.cd || 0) - dt); g.spin = Math.max(0, (g.spin || 0) - dt); if (g.t <= 0) continue;
      const t0 = g.t; g.t = Math.max(0, g.t - dt);
      if (g.t <= FLIP.warn && !g.warned) { g.warned = true; const near = P0 && Math.abs(P0.x - px(g.x)) < 520; if (near) number(P0.x, P0.y - 34, 'THE GLASS RUNS OUT', '#ff9a5c'); }
      if (g.t <= FLIP.warn && Math.floor(t0 * 2) !== Math.floor(g.t * 2)) ctx.sfx.clank && ctx.sfx.clank();
      if (g.t === 0) { K.flipN.ranOut++; ctx.sfx.gateDrop && ctx.sfx.gateDrop(); } }
    /* the risers rise (or the sinkers sink) while their glass runs; back the other way when it runs out */
    for (const r of K.risers) { const on = running(r.glass), want = r.sinks ? (on ? 0 : 1) : (on ? 1 : 0);
      if (r.up !== want) r.up = want > r.up ? Math.min(want, r.up + FLIP.rise * dt) : Math.max(want, r.up - FLIP.rise * dt);
      const g = glassOf(r.glass); r.shake = g && g.t > 0 && g.t <= FLIP.warn ? 1 : 0;
      writeRiser(r, false); }
    /* the banks run out while their glass runs; they drift back in when it runs out - not onto a body */
    for (const b of K.banks) { const on = running(b.glass);
      if (on) b.full = Math.max(0, b.full - dt * 2.5);
      else if (b.full < 1) { if (bodyIn(b.x0, b.x1, b.y0, b.y1)) b.wait = FLIP.refillWait; else if ((b.wait = Math.max(0, b.wait - dt)) === 0) b.full = Math.min(1, b.full + dt * 2.5); }
      writeBank(b, false); }
    /* (claude/buriedcity4) the tilting dunes turn with their glass; the timed slabs run down and crumble */
    for (const t of K.tilts) writeTilt(t, false);
    for (const p of K.tplats) { if (!p.up) continue; p.t = Math.max(0, p.t - dt); if (p.t === 0) { writeSlab(p, false); K.flipN.crumbled++; ctx.burst(px((p.x0 + p.x1) / 2), p.y * TS() + 4, 12, ['#e6c98a', '#a87a40', '#7a5a30'], 70, 0.6); ctx.sfx.gateDrop && ctx.sfx.gateDrop(); } }
    /* the dune falls: idle they beat you down, flipped they carry you up to the lip */
    for (const f of K.dfalls) { const on = running(f.glass), l = f.x0 * TS() - 2, r = (f.x1 + 1) * TS() + 2, top = f.top * TS(), bot = (f.bottom + 1) * TS();
      for (const p of ctx.players) { if (p.dead || p.x < l || p.x > r || p.y < top - 4 || p.y - (p.h || 14) > bot) continue;
        if (on) { if (p.y > top + 1) { if (!(p.vy <= FLIP.liftV)) p.vy = FLIP.liftV; if (!p.bcLift) { p.bcLift = 1; K.flipN.lifted++; } } else { p.y = top; if (p.vy > 0) p.vy = 0; } }
        else { if (!(p.vy >= FLIP.beat)) p.vy = FLIP.beat; if (!p.bcBeat) { p.bcBeat = 1; K.flipN.beaten++; } if (p === P0 && once('dfallBeat')) number(p.x, p.y - 34, 'THE SAND-FALL BEATS YOU DOWN: TURN ITS GLASS', '#ffd36b'); } }
      for (const p of ctx.players) if (p.x < l || p.x > r) { p.bcLift = 0; p.bcBeat = 0; } }
    /* THE SAND SEA: footing that does not move is where you go back to; sunk into the sea you are swallowed */
    for (const p of ctx.players) { if (p.dead) continue; const tx = Math.floor(p.x / TS()), fy = Math.floor((p.y + 1) / TS());
      if (p.ground && !K.riserCells.has(fy * K.L.W + tx) && !slabAt(tx, fy) && ctx.cellGet(tx, fy) !== T().AIR && !K.seas.some(s => tx >= s.x0 && tx <= s.x1 && !(s.bottom !== undefined && fy > s.bottom))) K.safe.set(p, { x: p.x, y: p.y });
      const s = K.seas.find(q => p.x >= q.x0 * TS() && p.x < (q.x1 + 1) * TS()); if (!s || p.y < (s.row + 1) * TS() + FLIP.swallow || (s.bottom !== undefined && p.y - (p.h || 14) > (s.bottom + 1) * TS())) continue;   /* (claude/buriedcity4: under a sea's floor - the old street - is not in it) */
      swallow(p, s); }
  };
  const slabAt = (tx, ty) => K.tplats.some(q => ty === q.y && tx >= q.x0 && tx <= q.x1);
  /* (claude/buriedcity4) THE SAND-BOUND: buried while its glass runs (stuck, whole), held by the sand while it rests (0.4, told) */
  F.bound = e => !!K && e.cnSkin === 'sandbound' && running(e.glass);
  F.boundTake = e => (F.bound(e) ? FLIP.boundBuried : FLIP.boundShield);
  function swallow(p, s) {
    K.flipN.swallowed++; ctx.shake(4); ctx.burst(p.x, s.row * TS(), 18, ['#e6c98a', '#a87a40'], 90, 0.7); ctx.sfx.pHurt && ctx.sfx.pHurt();
    if (s.lethal && ctx.killHero) { const dead = ctx.killHero(p, 'THE SAND SEA'); if (dead) return; }
    const bite = Math.min(Math.round((p.maxHp || 100) * FLIP.bite), Math.max(0, p.hp - 1)); if (bite > 0 && !(ctx.god && ctx.god())) { p.hp -= bite; p.hurt = 0.25; ctx.number(p.x, p.y - 20, '-' + bite, '#ff6b6b'); }
    const sf = K.safe.get(p) || (() => { const x = s.x0 - 1; for (let y = 1; y < K.L.H; y++) if (ctx.cellGet(x, y) !== T().AIR && ctx.cellGet(x, y - 1) === T().AIR) return { x: px(x), y: y * TS() }; return { x: px(s.x0 - 2), y: (s.row - 2) * TS() }; })();   /* (claude/buriedcity4: no footing yet - the top of the sea's west lip, wherever it stands) */ p.x = sf.x; p.y = sf.y; p.vx = 0; p.vy = 0; p.inv = Math.max(p.inv || 0, 1);
    if (p === ctx.hero()) number(p.x, p.y - 34, s.lethal ? 'THE SAND SEA SWALLOWS YOU' : 'THE SAND SEA SWALLOWS YOU: BACK TO THE ROOF', '#ff9a5c');
  }
  /* ---------- the glint's states and the walker's hints ---------- */
  F.state = id => { const g = glassOf(id); return g ? (g.t > 0 ? 'running' : 'idle') : ''; };
  F.read = () => K && { glasses: K.glasses.map(g => ({ id: g.id, t: +g.t.toFixed(2), runs: g.runs })), risers: K.risers.map(r => ({ glass: r.glass, x0: r.x0, up: +r.up.toFixed(2), solid: r.solid })), banks: K.banks.map(b => ({ glass: b.glass, full: +b.full.toFixed(2) })), tilts: K.tilts.map(t => ({ glass: t.glass, dir: t.dir })), tplats: K.tplats.map(p => ({ glass: p.glass, x0: p.x0, up: p.up, t: +p.t.toFixed(2) })), n: { ...K.flipN } };
  /* the tools' hand: every glass struck at once (tools/drawn-solids.mjs) */
  F.flipAll = () => { for (const g of K.glasses) flip(g, null); };
  /* ---------- DRAWING (claude/bc3art: src/redraw/buried_city_flip_art.js - the hourglasses, risers, banks, dune falls, the sea, the gauges) ---------- */
  const R = Math.round;
  F.draw = (g, cx, cy, time) => {
    if (!K) return; const ts = TS(), vw = ctx.VW(), vh = ctx.VH(), V = { g, cx, cy, vw, vh, time, L: K.L, T: T() }, P0 = ctx.hero();
    const vis = (x0, x1) => (x1 + 1) * ts - cx > -48 && x0 * ts - cx < vw + 48;
    for (const s of K.seas) { if (!vis(s.x0, s.x1)) continue; const cl = s.bottom !== undefined; if (cl) { g.save(); g.beginPath(); g.rect(s.x0 * ts - cx, s.row * ts - cy - 12, (s.x1 - s.x0 + 1) * ts, (s.bottom - s.row + 1) * ts + 12); g.clip(); }   /* (claude/buriedcity4: a sea with the old street under it stops at its floor) */
      ART.drawSea(V, s, s.x0 * ts - cx, (s.x1 - s.x0 + 1) * ts, s.row * ts + 8 - cy); if (cl) g.restore(); }
    /* (claude/buriedcity4, GREYBOX) THE TIMED SAND SLABS: a slab of packed sand, its own timer over it (gold, red in its last FLIP.slabWarn s), shaking at the end */
    for (const p of K.tplats) { if (!p.up || !vis(p.x0, p.x1)) continue; const warn = p.t <= FLIP.slabWarn, sh = warn ? Math.sin(time * 60) * 1.2 : 0, l = R(p.x0 * ts - cx + sh), y = R(p.y * ts - cy), w = (p.x1 - p.x0 + 1) * ts;
      g.fillStyle = '#b98c58'; g.fillRect(l, y, w, ts); g.fillStyle = '#e2bb7a'; g.fillRect(l, y, w, 3); g.fillStyle = '#8a6a3c'; g.fillRect(l, y + ts - 3, w, 3); g.fillStyle = 'rgba(230,200,140,0.6)'; for (let i = 0; i < 4; i++) g.fillRect(l + 3 + ((i * 7 + Math.floor(time * 30)) % Math.max(4, w - 6)), y + ts + ((time * 40 + i * 9) % 14), 1, 2);
      const k = p.t / p.life; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(l + 2, y - 7, w - 4, 4); g.fillStyle = warn ? '#ff5a3a' : '#ffd36b'; g.fillRect(l + 3, y - 6, R((w - 6) * k), 2); }
    for (const r of K.risers) { if (!vis(r.x0, r.x1)) continue; const gl = glassOf(r.glass);
      ART.drawRiser(V, r, { l: r.x0 * ts - cx, top: r.top * ts - cy, w: (r.x1 - r.x0 + 1) * ts, h: r.rows * ts, near: !!(P0 && gl && Math.abs(P0.x - px(gl.x)) < 22 * ts), moving: r.up > 0.02 && r.up < 0.98 }); }
    for (const b of K.banks) { if (!vis(b.x0, b.x1) || b.full >= 0.999) continue; const l = b.x0 * ts, w = (b.x1 - b.x0 + 1) * ts, bot = (b.y1 + 1) * ts, h = (b.y1 - b.y0 + 1) * ts * b.full; if (h > 1) { SET.sandBody(V, l, bot - h, w, bot); ART.drawBankRunning(V, l - cx, bot - cy, w, h, b.full); } }
    for (const f of K.dfalls) { if (!vis(f.x0, f.x1)) continue; ART.drawDuneFall(V, running(f.glass), f.x0 * ts - cx, f.top * ts - cy, (f.x1 - f.x0 + 1) * ts, (f.bottom + 1) * ts - cy); }
    for (const gq of K.glasses) { const x = px(gq.x) - cx, y = (gq.y + 1) * ts - cy; if (x < -40 || x > vw + 40) continue; const k = gq.t > 0 ? gq.t / gq.dur : 0, warn = gq.t > 0 && gq.t <= FLIP.warn;
      ART.drawGlass(V, gq, { k, warn, spin: Math.max(0, (gq.spin || 0) / FLIP.spinT), x, y });
      if (gq.t <= 0 && P0 && Math.abs(P0.x - px(gq.x)) < 40 && Math.abs(P0.y - (gq.y + 1) * ts) < 30) ctx.text('STRIKE', R(x), R(y - 44), '#ffd36b', 'center', 4); }
    /* THE GAUGE OVER YOUR HEAD (A3: what runs off-screen is shown where you stand): the nearest running glass */
    if (P0 && !P0.dead) { const gq = K.glasses.filter(q => q.t > 0 && Math.abs(P0.x - px(q.x)) < 40 * ts).sort((a, b) => Math.abs(P0.x - px(a.x)) - Math.abs(P0.x - px(b.x)))[0];
      if (gq) ART.drawHeadGauge(V, R(P0.x - cx), R(P0.y - (P0.h || 20) - 12 - cy), gq.t / gq.dur, gq.t <= FLIP.warn); }
  };
  return F;
}
