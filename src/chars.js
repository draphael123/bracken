// chars.js — the knight and the forest's enemies, baked from text grids + drawn sword.
import { canvas, px, rect, line, fromGrid, outline, flipX, whiten } from './px.js';
import { OUT } from './art.js';

const KP0 = { // knight palette
  s: '#c9d1dc', S: '#7c8797', b: '#3d5aa8', B: '#243a78', r: '#c9463d', k: '#f1c9a0',
  w: '#7a4a2a', W: '#4c2c17', y: '#e0b040', v: '#2a2f3d', o: OUT,
};
let KP = Object.assign({}, KP0);
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
// Plume variants for idle flutter.
const PLUME = [
  ['..rSSSS...', '.rSssssS..', 'rSsssssS..'],
  ['..rSSSS...', 'rrSssssS..', '.SsssssS..'],
  ['.rrSSSS...', '.rSssssS..', 'rSsssssS..'],
];
const LEGS = {
  stand: ['.SS..SS...', '.SS..SS...', '.ww..ww...', '.ww..ww...', 'WWW..WWW..'],
  // six-frame run: stride, gather, pass, extend, stride (other), gather
  run1:  ['.SS...SS..', 'SS.....SS.', 'ww.....ww.', 'ww......ww', 'WW.....WWW'],
  run2:  ['.SS..SS...', '.SS...SS..', '.ww...ww..', '.ww....ww.', 'WWW...WWW.'],
  run3:  ['..SSSS....', '..SSS.....', '..www.....', '..ww.w....', '.WWW.WW...'],
  run4:  ['..SS.SS...', '..SS..SS..', '..ww..ww..', '.ww....ww.', 'WWW...WWW.'],
  run5:  ['SS....SS..', '.SS....SS.', '.ww....ww.', 'ww......ww', 'WWW....WWW'],
  run6:  ['.SSS.SS...', '..SS..SS..', '..ww..ww..', '..ww.ww...', '.WWW.WWW..'],
  runC:  ['..SS.SS...', '.SS...SS..', '.ww....ww.', '.ww....ww.', 'WWW....WWW'],
  jump:  ['..SSSS....', '.SS..SS...', '.ww..ww...', 'WWW..WWW..', '..........'],
  jump2: ['.SS..SS...', '.SS..SS...', 'ww....ww..', 'ww....ww..', 'WW....WW..'],
  fall:  ['.SS..SS...', 'SS....SS..', 'ww....ww..', 'ww....ww..', 'WW....WW..'],
  fall2: ['SS....SS..', 'SS....SS..', 'ww....ww..', 'ww....ww..', 'WW....WW..'],
  crouch:['SS.SS.SS..', 'WWW.ww.WWW', '..........', '..........', '..........'],
  land:  ['.SS..SS...', 'SS....SS..', 'ww....ww..', 'WWW..WWW..', '..........'],
  wide:  ['SS.....SS.', 'SS.....SS.', 'ww.....ww.', 'ww.....ww.', 'WWW...WWW.'],
};
const W = 28, H = 28, BX = 8, BY = 3; // body drawn at (BX,BY); feet bottom at BY+16 = 19
export const KNIGHT_ANCHOR = { ax: 13, ay: 19 };

function knightFrame({ legs = 'stand', dy = 0, dx = 0, sword = null, arm = null, plume = 0, shield = false, legsDy = 0 }) {
  const [c, g] = canvas(W, H);
  const draw = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const k = r[x]; if (k !== '.' && KP[k]) px(g, ox + x, oy + y, KP[k]); } });
  const body = PLUME[plume].concat(BODY.slice(3));
  draw(body, BX + dx, BY + dy);
  draw(LEGS[legs], BX + dx, BY + 11 + legsDy);
  if (arm) line(g, arm[0] + dx, arm[1] + dy, arm[2] + dx, arm[3] + dy, KP.S, 2);
  if (sword) {
    const [x0, y0, x1, y1] = sword.map((v, i) => v + (i & 1 ? dy : dx));
    line(g, x0, y0, x1, y1, KP.s, 2);
    px(g, x0, y0, KP.w); px(g, x0 + 1, y0, KP.w);
    const gx = Math.sign(x1 - x0), gy = Math.sign(y1 - y0);
    px(g, x0 + gx - gy, y0 + gy + gx, KP.y); px(g, x0 + gx + gy, y0 + gy - gx, KP.y);
  }
  if (shield) { // kite shield held out front, covering the torso: steel rim, oak face, gold boss
    const sx = BX + 9 + dx, sy = BY + 4 + dy;
    const rows = ['.SSSSS.', 'SwwwwwS', 'SwwywwS', 'SwyyywS', 'SwwywwS', 'SwwwwwS', 'SwwwwwS', '.SwwwS.', '.SwwwS.', '..SwS..', '...S...'];
    rows.forEach((r, yy) => { for (let xx = 0; xx < r.length; xx++) { const k = r[xx]; if (k !== '.') px(g, sx + xx, sy + yy, k === 'S' ? KP.S : k === 'w' ? KP.w : KP.y); } });
    px(g, sx + 1, sy + 1, KP.s); px(g, sx + 2, sy + 1, KP.s); px(g, sx + 1, sy + 2, KP.s);
  }
  outline(c, OUT);
  return c;
}
function rotQuarter(c, q) { // rotate a square canvas by q quarter turns
  const [o, g] = canvas(c.width, c.height);
  g.translate(c.width / 2, c.height / 2); g.rotate(q * Math.PI / 2); g.drawImage(c, -c.width / 2, -c.height / 2);
  return o;
}

export function bakeKnight(skin = {}) {
  KP = Object.assign({}, KP0, skin);
  const sh = [BX + 8, BY + 7]; // shoulder (front)
  const rest = (d = 0) => [sh[0] + 1, sh[1] + 2 + d, sh[0] + 3, sh[1] + 9 + d];
  const F = {
    idle: [
      knightFrame({ sword: rest(), plume: 0 }),
      knightFrame({ sword: rest(), plume: 1 }),
      knightFrame({ dy: 1, sword: rest(), plume: 2, legsDy: 0 }),
      knightFrame({ dy: 1, sword: rest(), plume: 1 }),
    ],
    // run: body bobs, sword arm pumps
    run: [['run1', -1, 0], ['run2', 0, 1], ['run3', 1, 2], ['run4', 0, 1], ['run5', -1, 0], ['run6', 0, 1]].map(([l, dy, pump], i) =>
      knightFrame({ legs: l, dy, plume: i % 3 === 0 ? 2 : 0, sword: [sh[0] + 1 + pump, sh[1] + 2, sh[0] + 4 + pump, sh[1] + 8], legsDy: 0 })),
    jump: [
      knightFrame({ legs: 'jump', dy: -1, sword: [sh[0] + 1, sh[1] + 1, sh[0] + 5, sh[1] - 4], plume: 1 }),
      knightFrame({ legs: 'jump2', sword: [sh[0] + 1, sh[1] + 1, sh[0] + 5, sh[1] - 3], plume: 1 }),
    ],
    fall: [
      knightFrame({ legs: 'fall', sword: [sh[0] + 1, sh[1] + 1, sh[0] + 5, sh[1] - 4], plume: 2 }),
      knightFrame({ legs: 'fall2', dy: -1, sword: [sh[0] + 1, sh[1] + 1, sh[0] + 4, sh[1] - 5], plume: 2 }),
    ],
    land: knightFrame({ legs: 'land', dy: 2, sword: rest(2), plume: 0 }),
    atk: [
      // 0 anticipation: sword drawn back over the shoulder, body leans away
      knightFrame({ dx: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 1, sh[1] - 4], sword: [sh[0] - 1, sh[1] - 4, sh[0] - 7, sh[1] - 10], plume: 1 }),
      // 1 swing: blade straight out, body lunges
      knightFrame({ dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 1], sword: [sh[0] + 4, sh[1] + 1, sh[0] + 13, sh[1] + 1], plume: 2 }),
      // 2 extended: blade angled down-forward, weight forward
      knightFrame({ dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 3], sword: [sh[0] + 3, sh[1] + 3, sh[0] + 11, sh[1] + 8], plume: 2 }),
      // 3 recover: blade low
      knightFrame({ dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 4], sword: [sh[0] + 2, sh[1] + 4, sh[0] + 6, sh[1] + 11], plume: 0 }),
      // 4 settle
      knightFrame({ legs: 'stand', sword: rest(), plume: 0 }),
    ],
    plunge: knightFrame({ legs: 'jump', arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 5], sword: [sh[0] - 1, sh[1] + 5, sh[0] - 1, sh[1] + 17], plume: 1 }),
    hurt: knightFrame({ dx: -1, dy: 1, legs: 'fall', sword: [sh[0] + 1, sh[1] + 2, sh[0] + 6, sh[1] + 6], plume: 2 }),
    crouch: knightFrame({ dy: 3, legs: 'crouch', sword: rest(3) }),
    block: [
      knightFrame({ legs: 'wide', shield: true, sword: [sh[0] - 4, sh[1] + 3, sh[0] - 6, sh[1] + 10] }),
      knightFrame({ legs: 'wide', dy: 1, shield: true, sword: [sh[0] - 4, sh[1] + 4, sh[0] - 6, sh[1] + 11] }),
    ],
  };
  const tuck = knightFrame({ dy: 4, legs: 'crouch', sword: [sh[0] + 1, sh[1] + 2, sh[0] + 5, sh[1] + 5] });
  F.roll = [0, 1, 2, 3].map(q => rotQuarter(tuck, q));
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
const shiftDown = (rows, n) => Array(n).fill('.'.repeat(rows[0].length)).concat(rows.slice(0, rows.length - n));

// Sprig — goblin walker. 10×10, four-frame walk with a head bob.
export function bakeSprig() {
  const head = ['...gggg...', '..gggggg..', '.geoggeog.', '.gggggggg.', '..gGGGGg..', '...gggg...'];
  const cloth = ['..rrrrrr..', '..rrrrrr..'];
  const legs = [['..GG..GG..', '.GG....GG.'], ['..GG.GG...', '..GG..GG..'], ['...GGGG...', '..GG..GG..'], ['..GG.GG...', '.GG....GG.']];
  const frames = legs.map((l, i) => sprite([...(i & 1 ? shiftDown(head, 0) : head), ...cloth, ...l]));
  // bob: frames 1 and 3 drop the head a pixel
  const bobbed = legs.map((l, i) => i & 1 ? sprite(['..........', ...head.slice(0, 5), ...cloth, ...l]) : frames[i]);
  return pack(bobbed, 6, 11, 8, 10);
}

// Shieldbearer — helmet, tabard, round wooden shield held out front (right). 14×14, four-frame walk.
export function bakeShield() {
  const top = [
    '...SSSSS......',
    '..SsssssS.....',
    '..SsssssS.....',
    '..gggeoggg....',
    '...gGGGg......',
  ];
  const torso = s => [
    '..bbbbbb.' + (s ? 'wwww.' : '.....'),
    '.Sbbbbbb.' + (s ? 'wwyww' : 'wwww.'),
    '.Sbbbbbb.' + (s ? 'wwyww' : 'wwyww'),
    '..bbbbbb.' + (s ? 'wwww.' : 'wwyww'),
    '..rrrrrr.' + (s ? '.....' : 'wwww.'),
    '..rrrrrr......',
  ];
  const legs = [['..GG..GG......', '..GG..GG......', '.GGG..GGG.....'], ['..GG.GG.......', '...GGGG.......', '..GGG.GG......'], ['...GGGG.......', '..GG..GG......', '.GGG..GGG.....'], ['..GG.GG.......', '..GG..GG......', '.GG...GGG.....']];
  const frames = legs.map((l, i) => sprite([...top, ...torso(i % 2 === 0), ...l]));
  return pack(frames, 7, 15, 10, 14);
}

// Spitter — toadstool that spits seeds. 14×12. Frames: idle, cap-tilt, mouth open.
export function bakeSpitter() {
  const cap = ['....rrrrrr....', '..rrrerrrrer..', '.rrrrrrrrrrrr.', 'rrerrrrrerrrrr', 'rrrrrrrrrrrrrr', '.RRRRRRRRRRRR.'];
  const capL = ['...rrrrrr.....', '.rrrerrrrer...', 'rrrrrrrrrrrr..', 'rerrrrrerrrrrr', 'rrrrrrrrrrrrrr', '.RRRRRRRRRRRR.'];
  const stem = ['...kkkkkkkk...', '...kokkkkok...', '...kkkkkkkk...', '...kkkGGkkk...', '...kkkkkkkk...', '..kkkkkkkkkk..'];
  const stemOpen = ['...kkkkkkkk...', '...kokkkkok...', '...kkGGGGkk...', '...kkGGGGkk...', '...kkkGGkkk...', '..kkkkkkkkkk..'];
  return pack([sprite([...cap, ...stem]), sprite([...capL, ...stem]), sprite([...cap, ...stemOpen])], 8, 13, 12, 12);
}

// Wasp — striped flyer. 12×8, three wing frames.
export function bakeWasp() {
  const body = ['..oyoyoyoy..', '.ooyoyoyoyo.', '..oyoyoyoyo.', '...ooooo..o.'];
  const a = sprite(['...ll..ll...', '..llll.llll.', '...llllll...', ...body]);
  const b = sprite(['............', '...ll..ll...', '..llllllll..', ...body]);
  const c = sprite(['............', '............', '..ll.ll.ll..', ...body]);
  return pack([a, b, c], 7, 7, 10, 7);
}

export function bakeSeed() {
  const c = sprite(['.pp.', 'pppp', 'pppp', '.pp.']);
  return pack([c], 3, 3, 4, 4);
}

// Thornback — armoured beetle with a spined back. Four-frame leg scuttle.
export function bakeThornback() {
  const shell = ['..t.t.t.t.t...', '.tNtNtNtNtNt..', '.NnnnnnnnnnN..', 'NnnnnnnnnnnnN.', 'NnNnnnnnnnnnNe', '.NnnnnnnnnnnNo'];
  const legs = [['.NN.NN.NN.NN..', '.N..N..N..N...'], ['..NN.NN.NN.NN.', '...N..N..N..N.'], ['.NN.NN.NN.NN..', '..N..N..N..N..'], ['..NN.NN.NN.NN.', '.N..N..N..N...']];
  return pack(legs.map(l => sprite([...shell, ...l])), 8, 9, 14, 8);
}

// Spitter pieces for its death: the cap pops off, the stem crumples.
export function bakeSpitterParts() {
  const cap = ['....rrrrrr....', '..rrrerrrrer..', '.rrrrrrrrrrrr.', 'rrerrrrrerrrrr', 'rrrrrrrrrrrrrr', '.RRRRRRRRRRRR.'];
  const stem = ['...kkkkkkkk...', '...kkkkkkkk...', '...kkGGGGkk...', '...kkkkkkkk...', '..kkkkkkkkkk..'];
  return { cap: pack([sprite(cap)], 8, 7, 12, 6), stem: pack([sprite(stem)], 8, 6, 12, 5) };
}

// Hornet Queen — a 24×14 crowned hornet. Frames: wings up, wings down. Faces right.
export function bakeQueen() {
  const head = ['.................yYYy...', '................yyyyyy..', '................oooooo..', '...............ooeooeoo.', '...............ooooooooo', '................oooooo..'];
  const wingsUp = ['....lll.llll............', '..lllllllllll...........', '.llllllllllll...........'];
  const wingsDn = ['........................', '..lll.llll..............', '.llllllllll.............'];
  const body = [
    'oyyooyyooyyooyyooooooo..',
    'yyyooyyooyyooyyoooooooo.',
    'oyyooyyooyyooyyooooooo..',
    '.oooooyyooyyooooooooo...',
    'oo..oo..oo..oo..oo......',
  ];
  const a = sprite([...head.slice(0, 3), ...wingsUp.map((w, i) => merge(w, head[3 + i])), ...body]);
  const b = sprite([...head.slice(0, 3), ...wingsDn.map((w, i) => merge(w, head[3 + i])), ...body]);
  return pack([a, b], 12, 14, 22, 12);
}
function merge(a, b) { let s = ''; for (let i = 0; i < Math.max(a.length, b.length); i++) { const x = a[i] || '.', y = b[i] || '.'; s += x !== '.' ? x : y; } return s; }

// Goblin archer — hooded sprig with a shortbow. 12×12. Frames: idle, draw (bow bent, arrow nocked), walk1, walk2.
export function bakeArcher() {
  const hood = ['....HHHH....', '...HHHHHH...', '..HHgeoggeH.', '..HHgggggg..', '...HgGGGg...'];
  const bodyIdle = ['..bbbbbb.w..', '..bbbbbb.w..', '..rrrrrr.w..', '..GG..GG....', '.GG....GG...'];
  const bodyDraw = ['..bbbbbbwww.', '..bbbbbbaaaw', '..rrrrrrwww.', '..GG..GG....', '.GG....GG...'];
  const walk1 = ['..bbbbbb.w..', '..bbbbbb.w..', '..rrrrrr.w..', '..GG.GG.....', '..GG..GG....'];
  const walk2 = ['..bbbbbb.w..', '..bbbbbb.w..', '..rrrrrr.w..', '...GGGG.....', '..GG..GG....'];
  const P2 = Object.assign({}, EP, { H: '#3f5a33', b: '#6b4a2a', a: '#e8dcc0' });
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  return pack([spr([...hood, ...bodyIdle]), spr([...hood, ...bodyDraw]), spr([...hood, ...walk1]), spr([...hood, ...walk2])], 6, 11, 8, 10);
}

// Bird — scatters from bushes. 6×4, two wing frames.
export function bakeBird() {
  const P2 = { b: '#3a3040', w: '#5a5068', y: '#e0b040' };
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  return pack([f(['w....w', '.wbbw.', '..bby.', '......']), f(['......', '..bby.', '.wbbw.', 'w....w'])], 4, 4, 6, 4);
}

// The Bullfrog King — 32×18. Frames: sit, inflated (croak), mouth open.
export function bakeFrog() {
  const P2 = { F: '#5a9a3a', D: '#3a6a2a', L: '#8fc85a', B: '#d8e0a0', e: '#f3f0d2', o: OUT, r: '#c9463d', R: '#8f2f28', y: '#e0b040', p: '#ff7a9a' };
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const sit = [
    '......yyy....................yyy',
    '.....DeeoD..................DeeoD',
    '....DFeeoFD................DFeeoFD',
    '...DFFFFFFFDDDDDDDDDDDDDDDDDFFFFFFFD',
    '..DFFLLFFFFFFFFFFFFFFFFFFFFFFFFLLFFD',
    '.DFFLLFFFFFFFFFFFFFFFFFFFFFFFFFFLLFFD',
    '.DFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD',
    'DFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD',
    'DFFFFRRRRRRRRRRRRRRRRRRRRRRRRRRRFFFFD',
    'DFFBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBFFD',
    '.DFBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBFD.',
    '.DDFFBBBBBBBBBBBBBBBBBBBBBBBBBBFFDD..',
    '..DFFFFDDD..DFFFFFFFFFFFD..DDDFFFFD..',
    '.DDFFFD......DDDDDDDDDDD......DFFFDD.',
    'DDDDDD..........................DDDDDD',
  ];
  const inflated = sit.map((r, i) => (i >= 8 && i <= 11) ? r.replace(/B/g, 'L') : r);
  const open = sit.map((r, i) => i === 8 ? r.replace(/R/g, 'r') : i === 9 ? r.replace(/B/g, 'r') : i === 10 ? r.replace(/B/g, 'R') : r);
  return pack([f(sit), f(inflated), f(open)], 19, 16, 32, 14);
}
