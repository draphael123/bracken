// waymeet.js — WAYMEET's own people: the paladin at the chapel, the serjeants on the bridge, and the beer garden.
// All frames face RIGHT (L is the flip). Every frame of a set shares one canvas, so the anchor holds across frames.
// Anchors follow chars.js: ax = the body's centre column, ay = the outline row just under the feet (feet on ay-1).
// These are PAINTED, not typed: limbs are two-bone chains solved from hip to foot, plates and cloth are polygons,
// and the whole frame takes the one dark outline every sprite in the game wears.
//
// bakePaladinBoss()  THE PALADIN (id closedhelm) — white plate with gold at every edge, a great helm crowned in gold
//   with a cross on its face and a white crest down the back, a white tabard with the gold sun on it, a blue cloak,
//   a kite shield carrying the same sun, and a longsword. His ward is drawn by main.js, not baked.
//   frames: 0 idle  1 walk A  2 walk B  3 cut tell (sword high behind)  4 cut (swept down in front)
//           5 thrust tell (drawn back at the hip)  6 thrust (arm and blade straight out)
//           7 bash tell (crouched behind the shield)  8 bash (lunging, shield first)
//           9 judgement tell (sword straight up)  10 judgement (knelt, sword into the ground)
//           11 BROKEN (the ward is down: flung open, shield wide, head back)  12 death (knelt, head bowed)  13 hurt
//   canvas 100x100   anchor ax 44, ay 92   figure ~64 px feet to crest
//
// bakeLancer(red)  THE SERJEANT — a mounted man-at-arms on a barded horse: kettle-helmed, blue surcoat, heater shield,
//   a lance with a pennon, and a sword at his hip he draws when you are too close for the lance. Unhorsed he fights on
//   foot. (red = the Serjeant of the Lists, the tilt-yard's own.)
//   frames: 0 walk A  1 walk B  2 gallop A  3 gallop B  4 charge tell (the horse up, the lance coming down)
//           5 wheel (reared round)  6 swipe tell (sword up)  7 swipe  8 blown (head down after a charge)
//           9 foot stand  10 foot walk  11 foot cut tell  12 foot cut  13 unhorsed (sat in the road)
//           14 mounted hurt  15 foot hurt
//   canvas 80x76   anchor ax 36, ay 72
// bakeLancerHorse()  the horse that goes on without him: 0 gallop A  1 gallop B (same canvas and anchor)
//
// bakeGuests()  THE BEER GARDEN — five drinkers, each [idle, drink, laugh]: v0 a carter on a bench, v1 a knight with his
//   helm off on a bench, v2 a goodwife on a bench, v3 a lad standing, v4 an old soldier standing.
//   canvas 22x34   anchor ax 10, ay 32
// bakeBarkeep()  THE TAPSTER — bald, a moustache, a leather apron and a cloth: 0 idle, 1 the tankard up.
import { canvas, fillPoly, ellipse, rect, line, px, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
/* A THICK LIMB is a quad from joint to joint, a little narrower at the far end */
function limb(g, x0, y0, x1, y1, w0, w1, col) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  fillPoly(g, [[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]], col);
}
/* TWO BONES, SOLVED: the knee (or elbow) bends to the side `s` says, and a chain too short to reach just straightens */
function ik(ax, ay, bx, by, l1, l2, s) {
  const dx = bx - ax, dy = by - ay, d = Math.min(l1 + l2 - 0.01, Math.max(0.01, Math.hypot(dx, dy)));
  const base = Math.atan2(dy, dx), a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  return [ax + Math.cos(base - s * a) * l1, ay + Math.sin(base - s * a) * l1];
}
/* EVERY SET IS CHECKED AT BAKE TIME (rules G: a clipped frame and a fitted one look the same once baked): a frame whose
   paint reaches its own border throws here, not in a playtest */
function assertFits(c, name, i) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height;
  for (let x = 0; x < W; x++) if (d[x * 4 + 3] || d[((H - 1) * W + x) * 4 + 3]) throw new Error(name + ' frame ' + i + ' touches its top or bottom edge');
  for (let y = 0; y < H; y++) if (d[(y * W) * 4 + 3] || d[(y * W + W - 1) * 4 + 3]) throw new Error(name + ' frame ' + i + ' touches its left or right edge');
}
const finish = (frames, name) => frames.map((c, i) => { outline(c, OUT); assertFits(c, name, i); return c; });

// ======================================================================================================================
export function bakePaladinBoss() {
  const W = 100, H = 100, CX = 44, G = 92;
  const C = { S: '#eef2f6', s: '#bcc6d2', d: '#848fa2', D: '#4f5768', y: '#f2cc58', Y: '#b08a2c', w: '#f7f2e4', w2: '#d6cdb6',
    b: '#3d5eb0', B: '#253b7c', k: '#2c4690', K: '#1b2a5e', blade: '#f4f8ff', edge: '#9fb0ca', glow: '#fff3b0', grip: '#5a3a22' };
  const frame = o => {
    const { lean = 0, dy = 0, fl = [8, 0], bl = [-7, 0], hand = [4, 16], a = 1.2, L = 28, shield = [9, 16], shW = 1, cape = 0, tilt = 0, bowed = 0, kneel = false, shLow = false, glow = false } = o;
    const [c, g] = canvas(W, H);
    const hx = CX + lean * 0.35, hy = G - 26 + dy, sx = CX + lean, sy = G - 46 + dy;
    const P = (pts, k) => fillPoly(g, pts, C[k]);
    // THE CLOAK, behind everything: off both shoulders and down to his heels, flaring out behind as he moves
    P([[sx - 9, sy + 1], [sx + 1, sy + 1], [hx - 4, G - 5], [hx - 16 - cape, G - 3], [sx - 15 - cape * 0.6, sy + 26]], 'k');
    P([[sx - 9, sy + 3], [sx - 6, sy + 3], [hx - 12 - cape, G - 4], [hx - 16 - cape, G - 3]], 'K');
    line(g, sx - 4, sy + 6, hx - 8 - cape * 0.5, G - 5, C.K);
    // THE BACK LEG
    const legs = (foot, near) => {
      const fx = CX + foot[0], fy = G - 1 - foot[1], hipX = hx + (near ? 3 : -3);
      const [kx, ky] = kneel && !near ? [hipX + 4, G - 4] : ik(hipX, hy, fx, fy - 3, 14, 13, 1);
      const col = near ? 'S' : 'd', col2 = near ? 's' : 'D';
      limb(g, hipX, hy, kx, ky, 8, 6, C[col2]); limb(g, hipX, hy, kx, ky, 5, 4, C[col]);
      limb(g, kx, ky, fx, fy - 3, 6, 5, C[col2]); limb(g, kx, ky, fx, fy - 3, 3, 3, C[col]);
      if (kneel && !near) P([[kx - 2, G - 6], [kx + 3, G - 6], [fx - 6, G - 1], [kx - 3, G - 1]], col2);
      else P([[fx - 4, fy - 4], [fx + 3, fy - 4], [fx + 6, fy], [fx - 4, fy]], near ? 's' : 'D');   /* the sabaton */
      circle(g, kx, ky, 2.4, C[near ? 'y' : 'Y']);                                                    /* the knee cop's gold */
    };
    legs(bl, false);
    // THE SWORD ARM, the far one: shoulder to hand, and the hand closes on the grip
    const hX = sx + hand[0], hY = sy + hand[1];
    const [ex, ey] = ik(sx - 5, sy + 3, hX, hY, 11, 11, -1);
    limb(g, sx - 5, sy + 3, ex, ey, 6, 5, C.D); limb(g, ex, ey, hX, hY, 5, 4, C.d);
    const sword = () => {
      const ca = Math.cos(a), sa = Math.sin(a), tx = hX + ca * L, ty = Math.min(G + 1, hY + sa * L), nx = -sa, ny = ca;
      if (glow) { g.globalAlpha = 0.55; limb(g, hX + ca * 4, hY + sa * 4, tx, ty, 7, 4, C.glow); g.globalAlpha = 1; }
      P([[hX + ca * 4 + nx * 1.6, hY + sa * 4 + ny * 1.6], [tx - ca * 3 + nx * 1.4, ty - sa * 3 + ny * 1.4], [tx, ty], [tx - ca * 3 - nx * 1.4, ty - sa * 3 - ny * 1.4], [hX + ca * 4 - nx * 1.6, hY + sa * 4 - ny * 1.6]], 'blade');
      line(g, hX + ca * 5, hY + sa * 5, tx - ca * 3, ty - sa * 3, C.edge);                         /* the fuller */
      limb(g, hX + ca * 3 + nx * 5, hY + sa * 3 + ny * 5, hX + ca * 3 - nx * 5, hY + sa * 3 - ny * 5, 2, 2, C.y);   /* the cross */
      limb(g, hX - ca * 3, hY - sa * 3, hX + ca * 2, hY + sa * 2, 2, 2, C.grip);
      circle(g, hX - ca * 4, hY - sa * 4, 1.6, C.y);                                                /* the pommel */
      circle(g, hX, hY, 2.3, C.s);                                                                  /* the gauntlet */
    };
    if (o.swordBack) sword();
    // THE BODY: breastplate, then the tabard over it, the sun on his chest and the gold belt
    P([[sx - 10, sy], [sx + 10, sy], [hx + 8, hy - 1], [hx - 8, hy - 1]], 's');
    P([[sx + 2, sy + 1], [sx + 9, sy + 1], [hx + 7, hy - 2], [hx + 2, hy - 2]], 'S');
    P([[sx - 7, sy + 4], [sx + 8, sy + 4], [hx + 11, hy + 13], [hx - 10, hy + 13]], 'w');
    P([[sx - 7, sy + 4], [sx - 5, sy + 4], [hx - 8, hy + 13], [hx - 10, hy + 13]], 'w2');
    line(g, sx - 7, sy + 4, hx - 10, hy + 13, C.b); line(g, sx + 8, sy + 4, hx + 11, hy + 13, C.b); line(g, hx - 10, hy + 13, hx + 11, hy + 13, C.b);
    { const ox = (sx + hx) / 2 + 1, oy = sy + 12; circle(g, ox, oy, 3.4, C.y); circle(g, ox, oy, 1.6, C.w);
      for (const [rx, ry] of [[0, -6], [0, 6], [-6, 0], [6, 0], [-4, -4], [4, -4], [-4, 4], [4, 4]]) px(g, ox + rx, oy + ry, C.Y); }
    rect(g, hx - 9, hy - 2, 19, 3, C.Y); rect(g, hx - 9, hy - 2, 19, 1, C.y);
    line(g, hx, hy + 1, hx + (kneel ? 2 : 0), hy + 13, C.w2);                                        /* the tabard parts between his legs */
    legs(fl, true);
    // THE PAULDRONS: the far one dark, the near one big and gold-rimmed
    ellipse(g, sx - 8, sy + 2, 5, 4, C.d);
    // THE HELM: a great helm, crowned, with the cross down its face, the slit lit, and a white crest down the back
    const hcx = sx + 1 + tilt, hcy = sy - 9 + bowed;
    P([[hcx - 2, hcy - 8], [hcx - 12, hcy - 3], [hcx - 13, hcy + 6], [hcx - 7, hcy + 1], [hcx - 3, hcy - 5]], 'w');   /* the crest */
    line(g, hcx - 3, hcy - 7, hcx - 12, hcy + 4, C.w2);
    P([[hcx - 6, hcy - 7], [hcx + 5, hcy - 7], [hcx + 7, hcy - 3], [hcx + 7, hcy + 7], [hcx - 6, hcy + 7]], 's');
    P([[hcx + 1, hcy - 7], [hcx + 5, hcy - 7], [hcx + 7, hcy - 3], [hcx + 7, hcy + 7], [hcx + 1, hcy + 7]], 'S');
    rect(g, hcx - 6, hcy - 8, 13, 2, C.y); px(g, hcx - 5, hcy - 10, C.y); px(g, hcx, hcy - 10, C.y); px(g, hcx + 5, hcy - 10, C.y);   /* the crown */
    rect(g, hcx - 1, hcy - 1, 8, 2, C.D); rect(g, hcx + 1, hcy - 1, 5, 1, C.glow);                     /* the slit, and the light in it */
    rect(g, hcx + 3, hcy - 6, 1, 13, C.y); rect(g, hcx + 1, hcy + 3, 6, 1, C.y);                        /* the cross */
    rect(g, hcx - 6, hcy + 7, 13, 2, C.d);                                                            /* the gorget */
    ellipse(g, sx + 7, sy + 2, 6, 5, C.s); ellipse(g, sx + 8, sy + 1, 4, 3, C.S);
    for (let i = -5; i <= 5; i++) px(g, sx + 7 + i, sy + 7 - Math.round(Math.abs(i) * 0.4), C.y);
    if (!o.swordBack) sword();
    // THE SHIELD ARM AND THE SHIELD: a kite, white, the blue border, the gold sun
    { const cx2 = sx + shield[0], cy2 = sy + shield[1], w = Math.round(9 * shW), top = shLow ? 8 : 12, bot = shLow ? 10 : 15;
      const [ex2, ey2] = ik(sx + 7, sy + 4, cx2 - 2, cy2 - 2, 9, 9, 1); limb(g, sx + 7, sy + 4, ex2, ey2, 6, 5, C.s);
      const pts = [[cx2 - w, cy2 - top], [cx2 + w, cy2 - top], [cx2 + w, cy2 + 2], [cx2, cy2 + bot], [cx2 - w, cy2 + 2]];
      if (glow === 'shield') { g.globalAlpha = 0.5; fillPoly(g, pts.map(([x, y]) => [x + Math.sign(x - cx2) * 3, y + Math.sign(y - cy2) * 3]), C.glow); g.globalAlpha = 1; }
      P(pts, 'b');
      P([[cx2 - w + 2, cy2 - top + 2], [cx2 + w - 2, cy2 - top + 2], [cx2 + w - 2, cy2 + 1], [cx2, cy2 + bot - 3], [cx2 - w + 2, cy2 + 1]], 'w');
      P([[cx2 + 1, cy2 - top + 2], [cx2 + w - 2, cy2 - top + 2], [cx2 + w - 2, cy2 + 1], [cx2 + 1, cy2 + bot - 3]], 'w2');
      rect(g, cx2 - 1, cy2 - top + 3, 2, top + bot - 6, C.y); rect(g, cx2 - w + 3, cy2 - top + 7, 2 * w - 6, 2, C.y);
      circle(g, cx2, cy2 - top + 8, 2.6, C.y); px(g, cx2, cy2 - top + 8, C.w); }
    return c;
  };
  const F = [
    /* 0 */ frame({}),
    /* 1 */ frame({ fl: [11, 0], bl: [-9, 2], dy: -1, hand: [4, 15], cape: 1 }),
    /* 2 */ frame({ fl: [4, 2], bl: [-3, 0], dy: 0, hand: [5, 17] }),
    /* 3 THE CUT, TOLD: the sword goes up and back over his head and he rocks back onto the rear foot */
    frame({ lean: -3, fl: [11, 0], bl: [-10, 0], hand: [-3, -8], a: -2.05, L: 30, shield: [8, 14], cape: 2, tilt: -1, swordBack: true }),
    /* 4 */ frame({ lean: 4, dy: 2, fl: [14, 0], bl: [-12, 0], hand: [14, 10], a: 0.95, L: 30, shield: [4, 18], cape: 3 }),
    /* 5 THE THRUST, TOLD: low and drawn back, the point already on you */
    frame({ lean: -2, dy: 3, fl: [11, 0], bl: [-11, 0], hand: [-8, 15], a: -0.05, L: 30, shield: [2, 12], cape: 2 }),
    /* 6 */ frame({ lean: 6, dy: 2, fl: [16, 0], bl: [-13, 0], hand: [13, 10], a: 0.02, L: 30, shield: [0, 14], cape: 4 }),
    /* 7 THE BASH, TOLD: down behind the shield, and the shield is lit */
    frame({ lean: -4, dy: 5, fl: [11, 0], bl: [-12, 0], hand: [-9, 14], a: 2.5, L: 26, shield: [10, 12], shW: 1.1, cape: 1, glow: 'shield', swordBack: true }),
    /* 8 */ frame({ lean: 8, dy: 2, fl: [17, 0], bl: [-15, 1], hand: [-6, 12], a: 2.75, L: 26, shield: [17, 11], shW: 1.1, cape: 5, glow: 'shield', swordBack: true }),
    /* 9 JUDGEMENT, TOLD: the sword straight up over him, lit, and the shield let down */
    frame({ lean: -1, fl: [7, 0], bl: [-8, 0], hand: [3, -12], a: -1.57, L: 27, shield: [11, 22], shLow: true, tilt: -1, bowed: -1, glow: true }),
    /* 10 */ frame({ dy: 9, kneel: true, fl: [13, 0], bl: [-8, 0], hand: [12, 12], a: 1.5, L: 30, shield: [3, 18], cape: 1, bowed: 2, glow: true }),
    /* 11 BROKEN: the ward is down and he is wide open */
    frame({ lean: -6, dy: 5, fl: [12, 0], bl: [-8, 0], hand: [8, 22], a: 2.3, L: 26, shield: [-13, 22], shLow: true, cape: 4, tilt: -2, swordBack: true }),
    /* 12 */ frame({ dy: 15, kneel: true, fl: [9, 0], bl: [-6, 0], hand: [10, 12], a: 1.52, L: 30, shield: [-10, 24], shLow: true, bowed: 3 }),
    /* 13 */ frame({ lean: -5, dy: 2, fl: [9, 0], bl: [-9, 0], hand: [3, 18], a: 1.9, L: 27, shield: [5, 15], cape: 3, tilt: -2 }),
  ];
  return pack(finish(F, 'paladin'), CX, G, 24, 52);
}

// ======================================================================================================================
function lancerFrames(red, riderless) {
  const W = 80, H = 76, CX = 36, G = 72;
  const C = { coat: '#8a6a4a', coatD: '#5e4430', coatL: '#a8845c', mane: '#2e2018', hoof: '#2a2420',
    bard: red ? '#a23a34' : '#3a5a8a', bardD: red ? '#6e2420' : '#26406a', trim: '#e0b040', trimD: '#a07a24',
    s: '#c9d1dc', S: '#eef2f6', d: '#7d8796', D: '#4c5462', skin: '#e0b090', sur: red ? '#c9463d' : '#3a5a8a', surD: red ? '#8a2a26' : '#26406a',
    wood: '#8a5a32', woodD: '#5a3a1e', pen: red ? '#f2ece0' : '#e0b040', blade: '#f2f7ff', white: '#f2ece0' };
  const P = (g, pts, k) => fillPoly(g, pts, C[k]);
  const horse = (g, o) => {
    const { gait = 0, rear = 0, headDown = 0, headUp = 0 } = o;
    const bx = CX, by = G - 25 - rear * 2;
    const tiltY = x => (x - bx) * -rear * 0.18;   /* rearing lifts the front of him */
    // the tail
    limb(g, bx - 15, by - 3 + tiltY(bx - 15), bx - 21 - gait * 2, by + 13, 4, 2, C.mane);
    // legs: [hip x offset, foot x offset, foot lift] for the far pair then the near pair
    const gaitLegs = [
      [[-10, -12, 0], [9, 8, 0], [-7, -6, 0], [12, 12, 0]],                 /* 0 walk A */
      [[-10, -7, 2], [9, 12, 0], [-7, -10, 0], [12, 9, 3]],                 /* 1 walk B */
      [[-10, -20, 4], [9, 20, 5], [-7, -16, 1], [12, 24, 3]],               /* 2 gallop A: stretched */
      [[-10, -3, 5], [9, 3, 6], [-7, 0, 3], [12, 6, 5]],                    /* 3 gallop B: gathered */
      [[-10, -12, 0], [9, 16, 12], [-7, -8, 0], [12, 20, 16]],              /* 4 up in front */
    ][o.legs || 0];
    gaitLegs.forEach(([hxo, fxo, lift], i) => { const near = i >= 2, hipX = bx + hxo, hipY = by + 4 + tiltY(hipX), fx = bx + fxo, fy = G - 1 - lift;
      const front = hxo > 0; const [kx, ky] = ik(hipX, hipY, fx, fy - 2, 9, 9, front ? -1 : 1);
      limb(g, hipX, hipY, kx, ky, 5, 3, near ? C.coat : C.coatD); limb(g, kx, ky, fx, fy - 2, 3, 2, near ? C.coat : C.coatD);
      rect(g, fx - 2, fy - 2, 4, 2, C.hoof); });
    // the body, the neck and the head
    ellipse(g, bx, by + 1, 16, 8, C.coat); ellipse(g, bx + 2, by - 2, 12, 4, C.coatL);
    const nx = bx + 12, ny = by - 4 + tiltY(bx + 12), hx = bx + 23 + headDown * 2, hy = by - 16 - headUp * 3 + headDown * 12 + tiltY(bx + 20);
    limb(g, nx, ny, hx - 3, hy + 3, 10, 6, C.coat);
    P(g, [[hx - 4, hy - 2], [hx + 2, hy - 3], [hx + 9, hy + 4 + headDown], [hx + 8, hy + 7 + headDown], [hx + 1, hy + 6], [hx - 5, hy + 4]], 'coat');
    rect(g, hx + 7, hy + 5 + headDown, 2, 2, C.coatD); px(g, hx + 1, hy, C.mane);
    P(g, [[hx - 3, hy - 2], [hx - 1, hy - 6], [hx + 1, hy - 3]], 'coatD');                               /* the ear */
    limb(g, nx - 2, ny - 3, hx - 3, hy - 2, 3, 2, C.mane);                                               /* the mane */
    // THE BARDING: cloth over his back and neck, the hem scalloped, gold at the edge
    const hem = by + 7;
    P(g, [[bx - 16, by - 4 + tiltY(bx - 16)], [bx + 13, by - 6 + tiltY(bx + 13)], [bx + 15, hem + tiltY(bx + 15)], [bx - 17, hem + tiltY(bx - 17)]], 'bard');
    P(g, [[bx + 9, by - 6 + tiltY(bx + 9)], [nx + 5, ny - 6], [hx - 2, hy + 3], [nx + 4, ny + 5]], 'bard');
    for (let x = bx - 16; x <= bx + 14; x += 4) { P(g, [[x, hem + tiltY(x)], [x + 4, hem + tiltY(x + 4)], [x + 2, hem + 3 + tiltY(x + 2)]], 'bardD'); }
    line(g, bx - 17, hem + tiltY(bx - 17), bx + 15, hem + tiltY(bx + 15), C.trim);
    line(g, bx - 16, by - 4 + tiltY(bx - 16), bx + 13, by - 6 + tiltY(bx + 13), C.trimD);
    return { saddleX: bx - 2, saddleY: by - 6 + tiltY(bx - 2) };
  };
  /* THE MAN: a kettle hat, mail, the surcoat, and whatever is in his hands */
  const man = (g, o, ox, oy, mounted) => {
    const { lean = 0, weapon = 'up', swordA = 0, head = 0, legPose = 0, sit = false } = o;
    const hipX = ox, hipY = oy, shX = ox + lean + 1, shY = oy - 12;
    if (mounted) { limb(g, hipX + 1, hipY, hipX + 6, hipY + 7, 4, 3, C.D); limb(g, hipX + 6, hipY + 7, hipX + 5, hipY + 14, 3, 3, C.d); rect(g, hipX + 3, hipY + 13, 5, 2, C.D); }
    else if (sit) { limb(g, hipX, hipY, hipX + 9, hipY + 1, 4, 3, C.d); rect(g, hipX + 8, hipY - 1, 3, 3, C.D); limb(g, hipX - 1, hipY, hipX + 6, hipY + 2, 4, 3, C.D); }
    else { const st = [[[-3, 0], [4, 0]], [[-5, 1], [6, 0]], [[-6, 0], [7, 0]]][legPose];
      for (const [k, [fx]] of st.entries()) { const [kx, ky] = ik(hipX, hipY, hipX + fx, G - 2, 7, 7, 1); limb(g, hipX, hipY, kx, ky, 4, 3, k ? C.d : C.D); limb(g, kx, ky, hipX + fx, G - 2, 3, 3, k ? C.d : C.D); rect(g, hipX + fx - 2, G - 3, 5, 2, C.D); } }
    // lance or sword held behind the body
    if (weapon === 'up' && mounted) { limb(g, shX + 3, shY + 24, shX + 14, shY - 22, 2, 2, C.wood); P(g, [[shX + 14, shY - 22], [shX + 13, shY - 16], [shX + 20, shY - 18]], 'pen'); P(g, [[shX + 14, shY - 24], [shX + 15, shY - 21], [shX + 13, shY - 21]], 's'); }
    if (weapon === 'mid' && mounted) { limb(g, shX - 8, shY + 2, shX + 34, shY - 10, 2.5, 2, C.wood); P(g, [[shX + 34, shY - 10], [shX + 30, shY - 7], [shX + 33, shY - 13]], 's'); }
    // torso: mail under the surcoat, and the belt
    P(g, [[shX - 5, shY], [shX + 5, shY], [hipX + 5, hipY], [hipX - 5, hipY]], 'd');
    P(g, [[shX - 4, shY + 2], [shX + 5, shY + 2], [hipX + 6, hipY + 3], [hipX - 5, hipY + 3]], 'sur');
    P(g, [[shX - 4, shY + 2], [shX - 2, shY + 2], [hipX - 3, hipY + 3], [hipX - 5, hipY + 3]], 'surD');
    rect(g, hipX - 5, hipY - 1, 11, 1, C.woodD); px(g, hipX + 1, hipY - 1, C.trim);
    // the head: a kettle hat with its brim, and a face under it
    const hx = shX + 1 + head, hy = shY - 5;
    rect(g, hx - 3, hy - 2, 7, 6, C.skin); rect(g, hx + 2, hy, 1, 1, C.D);
    P(g, [[hx - 3, hy - 7], [hx + 4, hy - 7], [hx + 5, hy - 3], [hx - 4, hy - 3]], 's');
    rect(g, hx - 6, hy - 3, 13, 2, C.d); rect(g, hx - 5, hy - 3, 11, 1, C.S);
    // the shield on the near arm
    const shield = (x, y) => { P(g, [[x - 4, y - 5], [x + 4, y - 5], [x + 4, y + 1], [x, y + 6], [x - 4, y + 1]], 'surD'); P(g, [[x - 3, y - 4], [x + 3, y - 4], [x + 3, y + 1], [x, y + 4], [x - 3, y + 1]], 'white'); rect(g, x - 1, y - 4, 2, 7, C.sur); rect(g, x - 3, y - 2, 6, 2, C.sur); };
    // arms and the weapon in front
    if (weapon === 'couched' && mounted) { limb(g, shX + 1, shY + 3, shX + 5, shY + 8, 3, 3, C.d); limb(g, shX - 12, shY + 5, shX + 38, shY + 3, 3, 2, C.wood); line(g, shX - 12, shY + 4, shX + 34, shY + 2, C.woodD);
      P(g, [[shX + 38, shY + 1], [shX + 42, shY + 3], [shX + 38, shY + 5]], 'S'); P(g, [[shX + 26, shY + 1], [shX + 33, shY - 3], [shX + 30, shY + 2]], 'pen'); rect(g, shX + 3, shY + 2, 3, 4, C.woodD); }
    if (weapon === 'sword') { const a = swordA, hxs = shX + 3 + Math.cos(a - 0.6) * 6, hys = shY + 3 + Math.sin(a - 0.6) * 6;
      limb(g, shX + 1, shY + 3, hxs, hys, 3, 3, C.d);
      limb(g, hxs, hys, hxs + Math.cos(a) * 15, hys + Math.sin(a) * 15, 2.5, 1.5, C.blade); limb(g, hxs - Math.sin(a) * 3, hys + Math.cos(a) * 3, hxs + Math.sin(a) * 3, hys - Math.cos(a) * 3, 1.5, 1.5, C.trim); }
    if (weapon === 'up' || weapon === 'mid') limb(g, shX + 1, shY + 3, shX + 6, shY + 7, 3, 3, C.d);
    shield(shX + (mounted ? 5 : 6), shY + 7);
  };
  const mounted = (o) => { const [c, g] = canvas(W, H); const s = horse(g, o); if (!riderless) man(g, o, s.saddleX, s.saddleY, true); return c; };
  const onFoot = (o) => { const [c, g] = canvas(W, H); man(g, o, CX, G - 15, false); return c; };
  const sitting = () => { const [c, g] = canvas(W, H); man(g, { head: -1, sit: true, weapon: 'none', lean: -2 }, CX, G - 4, false);
    P(g, [[CX + 10, G - 3], [CX + 16, G - 2], [CX + 12, G - 1]], 'd'); return c; };   /* the helm off, in the road beside him */
  if (riderless) return [mounted({ legs: 2 }), mounted({ legs: 3 })];
  return [
    mounted({ legs: 0 }), mounted({ legs: 1 }),
    mounted({ legs: 2, weapon: 'couched', lean: 2 }), mounted({ legs: 3, weapon: 'couched', lean: 2 }),
    mounted({ legs: 4, rear: 2, headUp: 1, weapon: 'mid', lean: -1 }),
    mounted({ legs: 4, rear: 3, headUp: 2, weapon: 'up', lean: -2 }),
    mounted({ legs: 0, weapon: 'sword', swordA: -2.2, lean: -1 }), mounted({ legs: 1, weapon: 'sword', swordA: 0.9, lean: 2 }),
    mounted({ legs: 0, headDown: 1, weapon: 'up', lean: 1 }),
    onFoot({ weapon: 'sword', swordA: 0.9, legPose: 0 }), onFoot({ weapon: 'sword', swordA: 0.8, legPose: 1 }),
    onFoot({ weapon: 'sword', swordA: -2.1, legPose: 2, lean: -1 }), onFoot({ weapon: 'sword', swordA: 0.3, legPose: 2, lean: 2 }),
    sitting(),
    mounted({ legs: 1, headUp: 2, weapon: 'up', lean: -3, head: -1 }),
    onFoot({ weapon: 'sword', swordA: 1.6, legPose: 1, lean: -2, head: -1 }),
  ];
}
export function bakeLancer(red = false) { return pack(finish(lancerFrames(red, false), 'lancer'), 36, 72, 28, 30); }
export function bakeLancerHorse() { return pack(finish(lancerFrames(false, true), 'lancerHorse'), 36, 72, 28, 30); }

// ======================================================================================================================
export function bakeGuests() {
  const W = 22, H = 34, CX = 10, G = 32;
  const LOOKS = [
    { tunic: '#6a8a46', tunicD: '#47612e', hair: '#5a3a22', skin: '#e0b090', legs: '#5a4632', sit: true },                   /* the carter */
    { tunic: '#9aa3b0', tunicD: '#6a7280', hair: '#c9a060', skin: '#e8c0a0', legs: '#4c5462', sit: true, sur: '#9a3a3a' },     /* a knight, off duty */
    { tunic: '#8a4a6a', tunicD: '#5e3048', hair: '#b86a3a', skin: '#e8c0a0', legs: '#5e3048', sit: true, cap: '#f2ece0' },     /* a goodwife */
    { tunic: '#b08a4a', tunicD: '#7a5e30', hair: '#e0c070', skin: '#e0b090', legs: '#5a4632', sit: false },                    /* a lad */
    { tunic: '#5a6a8a', tunicD: '#3a4660', hair: '#b0b0b0', skin: '#d0a080', legs: '#3a3a44', sit: false, beard: '#d8d8d8' },  /* an old soldier */
  ];
  const sets = [];
  for (const k of LOOKS) {
    const frames = [0, 1, 2].map(pose => {
      const [c, g] = canvas(W, H);
      const hipY = k.sit ? G - 8 : G - 10, hipX = CX, shY = hipY - 9, lean = pose === 2 ? -2 : pose === 1 ? -1 : 0;
      if (k.sit) { limb(g, hipX, hipY, hipX + 6, hipY, 4, 4, k.legs); limb(g, hipX + 6, hipY, hipX + 6, G - 2, 3, 3, k.legs); rect(g, hipX + 5, G - 2, 4, 2, '#2a2420'); }
      else { const sw = pose === 2 ? 1 : 0; limb(g, hipX - 1, hipY, hipX - 2 - sw, G - 2, 3, 3, k.legs); limb(g, hipX + 1, hipY, hipX + 2 - sw, G - 2, 3, 3, k.legs); rect(g, hipX - 4 - sw, G - 2, 4, 2, '#2a2420'); rect(g, hipX + 1 - sw, G - 2, 4, 2, '#2a2420'); }
      const sx = CX + lean;
      fillPoly(g, [[sx - 4, shY], [sx + 4, shY], [hipX + 4, hipY + 1], [hipX - 4, hipY + 1]], k.tunic);
      fillPoly(g, [[sx - 4, shY], [sx - 2, shY], [hipX - 2, hipY + 1], [hipX - 4, hipY + 1]], k.tunicD);
      if (k.sur) { fillPoly(g, [[sx - 3, shY + 2], [sx + 3, shY + 2], [hipX + 3, hipY + 1], [hipX - 3, hipY + 1]], k.sur); }
      rect(g, hipX - 4, hipY - 2, 9, 1, '#3a2a1c');
      const hx = sx + 1 + (pose === 2 ? -1 : 0), hy = shY - 4 + (pose === 2 ? -1 : 0);
      circle(g, hx, hy, 3.4, k.skin);
      if (k.cap) { fillPoly(g, [[hx - 4, hy - 1], [hx + 3, hy - 4], [hx + 4, hy - 1], [hx - 3, hy + 2]], k.cap); }
      else { fillPoly(g, [[hx - 4, hy - 1], [hx - 2, hy - 4], [hx + 3, hy - 4], [hx + 1, hy - 2], [hx - 2, hy + 1]], k.hair); }
      if (k.beard) rect(g, hx, hy + 1, 3, 3, k.beard);
      px(g, hx + 2, hy - 1, '#2a2420');
      if (pose === 2) { rect(g, hx + 1, hy + 2, 3, 1, '#7a2a2a'); }                                           /* the laugh */
      // the tankard: on the table, at the mouth, and up in the air
      const th = pose === 0 ? [sx + 6, shY + 6] : pose === 1 ? [hx + 4, hy + 1] : [sx + 5, shY - 6];
      limb(g, sx + 2, shY + 2, th[0] - 1, th[1] + 1, 3, 2, k.tunicD);
      rect(g, th[0] - 1, th[1] - 3, 4, 5, '#c9a040'); rect(g, th[0] - 1, th[1] - 4, 4, 1, '#f7f2e4'); rect(g, th[0] + 3, th[1] - 2, 1, 2, '#8a6a2a');
      return c;
    });
    sets.push(pack(finish(frames, 'guest'), CX, G, 8, 16));
  }
  return sets;
}
export function bakeBarkeep() {
  const W = 26, H = 36, CX = 12, G = 34;
  const frames = [0, 1].map(pose => {
    const [c, g] = canvas(W, H);
    const hipY = G - 11, shY = hipY - 10;
    limb(g, CX - 1, hipY, CX - 2, G - 2, 4, 3, '#4a3a2a'); limb(g, CX + 2, hipY, CX + 3, G - 2, 4, 3, '#4a3a2a'); rect(g, CX - 5, G - 2, 5, 2, '#2a2420'); rect(g, CX + 2, G - 2, 5, 2, '#2a2420');
    fillPoly(g, [[CX - 5, shY], [CX + 5, shY], [CX + 6, hipY + 1], [CX - 5, hipY + 1]], '#d8cdb0');
    fillPoly(g, [[CX - 3, shY + 4], [CX + 6, shY + 4], [CX + 7, hipY + 7], [CX - 3, hipY + 7]], '#7a5a3a');   /* the apron */
    rect(g, CX - 3, shY + 4, 10, 1, '#5a3e24');
    circle(g, CX + 1, shY - 4, 4, '#e0b090'); rect(g, CX + 1, shY - 3, 5, 1, '#6a4a2a'); px(g, CX + 3, shY - 5, '#2a2420');   /* bald, and the moustache */
    if (pose === 0) { limb(g, CX + 3, shY + 2, CX + 7, shY + 9, 3, 3, '#e0b090'); rect(g, CX + 6, shY + 8, 4, 3, '#f2ece0'); }
    else { limb(g, CX + 3, shY + 2, CX + 8, shY - 3, 3, 3, '#e0b090'); rect(g, CX + 7, shY - 8, 4, 5, '#c9a040'); rect(g, CX + 7, shY - 9, 4, 1, '#f7f2e4'); }
    return c;
  });
  return pack(finish(frames, 'barkeep'), CX, G, 8, 18);
}
