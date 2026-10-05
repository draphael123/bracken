// wicker_man_art.js - THE WICKER MAN (claude/fairfix6): a tall effigy of woven willow stuffed with straw, built for the fair's bonfire - the Wicker Queen's
// lesser echo (her wicker and her wheat, no spear, no crown of fire: a little wheat crown of three ears). Made from px.js primitives in fair_art.js's
// contract: every frame faces RIGHT (L is the flip), one canvas, ax = the body's centre column, ay = the foot row, w/h = the hit box (WM.w / WM.h).
//   0 still | 1,2 creep | 3 THROW TELL (a bundle of its own straw alight over its head, leaning back) | 4 throw (bowled, low) | 5 SWING TELL (both long arms
//   up over its head) | 6 swing (brought down in front) | 7 catch (the fire at its feet) | 8,9 burn (alight, charring) | 10 stamp (smoking, beating at itself,
//   a foot coming down) | 11 hurt | 12 dead (a burnt heap of willow)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
import { WM, WM_FRAMES } from '../wicker-man.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const C = { wk: '#b08a4e', wkL: '#d8b070', wkD: '#7a5a2e', wkDD: '#4e3a1a', straw: '#e8c860', strawD: '#b8962e', eye: '#1b1626', ember: '#ff8a30', emberL: '#ffd36b',
  char: '#4a3a2a', charL: '#6a5038', charD: '#2a2018', fire: '#ff8a30', fireL: '#ffd36b', fireW: '#fff4c8', fireD: '#c8401a', smoke: '#6a625a', smokeL: '#9a928a', cord: '#6a4a2a' };

/* a woven panel: the base, then the withies crossing on the diagonal, and straw showing through the gaps */
function weave(g, pts, x0, y0, x1, y1, col, char) {
  const base = char ? C.char : C.wk, lite = char ? C.charL : C.wkL, dark = char ? C.charD : C.wkD;
  fillPoly(g, pts, base);
  const inside = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!inside(x + 0.5, y + 0.5)) continue; const a = (x + y) % 4, b = (x - y + 400) % 4;
    if (a === 0) px(g, x, y, lite); else if (b === 0) px(g, x, y, dark); else if (a === 2 && b === 2 && !char) px(g, x, y, col || C.straw); }
}
function flameAt(g, x, y, h, k) {   /* a tongue of fire h px tall standing on (x, y); k flips its shape */
  fillPoly(g, [[x - 3, y], [x + 3, y], [x + 1 + k, y - h * 0.6], [x + k, y - h], [x - 1, y - h * 0.55]], C.fire);
  fillPoly(g, [[x - 2, y], [x + 2, y], [x + k * 0.5, y - h * 0.6], [x - 1, y - h * 0.3]], C.fireL); px(g, x, y - 1, C.fireW);
}

export function bakeWickerMan() {
  const W = 52, H = 64, cx = 22, G = 63;
  const F = Array.from({ length: WM_FRAMES }, (_, f) => {
    const [c, g] = canvas(W, H);
    if (f === 12) {   /* DEAD: a burnt heap of willow, ribs sticking up, ash */
      for (let i = 0; i < 7; i++) line(g, cx - 14 + i * 4, G - 1, cx - 18 + i * 5 + (i & 1 ? 6 : -2), G - 6 - (i % 3) * 3, i & 1 ? C.charL : C.char, 2);
      ellipse(g, cx, G - 3, 14, 3, C.charD); ellipse(g, cx - 2, G - 3, 9, 2, C.char); for (let i = 0; i < 6; i++) px(g, cx - 10 + i * 4, G - 4 - (i & 1), C.ember);
      circle(g, cx + 10, G - 5, 3.5, C.char); px(g, cx + 9, G - 6, C.eye); px(g, cx + 11, G - 6, C.eye);   /* its head, rolled off */
      outline(c, OUT); return c; }
    const creep = f === 1 || f === 2, tell = f === 3, thr = f === 4, sTell = f === 5, sw = f === 6, cat = f === 7, burn = f === 8 || f === 9, stamp = f === 10, hurt = f === 11;
    const char = burn || stamp, lean = tell ? -3 : thr ? 4 : sw ? 4 : hurt ? -3 : creep ? 2 : sTell ? -1 : 0, k = f === 2 ? 1 : 0;
    const hipY = G - 16, shY = hipY - 20, shX = cx + lean;
    /* -- the legs: two bound columns of willow, the straw of its feet splayed */
    const feet = creep ? (k ? [-6, 5] : [-3, 7]) : stamp ? [-5, 4] : sw || thr ? [-7, 6] : [-5, 5];
    feet.forEach((fx, i) => { const up = stamp && i === 1 ? 5 : 0, x1 = cx + fx, x0 = cx + (i ? 3 : -3);
      weave(g, [[x0 - 3, hipY], [x0 + 3, hipY], [x1 + 3, G - 2 - up], [x1 - 3, G - 2 - up]], x1 - 6, hipY, x1 + 6, G - 2 - up, null, char);
      for (let s = -4; s <= 4; s += 2) line(g, x1, G - 3 - up, x1 + s + 2, G - 1 - up, char ? C.charL : C.strawD); rect(g, x1 - 3, G - 6 - up, 7, 1, C.cord); });
    /* -- the body: a tall woven cage, the straw packed inside showing through */
    weave(g, [[shX - 9, shY], [shX + 9, shY], [cx + 7, hipY + 2], [cx - 7, hipY + 2]], cx - 12, shY, cx + 12, hipY + 2, null, char);
    for (const yy of [shY + 6, shY + 13, hipY - 1]) { const t = (yy - shY) / (hipY - shY); line(g, Math.round(shX - 9 + (cx - 7 - shX + 9) * t), yy, Math.round(shX + 9 + (cx + 7 - shX - 9) * t), yy, C.cord); }   /* the hoops that bind it */
    /* -- the arms: long bundles of withies, twig fingers */
    const arm = (sx, sy, ex, ey, near) => { line(g, sx, sy, ex, ey, char ? (near ? C.charL : C.charD) : near ? C.wk : C.wkD, 4); line(g, sx, sy - 1, ex, ey - 1, char ? C.char : near ? C.wkL : C.wk);
      for (const [dx, dy] of [[-2, 3], [0, 4], [2, 3]]) line(g, ex, ey, ex + dx, ey + dy, char ? C.charL : C.strawD); };
    const head = (hx, hy) => {   /* a woven cage of a head, two burnt holes for eyes, a little crown of three wheat ears (the Queen's, small) */
      ellipse(g, hx, hy, 6, 7, char ? C.char : C.wk); for (let yy = hy - 6; yy <= hy + 6; yy++) for (let xx = hx - 5; xx <= hx + 5; xx++) if (((xx + yy) & 3) === 0 && (xx - hx) ** 2 / 36 + (yy - hy) ** 2 / 49 < 0.9) px(g, xx, yy, char ? C.charL : C.wkL);
      const glow = tell || sTell || burn || cat; rect(g, hx - 3, hy - 1, 2, 3, glow ? C.ember : C.eye); rect(g, hx + 2, hy - 1, 2, 3, glow ? C.ember : C.eye); if (glow) { px(g, hx - 3, hy - 1, C.emberL); px(g, hx + 2, hy - 1, C.emberL); }
      rect(g, hx - 1, hy + 4, 3, 1, C.eye);
      for (const [dx, h] of [[-3, 6], [0, 8], [3, 6]]) { line(g, hx + dx, hy - 6, hx + dx, hy - 6 - h, char ? C.charL : C.strawD); ellipse(g, hx + dx, hy - 6 - h, 1, 2, char ? C.char : C.straw); }
    };
    const fs = shX + 7, fsy = shY + 2, bs = shX - 7;   /* the near shoulder (front) and the far one */
    if (tell) { arm(bs, fsy, bs - 4, fsy + 14, false); head(shX + 1, shY - 7); arm(fs, fsy, shX - 2, shY - 16, true);   /* the near arm back over its head, the bundle in it alight */
      circle(g, shX - 3, shY - 19, 4, C.straw); circle(g, shX - 3, shY - 19, 2.5, C.strawD); flameAt(g, shX - 3, shY - 21, 9, 1); }
    else if (thr) { arm(bs, fsy, bs - 6, fsy + 10, false); head(shX + 1, shY - 7); arm(fs, fsy, fs + 12, hipY + 4, true); }   /* bowled: the near arm swung through low, the far one back */
    else if (sTell) { arm(bs, fsy, shX - 6, shY - 18, false); head(shX + 1, shY - 7); arm(fs, fsy, shX + 6, shY - 18, true); }   /* both arms up over its head */
    else if (sw) { arm(bs, fsy, fs + 10, hipY + 6, false); head(shX + 2, shY - 6); arm(fs, fsy, fs + 14, hipY + 4, true); }   /* both brought down in front, low */
    else if (stamp) { arm(bs, fsy, shX - 2, shY + 12, false); head(shX + 1, shY - 7); arm(fs, fsy, shX + 3, shY + 10, true); }   /* beating at its own chest */
    else if (cat || burn) { arm(bs, fsy, bs - 9, fsy + 4 - (f === 9 ? 3 : 0), false); head(shX + 1, shY - 7); arm(fs, fsy, fs + 9, fsy + 4 - (f === 8 ? 3 : 0), true); }   /* arms flung out in its fire */
    else if (hurt) { arm(bs, fsy, bs - 6, fsy + 12, false); head(shX - 1, shY - 7); arm(fs, fsy, fs + 4, fsy + 14, true); }
    else { const sw2 = creep ? (k ? 2 : -2) : 0; arm(bs, fsy, bs - 3 - sw2, hipY + 2, false); head(shX + 1, shY - 7); arm(fs, fsy, fs + 3 + sw2, hipY + 2, true); }
    /* -- fire: at its feet when it catches; up its body when it burns (two shapes, for the flicker); smoke as it stamps it out */
    if (cat) for (const [dx, h] of [[-6, 7], [-1, 10], [5, 8]]) flameAt(g, cx + dx, G - 2, h, dx > 0 ? 1 : -1);
    if (burn) { const s2 = f === 9 ? 1 : -1; for (const [dx, dy, h] of [[-7, 0, 12], [0, 0, 16], [7, 0, 11], [-5, -16, 10], [5, -14, 12], [0, -26, 9], [shX - cx - 2, -38, 8]]) flameAt(g, cx + dx + (dy ? lean : 0), G - 2 + dy, h + (s2 > 0 && dx === 0 ? 3 : 0), s2 * (dx >= 0 ? 1 : -1)); }
    if (stamp) { for (const [dx, dy, r] of [[-4, -46, 3], [3, -50, 4], [0, -56, 3], [6, -30, 2]]) { circle(g, cx + dx, G + dy, r, C.smoke); px(g, cx + dx - 1, G + dy - 1, C.smokeL); } for (let i = 0; i < 4; i++) px(g, cx - 6 + i * 4, shY + 6 + i * 3, C.ember); }
    outline(c, OUT); return c;
  });
  return pack(F, cx, G, WM.w, WM.h);
}
