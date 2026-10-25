// kitchen_art.js - THE KITCHEN GATE's ART (claude/kitchengateart): the back walls of its five halls, the dressing, the ambient life, every machine of its rule redrawn, and THE BUTCHER's own sheet.
//   paintRoom   the hall behind the player, baked once per room (cellar vaults, soot-black hearth wall, glazed kitchen wall, the feast hall's banners, the high table's drapes) + the live fire in its hearths
//   dress       static sprites in the decor list: hams, sausage strings, copper pans and ladles on rails, onion braids, banners, lanterns, sacks, stools, buckets, jars and plates on the dresser shelves
//   drawAmbient the glow and the embers rising off the coal pits, the grease-kitchen flies, the cellar's cold motes
//   machines    drawFire / drawBellows / drawCopper / drawWheel / drawTrail / drawDoor / drawPot / drawPage / drawVault / drawSlick: what src/kitchen-hands.js drawWorld calls
//   butcher     bakeButcher(): the heavy cleaver brute's own frames (idle, walk x2, raise, slam, wind, sweep); main.js frame map; butcherBurn() the flames over him
// All pixel primitives from px.js; light from the upper left; one dark outline round every mass.
import { canvas, rect, mulberry, ellipse, line, fillPoly, flipX, whiten } from '../px.js';
import { ZONE, zoneOf, hash } from './kitchen_tiles.js';
const TS = 16, R = Math.round;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const OUT = '#1a1410';
const IRON = ['#14141a', '#22222a', '#3a3a42', '#5a5a66', '#7a7a86', '#b0b0bc'];
const COP = ['#3a1c0c', '#6a3418', '#b8673a', '#e09a5c', '#ffd0a0'], VERD = ['#1c3a30', '#2e6a58', '#4fa890'];
const WOOD = ['#1c1008', '#3a2412', '#5a3a1e', '#7e5428', '#a87a3a'];
const px = (g, x, y, c) => rect(g, x, y, 1, 1, c);
/* ------------------------------------------------------------------ FLAME: layered tongues, a red edge, orange body, yellow core, white heart ------------------------------------------------------------------ */
export function flame(g, x, y, w, h, time, seed, glow = true) {
  const n = Math.max(1, Math.round(w / 5));
  for (let i = 0; i < n; i++) {
    const cx = x + (i + 0.5) * w / n, k = 0.62 + 0.38 * Math.sin(time * 13 + i * 1.9 + seed), k2 = 0.55 + 0.45 * Math.sin(time * 17 + i * 2.7 + seed * 1.3), fh = h * k, sway = Math.sin(time * 9 + i + seed) * 2, hw = w / n * 0.62;
    fillPoly(g, [[cx - hw, y], [cx - hw * 0.6, y - fh * 0.5], [cx + sway, y - fh], [cx + hw * 0.5, y - fh * 0.45], [cx + hw, y]].map(q => [R(q[0]), R(q[1])]), '#c0401a');
    fillPoly(g, [[cx - hw * 0.72, y], [cx - hw * 0.4, y - fh * 0.45], [cx + sway * 0.8, y - fh * 0.82], [cx + hw * 0.35, y - fh * 0.4], [cx + hw * 0.72, y]].map(q => [R(q[0]), R(q[1])]), '#ff8a2c');
    fillPoly(g, [[cx - hw * 0.4, y], [cx + sway * 0.5, y - fh * 0.55 * k2 - 2], [cx + hw * 0.4, y]].map(q => [R(q[0]), R(q[1])]), '#ffd36b');
    fillPoly(g, [[cx - hw * 0.2, y], [cx + sway * 0.3, y - fh * 0.28 * k2 - 1], [cx + hw * 0.2, y]].map(q => [R(q[0]), R(q[1])]), '#fff6c8');
  }
  if (glow) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(R(x + w / 2), R(y - h * 0.3), 2, R(x + w / 2), R(y - h * 0.3), Math.max(24, w * 1.4)); gr.addColorStop(0, 'rgba(255,140,50,0.34)'); gr.addColorStop(1, 'rgba(255,100,30,0)'); g.fillStyle = gr; g.fillRect(R(x - w), R(y - h * 1.6 - 20), R(w * 3), R(h * 2.2 + 30)); g.restore(); }
}
/* ------------------------------------------------------------------ THE MACHINES ------------------------------------------------------------------ */
/* the grease floors: a glossy amber skin with a slick of bright reflections that crawl */
export function drawSlick(g, sx, y, w, time, seed) {
  rect(g, sx, y - 1, w, 3, 'rgba(120,84,20,0.85)'); rect(g, sx, y - 2, w, 1, 'rgba(236,190,70,0.9)'); rect(g, sx, y + 1, w, 1, 'rgba(60,36,8,0.7)');
  for (let x = 4; x < w - 6; x += 11) { const ph = (time * 0.6 + hash(x + seed, 5) % 10 / 10) % 1; rect(g, sx + x + R(ph * 5), y - 2, 4 + (hash(x, seed) % 3), 1, 'rgba(255,248,200,0.95)'); }
  for (let x = 7 + (seed % 7); x < w - 8; x += 29) { rect(g, sx + x, y - 3, 7, 1, 'rgba(236,190,70,0.8)'); rect(g, sx + x + 1, y - 4, 4, 1, 'rgba(255,230,140,0.55)'); }   /* beaded blobs */
}
/* a FIRE at floor row fy with its bellows: three kinds by what it serves (a stove range, a copper's hearth, a great spit's pit) */
export function drawFire(g, d, sx, fy, on, time, ember) {
  const kind = d.wheels.length ? 'pit' : d.pots.length ? 'hearth' : 'range', seed = d.bx;
  if (kind === 'range') {
    /* a cast-iron kitchen range: a black box, a hot plate, a firebox door, a chimney pipe running up */
    rect(g, sx - 15, fy - 22, 30, 22, OUT); rect(g, sx - 14, fy - 21, 28, 21, IRON[2]); rect(g, sx - 14, fy - 21, 28, 2, IRON[4]); rect(g, sx - 14, fy - 21, 2, 21, IRON[3]); rect(g, sx + 12, fy - 21, 2, 21, IRON[1]);
    rect(g, sx - 12, fy - 26, 24, 5, OUT); rect(g, sx - 11, fy - 25, 22, 3, IRON[4]); rect(g, sx - 11, fy - 25, 22, 1, IRON[5]);   /* the hot plate */
    for (const x of [-8, 0, 8]) { ellipse(g, sx + x, fy - 25, 4, 1, IRON[1]); }
    rect(g, sx - 10, fy - 14, 20, 11, OUT); rect(g, sx - 9, fy - 13, 18, 9, on ? '#8a2a10' : '#2a1410');   /* the firebox mouth */
    if (on) flame(g, sx - 9, fy - 4, 18, 14, time, seed); else { rect(g, sx - 8, fy - 6, 16, 2, '#7a2c10'); for (let i = 0; i < 4; i++) if (Math.floor(time * 2 + i + seed) % 3 === 0) px(g, sx - 7 + i * 4, fy - 7, '#ffb04a'); }
    rect(g, sx - 3, fy - 3, 6, 2, IRON[1]);
    rect(g, sx + 7, fy - 52, 5, 26, OUT); rect(g, sx + 8, fy - 51, 3, 24, IRON[3]); rect(g, sx + 8, fy - 51, 1, 24, IRON[4]); rect(g, sx + 6, fy - 40, 7, 3, OUT); rect(g, sx + 6, fy - 39, 7, 1, IRON[4]);   /* the flue */
    if (on) for (let i = 0; i < 4; i++) { const t = (time * 0.8 + i / 4) % 1; g.globalAlpha = 0.5 * (1 - t); ellipse(g, R(sx + 10 + Math.sin(time * 2 + i) * 3), R(fy - 54 - t * 26), 3 + (t * 3 | 0), 2, '#9a948c'); g.globalAlpha = 1; }
    return;
  }
  if (kind === 'hearth') {
    /* a copper's hearth: a low brick fire-ring that the copper sits in */
    rect(g, sx - 17, fy - 12, 34, 12, OUT); rect(g, sx - 16, fy - 11, 32, 11, '#6e4a3a');
    for (let y = fy - 11; y < fy; y += 4) { rect(g, sx - 16, y, 32, 1, '#3a241a'); for (let x = sx - 16 + (((y - fy) / 4 | 0) & 1) * 5; x < sx + 16; x += 10) rect(g, x, y, 1, 4, '#3a241a'); }
    rect(g, sx - 16, fy - 11, 32, 2, '#9a7a62'); rect(g, sx - 13, fy - 8, 26, 6, OUT);
    if (on) flame(g, sx - 12, fy - 2, 24, 14, time, seed); else { rect(g, sx - 11, fy - 4, 22, 2, '#7a2c10'); if (Math.floor(time * 2 + seed) % 3 === 0) px(g, sx - 3 + (seed % 5), fy - 5, '#ffb04a'); }
    return;
  }
  /* the great spit's pit: an iron-lipped trench of coals. The coals are the floor's own tiles; this is the fire that stands on them */
  rect(g, sx - 26, fy - 3, 52, 3, OUT); rect(g, sx - 25, fy - 2, 50, 2, IRON[3]);
  if (on) flame(g, sx - 26, fy - 3, 52, 30, time, seed); else { for (let i = 0; i < 8; i++) if (Math.floor(time * 2.3 + i * 1.7 + seed) % 4 === 0) px(g, sx - 22 + i * 6, fy - 5, '#ffb04a'); }
}
/* the BELLOWS: a leather bag between two boards, a nozzle at the fire, a handle - heaves when struck; the HEAT GAUGE over it drains with the roar (the rule's state, drawn where you stand) */
export function drawBellows(g, bx, by, pump, canStoke, roarK, time) {
  const p = pump > 0 ? Math.sin(pump * 20) * 2 : 0;
  rect(g, bx - 10, by - 4, 20, 4, OUT); rect(g, bx - 9, by - 3, 18, 3, WOOD[2]); rect(g, bx - 9, by - 3, 18, 1, WOOD[4]);
  /* the lower board and the upper board, the leather between, pleated */
  rect(g, bx - 9, by - 6, 16, 2, OUT); rect(g, bx - 8, by - 5, 14, 1, WOOD[3]);
  fillPoly(g, [[bx - 9, by - 6], [bx + 6, by - 6], [bx + 5, by - 14 + R(p)], [bx - 8, by - 14 + R(p)]], OUT);
  fillPoly(g, [[bx - 8, by - 6], [bx + 5, by - 6], [bx + 4, by - 13 + R(p)], [bx - 7, by - 13 + R(p)]], '#7a4a2a');
  for (let k = 0; k < 3; k++) rect(g, bx - 8 + k, by - 7 - k * 2.2 - R(p / 3), 12, 1, '#4a2814');
  rect(g, bx - 7, by - 12 + R(p), 3, 5, '#a06a3e');   /* the lit side */
  rect(g, bx - 9, by - 16 + R(p), 15, 3, OUT); rect(g, bx - 8, by - 15 + R(p), 13, 2, WOOD[3]); rect(g, bx - 8, by - 15 + R(p), 13, 1, WOOD[4]);
  rect(g, bx + 5, by - 10, 8, 3, OUT); rect(g, bx + 5, by - 9, 8, 1, IRON[4]); rect(g, bx + 12, by - 11, 2, 5, IRON[2]);   /* the nozzle */
  rect(g, bx - 14, by - 21 + R(p), 7, 2, OUT); rect(g, bx - 13, by - 20 + R(p), 5, 1, WOOD[4]); rect(g, bx - 11, by - 19 + R(p), 2, 5, WOOD[2]);   /* the handle */
  if (canStoke) { g.strokeStyle = Math.floor(time * 3) % 2 ? '#ffd36b' : 'rgba(255,211,107,0.5)'; g.strokeRect(bx - 14.5, by - 22.5, 28, 23); }
  /* the gauge: a brass-rimmed bar over it */
  rect(g, bx - 11, by - 31, 22, 6, OUT); rect(g, bx - 10, by - 30, 20, 4, '#1b1626'); rect(g, bx - 10, by - 30, R(20 * roarK), 4, roarK > 0.25 ? '#ff9a3c' : '#c0401a'); rect(g, bx - 10, by - 30, R(20 * roarK), 1, roarK > 0.25 ? '#ffd36b' : '#ff6a3c');
  rect(g, bx - 11, by - 31, 22, 1, '#c9a040'); rect(g, bx - 11, by - 26, 22, 1, '#7a5a1c');
}
/* a COPPER: a round-bellied cauldron with a rolled rim, rivet lines, two ring handles, verdigris at the seams; steam climbs from it while the fire roars */
export function drawCopper(g, x, y, top, on, time, seed) {
  ellipse(g, x, y - 12, 14, 11, OUT); ellipse(g, x, y - 12, 13, 10, COP[2]); ellipse(g, x - 4, y - 15, 6, 5, COP[3]); ellipse(g, x - 6, y - 17, 2, 1, COP[4]);
  rect(g, x - 13, y - 9, 26, 3, COP[1]); for (let k = -11; k <= 11; k += 4) px(g, x + k, y - 8, COP[4]);   /* the rivet band */
  rect(g, x - 11, y - 3, 22, 3, COP[1]); rect(g, x - 12, y - 4, 24, 1, VERD[1]);   /* the foot, a green seam */
  rect(g, x - 15, y - 21, 30, 4, OUT); rect(g, x - 14, y - 20, 28, 2, COP[3]); rect(g, x - 14, y - 20, 28, 1, COP[4]);   /* the rolled rim */
  for (const s of [-1, 1]) { ellipse(g, x + s * 16, y - 12, 3, 4, OUT); ellipse(g, x + s * 16, y - 12, 2, 3, COP[1]); }
  if (on) {
    rect(g, x - 9, y - 22, 18, 2, '#e8e8f0');
    for (let i = 0; i < 11; i++) { const k = (time * 0.9 + i / 11) % 1, hgt = y - 22 - top, py = y - 22 - k * hgt, w = 5 + k * 9, a = (1 - k) * 0.6;
      g.globalAlpha = a; ellipse(g, R(x + Math.sin(time * 3 + i * 1.3 + seed) * 3), R(py), R(w / 2), 3, '#eceef4'); g.globalAlpha = a * 0.5; ellipse(g, R(x + Math.sin(time * 3 + i * 1.3 + seed) * 3 - 2), R(py - 1), R(w / 3), 2, '#ffffff'); g.globalAlpha = 1; }
  } else { rect(g, x - 9, y - 22, 18, 2, '#3a2010'); if (Math.floor(time * 1.2 + seed) % 4 === 0) { g.globalAlpha = 0.35; ellipse(g, x, R(y - 28 - ((time * 8) % 8)), 5, 2, '#c8c8d0'); g.globalAlpha = 1; } }
}
/* a roast on a spit: pig-brown, glazed, charred at the ends, tied with twine */
const roast = (g, x, y, glaze) => { ellipse(g, x, y + 5, 11, 6, OUT); ellipse(g, x, y + 5, 10, 5, '#8a4a26'); ellipse(g, x - 2, y + 3, 6, 2, '#c87a3e'); if (glaze) ellipse(g, x - 3, y + 2, 3, 1, '#ffd890'); rect(g, x + 6, y + 4, 3, 2, '#3a2010'); rect(g, x - 9, y + 5, 3, 2, '#3a2010'); rect(g, x - 2, y + 1, 1, 8, '#d8c890'); rect(g, x + 3, y + 1, 1, 8, '#d8c890'); };
/* THE GREAT SPIT: the hub (a toothed iron wheel with a crank), the spokes, two iron spits with roasts, the post down into the pit */
export function drawWheel(g, d, hx, hy, spits, ang, fyScreen, WHEEL, on, time) {
  rect(g, hx - 3, hy, 6, fyScreen - hy + 26, OUT); rect(g, hx - 2, hy, 4, fyScreen - hy + 26, IRON[2]); rect(g, hx - 2, hy, 1, fyScreen - hy + 26, IRON[4]);
  g.lineCap = 'butt'; for (const q of spits) { g.strokeStyle = OUT; g.lineWidth = 4; g.beginPath(); g.moveTo(hx, hy); g.lineTo(q.x, q.y + 3); g.stroke(); g.strokeStyle = IRON[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy); g.lineTo(q.x, q.y + 3); g.stroke(); }
  g.lineWidth = 1;
  ellipse(g, hx, hy, 8, 8, OUT); ellipse(g, hx, hy, 7, 7, IRON[3]); ellipse(g, hx - 1, hy - 1, 4, 4, IRON[4]); ellipse(g, hx, hy, 2, 2, IRON[0]);
  for (let k = 0; k < 8; k++) { const a = ang * 3 + k * Math.PI / 4; px(g, R(hx + Math.cos(a) * 8), R(hy + Math.sin(a) * 8), IRON[5]); }   /* the gear teeth turn */
  for (const q of spits) {
    const w = WHEEL.w;
    rect(g, q.x - w / 2 - 3, q.y - 1, w + 6, 6, OUT); rect(g, q.x - w / 2, q.y, w, 3, IRON[4]); rect(g, q.x - w / 2, q.y, w, 1, IRON[5]);
    rect(g, q.x - w / 2 - 4, q.y - 3, 4, 9, OUT); rect(g, q.x - w / 2 - 3, q.y - 2, 2, 7, IRON[3]); rect(g, q.x + w / 2, q.y - 3, 4, 9, OUT); rect(g, q.x + w / 2 + 1, q.y - 2, 2, 7, IRON[3]);   /* the fork-rests at the ends */
    roast(g, q.x, q.y + 1, on);
    rect(g, q.x + w / 2 + 3, q.y - 6, 2, 5, OUT); rect(g, q.x + w / 2 + 3, q.y - 7, 6, 2, OUT); rect(g, q.x + w / 2 + 4, q.y - 6, 4, 1, WOOD[3]);   /* the crank */
  }
}
/* A GREASE TRAIL: raw (a glossy rope of fat with a bead at every join), burning (the flame and its front, the char behind), burnt (char, a scorch of soot) */
export function drawTrail(g, x0s, x1s, y, state, frontS, time, seed) {
  const w = x1s - x0s;
  if (state === 'raw') { rect(g, x0s, y - 2, w, 4, 'rgba(110,72,16,0.9)'); rect(g, x0s, y - 3, w, 1, 'rgba(236,190,70,0.95)'); rect(g, x0s, y + 1, w, 1, 'rgba(50,30,6,0.8)');
    for (let x = 3; x < w - 3; x += 9) { ellipse(g, x0s + x, y - 2, 3, 2, 'rgba(236,190,70,0.9)'); px(g, x0s + x - 1, y - 3, '#fff6c0'); }
    const ph = (time * 0.5) % 1; rect(g, x0s + R(ph * (w - 12)), y - 4, 10, 1, 'rgba(255,248,200,0.8)'); return; }
  if (state === 'burning') { rect(g, x0s, y - 1, w, 3, '#1c1410'); rect(g, x0s, y + 1, w, 1, '#3a2a20'); for (let x = 2; x < frontS - x0s; x += 7) if ((hash(x, seed) & 3) === 0) px(g, x0s + x, y - 1, '#7a2c10');
    rect(g, frontS, y - 2, x1s - frontS, 4, 'rgba(110,72,16,0.9)'); rect(g, frontS, y - 3, x1s - frontS, 1, 'rgba(236,190,70,0.95)');
    flame(g, x0s, y, Math.max(8, frontS - x0s), 14, time, seed, false); flame(g, Math.max(x0s, frontS - 22), y, 22, 20, time * 1.1, seed + 3);   /* the front is the tallest */
    return; }
  rect(g, x0s, y - 1, w, 2, '#1c1410'); for (let x = 3; x < w; x += 8) if ((hash(x, seed + 4) & 1) === 0) px(g, x0s + x, y - 2, '#2e2420');
}
/* A TALLOW DOOR: a wall of hard white fat, laid in brick-sized blocks, wick-cords through it; melting from the top with long drips and a puddle that spreads */
export function drawDoor(g, x, y0, w, h, k, time) {
  const top = y0 + h * k, hh = y0 + h - top;
  rect(g, x - 1, top - 1, w + 2, hh + 1, OUT); rect(g, x, top, w, hh, '#efe6c8');
  for (let yy = top; yy < y0 + h; yy += 8) { rect(g, x, yy, w, 1, '#b8a878'); for (let xx = x + ((((yy - y0) / 8 | 0) & 1) ? 8 : 0); xx < x + w; xx += 16) rect(g, xx, yy, 1, 8, '#b8a878'); }
  rect(g, x, top, 3, hh, '#fff8e0'); rect(g, x + w - 3, top, 3, hh, '#c8b890');   /* lit left, shaded right */
  for (let xx = x + 4; xx < x + w - 2; xx += 5) { const dl = 4 + (hash(xx, 3) % 8) + (k > 0 ? 6 : 0); rect(g, xx, top, 3, dl, '#efe6c8'); rect(g, xx, top + dl, 3, 1, '#c8b890'); }   /* drips hanging off the top */
  rect(g, x + (w >> 1) - 1, top + 4, 2, hh - 8, 'rgba(120,90,40,0.5)');   /* a wick-cord sunk in it */
  if (k > 0) { g.globalAlpha = 0.85; ellipse(g, R(x + w / 2), y0 + h, R(w / 2 + k * 14), 2, '#efe6c8'); g.globalAlpha = 1; for (let i = 0; i < 3; i++) rect(g, x + 4 + i * 9, R(top + ((time * 40 + i * 13) % 22)), 2, 3, '#fff8e0'); }
}
/* THE GREAT POT: an iron cauldron on a trestle; it tips and pours */
export function drawPot(g, px0, py, tip, time) {
  rect(g, px0 - 17, py - 6, 5, 6, OUT); rect(g, px0 + 12, py - 6, 5, 6, OUT); rect(g, px0 - 16, py - 5, 3, 5, WOOD[2]); rect(g, px0 + 13, py - 5, 3, 5, WOOD[2]);   /* the trestle's feet */
  g.save(); g.translate(px0, py - 8); g.rotate(tip ? 1.15 : 0);
  ellipse(g, 0, -12, 16, 13, OUT); ellipse(g, 0, -12, 15, 12, IRON[2]); ellipse(g, -5, -16, 7, 6, IRON[4]); ellipse(g, -7, -18, 2, 1, IRON[5]);
  rect(g, -17, -23, 34, 5, OUT); rect(g, -16, -22, 32, 3, IRON[4]); rect(g, -16, -22, 32, 1, IRON[5]); rect(g, -14, -21, 28, 2, tip ? '#7a5010' : '#c8a030');   /* the rim, the fat inside */
  for (const y of [-8, -14]) rect(g, -14, y, 28, 1, IRON[1]);
  g.restore();
  if (tip) { rect(g, px0 + 12, py - 3, 36, 3, 'rgba(236,190,70,0.9)'); for (let i = 0; i < 4; i++) rect(g, px0 + 14 + i * 9 + R(Math.sin(time * 6 + i) * 2), py - 5, 6, 2, 'rgba(255,230,140,0.9)'); }
}
/* A RECIPE PAGE: a curl of parchment, ink lines, a red wax seal, a glint */
export function drawPage(g, x, y, i, time) {
  rect(g, x - 6, y - 8, 12, 15, OUT); rect(g, x - 5, y - 7, 10, 13, '#e8dcb0'); rect(g, x - 5, y - 7, 10, 2, '#fff6d0'); rect(g, x + 3, y - 7, 2, 13, '#c8b888');
  for (let k = 0; k < 4; k++) rect(g, x - 4, y - 4 + k * 2, 5 - (k & 1), 1, '#6a4a2c');
  ellipse(g, x + 2, y + 3, 2, 2, '#a02020'); px(g, x + 1, y + 2, '#e04a3a');
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25 + 0.15 * Math.sin(time * 4 + i); ellipse(g, x, y - 1, 11, 11, '#ffd36b'); g.restore(); g.globalAlpha = 1;
  if (Math.floor(time * 3 + i) % 3 === 0) { px(g, x + 6, y - 9, '#ffffff'); px(g, x + 5, y - 9, '#fff0a0'); px(g, x + 7, y - 9, '#fff0a0'); px(g, x + 6, y - 10, '#fff0a0'); px(g, x + 6, y - 8, '#fff0a0'); }
}
/* THE SPICE VAULT's grate: iron bars set in a stone frame, a heavy lock with a recipe-page-shaped slot, spice sacks glimpsed behind */
export function drawVault(g, x, y, w, got) {
  rect(g, x, y + 3, w, 29, '#1a1008'); for (let i = 0; i < 3; i++) { ellipse(g, x + 6 + i * 11, y + 27, 5, 4, '#a8742a'); ellipse(g, x + 5 + i * 11, y + 25, 2, 1, '#d8a050'); }   /* spice sacks behind */
  rect(g, x - 2, y - 1, w + 4, 4, OUT); rect(g, x - 1, y, w + 2, 2, IRON[4]); rect(g, x - 1, y, w + 2, 1, IRON[5]);
  for (let i = 2; i < w; i += 6) { rect(g, x + i - 1, y + 2, 4, 30, OUT); rect(g, x + i, y + 2, 2, 30, IRON[3]); rect(g, x + i, y + 2, 1, 30, IRON[5]); }
  rect(g, x, y + 14, w, 3, OUT); rect(g, x, y + 15, w, 1, IRON[4]);
  const lx = x + (w >> 1) - 5; rect(g, lx - 1, y + 12, 12, 11, OUT); rect(g, lx, y + 13, 10, 9, '#c9a040'); rect(g, lx, y + 13, 10, 2, '#fff0b0'); rect(g, lx + 4, y + 16, 2, 4, OUT);
  for (let k = 0; k < 3; k++) px(g, lx + 2 + k * 3, y + 20, k < got ? '#40e060' : '#a02020');   /* three lamps: pages in */
}
/* ------------------------------------------------------------------ THE BUTCHER: his own sheet ------------------------------------------------------------------ */
const BW = 62, BH = 60, BAX = 26, BAY = 59;
function cleaver(g, hx, hy, a, big) {
  g.save(); g.translate(hx, hy); g.rotate(a);
  rect(g, -2, -1, 8, 4, OUT); rect(g, -1, 0, 6, 2, WOOD[3]); rect(g, -1, 0, 6, 1, WOOD[4]); px(g, 3, 1, '#c8c8d0');   /* the handle, riveted */
  rect(g, 5, -6, 15, 14, OUT); rect(g, 6, -5, 13, 12, '#c8ccd4'); rect(g, 6, -5, 13, 2, '#f0f2f8'); rect(g, 6, 3, 13, 4, '#8a8e9a'); rect(g, 17, -5, 2, 12, '#e8eaf0'); px(g, 9, -2, IRON[2]);   /* the broad blade, bevelled */
  if (big) { px(g, 10, 5, '#a02020'); px(g, 12, 6, '#a02020'); px(g, 16, 6, '#7a1818'); }
  g.restore();
}
function butcherFrame(pose) {
  const [c, g] = canvas(BW, BH), x0 = BAX, y0 = BAY, walk = pose === 'walk0' ? 1 : pose === 'walk1' ? -1 : 0;
  const lean = pose === 'raise' ? -2 : pose === 'slam' ? 5 : pose === 'wind' ? -3 : pose === 'sweep' ? 4 : 0, dip = pose === 'slam' ? 3 : pose === 'sweep' ? 1 : 0;
  const SK = ['#1a2410', '#3a4a26', '#5a7036', '#7a9048', '#9ab05e'];
  /* boots and legs */
  for (const [dx, off] of [[-6, walk], [3, -walk]]) { rect(g, x0 + dx - 1, y0 - 12 + dip, 8, 12 - dip + (off > 0 ? -1 : 0), OUT); rect(g, x0 + dx, y0 - 11 + dip, 6, 9, '#4a3a2c'); rect(g, x0 + dx - 1 + (off > 0 ? 1 : 0), y0 - 4, 8, 4, OUT); rect(g, x0 + dx + (off > 0 ? 1 : 0), y0 - 3, 6, 3, '#2a1c14'); rect(g, x0 + dx, y0 - 11 + dip, 1, 8, '#6a5444'); }
  /* the torso: a vest of soot-grey, the great belly */
  const tx = x0 + lean, ty = y0 - 24 + dip;
  ellipse(g, tx, ty, 13, 12, OUT); ellipse(g, tx, ty, 12, 11, '#bcb4a2'); ellipse(g, tx - 4, ty - 4, 6, 5, '#d8d0be');
  /* the apron: cream, bound at the waist, a rusty bib and blood thrown on it */
  fillPoly(g, [[tx - 9, ty - 8], [tx + 9, ty - 8], [tx + 11, y0 - 5 + dip], [tx - 11, y0 - 5 + dip]], OUT);
  fillPoly(g, [[tx - 8, ty - 7], [tx + 8, ty - 7], [tx + 10, y0 - 6 + dip], [tx - 10, y0 - 6 + dip]], '#eee6d4');
  rect(g, tx - 8, ty - 7, 4, y0 - 6 + dip - (ty - 7), '#fff8e8'); rect(g, tx + 6, ty - 7, 3, y0 - 6 + dip - (ty - 7), '#c8bea8'); rect(g, tx - 10, ty + 3, 20, 2, '#a89a7c');   /* the tie */
  for (const [dx, dy, w, h, col] of [[-5, -4, 5, 4, '#9a1c1c'], [2, 0, 4, 6, '#7a1414'], [-3, 4, 7, 3, '#a02020'], [5, -5, 2, 2, '#c02828'], [-8, 6, 3, 2, '#7a1414'], [1, 9, 2, 3, '#a02020']]) rect(g, tx + dx, ty + dy, w, h, col);
  rect(g, tx - 1, ty + 8, 1, 2, '#c02828');
  /* the hook and the sausage chain on his belt */
  rect(g, tx - 12, ty + 2, 3, 8, OUT); rect(g, tx - 11, ty + 3, 1, 6, IRON[4]); rect(g, tx - 13, ty + 9, 4, 2, IRON[4]);
  /* the head: low and wide, a jaw like a shovel, one tusk up, small eyes under a brow; the toque */
  const hx = x0 + lean + (pose === 'slam' ? 5 : pose === 'sweep' ? 3 : 0), hy = y0 - 38 + dip;
  ellipse(g, hx - 7, hy + 1, 3, 3, OUT); ellipse(g, hx - 7, hy + 1, 2, 2, SK[1]);   /* the far ear */
  ellipse(g, hx, hy, 9, 8, OUT); ellipse(g, hx, hy, 8, 7, SK[2]); ellipse(g, hx - 2, hy - 3, 4, 3, SK[3]); rect(g, hx - 7, hy + 3, 15, 4, SK[1]);
  rect(g, hx + 1, hy - 2, 8, 2, SK[0]); rect(g, hx + 3, hy - 1, 3, 3, '#ffe9a0'); rect(g, hx + 4, hy, 2, 2, '#1a1010'); rect(g, hx - 4, hy - 1, 3, 3, '#ffe9a0'); rect(g, hx - 3, hy, 2, 2, '#1a1010');   /* the eyes */
  if (pose === 'raise' || pose === 'slam') { rect(g, hx - 3, hy + 3, 12, 5, OUT); rect(g, hx - 2, hy + 4, 10, 3, '#3a0e0e'); rect(g, hx - 1, hy + 4, 2, 2, '#efe6cf'); rect(g, hx + 5, hy + 4, 2, 2, '#efe6cf'); } else { rect(g, hx - 2, hy + 4, 10, 1, SK[0]); }
  rect(g, hx + 5, hy + 1, 2, 4, '#efe6cf'); px(g, hx + 5, hy + 5, '#b8ac90');   /* the tusk */
  rect(g, hx + 6, hy - 1, 5, 4, SK[2]); rect(g, hx + 6, hy - 1, 5, 1, SK[3]);   /* the nose */
  /* the toque: a tall crooked cook's hat with a bloody smear */
  rect(g, hx - 7, hy - 14 + 1, 15, 8, OUT); rect(g, hx - 6, hy - 13 + 1, 13, 7, '#f0ece0'); rect(g, hx - 6, hy - 13 + 1, 3, 7, '#ffffff'); rect(g, hx + 4, hy - 13 + 1, 3, 7, '#c8c2b0');
  ellipse(g, hx + 1, hy - 14, 8, 4, OUT); ellipse(g, hx + 1, hy - 14, 7, 3, '#f0ece0'); ellipse(g, hx - 1, hy - 15, 3, 1, '#ffffff'); rect(g, hx - 7, hy - 8, 15, 2, '#c8c2b0'); rect(g, hx + 1, hy - 12, 3, 2, '#a02020');
  /* the arms: bare, thick, hairy-knuckled; the cleaver hand and the empty hand */
  const arm = (sx, sy, ex, ey, col) => { line(g, sx, sy, ex, ey, OUT, 7); line(g, sx, sy, ex, ey, col, 5); line(g, sx - 1, sy - 1, ex - 1, ey - 1, SK[3], 1); ellipse(g, ex, ey, 4, 4, OUT); ellipse(g, ex, ey, 3, 3, col); };
  const handPos = { idle: [tx + 12, ty + 6], walk0: [tx + 12, ty + 7], walk1: [tx + 12, ty + 5], raise: [tx + 6, ty - 22], slam: [tx + 17, ty + 8], wind: [tx - 11, ty - 4], sweep: [tx + 17, ty + 2] }[pose];
  arm(tx - 8, ty - 6, tx - 11 - (pose === 'raise' ? -4 : 0), ty + 5 - (pose === 'raise' ? 14 : 0), SK[1]);   /* the far arm */
  arm(tx + 7, ty - 6, handPos[0], handPos[1], SK[2]);
  const ca = { idle: 0.9, walk0: 0.9, walk1: 0.9, raise: -1.45, slam: 1.35, wind: -2.9, sweep: 0.1 }[pose];
  cleaver(g, handPos[0], handPos[1], ca, pose !== 'idle');
  return c;
}
export function bakeButcher() {
  return once('butcher', () => {
    const names = ['idle', 'walk0', 'walk1', 'raise', 'slam', 'wind', 'sweep'];
    const Rr = names.map(butcherFrame), white = Rr.map(c => whiten(c));
    return { R: Rr, L: Rr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: BAX, ay: BAY, w: BW, h: BH };
  });
}
export const butcherFrameOf = (e, t) => { const m = e.mode; return m === 'raise' ? 3 : m === 'slam' ? 4 : m === 'wind' ? 5 : m === 'sweep' ? 6 : (Math.abs(e.vx || 0) > 4 ? 1 + (Math.floor(e.anim * 6) % 2) : 0); };
export function butcherBurn(g, x, y, time) { flame(g, x - 12, y - 2, 24, 26, time, 3); }
/* ------------------------------------------------------------------ THE HALLS BEHIND ------------------------------------------------------------------ */
const WALL = [  /* zone -> [wall base, deeper shade, line colour] */
  ['#161e28', '#0d131a', '#0a0e14'], ['#1a1210', '#0e0807', '#080504'], ['#4a3a24', '#2e2214', '#1a1208'], ['#3a2420', '#241412', '#150a08'], ['#2a1a34', '#180e20', '#0e0714']];
function wallFill(g, zone, w, h, wx0, wy0) {
  const Wl = WALL[zone], Z = ZONE[zone];
  rect(g, 0, 0, w, h, Wl[1]);
  if (zone === 2) {   /* glazed tile wainscot, whitewash plaster above with grease-stain */
    const tileTop = h - 70; rect(g, 0, 0, w, tileTop, '#6e6048');   /* limewashed plaster over ashlar, stained, chipped back to the stone here and there */
    for (let y = 0; y < tileTop; y += 10) { const off = ((y / 10 | 0) * 9) % 22; for (let x = -off; x < w; x += 22) if ((hash(x + wx0, y + wy0) % 3) === 0) { rect(g, x, y, 21, 9, '#5a4c38'); rect(g, x, y, 21, 1, '#46392a'); } }
    for (let x = 0; x < w; x += 5) for (let y = 0; y < tileTop; y += 3) { const q = hash(x + wx0, y + wy0) % 29; if (q === 0) px(g, x, y, '#8a7c62'); else if (q === 1) px(g, x, y, '#4a3e2c'); }
    for (let x = 6; x < w; x += 37) if ((hash(x + wx0, 77) % 3) === 0) { const l = 10 + hash(x, 5) % 30; rect(g, x, 0, 2, l, '#4a3a1c'); rect(g, x, l, 2, 2, '#6a5424'); }   /* a grease streak down the plaster */
    for (let y = tileTop; y < h; y += 9) for (let x = 0; x < w; x += 9) { const ch = ((x / 9 | 0) + ((y - tileTop) / 9 | 0)) & 1; rect(g, x, y, 9, 9, ch ? '#cdb888' : '#e0d0a4'); rect(g, x, y, 9, 1, '#a08e60'); rect(g, x, y, 1, 9, '#a08e60'); px(g, x + 1, y + 1, '#fff8dc'); }
    rect(g, 0, tileTop - 3, w, 4, '#4fa890'); rect(g, 0, tileTop - 3, w, 1, '#8ad8c0'); rect(g, 0, tileTop + 1, w, 1, '#1c3a30');   /* the copper-green rail */
    return; }
  rect(g, 0, 0, w, h, Wl[0]);
  const bw = zone === 0 ? 14 : zone === 4 ? 24 : 18;
  for (let y = 0; y < h; y += 9) { rect(g, 0, y, w, 1, Wl[2]); const off = ((y / 9 | 0) * 7) % bw; for (let x = -off; x < w; x += bw) { rect(g, x, y, 1, 9, Wl[2]); if ((hash(x + wx0, y + wy0) % 5) === 0) rect(g, x + 1, y + 1, bw - 1, 8, Wl[1]); } }
  /* a vignette toward the ceiling */
  for (let i = 0; i < 6; i++) { g.globalAlpha = 0.12; rect(g, 0, 0, w, 14 + i * 8, '#000'); } g.globalAlpha = 1;
}
const arch = (g, x, y, w, h, fillc, edge) => {   /* a round-headed niche: x,y its top-left, w,h overall */
  const r = w >> 1; rect(g, x - 2, y + r, w + 4, h - r, OUT); ellipse(g, x + r, y + r, r + 2, r + 2, OUT); rect(g, x - 1, y + r, w + 2, h - r, edge); ellipse(g, x + r, y + r, r + 1, r + 1, edge);
  rect(g, x, y + r, w, h - r, fillc); ellipse(g, x + r, y + r, r, r, fillc); };
function bakeRoom(zone, w, h, wx0, wy0, tag) {
  const [c, g] = canvas(w, h), Z = ZONE[zone], fires = [], R0 = mulberry(hash(wx0, wy0) + zone);
  wallFill(g, zone, w, h, wx0, wy0);
  const floor = h;
  if (zone === 0) {   /* THE UNDERCELLARS: vaulted niches with barrels, wine racks, a barred grating that lets cold light fall, lanterns */
    for (let x = 18; x < w - 40; x += 64 + (hash(x + wx0, 2) % 24)) {
      const nw = 40, nh = Math.min(h - 8, 66), ny = floor - nh; arch(g, x, ny, nw, nh, '#0a0f16', Z.s[3]);
      const kind = hash(x + wx0, 9) % 3;
      if (kind === 0) { for (let ry = ny + 24; ry < floor - 4; ry += 9) for (let rx = x + 3; rx < x + nw - 6; rx += 8) { ellipse(g, rx + 3, ry + 4, 3, 4, OUT); ellipse(g, rx + 3, ry + 4, 2, 3, '#2c5a3a'); px(g, rx + 2, ry + 3, '#7ab88a'); } rect(g, x + 1, ny + 22, nw - 2, 2, '#3a2a1a'); }   /* wine bottles in a rack */
      else if (kind === 1) { for (let b = 0; b < 2; b++) { const bx = x + 4 + b * 18; ellipse(g, bx + 8, floor - 14, 9, 13, OUT); ellipse(g, bx + 8, floor - 14, 8, 12, WOOD[2]); rect(g, bx, floor - 20, 17, 2, IRON[3]); rect(g, bx, floor - 10, 17, 2, IRON[3]); rect(g, bx + 3, floor - 22, 2, 16, WOOD[4]); } }   /* two casks */
      else { for (let s = 0; s < 3; s++) { ellipse(g, x + 8 + s * 11, floor - 8, 6, 8, OUT); ellipse(g, x + 8 + s * 11, floor - 8, 5, 7, '#9a8a6a'); rect(g, x + 5 + s * 11, floor - 14, 6, 2, '#6a5a3a'); } }   /* sacks of meal */
    }
    for (let x = 30; x < w - 20; x += 120 + (hash(x + wx0, 7) % 40)) { const gy = 10; rect(g, x - 1, gy - 1, 22, 10, OUT); rect(g, x, gy, 20, 8, '#05080c'); for (let b = 2; b < 20; b += 4) rect(g, x + b, gy, 1, 8, IRON[2]); fires.push({ kind: 'shaft', x: x + 10, y: gy + 8, w: 24, h: floor - gy - 8 }); }   /* a barred window high up: a cold shaft */
    for (let x = 70; x < w - 20; x += 150) { rect(g, x, 0, 1, 24, IRON[2]); rect(g, x - 4, 24, 9, 9, OUT); rect(g, x - 3, 25, 7, 7, '#c8a040'); rect(g, x - 3, 25, 7, 1, '#ffe08a'); fires.push({ kind: 'lamp', x, y: 28, r: 40 }); }   /* hung lanterns */
  } else if (zone === 1) {   /* THE SPIT HALL: great hearth arches with live fire, black beams, hooks and tools */
    for (let x = 14; x < w - 90; x += 118 + (hash(x + wx0, 4) % 30)) {
      const hw = 76, hh = Math.min(h - 6, 82), hy = floor - hh; arch(g, x, hy, hw, hh, '#0a0505', Z.s[4]);
      rect(g, x + 6, hy + 12, hw - 12, 3, Z.s[5]); rect(g, x, hy + 10, hw, 2, Z.s[2]);   /* the hearth's mantel */
      for (let q = 0; q < 5; q++) { const lx = x + 12 + q * 12; rect(g, lx, floor - 6, 8, 6, '#2a1a10'); }   /* the great logs... of charcoal */
      fires.push({ kind: 'hearth', x: x + 10, y: floor - 4, w: hw - 20, h: hh - 24 });
    }
    for (let x = 0; x < w; x += 22) { rect(g, x, 0, 6, 6, '#0a0606'); }
    rect(g, 0, 8, w, 7, '#0c0706'); rect(g, 0, 8, w, 1, '#3a2418'); for (let x = 8; x < w; x += 46) { rect(g, x, 8, 6, 8, '#1a0e0a'); }   /* a black beam along the roof */
    for (let x = 30; x < w - 20; x += 60 + (hash(x + wx0, 5) % 40)) { rect(g, x, 15, 1, 10 + (hash(x, 1) % 14), IRON[2]); const tl = 25 + (hash(x, 1) % 14); rect(g, x - 2, 15 + tl - 15, 5, 2, IRON[4]); }   /* hooks and tool-chains */
  } else if (zone === 2) {   /* THE GREASE KITCHENS: copper on rails, jars on shelves, a steaming window */
    const tileTop = h - 70;
    for (let x = 8; x < w - 30; x += 52 + (hash(x + wx0, 3) % 30)) {
      const k = hash(x + wx0, 8) % 3;
      if (k === 0) { rect(g, x, tileTop - 40, 40, 2, OUT); rect(g, x, tileTop - 40, 40, 1, WOOD[4]); for (let j = 0; j < 4; j++) { const jx = x + 3 + j * 9; rect(g, jx, tileTop - 38, 6, 8, OUT); rect(g, jx + 1, tileTop - 37, 4, 6, ['#a8402a', '#c8a030', '#4fa890', '#8a6a3a'][j]); rect(g, jx, tileTop - 40, 6, 2, WOOD[3]); } rect(g, x, tileTop - 24, 40, 2, OUT); rect(g, x, tileTop - 24, 40, 1, WOOD[4]); for (let j = 0; j < 3; j++) { ellipse(g, x + 7 + j * 13, tileTop - 28, 5, 3, OUT); ellipse(g, x + 7 + j * 13, tileTop - 28, 4, 2, IRON[4]); } }   /* a shelf of jars over a shelf of pewter */
      else if (k === 1) { rect(g, x, 12, 44, 2, IRON[2]); for (let j = 0; j < 5; j++) { const px0 = x + 4 + j * 8; rect(g, px0, 14, 1, 8, IRON[3]); ellipse(g, px0, 31, 6 - (j & 1), 8, OUT); ellipse(g, px0, 31, 5 - (j & 1), 7, COP[2 + (j & 1)]); ellipse(g, px0 - 2, 28, 2, 3, COP[4]); } }   /* a rail of hanging copper pans */
      else { rect(g, x - 1, tileTop - 56, 28, 40, OUT); rect(g, x, tileTop - 55, 26, 38, '#1c2430'); rect(g, x + 12, tileTop - 55, 2, 38, OUT); rect(g, x, tileTop - 36, 26, 2, OUT); fires.push({ kind: 'steamwin', x: x + 13, y: tileTop - 36, w: 26 }); }   /* a window, steamed up */
    }
  } else if (zone === 3) {   /* THE FEAST HALL: tall arches, long banners, torch sconces, window slits */
    for (let x = 24; x < w - 50; x += 96 + (hash(x + wx0, 6) % 20)) {
      const hh = Math.min(h - 6, 100); arch(g, x, floor - hh, 30, hh, '#0a0608', Z.s[4]); rect(g, x + 7, floor - hh + 16, 16, 40, '#1c2a44'); ellipse(g, x + 15, floor - hh + 16, 8, 8, '#1c2a44'); rect(g, x + 14, floor - hh + 8, 2, 48, OUT); fires.push({ kind: 'moon', x: x + 15, y: floor - hh + 24, w: 18 });
      const bx = x + 46; rect(g, bx - 2, 6, 22, 3, '#c9a040'); fillPoly(g, [[bx, 9], [bx + 18, 9], [bx + 18, 60], [bx + 9, 52], [bx, 60]], OUT); fillPoly(g, [[bx + 1, 9], [bx + 17, 9], [bx + 17, 57], [bx + 9, 49], [bx + 1, 57]], '#8a1c1c');
      rect(g, bx + 1, 9, 3, 46, '#a82828'); rect(g, bx + 3, 17, 12, 2, '#c9a040'); ellipse(g, bx + 9, 32, 4, 4, '#c9a040'); rect(g, bx + 8, 26, 2, 12, '#7a1010'); px(g, bx + 6, 31, '#7a1010'); px(g, bx + 12, 31, '#7a1010');   /* the queen's banner: a gold boar's boss */
      const tx = x + 76; rect(g, tx - 1, floor - 50, 3, 14, IRON[2]); rect(g, tx - 3, floor - 38, 7, 3, IRON[3]); fires.push({ kind: 'torch', x: tx, y: floor - 52, r: 44 });
    }
  } else {   /* GRUBBAG'S TABLE: plum drapes, the queen's tapestry behind the chair, a chandelier, gold band */
    for (let x = 0; x < w; x += 34) { fillPoly(g, [[x, 0], [x + 30, 0], [x + 26, 54], [x + 17, 44], [x + 8, 56]], OUT); fillPoly(g, [[x + 1, 0], [x + 29, 0], [x + 25, 52], [x + 17, 42], [x + 9, 54]], x % 68 ? '#4a2858' : '#3a1c46'); rect(g, x + 1, 0, 4, 52, '#6a3c7e'); }
    rect(g, 0, 0, w, 5, '#c9a040'); rect(g, 0, 0, w, 1, '#fff0b0'); rect(g, 0, 5, w, 1, '#7a5a1c');
    const cx = w - 108, ty = floor - 100; rect(g, cx - 1, ty - 1, 66, 82, OUT); rect(g, cx, ty, 64, 80, '#6a1c2c'); rect(g, cx, ty, 6, 80, '#8a2c3e'); rect(g, cx, ty, 64, 4, '#c9a040'); rect(g, cx, ty + 76, 64, 4, '#c9a040');
    ellipse(g, cx + 32, ty + 38, 18, 15, OUT); ellipse(g, cx + 32, ty + 38, 17, 14, '#c9a040'); ellipse(g, cx + 28, ty + 33, 8, 6, '#ffe08a'); rect(g, cx + 14, ty + 40, 8, 14, OUT); rect(g, cx + 42, ty + 40, 8, 14, OUT); rect(g, cx + 15, ty + 40, 6, 12, '#efe6cf'); rect(g, cx + 43, ty + 40, 6, 12, '#efe6cf');   /* a boar's head with white tusks in gold on the queen's red */
    for (const ex of [26, 38]) { rect(g, cx + ex, ty + 33, 4, 3, '#1a1010'); px(g, cx + ex + 1, ty + 33, '#ff4a2a'); }
    fires.push({ kind: 'chandelier', x: w * 0.5, y: 26 }); fires.push({ kind: 'lamp', x: 40, y: 30, r: 46 });
  }
  /* a dado of dark stone and the floor's shadow */
  rect(g, 0, floor - 10, w, 10, 'rgba(0,0,0,0.35)'); for (let i = 0; i < 4; i++) { g.globalAlpha = 0.08; rect(g, 0, floor - 40 - i * 6, w, 40 + i * 6, '#000'); } g.globalAlpha = 1;
  return { c, fires };
}
const ROOMS = new Map();
export function paintRoom(g, st, sx, sy, w, h, tx0, ty0, time, camX, camY, VW, VH) {
  const zone = zoneOf(tx0 + ((w / TS / 2) | 0), ty0), key = tx0 + ',' + ty0 + ',' + w + ',' + h; let B = ROOMS.get(key); if (!B) { B = bakeRoom(zone, w, h, tx0 * TS, ty0 * TS, st); ROOMS.set(key, B); }
  const wx0 = tx0 * TS, wy0 = ty0 * TS, vx0 = Math.max(0, camX - wx0), vx1 = Math.min(w, camX - wx0 + VW);
  if (vx1 <= vx0) return true;
  g.drawImage(B.c, vx0, 0, vx1 - vx0, h, sx + vx0, sy, vx1 - vx0, h);
  /* the live light: hearth fire, lamps, torches, the chandelier, the cold shafts */
  for (const f of B.fires) {
    const fx = f.x; if (fx + (f.w || f.r || 40) < vx0 - 80 || fx - (f.w || f.r || 40) > vx1 + 80) continue;
    if (f.kind === 'hearth') { const bx = sx + f.x, by = sy + f.y; flame(g, bx, by, f.w, f.h * 0.55, time, f.x * 0.37); }
    else if (f.kind === 'lamp' || f.kind === 'torch') { g.save(); g.globalCompositeOperation = 'lighter'; const k = 0.8 + 0.2 * Math.sin(time * 7 + f.x), gr = g.createRadialGradient(sx + f.x, sy + f.y, 1, sx + f.x, sy + f.y, f.r); gr.addColorStop(0, 'rgba(255,170,70,' + (0.36 * k).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = gr; g.fillRect(sx + f.x - f.r, sy + f.y - f.r, f.r * 2, f.r * 2); g.restore();
      if (f.kind === 'torch') flame(g, sx + f.x - 3, sy + f.y + 2, 7, 10, time, f.x, false); }
    else if (f.kind === 'shaft') { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(0, sy + f.y, 0, sy + f.y + f.h); gr.addColorStop(0, 'rgba(150,190,230,0.2)'); gr.addColorStop(1, 'rgba(150,190,230,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(sx + f.x - 10, sy + f.y); g.lineTo(sx + f.x + 10, sy + f.y); g.lineTo(sx + f.x + 28, sy + f.y + f.h); g.lineTo(sx + f.x - 6, sy + f.y + f.h); g.closePath(); g.fill(); g.restore(); }
    else if (f.kind === 'moon') { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.12; rect(g, sx + f.x - 8, sy + f.y, 16, 50, '#9ab8e8'); g.restore(); g.globalAlpha = 1; }
    else if (f.kind === 'steamwin') { for (let i = 0; i < 3; i++) { const t = (time * 0.25 + i / 3) % 1; g.globalAlpha = 0.25 * (1 - t); ellipse(g, R(sx + f.x + Math.sin(time + i) * 4), R(sy + f.y - t * 26), 6, 3, '#e8ecf4'); g.globalAlpha = 1; } }
    else if (f.kind === 'chandelier') { const cx2 = sx + f.x, cy2 = sy + f.y; rect(g, cx2, sy, 1, f.y - 4, IRON[3]); ellipse(g, cx2, cy2, 22, 4, OUT); ellipse(g, cx2, cy2, 21, 3, '#c9a040'); for (let q = -3; q <= 3; q++) { const cxq = cx2 + q * 6; rect(g, cxq - 1, cy2 - 8, 3, 8, '#efe6cf'); const fk = 0.6 + 0.4 * Math.sin(time * 11 + q * 1.7); rect(g, cxq, cy2 - 12 + R(2 - 2 * fk), 2, R(3 + 2 * fk), '#ffd36b'); }
      g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(cx2, cy2, 2, cx2, cy2, 70); gr.addColorStop(0, 'rgba(255,200,110,0.25)'); gr.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = gr; g.fillRect(cx2 - 70, cy2 - 70, 140, 140); g.restore(); }
  }
  return true;
}
/* ------------------------------------------------------------------ DRESSING ------------------------------------------------------------------ */
const spr = (k, w, h, fn) => once('sp' + k, () => { const [c, g] = canvas(w, h); fn(g); return c; });
const SPR = {
  ham: v => spr('ham' + v, 14, 26, g => { rect(g, 6, 0, 2, 7, IRON[3]); rect(g, 5, 6, 4, 2, OUT); ellipse(g, 7, 15, 6, 8, OUT); ellipse(g, 7, 15, 5, 7, v ? '#b86a4a' : '#a04a38'); ellipse(g, 5, 12, 2, 3, '#d88a6a'); rect(g, 5, 21, 4, 3, '#e8d8b8'); rect(g, 6, 23, 2, 2, '#fff0d0'); }),
  sausages: v => spr('sau' + v, 22, 14, g => { rect(g, 0, 1, 22, 1, '#5a4a3a'); for (let i = 0; i < 4; i++) { const x = 1 + i * 5; ellipse(g, x + 2, 8, 2, 5, OUT); ellipse(g, x + 2, 8, 1, 4, i & 1 ? '#a04a38' : '#8a3a2a'); px(g, x + 1, 6, '#d88a6a'); rect(g, x + 2, 2, 1, 2, '#5a4a3a'); } }),
  pan: v => spr('pan' + v, 16, 28, g => { rect(g, 7, 0, 2, 12, IRON[3]); ellipse(g, 8, 19, 7 - v, 7, OUT); ellipse(g, 8, 19, 6 - v, 6, COP[2]); ellipse(g, 6, 17, 3, 3, COP[3]); ellipse(g, 8, 19, 3, 3, COP[1]); px(g, 5, 16, COP[4]); }),
  ladle: () => spr('ladle', 10, 24, g => { rect(g, 4, 0, 2, 4, IRON[3]); rect(g, 4, 3, 2, 12, COP[2]); rect(g, 4, 3, 1, 12, COP[3]); ellipse(g, 5, 18, 4, 4, OUT); ellipse(g, 5, 18, 3, 3, COP[2]); ellipse(g, 4, 17, 1, 1, COP[4]); }),
  braid: v => spr('braid' + v, 12, 24, g => { rect(g, 5, 0, 2, 22, '#7a5a2a'); const cols = v ? ['#e8e0c8', '#d8d0b0'] : ['#b8742a', '#d89a3a']; for (let i = 0; i < 5; i++) { const x = (i & 1) ? 7 : 1; ellipse(g, x + 2, 5 + i * 4, 3, 3, OUT); ellipse(g, x + 2, 5 + i * 4, 2, 2, cols[i & 1]); px(g, x + 1, 4 + i * 4, '#fff0c0'); } }),
  lantern: () => spr('lantern', 12, 22, g => { rect(g, 5, 0, 2, 8, IRON[3]); rect(g, 2, 7, 8, 2, OUT); rect(g, 3, 8, 6, 1, IRON[4]); rect(g, 2, 9, 8, 10, OUT); rect(g, 3, 10, 6, 8, '#d8a040'); rect(g, 3, 10, 2, 8, '#ffe08a'); rect(g, 5, 10, 1, 8, OUT); rect(g, 2, 19, 8, 2, OUT); }),
  banner: (h, col) => spr('ban' + h + col, 22, h, g => { rect(g, 0, 0, 22, 3, '#c9a040'); rect(g, 0, 0, 22, 1, '#fff0b0'); fillPoly(g, [[1, 3], [21, 3], [21, h - 2], [11, h - 10], [1, h - 2]], OUT); fillPoly(g, [[2, 3], [20, 3], [20, h - 4], [11, h - 12], [2, h - 4]], col); rect(g, 2, 3, 4, h - 8, 'rgba(255,255,255,0.12)'); rect(g, 5, 14, 12, 2, '#c9a040'); ellipse(g, 11, 26, 4, 4, '#c9a040'); rect(g, 10, 20, 2, 12, 'rgba(0,0,0,0.25)'); }),
  sack: v => spr('sack' + v, 16, 17, g => { ellipse(g, 8, 11, 7, 6, OUT); ellipse(g, 8, 11, 6, 5, v ? '#a89a7a' : '#c8b88e'); ellipse(g, 6, 9, 3, 2, '#e0d4ae'); rect(g, 6, 3, 5, 4, OUT); rect(g, 7, 4, 3, 3, v ? '#a89a7a' : '#c8b88e'); rect(g, 6, 6, 5, 1, '#6a4a2a'); }),
  stool: () => spr('stool', 14, 12, g => { rect(g, 1, 0, 12, 4, OUT); rect(g, 2, 1, 10, 2, WOOD[3]); rect(g, 2, 1, 10, 1, WOOD[4]); rect(g, 2, 4, 2, 8, OUT); rect(g, 3, 4, 1, 7, WOOD[2]); rect(g, 10, 4, 2, 8, OUT); rect(g, 10, 4, 1, 7, WOOD[2]); }),
  bucket: () => spr('bucket', 12, 12, g => { rect(g, 1, 2, 10, 10, OUT); rect(g, 2, 3, 8, 9, WOOD[2]); rect(g, 2, 3, 2, 9, WOOD[4]); rect(g, 1, 4, 10, 1, IRON[3]); rect(g, 1, 9, 10, 1, IRON[3]); rect(g, 3, 0, 6, 1, IRON[4]); rect(g, 2, 1, 1, 3, IRON[3]); rect(g, 9, 1, 1, 3, IRON[3]); }),
  jar: v => spr('jar' + v, 8, 10, g => { rect(g, 1, 2, 6, 8, OUT); rect(g, 2, 3, 4, 7, ['#8a3a2a', '#c8a030', '#4fa890', '#a8742a'][v]); rect(g, 2, 3, 1, 7, 'rgba(255,255,255,0.35)'); rect(g, 2, 0, 4, 3, OUT); rect(g, 3, 1, 2, 2, WOOD[3]); }),
  plates: v => spr('plates' + v, 14, 8, g => { for (let i = 0; i <= v; i++) { rect(g, 1, 6 - i * 2, 12, 2, OUT); rect(g, 2, 6 - i * 2, 10, 1, '#e8eaf0'); } rect(g, 2, 6, 10, 1, IRON[4]); }),
  jug: () => spr('jug', 9, 12, g => { ellipse(g, 4, 8, 4, 4, OUT); ellipse(g, 4, 8, 3, 3, IRON[4]); rect(g, 3, 1, 3, 4, OUT); rect(g, 4, 2, 1, 3, IRON[5]); rect(g, 7, 6, 2, 4, OUT); px(g, 3, 6, '#ffffff'); }),
  hearthstack: () => spr('hstack', 16, 10, g => { for (let i = 0; i < 3; i++) { ellipse(g, 4 + i * 4, 6 - (i & 1) * 3, 4, 3, OUT); ellipse(g, 4 + i * 4, 6 - (i & 1) * 3, 3, 2, '#2a2220'); px(g, 3 + i * 4, 5 - (i & 1) * 3, '#5a4a40'); } }),
  goblet: () => spr('goblet', 7, 9, g => { rect(g, 0, 0, 7, 4, OUT); rect(g, 1, 0, 5, 3, '#c9a040'); rect(g, 1, 0, 5, 1, '#fff0b0'); rect(g, 3, 4, 1, 3, '#c9a040'); rect(g, 1, 7, 5, 2, '#c9a040'); }),
};
export function dress(decor, L, at, T) {
  const LW = L.W, LH = L.H; const add = (c, x, y) => decor.push({ k: 'kgdress', x: R(x), y: R(y), c, bg: true, sway: 0 });
  const busy = new Set(); for (const e of L.ents || []) for (let dx = -2; dx <= 2; dx++) busy.add((e.x + dx) + ',' + e.y);
  const A = L.arena; const inArena = x => A && x * TS >= A.x0 - TS && x * TS <= A.x1 + TS;
  for (let y = 2; y < LH - 2; y++) for (let x = 2; x < LW - 2; x++) {
    const t = at(x, y), hv = hash(x * 7 + 3, y * 5 + 1), z = zoneOf(x, y), r = hv % 100;
    if (t === T.SOLID) {
      if (at(x, y + 1) === T.AIR && !inArena(x)) {   /* a ceiling cell: what hangs from it */
        let open = 0; while (open < 8 && at(x, y + 1 + open) === T.AIR) open++;
        if (open < 3) continue;
        if (z === 0) { if (r < 5) add(SPR.ham(r & 1), x * TS + 1, y * TS + 14); else if (r < 8) add(SPR.braid(r & 1), x * TS + 2, y * TS + 14); else if (r < 10) add(SPR.lantern(), x * TS + 2, y * TS + 14); }
        else if (z === 1) { if (r < 5) add(SPR.ham(r & 1), x * TS + 1, y * TS + 14); else if (r < 9) add(SPR.lantern(), x * TS + 2, y * TS + 14); else if (r < 12) add(SPR.ladle(), x * TS + 3, y * TS + 14); }
        else if (z === 2) { if (r < 7) add(SPR.pan(r & 1), x * TS, y * TS + 14); else if (r < 11) add(SPR.sausages(r & 1), x * TS - 3, y * TS + 14); else if (r < 14) add(SPR.ladle(), x * TS + 3, y * TS + 14); else if (r < 17) add(SPR.braid(r & 1), x * TS + 2, y * TS + 14); }
        else if (z === 3) { if (r < 9 && open >= 5) add(SPR.banner(70 + (r & 1) * 14, '#8a1c1c'), x * TS - 3, y * TS + 14); else if (r < 13) add(SPR.lantern(), x * TS + 2, y * TS + 14); }
      } else if (at(x, y - 1) === T.AIR && !busy.has(x + ',' + (y - 1)) && !inArena(x)) {   /* a floor cell: what stands on it, never taller than a hero's knee */
        if (z === 0) { if (r < 5) add(SPR.sack(r & 1), x * TS, y * TS - 17); else if (r < 7) add(SPR.bucket(), x * TS + 2, y * TS - 12); }
        else if (z === 1) { if (r < 5) add(SPR.hearthstack(), x * TS, y * TS - 10); else if (r < 7) add(SPR.bucket(), x * TS + 2, y * TS - 12); }
        else if (z === 2) { if (r < 5) add(SPR.sack(r & 1), x * TS, y * TS - 17); else if (r < 8) add(SPR.stool(), x * TS + 1, y * TS - 12); else if (r < 10) add(SPR.bucket(), x * TS + 2, y * TS - 12); }
        else if (z === 3) { if (r < 4) add(SPR.stool(), x * TS + 1, y * TS - 12); else if (r < 6) add(SPR.goblet(), x * TS + 4, y * TS - 9); }
      }
    } else if (t === T.ONEWAY || t === T.PLANK) {   /* a dresser shelf: jars, plates, a jug */
      if (!busy.has(x + ',' + (y - 1)) && at(x, y - 1) === T.AIR && r < 22) { const q = r % 4; if (q === 0) add(SPR.jar(r % 4), x * TS + 3, y * TS - 10); else if (q === 1) add(SPR.plates(r % 3), x * TS + 1, y * TS - 8); else if (q === 2) add(SPR.jug(), x * TS + 3, y * TS - 12); else add(SPR.jar(1 + (r % 3)), x * TS + 4, y * TS - 10); }
    }
  }
}
/* ------------------------------------------------------------------ AMBIENT ------------------------------------------------------------------ */
export function drawAmbient(g, cx, cy, VW, VH, time, at, T) {
  const tx0 = Math.max(0, Math.floor(cx / TS)), tx1 = Math.floor((cx + VW) / TS), ty0 = Math.max(0, Math.floor(cy / TS)), ty1 = Math.floor((cy + VH) / TS);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    const t = at(tx, ty); const hv = hash(tx, ty), zone = zoneOf(tx, ty);
    if (t === T.SPIKE) {   /* a coal pit: a glow, and embers climbing off it */
      const k = 0.75 + 0.25 * Math.sin(time * 5 + hv), x = tx * TS + 8 - cx, y = ty * TS + 2 - cy;
      const gr = g.createRadialGradient(x, y, 1, x, y, 26); gr.addColorStop(0, 'rgba(255,120,40,' + (0.28 * k).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = gr; g.fillRect(R(x - 26), R(y - 26), 52, 52);
      for (let i = 0; i < 2; i++) { const per = 1.6 + (hv % 5) * 0.2, ph = ((time + (hv % 97) / 40 + i * 0.7) % per) / per; g.globalAlpha = 1 - ph; rect(g, R(x - 5 + (hv % 11) + Math.sin(time * 4 + i + hv) * 3), R(y - ph * 36), 1, 1, i ? '#ffb04a' : '#ffe08a'); g.globalAlpha = 1; }
    } else if (zone === 2 && t === T.AIR && (hv % 53) === 0) {   /* flies over the grease */
      const a = time * 3 + hv, x = tx * TS + 8 + Math.cos(a) * 9 - cx, y = ty * TS + 6 + Math.sin(a * 1.7) * 5 - cy; g.globalAlpha = 0.7; rect(g, R(x), R(y), 1, 1, '#9a9a8a'); g.globalAlpha = 1;
    }
  }
  g.restore();
}
