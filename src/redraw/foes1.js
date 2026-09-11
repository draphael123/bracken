// foes1.js — redraws of four weak enemy sprites. Same names, signatures, frame counts/order as chars.js.
// All frames face RIGHT (L is the flip). Anchors keep each old baker's convention; only the numbers moved with the canvas.
//
// bakeThornback()  SPIKE GOBLIN — hunched goblin under a dark iron carapace with four pale spikes, a spiked helm,
//   eye + tusk, a long swinging arm.
//   frames: 0 walk contact (also standing), 1 pass, 2 contact (other foot), 3 pass   (arm swings fwd/down/back/down)
//   canvas 18x15 (grid 16x13, was 16x13)   anchor ax 8, ay 14 (feet on ay-1, as old ax 7 / ay 12)   pack w/h 12x11
//
// bakeHopper(color)  MARSH FROG, side view — eye bump on top, mouth line, pale belly, folded hind leg, spots.
//   green = base; yellow = one row lower and leaner (small, quick); blue = swollen throat sac + pale warts (heavy).
//   frames: 0 sit, 1 rising (stretched up, legs trailing), 2 crouch (squashed, about to leap), 3 falling (legs reaching down)
//   canvas 14x10 (grid 12x8, was 12x8)   anchor ax 7, ay 9 (feet on ay-1, as old ax 6 / ay 7)   pack w/h 9x6
//
// bakeHarpy()  CRAG HARPY — bird-woman: wild dark hair, pale face with red eyes and a screaming mouth, bare shoulders,
//   feathered breast, grey-brown ragged wings, yellow bird legs with pale talons.
//   frames: 0 hover wings up, 1 hover wings down (both facing you, turned a touch right), 2 dive (side-on: wings swept
//   back, hair streaming, talons thrust forward), 3 downed (slumped on the ground, eyes shut, wings flat, seeing stars)
//   canvas 20x15 (grid 18x13, was 18x9)   anchor ax 10, ay 13 (talon row ON ay, as old ax 9 / ay 7)   pack w/h 14x7
//
// bakeHound(pal)  WAR HOUND — lean goblin war dog: raised tail, tucked waist, deep chest, pointed ear, red spiked collar,
//   amber eye, open snarl with a white tooth, thin legs. pal overrides h (coat), H (far legs/nose), e (eye) as before;
//   light/dark coat shades are derived from h, so the white village dog recolours cleanly.
//   frames: 0 run extended (forelegs reaching, hind thrown back), 1 run gathered (legs bunched), 2 leap (stretched, airborne)
//   canvas 20x12 (grid 18x10, was 16x9)   anchor ax 11, ay 11 (feet on ay-1, as old ax 8 / ay 8)   pack w/h 12x7
//   NB: the village 'dog' prop draws frame 2 for "sit" (main.js) — it was a leap pose in the old art too.
import { fromGrid, outline, flipX, whiten, shade } from '../px.js';
import { OUT } from '../art.js';

const EP = { n: '#5a3a24', N: '#3a2214', t: '#e8dcc0', T: '#b8a888', g: '#6faa4a', G: '#3f6e2c', e: '#f3f0d2', o: OUT, r: '#c9463d', R: '#8f2f28', s: '#c9d1dc', S: '#7c8797', b: '#5d4a8a', w: '#8a5a32', W: '#5c3a1d', y: '#e0b040', k: '#f0e6c8', K: '#cdbf9a', p: '#ff9a5c', d: '#2a2f3d', l: '#dfe8ff' };
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const spr = pal => rows => outline(fromGrid(rows, pal, 1), OUT);
// stack layers of equal-size grids; later layers win where they are not '.'
function lay(...grids) {
  const h = Math.max(...grids.map(g => g.length)), w = Math.max(...grids.flat().map(r => r.length));
  const out = [];
  for (let y = 0; y < h; y++) { let s = ''; for (let x = 0; x < w; x++) { let c = '.'; for (const g of grids) { const k = (g[y] || '')[x]; if (k && k !== '.') c = k; } s += c; } out.push(s); }
  return out;
}

// ---------- THORNBACK ----------
export function bakeThornback() {
  const P = Object.assign({}, EP, { l: '#f4f6fb', S: '#a9b2c0', a: '#8a93a3', i: '#5a6270', I: '#3a3e48' });
  const f = spr(P);
  const top = [
    '....l..l....l...',
    '.l..lS.lS...lS..',
    '.lS.lS.lS...lS..',
    '..aaaaaaa..saa..',
    '.asiiiiiiIsaaaa.',
    'aaiiiiiiigIIIIII',
    'aiiiiiiiIggggeog',
    'aiiIiiiIIIgggggg',
    '.IiIiiiIIIggGGtg',
    '..IIIIIIIg.gggg.',
  ];
  // the long front arm swings under the helm: forward, down, back, down (fist in skin, clear of the dark legs)
  const arm = [
    ['...RrrrrR.gg....', '...........gG...'],
    ['...RrrrrR.g.....', '..........gG....'],
    ['...RrrrrRg......', '.........gG.....'],
    ['...RrrrrR.g.....', '..........gG....'],
  ];
  const legs = [
    ['....GG..GG......', '...GG....GG.....'],
    ['....GG.GG.......', '....GG..GG......'],
    ['.....GGGG.......', '....GG..GG......'],
    ['....GG.GG.......', '...GG....GG.....'],
  ];
  return pack(legs.map((l, i) => f([...top, arm[i][0], ...lay([l[0]], [arm[i][1]]), l[1]])), 8, 14, 12, 11);
}

// ---------- HOPPER ----------
const HOPPER_COLORS = {
  green: { F: '#5a9a3a', D: '#3a6a2a', L: '#8fc85a', B: '#d8e0a0' },
  yellow: { F: '#d9b83a', D: '#9a7a1a', L: '#f5e07a', B: '#f7f0c0' },
  blue: { F: '#3a6aa0', D: '#244a78', L: '#6fa0d8', B: '#c8d8f0' },
};
export function bakeHopper(color = 'green') {
  const P = Object.assign({}, EP, HOPPER_COLORS[color] || HOPPER_COLORS.green);
  const f = spr(P);
  const sit = [
    '......LLF...',
    '..LLL.LeoF..',
    '.LFFFFFFFFF.',
    'LFDFFDFFFFFF',
    'FFFFFFDDDDDD',
    'FFDDDFBBBBB.',
    'FDFFFDBBBF..',
    '.DDDDDD..DD.',
  ];
  const rise = [
    '.........LLF',
    '.......LLLeo',
    '.....LFFFFFF',
    '...LFDFFDDDD',
    '..FFFFFBBBB.',
    '.DFFDBBBB...',
    'DDD.D.......',
    'D...D.......',
  ];
  const crouch = [
    '............',
    '............',
    '.......LLF..',
    '..LL..LeoF..',
    '.LFFLFFFFFF.',
    'LFDFFFFDDDDD',
    'FDDDFDBBBBB.',
    'DDDDDDDD.DD.',
  ];
  const fall = [
    '......LLF...',
    '..LLL.LeoF..',
    '.LFFFFFFFFF.',
    'LFDFFDFFFFFF',
    'FFFFFFDDDDDD',
    'DFFFFBBBBBB.',
    'D.DD...DB.D.',
    'D...D...D..D',
  ];
  // [grid, index of the back row a yellow drops, index of the throat row a blue swells]
  const frames = [[sit, 2, 5], [rise, 2, 4], [crouch, 4, 6], [fall, 2, 5]];
  const vary = ([rows, back, throat]) => {
    if (color === 'yellow') return ['............', ...rows.slice(0, back), ...rows.slice(back + 1)]; // one row lower and leaner: small and quick
    if (color === 'blue') return rows.map((r, i) => { // heavy: a swollen throat sac, and warts in place of spots
      if (i === throat) { const j = r.lastIndexOf('B'); return r.slice(0, j + 1) + 'B' + r.slice(j + 2); }
      return i < throat ? r.replace(/D(?=F)/g, 'L') : r;
    });
    return rows;
  };
  return pack(frames.map(fr => f(vary(fr))), 7, 9, 9, 6);
}

// ---------- HARPY ----------
export function bakeHarpy() {
  const P = Object.assign({}, EP, { h: '#8a8478', H: '#5a5448', z: '#3a2e22', F: '#b8b0a0', c: '#40344a', C: '#6e5e78', k: '#dcbc9c', K: '#a8805e', r: '#ff4a3a', R: '#8f2f28', m: '#c9a83a', M: '#8a6a1a', t: '#f0e8d8', Y: '#fff1a0' });
  const f = spr(P);
  // hovering she faces you, turned a touch to her right (the flip handles the other side)
  const body = [
    '......c.cc.c......',
    '.....cCCcccc......',
    '....ccCkkkkcc.....',
    '....c.ckrkrc.c....',
    '.....cckkkkcc.....',
    '....c.ckRRkc.c....',
    '.....cc.kK.cc.....',
    '.....ckkkkkKc.....',
    '......FhFFhF......',
    '......hhhhhh......',
    '.......m..m.......',
    '.......m..m.......',
    '......tt..tt......',
  ];
  const mirror = rows => rows.map(r => r.split('').reverse().join(''));
  const wUpL = [
    'z.z...............',
    'zHzH..............',
    'zHhHF.............',
    '.zHhhF............',
    '.zHhhF............',
    '..zHhhF...........',
    '..zHhhhF..........',
    '...zHhhFF.........',
    '....zzHh..........',
    '......z...........',
  ];
  const wDnL = [
    '..................',
    '..................',
    '..................',
    '..................',
    '..................',
    '..................',
    '..................',
    '...FFFF...........',
    '.FFhhhhh..........',
    'zhhhhHHH..........',
    'zHHHHzz...........',
    'z.zHz.............',
    '..z...............',
  ];
  const up = f(lay(wUpL, mirror(wUpL), body)), dn = f(lay(wDnL, mirror(wDnL), body));
  // dive: wings swept back along her, hair streaming, talons thrust out ahead
  const dive = f(lay([
    '..zz..............',
    '.zHHz.............',
    'zzHhHz............',
    'zFFhHHz...........',
    '.zFFhhHz..........',
    '..zFFhhHz.........',
    '...zzFFhhH........',
    '.....zzFhh........',
    '.......zz.........',
  ], [
    '..................',
    '..................',
    '..........c.cc....',
    '.........cCcccc...',
    '........cCckkkkc..',
    '.......c.cckrkrc..',
    '......c..cckkkkc..',
    '..........ckRRk...',
    '.......hFFFFkK....',
    '........hFFFhh....',
    '.........hhhhmm...',
    '.............mmtt.',
    '..............t.tt',
  ]));
  // downed: slumped on the ground, eyes shut, mouth slack, wings dropped flat either side, talons splayed, seeing stars
  const down = f([
    '..................',
    '..Y............Y..',
    '.YYY..............',
    '..Y...............',
    '......c.cc.c......',
    '.....cCCcccc......',
    '....ccCkkkkcc.....',
    '....c.czkzkc.c....',
    '.....cckRRkcc.....',
    '..FFFhckkkkKchFF..',
    '.FhhhhhFFFFhhhhhF.',
    'zhHHzHhhhhhhHzHHhz',
    'zz.zztt.mm.ttz.zzz',
  ]);
  return pack([up, dn, dive, down], 10, 13, 14, 7);
}

// ---------- WAR HOUND ----------
export function bakeHound(pal = {}) {
  const P = Object.assign({}, EP, { h: '#5a4a3a', H: '#3a2e22', e: '#f0c040', c: '#b8402f', s: '#dfe4ec', t: '#fff6e0', R: '#8f2f28' }, pal);
  P.L = shade(P.h, 0.25); P.n = shade(P.h, -0.28);
  const f = spr(P);
  const top = [
    '............s.hH..',
    '...........hchhh..',
    'h..........hchhehh',
    '.h..LLLLLLLLshhhhH',
    '..hhhhhhhhhhchRtR.',
    '.nhhh...nhhhchhh..',
  ];
  // 0 extended (forelegs reaching, hind legs thrown back), 1 gathered (legs bunched under), 2 leap (stretched flat out, off the ground)
  const a = f([...top, '.hH......nhhs.....', 'h..H......H.h.....', 'h..H.......H.h....', 'H...H......H..hh..']);
  const b = f([...top, '..hhH....hhHs.....', '....Hh...h.H......', '....H.h.h..H......', '...HH..hhh.HH.....']);
  const l = f([...top, 'hhhH.....Hhhsh....', 'H.........H...hh..', '..................', '..................']);
  return pack([a, b, l], 11, 11, 12, 7);
}
