// hornsman_art.js - THE HORNSMAN (claude/palisadefoe): the Palisade Wood's siege-crew handler as a foe of his own. Made from px.js primitives only, in the contract
// fair_art.js keeps: every frame faces RIGHT (L is the flip), every frame of a sprite shares one canvas, ax = the body's centre column, ay = the row under the lowest
// pixel (grounded sprites settle to it), w/h = the hit box. NOT a goblin: a man - soot-black face with one lit eye, a riveted iron kettle hat with the crew's red crest,
// a rust tunic under a leather apron and a cross-strap, iron-grey gauntlets, a brass-bound ORDER HORN and a wooden maul.
//   0 stand (horn slung at the hip, maul on the shoulder) | 1,2 walk | 3 ORDER TELL (the horn up at his mouth, chest swelled, the other fist raised: the tell)
//   4 ORDER (the horn flung out and up, the bell flaring, sound arcs) | 5 MAUL TELL (the maul raised over the hat) | 6 MAUL (the maul down in front) | 7 hurt / lost
import { canvas, px, rect, fillPoly, line, ellipse, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleFrame(c); });

export const HC = { iron: '#6a707e', ironL: '#9aa0b0', ironLL: '#d4d8e4', ironD: '#3a3e4c', crest: '#d03a24', crestL: '#ff7a5a', soot: '#1a1410', sootL: '#2e241c', eye: '#ffd36b', eyeL: '#fff6d0',
  tun: '#a8442a', tunL: '#d86a40', tunD: '#5a1e12', apron: '#4a3018', apronL: '#6e4c28', apronD: '#22160a', glove: '#5a5e6c', gloveL: '#8a90a0', cloth: '#cfc4a8', clothD: '#9a8e70',
  brass: '#d8a020', brassL: '#ffd870', brassD: '#8a5e10', horn: '#d8c08a', hornL: '#f6ecc8', hornD: '#9a8458', wood: '#7a5230', woodL: '#a67a48', woodD: '#4e321a', trou: '#2e2a30', boot: '#2a1c12', bootL: '#4a3220' };

export function bakeHornsman() {
  const W = 44, H = 42, cx = 17;
  const F = frames(W, H, 8, (g, f) => {
    const walk = f === 1 || f === 2, k = f === 2 ? 1 : 0, tell = f === 3, blow = f === 4, mT = f === 5, mS = f === 6, hurt = f === 7, y0 = 1;
    const lean = hurt ? -2 : blow ? -1 : mS ? 2 : mT ? -1 : 0, swell = tell ? 1 : 0;
    const top = y0 + 14, belly = top + 7, hem = top + 14;
    // -- legs and boots (a stride in the walk)
    for (const [lx, st] of [[cx - 4, walk ? (k ? -2 : 1) : 0], [cx + 1, walk ? (k ? 1 : -2) : 0]]) { rect(g, lx + st, hem - 1, 4, H - 2 - hem, HC.trou); rect(g, lx + st, hem - 1, 1, H - 2 - hem, HC.ironD);
      rect(g, lx + st - 1, H - 4, 6, 3, HC.boot); rect(g, lx + st - 1, H - 4, 6, 1, HC.bootL); px(g, lx + st + 2, H - 5, HC.brass); }
    // -- the tunic and the leather apron over it
    fillPoly(g, [[cx - 6 + lean, top], [cx + 6 + lean, top], [cx + 7 + swell, belly], [cx + 6, hem], [cx - 7, hem], [cx - 7 - swell, belly]], HC.tun);
    rect(g, cx - 6 + lean, top, 1, hem - top, HC.tunL); rect(g, cx + 5, top + 1, 1, hem - top - 1, HC.tunD);
    fillPoly(g, [[cx - 3 + lean, top + 2], [cx + 5 + lean, top + 2], [cx + 6, hem + 1], [cx - 4, hem + 1]], HC.apron);
    rect(g, cx - 3 + lean, top + 2, 1, hem - top - 1, HC.apronD); rect(g, cx - 3 + lean, top + 2, 8, 1, HC.apronL); rect(g, cx - 4, belly + 2, 11, 1, HC.apronD); px(g, cx + 1, belly + 2, HC.brass);   // belt buckle
    line(g, cx - 5 + lean, top, cx + 4 + lean, belly + 1, HC.apronD, 1);                                                                                                                              // the cross-strap
    rect(g, cx - 2 + lean, top - 2, 5, 2, HC.cloth); px(g, cx - 2 + lean, top - 2, HC.clothD);                                                                                                         // the neck-cloth
    // -- the head: a soot-black face, one lit eye, a grey stubble beard; the kettle hat with its red crest
    const hx = cx + lean + (hurt ? -1 : 0), hy = y0 + 6;
    ellipse(g, hx, hy + 4, 4 + swell, 4, HC.soot); rect(g, hx - 3, hy + 6, 7, 2, HC.sootL); px(g, hx - 1, hy + 7, '#6a645a'); px(g, hx + 1, hy + 8, '#6a645a'); px(g, hx + 3, hy + 7, '#6a645a');
    rect(g, hx + 1, hy + 3, 3, 2, tell || blow ? HC.eyeL : HC.eye); px(g, hx + 2, hy + 3, '#ffffff');
    if (blow) rect(g, hx + 1, hy + 6, 3, 2, '#5a1e12');                                                                                                                                                // the mouth, at the horn's mouthpiece
    rect(g, hx - 6, hy - 1, 13, 2, HC.ironL); rect(g, hx - 6, hy - 1, 13, 1, HC.ironLL); rect(g, hx - 6, hy + 1, 13, 1, HC.ironD);                                                                      // the brim
    rect(g, hx - 3, hy - 6, 7, 6, HC.iron); rect(g, hx - 3, hy - 6, 7, 1, HC.ironLL); rect(g, hx - 3, hy - 6, 1, 6, HC.ironL); rect(g, hx + 3, hy - 6, 1, 6, HC.ironD); px(g, hx - 1, hy - 3, HC.ironD); px(g, hx + 1, hy - 3, HC.ironD);   // the riveted crown
    rect(g, hx - 1, hy - 9, 3, 3, HC.crest); px(g, hx - 1, hy - 9, HC.crestL); px(g, hx, hy - 10, HC.crest);                                                                                           // the crew's crest
    const arm = (ax, ay, bx, by) => { line(g, ax, ay, bx, by, HC.tun, 2); rect(g, bx - 1, by - 1, 3, 3, HC.glove); px(g, bx - 1, by - 1, HC.gloveL); };
    // -- the ORDER HORN (a brass-bound ram's horn): from its mouthpiece (x, y) out along angle `a` (radians, up is positive) to a flared bell
    const hornAt = (x, y, a, len) => { const dx = Math.cos(a), dy = -Math.sin(a), nx = -dy, ny = dx, ex = x + dx * len, ey = y + dy * len;
      fillPoly(g, [[x - nx, y - ny], [ex - nx * 3, ey - ny * 3], [ex + nx * 3, ey + ny * 3], [x + nx, y + ny]], HC.horn);
      line(g, x - nx, y - ny, ex - nx * 3, ey - ny * 3, HC.hornL, 1); line(g, x + nx, y + ny, ex + nx * 3, ey + ny * 3, HC.hornD, 1);
      rect(g, x - 1, y - 1, 3, 3, HC.brass); const mx = Math.round(x + dx * len * 0.55), my = Math.round(y + dy * len * 0.55); rect(g, mx - 1, my - 1, 2, 3, HC.brassD); px(g, mx, my - 1, HC.brassL); };
    // -- the MAUL: a haft and a banded wooden head
    const maul = (x0, y0, ex, ey) => { line(g, x0, y0, ex, ey, HC.wood, 2); rect(g, ex - 3, ey - 3, 7, 6, HC.woodL); rect(g, ex - 3, ey - 3, 7, 1, '#c89a60'); rect(g, ex - 3, ey + 2, 7, 1, HC.woodD); rect(g, ex - 3, ey - 3, 1, 6, HC.brass); rect(g, ex + 3, ey - 3, 1, 6, HC.brass); };
    if (tell) {   // the horn up at his mouth, bell forward; the other fist raised
      arm(cx + 4 + lean, top + 3, hx + 3, hy + 7); hornAt(hx + 3, hy + 7, 0.3, 12); arm(cx - 5 + lean, top + 3, cx - 8, top - 4); }
    else if (blow) {   // the horn flung out and up, the bell flaring; arcs of sound
      arm(cx + 4 + lean, top + 3, hx + 3, hy + 6); hornAt(hx + 3, hy + 6, 0.75, 12); arm(cx - 5 + lean, top + 3, cx - 9, top + 6);
      for (let r = 0; r < 3; r++) line(g, hx + 19 + r * 3, hy - 7 - r * 2, hx + 21 + r * 3, hy - 2 + r, r === 0 ? HC.brassL : HC.brass, 1); }
    else if (mT) {   // the maul back over the hat
      arm(cx + 4 + lean, top + 3, cx + 6, top - 6); maul(cx + 6, top - 6, cx + 3, top - 17); arm(cx - 5 + lean, top + 3, cx - 8, top + 6); hornAt(cx - 5, belly + 3, -0.4, 8); }
    else if (mS) {   // the maul swung down in front
      arm(cx + 4 + lean, top + 3, cx + 11, top + 7); maul(cx + 11, top + 7, cx + 22, top + 12); arm(cx - 5 + lean, top + 3, cx - 8, top + 7); hornAt(cx - 5, belly + 3, -0.4, 8); }
    else if (hurt) {   // recoiling, the horn dropped on its strap
      arm(cx + 4 + lean, top + 3, cx + 9, top - 1); arm(cx - 5 + lean, top + 3, cx - 10, top + 3); hornAt(cx - 4, belly + 4, -0.5, 8); maul(cx + 9, top - 1, cx + 13, top - 10); }
    else {   // standing / walking: the horn slung at the hip, the maul on his shoulder
      arm(cx + 4 + lean, top + 3, cx + 7, top - 3 + (walk ? k : 0)); maul(cx + 7, top - 3 + (walk ? k : 0), cx + 9, top - 12); arm(cx - 5 + lean, top + 3, cx - 7, belly + 1); hornAt(cx - 5, belly + 3, -0.4, 8); }
  });
  return pack(F, cx, H - 1, 10, 22);
}
