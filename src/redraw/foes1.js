// foes1.js — redraws of four weak enemy sprites. Same names, signatures, frame counts/order as chars.js.
import { fromGrid, outline, flipX, whiten, shade } from '../px.js';
import { OUT } from '../art.js';

const EP = { n: '#5a3a24', N: '#3a2214', t: '#e8dcc0', T: '#b8a888', g: '#6faa4a', G: '#3f6e2c', e: '#f3f0d2', o: OUT, r: '#c9463d', R: '#8f2f28', s: '#c9d1dc', S: '#7c8797', b: '#5d4a8a', w: '#8a5a32', W: '#5c3a1d', y: '#e0b040', k: '#f0e6c8', K: '#cdbf9a', p: '#ff9a5c', d: '#2a2f3d', l: '#dfe8ff' };
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(whiten), whiteL = white.map(flipX);
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
    '.aaiiiiiiIsaaaa.',
    'aaiiiiiiigIIIIII',
    'aiiiiiiiIggggeog',
    'aiiIiiiIIIgggggg',
    '.IiIiiiIIIggGGtg',
    '..IIIIIIIg.gggg.',
    '...RrrrrR.gg....',
  ];
  const legs = [
    ['....GG..GG......', '...GG....GG.....'],
    ['....GG.GG.......', '....GG..GG......'],
    ['.....GGGG.......', '....GG..GG......'],
    ['....GG.GG.......', '...GG....GG.....'],
  ];
  return pack(legs.map(l => f([...top, ...l])), 8, 14, 12, 11);
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
    '......LFF...',
    '..LLF.Leo...',
    '.LFFFFFFFF..',
    'LFDFFFFFFFFF',
    'FFFFDFFDDDDD',
    'DFFFFFBBBBB.',
    'DDFFDDBBBF..',
    '.DDDDDD..DD.',
  ];
  const rise = [
    '........LFF.',
    '......LFLeo.',
    '....LFFFFFFF',
    '..LFFDFFDDDD',
    '.FFDFFBBBBB.',
    'DFFFBBBBB...',
    'DD.DB.......',
    'D...........',
  ];
  const crouch = [
    '............',
    '............',
    '......LFF...',
    '..LLF.Leo...',
    '.LFFFFFFFFF.',
    'LFDFFFFDDDDD',
    'DFFFFFBBBBB.',
    'DDDDDDDDDDD.',
  ];
  const fall = [
    '......LFF...',
    '..LLF.Leo...',
    '.LFFFFFFFF..',
    'LFDFFFFFFFFF',
    'FFFFDFFDDDDD',
    '.DFFFBBBBBB.',
    'D.DD...D.D..',
    'D.......D...',
  ];
  return pack([f(sit), f(rise), f(crouch), f(fall)], 7, 9, 9, 6);
}

// ---------- HARPY ----------
export function bakeHarpy() {
  const P = Object.assign({}, EP, { h: '#8a8478', H: '#5a5448', z: '#3a2e22', F: '#b8b0a0', f: '#e8e0d0', k: '#d9c3a5', K: '#a88c70', r: '#e04a3a', m: '#c9a83a', M: '#8a6a1a', t: '#f0e8d8' });
  const f = spr(P);
  const body = [
    '..................',
    '.........ffff.....',
    '.......fFfFkkk....',
    '......FfFfFkrk....',
    '.......FfFfKkkk...',
    '.........FKK......',
    '........hFFh......',
    '........hFFh......',
    '........hhhh......',
    '.........m.m......',
    '.........m.m......',
    '........tt.tt.....',
  ];
  const wUp = [
    'zz..........z.....',
    '.zHH.......zH.....',
    '.zHhhH.....zH.....',
    '..zHhhhH...Hh.....',
    '..zzHhhhhH........',
    '...zzHHhhhh.......',
    '.....zzHHhh.......',
    '.......zHH........',
    '..................',
    '..................',
    '..................',
    '..................',
  ];
  const wDn = [
    '..................',
    '..................',
    '..................',
    '..................',
    '..................',
    '..........Hh......',
    '.....hhhhhhhHh....',
    '...hhhhhhHHH.hH...',
    '..HhhhHHHzz...Hz..',
    '.HHHHzzz.......z..',
    'zzzz..............',
    '..................',
  ];
  const up = f(lay(wUp, body)), dn = f(lay(wDn, body));
  const dive = f([
    '..................',
    'zH................',
    '.zHH..............',
    '..zHHh..ffff......',
    '...zHhhfFfFkk.....',
    '....zHhFfFfkrk....',
    '.....zHhFfFKkkk...',
    '......zhhFFK......',
    '.......hhFFhmm....',
    '........hhhh..mmt.',
    '...............t.t',
    '..................',
  ]);
  const down = f([
    '..................',
    '..................',
    '..................',
    '..................',
    '..................',
    '.......t.t........',
    '.......m.m........',
    '......hhhh..ffff..',
    '....hhFFFFhfFfkkk.',
    '..zHhhFFFFhFfFkok.',
    'zzHhhHHhhhHhFfKkk.',
    '.zzz.zzz.hhhhhhhhzz',
  ]);
  return pack([up, dn, dive, down], 10, 12, 14, 7);
}

// ---------- WAR HOUND ----------
export function bakeHound(pal = {}) {
  const P = Object.assign({}, EP, { h: '#5a4a3a', H: '#3a2e22', e: '#f0c040', c: '#3a2214', s: '#c9d1dc', t: '#fff6e0', R: '#8f2f28' }, pal);
  P.L = shade(P.h, 0.25); P.n = shade(P.h, -0.28);
  const f = spr(P);
  const top = [
    '............Hh..',
    'h........s.hhh..',
    'hLLLLLLLLcchhehh',
    '.hhhhhhhhcchhhhH',
    '.hhhnnnhhcchRtR.',
    '.nnn...nnn.hhh..',
  ];
  const a = f([...top, '.hH......hH.....', 'hH........hH....', 'H..........HH...']);
  const b = f([...top, '..hH...hH.......', '..hH...Hh.......', '.HH....HH.......']);
  const l = f([...top.map((r, i) => i === 5 ? '.nnn...nnnhh....' : r), 'hH.........hH...', 'H...........HH..', '................']);
  return pack([a, b, l], 9, 9, 12, 7);
}
