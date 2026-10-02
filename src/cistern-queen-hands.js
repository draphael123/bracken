// src/cistern-queen-hands.js - THE CISTERN QUEEN's HANDS (claude/welltown3). src/cistern-queen.js is the fight (pure: her three phases, her cycles,
// her openings, the bot's reading); this binds it to the world: her told blows on the heroes (keyed once a blow, a shield turns only the yellow ones,
// a duck goes under the high bands), her claw's grab (the game's own P.snare: mash out, or strike the claw), her brood (desert scorpions with one blow
// in them), the pour (src/well-town-hands.js asks pourables()), the windlass and the shaft's bucket, her VENOM on the heroes' stamina (P.venomSlow,
// read by main.js's stamina regen), and the drawing (src/redraw/cistern_queen_art.js draws her; this draws the hall's machines and her tells).
// main.js calls: spawnBoss, owns, update, take, pourable, draw, drawOver, barName, end, read, show, clear. Every teaching line goes through ctx.number
// with a line listed in src/hint-lines.js.
import * as CQG from './cistern-queen.js';
import * as CQA from './redraw/cistern_queen_art.js';
const { CQ } = CQG;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), dig: s => (s.rubble || s.thud)(), climb: s => (s.chitin || s.step || s.thud)(), lunge: s => (s.leap || s.heavy)(),
  stab: s => (s.pierce || s.sting || s.crack)(), flick: s => (s.rubble || s.thud)(), erupt: s => { (s.rubble || s.thud)(); (s.roar || s.heavy)(); }, plough: s => (s.rubble || s.thud)(),
  spit: s => (s.spit || s.hiss)(), sweep: s => (s.slash || s.heavy)(), slam: s => { (s.heavy || s.thud)(); (s.rubble || s.thud)(); }, drop: s => (s.leap || s.thud)(),
  skitter: s => (s.chitin || s.step || s.thud)(), thrash: s => (s.wave || s.splash)(), snap: s => (s.crack || s.clank)(), roll: s => (s.waveBreak || s.splash)(), whip: s => (s.slash || s.splash)(),
  call: s => (s.hiss || s.roar)(), sting: s => (s.sting || s.crack)(), soak: s => { (s.splash)(); (s.hiss || s.thud)(); }, fall: s => (s.heavy || s.thud)(), rear: s => (s.roar || s.heavy)(),
  windlass: s => { (s.clank)(); s.ratchet && s.ratchet(); }, splash: s => (s.whirlpool || s.splash)(), rock: s => (s.stone || s.thud)(), flood: s => { (s.whirlpool || s.splash)(); (s.roar || s.heavy)(); } };

export function makeCisternQueenHands(ctx) {
  let S = null, wl = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'cisternqueen' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'cisternqueen';
  H.clear = () => { S = null; };
  /* WHAT HURT: the health each of her blows took, by name (the pilots print it) */
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.cqKeys = pp.cqKeys || new Map(); if (pp.cqKeys.size > 80) pp.cqKeys.clear(); if (pp.cqKeys.has(key)) return true; pp.cqKeys.set(key, 1); return false; };
  const onLedgeOf = (pp, G) => { if (!G || !pp.ground || Math.abs(pp.y - G.ledgeY) > 4) return null; if (pp.x >= G.ledgeW[0] && pp.x <= G.ledgeW[1] + 4) return 'W'; if (pp.x >= G.ledgeE[0] - 4 && pp.x <= G.ledgeE[1]) return 'E'; return null; };
  H.onLedge = pp => onLedgeOf(pp, S && S.G);
  /* HER VENOM on a hero: a stack each, each lasting CQ.venom.t; the stamina regen is slowed by P.venomSlow (main.js) */
  const venom = (P, n) => { P.cqVenom = P.cqVenom || []; for (let i = 0; i < n; i++) { if (P.cqVenom.length >= CQ.venom.max) P.cqVenom.shift(); P.cqVenom.push(CQ.venom.t); }
    if (!(P.venomT > 0)) { ctx.number(P.x, P.y - 30, 'HER VENOM SLOWS YOUR STAMINA', '#a6e04a'); } P.venomT = Math.max(P.venomT || 0, 1.2); if (S) S.n.venom = (S.n.venom || 0) + n; };

  /* ---------- SPAWNING: a fresh attempt is a fresh show (the hall dry, the bucket up) ---------- */
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = CQG.newShow(CQG.geom(Ar, ctx.TS)); wl = (ctx.L.ents || []).find(q => q.t === 'qwindlass');
    const e = { ...base, t: 'cisternqueen', w: CQ.w, h: CQ.h, hp: ctx.EHP.cisternqueen, maxHp: ctx.EHP.cisternqueen, noGrav: true, markH: CQ.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.x = base.x; e.y = S.G.floor; for (const pp of ctx.players) { pp.cqKeys = null; pp.cqVenom = []; pp.venomSlow = 1; } return e; };

  /* ---------- THE WORLD AS SHE SEES IT, AND WHAT HER BLOWS DO ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, ducking: !!pp.ducking, onLedge: onLedgeOf(pp, S.G), pp }));
  function world(e) {
    const say = (line, col) => ctx.number(e.x, Math.min(e.y, S.G.floor) - 70, line, col);
    return {
      say, number: (x, y, t, col) => ctx.number(x, Math.min(y, S.G.floor - 70), t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), music: ph => ctx.music && ctx.music(ph === 3 ? 'cisternqueen:p3' : 'cisternqueen:p2'),
      mark: m => ctx.number(e.x, (S.pose === 'shaft' ? S.G.vault + 30 : e.y) - (S.pose === 'wall' ? 96 : CQ.markH), m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => {
        if (k === 'erupt' || k === 'dig' || k === 'burst') { ctx.burst(x, y - 8, k === 'dig' ? 10 : 18, ['#c9a46a', '#8a6a3e', '#e8d4a0'], 90, 0.7); ctx.dust(x, y, 10); }
        else if (k === 'splash' || k === 'wake') { ctx.burst(x, y - 6, k === 'wake' ? 3 : 18, ['#7ab8e8', '#e8f4f8', '#3a7ab8'], k === 'wake' ? 40 : 90, 0.6); }
        else if (k === 'venomSplat') ctx.burst(x, y - 3, 8, ['#a6e04a', '#5c8a24'], 50, 0.5);
        else if (k === 'rubble') { ctx.burst(x, y - 6, 10, ['#6a7480', '#4a525c', '#9aa4ae'], 70, 0.6); ctx.dust(x, y, 6); }
        else if (k === 'land' || k === 'stuck') { ctx.dust(x, y, 12); ctx.burst(x, y - 4, 8, ['#c9a46a', '#8a6a3e'], 60, 0.5); }
        else if (k === 'lance') ctx.burst(x, y - 4, 8, ['#ffd36b', '#c9a46a'], 70, 0.4);
        else if (k === 'runoff') ctx.burst(x, y + 10, 14, ['#7ab8e8', '#e8f4f8'], 50, 0.8);
        else if (k === 'stoneLand') ctx.dust(x, y, 3); },
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
        if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, o.duck ? ctx.duckBox(P) : ctx.box(P)) || keyed(pp, o.key || name)) return;
        const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock }));
        if (P.hp < hp0 && o.venom) venom(P, o.venom); if (o.onHit) o.onHit(); if (o.launch && !P.dead && P.hp < hp0) { P.vy = -220; } }); },
      band: (kind, [t, b], x0, x1, d, name, key, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
        if (P.x < x0 || P.x > x1) return; const hb = kind === 'high' ? ctx.duckBox(P) : ctx.box(P); if (!(hb.b > t && hb.t < b) || keyed(pp, key)) return;
        const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: true })); if (P.hp < hp0 && o.venom) venom(P, o.venom); }); },
      grab: (bx, key) => { for (const pp of ctx.players) { if (!ctx.upright(pp) || pp.dead || pp.snare > 0) continue; let got = null;
          ctx.asPlayer(pp, () => { const P = ctx.hero(); if (keyed(pp, key + 'g')) return; if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) { pp.cqKeys.delete(key + 'g'); return; }
            if (P.dodge > 0 || P.inv > 0) return;   /* a roll goes through the claw */
            P.snare = CQ.snare; P.vx = 0; hurt(MOVE_NAME_GRAB, () => ctx.damagePlayer(e.x, CQ.dmg.grab, { who: e, name: MOVE_NAME_GRAB, unblockable: true, noKnock: true })); got = { pp }; });
          if (got) return got; } return null; },
      free: h => !(h.pp.snare > 0) || h.pp.dead,
      holdAt: (h, x) => ctx.asPlayer(h.pp, () => { const P = ctx.hero(); P.vx = Math.max(-60, Math.min(60, (x - P.x) * 5)); }),
      release: h => { if (h && h.pp && h.pp.snare > 0) h.pp.snare = 0; },
      spawnBrood: (x, y) => { const b = ctx.spawnBrood(x, y); if (b) { b.hp = CQ.broodHp; b.hp0 = CQ.broodHp; b.brood = true; ctx.burst(b.x, b.y - 6, 6, ['#7ab8e8', '#c9a46a'], 50, 0.5); } return b; },
      drown: b => { ctx.burst(b.x, b.y - 4, 10, ['#7ab8e8', '#e8f4f8'], 60, 0.6); if (!S.told.drown) { S.told.drown = 1; ctx.number(b.x, b.y - 30, 'THE DEEP WATER DROWNS HER BROOD', '#8fd160'); } },
      water: d => { S.waterShown = d; },
    };
  }
  const MOVE_NAME_GRAB = CQG.MOVE_NAME.grab;

  /* ---------- ONE FRAME OF HER ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    /* she wakes: you came down the old well with water (the courtyard's well is the last before her door, and a checkpoint refills it) - the skin is full */
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.6; for (const pp of ctx.players) if (pp.skin) pp.skin.sips = pp.skin.max || 3; }
    const c = world(e), hs = heroes();
    CQG.stepQueen(e, S, dt, hs, c);
    /* her body's box follows her pose: long and low on the floor, tall on a wall, nothing under the sand or up the shaft */
    if (S.pose === 'wall' && (e.mode === 'cling' || e.mode === 'climb' || /Tell$/.test(e.mode) || e.mode === 'spit' || e.mode === 'slam' || e.mode === 'sweepLow' || e.mode === 'sweepHigh')) { e.w = 34; e.h = 82; }
    else { e.w = CQ.w; e.h = CQ.h; }
    e.phase = S.ph; e.burrowed = S.pose === 'burrow';
    /* THE CLAW, struck as it comes (a counter) or while it holds you: the grab is broken and she rears - OPEN */
    const hb = ctx.attackBox();
    if (hb && S.claw && (e.mode === 'grab' || e.mode === 'hold')) { const cl = S.claw;
      if (ctx.overlap(hb, { l: cl.x - 14, r: cl.x + 14, t: S.G.floor - 34, b: S.G.floor })) { if (cl.caught) c.release(cl.caught); S.claw = null; S.n.countered++; S.n.broken++; ctx.sparks(cl.x, S.G.floor - 16, ctx.hero().face || 1, 6);
        CQG.openUp(e, S, 'rear', c); c.number(e.x, e.y - 70, 'THE GRAB IS BROKEN: SHE REARS. CUT HER', '#8fd160'); } }
    /* THE WINDLASS: a blow on it sends the shaft's bucket down */
    if (hb && wl) { const wx = wl.x * ctx.TS + 8, wy = (wl.y + 1) * ctx.TS; if (ctx.overlap(hb, { l: wx - 14, r: wx + 14, t: wy - 26, b: wy })) { if (CQG.strikeWindlass(e, S, c)) ctx.sparks(wx, wy - 14, ctx.hero().face || 1, 5); } }
    /* HER VENOM wears off, a stack at a time; while it is in you, stamina comes back slower */
    for (const pp of ctx.players) { const v = pp.cqVenom || []; for (let i = 0; i < v.length; i++) v[i] -= dt; pp.cqVenom = v.filter(t => t > 0); pp.venomSlow = Math.max(0.1, 1 - CQ.venom.slow * pp.cqVenom.length); }
    /* THE FIRST TIME: what her claws do, and where the water is */
    if (!S.told.guard && e.mode !== 'wake' && e.mode !== 'sleep') { S.told.guard = 1; ctx.number(e.x, e.y - 90, 'HER CLAWS TURN YOU: FLOOD HER BURROW', '#ffd36b'); }
  };
  /* ---------- A BLOW ON HER: in an opening x openMul; her raised claws turn a frontal one outside it (0); from behind, the global chip ---------- */
  H.take = (e, dmg) => { if (!S) return dmg; const P = ctx.hero();
    if (CQG.guarded(e, P.x)) { e.chipHit = ctx.time(); S.n.guarded++; e.guardFx = 0.2; if (!S.told.claws) { S.told.claws = 1; ctx.number(e.x, e.y - 80, 'HER CLAWS TURN IT: GET BEHIND, OR GET WATER ON HER', '#9aa39a'); } return 0; }
    return dmg * CQG.qTake(e); };
  /* ---------- THE POUR (src/well-town-hands.js asks: what would a pour land on, and pour it) ---------- */
  const heroOf = P => ({ x: P.x, y: P.y, face: P.face || 1, onLedge: onLedgeOf(P, S && S.G) });
  H.pourable = {
    aim: P => { const e = ctx.boss; if (!S || !ctx.bossActive || !e || e.t !== 'cisternqueen' || !e.alive) return null; return CQG.pourAim(e, S, heroOf(P)); },
    pour: P => { const e = ctx.boss; if (!S || !e || e.t !== 'cisternqueen') return null; const r = CQG.pourAt(e, S, heroOf(P), world(e)); if (r === 'wasted') ctx.number(P.x, P.y - 30, 'IT RUNS INTO THE SAND', '#9aa39a'); return r; },
  };
  H.barName = e => 'THE CISTERN QUEEN' + (CQG.qOpen(e) ? (e.mode === 'soaked' ? '  SOAKED' : e.mode === 'fallen' ? '  ON HER BACK' : '  REARING') : e.burrowed ? '  BURROWED' : '');
  H.end = e => { if (S) { S.bands = []; S.shots = []; S.rubble = []; S.puddles = []; S.claw = null; for (const b of S.brood) if (b.alive) { b.alive = false; ctx.burst(b.x, b.y - 4, 8, ['#7ab8e8', '#c9a46a'], 50, 0.5); } }
    for (const pp of ctx.players) { pp.cqVenom = []; pp.venomSlow = 1; if (pp.snare > 0) pp.snare = 0; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, pose: S.pose, cycle: S.cycle, n: JSON.parse(JSON.stringify(S.n)), water: S.water, brood: S.brood.length, bucket: S.bucket.st, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING ---------- */
  /* her body (from the enemy loop, before the bodies of everyone else are drawn) */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    CQA.drawQueen(g, e, S, R(e.x - cx), R(e.y - cy), time, cx, cy); };
  /* the hall's machines, behind her: the windlass, the bucket's rope down the shaft, the tunnels, the springs' glint is the wells' own */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    if (wl) CQA.drawWindlass(g, R(wl.x * ctx.TS + 8 - cx), R((wl.y + 1) * ctx.TS - cy), S.bucket, time);
    CQA.drawBucket(g, R(G.mid - cx), R(G.vault - cy), S.bucket, CQ, time);
    CQA.drawTunnels(g, R(G.x0 - cx), R(G.x1 - cx), R(G.floor - cy), S, time); };
  /* over everything: the water, the mound, her tells' marks on the floor (the strike's bulge, the lance's spot, the rubble's shadows, the pounce's
     shadow, the bands lit), what flies, the venom puddles, the claw, her opening's clock */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'cisternqueen') return;
    CQA.drawOver(g, e, S, cx, cy, time, CQ); };
  return H;
}
