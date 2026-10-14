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
  skitter: s => (s.chitin || s.step || s.thud)(), thrash: s => (s.wave || s.splash)(), snap: s => (s.crack || s.clank)(), stingBreak: s => (s.stingerBreak || s.crack || s.clank)(), whip: s => (s.slash || s.splash)(),
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
  /* (batch91, claude-cqart.md Q1) THE WELLHEAD PERCH: her tail stood above the top of the boss camera - the arena camera rises ~24 px while she is up on the beam (the camera eases there itself) */
  H.camY = ty => (S && A() && S.pose === 'shaft' && ctx.bossActive && ctx.boss && ctx.boss.alive ? ty - 24 : ty);
  H.owns = e => e.t === 'cisternqueen';
  H.clear = () => { S = null; };
  /* WHAT HURT: the health each of her blows took, by name (the pilots print it) */
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.cqKeys = pp.cqKeys || new Map(); if (pp.cqKeys.size > 80) pp.cqKeys.clear(); if (pp.cqKeys.has(key)) return true; pp.cqKeys.set(key, 1); return false; };
  /* ON A LEDGE: standing on its boards, or at the top of its rope ladder (the ladder's column is the ledge's end) */
const onLedgeOf = (pp, G) => { if (!G || !(pp.ground || pp.climb) || pp.y > G.ledgeY + 4 || pp.y < G.ledgeY - 18) return null; if (pp.x >= G.ledgeW[0] && pp.x <= G.ledgeW[1] + 18) return 'W'; if (pp.x >= G.ledgeE[0] - 18 && pp.x <= G.ledgeE[1]) return 'E'; if (G.beam && pp.x >= G.beam[0] - 4 && pp.x <= G.beam[1] + 4 && pp.y <= G.beamY + 4 && pp.y >= G.beamY - 18) return 'B'; return null; };   /* (claude/cqueenrework: 'B' - up on THE WELLHEAD, her perch) */
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
    e.cqBare = () => { if (!S) return false; const hb = ctx.attackBox(); if (!hb || S.ward > 0 || S.broken) return false; const st = CQG.stingerOut(S); return !!(st && ctx.overlap(hb, CQG.stingBox(st))); };   /* (claude/cqueenrework: her free stinger is armoured outside her openings - a blow there is not the right blow) */
    return e; };

  /* ---------- THE WORLD AS SHE SEES IT, AND WHAT HER BLOWS DO ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, ducking: !!pp.ducking, onLedge: onLedgeOf(pp, S.G), pp }));
  function world(e) {
    const say = (line, col) => ctx.number(e.x, Math.min(e.y, S.G.floor) - 70, line, col);
    return {
      say, number: (x, y, t, col) => ctx.number(x, Math.min(y, S.G.floor - 70), t, col), fire: x => !!(ctx.fireAt && ctx.fireAt(x, S.G.floor)),   /* (claude/underwell2) burning floor oil under her burrow */ sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), music: ph => ctx.music && A() && A().music === 'cisternqueen' && ctx.music(ph === 3 ? 'cisternqueen:p3' : 'cisternqueen:p2'),
      mark: m => ctx.number(e.x, e.y - (S.pose === 'wall' ? 96 : CQ.markH), m, m === '!' ? '#ffd36b' : '#ff6b6b'),   /* (claude/cqueenrework: on the wellhead, over her where she stands) */
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
    if (e.burn > 0 && !(S.scorch > 0)) { if (!CQG.hotOK(e, S)) { CQG.fireOn(e, S, c, 'hero'); e.burn = 0; S.heroHeat = 0; } else if ((S.heroHeat = (S.heroHeat || 0) + dt) >= CQ.heroHeatT) { S.heroHeat = 0; CQG.fireOn(e, S, c, 'hero'); } } else if (S.heroHeat > 0) S.heroHeat = Math.max(0, S.heroHeat - dt * 0.5);   /* (claude/cqueenrework) the pyro's fire must keep on her CQ.heroHeatT s to take her (heat builds, and cools when it stops) */   /* (claude/cqueenrework) THE PYRO'S OWN FIRE lights her as a torch does - and no oftener (wet, blackened: it goes out on her) */
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
    if (!S.told.guard && e.mode !== 'wake' && e.mode !== 'sleep') { S.told.guard = 1; ctx.number(e.x, e.y - 90, 'FIRE ON HER OIL, THEN WATER ON HER: THAT OPENS HER', '#ffd36b'); }   /* (claude/cqueenrework: the loop is her fight's one mechanic - B17) */   /* (claude/underwell3: was CLAWS TURN BLADES: GO ROUND, OR FLOOD HER - the claws still say GO ROUND when they turn a blow) */
  };
  /* ---------- A BLOW ON HER (claude/cqueenrework: B15 - never nothing; this runs inside main.js wardedDamage, AFTER every multiplier, so what it caps is what lands):
     IN AN OPENING (soaked, on her back, rearing, slipped) x openMul, an opening's worth at most CQ.openCap of her.
     HER STINGER (stuck in the floor, or the tip where her tail carries it): stuck, or while she is HOT, x tailOpenMul (a stuck one at most a sting's cap); free and outside her
     openings it is ARMOURED - x tailMul, a clank and WHEN IT STICKS. Every blow on it draws on its PURSE (CQ.tailPurse of her a phase); spent, it BREAKS (src/cistern-queen.js).
     HER BODY: HOT, whole from any side; else her raised claws turn a frontal blow to shellFront (GO ROUND), her back, flanks, her up a wall or on the wellhead shellBack.
     HER WARD (B3, after an opening or a burn-out): everything x wardMul (WARDED) ---------- */
  H.take = (e, dmg, tag) => { if (!S) return dmg; const P = ctx.hero(), c = world(e), hb = tag ? ctx.attackBox() : null, turned = w => { if (ctx.turned && tag) ctx.turned(e, P.x, w); };   /* (a burn tick has no blow: it is her body's) */
    const open = CQG.qOpen(e), hot = CQG.qHot(S), st = CQG.stingerOut(S);
    let tail = null; if (hb && !S.broken) { if (st && ctx.overlap(hb, CQG.stingBox(st))) tail = 'stuck'; else { const tp = CQG.tipOf(e, S); if (tp && ctx.overlap(hb, CQG.tipBox(tp))) tail = 'tip'; } }
    const purse = d => { if (!tail) return d; d = Math.min(d, CQG.tailLeft(e, S)); S.tailTaken = (S.tailTaken || 0) + d; S.n.tailHits = (S.n.tailHits || 0) + 1; S.n.tailDmg = (S.n.tailDmg || 0) + d;
      if (CQG.tailLeft(e, S) <= 0.01) CQG.breakStinger(e, S, c); return d; };
    const spark = () => { const at = tail === 'stuck' ? { x: st.x, y: st.y - 4 } : tail === 'tip' ? CQG.tipOf(e, S) : null; if (at) { ctx.sparks(at.x, at.y, P.face || 1, 6); ctx.burst(at.x, at.y, 6, ['#ffb84a', '#fff2c0'], 60, 0.4); } };
    if (open) { const cap = e.maxHp * CQ.openCap, d = purse(Math.min(dmg * CQ.openMul, Math.max(0, cap - (S.openTaken || 0)))); S.openTaken = (S.openTaken || 0) + d; if (tail) { S.n.stingHits++; spark(); }
      if (S.openTaken >= cap - 0.01 && e.open > 0.4) { e.open = 0.4; ctx.number(e.x, e.y - 70, 'SHE RIGHTS HERSELF', '#9aa39a'); S.n.capped = (S.n.capped || 0) + 1; } return d; }
    if (S.ward > 0) { S.n.guarded++; e.guardFx = 0.2; turned('WARDED'); return purse(dmg * CQ.wardMul); }   /* (claude/cqueenrework, B15: her ward turns most of it, never all) */
    if (tail === 'stuck') { const capS = e.maxHp * (st.big ? CQ.plantCap : CQ.stingCap), d = purse(Math.min(dmg * CQ.tailOpenMul, Math.max(0, capS - (S.stingTaken || 0)))); S.stingTaken = (S.stingTaken || 0) + d; S.n.stingHits++; if (st.big) S.n.plantHits++; spark();
      if (S.stingTaken >= capS - 0.01 && st.t > 0.2 && !S.broken) { st.t = 0.2; ctx.number(st.x, S.G.floor - 40, 'SHE TUGS IT FREE', '#9aa39a'); } return d; }
    if (tail === 'tip') { S.n.tipHits++; spark(); if (hot) { if (!S.told.tip) { S.told.tip = 1; ctx.number(P.x, P.y - 40, 'HER STINGER: THAT IS WHERE SHE BLEEDS', '#8fd160'); } return purse(dmg * CQ.tailOpenMul); }
      S.n.tipArmoured = (S.n.tipArmoured || 0) + 1; e.guardFx = 0.2; turned('WHEN IT STICKS'); return purse(dmg * CQ.tailMul); }
    if (hot) { S.n.scorchHits = (S.n.scorchHits || 0) + 1; ctx.burst(P.x + (P.face || 1) * 12, P.y - 14, 6, ['#ffd36b', '#ff9a3c'], 50, 0.4); return dmg * CQ.scorchMul; }
    const claws = S.pose === 'floor' && !(e.gone) && CQG.frontal(e, P.x) && !!tag;
    if (claws) { S.n.guarded++; e.guardFx = 0.2; turned('GO ROUND'); if (!S.told.claws) { S.told.claws = 1; ctx.number(e.x, e.y - 80, 'HER CLAWS TURN IT: GO ROUND HER, OR STRIKE HER STINGER', '#9aa39a'); } return dmg * CQ.shellFront; }
    S.n.shellHits = (S.n.shellHits || 0) + 1; return dmg * CQ.shellBack; };
  /* ---------- THE POUR (src/well-town-hands.js asks: what would a pour land on, and pour it) ---------- */
  const heroOf = P => ({ x: P.x, y: P.y, face: P.face || 1, onLedge: onLedgeOf(P, S && S.G) });
  H.pourable = {
    aim: P => { const e = ctx.boss; if (!S || !ctx.bossActive || !e || e.t !== 'cisternqueen' || !e.alive) return null; return CQG.pourAim(e, S, heroOf(P)); },
    pour: P => { const e = ctx.boss; if (!S || !e || e.t !== 'cisternqueen') return null; const r = CQG.pourAt(e, S, heroOf(P), world(e)); if (r === 'wasted') ctx.number(P.x, P.y - 30, 'IT RUNS INTO THE SAND', '#9aa39a'); return r; },
  };
  H.barName = e => 'THE CISTERN QUEEN' + (CQG.qOpen(e) ? (e.mode === 'soaked' ? '  SOAKED' : e.mode === 'slip' ? '  SLIPPED' : e.mode === 'fallen' ? '  ON HER BACK' : '  REARING') : CQG.qScorched(e) ? '  SCORCHED: HOT' : S && S.broken && e.mode === 'reel' ? '  STINGER BROKEN' : S && CQG.qWet(S) ? '  DOUSED' : e.mode === 'sslamTell' || e.mode === 'sslam' ? '  STINGER SLAM!' : e.mode === 'bloomTell' || e.mode === 'bloom' || e.mode === 'bloomBurst' ? '  VENOM BLOOM!' : e.mode === 'planted' ? '  STINGER PLANTED' : e.burrowed ? '  BURROWED' : '');   /* (claude/underwell3: SLIPPED - up through wet sand; SCORCHED - the fire on her oil; DRIVEN UP is a scorch now) */
  H.end = e => { if (S) { S.bands = []; S.shots = []; S.rubble = []; S.puddles = []; S.claw = null; S.bloom = null; }
    for (const pp of ctx.players) { pp.cqVenom = []; pp.venomSlow = 1; if (pp.snare > 0) pp.snare = 0; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, pose: S.pose, cycle: S.cycle, hot: +(S.scorch || 0).toFixed(2), wet: +(S.wet || 0).toFixed(2), char: +(S.charT || 0).toFixed(2), broken: !!S.broken, tailLeft: ctx.boss ? +CQG.tailLeft(ctx.boss, S).toFixed(1) : 0, n: JSON.parse(JSON.stringify(S.n)), water: S.water, bloom: S.bloom ? S.bloom.st : null, bucket: S.bucket.st, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING ---------- */
  /* her body (from the enemy loop, before the bodies of everyone else are drawn) */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    CQA.drawQueen(g, e, S, R(e.x - cx), R(e.y - cy), time, cx, cy);
    if (S.ward > 0) { const k = 0.5 + 0.5 * Math.sin(time * 9); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#bfe0ff'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(e.x - cx), R(Math.min(e.y, S.G.floor) - 20 - cy), 46, 26, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; } };   /* (claude/underwell) HER WARD: a pale ring, the whole of it */
  /* the hall's machines, behind her: the windlass, the bucket's rope down the shaft, the tunnels, the springs' glint is the wells' own */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    if (wl) CQA.drawWindlass(g, R(wl.x * ctx.TS + 8 - cx), R((wl.y + 1) * ctx.TS - cy), S.bucket, time);
    CQA.drawWellhead(g, G, cx, cy, S.bucket, CQ, time);   /* (claude/cqart) THE WELLHEAD: the stone lintel, the curb and the sheave's frame, and the bucket tipping its water on them */
    CQA.drawBucket(g, R(G.mid - cx), R(G.vault - cy), S.bucket, CQ, time, R(G.beamY - cy));
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
    else if (!warded && !CQG.qOpen(e)) { const tp = CQG.tipOf(e, S); if (tp) { const x = R(tp.x - cx), y = R(tp.y - cy), pays = CQG.qHot(S), rr = CQ.tipR - 2;   /* (claude/cqueenrework, B10; claude/cqart: told by SHAPE as well as colour) it PAYS (HOT): a round gold ring and a pale star. It is ARMOURED: four cold steel corner-brackets, a plate not a ring, and a glint that slides across them */
      if (pays) { g.strokeStyle = 'rgba(255,211,107,' + (0.55 + 0.4 * p) + ')'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, rr + p * 3, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; fr(g, '#fff6c8', x - 1, y - rr - 5, 2, 4); fr(g, '#fff6c8', x - 3, y - rr - 3, 6, 1); }
      else { g.fillStyle = 'rgba(200,214,228,' + (0.55 + 0.25 * p) + ')'; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { fr(g, x + sx * rr - (sx > 0 ? 4 : 0), y + sy * rr - (sy > 0 ? 0 : 0), 5, 1); fr(g, x + sx * rr - (sx > 0 ? 0 : 0), y + sy * rr - (sy > 0 ? 4 : 0), 1, 5); }
        const gl = (time * 22) % (rr * 4); if (gl < rr * 2) { g.globalAlpha = 0.9; fr(g, '#eef4fa', x - rr + gl, y - rr + gl * 0.5, 2, 2); g.globalAlpha = 1; } } } }
    if (CQG.qScorched(e) && !(e.gone > 0)) { const x = R(e.x - cx), y = R(Math.min(e.y, S.G.floor) - cy), k = Math.max(0, Math.min(1, e.scorch / CQ.scorchT));
      g.strokeStyle = 'rgba(255,211,107,' + (0.55 + 0.35 * p) + ')'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 20, CQ.w / 2 + 8, 28, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
      g.fillStyle = '#1b1626'; g.fillRect(x - 20, y - 60, 40, 3); g.fillStyle = '#ff9a3c'; g.fillRect(x - 20, y - 60, R(40 * k), 3); }
    /* HER FIRE: flames over her shell while she burns; sparks gathering while she flares */
    if (CQG.qHot(S) && !(e.gone && e.mode !== 'pounce')) { const wall = S.pose === 'wall', bx = wall ? e.x - 17 : e.x - CQ.w / 2, bw = wall ? 34 : CQ.w, top = wall ? S.G.floor - 92 : e.y - 40, bh = wall ? 84 : 26, n = 7;
      for (let i = 0; i < n; i++) { const fx = bx + ((i * 37 + R(time * 3)) % bw), fy = top + ((i * 19) % bh), h = 5 + 4 * Math.abs(Math.sin(time * 9 + i)); g.globalAlpha = 0.9;
        { const X0 = R(fx - cx), Y0 = R(fy - cy), hh = R(h + 2);   /* (claude/cqart) a tongue, not a candle: a red base, an orange body, a gold heart, a pale tip */
          fr(g, '#d84a14', X0 - 1, Y0 - 2, 5, 3); fr(g, '#ff7a22', X0, Y0 - R(hh * 0.55), 3, R(hh * 0.55)); fr(g, '#ffb84a', X0 + (i % 2), Y0 - R(hh * 0.85), 2, R(hh * 0.4)); fr(g, '#fff2c0', X0 + 1, Y0 - hh, 1, 2); } } g.globalAlpha = 1; }
    /* (claude/cqart) BLACKENED: smoke curls off the burnt shell, flakes of ash drift down, and a grey clock says how long until fire can take her again */
    if (S.charT > 0 && !CQG.qHot(S) && !CQG.qWet(S) && !(e.gone > 0)) { const wall = S.pose === 'wall', bx = wall ? e.x - 17 : e.x - CQ.w / 2, bw = wall ? 34 : CQ.w, top = wall ? S.G.floor - 92 : e.y - 40, k0 = Math.max(0, Math.min(1, S.charT / CQ.charT));
      for (let i = 0; i < 5; i++) { const k = (time * 0.4 + i * 0.2) % 1, sx = bx + 6 + ((i * 41) % (bw - 12)) + Math.sin(time * 2 + i * 1.7) * 3, sy = top + 6 - k * 34; g.globalAlpha = 0.5 * k0 * (1 - k); g.fillStyle = i % 2 ? '#6a625a' : '#8a8279'; g.beginPath(); g.ellipse(R(sx - cx), R(sy - cy), 2.5 + k * 4, 2 + k * 3, 0, 0, Math.PI * 2); g.fill(); }
      for (let i = 0; i < 6; i++) { const k = (time * 0.55 + i * 0.17) % 1; g.globalAlpha = 0.7 * k0 * (1 - k); fr(g, i % 2 ? '#b8afa4' : '#7a7268', R(bx + ((i * 37) % bw) - cx), R(top + 4 + k * 44 - cy), 1, 1); }
      g.globalAlpha = 1; const x = R(e.x - cx), y = R(Math.min(e.y, S.G.floor) - cy); g.fillStyle = '#1b1626'; g.fillRect(x - 20, y - 66, 40, 2); g.fillStyle = '#8a8279'; g.fillRect(x - 20, y - 66, R(40 * k0), 2); }
    /* (claude/cqueenrework) DOUSED: water runs off her - drips falling from her shell, a blue sheen line along her back, and the clock of it (blue) */
    if (CQG.qWet(S) && !CQG.qOpen(e) && !(e.gone > 0)) { const wall = S.pose === 'wall', bx = wall ? e.x - 17 : e.x - CQ.w / 2, bw = wall ? 34 : CQ.w, top = wall ? S.G.floor - 92 : e.y - 38;
      for (let i = 0; i < 11; i++) { const fx = bx + 4 + ((i * 29) % (bw - 8)), k = (time * 1.5 + i * 0.37) % 1, fy = top + 8 + k * k * (wall ? 80 : 40); g.globalAlpha = 0.9 * (1 - k * 0.5); fr(g, '#2a5a8a', R(fx - cx) - 1, R(fy - cy), 4, 4); fr(g, '#7ab8e8', R(fx - cx), R(fy - cy), 2, 3 + R(k * 3)); fr(g, '#e8f4f8', R(fx - cx), R(fy - cy), 1, 1); }   /* (claude/cqart) beads that swell, let go and fall faster */
      g.globalAlpha = 1;
      const x = R(e.x - cx), y = R(Math.min(e.y, S.G.floor) - cy), k = Math.max(0, Math.min(1, S.wet / CQ.douseT)); g.fillStyle = '#1b1626'; g.fillRect(x - 20, y - 66, 40, 2); g.fillStyle = '#7ab8e8'; g.fillRect(x - 20, y - 66, R(40 * k), 2); }
  };
  return H;
}
