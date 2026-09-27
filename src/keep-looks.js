// src/keep-looks.js — A CASTLE UNDER THE SEA, SECTION BY SECTION (docs/briefs/keep-rework-2.md §4; the level review, group B:
// "the same teal brick wall, a floor of the same mossy stone ... they cannot be told apart").
// Every section of THE UNDERWATER KEEP's approach gets its OWN wall (an interior style, `keep*`) and a LANDMARK painted into it
// (L.keepLandmarks [{ k, x, y }] in tiles: x the landmark's centre column, y the row its foot stands on).
//   keepCourt    the outer curtain: great pale blocks, arrow slits          THE GATEHOUSE: the arch, its portcullis raised
//   keepCulvert  the moat culvert: rubble, slime, iron grilles low down     THE CULVERT MOUTH: a round grated drain, pouring
//   keepLibrary  shelved walls of drowned books between columns            THE GREAT STACK: a shelf tower, its ladder, a reading lamp
//   keepCloister the dry cloister (air hall one): warm stone and arches    THE BROKEN ARCADE: an arch come down across a bay
//   keepSluice   iron-banded machine wall, rivets and pipe                 THE GREAT SLUICE WHEEL, turning
//   keepCistern  red tiles, cracked, with the heat coming off them         THE BOILER MOUTH: a furnace arch, glowing
//   keepGuard    the guardroom (air hall two): racked arms, hung shields   THE FALLEN CHANDELIER on its chain
//   keepChapel   chapel masonry, tall and pale                             THE SUNKEN CHAPEL WINDOW: a lancet of coloured glass
// Painted in the room's own coordinates (main.js drawRoom translates and clips), so nothing reseeds as the camera moves.
const TS = 16;
const rng = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

export function paintKeepRoom(g, st, sx, sy, w, h, tx0, ty0, time, L) {
  const P = PAINT[st]; if (!P) return false;
  P(g, sx, sy, w, h, tx0, time);
  for (const m of (L && L.keepLandmarks) || []) { if (m.room !== st) continue; const f = MARK[m.k]; if (!f) continue;
    const x = (m.x - tx0) * TS + 8, y = (m.y + 1 - ty0) * TS; if (x < -200 || x > w + 200) continue; f(g, x, y, time, m); }
  return true;
}

// ---------------- THE WALLS ----------------
const PAINT = {
  keepCourt(g, sx, sy, w, h, tx0, time) {
    g.fillStyle = '#1d2c2e'; g.fillRect(sx, sy, w, h);
    for (let yy = 0; yy < h; yy += 16) for (let xx = (((yy / 16) & 1) ? -16 : 0); xx < w; xx += 32) {   /* great pale blocks, two courses of them to a tile */
      const k = rng(xx + tx0 * TS, yy); g.fillStyle = k < 0.33 ? '#304446' : k < 0.66 ? '#2b3f41' : '#34494a'; g.fillRect(sx + xx + 1, sy + yy + 1, 30, 14);
      g.fillStyle = '#3e5456'; g.fillRect(sx + xx + 1, sy + yy + 1, 30, 1); }
    for (let xx = 40 - ((tx0 * TS) % 80); xx < w; xx += 80) {                                           /* the arrow slits, with a little sea-light through each */
      g.fillStyle = '#0c1516'; g.fillRect(sx + xx, sy + 40, 4, 30); g.fillRect(sx + xx - 3, sy + 52, 10, 3);
      g.globalAlpha = 0.18 + 0.08 * Math.sin(time * 0.8 + xx); g.fillStyle = '#7cc8c8'; g.fillRect(sx + xx + 1, sy + 42, 2, 26); g.globalAlpha = 1; }
    g.fillStyle = '#44595a'; g.fillRect(sx, sy + h - 72, w, 3); g.fillStyle = '#1a2728'; g.fillRect(sx, sy + h - 69, w, 1);   /* the string course */
    weed(g, sx, sy, w, h, tx0, time, '#2f5a44');
  },
  keepCulvert(g, sx, sy, w, h, tx0, time) {
    g.fillStyle = '#152219'; g.fillRect(sx, sy, w, h);
    for (let i = 0; i < w * h / 90; i++) { const rx = (i * 37 + tx0 * 11) % w, ry = (i * 71) % h, k = rng(i, tx0);   /* rubble, laid anyhow */
      g.fillStyle = k < 0.4 ? '#223428' : k < 0.8 ? '#1d2e22' : '#2a3e2e'; g.fillRect(sx + rx, sy + ry, 6 + (i % 5) * 2, 4 + (i % 3) * 2); }
    for (let xx = 8 - ((tx0 * TS) % 12); xx < w; xx += 12) { const hh = 20 + ((Math.abs(xx + tx0 * TS) * 13) % 60);   /* slime running down */
      g.globalAlpha = 0.5; g.fillStyle = '#3f6a2e'; g.fillRect(sx + xx, sy, 2, hh); g.globalAlpha = 1; }
    for (let xx = 48 - ((tx0 * TS) % 96); xx < w; xx += 96) {                                           /* low arches with iron grilles, at the foot of the wall */
      const gy = sy + h - 44; g.fillStyle = '#081009'; g.fillRect(sx + xx, gy, 36, 44); g.beginPath(); g.arc(sx + xx + 18, gy, 18, Math.PI, 0); g.fill();
      g.fillStyle = '#4a5250'; for (let b = 3; b < 36; b += 6) g.fillRect(sx + xx + b, gy - 12, 2, 56); g.fillRect(sx + xx, gy + 12, 36, 2); g.fillRect(sx + xx, gy + 28, 36, 2); }
  },
  keepLibrary(g, sx, sy, w, h, tx0, time) {
    g.fillStyle = '#1f1a16'; g.fillRect(sx, sy, w, h);
    for (let xx = -((tx0 * TS) % 72); xx < w; xx += 72) {                                                /* a bay of shelves, then a column */
      for (let yy = 16; yy < h - 8; yy += 22) { g.fillStyle = '#3a2a1c'; g.fillRect(sx + xx + 10, sy + yy + 18, 54, 3);
        for (let b = 0; b < 52; b += 3) { const k = rng(xx + b + tx0 * TS, yy); if (k < 0.18) continue; const bh = 10 + ((k * 9) | 0);   /* the books, drowned dull */
          g.fillStyle = k < 0.4 ? '#4a3a52' : k < 0.6 ? '#3a4e3e' : k < 0.8 ? '#5a3a2a' : '#4e4a36'; g.fillRect(sx + xx + 11 + b, sy + yy + 18 - bh, 2, bh); } }
      g.fillStyle = '#2e3432'; g.fillRect(sx + xx, sy, 9, h); g.fillStyle = '#3e4644'; g.fillRect(sx + xx + 1, sy, 2, h); g.fillStyle = '#1a1e1d'; g.fillRect(sx + xx + 8, sy, 1, h); }
    g.globalAlpha = 0.07; g.fillStyle = '#7cc8c8'; for (let yy = 0; yy < h; yy += 20) g.fillRect(sx, sy + yy + ((Math.sin(time * 0.5 + yy) * 3) | 0), w, 2); g.globalAlpha = 1;
    weed(g, sx, sy, w, h, tx0, time, '#35603a');
  },
  keepCloister(g, sx, sy, w, h, tx0, time) {
    g.fillStyle = '#3a3026'; g.fillRect(sx, sy, w, h);
    for (let yy = 0; yy < h; yy += 10) for (let xx = (((yy / 10) & 1) ? 10 : 0); xx < w; xx += 20) { g.fillStyle = rng(xx + tx0, yy) < 0.5 ? '#4a3e30' : '#46392c'; g.fillRect(sx + xx + 1, sy + yy + 1, 18, 8); }
    for (let xx = 24 - ((tx0 * TS) % 64); xx < w; xx += 64) {                                            /* the arcade: a dark bay under each arch, a pier between */
      g.fillStyle = '#211a14'; g.fillRect(sx + xx, sy + 40, 40, h - 40); g.beginPath(); g.arc(sx + xx + 20, sy + 40, 20, Math.PI, 0); g.fill();
      g.fillStyle = '#5e4e3a'; g.fillRect(sx + xx - 6, sy + 16, 6, h - 16); g.fillRect(sx + xx + 40, sy + 16, 6, h - 16);
      const fl = 0.5 + 0.5 * Math.sin(time * 7 + xx); g.globalAlpha = 0.16 + 0.06 * fl; g.fillStyle = '#ffb45c'; g.beginPath(); g.arc(sx + xx - 3, sy + 46, 26, 0, 7); g.fill(); g.globalAlpha = 1;   /* a torch on each pier: it is dry up here */
      g.fillStyle = '#6a4a2a'; g.fillRect(sx + xx - 4, sy + 46, 2, 6); g.fillStyle = fl > 0.5 ? '#ffd36b' : '#ff9a5c'; g.fillRect(sx + xx - 5, sy + 42, 4, 4); }
    g.fillStyle = '#6a5a44'; g.fillRect(sx, sy + h - 10, w, 2);
  },
  keepGuard(g, sx, sy, w, h, tx0, time) {
    g.fillStyle = '#2a2a30'; g.fillRect(sx, sy, w, h);
    for (let yy = 0; yy < h; yy += 12) for (let xx = (((yy / 12) & 1) ? 12 : 0); xx < w; xx += 24) { g.fillStyle = rng(xx + tx0, yy) < 0.5 ? '#383842' : '#34343d'; g.fillRect(sx + xx + 1, sy + yy + 1, 22, 10); }
    for (let xx = 16 - ((tx0 * TS) % 56); xx < w; xx += 56) { const k = Math.abs(Math.round((xx + tx0 * TS) / 56)) % 3;
      if (k === 0) { g.fillStyle = '#5a4630'; g.fillRect(sx + xx, sy + h - 58, 30, 3); g.fillRect(sx + xx, sy + h - 30, 30, 3);   /* a rack of spears */
        for (let s = 3; s < 30; s += 6) { g.fillStyle = '#6a5a44'; g.fillRect(sx + xx + s, sy + h - 72, 1, 46); g.fillStyle = '#b8c0c8'; g.fillRect(sx + xx + s - 1, sy + h - 76, 3, 5); } }
      else if (k === 1) { for (let s = 0; s < 3; s++) { const shx = sx + xx + s * 11, shy = sy + h - 70 + (s % 2) * 8;   /* hung shields */
          g.fillStyle = ['#7a2a2a', '#2a4a7a', '#6a6a2a'][s]; g.fillRect(shx, shy, 9, 11); g.fillStyle = '#c9a040'; g.fillRect(shx + 4, shy + 1, 1, 9); g.fillRect(shx + 1, shy + 5, 7, 1); } }
      else { g.fillStyle = '#5a1e24'; g.fillRect(sx + xx + 6, sy + 12, 16, 44); g.fillStyle = '#c9a040'; g.fillRect(sx + xx + 6, sy + 12, 16, 2); g.fillRect(sx + xx + 12, sy + 26, 4, 8); }   /* a banner */
      const fl = 0.5 + 0.5 * Math.sin(time * 6 + xx); g.globalAlpha = 0.14 + 0.06 * fl; g.fillStyle = '#ffb45c'; g.beginPath(); g.arc(sx + xx + 44, sy + 50, 24, 0, 7); g.fill(); g.globalAlpha = 1; }
  },
  keepSluice(g, sx, sy, w, h, tx0, time) {
    g.fillStyle = '#1a2226'; g.fillRect(sx, sy, w, h);
    for (let yy = 0; yy < h; yy += 32) for (let xx = -((tx0 * TS) % 48); xx < w; xx += 48) {           /* riveted plates */
      g.fillStyle = rng(xx + tx0 * TS, yy) < 0.5 ? '#26323a' : '#223038'; g.fillRect(sx + xx + 1, sy + yy + 1, 46, 30);
      g.fillStyle = '#4a5a64'; for (const [rx, ry] of [[3, 3], [43, 3], [3, 27], [43, 27], [23, 3], [23, 27]]) g.fillRect(sx + xx + rx, sy + yy + ry, 2, 2);
      g.fillStyle = '#5a3a28'; g.fillRect(sx + xx + 1, sy + yy + 30, 46, 1); }                          /* rust along every seam */
    g.fillStyle = '#34424a'; g.fillRect(sx, sy + 26, w, 6); g.fillStyle = '#4c5e68'; g.fillRect(sx, sy + 26, w, 1);   /* the main pipe, and its joints */
    for (let xx = -((tx0 * TS) % 40); xx < w; xx += 40) { g.fillStyle = '#56666e'; g.fillRect(sx + xx, sy + 24, 4, 10); }
  },
  keepCistern(g, sx, sy, w, h, tx0, time) {
    g.fillStyle = '#2a1410'; g.fillRect(sx, sy, w, h);
    for (let yy = 0; yy < h; yy += 8) for (let xx = 0; xx < w; xx += 8) { const k = rng(xx + tx0 * TS, yy);   /* red tile, cracked here and there */
      g.fillStyle = k < 0.3 ? '#6a2a1e' : k < 0.6 ? '#5e2418' : k < 0.9 ? '#742e20' : '#3a1a12'; g.fillRect(sx + xx, sy + yy, 7, 7);
      if (k > 0.94) { g.fillStyle = '#1a0a08'; g.fillRect(sx + xx + 2, sy + yy + 1, 1, 6); g.fillRect(sx + xx + 3, sy + yy + 3, 3, 1); } }
    g.fillStyle = '#8a4a2a'; for (let yy = 40; yy < h; yy += 96) g.fillRect(sx, sy + yy, w, 2);        /* a band of darker glaze */
    g.globalAlpha = 0.08 + 0.04 * Math.sin(time * 1.3); g.fillStyle = '#ff9a5c'; g.fillRect(sx, sy + h - 60, w, 60); g.globalAlpha = 1;   /* the heat off the floor */
  },
  keepChapel(g, sx, sy, w, h, tx0, time) {
    g.fillStyle = '#20262e'; g.fillRect(sx, sy, w, h);
    for (let yy = 0; yy < h; yy += 12) for (let xx = (((yy / 12) & 1) ? 14 : 0); xx < w; xx += 28) { g.fillStyle = rng(xx + tx0, yy) < 0.5 ? '#2e3642' : '#2a323e'; g.fillRect(sx + xx + 1, sy + yy + 1, 26, 10); }
    for (let xx = 30 - ((tx0 * TS) % 60); xx < w; xx += 60) {                                            /* blind lancets between the ribs */
      g.fillStyle = '#161b22'; g.fillRect(sx + xx, sy + 60, 14, 110); g.beginPath(); g.arc(sx + xx + 7, sy + 60, 7, Math.PI, 0); g.fill();
      g.fillStyle = '#3a4452'; g.fillRect(sx + xx - 12, sy, 4, h); }
    weed(g, sx, sy, w, h, tx0, time, '#2f5a54');
  },
};
function weed(g, sx, sy, w, h, tx0, time, col) {
  for (let xx = -((tx0 * TS) % 30); xx < w; xx += 30) { const hh = 6 + ((Math.abs(Math.round(xx + tx0 * TS)) * 7) % 10), sw = Math.sin(time * 0.9 + xx * 0.07) * 1.5;
    for (let j = 0; j < hh; j++) { g.fillStyle = j > hh - 3 ? '#3f7a54' : col; g.fillRect(sx + xx + Math.round(sw * j / hh), sy + j, 1, 1); } }
}

// ---------------- THE LANDMARKS ----------------
const MARK = {
  gatehouse(g, x, y, time) {                                   /* two towers and the arch between, the portcullis up in its slot */
    for (const dx of [-60, 36]) { g.fillStyle = '#3a4e50'; g.fillRect(x + dx, y - 190, 24, 190); g.fillStyle = '#4a6062'; g.fillRect(x + dx, y - 190, 24, 3);
      for (let k = 0; k < 4; k++) { g.fillStyle = '#3a4e50'; g.fillRect(x + dx + k * 7, y - 198, 4, 8); } g.fillStyle = '#0c1516'; g.fillRect(x + dx + 10, y - 150, 4, 24); }
    g.fillStyle = '#34484a'; g.fillRect(x - 36, y - 150, 72, 40);
    g.fillStyle = '#070d0e'; g.fillRect(x - 30, y - 110, 60, 110); g.beginPath(); g.arc(x, y - 110, 30, Math.PI, 0); g.fill();
    g.fillStyle = '#5a6468'; for (let b = -26; b <= 24; b += 7) g.fillRect(x + b, y - 138, 3, 40); g.fillRect(x - 28, y - 104, 58, 3); g.fillRect(x - 28, y - 122, 58, 2);
    g.fillStyle = '#8a929a'; for (let b = -26; b <= 24; b += 7) g.fillRect(x + b, y - 100, 3, 4);   /* the teeth of it, hanging */
    g.globalAlpha = 0.12; g.fillStyle = '#7cc8c8'; g.fillRect(x - 30, y - 60, 60, 60); g.globalAlpha = 1;
  },
  culvert(g, x, y, time) {                                     /* the great drain the moat went out by, still pouring */
    const cy = y - 70; g.fillStyle = '#2a3a2e'; g.beginPath(); g.arc(x, cy, 58, 0, 7); g.fill();
    g.fillStyle = '#050a07'; g.beginPath(); g.arc(x, cy, 48, 0, 7); g.fill();
    g.fillStyle = '#4a5250'; for (let b = -44; b <= 44; b += 11) g.fillRect(x + b, cy - Math.sqrt(Math.max(0, 48 * 48 - b * b)), 3, 2 * Math.sqrt(Math.max(0, 48 * 48 - b * b)));
    g.fillRect(x - 48, cy - 2, 96, 3);
    g.globalAlpha = 0.35; g.fillStyle = '#bfe6f5'; for (let i = 0; i < 16; i++) { const ph = (time * 0.9 + i / 16) % 1; g.fillRect(x - 40 + i * 5, cy + 10 + ph * 50, 1, 6); } g.globalAlpha = 1;
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; g.fillStyle = '#3a4c3e'; g.fillRect(x + Math.cos(a) * 53 - 3, cy + Math.sin(a) * 53 - 3, 6, 6); }   /* the voussoirs */
  },
  stack(g, x, y, time) {                                       /* THE GREAT STACK: a shelf tower to the roof, its ladder leaning, the reading lamp hung over it */
    g.fillStyle = '#2e2218'; g.fillRect(x - 40, y - 300, 80, 300);
    for (let yy = y - 290; yy < y - 6; yy += 20) { g.fillStyle = '#4a3624'; g.fillRect(x - 38, yy + 16, 76, 3);
      for (let b = 0; b < 72; b += 3) { const k = rng(b, yy); if (k < 0.2) continue; g.fillStyle = k < 0.45 ? '#5a3a5e' : k < 0.7 ? '#3e5a44' : '#6a4a2a'; g.fillRect(x - 36 + b, yy + 16 - (8 + ((k * 7) | 0)), 2, 8 + ((k * 7) | 0)); } }
    g.fillStyle = '#6a5034'; g.fillRect(x + 30, y - 200, 2, 200); g.fillRect(x + 44, y - 190, 2, 190); for (let r = y - 190; r < y; r += 10) g.fillRect(x + 30, r, 16, 2);   /* the ladder */
    const sw = Math.sin(time * 0.7) * 4; g.fillStyle = '#4a4034'; g.fillRect(x + sw, y - 330, 1, 50);
    g.fillStyle = '#c9a040'; g.fillRect(x - 6 + sw, y - 282, 13, 8); g.globalAlpha = 0.18 + 0.05 * Math.sin(time * 3); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x + sw, y - 276, 46, 0, 7); g.fill(); g.globalAlpha = 1;
  },
  arcade(g, x, y, time) {                                      /* THE BROKEN ARCADE: one arch has come down, its stones across the bay */
    g.fillStyle = '#5e4e3a'; g.fillRect(x - 40, y - 150, 10, 150); g.fillRect(x + 30, y - 110, 10, 110);
    g.strokeStyle = '#6e5c46'; g.lineWidth = 8; g.beginPath(); g.arc(x, y - 150, 36, Math.PI, Math.PI * 1.55); g.stroke();
    for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#6e5c46' : '#5e4e3a'; g.fillRect(x - 20 + k * 9, y - 12 - (k % 3) * 5, 11, 9); }
  },
  wheel(g, x, y, time) {                                       /* THE GREAT SLUICE WHEEL: the mechanism the whole works hangs from, still turning */
    const cy = y - 120, R = 84, a0 = time * 0.18;
    g.strokeStyle = '#3a2a1c'; g.lineWidth = 7; g.beginPath(); g.arc(x, cy, R, 0, 7); g.stroke();
    g.strokeStyle = '#5a4430'; g.lineWidth = 3; g.beginPath(); g.arc(x, cy, R - 2, 0, 7); g.stroke();
    for (let k = 0; k < 10; k++) { const a = a0 + k / 10 * Math.PI * 2; g.strokeStyle = '#4a3624'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke();
      g.fillStyle = '#6a5a4a'; g.fillRect(x + Math.cos(a) * (R + 6) - 5, cy + Math.sin(a) * (R + 6) - 5, 10, 10); }   /* its paddles */
    g.fillStyle = '#56666e'; g.beginPath(); g.arc(x, cy, 12, 0, 7); g.fill(); g.fillStyle = '#2a3238'; g.fillRect(x - 3, cy - 3, 6, 6);
    g.fillStyle = '#3a4a52'; g.fillRect(x - 6, cy, 12, y - cy);   /* its trestle */
  },
  boiler(g, x, y, time) {                                      /* THE BOILER MOUTH: the furnace that heats the cistern's water, still alight */
    g.fillStyle = '#4a2418'; g.fillRect(x - 46, y - 110, 92, 110); g.fillStyle = '#6a3424'; g.fillRect(x - 46, y - 110, 92, 4);
    g.fillStyle = '#140806'; g.fillRect(x - 26, y - 60, 52, 60); g.beginPath(); g.arc(x, y - 60, 26, Math.PI, 0); g.fill();
    const fl = 0.6 + 0.4 * Math.sin(time * 5); g.fillStyle = fl > 0.8 ? '#ffd36b' : '#ff9a5c'; g.fillRect(x - 18, y - 16, 36, 16); g.fillStyle = '#c9463d'; g.fillRect(x - 22, y - 8, 44, 8);
    g.globalAlpha = 0.2 * fl; g.fillStyle = '#ff9a5c'; g.beginPath(); g.arc(x, y - 20, 60, 0, 7); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#3a1a12'; for (let k = 0; k < 5; k++) g.fillRect(x - 40 + k * 20, y - 130, 8, 20);   /* its flues */
  },
  chandelier(g, x, y, time) {                                  /* THE FALLEN CHANDELIER: down across the floor, its chain still hanging from the vault */
    g.fillStyle = '#4a443c'; for (let yy = y - 170; yy < y - 30; yy += 5) g.fillRect(x + 20 + Math.round(Math.sin(time * 0.6) * 2), yy, 2, 3);
    g.fillStyle = '#7a5a1c'; g.fillRect(x - 30, y - 10, 60, 4); g.fillRect(x - 24, y - 16, 4, 12); g.fillRect(x + 20, y - 16, 4, 12); g.fillRect(x - 2, y - 22, 4, 18);
    g.fillStyle = '#c9a040'; for (let k = -28; k <= 28; k += 8) g.fillRect(x + k, y - 12, 2, 3);
  },
  window(g, x, y, time) {                                      /* THE SUNKEN CHAPEL WINDOW: a tall lancet, its glass still in, and the sea's light coming through it */
    const top = y - 330, W = 70;
    g.fillStyle = '#3a4452'; g.fillRect(x - W / 2 - 8, top - 30, W + 16, 330);
    g.fillStyle = '#0c1018'; g.fillRect(x - W / 2, top, W, 300); g.beginPath(); g.arc(x, top, W / 2, Math.PI, 0); g.fill();
    const cols = ['#2a4a8a', '#8a2a3a', '#3a7a4a', '#a8842a', '#5a3a8a'];
    for (let yy = top - 30; yy < top + 290; yy += 12) for (let xx = x - W / 2 + 3; xx < x + W / 2 - 3; xx += 11) {
      const inArch = yy >= top || Math.hypot(xx + 5 - x, yy + 6 - top) < W / 2 - 4; if (!inArch) continue;
      g.fillStyle = cols[((xx * 7 + yy * 3) >>> 0) % 5]; g.globalAlpha = 0.75; g.fillRect(xx, yy, 9, 10); g.globalAlpha = 1; }
    g.fillStyle = '#1a2028'; g.fillRect(x - 2, top - 30, 4, 320); g.fillRect(x - W / 2, top + 100, W, 3); g.fillRect(x - W / 2, top + 200, W, 3);   /* the mullion and transoms */
    g.globalAlpha = 0.07 + 0.03 * Math.sin(time * 0.6); g.fillStyle = '#bfe6f5';                    /* and its light, in shafts down the water */
    g.beginPath(); g.moveTo(x - W / 2, top); g.lineTo(x + W / 2, top); g.lineTo(x + W / 2 + 90, y); g.lineTo(x - W / 2 + 40, y); g.fill(); g.globalAlpha = 1;
  },
};
export const KEEP_ROOMS = Object.keys(PAINT);
export const KEEP_LANDMARKS = Object.keys(MARK);
