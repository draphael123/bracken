// src/redraw/welltown_art.js - THE WELL TOWN's PLACEHOLDER art (claude/welltown, the greybox; the Sonnet art lane replaces every piece of it). px.js
// primitives only. The contract is caravan_bandits.js's: every frame faces RIGHT (L is the flip), one canvas size per set, ax = the body's centre
// column, ay = the row under the feet, w/h = the hit box.
//   bakeBanditBowman()  THE BANDIT BOWMAN - the archer's frames on a man of the town (0 stand | 1 draw | 2,3 walk | 4 stand | 5 full draw | 6 loose | 7 hurt)
//   bakeWaterThief(ct)  THE WATER-THIEF - the cutthroat's frames (src/redraw/caravan_bandits.js) dyed the wells' blue, a skin at his hip
//   bakeBanditKing()    THE BANDIT KING - a big man in brass and mud plate, a scimitar, a sling of oil jars (KING_F names the frames)
//   bakeSkinIcon()      a full water-skin (the level's four quest pickups)      bakeGourdIcon()  THE WELL-KEEPER'S GOURD (the vault's relic)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };

/* ---------- THE BANDIT BOWMAN ---------- */
const BW = { robe: '#c9b089', robeD: '#9a8462', wrap: '#7a3a2a', skin: '#b07a52', veil: '#3a2a22', bow: '#6a4426', string: '#e8e0c8', arrow: '#c9d1dc', pants: '#5a4634', boot: '#2a1c12', eye: '#f0dca0' };
export function bakeBanditBowman() {
  const W = 30, H = 34, cx = 13, G = 33;
  const F = Array.from({ length: 8 }, (_, f) => { const [c, g] = canvas(W, H);
    const walk = f === 2 || f === 3, hurt = f === 7, k = f === 3 ? 1 : 0, lean = hurt ? -2 : 0, top = 12, hip = 22;
    for (const [lx, st] of [[cx - 3, walk ? (k ? -2 : 2) : 0], [cx + 1, walk ? (k ? 2 : -2) : 0]]) { rect(g, lx + st, hip, 3, G - 2 - hip, BW.pants); rect(g, lx + st - 1, G - 2, 4, 2, BW.boot); }
    fillPoly(g, [[cx - 4 + lean, top], [cx + 4 + lean, top], [cx + 5, hip + 2], [cx - 5, hip + 2]], BW.robe);
    line(g, cx + 3 + lean, top + 1, cx + 4, hip + 1, BW.robeD); rect(g, cx - 4 + lean, top + 6, 9, 2, BW.wrap);
    const hx = cx + 1 + lean, hy = top - 5; circle(g, hx, hy, 3.5, BW.skin); ellipse(g, hx - 0.5, hy - 2, 4.2, 2.3, BW.wrap); rect(g, hx - 3, hy + 1, 7, 3, BW.veil); px(g, hx + 2, hy - 1, BW.eye);
    /* the bow: down at his side (stand), raised and drawn (1, 5), loosed (6) */
    const drawn = f === 1 || f === 5, loose = f === 6, raised = drawn || loose;
    if (raised) { const bx = cx + 8, by = top + 1, pull = f === 5 ? 6 : f === 1 ? 3 : 0;
      line(g, bx, by - 8, bx + 2, by, BW.bow, 2); line(g, bx + 2, by, bx, by + 8, BW.bow, 2);
      line(g, bx, by - 8, bx - pull, by, BW.string); line(g, bx - pull, by, bx, by + 8, BW.string);
      line(g, cx + 3 + lean, top + 2, bx, by, BW.skin, 2); if (drawn) { line(g, bx - pull, by, bx + 6, by, BW.arrow); line(g, cx + 2, top + 3, bx - pull, by, BW.skin); } }
    else { line(g, cx + 5, top + 2, cx + 7, hip + 4, BW.bow, 2); line(g, cx + 4, top + 3, cx + 6, hip + 3, BW.string); line(g, cx + 3 + lean, top + 2, cx + 6, top + 9, BW.skin, 2); }
    outline(c, OUT); return c; });
  return pack(F, cx, G, 10, 22);
}

/* ---------- THE WATER-THIEF: the cutthroat dyed blue (his robe, his sash), a skin at his hip ---------- */
const DYE = { '#35305a': '#4a7ab0', '#554e86': '#7aa8d8', '#201c38': '#2a4a70', '#b8382c': '#2a8ab8', '#842218': '#1a5a80' };
function dyed(c) { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  const map = Object.entries(DYE).map(([a, b]) => [[1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16))]);
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; for (const [a, b] of map) if (p[i] === a[0] && p[i + 1] === a[1] && p[i + 2] === a[2]) { p[i] = b[0]; p[i + 1] = b[1]; p[i + 2] = b[2]; break; } }
  g.putImageData(img, 0, 0); return d; }
export function bakeWaterThief(ct) {
  const F = ct.R.map((c, f) => { const d = dyed(c), g = d.getContext('2d'), x = ct.ax - 5, y = d.height - 10; ellipse(g, x, y, 2.5, 3, '#c9a070'); px(g, x, y - 3, '#6a4426'); px(g, x - 1, y, '#e8d4a8'); return d; });
  return pack(F, ct.ax, ct.ay, 10, 18);
}

/* ---------- THE BANDIT KING ---------- */
export const KING_F = { stand: 0, walk: [1, 2], sweepTell: 3, sweep: 4, knivesTell: 5, knives: 6, jarTell: 7, jar: 8, chargeTell: 9, charge: 10, open: 11, hurt: 12, dead: 13 };
const KG = { brass: '#c9962a', brassL: '#f0c860', brassD: '#8a5e18', mud: '#7a5a3a', mudD: '#4e3622', cloth: '#7a2a2a', clothD: '#4e1a1a', skin: '#a8704a', beard: '#2a1a12',
  steel: '#c9d1dc', steelL: '#f4f8ff', jar: '#b8743a', jarL: '#e0a060', oil: '#3a2a12', eye: '#f0dca0', steam: '#e8f4f8' };
export function bakeBanditKing() {
  const W = 64, H = 60, cx = 28, G = 58;
  const F = Array.from({ length: 14 }, (_, f) => { const [c, g] = canvas(W, H);
    if (f === KING_F.dead) { ellipse(g, cx, G - 6, 20, 6, KG.mud); ellipse(g, cx - 6, G - 9, 8, 5, KG.brass); circle(g, cx + 14, G - 8, 5, KG.skin); line(g, cx - 18, G - 3, cx - 30, G - 1, KG.steel, 2); outline(c, OUT); return c; }
    const walk = f === 1 || f === 2, lean = f === KING_F.charge ? 4 : f === KING_F.chargeTell ? -3 : f === KING_F.hurt ? -3 : f === KING_F.open ? -2 : 0, top = 18, hip = 40;
    const st = walk ? (f === 1 ? 3 : -3) : f === KING_F.charge ? 4 : 0;
    rect(g, cx - 8 + st, hip, 6, G - hip - 3, KG.cloth); rect(g, cx + 2 - st, hip, 6, G - hip - 3, KG.clothD);
    rect(g, cx - 10 + st, G - 4, 9, 4, KG.mudD); rect(g, cx + 1 - st, G - 4, 9, 4, KG.mudD);
    fillPoly(g, [[cx - 11 + lean, top], [cx + 11 + lean, top], [cx + 13, hip + 3], [cx - 13, hip + 3]], KG.mud);              /* the mud plate */
    rect(g, cx - 10 + lean, top + 4, 20, 4, KG.brass); rect(g, cx - 10 + lean, top + 4, 20, 1, KG.brassL); rect(g, cx - 12, hip - 2, 25, 4, KG.brassD);   /* brass bands, the belt */
    for (let i = 0; i < 3; i++) px(g, cx - 6 + i * 6 + lean, top + 14, KG.mudD);
    for (let i = 0; i < 3; i++) { ellipse(g, cx - 14 + lean, top + 10 + i * 7, 3, 3.5, KG.jar); px(g, cx - 14 + lean, top + 7 + i * 7, KG.oil); }   /* the sling of oil jars */
    const hx = cx + 2 + lean, hy = top - 7; circle(g, hx, hy, 6, KG.skin); ellipse(g, hx, hy + 4, 6, 4, KG.beard); ellipse(g, hx, hy - 5, 7, 3, KG.cloth); rect(g, hx - 7, hy - 6, 14, 2, KG.brass);
    px(g, hx + 3, hy - 1, KG.eye); px(g, hx + 4, hy - 1, KG.eye);
    const sh = [cx + 10 + lean, top + 4];
    const blade = (x0, y0, x1, y1, col) => { line(g, x0, y0, x1, y1, col, 2); px(g, x1, y1, KG.steelL); };
    if (f === KING_F.sweepTell) { line(g, ...sh, cx - 6, top - 10, KG.skin, 3); blade(cx - 6, top - 10, cx - 24, top - 22, KG.steelL); }
    else if (f === KING_F.sweep) { line(g, ...sh, cx + 22, top + 12, KG.skin, 3); blade(cx + 22, top + 12, cx + 34, top + 24, KG.steel); for (let i = 0; i < 8; i++) px(g, cx + 14 + i * 3, top - 4 + i * 4, KG.steelL); }
    else if (f === KING_F.knivesTell) { line(g, ...sh, cx + 6, top - 8, KG.skin, 3); for (let i = 0; i < 3; i++) line(g, cx + 4 + i * 3, top - 9, cx + 6 + i * 3, top - 15, KG.steel); }
    else if (f === KING_F.knives) { line(g, ...sh, cx + 26, top + 6, KG.skin, 3); for (let i = -1; i <= 1; i++) line(g, cx + 30, top + 6 + i * 4, cx + 36, top + 6 + i * 6, KG.steelL); }
    else if (f === KING_F.jarTell) { line(g, ...sh, cx + 4, top - 12, KG.skin, 3); ellipse(g, cx + 4, top - 15, 4, 5, KG.jar); px(g, cx + 4, top - 20, '#ff8a3a'); px(g, cx + 5, top - 21, '#ffd36b'); }
    else if (f === KING_F.jar) { line(g, ...sh, cx + 24, top - 2, KG.skin, 3); }
    else if (f === KING_F.chargeTell || f === KING_F.charge) { line(g, ...sh, cx + 16, top + 14, KG.skin, 3); blade(cx + 16, top + 14, cx + 10, top + 30, KG.steel); rect(g, cx + 8 + lean, top - 2, 6, 10, KG.brassD); }
    else { line(g, ...sh, cx + 14, top + 16, KG.skin, 3); blade(cx + 14, top + 16, cx + 26, top + 26, KG.steel); }
    if (f === KING_F.open) for (let i = 0; i < 9; i++) circle(g, cx - 10 + i * 3, top - 4 - (i % 3) * 4, 2.5, KG.steam);   /* blind in the steam, the mud running */
    outline(c, OUT); return c; });
  return pack(F, cx, G, 22, 40);
}

/* ---------- ICONS ---------- */
export function bakeSkinIcon() { const [c, g] = canvas(12, 12); ellipse(g, 6, 7, 4.5, 4, '#c9a070'); ellipse(g, 6, 6, 3, 2.5, '#e8c890'); rect(g, 5, 1, 2, 3, '#6a4426'); rect(g, 4, 1, 4, 1, '#3a7ab8'); px(g, 8, 8, '#7ab8e8'); outline(c, OUT); return c; }
export function bakeGourdIcon() { const [c, g] = canvas(10, 12); circle(g, 5, 8, 3.5, '#c9962a'); circle(g, 5, 4, 2.2, '#e0b040'); rect(g, 4, 0, 2, 2, '#6a4426'); px(g, 4, 7, '#f0d070'); px(g, 6, 9, '#3a7ab8'); outline(c, OUT); return c; }
