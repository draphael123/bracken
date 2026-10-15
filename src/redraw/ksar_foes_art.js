// ksar_foes_art.js - THE BANDIT KSAR's TWO NEW BANDITS + THE FALCONER'S HAWK, REDRAWN AT POLISH (claude/ksarfoesart, sonnet art lane, Daniel 10-14; the greybox-readable first pass was
// claude/ksarfoes). Drawn whole (not a recolour) so every move has ITS OWN windup and release pose (B16). The contract is caravan_bandits.js's (the cutthroat's machine drives both,
// so the frame table keeps its numbers): every frame faces RIGHT (L is the flip), one canvas size, ax = the body's centre column, ay = the row under the feet. Draw code only: no
// number, box or timer moved. Ksar palette: sun-bleached teal, cream linen, tan leather, sand-steel and brick red.
//   THE FALCONER (cnSkin 'falconer', the cutthroat's machine + a leashed hawk scout, src/ksar-hands.js): a teal falconer's coat with a gold-braided hem, a cream turban with a barred hawk
//     feather and a ruby pin, a veil, a long TAN GAUNTLET with a flared cuff held up at his chest (the hawk's perch: the glove sits where src/ksar-hands.js lands the bird, 5 px forward
//     and 15 up), a cross-strap with a leather HOOD (red plume) and a lure on a cord at his belt, a curved knife in the other hand.
//       0,1 walk (glove up, knife low behind) | 2 FEINT (the knife half up, the glove tucked) | 3 FEINT HOLD (the stamp) | 4 SLASH TELL (knife high and back, a glint) | 5 SLASH | 6 hurt
//       7 SEND - WINDUP (the glove cocked back and up behind his head, leaning back, the free hand pointing, the jesses drawn taut) | 8 SEND - RELEASE (the glove flung out and up at you,
//       fingers spread, jesses streaming, a speed streak) | 9 CALL (the glove straight up for the bird, two fingers at the veil, whistle arcs)
//   THE FALCONER'S HAWK (SPR.falconhawk, worn through e.skinNow by a hawk that has a falconer): a slate-blue LANNER, not the free scouts' brown barred hawk: a leather hood-crest with a red
//     plume, a gold BELL and two leather JESSES trailing from its feet. Same frame table as the hawk scout (0,1 glide/flap | 2 shriek | 3 stoop tell | 4 stoop | 5 grounded | 6 blind) +
//       7 PERCH ON THE GLOVE: upright, HOODED (the hood over its eyes), the jesses knotted round the glove.
//   THE PLATED BANDIT (cnSkin 'ksarplate', the cutthroat's machine, weightier): a steel helm with a nasal and a mail aventail, a riveted cuirass with waist lames, layered pauldrons, vambraces,
//     tassets and greaves over a red coat, a broad notched cleaver. Blades do x0.25 on him (a clank: THROW A BOMB); a blast blows the plate off -> 'ksarplatebare' (the same man in his
//     quilted coat, red skullcap, wrapped forearms).
//       0,1 walk (wide, heavy) | 2 FEINT (cleaver hoisted to the shoulder) | 3 FEINT HOLD (the stamp, cleaver low) | 4 SLASH TELL (two hands, right over and back, a glint) | 5 SLAM (brought
//       down to the floor and driven in, the floor cracked, a ring of dust and chips) | 6 hurt
//   THE PLATE SHARDS (bakePlateShards, used by src/ksar-hands.js's falling-plate FX): helm, pauldron, breast, tasset, rivet plate, splinter, each in four turns.
import { canvas, px, rect, fillPoly, line, ellipse, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; }
function settle(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn, noSettle) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return noSettle ? c : settle(c); });
function blade(g, hx, hy, tx, ty, bend, col, colL, thick) { const dx = tx - hx, dy = ty - hy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  for (let t = 0; t <= 1.001; t += 0.06) { const b = Math.sin(t * Math.PI) * bend, x = hx + dx * t + nx * b, y = hy + dy * t + ny * b; px(g, x, y, col); if (t < (thick ? 0.95 : 0.6)) px(g, x + nx, y + ny, t < 0.4 ? col : colL); if (thick && t > 0.15) px(g, x + nx * 2, y + ny * 2, colL); }
  px(g, tx, ty, colL); }
const glint = (g, x, y, c) => { px(g, x - 1, y, c); px(g, x + 1, y, c); px(g, x, y - 1, c); px(g, x, y + 1, c); };

/* ================================================================ THE FALCONER (38 x 32, ax 15) */
const FC = { skin: '#b07a52', skinD: '#8a5a38', coat: '#2e5a4e', coatL: '#4a8070', coatD: '#1c3a32', trim: '#d9b24a', trimD: '#9a7a24', wrap: '#ece0bc', wrapD: '#bca97c', wrapS: '#8a7a56', veil: '#2a4a42', veilD: '#16302a',
  sash: '#a8342a', sashD: '#701c16', strap: '#6a4428', strapL: '#8a6038', pants: '#5a4630', pantsL: '#7a6244', boot: '#2a1c12', bootL: '#4a3220', glove: '#c89a5a', gloveD: '#8a6232', gloveL: '#ecca90', stitch: '#f6e2b0',
  feather: '#8a5a32', featherL: '#f0e6d0', featherD: '#4a2c14', steel: '#c9d1dc', steelL: '#f4f8ff', steelD: '#8a94a4', hilt: '#6a4428', pin: '#c8283a', eye: '#f0dca0', lure: '#a07040', cord: '#5a3a1e', hood: '#8a3a24', plume: '#d8483a', glintC: '#fff6c8' };
export function bakeFalconer() {
  const W = 38, H = 32, cx = 15, gy = 30;
  const head = (g, x, y, up = 0) => {
    ellipse(g, x, y, 3.4, 3.5, FC.skin); px(g, x - 2, y + 1, FC.skinD);
    rect(g, x - 3, y + 1, 7, 3, FC.veil); line(g, x - 3, y + 3, x + 3, y + 3, FC.veilD); px(g, x + 3, y + 2, FC.veil);                                                          /* the veil, hemmed */
    rect(g, x + 1, y - 1 - up, 3, 1, FC.eye); px(g, x + 2, y - 1 - up, '#1b1626'); line(g, x + 1, y - 2 - up, x + 4, y - 2 - up, FC.featherD);                                  /* a hard eye under a brow */
    ellipse(g, x - 0.5, y - 2.3, 4.6, 2.7, FC.wrap); line(g, x - 4, y - 1, x + 3, y - 3, FC.wrapD); line(g, x - 4, y - 3, x + 2, y - 4, FC.wrapD); line(g, x - 3, y - 2, x + 3, y - 1, FC.wrapS);   /* the turban's folds */
    px(g, x + 3, y - 3, FC.pin); px(g, x + 3, y - 2, FC.trim);                                                                                                                    /* a ruby pin */
    line(g, x - 3, y - 4, x - 6, y - 9, FC.feather); line(g, x - 2, y - 4, x - 5, y - 9, FC.feather); px(g, x - 3, y - 6, FC.featherL); px(g, x - 4, y - 8, FC.featherL); px(g, x - 5, y - 9, FC.featherD); px(g, x - 4, y - 6, FC.featherD); };   /* the barred hawk feather */
  const body = (g, x, y, legs, lean = 0, glideCord = true) => { const [a, b] = legs;
    rect(g, x - 3 + a, y + 9, 2, 3, FC.pants); rect(g, x + 1 + b, y + 9, 2, 3, FC.pants); px(g, x - 3 + a, y + 9, FC.pantsL); px(g, x + 1 + b, y + 9, FC.pantsL);
    rect(g, x - 3 + a, y + 10, 3, 2, FC.boot); rect(g, x + 1 + b, y + 10, 3, 2, FC.boot); rect(g, x - 3 + a, y + 10, 3, 1, FC.bootL); rect(g, x + 1 + b, y + 10, 3, 1, FC.bootL);   /* wrapped trousers, cuffed boots */
    fillPoly(g, [[x - 3 + lean, y], [x + 3 + lean, y], [x + 5, y + 9], [x - 5, y + 9]], FC.coat); line(g, x - 2 + lean, y, x - 4, y + 8, FC.coatL); line(g, x + 3 + lean, y + 1, x + 4, y + 8, FC.coatD);
    line(g, x + lean, y + 1, x, y + 9, FC.coatD);                                                                                                                               /* the coat's front seam */
    rect(g, x - 5, y + 8, 10, 1, FC.trim); for (let k = -4; k <= 4; k += 2) px(g, x + k, y + 9, FC.trimD);                                                                   /* the gold-braided hem */
    px(g, x - 2 + lean, y, FC.trim); px(g, x + 2 + lean, y, FC.trim);                                                                                                        /* the braided collar */
    rect(g, x - 3 + lean, y + 4, 7, 2, FC.sash); line(g, x - 3 + lean, y + 5, x + 3 + lean, y + 5, FC.sashD); px(g, x - 4 + lean, y + 6, FC.sash); px(g, x - 5 + lean, y + 7, FC.sashD);   /* the red sash, a knot hanging */
    line(g, x - 3 + lean, y + 1, x + 3 + lean, y + 4, FC.strap); px(g, x - 2 + lean, y + 1, FC.strapL); px(g, x + 1 + lean, y + 3, FC.strapL);                                 /* the cross-strap */
    if (glideCord) { rect(g, x - 5, y + 5, 2, 3, FC.hood); px(g, x - 5, y + 5, FC.plume); px(g, x - 4, y + 4, FC.plume); px(g, x - 6, y + 4, FC.plume);                       /* his leather HOOD on the belt, red plume up */
      line(g, x + 3, y + 6, x + 4, y + 9, FC.cord); rect(g, x + 3, y + 9, 2, 2, FC.lure); px(g, x + 4, y + 11, FC.featherL); px(g, x + 3, y + 11, FC.feather); } };               /* the lure on its cord */
  /* the gauntlet: the sleeve to the wrist, a flared tan cuff, a stitched fist (open: the fingers spread) */
  const gauntlet = (g, sx, sy, gx2, gy2, open = false) => { line(g, sx, sy, gx2, gy2 + 1, FC.coat); line(g, sx, sy + 1, gx2, gy2 + 2, FC.coatD); px(g, sx, sy, FC.coatL);
    rect(g, gx2 - 2, gy2 - 2, 5, 3, FC.glove); line(g, gx2 - 2, gy2 - 2, gx2 + 2, gy2 - 2, FC.gloveL); line(g, gx2 - 2, gy2, gx2 + 2, gy2, FC.gloveD); px(g, gx2, gy2 - 1, FC.stitch);   /* the flared cuff, its stitching */
    if (open) { for (let k = -2; k <= 2; k += 1) px(g, gx2 + k, gy2 - 3 - (k === 0 ? 1 : 0), k % 2 ? FC.gloveL : FC.glove); } else { rect(g, gx2 - 1, gy2 - 3, 3, 1, FC.glove); px(g, gx2 + 2, gy2 - 3, FC.gloveD); } };
  const arm = (g, sx, sy, hx, hy) => { line(g, sx, sy, hx, hy, FC.coat); line(g, sx, sy + 1, hx, hy + 1, FC.coatD); px(g, hx, hy, FC.skin); px(g, hx + 1, hy, FC.skin); };
  const knife = (g, hx, hy, tx, ty, bend, shine) => { rect(g, hx - 1, hy, 2, 2, FC.hilt); px(g, hx - 1, hy + 2, FC.trim); blade(g, hx, hy, tx, ty, bend, FC.steel, shine ? FC.steelL : FC.steelD); };
  const F = frames(W, H, 10, (g, f) => {
    const by = gy - 12, gx0 = cx + 5, gy0 = by - 1;                                                                                                                              /* the glove's perch point: 5 forward, 15 up (src/ksar-hands.js leash) */
    if (f === 6) { body(g, cx - 1, by + 1, [0, 0], -1); head(g, cx - 2, by - 3, 1); arm(g, cx - 3, by + 2, cx - 7, by + 6); gauntlet(g, cx + 2, by + 2, cx + 4, by + 6); return; }   /* hurt: rocked back, the glove dropped */
    const legs = f === 0 ? [0, 1] : f === 1 ? [1, 0] : f === 3 ? [2, -1] : f === 5 || f === 8 ? [1, -1] : f === 7 ? [-1, 1] : [0, 0];
    const dip = f === 3 ? 1 : 0, lean = f === 2 || f === 5 || f === 8 ? 1 : f === 4 || f === 7 ? -1 : 0;
    body(g, cx, by + dip, legs, lean, f !== 7 && f !== 8 && f !== 9); head(g, cx + 1 + lean, by - 4 + dip, f === 9 ? 1 : 0);
    const sh = [cx + 3 + lean, by + 2 + dip], back = [cx - 2 + lean, by + 2 + dip];
    if (f === 7) {   /* SEND windup: the glove cocked back over his head, the jesses drawn taut, the free hand out to aim */
      gauntlet(g, ...back, cx - 6, by - 6, false); line(g, cx - 6, by - 4, cx - 9, by - 2, FC.cord); line(g, cx - 5, by - 4, cx - 8, by + 1, FC.cord); px(g, cx - 9, by - 1, FC.trim); px(g, cx - 8, by + 2, FC.trim);
      for (let i = 0; i < 3; i++) px(g, cx - 8 + i, by - 10 - i, FC.featherL); px(g, cx - 4, by - 9, FC.stitch);
      arm(g, ...sh, cx + 7, by + 1); px(g, cx + 8, by + 1, FC.skin); px(g, cx + 9, by, FC.skin); px(g, cx + 10, by - 1, FC.skin); return; }
    if (f === 8) {   /* SEND release: the glove flung out and up, fingers spread, the jesses streaming from it, a speed streak behind */
      gauntlet(g, ...sh, cx + 12, by - 6, true); for (let i = 0; i < 4; i++) line(g, cx + 3 + i * 2, by + 2 - i * 2, cx + 5 + i * 2, by + 2 - i * 2, i % 2 ? FC.gloveL : FC.stitch);
      line(g, cx + 12, by - 4, cx + 9, by - 2, FC.cord); line(g, cx + 13, by - 4, cx + 11, by, FC.cord); px(g, cx + 9, by - 1, FC.trim);
      arm(g, ...back, cx - 5, by + 4); return; }
    if (f === 9) {   /* CALL: the glove straight up for the bird, two fingers at the veil: the whistle */
      gauntlet(g, ...back, cx - 1, by - 11, false); px(g, cx - 2, by - 14, FC.stitch);
      arm(g, ...sh, cx + 3, by - 1); px(g, cx + 3, by - 2, FC.skin); px(g, cx + 4, by - 3, FC.skin);
      for (const [dx, dy] of [[6, -6], [7, -8], [8, -6], [9, -8]]) px(g, cx + dx, by + dy, FC.stitch); return; }                                                          /* the whistle's arcs */
    if (f === 0 || f === 1) { gauntlet(g, ...sh, gx0, gy0 + (f ? 1 : 0)); knife(g, cx - 3, by + 7, cx - 8, by + 11, -1, false); return; }                                       /* walking: the glove up for the bird, the knife low behind */
    gauntlet(g, ...back, cx - 4, by + 6, false);                                                                                                                                 /* the glove tucked at his side */
    if (f === 2) { arm(g, ...sh, cx + 5, by - 1); knife(g, cx + 5, by - 1, cx + 8, by - 8, -1, false); }
    else if (f === 3) { arm(g, ...sh, cx, by + 6); knife(g, cx, by + 6, cx - 6, by + 8, 1, false); }
    else if (f === 4) { arm(g, ...sh, cx, by - 4); knife(g, cx, by - 4, cx - 6, by - 11, 2, true); glint(g, cx - 6, by - 11, FC.glintC); }
    else if (f === 5) { arm(g, ...sh, cx + 8, by + 3); knife(g, cx + 8, by + 3, cx + 16, by + 6, -2, true); for (let i = 0; i < 5; i++) px(g, cx + 6 + i * 2, by - 4 + i * 2, FC.steelL); }
    else knife(g, cx + 4, by + 5, cx + 10, by + 8, -1, false);
  });
  return pack(F, cx, H, 10, 18);
}

/* ================================================================ THE FALCONER'S HAWK (26 x 20, ax 12 ay 14): a slate LANNER with a hood-crest, a bell and trailing jesses */
const HF = { b: '#4a5868', B: '#6e7e90', d: '#222c38', breast: '#ece2c8', bar: '#8a8a8a', beak: '#e0b840', eye: '#ffe070', red: '#ff4a3a', brow: '#f0ece0', tail: '#8896a8', hood: '#8a3a24', hoodD: '#5a2014', plume: '#e0483a', bell: '#ffd870', bellD: '#b8902a', jess: '#8a5a32', stud: '#ffd870' };
export function bakeFalconHawk() {
  const W = 26, H = 20, cx = 12, cy = 10;
  const jesses = (g, x, y) => { px(g, x - 1, y, HF.jess); px(g, x - 2, y + 1, HF.jess); px(g, x - 2, y + 2, HF.jess); px(g, x - 3, y + 3, HF.jess); px(g, x + 2, y, HF.jess); px(g, x + 3, y + 1, HF.jess);   /* two trailing straps... */
    rect(g, x - 4, y + 4, 2, 2, HF.bell); px(g, x - 4, y + 5, HF.bellD); px(g, x - 3, y + 4, '#fff6c8'); };                                                                       /* ...and a gold bell */
  const crest = (g, x, y, hooded, eye) => { ellipse(g, x, y - 1, 2.2, 1.5, HF.hood); line(g, x - 2, y, x + 2, y, HF.hoodD); px(g, x, y - 3, HF.stud); line(g, x - 1, y - 3, x - 3, y - 6, HF.plume); line(g, x, y - 3, x - 1, y - 7, HF.plume); px(g, x - 3, y - 6, '#fff0e0');   /* the hood-crest and its plume */
    if (hooded) { rect(g, x - 2, y, 5, 2, HF.hood); line(g, x - 2, y + 1, x + 3, y + 1, HF.hoodD); px(g, x + 3, y, HF.hoodD); } };
  const body = (g, x, y, pitch = 0, eye = HF.eye, hooded = false, crested = true) => {
    fillPoly(g, [[x - 5, y - 1], [x - 11, y - 1 + pitch], [x - 11, y + 2 + pitch], [x - 4, y + 2]], HF.tail); for (let k = 0; k < 3; k++) line(g, x - 10 + k * 2, y + pitch - 1, x - 10 + k * 2, y + 2 + pitch, HF.d);
    ellipse(g, x, y, 5.2, 3.2, HF.b); ellipse(g, x + 1, y + 1, 3.4, 1.9, HF.breast); for (const bx of [x - 1, x + 1, x + 3]) px(g, bx, y + 1, HF.bar); px(g, x - 2, y + 2, HF.bar);
    ellipse(g, x + 5, y - 2 + pitch, 2.4, 2, HF.B); px(g, x + 6, y - 2 + pitch, eye); rect(g, x + 7, y - 1 + pitch, 1, 2, HF.d);                                                     /* eye, the dark malar stripe */
    line(g, x + 7, y - 2 + pitch, x + 9, y - 1 + pitch, HF.beak); px(g, x + 9, y - 1 + pitch, HF.d); px(g, x + 7, y - 2 + pitch, '#ffe898');
    if (crested || hooded) crest(g, x + 4, y - 3 + pitch, hooded, eye);
    rect(g, x - 1, y + 3, 1, 2, HF.beak); rect(g, x + 2, y + 3, 1, 2, HF.beak); jesses(g, x, y + 5); };
  const wing = (g, x, y, lift) => { const tipx = x - 8, tipy = y - lift;
    fillPoly(g, [[x - 3, y - 2], [x + 3, y - 2], [x + 1, y - 2 - lift * 0.8], [tipx, tipy]], HF.B);
    fillPoly(g, [[x - 2, y - 2], [x + 2, y - 2], [x, y - 2 - lift * 0.5], [x - 5, y - lift * 0.6]], HF.b);
    for (let k = 0; k < 4; k++) line(g, tipx + k * 2, tipy + (k > 1 ? 1 : 0), tipx + k * 2 + 1, tipy + 3, HF.d);
    for (let xx = tipx + 1; xx < x; xx += 2) px(g, xx, y - 3 - Math.max(0, lift * 0.3), HF.bar); };
  const F = frames(W, H, 8, (g, f) => {
    if (f === 0) { body(g, cx, cy); wing(g, cx, cy, 7); }
    else if (f === 1) { body(g, cx, cy); wing(g, cx, cy, -2); fillPoly(g, [[cx - 3, cy - 1], [cx + 4, cy - 1], [cx + 8, cy + 3], [cx - 9, cy + 3]], HF.B); line(g, cx - 9, cy + 3, cx + 8, cy + 3, HF.d); }
    else if (f === 2) { body(g, cx, cy, -2); wing(g, cx, cy, 8); wing(g, cx + 2, cy, 6); rect(g, cx + 8, cy - 6, 3, 1, HF.red); line(g, cx + 9, cy - 5, cx + 11, cy - 3, HF.red); }
    else if (f === 3) { body(g, cx, cy, 1, HF.red, false, false); fillPoly(g, [[cx - 4, cy - 1], [cx + 3, cy - 3], [cx + 2, cy + 1]], HF.B); fillPoly(g, [[cx - 4, cy - 1], [cx - 11, cy - 4], [cx - 8, cy - 1]], HF.b);   /* the stoop tell: the crest flattened, the eye red */
      line(g, cx + 3, cy - 5, cx - 3, cy - 7, HF.plume); }
    else if (f === 4) { body(g, cx, cy + 2, 2, HF.red, false, false); fillPoly(g, [[cx - 5, cy], [cx + 3, cy - 1], [cx - 9, cy - 6]], HF.B); line(g, cx - 9, cy - 6, cx - 3, cy, HF.d); for (let k = 0; k < 3; k++) rect(g, cx + 3 + k, cy + 3, 1, 3, HF.beak);
      line(g, cx + 3, cy - 3, cx - 4, cy - 6, HF.plume); }
    else if (f === 5) { body(g, cx, cy + 3, 0); fillPoly(g, [[cx - 4, cy + 2], [cx + 3, cy + 1], [cx - 1, cy + 5]], HF.B); }
    else if (f === 6) { body(g, cx, cy, -1, '#ffffff'); wing(g, cx, cy, 7); wing(g, cx + 2, cy, -3); px(g, cx + 3, cy - 6, '#ffffff'); px(g, cx - 4, cy - 7, '#ffffff'); }
    else {   /* 7 PERCH ON THE GLOVE: upright and HOODED, the talons gripping at the glove's top, the jesses knotted below, the tail hanging behind */
      const gx0 = cx, top = 12;                                                                                                                                                   /* the glove's top sits at row 12 (ay 14 minus 2) */
      fillPoly(g, [[gx0 - 3, top - 3], [gx0, top - 4], [gx0 - 1, top + 5], [gx0 - 6, top + 5]], HF.tail); for (let k = 0; k < 3; k++) line(g, gx0 - 5 + k, top, gx0 - 5 + k - 1, top + 5, HF.d);
      ellipse(g, gx0 + 1, top - 5, 3.6, 5, HF.b); ellipse(g, gx0 + 2, top - 4, 2.4, 3.6, HF.breast); for (const by of [top - 6, top - 4, top - 2]) px(g, gx0 + 2, by, HF.bar);   /* the upright body, the cream breast barred */
      fillPoly(g, [[gx0 - 2, top - 8], [gx0 + 1, top - 7], [gx0 - 1, top - 1], [gx0 - 4, top - 3]], HF.B); line(g, gx0 - 3, top - 7, gx0 - 3, top - 2, HF.d);                         /* the folded wing */
      ellipse(g, gx0 + 2, top - 10, 2.6, 2.4, HF.B); crest(g, gx0 + 2, top - 10, true, HF.eye); px(g, gx0 + 5, top - 10, HF.beak); px(g, gx0 + 5, top - 9, HF.d);                    /* the head, hooded, the beak just out */
      rect(g, gx0 - 1, top - 1, 2, 2, HF.beak); rect(g, gx0 + 2, top - 1, 2, 2, HF.beak); line(g, gx0 - 1, top + 1, gx0 + 3, top + 1, HF.jess); px(g, gx0 + 1, top + 2, HF.jess);    /* the talons, the jesses knotted */
      rect(g, gx0 + 3, top + 1, 2, 2, HF.bell); px(g, gx0 + 4, top + 2, HF.bellD); }
  });
  return pack(F, cx, 14, 12, 10);
}

/* ================================================================ THE PLATED BANDIT (40 x 32, ax 16) - plated / bare */
const PB = { skin: '#a8714a', skinD: '#7a4a2c', coat: '#8a2a20', coatL: '#b84a36', coatD: '#5a1810', quilt: '#c8b48a', quiltL: '#e4d4aa', quiltD: '#968058', cap: '#a8302a', capD: '#701c16', beard: '#3a2a1c',
  plate: '#9aa4b0', plateL: '#e0e8f2', plateD: '#5e6874', plateDD: '#3e4650', mail: '#7a828e', mailL: '#a8b0bc', rivet: '#2e343c', gold: '#c9962a', pants: '#4a3a2a', boot: '#241810', wrap: '#d8c8a0', wrapD: '#a89868',
  cleaver: '#b8c0ca', cleaverL: '#f0f4fa', cleaverD: '#7a8290', haft: '#5a3a1e', haftL: '#8a6038', eye: '#f0dca0', glintC: '#fff6c8', dust: '#c8b080', dustD: '#9a8458', crack: '#2a1c12' };
function bakePlate(plated) {
  const W = 40, H = 32, cx = 16, gy = 30;
  const head = (g, x, y, tilt = 0) => { ellipse(g, x, y, 3.7, 3.7, PB.skin);
    if (plated) { ellipse(g, x, y - 1.5, 4.6, 3.4, PB.plate); line(g, x - 4, y - 1, x + 4, y - 1, PB.plateD); line(g, x - 3, y - 4, x + 2, y - 4, PB.plateL); line(g, x, y - 5, x, y - 1, PB.plateL); px(g, x - 1, y - 3, PB.plateL);   /* the helm: a ridge, a brow band */
      rect(g, x + 1, y - 1, 1, 5, PB.plateL); px(g, x + 1, y + 4, PB.plateD); px(g, x - 3, y - 2, PB.rivet); px(g, x + 3, y - 2, PB.rivet);                                         /* the nasal, the rivets */
      rect(g, x - 5, y + 1, 4, 5, PB.mail); for (let k = 0; k < 3; k++) { px(g, x - 5 + (k % 2), y + 2 + k * 1.5, PB.mailL); px(g, x - 3 + (k % 2), y + 3 + k, PB.plateDD); } rect(g, x - 5, y + 5, 7, 1, PB.plateDD);   /* the mail aventail */
      px(g, x + 2, y + 1 + tilt, PB.eye); px(g, x + 3, y + 1 + tilt, PB.eye); }                                                                                                  /* the eye in the slot */
    else { ellipse(g, x - 0.5, y - 2.4, 4.2, 2, PB.cap); line(g, x - 4, y - 1, x + 3, y - 1, PB.capD); px(g, x - 1, y - 4, PB.capD); px(g, x + 1, y + tilt, PB.eye); px(g, x + 2, y + tilt, PB.eye); line(g, x, y - 1, x + 3, y - 1, PB.skinD);   /* bare: a red skullcap */
      rect(g, x - 2, y + 2, 6, 2, PB.beard); px(g, x - 3, y + 3, PB.beard); px(g, x + 4, y + 2, PB.beard); } };                                                                     /* a black beard */
  const body = (g, x, y, legs, lean = 0) => { const [a, b] = legs;
    rect(g, x - 4 + a, y + 9, 3, 3, PB.pants); rect(g, x + 1 + b, y + 9, 3, 3, PB.pants); rect(g, x - 4 + a, y + 11, 4, 1, PB.boot); rect(g, x + 1 + b, y + 11, 4, 1, PB.boot);
    if (plated) { rect(g, x - 4 + a, y + 9, 3, 2, PB.plateD); rect(g, x + 1 + b, y + 9, 3, 2, PB.plateD); px(g, x - 3 + a, y + 9, PB.plateL); px(g, x + 2 + b, y + 9, PB.plateL); }   /* greaves over the shins */
    else { for (const lx of [x - 4 + a, x + 1 + b]) { rect(g, lx, y + 9, 3, 1, PB.wrap); rect(g, lx, y + 10, 3, 1, PB.wrapD); } }                                                          /* leg wraps */
    fillPoly(g, [[x - 4 + lean, y], [x + 4 + lean, y], [x + 5, y + 9], [x - 5, y + 9]], plated ? PB.coat : PB.quilt);
    if (plated) { fillPoly(g, [[x - 4 + lean, y], [x + 4 + lean, y], [x + 4, y + 6], [x - 4, y + 6]], PB.plate); line(g, x - 3 + lean, y + 1, x - 3, y + 5, PB.plateL); line(g, x + 4 + lean, y + 1, x + 4, y + 5, PB.plateD);   /* the cuirass */
      line(g, x + lean, y + 1, x, y + 5, PB.plateL); px(g, x - 1, y + 2, PB.plateL);                                                                                                /* its centre ridge */
      for (const [rx, ry] of [[-2, 1], [2, 1], [-2, 4], [2, 4]]) px(g, x + rx + lean, y + ry, PB.rivet);
      for (let k = 0; k < 2; k++) { rect(g, x - 5, y + 6 + k * 1, 10, 1, k ? PB.plateD : PB.plate); } line(g, x - 5, y + 7, x + 4, y + 7, PB.plateDD);                              /* two waist lames */
      rect(g, x - 5, y + 8, 10, 2, PB.coatD); for (let k = -4; k <= 4; k += 2) { px(g, x + k, y + 8, PB.plateD); px(g, x + k, y + 9, PB.plateDD); }                                /* the tassets over the red skirt */
      ellipse(g, x - 5 + lean, y + 1, 2.6, 1.9, PB.plate); ellipse(g, x + 5 + lean, y + 1, 2.6, 1.9, PB.plate); line(g, x - 7 + lean, y + 2, x - 3 + lean, y + 2, PB.plateD); line(g, x + 3 + lean, y + 2, x + 7 + lean, y + 2, PB.plateD);   /* the pauldrons, two lames */
      px(g, x - 6 + lean, y, PB.plateL); px(g, x + 4 + lean, y, PB.plateL); px(g, x + 6 + lean, y + 1, PB.rivet); px(g, x - 6 + lean, y + 1, PB.rivet); }
    else { for (let k = 1; k < 9; k += 2) line(g, x - 4 + lean * (1 - k / 9), y + k, x + 4, y + k, PB.quiltD); for (let k = -3; k <= 3; k += 2) line(g, x + k, y, x + k + 1, y + 8, PB.quiltD); line(g, x - 3 + lean, y, x - 4, y + 8, PB.quiltL);   /* the quilted coat, diamond-stitched */
      rect(g, x - 4, y + 5, 9, 2, PB.coatD); px(g, x - 4, y + 6, PB.gold); px(g, x, y + 6, PB.gold); ellipse(g, x - 5 + lean, y + 1, 2.2, 1.7, PB.quiltD); ellipse(g, x + 5 + lean, y + 1, 2.2, 1.7, PB.quiltD); px(g, x - 5 + lean, y, PB.quiltL); } };   /* the belt, padded shoulders */
  /* an arm: red sleeve (plated: with a steel vambrace at the wrist; bare: wrapped), ending in a fist at (hx, hy) */
  const limb = (g, sx, sy, hx, hy) => { line(g, sx, sy, hx, hy, plated ? PB.coat : PB.quiltD); line(g, sx, sy + 1, hx, hy + 1, plated ? PB.coatD : PB.quiltD);
    const t = 0.65, mx = sx + (hx - sx) * t, my = sy + (hy - sy) * t; line(g, mx, my, hx, hy, plated ? PB.plate : PB.wrap); line(g, mx, my + 1, hx, hy + 1, plated ? PB.plateD : PB.wrapD); rect(g, hx - 1, hy - 1, 3, 3, PB.skin); px(g, hx, hy - 1, PB.skinD); };
  const cleaver = (g, hx, hy, tx, ty, shine) => { const hx2 = hx + (tx - hx) * 0.3, hy2 = hy + (ty - hy) * 0.3; line(g, hx, hy, hx2, hy2, PB.haft); px(g, hx + 1, hy, PB.haftL); px(g, hx, hy + 1, PB.gold);   /* the wrapped haft, a gold pommel */
    blade(g, hx2, hy2, tx, ty, 1.5, PB.cleaver, shine ? PB.cleaverL : PB.cleaverD, true); px(g, hx2, hy2, PB.gold); px(g, (hx2 + tx) / 2 + 1, (hy2 + ty) / 2 - 1, PB.cleaverD); };   /* the notched spine */
  const F = frames(W, H, 7, (g, f) => {
    const by = gy - 12;
    if (f === 6) { body(g, cx - 1, by + 1, [0, 0], -1); head(g, cx - 2, by - 3, 1); limb(g, cx + 3, by + 3, cx + 5, by + 8); cleaver(g, cx + 5, by + 8, cx + 10, by + 12, false); return; }
    const legs = f === 0 ? [-1, 1] : f === 1 ? [1, -1] : f === 3 ? [-2, 2] : f === 5 ? [-3, 3] : [-1, 1];   /* (a wide, heavy stance; the slam is braced wide) */
    const dip = f === 3 ? 1 : f === 5 ? 2 : 0, lean = f === 2 ? 1 : f === 5 ? 2 : f === 4 ? -1 : 0;
    body(g, cx, by + dip, legs, lean); head(g, cx + 1 + lean, by - 4 + dip, f === 5 ? 1 : 0);
    const sh = [cx + 4 + lean, by + 2 + dip], back = [cx - 4 + lean, by + 2 + dip];
    if (f === 2) { limb(g, ...sh, cx + 5, by - 1); cleaver(g, cx + 5, by - 1, cx + 3, by - 11, false); limb(g, ...back, cx - 5, by + 6); }                                       /* THE FEINT: hoisted to the shoulder */
    else if (f === 3) { limb(g, ...sh, cx + 1, by + 7); cleaver(g, cx + 1, by + 7, cx - 8, by + 9, false); limb(g, ...back, cx - 5, by + 5); }                                    /* THE STAMP: dropped low behind him */
    else if (f === 4) { limb(g, ...sh, cx, by - 5); limb(g, ...back, cx - 1, by - 4); cleaver(g, cx, by - 5, cx - 9, by - 13, true); glint(g, cx - 9, by - 13, PB.glintC); }    /* THE REAL ONE: two hands, right over and back */
    else if (f === 5) {   /* THE SLAM: both hands drive the cleaver down in front of him; it bites the floor, the floor cracks, a ring of dust and chips jumps off it */
      limb(g, ...sh, cx + 10, by + 8); limb(g, ...back, cx + 8, by + 6); cleaver(g, cx + 10, by + 8, cx + 21, by + 12, true);
      for (let i = 0; i < 5; i++) px(g, cx + 8 + i * 2, by - 6 + i * 3, PB.cleaverL);                                                                                            /* the downstroke's streak */
      line(g, cx + 21, by + 12, cx + 15, by + 12, PB.crack); line(g, cx + 21, by + 12, cx + 27, by + 12, PB.crack); px(g, cx + 24, by + 11, PB.crack); px(g, cx + 18, by + 11, PB.crack);   /* the cracked floor */
      for (const [dx, dy, c] of [[13, 11, PB.dust], [14, 10, PB.dustD], [16, 10, PB.dust], [17, 9, PB.dust], [26, 11, PB.dust], [27, 10, PB.dustD], [24, 9, PB.dust], [25, 8, PB.dustD], [19, 8, PB.dustD], [22, 7, PB.dust], [15, 8, PB.dustD], [-6, 11, PB.dust], [-7, 10, PB.dustD], [-4, 11, PB.dust], [-8, 11, PB.dustD]]) px(g, cx + dx, by + dy + 1, c);
      for (const [dx, dy] of [[20, 5], [23, 4], [17, 6]]) px(g, cx + dx, by + dy, PB.dustD); }                                                                                 /* chips thrown up */
    else { limb(g, ...sh, cx + 5, by + 6); cleaver(g, cx + 5, by + 6, cx + 11, by + 11, false); limb(g, ...back, cx - 5, by + 6); }
  });
  return pack(F, cx, H, 12, 18);
}
export const bakePlateBandit = () => bakePlate(true);
export const bakePlateBare = () => bakePlate(false);

/* ================================================================ THE PLATE SHARDS: what falls when a blast strips him (src/ksar-hands.js 'plate' fx). Each in four quarter turns: S[name][turn] */
function turn90(c) { const w = c.width, h = c.height, [o, go] = canvas(h, w), g = c.getContext('2d'), d = g.getImageData(0, 0, w, h).data, out = go.createImageData ? go.createImageData(h, w) : go.getImageData(0, 0, h, w), od = out.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const s = (y * w + x) * 4, t = (x * h + (h - 1 - y)) * 4; od[t] = d[s]; od[t + 1] = d[s + 1]; od[t + 2] = d[s + 2]; od[t + 3] = d[s + 3]; }
  go.putImageData(out, 0, 0); return o; }
export function bakePlateShards() {
  const shard = (w, h, fn) => { const [c, g] = canvas(w, h); fn(g); outline(c, OUT); const t1 = turn90(c), t2 = turn90(t1), t3 = turn90(t2); return [c, t1, t2, t3]; };
  return {
    helm: shard(9, 8, g => { ellipse(g, 4, 4, 4, 3.4, PB.plate); line(g, 1, 3, 7, 3, PB.plateD); line(g, 2, 1, 6, 1, PB.plateL); rect(g, 4, 1, 1, 6, PB.plateL); px(g, 2, 2, PB.rivet); px(g, 6, 2, PB.rivet); line(g, 0, 6, 8, 6, PB.plateDD); }),
    pauldron: shard(9, 6, g => { ellipse(g, 4, 3, 4, 2.6, PB.plate); line(g, 1, 4, 7, 4, PB.plateD); line(g, 2, 1, 6, 1, PB.plateL); px(g, 2, 3, PB.rivet); px(g, 6, 3, PB.rivet); }),
    breast: shard(9, 8, g => { fillPoly(g, [[0, 0], [8, 0], [7, 7], [1, 7]], PB.plate); line(g, 1, 1, 1, 6, PB.plateL); line(g, 7, 1, 7, 6, PB.plateD); line(g, 4, 1, 4, 6, PB.plateL); px(g, 2, 2, PB.rivet); px(g, 6, 2, PB.rivet); px(g, 2, 5, PB.rivet); px(g, 6, 5, PB.rivet); line(g, 1, 7, 7, 7, PB.plateDD); }),
    tasset: shard(5, 7, g => { fillPoly(g, [[0, 0], [4, 0], [3, 6], [1, 6]], PB.plateD); line(g, 1, 1, 1, 5, PB.plate); px(g, 2, 1, PB.rivet); px(g, 2, 5, PB.plateDD); }),
    rivet: shard(4, 4, g => { rect(g, 0, 0, 4, 4, PB.plate); px(g, 0, 0, PB.plateL); px(g, 3, 3, PB.plateD); px(g, 1, 1, PB.rivet); }),
    splinter: shard(2, 7, g => { rect(g, 0, 0, 2, 7, PB.plate); px(g, 0, 0, PB.plateL); px(g, 1, 6, PB.plateD); px(g, 0, 3, PB.plateL); }),
  };
}

export function bakeKsarFoeSets() { return { falconer: bakeFalconer(), ksarplate: bakePlateBandit(), ksarplatebare: bakePlateBare(), falconhawk: bakeFalconHawk() }; }
