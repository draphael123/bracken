// src/skyhook2-hands.js - SKYHOOK 2's HANDS (claude/sky2grey, 11-14). src/skyhook2.js is the fight (pure); this binds it to the world and draws it. GREYBOX.
// Reached only through src/skyhook-hands.js makeSkyhookHands when the flag SKY2 is on (or ctx.sky2 === true from a tool): with it off this file is never called.
// Same contract as the live hands (main.js calls: spawnBoss, props, owns, ownsProp, on, update, take, lever, drawBoss, drawOver, barName, end, read, show, clear, phase, plan).
// THE WORLD: his told blows on the heroes (keyed once a hero a move; yellow a shield turns, red it does not), the winch lines SW / SE through the line kit (cut them,
//   knock their riders off - riderHit), THE FALL COST (knocked or cut off a winch: 5 dmg, never lethal, 0.4 s on the floor), A1's iron step (one ONEWAY tile at the
//   winch's foot for 4 s: the only grid write, restored on its timer, at end() and at clear()), and the 3 LEVERS as props in main.js's foe list ('skylever':
//   every blow and every shot of every hero reaches them through hurtEnemy0 -> lever()).
// GREYBOX ART (the art lane SKY2ART draws it from src/redraw/line_crew_art.js): two iron CROWNS bolted under the roof, the SKY line crown to crown, the LOW line
//   with a ramp at each crown, the roof JIB and the ORE SKIP on its chain, a lamp + a state word over each lever, the gold chain from his hook to POINTS (the
//   re-hook), the red fray bar on the LOW line, the counterweight's red streak and its iron block, the rivet dots, the skip's red arc, the chain-hatch ring.
import * as SK2 from './skyhook2.js';
import { BOSS_PHASE } from './boss-music.js';
import { lineCut, riderHit } from './line-kit.js';
import { POSE } from './skyhook-hands.js';
import { drawRiggerArt, drawSkyTrolley, drawSkyHook, chainLine, drawLeverArt } from './redraw/line_crew_art.js';
const { SK } = SK2;
const R = Math.round;
const ONEWAY = 2;   /* src/level.js T.ONEWAY (tools/sky2.mjs checks it; not imported: level.js is heavy) */
const SOUND = { rideTell: s => (s.ratchet || s.clank)(), ride: s => (s.ratchet || s.throwWhoosh)(), perch: s => (s.pStep || s.thud)(), hookTell: s => s.tell && s.tell(false),
  hook: s => (s.throwWhoosh || s.slash)(), dropTell: s => s.tell && s.tell(true), lock: s => (s.clank || s.thud)(), drop: s => (s.throwWhoosh || s.thud)(), slam: s => { (s.heavy || s.thud)(); (s.rubble || s.thud)(); },
  jarred: s => (s.sting || s.coin || s.clank)(), sweepTell: s => s.tell && s.tell(true), sweep: s => (s.slash || s.throwWhoosh)(), grappleTell: s => (s.clank || s.thud)(), grapple: s => (s.ratchet || s.throwWhoosh)(),
  slip: s => { (s.crack || s.thud)(); (s.ratchet || s.clank)(); }, downed: s => { (s.heavy || s.thud)(); (s.sting || s.coin || s.clank)(); }, rise: s => (s.roar || s.heavy || s.thud)(),
  cutTell: s => s.tell && s.tell(true), cut: s => (s.crack || s.thud)(), cutter: s => (s.ratchet || s.clank)(), swingTell: s => s.tell && s.tell(true), swing: s => (s.throwWhoosh || s.slash)(), clank: s => (s.clank || s.thud)(),
  /* (sky2) the new ones: each its own (art lane: real samples) */
  points: s => { (s.clank || s.thud)(); (s.ratchet || s.clank)(); }, held: s => (s.coin || s.clank)(), rehook: s => (s.ratchet || s.clank)(), crane: s => (s.heavy || s.thud)(),
  skipTell: s => { s.tell && s.tell(true); (s.ratchet || s.clank)(); }, skip: s => (s.throwWhoosh || s.slash)(), cwTell: s => { s.tell && s.tell(true); (s.ratchet || s.clank)(); }, cw: s => (s.throwWhoosh || s.thud)(),
  rivetTell: s => { s.tell && s.tell(false); (s.clank || s.thud)(); }, rivet: s => (s.clank || s.thud)() };
const C = { rope: '#c8b088', ropeD: '#8a7658', iron: '#4a5058', ironL: '#6a727c', ironD: '#2a2e34', red: '#ff4a2a', redS: '#ff6b6b', gold: '#ffd36b', grey: '#7a7a82', amber: '#ffb347', pale: '#c8d8e8', chain: '#8a9098' };
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h))); };
const line = (g, x0, y0, x1, y1, col, wd = 1) => { g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); g.moveTo(R(x0), R(y0)); g.lineTo(R(x1), R(y1)); g.stroke(); g.lineWidth = 1; };
/* THE NEW POSES (B16: windup and release differ), on top of the live fight's (src/skyhook-hands.js POSE) */
const NEW_POSES = {
  enrageTell: { crouch: 4, lean: -0.3, hand: [10, -36], off: [-10, -28], hook: [14, -50], legs: 'stand', cutter: 'up' },
  cwTell: { crouch: 6, lean: 0.3, hand: [12, -10], off: [6, -12], hook: [-14, -30], legs: 'kneel', look: true },                 /* both hands on the weight's latch */
  cw: { crouch: 2, lean: -0.2, hand: [18, -4], off: [-8, -20], hook: [-14, -30], legs: 'stand' },                                  /* the latch thrown open, arm down the line */
  rivetTell: { crouch: 0, lean: -0.25, hand: [6, -44], off: [-6, -30], hook: [8, -58], legs: 'stand', butt: true },               /* the hook's butt raised as a hammer */
  rivet: { crouch: 6, lean: 0.3, hand: [12, -26], off: [-4, -24], hook: [18, -32], legs: 'kneel', butt: true },                  /* hammered down on the sky line */
  rehookTell: { crouch: 0, lean: 0.3, hand: [-14, -20], off: [2, -34], hook: [-24, -10], legs: 'hang', grip: true, coil: true },  /* hanging one-handed, the hook flung back at the points */
  rampUp: { crouch: 0, lean: -0.1, hand: [2, -34], off: [-2, -34], hook: [-10, -12], legs: 'hang', grip: true },
  frayTell: { crouch: 0, lean: 0.35, hand: [8, -30], off: [4, -26], hook: [-12, -16], legs: 'hang', grip: true, cutter: 'jaw' },   /* the cutter's jaws on the low line */
  crownHookTell: { crouch: 2, lean: 0.35, hand: [16, -14], off: [-6, -30], hook: [26, 2], legs: 'stand', coil: true },   /* from the crown, the hook flung down at the points */
  swingBack: { crouch: 0, lean: -0.3, hand: [0, -34], off: [2, -32], hook: [-10, -16], legs: 'swing', rope: true },
  smashed: { crouch: 0, lean: 0, hand: [12, -6], off: [-12, -4], hook: [20, -2], legs: 'down', stars: true },
};
/* (a function: src/skyhook-hands.js imports this file, so POSE is read when first drawn, never at load - no import cycle at load) */
let POSE2c = null; export const pose2 = () => POSE2c || (POSE2c = { ...POSE, ...NEW_POSES });
export function makeSky2Hands(ctx) {
  let S = null; let props = []; let step = null; const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'skyhook' ? ctx.L.arena : null);
  H.sky2 = true;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => !!e && e.t === 'skyhook';
  H.ownsProp = e => !!e && e.t === 'skylever';
  H.phase = () => (S ? S.ph : 1);
  const unstep = () => { if (step && ctx.L && ctx.L.grid) ctx.L.grid[step.i] = step.was; step = null; };
  H.clear = () => { unstep(); S = null; props = []; BOSS_PHASE.skyhook = 1; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'skyhook' ? e : null; };
  const kit = () => (ctx.kit ? ctx.kit() : null);
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.shKeys = pp.shKeys || new Map(); if (pp.shKeys.size > 120) pp.shKeys.clear(); if (pp.shKeys.has(key)) return true; pp.shKeys.set(key, 1); return false; };
  /* the winch lines' feet (the kit's own lines: the low end of SW / SE) */
  const feetOf = Ar => { const K = kit(), TS = ctx.TS || 16; if (!K) return undefined; const out = {};
    for (const s of ['W', 'E']) { const z = K.lines[Ar.winch[s]]; if (!z) return undefined; const lowEnd = z.y0 > z.y1 ? { x: z.x0, y: z.y0 } : { x: z.x1, y: z.y1 }; out[s] = { x: lowEnd.x, y: lowEnd.y }; } void TS; return out; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; unstep();
    S = SK2.newFight2(SK2.geom2(Ar, { feet: feetOf(Ar) })); BOSS_PHASE.skyhook = 1;
    const hp = Math.round(((ctx.EHP && ctx.EHP.skyhook) || 1500) * SK.hp / 1500);   /* the plan's 1700 over the live 1500 (EHP.skyhook is the live SH.hp; a tier scales both) */
    const e = { ...base, t: 'skyhook', w: SK.w, h: SK.h, hp, maxHp: hp, noGrav: true, markH: SK.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0, sky2: true };
    SK2.atCrown(e, S); for (const pp of ctx.players) { pp.shKeys = null; pp.sk2Fall = false; }
    props = S.G.levers.map(l => ({ ...base, t: 'skylever', id: l.id, x: l.x, y: S.G.floorY, w: 12, h: 22, hp: 9999, maxHp: 9999, noGrav: true, alive: true, face: 1, mode: 'idle', modeT: 0, prop: true, markH: 26, xpKey: undefined, swing: 0, cool: 0, sky2: true }));
    return e; };
  H.props = () => props;
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, lk: pp.lk ? pp.lk.id : null, pp }));
  function world(e) {
    const K = kit();
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch { /* no sound */ } }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.skyhook = Math.min(2, ph); },
      mark: m => ctx.number(e.x, e.y - SK.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      markAt: (x, y, m) => ctx.number(x, y, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 14, 34, '#ffd36b'); ctx.burst(x, y - 8, 14, ['#8a8a94', '#c8b088', '#ffd36b'], 110, 0.7); } else if (k === 'ward') ctx.ring(x, y - 14, 36, '#c8d8e8'); else if (k === 'dust') ctx.burst(x, y - 2, 18, ['#8a8a94', '#6a6a72', '#c8c8d0'], 120, 0.6); else if (k === 'spark') ctx.burst(x, y - 2, 6, ['#ffd36b', '#ff9a3c'], 90, 0.3); },
      lineUp: id => !!(K && K.lines[id] && !(K.lines[id].cut > 0)),
      cutLine: (id, s) => { for (const pp of ctx.players) if (pp.lk && pp.lk.id === id && !pp.dead) pp.sk2Fall = true; return !!(K && lineCut(K, id, s)); },
      riders: id => ctx.players.filter(pp => pp.lk && pp.lk.id === id && !pp.dead),
      knock: (id, fromX) => { if (!K) return 0; let n = 0; for (const pp of ctx.players) if (pp.lk && pp.lk.id === id && !pp.dead) { if (riderHit(K, pp, { from: fromX }) === 'knocked') { pp.sk2Fall = true; n++; } } return n; },
      step: (x, on) => { const L = ctx.L, TS = ctx.TS || 16; const LW = L && (L.w || L.W); if (!L || !L.grid || !LW) return; if (!on) { unstep(); return; } unstep(); const tx = Math.floor(x / TS), ty = Math.round(S.G.floorY / TS) - 1, i = ty * LW + tx;
        if (L.grid[i] !== 0) return; step = { i, was: L.grid[i], x: tx * TS, y: ty * TS }; L.grid[i] = ONEWAY; },
      hit: (bx, d, name, o = {}) => { const out = [];
        for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (o.ridersOnly && !(P.lk && P.lk.id === o.ridersOnly)) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; const hp0 = P.hp; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name: 'SKYHOOK', unblockable: !o.yellow }); });
          const r = res === 'blocked' ? (P.parryT > 0.2 ? 'parried' : 'blocked') : P.hp < hp0 || P.hurt > 0 ? 'hit' : 'miss'; out.push(r);
          if (r === 'hit') {
            if (P.lk && K) { if (riderHit(K, P, { from: e.x }) === 'knocked') pp.sk2Fall = true; }
            if (o.pull) { P.vx = (Math.sign((o.pullTo ?? e.x) - P.x) || 1) * o.pull; P.vy = Math.min(P.vy || 0, -120); P.ground = false; if (S) ctx.number(P.x, P.y - 30, SK2.SKY2_SAY.hooked, '#ff9a5c'); }
            if (o.push) { P.vx = o.pushFrom !== undefined ? (Math.sign(P.x - o.pushFrom) || 1) * o.push : o.push; P.vy = Math.min(P.vy || 0, -110); P.ground = false; }
            if (o.up) { P.vy = o.up; P.ground = false; } } });
        return out; },
    };
  }
  /* THE FALL COST: a hero knocked or cut off a winch pays it on landing (spare: it never kills) */
  function fallCost(e) {
    for (const pp of ctx.players) { if (!pp.sk2Fall || pp.lk || !pp.ground) continue; pp.sk2Fall = false;
      ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead) return; hurt('fall', () => ctx.damagePlayer(e.x, SK.fall.dmg, { who: e, name: 'SKYHOOK', unblockable: true, noKnock: true, spare: true })); P.hurt = Math.max(P.hurt || 0, SK.fall.stun); P.vx = 0; }); }
  }
  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.wokeSaid) { S.wokeSaid = true; e.modeT = 1.6; ctx.number(e.x, e.y - 70, SK2.SKY2_SAY.wake, '#ffd36b'); SOUND.rise(ctx.sfx); ctx.shake(4); }
    if (S.wokeSaid && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number(S.G.mid, S.G.floorY - 120, SK2.SKY2_SAY.rule, '#ffd36b'); }
    SK2.stepSky2(e, S, dt, heroes(), world(e)); fallCost(e);
    for (const l of props) { l.swing = Math.max(0, l.swing - dt); l.cool = Math.max(0, l.cool - dt); l.hp = l.maxHp; }
    e.phase = S.ph; e.open = SK2.sky2Open(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode; e.sk2Immune = SK2.sky2Immune(e);
  };
  /* A LEVER STRUCK (main.js hurtEnemy0 hands every blow and shot on a 'skylever' here) */
  H.lever = (l, fromX) => { if (!l || l.cool > 0) return null; l.cool = 0.25; l.swing = 0.35; l.hp = l.maxHp; void fromX;
    const e = live(); if (!S || !e || !ctx.bossActive) { SOUND.clank(ctx.sfx); return null; }
    return SK2.leverStruck2(e, S, l.id, world(e)); };
  /* A BLOW ON HIM - OUT OF REACH (0) on his sky line or a crown, told; x0.75 on the LOW line; DOWN / SMASHED x2, JARRED x1.5 up to a purse */
  H.take = (e, dmg, tag) => { void tag; if (!S) return dmg; const [d, word] = SK2.takeBlow2(e, S, dmg);
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 9, e.y - 16, sd, 3);
      if (word === SK2.SKY2_SAY.reach && !S.told.reach) { S.told.reach = 1; ctx.number(e.x, e.y - 70, SK2.SKY2_SAY.reachTip, '#c8d8e8'); ctx.hint && ctx.hint('HE IS OUT OF REACH ON HIS SKY LINE. STRIKE THE POINTS LEVER (WEST): HE COMES DOWN TO THE LOW LINE.'); }
      if (word === SK2.SKY2_SAY.guard && !S.told.coat) { S.told.coat = 1; ctx.hint && ctx.hint('ON THE LOW LINE HIS COAT TURNS A QUARTER. STRIKE THE WEIGHT LEVER (EAST) AND HE DROPS.'); } }
    return d; };
  H.barName = e => 'SKYHOOK' + (SK2.sky2Open(e) ? '  ' + (SK2.OPEN_NAME2[e.mode] || 'OPEN') : SK2.sky2Immune(e) ? '  OUT OF REACH' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = () => { if (S) { S.hooks = []; S.leverHook = null; S.rivets = []; S.whip = null; S.skip.st = 'rest'; S.cw = null; } unstep(); BOSS_PHASE.skyhook = 1; };
  H.read = () => S && { sky2: true, mode: ctx.boss && ctx.boss.mode, where: SK2.sky2Where(ctx.boss), ph: S.ph, side: S.side, ward: S.ward, enraged: S.enraged, points: S.points, lowCut: S.lowCut, skyCut: S.skyCut, weightT: S.weightT,
    skip: S.skip.st, lamps: ctx.boss ? SK2.lamps(ctx.boss, S) : null, hooks: S.hooks.length, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) }, struck: S.struck.slice(-20) };
  H.plan = () => (S ? { levers: S.G.levers.map(l => ({ ...l })), sky2: true } : null);
  /* ---------- DRAWING (greybox) ---------- */
  H.drawBoss = (g, e, cx, cy, time) => {
    if (e.t === 'skylever') { drawLever(g, e, cx, cy, time); return; }
    if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const m = e.mode, P2 = pose2(), p = P2[m] || P2.perch, f = e.face || 1, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06;
    g.save(); g.translate(R(e.x - cx), R(e.y - cy)); if (m !== 'downed' && m !== 'smashed') g.scale(f, 1);
    const onLine = m === 'ride' || m === 'dropTell' || m === 'rehookTell' || m === 'frayTell' || m === 'rampUp';
    if (onLine || m === 'rideTell') drawSkyTrolley(g, 0, -SK.hang - 6 + (m === 'rideTell' ? SK.hang - 30 : 0), 1, time);
    if (p.rope) line(g, 0, -32, 0, -80, C.rope);
    drawRiggerArt(g, p, flash, time, Math.min(2, S.ph), 0, 0, 1);
    g.restore(); };
  const LAMP = { SKY: '#8ab8ff', LOW: '#7ad07a', LOCKED: '#5a5a62', HOOKING: '#ff4a2a', HELD: '#ffd36b', READY: '#ffd36b', SPENT: '#5a5a62', DARK: '#2a2a30', SWINGING: '#ff4a2a', COOLING: '#7a6a5a', PAUSE: '#ffb347', HOLDS: '#ffd36b' };
  function drawLever(g, l, cx, cy, time) {
    const x = R(l.x - cx), y = R(l.y - cy), e = live(), Lm = e && S ? SK2.lamps(e, S) : null, st = Lm ? Lm[l.id] : 'DARK', blink = Lm && Lm.blink[l.id] && ctx.bossActive;
    drawLeverArt(g, x, y, l.swing, !!(Lm && st !== 'DARK' && st !== 'LOCKED' && st !== 'SPENT'), blink && Math.floor(time * 6) % 2 === 0, time);
    /* THE LAMP on its iron post, and the lever's name + state (the art lane draws the lamp; the word stays) */
    rect(g, x - 1, y - 40, 2, 12, C.iron); const lit = blink && Math.floor(time * 6) % 2 ? '#ffffff' : (LAMP[st] || C.grey);
    rect(g, x - 4, y - 46, 8, 7, C.ironD); rect(g, x - 3, y - 45, 6, 5, lit);
    if (ctx.text) { ctx.text(l.id, x, y - 58, '#e8e0d0', 'center', 5); ctx.text(st, x, y - 51, LAMP[st] || C.grey, 'center', 5); }
  }
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const e = ctx.boss, G = S.G, X = v => R(v - cx), Y = v => R(v - cy);
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    /* THE CROWNS: iron sheave housings bolted under the roof */
    for (const s of ['W', 'E']) { const c = G.crown[s]; rect(g, X(c.x - 14), Y(c.y), 28, 6, C.iron); rect(g, X(c.x - 14), Y(c.y), 28, 2, C.ironL); rect(g, X(c.x - 6), Y(G.roof), 4, c.y - G.roof, C.ironD); rect(g, X(c.x + 2), Y(G.roof), 4, c.y - G.roof, C.ironD);
      for (const k of [-10, -2, 6]) rect(g, X(c.x + k), Y(c.y + 2), 2, 2, C.ironL); g.strokeStyle = C.ironL; g.beginPath(); g.arc(X(c.x), Y(G.skyY), 6, 0, 7); g.stroke(); }
    /* THE SKY LINE (dashed and slack while it is snapped) and THE LOW LINE with its ramps (grey while it is cut) */
    if (S.skyCut > 0) { g.setLineDash([3, 4]); line(g, X(G.crown.W.x), Y(G.skyY), X(G.crown.W.x + 30), Y(G.skyY + 40), C.ropeD); line(g, X(G.crown.E.x), Y(G.skyY), X(G.crown.E.x - 30), Y(G.skyY + 40), C.ropeD); g.setLineDash([]); }
    else line(g, X(G.crown.W.x), Y(G.skyY), X(G.crown.E.x), Y(G.skyY), C.rope);
    { const col = S.lowCut > 0 ? C.grey : C.rope; if (S.lowCut > 0) g.setLineDash([2, 5]); g.beginPath(); g.strokeStyle = col;
      for (let x = G.crown.W.x; x <= G.crown.E.x; x += 6) { const yy = Y(G.ropeY('low', x)); if (x === G.crown.W.x) g.moveTo(X(x), yy); else g.lineTo(X(x), yy); } g.stroke(); g.setLineDash([]); }
    /* THE JIB and THE ORE SKIP on its chain */
    rect(g, X(G.pivot.x - 40), Y(G.roof), 80, 5, C.iron); rect(g, X(G.pivot.x - 3), Y(G.roof), 6, G.pivot.y - G.roof + 2, C.ironD);
    const K = S.skip, q = K.st === 'sweep' && K.x !== undefined ? { x: K.x, y: K.y } : SK2.skipAt(S, 0.5 + Math.sin(time * 0.8) * 0.02, 1);
    const qq = K.st === 'rest' || K.st === 'tell' ? SK2.skipAt(S, K.dir > 0 ? 0 : 1, 1) : q;
    chainLine(g, X(G.pivot.x), Y(G.pivot.y), X(qq.x), Y(qq.y - 10), time); rect(g, X(qq.x - 12), Y(qq.y - 10), 24, 18, C.iron); rect(g, X(qq.x - 12), Y(qq.y - 10), 24, 3, C.ironL); rect(g, X(qq.x - 10), Y(qq.y + 6), 20, 2, C.ironD);
    if (K.st === 'tell') { g.globalAlpha = 0.35 + 0.3 * Math.sin(time * 16); g.strokeStyle = '#ff4a2a'; g.lineWidth = 2; g.setLineDash([5, 3]); g.beginPath();
      for (let k = 0; k <= 1.001; k += 0.05) { const p = SK2.skipAt(S, k, K.dir); if (k === 0) g.moveTo(X(p.x), Y(p.y)); else g.lineTo(X(p.x), Y(p.y)); } g.stroke(); g.setLineDash([]); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text && ctx.text('!!', X(G.pivot.x), Y(G.pivot.y + 40), blink, 'center', 8); }
    /* the iron step A1 left */
    if (step) { rect(g, X(step.x), Y(step.y), 16, 16, C.iron); rect(g, X(step.x), Y(step.y), 16, 2, C.ironL); }
    if (!ctx.bossActive || !e || e.t !== 'skyhook') return;
    /* THE HOOK'S AIM, the hooks in flight */
    if (e.mode === 'hookTell') { const set = e.modeT <= SK.hook.lock; g.globalAlpha = 0.7; g.strokeStyle = set ? blink : '#ffb347'; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(e.x), Y(e.y - 20)); g.lineTo(X(e.aimX), Y(e.aimY)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
    for (const h of S.hooks) { chainLine(g, X(h.ox), Y(h.oy), X(h.x), Y(h.y), time); drawSkyHook(g, X(h.x), Y(h.y), h.x >= h.ox ? 1 : -1, time); }
    /* HE HOOKS THE POINTS: a gold chain from his hook to the POINTS lever */
    if (e.mode === 'rehookTell' || e.mode === 'crownHookTell') { const l = G.levers[0], k = 1 - Math.max(0, e.modeT) / SK.points.tell; chainLine(g, X(e.x), Y(e.y - 20), X(e.x + (l.x - e.x) * Math.min(1, k * 1.6)), Y(e.y - 20 + (G.floorY - 30 - e.y + 20) * Math.min(1, k * 1.6)), time);
      g.globalAlpha = 0.8; g.strokeStyle = '#ffd36b'; g.setLineDash([2, 2]); g.beginPath(); g.moveTo(X(e.x), Y(e.y - 20)); g.lineTo(X(l.x), Y(G.floorY - 30)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
    /* HE CUTS THE LOW LINE: the red fray bar on the line, and the floor band the rope will whip */
    if (e.mode === 'frayTell') { const k = 1 - Math.max(0, e.modeT) / SK.fray.tell, x = X(e.x), y = Y(e.y - SK.hang - 8); rect(g, x - 16, y, 32, 3, '#1b1626'); rect(g, x - 16, y, 32 * k, 3, blink);
      g.globalAlpha = 0.25 + 0.35 * k; rect(g, X(G.ramp.W), Y(G.floorY - SK.fray.h), G.ramp.E - G.ramp.W, SK.fray.h, '#ff4a2a'); g.globalAlpha = 1; }
    /* A1: the told winch's red streak + its foot circle */
    if (S.cw && S.cw.st === 'tell') { const f = G.feet[S.cw.side], top = G.crown[S.cw.side]; g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 18); line(g, X(top.x), Y(top.y + 20), X(f.x), Y(f.y), '#ff4a2a', 2);
      g.strokeStyle = blink; g.lineWidth = 2; g.beginPath(); g.ellipse(X(f.x), Y(G.floorY) - 1, SK.cw.r, 5, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
    if (S.cw && S.cw.st === 'fall') { const f = G.feet[S.cw.side], top = G.crown[S.cw.side], k = 1 - Math.max(0, S.cw.t) / SK.cw.fall, wx = top.x + (f.x - top.x) * k, wy = top.y + 20 + (f.y - top.y - 20) * k; rect(g, X(wx - 8), Y(wy - 8), 16, 16, C.iron); }
    /* A2: the dots, then the hot rivets */
    for (const r of S.rivets) { if (r.st === 'tell') { g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 14); g.fillStyle = '#ff4a2a'; g.beginPath(); g.ellipse(X(r.x), Y(G.floorY) - 1, SK.rivet.r, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
      else if (r.st === 'fall') { const k = 1 - Math.max(0, r.t) / SK.rivet.fall; rect(g, X(r.x - 2), Y(G.skyY + (G.floorY - G.skyY) * k) - 4, 4, 6, '#ff9a3c'); } }
    /* THE LOW SWING's arc, the drop's ring, the sweep's reach, the cut's fray bar (as the live fight) */
    if (e.mode === 'swingTell') { g.globalAlpha = 0.35 + 0.3 * Math.sin(time * 16); g.strokeStyle = '#ff4a2a'; g.lineWidth = 2; g.setLineDash([5, 3]); g.beginPath();
      for (let k = 0; k <= 1.001; k += 0.05) { const p = SK2.swingAt2(S, S.side, k); const yy = Y(p.y - SK.h / 2); if (k === 0) g.moveTo(X(p.x), yy); else g.lineTo(X(p.x), yy); } g.stroke(); g.setLineDash([]); g.lineWidth = 1; g.globalAlpha = 1; }
    if (e.mode === 'dropTell') { const col = e.locked ? blink : '#ffb347'; g.globalAlpha = 0.85; g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.ellipse(X(e.lockX), Y(G.floorY) - 1, SK.drop.r, 4, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
    if (e.mode === 'sweepTell') { g.globalAlpha = 0.45 + 0.3 * Math.sin(time * 14); g.fillStyle = '#ff6b6b'; for (let q2 = e.x - SK.sweep.reach; q2 < e.x + SK.sweep.reach; q2 += 9) g.fillRect(X(q2), Y(G.floorY) - 2, 5, 2); g.globalAlpha = 1; }
    if (e.mode === 'cutTell') { const k = 1 - Math.max(0, e.modeT) / SK.cut.tell, f = G.feet[S.side], x = X(Ar.perchW && S.side === 'W' ? Ar.perchW.x + 30 : Ar.perchE ? Ar.perchE.x - 30 : f.x), y = Y((S.side === 'W' ? Ar.perchW : Ar.perchE).y - 20);
      rect(g, x - 14, y, 28, 3, '#1b1626'); rect(g, x - 14, y, 28 * k, 3, blink); }
    /* THE READ (B10): OPEN = gold ring + timer bar; OUT OF REACH = the chain-hatch ring; WARDED = a pale ring */
    const x = X(e.x), y = Y(e.y - 14);
    if (SK2.sky2Open(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1));
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = Y(e.y - 46); ctx.text && ctx.text(SK2.OPEN_NAME2[e.mode] || 'OPEN', x, by - 6, '#ffd36b', 'center', 6); rect(g, x - 18, by, 36, 3, '#1b1626'); rect(g, x - 18, by, 36 * kk, 3, '#ffd36b'); }
    else if (SK2.sky2Immune(e) && e.mode !== 'sleep') { g.globalAlpha = 0.55; g.strokeStyle = C.chain; g.beginPath(); g.arc(x, y, 24, 0, Math.PI * 2); g.stroke();
      for (let a = 0; a < 8; a++) { const t0 = a * Math.PI / 4 + time * 0.6; line(g, x + Math.cos(t0) * 20, y + Math.sin(t0) * 20, x + Math.cos(t0 + 0.5) * 28, y + Math.sin(t0 + 0.5) * 28, C.chain); } g.globalAlpha = 1; }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = C.pale; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
    if (e.mode === 'rise') { g.globalAlpha = 0.6; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(x, Y(G.floorY - 10), R(SK.rise.r * (1 - Math.max(0, e.modeT) / SK.rise.tell)), 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (S.enraged && ctx.text) ctx.text('ENRAGED', X(G.mid), Y(G.roof + 18), Math.floor(time * 4) % 2 ? '#ff6b6b' : '#ff9a5c', 'center', 6);
    if (e.guardFx > 0 && e.guardWord && ctx.text) ctx.text(e.guardWord, x, Y(e.y - 56) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
