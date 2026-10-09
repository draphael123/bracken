// src/hourglass-king.js - THE HOURGLASS KING, THE BURIED CITY's boss (claude/buriedcity, the Opus greybox, 2026-10-08). From the model in src/desert-bosses.js
// (HOURGLASS_KING: his chest is an hourglass that runs out and he turns himself over; turn the arena's SAND-GATE while his glass is low and he STALLS) and the
// desert-arc concept (docs/briefs/buried-city.md), rebuilt to today's rules (design standard B1-B15, B6 amended: tuned WITH FLASKS, 60-70% k/w/p).
//
// WHAT HE IS (B11/B14/B15): A CONSTRUCT, A PUZZLE KING - the city's last king, who had himself made into clockwork so his hour would never run out. His chest
//   is AN HOURGLASS and it is drawn on him all fight (the sand in it, falling). He is NEVER a wall (B13/B15): outside his openings his BRASS takes HK.resist of
//   a blow (a told CLANK: "HIS BRASS" - "PULL A SAND-GATE AS HIS GLASS RUNS LOW" the first times); when his glass runs out on its own he TURNS HIMSELF OVER
//   (HK.turnT s, told: "HE TURNS HIS GLASS") and while he turns a blow lands whole.
// HIS OPENING IS THE LEVEL'S VERB (B1): THE CITY'S ROOMS FILL WITH SAND, AND A SAND-GATE DRAINS ONE. The throne room has TWO SAND-GATE LEVERS (one on each wall:
//   the level's own levers, src/buried-city-hands.js pulls them and tells him). PULL ONE WHILE HIS GLASS RUNS LOW (its last HK.lowAt - told: the glass glows
//   and "HIS GLASS RUNS LOW", a chime) and the gate takes the last grains out of him: HE STALLS - OPEN (B10: a gold ring and a timer bar), HK.openT s, a blow
//   x HK.openMul, one opening HK.openCap of him at most. THE SAND RUNS TO THE GATE AND DRAGS HIM WITH IT (B12: the opening is reachable - he comes to you, to
//   the lever you pulled, and stops a step short of it; B7: he moves, you never do). B4: stalled he stands where the sand left him, frozen mid-gesture.
//   Pulled any other time the lever only says so ("HIS GLASS IS FULL: NOT YET") - a lever is never wasted silently.
//   B3: when the opening ends he TURNS HIS GLASS OVER, FULL - a TOLD HK.wardT s WARD (a pale shell: every blow clanks WARDED at the floor's HK.wardMul, B15;
//   a lever does nothing to a full glass).
// PHASE ONE - THE THRONE ROOM (to HK.p2): THE PENDULUM ('!' his sceptre's sweep close in: block it), THE GEAR ('!!' a brass cog bowled along the floor at you:
//   jump it), THE SAND STREAM ('!!' a red X on your spot and a trickle from the roof, then the column comes down: leave it).
// PHASE TWO - THE SANDS RISE (HK.p2 to HK.p3): the arena changes - the roof's sand slides down the walls and BANKS AT BOTH ENDS (mounds three rows high: the
//   levers stay on the floor two tiles clear of them, in reach - fix pass 10-09: the banks were [0-5]/[34-39] and buried both levers). ONE NEW MOVE: THE TIME SLIP ('!!' a swirl opens on your spot - he sinks into the floor and comes up THERE: be gone).
// PHASE THREE - THE GLASS CRACKS (HK.p3 to 0): the arena changes - his glass is cracked and runs in HK.glass3 s (his low window comes round faster), and the
//   roof gives way in two places: two STEADY POURS stand in the room (a tick on a hero under one; drawn). ONE NEW MOVE: THE HOUR STRIKES ('!!' his sceptre up,
//   the chime, then a wave of sand runs along the floor both ways from him: jump it).
// NO ADDS (B-rules: no add-summons). PURE: no DOM, no main.js. The world is a context `c` (src/hourglass-king-hands.js binds it). hkPlan is the boss lab's
// HUMAN bot (src/lab.js): it reads his glass and works the levers.

export const HK = {
  hp: 1750, w: 20, h: 38, markH: 56,
  glass: 12, glass3: 8, lowAt: 0.48,   /* (resume pass: the low window 4.3 s -> 5.8 s - a melee hero has a lever to reach across the room, round his blows) */
  openMul: 2.0, openCap: 0.13, openT: 4.0, wardT: 3.0, wardMul: 0.4, resist: 0.45, turnT: 1.4, turnMul: 1.0, dragV: 300, dragStop: 40, fullJam: 1.6,
  p2: 0.6, p3: 0.25,
  walk: 42, keep: 46, gap: [0.6, 0.5, 0.42],
  pendTell: 0.62, pendT: 0.2, pendReach: 56, pendRange: 74,
  gearTell: 0.7, gearV: 165, gearR: 9,
  streamTell: 0.85, streamT: 0.45, streamR: 18,
  slipTell: 1.0, slipR: 22, slipUp: 0.3,
  hourTell: 0.95, hourV: 210, hourH: 14,
  pourW: 22, pourTick: 0.5,
  dmg: { pend: 24, gear: 23, stream: 28, slip: 24, hour: 26, pour: 6 },   /* (resume pass: 33% with flasks at 34/28/36/38/31 and 1900 hp - eased to the 60-70% band) */
};
/* EVERY CYCLE CHANGES: the order of each pass, by phase (cycle k uses [k % n]) */
export const CYCLES = {
  1: [['pend', 'gear', 'stream', 'pend'], ['gear', 'pend', 'stream', 'gear'], ['stream', 'pend', 'gear', 'pend']],
  2: [['slip', 'pend', 'gear', 'stream'], ['pend', 'slip', 'stream', 'gear'], ['gear', 'stream', 'slip', 'pend']],
  3: [['hour', 'pend', 'slip', 'gear'], ['stream', 'hour', 'pend', 'slip'], ['pend', 'gear', 'hour', 'stream']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows) */
export const MOVES = {
  pendTell: { mark: '!', answer: 'block' }, gearTell: { mark: '!!', answer: 'jump' }, streamTell: { mark: '!!', answer: 'dodge' },
  slipTell: { mark: '!!', answer: 'dodge' }, hourTell: { mark: '!!', answer: 'jump' },
};
export const MOVE_NAME = { pend: 'HIS PENDULUM', gear: 'A BRASS GEAR', stream: 'THE SAND STREAM', slip: 'THE TIME SLIP', hour: 'THE HOUR', pour: 'THE POURING SAND' };

/* ---------- THE THRONE ROOM ---------- */
/* local columns (0..39), the floor's surface row R (the hero stands on R-1). Two SAND-GATE LEVERS on the walls (the level's levers: src/buried-city-hands.js),
   two ROOF HOLES (phase three's pours), two LEDGES (one-way: the angle from above, and out of a wave), the BANKS phase two piles at the ends, the THRONE */
export const HK_STAGE = { W: 40, door: 6, levers: [3, 36], pours: [12, 27], ledges: [{ x0: 8, x1: 13, dy: 3 }, { x0: 26, x1: 31, dy: 3 }], banks: [[0, 2], [37, 39]], bankRows: 3, king: 20, throne: 20 };
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
    ledges: HK_STAGE.ledges.map(l => ({ x0: X(l.x0), x1: X(l.x1 + 1), y: (q.R - l.dy) * TS })) };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, glass: HK.glass, glassMax: HK.glass, ward: 0, openTaken: 0, dragTo: null, lowSaid: false, mark: null,
    gears: [], waves: [], stream: null, pourT: 0, jamT: 0, told: {},
    n: { cycles: 0, opens: 0, turns: 0, pulls: 0, pullsFull: 0, pullsWard: 0, wards: 0, warded: 0, brass: 0, turnHits: 0, gears: 0, streams: 0, slips: 0, hours: 0, pends: 0, moves: {} } };
}
export const hPhase = e => (e.hp <= e.maxHp * HK.p3 ? 3 : e.hp <= e.maxHp * HK.p2 ? 2 : 1);
export const hkOpen = e => !!e && e.mode === 'stall' && (e.open || 0) > 0;
export const glassLow = S => !!S && S.glass <= S.glassMax * HK.lowAt;
export const turning = e => !!e && e.mode === 'turn';
const BLOWS = new Set(['pend', 'slipRise']);
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 18, Math.min(G.x1 - 18, x));
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell'); }
function endOpen(e, S, c) { e.open = 0; S.ward = HK.wardT; S.n.wards++; S.openTaken = 0; S.dragTo = null; S.glass = S.glassMax; S.lowSaid = false;
  c.number(e.x, e.y - 74, 'HE TURNS HIS GLASS OVER, FULL: HE GUARDS', '#c8d8e8'); c.sound('turn'); c.fx('ward', e.x, e.y); }
function open(e, S, c, leverX) { setMode(e, 'stall', HK.openT + 0.05); e.open = HK.openT; S.openTaken = 0; S.n.opens++; S.glass = 0; S.mark = null;
  const side = Math.sign(e.x - leverX) || 1; S.dragTo = clampX(S.G, leverX + side * HK.dragStop);
  c.fx('open', e.x, e.y); c.sound('stall'); c.shake(3); c.number(e.x, e.y - 74, 'THE GATE TAKES HIS LAST GRAINS: HE STALLS - STRIKE', '#8fd160'); }

/* ---------- THE RULE ON HIM (the hands call this) ----------
   A SAND-GATE LEVER PULLED at x (px): 'stall' (his glass was low: the opening) | 'full' (his glass is full: not yet) | 'ward' (just turned: nothing) | 'busy' */
export function leverPulled(e, S, c, x) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'stall' || e.mode === 'die') return 'busy';
  S.n.pulls++;
  if (S.ward > 0 || e.mode === 'turn') { S.n.pullsWard++; c.number(x, S.G.floorY - 60, 'HIS GLASS IS TURNING: THE GATE FINDS NOTHING', '#9aa39a'); return 'ward'; }
  if (!glassLow(S)) { S.n.pullsFull++; c.number(x, S.G.floorY - 60, 'HIS GLASS IS FULL: NOT YET', '#9aa39a'); return 'full'; }
  /* a blow already moving finishes (the gear rolls on, the stream falls) - he does not */
  S.slip = null; open(e, S, c, x); return 'stall';
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, air, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)  c.banks(on)  c.time() ---------- */
export function stepHourglassKing(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  stepGears(S, dt, c); stepWaves(S, dt, c); stepStream(e, S, dt, c);
  if (S.ph === 3) stepPours(S, dt, h, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = CYCLES[1][0].slice(); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* HIS GLASS: it runs while he fights; empty, he turns himself over (told). Stalled or warded it does not run */
  if (e.mode !== 'stall' && e.mode !== 'turn' && S.ward <= 0) {
    S.glass = Math.max(0, S.glass - dt);
    if (glassLow(S) && !S.lowSaid) { S.lowSaid = true; c.sound('chime'); if (!S.told.low || S.n.opens < 2) { S.told.low = (S.told.low || 0) + 1; c.number(e.x, e.y - 74, 'HIS GLASS RUNS LOW: PULL A SAND-GATE', '#ffd36b'); } }
    if (S.glass <= 0 && !/Tell$/.test(e.mode) && !BLOWS.has(e.mode) && e.mode !== 'slipSink') { setMode(e, 'turn', HK.turnT); S.n.turns++; S.mark = null; c.sound('turn'); c.number(e.x, e.y - 74, 'HIS GLASS IS EMPTY: HE TURNS IT OVER', '#e8d0a0'); return; }
  }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = hPhase(e);
  if (want > S.ph && !hkOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want);
    if (want === 2) { c.number((G.x0 + G.x1) / 2, G.floorY - 120, 'THE SANDS RISE: THEY BANK AT THE WALLS', '#ff9a5c'); c.banks(true); c.shake(5); c.sound('rumble'); setMode(e, 'recover', 0.9); return; }
    if (want === 3) { c.banks(true);   /* (fix pass: the banks stand in phase three too, even if a run of blows took him past phase two between his moves) */
      S.glassMax = HK.glass3; S.glass = Math.min(S.glass, S.glassMax); c.number((G.x0 + G.x1) / 2, G.floorY - 120, 'HIS GLASS CRACKS: THE ROOF GIVES WAY', '#ff6b6b'); c.shake(6); c.sound('rumble'); setMode(e, 'recover', 0.9); return; } }
  switch (e.mode) {
    case 'stall': {   /* B4: he stands where the sand drags him, frozen - the drag is the opening coming to you (B12) */
      if (S.dragTo != null) { const d = S.dragTo - e.x; if (Math.abs(d) > 2) e.x = clampX(G, e.x + Math.sign(d) * Math.min(Math.abs(d), HK.dragV * dt)); else S.dragTo = null; }
      if (e.open <= 0) { endOpen(e, S, c); setMode(e, 'recover', 0.5); } return; }
    case 'turn': if (e.modeT <= 0) { S.glass = S.glassMax; S.lowSaid = false; setMode(e, 'recover', 0.4); } return;
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'walk': {
      const d = P.x - e.x; e.face = Math.sign(d) || e.face;
      if (Math.abs(d) > HK.keep) e.x = clampX(G, e.x + Math.sign(d) * HK.walk * dt);
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
  }
  stepMove(e, S, dt, P, c);
}
function nextMove(e, S, P, c) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; const set = CYCLES[S.ph]; S.script = set[S.cycle % set.length].slice(); S.step = 0; }
  const m = S.script[S.step++], dx = P.x - e.x, ad = Math.abs(dx), G = S.G;
  e.face = Math.sign(dx) || e.face;
  if (m === 'pend' && ad > HK.pendRange) { setMode(e, 'walk', 0.5); S.step--; return; }   /* out of the sceptre's reach: he closes first */
  switch (m) {
    case 'pend': S.n.pends++; tell(e, S, c, 'pendTell', HK.pendTell); return;
    case 'gear': S.n.gears++; tell(e, S, c, 'gearTell', HK.gearTell); return;
    case 'stream': S.n.streams++; tell(e, S, c, 'streamTell', HK.streamTell); S.mark = { x: clampX(G, P.x), k: 'stream' }; c.fx('mark', S.mark.x, G.floorY); return;
    case 'slip': S.n.slips++; tell(e, S, c, 'slipTell', HK.slipTell); S.mark = { x: clampX(G, P.x), k: 'slip' }; c.fx('swirl', S.mark.x, G.floorY); return;
    case 'hour': S.n.hours++; tell(e, S, c, 'hourTell', HK.hourTell); return;
  }
  setMode(e, 'walk', 0.5);
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, c) {
  const G = S.G, f = e.face || 1, after = (t) => setMode(e, 'recover', t ?? HK.gap[S.ph - 1]);
  switch (e.mode) {
    case 'pendTell': if (e.modeT <= 0) { setMode(e, 'pend', HK.pendT); c.sound('swing');
        c.hit([f > 0 ? e.x - 4 : e.x - HK.pendReach, f > 0 ? e.x + HK.pendReach : e.x + 4, e.y - 34, e.y], HK.dmg.pend, MOVE_NAME.pend, { blockable: true, key: 'pend' + S.act }); } return;
    case 'pend': if (e.modeT <= 0) after(); return;
    case 'gearTell': if (e.modeT <= 0) { S.gears.push({ x: e.x + f * 8, dir: f, key: 'gear' + S.act }); c.sound('gear'); after(0.45); } return;
    case 'streamTell': if (e.modeT <= 0) { S.stream = { x: S.mark ? S.mark.x : P.x, t: HK.streamT, key: 'stream' + S.act }; S.mark = null; c.sound('pour'); after(0.4); } return;
    case 'slipTell': if (e.modeT <= 0) { setMode(e, 'slipRise', HK.slipUp); e.x = S.mark ? S.mark.x : P.x; c.sound('rumble');
        c.hit([e.x - HK.slipR, e.x + HK.slipR, e.y - 44, e.y + 2], HK.dmg.slip, MOVE_NAME.slip, { key: 'slip' + S.act }); c.fx('erupt', e.x, G.floorY); S.mark = null; } return;
    case 'slipRise': if (e.modeT <= 0) after(); return;
    case 'hourTell': if (e.modeT <= 0) { S.waves.push({ x: e.x, dir: 1, key: 'hourR' + S.act }, { x: e.x, dir: -1, key: 'hourL' + S.act }); c.sound('chime'); c.shake(3); after(0.55); } return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* the cogs he bowls: along the floor to the wall */
function stepGears(S, dt, c) { const G = S.G;
  for (const g of S.gears) { g.x += g.dir * HK.gearV * dt; if (g.x < G.x0 + 6 || g.x > G.x1 - 6) g.done = true;
    else c.hit([g.x - HK.gearR, g.x + HK.gearR, G.floorY - HK.gearR * 2, G.floorY + 2], HK.dmg.gear, MOVE_NAME.gear, { key: g.key }); }
  S.gears = S.gears.filter(g => !g.done); }
function stepWaves(S, dt, c) { const G = S.G;
  for (const w of S.waves) { w.x += w.dir * HK.hourV * dt; if (w.x < G.x0 + 4 || w.x > G.x1 - 4) w.done = true;
    else c.hit([w.x - 10, w.x + 10, G.floorY - HK.hourH, G.floorY + 2], HK.dmg.hour, MOVE_NAME.hour, { key: w.key }); }
  S.waves = S.waves.filter(w => !w.done); }
function stepStream(e, S, dt, c) { const s = S.stream; if (!s) return; s.t -= dt; const G = S.G;
  c.hit([s.x - HK.streamR, s.x + HK.streamR, G.roofY, G.floorY + 2], HK.dmg.stream, MOVE_NAME.stream, { key: s.key, noKnock: true });
  if (s.t <= 0) { S.stream = null; c.fx('pile', s.x, G.floorY); } }
/* PHASE THREE: two steady pours from the broken roof (a tick on a hero under one) */
function stepPours(S, dt, h, c) { S.pourT -= dt; if (S.pourT > 0) return; S.pourT = HK.pourTick; const G = S.G;
  for (const x of G.pours) c.hit([x - HK.pourW / 2, x + HK.pourW / 2, G.roofY, G.floorY + 2], HK.dmg.pour, MOVE_NAME.pour, { key: 'pour' + x + Math.round(c.time() * 2), noKnock: true }); }

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some; it blocks or backs off the pendulum, jumps the
   gear and the hour's waves, steps off the stream's X and the slip's swirl, keeps out of phase three's pours; between his blows it works THE RULE: while his
   glass runs low it goes to the nearer lever and PULLS it (E) - and early in the glass it fights him (his brass, his turns), backing off in his ward.
   s = { P: { x, y, face, ground, atk }, e, S, levers: [{ id, x }], reach, shield, t, rng, mem, v2, hero } -> { gx, face, atk, jump, dodge, block, talk, why } */
export const PLAN = { react: 0.25, miss: 0.12, missPull: 0.12, leverR: 14 };
export function hkPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, talk: false, up: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - e.y) < 30, hitR = reach + HK.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const pours = S.ph === 3 ? G.pours : [];
  const inPour = x => pours.some(px => Math.abs(x - px) < HK.pourW / 2 + 6);
  const safeX = x => { let q = clamp(x); for (const px of pours) if (Math.abs(q - px) < HK.pourW / 2 + 8) q = q < px ? px - HK.pourW / 2 - 10 : px + HK.pourW / 2 + 10; return clamp(q); };
  const roomDir = ax => { const away = P.x <= ax ? -1 : 1, room = d => (d < 0 ? P.x - lo : hi - P.x); return room(away) >= 50 ? away : -away; };
  /* 0. OUT OF A POUR (phase three) */
  if (inPour(P.x) && P.ground) { out.gx = safeX(P.x); out.why = 'out of the pour'; return out; }
  /* 1. THINGS ON THE FLOOR: a gear or a wave coming - jump it as it comes */
  for (const g of [...S.gears.map(q => ({ ...q, k: 'gear' })), ...S.waves.map(q => ({ ...q, k: 'wave' }))]) {
    const toward = (P.x - g.x) * g.dir > 0, gap = Math.abs(P.x - g.x);
    if (toward && gap < 120 && seenFor('f' + g.key)) { if (gap < (g.k === 'gear' ? 34 : 38) && P.ground) { out.jump = true; out.gx = P.x + g.dir * 20; out.why = 'jump the ' + g.k; return out; } out.gx = P.x; out.why = 'ready to jump the ' + g.k; return out; } }
  /* 2. HIS TELLS (a quarter-second late, some misread) */
  const key = 'k' + S.act + e.mode;
  if (/Tell$/.test(e.mode) || e.mode === 'pend' || S.stream) {
    const miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if (S.mark && (e.mode === 'streamTell' || e.mode === 'slipTell') && Math.abs(P.x - S.mark.x) < (e.mode === 'slipTell' ? HK.slipR : HK.streamR) + 18) { const d = roomDir(S.mark.x); out.gx = safeX(S.mark.x + d * (HK.slipR + 34)); if (e.modeT < 0.25 && P.ground && !s.noRoll) out.dodge = true; out.why = 'off the mark'; return out; }
      if (S.stream && Math.abs(P.x - S.stream.x) < HK.streamR + 12) { const d = roomDir(S.stream.x); out.gx = safeX(S.stream.x + d * (HK.streamR + 30)); out.why = 'out of the stream'; return out; }
      if ((e.mode === 'pendTell' || e.mode === 'pend') && dx < HK.pendReach + 16 && same) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the pendulum'; return out; }
        out.gx = safeX(kx + side * (HK.pendReach + 34)); if (dx < 40 && e.mode === 'pendTell' && e.modeT < 0.2 && !s.noRoll) out.dodge = true; out.why = 'back off the pendulum'; return out; }
      if (e.mode === 'hourTell' || e.mode === 'gearTell') { out.gx = P.x; if (dx < 80 && e.modeT < 0.14 && P.ground) { out.jump = true; out.gx = P.x + side * 20; out.why = 'jump it as it is let go'; return out; } out.why = 'ready to jump'; return out; }
    }
  }
  /* 3. OPEN: strike him; WARDED: off him; TURNING: strike him */
  if (hkOpen(e) || e.mode === 'turn') { out.gx = safeX(kx + side * (s.tip ? 30 : 14)); if (dx < hitR + 4 && same) swing(kx); out.why = hkOpen(e) ? 'strike him: he is stalled' : 'strike him: he is turning'; return out; }
  if (S.ward > 0) { out.gx = safeX(kx + side * 90); out.why = 'his ward: wait'; return out; }
  /* 4. THE RULE: his glass runs low - the nearer lever, and pull it */
  if (glassLow(S) && e.mode !== 'sleep' && e.mode !== 'wake') {
    const lv = (s.levers || []).slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (lv) { out.gx = clamp(lv.x + (P.x < lv.x ? -4 : 4)); if (Math.abs(P.x - lv.x) < PLAN.leverR && !roll('pull' + S.n.cycles + Math.floor(t / 2), PLAN.missPull)) { out.talk = true; out.face = Math.sign(lv.x - P.x) || P.face; out.why = 'pull the sand-gate: his glass is low'; } else out.why = 'to a sand-gate lever'; return out; } }
  /* 4b. WINDED (the lab's stamina rest): off him */
  if (s.rest) { out.gx = safeX(kx + side * (HK.pendReach + 50)); out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off him'; return out; }
  /* 5. FIGHT HIM (his brass takes a share): in his tells, and between his blows */
  if (dx < hitR && same && !(e.mode === 'pendTell')) { swing(kx); out.gx = P.x; out.why = 'cut his brass'; return out; }
  if ((e.mode === 'walk' || e.mode === 'recover') && dx < hitR + 30) { out.face = Math.sign(kx - P.x) || 1; out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to him'; return out; }
  out.gx = safeX(kx + side * Math.max(40, hitR + 10)); out.face = Math.sign(kx - P.x) || 1; out.why = 'close on him'; return out;
}
