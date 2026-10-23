// src/hornet-queen.js - THE HORNET QUEEN 2 (claude/hornetsnest; scratch/brief-hornetsnest-1022.md, Daniel-approved 10-22). THE HORNET'S NEST's boss, in two rooms
// and an escape between them. The parked Hornet Queen (src/main.js updateQueen: her dive aimed at your feet, her sting that sticks only in wood, STUCK = open,
// winded x2 when a dive or a sweep is taken on the shield) is her base; her moves are rebuilt here as one module with her new home's rule in them.
// This file is the fight, PURE (her moves, her rooms, what a blow does to her, and the bot's plan); src/hornet-queen-hands.js binds it to the world (main.js) and
// draws her. tools/hornet-queen.mjs is its check.
// HEADER (design-standard B11 / B14 / B15): A BEAST BOSS WITH RULE OPENINGS. She is ALWAYS HITTABLE, never invulnerable:
//   HER SHELL turns a cut outside her openings: a blow lands at HQ.shell (0.5; told: a clank and HARD SHELL). COME DOWN ON HER FROM ABOVE (a plunge off a perch or
//     the bough: FROM ABOVE, B14's key) and it lands whole. In P2 her SWARM CLOAK turns more (HQ.cloak, 0.4 - the B15 floor) until smoke or a falling pine strips it.
//   HER OPENINGS (the shared read, B10: a gold ring and a timer bar), each followed by a told ~3 s WARD (B3: a pale ring, x0.4):
//     STUCK   x1.5  a dive that meets COMB or WOOD drives her sting into it (P1: her comb perches; P2: a felled trunk, the bough, the dropped comb). Stand on it as she
//                   dives and LEAVE LATE - one dive in three is HELD (her sting pulses twice) to punish a hero who leaves on the tell.
//     WINDED  x2    a dive or a sweep taken on a raised shield.
//     DAZED   x1.5  SMOKE UNDER HER: a thrown pot's cloud, a set-down pot or a carried one beneath her as she comes low (the ranged / no-heavy heroes' opening).
//     PINNED  x2    (P2) a felled pine that comes down across her flight, or THE LAST COMB dropped on her: GROUNDED under it (capped: HQ.pin.cap of her a pin).
//   ONE NEW MOVE PER PHASE (B5), every move told with its own windup and release pose (B16) and its own sound:
//     P1 THE BROOD HALL (100-50%): THE DIVE (aim: hangs over you, the sting cocked, a yellow !; release: a straight stoop at your feet) - THE SWEEP (she drops to one end
//        of the hall, a yellow !, and skims across at knee height: jump it or block it) - THE WING-BUZZ (NEW: she hangs high, her wings a blur, a red !! - the comb
//        overhead shakes: red rings on the floor where it falls, and a perch that shakes and drips goes down with it - the arena changes; never the two wall perches).
//        HER BROOD: a cell in the hall's walls PULSES (told) every HQ.brood.every s - smash it, or a FEW drones hatch (HQ.brood.n, at most HQ.brood.cap alive).
//     THE TEAR-OUT: at half she tears out through the hall's east wall; the nest drops - the escape down the trunk (src/hornets-nest.js THE FALLING NEST, chunks
//        falling told by a red ring) to the shrine at its foot.
//     P2 THE GREAT PINE (50-0%): she CIRCLES the clearing under the pine - low and fast across its middle, high and back (her loop is drawn: a dotted shadow on the
//        ground). THE DIVE again (P2: it sticks only in WOOD), THE STINGER VOLLEY (NEW: she stops in the air, abdomen curled under, a yellow !: a fan of darts - step
//        between them or block), THE SWARM CLOAK (a buzz, a red !!: a cloud of her hornets closes round her - x0.4 and its touch stings - until smoke under her or a
//        falling pine scatters it). THE RULE: fell a marked pine INTO HER FLIGHT (four strokes; the strokes stay in it), or cut THE LAST COMB from the bough as she
//        passes under it: GROUNDED + PINNED.
//   ADDS: only her brood (Daniel 10-22: "few, told, capped") - none in P2.
export const HQ = {
  hp: 480, w: 30, h: 22, markH: 40, p1End: 0.55,
  shell: 0.5, cloak: 0.4, above: 1, wardMul: 0.4,
  hover: 70, speed: 120,
  dive: { aim: [0.9, 0.72], held: 0.55, heldEvery: 3, speed: [250, 285], v0: 60, acc: 950, aimH: 96, dmg: 22, half: 9, skim: 0.4, chip: 0.35 },   /* chip: a plain block of the stoop STAGGERS her but jars a share of it through (a parry takes it clean) */   /* the stoop STARTS SLOW and gathers (v0 -> speed at acc): from her aim height a stoop takes ~0.3 s - leave as it gathers */
  stuck: { t: [3.0, 2.6], mul: 1.5 },
  winded: { t: 1.7, mul: 2 },
  dazed: { t: 2.5, mul: 1.5, r: 30, h: 56, cd: 7 },   /* the smoke under her: within r across, h below her; after a daze she will not feel smoke again for cd s (no chain-lock) */
  ward: 2.6, thrash: 0.5,
  sweep: { tell: 0.65, speed: 165, y: 13, dmg: 19, half: 12, chip: 0.5 },   /* a plain block JARS (half comes through) and she sweeps on; a PARRY staggers her; or jump her */
  buzz: { tell: 1.1, every: 3, n: 3, dmg: 16, r: 14, fall: 0.8, spread: 58, cool: 9 },
  brood: { every: 14, pulse: 3.2, n: 2, cap: 2 },
  tear: { tell: 1.4, fly: 1.1 },
  escape: { every: 1.6, tell: 1.0, dmg: 13, r: 14 },
  circle: { lap: 8, low: 30, high: 112, edge: 30, laps: [0.5, 0.9] },   /* a lap of her loop (s): across the middle low, back high; laps: how many before her next move (she picks it at the top of the loop) */   /* a lap of her loop (s): across the middle low, back high */
  volley: { tell: 0.75, n: 5, spread: 1.0, speed: 215, dmg: 16 },
  cloakT: { tell: 0.9, t: 10, touch: 11 },
  pin: { t: 3.8, mul: 2, cap: 0.22, capComb: 0.3, comb: 4.4 },   /* a pin is worth at most cap of her (the blow that empties it, she heaves free: told) */
  pine: { strokes: 4, fall: 0.6, len: 6, lie: 18, rearm: 14, heroDmg: 6, reach: 100, sweep: 0.3 },   /* sweep: the last part of its fall (s) in which a trunk coming down across her flight catches her */   /* reach: the trunk's length - anything under its line lower than that is under it as it lands */
  lastComb: { g: 900, heroDmg: 8 },
};
export const HQ_SAY = { wake: 'THE HORNET QUEEN', rule: 'HER STING STICKS IN COMB. SMOKE UNDER HER, AND SHE FALLS.', stuck: 'STUCK IN THE COMB', stuckWood: 'STUCK IN THE WOOD', pull: 'SHE PULLS UP',
  winded: 'STAGGERED', dazed: 'THE SMOKE DAZES HER', held: 'HELD...', buzz: 'THE COMB SHAKES', perch: 'THE PERCH GIVES WAY', brood: 'HER BROOD STIRS', hatch: 'HER BROOD HATCHES',
  tear: 'SHE TEARS OUT OF THE NEST', nest: 'THE NEST DROPS: DOWN THE TRUNK!', p2: 'THE HORNET QUEEN  THE PINE', rule2: 'FELL A PINE INTO HER FLIGHT, OR DROP THE LAST COMB ON HER.',
  pinned: 'PINNED', comb: 'THE LAST COMB COMES DOWN', ward: 'SHE SHAKES FREE', volley: 'STINGERS', cloak: 'THE SWARM CLOAKS HER', cloakOff: 'THE SMOKE SCATTERS HER SWARM', cloakPine: 'THE PINE SCATTERS HER SWARM',
  shell: 'HARD SHELL', cloaked: 'CLOAKED', warded: 'WARDED', jarred: 'JARRED: PARRY HER, OR JUMP HER', smokeOff: 'SHE FANS THE SMOKE AWAY', timber: 'TIMBER', creak: 'THE PINE CREAKS AND LEANS' };
export const OPEN_NAME = { stuck: 'STUCK', winded: 'STAGGERED', dazed: 'DAZED', pinned: 'PINNED' };
export const hqOpen = e => !!e && (e.mode === 'stuck' || e.mode === 'winded' || e.mode === 'dazed' || e.mode === 'pinned');
const TELLS = new Set(['aim', 'sweepTell', 'buzzTell', 'volleyTell', 'cloakTell', 'tearTell']);
export const hqTelling = e => TELLS.has(e.mode);
/* a pine's fall line on the floor: [lo, hi] px (OLD TUSKER's own shape: src/old-tusker.js lineOf) */
export const lineOf = p => { const a = p.x + p.dir * 8, b = p.x + p.dir * (p.len * 16); return [Math.min(a, b), Math.max(a, b)]; };
/* THE TWO ROOMS (px). A1: the brood hall (arena); A2: the great pine (arena2); X: the escape (L.escape) */
export function geom(A1, A2, X, TS = 16) {
  return { TS,
    h: { x0: A1.x0, x1: A1.x1, floor: A1.floor, top: A1.top ?? A1.floor - 18 * TS, mid: (A1.x0 + A1.x1) / 2, out: (A1.wallR + 1) * TS,
      perches: (A1.perches || []).map(p => ({ ...p, x0p: p.x0 * TS, x1p: (p.x1 + 1) * TS, y: p.row * TS })), cells: (A1.cells || []).map(c => ({ x: c.x * TS + 8, y: (c.y + 1) * TS })) },
    p: { x0: A2.x0, x1: A2.x1, floor: A2.floor, mid: (A2.x0 + A2.x1) / 2, trigger: A2.trigger,
      pines: (A2.pines || []).map((q, i) => ({ id: i, x: q.col * TS + 8, dir: q.dir, len: q.len || HQ.pine.len })),
      comb: A2.lastComb ? { x0: A2.lastComb.x0 * TS, x1: (A2.lastComb.x1 + 1) * TS, y: A2.lastComb.row * TS, rows: A2.lastComb.rows, cx0: A2.lastComb.x0, cx1: A2.lastComb.x1 } : null,
      bough: A2.bough ? { x0: A2.bough.x0 * TS, x1: (A2.bough.x1 + 1) * TS, y: A2.bough.row * TS } : null },
    x: X ? { x0: X.x0 * TS, x1: (X.x1 + 1) * TS, top: X.top * TS, bottom: X.bottom * TS, ledges: (X.ledges || []).map(([a, b, r]) => ({ x0: a * TS, x1: (b + 1) * TS, y: r * TS })) } : null };
}
export function newFight(G) {
  return { G, stage: 1, ward: 0, act: 0, last: [], held: 0, dives: 0, buzzN: 0, buzzCool: 4, told: {}, hurt: {},
    n: { dive: 0, held: 0, stuck: 0, winded: 0, dazed: 0, sweep: 0, buzz: 0, perchFell: 0, brood: 0, hatched: 0, smashed: 0, pinned: 0, pinPine: 0, pinComb: 0, volley: 0, cloak: 0, cloakOff: 0, strokes: 0, laps: 0, escapeHits: 0 },
    perches: G.h.perches.map(p => ({ ...p, st: 'up', t: 0 })), cells: G.h.cells.map(c => ({ ...c, st: 'idle', t: 0 })), broodT: HQ.brood.every * 0.6,
    chunks: [], stingers: [], escT: 0,
    pines: G.p.pines.map(p => ({ ...p, hp: HQ.pine.strokes, st: 'stand', t: 0, lean: 0 })),
    comb: G.p.comb ? { ...G.p.comb, st: 'hang', vy: 0 } : null,
    loop: { th: Math.PI, dir: 1, lapT: 0, laps: 0 }, cloak: 0, purse: Infinity };
}
/* ---------- WHERE SHE FLIES IN P2: her loop over the clearing. th in [0, 2pi): low across the middle (th = 3pi/2), high at the far side (th = pi/2) ---------- */
/* the loop is LOW for its whole lower half (a long pass at the height of a pine's crown, end to end of the clearing) and rises to its high point over the middle */
export function loopAt(S, th, dir = S.loop.dir) { const P = S.G.p, aw = (P.x1 - P.x0) / 2 - HQ.circle.edge, k = (1 + Math.sin(th)) / 2;
  return { x: P.mid + dir * aw * Math.cos(th), y: P.floor - HQ.circle.low - (HQ.circle.high - HQ.circle.low) * k * k }; }
/* where she will be in `t` seconds if she keeps to the loop (the bot's and the player's read of her flight: the shadow on the ground shows it) */
export function loopAhead(S, t) { const w = 2 * Math.PI / HQ.circle.lap; return loopAt(S, S.loop.th + w * t); }
/* ---------- A BLOW ON HER (B15) -> [what lands, the word or null] ---------- */
export function takeBlow(e, S, dmg, plunge) {
  if (e.mode === 'away' || e.mode === 'sleep' || e.mode === 'tear' || S.stage === 'escape') return [0, null];
  let d, word = null;
  if (S.ward > 0 || e.mode === 'thrash') { d = Math.max(1, Math.round(dmg * HQ.wardMul)); word = HQ_SAY.warded; }
  else if (e.mode === 'pinned') { d = Math.round(dmg * HQ.pin.mul); const left = S.purse ?? Infinity; if (d >= left) { S.purse = 0; e.modeT = 0; d = Math.max(1, Math.round(left)); } else S.purse = left - d; }
  else if (e.mode === 'winded') d = Math.round(dmg * HQ.winded.mul);
  else if (e.mode === 'stuck') d = Math.round(dmg * HQ.stuck.mul);
  else if (e.mode === 'dazed') d = Math.round(dmg * HQ.dazed.mul);
  else if (S.cloak > 0) { d = Math.max(1, Math.round(dmg * HQ.cloak)); word = HQ_SAY.cloaked; }
  else if (plunge) d = Math.round(dmg * HQ.above);
  else { d = Math.max(1, Math.round(dmg * HQ.shell)); word = HQ_SAY.shell; }
  /* P1 ENDS AT HALF: she cannot be cut below it in the hall - at it, she tears out */
  if (S.stage === 1) { const floor = Math.ceil(e.maxHp * HQ.p1End); d = Math.max(0, Math.min(d, e.hp - floor)); }
  return [d, word];
}
/* ---------- ONE FRAME OF HER. hs: [{ x, y, ground, alive, pp, block, vx }]; w: the world (src/hornet-queen-hands.js world()) ---------- */
export function stepQueen(e, S, dt, hs, w) {
  S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; S.cloak = Math.max(0, S.cloak - dt); e.cloak = S.cloak;
  stepChunks(S, dt, hs, w); stepStingers(S, dt, hs, w);
  if (S.stage === 2) { stepPines(e, S, dt, hs, w); stepComb(e, S, dt, hs, w); }
  if (e.mode === 'sleep' || e.mode === 'away') return;
  e.modeT -= dt; e.anim = (e.anim || 0) + dt;
  const P = hs.find(h => h.alive) || hs[0];
  if (S.stage === 1) stepP1(e, S, dt, P, w, hs); else if (S.stage === 2) stepP2(e, S, dt, P, w, hs);
}
const hoverTo = (e, tx, ty, sp, dt) => { e.vx += (Math.max(-sp, Math.min(sp, (tx - e.x) * 3)) - (e.vx || 0)) * Math.min(1, dt * 4); e.vy += (Math.max(-sp, Math.min(sp, (ty - e.y) * 3)) - (e.vy || 0)) * Math.min(1, dt * 4); e.x += e.vx * dt; e.y += e.vy * dt; };
/* an opening ends: a short thrash, then the told ward */
const openEnd = (e, S, w) => { e.mode = 'thrash'; e.modeT = HQ.thrash; e.vx = 0; e.vy = 0; w.sound('thrash'); };
function stepP1(e, S, dt, P, w, hs) {
  const H = S.G.h, floor = H.floor, half = HQ.w / 2;
  /* HER BROOD: one cell pulses every HQ.brood.every s; a pulse that runs out hatches drones (capped) */
  S.broodT -= dt;
  const pulsing = S.cells.find(c => c.st === 'pulse');
  if (pulsing) { pulsing.t -= dt; if (pulsing.t <= 0) { pulsing.st = 'hatched'; pulsing.t = HQ.brood.every * 2; S.n.hatched++; w.number(pulsing.x, pulsing.y - 24, HQ_SAY.hatch, '#ff6b6b'); w.sound('hatch'); w.hatch(pulsing, Math.max(0, Math.min(HQ.brood.n, HQ.brood.cap - w.drones()))); } }
  else if (S.broodT <= 0 && e.mode !== 'wake' && e.mode !== 'tearTell' && e.mode !== 'tear') { S.broodT = HQ.brood.every; const idle = S.cells.filter(c => c.st === 'idle');
    if (idle.length) { const c = idle[(S.n.brood + (P ? Math.round(P.x) : 0)) % idle.length]; c.st = 'pulse'; c.t = HQ.brood.pulse; S.n.brood++; w.number(c.x, c.y - 24, '!!', '#ff6b6b'); w.sound('brood'); if (!S.told.brood) { S.told.brood = 1; w.say(HQ_SAY.brood); } } }
  for (const c of S.cells) if ((c.st === 'hatched' || c.st === 'broken') && (c.t -= dt) <= 0) { c.st = 'idle'; }
  /* THE TEAR-OUT: at half, once she is free (never through an opening) */
  if (e.hp <= Math.ceil(e.maxHp * HQ.p1End) && (e.mode === 'hover' || e.mode === 'skim' || e.mode === 'rise' || e.mode === 'thrash')) {
    e.mode = 'tearTell'; e.modeT = HQ.tear.tell; e.vx = 0; e.vy = 0; w.mark('!!'); w.sound('tear'); w.shake(6); w.number(e.x, e.y - HQ.h - 24, HQ_SAY.tear, '#ff6b6b'); return; }
  switch (e.mode) {
    case 'wake': hoverTo(e, H.mid, floor - HQ.hover, 60, dt); if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 1.0; if (!S.told.rule) { S.told.rule = 1; w.say(HQ_SAY.rule); } } return;
    case 'hover': case 'rise': {
      hoverTo(e, Math.max(H.x0 + 24, Math.min(H.x1 - 24, (P ? P.x : H.mid) + Math.sin(e.anim * 0.9) * 26)), floor - HQ.hover + Math.sin(e.anim * 2) * 5, HQ.speed, dt);
      if (P) e.face = Math.sign(P.x - e.x) || e.face;
      if (e.modeT > 0) return;
      pickP1(e, S, P, w); return; }
    case 'aim': {   /* THE DIVE'S TELL: over you, the sting cocked; a HELD aim lasts longer and its sting pulses twice */
      if (P) hoverTo(e, P.x, floor - HQ.dive.aimH, 150, dt); if (P) e.face = Math.sign(P.x - e.x) || e.face;
      if (e.held && !e.heldSaid && e.modeT < HQ.dive.held) { e.heldSaid = true; w.number(e.x, e.y - HQ.h - 18, HQ_SAY.held, '#ffd36b'); w.sound('held'); }
      if (e.modeT <= 0) release(e, S, P, w, 0); return; }
    case 'dive': {   /* THE STOOP: straight at where your feet were, gathering speed; it sticks in comb (a perch), it pulls up off the floor */
      gather(e, dt, 0); e.x += e.vx * dt; e.y += e.vy * dt; e.x = Math.max(H.x0 + 6, Math.min(H.x1 - 6, e.x));
      w.hit([e.x - HQ.dive.half, e.x + HQ.dive.half, e.y - 14, e.y + 2], HQ.dive.dmg, 'dive', { key: 'dv' + S.act, blockable: true, blockChip: HQ.dive.chip, onBlock: () => winded(e, S, w) });
      if (e.mode !== 'dive') return;
      if (e.vy > 0) { const p = S.perches.find(q => q.st !== 'gone' && e.x > q.x0p - 2 && e.x < q.x1p + 2 && e.y >= q.y && e.y - e.vy * dt < q.y + 4);
        if (p) { e.y = p.y; stuck(e, S, w, 'comb'); return; } }
      if (e.y >= floor || e.modeT <= 0) { e.y = Math.min(e.y, floor); e.mode = 'skim'; e.modeT = HQ.dive.skim; e.vx *= 0.25; e.vy = -90; w.dust(e.x, floor, 6); w.number(e.x, e.y - 20, HQ_SAY.pull, '#9aa39a');
        if (!S.told.floor) { S.told.floor = 1; w.say('THE FLOOR DOES NOT HOLD HER STING. STAND ON A COMB PERCH AS SHE DIVES, THEN LEAVE.'); } }
      return; }
    case 'skim': e.x += e.vx * dt; e.y += e.vy * dt; if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = 0.6; } return;
    case 'stuck': case 'winded': case 'dazed': e.vx = 0; e.vy = 0; if (e.mode === 'dazed' && e.y < floor) e.y = Math.min(floor, e.y + 160 * dt); if (e.modeT <= 0) openEnd(e, S, w); return;
    case 'thrash': if (e.modeT <= 0) { S.ward = HQ.ward; e.ward = S.ward; w.fx('ward', e.x, e.y); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.ward, '#c8d8e8'); e.mode = 'rise'; e.modeT = 0.5; } return;
    case 'sweepTell': hoverTo(e, e.face > 0 ? H.x0 + 18 : H.x1 - 18, floor - HQ.sweep.y, 220, dt); if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 2.6; e.vx = e.face * HQ.sweep.speed; e.vy = 0; w.sound('sweep'); } return;
    case 'sweep': { e.y += (floor - HQ.sweep.y - e.y) * Math.min(1, dt * 6); e.x += e.vx * dt;
      w.hit([e.x - HQ.sweep.half, e.x + HQ.sweep.half, floor - HQ.sweep.y - 10, floor - HQ.sweep.y + 8], HQ.sweep.dmg, 'sweep', { key: 'sw' + S.act, blockable: true, blockChip: HQ.sweep.chip, parryOnly: true, onBlock: () => winded(e, S, w) });
      if (e.mode !== 'sweep') return;
      if ((e.face > 0 && e.x > H.x1 - 16) || (e.face < 0 && e.x < H.x0 + 16) || e.modeT <= 0) { e.vx = 0; e.mode = 'rise'; e.modeT = 0.6; } return; }
    case 'buzzTell': hoverTo(e, H.mid, H.top + 40, 130, dt); if (Math.random() < dt * 20) w.dust(e.x + (Math.random() - 0.5) * 30, e.y - 10, 1);
      if (e.modeT <= 0) { e.mode = 'buzz'; e.modeT = 0.5; w.sound('buzzDrop'); w.shake(5); for (const c of S.chunks) if (c.st === 'told') c.st = 'fall';
        const p = S.perches.find(q => q.st === 'shake'); if (p) { p.st = 'gone'; S.n.perchFell++; w.perchGone(p); w.number((p.x0p + p.x1p) / 2, p.y - 12, HQ_SAY.perch, '#ff9a5c'); } }
      return;
    case 'buzz': if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = 0.8; } return;
    case 'tearTell': e.vx = 0; e.vy = 0; e.y -= 14 * dt; if (Math.random() < dt * 14) w.dust(e.x + (Math.random() - 0.5) * 60, H.top + 4, 2);
      if (e.modeT <= 0) { e.mode = 'tear'; e.modeT = HQ.tear.fly; e.vx = 220; e.vy = -60; w.sound('tear'); w.shake(9); w.tearWall(); } return;
    case 'tear': e.x += e.vx * dt; e.y += e.vy * dt; if (e.modeT <= 0) { S.stage = 'escape'; e.mode = 'away'; w.escapeBegin(); } return;
    default: e.mode = 'hover'; e.modeT = 0.6;
  }
}
/* WHICH MOVE (P1): the dive most, the sweep, the wing-buzz now and then (never twice running); never the same move three times */
function pickP1(e, S, P, w) {
  const last = S.last, twice = k => last.length >= 2 && last[0] === k && last[1] === k;
  let k; const r = Math.random();
  S.buzzCool -= 1;
  if (S.buzzCool <= 0 && last[0] !== 'buzz') k = 'buzz'; else k = r < 0.72 ? 'dive' : 'sweep';
  if (twice(k)) k = k === 'dive' ? 'sweep' : 'dive';
  last.unshift(k); last.length = Math.min(last.length, 3); S.act++; S.n[k]++;
  if (k === 'dive') { S.dives++; e.held = S.dives % HQ.dive.heldEvery === 0; if (e.held) S.n.held++; e.heldSaid = false; e.mode = 'aim'; e.modeT = HQ.dive.aim[0] + (e.held ? HQ.dive.held : 0); w.mark('!'); w.sound('aim'); }
  else if (k === 'sweep') { e.mode = 'sweepTell'; e.modeT = HQ.sweep.tell; e.face = P && P.x < S.G.h.mid ? -1 : 1; e.face = -e.face; w.mark('!'); w.sound('sweepTell'); }
  else { S.buzzCool = HQ.buzz.cool / 2; S.buzzN++; e.mode = 'buzzTell'; e.modeT = HQ.buzz.tell; w.mark('!!'); w.sound('buzz'); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.buzz, '#ff9a5c');
    const H = S.G.h, px = P ? P.x : H.mid;
    for (const dx of [0, -HQ.buzz.spread, HQ.buzz.spread]) { const x = Math.max(H.x0 + 12, Math.min(H.x1 - 12, px + dx)); S.chunks.push({ x, y: H.top + 8, vy: 0, st: 'told', floorY: chunkFloor(S, x), key: 'bz' + S.act + '.' + Math.round(x) }); }
    /* a perch that can fall shakes (told) - never the last two */
    const can = S.perches.filter(q => q.fall && q.st === 'up'); if (can.length && S.perches.filter(q => q.st !== 'gone').length > 2) { const p = can.sort((a, b) => Math.abs((a.x0p + a.x1p) / 2 - px) - Math.abs((b.x0p + b.x1p) / 2 - px))[0]; p.st = 'shake'; } }
}
/* where a falling chunk lands: the floor, or a perch over that x (the chunk breaks on it) */
const chunkFloor = (S, x) => { let y = S.G.h.floor; for (const p of S.perches) if (p.st !== 'gone' && x > p.x0p && x < p.x1p && p.y < y) y = p.y; return y; };
function release(e, S, P, w, ph) {
  const floor = S.stage === 1 ? S.G.h.floor : S.G.p.floor;
  const ty = P && P.ground && P.y < floor - 4 ? P.y : P && !P.ground ? Math.min(floor, P.y + 6) : floor;
  const dx = (P ? P.x : e.x) - e.x, dy = Math.max(12, ty - e.y), d = Math.hypot(dx, dy) || 1, sp = HQ.dive.speed[ph];
  e.ux = dx / d; e.uy = dy / d; e.dsp = HQ.dive.v0; e.vx = e.ux * e.dsp; e.vy = e.uy * e.dsp; e.mode = 'dive'; e.modeT = 1.6; w.sound('dive'); e.held = false; void sp;
}
const gather = (e, dt, ph) => { e.dsp = Math.min(HQ.dive.speed[ph], (e.dsp || HQ.dive.v0) + HQ.dive.acc * dt); e.vx = (e.ux || 0) * e.dsp; e.vy = (e.uy || 1) * e.dsp; };
function stuck(e, S, w, what) { e.mode = 'stuck'; e.modeT = HQ.stuck.t[S.stage === 2 ? 1 : 0]; e.openT0 = e.modeT; e.vx = 0; e.vy = 0; S.n.stuck++; S.act++;
  w.sound('stuck'); w.shake(5); w.fx('open', e.x, e.y); w.number(e.x, e.y - HQ.h - 18, what === 'wood' ? HQ_SAY.stuckWood : HQ_SAY.stuck, '#8fd160'); }
function winded(e, S, w) { if (e.mode !== 'dive' && e.mode !== 'sweep') return; e.mode = 'winded'; e.modeT = HQ.winded.t; e.openT0 = e.modeT; e.vx = 0; e.vy = 0; S.n.winded++; S.act++;
  e.y = Math.min(e.y, S.stage === 1 ? S.G.h.floor : S.G.p.floor); w.sound('winded'); w.fx('open', e.x, e.y); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.winded, '#8fd160'); }
export function dazed(e, S, w) {
  if (S.ward > 0 || hqOpen(e) || e.mode === 'thrash' || e.mode === 'tearTell' || e.mode === 'tear' || e.mode === 'wake' || e.mode === 'away' || e.mode === 'sleep') return false;
  if (S.stage === 2 && S.cloak > 0) { S.cloak = 0; e.cloak = 0; S.n.cloakOff++; w.number(e.x, e.y - HQ.h - 18, HQ_SAY.cloakOff, '#c8d0d8'); w.sound('scatter'); return true; }
  e.mode = 'dazed'; e.modeT = HQ.dazed.t; e.openT0 = e.modeT; e.vx = 0; e.vy = 0; S.n.dazed++; S.act++;
  w.sound('dazed'); w.fx('open', e.x, e.y); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.dazed, '#8fd160'); return true;
}
/* ---------- THE ESCAPE: chunks of the nest fall down the trunk at the hero, each told by a red ring on the ledge it will hit ---------- */
export function stepEscape(S, dt, hs, w) {
  const X = S.G.x; if (!X || S.stage !== 'escape') return;
  const P = hs.find(h => h.alive); if (!P || P.x < X.x0 - 8 || P.x > X.x1 || P.y >= X.bottom - 2) return;
  S.escT -= dt; if (S.escT > 0) return; S.escT = HQ.escape.every;
  /* the NEXT ledge down from the hero (the one he will land on): a ring there - wait for it to come down, but not long: his own ledge is giving way */
  const below = X.ledges.filter(l => l.y > P.y + 2).sort((a, b) => a.y - b.y);
  const L = below[0]; if (!L || !P.ground) return;
  const x = Math.max(L.x0 + 10, Math.min(L.x1 - 10, (L.x0 + L.x1) / 2 + (Math.random() - 0.5) * 24));
  S.chunks.push({ x, y: Math.max(0, L.y - 150), vy: 0, st: 'told', t: HQ.escape.tell, floorY: L.y, key: 'ex' + S.n.escapeHits++ + '.' + Math.round(x), esc: true });
}
function stepChunks(S, dt, hs, w) {
  for (const c of S.chunks) {
    if (c.st === 'told') { if (c.esc) { c.t -= dt; if (c.t <= 0) c.st = 'fall'; } continue; }
    if (c.st !== 'fall') continue;
    c.vy = Math.min(520, c.vy + 900 * dt); c.y += c.vy * dt;
    if (c.y >= c.floorY) { c.st = 'done'; w.dust(c.x, c.floorY, 8); w.sound('chunk');
      w.hit([c.x - HQ.buzz.r, c.x + HQ.buzz.r, c.floorY - 26, c.floorY + 2], c.esc ? HQ.escape.dmg : HQ.buzz.dmg, c.esc ? 'falling comb' : 'comb', { key: c.key }); } }
  S.chunks = S.chunks.filter(c => c.st !== 'done');
}
function stepStingers(S, dt, hs, w) {
  for (const s of S.stingers) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    if (s.y >= S.G.p.floor - 1) s.life = 0;
    w.hit([s.x - 3, s.x + 3, s.y - 3, s.y + 3], HQ.volley.dmg, 'stinger', { key: s.key, blockable: true, onBlock: () => { s.life = 0; } }); }
  S.stingers = S.stingers.filter(s => s.life > 0);
}
/* ---------- P2: THE GREAT PINE ---------- */
function stepP2(e, S, dt, P, w, hs) {
  const G = S.G.p, floor = G.floor, wl = 2 * Math.PI / HQ.circle.lap;
  /* the cloak's touch stings */
  if (S.cloak > 0) w.hit([e.x - 16, e.x + 16, e.y - HQ.h - 6, e.y + 6], HQ.cloakT.touch, 'swarm', { key: 'ck' + Math.floor(e.anim * 2) });
  switch (e.mode) {
    case 'wake': case 'enter': { if (e.mode === 'wake') { e.mode = 'enter'; e.modeT = 1.8; S.loop.th = Math.PI; e.x = G.mid; e.y = floor - 200; w.say(HQ_SAY.rule2); w.music(2); }
      const t = loopAt(S, S.loop.th); hoverTo(e, t.x, t.y, 200, dt); if (e.modeT <= 0) { e.mode = 'circle'; e.modeT = HQ.circle.lap * HQ.circle.laps[1]; } return; }
    case 'circle': { S.loop.th += wl * dt; if (S.loop.th > Math.PI * 2) { S.loop.th -= Math.PI * 2; S.n.laps++; }
      const t = loopAt(S, S.loop.th); e.vx = (t.x - e.x) / Math.max(dt, 1e-3); e.vy = (t.y - e.y) / Math.max(dt, 1e-3); e.x = t.x; e.y = t.y; e.face = Math.sign(e.vx) || e.face;
      /* her moves come off the top of the loop (high, at the far side) - never while she is low */
      if (e.modeT <= 0 && Math.sin(S.loop.th) > 0.6) pickP2(e, S, P, w);
      return; }
    case 'aim': if (P) hoverTo(e, P.x, floor - HQ.dive.aimH, 160, dt); if (P) e.face = Math.sign(P.x - e.x) || e.face;
      if (e.held && !e.heldSaid && e.modeT < HQ.dive.held) { e.heldSaid = true; w.number(e.x, e.y - HQ.h - 18, HQ_SAY.held, '#ffd36b'); w.sound('held'); }
      if (e.modeT <= 0) release(e, S, P, w, 1); return;
    case 'dive': { gather(e, dt, 1); e.x += e.vx * dt; e.y += e.vy * dt; e.x = Math.max(G.x0 + 6, Math.min(G.x1 - 6, e.x));
      w.hit([e.x - HQ.dive.half, e.x + HQ.dive.half, e.y - 14, e.y + 2], HQ.dive.dmg, 'dive', { key: 'dv' + S.act, blockable: true, blockChip: HQ.dive.chip, onBlock: () => winded(e, S, w) });
      if (e.mode !== 'dive') return;
      if (e.vy > 0 && w.woodAt(e.x, e.y)) { e.y = Math.floor(e.y / 16) * 16; stuck(e, S, w, 'wood'); return; }
      if (e.y >= floor || e.modeT <= 0) { e.y = Math.min(e.y, floor); e.mode = 'skim'; e.modeT = HQ.dive.skim; e.vx *= 0.25; e.vy = -90; w.dust(e.x, floor, 6); w.number(e.x, e.y - 20, HQ_SAY.pull, '#9aa39a');
        if (!S.told.floor2) { S.told.floor2 = 1; w.say('OUT HERE HER STING STICKS ONLY IN WOOD: A FELLED TRUNK, THE BOUGH, THE COMB.'); } }
      return; }
    case 'skim': e.x += e.vx * dt; e.y += e.vy * dt; if (e.modeT <= 0) back(e, S); return;
    case 'rejoin': { const t = loopAt(S, S.loop.th); hoverTo(e, t.x, t.y, 200, dt); if (Math.hypot(t.x - e.x, t.y - e.y) < 8 || e.modeT <= 0) { e.mode = 'circle'; e.modeT = HQ.circle.lap * HQ.circle.laps[Math.random() < 0.5 ? 0 : 1]; } return; }
    case 'stuck': case 'winded': case 'dazed': e.vx = 0; e.vy = 0; if ((e.mode === 'dazed' || e.mode === 'winded') && e.y < floor) e.y = Math.min(floor, e.y + 160 * dt); if (e.modeT <= 0) openEnd(e, S, w); return;
    case 'pinned': e.vx = 0; e.vy = 0; if (e.modeT <= 0) { openEnd(e, S, w); if (S.pinned) { S.pinned.st = S.pinned.what === 'comb' ? 'heap' : 'spent'; if (S.pinned.what !== 'comb') { const p = S.pines[S.pinned.id]; if (p) { p.st = 'spent'; p.t = HQ.pine.rearm; } } S.pinned = null; } } return;
    case 'thrash': if (e.modeT <= 0) { S.ward = HQ.ward; e.ward = S.ward; w.fx('ward', e.x, e.y); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.ward, '#c8d8e8'); back(e, S); } return;
    case 'volleyTell': e.vx = 0; e.vy = 0; if (P) e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'volley'; e.modeT = 0.45; w.sound('volley'); w.number(e.x, e.y - HQ.h - 14, HQ_SAY.volley, '#ffd36b');
        const tx = P ? P.x : e.x, ty = P ? P.y - 8 : floor, a0 = Math.atan2(ty - e.y, tx - e.x), n = HQ.volley.n;
        for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * (HQ.volley.spread / (n - 1)); S.stingers.push({ x: e.x, y: e.y - 4, vx: Math.cos(a) * HQ.volley.speed, vy: Math.sin(a) * HQ.volley.speed, life: 2.2, key: 'st' + S.act + '.' + i }); } }
      return;
    case 'volley': if (e.modeT <= 0) back(e, S); return;
    case 'cloakTell': e.vx = 0; e.vy = 0; if (Math.random() < dt * 30) w.dust(e.x + (Math.random() - 0.5) * 40, e.y - 10 + (Math.random() - 0.5) * 20, 1);
      if (e.modeT <= 0) { S.cloak = HQ.cloakT.t; e.cloak = S.cloak; S.n.cloak++; w.sound('cloak'); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.cloak, '#ff9a5c'); if (!S.told.cloak) { S.told.cloak = 1; w.say('HER SWARM CLOAKS HER: SMOKE UNDER HER, OR A FALLING PINE, SCATTERS IT.'); } back(e, S); }
      return;
    default: back(e, S);
  }
}
const back = (e, S) => { e.mode = 'rejoin'; e.modeT = 2.2; };
function pickP2(e, S, P, w) {
  const last = S.last, twice = k => last.length >= 2 && last[0] === k && last[1] === k;
  const pool = ['dive', 'dive', 'volley']; if (S.cloak <= 0 && last[0] !== 'cloak' && last[1] !== 'cloak') pool.push('cloak');
  let k = pool[(Math.random() * pool.length) | 0]; if (twice(k)) k = k === 'dive' ? 'volley' : 'dive';
  last.unshift(k); last.length = Math.min(last.length, 3); S.act++; S.n[k === 'cloak' ? 'cloak' : k]++;
  S.loop.dir = -S.loop.dir;   /* (the next laps go the other way round: both sides' pines are in her flight in turn) */
  if (k === 'dive') { S.dives++; e.held = S.dives % HQ.dive.heldEvery === 0; if (e.held) S.n.held++; e.heldSaid = false; e.mode = 'aim'; e.modeT = HQ.dive.aim[1] + (e.held ? HQ.dive.held : 0); w.mark('!'); w.sound('aim'); }
  else if (k === 'volley') { e.mode = 'volleyTell'; e.modeT = HQ.volley.tell; w.mark('!'); w.sound('volleyTell'); }
  else { S.n.cloak--; e.mode = 'cloakTell'; e.modeT = HQ.cloakT.tell; w.mark('!!'); w.sound('cloakTell'); }
}
/* THE MARKED PINES (OLD TUSKER's): four strokes, it falls the way it leans; ACROSS HER FLIGHT it brings her down */
export function strokePine(S, p, w) {
  if (!p || p.st !== 'stand') return false;
  p.hp--; p.lean = (HQ.pine.strokes - p.hp) * 0.06; S.n.strokes++; w.sound('stroke');
  if (!S.told['stroke' + p.id]) { S.told['stroke' + p.id] = 1; w.number(p.x, S.G.p.floor - 84, p.hp > 0 ? HQ_SAY.creak : HQ_SAY.timber, '#ffd36b'); }
  if (p.hp <= 0) { p.st = 'fall'; p.t = HQ.pine.fall; w.sound('creak'); }
  return true;
}
/* is she where a falling pine p comes down (inside its line, low enough for the trunk to reach her)? */
export const underPine = (p, e, floor) => { const [lo, hi] = lineOf(p); return e.x > lo - 14 && e.x < hi + 14 && floor - e.y < HQ.pine.reach; };
function pinHer(e, S, w, what, id) {
  if (S.ward > 0 || hqOpen(e) || e.mode === 'thrash') return false;
  e.mode = 'pinned'; e.modeT = what === 'comb' ? HQ.pin.comb : HQ.pin.t; e.openT0 = e.modeT; e.vx = 0; e.vy = 0; e.y = S.G.p.floor; S.purse = e.maxHp * (what === 'comb' ? HQ.pin.capComb : HQ.pin.cap);
  S.cloak = 0; e.cloak = 0; S.n.pinned++; S.n[what === 'comb' ? 'pinComb' : 'pinPine']++; S.act++; S.pinned = { what, id };
  w.sound('pinned'); w.shake(8); w.fx('open', e.x, e.y); w.number(e.x, e.y - HQ.h - 20, HQ_SAY.pinned, '#ffd36b'); return true;
}
function stepPines(e, S, dt, hs, w) {
  const floor = S.G.p.floor;
  for (const p of S.pines) {
    if (p.st === 'fall') { p.t -= dt;
      if (p.t > 0) { if (p.t < HQ.pine.sweep && e.alive && S.stage === 2 && e.mode !== 'away' && e.mode !== 'sleep' && underPine(p, e, floor) && !(S.ward > 0) && !hqOpen(e) && e.mode !== 'thrash') { p.t = 0; } else continue; }
      p.st = 'down'; p.t = HQ.pine.lie; w.sound('timber'); w.shake(8); const [lo, hi] = lineOf(p); for (let k = 0; k < 6; k++) w.dust(lo + (hi - lo) * k / 5, floor, 4);
      for (const h of hs) if (h.alive && Math.abs(h.y - floor) < 20 && h.x > lo - 4 && h.x < hi + 4) w.hitHero(h, HQ.pine.heroDmg, 'pine', 'pn' + p.id + S.act);
      if (e.alive && S.stage === 2 && e.mode !== 'away' && e.mode !== 'sleep' && underPine(p, e, floor)) {
        if (S.cloak > 0) { S.cloak = 0; e.cloak = 0; S.n.cloakOff++; w.number(e.x, e.y - HQ.h - 30, HQ_SAY.cloakPine, '#c8d0d8'); }
        if (pinHer(e, S, w, 'pine', p.id)) { p.st = 'pin'; e.x = Math.max(lo + 6, Math.min(hi - 6, e.x)); } }
      continue; }
    if (p.st === 'down') { p.t -= dt; if (p.t <= 0) { p.st = 'spent'; p.t = HQ.pine.rearm; w.splinter(p); } continue; }
    if (p.st === 'spent' && HQ.pine.rearm > 0) { p.t -= dt; if (p.t <= 0) { p.st = 'stand'; p.hp = HQ.pine.strokes; p.lean = 0; } }
  }
}
/* THE LAST COMB: cut, it falls; meeting her on the way down, it brings her down (PINNED); on the ground it lies as a heap of comb - footing, and wood to her sting */
export function cutComb(S, w) { const c = S.comb; if (!c || c.st !== 'hang') return false; c.st = 'fall'; c.vy = 0; w.sound('cut'); w.number((c.x0 + c.x1) / 2, c.y - 8, HQ_SAY.comb, '#ffd36b'); return true; }
function stepComb(e, S, dt, hs, w) {
  const c = S.comb; if (!c || c.st !== 'fall') return;
  c.vy = Math.min(560, c.vy + HQ.lastComb.g * dt); c.y += c.vy * dt; const bot = c.y + c.rows * 16;
  if (e.alive && e.mode !== 'away' && e.x > c.x0 - 10 && e.x < c.x1 + 10 && e.y - HQ.h < bot && e.y > c.y) { if (pinHer(e, S, w, 'comb')) { c.st = 'onHer'; c.y = e.y - c.rows * 16 + 4; return; } }
  const land = w.combLand(c);
  if (bot >= land) { c.y = land - c.rows * 16; c.st = 'heap'; w.combHeap(c); w.sound('chunk'); w.shake(6);
    for (const h of hs) if (h.alive && h.x > c.x0 - 4 && h.x < c.x1 + 4 && h.y > c.y) w.hitHero(h, HQ.lastComb.heroDmg, 'comb', 'lc'); }
}
/* the smoke: the hands ask the level (src/hornets-nest-hands.js smokeUnder) every frame while she is low enough to feel it */
/* SHE FEELS IT ONLY WHEN SHE COMES LOW: her dive and its pull-up, her sweep, and (P2) the low pass of her loop - never hanging high over you (a pot held up under her hover does nothing) */
export const feelsSmoke = e => e.mode === 'dive' || e.mode === 'skim' || e.mode === 'sweep' || e.mode === 'sweepTell' || e.mode === 'circle' || e.mode === 'rejoin';
