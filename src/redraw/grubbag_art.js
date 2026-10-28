// grubbag_art.js - LORD GRUBBAG THE GLUTTON's art (claude/kitchengateart; REDRAWN BIG by claude/grubbagbig, 2026-10-25): him, his reinforced chair, the high table and its
// gravy tureen, the pie oven and its hatch, the bellows, the serving line's dishes and the POWDER PIE.
// Daniel 10-25: "He should be enormous ... about double the size of the queen. Be extremely fat." The Goblin Queen (src/chars.js bakeGoblinQueen) stands 102 x 65 px; he now
// sits ~225 x 157 px (2.2x her across, 2.4x her height to his circlet) in a chair that stands 180: a belly that is most of him, rolls on his flanks spilling over the chair's
// arms, three chins on the queen's own ermine collar, and a head no bigger than it was (tiny on top of all that). Every pixel is drawn at this size (no upscale).
// The drawing contract is src/grubbag-hands.js POSE (B16: every move its own windup and release pose) - this file only changes how a pose is DRAWN, never what poses there are.
// Local px, facing right, his seat on the floor at 0,0. The hurt box (src/grubbag.js GB.w x GB.h) is his belly and chest; the fork's stab, the grab's hand, the belch and the
// gravy all start where this art puts them (GB.fork.reach, GB.grab, GB.flood.from).
// PERFORMANCE: he is ~40x the pixels he was, so each pose is BAKED once (a canvas per pose, and per chew frame) and blitted; only the small live bits (a held dish, the belch's
// rings, smoke, the zzz, the cough) are drawn each frame. A flash is the baked pose whitened (px.whiten), also cached.
import { ellipse, line, fillPoly, rect, canvas, whiten } from '../px.js';
const R = Math.round;
export const SK = { out: '#1a1410', skin: '#7a8a52', skinD: '#5e6c3c', skinDD: '#3f4a26', skinL: '#93a466', skinLL: '#b4c488', fat: '#9aa868', robe: '#6a2a3a', robeD: '#4a1a28', robeDD: '#2e0f18', robeL: '#8e3c50', trim: '#ffd36b', trimD: '#b08a30',
  oak: '#4a3020', oakD: '#2a1a10', oakL: '#6e4a2e', oakLL: '#8e6440', iron: '#3a3a42', ironD: '#22222a', ironL: '#7a7a86', ironLL: '#b0b0bc', bib: '#e8e0d0', bibD: '#b8ae98', gravy: '#7a4a22', gravyL: '#a8743a',
  eye: '#ffe9a0', red: '#ff4a2a', mouth: '#2a0e0e', tooth: '#efe6cf', toothD: '#b8ac90', dish: '#c8ccd4', dishD: '#8a8e96', food: '#a0602a', foodL: '#d08a44', pie: '#c0302a', pieL: '#ff8a5c', pieD: '#7a1a18',
  copper: '#b8673a', copperL: '#e09a5c', copperD: '#6a3418', ermine: '#f2ece0', ermineD: '#c8c0ae', flush: '#a85a42', flushL: '#c8785a', flushD: '#7e3a2a' };
/* the size other files read: where his parts are (local px, facing right, seat at 0,0) */
export const BIG = { shoulder: [56, -104], farShoulder: [-60, -104], mouth: [30, -129], tureen: [104, -40], chairTop: -184, width: 232, height: 157 };
const mk = (g, flash) => {
  const c = col => (flash ? '#ffffff' : col);
  return { c, r: (x, y, w, h, col) => rect(g, R(x), R(y), R(w), R(h), c(col)), e: (cx, cy, rx, ry, col) => ellipse(g, R(cx), R(cy), rx, ry, c(col)), l: (x0, y0, x1, y1, col, t = 1) => line(g, R(x0), R(y0), R(x1), R(y1), c(col), t),
    p: (pts, col) => fillPoly(g, pts.map(q => [R(q[0]), R(q[1])]), c(col)),
    /* an arc of an ellipse, plotted pixel by pixel (a crease, a rim): a0..a1 radians, 0 = +x, PI/2 = down */
    a: (cx, cy, rx, ry, a0, a1, col, th = 1) => { g.fillStyle = c(col); const n = Math.max(8, R((Math.abs(a1 - a0) * Math.max(rx, ry)) * 1.6)); for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n; g.fillRect(R(cx + Math.cos(t) * rx), R(cy + Math.sin(t) * ry), 1, th); } },
    /* a capsule (a fat limb): a quad and two round ends */
    cap: (x0, y0, x1, y1, r, col) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * r, ny = dx / L * r;
      fillPoly(g, [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]].map(q => [R(q[0]), R(q[1])]), c(col)); ellipse(g, R(x0), R(y0), r, r, c(col)); ellipse(g, R(x1), R(y1), r, r, c(col)); } };
};
/* ---------------------------------------------------------------- THE CHAIR: a throne of oak bolted to the floor and banded in iron to carry him; boar skulls on the posts ---------------------------------------------------------------- */
function chair(g) {
  const k = mk(g, false);
  /* the back panel (only its crown shows over his shoulders, and its posts at his sides) */
  k.p([[-104, -146], [-60, -168], [46, -168], [90, -146], [90, -30], [-104, -30]], SK.out);
  k.p([[-102, -145], [-59, -166], [45, -166], [88, -145], [88, -30], [-102, -30]], SK.oak);
  for (let x = -94; x < 86; x += 15) { k.l(x, -160 + Math.max(0, 20 - Math.abs(x + 7) * 0.25), x, -32, SK.oakD); k.l(x + 1, -158 + Math.max(0, 20 - Math.abs(x + 7) * 0.25), x + 1, -32, SK.oakL); }   /* the planks */
  k.p([[-102, -145], [-59, -166], [45, -166], [88, -145], [84, -142], [44, -162], [-58, -162], [-98, -142]], SK.oakLL);   /* the crest's lit edge */
  for (const y of [-154, -124, -94, -64]) { k.r(-103, y, 192, 6, SK.ironD); k.r(-103, y, 192, 1, SK.ironL); k.r(-103, y + 5, 192, 1, SK.out); for (let x = -98; x < 86; x += 12) k.r(x, y + 2, 2, 2, SK.ironLL); }   /* iron bands, riveted */
  /* the posts: square oak, capped in iron, a boar skull on each */
  for (const x of [-116, 86]) {
    k.r(x - 1, -164, 16, 164, SK.out); k.r(x, -163, 14, 163, SK.oak); k.r(x, -163, 3, 163, SK.oakLL); k.r(x + 11, -163, 3, 163, SK.oakD);
    for (const y of [-146, -108, -70, -30]) { k.r(x - 2, y, 18, 7, SK.out); k.r(x - 1, y + 1, 16, 5, SK.iron); k.r(x - 1, y + 1, 16, 1, SK.ironLL); k.r(x + 2, y + 3, 2, 2, SK.ironLL); k.r(x + 10, y + 3, 2, 2, SK.ironLL); }
    const sx = x + 7, sy = -174;   /* the boar skull */
    k.e(sx, sy, 11, 9, SK.out); k.e(sx, sy, 10, 8, SK.bib); k.e(sx - 3, sy - 3, 5, 3, '#fff8ec'); k.r(sx - 6, sy - 1, 4, 4, SK.out); k.r(sx + 3, sy - 1, 4, 4, SK.out); k.p([[sx - 5, sy + 5], [sx + 6, sy + 5], [sx + 4, sy + 12], [sx - 3, sy + 12]], SK.out); k.p([[sx - 4, sy + 5], [sx + 5, sy + 5], [sx + 3, sy + 11], [sx - 2, sy + 11]], SK.bibD);
    k.r(sx - 2, sy + 9, 1, 2, SK.out); k.r(sx + 2, sy + 9, 1, 2, SK.out);
    for (const s of [-1, 1]) { k.p([[sx + s * 6, sy + 6], [sx + s * 13, sy - 2], [sx + s * 9, sy + 8]], SK.out); k.p([[sx + s * 7, sy + 6], [sx + s * 12, sy], [sx + s * 9, sy + 7]], SK.tooth); }   /* tusks */
    k.r(x - 3, -2, 20, 3, SK.out); k.r(x - 2, -2, 18, 2, SK.ironL); k.r(x, -2, 2, 1, SK.ironLL); k.r(x + 12, -2, 2, 1, SK.ironLL);   /* bolted to the floor */
  }
  /* the arms: thick oak rails out from the posts, on iron-shod legs */
  for (const [x0, x1] of [[-134, -100], [86, 120]]) {
    k.r(x0 - 1, -70, x1 - x0 + 2, 13, SK.out); k.r(x0, -69, x1 - x0, 11, SK.oakL); k.r(x0, -69, x1 - x0, 2, SK.oakLL); k.r(x0, -60, x1 - x0, 2, SK.oakD);
    const lx = x0 < 0 ? x0 + 2 : x1 - 12; k.r(lx - 1, -58, 12, 58, SK.out); k.r(lx, -58, 10, 58, SK.oak); k.r(lx, -58, 2, 58, SK.oakLL); k.r(lx - 1, -14, 12, 6, SK.iron); k.r(lx - 1, -14, 12, 1, SK.ironLL);
  }
}
/* ---------------------------------------------------------------- THE GREAT FORK (a carving fork the length of a pike) ---------------------------------------------------------------- */
const FORKS = new Map();
function forkFlat(fl) {
  let c = FORKS.get(fl); if (c) return c; const [cc, g] = canvas(fl + 52, 32); c = cc; g.translate(14, 16); const k = mk(g, false);
  k.r(-3, -4, fl + 4, 8, SK.out); k.r(-2, -3, fl + 2, 6, SK.dishD); k.r(-2, -3, fl + 2, 2, SK.dish); k.r(-2, -2, fl + 2, 1, SK.ironLL);   /* the shaft */
  for (let q = 10; q < fl - 6; q += 22) { k.r(q, -4, 3, 8, SK.out); k.r(q, -3, 2, 6, SK.trimD); }   /* brass collars */
  k.r(fl, -12, 6, 25, SK.out); k.r(fl + 1, -11, 4, 23, SK.dish); k.r(fl + 1, -11, 1, 23, SK.ironLL);   /* the neck */
  for (const ty of [-10, 0, 9]) { k.r(fl + 4, ty - 2, 26, 6, SK.out); k.r(fl + 5, ty - 1, 24, 4, SK.dish); k.r(fl + 5, ty - 1, 24, 1, SK.ironLL); k.r(fl + 5, ty + 2, 24, 1, SK.dishD); k.p([[fl + 29, ty - 2], [fl + 36, ty + 1], [fl + 29, ty + 4]], SK.out); k.p([[fl + 29, ty - 1], [fl + 34, ty + 1], [fl + 29, ty + 3]], SK.ironLL); }   /* three tines */
  k.r(-12, -5, 10, 10, SK.out); k.r(-11, -4, 8, 8, SK.oakD); k.r(-11, -4, 8, 2, SK.oakL);   /* the butt */
  FORKS.set(fl, c); return c;
}
function fork(g, fx, fy, fa, fl) { g.save(); g.translate(R(fx), R(fy)); g.rotate(fa); g.imageSmoothingEnabled = false; g.drawImage(forkFlat(fl), -14, -16); g.restore(); }
/* ---------------------------------------------------------------- A HAND: a fat fist, or four sausage fingers splayed along the arm ---------------------------------------------------------------- */
function hand(g, x, y, open, dir = 0, skin = SK.skin) {
  const k = mk(g, false);
  if (open) { const ca = Math.cos(dir), sa = Math.sin(dir);
    for (let i = 0; i < 4; i++) { const o = (i - 1.5) * 6, bx = x + ca * 8 - sa * o, by = y + sa * 8 + ca * o; k.cap(bx, by, bx + ca * 14, by + sa * 14, 3.6, SK.out); }
    for (let i = 0; i < 4; i++) { const o = (i - 1.5) * 6, bx = x + ca * 8 - sa * o, by = y + sa * 8 + ca * o; k.cap(bx, by, bx + ca * 13, by + sa * 13, 2.6, skin); k.r(bx + ca * 12, by + sa * 12 - 1, 2, 1, SK.skinLL); } }
  k.e(x, y, 12, 11, SK.out); k.e(x, y, 11, 10, skin); k.e(x - 3, y - 4, 6, 4, SK.skinL); k.e(x + 2, y + 5, 7, 3, SK.skinD);
  if (!open) for (let i = 0; i < 3; i++) { k.r(x + 4 + i * 2, y - 6 + i * 5, 4, 2, SK.skinDD); k.r(x + 3 + i * 2, y - 7 + i * 5, 3, 1, SK.skinLL); }   /* knuckles */
}
/* an arm: the plum sleeve to the elbow (a gold cuff), the bare fat forearm to the hand. Elbows bend DOWN. */
function arm(g, sx, sy, hx, hy, near, bare) {
  const k = mk(g, false), dx = hx - sx, dy = hy - sy, L = Math.hypot(dx, dy) || 1;
  let nx = -dy / L, ny = dx / L; if (ny < 0) { nx = -nx; ny = -ny; }
  const bend = Math.max(4, 22 - L * 0.12), ex = (sx + hx) / 2 + nx * bend, ey = (sy + hy) / 2 + ny * bend;
  const sleeve = near ? SK.robe : SK.robeD, sleeveL = near ? SK.robeL : SK.robe, skin = near ? SK.skin : SK.skinD;
  k.cap(sx, sy, ex, ey, 17, SK.out); k.cap(ex, ey, hx, hy, 13, SK.out);
  if (bare) { k.cap(sx, sy, ex, ey, 16, skin); k.cap(sx - 2, sy - 3, ex - 2, ey - 3, 8, SK.skinL); }
  else { k.cap(sx, sy, ex, ey, 16, sleeve); k.cap(sx - 3, sy - 4, ex - 3, ey - 4, 8, sleeveL); }
  k.cap(ex, ey, hx, hy, 12, skin); k.cap(ex - 1, ey - 4, hx - 1, hy - 4, 5, near ? SK.skinL : SK.skin);
  k.e(ex, ey + 4, 10, 4, SK.skinDD);   /* the fold of fat at the elbow */
  if (!bare) { const fx = hx - ex, fy = hy - ey, fL = Math.hypot(fx, fy) || 1, ux = fx / fL, uy = fy / fL, vx = -uy, vy = ux, band = (w0, w1, r, col) => k.p([[ex + ux * w0 + vx * r, ey + uy * w0 + vy * r], [ex + ux * w1 + vx * r, ey + uy * w1 + vy * r], [ex + ux * w1 - vx * r, ey + uy * w1 - vy * r], [ex + ux * w0 - vx * r, ey + uy * w0 - vy * r]], col);
    band(-2, 8, 15, SK.out); band(-1, 7, 14, SK.trimD); band(-1, 3, 14, SK.trim); band(0, 1, 13, '#fff0b0'); }   /* the gold cuff of the sleeve */
}
/* ---------------------------------------------------------------- HIM ---------------------------------------------------------------- */
const OX = 160, OY = 210, BW = 400, BH = 226;   /* the baked pose canvas: his seat at (OX, OY) */
const BAKED = new WeakMap();
function bakePose(p, j) {
  const [c, g] = canvas(BW, BH); g.translate(OX, OY); drawBody(g, p, j); return c;
}
export function drawGrubbagArt(g, p, flash, time, holding) {
  const j = p.mouth === 'chew' ? Math.floor(time * 6) % 2 : 0;
  let m = BAKED.get(p); if (!m) { m = {}; BAKED.set(p, m); }
  const key = j + (flash ? 'w' : ''); let c = m[key];
  if (!c) { const base = m[j] || (m[j] = bakePose(p, j)); c = flash ? (m[key] = whiten(base)) : base; }
  g.drawImage(c, -OX, -OY);
  drawLive(g, p, flash, time, holding);
}
/* bake ONE pose not baked yet (called each frame from the fight: the ~18 bakes are spread over his first frames, not one hitch each the first time he strikes) */
export function warmOne(poses) { for (const p of Object.values(poses)) { let m = BAKED.get(p); if (!m) { m = {}; BAKED.set(p, m); } if (!m[0]) { m[0] = bakePose(p, 0); return true; } if (p.mouth === 'chew' && !m[1]) { m[1] = bakePose(p, 1); return true; } } return false; }
/* THE CHAIR LEFT EMPTY (the belly flop: he is out of it) - the chair, the tureen on the table's end and the fork stuck upright in it, baked once, drawn at his chair's place */
let CHAIR_C = null;
export function drawChairArt(g) {
  if (!CHAIR_C) { const [c, cg] = canvas(BW, BH); cg.translate(OX, OY); chair(cg); CHAIR_C = c; }   /* (claude/kitchengate2: no fork, no tureen) */
  g.drawImage(CHAIR_C, -OX, -OY);
}
function tureen(g, tip) { g.save(); g.translate(BIG.tureen[0], BIG.tureen[1]); g.rotate(tip || 0); g.imageSmoothingEnabled = false; g.drawImage(tureenFlat((tip || 0) > 0.6), -60, -64); g.restore(); }
/* THE BODY. (claude/grubbagbig, the belly flop) a pose can leave the chair out (noChair: he is up out of it - the chair is drawn on its own, drawChairArt), lift him off the seat
   (lift px, the heave), sink him into the floor (sink px: belly down on the boards after the flop, cut off at the floor line) and spread the belly (wide, tall: the belly's own
   ellipse, drawn at that size - not a stretched bitmap) */
function drawBody(g, p, j) {
  const k = mk(g, false), lean = p.lean || 0, bk = p.belly || 1, red = !!p.red, [hx, hy] = p.head;
  const skin = red ? SK.flush : SK.skin, skinL = red ? SK.flushL : SK.skinL, skinD = red ? SK.flushD : SK.skinD;
  if (!p.noChair) chair(g);
  g.save(); if (p.sink) { g.beginPath(); g.rect(-OX, -OY, BW, OY); g.clip(); } g.translate(0, (p.sink || 0) - (p.lift || 0));
  if (p.sink) { k.e(10, -2, 128, 10, SK.skinDD); }   /* the boards bowed under him */
  /* the slippers under the belly (gold, toes curled), and the short legs into them */
  for (const [x, w, far] of [[44, 40, 0], [-52, 32, 1]]) { k.r(x, -26, w, 18, SK.out); k.r(x + 1, -25, w - 2, 16, far ? SK.robeDD : SK.robeD);
    k.p([[x - 2, -12], [x + w + 8, -12], [x + w + 12, -20], [x + w + 14, -10], [x + w + 6, 0], [x - 2, 0]], SK.out); k.p([[x - 1, -11], [x + w + 7, -11], [x + w + 11, -17], [x + w + 12, -10], [x + w + 5, -1], [x - 1, -1]], far ? SK.trimD : SK.trim); k.r(x, -11, w + 6, 2, '#fff0b0'); }
  g.save(); g.translate(lean * 0.4, 0);
  /* the far arm, behind him */
  arm(g, BIG.farShoulder[0] + lean * 0.6, BIG.farShoulder[1], p.far[0], p.far[1], false, false); hand(g, p.far[0], p.far[1], false, 0, SK.skinD);
  /* the robe: plum, a mass behind and round him; a high collar */
  k.e(-4, -74, 99, 70, SK.out); k.e(-4, -74, 98, 69, SK.robeD); k.e(-12, -86, 84, 54, SK.robe); k.e(-40, -108, 34, 22, SK.robeL); k.e(-48, -114, 14, 8, '#a8526a');
  k.a(-4, -74, 96, 67, Math.PI * 0.6, Math.PI * 0.95, SK.robeDD, 2);
  /* the sash, under the belly, a gold band that does not meet round him */
  k.r(-80, -20, 176, 11, SK.out); k.r(-79, -19, 174, 9, SK.trimD); k.r(-79, -19, 174, 2, SK.trim); k.r(-79, -12, 174, 1, '#7a5a1c');
  k.p([[60, -16], [72, -14], [78, 4], [66, 2]], SK.out); k.p([[61, -15], [71, -13], [76, 2], [67, 1]], SK.trim); k.p([[70, -16], [84, -12], [92, 2], [80, 3]], SK.out); k.p([[71, -15], [83, -11], [90, 1], [81, 2]], SK.trimD);
  /* his flanks: rolls of fat spilling over the chair's arms, each rolled under the next */
  for (const [cx, cy, rx, ry] of [[-100, -52, 26, 36], [104, -52, 24, 34]]) {
    k.e(cx, cy, rx + 1, ry + 1, SK.out); k.e(cx, cy, rx, ry, skinD); k.e(cx - Math.sign(cx) * 4, cy - 4, rx - 5, ry - 5, skin); k.e(cx - Math.sign(cx) * 8 - 4, cy - 14, rx * 0.4, ry * 0.3, skinL);
    for (const yy of [-14, 4, 20]) k.a(cx, cy + yy - 8, rx - 4, 9, Math.PI * 0.15, Math.PI * 0.85, SK.skinDD, 2);
  }
  /* THE BELLY: most of him. Shade low and right, lit high and left, a deep navel, the apron of fat folded over the sash, stretch marks */
  const bx = 10, by = -58 + (1 - (p.tall || 1)) * 53, rx = 88 * bk * (p.wide || 1), ry = 53 * bk * (p.tall || 1);
  k.e(bx, by, rx + 1, ry + 1, SK.out); k.e(bx, by, rx, ry, skinD); k.e(bx - 5, by - 6, rx - 6, ry - 7, skin); k.e(bx - 22, by - 22, rx * 0.56, ry * 0.5, skinL); k.e(bx - 36, by - 32, rx * 0.2, ry * 0.13, red ? '#e0a080' : SK.skinLL);
  k.a(bx + 4, by + 10, rx * 0.78, ry * 0.62, Math.PI * 0.12, Math.PI * 0.88, SK.skinDD, 2);   /* the apron's fold */
  k.a(bx + 4, by + 12, rx * 0.78, ry * 0.62, Math.PI * 0.2, Math.PI * 0.8, red ? '#c8785a' : SK.fat, 1);
  k.a(bx, by - 2, rx * 0.95, ry * 0.9, Math.PI * 0.05, Math.PI * 0.32, SK.skinDD, 1);
  for (const [x0, y0, x1, y1] of [[-64, -76, -56, -64], [-70, -62, -62, -50], [-58, -88, -52, -80], [82, -72, 76, -60], [86, -56, 80, -46]]) k.l(x0, y0, x1, y1, skinD);   /* stretch marks */
  k.e(bx + 14, by + 6, 6, 5, SK.out); k.e(bx + 14, by + 6, 5, 4, SK.skinDD); k.e(bx + 13, by + 5, 3, 2, '#1e2410'); k.r(bx + 11, by + 2, 4, 1, skinL);   /* the navel */
  /* the robe's lapels down his sides, gold-edged, pushed apart */
  k.p([[-70, -136], [-46, -132], [-62, -96], [-86, -58], [-98, -40], [-102, -80]], SK.out); k.p([[-69, -134], [-48, -131], [-63, -97], [-86, -60], [-97, -43], [-100, -80]], SK.robe);
  k.l(-48, -130, -63, -97, SK.trim, 2); k.l(-63, -97, -86, -60, SK.trim, 2); k.l(-86, -60, -97, -43, SK.trim, 2);
  k.p([[50, -134], [76, -136], [104, -86], [98, -60], [80, -94]], SK.out); k.p([[52, -133], [75, -134], [102, -86], [97, -63], [81, -95]], SK.robeD);
  k.l(52, -132, 81, -95, SK.trim, 2); k.l(81, -95, 97, -63, SK.trimD, 2);
  g.restore();
  /* the upper body leans the whole lean */
  g.save(); g.translate(lean, 0);
  /* the queen's own ermine collar round his neck */
  k.e(10, -114, 50, 13, SK.out); k.e(10, -114, 49, 12, SK.ermine); k.a(10, -112, 47, 10, Math.PI * 0.1, Math.PI * 0.9, SK.ermineD, 2);
  for (let i = 0; i < 9; i++) { const x = -30 + i * 10, y = -117 + ((i * 5) % 7); k.r(x, y, 2, 3, SK.out); k.r(x - 1, y + 1, 4, 1, SK.out); }
  /* his chest: two sagging slabs over the belly */
  for (const [cx, cy, rx2, ry2] of [[-28, -100, 28, 15], [36, -98, 30, 16]]) { k.e(cx, cy, rx2 + 1, ry2 + 1, SK.out); k.e(cx, cy, rx2, ry2, skin); k.e(cx - 6, cy - 5, rx2 * 0.6, ry2 * 0.45, skinL); k.a(cx, cy - 2, rx2 - 2, ry2 - 1, Math.PI * 0.15, Math.PI * 0.85, SK.skinDD, 2); }
  /* the napkin, tucked under the chins - a handkerchief on him now - and the gravy on it */
  k.p([[-8, -124], [34, -124], [26, -98], [13, -88], [0, -98]], SK.out); k.p([[-7, -123], [33, -123], [25, -99], [13, -90], [1, -99]], SK.bib); k.l(-6, -122, 32, -122, '#ffffff');
  k.r(4, -112, 7, 5, SK.gravy); k.r(7, -107, 3, 8, SK.gravy); k.r(18, -116, 5, 3, '#a8402a'); k.r(14, -102, 6, 2, SK.gravyL); k.l(8, -121, 10, -96, SK.bibD); k.l(22, -121, 20, -100, SK.bibD);
  /* THREE CHINS, the lowest on the collar */
  { const cx = 13 + hx * 0.6; k.e(cx, -119, 34, 13, SK.out); k.e(cx, -119, 33, 12, skin); k.e(cx + 4, -114, 28, 6, skinD); k.e(cx - 2, -121, 29, 9, skin); k.e(cx - 9, -125, 15, 5, skinL);
    k.a(cx, -129, 20, 5, Math.PI * 0.12, Math.PI * 0.88, SK.skinDD, 1); k.a(cx, -124, 27, 6, Math.PI * 0.1, Math.PI * 0.9, SK.skinDD, 1); k.a(cx + 1, -118, 31, 6, Math.PI * 0.14, Math.PI * 0.86, SK.skinDD, 1);
    k.a(cx, -128, 20, 5, Math.PI * 0.2, Math.PI * 0.6, skinL, 1); k.a(cx, -123, 27, 6, Math.PI * 0.2, Math.PI * 0.6, skinL, 1); }
  /* THE HEAD: no bigger than it ever was - a pea on all that */
  g.save(); g.translate(12, -79); head(g, p, j, red); g.restore();
  /* the fork, then the near arm over it (his hand round its shaft) */
  if (p.fork) fork(g, p.fork[0] - lean, p.fork[1], p.fork[2], p.fork[3]);
  const sx = BIG.shoulder[0], sy = BIG.shoulder[1];
  if (p.arm) { arm(g, sx, sy, p.hand[0] - lean, p.hand[1], true, false); }
  else { arm(g, sx, sy, p.hand[0] - lean, p.hand[1], true, false); hand(g, p.hand[0] - lean, p.hand[1], !!p.fingers, Math.atan2(p.hand[1] - sy, p.hand[0] - lean - sx)); }
  if (p.item === 'ham') { const [dx, dy] = [p.hand[0] - lean, p.hand[1]]; k.e(dx, dy - 16, 17, 13, SK.out); k.e(dx, dy - 16, 16, 12, SK.food); k.e(dx - 5, dy - 21, 8, 5, SK.foodL); k.r(dx + 12, dy - 22, 14, 6, SK.out); k.r(dx + 13, dy - 21, 12, 4, SK.tooth); k.e(dx + 27, dy - 23, 4, 4, SK.tooth); k.e(dx + 27, dy - 17, 4, 4, SK.tooth); }   /* (claude/kitchengate2) THE HIGH LOB's ham, hoisted */
  if (p.item === 'plate') { const [dx, dy] = [p.hand[0] - lean, p.hand[1]]; k.e(dx + 2, dy - 14, 15, 5, SK.out); k.e(dx + 2, dy - 14, 14, 4, SK.dish); k.e(dx, dy - 15, 8, 2, '#ffffff'); k.e(dx + 2, dy - 13, 9, 2, SK.dishD); }   /* THE FLING's plate, drawn back */
  if (p.item === 'bell') { const [dx, dy] = [p.hand[0] - lean, p.hand[1]]; k.r(dx - 2, dy - 22, 5, 12, SK.out); k.r(dx - 1, dy - 21, 3, 10, SK.oakL); k.p([[dx - 12, dy - 8], [dx + 13, dy - 8], [dx + 8, dy - 24], [dx - 7, dy - 24]].map(q => [q[0], q[1] - 6]), SK.out); k.p([[dx - 11, dy - 15], [dx + 12, dy - 15], [dx + 7, dy - 29], [dx - 6, dy - 29]], SK.trim); k.r(dx - 9, dy - 17, 19, 2, SK.trimD); k.e(dx, dy - 12, 3, 3, SK.trimD); }   /* THE SERVICE BELL */
  if (p.item === 'drumstick') { const [dx, dy] = [p.hand[0] - lean, p.hand[1]]; k.e(dx - 2, dy - 18, 13, 11, SK.out); k.e(dx - 2, dy - 18, 12, 10, SK.food); k.e(dx - 5, dy - 22, 6, 4, SK.foodL); k.r(dx + 8, dy - 20, 12, 5, SK.out); k.r(dx + 9, dy - 19, 10, 3, SK.tooth); k.e(dx + 21, dy - 22, 3, 3, SK.tooth); k.e(dx + 21, dy - 16, 3, 3, SK.tooth); }
  g.restore();
  g.restore();
  /* (claude/kitchengate2, Daniel 10-27: the tureen in front of him clipped his flank - it is gone; the grease cauldron hangs on its own chain over the line, drawCauldron) */
}
const TUREENS = {};
function tureenFlat(pour) {
  if (TUREENS[pour]) return TUREENS[pour]; const [c, g] = canvas(120, 72); g.translate(60, 64); const k = mk(g, false);
  k.e(0, -16, 23, 17, SK.out); k.e(0, -16, 22, 16, SK.copper); k.e(-7, -21, 10, 7, SK.copperL); k.e(4, -9, 16, 6, SK.copperD); k.r(-23, -33, 46, 7, SK.out); k.r(-22, -32, 44, 5, SK.copperL); k.r(-19, -31, 38, 3, SK.gravy); k.r(-12, -31, 9, 1, SK.gravyL);
  k.r(-22, -15, 44, 3, SK.copperD); k.r(-22, -15, 44, 1, SK.copperL);
  for (const s of [-1, 1]) { k.e(s * 25, -22, 5, 5, SK.out); k.e(s * 25, -22, 3, 3, SK.copperD); }
  k.r(-12, 0, 24, 3, SK.out); k.r(-11, 0, 22, 2, SK.copperD);
  k.l(6, -32, 18, -50, SK.out, 3); k.l(7, -32, 18, -48, SK.copperL); k.e(19, -51, 4, 3, SK.out); k.e(19, -51, 3, 2, SK.copper);   /* the ladle */
  if (pour) { k.p([[22, -33], [36, -24], [44, -6], [40, 4], [30, -10], [20, -28]], SK.gravy); k.p([[24, -31], [34, -24], [40, -8], [36, -4], [28, -14]], SK.gravyL); }   /* the gravy pouring over the lip */
  return (TUREENS[pour] = c);
}
/* the head, at its old size: local to its own seat (it was drawn at -66 high on a figure a third of this) */
function head(g, p, j, red) {
  const k = mk(g, false), [hx, hy] = p.head, H0 = -66 + hy;
  for (const s of [-1, 1]) { const ex = hx + 1 + s * 14; k.p([[ex, H0 + 7], [ex + s * 12, H0 + 1 + (s < 0 ? 3 : 0)], [ex + s * 2, H0 + 13]], SK.out); k.p([[ex + s * 0, H0 + 8], [ex + s * 9, H0 + 3 + (s < 0 ? 3 : 0)], [ex + s * 2, H0 + 12]], s < 0 ? SK.skinD : SK.skin); }   /* the pointed ears */
  k.e(hx + 1, H0 + 9, 15, 13, SK.out); k.e(hx + 1, H0 + 9, 14, 12, red ? '#b05a42' : SK.skin);
  k.e(hx - 2, H0 + 4, 8, 5, red ? '#c8785a' : SK.skinL); k.e(hx + 1, H0 + 17, 13, 5, red ? '#8e3e2c' : SK.skinD);   /* the cheek light; the jowls' shade */
  k.e(hx - 9, H0 + 14, 6, 5, red ? SK.flush : SK.skin); k.e(hx + 11, H0 + 14, 6, 5, red ? SK.flushD : SK.skinD);   /* jowls */
  /* the circlet, a size too small */
  k.r(hx - 11, H0 - 3, 25, 5, SK.out); k.r(hx - 10, H0 - 2, 23, 3, SK.trim); k.r(hx - 10, H0 - 2, 23, 1, '#fff0b0'); k.r(hx - 10, H0, 23, 1, SK.trimD);
  for (const x of [-9, -1, 7]) { k.p([[hx + x, H0 - 3], [hx + x + 2, H0 - 9], [hx + x + 4, H0 - 3]], SK.out); k.p([[hx + x + 1, H0 - 3], [hx + x + 2, H0 - 7], [hx + x + 3, H0 - 3]], SK.trim); }
  k.r(hx - 1, H0 - 2, 3, 3, '#e0302a'); k.r(hx - 1, H0 - 2, 1, 1, '#ffb0a0');
  /* the eyes: small, piggy, under a heavy brow */
  const ey = p.eyes;
  k.r(hx + 1, H0 + 2, 12, 2, SK.skinDD);
  if (ey === 'shut') { k.r(hx + 3, H0 + 6, 7, 1, SK.out); k.r(hx - 6, H0 + 6, 5, 1, SK.out); }
  else { const bul = ey === 'bulge'; for (const [x, w] of [[hx + 3, bul ? 8 : 7], [hx - 7, bul ? 7 : 6]]) { k.r(x - 1, H0 + 3, w + 2, (bul ? 8 : 6) + 2, SK.out); k.r(x, H0 + 4, w, bul ? 8 : 5, ey === 'red' ? SK.red : SK.eye); k.r(x + (w >> 1), H0 + 5, 2, bul ? 4 : 3, '#1a1010'); if (bul) k.r(x, H0 + 4, 2, 2, '#ffffff'); } }
  /* the nose: a boil of a nose */
  k.e(hx + 6, H0 + 11, 4, 3, SK.out); k.e(hx + 6, H0 + 11, 3, 2, SK.fat); k.r(hx + 5, H0 + 12, 1, 1, SK.skinDD); k.r(hx + 8, H0 + 12, 1, 1, SK.skinDD);
  if (p.smoke) { for (const [x, y, w, h] of [[-8, 4, 10, 6], [1, 9, 9, 5], [-6, 14, 7, 4], [8, 2, 5, 5]]) { g.globalAlpha = 0.55; k.r(hx + x, H0 + y, w, h, '#1e1a18'); } g.globalAlpha = 1; k.r(hx - 6, H0 - 6, 4, 4, '#2a2420'); k.r(hx + 4, H0 - 8, 3, 5, '#2a2420'); k.r(hx - 1, H0 - 10, 3, 4, '#2a2420'); }   /* (claude/kitchengate2art) STUNNED: the bomb went off inside him - a sooty face, singed spikes of hair on the circlet */
  /* the mouth and the tusks */
  const mo = p.mouth, my = H0 + 16;
  if (mo === 'wide') { k.r(hx - 8, my - 3, 20, 11, SK.out); k.r(hx - 7, my - 2, 18, 9, SK.mouth); k.r(hx - 4, my + 3, 12, 4, '#a8403a'); for (const x of [-6, 0, 6, 10]) k.r(hx + x, my - 2, 3, 3, SK.tooth); k.r(hx - 8, my - 7, 3, 7, SK.tooth); k.r(hx + 11, my - 7, 3, 7, SK.tooth); }
  else if (mo === 'open') { k.r(hx - 4, my - 2, 15, 7, SK.out); k.r(hx - 3, my - 1, 13, 5, SK.mouth); k.r(hx - 2, my - 1, 3, 2, SK.tooth); k.r(hx + 6, my - 1, 3, 2, SK.tooth); k.r(hx - 8, my - 6, 3, 6, SK.tooth); k.r(hx + 11, my - 6, 3, 6, SK.tooth); }
  else if (mo === 'chew') { k.r(hx - 4, my - 1, 14, 3 + j, SK.out); k.r(hx - 3, my, 12, 1 + j, SK.mouth); k.r(hx - 8, my - 5, 3, 5, SK.tooth); k.r(hx + 11, my - 5, 3, 5, SK.tooth); if (j) k.r(hx + 8, my + 2, 2, 3, SK.gravyL); }
  else { k.r(hx - 4, my, 14, 1, SK.out); k.r(hx - 8, my - 5, 3, 6, SK.tooth); k.r(hx + 11, my - 5, 3, 6, SK.tooth); }
}
/* the live bits over the baked pose */
function drawLive(g, p, flash, time, holding) {
  const lean = p.lean || 0, mx = BIG.mouth[0] + lean + p.head[0], my = BIG.mouth[1] + p.head[1];
  if (p.item === 'dish' && holding) dish(g, flash, p.hand[0], p.hand[1] - 12, holding, time);
  if (p.rings) for (let n = 0; n < 2; n++) { const q = (time * 3 + n * 0.5) % 1; g.strokeStyle = 'rgba(160,200,90,' + (1 - q).toFixed(2) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(mx + 4, my, 8 + q * 46, -0.8, 0.8); g.stroke(); g.lineWidth = 1; }
  if (p.smoke) for (let q = 0; q < 7; q++) { const a = time * 3 + q * 1.3, s = (time * 22 + q * 8) % 40, yy = -158 - s; g.globalAlpha = 0.7 * (1 - s / 40); rect(g, R(20 + Math.cos(a) * 14), R(yy), 8, 6, '#46403c'); g.globalAlpha = 1; }
  if (p.smoke) for (let q = 0; q < 4; q++) { const an = time * 3.2 + q * 1.571, sx2 = R(mx - 6 + lean * 0 + Math.cos(an) * 22), sy2 = R(my - 36 + Math.sin(an) * 5); rect(g, sx2 - 1, sy2, 3, 1, '#ffd36b'); rect(g, sx2, sy2 - 1, 1, 3, '#ffd36b'); rect(g, sx2, sy2, 1, 1, '#ffffff'); }   /* (claude/kitchengate2art) STUNNED: stars wheel round his head */
  if (p.zzz) { const q = (time * 0.8) % 1; g.globalAlpha = 1 - q; const zx = 30, zy = R(-160 - q * 18); rect(g, zx, zy, 7, 1, '#e8e0d0'); line(g, zx + 6, zy + 1, zx, zy + 6, '#e8e0d0'); rect(g, zx, zy + 6, 7, 1, '#e8e0d0'); g.globalAlpha = 1; }
  if (p.steam) for (let q = 0; q < 6; q++) { const s = (time * 40 + q * 9) % 36, sd = q % 2 ? 1 : -1; g.globalAlpha = 0.8 * (1 - s / 36); rect(g, R(12 + sd * (16 + s * 0.4)), R(-150 - s), 5, 5, '#f0f0f0'); g.globalAlpha = 1; }   /* TOO HOT: steam out of his ears */
  if (p.ring) for (let n = 0; n < 2; n++) { const q = (time * 4 + n * 0.5) % 1, hx = p.hand[0] - lean, hy = p.hand[1] - 20; g.strokeStyle = 'rgba(255,211,107,' + (1 - q).toFixed(2) + ')'; g.beginPath(); g.arc(hx, hy, 10 + q * 22, -2.4, -0.7); g.stroke(); }   /* the bell ringing */
  if (p.cough) for (let q = 0; q < 4; q++) rect(g, R(mx + 6 + q * 8), R(my - 4 - (time * 30 + q * 7) % 14), 4, 4, 'rgba(200,190,170,0.7)');
}
/* THE GRAB's forearm, flung out along the floor from his elbow to his hand (world px, already facing) - src/grubbag-hands.js drawBoss */
export function drawGrabArm(g, x0, y0, x1, y1, flash) {
  const k = mk(g, flash); k.cap(x0, y0, x1, y1, 13, SK.out); k.cap(x0, y0, x1, y1, 12, SK.skin); k.cap(x0, y0 - 4, x1, y1 - 4, 5, SK.skinL);
  for (let q = 0; q < 4; q++) { const t = (q + 1) / 5; k.e(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + 7, 6, 3, SK.skinD); }   /* the forearm's rolls */
  if (flash) { const kf = mk(g, true); kf.e(x1, y1, 12, 11, SK.skin); return; }
  hand(g, x1, y1, true, Math.atan2(y1 - y0, x1 - x0));
}
/* ---------------------------------------------------------------- DISHES, THE POWDER PIE ---------------------------------------------------------------- */
export function dish(g, flash, dx, dy, kind, time) {
  const k = mk(g, flash);
  k.e(dx, dy + 1, 12, 3, SK.out); k.e(dx, dy + 1, 11, 2, SK.dishD); k.r(dx - 10, dy - 1, 20, 3, SK.dish); k.r(dx - 10, dy - 1, 20, 1, '#ffffff'); k.r(dx - 6, dy + 3, 12, 1, SK.dishD);   /* a silver-rimmed plate */
  if (kind === 'bomb') {   /* (claude/kitchengate2art) THE BOMB: a steamed black PUDDING, a sprig of holly, a custard drip, the fuse lit in its crown */
    k.e(dx, dy - 7, 10, 9, SK.out); k.e(dx, dy - 7, 9, 8, '#3a2018'); k.e(dx - 3, dy - 10, 5, 4, '#5a3a2a'); k.e(dx - 5, dy - 12, 2, 1, '#8a6a52'); k.r(dx - 8, dy - 4, 16, 3, '#1e1010');
    k.p([[dx - 9, dy - 9], [dx - 4, dy - 12], [dx + 4, dy - 12], [dx + 9, dy - 9], [dx + 6, dy - 7], [dx + 3, dy - 9], [dx, dy - 7], [dx - 3, dy - 9], [dx - 6, dy - 7]], '#f0e4c0'); k.r(dx - 1, dy - 7, 3, 4, '#f0e4c0');   /* the custard poured over */
    k.p([[dx + 1, dy - 14], [dx + 6, dy - 16], [dx + 7, dy - 13], [dx + 2, dy - 12]], '#2a6a2a'); k.r(dx + 6, dy - 14, 2, 2, '#e0302a'); k.r(dx + 3, dy - 13, 2, 2, '#e0302a');   /* holly */
    k.r(dx - 2, dy - 20, 3, 8, SK.out); k.r(dx - 1, dy - 19, 1, 7, '#8a7a5a');
    if (Math.floor(time * 12) % 2) { k.r(dx - 3, dy - 25, 5, 5, '#ffd36b'); k.r(dx - 2, dy - 24, 3, 3, '#ffffff'); k.r(dx - 5, dy - 24, 1, 1, '#ffb04a'); k.r(dx + 3, dy - 26, 1, 1, '#ffb04a'); } else { k.r(dx - 2, dy - 24, 3, 3, '#ff9a3c'); k.r(dx - 1, dy - 26, 1, 2, '#ffd36b'); }
    return; }
  if (kind === 'chilli') {   /* A RED-HOT CHILLI on its plate: fat, glossy, a green cap, the plate glowing under it, heat shimmer */
    g.globalAlpha = 0.3 + 0.15 * Math.sin(time * 12); rect(g, dx - 13, dy - 14, 26, 14, '#ff3a1a'); g.globalAlpha = 1;
    k.p([[dx - 10, dy - 3], [dx - 6, dy - 9], [dx + 3, dy - 11], [dx + 10, dy - 8], [dx + 11, dy - 5], [dx + 4, dy - 5], [dx - 4, dy - 2]], SK.out);
    k.p([[dx - 9, dy - 3], [dx - 5, dy - 8], [dx + 3, dy - 10], [dx + 9, dy - 8], [dx + 9, dy - 6], [dx + 3, dy - 6], [dx - 4, dy - 3]], '#d8201a');
    k.p([[dx - 6, dy - 4], [dx - 3, dy - 7], [dx + 3, dy - 9], [dx + 6, dy - 8], [dx + 1, dy - 7], [dx - 3, dy - 5]], '#ff6a4a'); k.r(dx - 3, dy - 8, 5, 1, '#ffc0a0');
    k.r(dx + 8, dy - 12, 4, 4, SK.out); k.r(dx + 9, dy - 11, 3, 2, '#3a8a2a'); k.r(dx + 11, dy - 13, 2, 2, '#2a6a1a');   /* the stalk */
    for (let q = 0; q < 3; q++) rect(g, R(dx - 5 + q * 5 + Math.sin(time * 6 + q) * 1.5), R(dy - 14 - (time * 20 + q * 5) % 9), 2, 2, 'rgba(255,200,170,0.65)');
    return; }
  if (kind === 'pie') {
    k.e(dx, dy - 4, 9, 6, SK.out); k.e(dx, dy - 4, 8, 5, SK.pie); k.e(dx - 2, dy - 6, 4, 2, SK.pieL); k.r(dx - 7, dy - 3, 15, 2, SK.pieD);
    for (const x of [-5, -1, 3, 6]) k.r(dx + x, dy - 3, 1, 3, SK.pieD);   /* the crimped crust */
    k.r(dx + 1, dy - 14, 2, 8, SK.out); k.r(dx + 1, dy - 13, 1, 6, '#6a5a3a');   /* the fuse, out of the crust */
    if (Math.floor(time * 12) % 2) { k.r(dx - 1, dy - 17, 5, 5, '#ffd36b'); k.r(dx, dy - 16, 3, 3, '#ffffff'); } else { k.r(dx, dy - 16, 3, 3, '#ff9a3c'); k.r(dx + 1, dy - 18, 1, 2, '#ffd36b'); }
    g.globalAlpha = 0.3; rect(g, dx - 10, dy - 10, 20, 12, '#ff5a2a'); g.globalAlpha = 1;
    return; }
  /* a roast dinner: a glazed gammon with its bone out, a sprig of parsley, roast potatoes and a gravy pool */
  k.e(dx, dy - 1, 8, 3, '#7a4a22');
  k.e(dx - 1, dy - 5, 8, 6, SK.out); k.e(dx - 1, dy - 5, 7, 5, '#a8501e'); k.e(dx - 2, dy - 6, 5, 3, '#c0682a'); k.e(dx - 4, dy - 8, 2, 1, '#f0b060'); k.r(dx - 6, dy - 3, 10, 1, '#7a3a14');
  k.r(dx + 5, dy - 8, 7, 3, SK.out); k.r(dx + 6, dy - 7, 5, 1, SK.tooth); k.e(dx + 12, dy - 9, 2, 2, SK.tooth); k.e(dx + 12, dy - 6, 2, 2, SK.tooth);   /* the bone */
  k.e(dx - 9, dy - 2, 3, 2, SK.out); k.e(dx - 9, dy - 2, 2, 1, '#d8a04a'); k.e(dx + 8, dy - 1, 3, 2, SK.out); k.e(dx + 8, dy - 1, 2, 1, '#d8a04a');   /* roast potatoes */
  k.r(dx - 3, dy - 11, 2, 3, '#3a8a2a'); k.r(dx - 5, dy - 10, 2, 2, '#5aaa3a'); k.r(dx - 1, dy - 10, 2, 2, '#8ac03a');
}
/* ---------------------------------------------------------------- THE HALL: the pie oven in its hatch, the bellows, the high table ---------------------------------------------------------------- */
/* THE PIE OVEN (sized to him): a brick bread oven 84 wide under a domed crown, its mouth, a chimney; above it the KITCHEN HATCH the serving line comes out of (hatchY: the line's start, px above the floor) */
const OVEN = once2(() => { const [c, g] = canvas(100, 112); const k = mk(g, false), ox = 50, fy = 112;
  k.p([[ox - 44, fy], [ox - 44, fy - 64], [ox - 30, fy - 90], [ox, fy - 100], [ox + 30, fy - 90], [ox + 44, fy - 64], [ox + 44, fy]], SK.out);
  k.p([[ox - 43, fy], [ox - 43, fy - 64], [ox - 29, fy - 89], [ox, fy - 99], [ox + 29, fy - 89], [ox + 43, fy - 64], [ox + 43, fy]], '#5a4a40');
  for (let y = fy - 98; y < fy; y += 7) { const row = ((fy - y) / 7) | 0; for (let x = ox - 43 + (row & 1) * 7; x < ox + 43; x += 14) { k.r(x, y, 1, 7, '#3a2c24'); } k.r(ox - 43, y, 86, 1, '#3a2c24'); }
  g.globalCompositeOperation = 'destination-in'; fillPoly(g, [[ox - 43, fy], [ox - 43, fy - 64], [ox - 29, fy - 89], [ox, fy - 99], [ox + 29, fy - 89], [ox + 43, fy - 64], [ox + 43, fy]], '#000'); g.globalCompositeOperation = 'source-over';
  k.p([[ox - 44, fy], [ox - 44, fy - 64], [ox - 30, fy - 90], [ox, fy - 100], [ox, fy - 97], [ox - 28, fy - 87], [ox - 41, fy - 63], [ox - 41, fy]], '#8a7a6a');
  k.r(ox - 46, fy - 8, 92, 8, SK.out); k.r(ox - 45, fy - 7, 90, 6, '#6a5a4c'); k.r(ox - 45, fy - 7, 90, 1, '#9a8a78');   /* the hearth step */
  k.e(ox, fy - 34, 23, 22, SK.out); k.r(ox - 23, fy - 34, 46, 26, SK.out); k.e(ox, fy - 34, 21, 20, '#120a08'); k.r(ox - 21, fy - 34, 42, 26, '#120a08');   /* the oven mouth */
  for (let a = 0; a < 9; a++) { const t = Math.PI + a * Math.PI / 8, x = ox + Math.cos(t) * 25, y = fy - 34 + Math.sin(t) * 24; k.r(x - 2, y - 2, 5, 5, SK.out); k.r(x - 1, y - 1, 3, 3, '#a8402a'); }   /* the red-brick voussoirs */
  k.r(ox + 18, fy - 112, 14, 20, SK.out); k.r(ox + 19, fy - 111, 12, 19, '#4a3a30'); k.r(ox + 17, fy - 112, 16, 3, '#2a2020');   /* the chimney stub */
  return c; });
function once2(fn) { let v = null; return () => (v || (v = fn())); }
/* (claude/kitchengate2art) the stove he heats his chillies on: ristras of red peppers hung over the mouth and down both sides, a little painted chilli sign, a red glaze band, ember-glow on the strings when the fire is up */
function pepperDress(g, ox, fy, hot, time) {
  const k = mk(g, false);
  k.r(ox - 43, fy - 60, 86, 5, SK.out); k.r(ox - 42, fy - 59, 84, 3, '#a8402a'); k.r(ox - 42, fy - 59, 84, 1, '#d8603a');   /* the red glaze band */
  for (const [sx, n] of [[ox - 36, 5], [ox + 34, 4], [ox - 24, 3]]) { k.r(sx, fy - 66, 1, 7, SK.out);
    for (let i = 0; i < n; i++) { const y = fy - 62 + i * 8, sw = Math.sin(time * 1.4 + sx + i) * 0.8, cx = sx + (i & 1 ? 3 : -3) + sw; k.p([[cx - 2, y], [cx + 2, y], [cx + 1, y + 8], [cx, y + 10]], SK.out); k.p([[cx - 1, y + 1], [cx + 1, y + 1], [cx + 1, y + 7], [cx, y + 9]], hot ? '#ff4a2a' : '#d8201a'); k.r(cx - 1, y + 1, 1, 4, '#ff8a6a'); k.r(cx - 1, y - 1, 3, 2, '#3a8a2a'); } }
  k.r(ox - 12, fy - 80, 24, 12, SK.out); k.r(ox - 11, fy - 79, 22, 10, '#e8dcc0'); k.r(ox - 11, fy - 79, 22, 1, '#ffffff'); k.p([[ox - 7, fy - 71], [ox - 3, fy - 77], [ox + 4, fy - 77], [ox + 8, fy - 74], [ox + 4, fy - 73], [ox - 2, fy - 72]], '#d8201a'); k.r(ox + 7, fy - 78, 3, 3, '#3a8a2a');   /* the sign */
  k.r(ox - 1, fy - 86, 1, 6, SK.out); k.r(ox + 1, fy - 86, 1, 6, SK.out);
  if (hot) { g.globalAlpha = 0.14 + 0.06 * Math.sin(time * 9); rect(g, ox - 44, fy - 66, 88, 66, '#ff3a1a'); g.globalAlpha = 1; }
}
export function drawOven(g, ox, fy, st, time, hatchY = 176) {
  const k = mk(g, false), hot = st === 'bake' || st === 'out';
  /* the hatch, high in the wall: a dark opening with a counter; the serving line comes out of it */
  const hy = fy - hatchY; if (hatchY) { k.r(ox - 26, hy - 26, 52, 40, SK.out); k.r(ox - 24, hy - 24, 48, 36, '#1a1010'); k.r(ox - 26, hy + 12, 52, 5, SK.oakL); k.r(ox - 26, hy + 12, 52, 1, SK.oakLL);
  k.r(ox - 26, hy - 30, 52, 5, SK.oak); k.r(ox - 26, hy - 30, 52, 1, SK.oakL); for (let i = 0; i < 4; i++) { k.r(ox - 16 + i * 10, hy - 18, 3, 16, '#2a2020'); k.r(ox - 16 + i * 10, hy - 18, 3, 2, '#c8c8d0'); } }   /* ladles and cleavers hung in the dark (claude/kitchengate2: hatchY 0 = the stove alone, the hatch is drawHatch) */
  g.drawImage(OVEN(), R(ox - 50), R(fy - 112));
  if (!hatchY) pepperDress(g, ox, fy, hot, time);   /* (claude/kitchengate2art) THE PEPPER STOVE: chilli strings, a red sign */
  if (hot) { const q = 0.7 + 0.3 * Math.sin(time * 14); k.e(ox, fy - 22, 18, R(16 * q), '#c0401a'); k.e(ox, fy - 19, 13, R(12 * q), '#ff9a3c'); k.e(ox, fy - 17, 7, R(6 * q), '#ffe9a0');
    g.globalAlpha = 0.18; rect(g, ox - 60, fy - 90, 120, 90, '#ff8a3a'); g.globalAlpha = 1;
    for (let i = 0; i < 5; i++) { const t = (time * 0.7 + i / 5) % 1; g.globalAlpha = 1 - t; rect(g, R(ox + 22 + Math.sin(time * 3 + i) * 6), R(fy - 116 - t * 30), 4, 4, '#5a504a'); g.globalAlpha = 1; } }
  else if (st === 'cold') { rect(g, ox - 14, fy - 14, 28, 4, '#c0401a'); if (Math.floor(time * 2) % 3 === 0) rect(g, ox - 3, fy - 17, 3, 3, '#ffd36b'); }
  else { rect(g, ox - 14, fy - 12, 28, 3, '#4a2a22'); }
}
/* THE BELLOWS (sized to the oven): a great leather bag on a stand, its nozzle into the oven's side (facing west, at the oven) */
export function drawBellows(g, bx, fy, cold, time, pump) {
  const k = mk(g, false), p = pump || 0;
  k.r(bx - 16, fy - 6, 32, 6, SK.out); k.r(bx - 15, fy - 5, 30, 5, SK.oakD); k.r(bx - 15, fy - 5, 30, 1, SK.oakL);   /* the stand */
  k.p([[bx + 16, fy - 8 - p], [bx - 8, fy - 15 - p], [bx - 8, fy - 6], [bx + 16, fy - 6]], SK.out);
  k.p([[bx + 15, fy - 8 - p], [bx - 7, fy - 14 - p], [bx - 7, fy - 7], [bx + 15, fy - 7]], '#7a4a2a'); k.p([[bx + 15, fy - 8 - p], [bx - 7, fy - 14 - p], [bx - 7, fy - 12 - p], [bx + 15, fy - 9 - p]], '#a06a3e');   /* the leather bag */
  for (let x = bx - 4; x < bx + 14; x += 4) k.r(x, fy - 11, 1, 4, '#3a2010');   /* its folds */
  k.r(bx - 20, fy - 14, 13, 5, SK.out); k.r(bx - 20, fy - 13, 13, 2, SK.ironL); k.r(bx - 24, fy - 14, 5, 5, SK.ironD);   /* the nozzle, at the oven */
  k.r(bx + 8, fy - 24 - p, 12, 3, SK.oakD); k.r(bx + 8, fy - 24 - p, 12, 1, SK.oakL); k.r(bx + 12, fy - 22 - p, 3, 12, SK.oakD);   /* the handle */
  if (cold) { g.strokeStyle = Math.floor(time * 3) % 2 ? '#ffd36b' : 'rgba(255,211,107,0.5)'; g.strokeRect(bx - 25.5, fy - 28.5, 48, 29); }
}
/* THE HIGH TABLE (sized to him: 40 high): a plum cloth to the floor with a gold fringe, the roasts on it, a candelabra at the west end (his tureen stands on the east end: drawn with him) */
export function drawTable(g, t0, t1, fy, time) {
  const k = mk(g, false), w = t1 - t0, H = 40;
  k.r(t0 - 2, fy - H, w + 4, H, SK.out); k.r(t0, fy - H + 2, w, H - 2, SK.robe); k.r(t0, fy - H + 2, w, 4, SK.robeL);
  for (let x = t0 + 6; x < t1 - 4; x += 12) { k.r(x, fy - H + 6, 1, H - 9, SK.robeD); k.r(x + 1, fy - H + 6, 1, H - 9, SK.robeL); }
  for (let x = t0; x < t1; x += 16) { k.p([[x, fy - H + 2], [x + 16, fy - H + 2], [x + 8, fy - H + 12]], SK.trimD); k.p([[x + 1, fy - H + 2], [x + 15, fy - H + 2], [x + 8, fy - H + 10]], SK.trim); }   /* the gold swags */
  k.r(t0, fy - 6, w, 6, SK.trimD); for (let x = t0; x < t1; x += 3) k.r(x, fy - 5, 1, 6, SK.trim);   /* the fringe */
  k.r(t0 - 5, fy - H - 4, w + 10, 6, SK.out); k.r(t0 - 4, fy - H - 3, w + 8, 4, '#d8c8a8'); k.r(t0 - 4, fy - H - 3, w + 8, 1, '#fff0d0');
  /* a whole roast boar on a platter, and a pyramid of rolls */
  const px0 = t0 + 10; k.e(px0 + 16, fy - H - 6, 20, 4, SK.out); k.e(px0 + 16, fy - H - 6, 19, 3, SK.dish);
  k.e(px0 + 16, fy - H - 13, 15, 9, SK.out); k.e(px0 + 16, fy - H - 13, 14, 8, SK.food); k.e(px0 + 12, fy - H - 17, 7, 3, SK.foodL); k.e(px0 + 30, fy - H - 12, 6, 5, SK.out); k.e(px0 + 30, fy - H - 12, 5, 4, SK.food); k.e(px0 + 34, fy - H - 11, 3, 3, '#c83a2a'); k.r(px0 + 26, fy - H - 17, 2, 2, SK.out);
  for (let q = 0; q < 3; q++) { k.e(px0 + 48 + q * 7, fy - H - 6, 4, 3, SK.out); k.e(px0 + 48 + q * 7, fy - H - 6, 3, 2, '#d8a04a'); } for (let q = 0; q < 2; q++) { k.e(px0 + 51 + q * 7, fy - H - 10, 4, 3, SK.out); k.e(px0 + 51 + q * 7, fy - H - 10, 3, 2, '#e8b45a'); }
  const cx = t0 + 3; k.r(cx - 1, fy - H - 22, 3, 18, SK.out); k.r(cx, fy - H - 21, 1, 17, SK.trim); k.r(cx - 6, fy - H - 18, 13, 2, SK.trimD); for (const dx of [-6, 0, 6]) { k.r(cx + dx, fy - H - 26, 1, 8, '#ffffff'); const f = 0.6 + 0.4 * Math.sin(time * 9 + dx); k.r(cx + dx - 1, fy - H - 30 + R(2 - 2 * f), 3, R(4 + 2 * f), '#ffd36b'); }
}
/* the serving line's rail: an iron rail with S-hooks, from the hatch to his table */
export function drawLine(g, x0, y0, x1, y1, lineY, step) {
  const k = mk(g, false); g.strokeStyle = SK.out; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = SK.iron; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = SK.ironL; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0 - 1); g.lineTo(x1, y1 - 1); g.stroke(); g.lineWidth = 1;
  for (let q = x0 + 20; q < x1; q += step) { const yy = lineY(q); k.r(q - 1, yy - 12, 3, 12, SK.out); k.r(q, yy - 12, 1, 12, SK.ironL); k.r(q - 3, yy - 14, 7, 2, SK.out); }   /* braces up to the roof */
}
export function drawHooked(g, dx, hy, dy, kind, time) {
  const k = mk(g, false); k.r(dx - 1, hy, 3, dy - hy - 4, SK.out); k.r(dx, hy, 1, dy - hy - 4, SK.ironL); k.r(dx - 4, dy - 8, 9, 3, SK.out); k.r(dx - 3, dy - 7, 7, 1, SK.ironLL);   /* the hook and its chain */
  dish(g, false, dx, dy, kind, time);
}

/* ---------------------------------------------------------------- (claude/kitchengate2art) THE SERVING LINE and his hall, DRAWN (the greybox hooks, same footprints: art only) ---------------------------------------------------------------- */
const TILE = ['#e8e4d4', '#cfc9b4', '#a89f86'], GREEN = ['#2a4a3c', '#3e6a56', '#5f927a'];
/* THE KITCHEN HATCH in the west wall at the line's start (x0, the line's top y): a brick arch round a lit mouth, a half-raised roller shutter with a brass pull, a ladle rack inside, steam, and the chute of beaten iron that drops onto the belt */
export function drawHatch(g, x0, by, time) {
  const k = mk(g, false), L = x0 - 32, T = by - 60;
  k.r(L - 2, T, 42, 46, SK.out); k.r(L, T + 2, 38, 42, '#6a5a4c');   /* the wall's brick surround */
  for (let y = T + 2; y < T + 44; y += 6) { k.r(L, y, 38, 1, '#3a2c24'); for (let x = L + (((y - T) / 6 | 0) & 1) * 5; x < L + 38; x += 10) k.r(x, y, 1, 6, '#3a2c24'); }
  k.r(L, T + 2, 38, 1, '#9a8a78');
  k.r(L + 3, T + 7, 32, 36, SK.out); k.r(L + 4, T + 8, 30, 35, '#1a0e0a');   /* the dark mouth */
  const f = 0.65 + 0.35 * Math.sin(time * 3.1); g.globalAlpha = 0.34 * f; k.r(L + 4, T + 18, 30, 25, '#ff8a3a'); g.globalAlpha = 0.18 * f; k.r(L + 8, T + 12, 22, 14, '#ffd36b'); g.globalAlpha = 1;   /* the fire glowing inside */
  for (let i = 0; i < 4; i++) { const hx = L + 9 + i * 7; k.r(hx, T + 9, 1, 9, SK.ironD); k.e(hx, T + 21, 2, 3, SK.ironL); k.e(hx, T + 21, 1, 2, SK.ironLL); }   /* ladles on a rack, seen against the glow */
  k.r(L + 4, T + 8, 30, 7, SK.out); for (let x = L + 4; x < L + 34; x += 3) k.r(x, T + 9, 2, 5, x % 2 ? '#3a2c24' : '#2a2018');   /* the roller shutter's slats, half down */
  k.r(L + 4, T + 15, 30, 1, SK.ironL); k.e(L + 19, T + 17, 2, 2, SK.trim);   /* its brass pull */
  k.r(L, T + 42, 38, 3, SK.out); k.r(L, T + 43, 38, 2, SK.oakL); k.r(L, T + 43, 38, 1, SK.oakLL);   /* the sill */
  k.p([[L + 3, by - 16], [x0 + 6, by - 16], [x0 + 16, by - 2], [x0 - 14, by - 2]], SK.out); k.p([[L + 4, by - 15], [x0 + 5, by - 15], [x0 + 14, by - 3], [x0 - 13, by - 3]], SK.iron);
  k.r(L + 4, by - 15, x0 + 1 - L, 1, SK.ironLL); for (const dx of [0, 9, 19]) k.r(L + 8 + dx, by - 13, 2, 2, SK.ironLL); k.l(x0 + 4, by - 14, x0 + 12, by - 4, SK.ironL);   /* the chute: rivets, a lit lip */
  for (let i = 0; i < 3; i++) { const t = (time * 0.5 + i / 3) % 1; g.globalAlpha = 0.5 * (1 - t); k.e(L + 12 + i * 8 + Math.sin(time * 2 + i) * 2, T + 4 - t * 16, 3 + t * 3, 2 + t * 2, '#e8e8e8'); g.globalAlpha = 1; }   /* steam out of the mouth */
}
/* THE CONVEYOR (the serving line): a counter of green glazed tile on iron legs, a steel side rail, a belt of tarred canvas with raised wooden cleats running east (scroll: px the belt has run), the rollers at each end, a chevron plate showing the way */
export function drawBelt(g, x0, x1, by, fy, scroll, time) {
  const k = mk(g, false), w = x1 - x0;
  for (let x = x0 + 10; x < x1 - 6; x += 40) { k.r(x - 1, by + 12, 7, fy - by - 12, SK.out); k.r(x, by + 12, 5, fy - by - 12, SK.ironD); k.r(x, by + 12, 1, fy - by - 12, SK.ironL); k.r(x + 4, by + 12, 1, fy - by - 12, SK.out); k.r(x - 2, fy - 4, 9, 4, SK.out); k.r(x - 1, fy - 3, 7, 2, SK.iron); }   /* legs on foot-plates */
  k.r(x0 - 2, by - 4, w + 4, 19, SK.out); k.r(x0, by + 3, w, 11, GREEN[1]); k.r(x0, by + 3, w, 2, GREEN[2]); k.r(x0, by + 12, w, 2, GREEN[0]);   /* the tiled counter */
  for (let x = x0 + 8; x < x1; x += 8) k.r(x, by + 5, 1, 7, GREEN[0]); k.r(x0, by + 8, w, 1, GREEN[0]);   /* the grout */
  k.r(x0 - 3, by + 13, w + 6, 3, SK.out); k.r(x0 - 2, by + 13, w + 4, 2, SK.ironL); k.r(x0 - 2, by + 13, w + 4, 1, SK.ironLL);   /* the steel apron */
  k.r(x0, by - 3, w, 7, '#2a1e18'); k.r(x0, by - 3, w, 1, '#4a382a');   /* the belt: tarred canvas */
  const off = ((scroll % 14) + 14) % 14; for (let x = x0 + off - 14; x < x1; x += 14) { const a = Math.max(x0, x), b = Math.min(x1, x + 3); if (b > a) { k.r(R(a), by - 3, R(b - a), 7, '#6a4a30'); k.r(R(a), by - 3, R(b - a), 1, '#9a7448'); k.r(R(a), by + 3, R(b - a), 1, '#3a2818'); } }   /* the cleats */
  k.r(x0, by - 4, w, 1, SK.ironL);   /* the rail's lip over the belt */
  for (const xx of [x0 + 1, x1 - 7]) { k.e(xx + 3, by, 6, 6, SK.out); k.e(xx + 3, by, 5, 5, SK.iron); k.e(xx + 3, by, 5, 2, SK.ironL); const a = scroll / 5; for (let s = 0; s < 3; s++) k.l(xx + 3, by, xx + 3 + Math.cos(a + s * 2.09) * 4, by + Math.sin(a + s * 2.09) * 4, SK.ironD); k.r(xx + 2, by - 1, 2, 2, SK.trim); }   /* the end rollers, spoked, turning */
  for (let x = x0 + 30; x < x1 - 30; x += 60) { k.p([[x, by + 5], [x + 7, by + 7], [x, by + 9]], SK.trim); k.p([[x + 1, by + 6], [x + 5, by + 7], [x + 1, by + 8]], '#fff0b0'); }   /* gilt chevrons: it runs to him */
}
/* HIS PLATTER at the line's end: the counter's end dressed as his place at table - a plum cloth with gold swags, a silver charger with a cloche pushed aside, knife and fork laid ready */
export function drawPlatter(g, t0, t1, by, fy, time) {
  const k = mk(g, false), w = t1 - t0;
  k.r(t0, by + 10, w, fy - by - 10, SK.out); k.r(t0 + 1, by + 11, w - 2, fy - by - 11, SK.robe);
  for (let x = t0 + 6; x < t1 - 4; x += 12) { k.r(x, by + 20, 1, fy - by - 24, SK.robeD); k.r(x + 1, by + 20, 1, fy - by - 24, SK.robeL); }
  for (let x = t0; x < t1; x += 16) { k.p([[x, by + 11], [x + 16, by + 11], [x + 8, by + 21]], SK.trimD); k.p([[x + 1, by + 11], [x + 15, by + 11], [x + 8, by + 19]], SK.trim); }
  k.r(t0, fy - 6, w, 6, SK.trimD); for (let x = t0; x < t1; x += 3) k.r(x, fy - 5, 1, 6, SK.trim);
  k.r(t0 - 2, by - 3, w + 4, 6, SK.out); k.r(t0, by - 2, w, 4, '#d8c8a8'); k.r(t0, by - 2, w, 1, '#fff0d0');   /* the cloth's edge */
  const cx = t1 - 18;
  k.e(cx, by - 2, 21, 5, SK.out); k.e(cx, by - 2, 20, 4, SK.dishD); k.e(cx, by - 3, 19, 3, SK.dish); k.e(cx - 3, by - 4, 11, 1, '#ffffff'); k.e(cx, by - 2, 11, 2, SK.dishD);   /* the charger */
  k.p([[cx - 24, by - 3], [cx - 24, by + 1], [cx - 22, by + 1], [cx - 22, by - 3]], SK.ironLL); k.r(cx - 25, by - 4, 3, 2, SK.dish);   /* a fork laid by it */
  k.e(cx + 31, by - 6, 7, 6, SK.out); k.e(cx + 31, by - 6, 6, 5, SK.dish); k.r(cx + 30, by - 13, 3, 3, SK.out); k.r(cx + 31, by - 12, 1, 1, '#ffffff');   /* the cloche, pushed aside */
}
/* THE GREASE CAULDRON hung on a chain from the roof over the line's end (x, y its bottom; roofY the roof), tipped tip 0..1 (pouring): riveted black iron, a bail, a skin of amber grease, a wooden pull-ring for his chain */
export function drawCauldron(g, x, y, roofY, tip, time) {
  const k = mk(g, false);
  for (let yy = roofY, i = 0; yy < y - 30; yy += 5, i++) { if (i & 1) { k.r(x - 1, yy, 3, 5, SK.out); k.r(x, yy + 1, 1, 3, SK.ironL); } else { k.r(x - 2, yy, 5, 4, SK.out); k.r(x - 1, yy + 1, 3, 2, SK.ironL); k.r(x - 1, yy + 1, 3, 1, SK.ironLL); } }   /* its chain, links turned alternately */
  g.save(); g.translate(R(x), R(y - 16)); g.rotate(-tip * 1.3);
  k.e(0, 0, 21, 17, SK.out); k.e(0, 0, 20, 16, SK.ironD); k.e(-7, -5, 9, 6, SK.iron); k.e(-9, -8, 4, 2, SK.ironL); k.e(5, 7, 14, 6, SK.out); k.e(5, 7, 13, 5, '#14141a');
  for (const [rx, ry] of [[-15, -3], [-9, 6], [0, 9], [9, 6], [15, -3]]) k.r(rx, ry, 2, 2, SK.ironLL);   /* rivets */
  k.r(-22, -17, 44, 7, SK.out); k.r(-21, -16, 42, 5, SK.iron); k.r(-18, -15, 36, 3, C2.grease); k.r(-12, -15, 12, 1, C2.greaseL); k.r(-21, -16, 42, 1, SK.ironLL);   /* the rim, the grease's skin */
  k.r(-3, -27, 6, 11, SK.out); k.r(-2, -26, 4, 10, SK.ironL); k.e(0, -28, 4, 3, SK.out); k.e(0, -28, 3, 2, SK.ironD);   /* the bail's lug */
  if (tip > 0.3) { k.p([[-20, -14], [-31, -6], [-35, 14], [-26, 19], [-22, -2]], C2.grease); k.p([[-22, -12], [-29, -4], [-31, 10], [-26, 13]], C2.greaseL); k.r(-33, 10, 2, 6, C2.greaseL); }
  g.restore();
  k.r(x + 12, y - 14, 8, 8, SK.out); k.e(x + 16, y - 10, 3, 3, SK.out); k.e(x + 16, y - 10, 2, 2, SK.oakL); k.r(x + 15, y - 11, 2, 2, '#000000');   /* the pull-ring for his chain */
}
const C2 = { grease: '#c88a2a', greaseL: '#f0c060' };
/* the chain from the cauldron's ring down to his fist: iron links, alternately flat and edge-on, a little slack */
export function drawChain(g, x0, y0, x1, y1) { const k = mk(g, false), n = Math.max(3, R(Math.hypot(x1 - x0, y1 - y0) / 5)); for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 6; if (i & 1) { k.r(x - 1, y - 2, 3, 5, SK.out); k.r(x, y - 1, 1, 3, SK.ironL); } else { k.r(x - 2, y - 1, 5, 4, SK.out); k.r(x - 1, y, 3, 2, SK.ironL); k.r(x - 1, y, 3, 1, SK.ironLL); } } }
/* THE BURNING FLOOR (the grease spill): a bed of molten amber grease with tall ragged flames over it and sparks, a black scorch behind */
export function drawBurn(g, x0, x1, fy, time) {
  if (x1 <= x0) return; const k = mk(g, false);
  k.r(x0, fy - 3, x1 - x0, 3, '#3a1a08'); k.r(x0, fy - 3, x1 - x0, 1, '#c88a2a');
  for (let x = x0; x < x1; x += 4) { const ph = x * 0.37, h = 7 + 7 * Math.abs(Math.sin(time * 9 + ph)) + 3 * Math.sin(time * 15 + ph * 1.7), w = 4 + (((x * 7) % 3) | 0);
    k.p([[x, fy - 2], [x + w, fy - 2], [x + w * 0.6, fy - h * 0.6], [x + w * 0.3 + Math.sin(time * 11 + ph) * 2, fy - h]], '#c0401a');
    k.p([[x + 1, fy - 2], [x + w - 1, fy - 2], [x + w * 0.5, fy - h * 0.5], [x + w * 0.35, fy - h * 0.78]], '#ff8a2c');
    k.r(x + 1, fy - 2 - R(h * 0.3), Math.max(1, w - 3), R(h * 0.3), '#ffe9a0'); }
  for (let x = x0 + 5; x < x1; x += 17) { const t = (time * 1.3 + x * 0.11) % 1; g.globalAlpha = 1 - t; k.r(x + Math.sin(time * 5 + x) * 3, fy - 12 - t * 26, 1, 1, '#ffd36b'); g.globalAlpha = 1; }
  g.globalAlpha = 0.16; k.r(x0, fy - 26, x1 - x0, 26, '#ff7a2a'); g.globalAlpha = 1;
}
/* THE HIGH LOB's ham in flight (a whole glazed gammon, bone out, spinning); THE FLING's plate, flat, with its motion streaks */
export function drawHam(g, x, y, rot) {
  g.save(); g.translate(R(x), R(y)); g.rotate(rot); const k = mk(g, false);
  k.e(0, 0, 10, 8, SK.out); k.e(0, 0, 9, 7, '#a8501e'); k.e(-1, 1, 7, 5, '#c0682a'); k.e(-3, -3, 4, 2, '#e8a050'); k.r(-6, 3, 9, 2, '#7a3a14');   /* the glazed gammon */
  k.r(-7, -1, 14, 1, '#e8c070'); k.r(-5, 2, 1, 2, '#e8c070'); k.r(1, -4, 1, 3, '#e8c070');   /* the scoring and cloves */
  k.r(8, -3, 8, 5, SK.out); k.r(9, -2, 6, 3, SK.tooth); k.e(17, -3, 3, 3, SK.out); k.e(17, -3, 2, 2, SK.tooth); k.e(17, 1, 3, 3, SK.out); k.e(17, 1, 2, 2, SK.tooth);   /* the bone knuckle */
  g.restore();
}
export function drawPlateFlat(g, x, y, time) {
  const k = mk(g, false); k.e(x, y, 9, 3, SK.out); k.e(x, y, 8, 2, SK.dish); k.r(x - 6, y - 1, 7, 1, '#ffffff'); k.r(x - 5, y + 1, 10, 1, SK.dishD); k.r(x - 3, y - 3, 6, 1, '#7a4a22');   /* the rim, a smear of gravy */
  for (let q = 1; q < 4; q++) rect(g, R(x + q * 8), R(y), 6 - q, 1, 'rgba(232,224,208,' + (0.7 - q * 0.18).toFixed(2) + ')');
}
