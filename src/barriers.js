// src/barriers.js - THE BARRIERS BY REGION (claude/barriers, 2026-10-11). ART ONLY: nothing here reads or writes the level, the grid, a trigger,
// a timing or a save. Daniel: "not all gates make sense thematically - a metal gate in a bog doesn't. Boss rooms have vines which don't always
// make sense." So every barrier that closes a way is drawn from ONE TABLE, by the region the level sits in (the same region table the exit gates
// use: src/exit-gates.js KIND_OF):
//   GATE   the T.PORT column - the section gates, the alarm / garrison gates, the winch gates, the elite gates, the ambush sills, the tide gates,
//          the key gates and every mini-boss gate. (main.js asks for a tile sprite; the tiles and the collision are exactly what they were.)
//   SEAL   the boss room's two walls that rise when the boss wakes (main.js setWall), and a mini-boss's wall (setWallAt): the same family as the
//          region's gate, heavier. Used to be a vine wall in EVERY level.
//   LOCK   the plate on a key gate (PROP.lockPlate).
// Region -> look:  forest woven thorn hurdle (vines fit here) / marsh sunk logs, lashed reed-and-stake palisade / fungus mycelium web, bracket-cap
// wall / crag stacked stones, rockfall / mine cage door, timber cribbing / storm iron portcullis (the original; its seal is banded iron) / coast
// net and driftwood, ship planks / canal stop-planks, lock-gate leaf / inland churchyard railings, clipped yew hedge / desert sandstone slab,
// pouring sand curtain. A boss may add its own touch (BOSS_SEAL). The sounds are the existing gate sounds.
//
// BAKING: every set is baked ONCE per region (lazily; main.js calls prime() at level load), never in a frame; every helper clamps to the tile,
// so no pixel can land at a negative y.
import { canvas, mulberry, shade } from './px.js';
import { kindOf, KINDS } from './exit-gates.js';

const S = 16;                                     /* a tile */
export const GATE_N = 2, SEAL_N = 4;              /* variants: the gate is checkered by (x + y) % 2, the seal by (y + x) % 4, exactly as the sprites they replace */

/* THE TABLE. region -> what each barrier is. `gate: null` = keep the original portcullis tiles (storm: iron IS right there). */
export const TABLE = {
  forest: { gate: 'hurdle',   seal: 'thornwall',  lock: 'knot'  },
  marsh:  { gate: 'sunklogs', seal: 'reedstakes', lock: 'peg'   },
  fungus: { gate: 'mycelium', seal: 'capwall',    lock: 'cap'   },
  crag:   { gate: 'cairn',    seal: 'rockfall',   lock: 'slab'  },
  mine:   { gate: 'cage',     seal: 'cribbing',   lock: 'iron'  },
  storm:  { gate: null,       seal: 'ironslab',   lock: null    },
  coast:  { gate: 'net',      seal: 'shipplank',  lock: 'brass' },
  canal:  { gate: 'stopplank', seal: 'lockleaf',  lock: 'wheel' },
  inland: { gate: 'railing',  seal: 'yew',        lock: 'black' },
  mage:   { gate: 'railing',  seal: 'ironslab',   lock: 'black' },   /* THE MAGE'S FOLLY's own exit-gate kind (src/exit-gates.js): the barriers stay the inland set, the tower's iron slab for the seal */
  desert: { gate: 'slab',     seal: 'sandfall',   lock: 'scarab' },
};
/* A BOSS'S OWN TOUCH, where it is obvious (boss id -> seal look; baked like any other). */
export const BOSS_SEAL = { queen: 'combwall', puppeteer: 'curtain', wickerqueen: 'wicker', pyromancer: 'charstakes', duneworm: 'sandfall' };
/* A LEVEL'S OWN SEAL inside its region (Daniel 10-11: the inland yew hedge suits the churchyard and the fields, not the Archmage's tower or
   the Paladin's church - those two take the black iron slab). A boss's own touch still wins. */
export const LEVEL_SEAL = { mage: 'ironslab', church: 'ironslab' };

/* ---- bake helpers (clamped: nothing can land at y < 0 or off the tile) ---- */
const R = (g, x, y, w, h, col, W = S, H = S) => { x |= 0; y |= 0; w |= 0; h |= 0; if (x < 0) { w += x; x = 0; } if (y < 0) { h += y; y = 0; } if (x + w > W) w = W - x; if (y + h > H) h = H - y; if (w <= 0 || h <= 0) return; g.fillStyle = col; g.fillRect(x, y, w, h); };
const P = (g, x, y, col) => R(g, x, y, 1, 1, col);
const speck = (g, rnd, cols, n, x = 0, y = 0, w = S, h = S) => { for (let i = 0; i < n; i++) P(g, x + ((rnd() * w) | 0), y + ((rnd() * h) | 0), cols[(rnd() * cols.length) | 0]); };
const tile = () => canvas(S, S);

/* ============================== GATES (2 variants each) ============================== */
const GATE = {
  /* forest: a woven thorn hurdle - hazel stakes, withies woven over and under, thorns, a few leaves */
  hurdle(i) { const [c, g] = tile(), rnd = mulberry(700 + i), wood = '#6a4a2a', hi = '#8a6a3c', lo = '#3d2a16', wi = '#a07a46', wh = '#c49a5c', wl = '#6e5030';
    const xs = [1, 5, 9, 13], rows = i ? [1, 6, 11] : [3, 8, 13];
    for (const x of xs) { R(g, x, 0, 2, S, wood); R(g, x, 0, 1, S, hi); R(g, x + 1, 0, 1, S, lo); }
    rows.forEach((y, r) => { R(g, 0, y, S, 2, wi); R(g, 0, y, S, 1, wh); R(g, 0, y + 1, S, 1, wl);
      xs.forEach((x, k) => { if ((k + r) & 1) { R(g, x, y, 2, 2, wood); R(g, x, y, 1, 2, hi); } }); });
    for (let k = 0; k < 3; k++) { const x = xs[(rnd() * 4) | 0], y = (rnd() * 14) | 0; P(g, x - 1, y, '#bdb597'); P(g, x + 2, y + 1, '#bdb597'); }
    speck(g, rnd, ['#3f7a48', '#57964f'], 5); return c; },
  /* marsh: a sunk log that rises from the mud - four round logs, wet and mossed, pale ends */
  sunklogs(i) { const [c, g] = tile(), rnd = mulberry(710 + i), bark = '#4a3a28', hi = '#6a5638', lo = '#2a2016', moss = '#5a7a3a', mud = '#2b2418';
    R(g, 0, 0, S, S, mud);
    for (let k = 0; k < 4; k++) { const y = k * 4; R(g, 0, y, S, 3, bark); R(g, 0, y, S, 1, hi); R(g, 0, y + 2, S, 1, lo); R(g, 0, y + 3, S, 1, mud);
      if ((k + i) & 1) { R(g, 0, y, 2, 3, '#8a7a5a'); P(g, 1, y + 1, lo); } else { R(g, 14, y, 2, 3, '#8a7a5a'); P(g, 14, y + 1, lo); }
      for (let m = 0; m < 3; m++) R(g, (rnd() * 14) | 0, y, 2, 1, moss); }
    speck(g, rnd, ['#3a4a2a', '#1a1610'], 8); return c; },
  /* fungus: a web of mycelium - pale strands crossing, a few fleshy cords, spore glints */
  mycelium(i) { const [c, g] = tile(), rnd = mulberry(720 + i), cord = '#8a6a9a', cordHi = '#b89ac8', thread = '#d8c8e0', glow = '#c8f0a0';
    for (const x of [2, 7, 12]) { R(g, x + ((rnd() * 2) | 0), 0, 2, S, cord); R(g, x, 0, 1, S, cordHi); }
    for (let k = 0; k < 3; k++) { const y0 = 1 + k * 5 + (i * 2) % 3; for (let x = 0; x < S; x++) { P(g, x, y0 + ((x >> 1) % 3), thread); P(g, x, y0 + 4 - ((x >> 1) % 3), (x & 1) ? thread : cordHi); } }
    speck(g, rnd, [glow, '#ffffff'], 4); return c; },
  /* crag: stacked stones - loose flat stones laid in uneven courses, gaps of dark between them */
  cairn(i) { const [c, g] = tile(), rnd = mulberry(730 + i), base = ['#6a665e', '#7d756b', '#5b5750'];
    let y = 0; while (y < S) { const h = Math.min(S - y, 4 + ((rnd() * 2) | 0)); let x = (rnd() * 4 - 4) | 0;
      while (x < S) { const w = 5 + ((rnd() * 5) | 0), col = base[(rnd() * 3) | 0]; R(g, x, y, w - 1, h - 1, col); R(g, x, y, w - 1, 1, shade(col, 0.22)); R(g, x, y + h - 2, w - 1, 1, shade(col, -0.25)); x += w; } y += h; }
    speck(g, rnd, ['#4b4640', '#9a9288'], 6); return c; },
  /* mine: a cage door - a rusted iron lattice in a timber frame, as the lift cage that parts */
  cage(i) { const [c, g] = tile(), wood = '#5a4028', woodHi = '#7a5a38', iron = '#5a5048', ironHi = '#8a7a68', rust = '#7a4a2a';
    for (let d = 0; d < 16; d += 4) for (let k = 0; k < 16; k++) { P(g, (d + k + i * 2) % 16, k, iron); P(g, (d - k + 32 + i * 2) % 16, k, iron); }
    for (let k = 0; k < 16; k += 4) P(g, (k * 3 + i * 2) % 16, k, ironHi);
    R(g, 0, 0, 2, S, wood); R(g, 0, 0, 1, S, woodHi); R(g, 14, 0, 2, S, wood); R(g, 15, 0, 1, S, '#3a2818');
    R(g, 0, 7 - i, S, 2, '#3a2818'); R(g, 0, 7 - i, S, 1, woodHi);
    speck(g, mulberry(740 + i), [rust, '#9a6a3a'], 4, 2, 0, 12, S); return c; },
  /* coast: a net hung on driftwood - rope diamonds, two grey planks, corks and a glass float */
  net(i) { const [c, g] = tile(), rope = '#b09a6a', ropeLo = '#7a6a48', wood = '#a09886', woodLo = '#6a6458', cork = '#c9a05a';
    for (let k = 0; k < 16; k++) { P(g, (k + i * 4) % 16, k, rope); P(g, (k + i * 4 + 1) % 16, k, ropeLo); P(g, (16 - k + i * 4 + 16) % 16, k, rope); P(g, (15 - k + i * 4 + 16) % 16, k, ropeLo); }
    for (const x of [0, 13]) { R(g, x, 0, 3, S, wood); R(g, x, 0, 1, S, '#c8c0aa'); R(g, x + 2, 0, 1, S, woodLo); P(g, x + 1, 4 + i * 6, woodLo); P(g, x + 1, 11 - i * 3, woodLo); }
    R(g, 6, 1 + i * 8, 3, 2, cork); P(g, 6, 1 + i * 8, '#e8c880'); if (i) { R(g, 6, 11, 3, 3, '#5aa89a'); P(g, 7, 11, '#bfeee0'); } return c; },
  /* canal: stop-planks - heavy horizontal planks dropped into the lock's slots, water between them, weed at the foot */
  stopplank(i) { const [c, g] = tile(), rnd = mulberry(760 + i), p = '#4a4036', hi = '#6a5a48', lo = '#2a241e', wet = '#3a5a5a';
    for (let k = 0; k < 4; k++) { const y = k * 4; R(g, 0, y, S, 3, p); R(g, 0, y, S, 1, hi); R(g, 0, y + 2, S, 1, lo); if ((k + i) & 1) R(g, 0, y + 3, S, 1, wet); R(g, 0, y, 1, 3, lo); R(g, 15, y, 1, 3, lo); P(g, 3 + ((k * 5 + i * 3) % 10), y + 1, lo); }
    for (const x of [2, 13]) R(g, x, 0, 1, S, '#6a7078');
    speck(g, rnd, ['#3f6e50', '#5a8a58'], 6); return c; },
  /* inland: churchyard railings - black wrought iron, a collar and a scroll, spaced to see through */
  railing(i) { const [c, g] = tile(), iron = '#3a3644', hi = '#8a86a0', gold = '#c9962c';
    for (let x = 1; x < S; x += 4) { R(g, x, 0, 2, S, iron); R(g, x, 0, 1, S, hi); }
    R(g, 0, 3 + i * 5, S, 2, iron); R(g, 0, 3 + i * 5, S, 1, hi); R(g, 0, 11 - i * 5 + (i ? 0 : 0), S, 1, iron);
    for (let x = 1; x < S; x += 4) { P(g, x - 1, 3 + i * 5 + 3, iron); P(g, x + 2, 3 + i * 5 + 3, iron); }
    P(g, 7 + i, 3 + i * 5, gold); return c; },
  /* desert: a sandstone slab - dressed ochre blocks and one carved band, the whole thing a door that slides */
  slab(i) { const [c, g] = tile(), rnd = mulberry(780 + i), base = '#c9a56a', hi = '#e0c288', lo = '#8a6a3a', dark = '#5a4226';
    R(g, 0, 0, S, S, base);
    for (const y of [0, 8]) { R(g, 0, y, S, 1, lo); R(g, 0, y + 1, S, 1, hi); }
    R(g, i ? 3 : 8, 1, 1, 7, lo); R(g, i ? 11 : 4, 9, 1, 7, lo);
    for (let x = 2 + i; x < 14; x += 4) { R(g, x, 12, 2, 1, dark); P(g, x + 1, 13, dark); P(g, x, 14, dark); }
    speck(g, rnd, [lo, hi, '#b08a4e'], 14); R(g, 0, 15, S, 1, lo); return c; },
};

/* ============================== SEALS (4 variants each; the same family, heavier) ============================== */
const SEAL = {
  thornwall(i) { const [c, g] = tile(), rnd = mulberry(800 + i), wood = '#4a3420', hi = '#6a4a2a', lo = '#2a1c10', wi = '#7a5a34', leaf = ['#2f5e3a', '#3f7a48', '#57964f'];
    R(g, 0, 0, S, S, lo);
    for (const x of [0, 3, 6, 9, 12]) { R(g, x + (i & 1), 0, 3, S, wood); R(g, x + (i & 1), 0, 1, S, hi); }
    for (const y of [1, 5, 9, 13]) { R(g, 0, y + (i & 1), S, 2, wi); R(g, 0, y + (i & 1), S, 1, '#a07a46'); }
    for (let k = 0; k < 4; k++) { const x = (rnd() * 15) | 0, y = (rnd() * 15) | 0; P(g, x, y, '#bdb597'); P(g, x + 1, y - (rnd() < 0.5 ? 1 : 0), '#bdb597'); }
    for (let k = 0; k < 3; k++) { const x = (rnd() * 12) | 0, y = (rnd() * 12) | 0; R(g, x, y, 3, 2, leaf[(rnd() * 3) | 0]); }
    if (i === 2) { R(g, 6, 6, 3, 3, '#b8402f'); P(g, 6, 6, '#e8806a'); } return c; },
  reedstakes(i) { const [c, g] = tile(), rnd = mulberry(810 + i), col = ['#5a4a34', '#4a3c2a', '#665238'], lo = '#241c12', rope = '#c8b078', reed = ['#7a8a4a', '#9aaa5a'];
    R(g, 0, 0, S, S, lo);
    for (let x = 0; x < S; x += 4) { const cc = col[(rnd() * 3) | 0]; R(g, x, 0, 3, S, cc); R(g, x, 0, 1, S, shade(cc, 0.22)); R(g, x + 2, 0, 1, S, shade(cc, -0.3)); }
    for (const y of [3 + (i & 1), 11 - (i & 1)]) { R(g, 0, y, S, 2, rope); R(g, 0, y, S, 1, '#e0cc94'); for (let x = 1; x < S; x += 3) P(g, x, y + 1, '#8a7646'); }
    for (let k = 0; k < 4; k++) { const x = (rnd() * 14) | 0, y = 6 + ((rnd() * 8) | 0); R(g, x, y, 1, 3, reed[k & 1]); P(g, x + 1, y, reed[(k + 1) & 1]); }
    speck(g, rnd, ['#3a4a2a', '#2f3d2a'], 6); return c; },
  capwall(i) { const [c, g] = tile(), rnd = mulberry(820 + i), deep = '#3a2a4a', cap = ['#6a4a7a', '#7a5a8a', '#58406a'], rim = '#b89ac8', spot = '#e8d8f0';
    R(g, 0, 0, S, S, deep);
    for (let k = 0; k < 4; k++) { const y = k * 4 + 1, off = ((k + i) % 2) * 5, cc = cap[(k + i) % 3]; for (let x = -off; x < S; x += 10) { R(g, x, y, 9, 3, cc); R(g, x + 1, y - 1, 7, 1, cc); R(g, x + 1, y - 1, 7, 1, shade(cc, 0.18)); R(g, x, y + 2, 9, 1, rim); R(g, x + 2, y + 3, 5, 1, '#241830'); P(g, x + 3 + ((rnd() * 3) | 0), y, spot); } }
    speck(g, rnd, ['#c8f0a0', '#a8d880'], 3); return c; },
  rockfall(i) { const [c, g] = tile(), rnd = mulberry(830 + i), base = ['#6a665e', '#7d756b', '#58544d', '#867e72'];
    R(g, 0, 0, S, S, '#2e2a27');
    let y = 0; while (y < S) { const h = Math.min(S - y, 5 + ((rnd() * 2) | 0)); let x = (rnd() * 5 - 5) | 0;
      while (x < S) { const w = 6 + ((rnd() * 4) | 0), col = base[(rnd() * 4) | 0]; R(g, x + 1, y, w - 2, h, col); R(g, x, y + 1, w, h - 2, col); R(g, x + 1, y, w - 2, 1, shade(col, 0.25)); R(g, x + 1, y + h - 1, w - 2, 1, shade(col, -0.3)); P(g, x + 2 + ((rnd() * 3) | 0), y + 2, shade(col, -0.2)); x += w; } y += h; }
    speck(g, rnd, ['#9a9288', '#4b4640', '#5f7d3b'], 6); R(g, 0, 0, S, 1, '#3a3632'); return c; },
  cribbing(i) { const [c, g] = tile(), rnd = mulberry(840 + i), wood = '#4a3420', hi = '#6a4a2a', lo = '#241608', iron = '#5a5048', ironHi = '#9a8a78';
    R(g, 0, 0, S, S, lo);
    R(g, 0, 0, S, 5, wood); R(g, 0, 0, S, 1, hi); R(g, 0, 4, S, 1, lo); R(g, 0, 8, S, 5, wood); R(g, 0, 8, S, 1, hi); R(g, 0, 12, S, 1, lo);
    for (const x of i & 1 ? [2, 9] : [5, 12]) { R(g, x, 5, 3, 3, '#33220f'); R(g, x, 13, 3, 3, '#33220f'); }
    R(g, i & 1 ? 8 : 1, 0, 3, S, iron); R(g, (i & 1 ? 8 : 1), 0, 1, S, ironHi); P(g, i & 1 ? 9 : 2, 2, '#c8c0b0'); P(g, i & 1 ? 9 : 2, 10, '#c8c0b0');
    speck(g, rnd, ['#33220f', '#7a5a38'], 8, 0, 0, S, S); return c; },
  ironslab(i) { const [c, g] = tile(), rnd = mulberry(850 + i), base = '#3a4250', hi = '#6a7488', lo = '#1c2230', blue = '#7ab0ff';
    R(g, 0, 0, S, S, base); R(g, 0, 0, S, 1, hi); R(g, 0, 7, S, 2, lo); R(g, 0, 7, S, 1, '#52607a'); R(g, 0, 15, S, 1, lo);
    for (const [x, y] of [[2, 2], [13, 2], [2, 11], [13, 11]]) { R(g, x, y, 2, 2, hi); P(g, x, y, '#c0c8d8'); }
    R(g, 6 + (i & 1), 2, 1, 4, lo); R(g, 6 + (i & 1), 10, 1, 5, lo);
    if (i === 1) { P(g, 5, 4, blue); P(g, 6, 5, blue); P(g, 7, 4, blue); P(g, 7, 12, blue); P(g, 8, 13, blue); }
    speck(g, rnd, [lo, hi], 8); return c; },
  shipplank(i) { const [c, g] = tile(), rnd = mulberry(860 + i), p = ['#a89a7a', '#9a8c6c', '#b4a684'], seam = '#2a2218', nail = '#5a5048';
    for (let k = 0; k < 4; k++) { const y = k * 4, cc = p[(k + i) % 3]; R(g, 0, y, S, 4, cc); R(g, 0, y, S, 1, shade(cc, 0.2)); R(g, 0, y + 3, S, 1, seam); const nx = (k * 5 + i * 3) % 7; P(g, 2 + nx, y + 1, nail); P(g, 11 + (nx & 1), y + 1, nail); }
    for (let x = 0; x < 6; x++) P(g, (rnd() * 16) | 0, (rnd() * 16) | 0, '#d8d0b8');
    R(g, 4 + (i & 1) * 6, 0, 2, S, '#7a6a52'); R(g, 4 + (i & 1) * 6, 0, 1, S, '#c8c0aa'); speck(g, rnd, ['#4a7a6a', '#6a8a7a'], 4); return c; },
  lockleaf(i) { const [c, g] = tile(), rnd = mulberry(870 + i), w = '#3a3028', hi = '#5a4a3a', lo = '#1a1610', iron = '#4a5058', ironHi = '#8a929a', weed = '#3f6e50';
    R(g, 0, 0, S, S, w); for (let x = 3; x < S; x += 4) { R(g, x, 0, 1, S, lo); R(g, x + 1, 0, 1, S, hi); }
    R(g, 0, 2, S, 3, iron); R(g, 0, 2, S, 1, ironHi); R(g, 0, 11, S, 3, iron); R(g, 0, 11, S, 1, ironHi);
    for (const x of [1, 6, 11]) { P(g, x, 3, '#c0c8d0'); P(g, x, 12, '#c0c8d0'); }
    R(g, 7 + (i & 1) * 2, 6, 3, 4, '#20181a'); speck(g, rnd, [weed, '#2a4a3a', '#5a8a78'], 10, 0, 8, S, 8); return c; },
  yew(i) { const [c, g] = tile(), rnd = mulberry(880 + i), leaf = ['#1f3a28', '#2a4a30', '#17301f', '#355a3a'], iron = '#2a2630', hi = '#5a5668';
    R(g, 0, 0, S, S, '#12261a');
    for (let k = 0; k < 40; k++) R(g, (rnd() * 14) | 0, (rnd() * 14) | 0, 3, 2, leaf[(rnd() * 4) | 0]);
    for (let x = 2 + (i & 1); x < S; x += 4) { R(g, x, 0, 1, S, iron); P(g, x, 2, hi); P(g, x, 9, hi); }
    R(g, 0, 7, S, 1, iron);
    speck(g, rnd, ['#b8402f', '#4a7a52'], 3); return c; },
  sandfall(i) { const [c, g] = tile(), rnd = mulberry(890 + i), cols = ['#d8b878', '#c9a56a', '#b08a4e', '#e8cc94'];
    R(g, 0, 0, S, S, '#a8803f');
    for (let x = 0; x < S; x += 2) { const col = cols[((x >> 1) + i) % 4]; R(g, x, 0, 2, S, col); for (let k = 0; k < 3; k++) R(g, x, (rnd() * 14) | 0, 1, 2 + ((rnd() * 3) | 0), shade(col, rnd() < 0.5 ? 0.2 : -0.18)); }
    speck(g, rnd, ['#f4e2b0', '#8a6a3a'], 10); return c; },
  /* ---- a boss's own touch ---- */
  combwall(i) { const [c, g] = tile(), rnd = mulberry(900 + i), wax = ['#c9962c', '#e0b040', '#a8802a'], dark = '#5a3a10';
    R(g, 0, 0, S, S, dark);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) { const cx = q * 6 + ((r + i) & 1) * 3 + 1, cy = r * 4; R(g, cx, cy, 5, 3, wax[(r + q + i) % 3]); R(g, cx, cy, 5, 1, '#ffe08a'); R(g, cx + 1, cy + 1, 3, 1, '#7a5214'); }
    speck(g, rnd, ['#ffd36b', '#8a6a22'], 6); R(g, 5 + i * 2, 12, 2, 4, '#e0b040'); P(g, 5 + i * 2, 15, '#ffe9a0'); return c; },
  curtain(i) { const [c, g] = tile(), rnd = mulberry(910 + i), red = ['#7a1c24', '#8a2a30', '#5a1018'], gold = '#c9962c';
    for (let x = 0; x < S; x++) { const f = Math.abs(((x + i * 2) % 6) - 3), col = red[f > 2 ? 2 : f > 1 ? 0 : 1]; R(g, x, 0, 1, S, col); }
    R(g, 0, 7 + (i & 1) * 2, S, 1, gold); for (let x = 1; x < S; x += 4) { P(g, x, 8 + (i & 1) * 2, '#ffe08a'); P(g, x, 9 + (i & 1) * 2, gold); }
    speck(g, rnd, ['#3a0a10', '#a83a40'], 8); return c; },
  wicker(i) { const [c, g] = tile(), rnd = mulberry(920 + i), a = '#b08a4a', b = '#8a6a34', hi = '#d8b878', lo = '#4a3416';
    R(g, 0, 0, S, S, lo);
    for (let y = 0; y < S; y += 3) for (let x = 0; x < S; x += 4) { const o = ((y / 3 + (x >> 2) + i) & 1) ? 2 : 0; R(g, (x + o) % 16, y, 4, 2, ((x >> 2) + (y / 3)) & 1 ? a : b); R(g, (x + o) % 16, y, 4, 1, hi); }
    for (const x of [1, 8]) { R(g, x, 0, 2, S, '#5a3a1a'); P(g, x, 0, '#7a5a34'); }
    speck(g, rnd, ['#e8c878', '#6a4a22'], 5); return c; },
  charstakes(i) { const [c, g] = tile(), rnd = mulberry(930 + i), col = ['#2a2420', '#1a1614', '#3a302a'];
    R(g, 0, 0, S, S, '#0e0c0a');
    for (let x = 0; x < S; x += 4) { const cc = col[(rnd() * 3) | 0]; R(g, x, 0, 3, S, cc); R(g, x, 0, 1, S, '#4a3c32'); }
    for (const y of [4, 11]) { R(g, 0, y, S, 2, '#3a2c20'); }
    speck(g, rnd, ['#ff6a1a', '#ffb040', '#8a2a10'], 9); for (let k = 0; k < 3; k++) P(g, 1 + ((rnd() * 14) | 0), 1 + ((rnd() * 14) | 0), '#ffd36b'); return c; },
};

/* ============================== LOCK PLATES (13 x 15) ============================== */
const PLATE = {
  knot:   { base: '#6a4a2a', hi: '#8a6a3c', lo: '#3d2a16', pin: '#c49a5c', hole: '#1a0f06' },
  peg:    { base: '#7a6a4a', hi: '#a89a74', lo: '#3a3020', pin: '#d8d0b8', hole: '#15110a' },
  cap:    { base: '#6a4a7a', hi: '#b89ac8', lo: '#34224a', pin: '#d8c8e0', hole: '#10081a', glow: '#c8f0a0' },
  slab:   { base: '#6a665e', hi: '#9a9288', lo: '#3a3632', pin: '#b0aaa0', hole: '#14120f' },
  iron:   { base: '#5a5048', hi: '#8a7a68', lo: '#2e2822', pin: '#c8bca8', hole: '#120f0c' },
  brass:  { base: '#a8802a', hi: '#e0c060', lo: '#5a4210', pin: '#fff0b0', hole: '#1a1204' },
  wheel:  { base: '#4a5a5a', hi: '#7a9090', lo: '#222e2e', pin: '#b8d0d0', hole: '#0c1414' },
  black:  { base: '#2a2630', hi: '#5a5668', lo: '#14121a', pin: '#a8802a', hole: '#08060a' },
  scarab: { base: '#c9a56a', hi: '#e8cc94', lo: '#7a5a2a', pin: '#3a8aa0', hole: '#241608' },
};
function bakePlate(name) {
  const [c, g] = canvas(13, 15), p = PLATE[name], R2 = (x, y, w, h, col) => R(g, x, y, w, h, col, 13, 15);
  R2(1, 1, 11, 13, p.base); R2(1, 1, 11, 1, p.hi); R2(1, 13, 11, 1, p.lo); R2(1, 1, 1, 13, p.hi); R2(11, 1, 1, 13, p.lo);
  for (const [x, y] of [[3, 3], [9, 3], [3, 11], [9, 11]]) R2(x, y, 1, 1, p.pin);
  R2(5, 5, 3, 3, p.hole); R2(6, 8, 1, 4, p.hole); R2(6, 4, 1, 1, p.lo);
  if (p.glow) { R2(6, 5, 1, 2, p.glow); R2(5, 12, 3, 1, p.glow); }
  if (name === 'wheel') { R2(3, 6, 1, 3, p.hi); R2(9, 6, 1, 3, p.hi); }
  if (name === 'scarab') { R2(4, 2, 5, 1, p.pin); R2(5, 3, 3, 1, p.pin); }
  /* the outline the original plate wore (1px dark) */
  const o = canvas(15, 17); o[1].imageSmoothingEnabled = false; const og = o[1];
  og.fillStyle = '#1b1626'; for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) og.drawImage(c, dx, dy); og.globalCompositeOperation = 'source-atop'; og.fillRect(0, 0, 15, 17); og.globalCompositeOperation = 'source-over'; og.drawImage(c, 1, 1);
  return o[0];
}

/* ============================== the lookup ============================== */
const CACHE = {};
function setFor(kind) {
  if (CACHE[kind]) return CACHE[kind];
  const t = TABLE[kind], bake = (m, name, n) => name ? Array.from({ length: n }, (_, i) => m[name](i)) : null;
  return CACHE[kind] = { gate: bake(GATE, t.gate, GATE_N), seal: bake(SEAL, t.seal, SEAL_N), plate: t.lock ? bakePlate(t.lock) : null, boss: {} };
}
const bossSeal = (kind, boss) => { const S2 = setFor(kind); if (!BOSS_SEAL[boss]) return null; return S2.boss[boss] || (S2.boss[boss] = Array.from({ length: SEAL_N }, (_, i) => SEAL[BOSS_SEAL[boss]](i))); };
const mod = (n, m) => ((n % m) + m) % m;

/** Bake this level's region now (main.js: at load, never on a frame). */
export function prime(levelId) { setFor(kindOf(levelId)); }
/** The gate tile for (x + y) of a T.PORT cell; null = keep the original portcullis (storm). */
export function gate(levelId, n) { const s = setFor(kindOf(levelId)).gate; return s ? s[mod(n, GATE_N)] : null; }
/** The boss-room / mini wall tile for (y + x); `boss` may add its own touch. */
export function seal(levelId, n, boss) { const k = kindOf(levelId), b = (boss && bossSeal(k, boss)) || levelSeal(k, levelId); return (b || setFor(k).seal)[mod(n, SEAL_N)]; }
const levelSeal = (kind, id) => { const look = LEVEL_SEAL[id]; if (!look) return null; const S2 = setFor(kind), key = 'lvl:' + id; return S2.boss[key] || (S2.boss[key] = Array.from({ length: SEAL_N }, (_, i) => SEAL[look](i))); };
/** The key gate's lock plate; null = keep the original. */
export function plate(levelId) { return setFor(kindOf(levelId)).plate; }
/** For the sheet and the checks: every sprite this file can bake. */
export const ALL = { GATE, SEAL, PLATE };
export { KINDS };
