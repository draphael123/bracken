// src/draft/sealed-pyramid.js — THE SEALED PYRAMID (desert arc level 6) as a GREYBOX DRAFT: a DESCENT, the structure, not the level
// (not in LEVELS). Measured by `node tools/draft-level.mjs sealed-pyramid`. Brief: docs/desert-arc-brief.md.
//
// THE RULE: THE TOMB IS A MACHINE. Every gallery has a TRAP - a falling block, a dart wall, a rolling stone - and a PRESSURE PLATE that
// sets it off. The plate always stands before the trap's reach, and a GUARD always stands in it: tread on the plate as the guard walks
// into the trap and the tomb kills its own. Tread on it while you are in the trap's reach and it kills you. The tomb resets its traps
// behind you. THE COUNTERWEIGHT SHAFTS (F5, the machine): stone blocks on chains - ride one down and the other comes up; they are the
// only way through the middle of the tomb. Said three ways: the plates are pale and worn where the robbers stepped on them; every
// trap's reach is scored on the stone (dart holes, block-dust, a groove for the stone); the guards' bones in the reach.
// SEVEN SECTIONS, top to bottom: THE FACE (the pyramid's steps in the storm - the sandstorm lives here, src/desert-rules.js) · THE
// GALLERY OF PLATES (the rule taught) · THE EMBALMER'S HALL (the mini, THE EMBALMER, among his jars) · THE COUNTERWEIGHT SHAFTS · THE
// FALSE TOMB · THE SCARAB PITS · THE DEEP WAY · then THE SCARAB MOTHER (the arena, the real tomb's antechamber).
import { TS } from './_kit.js';
export const PYR = { W: 56, gap: 8, first: 36, galleries: 18 };
export function build(T) {
  const { W, gap, first, galleries: N } = PYR, fr = k => first + gap * k, last = fr(N - 1), afl = last + 12, H = afl + 3;
  const grid = new Uint8Array(W * H).fill(T.SOLID), set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; }, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : grid[y * W + x];
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const ents = [], ent = (t, x, y, e = {}) => ents.push({ t, x, y, ...e }), traps = [], moversExtra = [];
  // THE FACE: the pyramid's stepped side, sky above it; the storm blows across it
  const face = x => 6 + Math.floor((x - 2) / 2);
  for (let x = 0; x < W; x++) air(x, x, 0, Math.min(face(Math.max(2, x)), 31) - 1);
  for (let y = 0; y < 34; y++) { set(0, y, T.SOLID); set(W - 1, y, T.SOLID); }
  air(40, 42, face(40), fr(0) - 1);                                                                         // THE ROBBERS' HOLE, down into the first gallery
  // THE GALLERIES: each six rows high, a floor, and a hole at alternating ends down to the next
  const MINI = [3, 4], SHAFT = [6, 7];
  /* holes alternate ends - and keep alternating ACROSS the merged Embalmer's hall (with plain parity, gallery 2's hole and gallery 4's
     stacked up at the east end, and you fell straight through his hall without meeting him) */
  const holeX = k => (k < MINI[1] ? k % 2 === 0 : (k + 1) % 2 === 0) ? W - 8 : 4;
  for (let k = 0; k < N; k++) { air(3, W - 4, fr(k) - 6, fr(k) - 1); }
  for (let k = 0; k < N - 1; k++) { if (SHAFT.includes(k)) continue; if (k === MINI[0]) { air(3, W - 4, fr(k) - 6, fr(k + 1) - 1); continue; } air(holeX(k), holeX(k) + 2, fr(k), fr(k + 1) - 7); }
  air(holeX(N - 1), holeX(N - 1) + 2, fr(N - 1), afl - 11);                                                 // the last hole, into the antechamber
  air(6, W - 5, afl - 10, afl - 1);                                                                         // THE SCARAB MOTHER's chamber, under the last hole at either end
  // THE COUNTERWEIGHT SHAFTS: galleries 6 -> 8 by two stone blocks on chains (lifts), not holes
  /* the blocks run in a shaft BEHIND the gallery walls: no hole to drop down (an open shaft let you fall past the machine) */
  moversExtra.push({ kind: 'lift', x: 26 * TS, w: 48, y0: (fr(6) - 1) * TS, y1: (fr(8) - 1) * TS, name: 'counterweight' });
  ent('counterweight', 27, fr(6) - 1, { hung: true });
  // which way you walk each gallery: in where the one above dropped you, out at its own hole
  const entryX = k => k === 0 ? 41 : SHAFT.includes(k - 1) || k === 8 ? 27 : k === MINI[1] ? 10 : holeX(k - 1) + 1;
  const sections = { face: 0, plates: fr(0) - 7, embalmer: fr(3) - 7, shafts: fr(6) - 7, falsetomb: fr(9) - 7, scarabpits: fr(12) - 7, deep: fr(15) - 7, arena: afl };
  const marks = { face: 10, plates: fr(1), embalmer: fr(4), shafts: fr(7), falsetomb: fr(10), nest: afl };
  // THE TRAPS: in every ordinary gallery, a plate a few steps in and the trap's reach beyond it, a guard standing in the reach
  const KINDS = ['block', 'darts', 'stone'];
  for (let k = 0; k < N; k++) { if (MINI.includes(k) || SHAFT.includes(k) || k === 8) continue;
    const xin = entryX(k), xout = SHAFT.includes(k) ? 27 : holeX(k) + 1, d = Math.sign(xout - xin) || 1, y = fr(k) - 1, kind = KINDS[k % 3];
    const px = xin + d * 6, z0 = xin + d * 10, z1 = kind === 'stone' ? xout - d * 4 : xin + d * 18;
    const zone = { x0: Math.min(z0, z1), x1: Math.max(z0, z1), y0: fr(k) - 6, y1: y };
    traps.push({ k, kind, plate: { x: px, y }, zone }); ent('plate', px, y, { trap: kind }); ent('guard', Math.round((zone.x0 + zone.x1) / 2), y, { kind: 'jackal', inTrap: true }); }
  // the rest of the garrison: mummies and scarab swarms, about four every twelve rows
  const FOES = ['mummy', 'scarabs', 'jackal', 'mummy'];
  let n = 0; for (let k = 0; k < N; k++) { const y = fr(k) - 1; for (const fx of [16, 38]) { let x = fx; while (x < W - 5 && (at(x, y) !== T.AIR || at(x, y + 1) !== T.SOLID || ents.some(e => Math.abs(e.x - x) <= 1 && e.y === y))) x++; if (x < W - 5) ent(FOES[n++ % 4], x, y); } }
  for (const x of [8, 18, 28, 36, 46]) ent(x % 2 ? 'vulture' : 'jackal', x, face(x) - 1 - (x % 2 ? 5 : 0));                // on the face, in the storm
  // pickups, checkpoints, the start
  ent('silver', 16, fr(1) - 4); ent('silver', W - 12, fr(10) - 4); ent('silver', 20, fr(13) - 4);
  ent('stray', 30, fr(2) - 1); ent('stray', 12, fr(11) - 1); ent('stray', 40, fr(16) - 1); ent('relic', 24, fr(4) - 1);
  ent('check', 44, fr(4) - 1);   // the Embalmer's hall (its gallery-3 floor is gone)
  for (const [x0, x1] of [[14, 20], [34, 40]]) { for (let x = x0; x <= x1; x++) set(x, fr(4) - 5, T.PLANK); ent('mummy', x0 + 3, fr(4) - 6, { jar: true }); }   // shelves of jars up the hall's walls, one of his on each (the hall had no one but him, and no height to fight on)
  for (const k of [0, 6, 9, 12, 15]) ent('check', entryX(k) + (k % 2 ? -2 : 2) * (k === 0 ? 1 : 1), fr(k) - 1);
  ent('check', 4, face(4) - 1); ent('check', holeX(N - 1) > W / 2 ? holeX(N - 1) - 4 : holeX(N - 1) + 5, fr(N - 1) - 1);
  const arena = { x0: 10 * TS, x1: 50 * TS, floor: afl * TS, trigger: 14 * TS, wallL: 9, wallR: 50, boss: 'scarabmother', tint: '#c8a040', tintA: 0.1 };
  const mini = { x0: 8 * TS, x1: 40 * TS, floor: fr(4) * TS, boss: 'embalmer' };
  return { W, H, grid, ents, START: { x: 4, y: face(4) - 1 }, pools: [], falls: [], moversExtra, interiors: [], sections, marks, arena, mini, traps, storm: { y1: 31 }, draft: true, palette: { set: 'pyramid' } };
}
export const meta = {
  name: 'THE SEALED PYRAMID', orientation: 'v', down: true, landmarks: ['face', 'plates', 'embalmer', 'shafts', 'falsetomb'], sun: false, density: [3.5, 4.5], foes: ['mummy', 'scarabs', 'jackal', 'guard', 'vulture'],
  async extra(L, { ok, R, T, TS, floodReach, slopeReachGrid }) {
    const inZ = (z, x, y) => x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1;
    const bad = []; for (const t of L.traps) { const p = t.plate;
      if (!R.near(p.x, p.y)) bad.push(`g${t.k} plate unreached`); if (inZ(t.zone, p.x, p.y)) bad.push(`g${t.k} plate in its own reach`);
      if (!L.ents.some(e => e.inTrap && inZ(t.zone, e.x, e.y))) bad.push(`g${t.k} no guard`);
      let onRoute = false; for (let x = t.zone.x0; x <= t.zone.x1; x++) if (R.seen.has(x + ',' + t.zone.y1)) onRoute = true; if (!onRoute) bad.push(`g${t.k} off the route`); }
    ok(bad.length === 0, `THE TOMB IS A MACHINE: ${L.traps.length} traps (${['block', 'darts', 'stone'].map(k => L.traps.filter(t => t.kind === k).length + ' ' + k).join(', ')}), each plate reached and before its reach, a guard in every reach, every reach on the road${bad.length ? ' - ' + bad.join('; ') : ''}`);
    const noLift = { ...L, moversExtra: [] }; const Rn = floodReach(slopeReachGrid(noLift, T), T, { rides: true }); let deep = false; for (const k of Rn.seen) if (+k.split(',')[1] > L.sections.falsetomb) deep = true;
    ok(!deep, 'the counterweights are load-bearing: without them nothing below the shafts can be reached');
    let miniGot = false; for (let x = L.mini.x0 / TS; x < L.mini.x1 / TS; x++) if (R.seen.has(x + ',' + (L.mini.floor / TS - 1))) miniGot = true;
    ok(miniGot && L.storm && L.ents.some(e => e.t === 'check' && e.y < L.storm.y1), `THE EMBALMER's hall is on the way down; the storm blows on the face, and a checkpoint stands in it`);
  },
};
