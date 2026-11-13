// whale_back.js - THE WHALE's BACKDROP (claude/seaart2, 2026-11-12): what you see through the air of the whale's inside - behind every tile, behind every foe. Opaque (it replaces the reef sky/far/mid the
// level would otherwise show), drawn from src/main.js's backdrop chain by ONE flag-guarded hook (WHH.drawBackdrop, only when L.whale and the Whale flag is on), so every other level and flag OFF are untouched.
//   per SECTION (src/redraw/whale_art.js sectionOf): a vertical wall of that section's flesh in 8 dark bands + the section's own far shapes, parallax-laid on the camera:
//   maw      far gums and a ridge of pale teeth hanging from the roof, the throat's dark ahead          | tongue   rose dusk, the roof's hanging uvula and soft palate folds
//   gullet   rings of throat muscle receding in the distance (concentric bands closing to a black point) | stomach  brown wall, acid mist banked at the bottom, slow bubbles rising, drip lines
//   rib      a CAGE of great curved bone ribs on the far side (the near ribs are tiles), a pale light slit between them | heart  the chamber's red dark with a pulsing glow and far coronary vessels
//   every section: light shafts (faint pale beams slanting from the roof, drifting), motes of plankton, a dark vignette at the top. Pure fillRect.
import { WCOL as C, sectionOf } from './whale_art.js';
const R = Math.round;
const hash = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; };
const rect = (g, x, y, w, h, c, a = 1) => { if (a !== 1) g.globalAlpha = a; g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); if (a !== 1) g.globalAlpha = 1; };
/* the wall: [top, bottom] colours of the 8 bands, dark to darker toward the bottom (the bile and acid pool there) */
export const WALL = {
  maw:     ['#3a1220', '#2a0c18'], tongue: ['#4a1a28', '#2e0e1a'], gullet: ['#3a1220', '#220a14'],
  stomach: ['#3a2418', '#241410'], rib:    ['#2a0e18', '#1a0810'], heart:  ['#3a0a14', '#240810'],
};
const mixHex = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => R(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
function wall(g, VW, VH, sec) { const [c0, c1] = WALL[sec]; const n = 12; for (let i = 0; i < n; i++) rect(g, 0, R(i * VH / n), VW, R(VH / n) + 1, mixHex(c0, c1, i / (n - 1))); }
/* one great rib: an arc from (x, top) bowing outward, thickness th, bone-coloured with a lit edge */
function rib(g, x, top, hgt, bow, th, alpha) {
  const n = Math.max(8, R(hgt / 3));
  for (let i = 0; i <= n; i++) { const k = i / n, y = top + k * hgt, xx = x + Math.sin(k * Math.PI) * bow, w = th * (1 - 0.35 * k);
    rect(g, xx - 1, y, w + 2, 4, C.bone[0], alpha * 0.7); rect(g, xx, y, w, 4, C.bone[1], alpha); rect(g, xx, y, 1.5, 4, C.bone[3], alpha * 0.6); }
}
export function drawBackdrop(g, cx, cy, VW, VH, t = 0, sec) {
  sec = sec || sectionOf(Math.floor((cx + VW / 2) / 16));
  wall(g, VW, VH, sec);
  const dy = Math.max(-40, Math.min(40, (cy - 20 * 16) * 0.08));   /* the camera's climb moves the far shapes a little */
  /* ---- the section's far shapes ---- */
  if (sec === 'maw') {
    for (let k = -1; k < 9; k++) { const x = R(k * 44 - ((cx * 0.18) % 44) + 4), l = 22 + hash(k + R(cx * 0.18 / 44), 3) % 12; rect(g, x, 0, 20, 10 - dy * 0.1, C.gum[0], 0.9);
      for (let j = 0; j < 3; j++) { const tx = x + 3 + j * 6; rect(g, tx, 10, 4, l - j * 5, C.pale[1], 0.55); rect(g, tx, 10, 1, l - j * 5, C.pale[3], 0.5); rect(g, tx + 1, 10 + l - j * 5, 2, 3, C.pale[0], 0.5); } }
    rect(g, 0, VH - 36, VW, 36, C.flesh[0], 0.4);
  } else if (sec === 'tongue') {
    for (let k = -1; k < 6; k++) { const x = R(k * 70 - ((cx * 0.14) % 70)), w = 26 + hash(k + R(cx * 0.14 / 70), 5) % 14, d = 20 + hash(k + R(cx * 0.14 / 70), 8) % 26;
      rect(g, x, 0, w, d + 4, C.flesh[1], 0.55); rect(g, x + 3, d + 4, w - 6, 8, C.flesh[2], 0.5); rect(g, x + 6, d + 12, w - 12, 5, C.flesh[3], 0.45); rect(g, x + w - 4, 0, 2, d, C.pale[0], 0.3); }
  } else if (sec === 'gullet') {
    const mx = VW * 0.62 - (cx * 0.05) % 20, my = VH * 0.5 - dy * 0.3;
    for (let i = 9; i >= 1; i--) { const rw = i * 38, rh = i * 24, c = mixHex(C.flesh[0], C.flesh[2], 1 - i / 9), a = 0.55;
      rect(g, mx - rw / 2, my - rh / 2, rw, rh, c, 0.18); rect(g, mx - rw / 2, my - rh / 2, rw, 2, C.sheen, 0.08 + (9 - i) * 0.01); rect(g, mx - rw / 2, my + rh / 2 - 2, rw, 2, C.flesh[0], a * 0.5); }
    rect(g, mx - 14, my - 9, 28, 18, '#0a0206');
  } else if (sec === 'stomach') {
    for (let k = 0; k < 7; k++) { const x = R(k * 61 - ((cx * 0.2) % 61)) + 10, h0 = 20 + hash(k + R(cx * 0.2 / 61), 4) % 40; rect(g, x, 0, 2, h0, C.stomach[1], 0.6); rect(g, x - 1, h0, 4, 4, C.acid[1], 0.6); rect(g, x, h0 + 1, 2, 2, C.acid[2], 0.6); }   /* drip lines */
    for (let b = 0; b < 12; b++) { const hb = hash(b, 21), x = R((hb % VW) - cx * 0.12 + VW * 4) % VW, y = VH - ((t * (6 + hb % 7) + hb % 97) % (VH * 0.8)); rect(g, x, y, 2, 2, C.acid[2], 0.35); rect(g, x, y, 1, 1, C.acid[3], 0.5); }
    for (let i = 0; i < 6; i++) rect(g, 0, VH - 14 + i * 3, VW, 3, C.acid[0], 0.1 + i * 0.05 + 0.03 * Math.sin(t * 1.3 + i));   /* the acid mist banked at the bottom */
  } else if (sec === 'rib') {
    const sp = 52, off = (cx * 0.25) % sp;
    for (let k = -1; k < VW / sp + 2; k++) { const x = k * sp - off, hk = hash(k + R(cx * 0.25 / sp), 2); rib(g, x, -12 - dy * 0.3, VH * 1.2, 20 + hk % 8, 7, 0.55); }
    rect(g, VW * 0.15, VH * 0.4, VW * 0.7, 3, C.glow, 0.05);
  } else {   /* heart */
    const pul = 0.5 + 0.5 * Math.sin(t * 5.2) ** 6, gx = VW * 0.7, gy = VH * 0.45;
    for (let i = 6; i >= 1; i--) { const r = i * 34; rect(g, gx - r, gy - r * 0.7, r * 2, r * 1.4, C.heart[2], (0.04 + 0.02 * pul) * (7 - i) * 0.5); }
    for (let k = 0; k < 5; k++) { const x0 = R(k * 83 - ((cx * 0.2) % 83)); for (let y = 0; y < VH; y += 4) rect(g, x0 + Math.sin(y * 0.05 + k * 2) * 6, y, 3, 4, k & 1 ? C.vein[1] : C.heart[1], 0.5); }
  }
  /* ---- light shafts: faint beams slanting from the roof ---- */
  for (let k = 0; k < 4; k++) { const hk = hash(k, 77), x0 = R(((hk % (VW + 80)) - cx * 0.1 + t * (2 + k)) % (VW + 120)) - 40, w = 8 + hk % 10, a = (sec === 'rib' ? 0.07 : 0.045) * (0.7 + 0.3 * Math.sin(t * 0.7 + k * 2));
    for (let y = 0; y < VH; y += 6) rect(g, x0 + y * 0.35, y, w + y * 0.08, 6, C.glow, a * (1 - y / VH)); }
  /* ---- motes of plankton ---- */
  for (let k = 0; k < 14; k++) { const hk = hash(k, 5), x = R(((hk % VW) - cx * 0.35 + t * (3 + hk % 4)) % VW + VW) % VW, y = (hk >> 8) % VH + Math.sin(t * 0.8 + k) * 3; rect(g, x, y, 1, 1, C.sheen, 0.25 + 0.15 * ((hk >> 4) & 1)); }
  /* ---- the roof's dark ---- */
  for (let i = 0; i < 4; i++) rect(g, 0, i * 6, VW, 6, '#0a0206', 0.32 - i * 0.07);
}
