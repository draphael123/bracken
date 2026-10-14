// src/hourglass-king.js - THE HOURGLASS KING, THE BURIED CITY's boss (claude/buriedcity, the Opus greybox, 2026-10-08; reworked claude/buriedcity3, 2026-10-12).
// From the model in src/desert-bosses.js (HOURGLASS_KING: his chest is an hourglass that runs out and he turns himself over) and the desert-arc concept, rebuilt to
// today's rules (design standard B1-B16, B6 amended: tuned WITH FLASKS, 60-70% k/w/p).
//
// BURIED CITY 3 (Daniel played him live 10-12: "boring + too easy - you lure him back and forth"; scratch/brief-buriedcity3.md 4): HIS LOOK IS KEPT. He is faster
// (walk 42 -> 64), each phase CHANGES THE ARENA AND HIS MOVES, and four new TOLD moves (each its own sound + word + colour, its own pose, one windup at a time):
//   SAND SURGE   ('!!' "THE SAND SURGES", gold) his sceptre slams the floor: a tall wave runs from him at you - JUMP IT
//   GLASS RAIN   ('!!' "THE GLASS CRACKS", pale blue) his sceptre strikes up, the glass roof cracks: shards fall in told marks (one on you) - STEP OUT OF THE MARKS
//   BURIAL GRASP ('!!' "THE SAND TAKES HOLD", rust) sand hands circle under you, then rise: caught on the sand you are dragged down and held - JUMP OR DODGE OUT
//   TIME SLIP    ('!!' "HIS HOUR SLIPS BACK", violet) he glows; his ECHO stands where he was two seconds ago - he snaps back to it swinging. Keep off the echo, then
//                punish him where he lands (he stands a beat after it)
//
// WHAT HE IS (B11/B14/B15): A CONSTRUCT, A PUZZLE KING - his chest is AN HOURGLASS drawn on him all fight. Never a wall (B13/B15): outside his openings his BRASS
//   takes HK.resist of a blow (a told CLANK); when his glass runs out on its own he TURNS HIMSELF OVER (told) and while he turns a blow lands whole.
// HIS OPENING IS THE LEVEL'S VERB (B1) - BOTH halves of the city's rule:
//   PHASES ONE AND TWO: PULL A SAND-GATE AS HIS GLASS RUNS LOW (the throne room's two levers): the gate takes his last grains - HE STALLS (OPEN, B10: a gold ring and
//     a timer bar), dragged by the sand to the lever you pulled and stopped a step short (B12); B4 stalled he stands still; B3 a told ward after.
//   PHASE THREE: STRIKE THE GREAT HOURGLASS (the flip, the city's second verb): its sand POURS UP and DRAGS HIM INTO THE FLOW - his BIG opening (longer, a bigger
//     share). It runs back down before it can be turned again (its drawn gauge); the gates are dry now (a pull says so).
// THE PHASES CHANGE THE ARENA (B5):
//   ONE - THE THRONE FLOOR (to HK.p2): pendulum, gear, SAND SURGE, stream.
//   TWO - THE SANDS RISE (HK.p2 to HK.p3): the sand banks at the walls and THE FLOOR TURNS TO DRIFT (it holds you - jump, and keep jumping); two SANDSTONE BLOCKS
//     rise and sink by turns (told a second ahead) beside the chained ledges - the fight is on the ledges and blocks. A lever's stall drains the drift while he
//     stands open. New: BURIAL GRASP, GLASS RAIN.
//   THREE - THE GLASS CRACKS (HK.p3 to 0): his glass runs faster, two steady pours from the broken roof, the drift stays - but while THE GREAT HOURGLASS pours up
//     the floor is firm. New: TIME SLIP, THE HOUR (two low waves both ways from him).
// BURIED CITY 4 (brief-buriedcity4 item 4, claude/buriedcity4 - "not just pull levers and wait"): every move above and the levers KEPT, and HE WITHDRAWS (phases one and two,
//   every HK.aloft.every s once his glass is well up): told ("HE WITHDRAWS TO HIS SAND"), he glides to the FAR END of the room from you and a PILLAR OF SAND lifts him up
//   (HK_STAGE.aloft: over the end's bank, by the ledge on that side). From there he THROWS (each told, own windup + release pose, B16):
//   GLASS SHARDS ('!' "HE THROWS GLASS", pale blue) three shards in a fan at where you stand - BLOCK THEM (a shield turns them) or roll/step out of the line
//   A SAND POT   ('!!' "A POT OF SAND", rust) lobbed in an arc onto a told mark where you stand (floor or ledge) and burst - STEP OFF THE MARK
//   then THE SAND RISES TO HIM ("THE SAND RISES TO HIM: CLIMB AND STRIKE", gold): two TIMED SAND SLABS rise from that side's ledge toward his pillar, each with its own
//   DRAINING TIMER (red in its last HK.slabWarn s); the lower crumbles first. While they stand HE HOLDS THE SAND - OPEN (B10: the gold ring + a timer bar, 'OPEN') to
//   a blow from UP THERE (a blow from below the lowest slab is his brass: "CLIMB TO HIM"); when the top slab crumbles (or the opening's share is taken) the pillar sinks,
//   he comes down and WARDS (B3). Every hero climbs floor -> ledge -> slab -> slab with base movement (two-row steps, B12). His glass does not run while he is up.
// NO ADDS. PURE: no DOM, no main.js. The world is a context `c` (src/hourglass-king-hands.js binds it). hkPlan is the boss lab's HUMAN bot (src/lab.js).

export const HK = {
  hp: 2600, w: 20, h: 38, markH: 56,
  glass: 12, glass3: 8, lowAt: 0.48, lowAt3: 0.6,
  openMul: 2.0, openCap: 0.09, openT: 4.0, wardT: 3.0, wardMul: 0.4, resist: 0.45, turnT: 1.4, turnMul: 1.0, dragV: 300, dragStop: 40, fullJam: 1.6,
  p2: 0.6, p3: 0.25,
  walk: 64, keep: 46, gap: [0.45, 0.35, 0.25],   /* (claude/buriedcity3: walk 42 -> 64 - "you lure him back and forth") */
  pendTell: 0.62, pendT: 0.2, pendReach: 56, pendRange: 74,
  gearTell: 0.7, gearV: 165, gearR: 9,
  streamTell: 0.85, streamT: 0.45, streamR: 18,
  surgeTell: 0.9, surgeV: 190, surgeH: 26, surgeW: 12,                 /* SAND SURGE: a tall wave from him toward you (one way) */
  graspTell: 0.9, graspR: 20, graspHold: 0.8, graspUp: 0.35,            /* BURIAL GRASP: hands rise under your spot; caught on the sand you are held */
  rainTell: 1.0, rainN: 3, rainR: 11, rainT: 0.3, rainGap: 64,         /* GLASS RAIN: shards in told marks (one on you) */
  slipTell: 0.9, slipBack: 2.0, slipR: 26, slipRec: 0.9,                /* TIME SLIP: he snaps back to where he stood 2 s ago, swinging; then stands a beat */
  hourTell: 0.95, hourV: 210, hourH: 14,
  pourW: 22, pourTick: 0.42,
  great: { cd: 9.0, openT: 5.0, openCap: 0.12, dragV: 260 },          /* THE GREAT HOURGLASS (phase three's opening): its run back down, its open, its share */
  swap: 5.0, swapWarn: 1.0,                                             /* phase two's blocks: up/down by turns */
  tide: { every: 7.0, warn: 1.3, dur: 2.8 },                            /* phase two on: THE SAND TIDE - told, then the floor is DRIFT for dur s (take to a ledge or a block) */
  dmg: { pend: 39, gear: 28, stream: 35, surge: 30, grasp: 32, rain: 21, slip: 39, hour: 41, pour: 9, shard: 21, pot: 30 },   /* (claude/buriedcity4 tune: x1.15; x1.3 at 3000 hp read 67% but knight 0/3 - BC4's short tune measured 89% at 3500 hp / the old blows, fights 140-200 s) */
  /* (claude/buriedcity4) HE WITHDRAWS: every `every[ph]` s (0 = never: phase three is the great hourglass's), only while his glass is at least glassMin full; the glide, the
     pillar's rise and sink, the throws from up there (`throws[ph]`, shards and pots by turns), then THE SAND RISES: the slabs' lives (low, high) and the opening's share */
  aloft: { every: [0, 19, 16, 0], first: 15, glassMin: 0.7, glideV: 300, riseT: 0.6, sinkT: 0.45, perchT: 0.4, throws: [0, 2, 3, 0], life: [4.8, 8.0], openCap: 0.1, upTol: 6 },
  withdrawTell: 0.75, raiseTell: 0.8, throwRel: 0.3, throwRec: 0.5,
  shardTell: 0.75, shardN: 3, shardV: 230, shardSpread: 0.2, shardR: 5,   /* GLASS SHARDS: a fan of three at where you stand */
  potTell: 0.9, potFly: 0.8, potR: 26, potArc: 70,                       /* A SAND POT: lobbed onto a told mark, bursts */
  slabWarn: 0.8, stallHint: 7.0,                                         /* a slab's last red second; phase three's STRIKE THE GLASS said again after stallHint s ready */
};
/* EVERY CYCLE CHANGES: the order of each pass, by phase (cycle k uses [k % n]) */
export const CYCLES = {
  1: [['pend', 'gear', 'surge', 'stream'], ['surge', 'pend', 'stream', 'gear'], ['stream', 'pend', 'gear', 'surge']],
  2: [['grasp', 'pend', 'rain', 'surge'], ['rain', 'grasp', 'pend', 'gear'], ['pend', 'surge', 'grasp', 'rain']],
  3: [['slip', 'pend', 'hour', 'rain'], ['grasp', 'slip', 'pend', 'hour'], ['hour', 'rain', 'slip', 'pend']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows), its word and colour (said at the windup: B5 sound + word + colour) */
export const MOVES = {
  pendTell: { mark: '!', answer: 'block' }, gearTell: { mark: '!!', answer: 'jump' }, streamTell: { mark: '!!', answer: 'dodge' },
  surgeTell: { mark: '!!', answer: 'jump', word: 'THE SAND SURGES', col: '#ffd36b' }, graspTell: { mark: '!!', answer: 'dodge', word: 'THE SAND TAKES HOLD', col: '#d0703a' },
  rainTell: { mark: '!!', answer: 'dodge', word: 'THE GLASS CRACKS', col: '#bfe6f5' }, slipTell: { mark: '!!', answer: 'dodge', word: 'HIS HOUR SLIPS BACK', col: '#b08cff' },
  hourTell: { mark: '!!', answer: 'jump' },
  /* (claude/buriedcity4) from his pillar: the shards (blockable: '!') and the pot (unblockable: '!!'); the withdraw and the rising sand are told with words (no blow in them) */
  shardTell: { mark: '!', answer: 'block', word: 'HE THROWS GLASS', col: '#9fe0ff' }, potTell: { mark: '!!', answer: 'dodge', word: 'A POT OF SAND', col: '#d0703a' },
  withdrawTell: { word: 'HE WITHDRAWS TO HIS SAND', col: '#e2bb7a' }, raiseTell: { word: 'THE SAND RISES TO HIM: CLIMB AND STRIKE', col: '#ffd36b' },
};
/* the lines said as variables (src/hint-lines.js routes them: SAY_LINES) - his new moves' words and the great glass's opening */
export const GREAT_LINE = 'THE GREAT GLASS TURNS: THE SAND TAKES HIM - STRIKE';
/* (claude/buriedcity4) the lines of his withdraw, his slabs and phase three's plain read (said as variables: routed through HK_SAY) */
export const AL_SAY = { climb: 'CLIMB TO HIM: HIS BRASS TAKES IT FROM BELOW', crumble: 'THE SAND CRUMBLES: HE COMES DOWN', aloft: 'HE STANDS ABOVE THE GATES: CLIMB HIS SAND', fall: 'THE GATE TAKES HIS LAST GRAINS: HE FALLS', dry: 'THE GATES RUN DRY: THE LEVERS ARE DEAD', strike: 'STRIKE THE GREAT HOURGLASS: E OR A BLOW' };
export const HK_SAY = [...Object.values(MOVES).map(m => m.word).filter(Boolean), GREAT_LINE, ...Object.values(AL_SAY)];
export const MOVE_NAME = { pend: 'HIS PENDULUM', gear: 'A BRASS GEAR', stream: 'THE SAND STREAM', surge: 'THE SAND SURGE', grasp: 'THE BURIAL GRASP', rain: 'THE GLASS RAIN', slip: 'THE TIME SLIP', hour: 'THE HOUR', pour: 'THE POURING SAND', shard: 'THE GLASS SHARDS', pot: 'THE SAND POT' };

/* ---------- THE THRONE ROOM ---------- */
/* local columns (0..39), the floor's surface row R (the hero stands on R-1). Two SAND-GATE LEVERS on the walls, two ROOF HOLES (phase three's pours), two LEDGES
   (one-way, on chains), the BANKS phase two piles at the ends, THE DRIFT phase two lays on the floor (clear of the levers), the two SANDSTONE BLOCKS that rise and
   sink by turns (phase two on), THE GREAT HOURGLASS (phase three's opening) before the THRONE */
export const HK_STAGE = { W: 40, door: 6, levers: [3, 36], pours: [12, 27], ledges: [{ x0: 8, x1: 13, dy: 3 }, { x0: 26, x1: 31, dy: 3 }], banks: [[0, 2], [37, 39]], bankRows: 3, king: 20, throne: 20,
  drift: [6, 33], blocks: [{ x0: 16, x1: 17, rows: 2 }, { x0: 22, x1: 23, rows: 2 }], great: 20,
  /* (claude/buriedcity4) HIS PILLAR at the east end (the west mirrors it, col c -> W-1-c) and the stair of TIMED SLABS up to it from that side's ledge (dy 3): the low slab
     overlaps the ledge's end by a column (jump straight up through it - the slabs are one-way), the high one is a column's gap on and meets the pillar's top (two-row steps) */
  aloft: { perch: [38, 39], dy: 7, slabs: [{ x0: 31, x1: 33, dy: 5 }, { x0: 35, x1: 37, dy: 7 }] } };
export function stageHourglassKing(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + HK_STAGE.W;
  const carve = () => {
    air(sx, ex - 1, R - 18, R - 1);
    block(sx - 1, sx - 1, R - 22, R - HK_STAGE.door - 1);   /* his west wall over the door you came in by (shut behind you) */
    block(ex, ex, R - 22, R - 1);
    block(sx - 1, ex, R - 22, R - 19);                       /* the throne room's roof (the city's sand is over it) */
    for (const l of HK_STAGE.ledges) for (let x = sx + l.x0; x <= sx + l.x1; x++) set(x, R - l.dy, T.ONEWAY);
    for (const [i, x] of HK_STAGE.levers.entries()) ent('sandlever', sx + x, R - 1, { id: 'throne' + (i ? 'E' : 'W'), arena: true });
    ent('hourglassking', sx + HK_STAGE.king, R - 1, { face: -1 });
  };
  const arena = { x0: sx * TS, x1: ex * TS, floor: R * TS, trigger: (sx + 2) * TS, wallL: sx - 1, wallR: ex, boss: 'hourglassking', music: 'hourglassking',
    tint: '#d8b070', tintA: 0.06, start: [sx + 2, R - 1], y0: (R - 18) * TS, y1: (R + 1) * TS, hk: { sx, R } };
  return { arena, carve, levers: HK_STAGE.levers.map((x, i) => ({ id: 'throne' + (i ? 'E' : 'W'), x: sx + x, row: R - 1, arena: true })) };
}
/* the throne room in world px, from the arena */
export function geom(A, TS = 16) {
  const q = A.hk, X = c => (q.sx + c) * TS;
  return { TS, x0: X(0), x1: X(HK_STAGE.W), floorY: q.R * TS, roofY: (q.R - 18) * TS, sx: q.sx, R: q.R,
    levers: HK_STAGE.levers.map((x, i) => ({ id: 'throne' + (i ? 'E' : 'W'), x: X(x) + 8 })),
    pours: HK_STAGE.pours.map(c => X(c) + 8), banks: HK_STAGE.banks.map(([a, b]) => [X(a), X(b + 1)]), bankTop: (q.R - HK_STAGE.bankRows) * TS,
    ledges: HK_STAGE.ledges.map(l => ({ x0: X(l.x0), x1: X(l.x1 + 1), y: (q.R - l.dy) * TS })),
    drift: [X(HK_STAGE.drift[0]), X(HK_STAGE.drift[1] + 1)], blocks: HK_STAGE.blocks.map(b => ({ x0: X(b.x0), x1: X(b.x1 + 1), y: (q.R - b.rows) * TS, c0: q.sx + b.x0, c1: q.sx + b.x1, rows: b.rows })),
    great: X(HK_STAGE.great) + 8, aloft: { E: aloftSide(q, X, TS, 'E'), W: aloftSide(q, X, TS, 'W') } };
}

/* one end's pillar + stair in px and cells (the west is the east mirrored) */
function aloftSide(q, X, TS, side) { const A = HK_STAGE.aloft, m = c => (side === 'E' ? c : HK_STAGE.W - 1 - c), span = (a, b) => [Math.min(m(a), m(b)), Math.max(m(a), m(b))];
  const [p0, p1] = span(...A.perch), led = HK_STAGE.ledges[side === 'E' ? 1 : 0], dir = side === 'E' ? 1 : -1;
  return { side, dir, x0: X(p0), x1: X(p1 + 1), c0: q.sx + p0, c1: q.sx + p1, rows: A.dy, y: (q.R - A.dy) * TS, kx: (X(p0) + X(p1 + 1)) / 2,
    ledge: { x0: X(led.x0), x1: X(led.x1 + 1), y: (q.R - led.dy) * TS },
    slabs: A.slabs.map(s => { const [a, b] = span(s.x0, s.x1); return { x0: X(a), x1: X(b + 1), y: (q.R - s.dy) * TS, c0: q.sx + a, c1: q.sx + b, row: q.R - s.dy }; }) }; }
/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, glass: HK.glass, glassMax: HK.glass, ward: 0, openTaken: 0, capNow: HK.openCap, dragTo: null, dragV: HK.dragV, lowSaid: false, mark: null,
    gears: [], waves: [], stream: null, pourT: 0, jamT: 0, told: {}, trail: [], echo: null, rain: null, grasp: null, great: { cd: 0, run: 0 }, drift: false, tide: { t: HK.tide.every, on: false, said: 0 }, blockUp: 0, swapT: HK.swap, t: 0, al: null, shards: [], pots: [], wdT: HK.aloft.first, greatIdle: 0,
    n: { cycles: 0, opens: 0, greatOpens: 0, turns: 0, pulls: 0, pullsFull: 0, pullsWard: 0, pullsDry: 0, wards: 0, warded: 0, brass: 0, turnHits: 0, gears: 0, streams: 0, surges: 0, grasps: 0, held: 0, rains: 0, slips: 0, hours: 0, pends: 0, flips: 0, withdraws: 0, shards: 0, pots: 0, holds: 0, climbed: 0, holdHits: 0, crumbles: 0, falls: 0, strikeHints: 0, moves: {} } };
}
export const hPhase = e => (e.hp <= e.maxHp * HK.p3 ? 3 : e.hp <= e.maxHp * HK.p2 ? 2 : 1);
export const hkOpen = e => !!e && (e.mode === 'stall' || e.mode === 'hold') && (e.open || 0) > 0;   /* (claude/buriedcity4: 'hold' - up on his pillar, holding the slabs) */
export const aloft = S => !!(S && S.al);
export const ALOFT_MODES = /^(withdrawTell|glide|rise|perch|shardTell|shardRel|potTell|potRel|raiseTell|hold|sink)$/;
export const lowOf = ph => (ph === 3 ? HK.lowAt3 : HK.lowAt);   /* the share of his glass that is LOW (a pull stalls him), by phase */
export const glassLow = S => !!S && S.glass <= S.glassMax * lowOf(S.ph);
export const turning = e => !!e && e.mode === 'turn';
export const greatReady = S => !!S && S.ph === 3 && S.great.cd <= 0 && S.ward <= 0;
/* is THE DRIFT on the floor now (phase two on, but not while a stall drains it or THE GREAT HOURGLASS pours up) */
export const driftOn = (e, S) => !!S && S.ph >= 2 && S.tide.on && !(hkOpen(e)) && !(S.great.run > 0);
export const tideComing = S => !!S && S.ph >= 2 && (S.tide.on || S.tide.t <= HK.tide.warn);
const BLOWS = new Set(['pend', 'slipStrike']);
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 18, Math.min(G.x1 - 18, x));
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell');
  if (mv && mv.word) c.number(e.x, e.y - 86, mv.word, mv.col); }
function endOpen(e, S, c) { e.open = 0; S.ward = HK.wardT; S.n.wards++; S.openTaken = 0; S.dragTo = null; S.glass = S.glassMax; S.lowSaid = false; S.capNow = HK.openCap; S.dragV = HK.dragV;
  c.number(e.x, e.y - 74, 'HE TURNS HIS GLASS OVER, FULL: HE GUARDS', '#c8d8e8'); c.sound('turn'); c.fx('ward', e.x, e.y); }
function open(e, S, c, toX, o = {}) { setMode(e, 'stall', (o.t || HK.openT) + 0.05); e.open = o.t || HK.openT; S.openTaken = 0; S.n.opens++; S.glass = 0; S.mark = null; S.rain = null; S.grasp = null; S.echo = null;
  S.capNow = o.cap || HK.openCap; S.dragV = o.dragV || HK.dragV;
  const side = Math.sign(e.x - toX) || 1; S.dragTo = clampX(S.G, toX + side * (o.stop ?? HK.dragStop));
  c.fx('open', e.x, e.y); c.sound('stall'); c.shake(3); c.number(e.x, e.y - 74, o.line || 'THE GATE TAKES HIS LAST GRAINS: HE STALLS - STRIKE', '#8fd160'); }

/* ---------- THE RULE ON HIM (the hands call these) ----------
   A SAND-GATE LEVER PULLED at x (px): 'stall' | 'full' | 'ward' | 'dry' (phase three: the gates are dry) | 'busy' */
export function leverPulled(e, S, c, x) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'stall' || e.mode === 'hold' || e.mode === 'sink' || e.mode === 'die') return 'busy';
  S.n.pulls++;
  if (S.ph >= 3) { S.n.pullsDry++; c.number(x, S.G.floorY - 60, 'THE GATES ARE DRY: TURN THE GREAT HOURGLASS', '#ffd36b'); return 'dry'; }
  if (S.ward > 0 || e.mode === 'turn') { S.n.pullsWard++; c.number(x, S.G.floorY - 60, 'HIS GLASS IS TURNING: THE GATE FINDS NOTHING', '#9aa39a'); return 'ward'; }
  if (!glassLow(S)) { S.n.pullsFull++; if (S.al) { c.number(x, S.G.floorY - 60, AL_SAY.aloft, '#9aa39a'); return 'aloft'; } c.number(x, S.G.floorY - 60, 'HIS GLASS IS FULL: NOT YET', '#9aa39a'); return 'full'; }
  if (S.al) { S.n.falls++; land(e, S, c); c.number(e.x, e.y - 90, AL_SAY.fall, '#8fd160'); }   /* (claude/buriedcity4: a gate pulled as his glass runs low takes him off his pillar too) */
  S.slip = null; open(e, S, c, x); return 'stall';
}
/* (claude/buriedcity4) HE COMES DOWN at once (a gate's stall, a phase): the slabs and his pillar go, he stands on the floor */
function land(e, S, c) { const A = S.al; if (!A) return; for (const q of A.slabs) if (q.up) { q.up = false; if (c.slab) c.slab(A.side, q.i, false); }
  if (A.pillar && c.pillar) c.pillar(A.side, false); S.al = null; e.y = S.G.floorY; if (S.mark && S.mark.k === 'pot') S.mark = null; S.wdT = HK.aloft.every[S.ph] || 99; }
/* THE GREAT HOURGLASS STRUCK (a blow or E on it): phase three's opening - 'flip' | 'early' (not phase three) | 'running' (its sand still runs back) | 'ward' | 'busy' */
export function greatStruck(e, S, c) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'die') return 'busy';
  const G = S.G;
  if (S.ph < 3) { if (!S.told.greatEarly) { S.told.greatEarly = 1; c.number(G.great, G.floorY - 70, 'THE GREAT GLASS IS FAST IN ITS FRAME - NOT YET', '#9aa39a'); } return 'early'; }
  if (hkOpen(e)) return 'busy';
  if (S.great.cd > 0) { c.number(G.great, G.floorY - 70, 'ITS SAND STILL RUNS BACK DOWN', '#9aa39a'); return 'running'; }
  if (S.ward > 0) { c.number(G.great, G.floorY - 70, 'HE GUARDS HIS GLASS: WAIT', '#9aa39a'); return 'ward'; }
  S.n.flips++; S.n.greatOpens++; S.great.cd = HK.great.cd + HK.great.openT; S.great.run = HK.great.openT;
  S.gears = []; S.waves = []; S.stream = null;
  open(e, S, c, G.great, { t: HK.great.openT, cap: HK.great.openCap, dragV: HK.great.dragV, stop: 22, line: GREAT_LINE });
  c.sound('rumble'); c.shake(6); c.fx('great', G.great, G.floorY); return 'flip';
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, air, pp, dodge }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)  c.banks(on)  c.hold(pp, s)  c.time() ---------- */
export function stepHourglassKing(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  S.t += dt; e.modeT -= dt; e.y = S.al ? S.al.y : G.floorY;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  if (S.great.cd > 0) S.great.cd = Math.max(0, S.great.cd - dt); if (S.great.run > 0) S.great.run = Math.max(0, S.great.run - dt);
  /* his TRAIL (the time slip's echo is where he stood HK.slipBack s ago) */
  S.trail.push([S.t, e.x]); while (S.trail.length > 2 && S.trail[1][0] < S.t - HK.slipBack - 0.5) S.trail.shift();
  stepGears(S, dt, c); stepWaves(S, dt, c); stepStream(e, S, dt, c); stepRain(S, dt, c); stepGrasp(S, dt, h, c); stepShots(S, dt, c);
  if (S.ph === 3) stepPours(S, dt, h, c);
  if (S.ph >= 2) { stepBlocks(S, dt, c); stepTide(S, dt, c); }
  S.drift = driftOn(e, S);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = CYCLES[1][0].slice(); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* HIS GLASS: it runs while he fights; empty, he turns himself over (told). Stalled or warded it does not run */
  if (!S.al && S.ph < 3 && HK.aloft.every[S.ph] && !hkOpen(e) && S.ward <= 0 && e.mode !== 'turn') S.wdT -= dt;   /* (claude/buriedcity4) the time to his next withdraw runs while he fights on the floor */
  /* (claude/buriedcity4) PHASE THREE READS PLAIN: the gates are said dry a beat after the crack, and THE GREAT HOURGLASS left ready is called again every HK.stallHint s */
  if (S.dryT > 0) { S.dryT -= dt; if (S.dryT <= 0) for (const lv of G.levers) c.number(lv.x, G.floorY - 64, AL_SAY.dry, '#9aa39a'); }
  if (S.ph === 3 && greatReady(S) && !hkOpen(e) && e.mode !== 'sleep' && e.mode !== 'wake') { S.greatIdle += dt; if (S.greatIdle >= HK.stallHint) { S.greatIdle = 0; S.n.strikeHints++; c.number(G.great, G.floorY - 96, AL_SAY.strike, '#ffd36b'); c.fx('great', G.great, G.floorY); c.sound('chime'); } } else S.greatIdle = 0;
  if (e.mode !== 'stall' && e.mode !== 'turn' && S.ward <= 0 && !S.al) {
    S.glass = Math.max(0, S.glass - dt);
    if (glassLow(S) && !S.lowSaid && S.ph < 3) { S.lowSaid = true; c.sound('chime'); if (!S.told.low || S.n.opens < 2) { S.told.low = (S.told.low || 0) + 1; c.number(e.x, e.y - 74, 'HIS GLASS RUNS LOW: PULL A SAND-GATE', '#ffd36b'); } }
    if (S.glass <= 0 && !/Tell$/.test(e.mode) && !BLOWS.has(e.mode) && e.mode !== 'slipRec') { setMode(e, 'turn', HK.turnT); S.n.turns++; S.mark = null; c.sound('turn'); c.number(e.x, e.y - 74, 'HIS GLASS IS EMPTY: HE TURNS IT OVER', '#e8d0a0'); return; }
  }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = hPhase(e);
  if (want > S.ph && S.al && !hkOpen(e) && e.mode !== 'sink') { land(e, S, c); setMode(e, 'recover', 0.3); }   /* (claude/buriedcity4: a new phase brings him down off his pillar first) */
  if (want > S.ph && !hkOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want); S.mark = null; S.rain = null; S.grasp = null; S.echo = null;
    if (want === 2) { c.number((G.x0 + G.x1) / 2, G.floorY - 120, 'THE SANDS RISE: THE TIDE WILL TAKE THE FLOOR - THE LEDGES', '#ff9a5c'); S.tide.t = HK.tide.every * 0.6; S.wdT = Math.min(S.wdT, HK.aloft.every[2] * 0.6); c.banks(true); c.shake(5); c.sound('rumble'); S.blockUp = 0; S.swapT = HK.swap; setMode(e, 'recover', 0.9); return; }
    if (want === 3) { c.banks(true);
      S.glassMax = HK.glass3; S.glass = Math.min(S.glass, S.glassMax); c.number((G.x0 + G.x1) / 2, G.floorY - 120, 'HIS GLASS CRACKS: STRIKE THE GREAT HOURGLASS', '#ff6b6b'); S.dryT = 2.6; S.greatIdle = 0; c.shake(6); c.sound('rumble'); setMode(e, 'recover', 0.9); return; } }
  if (ALOFT_MODES.test(e.mode)) { stepAloft(e, S, dt, P, c); return; }
  switch (e.mode) {
    case 'stall': {   /* B4: he stands where the sand drags him, frozen - the drag is the opening coming to you (B12) */
      if (S.dragTo != null) { const d = S.dragTo - e.x; if (Math.abs(d) > 2) e.x = clampX(G, e.x + Math.sign(d) * Math.min(Math.abs(d), S.dragV * dt)); else S.dragTo = null; }
      if (e.open <= 0) { endOpen(e, S, c); setMode(e, 'recover', 0.5); } return; }
    case 'turn': if (e.modeT <= 0) { S.glass = S.glassMax; S.lowSaid = false; setMode(e, 'recover', 0.4); } return;
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'slipRec': if (e.modeT <= 0) setMode(e, 'recover', HK.gap[S.ph - 1]); return;   /* (he stands a beat where the slip put him: punish him there) */
    case 'walk': {
      const d = P.x - e.x; e.face = Math.sign(d) || e.face;
      if (Math.abs(d) > HK.keep) e.x = clampX(G, e.x + Math.sign(d) * HK.walk * dt);
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
  }
  stepMove(e, S, dt, P, c);
}
function nextMove(e, S, P, c) {
  /* (claude/buriedcity4) HE WITHDRAWS: his time has come, his glass is well up (a pull is not his to steal), phases one and two - to the end of the room away from you */
  if (S.wdT <= 0 && !S.al && S.ph < 3 && HK.aloft.every[S.ph] && S.glass >= S.glassMax * HK.aloft.glassMin) { const G = S.G, side = P.x < (G.x0 + G.x1) / 2 ? 'E' : 'W', A0 = G.aloft[side];
    S.al = { side, dir: A0.dir, kx: A0.kx, top: A0.y, y: G.floorY, throws: HK.aloft.throws[S.ph], next: 0, slabs: [], pillar: false }; S.n.withdraws++; S.wdT = 99; S.mark = null;
    e.face = Math.sign(A0.kx - e.x) || e.face; tell(e, S, c, 'withdrawTell', HK.withdrawTell); return; }
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; const set = CYCLES[S.ph]; S.script = set[S.cycle % set.length].slice(); S.step = 0; }
  const m = S.script[S.step++], dx = P.x - e.x, ad = Math.abs(dx), G = S.G;
  e.face = Math.sign(dx) || e.face;
  if (m === 'pend' && ad > HK.pendRange) { setMode(e, 'walk', 0.5); S.step--; return; }   /* out of the sceptre's reach: he closes first */
  switch (m) {
    case 'pend': S.n.pends++; tell(e, S, c, 'pendTell', HK.pendTell); return;
    case 'gear': S.n.gears++; tell(e, S, c, 'gearTell', HK.gearTell); return;
    case 'stream': S.n.streams++; tell(e, S, c, 'streamTell', HK.streamTell); S.mark = { x: clampX(G, P.x), k: 'stream' }; c.fx('mark', S.mark.x, G.floorY); return;
    case 'surge': S.n.surges++; tell(e, S, c, 'surgeTell', HK.surgeTell); return;
    case 'grasp': S.n.grasps++; tell(e, S, c, 'graspTell', HK.graspTell); S.mark = { x: clampX(G, P.x), k: 'grasp' }; c.fx('grasp', S.mark.x, G.floorY); return;
    case 'rain': { S.n.rains++; tell(e, S, c, 'rainTell', HK.rainTell); const xs = [clampX(G, P.x)]; const r = (S.act * 7919) % 97 / 97;
      for (let k = 1; xs.length < HK.rainN && k < 8; k++) { const x = clampX(G, P.x + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * HK.rainGap * (0.9 + r * 0.3)); if (!xs.some(q => Math.abs(q - x) < HK.rainR * 2 + 4)) xs.push(x); }
      S.rain = { xs, t: 0, fell: false, key: 'rain' + S.act }; for (const x of xs) c.fx('rainMark', x, G.floorY); return; }
    case 'slip': { S.n.slips++; tell(e, S, c, 'slipTell', HK.slipTell); const back = S.trail.find(q => q[0] >= S.t - HK.slipBack) || S.trail[0]; S.echo = { x: back ? back[1] : e.x }; c.fx('echo', S.echo.x, G.floorY); return; }
    case 'hour': S.n.hours++; tell(e, S, c, 'hourTell', HK.hourTell); return;
  }
  setMode(e, 'walk', 0.5);
}
/* (claude/buriedcity4) UP ON HIS PILLAR: the glide to it, its rise, the throws (shards and pots by turns), THE SAND RISES (the slabs: OPEN while they stand), the sink + ward */
function stepAloft(e, S, dt, P, c) { const G = S.G, A = S.al, AL = HK.aloft; if (!A) { setMode(e, 'recover', 0.3); return; }
  switch (e.mode) {
    case 'withdrawTell': if (e.modeT <= 0) setMode(e, 'glide', 4); return;
    case 'glide': { const d = A.kx - e.x; e.face = Math.sign(d) || e.face;
      if (Math.abs(d) > 2) { e.x += Math.sign(d) * Math.min(Math.abs(d), AL.glideV * dt); return; }
      e.x = A.kx; A.pillar = true; if (c.pillar) c.pillar(A.side, true); c.sound('rumble'); c.shake(3); c.fx('erupt', e.x, G.floorY); setMode(e, 'rise', AL.riseT); return; }
    case 'rise': { const k = Math.min(1, 1 - Math.max(0, e.modeT) / AL.riseT); A.y = G.floorY + (A.top - G.floorY) * k; e.face = -A.dir; if (e.modeT <= 0) { A.y = A.top; setMode(e, 'perch', AL.perchT); } e.y = A.y; return; }
    case 'perch': e.face = -A.dir; if (e.modeT > 0) return;
      if (A.throws > 0) { A.throws--; A.next++;
        if (A.next % 2) { S.n.shards++; tell(e, S, c, 'shardTell', HK.shardTell); A.aim = { x: P.x, y: P.y - 10 }; }
        else { S.n.pots++; tell(e, S, c, 'potTell', HK.potTell); const up = P.ground && P.y < G.floorY - 4; S.mark = { x: clampX(G, P.x), y: up ? P.y : G.floorY, k: 'pot' }; c.fx('mark', S.mark.x, S.mark.y); }
        return; }
      tell(e, S, c, 'raiseTell', HK.raiseTell); return;
    case 'shardTell': if (e.modeT > 0) { if (A.aim) { const k = Math.min(1, dt * 8); A.aim.x += (P.x - A.aim.x) * k; A.aim.y += (P.y - 10 - A.aim.y) * k; } return; }   /* (he tracks you through the windup; the fan flies at where you stood as he lets go) */
      { const x0 = e.x - A.dir * 8, y0 = e.y - 30, a = Math.atan2((A.aim ? A.aim.y : P.y - 10) - y0, (A.aim ? A.aim.x : P.x) - x0);
        for (let i = 0; i < HK.shardN; i++) { const q = a + (i - (HK.shardN - 1) / 2) * HK.shardSpread; S.shards.push({ x: x0, y: y0, vx: Math.cos(q) * HK.shardV, vy: Math.sin(q) * HK.shardV, key: 'shard' + S.act }); }
        c.sound('crack'); setMode(e, 'shardRel', HK.throwRel); } return;
    case 'potTell': if (e.modeT > 0) return;
      S.pots.push({ x0: e.x - A.dir * 6, y0: e.y - 44, x1: S.mark ? S.mark.x : P.x, y1: S.mark ? S.mark.y : G.floorY, t: 0, x: e.x, y: e.y - 44, key: 'pot' + S.act }); c.sound('swing'); setMode(e, 'potRel', HK.throwRel); return;
    case 'shardRel': case 'potRel': if (e.modeT <= 0) setMode(e, 'perch', HK.throwRec); return;
    case 'raiseTell': if (e.modeT > 0) return;
      A.slabs = AL.life.map((life, i) => ({ i, life, t: life, up: true })); for (const q of A.slabs) if (c.slab) c.slab(A.side, q.i, true);
      S.n.holds++; S.n.opens++; S.openTaken = 0; S.capNow = AL.openCap; e.open = AL.life[AL.life.length - 1]; setMode(e, 'hold', e.open + 0.05);
      c.fx('open', e.x, e.y); c.sound('stall'); c.shake(2); return;
    case 'hold': { for (const q of A.slabs) if (q.up) { q.t = Math.max(0, q.t - dt); if (q.t <= 0) { q.up = false; S.n.crumbles++; if (c.slab) c.slab(A.side, q.i, false); c.sound('stall'); } }
      if (e.open > 0 && A.slabs.some(q => q.up)) return;
      for (const q of A.slabs) if (q.up) { q.up = false; if (c.slab) c.slab(A.side, q.i, false); }
      e.open = 0; c.number(e.x, e.y - 74, AL_SAY.crumble, '#c8d8e8'); A.pillar = false; if (c.pillar) c.pillar(A.side, false); c.sound('rumble'); setMode(e, 'sink', AL.sinkT); return; }
    case 'sink': { const k = Math.min(1, 1 - Math.max(0, e.modeT) / AL.sinkT); A.y = A.top + (G.floorY - A.top) * k; e.y = A.y;
      if (e.modeT <= 0) { S.al = null; e.y = G.floorY; endOpen(e, S, c); S.wdT = AL.every[S.ph] || 99; setMode(e, 'recover', 0.5); } return; }
  }
}
/* his throws in the air: the shards fly straight (to the walls, the floor), the pot arcs onto its mark and bursts there */
function stepShots(S, dt, c) { const G = S.G;
  for (const q of S.shards) { q.x += q.vx * dt; q.y += q.vy * dt; if (q.x < G.x0 || q.x > G.x1 || q.y > G.floorY + 2 || q.y < G.roofY) { q.done = true; continue; }
    if (c.hit([q.x - HK.shardR, q.x + HK.shardR, q.y - HK.shardR, q.y + HK.shardR], HK.dmg.shard, MOVE_NAME.shard, { key: q.key, blockable: true, noKnock: true })) q.done = true; }
  S.shards = S.shards.filter(q => !q.done);
  for (const q of S.pots) { q.t += dt; const u = Math.min(1, q.t / HK.potFly); q.x = q.x0 + (q.x1 - q.x0) * u; q.y = q.y0 + (q.y1 - q.y0) * u - HK.potArc * 4 * u * (1 - u);
    if (u < 1) continue; q.done = true; c.hit([q.x1 - HK.potR, q.x1 + HK.potR, q.y1 - 28, q.y1 + 2], HK.dmg.pot, MOVE_NAME.pot, { key: q.key }); c.fx('pile', q.x1, q.y1); c.sound('crack'); c.shake(2);
    if (S.mark && S.mark.k === 'pot') S.mark = null; }
  S.pots = S.pots.filter(q => !q.done); }
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, c) {
  const G = S.G, f = e.face || 1, after = (t) => setMode(e, 'recover', t ?? HK.gap[S.ph - 1]);
  switch (e.mode) {
    case 'pendTell': if (e.modeT <= 0) { setMode(e, 'pend', HK.pendT); c.sound('swing');
        c.hit([f > 0 ? e.x - 4 : e.x - HK.pendReach, f > 0 ? e.x + HK.pendReach : e.x + 4, e.y - 34, e.y], HK.dmg.pend, MOVE_NAME.pend, { blockable: true, key: 'pend' + S.act }); } return;
    case 'pend': if (e.modeT <= 0) after(); return;
    case 'gearTell': if (e.modeT <= 0) { S.gears.push({ x: e.x + f * 8, dir: f, key: 'gear' + S.act }); c.sound('gear'); after(0.45); } return;
    case 'streamTell': if (e.modeT <= 0) { S.stream = { x: S.mark ? S.mark.x : P.x, t: HK.streamT, key: 'stream' + S.act }; S.mark = null; c.sound('pour'); after(0.4); } return;
    case 'surgeTell': if (e.modeT <= 0) { S.waves.push({ x: e.x + f * 10, dir: f, key: 'surge' + S.act, k: 'surge', h: HK.surgeH, v: HK.surgeV, w: HK.surgeW, dmg: HK.dmg.surge, name: MOVE_NAME.surge }); c.sound('rumble'); c.shake(4); after(0.5); } return;
    case 'graspTell': if (e.modeT <= 0) { const x = S.mark ? S.mark.x : P.x; S.grasp = { x, t: HK.graspUp, key: 'grasp' + S.act }; S.mark = null; c.sound('rumble'); c.fx('erupt', x, G.floorY); after(0.45); } return;
    case 'rainTell': if (e.modeT <= 0) { if (S.rain) S.rain.fall = true; c.sound('crack'); after(0.45); } return;
    case 'slipTell': if (e.modeT <= 0) { const x = clampX(G, S.echo ? S.echo.x : e.x); e.x = x; setMode(e, 'slipStrike', 0.12); c.sound('swing'); c.fx('erupt', x, G.floorY);
        c.hit([x - HK.slipR, x + HK.slipR, e.y - 44, e.y + 2], HK.dmg.slip, MOVE_NAME.slip, { key: 'slip' + S.act }); S.echo = null; } return;
    case 'slipStrike': if (e.modeT <= 0) setMode(e, 'slipRec', HK.slipRec); return;
    case 'hourTell': if (e.modeT <= 0) { S.waves.push({ x: e.x, dir: 1, key: 'hourR' + S.act }, { x: e.x, dir: -1, key: 'hourL' + S.act }); c.sound('chime'); c.shake(3); after(0.55); } return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* the cogs he bowls: along the floor to the wall */
function stepGears(S, dt, c) { const G = S.G;
  for (const g of S.gears) { g.x += g.dir * HK.gearV * dt; if (g.x < G.x0 + 6 || g.x > G.x1 - 6) g.done = true;
    else c.hit([g.x - HK.gearR, g.x + HK.gearR, G.floorY - HK.gearR * 2, G.floorY + 2], HK.dmg.gear, MOVE_NAME.gear, { key: g.key }); }
  S.gears = S.gears.filter(g => !g.done); }
/* the waves: THE HOUR's two low ones, THE SURGE's tall one */
function stepWaves(S, dt, c) { const G = S.G;
  for (const w of S.waves) { w.x += w.dir * (w.v || HK.hourV) * dt; if (w.x < G.x0 + 4 || w.x > G.x1 - 4) w.done = true;
    else { const hw = w.w || 10, hh = w.h || HK.hourH; c.hit([w.x - hw, w.x + hw, G.floorY - hh, G.floorY + 2], w.dmg || HK.dmg.hour, w.name || MOVE_NAME.hour, { key: w.key }); } }
  S.waves = S.waves.filter(w => !w.done); }
function stepStream(e, S, dt, c) { const s = S.stream; if (!s) return; s.t -= dt; const G = S.G;
  c.hit([s.x - HK.streamR, s.x + HK.streamR, G.roofY, G.floorY + 2], HK.dmg.stream, MOVE_NAME.stream, { key: s.key, noKnock: true });
  if (s.t <= 0) { S.stream = null; c.fx('pile', s.x, G.floorY); } }
/* GLASS RAIN: the shards fall through their marks (roof to floor - the ledges too) */
function stepRain(S, dt, c) { const r = S.rain; if (!r || !r.fall) return; r.t += dt; const G = S.G;
  for (const x of r.xs) c.hit([x - HK.rainR, x + HK.rainR, G.roofY, G.floorY + 2], HK.dmg.rain, MOVE_NAME.rain, { key: r.key + ':' + Math.round(x), noKnock: true });
  if (r.t >= HK.rainT) { for (const x of r.xs) c.fx('shatter', x, G.floorY); S.rain = null; } }
/* BURIAL GRASP: the hands rise; a hero on the floor in them is struck and HELD (c.hold: dragged down, no walking) - one in the air or rolling is not */
function stepGrasp(S, dt, h, c) { const g = S.grasp; if (!g) return; g.t -= dt; const G = S.G;
  for (const q of h) { if (!q.alive || q.air || q.dodge || Math.abs(q.x - g.x) > HK.graspR || q.y < G.floorY - 6) continue;
    if (c.hit([g.x - HK.graspR, g.x + HK.graspR, G.floorY - 30, G.floorY + 2], HK.dmg.grasp, MOVE_NAME.grasp, { key: g.key, noKnock: true })) { S.n.held++; if (c.hold) c.hold(q.pp, HK.graspHold); } }
  if (g.t <= 0) S.grasp = null; }
/* PHASE TWO ON: the two sandstone blocks rise and sink by turns (told HK.swapWarn s ahead) */
function stepBlocks(S, dt, c) { S.swapT -= dt;
  if (S.swapT <= HK.swapWarn && !S.swapSaid) { S.swapSaid = true; c.sound('rumble'); if (c.blocks) c.blocks(S.blockUp, 'warn'); }
  if (S.swapT <= 0) { S.blockUp = 1 - S.blockUp; S.swapT = HK.swap; S.swapSaid = false; if (c.blocks) c.blocks(S.blockUp, 'swap'); } }
/* PHASE TWO ON: THE SAND TIDE - told (a rumble, the floor's sand glows, "THE SAND RISES"), then the floor is drift for a while: up on a ledge or a block */
function stepTide(S, dt, c) { const T = S.tide, G = S.G; T.t -= dt;
  if (!T.on && T.t <= HK.tide.warn && !T.warned) { T.warned = true; c.sound('rumble'); if (T.said < 3) { T.said++; c.number((G.x0 + G.x1) / 2, G.floorY - 110, 'THE SAND RISES: UP ON A LEDGE', '#ff9a5c'); } }
  if (!T.on && T.t <= 0) { T.on = true; T.t = HK.tide.dur; c.shake(3); }
  else if (T.on && T.t <= 0) { T.on = false; T.warned = false; T.t = HK.tide.every; } }
/* PHASE THREE: two steady pours from the broken roof (a tick on a hero under one) */
function stepPours(S, dt, h, c) { S.pourT -= dt; if (S.pourT > 0) return; S.pourT = HK.pourTick; const G = S.G;
  for (const x of G.pours) c.hit([x - HK.pourW / 2, x + HK.pourW / 2, G.roofY, G.floorY + 2], HK.dmg.pour, MOVE_NAME.pour, { key: 'pour' + x + Math.round(c.time() * 2), noKnock: true }); }

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some; it blocks or backs off the pendulum, jumps the
   gear, the surge and the hour's waves, steps off the stream's X, the grasp's ring and the rain's marks, keeps off the slip's echo and cuts him where he lands,
   keeps out of phase three's pours, keeps jumping in the drift (phase two on); between his blows it works THE RULE: while his glass runs low (phases one, two) it
   goes to the nearer lever and PULLS it (E); in phase three it turns THE GREAT HOURGLASS (E) whenever it is ready - and early in the glass it fights his brass.
   s = { P: { x, y, face, ground, atk, qs }, e, S, levers: [{ id, x }], reach, shield, t, rng, mem, v2, hero } -> { gx, face, atk, jump, dodge, block, talk, why } */
export const PLAN = { react: 0.25, miss: 0.12, missPull: 0.12, leverR: 14, greatR: 14, upTol: 6 };
export function hkPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, talk: false, up: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const inDrift = !!P.qs, gd = !!P.ground || inDrift;   /* (held in THE DRIFT the hero is not 'on the ground', but a jump press heaves him: jump, and keep jumping) */
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - e.y) < 30, hitR = reach + HK.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const pours = S.ph === 3 ? G.pours : [];
  const inPour = x => pours.some(px => Math.abs(x - px) < HK.pourW / 2 + 6);
  const avoid = [...(S.rain && !S.rain.fall ? S.rain.xs.map(x => [x, HK.rainR + 10]) : []), ...(S.rain && S.rain.fall ? S.rain.xs.map(x => [x, HK.rainR + 6]) : [])];
  const safeX = x => { let q = clamp(x); for (const px of pours) if (Math.abs(q - px) < HK.pourW / 2 + 8) q = q < px ? px - HK.pourW / 2 - 10 : px + HK.pourW / 2 + 10;
    for (const [ax, r] of avoid) if (Math.abs(q - ax) < r) q = q < ax ? ax - r - 2 : ax + r + 2; return clamp(q); };
  const roomDir = ax => { const away = P.x <= ax ? -1 : 1, room = d => (d < 0 ? P.x - lo : hi - P.x); return room(away) >= 50 ? away : -away; };
  /* 0. OUT OF A POUR (phase three) */
  if (inPour(P.x) && gd) { out.gx = safeX(P.x); out.why = 'out of the pour'; return out; }
  /* 1. THINGS ON THE FLOOR: a gear or a wave coming - jump it as it comes */
  for (const g of [...S.gears.map(q => ({ ...q, k: 'gear' })), ...S.waves.map(q => ({ ...q, k: q.k || 'wave' }))]) {
    const toward = (P.x - g.x) * g.dir > 0, gap = Math.abs(P.x - g.x);
    if (toward && gap < 120 && seenFor('f' + g.key) && P.y > G.floorY - 20) { if (gap < (g.k === 'gear' ? 34 : g.k === 'surge' ? 42 : 38) && gd) { out.jump = true; out.gx = P.x + g.dir * 20; out.why = 'jump the ' + g.k; return out; } out.gx = P.x; out.why = 'ready to jump the ' + g.k; return out; } }
  /* 1b. THE RAIN'S MARKS: out of them */
  if (S.rain && seenFor('r' + S.rain.key)) for (const x of S.rain.xs) if (Math.abs(P.x - x) < HK.rainR + 8) { const d = roomDir(x); out.gx = safeX(x + d * (HK.rainR + 24)); if (gd && inDrift) out.jump = true; out.why = 'out of the rain\'s mark'; return out; }
  /* 1c. THE SLIP'S ECHO: off it while he glows */
  if (e.mode === 'slipTell' && S.echo && seenFor('s' + S.act)) { if (Math.abs(P.x - S.echo.x) < HK.slipR + 26) { const d = roomDir(S.echo.x); out.gx = safeX(S.echo.x + d * (HK.slipR + 40)); if (e.modeT < 0.25 && gd && !s.noRoll && !inDrift) out.dodge = true; if (inDrift && gd) out.jump = true; out.why = 'off his echo'; return out; } out.gx = P.x; out.why = 'clear of his echo'; return out; }
  /* 1d. (claude/buriedcity4) HIS THROWS FROM THE PILLAR: the shards' fan - a shield blocks it, else a roll under it or a step out of its line; the pot's mark - off it */
  if (S.al) { const fan = S.shards.filter(q => Math.abs(q.x - P.x) < 70 && Math.abs(q.y - (P.y - 10)) < 60 && (P.x - q.x) * q.vx >= -4);
    if ((e.mode === 'shardTell' && seenFor('sh' + S.act) && e.modeT < 0.3) || fan.length) { if (s.shield && !inDrift) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the shards'; return out; }
      const d = -Math.sign(kx - P.x) || 1; out.gx = safeX(P.x + d * 48); if (gd && !s.noRoll && !inDrift && (fan.length || e.modeT < 0.12)) out.dodge = true; else if (gd && fan.length) out.jump = true; out.why = 'out of the shards\' line'; return out; }
    if (S.mark && S.mark.k === 'pot' && seenFor('pt' + S.act) && Math.abs(P.x - S.mark.x) < HK.potR + 14 && Math.abs(P.y - S.mark.y) < 20) { const d = roomDir(S.mark.x); out.gx = safeX(S.mark.x + d * (HK.potR + 30)); if (inDrift && gd) out.jump = true; out.why = 'off the pot\'s mark'; return out; } }
  /* 1e. (claude/buriedcity4) HE HOLDS THE SAND (OPEN): climb - the floor to that side's ledge, up through the low slab at the ledge's end, across to the high slab, and cut him;
     while he is up and throwing, wait at the foot of that side's stair */
  if (S.al) { const A = G.aloft[S.al.side], dir = A.dir, [s0, s1] = A.slabs, L = A.ledge, on = r => gd && P.x > r.x0 - 3 && P.x < r.x1 + 3 && Math.abs(P.y - r.y) < 6;
    const near = dir > 0 ? L.x1 - 8 : L.x0 + 8;   /* the ledge's end under the low slab */
    if (e.mode === 'hold') {
      if (!gd && mem.climbGx != null && P.y < L.y + 4) { out.gx = mem.climbGx; out.why = 'up the slabs: in the air'; return out; }   /* (a jump keeps its aim: the next step, not the stair's foot) */
      mem.climbGx = null;
      if (gd && P.y <= A.y + PLAN.upTol) { out.gx = clamp(A.kx - dir * Math.max(6, hitR - 8)); if (Math.abs(P.x - A.kx) < hitR + 4) swing(A.kx); out.face = dir; out.why = 'up with him: cut him'; return out; }
      if (on(s0)) { const edge = dir > 0 ? s0.x1 - 6 : s0.x0 + 6; out.gx = dir > 0 ? s1.x0 + 14 : s1.x1 - 14; if ((P.x - edge) * dir > -4) { out.jump = true; mem.climbGx = out.gx; } out.why = 'up the slabs: the high one'; return out; }
      if (on(L)) { out.gx = near; if (Math.abs(P.x - near) < 8) { out.jump = true; out.gx = (s0.x0 + s0.x1) / 2; mem.climbGx = out.gx; } out.why = 'up the slabs: the low one'; return out; }
      const foot = near - dir * 20; out.gx = clamp(foot); if (Math.abs(P.x - foot) < 14 && gd) { out.jump = true; mem.climbGx = foot; } out.why = 'to the ledge under his slabs'; return out; }
    if (!S.gears.length && !S.waves.length) { const foot = near - dir * 24; out.gx = safeX(foot); out.face = dir; if (inDrift && gd) out.jump = true; out.why = 'he is up: wait at his stair'; return out; } }
  /* 2. HIS TELLS (a quarter-second late, some misread) */
  const key = 'k' + S.act + e.mode;
  if (/Tell$/.test(e.mode) || e.mode === 'pend' || S.stream || S.grasp) {
    const miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if (S.mark && (e.mode === 'streamTell' || e.mode === 'graspTell') && Math.abs(P.x - S.mark.x) < (e.mode === 'graspTell' ? HK.graspR : HK.streamR) + 18) { const d = roomDir(S.mark.x); out.gx = safeX(S.mark.x + d * (HK.graspR + 34)); if (e.modeT < 0.25 && gd && !s.noRoll && !inDrift) out.dodge = true; if (e.mode === 'graspTell' && gd && e.modeT < 0.3) out.jump = true; out.why = 'off the mark'; return out; }
      if (S.stream && Math.abs(P.x - S.stream.x) < HK.streamR + 12) { const d = roomDir(S.stream.x); out.gx = safeX(S.stream.x + d * (HK.streamR + 30)); out.why = 'out of the stream'; return out; }
      if (S.grasp && Math.abs(P.x - S.grasp.x) < HK.graspR + 6 && gd) { out.jump = true; out.gx = safeX(S.grasp.x + roomDir(S.grasp.x) * 40); out.why = 'jump out of the grasp'; return out; }
      if ((e.mode === 'pendTell' || e.mode === 'pend') && dx < HK.pendReach + 16 && same) { if (s.shield && !inDrift) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the pendulum'; return out; }
        out.gx = safeX(kx + side * (HK.pendReach + 34)); if (dx < 40 && e.mode === 'pendTell' && e.modeT < 0.2 && !s.noRoll) out.dodge = true; out.why = 'back off the pendulum'; return out; }
      if (e.mode === 'hourTell' || e.mode === 'gearTell' || e.mode === 'surgeTell') { out.gx = P.x; if (dx < 80 && e.modeT < 0.14 && gd) { out.jump = true; out.gx = P.x + side * 20; out.why = 'jump it as it is let go'; return out; } out.why = 'ready to jump'; return out; }
    }
  }
  /* 2b. THE TIDE COMES (phase two on): up on the nearest ledge or the block that stands, and stay there while it runs (the rain's marks still apply above) */
  if (tideComing(S) && !hkOpen(e)) { const refuges = [...G.ledges.map(l => ({ x0: l.x0, x1: l.x1, y: l.y })), ...(G.blocks[S.blockUp] ? [G.blocks[S.blockUp]] : [])];
    const on = refuges.find(r => P.x > r.x0 + 2 && P.x < r.x1 - 2 && Math.abs(P.y - r.y) < 6);
    if (on) { out.gx = P.x; if (dx < hitR + 6 && Math.abs(P.y - (e.y - 30)) < 40) swing(kx); out.why = 'on a ledge: the tide'; return out; }
    const r = refuges.slice().sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - P.x) - Math.abs((b.x0 + b.x1) / 2 - P.x))[0];
    if (r) { const mx = (r.x0 + r.x1) / 2; out.gx = clamp(mx); if (Math.abs(P.x - mx) < (r.x1 - r.x0) / 2 - 4 && gd) out.jump = true; out.why = 'to a ledge: the tide comes'; return out; } }
  /* 3. OPEN: strike him; TURNING or LANDED FROM HIS SLIP: strike him; WARDED: off him */
  if (hkOpen(e) || e.mode === 'turn' || e.mode === 'slipRec') { out.gx = safeX(kx + side * (s.tip ? 30 : 14)); if (dx < hitR + 4 && same) swing(kx); if (inDrift && gd && !hkOpen(e)) out.jump = (Math.floor(t * 4) % 2) === 0; out.why = hkOpen(e) ? 'strike him: he is stalled' : 'strike him where he stands'; return out; }
  if (S.ward > 0) { out.gx = safeX(kx + side * 90); if (inDrift && gd) out.jump = true; out.why = 'his ward: wait'; return out; }
  /* 4. THE RULE: phase three - THE GREAT HOURGLASS whenever it is ready; phases one and two - his glass runs low: the nearer lever, and pull it */
  if (greatReady(S) && e.mode !== 'sleep' && e.mode !== 'wake') { const gx = G.great; out.gx = clamp(gx + (P.x < gx ? -6 : 6)); if (inDrift && gd) out.jump = Math.abs(P.x - gx) > PLAN.greatR;
    if (Math.abs(P.x - gx) < PLAN.greatR + 4 && !roll('great' + Math.floor(t * 2), PLAN.missPull)) { out.talk = true; out.face = Math.sign(gx - P.x) || P.face; out.why = 'turn the great hourglass'; } else out.why = 'to the great hourglass'; return out; }
  if (S.ph < 3 && glassLow(S) && e.mode !== 'sleep' && e.mode !== 'wake') {
    const lv = (s.levers || []).slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (lv) { out.gx = clamp(lv.x + (P.x < lv.x ? -4 : 4)); if (inDrift && gd) out.jump = true; if (Math.abs(P.x - lv.x) < PLAN.leverR && !roll('pull' + S.n.cycles + Math.floor(t / 2), PLAN.missPull)) { out.talk = true; out.face = Math.sign(lv.x - P.x) || P.face; out.why = 'pull the sand-gate: his glass is low'; } else out.why = 'to a sand-gate lever'; return out; } }
  /* 4b. WINDED (the lab's stamina rest): off him */
  if (s.rest) { out.gx = safeX(kx + side * (HK.pendReach + 50)); out.face = Math.sign(kx - P.x) || 1; if (inDrift && gd) out.jump = true; out.why = 'winded: off him'; return out; }
  /* 5. FIGHT HIM (his brass takes a share): in his tells, and between his blows - in the drift, keep jumping */
  if (dx < hitR && same && !(e.mode === 'pendTell')) { swing(kx); out.gx = P.x; if (inDrift && gd && P.atk >= 0) out.jump = true; out.why = 'cut his brass'; return out; }
  if ((e.mode === 'walk' || e.mode === 'recover') && dx < hitR + 30) { out.face = Math.sign(kx - P.x) || 1; out.gx = clamp(kx + side * (hitR - 8)); if (inDrift && gd) out.jump = true; out.why = 'in to him'; return out; }
  out.gx = safeX(kx + side * Math.max(40, hitR + 10)); out.face = Math.sign(kx - P.x) || 1; if (inDrift && gd) out.jump = true; out.why = 'close on him'; return out;
}
