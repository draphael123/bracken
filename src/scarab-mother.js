// src/scarab-mother.js - THE SCARAB MOTHER, THE SEALED PYRAMID's boss (claude/sealedpyramid, the Opus greybox, 2026-10-12). From the model in src/desert-bosses.js
// (SCARAB_MOTHER: her charge runs her across the antechamber; tread a trap's plate while she is in its reach and she is pinned) and the brief
// (scratch/brief-sealedpyramid.md: a puzzle-beast, B1 + B14 key = the level's verb), rebuilt to today's rules (design standard B1-B16, B6 amended: tuned WITH
// FLASKS by the SONNET tune lane - this lane stops before the 12-seed loops).
//
// WHAT SHE IS (B11/B14/B15): A BEAST, A PUZZLE BOSS - the brood-queen of the tomb's scarabs, grown fat on the robbers. Her shell is NEVER a wall (B13/B15): outside
//   her openings it takes SM.resist of a blow (a told CLANK: "HER SHELL" - "LURE HER INTO A TRAP'S REACH" the first times).
// HER OPENING IS THE LEVEL'S VERB (B1, the B14 key): THE TOMB IS A MACHINE. The antechamber holds three of the tomb's own traps, each with its PALE PLATE - A FALLING
//   BLOCK (its reach west of the middle), A DART WALL (the east wall: its reach the east third) and THE ROLLING STONE (its niche in the west wall, its groove the
//   whole floor, its plate up on the middle ledge). TREAD A PLATE WHILE SHE STANDS IN ITS TRAP'S REACH and the trap lands on her: PINNED under the block,
//   STUCK with darts in her joints, FLIPPED on her back by the stone - OPEN (B10: a gold ring and a timer bar), SM.openT s, a blow x SM.openMul (one opening
//   SM.openCap of her at most, then the shell's floor - never nothing). B12: her CHARGE (the lure) skids to a halt SM.short px short of where you stood, so a
//   hero who waits by a plate's far side draws her into its reach and only has to step onto it; pinned she lies a step from you. B4: open she lies still.
//   B3: when the opening ends she rights herself and SHUTS HER SHELL - a TOLD SM.wardT s WARD (a pale shell ring, every blow clanks WARDED at SM.wardMul, and a
//   trap glances off her: told).
// THE MOVES (every one told: a sound, a word, a colour; one windup at a time; each its own pose - B16):
//   PHASE ONE - THE ANTECHAMBER: THE CHARGE ('!!' head down, a foreleg scraping: then she runs at where you stood - jump it or roll), THE MANDIBLES ('!' her jaws
//     spread: a snap close in - block it), THE SPIT ('!' her abdomen tips up: a glob arcs to your spot and leaves a burning puddle - a shield turns the glob).
//   PHASE TWO - THE BROOD (to SM.p3): THE FLOOR CRACKS - two pits open at the walls (a scarab swarm in each, as in the level) and HER BROOD crawls out of them
//     (one blow kills one; told: the pit seethes, "THE BROOD"; at most SM.brood.max, no other adds). ONE NEW MOVE: THE BURROW ('!!' she digs in, a mound runs at
//     you, and she erupts under it - leave its ring).
//   PHASE THREE - THE TOMB SHAKES (to 0): the traps reset faster (SM.reset3), and ONE NEW MOVE: THE QUAKE ('!!' she rears and slams; stones fall from the ceiling
//     on three shadows, one of them yours - step out of them).
// NO ADDS beyond the brood (the brief). PURE: no DOM, no main.js. The world is a context `c` (src/scarab-mother-hands.js binds it). smPlan is the boss lab's
// HUMAN bot (src/lab.js): it reads her tells, kills the brood and works THE RULE - it waits by a plate's far side, and treads it when she stops in the reach.

export const SM = {
  hp: 2900, w: 40, h: 24, markH: 44,
  openMul: 1.8, openCap: 0.1, openT: 3.4, wardT: 3.0, wardMul: 0.4, resist: 0.45, trapBite: { block: 0.035, darts: 0.02, stone: 0.04 },
  p2: 0.6, p3: 0.28,
  walk: 40, back: 66, backT: 0.9, keep: 70, gap: [0.45, 0.35, 0.25],
  chargeTell: 0.9, chargeV: 270, short: 56, skid: 0.95, dazed: 1.0,
  snapTell: 0.6, snapT: 0.22, snapR: 44, snapRange: 62,
  spitTell: 0.75, spitFly: 0.55, spitR: 16, puddleT: 2.4, puddleR: 18, puddleTick: 0.5,
  burrowTell: 1.0, burrowT: 1.2, burrowV: 150, burrowR: 24, burrowUp: 0.4,
  quakeTell: 1.0, quakeFall: 0.6, quakeR: 15,
  brood: { every: 6.5, max: 3, speed: 72, seethe: 0.8, biteCd: 1.0, w: 10, h: 7 },
  reset3: 0.6,
  dmg: { charge: 46, snap: 40, spit: 30, puddle: 8, burrow: 44, quake: 40, brood: 10 },
};
/* EVERY CYCLE CHANGES: the order of each pass, by phase (cycle k uses [k % n]); ONE NEW MOVE A PHASE (B5) */
export const CYCLES = {
  1: [['charge', 'snap', 'spit', 'charge'], ['spit', 'charge', 'snap', 'charge'], ['charge', 'spit', 'charge', 'snap']],
  2: [['burrow', 'charge', 'snap', 'spit'], ['charge', 'burrow', 'spit', 'charge'], ['spit', 'charge', 'burrow', 'snap']],
  3: [['quake', 'charge', 'burrow', 'snap'], ['charge', 'quake', 'spit', 'charge'], ['burrow', 'charge', 'quake', 'snap']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows) */
export const MOVES = {
  chargeTell: { mark: '!!', answer: 'jump' }, snapTell: { mark: '!', answer: 'block' }, spitTell: { mark: '!', answer: 'block' },
  burrowTell: { mark: '!!', answer: 'dodge' }, quakeTell: { mark: '!!', answer: 'dodge' },
};
export const MOVE_NAME = { charge: 'HER CHARGE', snap: 'HER MANDIBLES', spit: 'HER SPIT', puddle: 'THE BURNING SPIT', burrow: 'HER BURROW', quake: 'A FALLING STONE', brood: 'HER BROOD' };
export const OPEN_NAME = { block: 'PINNED', darts: 'STUCK', stone: 'FLIPPED' };

/* ---------- THE ANTECHAMBER ---------- */
/* local columns (0..39), the floor's surface row R (a hero stands on R-1). THE BLOCK (its reach, its slot in the roof, its plate on the floor east of it), THE DART
   WALL (the east wall; its reach the east third, its plate west of it), THE ROLLING STONE (its niche in the west wall, its groove the floor, its plate on the
   middle LEDGE - one-way, three rows up: a hero on it is over the stone's road), the two PITS phase two cracks open at the walls, and her start */
export const SM_STAGE = { W: 40, door: 6, roof: 18,
  block: { zone: [9, 14], plate: [15, 16], lure: 17 }, darts: { zone: [25, 38], plate: [23, 24], lure: 22 }, stone: { home: 1, end: 38, plate: [17, 18] },
  ledges: [{ x0: 14, x1: 21, dy: 3 }], pits: [[3, 4], [35, 36]], mother: 30 };
export function stageScarabMother(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + SM_STAGE.W, S = SM_STAGE;
  const carve = () => {
    air(sx, ex - 1, R - S.roof, R - 1);
    block(sx - 1, sx - 1, R - S.roof - 4, R - S.door - 1);   /* her west wall over the door you came in by (shut behind you) */
    block(ex, ex, R - S.roof - 4, R - 1);
    air(sx + S.block.zone[0], sx + S.block.zone[1], R - S.roof - 2, R - S.roof - 1);   /* the block's slot in the roof */
    for (const l of S.ledges) for (let x = sx + l.x0; x <= sx + l.x1; x++) set(x, R - l.dy, T.ONEWAY);
    ent('tplate', sx + S.block.plate[0], R - 1, { trap: 'smBlock' }); ent('tblock', sx + S.block.zone[0], R - S.roof - 1, { trap: 'smBlock' });
    ent('tplate', sx + S.darts.plate[0], R - 1, { trap: 'smDarts' }); ent('dartwall', ex, R - 1, { trap: 'smDarts' });
    ent('tplate', sx + S.stone.plate[0], R - 4, { trap: 'smStone' }); ent('rollstone', sx + S.stone.home, R - 1, { trap: 'smStone' });
    ent('scarabmother', sx + S.mother, R - 1, { face: -1 });
  };
  const A = sx;
  const traps = [
    { id: 'smBlock', kind: 'block', plates: [[A + S.block.plate[0], A + S.block.plate[1], R]], zone: [A + S.block.zone[0], A + S.block.zone[1], R - S.roof, R - 1], slot: [A + S.block.zone[0], A + S.block.zone[1], R - S.roof - 2, R - S.roof - 1], land: R - 1, reset: 4.0, arena: true, section: 'boss' },
    { id: 'smDarts', kind: 'darts', plates: [[A + S.darts.plate[0], A + S.darts.plate[1], R]], zone: [A + S.darts.zone[0], A + S.darts.zone[1], R - 2, R - 1], wall: ex, dir: -1, rows: [R - 2, R - 1], reset: 4.0, arena: true, section: 'boss' },
    { id: 'smStone', kind: 'stone', plates: [[A + S.stone.plate[0], A + S.stone.plate[1], R - 3]], zone: [A + 3, A + S.stone.end, R - 2, R - 1], home: A + S.stone.home, end: A + S.stone.end, row: R, reset: 8.0, arena: true, section: 'boss' },
  ];
  const arena = { x0: sx * TS, x1: ex * TS, floor: R * TS, trigger: (sx + 2) * TS, wallL: sx - 1, wallR: ex, boss: 'scarabmother', music: 'scarabmother',
    tint: '#c8a040', tintA: 0.07, start: [sx + 2, R - 1], y0: (R - S.roof) * TS, y1: (R + 1) * TS, sm: { sx, R } };
  return { arena, carve, traps };
}
/* the antechamber in world px, from the arena */
export function geom(A, TS = 16) {
  const q = A.sm, X = c => (q.sx + c) * TS, S = SM_STAGE;
  return { TS, x0: X(0), x1: X(S.W), floorY: q.R * TS, roofY: (q.R - S.roof) * TS, sx: q.sx, R: q.R,
    block: { zone: [X(S.block.zone[0]), X(S.block.zone[1] + 1)], plate: [X(S.block.plate[0]), X(S.block.plate[1] + 1)], lure: X(S.block.lure) + 8 },
    darts: { zone: [X(S.darts.zone[0]), X(S.darts.zone[1] + 1)], plate: [X(S.darts.plate[0]), X(S.darts.plate[1] + 1)], lure: X(S.darts.lure) + 8 },
    stone: { plate: [X(S.stone.plate[0]), X(S.stone.plate[1] + 1)], plateY: (q.R - 3) * TS },
    ledge: { x0: X(S.ledges[0].x0), x1: X(S.ledges[0].x1 + 1), y: (q.R - S.ledges[0].dy) * TS },
    pits: S.pits.map(([a, b]) => [X(a), X(b + 1)]), pitCols: S.pits.map(([a, b]) => [q.sx + a, q.sx + b]) };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, ward: 0, openTaken: 0, charge: null, glob: null, puddles: [], mound: null, stones: [], brood: [], broodT: SM.brood.every, seethe: null,
    told: {}, mark: null,
    n: { cycles: 0, opens: 0, byKind: { block: 0, darts: 0, stone: 0 }, glanced: 0, wards: 0, warded: 0, shell: 0, charges: 0, snaps: 0, spits: 0, burrows: 0, quakes: 0, brood: 0, broodKilled: 0, dazed: 0, moves: {} } };
}
export const sPhase = e => (e.hp <= e.maxHp * SM.p3 ? 3 : e.hp <= e.maxHp * SM.p2 ? 2 : 1);
export const smOpen = e => !!e && e.mode === 'open' && (e.open || 0) > 0;
export const smHidden = e => !!e && (e.mode === 'burrowed');
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 22, Math.min(G.x1 - 22, x));
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell'); }
function endOpen(e, S, c) { e.open = 0; S.ward = SM.wardT; S.n.wards++; S.openTaken = 0; e.openKind = null;
  c.number(e.x, e.y - 60, 'SHE RIGHTS HERSELF AND SHUTS HER SHELL: WARDED', '#c8d8e8'); c.sound('shell'); c.fx('ward', e.x, e.y); }
/* where she stands is in a trap's reach (px) */
export const inReach = (G, kind, x) => { const z = G[kind] && G[kind].zone; return !!z && x >= z[0] && x < z[1]; };

/* ---------- THE RULE ON HER (the hands call this when one of the antechamber's traps lands on her) ----------
   'open' (the opening) | 'ward' (her shell is shut: it glances off) | 'busy' (open already, burrowed, asleep) */
export function trapped(e, S, c, kind) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'die' || smHidden(e)) return 'busy';
  if (smOpen(e)) return 'busy';
  if (S.ward > 0) { S.n.glanced++; c.number(e.x, e.y - 60, 'HER SHELL IS SHUT: THE TRAP GLANCES OFF', '#9aa39a'); return 'ward'; }
  S.charge = null; S.mound = null; S.n.opens++; S.n.byKind[kind] = (S.n.byKind[kind] || 0) + 1;
  setMode(e, 'open', SM.openT + 0.05); e.open = SM.openT; e.openKind = kind; S.openTaken = 0; S.mark = null;
  c.fx('open', e.x, e.y); c.sound('open'); c.shake(4);
  c.number(e.x, e.y - 60, kind === 'block' ? 'THE BLOCK PINS HER - STRIKE' : kind === 'darts' ? 'DARTS IN HER JOINTS: SHE IS STUCK - STRIKE' : 'THE STONE FLIPS HER ON HER BACK - STRIKE', '#8fd160');
  return 'open';
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, air, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)  c.pits(on)  c.time()  c.rng() ---------- */
export function stepScarabMother(e, S, dt, h, c) {
  const G = S.G, alive = h.filter(q => q.alive), P = alive.sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  stepGlob(S, dt, c); stepPuddles(S, dt, c); stepStones(S, dt, c);
  if (S.ph >= 2) stepBrood(e, S, dt, h, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = CYCLES[1][0].slice(); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = sPhase(e);
  if (want > S.ph && !smOpen(e) && (e.mode === 'walk' || e.mode === 'recover' || e.mode === 'back')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want);
    if (want === 2) { c.number((G.x0 + G.x1) / 2, G.floorY - 120, 'THE FLOOR CRACKS: HER BROOD COMES UP OUT OF THE PITS', '#ff9a5c'); c.pits(true); c.shake(5); c.sound('rumble'); S.broodT = 2.0; setMode(e, 'recover', 1.0); return; }
    if (want === 3) { c.pits(true); c.number((G.x0 + G.x1) / 2, G.floorY - 120, 'THE TOMB SHAKES: ITS TRAPS RESET FASTER', '#ff6b6b'); c.shake(6); c.sound('rumble'); setMode(e, 'recover', 1.0); return; } }
  switch (e.mode) {
    case 'open': if (e.open <= 0) { endOpen(e, S, c); setMode(e, 'recover', 0.5); } return;   /* B4: she lies where the trap caught her */
    case 'recover': case 'skid': case 'dazed': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'walk': {
      const d = P.x - e.x; e.face = Math.sign(d) || e.face;
      if (Math.abs(d) > SM.keep + 20) e.x = clampX(G, e.x + Math.sign(d) * SM.walk * dt);
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
    case 'back': {   /* she scuttles off to the far side to charge from it */
      const away = Math.sign(e.x - P.x) || -e.face; e.x = clampX(G, e.x + away * SM.back * dt); e.face = -away;
      if (e.modeT <= 0 || e.x <= G.x0 + 24 || e.x >= G.x1 - 24 || Math.abs(e.x - P.x) > 150) { S.n.charges++; tell(e, S, c, 'chargeTell', SM.chargeTell); e.face = Math.sign(P.x - e.x) || e.face; }
      return; }
  }
  stepMove(e, S, dt, P, c);
}
function nextMove(e, S, P, c) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; const set = CYCLES[S.ph]; S.script = set[S.cycle % set.length].slice(); S.step = 0; }
  const m = S.script[S.step++], dx = P.x - e.x, ad = Math.abs(dx), G = S.G;
  e.face = Math.sign(dx) || e.face;
  switch (m) {
    case 'charge': if (ad < SM.keep) { setMode(e, 'back', SM.backT); return; } S.n.charges++; tell(e, S, c, 'chargeTell', SM.chargeTell); return;
    case 'snap': if (ad > SM.snapRange) { setMode(e, 'walk', 0.8); S.step--; if (ad > 160) { S.step++; } return; } S.n.snaps++; tell(e, S, c, 'snapTell', SM.snapTell); return;
    case 'spit': S.n.spits++; tell(e, S, c, 'spitTell', SM.spitTell); S.mark = { x: clampX(G, P.x), k: 'spit' }; return;
    case 'burrow': S.n.burrows++; tell(e, S, c, 'burrowTell', SM.burrowTell); return;
    case 'quake': { S.n.quakes++; tell(e, S, c, 'quakeTell', SM.quakeTell); const r = c.rng ? c.rng : Math.random, xs = [clampX(G, P.x)];
      for (let k = 0; k < 2; k++) { let x = G.x0 + 40 + r() * (G.x1 - G.x0 - 80); if (Math.abs(x - xs[0]) < 40) x = clampX(G, x + 70 * (r() < 0.5 ? -1 : 1)); xs.push(x); }
      S.stones = xs.map((x, i) => ({ x, t: SM.quakeTell + SM.quakeFall, key: 'quake' + S.act + '.' + i })); return; }
  }
  setMode(e, 'walk', 0.5);
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, c) {
  const G = S.G, f = e.face || 1, after = (t) => setMode(e, 'recover', t ?? SM.gap[S.ph - 1]);
  switch (e.mode) {
    case 'chargeTell': e.face = Math.sign(P.x - e.x) || e.face;
      if (e.modeT <= 0) { const dir = e.face || 1, stop = clampX(G, P.x - dir * SM.short); S.charge = { dir, stop: (stop - e.x) * dir > 0 ? stop : clampX(G, e.x + dir * 40), key: 'charge' + S.act }; setMode(e, 'charge', 3); c.sound('charge'); } return;
    case 'charge': { const q = S.charge; if (!q) { after(); return; }
      const nx = e.x + q.dir * SM.chargeV * dt, wall = q.dir > 0 ? G.x1 - 22 : G.x0 + 22;
      c.hit([e.x - SM.w / 2, e.x + SM.w / 2, e.y - SM.h, e.y], SM.dmg.charge, MOVE_NAME.charge, { key: q.key });
      if ((q.stop - nx) * q.dir <= 0) { e.x = q.stop; S.charge = null; setMode(e, 'skid', SM.skid); c.fx('skid', e.x, e.y); return; }
      if ((wall - nx) * q.dir <= 0) { e.x = wall; S.charge = null; S.n.dazed++; setMode(e, 'dazed', SM.dazed); c.shake(3); c.sound('thud'); c.number(e.x, e.y - 60, 'SHE HITS THE WALL', '#e8d0a0'); return; }
      e.x = nx; return; }
    case 'snapTell': if (e.modeT <= 0) { setMode(e, 'snap', SM.snapT); c.sound('snap');
        c.hit([f > 0 ? e.x - 4 : e.x - SM.snapR - SM.w / 2, f > 0 ? e.x + SM.snapR + SM.w / 2 : e.x + 4, e.y - 26, e.y], SM.dmg.snap, MOVE_NAME.snap, { blockable: true, key: 'snap' + S.act }); } return;
    case 'snap': if (e.modeT <= 0) after(); return;
    case 'spitTell': if (e.modeT <= 0) { const tx = S.mark ? S.mark.x : P.x; S.glob = { x0: e.x + f * 14, x: e.x + f * 14, tx, t: 0, key: 'spit' + S.act }; S.mark = null; c.sound('spit'); after(0.4); } return;
    case 'burrowTell': if (e.modeT <= 0) { setMode(e, 'burrowed', SM.burrowT); S.mound = { x: e.x, key: 'burrow' + S.act }; c.fx('dig', e.x, e.y); c.sound('rumble'); } return;
    case 'burrowed': { const m = S.mound; if (!m) { after(); return; } const d = P.x - m.x; m.x = clampX(G, m.x + Math.sign(d) * Math.min(Math.abs(d), SM.burrowV * dt)); e.x = m.x;
      if (e.modeT <= 0) { setMode(e, 'burrowUp', SM.burrowUp); c.hit([m.x - SM.burrowR, m.x + SM.burrowR, e.y - 40, e.y + 2], SM.dmg.burrow, MOVE_NAME.burrow, { key: m.key }); c.fx('erupt', m.x, G.floorY); c.shake(4); S.mound = null; } return; }
    case 'burrowUp': if (e.modeT <= 0) after(0.5); return;
    case 'quakeTell': if (e.modeT <= 0) { setMode(e, 'quake', 0.35); c.shake(6); c.sound('slam'); } return;
    case 'quake': if (e.modeT <= 0) after(0.4); return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* the glob she spits: an arc to its mark, then a burning puddle */
function stepGlob(S, dt, c) { const q = S.glob; if (!q) return; q.t += dt; const k = Math.min(1, q.t / SM.spitFly); q.x = q.x0 + (q.tx - q.x0) * k;
  if (k >= 1) { c.hit([q.tx - SM.spitR, q.tx + SM.spitR, S.G.floorY - 30, S.G.floorY + 2], SM.dmg.spit, MOVE_NAME.spit, { blockable: true, key: q.key }); S.puddles.push({ x: q.tx, t: SM.puddleT, tick: 0, key: q.key }); c.fx('splash', q.tx, S.G.floorY); S.glob = null; } }
function stepPuddles(S, dt, c) { for (const p of S.puddles) { p.t -= dt; p.tick -= dt; if (p.tick <= 0) { p.tick = SM.puddleTick;
    c.hit([p.x - SM.puddleR, p.x + SM.puddleR, S.G.floorY - 8, S.G.floorY + 2], SM.dmg.puddle, MOVE_NAME.puddle, { key: p.key + 'p' + Math.round(p.t * 2), noKnock: true }); } }
  S.puddles = S.puddles.filter(p => p.t > 0); }
/* PHASE THREE: the stones she shakes down (told by their shadows for the whole of her rearing) */
function stepStones(S, dt, c) { for (const s of S.stones) { s.t -= dt; if (s.t <= 0 && !s.done) { s.done = true;
    c.hit([s.x - SM.quakeR, s.x + SM.quakeR, S.G.roofY, S.G.floorY + 2], SM.dmg.quake, MOVE_NAME.quake, { key: s.key }); c.fx('rubble', s.x, S.G.floorY); } }
  S.stones = S.stones.filter(s => !s.done || s.t > -0.3); }
/* PHASE TWO ON: HER BROOD out of the cracked pits - one blow kills one (the hands' strike), a trap kills them too */
function stepBrood(e, S, dt, h, c) { const G = S.G, B = SM.brood;
  const live = S.brood.filter(b => b.alive);
  if (S.seethe) { S.seethe.t -= dt; if (S.seethe.t <= 0) { const px = S.seethe.x; S.brood.push({ x: px, alive: true, face: 1, cd: 0.6, key: 'brood' + S.n.brood }); S.n.brood++; S.seethe = null; c.fx('brood', px, G.floorY); } }
  else if (live.length < B.max && e.mode !== 'open' && (S.broodT -= dt) <= 0) { S.broodT = B.every; const P = h.find(q => q.alive) || h[0];
    const pit = G.pits.slice().sort((a, b) => Math.abs((a[0] + a[1]) / 2 - P.x) - Math.abs((b[0] + b[1]) / 2 - P.x)).pop();   /* the pit farther from you: they crawl the room to you */
    S.seethe = { x: (pit[0] + pit[1]) / 2, t: B.seethe }; c.number(S.seethe.x, G.floorY - 30, 'THE BROOD', '#ff9a5c'); c.sound('seethe'); }
  for (const b of S.brood) { if (!b.alive) continue; const P = h.filter(q => q.alive).sort((a, z) => Math.abs(a.x - b.x) - Math.abs(z.x - b.x))[0]; if (!P) continue;
    const d = P.x - b.x; b.face = Math.sign(d) || b.face; b.cd -= dt; if (Math.abs(d) > 6) b.x = Math.max(G.x0 + 8, Math.min(G.x1 - 8, b.x + b.face * B.speed * dt));
    if (b.cd <= 0 && Math.abs(d) < 12 && Math.abs(P.y - G.floorY) < 20) { b.cd = B.biteCd; c.hit([b.x - 8, b.x + 8, G.floorY - 12, G.floorY + 2], SM.dmg.brood, MOVE_NAME.brood, { key: b.key + 'b' + Math.round(c.time() * 4), noKnock: true }); } }
  S.brood = S.brood.filter(b => b.alive); }
/* a blow's box over a scarab of the brood kills it (one blow, one scarab) */
export function strikeBrood(S, box) { let n = 0; for (const b of S.brood) if (b.alive && b.x + 6 > box.l && b.x - 6 < box.r && S.G.floorY - 2 > box.t && S.G.floorY - 9 < box.b) { b.alive = false; n++; S.n.broodKilled++; } return n; }

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some; it jumps her charge as she comes, blocks or backs
   off the mandibles, steps off the spit's mark and the puddles, runs from the mound and the quake's shadows, and cuts down the brood that reaches it - and works
   THE RULE: it waits by the far side of the plate on her side of the room, and when she stops in that trap's reach (a skid, a recovery) it steps onto the plate.
   s = { P: { x, y, face, ground, atk }, e, S, traps: { block, darts, stone } (ready flags), reach, shield, t, rng, mem, v2, hero } -> { gx, face, atk, jump, dodge, block, why } */
export const PLAN = { react: 0.25, miss: 0.12, missTread: 0.15 };
export function smPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, talk: false, up: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0, ready = s.traps || {};
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 14, hi = G.x1 - 14, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), hitR = reach + SM.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const hazards = [...S.puddles.map(p => [p.x, SM.puddleR + 6]), ...S.stones.filter(q => !q.done).map(q => [q.x, SM.quakeR + 10]), ...(S.mound ? [[S.mound.x, SM.burrowR + 14]] : [])];
  const inHaz = x => hazards.some(([hx, r]) => Math.abs(x - hx) < r);
  const safeX = x => { let q = clamp(x); for (let k = 0; k < 3; k++) for (const [hx, r] of hazards) if (Math.abs(q - hx) < r) q = clamp(q < hx ? hx - r - 4 : hx + r + 4); return q; };
  /* 0. OUT OF A PUDDLE, A SHADOW, THE MOUND */
  if (inHaz(P.x) && P.ground) { const [hx, r] = hazards.find(([x0, r0]) => Math.abs(P.x - x0) < r0); out.gx = safeX(P.x + (P.x < hx ? -r - 8 : r + 8)); if (S.mound && Math.abs(P.x - S.mound.x) < 30 && !s.noRoll) out.dodge = true; out.why = 'out of it'; return out; }
  /* 1. THE BROOD at its feet: cut it down */
  const bb = S.brood.filter(b => b.alive).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (bb && Math.abs(bb.x - P.x) < 26 && !(e.mode === 'charge' && dx < 120)) { swing(bb.x); out.gx = P.x; out.down = false; out.why = 'cut the brood'; return out; }
  /* 2. HER TELLS (a quarter-second late, some misread) */
  if (/Tell$/.test(e.mode) || e.mode === 'charge' || e.mode === 'snap' || S.glob) {
    const key = 'a' + S.act + e.mode, miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor(key);
    if (seen && !miss) {
      if (e.mode === 'charge' && S.charge) { const toward = (P.x - kx) * S.charge.dir > 0, gap = Math.abs(P.x - kx);
        if (toward && gap < 58 && P.ground) { out.jump = true; out.gx = P.x + S.charge.dir * 24; out.why = 'jump her charge'; return out; } out.gx = P.x; out.why = 'ready to jump the charge'; return out; }
      if (e.mode === 'chargeTell') { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'her charge is coming'; return out; }
      if ((e.mode === 'snapTell' || e.mode === 'snap') && dx < SM.snapR + SM.w / 2 + 14) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the mandibles'; return out; }
        out.gx = safeX(kx + side * (SM.snapR + SM.w / 2 + 30)); if (dx < 40 && e.modeT < 0.2 && !s.noRoll) out.dodge = true; out.why = 'back off the mandibles'; return out; }
      if (e.mode === 'spitTell' && S.mark && Math.abs(P.x - S.mark.x) < SM.spitR + 16) { out.gx = safeX(S.mark.x + (P.x < S.mark.x ? -1 : 1) * (SM.spitR + SM.puddleR + 14)); out.why = 'off the spit\'s mark'; return out; }
      if (S.glob && Math.abs(P.x - S.glob.tx) < SM.spitR + 16) { if (s.shield) { out.block = true; out.face = Math.sign(S.glob.x - P.x) || 1; out.why = 'block the glob'; return out; } out.gx = safeX(S.glob.tx + (P.x < S.glob.tx ? -1 : 1) * (SM.spitR + 24)); out.why = 'out from under the glob'; return out; }
      if (e.mode === 'burrowTell' || e.mode === 'quakeTell') { out.gx = safeX(P.x + (P.x < (G.x0 + G.x1) / 2 ? 50 : -50)); out.why = 'keep moving'; return out; }
    }
  }
  /* 3. OPEN: strike her; WARDED: off her */
  if (smOpen(e)) { out.gx = safeX(kx + side * (s.tip ? 30 : 14 + SM.w / 2)); if (dx < hitR + 4) swing(kx); out.why = 'strike her: she is ' + (OPEN_NAME[e.openKind] || 'open').toLowerCase(); return out; }
  if (S.ward > 0) { out.gx = safeX(kx + side * 100); out.why = 'her ward: wait'; return out; }
  if (e.mode === 'burrowed' || e.mode === 'burrowUp') { out.gx = safeX(P.x + (P.x < (G.x0 + G.x1) / 2 ? 40 : -40)); out.why = 'off the mound'; return out; }
  /* 4. THE RULE: on her side of the room, wait by the far side of the plate; when she stops in the reach, step onto it */
  if (s.rest) { out.gx = safeX(kx + side * 120); out.why = 'winded: off her'; return out; }
  const kind = kx < (G.x0 + G.x1) / 2 ? 'block' : 'darts', T = G[kind], still = e.mode === 'skid' || e.mode === 'dazed' || e.mode === 'recover' || (e.mode === 'walk' && e.modeT > 0.15);
  if (ready[kind] && inReach(G, kind, kx) && still && !roll('tread' + S.act + kind, PLAN.missTread)) { out.gx = (T.plate[0] + T.plate[1]) / 2; out.face = Math.sign(kx - P.x) || 1; out.why = 'tread the plate: she is in the ' + kind + '\'s reach'; return out; }
  /* her brass is not worth a long fight - but her shell between traps is something (B15): cut her while she recovers close by */
  if (dx < hitR && (e.mode === 'recover' || e.mode === 'skid' || e.mode === 'dazed' || e.mode === 'walk') && !(ready[kind] && inReach(G, kind, kx))) { swing(kx); out.gx = P.x; out.why = 'cut her shell'; return out; }
  out.gx = safeX(T.lure); out.face = Math.sign(kx - P.x) || 1; out.why = 'wait by the ' + kind + '\'s plate'; return out;
}
