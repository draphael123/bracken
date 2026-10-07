// src/great-drill.js - THE GREAT DRILL, THE DEEP RAILS' boss (claude/minecart, the OPUS GREYBOX). Pure: no DOM, no main.js. The world (the treadmill,
// the ore carts, the points mast) and the drawing are src/great-drill-hands.js; the bot that fights it is drillPlan below (src/lab.js drives the keys).
//
// A CONSTRUCT (design standard B14), THE RULE PERSONIFIED: a goblin boring machine that chases you down its own three-line tunnel. You never leave
// the cart. THE ARENA is a TREADMILL: the bore's walls and sleepers run past at the cart's cruise, so the arena stands still while you ride - BOOST
// pulls you ahead of it, BRAKE lets it come at you, the lines are three (LOW, MID, HIGH, three rows apart, one-way rail: jump up, down + jump to drop).
// ALWAYS HITTABLE (B13): its CAB - the goblin driver's box on its front, over the MID and HIGH lines - takes a hero's blow whole, any time it is not
// WARDED, from a cart alongside it (brake back to it, face it, strike). No chip waiting room.
// ITS KEY (B14: 'throw it' - you send it, you never ride it): THE LOADED ORE CART. A TIPPLER CHUTE over the far end drops one on the MID or HIGH line;
// it rolls back down the bore. THE POINTS MAST in the middle of the arena (a blow or E) SETS THE POINTS: an ore cart that rolls over set points drops
// to the LOW line, where the drill's GEARS turn bare under its bit (three red cogs, drawn, and 'GEARS' under them). Into the gears: JAMMED - the bit
// stops, the gears smoke, the cab's hatch blows (gold ring + timer, x2 on the cab, capped). An ore cart that reaches it on the MID or HIGH line is
// eaten by the bit; one that rolls into YOUR cart is a crash. (THE WINCHMASTER's drum is a load you RIDE in; this is points you THROW.)
// THE SHARED READ (B10): OPEN = gold ring + timer bar on the cab; WARDED = pale plates over it and the word; a blow that does nothing CLANKS and says
// WARDED. B3: after every jam a TOLD 3 s ward ('IT CLEARS ITS GEARS'), then it KNOCKS THE POINTS BACK (each opening wants a fresh throw). B4: jammed,
// it stands still (no creep, no bore).
// THE PHASES (one new move each - B5):
//   P1 (100-60%): THE BORE (!!: the bit swings to a line - the line flashes 'BORE' - and lunges down it: change line), THE GRIND (!!: it surges
//      after you - 'GRIND' and the glow: boost away).
//   P2 (60-30%): NEW: THE ROOF - it bores the roof: rock shadows on two lines (! ~1.0 s), the third is clear (or brake / boost off the shadow).
//   P3 (30-0%): NEW: FULL BORE - '!! FULL BORE' (1.2 s), then a long charge: hold BOOST, or it runs you down. Its bores come quicker.
export const DRILL_STAGE = { W: 22, lanes: [0, 3, 6], ceil: 10, points: 12, chute: 19 };
export const DRILL = {
  hp: 600, w: 28, h: 52, cruise: 150,
  creep: 9, frontMin: 34, frontMax: 150, push: 46,
  contactDmg: 28, contactCd: 1.1,
  boreTell: 1.0, boreTell3: 0.8, boreOut: 0.22, boreHold: 0.3, boreBack: 0.4, boreLen: 132, bitIdle: 18, boreDmg: 24,
  grindTell: 0.8, grindT: 0.7, grindDist: 78,
  roofTell: 1.0, roofDmg: 18, roofW: 30,
  fullTell: 1.2, fullT: 1.4, fullDist: 150,
  oreFirst: 3.0, oreEvery: [8.5, 8.0, 7.5], oreV: 64, oreDmg: 16, chuteTell: 1.0,
  jamT: 4.6, jamMul: 2.0, jamCap: 0.11, wardT: 3.0, lockT: 1.2,
  phase2: 0.6, phase3: 0.3, phaseT: 2.0,
  gap: [1.15, 1.0, 0.85],
  chain: { 1: ['bore', 'bore', 'grind', 'bore'], 2: ['bore', 'roof', 'bore', 'grind', 'roof'], 3: ['bore', 'full', 'roof', 'bore', 'grind', 'roof'] },
};
export const LANE_NAME = ['LOW', 'MID', 'HIGH'];
/* THE STAGE: carve the arena into the level; returns { arena, carve } */
export function stageDrill(Wr, T, TS, sx, F) {
  const S = DRILL_STAGE;
  const carve = () => {
    Wr.block(sx, sx + S.W - 1, F, F + 21);
    Wr.block(sx - 1, sx + S.W + 5, 0, F - S.ceil - 1);
    Wr.air(sx, sx + S.W - 1, F - S.ceil, F - 1);
    for (const ln of S.lanes) if (ln) for (let x = sx; x < sx + S.W; x++) Wr.set(x, F - ln, T.RAIL);
    Wr.ent('greatdrill', sx + 3, F - 1, { face: 1 });
    Wr.ent('drillpoints', sx + S.points, F - 1, {});
    Wr.ent('oretip', sx + S.chute, F - 8, {});
  };
  const arena = { x0: sx * TS, x1: (sx + S.W) * TS, floor: F * TS, trigger: (sx + 9) * TS, wallL: sx - 1, wallR: sx + S.W, boss: 'greatdrill', music: 'greatdrill',
    tint: '#d89a5a', tintA: 0.05, start: [sx + 12, F - 1], drill: { sx, F } };
  return { arena, carve };
}
/* the arena in world px */
export function geom(A, TS = 16) {
  const q = A.drill, S = DRILL_STAGE, sx = q.sx, F = q.F;
  return { x0: sx * TS, x1: (sx + S.W) * TS, F, TS, floor: F * TS, laneY: S.lanes.map(l => (F - l) * TS), pointsX: (sx + S.points) * TS + 8, chuteX: (sx + S.chute) * TS + 8, ceilY: (F - S.ceil) * TS };
}
/* which line a foot is on (0 LOW, 1 MID, 2 HIGH), or -1 in the air between */
export function laneOf(G, y, tol = 6) { for (let i = 0; i < 3; i++) if (Math.abs(y - G.laneY[i]) <= tol) return i; return -1; }
/* the nearest line at or under a foot (for a hero in the air: where he will land) */
export function laneUnder(G, y) { for (let i = 2; i >= 0; i--) if (y <= G.laneY[i] + 4) return i; return 0; }
export const drillOpen = e => !!e && (e.open || 0) > 0 && e.mode === 'jammed';
/* the CAB, world px: { l, r, t, b } - over the MID and HIGH lines on its front */
export const cabBox = (G, S) => ({ l: S.D - DRILL.w - 2, r: S.D - 2, t: G.laneY[2] - 34, b: G.laneY[1] });
/* the BIT on its line: { l, r, t, b } */
export const bitBox = (G, S) => ({ l: S.D - 4, r: S.D + S.bitLen, t: G.laneY[S.bitLane] - 15, b: G.laneY[S.bitLane] });

export function newFight(G) {
  return { G, ph: 1, i: 0, cd: 1.6, t: 0, ward: 0, lock: 0, D: G.x0 + DRILL.frontMin, bitLane: 1, bitLen: DRILL.bitIdle, boreLane: -1, surge: 0, surgeV: 0,
    points: false, ores: [], oreT: DRILL.oreFirst, oreN: 0, chute: null, roof: [], openTaken: 0, contactCd: 0,
    n: { bore: 0, grind: 0, roof: 0, full: 0, ores: 0, jams: 0, eaten: 0, crashed: 0, warded: 0, cab: 0, contact: 0, knocked: 0 }, told: {} };
}
const beginJam = (e, S, c) => { e.mode = 'jammed'; e.open = DRILL.jamT; e.openT0 = DRILL.jamT; S.openTaken = 0; S.n.jams++; S.bitLen = DRILL.bitIdle; S.surge = 0; S.D = Math.max(S.G.x0 + DRILL.frontMin, S.D - 24);
  c.sound && c.sound('jam'); c.shake && c.shake(6); c.number(S.D, S.G.laneY[0] - 50, 'THE ORE CART JAMS ITS GEARS: STRIKE THE CAB', '#ffd36b'); };

/* ---------- ONE FRAME ---------- heroes: [{ x, y, ground, alive, pp, lane }]; c: { hit(box, dmg, name, o) -> bool, number(x, y, t, col), sound(k), shake(n),
   music(ph), crash(h) (an ore cart into a hero's cart) } */
export function stepDrill(e, S, dt, heroes, c) {
  const G = S.G; S.t += dt;
  e.x = (cabBox(G, S).l + cabBox(G, S).r) / 2; e.y = G.laneY[1];   /* (its body for the game's blows: the cab) */
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { e.modeT = (e.modeT ?? 1.6) - dt; S.D = Math.min(G.x0 + DRILL.frontMin, S.D + 60 * dt); if (e.modeT <= 0) { e.mode = 'idle'; S.cd = 1.2; } return; }
  const live = heroes.filter(h => h.alive);
  S.contactCd = Math.max(0, S.contactCd - dt); S.lock = Math.max(0, S.lock - dt);
  /* THE ORE CARTS: the chute's tell, then the cart rolls back down its line; set points drop it to the LOW line; the gears, the bit, a hero */
  if (!drillOpen(e) && e.mode !== 'phase') S.oreT -= dt;
  if (S.oreT <= 0 && !S.chute && S.ores.length === 0) { S.chute = { lane: S.oreN % 2 ? 2 : 1, t: DRILL.chuteTell }; S.oreN++; c.sound && c.sound('chute');
    if (!S.told.ore) { S.told.ore = 1; c.number(G.chuteX, G.laneY[2] - 40, 'A LOADED ORE CART: SET THE POINTS AND IT DROPS TO ITS GEARS', '#ffd36b'); } }
  if (S.chute) { S.chute.t -= dt; if (S.chute.t <= 0) { S.ores.push({ x: G.chuteX, lane: S.chute.lane, id: S.oreN, vy: 0, y: G.laneY[S.chute.lane], drop: false }); S.chute = null; S.n.ores++; S.oreT = DRILL.oreEvery[S.ph - 1]; c.sound && c.sound('oreLand'); } }
  for (const o of S.ores) {
    if (o.drop) { o.vy = (o.vy || 0) + 900 * dt; o.y += o.vy * dt; if (o.y >= G.laneY[0]) { o.y = G.laneY[0]; o.lane = 0; o.drop = false; o.vy = 0; } }
    else o.x -= DRILL.oreV * dt;
    if (!o.drop && o.lane > 0 && S.points && Math.abs(o.x - G.pointsX) < 6 && !o.passed) { o.passed = true; o.drop = true; c.sound && c.sound('points'); }
    if (!o.drop && Math.abs(o.x - G.pointsX) < 6) o.passed = true;
    /* into a hero's cart on its line: a crash (and the load is spilt) */
    for (const h of live) if (h.lane === o.lane && !o.drop && Math.abs(h.x - o.x) < 14 && !o.dead) { o.dead = true; S.n.crashed++; c.crash && c.crash(h, o); }
    if (o.dead) continue;
    if (o.x <= S.D + 4) { o.dead = true;
      if (o.lane === 0 && !drillOpen(e) && S.ward <= 0) beginJam(e, S, c);
      else { S.n.eaten++; c.sound && c.sound('eat'); c.number(S.D + 10, G.laneY[o.lane] - 24, o.lane === 0 ? 'IT SHRUGS THE CART OFF' : 'THE BIT EATS IT: THE GEARS ARE ON THE LOW LINE', '#9aa39a'); } }
  }
  S.ores = S.ores.filter(o => !o.dead);
  /* THE ROOF's rocks */
  for (const r of S.roof) { r.t -= dt; if (r.t <= 0 && !r.hit) { r.hit = true; c.hit([r.x - DRILL.roofW / 2, r.x + DRILL.roofW / 2, G.laneY[r.lane] - 30, G.laneY[r.lane]], DRILL.roofDmg, 'THE ROOF', { key: 'roof' + r.id }); c.sound && c.sound('rock'); } }
  S.roof = S.roof.filter(r => r.t > -0.4);
  /* THE FRONT: contact hurts and throws it back (no teleport: IT gives ground, not you - B7) */
  for (const h of live) if (h.x - 5 < S.D && S.contactCd <= 0) { S.contactCd = DRILL.contactCd; S.n.contact++; if (c.hit([S.D - 40, S.D + 2, G.ceilY, G.floor], DRILL.contactDmg, 'THE GREAT DRILL', { key: 'front' + S.n.contact })) S.D = Math.max(G.x0 + DRILL.frontMin, S.D - DRILL.push); }
  /* THE BIT on its line */
  if (S.bitLen > DRILL.bitIdle + 4) for (const h of live) { const b = bitBox(G, S); if (h.lane === S.bitLane && h.x > b.l && h.x - 5 < b.r) c.hit([b.l, b.r, b.t, b.b], DRILL.boreDmg, 'THE BORE', { key: 'bore' + S.n.bore }); }
  /* THE WARD after a jam (B3), then the points knocked back */
  if (S.ward > 0) { S.ward -= dt; if (S.ward <= 0) { S.ward = 0; S.lock = DRILL.lockT; if (S.points) { S.points = false; c.number(G.pointsX, G.laneY[2] - 34, 'IT KNOCKS THE POINTS BACK', '#9aa39a'); c.sound && c.sound('points'); } } }
  /* JAMMED: it stands still (B4) */
  if (drillOpen(e)) { e.open -= dt; if (e.open <= 0) { e.open = 0; e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1] + 0.4; S.ward = DRILL.wardT; S.n.warded++; c.sound && c.sound('ward');
      if (!S.told.ward) { S.told.ward = 1; c.number(S.D - 10, G.laneY[2] - 44, 'IT CLEARS ITS GEARS: ITS PLATES ARE UP', '#c8d8e8'); } } return; }
  /* THE PHASES */
  const k = e.hp / e.maxHp;
  if (e.mode !== 'phase' && ((S.ph === 1 && k <= DRILL.phase2) || (S.ph === 2 && k <= DRILL.phase3))) {
    S.ph++; e.phase = S.ph; e.mode = 'phase'; e.modeT = DRILL.phaseT; S.i = 0; S.bitLen = DRILL.bitIdle; S.surge = 0; c.music && c.music(S.ph); c.shake && c.shake(5); c.sound && c.sound('phase');
    c.number(S.D, G.laneY[2] - 40, S.ph === 2 ? 'IT BORES THE ROOF: WATCH FOR THE SHADOWS' : 'FULL BORE: IT WILL RUN YOU DOWN - BOOST', S.ph === 2 ? '#ffb070' : '#ff6b6b'); return; }
  if (e.mode === 'phase') { e.modeT -= dt; if (e.modeT <= 0) { e.mode = 'idle'; S.cd = 0.8; } return; }
  /* THE CREEP: it is always coming (and a surge moves it more) */
  const near = live.slice().sort((a, b) => a.x - b.x)[0];
  if (S.surge > 0) { S.surge -= dt; S.D += S.surgeV * dt; } else if (e.mode === 'idle' || e.mode === 'boreTell') S.D += DRILL.creep * dt;
  S.D = Math.max(G.x0 + DRILL.frontMin, Math.min(G.x0 + DRILL.frontMax + (e.mode === 'full' ? 120 : 0), S.D));
  e.modeT = (e.modeT || 0) - dt;
  switch (e.mode) {
    case 'idle': { S.cd -= dt; if (S.cd > 0) break;
      const ch = DRILL.chain[S.ph]; let name = ch[S.i % ch.length]; S.i++;
      if (name === 'bore' || !near) { const lane = near ? (near.lane >= 0 ? near.lane : laneUnder(G, near.y)) : 1; S.boreLane = lane; S.bitLane = lane; e.mode = 'boreTell'; e.modeT = S.ph === 3 ? DRILL.boreTell3 : DRILL.boreTell; S.n.bore++; c.sound && c.sound('tellHard'); }
      else if (name === 'grind') { e.mode = 'grindTell'; e.modeT = DRILL.grindTell; c.sound && c.sound('tellHard'); c.number(S.D, G.laneY[2] - 30, 'GRIND', '#ff6b6b'); }
      else if (name === 'roof') { const hl = near ? (near.lane >= 0 ? near.lane : laneUnder(G, near.y)) : 1; const clear = [0, 1, 2].filter(l => l !== hl)[S.n.roof % 2]; S.n.roof++;
        const x = near ? near.x + (near.vx || 0) * 0.3 : G.pointsX; S.roof = [0, 1, 2].filter(l => l !== clear).map((lane, j) => ({ lane, x: Math.max(S.D + 40, Math.min(G.x1 - 20, x)), t: DRILL.roofTell, id: S.n.roof * 3 + j }));
        e.mode = 'roofTell'; e.modeT = DRILL.roofTell; c.sound && c.sound('tell'); }
      else if (name === 'full') { e.mode = 'fullTell'; e.modeT = DRILL.fullTell; S.n.full++; c.sound && c.sound('tellHard'); c.number(S.D, G.laneY[2] - 30, '!! FULL BORE', '#ff6b6b'); }
      break; }
    case 'boreTell': if (e.modeT <= 0) { e.mode = 'boreOut'; e.modeT = DRILL.boreOut; c.sound && c.sound('bore'); } break;
    case 'boreOut': S.bitLen = DRILL.bitIdle + (DRILL.boreLen - DRILL.bitIdle) * Math.min(1, 1 - e.modeT / DRILL.boreOut); if (e.modeT <= 0) { e.mode = 'boreHold'; e.modeT = DRILL.boreHold; S.bitLen = DRILL.boreLen; c.shake && c.shake(2); } break;
    case 'boreHold': if (e.modeT <= 0) { e.mode = 'boreBack'; e.modeT = DRILL.boreBack; } break;
    case 'boreBack': S.bitLen = DRILL.bitIdle + (DRILL.boreLen - DRILL.bitIdle) * Math.max(0, e.modeT / DRILL.boreBack); if (e.modeT <= 0) { S.bitLen = DRILL.bitIdle; e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; S.boreLane = -1; } break;
    case 'grindTell': if (e.modeT <= 0) { e.mode = 'grind'; e.modeT = DRILL.grindT; S.surge = DRILL.grindT; S.surgeV = DRILL.grindDist / DRILL.grindT; S.n.grind++; c.sound && c.sound('grind'); c.shake && c.shake(3); } break;
    case 'grind': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; } break;
    case 'roofTell': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1] + 0.2; } break;
    case 'fullTell': if (e.modeT <= 0) { e.mode = 'full'; e.modeT = DRILL.fullT; S.surge = DRILL.fullT; S.surgeV = DRILL.fullDist / DRILL.fullT; c.sound && c.sound('grind'); c.shake && c.shake(5); } break;
    case 'full': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1] + 0.5; S.D = Math.min(S.D, G.x0 + DRILL.frontMax); } break;
    default: e.mode = 'idle';
  }
}
/* A HERO'S BLOW ON IT (the cab): what comes off the bar (0 = turned, with the word in out.word) */
export function takeBlow(e, S, dmg, out = {}) {
  if (e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'phase') { out.word = 'WARDED'; return 0; }
  if (S.ward > 0) { S.n.warded++; out.word = 'WARDED'; return 0; }
  S.n.cab++;
  if (drillOpen(e)) { const cap = Math.max(0, e.maxHp * DRILL.jamCap - S.openTaken), d = Math.min(dmg * DRILL.jamMul, cap); S.openTaken += d;
    if (cap - d <= 0.01 && e.open > 0.3) { e.open = 0.3; out.word = 'IT FREES ITS GEARS'; } return d; }
  return dmg;
}
/* THE POINTS MAST: a throw sets / clears the points */
export function throwPoints(S) { S.points = !S.points; return S.points; }

/* ---------- THE BOT (src/lab.js): what a player sees, read a quarter-second late (react 0.25 s, a tell misread one time in eight) ----------
   P: { x, y, ground, face, atk, vy, lane }; returns { gx (where to hold, arena px), jump, drop (down + jump), duck, atk, talk (E), face, why } */
export const DRILL_PLAN = { react: 0.25, miss: 0.13, missPoints: 0.2 };
export function drillPlan({ P, e, S, reach, rng = Math.random, mem = {}, t, tip = 0 }) {
  const G = S.G, out = { gx: null, face: P.face, why: '' }, lane = P.lane >= 0 ? P.lane : laneUnder(G, P.y);
  const late = k => { if (!(k in mem)) { mem[k] = t + DRILL_PLAN.react - 0.04 + rng() * 0.1; mem['m' + k] = rng() < DRILL_PLAN.miss; } return t >= mem[k] && !mem['m' + k]; };
  const cab = cabBox(G, S), standX = cab.r + Math.max(8, Math.min(reach, 22) - 4) + tip;
  const go = l => { if (l > lane && P.ground) out.jump = true; else if (l < lane && P.ground) out.drop = true; };
  const danger = new Set();   /* lines not to be on */
  if ((e.mode === 'boreTell' || e.mode === 'boreOut' || e.mode === 'boreHold') && late('bore' + S.n.bore)) danger.add(S.bitLane);
  for (const r of S.roof) if (r.t > 0 && Math.abs(r.x - P.x) < DRILL.roofW && late('roof' + r.id)) danger.add(r.lane);
  for (const o of S.ores) if (!o.drop && o.x > P.x - 4 && o.x - P.x < 90) danger.add(o.lane); else if (o.drop) danger.add(0);
  const safe = [lane, 1, 2, 0].find(l => !danger.has(l));
  /* 1. THE SURGES: get ahead of it */
  if ((e.mode === 'grindTell' || e.mode === 'grind' || e.mode === 'fullTell' || e.mode === 'full') && late('surge' + S.n.grind + ':' + S.n.full)) { out.gx = Math.min(G.x1 - 24, S.D + (e.mode.startsWith('full') ? 230 : 150)); out.why = 'outrun'; }
  /* 2. THE OPENING: to the cab, off the bit's line (there is no bit out when jammed), and strike */
  else if (drillOpen(e)) { const want = lane === 0 ? 1 : lane; if (lane !== want) go(want); out.gx = standX; out.face = -1; if (Math.abs(P.x - standX) < 10 && lane >= 1 && P.atk < 0) out.atk = true; out.why = 'jammed: cab'; }
  /* 3. AN ORE CART COMING: set the points, keep off its line */
  else if ((S.chute || S.ores.some(o => !o.drop && o.lane > 0 && o.x > G.pointsX)) && !S.points && late('pts' + S.oreN)) {
    out.gx = G.pointsX + 6; if (Math.abs(P.x - G.pointsX) < 24) { if (!(mem['mp' + S.oreN] ??= rng() < DRILL_PLAN.missPoints) || (mem['pt' + S.oreN] || 0) > 1.2) { out.talk = true; } else mem['pt' + S.oreN] = (mem['pt' + S.oreN] || 0) + 1 / 60; } out.why = 'points'; }
  /* 4. OTHERWISE: work the cab from a line the bit is not on, between its blows */
  else { const boring = e.mode === 'boreTell' || e.mode === 'boreOut' || e.mode === 'boreHold' || e.mode === 'boreBack';
    if (S.ward > 0) { out.gx = Math.min(G.x1 - 30, S.D + 90); out.why = 'wait'; }
    else { out.gx = standX; out.face = -1; if (Math.abs(P.x - standX) < 10 && lane >= 1 && !(boring && lane === S.bitLane) && P.atk < 0 && (mem.atkT ?? -9) < t - 0.35) { mem.atkT = t; out.atk = true; } out.why = 'cab'; if (boring && lane === S.bitLane && !danger.has(lane)) danger.add(lane); }
    if (lane === S.bitLane || lane === 0) { const l2 = [1, 2].find(l => l !== S.bitLane && !danger.has(l)); if (l2 !== undefined && !out.jump && !out.drop) go(l2); } }
  if (danger.has(lane) && safe !== undefined && safe !== lane) { out.jump = false; out.drop = false; go(safe); out.why += ' +dodge'; }
  /* never sit in its front */
  if (out.gx !== null) out.gx = Math.max(S.D + 12, out.gx);
  return out;
}
