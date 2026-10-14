// src/fog-knight-hands.js - THE FOG KNIGHT's HANDS (claude/towpath, the greybox; THE FOG KNIGHT 2, claude/towpath2). src/fog-knight.js is the fight (pure: his
// three phases, his cycles, his stances, the burn, the double, the shroud, the lash, the surge, the spears, the dissolve plunge, the bot's reading); this binds it
// to the world: his told blows on the heroes (keyed once a blow; a shield turns only the yellow ones; the FOG LUNGE passes a roll begun in its last beat - one
// begun sooner is spent before the point arrives: TOO SOON), THE TOWROPE's hook and drag, THE SURGE's knock, the heroes' LANTERNS (src/towpath-hands.js: lit and
// near, they burn him; a blow of his that lands gutters yours), THE TOWPATH'S END's own pieces (the swing bridge through him - onBridge; the arena lock drained
// under his double - onLock; the lock lamps - shroudAt; the arena's FOG LINE - fogTopAt, read by the towpath's fog), every blow on him by its ANGLE (take:
// src/lantern-eater.js blowAngle - low / mid / high - and the plunge by the blow's tag, so the pyromancer's firedrop is a plunge), and the drawing (GREYBOX shapes
// until the art pass: every move its own windup and release pose, B16).
// THE SHARED READ (design standard B10): OPEN = a gold ring and a timer bar ("THE ARMOUR STANDS EMPTY"); WARDED = a pale shell ring and the word; a turned
// blow CLANKS, flashes and names the stance it met (GUARDS HIGH / GUARDS LOW / FULL GUARD) through src/boss-read.js - never silent. His STANCE is drawn on
// him (the shield up and the visor lit; the sword planted and the fog pooled; the fog wrapped round him), named over him, and an ARROW shows where a blow lands
// (claude/towpath2: Daniel could not read the stances in play); THE BURN is a bar over him with its word.
// main.js calls: spawnBoss, owns, on, update, take, drawBoss, drawOver, barName, end, read, show, clear, onBridge, onLock, shroudAt, fogTopAt.
import * as FKM from './fog-knight.js';
import { blowAngle } from './lantern-eater.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas } from './px.js';
import * as ART from './redraw/fog_knight_art.js';
const { FK } = FKM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slash: s => (s.foeSlash || s.slash)(), lunge: s => (s.whoosh || s.foeSlash || s.slash)(),
  open: s => (s.bell || s.clank)(), mist: s => (s.hiss || s.whoosh || s.tell)(), chain: s => (s.chain || s.clank)(), splash: s => (s.splash || s.thud || s.clank)() };

/* THE PLATE, CONSUMED BY FOG (claude/towpath2art: src/redraw/fog_knight_art.js draws him at Crusader scale - every move its own windup and release pose, B16).
   o: { stance, mode, alpha, visor, sag, flash, p (the windup's progress 0..1), double (the mist copy) } */
export function drawPlate(g, x, y, f, o, time) { ART.drawKnight(g, x, y, f, o, time); }
/* THE BESTIARY CARD: the plate on the towpath at night, in its full guard */
export function bakeFogKnightCard() {
  const W = 72, Hh = 84, [c, g] = canvas(W, Hh);
  const bg = g.createLinearGradient(0, 0, 0, Hh); bg.addColorStop(0, '#12202a'); bg.addColorStop(1, '#080c10'); g.fillStyle = bg; g.fillRect(0, 0, W, Hh);
  g.fillStyle = '#1c2a2e'; g.fillRect(0, 76, W, 8); g.fillStyle = '#4a6a68'; g.fillRect(0, 76, W, 1);
  drawPlate(g, 30, 76, 1, { stance: 'full', mode: 'walk', alpha: 1, visor: 1, sag: 0 }, 0.6);
  return { R: [c], L: [c], w: 40, h: 62 };
}
export function makeFogKnightHands(ctx) {
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'fogknight' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'fogknight';
  H.clear = () => { S = null; BOSS_PHASE.fogknight = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.fkKeys = pp.fkKeys || new Map(); if (pp.fkKeys.size > 80) pp.fkKeys.clear(); if (pp.fkKeys.has(key)) return true; pp.fkKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'fogknight' ? e : null; };
  let WORD = null;   /* the told move's word over him, while it winds up */

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = FKM.newFight(FKM.geom(Ar, ctx.TS)); S.landedOn = []; BOSS_PHASE.fogknight = 1; WORD = null;
    const e = { ...base, t: 'fogknight', w: FK.w, h: FK.h, hp: ctx.EHP.fogknight, maxHp: ctx.EHP.fogknight, noGrav: true, markH: FK.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.y = S.G.floorY; for (const pp of ctx.players) { pp.fkKeys = null; pp.fkRollEnd = -9; } return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => { const q = ctx.lanternOf(pp); return { x: pp.x, y: pp.y, face: pp.face || 1, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, lit: !!(q && q.has && q.lit), dodge: (pp.dodge || 0) > 0, pp }; });
  function world(e) {
    const hitOne = (pp, bx, d, name, o) => { let any = false; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
        if (bx && !ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return; if (keyed(pp, o.key || name)) return;
        if (o.soon && !(P.dodge > 0) && ctx.time() - (pp.fkRollEnd ?? -9) < 0.45) { S.n.soon++; ctx.number(P.x, P.y - 40, 'TOO SOON: ROLL IN ITS LAST BEAT'); }
        const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock })); if (P.hp < hp0) { any = true; ctx.gutter(pp);
          if (S.landedOn) { S.landedOn.push({ name, dx: Math.round(P.x - e.x), dy: Math.round(P.y - e.y), ground: !!P.ground, dodge: +(P.dodge || 0).toFixed(2), sinceRoll: +(ctx.time() - (pp.fkRollEnd ?? -9)).toFixed(2), mode: e.mode, bot: S.botWhy || '' }); if (S.landedOn.length > 40) S.landedOn.shift(); } } }); return any; };   /* (S.landedOn: the tune lane's ledger of what landed, and how the hero stood) */
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(),
      music: ph => { BOSS_PHASE.fogknight = ph; if (ctx.music) ctx.music(ph > 1 ? 'fogknight:p' + ph : 'fogknight'); },
      mark: m => ctx.number(e.x, e.y - FK.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      word: (ee, line, mode) => { WORD = { line, mode, t: ctx.time() }; },
      fx: (k, x, y) => {
        if (k === 'mist' || k === 'dissolve' || k === 'reform' || k === 'double') ctx.burst(x, y - 18, k === 'dissolve' ? 22 : 14, ['#c8d0d8', '#9aa4ae', '#e8eef2'], 60, 0.7, -20);
        else if (k === 'open') { ctx.ring(x, y - 18, 32, '#ffd36b'); ctx.burst(x, y - 20, 18, ['#c8d0d8', '#e8eef2'], 90, 0.6, -40); }
        else if (k === 'ward') ctx.ring(x, y - 18, 34, '#9ab0c0');
        else if (k === 'surge') { ctx.burst(x, y - 20, 24, ['#cfe6f0', '#9ac0d0', '#6a90a0'], 120, 0.6, -60); try { (ctx.sfx.splash || ctx.sfx.thud || ctx.sfx.clank)(); } catch {} } },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) if (hitOne(pp, bx, d, name, o)) any = true; return any; },
      /* THE TOWROPE'S HOOK: no shield turns it (a roll passes it: the fight checks the roll first); it lands, the hero is hooked */
      hook: (pp, d, name, key) => hitOne(pp, null, d, name, { key, noKnock: true }),
      /* THE DRAG: pulled across the towpath (and the water) toward him */
      drag: (pp, toX, v, dt) => ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead) return; const dd = toX - P.x; P.vx = Math.sign(dd) * Math.min(v, Math.abs(dd) / Math.max(dt, 1 / 120)); }),
      /* THE SURGE's knock: the water carries you west off your feet */
      knock: (pp, vx) => ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead) return; P.vx = vx; P.vy = Math.min(P.vy || 0, -140); P.ground = false; }),
      lockFull: () => { const k = ctx.lock && ctx.lock('fkLock'); return !k || k.y <= k.hiY + 3; },
      lamps: () => (ctx.lamps ? ctx.lamps() : []).filter(l => l.arena).map(l => ({ x: l.x * ctx.TS + 8, lit: !!l.lit })),
      light: (x, y) => (ctx.lightAt ? ctx.lightAt(x, y) : 0),
    };
  }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    for (const pp of ctx.players) { if (pp.dodge > 0) pp.fkRolling = true; else if (pp.fkRolling) { pp.fkRolling = false; pp.fkRollEnd = ctx.time(); } }
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 84, 'THE FOG KNIGHT: THE FOG IN AN OLD SUIT OF PLATE', '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 120, 'FOG IS HIS BODY: YOUR LANTERN BURNS IT OUT OF HIM', '#ffd36b'); }
    if (S.ph >= 2 && !S.told.fog) { S.told.fog = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 104, 'THE FOG IS OVER YOUR HEAD: GET ABOVE IT AND YOU SEE HIM COME', '#ffe9a0'); }
    const was = e.mode;
    FKM.stepFogKnight(e, S, dt, heroes(), world(e));
    if (was !== e.mode && e.mode === 'stanceTell' && !S.told['st' + S.want]) { S.told['st' + S.want] = 1; if (S.want === 'high') ctx.number(e.x, e.y - 66, 'GUARDS HIGH: HIT LOW', '#ffe9a0'); else if (S.want === 'low') ctx.number(e.x, e.y - 66, 'GUARDS LOW: HIT HIGH', '#ffe9a0'); else ctx.number(e.x, e.y - 66, 'FULL GUARD: PLUNGE ON HIM', '#ffe9a0'); }   /* (each line literal: tools/hint-shown.mjs reads the calls) */
    if (was !== e.mode && !S.told['mv' + e.mode] && FKM.MOVE_WORD[e.mode]) { S.told['mv' + e.mode] = 1; const y = e.y - 90;   /* (each line literal: tools/hint-shown.mjs reads the calls) */
      if (e.mode === 'lashTell') ctx.number(e.x, y, 'THE TOWROPE: ROLL OR JUMP IT', '#ffe9a0'); else if (e.mode === 'surgeTell') ctx.number(e.x, y, 'THE LOCK SURGE: GET UP HIGH', '#ffe9a0');
      else if (e.mode === 'spearTell') ctx.number(e.x, y, 'FOG SPEARS: OFF THE LINE', '#ffe9a0'); else if (e.mode === 'sinkTell') ctx.number(e.x, y, 'HE SINKS INTO THE FOG', '#ffe9a0'); }
    e.phase = S.ph;
    /* A BLADE THROUGH THE DOUBLE: nothing there (fog) */
    if (S.dbl) for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !(P.atk >= 0)) return; const hb = ctx.attackBox(); if (!hb) return;
      if (ctx.overlap(hb, { l: S.dbl.x - 9, r: S.dbl.x + 9, t: S.G.floorY - 34, b: S.G.floorY }) && !(S.dblSaid > ctx.time())) { S.dblSaid = ctx.time() + 1.2; ctx.turned({ x: S.dbl.x, y: S.G.floorY, w: 18, h: 34, alive: true, t: 'fogdouble' }, P.x, 'ONLY FOG: HIS VISOR GLOWS'); } });
    if (WORD && (!/Tell$/.test(e.mode) || ctx.time() - WORD.t > 2)) WORD = null;
  };
  /* THE RULE ON HIM: the arena's bridge swung (src/towpath-hands.js), its lock drained */
  H.onBridge = b => { const e = live(); if (!S || !e || !ctx.bossActive) return; FKM.bridgeSwung(e, S, world(e)); };
  H.onLock = what => { const e = live(); if (!S || !e || !ctx.bossActive) return; if (what === 'drained') FKM.lockDrained(e, S, world(e)); };
  /* THE SHROUD at x (phase three): the arena flooded with fog, thinner for every lock lamp alight */
  H.shroudAt = x => { if (!S || !ctx.bossActive || S.ph < 3 || x < S.G.x0 - 40 || x > S.G.x1 + 40) return 0; const lit = (ctx.lamps ? ctx.lamps() : []).filter(l => l.arena && l.lit).length;
    return Math.max(0, Math.min(0.88, S.shroud * (0.86 - 0.22 * lit))); };
  /* THE ARENA'S FOG LINE (px) at x, while he fights (src/towpath-hands.js fogAt): null outside the arena or before the fight */
  H.fogTopAt = x => (S && ctx.bossActive && x >= S.G.x0 - 8 && x <= S.G.x1 + 8 ? FKM.fogTop(S) : null);
  /* A BLOW ON HIM, by its angle: the ward turns everything; open x FK.openMul (one opening FK.openCap of him at most); on guard, his stance turns the wrong angle */
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero();
    const tag = Array.isArray(blow) ? blow : blow ? [blow] : [], angle = !blow ? 'burn' : tag.includes('plunge') || P.plunge ? 'plunge' : tag.includes('shot') && ctx.isPyro && ctx.isPyro() ? 'fire' : blowAngle(P);
    const r = FKM.takeAt(e, S, angle);
    if (r.k <= 0) { if (e.mode === 'sleep' || e.mode === 'wake') return 0; S.n[S.ward > 0 ? 'warded' : 'turned']++; e.guardFx = 0.25; e.guardWord = r.word; ctx.turned(e, P.x, r.word === 'FULL GUARD' ? 'FULL GUARD: FROM ABOVE' : r.word); return 0; }
    if (FKM.fkOpen(e)) { const cap = e.maxHp * FK.openCap, d = Math.min(dmg * r.k, Math.max(0, cap - S.openTaken)); S.openTaken += d;
      if (S.openTaken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; ctx.number(e.x, e.y - 74, 'THE FOG GATHERS IN HIM AGAIN', '#9aa39a'); } return d; }
    if (angle === 'plunge') S.n.plunges++;
    if (r.reel) FKM.reel(e, S, world(e)); else if (angle !== 'burn') FKM.landed(e, S, world(e), P.x);
    return dmg * r.k; };
  H.barName = e => 'THE FOG KNIGHT' + (FKM.fkOpen(e) ? '  EMPTY' : S && S.ward > 0 ? '  WARDED' : FKM.fkGone(e) ? '  IN THE FOG' : S ? '  ' + FKM.STANCE_WORD[S.stance] : '');
  H.end = e => { if (S && e && e.t === 'fogknight' && (!e.alive || e.hp <= 0)) S.dead = { x: e.x, y: e.y, f: e.face || 1, t0: null }; if (S) { S.dbl = null; S.shroud = 0; S.lash = null; S.hooked = null; S.wave = null; S.spears = null; S.plunge = null; } BOSS_PHASE.fogknight = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, stance: S.stance, burn: +S.burn.toFixed(2), n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, dbl: !!S.dbl, shroud: +S.shroud.toFixed(2), hurt: { ...(S.hurt || {}) },
    fogTop: FKM.fogTop(S), landedOn: (S.landedOn || []).slice(), lash: !!S.lash, hooked: !!S.hooked, wave: S.wave ? R(S.wave.x) : null, spears: S.spears ? S.spears.spots.map(q => R(q.x)) : null, plunge: S.plunge && S.plunge.x !== null ? R(S.plunge.x) : null };

  /* ---------- DRAWING (claude/towpath2art) ---------- */
  const TELL_T = { cutTell: FK.cutTell, lungeTell: FK.lungeTell, lashTell: FK.lashTell, surgeTell: FK.surgeTell, spearTell: FK.spearTell, sinkTell: FK.sinkTell, stepTell: FK.stepTell, shroudTell: FK.shroudTell, doubleTell: FK.doubleTell, dissolve: FK.dissolveT, wake: 1.2 };
  const prog = e => { const T = e.mode === 'stanceTell' ? (FK.stanceTell[(S ? S.ph : 1) - 1] || 0.5) : TELL_T[e.mode]; return T ? Math.max(0, Math.min(1, 1 - Math.max(0, e.modeT) / T)) : 0; };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, m = e.mode, flash = (e.hurtT || 0) > 0;
    if (m === 'gone' || m === 'plungeTell') return;   /* (in the fog: his shadow is drawOver's) */
    const alpha = m === 'dissolve' ? Math.max(0.1, e.modeT / FK.dissolveT) : m === 'sinkTell' ? Math.max(0.12, e.modeT / FK.sinkTell) : 1;
    g.globalAlpha = 0.3; g.fillStyle = '#04080a'; g.beginPath(); g.ellipse(x, y, 17, 2, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    drawPlate(g, x, y + (m === 'sinkTell' ? R((1 - e.modeT / FK.sinkTell) * 14) : 0), f, { stance: S.stance, mode: FKM.fkOpen(e) ? 'empty' : m, alpha, visor: 1, sag: 0, flash, p: prog(e) }, time);
    if (m === 'sleep') ctx.text('...', x + 8 * f, y - 48, '#c8d8e8', 'center', 6);
    if (e.guardFx > 0) { g.fillStyle = '#ffffff'; g.fillRect(x + f * 11 - 3, y - 50, 6, 20); }
  };
  /* THE DEATH: the plate falls where it stood and lies in a heap, the fog going off over the water (drawn after he is dead: src/redraw/fog_knight_art.js drawDeadPlate) */
  H.drawDead = (g, cx, cy, time) => { if (!S || !S.dead) return; const D = S.dead; if (D.t0 === null) D.t0 = time; ART.drawDeadPlate(g, R(D.x - cx), R(D.y - cy), D.f, (time - D.t0) / 1.6, time); };
  /* THE DOUBLE, THE CHAIN, THE WAVE, THE SPEARS, THE SHADOW, THE STANCE AND THE READ */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'fogknight') return; const G = S.G;
    const light = (x, y) => (ctx.lightAt ? ctx.lightAt(x, y) : 0);
    if (S.dbl) { const D = S.dbl; drawPlate(g, R(D.x - cx), R(G.floorY - cy), D.face || 1, { stance: D.stance, mode: D.mode, alpha: 0.62, visor: 0, sag: 0, double: true, p: 0 }, time);
      if (D.mode === 'cutTell') ctx.text('!', R(D.x - cx), R(G.floorY - 54 - cy), '#ffd36b', 'center', 7);
      if (!S.told.dblWord) ctx.text('MIST', R(D.x - cx), R(G.floorY - 46 - cy), '#c8d8e8', 'center', 5); }
    /* THE TOWROPE: a rusted chain from his thrown hand to its hook */
    if (S.lash) { const L = S.lash; ART.drawChain(g, R(e.x + (e.face || 1) * 22 - cx), R(e.y - 38 - cy), R(L.x - cx), R(L.y - cy), time, !!S.hooked); }
    /* THE GAUGE AT THE GATE in his surge's windup: the tide staff, a white crest climbing it (the water about to come) */
    if (e.mode === 'surgeTell') { const k = 1 - Math.max(0, e.modeT) / FK.surgeTell, gx = R(G.gateX - cx), fy = R(G.floorY - cy); ART.drawGateCrest(g, gx, fy, k, time, 70);
      if (Math.floor(time * 8) % 2) ctx.text('!!', gx, fy - 80, '#ff6b6b', 'center', 7); }
    /* THE WALL OF WATER */
    if (S.wave) { ART.drawWave(g, R(S.wave.x - cx), R(G.floorY - cy), R(Math.min(160, G.gateX - S.wave.x)), FK.surgeH, time); }
    /* THE SPEARS' SPOTS (told): faint on the bank - BRIGHT where a light falls on them (your lantern shows where they rise); the lances when they burst */
    if (S.spears) for (const sp of S.spears.spots) { const sx = R(sp.x - cx), fy = R(G.floorY - cy), lt = light(sp.x, G.floorY - 8);
      if (sp.on) ART.drawLance(g, sx, fy, FK.spearH, time); else if (!sp.done) ART.drawSpearSpot(g, sx, fy, lt, time); }
    /* THE DISSOLVE PLUNGE: his shadow on the lit spot, and the glow of him above it */
    if (e.mode === 'plungeTell' && S.plunge && S.plunge.x !== null) { const sx = R(S.plunge.x - cx), fy = R(G.floorY - cy), k = 1 - Math.max(0, e.modeT) / FK.plungeTell; ART.drawPlungeShadow(g, sx, fy, k, time);
      if (Math.floor(time * 8) % 2) ctx.text('!!', sx, fy - 46, '#ff6b6b', 'center', 7); }
    if (e.mode === 'dissolve' && S.stepTo != null) { g.strokeStyle = 'rgba(200,208,216,0.6)'; g.setLineDash([2, 3]); g.beginPath(); g.arc(R(S.stepTo - cx), R(G.floorY - 16 - cy), 14, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }   /* where he will re-form (B12: always followable) */
    if (FKM.fkGone(e) && e.mode !== 'plungeTell') return;
    const x = R(e.x - cx), y = R(e.y - FK.h / 2 - cy);
    /* THE TOLD MOVE's WORD over him while it winds up */
    if (WORD && /Tell$/.test(e.mode)) ctx.text(WORD.line, x, R(e.y - FK.h - 52 - cy), Math.floor(time * 6) % 2 ? '#ff9a7a' : '#ffffff', 'center', 5);
    /* THE STANCE, named over him (on guard) with an ARROW where a blow lands; a stance he is taking blinks in */
    if (!FKM.fkOpen(e) && !(S.ward > 0) && e.mode !== 'sleep' && e.mode !== 'wake' && e.mode !== 'dissolve') {
      const st = e.mode === 'stanceTell' && S.want ? S.want : S.stance, blink = e.mode === 'stanceTell' && Math.floor(time * 10) % 2, col = blink ? '#ffffff' : st === 'full' ? '#c8d8e8' : st === 'high' ? '#e8d8a0' : '#a8d0e8';
      if (!FKM.committed(e)) { ctx.text(FKM.STANCE_WORD[st], x, R(e.y - FK.h - 32 - cy), col, 'center', 5);
        const ax = x + (e.face || 1) * -16, ay = st === 'high' ? R(e.y - 8 - cy) : st === 'low' ? R(e.y - 34 - cy) : R(e.y - FK.h - 18 - cy);   /* the arrow: low (under his shield), high (over his planted sword), from above (on his full guard) */
        g.fillStyle = col; if (st === 'full') { g.fillRect(x - 1, ay - 6, 3, 6); g.fillRect(x - 3, ay, 7, 1); g.fillRect(x - 2, ay + 1, 5, 1); }
        else { g.fillRect(ax - 4, ay, 8, 2); g.fillRect(ax + (e.face || 1) * 3, ay - 2, 2, 6); } } }
    /* THE BURN: a bar over him, filling while a lit lantern is near, and its word */
    if (S.burn > 0.01 && !FKM.fkOpen(e)) { const by = R(e.y - FK.h - 22 - cy); g.fillStyle = '#1b1626'; g.fillRect(x - 16, by, 32, 3); g.fillStyle = '#ff9a3c'; g.fillRect(x - 16, by, R(32 * S.burn), 3);
      if (S.burn > 0.3) ctx.text('BURNING', x, by - 7, '#ffb46a', 'center', 4); }
    if (FKM.fkOpen(e)) { const kk = Math.max(0, e.open / FK.openT);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = R(e.y - FK.h - 28 - cy); ctx.text('OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * Math.min(1, kk)), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 28, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, R(e.y - FK.h - 24 - cy), '#c8d8e8', 'center', 5); }
    if (e.mode === 'reel') ctx.text('REELING', x, R(e.y - FK.h - 24 - cy), '#8fd160', 'center', 5);
    if (e.mode === 'plungeRec') ctx.text('STUCK IN THE STONES', x, R(e.y - FK.h - 24 - cy), '#8fd160', 'center', 4);
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, R(e.y - FK.h - 44 - cy) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
