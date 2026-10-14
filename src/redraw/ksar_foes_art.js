// ksar_foes_art.js - THE BANDIT KSAR's TWO NEW BANDITS (claude/ksarfoes, Daniel 10-14: brief-ksarfix-1014.md part B). GREYBOX-QUALITY BUT READABLE: drawn whole (not a
// recolour) so every move has ITS OWN windup and release pose (B16) - a sonnet art lane may redraw them. The contract is caravan_bandits.js's (the cutthroat's machine
// drives both, so the frame table keeps its numbers): every frame faces RIGHT (L is the flip), one canvas size, ax = the body's centre column, ay = the row under the feet.
//   THE FALCONER (cnSkin 'falconer', the cutthroat's machine + a leashed hawk scout, src/ksar-hands.js): a teal falconer's coat, a cream turban with a barred hawk
//     feather, a tan leather GAUNTLET on his glove arm, a lure on a cord at his belt, a short curved knife.
//       0,1 walk | 2 FEINT (the knife half up) | 3 FEINT HOLD (the stamp) | 4 SLASH TELL (the knife high and back, a glint) | 5 SLASH | 6 hurt
//       7 SEND - WINDUP (the gauntlet drawn back and up behind his head, leaning back: the hawk is about to be sent) | 8 SEND - RELEASE (the glove flung out and up
//       at you, the free hand pointing) | 9 CALL (the gauntlet raised straight up for the hawk to land, two fingers at the veil: the whistle; also his dismay when it is down)
//   THE PLATED BANDIT (cnSkin 'ksarplate', the cutthroat's machine, weightier): a steel helm with a nasal and a mail drape, a steel cuirass and pauldrons over a
//     red coat, a broad cleaver. Blades do x0.25 on him (a clank: THROW A BOMB); a blast blows the plate off -> 'ksarplatebare' (the same man in his quilted coat).
//       0,1 walk (wide, heavy) | 2 FEINT (the cleaver hoisted to the shoulder) | 3 FEINT HOLD (the stamp, the cleaver low) | 4 SLASH TELL (two hands, the cleaver
//       right over the head and back, a glint) | 5 SLASH (brought down in front of him to the knee, dust off the floor) | 6 hurt
import { canvas, px, rect, fillPoly, line, ellipse, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; }
function settle(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settle(c); });
function blade(g, hx, hy, tx, ty, bend, col, colL, thick) { const dx = tx - hx, dy = ty - hy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  for (let t = 0; t <= 1.001; t += 0.06) { const b = Math.sin(t * Math.PI) * bend, x = hx + dx * t + nx * b, y = hy + dy * t + ny * b; px(g, x, y, col); if (t < (thick ? 0.95 : 0.6)) px(g, x + nx, y + ny, t < 0.4 ? col : colL); if (thick && t > 0.15) px(g, x + nx * 2, y + ny * 2, colL); }
  px(g, tx, ty, colL); }
const glint = (g, x, y, c) => { px(g, x - 1, y, c); px(g, x + 1, y, c); px(g, x, y - 1, c); px(g, x, y + 1, c); };

/* ================================================================ THE FALCONER (38 x 32, ax 15) */
const FC = { skin: '#b07a52', coat: '#2e5a4e', coatL: '#4a8070', coatD: '#1c3a32', wrap: '#e8d8b0', wrapD: '#b8a47a', veil: '#3a2a1c', sash: '#c9962a', sashD: '#8a6418',
  pants: '#5a4630', boot: '#2a1c12', glove: '#c89a5a', gloveD: '#8a6232', gloveL: '#e8c890', feather: '#8a5a32', featherL: '#f0e6d0', steel: '#c9d1dc', steelL: '#f4f8ff', hilt: '#6a4428', eye: '#f0dca0', lure: '#a07040', cord: '#5a3a1e', glintC: '#fff6c8' };
export function bakeFalconer() {
  const W = 38, H = 32, cx = 15, gy = 30;
  const head = (g, x, y) => { ellipse(g, x, y, 3.4, 3.4, FC.skin); ellipse(g, x - 0.5, y - 2, 4.2, 2.4, FC.wrap); line(g, x - 4, y - 2, x + 3, y - 2, FC.wrapD);   /* the cream turban */
    line(g, x - 2, y - 4, x - 5, y - 9, FC.feather); px(g, x - 3, y - 6, FC.featherL); px(g, x - 4, y - 8, FC.featherL);                                  /* the barred hawk feather in it */
    rect(g, x - 3, y + 1, 7, 3, FC.veil); px(g, x + 1, y - 1, FC.eye); px(g, x + 2, y - 1, FC.eye); };
  const body = (g, x, y, legs, lean = 0) => { const [a, b] = legs;
    rect(g, x - 3 + a, y + 9, 2, 3, FC.pants); rect(g, x + 1 + b, y + 9, 2, 3, FC.pants); rect(g, x - 3 + a, y + 11, 3, 1, FC.boot); rect(g, x + 1 + b, y + 11, 3, 1, FC.boot);
    fillPoly(g, [[x - 3 + lean, y], [x + 3 + lean, y], [x + 4, y + 9], [x - 4, y + 9]], FC.coat); line(g, x - 2 + lean, y, x - 3, y + 8, FC.coatL); line(g, x + 3 + lean, y + 1, x + 3, y + 8, FC.coatD);
    rect(g, x - 3 + lean, y + 4, 7, 1, FC.sash); px(g, x - 4 + lean, y + 5, FC.sashD);
    line(g, x + 2 + lean, y + 5, x + 4, y + 8, FC.cord); rect(g, x + 3, y + 8, 2, 2, FC.lure); px(g, x + 4, y + 10, FC.featherL); };   /* the lure on its cord */
  const gauntlet = (g, sx, sy, gx2, gy2) => { line(g, sx, sy, gx2, gy2, FC.glove); line(g, sx, sy + 1, gx2, gy2 + 1, FC.gloveD); rect(g, gx2 - 1, gy2 - 1, 3, 3, FC.glove); px(g, gx2, gy2 - 1, FC.gloveL); px(g, gx2 + 1, gy2 + 1, FC.gloveD); };
  const knife = (g, hx, hy, tx, ty, bend, shine) => { rect(g, hx - 1, hy, 2, 2, FC.hilt); blade(g, hx, hy, tx, ty, bend, FC.steel, shine ? FC.steelL : FC.steel); };
  const F = frames(W, H, 10, (g, f) => {
    const by = gy - 12;
    if (f === 6) { body(g, cx - 1, by + 1, [0, 0], -1); head(g, cx - 2, by - 3); gauntlet(g, cx - 3, by + 2, cx - 6, by + 6); knife(g, cx + 2, by + 4, cx + 7, by + 9, 1, false); return; }   /* hurt: rocked back */
    const legs = f === 0 ? [0, 1] : f === 1 ? [1, 0] : f === 3 ? [2, -1] : f === 5 || f === 8 ? [1, -1] : f === 7 ? [-1, 1] : [0, 0];
    const dip = f === 3 ? 1 : 0, lean = f === 2 || f === 5 || f === 8 ? 1 : f === 4 || f === 7 ? -1 : 0;
    body(g, cx, by + dip, legs, lean); head(g, cx + 1 + lean, by - 4 + dip);
    const sh = [cx + 3 + lean, by + 2 + dip], back = [cx - 2 + lean, by + 2 + dip];
    if (f === 7) { gauntlet(g, ...back, cx - 6, by - 6); for (let i = 0; i < 3; i++) px(g, cx - 8 + i, by - 9 - i, FC.featherL); line(g, ...sh, cx + 6, by + 1, FC.skin); px(g, cx + 7, by + 1, FC.skin); return; }   /* SEND windup: the glove cocked back over his head, the hand out to aim */
    if (f === 8) { gauntlet(g, ...sh, cx + 12, by - 7); for (let i = 0; i < 4; i++) px(g, cx + 4 + i * 2, by - 2 - i * 1.5, FC.gloveL); line(g, ...back, cx + 8, by + 3, FC.skin); px(g, cx + 9, by + 3, FC.skin); return; }   /* SEND release: the glove flung out and up at you */
    if (f === 9) { gauntlet(g, ...back, cx - 1, by - 11); px(g, cx - 2, by - 12, FC.gloveL); line(g, ...sh, cx + 3, by - 1, FC.skin); px(g, cx + 3, by - 2, FC.skin); px(g, cx + 4, by - 2, FC.skin); return; }   /* CALL: the glove raised for her bird, two fingers at the veil */
    gauntlet(g, ...back, cx - 4, by + 7);                                                                                                                          /* the gauntlet at his side */
    if (f === 2) { line(g, ...sh, cx + 5, by - 1, FC.skin); knife(g, cx + 5, by - 1, cx + 7, by - 7, -1, false); }
    else if (f === 3) { line(g, ...sh, cx, by + 6, FC.skin); knife(g, cx, by + 6, cx - 6, by + 8, 1, false); }
    else if (f === 4) { line(g, ...sh, cx, by - 4, FC.skin); knife(g, cx, by - 4, cx - 6, by - 10, 2, true); glint(g, cx - 6, by - 10, FC.glintC); }
    else if (f === 5) { line(g, ...sh, cx + 8, by + 3, FC.skin); knife(g, cx + 8, by + 3, cx + 16, by + 6, -2, true); for (let i = 0; i < 5; i++) px(g, cx + 6 + i * 2, by - 4 + i * 2, FC.steelL); }
    else knife(g, cx + 4, by + 5, cx + 10, by + 8, -1, false);
  });
  return pack(F, cx, H, 10, 18);
}

/* ================================================================ THE PLATED BANDIT (40 x 32, ax 16) - plated / bare */
const PB = { skin: '#a8714a', coat: '#8a2a20', coatL: '#b84a36', coatD: '#5a1810', quilt: '#c8b48a', quiltL: '#e4d4aa', quiltD: '#968058', cap: '#a8302a',
  plate: '#9aa4b0', plateL: '#d8e0ea', plateD: '#5e6874', mail: '#7a828e', rivet: '#3a4048', pants: '#4a3a2a', boot: '#241810', cleaver: '#b8c0ca', cleaverL: '#f0f4fa', cleaverD: '#7a8290', haft: '#5a3a1e', eye: '#f0dca0', glintC: '#fff6c8', dust: '#c8b080' };
function bakePlate(plated) {
  const W = 40, H = 32, cx = 16, gy = 30;
  const head = (g, x, y) => { ellipse(g, x, y, 3.6, 3.6, PB.skin);
    if (plated) { ellipse(g, x, y - 1.5, 4.4, 3.2, PB.plate); line(g, x - 4, y - 1, x + 4, y - 1, PB.plateD); line(g, x - 2, y - 4, x + 2, y - 4, PB.plateL); rect(g, x + 1, y - 1, 1, 4, PB.plateL);   /* the helm and its nasal */
      rect(g, x - 4, y + 1, 3, 4, PB.mail); for (let k = 0; k < 2; k++) px(g, x - 3 + k, y + 2 + k * 2, PB.rivet); px(g, x + 2, y + 1, PB.eye); }                                                     /* the mail drape at the neck, the eye in the slot */
    else { ellipse(g, x - 0.5, y - 2.4, 4, 1.9, PB.cap); px(g, x + 1, y, PB.eye); px(g, x + 2, y, PB.eye); rect(g, x - 1, y + 2, 4, 1, '#6a4428'); } };   /* bare: a red skullcap, a beard */
  const body = (g, x, y, legs, lean = 0) => { const [a, b] = legs;
    rect(g, x - 4 + a, y + 9, 3, 3, PB.pants); rect(g, x + 1 + b, y + 9, 3, 3, PB.pants); rect(g, x - 4 + a, y + 11, 4, 1, PB.boot); rect(g, x + 1 + b, y + 11, 4, 1, PB.boot);
    fillPoly(g, [[x - 4 + lean, y], [x + 4 + lean, y], [x + 5, y + 9], [x - 5, y + 9]], plated ? PB.coat : PB.quilt);
    if (plated) { fillPoly(g, [[x - 4 + lean, y], [x + 4 + lean, y], [x + 4, y + 6], [x - 4, y + 6]], PB.plate); line(g, x - 3 + lean, y + 1, x - 3, y + 5, PB.plateL); line(g, x + 4 + lean, y + 1, x + 4, y + 5, PB.plateD);   /* the cuirass */
      line(g, x - 4, y + 6, x + 4, y + 6, PB.plateD); for (const [rx, ry] of [[-2, 2], [2, 2], [0, 4]]) px(g, x + rx + lean, y + ry, PB.rivet);
      ellipse(g, x - 4 + lean, y + 1, 2.2, 1.6, PB.plate); ellipse(g, x + 4 + lean, y + 1, 2.2, 1.6, PB.plate); px(g, x - 5 + lean, y, PB.plateL); px(g, x + 3 + lean, y, PB.plateL);   /* the pauldrons */
      rect(g, x - 5, y + 7, 10, 2, PB.coatD); for (let k = -4; k <= 4; k += 2) px(g, x + k, y + 8, PB.plateD); }                                                                       /* the tassets */
    else { for (let k = 1; k < 9; k += 2) line(g, x - 4 + lean * (1 - k / 9), y + k, x + 4, y + k, PB.quiltD); line(g, x - 3 + lean, y, x - 4, y + 8, PB.quiltL); rect(g, x - 4, y + 5, 9, 1, PB.coatD); } };   /* the quilted coat, stitched */
  const cleaver = (g, hx, hy, tx, ty, shine) => { line(g, hx, hy, hx + (tx - hx) * 0.3, hy + (ty - hy) * 0.3, PB.haft); blade(g, hx + (tx - hx) * 0.3, hy + (ty - hy) * 0.3, tx, ty, 1.5, PB.cleaver, shine ? PB.cleaverL : PB.cleaverD, true); };
  const F = frames(W, H, 7, (g, f) => {
    const by = gy - 12;
    if (f === 6) { body(g, cx - 1, by + 1, [0, 0], -1); head(g, cx - 2, by - 3); cleaver(g, cx + 3, by + 5, cx + 10, by + 10, false); return; }
    const legs = f === 0 ? [-1, 1] : f === 1 ? [1, -1] : f === 3 ? [-2, 2] : f === 5 ? [-1, 2] : [-1, 1];   /* (a wide, heavy stance) */
    const dip = f === 3 || f === 5 ? 1 : 0, lean = f === 2 || f === 5 ? 1 : f === 4 ? -1 : 0;
    body(g, cx, by + dip, legs, lean); head(g, cx + 1 + lean, by - 4 + dip);
    const sh = [cx + 4 + lean, by + 2 + dip], arm = plated ? PB.plateD : PB.skin;
    if (f === 2) { line(g, ...sh, cx + 5, by - 1, arm); cleaver(g, cx + 5, by - 1, cx + 3, by - 11, false); }                                          /* THE FEINT: hoisted to the shoulder */
    else if (f === 3) { line(g, ...sh, cx + 1, by + 7, arm); cleaver(g, cx + 1, by + 7, cx - 8, by + 9, false); }                                      /* THE STAMP: dropped low behind him */
    else if (f === 4) { line(g, ...sh, cx, by - 5, arm); line(g, cx - 3 + lean, by + 2, cx - 1, by - 5, arm); cleaver(g, cx, by - 5, cx - 9, by - 13, true); glint(g, cx - 9, by - 13, PB.glintC); }   /* THE REAL ONE: two hands, right over and back */
    else if (f === 5) { line(g, ...sh, cx + 9, by + 6, arm); cleaver(g, cx + 9, by + 6, cx + 20, by + 10, true); for (let i = 0; i < 5; i++) px(g, cx + 7 + i * 3, by - 5 + i * 3, PB.cleaverL);
      for (const [dx, dy] of [[18, 11], [21, 10], [23, 11], [16, 11]]) px(g, cx + dx, by + dy + 1, PB.dust); }                                          /* THE SLAM: down in front to the knee, dust off the floor */
    else cleaver(g, cx + 4, by + 5, cx + 11, by + 10, false);
  });
  return pack(F, cx, H, 12, 18);
}
export const bakePlateBandit = () => bakePlate(true);
export const bakePlateBare = () => bakePlate(false);
export function bakeKsarFoeSets() { return { falconer: bakeFalconer(), ksarplate: bakePlateBandit(), ksarplatebare: bakePlateBare() }; }
