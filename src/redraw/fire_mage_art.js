// fire_mage_art.js - THE GOBLIN FIRE MAGE and THE CINDER ACOLYTE (claude/pyroboss2, GREYBOX for the art lane). Drawn on the monastery goblin mage's grid
// (src/redraw/monastery.js bakeGoblinMage: 16 px wide, feet on row 20, anchor 8,21, box 10x16) so every pick and hit box of the mage's machine holds -
// and with frames of their own for the fire kit (B16: every ability its own windup + release pose):
//   0 idle (staff upright, a small flame on its tip)   1-2 walk   3 THE LOB'S WINDUP (staff drawn back over the shoulder, the flame swelling)
//   4 THE RELEASE (staff flung forward, the tip empty)  5 (spare: the rune pose's slot - the staff raised)  6 hurt (hat/hood knocked, staff dropped)
//   7 THE FLAME WARD (staff planted, both hands out)    8 DOUSED (hunched, the staff a black stick smoking)
// THE GOBLIN FIRE MAGE: green goblin, a scorched red-brown robe with an ember hem, a pointed hat singed black at the brim, an iron-shod staff.
// THE CINDER ACOLYTE: a man - pale face under an ash-grey hood, an ash robe with an ember sash, the same staff (the theme-fit reskin past the Goblin Queen).
import { outline, flipX, whiten, fromGrid } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const white = frames.map(c => whiten(c)); return { R: frames, L: frames.map(flipX), white: { R: white, L: white.map(flipX) }, ax, ay, w, h }; };
const putRow = (rows, y, x, str) => { while (rows.length <= y) rows.push(''); rows[y] = rows[y].padEnd(x, '.'); rows[y] = rows[y].slice(0, x) + str + rows[y].slice(x + str.length); };

function bake(human) {
  const P = human
    ? { g: '#e0b894', G: '#a87e5e', e: '#2a1a14', n: '#6a6660', N: '#3a3834', l: '#8e8a82', s: '#d8481c', S: '#8a2a14', k: '#4a3a2e', K: '#2a2018', f: '#ff9a3c', F: '#ffd36b', w: '#fff6c8', h: '#3a3834', H: '#5a5650', x: '#1a1210', o: OUT }
    : { g: '#6faa4a', G: '#3f6e2c', e: '#f3f0d2', n: '#8a3a22', N: '#4a1c10', l: '#b0583a', s: '#ff6b2c', S: '#a8361a', k: '#4a3a2e', K: '#2a2018', f: '#ff9a3c', F: '#ffd36b', w: '#fff6c8', h: '#2a1a14', H: '#5a2a1a', x: '#1a1210', o: OUT };
  /* the head and hat (goblin: pointed singed hat; human: a hood) */
  const hat = human ? ['', '', '.....HHHH', '....HhhhhH', '...HhhhhhhH', '...Hh....hH', '...Hh....hH', '....hhhhhh']
                    : ['.h', '.hH', '..hNN', '...NNNn', '....NNnnn', '....NNnlnn', '....hhhhhh', '..hhNnnnnhh'];
  const head = human ? ['....hggggh', '....hgeoge', '.....gGGg'] : ['....ggggggg', '....ggeogeo', '.....gGGGg'];
  const body = ['...nnssssnnn', '..nnlnnnnnnn', '..nlnnnnnnnn', '..nlnnnnnnnn', '.nnlnnnnnnnnn', '.nnlnnnnnnnnn', '.NsSsSsSsSsSN'];
  const feet = ['...GG...GG', '....GG.GG', '...GG....GG'];
  const staffV = (rows, x, y0, y1, lit, big) => { for (let y = y0; y <= y1; y++) putRow(rows, y, x, y === y1 ? 'K' : 'k');
    if (lit) { putRow(rows, y0 - 1, x, 'f'); if (big) { putRow(rows, y0 - 2, x - 1, 'fFf'); putRow(rows, y0 - 3, x, 'F'); putRow(rows, y0 - 1, x - 1, 'FwF'); } else putRow(rows, y0 - 2, x, 'F'); } };
  const frame = pose => {
    const rows = [...(pose === 6 ? ['', '', '', '', '', '', '', human ? '....hhhhhh' : '..hhNnnnnhh'] : hat), ...head, ...body];
    if (pose === 6) { putRow(rows, 9, 9, human ? 'gGGg' : 'gGGgGGg'); putRow(rows, 18, 12, 'kkkK'); }                                   /* HURT: knocked, the staff down at the feet */
    else if (pose === 3) {   /* THE LOB'S WINDUP: the staff drawn back over the shoulder, the flame on its tip swelling behind the head */
      for (let k = 0; k < 7; k++) putRow(rows, 12 - k, 4 - Math.floor(k / 2), 'k'); putRow(rows, 5, 0, 'fFf'); putRow(rows, 4, 1, 'F'); putRow(rows, 6, 1, 'w'); putRow(rows, 12, 5, 'g'); }
    else if (pose === 4) {   /* THE RELEASE: flung forward and out, the tip empty, a trail of sparks off it */
      for (let k = 0; k < 6; k++) putRow(rows, 12 - k, 11 + k, 'k'); putRow(rows, 12, 10, 'g'); putRow(rows, 5, 15, 'f'); putRow(rows, 7, 15, 'F'); }
    else if (pose === 5) { staffV(rows, 12, 2, 13, true, true); putRow(rows, 9, 11, 'g'); }                                               /* the staff raised high (the rune's slot) */
    else if (pose === 7) {   /* THE FLAME WARD: the staff planted, both palms out, the tip blazing */
      staffV(rows, 13, 6, 19, true, true); putRow(rows, 12, 11, 'gg'); putRow(rows, 12, 1, 'gg'); putRow(rows, 11, 0, 'F'); putRow(rows, 11, 14, 'F'); }
    else if (pose === 8) {   /* DOUSED: hunched, the hat dripping, the staff a black smoking stick */
      rows.unshift(''); rows.length = Math.min(rows.length, 20); for (let y = 7; y <= 19; y++) putRow(rows, y, 13, 'x'); putRow(rows, 13, 12, 'g'); }
    else { staffV(rows, 13, 5, 19, true, false); putRow(rows, 13, 12, 'g'); }                                                              /* idle / walk: the staff upright in the near hand, a small flame */
    while (rows.length < 20) rows.push(''); rows.length = 20; rows.push(feet[pose === 1 ? 1 : pose === 2 ? 2 : 0]);
    return outline(fromGrid(rows.map(r => (r || '').padEnd(16, '.').slice(0, 16)), P, 1), OUT); };
  return pack([0, 1, 2, 3, 4, 5, 6, 7, 8].map(frame), 8, 21, 10, 16);
}
export const bakeGoblinFireMage = () => bake(false);
export const bakeCinderAcolyte = () => bake(true);
/* the frame for a fire skin by mode (main.js's gobmage frame pick asks this first) */
export function fireMageFrame(e) {
  if (e.mode === 'lobTell') return 3;
  if (e.mode === 'lob') return 4;
  if (e.mode === 'flameWard' || e.mode === 'spent') return 7;
  if (e.mode === 'doused') return 8;
  return Math.abs(e.vx) > 4 ? 1 + Math.floor(e.anim * 6) % 2 : 0;
}
