// src/flask-art.js - FLASKS 2 ART (claude/flasks2art): the DRINK FRAMES of all seven heroes, the flask bottle in hand, the HUD bottles, the store's icons,
// the hidden finds' sprites, the cork and the splash. ART ONLY: no timer, number or rule reads anything here (the drink's timing, the spill window and the
// heal are src/flasks2.js + src/main.js drinkTick, untouched).
//
// THE DRINK FRAMES. A hero's drink is five drawings, baked off his own idle frame (so every skin, gear tier and weapon skin wears them): 0 UNCORK (the
// flask upright in the front fist at his chest, the cork popping off it), 1 GULP, 2 GULP (head back, the bottle tipped to his mouth, the second one
// emptier), 3 LOWER (the bottle coming down, a green rim round him: the heal), 4 SPILL (the flask knocked away, the hand flung back, droplets).
// Each hero has his own head box, shoulder, mouth, chest hand and the colours of his own sleeve and glove (read off the frame, so a skin changes them).
import { canvas, fromGrid, outline, flipX, whiten } from './px.js';
import { OUT } from './art.js';

/* per hero: ABSOLUTE pixels in the 34x56 hero frame. head = the box that tips back [x0,x1,y0,y1] (never the staff or spear beside it); S = the front
   shoulder; C = the fist at his chest; M = his mouth (where the neck of the bottle meets him); sleeve / glove = pixels to read the colours from */
export const SPEC = {
  knight:     { head: [10, 19, 29, 35], S: [17, 38], C: [20, 38], M: [19, 34], sleeve: [15, 38], glove: [16, 38] },
  pyro:       { head: [7, 17, 24, 31],  S: [15, 34], C: [18, 35], M: [17, 30], sleeve: [13, 36], glove: [18, 35] },
  pirate:     { head: [10, 21, 29, 35], S: [16, 38], C: [19, 39], M: [18, 34], sleeve: [12, 38], glove: [13, 33] },
  reaper:     { head: [9, 20, 29, 35],  S: [17, 38], C: [20, 39], M: [19, 35], sleeve: [11, 37], glove: [18, 37] },
  warden:     { head: [10, 20, 29, 35], S: [17, 38], C: [20, 38], M: [17, 35], sleeve: [13, 38], glove: [14, 35] },
  paladin:    { head: [10, 20, 29, 34], S: [17, 38], C: [20, 38], M: [19, 34], sleeve: [12, 38], glove: [18, 37] },
  geomancer:  { head: [10, 19, 29, 36], S: [17, 39], C: [19, 39], M: [18, 35], sleeve: [14, 38], glove: [16, 34] },
};

const GLASS = '#c9d1dc', RED = '#c9463d', HI = '#ff9a9a', CORK = '#9a6a34', EMPTY = '#8a96a8', GREEN = '#8fd160';
const BP = { w: GLASS, r: RED, L: HI, k: CORK, h: '#e8eef6', e: EMPTY };
const B = rows => outline(fromGrid(rows, BP, 1), OUT);
/* the bottle in a fist: upright (neck up), tipped (neck down-left, base up-right), and the emptier one for the second gulp. Each canvas has a 1 px margin
   and outline, so a grid cell (cx, cy) sits at pixel (cx + 1, cy + 1) of it. */
export const BOTTLE = {
  up:      B(['.w.', '.w.', 'rrr', 'rLr', 'rrr', 'rrr']),
  upCork:  B(['.k.', '...', '.w.', '.w.', 'rrr', 'rLr', 'rrr', 'rrr']),
  tip:     B(['...rr', '..rLr', '..rrr', '.ww..', 'w....']),
  tipHalf: B(['...ee', '..erh', '..rrr', '.ww..', 'w....']),
  tipEmpty:B(['...ee', '..ehe', '..eer', '.ww..', 'w....']),
};
const put = (g, c, x, y) => g.drawImage(c, x | 0, y | 0);

/* a one pixel arm: S -> E -> H in the sleeve's colour with a dark edge on whatever is empty, the fist (2x2 glove) at H */
function arm(g, base, S, E, H, sleeve, glove) {
  const pts = [], seg = (a, b) => { let [x0, y0] = a; const [x1, y1] = b, dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let er = dx + dy;
    for (;;) { pts.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * er; if (e2 >= dy) { er += dy; x0 += sx; } if (e2 <= dx) { er += dx; y0 += sy; } } };
  seg(S, E); seg(E, H);
  const empty = (x, y) => x < 0 || y < 0 || x >= base.w || y >= base.h || base.d[(y * base.w + x) * 4 + 3] === 0;
  const ring = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  g.fillStyle = OUT; for (const [x, y] of pts.concat([[H[0] + 1, H[1]], [H[0], H[1] + 1], [H[0] + 1, H[1] + 1]])) for (const [ox, oy] of ring) if (empty(x + ox, y + oy)) g.fillRect(x + ox, y + oy, 1, 1);
  g.fillStyle = sleeve; for (const [x, y] of pts) g.fillRect(x, y, 1, 1);
  g.fillStyle = glove; g.fillRect(H[0], H[1], 2, 2);
}
const colAt = (base, [x, y]) => { const i = (y * base.w + x) * 4, d = base.d; return d[i + 3] ? 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')' : '#c9b27c'; };

/* tip the head box back: cleared, then redrawn dx to the left (and dy down) - the staff or spear beside it never moves */
function tipHead(c, g, [x0, x1, y0, y1], dx, dy = 0) {
  if (!dx && !dy) return; const w = x1 - x0 + 1, h = y1 - y0 + 1, img = g.getImageData(x0, y0, w, h);
  g.clearRect(x0, y0, w, h); g.putImageData(img, x0 + dx, y0 + dy);
}
function rim(c, g, color) {   /* a one pixel rim of colour round the figure, only on empty pixels (the heal's green) */
  const w = whiten(c, color), [o, og] = canvas(c.width, c.height);
  for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) og.drawImage(w, ox, oy);
  og.globalCompositeOperation = 'destination-out'; og.drawImage(c, 0, 0);
  const im = og.getImageData(0, 0, o.width, o.height); for (let y = 0; y < o.height; y++) for (let x = 0; x < o.width; x++) if ((x + y) & 1) im.data[(y * o.width + x) * 4 + 3] = 0;   /* dithered: a glow, not a line */
  og.putImageData(im, 0, 0); g.drawImage(o, 0, 0);
}

export function drinkFrames(idle, hero) {
  const sp = SPEC[hero] || SPEC.knight, out = [];
  const [bc, bg] = canvas(idle.width, idle.height); bg.drawImage(idle, 0, 0);
  const base = { w: idle.width, h: idle.height, d: bg.getImageData(0, 0, idle.width, idle.height).data };
  const sleeve = colAt(base, sp.sleeve), glove = colAt(base, sp.glove);
  const mk = fn => { const [c, g] = canvas(idle.width, idle.height); g.drawImage(idle, 0, 0); fn(c, g); return c; };
  const [Sx, Sy] = sp.S, [Cx, Cy] = sp.C, [Mx, My] = sp.M;
  /* 0 UNCORK: the flask upright in the fist at his chest, the cork lifting off it */
  out.push(mk((c, g) => { const H = [Cx, Cy - 1]; put(g, BOTTLE.upCork, H[0] - 2, H[1] - 8); arm(g, base, [Sx, Sy], [Sx + 1, Sy + 2], H, sleeve, glove); }));
  /* 1 GULP: head back one, the neck at his lips, the bottle full */
  out.push(mk((c, g) => { tipHead(c, g, sp.head, -1); const tx = Mx - 1, H = [tx + 2, My - 1]; put(g, BOTTLE.tip, tx - 1, My - 5); arm(g, base, [Sx, Sy], [Sx + 2, Sy - 1], H, sleeve, glove); }));
  /* 2 GULP: head back two and the bottle tipped steeper, the glass emptying */
  out.push(mk((c, g) => { tipHead(c, g, sp.head, -2); const tx = Mx - 2, H = [tx + 2, My - 2]; put(g, BOTTLE.tipHalf, tx - 1, My - 6); arm(g, base, [Sx, Sy], [Sx + 2, Sy - 2], H, sleeve, glove); }));
  /* 3 LOWER: the empty bottle coming down to his chest, the heal in a green rim round him */
  out.push(mk((c, g) => { const H = [Cx, Cy - 1]; put(g, BOTTLE.tipEmpty, H[0] - 2, H[1] - 4); arm(g, base, [Sx, Sy], [Sx + 1, Sy + 2], H, sleeve, glove); rim(c, g, GREEN); }));
  /* 4 SPILL: the flask knocked from his hand - the glove flung back and open, his head snapping round, red drops in the air */
  out.push(mk((c, g) => { tipHead(c, g, sp.head, -1, 1); const H = [Sx - 3, Sy - 4]; arm(g, base, [Sx, Sy], [Sx - 2, Sy - 1], H, sleeve, glove);
    g.fillStyle = HI; g.fillRect(Cx + 2, Cy - 7, 1, 1); g.fillRect(Cx + 4, Cy - 4, 1, 1); g.fillStyle = RED; g.fillRect(Cx + 3, Cy - 9, 1, 1); g.fillRect(Cx + 1, Cy - 5, 1, 1); g.fillRect(Cx + 5, Cy - 8, 1, 1); }));
  return out;
}

/* THE SET GETS THE FIVE: R.drink and L.drink, and their white flashes (so a hit on a drinking hero flashes like any frame). Called from main.js heroSet */
export function addDrink(set, hero) {
  const idle = set && set.R && set.R.idle && set.R.idle[0]; if (!idle) return set;
  const R = drinkFrames(idle, hero), L = R.map(flipX), WR = R.map(c => whiten(c)), WL = WR.map(flipX);
  set.R.drink = R; set.L.drink = L; set.white.R.drink = WR; set.white.L.drink = WL; if (set.bare) addDrink(set.bare, hero); return set;
}
/* which drawing a phase of the drink is (src/flasks2.js drinkPhase's .ph): uncork 0, gulp1 1, gulp2 2, lower 3; the spill is 4 */
export const DRINK_FRAME = { uncork: 0, gulp1: 1, gulp2: 2, lower: 3, spill: 4 };

/* ===== THE BOTTLES, THE ICONS, THE FINDS, THE CORK AND THE SPLASH ===== */
const G = (rows, pal) => outline(fromGrid(rows, pal, 1), OUT);
const rotQ = (c, q) => { let cur = c; for (let i = 0; i < q; i++) { const [o, g] = canvas(cur.height, cur.width); g.translate(cur.height, 0); g.rotate(Math.PI / 2); g.drawImage(cur, 0, 0); cur = o; } return cur; };   /* exact quarter turns: no pixel is ever resampled */
const BOT = ['..c..', '..c..', '.rrr.', 'rrrrr', 'rLrrr', '.rrr.'];   /* the HUD bottle: 5x6, one pixel scale with the heart and the bolt (7x8 with its outline) */

/* THE HUD ROW'S BOTTLES, BY POTENCY: the same 7x8 bottle in four cuts - the base (35%) is a plain red one with a steel stopper, RICH (40%) a gold stopper
   and a deeper red, DISTILLED (45%) a pale blue-white stopper and a rose liquid with a bright shoulder, SUNLIGHT (50%) a sun-orange liquid with two sparks.
   Gold stays the OVER-MAX colour (main.js PROP.hudFlaskGold), so the potency never wears it. */
const TIER = [
  { rows: BOT, pal: { c: '#c9d1dc', r: '#c9463d', L: '#ff9a9a' } },
  { rows: BOT, pal: { c: '#ffd36b', r: '#b3342e', L: '#ff9a5c' } },
  { rows: ['..c..', '..c..', '.rrr.', 'rrrrr', 'rLLrr', '.rrr.'], pal: { c: '#dfe8ff', r: '#d04a6a', L: '#ffe0ea' } },
  { rows: ['y.c.y', '..c..', '.rrr.', 'rrrrr', 'rLrrr', '.rrr.'], pal: { c: '#fff6c8', r: '#ff8a4c', L: '#ffe9a0', y: '#fff6c8' } },
];
export const HUD_TIER = TIER.map(t => G(t.rows, t.pal));
export const tierOf = pct => Math.max(0, Math.min(3, Math.round(((pct || 0.35) - 0.35) / 0.05)));

/* THE STORE'S ICONS (<= 9x9, drawn at 1x on the row): every line of the FLASKS tab, keyed by its item id. COUNT: one bottle and a +, two bottles, the glass
   SHARD; POTENCY: the bottle of that tier with one / two / three gold pips beside it (the same tiers as the HUD row's); PERKS: QUICK DRAUGHT (the bottle
   with speed lines), STEADY HAND (a fist gripping the bottle), SHRINE BLESSING (a shrine stone under a halo); and SECOND DRAUGHT, the level-up card. */
const P6 = { c: '#c9d1dc', r: '#c9463d', L: '#ff9a9a', y: '#ffd36b', b: '#c9a070', B: '#9a7040', s: '#9a9aa8', S: '#6a6a7a', g: '#8fd160', w: '#dff4fa', e: '#9fd8e8', n: '#6aa8c8', h: '#ffffff', k: '#9a6a34', p: '#ffd36b' };
const pips = (rows, ...at) => rows.map((r, i) => at.includes(i) ? r.slice(0, 6) + 'p' : r);
const POT = ['..c....', '..c....', '.rrr...', 'rrrrr..', 'rLrrr..', '.rrr...'];
export const ICONS = {
  tonic:     G(['..c..y.', '..c.yyy', '.rrr.y.', 'rrrrr..', 'rLrrr..', '.rrr...'], P6),
  extra2:    G(['.c...c.', '.c...c.', 'rrr.rrr', 'rLr.rLr', 'rrr.rrr', 'rrr.rrr'], P6),
  extra3:    G(['...e...', '..eweh.', '.ewwwe.', 'ewwhwwe', '.ewwne.', '..eww..', '...n...'], { ...P6, h: '#ffffff' }),
  rich:      G(pips(POT, 5), { ...P6, c: '#ffd36b', r: '#b3342e', L: '#ff9a5c' }),
  distilled: G(pips(POT, 5, 3), { ...P6, c: '#dfe8ff', r: '#d04a6a', L: '#ffe0ea' }),
  sunlight:  G(pips(['y.c.y..', '..c....', '.rrr...', 'rrrrr..', 'rLrrr..', '.rrr...'], 5, 3, 1), { ...P6, c: '#fff6c8', r: '#ff8a4c', L: '#ffe9a0' }),
  quick:     G(['....c..', '....c..', 'h..rrr.', '.hrrrrr', 'h.rLrrr', '...rrr.'], { ...P6, h: '#fff6e0' }),
  steady:    G(['..c..', '..c..', '.rrr.', 'bbbbb', 'bBbbb', '.bbbb', '..bb.'], P6),
  blessing:  G(['y.y.y', '.yyy.', '.sss.', 'ssrss', 'sssss', 'SSSSS'], P6),
  second:    G(['..c..gg', '..c.gg.', '.rrrgg.', 'rLrrrg.', 'rrrrr..', '.rrr...'], P6),
  hidden:    G(['.ggg.', 'g...g', '...g.', '..g..', '.....', '..g..'], { g: '#8a8a9a' }),
};
/* THE FINDS IN THE WOOD: the same three drawn for the ground (a touch bigger bob and a glint, main.js draws the bob) - the shard, the bottled sunlight, the glove */
export const FIND_ART = { flaskshard: ICONS.extra3, sunlight: ICONS.sunlight, steady: ICONS.steady };
/* the gold glint on a find: three beats, a pixel, a plus, a pixel (3x3) */
export const GLINT = [['.....', '..y..', '.....'], ['..y..', '.yhy.', '..y..'], ['.....', '..h..', '.....']].map(r => fromGrid(r, { y: '#ffd36b', h: '#fff6c8' }, 0));

/* THE CORK: 4 quarter-turns (a flying cork steps through them, never a rotated sprite) and the SPLASH: three beats of a broken flask - a burst, a spray, the drops falling */
export const CORK = (c => [0, 1, 2, 3].map(q => rotQ(c, q)))(G(['kkk', 'kLk'], { k: '#9a6a34', L: '#c8904a' }));
export const SPLASH = [
  ['..r..', '.rLr.', 'rrrrr', '.r.r.'],
  ['r.L.r', '.r.r.', 'r.r.r', '.....'],
  ['r...r', '.....', '..r..', '.r.r.'],
].map(r => fromGrid(r, { r: '#c9463d', L: '#ff9a9a' }, 0));
/* the knocked-away flask in the air: four quarter-turns of the bottle (tumbling in steps) */
export const FLIGHT = (c => [0, 1, 2, 3].map(q => rotQ(c, q)))(BOTTLE.up);
