// src/raptor-matriarch.js - THE RAPTOR MATRIARCH, "OLD PLUME", THE RED GORGE's boss (claude/redgorge2, the Opus greybox, 2026-10-06).
// She replaces THE GREAT RED CRAB (benched intact: src/gorge-crab.js, unplaced - Daniel 10-03: the crab did not fit the gorge, and his gate
// opening only happened if you engineered it). The gorge's raptors are her brood; the FEATHERS (the level's collectible) lead to her NEST, high in
// the gorge beside the old dam's spillway. Moveset: Daniel's approval of 10-03 (scratch/brief-raptormatriarch.md, MOVESET).
//
// WHAT SHE IS (design standard B11): A BEAST DUELIST, NOT A PUZZLE. She is ALWAYS HITTABLE, and she GUARDS BY ANGLE: a blow from the front by a hero
//   standing at her height is turned by her raised talons (CLANK, "TALONS UP"); from BEHIND her, or from ABOVE (a jump), it lands whole. Her BEATS
//   (the skid after a whiffed pounce, the breath after her rake) drop the guard. Her OPENINGS come from the GORGE (B1): the water, the pillars, the
//   rope bridges - a blow in one lands x MAT.openMul (one opening is MAT.openCap of her at most), and after every opening ends she is WARDED for a
//   told MAT.wardT s (B3: the burst finds nothing, a blade clanks). She is on src/boss-greed.js FULL_DAMAGE (no global chip; greed still counts).
//
// THE NEST LEDGE (stageMatriarch): forty tiles of the old dam's spillway floor (the DRY CHANNEL, the bed), banks at either end, and between them a
//   row of stone PILLARS two rows high - NARROW ones (two tiles) and BROAD ones (four) - over the channel. A SLUICE LEVER on each bank (E): the
//   dam behind the nest banks every flood the horn brings down (the gorge's rule: a gate holds a flood), and a lever lets it all go at once - a
//   BURST down the channel. Two ROPE BRIDGES hang high over the channel, each from a post on a bank to a post on a broad pillar.
//
// PHASE 1 - THE NEST LEDGE (to MAT.p2 of her health):
//   POUNCE (!!)      crouch, rocks back, eye glints; leaps to where you stand and pins what she lands on. Answer: a LATE side dodge. A whiff leaves her
//                    SKIDDING (a beat).
//   TALON RAKE (!)   a quick head-bob; two fast slashes up close; a shield turns them; a beat after the second.
//   TAIL SWEEP (!!)  she turns her back and coils; a low sweep all round her: JUMP it.
//   SCREE KICK (!!)  she scrapes the ledge's edge; a spray of rocks along the ground in front of her: get above the line or behind a pillar.
//   SCREECH (!)      head back, feathers flared: she calls her brood off the walls (MAT.raptorCap alive at most).
//   THE FLOOD OPENING: at the HORN she has warning - she bounds to a broad pillar or a bank and waits it out (no opening). A BURST is no warning:
//                    caught in the channel she leaps for the NEAREST pillar, and a NARROW one throws her - she wobbles, flaps, and falls back into the
//                    channel STAGGERED (MAT.staggerT, the big opening). Pull the lever while she crouches to pounce at you from the channel floor.
// PHASE 2 - THE CANYON WALLS (MAT.p2 to MAT.p3): she takes to the walls (the arena changes: the fight is under her).
//   WALL RUN         along the canyon wall, out of reach (her shadow on the ground under her).
//   DIVE STRIKE (!!) she stops, shrieks, and her shadow MARKS YOUR SPOT; she dives to it. Step off the mark: she slams into the rock, STUNNED.
//   BRIDGE LANDING   she perches on a rope bridge between dives. STRIKE ITS POST and the ropes part: she falls into the channel, TANGLED (long).
//   FEATHER VOLLEY (!!) wings spread wide; a fan of quills from the wall, through guards: dodge through the gaps.
// PHASE 3 - THE DAM CRACKS (MAT.p3 to 0): the whole floor floods for good; the fight is on the pillar tops (the dam's loose timbers float up in the
//   two wide reaches of the channel as stepping planks). POUNCE CHAINS pillar to pillar at the top you stand on - every landing on a NARROW pillar
//   STAGGERS her (be ON the narrow one she is heading for, and jump off as she comes). DESPERATION SCREECH: both raptors at once, and the RAPIDS'
//   DEBRIS SURGE sweeps the pillar tops (jump it). Into the water: a blow, and back on the nearest pillar (the rapids' rule) - never a death.
//
// PURE: no DOM, no main.js. The world is a context `c` (src/raptor-matriarch-hands.js binds it). matPlan is the boss lab's HUMAN bot (src/lab.js).

export const MAT = {
  hp: 1075, w: 44, h: 34, markH: 56,
  openMul: 1.6, openCap: 0.10, wardT: 3.0,
  p2: 0.6, p3: 0.25,
  walk: 80, keep: 30, turn: 0.35, gap: [0.55, 0.5, 0.45], hopUp: 320, fall: 420,
  /* P1 */
  pounceTell: 0.8, pounceLock: 0.45, pounceFly: 0.5, pounceR: 23, pounceArc: 64, skidT: 1.5, skidSlide: 34,
  rakeTell: 0.45, rakeT: 0.14, rakeGap: 0.22, rakeReach: 54, rakeBeatT: 0.8, rakeRange: 72,
  sweepTell: 0.7, sweepT: 0.25, sweepR: 78, sweepH: 22,
  screeTell: 0.7, screeN: 4, screeV: [170, 250], screeG: 600,
  screechTell: 0.8, raptorCap: 2,
  hornLeap: 0.45, panicFly: 0.42, wobbleT: 0.7, staggerT: 4.2, releaseTell: 0.4, burstT: 1.6,
  /* P2 */
  wallUp: 0.6, runT: [1.6, 2.6], runV: 150, diveTell: 1.0, diveFly: 0.3, diveR: 23, stunT: 3.2,
  volleyTell: 0.8, quills: 5, quillSpread: 0.2, quillV: 210, perchT: 3.6, toBridge: 0.5, tangleT: 4.5,
  /* P3 */
  crackT: 2.5, riseT: 2.0, chainN: 3, chainGap: 0.45, p3StaggerT: 3.2, surgeTell: 1.2, surgeV: 240, surgeEvery: 16,
  dmg: { pounce: 19, rake: 11, sweep: 13, scree: 12, dive: 20, quill: 10, surge: 10 },
};
/* EVERY CYCLE CHANGES: the order of each pass, by phase (cycle k uses [k % n]) */
export const CYCLES = {
  1: [['pounce', 'rake', 'sweep', 'pounce', 'scree'], ['rake', 'pounce', 'screech', 'sweep', 'pounce'], ['scree', 'pounce', 'rake', 'pounce', 'sweep'], ['pounce', 'sweep', 'rake', 'screech', 'pounce']],
  2: [['run', 'dive', 'run', 'perch', 'run', 'volley'], ['run', 'volley', 'run', 'dive', 'run', 'perch'], ['run', 'perch', 'run', 'dive', 'run', 'dive']],
  3: [['chain', 'rake', 'chain'], ['surge', 'chain', 'rake', 'chain'], ['chain', 'chain', 'rake']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows: tools/raptor-matriarch.mjs holds them equal) */
export const MOVES = {
  pounceTell: { mark: '!!', answer: 'dodge' }, rakeTell: { mark: '!', answer: 'block' }, sweepTell: { mark: '!!', answer: 'jump' }, screeTell: { mark: '!!', answer: 'above' },
  screechTell: { mark: '!', answer: '' }, diveTell: { mark: '!!', answer: 'dodge' }, volleyTell: { mark: '!!', answer: 'dodge' }, surgeTell: { mark: '!!', answer: 'jump' },
};
export const MOVE_NAME = { pounce: 'HER POUNCE', rake: 'HER TALONS', sweep: 'HER TAIL', scree: 'THE SCREE', dive: 'HER DIVE', quill: 'HER QUILLS', surge: 'THE DEBRIS' };

/* ---------- THE NEST LEDGE ---------- */
/* local columns (0..39). The bed is row R (solid; the channel floor you stand on is row R-1); every top (bank or pillar) is solid rows top..R-1
   (you stand on row top-1, two rows over the bed: every hero climbs out of the channel with one jump). */
export const STAGE = { W: 40, R: 24, top: 22, door: 6, wallRow: 9, bridgeRow: 13,
  tops: [{ id: 'W', x0: 0, x1: 3, kind: 'bank' }, { id: 'N1', x0: 9, x1: 10, kind: 'narrow' }, { id: 'B1', x0: 13, x1: 16, kind: 'broad' }, { id: 'N2', x0: 19, x1: 20, kind: 'narrow' },
    { id: 'B2', x0: 23, x1: 26, kind: 'broad' }, { id: 'N3', x0: 29, x1: 30, kind: 'narrow' }, { id: 'E', x0: 36, x1: 39, kind: 'bank' }],
  levers: [{ id: 'W', x: 1 }, { id: 'E', x: 38 }],
  bridges: [{ id: 'A', p0: 3, p1: 13 }, { id: 'B', p0: 26, p1: 36 }],
  planks: [5, 33],      /* the dam's loose timbers: they lie in the two wide reaches of the channel, and float up when the dam cracks */
  start: 37 };
/* the cracks: every gap of two tiles or less between two tops (local columns [a, b]) */
export const pitsOf = () => { const out = []; for (let i = 1; i < STAGE.tops.length; i++) { const a = STAGE.tops[i - 1].x1 + 1, b = STAGE.tops[i].x0 - 1; if (b >= a && b - a <= 1) out.push([a, b]); } return out; };
/* sx: the ledge's first column. W = { set, block, ent, air }. Returns the arena (main.js's boss room) */
export function stageMatriarch(W, T, TS, sx, room0 = 4) {
  const { block, ent, air } = W, ex = sx + STAGE.W, R = STAGE.R, top = STAGE.top;
  air(sx, ex - 1, room0, R - 1);
  block(sx - 1, sx - 1, 0, top - STAGE.door - 1); block(ex, ex, 0, top - STAGE.door - 1);   /* the walls over the two doors (at the banks' height) */
  air(sx - 1, sx - 1, top - STAGE.door, top - 1); air(ex, ex, top - STAGE.door, top - 1);
  block(sx - 1, sx - 1, top, R + 2); block(ex, ex, top, R + 2);
  block(sx - 1, ex, R, R + 2);
  for (const t of STAGE.tops) block(sx + t.x0, sx + t.x1, top, R - 1);
  /* THE CRACKS between the cluster's pillars (two tiles): rubble one row under the tops - a step down and up, never a pit to be stuck in; still under any flood */
  for (const [a, b] of pitsOf()) block(sx + a, sx + b, R - 1, R - 1);
  for (const l of STAGE.levers) ent('mlever', sx + l.x, top - 1, { lever: l.id });
  ent('matriarch', sx + STAGE.start, top - 1, { face: -1 });
  const arena = { x0: sx * TS, x1: ex * TS, floor: top * TS, trigger: (sx + 1) * TS, wallL: sx - 1, wallR: ex, boss: 'matriarch', music: 'matriarch',
    tint: '#c86a3a', tintA: 0.06, start: [sx + 2, top - 1], y0: room0 * TS, y1: (R + 2) * TS, mat: { sx, R, top } };
  return { arena };
}
/* the ledge in world px, from the arena */
export function geom(A, TS = 16) {
  const q = A.mat, sx = q.sx, X = c => (sx + c) * TS;
  const tops = STAGE.tops.map(t => ({ ...t, l: X(t.x0), r: X(t.x1 + 1), cx: (X(t.x0) + X(t.x1 + 1)) / 2 }));
  return { TS, x0: X(0), x1: X(STAGE.W), topY: q.top * TS, floorY: q.R * TS, wallY: (STAGE.wallRow + 1) * TS, bridgeY: (STAGE.bridgeRow + 1) * TS, tops,
    levers: STAGE.levers.map(l => ({ id: l.id, x: X(l.x) + 8 })),
    bridges: STAGE.bridges.map(b => ({ id: b.id, a: X(b.p0) + 8, b: X(b.p1) + 8, mid: (X(b.p0) + X(b.p1)) / 2 + 8 })),
    planks: STAGE.planks.map(c => ({ x: X(c), w: 2 * TS })),
    floodY: q.R * TS - 18, p3Y: q.top * TS + 10, pitY: (q.R - 1) * TS, pits: pitsOf().map(([a, b]) => [X(a), X(b + 1)]) };
}
/* the top under x (a body of half-width hw stands on the highest ground under it), or null over the channel */
export function topAt(G, x, hw = 0) { let best = null; for (const t of G.tops) if (x + hw > t.l && x - hw < t.r) best = t; return best; }
export const surfY = (G, x, hw = 20) => (topAt(G, x, hw) ? G.topY : G.pits.some(([l, r]) => x >= l && x < r) ? G.pitY : G.floorY);
export const nearestTop = (G, x, f) => G.tops.filter(t => !f || f(t)).sort((a, b) => Math.abs(a.cx - x) - Math.abs(b.cx - x))[0];

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, gap: 1, act: 0, behindT: 0, ward: 0, wardSaid: 0,
    sluice: { W: 1, E: 1 }, pending: [], burst: 0, burstId: 0, flood: false, horn: false, floodId: 0, water: 0,
    bridges: { A: 'up', B: 'up' }, perch: null, planks: false, shots: [], bands: [], chain: 0, surgeT: 0, openTaken: 0,
    fly: null, mark: null, told: {},
    n: { cycles: 0, opens: 0, staggers: 0, footing: 0, wasted: 0, releases: 0, pounces: 0, whiffs: 0, dives: 0, stuns: 0, perches: 0, cuts: 0, tangles: 0, volleys: 0, p3Staggers: 0,
      surges: 0, wards: 0, guarded: 0, warded: 0, raptors: 0, moves: {} } };
}
export const mPhase = e => (e.hp <= e.maxHp * MAT.p3 ? 3 : e.hp <= e.maxHp * MAT.p2 ? 2 : 1);
const BIG = new Set(['staggered', 'stunned', 'tangled', 'pstagger']);
const BEAT = new Set(['skid', 'rakeBeat']);
/* OPEN (the big openings the gorge makes; x MAT.openMul) and the BEATS (her guard is down: a blow lands whole from any side) */
export const matBig = e => !!e && BIG.has(e.mode) && (e.open || 0) > 0;
export const matBeat = e => !!e && BEAT.has(e.mode);
export const matOpen = e => matBig(e) || matBeat(e);
/* HER GUARD: a blow from in front of her by a hero standing at her height (not above her, not in the air over her) is turned by her talons */
export const guarded = (e, hx, hy, airborne) => !!e && !matOpen(e) && !(e.broken > 0) && e.mode !== 'sleep' && e.mode !== 'wake' && (e.face || 1) * (hx - e.x) > -6 && !(airborne && hy < e.y - 10) && Math.abs(hy - e.y) < 26;

const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 14, Math.min(G.x1 - 14, x));
const onFloor = (G, e) => e.y > G.topY + 8;
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell'); }
/* a flight from where she is to (tx, ty) over t s, an arc `arc` px high; `then` is the mode she lands in */
function fly(e, S, tx, ty, t, arc, then) { S.fly = { x0: e.x, y0: e.y, tx, ty, t, t0: t, arc, then }; e.mode = 'fly'; e.modeT = t; }
function endOpen(e, S, c) { e.open = 0; S.ward = MAT.wardT; S.n.wards++; S.openTaken = 0; c.number(e.x, e.y - 70, 'HER WARD: SHE SHAKES IT OFF', '#9ab0c0'); c.sound('tell'); c.fx('ward', e.x, e.y); }
function open(e, S, c, mode, t) { setMode(e, mode, t); e.open = t; S.openTaken = 0; S.n.opens++; c.fx('open', e.x, e.y); }

/* ---------- THE WATER (the hands tell her what the gorge's clock does: c.horn(), c.flood()) ---------- */
/* E AT A LEVER: the sluice lets the banked flood go. Returns 'released' | 'empty' | 'busy' */
export function pull(S, id) { if (S.pending.length || S.burst > 0) return 'busy'; if (!S.sluice[id]) return 'empty'; S.sluice[id] = 0; S.pending.push({ id, t: MAT.releaseTell }); S.n.releases++; return 'released'; }
function stepWater(e, S, dt, c) {
  const G = S.G, horn = !!c.horn(), flood = !!c.flood();
  if (flood && !S.flood) { S.floodId++; if (S.ph < 3 && (!S.sluice.W || !S.sluice.E)) { S.sluice.W = 1; S.sluice.E = 1; c.number((G.x0 + G.x1) / 2, G.topY - 90, 'THE DAM BANKS THE FLOOD: THE SLUICES ARE FULL', '#7ab8e8'); } }
  S.horn = horn; S.flood = flood;
  for (const p of S.pending) { p.t -= dt; if (p.t <= 0) { S.burst = MAT.burstT; S.burstId++; c.sound('burst'); c.shake(4); c.fx('burst', p.id === 'W' ? G.x0 + 40 : G.x1 - 40, G.floorY); } }
  S.pending = S.pending.filter(p => p.t > 0);
  if (S.burst > 0) S.burst = Math.max(0, S.burst - dt);
  if (S.ph === 3 && S.water < 1) S.water = Math.min(1, S.water + dt / MAT.riseT);
}
/* is the channel floor under water now (a natural flood, a burst, the cracked dam)? */
export const channelWet = S => !!(S && (S.flood || S.burst > 0 || (S.ph === 3 && S.water > 0.3)));

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, air, pp }], c = the world:
   c.hit(box, dmg, name, o)  c.band(box, dmg, name, key, o)  c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)
   c.spawnRaptor(x, y) -> foe   c.raptors() -> alive   c.solid(px, py)   c.horn()  c.flood()   c.music(ph)   c.sweep(hero) (into the water) ---------- */
export function stepMatriarch(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  stepWater(e, S, dt, c); stepShots(e, S, dt, h, c); stepBands(e, S, dt, h, c);
  if (S.ph === 3 && S.water >= 1) { S.surgeT -= dt; }
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* BROKEN (her poise bar, emptied by heavies): she reels where she stands for the break - an opening (B4: stagger means still) */
  if (e.broken > 0 && !matBig(e) && e.y >= G.topY - 2 && (e.mode === 'walk' || e.mode === 'recover' || e.mode === 'skid' || e.mode === 'rakeBeat' || /Tell$/.test(e.mode))) { e.modeT += dt; S.n.broken = (S.n.broken || 0) + (S.wasBroken ? 0 : 1); S.wasBroken = 1; return; }
  S.wasBroken = 0;
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = mPhase(e);
  if (want > S.ph && !matOpen(e) && (e.mode === 'walk' || e.mode === 'recover' || e.mode === 'wallRun' || e.mode === 'perch')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; S.bands = []; S.perch = null;
    if (want === 2) { c.number(e.x, e.y - 70, 'SHE TAKES TO THE CANYON WALLS', '#ff9a5c'); c.sound('screech'); c.music(2); fly(e, S, clampX(G, e.x), G.wallY, MAT.wallUp, 30, 'wallRun'); e.modeT = MAT.wallUp; S.runT = 0.8; return; }
    if (want === 3) { setMode(e, 'crack', MAT.crackT); c.number((G.x0 + G.x1) / 2, G.topY - 100, 'THE DAM CRACKS: GET TO THE PILLARS', '#ff6b6b'); c.sound('crack'); c.shake(6); c.music(3); return; } }
  /* THE HORN (phase one): she has warning - to a broad pillar or a bank before the water comes */
  if (S.ph === 1 && (S.horn || S.flood) && onFloor(G, e) && (e.mode === 'walk' || e.mode === 'recover' || e.mode === 'skid' || e.mode === 'rakeBeat' || /Tell$/.test(e.mode))) {
    const t = nearestTop(G, e.x, q => q.kind !== 'narrow'); if (!S.told.horn) { S.told.horn = 1; c.number(e.x, e.y - 64, 'SHE HATES THE WATER: SHE MAKES FOR THE ROCK', '#ffd36b'); }
    fly(e, S, clampX(G, Math.max(t.l + 20, Math.min(t.r - 20, e.x))), G.topY, MAT.hornLeap, 40, 'walk'); return; }
  /* A BURST (yours): no warning - caught in the channel she leaps for the NEAREST pillar */
  if (S.burst > 0 && S.burstSeen !== S.burstId) { S.burstSeen = S.burstId;
    if (S.ward > 0) { c.number(e.x, e.y - 64, 'HER WARD: SHE IS READY FOR IT', '#9ab0c0'); S.n.warded++; }
    else if (onFloor(G, e) && !matBig(e) && e.mode !== 'fly' && S.ph < 3) { const t = nearestTop(G, e.x, q => q.kind !== 'bank'); S.panicTop = t;   /* the nearest PILLAR (the banks are not pillars: no warning, no choosing) */
      fly(e, S, t.cx, G.topY, MAT.panicFly, 34, t.kind === 'narrow' ? 'wobble' : 'walk'); if (t.kind !== 'narrow') { S.n.footing++; S.footSay = 1; } return; }
    else if (!matBig(e)) { S.n.wasted++; c.number(e.x, e.y - 64, 'SHE IS UP ON THE ROCK: THE WATER IS WASTED', '#9aa39a'); } }
  switch (e.mode) {
    case 'fly': stepFly(e, S, dt, P, c); return;
    case 'staggered': case 'stunned': case 'tangled': case 'pstagger':
      if (e.mode === 'pstagger') e.x += Math.sin(e.modeT * 22) * 0.3;   /* she wobbles on the narrow top, flapping - and stands her ground (B4: no retreat walk) */
      if (e.open <= 0) { endOpen(e, S, c); if (S.ph === 2) { fly(e, S, clampX(G, e.x), G.wallY, MAT.wallUp, 30, 'wallRun'); S.runT = 1.2; } else setMode(e, 'recover', 0.4); }
      return;
    case 'wobble': if (e.modeT <= 0) { const t = S.panicTop || topAt(G, e.x) || nearestTop(G, e.x), floorL = t.l - 22, floorR = t.r + 22, side = (Math.abs(floorL - (G.x0 + G.x1) / 2) > Math.abs(floorR - (G.x0 + G.x1) / 2)) ? -1 : 1;
        const tx = clampX(G, side < 0 ? floorL : floorR); S.n.staggers++; fly(e, S, tx, surfY(G, tx, 4), 0.32, 10, 'staggered'); } return;
    case 'skid': { const sl = MAT.skidSlide / MAT.skidT; e.x = clampX(G, e.x + (e.face || 1) * sl * dt * Math.max(0, e.modeT / MAT.skidT)); follow(e, S, dt); if (e.modeT <= 0) setMode(e, 'recover', 0.25); return; }
    case 'rakeBeat': case 'recover': follow(e, S, dt); if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'crack': if (e.modeT <= 0) { S.water = Math.max(S.water, 0.01); S.planks = true; c.number((G.x0 + G.x1) / 2, G.topY - 100, "THE CHANNEL FLOODS: THE DAM'S TIMBERS FLOAT UP", '#7ab8e8'); S.surgeT = 1.5;
        const t = nearestTop(G, P.x, q => q.kind === 'broad'); fly(e, S, t.cx, G.topY, 0.6, 50, 'walk'); S.script = nextScript(S); S.step = 0; } return;
    case 'walk': {
      if (S.ph === 2) { setMode(e, 'wallRun', 1.0); return; }
      const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > MAT.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      const nx = clampX(G, e.x + Math.sign(d) * MAT.walk * dt);
      /* phase three: never off the tops into the water (she pounces, she does not wade); one and two: she walks the channel too */
      if (Math.abs(d) > MAT.keep && !(S.ph === 3 && !topAt(G, nx, 20))) e.x = nx;
      follow(e, S, dt);
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
    case 'wallRun': { e.y = G.wallY; const want = clampX(G, P.x + (S.runDir || 1) * 70); e.x += Math.sign(want - e.x) * Math.min(Math.abs(want - e.x), MAT.runV * dt); if (Math.abs(want - e.x) < 4) S.runDir = -(S.runDir || 1);
      e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) nextMove(e, S, P, c); return; }
    case 'perch': { const b = S.perch; e.y = G.bridgeY; if (!b || S.bridges[b] !== 'up') { S.perch = null; setMode(e, 'falling', 0); S.n.cuts++; return; }
      if (!S.perchVolley && e.modeT < MAT.perchT * 0.55) { S.perchVolley = 1; if (c.raptors() < MAT.raptorCap) { tell(e, S, c, 'screechTell', MAT.screechTell); S.afterScreech = 'perch'; S.perchLeft = e.modeT; return; } }
      if (e.modeT <= 0) { S.perch = null; fly(e, S, clampX(G, e.x), G.wallY, 0.45, 20, 'wallRun'); S.runT = 1.0; } return; }
    case 'falling': { e.vy = (e.vy || 0) + 900 * dt; e.y += e.vy * dt; const fy = surfY(G, e.x, 4); if (e.y >= fy) { e.y = fy; e.vy = 0; S.n.tangles++; open(e, S, c, 'tangled', MAT.tangleT); c.number(e.x, e.y - 64, 'THE ROPES PART: SHE IS TANGLED IN THE BRIDGE', '#8fd160'); c.sound('fall'); c.shake(4); } return; }
  }
  stepMove(e, S, dt, P, h, c);
}
/* her feet follow the ground under her: a hop up onto a pillar, a drop into the channel */
function follow(e, S, dt) { const G = S.G, sy = surfY(G, e.x, 20); if (e.y > sy + 1) e.y = Math.max(sy, e.y - MAT.hopUp * dt); else if (e.y < sy - 1) e.y = Math.min(sy, e.y + MAT.fall * dt); }

function nextMove(e, S, P, c) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  const G = S.G; let m = S.script[S.step++]; const dx = P.x - e.x, near = Math.abs(dx) < MAT.rakeRange && Math.abs(P.y - e.y) < 24;
  e.face = Math.sign(dx) || e.face;
  if (m === 'rake' && !near) m = 'pounce';
  if (m === 'sweep' && !(Math.abs(dx) < MAT.sweepR + 20 && Math.abs(P.y - e.y) < 30)) m = 'pounce';
  if (m === 'screech' && c.raptors() >= MAT.raptorCap) m = 'scree';
  if (m === 'perch' && S.bridges.A !== 'up' && S.bridges.B !== 'up') m = 'volley';
  if (m === 'surge' && S.ph === 3) { S.surgeT = 0; }
  switch (m) {
    case 'pounce': tell(e, S, c, 'pounceTell', MAT.pounceTell); return;
    case 'rake': tell(e, S, c, 'rakeTell', MAT.rakeTell); S.rakeN = 0; return;
    case 'sweep': tell(e, S, c, 'sweepTell', MAT.sweepTell); return;
    case 'scree': tell(e, S, c, 'screeTell', MAT.screeTell); return;
    case 'screech': tell(e, S, c, 'screechTell', MAT.screechTell); return;
    case 'run': setMode(e, 'wallRun', MAT.runT[0] + (MAT.runT[1] - MAT.runT[0]) * ((S.act * 0.37) % 1)); return;
    case 'dive': { tell(e, S, c, 'diveTell', MAT.diveTell); let mx = P.x; const t = topAt(G, mx, 4); if (!t && P.y < G.floorY - 8) { const n = nearestTop(G, mx); mx = Math.max(n.l + 18, Math.min(n.r - 18, mx)); }
      S.mark = { x: clampX(G, mx), y: surfY(G, mx, 4) }; c.fx('mark', S.mark.x, S.mark.y); c.sound('screech'); return; }
    case 'volley': tell(e, S, c, 'volleyTell', MAT.volleyTell); S.aim = { x: P.x, y: P.y - 10 }; return;
    case 'perch': { const ids = ['A', 'B'].filter(k => S.bridges[k] === 'up'), b = G.bridges.filter(q => ids.includes(q.id)).sort((p, q) => Math.abs(p.mid - P.x) - Math.abs(q.mid - P.x))[0];
      S.perch = b.id; S.perchVolley = 0; S.n.perches++; fly(e, S, b.mid, G.bridgeY, MAT.toBridge, 20, 'perch'); if (!S.told.perch) { S.told.perch = 1; c.number(b.mid, G.bridgeY - 40, 'SHE PERCHES ON THE ROPE BRIDGE', '#ffd36b'); } return; }
    case 'chain': S.chain = MAT.chainN; tell(e, S, c, 'pounceTell', MAT.pounceTell * 0.9); return;
    case 'surge': tell(e, S, c, 'surgeTell', MAT.surgeTell); if (c.raptors() < MAT.raptorCap) for (let i = c.raptors(); i < MAT.raptorCap; i++) { c.spawnRaptor(i % 2 ? G.x1 - 30 : G.x0 + 30, G.topY - 100); S.n.raptors++; }
      c.number(e.x, e.y - 70, "SHE SCREECHES: HER BROOD, AND THE RAPIDS' DEBRIS", '#ff6b6b'); S.n.surges++; return;
  }
  setMode(e, 'walk', 0.5);
}

/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, f = e.face || 1;
  switch (e.mode) {
    case 'pounceTell': if (e.modeT <= MAT.pounceLock && !S.pAt) { S.pAt = { x: P.x }; c.fx('pmark', P.x, surfY(G, P.x, 4)); }   /* HER EYE LOCKS ON: the spot she will land on is marked (her shadow) for the last of the crouch */
      if (e.modeT <= 0) { const lx = S.pAt ? S.pAt.x : P.x; S.pAt = null; let tx = clampX(G, lx), ty = surfY(G, tx, 4);
        if (S.ph === 3) { const t = topAt(G, lx, 4) || nearestTop(G, lx); tx = t.kind === 'narrow' ? t.cx : clampX(G, Math.max(t.l + 20, Math.min(t.r - 20, lx))); ty = G.topY; S.target = t; }
        else if (!topAt(G, tx, 4) && ty === G.floorY) ty = G.floorY;
        S.n.pounces++; c.sound('leap'); e.face = Math.sign(tx - e.x) || f; fly(e, S, tx, ty, MAT.pounceFly, MAT.pounceArc, 'land'); } return;
    case 'rakeTell': if (e.modeT <= 0) { setMode(e, 'rake', MAT.rakeT); S.rakeN = (S.rakeN || 0) + 1; c.sound('slash');
        c.hit([f > 0 ? e.x : e.x - MAT.rakeReach, f > 0 ? e.x + MAT.rakeReach : e.x, e.y - 34, e.y], MAT.dmg.rake, MOVE_NAME.rake, { blockable: true, key: 'rake' + S.act + '.' + S.rakeN }); } return;
    case 'rake': if (e.modeT <= 0) { if (S.rakeN < 2) setMode(e, 'rakeTell', MAT.rakeGap); else setMode(e, 'rakeBeat', MAT.rakeBeatT); } return;
    case 'sweepTell': if (e.modeT <= 0) { setMode(e, 'sweep', MAT.sweepT); c.sound('sweep'); } return;
    case 'sweep': c.band([e.x - MAT.sweepR, e.x + MAT.sweepR, e.y - MAT.sweepH, e.y + 2], MAT.dmg.sweep, MOVE_NAME.sweep, 'sweep' + S.act, { low: true });
      if (e.modeT <= 0) setMode(e, 'recover', 0.4); return;
    case 'screeTell': if (e.modeT <= 0) { c.sound('scree'); c.fx('scree', e.x + f * 20, e.y);
        for (let i = 0; i < MAT.screeN; i++) { const k = i / Math.max(1, MAT.screeN - 1); S.shots.push({ k: 'rock', x: e.x + f * 18, y: e.y - 6, vx: f * (MAT.screeV[0] + (MAT.screeV[1] - MAT.screeV[0]) * k), vy: -(50 + 90 * ((i * 7) % 4) / 3), g: MAT.screeG, t: 1.6, key: 'scree' + S.act }); }
        setMode(e, 'recover', 0.5); } return;
    case 'screechTell': if (e.modeT <= 0) { c.sound('screech'); const n = Math.max(0, MAT.raptorCap - c.raptors()); for (let i = 0; i < n; i++) { c.spawnRaptor(i % 2 ? G.x1 - 30 : G.x0 + 30, G.topY - 110); S.n.raptors++; }
        if (n && !S.told.brood) { S.told.brood = 1; c.number(e.x, e.y - 70, 'HER BROOD COMES OFF THE WALLS', '#ffd36b'); }
        if (S.afterScreech === 'perch') { S.afterScreech = null; setMode(e, 'perch', Math.max(0.6, S.perchLeft || 1)); } else setMode(e, 'recover', 0.4); } return;
    case 'diveTell': e.y = S.perch ? G.bridgeY : G.wallY; if (e.modeT <= 0) { S.n.dives++; c.sound('dive'); fly(e, S, S.mark.x, S.mark.y, MAT.diveFly, -6, 'diveLand'); } return;
    case 'volleyTell': if (e.modeT <= 0) { S.n.volleys++; c.sound('volley'); const a0 = Math.atan2(S.aim.y - (e.y - 16), S.aim.x - e.x);
        for (let i = 0; i < MAT.quills; i++) { const a = a0 + (i - (MAT.quills - 1) / 2) * MAT.quillSpread; S.shots.push({ k: 'quill', x: e.x, y: e.y - 16, vx: Math.cos(a) * MAT.quillV, vy: Math.sin(a) * MAT.quillV, g: 0, t: 2.2, key: 'quill' + S.act + '.' + i, a }); }
        setMode(e, S.perch && S.bridges[S.perch] === 'up' ? 'perch' : 'wallRun', S.perch ? Math.max(0.6, S.perchLeft || 1) : 1.0); } return;
    case 'surgeTell': if (e.modeT <= 0) { const fromW = S.surgeN = ((S.surgeN || 0) + 1) % 2; S.bands.push({ k: 'surge', x: fromW ? G.x0 : G.x1, dir: fromW ? 1 : -1, v: MAT.surgeV, y0: G.topY - 16, y1: G.topY + 2, key: 'surge' + S.act });
        c.sound('surge'); setMode(e, 'recover', 0.5); } return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* a flight in progress; on landing, what the landing does */
function stepFly(e, S, dt, P, c) {
  const F = S.fly, G = S.G; if (!F) { setMode(e, 'walk', 0.3); return; }
  F.t -= dt; const k = Math.min(1, 1 - F.t / F.t0); e.x = F.x0 + (F.tx - F.x0) * k; e.y = F.y0 + (F.ty - F.y0) * k - Math.sin(Math.PI * k) * F.arc;
  if (F.t > 0) return;
  e.x = F.tx; e.y = F.ty; S.fly = null; const then = F.then;
  if (then === 'land') {
    c.fx('land', e.x, e.y); c.shake(2);
    const hitAny = c.hit([e.x - MAT.pounceR, e.x + MAT.pounceR, e.y - 40, e.y + 20], MAT.dmg.pounce, MOVE_NAME.pounce, { key: 'pounce' + S.act, pin: true });
    if (S.ph === 3) { const t = topAt(G, e.x, 4);
      if (t && t.kind === 'narrow' && !(S.ward > 0)) { S.n.p3Staggers++; S.chain = 0; open(e, S, c, 'pstagger', MAT.p3StaggerT); if (!S.told.p3) c.number(e.x, e.y - 64, 'THE NARROW TOP THROWS HER: STRIKE', '#8fd160'); S.told.p3 = 1; return; }
      if (S.chain > 1 && !hitAny) { S.chain--; tell(e, S, c, 'pounceTell', MAT.chainGap + 0.3); return; }
      S.chain = 0; setMode(e, 'recover', 0.45); return; }
    if (hitAny) { setMode(e, 'recover', 0.55); return; }
    S.n.whiffs++; setMode(e, 'skid', MAT.skidT); if (!S.told.skid) { S.told.skid = 1; c.number(e.x, e.y - 60, 'SHE SKIDS: HER GUARD IS DOWN', '#ffd36b'); } return; }
  if (then === 'diveLand') { c.fx('land', e.x, e.y); c.shake(4); const hit = c.hit([e.x - MAT.diveR, e.x + MAT.diveR, e.y - 40, e.y + 8], MAT.dmg.dive, MOVE_NAME.dive, { key: 'dive' + S.act });
    S.mark = null; if (hit) { fly(e, S, clampX(G, e.x), G.wallY, MAT.wallUp, 20, 'wallRun'); S.runT = 1.0; return; }
    S.n.stuns++; open(e, S, c, 'stunned', MAT.stunT); if (!S.told.stun) c.number(e.x, e.y - 64, 'SHE SLAMS INTO THE ROCK: STUNNED', '#8fd160'); S.told.stun = 1; return; }
  if (then === 'wobble') { setMode(e, 'wobble', MAT.wobbleT); c.number(e.x, e.y - 64, 'THE NARROW PILLAR THROWS HER', '#8fd160'); c.sound('flap'); return; }
  if (then === 'walk' && S.footSay) { S.footSay = 0; c.number(e.x, e.y - 64, 'SHE FINDS HER FOOTING ON THE BROAD ROCK', '#9aa39a'); }
  if (then === 'staggered') { open(e, S, c, 'staggered', MAT.staggerT); c.number(e.x, e.y - 64, 'SHE FALLS INTO THE WATER: STAGGERED', '#8fd160'); c.shake(3); return; }
  if (then === 'wallRun') { setMode(e, 'wallRun', S.runT || 1.2); e.y = G.wallY; return; }
  if (then === 'perch') { setMode(e, 'perch', MAT.perchT); return; }
  setMode(e, 'walk', 0.45);
}
/* the rocks and the quills: they fly, rocks fall and stop on rock, and each hits once */
function stepShots(e, S, dt, h, c) {
  for (const s of S.shots) { s.t -= dt; s.vy += (s.g || 0) * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if (c.solid(s.x, s.y)) { s.t = 0; c.fx(s.k === 'rock' ? 'rockLand' : 'quillLand', s.x, s.y); continue; }
    if (s.y > S.G.floorY + 4 || s.x < S.G.x0 - 20 || s.x > S.G.x1 + 20) { s.t = 0; continue; }
    if (c.hit([s.x - 5, s.x + 5, s.y - 5, s.y + 5], s.k === 'rock' ? MAT.dmg.scree : MAT.dmg.quill, s.k === 'rock' ? MOVE_NAME.scree : MOVE_NAME.quill, { key: s.key, unblockable: s.k === 'quill', blockable: s.k === 'rock' })) s.t = 0; }
  S.shots = S.shots.filter(s => s.t > 0);
}
/* THE DEBRIS SURGE: a band of flotsam across the pillar tops; a hero it catches goes into the water */
function stepBands(e, S, dt, h, c) {
  for (const b of S.bands) { b.x += b.dir * b.v * dt;
    for (const q of h) if (q.alive && Math.abs(q.x - b.x) < 14 && q.y > b.y0 && q.y <= b.y1 + 2 && !(q.air && q.y < b.y0 + 10)) { if (c.band([b.x - 14, b.x + 14, b.y0, b.y1], MAT.dmg.surge, MOVE_NAME.surge, b.key, { low: true })) c.sweep(q); } }
  S.bands = S.bands.filter(b => b.x > S.G.x0 - 30 && b.x < S.G.x1 + 30);
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT (the Puppeteer's lesson): it sees a tell PLAN.react s after it began and misreads some (PLAN.miss); it is late to some levers
   (PLAN.missLever). It keeps out of the channel when water comes; phase one it baits her from a bank's lever (stand on the bank by a full lever,
   pull it while she is in the channel - her pounce from the floor, her walk across it - then cut her staggered); it blocks or backs off her
   rake, jumps her sweep, gets behind her scree, rolls her pounce late, and cuts her beats and her back. Phase two it steps off her dive's mark,
   rolls her volley, strikes a bridge's post while she perches on it, and cuts her stunned or tangled. Phase three it stands on a NARROW pillar,
   jumps to the next top as she pounces, and cuts her staggered; it jumps the surge.
   s = { P: { x, y, face, ground, atk, vy }, e, S, reach, shield, t, rng, mem } -> { gx, face, atk, jump, dodge, block, talk, strike, why } */
export const PLAN = { react: 0.25, miss: 0.12, missLever: 0.15 };
export function matPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, talk: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 10, hi = G.x1 - 10, clamp = x => Math.max(lo, Math.min(hi, x));
  const myTop = topAt(G, P.x, 2), onTop = !!myTop && P.y <= G.topY + 2, wet = channelWet(S) || S.horn || S.pending.length > 0;
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - e.y) < 24;
  const hitR = reach + MAT.w / 2 - 2, stand = s.tip ? 32 : 16,   /* (the warden stands a little off: her spear measured best at 30 px, claude/redgorge2) */ swing = (fx) => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  /* A ROLL'S WAY: away from where she lands if there is room (a wall is not room), never off a top into water that is coming; else through under her; else none */
  const rollDir = ax => { const wetNow = channelWet(S) || S.horn || S.pending.length > 0, room = d => (d < 0 ? P.x - lo : hi - P.x), ok = d => room(d) >= 60 && !(wetNow && onTop && !topAt(G, clamp(P.x + d * 60), 2)) && !(S.ph === 3 && !topAt(G, clamp(P.x + d * 60), 2));
    const away = P.x <= ax ? -1 : 1; return ok(away) ? away : ok(-away) ? -away : room(-1) > room(1) ? -1 : 1; };
  /* the tops a hero can get to from here: up a pillar from the channel, across a gap at the same height */
  const goTop = top => { const x = clamp(Math.max(top.l + 8, Math.min(top.r - 8, P.x))); out.gx = x; if (!onTop && Math.abs(P.x - x) < 26 && P.ground) out.jump = true;
    if (onTop && myTop !== top && P.ground && (Math.abs(P.x - myTop.l) < 10 || Math.abs(P.x - myTop.r) < 10)) out.jump = true; return fin(out); };
  const fin = o => { if (s.noRoll && o.dodge) o.dodge = false; return o; };
  /* 0. IN THE WATER'S WAY: out of the channel onto the nearest top */
  if (!onTop && wet && S.ph < 3) { const tp = nearestTop(G, P.x, q => !(matOpen(e) === false && q === topAt(G, kx, 20) && dx < 30)); out.why = 'out of the channel'; return goTop(tp); }
  /* 0b. AT A FULL LEVER WITH HER IN THE CHANNEL (her crouch to pounce at you from the floor is the moment): pull */
  if (S.ph === 1 && onTop && !S.pending.length && !(S.burst > 0) && e.y > G.topY + 8 && e.mode !== 'fly' && !matOpen(e) && !(S.ward > 0)) {
    const lv = G.levers.find(l => S.sluice[l.id] && Math.abs(l.x - P.x) < 12); if (lv && seenFor('lv' + S.act) && !roll('lv' + S.act, PLAN.missLever)) { out.talk = true; out.gx = P.x; out.why = 'pull: she is in the channel'; return fin(out); } }
  /* 1. HER BLOWS COMING (a quarter-second late, some misread) */
  const key = 'k' + S.act + e.mode;
  if (/Tell$/.test(e.mode) || e.mode === 'fly' || e.mode === 'rake' || e.mode === 'sweep') {
    const miss = roll(key + 'm', PLAN.miss), seen = seenFor('a' + S.act);
    if (seen && !miss) {
      if (e.mode === 'pounceTell' && S.ph === 3) { mem.p3From = myTop ? myTop.id : null; if (e.modeT < 0.22 && myTop && dx < 260) { const nb = G.tops.filter(q => q !== myTop && Math.abs(q.cx - myTop.cx) < 110 && q.kind !== 'bank').sort((a, b) => (a.kind === 'narrow') - (b.kind === 'narrow') || Math.abs(a.cx - P.x) - Math.abs(b.cx - P.x))[0];
          if (nb) { out.gx = nb.cx; if (P.ground) out.jump = true; out.why = 'off the narrow top as she comes'; return fin(out); } } out.gx = myTop && myTop.kind === 'narrow' ? myTop.cx : P.x; out.why = 'wait on the top for her pounce'; return fin(out); }
      if (e.mode === 'pounceTell') { if (S.pAt && Math.abs(P.x - S.pAt.x) < 40) { let d = P.x >= S.pAt.x ? 1 : -1; if ((d < 0 ? P.x - lo : hi - P.x) < 50) d = -d; out.gx = clamp(S.pAt.x + d * 52); out.why = 'off her mark'; return fin(out); } out.gx = P.x; out.why = 'hold still: she leaps where you stand'; return fin(out); }
      if (e.mode === 'fly' && S.fly && S.fly.then === 'land' && S.ph < 3 && Math.abs(S.fly.tx - P.x) < 46 && P.ground) { if (S.pending.length || S.burst > 0) { out.gx = P.x; out.why = 'the burst will throw her: stay up'; return fin(out); } const d = rollDir(S.fly.tx); if (d) { out.dodge = true; out.gx = clamp(P.x + d * 60); } else out.gx = P.x; out.why = 'late roll out from under her'; return fin(out); }
      if (e.mode === 'fly' && S.fly && S.fly.then === 'diveLand' && Math.abs(S.fly.tx - P.x) < 40 && P.ground) { const d = rollDir(S.fly.tx); if (d) { out.dodge = true; out.gx = clamp(P.x + d * 60); } out.why = 'roll off the dive'; return fin(out); }
      if ((e.mode === 'rakeTell' || e.mode === 'rake') && dx < 80 && same) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the rake'; return fin(out); }
        const room = side < 0 ? P.x - lo : hi - P.x; if (room >= 70) { out.gx = clamp(kx + side * 92); out.why = 'back off the rake'; return fin(out); }
        if (e.mode === 'rakeTell' && e.modeT < 0.2) { const d = rollDir(P.x + side); out.dodge = true; out.gx = clamp(P.x + (d || -side) * 60); out.why = 'cornered: roll through the rake'; return fin(out); } out.gx = P.x; out.why = 'cornered: wait to roll'; return fin(out); }
      if ((e.mode === 'sweepTell' || e.mode === 'sweep') && dx < MAT.sweepR + 16 && Math.abs(P.y - e.y) < 30) { if ((e.mode === 'sweep' || e.modeT < 0.14) && P.ground) out.jump = true; else out.gx = clamp(kx + side * (MAT.sweepR + 24)); out.why = 'over the sweep'; return fin(out); }
      if (e.mode === 'screeTell') { out.gx = clamp(kx - (e.face || 1) * 40); out.why = 'behind her scree'; return fin(out); }
      if (e.mode === 'diveTell' && S.mark) { const dm = Math.abs(P.x - S.mark.x);   /* HER SHADOW MARKS YOUR SPOT: walk off it along this rock, or roll late if the rock is too short; never a jump under her */
        if (dm >= 44) { out.gx = P.x; out.why = 'off the dive mark'; return fin(out); }
        if ((s.noRoll || e.modeT < 0.3) && P.ground) { const d = rollDir(S.mark.x); out.dodge = !s.noRoll; out.gx = clamp(P.x + (d || 1) * 60); out.why = 'late roll off the dive mark'; return fin(out); }
        const away = P.x >= S.mark.x ? 1 : -1; let gx = S.mark.x + away * 50; if (onTop && myTop) gx = Math.max(myTop.l + 6, Math.min(myTop.r - 6, gx)); out.gx = clamp(gx); out.why = 'off the dive mark'; return fin(out); }
      if (e.mode === 'volleyTell' && e.modeT < 0.3) { out.dodge = true; out.gx = clamp(P.x + (P.x < kx ? -50 : 50)); out.why = 'roll the quills'; return fin(out); }
      if (e.mode === 'surgeTell') { out.gx = P.x; out.why = 'wait for the surge'; return fin(out); }
    }
  }
  /* the surge and the quills in flight */
  for (const b of S.bands) if (Math.abs(b.x - P.x) < 46 && b.dir * (P.x - b.x) > 0 && P.ground) { out.jump = true; out.gx = P.x; out.why = 'jump the surge'; return fin(out); }
  for (const q of S.shots) if (q.k === 'quill' && Math.hypot(q.x - P.x, q.y - (P.y - 10)) < 40 && P.ground && !roll('q' + q.key, PLAN.miss)) { out.dodge = true; out.gx = clamp(P.x + (q.vx > 0 ? 40 : -40)); out.why = 'roll the quill'; return fin(out); }
  /* 2. HER WARD: off her, let it pass */
  if (S.ward > 0) { out.gx = clamp(kx + side * 70); out.why = 'her ward: wait'; return fin(out); }
  /* 3. OPEN, OR A BEAT: cut her (from the side that is dry) */
  if (matOpen(e)) { if (e.mode !== 'pstagger' && S.burst > 0 && !onTop) { out.gx = P.x; out.why = 'wait for the burst'; return fin(out); }
    if (e.mode === 'pstagger') { const tp = topAt(G, kx, 2); if (myTop !== tp) { out.gx = tp.cx; if (P.ground && onTop && (Math.abs(P.x - myTop.l) < 12 || Math.abs(P.x - myTop.r) < 12)) out.jump = true; out.why = 'to her top'; } else { out.gx = s.tip ? clamp(kx + side * stand) : kx - side * 6; swing(kx); out.why = 'cut her: staggered'; } return fin(out); }
    if (matBig(e) && onTop && e.y > G.topY + 8 && S.ph < 3) { out.gx = clamp(kx + side * stand); out.why = 'down to her'; if (Math.abs(P.x - out.gx) < 30 && myTop) out.gx = clamp(P.x < myTop.cx ? myTop.l - 10 : myTop.r + 10); return fin(out); }
    out.gx = clamp(kx + side * stand); if (dx < hitR + 2 && Math.abs(P.y - e.y) < 30) swing(kx); out.why = matBig(e) ? 'cut her: open' : 'cut her: her guard is down'; return fin(out); }
  /* 4. PHASE TWO: a post under her bridge */
  if (S.ph === 2 && e.mode === 'perch' && S.perch) { const b = G.bridges.find(q => q.id === S.perch), px = Math.abs(b.a - P.x) < Math.abs(b.b - P.x) ? b.a : b.b;
    const tp = topAt(G, px, 2); if (myTop !== tp) { out.why = 'to the bridge post'; return goTop(tp); } out.gx = px - Math.sign(px - P.x || 1) * 14; out.strike = Math.abs(P.x - px) < reach + 12; if (out.strike) swing(px); out.why = 'strike the post'; return fin(out); }
  if (S.ph === 2) { /* under the walls: up on the rock, any rock (out of the floods), still */ if (!onTop) { out.why = 'to a broad top'; return goTop(nearestTop(G, P.x, q => q.kind !== 'narrow')); } out.gx = clamp(Math.max(myTop.l + 8, Math.min(myTop.r - 8, P.x))); out.why = 'wait under the walls'; return fin(out); }
  /* 5. PHASE THREE: stand on a narrow top near her */
  if (S.ph === 3) { if (S.water < 1 && !onTop) { out.why = 'to the pillars'; return goTop(nearestTop(G, P.x, q => q.kind !== 'bank')); }
    const want = G.tops.filter(q => q.kind === 'narrow').sort((a, b) => Math.abs(a.cx - P.x) - Math.abs(b.cx - P.x))[0];
    if (myTop !== want) { if (!myTop) { out.gx = want.cx; out.why = 'to a narrow top'; return fin(out); }
      /* hop top to top towards it (a plank in a wide reach is a step) */
      const dir = Math.sign(want.cx - P.x), next = G.tops.filter(q => dir * (q.cx - myTop.cx) > 0).sort((a, b) => Math.abs(a.cx - myTop.cx) - Math.abs(b.cx - myTop.cx))[0];
      const edge = dir > 0 ? myTop.r - 6 : myTop.l + 6; out.gx = next ? next.cx : want.cx; if (P.ground && Math.abs(P.x - edge) < 10) out.jump = true; out.why = 'to a narrow top'; return fin(out); }
    out.gx = want.cx; if (dx < hitR && same && (e.face || 1) * (P.x - kx) < -6) swing(kx); out.why = 'on the narrow top'; return fin(out); }
  /* 5b. THE WATER IS COMING OR RUNNING: stay up on this rock (never cross the channel to a lever now) */
  if (wet && onTop && myTop) { out.gx = clamp(Math.max(myTop.l + 8, Math.min(myTop.r - 8, P.x))); if (dx < hitR && same && (e.face || 1) * (P.x - kx) < -6) swing(kx); out.why = 'on the rock: the water comes'; return fin(out); }
  /* 6. PHASE ONE: THE LEVER. On a bank by a full sluice; pull while she is in the channel */
  const lev = G.levers.filter(l => S.sluice[l.id]).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (lev && !S.pending.length && !(S.burst > 0)) { const bank = topAt(G, lev.x, 2);
    if (myTop !== bank || !onTop) { out.why = 'to the lever'; return goTop(bank); }
    const inCh = e.y > G.topY + 8 && e.mode !== 'fly' && !matOpen(e);
    if (inCh && !roll('lv' + S.act, PLAN.missLever)) { out.gx = lev.x; if (Math.abs(P.x - lev.x) < 12) { out.talk = true; out.why = 'pull: she is in the channel'; } else out.why = 'to the lever: she is in the channel'; return fin(out); }
    /* bait: by the lever, a step off it towards her; she comes across the channel at you */
    out.gx = clamp(lev.x + (kx > lev.x ? 20 : -20)); if (dx < hitR && same && (e.face || 1) * (P.x - kx) < -6) swing(kx); out.why = 'by the lever: bait her into the channel'; return fin(out); }
  /* no water banked: fight her on the rock - behind her when she turns, never into her front */
  if (dx < hitR && same && (e.face || 1) * (P.x - kx) < -6) { swing(kx); out.gx = P.x; out.why = 'cut her back'; return fin(out); }
  out.gx = clamp(kx + side * 64); out.why = 'keep off her front'; return out;
}
