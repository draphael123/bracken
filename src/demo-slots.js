/* src/demo-slots.js - NO WINDOW THROUGH THE TERRAIN (claude/floatfix2, Daniel 11-03 photo of the live Kingswood, 0:27 in: "We need to fix floating geometry like this").
   The Royal Road's stump (90-91,30-32) sits over a 2-wide dip in the ground (90-91,33-43): the stone above it is solid, the stone either side of the dip is solid, and the dip
   itself is open to the bottom of the map, so the backdrop's SKY shows through it - a window cut through the wall, with the stone block bridging over it. Reads as a floating block.
   The class: a SLOT = a run of air columns (1..4 wide, 3+ rows tall) with solid on both sides on every row, ROOFED by solid directly over its top row, and open to the map's bottom edge
   (so nothing behind it but sky). The fix is art only (no tile, no ent, no hash): the slot is backed with the level's own masonry in shadow (a shaft, not a window), with the dusk
   light coming up from below. tools/demo-floats.mjs gates it (rule WINDOW: every slot found must be backed; HOVER: a solid cell with open void under it to the map edge must be
   inside a backed slot or carry a drawn support). */
export const SLOT_MAX_W = 4, SLOT_MIN_H = 3;
export const DEMO_IDS = new Set(['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings', 'burning', 'arena_yard', 'lesson']);
/* (claude/lance6) the float-slot backing also covers the Barbican (storm): its 4-wide pit under its step (147-150, 36-45) showed the sky. NOT the demo slice: demo-cut pins DEMO_IDS. */
export const SLOT_IDS = new Set([...DEMO_IDS, 'storm']);
/* shaft colours per level (a back wall darker than the stone in front of it); the default is a cool dark stone */
const STYLE = { kings: { base: '#1d151b', course: '#130d12', lit: '#2a1e26', glow: '#e08a58' } };
const DEF = { base: '#16161c', course: '#0e0e12', lit: '#202028', glow: '#a0a8c0' };

/* the slots of a built level: [{ x0, x1, y0, y1 }] in tiles (inclusive) */
export function findSlots(L, T) {
  const W = L.W, H = L.H, g = L.grid, SOL = new Set([T.SOLID, T.CRATE, T.PALISADE, T.SOFT, T.ICE, T.CRYST]);
  const sol = (x, y) => x >= 0 && x < W && y >= 0 && y < H && SOL.has(g[y * W + x]), air = (x, y) => x >= 0 && x < W && y >= 0 && y < H && g[y * W + x] === T.AIR;
  const out = [], seen = new Set();
  for (let x = 1; x < W - 1; x++) for (let y = 1; y < H; y++) {
    if (seen.has(x + ',' + y) || !air(x, y) || !sol(x, y - 1)) continue;   /* the top of a roofed slot: air with solid directly over it */
    let x1 = x; while (x1 + 1 < W && air(x1 + 1, y) && x1 - x < SLOT_MAX_W) x1++;
    if (!sol(x - 1, y) || !sol(x1 + 1, y) || air(x1 + 1, y)) continue;
    let y1 = y; while (y1 + 1 < H) { let all = true; for (let i = x; i <= x1; i++) if (!air(i, y1 + 1)) all = false; if (!all) break; y1++; }
    if (y1 !== H - 1 || y1 - y + 1 < SLOT_MIN_H) continue;   /* open to the map's bottom edge and tall enough to read as a hole */
    let walls = true; for (let r = y; r <= y1; r++) if (!sol(x - 1, r) || !sol(x1 + 1, r)) walls = false;
    if (!walls) continue;
    for (let r = y; r <= y1; r++) for (let i = x; i <= x1; i++) seen.add(i + ',' + r);
    out.push({ x0: x, x1, y0: y, y1 });
  }
  return out;
}

/* a solid cell with only void under it all the way to the map edge (a block hanging over a dip): [{ x, y }] */
export function hovers(L, T) {
  const W = L.W, H = L.H, g = L.grid, SOL = new Set([T.SOLID, T.CRATE, T.PALISADE, T.SOFT, T.ICE, T.CRYST]), out = [];
  for (let x = 0; x < W; x++) for (let y = 0; y < H - 3; y++) {
    if (!SOL.has(g[y * W + x]) || SOL.has(g[(y + 1) * W + x])) continue;
    let yy = y + 1, void_ = true; while (yy < H) { if (g[yy * W + x] !== T.AIR) { void_ = false; break; } yy++; }
    if (void_) out.push({ x, y });
  }
  return out;
}

export function slotAt(L, x, y) { return (L.demoSlots || []).some(s => x >= s.x0 && x <= s.x1 && y >= s.y0 - 1 && y <= s.y1); }

/* drawn behind the tiles (the air cells of the slot are the only thing it paints) */
export function drawSlots(g, L, cx, cy, VW, VH, time, TS = 16) {
  const S = L.demoSlots; if (!S || !S.length) return;
  const st = STYLE[L.id] || STYLE[L.demoStyle] || DEF;
  for (const s of S) {
    const px0 = s.x0 * TS - cx, px1 = (s.x1 + 1) * TS - cx, py0 = s.y0 * TS - cy, py1 = (s.y1 + 1) * TS - cy;
    if (px1 < 0 || px0 > VW || py1 < 0 || py0 > VH) continue;
    const ya = Math.max(0, py0), yb = Math.min(VH, py1);
    g.fillStyle = st.base; g.fillRect(px0, ya, px1 - px0, yb - ya);
    /* brick courses, offset every other row, so it reads as masonry and not as a hole */
    for (let r = s.y0; r <= s.y1; r++) for (let c = 0; c < 2; c++) {
      const y = r * TS - cy + c * 8; if (y < -8 || y > VH) continue;
      g.fillStyle = st.course; g.fillRect(px0, y, px1 - px0, 1);
      const off = ((r * 2 + c) % 2) * 8;
      for (let x = s.x0 * TS + off; x < (s.x1 + 1) * TS; x += 16) { const bx = x - cx; if (bx > px0 && bx < px1) { g.fillStyle = st.course; g.fillRect(bx, y, 1, 8); g.fillStyle = st.lit; g.fillRect(bx + 1, y + 1, 6, 1); } }
    }
    /* the roof's shadow over the top rows, and the dusk coming up the shaft from the open bottom */
    const h = py1 - py0; if (h > 8) {
      let gr = g.createLinearGradient(0, py0, 0, py0 + Math.min(h, 40)); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(px0, ya, px1 - px0, Math.max(0, Math.min(yb, py0 + 40) - ya));
      const lo = Math.max(py0, py1 - 56); gr = g.createLinearGradient(0, lo, 0, py1); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, st.glow + '66'); g.fillStyle = gr; g.fillRect(px0, Math.max(0, lo), px1 - px0, Math.min(VH, py1) - Math.max(0, lo));
    }
  }
}
