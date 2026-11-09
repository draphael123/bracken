// bones_art.js - SKELETON SOLDIER, ARCHER and MAGE (claude/beastsbones): PALETTE-BLOCK PLACEHOLDERS in the right silhouettes. ONE human-size body (10x20 hit box, a 30x29 cell) shared by
// three kits: grave-brown bone, rusted mail scraps, dark sockets with a faint green ember. The art lane redraws them to the Frog King bar (plan section 4: body 8 frames + soldier 5,
// archer 4, mage 6). Same contract as hornsman_art.js: every frame faces RIGHT (L is the flip), one canvas size per sprite, ax = centre column, ay = the row under the lowest pixel.
// The LAST frame is the collapse heap (HAS_HURT): the frame before it is the hurt flash.
//   skelsoldier 0,1 idle | 2-5 walk | 6 THRUST TELL (sword drawn back over the rim) | 7 THRUST | 8 RUSH TELL (shield low, set) | 9 RUSH | 10 guard knocked aside / parried (arm wide) | 11 hurt | 12 heap
//   skelarcher  0,1 idle | 2-5 walk | 6 AIM TELL (full draw) | 7 LOOSE | 8 VOLLEY TELL (bow raised high) | 9 VOLLEY LOOSE | 10 hurt | 11 heap
//   skelmage    0,1 idle | 2-5 walk | 6 WISP TELL (skull orb forms) | 7 CAST | 8 GRAVE TELL (kneels, palm to floor) | 9 GRAVE CAST | 10 BACKSTEP puff (blink out) | 11 blink in | 12 hurt | 13 heap
import { canvas, rect, line, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleFrame(c); });

export const BONE_PAL = { bone: '#b8a888', boneL: '#e0d4b8', boneD: '#7a6c52', socket: '#1a1410', ember: '#7cdc8c', mail: '#7a5a3a', mailL: '#a07848', iron: '#6a707e', wood: '#6e4a2a', cloth: '#4a3a52', clothL: '#6a5478', glow: '#9ff0c0' };

/* the shared body: skull, ribcage, pelvis, limbs. o: { lean, step (0/1/2 walk phase), crouch, glow } */
function body(g, o = {}) {
  const P = BONE_PAL, cx = 11, lean = o.lean || 0, cr = o.crouch || 0, st = o.step || 0;
  const top = 8 + cr, hip = 20 + cr;
  const lA = st === 1 ? 2 : st === 2 ? -2 : 0;
  rect(g, cx - 3 + lA, hip, 2, 7 - cr, P.bone); rect(g, cx + 1 - lA, hip, 2, 7 - cr, P.bone); rect(g, cx - 4 + lA, 26, 4, 1, P.boneD); rect(g, cx + 1 - lA, 26, 4, 1, P.boneD);
  rect(g, cx - 3, hip - 2, 6, 3, P.boneD); rect(g, cx - 1 + lean, top + 3, 2, hip - top - 4, P.bone);
  for (let i = 0; i < 3; i++) rect(g, cx - 3 + lean, top + 2 + i * 2, 7, 1, i === 0 ? P.boneL : P.bone);
  rect(g, cx - 4 + lean, top + 1, 2, 2, P.mail);
  rect(g, cx - 2 + lean, top - 6, 5, 5, P.boneL); rect(g, cx - 2 + lean, top - 2, 4, 1, P.bone); rect(g, cx - 1 + lean, top - 4, 1, 1, P.socket); rect(g, cx + 1 + lean, top - 4, 1, 1, P.socket);
  rect(g, cx + 1 + lean, top - 4, 1, 1, o.glow ? P.glow : P.ember);
  return { cx, top, hip, lean };
}
const arm = (g, ax, ay, bx, by, col = '#b8a888') => line(g, ax, ay, bx, by, col, 1);

export function bakeSkeletonSoldier() {
  const P = BONE_PAL, W = 30, H = 29;
  const F = frames(W, H, 13, (g, f) => {
    if (f === 12) { rect(g, 6, 24, 16, 3, P.bone); rect(g, 8, 22, 6, 2, P.boneL); rect(g, 15, 21, 4, 3, P.boneL); rect(g, 12, 26, 8, 1, P.boneD); rect(g, 5, 25, 3, 2, P.mail); return; }
    const walk = f >= 2 && f <= 5, st = walk ? [1, 0, 2, 0][f - 2] : 0;
    const b = body(g, { step: st, lean: f === 11 ? -2 : f === 7 ? 2 : 0, crouch: f === 8 || f === 9 ? 3 : 0, glow: f === 6 || f === 8 });
    const shield = (x, y, w, h) => { rect(g, x, y, w, h, P.iron); rect(g, x, y, w, 1, '#c8ccd4'); rect(g, x + Math.floor(w / 2), y + 1, 1, h - 2, '#d8b040'); rect(g, x, y + h - 1, w, 1, '#3a3e4c'); };
    const sword = (x, y, len, up) => { line(g, x, y, x + len, up ? y - Math.abs(len) : y, '#c8ccd4', 1); rect(g, x - 1, y - 1, 2, 3, P.wood); };
    if (f === 6) { shield(b.cx + 3, b.top - 1, 5, 9); sword(b.cx - 2, b.top + 2, -6, false); arm(g, b.cx - 3, b.top + 3, b.cx - 5, b.top + 3); }
    else if (f === 7) { shield(b.cx + 2, b.top, 4, 8); sword(b.cx + 3, b.top + 3, 11, false); arm(g, b.cx + 2, b.top + 3, b.cx + 5, b.top + 3); }
    else if (f === 8) { shield(b.cx + 3, b.top + 5, 6, 8); sword(b.cx - 3, b.top + 5, -5, false); }
    else if (f === 9) { shield(b.cx + 4, b.top + 5, 6, 8); rect(g, b.cx - 9, b.top + 8, 3, 1, '#8a7a5a'); rect(g, b.cx - 12, b.top + 10, 2, 1, '#8a7a5a'); }
    else if (f === 10) { shield(b.cx - 6, b.top + 2, 5, 8); sword(b.cx + 2, b.top + 3, 5, true); arm(g, b.cx - 3, b.top + 3, b.cx - 7, b.top + 4); }
    else { shield(b.cx + 3, b.top, 5, 10); sword(b.cx - 2, b.top + 3, -4, true); arm(g, b.cx - 3, b.top + 3, b.cx - 5, b.top + 1); }
  });
  return pack(F, 11, H - 1, 10, 20);
}

export function bakeSkeletonArcher() {
  const P = BONE_PAL, W = 30, H = 29;
  const F = frames(W, H, 12, (g, f) => {
    if (f === 11) { rect(g, 6, 24, 16, 3, P.bone); rect(g, 8, 22, 6, 2, P.boneL); rect(g, 15, 21, 4, 3, P.boneL); rect(g, 12, 26, 8, 1, P.boneD); return; }
    const walk = f >= 2 && f <= 5, st = walk ? [1, 0, 2, 0][f - 2] : 0;
    const b = body(g, { step: st, lean: f === 10 ? -2 : 0, glow: f === 6 || f === 8 });
    const bow = (x, y, h) => { for (let i = 0; i < h; i++) rect(g, x + Math.round(Math.sin(i / (h - 1) * Math.PI) * 3), y + i, 1, 1, P.wood); line(g, x, y, x, y + h - 1, '#d8d0b8', 1); };
    if (f === 6) { bow(b.cx + 6, b.top - 2, 12); arm(g, b.cx - 1, b.top + 3, b.cx + 6, b.top + 4); arm(g, b.cx - 3, b.top + 3, b.cx - 6, b.top + 4); line(g, b.cx - 6, b.top + 4, b.cx + 6, b.top + 4, '#d8d0b8', 1); rect(g, b.cx + 7, b.top + 3, 4, 1, P.glow); }
    else if (f === 7) { bow(b.cx + 6, b.top - 2, 12); arm(g, b.cx - 1, b.top + 3, b.cx + 6, b.top + 4); arm(g, b.cx - 3, b.top + 3, b.cx - 3, b.top + 5); rect(g, b.cx + 8, b.top + 4, 6, 1, '#d8d0b8'); }
    else if (f === 8) { bow(b.cx + 4, b.top - 12, 12); arm(g, b.cx - 1, b.top + 3, b.cx + 4, b.top - 4); arm(g, b.cx - 3, b.top + 3, b.cx - 3, b.top - 3); }
    else if (f === 9) { bow(b.cx + 4, b.top - 12, 12); arm(g, b.cx - 1, b.top + 3, b.cx + 4, b.top - 4); arm(g, b.cx - 3, b.top + 3, b.cx - 1, b.top + 4); }
    else { bow(b.cx + 5, b.top, 12); arm(g, b.cx - 1, b.top + 3, b.cx + 5, b.top + 5); arm(g, b.cx - 3, b.top + 3, b.cx - 4, b.top + 7); }
  });
  return pack(F, 11, H - 1, 10, 20);
}

export function bakeSkeletonMage() {
  const P = BONE_PAL, W = 30, H = 29;
  const F = frames(W, H, 14, (g, f) => {
    if (f === 13) { rect(g, 6, 24, 16, 3, P.cloth); rect(g, 8, 22, 6, 2, P.boneL); rect(g, 15, 21, 4, 3, P.boneL); rect(g, 12, 26, 8, 1, P.boneD); rect(g, 4, 25, 12, 1, P.wood); return; }
    const walk = f >= 2 && f <= 5, st = walk ? [1, 0, 2, 0][f - 2] : 0, kneel = f === 8 || f === 9;
    const b = body(g, { step: st, lean: f === 12 ? -2 : 0, crouch: kneel ? 5 : 0, glow: f === 6 || f === 7 || kneel });
    rect(g, b.cx - 4, b.top + 7, 8, 8, P.cloth); rect(g, b.cx - 4, b.top + 7, 8, 1, P.clothL); rect(g, b.cx - 3, b.top + 15, 2, 2, P.cloth);
    const staff = (x, y, h) => { rect(g, x, y, 1, h, P.bone); rect(g, x - 1, y - 3, 3, 3, P.boneL); rect(g, x - 1, y - 2, 1, 1, P.socket); rect(g, x + 1, y - 2, 1, 1, P.socket); rect(g, x, y - 2, 1, 1, P.glow); };
    if (f === 6) { staff(b.cx + 7, b.top, 16); arm(g, b.cx - 1, b.top + 3, b.cx + 7, b.top + 5); rect(g, b.cx + 3, b.top - 10, 5, 5, P.glow); rect(g, b.cx + 4, b.top - 9, 3, 3, '#ffffff'); }
    else if (f === 7) { staff(b.cx + 7, b.top - 2, 18); arm(g, b.cx - 1, b.top + 3, b.cx + 7, b.top); rect(g, b.cx + 10, b.top - 6, 6, 6, P.glow); rect(g, b.cx + 11, b.top - 5, 4, 4, '#ffffff'); }
    else if (f === 8) { staff(b.cx - 5, b.top + 5, 14); arm(g, b.cx - 1, b.top + 3, b.cx + 6, b.top + 11); rect(g, b.cx + 4, b.top + 12, 8, 1, P.glow); }
    else if (f === 9) { staff(b.cx - 5, b.top + 5, 14); arm(g, b.cx - 1, b.top + 3, b.cx + 6, b.top + 11); for (let i = 0; i < 3; i++) rect(g, b.cx + 8 + i * 4, b.top + 6 - i, 2, 6 + i, P.boneL); }
    else if (f === 10) { for (let i = 0; i < 6; i++) rect(g, b.cx - 5 + (i * 7) % 11, b.top - 6 + i * 4, 2, 2, P.glow); }
    else if (f === 11) { staff(b.cx + 6, b.top + 2, 14); arm(g, b.cx - 1, b.top + 3, b.cx + 6, b.top + 6); for (let i = 0; i < 4; i++) rect(g, b.cx - 6 + (i * 5) % 12, b.top + 4 + i * 4, 2, 1, P.glow); }
    else { staff(b.cx + 6, b.top + 2, 15); arm(g, b.cx - 1, b.top + 3, b.cx + 6, b.top + 6); }
  });
  return pack(F, 11, H - 1, 10, 20);
}
