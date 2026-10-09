// src/hawk-mistress-hands.js - THE HAWK-MISTRESS's HANDS (claude/ksar, the greybox). src/hawk-mistress.js is the fight (pure: her three phases, her cycles,
// the hawk, her openings, the bot's reading); this binds it to the world: her told blows on the heroes (keyed once a blow; a shield turns only the yellow
// ones), THE COURTYARD's GONGS (the level's: src/ksar-hands.js rings and cuts them and tells her when a hero rings one - onRing), THE FLASKS (a flash in
// reach of her hawk - onFlash), her GUARD (phase two: a runner rings a gong, a door opens, a blade comes down), the burning store (phase three: the fire at
// the yard's ends, the roof ledges crumbling), and the drawing (GREYBOX shapes until the art pass).
// THE SHARED READ (design standard B10): OPEN = a gold ring round her and a timer bar; WARDED = a pale shell ring and the word; HER GAUNTLET = a turned
// blow CLANKS, flashes and says HER GAUNTLET: GO ROUND / HIT HIGH (the first times) - never silent.
// main.js calls: spawnBoss, owns, on, update, take, drawBack, drawBoss, drawOver, barName, end, read, show, clear, onRing, onFlash, hawk.
import * as HMM from './hawk-mistress.js';
import { BOSS_PHASE } from './boss-music.js';
import * as KSA from './redraw/ksar_art.js';
const { HM } = HMM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), lash: s => (s.whip || s.slash)(), slash: s => (s.foeSlash || s.slash)(),
  hawk: s => (s.hawk || s.hiss)(), whistle: s => (s.whistle || s.bell || s.tell)(false), blast: s => (s.boom || s.crack)(), leap: s => (s.pJump || s.dodge || s.tell)(false), clank: s => (s.clank || s.parry)() };

export function makeHawkMistressHands(ctx) {
  let S = null, MS = null, HW = null;   /* her baked body (src/redraw/ksar_art.js bakeMistressSet) and her hawk's poses, baked on first use */
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'hawkmistress' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'hawkmistress';
  H.clear = () => { S = null; BOSS_PHASE.hawkmistress = 1; for (const pp of ctx.players) { pp.hmSnare = null; pp.hmCarry = null; } };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.hmKeys = pp.hmKeys || new Map(); if (pp.hmKeys.size > 80) pp.hmKeys.clear(); if (pp.hmKeys.has(key)) return true; pp.hmKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'hawkmistress' ? e : null; };
  let lastHit = [];
  const keyed2 = (pp, key) => !!(pp.hmKeys && pp.hmKeys.has(key));
  const hurtTally = (name, d) => { if (S && d > 0) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + d; } };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = HMM.newFight(HMM.geom(Ar, ctx.TS)); BOSS_PHASE.hawkmistress = 1;
    const e = { ...base, t: 'hawkmistress', w: HM.w, h: HM.h, hp: ctx.EHP.hawkmistress, maxHp: ctx.EHP.hawkmistress, noGrav: true, markH: HM.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.y = S.G.floorY; S.hawk.x = e.x; S.hawk.y = S.G.floorY - HM.hawkAlt; for (const pp of ctx.players) pp.hmKeys = null; return e; };

  /* ---------- THE WORLD AS SHE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, air: !pp.ground && !pp.climb, alive: ctx.upright(pp) && !pp.dead && !pp.hmCarry, pp }));
  const gongs = () => (ctx.gongs ? ctx.gongs() : []).filter(g => g.arena).map(g => ({ id: g.id, x: g.x * ctx.TS + 8, cut: g.cut, hum: g.hum }));
  const racks = () => (ctx.racks ? ctx.racks() : []).filter(s => s.arena).map(s => ({ id: s.id, x: s.x * ctx.TS + 8, n: s.left }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(),
      music: ph => { BOSS_PHASE.hawkmistress = ph; if (ctx.music) ctx.music(ph > 1 ? 'hawkmistress:p' + ph : 'hawkmistress'); },
      mark: m => ctx.number(e.x, e.y - HM.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => {
        if (k === 'land') ctx.burst(x, y - 4, 10, ['#c8a070', '#8a6a3a', '#e0c090'], 70, 0.5);
        else if (k === 'crack') ctx.burst(x, y - 10, 8, ['#e8d0a0', '#8a5a32'], 60, 0.4);
        else if (k === 'feint') ctx.dust(x, y, 3);
        else if (k === 'flash') { ctx.burst(x, y, 30, ['#ffffff', '#fff6c8', '#e8f4ff'], 140, 0.6); S.flashFx = 0.4; }
        else if (k === 'open') ctx.ring(x, y - 16, 30, '#ffd36b');
        else if (k === 'flinch') { ctx.burst(x, y, 12, ['#6a4428', '#e0caa0', '#ffffff'], 80, 0.5); ctx.ring(x, y, 14, '#ffd36b'); }
        else if (k === 'kick') ctx.dust(x, y, 4);
        else if (k === 'blast') { ctx.burst(x, y, 24, ['#ff9a3c', '#ffd36b', '#3a2a12', '#c9b27c'], 120, 0.7); ctx.ring(x, y, HM.kegR, '#ff9a3c'); }
        else if (k === 'shaftBlast') ctx.burst(x, y, 20, ['#ff9a3c', '#ffd36b', '#ff6a2a'], 140, 0.8);
        else if (k === 'ward') ctx.ring(x, y - 16, 34, '#9ab0c0');
        else if (k === 'mark') ctx.ring(x, y - 4, HM.diveR, '#ff6b6b'); },
      hit: (bx, d, name, o = {}) => { let any = false; lastHit = []; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock, low: !!o.low })); if (P.hp < hp0) { any = true; lastHit.push(pp); } }); return any; },
      /* (claude/ksar2) THE WHIP SNARE: the heroes it just wrapped are YANKED toward the nearest shaft until they jump or roll free */
      snare: () => { let any = false; for (const pp of lastHit) { const sh = HMM.nearestShaft(S.G, pp.x); if (!sh) continue; pp.hmSnare = { t: HM.snareHold, dir: Math.sign((sh[0] + sh[1]) / 2 - pp.x) || 1, t0: ctx.time() }; any = true; }
        if (any && !S.told.snared) { S.told.snared = 1; ctx.number(lastHit[0].x, lastHit[0].y - 34, 'SNARED! JUMP OR ROLL FREE', '#ff6b6b'); } return any; },
      /* a throwing knife: a ducking hero lets a HIGH one over him, a jump clears a LOW one (it flies at the floor), a shield turns any */
      knife: k => { let res = null; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (res === 'hit' || !ctx.upright(pp) || P.dead || keyed2(pp, k.key)) return;
          const b = ctx.box(P), kb = { l: k.x - HM.knifeR, r: k.x + HM.knifeR, t: k.y - 2, b: k.y + 2 }; if (!ctx.overlap(kb, b)) return;
          if (k.ht === 'high' && P.ducking) { keyed(pp, k.key); if (!(S.underSaid > ctx.time())) { S.underSaid = ctx.time() + 1; ctx.number(P.x, P.y - 22, 'UNDER THE KNIFE', '#bfe6f5'); } res = res || 'under'; return; }
          keyed(pp, k.key); const hp0 = P.hp, r = ctx.damagePlayer(k.x - Math.sign(k.vx) * 8, HM.dmg.knife, { who: e, name: HMM.MOVE_NAME.knife });
          hurtTally(HMM.MOVE_NAME.knife, hp0 - Math.max(0, P.hp)); res = r === 'blocked' ? 'blocked' : P.hp < hp0 ? 'hit' : (res || null); }); return res; },
      /* her rolling keg: a blade on it strikes it back; a body in its way sets it off */
      keg: K => { let res = null; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (res || !ctx.upright(pp) || P.dead) return;
          const kb = { l: K.x - 7, r: K.x + 7, t: S.G.floorY - 12, b: S.G.floorY }; const hb = P.atk >= 0 ? ctx.attackBox() : null;
          if (hb && ctx.overlap(hb, kb)) { res = 'struck'; return; } if (ctx.overlap(kb, ctx.box(P))) res = 'hit'; }); return res; },
      /* THE HAWK's own blows (the rake, the snatch): a blade in it first (it flinches), then a shield (it flinches), else it lands */
      hawkAt: (bx, d, name, key) => { const B = { l: bx[0], r: bx[1], t: bx[2], b: bx[3] }; let res = null; lastHit = [];
        for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (res || !ctx.upright(pp) || P.dead) return; const hb = P.atk >= 0 ? ctx.attackBox() : null;
          if (hb && ctx.overlap(hb, { l: S.hawk.x - 10, r: S.hawk.x + 10, t: S.hawk.y - 9, b: S.hawk.y + 9 })) res = 'struck'; });
        if (res) return res;
        for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (res || !ctx.upright(pp) || P.dead || !ctx.overlap(B, ctx.box(P)) || keyed(pp, key)) return;
          const hp0 = P.hp, r = ctx.damagePlayer(S.hawk.x, d, { who: e, name }); hurtTally(name, hp0 - Math.max(0, P.hp)); if (r === 'blocked') res = 'blocked'; else if (P.hp < hp0) { res = 'hit'; lastHit.push(pp); } }); return res; },
      /* THE SNATCH caught a hero: the hawk carries him over the shaft at x and lets go */
      carry: (tx, t) => { for (const pp of lastHit) { pp.hmCarry = { tx, t }; pp.hmSnare = null; } if (lastHit.length && !S.told.carry) { S.told.carry = 1; ctx.number(tx, S.G.floorY - 90, 'THE HAWK HAS YOU', '#ff6b6b'); } },
      gongs, guards: () => ctx.enemies().filter(q => q.alive && q.hmGuard).length,
      guardRing: id => { const r = ctx.ringGong ? ctx.ringGong(id, 'guard') : 'cut'; if (r !== 'rung') return false;
        const G = S.G, g = gongs().find(q => q.id === id), door = G.doors.slice().sort((a, b) => Math.abs(a - (g ? g.x : 0)) - Math.abs(b - (g ? g.x : 0)))[0];
        const b = ctx.spawnGuard(door, G.floorY); if (b) { b.hmGuard = true; ctx.burst(door, G.floorY - 12, 8, ['#a8302a', '#5a1e1e'], 40, 0.5); if (!S.told.guard) { S.told.guard = 1; ctx.number(door, G.floorY - 50, 'THE GONG CALLS HER GUARD DOWN', '#ff9a5c'); } } return !!b; },
      crumble: () => { /* a roof ledge loses a tile off an end (the longest first; never under 2 tiles) */
        const G = S.G; S.ledgeLen = S.ledgeLen || G.ledges.map(l => ({ ...l, a: l.c0, b: l.c1 }));
        const l = S.ledgeLen.filter(q => q.b - q.a >= 2).sort((p, q) => (q.b - q.a) - (p.b - p.a))[0]; if (!l) return false;
        const c = (S.n.crumbles % 2) ? l.a++ : l.b--; ctx.cellOpen(c, l.row); ctx.burst(c * ctx.TS + 8, l.row * ctx.TS + 4, 8, ['#b08a5a', '#ff9a3c', '#3a2a12'], 60, 0.7); ctx.sfx.crack && ctx.sfx.crack();
        if (!S.told.roof) { S.told.roof = 1; ctx.number(c * ctx.TS, l.row * ctx.TS - 30, 'THE ROOF GOES', '#ff6b6b'); } return true; },
    };
  }

  /* ---------- ONE FRAME OF HER ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 80, 'THE HAWK-MISTRESS, CHIEF OF THE KSAR', '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 110, 'HER HAWK IS HER EYES: A GONG SENDS IT OFF, A FLASH BLINDS IT', '#ffd36b'); }
    HMM.stepHawkMistress(e, S, dt, heroes(), world(e));
    /* (claude/ksar2) THE SNARE'S YANK (jump or roll breaks it) and THE SNATCH's carry (over a shaft, then let go) */
    for (const pp of ctx.players) {
      if (pp.hmSnare) { const q = pp.hmSnare; q.t -= dt;
        if (pp.dead || q.t <= 0 || pp.ksLift || pp.dodge > 0 || (!pp.ground && pp.vy < -60)) { if (!pp.dead && q.t > 0 && !pp.ksLift) { ctx.number(pp.x, pp.y - 30, 'YOU BREAK FREE OF THE WHIP', '#8fd160'); S.n.snareBroke = (S.n.snareBroke || 0) + 1; } pp.hmSnare = null; }
        else { pp.vx = q.dir * HM.snarePull; if (Math.random() < dt * 12) ctx.dust(pp.x, pp.y, 1); } }
      if (pp.hmCarry) { const q = pp.hmCarry; q.t -= dt; pp.x += (q.tx - pp.x) * Math.min(1, dt * 7); pp.y += (S.G.floorY - 62 - pp.y) * Math.min(1, dt * 7); pp.vx = 0; pp.vy = 0; pp.ground = false;
        if (q.t <= 0 || pp.dead) { pp.hmCarry = null; pp.x = q.tx; pp.vy = 40; if (!pp.dead) ctx.number(pp.x, pp.y - 20, 'THE HAWK LETS YOU GO', '#ff9a5c'); } } }
    e.phase = S.ph; S.flashFx = Math.max(0, (S.flashFx || 0) - dt);
    /* A BLADE THROUGH THE HAWK: nothing there (it is her kit, not a foe) */
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !(P.atk >= 0)) return; const hb = ctx.attackBox(); if (!hb) return;
      if (ctx.overlap(hb, { l: S.hawk.x - 8, r: S.hawk.x + 8, t: S.hawk.y - 6, b: S.hawk.y + 6 }) && !(S.hawkSaid > ctx.time())) { S.hawkSaid = ctx.time() + 1.5; ctx.number(S.hawk.x, S.hawk.y - 14, 'IT RIDES THE AIR', '#9aa39a'); } });
  };
  /* THE RULE ON HER: a hero's ring on a courtyard gong, a flash (src/ksar-hands.js) */
  H.onRing = g => { const e = live(); if (!S || !e || !ctx.bossActive) return; HMM.ringHeard(e, S, world(e)); };
  H.onFlash = (x, y) => { const e = live(); if (!S || !e || !ctx.bossActive) return; HMM.flashAt(e, S, world(e), x, y); };
  H.hawk = () => (S && live() ? S.hawk : null);
  /* A BLOW ON HER: the ward turns everything; her gauntlet turns the front while she is on guard; open, x openMul (one opening openCap of her at most) */
  H.take = (e, dmg) => { if (!S) return dmg; const P = ctx.hero(), t = ctx.time();
    if (e.mode === 'sleep' || e.mode === 'wake') return 0;
    if (S.ward > 0) { e.chipHit = t; S.n.warded++; e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return dmg * HM.floor; }   /* (claude/ksar2, B15) the floor: never wholly turned */
    if (HMM.hmOpen(e) || e.broken > 0) { const cap = e.maxHp * HM.openCap, d = Math.min(dmg * HM.openMul, Math.max(0, cap - S.openTaken)); S.openTaken += d;
      if (S.openTaken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; ctx.number(e.x, e.y - 70, 'SHE GATHERS HERSELF', '#9aa39a'); } return d; }
    if (HMM.guarded(e, P.x, P.y, !P.ground && !P.climb)) { e.chipHit = t; S.n.guarded++; e.guardFx = 0.25; e.guardWord = S.n.guarded < 6 ? ['HER GAUNTLET: GO ROUND', 'HER GAUNTLET: HIT HIGH'][S.n.guarded % 2] : 'HER GAUNTLET';
      ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(P.x - e.x) || 1) * 10, e.y - 20, Math.sign(P.x - e.x) || 1, 5); return dmg * HM.floor; }   /* (B15) a turned blow still lands at the floor */
    return dmg; };
  H.barName = e => 'THE HAWK-MISTRESS' + (HMM.hmOpen(e) ? '  OPEN' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { for (const q of ctx.enemies()) if (q.alive && q.hmGuard) { q.alive = false; ctx.burst(q.x, q.y, 8, ['#a8302a', '#5a1e1e'], 50, 0.5); } if (S) { S.runner = null; S.knives = []; S.keg = null; S.rake = null; S.snatch = null; } for (const pp of ctx.players) { pp.hmSnare = null; pp.hmCarry = null; } BOSS_PHASE.hawkmistress = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, hawk: S.hawk.mode, hurt: { ...(S.hurt || {}) }, keg: !!S.keg, knives: (S.knives || []).length };

  /* ---------- DRAWING (GREYBOX) ---------- */
  /* the courtyard: the back wall's walk (the runners), the guard doors, the burning store's ends (phase three) */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    if (S.runner) { const r = S.runner, gg = gongs().find(q => q.id === r.gong), k = 1 - r.t / r.t0, x = r.from + ((gg ? gg.x : r.from) - r.from) * k;
      g.fillStyle = '#a8302a'; g.fillRect(R(x - 3 - cx), R(G.wallY - 12 - cy), 6, 10); g.fillStyle = '#e8d8b0'; g.fillRect(R(x - 3 - cx), R(G.wallY - 14 - cy), 6, 3); g.fillStyle = '#1b1626'; g.fillRect(R(x - 3 - cx), R(G.wallY - 3 - cy), 6, 2); ctx.text('!', R(x - cx), R(G.wallY - 24 - cy), Math.floor(time * 10) % 2 ? '#ff6b6b' : '#fff6e0', 'center', 6);
      if (gg) { g.strokeStyle = 'rgba(255,107,107,0.5)'; g.beginPath(); g.moveTo(R(x - cx), R(G.wallY - cy)); g.lineTo(R(gg.x - cx), R(G.floorY - 46 - cy)); g.stroke(); } }
    if (S.ph === 3) for (const [a, b] of G.fire) for (let x = a; x < b; x += 3) { const h = 9 + 8 * Math.abs(Math.sin(time * 9 + x)), k = (x / 3) | 0; g.fillStyle = '#d8481a'; g.fillRect(R(x - cx), R(G.floorY - h - cy), 3, h); g.fillStyle = '#ff8a2a'; g.fillRect(R(x - cx), R(G.floorY - h * 0.75 - cy), 3, h * 0.75); g.fillStyle = k % 2 ? '#ffc84a' : '#ffd36b'; g.fillRect(R(x - cx) + 1, R(G.floorY - h * 0.45 - cy), 1, h * 0.45); if (k % 5 === 0) { g.fillStyle = '#3a2a22'; g.fillRect(R(x - cx), R(G.floorY - h - 8 - ((time * 20 + x) % 10) - cy), 2, 2); } }
  };
  /* HER: a falconer in a red-brown coat, the whip coiled at her hip, a leather gauntlet on her left arm; her pose by mode (greybox) */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    if (!MS) MS = KSA.bakeMistressSet();
    const x = R(e.x - cx), y = R(e.y + (e.yOff || 0) - cy), f = e.face || 1, m = e.mode, flash = (e.hurtT || 0) > 0;
    const POSE = { sleep: 'sleep', wake: 'recover', recover: 'recover', feintTell: 'feint', feintHold: 'feint', lashTell: 'lashTell', markLashTell: 'lashTell', lash: 'lash', markLash: 'lash', cutTell: 'cutTell', cut: 'cut', whistle: 'whistle', spotTell: 'guard', diveTell: 'whistle', callTell: 'whistle',
      snareTell: 'lashTell', snare: 'lash', fanTell: 'cutTell', fan: 'cut', kegTell: 'feint', rakeTell: 'whistle', hawkGrabTell: 'whistle', leap: 'walkA' };
    let pose = POSE[m] || (m === 'walk' ? (Math.floor(time * 6 + e.x * 0.05) & 1 ? 'walkA' : 'walkB') : 'guard');
    if (m === 'walk' && !(Math.abs(e.vx || 0) > 4)) pose = 'guard';
    /* (claude/ksar2 part B) KEYFRAMED WINDUPS: each told move steps through its poses by how far into the tell she is; an idle with personality when she is standing off */
    const kk = (T) => Math.max(0, Math.min(1, 1 - (e.modeT || 0) / T));
    if (m === 'lashTell' || m === 'markLashTell') pose = kk(m === 'lashTell' ? HM.lashTell : HM.markLashTell) < 0.5 ? 'lashCoil' : 'lashTell';
    else if (m === 'snareTell') pose = kk(HM.snareTell) < 0.3 ? 'lashCoil' : 'snareWind';
    else if (m === 'snare') pose = 'snareCast';
    else if (m === 'fanTell') pose = kk(HM.fanTell) < 0.4 ? 'fanDraw' : 'fanHold';
    else if (m === 'fan') pose = ((HM.fanGap * 3 + 0.1 - (e.modeT || 0)) % HM.fanGap) < 0.09 ? 'fanThrow' : 'fanHold';
    else if (m === 'kegTell') pose = kk(HM.kegTell) < 0.7 ? 'kegSet' : 'kegKick';
    else if (m === 'recover' && S.keg && Math.abs(S.keg.x - e.x) < 46 && (e.modeT || 0) > 0.2) pose = 'kegKick';
    else if (m === 'callTell' || m === 'rakeTell' || m === 'hawkGrabTell' || m === 'diveTell') pose = kk(m === 'callTell' ? HM.callTell : m === 'rakeTell' ? HM.rakeTell : HM.snatchTell) < 0.55 ? 'whistleA' : 'whistleB';
    else if (m === 'whistle') pose = (time % 1.5) < 1.05 ? 'whistleA' : 'whistleB';
    else if (m === 'leap') { const Lp = S.leap; pose = Lp && Lp.t / HM.leapT < 0.16 ? 'leapCrouch' : 'leapAir'; }
    else if (m === 'walk' && pose === 'guard' && S.hawk && S.hawk.mode === 'home') { const ph = (time + e.x * 0.01) % 7; pose = ph < 3.6 ? 'guard' : ph < 4.4 ? 'tauntA' : ph < 5.2 ? 'tauntB' : ph < 6.4 ? 'stroke' : 'guard'; }   /* her idle: beckons, chin up, strokes the hawk on her glove */
    if (flash && pose !== 'sleep') pose = 'hurt';
    const i = MS.names.indexOf(pose), set = flash ? MS.white : MS, spr = (f > 0 ? set.R : set.L)[i];
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(x - 10, y - 1, 20, 2); g.globalAlpha = 1;
    const bob = pose === 'sleep' ? Math.round(Math.sin(time * 1.5)) : 0;
    g.drawImage(spr, x - (f > 0 ? MS.ax : spr.width - MS.ax), y - MS.ay + bob);
    if (pose === 'sleep') ctx.text('Z', x + 8 * f, y - 20 - R((time * 8) % 8), '#c8d8e8', 'center', 6);
    /* the whip's lash and the knife's flash, live: the pose holds the hand, these are the reach */
    if (m === 'lash' || m === 'markLash') { const hx = x + f * 14, hy = y - 22, tx = m === 'markLash' && S.mark ? S.mark.x - cx : x + f * HM.lashReach; g.strokeStyle = '#3a2418'; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo((hx + tx) / 2, hy - 12, tx, y - 6); g.stroke(); g.lineWidth = 1; g.fillStyle = '#e8e0c0'; g.fillRect(R(tx) - 1, y - 7, 3, 3); }
    if (m === 'lashTell' || m === 'markLashTell') { g.strokeStyle = 'rgba(58,36,24,0.8)'; g.beginPath(); g.moveTo(x - f * 7, y - 34); g.quadraticCurveTo(x - f * 18, y - 48, x - f * 4, y - 46); g.stroke(); }
    if (m === 'cut') { g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(x + f * 12 - (f < 0 ? 12 : 0), y - 22, 12, 1); }
    /* (claude/ksar2) THE SNARE: the whip out to its reach, then a taut line to every hero it holds; THE FAN: three knives on her hand, at their heights */
    if (m === 'snareTell') { g.strokeStyle = 'rgba(58,36,24,0.85)'; g.beginPath(); g.moveTo(x - f * 6, y - 30); for (let i = 0; i < 6; i++) g.lineTo(x - f * 6 + Math.cos(time * 18 + i) * 8, y - 40 - i); g.stroke(); }
    if (m === 'snare') { g.strokeStyle = '#3a2418'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + f * 12, y - 20); g.lineTo(x + f * HM.snareReach, y - 14); g.stroke(); g.lineWidth = 1; }
    for (const pp of ctx.players) if (pp.hmSnare) { g.strokeStyle = '#3a2418'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + f * 10, y - 20); g.lineTo(R(pp.x - cx), R(pp.y - 10 - cy)); g.stroke(); g.lineWidth = 1; }
    if (m === 'fanTell' && S.fan) S.fan.set.forEach((ht, i) => { const dy = ht === 'high' ? 24 : ht === 'mid' ? 14 : 4, on = Math.floor(time * 10) % 2; g.fillStyle = on ? '#ffffff' : '#c9d1dc'; g.fillRect(x + f * (10 + i * 5), y - dy - 1, 4, 2);
      ctx.text(ht === 'high' ? 'DUCK' : ht === 'low' ? 'JUMP' : 'MID', x + f * (26 + i * 14), y - dy - 4, ht === 'high' ? '#bfe6f5' : ht === 'low' ? '#ffd36b' : '#e8e0c0', 'center', 4); });
    if (e.guardFx > 0) { g.fillStyle = '#ffffff'; g.fillRect(x + f * 10 - 2, y - 38, 5, 14); }
  };
  /* THE HAWK, the marks, and THE READ (open ring + timer, ward shell, the gauntlet's word) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'hawkmistress') return; const G = S.G;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', k = S.hawk;
    /* THE HAWK: a hawk over her (wings beating), blinded it flaps with white stars, home it sits on her glove; its shadow on the floor when it spots or dives */
    { const hx = R(k.x - cx), hy = R(k.y - cy); if (!HW) HW = [0, 1, 2, 3, 4, 5, 6, 7].map(i => KSA.bakeHerHawk(i)); const wing = Math.floor(time * (k.mode === 'blind' ? 14 : 7)) & 1;
      const pose = k.mode === 'home' ? 7 : k.mode === 'blind' ? 4 : k.mode === 'dive' || k.mode === 'low' ? 3 : k.mode === 'diveTell' || k.mode === 'spot' ? 6 : k.mode === 'wheel' || k.mode === 'return' ? 2 : wing;
      S.hawkF = k.x > (S.hawkLastX ?? k.x) + 0.2 ? 1 : k.x < (S.hawkLastX ?? k.x) - 0.2 ? -1 : (S.hawkF || (e.face || 1)); S.hawkLastX = k.x; const hf = k.mode === 'home' ? (e.face || 1) : S.hawkF, H0 = HW[pose], bob = k.mode === 'circle' ? R(Math.sin(time * 3) * 1) : 0;
      if (hf > 0) g.drawImage(H0.c, hx - H0.ax, hy - H0.ay + bob); else { g.save(); g.translate(hx, 0); g.scale(-1, 1); g.drawImage(H0.c, -H0.ax, hy - H0.ay + bob); g.restore(); }
      if (k.mode === 'blind') for (let i = 0; i < 3; i++) { const a = time * 7 + i * 2.1; g.fillStyle = '#ffffff'; g.fillRect(hx + R(Math.cos(a) * 9), hy - 10 + R(Math.sin(a) * 3), 2, 2); }
      if (k.mode === 'wheel' || k.mode === 'blind') ctx.text(k.mode === 'wheel' ? 'WHEELING' : 'BLIND', hx, hy - 14, '#ffd36b', 'center', 5); }
    if (S.mark && (e.mode === 'spotTell' || e.mode === 'markLashTell' || e.mode === 'diveTell' || k.mode === 'dive')) { const x = R(S.mark.x - cx), y = R(G.floorY - 2 - cy), r = e.mode === 'diveTell' || k.mode === 'dive' ? HM.diveR : HM.markR;
      g.fillStyle = 'rgba(30,10,10,0.55)'; g.fillRect(x - r, y, r * 2, 3); g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 2); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 2); g.stroke(); }
    /* (claude/ksar2) THE KNIVES, THE KEG, THE RAKE'S LINE, THE SNATCH'S SHADOW */
    for (const kn of S.knives || []) { const kx = R(kn.x - cx), ky = R(kn.y - cy), d = Math.sign(kn.vx) || 1; g.fillStyle = '#e8eef4'; g.fillRect(kx - 4, ky, 8, 1); g.fillStyle = '#3a2418'; g.fillRect(kx - d * 5, ky - 1, 2, 3);
      g.globalAlpha = 0.5; g.fillStyle = kn.ht === 'high' ? '#bfe6f5' : kn.ht === 'low' ? '#ffd36b' : '#ffffff'; g.fillRect(kx - d * 14, ky, 8, 1); g.globalAlpha = 1; }
    if (S.keg) { const K = S.keg, kx = R(K.x - cx), ky = R(G.floorY - cy), a = (K.x / 6) % (Math.PI * 2);
      g.fillStyle = '#5a3a20'; g.beginPath(); g.arc(kx, ky - 6, 6, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#2a1a10'; g.beginPath(); g.moveTo(kx + Math.cos(a) * 6, ky - 6 + Math.sin(a) * 6); g.lineTo(kx - Math.cos(a) * 6, ky - 6 - Math.sin(a) * 6); g.stroke();
      g.fillStyle = Math.floor(time * 14) % 2 ? '#ffd36b' : '#ff6a2a'; g.fillRect(kx - 1, ky - 15, 2, 3); if (K.back) ctx.text('BACK!', kx, ky - 22, '#8fd160', 'center', 5);
      g.strokeStyle = 'rgba(255,107,107,0.6)'; g.beginPath(); g.arc(kx, ky - 6, HM.kegR * (0.4 + 0.1 * Math.sin(time * 12)), 0, Math.PI * 2); g.stroke(); }
    if (S.rake && (k.mode === 'rakeTell' || k.mode === 'rake')) { const Rk = S.rake, ex = Rk.x1 + (Rk.x1 - Rk.x0) * 0.35; g.strokeStyle = blink; if (g.setLineDash) g.setLineDash([4, 3]);
      g.beginPath(); g.moveTo(R(Rk.x0 - cx), R(Rk.y0 - cy)); g.lineTo(R(ex - cx), R(Rk.y1 - cy)); g.stroke(); if (g.setLineDash) g.setLineDash([]); g.fillStyle = 'rgba(30,10,10,0.55)'; g.fillRect(R(Rk.x1 - 14 - cx), R(G.floorY - 2 - cy), 28, 3); }
    if (S.snatch && (k.mode === 'hover' || k.mode === 'drop')) { const sx = R(S.snatch.x - cx), fy = R(G.floorY - 2 - cy); g.fillStyle = 'rgba(30,10,10,' + (S.snatch.lock ? 0.6 : 0.35) + ')'; g.beginPath(); g.ellipse(sx, fy, HM.snatchR, 3, 0, 0, Math.PI * 2); g.fill();
      if (S.snatch.lock) { g.strokeStyle = blink; g.beginPath(); g.ellipse(sx, fy, HM.snatchR + 2, 4, 0, 0, Math.PI * 2); g.stroke(); } }
    if (S.flashFx > 0) { g.globalAlpha = S.flashFx * 1.5; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(R(e.x - cx), R(e.y - 14 - cy), HM.flashR, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    /* THE READ (B10) */
    const x = R(e.x - cx), y = R(e.y - HM.h / 2 - cy);
    if (HMM.hmOpen(e)) { const kk = Math.max(0, e.open / HM.openT);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 24, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = R(e.y - HM.h - 26 - cy); ctx.text('OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, R(e.y - HM.h - 22 - cy), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, R(e.y - HM.h - 34 - cy) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
