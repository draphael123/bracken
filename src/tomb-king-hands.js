// src/tomb-king-hands.js - THE TOMB-KING'S SARCOPHAGUS's HANDS (claude/pyramidboss, the Opus lane B). src/tomb-king.js is the fight (pure: his moves, his three
// phases, the flip, the switches, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once a blow; a shield turns only the yellow
// ones), THE SWITCHES (a hero's blow on a lever: strike), THE CHAMBER'S TRAPS (the level's own plates: src/sealed-pyramid-hands.js fires them, asks trapsOn() whether
// they are armed yet, presses a plate under him or his thrown lid - pressers() - and tells him when one lands: trapHit), THE DEAD of his Grave Call (mummies and
// tomb guards out of the floor alcoves, through the level's own spawn), the chain that hauls you, the sand that slows and blinds you - and the drawing.
// PLACEHOLDER ART (readable, lane C draws it): every move its OWN windup and release pose (B16) - the lid reared for the slam and brought down, the arm drawn back
// for the lash and whipped out, the crouch and the leap, the chest chain coiled and thrown, the lid cracked for the call, the lid lifted and thrown, the jars
// raised and slung, the coffin tipped for the roll and rolling, the face-slot breathing, the stomp, the glow of the curse - and FLIPPED (on his back, the lid off,
// the pharaoh in his wrappings showing). THE SHARED READ (B10): FLIPPED = a gold ring and a timer bar; WARDED = a pale ring and the word; SEALED = a turned
// share CLANKS, sparks and says SEALED (the first times: what to do about it).
// main.js calls: spawnBoss, owns, on, update, take, trapHit, strike, phase, trapsOn, pressers, drawBack, drawBoss, drawOver, barName, end, read, show, clear.
import * as TKM from './tomb-king.js';
import { BOSS_PHASE } from './boss-music.js';
const { TK } = TKM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slam: s => (s.boom || s.thud)(), lash: s => (s.slash || s.tell)(), roar: s => (s.roar || s.boom)(),
  thud: s => (s.thud || s.stone || s.clank)(), chain: s => (s.ratchet || s.clank || s.tell)(), throw: s => (s.throwWhoosh || s.slash || s.tell)(), roll: s => (s.boom || s.stone || s.thud)(),
  breath: s => (s.hiss || s.puff || s.slash)(), curse: s => (s.crack || s.tell)(), rumble: s => (s.boom || s.crack || s.thud)(), open: s => (s.crack || s.clank)(), clamp: s => (s.clank || s.thud)(),
  lever: s => (s.click || s.clank)(), swing: s => (s.ratchet || s.clank)(), ratchet: s => (s.ratchet || s.click || s.clank)(), cut: s => (s.crack || s.clank)() };

export function makeTombKingHands(ctx) {
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'tombking' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'tombking';
  H.phase = () => (S ? S.ph : 1);
  H.clear = () => { killDead(); S = null; BOSS_PHASE.tombking = 1; };
  /* THE TRAPS ARM in phase two (src/sealed-pyramid-hands.js asks this for every trap the arena marks tk) */
  H.trapsOn = () => !!(S && S.trapsOn && ctx.bossActive);
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'tombking' ? e : null; };
  /* WHAT PRESSES THE CHAMBER'S PLATES besides feet and the dead: HE does, standing (tkPresses: not while he walks - he steps over them), and his thrown lid */
  H.pressers = () => { const out = [], e = live(); if (!S || !e || !ctx.bossActive) return out;
    if (TKM.tkPresses(e) && Math.abs(e.y - S.G.floorY) < 3) out.push({ x: e.x, y: e.y, boss: true, who: e, w: TK.w });
    if (S.lid && !S.lid.home) out.push({ x: S.lid.x, y: S.G.floorY, lid: true, who: S.lid, w: 12 });
    return out; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.tkKeys = pp.tkKeys || new Map(); if (pp.tkKeys.size > 120) pp.tkKeys.clear(); if (pp.tkKeys.has(key)) return true; pp.tkKeys.set(key, 1); return false; };

  /* THE DEAD of his Grave Call: spawned through the level's own spawn (mummies tread the plates, the bones do not); killed with him */
  function killDead() { if (!S) return; for (const d of S.dead) if (d && d.alive) { d.alive = false; ctx.burst && ctx.burst(d.x, d.y - 8, 8, ['#d8ccaa', '#9c8e6c'], 60, 0.5); } S.dead = []; }
  const deadAlive = () => (S ? S.dead.filter(d => d && d.alive).length : 0);

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = TKM.newFight(TKM.geom(Ar, ctx.TS)); BOSS_PHASE.tombking = 1;
    const e = { ...base, t: 'tombking', w: TK.w, h: TK.h, hp: ctx.EHP.tombking, maxHp: ctx.EHP.tombking, noGrav: true, markH: TK.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, boss: true };
    e.x = S.G.start; e.y = S.G.floorY; for (const pp of ctx.players) { pp.tkKeys = null; pp.tkBlindT = 0; pp.tkSlowT = 0; } return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp, atk: pp.atk }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(), rng: () => Math.random(),
      music: ph => { BOSS_PHASE.tombking = ph; if (ctx.music) ctx.music(ph > 1 ? 'tombking:p' + ph : 'tombking'); },
      mark: m => ctx.number(e.x, e.y - TK.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      traps: on => { S.trapsOn = !!on; },
      fx: (k, x, y) => {
        if (k === 'open') { ctx.ring(x, y - 16, 36, '#ffd36b'); ctx.burst(x, y - 20, 14, ['#d8c8a0', '#a89070', '#d8aa40'], 100, 0.7); }
        else if (k === 'ward') ctx.ring(x, y - 16, 38, '#c8d8e8');
        else if (k === 'slam' || k === 'land' || k === 'pit') ctx.burst(x, y - 4, 16, ['#d8c8a0', '#a89070', '#6e5a3c'], 110, 0.6);
        else if (k === 'jar') ctx.burst(x, y - 6, 10, ['#9ad04a', '#d8f080', '#b8a078'], 70, 0.5);
        else if (k === 'curse') ctx.burst(x, y - 30, 18, ['#e8d0a0', '#d8aa40', '#a89070'], 120, 0.7); },
      hit: (bx, d, name, o = {}) => { const out = []; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock }); });
          if (res === 'hit' && o.venom) pp.venomT = Math.max(pp.venomT || 0, 1.2);
          out.push({ pp, res }); }); return out; },
      haul: (pp, dx) => { if (pp && !pp.dead && dx) ctx.moveBody(pp, dx, 0); },
      cutting: pp => !!pp && pp.atk >= 0 && pp.atk < 0.2,
      blind: (pp, t) => { pp.tkBlindT = Math.max(pp.tkBlindT || 0, t); },
      slow: (pp, t) => { pp.tkSlowT = Math.max(pp.tkSlowT || 0, t); },
      slowIn: (x0, x1, y) => { for (const pp of ctx.players) if (!pp.dead && pp.ground && pp.x > x0 && pp.x < x1 && Math.abs(pp.y - y) < 4) pp.tkSlowT = Math.max(pp.tkSlowT || 0, 0.15); },
      deadAlive,
      call: (n, xs) => { const ts = ctx.TS, row = Math.round(S.G.floorY / ts) - 1;
        for (let i = 0; i < n; i++) { const x = xs[i % xs.length], skel = i % 2 === 1;
          const d = ctx.spawnEnt ? ctx.spawnEnt({ t: 'mummy', x: Math.floor(x / ts), y: row, face: x < e.x ? 1 : -1, cnSkin: skel ? 'tombskel' : undefined }, 'tkdead' + S.n.called + '.' + i) : null;
          if (d) { d.hp = Math.max(1, Math.round(d.hp * TK_DEAD_HP)); d.tkDead = true; d.noXp = true; S.dead.push(d); ctx.burst(x, S.G.floorY - 4, 12, ['#d8c8a0', '#6e5a3c', '#1c140c'], 80, 0.6); } }
        S.alcoveT = 0.8; },
    };
  }
  const TK_DEAD_HP = 0.55;   /* (his dead are the level's own, lighter: a call is a few blows' work, not a second fight) */

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 74, TKM.TK_SAY.wake, '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 150, TKM.TK_SAY.rule, '#ffd36b'); }
    TKM.stepTombKing(e, S, dt, heroes(), world(e));
    e.phase = S.ph; if (S.alcoveT > 0) S.alcoveT -= dt;
    /* the sand on you: blind and slowed (the pace cap: main.js reads syrupT) */
    for (const pp of ctx.players) { if (pp.tkBlindT > 0) pp.tkBlindT = Math.max(0, pp.tkBlindT - dt); if (pp.tkSlowT > 0) { pp.tkSlowT = Math.max(0, pp.tkSlowT - dt); pp.syrupT = pp.tkSlowT > 0 ? 0.1 : 0; } }
  };
  /* THE RULE ON HIM: one of the chamber's traps lands on him (src/sealed-pyramid-hands.js) - or a plate HE stands on fires (src = 'plate') */
  H.trapHit = (e, kind, t, src) => { const b = live(); if (!S || !b || b !== e || !ctx.bossActive) return 'busy'; const w = world(e);
    if (src === 'plate') { S.n.onPlate++; ctx.number(e.x, e.y - 80, TKM.TK_SAY.onPlate, '#ff9a5c'); }
    if (e.mode === 'roll' && src === 'plate') { S.n.trips++; ctx.number(e.x, e.y - 80, TKM.TK_SAY.trip, '#ff9a5c'); }
    return TKM.flip(e, S, w, kind === 'stone' ? 'block' : kind); };
  /* A HERO'S BLOW (main.js attackBox): on a SWITCH, it throws the counterweight */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return;
    for (const g of S.G.levers) { const L = S.levers.find(l => l.side === g.side), box = { l: g.x - 8, r: g.x + 8, t: g.y0, b: g.y1 };
      if (hb.l < box.r && hb.r > box.l && hb.t < box.b && hb.b > box.t && ctx.hitOnce(L)) TKM.strikeLever(S, world(e), g.side); } };
  /* A BLOW ON HIM (B15; src/tomb-king.js takeBlow) - the turned share clanks and says why */
  H.take = (e, dmg) => { if (!S) return dmg; const t = ctx.time(), [d, word] = TKM.takeBlow(e, S, dmg);
    if (word) { e.chipHit = t; e.guardFx = 0.25; e.guardWord = word; if (!TKM.tkOpen(e)) { ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 14, e.y - 22, sd, 4); } }
    return d; };
  H.barName = e => "THE TOMB-KING'S SARCOPHAGUS" + (TKM.tkOpen(e) ? '  ' + (TKM.OPEN_NAME[e.openKind] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { if (S) { S.lid = null; S.jars = []; S.clouds = []; S.pits = []; S.curses = []; S.chain = null; S.reel = null; S.shock = null; S.roll = null; S.breath = null; S.trapsOn = false; killDead(); }
    for (const pp of ctx.players) { pp.tkBlindT = 0; pp.tkSlowT = 0; } BOSS_PHASE.tombking = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, open: ctx.boss ? ctx.boss.open : 0, openKind: ctx.boss && ctx.boss.openKind, traps: !!S.trapsOn, dead: deadAlive(),
    levers: S.levers.map(l => ({ side: l.side, st: l.st })), n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  /* (the bot's eyes on the dead: where they stand) */
  H.deadNear = () => (S ? S.dead.filter(d => d && d.alive).map(d => ({ x: d.x, y: d.y })) : []);
  H.reeled = pp => !!(S && S.reel && S.reel.pp === pp);

  /* ---------- DRAWING: PLACEHOLDER SHAPES (lane C draws him), every move its OWN pose (B16) ---------- */
  const C = { stone: '#9c8660', stoneL: '#cdb88a', stoneD: '#5e4c34', ink: '#1c140c', gold: '#d8aa40', goldL: '#f6dc80', lapis: '#2e4a8a', lapisL: '#6a8ad8', linen: '#e0d4b0', linenD: '#a89870',
    sand: '#d8c8a0', sandD: '#a89070', acid: '#9ad04a', acidL: '#e0ff90', red: '#ff6b6b' };
  const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
  const ell = (g, x, y, rx, ry, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(R(x), R(y), Math.max(1, rx), Math.max(1, ry), 0, 0, 7); g.fill(); };
  /* THE POSE A MODE WEARS: { tilt (rad, + leans toward his face), lift (px the lid rides up), arm (the front arm: 'down' | 'up' | 'back' | 'out' | 'cross' | 'chain' | 'jars'),
     squat (px), glow (the face slot's colour), lidOff, lying } - windup and release are never the same picture */
  const POSE = {
    sleep: { tilt: 0, arm: 'cross', glow: null }, wake: { tilt: 0, arm: 'cross', glow: C.goldL }, walk: { tilt: 0.04, arm: 'down' }, recover: { tilt: 0, arm: 'down' },
    slamTell: { tilt: -0.28, lift: 6, arm: 'up', squat: 0 }, slam: { tilt: 0.55, arm: 'down', squat: 3 },
    lashTell: { tilt: -0.1, arm: 'back' }, lash: { tilt: 0.12, arm: 'out' },
    leapTell: { tilt: 0, arm: 'up', squat: 8, glow: C.red }, leap: { tilt: 0.1, arm: 'up', squat: -4 }, perch: { tilt: 0, arm: 'down', squat: 2 }, drop: { tilt: 0.1, arm: 'up' },
    reelTell: { tilt: -0.12, arm: 'chain', glow: C.goldL }, reel: { tilt: 0.06, arm: 'out' },
    callTell: { tilt: 0, arm: 'up', lift: 3, glow: '#8fd160' }, call: { tilt: 0, arm: 'out', lift: 2 },
    throwTell: { tilt: -0.2, arm: 'up', lift: 10 }, throw: { tilt: 0.3, arm: 'out', lidOff: true }, lidless: { tilt: 0, arm: 'cross', lidOff: true }, catch: { tilt: 0, arm: 'up', lift: 4 },
    volleyTell: { tilt: -0.15, arm: 'jars' }, volley: { tilt: 0.2, arm: 'out' },
    rollTell: { tilt: 0.9, arm: 'cross', squat: 4 }, roll: { lying: true }, rollEnd: { lying: true, dazed: true },
    breathTell: { tilt: -0.08, arm: 'back', glow: C.sand }, breath: { tilt: 0.1, arm: 'down', glow: '#fff6c8' },
    pitTell: { tilt: 0, arm: 'up', squat: -3 }, pit: { tilt: 0, arm: 'down', squat: 6 },
    curseTell: { tilt: 0, arm: 'up', glow: '#ff6b6b' }, curse: { tilt: 0, arm: 'out', glow: '#ffd36b' },
    flipped: { lying: true, lidOff: true }, clamp: { tilt: 0, arm: 'cross', lift: 8 },
  };
  /* the sarcophagus, standing (its foot at 0,0, facing +x), in a pose */
  function drawStanding(g, p, flash, time, ph) {
    const sq = p.squat || 0, Hh = TK.h - sq, W = TK.w;
    g.save(); g.rotate((p.tilt || 0) * 0.6);
    /* stone legs */ rect(g, -10, -8, 7, 8, C.stoneD); rect(g, 3, -8, 7, 8, C.stoneD); rect(g, -11, -2, 9, 2, C.ink); rect(g, 2, -2, 9, 2, C.ink);
    /* the box */ rect(g, -W / 2, -Hh, W, Hh - 6, flash ? '#fff' : C.stone); rect(g, -W / 2, -Hh, 2, Hh - 6, C.stoneL); rect(g, W / 2 - 2, -Hh, 2, Hh - 6, C.stoneD);
    /* the lid (the king's gilt face on it) - lifted or off */
    const lift = p.lift || 0;
    if (!p.lidOff) { const ly = -Hh - lift; rect(g, -W / 2 - 1, ly, W + 2, Hh - 8, flash ? '#fff' : C.stoneL); rect(g, -W / 2 + 4, ly + 3, W - 8, 13, C.gold); rect(g, -W / 2 + 6, ly + 4, W - 12, 4, C.lapis);
      rect(g, -3, ly + 8, 2, 2, p.glow || C.ink); rect(g, 3, ly + 8, 2, 2, p.glow || C.ink); rect(g, -W / 2 + 6, ly + 18, W - 12, 2, C.lapisL); rect(g, -W / 2 + 8, ly + 22, W - 16, 10, C.gold);
      if (ph >= 3) { rect(g, -2, ly + 2, 1, 20, C.ink); rect(g, -1, ly + 20, 6, 1, C.ink); rect(g, 4, ly + 20, 1, 9, C.ink); } }
    else { /* the pharaoh inside: linen wrappings and a gold mask */ rect(g, -W / 2 + 3, -Hh + 2, W - 6, Hh - 10, C.ink); rect(g, -6, -Hh + 4, 12, Hh - 14, C.linen); for (let k = 0; k < 6; k++) rect(g, -6, -Hh + 7 + k * 5, 12, 1, C.linenD); rect(g, -5, -Hh + 4, 10, 8, C.gold); rect(g, -3, -Hh + 7, 2, 1, C.ink); rect(g, 1, -Hh + 7, 2, 1, C.ink); }
    /* the arms (stone, out of the box's sides) */
    const ay = -Hh + 16, arm = p.arm || 'down';
    if (arm === 'down') { rect(g, W / 2, ay, 5, 18, C.stoneD); rect(g, -W / 2 - 5, ay, 5, 18, C.stoneD); }
    else if (arm === 'up') { rect(g, W / 2, ay - 18, 5, 20, C.stoneD); rect(g, -W / 2 - 5, ay - 18, 5, 20, C.stoneD); rect(g, W / 2 - 1, ay - 22, 7, 5, C.stone); rect(g, -W / 2 - 6, ay - 22, 7, 5, C.stone); }
    else if (arm === 'back') { rect(g, -W / 2 - 16, ay - 2, 16, 5, C.stoneD); rect(g, -W / 2 - 5, ay, 5, 16, C.stoneD); for (let k = 0; k < 4; k++) rect(g, -W / 2 - 22 - k * 4, ay - 4 + k, 4, 2, C.linen); }
    else if (arm === 'out') { rect(g, W / 2, ay - 1, 18, 5, C.stoneD); rect(g, W / 2 + 16, ay - 3, 5, 9, C.stone); rect(g, -W / 2 - 5, ay, 5, 16, C.stoneD); }
    else if (arm === 'cross') { rect(g, -W / 2 + 2, ay + 2, W - 4, 4, C.stoneD); rect(g, -W / 2 + 2, ay + 8, W - 4, 4, C.stoneD); rect(g, -3, ay, 6, 14, C.gold); }
    else if (arm === 'chain') { rect(g, W / 2, ay, 5, 16, C.stoneD); rect(g, -W / 2 - 5, ay, 5, 16, C.stoneD); for (let k = 0; k < 5; k++) { const a = time * 9 + k * 1.3; rect(g, R(Math.cos(a) * 7), R(ay + 8 + Math.sin(a) * 5), 3, 3, '#8a8478'); } rect(g, -3, ay + 4, 6, 6, '#5d594e'); }
    else if (arm === 'jars') { rect(g, W / 2, ay - 14, 5, 16, C.stoneD); rect(g, -W / 2 - 5, ay - 14, 5, 16, C.stoneD); for (const jx of [W / 2 - 1, -W / 2 - 6]) { rect(g, jx, ay - 24, 7, 10, '#c8b48a'); rect(g, jx + 1, ay - 27, 5, 3, '#2e8a6a'); } }
    g.restore();
  }
  function drawLying(g, p, flash, time) {   /* on his back (flipped) or on his side (rolling): long along the floor */
    const W = TK.h + 4, Hh = TK.w - 6;
    rect(g, -W / 2, -Hh, W, Hh, flash ? '#fff' : C.stone); rect(g, -W / 2, -Hh, W, 2, C.stoneL);
    if (p.lidOff) { rect(g, -W / 2 + 3, -Hh + 3, W - 6, Hh - 6, C.ink); rect(g, -W / 2 + 6, -Hh + 6, W - 14, Hh - 10, C.linen); for (let k = 0; k < 6; k++) rect(g, -W / 2 + 8 + k * 5, -Hh + 6, 1, Hh - 10, C.linenD); rect(g, W / 2 - 12, -Hh + 5, 8, Hh - 9, C.gold);
      for (const lx of [-8, 6]) rect(g, lx, -2, 6, 6, C.stoneD); }
    else { const sp = (time * 12) % 6; for (let k = 0; k < 4; k++) rect(g, -W / 2 + ((k * 12 + sp * 2) % W), -Hh + 2, 2, Hh - 4, C.stoneD); rect(g, -6, -Hh + 4, 12, Hh - 8, C.gold); }
    if (p.dazed) { for (let i = 0; i < 3; i++) { const a = time * 6 + i * 2.1; rect(g, R(Math.cos(a) * 10), R(-Hh - 8 + Math.sin(a) * 3), 2, 2, C.goldL); } }
  }
  /* the chamber's own pieces behind him: the two SWITCHES (a lever on the wall: up = ready, thrown, winding back - its gauge) and their COUNTERWEIGHTS on their chains,
     THE FLOOR ALCOVES his dead climb out of */
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const G = S.G;
    for (const gl of G.levers) { const L = S.levers.find(l => l.side === gl.side), x = R(gl.x - cx), y0 = R(gl.y0 - cy), y1 = R(gl.y1 - cy);
      rect(g, x - 7, y0 - 2, 14, y1 - y0 + 4, '#3a2e20'); rect(g, x - 6, y0 - 1, 12, 2, '#6e5a3c');
      g.save(); g.translate(x, y1 - 8); g.rotate((L.st === 'ready' ? -0.7 : 0.7) * gl.side * -1); rect(g, -1, -22, 3, 22, '#b0743a'); rect(g, -3, -26, 7, 5, L.st === 'ready' ? C.goldL : '#8a7450'); g.restore();
      if (L.st === 'ready' && ctx.bossActive) { g.globalAlpha = 0.4 + 0.3 * Math.sin(time * 5); g.strokeStyle = C.goldL; g.strokeRect(x - 8.5, y0 - 3.5, 17, y1 - y0 + 7); g.globalAlpha = 1; }
      if (L.st === 'reset') { const k = 1 - L.t / TK.lever.reset[S.ph - 1]; rect(g, x - 8, y1 + 2, 16, 3, '#1c140c'); rect(g, x - 8, y1 + 2, R(16 * Math.max(0, Math.min(1, k))), 3, '#d8aa40'); }
      /* its COUNTERWEIGHT: a stone on a chain from the roof - at rest by the wall, swinging across the sweep when thrown */
      const ax = gl.anchor - cx, ay = G.roofY - cy, rest = gl.side < 0 ? gl.sweep[0] + 8 : gl.sweep[1] - 8, wx = (L.st === 'swing' && L.x != null ? L.x : L.st === 'pulled' ? rest + gl.side * -6 * Math.sin(time * 30) : rest) - cx, wy = G.floorY - TK.lever.h - cy + (L.st === 'swing' ? 6 : -40);
      g.strokeStyle = '#8a8478'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(ax), R(ay)); g.lineTo(R(wx), R(wy)); g.stroke(); rect(g, ax - 4, ay, 8, 4, '#5d594e');
      rect(g, wx - 12, wy, 24, 22, C.stoneD); rect(g, wx - 11, wy + 1, 22, 2, C.stoneL); rect(g, wx - 4, wy + 7, 8, 8, '#efe3c0'); }
    for (const ax of G.alcoves) { const x = R(ax - cx), y = R(G.floorY - cy); rect(g, x - 9, y - 3, 18, 3, '#2a2016'); rect(g, x - 8, y - 3, 16, 1, S.alcoveT > 0 ? '#ff9a5c' : '#6e5a3c'); }
  };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, m = e.mode, x = e.x - cx, y = e.y - cy, flash = (e.hurtT || 0) > 0, p = POSE[m] || POSE.walk;
    g.globalAlpha = 0.3; ell(g, x, (m === 'leap' && S.leap ? S.leap.ty : e.y) - cy, 18, 3, '#10060a'); g.globalAlpha = 1;
    g.save(); g.translate(R(x), R(y)); g.scale(f, 1);
    if (p.lying) { if (m === 'roll') g.rotate(Math.sin(time * 18) * 0.08); drawLying(g, p, flash, time); }
    else { const bob = m === 'walk' ? (Math.floor(time * 6) & 1) : 0; g.translate(0, -bob); drawStanding(g, p, flash, time, S.ph); }
    g.restore();
    if (e.guardFx > 0) { g.fillStyle = '#fff6c8'; g.fillRect(R(x + f * 16 - 2), R(y - 30), 5, 14); }
  };
  /* his projectiles and marks, the counterweight's swing, the sand on you, and THE READ (B10) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'tombking') return; const G = S.G;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', X = v => R(v - cx), Y = v => R(v - cy);
    /* the leap's shadow on the platform he will land on (the tell) */
    if ((m => m === 'leapTell' || m === 'leap')(e.mode) && S.leap) { const q = S.leap; g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 14); ell(g, X(q.tx), Y(q.ty) - 1, TK.leap.r, 4, '#10060a'); g.globalAlpha = 1; g.strokeStyle = blink; g.strokeRect(X(q.tx) - TK.leap.r, Y(q.ty) - 3, TK.leap.r * 2, 3); }
    if (S.shock) { const q = S.shock; for (let k = 0; k < 4; k++) rect(g, X(q.x) - q.dir * k * 6 - 3, Y(G.floorY) - 4 - (k % 2) * 3, 6, 4, k ? C.sandD : C.sand); }
    if (S.lashAt) { const q = S.lashAt; g.strokeStyle = C.linen; g.lineWidth = 2; g.beginPath(); g.moveTo(X(q.x0), Y(q.y) - 22); g.quadraticCurveTo(X((q.x0 + q.x1) / 2), Y(q.y) - 34, X(q.x1), Y(q.y) - 12); g.stroke(); g.lineWidth = 1; }
    if (S.chain) { const q = S.chain; g.strokeStyle = '#9a958c'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(e.x), Y(e.y - 26)); g.lineTo(X(q.x), Y(q.y)); g.stroke(); g.lineWidth = 1; rect(g, X(q.x) - 3, Y(q.y) - 3, 6, 6, '#5d594e'); }
    if (S.lid) { const q = S.lid, lx = X(q.x), ly = Y(G.floorY) - TK.thrw.r; g.save(); g.translate(lx, ly); g.rotate(q.spin); rect(g, -TK.thrw.r, -3, TK.thrw.r * 2, 6, C.stoneL); rect(g, -4, -3, 8, 6, C.gold); g.restore(); }
    for (const j of S.jars) { if (j.t < 0) continue; rect(g, X(j.x) - 3, Y(j.y) - 5, 7, 9, '#c8b48a'); rect(g, X(j.x) - 2, Y(j.y) - 7, 5, 2, '#2e8a6a'); }
    for (const mk of (S.jarMarks || [])) { const x = X(mk.x), y = Y(mk.y) - 2; g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 5, y - 5); g.lineTo(x + 5, y + 2); g.moveTo(x + 5, y - 5); g.lineTo(x - 5, y + 2); g.stroke(); }
    for (const q of S.jars) { const x = X(q.tx), y = Y(q.ty) - 2; g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 5, y - 5); g.lineTo(x + 5, y + 2); g.moveTo(x + 5, y - 5); g.lineTo(x - 5, y + 2); g.stroke(); }
    for (const q of S.clouds) { const a = Math.min(1, q.t * 2); g.globalAlpha = 0.45 * a; ell(g, X(q.x), Y(q.y) - 10, TK.volley.cloudR, 12, '#7ab83a'); g.globalAlpha = 0.3 * a; ell(g, X(q.x) + Math.sin(time * 3) * 4, Y(q.y) - 14, TK.volley.cloudR - 6, 8, '#c8f070'); g.globalAlpha = 1; }
    if (e.mode === 'pitTell' && S.pitMark) { g.strokeStyle = blink; g.beginPath(); g.ellipse(X(S.pitMark.x), Y(S.pitMark.y) - 1, TK.pit.r, 4, 0, 0, 7); g.stroke(); }
    for (const q of S.pits) { g.globalAlpha = Math.min(1, q.t); ell(g, X(q.x), Y(q.y) - 1, TK.pit.r, 4, '#6e5a3c'); ell(g, X(q.x), Y(q.y) - 1, TK.pit.r - 5, 2.5, '#2a2016'); for (let k = 0; k < 4; k++) { const a = time * 4 + k * 1.6; rect(g, X(q.x + Math.cos(a) * (TK.pit.r - 4)), Y(q.y) - 2, 2, 1, C.sand); } g.globalAlpha = 1; }
    for (const q of S.curses) { const x = X(q.x), y = Y(q.y); if (!q.done) { const k = 1 - q.t / TK.curse.delay; g.globalAlpha = 0.4 + 0.5 * k; g.strokeStyle = '#ff6b6b'; g.beginPath(); g.ellipse(x, y - 2, TK.curse.r + 4, 4, 0, 0, 7); g.stroke(); g.globalAlpha = 0.15 + 0.2 * k; rect(g, x - TK.curse.r, Y(G.roofY), TK.curse.r * 2, y - Y(G.roofY), '#d8aa40'); g.globalAlpha = 1; ctx.text('!!', x, y - 34, '#ff6b6b', 'center', 6); }
      else { g.globalAlpha = Math.max(0, 1 + q.t * 3); rect(g, x - TK.curse.r, Y(G.roofY), TK.curse.r * 2, y - Y(G.roofY), C.sand); g.globalAlpha = 1; } }
    if (S.breath && e.mode === 'breath') { const q = S.breath; g.globalAlpha = 0.5; g.fillStyle = C.sand; g.beginPath(); g.moveTo(X(e.x + q.dir * 12), Y(e.y - 30)); g.lineTo(X(e.x + q.dir * (12 + TK.breath.len)), Y(e.y - 60)); g.lineTo(X(e.x + q.dir * (12 + TK.breath.len)), Y(e.y)); g.closePath(); g.fill(); g.globalAlpha = 1; }
    if (e.mode === 'breathTell') { for (let k = 0; k < 5; k++) rect(g, X(e.x + (e.face || 1) * (16 + k * 4)), Y(e.y - 32 + Math.sin(time * 20 + k) * 2), 2, 2, C.sand); }
    if (e.mode === 'rollTell') { for (let k = 0; k < 4; k++) rect(g, X(e.x - (e.face || 1) * (18 + k * 4)), Y(G.floorY) - 2 - (k % 2), 3, 2, C.sandD); }
    /* THE SAND ON YOU: the screen's edge goes dark (blind) */
    const P0 = ctx.hero(); if (P0 && P0.tkBlindT > 0) { const k = Math.min(1, P0.tkBlindT), vw = ctx.VW(), vh = ctx.VH(), b = 70; g.globalAlpha = 0.75 * k; g.fillStyle = '#3a2c18'; g.fillRect(0, 0, vw, b); g.fillRect(0, vh - b, vw, b); g.fillRect(0, 0, b, vh); g.fillRect(vw - b, 0, b, vh); g.globalAlpha = 1; }
    /* THE READ (B10) */
    const x = X(e.x), y = Y(e.y - TK.h / 2);
    if (TKM.tkOpen(e)) { const kk = Math.max(0, e.open / TK.openT);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, Y(e.y - 12), 32, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = Y(e.y - 52); ctx.text(TKM.OPEN_NAME[e.openKind] || 'OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 34, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, Y(e.y - TK.h - 26), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, Y(e.y - TK.h - 40) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
