// src/redraw/buried_city_cast.js - THE BURIED CITY's CAST, drawn (claude/bc2art, the art pass). The 10-08 greybox wore recoloured caravan sheets ("the sprites are terrible"). Now each is its own
// drawing on the same CONTRACT as the machine it replaces (every frame faces RIGHT, L is the flip; one canvas per sprite; ax = the body's centre column; ay = the row under the lowest
// pixel, frames SETTLED to it; w/h = the hit box), so every tell, every hurt frame and every box is where its AI expects it:
//   bakeSandDrowned()    THE SAND-DROWNED   (the ambusher's 8 frames: 0 BURIED | 1 RISING | 2,3 walk | 4 CUT TELL | 5 CUT | 6 BURROWING | 7 hurt) - a bleached dead citizen in rotted wrap and
//                        the gilded collar of the court, teal pinpricks for eyes, sand trickling from the jaw and the sleeves, a rusted knife
//   bakeSandSlinger()    THE SAND-FOLK SLINGER (the slinger's 7: 0 stand | 1,2 WHIRL | 3 LOOSE | 4 KICK TELL | 5 KICK | 6 hurt) - a lean man of the city's last folk: dust-blue tunic, teal headwrap,
//                        brass goggles pushed up, a sand veil, wrapped boots, a sling
//   bakeBrassScorpion()  THE BRASS SCORPION (the scorpion's 7: 0,1 walk | 2 CLAW TELL | 3 CLAW | 4 STING TELL | 5 STING | 6 hurt) - plated brass with rivets, a cog in its back and a winding key,
//                        piston rods in the tail, an amber eye
//   bakeConstruct()      THE CLOCKWORK CONSTRUCT (6: 0 idle | 1 walk | 2 POKE TELL | 3 POKE | 4 WOUND DOWN | 5 hurt) - brass guard with a CLOCK-FACE head (the hands at twelve while it keeps its round,
//                        drooping when it is wound down), a window on its escapement (an anchor and a wheel) in the chest, pauldrons, a winding key, a halberd
  //   bakeHourglassKing(level)  THE HOURGLASS KING (20: 0 idle | 1,2 walk | 3 STREAM TELL | 4 STREAM | 5 GEAR TELL | 6 GEAR | 7 GRASP (was SLIP) | 8 SLIP | 9 PENDULUM TELL | 10 PENDULUM | 11 OPEN | 12 TURNING | 13 hurt
//                        | claude/buriedcity3 GREYBOX: 14 SURGE TELL | 15 SURGE | 16 GRASP TELL | 17 RAIN TELL | 18 SLIP TELL | 19 SLIP STRIKE
//                        | claude/buriedcity4 GREYBOX: 26 WITHDRAW (glide/sink) | 27 SHARD TELL | 28 SHARD THROW | 29 POT TELL | 30 POT THROW | 31 HOLDING THE SAND (open, on his pillar) | 32 RAISE TELL)
//                        - lapis robes with a gilded hem, brass pauldrons and a fan collar, a crown of gears, a mask with amber eyes, the hourglass in a brass frame on his chest (sand by level), a
//                        pendulum sceptre; every pose keyframed
//   bakeCog()            the brass cog he throws
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleFrame(c); });
const thick = (g, x0, y0, x1, y1, col, w = 2) => { const v = Math.abs(y1 - y0) > Math.abs(x1 - x0); for (let k = 0; k < w; k++) line(g, x0 + (v ? k : 0), y0 + (v ? 0 : k), x1 + (v ? k : 0), y1 + (v ? 0 : k), col); };
const blade = (g, hx, hy, tx, ty, bend, col, colL) => { const dx = tx - hx, dy = ty - hy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  for (let t = 0; t <= 1.001; t += 0.06) { const b = Math.sin(t * Math.PI) * bend, x = hx + dx * t + nx * b, y = hy + dy * t + ny * b; px(g, x, y, col); if (t < 0.7) px(g, x + nx, y + ny, t < 0.35 ? col : colL); } px(g, tx, ty, colL); };

// ================= THE SAND-DROWNED =================
const DR = { bone: '#d6cbac', boneL: '#efe8d0', boneD: '#a89c7c', wrap: '#bfb292', wrapL: '#dccfa8', wrapD: '#8c8064', rot: '#4a3e2c', dark: '#16100c', teal: '#6ad8c8', tealL: '#d0fff6', gold: '#d8aa40', goldL: '#f6dc80', goldD: '#8a6a20',
  sand: '#e2bb7a', sandL: '#f4dba0', sandD: '#b98c58', steel: '#a2a6ac', steelL: '#f0f4f8', rust: '#8a5a3a', rustD: '#5a3a24' };
export function bakeSandDrowned() {
  const W = 34, H = 30, cx = 14, gy = 28;
  const head = (g, x, y, drop = 0) => {
    ellipse(g, x, y, 3.4, 3.6, DR.bone); px(g, x - 2, y - 2, DR.boneL); px(g, x - 3, y, DR.boneL); rect(g, x - 2, y + 2, 5, 1, DR.boneD); px(g, x + 3, y + 1, DR.boneD);   /* a skull's face, the cheek hollow */
    rect(g, x - 2, y - 1, 2, 2, DR.dark); rect(g, x + 1, y - 1, 2, 2, DR.dark); px(g, x - 1, y - 1, DR.teal); px(g, x + 2, y - 1, DR.teal); px(g, x - 1, y - 2 + 1, DR.tealL);   /* sockets, a teal pinprick in each */
    rect(g, x - 1, y + 2 + drop, 3, 1 + (drop ? 1 : 0), DR.dark);   /* the jaw slack */
    px(g, x, y + 4 + drop, DR.sand); px(g, x, y + 5 + drop, DR.sandD);   /* sand running from the mouth */
    ellipse(g, x - 0.5, y - 2.6, 4.2, 2.3, DR.wrap); px(g, x - 3, y - 3, DR.wrapL); px(g, x + 2, y - 4, DR.wrapD); px(g, x + 1, y - 3, DR.rot);   /* the rotted head-wrap */
    line(g, x - 4, y - 1, x - 7, y + 3, DR.wrap); px(g, x - 7, y + 4, DR.wrapD); px(g, x - 8, y + 5, DR.rot); };   /* its tail, hanging like weed */
  const body = (g, x, y, legs, lean = 0) => { const [a, b] = legs;
    rect(g, x - 2 + a, y + 10, 2, 2, DR.boneD); rect(g, x + 1 + b, y + 10, 2, 2, DR.boneD); rect(g, x - 3 + a, y + 11, 3, 1, DR.wrapD); rect(g, x + 1 + b, y + 11, 3, 1, DR.wrapD);   /* bare shins, bound feet */
    fillPoly(g, [[x - 3 + lean, y], [x + 3 + lean, y], [x + 5, y + 10], [x - 5, y + 10]], DR.wrap);   /* the shroud */
    line(g, x - 2 + lean, y + 1, x - 4, y + 9, DR.wrapL); line(g, x + 3 + lean, y + 2, x + 4, y + 9, DR.wrapD); line(g, x - 3, y + 4, x + 3, y + 6, DR.wrapD); line(g, x - 3, y + 7, x + 4, y + 8, DR.wrapD);
    rect(g, x - 1 + lean, y + 3, 3, 3, DR.rot); px(g, x - 1 + lean, y + 3, DR.boneD); px(g, x + 1 + lean, y + 4, DR.boneD); px(g, x + lean, y + 5, DR.boneD);   /* ribs showing through a tear */
    rect(g, x - 4 + lean, y - 1, 9, 2, DR.gold); rect(g, x - 4 + lean, y - 1, 9, 1, DR.goldL); px(g, x - 1 + lean, y, DR.goldD); px(g, x + 2 + lean, y - 1, DR.rot); px(g, x + 3 + lean, y, DR.rot);   /* the gilded collar of the court, broken */
    for (let i = -5; i <= 5; i += 2) { px(g, x + i, y + 10 + ((i + 5) % 4 === 0 ? 1 : 0), DR.wrapD); } px(g, x + 5, y + 8, DR.sand); px(g, x + 6, y + 9, DR.sandD); px(g, x - 5, y + 9, DR.sand); };   /* the hem in rags; sand spilling from it */
  const arm = (g, x0, y0, x1, y1) => { line(g, x0, y0, x1, y1, DR.bone); px(g, x1, y1, DR.boneD); px(g, x1 + 1, y1 + (y1 > y0 ? 1 : -1), DR.bone); px(g, (x0 + x1) / 2, (y0 + y1) / 2 + 1, DR.wrap); };   /* a bone-thin arm in a wrap, a clawed hand */
  const knife = (g, hx, hy, tx, ty) => { rect(g, hx - 1, hy - 1, 2, 2, DR.rustD); blade(g, hx, hy, tx, ty, 1.5, DR.steel, DR.rust); };
  const mound = (g, x, h) => { fillPoly(g, [[x - 12, gy], [x - 6, gy - h], [x + 6, gy - h], [x + 12, gy]], DR.sand); rect(g, x - 6, gy - h, 12, 1, DR.sandL); for (let i = 0; i < 6; i++) px(g, x - 10 + i * 4, gy - 1, DR.sandD); };
  const F = frames(W, H, 8, (g, f) => {
    if (f === 0) { mound(g, cx, 4); rect(g, cx - 6, gy - 11, 1, 6, DR.bone); px(g, cx - 6, gy - 12, DR.boneL); px(g, cx - 7, gy - 12, DR.bone); px(g, cx - 5, gy - 12, DR.bone);   /* BURIED: a bone hand reaching up from the mound */
      ellipse(g, cx + 2, gy - 5, 3.2, 2.2, DR.wrap); rect(g, cx, gy - 5, 2, 1, DR.dark); px(g, cx + 1, gy - 5, DR.teal); px(g, cx + 3, gy - 5, DR.teal); rect(g, cx - 1, gy - 8, 6, 1, DR.gold); return; }   /* and the wrapped crown of the head, two teal eyes, a glint of gold */
    if (f === 1) { body(g, cx, gy - 12, [0, 0], 1); head(g, cx + 1, gy - 15, 1); mound(g, cx, 5);   /* RISING: the sand pouring off the shroud */
      for (let i = 0; i < 8; i++) { px(g, cx - 6 + i * 2, gy - 16 + (i % 4) * 3, DR.sandL); px(g, cx - 5 + i * 2, gy - 12 + (i % 3) * 3, DR.sand); } return; }
    if (f === 6) { mound(g, cx, 5); fillPoly(g, [[cx - 11, gy - 5], [cx - 4, gy - 11], [cx + 6, gy - 10], [cx + 11, gy - 5]], DR.wrap);   /* BURROWING: the shroud thrown over, going down */
      line(g, cx - 4, gy - 11, cx + 6, gy - 10, DR.wrapL); for (let i = 0; i < 5; i++) px(g, cx - 8 + i * 4, gy - 6, DR.wrapD); rect(g, cx - 3, gy - 10, 4, 1, DR.gold); return; }
    const by = gy - 12;
    if (f === 7) { body(g, cx - 1, by + 1, [0, 0], -1); head(g, cx - 2, by - 3, 1); arm(g, cx + 2, by + 3, cx + 4, by + 8); knife(g, cx + 4, by + 8, cx + 7, by + 11); return; }   /* hurt: rocked back, the knife drooping */
    const legs = f === 2 ? [0, 1] : f === 3 ? [1, 0] : [0, 0];
    body(g, cx, by, legs, f === 4 ? -1 : 0); head(g, cx + 1 + (f === 5 ? 1 : 0), by - 4, f === 4 ? 1 : 0);
    if (f === 4) { arm(g, cx + 2, by + 2, cx + 1, by - 6); knife(g, cx + 1, by - 6, cx - 2, by - 12); px(g, cx - 2, by - 13, DR.steelL); px(g, cx - 3, by - 12, DR.steelL); px(g, cx - 1, by - 12, DR.steelL); }   /* CUT TELL: the knife up, a glint on its tip */
    else if (f === 5) { arm(g, cx + 3, by + 3, cx + 8, by + 3); knife(g, cx + 8, by + 3, cx + 15, by + 5); for (let i = 0; i < 4; i++) px(g, cx + 9 + i * 2, by - 1 + i, DR.steelL); }   /* CUT: out and across */
    else { arm(g, cx + 3, by + 3, cx + 4, by + 8); knife(g, cx + 4, by + 8, cx + 8, by + 10); arm(g, cx - 3, by + 3, cx - 5, by + 9); }   /* held low */
  });
  return pack(F, cx, H, 12, 18);
}

// ================= THE SAND-FOLK SLINGER =================
const SF = { skin: '#b88a62', skinD: '#8a6240', tunic: '#6c7c98', tunicL: '#90a2bc', tunicD: '#44506a', wrapT: '#3a8a8a', wrapTL: '#62b4aa', wrapTD: '#1e5a5c', veil: '#d2c29a', veilD: '#a8986e', brass: '#d0a438', brassL: '#f6dc80', brassD: '#7a5c18',
  glass: '#9ad8e0', belt: '#6a4a28', pants: '#8a7a5c', pantsD: '#5e5038', bind: '#dccfa8', cord: '#7a5a38', pouch: '#8a5a32', stone: '#8a8278', stoneL: '#bab2a4', blur: '#dce4f0', eye: '#161210' };
export function bakeSandSlinger() {
  const W = 36, H = 32, cx = 14, gy = 30;
  const head = (g, x, y) => { ellipse(g, x, y, 3.2, 3.4, SF.skin); px(g, x - 3, y + 1, SF.skinD);
    rect(g, x - 3, y + 1, 7, 3, SF.veil); rect(g, x - 3, y + 3, 7, 1, SF.veilD); px(g, x + 3, y + 2, SF.veil);   /* the sand veil over the mouth */
    ellipse(g, x - 0.5, y - 2.2, 4.2, 2.3, SF.wrapT); px(g, x - 3, y - 3, SF.wrapTL); px(g, x - 1, y - 4, SF.wrapTL); rect(g, x - 4, y - 1, 8, 1, SF.wrapTD);   /* the teal headwrap */
    line(g, x - 4, y - 2, x - 6, y + 2, SF.wrapT); px(g, x - 6, y + 3, SF.wrapTD);   /* its tail */
    rect(g, x + 1, y - 1, 2, 1, SF.eye); px(g, x + 2, y - 1, SF.glass);   /* the eyes */
    rect(g, x + 1, y - 4, 3, 2, SF.brass); px(g, x + 2, y - 4, SF.glass); px(g, x + 1, y - 4, SF.brassL); };   /* the goggles, pushed up on the wrap: a brass rim, a lens */
  const body = (g, x, y, legs) => { const [a, b] = legs;
    rect(g, x - 3, y, 6, 7, SF.tunic); rect(g, x - 3, y, 6, 1, SF.tunicL); rect(g, x + 2, y + 1, 1, 6, SF.tunicD); rect(g, x - 3, y + 4, 6, 1, SF.belt); px(g, x - 1, y + 4, SF.brass);
    line(g, x - 3, y + 2, x + 2, y + 6, SF.tunicD); px(g, x - 2, y + 6, SF.veil); rect(g, x - 3, y + 6, 6, 1, SF.veilD);   /* a patched hem */
    rect(g, x + 3, y + 4, 2, 3, SF.pouch); px(g, x + 3, y + 4, SF.brassL);   /* the bag of stones */
    rect(g, x - 3 + a, y + 7, 2, 4, SF.pants); rect(g, x + 1 + b, y + 7, 2, 4, SF.pants); rect(g, x - 3 + a, y + 9, 3, 2, SF.bind); rect(g, x + 1 + b, y + 9, 3, 2, SF.bind); px(g, x - 3 + a, y + 10, SF.pantsD); px(g, x + 1 + b, y + 10, SF.pantsD); };   /* wrapped boots */
  const sling = (g, hx, hy, ox, oy, loaded) => { line(g, hx, hy, ox, oy, SF.cord); rect(g, ox - 1, oy - 1, 3, 2, SF.pouch); if (loaded) px(g, ox, oy - 1, SF.stone); };
  const F = frames(W, H, 7, (g, f) => {
    const by = gy - 11;
    if (f === 6) { body(g, cx - 1, by + 1, [0, 0]); head(g, cx - 2, by - 3); sling(g, cx + 2, by + 3, cx + 3, by + 9, false); return; }
    if (f === 4 || f === 5) {
      const b = 0; rect(g, cx - 3, by + 7, 2, 4, SF.pants); rect(g, cx - 3, by + 9, 3, 2, SF.bind);
      rect(g, cx - 3, by, 6, 7, SF.tunic); rect(g, cx - 3, by, 6, 1, SF.tunicL); rect(g, cx - 3, by + 4, 6, 1, SF.belt); head(g, cx + (f === 4 ? -1 : 1), by - 4);
      if (f === 4) { rect(g, cx + 1 + b, by + 5, 4, 2, SF.pants); rect(g, cx + 4, by + 7, 2, 2, SF.bind); }
      else { rect(g, cx + 1, by + 6, 7, 2, SF.pants); rect(g, cx + 8, by + 5, 2, 3, SF.bind); px(g, cx + 10, by + 6, SF.bindL || SF.bind); }
      sling(g, cx - 3, by + 2, cx - 5, by + 8, false); return; }
    body(g, cx, by, f === 0 ? [0, 0] : [0, 1]); head(g, cx + 1, by - 4);
    if (f === 0) sling(g, cx + 3, by + 2, cx + 5, by + 9, true);
    else if (f === 1 || f === 2) { line(g, cx + 2, by + 1, cx + 3, by - 7, SF.skin);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; px(g, cx + 3 + Math.cos(a) * 7, by - 9 + Math.sin(a) * 2.6, SF.blur); }
      if (f === 1) sling(g, cx + 3, by - 7, cx - 4, by - 10, true); else sling(g, cx + 3, by - 7, cx + 10, by - 8, true); }
    else if (f === 3) { line(g, cx + 2, by + 1, cx + 8, by - 3, SF.skin); line(g, cx + 8, by - 3, cx + 16, by - 5, SF.cord); rect(g, cx + 16, by - 6, 2, 2, SF.pouch); }
  });
  return pack(F, cx, H, 10, 16);
}

// ================= THE BRASS SCORPION =================
const BS = { a: '#c29a44', A: '#e2bc68', d: '#8a6420', D: '#4e3810', l: '#f6e49a', leg: '#6a6258', legL: '#9a9288', barb: '#c4ccd4', barbD: '#5a626a', red: '#e04030', redL: '#ff8a5c', eye: '#ffb040', eyeL: '#fff0b0', rivet: '#fff0b0', key: '#d6ccb0', cog: '#5a4630', cogL: '#9a7c48', rod: '#a0a0ac' };
export function bakeBrassScorpion() {
  const W = 34, H = 20, gy = 18;
  const body = (g, dy = 0) => { for (let s = 0; s < 4; s++) { const x = 11 + s * 4; ellipse(g, x, gy - 5 + dy, 3.4, 2.6, s % 2 ? BS.a : BS.A); rect(g, x - 2, gy - 8 + dy, 3, 1, BS.l); px(g, x + 2, gy - 4 + dy, BS.d); px(g, x - 1, gy - 6 + dy, BS.rivet); }   /* plated segments, riveted */
    for (let s = 0; s < 4; s++) px(g, 13 + s * 4, gy - 5 + dy, BS.D);   /* the seams */
    ellipse(g, 26, gy - 5 + dy, 3.6, 2.8, BS.A); rect(g, 24, gy - 8 + dy, 4, 1, BS.l); px(g, 27, gy - 7 + dy, BS.eye); px(g, 28, gy - 7 + dy, BS.eye); px(g, 27, gy - 8 + dy, BS.eyeL);   /* the amber lens eyes */
    rect(g, 10, gy - 3 + dy, 18, 1, BS.d);
    rect(g, 15, gy - 10 + dy, 3, 2, BS.cog); px(g, 16, gy - 11 + dy, BS.cogL); px(g, 15, gy - 10 + dy, BS.cogL); px(g, 17, gy - 10 + dy, BS.cogL); px(g, 16, gy - 9 + dy, BS.D);   /* a cog turning in its back */
    rect(g, 19, gy - 11 + dy, 1, 3, BS.key); rect(g, 18, gy - 12 + dy, 3, 1, BS.key); };   /* its winding key */
  const legs = (g, ph) => { for (let i = 0; i < 4; i++) { const x = 12 + i * 4, k = (i + ph) % 2 ? 1 : -1; line(g, x, gy - 4, x - 2 + k, gy - 1, BS.leg); px(g, x - 1 + k * 0, gy - 3, BS.legL); px(g, x - 2 + k, gy - 1, BS.D); } };
  const claw = (g, ox, oy, open) => { line(g, 27, gy - 5, ox - 3, oy, BS.a); px(g, ox - 3, oy, BS.rivet); ellipse(g, ox, oy, 2.6, 1.8, BS.A); px(g, ox - 1, oy - 1, BS.l); line(g, ox + 1, oy - 1, ox + 4, oy - 1 - open, BS.barb); line(g, ox + 1, oy + 1, ox + 4, oy + 1 + open, BS.barbD); px(g, ox + 3, oy, BS.D); };
  const tail = (g, cock, strike, lit) => { let x = 8, y = gy - 6; const pts = [];
    for (let s = 0; s < 5; s++) { const a = Math.PI * (0.95 - s * (0.18 + cock * 0.05) - strike * s * 0.1); x += Math.cos(a) * 3.2; y -= Math.abs(Math.sin(a)) * (2.6 + cock * 1.2); pts.push([x, y]); }
    pts.forEach(([tx, ty], i) => { if (i > 0) line(g, pts[i - 1][0], pts[i - 1][1], tx, ty, BS.rod); ellipse(g, tx, ty, 1.9 - i * 0.12, 1.7 - i * 0.1, i % 2 ? BS.a : BS.A); if (i % 2 === 0) px(g, tx, ty - 1, BS.rivet); });   /* segments on piston rods */
    const [bx, by] = pts[4]; line(g, bx, by, bx + 2 + strike * 2, by + 2, lit ? BS.red : BS.barb); px(g, bx + 2 + strike * 2, by + 2, lit ? BS.redL : BS.barbD); if (lit) { px(g, bx + 2, by + 1, BS.redL); px(g, bx + 3 + strike * 2, by + 2, BS.redL); } };
  const F = frames(W, H, 7, (g, f) => {
    const dy = f === 6 ? 1 : 0;
    tail(g, f === 4 ? 1 : f === 5 ? 0.6 : 0.35, f === 5 ? 1 : 0, f === 4 || f === 5);
    legs(g, f === 1 ? 1 : 0); body(g, dy);
    if (f === 2) claw(g, 30, gy - 11, 2); else if (f === 3) claw(g, 32, gy - 6, 0); else claw(g, 30, gy - 6, f === 6 ? 2 : 1);
  });
  return pack(F, 18, H, 16, 9);
}

// ================= THE CLOCKWORK CONSTRUCT =================
const CK = { brass: '#c09040', brassL: '#e8bc68', brassD: '#8a5e28', brassDD: '#5a3a14', iron: '#5e564c', ironL: '#8a8274', ironD: '#3a342c', face: '#f0e8d0', faceD: '#c8bea0', hand: '#2a2018', lens: '#ffd36b', lensL: '#fff1c0', lensOff: '#4a463e', key: '#d6ccb0', keyD: '#8a8270', blade: '#c9d1dc', bladeL: '#f0f4f8', haft: '#6e4a2c', win: '#1a1410', gear: '#e8c45c', gearD: '#9a7a24', rivet: '#fff0b0' };
const CK_SUN = { brass: '#d8b050', brassL: '#fbe48e', brassD: '#a47e34', brassDD: '#6a4a1a', face: '#fbf0cc', faceD: '#d8cca0', lens: '#ff9a40', lensL: '#ffe0a0' };
export function bakeConstruct(sun) {   /* sun: THE SUNDIAL WARDEN, the courtyard's elite (gilded, a sundial for a face, a red sash, speed-marks behind it) */
  const SAVE = Object.assign({}, CK); if (sun) Object.assign(CK, CK_SUN);
  const W = 34, H = 26, gy = 24, cx = 15;
  /* the clock-face head: a brass bezel round a pale face, ticks at the quarters, hands (at twelve while it keeps its round; slumped to the lower left when wound down) */
  const head = (g, x, y, lit = true) => { circle(g, x, y, 4, CK.brass); circle(g, x, y, 3, lit ? CK.face : CK.faceD); px(g, x - 3, y - 3, CK.brassL); px(g, x - 2, y - 4, CK.brassL); px(g, x + 3, y + 3, CK.brassD); px(g, x + 2, y + 4, CK.brassD);
    px(g, x, y - 3, CK.hand); px(g, x + 3, y, CK.hand); px(g, x, y + 3, CK.hand); px(g, x - 3, y, CK.hand);
    if (lit) { line(g, x, y, x, y - 2, CK.hand); line(g, x, y, x + 2, y, CK.hand); px(g, x + 1, y - 1, CK.lens); px(g, x + 2, y - 1, CK.lensL); }   /* hands at twelve and three; a lit lens at the pivot */
    else { line(g, x, y, x - 2, y + 1, CK.hand); line(g, x, y, x - 1, y + 2, CK.hand); }
    rect(g, x - 1, y - 6, 3, 2, CK.brassD); px(g, x, y - 6, CK.brassL); };   /* the bell on top */
  const torso = (g, x, y, bend = 0, lit = true) => { rect(g, x - 4 + bend, y, 8, 9, CK.brass); rect(g, x - 4 + bend, y, 8, 1, CK.brassL); rect(g, x - 4 + bend, y + 8, 8, 1, CK.brassD); rect(g, x + 3 + bend, y + 1, 1, 7, CK.brassD);
    rect(g, x - 2 + bend, y + 2, 5, 5, CK.win); px(g, x - 2 + bend, y + 2, CK.ironL);   /* a window on the works */
    px(g, x + bend, y + 3, lit ? CK.gear : CK.gearD); px(g, x - 1 + bend, y + 4, lit ? CK.gear : CK.gearD); px(g, x + 1 + bend, y + 4, lit ? CK.gear : CK.gearD); px(g, x + bend, y + 5, lit ? CK.gear : CK.gearD); px(g, x + bend, y + 4, CK.win);   /* the escape wheel */
    px(g, x - 2 + bend, y + 6, CK.ironL); px(g, x + 2 + bend, y + 6, CK.ironL); line(g, x - 2 + bend, y + 6, x + 2 + bend, y + 6, CK.ironL);   /* the anchor */
    px(g, x - 4 + bend, y + 1, CK.rivet); px(g, x + 3 + bend, y + 1, CK.rivet);
    rect(g, x - 6, y + 2, 2, 3, CK.key); px(g, x - 7, y + 3, CK.key); px(g, x - 7, y + 1, CK.keyD); px(g, x - 6, y + 1, CK.keyD); px(g, x - 7, y + 5, CK.keyD); line(g, x - 5, y + 5, x - 5, y + 8, CK.ironD); };   /* the winding key in its back */
  const shoulder = (g, x, y) => { circle(g, x, y, 2.4, CK.brass); px(g, x - 1, y - 2, CK.brassL); px(g, x + 1, y + 1, CK.brassD); };
  const legs = (g, x, y, ph) => { const a = [0, 2, -2][ph], b = -a; rect(g, x - 3 + a, y, 2, 8, CK.iron); rect(g, x + 1 + b, y, 2, 8, CK.iron); px(g, x - 3 + a, y, CK.ironL); px(g, x + 1 + b, y, CK.ironL); rect(g, x - 4 + a, y + 2, 3, 2, CK.brass); rect(g, x + b, y + 2, 3, 2, CK.brass); px(g, x - 4 + a, y + 2, CK.brassL); px(g, x + b, y + 2, CK.brassL); rect(g, x - 4 + a, y + 7, 4, 2, CK.ironD); rect(g, x + b, y + 7, 4, 2, CK.ironD); };
  const arm = (g, x0, y0, x1, y1) => { thick(g, x0, y0, x1, y1, CK.brass, 2); px(g, x1, y1, CK.brassD); px(g, (x0 + x1) / 2, (y0 + y1) / 2, CK.rivet); };
  const halberd = (g, hx, hy, tx, ty) => { thick(g, hx, hy, tx, ty, CK.haft, 1); const a = Math.atan2(ty - hy, tx - hx), bx = Math.cos(a), by = Math.sin(a);
    fillPoly(g, [[tx - by * 3, ty + bx * 3], [tx + by * 3, ty - bx * 3], [tx + bx * 8, ty + by * 8]], CK.blade); line(g, tx, ty, tx + bx * 7, ty + by * 7, CK.bladeL); px(g, tx - bx, ty - by, CK.brass); };
  const dial = (g, x, y) => { px(g, x, y - 2, CK.hand); px(g, x + 1, y - 1, CK.hand); px(g, x + 1, y, CK.hand); px(g, x + 2, y, CK.hand); px(g, x - 3, y + 2, '#c4442c'); px(g, x - 2, y + 2, '#c4442c'); for (const [dx, dy] of [[-4, 0], [4, -2], [0, -5], [-3, -4], [3, 3]]) px(g, x + dx, y + dy, CK.lens); };   /* a gnomon's shadow and the sun's rays on the dial */
  const sash = (g, x, y, n) => { for (let k = 0; k < 9; k++) px(g, x - 4 + k, y + k * 0.8, '#c4442c'); for (let k = 0; k < n; k++) { px(g, x - 5 - k, y + 5 + k % 2, '#a63420'); px(g, x - 5 - k, y + 6 + k % 2, '#7e2616'); } };
  const F = frames(W, H, 8, (g, f) => {
    const hip = gy - 8;
    if (f === 6) { legs(g, cx, hip + 3, 2); torso(g, cx - 2, hip - 6, -3); head(g, cx - 3, hip - 9); shoulder(g, cx + 1, hip - 4); arm(g, cx + 1, hip - 3, cx - 7, hip + 6); halberd(g, cx - 7, hip + 6, cx - 15, hip + 11);   /* SWEEP TELL: crouched low, the blade hauled back along the floor */
      for (let k = 0; k < 4; k++) px(g, cx - 13 - k * 2, hip + 12, '#e0e8f0'); if (sun) { dial(g, cx - 3, hip - 9); sash(g, cx - 2, hip - 6, 4); } return; }
    if (f === 7) { legs(g, cx, hip + 3, 1); torso(g, cx + 3, hip - 6, 4); head(g, cx + 5, hip - 9); shoulder(g, cx + 8, hip - 4); arm(g, cx + 8, hip - 3, cx + 14, hip + 7); halberd(g, cx + 14, hip + 7, cx + 24, hip + 10);   /* SWEEP: the blade scythed low across the floor in front */
      for (let k = 0; k < 6; k++) { px(g, cx + 12 + k * 2, hip + 9 + (k % 2), k % 2 ? '#f0f4f8' : '#c9d1dc'); px(g, cx + 14 + k * 2, hip + 12, 'rgba(240,244,248,0.6)'); } if (sun) { dial(g, cx + 5, hip - 9); sash(g, cx + 3, hip - 6, 5); } return; }
    if (f === 4) { legs(g, cx, hip + 1, 0); torso(g, cx + 2, hip - 9, 5, false); head(g, cx + 10, hip - 5, false); shoulder(g, cx + 6, hip - 6);
      arm(g, cx - 1, hip - 6, cx - 6, hip - 1); halberd(g, cx - 6, hip - 1, cx - 12, hip + 4); return; }
    const ph = f === 1 ? 1 : (f === 2 || f === 3) ? 2 : 0, dy = f === 5 ? 2 : 0, bend = f === 5 ? -3 : 0;
    legs(g, cx, hip + dy, ph); torso(g, cx, hip - 9 + dy, bend); head(g, cx + 1 + bend, hip - 13 + dy); shoulder(g, cx + 4 + bend, hip - 7 + dy);
    const sh = [cx + 4 + bend, hip - 6 + dy];
    if (f === 2) { arm(g, ...sh, cx - 7, hip - 4); halberd(g, cx - 7, hip - 4, cx - 15, hip - 7); }
    else if (f === 3) { arm(g, ...sh, cx + 14, hip - 9); halberd(g, cx + 14, hip - 9, cx + 24, hip - 8); }
    else { arm(g, ...sh, cx + 4, hip - 1 + dy); halberd(g, cx + 4, hip - 1 + dy, cx + 6, hip + 9 + dy); }
    if (sun && f !== 5) { dial(g, cx + 1 + bend, hip - 13 + dy); sash(g, cx + bend, hip - 9 + dy, 3 + (f === 1 ? 2 : 0)); }
    if (sun && (f === 0 || f === 1)) for (let k = 0; k < 3; k++) px(g, cx - 8 - k * 2, hip + 4 + k * 2, '#e8dcb0');   /* speed-marks: it is SWIFT */
  });
  Object.assign(CK, SAVE);
  return pack(F, cx, H, 10, 16);
}

// ================= THE HOURGLASS KING =================
const HK = { robe: '#34408a', robeD: '#222a66', robeDD: '#161c48', robeL: '#5668b8', robeLL: '#7c8cd8', trim: '#d8aa40', trimL: '#f6dc80', trimD: '#8a6a20', brass: '#c09040', brassL: '#e8bc68', brassD: '#8a5e28', brassDD: '#5a3a14',
  mask: '#dccfa8', maskL: '#f4ecd0', maskD: '#a89a74', skin: '#c9a97a', glass: '#cfe3f0', glassL: '#f2faff', glassD: '#7a98b0', sand: '#e6bc68', sandL: '#f8dc90', sandD: '#bf8f4c', ghost: 'rgba(150,170,230,0.42)', red: '#e04030', redL: '#ff8a5c', eye: '#ffd36b', eyeL: '#fff4c0', dark: '#161018' };
/* the hourglass in its brass frame, at the chest: level 0 full upper bulb, 1 half, 2 near-empty (a thread still falling) */
function hourglassChest(g, x, y, level) {
  circle(g, x, y + 6, 8, HK.brassD); circle(g, x, y + 6, 7, HK.brass);   /* the frame: a brass ring */
  px(g, x - 6, y + 1, HK.brassL); px(g, x - 5, y, HK.brassL); px(g, x, y - 1, HK.brassL);
  fillPoly(g, [[x - 5, y + 1], [x + 5, y + 1], [x + 2, y + 6], [x + 5, y + 11], [x - 5, y + 11], [x - 2, y + 6]], HK.glass);
  px(g, x - 4, y + 2, HK.glassL); px(g, x - 4, y + 3, HK.glassL); px(g, x - 3, y + 9, HK.glassD);
  const up = level === 0 ? 4 : level === 1 ? 2 : 0, low = level === 0 ? 1 : level === 1 ? 3 : 5;
  if (up > 0) for (let k = 0; k < up; k++) { const w = 4 - Math.floor(k * 0.6); rect(g, x - w, y + 2 + (4 - up) + k, w * 2 + 1, 1, k === 0 ? HK.sandL : HK.sand); }
  if (level === 2) { px(g, x, y + 6, HK.sandL); px(g, x, y + 5, HK.sand); }
  for (let k = 0; k < low; k++) { const w = Math.min(4, k + 1); rect(g, x - w, y + 11 - k, w * 2 + 1, 1, k === low - 1 ? HK.sandL : HK.sand); }
  px(g, x - 6, y + 6, HK.brassDD); px(g, x + 6, y + 6, HK.brassDD); rect(g, x - 1, y + 5, 3, 1, HK.brassL);
  for (const [dx, dy] of [[-6, 3], [6, 3], [-6, 9], [6, 9]]) px(g, x + dx, y + dy, HK.trimL);   /* rivets */
}
const KICE = '#bfe6f5', KICEL = '#f2fbff', KRU = '#d0703a', KRUL = '#f0a060';   /* (claude/bc4art) the king's thrown glass and clay */
/* a jagged shard, a painted clay pot (the throw poses 27-30) */
const kShard = (g, x, y, a, len, c1 = KICE) => { const ca = Math.cos(a), sa = Math.sin(a); fillPoly(g, [[x, y], [x + ca * len - sa * 1.8, y + sa * len + ca * 1.8], [x + ca * len * 0.85 + sa * 1.6, y + sa * len * 0.85 - ca * 1.6]], c1); line(g, x, y, x + ca * len, y + sa * len, KICEL); px(g, x + ca * len, y + sa * len, '#ffffff'); px(g, x + ca * len * 0.5 - sa, y + sa * len * 0.5 + ca, '#8fc4dc'); };
const kPot = (g, x, y, r, tilt = 0) => { circle(g, x, y, r, '#8a4a2a'); circle(g, x - 1, y - 1, r - 2, '#a8602e'); px(g, x - r + 2, y - r + 2, KRUL); px(g, x - r + 1, y - r + 3, KRUL); rect(g, x - r + 1, y + 1 + tilt, r * 2 - 2, 2, '#d8aa40'); rect(g, x - r + 1, y + 1 + tilt, r * 2 - 2, 1, HK.trimL); for (let k = -r + 2; k < r - 1; k += 3) px(g, x + k, y + 3 + tilt, '#5a2a14');
  rect(g, x - 3, y - r - 2, 6, 3, '#8a4a2a'); rect(g, x - 4, y - r - 3, 8, 2, KRU); rect(g, x - 4, y - r - 3, 8, 1, KRUL); px(g, x + r - 2, y + 2, '#5a2a14'); px(g, x - r, y - 1, '#6a3418'); px(g, x + r, y - 1, '#6a3418'); };
export function bakeHourglassKing(sandLevel = 0) {
  const W = 76, H = 92, gy = 90;   /* (12 rows taller than the greybox king: the fan collar and the crown of gears stand over his head) */
  const legs = (g, x, y, ph) => { const a = [0, 2, -2][ph] || 0, b = -a; thick(g, x - 4, y, x - 4 + a, y + 16, HK.robeD, 5); thick(g, x + 4, y, x + 4 + b, y + 16, HK.robeD, 5);
    rect(g, x - 7 + a, y + 15, 5, 2, HK.brassD); rect(g, x + 2 + b, y + 15, 5, 2, HK.brassD); rect(g, x - 7 + a, y + 15, 5, 1, HK.brassL); rect(g, x + 2 + b, y + 15, 5, 1, HK.brassL);
    px(g, x - 4 + a, y + 10, HK.trim); px(g, x + 4 + b, y + 10, HK.trim); };
  const robe = (g, x, y, bend = 0, invert = false) => {
    fillPoly(g, [[x - 11 + bend, y], [x + 11 + bend, y], [x + 9, y + 22], [x - 9, y + 22]], HK.robe);
    fillPoly(g, [[x - 9 + bend, y + 1], [x + 9 + bend, y + 1], [x + 7, y + 8], [x - 7, y + 8]], HK.robeL);
    line(g, x - 8 + bend, y + 2, x - 6, y + 21, HK.robeLL); line(g, x + 8 + bend, y + 2, x + 7, y + 21, HK.robeDD); line(g, x - 3, y + 14, x - 4, y + 21, HK.robeD); line(g, x + 4, y + 14, x + 5, y + 21, HK.robeD);   /* pleats */
    rect(g, x - 10, y + 19, 20, 3, HK.trim); rect(g, x - 10, y + 19, 20, 1, HK.trimL); rect(g, x - 10, y + 21, 20, 1, HK.trimD); for (let k = -9; k < 10; k += 3) { px(g, x + k, y + 20, HK.trimD); }   /* the gilded hem, a run of knots */
    rect(g, x - 2 + bend, y - 1, 5, 2, HK.trim);   /* the clasp at the throat */
    hourglassChest(g, x + bend, y + (invert ? 14 : 4), sandLevel); };
  const shoulders = (g, x, y, bend = 0) => { for (const s of [-1, 1]) { ellipse(g, x + s * 11 + bend, y + 1, 4.6, 3.6, HK.brass); px(g, x + s * 11 + bend - 2, y - 1, HK.brassL); px(g, x + s * 11 + bend - 1, y - 2, HK.brassL); px(g, x + s * 11 + bend + 2, y + 3, HK.brassD);
    circle(g, x + s * 11 + bend, y + 1, 1.6, HK.brassDD); px(g, x + s * 11 + bend, y + 1, HK.eye); } };   /* brass pauldrons, a gear on each */
  const head = (g, x, y) => {
    fillPoly(g, [[x - 9, y - 2], [x - 6, y - 9], [x + 6, y - 9], [x + 9, y - 2], [x + 5, y + 3], [x - 5, y + 3]], HK.robeD); line(g, x - 8, y - 3, x - 5, y - 8, HK.robeL);   /* the fan collar behind the head */
    ellipse(g, x, y, 4.2, 4.6, HK.mask); px(g, x - 3, y - 2, HK.maskL); px(g, x - 3, y, HK.maskL); rect(g, x + 2, y - 1, 2, 4, HK.maskD); rect(g, x - 2, y + 3, 5, 2, HK.trim); px(g, x, y + 5, HK.trimD);   /* the mask, a gilded beard */
    rect(g, x - 3, y - 1, 3, 1, HK.dark); rect(g, x + 1, y - 1, 3, 1, HK.dark); px(g, x - 2, y - 1, HK.eye); px(g, x + 2, y - 1, HK.eye); px(g, x - 2, y - 1, HK.eyeL); rect(g, x, y + 1, 1, 2, HK.maskD);   /* slits, amber eyes, the nose */
    rect(g, x - 5, y - 6, 11, 2, HK.trim); rect(g, x - 5, y - 6, 11, 1, HK.trimL); px(g, x - 6, y - 5, HK.trimD);   /* the circlet */
    for (const [dx, dy, r] of [[-5, -9, 2.4], [0, -11, 3], [5, -9, 2.4]]) { circle(g, x + dx, y + dy, r, HK.brass); px(g, x + dx - 1, y + dy - 1, HK.brassL); px(g, x + dx, y + dy, HK.brassDD); for (let a = 0; a < 6; a++) px(g, x + dx + Math.cos(a * 1.05) * (r + 1), y + dy + Math.sin(a * 1.05) * (r + 1), HK.brassD); } };   /* the crown of gears */
  const arm = (g, x0, y0, x1, y1) => { thick(g, x0, y0, x1, y1, HK.robe, 4); thick(g, x0 - 1, y0, x1 - 1, y1, HK.robeL, 1); rect(g, x1 - 2, y1 - 1, 5, 2, HK.brass); px(g, x1 - 2, y1 - 1, HK.brassL); px(g, x1, y1 + 2, HK.skin); px(g, x1 + 1, y1 + 2, HK.skin); };   /* a sleeve, a brass cuff, a hand */
  const sceptre = (g, hx, hy, tx, ty) => { thick(g, hx, hy, tx, ty, HK.brass, 2); px(g, hx, hy, HK.brassL); circle(g, tx, ty, 3, HK.brass); circle(g, tx, ty, 1.4, HK.brassDD); px(g, tx - 1, ty - 2, HK.brassL); px(g, tx, ty, HK.eye); };   /* the pendulum: a rod and a heavy bob */
  const glowRing = (g, x, y, r, col) => { for (let a = 0; a < 20; a++) px(g, x + Math.round(Math.cos(a * 0.314) * r), y + Math.round(Math.sin(a * 0.314) * r), col); };
  const F = frames(W, H, 33, (g, f) => {
    const cx = 28, hip = gy - 24;
    /* (claude/bc3art, B16) EVERY NEW ABILITY ITS OWN WINDUP + RELEASE: 14 SURGE TELL (crouched, the sceptre reversed overhead in both fists, gold sand lifting) | 15 SURGE SLAM (bent
       over it, the bob driven into the floor, a gold crack and spray) | 16 GRASP TELL (kneeling, arms spread low, palms down, rust fingers of sand round his feet) | 20 GRASP RELEASE (fists
       hammered down, the hands up) | 17 RAIN TELL (the sceptre thrust at the glass roof, pale cracks) | 21 RAIN RELEASE (the sceptre swept down, shards in the air) | 18 SLIP TELL
       (arms crossed over a clock of violet light) | 19 SLIP STRIKE (a long lunge, violet after-images) | 8 SLIP RECOVER (stumbling, a hand to his glass) | 22 HOUR TELL
       (both arms up, the glass lit, sand drawn up out of the floor) | 23 HOUR RELEASE (arms flung out low, two rings of sand) | 24 TIDE CALL (arms in a V, the sceptre high, a swirl at his
       feet) | 25 DRAGGED INTO THE FLOW (the great glass pours up: lifted, tilted, robe and sand streaming up) */
    const VI = '#b08cff', VIL = '#e4d4ff', RU = '#d0703a', RUL = '#f0a060', ICE = '#bfe6f5', ICEL = '#f2fbff';
    const sandDots = (g, pts, c1 = HK.sandL, c2 = HK.sand) => pts.forEach(([x, y], i) => { px(g, x, y, i % 2 ? c1 : c2); if (i % 3 === 0) px(g, x + 1, y, c2); });
    if (f >= 14 || f === 8) { const crouch = { 14: 4, 15: 5, 16: 6, 20: 5, 17: 0, 21: 1, 18: 0, 19: 1, 8: 2, 22: 0, 23: 3, 24: 0, 26: 3, 27: 0, 28: 1, 29: 0, 30: 1, 31: 0, 32: 5 }[f] || 0, bend = { 15: 5, 19: 6, 20: 3, 8: -3, 21: 2, 23: 1, 27: -3, 28: 4, 30: 3 }[f] || 0;
      if (f === 25) { const o = 8;   /* DRAGGED: lifted off the floor, tilted back, the flow streaming up through him */
        thick(g, cx - 4, hip - 6 - o, cx - 8, hip + 10 - o, HK.robeD, 5); thick(g, cx + 4, hip - 6 - o, cx + 2, hip + 12 - o, HK.robeD, 5); rect(g, cx - 11, hip + 9 - o, 5, 2, HK.brassD); rect(g, cx - 1, hip + 11 - o, 5, 2, HK.brassD);
        robe(g, cx + 2, hip - 28 - o, 3); shoulders(g, cx + 2, hip - 28 - o, 3); head(g, cx + 6, hip - 36 - o); arm(g, cx + 12, hip - 26 - o, cx + 18, hip - 44 - o); arm(g, cx - 8, hip - 24 - o, cx - 14, hip - 42 - o);
        for (let k = 0; k < 14; k++) { const sx = cx - 18 + (k * 5) % 40, sy = hip - 46 + (k * 9) % 60 - o; px(g, sx, sy, k % 2 ? HK.sandL : HK.sand); px(g, sx, sy - 1, HK.sand); px(g, sx, sy - 2, HK.sandD); }
        for (let k = 0; k < 6; k++) { line(g, cx - 14 + k * 6, hip + 14, cx - 14 + k * 6, hip + 4 - (k % 3) * 4, HK.sandL); }
        return; }
      const dy = crouch;
      legs(g, cx, hip + dy, f === 19 ? 2 : f === 8 ? 1 : 0); if (f === 15 || f === 16 || f === 20) { rect(g, cx - 8, hip + dy + 14, 16, 3, HK.robeD); }
      robe(g, cx, hip - 22 + dy, bend); shoulders(g, cx, hip - 22 + dy, bend); head(g, cx + 1 + bend + (f === 24 ? -1 : 0), hip - 30 + dy + (f === 16 ? 2 : 0));
      const sh = [cx + 9 + bend, hip - 20 + dy], lh = [cx - 9 + bend, hip - 18 + dy];
      if (f === 14) { arm(g, ...sh, cx + 4, hip - 47); arm(g, ...lh, cx - 3, hip - 45); sceptre(g, cx + 1, hip - 46, cx + 1, hip - 62); glowRing(g, cx + 1, hip - 62, 6, '#f8dc90'); sandDots(g, [[cx - 14, hip + 16], [cx + 14, hip + 14], [cx - 9, hip + 10], [cx + 10, hip + 6], [cx - 16, hip + 4], [cx + 18, hip + 2], [cx - 5, hip - 2]]); }
      else if (f === 15) { arm(g, ...sh, cx + 20, hip + 2); arm(g, ...lh, cx + 13, hip + 1); sceptre(g, cx + 16, hip + 2, cx + 25, hip + 20); rect(g, cx + 20, hip + 20, 26, 2, HK.sandL); for (let k = 0; k < 6; k++) { rect(g, cx + 26 + k * 3, hip + 20 - (6 - k) * 2, 2, (6 - k) * 2, k % 2 ? HK.sand : HK.sandL); }
        line(g, cx + 24, hip + 22, cx + 36, hip + 28, HK.sandD); sandDots(g, [[cx + 30, hip + 6], [cx + 36, hip + 10], [cx + 42, hip + 4], [cx + 33, hip + 1]]); }
      else if (f === 16) { arm(g, ...sh, cx + 22, hip + 5); arm(g, ...lh, cx - 22, hip + 6); for (let k = -16; k <= 16; k += 4) { const h2 = 4 + (Math.abs(k) * 7) % 7; rect(g, cx + k, hip + 22 - h2, 2, h2, RU); rect(g, cx + k, hip + 22 - h2, 2, 1, RUL); px(g, cx + k - 1, hip + 22 - h2 + 2, RU); px(g, cx + k + 2, hip + 22 - h2 + 3, RU); } glowRing(g, cx, hip + 20, 18, RU); }
      else if (f === 20) { arm(g, ...sh, cx + 18, hip + 14); arm(g, ...lh, cx + 8, hip + 15); rect(g, cx + 16, hip + 13, 4, 4, HK.skin); rect(g, cx + 6, hip + 14, 4, 4, HK.skin); for (let k = -4; k <= 4; k++) { const h2 = 8 + (Math.abs(k) * 5) % 8; line(g, cx + 12 + k * 4, hip + 22, cx + 12 + k * 4 + (k > 0 ? 2 : -2), hip + 22 - h2, RU); px(g, cx + 12 + k * 4 + (k > 0 ? 2 : -2), hip + 22 - h2, RUL); px(g, cx + 12 + k * 4 + (k > 0 ? 3 : -3), hip + 22 - h2 + 1, RUL); } }
      else if (f === 17) { arm(g, ...sh, cx + 7, hip - 52); arm(g, ...lh, cx - 9, hip - 42); sceptre(g, cx + 7, hip - 52, cx + 7, hip - 70); for (const [a, b, c2, d2] of [[3, -74, 10, -80], [10, -74, 15, -69], [7, -76, 6, -84], [1, -70, -5, -74], [12, -78, 18, -82]]) line(g, cx + a, hip + b, cx + c2, hip + d2, ICE); px(g, cx + 7, hip - 75, ICEL); px(g, cx + 8, hip - 75, ICEL); }
      else if (f === 21) { arm(g, ...sh, cx + 18, hip - 18); arm(g, ...lh, cx - 8, hip - 14); sceptre(g, cx + 18, hip - 18, cx + 28, hip - 6); for (let k = 0; k < 10; k++) { const sx = cx - 18 + k * 5, sy = hip - 62 + (k * 13) % 34; fillPoly(g, [[sx, sy], [sx + 2, sy + 1], [sx + 1, sy + 6]], k % 2 ? ICE : '#9ac8e0'); px(g, sx, sy, ICEL); } }
      else if (f === 18) { arm(g, ...sh, cx - 6, hip - 15); arm(g, ...lh, cx + 6, hip - 13); circle(g, cx, hip - 10, 11, 'rgba(176,140,255,0.38)'); for (let a = 0; a < 12; a++) px(g, cx + Math.round(Math.cos(a * 0.52) * 12), hip - 10 + Math.round(Math.sin(a * 0.52) * 12), a % 3 ? VI : VIL);
        line(g, cx, hip - 10, cx, hip - 18, VIL); line(g, cx, hip - 10, cx + 5, hip - 10, VIL);
        for (let k = 0; k < 8; k++) { px(g, cx - 20 + (k * 7) % 40, hip - 48 + (k * 11) % 44, VI); px(g, cx - 19 + (k * 5) % 38, hip - 44 + (k * 13) % 40, VIL); } }
      else if (f === 19) { arm(g, ...sh, cx + 25, hip - 18); arm(g, ...lh, cx - 6, hip - 12); sceptre(g, cx + 25, hip - 18, cx + 33, hip - 19); for (let k = 1; k < 6; k++) { thick(g, cx + 25 - k * 7, hip - 18 + (k % 2), cx + 31 - k * 7, hip - 18 + (k % 2), k % 2 ? 'rgba(176,140,255,' + (0.6 - k * 0.09).toFixed(2) + ')' : 'rgba(228,212,255,' + (0.5 - k * 0.07).toFixed(2) + ')', 2); }
        for (let k = 0; k < 6; k++) px(g, cx - 14 - k * 3, hip - 36 + k * 5, VI); line(g, cx + 35, hip - 24, cx + 41, hip - 18, VIL); }
      else if (f === 8) { arm(g, ...sh, cx + 6, hip - 14 + dy); arm(g, ...lh, cx - 16, hip - 6); for (let k = 0; k < 7; k++) px(g, cx + 12 - k * 4, hip - 36 + k * 3, k % 2 ? VI : VIL); circle(g, cx + bend, hip - 16 + dy, 5, 'rgba(176,140,255,0.28)'); }
      else if (f === 22) { arm(g, ...sh, cx + 16, hip - 40); arm(g, ...lh, cx - 16, hip - 38); sceptre(g, cx + 16, hip - 40, cx + 19, hip - 52); glowRing(g, cx, hip - 14, 9, '#ffd36b'); for (let k = -3; k <= 3; k++) line(g, cx + k * 4, hip + 14, cx + k * 4 + (k > 0 ? 1 : -1), hip + 14 - (6 + Math.abs(k) * 2), k % 2 ? HK.sandL : HK.sand); }
      else if (f === 23) { arm(g, ...sh, cx + 24, hip + 2); arm(g, ...lh, cx - 24, hip + 3); for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { rect(g, cx + s * (16 + k * 6) - 1, hip + 18 - (3 - k) * 3, 3, (3 - k) * 3, k % 2 ? HK.sand : HK.sandL); } }
      /* (claude/bc4art: the seven new poses, finished) 26 WITHDRAW: hunched, arms wrapped across the glass, his legs sunk in a whirl of sand that climbs his robe in a spiral | 27 SHARD TELL: the throwing arm cocked back over
         his head, three jagged shards fanned between the fingers with a glint on each tip, the other hand levelled at you | 28 SHARD THROW: the arm whipped through, the shards leaving the hand in streaks | 29 POT TELL: a
         painted clay pot of sand hoisted over his head in both fists, sand trickling from its neck, his back arched | 30 POT THROW: both arms driven forward-up, the pot just let go, a trail of sand behind it | 31 HOLDING THE SAND:
         arms flung out and up, palms up, gold sand streaming up off them, a gold ring at his glass, the head thrown back (the open pose) | 32 RAISE TELL: crouched low, palms flat down either side, columns of sand drawn up
         between them, a gold ring on the floor */
      else if (f === 26) { arm(g, ...sh, cx - 2, hip - 11 + dy); arm(g, ...lh, cx + 5, hip - 9 + dy); rect(g, cx - 10, hip - 10 + dy, 18, 2, HK.robeD);
        ellipse(g, cx, hip + 20, 14, 3.6, '#b98c58'); ellipse(g, cx, hip + 19, 12, 2.6, HK.sand); rect(g, cx - 10, hip + 18, 20, 1, HK.sandL); rect(g, cx - 14, hip + 22, 28, 1, HK.sandD);   /* the whirl at his feet */
        for (let a = 0; a < 26; a++) { const t = a / 26, ang = t * 9.4, r2 = 15 - t * 6; px(g, cx + Math.round(Math.cos(ang) * r2), hip + 19 - Math.round(t * 30) + Math.round(Math.sin(ang) * 2), a % 2 ? HK.sandL : HK.sand); if (a % 4 === 0) px(g, cx + Math.round(Math.cos(ang) * r2) + 1, hip + 19 - Math.round(t * 30), HK.sandD); }   /* the spiral climbing him */
        sandDots(g, [[cx - 16, hip + 6], [cx + 17, hip + 3], [cx - 18, hip - 6], [cx + 15, hip - 12], [cx - 13, hip - 18]]); }
      else if (f === 27) { arm(g, ...sh, cx - 9, hip - 46); arm(g, ...lh, cx + 20, hip - 28); line(g, cx + 22, hip - 29, cx + 30, hip - 31, HK.skin); for (let k = 0; k < 3; k++) px(g, cx + 34 + k * 3, hip - 32 + (k & 1), HK.trimL);   /* the aiming hand, a finger levelled; a ticked line to you */
        for (const [a, l] of [[-2.0, 11], [-1.62, 13], [-1.2, 11]]) kShard(g, cx - 9, hip - 50, a, l); for (const [dx, dy2] of [[-14, -60], [-9, -64], [-4, -62]]) { px(g, cx + dx, hip + dy2, '#ffffff'); px(g, cx + dx + 1, hip + dy2, ICEL); px(g, cx + dx, hip + dy2 - 1, ICEL); } }   /* the glints on the tips */
      else if (f === 28) { arm(g, ...sh, cx + 26, hip - 25); arm(g, ...lh, cx - 13, hip - 13); for (let k = 0; k < 3; k++) { const y0 = hip - 30 + k * 5; line(g, cx + 26, hip - 25, cx + 33 + k, y0 + 1, ICEL); thick(g, cx + 33 + k, y0 + 1, cx + 40, y0 + 5 + k * 2, ICE, 1); fillPoly(g, [[cx + 39, y0 + 3 + k * 2], [cx + 45, y0 + 5 + k * 2], [cx + 39, y0 + 8 + k * 2]], ICE); line(g, cx + 39, y0 + 4 + k * 2, cx + 44, y0 + 5 + k * 2, '#ffffff'); }
        for (let k = 0; k < 5; k++) line(g, cx + 14 - k * 3, hip - 38 + k * 4, cx + 22 - k * 3, hip - 34 + k * 4, 'rgba(223,242,255,0.55)'); }   /* the arm's blur */
      else if (f === 29) { arm(g, ...sh, cx + 5, hip - 47); arm(g, ...lh, cx - 6, hip - 47); kPot(g, cx, hip - 56, 7); sandDots(g, [[cx - 2, hip - 66], [cx + 2, hip - 68], [cx, hip - 70], [cx + 3, hip - 64]]); for (let k = 0; k < 4; k++) px(g, cx + 6 + k, hip - 60 - k * 2, HK.sandL); }
      else if (f === 30) { arm(g, ...sh, cx + 21, hip - 39); arm(g, ...lh, cx + 15, hip - 36); kPot(g, cx + 31, hip - 48, 7, 1); for (let k = 0; k < 7; k++) { px(g, cx + 24 - k * 3, hip - 42 + k * 2, k % 2 ? HK.sandL : HK.sand); px(g, cx + 23 - k * 3, hip - 43 + k * 2, HK.sandD); }
        for (let k = 0; k < 3; k++) line(g, cx + 36 + k * 3, hip - 56 - k * 2, cx + 40 + k * 3, hip - 56 - k * 2, 'rgba(240,216,160,0.6)'); }
      else if (f === 31) { arm(g, ...sh, cx + 20, hip - 35); arm(g, ...lh, cx - 20, hip - 35); glowRing(g, cx, hip - 14, 9, '#ffd36b'); glowRing(g, cx, hip - 14, 12, '#f8dc90'); circle(g, cx, hip - 14, 4, 'rgba(255,211,107,0.35)');   /* the open pose: his glass ringed in gold */
        for (const s2 of [-1, 1]) { rect(g, cx + s2 * 20 - 2, hip - 38, 5, 2, HK.skin); for (let k = 0; k < 6; k++) { const sx = cx + s2 * (19 + (k % 3) * 2 + (k >> 1)), sy = hip - 40 - k * 4; line(g, sx, sy, sx - s2, sy - 3, k % 2 ? HK.sandL : '#ffd36b'); px(g, sx + s2, sy - 1, '#fff4c0'); } }
        for (let a = 0; a < 6; a++) px(g, cx - 16 + a * 6, hip + 20 - (a % 2), HK.sandL); }
      else if (f === 32) { arm(g, ...sh, cx + 19, hip + 7); arm(g, ...lh, cx - 19, hip + 7); rect(g, cx - 22, hip + 9, 5, 2, HK.skin); rect(g, cx + 17, hip + 9, 5, 2, HK.skin);   /* palms flat on the floor */
        for (let k = -4; k <= 4; k++) { const h2 = 5 + (Math.abs(k) * 3) % 7; rect(g, cx + k * 4, hip + 22 - h2, 3, h2, k % 2 ? HK.sand : HK.sandL); px(g, cx + k * 4, hip + 22 - h2, '#fff4c0'); }
        for (let a = 0; a < 20; a++) px(g, cx + Math.round(Math.cos(a * 0.314) * 22), hip + 21 + Math.round(Math.sin(a * 0.314) * 3), a % 2 ? '#ffd36b' : HK.trimL); glowRing(g, cx, hip + 18, 17, '#ffd36b'); }
      else if (f === 24) { arm(g, ...sh, cx + 18, hip - 44); arm(g, ...lh, cx - 18, hip - 44); sceptre(g, cx + 18, hip - 44, cx + 22, hip - 62); glowRing(g, cx + 22, hip - 62, 5, RUL); for (let a = 0; a < 18; a++) { const rr = 10 + a * 0.9; px(g, cx + Math.round(Math.cos(a * 0.7) * rr), hip + 20 + Math.round(Math.sin(a * 0.7) * 2), a % 2 ? RUL : HK.sand); } }
      return; }
    if (f === 11) { legs(g, cx, hip, 0); robe(g, cx, hip - 22, 0); shoulders(g, cx, hip - 22); head(g, cx + 1, hip - 30);   /* OPEN / STALLED: the glass empty, frozen mid-gesture */
      arm(g, cx + 9, hip - 20, cx + 15, hip - 26); arm(g, cx - 9, hip - 18, cx - 15, hip - 22); sceptre(g, cx + 15, hip - 26, cx + 20, hip - 34);
      for (const [dx, dy] of [[6, -38], [12, -34], [0, -42], [16, -40], [-6, -40]]) { px(g, cx + dx, hip + dy, HK.eye); px(g, cx + dx + 1, hip + dy, HK.eyeL); } return; }
    if (f === 12) { const bx = cx, o = 12;   /* TURNING OVER: tumbling, legs kicked up, the head near the ground */
      thick(g, bx - 5, 16 + o, bx - 8, 4 + o, HK.robeD, 5); thick(g, bx + 5, 16 + o, bx + 9, 5 + o, HK.robeD, 5); rect(g, bx - 11, 1 + o, 5, 2, HK.brassD); rect(g, bx + 6, 2 + o, 5, 2, HK.brassD);
      fillPoly(g, [[bx - 10, 14 + o], [bx + 10, 14 + o], [bx + 8, 38 + o], [bx - 8, 38 + o]], HK.robe); fillPoly(g, [[bx - 8, 15 + o], [bx + 8, 15 + o], [bx + 6, 26 + o], [bx - 6, 26 + o]], HK.robeL); rect(g, bx - 9, 14 + o, 18, 3, HK.trim);
      hourglassChest(g, bx, 20 + o, sandLevel); head(g, bx + 2, gy - 6); arm(g, bx - 8, 18 + o, bx - 14, 30 + o); arm(g, bx + 8, 18 + o, bx + 14, 30 + o); return; }
    const ph = f === 1 ? 1 : f === 2 ? 2 : 0, dy = f === 13 ? 2 : 0, bend = f === 13 ? -3 : 0;
    legs(g, cx, hip + dy, ph); robe(g, cx, hip - 22 + dy, bend); shoulders(g, cx, hip - 22 + dy, bend); head(g, cx + 1 + bend, hip - 30 + dy);
    const sh = [cx + 9 + bend, hip - 20 + dy], lh = [cx - 9 + bend, hip - 18 + dy];
    if (f === 3) { arm(g, ...sh, cx + 6, hip - 40); sceptre(g, cx + 6, hip - 40, cx + 2, hip - 52); arm(g, ...lh, cx - 10, hip - 10); }
    else if (f === 4) { arm(g, ...sh, cx + 4, hip - 38); sceptre(g, cx + 4, hip - 38, cx + 4, hip - 50); rect(g, cx + 1, hip - 50, 6, 46, HK.glassL); rect(g, cx + 2, hip - 50, 1, 46, HK.sandL); arm(g, ...lh, cx - 10, hip - 10); }
    else if (f === 5) { arm(g, ...sh, cx + 4, hip - 30); arm(g, ...lh, cx - 12, hip - 8); }
    else if (f === 6) { arm(g, ...sh, cx + 20, hip - 12); circle(g, cx + 24, hip - 10, 3, HK.brass); for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) px(g, cx + 24 + Math.cos(a) * 4, hip - 10 + Math.sin(a) * 4, HK.brassD); arm(g, ...lh, cx - 10, hip - 10); }
    else if (f === 7) { arm(g, ...sh, cx + 12, hip - 8); arm(g, ...lh, cx - 12, hip - 8); rect(g, cx - 14, hip - 24, 28, 24, HK.ghost); }
    else if (f === 9) { arm(g, ...sh, cx + 14, hip - 30); arm(g, ...lh, cx - 10, hip - 10); sceptre(g, cx + 14, hip - 30, cx + 20, hip - 20); }
    else if (f === 10) { arm(g, ...sh, cx + 4, hip + 2); arm(g, ...lh, cx - 10, hip - 10); sceptre(g, cx + 4, hip + 2, cx + 16, hip + 8); }
    else if (f === 13) { arm(g, ...sh, cx + 14, hip - 4 + dy); arm(g, ...lh, cx - 12, hip - 2 + dy); }
    else { arm(g, ...sh, cx + 8, hip - 4 + dy); arm(g, ...lh, cx - 10, hip - 10 + dy); sceptre(g, cx + 8, hip - 4 + dy, cx + 10, hip + 12 + dy); }   /* idle: the pendulum hangs at his side */
  });
  return pack(F, 28, H, 22, 38);
}
export function bakeCog() {
  const F = [];
  for (let f = 0; f < 2; f++) { const [c, g] = canvas(14, 14);
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + (f ? Math.PI / 8 : 0); rect(g, Math.round(7 + Math.cos(a) * 5.4) - 1, Math.round(7 + Math.sin(a) * 5.4) - 1, 2, 2, HK.brassD); }   /* the teeth */
    circle(g, 7, 7, 5, HK.brass); px(g, 4, 4, HK.brassL); px(g, 5, 3, HK.brassL); px(g, 3, 5, HK.brassL); circle(g, 7, 7, 2.4, HK.brassDD); circle(g, 7, 7, 1, HK.dark); px(g, 7, 7, HK.eye);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + (f ? 0.4 : 0); px(g, Math.round(7 + Math.cos(a) * 3.6), Math.round(7 + Math.sin(a) * 3.6), HK.brassD); }
    F.push(outline(c, OUT)); }
  return F;
}

// ================= THE SAND-BOUND (claude/bc4art: the finished sprite set, its OWN skin) =================
//   bakeSandBound()      THE SAND-BOUND (the ambusher's machine, 9 frames: 0 BURIED (a mound, two eyes) | 1 RISING | 2,3 walk | 4 SLAM TELL (both sand-fists hauled up over the head, sand
//                        streaming up off them, a ring of grains lifting at its feet) | 5 SLAM (driven down in front, the crust cracking, a wave of sand thrown) | 6 (unused: it never burrows,
//                        drawn as the mound) | 7 hurt | 8 BURIED TO THE CHEST (its glass runs: sand to the ribs, a collar of sand round it, arms thrown up, the eyes wide))
//                        - one of the drowned the sand grew over: a carapace of packed sand in strata on the shoulders and back with splinters of the hourglass's glass grown through it, a brass
//                        chain of the glass that binds it (its tether) round the neck, clubbed fists of sand, teal-less amber eyes in a sand-capped skull, grains trickling off it. Its OWN poses (B16):
//                        the slam is not the drowned's knife cut
const SB = { crust: '#c8a064', crustL: '#ecc988', crustLL: '#fbe6b0', crustD: '#8a6a3c', crustDD: '#5a4224', bone: '#d6cbac', boneD: '#a89c7c', wrap: '#a89878', wrapD: '#7a6c52', wrapDD: '#52462e', dark: '#16100c',
  eye: '#ffb84a', eyeL: '#fff0c0', gold: '#d8aa40', goldL: '#f6dc80', goldD: '#8a6a20', glass: '#9ad8e0', glassL: '#e6fbff', glassD: '#4a8a9c', chain: '#7a6a3c' };
export function bakeSandBound() {
  const W = 48, H = 34, cx = 17, gy = 32;
  const crustBlock = (g, x, y, w, h) => { rect(g, x, y, w, h, SB.crust); for (let k = 1; k < h; k += 3) rect(g, x, y + k, w, 1, k % 6 === 1 ? SB.crustL : SB.crustD); px(g, x, y, SB.crustLL); px(g, x + w - 1, y + h - 1, SB.crustDD); };
  const fist = (g, x, y, big = 0) => { ellipse(g, x, y, 3.4 + big, 3 + big, SB.crust); ellipse(g, x - 1, y - 1, 2.2, 1.6, SB.crustL); px(g, x - 2, y - 2, SB.crustLL); px(g, x + 2, y + 2, SB.crustD); px(g, x + 3, y, SB.crustD); px(g, x, y + 3 + big, SB.crustD);
    px(g, x + 1, y - 1, SB.glass); px(g, x + 1, y, SB.glassL); px(g, x - 2, y + 2, SB.glassD); };   /* a fist clubbed in sand, a sliver of glass glinting in it */
  const arm = (g, x0, y0, x1, y1, big = 0) => { thick(g, x0, y0, x1, y1, SB.crustD, 3); line(g, x0, y0 - 1, x1, y1 - 1, SB.crust); line(g, x0, y0 - 1, (x0 + x1) / 2, (y0 + y1) / 2 - 1, SB.crustL); px(g, (x0 + x1) / 2, (y0 + y1) / 2, SB.wrap); fist(g, x1, y1, big); };
  const head = (g, x, y, mouth = 0) => { ellipse(g, x, y, 3.6, 3.6, SB.bone); px(g, x - 2, y - 1, SB.boneD); px(g, x + 3, y + 1, SB.boneD); rect(g, x - 2, y + 2, 5, 1, SB.boneD);
    rect(g, x - 2, y - 1, 2, 2, SB.dark); rect(g, x + 1, y - 1, 2, 2, SB.dark); px(g, x - 1, y - 1, SB.eye); px(g, x + 2, y - 1, SB.eye); px(g, x - 1, y - 2, SB.eyeL); px(g, x + 2, y - 2, SB.eyeL);   /* sockets with amber eyes */
    rect(g, x - 1, y + 2 + mouth, 3, 1 + mouth, SB.dark);
    ellipse(g, x - 0.5, y - 3, 4.8, 2.6, SB.crust); rect(g, x - 4, y - 4, 9, 1, SB.crustL); px(g, x - 3, y - 5, SB.crustLL); px(g, x + 2, y - 5, SB.crustLL); px(g, x + 3, y - 3, SB.crustD); px(g, x - 4, y - 2, SB.crustD); px(g, x, y - 4, SB.crustD);   /* a cap of packed sand, banded */
    px(g, x + 1, y - 6, SB.glass); px(g, x + 1, y - 7, SB.glassL); if (mouth) { px(g, x, y + 4 + mouth, SB.crustL); px(g, x, y + 5 + mouth, SB.crust); } else { px(g, x, y + 3, SB.crustL); } };   /* a shard of glass grown out of the crown */
  const body = (g, x, y, legs, lean = 0) => { const [a, b] = legs;
    crustBlock(g, x - 3 + a, y + 10, 4, 4); crustBlock(g, x + 1 + b, y + 10, 4, 4); px(g, x - 2 + a, y + 13, SB.crustDD); px(g, x + 2 + b, y + 13, SB.crustDD);   /* legs grown thick into sand */
    fillPoly(g, [[x - 5 + lean, y], [x + 5 + lean, y], [x + 6, y + 11], [x - 6, y + 11]], SB.wrap); line(g, x - 4, y + 3, x + 4, y + 5, SB.wrapD); line(g, x - 5, y + 8, x + 5, y + 9, SB.wrapDD);
    for (let i = -5; i <= 5; i += 2) px(g, x + i, y + 11 + (i & 2 ? 1 : 0), SB.wrapD);   /* the hem in rags */
    fillPoly(g, [[x - 8 + lean, y - 2], [x + 8 + lean, y - 2], [x + 7, y + 6], [x - 7, y + 6]], SB.crust);   /* THE CARAPACE: strata of packed sand over the shoulders and back */
    rect(g, x - 8 + lean, y - 2, 16, 1, SB.crustL); for (const [ly, c] of [[0, SB.crustD], [2, SB.crustL], [4, SB.crustD]]) rect(g, x - 7 + lean, y + ly, 14, 1, c); px(g, x - 8 + lean, y - 2, SB.crustLL); px(g, x + 7 + lean, y + 5, SB.crustDD);
    for (const [dx, dy, h] of [[-5, 0, 2], [-1, 1, 3], [4, 0, 2]]) { rect(g, x + dx + lean, y + dy, 1, h, SB.glass); px(g, x + dx + lean, y + dy, SB.glassL); px(g, x + dx + lean, y + dy + h, SB.glassD); }   /* splinters of the glass that binds it, grown through the shell */
    rect(g, x - 4, y + 6, 9, 1, SB.chain); for (let i = -4; i <= 4; i += 2) px(g, x + i, y + 7, SB.gold); px(g, x, y + 8, SB.goldL); px(g, x, y + 9, SB.goldD);   /* the brass chain of its glass, a tag hanging */
    px(g, x - 7 + lean, y + 6, SB.crustL); px(g, x + 8, y + 7, SB.crustL); px(g, x + 9, y + 9, SB.crust); px(g, x - 8, y + 8, SB.crust); };   /* grains trickling off it */
  const mound = (g, x, h, crack = false) => { fillPoly(g, [[x - 15, gy], [x - 7, gy - h], [x + 7, gy - h], [x + 15, gy]], SB.crust); rect(g, x - 7, gy - h, 14, 1, SB.crustL); for (let k = 2; k < h; k += 3) rect(g, x - 12 + k, gy - h + k, 24 - k * 2, 1, SB.crustD);
    for (let i = 0; i < 7; i++) px(g, x - 12 + i * 4, gy - 1, SB.crustD); px(g, x - 3, gy - h, SB.crustLL); if (crack) { line(g, x - 3, gy - h, x + 1, gy - 2, SB.crustDD); } };
  const spray = (g, pts) => pts.forEach(([x, y], i) => { px(g, x, y, i % 2 ? SB.crustL : SB.crust); if (i % 3 === 0) px(g, x + 1, y + 1, SB.crustD); });
  const F = frames(W, H, 9, (g, f) => {
    if (f === 0 || f === 6) { mound(g, cx, f === 0 ? 5 : 4, true); px(g, cx - 2, gy - 4, SB.eye); px(g, cx + 2, gy - 4, SB.eye); px(g, cx - 2, gy - 5, SB.eyeL); px(g, cx + 2, gy - 5, SB.eyeL); rect(g, cx + 6, gy - 11, 1, 3, SB.glass); px(g, cx + 6, gy - 11, SB.glassL); return; }   /* BURIED: a mound, a glass splinter standing out of it, two amber eyes */
    if (f === 8) { const by = gy - 13; body(g, cx, by, [0, 0]); head(g, cx + 1, by - 4, 1); arm(g, cx - 6, by, cx - 12, by - 8, 0.4); arm(g, cx + 7, by, cx + 14, by - 6, 0.4); mound(g, cx, 9);   /* BURIED TO THE CHEST: the sand to its ribs, arms thrown up, mouth open */
      ellipse(g, cx, gy - 10, 12, 2.6, SB.crustD); rect(g, cx - 12, gy - 11, 24, 1, SB.crustL); for (let i = 0; i < 9; i++) { px(g, cx - 10 + i * 2.5, gy - 12 - (i % 3), SB.crustL); px(g, cx - 9 + i * 2.5, gy - 14 - (i % 4), SB.crust); }
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) px(g, cx + s * (11 + k * 2), gy - 19 - k * 2, k % 2 ? SB.crustLL : SB.crustL); return; }
    if (f === 1) { body(g, cx, gy - 15, [0, 0], 1); head(g, cx + 1, gy - 19, 1); mound(g, cx, 7); spray(g, [[cx - 9, gy - 20], [cx - 6, gy - 16], [cx - 10, gy - 13], [cx + 9, gy - 19], [cx + 8, gy - 14], [cx + 11, gy - 11], [cx - 3, gy - 22], [cx + 4, gy - 23]]); return; }   /* RISING: sand pouring off the shell */
    const by = gy - 15; const legs = f === 2 ? [0, 1] : f === 3 ? [1, 0] : [0, 0];
    if (f === 7) { body(g, cx - 1, by + 1, [0, 0], -1); head(g, cx - 2, by - 3, 1); arm(g, cx - 6, by + 2, cx - 9, by + 8); arm(g, cx + 6, by + 2, cx + 8, by + 9); spray(g, [[cx + 10, by - 2], [cx + 12, by - 5], [cx + 9, by - 7], [cx - 11, by + 1]]); return; }   /* hurt: rocked back, the shell flaking */
    if (f === 4) { body(g, cx, by + 1, [0, 0], -1); head(g, cx - 1, by - 3, 1); arm(g, cx - 6, by - 1, cx - 7, by - 13, 0.8); arm(g, cx + 6, by - 1, cx + 4, by - 14, 0.8);   /* SLAM TELL: hunched, both fists hauled up over the head, sand running up off them */
      for (let k = 0; k < 6; k++) { px(g, cx - 9 + k * 2, by - 17 - (k % 3), k % 2 ? SB.crustL : SB.crustLL); px(g, cx - 8 + k * 2, by - 20 - (k % 4), SB.crust); }
      for (let a = 0; a < 14; a++) px(g, cx - 13 + a * 2, gy - 1 - (a % 3), a % 2 ? SB.crustL : SB.crust); return; }   /* a ring of grains lifting at its feet */
    if (f === 5) { body(g, cx + 2, by + 2, [1, 0], 3); head(g, cx + 6, by - 1, 1); arm(g, cx - 2, by + 3, cx + 11, by + 10, 1); arm(g, cx + 6, by + 3, cx + 15, by + 9, 1);   /* SLAM: bent over it, both fists driven down in front */
      fillPoly(g, [[cx + 10, gy], [cx + 14, gy - 5], [cx + 22, gy - 3], [cx + 25, gy]], SB.crust); rect(g, cx + 14, gy - 5, 8, 1, SB.crustL); line(g, cx + 13, gy, cx + 18, gy - 4, SB.crustDD);
      spray(g, [[cx + 18, gy - 10], [cx + 22, gy - 12], [cx + 26, gy - 9], [cx + 15, gy - 12], [cx + 28, gy - 5], [cx + 25, gy - 14], [cx + 20, gy - 15]]); return; }
    body(g, cx, by, legs); head(g, cx + 1, by - 4);
    arm(g, cx - 6, by + 1, cx - 8, by + 9 + (f === 2 ? 1 : 0)); arm(g, cx + 6, by + 1, cx + 9, by + 8 + (f === 3 ? 1 : 0));   /* walking: the heavy arms swinging low */
  });
  return pack(F, cx, H, 14, 20);
}
