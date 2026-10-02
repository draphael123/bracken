// src/gorge-crab-hands.js - THE GREAT RED CRAB's HANDS (claude/redgorge). src/gorge-crab.js is the fight (pure: the desert engine run on the old
// dam's plateau, his cycles, his opening, the bot's reading); this binds it to the world: his told blows on the heroes, the boulders' marks, the
// dam's water (read from src/red-gorge-hands.js dam(): the horn, a flood running, the gate holding water, a released burst on him), and the
// drawing (the marks, the scuttle's line, ON HIS BACK and its clock). main.js calls: spawnBoss, owns, update, take, frame, barName, drawOver, end,
// read, fight, clear. Every teaching line goes through ctx.number with a line listed in src/hint-lines.js.
import * as GC from './gorge-crab.js';
import { CRAB_F } from './redraw/redgorge_art.js';
const { CRAB } = GC;

export function makeGorgeCrabHands(ctx) {
  let F = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'gorgecrab' ? ctx.L.arena : null);
  const water = () => (ctx.gorge && ctx.gorge.dam && ctx.gorge.dam()) || { horn: false, running: false, held: false, burst: false, gate: 'open' };
  H.fight = () => F;
  H.on = () => !!(F && A());
  H.owns = e => e.t === 'gorgecrab';
  H.clear = () => { F = null; };
  H.phase = () => (F ? F.B.phase : 1);
  H.spawnBoss = base => { const S = A(); if (!S) return null;
    F = GC.newFight(S, ctx.EHP.gorgecrab); F.wake = 1.2;
    const e = { ...base, t: 'gorgecrab', w: CRAB.w, h: CRAB.h, hp: ctx.EHP.gorgecrab, maxHp: ctx.EHP.gorgecrab, noGrav: true, markH: CRAB.markH, face: -1, mode: 'sleep', open: 0, phase: 1 };
    e.x = GC.world(F, F.B.x); e.y = S.floor; return e; };
  H.water = water;

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!F || !e.alive) return; const S = A(); if (!S) return;
    if (F.wake > 0) { F.wake -= dt; e.mode = 'wake'; return; }
    const P = ctx.hero(), m2 = CRAB.p2, w = water(), B = F.B;
    const swept = w.burst && GC.inChannel(B.x);
    const evs = GC.stepFight(F, { x: P.x }, e.hp, { horn: w.horn, running: w.running, held: w.held, swept }, dt);
    e.x = GC.world(F, B.x); e.y = S.floor; e.face = B.face; e.mode = GC.crabMode(B); e.open = B.mode === 'open' ? B.t : 0; e.phase = B.phase;
    for (const v of evs) {
      if (v.t === 'tell') { const hard = v.mark !== '!'; ctx.number(e.x, e.y - CRAB.markH, hard ? '!!' : '!', hard ? '#ff6b6b' : '#ffd36b'); ctx.sfx.tell && ctx.sfx.tell(hard);
        if (v.what === 'boulder') { ctx.ring(v.x, S.floor - 6, 22, '#ff6b6b'); if (v.x2 != null) ctx.ring(v.x2, S.floor - 6, 22, '#ff6b6b'); }
        if (v.what === 'scuttle') ctx.ring(v.x, S.floor - 6, 16, '#ff6b6b'); }
      if (v.t === 'act' && v.what === 'boulder') { ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); }
      if (v.t === 'hit') {
        if (v.what === 'boulder') { ctx.sfx.crumble && ctx.sfx.crumble(); ctx.burst((v.box[0] + v.box[1]) / 2, S.floor - 6, 12, ['#8a6a52', '#b8967a', '#3a2a12'], 80, 0.6); }
        if (v.what === 'crush') ctx.shake(3);
        const d = Math.round((CRAB.dmg[v.what] || 10) * (B.phase === 2 ? m2 : 1)), name = { pinch: 'THE PINCH', crush: 'THE CRUSH', boulder: 'A BOULDER', scuttle: 'THE SCUTTLE' }[v.what];
        for (const pp of ctx.players) ctx.asPlayer(pp, () => { const Q = ctx.hero(); if (Q.dead || !ctx.upright(pp)) return; const key = 'gc' + v.key;
          if ((pp.gcHit || '') === key) return; if (!ctx.overlap({ l: v.box[0], r: v.box[1], t: v.box[2], b: v.box[3] }, ctx.box(Q))) return;
          pp.gcHit = key; ctx.damagePlayer(e.x, d, { unblockable: !v.blockable, who: e, name }); }); }
      if (v.t === 'open') { ctx.sfx.waveCrash && ctx.sfx.waveCrash(); ctx.shake(4); ctx.burst(e.x, e.y - 20, 22, ['#7ab8e8', '#e8f4f8', '#b8382c'], 80, 0.9); ctx.number(e.x, e.y - 56, 'THE WATER THROWS HIM: CUT HIM', '#8fd160'); }
      if (v.t === 'phase2') { ctx.enrage(e); ctx.number(e.x, e.y - 56, 'HE SMELLS THE HELD WATER: MAKE HIM SCUTTLE IN', '#ff9a5c'); }
    }
    /* a release with him out of the channel: water wasted, and the hit says so */
    if (w.burst && !F.burstSeen) { F.burstSeen = true; F.n.releases++; if (!GC.inChannel(B.x) && B.mode !== 'open') { F.n.wasted++; ctx.number(e.x, e.y - 56, 'HE IS NOT IN THE CHANNEL: THE WATER IS WASTED', '#9aa39a'); } }
    if (!w.burst) F.burstSeen = false;
    if (!F.said.wheel && Math.abs(P.x - e.x) < 400) { F.said.wheel = 1; ctx.number(P.x, P.y - 40, 'HIS SHELL TURNS A BLADE: RELEASE THE DAM ON HIM', '#ffd36b'); }
  };
  /* A BLOW ON HIM: x CRAB.openMul on his back (the global rule makes every other blow a scratch) */
  H.take = e => GC.crabTake(F);
  H.frame = e => { const m = e.mode; if (m === 'open') return CRAB_F.open; if (m === 'wake' || m === 'sleep' || m === 'recover') return CRAB_F.stand;
    if (CRAB_F[m] !== undefined && !Array.isArray(CRAB_F[m])) return CRAB_F[m]; return CRAB_F.walk[Math.floor(ctx.time() * 5) % 2]; };
  H.barName = e => 'THE GREAT RED CRAB' + (e.mode === 'open' ? '  ON HIS BACK' : e.mode === 'dug' ? '  DUG IN' : '');
  H.end = e => {};
  H.read = () => F && { mode: F.B.mode, phase: F.B.phase, cycle: F.cycle, n: { ...F.n }, x: GC.world(F, F.B.x), inChannel: GC.inChannel(F.B.x) };

  /* ---------- DRAWING: the boulders' marks, the scuttle's mark, ON HIS BACK and its clock ---------- */
  H.drawOver = (g, cx, cy, time) => {
    const S = A(); if (!F || !S || !ctx.bossActive) return; const R = Math.round, e = ctx.boss; if (!e || e.t !== 'gorgecrab') return;
    const B = F.B, blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    const cross = m => { const x = R(GC.world(F, m) - cx), y = R(S.floor - 4 - cy); g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 2); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 2); g.stroke(); };
    if (B.mode === 'tell' && B.a && B.a.name === 'boulder') { cross(B.data.mark); if (B.data.mark2 != null) cross(B.data.mark2); }
    if (B.mode === 'tell' && B.a && B.a.name === 'scuttle') { cross(B.data.to); g.fillStyle = blink; const x0 = R(e.x - cx), x1 = R(GC.world(F, B.data.to) - cx), y = R(S.floor - 2 - cy); for (let x = Math.min(x0, x1); x < Math.max(x0, x1); x += 6) g.fillRect(x, y, 3, 1); }
    if (B.mode === 'open') { const x = R(e.x - cx), y = R(e.y - CRAB.h - 22 - cy), k = Math.max(0, B.t / CRAB.openT);
      ctx.text('ON HIS BACK', x, y - 6, '#8fd160', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, y, 36, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 18, y, Math.round(36 * k), 3); }
  };
  return H;
}
