// src/cistern-queen-hands.js - THE CISTERN QUEEN's HANDS (claude/welltown3). src/cistern-queen.js is the fight (pure: her three phases, her cycles,
// her openings, the bot's reading); this binds it to the world: her told blows on the heroes (keyed once a blow, a shield turns only the yellow ones,
// a duck goes under the high bands), her claw's grab (the game's own P.snare: mash out, or strike the claw), the pour (src/well-town-hands.js asks pourables()), the windlass and the shaft's bucket, her VENOM on the heroes' stamina (P.venomSlow,
// read by main.js's stamina regen), and the drawing (src/redraw/cistern_queen_art.js draws her; this draws the hall's machines and her tells).
// main.js calls: spawnBoss, owns, update, take, pourable, draw, drawOver, barName, end, read, show, clear. Every teaching line goes through ctx.number
// with a line listed in src/hint-lines.js.
import * as CQG from './cistern-queen.js';
import * as CQA from './redraw/cistern_queen_art.js';
const { CQ } = CQG;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), dig: s => (s.rubble || s.thud)(), climb: s => (s.chitin || s.step || s.thud)(), lunge: s => (s.leap || s.heavy)(),
  stab: s => (s.pierce || s.sting || s.crack)(), flick: s => (s.rubble || s.thud)(), erupt: s => { (s.rubble || s.thud)(); (s.roar || s.heavy)(); }, plough: s => (s.rubble || s.thud)(),
  spit: s => (s.spit || s.hiss)(), sweep: s => (s.slash || s.heavy)(), slam: s => { (s.heavy || s.thud)(); (s.rubble || s.thud)(); }, drop: s => (s.leap || s.thud)(),
  skitter: s => (s.chitin || s.step || s.thud)(), thrash: s => (s.wave || s.splash)(), snap: s => (s.crack || s.clank)(), whip: s => (s.slash || s.splash)(),
  bloom: s => (s.hiss || s.spit || s.splash)(), bloomBurst: s => { (s.whirlpool || s.splash)(); (s.hiss || s.spit || s.thud)(); },   /* (claude/queen4) THE VENOM BLOOM: the hiss of the tell, the slick's burst */
  call: s => (s.hiss || s.roar)(), sting: s => (s.sting || s.crack)(), soak: s => { (s.splash)(); (s.hiss || s.thud)(); }, fall: s => (s.heavy || s.thud)(), rear: s => (s.roar || s.heavy)(),
  windlass: s => { (s.clank)(); s.ratchet && s.ratchet(); }, splash: s => (s.whirlpool || s.splash)(), rock: s => (s.stone || s.thud)(), flood: s => { (s.whirlpool || s.splash)(); (s.roar || s.heavy)(); },
  flare: s => (s.fireWhoosh || s.hiss || s.crack)() };
/* (claude/underwell3) lines said once per fight, by key */

export function makeCisternQueenHands(ctx) {
  let S = null, wl = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'cisternqueen' ? ctx.L.arena : null);
  const R = Math.round, fr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'cisternqueen';
  H.clear = () => { S = null; };
  /* WHAT HURT: the health each of her blows took, by name (the pilots print it) */
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.cqKeys = pp.cqKeys || new Map(); if (pp.cqKeys.size > 80) pp.cqKeys.clear(); if (pp.cqKeys.has(key)) return true; pp.cqKeys.set(key, 1); return false; };
  /* ON A LEDGE: standing on its boards, or at the top of its rope ladder (the ladder's column is the ledge's end) */
const onLedgeOf = (pp, G) => { if (!G || !(pp.ground || pp.climb) || pp.y > G.ledgeY + 4 || pp.y < G.ledgeY - 18) return null; if (pp.x >= G.ledgeW[0] && pp.x <= G.ledgeW[1] + 18) return 'W'; if (pp.x >= G.ledgeE[0] - 18 && pp.x <= G.ledgeE[1]) return 'E'; return null; };
  H.onLedge = pp => onLedgeOf(pp, S && S.G);
  /* HER VENOM on a hero: a stack each, each lasting CQ.venom.t; the stamina regen is slowed by P.venomSlow (main.js) */
  const venom = (P, n) => { P.cqVenom = P.cqVenom || []; for (let i = 0; i < n; i++) { if (P.cqVenom.length >= CQ.venom.max) P.cqVenom.shift(); P.cqVenom.push(CQ.venom.t); }
    if (!(P.venomT > 0)) { ctx.number(P.x, P.y - 30, 'HER VENOM SLOWS YOUR STAMINA', '#a6e04a'); } P.venomT = Math.max(P.venomT || 0, 1.2); if (S) S.n.venom = (S.n.venom || 0) + n; };

  /* ---------- SPAWNING: a fresh attempt is a fresh show (the hall dry, the bucket up) ---------- */
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = CQG.newShow(CQG.geom(Ar, ctx.TS)); wl = (ctx.L.ents || []).find(q => q.t === 'qwindlass');
    const e = { ...base, t: 'cisternqueen', w: CQ.w, h: CQ.h, hp: ctx.EHP.cisternqueen, maxHp: ctx.EHP.cisternqueen, noGrav: true, markH: CQ.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.x = base.x; e.y = S.G.floor; for (const pp of ctx.players) { pp.cqKeys = null; pp.cqVenom = []; pp.venomSlow = 1; }
    /* (claude/underwell3) IS THIS BLOW ON HER STINGER? asked by src/boss-greed.js OPEN_RULE as the blow lands (a blow on the stinger is the right blow: never chipped, never greed) */
    e.cqBare = () => { if (!S) return false; const hb = ctx.attackBox(); if (!hb || S.ward > 0) return false; const st = CQG.stingerOut(S); if (st && ctx.overlap(hb, CQG.stingBox(st))) return true; const tp = CQG.tipOf(e, S); return !!(tp && ctx.overlap(hb, CQG.tipBox(tp))); };
    return e; };

  /* ---------- THE WORLD AS SHE SEES IT, AND WHAT HER BLOWS DO ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, ducking: !!pp.ducking, onLedge: onLedgeOf(pp, S.G), pp }));
  function world(e) {
    const say = (line, col) => ctx.number(e.x, Math.min(e.y, S.G.floor) - 70, line, col);
    return {
      say, number: (x, y, t, col) => ctx.number(x, Math.min(y, S.G.floor - 70), t, col), fire: x => !!(ctx.fireAt && ctx.fireAt(x, S.G.floor)),   /* (claude/underwell2) burning floor oil under her burrow */ sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), music: ph => ctx.music && A() && A().music === 'cisternqueen' && ctx.music(ph === 3 ? 'cisternqueen:p3' : 'cisternqueen:p2'),
      mark: m => ctx.number(e.x, (S.pose === 'shaft' ? S.G.vault + 30 : e.y) - (S.pose === 'wall' ? 96 : CQ.markH), m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => {
        if (k === 'erupt' || k === 'dig' || k === 'burst') { ctx.burst(x, y - 8, k === 'dig' ? 10 : 18, ['#c9a46a', '#8a6a3e', '#e8d4a0'], 90, 0.7); ctx.dust(x, y, 10); }
        else if (k === 'splash' || k === 'wake') { ctx.burst(x, y - 6, k === 'wake' ? 3 : 18, ['#7ab8e8', '#e8f4f8', '#3a7ab8'], k === 'wake' ? 40 : 90, 0.6); }
        else if (k === 'venomSplat') ctx.burst(x, y - 3, 8, ['#a6e04a', '#5c8a24'], 50, 0.5);
        else if (k === 'rubble') { ctx.burst(x, y - 6, 10, ['#6a7480', '#4a525c', '#9aa4ae'], 70, 0.6); ctx.dust(x, y, 6); }
        else if (k === 'land' || k === 'stuck') { ctx.dust(x, y, 12); ctx.burst(x, y - 4, 8, ['#c9a46a', '#8a6a3e'], 60, 0.5); }
        else if (k === 'lance') ctx.burst(x, y - 4, 8, ['#ffd36b', '#c9a46a'], 70, 0.4);
        else if (k === 'runoff') ctx.burst(x, y + 10, 14, ['#7ab8e8', '#e8f4f8'], 50, 0.8);
        else if (k === 'flare') { ctx.burst(x, y - 30, 22, ['#ff9a3c', '#ffd36b', '#d84a14'], 90, 0.8); }
        else if (k === 'steam') { ctx.burst(x, y - 30, 20, ['#e8f4f8', '#c8d0d8', '#9aa39a'], 50, 1.0); try { (ctx.sfx.hiss || ctx.sfx.splash)(); } catch {} }
        else if (k === 'stoneLand') ctx.dust(x, y, 3);
        else if (k === 'bloom') { ctx.burst(x, y - 8, 28, ['#a6e04a', '#d6f8a0', '#4e7a24', '#7ab8e8'], 130, 0.8); ctx.burst(x - CQ.bloomR * 0.6, y - 4, 10, ['#a6e04a', '#4e7a24'], 80, 0.6); ctx.burst(x + CQ.bloomR * 0.6, y - 4, 10, ['#a6e04a', '#4e7a24'], 80, 0.6); }   /* (claude/queen4) THE VENOM BLOOM bursts */
        else if (k === 'slamGround') { ctx.burst(x, y - 6, 22, ['#c9a46a', '#8a6a3e', '#ffd36b', '#e8d4a0'], 120, 0.7); ctx.dust(x, y, 16); } },   /* (claude/underwell3) the stinger slam's crater */
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
    else { e.w = CQ.w; e.h = CQ.h; const st = CQG.stingerOut(S); if (st && S.pose === 'floor') e.w = 2 * Math.max(CQ.w / 2, Math.abs(st.x - e.x) + CQ.stingR + 2); }   /* (claude/welltown5: her stuck stinger is part of her - a blow can reach it) */
    e.phase = S.ph; e.burrowed = S.pose === 'burrow';
    /* THE CLAW, struck as it comes (a counter) or while it holds you: the grab is broken and she rears - OPEN */
    const hb = ctx.attackBox();
    if (hb && S.claw && (e.mode === 'grab' || e.mode === 'hold')) { const cl = S.claw;
      if (ctx.overlap(hb, { l: cl.x - 14, r: cl.x + 14, t: S.G.floor - 34, b: S.G.floor })) { if (cl.caught) c.release(cl.caught); S.claw = null; S.n.countered++; S.n.broken++; ctx.sparks(cl.x, S.G.floor - 16, ctx.hero().face || 1, 6);
        CQG.openUp(e, S, 'rear', c); c.number(e.x, e.y - 70, 'THE GRAB IS BROKEN: SHE REARS. CUT HER', '#8fd160'); } }
    /* THE WINDLASS: a blow on it sends the shaft's bucket down */
    if (hb && wl) { const wx = wl.x * ctx.TS + 8, wy = (wl.y + 1) * ctx.TS; if (ctx.overlap(hb, { l: wx - 14, r: wx + 14, t: wy - 26, b: wy })) { if (CQG.strikeWindlass(e, S, c)) ctx.sparks(wx, wy - 14, ctx.hero().face || 1, 5); } }
    /* (claude/underwell3, Daniel 10-07) HER STINGER, WHEREVER IT IS: a blade that meets it (and not her body: that one main.js finds itself) lands on it - the same blow, once a swing */
    if (hb && !CQG.qOpen(e) && ctx.strike) { const tp = CQG.tipOf(e, S); if (tp && ctx.overlap(hb, CQG.tipBox(tp)) && !ctx.overlap(hb, ctx.box(e))) ctx.strike(e); }
    /* HER VENOM wears off, a stack at a time; while it is in you, stamina comes back slower */
    for (const pp of ctx.players) { const v = pp.cqVenom || []; for (let i = 0; i < v.length; i++) v[i] -= dt; pp.cqVenom = v.filter(t => t > 0); pp.venomSlow = Math.max(0.1, 1 - CQ.venom.slow * pp.cqVenom.length); }
    /* THE FIRST TIME: what her claws do, and where the water is */
    if (!S.told.guard && e.mode !== 'wake' && e.mode !== 'sleep') { S.told.guard = 1; ctx.number(e.x, e.y - 90, 'HER STINGER IS HER WEAK SPOT: JUMP AND CUT IT', '#ffd36b'); }   /* (claude/underwell3: was CLAWS TURN BLADES: GO ROUND, OR FLOOD HER - the claws still say GO ROUND when they turn a blow) */
  };
  /* ---------- A BLOW ON HER (claude/welltown5): in an opening x openMul; outside one HER SHELL turns it (0, front or back) - unless it lands on her STUCK
     STINGER (x stingMul, one sting's worth at most stingCap); and in phase two, while she BURNS, her hot shell turns even that ---------- */
  H.take = (e, dmg) => { if (!S) return dmg; const P = ctx.hero();
    if (CQG.shelled(e)) { const st = CQG.stingerOut(S), hb = ctx.attackBox();
      if (S.ward > 0) { e.chipHit = ctx.time(); S.n.guarded++; e.guardFx = 0.2; return 0; }   /* (claude/underwell) HER WARD after an opening: nothing lands, the stinger neither */
      /* (claude/underwell3, Daniel 10-07: "I wanted her STINGER to be the VULNERABLE part") HER STINGER FIRST - stuck in the floor (a sting, the slam: x stingMul, capped a sting), or
         wherever her tail carries it (whole) - and it is never turned, burning or not; then, SCORCHED by the fire on her oil, her whole body (from any side) */
      if (st && hb && ctx.overlap(hb, CQG.stingBox(st))) { const cap = e.maxHp * (st.big ? CQ.plantCap : CQ.stingCap), d = Math.min(dmg * CQ.stingMul, Math.max(0, cap - (S.stingTaken || 0))); S.stingTaken = (S.stingTaken || 0) + d; S.n.stingHits++; if (st.big) S.n.plantHits++;
        ctx.sparks(st.x, st.y - 4, P.face || 1, 6); ctx.burst(st.x, st.y - 4, 6, ['#ffb84a', '#fff2c0'], 60, 0.4);
        if (S.stingTaken >= cap - 0.01 && st.t > 0.2) { st.t = 0.2; ctx.number(st.x, S.G.floor - 40, 'SHE TUGS IT FREE', '#9aa39a'); } return d; }
      { const tp = CQG.tipOf(e, S); if (tp && hb && ctx.overlap(hb, CQG.tipBox(tp))) { S.n.tipHits++; ctx.sparks(tp.x, tp.y, P.face || 1, 7); ctx.burst(tp.x, tp.y, 8, ['#ffb84a', '#fff2c0', '#ffd36b'], 70, 0.45);
        if (!S.told.tip) { S.told.tip = 1; ctx.number(tp.x, tp.y - 20, 'HER STINGER: THAT IS WHERE SHE BLEEDS', '#8fd160'); } return Math.round(dmg * CQ.tipMul); } }
      if (S.scorch > 0) { S.n.scorchHits = (S.n.scorchHits || 0) + 1; ctx.burst(P.x + (P.face || 1) * 12, P.y - 14, 6, ['#ffd36b', '#ff9a3c'], 50, 0.4); return Math.round(dmg * CQ.scorchMul); }
      /* (claude/sweep3, Daniel 10-06 after playing her: SHE IS NEVER FULLY INVULNERABLE - hard to hit, never a wall (B11/B13). Her raised claws turn a blow from
         the FRONT while she stands on the floor (GO ROUND, src/boss-read.js GUARD 'front'); her back and flanks, or her up on a wall or in the shaft, take a
         blow at half (the angle blow, or GREED.chipBy.cisternqueen); burning, her hot shell takes half of that. Her water openings pay CQ.openMul) */
      const claws = S.pose === 'floor' && !(e.gone) && CQG.frontal(e, P.x);
      if (S.burn || S.flare > 0) { S.n.burnTurned++; e.guardFx = 0.2; ctx.burst(P.x + (P.face || 1) * 12, P.y - 14, 5, ['#ff9a3c', '#ffd36b'], 50, 0.4);
        if (!S.told.hot) { S.told.hot = 1; ctx.number(e.x, Math.min(e.y, S.G.floor) - 96, 'HER SHELL BURNS: PUT HER OUT WITH WATER', '#ff9a5c'); } if (claws) { e.chipHit = ctx.time(); return 0; } return Math.round(dmg * CQ.hotMul); }
      if (!claws) { S.n.shellHits = (S.n.shellHits || 0) + 1; return dmg; }   /* her back, her flank, her on a wall: the shell gives (main.js lands it at half) */
      e.chipHit = ctx.time(); S.n.guarded++; e.guardFx = 0.2; if (!S.told.claws) { S.told.claws = 1; ctx.number(e.x, e.y - 80, 'HER CLAWS TURN IT: GO ROUND HER, OR STRIKE HER STINGER', '#9aa39a'); } return 0; }
    if (CQG.qOpen(e)) { const st = CQG.stingerOut(S), hb = ctx.attackBox(), onSt = !!(st && hb && ctx.overlap(hb, CQG.stingBox(st))), cap = e.maxHp * CQ.openCap, d = Math.min(dmg * CQ.openMul * (onSt ? CQ.stingMul : 1), Math.max(0, cap - (S.openTaken || 0))); S.openTaken = (S.openTaken || 0) + d; if (onSt) { S.n.stingHits++; ctx.sparks(st.x, st.y - 4, P.face || 1, 6); }   /* (claude/underwell3) SLIPPED, her stinger flat on the floor: x stingMul on top */
      if (S.openTaken >= cap - 0.01 && e.open > 0.4) { e.open = 0.4; ctx.number(e.x, e.y - 70, 'SHE RIGHTS HERSELF', '#9aa39a'); S.n.capped = (S.n.capped || 0) + 1; } return d; }
    return dmg; };
  /* ---------- THE POUR (src/well-town-hands.js asks: what would a pour land on, and pour it) ---------- */
  const heroOf = P => ({ x: P.x, y: P.y, face: P.face || 1, onLedge: onLedgeOf(P, S && S.G) });
  H.pourable = {
    aim: P => { const e = ctx.boss; if (!S || !ctx.bossActive || !e || e.t !== 'cisternqueen' || !e.alive) return null; return CQG.pourAim(e, S, heroOf(P)); },
    pour: P => { const e = ctx.boss; if (!S || !e || e.t !== 'cisternqueen') return null; const r = CQG.pourAt(e, S, heroOf(P), world(e)); if (r === 'wasted') ctx.number(P.x, P.y - 30, 'IT RUNS INTO THE SAND', '#9aa39a'); return r; },
  };
  H.barName = e => 'THE CISTERN QUEEN' + (CQG.qOpen(e) ? (e.mode === 'soaked' ? '  SOAKED' : e.mode === 'slip' ? '  SLIPPED' : e.mode === 'fallen' ? '  ON HER BACK' : '  REARING') : CQG.qScorched(e) ? '  SCORCHED' : e.mode === 'sslamTell' || e.mode === 'sslam' ? '  STINGER SLAM!' : e.mode === 'bloomTell' || e.mode === 'bloom' || e.mode === 'bloomBurst' ? '  VENOM BLOOM!' : e.mode === 'planted' ? '  STINGER PLANTED' : e.burrowed ? '  BURROWED' : '');   /* (claude/underwell3: SLIPPED - up through wet sand; SCORCHED - the fire on her oil; DRIVEN UP is a scorch now) */
  H.end = e => { if (S) { S.bands = []; S.shots = []; S.rubble = []; S.puddles = []; S.claw = null; S.bloom = null; }
    for (const pp of ctx.players) { pp.cqVenom = []; pp.venomSlow = 1; if (pp.snare > 0) pp.snare = 0; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, pose: S.pose, cycle: S.cycle, n: JSON.parse(JSON.stringify(S.n)), water: S.water, bloom: S.bloom ? S.bloom.st : null, bucket: S.bucket.st, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING ---------- */
  /* her body (from the enemy loop, before the bodies of everyone else are drawn) */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    CQA.drawQueen(g, e, S, R(e.x - cx), R(e.y - cy), time, cx, cy);
    if (S.ward > 0) { const k = 0.5 + 0.5 * Math.sin(time * 9); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#bfe0ff'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(e.x - cx), R(Math.min(e.y, S.G.floor) - 20 - cy), 46, 26, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; } };   /* (claude/underwell) HER WARD: a pale ring, the whole of it */
  /* the hall's machines, behind her: the windlass, the bucket's rope down the shaft, the tunnels, the springs' glint is the wells' own */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    if (wl) CQA.drawWindlass(g, R(wl.x * ctx.TS + 8 - cx), R((wl.y + 1) * ctx.TS - cy), S.bucket, time);
    CQA.drawBucket(g, R(G.mid - cx), R(G.vault - cy), S.bucket, CQ, time);
    CQA.drawTunnels(g, R(G.x0 - cx), R(G.x1 - cx), R(G.floor - cy), S, time); };
  /* over everything: the water, the mound, her tells' marks on the floor (the strike's bulge, the lance's spot, the rubble's shadows, the pounce's
     shadow, the bands lit), what flies, the venom puddles, the claw, her opening's clock */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'cisternqueen') return;
    CQA.drawOver(g, e, S, cx, cy, time, CQ);
    /* B10 (claude/sweep3, Daniel 10-06: make her water openings plain): OPEN is a gold ring round her and a clock that empties over her */
    if (CQG.qOpen(e)) { const x = R(e.x - cx), y = R(Math.min(e.y, S.G.floor) - cy), p = 0.5 + 0.5 * Math.sin(time * 10), k = Math.max(0, Math.min(1, e.open / CQ.openT));
      g.strokeStyle = 'rgba(255,211,107,' + (0.6 + 0.35 * p) + ')'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 20, CQ.w / 2 + 8, 28, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
      g.fillStyle = '#1b1626'; g.fillRect(x - 20, y - 60, 40, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 20, y - 60, R(40 * k), 3); }
    /* B10 (claude/underwell3, Daniel 10-07: her STINGER is the vulnerable part) - OPEN is gold. HER STINGER, wherever her tail carries it, wears a gold ring while a blade
       will land on it (not in her ward); stuck in the floor (a sting, THE SLAM, the slip) a bigger ring, a white star and its clock. SCORCHED by the fire, a gold ring round her body
       and the scorch's clock over her (she fights on) */
    const st = CQG.stingerOut(S), p = 0.5 + 0.5 * Math.sin(time * 12), warded = S.ward > 0;
    if (st && !warded) { const x = R(st.x - cx), y = R(st.y - cy), big = !!st.big;
      g.strokeStyle = 'rgba(255,211,107,' + (0.6 + 0.4 * p) + ')'; g.lineWidth = big ? 2 : 1; g.beginPath(); g.arc(x, y - 2, (big ? 15 : 10) + p * 4, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
      g.fillStyle = '#ffffff'; const k = 2 + Math.round(p * 2); g.fillRect(x, y - 12 - k, 1, 2 * k + 1); g.fillRect(x - k, y - 12, 2 * k + 1, 1);
      const tk = Math.max(0, st.t / ({ slam: CQ.planted, slip: CQ.slipT }[st.k] || CQ.stuck[st.k] || 1)); g.fillStyle = '#1b1626'; g.fillRect(x - 12, y + 6, 24, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 12, y + 6, R(24 * Math.min(1, tk)), 3); }
    else if (!warded && !CQG.qOpen(e)) { const tp = CQG.tipOf(e, S); if (tp) { const x = R(tp.x - cx), y = R(tp.y - cy);
      g.strokeStyle = 'rgba(255,211,107,' + (0.45 + 0.4 * p) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, CQ.tipR - 2 + p * 3, 0, Math.PI * 2); g.stroke(); fr(g, '#fff6c8', x - 1, y - CQ.tipR - 3, 2, 2); } }
    if (CQG.qScorched(e) && !(e.gone > 0)) { const x = R(e.x - cx), y = R(Math.min(e.y, S.G.floor) - cy), k = Math.max(0, Math.min(1, e.scorch / CQ.scorchT));
      g.strokeStyle = 'rgba(255,211,107,' + (0.55 + 0.35 * p) + ')'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 20, CQ.w / 2 + 8, 28, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
      g.fillStyle = '#1b1626'; g.fillRect(x - 20, y - 60, 40, 3); g.fillStyle = '#ff9a3c'; g.fillRect(x - 20, y - 60, R(40 * k), 3); }
    /* HER FIRE: flames over her shell while she burns; sparks gathering while she flares */
    if ((S.burn || S.flare > 0) && !(e.gone && e.mode !== 'pounce')) { const wall = S.pose === 'wall', bx = wall ? e.x - 17 : e.x - CQ.w / 2, bw = wall ? 34 : CQ.w, top = wall ? S.G.floor - 92 : S.G.floor - 40, bh = wall ? 84 : 26, n = S.burn ? 10 : 4;
      for (let i = 0; i < n; i++) { const fx = bx + ((i * 37 + R(time * 3)) % bw), fy = top + ((i * 19) % bh), h = 6 + 5 * Math.abs(Math.sin(time * 9 + i)); g.globalAlpha = S.burn ? 0.9 : 0.5 + 0.5 * Math.sin(time * 20 + i);
        g.fillStyle = i % 2 ? '#ff9a3c' : '#ffd36b'; g.fillRect(R(fx - cx), R(fy - h - cy), 3, R(h)); g.fillStyle = '#d84a14'; g.fillRect(R(fx - cx), R(fy - 2 - cy), 3, 2); } g.globalAlpha = 1; }
  };
  return H;
}
