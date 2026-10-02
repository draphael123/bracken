// src/bandit-king-hands.js - THE BANDIT KING's HANDS (claude/welltown). src/bandit-king.js is the fight (pure: the desert engine run in his
// courtyard, his cycles, his opening, his chip, the bot's reading); this binds it to the world: his told blows on the heroes, his fire on the
// courtyard floor, the pour that opens him (from src/well-town-hands.js INTERACT), his lieutenants at the well in phase two, and the drawing (the
// jar's marks, the fire, his burning, the steam and OPEN with its clock). main.js calls: spawnBoss, owns, update, take, warded, pour, frame,
// barName, drawOver, end, read, fight. Every teaching line goes through ctx.number with a line listed in src/hint-lines.js.
import * as BKG from './bandit-king.js';
import { KING_F } from './redraw/welltown_art.js';
const { KING } = BKG;

export function makeBanditKingHands(ctx) {
  let F = null, burnCd = 0, chipSaid = 0;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'banditking' ? ctx.L.arena : null);
  H.fight = () => F;
  H.on = () => !!(F && A());
  H.owns = e => e.t === 'banditking';
  H.clear = () => { F = null; };
  H.spawnBoss = base => { const S = A(); if (!S) return null;
    F = BKG.newFight(S, ctx.EHP.banditking); F.wake = 1.2; burnCd = 0; chipSaid = 0;
    const e = { ...base, t: 'banditking', w: KING.w, h: KING.h, hp: ctx.EHP.banditking, maxHp: ctx.EHP.banditking, noGrav: true, markH: KING.markH, face: -1, mode: 'sleep', open: 0, phase: 1 };
    e.x = BKG.world(F, F.B.x); e.y = S.floor; return e; };

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!F || !e.alive) return; const S = A(); if (!S) return;
    if (F.wake > 0) { F.wake -= dt; e.mode = 'wake'; return; }
    const P = ctx.hero(), m2 = KING.p2;
    const evs = BKG.stepFight(F, { x: P.x, y: P.y, ground: !!P.ground }, e.hp, dt);
    const B = F.B; e.x = BKG.world(F, B.x); e.y = S.floor; e.face = B.face; e.mode = BKG.kingMode(B); e.open = B.mode === 'open' ? B.t : 0; e.phase = B.phase; e.burning = B.data.burning || 0;
    for (const v of evs) {
      if (v.t === 'tell') { const hard = v.mark !== '!'; ctx.number(e.x, e.y - KING.markH, hard ? '!!' : '!', hard ? '#ff6b6b' : '#ffd36b'); ctx.sfx.tell && ctx.sfx.tell(hard);
        if (v.what === 'jar') { ctx.ring(v.x, S.floor - 6, 22, '#ff6b6b'); if (v.x2 != null) ctx.ring(v.x2, S.floor - 6, 22, '#ff6b6b'); } }
      if (v.t === 'act' && v.what === 'jar') { ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); }
      if (v.t === 'hit') {
        if (v.what === 'jar') { ctx.sfx.crack && ctx.sfx.crack(); for (const f of BKG.kingFires(F)) if (f.t > 5.9) ctx.burst(f.x, S.floor - 6, 14, ['#ff9a3c', '#ffd36b', '#3a2a12'], 80, 0.6); }
        const d = Math.round((KING.dmg[v.what] || 10) * (B.phase === 2 ? m2 : 1)), name = { sweep: 'THE SCIMITAR', knives: 'THE KNIVES', jar: 'THE OIL JAR', charge: 'THE CHARGE' }[v.what];
        for (const pp of ctx.players) ctx.asPlayer(pp, () => { const Q = ctx.hero(); if (Q.dead || !ctx.upright(pp)) return; const key = 'bk' + v.key;
          if ((pp.bkHit || '') === key) return; if (!ctx.overlap({ l: v.box[0], r: v.box[1], t: v.box[2], b: v.box[3] }, ctx.box(Q))) return;
          pp.bkHit = key; ctx.damagePlayer(e.x, d, { unblockable: !v.blockable, who: e, name }); if (v.what === 'charge' && !Q.dead) { Q.vx = (Math.sign(Q.x - e.x) || 1) * 180; Q.vy = -120; } }); }
      if (v.t === 'open') { ctx.sfx.hiss ? ctx.sfx.hiss() : ctx.sfx.splash && ctx.sfx.splash(); ctx.shake(3); ctx.burst(e.x, e.y - 30, 20, ['#e8f4f8', '#cfd8dc', '#7a5a3a'], 70, 0.9); ctx.number(e.x, e.y - 60, 'THE STEAM BLINDS HIM: CUT HIM', '#8fd160'); }
      if (v.t === 'phase2') { ctx.enrage(e);
        const wx = S.well; for (let i = 0; i < KING.lieutenants; i++) { const x = Math.floor(wx / 16) + (i ? 2 : -2); ctx.spawn({ t: 'cutthroat', x, y: Math.floor(S.floor / 16) - 1, face: i ? -1 : 1, lieutenant: true }); }
        ctx.number(wx, S.floor - 40, 'HIS MEN TAKE THE WELL', '#ff9a5c'); }
    }
    if (e.burning > 0 && !F.said.burn) { F.said.burn = 1; ctx.number(e.x, e.y - 60, 'HE BURNS: POUR YOUR SKIN ON HIM', '#ffd36b'); }
    /* HIS FIRE: a tick for a hero standing in it (a jump over it is free) */
    burnCd = Math.max(0, burnCd - dt);
    if (burnCd <= 0) for (const f of BKG.kingFires(F)) for (const pp of ctx.players) ctx.asPlayer(pp, () => { const Q = ctx.hero(); if (Q.dead || burnCd > 0) return;
      if (Math.abs(Q.x - f.x) < KING.fireR && Q.y > S.floor - 10) { burnCd = KING.burnTick; ctx.damagePlayer(Q.x, KING.dmg.burn, { unblockable: true, noKnock: true, who: e, name: 'HIS FIRE' }); } });
    chipSaid = Math.max(0, chipSaid - dt); F.pourFx = Math.max(0, F.pourFx - dt); F.steam = Math.max(0, F.steam - dt);
  };
  /* A BLOW ON HIM: x KING.openMul open, x KING.chip otherwise (and the hit says why) */
  H.take = e => BKG.kingTake(F);
  H.warded = e => { if (chipSaid > 0) return; chipSaid = 2.5; ctx.sparks(e.x, e.y - 26, -(e.face || 1), 5); ctx.sfx.clank && ctx.sfx.clank(); ctx.number(e.x, e.y - 60, 'THE MUD PLATE TURNS IT', '#9aa39a'); };
  /* A POUR (the hero's INTERACT with a sip): true when it was poured at him */
  H.pour = P => { if (!F || !ctx.bossActive || !ctx.boss || ctx.boss.t !== 'banditking' || !ctx.boss.alive) return null; const r = BKG.pourAt(F, P.x); if (!r) return null;
    if (r === 'wasted') ctx.number(P.x, P.y - 30, 'HE IS NOT BURNING: IT RUNS OFF HIM', '#9aa39a'); return r; };
  H.frame = e => { const m = e.mode; if (m === 'open') return KING_F.open; if (m === 'wake' || m === 'sleep' || m === 'recover') return KING_F.stand;
    if (KING_F[m] !== undefined) return KING_F[m]; return KING_F.walk[Math.floor(ctx.time() * 4) % 2]; };
  H.barName = e => 'THE BANDIT KING' + (e.mode === 'open' ? '  OPEN' : e.burning > 0 ? '  BURNING' : '');
  H.end = e => { if (F) F.B.data.fires = []; for (const q of ctx.enemies()) if (q.alive && q.lieutenant) { q.alive = false; ctx.burst(q.x, q.y - 10, 8, ['#2a4a70', '#c9a070'], 50, 0.5); } };
  H.read = () => F && { mode: F.B.mode, phase: F.B.phase, cycle: F.cycle, n: { ...F.n }, burning: F.B.data.burning || 0, fires: BKG.kingFires(F).length };

  /* ---------- DRAWING: his fire, the jar's marks, his burning, the steam, OPEN and its clock ---------- */
  H.drawOver = (g, cx, cy, time) => {
    const S = A(); if (!F || !S || !ctx.bossActive) return; const R = Math.round, e = ctx.boss; if (!e || e.t !== 'banditking') return;
    for (const f of BKG.kingFires(F)) { const x = R(f.x - cx), y = R(S.floor - cy); for (let k = -KING.fireR; k < KING.fireR; k += 4) { const h = 6 + 5 * Math.abs(Math.sin(time * 11 + k + f.x)); g.fillStyle = (k / 4) % 2 ? '#ff9a3c' : '#ffd36b'; g.fillRect(x + k, y - h, 3, h); }
      g.fillStyle = '#3a2a12'; g.fillRect(x - KING.fireR, y - 1, KING.fireR * 2, 1); }
    const B = F.B; if (B.mode === 'tell' && B.a && B.a.name === 'jar') { const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
      for (const m of [B.data.mark, B.data.mark2]) { if (m == null) continue; const x = R(BKG.world(F, m) - cx), y = R(S.floor - 4 - cy); g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 2); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 2); g.stroke(); } }
    if (e.burning > 0) for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? '#ff9a3c' : '#ffd36b'; g.fillRect(R(e.x - 12 + k * 6 - cx), R(e.y - 34 - 6 * Math.abs(Math.sin(time * 9 + k)) - cy), 3, 8); }
    if (B.mode === 'open') { const x = R(e.x - cx), y = R(e.y - KING.h - 18 - cy), k = Math.max(0, B.t / KING.openT); g.fillStyle = 'rgba(232,244,248,0.35)'; g.fillRect(x - 18, R(e.y - KING.h - 4 - cy), 36, KING.h);
      ctx.text('OPEN', x, y - 6, '#8fd160', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 16, y, 32, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 16, y, Math.round(32 * k), 3); }
  };
  return H;
}
