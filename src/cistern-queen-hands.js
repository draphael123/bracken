// src/cistern-queen-hands.js - THE CISTERN QUEEN's HANDS (claude/welltown3). src/cistern-queen.js is the fight (pure: her three phases, her cycles,
// her openings, the bot's reading); this binds it to the world: her told blows on the heroes (keyed once a blow, a shield turns only the yellow ones,
// a duck goes under the high bands), her claw's grab (the game's own P.snare: mash out, or strike the claw), the pour (src/well-town-hands.js asks pourables()), the windlass and the shaft's bucket, her VENOM on the heroes' stamina (P.venomSlow,
// read by main.js's stamina regen), and the drawing (src/redraw/cistern_queen_art.js draws her; this draws the hall's machines and her tells).
// main.js calls: spawnBoss, owns, update, take, pourable, draw, drawOver, barName, end, read, show, clear. Every teaching line goes through ctx.number
// with a line listed in src/hint-lines.js.
import * as CQG from './cistern-queen.js';
import * as CQA from './redraw/cistern_queen_art.js';
import * as APL from './arena-polish.js';   /* (claude/arenapolish) the hall's wall lamps */
import * as CT from './carry-throw.js';   /* (claude/cisternqueen3) HER WATER JARS fly the jug's told arc (THROW_KIND.jug, the Burning Village's light water) */
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
    /* (claude/cisternqueen3) THE WATER JARS: a rack by each spring (the springs fill them), one jar each - E takes it, ATTACK throws it; the rack is filled again CQ.jarBack s after */
    S.racks = [{ x: S.G.basinW + 32, full: true, t: 0 }, { x: S.G.basinE - 32, full: true, t: 0 }]; S.jars = []; S.splashes = []; for (const pp of ctx.players) if (isJar(pp.carry)) pp.carry = null;
    const e = { ...base, t: 'cisternqueen', w: CQ.w, h: CQ.h, hp: ctx.EHP.cisternqueen, maxHp: ctx.EHP.cisternqueen, noGrav: true, markH: CQ.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.x = base.x; e.y = S.G.floor; for (const pp of ctx.players) { pp.cqKeys = null; pp.cqVenom = []; pp.venomSlow = 1; }
    /* (claude/underwell3) IS THIS BLOW ON HER STINGER? asked by src/boss-greed.js OPEN_RULE as the blow lands (a blow on the stinger is the right blow: never chipped, never greed) */
    e.cqBare = () => { if (!S) return false; const hb = ctx.attackBox(); if (!hb || S.ward > 0) return false; const st = CQG.stingerOut(S); if (st) return ctx.overlap(hb, CQG.stingBox(st)); const tp = CQG.tipOf(e, S); return !!(tp && tipPays(e) && ctx.overlap(hb, CQG.tipBox(tp))); };   /* (claude/cisternqueen3: her STINGER is how you hurt her - a blow on it, stuck or free (under its cap), is the right blow) */
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
    if (!S.told.guard && e.mode !== 'wake' && e.mode !== 'sleep') { S.told.guard = 1; ctx.number(e.x, e.y - 90, 'STRIKE THE STINGER', '#ffd36b'); }   /* (claude/cisternqueen3, Daniel 10-14: her stinger is how you hurt her - said first) */
    /* (claude/cisternqueen3) THE OTHER TWO RULES, said where they are used: she steps onto her hall's oil while fire can take her - SET HER ALIGHT; a hero by a full jar rack - TAKE A JAR */
    if (!S.told.alight && S.pose === 'floor' && !(e.gone > 0) && CQG.hotOK(e, S) && oilUnder(e)) { S.told.alight = 1; ctx.number(e.x, e.y - 90, 'SET HER ALIGHT: SHE FALLS', '#ffb070'); }
    if (!S.told.jar && S.ph === 1) for (const pp of ctx.players) { const r = S.racks.find(q => q.full && Math.abs(q.x - pp.x) < 40 && Math.abs(S.G.floor - pp.y) < 20); if (r && !pp.carry) { S.told.jar = 1; ctx.number(r.x, S.G.floor - 40, 'E TAKES A JAR: THROW IT AS SHE SURFACES', '#7ab8e8'); break; } }
    stepJars(e, dt, c);
  };
  /* ---------- A BLOW ON HER (claude/cqueenrework: B15 - never nothing; this runs inside main.js wardedDamage, AFTER every multiplier, so what it caps is what lands):
     IN AN OPENING (soaked, on her back, rearing, slipped) x openMul, an opening's worth at most CQ.openCap of her.
     HER STINGER (stuck in the floor, or the tip where her tail carries it): stuck, or while she is HOT, x tailOpenMul (a stuck one at most a sting's cap); free and outside her
     openings it is ARMOURED - x tailMul, a clank and WHEN IT STICKS. Every blow on it draws on its PURSE (CQ.tailPurse of her a phase); spent, it BREAKS (src/cistern-queen.js).
     HER BODY: HOT, whole from any side; else her raised claws turn a frontal blow to shellFront (GO ROUND), her back, flanks, her up a wall or on the wellhead shellBack.
     HER WARD (B3, after an opening or a burn-out): everything x wardMul (WARDED) ---------- */
  H.take = (e, dmg, tag) => { if (!S) return dmg; const P = ctx.hero(), hb = tag ? ctx.attackBox() : null, turned = w => { if (ctx.turned && tag) ctx.turned(e, P.x, w); };   /* (a burn tick has no blow: it is her body's) */
    const open = CQG.qOpen(e), st = CQG.stingerOut(S);
    let tail = null; if (hb) { if (st && ctx.overlap(hb, CQG.stingBox(st))) tail = 'stuck'; else { const tp = CQG.tipOf(e, S); if (tp && ctx.overlap(hb, CQG.tipBox(tp))) tail = 'tip'; } }
    const spark = () => { const at = tail === 'stuck' ? { x: st.x, y: st.y - 4 } : tail === 'tip' ? CQG.tipOf(e, S) : null; if (at) { ctx.sparks(at.x, at.y, P.face || 1, 6); ctx.burst(at.x, at.y, 6, ['#ffb84a', '#fff2c0'], 60, 0.4); } };
    if (tail) S.n.tailHits = (S.n.tailHits || 0) + 1;
    /* IN AN OPENING her tail is on the floor: the stinger x openMul, her body x openBody - an opening's worth at most CQ.openCap of her */
    if (open) { const cap = e.maxHp * CQ.openCap, d = Math.min(dmg * (tail ? CQ.openMul : CQ.openBody), Math.max(0, cap - (S.openTaken || 0))); S.openTaken = (S.openTaken || 0) + d; if (tail) { S.n.stingHits++; spark(); }
      if (S.openTaken >= cap - 0.01 && e.open > 0.4) { e.open = 0.4; ctx.number(e.x, e.y - 70, 'SHE RIGHTS HERSELF', '#9aa39a'); S.n.capped = (S.n.capped || 0) + 1; } return d; }
    if (S.ward > 0) { S.n.guarded++; e.guardFx = 0.2; turned('WARDED'); return dmg * CQ.wardMul; }   /* (B15: her ward turns most of it, never all) */
    if (tail === 'stuck') { const capS = e.maxHp * (st.big ? CQ.plantCap : CQ.stingCap), d = Math.min(dmg * CQ.tailOpenMul, Math.max(0, capS - (S.stingTaken || 0))); S.stingTaken = (S.stingTaken || 0) + d; S.n.stingHits++; if (st.big) S.n.plantHits++; spark();
      if (S.stingTaken >= capS - 0.01 && st.t > 0.2) { st.t = 0.2; ctx.number(st.x, S.G.floor - 40, 'SHE TUGS IT FREE', '#9aa39a'); } return d; }
    /* HER FREE STINGER (claude/cisternqueen3): whole, up to CQ.tipCap of her a move; past that she curls it away - B15's floor, told */
    if (tail === 'tip') { S.n.tipHits++; spark(); if (S.tipAct !== S.act) { S.tipAct = S.act; S.tipTaken = 0; } const cap = e.maxHp * CQ.tipCap, room = Math.max(0, cap - S.tipTaken);
      if (room > 0.01) { const d = Math.min(dmg * CQ.tipMul, room) + Math.max(0, dmg * CQ.tipMul - room) * CQ.tailMul; S.tipTaken += d; S.n.tipDmg = (S.n.tipDmg || 0) + d; if (!S.told.tip) { S.told.tip = 1; ctx.number(P.x, P.y - 40, 'HER STINGER: THAT IS WHERE SHE BLEEDS', '#8fd160'); } return d; }
      S.n.tipCurled = (S.n.tipCurled || 0) + 1; e.guardFx = 0.2; turned('SHE CURLS IT AWAY'); return dmg * CQ.tailMul; }
    /* HER SHELL AND CLAWS: B15's floor, and the clank says what to do */
    const claws = S.pose === 'floor' && !(e.gone) && CQG.frontal(e, P.x) && !!tag; S.n.guarded++; if (tag) { e.guardFx = 0.2; turned('STRIKE THE STINGER'); }
    if (!S.told.claws && tag) { S.told.claws = 1; ctx.number(e.x, e.y - 80, 'HER SHELL TURNS IT: STRIKE THE STINGER', '#9aa39a'); }
    if (!claws) S.n.shellHits = (S.n.shellHits || 0) + 1; return dmg * (claws ? CQ.shellFront : CQ.shellBack); };
  /* does a blow on her free stinger pay whole now (outside her ward, under this move's cap)? - the art's gold, the greed rule */
  const tipPays = e => !!S && !(S.ward > 0) && (S.tipAct !== S.act || S.tipTaken < e.maxHp * CQ.tipCap - 0.01);
  H.tipPays = e => tipPays(e);
  /* ---------- THE WATER JARS (claude/cisternqueen3, Daniel 10-14 "throw water when she comes out of a burrow so she slips") ----------
     E at a full rack (or at a jar set down) takes one; carried, it shows the told arc (src/carry-throw.js, the jug's: UP lobs, DOWN tosses short); ATTACK throws it (main.js
     throwCarry). Where it reaches her or the floor the water lands: as she bursts out of the sand she SLIPS (src/cistern-queen.js waterAt), else a splash. A blow spills it */
  function isJar(q) { return !!(q && q.t === 'cqjar'); }
  const heldJar = P => (P && isJar(P.carry) ? P.carry : null);
  const handAt = P => ({ x: P.x + (P.face || 1) * 6, y: P.y - 20 });
  const solidPx = (px, py, falling) => { if (!ctx.cellGet || !ctx.T) return py >= S.G.floor; const tx = Math.floor(px / 16), ty = Math.floor(py / 16), t = ctx.cellGet(tx, ty);
    if (t === ctx.T.SOLID) return true; if (falling && t === ctx.T.ONEWAY && py - ty * 16 < 6) return true; return false; };
  /* the water reaches her (as she bursts out: the spot or her body; at any other time her body is in the way) */
  const jarStop = (x, y) => { const e = ctx.boss; if (!e || !e.alive || !S) return null; const b = CQG.burstAt(e, S); if (b && Math.abs(x - b.x) <= CQ.burstR * 0.6 && y >= S.G.floor - 60) return 'her';
    if (S.pose === 'floor' && !(e.gone > 0) && Math.abs(x - e.x) < CQ.w / 2 && y > e.y - 40 && y < e.y) return 'her'; return null; };
  const arcFrom = (P, keys) => { const h = handAt(P), v = CT.launchOf('jug', P, keys || {}); return CT.predictArc('jug', h.x, h.y, v, solidPx, { stopAt: jarStop }); };
  H.arcFor = (P, aim) => arcFrom(P, { up: aim === 'high', down: aim === 'low' });
  const newJar = (P, rack) => ({ t: 'cqjar', thrKind: 'jug', state: 'held', holder: P, x: P.x, y: P.y - 20, vx: 0, vy: 0, lieT: 0, noClimb: true, rack, hurtWas: P.hurt > 0,
    launch: PP => CT.launchOf('jug', PP, ctx.keys ? ctx.keys() : {}) });
  /* E: set a carried jar down; take a jar set down, or one off a full rack (a pour on her bursting out, in front of you, comes first) */
  H.interact = P => { if (!S || !A() || !ctx.bossActive) return false;
    const h = heldJar(P); if (h) { P.carry = null; h.state = 'lie'; h.holder = null; h.x = P.x + (P.face || 1) * 8; h.y = S.G.floor; h.lieT = 8; return true; }
    if (P.carry || P.dead) return false; if (P.skin && P.skin.sips > 0 && H.pourable.aim(P)) return false;
    const lying = S.jars.find(q => q.state === 'lie' && Math.abs(q.x - P.x) <= 14 && Math.abs(q.y - P.y) <= 18), rack = lying ? null : S.racks.find(q => q.full && Math.abs(q.x - P.x) <= 14 && Math.abs(S.G.floor - P.y) <= 18);
    if (!lying && !rack) return false;
    let q = lying; if (q) { q.state = 'held'; q.holder = P; q.hurtWas = P.hurt > 0; } else { q = newJar(P, rack); S.jars.push(q); rack.full = false; rack.t = CQ.jarBack; }
    P.carry = q; S.n.jarsTaken = (S.n.jarsTaken || 0) + 1; try { ctx.sfx.clank && ctx.sfx.clank(); } catch {} ctx.burst(P.x, P.y - 22, 6, ['#7ab8e8', '#e8f4f8'], 30, 0.4);
    if (!S.told.jarThrow) { S.told.jarThrow = 1; ctx.number(P.x, P.y - 34, 'ATTACK THROWS IT: UP LOBS IT, DOWN TOSSES IT SHORT', '#7ab8e8'); } return true; };
  const jarLands = (q, x, y, c) => { q.state = 'gone'; const e = ctx.boss; (S.splashes || (S.splashes = [])).push({ x, y, fy: y + CT.KINDS.jug.r, t: 0 });   /* (claude/cq3art) the shatter's picture: src/redraw/cistern_queen_art.js drawShatter */
 ctx.burst(x, y - 4, 16, ['#7ab8e8', '#e8f4f8', '#3a7ab8'], 90, 0.6); try { (ctx.sfx.splash || ctx.sfx.clank)(); } catch {}
    S.n.jarLands = (S.n.jarLands || 0) + 1; S.lastJar = { x: Math.round(x), y: Math.round(y) }; if (e && e.alive && e.t === 'cisternqueen') { const r = CQG.waterAt(e, S, x, y, c, 'jar'); if (r === 'open') S.n.jarHits = (S.n.jarHits || 0) + 1; } };
  function stepJars(e, dt, c) {
    for (const r of S.racks) if (!r.full) { r.t -= dt; if (r.t <= 0) { r.full = true; r.t = 0; } }
    if (S.splashes && S.splashes.length) { for (const sp of S.splashes) sp.t += dt / 0.9; S.splashes = S.splashes.filter(sp => sp.t < 1); }
    for (const q of S.jars) {
      if (q.state === 'held') { const P = q.holder;
        if (!P || P.dead || P.carry !== q) { if (P && P.carry === q) P.carry = null; q.state = P && P.dead ? 'gone' : 'lie'; q.lieT = 8; q.holder = null; q.y = S.G.floor; continue; }
        if (P.hurt > 0 && !q.hurtWas) { P.carry = null; q.state = 'gone'; ctx.burst(P.x, P.y - 6, 12, ['#7ab8e8', '#e8f4f8'], 60, 0.5); S.n.jarSpilt = (S.n.jarSpilt || 0) + 1; (S.splashes || (S.splashes = [])).push({ x: P.x, y: P.y - 6, fy: P.y, t: 0, soft: true }); continue; }   /* a blow spills it */
        q.hurtWas = P.hurt > 0; const h = handAt(P); q.x = h.x; q.y = h.y; continue; }
      if (q.state === 'fly') { if (!q.counted) { q.counted = true; S.n.jarThrows = (S.n.jarThrows || 0) + 1; } q.holder = null; const px = q.x, py = q.y; CT.stepArc(q, dt, CT.KINDS.jug.g);
        if (jarStop(q.x, q.y)) { jarLands(q, q.x, q.y, c); continue; }
        if (solidPx(q.x + Math.sign(q.vx) * CT.KINDS.jug.r, py, false) && !solidPx(px, py, false)) { jarLands(q, px, py, c); continue; }
        if (q.vy < 0 && solidPx(q.x, q.y - CT.KINDS.jug.r, false)) q.vy = 0;
        if (q.vy >= 0 && solidPx(q.x, q.y + CT.KINDS.jug.r, true)) { jarLands(q, q.x, q.y, c); continue; }
        if (q.y > S.G.floor + 64) q.state = 'gone'; continue; }
      if (q.state === 'lie') { q.lieT -= dt; if (q.lieT <= 0) q.state = 'gone'; } }
    S.jars = S.jars.filter(q => q.state !== 'gone'); }
  /* the bot's view of the jars (src/lab.js): one in hand, the racks, where an aim would land */
  H.jarView = P => (S ? { held: !!heldJar(P), racks: S.racks.map(r => ({ x: r.x, full: r.full })), lying: S.jars.filter(q => q.state === 'lie').map(q => ({ x: q.x })), land: aim => { const a = H.arcFor(P, aim); return a && a.land ? a.land.x : null; } } : null);
  /* her hall's floor oil under her, as the Underwell's hands hold it (for the first-time line) */
  const oilUnder = e => { const L = ctx.oilCells ? ctx.oilCells() : null; if (!L) return false; const fy = Math.floor(S.G.floor / 16) - 1;
    return L.some(q => q.arena && !q.vertical && q.st === 'oil' && q.y === fy && Math.abs(q.x * 16 + 8 - e.x) < CQ.w / 2); };
  /* ---------- THE POUR (src/well-town-hands.js asks: what would a pour land on, and pour it) ---------- */
  const heroOf = P => ({ x: P.x, y: P.y, face: P.face || 1, onLedge: onLedgeOf(P, S && S.G) });
  H.pourable = {
    aim: P => { const e = ctx.boss; if (!S || !ctx.bossActive || !e || e.t !== 'cisternqueen' || !e.alive) return null; return CQG.pourAim(e, S, heroOf(P)); },
    pour: P => { const e = ctx.boss; if (!S || !e || e.t !== 'cisternqueen') return null; const r = CQG.pourAt(e, S, heroOf(P), world(e)); if (r === 'wasted') ctx.number(P.x, P.y - 30, 'IT RUNS INTO THE SAND', '#9aa39a'); return r; },
  };
  H.barName = e => 'THE CISTERN QUEEN' + (CQG.qOpen(e) ? (e.mode === 'soaked' ? '  SOAKED' : e.mode === 'slip' || e.mode === 'fallen' ? '  ON HER BACK' : e.mode === 'ablaze' ? '  ABLAZE: STUNNED' : '  REARING') : e.mode === 'thrash' ? '  ABLAZE!' : e.mode === 'sslamTell' || e.mode === 'sslam' ? '  STINGER SLAM!' : e.mode === 'bloomTell' || e.mode === 'bloom' || e.mode === 'bloomBurst' ? '  VENOM BLOOM!' : e.mode === 'planted' ? '  STINGER PLANTED' : e.burrowed ? '  BURROWED' : S && S.charT > 0 && !S.flood ? '  BLACKENED' : '');   /* (claude/cisternqueen3: ABLAZE - thrashing, then stunned; ON HER BACK - she slipped, or fell; BLACKENED - no fire yet) */
  H.end = e => { if (S) { S.bands = []; S.shots = []; S.rubble = []; S.puddles = []; S.claw = null; S.bloom = null; S.jars = []; S.splashes = []; }
    for (const pp of ctx.players) { pp.cqVenom = []; pp.venomSlow = 1; if (pp.snare > 0) pp.snare = 0; if (isJar(pp.carry)) pp.carry = null; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, pose: S.pose, cycle: S.cycle, alight: +(S.scorch || 0).toFixed(2), char: +(S.charT || 0).toFixed(2), surf: +(S.surfT || 0).toFixed(2), racks: S.racks.map(r => r.full), jars: S.jars.map(q => q.state), lastJar: S.lastJar || null, n: JSON.parse(JSON.stringify(S.n)), water: S.water, bloom: S.bloom ? S.bloom.st : null, bucket: S.bucket.st, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING ---------- */
  /* her body (from the enemy loop, before the bodies of everyone else are drawn) */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    CQA.drawQueen(g, e, S, R(e.x - cx), R(e.y - cy), time, cx, cy);
    if (S.ward > 0) { const k = 0.5 + 0.5 * Math.sin(time * 9); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#bfe0ff'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(e.x - cx), R(Math.min(e.y, S.G.floor) - 20 - cy), 46, 26, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; } };   /* (claude/underwell) HER WARD: a pale ring, the whole of it */
  /* the hall's machines, behind her: the windlass, the bucket's rope down the shaft, the tunnels, the springs' glint is the wells' own */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    if (wl) CQA.drawWindlass(g, R(wl.x * ctx.TS + 8 - cx), R((wl.y + 1) * ctx.TS - cy), S.bucket, time);
    APL.drawWallLamps(g, G, S, cx, cy, time);   /* (claude/arenapolish, audit #6) lit oil lamps in the niches: out in the flood, flaring when she burns */
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
      if (big) CQA.drawTargetCue(g, x, y, R(S.G.floor - cy), time, p);   /* (claude/cq3art) a gold light on the floor under it and an arrow bobbing over it: the tail on the floor IS the target */
      const tk = Math.max(0, st.t / ({ slam: CQ.planted, slip: CQ.slipT, ablaze: CQ.ablazeT, fallen: CQ.openT, rear: CQ.openT, soaked: CQ.openT }[st.k] || CQ.stuck[st.k] || 1)); g.fillStyle = '#1b1626'; g.fillRect(x - 12, y + 6, 24, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 12, y + 6, R(24 * Math.min(1, tk)), 3); }
    else if (!warded && !CQG.qOpen(e)) { const tp = CQG.tipOf(e, S); if (tp) { const x = R(tp.x - cx), y = R(tp.y - cy), pays = tipPays(e), rr = CQ.tipR - 2;   /* (claude/cqart: told by SHAPE as well as colour; claude/cisternqueen3: it PAYS whenever it is out - gold; steel only once she has curled it away for this move) */
      if (pays) { g.strokeStyle = 'rgba(255,211,107,' + (0.55 + 0.4 * p) + ')'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, rr + p * 3, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; fr(g, '#fff6c8', x - 1, y - rr - 5, 2, 4); fr(g, '#fff6c8', x - 3, y - rr - 3, 6, 1); }
      else { g.fillStyle = 'rgba(200,214,228,' + (0.55 + 0.25 * p) + ')'; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { fr(g, x + sx * rr - (sx > 0 ? 4 : 0), y + sy * rr - (sy > 0 ? 0 : 0), 5, 1); fr(g, x + sx * rr - (sx > 0 ? 0 : 0), y + sy * rr - (sy > 0 ? 4 : 0), 1, 5); }
        const gl = (time * 22) % (rr * 4); if (gl < rr * 2) { g.globalAlpha = 0.9; fr(g, '#eef4fa', x - rr + gl, y - rr + gl * 0.5, 2, 2); g.globalAlpha = 1; } } } }
    /* HER FIRE (claude/cisternqueen3: ABLAZE, thrashing): flames over her shell, and the short orange clock until she sags */
    if (CQG.qHot(S) && !(e.gone && e.mode !== 'pounce')) { const wall = S.pose === 'wall', bx = wall ? e.x - 17 : e.x - CQ.w / 2, bw = wall ? 34 : CQ.w, top = wall ? S.G.floor - 92 : e.y - 40, bh = wall ? 84 : 26, n = 9;
      for (let i = 0; i < n; i++) { const fx = bx + ((i * 37 + R(time * 3)) % bw), fy = top + ((i * 19) % bh), h = 5 + 4 * Math.abs(Math.sin(time * 9 + i)); g.globalAlpha = 0.9;
        { const X0 = R(fx - cx), Y0 = R(fy - cy), hh = R(h + 2);   /* (claude/cqart) a tongue, not a candle: a red base, an orange body, a gold heart, a pale tip */
          fr(g, '#d84a14', X0 - 1, Y0 - 2, 5, 3); fr(g, '#ff7a22', X0, Y0 - R(hh * 0.55), 3, R(hh * 0.55)); fr(g, '#ffb84a', X0 + (i % 2), Y0 - R(hh * 0.85), 2, R(hh * 0.4)); fr(g, '#fff2c0', X0 + 1, Y0 - hh, 1, 2); } } g.globalAlpha = 1;
      const x = R(e.x - cx), y = R(Math.min(e.y, S.G.floor) - cy), k = Math.max(0, Math.min(1, S.scorch / CQ.thrashT)); g.fillStyle = '#1b1626'; g.fillRect(x - 20, y - 60, 40, 3); g.fillStyle = '#ff9a3c'; g.fillRect(x - 20, y - 60, R(40 * k), 3); }
    /* ABLAZE, SAGGED (the opening): embers still in her seams */
    if (e.mode === 'ablaze') { for (let i = 0; i < 6; i++) { const k = (time * 0.8 + i * 0.17) % 1, ex = e.x - CQ.w / 2 + 6 + ((i * 23) % (CQ.w - 12)); g.globalAlpha = 0.8 * (1 - k); fr(g, i % 2 ? '#ff9a3c' : '#ffd36b', R(ex - cx), R(e.y - 24 - k * 26 - cy), 1, 2); } g.globalAlpha = 1; }
    /* (claude/cqart) BLACKENED: smoke curls off the burnt shell, flakes of ash drift down, and a grey clock says how long until fire can take her again */
    if (S.charT > 0 && !S.flood && !CQG.qHot(S) && !(e.gone > 0)) { const wall = S.pose === 'wall', bx = wall ? e.x - 17 : e.x - CQ.w / 2, bw = wall ? 34 : CQ.w, top = wall ? S.G.floor - 92 : e.y - 40, k0 = Math.max(0, Math.min(1, S.charT / CQ.charT));
      for (let i = 0; i < 5; i++) { const k = (time * 0.4 + i * 0.2) % 1, sx = bx + 6 + ((i * 41) % (bw - 12)) + Math.sin(time * 2 + i * 1.7) * 3, sy = top + 6 - k * 34; g.globalAlpha = 0.5 * k0 * (1 - k); g.fillStyle = i % 2 ? '#6a625a' : '#8a8279'; g.beginPath(); g.ellipse(R(sx - cx), R(sy - cy), 2.5 + k * 4, 2 + k * 3, 0, 0, Math.PI * 2); g.fill(); }
      for (let i = 0; i < 6; i++) { const k = (time * 0.55 + i * 0.17) % 1; g.globalAlpha = 0.7 * k0 * (1 - k); fr(g, i % 2 ? '#b8afa4' : '#7a7268', R(bx + ((i * 37) % bw) - cx), R(top + 4 + k * 44 - cy), 1, 1); }
      g.globalAlpha = 1; const x = R(e.x - cx), y = R(Math.min(e.y, S.G.floor) - cy); g.fillStyle = '#1b1626'; g.fillRect(x - 20, y - 66, 40, 2); g.fillStyle = '#8a8279'; g.fillRect(x - 20, y - 66, R(40 * k0), 2); }
    /* (claude/cisternqueen3) WHAT IS USABLE GLOWS: her hall's oil while fire can take her (an amber shimmer on the pool), a full jar rack (a blue glint) */
    const L = ctx.oilCells ? ctx.oilCells() : null, fy = Math.floor(S.G.floor / 16) - 1;
    if (L && CQG.hotOK(e, S)) { for (const q of L) if (q.arena && !q.vertical && q.st === 'oil' && q.y === fy) CQA.drawOilGlow(g, R(q.x * 16 - cx), R(S.G.floor - cy), time, p, q.x); }   /* (claude/cq3art) a warm light, a running shimmer and a lifting ember on the pool that will catch */
    for (const r of S.racks) CQA.drawRack(g, R(r.x - cx), R(S.G.floor - cy), r, time, CQ.jarBack, S.ph === 1);   /* (claude/cq3art) a stone block, an iron cradle, the spring's brass nozzle; full and glinting, or dripping while the jar fills */
    for (const q of S.jars) { const jx = R(q.x - cx), jy = R(q.y - cy);
      if (q.state === 'fly') { const nv = Math.hypot(q.vx, q.vy) || 1; for (let k = 1; k <= 3; k++) { g.globalAlpha = 0.7 / k; fr(g, k % 2 ? '#7ab8e8' : '#e8f4f8', R(jx - q.vx / nv * 5 * k), R(jy - 8 - q.vy / nv * 5 * k), 2, 2); } g.globalAlpha = 1; CQA.drawJarArt(g, jx, jy + 8, { ang: time * 14 * (q.vx < 0 ? -1 : 1), t: time }); }
      else CQA.drawJarArt(g, jx, jy + (q.state === 'held' ? 4 : 0), { t: time, slosh: q.state === 'held' }); }
    for (const sp of S.splashes || []) CQA.drawShatter(g, sp, cx, cy, sp.fy);
    { const P = ctx.hero(); if (P && !P.dead && heldJar(P)) { const arc = arcFrom(P, ctx.keys ? ctx.keys() : {}); S.arc = arc; CT.drawArc(g, arc, cx, cy, time, '#7ab8e8'); } else S.arc = null; }
  };
  return H;
}
