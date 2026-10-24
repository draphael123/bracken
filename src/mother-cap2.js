// src/mother-cap2.js - THE MOTHER CAP 2 (claude/sporewood2, the OPUS GREYBOX, 2026-10-22). Brief scratch/brief-sporewood2-1015.md (Daniel 10-15, approved):
// "today 100% player wins, doesn't use the verb; B17 4+ told attacks, the level's verb central". SPOREWOOD 2's boss: the level's rule turned on you.
//
// A PUZZLE BOSS keyed FROM ABOVE (B14: the plunge, taught in her approach on the root knot). Her hide turns blades and fire to SP.take (0.4x, B15: never nothing,
// a told clank that names her key); her KNOT, on the crown of her cap, opens her:
//   THE OPENING (the level's verb, central): her hollow is ringed with her SEED CAPS - strike one and it grows a STEP (the outer one low, the inner one high, up
//     against the rim of her cap). Up them, and a PLUNGE onto her knot = OPEN x2 for MC.openT s (she stands still: B4). Then a told WARD MC.wardT s (B3: 0.4x,
//     WARDED). Her spores help you too: a struck SPORE BLOOM becomes a SPRING SPORE, and a HEAVY blow bursts a brood puffball into one - a spring spore throws
//     you high enough to plunge her knot without the caps.
//   HER MOVES, every one TOLD (word + colour + her own windup pose, B16) and each a different verb to answer (B17):
//     1 SPORE BLOOM   a violet ring blooms where you stand (!) - step out, or STRIKE it: it becomes a spring spore
//     2 ROOT LASH     her roots sweep the floor out from her foot (!!, red, LOW) - jump it, or be up on a cap
//     3 CAP CRUSH     a cap drops from the dark on a marked spot (!!, red ring + falling shadow) - move off it (it crushes a seed cap it lands on)
//     4 PUFFBALL BROOD her gills drop puffballs (!) that waddle at you and burst - a HEAVY blow bursts one into a spring spore
//     P2 (under half) THE MYCELIUM NET: the floor's veins glow (a tell) and then STING (an A13 drain, no stagger) - live on the caps and the shelves; and she
//        WITHERS the caps you grew (told: the cap shudders violet) so you keep regrowing them. ONE new move, and it changes the arena (B5).
// main.js owns the world and calls: owns(e), update(e, dt), take(e, fromX, tag) (a blow's share), knotHit(p) (a plunge on her knot), strike(hb) (a blow on a bloom),
// broodDied(e, heavy), draw(g, e, cx, cy, time) (her and her tells), drawWorld(g, cx, cy, time) (the floor's tells), read() (tools and the lab).
import { KEY_ROWS } from './boss-read.js';
import * as MART from './redraw/sporewood2_mother.js'; import { drawCloud as drawSporeCloud, halo as foxHalo } from './redraw/sporewood2_world.js'; import { GLOW as FOX } from './redraw/sporewood2_pal.js';   /* (claude/sporewood2art) her baked frames, one per windup and release, and her floor effects */
export const MC = {
  hp: 1150,                                   /* her bar (tuned with flasks, campaign level: see the lane report) */
  take: 0.4, openMul: 2, openT: 3.5, wardT: 3.0, wind: 0.7,
  idle: [1.15, 0.85],                        /* the breath between her moves, P1 / P2 */
  knotW: 16, knotUp: 132, knotDn: 104,       /* her knot: half its width; from how high over her floor to how low a plunge counts */
  knotY: 118,                                /* the knot's centre over her floor (L.knot) */
  lash: { tell: 0.75, v: 330, dmg: 12, h: 20, rel: 0.5 },
  crush: { tell: 1.0, fall: 0.32, dmg: 20, w: 20, from: 190 },
  bloom: { tell: 0.95, live: 3.4, r: 26, dmg: 5, tick: 0.5, st: 14 },
  brood: { tell: 0.8, n: [2, 2], max: 2, every: [18, 13], hp: 9 },
  wither: { tell: 0.9, cd: 2.4 },
  net: { tell: 1.3, live: 3.0, off: [4.2, 3.4], drain: 0.06 },
  seedHold: [9, 6],
  phase2: 0.5,
  rise: 2.0,
};
export const MC_SAY = {
  lash: 'ROOT LASH: JUMP', crush: 'CAP CRUSH: MOVE OFF', bloom: 'SPORE BLOOM: STEP OUT OR STRIKE IT', brood: 'HER BROOD: A HEAVY BLOW BURSTS ONE',
  open: 'HER KNOT OPENS', seal: 'SHE SEALS', wind: 'HER SPORES GIVE YOU WIND', ward: 'WARDED', above: 'FROM ABOVE: HER KNOT', spring: 'A SPRING SPORE', burst: 'IT BURSTS INTO A SPRING SPORE',
  net: 'THE NET WAKES: LIVE ON THE CAPS', netOn: 'THE FLOOR STINGS', wither: 'SHE WITHERS YOUR CAP', crushed: 'SHE CRUSHES YOUR CAP',
};
/* B14: her key, shown (src/boss-read.js draws the glyph over her and names it on a turned blow) */
KEY_ROWS.mother = [{ ph: '*', key: 'plunge', word: MC_SAY.above }];
export const MC_POSES = ['idle', 'lashTell', 'lash', 'crushTell', 'crush', 'bloomTell', 'bloom', 'broodTell', 'brood', 'witherTell', 'wither', 'open', 'ward', 'phaseRise', 'wake'];
export const MC_TELLS = ['lashTell', 'crushTell', 'bloomTell', 'broodTell', 'witherTell'];

export function makeMotherCap(ctx) {
  const H = {}, TS = ctx.TS;
  const A = () => ctx.L.arena, P0 = () => ctx.P();
  const say = (x, y, k, c = '#ffd36b') => ctx.number(x, y, MC_SAY[k], c);
  H.owns = e => e && e.t === 'mother';
  H.warm = () => MART.warm();   /* (claude/sporewood2art) every pose baked at the level load, not in the fight */
  const knotX = e => e.x, knotY = () => A().floor - MC.knotY;
  const seeds = () => ctx.movers().filter(m => m.kind === 'growcap' && m.mother && m.seed);
  H.knotReady = e => e && e.alive && e.mode !== 'sleep' && e.mode !== 'wake' && e.mode !== 'open' && e.mode !== 'phaseRise' && !(e.ward > 0);
  H.isOpen = e => !!e && e.mode === 'open';

  /* ---------- A BLOW'S SHARE (B15): open x2; warded or sealed 0.4 with a told clank ---------- */
  H.take = (e, fromX, tag) => { if (e.mode === 'open') return { mul: MC.openMul };
    if (e.ward > 0) return { mul: MC.take, word: MC_SAY.ward }; return { mul: MC.take, word: MC_SAY.above, key: true }; };

  /* ---------- THE OPENING ---------- */
  function open(e, p) {
    e.mode = 'open'; e.modeT = MC.openT; e.opens = (e.opens || 0) + 1; e.lashes = []; e.crushes = [];
    say(e.x, A().floor - 140, 'open', '#ff7a9a'); ctx.sfx.gillOpen && ctx.sfx.gillOpen(); ctx.shake(6); ctx.burst(e.x, knotY(), 34, ['#ff7a9a', '#fff1a8', '#e0b0f0'], 150, 0.8);
    if (p) { p.plunge = false; p.vy = -170; p.ground = false; p.canCut = true; if (p.hitSet) p.hitSet.clear();   /* (a short hop off her knot: the window is for cutting, not for falling) */
      /* THE SPORES HELP YOU, here too: her knot bursts in a cloud of the wood's own spores that GIVE YOU BACK YOUR WIND (a plunge - the pyromancer's FIREDROP most of all - can leave
         a hero winded, and a window spent winded was no window: the lab's pyromancer opened her nine times and cut her for half the knight's share) */
      if (p.maxSt) { p.st = Math.max(p.st || 0, p.maxSt * MC.wind); p.winded = false; p.exhaustT = 0; p.stDelay = 0; } say(e.x, A().floor - 152, 'wind', '#a6e04a'); ctx.burst(e.x, knotY(), 18, ['#a6e04a', '#dfffa0'], 90, 0.6); }
  }
  /* a plunge on her knot (main.js's plunge branch asks first; update() asks too, for a plunge that never met her body) */
  H.knotHit = (p, e) => { e = e || ctx.boss(); if (!e || !H.knotReady(e) || !p || p.dead || !p.plunge || (p.vy || 0) <= 0) return false;
    const f = A().floor; if (Math.abs(p.x - knotX(e)) > MC.knotW || p.y < f - MC.knotUp || p.y > f - MC.knotDn) return false;
    open(e, p); return true; };

  /* ---------- THE BROOD ---------- */
  H.broodDied = (q, heavy) => { if (!heavy) return false; if (ctx.spring) ctx.spring(q.x, q.y - 10, 6); say(q.x, q.y - 26, 'burst', '#e0c8ff'); return true; };

  /* ---------- A BLOW ON A BLOOM: it becomes a spring spore ---------- */
  H.strike = hb => { const e = ctx.boss(); if (!e || !e.blooms || !hb) return;
    for (const b of e.blooms) { if (b.gone) continue; const r = b.live ? MC.bloom.r : 18;
      if (hb.l < b.x + r && hb.r > b.x - r && hb.t < b.y + r * 0.7 && hb.b > b.y - r * 0.7) { b.gone = true; if (ctx.spring) ctx.spring(b.x, b.y + 6, 6); say(b.x, b.y - 20, 'spring', '#e0c8ff'); ctx.burst(b.x, b.y, 16, ['#c9a0ff', '#fff1ff'], 80, 0.5); } }
    e.blooms = e.blooms.filter(b => !b.gone); };

  /* ---------- HER PICK: where you stand draws the move (no move twice running; one not used lately grows likelier) ---------- */
  function pick(e) {
    const p = P0(), f = A().floor, high = p && p.y < f - 30, up = seeds().filter(m => m.state === 'up' || m.state === 'grow');
    const want = { bloom: 2, lash: high ? 0.4 : 2.6, crush: high ? 2.6 : 1.8, wither: e.phase >= 2 && up.length ? (high ? 3 : 1.6) : 0 };
    let tot = 0; const ks = Object.keys(want), w = ks.map(k => { const v = k === e.last ? 0 : want[k] * (1 + 0.5 * ((e.since || {})[k] || 0)); tot += v; return v; });
    let r = Math.random() * tot, out = ks[0]; for (let i = 0; i < ks.length; i++) { if (w[i] <= 0) continue; out = ks[i]; r -= w[i]; if (r <= 0) break; }
    e.since = e.since || {}; for (const k of ks) e.since[k] = k === out ? 0 : (e.since[k] || 0) + 1; e.last = out; return out;
  }
  function begin(e, k) {
    const p = P0(), f = A().floor, a = A();
    if (k === 'lash') { e.mode = 'lashTell'; e.modeT = MC.lash.tell * (e.phase >= 2 ? 0.85 : 1); e.lashDir = p && p.x < e.x ? -1 : 1; e.lashBoth = e.phase >= 2; ctx.number(e.x, f - 140, '!!', '#ff6b6b'); say(e.x, f - 152, 'lash', '#ff9b6b'); ctx.sfx.crack && ctx.sfx.crack(); }
    else if (k === 'crush') { e.mode = 'crushTell'; e.modeT = MC.crush.tell; const tx = Math.max(a.x0 + 20, Math.min(a.x1 - 20, p ? p.x : e.x)); e.crushX = tx; ctx.number(tx, f - 40, '!!', '#ff6b6b'); say(tx, f - 52, 'crush', '#ff9b6b'); ctx.sfx.buzz && ctx.sfx.buzz(); }
    else if (k === 'bloom') { e.mode = 'bloomTell'; e.modeT = MC.bloom.tell; const bx = Math.max(a.x0 + 20, Math.min(a.x1 - 20, p ? p.x : e.x)), by = p ? p.y - 12 : f - 12; (e.blooms = e.blooms || []).push({ x: bx, y: by, t: 0, live: false, tickT: 0 }); ctx.number(bx, by - 30, '!!', '#ff6b6b'); say(bx, by - 42, 'bloom', '#e0b0f0'); ctx.sfx.puff && ctx.sfx.puff(); }
    else if (k === 'wither') { const up = seeds().filter(m => m.state === 'up'); const tgt = up.sort((m1, m2) => Math.abs(m1.x + 16 - (p ? p.x : e.x)) - Math.abs(m2.x + 16 - (p ? p.x : e.x)))[0];
      if (!tgt) return begin(e, 'bloom'); e.mode = 'witherTell'; e.modeT = MC.wither.tell; e.witherCap = tgt; tgt.shiver = MC.wither.tell; say(tgt.x + 16, tgt.y - 28, 'wither', '#c9a0ff'); ctx.sfx.hiss && ctx.sfx.hiss(); }
    else if (k === 'brood') { e.mode = 'broodTell'; e.modeT = MC.brood.tell; ctx.number(e.x, f - 140, '!', '#ffd36b'); say(e.x, f - 152, 'brood', '#e0b0f0'); ctx.sfx.squelch && ctx.sfx.squelch(); }
  }
  function release(e) {
    const f = A().floor, a = A(), m = e.mode;
    if (m === 'lashTell') { e.mode = 'lash'; e.modeT = MC.lash.rel; (e.lashes = e.lashes || []); for (const d of e.lashBoth ? [-1, 1] : [e.lashDir]) e.lashes.push({ x: e.x + d * 16, d, hit: new Set() }); ctx.sfx.crack && ctx.sfx.crack(); ctx.shake(3); }
    else if (m === 'crushTell') { e.mode = 'crush'; e.modeT = 0.4; (e.crushes = e.crushes || []).push({ x: e.crushX, y: f - MC.crush.from, vy: 0, t: 0, hit: new Set(), done: false }); }
    else if (m === 'bloomTell') { e.mode = 'bloom'; e.modeT = 0.4; for (const b of e.blooms || []) if (!b.live) { b.live = true; b.t = 0; } ctx.sfx.puff && ctx.sfx.puff(); }
    else if (m === 'witherTell') { e.mode = 'wither'; e.modeT = 0.4; const c = e.witherCap; if (c && (c.state === 'up' || c.state === 'grow')) { c.state = 'wither'; c.crushed = true; c.cd = MC.wither.cd; c.shiver = 0; ctx.burst(c.x + 16, c.y, 14, ['#9a5aa8', '#c9a0ff', '#4a3a38'], 70, 0.6); } e.witherCap = null; }
    else if (m === 'broodTell') { e.mode = 'brood'; e.modeT = 0.4; const alive = ctx.enemies().filter(q => q.alive && q.brood).length, n = Math.min(MC.brood.n[e.phase >= 2 ? 1 : 0], MC.brood.max - alive);
      for (let i = 0; i < n; i++) { const d = i % 2 ? 1 : -1; ctx.spawnBrood(e.x + d * (30 + 10 * i), f - 70, d); } }
  }

  /* ---------- UPDATE ---------- */
  H.update = (e, dt) => {
    e.anim = (e.anim || 0) + dt;
    if (e.mode === 'sleep') return;
    const f = A().floor, a = A(), p = P0();
    if (e.mode !== e.poseMode) { e.poseMode = e.mode; e.poseT0 = Math.max(0.05, e.modeT || 0.05); }
    e.modeT -= dt; e.ward = Math.max(0, (e.ward || 0) - dt);
    { const was = e.openK || 0; e.openK = Math.max(0, Math.min(1, was + (e.mode === 'open' ? 1 : -1) * dt / 0.4)); }
    if (p && H.knotHit(p, e)) {}
    /* THE SECOND PHASE: under half her bar the net wakes */
    if ((e.phase || 1) < 2 && e.hp <= e.maxHp * MC.phase2 && e.mode !== 'open') { e.phase = 2; e.mode = 'phaseRise'; e.modeT = MC.rise; e.lashes = []; e.crushes = []; e.net = { ph: 'off', t: 1.2 };
      say(e.x, f - 150, 'net', '#a6e04a'); ctx.sfx.roar && ctx.sfx.roar(); ctx.shake(6); for (const m of seeds()) m.hold = MC.seedHold[1]; }
    e.phase = e.phase || 1;
    /* THE LASHES run the floor out to the walls */
    for (const l of e.lashes || []) { l.x += l.d * MC.lash.v * dt;
      for (const pp of ctx.players()) if (pp && !pp.dead && !l.hit.has(pp) && Math.abs(pp.x - l.x) < 12 && pp.y > f - MC.lash.h) { l.hit.add(pp); ctx.damage(pp, l.x, MC.lash.dmg, { unblockable: true, up: true, name: 'HER ROOTS' }); } }
    e.lashes = (e.lashes || []).filter(l => l.x > a.x0 - 10 && l.x < a.x1 + 10);
    /* THE CRUSHES fall on their marks */
    for (const c of e.crushes || []) { c.t += dt; if (c.done) continue; c.vy += 1400 * dt; c.y += c.vy * dt;
      /* what it lands on: a seed cap grown under it, or the floor */
      let land = f; const cap = seeds().find(m => (m.state === 'up' || m.state === 'grow') && c.x > m.x - 6 && c.x < m.x + m.w + 6); if (cap) land = Math.min(land, cap.y);
      const box = { l: c.x - MC.crush.w, r: c.x + MC.crush.w, t: c.y - 16, b: c.y };
      for (const pp of ctx.players()) if (pp && !pp.dead && !c.hit.has(pp) && pp.x + 5 > box.l && pp.x - 5 < box.r && pp.y > box.t && pp.y - 14 < box.b) { c.hit.add(pp); ctx.damage(pp, c.x, MC.crush.dmg, { unblockable: true, up: true, name: 'HER CAP' }); }
      if (c.y >= land) { c.y = land; c.done = true; c.t = 0; ctx.shake(4); ctx.sfx.thud && ctx.sfx.thud(); ctx.burst(c.x, land, 16, ['#9a5aa8', '#e0b0f0', '#4a3a38'], 110, 0.6);
        if (cap) { cap.state = 'wither'; cap.crushed = true; cap.cd = MC.wither.cd; say(c.x, land - 30, 'crushed', '#c9a0ff'); } } }
    e.crushes = (e.crushes || []).filter(c => !(c.done && c.t > 0.5));
    /* THE BLOOMS: a live cloud stings who stands in it, and eats his wind */
    for (const b of e.blooms || []) { b.t += dt; if (!b.live) continue; b.tickT -= dt;
      for (const pp of ctx.players()) if (pp && !pp.dead && Math.hypot(pp.x - b.x, pp.y - 8 - b.y) < MC.bloom.r) { pp.st = Math.max(0, (pp.st || 0) - MC.bloom.st * dt); if (b.tickT <= 0) { b.tickT = MC.bloom.tick; ctx.damage(pp, b.x, MC.bloom.dmg, { unblockable: true, noKnock: true, name: 'HER SPORES' }); } } }
    e.blooms = (e.blooms || []).filter(b => !(b.live && b.t > MC.bloom.live));
    /* THE NET (P2): off -> told -> stings -> off */
    if (e.net) { const N = e.net; N.t -= dt;
      if (N.t <= 0) { if (N.ph === 'off') { N.ph = 'tell'; N.t = MC.net.tell; ctx.sfx.hiss && ctx.sfx.hiss(); } else if (N.ph === 'tell') { N.ph = 'live'; N.t = MC.net.live; say(e.x, f - 40, 'netOn', '#a6e04a'); } else { N.ph = 'off'; N.t = MC.net.off[1]; } }
      for (const pp of ctx.players()) { const on = N.ph === 'live' && e.alive && pp && !pp.dead && pp.ground && !pp.onMover && pp.y >= f - 1 && pp.x > a.x0 && pp.x < a.x1; ctx.drain(pp, on ? MC.net.drain : 0); } }
    for (const m of seeds()) if (m.shiver > 0) m.shiver -= dt;
    /* THE BROOD on its own clock, between her moves */
    e.broodT = (e.broodT ?? MC.brood.every[0] * 0.6) - dt;
    /* HER MOVES */
    if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 1.0; } return; }
    if (e.mode === 'phaseRise') { if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.6; } return; }
    if (e.mode === 'open') { if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = MC.idle[e.phase - 1] + 0.4; e.ward = MC.wardT; say(e.x, f - 140, 'seal', '#c9b8e8'); ctx.sfx.thud && ctx.sfx.thud(); } return; }
    if (/Tell$/.test(e.mode)) { if (e.modeT <= 0) release(e); return; }
    if (e.mode !== 'idle') { if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = MC.idle[e.phase - 1]; } return; }
    if (e.modeT > 0) return;
    if (e.broodT <= 0 && ctx.enemies().filter(q => q.alive && q.brood).length < MC.brood.max) { e.broodT = MC.brood.every[e.phase - 1]; begin(e, 'brood'); return; }
    begin(e, pick(e));
  };

  /* ---------- DRAWING (greybox: her poses are the art lane's - every move has its own windup and release here, from her body) ---------- */
  H.drawWorld = (g, cx, cy, time) => { const e = ctx.boss(); if (!e || e.t !== 'mother') return; const a = A(), f = a.floor, R = Math.round, fy = R(f - cy);
    /* the net's veins on the floor (P2): a told web of foxfire threads spreading from her foot (yellow while told), then live and crackling green-white; every thread forks */
    if (e.net && e.net.ph !== 'off' && e.alive) { const N = e.net, live = N.ph === 'live', k = live ? 1 : 1 - Math.max(0, N.t) / MC.net.tell, span = (a.x1 - a.x0) / 2, col = live ? FOX.c : '#ffd36b', hi = live ? FOX.hi : '#fff1a8';
      for (const s of [-1, 1]) for (let q = 0; q < span * (live ? 1 : k); q += 2) { const x = R(e.x + s * q - cx), wob = Math.round(Math.sin(q * 0.31 + (live ? time * 14 : 0)) * 1.5); g.globalAlpha = live ? 0.8 : 0.4 + 0.4 * k; g.fillStyle = col; g.fillRect(x, fy - 2 + wob, 2, 1);
        if (q % 14 < 2) { g.fillRect(x, fy - 4 + wob, 1, 2); g.fillRect(x + s, fy - 6 + wob - (q % 3), 1, 2); } if (live && (q + Math.floor(time * 20)) % 17 === 0) { g.fillStyle = hi; g.fillRect(x, fy - 3 + wob, 1, 1); g.fillStyle = col; } }
      if (live) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18 + 0.08 * Math.sin(time * 16); g.fillStyle = FOX.c; g.fillRect(R(a.x0 - cx), fy - 5, R(a.x1 - a.x0), 5); g.restore(); }
      g.globalAlpha = 1; }
    /* the lashes: a thorned root along the floor, undulating, its tip hot and kicking up dust */
    for (const l of e.lashes || []) { const x0 = R(e.x - cx), x1 = R(l.x - cx), lo = Math.min(x0, x1), len = Math.abs(x1 - x0);
      for (let q = 0; q < len; q += 1) { const t = q / Math.max(1, len), u = l.d > 0 ? lo + q : lo + len - q, w = Math.max(2, Math.round(7 - t * 4)), y = fy - w - Math.round(Math.sin(q * 0.35 + time * 22) * 1.5);
        g.fillStyle = '#3c2a2e'; g.fillRect(u, y, 1, w); g.fillStyle = (q % 7 < 3) ? '#5e4642' : '#86685c'; g.fillRect(u, y, 1, 2); if (q % 11 === 5) { g.fillStyle = '#b09480'; g.fillRect(u, y - 2, 1, 2); } }
      const tx = x1, ty = fy - 8; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.6; g.drawImage(foxHalo('255,120,80'), tx - 14, ty - 14, 28, 28); g.restore(); g.globalAlpha = 1; for (let q = 0; q < 4; q++) { g.fillStyle = q % 2 ? '#ffd36b' : '#ff9a6b'; g.fillRect(tx - l.d * q * 2, fy - 10 - q, 3, 3); }
      for (let q = 0; q < 5; q++) { g.globalAlpha = 0.5; g.fillStyle = '#9a8aa0'; g.fillRect(tx - l.d * (4 + q * 5), fy - 4 - ((q * 7 + R(time * 30)) % 6), 2, 2); } g.globalAlpha = 1; }
    /* the crush: the red ring on the mark while it is told (and the cap's own shadow growing); the falling cap itself is a plum dome with its gills showing */
    if (e.mode === 'crushTell' && e.crushX !== undefined) { const k = 1 - Math.max(0, e.modeT) / MC.crush.tell, x = R(e.crushX - cx); g.globalAlpha = 0.5 + 0.4 * k; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 2, MC.crush.w, 5, 0, 0, 7); g.stroke(); g.lineWidth = 1;
      g.fillStyle = 'rgba(20,10,30,' + (0.2 + 0.4 * k).toFixed(2) + ')'; g.beginPath(); g.ellipse(x, fy - 2, MC.crush.w * (0.4 + 0.6 * k), 4, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      g.fillStyle = 'rgba(255,155,107,0.5)'; for (let y = fy - MC.crush.from; y < fy - 20; y += 8) g.fillRect(x, y, 1, 3); }
    for (const c of e.crushes || []) { const x = R(c.x - cx), y = R(c.y - cy), a2 = c.done ? Math.max(0, 1 - c.t / 0.5) : 1; g.globalAlpha = a2; g.drawImage(dropCap(), x - 24, y - 24);
      if (!c.done) { g.globalAlpha = 0.5; g.fillStyle = '#c9a0ff'; for (let q = 1; q < 4; q++) g.fillRect(x - 14 + q * 8, y - 28 - q * 4, 1, 6); } g.globalAlpha = 1; }
    /* the blooms: a violet ring that grows while told, spores gathering inward; then a DRAWN spore cloud (lobes, a ring at its reach, motes) */
    for (const b of e.blooms || []) { const x = R(b.x - cx), y = R(b.y - cy);
      if (!b.live) { const k = Math.min(1, b.t / MC.bloom.tell); g.globalAlpha = 0.45 + 0.4 * k; g.strokeStyle = '#c9a0ff'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, MC.bloom.r * (0.3 + 0.7 * k), 0, 7); g.stroke(); g.lineWidth = 1;
        for (let i = 0; i < 10; i++) { const an = i / 10 * 6.283 + time * 2, rr = MC.bloom.r * (1.5 - 1.0 * k); g.fillStyle = i % 2 ? '#fff1ff' : '#c9a0ff'; g.fillRect(R(x + Math.cos(an) * rr), R(y + Math.sin(an) * rr * 0.7), 2, 2); } g.globalAlpha = 1; continue; }
      drawSporeCloud(g, { x: b.x, y: b.y, r: MC.bloom.r, life: Math.max(0.3, (MC.bloom.live - b.t) * 1.2), sleep: true }, cx, cy, time);
      g.globalAlpha = 0.7 * Math.min(1, (MC.bloom.live - b.t) / 0.6); g.strokeStyle = '#efe6ff'; g.beginPath(); g.arc(x, y, MC.bloom.r, 0, 7); g.stroke(); g.globalAlpha = 1; }
    /* a cap she is withering shudders violet (the cap's own draw does it: src/redraw/sporewood2_world.js) */
  };
  /* the cap she drops: a plum dome, its pale veil and gills showing underneath; 48 x 30 */
  let DROP = null; const dropCap = () => DROP || (DROP = (() => { const [c, g] = MART.canvasOf(48, 30); const cp = ['#4e2a5e', '#7e4e94', '#b488c8'];
    for (let y = 0; y < 14; y++) { const t = (y + 1) / 14, w = Math.round(22 * Math.sqrt(1 - Math.pow(1 - t, 2))); g.fillStyle = y < 2 ? '#e8d0f0' : y < 6 ? cp[2] : y < 11 ? cp[1] : cp[0]; g.fillRect(24 - w, 8 + y, w * 2, 1); g.fillStyle = y < 6 ? '#e8d0f0' : cp[2]; g.fillRect(24 - w, 8 + y, Math.max(1, Math.round(w * 0.3)), 1); }
    g.fillStyle = '#e8ddc0'; g.fillRect(2, 22, 44, 1); for (let x = 3; x < 45; x += 2) { g.fillStyle = x % 4 ? '#b8a888' : '#e8ddc0'; g.fillRect(x, 23, 1, 4); } g.fillStyle = '#f4e6f4'; for (const [x, y] of [[14, 12], [24, 10], [33, 14], [20, 15]]) g.fillRect(x, y, 3, 2); return c; })());
  /* HER BODY: the stalk, the cap (sealed / open / torn) on a pose of its own for every move (B16), the knot on her crown with her key over it */
  H.pose = e => { const md = e.mode || 'idle', tell = /Tell$/.test(md), kind = tell ? md.slice(0, -4) : md, k = Math.max(0, Math.min(1, 1 - (e.modeT || 0) / (e.poseT0 || 0.5))), ek = k * k * (3 - 2 * k);
    const o = { kind, tell, k: ek, capDy: 0, rot: 0, sx: 1, sy: 1, shake: 0, gill: 0, roots: 0, lean: 0 };
    if (kind === 'lash') { if (tell) { o.capDy = R6(5 * ek); o.sy = 1 - 0.06 * ek; o.roots = 0.4 + 0.6 * ek; o.shake = Math.round(Math.sin(e.anim * 50) * 2 * ek); o.lean = (e.lashDir || 1) * 0.05 * ek; } else { o.roots = 1 - ek; o.capDy = R6(4 * (1 - ek)); o.lean = (e.lashDir || 1) * 0.08 * (1 - ek); } }
    else if (kind === 'crush') { if (tell) { o.capDy = -R6(14 * ek); o.sy = 1 + 0.06 * ek; o.rot = -0.05 * ek; o.gill = 0.3 * ek; } else { o.capDy = R6(6 * (1 - ek)); o.sy = 1 - 0.08 * (1 - ek); o.sx = 1 + 0.05 * (1 - ek); } }
    else if (kind === 'bloom') { if (tell) { o.sx = 1 + 0.08 * ek; o.sy = 1 + 0.05 * ek; o.gill = 0.4 + 0.6 * ek; o.capDy = -R6(4 * ek); } else { o.gill = 1 - ek; } }
    else if (kind === 'brood') { if (tell) { o.rot = 0.07 * Math.sin(e.anim * 6) * ek; o.gill = 0.6 + 0.4 * ek; o.sy = 1 + 0.04 * ek; } else { o.gill = 1 - ek; o.capDy = R6(3 * (1 - ek)); } }
    else if (kind === 'wither') { if (tell) { o.lean = (e.witherCap && e.witherCap.x + 16 < e.x ? -1 : 1) * 0.1 * ek; o.gill = 0.5 * ek; o.shake = Math.round(Math.sin(e.anim * 40) * ek); } else { o.lean = 0.05 * (1 - ek); } }
    else if (kind === 'phaseRise') { o.shake = Math.round(Math.sin(e.anim * 44) * 3); o.roots = 1; o.gill = 1; }
    return o; };
  const R6 = v => Math.round(v);
  H.draw = (g, e, cx, cy, time) => {
    /* (claude/sporewood2art) HER BODY IS A BAKED PICTURE PER POSE (src/redraw/sporewood2_mother.js: a windup frame for every move, a release frame, the open crown, the ward, the rise): chosen by her mode and how far into it she is */
    const f = A().floor, R = Math.round, x = R(e.x - cx), fy = R(f - cy), ps = H.pose(e), oK = e.openK || 0, oE = oK * oK * (3 - 2 * oK), md = e.mode;
    let kind = ps.kind, tell = ps.tell, k = ps.k; if (md === 'sleep') { kind = 'wake'; k = 0; tell = false; } else if (md === 'idle' || md === 'walk') kind = 'idle';
    if (e.alive === false) { if (e._dAt == null) e._dAt = time; kind = 'dead'; tell = false; k = Math.max(0, time - e._dAt); } else e._dAt = null;   /* (claude/motherface) death: the eyes fade, the face sags */
    { const hp = ctx.P(), dx = hp ? hp.x - e.x : 0; if (e._look == null) e._look = 0; if (dx < -34) e._look = -1; else if (dx > 34) e._look = 1; else if (Math.abs(dx) < 14) e._look = 0; }   /* her eyes follow you (hysteresis, so they do not flicker) */
    const fr = MART.frameFor(e, kind, tell, k, e.phase || 1, e.ward || 0, time, e._look || 0), flip = (kind === 'lash' ? (e.lashDir || 1) : kind === 'wither' ? (e.witherCap && e.witherCap.x + 16 < e.x ? -1 : 1) : 1) < 0;
    if (flip) { g.save(); g.translate(x, 0); g.scale(-1, 1); g.drawImage(fr, -MART.AX, fy - MART.AY); g.restore(); } else g.drawImage(fr, x - MART.AX, fy - MART.AY);
    /* THE KNOT on her crown: the target. Gold-haloed and glinting while it can be plunged; open it burns (a pulsing ring as it tears) */
    { const kx = R(e.x - cx), ky = R(f - MC.knotY - cy) + (ps.kind === 'crush' || ps.kind === 'lash' ? 4 : 0), ready = H.knotReady(e);
      if (ready) { const gl = Math.floor(time * 3) % 2; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.32 + 0.16 * gl; g.drawImage(foxHalo('255,211,107'), kx - 22, ky - 20, 44, 40); g.restore(); g.globalAlpha = 1; g.fillStyle = gl ? '#fff1a8' : '#ffd36b'; g.fillRect(kx - 5, ky - 7, 10, 1); }
      if (oE > 0.05) { const pulse = (1 + Math.sin(time * 6) * 0.12) * oE; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5; g.fillStyle = '#ff7a9a'; g.beginPath(); g.ellipse(kx, ky - 2, 18 * pulse, 11 * pulse, 0, 0, 7); g.fill(); g.restore(); g.globalAlpha = 1; }
      if (e.mode === 'open' && oK < 1) { g.globalAlpha = 0.8 * (1 - oE); g.strokeStyle = '#fff1a8'; g.lineWidth = 2; g.beginPath(); g.arc(kx, ky - 2, 12 + 50 * oE, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; } }
    /* the ward: a told pearl sheen that fades with it (the frame is already pale) */
    if (e.ward > 0) { const kk = Math.min(1, e.ward / 0.6); g.globalAlpha = 0.28 * kk * (0.7 + 0.3 * Math.sin(time * 8)); g.fillStyle = '#efe6ff'; g.beginPath(); g.ellipse(x, fy - 100, 66, 30, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  };
  H.read = () => { const e = ctx.boss(); if (!e || e.t !== 'mother') return null;
    return { mode: e.mode, modeT: e.modeT, phase: e.phase || 1, hp: e.hp, maxHp: e.maxHp, ward: e.ward || 0, opens: e.opens || 0, ready: H.knotReady(e), knot: { x: knotX(e), y: knotY() },
      lashes: (e.lashes || []).map(l => ({ x: l.x, d: l.d })), crushX: e.mode === 'crushTell' ? e.crushX : null, crushes: (e.crushes || []).map(c => ({ x: c.x, y: c.y, done: c.done })),
      blooms: (e.blooms || []).map(b => ({ x: b.x, y: b.y, live: b.live, t: b.t })), net: e.net ? { ph: e.net.ph, t: e.net.t } : null,
      seeds: seeds().map(m => ({ x: m.x, w: m.w, y: m.y, y0: m.y0, rise: m.rise, state: m.state, cd: m.cd || 0, shiver: m.shiver || 0 })), wither: e.witherCap ? e.witherCap.x : null }; };
  return H;
}
