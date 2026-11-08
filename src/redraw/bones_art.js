// bones_art.js - THE SKELETON SET (claude/foes): CODE PLACEHOLDERS - one human-size skeleton (24x28 cells, hit box 10x20) in the three kits' silhouettes, from px.js primitives only,
// in the contract hornsman_art.js keeps (faces RIGHT, shared canvas, ax the centre column, ay the row under the lowest pixel). The ART LANE redraws to the Frog King bar; the
// nearest drawn reference for the bones is src/redraw/sealed_pyramid_cast.js bakeSkeleton (the desert tomb guard), NOT reused: a new act-IV look - grave-brown bone, rusted mail
// scraps, dark sockets with a faint green ember. Frames (src/bones.js BONE_FRAMES): 0-1 idle | 2-5 walk | 6 hurt | 7 collapse heap, then
//   SOLDIER (13): 8 thrust tell (sword drawn back over the shield rim) | 9 thrust | 10 rush tell (shield set low, foot scrape) | 11 rush | 12 parried (shield arm wide)
//   ARCHER  (12): 8 aim tell (full draw) | 9 loose | 10 volley tell (bow raised high) | 11 volley
//   MAGE    (14): 8 wisp tell (skull-orb forms) | 9 cast | 10 grave tell (kneels, palm to the floor) | 11 grave | 12 blink out | 13 blink in
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

export const SC = { bone: '#cdbf9e', boneL: '#ece0c0', boneD: '#8a7c5e', grave: '#5e4a34', socket: '#14100c', ember: '#8fd160', mail: '#7c7468', mailD: '#4a443c', rust: '#9a5a30', iron: '#8a909c', ironD: '#4c505c',
  wood: '#7a5230', woodL: '#a67a48', robe: '#4a5a46', robeD: '#26302a', orb: '#9ff0c0', orbL: '#d7fff0', cloth: '#6a4a3a', string: '#d9d6c0' };

/* the skeleton, facing right. o: { cx, top, crouch (px the body is lowered), stride (-1..1), lean, armF:[x,y] (the near hand), armB:[x,y], skull:{dx,dy}, jaw, collapse } */
function skeleton(g, o) {
  const cx = o.cx, top = o.top + (o.crouch || 0), lean = o.lean || 0, st = o.stride || 0;
  const hip = top + 11, foot = 27;
  if (o.collapse) {   // the heap: a skull, a ribcage fallen apart, long bones across it
    ellipse(g, cx + 4, foot - 3, 4, 2.5, SC.bone); rect(g, cx + 2, foot - 5, 5, 3, SC.bone); px(g, cx + 5, foot - 5, SC.socket);
    for (let i = 0; i < 4; i++) rect(g, cx - 8 + i * 3, foot - 3 - (i % 2), 3, 1, SC.boneL);
    line(g, cx - 9, foot, cx + 1, foot - 2, SC.boneD, 1); line(g, cx - 4, foot - 1, cx + 8, foot, SC.bone, 1); rect(g, cx - 10, foot - 2, 4, 2, SC.mail); return;
  }
  for (const [side, back] of [[-1, 1], [1, 0]]) { const lx = cx + side * 2 + (side === 1 ? st * 2 : -st * 2), col = back ? SC.boneD : SC.bone;   // legs
    line(g, cx + side * 1, hip, lx, foot - 2, col, 1); rect(g, lx - 1, foot - 1, 4, 1, col); px(g, lx + 1, hip + 4, SC.boneL); }
  rect(g, cx - 3, hip - 2, 7, 3, SC.boneD); rect(g, cx - 2, hip - 2, 5, 1, SC.bone);                                   // pelvis
  rect(g, cx - 1 + lean, top + 3, 2, 7, SC.boneD);                                                                       // spine
  for (let i = 0; i < 4; i++) rect(g, cx - 4 + lean, top + 4 + i * 2, 8, 1, i % 2 ? SC.boneD : SC.bone);               // ribs
  rect(g, cx - 4 + lean, top + 3, 9, 2, SC.mail); px(g, cx - 3 + lean, top + 5, SC.rust); px(g, cx + 2 + lean, top + 4, SC.rust);   // a rusted mail scrap over the shoulders
  const sx = cx + lean + (o.skull ? o.skull.dx : 0), sy = top - 4 + (o.skull ? o.skull.dy : 0);   // the skull
  ellipse(g, sx, sy + 2, 4, 4, SC.bone); rect(g, sx - 3, sy + 4, 7, 3, SC.bone); rect(g, sx - 2, sy + 1, 2, 2, SC.socket); rect(g, sx + 1, sy + 1, 2, 2, SC.socket); px(g, sx + 2, sy + 2, SC.ember); px(g, sx, sy + 7, SC.boneD);
  if (o.jaw) rect(g, sx - 2, sy + 7, 5, 2, SC.boneD);
  for (const [a, col] of [[o.armB, SC.boneD], [o.armF, SC.bone]]) if (a) { line(g, cx + 3 + lean, top + 5, a[0], a[1], col, 1); rect(g, a[0] - 1, a[1] - 1, 2, 2, SC.boneL); }
}
const shield = (g, x, y, r = 5) => { ellipse(g, x, y, r, r + 2, SC.wood); ellipse(g, x, y, r - 1, r + 1, SC.woodL); px(g, x, y, SC.iron); rect(g, x - r, y, 1, 1, SC.ironD); };
const sword = (g, x, y, ex, ey) => { line(g, x, y, ex, ey, SC.iron, 1); px(g, ex, ey, '#ffffff'); rect(g, x - 1, y, 3, 1, SC.rust); };
const bow = (g, x, y, h, draw) => { for (let i = 0; i <= h; i++) { const d = Math.round(Math.sin((i / h) * Math.PI) * 3); px(g, x + d, y - h / 2 + i, SC.wood); } px(g, x, y - h / 2, SC.string); px(g, x, y + h / 2, SC.string); line(g, x, y - h / 2, x - draw, y, SC.string, 1); line(g, x - draw, y, x, y + h / 2, SC.string, 1); };

export function bakeSkelSoldier() {
  const W = 24, H = 28;
  const F = frames(W, H, 13, (g, f) => {
    const walk = f >= 2 && f <= 5, st = walk ? [1, 0, -1, 0][f - 2] : 0;
    let o = { cx: 11, top: 6, stride: st, armF: [14, 14], armB: [8, 14] };
    if (f === 6) o = { ...o, lean: -2, skull: { dx: -2, dy: 1 }, armF: [10, 12], armB: [7, 12] };                       // hurt
    else if (f === 7) { skeleton(g, { cx: 11, top: 6, collapse: true }); return; }                                       // the heap
    else if (f === 8) o = { ...o, lean: -1, armF: [6, 6], armB: [15, 13] };                                              // thrust tell: the sword drawn back over the rim
    else if (f === 9) o = { ...o, lean: 2, armF: [20, 12], armB: [14, 13] };                                             // thrust
    else if (f === 10) o = { ...o, crouch: 3, lean: 2, armF: [9, 14], armB: [16, 20] };                                  // rush tell: shield set low
    else if (f === 11) o = { ...o, crouch: 3, lean: 3, stride: 1, armF: [9, 14], armB: [17, 21] };                       // rush
    else if (f === 12) o = { ...o, lean: -2, armF: [8, 11], armB: [19, 5] };                                             // parried: the shield arm thrown wide
    skeleton(g, o);
    const sh = f === 10 || f === 11 ? [17, 21] : f === 12 ? [21, 6] : f === 8 ? [15, 14] : f === 9 ? [14, 15] : [14, 15];
    shield(g, sh[0], sh[1], f === 10 || f === 11 ? 5 : 4);
    const sw = f === 8 ? [[6, 6], [3, 1]] : f === 9 ? [[20, 12], [28 - 2, 11]] : f === 12 ? [[8, 11], [5, 18]] : [[8, 14], [6, 22]];
    if (f !== 10 && f !== 11) sword(g, sw[0][0], sw[0][1], Math.min(23, sw[1][0]), sw[1][1]);
  });
  return pack(F, 11, H - 1, 10, 20);
}

export function bakeSkelArcher() {
  const W = 24, H = 28;
  const F = frames(W, H, 12, (g, f) => {
    const walk = f >= 2 && f <= 5, st = walk ? [1, 0, -1, 0][f - 2] : 0;
    let o = { cx: 10, top: 6, stride: st, armF: [13, 13], armB: [8, 14] };
    if (f === 6) o = { ...o, lean: -2, skull: { dx: -2, dy: 1 }, armF: [10, 12], armB: [7, 12] };
    else if (f === 7) { skeleton(g, { cx: 10, top: 6, collapse: true }); return; }
    else if (f === 8) o = { ...o, lean: -1, armF: [19, 10], armB: [8, 10] };                                              // aim tell: full draw
    else if (f === 9) o = { ...o, lean: 0, armF: [19, 10], armB: [13, 11] };                                              // loose
    else if (f === 10) o = { ...o, lean: -1, skull: { dx: 0, dy: -1 }, armF: [17, 2], armB: [10, 3] };                    // volley tell: the bow raised high
    else if (f === 11) o = { ...o, lean: -2, armF: [17, 2], armB: [13, 3] };
    skeleton(g, o);
    if (f === 8) { bow(g, 19, 10, 12, 4); line(g, 19, 10, 13, 10, SC.string, 1); px(g, 20, 10, SC.iron); }
    else if (f === 9) { bow(g, 19, 10, 12, 0); px(g, 21, 10, SC.iron); }
    else if (f === 10 || f === 11) { bow(g, 17, 3, 11, f === 10 ? 4 : 0); }
    else if (f !== 7) bow(g, 14, 13, 12, 0);
  });
  return pack(F, 10, H - 1, 10, 20);
}

export function bakeSkelMage() {
  const W = 24, H = 28;
  const F = frames(W, H, 14, (g, f) => {
    const walk = f >= 2 && f <= 5, st = walk ? [1, 0, -1, 0][f - 2] : 0;
    let o = { cx: 10, top: 6, stride: st, armF: [13, 14], armB: [8, 14] };
    if (f === 6) o = { ...o, lean: -2, skull: { dx: -2, dy: 1 }, armF: [10, 12], armB: [7, 12] };
    else if (f === 7) { skeleton(g, { cx: 10, top: 6, collapse: true }); return; }
    else if (f === 8) o = { ...o, lean: -1, armF: [15, 3], armB: [8, 12] };                                               // wisp tell: the staff up, the orb forming
    else if (f === 9) o = { ...o, lean: 1, armF: [18, 9], armB: [8, 12] };                                                // cast
    else if (f === 10) o = { ...o, crouch: 6, lean: 3, armF: [17, 25], armB: [7, 20] };                                   // grave tell: kneeling, a palm to the floor
    else if (f === 11) o = { ...o, crouch: 6, lean: 3, armF: [19, 25], armB: [7, 20] };
    else if (f === 12) o = { ...o, lean: 0, armF: [14, 8], armB: [6, 8] };                                                // blink out
    else if (f === 13) o = { ...o, lean: 0, armF: [13, 13], armB: [8, 13] };                                              // blink in
    skeleton(g, o);
    fillPoly(g, [[6, o.top + (o.crouch || 0) + 4], [16, o.top + (o.crouch || 0) + 4], [18, 25], [4, 25]], SC.robe);       // the bone robe scraps over the ribs
    rect(g, 6, o.top + (o.crouch || 0) + 4, 11, 1, SC.robeD); px(g, 5, 24, SC.robeD); px(g, 17, 25, SC.robeD);
    const st0 = f === 8 ? [15, 3] : f === 9 ? [18, 9] : f === 10 || f === 11 ? [17, 25] : [13, 14];                         // a femur staff with a skull lantern
    line(g, st0[0], st0[1] + 12, st0[0], st0[1] - 1, SC.boneL, 1); ellipse(g, st0[0], st0[1] - 3, 2, 2, SC.bone); px(g, st0[0] - 1, st0[1] - 3, SC.socket); px(g, st0[0] + 1, st0[1] - 3, SC.socket);
    if (f === 8) { ellipse(g, 18, 2, 3, 3, SC.orb); px(g, 18, 2, SC.orbL); } else if (f === 9) { ellipse(g, 21, 8, 2, 2, SC.orb); px(g, 21, 8, SC.orbL); }
    if (f === 12) for (const [x, y] of [[4, 8], [18, 12], [5, 20], [17, 22]]) px(g, x, y, SC.ember);
  });
  return pack(F, 10, H - 1, 10, 20);
}
