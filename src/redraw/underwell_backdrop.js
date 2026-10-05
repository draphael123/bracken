// underwell_backdrop.js - THE UNDERWELL's own BACKDROP and ROOMS (claude/underwellart). The greybox drew a two-depth arcade and a brown haze; this is the cistern:
//   wall      the far wall of the cistern, world-anchored (0.9): coursed ashlar in blind arcades, a riveted pipe across it with flanges and a brass valve, damp streaks, chains
//   LANDMARK  THE OLD WELL SHAFT: a column of pale light falling from a grille in the vault (an oculus rim, a cone, motes, a lit patch on the far floor), repeated on a slow
//             parallax (0.35) every ~300 px so one is in view on almost every screen - and THE DRY WELL's own shaft is lit by one at its true place (the grille at its head)
//   pillars   world-anchored columns, fluted, with capitals and plinths, wherever the geometry leaves a tall open span (the hall, the lower works): the cistern is a colonnade
//   depth     darker the deeper; a warm lamp-haze low in the halls
//   rooms     'uwChamber' (the brood chamber: brick, web, egg-sacs), 'uwVault' (the fountain's vault: brass-warm cut stone), 'uwQueen' (the Queen's cistern: a grand hall of dressed
//             stone, a blind arcade, a frieze, ribs)
// Every static picture is baked ONCE (memo); a frame is a handful of drawImage calls.   drawBackdrop(g, cx, cy, VW, VH, L, time)   paintRoom(g, st, sx, sy, w, h, tx0, ty0, time)
import { mulberry } from '../px.js';
import { UC, hash } from './underwell_tiles.js';
const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/* a pixel-true semicircular arch: its centre on (cx, baseY), radius r, filled with col (rows from baseY up to baseY - r) */
const archFill = (g, cx, baseY, r, col) => { for (let dy = 0; dy <= r; dy++) { const hw = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy))); rc(g, cx - hw, baseY - dy, hw * 2, 1, col); } };
const archRing = (g, cx, baseY, r, col, th = 1) => { for (let dy = 0; dy <= r; dy++) { const hw = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy))), hw2 = Math.round(Math.sqrt(Math.max(0, (r - th) * (r - th) - dy * dy))); rc(g, cx - hw, baseY - dy, hw - hw2 + (dy === r ? hw2 * 2 : 0), 1, col); rc(g, cx + hw2 + (dy === r ? -hw2 * 2 : 0), baseY - dy, hw - hw2 + (dy === r ? hw2 * 2 : 0), 1, col); } };

/* THE FAR WALL: one 192 x 192 tile. Two bays of a blind arcade (pier + recessed arch), a string course, a pipe across the middle, damp streaks, a hanging chain */
const wallTile = () => once('wall', () => { const S = 192, [c, g] = mk(S, S), r = mulberry(5521);
  const W = { a: '#1b1713', b: '#221d18', c: '#2a241d', d: '#120f0c', e: '#352d24', f: '#3f3529' };
  rc(g, 0, 0, S, S, W.b);
  for (let y = 0; y < S; y += 8) { const off = ((y / 8) & 1) ? 12 : 0; rc(g, 0, y, S, 1, W.d); for (let x = -16 + off; x < S; x += 24) { rc(g, x, y, 1, 8, W.d); const t = r(); if (t < 0.3) rc(g, x + 1, y + 1, 22, 6, W.c); else if (t < 0.45) rc(g, x + 1, y + 1, 22, 6, W.a); rc(g, x + 1, y + 1, 22, 1, W.e); } }
  /* the arcade: bays 96 wide: a pier 18 wide at each side of a recessed arch niche (72 wide), the arch springing at y 84 */
  for (let bx = 0; bx < S; bx += 96) {
    const nx0 = bx + 18, nx1 = bx + 90, ncx = (nx0 + nx1) / 2, rad = (nx1 - nx0) / 2, spring = 98;
    rc(g, nx0, spring, nx1 - nx0, S - spring, '#0c0a08'); archFill(g, ncx, spring, rad, '#0c0a08');                                                   /* the niche, black */
    for (let y = spring + 6; y < S; y += 8) rc(g, nx0, y, nx1 - nx0, 1, '#171310');                                                                  /* its back wall's courses, barely */
    archRing(g, ncx, spring, rad, W.f, 1); archRing(g, ncx, spring, rad - 1, W.e, 1); archRing(g, ncx, spring, rad + 1, W.d, 1);                          /* the arch's moulding, lit */
    rc(g, ncx - 3, spring - rad - 4, 6, 4, W.f); rc(g, ncx - 2, spring - rad - 3, 4, 3, W.e);                                                          /* the keystone */
    rc(g, bx + 14, spring - 3, 8, 3, W.f); rc(g, bx + 86, spring - 3, 8, 3, W.f); rc(g, bx + 14, spring, 8, 1, W.d); rc(g, bx + 86, spring, 8, 1, W.d);   /* the imposts */
    for (let y = spring; y < S; y += 3) { rc(g, bx + 18, y, 1, 2, W.f); rc(g, bx + 89, y, 1, 2, W.d); }                                                 /* the niche's jambs */
  }
  rc(g, 0, 60, S, 3, W.e); rc(g, 0, 60, S, 1, W.f); rc(g, 0, 63, S, 1, W.d);                                                                         /* a string course */
  /* the PIPE across the wall: 7 px thick, flanges every 48, a brass valve wheel, rust drips */
  rc(g, 0, 24, S, 7, '#1e1e24'); rc(g, 0, 24, S, 1, '#4a4a56'); rc(g, 0, 25, S, 1, '#34343e'); rc(g, 0, 30, S, 1, '#0c0c10'); rc(g, 0, 28, S, 1, '#14141a');
  for (const fx of [14, 62, 110, 158]) { rc(g, fx, 21, 5, 13, '#2c2c36'); rc(g, fx, 21, 5, 1, '#5a5a68'); rc(g, fx + 1, 23, 1, 1, '#9a9aa8'); rc(g, fx + 1, 31, 1, 1, '#9a9aa8'); rc(g, fx + 4, 21, 1, 13, '#0c0c10'); }
  rc(g, 86, 15, 2, 9, '#2a2a32'); rc(g, 80, 13, 14, 3, '#a4742a'); rc(g, 80, 13, 14, 1, '#d8a444'); rc(g, 85, 11, 4, 3, '#6c4a10'); rc(g, 81, 16, 12, 1, '#3c2a08');   /* the valve and its brass wheel */
  for (const dx of [40, 134]) { for (let k = 0; k < 14; k++) rc(g, dx, 31 + k, 1, 1, k < 11 ? '#3a1c0c' : '#241008'); }                                 /* rust drips */
  /* damp: long dark streaks down from the string course and the pipe, a pale limescale tail on some */
  for (let i = 0; i < 16; i++) { const x = (r() * S) | 0, y0 = 64 + ((r() * 50) | 0), len = 12 + ((r() * 50) | 0); for (let k = 0; k < len; k++) rc(g, x + (k % 11 === 10 ? 1 : 0), y0 + k, 1, 1, k > len - 4 && i % 3 === 0 ? '#5a554a' : '#0c0a08'); }
  /* a hanging chain at a bay's pier */
  for (let k = 0; k < 20; k++) { rc(g, 7, 70 + k * 5, k & 1 ? 1 : 3, 4, k & 1 ? '#2c2c34' : '#4a4a56'); }
  rc(g, 4, 66, 7, 4, '#2c2c36'); rc(g, 5, 66, 5, 1, '#5a5a68');
  return c; });

/* THE LANDMARK: the old well shaft's light. 96 wide x 220 tall: an oculus rim at the top (a cut-stone ring over a bright disc), the cone falling from it, soft-edged,
   brighter at its throat and fading to the far floor, where it lands as a pale patch */
const shaftLight = () => once('beam', () => { const w = 96, h = 132, [c, g] = mk(w, h);
  const cxm = w / 2;
  for (let y = 0; y < h; y++) { const t = y / h, half = 9 + t * 30, a = Math.pow(1 - t, 0.9) * 0.78 + 0.05;
    for (let x = -half - 6; x <= half + 6; x++) { const e = Math.abs(x) / half, soft = e <= 0.82 ? 1 : Math.max(0, 1 - (e - 0.82) / 0.3); if (soft <= 0) continue;
      g.globalAlpha = a * soft * (0.8 + 0.2 * Math.sin((x + y * 0.3) * 0.5)); g.fillStyle = '#cfe4f4'; g.fillRect(Math.round(cxm + x), y, 1, 1); } }
  g.globalAlpha = 1;
  /* the patch it lands in, on the far floor: a flattened ellipse of pale light */
  for (let k = 0; k < 6; k++) { g.globalAlpha = 0.07; g.fillStyle = '#dcecf8'; const rw = 40 - k * 5, rh = 5 - k * 0.6; for (let dy = -rh; dy <= rh; dy++) { const hw = Math.round(rw * Math.sqrt(Math.max(0, 1 - (dy * dy) / (rh * rh)))); g.fillRect(Math.round(cxm - hw), 122 + Math.round(dy), hw * 2, 1); } }
  g.globalAlpha = 1;
  /* the oculus: a cut-stone ring over a bright disc, with a grille's bars across it */
  for (let dy = -7; dy <= 7; dy++) { const hw = Math.round(11 * Math.sqrt(Math.max(0, 1 - (dy * dy) / 56))); rc(g, cxm - hw - 3, 4 + dy, hw * 2 + 6, 1, '#3b342e'); }
  for (let dy = -6; dy <= 6; dy++) { const hw = Math.round(10 * Math.sqrt(Math.max(0, 1 - (dy * dy) / 42))); rc(g, cxm - hw, 4 + dy, hw * 2, 1, '#eaf4fc'); }
  for (let dy = -6; dy <= 6; dy++) { const hw = Math.round(10 * Math.sqrt(Math.max(0, 1 - (dy * dy) / 42))); rc(g, cxm - hw, 4 + dy, 1, 1, '#a8c4d8'); }
  rc(g, cxm - 10, 4, 20, 1, '#5a6a78'); rc(g, cxm - 4, -2, 1, 13, '#2a2a32'); rc(g, cxm + 3, -2, 1, 13, '#2a2a32');
  return c; });

/* A PILLAR, baked per height (px): a fluted shaft between a capital and a plinth; lit on the left, dark on the right; damp stains low down */
const pillar = h => once('pil' + h, () => { const w = 16, [c, g] = mk(w, h), r = mulberry(h * 13 + 7);
  const sh = { a: '#2e2822', b: '#3a322a', c: '#4a4036', d: '#1a1613', e: '#5a4e42' };
  rc(g, 2, 0, 12, h, sh.b); rc(g, 2, 0, 2, h, sh.c); rc(g, 3, 0, 1, h, sh.e); rc(g, 12, 0, 2, h, sh.a); rc(g, 13, 0, 1, h, sh.d);
  for (const fx of [6, 9]) rc(g, fx, 10, 1, h - 20, sh.a);                                                              /* the flutes */
  for (let y = 12; y < h - 10; y += 14 + ((r() * 8) | 0)) rc(g, 2, y, 12, 1, sh.d);                                      /* drum joints */
  rc(g, 0, 0, 16, 3, sh.c); rc(g, 0, 0, 16, 1, sh.e); rc(g, 1, 3, 14, 3, sh.b); rc(g, 1, 6, 14, 1, sh.d); rc(g, 2, 7, 12, 2, sh.a);   /* the capital */
  rc(g, 0, h - 3, 16, 3, sh.c); rc(g, 0, h - 3, 16, 1, sh.e); rc(g, 1, h - 7, 14, 4, sh.b); rc(g, 1, h - 7, 14, 1, sh.c); rc(g, 1, h - 4, 14, 1, sh.d);   /* the plinth */
  for (let i = 0; i < 4; i++) { const x = 3 + ((r() * 9) | 0), y0 = 14 + ((r() * Math.max(1, h - 40)) | 0), len = 6 + ((r() * 22) | 0); for (let k = 0; k < len; k++) rc(g, x, y0 + k, 1, 1, '#14100d'); }   /* damp */
  return c; });

/* the vault ribs over a bay between two pillars: a flattened arch of dark cut stone, 1:1 with the world, baked per span */
const rib = span => once('rib' + span, () => { const h = 26, [c, g] = mk(span, h), a = span / 2;
  for (let x = 0; x < span; x++) { const t = (x - a) / a, y = Math.round(h - 4 - (h - 8) * Math.sqrt(Math.max(0, 1 - t * t))); rc(g, x, y, 1, 3, '#3a322a'); rc(g, x, y, 1, 1, '#4a4036'); rc(g, x, y + 3, 1, 1, '#14100d'); }
  return c; });

/* the pillars' PLAN: for every column of the grid with a tall clear span (>= 9 rows) on the hall's rhythm, [x, top row, bottom row]; computed once */
const planFor = (L, T) => { if (L.__uwPillars) return L.__uwPillars; const W = L.W, H = L.H, gr = L.grid, out = [];
  const passable = (x, y) => { const v = gr[y * W + x]; return v === T.AIR || v === T.NET || v === T.ONEWAY; };
  for (let x = 4; x < W - 4; x++) {
    const sp = x < 45 || x >= 452 ? 0 : x < 141 ? 10 : x < 244 ? 11 : 0; if (!sp || (x - 6) % sp !== 0) continue;
    /* find every vertical run of passable tiles in this column and the one beside it */
    let y = 0; while (y < H) { if (!passable(x, y) || !passable(x - 1, y) || !passable(x + 1, y)) { y++; continue; } let y1 = y; while (y1 + 1 < H && passable(x, y1 + 1) && passable(x - 1, y1 + 1) && passable(x + 1, y1 + 1)) y1++;
      if (y1 - y + 1 >= 9) out.push([x, y, y1 + 1]); y = y1 + 1; } }
  L.__uwPillars = out; return out; };

export function drawBackdrop(g, cx, cy, VW, VH, L, time, T) {
  rc(g, 0, 0, VW, VH, '#0d0a08');
  /* 1. the far wall, world-anchored */
  { const pat = once('pat', () => g.createPattern(wallTile(), 'repeat')); pat.setTransform(new DOMMatrix().translate(-Math.round(cx * 0.9), -Math.round(cy * 0.9))); g.fillStyle = pat; g.fillRect(0, 0, VW, VH); }
  /* 2. THE LANDMARK: the well shaft's light, on a slow parallax, one every 300 px; and the dry well's own at its true place */
  g.globalCompositeOperation = 'lighter';
  { const beam = shaftLight(), per = 300, k = 0.35, i0 = Math.floor((cx * k - 40) / per) - 1, i1 = Math.floor((cx * k + VW + 60) / per) + 1;
    for (let i = i0; i <= i1; i++) { const h = hash(i, 91), wx = i * per + (h % 120) - 60, x = Math.round(wx - cx * k - 48), flick = 0.8 + 0.2 * Math.sin(time * 0.6 + i);
      g.globalAlpha = 0.85 * flick; g.drawImage(beam, x, Math.round(2 + (h % 26))); }
    /* the dry well's own shaft, 1:1: a column of light from the grille at its head down the shaft (x 3-14, rows 3-43) */
    const sx = 3 * TS - cx, ex = 15 * TS - cx; if (ex > 0 && sx < VW) { const top = 3 * TS - cy, bot = 43 * TS - cy;
      const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, 'rgba(190,215,235,0.34)'); gr.addColorStop(0.6, 'rgba(150,180,205,0.12)'); gr.addColorStop(1, 'rgba(120,150,180,0)');
      g.globalAlpha = 0.9 + 0.1 * Math.sin(time * 0.7); g.fillStyle = gr; g.beginPath(); g.moveTo(sx + 6, top); g.lineTo(ex - 6, top); g.lineTo(ex + 8, bot); g.lineTo(sx - 8, bot); g.closePath(); g.fill(); } }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  /* motes drifting in the light */
  { const per = 300, k = 0.35, i0 = Math.floor((cx * k - 40) / per) - 1, i1 = Math.floor((cx * k + VW + 60) / per) + 1;
    g.fillStyle = '#e8f2fa'; for (let i = i0; i <= i1; i++) { const h = hash(i, 91), bx = (h % 120) - 60 + i * per - cx * k;
      for (let m = 0; m < 7; m++) { const ph = time * (0.12 + (m % 3) * 0.05) + m * 1.7 + i, mx = bx + Math.sin(ph * 1.3 + m) * (6 + m * 2), my = ((ph * 14) + m * 41) % 120; g.globalAlpha = 0.3 + 0.35 * Math.abs(Math.sin(ph * 2)); g.fillRect(Math.round(mx), Math.round(14 + (h % 26) + my), 1, 1); } }
    g.globalAlpha = 1; }
  /* 3. the colonnade: pillars where the geometry leaves a tall span, ribs between neighbours */
  { const plan = planFor(L, T), x0 = cx - 40, x1 = cx + VW + 40; let prev = null;
    for (const [px_, top, bot] of plan) { const wx = px_ * TS; if (wx < x0 - 200) continue; if (wx > x1 + 200) break;
      const h = (bot - top) * TS; if (wx > x0 && wx < x1) g.drawImage(pillar(h), Math.round(wx - 8 - cx), Math.round(top * TS - cy));
      if (prev && prev[1] === top && prev[2] === bot && wx - prev[3] <= 12 * TS) { const span = wx - prev[3]; if (span > 0) g.drawImage(rib(span), Math.round(prev[3] - cx), Math.round(top * TS - cy + 4)); }
      prev = [px_, top, bot, wx]; } }
  /* 4. depth: the deeper the darker; a warm haze low in the halls where the lamps' light would hang */
  { const dk = wy => Math.min(0.5, 0.06 + Math.max(0, wy) / 960 * 0.42), a0 = dk(cy), a1 = dk(cy + VH); const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, 'rgba(6,4,3,' + a0.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(6,4,3,' + a1.toFixed(3) + ')'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
}

/* ============================ THE ROOMS ============================ */
const brickWall = (g, w, h, seed, c1, c2, c3, mort, bw = 10, bh = 5) => { const r = mulberry(seed); rc(g, 0, 0, w, h, mort);
  for (let y = 0, row = 0; y < h; y += bh, row++) { const off = (row & 1) ? bw / 2 : 0; for (let x = -bw + off; x < w; x += bw) { const t = r(); rc(g, x + 1, y, bw - 1, bh - 1, t < 0.2 ? c3 : t < 0.6 ? c2 : c1); rc(g, x + 1, y, bw - 1, 1, c3); } } };
const eggSac = (g, x, y, rr, lit) => { for (let dy = -rr; dy <= rr; dy++) { const hw = Math.round(rr * Math.sqrt(Math.max(0, 1 - (dy * dy) / (rr * rr)))); rc(g, x - hw, y + dy, hw * 2 + 1, 1, dy < -rr / 3 ? '#d8d0b4' : dy < rr / 3 ? '#b4ac90' : '#7c765e'); }
  rc(g, x - 1, y - rr + 1, 2, 1, '#f4efd8'); if (lit) { rc(g, x - 1, y, 1, 1, '#8fe04a'); rc(g, x + 1, y, 1, 1, '#8fe04a'); } };
const web = (g, x0, y0, dx, dy, n, col) => { g.strokeStyle = col; g.lineWidth = 1; for (let i = 0; i < n; i++) { const a = (i / (n - 1)) * Math.PI / 2; g.beginPath(); g.moveTo(x0 + 0.5, y0 + 0.5); g.lineTo(x0 + dx * Math.cos(a) + 0.5, y0 + dy * Math.sin(a) + 0.5); g.stroke(); }
  for (let k = 1; k <= 3; k++) { g.beginPath(); for (let i = 0; i < n; i++) { const a = (i / (n - 1)) * Math.PI / 2, rr = k / 3.4, x = x0 + dx * rr * Math.cos(a), y = y0 + dy * rr * Math.sin(a); if (i) g.lineTo(x + 0.5, y + 0.5); else g.moveTo(x + 0.5, y + 0.5); } g.stroke(); } };

const roomSprite = (st, w, h, tx0, ty0) => once('room' + st + w + '_' + h + '_' + (tx0 & 7), () => { const [c, g] = mk(w, h), r = mulberry(hash(w, h) + (tx0 & 7));
  if (st === 'uwChamber') {   /* THE BROOD CHAMBER: brick, a vaulted roof, webs in the corners, egg-sacs hung on the walls and heaped on the floor, bones */
    brickWall(g, w, h, 17, '#3a1e16', '#2c1611', '#52291c', '#0c0605');
    for (let x = 0; x < w; x += 56) { rc(g, x, 0, 8, h, '#20120d'); rc(g, x, 0, 1, h, '#52291c'); }
    g.globalAlpha = 0.55; rc(g, 0, 0, w, h, '#000'); g.globalAlpha = 1;
    web(g, 0, 0, 26, 22, 7, 'rgba(210,204,180,0.55)'); const [t2, tg] = mk(26, 22); web(tg, 0, 0, 26, 22, 7, 'rgba(210,204,180,0.55)'); g.save(); g.translate(w, 0); g.scale(-1, 1); g.drawImage(t2, 0, 0); g.restore();
    for (let i = 0; i < 9; i++) eggSac(g, 8 + ((r() * (w - 16)) | 0), 12 + ((r() * (h - 26)) | 0), 3 + ((r() * 2) | 0), r() < 0.5);
    for (let x = 4; x < w - 4; x += 9 + ((r() * 6) | 0)) { rc(g, x, h - 5, 3, 1, '#c8c0a4'); rc(g, x + 1, h - 6, 1, 2, '#c8c0a4'); }   /* bones */
    return c; }
  if (st === 'uwVault') {   /* THE FOUNTAIN'S VAULT: dressed stone gone brass-warm, a shelf, a lamp niche */
    brickWall(g, w, h, 23, '#4a3c28', '#3a2e1e', '#6a5634', '#120c06', 16, 8); g.globalAlpha = 0.4; rc(g, 0, 0, w, h, '#000'); g.globalAlpha = 1;
    rc(g, 6, h - 22, w - 12, 2, '#a4742a'); rc(g, 6, h - 22, w - 12, 1, '#d8a444');
    for (let x = 12; x < w - 12; x += 14) { rc(g, x, h - 32, 6, 10, '#2a2218'); rc(g, x, h - 32, 6, 1, '#8a7a5a'); rc(g, x + 1, h - 33, 4, 1, '#6a5a3a'); }   /* jars on the shelf */
    return c; }
  if (st === 'uwQueen') {   /* THE QUEEN'S CISTERN: big dressed stone, a blind arcade of tall arches on piers, a frieze, vault ribs, the dark behind the arches */
    rc(g, 0, 0, w, h, '#17130f');
    for (let y = 0; y < h; y += 16) { const off = ((y / 16) & 1) ? 24 : 0; rc(g, 0, y, w, 1, '#0c0a08'); for (let x = -48 + off; x < w; x += 48) { rc(g, x, y, 1, 16, '#0c0a08'); const t = r(); rc(g, x + 1, y + 1, 46, 14, t < 0.25 ? '#2a241d' : t < 0.7 ? '#201b16' : '#1a1612'); rc(g, x + 1, y + 1, 46, 1, '#352d24'); } }
    const bay = 80, n = Math.floor(w / bay);
    for (let i = 0; i < n; i++) { const bx = i * bay + (w - n * bay) / 2, nx0 = bx + 14, nx1 = bx + bay - 14, ncx = (nx0 + nx1) / 2, rad = (nx1 - nx0) / 2, spring = 62;
      rc(g, nx0, spring, nx1 - nx0, h - spring - 14, '#09070a'); archFill(g, ncx, spring, rad, '#09070a'); archRing(g, ncx, spring, rad, '#4a4036', 2); archRing(g, ncx, spring, rad + 2, '#14100d', 1);
      rc(g, ncx - 4, spring - rad - 6, 8, 6, '#4a4036'); rc(g, ncx - 3, spring - rad - 5, 6, 4, '#352d24');
      rc(g, bx + 4, 0, 10, h, '#2e2822'); rc(g, bx + 4, 0, 2, h, '#4a4036'); rc(g, bx + 12, 0, 2, h, '#14100d'); rc(g, bx + 2, spring - 4, 14, 4, '#4a4036'); rc(g, bx + 2, h - 18, 14, 18, '#2e2822'); rc(g, bx + 2, h - 18, 14, 2, '#4a4036'); }
    rc(g, 0, 18, w, 6, '#2a241d'); rc(g, 0, 18, w, 1, '#4a4036'); for (let x = 4; x < w; x += 12) { rc(g, x, 20, 6, 2, '#14100d'); }     /* the frieze: a row of dark metopes */
    rc(g, 0, 0, w, 12, '#0c0a08'); for (let i = 0; i <= n; i++) { const bx = i * bay + (w - n * bay) / 2; for (let k = 0; k < 14; k++) rc(g, bx + 8 - k * 0.5, 12 + k, 1, 1, '#2a241d'); }   /* the vault's springers */
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0.5)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.3)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    return c; }
  return null; });

export function paintRoom(g, st, sx, sy, w, h, tx0, ty0, time) {
  if (st !== 'uwChamber' && st !== 'uwVault' && st !== 'uwQueen') return false;
  const c = roomSprite(st, w, h, tx0, ty0); if (!c) return false; g.drawImage(c, sx, sy); return true;
}
