// ksar_art.js - THE BANDIT KSAR's CAST, in its own skins (claude/ksar art pass; it was the greybox's hue shifts). Five proven machines wear the fort's colours and gear, and the hawk
// scout and the Hawk-Mistress and HER hawk are drawn whole. Every reskin keeps its machine's frames, tells and hit box (an exact-colour remap, then pixels laid on the head and hands):
//   KSAR BLADE       the cutthroat in the fort's madder-red coat with ochre trim, a cream turban banded in gold, the veil kept dark; the curved blade as it was
//   GONG LOOKOUT     the cutthroat in sand-ochre with a saffron turban and a teal sash and a long scarf tail (a runner's kit: light, bright, easy to pick out)
//   WHIP APPRENTICE  the cutthroat in a falconer's brown leather, a red feather in the cap - and the scimitar's curve becomes a coiled leather lash
//   SHIELD SENTRY    the shield guard in a bronze helm with a red horsehair plume and a red-and-gold shield, an indigo cloak
//   SMOKE THROWER    the dynamite bandit in ash-grey wraps, a soot-dark face cloth, a grey clay pot in the hand
//   WALL SLINGER     the slinger in an indigo head-wrap and a sandy tunic, a long keffiyeh tail
//   HAWK SCOUT       0,1 flap/glide | 2 shriek | 3 stoop tell | 4 stoop | 5 on the ground | 6 blind        (26 x 18, the old frame table)
//   THE HAWK-MISTRESS  a body with real pose cycles (bakeMistress(pose)), facing right: idle, walk A/B, guard, lashTell, lash, feint, cutTell, cut, whistle, recover, sleep, hurt
//   HER HAWK         bakeHerHawk(pose): soar A/B, bank, stoop, blind, perched on the glove
import { canvas, rect, px, ellipse, circle, line, outline, flipX, whiten, fillPoly } from '../px.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const hexOf = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
/* an exact-colour remap: body table for the whole frame, head table inside the head zone (the topmost non-steel rows), then fx(frame, g, topRow, x0, x1) lays pixels on top */
function remap(base, body, head, fx, zone = 5) {
  if (!base || !base.R) return null;
  const frames = base.R.map((c, fi) => { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data, W = d.width, H = d.height;
    let t = -1, x0 = W, x1 = 0;
    for (let y = 0; y < H && t < 0; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4; if (!p[k + 3]) continue; const h = hexOf(p[k], p[k + 1], p[k + 2]); if (h === '#1b1626' || (p[k] > 190 && p[k + 1] > 190 && p[k + 2] > 190)) continue; t = y; break; }   /* the first row with body (not outline, not steel) */
    if (t >= 0) for (let y = t; y < t + 3; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4; if (p[k + 3] && hexOf(p[k], p[k + 1], p[k + 2]) !== '#1b1626') { x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4; if (!p[k + 3]) continue; const h = hexOf(p[k], p[k + 1], p[k + 2]);
      const tb = head && t >= 0 && y >= t && y < t + zone && head[h] ? head[h] : body[h]; if (tb) { const [r, gg, b] = rgbOf(tb); p[k] = r; p[k + 1] = gg; p[k + 2] = b; } }
    g.putImageData(img, 0, 0); if (fx) fx(fi, g, t, x0, x1, W, H); return d; });
  return pack(frames, base.ax, base.ay, base.w, base.h);
}
const dot = (g, x, y, c) => { if (x >= 0 && y >= 0) px(g, x, y, c); };

/* ---- the cutthroat's palette: robe #35305a #2a2640 #201c38 #554e86, deepest #141220, sash #b8382c #842218, skin #b07a52, gold #c9962a #f0dca0, steel #c9d1dc #f4f8ff, boots #4e3e30 #2a1c12 */
export const bakeKsarBlade = base => remap(base,
  { '#35305a': '#a8402e', '#2a2640': '#842c20', '#201c38': '#5e1e16', '#554e86': '#cc6a4a', '#141220': '#3a1810', '#b8382c': '#d9b04a', '#842218': '#9a7a22', '#4e3e30': '#4a3220', '#2a1c12': '#2a1a10' },
  { '#35305a': '#e8d8b0', '#2a2640': '#cdb98c', '#201c38': '#a8946a', '#554e86': '#fff0d0', '#141220': '#4a2418' },
  (fi, g, t, x0, x1) => { if (t < 1) return; for (let x = x0 + 1; x < x1; x += 2) dot(g, x, t + 1, '#fff6e0'); for (let x = x0; x <= x1; x++) dot(g, x, t + 3, x % 2 ? '#d9b04a' : '#a8802a'); dot(g, x0 - 1, t + 4, '#cdb98c'); dot(g, x0 - 1, t + 5, '#a8946a'); });
export const bakeGongLookout = base => remap(base,
  { '#35305a': '#c8a860', '#2a2640': '#a88c48', '#201c38': '#7a5e2c', '#554e86': '#e0c880', '#141220': '#4a3418', '#b8382c': '#2a8a78', '#842218': '#1a5a4e', '#4e3e30': '#5a3a22', '#2a1c12': '#3a2414' },
  { '#35305a': '#e8a02a', '#2a2640': '#c8841a', '#201c38': '#9a6414', '#554e86': '#ffc860', '#141220': '#5a3a1e' },
  (fi, g, t, x0, x1) => { if (t < 1) return; for (let x = x0 + 1; x < x1; x += 3) dot(g, x, t + 1, '#ffd890'); dot(g, x0 - 1, t + 3, '#e8a02a'); dot(g, x0 - 2, t + 4, '#e8a02a'); dot(g, x0 - 2, t + 5, '#c8841a'); dot(g, x0 - 3, t + 6, '#c8841a'); dot(g, x0 - 3, t + 7, '#9a6414'); dot(g, x1 + 1, t + 2, '#2a8a78'); });
export const bakeWhipApprentice = base => remap(base,
  { '#35305a': '#7a4a2a', '#2a2640': '#5a3418', '#201c38': '#3e2412', '#554e86': '#a8703c', '#141220': '#2a1a0e', '#b8382c': '#d9b04a', '#842218': '#9a7a22', '#4e3e30': '#3a2616', '#2a1c12': '#24160c',
    '#c9d1dc': '#8a5a32', '#f4f8ff': '#c89a62' },
  { '#35305a': '#6a3e22', '#2a2640': '#52301a', '#201c38': '#3a2210', '#554e86': '#9a6232', '#141220': '#2a1a0e' },
  (fi, g, t, x0, x1) => { if (t < 2) return; dot(g, x1 - 1, t - 1, '#d03a2a'); dot(g, x1 - 1, t - 2, '#f0e0c0'); dot(g, x1, t - 1, '#a82820'); dot(g, x1, t, '#5a3418'); for (let x = x0; x <= x1; x++) dot(g, x, t + 3, '#d8b070'); });   /* a red feather and a pale cap band */
/* ---- the shield guard: helm #8a929e #7a828e #b8c0ca #d0d8e2, shield #8a5a32 #b88450 (face), cloak #6a2a1c #3e140e #2a1410 #a8583a #5a3a1e, gold #c9962a */
export const bakeShieldSentry = base => remap(base,
  { '#8a929e': '#c08a2a', '#7a828e': '#8a5e1a', '#b8c0ca': '#f0c860', '#d0d8e2': '#fff0a8', '#8a5a32': '#9a2a24', '#b88450': '#d0483c', '#a8583a': '#2a3a6a', '#6a2a1c': '#1e2a52', '#3e140e': '#141c3a', '#2a1410': '#0e1428', '#5a3a1e': '#6a1a16', '#c9962a': '#ffd870' },
  { '#8a929e': '#c08a2a', '#7a828e': '#8a5e1a', '#b8c0ca': '#f0c860', '#d0d8e2': '#fff0a8' },
  (fi, g, t, x0, x1) => { if (t < 3) return; const mx = (x0 + x1) >> 1; dot(g, mx, t - 1, '#c8281e'); dot(g, mx - 1, t - 1, '#a82018'); dot(g, mx + 1, t - 1, '#a82018'); dot(g, mx - 1, t - 2, '#c8281e'); dot(g, mx, t - 2, '#e0483a'); dot(g, mx + 1, t - 2, '#c8281e'); dot(g, mx - 2, t, '#a82018'); dot(g, x0 - 1, t + 1, '#c8281e'); dot(g, x0 - 1, t + 2, '#a82018'); }, 4);
/* ---- the dynamiter: headcloth #c8902a, robe #9a3a22 #c8281e #6a2214 #a8583a, face-dark #2a1410, skin #b07a52, sticks #ff6a4a #fff2a0 #ff9a3a, #e8dcc0 */
export const bakeSmokeThrower = base => remap(base,
  { '#9a3a22': '#6a6a74', '#c8281e': '#8a8a96', '#6a2214': '#44444e', '#a8583a': '#9a9aa6', '#c8902a': '#c4bcae', '#2a1410': '#1a1a20', '#ff6a4a': '#d8d8e0', '#ff9a3a': '#b0b0b8', '#fff2a0': '#f0f0f6', '#4e3e30': '#34343c' },
  { '#c8902a': '#c4bcae', '#a8583a': '#a8a094' },
  (fi, g, t, x0, x1) => { if (t < 1) return; for (let x = x0; x <= x1; x += 2) dot(g, x, t + 1, '#e8e0d0'); dot(g, x0 - 1, t + 3, '#a8a094'); dot(g, x0 - 2, t + 4, '#a8a094'); dot(g, x0 - 2, t + 5, '#88806e'); });
/* ---- the slinger: tunic #cfae74, headband #b8463a #84302a, skin #c68a5c, belt #7a5a3a #9a7a48, pouch #8a5a32 */
export const bakeWallSlinger = base => remap(base,
  { '#cfae74': '#b8a888', '#b8463a': '#2a3a7a', '#84302a': '#1a2858', '#ead0a0': '#d8d0b8', '#e8dcc0': '#ecdcc0', '#9a7a48': '#7a6a50' },
  { '#b8463a': '#2a3a7a', '#84302a': '#1a2858', '#cfae74': '#3a4a8a' },
  (fi, g, t, x0, x1) => { if (t < 1) return; for (let x = x0; x <= x1; x += 3) dot(g, x, t + 1, '#6a7ab8'); dot(g, x0 - 1, t + 2, '#2a3a7a'); dot(g, x0 - 2, t + 3, '#2a3a7a'); dot(g, x0 - 2, t + 4, '#1a2858'); dot(g, x0 - 3, t + 5, '#1a2858'); dot(g, x0 - 3, t + 6, '#1a2858'); });

/* ================================================================ THE HAWK SCOUT: a small barred hawk, 26 x 18, ax 12 ay 14 */
const HK = { b: '#6a4428', B: '#8a5a32', d: '#3e2614', breast: '#e0caa0', bar: '#9a7a50', beak: '#d8b040', eye: '#ffd36b', red: '#ff4a3a', brow: '#f0e6d0', tail: '#a07040' };
export function bakeHawk() {
  const W = 26, H = 18, OUT = '#1b1626';
  const body = (g, cx, cy, pitch = 0, eye = HK.eye) => {
    fillPoly(g, [[cx - 5, cy - 1], [cx - 11, cy - 1 + pitch], [cx - 11, cy + 2 + pitch], [cx - 4, cy + 2]], HK.tail); for (let k = 0; k < 3; k++) line(g, cx - 10 + k * 2, cy + pitch - 1 + (k > 1 ? 0 : 0), cx - 10 + k * 2, cy + 2 + pitch, HK.d);   /* the barred tail fan */
    ellipse(g, cx, cy, 5.2, 3.2, HK.b); ellipse(g, cx + 1, cy + 1, 3.4, 1.9, HK.breast); for (const bx of [cx - 1, cx + 1, cx + 3]) px(g, bx, cy + 1, HK.bar); px(g, cx - 2, cy + 2, HK.bar);
    ellipse(g, cx + 5, cy - 2 + pitch, 2.4, 2, HK.B); rect(g, cx + 5, cy - 3 + pitch, 2, 1, HK.brow); px(g, cx + 6, cy - 2 + pitch, eye); rect(g, cx + 7, cy - 1 + pitch, 1, 1, HK.d);   /* eye with a pale brow, the moustache stripe */
    line(g, cx + 7, cy - 2 + pitch, cx + 9, cy - 1 + pitch, HK.beak); px(g, cx + 9, cy - 1 + pitch, HK.d); rect(g, cx - 1, cy + 3, 1, 2, HK.beak); rect(g, cx + 2, cy + 3, 1, 2, HK.beak); };
  const wing = (g, cx, cy, lift) => { const tipx = cx - 8, tipy = cy - lift;
    fillPoly(g, [[cx - 3, cy - 2], [cx + 3, cy - 2], [cx + 1, cy - 2 - lift * 0.8], [tipx, tipy]], HK.B);
    fillPoly(g, [[cx - 2, cy - 2], [cx + 2, cy - 2], [cx, cy - 2 - lift * 0.5], [cx - 5, cy - lift * 0.6]], HK.b);
    for (let k = 0; k < 4; k++) line(g, tipx + k * 2, tipy + (k > 1 ? 1 : 0), tipx + k * 2 + 1, tipy + 3, HK.d);   /* the fingered tip feathers */
    for (let x = tipx + 1; x < cx; x += 2) px(g, x, cy - 3 - Math.max(0, lift * 0.3), HK.bar); };
  const F = Array.from({ length: 7 }, (_, f) => { const [c, g] = canvas(W, H), cx = 12, cy = 10;
    if (f === 0) { body(g, cx, cy); wing(g, cx, cy, 7); }
    else if (f === 1) { body(g, cx, cy); wing(g, cx, cy, -2); fillPoly(g, [[cx - 3, cy - 1], [cx + 4, cy - 1], [cx + 8, cy + 3], [cx - 9, cy + 3]], HK.B); line(g, cx - 9, cy + 3, cx + 8, cy + 3, HK.d); }
    else if (f === 2) { body(g, cx, cy, -2); wing(g, cx, cy, 8); wing(g, cx + 2, cy, 6); rect(g, cx + 8, cy - 6, 3, 1, HK.red); line(g, cx + 9, cy - 5, cx + 11, cy - 3, HK.red); }
    else if (f === 3) { body(g, cx, cy, 1, HK.red); fillPoly(g, [[cx - 4, cy - 1], [cx + 3, cy - 3], [cx + 2, cy + 1]], HK.B); fillPoly(g, [[cx - 4, cy - 1], [cx - 11, cy - 4], [cx - 8, cy - 1]], HK.b); }
    else if (f === 4) { body(g, cx, cy + 2, 2, HK.red); fillPoly(g, [[cx - 5, cy], [cx + 3, cy - 1], [cx - 9, cy - 6]], HK.B); line(g, cx - 9, cy - 6, cx - 3, cy, HK.d); for (let k = 0; k < 3; k++) rect(g, cx + 3 + k, cy + 3, 1, 3, HK.beak); }
    else if (f === 5) { body(g, cx, cy + 3, 0); fillPoly(g, [[cx - 4, cy + 2], [cx + 3, cy + 1], [cx - 1, cy + 5]], HK.B); rect(g, cx - 1, cy + 6, 1, 2, HK.beak); rect(g, cx + 2, cy + 6, 1, 2, HK.beak); }
    else { body(g, cx, cy, -1, '#ffffff'); wing(g, cx, cy, 7); wing(g, cx + 2, cy, -3); px(g, cx + 3, cy - 6, '#ffffff'); px(g, cx - 4, cy - 7, '#ffffff'); }
    outline(c, OUT); return c; });
  return pack(F, 12, 14, 12, 10);
}

/* ================================================================ HER HAWK (the Hawk-Mistress's own, larger: a russet tail, a leather jess and a bell) 34 x 20 */
const HH = { b: '#5a3418', B: '#8a4a22', d: '#2e1a0c', breast: '#f0dcb0', bar: '#8a6238', beak: '#e0b840', eye: '#ffe070', tail: '#c05a2a', tailD: '#8a3a18', jess: '#a8302a', bell: '#ffd870' };
/* pose: 0 soar up, 1 soar down, 2 bank, 3 stoop, 4 blind, 5 perched (on the glove), 6 spot (wings cupped, head down) */
export function bakeHerHawk(pose) {
  const W = 34, H = 22, [c, g] = canvas(W, H), cx = 16, cy = 11;
  const body = (pitch = 0, eye = HH.eye) => { fillPoly(g, [[cx - 5, cy - 1], [cx - 14, cy - 1 + pitch], [cx - 14, cy + 3 + pitch], [cx - 4, cy + 2]], HH.tail); for (let k = 0; k < 4; k++) line(g, cx - 13 + k * 2, cy + pitch - 1, cx - 13 + k * 2, cy + 3 + pitch, HH.tailD); line(g, cx - 14, cy + 3 + pitch, cx - 14, cy - 1 + pitch, '#f0dcb0');
    ellipse(g, cx, cy, 6.4, 3.8, HH.b); ellipse(g, cx + 1, cy + 1, 4.4, 2.4, HH.breast); for (const bx of [cx - 2, cx, cx + 2, cx + 4]) px(g, bx, cy + 1, HH.bar); for (const bx of [cx - 1, cx + 1, cx + 3]) px(g, bx, cy + 3, HH.bar);
    ellipse(g, cx + 7, cy - 2 + pitch, 2.8, 2.4, HH.B); rect(g, cx + 6, cy - 4 + pitch, 3, 1, '#f0e6d0'); px(g, cx + 8, cy - 3 + pitch, eye); px(g, cx + 8, cy - 2 + pitch, HH.d); line(g, cx + 9, cy - 2 + pitch, cx + 11, cy - 1 + pitch, HH.beak); px(g, cx + 11, cy - 1 + pitch, HH.d);
    px(g, cx - 1, cy + 4, HH.jess); px(g, cx + 2, cy + 4, HH.jess); px(g, cx + 2, cy + 5, HH.bell); px(g, cx + 3, cy + 5, HH.bell); rect(g, cx - 1, cy + 4, 1, 3, HH.beak); rect(g, cx + 3, cy + 4, 1, 3, HH.beak); };
  const wing = (lift, back = 0) => { const tx = cx - 11 - back, ty = cy - lift;
    fillPoly(g, [[cx - 4, cy - 2], [cx + 4, cy - 2], [cx + 2, cy - 3 - lift * 0.7], [tx, ty]], HH.B); fillPoly(g, [[cx - 3, cy - 2], [cx + 3, cy - 2], [cx, cy - 2 - lift * 0.5], [tx + 5, ty + 1]], HH.b);
    for (let k = 0; k < 6; k++) line(g, tx + k * 2, ty + (k > 3 ? 2 : 0), tx + k * 2 + 1, ty + 4, HH.d); for (let x = tx + 2; x < cx - 1; x += 2) px(g, x, cy - 3 - Math.max(0, lift * 0.35), HH.bar); line(g, tx, ty, cx + 2, cy - 3 - lift * 0.7, '#f0dcb0'); };
  if (pose === 0) { body(); wing(9); wing(7, 3); }
  else if (pose === 1) { body(); wing(-2); fillPoly(g, [[cx - 4, cy - 1], [cx + 5, cy - 1], [cx + 10, cy + 4], [cx - 12, cy + 4]], HH.B); line(g, cx - 12, cy + 4, cx + 10, cy + 4, HH.d); for (let x = cx - 10; x < cx + 9; x += 3) px(g, x, cy + 3, HH.bar); }
  else if (pose === 2) { body(1); wing(6); fillPoly(g, [[cx - 2, cy - 1], [cx + 6, cy - 1], [cx + 9, cy + 3], [cx - 7, cy + 4]], HH.b); }
  else if (pose === 3) { body(2, '#ff4a3a'); fillPoly(g, [[cx - 6, cy], [cx + 4, cy - 1], [cx - 12, cy - 9]], HH.B); line(g, cx - 12, cy - 9, cx - 3, cy, HH.d); fillPoly(g, [[cx - 4, cy + 1], [cx + 2, cy + 1], [cx - 9, cy - 6]], HH.b); for (let k = 0; k < 3; k++) rect(g, cx + 4 + k, cy + 3, 1, 4, HH.beak); }
  else if (pose === 4) { body(-1, '#ffffff'); wing(9, 2); wing(-4); px(g, cx + 4, cy - 8, '#ffffff'); px(g, cx - 5, cy - 9, '#ffffff'); px(g, cx + 9, cy - 7, '#ffffff'); }
  else if (pose === 5 || pose === 7) { const p = canvas(1, 1); ellipse(g, cx, cy + 2, 4.6, 5.6, HH.b); ellipse(g, cx + 1, cy + 3, 3, 3.6, HH.breast); for (const by of [cy + 2, cy + 4, cy + 6]) { px(g, cx, by, HH.bar); px(g, cx + 2, by, HH.bar); } fillPoly(g, [[cx - 3, cy - 1], [cx - 6, cy + 8], [cx - 1, cy + 9]], HH.B); fillPoly(g, [[cx - 3, cy + 6], [cx - 6, cy + 13], [cx - 3, cy + 13]], HH.tail); ellipse(g, cx + 3, cy - 4, 2.6, 2.4, HH.B); rect(g, cx + 2, cy - 6, 3, 1, '#f0e6d0'); px(g, cx + 5, cy - 5, HH.eye); px(g, cx + 5, cy - 4, HH.d); line(g, cx + 6, cy - 4, cx + 8, cy - 3, HH.beak); rect(g, cx - 1, cy + 7, 1, 4, HH.beak); rect(g, cx + 2, cy + 7, 1, 4, HH.beak); px(g, cx + 1, cy + 11, HH.jess); px(g, cx, cy + 12, HH.bell); line(g, cx, cy + 11, cx - 2, cy + 17, HH.jess); line(g, cx + 2, cy + 11, cx + 5, cy + 16, HH.jess); px(g, cx + 5, cy + 16, HH.bell);
    if (pose === 7) { ellipse(g, cx + 3, cy - 4, 3.1, 2.9, '#8a2a22'); rect(g, cx + 1, cy - 7, 5, 1, '#c8483a'); rect(g, cx + 1, cy - 4, 5, 1, '#d9b04a'); px(g, cx + 5, cy - 5, '#5a1814'); px(g, cx + 5, cy - 4, '#5a1814'); line(g, cx + 3, cy - 7, cx + 1, cy - 11, HH.jess); px(g, cx + 1, cy - 11, '#c8281e'); px(g, cx + 2, cy - 10, '#e8dcb8'); line(g, cx - 1, cy - 4, cx - 3, cy - 2, '#5a1814'); } }
  else { body(2); wing(4, 1); wing(3, 4); px(g, cx + 9, cy - 5, '#ff4a3a'); }
  outline(c, '#1b1626'); return { c, ax: cx, ay: cy };
}

/* ================================================================ THE HAWK-MISTRESS: the falconer chief, facing right, 40 x 48, her feet on the last row (ax 20, ay 48; 16 x 30 hit box) */
const HMC = { coat: '#8a3a2a', coatHi: '#b85a3a', coatLo: '#5a1e18', trim: '#d9b04a', trimLo: '#8a6a22', skin: '#c89870', skinLo: '#98684a', wrap: '#1e2a5a', wrapHi: '#3a4a8a', wrapLo: '#121a3a', boot: '#2a1a10', bootHi: '#5a3a22', leather: '#5a3418', glove: '#c9a060', gloveHi: '#e8c080', stud: '#fff0a0', steel: '#d8dce8', steelHi: '#ffffff', steelLo: '#8a92a4', ivory: '#e8dcb8', whip: '#3a2418', kohl: '#1b1626', feather: '#e8dcb8', featherRed: '#c8281e' };
/* pose: { lean, crouch, legs: 'idle'|'walkA'|'walkB'|'wide'|'lunge'|'knee', front: arm key, back: arm key, head: 'up'|'down'|'turn', ... } - the figures are drawn from a few control points */
const POSES = {
  idle:    { lean: 0, dip: 0, legs: 'idle', front: 'glove', back: 'hip' },
  walkA:   { lean: 0, dip: 0, legs: 'walkA', front: 'glove', back: 'hip' },
  walkB:   { lean: 0, dip: 1, legs: 'walkB', front: 'glove', back: 'hip' },
  guard:   { lean: 2, dip: 2, legs: 'wide', front: 'gloveHigh', back: 'knifeLow' },
  lashTell:{ lean: -2, dip: 0, legs: 'wide', front: 'gloveUp', back: 'whipBack' },
  lash:    { lean: 3, dip: 1, legs: 'lunge', front: 'gloveBack', back: 'whipFwd' },
  feint:   { lean: 2, dip: 2, legs: 'knee', front: 'gloveUp', back: 'knifeLow' },
  cutTell: { lean: -1, dip: 2, legs: 'knee', front: 'gloveUp', back: 'knifeBack' },
  cut:     { lean: 4, dip: 3, legs: 'lunge', front: 'gloveBack', back: 'knifeFwd' },
  whistle: { lean: 0, dip: 0, legs: 'idle', front: 'gloveHigh', back: 'lips' },
  recover: { lean: 2, dip: 3, legs: 'knee', front: 'gloveDown', back: 'kneeHand' },
  sleep:   { lean: 3, dip: 14, legs: 'sit', front: 'fold', back: 'fold', head: 'down' },
  hurt:    { lean: -3, dip: 1, legs: 'wide', front: 'flail', back: 'flail', head: 'turn' },
  /* KEYFRAMED WINDUPS (claude/ksar2 part B): each told move is two or three poses the hands step through by how far into the tell she is */
  lashCoil:  { lean: -4, dip: 1, legs: 'wide', front: 'gloveHigh', back: 'whipLow' },          /* the lash: the whip drawn back low, the loop gathered */
  snareWind: { lean: -3, dip: 0, legs: 'wide', front: 'point', back: 'whipOver' },             /* the snare: the loop swung over her head, her glove pointing where it will fly */
  snareCast: { lean: 4, dip: 1, legs: 'lunge', front: 'gloveBack', back: 'whipHigh' },          /* the cast: the arm out long, the whip snaking away */
  fanDraw:   { lean: 1, dip: 2, legs: 'knee', front: 'gloveBack', back: 'fan0' },               /* the knife fan: the hand to the bandolier, three blades half out */
  fanHold:   { lean: -1, dip: 1, legs: 'wide', front: 'gloveHigh', back: 'fan' },              /* ...the three splayed in her fingers, high / mid / low */
  fanThrow:  { lean: 3, dip: 1, legs: 'lunge', front: 'gloveBack', back: 'openFwd' },          /* ...and thrown: the hand open, empty */
  kegSet:    { lean: 3, dip: 1, legs: 'kickBack', front: 'gloveHigh', back: 'hip' },           /* the keg kick: weight on the back foot, the front foot drawn back */
  kegKick:   { lean: -5, dip: 1, legs: 'kickFwd', front: 'flail', back: 'flail' },             /* ...and swung through, arms flung back for the balance */
  leapCrouch:{ lean: 2, dip: 5, legs: 'crouch', front: 'gloveBack', back: 'flail' },           /* the leap: coiled low... */
  leapAir:   { lean: 1, dip: -1, legs: 'tuck', front: 'gloveUp', back: 'flail' },              /* ...and in the air, knees up */
  whistleA:  { lean: 0, dip: 0, legs: 'idle', front: 'gloveHigh', back: 'lips' },              /* the whistle: two fingers to the lips */
  whistleB:  { lean: -1, dip: 0, legs: 'idle', front: 'gloveHigh', back: 'pointFwd', head: 'up' },   /* ...and the arm thrown out to send the hawk */
  tauntA:    { lean: 2, dip: 1, legs: 'wide', front: 'glove', back: 'beckon' },                /* her idle: a beckoning hand ('come on') */
  tauntB:    { lean: -1, dip: 0, legs: 'idle', front: 'glove', back: 'hip' },                  /* ...the chin up, her hand on her hip */
  stroke:    { lean: 0, dip: 0, legs: 'idle', front: 'glove', back: 'stroke' },                /* ...and a smoothing hand to the hawk on her glove */
};
export const MISTRESS_POSES = Object.keys(POSES);
export function bakeMistress(name) {
  const P = POSES[name] || POSES.idle, W = 44, H = 48, [c, g] = canvas(W, H), cx = 20, fy = 47, dip = P.dip, lean = P.lean;
  const hipY = fy - 12 + dip, hipX = cx, shY = hipY - 12 + (dip > 8 ? 4 : 0), shX = cx + lean * 0.7, headY = shY - 6, headX = shX + (P.head === 'down' ? 1 : 0.6);
  const L2 = (x0, y0, x1, y1, col, th = 2) => { const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy)); for (let i = 0; i <= n; i++) { const t = n ? i / n : 0, x = Math.round(x0 + dx * t), y = Math.round(y0 + dy * t); rect(g, x, y, th, th, col); } };
  /* legs */
  const legs = { idle: [[-2, 0, 0], [2, 0, 0]], walkA: [[-4, 0, 3], [3, -1, -2]], walkB: [[-3, -1, -1], [4, 0, 3]], wide: [[-5, 0, 0], [5, 0, 0]], lunge: [[-7, 0, -1], [6, 0, 3]], knee: [[-5, 0, 0], [4, -4, 2]], sit: [[-5, 0, 6], [4, -3, 8]], kickBack: [[-4, 0, 0], [3, -3, -10, 5]], kickFwd: [[-6, 0, -1], [5, -2, 13, 4]], tuck: [[-3, -6, -1, 6], [3, -7, 2, 7]], crouch: [[-6, -3, -2], [5, -4, 4]] }[P.legs];
  const leg = (dx, kneeUp, foot, back, lift = 0) => { const kx = hipX + dx * 0.6 + (foot ? foot * 0.2 : 0), ky = hipY + 5 + kneeUp, fx = hipX + dx + foot * 0.4, fyy = (P.legs === 'sit' ? fy - 2 : fy - 1) - lift;
    L2(hipX + dx * 0.2, hipY + 2, kx, ky, back ? '#3a1410' : '#6a2a1e', 3); L2(kx, ky, fx, fyy - 3, back ? '#1a0e08' : HMC.boot, 3); rect(g, fx - 1, fyy - 3, 5, 3, back ? '#1a0e08' : HMC.boot); rect(g, fx - 1, fyy - 3, 5, 1, back ? '#3a2616' : HMC.bootHi); };
  leg(legs[0][0], legs[0][1], legs[0][2], true, legs[0][3] || 0); leg(legs[1][0], legs[1][1], legs[1][2], false, legs[1][3] || 0);
  /* the long coat: a trapezoid from shoulders to the knees with a split skirt and a gold hem */
  const top = shY - 1, bot = hipY + 4 + (dip > 8 ? -1 : 0), wsh = 5, wbt = 6;
  fillPoly(g, [[shX - wsh, top], [shX + wsh, top], [hipX + wbt + lean * 0.3, bot], [hipX - wbt, bot]], HMC.coat);
  fillPoly(g, [[shX + 1, top], [shX + wsh, top], [hipX + wbt + lean * 0.3, bot], [hipX + 2, bot]], HMC.coatHi); fillPoly(g, [[shX - wsh, top], [shX - 3, top], [hipX - 3, bot], [hipX - wbt, bot]], HMC.coatLo);
  for (let x = hipX - wbt; x <= hipX + wbt + lean * 0.3; x++) { px(g, x, bot, HMC.trim); } for (let y = top; y < bot; y += 2) px(g, Math.round(shX + (hipX - shX) * (y - top) / (bot - top)), y, HMC.trimLo);   /* gold hem and a placket */
  rect(g, hipX - 6, hipY - 1, 13, 2, HMC.leather); rect(g, hipX - 6, hipY - 1, 13, 1, '#8a5a32'); rect(g, hipX - 1, hipY - 1, 3, 2, HMC.trim);   /* the belt and its brass buckle */
  /* the whip coil and the knife's sheath on the belt */
  circle(g, hipX - 5, hipY + 2, 2.4, HMC.whip); circle(g, hipX - 5, hipY + 2, 1.2, HMC.coatLo); px(g, hipX - 6, hipY + 1, '#6a4a2a'); line(g, hipX + 4, hipY, hipX + 7, hipY + 5, HMC.leather, 2); px(g, hipX + 4, hipY, HMC.ivory);
  /* the high collar and the wrapped head */
  rect(g, shX - 4, shY - 3, 9, 3, HMC.coatLo); rect(g, shX - 4, shY - 3, 9, 1, HMC.trim);
  const hd = P.head === 'down' ? 2 : 0;
  ellipse(g, headX, headY + hd, 4.4, 4.6, HMC.skin); rect(g, headX - 4, headY - 1 + hd, 9, 5, HMC.skin); rect(g, headX - 4, headY + 3 + hd, 9, 2, HMC.wrapLo); rect(g, headX - 4, headY + 3 + hd, 9, 1, HMC.wrapHi);   /* a veil over the lower face */
  px(g, headX + 2, headY + hd, HMC.kohl); px(g, headX + 3, headY + hd, '#ffe070'); px(g, headX + 1, headY - 1 + hd, HMC.kohl); px(g, headX + 3, headY - 1 + hd, HMC.kohl);   /* kohl-lined eye */
  fillPoly(g, [[headX - 5, headY - 1 + hd], [headX + 5, headY - 2 + hd], [headX + 4, headY - 6 + hd], [headX - 1, headY - 8 + hd], [headX - 5, headY - 5 + hd]], HMC.wrap); rect(g, headX - 5, headY - 3 + hd, 10, 1, HMC.wrapHi); rect(g, headX - 5, headY - 2 + hd, 10, 1, HMC.trim);
  fillPoly(g, [[headX - 5, headY - 4 + hd], [headX - 9, headY + 2 + hd], [headX - 8, headY + 7 + hd], [headX - 4, headY + 1 + hd]], HMC.wrap); px(g, headX - 8, headY + 5 + hd, HMC.wrapLo); px(g, headX - 7, headY + 3 + hd, HMC.wrapHi);   /* the wrap's tail */
  line(g, headX - 1, headY - 8 + hd, headX + 1, headY - 12 + hd, HMC.feather); px(g, headX + 1, headY - 12 + hd, HMC.featherRed); px(g, headX, headY - 10 + hd, HMC.featherRed);   /* a feather in the wrap */
  /* arms: the GLOVED arm (her hawk's) is the near arm; the other is the back arm with the whip or the knife */
  const sh = [shX + 2, shY + 1], bk = [shX - 3, shY + 1];
  const hand = (x, y, col) => { rect(g, x - 1, y - 1, 3, 3, col); };
  const gl = k => { const t = { glove: [sh[0] + 4, sh[1] + 6], gloveUp: [sh[0] + 8, sh[1] - 2], gloveHigh: [sh[0] + 6, sh[1] - 10], gloveBack: [sh[0] - 7, sh[1] + 5], point: [sh[0] + 11, sh[1] + 1], gloveDown: [sh[0] + 4, sh[1] + 10], fold: [sh[0] + 3, sh[1] + 8], flail: [sh[0] + 7, sh[1] - 5] }[k] || [sh[0] + 4, sh[1] + 6];
    L2(sh[0], sh[1], (sh[0] + t[0]) / 2 + (k === 'gloveUp' ? 2 : 0), (sh[1] + t[1]) / 2 + 1, HMC.coat, 3); L2((sh[0] + t[0]) / 2, (sh[1] + t[1]) / 2 + 1, t[0], t[1], HMC.leather, 3); rect(g, t[0] - 2, t[1] - 2, 5, 5, HMC.glove); rect(g, t[0] - 2, t[1] - 2, 5, 1, HMC.gloveHi); px(g, t[0], t[1], HMC.stud); px(g, t[0] - 2, t[1] + 2, HMC.stud); rect(g, t[0] - 2, t[1] + 3, 5, 1, HMC.leather); return t; };
  const arm = k => { const t = { hip: [bk[0] - 1, bk[1] + 7], whipBack: [bk[0] - 8, bk[1] - 10], whipFwd: [bk[0] + 16, bk[1] + 3], knifeLow: [bk[0] + 4, bk[1] + 9], knifeBack: [bk[0] - 7, bk[1] + 6], knifeFwd: [bk[0] + 17, bk[1] + 4], lips: [headX + 2, headY + 5 + hd], kneeHand: [bk[0] + 3, bk[1] + 11], fold: [bk[0] + 4, bk[1] + 8], flail: [bk[0] - 8, bk[1] - 3], whipLow: [bk[0] - 7, bk[1] + 9], whipOver: [bk[0] - 2, bk[1] - 13], whipHigh: [bk[0] + 17, bk[1] - 2], fan0: [bk[0] + 4, bk[1] + 6], fan: [bk[0] + 6, bk[1] - 4], openFwd: [bk[0] + 16, bk[1] + 1], pointFwd: [bk[0] + 14, bk[1] - 3], beckon: [bk[0] + 12, bk[1] + 3], stroke: [sh[0] + 5, sh[1] + 5] }[k] || [bk[0], bk[1] + 7];
    L2(bk[0], bk[1], (bk[0] + t[0]) / 2, (bk[1] + t[1]) / 2 + 1, HMC.coatLo, 3); L2((bk[0] + t[0]) / 2, (bk[1] + t[1]) / 2 + 1, t[0], t[1], HMC.coatLo, 3); hand(t[0], t[1], HMC.skin);
    if (k === 'whipBack') { line(g, t[0], t[1], t[0] - 2, t[1] - 4, HMC.whip); line(g, t[0] - 2, t[1] - 4, t[0] + 3, t[1] - 8, HMC.whip); circle(g, t[0] + 3, t[1] - 8, 2, HMC.whip); }
    if (k === 'whipFwd') { line(g, t[0], t[1], t[0] + 6, t[1] + 2, HMC.whip); }
    if (k === 'whipLow') { circle(g, t[0] - 1, t[1] + 3, 3, HMC.whip); circle(g, t[0] - 1, t[1] + 3, 1.5, HMC.coatLo); line(g, t[0], t[1], t[0] - 6, t[1] + 6, HMC.whip); }
    if (k === 'whipOver') { circle(g, t[0], t[1] - 5, 4, HMC.whip); circle(g, t[0], t[1] - 5, 2, '#c89870'); line(g, t[0], t[1] - 1, t[0] - 7, t[1] - 4, HMC.whip); px(g, t[0] + 4, t[1] - 8, '#e8e0c0'); }
    if (k === 'whipHigh') { line(g, t[0], t[1], t[0] + 5, t[1] - 2, HMC.whip); px(g, t[0] + 6, t[1] - 3, '#e8e0c0'); }
    if (k === 'fan0') { for (let i = 0; i < 3; i++) { rect(g, t[0] - 1 + i * 2, t[1] - 3 - (i & 1), 2, 3, HMC.ivory); rect(g, t[0] + i * 2, t[1] - 5 - (i & 1), 1, 2, HMC.steelHi); } }
    if (k === 'fan') { for (const [dx, dy] of [[9, -9], [11, -1], [9, 7]]) { line(g, t[0] + 1, t[1], t[0] + dx, t[1] + dy, HMC.steel, 1); px(g, t[0] + dx, t[1] + dy, HMC.steelHi); px(g, t[0] + dx - 1, t[1] + dy + (dy < 0 ? 1 : dy > 3 ? -1 : 0), HMC.steelLo); } rect(g, t[0] - 2, t[1] - 1, 3, 3, HMC.ivory); }
    if (k === 'openFwd') { for (let i = 0; i < 3; i++) px(g, t[0] + 3 + i, t[1] + i - 2, HMC.skin); line(g, t[0] - 6, t[1] + 1, t[0] - 11, t[1] + 1, '#fff0d0'); line(g, t[0] - 6, t[1] - 2, t[0] - 10, t[1] - 3, '#c9d1dc'); }
    if (k === 'pointFwd') { line(g, t[0], t[1], t[0] + 5, t[1] - 1, HMC.skin, 1); px(g, t[0] + 6, t[1] - 1, HMC.skin); }
    if (k === 'beckon') { px(g, t[0] + 2, t[1] - 2, HMC.skin); px(g, t[0] + 3, t[1] - 3, HMC.skin); px(g, t[0] + 3, t[1] - 4, HMC.skin); px(g, t[0] + 2, t[1] - 4, HMC.skin); px(g, t[0] + 1, t[1] + 2, HMC.gloveHi); }
    if (k.startsWith('knife')) { const f = k === 'knifeFwd' ? 1 : k === 'knifeBack' ? -1 : 0.4; const kx = t[0] + Math.round(f * 11), ky = t[1] - (k === 'knifeBack' ? 7 : k === 'knifeFwd' ? 1 : 3);
      rect(g, t[0] - 1, t[1] - 1, 3, 3, HMC.ivory); line(g, t[0] + 1, t[1], kx, ky, HMC.steel, 1); line(g, t[0] + 1, t[1] - 1, kx - 1, ky - 1, HMC.steelHi, 1); px(g, kx, ky - 1, HMC.steelHi); px(g, kx + 1, ky, HMC.steelLo); }
    return t; };
  arm(P.back); gl(P.front);
  if (P.front === 'gloveUp' || P.front === 'gloveHigh' || P.front === 'glove') { /* her hawk sits on the glove only when it is home: drawn by the hands, not baked */ }
  outline(c, '#1b1626'); return c;
}
export function bakeMistressSet() { const R = MISTRESS_POSES.map(bakeMistress); return { names: MISTRESS_POSES, R, L: R.map(c => flipX(c)), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax: 20, ay: 47, w: 16, h: 30 }; }
/* a bestiary card for her (the card reads SPR.hawkmistress.R[0]): the guard pose */
export function bakeHawkMistressCard() { const f = [bakeMistress('guard'), bakeMistress('idle')]; return pack(f, 20, 47, 16, 30); }
/* the Hawk-Mistress's far banner emblem is drawn by ksar_set.js */

/* every set at once (main.js: for (const k in K) SPR[k] = K[k]) */
export function bakeKsarSets(SPR) {
  const out = { hawkscout: bakeHawk(), hawkmistress: bakeHawkMistressCard() };
  const add = (k, v) => { if (v) out[k] = v; };
  add('ksarblade', bakeKsarBlade(SPR.cutthroat)); add('gonglookout', bakeGongLookout(SPR.cutthroat)); add('whipapprentice', bakeWhipApprentice(SPR.cutthroat));
  add('shieldsentry', bakeShieldSentry(SPR.shieldguard || SPR.shield)); add('smokethrower', bakeSmokeThrower(SPR.dynamiter || SPR.sapper)); add('wallslinger', bakeWallSlinger(SPR.slinger));
  return out;
}
/* a contact sheet list for tools/ksar-art-sheet.mjs: the bases and the skins, then the hawks and the Mistress */
export async function sheetItems() {
  const CB = await import('./caravan_bandits.js'), DF2A = await import('./desert_foes2.js'), out = [];
  const cu = CB.bakeCutthroat(), sl = CB.bakeSlinger(), sh = DF2A.bakeShieldGuard(), dy = DF2A.bakeDynamiter();
  for (const [b, s] of [[cu, bakeKsarBlade(cu)], [cu, bakeGongLookout(cu)], [cu, bakeWhipApprentice(cu)], [sh, bakeShieldSentry(sh)], [dy, bakeSmokeThrower(dy)], [sl, bakeWallSlinger(sl)]]) out.push(...b.R.slice(0, 5), ...s.R.slice(0, 5));
  out.push(...bakeHawk().R); for (let i = 0; i < 8; i++) out.push(bakeHerHawk(i).c); out.push(...MISTRESS_POSES.map(bakeMistress)); return out;
}
