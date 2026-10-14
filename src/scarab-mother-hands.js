// src/scarab-mother-hands.js - THE SCARAB MOTHER's HANDS (claude/sealedpyramid, the Opus greybox). src/scarab-mother.js is the fight (pure: her moves, her three
// phases, the opening, the brood, the bot's reading); this binds it to the world: her told blows on the heroes (keyed once a blow; a shield turns only the yellow
// ones), THE ANTECHAMBER's TRAPS (the level's own: src/sealed-pyramid-hands.js fires them and tells her - trapHit), phase two's CRACKED PITS (scarab cells written
// at the walls, taken back on a new attempt), her brood (a blow kills one: strike), and the drawing - GREYBOX but every move its own pose (B16): the charge's
// lowered head and scraping foreleg, the mandibles spread, the abdomen tipped for the spit, the dig, the rear for the quake, and PINNED / STUCK / FLIPPED.
// THE SHARED READ (design standard B10): OPEN = a gold ring round her and a timer bar (PINNED / STUCK / FLIPPED); WARDED = a pale shell ring and the word; HER
// SHELL = a turned share CLANKS, sparks and says HER SHELL (and the first times what to do about it) - never silent.
// main.js calls: spawnBoss, owns, on, update, take, trapHit, strike, broodHit, phase, drawBack, drawBoss, drawOver, barName, end, read, show, clear.
import * as SMM from './scarab-mother.js';
import { BOSS_PHASE } from './boss-music.js';
import * as MOM from './redraw/sealed_pyramid_mother.js';
import * as CAST from './redraw/sealed_pyramid_cast.js';
import { whiten } from './px.js';
const { SM } = SMM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), charge: s => (s.roar || s.boom || s.thud)(), snap: s => (s.slash || s.tell)(),
  spit: s => (s.hiss || s.puff || s.slash)(), rumble: s => (s.boom || s.crack || s.thud)(), shell: s => (s.clank || s.tell)(), open: s => (s.crack || s.clank)(),
  thud: s => (s.thud || s.stone || s.clank)(), slam: s => (s.boom || s.thud)(), seethe: s => (s.hiss || s.puff)() };

export function makeScarabMotherHands(ctx) {
  let S = null;
  const H = {};
  /* (claude/pyramidboss) SHE IS THE SEALED PYRAMID's MINI now (L.mini, her lair mid-level); an arena of hers still works (A() finds whichever room is hers) */
  const A = () => { const L = ctx.L; if (!L) return null; if (L.mini && L.mini.boss === 'scarabmother') return L.mini; return L.arena && L.arena.boss === 'scarabmother' ? L.arena : null; };
  const act = () => { const Ar = A(); return !!Ar && (Ar === ctx.L.mini ? !!ctx.miniActive : !!ctx.bossActive); };
  let ME = null;   /* (her body: the boss slot is the Coffin King's now) */
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'scarabmother';
  H.clear = () => { unpit(); S = null; ME = null; BOSS_PHASE.scarabmother = 1; };
  H.phase = () => (S ? S.ph : 1);
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.smKeys = pp.smKeys || new Map(); if (pp.smKeys.size > 80) pp.smKeys.clear(); if (pp.smKeys.has(key)) return true; pp.smKeys.set(key, 1); return false; };
  const live = () => { const e = ME; return e && e.alive && e.t === 'scarabmother' ? e : null; };
  H.active = () => act();
  /* phase two's CRACKED PITS: two rows of air over a row of scarab cells (T.SPIKE: the tomb's pits - a fall costs a share and puts you back), written once, taken back on a new attempt */
  let pitted = [];
  function pit() { if (pitted.length) return; const G = S.G, T = ctx.T; for (const [a, b] of G.pitCols) for (let x = a; x <= b; x++) { for (const [y, v] of [[G.R, T.AIR], [G.R + 1, T.AIR], [G.R + 2, T.SPIKE]]) { pitted.push([x, y, ctx.cellGet(x, y)]); ctx.cellSet(x, y, v); } }
    for (const [a, b] of G.pits) ctx.burst((a + b) / 2, G.floorY, 14, ['#d8c8a0', '#2a5a3e', '#7ad08a'], 80, 0.8); }
  function unpit() { if (!pitted.length) return; for (const [x, y, v] of pitted) ctx.cellSet(x, y, v); pitted = []; }

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; unpit();
    S = SMM.newFight(SMM.geom(Ar, ctx.TS)); BOSS_PHASE.scarabmother = 1;
    const e = { ...base, t: 'scarabmother', w: SM.w, h: SM.h, hp: ctx.EHP.scarabmother, maxHp: ctx.EHP.scarabmother, noGrav: true, markH: SM.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, boss: true };
    e.y = S.G.floorY; ME = e; if (base.mini) e.mini = true; for (const pp of ctx.players) pp.smKeys = null; return e; };

  /* ---------- THE WORLD AS SHE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, air: !pp.ground && !pp.climb, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(), rng: () => Math.random(),
      music: ph => { BOSS_PHASE.scarabmother = ph; if (ctx.music) ctx.music(ph > 1 ? 'scarabmother:p' + ph : 'scarabmother'); },
      mark: m => ctx.number(e.x, e.y - SM.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      pits: on => { if (on) pit(); else unpit(); },
      fx: (k, x, y) => {
        if (k === 'open') ctx.ring(x, y - 14, 34, '#ffd36b');
        else if (k === 'ward') ctx.ring(x, y - 14, 36, '#c8d8e8');
        else if (k === 'skid') ctx.burst(x, y - 2, 8, ['#d8c8a0', '#a89070'], 60, 0.4);
        else if (k === 'dig' || k === 'erupt' || k === 'rubble') ctx.burst(x, y - 6, 16, ['#d8c8a0', '#a89070', '#6e5a3c'], 100, 0.6);
        else if (k === 'splash') ctx.burst(x, y - 4, 10, ['#9ad04a', '#d8f080'], 70, 0.5);
        else if (k === 'brood') ctx.burst(x, y - 4, 8, ['#2a5a3e', '#7ad08a'], 60, 0.5); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock })); if (P.hp < hp0) any = true; }); return any; },
    };
  }

  /* ---------- ONE FRAME OF HER ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 70, 'THE SCARAB MOTHER, QUEEN OF THE BROOD', '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 120, 'LURE HER UNDER A TRAP, THEN TREAD ITS PLATE', '#ffd36b'); }
    SMM.stepScarabMother(e, S, dt, heroes(), world(e));
    e.phase = S.ph;
  };
  /* THE RULE ON HER: one of the antechamber's traps lands on her (src/sealed-pyramid-hands.js) */
  H.trapHit = (e, kind) => { const b = live(); if (!S || !b || b !== e || !act()) return 'busy'; const r = SMM.trapped(e, S, world(e), kind);
    if (r === 'open') { const bite = Math.round(e.maxHp * (SM.trapBite[kind] || 0.02)); e.hp = Math.max(1, e.hp - bite); ctx.number(e.x, e.y - 40, '-' + bite, '#ffd36b'); }
    return r; };
  /* the brood: a hero's blow (main.js attackBox) or a trap's box over one kills it */
  H.strike = hb => { if (!S || !hb) return; const n = SMM.strikeBrood(S, hb); if (n) { ctx.sfx.squish ? ctx.sfx.squish() : ctx.sfx.crack && ctx.sfx.crack(); } };
  H.broodHit = box => { if (S) SMM.strikeBrood(S, box); };
  /* A BLOW ON HER (B15): open x SM.openMul (one opening SM.openCap of her at most, then the shell's floor); warded, the floor with a clank; burrowed, the
     sand takes it (a told whiff, B10 - she is under it for SM.burrowT s at most); else HER SHELL takes the share */
  H.take = (e, dmg) => { if (!S) return dmg; const t = ctx.time();
    if (e.mode === 'sleep' || e.mode === 'wake') return 0;
    if (SMM.smOpen(e)) { const cap = e.maxHp * SM.openCap, d = Math.max(dmg * SM.resist, Math.min(dmg * SM.openMul, Math.max(0, cap - S.openTaken))); S.openTaken += d;
      if (S.openTaken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; ctx.number(e.x, e.y - 60, 'SHE STRUGGLES FREE', '#9aa39a'); } return d; }
    if (SMM.smHidden(e)) { e.chipHit = t; e.guardFx = 0.25; e.guardWord = 'UNDER THE SAND'; return dmg * SM.resist; }
    if (S.ward > 0) { e.chipHit = t; S.n.warded++; e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return dmg * SM.wardMul; }
    e.chipHit = t; S.n.shell++; e.guardFx = 0.25; e.guardWord = S.n.shell < 6 ? 'HER SHELL: LURE HER INTO A TRAP' : 'HER SHELL';
    ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(ctx.hero().x - e.x) || 1) * 14, e.y - 16, Math.sign(ctx.hero().x - e.x) || 1, 4); return dmg * SM.resist; };
  H.barName = e => 'THE SCARAB MOTHER' + (SMM.smOpen(e) ? '  ' + (SMM.OPEN_NAME[e.openKind] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { if (S) { S.glob = null; S.puddles = []; S.stones = []; S.brood = []; S.mound = null; S.seethe = null; S.erupt = null; S.leapQ = null; S.dropQ = null; } BOSS_PHASE.scarabmother = 1; };
  H.read = () => S && { mode: ME && ME.mode, ph: S.ph, cycle: S.cycle, ward: S.ward, open: ME ? ME.open : 0, openKind: ME && ME.openKind, brood: S.brood.length, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (claude/spart: every move its OWN baked pose - src/redraw/sealed_pyramid_mother.js; B16) ---------- */
  const C = { shell: '#1e3a2c', shellL: '#3e7a52', shellH: '#8ad09a', leg: '#14201a', gold: '#d8aa40', goldL: '#f6dc80', acid: '#9ad04a', acidL: '#e0ff90', sand: '#d8c8a0', sandD: '#a89070', sandDD: '#6e5a3c' };
  const ell = (g, x, y, rx, ry, col, a = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(R(x), R(y), Math.max(1, rx), Math.max(1, ry), a, 0, 7); g.fill(); };
  let POSES = null, WHITE = {}, BROODSET = null, STONE = null;
  const poses = () => { if (!POSES) { POSES = MOM.bakeMother(); BROODSET = CAST.bakeScarab(); } return POSES; };
  const whiteOf = (k) => WHITE[k] || (WHITE[k] = whiten(poses()[k]));
  /* the pose for a mode: her windup and her release are never the same picture (B16) */
  const poseOf = (e, time) => { const m = e.mode, wk = Math.floor(time * 7) & 1 ? 'walk1' : 'walk0';
    if (m === 'sleep') return 'sleep'; if (m === 'wake') return 'wake'; if (m === 'chargeTell') return Math.floor(time * 9) & 1 ? 'rake1' : 'rake0'; if (m === 'charge') return 'charge'; if (m === 'skid') return 'skid'; if (m === 'dazed') return 'dazed';
    if (m === 'snapTell') return 'snapTell'; if (m === 'snap') return 'snap'; if (m === 'spitTell') return 'spitTell'; if (m === 'burrowTell') return 'burrowTell'; if (m === 'burrowUp') return 'burrowUp'; if (m === 'quakeTell') return 'quakeTell'; if (m === 'leapTell') return 'leapTell'; if (m === 'leap' || m === 'drop') return 'leap'; if (m === 'perch') return 'walk0'; if (m === 'eruptTell') return 'digTell'; if (m === 'eruptUp') return 'eruptUp'; if (m === 'quake') return 'quake';
    if (m === 'recover' && S && S.glob && S.glob.t < 0.3) return 'spit';
    if (m === 'open') return e.openKind === 'block' ? 'pinned' : e.openKind === 'darts' ? (Math.floor(time * 10) & 1 ? 'stuck1' : 'stuck0') : (Math.floor(time * 9) & 1 ? 'flipped1' : 'flipped0');
    if (m === 'walk' || m === 'back') return wk; return 'walk0'; };
  H.drawBack = () => {};
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, m = e.mode, x = e.x - cx, y = e.y - cy, flash = (e.hurtT || 0) > 0;
    if (m === 'erupting') return;   /* (claude/pyramidboss) under the sand: her trail is drawn over (drawOver) */
    if (m === 'burrowed') { /* the MOUND: a hump of sand running at you, a fissure down its crown, the ridge of her back glinting through, sand thrown off it */
      const r = 12 + 2 * Math.sin(time * 12); ell(g, x, y - 1, 24, 6, C.sandDD); ell(g, x, y - 3, 22, 5.6, C.sandD); ell(g, x, y - 5, r + 4, 4.6, C.sand); g.fillStyle = C.sandDD; g.fillRect(R(x) - 8, R(y) - 5, 16, 1); g.fillRect(R(x) - 3, R(y) - 7, 6, 1);
      g.fillStyle = C.gold; g.fillRect(R(x) - 1, R(y) - 7, 2, 3); g.fillStyle = C.goldL; g.fillRect(R(x) - 1, R(y) - 7, 1, 1);
      for (let i = 0; i < 7; i++) { const a = time * 14 + i * 1.3; g.fillStyle = i % 2 ? C.sand : C.sandD; g.fillRect(R(x + Math.cos(a) * 20), R(y - 4 - Math.abs(Math.sin(a * 1.7)) * 9), 2, 2); } return; }
    g.globalAlpha = 0.3; ell(g, x, y, 28, 3, '#10060a'); g.globalAlpha = 1;
    const k = poseOf(e, time), P = poses()[k]; if (!P) return;
    g.save(); g.translate(R(x), R(y)); g.scale(f, 1);
    /* (claude/pyramidboss) PLACEHOLDER POSES for her two new moves (lane C draws them; B16: each its own windup and release): the LEAP-SLAM's crouch (squashed low, a
       hind leg cocked) and its jump (reared, rising); the BURROW-UP's dig (sunk to the shoulders in the floor) and its eruption (thrown up nose-first) */
    if (m === 'leap' || m === 'drop') g.rotate(-0.16); else if (m === 'eruptTell') { g.translate(0, 6); g.beginPath(); g.rect(-60, -90, 120, 84); g.clip(); } else if (m === 'eruptUp') { g.translate(0, -4); g.rotate(-0.22); }
    g.drawImage(P, -MOM.CX, -P.height);
    if (flash) { g.globalAlpha = 0.9; g.drawImage(whiteOf(k), -MOM.CX, -P.height); g.globalAlpha = 1; }
    g.restore();
    if (m === 'burrowTell') { for (let i = 0; i < 6; i++) { const a = time * 16 + i * 2; g.fillStyle = i % 2 ? C.sand : C.sandD; g.fillRect(R(x + f * (14 + Math.cos(a) * 8)), R(y - 3 - Math.abs(Math.sin(a * 1.4)) * 8), 2, 2); } }
    if (m === 'dazed') { g.fillStyle = C.goldL; for (let i = 0; i < 3; i++) { const a = time * 6 + i * 2.1; g.fillRect(R(x + f * 22 + Math.cos(a) * 8), R(y - 38 + Math.sin(a) * 3), 2, 2); } }
    if (m === 'spitTell') { const sy = y - 30 - Math.sin(time * 18) * 1.5; g.globalAlpha = 0.6; ell(g, x - f * 26, sy, 3 + Math.sin(time * 14), 3, C.acidL); g.globalAlpha = 1; }
    if (m === 'quakeTell') { g.fillStyle = C.sandD; for (let i = 0; i < 5; i++) g.fillRect(R(x + f * (20 + i * 3)), R(y - 1 - (i % 2)), 2, 1); }
    if (e.guardFx > 0) { g.fillStyle = '#fff6c8'; g.fillRect(R(x + f * 18 - 2), R(y - 26), 5, 14); }
  };
  /* the glob, the puddles, the mound's ring, the quake's shadows and stones, the brood, and THE READ (open ring + timer, ward shell, her shell's word) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !act()) return; const e = ME; if (!e || !e.alive || e.t !== 'scarabmother') return; const G = S.G;
    /* (claude/pyramidboss) the LEAP-SLAM's shadow on the platform she will land on (its tell), and the BURROW-UP's trail - a dust line under you - then its ring once it stops */
    if ((e.mode === 'leapTell' || e.mode === 'leap') && S.leapQ) { const q = S.leapQ; g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 14); ell(g, q.tx - cx, q.ty - cy - 1, SM.leap.r, 4, '#10060a'); g.globalAlpha = 1; g.strokeStyle = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0'; g.strokeRect(R(q.tx - cx - SM.leap.r), R(q.ty - cy - 3), SM.leap.r * 2, 3); }
    if (S.erupt) { const q = S.erupt, x = R(q.x - cx), y = R(G.floorY - cy); for (let i = 0; i < 6; i++) { const a = time * 16 + i * 1.7; g.fillStyle = i % 2 ? C.sand : C.sandD; g.fillRect(R(x + Math.cos(a) * 10), R(y - 2 - Math.abs(Math.sin(a * 1.3)) * 6), 2, 2); }
      if (q.fixed) { g.strokeStyle = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0'; g.beginPath(); g.ellipse(x, y - 1, SM.erupt.r, 4, 0, 0, 7); g.stroke(); g.globalAlpha = 0.25; g.fillStyle = '#ff9a5c'; g.fillRect(x - SM.erupt.r, R(G.ledge.y - 30 - cy), SM.erupt.r * 2, y - R(G.ledge.y - 30 - cy)); g.globalAlpha = 1; } }
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    for (const p of S.puddles) { const a = Math.min(1, p.t), px0 = p.x - cx, py0 = G.floorY - cy; g.globalAlpha = 0.65 * a; ell(g, px0, py0 - 1, SM.puddleR, 3.4, '#2a4a14'); ell(g, px0, py0 - 2, SM.puddleR - 2, 2.6, C.acid); g.globalAlpha = a;   /* an acid pool: a dark rim, a bright skin */
      for (let i = 0; i < 4; i++) { const bb = (time * 3 + i * 0.4) % 1; g.fillStyle = C.acidL; g.fillRect(R(px0 - 10 + i * 6), R(py0 - 3 - bb * 6), 1 + (i & 1), 1 + (i & 1)); } g.globalAlpha = 1; }
    if (S.glob) { const q = S.glob, kk = Math.min(1, q.t / SM.spitFly), gy = G.floorY - 30 - Math.sin(kk * Math.PI) * 50; ell(g, q.x - cx, gy - cy, 4, 4, '#2a4a14'); ell(g, q.x - cx, gy - cy, 3, 3, C.acid); g.fillStyle = C.acidL; g.fillRect(R(q.x - cx) - 2, R(gy - cy) - 2, 2, 1);
      for (let i = 1; i < 5; i++) { g.globalAlpha = 0.5 - i * 0.1; g.fillStyle = C.acid; g.fillRect(R(q.x - cx - (q.tx > q.x0 ? i : -i) * 3), R(gy - cy + i * 0.6), 2, 2); } g.globalAlpha = 1; }
    if (e.mode === 'spitTell' && S.mark) { const x = R(S.mark.x - cx), y = R(G.floorY - 2 - cy); g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 2); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 2); g.stroke(); }
    if (S.mound) { const x = R(S.mound.x - cx), y = R(G.floorY - cy); g.strokeStyle = 'rgba(255,154,92,0.8)'; g.beginPath(); g.arc(x, y - 2, SM.burrowR, Math.PI, 0); g.stroke(); }
    for (const s of S.stones) { if (s.done) { continue; } const x = R(s.x - cx), y = R(G.floorY - cy), kk = 1 - Math.max(0, s.t) / (SM.quakeTell + SM.quakeFall);
      g.globalAlpha = 0.3 + 0.5 * kk; g.fillStyle = '#10060a'; g.fillRect(x - SM.quakeR, y - 3, SM.quakeR * 2, 3); g.globalAlpha = 1;
      if (s.t < SM.quakeFall) { const sy = G.roofY + (G.floorY - G.roofY) * (1 - s.t / SM.quakeFall), yy = R(sy - cy); g.fillStyle = '#5a4630'; g.fillRect(x - 11, yy - 18, 22, 18); g.fillStyle = '#b09462'; g.fillRect(x - 10, yy - 17, 20, 15); g.fillStyle = '#d0b47c'; g.fillRect(x - 10, yy - 17, 20, 2); g.fillStyle = '#6e5636'; g.fillRect(x - 10, yy - 5, 20, 3); g.fillRect(x - 2, yy - 17, 1, 8); g.fillRect(x + 3, yy - 12, 1, 7); } }
    if (S.seethe) { const x = R(S.seethe.x - cx), y = R(G.floorY - cy); g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 20); g.fillStyle = '#7ad08a'; g.fillRect(x - 14, y - 4, 28, 4); g.globalAlpha = 1; }
    for (const b of S.brood) { if (!b.alive) continue; const x = R(b.x - cx), y = R(G.floorY - cy), fr = BROODSET ? BROODSET[(b.face || 1) > 0 ? 'R' : 'L'][Math.floor(time * 12) & 1] : null; if (fr) g.drawImage(fr, x - BROODSET.ax, y - fr.height); else { ell(g, x, y - 4, 6, 4, C.shell); } }
    /* THE READ (B10) */
    const x = R(e.x - cx), y = R(e.y - SM.h / 2 - cy);
    if (SMM.smOpen(e)) { const kk = Math.max(0, e.open / SM.openT);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = R(e.y - SM.h - 30 - cy); ctx.text(SMM.OPEN_NAME[e.openKind] || 'OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 32, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, R(e.y - SM.h - 26 - cy), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, R(e.y - SM.h - 40 - cy) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
