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
/* the builder and how it is called: 'sx' the first column, 'F' the floor row; a fixed F where the builder's rows are absolute */
const STAGES = {
  djinn: { f: stageDjinn, a: ['sx', 'F', 2] }, cisternqueen: { f: stageCisternQueen, a: ['sx', 'F', 2] }, matriarch: { f: stageMatriarch, a: ['sx'], F: 24 },
  colossus: { f: stageColossus, a: ['sx', 'F'] }, hawkmistress: { f: stageHawkMistress, a: ['sx', 'F'] }, paladinboss: { f: stagePaladin, a: ['sx', 'F'] },
  fogknight: { f: stageFogKnight, a: ['sx', 'F', 0], minF: 22 }, hourglassking: { f: stageHourglassKing, a: ['sx', 'F'] }, greatdrill: { f: stageDrill, a: ['sx', 'F'] },
  lanterneater: { f: stageLanternEater, a: ['sx', 'F'] }, puppeteer: { f: stagePuppeteer, a: ['sx', 'F'] },
};
export const STAGE_BOSSES = Object.keys(STAGES);
export const hasStage = t => !!STAGES[t];

/* stamp kind's room into doc from column x, floor under row y. Returns { ok, say, boss }: on any write outside the level nothing is kept. */
export function stampStage(doc, kind, x, y) {
  const S = STAGES[kind]; if (!S) return { ok: false, say: 'no stage for ' + kind };
  const F = S.F || Math.max(S.minF || 0, y + 1);
  if (F >= doc.H - 1) return { ok: false, say: 'this boss needs a taller level: SETTINGS > HEIGHT (its floor is row ' + F + ')' };
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
  const boss = ents.find(e => e.t === kind) || { t: kind, x: x + 10, y: F - 1 };
  boss.arenaRec = stg.arena ? JSON.parse(JSON.stringify(stg.arena)) : null; boss.stageAt = x; boss.lockGoal = false;
  doc.grid = grid; doc.ents = doc.ents.filter(e => e.t === 'gate' || !(e.x >= x && e.x < x + 70 && e.y <= F)).concat(ents.filter(e => e.t !== 'gate' && e.t !== 'check' && e !== boss), [boss]);   /* the room's own pieces come with it; its own goal does not (yours is the goal) */
  return { ok: true, boss, say: 'its room is built here: UNDO takes it back' };
}
