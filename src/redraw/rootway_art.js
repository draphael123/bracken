// src/redraw/rootway_art.js - THE ROOTWAY's CAST (claude/rootway art pass; the greybox's placeholders, redrawn).
//   bakeTrophyHunter() -> THE GOBLIN TROPHY-HUNTER (the level's one new foe): a lean goblin in a fur mantle and hide cape, a horned bone cap, a rope over one shoulder, teeth and skulls on his
//                          belt, a bone-headed spear tufted red. Frames follow src/rootway-hands.js hunterStep: 0 hanging on the hoist | 1 (spare, swaying) | 2 falling | 3 the TELL (spear drawn
//                          back, the yellow of his eye red) | 4-5 walk | 6 the jab / lunge (spear out) | 7 dazed
//   bakeRootSkins(SPR) -> the reskins the level wears (cnSkin: a corpse dies in its own skin, tools/corpses.mjs): GOBSCOUT (the archer, a leaf-green hood and a pale root bow, a red feather),
//                          ROOTWEAVER / ROOTSPIDER (bark-brown, honey-lit), ROOTLURKER (an amber root-cap)
//   paintHuntmaster(g, o) -> THE GOBLIN HUNTMASTER, drawn live from his machine (src/huntmaster.js drawBoss): a trophy MASK of bone with horns, a fur mantle, the QUIVER on its strap (the strap
//                          BREAKS and the quiver hangs), the great bow and the BRACER (it splits), a skinning knife - and a real pose for every move: WALK (the bow across him, a guard), the
//                          DRAW (aimed, volley, split, hoist-drop - the string to his cheek, the arrow nocked, gold or red), the LOOSE, the KNIFE (raised, then the cut), the LEAP (a coil, the tuck,
//                          the landing), the PERCH (crouched on his plank), OPEN (staggered, head down), CAUGHT (crouched under the bound bars of the cage that fell on him), the WARD
//   bakeHuntmasterCard() -> his bestiary card, the walking guard pose from the same painter
//   bakeTagIcon() -> a TROPHY TAG (the level's quest pickup): a bone tag on a knotted cord
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const K = { skin: '#5a7a32', skinL: '#8aaa4a', skinD: '#3a5222', hide: '#8a6a48', hideD: '#5a4230', hideL: '#aa8a60', fur: '#4a3426', furL: '#7a5a3a', bone: '#e8dcc0', boneD: '#b8a888', spear: '#7a5a3a', eye: '#ffe27a', red: '#ff3a2a', boot: '#3a2a22', cord: '#cdb88a', tuft: '#c9463d' };
export function bakeTrophyHunter() {
  const W = 26, H = 24, gy = 23;
  const F = Array.from({ length: 8 }, (_, f) => { const [c, g] = canvas(W, H); const cx = 12;
    const hang = f === 0 || f === 1, fall = f === 2, daze = f === 7, by = hang ? 12 + (f === 1 ? 1 : 0) : gy - 7, lean = f === 6 ? 2 : f === 3 ? -1 : 0;
    /* the hide cape over a lean body: stitched seam, a darker hem */
    fillPoly(g, [[cx - 4 + lean, by - 4], [cx + 4 + lean, by - 4], [cx + 5 + lean, by + 5], [cx - 5 + lean, by + 5]], K.hide); rect(g, cx - 4 + lean, by - 4, 8, 1, K.hideL); rect(g, cx - 5 + lean, by + 4, 10, 1, K.hideD); line(g, cx + lean, by - 3, cx - 1 + lean, by + 4, K.hideD); px(g, cx - 1 + lean, by, K.cord); px(g, cx + lean, by - 2, K.cord);
    /* the fur mantle on the shoulders: a dark ruff with pale tips, a bone bead or two */
    rect(g, cx - 5 + lean, by - 5, 10, 3, K.fur); for (let k = 0; k < 5; k++) px(g, cx - 4 + lean + k * 2, by - 5, K.furL); px(g, cx - 2 + lean, by - 3, K.bone); px(g, cx + 1 + lean, by - 3, K.bone);
    /* the rope over one shoulder and the trophies on the belt: teeth, a small skull */
    line(g, cx - 4 + lean, by - 3, cx + 3 + lean, by + 3, K.cord); px(g, cx + 3 + lean, by + 4, K.cord);
    rect(g, cx - 5 + lean, by + 2, 10, 1, K.boot); px(g, cx - 3 + lean, by + 3, K.bone); px(g, cx - 3 + lean, by + 4, K.bone); px(g, cx + lean, by + 3, K.bone); rect(g, cx + 2 + lean, by + 3, 2, 2, K.bone); px(g, cx + 2 + lean, by + 3, '#2a1a12');
    /* the head: a bone cap with a horn, long ringed ears, the eye (red on his tell) */
    const hx = cx + 2 + lean, hy = by - 8; circle(g, hx, hy, 3, K.skin); px(g, hx - 1, hy - 1, K.skinL); px(g, hx + 1, hy - 1, f === 3 ? K.red : daze ? K.bone : K.eye); px(g, hx + 1, hy, K.skinD); rect(g, hx - 1, hy + 2, 3, 1, K.skinD);
    rect(g, hx - 3, hy - 4, 7, 2, K.bone); px(g, hx - 3, hy - 4, K.boneD); px(g, hx + 3, hy - 3, K.boneD); line(g, hx + 1, hy - 4, hx + 3, hy - 7, K.bone); px(g, hx + 3, hy - 7, '#fff6e0'); px(g, hx - 2, hy - 3, '#2a1a12');   /* the cap and its horn */
    fillPoly(g, [[hx - 3, hy - 1], [hx - 8, hy - 3], [hx - 3, hy + 1]], K.skinD); fillPoly(g, [[hx + 3, hy - 1], [hx + 7, hy - 3], [hx + 3, hy + 1]], K.skinD); px(g, hx - 7, hy - 3, K.bone);   /* a ring in the ear */
    /* arms and the spear: up the rope while he hangs, drawn back on the tell, out on the jab; a bone head, barbs, a red tuft */
    const head = (x, y, dx) => { px(g, x, y, K.bone); px(g, x + dx, y, K.bone); px(g, x + dx * 2, y, '#fff6e0'); px(g, x - 1 * dx, y - 1, K.boneD); px(g, x - 1 * dx, y + 1, K.boneD); px(g, x - 3 * dx, y, K.tuft); px(g, x - 3 * dx, y + 1, K.tuft); };
    if (hang) { line(g, cx - 1, by - 3, cx, 0, K.skin); line(g, cx + 2, by - 3, cx + 1, 0, K.skin); px(g, cx, 1, K.cord); px(g, cx + 1, 1, K.cord); line(g, cx - 6, by + 2, cx + 8, by - 6, K.spear); px(g, cx + 8, by - 6, K.bone); px(g, cx + 9, by - 7, '#fff6e0'); px(g, cx + 6, by - 5, K.tuft); }
    else if (f === 3) { line(g, cx + 2, by - 1, cx - 3, by, K.skin); line(g, cx - 9, by + 1, cx + 5, by - 1, K.spear); head(cx + 6, by - 1, 1); }
    else if (f === 6) { line(g, cx + 3, by - 1, cx + 8, by - 1, K.skin); line(g, cx - 2, by - 1, cx + 13, by - 1, K.spear); head(cx + 12, by - 1, 1); }
    else if (fall || daze) { line(g, cx - 4, by - 3, cx - 7, by - 7, K.skin); line(g, cx + 4, by - 3, cx + 7, by - 7, K.skin); line(g, cx - 8, by + 4, cx + 6, by - 8, K.spear); px(g, cx + 6, by - 8, K.bone); px(g, cx - 8, by + 4, K.tuft); }
    else { line(g, cx + 3, by - 1, cx + 5, by + 2, K.skin); line(g, cx + 5, by - 9, cx + 5, by + 5, K.spear); px(g, cx + 5, by - 10, K.bone); px(g, cx + 5, by - 11, '#fff6e0'); px(g, cx + 4, by - 9, K.boneD); px(g, cx + 6, by - 9, K.boneD); px(g, cx + 5, by + 5, K.tuft); px(g, cx + 6, by + 6, K.tuft); }
    /* legs */
    if (hang || fall) { line(g, cx - 1, by + 5, cx - 2, by + 9, K.skinD); line(g, cx + 1, by + 5, cx + 2, by + 9, K.skinD); }
    else { const st = f === 5 ? 1 : 0; line(g, cx - 1, by + 5, cx - 2 - st, gy, K.skinD); line(g, cx + 1, by + 5, cx + 2 + st, gy, K.skinD); rect(g, cx - 3 - st, gy, 2, 1, K.boot); rect(g, cx + 2 + st, gy, 2, 1, K.boot); }
    if (daze) { px(g, hx - 2, hy - 7, K.eye); px(g, hx + 2, hy - 8, K.eye); px(g, hx, hy - 9, K.eye); }
    outline(c, OUT); return c; });
  return pack(F, 12, H, 10, 16);
}

/* ================= THE REROOTED CAST: reskins of proven AIs, recoloured and given one new detail each ================= */
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function remap(c, map, extra, k) {
  const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const hex = '#' + [p[i], p[i + 1], p[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''), m = map[hex]; if (m) { const r = rgbOf(m); p[i] = r[0]; p[i + 1] = r[1]; p[i + 2] = r[2]; } }
  g.putImageData(img, 0, 0); if (extra) extra(g, d, k); return d; }
const reskin = (set, map, extra) => pack(set.R.map((c, k) => remap(c, map, extra, k)), set.ax, set.ay, set.w, set.h);
/* the first opaque pixel of a column / the top row of the head (the first row with a body pixel of the given colour) */
const topRow = (c, hexes) => { const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (!d[i + 3]) continue; const hex = '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); if (hexes.includes(hex)) return [x, y]; } return null; };
const SCOUT_MAP = { '#6faa4a': '#b8c060', '#3f6e2c': '#7a8a3c', '#3f5a33': '#2c4a34', '#8a5a32': '#c8aa70', '#6b4a2a': '#6a5434', '#c9463d': '#e0b040' };
export function bakeRootSkins(SPR) {
  const out = {};
  if (SPR.archer) out.gobscout = reskin(SPR.archer, SCOUT_MAP, (g, d, k) => { const t = topRow(d, ['#2c4a34', '#b8c060']); if (t && t[1] >= 1) { px(g, t[0] + 3, t[1] - 1, '#e8685a'); if (t[1] >= 2) px(g, t[0] + 4, t[1] - 2, '#c9463d'); } });
  if (SPR.weaver) out.rootweaver = reskin(SPR.weaver, { '#c8bcd0': '#c8a46a', '#8a7e9a': '#9a7444', '#6a6278': '#5a4028' }, (g, d, k) => { px(g, 6, 3, '#e8c878'); px(g, 8, 3, '#e8c878'); px(g, 7, 4, '#7aa04a'); });
  if (SPR.spider) out.rootspider = reskin(SPR.spider, { '#3a3448': '#4a3220', '#5a5468': '#8a6234' }, (g, d, k) => { px(g, 6, 4, '#c8a050'); px(g, 7, 4, '#e8c878'); px(g, 8, 4, '#c8a050'); });
  if (SPR.lurker) out.rootlurker = reskin(SPR.lurker, { '#4a3560': '#9a6228', '#2a1c3c': '#5a3414' }, (g, d, k) => { px(g, 6, 1, '#f6c878'); px(g, 5, 2, '#f6c878'); px(g, 9, 3, '#d8964a'); });
  return out;
}

/* ================= THE HUNTMASTER ================= */
const HK = { skin: '#4a6a2a', skinL: '#6a8a3a', skinD: '#2e4a1a', leather: '#5a3a22', leatherL: '#7a5232', leatherD: '#3a2414', fur: '#3a2a22', furL: '#6a4e36', bone: '#e8dcc0', boneD: '#b8a888', bow: '#7a4a22', bowL: '#a8703a', string: '#f0e6c8', gold: '#ffd36b', goldL: '#fff6c8', red: '#ff5a4a', redD: '#a83a2a', knife: '#c9d1dc', amber: '#ff9a3c', iron: '#3a3438', cord: '#cdb88a' };
/* paintHuntmaster(g, o): g = a 2D context; o = { x, y (feet), f (1 right / -1 left), mode, t (time), weak: {1,2,3}, open, perch (>= 0 on a perch), hurt (flash), draw (0..1, how far the string is drawn) } */
export function paintHuntmaster(g, o) {
  const X = Math.round(o.x), Y = Math.round(o.y), f = o.f || 1, m = o.mode || 'walk', wk = o.weak || {}, t = o.t || 0;
  const Rf = (dx, dy, w, h, col) => { g.fillStyle = col; g.fillRect(f > 0 ? X + dx : X - dx - w, Y + dy, w, h); };
  const Pf = (dx, dy, col) => Rf(dx, dy, 1, 1, col);
  const drawn = /^(aim|volley|split|hoist)Tell$/.test(m), loose = m === 'loose', knifeUp = m === 'slashTell', cut = m === 'slash';
  const crouch = m === 'leapTell' || m === 'land' || m === 'caught' || (o.perch >= 0 && !drawn && !loose && !knifeUp && !cut);
  const air = m === 'leap', stag = m === 'open', walk = m === 'walk' || m === 'recover' || m === 'wake', step = walk ? Math.floor(t * 7) % 2 : 0;
  const down = crouch ? 5 : 0, lean = stag ? -3 : drawn ? 1 : 0, bob = walk && step ? 1 : 0, ly = air ? -3 : 0;   /* the body's drop, lean and bounce */
  const oy = -down + bob + ly;
  if (o.hurt) g.globalAlpha = 0.6;
  /* THE QUIVER on its strap, behind him (P1's weak point): whole, or hanging by one buckle with the strap cut and the arrows spilling */
  if (!wk[1]) { Rf(-10, oy - 21, 5, 14, HK.leatherD); Rf(-10, oy - 21, 5, 1, HK.leatherL); Rf(-9, oy - 23, 1, 3, HK.gold); Rf(-7, oy - 24, 1, 4, HK.red); Rf(-5, oy - 23, 1, 3, HK.gold); Rf(-10, oy - 14, 5, 1, HK.iron); }
  else { Rf(-12, oy - 12, 5, 11, HK.leatherD); Rf(-12, oy - 12, 5, 1, HK.leatherL); Rf(-11, oy - 14, 1, 2, HK.gold); Rf(-9, oy - 14, 1, 2, HK.red); Rf(-14, oy - 3, 1, 3, HK.gold); Pf(-15, oy - 1, HK.goldL); Rf(-13, oy, 3, 1, HK.cord); }
  /* legs: stand, the walking step, the crouch, the tuck */
  const lt = oy - 8;
  if (air) { Rf(-5, lt, 4, 4, HK.skinD); Rf(1, lt + 1, 4, 4, HK.skinD); Rf(-6, lt + 4, 3, 2, HK.leatherD); Rf(3, lt + 5, 3, 2, HK.leatherD); }
  else if (crouch) { Rf(-7, lt, 5, 3, HK.skinD); Rf(2, lt, 5, 3, HK.skinD); Rf(-8, lt + 3, 3, -(lt + 3) - 2, HK.skinD); Rf(6, lt + 3, 3, -(lt + 3) - 2, HK.skinD); Rf(-9, -2, 5, 2, HK.leatherD); Rf(5, -2, 6, 2, HK.leatherD); }
  else { const a = walk ? (step ? 2 : -2) : 0; Rf(-5 + a, lt, 3, -lt - 2, HK.skinD); Rf(2 - a, lt, 3, -lt - 2, HK.skinD); Rf(-6 + a, -2, 5, 2, HK.leatherD); Rf(1 - a, -2, 5, 2, HK.leatherD); }
  /* the torso: a leather jerkin, a fur mantle, a belt with the skinning knife's sheath */
  Rf(-6 + lean, oy - 22, 12, 14, HK.leather); Rf(-6 + lean, oy - 22, 12, 2, HK.leatherL); Rf(-6 + lean, oy - 9, 12, 2, HK.leatherD); Rf(-6 + lean, oy - 10, 12, 1, HK.cord);
  Rf(-3 + lean, oy - 8, 2, 5, HK.leatherD); Rf(-2 + lean, oy - 4, 1, 2, HK.knife);   /* the sheath */
  Rf(-8 + lean, oy - 24, 16, 5, HK.fur); for (let k = 0; k < 8; k++) Pf(-7 + lean + k * 2, oy - 24, HK.furL); for (const bx of [-5, -1, 3]) Pf(bx + lean, oy - 20, HK.bone);   /* the fur mantle, bone beads */
  /* the strap across the chest to the quiver (P1's weak point): whole, or cut with its ends hanging */
  if (!wk[1]) { for (let k = 0; k < 11; k++) Pf(-7 + lean + k, oy - 21 + Math.round(k * 0.9), HK.leatherD); Pf(-1 + lean, oy - 17, HK.gold); Pf(2 + lean, oy - 14, HK.gold); }
  else { for (let k = 0; k < 4; k++) Pf(-7 + lean + k, oy - 21 + k, HK.leatherD); for (let k = 0; k < 3; k++) Pf(3 + lean + k, oy - 13 + k, HK.leatherD); Pf(5 + lean, oy - 10, HK.red); }
  /* the head: a goblin face under THE TROPHY MASK (P3's weak point): a bone skull plate with horns and amber eye slits - or the mask split, half hanging, the yellow eye bare */
  const hy = oy - 33 + (stag ? 3 : 0), hx = lean + (stag ? -1 : 0);
  Rf(hx - 5, hy + 2, 10, 9, HK.skin); Rf(hx - 5, hy + 2, 10, 1, HK.skinL); Rf(hx - 9, hy + 3, 4, 2, HK.skinD); Rf(hx + 5, hy + 3, 4, 2, HK.skinD); Pf(hx - 9, hy + 3, HK.bone); Pf(hx + 8, hy + 3, HK.bone);   /* the face, the long ears with a ring */
  if (!wk[3]) { Rf(hx - 3, hy + 1, 9, 9, HK.bone); Rf(hx - 3, hy + 1, 9, 1, '#fff6e0'); Rf(hx - 3, hy + 3, 9, 1, HK.boneD); Rf(hx - 3, hy + 9, 9, 1, HK.boneD);   /* the plate, its brow ridge and jaw */
    Rf(hx - 1, hy + 4, 3, 3, '#2a1a12'); Rf(hx + 3, hy + 4, 3, 3, '#2a1a12'); Pf(hx, hy + 5, o.open ? '#8fd160' : HK.amber); Pf(hx + 4, hy + 5, o.open ? '#8fd160' : HK.amber);   /* the eye sockets, lit */
    Rf(hx + 2, hy + 7, 1, 2, '#2a1a12'); for (let k = 0; k < 4; k++) { Pf(hx - 2 + k * 2, hy + 9, '#2a1a12'); } Pf(hx - 3, hy + 4, HK.boneD); Pf(hx + 6, hy + 4, HK.boneD);
    Pf(hx - 4, hy + 2, HK.bone); Pf(hx - 5, hy + 1, HK.bone); Pf(hx - 6, hy, HK.bone); Pf(hx - 6, hy - 1, '#fff6e0'); Pf(hx + 7, hy + 2, HK.bone); Pf(hx + 8, hy + 1, HK.bone); Pf(hx + 9, hy, HK.bone); Pf(hx + 9, hy - 1, '#fff6e0'); }   /* the horns, swept out */
  else { Rf(hx - 1, hy + 1, 5, 9, HK.bone); Rf(hx - 1, hy + 1, 5, 1, '#fff6e0'); Pf(hx + 1, hy + 4, HK.amber); Pf(hx + 2, hy + 4, '#2a1a12');   /* half the mask, split down its middle */
    Pf(hx + 3, hy + 6, HK.skinD); Pf(hx + 2, hy + 5, HK.skinD); Pf(hx + 2, hy + 7, HK.skinD); Rf(hx - 5, hy + 4, 3, 3, HK.skin); Pf(hx - 4, hy + 4, '#ffe27a'); Pf(hx - 3, hy + 4, '#ffe27a'); Rf(hx - 6, hy + 11, 3, 2, HK.bone); Pf(hx - 7, hy + 13, HK.boneD);   /* the face bare, a shard fallen */
    Pf(hx + 3, hy - 1, HK.bone); Pf(hx + 4, hy - 2, '#fff6e0'); }
  if (stag) for (const sx of [-7, 0, 7]) Pf(hx + sx, hy - 6 - Math.round(Math.sin(t * 9 + sx) * 1), HK.gold);
  /* THE BOW ARM and THE BRACER (P2's weak point): a leather plate with studs - cracked, its strap loose, when broken */
  const bracer = (ax, ay) => { if (!wk[2]) { Rf(ax, ay, 4, 4, '#8a6a48'); Rf(ax, ay, 4, 1, '#c9a060'); Pf(ax + 1, ay + 2, HK.iron); Pf(ax + 3, ay + 2, HK.iron); } else { Rf(ax, ay, 4, 4, '#5a4230'); Pf(ax + 1, ay + 1, HK.iron); Rf(ax + 2, ay, 1, 3, HK.leatherD); Pf(ax + 3, ay + 3, HK.cord); Pf(ax + 4, ay + 4, HK.cord); Pf(ax + 4, ay + 5, HK.cord); } };
  const bowLimb = (cxB, cyB, half, belly, col) => { for (let q = -half; q <= half; q++) { const xo = Math.round(belly * Math.sqrt(Math.max(0, 1 - (q * q) / (half * half)))) - belly; Rf(cxB + xo, cyB + q, 2, 1, Math.abs(q) % 6 === 0 ? HK.bowL : col); } Rf(cxB - belly, cyB - half - 1, 2, 2, HK.bone); Rf(cxB - belly, cyB + half, 2, 2, HK.bone); };
  const bx = lean + 4, ay = oy - 18;
  if (drawn || loose) {
    /* THE DRAW: the arm out, the great bow held forward bent, the string to his cheek, the arrow nocked (gold: aimed, volley; red: split, hoist) */
    const up = m === 'hoistTell', red = m === 'splitTell' || m === 'hoistTell', k = loose ? 0 : Math.max(0, Math.min(1, o.draw ?? 1));
    const cyB = ay + 1 - (up ? 7 : 0), cxB = bx + 13;
    Rf(bx, cyB - 1, cxB - bx, 3, HK.skin); bracer(bx + 3, cyB - 2);
    bowLimb(cxB, cyB, 13, 5, HK.bow);
    const sx = loose ? cxB - 5 : cxB - 5 - Math.round(8 * k);
    for (let q = -13; q <= 13; q++) Rf(Math.round(cxB - 5 + (sx - (cxB - 5)) * (1 - Math.abs(q) / 13)), cyB + q, 1, 1, HK.string);
    if (!loose) { const al = 17; for (let q = 0; q < al; q++) Rf(sx + q, cyB - (up ? Math.round(q * 0.35) : 0), 1, 1, '#c9a060'); const hy2 = cyB - (up ? Math.round(al * 0.35) : 0);
      Rf(sx + al, hy2 - 1, 2, 3, red ? HK.red : HK.gold); Pf(sx + al + 2, hy2, red ? '#ffb0a0' : HK.goldL); Rf(sx, cyB - 1, 3, 1, red ? '#3a1418' : HK.gold); Rf(sx, cyB + 1, 3, 1, red ? '#3a1418' : HK.gold);
      if (red) { Pf(sx + al, hy2 - 2, HK.red); Pf(sx + al, hy2 + 2, HK.red); } }
    else { Rf(cxB - 4, cyB - 2, 4, 5, '#fff6c8'); }   /* the loose: a flash at the bow */
    Rf(sx - 2, cyB - 1, 4, 3, HK.skin);   /* the draw hand at the string */
  } else if (knifeUp || cut) {
    /* THE KNIFE: raised over the shoulder on the tell, then the cut across and down */
    Rf(bx - 2, ay - (cut ? 0 : 6), 4, 7, HK.skin); bracer(bx - 1, ay - (cut ? 0 : 6) + 2);
    if (cut) { for (let k = 0; k < 14; k++) Rf(bx + 2 + k, ay + 1 + Math.round(k * 0.45), 2, 2, k > 10 ? '#ffffff' : HK.knife); Rf(bx, ay, 3, 3, HK.leatherD); g.globalAlpha = (o.hurt ? 0.6 : 1) * 0.5; for (let k = 0; k < 14; k++) Rf(bx + 2 + k, ay - 4 + Math.round(k * 0.2), 1, 6, '#e8f4ff'); g.globalAlpha = o.hurt ? 0.6 : 1; }
    else { Rf(bx, ay - 15, 2, 12, HK.knife); Rf(bx, ay - 15, 1, 12, '#ffffff'); Rf(bx - 1, ay - 4, 4, 2, HK.leatherD); Rf(bx - 1, ay - 3, 4, 1, HK.gold); }
    bowLimb(-9, oy - 15, 10, 3, HK.bow);   /* the bow slung across his back */
  } else {
    /* THE GUARD (walking, standing, recovering, leaping, perched): the great bow held across his front, the arm bent to it */
    const gx = bx + 6; Rf(bx - 1, ay + 1, 7, 4, HK.skin); bracer(bx + 1, ay + 1);
    bowLimb(gx + 2, oy - 17, 14, 4, HK.bow); Rf(gx - 2, oy - 31, 1, 29, HK.string);
  }
  g.globalAlpha = 1;
}
const lerpV = (a, b, t) => a + (b - a) * t;
export function bakeHuntmasterCard() {
  const [c, g] = canvas(44, 46); paintHuntmaster(g, { x: 20, y: 44, f: 1, mode: 'walk', t: 0, weak: {}, open: 0 }); outline(c, OUT);
  return { R: [c], L: [flipX(c)], white: { R: [whiten(c)], L: [flipX(whiten(c))] }, ax: 20, ay: 45, w: 14, h: 26 };
}
export function bakeTagIcon() { const [c, g] = canvas(8, 10); line(g, 4, 0, 4, 3, '#8a6a48'); rect(g, 1, 3, 6, 6, '#e8dcc0'); rect(g, 2, 4, 4, 1, '#c9b27c'); px(g, 3, 6, '#5a4230'); px(g, 4, 7, '#5a4230'); outline(c, OUT); return c; }
