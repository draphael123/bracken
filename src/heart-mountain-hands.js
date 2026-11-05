// src/heart-mountain-hands.js - THE HEART OF THE MOUNTAIN: the level's rule and its one new foe (claude/heartlevel, the OPUS GREYBOX, 2026-11-05).
// src/heart-mountain.js builds the level; this binds it to the game. main.js owns the world and calls:
//   reset (spawnEntities), update, strike (a hero's blow: a ward-stone), ventOn / ventWarm (a heart vent's breath), owns / leaper / drawFoe (THE MAGMA LEAPER: its own machine
//   and its greybox body), drawWorld (GREYBOX: the crust, the wards, the chains, the beat's glow), drawStructure (the caldera ledges' basalt columns), read (tools).
// THE RULE (L.rule): THE MOUNTAIN'S HEART BEATS. ON THE BEAT THE CRUST MELTS AND THE VENTS BLOW. STRIKE A WARD-STONE AND THE CRUST AROUND IT HOLDS.
//   THE BEAT: one clock (phase 0..1). Its period is the ZONE of the leading hero's column (L.hmZones: the eruption builds, 7.0 s -> 4.5 s); none in the caldera.
//     COOL    the crust is one-way footing; the heart vents are still.
//     TELL    the last HM.beat.tell s before the beat: the crust's cracks glow, the rumble, '!' over the crust a hero stands on (told, never a surprise).
//     SURGE   HM.beat.surge s from the beat: every crust that is not HELD melts (its cells to air: a hero on it drops into the magma - a fire pool, BURNED, handed back to
//             the last bank by src/main.js L.waterHurts; a foe on it burns there, hazardFoe), every heart vent blows, every leaper that was told leaps.
//   A WARD-STONE: ANY blow that lands on it HOLDS its crusts HM.ward.hold s, beat or no beat (held = cool grey, a frost-white rim, a line to the stone; its rune flickers the
//     last HM.ward.warn s - told); struck DURING a surge its melted crusts HARDEN AT ONCE. A hold never ends inside a surge (it waits the surge out). Then the stone is
//     SPENT HM.ward.spent s (dark), then it can be struck again. (A hold is TIME, not one beat: the slowest hero, the blood knight, must cross the longest held crust in it.)
// THE MAGMA LEAPER (e.t 'leaper', the level's ONE new foe): it lives in its channel's magma (L.pools, fire). UNDER: a dark shape that follows you along the channel.
//   On the TELL, if a hero is over its channel and near: 'leapTell' - bubbles where it will come up, a red !! (src/marks.js). On THE BEAT: 'leap' - out of the magma in an
//   arc at the hero (its body is the blow: src/main.js BODY_BLOW). In the air it is a target like any other. Where it lands on footing it THRASHES (open), snaps if you
//   stand at its jaw ('biteTell' ! then 'bite'), then FLOPS back to the magma. Footing that melts under it drops it back in. Cut it down and the channel is quiet.
// Every capital line it says is an HM_SAY line (src/hint-lines.js lists them).
export const HM = {
  beat: { tell: 1.2, surge: 1.4 },
  ward: { hold: 10, warn: 2, spent: 2.5, box: 10 },
  leaper: { hp: 18, dmg: 14, out: 3.0, near: 7 * 16, rise: 12 * 16, under: 26, leapVy: -380, maxVx: 150, g: 900, thrash: 1.5, biteTell: 0.45, bite: 0.2, jaw: 24, flopVy: -220, flopVx: 70 },
};
export const HM_SAY = {
  beat: 'THE HEART BEATS', melt: 'THE CRUST MELTS', cool: 'THE CRUST COOLS', held: 'THE CRUST HOLDS', harden: 'THE CRUST HARDENS', spent: 'THE WARD IS SPENT',
  vent: 'THE VENT BLOWS', leaper: 'A LEAPER!', crustHint: 'THE CRUST MELTS ON THE BEAT. WATCH ITS CRACKS GLOW AND CROSS BETWEEN BEATS - OR STRIKE A WARD-STONE TO HOLD IT.',
};
const COL = { crust: '#3a2420', crustL: '#6a4030', crack: '#ff7a2a', hot: '#ffe08a', held: '#6a7680', heldL: '#d8e4ec', ward: '#1a1420', wardL: '#4a4458', rune: '#9ad8ff', runeOff: '#3a3448',
  chain: '#5a5450', chainL: '#9a9088', chainH: '#ff9a4a', magma: '#ff5a1a', magmaL: '#ffc04a', leap: '#3a1a14', leapL: '#c8461a', leapH: '#ffb040', eye: '#fff6c8', col: '#241a20', colL: '#4a3a3a' };

export function makeHeartHands(ctx) {
  const TS = ctx.TS, T = ctx.T, H = {};
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().heartLevel);
  const now = () => ctx.time();
  const say = (x, y, k, c = '#ffd36b') => ctx.number && ctx.number(x, y, HM_SAY[k] || k, c);
  const once = k => { if (!S || S.said.has(k)) return false; S.said.add(k); return true; };
  const sfx = (...ks) => { for (const k of ks) { const f = ctx.sfx && ctx.sfx[k]; if (f) { try { f(); } catch {} return; } } };
  const heroes = () => (ctx.players ? ctx.players() : [ctx.hero()]).filter(p => p && !p.dead);

  /* ---------- RESET (every load and every respawn: the grid was laid again, the foes spawned again) ---------- */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.heartLevel) { S = null; return; }
    S = { phase: 0, surgeT: 0, telling: false, beats: 0, said: new Set(), crust: new Map(), wards: new Map(), zone: 0 };
    for (const c of lv.hmCrust || []) S.crust.set(c.id, { c, melted: false });
    for (const w of lv.hmWards || []) S.wards.set(w.id, { w, holdT: 0, spentT: 0 });
    /* the crust and the chains are drawn here (drawWorld), not by the tile kit: clear their baked tiles (cellSet nulls a cell's sprite when it changes) */
    for (const { c } of S.crust.values()) for (let x = c.x0; x <= c.x1; x++) { ctx.cellSet(x, c.y, T.AIR); ctx.cellSet(x, c.y, T.ONEWAY); }
    for (const ch of lv.hmChains || []) for (let y = ch.y0; y <= ch.y1; y++) { ctx.cellSet(ch.x, y, T.AIR); ctx.cellSet(ch.x, y, T.CLIMB); }
  };

  /* ---------- THE BEAT ---------- */
  const periodAt = x => { const tx = Math.floor(x / TS); for (const [a, b, p] of L().hmZones || []) if (tx >= a && tx <= b) return p; return 0; };
  const lead = () => { const hs = heroes(); if (!hs.length) return null; return hs.reduce((a, b) => (b.x > a.x ? b : a)); };
  const surging = () => !!S && S.surgeT > 0;
  const heldBy = st => { for (const wd of S.wards.values()) if (wd.holdT > 0 && wd.w.holds.includes(st.c.id)) return wd; return null; };
  H.held = id => { const st = S && S.crust.get(id); return !!(st && heldBy(st)); };
  const tellLeft = () => (S && S.period ? (1 - S.phase) * S.period : 99);
  H.surging = surging;
  H.telling = () => !!S && S.telling;
  const melt = st => { if (st.melted) return; st.melted = true; const c = st.c; for (let x = c.x0; x <= c.x1; x++) ctx.cellSet(x, c.y, T.AIR);
    if (ctx.burst) ctx.burst((c.x0 + c.x1 + 1) * TS / 2, c.y * TS + 4, 10, [COL.magma, COL.magmaL, COL.crust], 80, 0.5); };
  const harden = st => { if (!st.melted) return; st.melted = false; const c = st.c; for (let x = c.x0; x <= c.x1; x++) ctx.cellSet(x, c.y, T.ONEWAY); };
  const beat = () => {
    S.beats++; S.surgeT = HM.beat.surge; S.telling = false;
    for (const st of S.crust.values()) { if (heldBy(st)) continue; melt(st); }
    const h = lead(); if (h) { if (once('beat')) say(h.x, h.y - 40, 'beat', '#ff9a5c'); }
    sfx('dkEruption', 'rumble', 'puff'); if (ctx.shake) ctx.shake(2);
    for (const e of (ctx.enemies ? ctx.enemies() : [])) if (H.owns(e) && e.alive && e.mode === 'leapTell') leapOff(e);
  };
  const surgeEnd = () => {
    for (const st of S.crust.values()) harden(st);
  };
  H.update = dt => {
    if (!S || !H.on()) return;
    const h = lead(); const p = h ? periodAt(h.x) : 0; S.period = p;
    for (const wd of S.wards.values()) { if (wd.spentT > 0) wd.spentT = Math.max(0, wd.spentT - dt);
      if (wd.holdT > 0) { wd.holdT -= dt; if (wd.holdT <= 0) { if (S.surgeT > 0) wd.holdT = 0.01; else { wd.holdT = 0; wd.spentT = HM.ward.spent; } } } }   /* (a hold waits a surge out: it never drops you mid-melt) */
    if (S.surgeT > 0) { S.surgeT -= dt; if (S.surgeT <= 0) { S.surgeT = 0; surgeEnd(); } }
    if (!p) { S.telling = false; return; }                                  /* the caldera: no beat (and the crust stays as it is) */
    S.phase += dt / p;
    if (S.phase >= 1) { S.phase -= 1; beat(); return; }
    const was = S.telling; S.telling = tellLeft() <= HM.beat.tell && S.surgeT <= 0;
    if (S.telling && !was) {
      sfx('rumble', 'charge');
      /* told: '!' over the crust a hero stands on; the leapers in reach rise under the heroes over their channel */
      for (const hh of heroes()) { const st = crustUnder(hh); if (st && !heldBy(st)) say(hh.x, hh.y - 30, '!', '#ff6b6b'); }
      for (const e of (ctx.enemies ? ctx.enemies() : [])) if (H.owns(e) && e.alive && e.mode === 'under') tellLeap(e);
      if (h && once('crustHint') && ctx.hint) ctx.hint(HM_SAY.crustHint);
    }
  };
  const crustUnder = p => { const tx = Math.floor(p.x / TS), ty = Math.floor((p.y + 2) / TS); for (const st of S.crust.values()) if (ty === st.c.y && tx >= st.c.x0 && tx <= st.c.x1) return st; return null; };

  /* ---------- THE HEART VENTS (src/main.js: a vent prop with heart: true blows on the beat only) ---------- */
  H.ventOn = pr => !!S && S.surgeT > 0 && !!pr;
  H.ventWarm = pr => !!S && S.telling && !!pr;

  /* ---------- A WARD-STONE (a hero's blow) ---------- */
  const wardX = w => w.x * TS + 8, wardY = w => (w.f + 1) * TS;
  H.strike = hb => { if (!S || !hb) return;
    for (const wd of S.wards.values()) { const w = wd.w, x = wardX(w), y = wardY(w), box = { l: x - HM.ward.box, r: x + HM.ward.box, t: y - 26, b: y };
      if (!(hb.l < box.r && hb.r > box.l && hb.t < box.b && hb.b > box.t)) continue; if (ctx.hitOnce && !ctx.hitOnce(wd)) continue;
      if (wd.spentT > 0) { if (once('spent')) say(x, y - 36, 'spent', '#a8a0b8'); continue; }
      if (wd.holdT > 0) continue;
      wd.holdT = HM.ward.hold;
      let hard = false;
      for (const id of w.holds) { const st = S.crust.get(id); if (!st) continue; if (st.melted) { harden(st); hard = true; } }
      say(x, y - 36, hard ? 'harden' : 'held', '#bfe6ff'); sfx('chime', 'ui', 'puff');
      if (ctx.ring) ctx.ring(x, y - 12, 26, COL.rune);
      if (ctx.burst) ctx.burst(x, y - 14, 12, [COL.rune, COL.heldL, '#ffffff'], 70, 0.5);
    } };

  /* ---------- THE MAGMA LEAPER (main.js updateEnemies: its own machine) ---------- */
  H.owns = e => !!e && e.t === 'leaper';
  const poolOf = e => { const ps = (L().pools || []).filter(p => p.fire); return ps.find(p => e.x >= p.x0 - 4 && e.x <= p.x1 + 4) || ps.sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - e.x) - Math.abs((b.x0 + b.x1) / 2 - e.x))[0] || null; };
  const near = (e, p) => p.x > e.home.x0 - 8 && p.x < e.home.x1 + 8 && Math.abs(p.x - e.x) < HM.leaper.near + 64 && p.y < e.home.y && e.home.y - p.y < HM.leaper.rise;
  const target = e => heroes().filter(p => near(e, p)).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || null;
  const tellLeap = e => { const p = target(e); if (!p) return; e.mode = 'leapTell'; e.modeT = HM.beat.tell; e.tx = Math.max(e.home.x0 + 8, Math.min(e.home.x1 - 8, p.x)); e.x = e.tx;
    if (once('leaper') || Math.random() < 0.3) say(e.x, e.home.y - 22, 'leaper', '#ff6b6b'); };
  const leapOff = e => { const p = target(e) || ctx.hero(); e.mode = 'leap'; if (ctx.seen) ctx.seen('leaper'); e.y = e.home.y; e.vy = HM.leaper.leapVy;
    e.vx = p ? Math.max(-HM.leaper.maxVx, Math.min(HM.leaper.maxVx, (p.x - e.x) / 0.85)) : 0; e.face = e.vx >= 0 ? 1 : -1;
    if (ctx.burst) ctx.burst(e.x, e.home.y, 14, [COL.magma, COL.magmaL, COL.hot], 120, 0.5); sfx('splash', 'puff'); };
  const footAt = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return ctx.footAt ? ctx.footAt(tx, ty) : false; };
  const sink = e => { e.mode = 'under'; e.vx = 0; e.vy = 0; e.y = e.home.y + HM.leaper.under; if (ctx.burst) ctx.burst(e.x, e.home.y, 8, [COL.magma, COL.magmaL], 60, 0.4); };
  H.leaper = (e, dt) => {
    if (!S || !e.alive) return true;
    if (!e.home) { const p = poolOf(e); if (!p) { e.alive = false; return true; } e.home = { x0: p.x0, x1: p.x1, y: p.y }; e.noGrav = true; sink(e); }
    const K = HM.leaper; e.modeT = (e.modeT || 0) - dt; e.anim = (e.anim || 0) + dt;
    switch (e.mode) {
      case 'under': { const p = heroes().filter(q => near(e, q))[0]; if (p) { const want = Math.max(e.home.x0 + 8, Math.min(e.home.x1 - 8, p.x)); e.x += Math.sign(want - e.x) * Math.min(Math.abs(want - e.x), 40 * dt); }
        e.y = e.home.y + K.under; break; }
      case 'leapTell': e.y = e.home.y + K.under * 0.4; if (!surging() && e.modeT < -0.3) sink(e); break;   /* (a beat that never came - the hero left the zone: back under) */
      case 'leap': case 'fall': {
        e.vy += K.g * dt; const ny = e.y + e.vy * dt, nx = e.x + e.vx * dt;
        if (nx < e.home.x0 - 3 * TS || nx > e.home.x1 + 3 * TS) e.vx = 0; else e.x = nx;   /* it never strays far from its magma */
        if (e.vy > 0 && footAt(e.x, ny) && !footAt(e.x, e.y)) { e.y = Math.floor(ny / TS) * TS; e.mode = 'thrash'; e.modeT = K.thrash; e.vx = 0; e.vy = 0; if (ctx.dust) ctx.dust(e.x, e.y, 6); break; }
        e.y = ny; if (e.vy > 0 && e.y > e.home.y + 4 && e.x > e.home.x0 && e.x < e.home.x1) sink(e);
        break; }
      case 'thrash': case 'biteTell': case 'bite': {
        if (!footAt(e.x, e.y + 2)) { e.mode = 'fall'; e.vy = 0; break; }            /* the crust it lay on melted: back into the magma */
        const p = heroes().find(q => Math.abs(q.x - e.x) < K.jaw && Math.abs(q.y - e.y) < 20);
        e.outT = (e.outT || 0) + dt;
        if (e.mode === 'thrash') { if (p && e.modeT > 0.2 && e.outT < K.out - K.biteTell) { e.mode = 'biteTell'; e.modeT = K.biteTell; e.face = p.x >= e.x ? 1 : -1; }
          else if (e.modeT <= 0 || e.outT >= K.out) { e.outT = 0; const mid = (e.home.x0 + e.home.x1) / 2; e.mode = 'flop'; e.vy = K.flopVy; e.vx = Math.sign(mid - e.x || 1) * K.flopVx; } }
        else if (e.mode === 'biteTell') { if (e.modeT <= 0) { e.mode = 'bite'; e.modeT = K.bite; } }
        else if (e.modeT <= 0) { e.mode = 'thrash'; e.modeT = 0.6; }
        break; }
      case 'flop': { e.vy += K.g * dt; e.x += e.vx * dt; e.y += e.vy * dt;
        /* it dives back THROUGH the crust (it is the magma's own: one-way crust does not stop it); only rock does */
        const rockAt = (x, y) => (ctx.solidAt ? ctx.solidAt(Math.floor(x / TS), Math.floor(y / TS)) : false);
        if (e.vy > 0 && e.y > e.home.y + 4) sink(e); else if (e.vy > 0 && rockAt(e.x, e.y) && e.y < e.home.y - 2) { e.mode = 'thrash'; e.modeT = 0.5; e.vy = 0; e.y = Math.floor(e.y / TS) * TS; }
        break; }
      default: sink(e);
    }
    return true;
  };
  /* ---------- tools ---------- */
  H.read = () => S && { phase: +S.phase.toFixed(3), period: S.period || 0, surging: surging(), telling: S.telling, beats: S.beats,
    crust: [...S.crust.values()].map(st => ({ id: st.c.id, melted: st.melted, held: !!heldBy(st) })), wards: [...S.wards.values()].map(wd => ({ id: wd.w.id, holding: wd.holdT > 0, holdT: +wd.holdT.toFixed(2), spent: wd.spentT > 0 })) };
  H.state = () => S;

  /* ---------- GREYBOX DRAWING (the art lane replaces these) ---------- */
  const glow = () => (!S ? 0 : S.surgeT > 0 ? 1 : S.telling ? 1 - Math.max(0, tellLeft()) / HM.beat.tell : 0);
  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const k = glow();
    /* THE CHAINS: iron links from the rock, warm where they near the seal */
    for (const ch of L().hmChains || []) { const x = ch.x * TS + 8 - cx; if (x < -8 || x > VW + 8) continue;
      for (let yy = ch.y0 * TS; yy < (ch.y1 + 1) * TS; yy += 6) { const y = yy - cy; if (y < -8 || y > VH + 8) continue; const odd = (yy / 6) & 1;
        g.fillStyle = odd ? COL.chain : COL.chainL; g.fillRect(Math.round(x) - (odd ? 1 : 2), Math.round(y), odd ? 2 : 4, 5); } }
    /* THE CRUST: dark cooled skin with cracks that glow toward the beat; HELD = cool grey with a frost rim; MELTED = nothing (the magma shows) */
    for (const st of S.crust.values()) { const c = st.c, x0 = c.x0 * TS - cx, x1 = (c.x1 + 1) * TS - cx, y = c.y * TS - cy; if (x1 < 0 || x0 > VW || y < -16 || y > VH + 16) continue;
      if (st.melted) { g.globalAlpha = 0.35; g.fillStyle = COL.magmaL; g.fillRect(x0, y + 12, x1 - x0, 2); g.globalAlpha = 1; continue; }
      const hw = heldBy(st), held = !!hw && !(hw.holdT < HM.ward.warn && Math.sin(time * 22) > 0.3);   /* (the last HM.ward.warn s it flickers: told) */
      g.fillStyle = held ? COL.held : COL.crust; g.fillRect(x0, y, x1 - x0, 7); g.fillStyle = held ? COL.heldL : COL.crustL; g.fillRect(x0, y, x1 - x0, 1);
      if (!held) { g.fillStyle = k > 0.66 ? COL.hot : COL.crack; g.globalAlpha = 0.25 + 0.75 * k;
        for (let xx = c.x0 * TS + 5; xx < (c.x1 + 1) * TS - 3; xx += 11) { const sx = xx - cx; g.fillRect(sx, y + 2, 3, 1); g.fillRect(sx + 2, y + 3, 1, 3); g.fillRect(sx - 1, y + 5, 2, 1); }
        g.globalAlpha = 1; }
      else { g.globalAlpha = 0.5; g.fillStyle = COL.heldL; for (let xx = x0 + 3; xx < x1 - 2; xx += 7) g.fillRect(xx, y + 3, 2, 1); g.globalAlpha = 1; } }
    /* THE WARD-STONES: an obsidian standing stone, its rune lit while it holds (a thin line to each crust it holds), dark while spent */
    for (const wd of S.wards.values()) { const w = wd.w, x = wardX(w) - cx, y = wardY(w) - cy; if (x < -20 || x > VW + 20) continue;
      g.fillStyle = COL.ward; g.fillRect(Math.round(x) - 4, Math.round(y) - 22, 9, 22); g.fillStyle = COL.wardL; g.fillRect(Math.round(x) - 4, Math.round(y) - 22, 1, 22); g.fillRect(Math.round(x) - 3, Math.round(y) - 23, 7, 1);
      const holding = wd.holdT > 0, lit = holding ? (wd.holdT < HM.ward.warn ? 0.5 + 0.5 * Math.sin(time * 22) : 1) : wd.spentT > 0 ? 0 : 0.45 + 0.2 * Math.sin(time * 3);
      g.fillStyle = wd.spentT > 0 ? COL.runeOff : COL.rune; g.globalAlpha = Math.max(0.3, lit); g.fillRect(Math.round(x) - 1, Math.round(y) - 18, 3, 3); g.fillRect(Math.round(x), Math.round(y) - 14, 1, 6); g.fillRect(Math.round(x) - 2, Math.round(y) - 11, 5, 1); g.globalAlpha = 1;
      if (holding) { g.strokeStyle = COL.rune; g.globalAlpha = 0.35; g.lineWidth = 1;
        for (const id of w.holds) { const st = S.crust.get(id); if (!st) continue; const mx = (st.c.x0 + st.c.x1 + 1) * TS / 2 - cx, my = st.c.y * TS - cy; g.beginPath(); g.moveTo(Math.round(x) + 0.5, Math.round(y) - 16); g.lineTo(Math.round(mx) + 0.5, Math.round(my) + 0.5); g.stroke(); }
        g.globalAlpha = 1; } }
  };
  /* the caldera ledges' basalt columns (L.structures kind 'hmColumn'): drawn while the ledge stands (THE FIRE DRAKE's P3 sinks it) */
  H.drawStructure = (g, kind, l, r, t, b, x0) => {
    if (kind !== 'hmColumn') return false;
    const lv = L(), z = lv && (lv.structures || []).find(q => q.kind === kind && q.x0 === x0);
    if (z && lv.grid[z.top * lv.W + z.x0] === T.AIR) return true;   /* sunk with its ledge */
    g.fillStyle = COL.col; g.fillRect(l + 4, t + 6, r - l - 8, b - t - 6); g.fillStyle = COL.colL; g.fillRect(l + 4, t + 6, 1, b - t - 6); g.fillRect(r - 6, t + 6, 1, b - t - 6);
    return true;
  };
  /* THE MAGMA LEAPER (greybox): a dark-scaled eel-fish with an ember belly; under the magma only its shadow and the bubbles of its tell */
  H.drawFoe = (g, e, cx, cy, time) => {
    const x = Math.round(e.x - cx), y = Math.round(e.y - cy), f = e.face || 1;
    if (e.mode === 'under') { if (!e.home) return; const sy = Math.round(e.home.y - cy) + 4; g.globalAlpha = 0.35; g.fillStyle = COL.leap; g.fillRect(x - 7, sy, 14, 2); g.globalAlpha = 1; return; }
    if (e.mode === 'leapTell') { const sy = Math.round(e.home.y - cy); for (let i = 0; i < 4; i++) { const bx = x - 8 + ((i * 7 + Math.floor(time * 20)) % 16), by = sy - ((time * 30 + i * 5) % 8); g.fillStyle = i & 1 ? COL.magmaL : COL.hot; g.fillRect(bx, Math.round(by), 2, 2); }
      g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 18); g.fillStyle = COL.magmaL; g.fillRect(x - 9, sy - 1, 18, 2); g.globalAlpha = 1; return; }
    const arch = e.mode === 'leap' || e.mode === 'fall' || e.mode === 'flop' ? Math.max(-1, Math.min(1, (e.vy || 0) / 300)) : 0, wig = e.mode === 'thrash' ? Math.sin(time * 26) * 2 : 0;
    for (let i = 0; i < 6; i++) { const sx = x - f * (i * 3 - 6), sy = y - 6 + Math.round(arch * (i - 2.5) * 1.6 + (i % 2 ? wig : -wig));
      g.fillStyle = i === 0 ? COL.leapL : COL.leap; g.fillRect(sx - 2, sy - 2, 4, 5); g.fillStyle = COL.leapH; g.fillRect(sx - 1, sy + 2, 3, 1); }
    g.fillStyle = COL.eye; g.fillRect(x + f * 6, y - 8, 1, 1);
    if (e.mode === 'biteTell' || e.mode === 'bite') { g.fillStyle = COL.hot; g.fillRect(x + f * 8, y - 7 + (e.mode === 'bite' ? 0 : -1), 3, 1); g.fillRect(x + f * 8, y - 4, 3, 1); }
    if (e.hurtT > 0) { g.globalAlpha = 0.5; g.fillStyle = '#ffffff'; g.fillRect(x - 9, y - 9, 18, 8); g.globalAlpha = 1; }
  };
  return H;
}
