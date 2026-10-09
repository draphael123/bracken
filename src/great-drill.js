// src/great-drill.js - THE GREAT DRILL, THE DEEP RAILS' boss (claude/minecart, the OPUS GREYBOX; GREAT DRILL 2, claude/deeprails2 - Daniel's live playtest 10-09).
// Pure: no DOM, no main.js. The world (the endless tunnel, the ore carts, the chute) and the drawing are src/great-drill-hands.js; the bot that fights it is drillPlan
// below (src/lab.js drives the keys).
//
// A GOBLIN DRIVING A DRILL RIG (Daniel 10-09: "a conventional drill rig, a goblin driver in the cab"): a big conical bit, an engine block and its smokestack, tracks
// and rail wheels, and a goblin in the cab looking back over his shoulder at you. A CONSTRUCT (design standard B14), THE RULE PERSONIFIED: it never stops - it bores
// on AHEAD of you down an ENDLESS TUNNEL (the hands loop the tunnel seamlessly: everything in it runs past at cruise, nothing half-moves) and you chase it in your cart.
// THE ARENA: three lines (LOW, MID, HIGH: three rows apart, one-way rail - jump up, down + jump to drop). Its REAR faces you: low on the LOW line its GEAR HOUSING (the
// bare red GEARS and a ram plate), on the housing a deck at the MID line, and on the deck its CAB (over the MID and HIGH lines) - the goblin's box.
// THE READ (B10, B15): outside its opening the cab is ARMOURED - a blow takes x0.4 (it CLANKS and says ARMOURED: JAM ITS GEARS); never totally invulnerable.
// ITS KEY (B14 - the level's verb: PUMP AND RAM): a LOADED ORE CART drops from a roof chute onto the LOW line ahead of you ('ORE!' and its shadow); it is still in the
// world, so it comes at you down the tunnel. RAM IT AT FULL PUMP (MC.ramV) and it flies up the line into the drill's GEARS: JAMMED - the bit stops, the gears smoke,
// the rig drifts back to you; a gold outline on the cab and the gears and a timer bar (B10); the cab takes x2 (capped a share a jam). Met slower, the ore cart is a
// crash (it spills). B3: after every jam a TOLD 3 s WARD ('IT CLEARS ITS GEARS': its plates up - x0.4 still, B15, but an ore cart rammed now is shrugged off).
// B4: jammed, it stands its ground (no move, no ram).
// THE MOVES (every one told, one at a time - B5; one new a phase):
//   P1 (100-60%): BOULDER DROP - its bit cracks the roof: two shadows slide at you down two lines (!, ~1.1 s), rock falls on them - the third line is clear, or
//                 change your pace off them.  REVERSE RAM - !! its reverse lamps and a klaxon (1.0 s), then it backs at you down the tunnel: brake back out of its
//                 sweep, or (close behind on the LOW line) jump up - the cab sits back on its deck, so on the MID line its sweep is shorter.
//   P2 (60-30%): NEW: SPARK SPRAY - its exhaust grinds: a told amber cone down YOUR line (0.9 s), then a jet of sparks along it - change line or brake out of reach.
//   P3 (30-0%):  THE ARENA CHANGES (B5): the bit brings the roof down on the HIGH line - its rail is gone, TWO LINES LEFT (LOW and MID: the boulders, the sparks and the
//                ram all come at the two); everything comes quicker.
export const DRILL_STAGE = { W: 30, lanes: [0, 3, 6], ceil: 10, chute: 12 };
export const DRILL = {
  /* GREAT DRILL 2 NUMBERS (claude/deeprails2; measured tools/boss-rates.mjs --profile=human WITH flasks, campaign level - the lane report holds the table) */
  hp: 2600, cruise: 150,
  homeR: 290, minR: 150, maxR: 320,     /* the rig's rear face, px from the arena's left edge: at home, and the nearest a reverse brings it */
  plateW: 62, cabIn: 30, cabW: 30, plateH: 40,
  contactDmg: 30, contactCd: 1.0, shove: 60,
  armour: 0.4,                          /* B15: outside the jam a blow on the cab takes this */
  rockTell: 1.1, rockDmg: 30, rockW: 26,
  revTell: 1.0, revV: 260, revT: 0.45, revHold: 0.4, revBack: 120, revDmg: 34,
  sparkTell: 0.9, sparkT: 1.0, sparkLen: 150, sparkDmg: 9, sparkTick: 0.25,
  oreFirst: 3.5, oreEvery: [8.0, 7.5, 7.0], chuteTell: 1.1, oreDmg: 18, oreFly: 300, oreAhead: 110,
  jamT: 4.6, jamMul: 2.0, jamCap: 0.2, wardT: 3.0, drift: 45,
  phase2: 0.6, phase3: 0.3, phaseT: 2.0,
  gap: [0.9, 0.75, 0.6],
  chain: { 1: ['rocks', 'reverse', 'rocks', 'reverse'], 2: ['sparks', 'rocks', 'reverse', 'sparks', 'rocks'], 3: ['reverse', 'sparks', 'rocks', 'reverse', 'sparks', 'rocks'] },
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
    Wr.ent('greatdrill', sx + 20, F - 1, { face: -1 });
    Wr.ent('oretip', sx + S.chute, F - 8, {});
  };
  const arena = { x0: sx * TS, x1: (sx + S.W) * TS, floor: F * TS, trigger: (sx + 4) * TS, wallL: sx - 1, wallR: sx + S.W, boss: 'greatdrill', music: 'greatdrill',
    tint: '#d89a5a', tintA: 0.05, start: [sx + 6, F - 1], drill: { sx, F } };
  return { arena, carve };
}
/* the arena in world px */
export function geom(A, TS = 16) {
  const q = A.drill, S = DRILL_STAGE, sx = q.sx, F = q.F;
  return { x0: sx * TS, x1: (sx + S.W) * TS, F, TS, floor: F * TS, laneY: S.lanes.map(l => (F - l) * TS), chuteX: (sx + S.chute) * TS + 8, ceilY: (F - S.ceil) * TS };
}
/* the lines there are: three, or two once P3 has brought the roof down on the HIGH line */
export const lanesOf = S => (S && S.highDown ? [0, 1] : [0, 1, 2]);
/* which line a foot is on (0 LOW, 1 MID, 2 HIGH), or -1 in the air between */
export function laneOf(G, y, tol = 6) { for (let i = 0; i < 3; i++) if (Math.abs(y - G.laneY[i]) <= tol) return i; return -1; }
/* the nearest line at or under a foot (for a hero in the air: where he will land) */
export function laneUnder(G, y) { for (let i = 2; i >= 0; i--) if (y <= G.laneY[i] + 4) return i; return 0; }
export const drillOpen = e => !!e && (e.open || 0) > 0 && e.mode === 'jammed';
/* ITS CAB CAN BE STRUCK whenever it is up (B13/B15: armoured x0.4, jammed x2) - what src/boss-greed.js reads as its opening: only the jam is the opening */
export const drillHittable = e => !!e && drillOpen(e);
/* the rig's rear (world px) and its parts: the gear housing on the LOW line, the cab on its deck over the MID and HIGH lines */
export const rearX = S => S.G.x0 + S.R;
export const plateBox = (G, S) => ({ l: rearX(S), r: rearX(S) + DRILL.plateW, t: G.laneY[0] - DRILL.plateH, b: G.laneY[0] });
export const gearBox = (G, S) => ({ l: rearX(S), r: rearX(S) + 16, t: G.laneY[0] - 34, b: G.laneY[0] - 4 });
export const cabBox = (G, S) => ({ l: rearX(S) + DRILL.cabIn, r: rearX(S) + DRILL.cabIn + DRILL.cabW, t: G.laneY[2] - 22, b: G.laneY[1] });
/* where a hero on line `lane` meets the rig: its plate on the LOW line, its cab above */
export const frontFor = (G, S, lane) => (lane <= 0 ? rearX(S) : cabBox(G, S).l);

export function newFight(G) {
  return { G, ph: 1, i: 0, cd: 1.8, t: 0, ward: 0, R: DRILL.homeR, rocks: [], spray: null, ores: [], oreT: DRILL.oreFirst, oreN: 0, chute: null, openTaken: 0, contactCd: 0, revV: 0,
    n: { rocks: 0, reverse: 0, sparks: 0, ores: 0, jams: 0, rammed: 0, crashed: 0, shrugged: 0, warded: 0, cab: 0, armoured: 0, contact: 0, revHits: 0, sparkHits: 0, rockHits: 0 }, told: {} };
}
const beginJam = (e, S, c) => { e.mode = 'jammed'; e.open = DRILL.jamT; e.openT0 = DRILL.jamT; S.openTaken = 0; S.n.jams++; S.spray = null; S.revV = 0;
  c.sound && c.sound('jam'); c.shake && c.shake(6); c.number(rearX(S), S.G.laneY[1] - 40, 'THE ORE JAMS ITS GEARS: STRIKE THE CAB', '#ffd36b'); };

/* ---------- ONE FRAME ---------- heroes: [{ x, y, ground, alive, pp, lane, v (the cart's world pace) }]; c: { hit(box, dmg, name, o) -> bool, number(x, y, t, col),
   sound(k), shake(n), music(ph), crash(h, o) (an ore cart into a hero's cart), shove(h, px) (the rig throws a cart back), arena(k) } */
export function stepDrill(e, S, dt, heroes, c) {
  const G = S.G; S.t += dt;
  { const cb = cabBox(G, S); e.x = (cb.l + cb.r) / 2; e.y = cb.b; e.gdWard = S.ward; }   /* (its body for the game's blows: the cab; its ward, for the read) */
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { e.modeT = (e.modeT ?? 1.6) - dt; if (e.modeT <= 0) { e.mode = 'idle'; S.cd = 1.4; } return; }
  const live = heroes.filter(h => h.alive);
  S.contactCd = Math.max(0, S.contactCd - dt);
  /* THE ORE CARTS: the chute's tell, then a loaded cart on the LOW line ahead of you - still in the world, so it comes at you at the tunnel's pace. RAMMED at full pump
     it flies up the line into the gears; met slower it is a crash */
  if (!drillOpen(e) && e.mode !== 'phase') S.oreT -= dt;
  if (S.oreT <= 0 && !S.chute && S.ores.length === 0) { const lead = live.slice().sort((a, b) => b.x - a.x)[0];
    const x = Math.max(G.x0 + 120, Math.min(rearX(S) - 70, (lead ? lead.x : G.x0 + 120) + DRILL.oreAhead + DRILL.cruise * DRILL.chuteTell));
    S.chute = { x, t: DRILL.chuteTell }; S.oreN++; c.sound && c.sound('chute');
    if (!S.told.ore) { S.told.ore = 1; c.number(x, G.laneY[2] - 30, 'A LOADED ORE CART: PUMP AND RAM IT INTO ITS GEARS', '#ffd36b'); } }
  if (S.chute) { S.chute.t -= dt; S.chute.x -= DRILL.cruise * dt; if (S.chute.t <= 0) { S.ores.push({ x: S.chute.x, lane: 0, id: S.oreN, y: G.laneY[0], fly: false, vy: 0, dy: -40 }); S.chute = null; S.n.ores++; S.oreT = DRILL.oreEvery[S.ph - 1]; c.sound && c.sound('oreLand'); } }
  for (const o of S.ores) {
    if (o.dy < 0) { o.vy += 900 * dt; o.dy = Math.min(0, o.dy + o.vy * dt); }
    if (o.fly) { o.x += DRILL.oreFly * dt; if (o.x >= rearX(S) - 4) { o.dead = true;
        if (!drillOpen(e) && S.ward <= 0 && e.mode !== 'phase') beginJam(e, S, c); else { S.n.shrugged++; c.sound && c.sound('eat'); c.number(rearX(S), G.laneY[0] - 50, S.ward > 0 ? 'ITS PLATES ARE UP: IT SHRUGS IT OFF' : 'IT SHRUGS IT OFF', '#9aa39a'); } }
      continue; }
    o.x -= DRILL.cruise * dt;
    if (o.x < G.x0 - 20) { o.dead = true; continue; }
    if (o.dy < -2) continue;
    for (const h of live) if ((h.lane === 0 || (h.lane < 0 && Math.abs(h.y - G.laneY[0]) < 20)) && Math.abs(h.x - o.x) < 16 && !o.dead) {
      if (h.v >= c.ramV) { o.fly = true; S.n.rammed++; c.sound && c.sound('ram'); c.shake && c.shake(4); c.number(o.x, G.laneY[0] - 34, 'RAMMED: INTO ITS GEARS!', '#ffd36b'); c.rammed && c.rammed(h, o); }
      else { o.dead = true; S.n.crashed++; c.crash && c.crash(h, o); }
      break; }
  }
  S.ores = S.ores.filter(o => !o.dead);
  /* THE BOULDERS: their shadows slide at you down the tunnel; the rock falls on them */
  for (const r of S.rocks) { r.x -= DRILL.cruise * dt; r.t -= dt; if (r.t <= 0 && !r.hit) { r.hit = true; S.n.rockHits += c.hit([r.x - DRILL.rockW / 2, r.x + DRILL.rockW / 2, G.laneY[r.lane] - 30, G.laneY[r.lane]], DRILL.rockDmg, 'A BOULDER', { key: 'rock' + r.id }) ? 1 : 0; c.sound && c.sound('rock'); } }
  S.rocks = S.rocks.filter(r => r.t > -0.5);
  /* THE SPARKS on their line */
  if (S.spray) { const sp = S.spray; sp.t -= dt;
    if (sp.on) { sp.tick -= dt; if (sp.tick <= 0) { sp.tick = DRILL.sparkTick; const x1 = rearX(S); S.n.sparkHits += c.hit([x1 - DRILL.sparkLen, x1, G.laneY[sp.lane] - 34, G.laneY[sp.lane]], DRILL.sparkDmg, 'THE SPARKS', { key: 'spark' + S.n.sparks + ':' + Math.round(sp.t * 4), blockable: false }) ? 1 : 0; } }
    if (sp.t <= 0) { if (!sp.on) { sp.on = true; sp.t = DRILL.sparkT; sp.tick = 0; c.sound && c.sound('sparks'); c.shake && c.shake(2); } else { S.spray = null; e.mode = e.mode === 'spray' ? 'idle' : e.mode; S.cd = DRILL.gap[S.ph - 1]; } } }
  /* THE REAR: a hero who rolls into it is struck and thrown back (IT gives no ground; the cart is shoved, never teleported - B7) */
  for (const h of live) { const lane = h.lane >= 0 ? h.lane : laneUnder(G, h.y), fx = frontFor(G, S, lane);
    if (h.x + 6 > fx && S.contactCd <= 0) { const rev = e.mode === 'reverse' && S.revV > 0, d = rev ? DRILL.revDmg : DRILL.contactDmg;
      if (c.hit([fx - 4, fx + 60, lane <= 0 ? G.laneY[0] - DRILL.plateH : G.laneY[2] - 22, lane <= 0 ? G.laneY[0] : G.laneY[1]], d, rev ? 'THE REVERSE RAM' : 'THE GREAT DRILL', { key: 'rear' + S.n.contact + ':' + S.n.reverse })) { S.contactCd = DRILL.contactCd; S.n.contact++; if (rev) S.n.revHits++; c.shove && c.shove(h, DRILL.shove); } } }
  /* THE WARD after a jam (B3) */
  if (S.ward > 0) { S.ward -= dt; if (S.ward <= 0) S.ward = 0; }
  /* JAMMED: it stands its ground and drifts back to you (B4: no move) */
  if (drillOpen(e)) { e.open -= dt; S.R = Math.max(DRILL.minR + 20, S.R - DRILL.drift * dt);
    if (e.open <= 0) { e.open = 0; e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1] + 0.4; S.ward = DRILL.wardT; S.n.warded++; c.sound && c.sound('ward');
      c.number(rearX(S), G.laneY[2] - 34, S.told.ward ? 'ITS PLATES ARE UP' : 'IT CLEARS ITS GEARS: ITS PLATES ARE UP', '#c8d8e8'); S.told.ward = 1; } return; }
  /* THE PHASES */
  const k = e.hp / e.maxHp;
  if (e.mode !== 'phase' && e.mode !== 'reverse' && ((S.ph === 1 && k <= DRILL.phase2) || (S.ph === 2 && k <= DRILL.phase3))) {
    S.ph++; e.phase = S.ph; e.mode = 'phase'; e.modeT = DRILL.phaseT; S.i = 0; S.spray = null; c.music && c.music(S.ph); c.shake && c.shake(5); c.sound && c.sound('phase');
    if (S.ph === 3) { S.highDown = true; c.arena && c.arena('highDown'); c.sound && c.sound('rock'); }
    c.number(rearX(S), G.laneY[2] - 34, S.ph === 2 ? 'IT GRINDS HOTTER: SPARKS DOWN YOUR LINE' : 'THE ROOF TAKES THE HIGH LINE: TWO LINES LEFT', S.ph === 2 ? '#ffb070' : '#ff6b6b'); return; }
  if (e.mode === 'phase') { e.modeT -= dt; if (e.modeT <= 0) { e.mode = 'idle'; S.cd = 0.9; } return; }
  /* home: it eases back to its place ahead of you */
  if (e.mode !== 'reverse') { const d = DRILL.homeR - S.R; S.R += Math.sign(d) * Math.min(Math.abs(d), DRILL.revBack * dt); }
  const near = live.slice().sort((a, b) => b.x - a.x)[0];
  e.modeT = (e.modeT || 0) - dt;
  switch (e.mode) {
    case 'idle': { S.cd -= dt; if (S.cd > 0 || !near) break;
      const ch = DRILL.chain[S.ph]; const name = ch[S.i % ch.length]; S.i++;
      const ls = lanesOf(S), hl = Math.min(ls[ls.length - 1], near.lane >= 0 ? near.lane : laneUnder(G, near.y));
      if (name === 'rocks') { const clear = ls.length === 2 ? ls.find(l => l !== hl) : ls.filter(l => l !== hl)[S.n.rocks % 2]; S.n.rocks++;
        S.rocks = ls.filter(l => l !== clear).map((lane, j) => ({ lane, x: Math.min(rearX(S) - 20, near.x + DRILL.cruise * DRILL.rockTell + (j ? 18 : 0)), t: DRILL.rockTell, id: S.n.rocks * 3 + j }));
        e.mode = 'rockTell'; e.modeT = DRILL.rockTell; c.sound && c.sound('tell'); if (!S.told.rocks) { S.told.rocks = 1; c.number(rearX(S) - 40, G.laneY[2] - 40, 'IT CRACKS THE ROOF: OFF THE SHADOWS', '#ffb070'); } }
      else if (name === 'reverse') { e.mode = 'revTell'; e.modeT = S.ph === 3 ? DRILL.revTell * 0.85 : DRILL.revTell; S.n.reverse++; c.sound && c.sound('klaxon');
        c.number(rearX(S) - 30, G.laneY[2] - 40, S.told.rev ? '!! REVERSE' : '!! IT BACKS AT YOU: BRAKE, OR JUMP UP', '#ff6b6b'); S.told.rev = 1; }
      else if (name === 'sparks') { e.mode = 'spray'; S.n.sparks++; S.spray = { lane: hl, t: DRILL.sparkTell, on: false, tick: 0 }; c.sound && c.sound('tellHard');
        c.number(rearX(S) - 40, G.laneY[hl] - 44, S.told.spark ? '!! SPARKS: ' + LANE_NAME[hl] : '!! SPARKS DOWN YOUR LINE: CHANGE LINE', '#ffb070'); S.told.spark = 1; }
      break; }
    case 'rockTell': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; } break;
    case 'revTell': if (e.modeT <= 0) { e.mode = 'reverse'; e.modeT = DRILL.revT; S.revV = DRILL.revV; c.sound && c.sound('reverse'); c.shake && c.shake(4); } break;
    case 'reverse': if (S.revV > 0) { S.R = Math.max(DRILL.minR, S.R - S.revV * dt); if (e.modeT <= 0) { S.revV = 0; e.modeT = DRILL.revHold; } }
      else if (e.modeT <= 0) { e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; } break;
    case 'spray': if (!S.spray) e.mode = 'idle'; break;
    default: e.mode = 'idle';
  }
}
/* A HERO'S BLOW ON IT (the cab): what comes off the bar (and the word in out.word). Armoured x0.4 (B15: never totally invulnerable), jammed x2 capped a share a jam */
export function takeBlow(e, S, dmg, out = {}) {
  if (e.mode === 'sleep' || e.mode === 'wake') { out.word = 'ARMOURED'; return Math.round(dmg * DRILL.armour); }
  S.n.cab++;
  if (drillOpen(e)) { const cap = Math.max(0, e.maxHp * DRILL.jamCap - S.openTaken), d = Math.min(dmg * DRILL.jamMul, cap); S.openTaken += d;
    if (cap - d <= 0.01 && e.open > 0.3) { e.open = 0.3; out.word = 'IT FREES ITS GEARS'; } return d; }
  S.n.armoured++; if (S.ward > 0) S.n.warded++; out.word = S.ward > 0 ? 'PLATES UP' : 'ARMOURED: JAM ITS GEARS';
  return dmg * DRILL.armour;
}

/* ---------- THE BOT (src/lab.js): what a player sees, read a quarter-second late (react 0.25 s, a tell misread one time in eight) ----------
   P: { x, y, ground, face, atk, vy, lane, v }; returns { gx (where to hold, arena px), jump, drop (down + jump), atk, boost (pump hard), face, why } */
export const DRILL_PLAN = { react: 0.25, miss: 0.13, missRam: 0.15 };
export function drillPlan({ P, e, S, reach, rng = Math.random, mem = {}, t, tip = 0 }) {
  const G = S.G, out = { gx: null, face: 1, why: '' }, lane = P.lane >= 0 ? P.lane : Math.min(lanesOf(S).length - 1, laneUnder(G, P.y)), LS = lanesOf(S);
  const late = k => { if (!(k in mem)) { mem[k] = t + DRILL_PLAN.react - 0.04 + rng() * 0.1; mem['m' + k] = rng() < DRILL_PLAN.miss; } return t >= mem[k] && !mem['m' + k]; };
  const cab = cabBox(G, S), R0 = rearX(S), standX = cab.l - (tip ? tip + 4 : Math.max(10, reach - 8));   /* (a spear's tip pays at a distance: the warden stands back) */
  const go = l => { if (l > lane && P.ground) out.jump = true; else if (l < lane && P.ground) out.drop = true; };
  const danger = new Set();
  for (const r of S.rocks) if (r.t > 0 && Math.abs(r.x - DRILL.cruise * r.t - P.x) < DRILL.rockW + 6 && late('rock' + r.id)) danger.add(r.lane);
  if (S.spray && late('spray' + S.n.sparks) && P.x > R0 - DRILL.sparkLen - 20) danger.add(S.spray.lane);
  const revOn = (e.mode === 'revTell' || (e.mode === 'reverse' && S.revV > 0)) && late('rev' + S.n.reverse);
  const safe = [lane, 1, 2, 0].filter(l => LS.includes(l)).find(l => !danger.has(l));
  /* 1. THE REVERSE: out of its sweep - brake back (a player brakes; one close behind on the LOW line also jumps up to the MID) */
  if (revOn) { const sweep = DRILL.revV * DRILL.revT + 26; out.gx = Math.max(G.x0 + 14, frontFor(G, S, lane) - sweep - 30); out.why = 'reverse: brake';
    if (lane === 0 && P.x > R0 - sweep && LS.includes(1) && !danger.has(1)) go(1); }
  /* 2. THE OPENING: to the cab (MID line), and strike */
  else if (drillOpen(e)) { const want = lane === 0 ? 1 : lane; if (lane !== want) go(want); out.gx = standX; if (Math.abs(P.x - standX) < 12 && lane >= 1 && P.atk < 0) out.atk = true; out.why = 'jammed: cab'; }
  /* 3. AN ORE CART: down to the LOW line behind it, and PUMP into it */
  else if ((S.chute || S.ores.some(o => !o.fly && o.dy >= -2 && o.x > P.x - 8)) && S.ward <= 0 && late('ore' + S.oreN)) { const o = S.ores.find(q => !q.fly);
    if (lane !== 0) go(0); out.why = 'ore: ram';
    if (o && lane === 0) { if (!(mem['mr' + S.oreN] ??= rng() < DRILL_PLAN.missRam)) { out.gx = o.x + 40; out.boost = true; } else out.gx = o.x - 30; }
    else out.gx = Math.max(G.x0 + 30, (S.chute ? S.chute.x : P.x) - 120); }
  /* 4. OTHERWISE: work the cab from the MID line between its moves (x0.4 is still damage), or wait off its sweep while its plates are up */
  else { const busy = e.mode === 'revTell' || e.mode === 'reverse' || (S.spray && S.spray.lane === lane);
    out.gx = standX; if (lane === 0 && LS.includes(1)) go(1); if (Math.abs(P.x - standX) < 12 && lane >= 1 && !busy && P.atk < 0 && (mem.atkT ?? -9) < t - 0.35) { mem.atkT = t; out.atk = true; } out.why = 'cab'; }
  if (danger.has(lane) && safe !== undefined && safe !== lane) { out.jump = false; out.drop = false; go(safe); out.why += ' +dodge'; }
  if (out.gx !== null) out.gx = Math.min(out.gx, frontFor(G, S, lane) - 10);
  return out;
}
