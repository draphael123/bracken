// fair_folk.js - THE HARVEST FAIR's folk, drawn as folk (claude/fairfix6, Daniel's 10-05 playtest: "orangish goblin-looking foes near the fair's start").
//   bakeStrongman()  THE STRONGMAN  the brute's AI and its five frames (src/chars.js bakeBrute: 0 stand | 1 walk | 2 raise - the overhead's tell | 3 swing |
//                    4 hurt), but a MAN: a bald head with a waxed black moustache, a neck as thick as his head, a red-and-cream hooped singlet, bare arms, brown
//                    trousers and a belt with a brass buckle, and the high striker's long-handled mallet. It replaces the recolour of the goblin brute's sheet
//                    (src/redraw/variety_skins.js 'strongman'), which kept the goblin's hunched silhouette and its ears in a tan skin - the "orangish goblin"
//                    Daniel met at the stall row. tools/fair-folk.mjs proves no goblin silhouette is drawn for any foe in the fair, in any state.
// Contract (fair_art.js's): every frame faces RIGHT (L is the flip), one canvas size, ax = the body's centre column, ay = the foot row, w/h = the hit box.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const S = { skin: '#e9bc9a', skinL: '#f6d6bc', skinD: '#c08a6c', skinDD: '#93604a', tash: '#1e1418', eye: '#1e1418',
  red: '#b8302a', redD: '#7a2018', cream: '#ece0c4', creamD: '#c8b890', trou: '#4e3a2c', trouD: '#36281e', boot: '#221a16', belt: '#3a2618', buckle: '#e8c23a',
  haft: '#9a7040', haftD: '#6a4a26', head: '#7a5230', headL: '#a67a48', headD: '#4e321a', band: '#c9d1dc', bandD: '#7c8797' };

/* THE STRONGMAN, frame f (0 stand, 1 walk, 2 raise, 3 swing, 4 hurt) */
export function bakeStrongman() {
  const W = 54, H = 58, cx = 24, G = 56;
  const F = [0, 1, 2, 3, 4].map(f => {
    const [c, g] = canvas(W, H);
    const walk = f === 1, raise = f === 2, swing = f === 3, hurt = f === 4;
    const lean = swing ? 3 : hurt ? -2 : raise ? -1 : 0;                 /* the top half's lean (px at the shoulders) */
    const hipY = G - 12, shY = hipY - 12, shX = cx + lean;
    /* -- the legs: wide-set, trousers to the boot */
    const feet = walk ? [-6, 5] : swing ? [-6, 6] : [-4, 4];
    feet.forEach((fx, k) => { const x0 = cx + (k ? 2 : -3), x1 = cx + fx; line(g, x0, hipY, x1, G - 3, k ? S.trou : S.trouD, 4); rect(g, x1 - 2, G - 2, 6, 2, S.boot); px(g, x1 + 3, G - 2, S.boot); });
    /* -- the trunk: a barrel chest in a hooped singlet, the belt under it */
    fillPoly(g, [[shX - 8, shY], [shX + 8, shY], [cx + 6, hipY], [cx - 6, hipY]], S.red);
    for (let y = shY + 1; y < hipY; y += 3) { const t = (y - shY) / (hipY - shY), l = Math.round(shX - 8 + (cx - 6 - (shX - 8)) * t), r = Math.round(shX + 8 + (cx + 6 - (shX + 8)) * t); rect(g, l + 1, y, r - l - 1, 1, S.cream); }
    line(g, shX - 7, shY + 1, cx - 6, hipY - 1, S.redD); line(g, shX + 7, shY + 1, cx + 5, hipY - 1, S.creamD);
    rect(g, shX - 4, shY - 1, 8, 2, S.skin); rect(g, shX - 3, shY, 6, 2, S.skinD);   /* the singlet's scoop neck */
    rect(g, cx - 7, hipY - 1, 14, 3, S.belt); rect(g, cx - 1, hipY - 1, 3, 3, S.buckle); px(g, cx, hipY, S.belt);
    /* -- the arms: bare, thick, the shoulders round */
    const arm = (sx, sy, ex, ey, near) => { line(g, sx, sy, ex, ey, near ? S.skin : S.skinD, 4); circle(g, sx, sy + 1, 2.5, near ? S.skin : S.skinD); rect(g, ex - 2, ey - 2, 4, 4, near ? S.skinL : S.skinD); px(g, ex - 2, ey + 1, S.skinDD); };
    const head = (hx, hy, back) => {   /* bald, round, a waxed moustache; eyes shut when hurt */
      rect(g, hx - 3, hy + 5, 7, 4, S.skinD);   /* the bull neck */
      ellipse(g, hx, hy, 5, 5.5, S.skin); px(g, hx - 2, hy - 4, S.skinL); px(g, hx - 1, hy - 4, S.skinL); px(g, hx - 2, hy - 3, S.skinL);   /* the shine on the dome */
      rect(g, hx - 5, hy + 1, 1, 3, S.skinD); px(g, hx - 6, hy + 2, S.skinD);   /* the ear: round, low, small (a man's) */
      if (back) { rect(g, hx + 1, hy, 3, 1, S.eye); } else { px(g, hx + 2, hy - 1, S.eye); px(g, hx + 3, hy - 1, S.eye); rect(g, hx + 1, hy - 3, 4, 1, S.skinDD); }   /* the eye and the brow */
      rect(g, hx + 4, hy + 1, 2, 2, S.skinD);   /* the nose */
      rect(g, hx, hy + 3, 7, 1, S.tash); px(g, hx - 1, hy + 2, S.tash); px(g, hx + 7, hy + 2, S.tash); px(g, hx + 7, hy + 1, S.tash); px(g, hx - 1, hy + 1, S.tash);   /* the waxed moustache, curled at both ends */
      rect(g, hx + 1, hy + 5, 4, 1, S.skinDD);   /* the jaw line */
    };
    const mallet = (gx, gy, ang) => {   /* the grip at (gx, gy); the head at the end of a 14 px haft along ang: a fat wooden maul, banded in iron */
      const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux, L0 = 14, hx2 = gx + ux * L0, hy2 = gy + uy * L0;
      line(g, gx - ux * 3, gy - uy * 3, hx2, hy2, S.haftD, 2); line(g, gx - ux * 3, gy - uy * 3, hx2, hy2, S.haft);
      for (let k = 0; k <= 6; k += 0.5) for (let j = -4.5; j <= 4.5; j += 0.5) { const x = hx2 + ux * k + vx * j, y = hy2 + uy * k + vy * j;
        px(g, Math.round(x), Math.round(y), k < 1 || k > 5.5 ? S.band : Math.abs(j) > 3.8 ? S.headD : j < -1.5 ? S.headL : S.head); }
    };
    if (raise) {   /* THE OVERHEAD'S TELL: both fists over his head, the mallet's head up behind it */
      mallet(shX + 1, shY - 13, -Math.PI / 2 - 0.5); arm(shX - 6, shY + 1, shX - 3, shY - 12, false);
      head(shX + 1, shY - 5, false); arm(shX + 6, shY + 1, shX + 4, shY - 12, true);
    } else if (swing) {   /* THE BLOW: brought down in front of him, the head at his feet */
      head(shX + 1, shY - 5, false); arm(shX - 6, shY + 1, shX + 7, shY + 9, false); arm(shX + 6, shY + 1, shX + 10, shY + 8, true); mallet(shX + 9, shY + 9, 0.75);
    } else if (hurt) {   /* knocked back: the head snapped back, eyes shut, the mallet flung up behind him */
      mallet(shX - 7, shY + 6, -Math.PI / 2 - 0.9); arm(shX - 6, shY + 1, shX - 8, shY + 7, false); head(shX - 1, shY - 5, true); arm(shX + 6, shY + 1, shX + 9, shY + 6, true);
    } else {   /* standing, walking: the mallet carried low in his near fist, its head by his boot */
      arm(shX - 6, shY + 1, shX - 7, shY + 10, false); head(shX + 1, shY - 5, false); arm(shX + 6, shY + 1, shX + 8, shY + 10, true); mallet(shX + 8, shY + 10, 0.85 + (walk ? 0.1 : 0));
    }
    outline(c, OUT); return c;
  });
  return pack(F, cx, G, 14, 18);
}
