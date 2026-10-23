// src/hornet-queen.js - THE HORNET QUEEN 2 (claude/hornetsnest; scratch/brief-hornetsnest-1022.md, Daniel-approved 10-22). THE HORNET'S NEST's boss.
// (claude/hornetsnest2, Daniel's 10-23 playtest, scratch/brief-hornetsnest2-1023.md item 2: ONE ARENA. The outside great-pine room is gone and so is the escape between
// the rooms: she fights BOTH phases in THE BROOD HALL, and both phases use the nest's own verbs - the SMOKE POTS and the COMB. The falling-nest descent is the level's
// own end now, walked down after her death: src/hornets-nest.js THE FALLING NEST.)
// The parked Hornet Queen (src/main.js updateQueen: her dive aimed at your feet, her sting that sticks only in wood, STUCK = open, winded x2 when a dive or a sweep is
// taken on the shield) is her base. This file is the fight, PURE (her moves, her hall, what a blow does to her, the bot's read); src/hornet-queen-hands.js binds it to
// the world (main.js) and draws her. tools/hornets-nest.mjs is its check.
// HEADER (design-standard B11 / B14 / B15): A BEAST BOSS WITH RULE OPENINGS. She is ALWAYS HITTABLE, never invulnerable:
//   HER SHELL turns a cut outside her openings: a blow lands at HQ.shell (0.5; told: a clank and HARD SHELL). COME DOWN ON HER FROM ABOVE (a plunge off a perch or
//     a cut comb: FROM ABOVE, B14's key) and it lands whole. In P2 her SWARM CLOAK turns more (HQ.cloak, 0.4 - the B15 floor) until smoke strips it.
//   HER OPENINGS (the shared read, B10: a gold ring and a timer bar), each followed by a told ~3 s WARD (B3: a pale ring, x0.4):
//     STUCK   x1.5  a dive that meets COMB drives her sting into it (her comb perches; in P2 the wall perches and every comb you have cut down). Stand on comb as she
//                   dives and LEAVE LATE - one dive in three is HELD (her sting pulses twice) to punish a hero who leaves on the tell.
//     WINDED  x2    a dive or a sweep taken on a raised shield (the sweep: a parry).
//     DAZED   x1.5  SMOKE UNDER HER: a thrown pot's cloud, a set-down pot or a carried one beneath her as she comes low (the ranged / no-heavy heroes' opening).
//     PINNED  x2    (P2) a HANGING COMB cut down onto her (a torn comb over her low pass, x2 capped at HQ.pin.cap of her), and the big one: THE LAST COMB, the
//                   royal comb in the hall's vault, dropped on her (capped at HQ.pin.capLast, held longer). A comb dropped on her while she is STUCK or DAZED under it
//                   turns that opening into the pin.
//   ONE NEW MOVE PER PHASE (B5), every move told with its own windup and release pose (B16) and its own sound:
//     P1 THE BROOD HALL (100-55%): THE DIVE (aim: hangs over you, the sting cocked, a yellow !; release: a straight stoop at your feet) - THE SWEEP (she drops to one
//        end of the hall, a yellow !, and skims across at knee height: jump it or parry it) - THE WING-BUZZ (NEW: she hangs high, her wings a blur, a red !! - the comb
//        overhead shakes: red rings on the floor where it falls, and a perch that shakes and drips goes down with it; never the two wall perches).
//        HER BROOD: a cell in the hall's walls PULSES (told) every HQ.brood.every s - smash it, or a FEW drones hatch (HQ.brood.n, at most HQ.brood.cap alive).
//     THE HALL TEARS (55%): she rears up into the vault (a red !!, the inner perches shake and drip) and rips it: the inner perches tear loose and HANG on their
//        stalks, the royal comb sags out of the vault (THE LAST COMB) and HONEY FLOODS THE FLOOR (sticky: the hall's floor holds your feet, like fresh comb).
//     P2 THE HONEY HALL (55-0%): she CIRCLES the hall - low and fast across its middle, high and back (her loop is drawn: a dotted shadow on the honey). THE DIVE again
//        (it sticks in any comb: the wall perches, a comb you cut down), THE STINGER VOLLEY (NEW: she stops in the air, abdomen curled under, a yellow !: a fan of
//        darts - step between them or block), THE SWARM CLOAK (a buzz, a red !!: a cloud of her hornets closes round her - x0.4 and its touch stings - until smoke
//        under her scatters it). THE RULE: CUT A HANGING COMB - it drops: a STEP out of the honey (the cut combs are dry footing), or, cut as she passes under it,
//        a WEIGHT ON HER (PINNED). From a cut comb you reach THE LAST COMB.
//   ADDS: only her brood in P1 (Daniel 10-22: "few, told, capped") - none in P2 (the honey drowns the cells).
export const HQ = {
  hp: 430, w: 30, h: 22, markH: 40, p1End: 0.55,
  shell: 0.5, cloak: 0.4, above: 1, wardMul: 0.4,
  hover: 70, speed: 120,
  dive: { aim: [0.9, 0.72], held: 0.55, heldEvery: 3, speed: [250, 285], v0: 60, acc: 950, aimH: 96, dmg: 46, half: 9, skim: 0.4, chip: 0.5 },   /* chip: a plain block of the stoop STAGGERS her but jars a share of it through (a parry takes it clean) */   /* the stoop STARTS SLOW and gathers (v0 -> speed at acc): from her aim height a stoop takes ~0.3 s - leave as it gathers */
  stuck: { t: [3.0, 2.6], mul: 1.5 },
  winded: { t: 1.7, mul: 2 },
  dazed: { t: 2.5, mul: 1.5, r: 30, h: 56, cd: 7 },   /* the smoke under her: within r across, h below her; after a daze she will not feel smoke again for cd s (no chain-lock) */
  ward: 2.6, thrash: 0.5,
  sweep: { tell: 0.65, speed: 165, y: 13, dmg: 36, half: 12, chip: 0.65 },   /* a plain block JARS (half comes through) and she sweeps on; a PARRY staggers her; or jump her */
  buzz: { tell: 1.1, every: 3, n: 3, dmg: 38, r: 14, fall: 0.8, spread: 58, cool: 9 },
  brood: { every: 14, pulse: 3.2, n: 2, cap: 2 },
  tear: { tell: 1.4, rip: 0.9 },   /* THE HALL TEARS: the told rear-up (the inner perches shake), then the rip (the perches hang, the last comb sags, the honey comes) */
  circle: { lap: 7, low: 26, high: 150, edge: 30, laps: [0.5, 0.9], lift: 6 },   /* a lap of her loop (s): low across the middle (her back a hand under a hanging comb's foot), high and back; lift: px she keeps over a cut comb lying in the honey */
  volley: { tell: 0.75, n: 5, spread: 1.0, speed: 215, dmg: 30 },
  cloakT: { tell: 0.9, t: 10, touch: 24 },
  pin: { t: 3.8, mul: 2, cap: 0.22, capLast: 0.3, last: 4.4, heroDmg: 8 },   /* a pin is worth at most cap of her (the blow that empties it, she heaves free: told); THE LAST COMB: capLast, held `last` s */
  descent: { every: 1.6, tell: 1.0, dmg: 26, r: 14 },   /* (her death) THE FALLING NEST: comb chunks down the trunk, each told by a red ring on the ledge it hits */
};
export const HQ_SAY = { wake: 'THE HORNET QUEEN', rule: 'HER STING STICKS IN COMB. SMOKE UNDER HER, AND SHE FALLS.', stuck: 'STUCK IN THE COMB', pull: 'SHE PULLS UP',
  winded: 'STAGGERED', dazed: 'THE SMOKE DAZES HER', held: 'HELD...', buzz: 'THE COMB SHAKES', perch: 'THE PERCH GIVES WAY', brood: 'HER BROOD STIRS', hatch: 'HER BROOD HATCHES',
  tear: 'SHE TEARS AT THE VAULT', torn: 'THE HALL TEARS: HONEY!', p2: 'THE HORNET QUEEN  THE HONEY HALL', rule2: 'HONEY FLOODS THE FLOOR. CUT A HANGING COMB: A STEP OUT OF THE HONEY - OR, AS SHE PASSES UNDER, A WEIGHT ON HER.',
  pinned: 'PINNED', last: 'THE LAST COMB COMES DOWN', ward: 'SHE SHAKES FREE', volley: 'STINGERS', cloak: 'THE SWARM CLOAKS HER', cloakOff: 'THE SMOKE SCATTERS HER SWARM',
  shell: 'HARD SHELL', cloaked: 'CLOAKED', warded: 'WARDED', jarred: 'JARRED: PARRY HER, OR JUMP HER', smokeOff: 'SHE FANS THE SMOKE AWAY', nest: 'THE NEST TEARS LOOSE: DOWN THE TRUNK!' };
export const OPEN_NAME = { stuck: 'STUCK', winded: 'STAGGERED', dazed: 'DAZED', pinned: 'PINNED' };
export const hqOpen = e => !!e && (e.mode === 'stuck' || e.mode === 'winded' || e.mode === 'dazed' || e.mode === 'pinned');
const TELLS = new Set(['aim', 'sweepTell', 'buzzTell', 'volleyTell', 'cloakTell', 'tearTell']);
export const hqTelling = e => TELLS.has(e.mode);
/* THE HALL (px). A1: the brood hall (L.arena; its p2: the hall's torn combs, THE LAST COMB and the honey's span, in columns); X: the falling nest (L.descent) */
export function geom(A1, X, TS = 16) {
  const p2 = A1.p2 || {};
  const comb = c => ({ id: c.id, x0: c.x0, x1: c.x1, row: c.row, rows: c.rows, x0p: c.x0 * TS, x1p: (c.x1 + 1) * TS, y: c.row * TS, last: !!c.last });
  return { TS,
    h: { x0: A1.x0, x1: A1.x1, floor: A1.floor, top: A1.top ?? A1.floor - 18 * TS, mid: (A1.x0 + A1.x1) / 2, out: (A1.wallR + 1) * TS,
      perches: (A1.perches || []).map(p => ({ ...p, x0p: p.x0 * TS, x1p: (p.x1 + 1) * TS, y: p.row * TS })), cells: (A1.cells || []).map(c => ({ x: c.x * TS + 8, y: (c.y + 1) * TS })),
      torn: (p2.torn || []).map(comb), last: p2.last ? comb({ ...p2.last, last: true }) : null, honey: p2.honey ? { x0: p2.honey[0] * TS, x1: (p2.honey[1] + 1) * TS, row: p2.honey[2] } : null },
    x: X ? { x0: X.x0 * TS, x1: (X.x1 + 1) * TS, top: X.top * TS, bottom: X.bottom * TS, ledges: (X.ledges || []).map(([a, b, r]) => ({ x0: a * TS, x1: (b + 1) * TS, y: r * TS })) } : null };
}
export function newFight(G) {
  return { G, stage: 1, ward: 0, act: 0, last: [], held: 0, dives: 0, buzzN: 0, buzzCool: 4, told: {}, hurt: {},
    n: { dive: 0, held: 0, stuck: 0, stuckHeap: 0, winded: 0, dazed: 0, sweep: 0, buzz: 0, perchFell: 0, brood: 0, hatched: 0, smashed: 0, pinned: 0, pinComb: 0, pinLast: 0, volley: 0, cloak: 0, cloakOff: 0, laps: 0, descentHits: 0, torn: 0 },
    perches: G.h.perches.map(p => ({ ...p, st: 'up', t: 0 })), cells: G.h.cells.map(c => ({ ...c, st: 'idle', t: 0 })), broodT: HQ.brood.every * 0.6,
    chunks: [], stingers: [], descT: 0,
    combs: [], pinUsed: {},   /* (P2) the hall's hanging / falling / cut combs, mirrored each frame from the nest's hands: [{ id, x0p, x1p, y, rows, st: 'hang'|'fall'|'down', last }] */
    loop: { th: Math.PI, dir: 1, lapT: 0, laps: 0 }, cloak: 0, purse: Infinity };
}
/* ---------- WHERE SHE FLIES IN P2: her loop over the honey. th in [0, 2pi): low across the middle (th = 3pi/2), high at the far side (th = pi/2) ---------- */
/* a comb cut down into the honey stands up out of it: she keeps HQ.circle.lift over its top */
export const heapTop = (S, x) => { let y = Infinity; for (const c of S.combs || []) if (c.st === 'down' && x > c.x0p - 12 && x < c.x1p + 12) y = Math.min(y, c.y); return y; };
export function loopAt(S, th, dir = S.loop.dir) { const P = S.G.h, C = HQ.circle, aw = (P.x1 - P.x0) / 2 - C.edge, k = (1 + Math.sin(th)) / 2, x = P.mid + dir * aw * Math.cos(th);
  return { x, y: Math.min(P.floor - C.low - (C.high - C.low) * k * k, heapTop(S, x) - C.lift) }; }
/* where she will be in `t` seconds if she keeps to the loop (the bot's and the player's read of her flight: the shadow on the honey shows it) */
export function loopAhead(S, t) { const w = 2 * Math.PI / HQ.circle.lap; return loopAt(S, S.loop.th + w * t); }
/* is she (or a point of her loop) under a hanging comb c - inside its columns, below its foot? */
export const underComb = (c, q) => q.x > c.x0p - 8 && q.x < c.x1p + 8 && q.y - HQ.h >= c.y + c.rows * 16 - 6;
/* ---------- A BLOW ON HER (B15) -> [what lands, the word or null] ---------- */
export function takeBlow(e, S, dmg, plunge) {
  if (e.mode === 'away' || e.mode === 'sleep' || S.stage === 'down') return [0, null];
  let d, word = null;
  if (S.ward > 0 || e.mode === 'thrash') { d = Math.max(1, Math.round(dmg * HQ.wardMul)); word = HQ_SAY.warded; }
  else if (e.mode === 'pinned') { d = Math.round(dmg * HQ.pin.mul); const left = S.purse ?? Infinity; if (d >= left) { S.purse = 0; e.modeT = 0; d = Math.max(1, Math.round(left)); } else S.purse = left - d; }
  else if (e.mode === 'winded') d = Math.round(dmg * HQ.winded.mul);
  else if (e.mode === 'stuck') d = Math.round(dmg * HQ.stuck.mul);
  else if (e.mode === 'dazed') d = Math.round(dmg * HQ.dazed.mul);
  else if (S.cloak > 0) { d = Math.max(1, Math.round(dmg * HQ.cloak)); word = HQ_SAY.cloaked; }
  else if (plunge) d = Math.round(dmg * HQ.above);
  else { d = Math.max(1, Math.round(dmg * HQ.shell)); word = HQ_SAY.shell; }
  /* P1 ENDS AT ITS SHARE: she cannot be cut below it before the hall tears - at it, she tears the vault */
  if (S.stage === 1) { const floor = Math.ceil(e.maxHp * HQ.p1End); d = Math.max(0, Math.min(d, e.hp - floor)); }
  return [d, word];
}
/* ---------- ONE FRAME OF HER. hs: [{ x, y, ground, alive, pp, block, vx }]; w: the world (src/hornet-queen-hands.js world()) ---------- */
export function stepQueen(e, S, dt, hs, w) {
  S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; S.cloak = Math.max(0, S.cloak - dt); e.cloak = S.cloak;
  stepChunks(S, dt, hs, w); stepStingers(S, dt, hs, w);
  if (e.mode === 'sleep' || e.mode === 'away') return;
  e.modeT -= dt; e.anim = (e.anim || 0) + dt;
  const P = hs.find(h => h.alive) || hs[0];
  if (S.stage === 2) { combsOnHer(e, S, w); stepP2(e, S, dt, P, w, hs); } else stepP1(e, S, dt, P, w, hs);
}
const hoverTo = (e, tx, ty, sp, dt) => { e.vx += (Math.max(-sp, Math.min(sp, (tx - e.x) * 3)) - (e.vx || 0)) * Math.min(1, dt * 4); e.vy += (Math.max(-sp, Math.min(sp, (ty - e.y) * 3)) - (e.vy || 0)) * Math.min(1, dt * 4); e.x += e.vx * dt; e.y += e.vy * dt; };
/* an opening ends: a short thrash, then the told ward */
const openEnd = (e, S, w) => { e.mode = 'thrash'; e.modeT = HQ.thrash; e.vx = 0; e.vy = 0; w.sound('thrash'); };
/* the comb a stoop meets on its way down (vy > 0): a standing perch, or (P2) a comb cut down into the honey - its top y, or null */
function combUnder(e, S, dt) {
  for (const q of S.perches) if (q.st !== 'gone' && q.y > (e.diveY0 ?? -1e9) + 8 && e.x > q.x0p - 2 && e.x < q.x1p + 2 && e.y >= q.y && e.y - e.vy * dt < q.y + 4) return { y: q.y, heap: false };   /* (a perch she stoops FROM is not one she stoops INTO) */
  for (const c of S.combs) if (c.st === 'down' && c.y > (e.diveY0 ?? -1e9) + 8 && e.x > c.x0p - 2 && e.x < c.x1p + 2 && e.y >= c.y && e.y - e.vy * dt < c.y + 4) return { y: c.y, heap: true };
  return null;
}
function stepP1(e, S, dt, P, w, hs) {
  const H = S.G.h, floor = H.floor;
  /* HER BROOD: one cell pulses every HQ.brood.every s; a pulse that runs out hatches drones (capped) */
  S.broodT -= dt;
  const pulsing = S.cells.find(c => c.st === 'pulse');
  if (pulsing) { pulsing.t -= dt; if (pulsing.t <= 0) { pulsing.st = 'hatched'; pulsing.t = HQ.brood.every * 2; S.n.hatched++; w.number(pulsing.x, pulsing.y - 24, HQ_SAY.hatch, '#ff6b6b'); w.sound('hatch'); w.hatch(pulsing, Math.max(0, Math.min(HQ.brood.n, HQ.brood.cap - w.drones()))); } }
  else if (S.broodT <= 0 && e.mode !== 'wake' && e.mode !== 'tearTell' && e.mode !== 'tear') { S.broodT = HQ.brood.every; const idle = S.cells.filter(c => c.st === 'idle');
    if (idle.length) { const c = idle[(S.n.brood + (P ? Math.round(P.x) : 0)) % idle.length]; c.st = 'pulse'; c.t = HQ.brood.pulse; S.n.brood++; w.number(c.x, c.y - 24, '!!', '#ff6b6b'); w.sound('brood'); if (!S.told.brood) { S.told.brood = 1; w.say(HQ_SAY.brood); } } }
  for (const c of S.cells) if ((c.st === 'hatched' || c.st === 'broken') && (c.t -= dt) <= 0) { c.st = 'idle'; }
  /* THE HALL TEARS: at her share, once she is free (never through an opening) */
  if (e.hp <= Math.ceil(e.maxHp * HQ.p1End) && (e.mode === 'hover' || e.mode === 'skim' || e.mode === 'rise' || e.mode === 'thrash')) {
    e.mode = 'tearTell'; e.modeT = HQ.tear.tell; e.vx = 0; e.vy = 0; w.mark('!!'); w.sound('tear'); w.shake(6); w.number(e.x, e.y - HQ.h - 24, HQ_SAY.tear, '#ff6b6b');
    for (const p of S.perches) if (p.fall && p.st === 'up') p.st = 'shake';   /* (the inner perches shake and drip: the told part of the tear) */
    for (const c of S.cells) if (c.st === 'pulse') c.st = 'idle';
    return; }
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
      if (e.vy > 0) { const p = combUnder(e, S, dt); if (p) { e.y = p.y; stuck(e, S, w, p.heap); return; } }
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
    case 'tearTell': e.vx = 0; e.vy = 0; e.y = Math.max(H.top + 30, e.y - 30 * dt); if (Math.random() < dt * 14) w.dust(e.x + (Math.random() - 0.5) * 60, H.top + 4, 2);
      if (e.modeT <= 0) { e.mode = 'tear'; e.modeT = HQ.tear.rip; w.sound('tear'); w.shake(9); w.number(e.x, e.y - HQ.h - 24, HQ_SAY.torn, '#ffd36b');
        for (const p of S.perches) if (p.fall && p.st !== 'gone') { p.st = 'gone'; w.perchGone(p, true); }   /* the inner perches tear loose (the hands hang them again as the torn combs) */
        S.chunks = []; S.n.torn++; w.tearHall(); }
      return;
    case 'tear': e.vx = 0; e.vy = 0; if (Math.random() < dt * 20) w.dust(e.x + (Math.random() - 0.5) * 80, H.top + 6, 2);
      if (e.modeT <= 0) { S.stage = 2; e.mode = 'enter'; e.modeT = 1.4; S.loop.th = Math.PI; w.music(2); w.say(HQ_SAY.rule2); } return;
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
  const floor = S.G.h.floor;
  const ty = P && P.ground && P.y < floor - 4 ? P.y : P && !P.ground ? Math.min(floor, P.y + 6) : floor;
  const dx = (P ? P.x : e.x) - e.x, dy = Math.max(12, ty - e.y), d = Math.hypot(dx, dy) || 1;
  e.diveY0 = e.y; e.ux = dx / d; e.uy = dy / d; e.dsp = HQ.dive.v0; e.vx = e.ux * e.dsp; e.vy = e.uy * e.dsp; e.mode = 'dive'; e.modeT = 1.6; w.sound('dive'); e.held = false; void ph;
}
const gather = (e, dt, ph) => { e.dsp = Math.min(HQ.dive.speed[ph], (e.dsp || HQ.dive.v0) + HQ.dive.acc * dt); e.vx = (e.ux || 0) * e.dsp; e.vy = (e.uy || 1) * e.dsp; };
function stuck(e, S, w, heap) { e.mode = 'stuck'; e.modeT = HQ.stuck.t[S.stage === 2 ? 1 : 0]; e.openT0 = e.modeT; e.vx = 0; e.vy = 0; S.n.stuck++; if (heap) S.n.stuckHeap++; S.act++;
  w.sound('stuck'); w.shake(5); w.fx('open', e.x, e.y); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.stuck, '#8fd160'); }
function winded(e, S, w) { if (e.mode !== 'dive' && e.mode !== 'sweep') return; e.mode = 'winded'; e.modeT = HQ.winded.t; e.openT0 = e.modeT; e.vx = 0; e.vy = 0; S.n.winded++; S.act++;
  e.y = Math.min(e.y, S.G.h.floor); w.sound('winded'); w.fx('open', e.x, e.y); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.winded, '#8fd160'); }
export function dazed(e, S, w) {
  if (S.ward > 0 || hqOpen(e) || e.mode === 'thrash' || e.mode === 'tearTell' || e.mode === 'tear' || e.mode === 'wake' || e.mode === 'enter' || e.mode === 'away' || e.mode === 'sleep') return false;
  if (S.stage === 2 && S.cloak > 0) { S.cloak = 0; e.cloak = 0; S.n.cloakOff++; w.number(e.x, e.y - HQ.h - 18, HQ_SAY.cloakOff, '#c8d0d8'); w.sound('scatter'); return true; }
  e.mode = 'dazed'; e.modeT = HQ.dazed.t; e.openT0 = e.modeT; e.vx = 0; e.vy = 0; S.n.dazed++; S.act++;
  w.sound('dazed'); w.fx('open', e.x, e.y); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.dazed, '#8fd160'); return true;
}
/* ---------- HER DEATH: THE FALLING NEST - the nest tears loose and comb comes down the trunk at the hero, each chunk told by a red ring on the ledge it will hit ---------- */
export function stepEscape(S, dt, hs, w) {
  const X = S.G.x; if (!X || S.stage !== 'down') return;
  const P = hs.find(h => h.alive); if (!P || P.x < X.x0 - 8 || P.x > X.x1 || P.y >= X.bottom - 2) return;
  S.descT -= dt; if (S.descT > 0) return; S.descT = HQ.descent.every;
  /* the NEXT ledge down from the hero (the one he will land on): a ring there - wait for it to come down, but not long: his own ledge is giving way */
  const below = X.ledges.filter(l => l.y > P.y + 2).sort((a, b) => a.y - b.y);
  const L = below[0]; if (!L || !P.ground) return;
  const x = Math.max(L.x0 + 10, Math.min(L.x1 - 10, (L.x0 + L.x1) / 2 + (Math.random() - 0.5) * 24));
  S.chunks.push({ x, y: Math.max(0, L.y - 150), vy: 0, st: 'told', t: HQ.descent.tell, floorY: L.y, key: 'ex' + S.n.descentHits++ + '.' + Math.round(x), esc: true });
}
function stepChunks(S, dt, hs, w) {
  for (const c of S.chunks) {
    if (c.st === 'told') { if (c.esc) { c.t -= dt; if (c.t <= 0) c.st = 'fall'; } continue; }
    if (c.st !== 'fall') continue;
    c.vy = Math.min(520, c.vy + 900 * dt); c.y += c.vy * dt;
    if (c.y >= c.floorY) { c.st = 'done'; w.dust(c.x, c.floorY, 8); w.sound('chunk');
      w.hit([c.x - HQ.buzz.r, c.x + HQ.buzz.r, c.floorY - 26, c.floorY + 2], c.esc ? HQ.descent.dmg : HQ.buzz.dmg, c.esc ? 'falling comb' : 'comb', { key: c.key }); } }
  S.chunks = S.chunks.filter(c => c.st !== 'done');
}
function stepStingers(S, dt, hs, w) {
  for (const s of S.stingers) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    if (s.y >= S.G.h.floor - 1) s.life = 0;
    w.hit([s.x - 3, s.x + 3, s.y - 3, s.y + 3], HQ.volley.dmg, 'stinger', { key: s.key, blockable: true, onBlock: () => { s.life = 0; } }); }
  S.stingers = S.stingers.filter(s => s.life > 0);
}
/* ---------- P2: THE HONEY HALL ---------- */
/* A FALLING COMB THAT MEETS HER: PINNED (once a comb). THE LAST COMB is the big one */
function combsOnHer(e, S, w) {
  for (const c of S.combs) { if (c.st !== 'fall' || S.pinUsed[c.id]) continue;
    const b = { l: c.x0p, r: c.x1p, t: c.y, b: c.y + c.rows * 16 };
    if (e.x + HQ.w / 2 > b.l && e.x - HQ.w / 2 < b.r && e.y - HQ.h < b.b && e.y > b.t + 4) { S.pinUsed[c.id] = 1; pinHer(e, S, w, c.last ? 'last' : 'comb', c.id); } }
}
function stepP2(e, S, dt, P, w, hs) {
  const G = S.G.h, floor = G.floor, wl = 2 * Math.PI / HQ.circle.lap;
  /* the cloak's touch stings */
  if (S.cloak > 0) w.hit([e.x - 16, e.x + 16, e.y - HQ.h - 6, e.y + 6], HQ.cloakT.touch, 'swarm', { key: 'ck' + Math.floor(e.anim * 2) });
  switch (e.mode) {
    case 'wake': case 'enter': { if (e.mode === 'wake') { e.mode = 'enter'; e.modeT = 1.4; S.loop.th = Math.PI; }
      const t = loopAt(S, S.loop.th); hoverTo(e, t.x, t.y, 200, dt); if (e.modeT <= 0) { e.mode = 'circle'; e.modeT = HQ.circle.lap * HQ.circle.laps[1]; } return; }
    case 'circle': { S.loop.th += wl * dt; if (S.loop.th > Math.PI * 2) { S.loop.th -= Math.PI * 2; S.n.laps++; }
      const t = loopAt(S, S.loop.th); e.vx = (t.x - e.x) / Math.max(dt, 1e-3); e.vy = (t.y - e.y) / Math.max(dt, 1e-3); e.x = t.x; e.y = t.y; e.face = Math.sign(e.vx) || e.face;
      /* her moves come off the top of the loop (high, at the far side) - never while she is low */
      if (e.modeT <= 0 && Math.sin(S.loop.th) > 0.6) pickP2(e, S, P, w);
      return; }
    case 'aim': if (P) hoverTo(e, P.x, Math.min(floor - HQ.dive.aimH, (P.ground ? P.y : floor) - HQ.dive.aimH + 30), 160, dt); if (P) e.face = Math.sign(P.x - e.x) || e.face;
      if (e.held && !e.heldSaid && e.modeT < HQ.dive.held) { e.heldSaid = true; w.number(e.x, e.y - HQ.h - 18, HQ_SAY.held, '#ffd36b'); w.sound('held'); }
      if (e.modeT <= 0) release(e, S, P, w, 1); return;
    case 'dive': { gather(e, dt, 1); e.x += e.vx * dt; e.y += e.vy * dt; e.x = Math.max(G.x0 + 6, Math.min(G.x1 - 6, e.x));
      w.hit([e.x - HQ.dive.half, e.x + HQ.dive.half, e.y - 14, e.y + 2], HQ.dive.dmg, 'dive', { key: 'dv' + S.act, blockable: true, blockChip: HQ.dive.chip, onBlock: () => winded(e, S, w) });
      if (e.mode !== 'dive') return;
      if (e.vy > 0) { const p = combUnder(e, S, dt); if (p) { e.y = p.y; stuck(e, S, w, p.heap); return; } }
      if (e.y >= floor || e.modeT <= 0) { e.y = Math.min(e.y, floor); e.mode = 'skim'; e.modeT = HQ.dive.skim; e.vx *= 0.25; e.vy = -90; w.dust(e.x, floor, 6); w.number(e.x, e.y - 20, HQ_SAY.pull, '#9aa39a');
        if (!S.told.floor2) { S.told.floor2 = 1; w.say('THE HONEY DOES NOT HOLD HER STING - COMB DOES: A WALL PERCH, OR A COMB YOU CUT DOWN.'); } }
      return; }
    case 'skim': e.x += e.vx * dt; e.y += e.vy * dt; if (e.modeT <= 0) back(e, S); return;
    case 'rejoin': { const t = loopAt(S, S.loop.th); hoverTo(e, t.x, t.y, 200, dt); if (Math.hypot(t.x - e.x, t.y - e.y) < 8 || e.modeT <= 0) { e.mode = 'circle'; e.modeT = HQ.circle.lap * HQ.circle.laps[Math.random() < 0.5 ? 0 : 1]; } return; }
    case 'stuck': case 'winded': case 'dazed': e.vx = 0; e.vy = 0; if ((e.mode === 'dazed' || e.mode === 'winded') && e.y < floor) e.y = Math.min(floor, e.y + 160 * dt); if (e.modeT <= 0) openEnd(e, S, w); return;
    case 'pinned': e.vx = 0; e.vy = 0; if (e.modeT <= 0) { openEnd(e, S, w); S.pinned = null; } return;
    case 'thrash': if (e.modeT <= 0) { S.ward = HQ.ward; e.ward = S.ward; w.fx('ward', e.x, e.y); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.ward, '#c8d8e8'); back(e, S); } return;
    case 'volleyTell': e.vx = 0; e.vy = 0; if (P) e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'volley'; e.modeT = 0.45; w.sound('volley'); w.number(e.x, e.y - HQ.h - 14, HQ_SAY.volley, '#ffd36b');
        const tx = P ? P.x : e.x, ty = P ? P.y - 8 : floor, a0 = Math.atan2(ty - e.y, tx - e.x), n = HQ.volley.n;
        for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * (HQ.volley.spread / (n - 1)); S.stingers.push({ x: e.x, y: e.y - 4, vx: Math.cos(a) * HQ.volley.speed, vy: Math.sin(a) * HQ.volley.speed, life: 2.2, key: 'st' + S.act + '.' + i }); } }
      return;
    case 'volley': if (e.modeT <= 0) back(e, S); return;
    case 'cloakTell': e.vx = 0; e.vy = 0; if (Math.random() < dt * 30) w.dust(e.x + (Math.random() - 0.5) * 40, e.y - 10 + (Math.random() - 0.5) * 20, 1);
      if (e.modeT <= 0) { S.cloak = HQ.cloakT.t; e.cloak = S.cloak; S.n.cloak++; w.sound('cloak'); w.number(e.x, e.y - HQ.h - 18, HQ_SAY.cloak, '#ff9a5c'); if (!S.told.cloak) { S.told.cloak = 1; w.say('HER SWARM CLOAKS HER: SMOKE UNDER HER SCATTERS IT.'); } back(e, S); }
      return;
    default: back(e, S);
  }
}
const back = (e, S) => { e.mode = 'rejoin'; e.modeT = 2.2; };
function pickP2(e, S, P, w) {
  const last = S.last, twice = k => last.length >= 2 && last[0] === k && last[1] === k;
  const pool = ['dive', 'dive', 'volley']; if (S.cloak <= 0 && last[0] !== 'cloak' && last[1] !== 'cloak') pool.push('cloak');
  let k = pool[(Math.random() * pool.length) | 0]; if (twice(k)) k = k === 'dive' ? 'volley' : 'dive';
  last.unshift(k); last.length = Math.min(last.length, 3); S.act++; S.n[k]++;
  S.loop.dir = -S.loop.dir;   /* (the next laps go the other way round: each side's comb is in her low pass in turn) */
  if (k === 'dive') { S.dives++; e.held = S.dives % HQ.dive.heldEvery === 0; if (e.held) S.n.held++; e.heldSaid = false; e.mode = 'aim'; e.modeT = HQ.dive.aim[1] + (e.held ? HQ.dive.held : 0); w.mark('!'); w.sound('aim'); }
  else if (k === 'volley') { e.mode = 'volleyTell'; e.modeT = HQ.volley.tell; w.mark('!'); w.sound('volleyTell'); }
  else { e.mode = 'cloakTell'; e.modeT = HQ.cloakT.tell; w.mark('!!'); w.sound('cloakTell'); }
}
/* PINNED: a comb comes down on her - grounded under it. Over an opening (STUCK, DAZED, STAGGERED) it TURNS that opening into the pin */
function pinHer(e, S, w, what, id) {
  if (S.ward > 0 || e.mode === 'pinned' || e.mode === 'thrash' || e.mode === 'tearTell' || e.mode === 'tear' || e.mode === 'enter') return false;
  const big = what === 'last';
  e.mode = 'pinned'; e.modeT = big ? HQ.pin.last : HQ.pin.t; e.openT0 = e.modeT; e.vx = 0; e.vy = 0; e.y = S.G.h.floor; S.purse = e.maxHp * (big ? HQ.pin.capLast : HQ.pin.cap);
  S.cloak = 0; e.cloak = 0; S.n.pinned++; S.n[big ? 'pinLast' : 'pinComb']++; S.act++; S.pinned = { what, id };
  w.sound('pinned'); w.shake(big ? 10 : 7); w.fx('open', e.x, e.y); w.number(e.x, e.y - HQ.h - 20, big ? HQ_SAY.last : HQ_SAY.pinned, '#ffd36b'); return true;
}
/* the smoke: the hands ask the level (src/hornets-nest-hands.js smokeUnder) every frame while she is low enough to feel it */
/* SHE FEELS IT ONLY WHEN SHE COMES LOW: her dive and its pull-up, her sweep, and (P2) the low pass of her loop - never hanging high over you (a pot held up under her hover does nothing) */
export const feelsSmoke = e => e.mode === 'dive' || e.mode === 'skim' || e.mode === 'sweep' || e.mode === 'sweepTell' || e.mode === 'circle' || e.mode === 'rejoin';
