// scalder.js — THE SCALDER's sprite (the creature is updateScalder in main.js; the brief is docs/briefs/stormhold-town.md §5).
// px.js primitives only. Frames face RIGHT, 18x16, the feet on the bottom row (ay = 16).
//
// THE SILHOUETTE IS THE POT. A squat goblin in a leather apron behind an iron cauldron half as wide again as he is, the
// pitch in it glowing: at 320x180 nothing else on a tower top is that shape, so a player looking UP a ladder reads him
// before anything else. The pot tilts toward the drop to tell the pour, and goes right over to throw it.
//
// bakeScalder()  0 idle (ladle in the pot) | 1 stir (the refill: ladle down, the pitch bright, steam) | 2 POUR TELL (the pot
//                tipping, boiling over) | 3 POUR (over the lip, pitch going down) | 4 LADLE TELL (the ladle back over his
//                head, dripping) | 5 LADLE (swung out in front) | 6 hurt (rocked back, the pot rocking with him)
import { fromGrid, outline, flipX, whiten } from '../px.js';

const OUT = '#1b1626';
const PAL = { g: '#6faa4a', G: '#3f6e2c', e: '#f3f0d2', o: '#1b1626', n: '#5a3a24', N: '#3a2214', d: '#2e3038', D: '#1f2027', S: '#7c8797', s: '#a9b2bf',
  p: '#ff9a5c', P: '#ffd36b', w: '#8a5a32', W: '#5c3a1d', l: '#dfe8ff', y: '#e0b040' };

const W = 18, H = 16, BLANK = '.'.repeat(W);
const put = (R, x, y, s) => { if (y < 0 || y >= H) return; const row = R[y]; R[y] = (row.slice(0, x) + s + row.slice(x + s.length)).slice(0, W).padEnd(W, '.'); };
const goblin = (R, dy = 0, dx = 0) => {
  put(R, 1 + dx, 4 + dy, 'gggg'); put(R, dx, 5 + dy, 'ggeogg'); put(R, dx, 6 + dy, 'gggggg'); put(R, 1 + dx, 7 + dy, 'gGGg');
  put(R, 1 + dx, 8 + dy, 'nnnn'); put(R, dx, 9 + dy, 'gnnnng'); put(R, 1 + dx, 10 + dy, 'nNnn'); put(R, 1 + dx, 11 + dy, 'nnnn');
  put(R, 1 + dx, 12 + dy, 'nnnn'); put(R, 1 + dx, 13 + dy, 'G..G'); put(R, dx, 14 + dy, 'GG..GG');
};
// the pot upright: a rim, the pitch, the belly, three stubby legs on the boards
const pot = (R, glow = 'p') => {
  put(R, 8, 8, 'sSSSSSSSs'); put(R, 8, 9, 'd' + glow.repeat(7) + 'd'); put(R, 7, 10, 'ddddddddddd'); put(R, 7, 11, 'dddSddddddd');
  put(R, 7, 12, 'ddddddddddd'); put(R, 8, 13, 'DddddddD.'); put(R, 8, 14, 'D...D...D');
};
const frame = draw => { const R = Array.from({ length: H }, () => BLANK); draw(R); return outline(fromGrid(R, PAL, 1), OUT); };

export function bakeScalder() {
  const idle = frame(R => { goblin(R); pot(R); put(R, 6, 9, 'w'); put(R, 7, 8, 'w'); put(R, 8, 7, 'w'); put(R, 9, 6, 'W'); });
  const stir = frame(R => { goblin(R); pot(R, 'P'); put(R, 6, 9, 'ww'); put(R, 8, 9, 'W'); put(R, 10, 6, 'l'); put(R, 13, 5, 'l'); put(R, 11, 4, 'l'); put(R, 15, 6, 'l'); });
  const tell = frame(R => { goblin(R);
    put(R, 9, 6, 'sS'); put(R, 8, 7, 'sSSSS'); put(R, 12, 8, 'SSSs'); put(R, 8, 8, 'dPPP'); put(R, 16, 8, 'p');
    put(R, 7, 9, 'ddpppppd'); put(R, 7, 10, 'dddddddddd'); put(R, 7, 11, 'dddSdddddd'); put(R, 8, 12, 'dddddddd'); put(R, 9, 13, 'DdddD'); put(R, 9, 14, 'D...D');
    put(R, 5, 9, 'gg'); put(R, 10, 4, 'l'); put(R, 14, 3, 'l'); put(R, 12, 5, 'l'); put(R, 16, 5, 'l'); put(R, 15, 7, 'P'); });
  const pour = frame(R => { goblin(R);
    put(R, 7, 7, 'ddd'); put(R, 7, 8, 'ddddd'); put(R, 7, 9, 'ddddddS'); put(R, 7, 10, 'dddddddSs'); put(R, 8, 11, 'dddddddSs'); put(R, 9, 12, 'ddddddS');
    put(R, 10, 13, 'DddD'); put(R, 14, 9, 'pp'); put(R, 15, 10, 'Pp'); put(R, 16, 11, 'p'); put(R, 16, 12, 'P'); put(R, 16, 13, 'p'); put(R, 17, 14, 'p'); put(R, 16, 15, 'pP');
    put(R, 5, 9, 'ggg'); });
  const ladleTell = frame(R => { goblin(R); pot(R); put(R, 0, 0, 'ww'); put(R, 0, 1, 'wP'); put(R, 2, 2, 'W'); put(R, 3, 3, 'W'); put(R, 0, 2, 'p'); put(R, 4, 9, 'g'); });
  const ladle = frame(R => { goblin(R, 0, 1); pot(R); put(R, 6, 6, 'WWwwww'); put(R, 12, 5, 'ww'); put(R, 12, 6, 'wP'); put(R, 13, 7, 'p'); });
  const hurt = frame(R => { goblin(R); put(R, 1, 5, 'gQQogg'.replace(/Q/g, 'G')); pot(R); put(R, 9, 7, 'l'); put(R, 12, 6, 'l'); });
  const frames = [idle, stir, tell, pour, ladleTell, ladle, hurt];
  const white = frames.map(c => whiten(c));
  return { R: frames, L: frames.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 7, ay: 16, w: 10, h: 14 };
}
