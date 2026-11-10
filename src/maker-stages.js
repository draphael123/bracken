// maker-stages.js (claude/maker) - BOSSES THAT BRING THEIR OWN ARENA (Daniel: "some bosses need their arena to actually be beatable").
// Eleven bosses read a room their own level builds (the djinn's vault and shaft, the colossus's hall ...): each module exports the
// builder its level calls (stageDjinn ...). Placing one of these bosses in the maker runs that same builder into the level, from the
// column you clicked, on the floor you clicked: the room is stamped into your level (UNDO takes it back), the boss stands where its
// builder puts it, and the arena record it returns rides on the boss (e.arenaRec), so the game reads exactly what its level gives it.
// The boss research (2026-11-09) proved each one wakes, fights, falls to a blow and opens the goal this way.
import { stageDjinn } from './djinn.js';
import { stageCisternQueen } from './cistern-queen.js';
import { stageMatriarch } from './raptor-matriarch.js';
import { stageColossus } from './glass-colossus.js';
import { stageHawkMistress } from './hawk-mistress.js';
import { stagePaladin } from './paladin-boss.js';
import { stageFogKnight } from './fog-knight.js';
import { stageHourglassKing } from './hourglass-king.js';
import { stageDrill } from './great-drill.js';
import { stageLanternEater } from './lantern-eater.js';
import { stagePuppeteer } from './puppeteer.js';
import { T } from './level.js';

const TS = 16;
/* THE CAPTAIN'S YARDS (built here: his level lays them in the ship, level.js ~5440): three yards, the lines that join them (his brace
   lines too), the main top under them, the rod he is struck down on; all moved from his ship to the clicked column and floor */
function stageCaptain(W, T, TS, sx, F) {
  const dx = sx - 286, dy = F - 19, X = x => x + dx, Y = r => r + dy;
  W.air(X(286), X(315), Y(3), F - 1); W.boards(X(290), X(311), Y(14)); W.boards(X(293), X(308), Y(9));
  const nets = [[300, 301, 9, 23], [294, 295, 19, 23], [288, 289, 14, 18], [312, 313, 14, 18], [291, 292, 9, 13], [309, 310, 9, 13]];
  for (const [a, b, y0, y1] of nets) for (let x = a; x <= b; x++) for (let y = y0; y <= Math.min(y1, 18); y++) W.set(X(x), Y(y), T.NET);
  W.ent('captain', X(306), F - 1);
  return { arena: { x0: X(286) * TS - 4, x1: X(316) * TS + 4, floor: F * TS, y0: Y(3) * TS, trigger: X(285) * TS, wallL: X(284), wallR: X(317), boss: 'captain', music: 'captain', tint: '#2a5a6a', tintA: 0.12, fx: 'motes',
    tiers: [{ row: Y(19), x0: X(286), x1: X(315) }, { row: Y(14), x0: X(290), x1: X(311) }, { row: Y(9), x0: X(293), x1: X(308) }],
    nets: nets.map(([a, b, y0, y1]) => [X(a), X(b), Y(y0), Y(y1)]), plats: [{ row: Y(24), x0: X(294), x1: X(307) }], rod: [X(300), X(301)], noWall: true, start: [X(287), F - 1] } };
}
/* THE SISTERS' CRAG (built here: THE ROOKERY lays it at its summit, rookery.js ~275): a flat crag top 42 wide, the two rock shelves three rows
   up at its ends, THE SHRIEKER'S PERCH seven up (out of any jump: only a ride gets you there), the three CRACKED SLABS in its floor and the
   camera lift her hover needs. The nests, the overhang's steps and the vents are the fight's own (src/shriek-sisters.js geom lays them).
   Missing vs home: the Roc's peak beyond it and the climb up to it (dressing). */
function stageShriekSisters(W, T, TS, sx, F) {
  const A0 = sx, A1 = sx + 41;
  W.air(A0 - 1, A1 + 1, F - 14, F - 1); W.plat(A0 + 3, F - 3, 5); W.plat(A1 - 7, F - 3, 5); W.plat(A0 + 27, F - 7, 3);
  W.ent('shrieksisters', A0 + 21, F - 1);
  return { arena: { x0: A0 * TS, x1: (A1 + 1) * TS, floor: F * TS, y0: (F - 9) * TS, trigger: (A0 + 5) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'shrieksisters', music: 'shrieksisters', camUp: 16, tint: '#c8c0d8', tintA: 0.07,
    slabs: [A0 + 8, A0 + 21, A1 - 8], perchS: [A0 + 27, A0 + 29, F - 7] } };
}
/* THE KRAKEN'S REACH (built here: THE CAUSEWAY lays it at the end of its road, level.js ~7203): the last 44 columns of the road, two courses
   thick, standing on piers in the open sea (his krakenSea pool), the old tower and its bell, the shrine plinth and its bell, the two waystones,
   the wreck he came in on; his arms come up out of the sea round the piers, and he breaks the road at A.holes. Moved to the clicked column and
   floor. Missing vs home: the sea is 8 rows deep, not 14 (so it fits a 40-row level), with no air vents in it; no tide on the road before
   the fight (THE CAUSEWAY's own tide), no east cliff (your goal is past him) */
function stageKraken(W, T, TS, sx, F) {
  const dx = sx - 566, dy = F - 24, X = x => x + dx, Y = r => r + dy, SEA = 9;   /* SEA: the rows of open water under the road (home: 14) */
  W.air(X(565), X(610), Y(10), F - 1);
  W.block(X(566), X(609), F, F + 1); W.air(X(566), X(609), F + 2, F + SEA); for (let x = 567; x < 609; x += 8) W.block(X(x), X(x + 1), F + 2, F + SEA);
  W.block(X(566), X(567), Y(22), Y(23)); W.block(X(568), X(570), Y(20), Y(23)); W.block(X(571), X(572), Y(22), Y(23)); W.ent('knell', X(569), Y(19));   /* the old tower's footing and its bell */
  W.block(X(584), X(584), Y(22), Y(23)); W.block(X(585), X(589), Y(21), Y(23)); W.block(X(590), X(590), Y(22), Y(23)); W.ent('knell', X(587), Y(20));   /* the shrine plinth and its bell */
  W.block(X(597), X(598), Y(23), Y(23));   /* the seaward waystone's pier */
  W.block(X(603), X(603), Y(23), Y(23)); W.block(X(604), X(609), Y(22), Y(23)); for (let x = 604; x <= 609; x++) W.set(X(x), Y(21), T.PLANK);   /* the wreck */
  W.ent('deco', X(583), F - 1, { kind: 'waystone' }); W.ent('deco', X(597), Y(22), { kind: 'waystone', v: 1 });
  W.ent('kraken', X(604), Y(20));
  return { arena: { x0: X(566) * TS, x1: X(610) * TS, floor: F * TS, y0: Y(4) * TS, trigger: X(574) * TS, wallL: X(565), wallR: X(610), boss: 'kraken', music: 'kraken', tint: '#203a38', tintA: 0.12, fx: 'motes',
      tower: X(569) * TS + 8, plinth: [X(585) * TS, X(590) * TS], stones: [X(583) * TS + 8, X(597) * TS + 8], holes: [[X(578), X(580)], [X(594), X(595)]], wreck: [X(603), X(609)], rest: X(604) * TS },
    pools: [{ x0: X(566) * TS, x1: X(610) * TS, y: (F + 2) * TS, base: (F + SEA + 3) * TS, bottom: (F + SEA + 1) * TS, swim: true, clear: true, wash: 0.66, arenaTide: true, krakenSea: true }],
    rest: { leviathan: { arena: X(566) * TS } } };
}
/* THE LASHINGS (built here: THE FLOTILLA lays them at its end, level.js ~5168; src/flotilla-boss.js AD_STAGE): the Powder Ship's stern lashed to the
   Flagship's waist, 52 columns of deck, a 3-wide LASHING of foul harbour between the hulls (a net down each side; a hero who goes in is hauled
   out), and A DECK GUN at each hull's outer end laid along the deck - his iron turns a blade, and only a round shot down his line blows a plate
   off, so the guns ARE the fight. Missing vs home: the masts, kegs, wheel and cable (dressing), the harbour is 4 rows deep, not 8 */
function stageAdmiral(W, T, TS, sx, F) {
  const AS = sx, S = { W: 52, gap: [24, 26], guns: [3, 48], him: 40 }, DEEP = 9;
  W.air(AS - 1, AS + S.W, F - 18, F - 1);
  W.air(AS + S.gap[0], AS + S.gap[1], F, F + DEEP - 1);
  for (const c of [S.gap[0], S.gap[1]]) for (let y = F + 1; y <= F + DEEP - 1; y++) W.set(AS + c, y, T.NET);
  W.ent('cannon', AS + S.guns[0], F - 1, { deck: true, aim: 1 }); W.ent('cannon', AS + S.guns[1], F - 1, { deck: true, aim: -1 });
  W.ent('admiral', AS + S.him, F - 1, { face: -1 });
  return { arena: { x0: AS * TS, x1: (AS + S.W) * TS, floor: F * TS, y0: (F - 18) * TS, trigger: (AS + 3) * TS, wallL: AS - 1, wallR: AS + S.W, boss: 'admiral', music: 'admiral', tint: '#3a3a6a', tintA: 0.08, fx: 'motes',
      start: [AS + 8, F - 1], ac: { sx: AS, R: F } },
    pools: [{ x0: (AS + S.gap[0]) * TS, x1: (AS + S.gap[1] + 1) * TS, y: (F + 5) * TS, bottom: (F + DEEP) * TS, shallow: false, swim: true, clear: true, harm: true, foulCol: '#7a8a3a', foulColL: '#b8c85a', foulColD: '#3a4a1e' }] };
}
/* THE GATE GARGOYLE'S STAIR-TOP (built here: THE WITCHLIGHT STAIR lays it at its top, witchlight.js ~213, WL.ARENA / SLABS): a floor of
   SPIKES seven rows under your ground with its winds (a fall is one bite and the wind brings you up to a slab), THIRTEEN slabs in two tiers
   over it (he smashes through the one he dives on if you left it late - his opening, stunned on the spikes: STOMP him) and THE RUNE COLUMN
   between the middle slabs (strike it while he flies in it and it turns him over). Your ground is the stair's lip; the room is sunk under it,
   and you climb out east onto your ground again. Missing vs home: the gatehouse roof and the tower over him (he hangs in the air on his perch) */
function stageGargoyle(W, T, TS, sx, F) {
  const dx = sx - 566, dy = F - 33, X = x => x + dx, Y = r => r + dy, G = Y(40);
  const SLABS = [[572, 35], [578, 35], [584, 35, { range: 1, speed: 12 }], [590, 35], [596, 35], [602, 35, { range: 1, speed: 12 }], [608, 35], [575, 32], [581, 32], [587, 32], [593, 32], [599, 32], [605, 32]];
  W.air(X(566), X(614), Y(18), F - 1); W.air(X(572), X(614), F, G - 1); for (let x = X(572); x <= X(614); x++) W.set(x, G, T.SPIKE);
  for (const [x, row, o] of SLABS) W.ent('mover', X(x), Y(row), Object.assign({ len: 4, slab: true, speed: 30, arena: true, range: 0 }, o || {}));
  W.ent('gargoyle', X(611), Y(28), { face: -1 });
  return { arena: { x0: X(570) * TS, x1: X(614) * TS, floor: (G + 1) * TS, y0: Y(18) * TS, top: Y(32) * TS, trigger: X(572) * TS, wallL: X(569), wallR: X(614), boss: 'gargoyle', music: 'gargoyle', start: [X(575), Y(34)],
      rune: { x: X(595) * TS, top: Y(18) * TS, bot: (G + 1) * TS, mid: Y(35) * TS - 12 } },
    rest: { winds: [{ x0: X(572), x1: X(614), row: G, wells: [576, 588, 600, 612].map(X), exits: [], arena: true }] } };
}
/* the builder and how it is called: 'sx' the first column, 'F' the floor row; a fixed F where the builder's rows are absolute */
const STAGES = {
  djinn: { f: stageDjinn, a: ['sx', 'F', 2] }, cisternqueen: { f: stageCisternQueen, a: ['sx', 'F', 2] }, matriarch: { f: stageMatriarch, a: ['sx'], F: 24 },
  colossus: { f: stageColossus, a: ['sx', 'F'] }, hawkmistress: { f: stageHawkMistress, a: ['sx', 'F'] }, paladinboss: { f: stagePaladin, a: ['sx', 'F'] },
  fogknight: { f: stageFogKnight, a: ['sx', 'F', 0], minF: 22 }, hourglassking: { f: stageHourglassKing, a: ['sx', 'F'] }, greatdrill: { f: stageDrill, a: ['sx', 'F'] },
  lanterneater: { f: stageLanternEater, a: ['sx', 'F'] }, puppeteer: { f: stagePuppeteer, a: ['sx', 'F'] }, captain: { f: stageCaptain, a: ['sx', 'F'], minF: 17 }, shrieksisters: { f: stageShriekSisters, a: ['sx', 'F'], minF: 15 },
  kraken: { f: stageKraken, a: ['sx', 'F'], minF: 21, below: 11 }, admiral: { f: stageAdmiral, a: ['sx', 'F'], minF: 19, below: 10 }, gargoyle: { f: stageGargoyle, a: ['sx', 'F'], minF: 16, below: 9 },
};
export const STAGE_BOSSES = Object.keys(STAGES);
export const hasStage = t => !!STAGES[t];

/* stamp kind's room into doc from column x, floor under row y. Returns { ok, say, boss }: on any write outside the level nothing is kept. */
export function stampStage(doc, kind, x, y) {
  const S = STAGES[kind]; if (!S) return { ok: false, say: 'no stage for ' + kind };
  const F = S.F || Math.max(S.minF || 0, y + 1);
  if (F >= doc.H - 1) return { ok: false, say: 'this boss needs a taller level: SETTINGS > HEIGHT (its floor is row ' + F + ')' };
  if (S.below && F + S.below >= doc.H) return { ok: false, say: 'this boss needs ' + S.below + ' rows under its floor (its sea): SETTINGS > HEIGHT, or place it higher' };
  const grid = new Uint8Array(doc.grid), ents = [], W = doc.W, H = doc.H; let out = 0;
  const put = (cx, cy, t) => { if (cx > W - 2) { out++; return; } if (cx < 1 || cy < 0 || cy >= H) return; grid[cy * W + cx] = t; };   /* above the top (a room's roof line) is let go, as its own level does; too wide is refused */
  const A = {
    set: (cx, cy, t) => put(cx, cy, t),
    block: (x0, x1, y0, y1) => { for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) put(xx, yy, T.SOLID); },
    air: (x0, x1, y0, y1) => { for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) put(xx, yy, T.AIR); },
    boards: (x0, x1, yy) => { for (let xx = x0; xx <= x1; xx++) put(xx, yy, T.ONEWAY); },
    plat: (xx, yy, w) => { for (let i = 0; i < w; i++) put(xx + i, yy, T.ONEWAY); },
    ent: (t, ex, ey, o) => { ents.push({ t, x: ex, y: ey, ...(o || {}) }); },
  };
  for (let xx = x; xx < Math.min(W - 1, x + 70); xx++) for (let yy = F; yy < H; yy++) grid[yy * W + xx] = T.SOLID;   /* a floor to build on */
  let stg; try { stg = S.f(A, T, TS, ...S.a.map(v => (v === 'sx' ? x : v === 'F' ? F : v))) || {}; if (stg.carve) stg.carve(); } catch (e) { return { ok: false, say: 'that boss\'s room would not build here (' + String(e && e.message || e).slice(0, 40) + ')' }; }
  if (out) return { ok: false, say: 'its room does not fit here: move it left, or make the level wider / taller' };
  for (const [lx, y0, y1] of stg.ladders || []) for (let yy = y0; yy <= y1; yy++) put(lx, yy, T.NET);   /* its ladders, hung last over what was carved (as its own level does) */
  const boss = ents.find(e => e.t === kind) || { t: kind, x: x + 10, y: F - 1 };
  boss.arenaRec = stg.arena ? JSON.parse(JSON.stringify(stg.arena)) : null;
  { const keep = {}; for (const k of ['holds', 'gongs', 'racks', 'shafts', 'lamps', 'sources', 'pools', 'bridges', 'locks', 'movers', 'rest']) if (stg[k]) keep[k] = stg[k]; boss.stageExtra = JSON.parse(JSON.stringify(keep)); }   /* the room's machinery, handed to the game as its own level hands it (stageLevelExtra) */ boss.stageAt = x; boss.lockGoal = false;
  doc.grid = grid; doc.ents = doc.ents.filter(e => e.t === 'gate' || !(e.x >= x && e.x < x + 70 && e.y <= F)).concat(ents.filter(e => e.t !== 'gate' && e.t !== 'check' && e !== boss), [boss]);   /* the room's own pieces come with it; its own goal does not (yours is the goal) */
  return { ok: true, boss, say: 'its room is built here: UNDO takes it back' };
}

/* (claude/maker) THE ROOM'S MACHINERY, AS ITS OWN LEVEL HANDS IT TO THE GAME: the gongs and keg racks of the Hawk-Mistress's courtyard, the
   Paladin's braziers, the Fog Knight's cut (its water, its lock, its bridge, its lamps, its rigged platforms), the Lantern-Eater's raft
   and canal, the Puppeteer's batten, the Glass Colossus's holds. Read from each home level's own wiring (ksar.js, lit-church.js,
   towpath.js, fog-canal.js, maskwright-theatre.js, glass-sea.js). Returns { pools, moversExtra, rest } for src/main.js edLevelObj. */
export function stageLevelExtra(doc, poolsBefore) {
  const b = doc.ents.find(e => e.stageExtra), x = b && b.stageExtra; if (!x) return { pools: [], moversExtra: [], rest: {} };
  const pools = (x.pools || []).map(p => ({ ...p, idx: undefined })), moversExtra = [], rest = {};
  for (const m of x.movers || []) moversExtra.push(m.mover || m);
  if (x.movers && x.movers.some(m => m.band)) rest.rigBands = x.movers.filter(m => m.band).map(m => m.band);
  if (x.gongs) rest.gongs = x.gongs; if (x.racks) rest.stacks = x.racks; if (x.shafts) rest.shafts = x.shafts;
  if (x.lamps) rest.lamps = x.lamps; if (x.sources) rest.sources = x.sources; if (x.bridges) rest.bridges = x.bridges;
  if (x.rest) Object.assign(rest, x.rest);   /* a hand-written room's own level fields (the Kraken's leviathan) */
  if (x.holds) rest.machineCells = x.holds.map(([hx, hy]) => hy * doc.W + hx);
  if (x.locks) { const all = [...(poolsBefore || []), ...pools]; rest.locks = x.locks.map(k => ({ ...k, pool: all.findIndex(p => p.tp === k.id) })); }
  return { pools, moversExtra, rest };
}
