// greenteeth_art.js - JENNY GREENTEETH and her lock (claude/lockkeeper; src/jenny-greenteeth.js is the fight). px.js primitives only. Every frame faces
// RIGHT, L is the flip, ax = the body's centre column, ay = the row under the lowest pixel.
//   JENNY GREENTEETH (GT_F): a hunched old hag, green-skinned and wet, with a curtain of weed for hair that hangs past her shoulders, long thin arms
//     with knuckly clawed hands, a mouth full of sharp green teeth, and eyes that glow yellow-green. Rags of sodden sacking. In the water only her head
//     and shoulders show; stranded she lies in the mud and claws herself along.
//   THE LOCK'S SKINS: the mitre gates' tarred oak with iron straps, the walers (a timber rail with an iron plate on its face), the gate walkway (oak
//     boards on an iron bearer, a lit edge), the chamber bed (stone setts under a skin of silt), the sunken narrowboat (tarred planks, a rust-red
//     rubbing strake, slimed), and the lock's coursed stone quoins.
import { canvas, px, rect, fillPoly, line, circle, ellipse, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function settle(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
function bake(n, W, H, draw, ax, hw, hh) {
  const R = [];
  for (let f = 0; f < n; f++) { const [c, g] = canvas(W, H); draw(g, f); outline(c, OUT); R.push(settle(c)); }
  const L = R.map(c => flipX(c)), white = R.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay: H - 1, w: hw, h: hh };
}

/* ================= JENNY GREENTEETH ================= */
const JW = 52, JH = 44, JX = 24;
export const JC = { skin: '#5e8a4a', skinD: '#3e6030', skinL: '#86b060', hair: '#23401e', hairD: '#162a14', hairL: '#4f7a2e', duck: '#9ac850',
  rag: '#3e4838', ragD: '#2a3026', teeth: '#c8e080', gum: '#5a1e24', mouth: '#1a0c10', eye: '#e8ff7a', eyeD: '#9ac830', nail: '#d0dcb0', mud: '#4a3a26' };
/* a long thin arm: shoulder -> elbow -> hand, knuckly, with three claws at the hand spread along `a` (radians) */
function arm(g, s, el, h, a = 0) {
  line(g, s[0], s[1], el[0], el[1], JC.skinD, 2); line(g, el[0], el[1], h[0], h[1], JC.skinD, 2);
  line(g, s[0], s[1] - 1, el[0], el[1] - 1, JC.skin); line(g, el[0], el[1] - 1, h[0], h[1] - 1, JC.skin); px(g, el[0], el[1], JC.skinL);
  circle(g, h[0], h[1], 2, JC.skin);
  for (let i = -1; i <= 1; i++) { const q = a + i * 0.5; line(g, h[0], h[1], Math.round(h[0] + Math.cos(q) * 4), Math.round(h[1] + Math.sin(q) * 4), JC.nail); }
}
/* the head: a long jaw, a hooked nose, the eyes, the teeth; `open` 0..2 how wide the mouth */
function head(g, x, y, open = 0, hurt = false) {
  fillPoly(g, [[x - 5, y - 6], [x + 4, y - 7], [x + 7, y - 2], [x + 7, y + 4 + open], [x + 2, y + 7 + open], [x - 4, y + 5], [x - 6, y]], JC.skin);
  line(g, x - 5, y - 6, x + 4, y - 7, JC.skinL); line(g, x + 7, y - 2, x + 9, y + 1, JC.skinD); px(g, x + 9, y + 2, JC.skinD);   /* the hooked nose */
  rect(g, x + 1, y - 3, 3, 2, hurt ? JC.eyeD : JC.eye); px(g, x + 3, y - 3, '#ffffff'); rect(g, x - 3, y - 3, 2, 2, hurt ? JC.eyeD : JC.eye);   /* the eyes, lit */
  if (open > 0) { rect(g, x - 1, y + 2, 8, 2 + open, JC.mouth); rect(g, x - 1, y + 2, 8, 1, JC.gum);
    for (let i = 0; i < 4; i++) { px(g, x + i * 2, y + 3, JC.teeth); px(g, x + i * 2 + 1, y + 3 + open, JC.teeth); } }
  else { line(g, x - 1, y + 3, x + 6, y + 3, JC.mouth); px(g, x + 1, y + 4, JC.teeth); px(g, x + 4, y + 4, JC.teeth); px(g, x + 6, y + 3, JC.teeth); }
}
/* the weed hair: a curtain of strands from the crown, hanging (or floating back) past the shoulders, duckweed caught in it */
function hair(g, x, y, len, sway, back = 0) {
  for (let i = -6; i <= 5; i++) { const x0 = x + i, x1 = x + i - back + Math.round(Math.sin(i * 1.3 + sway) * 2), y1 = y + len - Math.abs(i) + (i % 3);
    line(g, x0, y - 7, x1, y1, i % 2 ? JC.hair : JC.hairD); if (i % 3 === 0) px(g, x1, y1 - 3, JC.hairL); }
  fillPoly(g, [[x - 6, y - 7], [x, y - 10], [x + 5, y - 8], [x + 6, y - 4], [x - 6, y - 4]], JC.hair);
  for (const [dx, dy] of [[-4, 2], [3, 5], [-1, 9], [5, 11]]) px(g, x + dx - back, y + dy, JC.duck);
}
/* the body: a hunched back in wet sacking */
function body(g, x, y, lean = 0) {
  fillPoly(g, [[x - 9, y + 16], [x - 8, y + 4], [x - 3, y - 2 + lean], [x + 6, y + 1 + lean], [x + 9, y + 16]], JC.rag);
  line(g, x - 7, y + 6, x - 5, y + 16, JC.ragD); line(g, x + 2, y + 4, x + 3, y + 16, JC.ragD); px(g, x - 2, y + 9, JC.hairL);
  fillPoly(g, [[x - 4, y - 2 + lean], [x + 4, y - 1 + lean], [x + 3, y + 2 + lean], [x - 4, y + 2 + lean]], JC.skinD);   /* the scrawny neck and collarbone */
}
/* 0-1 swim, 2 tell (arms up, mouth open), 3 lunge (jaws), 4 reach (one arm long), 5 grab (both arms down, pulling), 6-7 stranded (clawing the mud),
   8 hurt, 9 dead, 10 flushed (on her back, limp), 11 hide (curled in the culvert), 12 drag (stretched, arms far forward) */
function drawJenny(g, f) {
  const B = JH - 2, X = JX;
  if (f === 6 || f === 7 || f === 12 || f === 9) {   /* PRONE in the mud */
    const y = B - 4, reach = f === 12 ? 14 : f === 7 ? 6 : 2;
    fillPoly(g, [[X - 16, y + 3], [X - 14, y - 3], [X + 2, y - 5], [X + 8, y - 2], [X + 8, y + 3]], JC.rag);
    line(g, X - 12, y - 1, X + 4, y - 3, JC.ragD);
    for (let i = 0; i < 9; i++) line(g, X + 4 + (i % 3), y - 5, X - 8 - i * 2, y + 2 + (i % 2), i % 2 ? JC.hair : JC.hairD);   /* the hair spread over the mud */
    if (f === 9) { head(g, X + 10, y - 1, 0, true); arm(g, [X + 4, y - 2], [X + 12, y + 2], [X + 20, y + 2], 0.2); arm(g, [X - 4, y - 2], [X - 12, y + 1], [X - 20, y + 2], 3); return; }
    head(g, X + 11, y - 3, f === 7 ? 2 : 1);
    arm(g, [X + 5, y - 3], [X + 12 + reach / 2, y - 6], [X + 18 + reach, y + 1], 0.4); arm(g, [X + 2, y - 2], [X + 8 + reach / 2, y + 1], [X + 14 + reach, y + 2], 0.2);
    rect(g, X - 16, y + 3, 30, 1, JC.mud); px(g, X + 18 + reach, y + 3, JC.mud); px(g, X + 14 + reach, y + 3, JC.mud); return; }
  if (f === 10) {   /* FLUSHED: rolled on her back, limp, arms and hair floating */
    const y = B - 6; fillPoly(g, [[X - 12, y + 2], [X - 10, y - 4], [X + 6, y - 5], [X + 10, y], [X + 6, y + 4]], JC.rag);
    head(g, X + 12, y - 1, 1, true); arm(g, [X + 2, y - 4], [X - 4, y - 10], [X - 12, y - 8], 3.4); arm(g, [X + 4, y - 3], [X + 10, y - 10], [X + 16, y - 12], -0.6);
    for (let i = 0; i < 7; i++) line(g, X + 16, y + i - 3, X + 22, y + i - 1, i % 2 ? JC.hair : JC.hairD); return; }
  if (f === 11) {   /* HIDING: a curled shape in the culvert's dark, only the eyes */
    const y = B - 8; fillPoly(g, [[X - 8, y + 8], [X - 7, y - 2], [X + 4, y - 5], [X + 9, y + 2], [X + 8, y + 8]], JC.hairD);
    rect(g, X + 1, y - 1, 3, 2, JC.eye); rect(g, X - 3, y - 1, 2, 2, JC.eye); return; }
  /* UPRIGHT in the water: her head and shoulders over it, the rest drawn under the water's wash */
  const bob = f === 1 ? 1 : 0, lean = f === 3 ? 3 : f === 8 ? -3 : 0, hx = X + 2 + lean, hy = B - 26 + bob - (f === 2 || f === 4 ? 2 : 0);
  body(g, X, hy + 8, f === 3 ? 2 : 0);
  hair(g, hx - 1, hy, f === 2 || f === 4 ? 16 : 20, f * 1.7, f === 3 ? 3 : 0);
  head(g, hx, hy, f === 3 ? 3 : f === 2 ? 2 : f === 5 ? 1 : f === 8 ? 1 : 0, f === 8);
  const sL = [X - 5, hy + 9], sR = [X + 5, hy + 9];
  if (f === 0 || f === 1) { arm(g, sL, [X - 12, hy + 16 + bob], [X - 20, hy + 20], 2.6); arm(g, sR, [X + 11, hy + 15 - bob], [X + 17, hy + 20], 0.8); }
  else if (f === 2) { arm(g, sL, [X - 12, hy + 2], [X - 16, hy - 9], -2.0); arm(g, sR, [X + 12, hy + 2], [X + 16, hy - 10], -1.2); }
  else if (f === 3) { arm(g, sL, [X - 2, hy + 16], [X + 8, hy + 20], 0.6); arm(g, sR, [X + 14, hy + 10], [X + 23, hy + 8], 0.1); }
  else if (f === 4) { arm(g, sL, [X - 10, hy + 16], [X - 16, hy + 20], 2.6); arm(g, sR, [X + 12, hy + 2], [X + 24, hy - 8], -0.6); }
  else if (f === 5) { arm(g, sL, [X - 8, hy + 18], [X - 2, hy + 24], 1.6); arm(g, sR, [X + 10, hy + 18], [X + 6, hy + 25], 1.6); }
  else { arm(g, sL, [X - 12, hy + 6], [X - 16, hy + 2], -2.5); arm(g, sR, [X + 10, hy + 12], [X + 14, hy + 18], 1.0); }
}
export function bakeGreenteeth() { return bake(13, JW, JH, drawJenny, JX, 18, 24); }

/* ================= THE LOCK ================= */
export function bakeLockSkins() {
  const tile = draw => { const [c, g] = canvas(16, 16); draw(g); return c; };
  /* THE GATE: tarred oak planks standing upright, an iron strap across every eight rows, rivets, green slime low down */
  const gate = [0, 1, 2].map(v => tile(g => { rect(g, 0, 0, 16, 16, '#2e2418');
    for (let x = 0; x < 16; x += 4) { rect(g, x, 0, 1, 16, '#1c150e'); rect(g, x + 1, 0, 1, 16, '#3e3122'); }
    if (v === 1) { rect(g, 0, 6, 16, 3, '#3a3e44'); rect(g, 0, 6, 16, 1, '#5a6068'); for (let x = 2; x < 16; x += 5) px(g, x, 7, '#8a929c'); }
    if (v === 2) for (let y = 10; y < 16; y++) for (let x = (y * 3) % 4; x < 16; x += 4) px(g, x, y, '#3a5a2a'); }));
  /* A WALER: a thick oak rail on the gate's face, an iron plate on its front edge, the lit top */
  const waler = tile(g => { rect(g, 0, 0, 16, 7, '#4a3a26'); rect(g, 0, 0, 16, 1, '#d8c890'); rect(g, 0, 1, 16, 1, '#7a6440'); rect(g, 0, 5, 16, 2, '#3a3e44');
    for (let x = 3; x < 16; x += 6) px(g, x, 5, '#8a929c'); rect(g, 0, 7, 16, 1, '#1c150e'); });
  /* THE WALKWAY: oak boards across an iron bearer, the lit edge (the paddle's gear and the handrail are drawn by the hands) */
  const walk = tile(g => { rect(g, 0, 0, 16, 4, '#5a4630'); rect(g, 0, 0, 16, 1, '#ffd890'); for (let x = 0; x < 16; x += 5) rect(g, x, 1, 1, 3, '#3a2c1c');
    rect(g, 0, 4, 16, 3, '#3a3e44'); rect(g, 0, 4, 16, 1, '#5a6068'); px(g, 4, 5, '#8a929c'); px(g, 12, 5, '#8a929c'); });
  /* THE BED: stone setts under a skin of silt; the course under it plain setts */
  const bed = [0, 1, 2].map(v => tile(g => { rect(g, 0, 0, 16, 16, '#4a4a44');
    for (let y = 4; y < 16; y += 6) { rect(g, 0, y, 16, 1, '#2e2e2a'); for (let x = (y + v * 3) % 8; x < 16; x += 8) rect(g, x, y - 5, 1, 5, '#2e2e2a'); }
    rect(g, 0, 0, 16, 3, '#3e3424'); rect(g, 0, 0, 16, 1, '#5e5034'); px(g, 3 + v * 4, 1, '#6a7a3a'); px(g, 11 - v, 2, '#2a3a1a'); }));
  const bed2 = tile(g => { rect(g, 0, 0, 16, 16, '#3e3e3a'); for (let y = 3; y < 16; y += 6) { rect(g, 0, y, 16, 1, '#26261f'); for (let x = y % 8; x < 16; x += 8) rect(g, x, y - 5, 1, 5, '#26261f'); } });
  /* THE NARROWBOAT: its deck (slimed planks) and its hull (tarred, a rust-red rubbing strake) */
  const deck = tile(g => { rect(g, 0, 0, 16, 16, '#1e1a16'); rect(g, 0, 0, 16, 3, '#4a4030'); rect(g, 0, 0, 16, 1, '#6a8a3a'); for (let x = 0; x < 16; x += 6) rect(g, x, 1, 1, 2, '#2a241c');
    rect(g, 0, 4, 16, 2, '#7a2e1e'); rect(g, 0, 4, 16, 1, '#a04a2a'); for (let y = 8; y < 16; y += 4) rect(g, 0, y, 16, 1, '#141210'); px(g, 5, 11, '#3a5a2a'); px(g, 12, 13, '#3a5a2a'); });
  const hull = tile(g => { rect(g, 0, 0, 16, 16, '#1e1a16'); for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, '#141210'); for (let x = 2; x < 16; x += 7) px(g, x, 6, '#5a5048');
    for (let x = 0; x < 16; x += 3) px(g, x, 14 + (x % 2), '#3a5a2a'); });
  /* THE QUOINS: the lock's coursed stone at the banks */
  const quoin = [0, 1].map(v => tile(g => { rect(g, 0, 0, 16, 16, '#5a5850'); rect(g, 0, 7, 16, 1, '#34332e'); rect(g, 0, 15, 16, 1, '#34332e');
    rect(g, v ? 5 : 11, 0, 1, 7, '#34332e'); rect(g, v ? 12 : 3, 8, 1, 7, '#34332e'); rect(g, 0, 0, 16, 1, '#76746a'); rect(g, 0, 8, 16, 1, '#6a685e'); }));
  return { gate, waler, walk, bed, bed2, deck, hull, quoin };
}
