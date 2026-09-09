// chars.js — the knight and the forest's enemies, baked from text grids + drawn sword.
import { canvas, px, rect, line, fromGrid, outline, flipX, whiten } from './px.js';
import { OUT } from './art.js';

const KP = { // knight palette
  s: '#c9d1dc', S: '#7c8797', b: '#3d5aa8', B: '#243a78', r: '#c9463d', k: '#f1c9a0',
  w: '#7a4a2a', W: '#4c2c17', y: '#e0b040', v: '#2a2f3d', o: OUT,
};
const BODY = [ // 10 wide, rows 0..10 (helmet + torso + belt)
  '..rSSSS...',
  '.rSssssS..',
  'rSsssssS..',
  '.SsvvvvS..',
  '.SssssSS..',
  '..SSSS....',
  '.BbbbbB...',
  'SBbybbBS..',
  'SBbbbbBS..',
  '.BbbbbB...',
  '.wwwwww...',
];
const LEGS = {
  stand: ['.SS..SS...', '.SS..SS...', '.ww..ww...', '.ww..ww...', 'WWW..WWW..'],
  runA:  ['.SS.SS....', 'SS...SS...', 'ww....ww..', 'ww....ww..', 'WW....WWW.'],
  runB:  ['..SSS.....', '..SSS.....', '..ww.w....', '..ww.ww...', '.WWW..WW..'],
  runC:  ['..SS.SS...', '.SS...SS..', '.ww....ww.', '.ww....ww.', 'WWW....WWW'],
  jump:  ['..SSSS....', '.SS..SS...', '.ww..ww...', 'WWW..WWW..', '..........'],
  fall:  ['.SS..SS...', 'SS....SS..', 'ww....ww..', 'ww....ww..', 'WW....WW..'],
  crouch:['SS.SS.SS..', 'WWW.ww.WWW', '..........', '..........', '..........'],
};
const W = 28, H = 28, BX = 8, BY = 3; // body drawn at (BX,BY); feet bottom at BY+16 = 19
export const KNIGHT_ANCHOR = { ax: 13, ay: 19 };

function knightFrame({ legs = 'stand', dy = 0, dx = 0, sword = null, arm = null, plume = true, shield = false }) {
  const [c, g] = canvas(W, H);
  const draw = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const k = r[x]; if (k !== '.' && KP[k]) px(g, ox + x, oy + y, KP[k]); } });
  draw(BODY, BX + dx, BY + dy);
  draw(LEGS[legs], BX + dx, BY + 11 + (legs === 'jump' || legs === 'fall' ? dy : dy));
  if (arm) line(g, arm[0] + dx, arm[1] + dy, arm[2] + dx, arm[3] + dy, KP.S, 2);
  if (sword) {
    const [x0, y0, x1, y1] = sword.map((v, i) => v + (i & 1 ? dy : dx));
    line(g, x0, y0, x1, y1, KP.s, 2);
    // hilt and cross-guard at the hand end
    px(g, x0, y0, KP.w); px(g, x0 + 1, y0, KP.w);
    const gx = Math.sign(x1 - x0), gy = Math.sign(y1 - y0);
    px(g, x0 + gx - gy, y0 + gy + gx, KP.y); px(g, x0 + gx + gy, y0 + gy - gx, KP.y);
  }
  if (shield) { // small round shield held out front
    const sx = BX + 10 + dx, sy = BY + 6 + dy;
    rect(g, sx, sy, 4, 8, KP.w); rect(g, sx + 1, sy + 1, 2, 6, KP.W); px(g, sx + 1, sy + 3, KP.y); px(g, sx + 2, sy + 3, KP.y); rect(g, sx, sy, 4, 1, KP.y); rect(g, sx, sy + 7, 4, 1, KP.y);
  }
  outline(c, OUT);
  return c;
}

export function bakeKnight() {
  const sh = [BX + 8, BY + 7]; // shoulder (front)
  const F = {
    idle: [
      knightFrame({ sword: [sh[0] + 1, sh[1] + 2, sh[0] + 3, sh[1] + 9] }),
      knightFrame({ dy: 1, sword: [sh[0] + 1, sh[1] + 2, sh[0] + 3, sh[1] + 9] }),
    ],
    run: ['runA', 'runB', 'runC', 'runB'].map((l, i) => knightFrame({ legs: l, dy: i & 1 ? 0 : -1, sword: [sh[0] + 1, sh[1] + 2, sh[0] + 4, sh[1] + 8] })),
    jump: knightFrame({ legs: 'jump', sword: [sh[0] + 1, sh[1] + 1, sh[0] + 5, sh[1] - 4] }),
    fall: knightFrame({ legs: 'fall', sword: [sh[0] + 1, sh[1] + 1, sh[0] + 5, sh[1] - 4] }),
    atk: [
      // windup: sword raised behind the head, body leans back
      knightFrame({ dx: -1, arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 4], sword: [sh[0] + 1, sh[1] - 4, sh[0] - 5, sh[1] - 11] }),
      // swing: sword straight out, body leans in
      knightFrame({ dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 1], sword: [sh[0] + 4, sh[1] + 1, sh[0] + 13, sh[1] + 1] }),
      // follow-through: sword down-forward
      knightFrame({ dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 3], sword: [sh[0] + 3, sh[1] + 3, sh[0] + 9, sh[1] + 9] }),
    ],
    plunge: knightFrame({ legs: 'jump', arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 5], sword: [sh[0] - 1, sh[1] + 5, sh[0] - 1, sh[1] + 17] }),
    hurt: knightFrame({ dx: -1, dy: 1, legs: 'fall', sword: [sh[0] + 1, sh[1] + 2, sh[0] + 6, sh[1] + 6] }),
    crouch: knightFrame({ dy: 3, legs: 'crouch', sword: [sh[0] + 1, sh[1] + 2, sh[0] + 6, sh[1] + 6] }),
    block: knightFrame({ legs: 'runC', shield: true, sword: [sh[0] - 4, sh[1] + 3, sh[0] - 6, sh[1] + 10] }),
    roll: [knightFrame({ dy: 4, legs: 'crouch', sword: [sh[0] + 1, sh[1] + 2, sh[0] + 6, sh[1] + 6] }), knightFrame({ dy: 5, dx: 1, legs: 'crouch', sword: [sh[0] - 2, sh[1] + 1, sh[0] - 6, sh[1] + 5] })],
  };
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(whiten) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR };
}

// ---------- enemies ----------
const EP = { n: '#5a3a24', N: '#3a2214', t: '#e8dcc0', T: '#b8a888', g: '#6faa4a', G: '#3f6e2c', e: '#f3f0d2', o: OUT, r: '#c9463d', R: '#8f2f28', s: '#c9d1dc', S: '#7c8797', b: '#5d4a8a', w: '#8a5a32', W: '#5c3a1d', y: '#e0b040', k: '#f0e6c8', K: '#cdbf9a', p: '#ff9a5c', d: '#2a2f3d', l: '#dfe8ff' };
const sprite = rows => outline(fromGrid(rows, EP, 1), OUT);
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(whiten), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}

// Sprig — goblin walker. 10×10. Faces right.
export function bakeSprig() {
  const head = ['...gggg...', '..gggggg..', '.geoggeog.', '.gggggggg.', '..gGGGGg..', '...gggg...'];
  const a = sprite([...head, '..rrrrrr..', '..rrrrrr..', '..GG..GG..', '.GG....GG.']);
  const b = sprite([...head, '..rrrrrr..', '..rrrrrr..', '...GGGG...', '..GG..GG..']);
  return pack([a, b], 6, 11, 8, 10);
}

// Shieldbearer — helmet, tabard, round wooden shield held out front (right). 14×14.
export function bakeShield() {
  const rows = [
    '...SSSSS......',
    '..SsssssS.....',
    '..SsssssS.....',
    '..gggeoggg....',
    '...gGGGg......',
    '..bbbbbb.wwww.',
    '.Sbbbbbb.wwyww',
    '.Sbbbbbb.wwyww',
    '..bbbbbb.wwww.',
    '..rrrrrr......',
    '..rrrrrr......',
    '..GG..GG......',
    '..GG..GG......',
    '.GGG..GGG.....',
  ];
  const rows2 = rows.slice(0, 11).concat(['...GGGG.......', '..GG..GG......', '.GGG..GGG.....']);
  return pack([sprite(rows), sprite(rows2)], 7, 15, 10, 14);
}

// Spitter — toadstool that spits seeds. 14×12. Frame 1 = mouth open.
export function bakeSpitter() {
  const cap = ['....rrrrrr....', '..rrrerrrrer..', '.rrrrrrrrrrrr.', 'rrerrrrrerrrrr', 'rrrrrrrrrrrrrr', '.RRRRRRRRRRRR.'];
  const a = sprite([...cap, '...kkkkkkkk...', '...kokkkkok...', '...kkkkkkkk...', '...kkkGGkkk...', '...kkkkkkkk...', '..kkkkkkkkkk..']);
  const b = sprite([...cap, '...kkkkkkkk...', '...kokkkkok...', '...kkGGGGkk...', '...kkGGGGkk...', '...kkkGGkkk...', '..kkkkkkkkkk..']);
  return pack([a, b], 8, 13, 12, 12);
}

// Wasp — striped flyer. 12×8, two wing frames.
export function bakeWasp() {
  const body = ['..oyoyoyoy..', '.ooyoyoyoyo.', '..oyoyoyoyo.', '...ooooo..o.'];
  const a = sprite(['...ll..ll...', '..llll.llll.', '...llllll...', ...body]);
  const b = sprite(['............', '...ll..ll...', '..llllllll..', ...body]);
  return pack([a, b], 7, 7, 10, 7);
}

export function bakeSeed() {
  const c = sprite(['.pp.', 'pppp', 'pppp', '.pp.']);
  return pack([c], 3, 3, 4, 4);
}

// Thornback — armoured beetle with a spined back. The plunge bounces off it and hurts; only the sword bites. 14×9.
export function bakeThornback() {
  const shell = ['..t.t.t.t.t...', '.tNtNtNtNtNt..', '.NnnnnnnnnnN..', 'NnnnnnnnnnnnN.', 'NnNnnnnnnnnnNe', '.NnnnnnnnnnnNo'];
  const a = sprite([...shell, '.NN.NN.NN.NN..', '.N..N..N..N...']);
  const b = sprite([...shell, '..NN.NN.NN.NN.', '...N..N..N..N.']);
  return pack([a, b], 8, 9, 14, 8);
}
