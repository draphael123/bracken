// src/redraw/hornets_nest_art.js - THE HORNET'S NEST's FOE SKINS (claude/hornetsnest greybox recolours -> claude/hornetsnestart REDRAWN). Each reskin keeps the FRAME LAYOUT of the machine under it
// (main.js reads frames by index; the machine, hitbox and timings are untouched) but is drawn fresh as the nest's own creature, in hard inked pixels, and dies in its own skin (reskinSet):
//   hornet        the river wasp's machine (sting: true - a told ! dart from its post): a big nest hornet, banded abdomen and sting, red eye          - 4 frames (3 wing beats, hurt)         16 x 11
//   combdrone     the sprig's machine (a walker with a told bite): a stout comb-worker walking on its legs, abdomen banded - walk x4, look, tell (rears, jaws wide), bite (lunges), hurt  16 x 12
//   nestguard     the shieldbearer's machine (guards his front, a slow turn, a told shove): a soldier hornet standing upright behind a WAX PLATE of hex comb - 8 frames  16 x 16
//   (the venom spitter is gone: claude/hornetsnest2, Daniel 10-23 - it read as a mage; the nest's heavy is THE FAT HONEY HORNET, src/redraw/honey_hornet_art.js)
// bakeNestSkins(SPR) -> { hornet, combdrone, nestguard } (each { R, L, white, ax, ay, w, h } like every foe sheet; the SPR argument is read for the anchors only)
import { canvas, flipX, whiten, outline } from '../px.js';

const INK = '#1a0c06', CH = ['#3a1c0c', '#6a3a18', '#9c5c28', '#cc8444'], AM = ['#a05a0a', '#d88a1c', '#f6b436', '#ffe070'], BLK = '#1a0c06', WING = ['#9ab0c6', '#dce8f4', '#ffffff'];
const CREAM = ['#8a6a2c', '#d8b050', '#f6dc88', '#fff6c8'], VEN = ['#2c5a14', '#5ea02a', '#9ed84a', '#d8f890'], EYE = ['#6a0a0a', '#e8341c', '#ffa070'];
const px = (g, c, x, y) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
const rr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const line = (g, c, x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) px(g, c, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); };
const blob = (g, cx, cy, rx, ry, shade) => { for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) { const c = shade(dx, dy, x, y); if (c) px(g, c, x, y); } } };
const sh = (pal, dx, dy) => pal[Math.max(0, Math.min(pal.length - 1, Math.floor((1 - (dx * 0.35 + dy * 0.8 + 1) / 2) * pal.length)))];
const sheet = (frames, w, h, ax, ay, rim) => { const R = frames.map(f => { const [c, g] = canvas(w, h); f(g); return outline(c, INK); }), white = R.map(c => whiten(c)); return { R, L: R.map(flipX), white: { R: white, L: white.map(flipX) }, ax, ay, w: rim.w, h: rim.h }; };
/* a banded abdomen: an egg from (cx, cy), axis pointing back-left (dir -1) tilted by tilt */
function abdomen(g, cx, cy, rx, ry, bands) { blob(g, cx, cy, rx, ry, (dx, dy, x) => { const k = Math.floor((x - (cx - rx)) / 2.2); return bands.includes(k) ? (dy < -0.3 ? '#3a2410' : BLK) : sh(AM, dx, dy); }); }
const eye = (g, x, y, big) => { px(g, EYE[1], x, y); if (big) px(g, EYE[1], x, y + 1); px(g, EYE[2], x, y - (big ? 0 : 0)); };

/* ---------------- THE NEST HORNET (16 x 11) ---------------- */
function hornetFrame(beat, hurt) { return g => {
  const dy = hurt ? 1 : 0;
  /* wings first (behind): a pair, up and back, at one of three beats */
  const W = [[[8, 3], [4, 0], [7, 0]], [[8, 3], [2, 2], [3, 1]], [[8, 3], [5, -0.5], [9, 0]]][beat];
  line(g, WING[1], 8, 3 + dy, W[1][0], W[1][1] + dy); line(g, WING[1], 9, 3 + dy, W[1][0] + 1, W[1][1] + dy); line(g, WING[0], 9, 3 + dy, W[2][0], W[2][1] + dy); line(g, WING[0], 8, 2.6 + dy, W[2][0] - 1, W[2][1] + dy); px(g, WING[2], 6, 1 + dy); if (beat !== 2) px(g, WING[1], 5, 2 + dy);
  abdomen(g, 4.4, 6.2 + dy, 4.2, 2.6, [1, 3]); line(g, '#fff6c8', 0, 8 + dy, 1, 7.5 + dy);                                   /* the banded abdomen and its sting */
  blob(g, 8.5, 5.6 + dy, 2.6, 2.4, (dx, dy2) => sh(CH, dx, dy2));                                                           /* the thorax */
  blob(g, 11.8, 6 + dy, 2.2, 2.1, (dx, dy2) => sh(CH, dx, dy2)); eye(g, 12.5, 5 + dy, true); if (hurt) { px(g, INK, 12.5, 5 + dy); px(g, INK, 13, 6 + dy); }
  px(g, '#f0e4c8', 14, 7.5 + dy); line(g, INK, 13, 3.4 + dy, 14.5, 1.6 + dy);                                              /* a mandible, a feeler */
  px(g, CH[0], 7, 8 + dy); px(g, CH[0], 9, 8.5 + dy); px(g, CH[0], 11, 8.4 + dy); };
}
/* ---------------- THE COMB DRONE (16 x 12): a stout worker on six-ish legs; frames walk0-3, look, tell, bite, hurt ---------------- */
function droneFrame(kind, k) { return g => {
  const hurt = kind === 'hurt', lunge = kind === 'bite' ? 2 : 0, rear = kind === 'tell' ? -2.2 : kind === 'look' ? -1 : 0, bob = kind === 'walk' && (k & 1) ? 0.6 : 0, oy = hurt ? 1 : 0;
  /* legs: three a side, the walk cycles them */
  const phase = kind === 'walk' ? k : 0;
  for (let i = 0; i < 3; i++) { const lx = 5 + i * 3 + lunge * 0.5, a = ((phase + i) & 1) ? 1 : -1, fx = lx + a * (kind === 'walk' ? 1.5 : 0.5) - (kind === 'tell' ? 1 : 0);
    line(g, CH[1], lx, 8 + oy, fx, 10 + oy); px(g, CH[0], fx, 11 + oy); }
  abdomen(g, 5.2 + lunge * 0.3, 6 - bob + oy + rear * 0.5, 4.4, 3.2, [1, 3]); line(g, '#f4ecd8', 0.5, 8 + oy, 1.5, 7.5 + oy);
  blob(g, 9.6 + lunge, 6.2 - bob + oy + rear * 0.4, 2.6, 2.4, (dx, dy) => sh(CH, dx, dy));
  const hx = 12.6 + lunge, hy = 5.6 + rear + oy - bob; blob(g, hx, hy, 2.3, 2.2, (dx, dy) => sh(CH, dx, dy));
  eye(g, hx + 0.8, hy - 0.8, true); if (hurt) { px(g, INK, hx + 0.8, hy - 0.8); px(g, INK, hx + 1.2, hy); }
  if (kind === 'tell') { px(g, '#f0e4c8', hx + 2, hy + 1.5); px(g, '#f0e4c8', hx + 2.5, hy + 2.5); px(g, '#f0e4c8', hx + 1, hy + 2.8); px(g, '#ff6b6b', hx + 1, hy - 3.5); px(g, '#ff6b6b', hx + 1, hy - 4.5); }   /* jaws wide, the red ! */
  else if (kind === 'bite') { px(g, '#f0e4c8', hx + 2.4, hy + 1); px(g, '#f0e4c8', hx + 2.4, hy + 2); }
  else px(g, '#f0e4c8', hx + 2, hy + 1.8);
  line(g, INK, hx + 0.5, hy - 2.2, hx + 2.6, hy - 3.9 - (kind === 'look' ? 1 : 0)); px(g, AM[3], hx + 2.8, hy - 4 - (kind === 'look' ? 1 : 0)); }; }
/* ---------------- THE NEST-GUARD (16 x 16): a soldier hornet upright behind a wax plate ---------------- */
function guardFrame(kind, k) { return g => {
  const step = kind === 'walk' ? (k & 1) : 0, leg = kind === 'walk' ? (k === 1 ? 1 : k === 3 ? -1 : 0) : 0, tell = kind === 'tell', shove = kind === 'shove', turn = kind === 'turn', low = kind === 'low', lean = shove ? 2 : tell ? -1.5 : 0, bob = step ? 0 : 0;
  /* legs */
  line(g, CH[1], 5.5 + lean * 0.3, 11.5, 4.5 + leg + lean * 0.3, 14.6); px(g, CH[0], 4 + leg + lean * 0.3, 15); line(g, CH[1], 8.5 + lean * 0.3, 11.5, 9.5 - leg + lean * 0.3, 14.6); px(g, CH[0], 10 - leg + lean * 0.3, 15);
  /* the tail: a banded abdomen hanging behind, the sting */
  abdomen(g, 3.2 + lean * 0.4, 9 + step * 0.4, 3.0, 2.6, [1]); line(g, '#f4ecd8', 0.5, 11 + step * 0.4, 1.4, 10.5 + step * 0.4);
  /* chest + head with a crested helm of chitin */
  blob(g, 7 + lean, 8.4, 2.9, 3.4, (dx, dy) => sh(CH, dx, dy)); px(g, AM[2], 6.5 + lean, 7); px(g, AM[2], 8.5 + lean, 7.5);
  const hx = 8 + lean + (turn ? 1 : 0), hy = 3.8 + bob; blob(g, hx, hy, 2.6, 2.5, (dx, dy) => sh(CH, dx, dy)); eye(g, hx + 1.2, hy - 0.2, true);
  line(g, AM[1], hx - 2, hy - 2, hx - 0.5, hy - 3.6); line(g, AM[2], hx - 0.5, hy - 3.6, hx + 1.5, hy - 3); px(g, AM[3], hx - 0.5, hy - 3.8);   /* the crest */
  px(g, '#f0e4c8', hx + 2.6, hy + 1.6); if (tell) { px(g, '#f0e4c8', hx + 3, hy + 2.6); px(g, '#ff6b6b', hx + 1, hy - 5); px(g, '#ff6b6b', hx + 1, hy - 6.4); }
  /* the plate: a tall hexagonal wax shield on his forward arm, cells on its face; it swings with the move */
  const pxx = shove ? 11.5 : tell ? 8 : turn ? 8.5 : low ? 10.5 : 10.5, pyy = low ? 7.5 : 5.2, pw = turn ? 3 : 4.4, ph = low ? 5 : 8.2;
  blob(g, pxx + pw / 2, pyy + ph / 2, pw / 2 + 0.4, ph / 2, (dx, dy, x, y) => { const rim = dx * dx + dy * dy > 0.62; if (rim) return CREAM[0]; const cell = ((x + ((y >> 1) & 1) * 2) % 3 === 0) || (y % 2 === 0 && dy < 2); return cell && (x + y) % 2 ? CREAM[1] : sh(CREAM, dx * 0.6, dy * 0.6); });
  if (!turn) px(g, CREAM[3], pxx + 1, pyy + 1.5); px(g, '#6a4a1c', pxx + pw / 2, pyy + ph / 2 - 1);   /* the boss of the plate */
  /* the arm: a jointed limb to the plate */
  line(g, CH[1], 8.5 + lean, 7.8, pxx + 0.5, pyy + ph / 2 + 0.5); }; }
export function bakeNestSkins(SPR) {
  const keep = n => ({ w: SPR[n].w, h: SPR[n].h });
  return {
    hornet: sheet([hornetFrame(0), hornetFrame(1), hornetFrame(2), hornetFrame(0, true)], 16, 11, SPR.wasp.ax, SPR.wasp.ay, keep('wasp')),
    combdrone: sheet([droneFrame('walk', 0), droneFrame('walk', 1), droneFrame('walk', 2), droneFrame('walk', 3), droneFrame('look'), droneFrame('tell'), droneFrame('bite'), droneFrame('hurt')], 16, 12, SPR.sprig.ax, SPR.sprig.ay, keep('sprig')),
    nestguard: sheet([guardFrame('walk', 0), guardFrame('walk', 1), guardFrame('walk', 2), guardFrame('walk', 3), guardFrame('turn'), guardFrame('tell'), guardFrame('shove'), guardFrame('low')], 16, 16, SPR.shield.ax, SPR.shield.ay, keep('shield')),
  };
}
