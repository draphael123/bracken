// src/redraw/hornets_nest_art.js - THE HORNET'S NEST's FOE SKINS (claude/hornetsnest greybox recolours -> claude/hornetsnestart REDRAWN). Each reskin keeps the FRAME LAYOUT of the machine under it
// (main.js reads frames by index; the machine, hitbox and timings are untouched) but is drawn fresh as the nest's own creature, in hard inked pixels, and dies in its own skin (reskinSet):
//   hornet        the river wasp's machine (sting: true - a told ! dart from its post): a big nest hornet, banded abdomen and sting, red eye          - 4 frames (3 wing beats, hurt)         16 x 11
//   combdrone     the sprig's machine (a walker with a told bite): a stout comb-worker walking on its legs, abdomen banded - walk x4, look, tell (rears, jaws wide), bite (lunges), hurt  16 x 12
//   nestguard     the shieldbearer's machine (guards his front, a slow turn, a told shove): a soldier hornet standing upright behind a PAPER PLATE of hex comb - 8 frames  16 x 16
//   (the venom spitter is gone: claude/hornetsnest2, Daniel 10-23 - it read as a mage; the nest's heavy is THE AMBER HORNET, src/redraw/honey_hornet_art.js)
// bakeNestSkins(SPR) -> { hornet, combdrone, nestguard } (each { R, L, white, ax, ay, w, h } like every foe sheet; the SPR argument is read for the anchors only)
import { canvas, flipX, whiten, outline } from '../px.js';
import * as WASPART from './wasp_art.js';

const INK = '#1a0c06', CH = ['#3a1c0c', '#6a3a18', '#9c5c28', '#cc8444'], AM = ['#a05a0a', '#d88a1c', '#f6b436', '#ffe070'], BLK = '#1a0c06', WING = ['#9ab0c6', '#dce8f4', '#ffffff'];
const CREAM = ['#8a6a2c', '#d8b050', '#f6dc88', '#fff6c8'], VEN = ['#2c5a14', '#5ea02a', '#9ed84a', '#d8f890'], EYE = ['#6a0a0a', '#e8341c', '#ffa070'];
const px = (g, c, x, y) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
const rr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const line = (g, c, x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) px(g, c, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); };
const blob = (g, cx, cy, rx, ry, shade) => { for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) { const c = shade(dx, dy, x, y); if (c) px(g, c, x, y); } } };
const sh = (pal, dx, dy) => pal[Math.max(0, Math.min(pal.length - 1, Math.floor((1 - (dx * 0.35 + dy * 0.8 + 1) / 2) * pal.length)))];
const sheet = (frames, w, h, ax, ay, rim) => { const R = frames.map(f => { const [c, g] = canvas(w, h); f(g); return outline(c, INK); }), white = R.map(c => whiten(c)); return { R, L: R.map(flipX), white: { R: white, L: white.map(flipX) }, ax, ay, w: rim.w, h: rim.h }; };
/* a banded abdomen: an egg from (cx, cy), axis pointing back-left (dir -1) tilted by tilt */
function abdomen(g, cx, cy, rx, ry, bands) { blob(g, cx, cy, rx, ry, (dx, dy, x) => { const k = Math.floor((x - (cx - rx)) / 2.2); return bands.includes(k) ? (dy < -0.3 ? '#3a2410' : BLK) : sh(AM, dx, dy); }); }
const eye = (g, x, y, big) => { px(g, EYE[1], x, y); if (big) px(g, EYE[1], x, y + 1); px(g, EYE[2], x, y - (big ? 0 : 0)); };

/* ---------------- THE NEST HORNET (16 x 11) ---------------- */
function hornetFrame(beat, hurt) { return g => {
  const dy = hurt ? 1 : 0;
  /* wings first (behind): a pair, up and back, at one of three beats */
  const W = [[[8, 3], [4, 0], [7, 0]], [[8, 3], [2, 2], [3, 1]], [[8, 3], [5, -0.5], [9, 0]]][beat];
  line(g, WING[1], 8, 3 + dy, W[1][0], W[1][1] + dy); line(g, WING[1], 9, 3 + dy, W[1][0] + 1, W[1][1] + dy); line(g, WING[0], 9, 3 + dy, W[2][0], W[2][1] + dy); line(g, WING[0], 8, 2.6 + dy, W[2][0] - 1, W[2][1] + dy); px(g, WING[2], 6, 1 + dy); if (beat !== 2) px(g, WING[1], 5, 2 + dy);
  abdomen(g, 4.4, 6.2 + dy, 4.2, 2.6, [1, 3]); line(g, '#fff6c8', 0, 8 + dy, 1, 7.5 + dy);                                   /* the banded abdomen and its sting */
  blob(g, 8.5, 5.6 + dy, 2.6, 2.4, (dx, dy2) => sh(CH, dx, dy2));                                                           /* the thorax */
  blob(g, 11.8, 6 + dy, 2.2, 2.1, (dx, dy2) => sh(CH, dx, dy2)); eye(g, 12.5, 5 + dy, true); if (hurt) { px(g, INK, 12.5, 5 + dy); px(g, INK, 13, 6 + dy); }
  px(g, '#f0e4c8', 14, 7.5 + dy); line(g, INK, 13, 3.4 + dy, 14.5, 1.6 + dy);                                              /* a mandible, a feeler */
  px(g, CH[0], 7, 8 + dy); px(g, CH[0], 9, 8.5 + dy); px(g, CH[0], 11, 8.4 + dy); };
}
/* ---------------- (claude/nestbugs, Daniel 11-03) THE REST OF THE NEST, in the same WASP ANATOMY as src/redraw/wasp_art.js: a head / thorax / abdomen in three masses joined by a pinched one-pixel waist, a
   pointed banded abdomen ending in a pale sting, narrow wings, feelers, mandibles, thin dangling legs (the thin parts are drawn AFTER the ink so they stay hairlines).
   Same frame indices, same boxes. Silhouette per role: the DRONE is small and low; the GUARD is upright, plated, with heavy jaws; the STINGER clings with a long needle. ART ONLY. ---------------- */
const NP = { c: '#cc8444', C: '#9c5c28', D: '#5e2e10', a: '#ffd868', A: '#f6a824', d: '#a8600c', K: '#1c0e08', k: '#44281a', E: '#1a0806', W: '#ffffff', M: '#f0e8d0', m: '#8a7a58', e: '#e8341c', G: '#ffa070', P: '#2a160c' };
const AMBP = [NP.a, NP.A, NP.d], BLKP = [NP.k, NP.K, '#0c0604'], VENP = [VEN[3], VEN[1], VEN[0]], NLEG = '#2a1a0e', NLEGF = '#4a3018';
const tpl = (g, x0, y0, rows) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') WASPART.put(g, NP[r[i]], x0 + i, y0 + j); });
const pp = (g, c, x, y) => WASPART.put(g, NP[c] || c, x, y);
const disc = (g, cx, cy, r, pal) => { for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) { const dx = x - cx, dy = y - cy; if (dx * dx + dy * dy <= r * r + 0.3) WASPART.put(g, dy < -r * 0.45 ? pal[0] : dy > r * 0.45 ? pal[2] : pal[1], x, y); } };

/* ---------------- THE COMB DRONE: small and low, six legs, a worker's amber-and-brown. 21 x 16 canvas, design offset (1, 3), feet on y 11 ---------------- */
function droneFrame(kind, k) { return (g, layer) => {
  const hurt = kind === 'hurt', lunge = kind === 'bite' ? 2 : 0, rear = kind === 'tell' ? -2 : kind === 'look' ? -1 : 0, tell = kind === 'tell';
  const bob = kind === 'walk' && (k & 1) ? -1 : 0, oy = hurt ? 1 : 0, tx = lunge >> 1;
  const hd = rear + bob + oy, td = (rear ? Math.round(rear / 2) : 0) + bob + oy, ad = (tell ? 1 : 0) + bob + oy, hx = 12 + lunge, hy = 3 + hd;
  if (layer === 'body') {
    WASPART.col(g, 5, 4, 7, AMBP, ad); WASPART.col(g, 4, 4, 8, BLKP, ad); WASPART.col(g, 3, 5, 8, AMBP, ad); WASPART.col(g, 2, 6, 8, BLKP, ad); WASPART.col(g, 1, 7, 8, AMBP, ad);   /* the pointed abdomen, banded */
    pp(g, 'K', 0, 8 + ad); pp(g, 'M', 0, 9 + ad); pp(g, 'm', 0, 10 + ad);                                                                                              /* the sting */
    pp(g, 'P', 6, 5 + Math.round((ad + td) / 2)); if (tx) pp(g, 'P', 7, 5 + Math.round((ad + td) / 2));                                                              /* the WAIST */
    tpl(g, 7 + tx, 3 + td, ['.cC.', 'cCCa', 'CCCD', '.DDD']);                                                                                                           /* the thorax */
    for (let x = 11 + tx; x < hx; x++) pp(g, 'P', x, 5 + Math.round((td + hd) / 2));                                                                                     /* the neck */
    tpl(g, hx, hy, ['.cCC.', hurt ? 'CEEaA' : 'CEWaA', 'CEEAd', '.dAA.']);                                                                                              /* the head */
    if (tell) { for (const [dx, dy] of [[5, 2], [6, 1], [5, 4], [6, 5]]) pp(g, 'M', hx + dx, hy + dy); pp(g, 'm', hx + 5, hy + 3); }                                       /* jaws WIDE */
    else if (kind === 'bite') { for (const [dx, dy] of [[5, 2], [6, 2], [5, 4], [6, 4]]) pp(g, 'M', hx + dx, hy + dy); pp(g, 'm', hx + 7, hy + 2); pp(g, 'm', hx + 7, hy + 4); }   /* snapped open forward */
    else { pp(g, 'M', hx + 5, hy + 3); pp(g, 'm', hx + 4, hy + 4); }
  } else {
    const up = kind === 'look' ? 1 : 0;
    WASPART.line(g, NP.K, hx + 3, hy - 1, hx + 2, hy - 4 - up); WASPART.line(g, NP.K, hx + 4, hy - 1, hx + 6, hy - 3 - up); pp(g, 'A', hx + 2, hy - 5 - up); pp(g, 'A', hx + 6, hy - 4 - up);   /* the feelers */
    for (let i = 0; i < 3; i++) for (const far of [true, false]) {
      const hip = 8 + i + tx + (far ? 1 : 0), a = ((k + i + (far ? 1 : 0)) & 1) ? 1 : -1, walk = kind === 'walk';
      let fx = hip + (walk ? a * 2 : kind === 'bite' ? i - 1 : hurt ? (i - 1) * 3 : (i - 1)), fy = 11;
      if (tell && i === 2) { fx = hip + 3; fy = 7; }                                                                                                                    /* a forelimb up, jaws open */
      if (walk && a > 0 && !far) fy = 10;                                                                                                                              /* the stepping leg lifts */
      const kx = (hip + fx) / 2 + (fx >= hip ? 1 : -1);
      WASPART.line(g, far ? NLEGF : NLEG, hip, 7 + td, kx, 9); WASPART.line(g, far ? NLEGF : NLEG, kx, 9, fx, fy);
    }
  } }; }

/* ---------------- THE NEST-GUARD: the armoured soldier. Upright, a crested helm, a plated thorax, HEAVY crossed jaws, a banded abdomen hanging behind to a sting, behind a PAPER PLATE.
   24 x 22 canvas, design offset (5, 4), feet on y 15 ---------------- */
function guardFrame(kind, k) { return (g, layer) => {
  const walk = kind === 'walk', leg = walk ? (k === 1 ? 1 : k === 3 ? -1 : 0) : 0, tell = kind === 'tell', shove = kind === 'shove', turn = kind === 'turn', low = kind === 'low', lean = shove ? 2 : tell ? -1.5 : 0;
  const Lh = Math.round(lean), Lt = Math.round(lean * 0.8), Lr = Math.round(lean * 0.4), hx = 7 + Lh + (turn ? 1 : 0), hy = low ? 2 : 1;
  const pxx = shove ? 11.5 : tell ? 8 : turn ? 8.5 : low ? 10.5 : 10.5, pyy = low ? 7.5 : 5.2, pw = turn ? 3 : 4.4, ph = low ? 5 : 8.2;
  if (layer === 'body') {
    WASPART.col(g, 1 + Lr, 11, 13, AMBP); WASPART.col(g, 0 + Lr, 11, 14, BLKP); WASPART.col(g, -1 + Lr, 11, 14, AMBP); WASPART.col(g, -2 + Lr, 12, 14, BLKP);                 /* the abdomen */
    pp(g, 'K', -3 + Lr, 14); pp(g, 'M', -3 + Lr, 15); pp(g, 'm', -4 + Lr, 16);                                                                                          /* the sting */
    pp(g, 'P', 1 + Math.round((Lr + Lt) / 2), 10);                                                                                                                      /* the waist */
    tpl(g, 1 + Lt, 4, ['.ccC.', 'cCCCa', 'CCDCa', 'CCCCA', 'DCCDd', '.DDD.']);                                                                                          /* the plated thorax */
    pp(g, 'a', 2 + Lt, 5); pp(g, 'A', 3 + Lt, 6);                                                                                                                       /* a pauldron's rim */
    for (let x = 6 + Lt; x < hx; x++) pp(g, 'P', x, 5);
    tpl(g, hx, hy, ['..aAa.', '.cCCCC', tell ? 'CEGAAd' : 'CEeAAd', 'CEEAAd', '.dDAd.']);                                                                                  /* the crested head */
    const J = tell ? [[6, 3], [7, 2], [8, 2], [6, 5], [7, 6], [8, 7], [7, 7]] : shove ? [[6, 4], [7, 4], [8, 4], [8, 5], [6, 5], [7, 6]] : [[6, 4], [7, 5], [6, 6], [5, 6], [8, 5], [7, 6]];
    for (const [dx, dy] of J) pp(g, 'M', hx + dx, hy + dy); pp(g, 'm', hx + (tell ? 8 : 7), hy + (tell ? 8 : 7));                                                      /* HEAVY jaws */
    /* the paper plate (a hex-comb shield) */
    blob(g, pxx + pw / 2, pyy + ph / 2, pw / 2 + 0.4, ph / 2, (dx, dy, x, y) => { const rim = dx * dx + dy * dy > 0.62; if (rim) return CREAM[0]; const cell = ((x + ((y >> 1) & 1) * 2) % 3 === 0) || (y % 2 === 0 && dy < 2); return cell && (x + y) % 2 ? CREAM[1] : sh(CREAM, dx * 0.6, dy * 0.6); });
    if (!turn) px(g, CREAM[3], pxx + 1, pyy + 1.5); px(g, '#6a4a1c', pxx + pw / 2, pyy + ph / 2 - 1);
  } else {
    WASPART.line(g, NP.K, hx + 2, hy, hx + 1, hy - 3); WASPART.line(g, NP.K, hx + 4, hy, hx + 6, hy - 2); pp(g, 'A', hx + 1, hy - 4); pp(g, 'A', hx + 6, hy - 3);           /* the feelers */
    WASPART.line(g, NLEG, 2 + Lt, 10, 1 + leg + Lt, 15); WASPART.line(g, NLEG, 4 + Lt, 10, 5 - leg + Lt, 15); pp(g, 'D', 1 + leg + Lt, 15); pp(g, 'D', 5 - leg + Lt, 15);   /* the standing legs */
    WASPART.line(g, NLEGF, 5 + Lt, 7, pxx + 0.5, pyy + ph / 2 + 0.5);                                                                                                    /* the forearm to the plate */
  } }; }

/* ---------------- THE STINGER HORNET: clinging to the comb, upright and braced, wings folded along its back, a LONG NEEDLE-STING under a green venom gland; the flick CURLS the abdomen forward
   at you with a bead of venom swelling on the point. 21 x 22 canvas, design offset (1, 3) ---------------- */
function stingerFrame(beat, aim) { return (g, layer) => {
  const p = beat ? 1 : 0;
  if (layer === 'body') {
    tpl(g, 5, 3, ['.cC.', 'cCCa', 'CCCC', 'CCCD', 'DCCD', '.DD.']); pp(g, 'P', 9, 4);                                                                                    /* the thorax, the neck */
    tpl(g, 10, 2, ['.cCC.', 'CeGaA', 'CeeAd', '.dAA.']);                                                                                                                /* the head, the red eye */
    if (aim) { pp(g, 'M', 15, 5); pp(g, 'M', 16, 6); pp(g, 'M', 14, 6); pp(g, 'm', 14, 7); } else { pp(g, 'M', 15, 5); pp(g, 'm', 14, 6); }
    pp(g, 'P', 4, 8);                                                                                                                                                   /* the waist */
    if (aim) {
      disc(g, 4, 10.5, 1.9, AMBP); disc(g, 5.8, 12.4, 1.9, BLKP); disc(g, 8.2, 13.2, 1.7, AMBP); disc(g, 10.6, 13, 1.4, BLKP); disc(g, 12.4, 12.4, 1.1, VENP);                  /* curled forward under the body */
      WASPART.line(g, NP.M, 13.6, 12.2, 17, 11.6); pp(g, 'W', 17, 11); pp(g, VEN[3], 18, 11); pp(g, VEN[2], 18, 12); pp(g, VEN[1], 18, 13); pp(g, VEN[2], 18, 14);            /* the needle, a bead of venom on the point */
      pp(g, VEN[2], 15, 13); pp(g, VEN[1], 14, 14);
    } else {
      const rows = [[9, 3, 4, AMBP], [10, 2, 4, BLKP], [11, p ? 1 : 2, 4, AMBP], [12, 2, 3, BLKP], [13, 2, 3, VENP]];                                                   /* the abdomen hangs, banded, to the gland */
      for (const [y, x0, x1, pal] of rows) for (let x = x0; x <= x1; x++) pp(g, y === 9 ? pal[0] : x === x0 ? pal[2] : pal[1], x, y);
      pp(g, 'M', 2, 14 + p); pp(g, 'M', 2, 15 + p); pp(g, 'M', 1, 16 + p); pp(g, 'm', 1, 17 + p);                                                                       /* the long NEEDLE */
    }
  } else {
    const w = beat ? 1 : 0;
    WASPART.blade(g, 7.2, 3.4, 0.5, 0.6 + w, 1.6, w ? 0.7 : 0.95); WASPART.blade(g, 7.6, 3.8, 1.5, 2.6 + w, 1.2, w ? 0.55 : 0.8);                                         /* wings folded flat along the back */
    WASPART.line(g, NP.K, 11, 2, 10, -1); WASPART.line(g, NP.K, 13, 2, 15 + p, -1); pp(g, 'A', 10, -2); pp(g, 'A', 15 + p, -2);                                           /* the feelers, a twitch */
    for (const [x0, y0, x1, y1, x2, y2] of [[8, 7, 11, 8, 13, 10.5], [7, 8, 9, 10, 11, 12.5], [6, 8, 6, 11, 5, 13.5]]) { WASPART.line(g, NLEG, x0, y0, x1, y1); WASPART.line(g, NLEG, x1, y1, x2, y2); pp(g, 'a', x2, y2 + 0.5); }   /* the legs grip the wall */
  } }; }
const wasp = (frames, w, h, ox, oy, ax, ay, rim) => WASPART.pack(WASPART.bake(w, h, ox, oy, frames), ax + ox, ay + oy, rim.w, rim.h);
export function bakeNestSkins(SPR) {
  const keep = n => ({ w: SPR[n].w, h: SPR[n].h });
  return {
    hornet: WASPART.bakeHornet(SPR.wasp.ax + 4, SPR.wasp.ay + 5, SPR.wasp.w, SPR.wasp.h),   /* (claude/waspart) a REAL HORNET (26 x 18, same box): src/redraw/wasp_art.js */
    combdrone: wasp([droneFrame('walk', 0), droneFrame('walk', 1), droneFrame('walk', 2), droneFrame('walk', 3), droneFrame('look'), droneFrame('tell'), droneFrame('bite'), droneFrame('hurt')], 21, 16, 1, 3, SPR.sprig.ax + 1, SPR.sprig.ay, keep('sprig')),   /* (claude/nestbugs) a small worker WASP */
    stinger: wasp([stingerFrame(0), stingerFrame(1), stingerFrame(1, true)], 21, 22, 1, 3, SPR.spit.ax, SPR.spit.ay, keep('spit')),   /* (claude/nestbugs) the nest's ranged hornet: a long needle */
    nestguard: wasp([guardFrame('walk', 0), guardFrame('walk', 1), guardFrame('walk', 2), guardFrame('walk', 3), guardFrame('turn'), guardFrame('tell'), guardFrame('shove'), guardFrame('low')], 24, 22, 5, 4, SPR.shield.ax, SPR.shield.ay, keep('shield')),   /* (claude/nestbugs) the armoured soldier */
  };
}
