// src/hourglass-king-hands.js - THE HOURGLASS KING's HANDS (claude/buriedcity, the greybox). src/hourglass-king.js is the fight (pure: his glass, his three
// phases, his cycles, the opening, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once a blow; a shield turns only the
// yellow ones), THE THRONE ROOM's SAND-GATE LEVERS (the level's: src/buried-city-hands.js pulls them and tells him - onLever), phase two's BANKS (sand cells
// written at the walls, cleared on a new attempt), phase three's pours, and the drawing (desert_glass.js's baked king, his glass by its level).
// THE SHARED READ (design standard B10): OPEN = a gold ring round him and a timer bar ("STALLED"); WARDED = a pale shell ring and the word; HIS BRASS = a
// turned share CLANKS, sparks and says HIS BRASS (and the first times what to do about it) - never silent. HIS GLASS is drawn over him all fight (a gauge
// beside the bar: its sand, and GLASS LOW in gold when a lever will stall him).
// main.js calls: spawnBoss, owns, on, update, take, drawBack, drawBoss, drawOver, barName, end, read, show, clear, onLever.
import * as HKM from './hourglass-king.js';
import { BOSS_PHASE } from './boss-music.js';
import * as DG from './redraw/desert_glass.js';
const { HK } = HKM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), swing: s => (s.slash || s.tell)(), gear: s => (s.ratchet || s.clank || s.slash)(),
  pour: s => (s.hiss || s.puff || s.slash)(), rumble: s => (s.boom || s.crack || s.thud)(), chime: s => (s.bell || s.tell)(false), turn: s => (s.ratchet || s.clank)(), stall: s => (s.gateDrop || s.clank)() };

export function makeHourglassKingHands(ctx) {
  let S = null, SETS = null, COG = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'hourglassking' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'hourglassking';
  H.clear = () => { unbank(); S = null; BOSS_PHASE.hourglassking = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.hkKeys = pp.hkKeys || new Map(); if (pp.hkKeys.size > 80) pp.hkKeys.clear(); if (pp.hkKeys.has(key)) return true; pp.hkKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'hourglassking' ? e : null; };
  /* phase two's BANKS: sand cells at both walls (T.SOFT), written once, taken away again on a new attempt */
  let banked = [];
  function bank() { const G = S.G, T = ctx.T; for (const [a, b] of [[0, 5], [34, 39]]) for (let c = a; c <= b; c++) for (let k = 1; k <= 3; k++) { const x = G.sx + c, y = G.R - k; if (ctx.cellGet(x, y) === T.AIR) { ctx.cellSet(x, y, T.SOFT); banked.push([x, y]); } }
    for (const pp of ctx.players) if (!pp.dead && pp.y > G.bankTop && G.banks.some(([l, r]) => pp.x > l - 4 && pp.x < r + 4)) { pp.y = G.bankTop; if (pp.vy > 0) pp.vy = 0; } }
  function unbank() { if (!banked.length) return; const T = ctx.T; for (const [x, y] of banked) ctx.cellSet(x, y, T.AIR); banked = []; }

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; unbank();
    S = HKM.newFight(HKM.geom(Ar, ctx.TS)); BOSS_PHASE.hourglassking = 1;
    const e = { ...base, t: 'hourglassking', w: HK.w, h: HK.h, hp: ctx.EHP.hourglassking, maxHp: ctx.EHP.hourglassking, noGrav: true, markH: HK.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, boss: true };
    e.y = S.G.floorY; for (const pp of ctx.players) pp.hkKeys = null; return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, air: !pp.ground && !pp.climb, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(),
      music: ph => { BOSS_PHASE.hourglassking = ph; if (ctx.music) ctx.music(ph > 1 ? 'hourglassking:p' + ph : 'hourglassking'); },
      mark: m => ctx.number(e.x, e.y - HK.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      banks: on => { if (on) bank(); else unbank(); },
      fx: (k, x, y) => {
        if (k === 'open') ctx.ring(x, y - 20, 34, '#ffd36b');
        else if (k === 'ward') ctx.ring(x, y - 20, 36, '#c8d8e8');
        else if (k === 'mark') ctx.ring(x, y - 4, HK.streamR, '#ff6b6b');
        else if (k === 'swirl') ctx.ring(x, y - 4, HK.slipR, '#ff9a5c');
        else if (k === 'erupt' || k === 'pile') ctx.burst(x, y - 6, 14, ['#e2bb7a', '#bf8f63', '#f0d8a0'], 90, 0.6); },
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
    HKM.stepHourglassKing(e, S, dt, heroes(), world(e));
    e.phase = S.ph;
  };
  /* THE RULE ON HIM: a hero's pull on a throne-room lever (src/buried-city-hands.js) */
  H.onLever = x => { const e = live(); if (!S || !e || !ctx.bossActive) return 'busy'; return HKM.leverPulled(e, S, world(e), x); };
  /* A BLOW ON HIM (B15): open x HK.openMul (one opening HK.openCap of him at most); turning, whole; warded, the floor with a clank; else his BRASS takes the share */
  H.take = (e, dmg) => { if (!S) return dmg; const t = ctx.time();
    if (e.mode === 'sleep' || e.mode === 'wake') return 0;
    if (HKM.hkOpen(e)) { const cap = e.maxHp * HK.openCap, d = Math.max(dmg * HK.resist, Math.min(dmg * HK.openMul, Math.max(0, cap - S.openTaken))); S.openTaken += d;   /* (B15: past the cap a blow still pays the brass floor, never nothing) */
      if (S.openTaken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; ctx.number(e.x, e.y - 74, 'THE SAND STIRS IN HIM', '#9aa39a'); } return d; }
    if (e.mode === 'turn') { S.n.turnHits++; return dmg * HK.turnMul; }
    if (S.ward > 0) { e.chipHit = t; S.n.warded++; e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return dmg * HK.wardMul; }
    e.chipHit = t; S.n.brass++; e.guardFx = 0.25; e.guardWord = S.n.brass < 6 ? (HKM.glassLow(S) ? 'HIS BRASS: HIS GLASS IS LOW - A SAND-GATE' : 'HIS BRASS: WAIT FOR HIS GLASS TO RUN LOW') : 'HIS BRASS';
    ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(ctx.hero().x - e.x) || 1) * 10, e.y - 24, Math.sign(ctx.hero().x - e.x) || 1, 4); return dmg * HK.resist; };
  H.barName = e => 'THE HOURGLASS KING' + (HKM.hkOpen(e) ? '  STALLED' : S && S.ward > 0 ? '  WARDED' : e.mode === 'turn' ? '  TURNING' : '');
  H.end = e => { if (S) { S.gears = []; S.waves = []; S.stream = null; } BOSS_PHASE.hourglassking = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, glass: +S.glass.toFixed(2), glassMax: S.glassMax, low: HKM.glassLow(S), ward: S.ward, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (GREYBOX: the desert_glass.js king, his glass by its level) ---------- */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    /* THE THRONE: a high-backed seat of sandstone at the back of the room */
    const tx = R(G.x0 + 20 * ctx.TS + 8 - cx), ty = R(G.floorY - cy); g.globalAlpha = 0.5; g.fillStyle = '#6a4a2a'; g.fillRect(tx - 18, ty - 70, 36, 70); g.fillStyle = '#9a7040'; g.fillRect(tx - 22, ty - 30, 44, 6); g.globalAlpha = 1;
    /* phase three's pours: two steady columns from the broken roof */
    if (S.ph === 3) for (const x of G.pours) { const sx = R(x - HK.pourW / 2 - cx); g.globalAlpha = 0.75; g.fillStyle = '#e2bb7a'; g.fillRect(sx, R(G.roofY - cy), HK.pourW, R(G.floorY - G.roofY)); g.globalAlpha = 1;
      g.fillStyle = '#fff0c8'; for (let i = 0; i < 4; i++) g.fillRect(sx + 3 + i * 5, R(G.roofY + ((time * 160 + i * 37) % (G.floorY - G.roofY)) - cy), 1, 6); }
  };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    if (!SETS) SETS = [0, 1, 2].map(k => DG.bakeHourglassKing(k));
    const k = S.glass / S.glassMax, lvl = HKM.hkOpen(e) ? 2 : k > 0.6 ? 0 : k > HK.lowAt ? 1 : 2, set = SETS[lvl], f = e.face || 1, m = e.mode, flash = (e.hurtT || 0) > 0;
    const FR = { sleep: 0, wake: 0, recover: 0, streamTell: 3, gearTell: 5, slipTell: 7, slipRise: 8, pendTell: 9, pend: 10, hourTell: 3, stall: 11, turn: 12 };
    let fr = FR[m] ?? (m === 'walk' ? 1 + (Math.floor(time * 5) & 1) : 0); if (flash && m !== 'stall' && m !== 'turn') fr = 13;
    const arr = flash ? (f > 0 ? set.white.R : set.white.L) : (f > 0 ? set.R : set.L), spr = arr[fr];
    const x = R(e.x - cx), y = R(e.y - cy), sink = m === 'slipTell' ? R(Math.min(1, (HK.slipTell - e.modeT) / HK.slipTell) * 40) : 0;
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(x - 14, y - 1, 28, 2); g.globalAlpha = 1;
    if (sink) { g.save(); g.beginPath(); g.rect(x - 40, y - 80, 80, 80); g.clip(); }
    g.drawImage(spr, x - (f > 0 ? set.ax : spr.width - set.ax), y - set.ay + sink);
    if (sink) g.restore();
    if (e.guardFx > 0) { g.fillStyle = '#fff6c8'; g.fillRect(x + f * 12 - 2, y - 40, 5, 16); }
  };
  /* the cogs, the waves, the marks, and THE READ (open ring + timer, ward shell, his brass's word, HIS GLASS) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'hourglassking') return; const G = S.G;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    if (!COG) COG = DG.bakeCog();
    for (const q of S.gears) g.drawImage(COG[Math.floor(time * 12) & 1], R(q.x - 7 - cx), R(G.floorY - 14 - cy));
    for (const w of S.waves) { g.fillStyle = '#e2bb7a'; g.fillRect(R(w.x - 10 - cx), R(G.floorY - HK.hourH - cy), 20, HK.hourH); g.fillStyle = '#fff0c8'; g.fillRect(R(w.x - 10 - cx), R(G.floorY - HK.hourH - cy), 20, 2); }
    if (S.stream) { const x = R(S.stream.x - HK.streamR - cx); g.globalAlpha = 0.85; g.fillStyle = '#e2bb7a'; g.fillRect(x, R(G.roofY - cy), HK.streamR * 2, R(G.floorY - G.roofY)); g.globalAlpha = 1; }
    if (S.mark && (e.mode === 'streamTell' || e.mode === 'slipTell')) { const x = R(S.mark.x - cx), y = R(G.floorY - 2 - cy), r = S.mark.k === 'slip' ? HK.slipR : HK.streamR;
      g.fillStyle = 'rgba(30,10,10,0.55)'; g.fillRect(x - r, y, r * 2, 3); g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 2); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 2); g.stroke();
      if (S.mark.k === 'stream') { g.fillStyle = 'rgba(226,187,122,0.6)'; g.fillRect(x - 1, R(G.roofY - cy), 2, R(G.floorY - G.roofY)); }
      else { g.strokeStyle = 'rgba(255,154,92,0.7)'; g.beginPath(); g.arc(x, y - 2, 6 + 6 * Math.abs(Math.sin(time * 8)), 0, 7); g.stroke(); } }
    /* THE READ (B10) */
    const x = R(e.x - cx), y = R(e.y - HK.h / 2 - cy);
    if (HKM.hkOpen(e)) { const kk = Math.max(0, e.open / HK.openT);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 28, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = R(e.y - HK.h - 30 - cy); ctx.text('STALLED', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, R(e.y - HK.h - 26 - cy), '#c8d8e8', 'center', 5); }
    if (e.mode === 'turn') ctx.text('TURNING', x, R(e.y - HK.h - 26 - cy), '#e8d0a0', 'center', 5);
    /* HIS GLASS: a gauge over him - the sand left; gold and GLASS LOW when a lever will stall him */
    if (!HKM.hkOpen(e) && e.mode !== 'sleep') { const k = S.glass / S.glassMax, low = HKM.glassLow(S), gx = x + 22, gy = R(e.y - HK.h - 6 - cy);
      g.fillStyle = '#1b1626'; g.fillRect(gx, gy - 18, 6, 20); g.fillStyle = low ? (Math.floor(time * 6) % 2 ? '#ffd36b' : '#e2bb7a') : '#e2bb7a'; g.fillRect(gx + 1, R(gy + 1 - 18 * k), 4, R(18 * k));
      if (low && S.ward <= 0 && e.mode !== 'turn') ctx.text('GLASS LOW', gx + 3, gy - 24, '#ffd36b', 'center', 4); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, R(e.y - HK.h - 40 - cy) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
