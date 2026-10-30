// src/lance-art.js - THE QUEEN'S LANCE, drawn (claude/stormhold3art; claude/lance4: ON FOOT, the horse deleted; claude/lance4art: the 1:1 sheet).
// Art only: nothing here is read by the fight (updateLance in src/main.js) except frameOf(), which turns his mode into a pose.
//   THE QUEEN'S CHAMPION   plate (cold steel gone grey with the siege), a PLUMED HELM (red plume over a gold crest, one amber slit), the Queen's purple
//                          tabard and cloak with the gold chevron, a TOWER SHIELD in the same, and a LANCE WITH A SWALLOW-TAILED PENNANT (purple, gold edge).
// DRAWN AT 1:1 (brief s1/s2): the joints below are in the old 28x40 design units, and every primitive multiplies by KS = 1.35 as it paints, so the sheet is
// painted AT the size he is shown (about 38x54 px) and the runtime scale is 1 - no nearest-neighbour 1.35 shimmer. Details (rivets, the quiver, the
// shaft's bands, the cracked shield) are real pixels now, not a smear of enlarged ones.
// Both sets are built from joints (a pose is numbers: where the hips are, where the hand is, what angle the lance takes), so every move's tell is a
// different SHAPE, not a recolour. Sheets face right; the left-facing set is the flip (ax/ay = his feet).
// EVERY ATTACK HAS ITS OWN SILHOUETTE FAMILY (thumbnail test): the thrust a horizontal line at the chest, the sweep a big arc then flat at the ankles, the
// charge a low wedge, the vault a tall pole, the wall a door with feet, the volley an arm straight up beside a planted lance, the pennant a vertical
// lance with its cloth huge. Each tell has its anticipation frame(s), each blow its release (with a smear) and follow-through, each opening a held loop of two.
import { canvas, rect, fillPoly, line, circle, outline, flipX, whiten } from './px.js';

const OUT = '#1b1626';
const C = { s: '#b4bcc8', S: '#8590a0', D: '#4a5262', K: '#262b36', p: '#8a4cb4', P: '#4e2670', G: '#f0c048', g: '#a87c20', r: '#d8483e', R: '#8f2f28',
  w: '#9a7448', W: '#5e4430', e: '#ffc04a', f: '#f0f4f8', k: '#14121a', h: '#4a3640', H: '#2e2128', b: '#6a5058', d: '#b9ad94', q: '#7d7466' };
const rad = a => a * Math.PI / 180;
const KS = 1.35;                                   /* the design units -> pixels: he is painted at the size he is shown */

// ---------------------------------------------------------------------------------------------------------------- THE CHAMPION
const CW = 112, CH = 92, FX = 36, FY = 87;   /* the sheet in design units, and his feet on it */
function champion(o0, S = KS) {
  const [c, g] = canvas(Math.ceil(CW * S), Math.ceil(CH * S));
  const R = v => Math.round(v * S);
  const dot = (x, y, col) => rect(g, R(x), R(y), 1, 1, col);
  const box = (x, y, w, h, col) => rect(g, R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h)), col);
  const poly = (pts, col) => fillPoly(g, pts.map(p => [p[0] * S, p[1] * S]), col);
  const ln = (x0, y0, x1, y1, col, t = 1) => line(g, x0 * S, y0 * S, x1 * S, y1 * S, col, t);
  const disc = (x, y, r, col) => circle(g, x * S, y * S, r * S, col);
  const limb = (x0, y0, x1, y1, w0, w1, col) => { const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    poly([[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]], col); };
  const o = { lean: 0, crouch: 0, hipDx: 0, foot: [-5, 5], lift: [0, 0], knee: [1, 3], hand: [9, -3], ang: -28, len: 36, sh: [6, 5], shS: 1, flut: 0, cape: 1, air: 0, head: [0, 0], banner: 1, plume: 1, thigh: 0,
    pole: true, ghost: null, dust: 0, plant: null, spear: false, sang: -75, drop: null, tipFx: false, shSplit: 0, rot: 0, ...o0 };
  const hipX = FX + o.hipDx, hipY = FY - 15 + o.crouch - o.air;
  const shX = hipX + o.lean, shY = hipY - 12 + (o.crouch > 3 ? 1 : 0), hdX = shX + 1 + o.head[0], hdY = shY - 7 + o.head[1];
  const fl = o.flut, fk = Math.sin(fl) * 1.6;
  // ---- the cloak, behind everything
  if (o.cape) { const k = o.cape; poly([[shX - 3, shY - 1], [shX + 1, shY + 1], [hipX - 1, hipY + 9], [hipX - 9 - 4 * k + fk, hipY + 12 + (o.air ? -2 : 0)], [shX - 8 - 2 * k, shY + 6]], C.P);
    poly([[shX - 3, shY - 1], [shX, shY + 1], [hipX - 3, hipY + 7], [shX - 6 - k, shY + 5]], '#3a1c54');                       /* the fold in shadow */
    ln(shX - 4, shY + 1, hipX - 8 - 4 * k + fk, hipY + 11, C.p); ln(shX - 3, shY + 3, hipX - 6 - 3 * k + fk * 0.7, hipY + 11, '#6a3590'); box(hipX - 8 - 4 * k + fk, hipY + 11, 2, 1.2, C.G); }
  // ---- the QUIVER on his back: three spear butts (the volley draws from it); one fewer once he has drawn
  { const qx = shX - 6, qy = shY + 2, n = o.spear ? 2 : 3;
    poly([[qx - 2, qy - 2], [qx + 2, qy - 4], [qx + 3, qy + 7], [qx - 1, qy + 9]], C.H); ln(qx - 1, qy - 2, qx, qy + 8, C.h);
    for (let i = 0; i < n; i++) { ln(qx - 1 + i * 1.6, qy - 3, qx - 5 + i * 2.2, qy - 11 - i, C.W); box(qx - 5.6 + i * 2.2, qy - 12.4 - i, 1.4, 1.4, C.g); }
    box(qx - 2, qy + 5, 5, 1.2, C.g); }
  // ---- legs (back one, then front): greaves with a bright knee cop, cuisse plates and a dark sabaton
  const leg = (i, back) => { const hx = hipX + (i ? 2 : -2), fx = FX + o.foot[i], fy = FY - o.lift[i], kx = (hx + fx) / 2 + o.knee[i], ky = (hipY + fy) / 2 - (o.thigh || 0);
    limb(hx, hipY, kx, ky, 5, 4, back ? C.D : C.S); limb(kx, ky, fx, fy - 2, 4, 3.4, back ? C.D : C.S);
    if (!back) { ln(hx - 1, hipY + 2, kx - 1, ky - 1, C.s); ln(kx, ky + 2, fx, fy - 4, C.s); }
    disc(kx, ky, 2, back ? C.S : C.s); dot(kx + 0.5, ky - 1, C.f); box(fx - 1, fy - 3, 6, 3, C.K); box(fx + 3, fy - 3, 2, 1.2, C.D); dot(fx + 4, fy - 2, C.D); };
  leg(0, true); leg(1, false);
  // ---- DUST at his feet (a scrape, a skid, a wall slammed down)
  if (o.dust) for (let i = 0; i < o.dust * 2 + 1; i++) { const dx = FX + o.foot[0] - 2 - i * 4.5 + (i % 2) * 2, dy = FY - 1 - (i % 3) * 1.8 - i * 0.5, r = 1.4 + (i % 2) * 0.8;
    disc(dx, dy, r, C.q); disc(dx - 0.3, dy - 0.4, r * 0.7, C.d); }
  // ---- the lance (and its smear): drawn behind the torso
  const hx = shX + o.hand[0], hy = shY + o.hand[1] + 2, ang = rad(o.ang), dx = Math.cos(ang), dy = Math.sin(ang);
  const lance = (bx0, by0, a, len, banner, alpha) => { const ddx = Math.cos(a), ddy = Math.sin(a), nx = -ddy, ny = ddx, tx = bx0 + ddx * len, ty = by0 + ddy * len, bx = bx0 - ddx * 9, by = by0 - ddy * 9;
    g.globalAlpha = alpha;
    limb(bx, by, tx, ty, 2.5, 2.5, alpha < 1 ? '#dfe6f0' : C.W);
    if (alpha >= 1) { limb(bx - nx * 0.45, by - ny * 0.45, tx - nx * 0.45, ty - ny * 0.45, 1, 1, C.w);
      for (let k = 0.18; k < 0.9; k += 0.27) { const mx = bx0 + ddx * len * k, my = by0 + ddy * len * k; limb(mx - ddx * 0.6, my - ddy * 0.6, mx + ddx * 0.6, my + ddy * 0.6, 2.9, 2.9, C.g); }   /* the iron bands */ }
    poly([[tx + ddx * 7.5, ty + ddy * 7.5], [tx + nx * 2.3, ty + ny * 2.3], [tx - nx * 2.3, ty - ny * 2.3]], alpha < 1 ? '#dfe6f0' : C.f);
    if (alpha >= 1) { poly([[tx + ddx * 7.5, ty + ddy * 7.5], [tx, ty], [tx - nx * 2.3, ty - ny * 2.3]], C.S); ln(tx + ddx * 1, ty + ddy * 1, tx + ddx * 6, ty + ddy * 6, C.f);
      limb(tx - ddx * 0.2, ty - ddy * 0.2, tx + ddx * 0.8, ty + ddy * 0.8, 4.6, 4.6, C.g);                                  /* the socket */
      disc(bx0 + ddx * 3, by0 + ddy * 3, 2.5, C.g); disc(bx0 + ddx * 3, by0 + ddy * 3, 1.5, C.G); }                          /* the vamplate at the hand */
    g.globalAlpha = 1;
    if (banner && alpha >= 1) { const sx = tx - ddx * 6, sy = ty - ddy * 6, kk = banner, flyx = -Math.max(0.5, ddx * 0.6 + 0.8) * 12 * kk, flyy = (3 + Math.sin(fl + 1) * 2) * kk + (ddy < -0.6 ? 2 : 0), q = 3 * kk;
      poly([[sx, sy], [sx - ddx * 7, sy - ddy * 7], [sx - ddx * 7 + flyx, sy - ddy * 7 + flyy + q * 0.4], [sx + flyx * 0.78, sy + flyy * 0.78 + 0.5 - q * 0.2], [sx + flyx, sy + flyy - q * 0.8]], C.p);
      poly([[sx - ddx * 3.5, sy - ddy * 3.5], [sx - ddx * 7, sy - ddy * 7], [sx - ddx * 7 + flyx, sy - ddy * 7 + flyy + q * 0.4], [sx - ddx * 3.5 + flyx * 0.6, sy - ddy * 3.5 + flyy * 0.6]], C.P);   /* the lower fold in shade */
      ln(sx, sy, sx + flyx, sy + flyy - q * 0.8, C.G); ln(sx - ddx * 7, sy - ddy * 7, sx - ddx * 7 + flyx, sy - ddy * 7 + flyy + q * 0.4, C.R); dot(sx + flyx * 0.4, sy + flyy * 0.4 + 1, C.G); } };
  if (o.ghost) for (const [gx, gy, ga, al] of o.ghost) lance(hx + gx, hy + gy, rad(ga), o.len, 0, al * 0.55);   /* the SMEAR: where the lance was a frame ago */
  if (o.pole && o.len > 0) lance(hx, hy, ang, o.len, o.banner, 1);
  if (o.plant != null) { const px0 = FX + o.plant; limb(px0, FY, px0, FY - 62, 2.5, 2.5, C.W); limb(px0 - 0.45, FY, px0 - 0.45, FY - 62, 1, 1, C.w);
    poly([[px0, FY - 70], [px0 + 2.3, FY - 62], [px0 - 2.3, FY - 62]], C.f); poly([[px0, FY - 70], [px0, FY - 62], [px0 - 2.3, FY - 62]], C.S);
    const sx = px0, sy = FY - 58, kk = o.banner || 1, fy = Math.sin(fl + 1) * 2;
    poly([[sx, sy], [sx, sy + 6], [sx - 11 * kk, sy + 7 + fy], [sx - 8 * kk, sy + 3.5 + fy * 0.6], [sx - 12 * kk, sy + 1 + fy]], C.p); ln(sx, sy, sx - 12 * kk, sy + 1 + fy, C.G); }
  if (o.drop) lance(FX + o.drop.x, FY + o.drop.y, rad(o.drop.ang), 36, 0.7, 1);
  // ---- THROWING SPEAR in the hand (the volley)
  if (o.spear) { const sa = rad(o.sang), sx = hx, sy = hy, ex = sx + Math.cos(sa) * 22, ey = sy + Math.sin(sa) * 22, bx = sx - Math.cos(sa) * 6, by = sy - Math.sin(sa) * 6;
    limb(bx, by, ex, ey, 2, 2, C.W); poly([[ex + Math.cos(sa) * 6, ey + Math.sin(sa) * 6], [ex - Math.sin(sa) * 2, ey + Math.cos(sa) * 2], [ex + Math.sin(sa) * 2, ey - Math.cos(sa) * 2]], C.f); box(bx - 0.5, by - 0.5, 1.6, 1.6, C.g); }
  // ---- the body: breastplate, the tabard over the belt, gold girdle, the pauldron
  poly([[shX - 5, shY - 1], [shX + 5, shY - 1], [hipX + 4, hipY], [hipX - 4, hipY]], C.S);
  poly([[shX + 0.5, shY], [shX + 5, shY], [hipX + 4, hipY - 3], [hipX + 1, hipY - 3]], C.s);
  ln(shX - 4, shY + 1, hipX - 3, hipY - 2, C.D); ln(shX - 1, shY + 1.5, hipX, hipY - 3, C.D);                                    /* the plate's seams */
  poly([[hipX - 4, hipY - 3], [hipX + 5, hipY - 3], [hipX + 5, hipY + 4], [hipX + 1, hipY + 7], [hipX - 4, hipY + 4]], C.p); box(hipX, hipY - 2, 1, 8, C.G); box(hipX - 4, hipY - 3, 10, 1, C.G);
  poly([[hipX - 4, hipY - 2], [hipX, hipY - 2], [hipX, hipY + 6], [hipX - 4, hipY + 4]], C.P);                                    /* the tabard's shaded half */
  dot(hipX - 3, hipY + 4, C.P); dot(hipX + 4, hipY + 3, C.P); box(hipX - 3.5, hipY + 4.4, 8, 0.8, C.g);                           /* the hem's gold */
  for (const rx of [-2.5, 2.5]) dot(hipX + rx, hipY - 2.4, C.f);                                                                  /* girdle studs */
  disc(shX + 1, shY + 1.2, 3.6, C.S); disc(shX + 1.4, shY + 0.6, 2.6, C.s); dot(shX + 4, shY - 1, C.f); dot(shX + 3, shY - 2, C.G); dot(shX - 1, shY + 1, C.D);
  box(shX - 1, shY - 3, 5, 3, C.D); dot(shX + 1, shY - 3, C.S);   /* the gorget */
  // ---- the head: a closed great helm, one amber slit, a gold crest and a red plume streaming back
  const pl = o.plume;
  if (pl) { const sway = Math.sin(fl * 1.3); for (let k = 0; k < 11; k++) { const x = hdX - 1 - k * 0.95 * pl, y = hdY - 4 + k * 0.45 + Math.sin(k * 0.6 + fl) * 0.9 + (k > 6 ? 1 : 0) + sway * 0.3, th = k < 7 ? 3 : 2; box(x, y, 2, th, k % 3 === 2 ? C.R : C.r); }
    for (let k = 0; k < 8; k++) dot(hdX - 2 - k * 0.9 * pl, hdY - 3 + k * 0.45 + Math.sin(k * 0.6 + fl) * 0.9, C.p); }
  poly([[hdX - 3.5, hdY - 4], [hdX + 3.5, hdY - 4], [hdX + 4.5, hdY - 1], [hdX + 4, hdY + 4], [hdX + 1, hdY + 5.5], [hdX - 3, hdY + 5.5], [hdX - 4, hdY]], C.S);
  poly([[hdX + 0.5, hdY - 4], [hdX + 3.5, hdY - 4], [hdX + 4.5, hdY - 1], [hdX + 4, hdY + 3], [hdX + 1, hdY + 3]], C.s);
  ln(hdX - 3, hdY - 3, hdX - 3, hdY + 4, C.D);                                                                                   /* the helm's back seam */
  box(hdX - 1, hdY - 6, 5, 2, C.G); dot(hdX + 1, hdY - 7, C.G); dot(hdX + 2, hdY - 5.5, C.g);   /* the crest */
  box(hdX + 1.5, hdY - 0.5, 4, 1, C.e); dot(hdX + 4, hdY - 0.5, C.f); dot(hdX + 2, hdY + 2, C.D); dot(hdX + 3, hdY + 3, C.D); dot(hdX + 4, hdY + 2, C.D); box(hdX - 3, hdY + 2, 2, 1, C.D);
  // ---- the sword arm: shoulder to the hand on the lance
  const exx = (shX + 2 + hx) / 2, eyy = (shY + 2 + hy) / 2 + (o.hand[1] < -6 ? 1 : 3);
  limb(shX + 2, shY + 2, exx, eyy, 4, 3.4, C.S); limb(exx, eyy, hx, hy, 3.4, 3, C.D); disc(exx, eyy, 1.7, C.s); disc(hx, hy, 1.9, C.K); dot(hx + 0.5, hy - 1, C.D);
  if (o.two) { const ox = hx - dx * 8, oy = hy - dy * 8; limb(shX - 1, shY + 2, (shX - 1 + ox) / 2, (shY + 2 + oy) / 2 + 2, 4, 3.4, C.D); limb((shX - 1 + ox) / 2, (shY + 2 + oy) / 2 + 2, ox, oy, 3.4, 3, C.D); disc(ox, oy, 1.9, C.K); }   /* SHIELDLESS: the off hand on the shaft */
  // ---- the tower shield on the near arm (cracked and split by the bars in his P3 transition)
  const sx = shX + o.sh[0], sy = shY + o.sh[1] + 5, k = o.shS, hw = 4.8 * k, hh = 10 * k;
  const shield = (ox, oy, rotK) => { const x = sx + ox, y = sy + oy;
    poly([[x - hw - 1, y - hh - 1], [x + hw + 1, y - hh - 1], [x + hw + 1, y + hh * 0.3], [x, y + hh + 1.5], [x - hw - 1, y + hh * 0.3]], C.K);
    poly([[x - hw, y - hh], [x + hw, y - hh], [x + hw, y + hh * 0.3], [x, y + hh], [x - hw, y + hh * 0.3]], C.p);
    poly([[x - hw, y - hh], [x, y - hh], [x, y + hh], [x - hw, y + hh * 0.3]], C.P);
    ln(x - hw, y - hh, x + hw, y - hh, C.s); ln(x + hw, y - hh, x + hw, y + hh * 0.3, C.S); ln(x + hw, y + hh * 0.3, x, y + hh, C.D);
    ln(x - hw + 1, y - hh * 0.2, x, y + hh * 0.15, C.G); ln(x, y + hh * 0.15, x + hw - 1, y - hh * 0.2, C.G);   /* the gold chevron */
    disc(x, y - hh * 0.45, 1.7 * k, C.G); dot(x, y - hh * 0.45, C.f); disc(x + hw * 0.6, y - hh * 0.2, 1.4, C.K);
    for (const [rx, ry] of [[-0.8, -0.85], [0.8, -0.85], [-0.8, 0.1], [0.8, 0.1]]) dot(x + rx * hw, y + ry * hh, C.s); };   /* the rim rivets */
  if (o.shield !== false) { limb(shX, shY + 2, sx - hw * 0.4, sy - 1, 4, 3.4, C.S);
    if (o.shSplit === 0) shield(0, 0);
    else if (o.shSplit === 1) { shield(0, 0); ln(sx + 1, sy - hh, sx - 1, sy - hh * 0.3, C.k, 2); ln(sx - 1, sy - hh * 0.3, sx + 2, sy + hh * 0.2, C.k, 2); ln(sx + 2, sy + hh * 0.2, sx - 1, sy + hh, C.k, 2);   /* the crack down the face */
      shield(7, -4); }                                                                                                     /* ...and the half that came away */
    else { ln(sx, sy - hh, sx + 3, sy + hh * 0.6, C.D, 2); poly([[sx + 3, sy - hh], [sx + 8, sy - hh + 3], [sx + 6, sy - hh + 9]], C.p); } }   /* a strap and a stump of it */
  // ---- the DEATH LEG: a fallen body is drawn by rotating the whole figure about his feet
  if (o.tipFx) for (let i = 0; i < 6; i++) { const ax = hx + dx * o.len + (i - 2) * 1.8, ay = hy + dy * o.len - (i % 3) * 3 - 1; box(ax, ay, 1.8, 1, i % 2 ? C.w : C.W); }   /* the planks the point stuck in */
  if (o.rot) { const [c2, g2] = canvas(c.width, c.height); g2.translate(FX * S, FY * S); g2.rotate(rad(o.rot)); g2.drawImage(c, -FX * S, -FY * S); return c2; }
  return c;
}

// ---------------------------------------------------------------------------------------------------------------- THE POSES
/* THE POSES. Index = frame. Numbers: lean (torso forward), crouch (hips down), foot x offsets (back, front), lift, knee bend, hand (from the shoulder), ang
   (the lance: 0 forward, -90 straight up, 90 down), len, sh (the shield from the shoulder), shS (its size), ghost (the smear: [dx, dy, ang, alpha] lances a frame
   ago), plant (the lance stood in the boards beside him: the volley), spear/sang (a throwing spear in the hand), drop (a lance let go), dust (puffs at his feet),
   two (the off hand on the shaft too: shieldless). */
const lerp = (p, q, t) => { const o = { ...p, ...q }; for (const k of Object.keys(o)) { const a = p[k], b = q[k];
  if (Array.isArray(a) && Array.isArray(b)) o[k] = a.map((v, i) => v + (b[i] - v) * t); else if (typeof a === 'number' && typeof b === 'number') o[k] = a + (b - a) * t; else o[k] = t < 0.5 && a !== undefined ? a : b; } return o; };
const GUARD = { hand: [9, -4], ang: -26 };
/* the WALK: four frames from a phase (contact, pass, contact, pass), the lead leg swinging forward lifted; a heavy man's bob */
const walk = n => { const φ = 2 * Math.PI * n / 4; return { foot: [Math.round(-1 - 6 * Math.cos(φ)), Math.round(1 + 6 * Math.cos(φ))], lift: [Math.max(0, Math.sin(φ)) * 3, Math.max(0, -Math.sin(φ)) * 3], knee: [1, 3], hand: [9, -4 + (n % 2 ? 0.5 : 0)], ang: -26 + (n % 2), lean: 1, crouch: n % 2 ? 1 : 0, flut: 0.6 + n * 0.6 }; };
const BASE = {
  /* ---- LOCOMOTION: idle breath (3 + the repeat), walk 4, a turn, a gap hop */
  guard: GUARD,
  breathA: { ...GUARD, crouch: 1, hand: [9, -3], flut: 0.8 },
  breathB: { hand: [9, -5], ang: -27, flut: 1.6, head: [0, -1], sh: [6, 4] },
  walk0: walk(0), walk1: walk(1), walk2: walk(2), walk3: walk(3),
  turn: { foot: [-3, 3], lean: 0, hand: [4, -4], ang: -48, len: 34, sh: [1, 5], shS: 0.75, head: [-1, 0], flut: 2, banner: 0.8 },
  hopUp: { air: 9, foot: [-4, 5], lift: [6, 8], knee: [3, 4], lean: 2, hand: [9, -6], ang: -34, sh: [5, 3], flut: 3 },
  /* ---- THE THRUST (LIGHT): drawn back, the rear foot braced; the point a horizontal line at the chest, smeared; over his front foot */
  thrustTell0: lerp(GUARD, { foot: [-7, 5], crouch: 1, lean: -1.5, hand: [3, -1.5], ang: -15, len: 38, sh: [6.5, 5] }, 0.9),
  thrustTell: { foot: [-7, 5], crouch: 2, lean: -3, hand: [-3, 1], ang: -6, len: 38, sh: [7, 5] },
  thrust: { foot: [-8, 9], knee: [0, 5], crouch: 3, lean: 5, hand: [15, 1], ang: 0, len: 44, sh: [4, 5], flut: 0.4, ghost: [[-10, 0, 0, 0.35], [-5, 0, 0, 0.6]] },
  thrustFT: { foot: [-8, 10], knee: [0, 6], crouch: 4, lean: 7, hand: [17, 2], ang: 2, len: 44, sh: [3, 6], flut: 0.8, head: [1, 1] },
  thrustRec: { foot: [-8, 10], knee: [0, 6], crouch: 4, lean: 6, hand: [14, 3], ang: 4, len: 38, sh: [4, 6], flut: 0.9, head: [1, 1] },
  thrustRecB: { foot: [-8, 10], knee: [0, 6], crouch: 3, lean: 5, hand: [13, 4], ang: 8, len: 38, sh: [4, 6], flut: 1.5, head: [0, 2] },
  /* ---- THE LOW SWEEP (MEDIUM): swung high behind, coiled; the arc (a big smear); flat at the ankles */
  sweepTell0: lerp(GUARD, { foot: [-6, 6], lean: -2, hand: [0, -12], ang: -150, len: 36, sh: [6, 5] }, 0.55),
  sweepTell: { foot: [-6, 6], lean: -3, crouch: 1, hand: [-1, -12], ang: -155, len: 36, sh: [6, 5], flut: 0.6 },
  sweepArc: { foot: [-8, 7], knee: [0, 4], crouch: 3, lean: 2, hand: [9, -2], ang: -60, len: 40, sh: [4, 4], flut: 1.5, banner: 1.2, ghost: [[-6, -8, -125, 0.35], [-3, -5, -95, 0.55]] },
  sweep: { foot: [-9, 8], knee: [0, 5], crouch: 5, lean: 4, hand: [11, 11], ang: 9, len: 40, sh: [3, 3], ghost: [[-2, -9, -35, 0.35], [0, -3, -12, 0.6]], dust: 1 },
  sweepRec: { foot: [-9, 9], knee: [0, 5], crouch: 4, lean: 3, hand: [10, 10], ang: 24, len: 38, sh: [4, 4], flut: 2 },
  sweepRecB: { foot: [-9, 9], knee: [0, 5], crouch: 3, lean: 2, hand: [10, 9], ang: 20, len: 38, sh: [4, 4], flut: 2.8, head: [0, 2] },
  /* ---- THE LANCE CHARGE (HEAVY): shield up, the lance couched under the arm, a foot scraping twice; a low wedge pointing forward; the skid; OVERRUN, the point in the boards */
  couch0: { foot: [-6, 6], crouch: 2, lean: 2, hand: [10, -1], ang: -12, len: 44, sh: [7, 3], shS: 1.05, flut: 0.1 },
  couchA: { foot: [-7, 6], crouch: 3, lean: 3, hand: [11, 1], ang: -2, len: 44, sh: [7, 2], shS: 1.1, flut: 0.2 },
  couchB: { foot: [-9, 6], lift: [2, 0], crouch: 3, lean: 4, hand: [11, 1], ang: -2, len: 44, sh: [7, 2], shS: 1.1, flut: 0.9, dust: 1 },
  chargeA: { foot: [-10, 8], lift: [3, 0], knee: [2, 5], crouch: 4, lean: 7, hand: [12, 3], ang: 2, len: 46, sh: [8, 3], flut: 2.2, banner: 1.25, plume: 1.5, dust: 1 },
  chargeB: { foot: [-4, 10], lift: [0, 3], knee: [4, 2], crouch: 5, lean: 8, hand: [12, 3], ang: 1, len: 46, sh: [8, 3], flut: 3.0, banner: 1.25, plume: 1.5 },
  chargeC: { foot: [-8, 4], lift: [2, 2], knee: [3, 4], crouch: 3, air: 2, lean: 7, hand: [12, 2], ang: 2, len: 46, sh: [8, 3], flut: 3.8, banner: 1.25, plume: 1.5, dust: 1 },
  chargeD: { foot: [-6, 8], lift: [1, 0], knee: [3, 3], crouch: 4, lean: 8, hand: [12, 3], ang: 1, len: 46, sh: [8, 3], flut: 4.6, banner: 1.25, plume: 1.5 },
  skid: { foot: [-10, 11], knee: [-2, 6], crouch: 5, lean: -2, hand: [12, 4], ang: 8, len: 44, sh: [7, 4], flut: 1.4, plume: 1.3, dust: 3 },
  skidB: { foot: [-10, 12], knee: [-2, 6], crouch: 6, lean: -4, hand: [12, 5], ang: 12, len: 44, sh: [6, 5], flut: 2.2, plume: 1.3, dust: 2 },
  overrun: { foot: [-7, 11], knee: [-1, 7], crouch: 6, lean: 7, hand: [13, 9], ang: 42, len: 40, sh: [4, 6], head: [1, 2], flut: 0.5, tipFx: true },
  overrunB: { foot: [-7, 11], knee: [-1, 7], crouch: 7, lean: 5, hand: [11, 9], ang: 44, len: 40, sh: [4, 7], head: [1, 2], flut: 1.0, tipFx: true },
  /* ---- THE LANCE VAULT (HEAVY, P2): the point into the boards, a deep crouch; the pole arc; the stab; planted, tugging at it */
  vaultTell: { foot: [-6, 6], crouch: 6, lean: 3, hand: [9, 5], ang: 66, len: 34, sh: [3, 4], banner: 0.7 },
  vaultUp: { air: 12, foot: [-3, 4], lift: [7, 9], knee: [4, 5], lean: 2, hand: [6, 2], ang: 80, len: 44, sh: [-4, 6], banner: 0.6 },
  perch: { foot: [-6, 7], crouch: 6, lean: 3, hand: [9, 5], ang: 62, len: 28, sh: [3, 5], flut: 1 },
  stab: { air: 8, foot: [-8, -3], lift: [6, 10], knee: [-3, 0], lean: 5, hand: [8, 6], ang: 78, len: 40, sh: [-3, 2], banner: 0.6 },
  planted: { foot: [-5, 8], crouch: 6, lean: 6, hand: [11, 7], ang: 58, len: 28, sh: [5, 7], head: [1, 1], flut: 0.3 },
  plantedB: { foot: [-7, 8], crouch: 5, lean: 2, hand: [9, 6], ang: 62, len: 28, sh: [6, 6], head: [0, 1], flut: 0.9 },
  /* ---- THE SHIELD WALL (MEDIUM, P2; shielded only): slammed down on the boards, dust; crouched behind it, edging; TURNED, flung wide and his back bare */
  wallTell: { foot: [-6, 6], crouch: 3, lean: 2, hand: [8, -2], ang: -20, len: 34, sh: [9, 9], shS: 1.3 },
  shieldwall: { foot: [-8, 7], crouch: 5, lean: 4, hand: [8, 0], ang: -4, len: 34, sh: [10, 8], shS: 1.4, dust: 2 },
  shieldwallB: { foot: [-6, 8], lift: [1, 0], crouch: 5, lean: 4, hand: [8, 0], ang: -4, len: 34, sh: [10, 8], shS: 1.4, flut: 1, dust: 1 },
  turned: { foot: [-7, 5], lean: -5, crouch: 1, hand: [5, -9], ang: -68, len: 34, sh: [-7, 4], shS: 0.9, head: [-1, 0], flut: 2.5 },
  /* ---- THE SPEAR VOLLEY (MEDIUM): the lance planted in the boards beside him; a spear drawn from the quiver; cocked; the arm straight up; the throw and its follow-through */
  volleyTell0: { foot: [-6, 6], lean: -1, hand: [-5, -10], ang: -90, len: 0, banner: 0, sh: [6, 6], plant: 13, pole: false, spear: true, sang: -120 },
  volleyTell: { foot: [-6, 6], lean: -3, hand: [3, -17], ang: -75, len: 0, banner: 0, sh: [6, 6], plant: 13, pole: false, spear: true, sang: -78 },
  volley: { foot: [-6, 8], lean: 4, hand: [11, -14], ang: -30, len: 0, banner: 0, sh: [6, 5], plant: 13, pole: false, spear: true, sang: -22 },
  volleyFT: { foot: [-6, 8], lean: 6, hand: [14, -8], ang: -10, len: 0, banner: 0, sh: [6, 5], plant: 13, pole: false, flut: 1.4 },
  /* ---- THE PENNANT: the lance straight up and the cloth huge (a two-frame wave) */
  pennantTell: { hand: [6, -10], ang: -90, len: 42, banner: 1.7, flut: 1.4, lean: -1, plume: 1.4 },
  pennantB: { hand: [6, -11], ang: -88, len: 42, banner: 1.8, flut: 3.0, lean: -1, plume: 1.4 },
  /* ---- REACTIONS: the flinch (2), the stagger (2), PINNED under the bars (a struggle, 2), HELM RUNG (dazed, swaying, 2), WHIPPED (1), the SHIELD SPLIT (2, shielded), the WAKE (3, shielded) */
  hurt: { foot: [-7, 6], crouch: 1, lean: -6, hand: [4, 5], ang: -32, len: 30, sh: [8, 6], head: [-2, -1], flut: 3 },
  hurtB: { foot: [-6, 6], crouch: 2, lean: -3, hand: [5, 3], ang: -30, len: 30, sh: [7, 6], head: [-1, 0], flut: 2 },
  stagger: { foot: [-9, 3], lift: [0, 2], knee: [1, 0], crouch: 1, lean: -8, hand: [3, 3], ang: -20, len: 34, sh: [3, 8], shS: 0.9, head: [-3, -1], flut: 3.2 },
  staggerB: { foot: [-8, 5], crouch: 3, lean: -4, hand: [5, 4], ang: -10, len: 34, sh: [5, 8], head: [-2, 1], flut: 1.4 },
  pinned: { foot: [-6, 7], crouch: 8, lean: 2, hand: [4, -6], ang: -120, len: 30, sh: [4, -2], shS: 0.95, head: [1, 2], flut: 0.4 },
  pinnedB: { foot: [-7, 6], crouch: 7, lean: -1, hand: [3, -8], ang: -110, len: 30, sh: [3, -3], shS: 0.95, head: [0, 2], flut: 1.4 },
  rung: { foot: [-6, 6], crouch: 2, lean: -4, hand: [5, 6], ang: 30, len: 34, sh: [6, 7], head: [-2, 1], flut: 0.6 },
  rungB: { foot: [-5, 7], crouch: 3, lean: 2, hand: [6, 7], ang: 40, len: 34, sh: [7, 8], head: [2, 2], flut: 1.6 },
  whipped: { foot: [-9, 4], lift: [0, 3], crouch: 2, lean: -7, hand: [3, -6], ang: -100, len: 32, sh: [9, 0], head: [-2, -1], flut: 3 },
  split: { foot: [-7, 6], crouch: 2, lean: -3, hand: [6, -4], ang: -40, len: 34, sh: [-5, 3], shS: 0.9, head: [-1, 0], flut: 2.2, shSplit: 1 },
  splitB: { foot: [-7, 6], crouch: 3, lean: -1, hand: [6, -3], ang: -36, len: 34, sh: [-3, 4], shS: 0.8, head: [0, 1], flut: 1.4, shSplit: 2 },
  wake0: { foot: [-9, 6], knee: [5, 4], crouch: 9, lean: 6, hand: [6, 6], ang: 84, len: 48, sh: [3, 7], head: [1, 4], banner: 0.8 },   /* kneeling on his planted pennant, helm bowed */
  wake1: { foot: [-7, 7], crouch: 6, lean: 4, hand: [7, 3], ang: 78, len: 48, sh: [4, 6], head: [0, 2], banner: 1.0, flut: 0.8 },     /* the wrench: up */
  wake2: { foot: [-6, 6], crouch: 2, lean: 0, hand: [8, -3], ang: -64, len: 46, sh: [6, 5], banner: 1.5, flut: 2.4, plume: 1.3 },     /* the pennant free, the cloth flung out */
  /* ---- DEATH (shieldless set only): kneeling under the main gate, the lance falls, the slump, the collapse */
  deathKneel: { foot: [-9, 4], knee: [5, 3], crouch: 8, lean: 3, hand: [8, 4], ang: 70, len: 40, sh: [3, 6], head: [1, 3], flut: 0.5 },
  deathDrop: { foot: [-9, 4], knee: [5, 3], crouch: 9, lean: 6, hand: [6, 8], ang: 20, len: 0, pole: false, head: [2, 5], flut: 0.3, drop: { x: 20, y: -6, ang: 35 } },
  deathSlump: { foot: [-10, 3], knee: [6, 3], crouch: 12, lean: 10, hand: [4, 9], ang: 20, len: 0, pole: false, head: [3, 7], flut: 0.2, cape: 0.5, plume: 0.6, drop: { x: 26, y: -1, ang: 8 } },
  deathDown: { foot: [-5, 5], crouch: 0, lean: 0, hand: [5, 3], ang: 10, len: 0, pole: false, head: [1, 1], flut: 0, cape: 0.6, plume: 0.7, rot: 84, drop: { x: 36, y: -2, ang: -3 } },
};
/* THE SHIELDLESS SET (P3): the same joints with the shield gone and the off hand on the shaft - and his own TWO-HANDED thrust and sweep */
const BARE = { two: true, shield: false };
const BARE_OWN = {
  thrustTell0: { foot: [-7, 5], crouch: 2, lean: -2, hand: [2, 0], ang: -4, len: 40 },
  thrustTell: { foot: [-8, 5], crouch: 3, lean: -4, hand: [-2, 1], ang: -3, len: 40 },
  thrust: { foot: [-9, 10], knee: [0, 5], crouch: 3, lean: 6, hand: [16, 1], ang: 0, len: 46, flut: 0.4 },
  thrustFT: { foot: [-9, 11], knee: [0, 6], crouch: 5, lean: 8, hand: [18, 2], ang: 2, len: 46, flut: 0.9 },
  thrustRec: { foot: [-9, 10], knee: [0, 6], crouch: 4, lean: 6, hand: [15, 3], ang: 5, len: 40, flut: 0.9 },
  sweepTell: { foot: [-7, 6], lean: -4, crouch: 2, hand: [-2, -13], ang: -160, len: 38, flut: 0.6 },
  sweepArc: { foot: [-8, 8], knee: [0, 4], crouch: 3, lean: 3, hand: [10, -2], ang: -55, len: 42, flut: 1.5 },
  sweep: { foot: [-10, 9], knee: [0, 5], crouch: 6, lean: 5, hand: [12, 11], ang: 8, len: 42 },
};
const SHIELD_ONLY = new Set(['wallTell', 'shieldwall', 'shieldwallB', 'turned', 'split', 'splitB', 'wake0', 'wake1', 'wake2']);
const BARE_ONLY = new Set(['deathKneel', 'deathDrop', 'deathSlump', 'deathDown']);
const NAMES_S = Object.keys(BASE).filter(k => !BARE_ONLY.has(k) && k !== 'hurt' && k !== 'hurtB'), NAMES_B = Object.keys(BASE).filter(k => !SHIELD_ONLY.has(k) && k !== 'hurt' && k !== 'hurtB');
const ORDER_S = [...NAMES_S, 'hurt', 'hurtB'];                      /* the shielded set, its flinch pair last of its half */
const ORDER_B = [...NAMES_B, 'hurt', 'hurtB'];                      /* the shieldless set, its flinch pair last too (death sits in NAMES_B before them) */
const POSES = [...ORDER_S.map(k => BASE[k]), ...ORDER_B.map(k => ({ ...BASE[k], ...(BARE_OWN[k] || {}), ...BARE }))];
export const BARE_AT = ORDER_S.length;                    /* the first shieldless frame: F[name] + BARE_AT - (the shielded-only names skipped) is FB[name] */
export const F = Object.fromEntries(ORDER_S.map((k, i) => [k, i]));
export const FB = Object.fromEntries(ORDER_B.map((k, i) => [k, BARE_AT + i]));
F.hurt2 = FB.hurt;                                         /* (main.js flinch) the shieldless flinch */
F.hurtB2 = FB.hurtB;
export const FRAMES = POSES.length;                        /* the cap is 120 (brief s2); tools/lance-sheet.mjs and tools/lance4.mjs read it */
export const SCALE = 1;                                    /* DRAWN AT 1:1: no runtime scale (the 1.35 is in the paint) */
export const bakeChampion = () => { const fr = POSES.map(p => outline(champion(p), OUT)); const white = fr.map(c => whiten(c));
  return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: Math.round(FX * KS), ay: Math.round(FY * KS) + 1, w: 28, h: 40 }; };

/* THE BESTIARY CARD: he stands on the Long Bridge under a gate tower's arch, the great bell hanging in it (portrait, 1.0 scale, two breaths) */
export const bakeCard = () => {
  const W = 58, H = 54, set = [], fig = [champion({ ...BASE.guard, flut: 0.6 }, 1.0), champion({ ...BASE.breathA, crouch: 1, flut: 1.4 }, 1.0)].map(f => outline(f, OUT));
  for (let n = 0; n < 2; n++) { const [c, g] = canvas(W, H);
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2b2740'); bg.addColorStop(1, '#14121e'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    for (let y = 2; y < H; y += 6) for (let x = ((y / 6) | 0) % 2 ? 3 : 0; x < W; x += 10) { rect(g, x, y, 9, 5, (x + y) % 3 ? '#262338' : '#2d2a42'); rect(g, x, y, 9, 1, '#34304c'); }   /* the tower's courses */
    fillPoly(g, [[6, H], [6, 18], [10, 9], [20, 4], [38, 4], [48, 9], [52, 18], [52, H]], '#0f0d18'); rect(g, 14, 12, 30, 2, '#1c1a2a');                                                      /* the arch */
    for (let x = 12; x <= 46; x += 5) rect(g, x, 4, 1, 22, '#4a4a58');                                                                                                                              /* the portcullis up in it */
    rect(g, 10, 24, 38, 2, '#2a2a34'); const sw = n ? 1 : 0;                                                                                                                                       /* the bell, brass, hung from the beam */
    fillPoly(g, [[24 + sw, 8], [34 + sw, 8], [36 + sw, 17], [22 + sw, 17]], '#a87c20'); fillPoly(g, [[24 + sw, 8], [28 + sw, 8], [27 + sw, 17], [22 + sw, 17]], '#f0c048'); rect(g, 21 + sw, 17, 16, 2, '#7a5a18'); rect(g, 28 + sw, 19, 2, 2, '#3a2a1a'); rect(g, 28, 4, 2, 4, '#5a5a68');
    rect(g, 0, H - 6, W, 6, '#3a3446'); rect(g, 0, H - 6, W, 1, '#6a6478'); rect(g, 0, H - 2, W, 2, '#26222f');                                                                                        /* the deck */
    g.drawImage(fig[n], 29 - FX, H - 5 - FY); set.push(c); }
  return { R: set, L: set.map(flipX), white: { R: set.map(c => whiten(c)), L: set.map(c => flipX(whiten(c))) }, ax: 29, ay: 27, w: 40, h: 54 };
};

/* HIS DEATH, played as the body he leaves (main.js bossBodies seqF): k 0..1 -> kneel, the lance falls, the slump, the collapse (the shieldless set) */
export const deathFrame = k => FB[k < 0.3 ? 'deathKneel' : k < 0.5 ? 'deathDrop' : k < 0.72 ? 'deathSlump' : 'deathDown'];

/* HIS POSE FOR HIS MODE (updateLance keeps e.modeAge, the seconds he has been in it): every move its anticipation, release and follow-through;
   every opening a held two-frame loop; shieldless (e.bare) the same pose from his P3 half */
export function frameOf(e) {
  const mv = Math.abs(e.vx) > 6, m = e.mode, a = e.modeAge || 0, loop = (p, q, hz) => (Math.floor(e.anim * hz) % 2 ? q : p);
  /* a turn: when he swings round, one frame of him narrow on his heels (locomotion only) */
  if (e._tf !== e.face) { if (e._tf !== undefined) e._turnUntil = e.anim + 0.12; e._tf = e.face; }
  const name = (() => { switch (m) {
    case 'wake': return a < 0.55 ? 'wake0' : a < 1.1 ? 'wake1' : 'wake2';
    case 'couch': return a < 0.2 ? 'couch0' : loop('couchA', 'couchB', 4);
    case 'charge': return ['chargeA', 'chargeB', 'chargeC', 'chargeD'][Math.floor(e.anim * 14) % 4];
    case 'skid': return loop('skid', 'skidB', 7);
    case 'overrun': return a < 0.3 ? 'skidB' : loop('overrun', 'overrunB', 3);
    case 'thrustTell': return a < 0.14 ? 'thrustTell0' : 'thrustTell';
    case 'thrust': return a < 0.1 ? 'thrust' : 'thrustFT';
    case 'thrustRec': case 'recover': return loop('thrustRec', 'thrustRecB', 2.5);
    case 'sweepTell': return a < 0.2 ? 'sweepTell0' : 'sweepTell';
    case 'sweep': return a < 0.1 ? 'sweepArc' : 'sweep';
    case 'sweepRec': return loop('sweepRec', 'sweepRecB', 2.5);
    case 'volleyTell': return a < 0.3 ? 'volleyTell0' : 'volleyTell';
    case 'volley': return a < 0.14 ? 'volley' : 'volleyFT';
    case 'pennantTell': case 'pennant': case 'haul': return loop('pennantTell', 'pennantB', 5);
    case 'vaultTell': return 'vaultTell';
    case 'vaultUp': return 'vaultUp';
    case 'perch': return 'perch';
    case 'stab': return 'stab';
    case 'planted': return loop('planted', 'plantedB', 2.5);
    case 'wallTell': return 'wallTell';
    case 'shieldwall': return loop('shieldwall', 'shieldwallB', 2);
    case 'wallTurned': return 'turned';
    case 'stumble': case 'reel': return a < 0.35 ? 'stagger' : 'staggerB';
    case 'pinned': return loop('pinned', 'pinnedB', 3);
    case 'rung': return loop('rung', 'rungB', 2);
    case 'whipped': return 'whipped';
    case 'split': return a < 0.35 ? 'split' : 'splitB';
  }
  if (m === 'fallback' || mv) return e.grounded === false ? 'hopUp' : 'walk' + (Math.floor(e.anim * 8) % 4);
  if (e.grounded === false) return 'hopUp';
  if (e._turnUntil > e.anim) return 'turn';
  return ['guard', 'breathA', 'breathB', 'breathA'][Math.floor(e.anim * 2.4) % 4]; })();
  return e.bare && FB[name] !== undefined ? FB[name] : F[name];
}
