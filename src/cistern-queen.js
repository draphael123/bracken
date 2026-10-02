// src/cistern-queen.js - THE CISTERN QUEEN, THE WELL TOWN's boss (claude/welltown3; Daniel 2026-10-02 after playing the greybox: the Bandit King
// "feels like a mini" and is "way too easy"). A giant scorpion matriarch nested in the dry cistern under the Kasbah: she is why the wells fail, and
// the Old Stinger in the cisterns is her brood. Her fight is the level's verb at its hardest: WATER IS CARRIED, and every opening is water.
//
// THE HALL (stageCisternQueen): forty tiles of dry cistern under the street, fifteen rows high. The old well's SHAFT comes down through the vault in
// the middle (you drop in by it); under it a dry SUMP two rows deep. A stone LEDGE high on each wall, a rope ladder up to it, a spring BASIN under
// each ledge (fill your skin), and THE WINDLASS on the floor west of the sump: strike it and the shaft's great bucket comes down and empties into the
// sump (it winds itself back up in CQ.bucketCd).
//
// THREE PHASES, every blow told (src/marks.js rows: a yellow ! the shield turns, a red !! nothing does), every cycle a different order, and she always
// fights (a gap between blows is a walk at you):
//   P1 THE SAND (to 2/3)   on the floor: PINCER SNAP (!), SNAP-SNAP-LUNGE (! ! !!), TAIL LANCE (!!: the stinger stabs the floor where you stand),
//                          SAND FLICK (!: three stones arcing at you); and under it: she BURROWS - a mound runs at you - SAND STRIKE (!!: she erupts
//                          under you) or BURROW CHARGE (!!: a dune wave ploughs along the floor). OPEN: FLOOD HER BURROW - pour your skin on the
//                          mound, or strike the windlass while the mound is by the sump - and she bursts out SOAKED, slow and open (CQ.openT).
//   P2 THE WELL SHAFT (to 1/3)  she climbs: she clings low on a wall, under its ledge, or hangs in the shaft. VENOM SPIT (!: a lob, a poison puddle),
//                          TAIL SWEEP high or low (!!: a lit band runs the length of the floor - duck the high, jump the low, or be up on a ledge),
//                          WALL SLAM (!!: rubble falls where the shadows are), STINGER PIN (!!: she lunges at your spot; dodged, the stinger sticks
//                          in the floor), DROP POUNCE (!!: from the shaft, a shadow growing under you), SKITTER AMBUSH (!!: into a side tunnel, and
//                          out of one at you along the floor - the dust trickling over a tunnel tells which). OPEN: POUR ON THE WALL ABOVE HER from
//                          her wall's ledge (or the bucket down the shaft while she hangs in it) - she loses her grip and lands on her back.
//   P3 THE FLOOD (to 0)    the shaft's wall breaks and the cistern floods; her BROOD pours in. WAVE THRASH (!!: jump the waves), GRAB AND STING (!!:
//                          her claw shoots out - dodge it, or strike the claw as it comes, or mash out once caught; a broken grab and she REARS,
//                          flailing - OPEN; held to the end, the sting), DEATH ROLL (!!: she rolls through the water at you - jump or roll),
//                          TIDAL TAIL (!!: a venom-water whip at head height - duck, or be above it), BROOD SHIELD (she calls up to three one-blow
//                          brood and keeps behind them; the deep water of the sump drowns them). ENRAGED under CQ.enrage: SNAP-SNAP-STING into the
//                          DEATH ROLL.
// ALWAYS: her RAISED CLAWS turn every frontal blow outside an opening (a visible guard; from behind it is the global x0.05 chip); greed is answered by
// the global reprisal (src/boss-greed.js OPEN_RULE.cisternqueen is her three openings); her VENOM stacks slow your stamina (CQ.venom).
//
// PURE: no DOM, no main.js. The world is a context `c` (src/cistern-queen-hands.js binds it). queenPlan is the boss lab's HUMAN bot (src/lab.js).

export const CQ = {
  hp: 1000, w: 76, h: 38, markH: 78,
  openMul: 2.2, openT: 3.2,                       /* her three openings (SOAKED, ON HER BACK, REARING): >= 3 s (tools/boss-openings.mjs), the blow x openMul */
  p2: 2 / 3, p3: 1 / 3, enrage: 0.15,
  walk: 62, keep: 40, turn: 0.45,                  /* she walks you down; she turns to face you only between blows, and only after you have been behind her this long */
  gap: [0.55, 0.45, 0.4], gapEnraged: 0.25,        /* the breath between blows, by phase */
  /* P1 */
  pincerTell: 0.6, pincerT: 0.18, pincerReach: 50,
  snapTell: 0.5, snap2Tell: 0.38, snapT: 0.15, lungeTell: 0.6, lungeT: 0.32, lungeDist: 84,
  lanceTell: 0.75, lanceT: 0.22,
  flickTell: 0.6, flickFly: 0.75,
  diveT: 0.6, moundSpeed: 120, moundMax: 2.6, strikeTell: 0.85, strikeT: 0.35, strikeR: 26, surfaceT: 0.5,
  chargeTell: 0.85, waveSpeed: 270,
  /* P2 */
  climbT: 1.0, clingGap: 0.85,
  spitTell: 0.6, spitFly: 0.8, puddleT: 3.5, puddleTick: 0.5,
  sweepTell: 0.85, sweepSpeed: 520,
  slamTell: 0.75, rubbleFall: 0.85, rubbleR: 18,
  pinTell: 0.75, pinT: 0.32, pinStuck: 1.3,
  pounceTell: 0.95, pounceT: 0.25, pounceR: 32,
  ambushTell: 0.95, ambushSpeed: 300,
  /* P3 */
  floodT: 2.2, waterH: 18,
  waveTell: 0.75, thrashSpeed: 230,
  grabTell: 0.8, grabT: 0.26, grabReach: 74, grabHold: 1.35, snare: 2.6,
  rollTell: 0.75, rollSpeed: 290,
  tidalTell: 0.85, tidalT: 0.3, tidalReach: 210,
  broodTell: 0.8, broodN: 3, broodHp: 1,
  stingTell: 0.5, stingT: 0.2,
  /* the windlass and the shaft's bucket */
  bucketFall: 0.55, bucketCd: 7.0, bucketR: 72,
  /* her venom: each stack slows your stamina by `slow`, and lasts `t` */
  venom: { max: 3, slow: 0.25, t: 6 },
  dmg: { pincer: 14, snap: 12, lunge: 18, lance: 20, flick: 8, strike: 22, charge: 16, spit: 9, puddle: 3, sweep: 15, slam: 15, pin: 19, pounce: 22,
    ambush: 17, wave: 13, grab: 6, sting: 30, roll: 20, tidal: 15, brood: 0 },
};
/* EVERY CYCLE CHANGES: the order of each pass, by phase (cycle k uses [k % n]; a cycle ends with the blow that holds her opening) */
export const CYCLES = {
  1: [['pincer', 'flick', 'burrow:strike'], ['snapsnap', 'lance', 'burrow:charge'], ['flick', 'pincer', 'snapsnap', 'burrow:strike'], ['lance', 'snapsnap', 'flick', 'burrow:charge']],
  2: [['wall:W', 'spit', 'sweep:low', 'pin', 'shaft', 'pounce'], ['wall:E', 'sweep:high', 'slam', 'ambush'], ['wall:W', 'slam', 'spit', 'sweep:high', 'pin'],
      ['wall:E', 'spit', 'sweep:low', 'shaft', 'pounce'], ['wall:W', 'sweep:low', 'sweep:high', 'ambush']],
  3: [['wave', 'grab', 'roll'], ['brood', 'tidal', 'grab'], ['roll', 'wave', 'tidal', 'grab'], ['tidal', 'grab', 'wave', 'brood']],
  enraged: ['combo', 'grab', 'tidal', 'combo', 'wave', 'grab'],
};
/* THE MOVES: the mode while it is told, the mark, the answer, the height (src/marks.js keeps the same rows: tools/cistern-queen.mjs holds them equal) */
export const MOVES = {
  pincerTell: { mark: '!', answer: 'block', h: 'low' },
  snapTell: { mark: '!', answer: 'block', h: 'low' }, snap2Tell: { mark: '!', answer: 'block', h: 'low' }, lungeTell: { mark: '!!', answer: 'dodge', h: 'low' },
  lanceTell: { mark: '!!', answer: 'jump', h: 'low' }, flickTell: { mark: '!', answer: 'block', h: 'low' },
  strikeTell: { mark: '!!', answer: 'dodge', h: 'low' }, chargeTell: { mark: '!!', answer: 'jump', h: 'low' },
  spitTell: { mark: '!', answer: 'block', h: 'low' }, sweepLowTell: { mark: '!!', answer: 'jump', h: 'low' }, sweepHighTell: { mark: '!!', answer: 'duck', h: 'high' },
  slamTell: { mark: '!!', answer: 'dodge', h: 'low' }, pinTell: { mark: '!!', answer: 'dodge', h: 'low' }, pounceTell: { mark: '!!', answer: 'dodge', h: 'low' },
  ambushTell: { mark: '!!', answer: 'jump', h: 'low' },
  waveTell: { mark: '!!', answer: 'jump', h: 'low' }, grabTell: { mark: '!!', answer: 'dodge', h: 'low' }, rollTell: { mark: '!!', answer: 'jump', h: 'low' },
  tidalTell: { mark: '!!', answer: 'duck', h: 'high' }, barbTell: { mark: '!!', answer: 'dodge', h: 'low' },
  diveTell: { mark: '', answer: '', h: '' }, climbTell: { mark: '', answer: '', h: '' }, floodTell: { mark: '', answer: '', h: '' }, broodTell: { mark: '', answer: '', h: '' },
};
export const MOVE_NAME = { pincer: 'HER PINCER', snap: 'HER PINCERS', lunge: 'THE LUNGE', lance: 'HER STINGER', flick: 'THE SAND', strike: 'SHE ERUPTS', charge: 'THE DUNE WAVE',
  spit: 'HER VENOM', puddle: 'THE VENOM', sweep: 'HER TAIL', slam: 'THE RUBBLE', pin: 'HER STINGER', pounce: 'SHE DROPS', ambush: 'SHE SKITTERS',
  wave: 'THE WAVE', grab: 'HER CLAW', sting: 'THE STING', roll: 'THE DEATH ROLL', tidal: 'THE TIDAL TAIL' };
/* blows whose hit carries her venom (a stack each) */
export const VENOMOUS = new Set(['lance', 'spit', 'puddle', 'pin', 'sting', 'tidal']);

/* ---------- THE HALL ---------- */
export const STAGE = { W: 40, H: 15, shaft: [18, 21], sump: [17, 22], ledge: 6, ledgeRow: 7, ladder: 6, basin: 3, windlass: 14, door: 6 };
/* sx: the hall's first column; F: its floor row (solid; you stand on row F-1); top: the street row the shaft comes down from. W = { set, block, ent, air } */
export function stageCisternQueen(W, T, TS, sx, F, top) {
  const { set, block, ent, air } = W, ex = sx + STAGE.W, vault = F - STAGE.H - 1;
  air(sx, ex - 1, vault + 1, F - 1);                                                      /* the hall */
  air(sx + STAGE.shaft[0], sx + STAGE.shaft[1], top, vault);                              /* the old well's shaft, from the street down through the vault */
  air(sx + STAGE.sump[0], sx + STAGE.sump[1], F, F + 1);                                  /* the dry sump under it, a GRATE over it at the floor (you walk on it; the brood that wade in over it drown, once she floods the hall) */
  for (let x = sx + STAGE.sump[0]; x <= sx + STAGE.sump[1]; x++) set(x, F, T.ONEWAY);
  const lr = F - STAGE.ledgeRow - 1;                                                      /* the ledges' row (boards) */
  for (let x = sx; x < sx + STAGE.ledge; x++) set(x, lr, T.ONEWAY);
  for (let x = ex - STAGE.ledge; x < ex; x++) set(x, lr, T.ONEWAY);
  const ladders = [[sx + STAGE.ladder, lr, F - 1], [ex - 1 - STAGE.ladder, lr, F - 1]];    /* (hung last by the level, over what is carved) */
  ent('skinwell', sx + STAGE.basin, F - 1, { arena: true, basin: true });                 /* the springs: the only water down here until she floods it */
  ent('skinwell', ex - 1 - STAGE.basin, F - 1, { arena: true, basin: true });
  ent('qwindlass', sx + STAGE.windlass, F - 1, {});
  ent('cisternqueen', sx + 28, F - 1, { face: -1 });
  const arena = { x0: sx * TS, x1: ex * TS, floor: F * TS, trigger: (sx + 4) * TS, wallL: sx - 1, wallR: ex, boss: 'cisternqueen', music: 'cisternqueen',
    tint: '#9ab0c0', tintA: 0.08, start: [sx + 9, F - 1], y0: (vault - 2) * TS, y1: (F + 2) * TS, queen: { sx, F, vault, top, lr } };
  return { arena, ladders };
}
/* the hall in world px, from the arena */
export function geom(A, TS = 16) {
  const q = A.queen, sx = q.sx, ex = sx + STAGE.W, x0 = sx * TS, x1 = ex * TS;
  return { x0, x1, floor: q.F * TS, vault: (q.vault + 1) * TS, mid: (sx + STAGE.W / 2) * TS, ledgeY: q.lr * TS,
    ledgeW: [x0, (sx + STAGE.ledge) * TS], ledgeE: [(ex - STAGE.ledge) * TS, x1], ladderW: (sx + STAGE.ladder) * TS + 8, ladderE: (ex - 1 - STAGE.ladder) * TS + 8,
    basinW: (sx + STAGE.basin) * TS + 8, basinE: (ex - 1 - STAGE.basin) * TS + 8, sump: [(sx + STAGE.sump[0]) * TS, (sx + STAGE.sump[1] + 1) * TS],
    shaft: [(sx + STAGE.shaft[0]) * TS, (sx + STAGE.shaft[1] + 1) * TS], windlass: (sx + STAGE.windlass) * TS + 8, wallX: { W: x0, E: x1 } };
}

/* ---------- ONE FIGHT ---------- */
export function newShow(G) {
  return { G, cycle: 0, ph: 1, step: 0, script: null, moveT: 0, gap: 1.0, pose: 'floor', wall: null, behindT: 0, act: 0,
    mound: null, shots: [], bands: [], rubble: [], puddles: [], bucket: { st: 'up', t: 0 }, water: 0, flood: false, brood: [], claw: null, held: null,
    told: {}, n: { cycles: 0, opens: 0, soaked: 0, fallen: 0, rear: 0, pours: 0, wasted: 0, buckets: 0, bucketHits: 0, grabs: 0, caught: 0, broken: 0, countered: 0, stung: 0,
      drowned: 0, guarded: 0, moves: {} } };
}
export const qPhase = e => (e.hp <= e.maxHp * CQ.p3 ? 3 : e.hp <= e.maxHp * CQ.p2 ? 2 : 1);
export const qOpen = e => !!e && (e.open || 0) > 0 && (e.mode === 'soaked' || e.mode === 'fallen' || e.mode === 'rear');
export const qTake = e => (qOpen(e) ? CQ.openMul : 1);
export const enraged = e => !!e && e.hp <= e.maxHp * CQ.enrage;
/* IS A BLOW FROM x IN FRONT OF HER? (her claws face e.face; on a wall they face the hall) */
export const frontal = (e, x) => (e.face || 1) * (x - e.x) > -(CQ.w * 0.25);
/* THE GUARD: a frontal blow outside an opening is turned by her raised claws (0); one from behind is left to the global chip */
export const guarded = (e, x) => !qOpen(e) && e.mode !== 'sleep' && e.mode !== 'wake' && frontal(e, x);

const nextScript = (S, e) => { const ph = S.ph; if (ph === 3 && enraged(e)) return CYCLES.enraged.slice(); const set = CYCLES[ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, ducking, onLedge: 'W'|'E'|null, pp }], c = the world:
   c.hit(box, dmg, name, o)  c.band(kind, [t, b], x0, x1, dmg, name, key, o)  c.number(e.x, e.y - 70, line, col)  c.mark('!'|'!!')  c.sound(k)  c.fx(kind, x, y)
   c.spawnBrood(x, y) -> enemy   c.snare(h, t)   c.free(h) -> true when the hero is free   c.water(depth) ---------- */
export function stepQueen(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; S.moveT += dt;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  stepShots(e, S, dt, h, c); stepBands(e, S, dt, c); stepRubble(e, S, dt, c); stepPuddles(e, S, dt, c); stepBucket(e, S, dt, c); stepBrood(e, S, dt, c);
  if (S.flood && S.water < CQ.waterH) { S.water = Math.min(CQ.waterH, S.water + 14 * dt); c.water(S.water); }
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S, e); S.step = 0; setMode(e, 'walk', 0.9); } return; }
  /* THE PHASES: a new one waits for the blow in hand to finish (and never cuts an opening short) */
  const want = qPhase(e);
  if (want > S.ph && !qOpen(e) && isIdle(e)) { S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want;
    if (want === 2) { clearFloor(S); setMode(e, 'climbTell', CQ.climbT); c.number(e.x, e.y - 70, 'SHE CLIMBS THE WALLS', '#ffd36b'); c.sound('climb'); c.music && c.music(2); return; }
    if (want === 3) { clearFloor(S); S.pose = 'floor'; e.gone = 0; e.y = G.floor; e.x = Math.max(G.x0 + 40, Math.min(G.x1 - 40, e.x)); e.face = Math.sign(P.x - e.x) || e.face; setMode(e, 'floodTell', CQ.floodT); c.number(e.x, e.y - 70, 'THE CISTERN FLOODS: HER BROOD COMES', '#ffd36b'); c.sound('flood'); c.music && c.music(3); return; } }
  switch (e.mode) {
    /* ---- the openings: she lies there; when it is over she gets up (and the cycle goes on) ---- */
    case 'soaked': case 'fallen': case 'rear':
      if (e.mode === 'rear') e.x += Math.sin(S.moveT * 20) * 0.4;
      if (e.open <= 0) { setMode(e, 'recover', 0.55); if (S.pose !== 'floor') S.pose = 'floor'; }
      return;
    case 'recover': e.gone = 0; if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'climbTell': if (e.modeT <= 0) { S.script = nextScript(S, e); S.step = 0; nextMove(e, S, P, c); } return;
    case 'floodTell': if (e.modeT <= 0) { S.flood = true; S.script = nextScript(S, e); S.step = 0; nextMove(e, S, P, c); } return;
    case 'walk': {
      if (S.pose === 'floor') { const d = P.x - e.x, ad = Math.abs(d);
        if ((e.face || 1) * d < -10) { S.behindT += dt; if (S.behindT > CQ.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
        if (ad > CQ.keep + (S.keepBack || 0)) e.x += Math.sign(d) * CQ.walk * dt * (S.flood ? 0.8 : 1);
        e.x = Math.max(G.x0 + 40, Math.min(G.x1 - 40, e.x)); }
      if (e.modeT <= 0) nextMove(e, S, P, c);
      return; }
  }
  stepMove(e, S, dt, P, h, c);
}
const IDLE = new Set(['walk', 'recover']);
const isIdle = e => IDLE.has(e.mode) || (e.mode === 'cling' && e.modeT > 0);
function clearFloor(S) { S.mound = null; S.bands = []; S.claw = null; }

/* THE NEXT BLOW OF THE SCRIPT (a script spent is the next cycle: EVERY CYCLE CHANGES) */
function nextMove(e, S, P, c) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S, e); S.step = 0; }
  const m = S.script[S.step++], [k, arg] = m.split(':'), G = S.G;
  S.n.moves[k] = (S.n.moves[k] || 0) + 1; S.act++; S.cur = { k, arg, id: S.act };
  if (S.pose === 'floor' && k !== 'wall' && k !== 'shaft') e.face = Math.sign(P.x - e.x) || e.face;
  switch (k) {
    case 'pincer': return tell(e, 'pincerTell', CQ.pincerTell, c);
    case 'snapsnap': return tell(e, 'snapTell', CQ.snapTell, c);
    case 'combo': S.cur.combo = true; return tell(e, 'snapTell', CQ.snapTell * 0.85, c);
    case 'lance': S.cur.x = P.x; return tell(e, 'lanceTell', CQ.lanceTell, c);
    case 'flick': S.cur.x = P.x; return tell(e, 'flickTell', CQ.flickTell, c);
    case 'burrow': S.cur.how = arg; setMode(e, 'diveTell', CQ.diveT); c.sound('dig'); return;
    case 'wall': S.from = [e.x, e.y]; S.wall = arg; S.pose = 'wall'; e.gone = 0; setMode(e, 'climb', 0.7); c.sound('climb'); return;
    case 'shaft': S.from = [e.x, e.y]; S.pose = 'shaft'; setMode(e, 'climb', 0.7); e.gone = 1; c.sound('climb'); return;
    case 'spit': return tell(e, 'spitTell', CQ.spitTell, c);
    case 'sweep': S.cur.high = arg === 'high'; return tell(e, arg === 'high' ? 'sweepHighTell' : 'sweepLowTell', CQ.sweepTell, c);
    case 'slam': S.cur.spots = [P.x, P.x - 52, P.x + 52].map(x => Math.max(G.x0 + 12, Math.min(G.x1 - 12, x))); S.cur.ledge = !!(P.onLedge); return tell(e, 'slamTell', CQ.slamTell, c);
    case 'pin': S.cur.x = P.x; S.cur.y = P.y; return tell(e, 'pinTell', CQ.pinTell, c);
    case 'pounce': S.cur.x = Math.max(G.x0 + 40, Math.min(G.x1 - 40, P.x)); return tell(e, 'pounceTell', CQ.pounceTell, c);
    case 'ambush': S.cur.side = P.x < G.mid ? 'W' : 'E'; S.pose = 'tunnel'; e.gone = 1; return tell(e, 'ambushTell', CQ.ambushTell, c);
    case 'wave': return tell(e, 'waveTell', CQ.waveTell, c);
    case 'grab': return tell(e, 'grabTell', CQ.grabTell, c);
    case 'roll': S.cur.dir = Math.sign(P.x - e.x) || 1; return tell(e, 'rollTell', CQ.rollTell, c);
    case 'tidal': return tell(e, 'tidalTell', CQ.tidalTell, c);
    case 'brood': setMode(e, 'broodTell', CQ.broodTell); c.sound('call'); return;
  }
}
function tell(e, mode, t, c) { setMode(e, mode, t); const m = MOVES[mode]; if (m && m.mark) { c.mark(m.mark); c.sound(m.mark === '!' ? 'tell' : 'tellHard'); } }
function placeWall(e, S) { const G = S.G, w = S.wall; e.x = w === 'W' ? G.x0 + 20 : G.x1 - 20; e.y = G.floor - 4; e.face = w === 'W' ? 1 : -1; }
/* what comes after a blow: the gap (she walks at you on the floor; on a wall she CLINGS - the pour's window - in the shaft she hangs) */
function after(e, S) {
  const g = (S.gapK || 1) * (e.hp <= e.maxHp * CQ.enrage ? CQ.gapEnraged : CQ.gap[S.ph - 1]);
  if (S.pose === 'wall') setMode(e, 'cling', CQ.clingGap); else if (S.pose === 'shaft') setMode(e, 'hang', g); else setMode(e, 'walk', g);
}

/* ---------- THE BLOWS ---------- */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, cur = S.cur || {}, F = G.floor, fx = (e.face || 1), key = 'cq' + cur.id;
  const front = (reach, top = 34) => fx > 0 ? [e.x + CQ.w / 2 - 8, e.x + CQ.w / 2 + reach, F - top, F] : [e.x - CQ.w / 2 - reach, e.x - CQ.w / 2 + 8, F - top, F];
  switch (e.mode) {
    case 'cling': case 'hang': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'climb': { const to = S.pose === 'wall' ? [S.wall === 'W' ? G.x0 + 20 : G.x1 - 20, G.floor - 4] : [G.mid, G.vault + 70], k = Math.min(1, 1 - Math.max(0, e.modeT) / 0.7), fr0 = S.from || to;
      e.x = fr0[0] + (to[0] - fr0[0]) * k; e.y = fr0[1] + (to[1] - fr0[1]) * k; if (S.pose === 'wall') e.face = S.wall === 'W' ? 1 : -1;
      if (e.modeT <= 0) { if (S.pose === 'wall') placeWall(e, S); nextMove(e, S, P, c); } return; }
    /* P1: on the floor */
    case 'pincerTell': if (e.modeT <= 0) setMode(e, 'pincer', CQ.pincerT); return;
    case 'pincer': c.hit(front(CQ.pincerReach), CQ.dmg.pincer, MOVE_NAME.pincer, { key, blockable: true }); if (e.modeT <= 0) after(e, S); return;
    case 'snapTell': if (e.modeT <= 0) setMode(e, 'snap', CQ.snapT); return;
    case 'snap': c.hit(front(44), CQ.dmg.snap, MOVE_NAME.snap, { key: key + 'a', blockable: true }); if (e.modeT <= 0) tell(e, 'snap2Tell', CQ.snap2Tell, c); return;
    case 'snap2Tell': if (e.modeT <= 0) setMode(e, 'snap2', CQ.snapT); return;
    case 'snap2': c.hit(front(44), CQ.dmg.snap, MOVE_NAME.snap, { key: key + 'b', blockable: true }); if (e.modeT <= 0) cur.combo ? tell(e, 'barbTell', CQ.stingTell, c) : tell(e, 'lungeTell', CQ.lungeTell, c); return;
    case 'lungeTell': if (e.modeT <= 0) { setMode(e, 'lunge', CQ.lungeT); c.sound('lunge'); } return;
    case 'lunge': { const v = CQ.lungeDist / CQ.lungeT; e.x = Math.max(G.x0 + 40, Math.min(G.x1 - 40, e.x + fx * v * dt)); c.hit(front(30, 30), CQ.dmg.lunge, MOVE_NAME.lunge, { key: key + 'c' }); if (e.modeT <= 0) after(e, S); return; }
    case 'barbTell': if (e.modeT <= 0) setMode(e, 'barb', CQ.stingT); return;
    case 'barb': c.hit(front(56, 44), CQ.dmg.sting * 0.7, MOVE_NAME.sting, { key: key + 's', venom: 1 }); if (e.modeT <= 0) { S.script.splice(S.step, 0, 'roll'); after(e, S); e.modeT = 0.15; } return;
    case 'lanceTell': if (e.modeT <= 0) { setMode(e, 'lance', CQ.lanceT); c.fx('lance', cur.x, F); c.sound('stab'); } return;
    case 'lance': c.hit([cur.x - 14, cur.x + 14, F - 22, F], CQ.dmg.lance, MOVE_NAME.lance, { key, venom: 1 }); if (e.modeT <= 0) after(e, S); return;
    case 'flickTell': if (e.modeT <= 0) { setMode(e, 'flick', 0.3); c.sound('flick');
      for (const dx of [-34, 0, 34]) { const tx = Math.max(G.x0 + 8, Math.min(G.x1 - 8, cur.x + dx)), sx0 = e.x + fx * 30, T = CQ.flickFly;
        S.shots.push({ k: 'stone', x: sx0, y: F - 30, vx: (tx - sx0) / T, vy: -(0.5 * 600 * T) + (30 / T), g: 600, key: key + dx, dmg: CQ.dmg.flick, name: MOVE_NAME.flick, blockable: true, t: T + 0.3 }); } } return;
    case 'flick': if (e.modeT <= 0) after(e, S); return;
    /* P1: under the sand */
    case 'diveTell': if (e.modeT <= 0) { e.gone = 1; S.pose = 'burrow'; S.mound = { x: e.x, t: 0, wet: 0 }; setMode(e, 'burrow', CQ.moundMax); c.fx('dig', e.x, F); } return;
    case 'burrow': { const m = S.mound; if (!m) { setMode(e, 'recover', 0.4); return; } m.t += dt;
      if (cur.how === 'charge') { const tx = P.x < G.mid ? G.x1 - 70 : G.x0 + 70, d = tx - m.x; m.x += Math.sign(d) * Math.min(Math.abs(d), CQ.moundSpeed * 1.3 * dt);
        if (Math.abs(d) < 4 || e.modeT <= 0) { cur.dir = Math.sign(P.x - m.x) || 1; tell(e, 'chargeTell', CQ.chargeTell, c); } }
      else { const d = P.x - m.x; m.x += Math.sign(d) * Math.min(Math.abs(d), CQ.moundSpeed * dt); m.x = Math.max(G.x0 + 20, Math.min(G.x1 - 20, m.x));
        if ((Math.abs(d) < 8 && P.ground) || e.modeT <= 0) { cur.x = m.x; tell(e, 'strikeTell', CQ.strikeTell, c); } }
      e.x = m.x; return; }
    case 'strikeTell': if (e.modeT <= 0) { setMode(e, 'strike', CQ.strikeT); c.sound('erupt'); c.fx('erupt', cur.x, F); surface(e, S, cur.x); } return;
    case 'strike': c.hit([cur.x - CQ.strikeR, cur.x + CQ.strikeR, F - 52, F], CQ.dmg.strike, MOVE_NAME.strike, { key, launch: true }); if (e.modeT <= 0) after(e, S); return;
    case 'chargeTell': if (e.modeT <= 0) { const m = S.mound; S.bands.push({ k: 'dune', x: m ? m.x : e.x, dir: cur.dir, speed: CQ.waveSpeed, y: [F - 20, F], dmg: CQ.dmg.charge, name: MOVE_NAME.charge, key, kind: 'low', rider: true });
      setMode(e, 'charge', 4); c.sound('plough'); } return;
    case 'charge': { const b = S.bands.find(q => q.rider); if (b) { e.x = b.x; if (S.mound) S.mound.x = b.x; } if (!b || e.modeT <= 0) { surface(e, S, e.x); setMode(e, 'surface', CQ.surfaceT); } return; }
    case 'surface': if (e.modeT <= 0) after(e, S); return;
    /* P2: on the walls, in the shaft */
    case 'spitTell': if (e.modeT <= 0) { setMode(e, 'spit', 0.25); c.sound('spit');
      const sx0 = e.x + (S.pose === 'wall' ? fx * 16 : 0), sy0 = e.y - 60, T = CQ.spitFly, tx = P.x, ty = P.y - 4;
      S.shots.push({ k: 'venom', x: sx0, y: sy0, vx: (tx - sx0) / T, vy: (ty - sy0) / T - 0.5 * 500 * T, g: 500, key, dmg: CQ.dmg.spit, name: MOVE_NAME.spit, blockable: true, venom: 1, puddle: true, t: T + 0.6 }); } return;
    case 'spit': if (e.modeT <= 0) after(e, S); return;
    case 'sweepLowTell': case 'sweepHighTell': if (e.modeT <= 0) { const from = S.pose === 'wall' ? (S.wall === 'W' ? G.x0 : G.x1) : e.x, dir = from < G.mid ? 1 : -1;
      S.bands.push({ k: cur.high ? 'tailHigh' : 'tailLow', x: from, dir, speed: CQ.sweepSpeed, y: cur.high ? [F - 30, F - 13] : [F - 12, F], dmg: CQ.dmg.sweep, name: MOVE_NAME.sweep, key, kind: cur.high ? 'high' : 'low' });
      setMode(e, cur.high ? 'sweepHigh' : 'sweepLow', 0.5); c.sound('sweep'); } return;
    case 'sweepLow': case 'sweepHigh': if (e.modeT <= 0) after(e, S); return;
    case 'slamTell': if (e.modeT <= 0) { setMode(e, 'slam', 0.4); c.sound('slam'); c.shake(4);
      for (const x of cur.spots) S.rubble.push({ x, t: CQ.rubbleFall, y0: G.vault, key: key + x, ledge: false });
      if (cur.ledge) for (const L of ['W', 'E']) { const r = L === 'W' ? G.ledgeW : G.ledgeE; S.rubble.push({ x: (r[0] + r[1]) / 2, t: CQ.rubbleFall, y0: G.vault, key: key + L, ledge: true }); } } return;
    case 'slam': if (e.modeT <= 0) after(e, S); return;
    case 'pinTell': if (e.modeT <= 0) { setMode(e, 'pin', CQ.pinT); S.pose = 'floor'; e.gone = 0; cur.fx = e.x; cur.fy = e.y; c.sound('lunge'); } return;
    case 'pin': { const k = 1 - Math.max(0, e.modeT) / CQ.pinT; e.x = cur.fx + (cur.x - cur.fx) * k; e.y = cur.fy + (G.floor - cur.fy) * k; e.face = Math.sign(cur.x - cur.fx) || e.face;
      c.hit([e.x - 26, e.x + 26, e.y - 30, e.y], CQ.dmg.pin, MOVE_NAME.pin, { key, venom: 1 }); if (e.modeT <= 0) { e.x = cur.x; e.y = G.floor; setMode(e, 'pinned', CQ.pinStuck); c.fx('stuck', e.x, G.floor); c.number(e.x, e.y - 70, 'HER STINGER STICKS', '#9aa39a'); } return; }
    case 'pinned': if (e.modeT <= 0) { S.script.splice(S.step, 0, 'wall:' + (e.x < G.mid ? 'W' : 'E')); setMode(e, 'recover', 0.2); } return;
    case 'pounceTell': if (e.modeT <= 0) { setMode(e, 'pounce', CQ.pounceT); e.x = cur.x; c.sound('drop'); } return;
    case 'pounce': { const k = 1 - Math.max(0, e.modeT) / CQ.pounceT; e.y = G.vault + 70 + (G.floor - G.vault - 70) * k; e.gone = k < 0.6 ? 1 : 0;
      if (k > 0.55) c.hit([cur.x - CQ.pounceR, cur.x + CQ.pounceR, G.floor - 40, G.floor], CQ.dmg.pounce, MOVE_NAME.pounce, { key });
      if (e.modeT <= 0) { e.y = G.floor; e.gone = 0; S.pose = 'floor'; c.shake(5); c.fx('land', e.x, G.floor); S.script.splice(S.step, 0, 'wall:' + (e.x < G.mid ? 'E' : 'W')); setMode(e, 'recover', 0.45); } return; }
    case 'ambushTell': if (e.modeT <= 0) { const from = cur.side === 'W' ? G.x0 + 10 : G.x1 - 10; e.x = from; e.y = G.floor; e.face = cur.side === 'W' ? 1 : -1; e.gone = 0; S.pose = 'floor';
      setMode(e, 'ambush', 3); c.sound('skitter'); } return;
    case 'ambush': { e.x += (e.face || 1) * CQ.ambushSpeed * dt; c.hit([e.x - 30, e.x + 30, G.floor - 26, G.floor], CQ.dmg.ambush, MOVE_NAME.ambush, { key });
      if (e.x < G.x0 + 30 || e.x > G.x1 - 30 || e.modeT <= 0) { e.x = Math.max(G.x0 + 40, Math.min(G.x1 - 40, e.x)); S.script.splice(S.step, 0, 'wall:' + (e.x < G.mid ? 'W' : 'E')); setMode(e, 'recover', 0.35); } return; }
    /* P3: in the flood */
    case 'waveTell': if (e.modeT <= 0) { for (const dir of [-1, 1]) S.bands.push({ k: 'wave', x: e.x + dir * 30, dir, speed: CQ.thrashSpeed, y: [F - 18, F], dmg: CQ.dmg.wave, name: MOVE_NAME.wave, key: key + dir, kind: 'low' });
      setMode(e, 'wave', 0.45); c.sound('thrash'); c.fx('splash', e.x, F); } return;
    case 'wave': if (e.modeT <= 0) after(e, S); return;
    case 'grabTell': if (e.modeT <= 0) { setMode(e, 'grab', CQ.grabT); S.n.grabs++; S.claw = { x: e.x + fx * (CQ.w / 2), reach: 0, key, caught: null }; c.sound('snap'); } return;
    case 'grab': { const cl = S.claw; if (!cl) { after(e, S); return; } cl.reach = Math.min(CQ.grabReach, cl.reach + CQ.grabReach / CQ.grabT * dt * 1.2); cl.x = e.x + fx * (CQ.w / 2 + cl.reach);
      const got = c.grab([cl.x - 12, cl.x + 12, F - 30, F], cl.key); if (got) { cl.caught = got; S.n.caught++; setMode(e, 'hold', CQ.grabHold); c.number(e.x, e.y - 70, 'STRIKE THE CLAW THAT HOLDS YOU', '#ffd36b'); return; }
      if (e.modeT <= 0) { S.claw = null; after(e, S); } return; }
    case 'hold': { const cl = S.claw; if (!cl || !cl.caught) { setMode(e, 'recover', 0.3); return; }
      if (c.free(cl.caught)) { S.claw = null; S.n.broken++; openUp(e, S, 'rear', c); c.number(e.x, e.y - 70, 'THE GRAB IS BROKEN: SHE REARS. CUT HER', '#8fd160'); return; }
      c.holdAt(cl.caught, cl.x);
      if (e.modeT <= 0) { c.hit([cl.x - 30, cl.x + 30, F - 50, F + 4], CQ.dmg.sting, MOVE_NAME.sting, { key: key + 'st', venom: 2, held: cl.caught }); S.n.stung++; c.release(cl.caught); S.claw = null; c.sound('sting'); after(e, S); } return; }
    case 'rollTell': if (e.modeT <= 0) { setMode(e, 'roll', 3); c.sound('roll'); } return;
    case 'roll': { e.x += cur.dir * CQ.rollSpeed * dt; c.hit([e.x - 30, e.x + 30, F - 26, F], CQ.dmg.roll, MOVE_NAME.roll, { key }); c.fx('wake', e.x, F);
      if (e.x < G.x0 + 40 || e.x > G.x1 - 40 || e.modeT <= 0) { e.x = Math.max(G.x0 + 40, Math.min(G.x1 - 40, e.x)); e.face = -cur.dir; setMode(e, 'recover', 0.5); } return; }
    case 'tidalTell': if (e.modeT <= 0) { setMode(e, 'tidal', CQ.tidalT); c.sound('whip'); } return;
    case 'tidal': { const x0 = fx > 0 ? e.x : e.x - CQ.tidalReach, x1 = fx > 0 ? e.x + CQ.tidalReach : e.x;
      c.band('high', [F - 30, F - 12], x0, x1, CQ.dmg.tidal, MOVE_NAME.tidal, key, { venom: 1 }); if (e.modeT <= 0) after(e, S); return; }
    case 'broodTell': if (e.modeT <= 0) { const n = CQ.broodN - S.brood.filter(b => b.alive).length;
      for (let i = 0; i < n; i++) { const b = c.spawnBrood(e.x + fx * (34 + i * 18), G.floor); if (b) S.brood.push(b); }
      S.keepBack = 50; setMode(e, 'walk', 1.0); c.number(e.x, e.y - 70, 'HER BROOD: DROWN THEM IN THE SUMP', '#ffd36b'); } return;
  }
  if (e.modeT <= -2) after(e, S);   /* (a mode nothing above knows: never stand still) */
}
function surface(e, S, x) { e.gone = 0; S.pose = 'floor'; e.x = Math.max(S.G.x0 + 40, Math.min(S.G.x1 - 40, x)); S.mound = null; }

/* ---------- THE OPENINGS ---------- */
export function openUp(e, S, how, c) {
  const G = S.G; e.open = CQ.openT; S.n.opens++; S.n[how]++; setMode(e, how, CQ.openT + 0.05); e.gone = 0; S.bands = S.bands.filter(b => !b.rider);
  if (how === 'soaked') { if (S.mound) e.x = S.mound.x; S.mound = null; S.pose = 'floor'; e.y = G.floor; c.number(e.x, e.y - 70, 'FLOODED OUT: SHE IS SOAKED. CUT HER', '#8fd160'); c.sound('soak'); c.fx('burst', e.x, G.floor); }
  if (how === 'fallen') { e.x = S.pose === 'shaft' ? G.mid : S.wall === 'W' ? G.x0 + 52 : G.x1 - 52; e.y = G.floor; S.pose = 'floor'; c.number(e.x, e.y - 70, 'SHE LOSES HER GRIP: ON HER BACK. CUT HER', '#8fd160'); c.sound('fall'); c.shake(5); c.fx('land', e.x, G.floor);
    S.script.splice(S.step, 0, 'wall:' + (e.x < G.mid ? 'E' : 'W')); }
  if (how === 'rear') { c.sound('rear'); }
  e.x = Math.max(G.x0 + 40, Math.min(G.x1 - 40, e.x));
}
/* A POUR AT HER (the hero's E with a sip): what it lands on - her burrow's mound (P1), the wall above her from her ledge (P2) - or null when it
   would not reach her at all. hero = { x, y, face, onLedge } */
export function pourAim(e, S, hero) {
  if (!e || !e.alive || qOpen(e)) return null; const G = S.G;
  if (S.pose === 'burrow' && S.mound && (e.mode === 'burrow' || e.mode === 'strikeTell' || e.mode === 'chargeTell')) { const d = (S.mound.x - hero.x) * (hero.face || 1);
    if (d > -12 && d < 60 && Math.abs(hero.y - G.floor) < 20) return { x: S.mound.x, y: G.floor - 4, what: 'mound' }; }
  if (S.pose === 'wall' && S.wall && hero.onLedge === S.wall && (e.mode === 'cling' || /Tell$/.test(e.mode) || e.mode === 'climb')) return { x: S.wall === 'W' ? G.x0 + 8 : G.x1 - 8, y: G.ledgeY + 6, what: 'wall' };
  return null;
}
export function pourAt(e, S, hero, c) {
  const a = pourAim(e, S, hero); S.n.pours++;
  if (!a) { S.n.wasted++; return 'wasted'; }
  if (a.what === 'mound') { openUp(e, S, 'soaked', c); return 'open'; }
  if (a.what === 'wall') { c.fx('runoff', a.x, a.y); openUp(e, S, 'fallen', c); return 'open'; }
  return null;
}
/* THE WINDLASS: struck, the shaft's bucket comes down (CQ.bucketFall) and empties into the sump: a mound near it is flooded (P1), she is washed out of
   the shaft (P2). It winds itself back up in CQ.bucketCd */
export function strikeWindlass(e, S, c) {
  const b = S.bucket; if (b.st !== 'up') return false; b.st = 'fall'; b.t = CQ.bucketFall; S.n.buckets++; c.sound('windlass'); c.number(e.x, e.y - 70, 'THE BUCKET COMES DOWN THE SHAFT', '#7ab8e8'); return true;
}
function stepBucket(e, S, dt, c) {
  const b = S.bucket, G = S.G;
  if (b.st === 'fall') { b.t -= dt; if (b.t <= 0) { b.st = 'down'; b.t = CQ.bucketCd; c.fx('splash', G.mid, G.floor); c.sound('splash');
    if (e.alive && !qOpen(e)) { if (S.pose === 'burrow' && S.mound && Math.abs(S.mound.x - G.mid) < CQ.bucketR) { S.n.bucketHits++; openUp(e, S, 'soaked', c); }
      else if (S.pose === 'shaft' && (e.mode === 'hang' || e.mode === 'pounceTell' || e.mode === 'climb')) { S.n.bucketHits++; openUp(e, S, 'fallen', c); } } } }
  else if (b.st === 'down') { b.t -= dt; if (b.t <= 0) { b.st = 'up'; c.sound('windlass'); } }
}
/* ---------- WHAT FLIES, SWEEPS, FALLS AND LIES ---------- */
function stepShots(e, S, dt, h, c) {
  const F = S.G.floor;
  for (const s of S.shots) { s.t -= dt; s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    c.hit([s.x - 4, s.x + 4, s.y - 4, s.y + 4], s.dmg, s.name, { key: s.key, blockable: s.blockable, venom: s.venom, onHit: () => { s.t = 0; s.hit = true; } });
    if (s.y >= F - 2 && s.vy > 0) { if (s.puddle && !s.hit) S.puddles.push({ x: s.x, t: CQ.puddleT, tick: 0 }); c.fx(s.k === 'venom' ? 'venomSplat' : 'stoneLand', s.x, F); s.t = 0; } }
  S.shots = S.shots.filter(s => s.t > 0);
}
function stepBands(e, S, dt, c) {
  const G = S.G;
  for (const b of S.bands) { b.x += b.dir * b.speed * dt;
    c.band(b.kind, b.y, b.x - 16, b.x + 16, b.dmg, b.name, b.key, { venom: b.venom });
    if (b.x < G.x0 - 20 || b.x > G.x1 + 20) b.done = true; }
  S.bands = S.bands.filter(b => !b.done);
}
function stepRubble(e, S, dt, c) {
  const G = S.G;
  for (const r of S.rubble) { r.t -= dt; if (r.t <= 0 && !r.landed) { r.landed = true; const y = r.ledge ? G.ledgeY : G.floor; c.fx('rubble', r.x, y); c.sound('rock');
      c.hit([r.x - CQ.rubbleR, r.x + CQ.rubbleR, y - 40, y + 2], CQ.dmg.slam, MOVE_NAME.slam, { key: r.key }); } }
  S.rubble = S.rubble.filter(r => r.t > -0.4);
}
function stepPuddles(e, S, dt, c) {
  for (const p of S.puddles) { p.t -= dt; p.tick -= dt; if (p.tick <= 0) { p.tick = CQ.puddleTick; c.hit([p.x - 14, p.x + 14, S.G.floor - 6, S.G.floor + 2], CQ.dmg.puddle, MOVE_NAME.puddle, { key: 'pud' + Math.round(p.x) + Math.round(p.t * 2), venom: 1, noKnock: true }); } }
  S.puddles = S.puddles.filter(p => p.t > 0);
}
/* HER BROOD: one blow each; the deep water of the sump drowns them (only once the cistern is flooded) */
function stepBrood(e, S, dt, c) {
  const G = S.G;
  for (const b of S.brood) if (b.alive && S.flood && S.water > CQ.waterH - 2 && b.x > G.sump[0] + 4 && b.x < G.sump[1] - 4) { b.alive = false; S.n.drowned++; c.drown(b); }
  S.brood = S.brood.filter(b => b.alive);
  if (!S.brood.length && S.keepBack) S.keepBack = 0;
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT (the Puppeteer's lesson): it sees a tell PLAN.react s after it began and misreads some (PLAN.miss); it lets some openings go (PLAN.missPour).
   It fills the skin at a basin when it is empty, floods her mound (or strikes the windlass when the mound is by the sump), climbs to her wall's ledge and
   pours, counters some grabs on the claw and mashes out of the rest, and cuts in her openings.
   s = { P: { x, y, face, ground, atk, climb, onLedge, snare }, e, S, sips, reach, shield, t, rng, mem } -> { gx, face, atk, jump, block, dodge, talk, down, up, why } */
export const PLAN = { react: 0.25, miss: 0.13, missPour: 0.2, counter: 0.45 };
export function queenPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, talk: false, down: false, up: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const key = e.mode + S.act; const seen = () => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= PLAN.react; };
  const roll = (k, pr) => { if (!mem.roll.has(k)) mem.roll.set(k, rng() < pr); return mem.roll.get(k); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x)), side = Math.sign(P.x - e.x) || 1, ad = Math.abs(P.x - e.x);
  const onLedge = P.onLedge, F = G.floor, misread = roll(key + 'm', PLAN.miss);
  /* held: mash */
  if (P.snare > 0) { out.atk = P.atk < 0; out.why = 'mash out of the claw'; return out; }
  /* 0. what is flying or sweeping at you (a quarter-second late) */
  const band = S.bands.find(b => Math.abs(b.x - P.x) < 120 && Math.sign(P.x - b.x) === b.dir);
  if (band && !onLedge && seen() && !misread) { if (band.kind === 'high') { out.down = P.ground; out.why = 'duck the ' + band.k; return out; } if (Math.abs(band.x - P.x) < 70) { out.jump = P.ground; out.why = 'jump the ' + band.k; return out; } }
  const rock = S.rubble.find(r => !r.landed && Math.abs(r.x - P.x) < CQ.rubbleR + 8);
  if (rock && !misread) { out.gx = clamp(P.x + (P.x < rock.x ? -40 : 40)); out.why = 'out from under the rubble'; return out; }
  const pud = S.puddles.find(p => Math.abs(p.x - P.x) < 18);
  /* 1. THE OPENING: on her */
  if (qOpen(e)) { out.gx = clamp(e.x - side * Math.max(8, reach * 0.5 + CQ.w * 0.3)); if (onLedge && P.ground) { out.down = true; out.jump = true; }
    out.face = Math.sign(e.x - P.x) || 1; out.atk = ad < reach + CQ.w / 2 + 4 && Math.abs(P.y - e.y) < 50 && P.atk < 0; out.why = 'cut her: she is open'; return out; }
  /* 2. HER TELLS */
  const m = e.mode;
  if (/Tell$/.test(m) && seen() && !misread) {
    if (m === 'pincerTell' || m === 'snapTell' || m === 'snap2Tell') { if (ad < 110) { if (s.shield) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the pincer'; return out; } out.gx = clamp(e.x + side * 120); out.why = 'back off the pincer'; return out; } }
    if (m === 'lungeTell' || m === 'barbTell') { if (ad < 160) { out.gx = clamp(e.x + side * 190); if (ad < 90) out.dodge = true; out.why = 'off the lunge'; return out; } }
    if (m === 'lanceTell') { const cx = S.cur && S.cur.x; if (cx != null && Math.abs(cx - P.x) < 30) { out.gx = clamp(P.x + (P.x < cx ? -46 : 46)); out.why = 'off the lance\'s mark'; return out; } }
    if (m === 'flickTell' && ad < 220) { if (s.shield) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the sand'; return out; } out.gx = clamp(P.x + side * 70); out.why = 'out from the sand'; return out; }
    if (m === 'strikeTell') { const cx = S.cur && S.cur.x; if (s.sips > 0 && S.mound && Math.abs(S.mound.x - P.x) < 54 && !roll(key + 'p', PLAN.missPour)) { out.face = Math.sign(S.mound.x - P.x) || P.face; out.talk = true; out.why = 'flood the mound'; return out; }
      if (cx != null && Math.abs(cx - P.x) < 50) { out.gx = clamp(P.x + (P.x < cx ? -70 : 70)); out.dodge = Math.abs(cx - P.x) < 30; out.why = 'off the mound'; return out; } }
    if (m === 'chargeTell') { if (s.sips > 0 && S.mound && Math.abs(S.mound.x - P.x) < 54 && !roll(key + 'p', PLAN.missPour)) { out.face = Math.sign(S.mound.x - P.x) || P.face; out.talk = true; out.why = 'flood the mound'; return out; } }
    if (m === 'slamTell') { /* the rubble comes where you stand: move as it falls (handled above) */ }
    if (m === 'pinTell') { const cx = S.cur && S.cur.x; if (cx != null && Math.abs(cx - P.x) < 40 && e.modeT < 0.3) { out.gx = clamp(P.x + (P.x < G.mid ? 60 : -60)); out.dodge = true; out.why = 'dodge the pin'; return out; } }
    if (m === 'pounceTell') { const cx = S.cur && S.cur.x; if (cx != null && Math.abs(cx - P.x) < CQ.pounceR + 12) { out.gx = clamp(P.x + (P.x < cx ? -60 : 60)); out.why = 'out of the shadow'; return out; } }
    if (m === 'grabTell' && ad < 140) { if (ad < CQ.w / 2 + CQ.grabReach + 20 && roll(key + 'c', PLAN.counter)) { out.face = Math.sign(e.x - P.x) || 1; out.gx = clamp(e.x + side * (CQ.w / 2 + reach - 4)); out.why = 'meet the claw';
        if (e.modeT < 0.12 && P.atk < 0) out.atk = true; return out; } out.gx = clamp(e.x + side * 200); if (ad < 110) out.dodge = e.modeT < 0.2; out.why = 'off the grab'; return out; }
    if (m === 'rollTell' || m === 'waveTell' || m === 'ambushTell') { /* jumped as it comes (the band / body test below) */ }
    if (m === 'tidalTell') { if (ad < CQ.tidalReach + 10 && !onLedge) { out.down = P.ground; out.why = 'duck the tidal tail'; return out; } }
    if (m === 'spitTell' && s.shield) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the spit'; return out; }
  }
  if (m === 'grab' && S.claw && Math.abs(S.claw.x - P.x) < 40) { out.atk = P.atk < 0; out.face = Math.sign(S.claw.x - P.x) || 1; out.why = 'strike the claw'; return out; }
  if ((m === 'roll' || m === 'ambush' || m === 'lunge') && Math.sign(P.x - e.x) === (m === 'roll' ? Math.sign(S.cur.dir || 1) : e.face) && ad < 90) { out.jump = P.ground; if (ad < 50 && P.ground) out.dodge = true; out.why = 'over her body'; return out; }
  if (m === 'charge' || m === 'wave') { /* bands above */ }
  if (pud) { out.gx = clamp(P.x + (P.x < pud.x ? -30 : 30)); out.why = 'out of the venom'; return out; }
  /* 3. NO WATER: the nearest basin (P1, P2: the flood fills the skin in P3 at a basin too) */
  if (s.sips <= 0 && S.ph < 3) { const bx = Math.abs(P.x - G.basinW) < Math.abs(P.x - G.basinE) ? G.basinW : G.basinE;
    if (onLedge) { out.down = true; out.jump = P.ground; out.gx = bx; out.why = 'down off the ledge for water'; return out; }
    if (Math.abs(P.x - bx) < 12 && P.ground) { out.talk = true; out.why = 'fill the skin'; return out; } out.gx = bx; out.why = 'to the basin'; return out; }
  /* 4. P1: the mound - stand in front of it and pour; or the windlass when it is by the sump */
  if (S.pose === 'burrow' && S.mound) { const mx = S.mound.x;
    if (Math.abs(mx - G.mid) < CQ.bucketR - 10 && S.bucket.st === 'up' && Math.abs(P.x - G.windlass) < 20 && !roll(key + 'w', PLAN.missPour)) { out.face = Math.sign(G.windlass - P.x) || 1; out.atk = P.atk < 0; out.why = 'strike the windlass'; return out; }
    if (Math.abs(mx - P.x) < 50 && !roll(key + 'p', PLAN.missPour)) { out.face = Math.sign(mx - P.x) || P.face; out.talk = true; out.why = 'flood the mound'; return out; }
    out.gx = clamp(mx + (P.x < mx ? -34 : 34)); out.face = Math.sign(mx - P.x) || P.face; out.why = 'meet the mound'; return out; }
  /* 5. P2: she clings to a wall - up to that wall's ledge and pour; in the shaft - the windlass */
  if (S.pose === 'wall' && S.wall && s.sips > 0) { const lad = S.wall === 'W' ? G.ladderW : G.ladderE, ledge = S.wall === 'W' ? G.ledgeW : G.ledgeE;
    if (onLedge === S.wall) { const tx = S.wall === 'W' ? ledge[0] + 30 : ledge[1] - 30; if (Math.abs(P.x - tx) > 10) { out.gx = tx; out.why = 'along the ledge'; return out; }
      if (!roll(key + 'p', PLAN.missPour)) { out.face = S.wall === 'W' ? -1 : 1; out.talk = true; out.why = 'pour down the wall above her'; } return out; }
    if (onLedge) { out.down = true; out.jump = P.ground; out.gx = lad; out.why = 'off the wrong ledge'; return out; }
    if (Math.abs(P.x - lad) > 5 && !P.climb) { out.gx = lad; out.why = 'to her wall\'s ladder'; return out; }
    out.up = true; if (P.climb && P.y <= G.ledgeY + 2) { out.gx = S.wall === 'W' ? ledge[0] + 30 : ledge[1] - 30; out.up = false; } out.why = 'up to the ledge'; return out; }
  if (S.pose === 'shaft' && S.bucket.st === 'up') { if (onLedge) { out.down = true; out.jump = P.ground; } if (Math.abs(P.x - G.windlass) < 18) { out.face = Math.sign(G.windlass - P.x) || 1; out.atk = P.atk < 0; out.why = 'strike the windlass'; return out; } out.gx = G.windlass; out.why = 'to the windlass'; return out; }
  /* 6. P3: her brood - lure them over the sump, or cut them */
  const br = S.brood.filter(b => b.alive).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (br && Math.abs(br.x - P.x) < reach + 16) { out.face = Math.sign(br.x - P.x) || 1; out.atk = P.atk < 0; out.why = 'cut the brood'; return out; }
  /* 7. otherwise: keep at a step from her (in P3 near enough that the grab comes, a counter's reach) */
  if (onLedge && S.ph !== 2) { out.down = true; out.jump = P.ground; }
  const want = S.ph === 3 ? CQ.w / 2 + 50 : CQ.w / 2 + 60;
  out.gx = clamp(e.x + side * want); out.face = Math.sign(e.x - P.x) || P.face; out.why = 'keep a step off';
  return out;
}
