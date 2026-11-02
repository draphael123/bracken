// battering_beast_art.js - THE BATTERING BEAST, DRAWN (claude/palisadeart; the greybox's flat rectangles are gone). src/battering-beast-hands.js keeps the fight's state and calls this for every picture.
//   HIM      a colossal AUROCHS in iron: a barrel of dark hide under overlapping RIVETED PLATES (five lames down the back, a great pauldron on the shoulder, a chamfron on the face with one amber eye-slit),
//            iron-capped horns, greaved legs and hooves like anvils. Leather girths buckle round him and carry a TIMBER GANTRY on his back: a deck where two goblin HANDLERS stand, a cross-beam,
//            and from it the RAM on two chains - a fresh-cut log bound in three iron bands with a RAM'S-HEAD cap, swinging where the pose throws it. The P2 BUCKLE (the thing you cut) is a gold plate on the spine strap.
//   POSES    EVERY told move has its own picture, windup and release (B16), baked lazily and memoised per [pose, harness, step]: sleep / wake / walk / recover; CHARGE tell (head down, a fore hoof raking, the whips up)
//            and the run (long and low, the handlers ducking); the SWEEP's cock (the ram hauled back and up, the body twisted) and the swing (the ram low and across); the VOLLEY's stand (the handlers up on the deck
//            with stakes) and the throw; the TRAMPLE's REAR (up on the hind legs, the handlers clinging) and the stamp; DAZED (stars, the ram askew); STUCK (sunk in timber, the ram jammed, splinters); the TEAR; LOOSE (the harness
//            parted: no ram, no handlers, bolting with broken straps trailing); DEAD (down on his knees, the gantry fallen, the ram lying beside him).
//   THE CLEARING  the OLD FOREST GATE (a great timber gate in its arch, iron-strapped and barred, scorched, vine-grown) and THE PALISADE'S UNFINISHED END (raw stakes, a scaffold), the two SCAFFOLDS (deck on posts and braces, the prop
//            with its wedge and rope - the level's verb), the wreck, the spent stumps.
// px.js primitives. frame(mode, cut, step) -> canvas CW x CH with the feet at (AX, AY).   bakeCard() -> his bestiary card.   deadSet() -> a sprite set for the body he leaves.
// (claude/beast3, Daniel 11-01 "still too like Old Tusker"): A WAR-OX IN A SIEGE HARNESS, not a brown boar - SLATE-IRON hide, a riveted plate BARDING skirt down both flanks,
//   THE RAM SLUNG UNDER HIM on short chains from his girths (between his legs, its iron head out under his chest), WAR BANNERS (a tall crimson banner with the gold ram at the
//   gantry's tail, a black-and-red pennant at his shoulder). THE HORNSMAN (src/hornsman.js's look: kettle hat, red crest, the order horn) is the gantry's second handler; he raises
//   the horn for THE VOLLEY ORDER and, knocked off (solo), the gantry carries one. THE TRAMPLE's rear-and-stamp frames are gone; new: the order (horn up / blast / lost) and
//   THE WALL BREAKER (the turn, the run, the slam, the recoil). The clearing gains the archers on its walls, the palisade cracked / leaning / BREACHED, the rubble step, the timbers.
import { canvas, fillPoly, outline, flipX, whiten } from '../px.js';
import { WOOD, ROPE, IRON, RUST, mix } from './palisade_pal.js';
import { drawProp } from './palisade_world.js';

/* THE ART IS DRAWN IN A 1.35x STUDIO SPACE and scaled by K on the way to the pixels (every shape goes through D), so he fits the fight's 56 x 40 box: a body about as long as it, the head and the ram out in front */
export const K = 0.74, CW = 150, CH = 98, AX = 70, AY = 86;
const HIDE = ['#121318', '#24262e', '#3a3d48', '#575b68'], PL = ['#202028', '#3e3e4a', '#64646f', '#9494a2', '#c8c8d6'], HORN = ['#6a5a3c', '#b8a874', '#ece0b8'], LE = ['#160c06', '#33200f', '#573616'], GB = ['#8a6210', '#d8a020', '#ffd36b'], OUT = '#120804';
const FR = WOOD.fresh, MD = WOOD.mid;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = Math.round;

/* a drawing context with a transform (a rotation about a pivot, or none) */
function D(g, tf) {
  const T = tf || ((x, y) => [x, y]), id = !tf;
  const poly = (pts, col) => fillPoly(g, pts.map(([x, y]) => { const [a, b] = T(x, y); return [AX + a * K, AY + b * K]; }), col);
  const rc = (x, y, w, h, col) => { if (id) { const x0 = R(x * K), y0 = R(y * K); g.fillStyle = col; g.fillRect(AX + x0, AY + y0, Math.max(1, R((x + w) * K) - x0), Math.max(1, R((y + h) * K) - y0)); } else poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], col); };
  const dot = (x, y, col) => { const [a, b] = T(x, y); g.fillStyle = col; g.fillRect(AX + R(a * K), AY + R(b * K), 1, 1); };
  const line = (x0, y0, x1, y1, col, w = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1), ww = Math.max(1, R(w * K)); for (let i = 0; i <= n; i++) { const [a, b] = T(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); g.fillStyle = col; g.fillRect(AX + R(a * K), AY + R(b * K), ww, ww); } };
  /* a limb: a thick stroke through points with a width at each, filled with a base and a lit edge */
  const limb = (pts, ws, base, lit, dark) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], w0 = ws[i], w1 = ws[i + 1], nx = y1 - y0, ny = -(x1 - x0), nl = Math.hypot(nx, ny) || 1, ux = nx / nl, uy = ny / nl;
      poly([[x0 - ux * w0 / 2, y0 - uy * w0 / 2], [x1 - ux * w1 / 2, y1 - uy * w1 / 2], [x1 + ux * w1 / 2, y1 + uy * w1 / 2], [x0 + ux * w0 / 2, y0 + uy * w0 / 2]], base);
      line(x0 - ux * w0 / 2, y0 - uy * w0 / 2, x1 - ux * w1 / 2, y1 - uy * w1 / 2, lit); if (dark) line(x0 + ux * w0 / 2, y0 + uy * w0 / 2, x1 + ux * w1 / 2, y1 + uy * w1 / 2, dark); } };
  return { poly, rc, dot, line, limb, T };
}
const rot = (ang, px, py) => { const c = Math.cos(ang), s = Math.sin(ang); return (x, y) => [px + (x - px) * c - (y - py) * s, py + (x - px) * s + (y - py) * c]; };

/* ===== THE HANDLERS: THE SIEGE CREW (claude/palisade2art, Daniel: "it must stop feeling like the first boss with goblins on it"). NOT goblins: soot-black wreckers in an iron KETTLE HAT with a red crest, a rust tunic under a leather APRON and cross-strap, gauntlets, a neck-cloth,
   one lit eye. The second one carries the ORDER HORN. They are the same crew that fights on foot once he throws them (src/redraw/undercrown_skins.js 'siegecrew', the sprig's AI in this skin) ===== */
const HELM = ['#26262e', '#5a5e6c', '#9aa0b0', '#d4d8e4'], TUN = ['#5a1e12', '#a8442a', '#d86a40'], APR = ['#22160a', '#4a3018', '#6e4c28'], SOOT = '#1a1410', GLV = '#4a3018', CREST = '#d03a24';
function handler(d, x, y, hand, step, cut, horn) {
  if (cut) return;
  if (hand === 'reel') x -= 3;   /* (claude/beast3art) the order lost: the Hornsman rocks back off his feet */
  const duck = hand === 'duck' ? 6 : 0, up = hand === 'stand' || hand === 'throw' ? 7 : 0, yy = y + duck - up;
  d.rc(x, yy - 9, 8, 10, TUN[1]); d.rc(x, yy - 9, 1, 10, TUN[2]); d.rc(x + 7, yy - 9, 1, 10, TUN[0]);                                                   /* a rust tunic */
  d.rc(x + 3, yy - 7, 5, 8, APR[1]); d.rc(x + 3, yy - 7, 5, 1, APR[2]); d.rc(x + 3, yy - 7, 1, 8, APR[0]); d.rc(x, yy - 3, 8, 1, APR[0]); d.dot(x + 4, yy - 3, '#d8a020'); d.line(x, yy - 9, x + 6, yy - 3, APR[0]);   /* a leather apron, belt, cross-strap */
  d.rc(x + 1, yy - 11, 6, 2, '#cfc4a8');                                                                                                                  /* a neck-cloth */
  d.rc(x + 1, yy - 17, 6, 6, SOOT); d.rc(x + 5, yy - 15, 2, 1, '#ffd36b'); d.dot(x + 6, yy - 15, '#fff6d0');                                              /* a soot-black face, one lit eye */
  d.rc(x - 2, yy - 19, 12, 2, HELM[1]); d.rc(x - 2, yy - 19, 12, 1, HELM[3]); d.rc(x - 2, yy - 18, 12, 1, HELM[0]);                                       /* the kettle hat's brim */
  d.rc(x + 1, yy - 24, 6, 5, HELM[2]); d.rc(x + 1, yy - 24, 6, 1, HELM[3]); d.rc(x + 1, yy - 24, 1, 5, HELM[3]); d.rc(x + 6, yy - 24, 1, 5, HELM[1]); d.dot(x + 3, yy - 21, HELM[0]);   /* its crown, riveted */
  d.rc(x + 3, yy - 27, 2, 3, CREST); d.dot(x + 3, yy - 27, '#ff7a5a');                                                                                    /* the crew's red crest */
  const arm = (ax, ay, bx, by) => { d.line(ax, ay, bx, by, TUN[1], 2); d.rc(bx - 1, by - 1, 3, 3, GLV); };
  if (hand === 'reel') { const w = step & 1; arm(x + 5, yy - 7, x + 3, yy - 22 - w); arm(x + 1, yy - 7, x - 7, yy - 11 + w * 2);   /* a hand to the helm, the other flung back with the horn slipping from it */
    d.poly([[x - 7, yy - 12 + w * 2], [x - 10, yy - 10 + w * 2], [x - 22, yy - 3 + w * 2], [x - 24, yy - 12 + w * 2], [x - 11, yy - 15 + w * 2]], '#d8c08a'); d.poly([[x - 22, yy - 3 + w * 2], [x - 24, yy - 12 + w * 2], [x - 20, yy - 11 + w * 2]], '#ffd36b'); d.dot(x + 6, yy - 15, '#ff4a2a'); return; }
  if (horn) { arm(x + 5, yy - 7, x + 8, yy - 14);
    /* (claude/beast3art) THE ORDER HORN, BIGGER and brighter: a flared brass bell with a gold rim, a lit mouth and a red tassel - it must read at 1x */
    d.poly([[x + 7, yy - 17], [x + 11, yy - 19], [x + 28, yy - 31], [x + 28, yy - 7], [x + 11, yy - 13]], OUT); d.poly([[x + 8, yy - 17], [x + 11, yy - 18], [x + 27, yy - 29], [x + 27, yy - 9], [x + 11, yy - 14]], '#c89a3a');
    d.poly([[x + 11, yy - 18], [x + 27, yy - 29], [x + 27, yy - 24], [x + 12, yy - 15]], '#fff0b8'); d.poly([[x + 13, yy - 13], [x + 27, yy - 14], [x + 27, yy - 9], [x + 11, yy - 12]], '#8a5a14');
    d.rc(x + 26, yy - 31, 4, 24, '#8a6210'); d.rc(x + 27, yy - 31, 2, 24, '#ffd36b'); d.rc(x + 28, yy - 28, 1, 18, '#fff6d0'); d.rc(x + 21, yy - 23, 2, 6, '#8a6210');   /* the rim, the lit mouth, a bell-band */
    d.line(x + 12, yy - 12, x + 10, yy - 6, CREST); d.dot(x + 10, yy - 5, '#ff7a5a');   /* the tassel */
    if (horn === 'blast') for (let k = 0; k < 3; k++) d.rc(x + 31 + k * 4, yy - 24 + k * 2 - (step & 1), 1, 10 + k * 3, k ? '#ffd870' : '#fff6d0');   /* the note leaving the bell */
    return; }
  if (hand === 'whip') { arm(x + 5, yy - 7, x + 11, yy - 16); d.line(x + 11, yy - 16, x + 15, yy - 28, ROPE[1]); d.line(x + 15, yy - 28, x + 20, yy - 24, ROPE[0]); }
  else if (hand === 'stand') { arm(x + 5, yy - 7, x + 1, yy - 15); arm(x + 1, yy - 7, x - 3, yy - 14); d.rc(x - 1, yy - 32, 3, 18, FR[2]); d.rc(x - 1, yy - 32, 1, 18, FR[4]); d.rc(x - 1, yy - 35, 3, 4, FR[4]); d.rc(x - 5, yy - 30, 3, 14, FR[3]); d.rc(x - 5, yy - 33, 3, 4, FR[4]); }   /* two stakes held up to throw */
  else if (hand === 'throw') { arm(x + 5, yy - 7, x + 14, yy - 5); arm(x + 1, yy - 7, x + 8, yy - 3); d.rc(x + 14, yy - 7, 12, 3, FR[3]); d.rc(x + 24, yy - 7, 5, 3, FR[4]); d.rc(x + 8, yy - 2, 12, 3, FR[2]); d.rc(x + 18, yy - 2, 5, 3, FR[4]); }
  else if (hand === 'flail') { const a = step ? -9 : 1; arm(x + 5, yy - 7, x + 10, yy - 8 + a); arm(x + 1, yy - 7, x - 4, yy - 8 + (step ? 1 : -9)); }
  else if (hand === 'cling') { arm(x + 5, yy - 7, x + 9, yy - 2); arm(x + 1, yy - 7, x - 3, yy - 3); }
  else if (hand === 'sit') { arm(x + 5, yy - 7, x + 9, yy - 4); }
  else if (hand === 'pot') { arm(x + 5, yy - 7, x + 3, yy - 17); d.rc(x, yy - 24, 7, 7, OUT); d.rc(x + 1, yy - 23, 5, 5, '#8a4a22'); d.rc(x + 1, yy - 23, 5, 1, '#b8743a'); d.rc(x + 1, yy - 20, 5, 1, '#3a2010'); d.rc(x + 2, yy - 29 - (step & 1), 3, 5, '#ff6a1a'); d.rc(x + 3, yy - 30 - (step & 1), 1, 3, '#ffd36b'); }   /* PITCH: a pot held up, lit */
  else if (hand === 'lob') { arm(x + 5, yy - 7, x + 15, yy - 14); d.rc(x + 15, yy - 19, 5, 5, OUT); d.rc(x + 16, yy - 18, 3, 3, '#8a4a22'); d.rc(x + 16, yy - 22, 2, 3, '#ffb03a'); }
  else { arm(x + 5, yy - 7, x + 10, yy - 4); }
}
/* ===== THE RAM on its chains ===== */
function ram(d, cx, cy, a, cut, deck) {
  if (cut) return;
  const c = Math.cos(a), s = Math.sin(a), P = (x, y) => [cx + x * c - y * s, cy + x * s + y * c], tr = (pts, col) => d.poly(pts.map(([x, y]) => P(x, y)), col);
  /* the chains (two) from his girths' iron rings under the belly to the ram's lashings: THE RAM IS SLUNG UNDER HIM (claude/beast3) */
  for (const [gx, gy, lx] of [[-10, -15, -11], [10, -16, 9]]) { const [bx, by] = P(lx, -5); d.line(gx, gy, bx, by, IRON[2]); d.line(gx + 1, gy, bx + 1, by, IRON[1]); d.rc(gx - 1, gy - 1, 3, 3, IRON[3]);
    for (let k = 1; k < 4; k++) { const t = k / 4, lx = gx + (bx - gx) * t - 1, ly = gy + (by - gy) * t - 1; d.rc(lx, ly, 3, 3, IRON[1]); d.rc(lx, ly, 3, 1, IRON[4]); d.dot(lx + 1, ly + 1, IRON[0]); d.dot(lx, ly + 2, IRON[3]); } }   /* (claude/beast3art) links that catch the light */
  tr([[-23, -5], [21, -5], [21, 5], [-23, 5]], FR[1]); tr([[-23, -5], [21, -5], [21, -3], [-23, -3]], FR[4]); tr([[-23, -3], [21, -3], [21, -1], [-23, -1]], FR[3]); tr([[-23, 2], [21, 2], [21, 5], [-23, 5]], MD[1]);   /* the log: lit top, dark belly */
  for (const bx of [-17, -2, 12]) { tr([[bx, -6], [bx + 3, -6], [bx + 3, 6], [bx, 6]], IRON[1]); tr([[bx, -6], [bx + 1, -6], [bx + 1, 6], [bx, 6]], IRON[3]); }   /* three iron bands */
  tr([[-24, -4], [-21, -4], [-21, 4], [-24, 4]], FR[0]);                                                                                                          /* the butt end: cut grain */
  tr([[21, -7], [30, -5], [33, 0], [30, 5], [21, 7]], IRON[2]); tr([[21, -7], [30, -5], [31, -3], [21, -4]], IRON[4]); tr([[22, 4], [30, 4], [30, 5], [21, 7]], IRON[0]);   /* the ram's-head cap */
  tr([[24, -7], [28, -11], [32, -9], [30, -7]], IRON[3]); tr([[24, 7], [28, 11], [32, 9], [30, 7]], IRON[1]);                                                       /* the horns curling */
  const [ex, ey] = P(26, -1); d.dot(ex, ey, '#fff0c0');
}
/* ===== THE LEGS ===== */
function leg(d, x, hipY, fx, fy, bend, far) {
  const k = bend ? [x + bend, (hipY + fy) / 2 - 2] : [x + (fx - x) * 0.4, (hipY + fy) / 2], H = far ? [HIDE[0], HIDE[1], HIDE[0]] : [HIDE[1], HIDE[3], HIDE[0]];
  d.limb([[x, hipY], k, [fx, fy - 6]], [13, 10, 8], H[0], H[1], H[2]);
  d.limb([[k[0] + (fx - k[0]) * 0.35, k[1] + (fy - 6 - k[1]) * 0.35], [fx, fy - 6]], [9, 8], far ? PL[1] : PL[2], far ? PL[2] : PL[4], PL[0]);   /* the greave */
  d.rc(fx - 5, fy - 5, 10, 5, far ? '#14100c' : '#2a1e16'); d.rc(fx - 5, fy - 5, 10, 1, far ? PL[1] : PL[3]); d.rc(fx - 6, fy - 1, 12, 1, OUT);                     /* the hoof, an anvil */
}
function legsFor(kind, step) {
  /* [hindFar, hindNear, foreFar, foreNear] each [footX, footY, bend] */
  const st = step & 1, base = [[-26, 0], [-17, 0], [14, 0], [23, 0]];
  const mk = o => base.map((b, i) => [b[0] + (o[i] ? o[i][0] : 0), b[1] - (o[i] ? o[i][1] : 0), o[i] ? o[i][2] || 0 : 0]);
  switch (kind) {
    case 'walk': return mk(st ? [[3, 0], [-3, 4], [-3, 4], [3, 0]] : [[-3, 4], [3, 0], [3, 0], [-3, 4]]);
    case 'run': return mk(st ? [[7, 7], [-7, 0], [-8, 8], [7, 0]] : [[-7, 0], [7, 7], [8, 0], [-7, 8]]);
    case 'paw': return mk([null, null, null, st ? [9, 7, 8] : [4, 3, 5]]);
    case 'splay': return mk([[-6, 0], [-3, 0], [3, 0], [7, 0]]);
    case 'brace': return mk([[-7, 0], [-4, 0], [4, 0], [8, 0]]);
    case 'lunge': return mk([[-5, 0], [-2, 0], [9, 0], [14, 0]]);
    case 'lie': return mk([[2, -8, 0], [-2, -8, 0], [10, -6, 12], [14, -6, 12]]);
    case 'kickTell': return mk([[4, 5, -6], [6, 4, -6], [-3, 0], [1, 0]]);      /* (claude/palisade2) THE BUCK: the hind legs gathered under him, the fore legs dug in */
    case 'kick': return mk([[-20, 14, 0], [-24, 12, 0], [-5, 0], [-1, 0]]);    /* ... and lashed out behind (the body tips on its fore feet: see p.buck) */
    default: return mk([]);
  }
}
/* ===== THE BODY ===== */
function body(d, p, ph, cut, step, time) {
  /* the barrel: dark hide, a lit back, a dark belly */
  d.poly([[-36, -22], [-33, -36], [-14, -42], [8, -44], [22, -49], [32, -41], [34, -26], [26, -15], [-24, -13]], HIDE[2]);
  d.poly([[-33, -36], [-14, -42], [8, -44], [22, -49], [30, -43], [8, -38], [-14, -33], [-31, -30]], HIDE[3]);
  d.poly([[-24, -13], [26, -15], [34, -26], [30, -22], [20, -18], [-20, -17], [-34, -22]], HIDE[0]);
  /* the plates: five lames down the back, overlapping, lit on top, riveted */
  for (let i = 0; i < 5; i++) { const x = -32 + i * 11, top = i < 2 ? -38 + i * -2 : i === 2 ? -43 : i === 3 ? -46 : -46; const t0 = top - 1;
    d.poly([[x, t0], [x + 13, t0 - 1], [x + 14, t0 + 15], [x + 1, t0 + 16]], PL[2]); d.poly([[x, t0], [x + 13, t0 - 1], [x + 13, t0 + 2], [x, t0 + 3]], PL[4]); d.poly([[x + 1, t0 + 13], [x + 14, t0 + 12], [x + 14, t0 + 15], [x + 1, t0 + 16]], PL[0]);
    d.poly([[x + 11, t0 - 1], [x + 14, t0 - 1], [x + 14, t0 + 15], [x + 12, t0 + 15]], PL[1]);
    for (const [rx, ry] of [[3, 4], [9, 4], [3, 10], [9, 10]]) { d.dot(x + rx, t0 + ry, PL[4]); d.dot(x + rx + 1, t0 + ry + 1, PL[0]); } }
  /* (claude/beast3) THE BARDING: a riveted plate skirt down the flank, three scalloped lames over the barrel - a war-ox in iron, not a hide beast */
  d.poly([[-33, -31], [27, -33], [30, -20], [24, -15], [-26, -13], [-34, -20]], PL[1]);
  for (let i = 0; i < 5; i++) { const x = -32 + i * 12; d.poly([[x, -31], [x + 13, -31], [x + 13, -17], [x + 6, -14], [x, -17]], i & 1 ? PL[2] : PL[1]); d.rc(x, -31, 13, 1, PL[3]); d.line(x + 13, -31, x + 13, -17, PL[0]); d.dot(x + 6, -27, PL[4]); d.dot(x + 6, -21, PL[4]); d.dot(x + 6, -15, PL[3]); }
  d.rc(-33, -32, 60, 2, RUST[1] || PL[0]); d.rc(-33, -32, 60, 1, PL[3]);   /* the barding's top edge, a rusted rim */
  /* the great pauldron on the shoulder, and spikes along the spine */
  d.poly([[14, -50], [31, -48], [34, -34], [30, -24], [16, -26]], PL[2]); d.poly([[14, -50], [31, -48], [29, -44], [15, -46]], PL[4]); d.poly([[28, -45], [34, -34], [30, -24], [27, -26], [29, -38]], PL[1]);
  for (const [rx, ry] of [[19, -42], [25, -40], [20, -33], [26, -30]]) { d.dot(rx, ry, PL[4]); d.dot(rx + 1, ry + 1, PL[0]); } d.rc(18, -37, 9, 1, PL[0]);
  for (let i = 0; i < 6; i++) d.poly([[-30 + i * 11, -44 - (i > 2 ? 3 : 0)], [-27 + i * 11, -44 - (i > 2 ? 3 : 0)], [-28 + i * 11, -50 - (i > 2 ? 3 : 0)]], PL[3]);
  /* the leather: two girths down the flank and a breast-collar at the neck, buckled; the P2 spine strap with its gold buckle */
  if (!cut) { for (const gx of [-12, 8]) { d.poly([[gx, -44], [gx + 3, -44], [gx + 4, -14], [gx + 1, -14]], LE[0]); d.line(gx + 1, -44, gx + 2, -14, LE[1]);   /* (claude/beast3art) THIN dark straps, read as harness not posts: iron RINGS at the buckle points, the lowest takes the ram's chain */
      for (const ry of [-38, -26, -15]) { d.rc(gx - 2, ry - 3, 7, 6, IRON[0]); d.rc(gx - 1, ry - 2, 5, 4, IRON[3]); d.rc(gx, ry - 1, 3, 2, LE[0]); d.dot(gx - 1, ry - 2, IRON[4]); d.dot(gx + 3, ry + 1, IRON[1]); }
      d.dot(gx + 2, -32, GB[1]); d.dot(gx + 2, -20, GB[1]); }
    d.rc(-20, -45, 36, 3, LE[1]); d.rc(-20, -45, 36, 1, LE[2]); d.rc(-4, -48, 9, 6, GB[0]); d.rc(-3, -47, 7, 4, ph > 1 && Math.floor(time * 6) % 2 ? GB[2] : GB[1]); d.rc(-1, -46, 3, 2, ph > 1 ? OUT : LE[1]); }   /* the buckle at (0, -45): where the hands cut */
  else { d.line(-12, -44, -9, -30, LE[1]); d.line(-10, -30, -6, -26, LE[1]); d.line(8, -44, 11, -33, LE[1]); d.line(-20, -45, -16, -42, LE[1]); }
  d.poly([[26, -38], [38, -42], [38, -16], [26, -18]], LE[1]); d.line(27, -37, 37, -41, LE[2]);   /* the breast-collar */
}
function head(d, p, cut, step) {
  const [hx, hy] = p.head || [0, 0], X = hx, Y = hy;
  /* the horns first (behind): bone with iron caps, curving out and forward */
  d.limb([[31 + X, -40 + Y], [36 + X, -50 + Y], [45 + X, -55 + Y], [52 + X, -50 + Y]], [8, 6, 5, 3], HORN[1], HORN[2], HORN[0]); d.poly([[49 + X, -53 + Y], [55 + X, -51 + Y], [54 + X, -46 + Y], [50 + X, -48 + Y]], PL[3]); d.dot(52 + X, -51 + Y, PL[4]);
  d.limb([[29 + X, -38 + Y], [32 + X, -45 + Y], [38 + X, -48 + Y]], [6, 5, 3], HORN[0], HORN[1], null);
  /* the skull and snout, the chamfron plate over the face, one amber eye */
  d.poly([[28 + X, -42 + Y], [42 + X, -40 + Y], [52 + X, -30 + Y], [53 + X, -20 + Y], [46 + X, -15 + Y], [36 + X, -15 + Y], [28 + X, -24 + Y]], '#6a6e7c');   /* (claude/beast3art) lifted again: the skull must sit off the barding */
  d.poly([[30 + X, -42 + Y], [42 + X, -40 + Y], [50 + X, -32 + Y], [41 + X, -33 + Y], [32 + X, -34 + Y]], '#9a9eac');
  d.poly([[34 + X, -41 + Y], [44 + X, -39 + Y], [53 + X, -27 + Y], [51 + X, -21 + Y], [42 + X, -19 + Y], [35 + X, -27 + Y]], PL[3]); d.poly([[34 + X, -41 + Y], [44 + X, -39 + Y], [46 + X, -36 + Y], [36 + X, -37 + Y]], PL[4]); d.poly([[48 + X, -33 + Y], [53 + X, -27 + Y], [51 + X, -21 + Y], [47 + X, -22 + Y]], PL[1]);
  d.line(38 + X, -38 + Y, 51 + X, -26 + Y, PL[0]);                                                                                                                 /* the ridge down the plate */
  const eye = p.eye === 'red' ? '#ff5a3a' : p.eye === 'shut' ? HIDE[0] : '#ffd878'; d.rc(40 + X, -33 + Y, 8, 4, OUT); d.rc(41 + X, -32 + Y, 6, 2, eye); if (p.eye !== 'shut') { d.rc(41 + X, -32 + Y, 2, 2, '#fff6d0'); d.rc(40 + X, -35 + Y, 8, 1, p.eye === 'red' ? '#a82a18' : '#a88a40'); }   /* (claude/beast3art) a wider, brighter eye slit with a glow line */
  d.poly([[28 + X, -43 + Y], [35 + X, -46 + Y], [37 + X, -40 + Y], [30 + X, -37 + Y]], PL[3]); d.poly([[28 + X, -43 + Y], [35 + X, -46 + Y], [35 + X, -45 + Y], [29 + X, -42 + Y]], PL[4]); d.dot(33 + X, -42 + Y, PL[4]);   /* a lit iron collar at the horn's root */
  for (const [rx, ry] of [[37, -34], [44, -37], [49, -26]]) { d.dot(rx + X, ry + Y, PL[4]); }
  d.rc(46 + X, -19 + Y, 6, 3, HIDE[0]); d.dot(49 + X, -18 + Y, '#e8b090');                                                                                       /* the nostril, wet */
  d.poly([[30 + X, -42 + Y], [26 + X, -46 + Y], [32 + X, -45 + Y]], HIDE[2]);                                                                                     /* the ear */
  if (cut) { /* (claude/palisade2art) UNCHAINED: the iron collar with the chain's torn shackle, foam at the mouth, a red-rimmed eye, a gash across the chamfron */
    d.rc(30 + X, -33 + Y, 7, 5, IRON[2]); d.rc(30 + X, -33 + Y, 7, 1, IRON[3]); d.rc(32 + X, -31 + Y, 3, 2, OUT);
    d.rc(48 + X, -13 + Y, 3, 2, '#f4f0e0'); d.dot(52 + X, -12 + Y - (step & 1), '#fff'); d.dot(46 + X, -12 + Y, '#e8e0cc'); d.dot(50 + X, -10 + Y + (step & 1), '#f4f0e0');
    d.rc(40 + X, -32 + Y, 7, 1, '#ff4a2a'); d.line(44 + X, -37 + Y, 50 + X, -29 + Y, '#5a1e12'); }
}
/* ===== THE POSES ===== */
export const POSES = {   /* (claude/beast3) ram: [x, y, angle] of THE RAM SLUNG UNDER HIM (its chains run up to his girths) */
  sleep: { lie: true, ram: [10, -4, 0], hand: 'sit', eye: 'shut', head: [4, 12], legs: 'lie' },
  wake: { head: [2, -9], ram: [6, -9, 0], legs: 'stand', hand: 'sit', steam: true },
  walk: { head: [0, 0], ram: [6, -9, 0], legs: 'walk', hand: 'sit' },
  recover: { head: [0, 9], ram: [5, -8, 0.08], legs: 'stand', hand: 'sit', steam: true },
  chargeTell: { head: [4, 10], ram: [0, -9, 0.08], legs: 'paw', pitch: 0.1, hand: 'whip', eye: 'red', steam: true, flag: '#ff4a2a' },
  charge: { head: [12, 12], ram: [16, -9, 0.02], legs: 'run', pitch: 0.15, hand: 'duck', eye: 'red', speed: true, streaks: true },
  dazed: { head: [-3, 8], ram: [4, -5, 0.4], legs: 'splay', hand: 'flail', eye: 'shut', stars: true },
  sweepTell: { head: [-2, 1], ram: [-12, -11, -0.3], legs: 'stand', hand: 'hold', twist: true, flag: '#ffd36b' },
  sweep: { head: [5, 4], ram: [22, -7, 0.3], legs: 'lunge', hand: 'hold', swing: true },
  volleyTell: { head: [0, 2], ram: [6, -9, 0], legs: 'stand', hand: 'stand', flag: '#ff9a5c' },
  volley: { head: [1, 2], ram: [6, -9, 0], legs: 'stand', hand: 'throw' },
  stuck: { head: [6, 8], ram: [16, -6, 0.3], legs: 'brace', sunk: 7, hand: 'flail', eye: 'red', timber: true },
  tear: { head: [-2, -4], ram: [8, -12, -0.2], legs: 'splay', shake: true, hand: 'cling', timber: true },
  loose: { head: [8, 3], legs: 'run', pitch: 0.05, eye: 'red', speed: true, trail: true, noRam: true },
  dead: { lie: true, head: [10, 20], eye: 'shut', legs: 'lie', dead: true },
  /* (claude/palisade2) P1 the handlers' orders, P2 the beast unchained */
  sweepMid: { head: [3, 2], ram: [-15, -8, -0.3], legs: 'stand', hand: 'hold', twist: true },
  sweepBack: { head: [-3, 3], ram: [-24, -6, -0.2], legs: 'lunge', hand: 'hold', swing: true },
  potTell: { head: [0, 2], ram: [6, -9, 0], legs: 'stand', hand: 'pot', flag: '#ff6a1a', fire: true },
  pot: { head: [1, 2], ram: [6, -9, 0], legs: 'stand', hand: 'lob', fire: true },
  batterTell: { head: [6, 12], ram: [4, -8, 0.06], legs: 'brace', pitch: 0.08, hand: 'whip', eye: 'red', steam: true, flag: '#c83a2a' },
  batter: { head: [12, 10], ram: [20, -8, 0], legs: 'lunge', pitch: 0.06, hand: 'cling', eye: 'red', shake: true, dust: true },
  unchain: { rear: true, head: [-4, -6], ram: [0, -11, -0.6], hand: 'flail', eye: 'red', steam: true, snap: true },
  flailTell: { head: [-8, -12], legs: 'brace', eye: 'red', noRam: true, chain: 'coil', pitch: -0.1, steam: true, whirl: true },
  flail: { head: [12, 8], legs: 'lunge', eye: 'red', noRam: true, chain: 'out', pitch: 0.09, speed: true, blur: true },
  kickTell: { head: [-4, 11], legs: 'kickTell', eye: 'red', noRam: true, buck: 0.15, steam: true, dust: true },
  kick: { head: [0, 12], legs: 'kick', eye: 'red', noRam: true, buck: 0.27, dust: true, impact: true },
  /* (claude/beast3) THE VOLLEY ORDER: the head up and braced while THE HORNSMAN puts the horn to his mouth (the driver whips); the blast (the horn, the crew clinging);
     the order LOST (the Hornsman reeling, the beast unsteered, head swinging) */
  orderTell: { head: [-2, -7], ram: [4, -9, 0], legs: 'brace', hand: 'whip', horn: 'up', steam: true },
  order: { head: [3, 3], ram: [7, -9, 0.05], legs: 'stand', hand: 'cling', horn: 'blast' },
  lost: { head: [-5, 5], ram: [3, -7, 0.25], legs: 'splay', hand: 'flail', horn: 'reel', eye: 'shut' },
  /* (claude/beast3) THE WALL BREAKER (P2, unchained): he wheels and paws, head down at the wall; the run; the SLAM (head buried, timber flying); the recoil off the breach */
  wallTell: { head: [6, 13], legs: 'paw', pitch: 0.13, eye: 'red', noRam: true, steam: true, dust: true },
  wallRun: { head: [13, 13], legs: 'run', pitch: 0.16, eye: 'red', noRam: true, speed: true, streaks: true },
  wallHit: { head: [15, 9], legs: 'brace', pitch: 0.05, eye: 'red', noRam: true, shake: true, splinters: true },
  wallBack: { head: [-2, 6], legs: 'splay', eye: 'shut', noRam: true, winded: true },   /* (claude/beast3art) winded, not dazed: breath clouds and chips falling off his head, no stars */
};
/* (claude/palisade2) THE BROKEN RAM CHAIN (P2): dragged from the collar, coiled for the flail, whipped out in it */
function chain(d, kind, step) {
  const pts = kind === 'out' ? [[38, -30], [56, -26], [74, -22], [92, -18], [104, -16]] : kind === 'coil' ? [[38, -30], [30, -42], [18, -48], [8, -40], [14, -30], [26, -28]] : [[36, -24], [44, -12], [52, -4], [64, -1], [78, 0 - (step & 1)]];
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; d.line(x0, y0, x1, y1, IRON[1], 2); for (let k = 0; k < 3; k++) { const t = k / 3; d.rc(x0 + (x1 - x0) * t - 1, y0 + (y1 - y0) * t - 1, 3, 2, IRON[3]); } }
  const [ex, ey] = pts[pts.length - 1]; d.rc(ex - 3, ey - 3, 6, 6, IRON[2]); d.rc(ex - 3, ey - 3, 6, 1, IRON[4]);   /* the torn shackle at its end */
}
function bakeFrame(mode, cut, step, ph, solo) {
  const p = POSES[mode] || POSES.walk, [c, g] = canvas(CW, CH);
  const sunk = p.sunk || 0, lift = p.lie ? 10 : 0;
  g.save(); g.translate(0, sunk);
  const d0 = D(g);
  if (p.timber && !p.dead) wreck(d0, true);
  /* the far legs, the tail */
  const lg = legsFor(p.legs || 'stand', step); const hipY = p.lie ? -16 : -22;
  const front = p.buck ? rot(p.buck, 23, 0) : p.rear ? rot(-0.55, -22, -18) : p.pitch ? rot(p.pitch, -22, -18) : null;
  const dBody = D(g, front || (p.lie ? ((x, y) => [x, y + lift]) : null)), dLeg = D(g, p.lie ? ((x, y) => [x, y + lift * 0.4]) : null);
  { const t = step & 1 ? 3 : -2; d0.limb([[-35, -30], [-42, -22 + t], [-44, -8 + t]], [5, 4, 3], HIDE[1], HIDE[2], HIDE[0]); d0.poly([[-47, -9 + t], [-41, -9 + t], [-44, 0 + t]], HIDE[0]); }
  const dHind = p.buck ? dBody : dLeg;   /* (claude/palisade2art) THE BUCK: the hind legs ride the tipped body, so they kick up and back */
  leg(dHind, -24, hipY, lg[0][0], lg[0][1], lg[0][2], true);
  if (p.rear) { /* the hind legs bear him: straight, planted; the fore legs hang bent in the rotated group */
    leg(dLeg, -16, hipY, -17, 0, 0, false); }
  else { leg(dHind, -16, hipY, lg[1][0], lg[1][1], lg[1][2], false); }
  /* the gantry on his back, then the far fore leg */
  leg(dBody, 14, hipY + 2, p.rear ? 22 : lg[2][0], p.rear ? -14 : lg[2][1], p.rear ? 10 : lg[2][2], true);
  body(dBody, p, ph, cut, step, 0);
  if (!p.noRam && !p.dead) { const r = p.ram || [6, -9, 0], sw = p.legs === 'walk' ? (step & 1 ? 1 : -1) : 0; ram(dBody, r[0] + sw * 3, r[1] - (sw > 0 ? 1 : 0), r[2] + sw * 0.08, cut, null); }   /* (claude/beast3art) the ram SWAYS under him as he walks (two frames) */   /* (claude/beast3) THE RAM SLUNG UNDER HIM: under the barrel, in front of the far legs, behind the near fore leg */
  if (!cut) gantry(dBody, p, step); else if (!p.dead) brokenGantry(dBody, step);
  if (!p.dead && !p.lie) banners(dBody, cut, step);   /* (claude/beast3) THE WAR BANNERS */
  head(dBody, p, cut && !p.dead, step);
  leg(dBody, 23, hipY + 2, p.rear ? 30 : lg[3][0], p.rear ? -22 : lg[3][1], p.rear ? 12 : lg[3][2], false);
  if (!cut) { handler(dBody, -22, -45, p.hand, step, cut, false);   /* (claude/beast3) the second handler is THE HORNSMAN: the horn up for an order (or a flagged order's word), reeling when it is lost; gone when knocked off (solo) */
    if (!solo) handler(dBody, -6, -45, p.horn === 'reel' ? 'reel' : p.hand, step + 1, cut, p.horn === 'blast' ? 'blast' : (p.horn === 'up' || (!!p.flag && (p.hand === 'whip' || p.hand === 'hold')))); }
  if (p.splinters) for (let k = 0; k < 9; k++) { const a = 58 + k * 3 + (k % 3) * 2, b = -20 - (k * 7) % 30, st = step & 1; d0.line(a, b, a + 5 + (k % 4) * 2, b - 8 - (k % 3) * 5 - st * 3, k & 1 ? FR[4] : FR[2], k % 3 ? 1 : 2); }   /* (claude/beast3) the slam: timber flying off the wall, every shard its own way */
  if (cut && !p.dead && !p.lie) chain(p.chain ? dBody : d0, p.chain || 'drag', step);   /* (claude/palisade2) unchained: the broken chain */
  if (p.whirl) for (let k = 0; k < 14; k++) { const a = -2.6 + k * 0.28, rr = k & 1 ? 'rgba(220,220,235,0.55)' : 'rgba(170,170,190,0.4)'; d0.dot(20 + Math.cos(a) * 30, -52 + Math.sin(a) * 15, rr); }   /* (claude/palisade2art) the chain whirling over his head: the swing it is about to make */
  if (p.impact) { g.fillStyle = '#fff6d0'; for (const [a, b] of [[-56, -58], [-60, -50], [-52, -64]]) g.fillRect(AX + R(a * K), AY + R(b * K), 2, 2); g.fillStyle = '#ffd36b'; for (const [a, b] of [[-62, -57], [-57, -66], [-48, -68]]) g.fillRect(AX + R(a * K), AY + R(b * K), 1, 1); }   /* (claude/palisade2art) the hooves land: sparks */
  if (p.snap) for (let k = 0; k < 4; k++) { d0.line(-20 + k * 9, -70 + (k & 1) * 4, -14 + k * 9, -78 - (k & 1) * 3, IRON[3]); }   /* the chains snapping */
  if (p.dead) deadExtras(d0);
  if (p.timber && !p.dead) wreck(dBody, false);
  g.restore();
  if (p.stars) for (let k = 0; k < 3; k++) { const a = k * 2.1 + step * 0.9; g.fillStyle = '#ffe9a0'; g.fillRect(AX + R((38 + Math.cos(a) * 11) * K), AY + R((-60 + Math.sin(a) * 4) * K), 2, 2); g.fillStyle = '#fff'; g.fillRect(AX + R((38 + Math.cos(a) * 11) * K), AY + R((-60 + Math.sin(a) * 4) * K), 1, 1); }
  if (p.steam) { g.fillStyle = 'rgba(240,236,224,0.7)'; for (let k = 0; k < 3; k++) g.fillRect(AX + R((54 + k * 3) * K) + (step & 1), AY + R((-18 + (p.head ? p.head[1] : 0) - k * 3) * K), 2, 2); }
  if (p.winded) { const hy = (p.head ? p.head[1] : 0); g.fillStyle = 'rgba(240,236,224,0.78)'; for (let k = 0; k < 4; k++) g.fillRect(AX + R((52 + k * 5) * K) + (step & 1) * (k & 1 ? 1 : -1), AY + R((-14 + hy + k * 3) * K), 3 + k, 3 + (k >> 1)); g.fillStyle = 'rgba(210,204,190,0.6)'; for (let k = 0; k < 3; k++) g.fillRect(AX + R((58 + k * 6) * K), AY + R((-10 + hy + k * 4) * K) + (step & 1), 2, 2);
    for (let k = 0; k < 4; k++) { g.fillStyle = k & 1 ? FR[3] : FR[4]; g.fillRect(AX + R((34 + k * 6) * K), AY + R((-42 + hy + k * 9 + (step & 1) * 4) * K), 2, 2); } g.fillStyle = '#d8d8e8'; g.fillRect(AX + R(51 * K), AY + R((-8 + hy + (step & 1) * 3) * K), 1, 2); }   /* a string of drool */
  if (p.streaks) { g.fillStyle = 'rgba(255,238,200,0.55)'; for (let k = 0; k < 4; k++) g.fillRect(AX + R((-58 - k * 3) * K), AY + R((-14 - k * 9) * K), R((16 + k * 3) * K), 1); }
  if (p.trail) { const d = D(g); d.line(-6, -44, -20, -24, LE[1]); d.line(-20, -24, -26, -14, LE[1]); d.line(4, -40, 10, -26, LE[1]); d.rc(8, -26, 3, 3, GB[1]); }   /* the parted harness trailing */
  outline(c, OUT);
  if (!p.noRam && !p.dead && !p.lie) { const r = p.ram || [6, -9, 0], sw = p.legs === 'walk' ? (step & 1 ? 1 : -1) : 0, cx = r[0] + sw * 3; g.fillStyle = 'rgba(8,4,2,0.5)'; g.fillRect(AX + R((cx - 22) * K), AY - 2, R(48 * K), 1); g.fillStyle = 'rgba(8,4,2,0.32)'; g.fillRect(AX + R((cx - 26) * K), AY - 1, R(56 * K), 1); }   /* (claude/beast3art) the ram's shadow on the floor under him */
  if (p.dust) { for (let k = 0; k < 7; k++) { g.fillStyle = k % 3 ? 'rgba(206,176,128,0.62)' : 'rgba(232,208,160,0.5)'; g.fillRect(AX + R((-34 + k * 11) * K), AY - 3 - (k % 2) * 2 - (k % 3), 5 - (k % 2), 2 + (k % 2)); } }   /* (claude/palisade2art) dust drawn after the outline: soft puffs, not rings */
  return c;
}
/* (claude/beast3) THE WAR BANNERS: a tall crimson banner on a pole at the gantry's tail (a gold ram's head on it, a swallow tail), a black-and-red pennant on a staff at his
   shoulder streaming back; unchained (P2) the tail pole is snapped and the banner hangs torn from its stump */
function banners(d, cut, step) {
  const fl = step & 1, CR = ['#4a0c0a', '#8a1a14', '#c02a1e'], GD = ['#8a6210', '#d8a020', '#ffd36b'];
  if (!cut) { d.rc(-31, -106, 2, 60, MD[1]); d.rc(-31, -106, 1, 60, FR[3]); d.rc(-33, -107, 6, 2, IRON[2]); d.rc(-32, -109, 2, 2, GD[1]);   /* the pole, an iron finial */
    d.rc(-31, -104, 14, 1, MD[0]); const t = fl ? 3 : -1;   /* (claude/beast3art) a real 2-frame flutter: the whole cloth ripples, folds travelling down it, the swallow tail snapping */
    d.poly([[-30, -103], [-17 + t * 0.4, -103], [-16 + t, -93], [-17 + t * 1.2, -80 + fl * 2], [-21 + t, -85 - fl * 2], [-25 + t * 0.8, -78 - fl * 2], [-30, -82]], CR[1]); d.poly([[-30, -103], [-17, -103], [-17, -101], [-30, -101]], CR[2]); d.line(-18 + t * 0.4, -101, -17 + t * 1.2, -81, CR[0]);   /* the cloth */
    d.line(-25 + t * 0.2, -100, -24 + t * 0.5, -86, CR[0]); d.line(-21 + t * 0.4, -100, -20 + t * 0.8, fl ? -90 : -84, CR[2]); d.line(-27, -100, -27, fl ? -85 : -91, CR[2]);
    d.rc(-30, -103, 13, 1, GD[1]); d.line(-30, -102, -30, -83, GD[0]);
    d.rc(-26, -97, 5, 4, GD[1]); d.rc(-27, -98, 2, 2, GD[2]); d.rc(-22, -98, 2, 2, GD[2]); d.rc(-25, -93, 3, 2, GD[0]); d.dot(-24, -96, CR[0]); }   /* the gold ram's head */
  else { d.poly([[-31, -47], [-31, -66], [-29, -63], [-28, -69], [-27, -64], [-29, -47]], MD[1]);   /* the snapped pole, the banner torn and hanging */
    d.rc(-31, -64, 8, 1, GD[0]);   /* (claude/beast3art) the torn banner: three rags of different lengths streaming and swinging on their own beat, not one stiff flap */
    for (let i = 0; i < 3; i++) { const x0 = -31 + i * 3, len = [15, 9, 18][i], sw = (fl ? 1 : -1) * (i === 1 ? -2 : 2) + (i === 2 ? 2 : 0); d.poly([[x0, -63], [x0 + 3, -63], [x0 + 4 + sw, -63 + len - 3], [x0 + 2 + sw * 1.5, -63 + len], [x0 + sw, -63 + len - 4]], i === 1 ? CR[1] : CR[0]); d.line(x0 + 1, -63, x0 + 1 + sw, -63 + len - 5, CR[2]); }
    d.line(-27, -64, -22 + fl * 2, -57, '#2a1a10'); }
  d.rc(23, -76, 1, 28, IRON[2]); d.dot(23, -77, GD[2]);   /* the shoulder staff */
  d.poly([[24, -76], [10 - fl, -73], [14 - fl, -71], [8 - fl * 2, -68], [24, -69]], '#16100c'); d.poly([[24, -74], [12 - fl, -72], [24, -71]], CR[2]);   /* the pennant streaming back */
}
/* the gantry: two uprights, a cross-beam, a deck of boards; braces and lashings */
function gantry(d, p, step) {
  d.rc(-26, -47, 36, 4, FR[1]); d.rc(-26, -47, 36, 1, FR[4]); d.rc(-26, -44, 36, 1, MD[0]); for (const nx of [-22, -14, -6, 2, 8]) d.dot(nx, -46, IRON[3]);   /* the deck */
  for (const ux of [-24, 3]) { d.rc(ux, -66, 4, 20, FR[2]); d.rc(ux, -66, 1, 20, FR[4]); d.rc(ux + 3, -66, 1, 20, MD[0]); for (const ly of [-52, -61]) { d.rc(ux - 1, ly, 6, 2, ROPE[1]); d.dot(ux, ly, ROPE[2]); } }
  d.line(-22, -47, -18, -62, FR[1], 2); d.line(5, -47, 0, -62, FR[1], 2);
  d.rc(-27, -66, 36, 4, FR[2]); d.rc(-27, -66, 36, 1, FR[4]); d.rc(-27, -63, 36, 1, MD[0]); d.rc(-27, -66, 3, 4, IRON[2]); d.rc(6, -66, 3, 4, IRON[2]);   /* the cross-beam, iron-shod ends */
  /* (claude/palisade2art) THE PITCH CAULDRON on its bracket at the deck's tail: iron, black with tar, a flame that flares when a pot is being lit */
  const fl = step & 1, big = p.fire ? 3 : 0; d.rc(-37, -47, 12, 2, FR[1]); d.rc(-36, -45, 2, 6, MD[1]); d.rc(-36, -55, 9, 7, IRON[1]); d.rc(-36, -55, 9, 1, IRON[3]); d.rc(-36, -49, 9, 1, IRON[0]); d.rc(-35, -56, 7, 2, '#120a06');
  d.rc(-34, -61 - fl - big, 3, 5 + fl + big, '#ff6a1a'); d.rc(-33, -63 - fl - big, 1, 4 + big, '#ffd36b'); d.rc(-31, -59 - big, 2, 3 + big, '#ff9a2a');
  /* (claude/palisade2art) THE ORDER'S FLAG, raised on a pole at the cross-beam's end for the whole windup: the colour names the order (the red ring on the floor is the move's own) */
  if (p.flag) { const wv = step & 1; d.rc(7, -94, 1, 29, '#3a2414'); d.poly([[8, -94 + wv], [21, -92 + wv], [18, -88 + wv], [21, -84 + wv], [8, -86 + wv]], p.flag); d.poly([[8, -94 + wv], [21, -92 + wv], [20, -91 + wv], [8, -93 + wv]], '#fff0d0'); d.dot(11, -90 + wv, '#3a2414'); d.dot(14, -89 + wv, '#3a2414'); }
}
/* (claude/palisade2art) THE GANTRY, WRECKED (P2): the crew thrown off, one post snapped, the cross-beam hanging by a chain, the deck half gone, ropes and straps trailing */
function brokenGantry(d, step) {
  const sw = step & 1;
  d.poly([[-26, -47], [-8, -47], [-8, -44], [-26, -44]], FR[1]); d.rc(-26, -47, 18, 1, FR[4]); d.poly([[-8, -47], [-4, -46], [-8, -44]], FR[0]);             /* a ragged half-deck */
  d.poly([[-24, -47], [-24, -58], [-22, -55], [-20, -61], [-19, -57], [-20, -47]], FR[2]); d.rc(-24, -58, 1, 11, FR[4]); d.dot(-20, -61, FR[4]);                  /* a snapped post */
  d.poly([[3, -47], [3, -52], [5, -50], [6, -54], [7, -47]], FR[2]);
  d.poly([[-27, -62 + sw], [-12, -55 + sw], [-12, -51 + sw], [-27, -58 + sw]], FR[2]); d.rc(-27, -62 + sw, 15, 1, FR[4]); d.line(-24, -58, -23, -52 + sw, IRON[2]);   /* the cross-beam swinging from one chain */
  d.line(-19, -57, -14, -48, ROPE[1]); d.line(5, -52, 9, -44, ROPE[1]);                                                                                            /* torn ropes */
}
function wreck(d, back) {
  if (back) { for (let k = 0; k < 4; k++) { d.rc(-44 + k * 18, -8 - (k & 1) * 4, 22, 5, k & 1 ? FR[1] : MD[2]); d.rc(-44 + k * 18, -8 - (k & 1) * 4, 22, 1, FR[4]); } d.rc(-18, -16, 5, 16, MD[1]); d.rc(26, -20, 5, 20, MD[1]); return; }
  for (let k = 0; k < 5; k++) { d.rc(-30 + k * 16, -5 - (k % 2) * 6, 18, 4, FR[2]); d.rc(-30 + k * 16, -5 - (k % 2) * 6, 18, 1, FR[4]); d.dot(-28 + k * 16, -4 - (k % 2) * 6, IRON[3]); }
  for (let k = 0; k < 3; k++) { d.line(34 + k * 4, -4, 44 + k * 5, -16 - k * 3, FR[4], 2); }   /* splinters flying */
}
function deadExtras(d) {
  /* the gantry fallen across him, the ram lying in front, the broken girths */
  d.rc(-30, -34, 40, 4, FR[1]); d.rc(-30, -34, 40, 1, FR[4]); d.rc(-8, -44, 4, 14, FR[2]); d.rc(8, -26, 4, 20, MD[1]);
  d.poly([[34, -8], [74, -8], [74, 0], [34, 0]], FR[1]); d.rc(34, -8, 40, 2, FR[4]); for (const bx of [40, 54, 66]) d.rc(bx, -9, 3, 10, IRON[1]); d.poly([[74, -10], [82, -8], [84, -4], [82, 0], [74, 0]], IRON[2]); d.rc(75, -9, 6, 1, IRON[4]);
  d.line(-12, -44, -4, -30, LE[1]); d.line(8, -44, 16, -32, LE[1]);
}
/* ============================== the public frames ============================== */
export function frame(mode, cut, step = 0, ph = 1, solo = false) {
  const p = POSES[mode] || POSES.walk, st = p.dead || p.lie ? 0 : (step & 1), so = solo && !cut && !p.noRam ? 's' : '';
  return once('bf' + mode + (cut ? 'c' : '') + so + st, () => bakeFrame(mode, !!cut || !!p.noRam || !!p.dead, st, ph, !!so));
}
export const whiteOf = (mode, cut, step, solo = false) => once('bw' + mode + (cut ? 'c' : '') + (solo ? 's' : '') + (step & 1), () => whiten(frame(mode, cut, step, 1, solo)));
export function deadSet() { return once('bdead', () => { const f = bakeFrame('dead', true, 0, 1), L = flipX(f), w = whiten(f); return { R: [f], L: [L], white: { R: [w], L: [flipX(w)] }, ax: AX, ay: AY, w: 56, h: 40 }; }); }
export function bakeCard() {
  const fr = [['walk', 0], ['chargeTell', 0]].map(([n, i]) => { const [c, g] = canvas(76, 48); g.imageSmoothingEnabled = false; const f = frame(n, false, i); g.drawImage(f, 0, 0, CW, CH, 8, 2, Math.round(CW * 0.5), Math.round(CH * 0.5)); return c; });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 8 + (AX >> 1), ay: 2 + (AY >> 1), w: 70, h: 44 };
}
/* ============================== THE CLEARING ============================== */
/* THE OLD FOREST GATE: the gate you came through - a timber leaf in a stone-footed arch, iron straps, a great bar, scorch marks, vine, the beast's old blows */
export function drawGate(g, gx, fy) {
  const rc = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  for (const px of [gx - 18, gx + 14]) { rc(px, fy - 96, 12, 96, OUT); rc(px + 1, fy - 95, 10, 95, MD[1]); rc(px + 1, fy - 95, 3, 95, MD[3]); rc(px + 9, fy - 95, 2, 95, MD[0]); for (let y = 8; y < 92; y += 14) rc(px + 1, fy - y, 10, 1, MD[0]); rc(px - 2, fy - 8, 16, 8, '#5a5560'); rc(px - 2, fy - 8, 16, 2, '#8a8590'); }   /* posts on stone feet */
  rc(gx - 22, fy - 106, 52, 14, OUT); rc(gx - 21, fy - 105, 50, 12, MD[2]); rc(gx - 21, fy - 105, 50, 2, MD[3]); rc(gx - 21, fy - 94, 50, 1, MD[0]); for (let x = gx - 18; x < gx + 28; x += 9) rc(x, fy - 103, 2, 8, MD[0]);   /* the lintel */
  rc(gx - 6, fy - 92, 20, 92, OUT); rc(gx - 5, fy - 92, 18, 92, '#3e2a18');   /* the gate's leaf */
  for (let x = gx - 5; x < gx + 13; x += 6) { rc(x, fy - 92, 5, 92, '#4a3220'); rc(x, fy - 92, 1, 92, '#6a4a2c'); rc(x + 4, fy - 92, 1, 92, '#2a1a0c'); }
  for (const y of [18, 46, 74]) { rc(gx - 6, fy - y, 20, 5, '#3a3a46'); rc(gx - 6, fy - y, 20, 1, '#8a8a98'); for (let x = gx - 3; x < gx + 12; x += 6) rc(x, fy - y + 2, 1, 2, '#c8c8d6'); }   /* iron straps, rivets */
  rc(gx - 8, fy - 52, 24, 5, OUT); rc(gx - 7, fy - 51, 22, 3, FR[1]); rc(gx - 7, fy - 51, 22, 1, FR[3]);   /* the bar */
  for (let k = 0; k < 14; k++) rc(gx + 8 + ((k * 7) % 5), fy - 4 - k * 6, 2, 2, '#1a1008');   /* scorch */
  for (let k = 0; k < 30; k++) rc(gx - 16 + Math.round(Math.sin(k * 0.7) * 3), fy - 100 + k * 3, 1, 3 + (k % 3), '#4a6a24');   /* a vine down the post */
  for (const [dx, dy] of [[-2, -30], [4, -64], [8, -20]]) { rc(gx + dx, fy + dy, 5, 4, '#1a1008'); rc(gx + dx - 1, fy + dy - 1, 2, 1, FR[3]); }   /* the beast's old blows: dents with fresh splinters */
}
/* THE PALISADE'S UNFINISHED END: raw stakes in ranks, one rank still a frame of posts, a rope and a lantern */
export function drawEnd(g, px, fy, time, breach = 0, crack = 0, lean = 0) {
  const rc = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  /* (claude/beast3) BREACHED: the forest seen through the gap, the stakes snapped to stumps (stage 2: the whole rank) */
  if (breach) { const gw = breach > 1 ? 40 : 26;   /* (claude/beast3art) the gap is a view of the FOREST: deep green dark, trunks, foliage, a shaft of light, ragged splintered jambs either side */
    rc(px - 2, fy - 70, gw, 70, '#0c150b'); rc(px - 2, fy - 70, gw, 24, '#16260f'); rc(px - 2, fy - 70, gw, 8, '#2a4418');
    for (const [tx, tw] of [[px + 2, 5], [px + 11, 4], [px + gw - 9, 6]]) { if (tx + tw > px - 2 + gw) continue; rc(tx, fy - 70, tw, 70, '#1c1a12'); rc(tx, fy - 70, 1, 70, '#3a3220'); rc(tx + tw - 1, fy - 70, 1, 70, '#0a0806'); }   /* trunks */
    for (let k = 0; k < 14; k++) rc(px - 2 + (k * 11) % (gw - 4), fy - 68 + ((k * 17) % 40), 6, 3, k % 3 ? '#1e3414' : '#34561e');   /* leaf clumps */
    g.globalAlpha = 0.22; g.fillStyle = '#d8f0a0'; g.beginPath(); g.moveTo(px + 4, fy - 70); g.lineTo(px + 12, fy - 70); g.lineTo(px + 20, fy); g.lineTo(px + 6, fy); g.closePath(); g.fill(); g.globalAlpha = 1;   /* a shaft of light */
    rc(px - 4, fy - 40, 3, 40, OUT); rc(px - 3, fy - 38, 1, 36, FR[3]); for (let k = 0; k < 6; k++) { rc(px - 6 + (k & 1) * 2, fy - 44 + k * 8, 3, 2, FR[4]); rc(px - 5, fy - 41 + k * 8, 1, 3, OUT); }   /* the west jamb's splinters */
    rc(px + gw - 2, fy - 58, 3, 58, OUT); rc(px + gw - 1, fy - 56, 1, 54, FR[3]); for (let k = 0; k < 7; k++) rc(px + gw + (k & 1), fy - 60 + k * 8, 3, 2, FR[4]);   /* the east jamb's */ }
  const stake = (k, x, h) => { rc(x - 1, fy - h - 4, 6, h + 4, OUT); rc(x, fy - h, 4, h, k % 2 ? FR[2] : FR[1]); rc(x, fy - h, 1, h, FR[4]); rc(x + 3, fy - h, 1, h, MD[0]); rc(x + 1, fy - h - 4, 2, 4, FR[4]); rc(x + 1, fy - h - 5, 1, 2, '#fff6d0');
    if (crack && k < 4) for (let c = 0; c < 4; c++) rc(x + 1 + (c & 1), fy - h + 8 + c * 9, 1, 4, OUT); };
  const stump = (k, x) => { const h = 10 + (k * 5) % 12;   /* (claude/beast3art) a SNAPPED stake: a jagged, splintered top (two uneven points), the pale break, chips lying at its foot */
    rc(x - 1, fy - h - 4, 6, h + 4, OUT); rc(x, fy - h, 4, h, FR[1]); rc(x, fy - h, 1, h, FR[4]); rc(x + 3, fy - h, 1, h, MD[0]);
    rc(x, fy - h - 4 - (k & 1), 1, 5, FR[4]); rc(x + 1, fy - h - 2, 1, 2, FR[3]); rc(x + 2, fy - h - 3 + (k & 1), 1, 4, FR[4]); rc(x + 3, fy - h - 1, 1, 1, '#fff6d0'); rc(x + 1, fy - h - 6 - (k & 1), 1, 2, '#fff6d0');
    rc(x + 5, fy - 2, 3, 2, FR[3]); rc(x - 4, fy - 1, 3, 1, FR[4]); };
  const broken = k => breach && (k < 4 || breach > 1);
  if (lean > 0 && !breach) { g.save(); g.translate(R(px), R(fy)); g.rotate(-lean * 0.32); g.translate(-R(px), -R(fy)); }   /* the slam: the section leans into the clearing */
  for (let k = 0; k < 4; k++) { const x = px + k * 6, h = 64 - (k % 3) * 6; if (broken(k)) stump(k, x); else stake(k, x, h); }
  if (lean > 0 && !breach) g.restore();
  for (let k = 4; k < 6; k++) { const x = px + k * 6, h = 64 - (k % 3) * 6 - 14; if (broken(k)) stump(k, x); else stake(k, x, h); }
  if (!breach) { rc(px - 2, fy - 48, 40, 3, ROPE[1]); rc(px - 2, fy - 24, 40, 3, ROPE[1]); } else { rc(px + 24, fy - 48, 14, 3, ROPE[1]); rc(px + 24, fy - 24, 14, 3, ROPE[1]); rc(px + 22, fy - 46, 2, 10, ROPE[0]); }   /* the ropes, parted at the breach */
  rc(px + 40, fy - 70, 4, 70, FR[1]); rc(px + 40, fy - 70, 1, 70, FR[4]); rc(px + 52, fy - 54, 4, 54, FR[1]); rc(px + 40, fy - 70, 16, 3, FR[2]); for (let q = 0; q < 24; q++) rc(px + 44 + (q >> 1), fy - 4 - q * 2, 2, 2, MD[1]);   /* the next rank, a frame */
  rc(px + 38, fy - 62, 1, 12, ROPE[1]); rc(px + 36, fy - 50, 5, 6, OUT); rc(px + 37, fy - 49, 3, 4, Math.floor(time * 3) % 2 ? '#ffd36b' : '#f0a030');   /* a lantern hung */
}
/* (claude/beast3art) A PALISADE ARCHER of the siege crew, redrawn at the scaffold archer's size (about 36 px): kettle hat + red crest, soot face, rust tunic, apron, a QUIVER of fletched arrows on his back, boots, a bracer, a curved recurve bow.
   feet at (x, y), facing f. idle: bow held low. draw: bow up and forward, string drawn to the cheek, the arrow nocked and pointing high (the rain). loose: the string snapped forward, the arrow gone, a bright STREAK climbing out of the frame. */
export function drawArcher(g, x, y, f, pose, time) {
  const rc = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(R(f > 0 ? x + a : x - a - w), R(y + b), R(w), R(h)); };
  const ln = (a0, b0, a1, b1, c) => { const n = Math.max(Math.abs(a1 - a0), Math.abs(b1 - b0), 1); for (let i = 0; i <= n; i++) rc(a0 + (a1 - a0) * i / n, b0 + (b1 - b0) * i / n, 1, 1, c); };
  const drawn = pose === 'draw', lo = pose === 'loose', bob = Math.floor(time * 8) & 1;
  rc(-5, -1, 12, 1, 'rgba(0,0,0,0.35)');                                                                                    /* a foot shadow */
  rc(-4, -4, 5, 4, '#2a1a10'); rc(2, -4, 6, 4, '#2a1a10'); rc(-4, -4, 5, 1, '#5a3a20'); rc(2, -4, 6, 1, '#5a3a20');           /* boots */
  rc(-3, -11, 4, 7, '#3a2a1c'); rc(3, -11, 4, 7, '#2a1c12');                                                                /* legs, a wide stance */
  rc(-5, -23, 12, 13, OUT); rc(-4, -22, 10, 12, TUN[1]); rc(-4, -22, 2, 12, TUN[2]); rc(4, -22, 2, 12, TUN[0]);             /* the rust tunic */
  rc(-4, -16, 10, 2, APR[0]); rc(0, -16, 2, 2, '#d8a020'); rc(-2, -22, 6, 1, APR[0]); rc(-4, -14, 10, 5, APR[1]); rc(-4, -14, 10, 1, APR[2]); rc(-4, -9, 10, 1, APR[0]);   /* belt, buckle, the leather skirt */
  rc(-9, -27, 4, 15, OUT); rc(-8, -26, 3, 14, '#5a3a20'); rc(-8, -26, 1, 14, '#7a5230'); rc(-8, -12, 3, 1, APR[0]);           /* the QUIVER on his back */
  rc(-9, -31, 1, 5, '#e8dcc0'); rc(-7, -32, 1, 6, '#ff6b6b'); rc(-5, -30, 1, 4, '#e8dcc0'); rc(-9, -32, 1, 2, '#ff6b6b');       /* its fletchings */
  rc(-3, -26, 8, 4, '#cfc4a8'); rc(-3, -26, 8, 1, '#efe6cc');                                                               /* the neck-cloth */
  rc(-2, -32, 6, 6, SOOT); rc(2, -30, 2, 1, '#ffd36b'); rc(3, -30, 1, 1, '#fff6d0');                                          /* the soot face, a lit eye */
  rc(-5, -34, 12, 2, HELM[1]); rc(-5, -34, 12, 1, HELM[3]); rc(-5, -33, 12, 1, HELM[0]); rc(-3, -39, 8, 5, HELM[2]); rc(-3, -39, 8, 1, HELM[3]); rc(-3, -39, 1, 5, HELM[3]); rc(4, -39, 1, 5, HELM[1]); rc(0, -36, 1, 1, HELM[0]); rc(0, -42, 3, 3, CREST); rc(0, -42, 1, 1, '#ff7a5a');   /* the kettle hat, riveted, its red crest */
  if (!drawn && !lo) { rc(5, -22, 3, 3, TUN[1]); rc(6, -19, 3, 6, TUN[1]); rc(6, -13, 3, 3, GLV);   /* the arm down, the bracer and glove */
    ln(10, -26, 11, -20, MD[1]); ln(11, -20, 11, -12, MD[1]); ln(11, -12, 10, -4, MD[1]); ln(10, -26, 10, -4, '#e8dcc0'); ln(12, -22, 12, -12, FR[3]); }   /* the recurve bow held low, its string slack at the side */
  else { rc(4, -24, 3, 3, TUN[1]); rc(6, -25, 9, 3, TUN[1]); rc(6, -25, 9, 1, TUN[2]); rc(14, -27, 4, 5, GLV);                       /* the bow arm out to the front */
    for (const [a, b] of [[16, -44], [19, -39], [20, -33], [19, -27], [16, -22]]) rc(a, b, 2, 4, MD[1]); for (const [a, b] of [[17, -44], [20, -39], [21, -33], [20, -27]]) rc(a, b, 1, 4, FR[4]);   /* the bow's curve, lit on the outer edge */
    rc(15, -45, 2, 2, IRON[3]); rc(15, -23, 2, 2, IRON[3]);                                                                   /* its tips */
    if (!lo) { ln(16, -44, 2, -30, '#e8dcc0'); ln(2, -30, 16, -22, '#e8dcc0'); rc(1, -31, 4, 3, GLV); rc(-1, -28, 6, 2, TUN[1]);   /* the string drawn to his cheek, the drawing hand */
      ln(3, -30, 22, -48 - bob, '#8a6a40'); ln(4, -30, 23, -48 - bob, '#5a4228'); rc(22, -50 - bob, 3, 3, '#d8d0c0'); rc(23, -51 - bob, 1, 1, '#fff'); rc(1, -32, 2, 2, '#ff6b6b'); rc(2, -29, 2, 2, '#ff6b6b'); }   /* the arrow nocked, pointing high */
    else { ln(16, -44, 19, -33, '#e8dcc0'); ln(19, -33, 16, -22, '#e8dcc0'); rc(-1, -29, 5, 2, TUN[1]); rc(-2, -30, 3, 3, GLV);   /* the string snapped forward, the drawing hand flung back */
      for (let k = 0; k < 7; k++) { g.globalAlpha = 1 - k / 8; rc(22 + k * 2, -50 - k * 8, 2, 8, k ? '#ffd870' : '#fff6e0'); } g.globalAlpha = 1; } }   /* the arrow gone: a STREAK climbing out of frame */
}
/* (claude/beast3art) THE BREACH's RUBBLE STEP: a real heap over the 4 solid cells - the toppled section's foot: packed earth with stones, broken stakes jutting every way (splintered tips, lashings,
   an iron nail), a spill of sawdust and chips, tufts of the forest's grass, the walkable top kept flat at the cell row (16 px) so the step reads as a step. stage 2 piles it higher with plank ends. */
export function drawRubble(g, x0, x1, fy, stage) {
  const rc = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(R(a), R(b), R(w), R(h)); }, w = x1 - x0, H = k => { const v = Math.sin(k * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); };
  rc(x0 - 6, fy - 3, 6, 3, '#2a1a0e'); rc(x0 - 3, fy - 7, 3, 4, '#2a1a0e'); rc(x0 - 8, fy - 1, 3, 1, 'rgba(60,40,24,0.5)');   /* the spill running out to the west */
  rc(x0 - 2, fy - 18, w + 2, 18, OUT); rc(x0, fy - 16, w, 16, '#3a2616');                                                      /* the packed earth */
  for (let k = 0; k < Math.floor(w * 1.2); k++) { const a = x0 + H(k) * (w - 1), b = fy - 15 + H(k + 99) * 14; rc(a, b, 1 + (k & 1), 1, k % 3 ? '#2a1a0e' : '#5a3e24'); }   /* grit */
  for (let k = 0; k < 5; k++) { const a = x0 + 2 + H(k + 7) * (w - 12), b = fy - 13 + H(k + 31) * 8, sw = 5 + (k & 1) * 3; rc(a, b, sw, 4, '#1a1410'); rc(a, b, sw - 1, 3, k & 1 ? '#6a6670' : '#585460'); rc(a, b, sw - 2, 1, '#9a96a2'); }   /* stones */
  rc(x0, fy - 16, w, 2, '#6a4a2c'); rc(x0, fy - 16, w, 1, '#8a6a40');                                                        /* the trodden top */
  for (let k = 0; k < 7; k++) { const a = x0 + 2 + H(k + 3) * (w - 6); rc(a, fy - 19, 1, 3, '#4a6a24'); rc(a + 1, fy - 18, 1, 2, '#6a8a3a'); }   /* grass tufts on top */
  const stake = (a, b, ang, len, th, col) => { g.save(); g.translate(R(a), R(b)); g.rotate(ang); g.fillStyle = OUT; g.fillRect(-2, -th / 2 - 1, len + 3, th + 2); g.fillStyle = col; g.fillRect(-1, -th / 2, len, th); g.fillStyle = FR[4]; g.fillRect(-1, -th / 2, len, 1); g.fillStyle = MD[0]; g.fillRect(-1, th / 2 - 1, len, 1);
    g.fillStyle = FR[4]; g.beginPath(); g.moveTo(len - 1, -th / 2); g.lineTo(len + 4, -1); g.lineTo(len - 1, th / 2); g.fill(); g.fillStyle = '#fff6d0'; g.fillRect(len - 1, -1, 3, 1);   /* a splintered tip */
    g.fillStyle = ROPE[1]; g.fillRect(Math.floor(len * 0.4), -th / 2 - 1, 2, th + 2); g.restore(); };
  stake(x0 + 3, fy - 15, -0.35, 24, 4, FR[2]); stake(x0 + w * 0.34, fy - 13, -1.1, 21, 4, FR[1]); stake(x0 + w * 0.55, fy - 16, -0.2, 26, 4, FR[2]); stake(x0 + w * 0.8, fy - 12, -0.7, 20, 3, FR[1]); stake(x0 + w - 2, fy - 16, -2.5, 15, 4, FR[2]);   /* broken stakes jutting every way */
  stake(x0 + 4, fy - 9, 0.15, 17, 3, MD[2]);   /* one lying out over the face */
  rc(x0 + w * 0.5, fy - 17, 1, 2, IRON[4]); rc(x0 + w * 0.5 - 1, fy - 16, 3, 1, IRON[3]);                                       /* an iron nail */
  for (let k = 0; k < 9; k++) rc(x0 + 1 + H(k + 55) * (w - 2), fy - 17 - (k & 1), 2, 1, k % 3 ? '#c9a060' : '#e0c890');          /* sawdust, chips */
  if (stage > 1) { for (let k = 0; k < 3; k++) { rc(x0 + 6 + k * 15, fy - 22 - (k & 1) * 3, 14, 4, OUT); rc(x0 + 7 + k * 15, fy - 21 - (k & 1) * 3, 12, 2, MD[1]); rc(x0 + 7 + k * 15, fy - 21 - (k & 1) * 3, 12, 1, FR[3]); } }
}
/* (claude/beast3art) A ROLLING TIMBER: a palisade log seen end-on and ROLLING - rough bark with chips and knots that turn with it (rot), the cut end showing growth rings round a pith with a split, a lit top edge. wob tips it on the wall top. */
export function drawTimber(g, cx, cy, rot, wob = 0) {
  const rc = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(R(a), R(b), R(w), R(h)); }, x = R(cx + wob * 10), y = R(cy);
  for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) { const r = Math.sqrt(dx * dx + dy * dy); if (r > 8.1) continue; const an = Math.atan2(dy, dx) - rot;
    let c; if (r > 7.1) c = OUT; else if (r > 5.6) { const ch = Math.sin(an * 9) + Math.sin(an * 4 + 1) * 0.6; c = ch > 0.9 ? MD[3] : ch > 0.2 ? MD[2] : ch < -1 ? '#1a1008' : MD[1]; }   /* bark: ridges, a few lit chips and dark gouges, turning */
    else if (r > 4.6) c = FR[0]; else if (r > 3.6) c = FR[2]; else if (r > 2.7) c = FR[3]; else if (r > 1.8) c = FR[2]; else if (r > 1) c = FR[3]; else c = MD[0];   /* growth rings round the pith */
    g.fillStyle = c; g.fillRect(x + dx, y + dy, 1, 1); }
  for (let k = 1; k < 6; k++) { const a = rot + 0.3 + k * 0.03; g.fillStyle = MD[0]; g.fillRect(R(x + Math.cos(a) * k), R(y + Math.sin(a) * k), 1, 1); }   /* the split, turning */
  rc(x - 3, y - 8, 6, 1, FR[4]); rc(x - 6, y - 6, 2, 1, FR[4]); rc(x + 4, y - 6, 2, 1, FR[4]);                                      /* the lit top edge */
}
/* (claude/beast3art) a ROLLING TIMBER's dust trail: puffs lifting behind it (east, it rolls west), shrinking as they fade; t = clock seconds */
export function drawDustTrail(g, x, fy, t) {
  for (let k = 0; k < 6; k++) { const a = (t * 3 + k * 0.17) % 1, r = 2 + a * 4; g.globalAlpha = 0.6 * (1 - a); g.fillStyle = k & 1 ? '#c9a878' : '#a88a60'; g.fillRect(R(x + 8 + k * 6 + a * 6), R(fy - 3 - a * 9 - (k % 3)), R(r), R(r * 0.8)); } g.globalAlpha = 1;
}
/* (claude/beast3art) THE VOLLEY ORDER's LANE on the floor: warning-striped boards (hazard slashes in the wave's colour), a stake at each end flying a pennant, and a numbered SIGN PLATE on a post at its middle
   (the hands print the digit on it). col = the wave's colour, on = blink phase, soon = about to land. fy = the floor's screen y, l..r = the lane. returns the plate's centre x. */
export function drawLane(g, l, r, fy, col, on, soon) {
  const rc = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(R(a), R(b), R(w), R(h)); }, w = r - l, cx = R((l + r) / 2);
  rc(l, fy - 5, w, 5, OUT); rc(l, fy - 4, w, 3, '#2a1c12');
  for (let q = l - 2; q < r; q += 8) { const a = Math.max(l, q), b = Math.min(r, q + 4); if (b > a) { g.fillStyle = on ? col : '#fff6e0'; g.beginPath(); g.moveTo(Math.max(l, q + 4), fy - 4); g.lineTo(Math.min(r, q + 8), fy - 4); g.lineTo(Math.min(r, q + 4), fy - 1); g.lineTo(Math.max(l, q), fy - 1); g.closePath(); g.fill(); } }   /* hazard slashes */
  rc(l, fy - 5, w, 1, col);
  for (const [px, fl] of [[l, 1], [r - 2, -1]]) { rc(px, fy - 16, 2, 16, OUT); rc(px, fy - 16, 1, 16, '#8a6a40'); rc(px + 1, fy - 15, 1, 15, '#4a3018'); const pw = on ? 6 : 4; g.fillStyle = col; g.beginPath(); g.moveTo(fl > 0 ? px + 2 : px, fy - 16); g.lineTo(fl > 0 ? px + 2 + pw : px - pw, fy - 14); g.lineTo(fl > 0 ? px + 2 : px, fy - 11); g.fill(); }   /* end stakes with pennants */
  rc(cx - 1, fy - 19, 3, 15, OUT); rc(cx, fy - 19, 1, 15, '#8a6a40');                                                      /* the sign post */
  rc(cx - 7, fy - 33, 15, 14, OUT); rc(cx - 6, fy - 32, 13, 12, '#23140a'); rc(cx - 6, fy - 32, 13, 2, col); rc(cx - 6, fy - 32, 1, 12, col); rc(cx + 6, fy - 32, 1, 12, col); rc(cx - 6, fy - 21, 13, 1, col);   /* the plate: dark board, a coloured frame */
  if (soon) rc(cx - 8, fy - 34, 17, 1, '#fff6e0');
  return cx;
}
/* (claude/beast3art) an ARROW in flight (tip down) at (ax, ay = the tip): two-tone shaft, steel head, red and white fletching, a streak above it */
export function drawArrow(g, ax, ay) {
  const rc = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(R(a), R(b), R(w), R(h)); };
  g.globalAlpha = 0.3; rc(ax, ay - 40, 1, 24, '#fff6e0'); g.globalAlpha = 0.5; rc(ax, ay - 24, 1, 8, '#fff6e0'); g.globalAlpha = 1;
  rc(ax, ay - 16, 1, 16, '#8a6a40'); rc(ax + 1, ay - 16, 1, 16, '#4a3420'); rc(ax - 1, ay - 1, 4, 2, '#d8d0c0'); rc(ax, ay + 1, 2, 2, '#fff'); rc(ax, ay + 3, 1, 1, '#d8d0c0');
  rc(ax - 2, ay - 18, 2, 6, '#ff6b6b'); rc(ax + 2, ay - 18, 2, 6, '#e8dcc0'); rc(ax - 2, ay - 18, 1, 1, '#fff');
}
/* an arrow STANDING in the floor after it lands, a little earth thrown up round it */
export function drawArrowStuck(g, ax, fy, k) {
  const rc = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(R(a), R(b), R(w), R(h)); };
  rc(ax, fy - 10 - (k & 1), 1, 10 + (k & 1), '#8a6a40'); rc(ax + 1, fy - 10 - (k & 1), 1, 10 + (k & 1), '#4a3420'); rc(ax - 1, fy - 12 - (k & 1), 2, 4, '#ff6b6b'); rc(ax + 1, fy - 12 - (k & 1), 2, 4, '#e8dcc0'); rc(ax - 2, fy - 2, 5, 2, '#5a3e24'); rc(ax - 3, fy - 1, 2, 1, '#8a6a40');
}
/* (claude/beast3art) THE HORNSMAN, FALLING: his own sprite (arms flailing) tumbling off the gantry's back; t = seconds since the knock. (cx, cy) = where his body started, in screen pixels; f = the beast's facing (he goes off the back, -f); fy = the floor. Lands, lies, fades. */
let hornsmanSpr = null;
function hornsmanFallSprite() { if (!hornsmanSpr) { const [c, g] = canvas(CW, CH), d = D(g); handler(d, -6, -30, 'flail', 0, false, false); outline(c, OUT); hornsmanSpr = { c, ax: AX + R(-2 * K), ay: AY + R(-42 * K) }; } return hornsmanSpr; }
export function drawHornsmanFall(g, cx, cy, f, t, fy) {
  const sp = hornsmanFallSprite(), v0 = -150, gr = 700, vx = -f * 70, land = fy - 7;
  let y = cy + v0 * t + 0.5 * gr * t * t, x = cx + vx * t, hit = false, th = t;
  if (y >= land) { hit = true; const tl = (-v0 + Math.sqrt(v0 * v0 + 2 * gr * (land - cy))) / gr; th = t - tl; y = land; x = cx + vx * tl + vx * 0.25 * Math.min(th, 0.25); y -= th < 0.18 ? Math.sin(th / 0.18 * Math.PI) * 5 : 0; }
  const spin = hit ? (Math.PI / 2 + 0.25) : Math.min(1, t / 0.45) * (Math.PI / 2 + 0.25) + Math.sin(t * 22) * 0.05;
  g.save(); g.globalAlpha = hit && th > 0.9 ? Math.max(0, 1 - (th - 0.9) / 0.5) : 1; g.translate(R(x), R(y)); g.rotate(-f * spin); g.scale(-f, 1); g.drawImage(sp.c, -sp.ax, -sp.ay); g.restore(); g.globalAlpha = 1;
  if (hit && th < 0.6) for (let k = 0; k < 8; k++) { const a = th / 0.6, dx = (k - 3.5) * 5 * (0.3 + a), dy = -(2 + a * 8) * (1 - (k & 1) * 0.4); g.globalAlpha = (1 - a) * 0.7; g.fillStyle = k & 1 ? '#c9a878' : '#8a6a40'; g.fillRect(R(x + dx), R(fy - 2 + dy * 0.6), 3, 3); } g.globalAlpha = 1;
}
/* A SCAFFOLD of the clearing: deck on posts and braces, the PROP at its inner foot with its wedge (the verb), the dotted line where it will fall */
export function drawScaf(g, s, X, Y, floorY, time, lineCol, lineOf, up, shakeK = 0) {
  const rc = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  const fy = Y(floorY), x0 = X(s.x0), x1 = X(s.x1), dy = Y(s.deckY);
  if (s.st === 'stand' || s.st === 'fall') { const k = s.st === 'fall' ? 1 - s.t / up : 0;
    g.save(); g.translate(s.dir > 0 ? x1 : x0, fy); g.rotate(s.dir * k * k * Math.PI / 2); g.translate(-(s.dir > 0 ? x1 : x0), -fy);
    rc(x0 - 3, dy - 1, x1 - x0 + 6, 6, OUT); rc(x0 - 2, dy, x1 - x0 + 4, 1, FR[4]); rc(x0 - 2, dy + 1, x1 - x0 + 4, 3, FR[2]); rc(x0 - 2, dy + 4, x1 - x0 + 4, 1, MD[0]);   /* the deck */
    for (let x = x0 + 4; x < x1 - 4; x += 12) rc(x, dy + 1, 1, 3, MD[1]); for (const nx of [x0, x1 - 2]) rc(nx, dy + 2, 1, 1, IRON[3]);
    for (const px of [x0 + 2, x1 - 7]) { rc(px - 1, dy + 5, 7, fy - dy - 5, OUT); rc(px, dy + 5, 1, fy - dy - 5, FR[4]); rc(px + 1, dy + 5, 3, fy - dy - 5, FR[2]); rc(px + 4, dy + 5, 1, fy - dy - 5, FR[0]); rc(px - 1, dy + 12, 7, 3, ROPE[1]); rc(px - 1, dy + 28, 7, 3, ROPE[1]); }   /* two posts, lashed */
    g.strokeStyle = MD[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 6, dy + 6); g.lineTo(x1 - 8, fy - 2); g.moveTo(x1 - 8, dy + 6); g.lineTo(x0 + 6, fy - 2); g.stroke();   /* X-braces */
    if (shakeK > 0) { /* (claude/palisade2art) BATTERED: the posts SPLIT as the beat runs down (cracks, splinters standing out), the lashings fray and the deck gapes at its middle - the nearer it is to falling, the worse it looks */
      const nC = 1 + Math.floor(shakeK * 4), mid = (x0 + x1) / 2;
      for (const px of [x0 + 2, x1 - 7]) for (let c = 0; c < nC; c++) { const cy = dy + 8 + c * Math.max(5, (fy - dy - 14) / 4), zz = (c & 1) * 2; rc(px + 1 + zz, cy, 1, 2, OUT); rc(px + 2 - zz, cy + 2, 1, 2, OUT); rc(px + 4, cy + 1, 2, 1, FR[4]); rc(px - 2, cy + 3, 2, 1, FR[3]); }
      if (shakeK > 0.4) { rc(mid - 5, dy + 1, 10, 3, OUT); rc(mid - 4, dy + 4, 8, 1, MD[0]); rc(mid - 3, dy - 1, 1, 2, FR[4]); rc(mid + 2, dy - 2, 1, 3, FR[4]); }
      if (shakeK > 0.6) for (const px of [x0 + 2, x1 - 7]) { rc(px - 1, dy + 12, 7, 3, MD[0]); rc(px - 3, dy + 13, 2, 1, ROPE[1]); rc(px + 6, dy + 15, 2, 1, ROPE[1]); } }
    g.restore();
    if (s.st === 'fall') { const kk = 1 - s.t / up; if (kk > 0.55) { const ex = s.dir > 0 ? x1 : x0; for (let q = 0; q < 12; q++) { const dd = s.dir * (6 + q * 7 * kk), rr = (q * 7) % 5; g.fillStyle = q % 3 ? 'rgba(190,160,112,0.65)' : 'rgba(230,206,160,0.5)'; g.fillRect(R(ex + dd), R(fy - 2 - rr - (q % 3) * 3), 5, 3); } } }   /* (claude/palisade2art) the collapse throws up dust along its fall line */
    if (s.st === 'stand') { const px = X(s.x); drawProp(g, px, fy, s.dir, true, time, s.id * 7 + 3);   /* THE PROP at its inner foot: the wedge, the rope, the strain, the glint */
      if (lineCol) { const [lo, hi] = lineOf(s); g.fillStyle = lineCol; for (let q = lo; q < hi; q += 8) g.fillRect(X(q), fy - 1, 5, 2); } }
    return; }
  if (s.st === 'down' || s.st === 'pin') { const [lo, hi] = lineOf(s);   /* THE WRECK */
    for (let q = lo; q < hi; q += 11) { const h = 6 + ((q / 11) % 2) * 4; rc(X(q) - 1, fy - h - 4, 14, 6, OUT); rc(X(q), fy - h - 3, 12, 4, FR[2]); rc(X(q), fy - h - 3, 12, 1, FR[4]); rc(X(q) + 4, fy - 15, 4, 15, MD[1]); rc(X(q) + 4, fy - 15, 1, 15, FR[3]); rc(X(q) + 6, fy - h - 2, 2, 2, IRON[3]); }
    for (let q = lo + 6; q < hi; q += 24) { rc(X(q), fy - 3, 18, 3, MD[0]); rc(X(q) + 2, fy - 4, 2, 1, FR[4]); } return; }
  if (s.st === 'spent') { rc(x0 + 2, fy - 5, 4, 5, MD[0]); rc(x1 - 6, fy - 5, 4, 5, MD[0]); rc(x0 + 1, fy - 6, 2, 1, FR[4]);
    if (s.t < 2) { const k = 1 - s.t / 2; for (const px of [x0 + 2, x1 - 6]) { rc(px, fy - (fy - dy) * k, 4, (fy - dy) * k, FR[1]); rc(px, fy - (fy - dy) * k, 1, (fy - dy) * k, FR[3]); } rc(x0, fy - (fy - dy) * k - 3, x1 - x0, 3, FR[2]); } }
}
/* ============================== (claude/palisade2art) PITCH ============================== */
/* a PITCH POT in flight: a clay pot banded with rope and a rag wick trailing a flame and embers; it turns end over end as it flies */
export function drawPot(g, x, y, ang, time) {
  const rc = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(R(a), R(b), R(w), R(h)); };
  g.save(); g.translate(R(x), R(y)); g.rotate(ang);
  rc(-5, -5, 10, 10, OUT); rc(-4, -4, 8, 8, '#8a4a22'); rc(-4, -4, 2, 8, '#b8743a'); rc(2, -4, 2, 8, '#5a2e14'); rc(-4, -1, 8, 2, ROPE[1]); rc(-4, -1, 8, 1, ROPE[2]); rc(-2, -6, 4, 2, '#3a2010'); rc(-1, -8, 2, 3, '#e8dcc0');   /* the clay, its rope band, its neck and rag wick */
  g.restore();
  const fl = Math.floor(time * 18) % 2; rc(x - 2, y - 14 - fl, 4, 6 + fl, '#ff6a1a'); rc(x - 1, y - 16 - fl, 2, 5, '#ffd36b'); rc(x, y - 17 - fl, 1, 2, '#fff6d0');
  for (let k = 0; k < 4; k++) { const a = (time * 7 + k * 0.37) % 1; g.globalAlpha = 1 - a; rc(x - 8 - k * 5 + Math.sin(time * 20 + k) * 2, y - 10 + a * 14 + k, 2, 2, k & 1 ? '#ffd36b' : '#ff8a2a'); } g.globalAlpha = 1;   /* embers falling behind it */
}
/* BURNING PITCH on the floor: a black glossy pool, tongues of flame of three heights, embers rising, a smudge of smoke; it gutters as its life runs out (a = 0..1) */
export function drawPitch(g, fx, fy, r, a, time) {
  const rc = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  g.globalAlpha = 0.9 * Math.min(1, a * 1.4); rc(fx - r - 2, fy - 3, r * 2 + 4, 3, '#0e0604'); rc(fx - r, fy - 3, r * 2, 1, '#3a2418'); for (let q = -r + 3; q < r - 2; q += 7) rc(fx + q, fy - 2, 2, 1, '#6a4a34');   /* the tar: a sheen */
  const n = Math.max(3, Math.floor(r / 3));
  for (let k = 0; k < n; k++) { const x = fx - r + 2 + k * (r * 2 - 4) / (n - 1), ph = time * 9 + k * 1.9, h = (5 + 5 * (0.5 + 0.5 * Math.sin(ph))) * (0.35 + 0.65 * Math.min(1, a * 1.6)) * (k === 0 || k === n - 1 ? 0.7 : 1);
    g.globalAlpha = 0.95 * Math.min(1, a * 2); rc(x - 3, fy - 3 - h, 6, h, '#c8281e'); rc(x - 2, fy - 3 - h - 2, 4, h, '#ff6a1a'); rc(x - 1, fy - 3 - h - 4, 2, h - 1, '#ffb03a'); rc(x, fy - 3 - h * 0.7, 1, h * 0.6, '#fff0b0'); }
  for (let k = 0; k < 5; k++) { const t = (time * 0.9 + k * 0.23) % 1; g.globalAlpha = (1 - t) * Math.min(1, a * 2); rc(fx - r + 4 + ((k * 13) % (r * 2 - 6)) + Math.sin(time * 6 + k) * 2, fy - 8 - t * 26, 1, 1, k & 1 ? '#ffd36b' : '#ff8a2a'); }   /* embers lifting */
  for (let k = 0; k < 3; k++) { const t = (time * 0.6 + k * 0.33) % 1; g.globalAlpha = 0.28 * (1 - t) * Math.min(1, a * 2); rc(fx - 6 + k * 6 + Math.sin(time * 3 + k) * 3, fy - 18 - t * 24, 5, 4, '#1a1210'); }   /* smoke */
  g.globalAlpha = 1;
}
export const _mix = mix;
