// minecart_backdrop.js - THE DEEP RAILS' own BACKDROP (claude/minecartart). The greybox wore the crag set: a dusk sky showed above the mine's roof. This is the deep mine:
//   wall      the rock behind the line, world-anchored (0.7): dark strata, fissures, ORE VEINS (verdigris copper and gold flecks that GLITTER)
//   timber    pit-prop frames (posts, cap beam, braces) every 128 px on the same plane, and a lantern STRING sagging from frame to frame, each lamp with its own glow
//   trestles  the far rail trestles over the chasms, dark on the wall at 0.4
//   works     in the goblins' stretch (the Goblin Line) and the crusher works: scaffolds, a winch wheel and bucket, a hoist chain, rag banners, a bone tally
//   LANDMARKS THE SMELTER's chimney glow, a lit stack that rises on the far wall from the cave-in on, and THE BORE's tunnel mouth, from the exam on (the drill's tunnel,
//             a round black mouth with the spoil heap and its headlight when the drill is near)
//   ceiling   the roof closes over the top of the picture; deeper = darker
// Every static picture is baked ONCE (memo); a frame is a handful of drawImage calls.   drawBackdrop(g, cx, cy, VW, VH, L, time)
import { mulberry } from '../px.js';
const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
/* the mine's palette (ONE place; the tiles and the lights read it too) */
export const MP = {
  r0: '#09080d', r1: '#12101a', r2: '#1a1723', r3: '#241f30', r4: '#322a42', r5: '#463b58', r6: '#5e5173',
  t0: '#1a0f08', t1: '#2e1b0e', t2: '#4a2e18', t3: '#6a4524', t4: '#8c6234', t5: '#b08448',
  cu0: '#0e3a2c', cu1: '#1f6a50', cu2: '#3aa87c', cu3: '#8ae8bc',
  go0: '#6a4a10', go1: '#b08418', go2: '#e8b830', go3: '#fff0a0',
  l0: '#7a3a10', l1: '#c8641c', l2: '#ffa83c', l3: '#ffe49a',
  i0: '#14141a', i1: '#24242c', i2: '#3a3a46', i3: '#585866', i4: '#80808e', i5: '#b0b0be',
  gb: '#3c5a2a', gb2: '#5a8a3a', rag: '#7a1a14', rag2: '#b02a1c' };

/* the zone of the line: 0 the loading yard, 1 the switchbacks, 2 the goblin line, 3 the cave-in, 4 the crusher works, 5 the exam, 6 the smelter and the bore */
export const zoneOf = tx => tx < 171 ? 0 : tx < 314 ? 1 : tx < 472 ? 2 : tx < 610 ? 3 : tx < 765 ? 4 : tx < 900 ? 5 : 6;

/* ---------------- THE WALL: one 192 x 192 seamless tile of dark rock ---------------- */
const wallTile = () => once('wall', () => { const S = 192, [c, g] = mk(S, S), r = mulberry(7741);
  rc(g, 0, 0, S, S, MP.r1);
  /* raw rock face: rows of broken blocks of every width and tone, a lit top edge and a dark joint, faults running through */
  for (let y = 0; y < S;) { const h = 7 + ((r() * 9) | 0); let x = -((r() * 20) | 0);
    while (x < S) { const w = 10 + ((r() * 26) | 0), t = r(), col = t < 0.18 ? MP.r3 : t < 0.5 ? MP.r2 : t < 0.8 ? MP.r1 : MP.r0;
      for (let xx = 0; xx < w; xx++) { const px_ = ((x + xx) % S + S) % S; for (let yy = 0; yy < h && y + yy < S; yy++) rc(g, px_, y + yy, 1, 1, col); const ly = y + (xx % 7 === 3 ? 1 : 0); rc(g, px_, ly, 1, 1, MP.r3); }
      rc(g, ((x + w) % S + S) % S, y, 1, h, MP.r0);
      if (r() < 0.4) { for (let k = 0; k < Math.min(w - 2, 12); k++) rc(g, ((x + 2 + k) % S + S) % S, Math.min(S - 1, y + h - 1 - (k >> 2)), 1, 1, MP.r0); }
      x += w; }
    rc(g, 0, Math.min(S - 1, y + h - 1), S, 1, MP.r0); y += h; }
  /* faults */
  for (let i = 0; i < 4; i++) { let x = (r() * S) | 0; for (let y = 0; y < S; y++) { if (r() < 0.25) x += r() < 0.5 ? -1 : 1; rc(g, ((x % S) + S) % S, y, 1, 1, MP.r0); rc(g, (((x + 1) % S) + S) % S, y, 1, 1, MP.r4); } }
  /* pick marks: little pale dints where the rock was worked */
  for (let i = 0; i < 40; i++) { const x = (r() * S) | 0, y = (r() * S) | 0; rc(g, x, y, 2, 1, MP.r5); rc(g, (x + 1) % S, (y + 1) % S, 1, 1, MP.r0); }
  /* ORE VEINS: two diagonals that wrap the tile - verdigris copper, with gold flecks along them */
  const vein = (x0, y0, dx, dy, len, thick, seed) => { const rr = mulberry(seed); let x = x0, y = y0; for (let k = 0; k < len; k++) { x += dx + (rr() < 0.3 ? (rr() < 0.5 ? -1 : 1) : 0); y += dy;
      for (let t = 0; t < thick; t++) { const px_ = ((x + t) % S + S) % S, py = ((y) % S + S) % S; rc(g, px_, py, 1, 1, t === 0 ? MP.cu0 : t === thick - 1 ? MP.cu1 : MP.cu1); if (rr() < 0.18) rc(g, px_, py, 1, 1, MP.cu2); }
      if (rr() < 0.10) { const fx = ((x + 1) % S + S) % S, fy = (y % S + S) % S; rc(g, fx, fy, 2, 2, MP.go1); rc(g, fx, fy, 1, 1, MP.go2); } } };
  vein(10, 6, 1, 1, 150, 3, 11); vein(150, 10, -1, 1, 120, 2, 12); vein(80, 120, 1, 1, 100, 2, 13);
  /* cavities: little dark pockets with a glint in them */
  for (let i = 0; i < 9; i++) { const x = 8 + ((r() * (S - 24)) | 0), y = 8 + ((r() * (S - 24)) | 0); rc(g, x, y, 7, 4, MP.r0); rc(g, x + 1, y - 1, 5, 1, MP.r0); rc(g, x + 1, y + 4, 5, 1, MP.r1); rc(g, x + 1, y + 1, 2, 1, MP.cu1); rc(g, x + 4, y + 2, 1, 1, MP.go2); }
  return c; });

/* the glittering spots on the wall (world positions inside the wall tile, twinkled in the draw): [x, y, kind] */
const GLINTS = once('glints', () => { const r = mulberry(4417), a = []; for (let i = 0; i < 26; i++) a.push([(r() * 192) | 0, (r() * 192) | 0, r() < 0.5 ? 0 : 1, r() * 6.28]); return a; });

/* ---------------- THE TIMBER FRAME: 128 wide x 192 tall, transparent: two posts, a cap beam, a sill, braces, a plank lagging between ---------------- */
const frameTile = () => once('frame', () => { const W = 128, H = 192, [c, g] = mk(W, H);
  const post = (x, w) => { rc(g, x, 0, w, H, MP.t2); rc(g, x, 0, 1, H, MP.t4); rc(g, x + w - 1, 0, 1, H, MP.t0); for (let y = 6; y < H; y += 17) { rc(g, x + 1, y, w - 2, 1, MP.t1); rc(g, x + 2, y + 2, 1, 4, MP.t3); } };
  post(0, 9); post(119, 9);
  /* the cap beam, the sill, and two diagonal braces */
  rc(g, 0, 38, W, 9, MP.t3); rc(g, 0, 38, W, 1, MP.t5); rc(g, 0, 46, W, 1, MP.t0); for (let x = 10; x < W; x += 21) rc(g, x, 40, 1, 5, MP.t1);
  rc(g, 0, 160, W, 7, MP.t2); rc(g, 0, 160, W, 1, MP.t4); rc(g, 0, 166, W, 1, MP.t0);
  const brace = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); rc(g, x, y, 4, 4, MP.t2); rc(g, x, y, 4, 1, MP.t3); rc(g, x + 3, y, 1, 4, MP.t0); } };
  brace(9, 47, 30, 68); brace(119, 47, 98, 68); brace(9, 159, 30, 138); brace(119, 159, 98, 138);
  /* iron straps and a wedge at the joints */
  for (const [x, y] of [[0, 38], [119, 38], [0, 160], [119, 160]]) { rc(g, x, y + 1, 9, 2, MP.i2); rc(g, x, y + 1, 9, 1, MP.i4); rc(g, x + 3, y + 4, 3, 1, MP.i1); }
  return c; });

/* ---------------- THE LANTERN: a tiny cage lamp, 7 x 10, and its glow ---------------- */
const lampSprite = lit => once('lamp' + lit, () => { const [c, g] = mk(7, 10);
  rc(g, 3, 0, 1, 2, MP.i3); rc(g, 1, 2, 5, 1, MP.i2); rc(g, 1, 3, 5, 5, lit ? MP.l1 : MP.t1); rc(g, 2, 4, 3, 3, lit ? MP.l3 : MP.t0); rc(g, 3, 5, 1, 1, lit ? '#ffffff' : MP.t0);
  rc(g, 1, 3, 1, 5, MP.i2); rc(g, 5, 3, 1, 5, MP.i2); rc(g, 1, 8, 5, 1, MP.i2); rc(g, 2, 9, 3, 1, MP.i1); return c; });
const glow = (rad, rgb) => once('glow' + rad + rgb, () => { const d = rad * 2, [c, g] = mk(d, d); for (let r = rad; r > 0; r--) { g.globalAlpha = 0.05 * Math.pow(1 - r / rad, 1.6) + 0.004; g.fillStyle = 'rgb(' + rgb + ')'; g.beginPath(); g.arc(rad, rad, r, 0, 6.2832); g.fill(); } g.globalAlpha = 1; return c; });

/* ---------------- THE GOBLIN WORKS: a scaffold with a winch wheel and bucket, rag banners, a bone tally (192 x 150, transparent) ---------------- */
const worksSprite = v => once('works' + v, () => { const W = 150, H = 110, [c, g] = mk(W, H), r = mulberry(300 + v);
  const beam = (x, y, w, h) => { rc(g, x, y, w, h, MP.t2); rc(g, x, y, w, 1, MP.t4); rc(g, x, y + h - 1, w, 1, MP.t0); if (h > w) rc(g, x + w - 1, y, 1, h, MP.t0); };
  beam(8, 24, 6, 86); beam(70, 24, 6, 86); beam(136, 40, 6, 70);
  beam(4, 22, 76, 6); beam(8, 66, 130, 6);
  for (let i = 0; i < 4; i++) { const x0 = 14 + i * 14; for (let k = 0; k < 28; k++) { rc(g, x0 + (k >> 1), 28 + k * 1.4, 5, 3, MP.t1); } }   /* a ladder-brace lattice */
  for (let y = 28; y < 66; y += 6) rc(g, 14, y, 56, 1, MP.t1);
  /* the winch: a big wheel with spokes on the top frame, rope down to a bucket */
  const wx = 40, wy = 12, R = 11; g.strokeStyle = MP.t3; g.lineWidth = 2; g.beginPath(); g.arc(wx + 0.5, wy + 0.5, R, 0, 6.2832); g.stroke();
  g.strokeStyle = MP.t2; g.lineWidth = 1; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + v; g.beginPath(); g.moveTo(wx + 0.5, wy + 0.5); g.lineTo(wx + 0.5 + Math.cos(a) * R, wy + 0.5 + Math.sin(a) * R); g.stroke(); }
  rc(g, wx - 1, wy - 1, 3, 3, MP.i3); rc(g, wx, wy, 1, 1, MP.i5);
  rc(g, wx + R - 1, wy, 1, 56, MP.i3);   /* the rope / chain */
  rc(g, wx + R - 6, wy + 56, 12, 8, MP.i2); rc(g, wx + R - 6, wy + 56, 12, 1, MP.i4); rc(g, wx + R - 5, wy + 60, 10, 3, MP.cu1); rc(g, wx + R - 3, wy + 59, 2, 1, MP.go2); rc(g, wx + R + 1, wy + 59, 2, 1, MP.cu3);
  /* rag banners: a goblin's colours (green hide, a red slash) on two poles */
  const flag = (x, y) => { rc(g, x, y, 1, 22, MP.t1); rc(g, x + 1, y + 1, 14, 9, MP.gb); rc(g, x + 1, y + 1, 14, 1, MP.gb2); rc(g, x + 5, y + 3, 3, 4, '#0a0a0a'); rc(g, x + 9, y + 3, 3, 4, '#0a0a0a'); rc(g, x + 6, y + 4, 1, 2, MP.rag2); rc(g, x + 10, y + 4, 1, 2, MP.rag2); rc(g, x + 5, y + 8, 7, 1, '#0a0a0a');   /* a skull-faced banner */
    rc(g, x + 13, y + 10, 2, 3, MP.gb); rc(g, x + 8, y + 10, 2, 2, MP.gb); };
  flag(100, 22); flag(120, 30);
  /* the bone tally: a row of pale marks on the sill */
  for (let i = 0; i < 12; i++) { rc(g, 84 + i * 4, 60, 1, 5, '#cfc3a4'); if (i % 5 === 4) rc(g, 82 + (i - 4) * 4, 62, 19, 1, '#cfc3a4'); }
  /* crates and a barrel at the foot */
  rc(g, 82, 92, 16, 16, MP.t2); rc(g, 82, 92, 16, 1, MP.t4); rc(g, 82, 100, 16, 1, MP.t0); rc(g, 89, 92, 1, 16, MP.t0); rc(g, 104, 98, 14, 10, MP.t1); rc(g, 104, 98, 14, 1, MP.t3); rc(g, 104, 103, 14, 1, MP.i2);
  return c; });

/* ---------------- THE FAR TRESTLE: a dark rail trestle over a chasm, 160 x 70, transparent ---------------- */
const trestleSprite = () => once('trestle', () => { const W = 160, H = 70, [c, g] = mk(W, H); const col = '#0a0708', col2 = '#171011';
  rc(g, 0, 8, W, 3, col2); rc(g, 0, 7, W, 1, '#2a1d17'); for (let x = 0; x < W; x += 6) rc(g, x, 11, 2, 3, col);   /* the line and its sleepers */
  for (let x = 6; x < W; x += 32) { rc(g, x, 14, 5, H - 14, col); rc(g, x, 14, 1, H - 14, col2);   /* the legs */
    for (let y = 18; y < H - 12; y += 16) { const n = 26; for (let i = 0; i < n; i++) { rc(g, x + 5 + i, y + Math.round(i * 12 / n), 1, 2, col); rc(g, x + 5 + i, y + 12 - Math.round(i * 12 / n), 1, 2, col); } } }   /* the X braces */
  return c; });

/* ---------------- THE SMELTER'S CHIMNEY: a lit stack with its glow (80 x 150), and THE BORE'S MOUTH (110 x 100) ---------------- */
const chimneySprite = () => once('chimney', () => { const W = 80, H = 150, [c, g] = mk(W, H);
  const bx = 28, bw = 24;   /* a tapering brick stack */
  for (let y = 20; y < H; y++) { const t = (y - 20) / (H - 20), x0 = Math.round(bx - t * 6), x1 = Math.round(bx + bw + t * 6); rc(g, x0, y, x1 - x0, 1, MP.r3); rc(g, x0, y, 2, 1, MP.r5); rc(g, x1 - 2, y, 2, 1, MP.r0);
    if (y % 6 === 0) rc(g, x0, y, x1 - x0, 1, MP.r1); }
  for (let y = 20; y < H; y += 6) for (let x = bx - 6; x < bx + bw + 6; x += 8) rc(g, x + (y % 12 ? 4 : 0), y + 1, 1, 5, MP.r1);
  rc(g, bx - 4, 12, bw + 8, 10, MP.r4); rc(g, bx - 4, 12, bw + 8, 1, MP.r6); rc(g, bx - 4, 21, bw + 8, 1, MP.r0);   /* the lip */
  rc(g, bx - 2, 8, bw + 4, 5, MP.l1); rc(g, bx, 6, bw, 4, MP.l2); rc(g, bx + 4, 5, bw - 8, 3, MP.l3);   /* the molten mouth */
  for (let y = 60; y < H; y += 28) { rc(g, bx - 8, y, bw + 16, 2, MP.i2); rc(g, bx - 8, y, bw + 16, 1, MP.i4); }   /* iron hoops */
  return c; });
const boreMouth = () => once('bore', () => { const W = 110, H = 100, [c, g] = mk(W, H), cxm = 55, rad = 46;
  for (let dy = 0; dy < H; dy++) for (let dx = 0; dx < W; dx++) { const d = Math.hypot(dx - cxm, dy - 56); if (d < rad + 6 && d > rad) { g.fillStyle = (dx + dy) % 5 ? MP.r5 : MP.r6; g.fillRect(dx, dy, 1, 1); } else if (d <= rad) { g.fillStyle = d > rad - 9 ? '#0e0a09' : '#050303'; g.fillRect(dx, dy, 1, 1); } }
  /* the cutter's tooth marks round the lip, and gouge rings inside */
  for (let k = 0; k < 28; k++) { const a = k / 28 * 6.2832, x = cxm + Math.cos(a) * (rad + 3), y = 56 + Math.sin(a) * (rad + 3); g.fillStyle = MP.r0; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 2); }
  g.strokeStyle = '#1a1210'; for (const rr of [30, 20]) { g.beginPath(); g.arc(cxm + 0.5, 56.5, rr, 0, 6.2832); g.stroke(); }
  /* the rail runs in, and the spoil heaped at its foot */
  rc(g, 0, 90, W, 2, MP.i1); rc(g, 0, 89, W, 1, MP.i3); for (let x = 2; x < W; x += 7) rc(g, x, 92, 3, 3, MP.t1);
  const r = mulberry(88); for (let i = 0; i < 44; i++) { const x = 4 + ((r() * 100) | 0), h = 1 + ((r() * 5) | 0); rc(g, x, 90 - h, 3, h, r() < 0.4 ? MP.r5 : MP.r4); }
  return c; });

/* ---------------- THE FRAME ---------------- */
const dim = (cy) => Math.min(0.5, 0.04 + Math.max(0, cy) / 840 * 0.4);
const zoneTint = [[255, 150, 60, 0.05], [255, 190, 90, 0.04], [90, 140, 60, 0.06], [200, 70, 40, 0.09], [255, 120, 50, 0.07], [120, 40, 30, 0.08], [255, 90, 30, 0.11]];

export function drawBackdrop(g, cx, cy, VW, VH, L, time) {
  const tx = Math.floor((cx + VW / 2) / TS), z = zoneOf(tx), Z = zoneTint[z];
  rc(g, 0, 0, VW, VH, '#0b0809');
  /* 1. the wall */
  { const k = 0.7, pat = once('wallpat', () => g.createPattern(wallTile(), 'repeat')); pat.setTransform(new DOMMatrix().translate(-Math.round(cx * k), -Math.round(cy * k))); g.fillStyle = pat; g.fillRect(0, 0, VW, VH);
    /* the ore's glitter: copper and gold sparkle on and off */
    for (const [gx, gy, kind, ph] of GLINTS) { const on = Math.sin(time * (1.4 + kind * 0.7) + ph); if (on < 0.45) continue;
      const bx = (((gx - cx * k) % 192) + 192) % 192, by = (((gy - cy * k) % 192) + 192) % 192;
      for (let ox = 0; ox < 2; ox++) for (let oy = 0; oy < 2; oy++) { const wxs = Math.round(bx + ox * 192), wys = Math.round(by + oy * 192); if (wxs > VW + 2 || wys > VH + 2) continue;
        g.fillStyle = kind ? MP.go3 : MP.cu3; g.fillRect(wxs, wys, 1, 1); if (on > 0.85) { g.fillStyle = kind ? MP.go2 : MP.cu2; g.fillRect(wxs - 1, wys, 3, 1); g.fillRect(wxs, wys - 1, 1, 3); } } } }
  /* 2. the far trestles, over the chasms: dark, slow (0.4), one every ~210 px at a world-anchored height */
  { const k = 0.4, per = 210, i0 = Math.floor((cx * k - 160) / per) - 1, i1 = Math.floor((cx * k + VW) / per) + 1, spr = trestleSprite();
    g.globalAlpha = 0.85; for (let i = i0; i <= i1; i++) { const h = hash(i, 17); if (h % 3 === 0) continue; const x = Math.round(i * per + (h % 40) - cx * k), y = Math.round(70 + (h % 5) * 18 - cy * 0.25); g.drawImage(spr, x, y); } g.globalAlpha = 1; }
  /* 5. THE LANDMARKS: they stand a long way off, so they hardly move: the smelter's chimney (from the cave-in on) and the bore's mouth (from the exam on) */
  { const smW = 922 * TS, boW = 950 * TS, f = 0.03;
    const sA = Math.max(0, Math.min(1, (tx - 440) / 40));
    if (sA > 0) { const sx = Math.round(VW / 2 + (smW - cx - VW / 2) * f) - 40, sy = Math.round(VH - 168 + (cy - 420) * -0.04);
      const fl = 0.75 + 0.25 * Math.sin(time * 3.1) * Math.sin(time * 1.7 + 1);
      g.globalAlpha = sA; g.drawImage(chimneySprite(), sx, sy);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = sA * 1.0 * fl; g.drawImage(glow(110, '255,120,40'), sx + 40 - 110, sy + 8 - 110); g.drawImage(glow(70, '255,150,60'), sx + 40 - 70, sy + 8 - 70); g.globalAlpha = sA * 0.7 * fl; g.drawImage(glow(40, '255,210,120'), sx + 40 - 40, sy + 8 - 40);
      /* sparks rising off the stack */
      for (let s = 0; s < 8; s++) { const ph = time * (0.5 + (s % 3) * 0.2) + s * 1.3, t = ph % 1, ox = Math.sin(ph * 3 + s) * (6 + t * 14); g.globalAlpha = sA * (1 - t) * 0.9; g.fillStyle = s % 2 ? MP.l2 : MP.l3; g.fillRect(Math.round(sx + 40 + ox), Math.round(sy + 4 - t * 54), 1, 1 + (s & 1)); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    const bA = Math.max(0, Math.min(1, (tx - 740) / 40));
    if (bA > 0) { const bx = Math.round(VW / 2 + (boW - cx - VW / 2) * f) - 55 + 70, by = Math.round(VH - 100 - 28 + (cy - 420) * -0.05); g.globalAlpha = bA * 0.95; g.drawImage(boreMouth(), bx, by); g.globalAlpha = 1; } }
  /* 3. the timber frames and the lantern strings on the wall's plane */
  { const k = 0.7, per = 128, spr = frameTile(), i0 = Math.floor(cx * k / per) - 1, i1 = Math.floor((cx * k + VW) / per) + 1;
    const fy = -Math.round(cy * k) % 192;
    for (let i = i0; i <= i1; i++) { if (hash(i, 9) % 4 === 0 && z !== 4) continue; const x = Math.round(i * per - cx * k); for (let yy = fy - 192; yy < VH; yy += 192) g.drawImage(spr, x, yy); }
    /* lantern strings between frames: a sag of lamps hung from the cap beams (y of the cap in the tile = 38) */
    g.globalCompositeOperation = 'lighter';
    for (let i = i0; i <= i1; i++) { const x0 = Math.round(i * per - cx * k) + 9, x1 = x0 + per - 9;
      for (let yy = fy - 192; yy < VH; yy += 192) { const y0 = yy + 47; if (y0 < -20 || y0 > VH + 20) continue; if (hash(i, 2) % 3 === 0) continue;
        const n = 6; for (let j = 1; j < n; j++) { const t = j / n, lx = x0 + (x1 - x0) * t, sag = Math.sin(t * Math.PI) * 9 + Math.sin(time * 1.1 + i + j) * 0.6, ly = y0 + sag; const lit = (hash(i * 7 + j, 4) % 11) > 0;
          g.globalAlpha = lit ? 0.95 + 0.1 * Math.sin(time * 6 + i * 3 + j) : 0; if (lit) g.drawImage(glow(32, '255,160,64'), Math.round(lx) - 32, Math.round(ly) - 26); } } }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    for (let i = i0; i <= i1; i++) { const x0 = Math.round(i * per - cx * k) + 9, x1 = x0 + per - 9;
      for (let yy = fy - 192; yy < VH; yy += 192) { const y0 = yy + 47; if (y0 < -20 || y0 > VH + 20) continue; if (hash(i, 2) % 3 === 0) continue;
        g.fillStyle = MP.i1; const n = 6; let px0 = x0, py0 = y0; for (let j = 1; j <= n; j++) { const t = j / n, lx = x0 + (x1 - x0) * t, ly = y0 + Math.sin(t * Math.PI) * 9 + (j < n ? Math.sin(time * 1.1 + i + j) * 0.6 : 0); const steps = Math.max(1, Math.round(Math.abs(lx - px0))); for (let s = 0; s < steps; s++) g.fillRect(Math.round(px0 + (lx - px0) * s / steps), Math.round(py0 + (ly - py0) * s / steps), 1, 1); px0 = lx; py0 = ly; if (j < n) { const lit = (hash(i * 7 + j, 4) % 11) > 0; g.drawImage(lampSprite(lit), Math.round(lx) - 3, Math.round(ly)); } } } } }
  /* 4. THE GOBLIN WORKS: scaffolds, in the goblins' stretch and again in the crusher works, on the wall's plane */
  if (z === 2 || z === 4 || z === 5) { const k = 0.7, per = 330, i0 = Math.floor(cx * k / per) - 1, i1 = Math.floor((cx * k + VW) / per) + 1;
    for (let i = i0; i <= i1; i++) { const h = hash(i, 71), x = Math.round(i * per + 60 + (h % 80) - cx * k), y = Math.round(40 + (h % 3) * 26 - cy * k + Math.floor(cy * k / 192) * 192 * 0); if (x < -160 || x > VW) continue;
      g.drawImage(worksSprite(h % 2), x, ((y % 200) + 200) % 200 - 30); } }
  /* 6. depth, and the zone's own cast of light */
  { const a0 = dim(cy), a1 = dim(cy + VH); const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, 'rgba(6,4,3,' + a0.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(6,4,3,' + a1.toFixed(3) + ')'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
  g.fillStyle = 'rgba(' + Z[0] + ',' + Z[1] + ',' + Z[2] + ',' + Z[3] + ')'; g.fillRect(0, 0, VW, VH);
  /* 7. THE ROOF closes over the top: a dark gradient and a jagged fringe of rock and cap-timbers that moves with the wall */
  { const gr = g.createLinearGradient(0, 0, 0, 70); gr.addColorStop(0, 'rgba(4,3,3,0.78)'); gr.addColorStop(1, 'rgba(4,3,3,0)'); g.fillStyle = gr; g.fillRect(0, 0, VW, 70);
    const r = once('fringe', () => { const a = [], rr = mulberry(55); for (let i = 0; i < 64; i++) a.push(3 + ((rr() * 11) | 0)); return a; }), off = Math.round(cx * 0.9);
    g.fillStyle = '#060404'; for (let x = 0; x < VW; x += 5) { const i = (((x + off) / 5) | 0) & 63; g.fillRect(x, 0, 5, r[i]); }
    g.fillStyle = MP.r2; for (let x = 0; x < VW; x += 5) { const i = (((x + off) / 5) | 0) & 63; g.fillRect(x, r[i], 5, 1); } }
}
