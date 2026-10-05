// src/djinn.js - THE DJINN OF THE GREAT WELL, THE WELL TOWN's boss (claude/welltown5; Daniel 2026-10-03: the Cistern Queen is benched for a level of
// her own, and the town's boss is the thing the whole town draws its water from). Something is BOUND at the bottom of the well - shackled at the
// wrists, a whirl of sand from the waist down. The Gang Leader's men fouled the windlass to keep it down; the BANDIT MYSTICS chant at its seals to free
// it (claude/djinn2: THE BINDING WORKS under the Kasbah), and at the bottom of their descent the last seal breaks and he rises.
// His fight is the level's verb at its hardest: WATER IS CARRIED, and every opening is water.
//
// THE HALL (stageDjinn): the deep cistern under the old well - forty tiles, fifteen rows high. The old well's SHAFT comes down through the vault in the
// middle (the light and the great bucket come down it), a grated SUMP under it, a stone LEDGE high on each wall with a rope ladder, a spring BASIN under
// each ledge (fill your skin: they glint), THE WINDLASS on the floor and a CRANK on the east ledge (either one drops the shaft's great bucket). You come in
// at the floor through the west door, off the bottom of the binding works (claude/djinn2).
//
// THREE PHASES, every blow told (src/marks.js rows: a yellow ! the shield turns, a red !! nothing does), every cycle a different order:
//   P1 SAND (to 2/3)  a whirl of sand: a blade PASSES THROUGH him (THE SAND TAKES THE BLADE). SAND LASH (!: his arm of sand cracks out in front),
//                     SAND BLAST (!: three stones arc at you), DUST DEVIL (!!: a whirlwind runs the floor - jump it), SAND SPEARS (!!, claude/djinn2: a
//                     glow under your feet, three in a row - each erupts where you stood: keep moving). OPEN: POUR your skin on him - he turns to MUD,
//                     solid and slow (DJ.mudT), and a blade bites; then THE SAND HARDENS (his ward).
//   P2 FIRE (to 1/3)  he catches fire and BURNS: his heat scorches you close to him and SETS YOU ALIGHT (E with water douses you), and his fire turns
//                     the blade. FIRE LASH (!), FIRE BREATH (!!: a stream at head height in front - duck it or step out), FLAME PILLARS (!!: three
//                     marked spots erupt - get off them), THE FIRE DEVIL (!!, claude/djinn2: a burning dust devil roams the floor for seconds, wall to
//                     wall - jump it or take a ledge). OPEN: DOUSE him (a pour) - smoke and clay, open; then he FLARES WHITE-HOT (his ward) and burns.
//   P3 FLOOD (to 0)   he takes the well: the hall floods (standing in it costs a little) and he rises in the shaft as a column of water.
//                     SPOUT (!!: a spout erupts under you - roll out, or be held and strike out), WAVE (!!: a bore runs the floor and a wave runs each
//                     ledge - jump it), HAND SLAM (!!: his hand comes down where you stand - and stays there, glinting: strike it), THE WHIRLPOOL (!!,
//                     claude/djinn2: the well turns - the flood pulls you toward the shaft; wade or climb against it). OPEN: drop the GREAT BUCKET on him
//                     (strike the windlass on the floor, or the crank on the east ledge) - it bails him out WHERE HE IS: he spills in the flood under the
//                     shaft, open, and you WADE IN to cut him (claude/djinn2, Daniel 10-03: no teleport - nothing moves you, him, or a platform).
// THE WARD (claude/djinn2, Daniel 10-03: "you can chain-lock him"): after EVERY opening ends he wards for DJ.wardT, told (a line, a sound, a look): P1
// THE SAND HARDENS (a glittering shell), P2 HE FLARES WHITE-HOT (his heat reaches further), P3 A SHROUD OF WATER (spinning round him). Warded, water
// runs off him and a blade does nothing; he keeps fighting through it.
// ALWAYS: outside an opening a blade does nothing to him (sand, fire, water) - only his slammed HAND takes a blow in phase three; greed is answered by the
// global reprisal (src/boss-greed.js OPEN_RULE.djinn: his openings and his hand). The mash bot cannot pour: it can never open him.
//
// PURE: no DOM, no main.js. The world is a context `c` (src/djinn-hands.js binds it). djinnPlan is the boss lab's HUMAN bot (src/lab.js).

export const DJ = {
  hp: 1000, w: 34, h: 64, markH: 92,
  openMul: 2.5, openT: 4.0, mudT: 3.5, bailT: 5.0, openCap: 0.07,   /* a water opening: x openMul, one takes no more than openCap of him (claude/djinn3,
                                                                    Daniel 10-04 "a little too hard": MORE DAMAGE WHEN STUNNED x1.9 -> x2.5, and STUNNED
                                                                    LONGER - mud 2.5 -> 3.5 s, the douse 3.2 -> 4.0, the bail 4.2 -> 5.0; the cap
                                                                    0.0525 -> 0.07 so a full opening is a real bite and never a one-shot) */
  collapseT: 1.3, reformT: 1.7, hissT: 1.4,      /* THE TURNS (claude/djinn3, Daniel 10-04 "no phase-transition animation"): P1->P2 the sand COLLAPSES (collapseT)
                                                    and RE-FORMS as fire (reformT); P2->P3 the fire HISSES to steam (hissT) and he RISES from the water (floodT). Told:
                                                    a banner, the camera shakes, and nothing hits you while he turns (a breather) */
  wardT: 3.0, wardHeatR: 34,                     /* THE WARD after every opening (claude/djinn2): this long; white-hot, his heat reaches this far */
  wakeT: 3.4,                                    /* the last seal breaks, the sand pours down the shaft, he forms (claude/djinn2: told, cutscene-lite) */
  p2: 2 / 3, p3: 1 / 3,
  walk: 60, keep: 74, gap: [0.5, 0.6, 0.65],
  /* P1 SAND (claude/djinn2: faster - Daniel 10-03 "phase one harder") */
  lashTell: 0.5, lashT: 0.2, lashReach: 62,
  blastTell: 0.5, blastFly: 0.75,
  devilTell: 0.7, devilSpeed: 185,
  spearTell: 0.75, spearGap: 0.38, spearN: 4, spearT: 0.3, spearR: 15,
  /* P2 FIRE */
  breathTell: 0.8, breathT: 0.7, breathReach: 150,
  pillarTell: 1.0, pillarT: 0.45, pillarR: 18,
  fdevilTell: 0.8, fdevilLife: 5.0, fdevilSpeed: 105, fdevilH: 26,
  heatTick: 0.6, heatR: 14,
  burnT: 2.6, burnTick: 0.5,                     /* a hero set alight: this long, a tick each burnTick, unless doused */
  /* P3 FLOOD */
  floodT: 2.2, waterH: 56, floodTick: 1.0,
  /* THE TIDE (claude/djinn3, Daniel 10-04: P3 "noticeably easier and simplistic" - make the flood work against you): the well RISES AND FALLS. Low (waterH,
     tideLow s: the floor shin-deep, the ledges dry) -> THE SURGE told (surgeTell s: bubbles boil up and a foam line blinks where it will reach) -> it rises
     (tideRise s) OVER THE LEDGES by overLedge px and stays (tideHigh s: the floor is DEEP and costs dmg.deep a deepTick, a ledge under it costs the flood's
     tick) -> it ebbs (tideEbb s) and the ledges come back */
  tideLow: 8.0, surgeTell: 1.6, tideRise: 1.4, tideHigh: 5.0, tideEbb: 1.6, overLedge: 14, deepTick: 0.8,
  /* THE COLUMN ROAMS (claude/djinn3): in the flood he moves between his blows - to the shaft for the wave, the whirlpool and to DRAW (wellT s, under the
     shaft's light), toward you for the rest. The bucket bails him only if he is UNDER THE SHAFT (shaftR px of its middle) when it lands */
  colWalk: 100, shaftR: 30, wellT: 1.8,
  /* HE STRIKES UP FROM BELOW (claude/djinn3): bubbles boil under you (upTell), his fist bursts up through the water - or the ledge's boards - where you
     stood, and rests there upStay s (his hand: strike it) */
  upTell: 0.9, upT: 0.25, upR: 20, upStay: 1.4,
  spoutTell: 0.85, spoutT: 0.45, spoutR: 18, snare: 2.4, holdT: 1.3,
  waveTell: 0.8, waveSpeed: 210, boreH: 34, crestH: 18,
  slamTell: 0.8, slamT: 0.25, slamStay: 1.5, handR: 16, handCap: 0.06, handMul: 1.0,
  whirlTell: 0.9, whirlT: 3.2, whirlPull: 72, whirlR: 30, whirlTick: 0.5,
  bucketFall: 0.55, bucketCd: 2.5, windT: 1.5, pourR: 66,   /* THE BAIL IS TWO STEPS (claude/djinn3): in the flood the great bucket lies DOWN in the
                                                    water - strike the windlass (or the crank) and it WINDS UP (windT s) and hangs cocked; strike again and it DROPS
                                                    (bucketFall s) - on him only if he is under the shaft. After it lands the rope settles bucketCd s */
  dmg: { lash: 17, blast: 8, devil: 24, spear: 19, flash: 17, breath: 22, pillar: 20, fdevil: 11, heat: 6, burn: 3, spout: 16, held: 24, wave: 26, slam: 26, whirl: 10, flood: 1, deep: 4, upsurge: 22 },
};
export const CYCLES = {
  1: [['lash', 'spears', 'devil', 'blast'], ['devil', 'lash', 'spears', 'lash', 'blast'], ['blast', 'spears', 'lash', 'devil'], ['spears', 'lash', 'devil', 'blast', 'lash']],
  2: [['breath', 'firedevil', 'pillars', 'flash'], ['pillars', 'flash', 'breath', 'firedevil'], ['flash', 'firedevil', 'breath', 'pillars', 'breath']],
  3: [['spout', 'upsurge', 'wave', 'well', 'slam'], ['upsurge', 'whirl', 'spout', 'well', 'slam'], ['wave', 'upsurge', 'slam', 'well', 'spout', 'whirl']],   /* (claude/djinn3: he strikes up from below, and DRAWS under the shaft once a cycle) */
};
export const MOVES = {
  lashTell: { mark: '!', answer: 'block', h: 'low' }, blastTell: { mark: '!', answer: 'block', h: 'low' }, devilTell: { mark: '!!', answer: 'jump', h: 'low' },
  spearsTell: { mark: '!!', answer: 'dodge', h: 'low' },
  flashTell: { mark: '!', answer: 'block', h: 'low' }, breathTell: { mark: '!!', answer: 'duck', h: 'high' }, pillarTell: { mark: '!!', answer: 'dodge', h: 'low' },
  firedevilTell: { mark: '!!', answer: 'jump', h: 'low' },
  spoutTell: { mark: '!!', answer: 'dodge', h: 'low' }, waveTell: { mark: '!!', answer: 'jump', h: 'low' }, slamTell: { mark: '!!', answer: 'dodge', h: 'low' },
  whirlTell: { mark: '!!', answer: 'dodge', h: 'low' }, upsurgeTell: { mark: '!!', answer: 'dodge', h: 'low' },
};
/* THE NEW MOVES' first lines (claude/djinn2): said once a fight, the first time each comes */
export const FIRST_LINE = { spears: ['SAND SPEARS: THE GLOW UNDER YOU - MOVE', '#ffd36b'], firedevil: ['A FIRE DEVIL: JUMP IT OR GET UP', '#ff9a5c'], whirl: ['THE WELL TURNS: WADE AGAINST IT', '#7ab8e8'],
  upsurge: ['BUBBLES UNDER YOU: HE STRIKES FROM BELOW', '#7ab8e8'], well: ['HE DRAWS UNDER THE SHAFT: DROP THE BUCKET', '#8fd160'] };
/* THE TURNS' banners (claude/djinn3): [line, sub-line, colour] */
export const TURN_LINE = { 2: ['THE SAND CATCHES FIRE', 'DOUSE HIM WITH WATER', '#ff9a5c'], 3: ['THE FIRE HISSES OUT', 'HE TAKES THE WELL: IT RISES AND FALLS', '#7ab8e8'] };
export const WARD_LINE = { 1: ['THE SAND HARDENS: WATER RUNS OFF HIM', '#e8d8a0'], 2: ['HE FLARES WHITE-HOT: STAND BACK', '#fff2c0'], 3: ['A SHROUD OF WATER SPINS ROUND HIM', '#bfe4ff'] };
export const MOVE_NAME = { lash: 'THE SAND LASH', blast: 'THE SAND', devil: 'THE DUST DEVIL', spear: 'THE SAND SPEARS', flash: 'THE FIRE LASH', breath: 'HIS FIRE', pillar: 'THE FLAME PILLAR',
  fdevil: 'THE FIRE DEVIL', heat: 'HIS HEAT', burn: 'ALIGHT', spout: 'THE SPOUT', held: 'THE WELL', wave: 'THE WAVE', slam: 'HIS HAND', whirl: 'THE WHIRLPOOL', flood: 'THE FLOOD', deep: 'THE DEEP WATER', upsurge: 'HIS FIST FROM BELOW' };
export const IGNITES = new Set(['flash', 'breath', 'pillar', 'heat', 'fdevil']);

/* ---------- THE HALL ---------- */
export const STAGE = { W: 40, H: 15, shaft: [18, 21], sump: [17, 22], ledge: 6, ledgeRow: 7, ladder: 6, basin: 3, windlass: 14, crank: 3, door: 6 };
/* sx: the hall's first column; F: its floor row (solid; you stand on row F-1); top: the row the shaft comes down from. W = { set, block, ent, air }.
   o.westDoor (claude/djinn2): the hall is entered at the floor through a door in its west wall this many rows high (the binding works' last tunnel) */
export function stageDjinn(W, T, TS, sx, F, top, o = {}) {
  const { set, ent, air } = W, ex = sx + STAGE.W, vault = F - STAGE.H - 1;
  air(sx, ex - 1, vault + 1, F - 1);
  air(sx + STAGE.shaft[0], sx + STAGE.shaft[1], top, vault);
  air(sx + STAGE.sump[0], sx + STAGE.sump[1], F, F + 1);
  for (let x = sx + STAGE.sump[0]; x <= sx + STAGE.sump[1]; x++) set(x, F, T.ONEWAY);
  if (o.westDoor) air(sx - 1, sx - 1, F - o.westDoor, F - 1);
  const lr = F - STAGE.ledgeRow - 1;
  for (let x = sx; x < sx + STAGE.ledge; x++) set(x, lr, T.ONEWAY);
  for (let x = ex - STAGE.ledge; x < ex; x++) set(x, lr, T.ONEWAY);
  const ladders = [[sx + STAGE.ladder, lr, F - 1], [ex - 1 - STAGE.ladder, lr, F - 1]];
  ent('skinwell', sx + STAGE.basin, F - 1, { arena: true, basin: true });
  ent('skinwell', ex - 1 - STAGE.basin, F - 1, { arena: true, basin: true });
  ent('djwindlass', sx + STAGE.windlass, F - 1, {});
  ent('djwindlass', ex - 1 - STAGE.crank, lr - 1, { crank: true });
  ent('djinn', sx + 26, F - 1, { face: -1 });
  const arena = { x0: sx * TS, x1: ex * TS, floor: F * TS, trigger: (sx + 4) * TS, wallL: sx - 1, wallR: ex, boss: 'djinn', music: 'cisternqueen',
    tint: '#9ab0c0', tintA: 0.08, start: [sx + 9, F - 1], y0: (vault - 2) * TS, y1: (F + 2) * TS, djinn: { sx, F, vault, top, lr } };
  return { arena, ladders };
}
export function geom(A, TS = 16) {
  const q = A.djinn, sx = q.sx, ex = sx + STAGE.W, x0 = sx * TS, x1 = ex * TS;
  return { x0, x1, floor: q.F * TS, vault: (q.vault + 1) * TS, mid: (sx + STAGE.W / 2) * TS, ledgeY: q.lr * TS,
    ledgeW: [x0, (sx + STAGE.ledge) * TS], ledgeE: [(ex - STAGE.ledge) * TS, x1], ladderW: (sx + STAGE.ladder) * TS + 8, ladderE: (ex - 1 - STAGE.ladder) * TS + 8,
    basinW: (sx + STAGE.basin) * TS + 8, basinE: (ex - 1 - STAGE.basin) * TS + 8, sump: [(sx + STAGE.sump[0]) * TS, (sx + STAGE.sump[1] + 1) * TS],
    shaft: [(sx + STAGE.shaft[0]) * TS, (sx + STAGE.shaft[1] + 1) * TS], windlass: (sx + STAGE.windlass) * TS + 8, crank: (ex - 1 - STAGE.crank) * TS + 8,
    seal: { x: (sx + 26) * TS + 8, y: (q.F - 9) * TS } };
}

/* ---------- ONE FIGHT ---------- */
export function newShow(G) {
  return { G, cycle: 0, ph: 1, step: 0, script: null, moveT: 0, pose: 'floor', act: 0, cur: null, shots: [], bands: [], marks: [], hand: null, held: null,
    bucket: { st: 'up', t: 0 }, water: 0, ward: 0, wary: 0, flood: false, burn: false, douse: 0, flare: 0, heatK: 0, heatN: 0, floodK: 0, deepK: 0, openTaken: 0, whirlK: 0, whirlN: 0,
    tide: { st: 'low', t: DJ.tideLow }, goX: null, pend: null, turns: 0,
    told: {}, n: { cycles: 0, opens: 0, mud: 0, doused: 0, bailed: 0, pours: 0, wasted: 0, warded: 0, wards: 0, buckets: 0, flares: 0, hands: 0, handHits: 0, spouts: 0, caught: 0, passed: 0, wardPassed: 0,
      winds: 0, misses: 0, upsurges: 0, draws: 0, surges: 0, turns: 0, moves: {} } };
}
/* THE TURNS (claude/djinn3): while he collapses, re-forms, hisses out or rises, nothing hits you and nothing takes on him - a breather */
export const TURNING = new Set(['collapse', 'reform', 'hiss', 'rise', 'catch']);
/* in the flood: is he under the shaft (where the great bucket lands)? */
export const underShaft = (e, S) => !!S && S.pose === 'column' && Math.abs(e.x - S.G.mid) <= DJ.shaftR;
/* the tide's high mark: the water's height over the floor when the well has surged over the ledges */
export const highWater = G => (G.floor - G.ledgeY) + DJ.overLedge;
export const tideHigh = S => !!S && !!S.tide && (S.tide.st === 'surge' || S.tide.st === 'rising' || S.tide.st === 'high');
export const djPhase = e => (e.hp <= e.maxHp * DJ.p3 ? 3 : e.hp <= e.maxHp * DJ.p2 ? 2 : 1);
export const djOpen = e => !!e && (e.open || 0) > 0 && (e.mode === 'mud' || e.mode === 'doused' || e.mode === 'bailed');
export const djWard = S => !!S && S.ward > 0;
export const handOut = S => (S && S.hand && S.hand.stay > 0 ? S.hand : null);
export const handBox = h => ({ l: h.x - DJ.handR, r: h.x + DJ.handR, t: h.y - DJ.handR - 6, b: h.y + 2 });
const setMode = (e, m, t) => { e.mode = m; e.modeT = t; };
const nextScript = S => CYCLES[S.ph][S.cycle % CYCLES[S.ph].length].slice();
const IDLE = new Set(['walk', 'recover', 'hover']);
/* the flood's top, and whether a hero stands in it (not up a ladder, not on a ledge) */
export const inFlood = (S, q) => S.water > 4 && q.y > S.G.floor - S.water + 4;   /* (claude/djinn3: the tide - a ledge goes under too; a hero whose feet are above the water is dry) */

/* THE WARD: after every opening ends (claude/djinn2) - told, and he goes on fighting through it */
function startWard(e, S, c) {
  S.ward = DJ.wardT; S.n.wards++; const y = e.y - (S.pose === 'column' ? 160 : 100);
  if (S.ph === 1) c.number(e.x, y, 'THE SAND HARDENS: WATER RUNS OFF HIM', '#e8d8a0'); else if (S.ph === 2) c.number(e.x, y, 'HE FLARES WHITE-HOT: STAND BACK', '#fff2c0'); else c.number(e.x, y, 'A SHROUD OF WATER SPINS ROUND HIM', '#bfe4ff');   /* (WARD_LINE, as literals) */
  c.sound('ward');
  if (S.ph === 2) { S.burn = true; S.flare = 0; c.fx('flare', e.x, S.G.floor); }
  if (S.ph === 1) c.fx('sand', e.x, S.G.floor);
}

/* ---------- ONE FRAME. h = heroes [{ x, y, ground, alive, ducking, onLedge, climb, pp }], c = the world (src/djinn-hands.js) ---------- */
export function stepDjinn(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; S.moveT += dt;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0 && !djOpen(e)) { S.ward = Math.max(0, S.ward - dt); if (S.ward === 0 && e.alive) c.number(e.x, e.y - (S.pose === 'column' ? 160 : 100), 'HIS WARD FALLS', '#8fd160'); }
  S.wary = S.ph === 1 ? S.ward : 0; e.ward = S.ward;
  if (S.hand) { if (S.hand.stay > 0) S.hand.stay -= dt; if (S.hand.stay <= 0 && S.hand.landed) S.hand = null; }
  e.hand = S.hand && S.hand.stay > 0 ? S.hand.stay : 0;   /* (src/boss-greed.js OPEN_RULE: a blow on his slammed hand is not chipped) */
  stepShots(e, S, dt, c); stepBands(e, S, dt, c); stepMarks(e, S, dt, c); stepBucket(e, S, dt, c); stepFire(e, S, dt, c); stepFlood(e, S, dt, h, c);
  e.burning = !!S.burn; e.phase = S.ph;
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.7); } return; }
  const want = djPhase(e);
  if (want > S.ph && !djOpen(e) && IDLE.has(e.mode)) { S.ph = want; S.cycle = 0; S.step = 0; S.script = null; S.bands = []; S.marks = []; S.shots = []; S.hand = null; S.ward = 0; e.phase = want; S.turns++; S.n.turns++;
    /* THE TURN, TOLD (claude/djinn3): a banner, the camera shakes, and he changes where you can see it - nothing hits you while he does */
    const tl = TURN_LINE[want]; if (c.banner) c.banner(tl[0], tl[1], tl[2]); c.shake(6);
    if (want === 2) { S.douse = 0; setMode(e, 'collapse', DJ.collapseT); c.fx('sand', e.x, G.floor); c.sound('collapse'); return; }
    if (want === 3) { S.burn = false; S.flare = 0; setMode(e, 'hiss', DJ.hissT); c.fx('steam', e.x, G.floor); c.sound('hiss'); return; } }
  switch (e.mode) {
    /* P1 -> P2: the sand COLLAPSES into a heap, then RE-FORMS out of it as fire */
    case 'collapse': if (e.modeT <= 0) { S.burn = true; setMode(e, 'reform', DJ.reformT); c.number(e.x, e.y - 100, 'HE CATCHES FIRE: DOUSE HIM WITH WATER', '#ff9a5c'); c.fx('flare', e.x, G.floor); c.sound('flare'); c.music(2); c.shake(4); } return;
    case 'reform': if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.8); } return;
    /* P2 -> P3: the fire HISSES OUT to steam where he stands, he sinks into the sump, and the well rises with him in it */
    case 'hiss': e.x += (G.mid - e.x) * Math.min(1, dt * 1.5); if (e.modeT <= 0) { S.flood = true; S.pose = 'column'; S.tide = { st: 'low', t: DJ.tideLow }; S.bucket = { st: 'down', t: 0 };
      setMode(e, 'rise', DJ.floodT); c.number(G.mid, G.floor - 120, 'HE TAKES THE WELL: THE WATER RISES', '#7ab8e8'); c.sound('flood'); c.music(3); c.shake(5); } return;
    /* IN THE FLOOD he moves between blows: to the shaft, or toward you (claude/djinn3) */
    case 'glide': { const d = S.goX - e.x; e.x += Math.sign(d) * Math.min(Math.abs(d), DJ.colWalk * dt); e.face = Math.sign(P.x - e.x) || e.face;
      if (Math.abs(S.goX - e.x) < 1 || e.modeT <= 0) { const k = S.pend; S.pend = null; if (k) startMove(e, S, P, c, k); else setMode(e, 'hover', 0.3); } return; }
    case 'drawing': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) after(e, S); return;
    case 'mud': case 'doused': case 'bailed':
      if (e.open <= 0) { if (e.mode === 'mud') c.number(e.x, e.y - 100, 'HE DRIES BACK TO SAND', '#c9a46a');
        if (e.mode === 'bailed') { S.pose = 'column'; e.y = G.floor; }   /* (he gathers back up where he lies - under the shaft: nothing is moved) */
        startWard(e, S, c); setMode(e, 'recover', 0.45); } return;
    case 'catch': if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return;
    case 'rise': e.x += (G.mid - e.x) * Math.min(1, dt * 3); if (e.modeT <= 0) { e.x = G.mid; S.script = nextScript(S); S.step = 0; setMode(e, 'hover', 0.8); } return;
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'walk': { const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
      if (ad > DJ.keep) e.x += Math.sign(d) * DJ.walk * dt; else if (ad < DJ.keep - 30) e.x -= Math.sign(d) * DJ.walk * 0.6 * dt;   /* he keeps his reach: a whirl that hangs off you */
      e.x = Math.max(G.x0 + 30, Math.min(G.x1 - 30, e.x)); if (e.modeT <= 0) nextMove(e, S, P, c); return; }
    case 'hover': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) nextMove(e, S, P, c); return;
  }
  stepMove(e, S, dt, P, h, c);
}
function nextMove(e, S, P, c) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  const k = S.script[S.step++];
  /* IN THE FLOOD (claude/djinn3): the wave, the whirlpool and his draw come from under the shaft - he glides there first; the rest, toward you */
  if (S.ph === 3 && S.pose === 'column') { const gx = SHAFT_MOVES.has(k) ? S.G.mid : roamX(S, P, e); if (Math.abs(e.x - gx) > 6) { S.pend = k; S.goX = gx; setMode(e, 'glide', Math.abs(e.x - gx) / DJ.colWalk + 0.25); return; } }
  startMove(e, S, P, c, k);
}
const SHAFT_MOVES = new Set(['whirl', 'wave', 'well']);
/* where the column goes for a blow aimed at you: a little off you, on your side, never against a wall */
function roamX(S, P, e) { const G = S.G, side = Math.sign(e.x - P.x) || 1; return Math.max(G.x0 + 64, Math.min(G.x1 - 64, P.x + side * 96)); }
function startMove(e, S, P, c, k) {
  const G = S.G; S.n.moves[k] = (S.n.moves[k] || 0) + 1; S.act++; S.cur = { k, id: S.act }; e.face = Math.sign(P.x - e.x) || e.face;
  if (FIRST_LINE[k] && !S.told['first' + k]) { S.told['first' + k] = 1; const y = e.y - (S.pose === 'column' ? 175 : 118);   /* (FIRST_LINE, as literals) */
    if (k === 'spears') c.number(e.x, y, 'SAND SPEARS: THE GLOW UNDER YOU - MOVE', '#ffd36b'); else if (k === 'firedevil') c.number(e.x, y, 'A FIRE DEVIL: JUMP IT OR GET UP', '#ff9a5c');
    else if (k === 'upsurge') c.number(e.x, y, 'BUBBLES UNDER YOU: HE STRIKES FROM BELOW', '#7ab8e8'); else if (k === 'well') c.number(e.x, y, 'HE DRAWS UNDER THE SHAFT: DROP THE BUCKET', '#8fd160');
    else c.number(e.x, y, 'THE WELL TURNS: WADE AGAINST IT', '#7ab8e8'); }
  switch (k) {
    case 'lash': return tell(e, 'lashTell', DJ.lashTell, c);
    case 'flash': return tell(e, 'flashTell', DJ.lashTell, c);
    case 'blast': S.cur.x = P.x; return tell(e, 'blastTell', DJ.blastTell, c);
    case 'devil': return tell(e, 'devilTell', DJ.devilTell, c);
    case 'spears': S.cur.n = 1; S.cur.next = DJ.spearGap; S.marks = [spearMark(S, P, 0)]; return tell(e, 'spearsTell', DJ.spearTell, c);
    case 'breath': return tell(e, 'breathTell', DJ.breathTell, c);
    case 'pillars': S.cur.spots = [P.x, P.x - 72, P.x + 72].map(x => Math.max(G.x0 + 14, Math.min(G.x1 - 14, x))); S.marks = S.cur.spots.map(x => ({ x, y: G.floor, t: DJ.pillarTell, k: 'pillar', key: 'pl' + S.act + x }));
      return tell(e, 'pillarTell', DJ.pillarTell, c);
    case 'firedevil': return tell(e, 'firedevilTell', DJ.fdevilTell, c);
    case 'spout': { const y = P.onLedge ? G.ledgeY : G.floor; S.cur.x = P.x; S.cur.y = y; S.n.spouts++; S.marks = [{ x: P.x, y, t: DJ.spoutTell, k: 'spout', key: 'sp' + S.act }]; return tell(e, 'spoutTell', DJ.spoutTell, c); }
    case 'wave': return tell(e, 'waveTell', DJ.waveTell, c);
    case 'whirl': return tell(e, 'whirlTell', DJ.whirlTell, c);
    case 'slam': { const L = P.onLedge || (P.x < G.mid ? 'W' : 'E'), r = L === 'W' ? G.ledgeW : G.ledgeE, y = P.onLedge ? G.ledgeY : G.floor;
      const x = Math.max(r[0] + 14, Math.min(r[1] - 14, P.onLedge ? P.x : (L === 'W' ? r[1] - 20 : r[0] + 20)));
      S.cur.x = P.onLedge ? x : P.x; S.cur.y = y; S.marks = [{ x: S.cur.x, y, t: DJ.slamTell, k: 'slam', key: 'sl' + S.act }]; return tell(e, 'slamTell', DJ.slamTell, c); }
    /* HE STRIKES UP FROM BELOW (claude/djinn3): bubbles boil where you stand - the floor, or your ledge - then his fist bursts up there */
    case 'upsurge': { const y = P.onLedge ? G.ledgeY : G.floor, x = Math.max(G.x0 + 14, Math.min(G.x1 - 14, P.x)); S.cur.x = x; S.cur.y = y; S.n.upsurges++;
      S.marks = [{ x, y, t: DJ.upTell, k: 'bubbles', key: 'up' + S.act }]; return tell(e, 'upsurgeTell', DJ.upTell, c); }
    /* HE DRAWS (claude/djinn3): under the shaft, the light on him, drinking the well - the bucket's moment */
    case 'well': S.n.draws++; setMode(e, 'drawing', DJ.wellT); c.sound('spout'); return;
  }
}
function tell(e, mode, t, c) { setMode(e, mode, t); const m = MOVES[mode]; if (m && m.mark) { c.mark(m.mark); c.sound(m.mark === '!' ? 'tell' : 'tellHard'); } }
function after(e, S) { setMode(e, S.pose === 'column' ? 'hover' : 'walk', DJ.gap[S.ph - 1]); }
/* a SAND SPEAR's glow, under the hero where he stands now (on a ledge, the ledge's stone) */
function spearMark(S, P, i) { const G = S.G, x = Math.max(G.x0 + 12, Math.min(G.x1 - 12, P.x)); return { x, y: P.onLedge ? G.ledgeY : G.floor, t: DJ.spearTell, k: 'spear', key: 'spr' + S.act + '_' + i }; }

function stepMove(e, S, dt, P, h, c) {
  const G = S.G, cur = S.cur || {}, F = G.floor, fx = e.face || 1, key = 'dj' + cur.id;
  const front = (reach, top = 40) => fx > 0 ? [e.x, e.x + DJ.w / 2 + reach, e.y - top, e.y] : [e.x - DJ.w / 2 - reach, e.x, e.y - top, e.y];
  switch (e.mode) {
    case 'lashTell': if (e.modeT <= 0) { setMode(e, 'lash', DJ.lashT); c.sound('lash'); } return;
    case 'lash': c.hit(front(DJ.lashReach), DJ.dmg.lash, MOVE_NAME.lash, { key, blockable: true }); if (e.modeT <= 0) after(e, S); return;
    case 'flashTell': if (e.modeT <= 0) { setMode(e, 'flash', DJ.lashT); c.sound('lash'); } return;
    case 'flash': c.hit(front(DJ.lashReach), DJ.dmg.flash, MOVE_NAME.flash, { key, blockable: true, ignite: true }); if (e.modeT <= 0) after(e, S); return;
    case 'blastTell': if (e.modeT <= 0) { setMode(e, 'blast', 0.3); c.sound('blast');
      for (const dx of [-36, 0, 36]) { const tx = Math.max(G.x0 + 8, Math.min(G.x1 - 8, cur.x + dx)), sx0 = e.x + fx * 20, T = DJ.blastFly;
        S.shots.push({ x: sx0, y: F - 50, vx: (tx - sx0) / T, vy: -(0.5 * 600 * T) + (50 / T), g: 600, key: key + dx, t: T + 0.3 }); } } return;
    case 'blast': if (e.modeT <= 0) after(e, S); return;
    case 'devilTell': if (e.modeT <= 0) { S.bands.push({ k: 'devil', x: e.x + fx * 20, dir: fx, speed: DJ.devilSpeed, y: [F - 26, F], dmg: DJ.dmg.devil, name: MOVE_NAME.devil, key, kind: 'low' }); setMode(e, 'devil', 0.5); c.sound('devil'); } return;
    case 'devil': if (e.modeT <= 0) after(e, S); return;
    /* SAND SPEARS (claude/djinn2): the first glow went down with the tell; one more under the hero every spearGap, each erupting spearTell after it glowed */
    case 'spearsTell': if (e.modeT <= 0) setMode(e, 'spears', 9); return;
    case 'spears': cur.next -= dt;
      if (cur.n < DJ.spearN && cur.next <= 0) { S.marks.push(spearMark(S, P, cur.n)); cur.n++; cur.next = DJ.spearGap; c.sound('tellHard'); }
      if (cur.n >= DJ.spearN && !S.marks.some(m => m.k === 'spear')) after(e, S); return;
    case 'breathTell': if (e.modeT <= 0) { setMode(e, 'breath', DJ.breathT); c.sound('breath'); } return;
    case 'breath': { const x0 = fx > 0 ? e.x : e.x - DJ.breathReach, x1 = fx > 0 ? e.x + DJ.breathReach : e.x; c.band('high', [F - 32, F - 13], x0, x1, DJ.dmg.breath, MOVE_NAME.breath, key, { ignite: true }); if (e.modeT <= 0) after(e, S); return; }
    case 'pillarTell': if (e.modeT <= 0) { setMode(e, 'pillar', DJ.pillarT); c.sound('pillar'); c.shake(3); for (const m of S.marks) m.fire = DJ.pillarT; } return;
    case 'pillar': for (const m of S.marks) c.hit([m.x - DJ.pillarR, m.x + DJ.pillarR, F - 70, F], DJ.dmg.pillar, MOVE_NAME.pillar, { key: m.key, ignite: true }); if (e.modeT <= 0) { S.marks = []; after(e, S); } return;
    /* THE FIRE DEVIL (claude/djinn2): a burning whirl off his hand that roams the floor wall to wall for fdevilLife - he fights on while it runs */
    case 'firedevilTell': if (e.modeT <= 0) { S.bands = S.bands.filter(b => b.k !== 'firedevil');
      S.bands.push({ k: 'firedevil', x: Math.max(G.x0 + 16, Math.min(G.x1 - 16, e.x + fx * 26)), dir: fx, speed: DJ.fdevilSpeed, y: [F - DJ.fdevilH, F], dmg: DJ.dmg.fdevil, name: MOVE_NAME.fdevil, key, kind: 'low', life: DJ.fdevilLife, bounce: true, pass: 0, ignite: true });
      setMode(e, 'firedevil', 0.4); c.sound('devil'); c.sound('flare'); } return;
    case 'firedevil': if (e.modeT <= 0) after(e, S); return;
    case 'spoutTell': if (e.modeT <= 0) { setMode(e, 'spout', DJ.spoutT); c.sound('spout'); c.fx('splash', cur.x, cur.y); } return;
    case 'spout': { const got = c.grab([cur.x - DJ.spoutR, cur.x + DJ.spoutR, cur.y - 50, cur.y + 2], key); S.marks = [];
      if (got) { S.held = got; S.n.caught++; setMode(e, 'hold', DJ.holdT); c.number(cur.x, cur.y - 60, 'THE SPOUT HOLDS YOU: STRIKE OUT OF IT', '#ffd36b'); return; }
      if (e.modeT <= 0) after(e, S); return; }
    case 'hold': { const hh = S.held; if (!hh || c.free(hh)) { S.held = null; setMode(e, 'hover', 0.5); return; } c.holdAt(hh, cur.x);
      if (e.modeT <= 0) { c.hit([cur.x - 30, cur.x + 30, cur.y - 60, cur.y + 4], DJ.dmg.held, MOVE_NAME.held, { key: key + 'h', held: hh }); c.release(hh); S.held = null; after(e, S); } return; }
    /* THE WAVE (claude/djinn2 - THE HIGH RIPPLES fixed): a BORE runs the floor out from the shaft to each wall, and a CREST runs each LEDGE - it starts at the
       ledge's inner edge as the bore passes under it and runs to the wall. Nothing runs through the open air over the hall, nothing past a wall */
    case 'waveTell': if (e.modeT <= 0) { for (const dir of [-1, 1]) { const x0 = G.mid + dir * 24, edge = dir < 0 ? G.ledgeW[1] : G.ledgeE[0];
        S.bands.push({ k: 'wave', x: x0, dir, speed: DJ.waveSpeed, y: [F - DJ.boreH, F], dmg: DJ.dmg.wave, name: MOVE_NAME.wave, key: key + 'f' + dir, kind: 'low' });
        S.bands.push({ k: 'wave', ledge: true, x: edge, dir, speed: DJ.waveSpeed, y: [G.ledgeY - DJ.crestH, G.ledgeY], dmg: DJ.dmg.wave, name: MOVE_NAME.wave, key: key + 'l' + dir, kind: 'low', delay: Math.abs(edge - x0) / DJ.waveSpeed }); }
      setMode(e, 'wave', 0.5); c.sound('wave'); } return;
    case 'wave': if (e.modeT <= 0) after(e, S); return;
    /* THE WHIRLPOOL (claude/djinn2): the well turns - whoever stands in the flood is pulled toward the shaft; under it, the well takes a bite each whirlTick */
    case 'whirlTell': if (e.modeT <= 0) { setMode(e, 'whirl', DJ.whirlT); S.whirlK = 0; c.sound('spout'); c.sound('flood'); } return;
    case 'whirl': c.pull(G.mid, DJ.whirlPull, dt); S.whirlK += dt;
      if (S.whirlK >= DJ.whirlTick) { S.whirlK = 0; S.whirlN++; c.hit([G.mid - DJ.whirlR, G.mid + DJ.whirlR, F - Math.max(30, S.water), F + 4], DJ.dmg.whirl, MOVE_NAME.whirl, { key: 'wh' + S.whirlN, noKnock: true, flood: true }); }
      if (e.modeT <= 0) after(e, S); return;
    case 'slamTell': if (e.modeT <= 0) { setMode(e, 'slam', DJ.slamT); c.sound('slam'); } return;
    case 'slam': if (e.modeT <= 0) { c.hit([cur.x - 22, cur.x + 22, cur.y - 40, cur.y + 2], DJ.dmg.slam, MOVE_NAME.slam, { key }); c.shake(5); c.fx('splash', cur.x, cur.y); S.marks = [];
        S.hand = { x: cur.x, y: cur.y - 6, stay: DJ.slamStay, landed: true, taken: 0 }; S.n.hands++;
        if (!S.told.hand) { S.told.hand = 1; c.number(cur.x, cur.y - 50, 'HIS HAND RESTS THERE: STRIKE IT', '#8fd160'); }
        setMode(e, 'reach', DJ.slamStay); } return;
    case 'upsurgeTell': if (e.modeT <= 0) { setMode(e, 'upsurge', DJ.upT); c.sound('spout'); c.fx('splash', cur.x, cur.y); } return;
    case 'upsurge': c.hit([cur.x - DJ.upR, cur.x + DJ.upR, cur.y - 56, cur.y + 4], DJ.dmg.upsurge, MOVE_NAME.upsurge, { key });
      if (e.modeT <= 0) { S.marks = []; c.shake(4); S.hand = { x: cur.x, y: cur.y - 6, stay: DJ.upStay, landed: true, taken: 0 }; S.n.hands++;
        if (!S.told.hand) { S.told.hand = 1; c.number(cur.x, cur.y - 50, 'HIS HAND RESTS THERE: STRIKE IT', '#8fd160'); }
        setMode(e, 'reach', DJ.upStay); } return;
    case 'reach': if (e.modeT <= 0 || !S.hand) { S.hand = null; after(e, S); } return;
  }
  if (e.modeT <= -2) after(e, S);
}

/* ---------- THE OPENINGS: all water ---------- */
export function openUp(e, S, how, c, P) {
  const G = S.G, T = how === 'mud' ? DJ.mudT : how === 'bailed' ? DJ.bailT : DJ.openT;
  e.open = T; S.openTaken = 0; S.ward = 0; S.n.opens++; S.n[how]++; setMode(e, how, T + 0.05); S.bands = S.bands.filter(b => b.k !== 'devil' && b.k !== 'firedevil'); S.marks = []; S.hand = null;
  if (S.held) { c.release(S.held); S.held = null; }
  if (how === 'mud') { c.number(e.x, e.y - 100, 'MUD: HE IS SOLID. CUT HIM', '#8fd160'); c.fx('mud', e.x, G.floor); c.sound('soak'); }
  if (how === 'doused') { S.burn = false; S.flare = 0; c.number(e.x, e.y - 100, 'DOUSED: SMOKE AND CLAY. CUT HIM', '#8fd160'); c.fx('steam', e.x, G.floor); c.sound('soak'); }
  /* BAILED (claude/djinn2): the bucket knocks him out of the shaft WHERE HE IS - he spills in the flood under it. Nothing moves: you wade in */
  if (how === 'bailed') { S.pose = 'spilled'; e.y = G.floor; e.face = P && P.x < e.x ? -1 : 1;
    if (tideHigh(S)) { S.tide = { st: 'ebb', t: DJ.tideEbb }; }   /* (claude/djinn3: the bucket takes the well down with it - the surge ebbs, and you can wade in) */
    c.number(e.x, e.y - 90, 'THE BUCKET BAILS HIM OUT: WADE IN AND CUT HIM', '#8fd160'); c.fx('splash', e.x, e.y); c.sound('soak'); c.shake(5); }
}
/* A POUR AT HIM (the hero's E with a sip): phase one turns him to mud, phase two douses him; it must reach him (in front, near, on his floor). Warded, it
   reaches him and runs off (told) */
export function pourAim(e, S, hero) {
  if (!e || !e.alive || djOpen(e) || e.mode === 'sleep' || e.mode === 'wake' || TURNING.has(e.mode) || S.ph === 3 || S.pose !== 'floor') return null; const G = S.G;
  const d = (e.x - hero.x) * (hero.face || 1); if (d <= 0 || d > DJ.w / 2 + DJ.pourR || Math.abs(hero.y - G.floor) > 20) return null;
  const off = S.ward > 0 || (S.ph === 2 && !S.burn);
  return { x: e.x - (hero.face || 1) * (DJ.w / 2 - 4), y: G.floor - 30, what: off ? 'off' : S.ph === 1 ? 'sand' : 'fire' };
}
export function pourAt(e, S, hero, c) { const a = pourAim(e, S, hero); S.n.pours++; if (!a) { S.n.wasted++; return 'wasted'; }
  if (a.what === 'off') { S.n.wasted++; S.n.warded++; c.number(e.x, e.y - 100, S.ph === 1 ? 'THE SAND HARDENS: THE WATER RUNS OFF' : 'WHITE-HOT: THE WATER HISSES AWAY', '#9aa39a'); return 'off'; }
  openUp(e, S, a.what === 'sand' ? 'mud' : 'doused', c); return 'open'; }
/* THE WINDLASS / THE CRANK: the shaft's great bucket comes down (DJ.bucketFall); in phase three it bails him out of the shaft. It winds back in DJ.bucketCd */
/* (claude/djinn3) IN THE FLOOD THE BAIL IS TWO STEPS: the bucket lies down in the water - a strike WINDS it up (windT), a strike on it hanging DROPS it */
export function strikeWindlass(e, S, c) { const b = S.bucket, wet = S.ph === 3 && S.flood;
  if (wet && b.st === 'down') { if (b.t > 0) return false; b.st = 'wind'; b.t = DJ.windT; S.n.winds++; c.sound('windlass');
    if (!S.told.wind) { S.told.wind = 1; c.number(S.G.mid, S.G.vault + 30, 'THE BUCKET WINDS UP: STRIKE AGAIN TO DROP IT', '#7ab8e8'); } return true; }
  if (b.st !== 'up') return false; b.st = 'fall'; b.t = DJ.bucketFall; S.n.buckets++; c.sound('windlass'); c.number(S.G.mid, S.G.vault + 30, 'THE GREAT BUCKET COMES DOWN', '#7ab8e8'); return true; }
function stepBucket(e, S, dt, c) {
  const b = S.bucket, G = S.G, wet = S.ph === 3 && S.flood;
  if (b.st === 'wind') { b.t -= dt; if (b.t <= 0) { b.st = 'up'; b.t = 0; c.sound('windlass'); if (!S.told.cocked) { S.told.cocked = 1; c.number(G.mid, G.vault + 30, 'THE BUCKET HANGS READY: DROP IT WHEN HE IS UNDER THE SHAFT', '#8fd160'); } } }
  else if (b.st === 'fall') { b.t -= dt; if (b.t <= 0) { b.st = 'down'; b.t = wet ? DJ.bucketCd : 8; c.fx('splash', G.mid, G.floor); c.sound('splash');
    if (e.alive && !djOpen(e) && S.ph === 3 && S.pose === 'column' && !TURNING.has(e.mode)) {
      if (!underShaft(e, S)) { S.n.misses++; c.number(G.mid, G.floor - 70, 'IT MISSES: HE WAS NOT UNDER THE SHAFT', '#9aa39a'); }
      else if (S.ward > 0) c.number(e.x, e.y - 160, 'HIS SHROUD TURNS THE BUCKET', '#9aa39a'); else openUp(e, S, 'bailed', c, b.who); } } }
  else if (b.st === 'down' && b.t > 0) { b.t -= dt; if (b.t <= 0) { b.t = 0; if (!wet) { b.st = 'up'; c.sound('windlass'); } } }
}
/* ---------- WHAT FLIES, RUNS, ERUPTS, BURNS AND RISES ---------- */
function stepShots(e, S, dt, c) { const F = S.G.floor;
  for (const s of S.shots) { s.t -= dt; s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt; c.hit([s.x - 4, s.x + 4, s.y - 4, s.y + 4], DJ.dmg.blast, MOVE_NAME.blast, { key: s.key, blockable: true, onHit: () => { s.t = 0; } });
    if (s.y >= F - 2 && s.vy > 0) { c.fx('sand', s.x, F); s.t = 0; } }
  S.shots = S.shots.filter(s => s.t > 0); }
/* every band lives INSIDE the hall (x0..x1, its half-width off each wall); a ledge's crest lives on its ledge; a fire devil turns at a wall (a new pass can hit again) */
export function bandSpan(S, b) { const G = S.G; if (b.ledge) return b.dir < 0 ? [G.ledgeW[0] + 14, G.ledgeW[1]] : [G.ledgeE[0], G.ledgeE[1] - 14]; return [G.x0 + 14, G.x1 - 14]; }
function stepBands(e, S, dt, c) {
  for (const b of S.bands) {
    if (b.delay > 0) { b.delay -= dt; continue; }
    b.x += b.dir * b.speed * dt; const [lo, hi] = bandSpan(S, b);
    if (b.bounce) { b.life -= dt; if (b.x <= lo || b.x >= hi) { b.x = Math.max(lo, Math.min(hi, b.x)); b.dir = -b.dir; b.pass++; } if (b.life <= 0) b.done = true; }
    else if (b.x < lo || b.x > hi) { b.done = true; continue; }
    c.band(b.kind, b.y, b.x - 14, b.x + 14, b.dmg, b.name, b.bounce ? b.key + 'p' + b.pass : b.key, { ignite: !!b.ignite });
  }
  S.bands = S.bands.filter(b => !b.done); }
function stepMarks(e, S, dt, c) {
  for (const m of S.marks) { m.t -= dt;
    if (m.k === 'spear') { if (!m.fired && m.t <= 0) { m.fired = true; m.fire = DJ.spearT; c.sound('blast'); c.shake(2); c.fx('sand', m.x, m.y); }
      if (m.fire > 0) { m.fire -= dt; c.hit([m.x - DJ.spearR, m.x + DJ.spearR, m.y - 40, m.y + 2], DJ.dmg.spear, MOVE_NAME.spear, { key: m.key }); if (m.fire <= 0) m.done = true; } } }
  if (S.marks.some(m => m.done)) S.marks = S.marks.filter(m => !m.done); }
function heatBox(e, S) { if (S.pose !== 'floor' || e.mode === 'sleep') return null; const r = S.ward > 0 ? DJ.wardHeatR : DJ.heatR; return [e.x - DJ.w / 2 - r, e.x + DJ.w / 2 + r, e.y - DJ.h, e.y]; }
function stepFire(e, S, dt, c) {
  if (S.ph !== 2 || !e.alive) return;
  if (S.burn && !djOpen(e) && !TURNING.has(e.mode)) { S.heatK += dt; if (S.heatK >= DJ.heatTick) { S.heatK = 0; S.heatN++; const b = heatBox(e, S); if (b) c.hit(b, DJ.dmg.heat, MOVE_NAME.heat, { key: 'heat' + S.heatN, noKnock: true, ignite: true }); } } }
/* THE FLOOD (claude/djinn3: THE TIDE - low, the surge told, high over the ledges, the ebb; it starts once he has risen) */
function stepFlood(e, S, dt, h, c) {
  if (!S.flood) return; const G = S.G, hi = highWater(G), td = S.tide;
  if (e.alive && e.mode !== 'rise') { td.t -= dt;
    if (td.st === 'low' && td.t <= 0) { td.st = 'surge'; td.t = DJ.surgeTell; S.n.surges++; c.sound('surge'); c.mark('!!');
      if (!S.told.surge) { S.told.surge = 1; c.number(G.mid, G.ledgeY - 40, 'THE WELL SURGES: THE LEDGES GO UNDER', '#7ab8e8'); } }
    else if (td.st === 'surge' && td.t <= 0) { td.st = 'rising'; td.t = DJ.tideRise; c.sound('flood'); c.shake(3); }
    else if (td.st === 'rising' && td.t <= 0) { td.st = 'high'; td.t = DJ.tideHigh; }
    else if (td.st === 'high' && td.t <= 0) { td.st = 'ebb'; td.t = DJ.tideEbb; if (!S.told.ebb) { S.told.ebb = 1; c.number(G.mid, G.ledgeY - 40, 'THE WATER FALLS BACK: THE LEDGES ARE DRY', '#7ab8e8'); } }
    else if (td.st === 'ebb' && td.t <= 0) { td.st = 'low'; td.t = DJ.tideLow; } }
  const target = td.st === 'rising' || td.st === 'high' ? hi : DJ.waterH;
  const rate = td.st === 'rising' ? (hi - DJ.waterH) / DJ.tideRise : td.st === 'ebb' ? (hi - DJ.waterH) / DJ.tideEbb : DJ.waterH / DJ.floodT;
  if (Math.abs(S.water - target) > 0.01) { S.water = S.water < target ? Math.min(target, S.water + rate * dt) : Math.max(target, S.water - rate * dt); c.water(S.water); }
  const deep = S.water > G.floor - G.ledgeY + 4; if (TURNING.has(e.mode)) return;   /* (the breather: the water rises with him, and costs nothing until he has risen) */
  /* THE DEEP WATER: over the ledges, the floor is deep - a harder tick down there */
  if (deep) { S.deepK += dt; if (S.deepK >= DJ.deepTick) { S.deepK = 0; S.deepN = (S.deepN || 0) + 1; c.hit([G.x0, G.x1, G.ledgeY + 6, G.floor + 4], DJ.dmg.deep, MOVE_NAME.deep, { key: 'dp' + S.deepN, noKnock: true, flood: true, deep: true }); } }
  else S.deepK = 0;
  S.floodK += dt; if (S.floodK < DJ.floodTick) return; S.floodK = 0; S.floodN = (S.floodN || 0) + 1;
  c.hit([G.x0, G.x1, G.floor - S.water + 8, deep ? G.ledgeY + 6 : G.floor + 4], DJ.dmg.flood, MOVE_NAME.flood, { key: 'fl' + S.floodN, noKnock: true, flood: true });
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it reads a tell DJ_PLAN.react s after it began and misreads some (miss), lets some pours go (missPour). It fills the skin at a basin when it
   is dry, closes to pouring distance and pours (phase one: mud; phase two: douse) - and waits out his ward - cuts in the opening, keeps off his heat, ducks
   his breath, gets off the marks (pillars, spears, spouts), jumps the devils and the waves; in the flood it keeps to the floor by the windlass (the flood
   costs a little), strikes the windlass when the bucket is up, wades in to him when he is bailed out, strikes his hand, wades against the whirlpool and
   rolls out of the spout (or strikes out of it).
   s = { P: { x, y, face, ground, atk, climb, onLedge, snare, burn }, e, S, sips, reach, shield, t, rng, mem } -> { gx, face, atk, jump, block, dodge, talk, down, up, why } */
export const DJ_PLAN = { react: 0.25, miss: 0.13, missPour: 0.2, missHand: 0.25 };
export function djinnPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, talk: false, down: false, up: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0, sips = s.sips || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const key = e.mode + S.act, seen = () => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= DJ_PLAN.react; };
  const roll = (k, p) => { if (!mem.roll.has(k)) mem.roll.set(k, rng() < p); return mem.roll.get(k); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x)), side = Math.sign(P.x - e.x) || 1, ad = Math.abs(P.x - e.x), toHim = Math.sign(e.x - P.x) || 1;
  const onLedge = P.onLedge, misread = roll(key + 'm', DJ_PLAN.miss), m = e.mode;
  const offLedge = () => { if (onLedge) { out.down = true; out.jump = P.ground; } };
  if (P.snare > 0) { out.atk = P.atk < 0; out.why = 'strike out of the spout'; return out; }
  if (P.burn > 0 && sips > 0 && t - (mem.burnSeen ?? (mem.burnSeen = t)) >= DJ_PLAN.react) { out.talk = true; out.why = 'douse yourself'; return out; }
  if (!(P.burn > 0)) mem.burnSeen = undefined;
  /* 0. what runs, erupts and comes down at you */
  const band = S.bands.find(b => !(b.delay > 0) && Math.abs(b.x - P.x) < 110 && Math.sign(P.x - b.x) === b.dir && P.y > b.y[0] - 4 && P.y - 20 < b.y[1]);
  if (band && (band.bounce ? !roll('fd' + band.pass + band.key, DJ_PLAN.miss) : seen() && !misread) && Math.abs(band.x - P.x) < 70) { out.jump = P.ground || !!P.climb; out.why = 'jump the ' + band.k; return out; }
  const mk = S.marks.find(q => Math.abs(q.x - P.x) < DJ.pillarR + 14 && Math.abs(q.y - P.y) < 30);
  if (mk && !roll('mk' + mk.key, DJ_PLAN.miss) && t - (mem.seen.get('mk' + mk.key) ?? (mem.seen.set('mk' + mk.key, t), t)) >= DJ_PLAN.react) {
    const step = mk.k === 'pillar' ? 36 : mk.k === 'spear' ? 44 : 54; out.gx = clamp(P.x + (P.x <= mk.x ? -step : step)); if (mk.k === 'pillar' && (out.gx <= lo + 1 || out.gx >= hi - 1)) out.gx = clamp(P.x + (P.x <= mk.x ? step : -step)); if (onLedge) { const r = onLedge === 'W' ? G.ledgeW : G.ledgeE; out.gx = Math.max(r[0] + 8, Math.min(r[1] - 8, P.x + (P.x <= mk.x ? -40 : 40))); }
    if (Math.abs(mk.x - P.x) < 12 && mk.t < 0.3 && mk.k !== 'pillar') out.dodge = P.ground; out.why = 'off the ' + mk.k + ' mark'; return out; }
  if (m === 'breathTell' && seen() && !misread && ad < DJ.breathReach + 10 && Math.sign(P.x - e.x) === (e.face || 1)) { out.down = P.ground; out.why = 'duck the breath'; return out; }
  if (m === 'breath' && ad < DJ.breathReach + 10 && Math.sign(P.x - e.x) === (e.face || 1)) { out.down = P.ground; out.why = 'under the breath'; return out; }
  /* 0b. THE WHIRLPOOL: wade against it, away from the shaft */
  if (m === 'whirl' && !onLedge && !P.climb && Math.abs(P.x - G.mid) < 200) { out.gx = clamp(P.x + (Math.sign(P.x - G.mid) || 1) * 90); out.why = 'wade against the whirlpool'; return out; }
  /* 1. THE OPENING: on him (bailed out, he lies in the flood under the shaft: off the ledge and wade in) */
  if (djOpen(e)) { if (onLedge && e.y > G.ledgeY + 20) { offLedge(); out.gx = clamp(e.x); out.why = 'down into the flood'; return out; }
    out.gx = clamp(e.x - toHim * Math.max(8, reach * 0.6 + 8)); out.face = toHim; out.atk = ad < reach + DJ.w / 2 + 4 && Math.abs(P.y - e.y) < 40 && P.atk < 0; out.why = 'cut him: he is open'; return out; }
  /* 1b. HIS HAND (phase three) */
  const hd = handOut(S); if (hd && hd.stay > 0.2 && !roll('hand' + S.n.hands, DJ_PLAN.missHand)) { const L = hd.x < G.mid ? 'W' : 'E', onFloor = Math.abs(hd.y + 6 - G.floor) < 8;
    if (!onFloor && onLedge !== L) return climbTo(L);
    const sd = Math.sign(P.x - hd.x) || 1; out.gx = clamp(hd.x + sd * Math.max(6, reach * 0.6)); out.face = -sd; out.atk = Math.abs(P.x - hd.x) < reach + DJ.handR && P.atk < 0; out.why = 'strike his hand'; return out; }
  /* 2. HIS TELLS in front */
  if ((m === 'lashTell' || m === 'flashTell') && seen() && !misread && ad < DJ.lashReach + DJ.w / 2 + 20) { if (s.deflect && !(P.busy > 0)) { out.face = toHim; out.block = e.modeT < 0.22; out.why = 'deflect the lash on the beat'; return out; } if (s.shield) { out.block = true; out.face = toHim; out.why = 'block the lash'; return out; } out.gx = clamp(e.x + side * (DJ.lashReach + DJ.w / 2 + 34)); out.dodge = P.ground && ad < DJ.lashReach + DJ.w / 2 + 6 && e.modeT < 0.3; out.why = out.dodge ? 'roll out of the lash' : 'off the lash'; return out; }
  if ((m === 'lash' || m === 'flash') && ad < DJ.lashReach + DJ.w / 2 + 10) { if ((s.deflect && !(P.busy > 0)) || s.shield) { out.block = true; out.face = toHim; return out; } out.gx = clamp(e.x + side * (DJ.lashReach + DJ.w / 2 + 34)); out.why = 'off the lash'; return out; }
  if (m === 'blastTell' && seen() && !misread && s.shield) { out.block = true; out.face = toHim; out.why = 'block the sand'; return out; }
  if ((m === 'blastTell' || (S.shots.length && S.cur && S.cur.k === 'blast')) && !roll('bl' + S.act, DJ_PLAN.miss) && (m !== 'blastTell' || seen()) && !s.shield && S.cur && S.cur.x != null && Math.abs(P.x - S.cur.x) < 60) { out.gx = clamp(S.cur.x + (P.x >= e.x ? 1 : -1) * 72); out.why = 'out from under the sand'; return out; }
  /* 3. PHASE THREE (claude/djinn3): THE TIDE - when the well surges, up onto the east ledge (the crank is there); low, the floor's windlass. THE BAIL IS TWO
     STEPS - wind the bucket up when it is down, then drop it only when he is under the shaft (read a quarter-second late, and some go early) */
  if (S.ph === 3) { const high = tideHigh(S), b = S.bucket, turning = TURNING.has(m);
    if (onLedge === 'W' && !high) { offLedge(); out.why = 'off the west ledge'; return out; }
    if (high && !onLedge) { const toE = Math.abs(P.x - G.ladderE) <= Math.abs(P.x - G.ladderW) + 120; return climbTo(toE ? 'E' : 'W'); }
    if (onLedge === 'W') { out.gx = G.ledgeW[1] - 30; out.why = 'wait out the surge on the west ledge'; return out; }
    const canWind = b.st === 'down' && !(b.t > 0), under = underShaft(e, S) && !(S.ward > 0) && !turning, ukey = 'under' + S.act;
    if (under) { if (!mem.seen.has(ukey)) mem.seen.set(ukey, t); } const readUnder = under && t - mem.seen.get(ukey) >= DJ_PLAN.react && !roll(ukey + 'm', DJ_PLAN.miss);
    const want = canWind || (b.st === 'up' && readUnder), wx = onLedge === 'E' ? G.crank : G.windlass;
    if (want) { if (Math.abs(P.x - (wx + 12)) > 8) { out.gx = wx + 12; out.why = onLedge === 'E' ? 'to the crank' : 'to the windlass'; return out; } out.face = -1; out.atk = P.atk < 0; out.why = canWind ? 'wind the bucket up' : 'drop the bucket: he is under the shaft'; return out; }
    out.gx = wx + 14; out.face = -1; out.why = b.st === 'up' ? 'wait for him under the shaft' : 'wait by the windlass'; return out; }
  /* 4. PHASES ONE AND TWO: water - a dry skin goes to the nearest basin; a wet one closes to pouring distance and pours (not into his ward) */
  offLedge(); if (onLedge) return out;
  if (sips <= 0) { const bx = Math.abs(P.x - G.basinW) < Math.abs(P.x - G.basinE) ? G.basinW : G.basinE; if (Math.abs(P.x - bx) < 10 && P.ground) { out.talk = true; out.why = 'fill the skin'; return out; } out.gx = bx; out.why = 'to the basin'; return out; }
  const want = DJ.w / 2 + 36, busy = /Tell$/.test(m) && ad < want + 30;
  const heatR = S.ph === 2 && S.ward > 0 ? DJ.wardHeatR : DJ.heatR;
  if (S.ward > 0) { out.gx = clamp(e.x + side * (DJ.w / 2 + Math.max(70, heatR + 30))); out.face = toHim; out.why = 'wait out his ward'; return out; }
  if (!busy && ad < DJ.w / 2 + DJ.pourR - 6 && ad > DJ.w / 2 + heatR + 6 && P.ground && !roll(key + 'p', DJ_PLAN.missPour)) { out.face = toHim; out.talk = true; out.why = S.ph === 1 ? 'pour: mud' : 'douse him'; return out; }
  out.gx = clamp(e.x + side * want); out.face = toHim; out.why = 'to pouring distance';
  return out;
  function climbTo(L) { const lad = L === 'W' ? G.ladderW : G.ladderE, ledge = L === 'W' ? G.ledgeW : G.ledgeE, tx = L === 'W' ? ledge[1] - 30 : ledge[0] + 30;
    if (onLedge === L) { out.gx = tx; return out; }
    if (onLedge) { out.down = true; out.jump = P.ground; out.gx = lad; out.why = 'off the wrong ledge'; return out; }
    if (P.y <= G.ledgeY + 10) { out.gx = tx; out.jump = !!P.climb; out.why = 'onto the ledge'; return out; }
    if (Math.abs(P.x - lad) > 5 && !P.climb) { out.gx = lad; out.why = 'to the ledge ladder'; return out; }
    out.up = true; out.why = 'up to the ledge'; return out; }
}
