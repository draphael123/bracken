// burial-looks.js — ONE BACKDROP PER SECTION (claude/burial2, 2026-09-26; brief docs/briefs/burial-rework-2.md §1).
// The level review, 2026-09-24: "One backdrop for the whole level. The skull-niche wall is behind the Candle Path, the Grave
// Causeway, the Restless Rows, the Charnel Galleries, the Drowned Ossuary, the Bone Stairs, the Last Procession, the mini arena
// and the boss arena. It is the single biggest reason it reads as boring." Now the skull-niche wall is THE OSSUARY's alone
// (main.js paints 'ossuary' as it always did), and the other four are here:
//   barrow      an earth-cut barrow: packed earth in strata, a dry-stone revetment along its foot, burial niches cut into it with a
//               shrouded body in each, and timber props holding the roof
//   crypt       a flooded crypt: an arcade of round arches on square piers, the dark behind them, and a tide line of green scum
//   bonestair   a bone-stair shaft: dark rock with a stair of stacked long bones climbing it in flights, skulls set in the risers
//   procession  a processional hall: dressed stone, tall pillars, a stone effigy of a crowned dead king in a niche between each two,
//               and banners hanging between them that move in the draught
// A SEAM between two of them (structures kind 'seam', found by the builder) gets a pillar over the join.
// Painted in the room's own coordinates, so nothing crawls when the camera moves (drawRoom translates and clips).
export const BURIAL_LOOKS = ['barrow', 'crypt', 'bonestair', 'procession'];
const hsh = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

function barrow(g, sx, sy, w, h, tx0, ty0) {
  R(g, sx, sy, w, h, '#3a342d');
  /* the strata: bands of a darker and a paler earth, wandering a little, the way a cut face shows the ground */
  for (let y = 6, k = 0; y < h; y += 11 + Math.floor(hsh(k, tx0) * 7), k++) { const c = k % 3 === 0 ? '#2f2a25' : k % 3 === 1 ? '#453d34' : '#3f3830';
    for (let x = 0; x < w; x += 24) { const j = Math.round((hsh(x + tx0 * 16, k) - 0.5) * 4); R(g, sx + x, sy + y + j, 24, 2 + (k % 2), c); } }
  for (let i = 0; i < w * h / 260; i++) { const x = Math.floor(hsh(i, tx0 + 1) * w), y = Math.floor(hsh(i + 7, ty0 + 3) * h); R(g, sx + x, sy + y, 1, 1, hsh(i, 3) < 0.5 ? '#2a2521' : '#51483d'); }
  /* the niches: a rounded cut in the earth with a shrouded body laid in it, two rows of them */
  for (let x = 20 + ((tx0 * 7) % 30); x < w - 30; x += 56) for (const y of [Math.max(12, h - 118), h - 70]) { if (y < 6 || hsh(x, y) < 0.25) continue;
    R(g, sx + x, sy + y + 3, 30, 11, '#1a1715'); R(g, sx + x + 2, sy + y, 26, 3, '#1a1715'); R(g, sx + x - 2, sy + y + 14, 34, 2, '#5a5046');
    R(g, sx + x + 3, sy + y + 8, 24, 5, '#8c8272'); R(g, sx + x + 3, sy + y + 8, 24, 1, '#a89e8a'); R(g, sx + x + 4, sy + y + 7, 5, 3, '#a89e8a');
    for (let k = 9; k < 26; k += 4) R(g, sx + x + k, sy + y + 8, 1, 5, '#6e6556'); }
  /* the revetment: dry-stone courses along the foot, the stones not quite square */
  for (let y = h - 34; y < h; y += 8) for (let x = ((y >> 3) % 2) * 7 - 7, n = 0; x < w; n++) { const sw = 10 + Math.floor(hsh(x + tx0 * 16, y) * 9);
    R(g, sx + x, sy + y, sw - 1, 7, hsh(x, y + 1) < 0.5 ? '#5a5248' : '#4e473e'); R(g, sx + x, sy + y, sw - 1, 1, '#6e665a'); x += sw; }
  /* timber props: a post each side and a lintel, every eight tiles, holding the roof up */
  for (let x = 48 + ((tx0 * 5) % 64); x < w; x += 128) { R(g, sx + x, sy, 5, h - 34, '#4a3a2a'); R(g, sx + x + 1, sy, 1, h - 34, '#6a5438');
    R(g, sx + x + 34, sy, 5, h - 34, '#4a3a2a'); R(g, sx + x + 35, sy, 1, h - 34, '#6a5438'); R(g, sx + x - 3, sy + 4, 45, 5, '#56432e'); R(g, sx + x - 3, sy + 4, 45, 1, '#735a3c'); }
}
function crypt(g, sx, sy, w, h, tx0, ty0) {
  R(g, sx, sy, w, h, '#26333a');
  for (let y = 0; y < h; y += 10) for (let x = ((y / 10) % 2) * 14; x < w; x += 28) { R(g, sx + x, sy + y, 27, 9, '#2e3d44'); R(g, sx + x, sy + y, 27, 1, '#3a4b52'); }
  /* the arcade: square piers and round arches, the dark of the aisle behind each */
  const span = 88, pier = 14, top = Math.max(8, h - 150);
  for (let x = ((tx0 * 16) % span) - span; x < w + span; x += span) {
    const ax = sx + x + pier, aw = span - pier, ay = sy + top + 26;
    R(g, ax, ay, aw, h - top - 26, '#141c20'); g.fillStyle = '#141c20'; g.beginPath(); g.ellipse(ax + aw / 2, ay, aw / 2, 26, 0, Math.PI, 0); g.fill();
    g.strokeStyle = '#4a5c62'; g.lineWidth = 3; g.beginPath(); g.ellipse(ax + aw / 2, ay, aw / 2 + 1, 27, 0, Math.PI, 0); g.stroke();
    for (let k = -3; k <= 3; k++) { const a = Math.PI * (0.5 + k / 7.5); R(g, Math.round(ax + aw / 2 + Math.cos(a) * (aw / 2 + 1)) - 1, Math.round(ay - Math.sin(a) * 27) - 1, 3, 3, '#5a6e74'); }
    R(g, sx + x, sy + top, pier, h - top, '#3e4f56'); R(g, sx + x, sy + top, 2, h - top, '#56686e'); R(g, sx + x - 2, ay - 4, pier + 4, 4, '#56686e');
    for (let y = sy + top + 8; y < sy + h; y += 12) R(g, sx + x, y, pier, 1, '#2c3a40'); }
  /* the tide line: where the black water has stood, green-black scum and a paler rim, and weed hanging under it */
  const tl = h - 44; R(g, sx, sy + tl, w, 3, '#2e4a34'); R(g, sx, sy + tl - 1, w, 1, '#5a7a4e'); R(g, sx, sy + tl + 3, w, h - tl - 3, 'rgba(10,20,18,0.45)');
  for (let x = (tx0 * 3) % 9; x < w; x += 9) R(g, sx + x, sy + tl + 3, 1, 2 + Math.floor(hsh(x, tx0) * 6), '#2e4a34');
  for (let x = 30; x < w; x += 71) R(g, sx + x, sy + top + 30, 1, tl - top - 30, 'rgba(120,150,150,0.18)');   /* water that runs down the stone */
}
function bonestair(g, sx, sy, w, h, tx0, ty0) {
  R(g, sx, sy, w, h, '#2a2528');
  for (let i = 0; i < w * h / 180; i++) { const x = Math.floor(hsh(i, tx0 + 5) * w), y = Math.floor(hsh(i + 3, ty0) * h); R(g, sx + x, sy + y, 2, 1, hsh(i, 9) < 0.5 ? '#221e20' : '#36302f'); }
  /* THE STAIR: flights of stacked long bones climbing the rock, a skull set in every riser */
  const flight = 64, rise = 12, run = 14;
  for (let fy = h + ((ty0 * 16) % flight); fy > -flight; fy -= flight) { const dir = (Math.floor((fy + ty0 * 16) / flight) & 1) ? 1 : -1;
    for (let s = 0; s < 5; s++) { const x = dir > 0 ? 8 + s * run * 2 : w - 8 - (s + 1) * run * 2, y = fy - s * rise;
      for (let rep = 0; rep < w; rep += 190) { const bx = sx + x + rep;
        R(g, bx, sy + y, run * 2, 3, '#b8ae98'); R(g, bx, sy + y, run * 2, 1, '#d8cfb8'); R(g, bx - 1, sy + y - 1, 3, 5, '#d8cfb8'); R(g, bx + run * 2 - 2, sy + y - 1, 3, 5, '#d8cfb8');
        R(g, bx, sy + y + 3, run * 2, 8, '#433b37'); for (let k = 3; k < run * 2 - 4; k += 9) { R(g, bx + k, sy + y + 5, 6, 5, '#a89e88'); R(g, bx + k + 1, sy + y + 6, 1, 2, '#2a2528'); R(g, bx + k + 4, sy + y + 6, 1, 2, '#2a2528'); } } } }
}
function procession(g, sx, sy, w, h, tx0, ty0, time) {
  R(g, sx, sy, w, h, '#37323b');
  for (let y = 0; y < h; y += 14) for (let x = ((y / 14) % 2) * 18; x < w; x += 36) { R(g, sx + x, sy + y, 35, 13, '#403a45'); R(g, sx + x, sy + y, 35, 1, '#4e4754'); }
  const bay = 96;
  for (let x = ((tx0 * 16) % bay) - bay; x < w + bay; x += bay) {
    /* the pillar: base, shaft with its fluting, and a capital */
    const px = sx + x; R(g, px, sy, 16, h, '#57505e'); R(g, px + 2, sy, 1, h, '#6e6676'); R(g, px + 7, sy, 1, h, '#4a4452'); R(g, px + 12, sy, 1, h, '#4a4452');
    R(g, px - 3, sy + 10, 22, 5, '#6e6676'); R(g, px - 3, sy + h - 8, 22, 8, '#4a4452');
    /* between each two: a niche with a crowned effigy standing in it, and a banner either side */
    const nx = px + 16 + (bay - 16) / 2 - 14, ny = sy + h - 104;
    if (ny > sy + 16) { R(g, nx, ny, 28, 96, '#1e1a22'); g.fillStyle = '#1e1a22'; g.beginPath(); g.ellipse(nx + 14, ny, 14, 10, 0, Math.PI, 0); g.fill();
      R(g, nx + 7, ny + 20, 14, 64, '#7a7482'); R(g, nx + 8, ny + 20, 3, 64, '#948ea0'); R(g, nx + 9, ny + 8, 10, 12, '#8a8494');   /* the robe and the head */
      R(g, nx + 8, ny + 4, 12, 4, '#a89a5a'); R(g, nx + 8, ny + 2, 2, 2, '#a89a5a'); R(g, nx + 13, ny + 2, 2, 2, '#a89a5a'); R(g, nx + 18, ny + 2, 2, 2, '#a89a5a');   /* his crown */
      R(g, nx + 11, ny + 12, 2, 2, '#1e1a22'); R(g, nx + 15, ny + 12, 2, 2, '#1e1a22'); R(g, nx + 10, ny + 36, 8, 3, '#948ea0'); R(g, nx + 13, ny + 30, 2, 40, '#6a6472');   /* hands on a sword */
      R(g, nx + 4, ny + 84, 20, 12, '#4e4754'); R(g, nx + 4, ny + 84, 20, 1, '#6e6676'); }
    for (const bx of [px + 22, px + bay - 30]) { const sway = Math.round(Math.sin(time * 0.9 + bx * 0.05) * 1.5), by = sy + 14, bh = Math.min(70, h - 60);
      R(g, bx - 2, by, 12, 2, '#6a5a3a'); R(g, bx + sway * 0.3, by + 2, 8, bh, '#6a2226'); R(g, bx + 1 + sway * 0.3, by + 2, 2, bh, '#8a3036');
      R(g, bx + 2 + sway * 0.5, by + 14, 4, 4, '#c8a44a'); for (let k = 0; k < 8; k += 2) R(g, bx + k + sway, by + 2 + bh, 1, 2 + ((k * 3) % 5), '#6a2226'); } }
}
/* returns true when it painted the room; 'ossuary' (and anything else) is main.js's own */
export function paintBurialRoom(g, st, sx, sy, w, h, tx0, ty0, time) {
  if (st === 'barrow') barrow(g, sx, sy, w, h, tx0, ty0);
  else if (st === 'crypt') crypt(g, sx, sy, w, h, tx0, ty0);
  else if (st === 'bonestair') bonestair(g, sx, sy, w, h, tx0, ty0);
  else if (st === 'procession') procession(g, sx, sy, w, h, tx0, ty0, time || 0);
  else return false;
  return true;
}
/* THE PILLAR AT A SEAM: a dressed stone column twenty pixels across standing over the join, with a base and a capital */
export function drawSeam(g, l, r, t, b) {
  const x = Math.round((l + r) / 2) - 10, h = b - t;
  R(g, x, t, 20, h, '#5a5448'); R(g, x + 2, t, 2, h, '#7a7262'); R(g, x + 15, t, 3, h, '#433e35');
  for (let y = t + 12; y < b; y += 16) R(g, x, y, 20, 1, '#433e35');
  R(g, x - 4, t, 28, 6, '#6a6354'); R(g, x - 4, t + 6, 28, 2, '#433e35'); R(g, x - 4, b - 8, 28, 8, '#4e483e'); R(g, x - 4, b - 8, 28, 1, '#7a7262');
}
