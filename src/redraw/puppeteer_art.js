// puppeteer_art.js - THE PUPPETEER and his three puppets (claude/puppeteer; src/puppeteer.js is the fight). px.js primitives only, in the fair's own
// style (src/redraw/wicker_queen.js): every frame faces RIGHT, L is the flip, ax = the body's centre column, ay = the row under the lowest pixel.
//   THE PUPPETEER (PUP_F): a tall thin man in a long plum tailcoat, a white half-mask with a painted smile, a top hat with a gold band; his hands up at
//     his chest where the control bar sits (the bar and the strings are drawn by the hands, src/puppeteer-hands.js, so they move with the fight).
//   THE SOLDIER and THE HARLEQUIN (MAR_F): toys the size of a child - carved heads, painted faces, jointed limbs with a peg at every joint, the soldier
//     in a red coat with a shako, a tin sword and a round shield; the harlequin in diamond motley with a ruff and a two-horned cap.
//   THE MASTERPIECE (MP_F): a carved wooden king twice a man's height - crown, painted grin, ermine, jointed arms that hang to his knees.
import { canvas, px, rect, fillPoly, line, circle, ellipse, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
import { PUP } from '../puppeteer.js';

function settle(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
function bake(n, W, H, draw, ax, hw, hh, noSettle) {
  const R = [];
  for (let f = 0; f < n; f++) { const [c, g] = canvas(W, H); draw(g, f); outline(c, OUT); R.push(noSettle ? c : settle(c)); }
  const L = R.map(c => flipX(c)), white = R.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay: H - 1, w: hw, h: hh };
}
/* a jointed wooden limb: two strokes and a peg at the joint */
const limb = (g, a, b, c, col, dark, peg) => { line(g, a[0], a[1], b[0], b[1], col, 2); line(g, b[0], b[1], c[0], c[1], col, 2); line(g, a[0], a[1] + 1, b[0], b[1] + 1, dark); px(g, b[0], b[1], peg); };

/* ================= THE PUPPETEER ================= */
const PW = 40, PH = 58, PX = 19;
const PC = { coat: '#5a2a4a', coatD: '#3a1830', coatL: '#7a3e66', shirt: '#e8dcc8', mask: '#f4ecd8', maskD: '#c8b89c', smile: '#b8382c', hat: '#1e1624', band: '#e8c23a',
  skin: '#d8b090', hand: '#e8dcc8', trou: '#2a2030', shoe: '#140e18', knife: '#c9d1dc', rope: '#c9a86a', thread: '#e8e0c8', gold: '#ffd36b' };
function drawPuppeteer(g, f) {
  const F = { work0: f === 0, work1: f === 1, tell: f === 2, whip: f === 3, snare: f === 4, ride: f === 5, rs: f === 6 || f === 7, fallen: f === 8, climb: f === 9, hurt: f === 10, dead: f === 11, cut: f === 12 };
  if (F.dead || F.fallen) {   /* sprawled on the boards, tangled in his own string; dead, the mask has come off beside him */
    const y = PH - 3; fillPoly(g, [[PX - 16, y], [PX - 12, y - 7], [PX + 6, y - 9], [PX + 16, y - 4], [PX + 17, y]], PC.coat);
    line(g, PX - 12, y - 5, PX + 8, y - 8, PC.coatL); rect(g, PX + 12, y - 8, 7, 6, F.dead ? PC.skin : PC.mask); px(g, PX + 14, y - 6, PC.hat); px(g, PX + 17, y - 6, PC.hat);
    if (!F.dead) line(g, PX + 13, y - 4, PX + 17, y - 4, PC.smile);
    rect(g, PX - 20, y - 4, 8, 3, PC.hat); rect(g, PX - 18, y - 8, 5, 4, PC.hat); rect(g, PX - 18, y - 6, 5, 1, PC.band);
    if (F.dead) { rect(g, PX + 22, y - 5, 6, 5, PC.mask); line(g, PX + 23, y - 2, PX + 27, y - 2, PC.smile); }
    for (let i = 0; i < 6; i++) line(g, PX - 14 + i * 5, y - 10 + (i % 2) * 3, PX - 10 + i * 5, y - 2 - (i % 3), PC.thread);   /* the strings he is caught in */
    return; }
  const kneel = F.rs, bob = F.work1 ? 1 : 0, lean = F.whip ? 2 : F.hurt ? -2 : F.snare ? 1 : 0;
  const foot = PH - 2, hip = kneel ? foot - 10 : foot - 16, sh = hip - 17 + bob, hx = PX + lean, hy = sh - 7;
  /* legs */
  if (kneel) { line(g, PX - 3, hip, PX - 8, foot - 1, PC.trou, 3); line(g, PX + 3, hip, PX + 9, hip + 2, PC.trou, 3); line(g, PX + 9, hip + 2, PX + 9, foot - 1, PC.trou, 3); rect(g, PX - 11, foot - 1, 5, 2, PC.shoe); rect(g, PX + 8, foot - 1, 5, 2, PC.shoe); }
  else if (F.climb || F.ride) { line(g, PX - 2, hip, PX - 4, foot - 3, PC.trou, 3); line(g, PX + 2, hip, PX + 5, foot - 5, PC.trou, 3); rect(g, PX - 6, foot - 3, 4, 2, PC.shoe); rect(g, PX + 4, foot - 5, 4, 2, PC.shoe); }
  else { const sp = F.whip ? 4 : 2; line(g, PX - 2, hip, PX - 2 - sp, foot - 1, PC.trou, 3); line(g, PX + 2, hip, PX + 2 + sp, foot - 1, PC.trou, 3); rect(g, PX - 5 - sp, foot - 1, 5, 2, PC.shoe); rect(g, PX + 1 + sp, foot - 1, 5, 2, PC.shoe); }
  /* the tailcoat: narrow at the chest, its tails long behind him */
  fillPoly(g, [[hx - 5, sh], [hx + 5, sh], [PX + 5, hip + 2], [PX - 5, hip + 2]], PC.coat);
  fillPoly(g, [[PX - 5, hip - 2], [PX - 1, hip - 1], [PX - 6 - (F.whip ? 3 : 0), hip + (kneel ? 8 : 12)], [PX - 10 - (F.whip ? 4 : 0), hip + (kneel ? 7 : 10)]], PC.coatD);
  fillPoly(g, [[hx - 1, sh + 1], [hx + 2, sh + 1], [PX + 1, hip - 2]], PC.shirt); line(g, hx + 3, sh + 1, PX + 3, hip, PC.coatL);
  px(g, PX + 2, sh + 8, PC.band); px(g, PX + 2, sh + 12, PC.band);
  /* the head: a white half-mask with a painted smile, and the hat */
  rect(g, hx - 3, hy - 4, 7, 8, PC.skin); rect(g, hx - 3, hy - 4, 7, 5, F.hurt ? PC.maskD : PC.mask); px(g, hx - 1, hy - 2, PC.hat); px(g, hx + 2, hy - 2, PC.hat);
  line(g, hx - 2, hy + 1, hx + 3, hy + 1, PC.smile); px(g, hx - 2, hy, PC.smile); px(g, hx + 3, hy, PC.smile);
  rect(g, hx - 5, hy - 5, 11, 2, PC.hat); rect(g, hx - 3, hy - 13, 7, 9, PC.hat); rect(g, hx - 3, hy - 7, 7, 2, PC.band);
  /* the arms and hands: up at the chest working the bar (the bar is drawn by the hands), or doing what the frame says */
  const sL = [hx - 5, sh + 2], sR = [hx + 5, sh + 2];
  const arm = (s, e, hand = true) => { line(g, s[0], s[1], e[0], e[1], PC.coat, 2); if (hand) rect(g, e[0] - 1, e[1] - 1, 3, 3, PC.hand); };
  if (F.work0 || F.work1) { arm(sL, [hx - 7, sh - 8 + bob]); arm(sR, [hx + 7, sh - 8 - bob]); }
  else if (F.tell) { arm(sL, [hx - 6, sh - 6]); arm(sR, [hx + 6, sh - 16]); line(g, hx + 6, sh - 16, hx + 2, sh - 22, PC.thread); line(g, hx + 2, sh - 22, hx + 10, sh - 26, PC.gold); }
  else if (F.whip) { arm(sL, [hx - 7, sh - 6]); arm(sR, [hx + 16, sh + 2]); line(g, hx + 17, sh + 2, hx + 20, sh + 4, PC.gold); }
  else if (F.snare) { arm(sL, [hx - 4, sh + 10]); arm(sR, [hx + 10, sh + 8]); ellipse(g, hx + 12, sh + 13, 5, 2, PC.gold); ellipse(g, hx + 12, sh + 13, 3, 1, PC.coat); }
  else if (F.ride || F.climb) { const k = F.climb ? 3 : 0; arm(sL, [PX, sh - 12 - k]); arm(sR, [PX, sh - 4 + k]); line(g, PX, 0, PX, PH - 4, PC.rope); }
  else if (kneel) { const k = f === 7 ? 2 : 0; arm(sL, [hx + 6, hip + 2 - k]); arm(sR, [hx + 10, hip + k]); line(g, hx + 7, hip + 1, hx + 16, hip + 5, PC.thread); px(g, hx + 9, hip + 1 - k, PC.gold); }
  else if (F.cut) { arm(sL, [hx - 2, sh - 16]); arm(sR, [hx + 3, sh - 14]); line(g, hx + 4, sh - 15, hx + 9, sh - 20, PC.knife); line(g, hx - 2, 0, hx - 2, sh - 17, PC.rope); }
  else { arm(sL, [hx - 9, sh + 4]); arm(sR, [hx + 8, sh + 3]); }
}
export function bakePuppeteer() { return bake(13, PW, PH, drawPuppeteer, PX, PUP.w, PUP.h); }

/* ================= THE SOLDIER and THE HARLEQUIN ================= */
const MW = 30, MH = 40, MX = 14;
const MC = { wood: '#c89a60', woodD: '#8a6038', woodL: '#e8c890', red: '#b8382c', redD: '#7a2020', blue: '#3a5aa8', white: '#f0e8d8', gold: '#e8c23a', tin: '#c9d1dc', tinD: '#8a919c',
  cheek: '#e87a6a', black: '#1e1624', green: '#4a8a3a', yel: '#e8c23a', purp: '#7a3e8a' };
/* the frames: 0 hang, 1-2 hop, 3 tell, 4 blow, 5 stagger, 6 heap, 7 rise, 8 drop (hoisted, splayed), 9 HIGH TELL, 10 HIGH BLOW (PUPPETEER2: the
   soldier's thrust drawn back and driven at the head, the harlequin's high kick, the acrobat's swing). THE ACROBAT: a tumbler in a teal and white
   striped leotard, a topknot, bare wooden hands - the one that is hoisted and dropped */
function drawToy(g, f, kind) {
  const sol = kind === 'soldier', acro = kind === 'acrobat';
  const coat = sol ? MC.red : acro ? '#2a8a8a' : MC.purp, coatD = sol ? MC.redD : acro ? '#1a5a5a' : '#4a2258';
  const hTell = f === 9, hBlow = f === 10;
  if (f === 6) {   /* A HEAP: limbs and a head in a pile, pegs showing */
    const y = MH - 3; fillPoly(g, [[MX - 9, y], [MX - 5, y - 5], [MX + 4, y - 6], [MX + 9, y]], coat);
    line(g, MX - 12, y, MX - 4, y - 3, MC.wood, 2); line(g, MX + 3, y - 2, MX + 12, y - 1, MC.wood, 2); line(g, MX - 2, y - 4, MX + 6, y - 9, MC.wood, 2);
    circle(g, MX + 9, y - 5, 3, MC.woodL); px(g, MX + 9, y - 6, MC.black); px(g, MX + 10, y - 4, MC.cheek);
    if (sol) { rect(g, MX + 7, y - 11, 5, 4, MC.black); rect(g, MX + 7, y - 8, 5, 1, MC.gold); line(g, MX - 12, y - 6, MX - 2, y - 2, MC.tin); }
    else if (acro) { px(g, MX + 9, y - 9, MC.black); px(g, MX + 9, y - 10, MC.black); for (let x = MX - 8; x < MX + 8; x += 3) px(g, x, y - 4, MC.white); }
    else { px(g, MX + 6, y - 9, MC.yel); px(g, MX + 12, y - 9, MC.green); line(g, MX + 7, y - 8, MX + 6, y - 9, MC.yel); line(g, MX + 11, y - 8, MX + 12, y - 9, MC.green); }
    return; }
  const drop = f === 8, stag = f === 5, rise = f === 7, tell = f === 3, blow = f === 4, hop = f === 1 || f === 2;
  const foot = MH - 2, lift = hop ? (f === 1 ? 3 : 1) : drop ? 0 : 0, sag = stag ? 2 : rise ? 5 : 0;
  const hip = foot - 11 - lift + sag, sh = hip - 10 + (stag ? 1 : 0), hx = MX + (stag ? -2 : rise ? -1 : 0), hy = sh - 6 + (rise ? 3 : 0);
  /* legs: hanging slack, hopping, splayed for the drop, the harlequin's kick */
  if (drop) { limb(g, [MX - 2, hip], [MX - 7, hip + 4], [MX - 10, hip + 9], MC.wood, MC.woodD, MC.black); limb(g, [MX + 2, hip], [MX + 7, hip + 4], [MX + 10, hip + 9], MC.wood, MC.woodD, MC.black); }
  else if (!sol && blow) { limb(g, [MX - 2, hip], [MX - 3, hip + 6], [MX - 4, foot], MC.wood, MC.woodD, MC.black); limb(g, [MX + 2, hip], [MX + 8, hip + 2], [MX + 15, hip + 3], MC.wood, MC.woodD, MC.black); }
  else if (hTell && !sol) { limb(g, [MX - 2, hip], [MX - 3, hip + 6], [MX - 3, foot], MC.wood, MC.woodD, MC.black); limb(g, [MX + 2, hip], [MX + 8, hip - 5], [MX + 6, hip + 1], MC.wood, MC.woodD, MC.black); }
  else if (hBlow && !sol && !acro) { limb(g, [MX - 2, hip], [MX - 3, hip + 6], [MX - 4, foot], MC.wood, MC.woodD, MC.black); limb(g, [MX + 2, hip], [MX + 9, hip - 7], [MX + 15, hip - 10], MC.wood, MC.woodD, MC.black); }
  else if (hBlow && acro) { limb(g, [MX - 2, hip], [MX + 5, hip + 2], [MX + 13, hip + 1], MC.wood, MC.woodD, MC.black); limb(g, [MX + 2, hip], [MX + 8, hip - 1], [MX + 15, hip - 3], MC.wood, MC.woodD, MC.black); }
  else if (!sol && tell) { limb(g, [MX - 2, hip], [MX - 4, hip + 6], [MX - 3, foot], MC.wood, MC.woodD, MC.black); limb(g, [MX + 2, hip], [MX + 7, hip - 1], [MX + 5, hip + 6], MC.wood, MC.woodD, MC.black); }
  else { const a = hop ? (f === 1 ? 3 : -2) : 0; limb(g, [MX - 2, hip], [MX - 3 - a, hip + 6], [MX - 3, foot - lift], MC.wood, MC.woodD, MC.black); limb(g, [MX + 2, hip], [MX + 3 + a, hip + 6], [MX + 3 + (stag ? 2 : 0), foot - lift], MC.wood, MC.woodD, MC.black); }
  /* the body: a carved block, the coat painted on */
  fillPoly(g, [[hx - 5, sh], [hx + 5, sh], [MX + 4, hip + 1], [MX - 4, hip + 1]], coat);
  if (sol) { line(g, hx - 4, sh + 2, MX + 3, hip - 1, MC.white); line(g, hx + 4, sh + 2, MX - 3, hip - 1, MC.white); rect(g, MX - 4, hip - 1, 9, 2, MC.black); px(g, MX, hip - 1, MC.gold); }
  else if (acro) { for (let y = sh + 1; y < hip; y += 2) line(g, hx - 4, y, hx + 4, y, MC.white); }
  else { for (let y = sh + 1; y < hip; y += 3) for (let x = hx - 4 + ((y >> 1) & 1) * 2; x < hx + 5; x += 4) { px(g, x, y, (x + y) & 2 ? MC.yel : MC.green); px(g, x + 1, y + 1, coatD); } }
  /* the head: a carved ball, painted eyes and cheeks; a ruff for the harlequin */
  if (!sol && !acro) { rect(g, hx - 5, sh - 1, 11, 2, MC.white); for (let x = hx - 5; x <= hx + 5; x += 2) px(g, x, sh, '#c8c0b0'); }
  circle(g, hx, hy, 4, MC.woodL); px(g, hx + 1, hy - 1, MC.black); px(g, hx + 3, hy - 1, MC.black); px(g, hx + 2, hy + 1, MC.cheek); px(g, hx - 1, hy + 1, MC.cheek); line(g, hx + 1, hy + 2, hx + 3, hy + 2, MC.red);
  if (!sol && !acro) { rect(g, hx, hy - 2, 5, 2, MC.black); }   /* the harlequin's black half-mask */
  if (sol) { rect(g, hx - 3, hy - 10, 7, 7, MC.black); rect(g, hx - 3, hy - 5, 7, 1, MC.gold); rect(g, hx - 1, hy - 12, 3, 2, MC.red); }   /* the shako */
  else if (acro) { rect(g, hx - 1, hy - 7, 3, 3, MC.black); px(g, hx, hy - 8, MC.black); rect(g, hx - 1, hy - 5, 3, 1, '#2a8a8a'); }   /* the topknot */
  else { fillPoly(g, [[hx - 4, hy - 3], [hx - 9, hy - 9], [hx - 1, hy - 4]], MC.yel); fillPoly(g, [[hx + 4, hy - 3], [hx + 9, hy - 9], [hx + 1, hy - 4]], MC.green); px(g, hx - 9, hy - 10, MC.gold); px(g, hx + 9, hy - 10, MC.gold); }
  /* the arms: hanging by their strings, or doing the blow */
  const sL = [hx - 5, sh + 1], sR = [hx + 5, sh + 1];
  let eR, hR, eL, hL;
  if (hTell) { eR = sol ? [hx - 3, sh + 2] : [hx + 6, sh - 6]; hR = sol ? [hx - 8, sh + 1] : [hx + 6, sh - 12]; eL = [hx - 6, sh - 5]; hL = [hx - 6, sh - 11]; }
  else if (hBlow) { eR = [hx + 8, sh]; hR = [hx + 14, sh - 1]; eL = acro ? [hx + 6, sh - 4] : [hx - 7, sh + 2]; hL = acro ? [hx + 12, sh - 5] : [hx - 10, sh]; }
  else if (drop) { eR = [hx + 9, sh - 3]; hR = [hx + 13, sh - 8]; eL = [hx - 9, sh - 3]; hL = [hx - 13, sh - 8]; }
  else if (tell) { eR = [hx + 5, sh - 6]; hR = sol ? [hx + 7, sh - 12] : [hx + 9, sh - 3]; eL = [hx - 6, sh + 4]; hL = [hx - 7, sh + 9]; }
  else if (blow) { eR = [hx + 9, sh + 2]; hR = sol ? [hx + 15, sh + 8] : [hx + 12, sh - 2]; eL = [hx - 7, sh + 3]; hL = [hx - 10, sh + 1]; }
  else if (stag) { eR = [hx + 6, sh + 6]; hR = [hx + 5, sh + 12]; eL = [hx - 6, sh + 5]; hL = [hx - 7, sh + 11]; }
  else { const k = hop && f === 1 ? -2 : 0; eR = [hx + 7, sh + 4 + k]; hR = [hx + 7, sh - 1 + k]; eL = [hx - 7, sh + 4 - k]; hL = [hx - 7, sh - 1 - k]; }
  limb(g, sL, eL, hL, MC.wood, MC.woodD, MC.black); limb(g, sR, eR, hR, MC.wood, MC.woodD, MC.black);
  if (sol) {   /* the tin sword in the right hand, a painted round shield on the left */
    const [x, y] = hR, up = tell, sw = blow;
    if (hTell) line(g, x, y, x - 10, y, MC.tin, 2); else if (hBlow) line(g, x, y, x + 13, y - 1, MC.tin, 2); else if (up) line(g, x, y, x - 2, y - 11, MC.tin, 2); else if (sw) line(g, x, y, x + 10, y + 5, MC.tin, 2); else line(g, x, y, x + 3, y + 10, MC.tin, 2);
    px(g, x, y, MC.gold); circle(g, hL[0] - 1, hL[1] + 2, 3, MC.blue); px(g, hL[0] - 1, hL[1] + 2, MC.gold); }
  else { px(g, hR[0], hR[1], MC.gold); px(g, hL[0], hL[1], MC.gold); }
  if (rise) { px(g, hx - 7, sh - 4, MC.gold); px(g, hx + 7, sh - 4, MC.gold); }
}
export function bakeMarionette() { return bake(11, MW, MH, (g, f) => drawToy(g, f, 'soldier'), MX, 12, 30); }
export function bakeHarlequin() { return bake(11, MW, MH, (g, f) => drawToy(g, f, 'harlequin'), MX, 12, 28); }
export function bakeAcrobat() { return bake(11, MW, MH, (g, f) => drawToy(g, f, 'acrobat'), MX, 12, 28); }

/* ================= THE STAGE'S IRON (PUPPETEER2: Daniel, "a wood platform that doesn't quite fit") =================
   THE FLY GALLERY is an iron catwalk: a grating of flat bars on a channel-iron stringer, rivets, a truss under it, and a warm lit lip along its top edge so
   the footing reads. A FLAT'S TOP is the painted flat's own capping rail: a gilt-edged batten with the canvas's top showing under it. */
export function bakeStageSkins() {
  const grate = [0, 1, 2].map(v => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 3, '#3a3a46'); rect(g, 0, 0, 16, 1, '#ffd36b'); rect(g, 0, 1, 16, 1, '#c8a060');   /* the lit lip */
    for (let x = 1; x < 16; x += 3) rect(g, x, 1, 1, 2, '#1e1e26');   /* the grating's gaps */
    rect(g, 0, 3, 16, 3, '#55556a'); rect(g, 0, 3, 16, 1, '#7a7a90'); rect(g, 0, 5, 16, 1, '#2a2a34');   /* the stringer */
    px(g, 3 + v * 3, 4, '#c9d1dc'); px(g, 11 - v, 4, '#c9d1dc');   /* rivets */
    line(g, v === 1 ? 15 : 0, 6, v === 1 ? 0 : 15, 13, '#3a3a46'); line(g, 0, 6, 0, 13, '#2a2a34'); line(g, 15, 6, 15, 13, '#2a2a34');   /* the truss */
    rect(g, 0, 13, 16, 1, '#2a2a34'); return c; });
  const [fc, fg] = canvas(16, 16); rect(fg, 0, 0, 16, 4, '#8a6a2a'); rect(fg, 0, 0, 16, 1, '#ffd36b'); for (let x = 1; x < 16; x += 4) px(fg, x, 2, '#fff0b0');
  rect(fg, 0, 4, 16, 12, '#3a5a6a'); for (let x = 0; x < 16; x += 5) line(fg, x, 4, x + 3, 15, '#4a7080');
  return { grate, flatTop: fc };
}

/* ================= THE MASTERPIECE ================= */
const GW = 80, GH = 104, GX = 38;
const GC = { wood: '#b8844c', woodD: '#7a5028', woodL: '#e0b87a', robe: '#8a1a2a', robeD: '#5a0e1a', robeL: '#b83040', ermine: '#f0ece0', spot: '#1e1624', gold: '#e8c23a', goldD: '#a87a18', paint: '#f4d8c0', cheek: '#e05a4a', eye: '#1e1624' };
/* 0 hang, 1-2 walk, 3 swat tell (arm back), 4 swat, 5 stomp tell (knee up), 6 stomp, 7 reach tell (arm up), 8 reach (arm up and out: the long reach is drawn by the hands), 9 stagger, 10 heap */
function drawMaster(g, f) {
  if (f === 10) {   /* THE HEAP: the king in pieces on the boards, the crown rolled off */
    const y = GH - 3; fillPoly(g, [[GX - 26, y], [GX - 18, y - 12], [GX + 2, y - 16], [GX + 20, y - 10], [GX + 28, y]], GC.robe);
    rect(g, GX - 24, y - 8, 50, 3, GC.ermine); for (let x = GX - 22; x < GX + 24; x += 5) px(g, x, y - 7, GC.spot);
    line(g, GX - 34, y - 1, GX - 20, y - 6, GC.wood, 3); line(g, GX + 18, y - 4, GX + 36, y - 2, GC.wood, 3); circle(g, GX + 26, y - 14, 7, GC.paint); px(g, GX + 28, y - 16, GC.eye); px(g, GX + 24, y - 16, GC.eye); line(g, GX + 23, y - 11, GX + 29, y - 11, GC.cheek);
    fillPoly(g, [[GX - 36, y], [GX - 34, y - 8], [GX - 31, y - 4], [GX - 28, y - 9], [GX - 25, y - 4], [GX - 22, y - 8], [GX - 20, y]], GC.gold); return; }
  const walk = f === 1 || f === 2, stT = f === 5, st = f === 6, swT = f === 3, sw = f === 4, rT = f === 7, r = f === 8, stag = f === 9;
  const foot = GH - 2, hip = foot - 38 + (stag ? 4 : 0), sh = hip - 30, hx = GX + (stag ? -3 : 0), hy = sh - 12;
  /* legs: thick jointed timbers; one knee high for the stomp tell */
  const legL = walk && f === 1 ? -4 : 0, legR = walk && f === 2 ? -4 : 0;
  line(g, GX - 7, hip, GX - 9, hip + 18 + legL, GC.wood, 5); line(g, GX - 9, hip + 18 + legL, GX - 9, foot - 2 + legL, GC.wood, 5); rect(g, GX - 14, foot - 3 + legL, 10, 3, GC.woodD); px(g, GX - 9, hip + 18 + legL, GC.spot);
  if (stT) { line(g, GX + 7, hip, GX + 14, hip + 10, GC.wood, 5); line(g, GX + 14, hip + 10, GX + 14, hip + 24, GC.wood, 5); rect(g, GX + 9, hip + 24, 11, 3, GC.woodD); }
  else if (st) { line(g, GX + 7, hip, GX + 12, hip + 18, GC.wood, 5); line(g, GX + 12, hip + 18, GX + 14, foot - 2, GC.wood, 5); rect(g, GX + 8, foot - 3, 14, 3, GC.woodD); }
  else { line(g, GX + 7, hip, GX + 9, hip + 18 + legR, GC.wood, 5); line(g, GX + 9, hip + 18 + legR, GX + 9, foot - 2 + legR, GC.wood, 5); rect(g, GX + 4, foot - 3 + legR, 10, 3, GC.woodD); px(g, GX + 9, hip + 18 + legR, GC.spot); }
  /* the robe and its ermine */
  fillPoly(g, [[hx - 12, sh], [hx + 12, sh], [GX + 16, hip + 6], [GX - 16, hip + 6]], GC.robe);
  line(g, hx - 10, sh + 4, GX - 13, hip + 4, GC.robeL); line(g, hx + 10, sh + 4, GX + 13, hip + 4, GC.robeD);
  rect(g, GX - 16, hip + 4, 33, 4, GC.ermine); for (let x = GX - 14; x < GX + 16; x += 5) px(g, x, hip + 5, GC.spot);
  rect(g, hx - 13, sh - 1, 27, 5, GC.ermine); for (let x = hx - 11; x < hx + 13; x += 5) px(g, x, sh + 1, GC.spot);
  rect(g, hx - 2, sh + 6, 5, 18, GC.gold); px(g, hx, sh + 10, GC.robeD); px(g, hx, sh + 16, GC.robeD);
  /* the head: carved and painted, a fixed grin, a crown */
  circle(g, hx, hy, 9, GC.paint); rect(g, hx - 1, hy + 8, 3, 4, GC.woodD);
  px(g, hx + 2, hy - 2, GC.eye); px(g, hx + 5, hy - 2, GC.eye); px(g, hx + 3, hy - 3, GC.eye); rect(g, hx - 5, hy + 1, 2, 2, GC.cheek); rect(g, hx + 6, hy + 1, 2, 2, GC.cheek);
  line(g, hx - 1, hy + 4, hx + 7, hy + 4, GC.eye); line(g, hx - 1, hy + 4, hx - 2, hy + 3, GC.eye); line(g, hx + 7, hy + 4, hx + 8, hy + 3, GC.eye); line(g, hx, hy + 5, hx + 6, hy + 5, GC.cheek);
  line(g, hx - 9, hy + 4, hx - 9, hy + 8, GC.woodD); line(g, hx + 9, hy + 4, hx + 9, hy + 8, GC.woodD);   /* the jaw's hinge lines: it is a puppet's mouth */
  fillPoly(g, [[hx - 8, hy - 7], [hx - 8, hy - 15], [hx - 5, hy - 10], [hx - 2, hy - 17], [hx + 1, hy - 10], [hx + 4, hy - 17], [hx + 7, hy - 10], [hx + 9, hy - 15], [hx + 9, hy - 7]], GC.gold);
  line(g, hx - 8, hy - 7, hx + 9, hy - 7, GC.goldD); px(g, hx - 2, hy - 17, GC.robeL); px(g, hx + 4, hy - 17, GC.robeL);
  /* the arms: long jointed timbers with great carved hands */
  const sL = [hx - 12, sh + 3], sR = [hx + 12, sh + 3];
  const arm = (s, e, h) => { line(g, s[0], s[1], e[0], e[1], GC.wood, 4); line(g, e[0], e[1], h[0], h[1], GC.wood, 4); px(g, e[0], e[1], GC.spot); circle(g, h[0], h[1], 4, GC.woodL); px(g, h[0], h[1], GC.woodD); };
  if (swT) { arm(sL, [hx - 16, sh + 16], [hx - 14, sh + 30]); arm(sR, [hx + 4, sh - 8], [hx - 8, sh - 14]); }
  else if (sw) { arm(sL, [hx - 16, sh + 16], [hx - 14, sh + 30]); arm(sR, [hx + 26, sh + 16], [hx + 38, sh + 30]); }
  else if (rT || r) { arm(sL, [hx - 16, sh + 16], [hx - 15, sh + 30]); arm(sR, [hx + 14, sh - 14], [hx + (r ? 26 : 16), sh - (r ? 26 : 30)]); }
  else if (stT) { arm(sL, [hx - 20, sh + 4], [hx - 30, sh - 2]); arm(sR, [hx + 20, sh + 4], [hx + 30, sh - 2]); }
  else if (stag) { arm(sL, [hx - 14, sh + 18], [hx - 12, sh + 34]); arm(sR, [hx + 14, sh + 18], [hx + 10, sh + 34]); }
  else { const k = walk ? (f === 1 ? 3 : -3) : 0; arm(sL, [hx - 16, sh + 16 + k], [hx - 18, sh + 30]); arm(sR, [hx + 16, sh + 16 - k], [hx + 18, sh + 30]); }
}
export function bakeMasterpiece() { return bake(11, GW, GH, drawMaster, GX, PUP.mW, PUP.mH); }
