// src/fire-drake-hands.js - THE FIRE DRAKE's HANDS (claude/drakewire, lane D1 of claude/heartplan). src/fire-drake.js is the fight (pure); this binds it
// to the world: its told blows on the heroes (keyed once a blow; the claw is the only one a guard takes - yellow !), the wing gust's shove, the chains,
// the scorched ring, the seal's cracks, the P3 vents and magma crests, THE TEARS sinking the basalt ledges, and BEATEN, NOT KILLED (Daniel 11-04 rec 1):
// at an empty bar main.js holds it off the death path (H.spare); it lunges once more, the LAST chain parts, it falls on the seal - then the fight is won
// (ctx.beaten) and the shrine is set beside the seal (Daniel rec 2: a checkpoint between the drake and the sky fight). The body stays drawn, down on the
// split seal (drawOver), for scene A (lane SC) to pick up.
// GREYBOX ART (readable placeholders; lane D2 DRAKEART draws it): every move its OWN windup and release pose (B16, POSE in src/fire-drake.js; the body
// below reads each pose's fields) and its OWN sound (SOUND: a 'drake*' name first for the art lane's sounds, then distinct stand-ins).
// THE SHARED READ (B10): JERKED = a gold ring and a timer bar; PANTING = a dashed gold ring (soft, x1); WARDED = a pale ring and the word; SCALES = a
// turned blow clanks, sparks and says so.
// main.js calls: spawnBoss, owns, on, update, take, spare, drawBoss, drawOver, barName, end, read, show, clear, phase. src/lab.js reads show() + fdPlan.
import * as FDM from './fire-drake.js';
import { BOSS_PHASE } from './boss-music.js';
const { FD, FD_SAY, POSE } = FDM;
const R = Math.round;
/* B16: every move its own sound. A 'drake*' sound first (D2 adds them to src/audio.js), then a stand-in that no other drake move uses */
const play = (s, names) => { for (const n of names) if (s && typeof s[n] === 'function') { try { s[n](); } catch {} return; } };
export const SOUND = {
  roar: ['drakeRoar', 'boreRoar', 'roar'], strain: ['drakeStrain', 'creak', 'thud'], snap: ['drakeChainSnap', 'crack', 'thud'],
  clawTell: ['drakeClawTell', 'snort', 'tell'], claw: ['drakeClaw', 'throwWhoosh', 'thud'],
  rattle: ['drakeRattle', 'rattle', 'chainRattle'], tail: ['drakeTail', 'heavy', 'thud'],
  chainGrip: ['drakeChainGrip', 'chain', 'clank'], chainSweep: ['drakeChainSweep', 'chainRattle', 'throwWhoosh'],
  inhale: ['drakeInhale', 'hiss', 'tell'], breath: ['drakeBreath', 'ember', 'hiss'],
  chains: ['drakeChains', 'chainRattle', 'chain'], lunge: ['drakeLunge', 'mawRoar', 'heavy'], twang: ['drakeTwang', 'clank', 'thud'],
  takeoff: ['drakeTakeoff', 'rumble', 'thud'], wings: ['drakeWings', 'throwWhoosh', 'rumble'], dive: ['drakeDive', 'throwWhoosh', 'heavy'],
  slamTell: ['drakeSlamTell', 'mawRoar', 'roar'], slam: ['drakeSlam', 'heavy', 'crack'], hiss: ['drakeVent', 'hiss', 'ember'],
};
const C = { hide: '#7a2a1c', hideL: '#a8402a', hideD: '#4a1810', belly: '#d8a04a', horn: '#e8d8b0', eye: '#ffd36b', glow: '#ff9a3a', hot: '#fff0b0', chain: '#8a8070', chainHot: '#ffe6a0',
  scorch: '#3a1a10', ring: '#ff6a2a', seal: '#4a3a34', sealL: '#7a6a5a', rune: '#ff9a3a', magma: '#ff5a1a', magmaL: '#ffc04a', wing: '#5a1c14', wingL: '#8a3020' };
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h))); };
const ell = (g, x, y, rx, ry, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(R(x), R(y), Math.max(1, rx), Math.max(1, ry), 0, 0, 7); g.fill(); };
const limb = (g, x0, y0, x1, y1, col, wd) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(R(x0), R(y0)); g.lineTo(R(x1), R(y1)); g.stroke(); g.lineCap = 'butt'; g.lineWidth = 1; };
/* WHAT A POSE'S body WORD MEANS for the greybox: lift (the body's middle above the floor), tilt (rad, + = nose down), neck (rad, + = raised) */
const BODY = {
  coiled: [12, 0, -0.3], rising: [22, -0.1, 0.6], stalk: [20, 0, 0.2], rear: [28, -0.35, 0.9], lean: [18, 0.2, 0.05], coil: [16, 0.1, 0.3], spin: [18, 0, 0.1],
  crouch: [12, 0.12, 0.05], twist: [18, -0.1, -0.35], brace: [18, 0.1, 0.12], slump: [12, 0.15, -0.35], dash: [16, 0.25, 0], onSide: [10, 1.25, -0.2],
  air: [26, 0, 0.3], stoop: [24, 0.6, -0.6], slam: [14, 0.22, -0.1], lunge: [16, 0.25, 0.05], collapsed: [8, 0.08, -0.55],
};
/* THE DRAKE (greybox, facing right, origin = the floor under its middle): legs, a long body, a tail behind, a neck and a horned head, wings on its back */
export function drawDrake(g, p, o = {}) {
  const t = o.time || 0, flash = !!o.flash, air = o.air || 0, [lift, tilt, neck] = BODY[p.body] || BODY.stalk, hide = flash ? '#ffffff' : C.hide;
  const by = -lift - air;
  g.save();
  /* the far legs, then the tail, then the body */
  if (!air && p.body !== 'onSide') { limb(g, -18, by + 6, -20, 0, C.hideD, 6); limb(g, 14, by + 6, 16, 0, C.hideD, 6); }
  g.save(); g.translate(0, by); g.rotate(tilt);
  { const raised = p.tail === 'raised', sweep = p.tail === 'sweep', rat = p.rattle ? Math.sin(t * 40) * 2 : 0;
    const tx = sweep ? 44 : -62, ty = raised ? -26 + rat : sweep ? 10 : 6 + Math.sin(t * 2) * 2;
    limb(g, -24, 2, (tx - 24) / 2 - 6, (ty + 2) / 2 - (raised ? 8 : 0), hide, 8); limb(g, (tx - 24) / 2 - 6, (ty + 2) / 2 - (raised ? 8 : 0), tx, ty, hide, 5);
    rect(g, tx - 3, ty - 3, 6, 6, C.hideD);   /* the tail's spade */ }
  /* the wings, folded on the back unless told otherwise */
  { const wst = p.wings || (p.body === 'air' ? 'beat' : 'fold'), flap = wst === 'beat' ? Math.sin(t * 14) : 0;
    const span = wst === 'spread' ? 34 : wst === 'beat' ? 30 : wst === 'half' ? 22 : wst === 'tucked' ? 8 : 12, up = wst === 'tucked' ? 4 : -span * (0.7 + 0.5 * flap);
    g.fillStyle = flash ? '#ffffff' : C.wing; g.beginPath(); g.moveTo(-10, -8); g.lineTo(-4 - span * 0.6, up); g.lineTo(14, -10); g.closePath(); g.fill();
    g.strokeStyle = C.wingL; g.beginPath(); g.moveTo(-10, -8); g.lineTo(-4 - span * 0.6, up); g.stroke(); }
  ell(g, 0, 0, 30, 12, hide); ell(g, 4, 5, 22, 6, flash ? '#ffffff' : C.belly);
  for (let i = -3; i <= 3; i++) rect(g, i * 7 - 1, -12, 3, 3, C.hideD);   /* the spine's plates */
  if (p.scales === 'blaze' || o.ward) { g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 18); g.strokeStyle = o.ward ? '#c8d8e8' : C.glow; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 32, 14, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  if (p.chest === 'glow') { const k = 0.5 + 0.5 * Math.sin(t * 12); ell(g, 20, 2, 8, 6, k > 0.5 ? C.hot : C.glow); }
  /* the near legs: a raised foreleg (claw tell), both high (slam tell), the swipe */
  if (!air && p.body !== 'onSide') {
    const lu = p.leg === 'up' || p.legs === 'high', sw = p.leg === 'swipe';
    if (p.legs === 'high') { limb(g, 18, 4, 30, -22, hide, 6); limb(g, 10, 4, 22, -24, hide, 6); }
    else if (lu) limb(g, 18, 4, 30, -18, hide, 6); else if (sw) limb(g, 18, 4, 46, 6, hide, 6); else limb(g, 18, 4, 20, lift - 1, hide, 6);
    limb(g, -16, 4, -16, lift - 1, hide, 6);
    const cx = p.legs === 'high' ? 30 : lu ? 30 : sw ? 46 : 20, cy = p.legs === 'high' ? -22 : lu ? -18 : sw ? 6 : lift - 1;
    for (let i = 0; i < 3; i++) rect(g, cx + i * 2 - 1, cy - 1, 1, 3, p.claws === 'glow' || sw ? C.hot : C.horn);
  }
  /* the neck and the head */
  { const nx = 26, ny = -6, ln = 24, a = -neck, hx = nx + Math.cos(a) * ln, hy = ny + Math.sin(a) * ln;
    limb(g, nx, ny, hx, hy, hide, 8);
    g.save(); g.translate(hx, hy); g.rotate(a * 0.6 + (p.head === 'down' ? 0.6 : p.head === 'up' ? -0.4 : 0) + (p.head === 'shake' ? Math.sin(t * 30) * 0.25 : 0));
    const open = p.jaw === 'open' || p.roar || p.body === 'lunge' || p.body === 'dash';
    rect(g, -2, -5, 16, 7, hide); rect(g, -2, 2 + (open ? 3 : 0), 14, 3, flash ? '#ffffff' : C.hideL);   /* skull, the lower jaw (dropped when open) */
    if (open) rect(g, 2, 2, 10, 3, '#2a0a06');
    rect(g, 4, -4, 2, 2, C.eye); limb(g, 0, -5, -6, -11, C.horn, 2); limb(g, 4, -5, 0, -12, C.horn, 2);   /* an eye, two horns */
    if (p.jaw === 'chain') { rect(g, 12, 0, 6, 3, C.chainHot); }   /* a chain gripped in its teeth */
    if (p.jaw === 'smoke') for (let i = 0; i < 3; i++) { const q = (t * 1.5 + i * 0.33) % 1; g.globalAlpha = 0.6 * (1 - q); ell(g, 16 + q * 8, -4 - q * 14, 2 + q * 3, 2 + q * 3, '#9a9090'); g.globalAlpha = 1; }
    if (p.roar) for (let i = 0; i < 3; i++) limb(g, 18 + i * 3, -6 + i * 4, 24 + i * 3, -8 + i * 5, '#ffe6a0', 1);
    g.restore();
    o.jaw && (o.jaw.x = hx, o.jaw.y = hy); }
  g.restore();
  g.restore();
}
export function makeFireDrakeHands(ctx) {
  let S = null; const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'firedrake' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'firedrake';
  H.phase = () => (S ? S.ph : 1);
  H.clear = () => { S = null; BOSS_PHASE.firedrake = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.fdKeys = pp.fdKeys || new Map(); if (pp.fdKeys.size > 160) pp.fdKeys.clear(); if (pp.fdKeys.has(key)) return true; pp.fdKeys.set(key, 1); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = FDM.newFight(FDM.geom(Ar, ctx.TS)); S.told = {}; S.sealStage = 0; S.won = false; BOSS_PHASE.firedrake = 1;
    const hp = ctx.EHP.firedrake || FD.hp;
    const e = { ...base, t: 'firedrake', w: FD.w, h: FD.h, hp, maxHp: hp, noGrav: true, markH: 74, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0, air: 0 };
    e.x = Math.max(FDM.bodyMax(S, -1), Math.min(FDM.bodyMax(S, 1), base.x)); e.y = S.G.floorY;
    for (const pp of ctx.players) pp.fdKeys = null; return e; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world(e, dt) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => play(ctx.sfx, SOUND[k] || []), shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.firedrake = ph; },
      mark: m => ctx.number(e.x, S.G.floorY - FD.h - 26 - (e.air || 0), m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 14, 36, '#ffd36b'); ctx.burst(x, y - 6, 18, ['#8a8070', '#ffe6a0', '#3a1a10'], 120, 0.7); } else if (k === 'ward') ctx.ring(x, y - 16, 38, '#c8d8e8'); },
      /* THE SEAL CRACKS at each tear (1, 2) and SPLITS when it is beaten (3). The P3 tear sinks the basalt ledges into the magma (design: a breather in P1/P2 only) */
      seal: st => { S.sealStage = st; ctx.burst(S.G.seal, S.G.floorY - 2, 14, ['#ff9a3a', '#7a6a5a', '#ffe6a0'], 110, 0.6);
        if (st >= 2 && !S.sunk) { S.sunk = true; for (const [a, b, row] of A().ledgeTiles || []) for (let x = a; x <= b; x++) { ctx.sinkTile(x, row); ctx.burst(x * ctx.TS + 8, row * ctx.TS + 4, 4, ['#ff5a1a', '#3a1a10'], 60, 0.5); } } },
      /* THE WING GUST: every hero on the floor is pushed v px a second (this frame), held inside the caldera's walls */
      push: v => { for (const pp of ctx.players) { if (!ctx.upright(pp) || pp.dead || !pp.ground) continue; pp.x = Math.max(S.G.x0 + 8, Math.min(S.G.x1 - 8, pp.x + v * dt)); } },
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          /* the CLAW is the yellow ! (block / parry / step out); every red !! is unblockable - jumped, rolled or left */
          let res = null; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.yellow }); });
          if (res === 'hit' && o.push) { P.vx = o.push; P.vy = Math.min(P.vy || 0, -110); P.ground = false; } }); },
    };
  }
  /* ---------- ONE FRAME OF IT ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.told.wake) { S.told.wake = 1; e.modeT = 1.8; ctx.number(e.x, S.G.floorY - 96, FD_SAY.wake, '#ffd36b'); play(ctx.sfx, SOUND.roar); ctx.shake(7);
      ctx.burst(S.G.seal, S.G.floorY - 4, 24, ['#ff9a3a', '#ffe6a0', '#3a1a10'], 140, 0.8); }
    if (S.told.wake && !S.told.rule && e.mode === 'walk') { S.told.rule = 1; ctx.hint && ctx.hint(FD_SAY.rule); }
    FDM.stepDrake(e, S, dt, heroes(), world(e, dt));
    e.y = S.G.floorY - (e.air || 0); e.phase = S.ph; e.open = FDM.fdOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
    /* BEATEN, NOT KILLED: it lies on the split seal - the fight is won, the shrine set beside it (the sky fight's checkpoint) */
    if (S.done && !S.won) { S.won = true; S.downE = { x: e.x, face: e.face || 1 }; S.n.beatenAt = R(ctx.time() * 10) / 10;
      ctx.checkpoint && ctx.checkpoint(S.G.seal - (e.face || 1) * 56, S.G.floorY); ctx.beaten(e); }
  };
  /* ITS BAR IS EMPTY (main.js hurtEnemy0, before the kill): held off the death path - true = spared */
  H.spare = e => { if (!S || !e || e.t !== 'firedrake' || !e.alive) return false; e.spent = true; e.hp = Math.max(e.hp, 0.01); return true; };
  /* A BLOW ON IT (B15; src/fire-drake.js takeBlow) - the turned share clanks and says why */
  H.take = (e, dmg) => { if (!S) return dmg; const [d, word] = FDM.takeBlow(e, S, dmg);
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 22, S.G.floorY - 18 - (e.air || 0), sd, 4);
      if (!S.told.hide && word === FD_SAY.hide) { S.told.hide = 1; ctx.hint && ctx.hint('ITS SCALES TURN A BLOW. STAND PAST THE SCORCHED RING: ITS LUNGE IS JERKED BACK BY THE CHAIN.'); } }
    return d; };
  const readWord = e => (FDM.fdOpen(e) ? '  JERKED' : FDM.fdSoft(e) ? '  PANTING' : S && S.ward > 0 ? '  WARDED' : '');
  H.barName = e => 'THE FIRE DRAKE' + readWord(e);
  H.end = () => { if (S) { S.waves = []; S.vents = []; } BOSS_PHASE.firedrake = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.t === 'firedrake' ? ctx.boss.mode : null, ph: S.ph, chains: S.chains, ring: FDM.ringOf(S), ward: S.ward, purse: S.purse, seal: S.sealStage, sunk: !!S.sunk, won: S.won, done: S.done,
    n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  /* ---------- THE DRAWING ---------- */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, x = e.x - cx, y = S.G.floorY - cy, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06, p = POSE[e.mode] || POSE.walk;
    const jaw = {}; g.save(); g.translate(R(x), R(y)); g.scale(f, 1); drawDrake(g, p, { time, flash, air: e.air || 0, ward: S.ward > 0, jaw }); g.restore();
    S.jawPx = { x: e.x + f * (jaw.x || FD.head), y: S.G.floorY + (jaw.y || -30) }; };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G, X = v => R(v - cx), Y = v => R(v - cy), e = ctx.boss && ctx.boss.t === 'firedrake' ? ctx.boss : null;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', ring = FDM.ringOf(S), fy = Y(G.floorY);
    /* THE SEAL: a rune disc in the floor, cracked by the tears, split when it is beaten */
    ell(g, X(G.seal), fy + 1, 28, 5, C.seal); g.strokeStyle = C.rune; g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 3); g.beginPath(); g.ellipse(X(G.seal), fy + 1, 22, 3.5, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
    for (let i = 0; i < S.sealStage; i++) limb(g, X(G.seal) - 14 + i * 12, fy - 1, X(G.seal) - 8 + i * 12, fy + 4, i === 2 ? C.magmaL : C.magma, 2);
    /* THE SCORCHED RING: always visible at the chain's reach; it glows when a chain is taut */
    const taut = e && e.alive && (e.mode === 'lungeTell' || e.mode === 'lunge' || e.mode === 'jerked' || (e.mode === 'dive' && e.jerk) || Math.abs(Math.abs(e.x - G.seal) - (ring - FD.head)) < 3);
    if (!S.won) { g.globalAlpha = taut ? 0.6 + 0.3 * Math.sin(time * 16) : 0.55; g.strokeStyle = taut ? C.ring : C.scorch; g.lineWidth = 2; g.beginPath(); g.ellipse(X(G.seal), fy + 1, ring, 4, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      for (const sd of [-1, 1]) { rect(g, X(G.seal + sd * ring) - 1, fy - 3, 2, 6, taut ? C.ring : '#6a2a14'); } }
    /* THE CHAINS: from the seal to its collar, sagging to the floor - straight and white-hot when taut */
    if (e && e.alive && S.chains > 0) { const f = e.face || 1, col = { x: e.x + f * 22, y: G.floorY - 22 - (e.air || 0) };
      for (let i = 0; i < S.chains; i++) { const ax = G.seal + (i - (S.chains - 1) / 2) * 8, ay = G.floorY - 1;
        g.strokeStyle = taut ? (Math.floor(time * 20 + i) % 2 ? C.chainHot : '#ffffff') : C.chain; g.lineWidth = 2; g.setLineDash([3, 2]); g.beginPath(); g.moveTo(X(ax), Y(ay));
        if (taut) g.lineTo(X(col.x), Y(col.y)); else g.quadraticCurveTo(X((ax + col.x) / 2), Y(G.floorY + 2), X(col.x), Y(col.y)); g.stroke(); g.setLineDash([]); g.lineWidth = 1; } }
    /* THE LEDGES (greybox basalt) until P3 sinks them */
    if (!S.sunk) for (const [a, b, h] of G.ledges) { rect(g, X(a), Y(G.floorY - h), b - a, 4, '#3a3036'); rect(g, X(a), Y(G.floorY - h) + 4, b - a, 1, '#1a1418'); }
    /* THE VENTS (P3): told glow, then the geyser */
    for (const v of S.vents) { if (v.t > 0) { g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 18); ell(g, X(v.x), fy, FD.vent.w + 2, 3, '#ff4a1a'); g.globalAlpha = 1; }
      else { const hh = FD.vent.h * Math.min(1, -v.t / 0.12); rect(g, X(v.x - FD.vent.w), fy - hh, FD.vent.w * 2, hh, C.magma); rect(g, X(v.x - FD.vent.w / 2), fy - hh, FD.vent.w, hh, C.magmaL); } }
    /* THE MAGMA CRESTS (P3 slam): jump them */
    for (const w of S.waves) { for (let q = -FD.slam.crest; q <= FD.slam.crest; q += 2) { const hh = R(Math.cos(q / FD.slam.crest * Math.PI / 2) * FD.slam.clear); rect(g, X(w.x + q), fy - hh, 2, hh + 1, hh > 5 ? C.magmaL : C.magma); } }
    if (e && e.alive) {
      const f = e.face || 1, jx = FDM.jawX(e);
      /* THE BREATH: its reach told faint red while it inhales; the fire itself on the release */
      if (e.mode === 'breathTell' || e.mode === 'breath') { const a = jx + f * FD.breath.gap, b = jx + f * (ring + FD.breath.over);
        if (e.mode === 'breathTell') { g.globalAlpha = 0.18 + 0.12 * Math.sin(time * 14); g.fillStyle = '#ff4a2a'; g.fillRect(X(Math.min(a, b)), fy - FD.breath.h, R(Math.abs(b - a)), FD.breath.h); g.globalAlpha = 1; }
        else for (let q = 0; q < Math.abs(b - a); q += 6) { const xx = a + f * q, hh = FD.breath.h * (0.6 + 0.4 * Math.sin(time * 30 + q)); rect(g, X(xx), fy - hh, 6, hh, (q / 6) % 2 ? C.glow : C.magmaL); } }
      /* THE CHAIN SWEEP: the band it will sweep, told in red dashes on the floor; the chain swept low across it */
      if (e.mode === 'sweepTell' || e.mode === 'sweep') { const sd = e.sweepSide || 1, a = G.seal + sd * (ring - FD.sweep.inside), b = G.seal + sd * (ring + FD.sweep.over);
        if (e.mode === 'sweepTell') { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 14); for (let q = Math.min(a, b); q < Math.max(a, b); q += 9) rect(g, X(q), fy - 2, 5, 2, '#ff6b6b'); g.globalAlpha = 1; }
        else limb(g, X(Math.min(a, b)), fy - 6, X(Math.max(a, b)), fy - 6, C.chainHot, 3); }
      /* THE LUNGE's aim: a red tick where it will go once the chains glow white */
      if (e.mode === 'lungeTell' && e.lockX !== undefined) { rect(g, X(e.lockX) - 1, fy - 18, 2, 14, e.modeT <= FD.lunge.lock ? blink : '#ffb347'); }
      /* THE DIVE: the gust lines while it hovers, then the red ring at your feet */
      if (e.mode === 'hover') for (let i = 0; i < 4; i++) { const q = (time * 3 + i * 0.25) % 1; g.globalAlpha = 1 - q; for (const sd of [-1, 1]) rect(g, X(e.x + sd * (30 + q * 70)), fy - 8 - i * 6, 8, 1, '#e8d8c0'); g.globalAlpha = 1; }
      if (e.mode === 'diveTell' && e.lockX !== undefined) { g.strokeStyle = blink; g.lineWidth = 2; g.beginPath(); g.ellipse(X(e.lockX), fy - 1, FD.dive.r, 4, 0, 0, 7); g.stroke(); g.lineWidth = 1; }
      /* the claw's rake and the tail's sweep, drawn on the release */
      if (e.mode === 'claw') { g.globalAlpha = 0.8; for (let i = 0; i < 3; i++) limb(g, X(e.x + f * (FD.claw.reach - 20)), fy - 26 + i * 6, X(e.x + f * FD.claw.reach), fy - 20 + i * 6, '#fff6e0', 1); g.globalAlpha = 1; }
      if (e.mode === 'tail') { g.globalAlpha = 0.7; limb(g, X(e.x - f * FD.tail.back), fy - 6, X(e.x + f * FD.tail.ahead), fy - 6, '#ffd3a0', 2); g.globalAlpha = 1; }
      /* THE READ (B10) */
      const x = X(e.x), y = Y(G.floorY - 18 - (e.air || 0));
      if (FDM.fdOpen(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1));
        g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 34, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
        const by = Y(G.floorY - 62); ctx.text('JERKED', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3);
        if (S.purse !== null && S.purse !== undefined) { const pk = Math.max(0, Math.min(1, S.purse / (e.maxHp * FD.jerk.cap))); g.fillStyle = '#ff9a3a'; g.fillRect(x - 18, by + 4, R(36 * pk), 1); } }
      else if (FDM.fdSoft(e)) { g.globalAlpha = 0.5; g.strokeStyle = '#ffd36b'; g.setLineDash([4, 3]); g.beginPath(); g.arc(x, y, 32, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; ctx.text('PANTING', x, Y(G.floorY - 60), '#ffd36b', 'center', 5); }
      if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 36, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
        ctx.text('WARDED', x, Y(G.floorY - 60), '#c8d8e8', 'center', 5); }
      if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, Y(G.floorY - 70 - (e.air || 0)) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
    }
    /* BEATEN: it lies on the split seal, its last chain parted (scene A - lane SC - takes it from here) */
    if (S.won && S.downE) { g.save(); g.translate(X(S.downE.x), fy); g.scale(S.downE.face, 1); drawDrake(g, POSE.down, { time }); g.restore(); }
  };
  return H;
}
