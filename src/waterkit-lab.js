// src/waterkit-lab.js — THE WATER KIT'S TEST ROOM (claude/waterkit, 11-05). Not on the road: a level declaration in data only, the shape every sea
// lane copies. tools/tide-kit.mjs and tools/pull-field.mjs run it; a later lane can hang it on the dev level list (browser owed) to feel it.
// A tidal basin 64 tiles wide: low water on row 40, high on row 31; a stair of dry stone at the west end (the checkpoint), a bell and a sluice on
// the sea wall, a pontoon that floats, a counterweight lift, crab flats that bite at low water, a floodgate chamber on its own lever; and four
// fields: a drift, a tide-driven channel current, a whirl RIP with a mooring post and a release window, and a gust over the wall (air too).
// Placeholder everything: the art is owed (docs/waterkit.md).
export const WATERKIT_LAB = {
  id: 'waterkitlab', name: 'THE TIDE BASIN (LAB)', w: 64, h: 44,
  pools: [{ id: 'basin', x0: 8 * 16, x1: 56 * 16, base: 41 * 16 }, { id: 'vault', x0: 58 * 16, x1: 63 * 16, base: 41 * 16 }],
  checkpoints: [{ x: 4, y: 29 }, { x: 20, y: 39, dryX: 7 }],
  tides: [
    { id: 'basin', pools: ['basin'], lo: 40, hi: 31, cycle: { low: 9, warn: 3, rise: 3, high: 7, turn: 2, fall: 3 }, rate: 1, safe: 'low', grace: 6,
      floods: [{ x0: 8, y0: 31, x1: 56, y1: 40 }],
      floats: [{ id: 'pontoon', x0: 24, x1: 29, y: 39, top: 30, free: 4 }],
      lifts: [{ id: 'counterweight', x0: 40, x1: 42, yLo: 30, yHi: 38 }],   /* goes DOWN as the tide comes in: a raised gantry at low, a step at high */
      bites: [{ x0: 32, y0: 38, x1: 38, y1: 40, when: 'low', kind: 'tidepoolcrab' }],
      foes: { tidepoolcrab: 'low', eel: 'swim', sailor: 'flee', bonegob: 'drown' },
      verbs: [{ t: 'bell', x: 6, y: 28 }, { t: 'sluice', x: 10, y: 29, hold: 6 }] },
    { id: 'vault', mode: 'manual', pools: ['vault'], lo: 40, hi: 33, cycle: { rise: 2.5 }, flip: 'fill',
      floods: [{ x0: 58, y0: 33, x1: 63, y1: 40 }], verbs: [{ t: 'lever', x: 57, y: 31 }] },
  ],
  pulls: [
    { id: 'drift', kind: 'current', box: [12, 34, 20, 40], dir: [1, 0], strength: 40, curve: 'flat' },
    { id: 'channel', kind: 'current', box: [30, 33, 38, 40], dir: [1, 0], strength: 70, curve: 'ease', tide: 'basin', phases: { rise: -1, fall: 1 } },
    { id: 'eddy', kind: 'whirl', ring: [48, 36, 4], strength: 150, curve: 'edge', swirl: 0.6, cycle: { off: 3, tell: 1.5, on: 4 }, posts: [[45, 35]], col: '#d8eef0' },
    { id: 'gust', kind: 'away', box: [8, 24, 14, 30], at: [6, 27], strength: 50, curve: 'flat', water: false, weight: { hero: 1, foe: 0.4, shot: 1.5 } },
  ],
};
