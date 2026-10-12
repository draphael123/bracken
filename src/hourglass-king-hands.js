// src/hourglass-king-hands.js - THE HOURGLASS KING's HANDS (claude/buriedcity, the greybox; claude/buriedcity3 rework 2026-10-12). src/hourglass-king.js is the
// fight (pure: his glass, his three phases, his cycles, the openings, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once a
// blow; a shield turns only the yellow ones), THE THRONE ROOM's SAND-GATE LEVERS (the level's: src/buried-city-hands.js pulls them and tells him - onLever),
// phase two's BANKS and THE DRIFT (the floor's row taken out and a quicksand patch laid on it - src/quicksand.js holds you: jump, and keep jumping) and its two
// SANDSTONE BLOCKS (rising and sinking by turns), the BURIAL GRASP's hold, THE GREAT HOURGLASS (phase three: a blow or E turns it - greatStruck), phase three's
// pours, and the drawing (src/redraw/buried_city_cast.js's king: the new moves' GREYBOX poses 14-19 - the art lane finishes them).
// THE SHARED READ (design standard B10): OPEN = a gold ring round him and a timer bar ("STALLED"); WARDED = a pale shell ring and the word; HIS BRASS = a
// turned share CLANKS, sparks and says HIS BRASS (and the first times what to do about it) - never silent. HIS GLASS is drawn over him all fight.
// main.js calls: spawnBoss, owns, on, update, take, interact, drawBack, drawBoss, drawOver, barName, end, read, show, clear, onLever, leversLit.
import * as HKM from './hourglass-king.js';
import { BOSS_PHASE } from './boss-music.js';
import * as SET from './redraw/buried_city_set.js';
import * as DG from './redraw/buried_city_cast.js';   /* (claude/bc2art: the king and his cog are the city's own drawings now) */
const { HK } = HKM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), swing: s => (s.slash || s.tell)(), gear: s => (s.ratchet || s.clank || s.slash)(),
  pour: s => (s.hiss || s.puff || s.slash)(), rumble: s => (s.boom || s.crack || s.thud)(), chime: s => (s.bell || s.tell)(false), turn: s => (s.ratchet || s.clank)(), stall: s => (s.gateDrop || s.clank)(),
  crack: s => (s.crack || s.glass || s.clank)() };

export function makeHourglassKingHands(ctx) {
  let S = null, SETS = null, COG = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'hourglassking' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'hourglassking';
  H.clear = () => { unbank(); undrift(); unblocks(); S = null; BOSS_PHASE.hourglassking = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.hkKeys = pp.hkKeys || new Map(); if (pp.hkKeys.size > 80) pp.hkKeys.clear(); if (pp.hkKeys.has(key)) return true; pp.hkKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'hourglassking' ? e : null; };
  /* phase two's BANKS: sand cells at both walls (T.SOFT), written once, taken away again on a new attempt */
  let banked = [];
  function bank() { const G = S.G, T = ctx.T; for (const [a, b] of HKM.HK_STAGE.banks) for (let c = a; c <= b; c++) for (let k = 1; k <= 3; k++) { const x = G.sx + c, y = G.R - k; if (ctx.cellGet(x, y) === T.AIR) { ctx.cellSet(x, y, T.SOFT); banked.push([x, y]); } }
    for (const pp of ctx.players) if (!pp.dead && pp.y > G.bankTop && G.banks.some(([l, r]) => pp.x > l - 4 && pp.x < r + 4)) { pp.y = G.bankTop; if (pp.vy > 0) pp.vy = 0; } }
  function unbank() { if (!banked.length) return; const T = ctx.T; for (const [x, y] of banked) ctx.cellSet(x, y, T.AIR); banked = []; }
  /* THE DRIFT (phase two on): the floor's top row in the drift's span is sand you sink in - the row taken out (AIR) and a quicksand patch on it (src/quicksand.js);
     put back (the floor whole, a body in it set on it) while a stall drains it or THE GREAT HOURGLASS pours up */
  let drifted = null;
  function drift(on) { const G = S.G, T = ctx.T, L = ctx.L; if (!!drifted === on) return;
    const c0 = G.sx + HKM.HK_STAGE.drift[0], c1 = G.sx + HKM.HK_STAGE.drift[1];
    if (on) { for (let x = c0; x <= c1; x++) ctx.cellSet(x, G.R, T.AIR); drifted = { x0: c0 * ctx.TS, x1: (c1 + 1) * ctx.TS, y: G.floorY, hk: true }; (L.quicksand = L.quicksand || []).push(drifted); }
    else { for (let x = c0; x <= c1; x++) ctx.cellSet(x, G.R, T.SOLID); if (L.quicksand) L.quicksand = L.quicksand.filter(q => !q.hk); drifted = null;
      for (const pp of ctx.players) if (!pp.dead && pp.x > c0 * ctx.TS && pp.x < (c1 + 1) * ctx.TS && pp.y > G.floorY) { pp.y = G.floorY; pp.qsDepth = 0; if (pp.vy > 0) pp.vy = 0; } } }
  function undrift() { if (!drifted || !S) { const L = ctx.L; if (L && L.quicksand) L.quicksand = L.quicksand.filter(q => !q.hk); drifted = null; return; } drift(false); }
  /* THE TWO SANDSTONE BLOCKS (phase two on): the one that is up is solid; the other is under the drift */
  let blocksOn = false, blockFx = 0;
  function writeBlocks(up) { const G = S.G, T = ctx.T; G.blocks.forEach((b, i) => { for (let r = 1; r <= b.rows; r++) for (let x = b.c0; x <= b.c1; x++) ctx.cellSet(x, G.R - r, i === up ? T.SOLID : T.AIR); });
    const b = G.blocks[up]; for (const pp of ctx.players) if (!pp.dead && pp.x > b.x0 - 4 && pp.x < b.x1 + 4 && pp.y > b.y && pp.y - (pp.h || 14) < G.floorY) { pp.y = b.y; if (pp.vy > 0) pp.vy = 0; } blocksOn = true; }
  function unblocks() { if (!blocksOn || !S) return; const G = S.G, T = ctx.T; for (const b of G.blocks) for (let r = 1; r <= b.rows; r++) for (let x = b.c0; x <= b.c1; x++) ctx.cellSet(x, G.R - r, T.AIR); blocksOn = false; }

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; if (S) { unbank(); undrift(); unblocks(); } else undrift();
    S = HKM.newFight(HKM.geom(Ar, ctx.TS)); BOSS_PHASE.hourglassking = 1;
    const e = { ...base, t: 'hourglassking', w: HK.w, h: HK.h, hp: ctx.EHP.hourglassking, maxHp: ctx.EHP.hourglassking, noGrav: true, markH: HK.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, boss: true };
    e.y = S.G.floorY; for (const pp of ctx.players) { pp.hkKeys = null; pp.hkHold = 0; } return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground || (pp.qsDepth || 0) > 0, air: !pp.ground && !pp.climb && !((pp.qsDepth || 0) > 0), alive: ctx.upright(pp) && !pp.dead, dodge: (pp.dodge || 0) > 0, pp }));
  const FXC = { grasp: '#d0703a', rainMark: '#bfe6f5', echo: '#b08cff', great: '#ffd36b' };
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(),
      music: ph => { BOSS_PHASE.hourglassking = ph; if (ctx.music) ctx.music(ph > 1 ? 'hourglassking:p' + ph : 'hourglassking'); },
      mark: m => ctx.number(e.x, e.y - HK.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      banks: on => { if (on) bank(); else unbank(); },
      blocks: (up, kind) => { if (kind === 'swap') { writeBlocks(up); ctx.shake(3); } else blockFx = HK.swapWarn; },
      hold: (pp, s) => { if (!pp || pp.dead) return; pp.hkHold = s; pp.hkHoldX = pp.x; if (pp === ctx.hero() && !(S.told.hold > 1)) { S.told.hold = (S.told.hold || 0) + 1; ctx.number(pp.x, pp.y - 34, 'THE SAND HOLDS YOU: JUMP OUT', '#ff9a5c'); } },
      fx: (k, x, y) => {
        if (k === 'open') ctx.ring(x, y - 20, 34, '#ffd36b');
        else if (k === 'ward') ctx.ring(x, y - 20, 36, '#c8d8e8');
        else if (k === 'mark') ctx.ring(x, y - 4, HK.streamR, '#ff6b6b');
        else if (FXC[k]) ctx.ring(x, y - 4, k === 'great' ? 40 : k === 'echo' ? HK.slipR : k === 'grasp' ? HK.graspR : HK.rainR, FXC[k]);
        else if (k === 'erupt' || k === 'pile' || k === 'shatter') ctx.burst(x, y - 6, 14, k === 'shatter' ? ['#dff2ff', '#bfe6f5', '#ffffff'] : ['#e2bb7a', '#bf8f63', '#f0d8a0'], 90, 0.6); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock })); if (P.hp < hp0) any = true; }); return any; },
    };
  }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 84, 'THE HOURGLASS KING, WHOSE HOUR NEVER ENDS', '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 120, 'HIS CHEST IS AN HOURGLASS: AS IT RUNS LOW, PULL A SAND-GATE', '#ffd36b'); }
    /* THE BURIAL GRASP's hold: dragged down, no walking - a jump (or a roll) tears you out */
    for (const pp of ctx.players) if (pp.hkHold > 0) { pp.hkHold = Math.max(0, pp.hkHold - dt); if (pp.dead || pp.vy < -60 || (pp.dodge || 0) > 0) { pp.hkHold = 0; continue; } pp.x = pp.hkHoldX; pp.vx = 0; }
    /* a blow on THE GREAT HOURGLASS (phase three) */
    { const hb = ctx.atkBox ? ctx.atkBox() : null; if (hb && S.ph === 3) { const g = greatBox(); if (!(hb.r < g.l || hb.l > g.r || hb.b < g.t || hb.t > g.b) && (!ctx.hitOnce || ctx.hitOnce(S.great))) HKM.greatStruck(e, S, world(e)); } }
    HKM.stepHourglassKing(e, S, dt, heroes(), world(e));
    if (S.ph >= 2 && !blocksOn) writeBlocks(S.blockUp);
    drift(S.drift); blockFx = Math.max(0, blockFx - dt);
    e.phase = S.ph;
  };
  const greatBox = () => ({ l: S.G.great - 14, r: S.G.great + 14, t: S.G.floorY - 46, b: S.G.floorY + 2 });
  /* E at THE GREAT HOURGLASS (main.js asks after the levers) */
  H.interact = P => { const e = live(); if (!S || !e || !ctx.bossActive || P.dead) return false; if (Math.abs(P.x - S.G.great) > 20 || Math.abs(P.y - S.G.floorY) > 24) return false; HKM.greatStruck(e, S, world(e)); return true; };
  /* THE RULE ON HIM: a hero's pull on a throne-room lever (src/buried-city-hands.js) */
  /* M5 (fix pass 10-09, B10/A3): THE LEVERS ARE LIT while his glass is low and a pull will stall him (phases one and two); src/buried-city-hands.js glows them */
  H.leversLit = () => { const e = live(); return !!(S && e && ctx.bossActive && A() && S.ph < 3 && HKM.glassLow(S) && S.ward <= 0 && !/^(stall|turn|sleep|wake|die)$/.test(e.mode)); };
  H.onLever = x => { const e = live(); if (!S || !e || !ctx.bossActive) return 'busy'; return HKM.leverPulled(e, S, world(e), x); };
  /* A BLOW ON HIM (B15): open x HK.openMul (one opening its cap of him at most); turning, whole; warded, the floor with a clank; else his BRASS takes the share */
  H.take = (e, dmg) => { if (!S) return dmg; const t = ctx.time();
    if (e.mode === 'sleep' || e.mode === 'wake') return 0;
    if (HKM.hkOpen(e)) { const cap = e.maxHp * (S.capNow || HK.openCap), d = Math.max(dmg * HK.resist, Math.min(dmg * HK.openMul, Math.max(0, cap - S.openTaken))); S.openTaken += d;   /* (B15: past the cap a blow still pays the brass floor, never nothing) */
      if (S.openTaken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; ctx.number(e.x, e.y - 74, 'THE SAND STIRS IN HIM', '#9aa39a'); } return d; }
    if (e.mode === 'turn') { S.n.turnHits++; return dmg * HK.turnMul; }
    if (S.ward > 0) { e.chipHit = t; S.n.warded++; e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return dmg * HK.wardMul; }
    e.chipHit = t; S.n.brass++; e.guardFx = 0.25; e.guardWord = S.n.brass < 6 ? (S.ph === 3 ? 'HIS BRASS: TURN THE GREAT HOURGLASS' : HKM.glassLow(S) ? 'HIS BRASS: HIS GLASS IS LOW - A SAND-GATE' : 'HIS BRASS: WAIT FOR HIS GLASS TO RUN LOW') : 'HIS BRASS';
    ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(ctx.hero().x - e.x) || 1) * 10, e.y - 24, Math.sign(ctx.hero().x - e.x) || 1, 4); return dmg * HK.resist; };
  H.barName = e => 'THE HOURGLASS KING' + (HKM.hkOpen(e) ? '  STALLED' : S && S.ward > 0 ? '  WARDED' : e.mode === 'turn' ? '  TURNING' : '');
  H.end = e => { if (S) { S.gears = []; S.waves = []; S.stream = null; S.rain = null; S.grasp = null; S.echo = null; } undrift(); BOSS_PHASE.hourglassking = 1; for (const pp of ctx.players) pp.hkHold = 0; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, glass: +S.glass.toFixed(2), glassMax: S.glassMax, low: HKM.glassLow(S), ward: S.ward, drift: S.drift, blockUp: S.blockUp, great: { ...S.great }, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING ---------- */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    /* THE THRONE: a high-backed seat of lapis stone on a stepped dais, gilded, a crown of gears over its back (src/redraw/buried_city_set.js) */
    SET.drawThrone({ g, cx, cy, vw: ctx.VW(), vh: ctx.VH(), time }, G.x0 + 20 * ctx.TS + 8, G.floorY);
    /* THE GREAT HOURGLASS before it (PLACEHOLDER: the art lane draws it - a brass frame on a pivot, two bulbs, its gauge): fast in its frame till phase three; then lit
       when it can be turned, its sand running back down after (the gauge), and while it pours up a column of sand rises out of it to the roof */
    { const x = R(G.great - cx), y = R(G.floorY - cy), k = S.great.cd > 0 ? 1 - S.great.cd / (HK.great.cd + HK.great.openT) : 1, ready = HKM.greatReady(S), run = S.great.run > 0, flip = run ? -1 : 1;
      if (ready) SET.glow({ g, cx, cy, vw: ctx.VW(), vh: ctx.VH(), time }, G.great, G.floorY - 22, 30, 0.35 + 0.15 * Math.sin(time * 6), '255,210,120');
      g.fillStyle = '#5a4014'; g.fillRect(x - 13, y - 4, 26, 4); g.fillRect(x - 13, y - 46, 26, 4); g.fillStyle = '#a47e30'; g.fillRect(x - 12, y - 45, 2, 41); g.fillRect(x + 10, y - 45, 2, 41); g.fillStyle = '#e8c460'; g.fillRect(x - 12, y - 45, 1, 41);
      g.fillStyle = 'rgba(190,226,240,0.30)'; for (let i = 0; i < 38; i++) { const u = i / 38, v = u < 0.5 ? u / 0.5 : (1 - u) / 0.5, hw = Math.max(1, R(9 * Math.sin(Math.PI * Math.pow(v, 0.8)) + 1)); g.fillRect(x - hw, y - 42 + i, hw * 2, 1); }
      const top = S.ph < 3 ? 0.1 : run ? 0 : 1 - k, bot = 1 - top; g.fillStyle = '#e6bc68';
      if (flip > 0) { if (top > 0.02) g.fillRect(x - 6, y - 40 + R(14 * (1 - top)), 12, R(14 * top)); if (bot > 0.02) g.fillRect(x - 7, y - 6 - R(14 * bot), 14, R(14 * bot)); }
      if (run) { g.fillStyle = 'rgba(248,220,144,0.55)'; g.fillRect(x - 5, R(G.roofY - cy), 10, R(G.floorY - G.roofY - 40)); g.fillStyle = '#fff4cc'; for (let i = 0; i < 8; i++) g.fillRect(x - 4 + (i * 3) % 9, R(G.floorY - 44 - ((time * 160 + i * 31) % (G.floorY - G.roofY - 44)) - cy), 1, 5); }
      if (S.ph === 3) { g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(x - 14, y - 56, 28, 4); g.fillStyle = ready ? '#ffd36b' : '#a8782c'; g.fillRect(x - 13, y - 55, R(26 * k), 2); if (ready) ctx.text('STRIKE IT', x, y - 64, '#ffd36b', 'center', 5); } }
    /* THE SAND TIDE coming (phase two on): the floor's sand stirs and glows a beat before it takes the floor */
    if (S.ph >= 2 && !S.tide.on && S.tide.t <= HK.tide.warn) { const l = R(G.drift[0] - cx), w = G.drift[1] - G.drift[0], k = 1 - S.tide.t / HK.tide.warn; g.fillStyle = 'rgba(255,154,92,' + (0.15 + 0.25 * k * (0.6 + 0.4 * Math.sin(time * 18))).toFixed(2) + ')'; g.fillRect(l, R(G.floorY - 4 - cy), w, 6); g.fillStyle = '#e6c98a'; for (let x = 0; x < w; x += 6) g.fillRect(l + x, R(G.floorY - 2 - 3 * k * Math.abs(Math.sin(x + time * 9)) - cy), 2, 2); }
    /* phase three's pours: two steady columns from the broken roof */
    if (S.ph === 3) for (const x of G.pours) { const sx = R(x - HK.pourW / 2 - cx); g.globalAlpha = 0.75; g.fillStyle = '#e2bb7a'; g.fillRect(sx, R(G.roofY - cy), HK.pourW, R(G.floorY - G.roofY)); g.globalAlpha = 1;
      g.fillStyle = '#fff0c8'; for (let i = 0; i < 4; i++) g.fillRect(sx + 3 + i * 5, R(G.roofY + ((time * 160 + i * 37) % (G.floorY - G.roofY)) - cy), 1, 6); }
    /* the sandstone blocks: the next to rise shows its top in the drift; both shake before they swap */
    if (S.ph >= 2) G.blocks.forEach((b, i) => { const l = R(b.x0 - cx), w = b.x1 - b.x0, up = i === S.blockUp, sh = blockFx > 0 ? R(Math.sin(time * 40)) : 0;
      if (!up) { g.fillStyle = '#c4a672'; for (let xx = 0; xx < w; xx += 8) g.fillRect(l + xx + 1 + sh, R(G.floorY - 3 - cy), 5, 2); }
      else if (blockFx > 0) { g.fillStyle = 'rgba(255,120,60,0.3)'; g.fillRect(l + sh, R(b.y - cy), w, R(G.floorY - b.y)); } });
  };
  /* his frame by mode: the kit's poses (0-13) and the new moves' own (14-19: src/redraw/buried_city_cast.js) */
  const FR = { sleep: 0, wake: 0, recover: 0, streamTell: 3, gearTell: 5, pendTell: 9, pend: 10, hourTell: 3, stall: 11, turn: 12, surgeTell: 14, graspTell: 16, rainTell: 17, slipTell: 18, slipStrike: 19, slipRec: 8 };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    if (!SETS) SETS = [0, 1, 2].map(k => DG.bakeHourglassKing(k));
    const k = S.glass / S.glassMax, lvl = HKM.hkOpen(e) ? 2 : k > 0.6 + (HKM.lowOf(S.ph) - HK.lowAt) ? 0 : k > HKM.lowOf(S.ph) ? 1 : 2, set = SETS[lvl], f = e.face || 1, m = e.mode, flash = (e.hurtT || 0) > 0;
    let fr = FR[m] ?? (m === 'walk' ? 1 + (Math.floor(time * 5) & 1) : 0); if (m === 'recover' && S.lastMove === 'surge') fr = 15; if (flash && m !== 'stall' && m !== 'turn') fr = 13;
    const arr = flash ? (f > 0 ? set.white.R : set.white.L) : (f > 0 ? set.R : set.L), spr = arr[fr] || arr[0];
    const x = R(e.x - cx), y = R(e.y - cy);
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(x - 14, y - 1, 28, 2); g.globalAlpha = 1;
    if (m === 'slipTell') { SET.glow({ g, cx, cy, vw: ctx.VW(), vh: ctx.VH(), time }, e.x, e.y - 24, 34, 0.35 + 0.2 * Math.sin(time * 14), '176,140,255'); }
    if (m === 'stall' && S.great.run > 0) { const lift = R(Math.min(1, (HK.great.openT - S.great.run) / 0.6) * 6); g.drawImage(spr, x - (f > 0 ? set.ax : spr.width - set.ax), y - set.ay - lift); }   /* (held in the flow, lifted a little) */
    else g.drawImage(spr, x - (f > 0 ? set.ax : spr.width - set.ax), y - set.ay);
    if (e.guardFx > 0) { g.fillStyle = '#fff6c8'; g.fillRect(x + f * 12 - 2, y - 40, 5, 16); }
  };
  /* the cogs, the waves, the marks, the echo, the hands, the shards - and THE READ (open ring + timer, ward shell, his brass's word, HIS GLASS) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'hourglassking') return; const G = S.G;
    if (e.mode && /Tell$/.test(e.mode)) S.lastMove = e.mode.replace(/Tell$/, '');
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', fy = R(G.floorY - cy);
    if (!COG) COG = DG.bakeCog();
    for (const q of S.gears) g.drawImage(COG[Math.floor(time * 12) & 1], R(q.x - 7 - cx), R(G.floorY - 14 - cy));
    for (const w of S.waves) { const hh = w.h || HK.hourH, hw = w.w || 10; g.fillStyle = w.k === 'surge' ? '#d8a050' : '#e2bb7a'; g.fillRect(R(w.x - hw - cx), R(G.floorY - hh - cy), hw * 2, hh); g.fillStyle = '#fff0c8'; g.fillRect(R(w.x - hw - cx), R(G.floorY - hh - cy), hw * 2, 2);
      if (w.k === 'surge') { g.fillStyle = 'rgba(255,240,200,0.6)'; for (let i = 0; i < 4; i++) g.fillRect(R(w.x - hw - cx - w.dir * (6 + i * 5)), R(G.floorY - hh * (0.8 - i * 0.18) - cy), 3, 2); } }   /* (the surge's spray behind it) */
    if (S.stream) { const x = R(S.stream.x - HK.streamR - cx); g.globalAlpha = 0.85; g.fillStyle = '#e2bb7a'; g.fillRect(x, R(G.roofY - cy), HK.streamR * 2, R(G.floorY - G.roofY)); g.globalAlpha = 1; }
    if (S.mark && (e.mode === 'streamTell' || e.mode === 'graspTell')) { const x = R(S.mark.x - cx), y = fy - 2, r = S.mark.k === 'grasp' ? HK.graspR : HK.streamR;
      g.fillStyle = 'rgba(30,10,10,0.55)'; g.fillRect(x - r, y, r * 2, 3); g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 2); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 2); g.stroke();
      if (S.mark.k === 'stream') { g.fillStyle = 'rgba(226,187,122,0.6)'; g.fillRect(x - 1, R(G.roofY - cy), 2, R(G.floorY - G.roofY)); }
      else { g.strokeStyle = 'rgba(208,112,58,0.85)'; g.beginPath(); g.arc(x, y - 2, r * (0.5 + 0.5 * Math.abs(Math.sin(time * 6))), 0, 7); g.stroke(); for (let i = 0; i < 5; i++) { const hx = x - r + 4 + i * (r * 2 - 8) / 4; g.fillStyle = '#d0703a'; g.fillRect(R(hx), y - 2 - R(3 * Math.abs(Math.sin(time * 9 + i))), 2, 3); } } }
    /* THE GRASP RISING: sand hands up out of the floor */
    if (S.grasp) { const x = R(S.grasp.x - cx), up = 1 - S.grasp.t / HK.graspUp; for (let i = 0; i < 5; i++) { const hx = x - HK.graspR + 4 + i * (HK.graspR * 2 - 8) / 4, hh = R(8 + 18 * up * (0.7 + 0.3 * Math.sin(i * 2.1))); g.fillStyle = '#b07a3a'; g.fillRect(R(hx), fy - hh, 3, hh); g.fillStyle = '#e2bb7a'; g.fillRect(R(hx) - 1, fy - hh, 5, 2); } }
    /* THE RAIN: its marks blink pale blue on the floor (and a faint line to the roof); falling, the shards */
    if (S.rain) for (const x0 of S.rain.xs) { const x = R(x0 - cx); if (!S.rain.fall) { g.strokeStyle = Math.floor(time * 10) % 2 ? '#bfe6f5' : '#ffffff'; g.beginPath(); g.arc(x, fy - 2, HK.rainR, 0, 7); g.stroke(); g.fillStyle = 'rgba(191,230,245,0.25)'; g.fillRect(x - 1, R(G.roofY - cy), 2, R(G.floorY - G.roofY)); }
      else { for (let i = 0; i < 5; i++) { const sy = R(G.roofY - cy + ((S.rain.t / HK.rainT) * (G.floorY - G.roofY) + i * 23) % (G.floorY - G.roofY)); g.fillStyle = i % 2 ? '#dff2ff' : '#9ac8e0'; g.fillRect(x - HK.rainR + 3 + i * 4, sy, 2, 6); } } }
    /* THE ECHO: where he stood two seconds ago, a violet ghost of him - he snaps back to it */
    if (S.echo && e.mode === 'slipTell') { if (!SETS) SETS = [0, 1, 2].map(k => DG.bakeHourglassKing(k)); const set = SETS[0], spr = (e.face > 0 ? set.R : set.L)[18], x = R(S.echo.x - cx);
      g.globalAlpha = 0.35 + 0.2 * Math.sin(time * 16); g.drawImage(spr, x - (e.face > 0 ? set.ax : spr.width - set.ax), fy - set.ay); g.globalAlpha = 1; g.strokeStyle = '#b08cff'; g.beginPath(); g.arc(x, fy - 2, HK.slipR, Math.PI, 0); g.stroke(); }
    /* THE READ (B10) */
    const x = R(e.x - cx), y = R(e.y - HK.h / 2 - cy);
    if (HKM.hkOpen(e)) { const kk = Math.max(0, e.open / HK.openT);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 28, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = R(e.y - HK.h - 30 - cy); ctx.text('STALLED', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * Math.min(1, kk)), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, R(e.y - HK.h - 26 - cy), '#c8d8e8', 'center', 5); }
    if (e.mode === 'turn') ctx.text('TURNING', x, R(e.y - HK.h - 26 - cy), '#e8d0a0', 'center', 5);
    /* HIS GLASS: a gauge over him - the sand left; gold and GLASS LOW when a lever will stall him */
    if (!HKM.hkOpen(e) && e.mode !== 'sleep') { const k = S.glass / S.glassMax, low = HKM.glassLow(S) && S.ph < 3, gx = x + 22, gy = R(e.y - HK.h - 6 - cy);
      g.fillStyle = '#1b1626'; g.fillRect(gx, gy - 18, 6, 20); g.fillStyle = low ? (Math.floor(time * 6) % 2 ? '#ffd36b' : '#e2bb7a') : '#e2bb7a'; g.fillRect(gx + 1, R(gy + 1 - 18 * k), 4, R(18 * k));
      if (low && S.ward <= 0 && e.mode !== 'turn') ctx.text('GLASS LOW', gx + 3, gy - 24, '#ffd36b', 'center', 4); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, R(e.y - HK.h - 40 - cy) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
    /* a held hero: the sand round his legs */
    for (const pp of ctx.players) if (pp.hkHold > 0) { const px = R(pp.x - cx), py = R(pp.y - cy); g.fillStyle = '#b07a3a'; for (let i = 0; i < 4; i++) g.fillRect(px - 7 + i * 4, py - 8 - (i % 2) * 2, 3, 8 + (i % 2) * 2); ctx.text('JUMP!', px, py - 34, blink, 'center', 5); }
  };
  return H;
}
