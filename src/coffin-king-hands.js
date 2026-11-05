// src/coffin-king-hands.js - THE COFFIN KING's HANDS for SEALED PYRAMID 3 (claude/sealedpyramid3, 11-05). src/coffin-king.js is the fight (pure); this binds it to the
// world in the shape of src/tomb-king-hands.js (main.js calls the same names through that file's makeTombKingHands, which hands the fight here whenever the burial
// chamber carries arena.ck - i.e. SP3 is on). The chamber's seal traps are the level's own engine (src/sealed-pyramid-hands.js): it fires them from their plates,
// they strike whatever stands in their line, and on him they call trapHit -> src/coffin-king.js trapLands. The flood's water is read every frame (THE FLIP).
// THE DRAWING IS GREYBOX (art owed - the brief's centrepiece): every stage its own body (P1 the bound coffin, P2 the lid hanging and his arms out, P3 the free king
// with the coffin as his weapon) and every move its own windup and release pose (B16). THE READ (B10): open = a gold ring + timer bar + the word; warded = a pale
// ring; his SEALS shown over him (bound gold, broken grey) with the trap that breaks each - so how to hurt him is on screen from the first second.
import * as CKM from './coffin-king.js';
import { BOSS_PHASE } from './boss-music.js';
import { duckBox } from './duck.js';
const { CK } = CKM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slam: s => (s.boom || s.thud)(), roar: s => (s.roar || s.boom)(), open: s => (s.crack || s.clank)(),
  clamp: s => (s.clank || s.thud)(), thud: s => (s.thud || s.stone || s.clank)(), roll: s => (s.boom || s.thud)(), grab: s => (s.slash || s.tell)(), chain: s => (s.clank || s.slash)(),
  lash: s => (s.slash || s.tell)(), throw: s => (s.throwWhoosh || s.slash)(), cut: s => (s.clank || s.slash)(), rumble: s => (s.boom || s.crack || s.thud)(), seal: s => (s.crack || s.clank)() };
const C = { stone: '#9c8660', stoneL: '#cdb88a', stoneD: '#5e4c34', ink: '#1c140c', gold: '#d8aa40', goldL: '#f6dc80', lapis: '#2e4a8a', linen: '#e0d4b0', linenD: '#a89870',
  rope: '#8a5a2c', chain: '#8c949c', wax: '#b8282c', glass: '#e8d0a0', water: '#9fd0e8' };
const SEAL_COL = { rope: C.rope, chain: C.chain, wax: C.wax, glass: C.glass };
const SEAL_WORD = { rope: 'ROPE: OIL', chain: 'CHAIN: DARTS', glass: 'HOURGLASS: SAND', wax: 'WAX: SLUICE' };

export function makeCoffinKingHands(ctx) {
  let S = null;
  const H = {}, R = Math.round;
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'tombking' && ctx.L.arena.ck ? ctx.L.arena : null);
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'tombking' ? e : null; };
  const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
  const keyed = (pp, key) => { pp.ckKeys = pp.ckKeys || new Map(); if (pp.ckKeys.size > 120) pp.ckKeys.clear(); if (pp.ckKeys.has(key)) return true; pp.ckKeys.set(key, 1); return false; };
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'tombking';
  H.phase = () => (S ? S.ph : 1);
  H.clear = () => { S = null; BOSS_PHASE.tombking = 1; };
  /* a seal trap is live from the phase it arms in (d.ck = that phase), and only while he fights */
  H.trapsOn = d => !!(S && ctx.bossActive && (!d || !d.ck || S.ph >= d.ck));
  H.pressers = () => [];   /* he presses no plate: the player fires the traps */
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = CKM.newFight(CKM.geom(Ar, ctx.TS)); BOSS_PHASE.tombking = 1;
    const e = { ...base, t: 'tombking', w: CK.w, h: CK.h, hp: ctx.EHP.tombking, maxHp: ctx.EHP.tombking, noGrav: true, markH: CK.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, boss: true, ck: true };
    e.x = S.G.start; e.y = S.G.floorY; for (const pp of ctx.players) pp.ckKeys = null; return e; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp, atk: pp.atk }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(), rng: () => Math.random(),
      music: ph => { BOSS_PHASE.tombking = ph; if (ctx.music) ctx.music(ph > 1 ? 'tombking:p' + ph : 'tombking'); },
      mark: m => ctx.number(e.x, e.y - CK.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      traps: () => {},
      fx: (k, x, y) => {
        if (k === 'open') { ctx.ring(x, y - 20, 40, '#ffd36b'); ctx.burst(x, y - 24, 16, ['#d8c8a0', '#a89070', '#d8aa40'], 110, 0.7); }
        else if (k === 'ward') ctx.ring(x, y - 20, 42, '#c8d8e8');
        else if (k === 'seal') ctx.burst(x, y - 30, 14, ['#ffd36b', '#b8282c', '#8c949c', '#e8d0a0'], 120, 0.6);
        else if (k === 'slam' || k === 'land') ctx.burst(x, y - 4, 16, ['#d8c8a0', '#a89070', '#6e5a3c'], 110, 0.6); },
      hit: (bx, d, name, o = {}) => { const out = []; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          const hb = o.high ? duckBox(P) : ctx.box(P);   /* (THE CHAIN WHIP flies over a crouch) */
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, hb) || keyed(pp, o.key || name)) return;
          const res = ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock });
          out.push({ pp, res }); }); return out; },
      haul: (pp, dx) => { if (pp && !pp.dead && dx) ctx.moveBody(pp, dx, 0); },
      cutting: pp => !!pp && pp.atk >= 0 && pp.atk < 0.2,
    };
  }
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 84, CKM.CK_SAY.wake, '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 160, CKM.CK_SAY.rule, '#ffd36b'); }
    const w = world(e); CKM.stepCoffinKing(e, S, dt, heroes(), w);
    /* THE WATER: the sluice's flood level (src/sealed-pyramid-hands.js floodLevel) - risen with the lid burst, it tips him (THE FLIP) */
    if (ctx.floodLevel) { const lvl = ctx.floodLevel('ckFlood'); if (lvl > 0.02) { if (!S.floodKey) S.floodKey = 'f' + (S.n.opens + 1) + ':' + R(ctx.time()); CKM.water(e, S, w, lvl, S.floodKey); } else { S.floodKey = null; S.flood = 0; } }
    e.phase = S.ph; if (S.ph >= 3) { e.w = CK.w3; e.h = CK.h3; }
  };
  H.trapHit = (e, kind, t, src) => { const b = live(); if (!S || !b || b !== e || !ctx.bossActive || src === 'plate') return 'busy'; return CKM.trapLands(e, S, world(e), kind); };
  H.strike = () => {};
  H.take = (e, dmg) => { if (!S) return dmg; const t = ctx.time(), [d, word] = CKM.takeBlow(e, S, dmg);
    if (word) { e.chipHit = t; e.guardFx = 0.25; e.guardWord = word; if (!CKM.ckOpen(e)) { ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 18, e.y - 26, sd, 4); } }
    return d; };
  H.barName = e => 'THE COFFIN KING' + (CKM.ckOpen(e) ? '  ' + (CKM.OPEN_NAME[e.openKind] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : S && S.ph < 3 ? '  SEALS ' + CKM.need(S).length : '');
  H.end = () => { if (S) { S.hold = null; S.tumble = null; S.whip = null; S.lunge = null; S.coffin = null; S.mark = null; } BOSS_PHASE.tombking = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, open: ctx.boss ? ctx.boss.open : 0, openKind: ctx.boss && ctx.boss.openKind, broken: S.broken.slice(), need: CKM.need(S),
    flood: S.flood, coffin: S.coffin ? { x: R(S.coffin.x), held: !!S.coffin.held } : null, n: JSON.parse(JSON.stringify(S.n)) };
  H.deadNear = () => [];
  H.reeled = pp => !!(S && S.hold && S.hold.pp === pp);

  /* ---------- THE DRAWING (greybox) ---------- */
  /* the coffin itself: an upright sarcophagus (w x h) drawn from its foot at (0,0), its bindings by what still holds; `lid`: 0 shut .. 1 burst open */
  function coffin(g, w, h, lid, time, seals, ph, knock) {
    const x0 = -w / 2;
    rect(g, x0 - 1, -h - 1, w + 2, h + 2, C.ink); rect(g, x0, -h, w, h, C.stoneD); rect(g, x0 + 2, -h + 2, w - 4, h - 4, C.stone);
    rect(g, x0 + 2, -h + 2, w - 4, 3, C.stoneL); rect(g, x0 + 4, -h + 8, w - 8, 1, C.gold); rect(g, x0 + 4, -10, w - 8, 1, C.gold);
    if (lid < 1) { /* the lid: a carved king's face (the false face) and, at the cracks, the real one pressing out */
      g.save(); g.translate(x0 + 3 + lid * w * 0.55, 0); g.rotate(-lid * 0.5);
      rect(g, 0, -h + 4, w - 6, h - 8, C.stone); rect(g, (w - 6) / 2 - 6, -h + 9, 12, 13, C.gold); rect(g, (w - 6) / 2 - 4, -h + 13, 2, 2, C.ink); rect(g, (w - 6) / 2 + 2, -h + 13, 2, 2, C.ink);
      rect(g, (w - 6) / 2 - 7, -h + 22, 14, 3, C.lapis);
      if (knock) { const k = Math.sin(time * 40) > 0 ? 1 : 0; rect(g, 6 + k, -h * 0.55, 6, 5, C.linen); rect(g, w - 18 - k, -h * 0.45, 6, 5, C.linen); rect(g, (w - 6) / 2 - 1, -h * 0.7, 3, 10, C.ink); }
      if (ph >= 2) { rect(g, 4, -h * 0.35, 2, 12, C.ink); rect(g, w - 12, -h * 0.6, 2, 9, C.ink); }   /* the cracks he has made */
      g.restore(); }
    else { /* burst: he is in there - the linen, the gold mask, slumped */
      rect(g, x0 + 5, -h + 6, w - 10, h - 10, '#2a1e12'); rect(g, x0 + w / 2 - 7, -h + 10, 14, 14, C.gold); rect(g, x0 + w / 2 - 4, -h + 15, 2, 2, C.ink); rect(g, x0 + w / 2 + 2, -h + 15, 2, 2, C.ink);
      for (let i = 0; i < 6; i++) rect(g, x0 + 9, -h + 26 + i * 4, w - 18, 2, i % 2 ? C.linen : C.linenD); }
    /* the bindings that still hold */
    if (seals.includes('rope')) for (const y of [-h * 0.3, -h * 0.7]) { rect(g, x0 - 2, y, w + 4, 3, C.rope); rect(g, x0 - 2, y, w + 4, 1, '#b07a44'); }
    if (seals.includes('chain')) { g.strokeStyle = C.chain; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, -h + 4); g.lineTo(x0 + w, -6); g.moveTo(x0 + w, -h + 4); g.lineTo(x0, -6); g.stroke(); g.lineWidth = 1; }
    if (seals.includes('wax')) for (const [sx, sy] of [[x0 + 4, -h * 0.5], [x0 + w - 8, -h * 0.5], [x0 + w / 2 - 2, -14]]) { rect(g, sx, sy, 5, 5, C.wax); rect(g, sx + 1, sy + 1, 2, 1, '#e86a6a'); }
    if (seals.includes('glass')) { const gx = x0 + w / 2, gy = -h * 0.42; g.fillStyle = C.gold; g.beginPath(); g.moveTo(gx - 6, gy - 8); g.lineTo(gx + 6, gy - 8); g.lineTo(gx - 6, gy + 8); g.lineTo(gx + 6, gy + 8); g.closePath(); g.fill();
      rect(g, gx - 1, gy - 2 + ((time * 6) % 8), 2, 2, C.glass); }
  }
  /* the free king (P3): a tall bandaged figure, gold mask, chains hanging from his wrists */
  function king(g, pose, time) {
    const lean = pose === 'lungeTell' ? 0.25 : pose === 'lunge' ? -0.35 : 0, crouch = pose === 'lungeTell' || pose === 'throwTell' ? 4 : 0;
    g.save(); g.rotate(lean); const h = CK.h3 - crouch;
    rect(g, -7, -h, 14, h - 12, C.linenD); for (let i = 0; i < 7; i++) rect(g, -7, -h + 4 + i * 4, 14, 2, i % 2 ? C.linen : '#c8bc98');
    rect(g, -5, -12, 4, 12, C.linenD); rect(g, 2, -12, 4, 12, C.linenD);   /* legs */
    rect(g, -6, -h - 10, 12, 11, C.gold); rect(g, -4, -h - 6, 2, 2, C.ink); rect(g, 2, -h - 6, 2, 2, C.ink); rect(g, -7, -h - 12, 14, 3, C.lapis);
    const armUp = pose === 'throwTell' || pose === 'throw'; rect(g, 6, armUp ? -h - 14 : -h + 4, 4, armUp ? 16 : 16, C.linen); rect(g, -10, armUp ? -h - 14 : -h + 4, 4, 16, C.linen);
    g.strokeStyle = C.chain; g.beginPath(); g.moveTo(10, -h + 18); g.lineTo(14 + Math.sin(time * 6) * 2, -h + 30); g.stroke();
    g.restore(); }

  H.drawBack = (g, cx, cy, time) => { if (!S || !A()) return; const G = S.G;
    /* THE LINES THAT WOULD OPEN HIM NOW (readability, B10): a faint gold bracket on the floor of each ready trap whose seal binds him */
    if (!ctx.bossActive) return; const need = S.ph >= 3 ? null : CKM.need(S);
    for (const p of G.plates) { if (p.ph > S.ph || (need && !need.includes(p.seal))) continue; const [a, b] = p.reach[0], y = R(p.rows[1] - cy);
      g.globalAlpha = 0.18 + 0.1 * Math.sin(time * 4); g.fillStyle = SEAL_COL[p.seal] || C.gold; g.fillRect(R(a - cx), y - 2, R(b - a), 2); g.fillRect(R(a - cx), y - 8, 1, 8); g.fillRect(R(b - cx) - 1, y - 8, 1, 8); g.globalAlpha = 1; } };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, m = e.mode, x = R(e.x - cx), y = R(e.y - cy), flash = (e.hurtT || 0) > 0;
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.beginPath(); g.ellipse(x, R((m === 'leap' && S.leap ? S.leap.ty : e.y) - cy), 24, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    g.save(); g.translate(x, y); g.scale(f, 1);
    const seals = S.ph >= 3 ? [] : CKM.need(S);
    if (S.ph >= 3 && !['flipped'].includes(m)) {   /* THE FREE KING */
      if (m === 'downed') { g.rotate(-1.45); king(g, 'walk', time); }
      else { if (m === 'walk' || m === 'fetch') g.translate(0, -(Math.floor(time * 10) & 1)); king(g, m, time);
        if (S.coffin && S.coffin.held) { g.save(); g.translate(0, m === 'throwTell' ? -CK.h3 - 10 : -CK.h3 + 6); g.rotate(m === 'throwTell' ? 0 : 1.5707); g.scale(0.55, 0.55); coffin(g, CK.w, CK.h, 0, time, [], 3, false); g.restore(); } } }
    else {
      const hop = m === 'walk' ? Math.abs(Math.sin(time * 8)) * 6 : 0, lid = m === 'burst' || m === 'flipped' ? 1 : m === 'clamp' ? Math.max(0, e.modeT / CK.clampT) : S.ph >= 2 ? 0.28 : 0;
      g.translate(0, -hop);
      if (m === 'slamTell') g.rotate(-0.28); else if (m === 'slam' || m === 'tumbleEnd') { g.translate(f > 0 ? 0 : 0, 0); g.rotate(1.45); }
      else if (m === 'tumbleTell') g.rotate(Math.sin(time * 18) * 0.12); else if (m === 'tumble') { g.translate(0, -CK.h / 2); g.rotate(time * 12); g.translate(0, CK.h / 2); }
      else if (m === 'leapTell') g.scale(1.1, 0.85); else if (m === 'stagger' || m === 'escape') g.translate(Math.sin(time * 50) * 2, 0); else if (m === 'flipped') g.rotate(-1.5707);
      coffin(g, CK.w, CK.h, lid, time, seals, S.ph, m === 'grabTell' || m === 'escape');
      if (S.ph >= 2 && lid < 1) { rect(g, -CK.w / 2 - 8, -CK.h + 18, 8, 4, C.linen); rect(g, CK.w / 2, -CK.h + 22, 8, 4, C.linen); }   /* P2: his arms are out */
      if (m === 'grab' || m === 'hold') { rect(g, CK.w / 2 - 4, -CK.h * 0.6, CK.grab.reach * (m === 'grab' ? 0.9 : 0.4), 5, C.linen); rect(g, CK.w / 2 - 4, -CK.h * 0.35, CK.grab.reach * (m === 'grab' ? 0.8 : 0.35), 5, C.linenD); }
      if (m === 'whipTell') { g.strokeStyle = C.chain; g.beginPath(); g.arc(-CK.w / 2 - 6, -CK.h * 0.6, 8 + Math.sin(time * 20) * 2, 0, 6.28); g.stroke(); } }
    if (flash) { g.globalAlpha = 0.5; rect(g, -CK.w / 2, -CK.h, CK.w, CK.h, '#ffffff'); g.globalAlpha = 1; }
    g.restore();
    if (e.guardFx > 0) { g.fillStyle = '#fff6c8'; g.fillRect(R(x + f * 20 - 2), R(y - 34), 5, 14); }
  };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'tombking') return; const G = S.G;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', X = v => R(v - cx), Y = v => R(v - cy), hw = (S.ph >= 3 ? CK.w3 : CK.w) / 2;
    if ((e.mode === 'leapTell' || e.mode === 'leap') && S.leap) { const q = S.leap; g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 14); g.fillStyle = '#10060a'; g.beginPath(); g.ellipse(X(q.tx), Y(q.ty) - 1, CK.leap.r, 4, 0, 0, 7); g.fill(); g.globalAlpha = 1; g.strokeStyle = blink; g.strokeRect(X(q.tx) - CK.leap.r, Y(q.ty) - 3, CK.leap.r * 2, 3); }
    if (S.whip) { const f = S.whip.dir, k = Math.min(1, S.whip.t / (CK.whip.t * 0.6)), x1 = e.x + f * (hw + CK.whip.reach * k); g.strokeStyle = C.chain; g.lineWidth = 2; g.beginPath(); g.moveTo(X(e.x), Y(e.y - 30)); g.quadraticCurveTo(X((e.x + x1) / 2), Y(e.y - 50), X(x1), Y(G.floorY - 12)); g.stroke(); g.lineWidth = 1; }
    if (e.mode === 'tumble') for (let k = 0; k < 5; k++) rect(g, X(e.x - (S.tumble ? S.tumble.dir : 1) * (24 + k * 5)), Y(G.floorY) - 2 - (k % 2), 3, 2, '#a89070');
    if (S.mark && e.mode === 'throwTell') { g.strokeStyle = blink; g.beginPath(); g.ellipse(X(S.mark.x), Y(S.mark.y) - 1, CK.thrw.r, 4, 0, 0, 7); g.stroke(); }
    if (S.coffin && !S.coffin.held) { g.save(); g.translate(X(S.coffin.x), Y(S.coffin.y)); if (S.coffin.fly) g.rotate(time * 8); else g.rotate(1.5707); g.scale(0.7, 0.7); g.translate(0, CK.h / 2 - (S.coffin.fly ? 0 : 6)); coffin(g, CK.w, CK.h, 0, time, [], 3, false); g.restore(); }
    if (S.hold) { const pp = S.hold.pp; for (let k = 0; k < 4; k++) rect(g, X(pp.x) - 8, Y(pp.y) - 13 + k * 3, 16, 1, k & 1 ? C.linenD : C.linen); }
    /* HIS SEALS (what binds him now, and what breaks each) */
    const x = X(e.x), top = Y(e.y - (S.ph >= 3 ? CK.h3 : CK.h) - 16);
    if (S.ph < 3 && !CKM.ckOpen(e)) { const all = CKM.SEALS[S.ph]; all.forEach((s, i) => { const bound = !S.broken.includes(s), xx = x + (i - (all.length - 1) / 2) * 52;
      ctx.text(SEAL_WORD[s], xx, top - 8, bound ? (SEAL_COL[s] === C.glass ? '#ffd36b' : '#f0c890') : '#6a6a6a', 'center', 4);
      if (!bound) { g.strokeStyle = '#8fd160'; g.beginPath(); g.moveTo(xx - 20, top - 8); g.lineTo(xx + 20, top - 12); g.stroke(); } }); }
    /* THE READ (B10) */
    if (CKM.ckOpen(e)) { const T = e.openKind === 'flip' ? CK.flipT : e.openKind === 'downed' ? CK.downT : CK.openT, kk = Math.max(0, e.open / T);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, Y(e.y - 18), e.openKind === 'flip' ? 44 : 36, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = Y(e.y - 70); ctx.text(CKM.OPEN_NAME[e.openKind] || 'OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 20, by, 40, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 20, by, R(40 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, Y(e.y - 24), 40, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, top - 20, '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, top - 30 - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
