// chars.js — the knight and the forest's enemies, baked from text grids + drawn sword.
import { canvas, px, rect, line, circle, ellipse, fillPoly, fromGrid, outline, flipX, whiten } from './px.js';
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
let BODY_REF = BODY, PLUME_REF = PLUME; // swapped while another hero bakes on the same rig
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
  // on a ladder: one knee up on the higher rung, the other leg straight down to the lower one, then the other way
  climbA:['.SS.SSS...', '.SS..SW...', '.ww.WWW...', '.ww.......', 'WWW.......'],
  climbB:['.SSSS.SS..', '.WWW..SS..', '......ww..', '......ww..', '.....WWW..'],
};
const W = 28, H = 28, BX = 8, BY = 3; // body drawn at (BX,BY); feet bottom at BY+16 = 19
export const KNIGHT_ANCHOR = { ax: 13, ay: 19 };

function knightFrame({ legs = 'stand', dy = 0, dx = 0, sword = null, arm = null, plume = 0, shield = false, legsDy = 0, staff = null, maul = null, glow = null }) {
  const [c, g] = canvas(W, H);
  const draw = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const k = r[x]; if (k !== '.' && KP[k]) px(g, ox + x, oy + y, KP[k]); } });
  const body = PLUME_REF[plume].concat(BODY_REF.slice(3));
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
  if (staff) { // a wooden staff with an ember at its head
    const [x0, y0, x1, y1] = staff.map((v, i) => v + (i & 1 ? dy : dx));
    line(g, x0, y0, x1, y1, KP.w, 2); px(g, x1, y1, KP.y); px(g, x1 + Math.sign(x1 - x0), y1 + Math.sign(y1 - y0), KP.r); px(g, x1 - Math.sign(y1 - y0), y1 + Math.sign(x1 - x0), KP.r);
  }
  if (maul) { // the paladin's maul: an oak haft, and a steel head set across the end of it with a gold band
    const [x0, y0, x1, y1] = maul.map((v, i) => v + (i & 1 ? dy : dx));
    line(g, x0, y0, x1, y1, '#6a4428', 2);
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, qx = -(y1 - y0) / len, qy = (x1 - x0) / len;
    line(g, Math.round(x1 - qx * 4), Math.round(y1 - qy * 4), Math.round(x1 + qx * 4), Math.round(y1 + qy * 4), KP.s, 4);
    line(g, Math.round(x1 - qx * 4), Math.round(y1 - qy * 4), Math.round(x1 + qx * 4), Math.round(y1 + qy * 4), KP.S, 1);
    px(g, Math.round(x1), Math.round(y1), KP.y); px(g, Math.round(x1 + qx), Math.round(y1 + qy), KP.y); px(g, Math.round(x1 - qx), Math.round(y1 - qy), KP.y);
  }
  if (glow) { const [gx, gy] = glow; px(g, gx + dx, gy + dy, '#fff6c8'); px(g, gx + dx - 1, gy + dy, KP.y); px(g, gx + dx + 1, gy + dy, KP.y); px(g, gx + dx, gy + dy - 1, KP.y); px(g, gx + dx, gy + dy + 1, KP.y); }
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
    climb: [
      knightFrame({ legs: 'climbA', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 7], sword: [sh[0] - 3, sh[1] - 3, sh[0] - 7, sh[1] + 7], plume: 0 }),
      knightFrame({ legs: 'climbB', dy: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], sword: [sh[0] - 3, sh[1] - 3, sh[0] - 7, sh[1] + 7], plume: 1 }),
    ],
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
    // HOLD THE SWING: it goes up over his head, and then it comes down through whatever is in front of him
    heavy: [
      knightFrame({ dx: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 2, sh[1] - 5], sword: [sh[0] - 2, sh[1] - 5, sh[0] + 1, sh[1] - 19], plume: 2 }),
      knightFrame({ dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 1], sword: [sh[0] + 4, sh[1] - 1, sh[0] + 15, sh[1] + 5], plume: 2 }),
      knightFrame({ dx: 3, legs: 'wide', dy: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], sword: [sh[0] + 3, sh[1] + 4, sh[0] + 11, sh[1] + 15], plume: 0 }),
    ],
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
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR };
}

// ---------- enemies ----------
const EP = { n: '#5a3a24', N: '#3a2214', t: '#e8dcc0', T: '#b8a888', g: '#6faa4a', G: '#3f6e2c', e: '#f3f0d2', o: OUT, r: '#c9463d', R: '#8f2f28', s: '#c9d1dc', S: '#7c8797', b: '#5d4a8a', w: '#8a5a32', W: '#5c3a1d', y: '#e0b040', k: '#f0e6c8', K: '#cdbf9a', p: '#ff9a5c', d: '#2a2f3d', l: '#dfe8ff' };
const sprite = rows => outline(fromGrid(rows, EP, 1), OUT);
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
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
  // HURT: the head snaps back, the mouth opens, the knees give
  const hurt = sprite(['..........', '...gggg...', '..gggggg..', '.goggggog.', '.ggg..ggg.', '..gGGGGg..', '..rrrrrr..', '.rrrrrr...', '.GG...GG..', 'GG.....GG.']);
  return pack([...bobbed, look, hurt], 6, 11, 8, 10);
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

// Hornet Queen - a crowned hornet in three segments: a striped abdomen, a furred thorax, and a head of eyes under a circlet.
// 24x12, facing right. Frames: 0 flap up, 1 flap down, 2 aim (reared, abdomen dropped, legs tucked), 3 dive (raked head-down),
// 4 volley (abdomen curled under, the sting at the floor), 5 slam hang (wings flat, braced), 6 winded (down, wings crumpled), 7 sweep (low and level).
export function bakeQueen() {
  const QP = Object.assign({}, EP, { Y: '#fff1a0', c: '#ffd34a', C: '#c9962a', L: '#9ab0d8', v: '#8fd160', d: '#6a4a2a', D: '#3a2618', r: '#ff6b3a', R: '#c9463d' });
  const q = rows => outline(fromGrid(rows, QP, 1), OUT);
  const P = '........................';
  const crownPts = '.................c.c.c..', crownBand = '................ccCccc..';
  const brow = '................dddddd..', eyeA = '...............drrRRrrd.', eyeB = '...............drrRRrrd.', jaw = '................dDDDDd..';
  const thx = [
    '...........Dddddd.......',
    'DyYyyYyyYyDdddddd.......',
    'yYyyYyyYyyDdddddd.......',
    'DyYyyYyyYyDDddddD.......',
    '.DyyDDyyDDD.............',
  ];
  const legs = 'D...dd..dd..dd..........', legsTuck = 'D.....Dd.dd.dD..........', legsSplay = 'D..d...d..d...d.........';
  const wUp = ['....llll.lllll..........', '..lLllllLlllll..........', '.llllLllllll............'];
  const wDn = [P, '...llll.lllll...........', '..lLllllLllll...........'];
  const wHi = ['..lll.llll..............', '.lLlllllLlll............', '..llllLlllll............'];
  const wFlat = [P, 'llllllLlllllll..........', '.lLlllllLllll...........'];
  const hover = w => q([crownPts, crownBand, merge(w[0], brow), merge(w[1], eyeA), merge(w[2], eyeB), jaw, ...thx, legs]);
  // 2 aim: she rears, head high, abdomen swung down behind her, legs pulled in
  const aim = q([
    crownPts, crownBand,
    merge(wHi[0], brow), merge(wHi[1], eyeA), merge(wHi[2], eyeB),
    '.....DdddddD....dDDDDd..',
    '..DyYyyYyyYyD...........',
    '.DyYyyYyyYyyD...........',
    '..DyYyyYyyYD............',
    '...DyyDDyyD.............',
    '....DDyyD...............',
    legsTuck,
  ]);
  // 3 dive: raked from top-left to bottom-right, wings swept to stubs
  const dive = q([
    '..ll....................',
    '..lLll..................',
    'DyYyyYyD................',
    '.yYyyYyyYD..............',
    '..DyYyyYyyD.............',
    '....Ddddddd..c.c.c......',
    '.......DddddccCccc......',
    '..........ddddddddd.....',
    '..........ddrrRRrrd.....',
    '..........ddrrRRrrd.....',
    '...........dDDDDd.......',
    P,
  ]);
  // 4 volley: hanging, the abdomen curled under her, the sting pointed at the floor
  const volley = q([
    crownPts, crownBand,
    merge(wUp[0], brow), merge(wUp[1], eyeA), merge(wUp[2], eyeB), jaw,
    '..........Ddddddd.......',
    '..DyYyyYyyDdddddd.......',
    '...DyYyyYyDDddddD.......',
    '....DyYyyYD.............',
    '.....DyyDD..............',
    '......DvD...............',
  ]);
  // 5 slam hang: wings out flat, legs braced under her, the whole body compressed
  const slam = q([
    P, crownPts, crownBand,
    merge(wFlat[1], eyeA), merge(wFlat[2], eyeB), jaw, ...thx, legs,
  ]);
  // 6 winded: on the floor, wings crumpled, head drooped, legs splayed
  const winded = q([
    P, P,
    '..ll..ll................',
    '..lLl.lLl.......c.c.c...',
    '.....DdddddD...ccCccc...',
    'DyYyyYyyYyDdddd.dddddd..',
    'yYyyYyyYyyDdddddrrRRrrd.',
    'DyYyyYyyYyDDdddddrrRRrd.',
    '.DyyDDyyDDD......dDDDd..',
    legsSplay,
    P, P,
  ]);
  // 7 sweep: low and level, wings streaming back behind her
  const sweep = q([
    P, P,
    '.lL.....................',
    '.llll...........c.c.c...',
    '..lLllL........ccCccc...',
    '.....DdddddD....dddddd..',
    'DyYyyYyyYyDdddddrrRRrrd.',
    'yYyyYyyYyyDdddddrrRRrrd.',
    'DyYyyYyyYyDDddddDDDDDd..',
    '.DyyDDyyDDD.............',
    '....dd..dd..dd..........',
    P,
  ]);
  return pack([hover(wUp), hover(wDn), aim, dive, volley, slam, winded, sweep], 12, 14, 22, 12);
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
  const pad = '.'.repeat(38);
  // The leap reads in the whole body, not the feet: he squashes to gather, stretches in the air, splats on landing.
  // 3 crouch: two body rows out, padded down. He is low and wide and about to go.
  const crouch = [pad, pad, ...sit.slice(0, 6), ...sit.slice(8, 12),
    '..DFFFFFDD..DFFFFFFFFFFFD..DDFFFFFD..',
    '.DDFFFFFD....DDDDDDDDDDD....DFFFFFDD.',
    'DDDFFDDDD..................DDDDFFDDD.'];
  // 4 leap: two body rows in, and the legs trail straight down under him
  const leap = [...sit.slice(0, 7), sit[6], sit[6], ...sit.slice(7, 12),
    '...DFFFD.....DFFFFFFFFD.....DFFFD....',
    '...DFFFD......DDDDDDDD......DFFFD....',
    '...DFFD........................DFFD..',
    '...DDD..........................DDD..'];
  // 5 land: three rows out and the legs thrown wide. He hits the boards flat.
  const land = [pad, pad, pad, pad, ...sit.slice(0, 5), ...sit.slice(8, 12),
    'DFFFFDD.....DFFFFFFFFFFFD.....DDFFFFD',
    'DDDDDD.........DDDDDDDDD........DDDDD'];
  // 6 dazed: down on the boards, the eyes gone, the mouth hanging open
  const dazed = [pad, pad, pad,
    '.....DDDDD..................DDDDD....',
    '....DFDDDFD................DFDDDFD...',
    ...sit.slice(3, 8),
    'DFFFFrrrrrrrrrrrrrrrrrrrrrrrrrrrFFFFD',
    'DFFrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrFFD',
    '.DFRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRFD.',
    'DFFFFDD.....DFFFFFFFFFFFD.....DDFFFFD'];
  return pack([f(sit), f(inflated), f(open), f(crouch), f(leap), f(land), f(dazed)], 19, 16, 32, 14);
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
  const crouch = ['..........', '.eo....eo.', 'DFFFFFFFFD', 'FFLFFFFLFF', 'FBBBBBBBBF', 'DDFFDDFFDD'];
  const fall = ['.eo....eo.', 'DFFFFFFFFD', 'FFLFFFFLFF', 'FBBBBBBBBF', '.DFD..DFD.', '..D....D..'];
  return pack([f(sit), f(leap), f(crouch), f(fall)], 6, 7, 9, 6);
}

// ---------- Stockade goblins ----------
// Sapper — sprig with a bomb held overhead. 10×13. Frames: run1, run2.
export function bakeSapper() {
  const bomb = ['....oo....', '...oooo...', '...oooo...', '....oo....'];
  const head = ['...gggg...', '..gggggg..', '.geoggeog.', '.gggggggg.', '..gGGGGg..'];
  const legs = [['..rrrrrr..', '..GG..GG..', '.GG....GG.'], ['..rrrrrr..', '..GG.GG...', '..GG..GG..'], ['..rrrrrr..', '...GGG....', '..GG.GG...'], ['..rrrrrr..', '..GG.GG...', '.GG...GG..']];
  const spr = rows => outline(fromGrid(rows, EP, 1), OUT);
  const arms = [['..........', 'g........g', '.g......g.', '..........'], ['..........', '.g......g.', 'g........g', '..........']];
  return pack([...legs.map(l => spr([...bomb, ...head, ...l])), spr([...arms[0], ...head, ...legs[0]]), spr([...arms[1], ...head, ...legs[2]])], 6, 14, 8, 13);
}
export function bakeBomb() { const c = outline(fromGrid(['.oo.', 'oooo', 'oooo', '.oo.'], { o: '#1b1626' }, 1), '#5f5a52'); return pack([c], 3, 3, 4, 4); }
// Brute — a big goblin with a club. 16×16. Frames: stand, walk, raise (overhead tell), swing.
export function bakeBrute() {
  const P2 = Object.assign({}, EP, { c: '#8a6438', C: '#5a3c1c', v: '#7ab558' });
  //                        18 wide, hunched: the shoulders are the widest part of him
  const head = ['.....gggggggg.....', '....gggggggggg....', '...ggeoggggeogg...', '...ggggggggggggg..', '....gtGGGGGGtg....', '.....gggggggg.....'];
  const shldr = ['..GGGgggggggGGG...', '.GGGGGggggGGGGGG..', 'GGGvGGGGGGGGGvGGG.'];
  const body = ['.GbbbbbbbbbbbbbG..', '.GbbbbrrrrbbbbbG..', '..GbbbbbbbbbbG....', '..rrrrrrrrrrrr....'];
  const legsA = ['...GGGG....GGGG...', '...GGGG....GGGG...', '..GGGGG....GGGGG..'];
  const legsB = ['....GGGG..GGGG....', '....GGGG..GGGG....', '...GGGGG..GGGGG...'];
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  const pad = ['..................', '..................', '..................', '..................'];
  // the club, carried low in his right fist, its head down by his shin
  const low = rows => { const o = rows.slice(); o[o.length - 3] = o[o.length - 3].slice(0, 15) + 'ccc'; o[o.length - 2] = o[o.length - 2].slice(0, 15) + 'cCC'; o[o.length - 1] = o[o.length - 1].slice(0, 15) + 'cCc'; return o; };
  const stand = spr(low([...pad, ...head, ...shldr, ...body, ...legsA]));
  const walk = spr(low([...pad, ...head, ...shldr, ...body, ...legsB]));
  const raise = spr(['.......cccc.......', '......cCCCCc......', '......cCCCCc......', '.......cccc.......', ...head, ...shldr, ...body, ...legsA]);
  const swing = spr([...pad, ...head, ...shldr, body[0], body[1].slice(0, 15) + 'ccc', body[2].slice(0, 14) + 'cCCc', body[3].slice(0, 14) + 'ccc.', ...legsB]);
  return pack([stand, walk, raise, swing], 10, 21, 14, 18);
}
// War hound — low, fast. 14×7. Frames: run1, run2, leap.
export function bakeHound(pal = {}) {
  const P2 = Object.assign({}, EP, { h: '#5a4a3a', H: '#3a2e22' }, pal);
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
  const c2 = sspr(['..........', ...cap, '..kkkkkk..', '..keokkok.', '..kk..kk..', '..kk..kk..']);
  const d = sspr([...cap, '..kkkkkk..', '..keokkok.', '..kkkkkk..', '..kkk.kk..', '.kk...kk..']);
  // HURT: the cap crushes down over the stalk and it folds at the foot
  const hurt = sspr(['..........', '..mmmmmm..', '.mmmtmmmm.', 'mmmmmmmmmm', '.MMMMMMMM.', '..kkkkkk..', '..koookok.', '..kk..kk..', '.kk....kk.', '..........']);
  return pack([a, b, c2, d, hurt], 6, 11, 8, 10);
}
// Lurker — looks like a scenery mushroom until it lunges. 14×12: frame 0 hidden, frame 1 mouth open.
export function bakeLurker() {
  const cap = ['....vvvvvv....', '..vvvtvvvvtv..', '.vvvvvvvvvvvv.', 'vvvvvvvvvvvvvv', '.VVVVVVVVVVVV.'];
  const a = sspr([...cap, '...kkkkkkkk...', '...kkkkkkkk...', '...kkkkkkkk...', '...kkkkkkkk...', '...kkkkkkkk...', '..kkkkkkkkkk..']);
  const b = sspr([...cap, '...kkkkkkkk...', '..kkeokkeokk..', '..kRRRRRRRRk..', '..kRrrrrrrRk..', '...kRRRRRRk...', '..kkkkkkkkkk..']);
  const half = sspr([...cap, '...kkkkkkkk...', '..kkeokkeokk..', '..kkkkkkkkkk..', '..kRRRRRRRRk..', '...kkkkkkkk...', '..kkkkkkkkkk..']);
  return pack([a, b, half], 8, 13, 12, 12);
}
// SPITCAP — a tall rooted mushroom with a bladder for a cap. It swells, then lobs a spore bomb over your head.
// 12×14. Frames: rest, swell (the bladder up and tight), spit (the bladder collapsed and the mouth open).
export function bakeSpitcap() {
  const stalk = ['...kkkkkk...', '...kkkkkk...', '...kokkok...', '...kkkkkk...', '...kkkkkk...', '..kk....kk..', '.kk......kk.'];
  const rest = sspr(['....mmmm....', '..mmmmmmmm..', '.mmmtmmmtmm.', '.MMMMMMMMMM.', ...stalk]);
  const swell = sspr(['...mmmmmm...', '.mmmmmmmmmm.', 'mmmtmmmmtmmm', 'mmmmmmmmmmmm', '.MMMMMMMMMM.', ...stalk.slice(1)]);
  const spit = sspr(['............', '....mmmm....', '..mmMMMMmm..', '.mmMMttMMmm.', '.MMMMMMMMMM.', ...stalk.slice(1)]);
  return pack([rest, swell, spit], 6, 15, 12, 14);
}
// WEAVER — the pale spider that hangs in the fungus. Fatter and softer than a wood spider, and it spits its
// web at you instead of dropping on you. 12×9. Frames: hang, spit, scuttle1, scuttle2.
export function bakeWeaver() {
  const WP = Object.assign({}, EP, { b: '#c8bcd0', B: '#8a7e9a', r: '#ff4a3a', l: '#6a6278' });
  const w = rows => outline(fromGrid(rows, WP, 1), OUT);
  const hang = w(['.....bb.....', '..l.bbbb.l..', '.l.bBBBBb.l.', 'l.bbrbbrbb.l', '.lbBBBBBBbl.', 'l..bbbbbb..l', '.l..bbbb..l.', 'l...l..l...l']);
  const spit = w(['.....bb.....', '.l..bbbb..l.', 'l..bbrrbb..l', '.lbbrbbrbbl.', 'l.bBBBBBBb.l', '.l.bbbbbb.l.', 'l...bbbb...l', '.l..l..l..l.']);
  const sc1 = w(['l....bb....l', '.l..bbbb..l.', '..lbBBBBbl..', '..bbrbbrbb..', '.lbBBBBBBbl.', 'l..bbbbbb..l', '....bbbb....', '...l....l...']);
  const sc2 = w(['.l...bb...l.', 'l...bbbb...l', '.l.bBBBBb.l.', '..bbrbbrbb..', '..lbBBBBbl..', '.l.bbbbbb.l.', 'l...bbbb...l', '....l..l....']);
  return pack([hang, spit, sc1, sc2], 7, 9, 10, 8);
}
// Spore drone — a floating puffball with a dark eye. 10×8, two frames (breathing).
export function bakeDrone() {
  const a = sspr(['...tttt...', '..tttttt..', '.ttteottt.', '.tttttttt.', '..tttttt..', '...tttt...']);
  const b = sspr(['..tttttt..', '.tttttttt.', 'ttttteottt', 'tttttttttt', '.tttttttt.', '..tttttt..']);
  const blink = sspr(['...tttt...', '..tttttt..', '.tttoottt.', '.tttttttt.', '..tttttt..', '...tttt...']);
  const mid = sspr(['..tttttt..', '.tttttttt.', '.ttteottt.', 'tttttttttt', '.tttttttt.', '..tttttt..']);
  return pack([a, b, blink, mid], 6, 7, 9, 7);
}
// Toad shaman — a toadstool that walks, wears a bone circlet, casts. 14×13: idle, cast.
export function bakeShaman() {
  const cap = ['....cccccc....', '..ccctccctcc..', '.cccccccccccc.', 'cctccccctccccc', 'cccccccccccccc', '.CCCCCCCCCCCC.'];
  const stem = ['...kkkkkkkk...', '...kokkkkok...', '...kkkkkkkk...', '...kkkGGkkk...', '...kkkkkkkk...', '..kk......kk..', '.kk........kk.'];
  const cast = ['..tkkkkkkkkt..', '..tkokkkkokt..', '...kkkkkkkk...', '...kkGGGGkk...', '...kkkkkkkk...', '..kk......kk..', '.kk........kk.'];
  const walkA = [...stem.slice(0, 5), '...kk....kk...', '..kk.....kk...'], walkB = [...stem.slice(0, 5), '..kk....kk....', '...kk....kk...'];
  const cast2 = ['.t.kkkkkkkk.t.', 't.tkokkkkokt.t', '...kkkkkkkk...', '...kkGGGGkk...', '...kkkkkkkk...', '..kk......kk..', '.kk........kk.'];
  return pack([sspr([...cap, ...stem]), sspr([...cap, ...cast]), sspr([...cap, ...walkA]), sspr([...cap, ...walkB]), sspr([...cap, ...cast2])], 8, 14, 12, 13);
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
  const bodyB = ['..bbbbbb..............', 'hhbbbbbbhhhhhhhhss....', '..rrrrrr..............', '.GG..GG...............', 'GG....GG..............'];
  // HURT: the pike drops across him and the head goes back
  const hurtP = kspr(['......................', '...gggg...............', '..gggggg..............', '.goggggog.............', '..gGGGGg..............', '..bbbbbb.hhhh.........', '..bbbbbbhhhh..........', '..rrrrrr..............', '.GG...GG..............', 'GG.....GG.............']);
  return pack([kspr([...head, ...bodyG]), kspr([...head, ...bodyT]), kspr([...head, ...bodyB]), hurtP], 6, 11, 10, 12);
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

// KING GORM at three times the size: drawn with primitives, not a grid. Seated frames 72×48 (feet at the bottom edge), standing frames 64×64.
// Frames — seated: idle, throw, shout, reach (the grab), held. Standing: stand, walk, slam, reach, grab, lift, kneel.
export function bakeKingBig() {
  const SK = '#6faa4a', SKD = '#3f6e2c', RB = '#c9463d', RBD = '#8f2f28', RBL = '#e07060', FUR = '#e8dcc0', GLD = '#ffd36b', GLD2 = '#a07a1c', EYE = '#f3f0d2', BELT = '#3a2e22', TOOTH = '#fff6e0', WOOD = '#5c3a1d';
  const head = (g, x, y, mouth) => { // 30 wide, 22 tall; x,y = top-left. mouth: 0 shut, 1 open (shout), 2 gritted
    rect(g, x + 3, y, 24, 6, SK); rect(g, x, y + 4, 30, 14, SK); rect(g, x + 2, y + 18, 26, 4, SKD); // skull, jaw, underbite shadow
    rect(g, x + 1, y + 5, 3, 5, SKD); rect(g, x + 26, y + 5, 3, 5, SKD); // ear roots
    rect(g, x - 3, y + 3, 5, 7, SK); rect(g, x + 28, y + 3, 5, 7, SK); // ears
    rect(g, x + 6, y + 7, 6, 5, EYE); rect(g, x + 18, y + 7, 6, 5, EYE); rect(g, x + 9, y + 8, 2, 3, OUT); rect(g, x + 21, y + 8, 2, 3, OUT); // eyes
    rect(g, x + 5, y + 6, 8, 1, SKD); rect(g, x + 17, y + 6, 8, 1, SKD); // brows
    rect(g, x + 13, y + 11, 4, 3, SKD); // nose
    if (mouth === 1) { rect(g, x + 8, y + 15, 14, 6, RBD); rect(g, x + 9, y + 15, 2, 2, TOOTH); rect(g, x + 19, y + 15, 2, 2, TOOTH); rect(g, x + 13, y + 19, 4, 2, RBL); }
    else { rect(g, x + 8, y + 16, 14, 1, SKD); rect(g, x + 7, y + 15, 2, 3, TOOTH); rect(g, x + 21, y + 15, 2, 3, TOOTH); if (mouth === 2) rect(g, x + 10, y + 16, 10, 2, TOOTH); } // tusks up from the underbite
  };
  const crown = (g, x, y) => { rect(g, x, y + 3, 26, 5, GLD); rect(g, x, y + 7, 26, 1, GLD2); for (let i = 0; i < 5; i++) { rect(g, x + 1 + i * 6, y, 2, 4, GLD); px(g, x + 1 + i * 6, y, '#fff6e0'); } rect(g, x + 4, y + 4, 2, 2, RB); rect(g, x + 12, y + 4, 2, 2, '#4a90e0'); rect(g, x + 20, y + 4, 2, 2, '#4aa05a'); };
  const arm = (g, x, y, dx, dy, fist) => { // an upper arm from (x,y) to (x+dx,y+dy), 7 thick, a fist at the end
    line(g, x, y, x + dx, y + dy, RB, 7); line(g, x, y, x + dx, y + dy, RBD, 2); const fx = x + dx, fy = y + dy; rect(g, fx - 4, fy - 4, 9, 9, SK); rect(g, fx - 4, fy + 3, 9, 2, SKD); if (fist === 'open') { rect(g, fx + 4, fy - 5, 4, 2, SK); rect(g, fx + 4, fy - 1, 4, 2, SK); rect(g, fx + 4, fy + 3, 4, 2, SK); }
  };
  const sceptre = (g, x0, y0, x1, y1) => { line(g, x0, y0, x1, y1, WOOD, 3); circle(g, x1, y1, 4, GLD); circle(g, x1, y1, 2, RB); };
  const boots = (g, x, y, apart) => { rect(g, x, y, 12, 8, SKD); rect(g, x, y + 6, 13, 2, OUT); rect(g, x + apart, y, 12, 8, SKD); rect(g, x + apart, y + 6, 13, 2, OUT); };
  const robe = (g, x, y, w, h) => { rect(g, x, y, w, h, RB); rect(g, x + 2, y + 2, w - 4, 3, RBL); rect(g, x, y + h - 4, w, 4, RBD); rect(g, x - 2, y, w + 4, 4, FUR); for (let i = 0; i < w; i += 5) px(g, x + i, y + 1, '#c8bca0'); rect(g, x + 6, y + Math.floor(h / 2), w - 12, 4, BELT); rect(g, x + Math.floor(w / 2) - 3, y + Math.floor(h / 2) - 1, 6, 6, GLD); rect(g, x + Math.floor(w / 2) - 1, y + Math.floor(h / 2) + 1, 2, 2, GLD2); };
  const finish = c => outline(c, OUT);
  // ---- seated ----
  const seated = (pose) => { const [c, g] = canvas(72, 48);
    boots(g, 22, 40, 16); // feet on the litter
    robe(g, 14, 18, 44, 26); // the belly
    if (pose === 'throw') arm(g, 52, 22, 8, -16, 'fist'); else if (pose === 'reach') arm(g, 52, 24, 18, 6, 'open'); else arm(g, 52, 24, 6, 12, 'fist');
    if (pose !== 'reach') sceptre(g, 58, 36, 66, 10);
    arm(g, 18, 24, -6, 12, 'fist');
    head(g, 21, pose === 'held' ? 6 : 0, pose === 'shout' ? 1 : pose === 'reach' ? 2 : 0); crown(g, 23, pose === 'held' ? 2 : -4);
    return finish(c); };
  // ---- standing ----
  const standing = (pose) => { const [c, g] = canvas(64, 64);
    const kneel = pose === 'kneel', walk = pose === 'walk';
    if (kneel) { rect(g, 14, 52, 14, 10, SKD); rect(g, 36, 52, 14, 10, SKD); rect(g, 14, 60, 36, 2, OUT); } else boots(g, 16, 56, walk ? 22 : 18);
    const by = kneel ? 30 : 20; robe(g, 12, by, 40, kneel ? 24 : 36);
    if (pose === 'slam') { arm(g, 48, by + 4, 6, -22, 'fist'); sceptre(g, 54, by - 18, 38, by - 30); }
    else if (pose === 'reach') { arm(g, 48, by + 6, 16, 4, 'open'); }
    else if (pose === 'grab') { arm(g, 48, by + 6, 14, 10, 'fist'); }
    else if (pose === 'lift') { arm(g, 48, by + 4, 4, -20, 'open'); arm(g, 16, by + 4, -4, -20, 'open'); }
    else { arm(g, 48, by + 6, 4, 16, 'fist'); sceptre(g, 52, by + 26, 60, by - 6); }
    if (pose !== 'lift') arm(g, 16, by + 6, -4, 16, 'fist');
    head(g, 17, by - 20, pose === 'slam' ? 1 : pose === 'reach' || pose === 'grab' ? 2 : 0); crown(g, 19, by - 24);
    return finish(c); };
  return {
    seated: pack(['idle', 'throw', 'shout', 'reach', 'held'].map(seated), 36, 48, 54, 45),
    standing: pack(['stand', 'walk', 'slam', 'reach', 'grab', 'lift', 'kneel'].map(standing), 32, 64, 44, 60),
  };
}
// A hall chandelier: an iron ring of candles on a chain. 24×16, hangs from its top.
export function bakeChandelier() { const [c, g] = canvas(24, 16); rect(g, 11, 0, 2, 5, '#5a6270'); rect(g, 2, 9, 20, 3, '#3a3e48'); rect(g, 2, 9, 20, 1, '#8a919c'); for (let i = 0; i < 4; i++) { const x = 3 + i * 6; rect(g, x, 5, 2, 4, '#e8e0d0'); px(g, x, 4, '#ffd36b'); px(g, x + 1, 3, '#ff9a5c'); } rect(g, 4, 12, 16, 2, '#2a2c36'); return outline(c, OUT); }

// ---------- The Crags: hill folk and beasts ----------
const CP = Object.assign({}, EP, { h: '#8a8478', H: '#5a5448', f: '#e8e0d0', F: '#b8b0a0', v: '#7a5a8a', V: '#4a3a5a', c: '#5a4a3a', x: '#c9b27c', z: '#3a2e22', m: '#c9a83a' });
const cspr = rows => outline(fromGrid(rows, CP, 1), OUT);
// Crag harpy — a grey-winged diver with a hooked beak. 16×10. Frames: glide, flap, dive (wings folded), downed.
export function bakeHarpy() {
  const glide = cspr(['hh............hh', '.hhh........hhh.', '..hhhhhHHhhhh...', '....hhheehhh....', '.....hhmhhh.....', '......hhhh......', '.....H....H.....']);
  const flap = cspr(['................', '......hhhhh.....', '..hhhhhHHhhhhh..', 'hhh.hhheehhh.hhh', '.....hhmhhh.....', '......hhhh......', '.....H....H.....']);
  const dive = cspr(['................', '................', '......hheehh....', '.....hhhmhhhh...', '....hhhhhhhhhh..', '..hhhhhhhhhhhh..', '.hh.........hh..']);
  const down = cspr(['................', '................', '................', 'hhhh..hhhhhh.hhh', 'hhhhhhhheehhhhhh', '.hhhhhhhmhhhhh..', '..H..H....H..H..']);
  return pack([glide, flap, dive, down], 9, 7, 14, 7);
}
// Goat rider — a hill goblin on a shaggy crag goat. 16×13. Frames: run1, run2, buck (goat rearing), riderless goat run.
export function bakeGoatRider() {
  const rider = ['.......gggggg...', '......fggeoggf..', '......ffggggff..', '.....ffvvvvvff..', '......ffvvvvff..'];
  const goatBody = ['ff...ffffffff.ff', '.fffffffffffffff', 'ffFffffffffffe.f', 'fFF..ffffffff.zz'];
  const run1 = cspr([...rider, ...goatBody, '.zz.zz....zz.zz.', '.z...z....z...z.']);
  const run2 = cspr([...rider, ...goatBody, '..zz.zz..zz.zz..', '..z...z..z...z..']);
  const buck = cspr(['.......gggggg...', '......fggeoggf..', '......ffggggff..', '.....ffvvvvvff..', '......ffvvvvff..', '..........ffffff', '.....fffffffffef', 'ffFfffffffffff.z', 'fFFffffff.......', '.zz.zz..zz......', '.z...z..z.......']);
  const goat1 = cspr(['................', '................', '................', '................', '................', ...goatBody, '.zz.zz....zz.zz.', '.z...z....z...z.']);
  const goat2 = cspr(['................', '................', '................', '................', '................', ...goatBody, '..zz.zz..zz.zz..', '..z...z..z...z..']);
  return pack([run1, run2, buck, goat1, goat2], 9, 12, 14, 11);
}
// The Ram Lord — a bighorn the size of a cart, curled horns like millstones. 30×20. Frames: stand, run1, run2, lower (charge tell), crash (head in the wall), rear.
export function bakeRamLord() {
  const RP = Object.assign({}, CP, { f: '#d8d0c0', F: '#a8a090', m: '#c9a83a', M: '#8a6a1a', r: '#c9463d' });
  const r = rows => outline(fromGrid(rows, RP, 1), OUT);
  const horns = ['......mmm..............mmm....', '.....mMMmm............mmMMm...', '....mM..mmm..........mmm..Mm..', '....mM.mmmm..........mmmm.Mm..', '.....mmmmff..........ffmmmm...'];
  const head = ['.......fffffffffffffffff......', '......ffffffffffffffffffe.....', '......fFfffffffffffffffff.....', '.......ffffffffffffffff.......'];
  const bodyStand = ['.....fffffffffffffffffff......', '....ffffffffffffffffffff......', '....ffFFffffffffffFFffff......', '....ffFFffffffffffFFffff......', '....zz.zz........zz.zz........', '....zz.zz........zz.zz........'];
  const bodyRun1 = ['.....fffffffffffffffffff......', '....ffffffffffffffffffff......', '....ffFFffffffffffFFffff......', '...ffFFfffffffffffffFFff......', '..zz...zz......zz...zz........', '.zz.....zz....zz.....zz.......'];
  const bodyRun2 = ['.....fffffffffffffffffff......', '....ffffffffffffffffffff......', '....ffFFffffffffffFFffff......', '....ffFFffffffffffFFffff......', '.....zzzz........zzzz.........', '......zz..........zz..........'];
  const stand = r([...horns, ...head, ...bodyStand]);
  const run1 = r([...horns, ...head, ...bodyRun1]);
  const run2 = r([...horns, ...head, ...bodyRun2]);
  const lowerHorns = ['..............................', '......mmm..............mmm....', '.....mMMmm............mmMMm...', '....mM..mmm..........mmm..Mm..', '....mM.mmmm..........mmmm.Mm..'];
  const lowerHead = ['.....mmmmfffffffffffffffmmmm..', '......fffffffffffffffffffffe..', '......fFfffffffffffffffffff...', '.......ffffffffffffffffff.....'];
  const lower = r([...lowerHorns, ...lowerHead, ...bodyStand]);
  const crashHead = ['....rmmmmfffffffffffffffmmmm..', '...r..fffffffffffffffffffffe..', '....r.fFfffffffffffffffffff...', '.......ffffffffffffffffff.....'];
  const crash = r([...lowerHorns, ...crashHead, ...bodyStand]);
  const rearHorns = ['......mmm..............mmm....', '.....mMMmm............mmMMm...', '....mM..mmm..........mmm..Mm..', '....mM.mmmm..........mmmm.Mm..', '.....mmmmff..........ffmmmm...'];
  const rearBody = ['.......fffffffffffffffff......', '......ffffffffffffffffffe.....', '......fFfffffffffffffffff.....', '......ffffffffffffffffff......', '.....ffffffffffffffffff.......', '....ffffffffffffffff..........', '....ffFFffffffffffff..........', '....ffFFffffffffff............', '....zz.zz.....zz.zz...........', '....zz.zz.....zz.zz...........'];
  const rear = r([...rearHorns, ...rearBody]);
  const bodyLeap = bodyStand.map((row, i) => i === 4 ? '.....zzzz........zzzz.........' : i === 5 ? '......zz..........zz..........' : row);
  const leap = r([...lowerHorns, ...lowerHead, ...bodyLeap]);
  return pack([stand, run1, run2, lower, crash, rear, leap], 16, 16, 26, 14);
}
// The shepherd — an old hill woman with a crook and a plaid. 10×16. Frames: idle, wave.
export function bakeShepherd() {
  const SP = Object.assign({}, CP, { p: '#7a4a5a', P: '#4a2a3a', t: '#e8dcc0', w: '#8a5a32' });
  const s = rows => outline(fromGrid(rows, SP, 1), OUT);
  const idle = s(['...ffff...', '..fFFFFf..', '..fteetf..', '..ftttf.w.', '...tttt.w.', '..ppPppww.', '.ppppppp.w', '.pPppppP.w', '..pppppp.w', '..PppppP.w', '...pppp..w', '..zz..zz..']);
  const wave = s(['...ffff.f.', '..fFFFFff.', '..fteetff.', '..ftttfw..', '...tttt.w.', '..ppPppww.', '.ppppppp.w', '.pPppppP.w', '..pppppp.w', '..PppppP.w', '...pppp..w', '..zz..zz..']);
  return pack([idle, wave], 6, 13, 8, 12);
}
// Sheep — 12×8, woolly. Frames: graze, look up, walk.
export function bakeSheep() {
  const s = rows => outline(fromGrid(rows, CP, 1), OUT);
  const graze = s(['..ffffffff..', '.ffffffffff.', '.ffffffffffz', '..ffffffff.z', '..z..z.z..ze', '..z..z.z..z.']);
  const look = s(['..ffffffffzz', '.fffffffffze', '.ffffffffffz', '..ffffffff..', '..z..z.z..z.', '..z..z.z..z.']);
  const walk = s(['..ffffffff..', '.ffffffffff.', '.ffffffffffz', '..ffffffff.z', '.z..z...z.ze', '.z..z...z.z.']);
  return pack([graze, look, walk], 7, 7, 10, 6);
}

export function bakeKeeperOld() {
  const KP = Object.assign({}, EP, { b: '#3a3448', B: '#1b1626', f: '#e8e0d0', a: '#c9b27c', A: '#8a5a32' });
  const k = rows => outline(fromGrid(rows, KP, 1), OUT);
  const head = ['...bbbbbb...', '..bfbbbbfb..', '..bfbeebfb..', '..bbffffbb..', '...bbBBbb...'];
  const talk = ['...bbbbbb...', '..bfbbbbfb..', '..bfbeebfb..', '..bbffffbb..', '...bBBBBb...'];
  const body = ['..aaaaaaaa..', '.aaAaaaaAaa.', '.aaaaaaaaaa.', '..aaaaaaaa..', '..bb....bb..'];
  return pack([k([...head, ...body]), k([...talk, ...body])], 7, 11, 10, 10);
}


// ---------- Talking folk of the lower woods ----------
const FP = Object.assign({}, EP, { c: '#3f6e2c', C: '#2a4a1c', k: '#f1c9a0', h: '#8a5a32', a: '#c9d1dc', A: '#7c8797', v: '#7a4a2a', V: '#4c2c17', q: '#5a4a3a', z: '#3a2214', d: '#3d5aa8', D: '#243a78', u: '#c9a83a', i: '#e8e0d0', I: '#7fe0e8', j: '#4aa0b0', O: '#fff6c8', x: '#5a6a9a', X: '#3a4a7a' });
const fspr = rows => outline(fromGrid(rows, FP, 1), OUT);
// The woodsman — broad, bearded, green cap, an axe over his shoulder. 12×14. Frames: idle, talk (the axe comes up).
export function bakeWoodsman() {
  const head = ['....cccc....', '...cCCCCc...', '..kkkkkkkk..', '..kokkkkok..'];
  const idle = fspr([...head, '..kkkkkkkk..', '..hhhhhhhh..', '...hhhhhh...', '..vvvvvvvv.a', '.vVvvvvvvVaA', '.vvvvvvvvv.q', '.vVvvvvvvV.q', '..vvvvvvvv.q', '..zz..zz....', '..zz..zz....']);
  const talk = fspr([...head, '..kkkkkkkk.a', '..hhhhhhhhaA', '...hhhhhh..q', '..vvvvvvvv.q', '.vVvvvvvvV.q', '.vvvvvvvvv..', '.vVvvvvvvV..', '..vvvvvvvv..', '..zz..zz....', '..zz..zz....']);
  return pack([idle, talk], 7, 15, 10, 14);
}
// The ferryman — a stooped man in a grey-blue hood with a pole. 12×13. Frames: idle, talk.
export function bakeFerryman() {
  const idle = fspr(['...xxxx...q.', '..xxxxxx..q.', '..xkkkkx..q.', '..xkokokx.q.', '..xxkkkxx.q.', '.xxxxxxxxqq.', '.xXxxxxxxXq.', '.xxxxxxxxxq.', '.xXxxxxxXxq.', '.xxxxxxxxx..', '.xXxxxxxXx..', '..xxxxxxxx..', '..zz...zz...']);
  const talk = fspr(['...xxxx..q..', '..xxxxxx.q..', '..xkkkkx.q..', '..xkokokxq..', '..xxkkkxxq..', '.xxxxxxxkq..', '.xXxxxxxxXq.', '.xxxxxxxxxq.', '.xXxxxxxXxq.', '.xxxxxxxxx..', '.xXxxxxxXx..', '..xxxxxxxx..', '..zz...zz...']);
  return pack([idle, talk], 7, 14, 10, 13);
}
// The squire — a fair-haired youth in the realm's blue tabard, no helm. 12×13. Frames: idle, wave.
export function bakeSquire() {
  const head = ['...uuuuuu...', '..uuuuuuuu..', '..ukkkkkku..', '..ukokkoku..', '...kkkkkk...', '....kkkk....'];
  const idle = fspr([...head, '...dddddd...', '..dDdyydDd..', '..dddyyddd..', '..dDddddDd..', '...dddddd...', '...zz..zz...', '...zz..zz...']);
  const wave = fspr([...head, '...dddddd.k.', '..dDdyydDdk.', '..dddyydddd.', '..dDddddDd..', '...dddddd...', '...zz..zz...', '...zz..zz...']);
  return pack([idle, wave], 7, 14, 10, 13);
}
// The elder — an old myconid, a wide clean cap over a pale face with a beard of mycelium. 12×13. Frames: idle, nod.
export function bakeElder() {
  const body = ['...tttttt...', '...tottot...', '...tttttt...', '..i.tttt.i..', '..i.tttt.i..', '....tttt....', '....tt.tt...', '....tt.tt...'];
  const idle = fspr(['...jjjjjj...', '..jIIIIIIj..', '.jIIOIIIOIj.', '.jIIIIIIIIj.', '.jjjjjjjjjj.', ...body]);
  const nod = fspr(['............', '..jjjjjjjj..', '.jIIOIIIOIj.', '.jIIIIIIIIj.', '.jjjjjjjjjj.', ...body]);
  return pack([idle, nod], 7, 14, 10, 13);
}

// Crag ram — a wild shaggy ram, horns curled tight, no rider. 16×9. Frames: run1, run2, rear, run1, run2 (the last two stand in for the old riderless goat).
export function bakeCragRam() {
  const RP = Object.assign({}, CP, { f: '#d8d0c0', F: '#a8a090', m: '#c9a83a', M: '#8a6a1a', z: '#3a2e22' });
  const r = rows => outline(fromGrid(rows, RP, 1), OUT);
  const head = ['............mmm.', '...........mMMm.', '....fffffff.mMm.', '..fffffffffffffo', '.ffFfffffffffff.', '.fFFfffffffffFf.', '..ffffffffffff..'];
  const run1 = r([...head, '..zz.zz....zz.zz', '..z...z....z...z']);
  const run2 = r([...head, '...zz.zz..zz.zz.', '...z...z..z...z.']);
  const rear = r(['..........mmm...', '.........mMMm...', '..........mMm...', '.........ffffffo', '........ffffffff', '.......fffffffF.', '.....ffffffffff.', '....fFFfffffzz..', '..fffffffffz.z..', '..zz.zz.........', '..z...z.........']);
  return pack([run1, run2, rear, run1, run2], 9, 10, 14, 9);
}
// Hill troll — a hulking mossy brute, taller than a door, that hurls boulders. 18×17. Frames: stand, walk1, walk2, throw (rock up), swat.
export function bakeTroll() {
  const TP = Object.assign({}, CP, { t: '#6a7a5a', T: '#46543a', m: '#3f6e2c', s: '#8a919c', S: '#5a6270', o: OUT });
  const tr = rows => outline(fromGrid(rows, TP, 1), OUT);
  const head = ['.....tttttttt.....', '....ttttttttttt...', '....ttoottotttt...', '....tttttttttt....', '.....ttTTTTtt.....'];
  const body = ['..mmmtttttttttmmm.', '.mttttttttttttttm.', '.tttTttttttttTttt.', '.tttTttttttttTttt.', '.tttTttttttttTttt.', '.TTTTtttttttttTTT.', '....tttttttttt....', '....ttttttttttt...'];
  const pad = (rows, n) => Array(n).fill('.'.repeat(18)).concat(rows);
  const stand = tr(pad([...head, ...body, '.....TTT..TTT.....', '.....TTT..TTT.....', '.....TTT..TTT.....', '....TTTT..TTTT....'], 2));
  const walk1 = tr(pad([...head, ...body, '....TTT....TTT....', '...TTT......TTT...', '...TTT......TTT...', '..TTTT......TTTT..'], 2));
  const walk2 = tr(pad([...head, ...body, '......TTTTTT......', '......TTT.TTT.....', '.....TTT...TTT....', '....TTTT...TTTT...'], 2));
  const throwF = tr(['..............sss.', '.............sSSs.', '.....tttttttt.sss.', '....ttttttttttttt.', '....ttoottotttTtt.', '....ttttttttttTtt.', '.....ttTTTTtt.Ttt.', '..mmmttttttttttmm.', '.mtttttttttttttt..', '.tttTttttttttttt..', '.tttTtttttttttt...', '.tttTttttttttt....', '.TTTTttttttttt....', '....tttttttttt....', '....ttttttttttt...', '.....TTT..TTT.....', '.....TTT..TTT.....', '.....TTT..TTT.....', '....TTTT..TTTT....']);
  const swat = tr(pad([...head, '..mmmtttttttttmmm.', '.mttttttttttttttm.', '.tttTtttttttttttTT', '.tttTttttttttttTTT', '.tttTtttttttttt...', '.TTTTttttttttt....', '....tttttttttt....', '....ttttttttttt...', '.....TTT..TTT.....', '.....TTT..TTT.....', '.....TTT..TTT.....', '....TTTT..TTTT....'], 2));
  return pack([stand, walk1, walk2, throwF, swat], 10, 20, 16, 18);
}


// ---------- The Great Hound, the Hanging Village's beasts, and the Owl Reeve ----------
const HP2 = Object.assign({}, EP, { h: '#5a4a3a', H: '#3a2e22', l: '#8a7a68', r: '#ff4a3a', t: '#e8dcc0', z: '#2a2018' });
const hspr = rows => outline(fromGrid(rows, HP2, 1), OUT);
// The Great Hound — a beast the length of a cart, low and fast. 32×12. Frames: stand, run1, run2, crouch (tell), pounce, howl, stunned.
export function bakeGreatHound() {
  const head = ['.........................hh.....', '........................hHhh....'];
  const body = ['....hhhhhhhhhhhhhhhhhhhhhhhhhh..', '...hhhhhhhhhhhhhhhhhhhhhhhhhhhh.', '..hhhlhhhhhhhhhhhhhhhhhhhhhrhhht', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhhtt', '.hHhhhhhhhhhhhhhhhhhhhhhhhhhhhh.', '.hHhhhhhhhhhhhhhhhhhhhhhhhhhh...', '..hhhhhhhhhhhhhhhhhhhhhhhhhh....'];
  const legsA = ['...HHHH...HHHH.......HHHH.HHHH..', '...HHH.....HHH.......HHH...HHH..', '...HHH.....HHH.......HHH...HHH..'];
  const legsB = ['..HHHH.....HHHH....HHHH....HHHH.', '.HHH.........HHH..HHH........HHH', 'HHH...........HHHHH...........HH'];
  const legsC = ['......HHHHHHH.......HHHHHHH.....', '.......HHHHH.........HHHHH......', '........HHH...........HHH.......'];
  const stand = hspr([...head, ...body, ...legsA]);
  const run1 = hspr([...head, ...body, ...legsB]);
  const run2 = hspr([...head, ...body, ...legsC]);
  const crouch = hspr(['................................', '................................', '.........................hh.....', '........................hHhh....', '....hhhhhhhhhhhhhhhhhhhhhhhhhh..', '...hhhhhhhhhhhhhhhhhhhhhhhhhhhh.', '..hhhlhhhhhhhhhhhhhhhhhhhhhrhhht', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhhtt', '.hHhhhhhhhhhhhhhhhhhhhhhhhhhhhh.', 'HHHHHHHH...HHHHH.....HHHHH...HHH', 'HH....HH.....HH.......HH......HH', '................................']);
  const pounce = hspr(['..................hh............', '.................hHhh...........', '....hhhhhhhhhhhhhhhhhhhhhh......', '...hhhhhhhhhhhhhhhhhhhhhhhhh....', '..hhhlhhhhhhhhhhhhhhhhhhhhhrhht.', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhhtt', '.hHhhhhhhhhhhhhhhhhhhhhhhhhhhh..', 'HHHhhhhhhhhhhhhhhhhhhhhhhhHHH...', 'HH..hhhhhhhhhhhhhhhhhhhhhh..HHH.', '.......................HHH...HH.', '......................HH........', '................................']);
  const howl = hspr(['.........................hhh....', '........................hhhht...', '.......................hhhhh....', '....hhhhhhhhhhhhhhhhhhhhHrhh....', '...hhhhhhhhhhhhhhhhhhhhhhhh.....', '..hhhlhhhhhhhhhhhhhhhhhhhh......', '..hhhhhhhhhhhhhhhhhhhhhhh.......', '.hHhhhhhhhhhhhhhhhhhhhhh........', '..hhhhhhhhhhhhhhhhhhhh..........', '...HHHH...HHHH....HHHH.HHHH.....', '...HHH.....HHH....HHH...HHH.....', '...HHH.....HHH....HHH...HHH.....']);
  const stun = hspr(['................................', '................................', '...........HH.HH....HH.HH.......', '.........HHHHHHHHHHHHHHHHH......', '....hhhhhhhhhhhhhhhhhhhhhhhhhh..', '...hhhhhhhhhhhhhhhhhhhhhhhhhhhh.', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhhh.', '..hhhlhhhhhhhhhhhhhhhhhhhhhhrht.', '.hHhhhhhhhhhhhhhhhhhhhhhhhhhhhtt', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhh..', '................................', '................................']);
  return pack([stand, run1, run2, crouch, pounce, howl, stun], 17, 12, 26, 12);
}
// Bough spider — hangs on a thread, drops on you. 12×8. Frames: hang, drop (legs wide).
export function bakeSpider() {
  const SP2 = Object.assign({}, EP, { b: '#3a3448', B: '#1b1626', r: '#ff4a3a', l: '#5a5468' });
  const s = rows => outline(fromGrid(rows, SP2, 1), OUT);
  const hang = s(['.....bb.....', '..l.bbbb.l..', '.l.bbbbbb.l.', 'l.bbrbbrbb.l', '.lbbbbbbbbl.', 'l..bbbbbb..l', '.l..bbbb..l.', 'l...l..l...l']);
  const drop = s(['l....bb....l', '.l..bbbb..l.', '..lbbbbbbl..', 'lllbbrbbrlll', '...bbbbbb...', '..l.bbbb.l..', '.l..l..l..l.', 'l..........l']);
  const hang2 = s(['.....bb.....', '.l..bbbb..l.', '..lbbbbbbl..', '.lbbrbbrbbl.', 'l.bbbbbbbb.l', '.l.bbbbbb.l.', 'l...bbbb...l', '.l..l..l..l.']);
  const climb1 = s(['l....bb....l', '.l..bbbb..l.', '..lbbbbbbl..', '..bbrbbrbb..', '.lbbbbbbbbl.', 'l..bbbbbb..l', '....bbbb....', '...l....l...']);
  const climb2 = s(['.l...bb...l.', 'l...bbbb...l', '.l.bbbbbb.l.', '..bbrbbrbb..', '..lbbbbbbl..', '.l.bbbbbb.l.', 'l...bbbb...l', '....l..l....']);
  return pack([hang, drop, hang2, climb1, climb2], 7, 9, 10, 8);
}
// Squirrel knight — a red squirrel in a blue tabard, sword on its back, a plume of a tail. 12×11. Frames: run1, run2, leap.
export function bakeSquirrel() {
  const QP = Object.assign({}, EP, { q: '#c9463d', Q: '#8f2f28', d: '#3d5aa8', D: '#243a78', y: '#e0b040', s: '#c9d1dc', o: OUT });
  const q = rows => outline(fromGrid(rows, QP, 1), OUT);
  const run1 = q(['qq.......q..', 'qq......qqq.', '.qq....qqoq.', '..qqq..qqqq.', '...qqddddq..', '..QqqdydDq..', '..Q.qdddd...', '.Q..qqqq....', '....q..q....', '...qq..qq...', '............']);
  const run2 = q(['.qq......q..', 'qq......qqq.', 'qq.....qqoq.', '.qqqq..qqqq.', '...qqddddq..', '..QqqdydDq..', '..Q.qdddd...', '.Q..qqqq....', '.....qq.....', '....qqqq....', '............']);
  const leap = q(['............', 'qqq......q..', '.qqq....qqq.', '..qqqq.qqoq.', '....qqqqqqq.', '....qqddddqq', '...QqqdydDq.', '..Q.qdddd.q.', '.Q..qqqq..q.', '...qq..qq...', '............']);
  return pack([run1, run2, leap], 7, 12, 10, 10);
}
// The Owl Reeve — a great horned owl, wings like sails. 32×20. Frames: perch, wings up, wings down, screech (grounded, beak open), crash (on its back).
export function bakeOwl() {
  const OP = Object.assign({}, EP, { h: '#7a5a3a', H: '#4a3620', f: '#e8dcc0', y: '#ffd36b', m: '#c9a83a', w: '#a08060', o: OUT, r: '#c9463d' });
  const o = rows => outline(fromGrid(rows, OP, 1), OUT);
  const headP = ['...........hh......hh...........', '..........hhhh....hhhh..........', '..........hhhhhhhhhhhh..........', '..........hffyffhffyff..........', '..........hffoffhffoff..........', '...........hffffmfff............', '............hffmmff.............'];
  const perch = o([...headP, '...........hhhhhhhhhh...........', '..........hhhhhhhhhhhh..........', '..........hhwwhhhhwwhh..........', '..........hhhhhhhhhhhh..........', '...........hhhhhhhhhh...........', '............hhhhhhhh............', '.............mm..mm.............', '.............mm..mm.............']);
  const wingsUp = o(['h..............................h', 'hh............................hh', 'hhh...........hh......hh.....hhh', 'hhhh.........hhhh....hhhh...hhhh', 'hhhhh........hhhhhhhhhhhh..hhhhh', '.hhhhh.......hffyffhffyff.hhhhh.', '..hhhhh......hffoffhffoff.hhhh..', '...hhhhh......hffffmfff..hhhh...', '....hhhhhhhhhhhhhhhhhhhhhhhhh...', '.....hhhhhhhhhhhhhhhhhhhhhhh....', '.......hhhhhhhhwwhhwwhhhhh......', '..........hhhhhhhhhhhh..........', '............hhhhhhhh............', '.............mm..mm.............', '................................']);
  const wingsDown = o(['................................', '..............hh......hh........', '.............hhhh....hhhh.......', '.............hhhhhhhhhhhh.......', '.............hffyffhffyff.......', '.............hffoffhffoff.......', '..............hffffmfff.........', '........hhhhhhhhhhhhhhhhhhhh....', '......hhhhhhhhhhhhhhhhhhhhhhhh..', '....hhhhhhhhhhhhwwhhwwhhhhhhhhhh', '..hhhhh.....hhhhhhhhhhhh....hhhh', 'hhhh..........hhhhhhhh.........h', 'h..............mm..mm...........', '................................', '................................']);
  const screech = o(['...........hh......hh...........', '..........hhhh....hhhh..........', '.........hhhhhhhhhhhhhh.........', '........hhffyffhffyffhh.........', '.......hhhffoffhffoffhhh........', '......hhhhhffffmfffhhhhh........', '.....hhhhhhhffmrrmffhhhhhh......', '....hhhhhhhhhhmrrmhhhhhhhhh.....', '...hhhhhhhhhhhhhhhhhhhhhhhhhh...', '..hhhhhhhhhwwhhhhhhwwhhhhhhhhh..', '.hhhh......hhhhhhhhhhh......hhhh', 'hhh.........hhhhhhhhh.........hh', '.............mm..mm.............', '.............mm..mm.............', '................................']);
  const crash = o(['................................', '................................', '................................', '..............mm..mm............', '.............hhhhhhhh...........', '...hhhhhhhhhhhhhhhhhhhhhhhhhh...', '.hhhhhhhhhhhhwwhhhhwwhhhhhhhhhh.', 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh', '.hhhhhhhhhhhffoffhffoffhhhhhhhh.', '...hhhhhhhhhffyffhffyffhhhhhh...', '............hhhhhhhhhhhh........', '.............hhhh..hhhh.........', '..............hh....hh..........', '................................', '................................']);
  const glide = o(['................................', '..............hh......hh........', '.............hhhh....hhhh.......', '.............hhhhhhhhhhhh.......', '.............hffyffhffyff.......', '.............hffoffhffoff.......', '..............hffffmfff.........', 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh', 'hhhhhhhhhhhhhhhhwwhhwwhhhhhhhhhh', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhh..', '.....hhhhh....hhhhhhhh....hhhh..', '..............hhhhhhhh..........', '...............mm..mm...........', '................................', '................................']);
  const dive = o(['.........................hh.....', '........................hhhh....', '.......................hhhhhh...', '..............hh......hhhhhhh...', '.............hhhh....hhhhhhhh...', '.............hhhhhhhhhhhhhhhh...', '.............hffyffhffyffhhhh...', '.............hffoffhffoffhhh....', '..............hffffmfffhhh......', '.......hhhhhhhhhhhhhhhhhh.......', '.....hhhhhhhhhhwwhhwwhhhh.......', '...hhhhhhhhhhhhhhhhhhhh.........', '..............mm..mm............', '................................', '................................']);
  const land = o(['h..............................h', 'hh............................hh', 'hhh...........hh......hh.....hhh', 'hhhh.........hhhh....hhhh...hhhh', 'hhhhh........hhhhhhhhhhhh..hhhhh', '.hhhhh.......hffyffhffyff.hhhhh.', '..hhhhh......hffoffhffoff.hhhh..', '...hhhhh......hffffmfff..hhhh...', '....hhhhhhhhhhhhhhhhhhhhhhhhh...', '.....hhhhhhhhhhhhhhhhhhhhhhh....', '.......hhhhhhhhwwhhwwhhhhh......', '..........hhhhhhhhhhhh..........', '............hhhhhhhh............', '............mm....mm............', '...........mm......mm...........']);
  return pack([perch, wingsUp, wingsDown, screech, crash, glide, dive, land], 17, 16, 24, 14);
}


// ---------- The Pyromancer. Not the knight in a hood any more: her own body, drawn from scratch. ----------
// A tall cowl that droops back with two embers for eyes in the dark of it, a capelet, a robe to the
// ankles that flares and trails and bells out when she drops, a rope belt, and a staff taller than she
// is with a caged flame at the head. Same canvas and anchor as the knight, so nothing else changes.
// Palette keys (the skins recolour these): s/S robe, b/B capelet + the dark of the hood, r the glow
// (eyes, hem, the flame), y brass, w/W the staff, k hands.
const PYRO_PAL = { s: '#b8462e', S: '#6a1e1e', b: '#3a2a4a', B: '#241a30', r: '#ffb040', k: '#f1c9a0', w: '#5a3a24', W: '#3a2214', y: '#ffd36b', v: '#f1c9a0', o: OUT };
// three cowls: 0 at rest, 1 streaming back (running), 2 blown up (falling, hurt). 11 wide, drawn so the
// face opening is at the front (right); '.' is empty.
const COWL = [
  ['....SS.....', '...Sss.....', '..Ssssss...', '.Sssssss...', '.SssbBBBs..', 'SssbBrBrs..', '.SsbBBBBs..', '..SSbbbS...'],
  ['SSS........', '.SSsss.....', '..Ssssss...', '.Sssssss...', '.SssbBBBs..', 'SssbBrBrs..', '.SsbBBBBs..', '..SSbbbS...'],
  ['...........', '..SSs......', '.Sssssss...', 'SSssssss...', '.SssbBBBs..', 'SssbBrBrs..', '.SsbBBBBs..', '..SSbbbS...'],
];
function pyroFrame(o = {}) {
  const { lean = 0, dy = 0, trail = 0, hemW = 11, bell = 0, feet = [[11, 18], [15, 18]], arm = null, arm2 = null,
    staff = null, cowl = 0, flick = 0, sit = 0, flare = null, palm = null } = o;
  const [c, g] = canvas(W, H);
  const put = (x, y, k) => { if (KP[k]) px(g, Math.round(x), Math.round(y), KP[k]); };
  // the staff goes behind her when she carries it, in front when she works it
  const drawStaff = () => { if (!staff) return;
    const [x0, y0, x1, y1] = staff; line(g, x0, y0 + dy, x1, y1 + dy, KP.w, 2);
    const ux = Math.sign(x1 - x0), uy = Math.sign(y1 - y0);
    // a brass cage at the head with the flame in it
    const hx = x1, hy = y1 + dy;
    put(hx - uy, hy + ux, 'y'); put(hx + uy, hy - ux, 'y'); put(hx + ux, hy + uy, 'y');
    put(hx, hy, flick ? 'y' : 'r'); put(hx + ux * 2, hy + uy * 2, flick ? 'r' : 'y');
    put(hx + ux * 2 - uy, hy + uy * 2 + ux, 'r'); };
  if (staff && staff[4] === 'back') drawStaff();
  // boots, under the hem
  for (const [fx, fy] of feet) { put(fx, fy + dy, 'W'); put(fx + 1, fy + dy, 'W'); }
  // the robe: shoulders to hem, flaring, leaning with the body and trailing behind it
  const top = 8 + sit, hem = 17 - Math.round(bell / 2);
  for (let y = top; y <= hem; y++) {
    const t = (y - top) / Math.max(1, hem - top);
    const w = Math.round(7 + (hemW + bell - 7) * Math.pow(t, 1.3));
    const cx = 13 + lean * (1 - t) - trail * t * t;
    const l = Math.round(cx - w / 2), r = l + w - 1;
    for (let x = l; x <= r; x++) put(x, y + dy, x === l ? 'S' : x === r ? 's' : (x === Math.round(cx) - 1 && y > top + 3) ? 'S' : 's');
    if (y === hem) for (let x = l; x <= r; x++) if ((x + y) % 2 === 0 || bell) put(x, y + dy, 'r'); // the hem glows where it is singed
  }
  // the capelet over the shoulders, and the rope belt
  for (let x = 10 + lean; x <= 16 + lean; x++) { put(x, top + dy, 'b'); put(x, top + 1 + dy, x === 10 + lean || x === 16 + lean ? 'B' : 'b'); }
  put(9 + lean, top + 1 + dy, 'B'); put(17 + lean, top + 1 + dy, 'B');
  for (let x = 11 + lean; x <= 15 + lean; x++) put(x, top + 4 + dy, 'y'); put(12 + lean, top + 5 + dy, 'y'); put(12 + lean, top + 6 + dy, 'W');
  // the cowl
  const cw = COWL[cowl], hx = 8 + lean, hy = top - 8 + dy;
  cw.forEach((row, yy) => { for (let xx = 0; xx < row.length; xx++) { const k = row[xx]; if (k !== '.') put(hx + xx, hy + yy, k === 'r' && flick ? 'y' : k); } });
  // sleeves: wide at the cuff, a hand at the end of each
  const sleeve = a => { if (!a) return; const [x0, y0, x1, y1] = a; line(g, x0, y0 + dy, x1, y1 + dy, KP.s, 2); put(x1, y1 + dy, 'S'); put(x1 + Math.sign(x1 - x0 || 1), y1 + dy, 'k'); };
  sleeve(arm2);
  if (!staff || staff[4] !== 'back') drawStaff();
  sleeve(arm);
  if (palm) { const [x, y] = palm; put(x, y + dy, 'y'); put(x + 1, y + dy, 'r'); put(x, y - 1 + dy, 'r'); put(x, y + 1 + dy, 'r'); put(x + 2, y + dy, flick ? 'y' : 'r'); }
  if (flare) { const [x, y, big] = flare; const pts = big ? [[0, 0, 'y'], [1, 0, 'y'], [2, 0, 'r'], [1, -1, 'r'], [1, 1, 'r'], [3, 0, 'r'], [2, -2, 'y'], [2, 2, 'y'], [0, -1, 'y'], [0, 1, 'y'], [4, -1, 'r'], [4, 1, 'r']] : [[0, 0, 'y'], [1, 0, 'r'], [0, -1, 'r'], [0, 1, 'r'], [2, 0, 'y']];
    for (const [ddx, ddy, k] of pts) put(x + ddx, y + ddy + dy, k); }
  outline(c, OUT);
  return c;
}
export function bakePyro(skin = {}) {
  KP = Object.assign({}, KP0, PYRO_PAL, skin);
  const up = (dx = 0, d = 0) => [17 + dx, 18 + d, 18 + dx, 0 + d]; // the staff stood upright in the front hand, taller than her
  const hand = [16, 11, 17, 12];                                      // the front sleeve down to the staff
  const F = {
    idle: [0, 1, 2, 3].map(i => pyroFrame({ dy: i >> 1, trail: [0, -1, 0, 1][i], staff: up(0, i >> 1), arm: hand, flick: i % 2, cowl: 0 })),
    // she runs low and quick, the robe streaming behind and the staff carried like a lance
    run: [0, 1, 2, 3, 4, 5].map(i => pyroFrame({ lean: 2, dy: [0, -1, 0, 0, -1, 0][i], trail: 3 + (i % 3 === 1 ? 1 : 0), hemW: 11,
      feet: [[[9, 18], [16, 17]], [[11, 18], [15, 18]], [[13, 17], [12, 18]], [[16, 17], [9, 18]], [[15, 18], [11, 18]], [[12, 18], [13, 17]]][i],
      staff: [7, 17, 22, 5, 'back'], arm: [17, 10, 19, 11], cowl: 1, flick: i % 2 })),
    jump: [pyroFrame({ dy: -1, hemW: 12, feet: [[11, 17], [15, 17]], staff: [15, 16, 22, 1], arm: [16, 10, 18, 9], cowl: 0 }),
      pyroFrame({ hemW: 12, bell: 1, feet: [[11, 17], [15, 17]], staff: [15, 16, 22, 1], arm: [16, 10, 18, 9], cowl: 2 })],
    // falling, the robe bells out and her feet show
    fall: [pyroFrame({ bell: 3, hemW: 12, feet: [[11, 18], [15, 18]], staff: [14, 16, 21, 1], arm: [16, 9, 19, 7], arm2: [10, 9, 7, 7], cowl: 2 }),
      pyroFrame({ bell: 4, hemW: 13, dy: -1, feet: [[11, 18], [15, 19]], staff: [14, 16, 21, 1], arm: [16, 9, 19, 6], arm2: [10, 9, 7, 6], cowl: 2, flick: 1 })],
    land: pyroFrame({ sit: 2, hemW: 13, staff: up(0, 2), arm: [16, 13, 17, 14], cowl: 0 }),
    // on a ladder: the staff across her back, a hand up for the next rung and a foot up on it, then the other
    climb: [
      pyroFrame({ hemW: 9, feet: [[11, 18], [15, 15]], staff: [7, 17, 21, 4, 'back'], arm: [16, 10, 18, 3], arm2: [11, 10, 13, 7], cowl: 0 }),
      pyroFrame({ dy: 1, hemW: 9, feet: [[11, 15], [15, 18]], staff: [7, 17, 21, 4, 'back'], arm: [16, 10, 18, 6], arm2: [11, 10, 13, 3], cowl: 0, flick: 1 }),
    ],
    // the thrust: staff drawn back, driven straight out, flame off the end of it, pulled home
    atk: [
      pyroFrame({ lean: -1, feet: [[10, 18], [16, 18]], staff: [3, 11, 16, 10], arm: [15, 10, 13, 11], arm2: [11, 10, 9, 11], cowl: 0 }),
      pyroFrame({ lean: 2, trail: 2, feet: [[9, 18], [17, 18]], staff: [9, 11, 25, 10], arm: [16, 10, 20, 10], arm2: [12, 10, 15, 11], cowl: 1, flare: [26, 10, false] }),
      pyroFrame({ lean: 2, trail: 2, feet: [[9, 18], [17, 18]], staff: [10, 11, 26, 10], arm: [16, 10, 21, 10], arm2: [12, 10, 16, 11], cowl: 1, flare: [27, 10, true], flick: 1 }),
      pyroFrame({ lean: 1, feet: [[10, 18], [16, 18]], staff: [8, 13, 21, 8], arm: [16, 10, 18, 11], cowl: 0 }),
      pyroFrame({ staff: up(), arm: hand, cowl: 0 }),
    ],
    // the plunge: the staff goes down first and she rides it, robe streaming up
    // HOLD THE FLAME: she gathers it back low with both hands and then drives the staff forward level
    heavy: [
      pyroFrame({ lean: -2, dy: 1, hemW: 12, staff: [9, 16, 2, 9], arm: [14, 12, 11, 13], arm2: [12, 10, 9, 11], cowl: 2, flick: 1, trail: 2 }),
      pyroFrame({ lean: 3, hemW: 11, staff: [15, 13, 27, 11], arm: [17, 11, 20, 11], cowl: 1, flick: 0, trail: 3 }),
      pyroFrame({ lean: 2, dy: 1, hemW: 11, staff: [16, 14, 26, 14], arm: [17, 12, 20, 13], cowl: 0, flick: 1, trail: 1 }),
    ],
    plunge: pyroFrame({ bell: 4, hemW: 12, feet: [[11, 17], [15, 17]], staff: [13, 6, 13, 26], arm: [15, 10, 14, 13], arm2: [11, 10, 12, 13], cowl: 2, flick: 1 }),
    hurt: pyroFrame({ lean: -2, trail: -1, dy: 1, feet: [[10, 18], [15, 18]], staff: [5, 17, 13, 3, 'back'], arm: [15, 9, 18, 6], arm2: [10, 9, 7, 6], cowl: 2 }),
    crouch: pyroFrame({ sit: 3, hemW: 13, staff: up(0, 3), arm: [16, 14, 17, 15], cowl: 0 }),
    // the jet: braced wide, the staff levelled in both hands
    block: [0, 1].map(i => pyroFrame({ lean: 1, feet: [[9, 18], [17, 18]], staff: [7, 12, 23, 10], arm: [16, 10, 20, 11], arm2: [12, 10, 15, 12], cowl: 0, flick: i, trail: -i })),
    // an ember off the palm: the other hand does the work, the staff stays up
    cast: [pyroFrame({ lean: 1, feet: [[10, 18], [16, 18]], staff: [9, 18, 10, 0, 'back'], arm: [16, 10, 20, 9], cowl: 0, palm: [21, 9] }),
      pyroFrame({ lean: 2, trail: 1, feet: [[10, 18], [16, 18]], staff: [9, 18, 10, 0, 'back'], arm: [16, 10, 21, 9], cowl: 1, palm: [22, 9], flick: 1 })],
    // the pyre: the staff goes up over her head in both hands, then comes down like a hammer
    blast: [pyroFrame({ lean: -1, dy: -1, feet: [[10, 18], [16, 18]], staff: [6, 2, 21, 0], arm: [15, 9, 17, 3], arm2: [11, 9, 10, 3], cowl: 2, flick: 1, bell: 1 }),
      pyroFrame({ lean: 3, trail: 3, feet: [[8, 18], [18, 18]], staff: [11, 13, 25, 7], arm: [16, 10, 21, 9], arm2: [12, 10, 17, 10], cowl: 1, flare: [26, 6, true] })],
  };
  const tuck = pyroFrame({ sit: 4, hemW: 12, bell: 2, staff: [9, 17, 19, 7], arm: [15, 13, 16, 14], cowl: 2 });
  F.roll = [0, 1, 2, 3].map(q => rotQuarter(tuck, q));
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0);
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR };
}

// The keeper — an old badger merchant: spectacles, striped snout, a leather apron with a coin pouch, sleeves rolled. 14×16. Frames: idle, talk (a paw raised over the counter).
// The scullion - Gorm's cook-boy, an apron, a ladle and a worried face. 12x13. Frames: idle, talk.
export function bakeCook() {
  const CK = Object.assign({}, EP, { a: '#e8e0d0', A: '#b8a888', q: '#8a5a32', Q: '#5c3a1d', k: '#f1c9a0', c: '#8f2f28', o: OUT });
  const f = rows => outline(fromGrid(rows, CK, 1), OUT);
  const hat = ['...aaaaa....', '..aaaaaaa...', '..qkkkkkq...'];
  const face = ['..kkokkok...', '..kkkkkkk...'];
  const body = ['..qaaaaaq.s.', '.qaaaaaaaqs.', '.qaaaaaaaqS.', '.qaAAAAAaq..', '..qaaaaaq...', '..QQ...QQ...', '..QQ...QQ...'];
  const idle = f([...hat, ...face, '...kkkkk....', ...body]);
  const talk = f([...hat, ...face, '...kkckk....', ...body]);
  return pack([idle, talk], 7, 14, 10, 13);
}
export function bakeKeeper() {
  const KP2 = Object.assign({}, EP, { b: '#3a3448', B: '#1b1626', f: '#e8e0d0', a: '#8a5a32', A: '#5c3a1d', g: '#c9a83a', p: '#5a4a3a', o: OUT, e: '#f3f0d2', s: '#ffffff' });
  const k = rows => outline(fromGrid(rows, KP2, 1), OUT);
  const head = ['....bbbbbb....', '...bfbbbbfb...', '...bfbbbbfb...', '..bbfffffffb..', '..bfggfggfbb..', '..bfgegegfb...', '...bffffffb...', '...bbbBBbbb...'];
  const talk = ['....bbbbbb....', '...bfbbbbfb...', '...bfbbbbfb...', '..bbfffffffb..', '..bfggfggfbb..', '..bfgegegfb...', '...bffffffb...', '...bbBBBBbb...'];
  const body = ['..aaaaaaaaaa..', '.aaAaaaaaaAaa.', '.aaaaaaaaaaaa.', '.aaaaggaaaaaa.', '..aaaaaaaaaa..', '..bbb....bbb..', '..bbb....bbb..', '..pp......pp..'];
  const bodyTalk = ['..aaaaaaaaaab.', '.aaAaaaaaaAab.', '.aaaaaaaaaaaab', '.aaaaggaaaaaa.', '..aaaaaaaaaa..', '..bbb....bbb..', '..bbb....bbb..', '..pp......pp..'];
  return pack([k([...head, ...body]), k([...talk, ...bodyTalk])], 8, 17, 12, 16);
}
// The bard — a hedgehog with a lute and a feathered cap. 12×13. Frames: idle, strum.
export function bakeBard() {
  const BP = Object.assign({}, EP, { q: '#6a4a3a', Q: '#3a2214', k: '#f1c9a0', c: '#3f6e2c', r: '#c9463d', w: '#8a5a32', W: '#5c3a1d', y: '#e0b040', o: OUT });
  const b = rows => outline(fromGrid(rows, BP, 1), OUT);
  const idle = b(['...r.cccc...', '..rccccccc..', '..qQqQqQqq..', '.qQqkkkkqQq.', '.qqqkokokqq.', '..qqkkkkqq..', '..qqqqqqqq..', '.qqqqqqqqqw.', '.qqqqqqqqwW.', '..qqqqqqwWy.', '...qq..qq.y.', '...QQ..QQ...']);
  const strum = b(['...r.cccc...', '..rccccccc..', '..qQqQqQqq..', '.qQqkkkkqQq.', '.qqqkokokqq.', '..qqkkkkqq..', '..qqqqqqqqk.', '.qqqqqqqqqw.', '.qqqqqqqqwW.', '..qqqqqqwWy.', '...qq..qq.y.', '...QQ..QQ...']);
  return pack([idle, strum], 7, 13, 10, 12);
}
// The old knight — a retired veteran in a dented helm and a patched surcoat, leaning on a stick. 12×15. Frames: idle, nod.
export function bakeOldKnight() {
  const OK = Object.assign({}, EP, { s: '#9aa3b0', S: '#5a6270', b: '#6a5a8a', B: '#3a2a4a', k: '#f1c9a0', w: '#8a5a32', W: '#5c3a1d', g: '#b8b0a0', o: OUT });
  const o = rows => outline(fromGrid(rows, OK, 1), OUT);
  const idle = o(['...sSSSs....', '..sssssss...', '..sSSSSSs...', '..skkkkks...', '..sgggggs...', '...ggggg....', '..bbbbbbb...', '.bBbbbbbBb.w', '.bbbbbbbbb.w', '.bBbbbbbBb.w', '..bbbbbbb..w', '..SS...SS..w', '..SS...SS..w', '..WW...WW..w']);
  const nod = o(['............', '...sSSSs....', '..sssssss...', '..sSSSSSs...', '..skkkkks...', '..sgggggs...', '..bbbbbbb...', '.bBbbbbbBb.w', '.bbbbbbbbb.w', '.bBbbbbbBb.w', '..bbbbbbb..w', '..SS...SS..w', '..SS...SS..w', '..WW...WW..w']);
  return pack([idle, nod], 7, 15, 10, 14);
}


// ---------- The Mineworks ----------
// Goblin miner — a hard hat with a candle, a pick over the shoulder. 12×12. Frames: walk1, walk2, dig (pick down), swing (pick forward).
// The foreman — a barrel-chested man in a flat cap with a lamp pinned to it, a grey beard, a red waistcoat and a ledger under one arm. 12×14. Frames: idle, talk.
export function bakeForeman() {
  const P2 = Object.assign({}, KG, { c: '#3a3444', C: '#26222e', k: '#f1c9a0', y: '#ffd36b', s: '#c9d1dc', S: '#8a919c', v: '#8a2a2a', V: '#5a1a1a', a: '#e8e0d0', x: '#c9b27c', h: '#4a3a2a', z: '#2a1a10' });
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const head = ['....y.......', '...cccccc...', '..cCCCCCCc..', '..kkkkkkkk..', '..kokkkkok..', '..kkkkkkkk..', '..sSssssSs..', '...ssssss...'];
  const idle = f([...head, '..avvvvvva..', '.aavVvvVvaax', '.a.vvvvvv.ax', '...vvvvvv..x', '...hhhhhh...', '..zz...zz...']);
  const talk = f([...head, '..avvvvvvaa.', '.aavVvvVvaax', '.a.vvvvvv.ax', '...vvvvvv...', '...hhhhhh...', '..zz...zz...']);
  return pack([idle, talk], 7, 15, 10, 14);
}
// The lamplighter — a thin figure in a long dark coat and a tall hat, carrying a pole with a lit wick at the top. 12×16. Frames: idle, talk (pole lifts).
export function bakeLamplighter() {
  const P2 = Object.assign({}, KG, { c: '#2a2a34', C: '#1a1a22', k: '#f1c9a0', y: '#ffd36b', Y: '#ff9a5c', q: '#8a5a32', v: '#3a3a5a', V: '#24243a', a: '#c9b27c', h: '#2a2a34', z: '#1a1a12' });
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const idle = f(['..........Y.', '...cccc...y.', '...cccc...q.', '..cccccc..q.', '..kkkkkk..q.', '..kokkok..q.', '...kkkk...q.', '..vvvvvv..q.', '.vvVvvVvv.q.', '.vvvvvvvvvq.', '.v.vvvvvv.q.', '...vvvvvv.q.', '...vvvvvv...', '...vvvvvv...', '...hh..hh...', '...zz..zz...']);
  const talk = f(['.........Y..', '...cccc..y..', '...cccc..q..', '..cccccc.q..', '..kkkkkkkq..', '..kokkokaq..', '...kkkk.aq..', '..vvvvvvvq..', '.vvVvvVvvq..', '.vvvvvvvvq..', '.v.vvvvvvq..', '...vvvvvv...', '...vvvvvv...', '...vvvvvv...', '...hh..hh...', '...zz..zz...']);
  return pack([idle, talk], 7, 17, 10, 16);
}
export function bakeMiner() {
  const MP = Object.assign({}, KG, { c: '#c9b27c', C: '#8a7a5a', y: '#ffd36b', i: '#8a919c', I: '#5a6270' });
  const mspr = rows => outline(fromGrid(rows, MP, 1), OUT);
  const head = ['....y.......', '...cccccc...', '..cCCCCCCc..', '..ggeoggeog.', '...gggggg...', '...gGGGGg...'];
  const walk1 = mspr([...head, '..xxxxxxx.i.', '.xxxxxxxx.i.', '..xxxxxx..i.', '..GG..GG....', '.GG....GG...']);
  const walk2 = mspr([...head, '..xxxxxxx.i.', '.xxxxxxxx.i.', '..xxxxxx..i.', '...GGGG.....', '...GG.GG....']);
  const dig = mspr([...head, '..xxxxxxxxx.', '.xxxxxxxxxxi', '..xxxxxx..II', '..GG..GG..I.', '.GG....GG...']);
  const swing = mspr(['....y.......', '...cccccc...', '..cCCCCCCcii', '..ggeoggeoII', '...gggggg.I.', '...gGGGGgxI.', '..xxxxxxxxx.', '.xxxxxxxxx..', '..xxxxxx....', '..GG..GG....', '.GG....GG...']);
  return pack([walk1, walk2, dig, swing], 7, 12, 10, 11);
}
// Cave bat — 12×6. Frames: hang (wings folded), fly1, fly2.
export function bakeBat() {
  const BP2 = Object.assign({}, EP, { b: '#3a3448', B: '#5a5468', r: '#ff4a3a' });
  const b = rows => outline(fromGrid(rows, BP2, 1), OUT);
  const hang = b(['....bbbb....', '...bbbbbb...', '...bbrrbb...', '....bbbb....', '.....bb.....', '....b..b....']);
  const fly1 = b(['b..........b', 'bb...bb...bb', '.bbbbbbbbbb.', '..bbBrrBbb..', '....bbbb....', '.....bb.....']);
  const fly2 = b(['............', '.....bb.....', '..bbbbbbbb..', 'bbbbBrrBbbbb', 'bb..bbbb..bb', '.....bb.....']);
  return pack([hang, fly1, fly2], 7, 7, 10, 6);
}
// STORM CROW — they come down the moor wind in strings. 10x5, three wingbeats, facing right.
export function bakeCrow() {
  const CP = Object.assign({}, EP, { k: '#2a2433', K: '#4a4458', r: '#ff4a3a' });
  const c = rows => outline(fromGrid(rows, CP, 1), OUT);
  const up = c(['k.........', 'kk.....k..', '.kKkkkkkk.', '..kkkkkrky', '...kk.....']);
  const mid = c(['..........', '..........', 'kkKkkkkkk.', '.kkkkkkrky', '..kk......']);
  const down = c(['..........', '..........', '.kkkkkkkk.', 'kkKkkkkrky', 'kk....k...']);
  return pack([up, mid, down], 5, 5, 10, 5);
}
// HORNBLOWER — a goblin with a ram's horn. Frames: idle (horn at the hip), tell (horn raised), blow (horn at the mouth).
export function bakeHornblower() {
  const head = ['...gggg.......', '..gggggg......', '.geoggeog.....', '.gggggggg.....', '..gGGGGg......', '...gggg.......'];
  const legs = ['..GG..GG......', '.GG....GG.....'];
  const idle = sprite([...head, '..rrrrrryy....', '..rrrrrr.yy...', ...legs]);
  const tell = sprite(['...gggg...yy..', '..gggggg.yy...', '.geoggeogy....', head[3], head[4], head[5], '..rrrrrr......', '..rrrrrr......', ...legs]);
  const blow = sprite([head[0], head[1], '.geoggeogyyy..', '.gGgggggg.yyyy', '..gGGGGg...yy.', head[5], '..rrrrrr......', '..rrrrrr......', ...legs]);
  return pack([idle, tell, blow], 6, 11, 8, 10);
}
// HEATHER BALE — a round bale of cut heather the wind rolls about the moor. 12x12, four turns of the straw.
export function bakeBale() {
  const BP = Object.assign({}, EP, { y: '#d9b44a', Y: '#b08a32', w: '#8a6a32', h: '#9a5aa8' });
  const frames = [];
  for (let k = 0; k < 4; k++) { const rows = [];
    for (let y = 0; y < 12; y++) { let r = ''; for (let x = 0; x < 12; x++) { const dx = x - 5.5, dy = y - 5.5;
      if (dx * dx + dy * dy > 30) { r += '.'; continue; }
      const band = ((x + y + k * 3) % 6 + 6) % 6, cross = ((x - y + k * 2) % 5 + 5) % 5;
      r += band < 2 ? 'w' : cross === 0 ? 'Y' : (x * 7 + y * 3 + k) % 11 === 0 ? 'h' : 'y'; }
      rows.push(r); }
    frames.push(outline(fromGrid(rows, BP, 1), OUT)); }
  return pack(frames, 6, 12, 12, 12);
}
// THE PALADIN: the knight's rig in pale plate - a winged helm, a blue tabard with a gold sun on it, gilded
// sabatons - and a maul instead of a sword. Frames as the knight's, plus cast (MEND) and blast (JUDGEMENT);
// the roll is a heavy step, not a tumble.
const PAL_BODY = [
  'y..SSSS...',
  'yySssssS..',
  '.ySsssssS.',
  '.SsvvvvS..',
  '.SssssSS..',
  '..SSSS....',
  '.BbbbbB...',
  'SBbyybBS..',
  'SByyyyBS..',
  '.BbyybB...',
  '.yyyyyy...',
];
const PAL_PLUME = [
  ['y..SSSS...', 'yySssssS..', '.ySsssssS.'],
  ['yy.SSSS...', '.ySssssS..', '.ySsssssS.'],
  ['y..SSSS...', 'yySssssS..', 'yySsssssS.'],
];
const PAL_PAL = { s: '#eef2f8', S: '#98a4ba', b: '#3a5ab8', B: '#243a78', r: '#f0c040', y: '#f0c040', w: '#b8c0cc', W: '#9a7a32', v: '#2a2f3d' };
export function bakePaladin(skin = {}) {
  KP = Object.assign({}, KP0, PAL_PAL, skin); BODY_REF = PAL_BODY; PLUME_REF = PAL_PLUME;
  const sh = [BX + 8, BY + 7];
  const rest = (d = 0) => [sh[0] + 2, sh[1] + 1 + d, sh[0] + 5, sh[1] + 9 + d];   // the head grounded in front of him
  const carry = (d = 0) => [sh[0] + 1, sh[1] + 3 + d, sh[0] - 8, sh[1] - 2 + d];  // slung back behind him at a run, clear of the helm
  const F = {
    idle: [0, 1, 2, 3].map(i => knightFrame({ dy: i >> 1, maul: rest(i >> 1), plume: i % 3 })),
    run: [['run1', -1], ['run2', 0], ['run3', 1], ['run4', 0], ['run5', -1], ['run6', 0]].map(([l, dy], i) => knightFrame({ legs: l, dy, plume: i % 3, maul: carry() })),
    jump: [knightFrame({ legs: 'jump', dy: -1, maul: [sh[0] + 1, sh[1] + 1, sh[0] + 6, sh[1] - 6], plume: 1 }), knightFrame({ legs: 'jump2', maul: [sh[0] + 1, sh[1] + 1, sh[0] + 6, sh[1] - 5], plume: 1 })],
    fall: [knightFrame({ legs: 'fall', maul: [sh[0] + 1, sh[1] + 1, sh[0] + 6, sh[1] - 6], plume: 2 }), knightFrame({ legs: 'fall2', dy: -1, maul: [sh[0] + 1, sh[1] + 1, sh[0] + 5, sh[1] - 7], plume: 2 })],
    land: knightFrame({ legs: 'land', dy: 2, maul: rest(2) }),
    // HOLD THE MAUL: up in both hands, and down into the planking, and the ground carries it
    heavy: [
      knightFrame({ dx: -1, legs: 'wide', dy: -1, arm: [sh[0], sh[1], sh[0] - 1, sh[1] - 6], maul: [sh[0] - 1, sh[1] - 6, sh[0] + 2, sh[1] - 22], plume: 2 }),
      knightFrame({ dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 2], maul: [sh[0] + 4, sh[1] - 2, sh[0] + 14, sh[1] + 7], plume: 2 }),
      knightFrame({ dx: 2, legs: 'wide', dy: 2, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 5], maul: [sh[0] + 3, sh[1] + 5, sh[0] + 10, sh[1] + 16], plume: 0 }),
    ],
    climb: [
      knightFrame({ legs: 'climbA', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 7], maul: carry(), plume: 0 }),
      knightFrame({ legs: 'climbB', dy: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], maul: carry(1), plume: 1 }),
    ],
    atk: [
      knightFrame({ dx: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 2, sh[1] - 4], maul: [sh[0] - 2, sh[1] - 3, sh[0] - 7, sh[1] - 9], plume: 1 }), // drawn back over the shoulder
      knightFrame({ dx: 0, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 4], maul: [sh[0] + 1, sh[1] - 3, sh[0] + 5, sh[1] - 9], plume: 2 }),   // up and over
      knightFrame({ dx: 2, dy: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], maul: [sh[0] + 4, sh[1] + 2, sh[0] + 9, sh[1] + 7], plume: 2 }), // down
      knightFrame({ dx: 2, dy: 2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], maul: [sh[0] + 3, sh[1] + 4, sh[0] + 8, sh[1] + 9], plume: 0 }), // the head in the ground
      knightFrame({ maul: rest(), plume: 0 }),
    ],
    plunge: knightFrame({ legs: 'jump', arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 4], maul: [sh[0] - 1, sh[1] + 4, sh[0] - 1, sh[1] + 15], plume: 1 }),
    hurt: knightFrame({ dx: -1, dy: 1, legs: 'fall', maul: [sh[0] + 1, sh[1] + 2, sh[0] + 7, sh[1] + 5], plume: 2 }),
    crouch: knightFrame({ dy: 3, legs: 'crouch', maul: rest(3) }),
    // AEGIS: the maul planted upright before him, both hands on the haft
    block: [0, 1].map(i => knightFrame({ legs: 'wide', dy: i, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 2], maul: [sh[0] + 3, sh[1] + 9, sh[0] + 3, sh[1] - 5], glow: [sh[0] + 3, sh[1] - 9] })),
    // MEND: the free hand up, the light in it
    cast: [0, 1].map(i => knightFrame({ legs: 'stand', arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 7], maul: rest(), glow: [sh[0] + 1, sh[1] - 9 - i] })),
    // JUDGEMENT: the maul straight up over his head, then down
    blast: [knightFrame({ legs: 'wide', dy: -1, arm: [sh[0], sh[1], sh[0], sh[1] - 6], maul: [sh[0], sh[1] - 4, sh[0], sh[1] - 9], glow: [sh[0], sh[1] - 11] }),
      knightFrame({ dx: 2, dy: 2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], maul: [sh[0] + 3, sh[1] + 4, sh[0] + 8, sh[1] + 9] })],
  };
  // the dodge is a heavy step: a lean and a stride, not a tumble
  F.roll = [0, 1, 2, 3].map(i => knightFrame({ dx: i < 2 ? i : 3 - i, dy: 1, legs: i % 2 ? 'wide' : 'runC', maul: carry(1) }));
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR };
}
// THE QUEEN'S LANCE, redrawn as what he is: a GOBLIN knight. Green face under an open kettle helm with a red
// plume, ears out past the brim, a hooked nose and tusks; patched plate, the Queen's purple and gold, a kite
// shield on his back arm and a pennoned lance. Built from parts so every move has its own pose. 48x38.
// Frames: 0 stand, 1-4 walk, 5 couch, 6-7 charge, 8 thrustTell, 9 thrust, 10 sweepTell, 11 sweep, 12 planted,
// 13 guard, 14 guardTell, 15 guardSwing, 16-17 rush, 18 reel, 19 stumble, 20 vaultTell, 21 vault, 22 javTell,
// 23 javThrow, 24 rise, 25 bashTell, 26 bash, 27-28 guard walk.
export function bakeGoblinLance() {
  const LP = Object.assign({}, EP, { a: '#9aa3b0', A: '#5a6270', c: '#c9463d', C: '#8f2f28', p: '#5a2a7a', P: '#3e1c56', y: '#e0b040', u: '#8a5a32', U: '#4a2e1c', m: '#3a3e48', f: '#c9d1dc' });
  const W = 48, H = 38;
  const make = o => {
    const R = Array.from({ length: H }, () => Array(W).fill('.'));
    const set = (x, y, ch) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) R[y][x] = ch; };
    const run = (x, y, str) => { for (let i = 0; i < str.length; i++) if (str[i] !== '.') set(x + i, y, str[i]); };
    const seg = (x0, y0, x1, y1, ch, th = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1), steep = Math.abs(y1 - y0) > Math.abs(x1 - x0); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; for (let t = 0; t < th; t++) set(x + (steep ? t : 0), y + (steep ? 0 : t), ch); } };
    const dy = o.dy || 0, lean = o.lean || 0; // crouch and lean move the whole upper body
    // short, thick, bowed legs under a lot of goblin
    const leg = (hx, fx, lift, back) => { const kx = (hx + fx) / 2 + (back ? -2 : 2), ky = 32 + dy / 3 - lift / 2; seg(hx, 29 + dy, kx, ky, back ? 'A' : 'a', 4); seg(kx, ky, fx, 34 - lift, back ? 'A' : 'a', 4); run(fx - 2, 35 - lift, back ? 'UUUUU' : 'UUUUUe'); };
    const shieldAt = (sx, sy, dark) => { run(sx, sy, '.yyyyy.'); for (let k = 1; k <= 7; k++) run(sx, sy + k, 'y' + (dark ? 'PPPPP' : 'ppppp') + 'y'); run(sx + 1, sy + 8, 'ypppy'); run(sx + 2, sy + 9, 'yyy'); set(sx + 3, sy + 3, 'y'); set(sx + 2, sy + 4, 'y'); set(sx + 3, sy + 4, 'y'); set(sx + 4, sy + 4, 'y'); set(sx + 3, sy + 5, 'y'); };
    const lanceSeg = (x0, y0, x1, y1) => { seg(x0, y0, x1, y1, 'u', 1); const ux = Math.sign(x1 - x0), uy = Math.sign(y1 - y0); set(x1, y1, 'a'); set(x1 - ux, y1 - uy, 'a'); set(x1 + ux, y1 + uy, 'f'); set(x1 - ux * 4 - (uy ? 1 : 0), y1 - uy * 4 + (ux ? 1 : 0), 'c'); set(x1 - ux * 5 - (uy ? 1 : 0), y1 - uy * 5 + (ux ? 1 : 0), 'c'); set(x1 - ux * 5 - (uy ? 2 : 0), y1 - uy * 5 + (ux ? 2 : 0), 'C'); };
    if (o.shield === 'back') shieldAt(11 + lean, 15 + dy, true);
    const L1 = o.legs || [[19, 18, 0], [26, 27, 0]]; leg(19 + lean, L1[0][1], L1[0][2], true); leg(25 + lean, L1[1][1], L1[1][2], false);
    // a FAT goblin in plate: a round belly of a breastplate, the Queen's purple under it, a belt across the widest
    // part, pauldrons on shoulders that are mostly neck, and a big head sat low on all of it
    const cx = 21 + lean, ty = 12 + dy, tx = cx - 6;
    for (let k = 0; k <= 16; k++) { const hw = Math.max(3, Math.round(10 * Math.sqrt(Math.max(0, 1 - ((k - 9) / 10) ** 2)))); const y = ty + k;
      for (let x = cx - hw; x <= cx + hw; x++) { const edgeR = x >= cx + hw - 1, edgeL = x <= cx - hw;
        set(x, y, k === 11 ? (x === cx ? 'y' : 'U') : k > 11 ? (edgeL || edgeR ? 'P' : 'p') : (edgeR ? 'A' : edgeL ? 'A' : 'a')); } }
    run(cx - 3, ty + 3, 'ff'); run(cx - 4, ty + 4, 'f'); run(cx + 1, ty + 5, 'yy'); run(cx + 1, ty + 6, 'yy'); // the shine on the belly, and her boss on it
    for (let x = cx - 6; x <= cx + 6; x += 3) set(x, ty + 17, 'p'); // the tabard's ragged hem
    run(cx - 10, ty + 1, 'aaAa'); run(cx - 11, ty + 2, 'aAaaA'); run(cx + 5, ty, 'aaaAa'); run(cx + 5, ty + 1, 'aaaaAa'); set(cx + 9, ty - 1, 'e'); set(cx + 10, ty - 2, 'e'); // pauldrons, the front one spiked
    // head: big, low, pushed a little forward; a kettle helm with a brim, the face under it
    const hx = 23 + lean + (o.headDx || 0), hy = 2 + dy + (o.headDy || 0);
    run(hx - 6, hy - 3, o.plume === 'low' ? '.....' : 'cc...'); run(hx - 7, hy - 2, 'Cccc..'); run(hx - 6, hy - 1, '.Ccc');
    run(hx - 3, hy - 1, 'aaaaaaa'); run(hx - 4, hy, 'aAaaaaaaa'); run(hx - 4, hy + 1, 'aAaaaaaaaa'); run(hx - 6, hy + 2, 'AAAAAAAAAAAAAAA');
    run(hx - 3, hy + 3, 'ggggggggg'); run(hx - 3, hy + 4, 'ggggggeog'); run(hx - 3, hy + 5, 'gggggggggggg'); run(hx - 3, hy + 6, 'gGggggoooG'); run(hx - 2, hy + 7, 'GgggggggGG'); run(hx - 1, hy + 8, 'GGGGGGG');
    set(hx + 4, hy + 6, 'e'); set(hx + 2, hy + 7, 'e'); set(hx + 5, hy + 7, 'e'); // tusks
    run(hx + 7, hy + 4, 'gg'); run(hx + 8, hy + 5, 'ggG'); set(hx + 10, hy + 6, 'G'); // the nose
    run(hx - 8, hy + 2, 'gg'); run(hx - 9, hy + 1, 'gg'); set(hx - 10, hy, 'g'); run(hx - 7, hy + 3, 'Gg'); // an ear, out past the brim
    if (o.eyes === 'x') { set(hx + 3, hy + 4, 'o'); set(hx + 4, hy + 4, 'o'); }
    const sx = cx + 7, sy = ty + 3;
    const hand = o.hand || [sx + 3, sy + 6]; seg(sx, sy, hand[0], hand[1], 'a', 2); run(hand[0] - 1, hand[1], 'aAa');
    if (o.lance) lanceSeg(...o.lance);
    if (o.blade) { seg(hand[0], hand[1], o.blade[0], o.blade[1], 'f', 2); set(o.blade[0], o.blade[1], 'a'); }
    if (o.jav) { seg(o.jav[0], o.jav[1], o.jav[2], o.jav[3], 'u', 1); set(o.jav[2], o.jav[3], 'a'); }
    if (o.shield === 'front') shieldAt(o.sx !== undefined ? o.sx : tx + 12, (o.sy !== undefined ? o.sy : ty + 1));
    return R.map(r => r.join(''));
  };
  const f = rows => outline(fromGrid(rows, LP, 1), OUT);
  const up = { lance: [31, 30, 31, 1], hand: [30, 20] };
  const walkLegs = [[[19, 16, 0], [26, 29, 1]], [[19, 18, 2], [26, 27, 0]], [[19, 21, 0], [26, 24, 1]], [[19, 18, 0], [26, 27, 2]]];
  const frames = [
    make({ ...up, shield: 'back' }),
    ...walkLegs.map((legs, i) => make({ ...up, shield: 'back', legs, dy: i % 2 ? 1 : 0, lance: [31 + (i % 2), 30, 31 + (i % 2), 1 + (i % 2)] })),
    make({ shield: 'back', dy: 2, lean: -1, hand: [29, 19], lance: [18, 19, 46, 18], legs: [[19, 14, 0], [26, 30, 0]] }),
    make({ shield: 'back', dy: 2, lean: 1, hand: [30, 19], lance: [18, 19, 47, 19], legs: [[19, 13, 2], [26, 31, 0]], plume: 'low' }),
    make({ shield: 'back', dy: 1, lean: 1, hand: [30, 19], lance: [18, 19, 47, 19], legs: [[19, 20, 0], [26, 24, 3]], plume: 'low' }),
    make({ shield: 'back', lean: -2, hand: [24, 18], lance: [6, 18, 34, 17] }),
    make({ shield: 'back', lean: 2, dy: 1, hand: [34, 18], lance: [20, 18, 47, 18], legs: [[19, 14, 0], [26, 32, 0]] }),
    make({ shield: 'back', lean: -1, hand: [27, 10], lance: [12, 24, 36, 2] }),
    make({ shield: 'back', dy: 3, lean: 2, hand: [32, 24], lance: [18, 18, 46, 34], legs: [[19, 14, 0], [26, 31, 0]] }),
    make({ shield: 'back', dy: 2, lean: 1, hand: [31, 20], lance: [26, 16, 42, 36], legs: [[19, 15, 0], [26, 29, 0]], eyes: 'x' }),
    make({ shield: 'front', hand: [30, 24], blade: [36, 30] }),
    make({ shield: 'front', lean: -2, hand: [22, 12], blade: [16, 4] }),
    make({ shield: 'front', lean: 2, dy: 1, hand: [34, 22], blade: [44, 26], legs: [[19, 15, 0], [26, 31, 0]] }),
    make({ shield: 'front', sx: 31, dy: 3, lean: 1, hand: [29, 24], blade: [34, 30], legs: [[19, 13, 2], [26, 30, 0]] }),
    make({ shield: 'front', sx: 31, dy: 3, lean: 1, hand: [29, 24], blade: [34, 30], legs: [[19, 20, 0], [26, 25, 3]] }),
    make({ shield: 'back', lean: -3, dy: 1, headDx: -2, hand: [26, 12], legs: [[19, 15, 0], [26, 24, 0]], eyes: 'x' }),
    make({ shield: 'back', dy: 6, lean: 2, headDy: 1, hand: [34, 30], legs: [[19, 14, 0], [26, 32, 4]], eyes: 'x' }),
    make({ shield: 'back', dy: 5, hand: [29, 22], lance: [31, 36, 31, 6], legs: [[19, 15, 0], [26, 29, 0]] }),
    make({ shield: 'back', dy: -2, hand: [26, 22], lance: [25, 20, 25, 37], legs: [[19, 20, 4], [26, 25, 4]] }),
    make({ shield: 'back', lean: -2, hand: [20, 8], jav: [12, 10, 30, 4], lance: [36, 30, 36, 6] }),
    make({ shield: 'back', lean: 2, hand: [36, 14], lance: [38, 30, 38, 6] }),
    make({ shield: 'front', lean: -1, hand: [18, 10], lance: [4, 4, 16, 14] }),
    make({ shield: 'front', sx: 26, lean: -2, hand: [30, 20], lance: [32, 30, 32, 1] }),
    make({ shield: 'front', sx: 33, lean: 3, dy: 1, hand: [30, 20], lance: [28, 30, 28, 1], legs: [[19, 14, 0], [26, 31, 0]] }),
    make({ shield: 'front', hand: [30, 24], blade: [36, 30], dy: 1, legs: walkLegs[0] }),
    make({ shield: 'front', hand: [30, 24], blade: [36, 30], legs: walkLegs[2] }),
  ].map(f);
  return pack(frames, 24, 36, 26, 30);
}
// CHIMNEY SWEEP — a sooty goblin in a battered top hat, with a brush. He lives in the stacks and comes up out of
// them to throw soot. Frames: 0 up (brush on shoulder), 1 throw (arm over), 2 peeking (just the hat and eyes).
export function bakeSweep() {
  const SP = Object.assign({}, EP, { k: '#1e1a22', K: '#3a343e', g: '#5a7a3a', G: '#34462a', d: '#2a2630', t: '#b8a888' });
  const f = rows => outline(fromGrid(rows, SP, 1), OUT);
  const hat = ['...kkkk...', '...kKkk...', '..kkkkkk..'];
  const up = f([...hat, '..gggggg..', '.gdoggdog.', '.gggggggg.', '..gGGGGg..', '..dddddd.t', '..dddddd.t', '..dddddd.t', '..GG..GG.t', '.GG....GGt']);
  const thr = f([...hat, '..gggggg..', '.gdoggdog.', '.gggggggg.', '..gGGGGgtt', '..ddddddt.', '..dddddd..', '..dddddd..', '..GG..GG..', '.GG....GG.']);
  const peek = f(['..........', '..........', '..........', '..........', '..........', '..........', '...kkkk...', '...kKkk...', '..kkkkkk..', '..gdoggd..', '..........', '..........', '..........']);
  return pack([up, thr, peek], 6, 13, 8, 12);
}
// THE FACET — a crystal golem grown in the cavern's heart. 40×40. Frames: idle, walk1, walk2, stomp, throw, stagger. Four gems: brow, left shoulder, right shoulder, chest.
export function bakeGolem() {
  const GP = Object.assign({}, EP, { c: '#bfe6f5', C: '#7aa8c8', d: '#4a6a90', w: '#eefaff', g: '#ff7ab8', G: '#a8306a', k: '#2a3a50' });
  const f = rows => outline(fromGrid(rows, GP, 1), OUT);
  const W = 40, H = 40; const blank = () => Array.from({ length: H }, () => '.'.repeat(W));
  const put = (R, x, y, s) => { const row = R[y]; R[y] = row.slice(0, x) + s + row.slice(x + s.length); };
  const body = (legs) => { const R = blank();
    put(R, 16, 0, 'cccccccc'); put(R, 15, 1, 'cCccccccCc'); put(R, 14, 2, 'cCccggccccCc'); put(R, 14, 3, 'cCccggccccCc'); put(R, 14, 4, 'ccccccccccCc'); put(R, 15, 5, 'ckkccckkcc'); put(R, 15, 6, 'cwkccckwcc'); put(R, 16, 7, 'cccccccc'); put(R, 17, 8, 'dddddd');
    put(R, 4, 9, 'cccc........................cccc'); put(R, 3, 10, 'cggcccccccccccccccccccccccccccggc'); put(R, 2, 11, 'cggccCccccccccccccccccccccCccggc'); put(R, 2, 12, 'ccccccCcccccccccccccccccccCccccc'); put(R, 3, 13, 'CcccccccCcccccccccccccccccccccC');
    put(R, 4, 14, 'ddccccccc.ccccccccccc.cccccccdd'); for (let y = 15; y <= 20; y++) put(R, 5, y, 'dcccc.....ccccccccccccc.....ccccd'); put(R, 5, 17, 'dcccc.....cccccggggcccc.....ccccd'); put(R, 5, 18, 'dcccc.....cccccggggcccc.....ccccd');
    put(R, 5, 21, 'dccccc....cccccccccccc....cccccd'); put(R, 6, 22, 'dcccc.....CcccccccccccC.....ccccd'); put(R, 7, 23, 'ddd.......cccccccccccc.......ddd'); put(R, 12, 24, 'ddcccccccccccccdd'); put(R, 12, 25, 'dcccccccccccccccd');
    const L1 = legs === 1 ? [13, 23] : legs === 2 ? [11, 25] : [12, 24];
    for (const lx of L1) { for (let y = 26; y <= 33; y++) put(R, lx, y, 'Cccc'); put(R, lx - 1, 34, 'CccccC'); put(R, lx - 1, 35, 'dddddd'); }
    return R; };
  const idle = f(body(0)), walk1 = f(body(1)), walk2 = f(body(2));
  const stomp = f((() => { const R = body(0); for (let y = 9; y <= 14; y++) put(R, 30, y, 'cccc'); put(R, 30, 8, 'Cccc'); put(R, 30, 7, 'cccc'); put(R, 31, 6, 'ccc'); return R; })());
  const thr = f((() => { const R = body(0); put(R, 33, 6, 'cccc'); put(R, 34, 5, 'cccc'); put(R, 35, 4, 'ccc'); put(R, 36, 2, 'ww'); put(R, 35, 3, 'www'); put(R, 36, 1, 'w'); return R; })());
  const stagger = f((() => { const R = body(0); put(R, 15, 5, 'cwkccckwcc'); put(R, 15, 6, 'ckkccckkcc'); put(R, 14, 2, 'cCccGGccccCc'); put(R, 14, 3, 'cCccGGccccCc'); return R; })());
  // 6 shroud: both arms thrown wide and up, the ice coming with them
  const shroud = f((() => { const R = body(0); for (const [ax, up] of [[3, 1], [33, 1]]) { for (let y = 9; y >= 5; y--) put(R, ax, y, 'cccc'); put(R, ax, 4, 'Cccc'); put(R, ax + (ax > 20 ? 1 : -1), 3, 'wcc'); } return R; })());
  // 7 drink: it takes the beam in. Head back, chest open, every gem burning.
  const drink = f((() => { const R = body(0); put(R, 14, 2, 'cCccwwccccCc'); put(R, 14, 3, 'cCccwwccccCc');
    put(R, 5, 16, 'dcccc.....ccccwwwwcccc.....ccccd'); put(R, 5, 17, 'dcccc.....cccwwwwwwccc.....ccccd'); put(R, 5, 18, 'dcccc.....cccwwwwwwccc.....ccccd'); put(R, 5, 19, 'dcccc.....ccccwwwwcccc.....ccccd');
    for (const ax of [3, 33]) { for (let y = 9; y >= 7; y--) put(R, ax, y, 'cccc'); put(R, ax, 6, 'Cccc'); } return R; })());
  // 8 counter: it throws the light back. Head down, one arm out level, the chest a furnace.
  const counter = f((() => { const R = body(0); put(R, 15, 5, 'ckkccckkcc'); put(R, 15, 6, 'cggccckgcc');
    put(R, 5, 17, 'dcccc.....cccwwwwwwccc.....ccccd'); put(R, 5, 18, 'dcccc.....cccwwwwwwccc.....ccccd');
    for (let x = 30; x <= 36; x += 3) put(R, x, 12, 'ccc'); put(R, 36, 11, 'www'); put(R, 36, 13, 'www'); put(R, 33, 11, 'ccc'); put(R, 33, 13, 'ccc'); return R; })());
  return pack([idle, walk1, walk2, stomp, thr, stagger, shroud, drink, counter], 20, 36, 30, 34);
}
// The moor hare — fast, low, and it runs with the wind. 12×8. Frames: run1, run2, sit.
export function bakeHare() {
  const HP2 = Object.assign({}, EP, { h: '#8a6a4a', H: '#5a4230', w: '#e8dcc0', r: '#c9463d' });
  const q = rows => outline(fromGrid(rows, HP2, 1), OUT);
  const run1 = q(['.........hh.', '........hhh.', '...hhhhhhhe.', '..hhhhhhhhh.', '.whhhhhhhhh.', '.hhhhhhhhw..', 'hh..hh..hh..', 'h....h....h.']);
  const run2 = q(['.........hh.', '........hhh.', '...hhhhhhhe.', '..hhhhhhhhh.', '.whhhhhhhhh.', '.hhhhhhhhw..', '..hhhh.hhh..', '..h..h..h...']);
  const sit = q(['........hh..', '........hhh.', '....hhhhhhe.', '...hhhhhhhh.', '..whhhhhhhh.', '..hhhhhhhhw.', '..hhhhhhhh..', '...hh...hh..']);
  return pack([run1, run2, sit], 6, 8, 10, 7);
}
// The peat wight — a pale hand of bog-mist that rises where you stand too long. 10×14. Frames: rise1, rise2.
export function bakeWight() {
  const WP2 = Object.assign({}, EP, { m: '#c8d8c8', M: '#8aa08a', k: '#3a3a2a' });
  const q = rows => outline(fromGrid(rows, WP2, 1), OUT);
  const rise1 = q(['..m..m..m.', '..m..m..m.', '.mmmmmmmm.', '.mMmmmmMm.', '.mmkmmkmm.', '.mmmmmmmm.', '..mmmmmm..', '..mMmmMm..', '...mmmm...', '...mmmm...', '..mmMMmm..', '..mmmmmm..', '.mm.mm.mm.', 'm...m...m.']);
  const rise2 = q(['.m..m..m..', '..m..m..m.', '.mmmmmmmm.', '.mMmmmmMm.', '.mmkmmkmm.', '.mmmmmmmm.', '..mmmmmm..', '..mMmmMm..', '...mmmm...', '..mmmmmm..', '..mmMMmm..', '.mmmmmmmm.', '.mm.mm.mm.', '.m...m...m']);
  const rise3 = q(['m...m...m.', '.m..m..m..', '.mmmmmmmm.', '.mMmmmmMm.', '.mmkmmkmm.', '.mmmmmmmm.', '..mmmmmm..', '..mMmmMm..', '...mmmm...', '...mmmm...', '..mmMMmm..', '.mmmmmmm..', '.m.mm.mm..', '..m...m..m']);
  const rise4 = q(['...m..m..m', '..m..m..m.', '.mmmmmmmm.', '.mMmmmmMm.', '.mmkmmkmm.', '.mmmmmmmm.', '..mmmmmm..', '..mMmmMm..', '...mmmm...', '..mmmmmm..', '..mmMMmm..', '..mmmmmmm.', '..mm.mm.m.', 'm...m...m.']);
  return pack([rise1, rise2, rise3, rise4], 5, 14, 8, 13);
}
// The glow grub — a fat cave larva that lights its own way and spits acid. 16×8. Frames: crawl1, crawl2, spit.
export function bakeGrub() {
  const GP = Object.assign({}, EP, { g: '#b8d878', G: '#7a9a48', p: '#e8ff9a', P: '#ffffc8', k: '#3a3a2a' });
  const q = rows => outline(fromGrid(rows, GP, 1), OUT);
  const crawl1 = q(['......gggggggg..', '..ggggGgggGgggg.', '.gGggggggggggggP', 'gkggGgggGgggGgpP', 'gkgggggggggggggP', '.gGggggggggggggP', '..ggggGgggGgggg.', '...gg..gg..gg...']);
  const crawl2 = q(['......gggggggg..', '..ggggGgggGgggg.', '.gGggggggggggggP', 'gkggGgggGgggGgpP', 'gkgggggggggggggP', '.gGggggggggggggP', '..ggggGgggGgggg.', '.gg..gg..gg.....']);
  const spit = q(['......gggggggg..', '.gggggGgggGgggg.', 'gkGggggggggggggP', 'gkkgGgggGgggGgpP', 'gkgggggggggggggP', '.gGggggggggggggP', '..ggggGgggGgggg.', '...gg..gg..gg...']);
  return pack([crawl1, crawl2, spit], 8, 8, 14, 7);
}
// The rock goblin — a mine goblin in a stone-scale hood who throws lanterns. 12×11. Frames: walk1, walk2, throw.
export function bakeRockGoblin() {
  const RG = Object.assign({}, KG, { h: '#8a919c', H: '#5a6270', y: '#ffd36b', l: '#ff9a5c' });
  const r = rows => outline(fromGrid(rows, RG, 1), OUT);
  const head = ['...hhhhhh...', '..hHhhhhHh..', '..hhhhhhhh..', '..ggeoggeo..', '...gggggg...', '...gGGGGg...'];
  const walk1 = r([...head, '..xxxxxxx.y.', '.xxxxxxxx.l.', '..xxxxxx..y.', '..GG..GG....', '.GG....GG...']);
  const walk2 = r([...head, '..xxxxxxx.y.', '.xxxxxxxx.l.', '..xxxxxx..y.', '...GGGG.....', '...GG.GG....']);
  const thr = r(['...hhhhhh..y', '..hHhhhhHh.l', '..hhhhhhhh.y', '..ggeoggeoxx', '...gggggg.x.', '...gGGGGg...', '..xxxxxxx...', '.xxxxxxxx...', '..xxxxxx....', '..GG..GG....', '.GG....GG...']);
  return pack([walk1, walk2, thr], 7, 12, 10, 11);
}
// THE FORGEMASTER, at twice the size: a hulking smith in a steam rig. Boiler pack on his back, a furnace grate for a belly, a hammer arm as long as he is tall. 48×34.
// Frames: idle, raise, slam, drag, hurl, stun, breath.
export function bakeForgemasterBig() {
  const FP = Object.assign({}, KG, { i: '#8a919c', I: '#5a6270', c: '#6a4a3a', C: '#3a2a24', y: '#ffd36b', s: '#e8e0d0', k: '#3a3a44', K: '#22222c', r: '#ff6b2c', R: '#ffd36b', x: '#c9463d' });
  const f = rows => outline(fromGrid(rows, FP, 1), OUT);
  const W = 48, H = 34; const blank = () => Array.from({ length: H }, () => '.'.repeat(W));
  const put = (rows, x, y, str) => { const row = rows[y]; rows[y] = row.slice(0, x) + str + row.slice(x + str.length); };
  const body = (eyes = 'ey', mouth = 'GGG', step = 0) => { const R = blank();
    // helmet, goggles, jaw
    put(R, 18, 0, 'iiiiiiiiii'); put(R, 17, 1, 'iiIIIIIIIIii'); put(R, 16, 2, 'iyyIIIIIIyyIi'); put(R, 16, 3, 'iy' + eyes[0] + 'yIIIIy' + eyes[1] + 'yIi'); put(R, 16, 4, 'iIIIIIIIIIIIi');
    put(R, 17, 5, 'gggggggggggg'); put(R, 17, 6, 'gg' + mouth + 'ggg' + mouth + 'gg'); put(R, 18, 7, 'ggggggggggg');
    // boiler pack
    put(R, 6, 8, 'kkkkkk'); put(R, 5, 9, 'kKKKKKKk'); put(R, 5, 10, 'kKKKKKKk'); put(R, 4, 11, 'kkKKKKKKkk'); for (let y = 12; y <= 16; y++) put(R, 4, y, 'kKKKKKKKKk'); put(R, 4, 17, 'kkKKKKKKkk'); put(R, 5, 18, 'kKKKKKKk'); put(R, 5, 19, 'kkkkkkkk'); put(R, 8, 5, 'ii'); put(R, 8, 6, 'ii'); put(R, 8, 7, 'ii'); // the chimney
    // torso and apron with the furnace grate
    put(R, 15, 8, 'IIIIIIIIIIIIIII'); put(R, 14, 9, 'IiiiiiiiiiiiiiiI'); put(R, 14, 10, 'IiiiiiiiiiiiiiiI'); put(R, 14, 11, 'IiicccccccccciiI'); put(R, 14, 12, 'IiccCCCCCCCCcciI');
    for (let y = 13; y <= 16; y++) put(R, 14, y, 'IiccCrrrrrrCcciI'); put(R, 14, 17, 'IiccCCCCCCCCcciI'); put(R, 14, 18, 'IiicccccccccciiI'); put(R, 14, 19, 'IiiiiiiiiiiiiiiI'); put(R, 15, 20, 'IIIIIIIIIIIIIII'); put(R, 16, 21, 'ccccccccccccc');
    // legs and boots
    // a stride: one leg planted back, the other swung forward with its boot lifted (step 1 and -1 are the two halves)
    const legs = step === 0 ? [[16, 0, 0], [24, 0, 0]] : step > 0 ? [[14, 0, -1], [26, 2, 1]] : [[18, 2, 1], [22, 0, -1]];
    for (const [lx, lift, lean] of legs) { put(R, lx - lean, 22, 'IIIII'); for (let y = 23; y <= 25; y++) put(R, lx - (y < 24 ? lean : 0), y, 'IiiiI'); put(R, lx, 26 - lift, 'IIIII'); put(R, lx - 1, 27 - lift, 'IIIIII'); put(R, lx - 1, 28 - lift, 'IiiiiI'); put(R, lx - 1, 29 - lift, 'IIIIII'); put(R, lx - 2, 30 - lift, 'KKKKKKK'); put(R, lx - 2, 31 - lift, 'KKKKKKK'); }
    return R; };
  const hammerDown = R => { put(R, 30, 9, 'iii'); put(R, 31, 10, 'Iii'); put(R, 32, 11, 'Iii'); put(R, 33, 12, 'Iii'); put(R, 34, 13, 'Iii'); put(R, 35, 14, 'Iii'); put(R, 36, 15, 'Iii'); put(R, 37, 16, 'Iii'); put(R, 38, 17, 'Iii'); put(R, 38, 18, 'ccc'); for (let y = 19; y <= 26; y++) put(R, 39, y, 'c'); put(R, 35, 27, 'KKKKKKKKK'); put(R, 35, 28, 'KKKKKKKKK'); put(R, 35, 29, 'KKKKKKKKK'); put(R, 35, 30, 'KKKKKKKKK'); put(R, 35, 31, 'KKKKKKKKK'); return R; };
  const hammerUp = R => { put(R, 30, 9, 'iii'); put(R, 32, 8, 'Iii'); put(R, 34, 7, 'Iii'); put(R, 36, 6, 'Iii'); put(R, 38, 5, 'Iii'); put(R, 39, 4, 'cc'); for (let y = 0; y <= 3; y++) put(R, 40, y, 'c'); put(R, 36, 0, 'KKKKKKKKK'); put(R, 36, 1, 'KKKKKKKKK'); put(R, 36, 2, 'KKKKKKKKK'); return R; };
  const hammerSlam = R => { put(R, 30, 9, 'iii'); for (let x = 33; x <= 44; x += 3) put(R, x, 10 + (x - 30) / 3 * 0, 'iii'); put(R, 33, 10, 'Iii'); put(R, 36, 10, 'Iii'); put(R, 39, 10, 'Iii'); put(R, 42, 11, 'ccc'); for (let y = 12; y <= 25; y++) put(R, 44, y, 'c'); put(R, 39, 26, 'KKKKKKKKK'); put(R, 39, 27, 'KKKKKKKKK'); put(R, 39, 28, 'KKKKKKKKK'); put(R, 39, 29, 'KKKKKKKKK'); put(R, 39, 30, 'KKKKKKKKK'); put(R, 39, 31, 'KKKKKKKKK'); return R; };
  const armOut = R => { put(R, 30, 12, 'iii'); put(R, 33, 12, 'iiiiiiiiiiiiii'); put(R, 33, 13, 'IIIIIIIIIIIIII'); put(R, 46, 11, 'y'); put(R, 46, 12, 'yy'); put(R, 46, 13, 'yy'); put(R, 46, 14, 'y'); return R; };
  const idle = f(hammerDown(body()));
  const raise = f(hammerUp(body()));
  const slam = f(hammerSlam(body()));
  const drag = f(armOut(body()));
  const hurl = f(hammerUp(body('ey', 'GGG')));
  const stun = f((() => { const R = body('xx', 'ggg'); put(R, 30, 12, 'iii'); put(R, 30, 13, 'iii'); put(R, 31, 14, 'Ii'); put(R, 31, 15, 'Ii'); put(R, 31, 16, 'Ii'); put(R, 31, 17, 'cc'); put(R, 30, 18, 'KKKK'); return R; })());
  const breath = f((() => { const R = body('rr', 'rrr'); put(R, 18, 6, 'grrrrrrrrrg'); put(R, 18, 7, 'grrrRRRrrrg'); put(R, 30, 5, 'rrRRRRrr'); put(R, 33, 6, 'rrRRrr'); put(R, 30, 7, 'rrrrr'); return hammerDown(R); })());
  const walkA = f(hammerDown(body('ey', 'GGG', 1))), walkB = f(hammerDown(body('ey', 'GGG', -1)));
  return pack([idle, raise, slam, drag, hurl, stun, breath, walkA, walkB], 24, 32, 40, 32);
}
// The Forgemaster — a goblin engineer strapped into a steam rig: piston arm, boiler pack, goggles. 32×26. Frames: idle, lunge, spray, kick, scalded.
export function bakeForgemaster() {
  const FP2 = Object.assign({}, KG, { i: '#8a919c', I: '#5a6270', c: '#6a4a3a', C: '#3a2a24', y: '#ffd36b', s: '#e8e0d0' });
  const f = rows => outline(fromGrid(rows, FP2, 1), OUT);
  const headR = ['..........gggggg................', '.........ggyyggyg...............', '.........gggggggg...............', '..........ggGGgg................'];
  const pack1 = ['....cccc........................', '...cCccCc.......................', '...ccccccc......................', '...cCccCc.......................', '....cccc........................'];
  const idle = f([...headR, '.....IIIIiiiiiiiI...............', '.cccciiiiiiiiiiiiI..............', 'cCccCiiiiiiiiiiiiiIII...........', 'ccccciiiiiiiiiiiiiiiII..........', 'cCccCiiiiiiiiiiiiI..I...........', '.cccciiiiiiiiiiiiI..............', '.....IIIIiiiiiiII...............', '......II......II................', '......II......II................', '.....III.....III................']);
  const lunge = f([...headR, '.....IIIIiiiiiiiI...............', '.cccciiiiiiiiiiiiIIIIIIIIIIII...', 'cCccCiiiiiiiiiiiiiiiiiiiiiiiiIII', 'ccccciiiiiiiiiiiiIIIIIIIIIIIIIII', 'cCccCiiiiiiiiiiiiI..............', '.cccciiiiiiiiiiiiI..............', '.....IIIIiiiiiiII...............', '......II......II................', '......II......II................', '.....III.....III................']);
  const spray = f([...headR, '.....IIIIiiiiiiiI....ssss.......', '.cccciiiiiiiiiiiiI..sssssss.....', 'cCccCiiiiiiiiiiiiiIIIsssssssss..', 'ccccciiiiiiiiiiiiiiiIIsssssss...', 'cCccCiiiiiiiiiiiiI....ssss......', '.cccciiiiiiiiiiiiI..............', '.....IIIIiiiiiiII...............', '......II......II................', '......II......II................', '.....III.....III................']);
  const kick = f([...headR, '.....IIIIiiiiiiiI...............', '.cccciiiiiiiiiiiiI..............', 'cCccCiiiiiiiiiiiiiIII...........', 'ccccciiiiiiiiiiiiiiiII..........', 'cCccCiiiiiiiiiiiiI..I...........', '.cccciiiiiiiiiiiiI..............', '.....IIIIiiiiiiII...............', '......II........IIIIII..........', '......II..............II........', '.....III........................']);
  const scald = f(['..........gggggg......s.........', '.........ggoogggg....sss........', '.........gggRRggg...s.s.........', '..........ggGGgg................', '.....IIIIiiiiiiiI...............', '.cccciiiiiiiiiiiiI..............', 'cCccCiiiiiiiiiiiiiI.............', 'cccccisiiiisiiiiiii.............', 'cCccCiiiiiiiiiiiiI..............', '.cccciiiiiiiiiiiiI..............', '.....IIIIiiiiiiII...............', '......II......II................', '.....II........II...............', '....III.........III.............']);
  return pack([idle, lunge, spray, kick, scald], 14, 15, 26, 22);
}

// The shaman of the moor: a goblin in a purple robe under an antler headdress, bone beads, a crooked staff with a lit knot. 16x18. idle / cast / blink
// THE SNUFFER - a hooded goblin with a long snuffing cone on a pole. It does not want you; it wants the lamps out.
// 12x14, faces right. Frames: 0 walk1, 1 walk2, 2 reach (the cone up, about to snuff), 3 swipe (the pole across).
export function bakeSnuffer() {
  const NP = Object.assign({}, EP, { h: '#3a3448', H: '#1e1a2a', u: '#8a5a32', U: '#5c3a1d', z: '#5f5a52', Z: '#3a3444' });
  const f = rows => outline(fromGrid(rows, NP, 1), OUT);
  const hood = ['...hhhhhh...', '..hHhhhhHh..', '..hHgeogeh..', '..hhgggggh..', '...hhhhhh...'];
  const torso = ['..hhhhhhhh..', '.hHhhhhhhHh.', '.hhhhhhhhhh.', '..hhhhhhhh..'];
  const legA = ['..GG....GG..', '..GG....GG..', '.GGG....GGG.'];
  const legB = ['...GG..GG...', '..GG....GG..', '.GG......GG.'];
  // the pole and the cone: carried low while it walks, up when it reaches, level when it swings
  const poleLow = ['..........u.', '..........u.', '.........zZ.', '.........zz.'];
  const poleUp = ['.........zz.', '.........zZ.', '..........u.', '..........u.'];
  const put = (base, over) => base.map((r, i) => over[i] ? merge(over[i], r) : r);
  const walk1 = f([...hood, ...put(torso, poleLow), ...legA]);
  const walk2 = f([...hood, ...put(torso, poleLow), ...legB]);
  const reach = f(['.........zz.', '.........zZ.', ...hood.map((r, i) => i < 2 ? merge('..........u.', r) : r), ...torso, ...legA]);
  const swipe = f([...hood, ...torso.map((r, i) => i === 1 ? merge('.....uuuuzZ.', r) : i === 2 ? merge('.........zz.', r) : r), ...legB]);
  return pack([walk1, walk2, reach, swipe], 6, 15, 10, 14);
}

// THE SAILER - a moor goblin behind a plank of sail. Planted, it is nothing; in a gust it is a battering ram.
// 14x14, faces right. Frames: 0 planted (sail down, braced), 1 sailing (sail up, feet off), 2 tumbled (over on its back).
export function bakeSailer() {
  const LP = Object.assign({}, EP, { c: '#c9b27c', C: '#8a7a58', u: '#8a5a32', U: '#5c3a1d', q: '#c9463d' });
  const f = rows => outline(fromGrid(rows, LP, 1), OUT);
  const planted = f([
    '..............', '..............', '..............',
    '...gggg....u..', '..ggeoge...u..', '..gggggg..cc..', '...gGGGg..cq..',
    '..GGGGGGG.cc..', '.GGgggggG.cc..', '.GGgggggG.cc..', '..GgggggG.cc..',
    '..GG...GG.cc..', '..GG...GG.Cc..', '.GGG...GGGCC..']);
  const sailing = f([
    '.......ccccccc', '.......cqqqqqc', '.......ccccccc',
    '...gggg...u...', '..ggeoge..u...', '..gggggg..u...', '...gGGGg..u...',
    '.GGGGGGGG.u...', 'GGgggggGG.u...', 'GGgggggGG.u...', '.GgggggGG.u...',
    '..GG..GG......', '.GG....GG.....', '..............']);
  const tumbled = f([
    '..............', '..............', '..............', '..............',
    '..............', '..cccccccccc..', '..cqqqqqqqqc..',
    '..cccccccccc..', '.GGGGGGG..u...', 'GGgggeoGG.u...', 'GGgggggGG.u...',
    '.GG..GG.......', 'GG....GG......', '..............']);
  return pack([planted, sailing, tumbled], 7, 15, 12, 14);
}

// ---------- STORMHOLD ----------
// THE HEARTH GOBLIN - it lives here. It sleeps by the fire until you are close and then it fights
// with whatever is to hand: a stool. 12x13. Frames: 0 asleep, 1 waking, 2 raise, 3 swing, 4/5 walk.
export function bakeHearthGob() {
  const HP = Object.assign({}, EP, { q: '#8a5a32', Q: '#5c3a1d', c: '#c9463d', u: '#6a4a2a' });
  const f = rows => outline(fromGrid(rows, HP, 1), OUT);
  const head = ['..gggggg....', '.ggeoggeog..', '.gggggggg...', '..gGGGGg....'];
  const shut = ['..gggggg....', '.ggQQggQQg..', '.gggggggg...', '..gGGGGg....'];
  const body = ['..cccccc....', '.cggggggc...', '.cggggggc...', '..cccccc....', '..GG..GG....', '.GGG..GGG...'];
  const stool = ['....uuuu....', '....u..u....'];
  const P = '............';
  const asleep = f([P, P, '...zzz......', ...shut, '..cccccc....', '.cggggggc...', '.cggggggc...', '..cccccc....', '..GGGGGG....', '.GG....GG...']);
  const waking = f([P, ...head, ...body, P]);
  const raise = f([...stool, ...head, ...body]);
  const swing = f([P, ...head, '..cccccc.uu.', '.cggggggcuu.', '.cggggggc...', '..cccccc....', '..GG..GG....', '.GGG..GGG...', P]);
  const walkA = f([P, ...head, ...body.slice(0, 4), '..GG...GG...', '.GG.....GG..']);
  const walkB = f([P, ...head, ...body.slice(0, 4), '...GGGG.....', '..GG..GG....']);
  return pack([asleep, waking, raise, swing, walkA, walkB], 6, 14, 10, 13);
}

// THE ROPE CUTTER - he is not interested in you. He is interested in the rope. 12x13.
// Frames: 0 walk, 1 raise (axe up), 2 chop (axe into the rope), 3 backing off.
export function bakeCutter() {
  const CP = Object.assign({}, EP, { a: '#8a919c', A: '#5a6270', u: '#8a5a32', U: '#5c3a1d' });
  const f = rows => outline(fromGrid(rows, CP, 1), OUT);
  const head = ['..gggggg....', '.ggeoggeog..', '.gggggggg...', '..gGGGGg....'];
  const torso = ['..bbbbbb....', '.bbbbbbbb...', '.bbbbbbbb...', '..bbbbbb....'];
  const legsA = ['..GG..GG....', '.GGG..GGG...'], legsB = ['...GGGG.....', '..GG..GG....'];
  const P = '............';
  const walk = f([P, ...head, ...torso, ...legsA]);
  const raise = f(['........aaa.', '........aAa.', '.........u..', ...head, ...torso.map((r, i) => i === 1 ? r.slice(0, 9) + 'u..' : r), ...legsB]);
  const chop = f([P, ...head, '..bbbbbb....', '.bbbbbbbbu..', '.bbbbbbbaaa.', '..bbbbb.aAa.', ...legsA]);
  const back = f([P, ...head, ...torso, '..GG...GG...', '.GG.....GG..']);
  return pack([walk, raise, chop, back], 6, 14, 10, 13);
}

// THE QUEEN'S LANCE - the biggest goblin in the game, in plate, with a lance he cannot steer.
// 40x34. Frames: 0 stand, 1/2 walk, 3 couch (lance levelled), 4 charge, 5 thrust, 6 sweep,
// 7 planted (the lance in a post, and him with it), 8 shield stance, 9 shield swing, 10 stagger.
export function bakeLance() {
  const LP = Object.assign({}, EP, { a: '#9aa3b0', A: '#5a6270', c: '#c9463d', C: '#8f2f28', u: '#8a5a32', U: '#5c3a1d', y: '#e0b040', m: '#3a3e48' });
  const W = 40, H = 34; const blank = () => Array.from({ length: H }, () => '.'.repeat(W));
  const put = (R, x, y, str) => { if (y < 0 || y >= H) return; const row = R[y]; R[y] = row.slice(0, x) + str + row.slice(x + str.length); };
  const f = rows => outline(fromGrid(rows, LP, 1), OUT);
  const body = legs => { const R = blank();
    // a great helm with a red crest, and the shoulders of someone who has never lost
    put(R, 14, 0, '..cc..'); put(R, 13, 1, '.cccc.'); put(R, 12, 2, 'aaaaaaaa');
    put(R, 12, 3, 'aAaaaaAa'); put(R, 12, 4, 'aooaaooa'); put(R, 12, 5, 'aaaaaaaa'); put(R, 13, 6, 'aAAAAa');
    put(R, 8, 7, 'aaaaaaaaaaaaaa'); put(R, 7, 8, 'aAaaaaaaaaaaaAa');
    put(R, 7, 9, 'aAaccccccccaaAa'); put(R, 7, 10, 'aAaccyyccccaaAa'); put(R, 7, 11, 'aAaccccccccaaAa');
    put(R, 8, 12, 'aaaaaaaaaaaaaa'); put(R, 9, 13, 'aaaaaaaaaaaa'); put(R, 9, 14, 'mmmmmmmmmmmm');
    put(R, 9, 15, 'aaaaaaaaaaaa'); put(R, 10, 16, 'aaaaaaaaaa');
    const L1 = legs === 1 ? [[10, 20], [22, 20]] : legs === 2 ? [[8, 22], [24, 18]] : [[11, 21], [21, 21]];
    for (const [lx, sk] of L1) { for (let y = 17; y <= 27; y++) put(R, lx + (y > 22 ? (sk > 20 ? 1 : -1) : 0), y, 'aAaa'); put(R, lx - 1, 28, 'aaaaaa'); put(R, lx - 1, 29, 'AAAAAA'); }
    return R; };
  const lanceAt = (R, y, x0, len) => { put(R, x0, y, 'u'.repeat(Math.min(len, W - x0))); put(R, Math.min(W - 3, x0 + len), y - 1, 'aa'); put(R, Math.min(W - 3, x0 + len), y, 'aAa'); put(R, Math.min(W - 3, x0 + len), y + 1, 'aa'); };
  const stand = (() => { const R = body(0); for (let y = 4; y <= 16; y++) put(R, 24, y, 'u'); put(R, 23, 2, 'aAa'); put(R, 23, 3, 'aa'); return R; })();
  const walk1 = (() => { const R = body(1); for (let y = 4; y <= 16; y++) put(R, 24, y, 'u'); put(R, 23, 2, 'aAa'); return R; })();
  const walk2 = (() => { const R = body(2); for (let y = 4; y <= 16; y++) put(R, 25, y, 'u'); put(R, 24, 2, 'aAa'); return R; })();
  const couch = (() => { const R = body(0); lanceAt(R, 11, 16, 18); return R; })();
  const charge = (() => { const R = body(1); lanceAt(R, 12, 14, 24); return R; })();
  const thrust = (() => { const R = body(2); lanceAt(R, 10, 18, 21); return R; })();
  const sweep = (() => { const R = body(1); for (let i = 0; i < 22; i++) put(R, 16 + i, 16 - Math.floor(i / 3), 'u'); put(R, 37, 10, 'aAa'); return R; })();
  const planted = (() => { const R = body(0); for (let i = 0; i < 16; i++) put(R, 20 + i, 12 + Math.floor(i / 3), 'u'); put(R, 35, 17, 'aAa'); return R; })();
  const guard = (() => { const R = body(0); for (let y = 6; y <= 18; y++) put(R, 25, y, 'aAaa'); put(R, 25, 5, 'aaaa'); put(R, 26, 11, 'yy'); return R; })();
  const guardHit = (() => { const R = body(2); for (let y = 4; y <= 12; y++) put(R, 27, y, 'aAaa'); put(R, 24, 13, 'aaaaa'); return R; })();
  const stagger = (() => { const R = body(0); put(R, 12, 4, 'aXXaaXXa'.replace(/X/g, 'o')); put(R, 13, 1, '.cccc.'); for (let y = 6; y <= 14; y++) put(R, 27, y, 'u'); return R; })();
  return pack([stand, walk1, walk2, couch, charge, thrust, sweep, planted, guard, guardHit, stagger].map(f), 20, 30, 26, 30);
}

// SHARDLING - a knot of crystal that walks. It goes off when it dies, so mind where you are standing.
// 10x11. Frames: 0/1 walk, 2 bristling (about to burst).
export function bakeShardling() {
  const SP2 = Object.assign({}, EP, { c: '#bfe6f5', C: '#7aa8c8', w: '#eefaff', d: '#4a6a90' });
  const f = rows => outline(fromGrid(rows, SP2, 1), OUT);
  const a1 = f(['..c..c....', '.cccccc...', 'ccwccwcc..', 'ccccccccc.', '.cCcccCc..', '..ccccc...', '..dc.cd...', '..d...d...']);
  const a2 = f(['...c.c....', '..cccc....', '.ccwccwcc.', 'ccccccccc.', '.cCcccCc..', '..ccccc...', '..d.c.d...', '...d.d....']);
  const up = f(['.c..c..c..', 'cccccccc..', 'cwccccwc..', 'ccccccccc.', 'cwCcccCwc.', '.ccccccc..', '..dc.cd...', '..d...d...']);
  return pack([a1, a2, up], 5, 12, 9, 11);
}

// THE SUNCATCHER - it has been drinking this mountain's light since before the wood, and it gives it
// back as glass. 34x30. Frames: 0 still, 1/2 turning, 3 drink (open, taking the sun), 4 throw,
// 5 raise (a spire coming up), 6 struck, 7 dimmed.
// THE ROC - the harpies' mother, as big as a cart, nesting on the Sunspire's peak. A thousand years in
// the glare have turned the ends of her feathers to glass: a crystal crest, glass-tipped primaries, and
// she sheds them. 60x44, facing right, anchored at her talons. Frames: 0-2 hover (wings up, level,
// down), 3 screech, 4 dive, 5 gust (wings swept forward), 6 grounded (wings down in the glass),
// 7 stagger (head thrown up), 8 down.
// THE SENTRY - one of the Queen's castle watch: a kettle helm, her purple and gold, and legs that are for
// running to a bell. 10x10. Frames: walk1, walk2, alarm (arms up, shouting), run1, run2.
export function bakeSentry() {
  const QP = Object.assign({}, EP, { b: '#5a2a7a', B: '#3a1850', y: '#e0b040' });
  const f = rows => outline(fromGrid(rows, QP, 1), OUT);
  const helm = ['...SSSS...', '..SssssS..', '.SSSSSSSS.'], head = ['.geoggeog.', '.gggggggg.', '..gGGGGg..'], tab = ['..bbybbb..', '..bBbbBb..'];
  const L1 = ['..GG..GG..', '.GG....GG.'], L2 = ['..GG.GG...', '..GG..GG..'], R1 = ['.GG....GG.', 'GG......GG'], R2 = ['...GGGG...', '..GG..GG..'];
  const alarm = f(['g..SSSS..g', '.gSssssSg.', '.SSSSSSSS.', '.geoggeog.', '.gggoogg..', '..gGGGGg..', ...tab, ...L1]);
  return pack([f([...helm, ...head, ...tab, ...L1]), f([...helm, ...head, ...tab, ...L2]), alarm, f([...helm, ...head, ...tab, ...R1]), f([...helm, ...head, ...tab, ...R2])], 6, 11, 8, 10);
}
// THE GOBLIN QUEEN - old, huge and clever. An iron crown with red stones, ears like a bat's, a hooked nose
// and a grin with two tusks, an ermine collar over a gown of the Queen's purple, a cape the colour of old
// blood behind it, and an iron sceptre the length of a knight. 56x72, facing right, anchored at her feet.
// Frames: 0 seated, 1 seated pointing, 2 seated throwing, 3 stand, 4 walk1, 5 walk2, 6 slam raised,
// 7 slam down, 8 sweep, 9 charge, 10 dazed, 11 leap, 12 throw slate, 13 struck (the storm in her crown), 14 down.
export function bakeGoblinQueen() {
  const C = { g: '#6faa4a', G: '#3f6e2c', d: '#2c4a1e', p: '#5a2a7a', P: '#3a1850', q: '#7a3a9a', y: '#e0b040', Y: '#a0781c', w: '#f2ece0', k: '#1b1626', r: '#7a1c24', R: '#4a0e14',
    i: '#5a6270', I: '#3a3e48', j: '#8a919c', m: '#c9463d', e: '#ffd36b', t: '#f3f0d2', n: '#9a5aa8' };
  const W = 56, H = 72;
  const frame = ({ sit = 0, lean = 0, dy = 0, flare = 0, arm = [34, 26, 42, 30], arm2 = null, rod = null, head = 'grin', tilt = 0, feet = [[24, 58], [31, 58]], stars = 0, rot = 0 }) => {
    const [c, g] = canvas(W, H);
    g.translate(0, 12); // headroom for the crown's points
    g.save(); g.translate(28, 58 + dy); g.rotate(rot); g.translate(-28, -58);
    const poly = (pts, k) => fillPoly(g, pts.map(([x, y]) => [x + (y < 34 ? lean * (34 - y) / 20 : 0), y]), C[k]);
    const P1 = (x, y, k) => px(g, Math.round(x + (y < 34 ? lean * (34 - y) / 20 : 0)), Math.round(y), C[k]);
    // the cape behind everything
    poly([[18, 24], [34, 24], [38 + flare, 56 - sit], [14 - flare, 56 - sit]], 'r'); poly([[16, 30], [20, 30], [16 - flare, 56 - sit], [13 - flare, 56 - sit]], 'R');
    // the sceptre when it is carried behind her
    const rodDraw = () => { if (!rod) return; const [x0, y0, x1, y1] = rod; line(g, x0, y0, x1, y1, C.I, 3); line(g, x0, y0, x1, y1, C.i, 1);
      const ux = Math.sign(x1 - x0), uy = Math.sign(y1 - y0); circle(g, x1, y1, 4, C.I); circle(g, x1, y1, 3, C.j); px(g, x1, y1, C.n); px(g, x1 + 1, y1 - 1, C.q);
      for (const [a, b] of [[-5, 0], [5, 0], [0, -5], [0, 5]]) px(g, x1 + a, y1 + b, C.I); };
    if (rod && rod[4] === 'back') rodDraw();
    // the gown: a bell of purple from the waist, gold at the hem and down the front
    for (const [fx, fy] of feet) { rect(g, fx - 2, fy - 1, 4, 2, C.k); }
    const hem = 55 - sit, hw = 16 + flare;
    poly([[20, 32], [36, 32], [28 + hw, hem], [28 - hw, hem]], 'p');
    poly([[26, 32], [30, 32], [30 + hw * 0.18, hem], [26 - hw * 0.18, hem]], 'P');
    for (let x = Math.round(28 - hw); x <= Math.round(28 + hw); x++) { px(g, x, hem, C.y); if (x % 3 === 0) px(g, x, hem - 1, C.Y); }
    line(g, 28, 33, 28, hem - 1, C.y, 1);
    if (sit) { poly([[22, 40], [42, 40], [42, 46], [22, 46]], 'q'); line(g, 22, 40, 42, 40, C.y, 1); } // her knees, over the throne's edge
    // the bodice and the ermine
    poly([[20, 21], [36, 21], [37, 33], [19, 33]], 'q'); for (let yy = 23; yy < 32; yy += 2) { P1(27, yy, 'y'); P1(29, yy, 'y'); }
    poly([[15, 18], [41, 18], [39, 24], [17, 24]], 'w'); for (const [x, y] of [[19, 20], [24, 22], [30, 20], [35, 22], [38, 19], [21, 23]]) P1(x, y, 'k');
    // the far arm
    if (arm2) { const [x0, y0, x1, y1] = arm2; line(g, x0, y0, x1, y1, C.G, 4); circle(g, x1, y1, 2, C.G); }
    // the head: big, green, bat ears, a hook of a nose, yellow eyes, a grin with two tusks
    const hx = 28 + lean, hy = 12;
    poly([[hx - 7, hy - 2], [hx - 16, hy - 6], [hx - 8, hy + 3]], 'g'); poly([[hx + 7, hy - 2], [hx + 16, hy - 6], [hx + 8, hy + 3]], 'g'); P1(hx - 12, hy - 3, 'G'); P1(hx + 12, hy - 3, 'G');
    ellipse(g, hx, hy + 1, 8, 7.5, C.g); ellipse(g, hx + 1, hy + 4, 6, 3.5, C.G);
    if (head === 'daze') { P1(hx - 3, hy - 1, 'k'); P1(hx - 2, hy, 'k'); P1(hx - 2, hy - 2, 'k'); P1(hx + 3, hy - 1, 'k'); P1(hx + 4, hy, 'k'); P1(hx + 4, hy - 2, 'k'); }
    else { rect(g, hx - 4, hy - 1, 3, 2, C.e); rect(g, hx + 2, hy - 1, 3, 2, C.e); P1(hx - 2, hy - 1, 'm'); P1(hx + 4, hy - 1, 'm'); line(g, hx - 5, hy - 3, hx - 1, hy - 2, C.d, 1); line(g, hx + 6, hy - 3, hx + 2, hy - 2, C.d, 1); }
    poly([[hx + 1, hy], [hx + 6, hy + 3], [hx + 2, hy + 4]], 'G'); // the nose
    if (head === 'shout') { rect(g, hx - 3, hy + 5, 7, 3, C.k); P1(hx - 2, hy + 5, 't'); P1(hx + 3, hy + 5, 't'); }
    else { line(g, hx - 4, hy + 6, hx + 4, hy + 6, C.k, 1); P1(hx - 3, hy + 5, 't'); P1(hx + 3, hy + 5, 't'); P1(hx - 3, hy + 4, 't'); P1(hx + 3, hy + 4, 't'); }
    P1(hx - 6, hy + 3, 'd'); P1(hx + 5, hy - 4, 'd');
    // the crown: iron, five points, a red stone in each
    g.save(); g.translate(hx, hy - 4); g.rotate(tilt);
    fillPoly(g, [[-8, 0], [8, 0], [9, -3], [-9, -3]], C.I); fillPoly(g, [[-8, -3], [8, -3], [8, -5], [-8, -5]], C.y);
    for (const k of [-8, -4, 0, 4, 8]) { fillPoly(g, [[k - 2, -5], [k + 2, -5], [k, -11 - (k === 0 ? 3 : 0)]], C.i); px(g, k, -7, C.m); }
    g.restore();
    if (stars) for (let i = 0; i < 3; i++) { const a = i * 2.1 + stars; P1(hx + Math.cos(a) * 11, hy - 12 + Math.sin(a) * 3, 'e'); }
    // the near arm and the sceptre in it
    if (!rod || rod[4] !== 'back') rodDraw();
    { const [x0, y0, x1, y1] = arm; line(g, x0, y0, x1, y1, C.q, 5); line(g, x0, y0, x1, y1, C.g, 3); circle(g, x1, y1, 3, C.g); } // a sleeve of the gown to the wrist
    g.restore();
    outline(c, OUT);
    return c;
  };
  const F = [
    frame({ sit: 8, feet: [[22, 50], [34, 50]], arm: [34, 25, 40, 36], rod: [40, 44, 44, 12], flare: 2 }),                                    // 0 seated
    frame({ sit: 8, feet: [[22, 50], [34, 50]], arm: [34, 24, 50, 18], rod: [18, 46, 16, 14, 'back'], arm2: [22, 25, 18, 34], head: 'shout', flare: 2 }), // 1 pointing
    frame({ sit: 8, feet: [[22, 50], [34, 50]], arm: [34, 24, 44, 6], rod: [18, 46, 16, 14, 'back'], head: 'shout', flare: 2 }),              // 2 throwing
    frame({ arm: [34, 25, 40, 36], rod: [40, 50, 44, 14] }),                                                                                   // 3 stand
    frame({ arm: [34, 25, 41, 35], rod: [42, 48, 47, 14], feet: [[21, 58], [34, 58]], lean: 1 }),                                                // 4 walk1
    frame({ arm: [34, 25, 39, 36], rod: [40, 50, 43, 15], feet: [[26, 58], [30, 58]], dy: -1 }),                                                // 5 walk2
    frame({ arm: [34, 24, 36, 4], arm2: [22, 24, 32, 4], rod: [34, 6, 12, -2], head: 'shout', lean: -2 }),                                     // 6 slam raised
    frame({ arm: [34, 26, 48, 44], arm2: [22, 26, 44, 44], rod: [44, 42, 54, 56], head: 'shout', lean: 4, dy: 2, flare: 2 }),                 // 7 slam down
    frame({ arm: [34, 26, 50, 38], rod: [30, 40, 55, 50], lean: 3, flare: 3, head: 'shout' }),                                                  // 8 sweep
    frame({ arm: [34, 26, 48, 30], rod: [32, 32, 56, 30], lean: 6, flare: 4, head: 'shout', feet: [[18, 58], [36, 58]] }),                     // 9 charge
    frame({ arm: [34, 26, 38, 40], rod: [14, 56, 50, 50, 'back'], head: 'daze', tilt: 0.45, stars: 1, lean: -1 }),                             // 10 dazed
    frame({ arm: [34, 24, 44, 12], rod: [40, 20, 50, -2], flare: 7, feet: [[24, 54], [31, 54]], dy: -3, head: 'shout' }),                       // 11 leap
    frame({ arm: [34, 24, 46, 8], arm2: [22, 25, 18, 34], rod: [18, 50, 14, 16, 'back'], head: 'shout' }),                                     // 12 throw slate
    frame({ arm: [34, 24, 46, 10], arm2: [22, 24, 10, 10], rod: [14, 56, 50, 50, 'back'], head: 'daze', tilt: -0.3, flare: 5, stars: 2 }),      // 13 struck
    frame({ arm: [34, 26, 46, 50], rod: [10, 56, 52, 54, 'back'], head: 'daze', tilt: 0.9, rot: 0.2, dy: 3, flare: 6 }),                        // 14 down
  ];
  return pack(F, 28, 70, 30, 50);
}
// THE THRONE - black oak and old iron, purple cushions, a skull on each post. 40x46, anchored at its foot.
export function bakeThrone() {
  const [c, g] = canvas(40, 46);
  rect(g, 4, 4, 32, 36, '#3a2214'); rect(g, 6, 6, 28, 32, '#5a3a24'); rect(g, 9, 9, 22, 26, '#5a2a7a'); rect(g, 10, 10, 20, 2, '#7a3a9a');
  for (let y = 12; y < 34; y += 4) rect(g, 18, y, 4, 2, '#e0b040');
  rect(g, 2, 30, 36, 6, '#3a2214'); rect(g, 4, 30, 32, 2, '#7a4a2a'); rect(g, 6, 36, 4, 10, '#3a2214'); rect(g, 30, 36, 4, 10, '#3a2214');
  for (const x of [1, 33]) { rect(g, x, 0, 6, 40, '#2a1a10'); circle(g, x + 3, 2, 3, '#e8dcc0'); px(g, x + 2, 2, '#1b1626'); px(g, x + 4, 2, '#1b1626'); }
  rect(g, 12, 0, 16, 4, '#5a6270'); for (const k of [13, 19, 25]) { fillPoly(g, [[k, 0], [k + 3, 0], [k + 1.5, -4]], '#5a6270'); px(g, k + 1, 1, '#c9463d'); }
  return outline(c, OUT);
}

export function bakeRoc() {
  const C = { h: '#8a8478', H: '#5a5448', d: '#3a3630', f: '#e8e0d0', F: '#b8b0a0', m: '#c9a83a', M: '#8a6a1a', c: '#bfe6f5', C: '#eefaff', q: '#7aa8c8', e: '#ff4a3a' };
  const W = 60, H = 44;
  const poly = (g, pts, k) => fillPoly(g, pts, C[k]);
  // a wing: shoulder, then the leading edge out to the tip, then back along the trailing edge. The last
  // few points of the trailing edge get glass tips.
  const wing = (g, pts, far) => {
    poly(g, pts, far ? 'H' : 'h');
    const n = pts.length; for (let i = 2; i < n - 1; i++) { const [x, y] = pts[i]; px(g, x, y, C[i % 2 ? 'c' : 'C']); px(g, x + 1, y, C.q); }
    if (!far) { for (let i = 1; i < n - 2; i++) line(g, pts[0][0], pts[0][1], pts[i][0] + (pts[i + 1][0] - pts[i][0]) / 2, pts[i][1] + (pts[i + 1][1] - pts[i][1]) / 2, C.H, 1); }
    // the primaries splay like fingers past the tip: that is what makes it a bird of prey and not a goose
    let ti = 1, best = -1; for (let i = 1; i < n; i++) { const dd = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]); if (dd > best) { best = dd; ti = i; } }
    const [tx, ty] = pts[ti], ux = (tx - pts[0][0]) / best, uy = (ty - pts[0][1]) / best, nb = pts[(ti + 1) % n];
    for (let k = 0; k < 3; k++) { const bx = tx + (nb[0] - tx) * k * 0.28, by = ty + (nb[1] - ty) * k * 0.28, L = 5 - k;
      line(g, bx, by, bx + ux * L, by + uy * L, C[far ? 'H' : 'h'], 2); px(g, Math.round(bx + ux * (L + 1)), Math.round(by + uy * (L + 1)), C.c); }
  };
  const frame = ({ wings = 'mid', head = 'up', legs = 'hang', rot = 0, dy = 0 }) => {
    const [c, g] = canvas(W, H);
    g.save(); g.translate(30, 30 + dy); g.rotate(rot); g.translate(-30, -30);
    // far wing first (behind the body)
    const WINGS = {
      up: [[[27, 20], [23, 3], [30, 0], [36, 4], [34, 12], [31, 20]], [[23, 21], [15, 2], [22, 1], [29, 8], [29, 20]]],
      mid: [[[27, 22], [48, 11], [55, 13], [52, 17], [44, 21], [33, 25]], [[24, 22], [5, 12], [2, 17], [8, 20], [16, 24], [24, 26]]],
      down: [[[27, 23], [37, 38], [31, 42], [26, 38], [24, 28]], [[24, 24], [12, 38], [8, 35], [12, 29], [21, 25]]],
      fold: [[[18, 20], [36, 19], [34, 24], [26, 26], [16, 25]], null],
      forward: [[[30, 22], [50, 4], [57, 8], [54, 16], [46, 22], [36, 27]], [[26, 21], [40, 3], [46, 6], [42, 15], [32, 24]]],
      splay: [[[32, 24], [53, 38], [49, 42], [42, 41], [34, 32]], [[22, 24], [4, 38], [7, 42], [15, 41], [24, 31]]],
    }[wings];
    if (WINGS[1]) wing(g, WINGS[1], true);
    // tail: three long feathers, glass at the ends
    poly(g, [[19, 25], [5, 21], [4, 25], [6, 29], [19, 29]], 'h'); line(g, 18, 26, 6, 23, C.H, 1); line(g, 18, 28, 6, 28, C.H, 1);
    px(g, 4, 23, C.c); px(g, 4, 26, C.C); px(g, 5, 29, C.c);
    // legs and talons
    const LEG = { hang: [[26, 32, 25, 38], [31, 32, 31, 38]], plant: [[25, 32, 22, 40], [32, 32, 35, 40]], strike: [[27, 31, 36, 36], [31, 31, 40, 34]], none: [] }[legs];
    for (const [x0, y0, x1, y1] of LEG) { line(g, x0, y0, x1, y1, C.M, 2); px(g, x1 - 1, y1 + 1, C.m); px(g, x1 + 1, y1 + 1, C.m); px(g, x1 + 2, y1, C.m); }
    // body: a heavy grey barrel with a pale breast
    ellipse(g, 27, 26, 11, 7.5, C.h); ellipse(g, 30, 28, 7, 4.5, C.f); line(g, 25, 29, 33, 30, C.F, 1); line(g, 26, 31, 32, 31, C.F, 1);
    // neck and head, a hooked gold beak, a crest of crystal
    const HEAD = { up: [41, 15], low: [43, 27], screech: [40, 12], thrown: [36, 11] }[head];
    const [hx, hy] = HEAD;
    poly(g, [[33, 21], [hx - 3, hy - 2], [hx + 1, hy + 2], [36, 26]], 'h');
    ellipse(g, hx, hy, 5, 4.2, C.h);
    const open = head === 'screech';
    if (open) { poly(g, [[hx + 3, hy - 3], [hx + 9, hy - 3], [hx + 11, hy - 1], [hx + 4, hy]], 'm'); poly(g, [[hx + 3, hy + 1], [hx + 9, hy + 4], [hx + 3, hy + 3]], 'M'); px(g, hx + 11, hy, C.M); }
    else { poly(g, [[hx + 3, hy - 3], [hx + 9, hy - 2], [hx + 11, hy + 1], [hx + 10, hy + 4], [hx + 8, hy + 1], [hx + 3, hy + 2]], 'm'); px(g, hx + 10, hy + 3, C.M); px(g, hx + 10, hy + 4, C.M); px(g, hx + 9, hy + 2, C.M); }
    px(g, hx + 3, hy - 2, C.f); // the cere
    line(g, hx - 2, hy - 3, hx + 4, hy - 2, C.d, 1); px(g, hx + 4, hy - 1, C.d); // the brow
    px(g, hx + 1, hy - 1, C.e); px(g, hx + 2, hy - 1, C.e); px(g, hx + 2, hy, C.d);
    // a ruff at the neck, and a crest of glass that sweeps back off the skull
    for (let k = 0; k < 4; k++) px(g, 33 + k, 21 + (k % 2), C.d);
    const crest = [[hx - 3, hy - 4, -3], [hx - 5, hy - 3, -4], [hx - 7, hy - 1, -4], [hx - 1, hy - 5, -2]];
    for (const [x, y, lx] of crest) { poly(g, [[x, y + 2], [x + lx, y - 4], [x + 2, y + 1]], 'c'); px(g, x + lx + 1, y - 3, C.C); px(g, x, y, C.q); }
    // near wing last, over the body
    wing(g, WINGS[0], false);
    g.restore();
    outline(c, OUT);
    return c;
  };
  const F = [
    frame({ wings: 'up', legs: 'hang' }),
    frame({ wings: 'mid', legs: 'hang', dy: -1 }),
    frame({ wings: 'down', legs: 'hang', dy: -2 }),
    frame({ wings: 'up', head: 'screech', legs: 'hang' }),
    frame({ wings: 'fold', head: 'low', legs: 'strike', rot: 0.55, dy: -4 }),
    frame({ wings: 'forward', legs: 'hang' }),
    frame({ wings: 'splay', head: 'low', legs: 'plant' }),
    frame({ wings: 'splay', head: 'thrown', legs: 'plant' }),
    frame({ wings: 'splay', head: 'low', legs: 'none', rot: 0.25, dy: 3 }),
  ];
  return pack(F, 30, 41, 40, 30);
}

export function bakeSuncatcher() {
  const SC = Object.assign({}, EP, { c: '#bfe6f5', C: '#7aa8c8', w: '#ffffff', y: '#ffe6a0', Y: '#e0b040', d: '#4a6a90', D: '#2e4460' });
  const W2 = 34, H2 = 30; const blank = () => Array.from({ length: H2 }, () => '.'.repeat(W2));
  const put = (R, x, y, str) => { if (y < 0 || y >= H2) return; const r = R[y]; R[y] = r.slice(0, x) + str + r.slice(x + str.length); };
  const f = rows => outline(fromGrid(rows, SC, 1), OUT);
  const body = (core, arms) => { const R = blank();
    // a crown of shards over a heavy crystal body
    put(R, 12, 0, 'c..c..c'); put(R, 11, 1, 'cc.cc.cc'); put(R, 10, 2, 'ccccccccc');
    put(R, 8, 3, 'ccccccccccccc'); put(R, 7, 4, 'cCcccccccccccCc');
    put(R, 6, 5, 'cCccc' + core + 'ccccC c'.replace(' ', 'c'));
    put(R, 6, 6, 'cCcc' + core + core + 'cccCc');
    put(R, 6, 7, 'cCccc' + core + 'cccccCc');
    put(R, 7, 8, 'cccccccccccccc'); put(R, 8, 9, 'ccccccccccccc');
    put(R, 9, 10, 'ccccccccccc'); put(R, 10, 11, 'ccccccccc');
    put(R, 11, 12, 'DDDDDDD');
    // the legs it stands on: three crystal columns
    for (const lx of [11, 15, 19]) { for (let y = 13; y <= 26; y++) put(R, lx, y, 'cC'); put(R, lx - 1, 27, 'ccc'); put(R, lx - 1, 28, 'DDD'); }
    if (arms) for (const [ax, dir] of [[3, -1], [27, 1]]) { for (let y = 4; y <= 10; y++) put(R, ax + (dir < 0 ? 0 : 0), y, 'cc'); put(R, ax, 3, 'wc'); }
    return R; };
  const still = f(body('y', false));
  const turn1 = f(body('y', false).map((r, i) => i === 6 ? r.replace('yy', 'Yy') : r));
  const turn2 = f(body('y', false).map((r, i) => i === 6 ? r.replace('yy', 'yY') : r));
  const drink = f((() => { const R = body('w', true); for (let i = 0; i < 5; i++) put(R, 4 + i * 6, 0, 'w'); return R; })());
  const thr = f((() => { const R = body('y', true); put(R, 29, 5, 'www'); put(R, 30, 4, 'ww'); return R; })());
  const raise = f((() => { const R = body('y', false); for (let y = 0; y <= 12; y++) { put(R, 2, y, 'cc'); put(R, 30, y, 'cc'); } return R; })());
  const struck = f(body('D', false));
  const dim = f((() => { const R = body('D', false); return R.map(r => r.replace(/c/g, 'C')); })());
  return pack([still, turn1, turn2, drink, thr, raise, struck, dim], 17, 30, 26, 28);
}

export function bakeGoblinShaman() {
  const SH = Object.assign({}, EP, { v: '#9a5acc', V: '#5a2a8a', m: '#f0e4ff', u: '#8a5a32', a: '#e8dcc0' });
  const r = rows => outline(fromGrid(rows, SH, 1), OUT);
  const idle = r([
    '...a..aa..a.....',
    '....a.aa.a......',
    '....aVVVVa......',
    '...vvVvvVvv.....',
    '...gggeoge...m..',
    '....ggggg...umu.',
    '....gGGGg....u..',
    '...vvvvvvv...u..',
    '..vavvvvvav..u..',
    '..vvavvvavv..u..',
    '..vvvavavvv.uu..',
    '..VvvvvvvvV.u...',
    '..VvvvvvvvV.u...',
    '...VVVVVVV..u...',
    '...GG...GG..u...',
    '...GG...GG..u...',
    '..GGG...GGG.u...',
    '................']);
  const cast = r([
    '...a..aa..a.....',
    '....a.aa.a......',
    '....aVVVVa......',
    '...vvVvvVvv.....',
    '...gggeoge......',
    '....ggggg.......',
    '....gGGGg.......',
    '...vvvvvvvgg....',
    '..vavvvvvvvvgumm',
    '..vvavvvavvuuumm',
    '..vvvavavvv..mm.',
    '..VvvvvvvvV.....',
    '..VvvvvvvvV.....',
    '...VVVVVVV......',
    '...GG...GG......',
    '...GG...GG......',
    '..GGG...GGG.....',
    '................']);
  const blink = r([
    '................',
    '..m...........m.',
    '.....a.aa.a.....',
    '.....aVVVVa.....',
    '....vvVvvVvv....',
    '....gggeoge..m..',
    '.m...ggggg...u..',
    '.....gGGGg...u..',
    '....vvvvvvv..u..',
    '...vavvvvvav.u..',
    '...vvvavavvv.u..',
    '...VvvvvvvvV.u..',
    '....VVVVVVV.u...',
    '..m..GG.GG..u.m.',
    '.....GG.GG..u...',
    '....GGG.GGG.u...',
    '................',
    '................']);
  // 3 howl: both arms up, staff high, robe streaming, mouth open on the call
  const howl = r([
    '.g.a..aa..a.g...',
    '.gg.a.aa.a.gg...',
    '..g.aVVVVa.g....',
    '...vvVvvVvv..m..',
    '...gggeoge..mum.',
    '....gRRRg....m..',
    '....gGGGg.......',
    '...vvvvvvv......',
    '..vvvvvvvvv.....',
    '.vvvavvvavvv....',
    '.vvvvvavvvvv....',
    '.VvvvvvvvvvV....',
    '..VvvvvvvvV.....',
    '...VVVVVVV......',
    '...GG...GG......',
    '..GG.....GG.....',
    '.GGG.....GGG....',
    '................']);
  // 4/5 walk: the robe swings and the staff plants. He does walk, in the last of it.
  const stride = (a, b) => r([
    '...a..aa..a.....',
    '....a.aa.a......',
    '....aVVVVa......',
    '...vvVvvVvv.....',
    '...gggeoge...m..',
    '....ggggg...umu.',
    '....gGGGg....u..',
    '...vvvvvvv...u..',
    '..vavvvvvav..u..',
    '..vvavvvavv..u..',
    '..vvvavavvv.uu..',
    '..VvvvvvvvV.u...',
    '..VvvvvvvvV.u...',
    '...VVVVVVV..u...',
    a, b,
    '..GGG...GGG.u...',
    '................']);
  const walk1 = stride('...GG..GG...u...', '..GG....GG..u...');
  const walk2 = stride('....GGGG....u...', '...GG..GG...u...');
  return pack([idle, cast, blink, howl, walk1, walk2], 8, 17, 12, 16);
}
