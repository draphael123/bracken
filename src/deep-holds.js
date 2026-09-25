// src/deep-holds.js — THE DEEP'S HOLDS, EACH ITS OWN ROOM (docs/briefs/deep-rework-2.md §1). The level review (group B,
// 2026-09-24) found "the same wreck-hold interior (plank wall, two square windows, two lamps) is the backdrop at five depths ...
// at a glance they are the same screen". Every hold under every deck was the orlop ('ship' in main.js drawRoomPaint). Now each
// depth sank a different kind of ship, and her hold says so:
//   cargohold  THE WRECK STACK: merchantmen. Unplaned frames, cargo nets on the wall, crates and sacks lashed in stacks, barrels
//              chocked on their sides, a hoist hook off the beam.
//   galley     THE KELP FOREST: the cooks' deck. A soot-black bulkhead, the brick firebox under its hood and pipe, the rail of pots
//              and ladles, the mess table and its benches, and the weed coming in through every seam.
//   gundeck    THE CORAL GARDEN: warships. The gun-deck red of a man-of-war's inner hull, gunports with their lids hanging, guns
//              still run out on their carriages, shot in its racks, rammer and sponge on their hooks - and one gun THROWN OFF ITS
//              CARRIAGE when she went down, lying on its side on the deck with the carriage upturned beside it.
//   tribute    THE SUNK TRIBUTE SHIP (src/tribute-ship.js): the Queen's own hold. Lacquered black-green timber with a gilt band,
//              the goblin crown painted on the bulkheads, the tribute chests lashed in rows, jars and a heap of the coin itself.
// Painted in ROOM-LOCAL coordinates (drawRoom translates and clips first), seeded by the room's own tile origin, so the camera
// moving can never reseed a crate (tools/deep-rework.mjs asserts it, the way tools/room-patterns.mjs does for main.js's rooms).
// A step darker than the play, and nothing drawn here is ever footing: it is the back wall.
export const HOLD_KINDS = ['cargohold', 'galley', 'gundeck', 'tribute'];
const h01 = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
const IRON = { d: '#15181c', m: '#2c3036', l: '#454b53', hi: '#5e666e' };

export function paintHold(g, st, sx, sy, w, h, tx0, ty0, time) {
  if (!HOLD_KINDS.includes(st)) return false;
  const R = (x, y, ww, hh, col) => { if (x + ww <= 0 || x >= w || y + hh <= 0 || y >= h) return; g.fillStyle = col;   /* nothing wholly outside the room */ g.fillRect(Math.round(sx + x), Math.round(sy + y), Math.round(ww), Math.round(hh)); };
  const F = h, ox = tx0 * 16;   /* the floor line, and the room's own place in the world: every choice below is seeded off it */
  const planks = (a, b, c, gap, band) => { R(0, 0, w, h, a); for (let y = 0; y < h; y += band) { const bh = Math.min(band - 1, h - y); R(0, y, w, bh, ((y / band) & 1) ? b : a); if (y + band <= h) R(0, y + band - 1, w, 1, gap);
      for (let x = -((ox + y * 7) % 53); x < w; x += 53) if (x >= 0) R(x, y, 1, bh, gap); } };
  const frames = (step, col, hi, dk) => { for (let x = -(ox % step) + 8; x < w; x += step) { R(x, 0, 4, h, col); R(x, 0, 1, h, hi); R(x + 4, 0, 1, h, dk); R(x + 4, 0, 8, 2, col); R(x + 4, 2, 5, 2, col); } };
  const crate = (x, y, s, mark) => { R(x, y, s, s - 2, '#4a3624'); R(x, y, s, 1, '#6a5034'); R(x, y + s - 3, s, 1, '#2a1c12'); R(x, y, 1, s - 2, '#6a5034'); R(x + s - 1, y, 1, s - 2, '#2a1c12');
    for (let k = 1; k < 3; k++) R(x + 1, y + k * (s - 2) / 3, s - 2, 1, '#3a2a1c'); if (mark) { R(x + s / 2 - 2, y + 3, 4, 1, '#8a7a5a'); R(x + s / 2 - 1, y + 2, 2, 3, '#8a7a5a'); } };
  const barrelSide = (x, y) => { R(x, y, 14, 10, '#4a3420'); R(x, y, 14, 1, '#6a4a2c'); R(x + 1, y + 9, 12, 1, '#24180e'); R(x + 3, y, 1, 10, IRON.l); R(x + 10, y, 1, 10, IRON.l); R(x + 6, y + 4, 2, 2, '#1a120a'); };
  const sack = (x, y) => { R(x + 1, y, 10, 9, '#5e5440'); R(x, y + 2, 12, 7, '#5e5440'); R(x + 2, y, 8, 1, '#7a6e54'); R(x + 4, y - 2, 4, 2, '#4a4232'); R(x + 1, y + 8, 10, 1, '#3a3426'); };
  const weed = (x, y0, len, k) => { for (let i = 0; i < len; i++) R(x + Math.round(Math.sin(time * 1.3 + k + i * 0.5) * 1.5), y0 + i, 1, 1, i & 1 ? '#2e5a3a' : '#3a6e44'); };
  const tint = a => R(0, 0, w, h, 'rgba(20,50,64,' + a + ')');   /* the sea is in here too */

  if (st === 'cargohold') {
    planks('#241c14', '#2a2016', '#130d08', 0, 7);
    frames(48, '#34261a', '#4a3826', '#140e08');
    for (let x = -(ox % 96) + 20; x < w; x += 96) {   /* a cargo net hung on the wall between two frames */
      if (x < 2 || x + 26 > w) continue; for (let k = 0; k <= 26; k += 4) { for (let y = 4; y < 34; y += 2) { R(x + k + ((y / 2) & 1 ? 1 : 0), y, 1, 1, '#5a4a32'); } } R(x - 1, 3, 29, 1, '#6a5a3a');
    }
    for (let x = -(ox % 72) + 4, i = 0; x < w - 10; x += 72, i++) {   /* the cargo, against the wall, never the same stack twice */
      const r = h01(ox + x, ty0), s = 14 + ((r * 3) | 0) * 2;
      if (r < 0.34) { crate(x, F - s + 2, s, 1); crate(x + s, F - 12, 14, 0); crate(x + 4, F - s - 12, 14, 1); R(x + 2, F - s - 13, s + 12, 1, '#6a5a3a'); }   /* lashed: the rope over the top */
      else if (r < 0.67) { barrelSide(x, F - 10); barrelSide(x + 15, F - 10); barrelSide(x + 7, F - 20); R(x - 1, F - 3, 3, 3, '#3a2a1c'); R(x + 28, F - 3, 3, 3, '#3a2a1c'); }   /* chocked */
      else { sack(x, F - 9); sack(x + 11, F - 9); sack(x + 5, F - 18); crate(x + 24, F - 16, 16, 1); }
    }
    { const hx = -(ox % 140) + 70; if (hx > 8 && hx < w - 8) { R(hx - 10, 0, 20, 3, '#3a2a1c'); R(hx, 3, 1, 18, '#6a5a3a'); R(hx - 3, 21, 7, 2, IRON.l); R(hx - 3, 23, 2, 4, IRON.l); R(hx + 2, 23, 2, 2, IRON.l); } }   /* the hoist hook */
    tint(0.22); return true;
  }
  if (st === 'galley') {
    planks('#1a1512', '#1e1814', '#0a0806', 0, 6);
    frames(56, '#2a2018', '#3a2e22', '#0e0a06');
    for (let x = -(ox % 150) + 12; x < w - 30; x += 150) {
      if (x < 0) continue;
      R(x - 6, 0, 52, F, 'rgba(0,0,0,0.28)');   /* the soot over the hearth */
      for (let y = F - 28; y < F; y += 4) for (let xx = x + (((y >> 2) & 1) ? 0 : 4); xx < x + 38; xx += 8) R(xx, y, 7, 3, h01(xx + ox, y) < 0.3 ? '#4a2a20' : '#5a3226');
      R(x, F - 29, 38, 2, '#2e221c'); R(x + 11, F - 17, 16, 11, IRON.d); R(x + 12, F - 16, 14, 9, '#1a0c08');
      R(x + 13, F - 10, 12, 2, 'rgba(90,160,110,0.35)');   /* cold: the only light in the firebox is the weed that lives in it */
      R(x - 2, F - 36, 42, 6, IRON.m); R(x - 2, F - 36, 42, 1, IRON.hi); R(x + 16, 0, 6, F - 36, IRON.m); R(x + 16, 0, 1, F - 36, IRON.l);
      R(x + 26, F - 42, 12, 7, '#5a3a24'); R(x + 26, F - 42, 12, 1, '#8a5a34'); R(x + 28, F - 44, 8, 2, '#3a2418');   /* the copper on the hob */
      R(x + 48, 6, 60, 2, IRON.m);   /* the rail of pots and ladles */
      for (let k = 0; k < 5; k++) { const hx = x + 52 + k * 12, sw = Math.round(Math.sin(time * 0.9 + k + ox) * 1); R(hx, 8, 1, 3, IRON.l);
        if (k & 1) { R(hx - 3 + sw, 11, 7, 6, '#5a3a24'); R(hx - 3 + sw, 11, 7, 1, '#8a5a34'); } else { R(hx + sw, 11, 1, 8, IRON.l); R(hx - 1 + sw, 19, 3, 2, IRON.l); } }
      R(x + 56, F - 14, 44, 3, '#3e2e20'); R(x + 56, F - 14, 44, 1, '#56402a'); R(x + 58, F - 11, 3, 11, '#2e2218'); R(x + 95, F - 11, 3, 11, '#2e2218');   /* the mess table */
      R(x + 50, F - 6, 12, 2, '#2e2218'); R(x + 94, F - 6, 12, 2, '#2e2218'); R(x + 64, F - 16, 6, 2, '#8a94a0'); R(x + 80, F - 16, 6, 2, '#8a94a0'); R(x + 74, F - 17, 3, 3, '#6a7078');   /* benches, the plates, a tankard */
      R(x + 112, F - 12, 10, 12, '#3a2a1c'); R(x + 112, F - 10, 10, 1, IRON.m); R(x + 112, F - 4, 10, 1, IRON.m);   /* the water cask */
    }
    for (let x = -(ox % 37) + 5, k = 0; x < w; x += 37, k++) weed(x, 0, 6 + ((h01(ox + x, 3) * 10) | 0), k);   /* in through the deckhead seams */
    tint(0.2); return true;
  }
  if (st === 'gundeck') {
    planks('#3a1612', '#421a14', '#1a0806', 0, 8);   /* the gun-deck red: so the blood would not show */
    frames(64, '#4e2018', '#6a2c20', '#1c0806');
    for (let x = -(ox % 128) + 34, i = 0; x < w - 20; x += 128, i++) {
      if (x < 0) continue;
      const py = Math.max(6, F - 40);
      R(x, py, 18, 16, '#0a0e12'); R(x + 1, py + 1, 16, 14, '#1e2e38'); R(x + 1, py + 1 + ((Math.sin(time * 0.7 + x) * 1.5 + 3) | 0), 16, 1, '#2e4452');   /* the port, and the sea past it */
      R(x - 1, py - 1, 20, 1, '#240c08'); R(x - 1, py + 16, 20, 1, '#240c08');
      R(x + 2, py - 9, 14, 8, '#4e2018'); R(x + 2, py - 9, 14, 1, '#6a2c20'); R(x + 8, py - 1, 2, 1, IRON.l);   /* the lid, hanging open over it */
      if (h01(ox + x, 7) < 0.6) { R(x - 10, F - 13, 26, 7, IRON.m); R(x - 10, F - 13, 26, 1, IRON.hi); R(x + 14, F - 14, 5, 9, IRON.m); R(x - 13, F - 11, 4, 3, IRON.l);   /* a gun run out on its carriage */
        R(x - 12, F - 6, 30, 3, '#3a2a1c'); R(x - 10, F - 4, 5, 4, '#2a1c12'); R(x + 10, F - 4, 5, 4, '#2a1c12'); }
      R(x + 30, F - 18, 30, 2, '#2a1c12'); for (let k = 0; k < 6; k++) { R(x + 31 + k * 5, F - 22, 4, 4, IRON.m); R(x + 32 + k * 5, F - 22, 1, 1, IRON.hi); }   /* the shot garland */
      R(x + 66, 4, 1, F - 8, '#5a4630'); R(x + 64, 4, 5, 3, '#6a5a44'); R(x + 70, 6, 1, F - 10, '#5a4630'); R(x + 68, F - 8, 5, 4, '#3a3024');   /* rammer and sponge */
    }
    /* AND ONE GUN THROWN OFF ITS CARRIAGE when she went down: on its side on the deck, muzzle down the slope, the trucks in the air */
    { const cx = Math.round(w * (0.35 + 0.3 * h01(ox, ty0))), fy = F;
      if (cx > 30 && cx < w - 40) { for (let i = 0; i < 34; i++) { const t = i / 34, rr = 5 - Math.round(t * 1.5), yy = fy - 6 - Math.round(t * 3);
          R(cx - 17 + i, yy - rr, 1, rr * 2, i < 3 ? IRON.hi : IRON.m); R(cx - 17 + i, yy - rr, 1, 1, IRON.hi); R(cx - 17 + i, yy + rr - 1, 1, 1, IRON.d); }
        R(cx - 20, fy - 10, 4, 8, IRON.l); R(cx + 16, fy - 11, 2, 6, IRON.d);   /* the cascabel, and the muzzle's dark mouth */
        R(cx + 20, fy - 12, 16, 8, '#3a2a1c'); R(cx + 20, fy - 12, 16, 1, '#56402a'); R(cx + 21, fy - 16, 5, 4, '#2a1c12'); R(cx + 30, fy - 16, 5, 4, '#2a1c12');   /* the carriage, upturned */
        R(cx + 20, fy - 4, 16, 4, '#241810'); for (let k = 0; k < 3; k++) R(cx - 26 + k * 5, fy - 3, 3, 3, IRON.m); } }
    tint(0.24); return true;
  }
  /* tribute */
  planks('#141c16', '#18221a', '#070b08', 0, 7);
  frames(60, '#1e2a20', '#2e3e30', '#080c08');
  R(0, 10, w, 2, '#6a5a2a'); R(0, 10, w, 1, '#a88a3a');   /* the gilt band */
  for (let x = -(ox % 120) + 30; x < w - 20; x += 120) {
    if (x < 0) continue;
    R(x, 16, 18, 22, '#243a24'); R(x, 16, 18, 1, '#3a5a34'); R(x + 3, 38, 3, 4, '#243a24'); R(x + 12, 38, 3, 4, '#243a24');   /* her banner */
    R(x + 4, 22, 10, 3, '#a88a3a'); R(x + 4, 20, 2, 2, '#a88a3a'); R(x + 8, 19, 2, 3, '#a88a3a'); R(x + 12, 20, 2, 2, '#a88a3a');   /* the goblin crown on it */
  }
  for (let x = -(ox % 44) + 4; x < w - 22; x += 44) {   /* the tribute, in rows, lashed */
    const r = h01(ox + x, ty0 + 1);
    R(x, F - 13, 20, 13, '#3a2616'); R(x, F - 13, 20, 3, '#4e3420'); R(x, F - 9, 20, 1, '#a88a3a'); R(x + 9, F - 12, 2, 4, '#d0b050');
    if (r > 0.5) { R(x + 1, F - 25, 18, 12, '#2e1e12'); R(x + 1, F - 25, 18, 2, '#46301c'); R(x + 1, F - 21, 18, 1, '#8a7030'); }
    else { R(x + 24, F - 16, 7, 16, '#4a3a2a'); R(x + 25, F - 18, 5, 2, '#5a4a34'); R(x + 24, F - 10, 7, 1, '#8a7030'); }   /* a jar */
    R(x - 2, F - 26 + (r > 0.5 ? 0 : 12), 24, 1, '#5a4a32');   /* the lashing */
  }
  for (let k = 0; k < 7; k++) { const x = Math.round(h01(ox, k) * (w - 4)); R(x, F - 2, 3, 2, '#b89a3a'); if ((time * 2 + k) % 5 < 0.4) R(x + 1, F - 3, 1, 1, '#ffe6a0'); }   /* the coin, where it spilled */
  tint(0.2); return true;
}
