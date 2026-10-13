// src/raptor-matriarch-hands.js - THE RAPTOR MATRIARCH's HANDS (claude/redgorge2, the greybox). src/raptor-matriarch.js is the fight (pure: her
// three phases, her cycles, her openings, the bot's reading); this binds it to the world: her told blows on the heroes (keyed once a blow, a
// shield turns only the yellow ones), the SLUICE LEVERS (E) and the water they let go, the gorge's horn and flood on the ledge (read from
// src/red-gorge-hands.js), the ROPE BRIDGES' POSTS (a blade on the post of the bridge she perches on parts its ropes), her brood (the gorge's
// raptors, src/desert-foes.js's marked dive), the cracked dam's water in phase three (into it: a blow and back on the nearest top - the rapids'
// rule) and its floating timbers (movers), and the drawing (GREYBOX: plain shapes - the art pass paints her).
// THE SHARED READ (design standard B10): OPEN = a gold ring round her and a timer bar over her; her BEATS = a thin gold ring; WARDED = a pale
// shell ring and the word; GUARDED = her talons up - a turned blow CLANKS, flashes and says TALONS UP (or GO ROUND / HIT HIGH the first times).
// main.js calls: spawnBoss, owns, on, update, take, interact, plank, drawBack, drawBoss, drawOver, barName, end, read, show, clear.
import * as RM from './raptor-matriarch.js';
import { BOSS_PHASE } from './boss-music.js';
import { T } from './level.js';
import { bakeMatriarch, poseOf, frameOf } from './redraw/matriarch_cast.js';   /* HER OWN SILHOUETTE (claude/redgorge2 art pass) */
import { drawLedge, planLedgeDress } from './redraw/matriarch_ledge.js';   /* THE NEST LEDGE's set: the gates, the levers, the bridges, the water */
import { drawTimber } from './redraw/redgorge2_art.js';
const { MAT } = RM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), leap: s => (s.leap || s.heavy)(), slash: s => (s.foeSlash || s.slash)(), sweep: s => (s.heavy || s.slash)(),
  scree: s => (s.rubble || s.thud)(), screech: s => (s.roar || s.hiss)(), dive: s => (s.leap || s.heavy)(), volley: s => (s.bow || s.slash)(), surge: s => { (s.waveBreak || s.splash)(); (s.rumble || s.thud)(); },
  burst: s => { (s.waveCrash || s.splash)(); }, crack: s => { (s.crack || s.thud)(); (s.rumble || s.heavy)(); }, fall: s => (s.heavy || s.thud)(), flap: s => (s.bird || s.hiss)() };

export function makeMatriarchHands(ctx) {
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'matriarch' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'matriarch';
  H.clear = () => { S = null; BOSS_PHASE.matriarch = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.rmKeys = pp.rmKeys || new Map(); if (pp.rmKeys.size > 80) pp.rmKeys.clear(); if (pp.rmKeys.has(key)) return true; pp.rmKeys.set(key, 1); return false; };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = RM.newFight(RM.geom(Ar, ctx.TS)); BOSS_PHASE.matriarch = 1; if (typeof window !== 'undefined') window.__RM_S = S;   /* (claude/redgorgerework) the last fight, for tools/redgorge-matprobe.mjs */ bakeMatriarch().warm();   /* (art) every frame baked now, not at the first draw */
    const e = { ...base, t: 'matriarch', w: MAT.w, h: MAT.h, hp: ctx.EHP.matriarch, maxHp: ctx.EHP.matriarch, noGrav: true, markH: MAT.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.y = S.G.topY; for (const pp of ctx.players) { pp.rmKeys = null; pp.rmWet = null; } return e; };

  /* ---------- THE WORLD AS SHE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, air: !pp.ground && !pp.climb, alive: ctx.upright(pp) && !pp.dead, dodge: (pp.dodge || 0) > 0, onBasket: pp.onMover && pp.onMover.mbasket ? pp.onMover.mbasket : null, pp }));   /* (claude/redgorgerework: onBasket - the standpipe basket a hero stands on) */   /* (claude/matriarch2: dodge - she sees a roll in her rake and follows it) */
  const water = () => { const g = ctx.gorge && ctx.gorge(); return g || { phase: 'dry' }; };
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.matriarch = ph; },
      mark: m => ctx.number(e.x, e.y - MAT.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => {
        if (k === 'land' || k === 'rockLand') ctx.burst(x, y - 4, k === 'land' ? 12 : 4, ['#c8643a', '#8a5a32', '#e0b080'], 70, 0.5);
        else if (k === 'scree') ctx.burst(x, y - 6, 10, ['#a85a32', '#7a4422', '#e0b080'], 80, 0.5);
        else if (k === 'burst') ctx.burst(x, y - 10, 24, ['#7ab8e8', '#e8f4f8', '#3a7ab8'], 110, 0.9);
        else if (k === 'open') ctx.ring(x, y - 16, 30, '#ffd36b');
        else if (k === 'stun') { ctx.ring(x, y - 16, 44, '#ffd36b'); ctx.burst(x, y - 10, 18, ['#7ab8e8', '#e8f4f8', '#ffd36b'], 90, 0.7); }   /* (claude/redgorgerework) THE SLUICE STUN: the wave breaks over her, a big gold ring */
        else if (k === 'ward') ctx.ring(x, y - 16, 34, '#9ab0c0');
        else if (k === 'mark') ctx.ring(x, y - 4, MAT.diveR, '#ff6b6b');
      else if (k === 'boil') ctx.burst(x, y - 2, 10, ['#e8f4f8', '#7ab8e8'], 60, 0.5);   /* (claude/matriarch2) the foam boils where she will burst */
        else if (k === 'quillLand') ctx.burst(x, y, 3, ['#e8dcc0', '#7a2e1c'], 40, 0.3); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable }));
          if (P.hp < hp0) any = true; if (o.pin && P.hp < hp0 && !P.dead) { P.vx = 0; P.snare = Math.max(P.snare || 0, 0.35); } }); return any; },
      band: (bx, d, name, key, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, key)) return;
          const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: true })); if (P.hp < hp0) any = true; }); return any; },
      spawnRaptor: (x, y) => { const b = ctx.spawnRaptor(x, y); if (b) { b.rmBrood = true; ctx.burst(x, y, 6, ['#c8643a', '#7a2e1c'], 40, 0.5); } return b; },
      raptors: () => ctx.enemies().filter(q => q.alive && q.rmBrood).length,
      /* HER YOUNG (claude/matriarch2, THE BROOD CALL): a cliff raptor's body on her young's machine (src/raptor-matriarch.js youngStep), smaller and weaker - kill them first */
      spawnYoung: (x, y) => { const b = ctx.spawnRaptor(x, y); if (!b) return null; const G = S.G; b.st = RM.newYoung(x, y, G.topY, x); b.st.nestX = x; b.st.nestY = y - 40; b.x = x; b.y = y; b.mode = 'come';
        b.w = RM.YOUNG.w; b.h = RM.YOUNG.h; b.hp = Math.max(6, Math.round(b.hp * MAT.broodHp)); b.rmBrood = true; b.rmYoung = true; b.young = true; ctx.burst(x, y, 6, ['#c8643a', '#efe0c0'], 40, 0.5); return b; },
      young: () => ctx.enemies().filter(q => q.alive && q.rmYoung && !(q.st && q.st.mode === 'home')).length,
      dismissYoung: () => { for (const q of ctx.enemies()) if (q.alive && q.rmYoung && q.st) q.st.mode = 'home'; },
      solid: (x, y) => ctx.solid(Math.floor(x / ctx.TS), Math.floor(y / ctx.TS)),
      horn: () => water().phase === 'horn', flood: () => water().phase === 'flood', hornIn: () => (water().phase === 'dry' ? (water().t ?? 99) : 0),   /* (claude/redgorgerework: the lure waits out the horn) */
      sweep: q => { if (q && q.pp) intoWater(q.pp, true); },
    };
  }
  /* INTO THE WATER (phase three, or the surge): a blow, and back on the nearest top (the rapids' rule: never a death) */
  const intoWater = (pp, surge) => ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !S) return; if ((pp.rmDunk || 0) > ctx.time()) return; pp.rmDunk = ctx.time() + 0.8;
    const G = S.G, t = RM.nearestTop(G, P.x); hurt('THE WATER', () => ctx.damagePlayer(P.x, surge ? 6 : 7, { unblockable: true, noKnock: true, name: 'THE WATER' }));
    if (P.dead) return; ctx.burst(P.x, P.y - 6, 14, ['#7ab8e8', '#e8f4f8'], 80, 0.6); ctx.place(pp, Math.max(t.l + 10, Math.min(t.r - 10, t.cx)), G.topY);
    S.n.dunks = (S.n.dunks || 0) + 1; if (!S.told.dunk) { S.told.dunk = 1; ctx.number(P.x, G.topY - 40, 'THE CURRENT THROWS YOU BACK ON THE ROCK', '#7ab8e8'); } });
  const waterY = () => { if (!S) return 1e9; const G = S.G; if (S.ph === 3 && S.water > 0) return G.floorY - (G.floorY - G.p3Y) * S.water; if (S.burst > 0 || S.flood) return G.floodY; return 1e9; };
  H.waterY = waterY;

  /* ---------- ONE FRAME OF HER ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.6; ctx.number(e.x, e.y - 80, 'OLD PLUME, MOTHER OF THE GORGE', '#ffd36b'); }
    const c = world(e), hs = heroes(), G = S.G;
    { const fl = e.maxHp * MAT.p2 + 1; if (S.ph === 1 && !(S.n.sluiceStuns > 0) && e.hp < fl && e.hp > fl - 40) e.hp = fl; }   /* (a tick's dip under the line, not a script's hand on her health) */   /* (claude/redgorgerework) THE HOLD against what writes her health straight (a bleed's tick): see H.hold */
    RM.stepMatriarch(e, S, dt, hs, c);
    for (const q of ctx.enemies()) if (q.alive && q.rmYoung && q.st && q.st.gone) q.alive = false;   /* (claude/matriarch2) a young one home on the nest is gone from the fight */
    /* THE LEVER, TOLD AGAIN (fix pass; the wake's one floating line was the only lesson): she is in the channel, a sluice is full and you are by its lever */
    if (H.leverDue() && e.y > G.topY + 8 && e.mode !== 'fly' && (S.leverSaidN || 0) < (S.n.sluiceStuns ? 4 : 99) && !(S.leverSaidT > ctx.time())) { const P0 = ctx.hero(), l = G.levers.find(q => S.sluice[q.id] && Math.abs(q.x - P0.x) < 160 && Math.abs(G.topY - P0.y) < 40);
      if (l) { S.leverSaidT = ctx.time() + (S.n.sluiceStuns ? 12 : 5); S.leverSaidN = (S.leverSaidN || 0) + 1; ctx.number(l.x, G.topY - 44, RM.SAY.lure, '#ffd36b'); } }   /* (claude/redgorgerework: until the first stun it is said at every lure) */
    e.phase = S.ph; e.w = e.mode === 'tangled' || e.mode === 'stunned' ? MAT.w + 10 : MAT.w; e.h = e.mode === 'tangled' || e.mode === 'stunned' ? 30 : MAT.h;   /* (claude/matriarch2: down on her side, x MAT.scale: 52 x 22 before) */
    /* THE WATER ON THE HEROES: a flood or a burst in the channel is a blow once and a shove; phase three's water is the rapids' rule */
    const wy = waterY();
    for (const pp of ctx.players) { if (pp.dead || !ctx.upright(pp)) continue; if (pp.x < G.x0 || pp.x > G.x1) continue;
      const onPlank = pp.onMover && pp.onMover.mplank;
      if (S.ph === 3 && S.water > 0.5 && pp.y > wy + 3 && !onPlank) { intoWater(pp, false); continue; }
      const behindWave = !S.wave || S.wave.dir * (S.wave.x - pp.x) >= 0;   /* (claude/redgorgerework) a burst is a WAVE: it finds you where it has been */
      if (S.ph < 3 && pp.y > G.topY + 10 && ((S.burst > 0 && behindWave) || S.flood)) { const id = S.burst > 0 ? 'b' + S.burstId : 'f' + S.floodId; if (pp.rmWet !== id) { pp.rmWet = id;
        ctx.asPlayer(pp, () => { hurt('THE FLOOD', () => ctx.damagePlayer(pp.x, S.burst > 0 ? 10 : 8, { unblockable: true, noKnock: true, name: S.burst > 0 ? 'THE BURST' : 'THE FLOOD' })); ctx.burst(pp.x, pp.y - 8, 10, ['#7ab8e8', '#e8f4f8'], 70, 0.5); }); } } }
    /* THE POSTS: a blade on a post of the bridge she perches on parts its ropes (her weight has them taut); any other time the ropes hold */
    if (S.ph === 2) for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !(P.atk >= 0)) return; const hb = ctx.attackBox(); if (!hb) return;
      for (const b of G.bridges) for (const px of [b.a, b.b]) { if (!ctx.overlap(hb, { l: px - 5, r: px + 5, t: G.topY - 34, b: G.topY })) continue;
        if (S.bridges[b.id] !== 'up') continue;
        if (S.perch === b.id && e.mode === 'perch') { S.bridges[b.id] = 'cut'; ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(px, G.topY - 20, 12, ['#d9b36a', '#7a5a30'], 70, 0.6); ctx.number(px, G.topY - 50, 'THE ROPES PART', '#8fd160'); }
        else if (!(S.postSaid > ctx.time())) { S.postSaid = ctx.time() + 2; ctx.number(px, G.topY - 50, 'THE ROPES HOLD: STRIKE IT WHILE SHE IS ON IT', '#9aa39a'); } } });
    if (!S.told.walls && S.ph === 2 && RM.wallMode(e)) { S.told.walls = 1; ctx.number((G.x0 + G.x1) / 2, G.topY - 100, RM.SAY.walls, '#ffd36b'); }   /* (claude/redgorgerework) */
    if (!S.told.lever && e.mode !== 'wake' && S.ph === 1) { S.told.lever = 1; ctx.number((G.x0 + G.x1) / 2, G.topY - 100, RM.SAY.rule, '#ffd36b'); }   /* (claude/redgorgerework) the fight's rule, named at the first beat */
  };
  /* E AT A LEVER: let the banked flood go down the channel */
  H.interact = P => { if (!S || !ctx.bossActive || !A()) return false; const G = S.G;
    const l = G.levers.find(q => Math.abs(q.x - P.x) <= 22 && Math.abs(G.topY - P.y) <= 20); if (!l) return false;
    const r = RM.pull(S, l.id);
    if (r === 'pressed') { ctx.sfx.ratchet && ctx.sfx.ratchet(); ctx.sfx.gateLift && ctx.sfx.gateLift(); ctx.shake(2); ctx.number(l.x, G.topY - 40, RM.SAY.press, '#8fd160'); }
    else if (r === 'drowned') ctx.number(l.x, G.topY - 40, RM.SAY.drowned, '#9aa39a');
    else if (r === 'released') { ctx.sfx.ratchet && ctx.sfx.ratchet(); ctx.sfx.gateLift && ctx.sfx.gateLift(); ctx.shake(2); ctx.number(l.x, G.topY - 40, 'THE SLUICE OPENS: THE WATER COMES', '#8fd160'); }
    else if (r === 'empty') ctx.number(l.x, G.topY - 40, 'THE SLUICE IS EMPTY: THE NEXT FLOOD FILLS IT', '#9aa39a');
    return true; };
  /* THE DAM'S TIMBERS: they lie in the channel's two wide reaches, and float up when the dam cracks */
  H.plank = (m, dt) => { const oy = m.y; m.dx = 0; if (S && A() && S.ph === 3 && S.water > 0) { const wy = waterY(); m.y = Math.min(m.y0, wy - 3 + Math.sin(ctx.time() * 2.4 + m.x) * 1.5); } else m.y = m.y0; m.dy = m.y - oy; return true; };
  /* THE STANDPIPE BASKETS (claude/redgorgerework): their height is the fight's (S.press[id].h); in phase three they float on the cracked dam's water like the timbers */
  H.basket = (m, dt) => { const oy = m.y; m.dx = 0;
    if (S && A() && S.ph === 3 && S.water > 0) { const wy = waterY(); m.y = Math.min(m.y0, wy - 3 + Math.sin(ctx.time() * 2.2 + m.x) * 1.5); }
    else if (S && A()) m.y = RM.basketY(S.G, S, m.mbasket); else m.y = m.y0;
    m.dy = m.y - oy; return true; };
  /* A BLOW ON HER: the ward turns everything; her talons turn the front; an opening pays x openMul (one opening openCap of her at most) */
  H.take = (e, dmg) => { let d0 = take0(e, dmg); if (!S || !(d0 > 0)) return d0;
    /* THE WATER DAMPS FIRE (claude/redgorgerework, the crab's rule on her: src/gorge-crab-hands.js): stunned by the sluice's wave she is SOAKED, and in phase three
       the dam's water is round her - the pyromancer's staff and its burn hiss on her (x MAT.soakFire, with steam and a hiss, said once); a blade goes through water */
    if (ctx.pyro && ctx.pyro() && (e.mode === 'staggered' || (S.ph === 3 && S.water > 0.5))) { d0 *= MAT.soakFire; S.n.soaked = (S.n.soaked || 0) + 1; const t = ctx.time();
      if (!(S.soakFx > t - 0.25)) { S.soakFx = t; ctx.burst(e.x, e.y - 18, 8, ['#e8f4f8', '#c8d0d8', '#9aa3aa'], 50, 0.6); ctx.sfx.hiss && ctx.sfx.hiss(); }
      if (!S.told.soak) { S.told.soak = 1; ctx.number(e.x, e.y - 56, 'THE WATER DAMPS YOUR FIRE', '#9ad0e8'); } }
    const d = RM.holdDmg(e, S, d0);
    if (d < d0 && !(S.holdSaid > ctx.time())) { S.holdSaid = ctx.time() + 3; S.n.held = (S.n.held || 0) + 1; e.guardFx = 0.25; e.guardWord = 'THE SLUICE'; ctx.number(e.x, e.y - 70, RM.SAY.hold, '#ffd36b'); }   /* (claude/redgorgerework) THE HOLD: the first pass forces the verb (B10: said, never a silent no-damage blow) */
    return d; };
  H.hold = (e, d) => (S ? RM.holdDmg(e, S, d) : d);
  const take0 = (e, dmg) => { if (!S) return dmg; const P = ctx.hero(), t = ctx.time();
    if (e.mode === 'sleep' || e.mode === 'wake') return 0;
    if (S.ward > 0) { e.chipHit = t; S.n.warded++; e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return 0; }
    if (RM.matUnder(e)) { e.chipHit = t; e.guardFx = 0.25; e.guardWord = 'UNDER THE WATER'; ctx.sfx.clank && ctx.sfx.clank(); return 0; }
    /* (claude/redgorgerework) FROM A RAISED BASKET while she is on the wall: the blow lands whole and knocks her off it */
    { const m = P.onMover; if (S.ph === 2 && m && m.mbasket && S.press[m.mbasket] && S.press[m.mbasket].h >= 0.85 && RM.wallMode(e) && RM.knock(e, S, world(e))) return dmg; }   /* (claude/matriarch2) the flood rider is under the water: nothing reaches her - said (B10) */
    if (RM.matBig(e) || e.broken > 0) { const cap = e.maxHp * (RM.matBig(e) && S.openCap ? S.openCap : MAT.openCap), d = Math.min(dmg * MAT.openMul, Math.max(0, cap - S.openTaken)); S.openTaken += d;
      if (S.openTaken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; ctx.number(e.x, e.y - 70, 'SHE GATHERS HERSELF', '#9aa39a'); } return d; }
    /* A BEAT (her guard is down: the skid, the breath after the rake) lands whole, up to MAT.beatCap of her a beat */
    if (RM.matBeat(e)) { const k = S.act + e.mode; if (S.beatKey !== k) { S.beatKey = k; S.beatTaken = 0; } const d = Math.min(dmg, Math.max(0, e.maxHp * MAT.beatCap - S.beatTaken)); S.beatTaken += d; return d; }
    /* UNDER HER TALONS (B11 "blocks high -> hit low"; fix pass): the knight's SHIELD TRIP and the warden's LOW POKE (crouched X, src/crouch-a.js) go under the raised guard */
    /* (claude/redgorgerework, B15 + B17: THE SLUICE IS HOW YOU HURT HER) outside her openings and beats she is RESISTANT: a blow round her talons, from above or
       under them lands x MAT.hideMul; one into her raised talons x MAT.talonMul (B15's floor: never nothing) - both told */
    if ((P.caTrip || P.caPoke) && P.ground && RM.guarded(e, P.x, P.y, false)) { if (!(S.lowSaid > t)) { S.lowSaid = t + 2.5; ctx.number(e.x, e.y - 60, 'UNDER HER TALONS', '#8fd160'); } S.n.under = (S.n.under || 0) + 1; return dmg * MAT.hideMul; }
    if (RM.guarded(e, P.x, P.y, !P.ground && !P.climb)) { e.chipHit = t; S.n.guarded++; e.guardFx = 0.25; e.guardWord = S.n.guarded < 5 ? ['TALONS UP: GO LOW', 'TALONS UP: GO ROUND', 'TALONS UP: HIT HIGH'][S.n.guarded % 3] : 'TALONS UP';
      ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(P.x - e.x) || 1) * 14, e.y - 20, Math.sign(P.x - e.x) || 1, 5); return dmg * MAT.talonMul; }
    if (!(S.hideSaid > t)) { S.hideSaid = t + 6; e.guardFx = 0.2; e.guardWord = 'TOUGH HIDE: STUN HER'; }
    return dmg * MAT.hideMul; };
  /* THE LEVERS' GLINT (src/stuck-spots.js STUCK_HANDS rg-lever, via src/red-gorge-hands.js 'mat.lever'): due while phase one has a full sluice and she can be thrown */
  H.leverDue = () => { if (!S || !ctx.bossActive || !A()) return ''; const e = ctx.boss; if (!e || !e.alive || e.t !== 'matriarch' || e.mode === 'sleep') return '';
    if (S.ph === 2) return RM.wallMode(e) && G0().levers.some(l => S.sluice[l.id] && !(S.press[l.id].charge > 0)) ? 'due' : '';   /* (claude/redgorgerework) phase two: a full lever lifts its basket to her */
    if (S.ph !== 1 || S.pending.length || S.burst > 0 || S.ward > 0 || RM.matBig(e)) return '';
    return S.sluice.W || S.sluice.E ? 'due' : ''; };
  const G0 = () => S.G;
  H.barName = e => 'OLD PLUME, THE RAPTOR MATRIARCH' + (RM.matBig(e) ? (e.mode === 'staggered' ? '  STUNNED' : e.mode === 'stunned' ? '  STUNNED' : e.mode === 'tangled' ? '  TANGLED' : '  THROWN') : RM.matBeat(e) ? '  GUARD DOWN' : S && S.ward > 0 ? '  WARDED' : RM.matUnder(e) ? '  UNDER THE WATER' : '');
  H.end = e => { if (S) { S.shots = []; S.bands = []; } for (const q of ctx.enemies()) if (q.alive && q.rmBrood) { q.alive = false; ctx.burst(q.x, q.y, 8, ['#c8643a', '#7a2e1c'], 50, 0.5); } BOSS_PHASE.matriarch = 1; };
  H.read = () => S && { lure: !!S.lure, wave: S.wave ? { ...S.wave } : null, mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, n: JSON.parse(JSON.stringify(S.n)), sluice: { ...S.sluice }, bridges: { ...S.bridges }, water: S.water, burst: S.burst, ward: S.ward, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (the art pass: src/redraw/matriarch_ledge.js = the set, src/redraw/matriarch_cast.js = HER) ---------- */
  /* the ledge: the spillway's water, the sluice gates, the levers and their gauges, the rope bridges, the channel's water, what lies on the tops */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    if (!S.dress) S.dress = planLedgeDress(ctx.L, T);
    drawLedge(g, cx, cy, time, S, G, { text: ctx.text, boss: ctx.boss, wy: waterY(), VW: ctx.VW(), VH: ctx.VH(), dress: S.dress });
    /* the dam's loose timbers in the channel (they float up when it cracks): broken boards, as the Rapids' */
    /* (claude/redgorgerework, PLACEHOLDER art) THE STANDPIPES and their BASKETS: a stone pipe up the bank's face, the water column under the basket while it holds
       pressure, a timber deck in a rope cradle, and the PRESSURE gauge on the pipe (it drains with the charge); a full lever's basket blinks UP in phase two */
    for (const b of G.baskets) { const B = S.press[b.id], m = (ctx.movers ? ctx.movers() : []).find(q => q.mbasket === b.id), y = m ? m.y : b.y0, x = Math.round(b.l - cx), w = b.r - b.l;
      if (x < -60 || x > ctx.VW() + 60) continue; const top = Math.round(b.y1 - cy), foot = Math.round(G.floorY - cy), yy = Math.round(y - cy), px = b.id === 'W' ? x - 6 : x + w + 1;
      g.fillStyle = '#5a3a2a'; g.fillRect(px, top - 4, 5, foot - top + 4); g.fillStyle = '#7a5440'; g.fillRect(px, top - 4, 1, foot - top + 4);
      const k = B.charge / MAT.pressT; g.fillStyle = '#10181c'; g.fillRect(px + 1, top, 3, foot - top); if (k > 0) { const gh = Math.round((foot - top) * k); g.fillStyle = '#4a8ac8'; g.fillRect(px + 1, foot - gh, 3, gh); g.fillStyle = '#c8e8ff'; g.fillRect(px + 1, foot - gh, 3, 1); }
      if (B.h > 0.02 || B.charge > 0) { g.globalAlpha = 0.75; g.fillStyle = '#7ab8e8'; g.fillRect(x + 3, yy + 6, w - 6, Math.max(0, foot - yy - 6)); g.fillStyle = '#e8f4f8'; for (let i = 0; i < 4; i++) g.fillRect(x + 4 + ((i * 7 + Math.floor(time * 30)) % (w - 8)), yy + 8 + i * 5, 2, 2); g.globalAlpha = 1; }
      g.fillStyle = '#8a5a32'; g.fillRect(x, yy, w, 6); g.fillStyle = '#c8945a'; g.fillRect(x, yy, w, 1); g.fillStyle = '#d9b36a'; g.fillRect(x, yy - 10, 1, 10); g.fillRect(x + w - 1, yy - 10, 1, 10); g.fillRect(x, yy - 10, w, 1);
      if (S.ph === 2 && B.charge > 0 && B.h < 0.3 && Math.floor(time * 4) % 2) ctx.text('UP', x + w / 2, yy - 16, '#8fd160', 'center', 5); }
    for (const m of (ctx.movers ? ctx.movers() : [])) { if (!m.mplank) continue; drawTimber(g, { ...m, w: m.w, what: 'plank', fast: S.ph === 3 && S.water > 0.3 }, cx, cy, time); } };
  /* HER: the matriarch's own silhouette (a pose per mode; the stalk walks, the rest stand still but for the breath), a contact shadow, a net over her when she is tangled, stars when stunned */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const C = bakeMatriarch(), dirL = (e.face || 1) <= 0, flash = (e.hurtT || 0) > 0, m = e.mode;
    /* (claude/matriarch2 art) the frame: keyed by mode and the time in it (A.el), the stalk by whether she is moving, a landing by the time since a flight */
    const A0 = e.artA || (e.artA = { m, t0: time, prev: '', x: e.x, mv: -9, flyEnd: -9 });
    if (A0.m !== m) { if (A0.m === 'fly') A0.flyEnd = time; A0.prev = A0.m; A0.m = m; A0.t0 = time; }
    if (Math.abs(e.x - A0.x) > 0.15) A0.mv = time; A0.x = e.x;
    const fr = frameOf(e, S, time, { el: time - A0.t0, prev: A0.prev, sinceFly: time - A0.flyEnd, moving: time - A0.mv < 0.12 }), spr = C.get(fr.key, fr.i, dirL, flash);
    if (RM.matUnder(e)) return;   /* (claude/matriarch2) under the water: the foam line is her (drawOver) */
    const x = R(e.x - cx), y = R(e.y - cy), grounded = !(m === 'fly' || m === 'wallRun' || m === 'diveTell' || m === 'volleyTell' || m === 'circle' || m === 'broodTell');
    if (grounded || m === 'perch') { g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(x - 30, y - 1, 60, 2); g.fillRect(x - 22, y - 2, 44, 1); g.globalAlpha = 1; }
    g.drawImage(spr, x - C.AX, y - C.GY);   /* drawn natively at her size (no scaling): src/redraw/matriarch_cast.js */
    if (m === 'tangled') { g.strokeStyle = '#d9b36a'; g.lineWidth = 1; g.beginPath(); for (let i = -2; i <= 2; i++) { g.moveTo(x - 26, y - 6 + i * 7); g.lineTo(x + 26, y - 20 + i * 7); g.moveTo(x - 20 + i * 10, y - 4); g.lineTo(x - 12 + i * 10, y - 30); } g.stroke(); g.fillStyle = '#7a5a30'; for (const [kx, ky] of [[-10, -16], [8, -22], [0, -8]]) g.fillRect(x + kx, y + ky, 3, 3); }
    if (m === 'stunned' || m === 'staggered' || m === 'pstagger') { for (let i = 0; i < 3; i++) { const a = time * 4 + i * 2.1; g.fillStyle = i % 2 ? '#ffd36b' : '#fff6c8'; g.fillRect(x + R(Math.cos(a) * 19) - 1, y - 54 + R(Math.sin(a) * 4) - 1, 3, 3); } }
    if (e.guardFx > 0) { g.fillStyle = '#ffffff'; const f = e.face || 1; g.fillRect(x + f * 35 - 2, y - 49, 4, 16); g.fillRect(x + f * 30 - 2, y - 54, 3, 8); }   /* (x MAT.scale) */   /* the talons flash when a blow is turned */
  };
  /* OVER EVERYTHING: her marks, the quills and rocks, the surge, and THE READ (open ring + timer, beat ring, ward shell, the guard's word) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'matriarch') return; const G = S.G;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    /* her shadow on the ground under her when she is on the wall, on a bridge or in the air - and the dive's mark where you stood */
    /* (claude/matriarch2) THE FLOOD RIDER's FOAM LINE: a white wake on the water running to your top's edge, then the boil where she comes up (the tell, with the !! and the word) */
    if (RM.matUnder(e) && S.rider) { const wy = R(waterY() - cy), fx = R(S.rider.fx - cx), d = S.rider.bx != null ? Math.sign(S.rider.bx - S.rider.fx) || 1 : 1, boil = e.mode === 'riderWait';
      g.fillStyle = '#e8f4f8'; g.fillRect(fx - 6, wy - 2, 12, 3); for (let i = 1; i <= 6; i++) { g.globalAlpha = 0.8 - i * 0.12; g.fillRect(fx - d * i * 9 - 4, wy - 1 + (i % 2), 8, 2); } g.globalAlpha = 1;
      if (boil) { const k = 1 - Math.max(0, e.modeT) / MAT.riderWait; g.fillStyle = blink; for (let i = 0; i < 5; i++) { const a = time * 9 + i * 1.3; g.fillRect(fx + R(Math.cos(a) * MAT.riderR) - 1, wy - 3 - R(Math.abs(Math.sin(a)) * 6 * k), 3, 3); }
        g.strokeStyle = blink; g.beginPath(); g.moveTo(fx - MAT.riderR, wy - 1); g.lineTo(fx + MAT.riderR, wy - 1); g.stroke(); ctx.text('FOAM!', fx, wy - 16, '#ff9a5c', 'center', 6); } }
    if (e.mode === 'wallRun' || e.mode === 'perch' || e.mode === 'diveTell' || e.mode === 'fly' || e.mode === 'volleyTell' || e.mode === 'circle' || e.mode === 'broodTell') { const sx = R(e.x - cx), sy = R(RM.surfY(G, e.x, 4) - 1 - cy); g.fillStyle = 'rgba(20,10,10,0.45)'; g.fillRect(sx - 14, sy, 28, 2); }
    if (S.mark && e.mode === 'diveTell') { const x = R(S.mark.x - cx), y = R(S.mark.y - 2 - cy); g.fillStyle = 'rgba(30,10,10,0.6)'; g.fillRect(x - MAT.diveR, y, MAT.diveR * 2, 3); g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 2); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 2); g.stroke(); }
    if (e.mode === 'pounceTell' && S.pAt) { const x = R(S.pAt.x - cx), y = R(RM.surfY(G, S.pAt.x, 4) - 2 - cy); g.fillStyle = 'rgba(30,10,10,0.55)'; g.fillRect(x - MAT.pounceR, y, MAT.pounceR * 2, 3); g.fillStyle = blink; g.fillRect(x - 1, y - 5, 2, 4); }
    if (e.mode === 'fly' && S.fly && S.fly.then === 'land') { const x = R(S.fly.tx - cx), y = R(S.fly.ty - 2 - cy); g.fillStyle = 'rgba(30,10,10,0.5)'; g.fillRect(x - MAT.pounceR, y, MAT.pounceR * 2, 2); }
    for (const s of S.shots) { const x = R(s.x - cx), y = R(s.y - cy); if (s.k === 'rock') { g.fillStyle = '#8a5a32'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#c8945a'; g.fillRect(x - 2, y - 3, 3, 2); }
      else { g.save(); g.translate(x, y); g.rotate(Math.atan2(s.vy, s.vx)); g.fillStyle = '#f0dcb8'; g.fillRect(-7, -1, 12, 2); g.fillStyle = '#7a2e1c'; g.fillRect(3, -1, 3, 2); g.restore(); } }
    for (const b of S.bands) { const x = R(b.x - cx), y0 = R(b.y0 - cy); g.fillStyle = '#6a4426'; g.fillRect(x - 14, y0 + 6, 28, 8); g.fillStyle = '#e8f4f8'; g.fillRect(x - 16, y0 + 4, 32, 2); g.fillStyle = '#8a5a32'; g.fillRect(x - 8, y0, 4, 8); }
    if (e.mode === 'surgeTell') { const fromW = ((S.surgeN || 0) + 1) % 2, x = R((fromW ? G.x0 + 10 : G.x1 - 10) - cx), y = R(G.topY - 20 - cy); g.fillStyle = blink; g.fillRect(x - 2, y, 4, 14); ctx.text('DEBRIS!', x, y - 8, '#ff9a5c', 'center', 6); }
    /* (claude/redgorgerework) THE SLUICE STUN, DRAWN AS A CHAIN: a bobbing gold marker over every lever that can stun her now (a full sluice in phase one);
       while she is down in the channel a dashed gold line runs from that lever along the channel to her (the lure: it blinks); a pulled lever's WAVE is a
       white wall of water running from its bank down the channel; the one that reaches her breaks over her (the 'stun' ring) and the read says STUNNED */
    if (S.ph === 1) { const inCh = e.y > G.topY + 8 && e.mode !== 'fly' && !RM.matBig(e), hot = !!S.lure || inCh, blinkG = Math.floor(time * (S.lure ? 8 : 3)) % 2;
      for (const l of G.levers) { if (!S.sluice[l.id] || S.pending.length || S.burst > 0) continue; const lx = R(l.x - cx), ly = R(G.topY - 58 - cy) + R(Math.sin(time * 5) * 3);
        g.fillStyle = hot && blinkG ? '#fff6c8' : '#ffd36b'; g.beginPath(); g.moveTo(lx - 6, ly - 6); g.lineTo(lx + 6, ly - 6); g.lineTo(lx, ly + 2); g.closePath(); g.fill();
        ctx.text(hot ? 'PULL (E)' : 'LEVER', lx, ly - 14, hot && blinkG ? '#fff6c8' : '#ffd36b', 'center', 5);
        if (inCh && !(S.ward > 0)) { const y0 = R(G.floorY - 10 - cy), x0 = R((l.id === 'W' ? G.tops[0].r : G.tops[G.tops.length - 1].l) - cx), x1 = R(e.x - cx); g.globalAlpha = hot && blinkG ? 0.9 : 0.55; g.fillStyle = '#ffd36b';
          for (let xx = Math.min(x0, x1); xx < Math.max(x0, x1); xx += 8) g.fillRect(xx, y0, 5, 2); g.fillRect(lx - 1, R(G.topY - 40 - cy), 2, R(G.floorY - G.topY + 30)); g.globalAlpha = 1; } } }
    if (S.wave) { const wx = R(S.wave.x - cx), top = R(G.floorY - 30 - cy), bot = R(G.floorY - cy); g.fillStyle = 'rgba(150,200,236,0.85)'; g.fillRect(wx - S.wave.dir * 26, top + 8, 26 * 1, bot - top - 8);
      g.fillStyle = '#e8f4f8'; g.fillRect(wx - 3, top, 6, bot - top); for (let i = 0; i < 6; i++) g.fillRect(wx + S.wave.dir * (2 + (i % 3) * 3), top + 2 + i * 4 + R(Math.sin(time * 20 + i) * 2), 3, 2); }
    /* THE READ (B10) */
    const x = R(e.x - cx), y = R(e.y - MAT.h / 2 - cy);
    if (RM.matBig(e)) { const k = Math.max(0, e.open / ({ staggered: MAT.staggerT, stunned: MAT.stunT, tangled: MAT.tangleT, pstagger: MAT.p3StaggerT }[e.mode] || 3));
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 36, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = R(e.y - MAT.h - 26 - cy); ctx.text(e.mode === 'staggered' || e.mode === 'stunned' ? 'STUNNED' : 'OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * k), 3); }
    else if (RM.matBeat(e)) { g.globalAlpha = 0.55; g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, 32, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 39, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, R(e.y - MAT.h - 22 - cy), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, R(e.y - MAT.h - 34 - cy) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
