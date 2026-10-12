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
const { SM } = SMM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), charge: s => (s.roar || s.boom || s.thud)(), snap: s => (s.slash || s.tell)(),
  spit: s => (s.hiss || s.puff || s.slash)(), rumble: s => (s.boom || s.crack || s.thud)(), shell: s => (s.clank || s.tell)(), open: s => (s.crack || s.clank)(),
  thud: s => (s.thud || s.stone || s.clank)(), slam: s => (s.boom || s.thud)(), seethe: s => (s.hiss || s.puff)() };

export function makeScarabMotherHands(ctx) {
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'scarabmother' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'scarabmother';
  H.clear = () => { unpit(); S = null; BOSS_PHASE.scarabmother = 1; };
  H.phase = () => (S ? S.ph : 1);
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.smKeys = pp.smKeys || new Map(); if (pp.smKeys.size > 80) pp.smKeys.clear(); if (pp.smKeys.has(key)) return true; pp.smKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'scarabmother' ? e : null; };
  /* phase two's CRACKED PITS: two rows of air over a row of scarab cells (T.SPIKE: the tomb's pits - a fall costs a share and puts you back), written once, taken back on a new attempt */
  let pitted = [];
  function pit() { if (pitted.length) return; const G = S.G, T = ctx.T; for (const [a, b] of G.pitCols) for (let x = a; x <= b; x++) { for (const [y, v] of [[G.R, T.AIR], [G.R + 1, T.AIR], [G.R + 2, T.SPIKE]]) { pitted.push([x, y, ctx.cellGet(x, y)]); ctx.cellSet(x, y, v); } }
    for (const [a, b] of G.pits) ctx.burst((a + b) / 2, G.floorY, 14, ['#d8c8a0', '#2a5a3e', '#7ad08a'], 80, 0.8); }
  function unpit() { if (!pitted.length) return; for (const [x, y, v] of pitted) ctx.cellSet(x, y, v); pitted = []; }

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; unpit();
    S = SMM.newFight(SMM.geom(Ar, ctx.TS)); BOSS_PHASE.scarabmother = 1;
    const e = { ...base, t: 'scarabmother', w: SM.w, h: SM.h, hp: ctx.EHP.scarabmother, maxHp: ctx.EHP.scarabmother, noGrav: true, markH: SM.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, boss: true };
    e.y = S.G.floorY; for (const pp of ctx.players) pp.smKeys = null; return e; };

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
  H.trapHit = (e, kind) => { const b = live(); if (!S || !b || b !== e || !ctx.bossActive) return 'busy'; const r = SMM.trapped(e, S, world(e), kind);
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
  H.end = e => { if (S) { S.glob = null; S.puddles = []; S.stones = []; S.brood = []; S.mound = null; S.seethe = null; } BOSS_PHASE.scarabmother = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, ward: S.ward, open: ctx.boss ? ctx.boss.open : 0, openKind: ctx.boss && ctx.boss.openKind, brood: S.brood.length, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (GREYBOX - every move its own pose, B16) ---------- */
  const C = { shell: '#1e3a2c', shellL: '#3e7a52', shellH: '#8ad09a', belly: '#c8b078', leg: '#14201a', eye: '#ff5a3a', gold: '#d8aa40', goldL: '#f6dc80', mand: '#2a2016', acid: '#9ad04a', ink: '#0c0806' };
  const ell = (g, x, y, rx, ry, col, a = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(R(x), R(y), Math.max(1, rx), Math.max(1, ry), a, 0, 7); g.fill(); };
  const leg = (g, x0, y0, x1, y1, x2, y2) => { g.strokeStyle = C.leg; g.lineWidth = 3; g.beginPath(); g.moveTo(R(x0), R(y0)); g.lineTo(R(x1), R(y1)); g.lineTo(R(x2), R(y2)); g.stroke(); g.lineWidth = 1; };
  H.drawBack = () => {};
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, m = e.mode, x = e.x - cx, y = e.y - cy, flash = (e.hurtT || 0) > 0, k = m === 'walk' || m === 'back' ? Math.sin(time * 14) : 0;
    if (m === 'burrowed') { const r = 12 + 2 * Math.sin(time * 12); ell(g, x, y - 3, 22, 6, '#a89070'); ell(g, x, y - 5, r, 4, '#d8c8a0'); return; }
    g.globalAlpha = 0.3; ell(g, x, y, 26, 3, '#10060a'); g.globalAlpha = 1;
    g.save(); g.translate(R(x), R(y)); g.scale(f, 1);
    if (flash) g.filter = 'brightness(3)';
    if (m === 'open' && e.openKind === 'stone') {   /* FLIPPED: on her back, legs kicking at the air */
      ell(g, 0, -10, 24, 10, C.belly); for (let i = -2; i <= 2; i++) { const a = Math.sin(time * 18 + i) * 4; leg(g, i * 8, -16, i * 9 + a, -28, i * 10 - a, -34); } ell(g, 18, -8, 7, 6, C.shell);
    } else if (m === 'open' && e.openKind === 'block') {   /* PINNED: flattened under the block, legs splayed */
      for (const i of [-2, -1, 1, 2]) leg(g, i * 9, -6, i * 14, -3, i * 17, 0); ell(g, 0, -7, 26, 7, C.shell); ell(g, 22, -6, 7, 5, C.shell); ell(g, 25, -7, 1.5, 1.5, C.eye);
    } else {
      const head = m === 'chargeTell' ? 6 : m === 'charge' ? 4 : m === 'quakeTell' ? -14 : m === 'snapTell' ? 0 : 0;   /* the head: lowered for the charge, up for the quake's rear */
      const rear = m === 'quakeTell' ? 1 : m === 'quake' ? -0.3 : 0, tip = m === 'spitTell' ? 1 : 0, dig = m === 'burrowTell' ? Math.min(1, (SM.burrowTell - e.modeT) / SM.burrowTell) : 0, stuck = m === 'open' && e.openKind === 'darts';
      g.rotate(-rear * 0.5); g.translate(0, dig * 12);
      /* legs: walking, braced for the charge, scraping (a foreleg pawing) */
      for (const [i, lx] of [[0, -14], [1, -4], [2, 8]]) { const sw = (i % 2 ? k : -k) * 3, paw = m === 'chargeTell' && i === 2 ? Math.sin(time * 20) * 5 : 0, splay = stuck ? 4 : 0;
        leg(g, lx, -12, lx - 4 + sw + paw, -6, lx - 7 + sw + paw - splay, 0); leg(g, lx + 2, -12, lx + 6 - sw, -6, lx + 9 - sw + splay, 0); }
      /* the abdomen (tipped up for the spit), the shell with its gold seam, the head with horn and mandibles */
      g.save(); g.translate(-10, -14); g.rotate(-tip * 0.5); ell(g, -6, 0, 18, 11, C.shell); ell(g, -8, -4, 12, 5, C.shellL); g.fillStyle = C.gold; g.fillRect(-6, -10, 1, 20);
      if (tip) { ell(g, -22, -6, 4, 4, C.acid); } g.restore();
      ell(g, 4, -16, 14, 10, C.shell); ell(g, 2, -20, 9, 3, C.shellH);
      g.save(); g.translate(18, -14 + head); ell(g, 0, 0, 7, 6, C.shell); g.fillStyle = C.eye; g.fillRect(2, -3, 2, 2);
      g.fillStyle = C.mand; const open = m === 'snapTell' ? 6 : m === 'snap' ? 0 : 2; g.fillRect(6, -2 - open, 6, 2); g.fillRect(6, 1 + open, 6, 2);
      g.fillStyle = C.shellL; g.beginPath(); g.moveTo(2, -5); g.lineTo(8, -14 - (m === 'chargeTell' ? -6 : 0)); g.lineTo(5, -5); g.fill(); g.restore();
      if (stuck) { g.fillStyle = '#3a2a1a'; for (let i = 0; i < 6; i++) g.fillRect(-14 + i * 6, -22 + (i % 2) * 6, 1, 7); }
      if (m === 'dazed') { g.fillStyle = C.goldL; for (let i = 0; i < 3; i++) { const a = time * 6 + i * 2.1; g.fillRect(R(18 + Math.cos(a) * 8), R(-28 + Math.sin(a) * 3), 2, 2); } }
    }
    g.filter = 'none'; g.restore();
    if (e.guardFx > 0) { g.fillStyle = '#fff6c8'; g.fillRect(R(x + f * 18 - 2), R(y - 26), 5, 14); }
  };
  /* the glob, the puddles, the mound, the quake's shadows, the brood, and THE READ (open ring + timer, ward shell, her shell's word) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'scarabmother') return; const G = S.G;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    for (const p of S.puddles) { g.globalAlpha = 0.6 * Math.min(1, p.t); ell(g, p.x - cx, G.floorY - cy - 1, SM.puddleR, 3, C.acid); g.globalAlpha = 1; }
    if (S.glob) { const q = S.glob, k = Math.min(1, q.t / SM.spitFly), gy = G.floorY - 30 - Math.sin(k * Math.PI) * 50; ell(g, q.x - cx, gy - cy, 4, 4, C.acid); }
    if (e.mode === 'spitTell' && S.mark) { const x = R(S.mark.x - cx), y = R(G.floorY - 2 - cy); g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 2); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 2); g.stroke(); }
    if (S.mound) { const x = R(S.mound.x - cx), y = R(G.floorY - cy); g.strokeStyle = 'rgba(255,154,92,0.8)'; g.beginPath(); g.arc(x, y - 2, SM.burrowR, Math.PI, 0); g.stroke(); }
    for (const s of S.stones) { if (s.done) { continue; } const x = R(s.x - cx), y = R(G.floorY - cy), k = 1 - Math.max(0, s.t) / (SM.quakeTell + SM.quakeFall);
      g.globalAlpha = 0.3 + 0.5 * k; g.fillStyle = '#10060a'; g.fillRect(x - SM.quakeR, y - 3, SM.quakeR * 2, 3); g.globalAlpha = 1;
      if (s.t < SM.quakeFall) { const sy = G.roofY + (G.floorY - G.roofY) * (1 - s.t / SM.quakeFall); g.fillStyle = '#b89c6c'; g.fillRect(x - 10, R(sy - cy) - 16, 20, 16); } }
    if (S.seethe) { const x = R(S.seethe.x - cx), y = R(G.floorY - cy); g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 20); g.fillStyle = '#7ad08a'; g.fillRect(x - 14, y - 4, 28, 4); g.globalAlpha = 1; }
    for (const b of S.brood) { if (!b.alive) continue; const x = R(b.x - cx), y = R(G.floorY - cy); ell(g, x, y - 4, 6, 4, C.shell); ell(g, x + (b.face || 1) * 5, y - 4, 2.5, 2.5, C.shellL); g.fillStyle = C.leg; for (let i = -1; i <= 1; i++) g.fillRect(x + i * 3, y - 1, 1, 2 + (Math.floor(time * 16 + i) & 1)); }
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
