// hunt.js — THE HUNT: the Hound Master's huntsman, drawn apart from the war-hound he sits.
// The hound is the Great Hound's own set (redraw/foes2.js); this is the goblin on its back, so the two can be posed
// separately - the hound crouches for a charge while the rider leans into it, sits back for a leap while he holds on,
// sprawls when it is opened while he is thrown up out of the saddle. main.js draws the hound, then this on the saddle.
// All frames face RIGHT (L is the flip). Parts are char grids stamped onto one blank grid, then fromGrid + OUT.
//
// bakeHoundMaster()  THE HOUND MASTER'S RIDER — a lean goblin huntsman in a green felt hat with a red feather, a
//   leather hunting jerkin with a brass-bound horn at the hip, a red scarf, a lash in one hand and the lord's
//   whistle on a cord. He sits astride: one thigh forward, the boot hanging down the hound's flank.
//   frames: 0 sit (the rein hand down to the collar)
//           1 ride (leaning into the run, head down over the mane)          - charge, leap
//           2 whistle (the whistle to his mouth, elbow up)                   - the tell for the pack
//           3 lash tell (the lash drawn back over his shoulder)
//           4 lash (the arm thrown straight out; the thong is drawn by main.js)
//           5 crack tell (the lash trailed low behind him)
//           6 call (the arm up and out, pointing the pack in)
//           7 thrown (arms up, the hat off, out of the saddle)                - the opening
//           8 shaken (slumped, the arm limp)                                 - a parried lash
//   canvas 22x26   anchor ax 11, ay 18 (the thigh row: main.js sets it on the saddle)
import { fromGrid, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

// same as chars.js
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const stamp = (G, x, y, rows) => rows.forEach((r, j) => { const row = G[y + j]; if (!row) return; for (let i = 0; i < r.length; i++) { const k = r[i], xx = x + i; if (k === '.' || xx < 0 || xx >= row.length) continue; row[xx] = k; } });
const dots = (G, pts, k) => { for (const [x, y] of pts) if (G[y] && x >= 0 && x < G[y].length) G[y][x] = k; };
const rowsOf = G => G.map(r => r.join(''));

export function bakeHoundMaster() {
  const P = { o: OUT, g: '#7aa84e', G: '#4e7432', e: '#ffd36b', m: '#2a1a14', t: '#f3f0d2', h: '#4a5a2e', H: '#2e3a1c', f: '#c9463d',
    c: '#8a5a2e', C: '#5c3a1d', k: '#c9a040', n: '#e8dcc0', b: '#3a2e22', r: '#6a3a24', w: '#c9b27c', s: '#8f2f28' };
  const q = G => outline(fromGrid(rowsOf(G), P, 1), OUT);
  const W = 20, H = 24, BX = 1, BY = 1;
  const HAT = ['....HHHH..', '.ffHhhhhH.', '..HHHHHHHH'];
  const FACE = ['G.gggggg..', 'Gggggegggg', '.gggggggg.', '..ggmtmg..', '...gggg...'];
  const SCARF = ['ssssss'];
  const TORSO = ['.cccccc.', 'cccccccc', 'cCcckcCc', 'cccccccc', 'bbbbbbbb', '.CccccC.'];
  const LEGS = ['.CCCCCCCC.', '..CCCCCCCC', '......bbb.', '......bbb.', '.....bbbbb'];
  const HORN = ['nnk', '.nn'];
  // o: { head: [dx, dy], hat: [x, y] | null, arm: [[cells], key] ... } - every coordinate is from the body's origin (BX, BY)
  const frame = o => {
    const G = blank(W, H), at = (x, y) => [BX + x, BY + y];
    const [hx, hy] = o.head || [0, 0];
    stamp(G, ...at(4, 15), LEGS);
    stamp(G, ...at(5, 9), TORSO);
    stamp(G, ...at(4, 13), HORN);
    stamp(G, ...at(5, 8), SCARF);
    if (o.hat !== null) stamp(G, ...at((o.hat || [4 + hx, hy])[0], (o.hat || [4 + hx, hy])[1]), HAT);
    stamp(G, ...at(4 + hx, 3 + hy), FACE);
    for (const [cells, key] of o.arms || []) dots(G, cells.map(([x, y]) => at(x, y)), key);
    return q(G);
  };
  const sit = frame({ arms: [[[[12, 10], [13, 11]], 'c'], [[[14, 12]], 'g'], [[[15, 13], [16, 14]], 'r']] });
  const ride = frame({ head: [1, 1], arms: [[[[12, 10], [13, 11], [14, 11]], 'c'], [[[15, 12]], 'g'], [[[16, 13], [17, 14]], 'r']] });
  const whistle = frame({ arms: [[[[12, 9], [13, 8]], 'c'], [[[12, 7], [13, 7]], 'g'], [[[11, 6], [12, 6]], 'k']] });
  const lashTell = frame({ head: [-1, 0], arms: [[[[6, 9], [5, 8], [4, 7]], 'c'], [[[3, 6]], 'g'], [[[2, 5], [1, 4]], 'r'], [[[0, 3], [0, 5], [0, 6], [1, 7], [0, 8]], 'w']] });
  const lash = frame({ head: [1, 0], arms: [[[[12, 9], [13, 9], [14, 9]], 'c'], [[[15, 9]], 'g'], [[[16, 9], [17, 9]], 'r']] });
  const crackTell = frame({ arms: [[[[5, 11], [4, 12]], 'c'], [[[3, 13]], 'g'], [[[2, 14], [1, 15]], 'r'], [[[0, 16], [0, 17], [1, 18], [2, 19], [3, 20]], 'w']] });
  const call = frame({ arms: [[[[12, 9], [13, 8], [14, 7]], 'c'], [[[15, 6], [16, 5]], 'g']] });
  const thrown = frame({ head: [-1, 1], hat: [0, -1], arms: [[[[6, 9], [5, 8], [5, 7]], 'c'], [[[4, 6]], 'g'], [[[12, 9], [13, 8], [13, 7]], 'c'], [[[14, 6]], 'g']] });
  const shaken = frame({ head: [1, 2], arms: [[[[12, 10], [12, 11], [13, 12]], 'c'], [[[13, 13]], 'g']] });
  return pack([sit, ride, whistle, lashTell, lash, crackTell, call, thrown, shaken], BX + 9 + 1, BY + 16 + 1, 14, 18);
}
