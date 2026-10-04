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
/* (claude/jenny2, Daniel 10-02: "the sprite looks a bit odd") REDRAWN AT HER OWN SIZE - one pixel is one pixel, no upscale. A gaunt river hag half out of
   the water: a long jaw full of green teeth, a hooked nose, eyes sunk in their sockets and lit yellow-green, a curtain of weed for hair that hangs past
   her shoulders and drips, duckweed caught in it, long thin knuckly arms with long nails, rags of sodden sacking. The canvas is 76 x 64; her body box
   (src/jenny-greenteeth.js GT.w/h) is 30 x 46 - head and shoulders over the water's skin (23 px over the box's foot), the rest under it. Every told
   blow has its own pose. */
const JW = 76, JH = 64, JX = 34, JB = 62;
export const JC = { skin: '#5e8a4a', skinD: '#3e6030', skinDD: '#2c4824', skinL: '#86b060', skinH: '#a8c878', hair: '#23401e', hairD: '#162a14', hairL: '#4f7a2e', weed: '#6a9a3a', duck: '#9ac850',
  rag: '#3e4838', ragD: '#2a3026', ragL: '#56604a', teeth: '#c8e080', teethD: '#8aa850', gum: '#5a1e24', mouth: '#1a0c10', eye: '#e8ff7a', eyeD: '#9ac830', eyeW: '#ffffff', nail: '#d0dcb0', mud: '#4a3a26', drip: '#bfe6f5' };
/* a long thin arm: shoulder -> elbow -> wrist, 2 px of shadowed skin with a lit top edge and a knuckle at the elbow; a bony hand and three long nails along `a` */
function jArm(g, s, el, h, a = 0, spread = 0.55) {
  line(g, s[0], s[1], el[0], el[1], JC.skinD, 2); line(g, el[0], el[1], h[0], h[1], JC.skinD, 2);
  line(g, s[0], s[1], el[0], el[1], JC.skin); line(g, el[0], el[1], h[0], h[1], JC.skin);
  px(g, el[0], el[1], JC.skinH); px(g, el[0], el[1] + 1, JC.skinDD);
  rect(g, h[0] - 1, h[1] - 1, 3, 3, JC.skin); px(g, h[0] - 1, h[1] - 1, JC.skinL); px(g, h[0] + 1, h[1] + 1, JC.skinDD);
  for (let i = -1; i <= 1; i++) { const q = a + i * spread, k1 = 3, k2 = 6;
    const mx = Math.round(h[0] + Math.cos(q) * k1), my = Math.round(h[1] + Math.sin(q) * k1), tx = Math.round(h[0] + Math.cos(q + 0.25) * k2), ty = Math.round(h[1] + Math.sin(q + 0.25) * k2);
    line(g, h[0], h[1], mx, my, JC.skinD); line(g, mx, my, tx, ty, JC.nail); }
}
/* the head, facing right: a long gaunt skull, a jutting brow over sunk sockets, the eyes lit, a hooked nose, a lipless jaw. open 0..3: the mouth's gape.
   mood: 0 plain, 1 snarl, 2 hurt (eyes screwed shut), 3 dazed (eyes dim, the tongue out) */
function jHead(g, x, y, open = 0, mood = 0) {
  fillPoly(g, [[x - 6, y - 7], [x + 1, y - 9], [x + 6, y - 7], [x + 8, y - 2], [x + 8, y + 3 + open], [x + 5, y + 8 + open], [x + 1, y + 10 + open], [x - 3, y + 8], [x - 6, y + 2]], JC.skin);
  line(g, x - 5, y - 7, x + 4, y - 8, JC.skinL); px(g, x + 6, y - 6, JC.skinL);   /* the crown's wet shine */
  line(g, x - 1, y - 4, x + 7, y - 4, JC.skinDD); px(g, x + 8, y - 3, JC.skinDD);   /* the jutting brow */
  rect(g, x + 1, y - 3, 4, 3, JC.skinDD); rect(g, x - 4, y - 3, 3, 3, JC.skinDD);   /* the sunk sockets */
  if (mood === 2) { line(g, x + 1, y - 2, x + 4, y - 2, JC.eyeD); line(g, x - 4, y - 2, x - 2, y - 2, JC.eyeD); }
  else { const ec = mood === 3 ? JC.eyeD : JC.eye; rect(g, x + 2, y - 2, 2, 2, ec); rect(g, x - 3, y - 2, 2, 2, ec); if (mood !== 3) { px(g, x + 3, y - 2, JC.eyeW); px(g, x - 2, y - 2, JC.eyeW); } }
  line(g, x + 6, y - 1, x + 10, y + 3, JC.skinD); px(g, x + 9, y + 4, JC.skinD); px(g, x + 7, y, JC.skinL); px(g, x + 10, y + 4, JC.skinDD);   /* the hooked nose */
  line(g, x - 5, y + 1, x - 1, y + 4, JC.skinD);   /* the hollow cheek */
  if (mood === 1) line(g, x + 2, y - 4, x + 5, y - 3, JC.skinDD);
  if (open > 0) { rect(g, x - 1, y + 4, 8, 1 + open, JC.mouth); rect(g, x - 1, y + 4, 8, 1, JC.gum);
    for (let i = 0; i < 4; i++) { px(g, x + i * 2, y + 5, JC.teeth); px(g, x + i * 2 + 1, y + 4 + open, JC.teeth); if (open > 1) px(g, x + i * 2, y + 6, JC.teethD); }
    if (mood === 3) rect(g, x + 4, y + 5 + open, 2, 3, '#a0404a'); }
  else { line(g, x - 1, y + 5, x + 7, y + 4, JC.mouth); px(g, x, y + 6, JC.teeth); px(g, x + 3, y + 5, JC.teeth); px(g, x + 6, y + 5, JC.teeth); px(g, x + 7, y + 3, JC.teeth); }
  px(g, x + 1, y + 10 + open, JC.skinDD); px(g, x + 2, y + 9 + open, JC.skinD);   /* the pointed chin */
}
/* the weed hair: a curtain of 1 px strands from the crown, hanging (or streaming back by `back`) past the shoulders; duckweed in it, drips off its ends */
function jHair(g, x, y, len, sway, back = 0) {
  for (let i = -7; i <= 4; i++) { const x0 = x + i, x1 = x + i - back - (i < 0 ? 2 : 0) + Math.round(Math.sin(i * 1.7 + sway) * 1.5), y1 = y + len - Math.abs(i + 1) + (i & 1);
    line(g, x0, y - 7, x1, y1, i % 3 === 0 ? JC.hairD : i & 1 ? JC.hair : JC.hairL);
    if (i % 4 === 0) px(g, x1, y1 + 1, JC.drip); }
  fillPoly(g, [[x - 7, y - 7], [x - 1, y - 10], [x + 5, y - 9], [x + 6, y - 5], [x - 7, y - 4]], JC.hair); line(g, x - 4, y - 9, x + 3, y - 9, JC.hairL);
  for (const [dx, dy] of [[-6, 3], [-3, 7], [-8, 11], [1, 9], [-5, 15]]) px(g, x + dx - Math.round(back * dy / Math.max(1, len)), y + dy, JC.duck);
  line(g, x - 8, y + 2, x - 10 - back, y + len - 2, JC.weed);   /* a long rope of weed caught in it */
}
/* the weed over her crown, drawn over the head: a wet cap of it, a fringe hanging over the brow, and the long fall down the back of the skull */
function jFringe(g, x, y, back = 0) {
  fillPoly(g, [[x - 8, y - 6], [x - 4, y - 10], [x + 2, y - 11], [x + 7, y - 8], [x + 7, y - 6], [x - 7, y - 3]], JC.hair);
  for (let i = 0; i < 6; i++) line(g, x - 2 + i * 2, y - 8, x - 2 + i * 2 + (i & 1), y - 5 + (i % 3), i & 1 ? JC.hairD : JC.hairL);
  for (let i = 0; i < 4; i++) line(g, x - 7 + i, y - 6, x - 8 + i - back, y + 9 - i * 2, i & 1 ? JC.hair : JC.hairD);
  line(g, x - 3, y - 10, x + 4, y - 10, JC.hairL); px(g, x + 1, y - 9, JC.duck); px(g, x - 5, y - 7, JC.duck); px(g, x + 6, y - 4, JC.drip);
}
/* the body: hunched shoulders, a bony neck and collarbone, sodden sacking to the box's foot (under the water from its middle) */
function jBody(g, x, y, lean = 0) {
  fillPoly(g, [[x - 11, JB], [x - 10, y + 10], [x - 8, y + 2], [x - 3, y - 1 + lean], [x + 5, y + lean], [x + 9, y + 4], [x + 11, y + 12], [x + 12, JB]], JC.rag);
  for (const [a, b] of [[-7, -9], [-1, -2], [5, 7]]) line(g, x + a, y + 4, x + b, JB, JC.ragD);
  line(g, x - 9, y + 6, x - 4, y + 2 + lean, JC.ragL); px(g, x + 3, y + 9, JC.hairL); px(g, x - 6, y + 14, JC.duck);
  for (let i = 0; i < 5; i++) px(g, x - 10 + i * 5, JB - (i & 1), JC.ragD);   /* the hem, ragged */
  fillPoly(g, [[x - 4, y - 1 + lean], [x + 3, y + lean], [x + 4, y + 3 + lean], [x - 5, y + 3 + lean]], JC.skinD);   /* the scrawny neck */
  line(g, x - 4, y + 3 + lean, x + 4, y + 3 + lean, JC.skinL); px(g, x, y + 2 + lean, JC.skinDD);   /* the collarbone */
}
/* 0-1 swim, 2 tell (arms up), 3 lunge (the bite), 4 reach (one arm long), 5 grab (both arms down, pulling), 6-7 stranded (clawing the mud), 8 hurt,
   9 dead, 10 flushed (on her back), 11 hide (curled in the culvert), 12 drag (stretched far forward), 13 the slam's tell (risen, both arms high), 14 stuck
   (hanging off a ledge by the claws - the stuck arm is drawn by the hands up to the timber), 15 dazed, 16 the charge's tell (sinking, hair streaming
   back), 17 the net's tell (arm back with a dripping mass of weed), 18 the net thrown */
function drawJenny(g, f) {
  const X = JX;
  if (f === 6 || f === 7 || f === 12 || f === 9) {   /* PRONE in the mud */
    const y = JB - 5, reach = f === 12 ? 14 : f === 7 ? 6 : 2;
    fillPoly(g, [[X - 18, y + 4], [X - 16, y - 2], [X - 4, y - 5], [X + 6, y - 4], [X + 9, y + 1], [X + 8, y + 4]], JC.rag);
    line(g, X - 14, y, X + 4, y - 3, JC.ragD); line(g, X - 12, y + 3, X - 2, y + 1, JC.ragL);
    for (let i = 0; i < 11; i++) line(g, X + 5 + (i % 3), y - 6, X - 8 - i * 2, y + 2 + (i % 2), i % 3 === 0 ? JC.hairD : i & 1 ? JC.hair : JC.hairL);   /* the hair spread over the mud */
    px(g, X - 6, y, JC.duck); px(g, X - 14, y + 2, JC.duck);
    if (f === 9) { jHead(g, X + 12, y - 2, 0, 2); jArm(g, [X + 5, y - 2], [X + 13, y + 3], [X + 22, y + 3], 0.2); jArm(g, [X - 4, y - 2], [X - 12, y + 2], [X - 21, y + 3], 3); return; }
    jHead(g, X + 13, y - 4, f === 7 ? 2 : 1, 1); jFringe(g, X + 13, y - 4, 3);
    jArm(g, [X + 6, y - 3], [X + 13 + reach / 2, y - 7], [X + 20 + reach, y + 2], 0.4); jArm(g, [X + 3, y - 2], [X + 9 + reach / 2, y + 1], [X + 16 + reach, y + 3], 0.2);
    rect(g, X - 18, y + 4, 34, 1, JC.mud); px(g, X + 20 + reach, y + 4, JC.mud); px(g, X + 16 + reach, y + 4, JC.mud); px(g, X + 22 + reach, y + 3, JC.mud); return; }
  if (f === 10) {   /* FLUSHED: rolled on her back, limp, arms and hair floating */
    const y = JB - 6; fillPoly(g, [[X - 13, y + 3], [X - 11, y - 4], [X + 6, y - 5], [X + 10, y], [X + 6, y + 5]], JC.rag); line(g, X - 9, y - 1, X + 5, y - 2, JC.ragL);
    jHead(g, X + 13, y - 1, 1, 2); jArm(g, [X + 2, y - 4], [X - 4, y - 11], [X - 13, y - 9], 3.4); jArm(g, [X + 4, y - 3], [X + 11, y - 11], [X + 17, y - 13], -0.6);
    for (let i = 0; i < 8; i++) line(g, X + 18, y + i - 4, X + 25, y + i - 1, i & 1 ? JC.hair : JC.hairD); px(g, X + 24, y, JC.duck); return; }
  if (f === 11) {   /* HIDING: a curled shape in the culvert's dark, only the eyes */
    const y = JB - 9; fillPoly(g, [[X - 9, y + 9], [X - 8, y - 2], [X + 4, y - 6], [X + 10, y + 2], [X + 9, y + 9]], JC.hairD); line(g, X - 6, y - 1, X + 3, y - 5, JC.hair);
    rect(g, X + 2, y - 1, 2, 2, JC.eye); rect(g, X - 3, y - 1, 2, 2, JC.eye); return; }
  if (f === 14) {   /* STUCK: hanging off the ledge by her claws - chin at the timber (the box's foot is 30 px under it), the body dangling, the free hand hooked over the edge */
    const hx = X + 1, hy = JB - 34;
    fillPoly(g, [[X - 8, JB], [X - 9, hy + 18], [X - 7, hy + 10], [X - 2, hy + 8], [X + 5, hy + 8], [X + 9, hy + 12], [X + 8, hy + 22], [X + 6, JB]], JC.rag);
    for (const [a, b] of [[-6, -7], [0, 0], [5, 4]]) line(g, X + a, hy + 12, X + b, JB, JC.ragD);
    for (let i = 0; i < 4; i++) px(g, X - 5 + i * 4, JB - 1 - (i % 2), JC.drip);   /* dripping off her hem */
    jHair(g, hx, hy, 24, 0.4, -1);
    jHead(g, hx, hy, 2, 1); jFringe(g, hx, hy);
    jArm(g, [X + 6, hy + 10], [X + 13, hy + 4], [X + 15, hy - 2], -1.6, 0.4);
    line(g, X - 7, hy + 10, X - 9, hy + 3, JC.skinD, 2); line(g, X - 7, hy + 10, X - 9, hy + 3, JC.skin);   /* the stuck arm, going up to the hands' limb */
    return; }
  if (f === 16) {   /* THE CHARGE'S TELL: pitched forward and sinking, the head low and thrust out, the hair streaming flat behind */
    const hx = X + 10, hy = JB - 20;
    fillPoly(g, [[X - 14, JB], [X - 13, JB - 10], [X - 4, JB - 18], [X + 6, JB - 19], [X + 10, JB - 12], [X + 11, JB]], JC.rag); line(g, X - 10, JB - 12, X + 4, JB - 17, JC.ragL);
    for (let i = 0; i < 10; i++) line(g, hx - 3, hy - 6 + i, hx - 22 - (i % 3) * 2, hy - 8 + i + (i & 1), i % 3 === 0 ? JC.hairD : i & 1 ? JC.hair : JC.hairL);
    px(g, hx - 14, hy - 4, JC.duck); px(g, hx - 19, hy, JC.duck);
    jHead(g, hx, hy, 2, 1); jFringe(g, hx, hy, 3);
    jArm(g, [X + 5, JB - 15], [X + 14, JB - 9], [X + 24, JB - 8], 0.1, 0.4); jArm(g, [X - 2, JB - 15], [X + 6, JB - 7], [X + 16, JB - 5], 0.2, 0.4);
    return; }
  /* UPRIGHT in the water: her head and shoulders over it, the rest drawn under the water's wash */
  const bob = f === 1 ? 1 : 0, rise = f === 13 ? 6 : f === 17 || f === 18 ? 2 : 0, lean = f === 3 ? 4 : f === 8 ? -3 : f === 13 ? -1 : f === 15 ? -2 : 0;
  const hx = X + 2 + lean, hy = JB - 34 + bob - rise - (f === 2 || f === 4 ? 2 : 0) + (f === 3 ? 2 : 0) + (f === 15 ? 2 : 0);
  jBody(g, X, hy + 9, f === 3 ? 2 : 0);
  jHair(g, hx - 1, hy, f === 2 || f === 4 || f === 13 ? 20 : 25, f * 1.7, f === 3 ? 4 : f === 18 ? 3 : 0);
  if (f === 15) { jHead(g, hx, hy + 1, 2, 3); jFringe(g, hx, hy + 1); }   /* (dazed: the head lolled, the tongue out, the eyes dim) */
  else { jHead(g, hx, hy, f === 3 ? 3 : f === 2 || f === 13 ? 2 : f === 5 || f === 8 || f === 17 ? 1 : 0, f === 8 ? 2 : f === 3 || f === 13 || f === 2 ? 1 : 0); jFringe(g, hx, hy, f === 3 ? 2 : 0); }
  const sL = [X - 8, hy + 11], sR = [X + 7, hy + 11];
  if (f === 0 || f === 1) { jArm(g, sL, [X - 15, hy + 18 + bob], [X - 24, hy + 21], 2.6); jArm(g, sR, [X + 14, hy + 17 - bob], [X + 22, hy + 21], 0.6); }
  else if (f === 2) { jArm(g, sL, [X - 15, hy + 5], [X - 19, hy - 8], -2.0); jArm(g, sR, [X + 15, hy + 5], [X + 19, hy - 9], -1.1); }
  else if (f === 3) { jArm(g, sL, [X - 2, hy + 19], [X + 10, hy + 22], 0.5); jArm(g, sR, [X + 17, hy + 12], [X + 27, hy + 9], 0.1); }
  else if (f === 4) { jArm(g, sL, [X - 13, hy + 18], [X - 20, hy + 22], 2.6); jArm(g, sR, [X + 15, hy + 3], [X + 30, hy - 9], -0.6); }
  else if (f === 5) { jArm(g, sL, [X - 11, hy + 20], [X - 4, hy + 27], 1.6); jArm(g, sR, [X + 13, hy + 20], [X + 8, hy + 28], 1.6); }
  else if (f === 13) { jArm(g, sL, [X - 13, hy - 2], [X - 6, hy - 16], -0.4, 0.45); jArm(g, sR, [X + 13, hy - 3], [X + 8, hy - 17], -0.2, 0.45); }   /* THE SLAM'S TELL: risen, both arms high, the claws hooked to come down */
  else if (f === 15) { jArm(g, sL, [X - 14, hy + 19], [X - 22, hy + 22], 2.8); jArm(g, sR, [X + 12, hy + 19], [X + 19, hy + 23], 0.9); }
  else if (f === 17) { jArm(g, sL, [X + 12, hy + 14], [X + 20, hy + 12], 0.2); jArm(g, sR, [X - 6, hy + 2], [X - 18, hy - 4], -2.6);   /* THE NET'S TELL: one arm back with the weed */
    for (let i = 0; i < 16; i++) { const q = i * 0.9; px(g, X - 22 + Math.round(Math.cos(q) * (3 + (i % 4))), hy - 6 + Math.round(Math.sin(q) * (2 + (i % 3))), i % 3 ? JC.weed : JC.duck); }
    for (let i = 0; i < 3; i++) px(g, X - 24 + i * 3, hy + 1 + i, JC.drip); }
  else if (f === 18) { jArm(g, sL, [X - 13, hy + 16], [X - 20, hy + 20], 2.6); jArm(g, sR, [X + 16, hy + 2], [X + 30, hy - 6], -0.3, 0.7); }   /* THE NET THROWN: the arm flung out, the hand open */
  else { jArm(g, sL, [X - 15, hy + 7], [X - 19, hy + 2], -2.5); jArm(g, sR, [X + 13, hy + 14], [X + 17, hy + 20], 1.0); }
}
export function bakeGreenteeth() { return bake(19, JW, JH, drawJenny, JX, 30, 46); }   /* (claude/jenny2: drawn at her own size, 76 x 64, the body 30 x 46 - was the old 52 x 44 figure scaled 1.6x) */

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
