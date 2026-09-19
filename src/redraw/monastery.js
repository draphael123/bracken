// monastery.js — THE MONASTERY ON THE CLIFF: the stone the monks laid, the rooms they dug, and everything they left
// working. The mountain round it stays the crags' own rock; this is only what was BUILT, so a tower reads as growing out
// of the cliff instead of being more cliff. Warm limestone in courses with moss in the joints and no snow (the level puts
// snow on the tops above its snow line itself), timber the colour of old tar, faded tile roofs, bronze bells.
// Same conventions as crown_tiles.js: 16x16 tiles, crisp px.js primitives, fixed seeds.
//   bakeMonkTiles()        { top, edge, fill, silt, wet } in the shape of the crown set, so the tile resolver swaps it in
//   bakeFacade(kind, ...)  monkTower | monkCurtain | monkBelfry | monkCloister: wall faces drawn behind the play
//   paintRoom(g, st, ...)  monkScript | monkTower | monkFlue | monkHall | monkShrine: the back walls of the dug rooms
//   bakeMonkProps()        the furniture: bells, a bell frame, the prayer wheel, basket, hoist wheel, brazier, loose
//                          stone, rubble, shelves, shrines, flag posts, a guardian statue, the fallen portcullis, beads
//   bakeFledgling()        the Roc's chicks, a sprite set   bakeGuardian()   the temple guardian, a sprite set (9 frames)
//   bakeGoblinPriest()     the goblin in the monks' robe, a sprite set (6)   bakeGoblinMage()   the goblin with the book (7)
import { canvas, px, rect, fillPoly, line, circle, outline, mulberry, flipX, whiten, fromGrid } from '../px.js';
import { OUT } from '../art.js';

const T = 16;
// the stone, warm and weathered: `hi` the lit arris, `l`/`m`/`d` the faces, `deep` a face in shadow, `mor` the joints
const ST = { cap: '#cdbd9c', hi: '#b8a888', l: '#a09074', m: '#8c7e66', d: '#766a58', deep: '#5a5046', mor: '#3c342e' };
const MOSS = ['#7e8a4a', '#5e6a36'];
const WD = ['#2e1e12', '#4a3020', '#6a4a2c', '#8a6640', '#b08a5c'];   /* timber, dark to light */
const RF = ['#4a2a22', '#6e3a2a', '#8e523a', '#ae7250'];              /* old tile roofs */
const BR = ['#3a2a12', '#6a4a1e', '#9a7634', '#c9a44a', '#f0dc8a'];   /* bronze */
const FLAG = ['#c9463d', '#e8c84a', '#3f7fdf', '#f2ecd8', '#4a9a5a'];
const SPINE = ['#6a2a2a', '#2a4a3a', '#3a3060', '#7a5a2a', '#5a2a4a', '#2a3a5a'];
const pack = (frames, ax, ay, w, h) => { const white = frames.map(c => whiten(c)); return { R: frames, L: frames.map(flipX), white: { R: white, L: white.map(flipX) }, ax, ay, w, h }; };

// ---------- the laid stone ----------
// A course is 8 rows with its bed joint in the last row, so any tile stacks under any other; perpends every 16, half
// a block over on alternate courses; moss in some of the joints, darker low on a wall.
const bed = y => (y & 7) === 7;
function ashlar(g, rnd, dark) {
  for (let y = 0; y < T; y++) { const k = y & 7, base = k === 7 ? ST.mor : k === 0 ? ST.l : k < 5 ? ST.m : ST.d;
    for (let x = 0; x < T; x++) px(g, x, y, base);
    if (k === 0) for (let x = 0; x < T; x++) if (rnd() < 0.4) px(g, x, y, ST.hi); }
  for (let y = 0; y < T; y++) { const off = (y >> 3) & 1 ? 8 : 0; for (let x = 0; x < T; x++) if (((x + off) % 16) === 0 && !bed(y)) px(g, x, y, ST.mor); }
  for (let i = 0; i < 12; i++) { const x = (rnd() * T) | 0, y = (rnd() * T) | 0; if (!bed(y)) px(g, x, y, rnd() < 0.5 ? ST.d : ST.l); }
  if (rnd() < 0.5) { const x = (rnd() * 14) | 0, y = rnd() < 0.5 ? 7 : 15; px(g, x, y, MOSS[0]); px(g, x + 1, y, MOSS[1]); if (rnd() < 0.5) px(g, x, y - 1, MOSS[1]); }
  if (dark) for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (rnd() < dark) px(g, x, y, bed(y) ? ST.mor : ST.deep);
}
function monkTop(seed, eL, eR) {
  const rnd = mulberry(seed), [c, g] = canvas(T, T); ashlar(g, rnd, 0);
  rect(g, 0, 0, T, 4, ST.cap); rect(g, 0, 0, T, 1, '#ddd0b0'); rect(g, 0, 4, T, 1, ST.deep);   /* the worn flags on top, and the drip under them */
  for (let x = (seed % 4) * 3 + 2; x < T; x += 9) rect(g, x, 1, 1, 3, ST.d);
  for (let i = 0; i < 3; i++) if (rnd() < 0.6) { const x = (rnd() * 15) | 0; px(g, x, 0, MOSS[0]); px(g, x + 1, 0, MOSS[1]); }
  if (eL) for (let y = 0; y < T; y++) { px(g, 0, y, ST.deep); if (y > 0) px(g, 1, y, bed(y) ? ST.mor : ST.d); }
  if (eR) for (let y = 0; y < T; y++) { px(g, T - 1, y, ST.deep); if (y > 0) px(g, T - 2, y, bed(y) ? ST.mor : ST.d); }
  return c;
}
function monkEdge(seed, eL, eR) {
  const rnd = mulberry(seed), [c, g] = canvas(T, T); ashlar(g, rnd, 0);
  const quoin = side => { for (let y = 0; y < T; y++) { const w = ((y >> 3) & 1) === 0 ? 9 : 5;
    for (let i = 0; i < w; i++) px(g, side < 0 ? i : T - 1 - i, y, bed(y) ? ST.mor : (y & 7) === 0 ? ST.hi : ST.l);
    px(g, side < 0 ? w : T - 1 - w, y, ST.mor); px(g, side < 0 ? 0 : T - 1, y, ST.deep); } };
  if (eL) quoin(-1); if (eR) quoin(1);
  return c;
}
export function bakeMonkTiles() {
  const top = {}, edge = {};
  for (const eL of [0, 1]) for (const eR of [0, 1]) { const k = eL + '' + eR;
    top[k] = [0, 1, 2, 3].map(i => monkTop(9100 + i + eL * 7 + eR * 13, eL, eR));
    edge[k] = [0, 1].map(i => monkEdge(9200 + i + eL * 3 + eR * 5, eL, eR)); }
  const fill = [0, 1, 2, 3].map(i => { const rnd = mulberry(9300 + i), [c, g] = canvas(T, T); ashlar(g, rnd, 0.28); return c; });
  return { top, edge, fill, silt: fill.slice(0, 3), wet: [0, 1, 2].map(i => monkTop(9400 + i, 0, 0)) };
}
// GUARDIAN'S RUBBLE: the stone it raises out of its own floor
export function bakeRubbleTile() { const rnd = mulberry(77), [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, ST.deep); for (let i = 0; i < 7; i++) { const x = (rnd() * 12) | 0, y = (rnd() * 12) | 0, w = 4 + ((rnd() * 5) | 0), h = 3 + ((rnd() * 4) | 0);
    rect(g, x, y, w, h, i % 2 ? ST.m : ST.l); rect(g, x, y, w, 1, ST.hi); rect(g, x, y + h - 1, w, 1, ST.d); }
  for (let i = 0; i < 3; i++) { const x = (rnd() * 13) | 0; line(g, x, 2, x + 2, 12, ST.mor); }
  return c; }

// ---------- the facades ----------
// A shade darker than the laid tiles so it never reads as footing, and locked to the world like them.
const mix = (a, b, k) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); k = Math.max(0, Math.min(1, k));
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
const F = { f: '#6e6454', l: '#7c7160', d: '#5a5246', mor: '#3a332c', hi: '#8e8270', dark: '#18140f', win: '#ffb84a', winL: '#fff0c0' };
function courses(g, x0, y0, w, h, rnd) {
  for (let y = 0; y < h; y++) { const k = y & 7; rect(g, x0, y0 + y, w, 1, k === 7 ? F.mor : k === 0 ? F.l : F.f);
    if (k !== 7) for (let x = ((y >> 3) & 1) * 8; x < w; x += 16) px(g, x0 + x, y0 + y, F.mor); }
  for (let i = 0; i < w * h / 70; i++) { const x = (rnd() * w) | 0, y = (rnd() * h) | 0; if ((y & 7) !== 7) px(g, x0 + x, y0 + y, rnd() < 0.5 ? F.d : F.hi); }
  for (let i = 0; i < w / 24; i++) { const x = (rnd() * (w - 3)) | 0, y = ((rnd() * (h >> 3)) | 0) * 8 + 7; rect(g, x0 + x, y0 + y, 3, 1, MOSS[1]); }
}
function roof(g, x0, w, h) {   /* a pitched roof of old tiles with its ridge and eaves */
  for (let y = 0; y < h; y++) { const half = Math.round((y + 1) / h * (w / 2 + 2)), xa = Math.round(x0 + w / 2 - half);
    rect(g, Math.max(0, xa), y, Math.min(w + 4, half * 2), 1, (y % 3) === 2 ? RF[0] : y % 2 ? RF[1] : RF[2]);
    if (y % 3 === 0) for (let x = xa + 2; x < xa + half * 2 - 1; x += 4) px(g, x, y, RF[3]); }
  rect(g, Math.round(x0 + w / 2) - 1, 0, 2, 2, RF[3]);
}
function arch(g, ax0, ax1, ay0, ay1, inside) {   /* a round-headed opening */
  const r = Math.min(10, (ax1 - ax0) >> 1);
  for (let y = ay0; y < ay1; y++) { const dy = y - ay0; let inset = 0; if (dy < r) inset = Math.round(r - Math.sqrt(Math.max(0, r * r - (r - dy) * (r - dy))));
    rect(g, ax0 - 2 + inset, y, ax1 - ax0 + 4 - inset * 2, 1, F.hi); rect(g, ax0 + inset, y, ax1 - ax0 - inset * 2, 1, inside || F.dark); }
}
export function bakeFacade(kind, tw, th, seed, o = {}) {
  const W = tw * T, H = th * T, rnd = mulberry((seed | 0) + 7001), [c, g] = canvas(W, H);
  if (kind === 'monkBelfry') {
    /* THE BELFRY: an open stage on two piers under a tiled roof, dark behind the arch so the bell reads against it */
    const roofH = Math.min(40, Math.round(H * 0.42));
    rect(g, 6, roofH, W - 12, H - roofH, '#241c16');
    courses(g, 0, roofH, 10, H - roofH, rnd); courses(g, W - 10, roofH, 10, H - roofH, rnd);
    for (let y = roofH; y < roofH + 10; y++) { const k = (y - roofH) / 10; rect(g, 10, y, W - 20, 1, mix(F.f, '#241c16', k)); }
    roof(g, -4, W + 8, roofH);
    rect(g, 0, roofH - 1, W, 2, WD[1]);
    rect(g, 10, roofH + 3, W - 20, 2, WD[2]); rect(g, 10, roofH + 3, W - 20, 1, WD[3]);   /* the headstock the bell hangs from */
    return c;
  }
  if (kind === 'monkCloister') {
    /* THE CLOISTER: a walk of round arches on paired columns, a lean-to roof over it, the painted wall dim behind */
    const roofH = 18; rect(g, 0, roofH, W, H - roofH, '#2e241c');
    for (let x = 0; x < W; x += 2) rect(g, x, roofH + 6, 1, H - roofH - 10, '#3a2e24');
    for (let x = 12; x < W - 8; x += 40) { rect(g, x, roofH + 16, 22, 20, '#4a3a2c'); rect(g, x + 2, roofH + 18, 18, 16, ['#6a4a3a', '#3a4a5a', '#5a5a3a'][(x >> 3) % 3]); circle(g, x + 11, roofH + 26, 5, '#c9a44a'); }
    for (let y = 0; y < roofH; y++) rect(g, 0, y, W, 1, y % 3 === 2 ? RF[0] : RF[1 + (y & 1)]);
    rect(g, 0, roofH, W, 3, WD[1]);
    for (let x = 0; x < W; x += 32) { rect(g, x, roofH + 3, 6, H - roofH - 3, F.f); rect(g, x, roofH + 3, 1, H - roofH - 3, F.hi); rect(g, x + 5, roofH + 3, 1, H - roofH - 3, F.d); rect(g, x - 1, H - 4, 8, 4, F.l); rect(g, x - 1, roofH + 3, 8, 3, F.l); }
    for (let x = 0; x < W - 6; x += 32) { const ax0 = x + 6, ax1 = x + 32, r = 13;
      for (let dx = 0; dx < ax1 - ax0; dx++) { const cxd = dx - (ax1 - ax0) / 2, top = roofH + 6 + Math.round(r - Math.sqrt(Math.max(0, r * r - cxd * cxd)));
        rect(g, ax0 + dx, roofH + 3, 1, Math.max(0, top - roofH - 3), F.f); px(g, ax0 + dx, top, F.hi); } }
    return c;
  }
  // tower and curtain: coursed stone a shade under the tiles
  const roofH = kind === 'monkTower' && o.roof ? Math.min(Math.round(W * 0.55), Math.round(H * 0.3)) : 0, cap = roofH ? 0 : 5;
  const by = roofH + cap;
  courses(g, 0, by, W, H - by, rnd);
  if (cap) { rect(g, 0, 0, W, cap, F.hi); rect(g, 0, 0, W, 1, '#a89a80'); rect(g, 0, cap - 1, W, 1, F.mor); for (let x = 3; x < W; x += 12) rect(g, x, 1, 5, 3, RF[1]); }
  if (roofH) { roof(g, -3, W + 6, roofH); rect(g, 0, roofH - 1, W, 2, WD[1]); }
  if (kind === 'monkTower') {
    for (let y = by; y < H; y++) { const long = (((y - by) >> 3) & 1) === 0; rect(g, 0, y, long ? 6 : 3, 1, ((y - by) & 7) === 7 ? F.mor : F.hi); rect(g, W - (long ? 6 : 3), y, long ? 6 : 3, 1, ((y - by) & 7) === 7 ? F.mor : F.d); }
    const mx = W >> 1; if (H - by > 60) { arch(g, mx - 5, mx + 5, by + 10, by + 24, F.win); rect(g, mx - 1, by + 16, 2, 8, F.winL); }
  } else for (let x = 18; x < W - 12; x += 40) { const y = by + 12; if (y + 14 < H) arch(g, x, x + 8, y, y + 14, '#241c16'); }
  if (o.arch) { const ay0 = o.arch[0] * T, ay1 = (o.arch[1] + 1) * T; arch(g, 8, W - 8, ay0, ay1, '#140f0c');
    for (let y = ay0 + 14; y < ay1; y += 6) rect(g, 10, y, W - 20, 1, '#2a2018'); }   /* the passage in under the gate */
  return c;
}

// ---------- the rooms ----------
// Called with the region's screen origin, so everything painted is locked to the world. Returns true when it painted.
export function paintRoom(g, st, sx, sy, w, h, tx0, ty0, time) {
  const hsh = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233 + tx0 * 0.7 + ty0 * 1.3) * 43758.5453; return v - Math.floor(v); };
  if (st === 'monkScript') {
    /* THE SCRIPTORIUM: lime plaster gone brown with lamp smoke, timber uprights, and shelves of books between them */
    g.fillStyle = '#4a3c30'; g.fillRect(sx, sy, w, h);
    g.fillStyle = '#54453a'; for (let yy = sy + 6; yy < sy + h; yy += 11) g.fillRect(sx, yy, w, 5);
    /* AND THE BAYS THEMSELVES ARE ON THE WALL. Locking the books to the world was half of it: the timber uprights and their shelf boards
       still stepped from the SCREEN origin, so the whole joinery slid along as the camera moved and the wall crawled anyway. The bay
       line takes its PHASE from the world (tx0), while the loop still starts at sx: a room is drawn with no clip round it, so a bay
       begun left of sx would paint over whatever stands beside the room. */
    const bay = 56, phase = (((tx0 * 16) % bay) + bay) % bay;
    for (let xx = sx; xx < sx + w; xx += bay) { const k = Math.round((xx - sx + phase) / bay);
      g.fillStyle = WD[1]; g.fillRect(xx, sy, 4, h); g.fillStyle = WD[2]; g.fillRect(xx, sy, 1, h);
      for (let s = 0; s * 22 + 10 < h - 12; s++) { const shy = sy + 10 + s * 22;
        g.fillStyle = WD[0]; g.fillRect(xx + 4, shy + 13, bay - 4, 3); g.fillStyle = WD[2]; g.fillRect(xx + 4, shy + 13, bay - 4, 1);
        /* THE BOOKS ARE ON THE WALL, NOT ON THE SCREEN. Every spine's width, height, colour and whether it is there at all came out of
           a hash of its SCREEN x - so the whole shelf re-rolled itself every time the camera moved a pixel, and the wall crawled as
           you walked past it. The hash takes the WORLD x instead (the region's own tile origin plus how far into the region we are),
           so a book is the same book from wherever it is seen. */
        let bx = xx + 6; while (bx < xx + bay - 6) { const wx = tx0 * 16 + (bx - sx);
          const bw = 2 + ((hsh(k * 5 + wx, s) * 3) | 0), bh = 8 + ((hsh(wx, s + k) * 5) | 0);
          if (hsh(wx + 1, s * 7 + k) < 0.12) { bx += 5; continue; }
          g.fillStyle = SPINE[(hsh(wx, s * 3 + k) * SPINE.length) | 0]; g.fillRect(bx, shy + 13 - bh, bw, bh); g.fillStyle = '#c9a44a'; g.fillRect(bx, shy + 13 - bh + 2, bw, 1); bx += bw + 1; } } }
    /* and in its own shadow: the shelves are a back wall, and the boards over them have to stand off it (the look pass read them low) */
    g.globalAlpha = 0.42; g.fillStyle = '#1a120c'; g.fillRect(sx, sy, w, h);
    g.globalAlpha = 0.05 + 0.02 * Math.sin(time * 2 + tx0); g.fillStyle = '#ffb84a'; g.fillRect(sx, sy, w, h); g.globalAlpha = 1;
    return true; }
  if (st === 'monkHall') {
    /* THE TEMPLE HALL: dark stone, square pillars, and a band of faded painting where the guardian's story was told */
    g.fillStyle = '#2e2822'; g.fillRect(sx, sy, w, h);
    g.fillStyle = '#3a322a'; for (let yy = sy + 7; yy < sy + h; yy += 8) g.fillRect(sx, yy, w, 1);
    g.fillStyle = '#5a3a2a'; g.fillRect(sx, sy + 8, w, 14); g.fillStyle = '#8a6a3a'; g.fillRect(sx, sy + 8, w, 1); g.fillRect(sx, sy + 21, w, 1);
    for (let xx = sx + 6; xx < sx + w - 10; xx += 18) { g.fillStyle = FLAG[((xx - sx) / 18 | 0) % 5]; g.globalAlpha = 0.45; g.fillRect(xx, sy + 11, 8, 8); g.globalAlpha = 1; g.fillStyle = '#c9a44a'; g.fillRect(xx + 3, sy + 14, 2, 2); }
    for (let xx = sx + 20; xx < sx + w - 6; xx += 64) { g.fillStyle = '#4a4038'; g.fillRect(xx, sy, 10, h); g.fillStyle = '#5e544a'; g.fillRect(xx, sy, 2, h); g.fillStyle = '#241e1a'; g.fillRect(xx + 9, sy, 1, h); }
    return true; }
  if (st === 'monkTower' || st === 'monkFlue' || st === 'monkShrine') {
    const flue = st === 'monkFlue', shrine = st === 'monkShrine';
    g.fillStyle = flue ? '#2a211c' : shrine ? '#5a4232' : '#3a3129'; g.fillRect(sx, sy, w, h);
    g.fillStyle = flue ? '#342820' : shrine ? '#664c3a' : '#453a30'; for (let yy = sy; yy < sy + h; yy += 8) for (let xx = sx + ((((yy - sy) / 8) | 0) % 2 ? 8 : 0); xx < sx + w; xx += 16) g.fillRect(xx, yy, 15, 7);
    if (flue) { const gr = g.createLinearGradient(0, sy + h, 0, sy); gr.addColorStop(0, 'rgba(255,140,60,0.28)'); gr.addColorStop(0.5, 'rgba(255,140,60,0.06)'); gr.addColorStop(1, 'rgba(20,14,10,0.4)'); g.fillStyle = gr; g.fillRect(sx, sy, w, h); }
    else if (shrine) { const mx = sx + (w >> 1), my = sy + (h >> 1); g.strokeStyle = '#c9a44a'; g.lineWidth = 1; for (const r of [14, 9, 4]) { g.beginPath(); g.arc(mx + 0.5, my + 0.5, r, 0, 7); g.stroke(); } g.fillStyle = '#c9463d'; g.fillRect(mx - 1, my - 1, 3, 3); }
    else for (let yy = sy + 18; yy < sy + h - 8; yy += 40) { g.fillStyle = '#0e0c0a'; g.fillRect(sx + (w >> 1) - 1, yy, 2, 10); g.fillStyle = 'rgba(255,230,190,0.35)'; g.fillRect(sx + (w >> 1), yy + 1, 1, 8); }
    return true; }
  return false;
}

// ---------- the furniture ----------
function bell(swing) {   /* a bronze bell off its crown staple, swung -1 / 0 / 1 */
  const [c, g] = canvas(18, 20), o = swing * 2;
  rect(g, 7, 0, 4, 3, BR[1]); rect(g, 8, 0, 2, 1, BR[3]);
  fillPoly(g, [[6 + o * 0.5, 3], [12 + o * 0.5, 3], [15 + o, 15], [3 + o, 15]], BR[2]);
  fillPoly(g, [[6 + o * 0.5, 3], [8 + o * 0.5, 3], [5 + o, 15], [3 + o, 15]], BR[3]);
  rect(g, 2 + o, 15, 15, 3, BR[1]); rect(g, 2 + o, 15, 15, 1, BR[4]);
  rect(g, 5 + o, 8, 9, 1, BR[1]); rect(g, 8 + o, 18, 2, 2, BR[0]);   /* its band, and the clapper under the lip */
  return outline(c, OUT);
}
function bellFrame() {   /* two posts and a headstock, pegged, for a bell that stands on a floor */
  const [c, g] = canvas(26, 30);
  for (const x of [2, 21]) { rect(g, x, 3, 3, 27, WD[2]); rect(g, x, 3, 1, 27, WD[3]); rect(g, x - 1, 27, 5, 3, WD[1]); }
  rect(g, 0, 1, 26, 3, WD[1]); rect(g, 0, 1, 26, 1, WD[3]); px(g, 3, 2, BR[3]); px(g, 22, 2, BR[3]);
  line(g, 5, 4, 9, 8, WD[1]); line(g, 20, 4, 16, 8, WD[1]);
  return outline(c, OUT);
}
function prayerWheel(ph) {   /* a painted drum on its spindle; four frames of the bands going round */
  const [c, g] = canvas(16, 26);
  rect(g, 7, 0, 2, 26, WD[1]); rect(g, 3, 22, 10, 4, ST.m); rect(g, 3, 22, 10, 1, ST.hi);
  rect(g, 2, 4, 12, 16, '#8a2e24'); rect(g, 2, 4, 12, 2, BR[3]); rect(g, 2, 18, 12, 2, BR[3]);
  for (let k = 0; k < 3; k++) { const x = 2 + ((k * 4 + ph) % 12); rect(g, x, 7, 2, 10, BR[2]); px(g, x, 11, BR[4]); }
  rect(g, 2, 4, 2, 16, 'rgba(0,0,0,0.25)'); rect(g, 12, 4, 2, 16, 'rgba(255,255,255,0.12)');
  return outline(c, OUT);
}
function basket() {   /* wicker, rimmed, on four rope ends */
  const [c, g] = canvas(34, 16);
  rect(g, 1, 4, 32, 10, WD[3]); for (let x = 1; x < 33; x += 3) rect(g, x, 4, 1, 10, WD[2]); for (let y = 6; y < 14; y += 3) rect(g, 1, y, 32, 1, WD[2]);
  rect(g, 0, 3, 34, 2, WD[4]); rect(g, 0, 3, 34, 1, '#d8b888'); rect(g, 2, 14, 30, 2, WD[1]);
  return outline(c, OUT);
}
function hoist() {   /* a spoked timber wheel with an iron hub */
  const [c, g] = canvas(22, 22); circle(g, 11, 11, 10, WD[1]); circle(g, 11, 11, 8, 'rgba(0,0,0,0)');
  g.clearRect(4, 4, 14, 14); circle(g, 11, 11, 10, WD[2]); g.globalCompositeOperation = 'destination-out'; circle(g, 11, 11, 7, '#000'); g.globalCompositeOperation = 'source-over';
  for (let a = 0; a < 4; a++) { const th = a * Math.PI / 4; line(g, Math.round(11 - Math.cos(th) * 8), Math.round(11 - Math.sin(th) * 8), Math.round(11 + Math.cos(th) * 8), Math.round(11 + Math.sin(th) * 8), WD[3]); }
  circle(g, 11, 11, 2, '#4a4a52'); px(g, 11, 11, '#9a9aa8');
  return outline(c, OUT);
}
function brazierBowl(lit) {   /* a stone bowl on a short foot, with coals */
  const [c, g] = canvas(24, 14);
  rect(g, 9, 9, 6, 5, ST.m); rect(g, 7, 12, 10, 2, ST.d);
  fillPoly(g, [[1, 2], [23, 2], [19, 9], [5, 9]], ST.l); rect(g, 1, 2, 22, 2, ST.hi); rect(g, 4, 6, 17, 1, ST.d);
  for (let x = 3; x < 21; x += 2) px(g, x, 1, lit ? (x % 4 ? '#ffb040' : '#fff0a0') : (x % 4 ? '#5a3020' : '#8a4a28'));
  rect(g, 4, 0, 16, 1, lit ? '#ff7a2c' : '#3a241a');
  return outline(c, OUT);
}
function looseStone() { const [c, g] = canvas(12, 12); fillPoly(g, [[1, 0], [11, 0], [9, 10], [3, 11]], ST.l); rect(g, 1, 0, 10, 2, ST.hi); line(g, 5, 2, 7, 9, ST.mor); return outline(c, OUT); }
function bookshelf(v) {
  const [c, g] = canvas(22, 30); rect(g, 0, 0, 22, 30, WD[1]); rect(g, 2, 2, 18, 26, WD[0]); rect(g, 0, 0, 22, 2, WD[3]);
  for (let s = 0; s < 3; s++) { const y = 9 + s * 9; rect(g, 1, y, 20, 2, WD[2]); let x = 3; let k = v * 3 + s; while (x < 19) { const bw = 1 + ((k * 7) % 3), bh = 5 + ((k * 5) % 3); rect(g, x, y - bh, bw, bh, SPINE[k % SPINE.length]); x += bw + ((k % 4) === 0 ? 2 : 0); k++; } }
  return outline(c, OUT);
}
function shrine(v) {   /* a little stone shrine: a stepped base, a niche with a lamp, a tiled cap */
  const [c, g] = canvas(18, 22); rect(g, 1, 18, 16, 4, ST.m); rect(g, 1, 18, 16, 1, ST.hi); rect(g, 3, 8, 12, 10, ST.l); rect(g, 3, 8, 1, 10, ST.hi);
  rect(g, 6, 10, 6, 7, '#241c16'); rect(g, 8, 13, 2, 3, v ? '#ffb040' : '#c9a44a'); px(g, 8, 12, '#fff0a0');
  fillPoly(g, [[0, 8], [9, 1], [18, 8]], RF[1]); rect(g, 0, 7, 18, 2, RF[0]); rect(g, 8, 0, 2, 2, BR[3]);
  if (v) { rect(g, 13, 15, 3, 3, FLAG[0]); rect(g, 2, 15, 2, 3, FLAG[1]); }
  return outline(c, OUT);
}
function flagPost(v) {   /* a pole with a long prayer flag down it */
  const [c, g] = canvas(10, 32); rect(g, 1, 0, 2, 32, WD[2]); rect(g, 1, 0, 1, 32, WD[3]); rect(g, 0, 0, 4, 2, BR[3]);
  for (let y = 2; y < 24; y += 4) rect(g, 3, y, 6 - ((y >> 3) & 1), 4, FLAG[(y / 4 + v) % 5]);
  return outline(c, OUT);
}
function statue() {   /* a stone monk seated on a plinth, hands in his lap */
  const [c, g] = canvas(16, 30); rect(g, 1, 24, 14, 6, ST.m); rect(g, 1, 24, 14, 1, ST.hi);
  fillPoly(g, [[2, 24], [14, 24], [12, 12], [4, 12]], ST.l); rect(g, 5, 18, 6, 3, ST.d);
  circle(g, 8, 8, 4, ST.l); rect(g, 6, 8, 1, 1, ST.deep); rect(g, 9, 8, 1, 1, ST.deep); rect(g, 4, 3, 8, 2, ST.hi); px(g, 4, 20, MOSS[0]); px(g, 11, 15, MOSS[1]);
  return outline(c, OUT);
}
function portcullis() {   /* the gate that fell, lying on its face with its teeth in the flags */
  const [c, g] = canvas(44, 10); for (let x = 1; x < 43; x += 6) { rect(g, x, 2, 3, 8, '#4a4a52'); rect(g, x, 2, 1, 8, '#6a6a74'); }
  for (const y of [3, 7]) rect(g, 0, y, 44, 2, '#3a3a42'); rect(g, 0, 3, 44, 1, '#7a7a84'); for (let x = 2; x < 42; x += 6) px(g, x + 1, 9, '#2a2a30');
  return outline(c, OUT);
}
export function bakeBeadIcon() {   /* a string of prayer beads with its tassel */
  const [c, g] = canvas(10, 12); g.strokeStyle = '#6a3a24'; g.lineWidth = 1; g.beginPath(); g.arc(5, 5, 3.5, 0, Math.PI * 2); g.stroke();
  for (let a = 0; a < 8; a++) { const th = a / 8 * Math.PI * 2; rect(g, Math.round(5 + Math.cos(th) * 3.5) - 1, Math.round(5 + Math.sin(th) * 3.5) - 1, 2, 2, a % 4 ? '#c9463d' : BR[3]); }
  rect(g, 4, 9, 2, 3, '#e8c84a'); px(g, 5, 9, BR[4]);
  return outline(c, OUT);
}

// Quiet work left on the terraces. These are scenery, painted without a collision outline.
function terraceProp(kind, frame=0) {
  const [c,g]=canvas(kind==='pilgrimLeanTo'?42:kind==='prayerFlags'?48:24,32);
  const r=(x,y,w,h,col)=>rect(g,x,y,w,h,col);
  if(kind==='stoneLantern'){r(7,29,12,3,ST.m);r(11,17,4,12,ST.l);r(7,8,12,10,ST.m);r(10,10,6,6,'#e6c776');r(5,7,16,3,ST.cap);r(9,4,8,3,ST.l);}
  if(kind==='herbBed'){r(1,27,22,5,ST.m);r(3,27,18,2,'#67523e');for(let x=4;x<22;x+=4){r(x,21,2,7,'#697b4f');r(x-2,23,5,2,'#a4a568');}}
  if(kind==='pilgrimLeanTo'){r(3,8,2,24,WD[2]);r(36,20,2,12,WD[2]);fillPoly(g,[[2,8],[39,20],[37,23],[2,11]],'#a99a78');r(6,28,28,4,'#82765d');r(25,24,7,4,'#a58e6b');}
  if(kind==='prayerFlags'){r(1,8,2,24,WD[2]);r(44,8,2,24,WD[2]);line(g,2,10,45,10,WD[3]);for(let x=6;x<43;x+=8)r(x,11,5,8,['#b48b5e','#8c6a62','#9eab89'][Math.floor(x/8)%3]);}
  if(kind==='incenseStand'){r(5,29,14,3,ST.m);r(9,22,6,7,ST.l);r(6,19,12,4,BR[2]);for(let y=7;y<20;y+=4)r(11+(y%3),y,2,3,'#c2b8a5');}
  if(kind==='monkChores'){r(7,28,10,4,'#716153');fillPoly(g,[[9,15],[15,15],[19,29],[5,29]],'#a99979');circle(g,12,12,5,'#a99979');r(10,11,5,4,'#c7ac88');r(13,18,7,3,'#a99979');line(g,20,16,18+frame,30,WD[3]);r(16+frame,29,7,3,'#b5a472');}
  return c;
}

export function bakeMonkProps() {
  return { stoneLantern: terraceProp('stoneLantern'), herbBed: terraceProp('herbBed'), pilgrimLeanTo: terraceProp('pilgrimLeanTo'), prayerFlags: terraceProp('prayerFlags'), incenseStand: terraceProp('incenseStand'), monkChores: [terraceProp('monkChores'),terraceProp('monkChores',1)], bell: [bell(0), bell(-1), bell(1)], bellFrame: bellFrame(), wheel: [0, 1, 2, 3].map(prayerWheel), basket: basket(), hoist: hoist(),
    brazier: [brazierBowl(false), brazierBowl(true)], stone: looseStone(), bookshelf: [bookshelf(0), bookshelf(1)], shrine: [shrine(0), shrine(1)],
    flagPost: [flagPost(0), flagPost(2)], statue: statue(), portcullis: portcullis(), bead: bakeBeadIcon(), rubble: bakeRubbleTile() };
}

// ---------- the back pass: flags on their lines, the walkway's posts, and the cloud ----------
export function drawFlags(g, flags, cx, cy, VW, VH, time) {
  for (const [x0, y0, x1, y1] of flags) { const ax = x0 * T + 8 - cx, ay = y0 * T - cy, bx = x1 * T + 8 - cx, by = y1 * T - cy;
    if (Math.max(ax, bx) < -10 || Math.min(ax, bx) > VW + 10 || Math.max(ay, by) < -30 || Math.min(ay, by) > VH + 30) continue;
    const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 9)), sag = 10;
    g.strokeStyle = '#3a2a1c'; g.lineWidth = 1; g.beginPath();
    for (let i = 0; i <= n; i++) { const k = i / n, x = ax + (bx - ax) * k, y = ay + (by - ay) * k + Math.sin(k * Math.PI) * sag; i ? g.lineTo(Math.round(x) + 0.5, Math.round(y) + 0.5) : g.moveTo(Math.round(x) + 0.5, Math.round(y) + 0.5); }
    g.stroke();
    for (let i = 1; i < n; i++) { const k = i / n, x = Math.round(ax + (bx - ax) * k), y = Math.round(ay + (by - ay) * k + Math.sin(k * Math.PI) * sag), fl = Math.round(Math.sin(time * 3 + i * 1.3) * 1.5);
      g.fillStyle = FLAG[(i + x0) % 5]; g.fillRect(x - 2 + fl, y + 1, 5, 6); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - 2 + fl, y + 5, 5, 2); } }
}
export function drawHangers(g, hangers, cx, cy, VW, VH) {
  for (const [x, y0, y1] of hangers) { const sx = Math.round(x * T + 7 - cx), a = Math.round(y0 * T - cy), b = Math.round((y1 + 1) * T - cy); if (sx < -4 || sx > VW + 4 || b < 0 || a > VH) continue;
    g.fillStyle = WD[1]; g.fillRect(sx, a, 3, b - a); g.fillStyle = WD[3]; g.fillRect(sx, a, 1, b - a); g.fillStyle = WD[0]; g.fillRect(sx - 1, a, 5, 2); }
}
// THE CLOUD LINE: a bank of cloud lying along the cliff at that row, lit from above, so the climb goes up INTO it and out
export function drawCloudBank(g, row, cx, cy, VW, VH, time) {
  const y = row * T - cy; if (y < -60 || y > VH + 60) return;
  for (let layer = 0; layer < 3; layer++) { const off = (time * (4 + layer * 3) + layer * 90) % 96;
    for (let x = -96 + off - (cx * (0.6 + layer * 0.2)) % 96; x < VW + 96; x += 48) { const bob = Math.sin((x + cx) * 0.02 + layer) * 3, yy = y - 18 + layer * 12 + bob;
      g.globalAlpha = 0.16 + layer * 0.05; g.fillStyle = layer === 2 ? '#e6e8ee' : '#f4f2ee';
      g.beginPath(); g.ellipse(Math.round(x) + 24, Math.round(yy), 34, 9 + layer * 2, 0, 0, Math.PI * 2); g.fill(); } }
  g.globalAlpha = 1;
}

// ---------- THE FLEDGLING ----------
// The Roc's chicks, turned out of the nest when they got too big for it and gone down the mountain into the ruins.
// A lump of grey down on two yellow feet, a beak too big for its head, stubby wings it cannot fly on yet. It pecks.
// 16x14, facing RIGHT. Frames: 0 walk A, 1 walk B, 2 peck tell (reared back, beak open, wings up), 3 peck (lunged low),
// 4 hop (wings out). Anchor: ax 8, ay 13 (the feet); hit box w 10, h 9.
export function bakeFledgling() {
  const D = { d: '#6a6056', D: '#4a423a', l: '#9a8e7e', w: '#d8ccb8', b: '#e8b040', B: '#a8701c', e: '#1b1626', r: '#c9463d' };
  const frame = (pose, step) => { const [c, g] = canvas(16, 14);
    const lean = pose === 3 ? 2 : pose === 2 ? -1 : 0, hy = pose === 3 ? 4 : pose === 2 ? 1 : 2;
    // feet
    if (pose === 4) { rect(g, 6, 12, 1, 2, D.b); rect(g, 9, 12, 1, 2, D.b); }
    else { rect(g, 5 + (step ? 1 : 0), 12, 2, 2, D.b); rect(g, 9 - (step ? 1 : 0), 12, 2, 2, D.b); px(g, 4 + (step ? 1 : 0), 13, D.B); px(g, 11 - (step ? 1 : 0), 13, D.B); }
    // body, a round lump of down
    circle(g, 7 + lean * 0.5, 8, 4.5, D.d); circle(g, 7 + lean * 0.5, 9, 3, D.l); rect(g, 4, 11, 7, 1, D.D);
    // wings
    if (pose === 2 || pose === 4) { fillPoly(g, [[5, 7], [1, 3], [3, 8]], D.D); fillPoly(g, [[9, 7], [13, pose === 4 ? 3 : 4], [10, 9]], D.d); }
    else { fillPoly(g, [[4, 7], [2, 10], [6, 10]], D.D); }
    // head
    circle(g, 10 + lean, hy + 2, 3, D.d); px(g, 9 + lean, hy, D.w); px(g, 11 + lean, hy, D.w);   /* the tuft */
    px(g, 11 + lean, hy + 2, D.e); px(g, 11 + lean, hy + 1, '#ffffff');
    // the beak: open on the tell, driven out on the peck
    if (pose === 2) { fillPoly(g, [[12 + lean, hy + 1], [15 + lean, hy], [13 + lean, hy + 2]], D.b); fillPoly(g, [[12 + lean, hy + 3], [15 + lean, hy + 4], [13 + lean, hy + 2]], D.B); px(g, 13 + lean, hy + 2, D.r); }
    else if (pose === 3) { fillPoly(g, [[12 + lean, hy + 1], [16, hy + 2], [12 + lean, hy + 3]], D.b); px(g, 15, hy + 2, D.B); }
    else { fillPoly(g, [[12 + lean, hy + 1], [15, hy + 2], [12 + lean, hy + 3]], D.b); px(g, 14, hy + 2, D.B); }
    return outline(c, OUT); };
  return pack([frame(0, 0), frame(0, 1), frame(2, 0), frame(3, 0), frame(4, 0)], 8, 13, 10, 9);
}

// ---------- THE TEMPLE GUARDIAN ----------
// The monks' guardian: a stone warden twice a man's height, hooded, a bronze-shod staff in its right hand, moss in the
// folds of its robe and two lamps for eyes. It was set to stand in the hall, and it has stood there since. 40x40,
// facing RIGHT, the same frame order as the Facet it replaced: 0 idle, 1 walk A, 2 walk B, 3 stamp (staff and foot up),
// 4 throw (arm back with a stone), 5 stagger (cracked, head snapped aside), 6 raise (both arms up, the floor coming
// with them), 7 sweep tell (staff drawn back low), 8 sweep (staff swept out along the floor). Anchor ax 20, ay 36.
export function bakeGuardian() {
  const S = { s: '#9a9082', S: '#7a7064', d: '#5a5248', D: '#403a34', w: '#c8bca8', m: MOSS[0], M: MOSS[1], e: '#ffb040', E: '#fff0a0', k: '#241e1a', t: WD[2], T: BR[3] };
  const frame = (pose) => { const [c, g] = canvas(40, 40);
    const walk = pose === 1 ? 1 : pose === 2 ? -1 : 0, bob = walk ? 1 : 0, hx = pose === 5 ? -2 : 0;
    // legs: two stone pillars under the robe
    const lx = [14 + walk * 2, 22 - walk * 2]; if (pose === 3) lx[1] = 23;
    for (let i = 0; i < 2; i++) { const up = pose === 3 && i === 1 ? 4 : 0; rect(g, lx[i], 29 - up + bob, 5, 6, S.S); rect(g, lx[i] - 1, 34 - up, 7, 2, S.D); rect(g, lx[i], 29 - up + bob, 1, 6, S.s); }
    // the robe: a heavy trapezoid, belted
    fillPoly(g, [[12, 12 + bob], [28, 12 + bob], [31, 30 + bob], [9, 30 + bob]], S.s);
    fillPoly(g, [[12, 12 + bob], [16, 12 + bob], [13, 30 + bob], [9, 30 + bob]], S.w);
    fillPoly(g, [[25, 12 + bob], [28, 12 + bob], [31, 30 + bob], [27, 30 + bob]], S.S);
    rect(g, 11, 20 + bob, 18, 2, S.D); rect(g, 19, 20 + bob, 3, 2, S.T);
    for (let y = 23; y < 30; y += 3) { px(g, 15, y + bob, S.d); px(g, 24, y + bob, S.d); }
    px(g, 11, 27 + bob, S.m); px(g, 12, 28 + bob, S.M); px(g, 27, 16 + bob, S.m); px(g, 29, 25 + bob, S.m);
    // the head, hooded, with its lamp eyes
    const hy = 3 + bob + (pose === 3 ? -1 : 0);
    fillPoly(g, [[14 + hx, hy + 9], [16 + hx, hy], [24 + hx, hy], [26 + hx, hy + 9]], S.S);
    rect(g, 17 + hx, hy + 3, 7, 6, S.d); rect(g, 18 + hx, hy + 5, 2, 1, S.e); rect(g, 22 + hx, hy + 5, 2, 1, S.e); px(g, 18 + hx, hy + 5, S.E);
    rect(g, 16 + hx, hy, 8, 1, S.w);
    // arms and staff by pose
    const staff = (x0, y0, x1, y1) => { line(g, x0, y0, x1, y1, S.t); line(g, x0 + 1, y0, x1 + 1, y1, WD[1]); rect(g, x1 - 1, y1 - 1, 3, 3, S.T); };
    const arm = (sx, sy, hx2, hy2) => { line(g, sx, sy, hx2, hy2, S.S); line(g, sx, sy + 1, hx2, hy2 + 1, S.s); line(g, sx + 1, sy + 1, hx2 + 1, hy2 + 1, S.s); rect(g, hx2 - 1, hy2 - 1, 4, 4, S.s); };
    if (pose === 3) { arm(27, 14, 30, 4); staff(30, 0, 31, 22); arm(13, 14, 10, 20); }
    else if (pose === 4) { arm(13, 14, 5, 8); rect(g, 2, 4, 5, 5, S.d); rect(g, 2, 4, 5, 1, S.w); arm(27, 14, 30, 22); staff(30, 10, 34, 35); }
    else if (pose === 6) { arm(13, 14, 7, 3); arm(27, 14, 33, 3); staff(34, 0, 36, 18); rect(g, 2, 32, 8, 4, S.d); rect(g, 30, 32, 8, 4, S.d); }
    else if (pose === 7) { arm(27, 15, 22, 24); staff(4, 30, 26, 22); arm(13, 15, 11, 24); }
    else if (pose === 8) { arm(27, 15, 36, 26); staff(14, 31, 39, 34); arm(13, 15, 22, 26); for (let x = 20; x < 40; x += 3) px(g, x, 37, S.w); }
    else { arm(27, 14, 29, 24 + bob); staff(29, 6, 31, 35); arm(13, 14, 11, 24 + bob); }
    if (pose === 5) { line(g, 15, 13, 22, 22, S.k); line(g, 22, 22, 18, 29, S.k); line(g, 24, 4, 21, 9, S.k); px(g, 19, 7, S.E); }
    return outline(c, OUT); };
  return pack([0, 1, 2, 3, 4, 5, 6, 7, 8].map(frame), 20, 36, 30, 34);
}

// ---------- THE GOBLIN PRIEST ----------
// A goblin who came up the mountain after the monks left and put on what they left hanging: the maroon robe over its
// own mail, the saffron stole, the hood pulled up to a point, and a censer on a chain it swings over the others the way
// it saw it done. It cannot fight. It can make them harder to kill. At sixteen pixels it is A PEAK AND A BELL - the only
// goblin on the mountain whose outline comes to a point over its head and spreads to the floor - with a brass pot
// hanging off one hand, where the rock goblin is a rock and the looter is two ears.
// 16x23 grid on an 18x25 canvas, facing RIGHT. Frames: 0 idle, 1 walk A, 2 walk B, 3 the rite (censer up, bell out),
// 4 the rite's swing, 5 hurt (last). Anchor: ax 8, ay 23 (the feet); hit box w 10, h 16.
const putRow = (rows, y, x, str) => { while (rows.length <= y) rows.push(''); rows[y] = rows[y].padEnd(x, '.'); rows[y] = rows[y].slice(0, x) + str + rows[y].slice(x + str.length); };
export function bakeGoblinPriest() {
  const P = { g: '#6faa4a', G: '#3f6e2c', e: '#f3f0d2', o: OUT, m: '#8e3a32', M: '#5a1e1e', h: '#b8584a', y: '#e8a83a', Y: '#a8681c',
    s: '#9aa3ae', S: '#5a6270', b: BR[3], B: BR[1], k: BR[4], c: '#6a5a48', r: '#ff9a3c', R: '#ffe08a' };
  const put = putRow;
  const hood = ['......MM', '.....MmmM', '....MmhmmM', '...MmhmmmmM', '...MggggggM', '...MgeogeoM', '...MgGGGggM'];
  const robe = arm => ['..MmyymmyymM', '..mmmymmymmm' + (arm ? 'mg' : ''), '..hmmmyymmmm', '.hmmmmyymmmm', '.hmmmmyymmmm', 'hhmmmmyymmmm', 'hmmmmmyymmmm', 'hmmmmmmmmmmm', 'MMMmmmmmmmMMM', '..sSsSsSsSs'];
  const censer = (rows, x, y, lit) => { put(rows, y, x - 1, 'BbB'); put(rows, y + 1, x - 1, lit ? 'bRb' : 'brb'); put(rows, y + 2, x - 1, 'BbB'); };
  const feet = ['..GG....GG', '...GG..GG', '..GG...GG'];
  const frame = pose => {
    const rows = ['', '', '', '', ''];   /* five rows over the hood, for the censer when it goes up */
    for (const r of hood) rows.push(pose === 5 ? '.' + r : r);
    for (const r of robe(pose < 3)) rows.push(r);
    if (pose === 5) {   /* HURT: the hood knocked back, the pot flung out on its chain */
      put(rows, 12, 12, 'mm'); put(rows, 11, 14, 'c'); censer(rows, 15, 8, false); }
    else if (pose === 3 || pose === 4) {   /* THE RITE: the censer held up over the hood on a short chain, the bell rung out to the side */
      const sw = pose === 4 ? 1 : 0;
      put(rows, 11, 12, 'm'); put(rows, 10, 12, 'm'); put(rows, 9, 12, 'm'); put(rows, 8, 12, 'm'); put(rows, 7, 12, 'g'); put(rows, 6, 12 + sw, 'c'); put(rows, 5, 12 + sw, 'c');
      censer(rows, 12 + sw * 2, 2, true);
      put(rows, 11, 0, 'mmm'); put(rows, 12, 0, 'g'); put(rows, 13, 0, 'c'); put(rows, 14, sw, 'kb'); put(rows, 15, sw, 'bB'); }
    else {   /* the pot swings as it walks */
      const sw = pose === 1 ? -1 : pose === 2 ? 1 : 0;
      put(rows, 14, 13, 'c'); put(rows, 15, 13 + sw, 'c'); censer(rows, 13 + sw, 16, false); }
    while (rows.length < 22) rows.push(''); rows.length = 22; rows.push(feet[pose === 1 ? 1 : pose === 2 ? 2 : 0]);
    return outline(fromGrid(rows.map(r => (r || '').padEnd(16, '.').slice(0, 16)), P, 1), OUT); };
  return pack([0, 1, 2, 3, 4, 5].map(frame), 8, 23, 10, 16);
}

// ---------- THE GOBLIN MAGE ----------
// The one that went into the scriptorium instead of the kitchens and came out with a book it cannot read and a
// scholar's hat three sizes too big, the point of it bent over backward. It has worked out that if it holds the book
// open and shouts at it, things happen. A blue robe with the monks' gilt on the hem and collar, and a red-bound book
// whose white pages are the brightest thing on it. At sixteen pixels it is A CROOKED HAT AND A WHITE PAGE: taller than
// any goblin on the mountain, and the only one with a point that leans.
// 16x21 grid on an 18x23 canvas, facing RIGHT. Frames: 0 idle, 1 walk A, 2 walk B, 3 bolt tell (the book open and held
// out), 4 bolt (thrust, the pages lit), 5 rune tell (the book up over its head), 6 hurt (last). Anchor ax 8, ay 21; hit box w 10, h 16.
export function bakeGoblinMage() {
  const P = { g: '#6faa4a', G: '#3f6e2c', e: '#f3f0d2', o: OUT, n: '#34467a', N: '#1c2448', l: '#5a6ea8', t: BR[3], T: BR[1],
    p: '#f6f0dc', P: '#b8ac90', r: '#8a2a2a', v: '#c9a0ff', V: '#f0e4ff' };
  const put = putRow;
  const hat = ['.N', '.Nn', '..Nnn', '...Nnnn', '....Nnnnn', '....Nnnlnn', '....Ntttttt', '..NNnnnnnnnNN'];
  const hatHurt = ['', '', '', '.......nnN', '......nnnnN', '.....nlnnnN', '....ttttttN', '..NNnnnnnnnNN'];
  const head = ['....ggggggg', '....ggeogeo', '.....gGGGg'];
  const body = ['...nnttttnnn', '..nnlnnnnnnn', '..nlnnnnnnnn', '..nlnnnnnnnn', '.nnlnnnnnnnnn', '.nnlnnnnnnnnn', '.NtTtTtTtTtTN'];
  const feet = ['...GG...GG', '....GG.GG', '...GG....GG'];
  const frame = pose => {
    const rows = [...(pose === 6 ? hatHurt : hat), ...head, ...body];
    if (pose === 6) {   /* HURT: the hat knocked over the other way, eyes shut, the book gone out of its hands */
      put(rows, 9, 4, 'gGGgGGg'); put(rows, 13, 13, 'rpr'); put(rows, 14, 14, 'rp'); }
    else if (pose === 3 || pose === 4) {   /* the book OPEN and held out at the thing it means: two white pages, lit on the throw */
      const x = pose === 4 ? 12 : 11;
      put(rows, 12, 10, 'g'); put(rows, 11, x, 'rppr'); put(rows, 12, x, pose === 4 ? 'rVVr' : 'rpPr'); put(rows, 13, x, 'rrrr');
      if (pose === 4) { put(rows, 10, x + 1, 'vv'); put(rows, 12, x + 4, 'v'); } }
    else if (pose === 5) {   /* THE RUNE: the book up over the hat at arm's length, open to the floor it is about to write on */
      put(rows, 1, 9, 'rrrrrrr'); put(rows, 2, 9, 'rpppPpr'); put(rows, 3, 9, 'rrrrrrr'); put(rows, 4, 12, 'g');
      put(rows, 5, 12, 'n'); put(rows, 6, 12, 'n'); put(rows, 8, 12, 'n'); put(rows, 9, 12, 'n'); put(rows, 10, 11, 'nn'); }
    else {   /* the book shut under its arm */
      put(rows, 12, 11, 'rrr'); put(rows, 13, 11, 'rppr'); put(rows, 14, 11, 'rrr'); }
    while (rows.length < 20) rows.push(''); rows.length = 20; rows.push(feet[pose === 1 ? 1 : pose === 2 ? 2 : 0]);
    return outline(fromGrid(rows.map(r => (r || '').padEnd(16, '.').slice(0, 16)), P, 1), OUT); };
  return pack([0, 1, 2, 3, 4, 5, 6].map(frame), 8, 21, 10, 16);
}
