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
  { const c = F.idle[2], g2 = c.getContext('2d'); g2.fillStyle = '#dfe8ff'; g2.fillRect(BX + 4, BY + 4, 1, 1); }
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
  const look = sprite([head[0], head[1], '.gggeogge.', head[3], head[4], head[5], ...cloth, ...legs[0]]);
  return pack([...bobbed, look], 6, 11, 8, 10);
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
// Spike goblin (the 'thorn' kind) — a goblin in a spiked iron helm and back plate. 14×11, four-frame walk. Faces right.
export function bakeThornback() {
  const top = ['..S..S..S.....', '.SSSSSSSSSS...', '.SsssssssssS..', '..gggggeogg...', '..gggGGGGgg...'];
  const back = ['.S.S.SS.S.S...', 'SSSSSSSSSSSSS.', '.SrrrrrrrrrS..', '..rrrrrrrrr...'];
  const legs = [['..GG..GG......', '.GG....GG.....'], ['..GG.GG.......', '..GG..GG......'], ['...GGGG.......', '..GG..GG......'], ['..GG.GG.......', '.GG....GG.....']];
  return pack(legs.map(l => sprite([...top, ...back, ...l])), 7, 12, 12, 11);
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
  const hoodLook = [hood[0], hood[1], '..HHggeogge.', hood[3], hood[4]];
  return pack([spr([...hood, ...bodyIdle]), spr([...hood, ...bodyDraw]), spr([...hood, ...walk1]), spr([...hood, ...walk2]), spr([...hoodLook, ...bodyIdle])], 6, 11, 8, 10);
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

// Hopper — a marsh frog that leaps at you. 10×8. Frames: sit, leap.
export const HOPPER_COLORS = {
  green: { F: '#5a9a3a', D: '#3a6a2a', L: '#8fc85a', B: '#d8e0a0' },
  yellow: { F: '#d9b83a', D: '#9a7a1a', L: '#f5e07a', B: '#f7f0c0' },
  blue: { F: '#3a6aa0', D: '#244a78', L: '#6fa0d8', B: '#c8d8f0' },
};
export function bakeHopper(color = 'green') {
  const P2 = Object.assign({}, EP, HOPPER_COLORS[color] || HOPPER_COLORS.green);
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const sit = ['.eo....eo.', 'DFFFFFFFFD', 'FFLFFFFLFF', 'FBBBBBBBBF', '.DFFDDFFD.', '.DD....DD.'];
  const leap = ['.eo....eo.', 'DFFFFFFFFD', 'FFLFFFFLFF', 'FBBBBBBBBF', 'DFD....DFD', 'D........D'];
  return pack([f(sit), f(leap)], 6, 7, 9, 6);
}

// ---------- Stockade goblins ----------
// Sapper — sprig with a bomb held overhead. 10×13. Frames: run1, run2.
export function bakeSapper() {
  const bomb = ['....oo....', '...oooo...', '...oooo...', '....oo....'];
  const head = ['...gggg...', '..gggggg..', '.geoggeog.', '.gggggggg.', '..gGGGGg..'];
  const legs = [['..rrrrrr..', '..GG..GG..', '.GG....GG.'], ['..rrrrrr..', '..GG.GG...', '..GG..GG..']];
  const spr = rows => outline(fromGrid(rows, EP, 1), OUT);
  return pack(legs.map(l => spr([...bomb, ...head, ...l])), 6, 14, 8, 13);
}
export function bakeBomb() { const c = outline(fromGrid(['.oo.', 'oooo', 'oooo', '.oo.'], { o: '#1b1626' }, 1), '#5f5a52'); return pack([c], 3, 3, 4, 4); }
// Brute — a big goblin with a club. 16×16. Frames: stand, walk, raise (overhead tell), swing.
export function bakeBrute() {
  const P2 = Object.assign({}, EP, { c: '#6b4a2a', C: '#4c2c17' });
  const head = ['.....gggggg.....', '....gggggggg....', '...ggeoggggeog..', '...gggggggggg...', '....ggGGGGgg....', '.....gggggg.....'];
  const body = ['...bbbbbbbbbb...', '..gbbbbbbbbbbg..', '..gbbbbbbbbbbg..', '...rrrrrrrrrr...', '...rrrrrrrrrr...'];
  const legsA = ['...GGG....GGG...', '...GGG....GGG...', '..GGGG....GGGG..'];
  const legsB = ['....GGG..GGG....', '....GGG..GGG....', '...GGGG..GGGG...'];
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  const pad = ['................', '................', '................', '................'];
  const stand = spr([...pad, ...head, ...body, ...legsA]);
  const walk = spr([...pad, ...head, ...body, ...legsB]);
  const raise = spr(['.......cccc.....', '......cCCCCc....', '......cCCCCc....', '.......cccc.....', ...head, ...body, ...legsA]);
  const swing = spr([...pad, ...head, body[0], body[1], body[2].slice(0, 13) + 'ccc', body[3].slice(0, 13) + 'cCC', body[4].slice(0, 13) + 'ccc', ...legsB]);
  return pack([stand, walk, raise, swing], 9, 19, 12, 16);
}
// War hound — low, fast. 14×7. Frames: run1, run2, leap.
export function bakeHound() {
  const P2 = Object.assign({}, EP, { h: '#5a4a3a', H: '#3a2e22' });
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  const body = ['..hhhhhhhhh.hh', '.hhhhhhhhhhhhh', 'hhhhhhhhhhhh..', 'hHhhhhhhhhhH..'];
  const a = spr(['...........eh.', ...body, '.HH.HH..HH.HH.', '.H...H..H...H.']);
  const b = spr(['...........eh.', ...body, '..HH.HH.HH.HH.', '..H...H.H...H.']);
  const l = spr(['...........eh.', ...body, 'HH.......HH...', 'H.........H...']);
  return pack([a, b, l], 8, 8, 12, 7);
}
// Fox — freed from a cage, fights for you a while. 12×6.
export function bakeFox() {
  const P2 = { f: '#d9782a', F: '#a0521a', w: '#fff6e0', e: '#1b1626' };
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  const a = spr(['.........fe.', 'ff...ffffff.', 'wffffffffff.', '.wffffffff..', '.FF..FF.FF..']);
  const b = spr(['.........fe.', 'ff...ffffff.', 'wffffffffff.', '.wffffffff..', '..FF.FF..FF.']);
  return pack([a, b], 6, 6, 10, 6);
}
// The Goblin Chieftain — helmed, huge, two-handed club. 24×21. Frames: stand, walk, raise, slam, sweep, grab.
export function bakeChief() {
  // The war chief: a horned iron helm, red war paint, a wolf-pelt pauldron, a trophy skull on the belt, a blood-red cloak.
  const P2 = Object.assign({}, EP, { c: '#6b4a2a', C: '#4c2c17', b: '#8f2f28', f: '#8a7a68', F: '#5a4e42', h: '#e8dcc0', q: '#5a1a1a', Q: '#3a1010' });
  const helm = ['....t...SSSSSSSS...t....', '.....t.SsssssssS..t.....', '......tSsssyysssSt......', '.......SssssssssS.......'];
  const head = ['.......ggeorrggeog......', '......ggrgggggggrgg.....', '.......ggGGGGGGgg.......', '........gggggggg........'];
  const body = ['...ffffbbbbbbbbbbbb.....', '..fFffgbbbbbbbbbbbbg....', '..fFf.gbbbhhbbbbbbbg....', '.qq...gbbbhhbbbbbbbg....', '.qq...rrrhhrrrrrrr......', '.qq...rrrrrrrrrrrr......'];
  const legsA = ['.qq...GGGG....GGGG......', '.q....GGGG....GGGG......', '.....GGGGG....GGGGG.....'];
  const legsB = ['.qq....GGGG..GGGG.......', '.q.....GGGG..GGGG.......', '......GGGGG..GGGGG......'];
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  const top = [...helm, ...head];
  const pad = ['........................', '........................', '........................', '........................'];
  const stand = spr([...pad, ...top, ...body, ...legsA]);
  const walk = spr([...pad, ...top, ...body, ...legsB]);
  const raise = spr(['..........ccccc.........', '.........cCCCCCc........', '.........cCCCCCc........', '..........ccccc.........', ...top, ...body, ...legsA]);
  const slam = spr([...pad, ...top, body[0], body[1], body[2], body[3].slice(0, 19) + 'ccccc', body[4].slice(0, 19) + 'cCCCC', body[5].slice(0, 19) + 'ccccc', ...legsB]);
  const sweep = spr([...pad, ...top, body[0], body[1].slice(0, 19) + 'ccccc', body[2].slice(0, 19) + 'cCCCC', body[3].slice(0, 19) + 'ccccc', body[4], body[5], ...legsB]);
  const grab = spr([...pad, ...top, body[0], body[1].slice(0, 19) + 'ggggg', body[2].slice(0, 19) + 'ggggg', body[3], body[4], body[5], ...legsB]);
  // sword and shield: round shield held out front, blade up behind it
  const swordUp = ['........................', '....................l...', '....................l...', '....................l...'];
  const guard = spr([...swordUp, helm[0], helm[1], helm[2], helm[3].slice(0, 20) + 'l...', head[0].slice(0, 20) + 'l...', head[1], head[2], head[3], body[0].slice(0, 18) + '.SSS..', body[1].slice(0, 18) + 'SsssS.', body[2].slice(0, 18) + 'SssyS.', body[3].slice(0, 18) + 'SsssS.', body[4].slice(0, 18) + '.SSS..', body[5], ...legsA]);
  const slash = spr([...pad, ...top, body[0], body[1].slice(0, 18) + 'llllll', body[2].slice(0, 18) + '.SSS..', body[3].slice(0, 18) + 'SsssS.', body[4].slice(0, 18) + '.SSS..', body[5], ...legsB]);
  // the bow: a tall curve out front, arrow nocked
  const bow = spr([...pad, ...top, body[0].slice(0, 19) + '.w...', body[1].slice(0, 19) + '..w..', body[2].slice(0, 18) + 'lll.w.', body[3].slice(0, 19) + '..w..', body[4].slice(0, 19) + '.w...', body[5], ...legsA]);
  const leap = spr([...pad, ...top, ...body, '.....GGGGG..GGGGG.......', '......GGG....GGG........', '........................']);
  // walk cycles: legs alternate and the body drops a row on the passing step (one extra blank row on top, last leg row trimmed)
  const pad5 = [...pad, '........................'];
  const legsC = ['......GGGG....GGGG......', '.....GGGGG....GGGGG.....'];
  const stand2 = spr([...pad5, ...top, ...body, ...legsC]);
  const guardRows = [helm[0], helm[1], helm[2], helm[3].slice(0, 20) + 'l...', head[0].slice(0, 20) + 'l...', head[1], head[2], head[3], body[0].slice(0, 18) + '.SSS..', body[1].slice(0, 18) + 'SsssS.', body[2].slice(0, 18) + 'SssyS.', body[3].slice(0, 18) + 'SsssS.', body[4].slice(0, 18) + '.SSS..', body[5]];
  const guardWalk = spr([...swordUp, ...guardRows, ...legsB]);
  const guardWalk2 = spr(['........................', ...swordUp, ...guardRows, ...legsC]);
  const bowRows = [...top, body[0].slice(0, 19) + '.w...', body[1].slice(0, 19) + '..w..', body[2].slice(0, 18) + 'lll.w.', body[3].slice(0, 19) + '..w..', body[4].slice(0, 19) + '.w...', body[5]];
  const bowWalk = spr([...pad, ...bowRows, ...legsB]);
  const bowWalk2 = spr([...pad5, ...bowRows, ...legsC]);
  return pack([stand, walk, raise, slam, sweep, grab, guard, slash, bow, leap, stand2, guardWalk, guardWalk2, bowWalk, bowWalk2], 12, 22, 16, 18);
}

// ---------- Sporewood ----------
const SP = Object.assign({}, EP, { m: '#9a5aa8', M: '#6a3a7a', t: '#e8e0f0', c: '#4aa0b0', C: '#2a6a7a', v: '#7a5aa8', V: '#4a2a6a', k: '#f0e6c8' });
const sspr = rows => outline(fromGrid(rows, SP, 1), OUT);
// Sporeling — a walking cap. 10×10, two frames.
export function bakeSporeling() {
  const cap = ['...mmmm...', '..mmtmmm..', '.mmmmmmtm.', 'mmmmmmmmmm', '.MMMMMMMM.'];
  const a = sspr([...cap, '..kkkkkk..', '..keokkok.', '..kkkkkk..', '..kk..kk..', '.kk....kk.']);
  const b = sspr([...cap, '..kkkkkk..', '..keokkok.', '..kkkkkk..', '...kkkk...', '..kk..kk..']);
  return pack([a, b], 6, 11, 8, 10);
}
// Lurker — looks like a scenery mushroom until it lunges. 14×12: frame 0 hidden, frame 1 mouth open.
export function bakeLurker() {
  const cap = ['....vvvvvv....', '..vvvtvvvvtv..', '.vvvvvvvvvvvv.', 'vvvvvvvvvvvvvv', '.VVVVVVVVVVVV.'];
  const a = sspr([...cap, '...kkkkkkkk...', '...kkkkkkkk...', '...kkkkkkkk...', '...kkkkkkkk...', '...kkkkkkkk...', '..kkkkkkkkkk..']);
  const b = sspr([...cap, '...kkkkkkkk...', '..kkeokkeokk..', '..kRRRRRRRRk..', '..kRrrrrrrRk..', '...kRRRRRRk...', '..kkkkkkkkkk..']);
  return pack([a, b], 8, 13, 12, 12);
}
// Spore drone — a floating puffball with a dark eye. 10×8, two frames (breathing).
export function bakeDrone() {
  const a = sspr(['...tttt...', '..tttttt..', '.ttteottt.', '.tttttttt.', '..tttttt..', '...tttt...']);
  const b = sspr(['..tttttt..', '.tttttttt.', 'ttttteottt', 'tttttttttt', '.tttttttt.', '..tttttt..']);
  return pack([a, b], 6, 7, 9, 7);
}
// Toad shaman — a toadstool that walks, wears a bone circlet, casts. 14×13: idle, cast.
export function bakeShaman() {
  const cap = ['....cccccc....', '..ccctccctcc..', '.cccccccccccc.', 'cctccccctccccc', 'cccccccccccccc', '.CCCCCCCCCCCC.'];
  const stem = ['...kkkkkkkk...', '...kokkkkok...', '...kkkkkkkk...', '...kkkGGkkk...', '...kkkkkkkk...', '..kk......kk..', '.kk........kk.'];
  const cast = ['..tkkkkkkkkt..', '..tkokkkkokt..', '...kkkkkkkk...', '...kkGGGGkk...', '...kkkkkkkk...', '..kk......kk..', '.kk........kk.'];
  return pack([sspr([...cap, ...stem]), sspr([...cap, ...cast])], 8, 14, 12, 13);
}

// ---------- Kingswood ----------
const KG = Object.assign({}, EP, { h: '#5a4a3a', H: '#3a2e22', q: '#5a1a1a', Q: '#3a1010', f: '#8a7a68', F: '#5a4e42', a: '#e8dcc0', x: '#c9b27c', z: '#7a5a2a' });
const kspr = rows => outline(fromGrid(rows, KG, 1), OUT);
// Thief — a goblin with a sack, hunched. 10×11. Frames: run1, run2, look.
export function bakeThief() {
  const head = ['...gggg...', '..gggggg..', '.geoggeog.', '.gggggggg.', '..gGGGGg..'];
  const sack = ['.zzz.rrrr.', 'zzzzzrrrr.', 'zzzzzrrrr.', '.zzz.rrrr.'];
  const run1 = ['..GG.GG...', '.GG...GG..'], run2 = ['...GGG....', '..GG.GG...'];
  const look = kspr([head[0], head[1], '.gggeogge.', head[3], head[4], ...sack, '..GG..GG..', '.GG....GG.']);
  return pack([kspr([...head, ...sack, ...run1]), kspr([...head, ...sack, ...run2]), look], 6, 12, 8, 11);
}
// Pikeman — a goblin behind a long pike. 22×12. Frames: guard, thrust.
export function bakePike() {
  const head = ['...gggg...............', '..gggggg..............', '.geoggeog.............', '.gggggggg.............', '..gGGGGg..............'];
  const bodyG = ['..bbbbbb.hhhhhhhhhhhss', '..bbbbbb..............', '..rrrrrr..............', '..GG..GG..............', '.GG....GG.............'];
  const bodyT = ['..bbbbbb..............', '..bbbbbbhhhhhhhhhhhhss', '..rrrrrr..............', '...GG.GG..............', '..GG...GG.............'];
  return pack([kspr([...head, ...bodyG]), kspr([...head, ...bodyT])], 6, 11, 10, 12);
}
// Townsfolk — small unarmed goblins in aprons and hoods, two colours. 8×9. Frames: run1, run2, cower.
export function bakeFolk(alt) {
  const P2 = Object.assign({}, KG, alt ? { x: '#b8c8e0', r: '#5a6a9a' } : {});
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const head = ['..gggg..', '.geogeo.', '.gggggg.', '..gGGg..'];
  return pack([f([...head, '.xxxxxx.', '.xxxxxx.', '.GG.GG..', 'GG...GG.']), f([...head, '.xxxxxx.', '.xxxxxx.', '..GGG...', '.GG.GG..']), f(['........', '..gggg..', '.geogeo.', '.gggggg.', '.xxxxxx.', 'xxxxxxxx', '.GG.GG..', '........'])], 4, 10, 6, 9);
}
// Hound Master — a big goblin in a fur cloak on a great hound. 24×16 mounted (2 run frames); on foot 12×14 (stand, whip).
export function bakeMaster() {
  const rider = ['........gggggg..........', '.......fggeoggf.........', '.......ffggggff.........', '......fffbbbbbff........', '.......ffbbbbff.........'];
  const houndA = ['...hhhhhhhhhhhhhh.h.....', '..hhhhhhhhhhhhhhhhhh..hh', '.hHhhhhhhhhhhhhhhhhhhhh.', 'hHh..hhhhhhhhhhhhhhh.eh.', '.HH.HH.......HH.HH......', '.H...H.......H...H......'];
  const houndB = ['...hhhhhhhhhhhhhh.h.....', '..hhhhhhhhhhhhhhhhhh..hh', '.hHhhhhhhhhhhhhhhhhhhhh.', 'hHh..hhhhhhhhhhhhhhh.eh.', '..HH.HH.....HH.HH.......', '..H...H.....H...H.......'];
  const mA = kspr([...rider, ...houndA]), mB = kspr([...rider, ...houndB]);
  const footHead = ['....gggggg..', '...fggeoggf.', '...ffggggff.'];
  const stand = kspr([...footHead, '..fffbbbbff.', '...ffbbbbff.', '....rrrrrr..', '....GG..GG..', '...GG....GG.']);
  const whip = kspr([...footHead, '..fffbbbbffz', '...ffbbbbffzz', '....rrrrrr.zz', '....GG..GG..', '...GG....GG.']);
  return { mounted: pack([mA, mB], 12, 12, 20, 16), foot: pack([stand, whip], 6, 9, 10, 14) };
}
// King Gorm Underleaf — seated on the throne (24×20: idle, throw, shout) and standing (24×26: stand, slam).
export function bakeKing() {
  const KP2 = Object.assign({}, KG, { y: '#ffd36b', c: '#c9463d', C: '#8f2f28', t: '#e8dcc0' });
  const k = rows => outline(fromGrid(rows, KP2, 1), OUT);
  const crown = ['.......y.y.y.y..........', '.......yyyyyyy..........'];
  const face = ['......ggggggggg.........', '.....ggeogggeogg........', '.....gggggggggg.........', '......ggGGGGGgg.........', '.......ggggggg..........'];
  const seated = ['....cccccccccccc........', '...ccccccccccccc........', '..cccccccccccccc........', '..cccyyyycccccc.........', '.ttt.cccccccccc.........', '.ttt.cccccccccc.........', '....GGGG..GGGG..........', '....GGGG..GGGG..........'];
  const seatedThrow = ['....cccccccccccc..yy....', '...ccccccccccccc.yy.....', '..ccccccccccccccff......', '..cccyyyycccccc.........', '.ttt.cccccccccc.........', '.ttt.cccccccccc.........', '....GGGG..GGGG..........', '....GGGG..GGGG..........'];
  const shoutFace = ['......ggggggggg.........', '.....ggeogggeogg........', '.....gggggggggg.........', '......ggRRRRRgg.........', '.......ggRRRgg..........'];
  const idle = k([...crown, ...face, ...seated]), thr = k([...crown, ...face, ...seatedThrow]), sh = k([...crown, ...shoutFace, ...seated]);
  const standBody = ['....cccccccccccc........', '...ccccccccccccc........', '..cccccccccccccc........', '..cccyyyycccccc.........', '..ccccccccccccc.........', '..ccccccccccccc.........', '...cccccccccccc.........', '....rrrrrrrrrr..........', '....GGGG..GGGG..........', '....GGGG..GGGG..........', '...GGGGG..GGGGG.........'];
  const slamBody = ['....cccccccccccc.zzzz...', '...ccccccccccccczzzzzz..', '..ccccccccccccccczzzz...', '..cccyyyycccccc.........', '..ccccccccccccc.........', '..ccccccccccccc.........', '...cccccccccccc.........', '....rrrrrrrrrr..........', '....GGGG..GGGG..........', '....GGGG..GGGG..........', '...GGGGG..GGGGG.........'];
  const pad3 = ['........................', '........................', '........................'];
  return { seated: pack([idle, thr, sh], 11, 16, 18, 15), standing: pack([k([...pad3, ...crown, ...face, ...standBody]), k([...crown, ...face, ...slamBody, '........................', '........................', '........................'])], 11, 22, 18, 21) };
}
