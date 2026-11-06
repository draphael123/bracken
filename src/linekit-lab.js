// src/linekit-lab.js - THE LINE KIT'S TEST ROOM (claude/highlines-kit, 11-05). Not on the road, on no level list: a level declaration in data
// only, the shape the HIGH LINES greybox lane copies. tools/line-kit.mjs runs it (the sweep, the lint); a later lane may hang it on the dev list
// (browser owed) to feel it. One small climb, bottom to top, that touches every part of the kit once:
//   FOOTHOLD   L0 (checkpoint) -> W1 grip winch over the net N0 -> L1
//   JUNCTIONS  L1 -> W2 grip winch; hold UP at the points board (x 52) -> S1, a fast side GLIDE to the secret ledge Ls -> F_r back down to L1;
//              a miss off W2 lands in the net N1, and the short winch W1c hauls you back up to L1
//   WIND GORGE L2 (lee) -> G1, a glide west through the told crosswind 'gorge' (tailwind x1.35, the sway) -> L3 (lee)
//   COUNTERWEIGHT  L3 -> W3 grip winch -> L4 (checkpoint); stand in cage B, strike the HOPPER: the stone drops into weight A, the cage goes up -> L5
//              (co-op: one seat rides weight A down from LA1 and sends the cage up)
//   SET PIECE  L5 -> board the gondola GD: it hauls up, CREAKS, SNAPS at x 40, the cab falls and hooks onto LO, a glide line, which runs it to L6
//   EXAM       L6 (checkpoint) -> W4, a grip winch a HOOKJACK may cut (cut: true - the drop lands on LO, a level down) -> L7, THE CAVE MOUTH (exit)
// Placeholder everything: art owed (docs/linekit.md).
export const LINEKIT_LAB = {
  id: 'linekitlab', name: 'THE HIGH LINES (LINE KIT LAB)', w: 74, h: 82,
  landings: [
    [0, 76, 18, 77],    // 0 L0 the line-yard (checkpoint 1)
    [33, 62, 44, 63],   // 1 L1
    [64, 49, 72, 50],   // 2 L2 the gorge's east lee rock
    [33, 52, 41, 53],   // 3 L3 the gorge's west lee rock
    [12, 41, 21, 42],   // 4 L4 the weight house (checkpoint 2)
    [12, 25, 24, 26],   // 5 L5 the gondola station
    [62, 27, 71, 28],   // 6 L6 the dock (checkpoint 3)
    [36, 9, 45, 10],    // 7 L7 THE CAVE MOUTH (exit)
    [64, 60, 70, 61],   // 8 Ls the secret ledge
    [0, 25, 1, 26],     // 9 LA1 beside weight A at the top
    [0, 41, 1, 42],     // 10 LA2 beside weight A at the bottom
  ],
  nets: [[19, 78, 40, 79], [44, 66, 70, 67]],
  checkpoints: [{ x: 3, y: 76 }, { x: 16, y: 41 }, { x: 66, y: 27 }],
  secrets: [[67, 60]],
  exit: [37, 5, 44, 9],
  lineKit: {
    anchors: [[50, 54.6], [36, 20.5], [58, 8]],
    lines: [
      { id: 'W1', kind: 'winch', a: [12, 75], b: [34, 61] },
      { id: 'W2', kind: 'winch', a: [40, 61], b: [66, 48], points: [{ at: 52, to: 'S1' }] },
      { id: 'S1', kind: 'glide', a: [50, 54.6], b: [66, 58.6], secret: true },
      { id: 'F_r', kind: 'free', a: [68, 58.9], b: [45, 61] },
      { id: 'W1c', kind: 'winch', a: [48, 65], b: [43, 61] },
      { id: 'G1', kind: 'glide', a: [72, 45], b: [40, 51] },
      { id: 'W3', kind: 'winch', a: [38, 51], b: [20, 40] },
      { id: 'GD', kind: 'free', a: [25, 22.5], b: [58, 8], dir: 1, snap: { at: 40 }, cab: { onto: 'LO' } },
      { id: 'LO', kind: 'glide', a: [36, 20.5], b: [64, 24] },
      { id: 'W4', kind: 'winch', a: [66, 26], b: [44, 8], cut: true },
    ],
    weights: [{ id: 'lift', a: { x0: 2, x1: 5, top: 25, bot: 41 }, b: { x0: 8, x1: 11, top: 25, bot: 41 }, rest: 0, tare: 0.5, hopper: [12, 40] }],
    winds: [{ id: 'gorge', box: [42, 38, 60, 49], dir: -1, period: 4, on: 2, told: 1.2, shove: 240, sway: 10 }],
    lee: [[61, 40, 72, 49], [33, 44, 41, 52]],
  },
};
