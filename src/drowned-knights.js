// src/drowned-knights.js — THE DROWNED KNIGHT and THE DROWNED CAPTAIN (docs/briefs/keep-rework-2.md).
// Daniel, 2026-09-25: "underwater knights... who have swords and swim after the player. They'll also be in the Deep level, and
// we'll use them again later." So they are a KIND any level can place, not the Keep's furniture:
//   ents  { t: 'drownedknight', x, y }             a man-at-arms of the drowned court. He SWIMS AFTER YOU, sword first, and
//                                                    walks and lunges along a floor the same way where there is air.
//         { t: 'drownedcaptain', x, y, elite, gate } his captain: tougher, a plumed helm and a torn cloak, and a TWO-SLASH combo
//                                                    on top of the lunge. Placed as an elite (he holds a gate: tools/elites.mjs).
// This file holds their NUMBERS and their ART. What they do is updateDrownedKnight in src/main.js, because the mark audit
// (tools/tells.mjs) reads creature update functions there and nowhere else - a module-file foe's marks are only as honest as
// a hand-written table, and these two are placed in more than one level.
import { fromGrid, outline, flipX, whiten } from './px.js';
import { OUT } from './art.js';

export const DK_TYPES = ['drownedknight', 'drownedcaptain'];
/* speeds in px/s; times in s; reach in px. The hero swims at about 140 across and 190 up, so a knight is always slower than
   you in the water: he is not a thing you outswim for free, he is a thing you out-think, because the lunge covers the gap. */
export const DK = {
  knight: { hp: 60, swim: 58, walk: 34, sight: 190, standOff: 40, lungeReach: 88, lungeTell: 0.6, lungeT: 0.3, lungeSpeed: 300, lungeCd: 2.1,
    rest: 0.55, blockedOpen: 1.1, leash: 16, tip: 16, dmg: { lunge: 16 } },
  captain: { hp: 150, swim: 64, walk: 40, sight: 210, standOff: 36, lungeReach: 96, lungeTell: 0.55, lungeT: 0.32, lungeSpeed: 320, lungeCd: 1.9,
    rest: 0.5, blockedOpen: 1.0, leash: 12, tip: 18, comboReach: 40, comboTell: 0.62, slashT: 0.2, slash2T: 0.24, comboCd: 2.2,
    dmg: { lunge: 18, slash: 12, slash2: 14 } },
};
/* a placement: { t, x, y } in tiles, as a level's builder pushes it. `o` is anything else (face, elite, gate) */
export const drownedKnight = (x, y, o = {}) => ({ t: 'drownedknight', x, y, face: -1, ...o });
export const drownedCaptain = (x, y, o = {}) => ({ t: 'drownedcaptain', x, y, face: -1, elite: true, ...o });

/* WHICH FRAME. Knight: 0-1 swim, 2-3 walk, 4 lunge tell, 5 lunge, 6 hurt (LAST: HAS_HURT reads the last frame).
   Captain: the same, then 6 combo tell, 7 the cut, 8 the return cut, 9 hurt. */
export function dkFrame(e) {
  const cap = e.t === 'drownedcaptain';
  const m = cap ? { lungeTell: 4, lunge: 5, comboTell: 6, slash1: 7, slash2: 8 } : { lungeTell: 4, lunge: 5 };
  if (m[e.mode] !== undefined) return m[e.mode];
  if (e.swimming) return Math.floor(e.anim * 4) % 2;
  return Math.abs(e.vx) > 6 ? 2 + Math.floor(e.anim * 6) % 2 : 2;
}

// ---------------- THE ART ----------------
/* A MAN IN PLATE WHO DROWNED IN IT. Dull sea-steel gone green at every seam, a shut great helm with one cold slit of light where
   the eyes were, weed hanging off him, and a long blade held forward - the sword is the whole creature, so it is the brightest
   thing on him. On a floor he stands upright; in the water he lies along the line he swims, helm first and blade out ahead,
   legs trailing, so at a glance across a flooded hall you know which of the two he is doing. The captain is the same rig with
   a drowned red plume streaming off his crest, a torn cloak, gold on his helm, and a heavier blade.
   26 x 22 grid, facing right, feet on row 21. */
const W = 26, H = 22;
const PAL = { S: '#56656c', s: '#8a9ba2', D: '#27313a', v: '#3f8f7d', g: '#35603a', e: '#8ff0dc', k: '#11181c', b: '#d4dee4', B: '#8a96a0',
  y: '#a88438', r: '#7a3e28', p: '#9a2f40', P: '#5e1b28', c: '#3a2c46', C: '#241a2c', Y: '#d0a848', o: OUT };
const blank = () => Array(H).fill('.'.repeat(W));
/* E6, AT BAKE TIME: a pixel put off the grid is COUNTED, not dropped in silence - tools/drowned-knights.mjs fails on any */
export const DK_CLIPPED = [];
const put = (rows, x, y, ch) => { if (y < 0 || y >= H || x < 0 || x >= W) { DK_CLIPPED.push(x + ',' + y + ':' + ch); return; } const a = rows[y].split(''); a[x] = ch; rows[y] = a.join(''); };
const stamp = (rows, art, x0, y0) => art.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') put(rows, x0 + i, y0 + j, r[i]); });
const line = (rows, x0, y0, x1, y1, ch) => { const n = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) put(rows, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), ch); };
/* A BLADE: a crossguard at the hand, then the steel, bright edge over a darker flat, to the point */
const blade = (rows, hx, hy, tx, ty) => { const n = Math.max(1, Math.abs(tx - hx), Math.abs(ty - hy)), ux = (tx - hx) / n, uy = (ty - hy) / n;
  put(rows, hx, hy, 'y'); put(rows, Math.round(hx - uy), Math.round(hy + ux), 'y'); put(rows, Math.round(hx + uy), Math.round(hy - ux), 'y');
  for (let i = 1; i <= n; i++) { const x = Math.round(hx + ux * i), y = Math.round(hy + uy * i); put(rows, x, y, 'b');
    if (i < n - 1 && Math.abs(uy) < 0.7) put(rows, x, y + 1, 'B'); else if (i < n - 1) put(rows, x + 1, y, 'B'); } };

const HELM = ['.DSSSSD.', 'DSssssSD', 'DSkkkeeD', 'DSSSSSSD', '.DvSSvD.', '..DDDD..'];
const HELM_CAP = ['.DYSSYD.', 'DSssssSD', 'DSkkkeeD', 'DYSSSSYD', '.DvYYvD.', '..DDDD..'];
const HELM_BACK = ['..DSSSSD', '.DSssssS', '.DSkkkeD', '.DSSSSSD', '..DvSSvD', '...DDDD.'];   /* snapped back: the hurt frame */
const TORSO = ['.DSSSSSSD.', 'DSSssssSSD', 'DSvSSSSvSD', 'DSSSSSSSSD', '.DSrrrrSD.', '.DSSSSSSD.', '..DSSSSD..'];
const LEGS = [
  ['..SS..SS.', '..SS..SS.', '..SS...SS', '.SS....SS', '.SS....SS', 'DDD...DDD'],
  ['..SS.SS..', '..SS.SS..', '..SSSS...', '..SSSS...', '..SS.SS..', '.DDD.DDD.'],
];
const LEGS_LUNGE = ['..SS...SS', '.SS.....SS', 'SS......SS', 'SS.......S', 'S.......SS', 'DD......DD'];
const LEGS_BRACE = ['..SS..SS.', '.SS....SS', '.SS....SS', 'SS......S', 'SS......SS', 'DDD....DDD'];
/* THE SWIMMER: helm forward on the right, the body laid along the stroke, the legs trailing behind him */
const SWIM_BODY = ['...DSSSSSSSSD.', '..DSSssssSSSSD', '.DSvSSSSSSvSSD', '..DSSrrrSSSSD.', '...DDSSSSSDD..'];
const SWIM_LEGS = [['DSS.....', '.SSSSSS.', 'DDS.....'], ['.DSS....', 'DSSSSSS.', '.....DDS']];

function body(rows, cap, dy = 0, helm = null) {
  if (cap) { line(rows, 2, 9 + dy, 8, 9 + dy, 'c'); line(rows, 1, 10 + dy, 8, 10 + dy, 'c'); line(rows, 1, 11 + dy, 7, 12 + dy, 'C'); put(rows, 0, 12 + dy, 'C'); put(rows, 2, 13 + dy, 'c'); }   /* the cloak, behind */
  stamp(rows, helm || (cap ? HELM_CAP : HELM), 9, 2 + dy); stamp(rows, TORSO, 8, 8 + dy);
  if (cap) { stamp(rows, ['pp.', 'ppP', '.PP'], 9, 0 + dy); put(rows, 8, 1 + dy, 'p'); put(rows, 7, 2 + dy, 'P'); }   /* the plume, streaming back */
  put(rows, 8, 15 + dy, 'g'); put(rows, 8, 16 + dy, 'g'); put(rows, 17, 14 + dy, 'g');   /* weed off his belt and his elbow */
}
function swimmer(rows, cap, k) {
  stamp(rows, SWIM_BODY, 4, 11); stamp(rows, cap ? HELM_CAP : HELM, 15, 8); stamp(rows, SWIM_LEGS[k], 0, 12);
  if (cap) { stamp(rows, ['pp..', '.pPP', '..PP'], 11, 6); line(rows, 4, 10, 11, 10, 'c'); line(rows, 2, 11, 5, 11, 'C'); }
  put(rows, 7, 16, 'g'); put(rows, 8, 17, 'g'); put(rows, 12, 16, 'g');
  blade(rows, 18, 14, 25, 14 + (k ? 1 : 0));   /* sword first */
}
function frames(cap) {
  const f = rows => outline(fromGrid(rows, PAL, 1), OUT), out = [];
  for (let k = 0; k < 2; k++) { const r = blank(); swimmer(r, cap, k); out.push(f(r)); }                           /* 0-1 swim */
  for (let k = 0; k < 2; k++) { const r = blank(); body(r, cap, k); stamp(r, LEGS[k], 8, 15); line(r, 17, 10 + k, 18, 12 + k, 'S');
    blade(r, 18, 13 + k, cap ? 24 : 23, 8 + k); out.push(f(r)); }                                                        /* 2-3 walk, the blade carried up and forward */
  { const r = blank(); body(r, cap, 0); stamp(r, LEGS_BRACE, 8, 15); line(r, 9, 10, 7, 12, 'S'); blade(r, 7, 12, 1, 7); out.push(f(r)); }   /* 4 THE LUNGE, TOLD: the blade drawn right back behind him, point high */
  { const r = blank(); body(r, cap, 1); stamp(r, LEGS_LUNGE, 7, 15); line(r, 17, 11, 19, 12, 'S'); blade(r, 19, 12, 25, 12); out.push(f(r)); }  /* 5 THE LUNGE: arm out straight, all his weight behind the point */
  if (cap) {
    { const r = blank(); body(r, cap, 0); stamp(r, LEGS_BRACE, 8, 15); line(r, 15, 8, 14, 5, 'S'); blade(r, 14, 4, 20, 0); out.push(f(r)); }   /* 6 THE COMBO, TOLD: raised high over his crest */
    { const r = blank(); body(r, cap, 1); stamp(r, LEGS_LUNGE, 7, 15); line(r, 17, 11, 18, 13, 'S'); blade(r, 18, 13, 25, 19); out.push(f(r)); }  /* 7 THE CUT: down and forward */
    { const r = blank(); body(r, cap, 0); stamp(r, LEGS_BRACE, 8, 15); line(r, 17, 10, 18, 9, 'S'); blade(r, 18, 9, 25, 3); out.push(f(r)); }    /* 8 THE RETURN CUT: back up */
  }
  { const r = blank(); body(r, cap, 1, HELM_BACK); stamp(r, LEGS_BRACE, 8, 15); blade(r, 17, 15, 22, 20); out.push(f(r)); }   /* LAST: HURT - helm snapped back, the blade dropped */
  return out;
}
function pack(fr, ax, ay, w, h) { const R = fr, L = fr.map(flipX), white = fr.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(flipX) }, ax, ay, w, h }; }
/* the anchor is his feet: the body's centre column (x 12 on the grid, 13 with the margin) and the bottom edge */
export const bakeDrownedKnight = () => pack(frames(false), 13, H, 12, 20);
export const bakeDrownedCaptain = () => pack(frames(true), 13, H, 12, 20);
