// causeway3_tiles.js - THE DROWNED CAUSEWAY 2's TILE KIT (claude/cw3art, 2026-11-07). The greybox wore master's generic sea-road set. This is PILGRIM STONE under a storm that builds:
//   zone 0 ACT I   THE PILGRIM ROAD  x < 306   late-day limestone: warm grey flags, salt-white crust on the dry tops, a pilgrim's cross cut in the odd flag, moss in the joints
//   zone 1 ACT II  THE HOLY ISLAND   x < 599   dusk: the same stone gone violet and wet - the tide comes OVER the road here, so tops wear a green algae film, barnacles and shells
//   zone 2 ACT III THE LAST MILE     x < 904   night: blue-black wet stone, a cold sheen on every lit edge, weed at the old high-water line
//   zone 3 THE LIGHT 904..932                  the lighthouse's own stone: whitewash and a red band, granite steps with brass nosings, warm light on it
// Other kits inside the level (picked by cell, not by column): the WRECK's hull (315-338, rows 12-23: tarred storm timber - on-theme, she IS a ship), the two FALLEN TOWERS (ashlar,
// ragged top, arrow-slits), the CHAPEL (slate roof, buttressed walls), the UNDERSEA kit (the crypt 404-434 and the sea arch to 497: green-black vault stone, voussoirs, weed, silted floors),
// the cove / basin MUD, stepping-stones' coping, the SEA BED (ripple sand and shell), the PILGRIMS' GATE (an iron-barred gate with a cross on the lintel), ledges as stone slabs on corbels,
// the lamp gallery as iron grating, and the wreck's SHROUDS (tarred rope, ratlines). x >= 933 is master's Kraken's Reach: null (its own art draws it, cell for cell).
// WET / DRY: the tile bake is static; the tide's wetness is drawn live by src/causeway3-hands.js (drawWet, from src/redraw/causeway3_art.js): the road top darkens and glints while a tide
// stands on it and dries off over a few seconds after. The bake carries the TIDE LINE (salt crust above, weed and barnacles below act I's high water at row 24).
// 16x16, baked lazily, memoised.   cw3Tile(t, x, y, at, T, L) -> a canvas, or null (the game's own kit draws it)
import { canvas, rect, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) rect(g, x, y, 1, 1, c); };
export const ROAD_ROW = 24, BED_ROW = 40, REACH_X = 933;
export const HULL = [315, 338, 12, 23], TOWERS = [[240, 246, 6, 23], [438, 442, 4, 19]], CHAPEL = [372, 404, 8, 15], LIGHT = [913, 920, 7, 17], UNDER = [404, 497, 24, 40];

/* four stones: s = seven steps dark -> lit; joint = the mortar line; crust = the salt / lime at the top of a stone; film = what the tide leaves on it; shell = barnacle */
export const ZONE = [
  { s: ['#15141a', '#26252c', '#3b3a42', '#56545a', '#767268', '#9a9482', '#c0b79c'], joint: '#0c0b10', crust: '#ddd7c0', film: '#5a7a48', shell: '#d6d0bc', cross: '#2c2b30', rim: '#e4d8b0' },
  { s: ['#0f1018', '#1c1d2a', '#2d3040', '#434a5e', '#5f6a80', '#7f8aa0', '#a4aebf'], joint: '#07080e', crust: '#b8bcc8', film: '#2c5a48', shell: '#c8c4b4', cross: '#161824', rim: '#b4a4c8' },
  { s: ['#06080e', '#0c1018', '#141c2a', '#1f2c40', '#2e4258', '#456078', '#6e8ca4'], joint: '#03050a', crust: '#6e8ca4', film: '#1c4a3c', shell: '#8aa4b0', cross: '#0a0e16', rim: '#9ac4e0' },
  { s: ['#1a1a20', '#34343c', '#55545c', '#7a7a80', '#a4a29a', '#cac6b4', '#ece4c8'], joint: '#222228', crust: '#f4ecd0', film: '#5a7a58', shell: '#e0d8c0', cross: '#3a3a42', rim: '#fff0c0' },
];
const timber = ['#07090b', '#10151a', '#1c242c', '#2a3640', '#3c4c58', '#546a76', '#748a94'];   /* the wreck: storm-wet tarred strakes */
const slate = ['#0c0e14', '#171a24', '#232836', '#343b4e', '#4a546c', '#66728c'];
const vault = ['#04070a', '#0a1214', '#121e20', '#1c2e30', '#2a4244', '#3e5e5c', '#5e8480'];   /* the undersea stone, green-black */
const sand = ['#0c1418', '#162226', '#22343a', '#3a5258', '#5e7a78'];
const mud = ['#0a0f0e', '#141c18', '#202a22', '#34402e', '#4c5a40'];
const weed = ['#08160e', '#10281a', '#1c4026', '#2c5c34'];
const rope = ['#0f0c08', '#241c12', '#3e3220', '#6a5a3a', '#9a8856'];
const iron = ['#14161a', '#2a2e36', '#444a54', '#6a7280', '#9aa2b0'];

export function zoneOf(x) { return x < 306 ? 0 : x < 599 ? 1 : x < 904 ? 2 : 3; }
const inBox = (x, y, b) => x >= b[0] && x <= b[1] && y >= b[2] && y <= b[3];

/* one ashlar pixel: 8-high courses, 20-wide blocks, joints staggered by course, an occasional chip and a lit left arris */
function ashlar(zone, ax, ay, base, pal) {
  const Z = pal ? null : ZONE[zone], S = pal || Z.s, course = Math.floor(ay / 8), cy = ay - course * 8, wid = 20, off = (course * 9) % wid, sx = ((ax + off) % wid + wid) % wid;
  const blk = (Math.floor((ax + off) / wid) * 29 + course * 17) | 0, tone = (hash(blk, zone + 5) % 3) - 1;
  if (cy === 7) return pal ? S[0] : Z.joint;
  if (sx === 0) return S[Math.max(0, base - 2)];
  if (cy === 0) return S[Math.max(0, Math.min(S.length - 1, base + 1 + tone))];
  const grit = (hash(ax, ay) >> 6) % 9 === 0 ? -1 : (hash(ax * 3, ay) >> 7) % 17 === 0 ? 1 : 0;
  return S[Math.max(0, Math.min(S.length - 1, base + tone + grit + (sx < 2 ? 1 : 0)))];
}
function fillAshlar(g, zone, x, y, base, pal, y0 = 0, y1 = 16) { for (let py = y0; py < y1; py++) for (let p = 0; p < 16; p++) px2(g, p, py, ashlar(zone, x * 16 + p, y * 16 + py, base, pal)); }
const dark = (g, a, c = '#030406') => { g.globalAlpha = a; rect(g, 0, 0, 16, 16, c); g.globalAlpha = 1; };
const crossAt = (g, cx, cy, c) => { rect(g, cx, cy - 2, 1, 5, c); rect(g, cx - 1, cy - 1, 3, 1, c); };   /* a pilgrim's cross, 3x5 */

/* THE ROAD: pilgrim flags - 16 wide, worn to a shallow rut where the feet go, joints dark, a cross cut in the odd one; then ashlar under the lip.
   act I tops are DRY (salt crust, moss in the joints); acts II/III are TIDE-WASHED (algae film, barnacles, a shell). */
function roadTop(zone, x, y, eL, eR, o) {
  const wet = zone >= 1;
  return once('rt' + zone + '_' + (x & 7) + (o.turf ? 'tf' : '') + (o.brass ? 'br' : '') + (o.coping ? 'cp' : '') + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, zone + 11)), Z = ZONE[zone], h = hash(x & 7, 3);
    fillAshlar(g, zone, x, y, 2, null, 6, 16);
    rect(g, 0, 0, 16, 5, Z.s[o.coping ? 4 : 3]);                                                      /* the walked flag */
    rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 1, 16, 1, Z.s[5]);                                       /* the lit lip and the face under it */
    if (!o.coping) for (let k = 0; k < 16; k++) if ((hash(k + (x & 7) * 16, 4) % 3) === 0) px2(g, k, 2, Z.s[2]);   /* the rut: worn hollows */
    for (let k = 0; k < 3; k++) px2(g, (r() * 16) | 0, 1 + ((r() * 3) | 0), Z.s[2]);
    rect(g, 0, 4, 16, 1, Z.s[2]); rect(g, 0, 5, 16, 1, Z.joint);                                      /* the flag's thickness, the bedding joint */
    px2(g, 8 + (h % 3), 0, Z.joint); px2(g, 8 + (h % 3), 1, Z.joint); px2(g, 8 + (h % 3), 2, Z.s[1]);  /* the butt joint between two flags */
    if (!o.coping && (h & 7) === 0) crossAt(g, 4 + (h >> 4) % 6, 2, Z.cross);                          /* a pilgrim's cross */
    if (wet) {
      for (let k = 0; k < 16; k++) { const q = hash(k + (x & 7) * 16, 9) % 5; if (q === 0) px2(g, k, 0, Z.film); if (q <= 1) px2(g, k, 1, Z.film); }   /* the algae film */
      for (let k = 0; k < 3; k++) { const bx = (r() * 14) | 0; px2(g, bx, 0, Z.shell); px2(g, bx + 1, 1, Z.shell); }   /* barnacles and a shell */
      if (zone === 2) for (let k = 0; k < 16; k += 3) px2(g, k + (hash(x, k) & 1), 0, Z.rim);           /* the night's cold sheen */
    } else {
      for (let k = 0; k < 6; k++) px2(g, (r() * 16) | 0, 0, Z.crust);                                  /* dry salt on the lip */
      if ((h & 3) === 1) { px2(g, 8 + (h % 3), 3, '#4a6a3a'); px2(g, 9 + (h % 3), 4, '#38542c'); }     /* moss in the butt joint */
    }
    if (o.turf) { for (let k = 0; k < 16; k++) { const q = hash(k + (x & 7) * 16, 21) % 4; if (q < 2) { px2(g, k, -0, '#3c5a34'); } if (q === 0) { px2(g, k, 1, '#4a7040'); } } rect(g, 0, 0, 16, 1, '#2c4a2a'); for (let k = 0; k < 4; k++) px2(g, ((hash(x, k) % 14) + 1), 0, '#d8a0b8'); }   /* the island's turf and sea-pinks */
    if (o.brass) { rect(g, 0, 0, 16, 1, '#e0c060'); rect(g, 0, 1, 16, 1, '#a8802c'); rect(g, 0, 2, 16, 1, '#6a4a14'); for (let k = 2; k < 16; k += 5) px2(g, k, 0, '#fff0b0'); }   /* a brass nosing on the light's steps */
    if (eL) { rect(g, 0, 0, 1, 16, Z.s[5]); } if (eR) rect(g, 15, 0, 1, 16, Z.s[0]);
    return c; });
}
/* the tide line on a pier or wall: rows 24-31 are where act I's high water stood and acts II-III's tide comes over: weed and barnacles, a crust of salt above it */
function tideLine(g, zone, x, y) {
  const Z = ZONE[Math.max(0, Math.min(3, zone))], r = mulberry(hash(x & 7, y & 7) + 53);
  if (y < ROAD_ROW) { for (let k = 0; k < 3; k++) { const bx = (r() * 16) | 0, l = 2 + ((r() * 5) | 0); for (let q = 0; q < l; q++) px2(g, bx, q, Z.crust); } g.globalAlpha = 0.18; rect(g, 0, 0, 16, 16, Z.crust); g.globalAlpha = 1; return; }
  if (y > 31) { dark(g, 0.14, '#050c0a'); }
  for (let k = 0; k < 6; k++) { const bx = (r() * 16) | 0, l = 2 + ((r() * 7) | 0); for (let q = 0; q < l; q++) px2(g, bx + (q & 1), 15 - q, weed[(q + k) % 4]); }
  for (let k = 0; k < 5; k++) { const bx = (r() * 15) | 0, by = (r() * 15) | 0; px2(g, bx, by, Z.shell); px2(g, bx + 1, by, Z.s[3]); }
}
function faceTile(zone, x, y, eL, eR) {
  return once('fa' + zone + '_' + (x & 3) + '_' + (y & 7) + (y >= 24 ? 'w' : '') + (y > 31 ? 'd' : '') + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone];
    fillAshlar(g, zone, x, y, 3, null); tideLine(g, zone, x, y);
    if (eL) { rect(g, 0, 0, 2, 16, Z.s[5]); rect(g, 0, 0, 1, 16, Z.s[6]); } if (eR) { rect(g, 14, 0, 2, 16, Z.s[1]); rect(g, 15, 0, 1, 16, Z.s[0]); }
    if ((hash(x, y) & 31) === 0) { rect(g, 6, 4, 3, 5, Z.joint); rect(g, 6, 4, 3, 1, Z.s[1]); }   /* an arrow-slit / drain hole */
    return c; });
}
function massTile(zone, x, y, d) {
  return once('ma' + zone + '_' + (x & 7) + '_' + (y & 7) + '_' + Math.min(d, 6) + (y >= 24 ? 'w' : ''), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone];
    fillAshlar(g, zone, x, y, d <= 1 ? 3 : 2, null); dark(g, [0, 0.05, 0.1, 0.15, 0.2, 0.24, 0.28][Math.min(d, 6)]);
    if (d <= 2) tideLine(g, zone, x, y);
    if (zone === 2) { g.globalAlpha = 0.1; rect(g, 0, 0, 16, 16, '#2a5a7a'); g.globalAlpha = 1; }
    void Z; return c; });
}
function ceilTile(zone, x, y, eL, eR) {
  return once('ce' + zone + '_' + (x & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone];
    fillAshlar(g, zone, x, y, 1, null); rect(g, 0, 11, 16, 5, Z.s[2]); rect(g, 0, 11, 16, 1, Z.s[4]); rect(g, 0, 15, 16, 1, Z.joint);
    if (eL) rect(g, 0, 0, 1, 16, Z.s[4]); if (eR) rect(g, 15, 0, 1, 16, Z.s[0]); dark(g, 0.3); return c; });
}

/* STEPPING STONES, the sea wall, the holm: dressed coping, a chamfered lip, iron lewis-holes, a drip stain; tops at rows 28-30 stand in the channels */
function copingTop(zone, x, y, eL, eR) { return roadTop(zone, x, y, eL, eR, { coping: true }); }

/* MUD: the cove and the basin at low water - wet silt, shell, a weed tuft; and the drowned piers' caps */
function mudTile(x, y, top, d) {
  return once('mu' + (x & 7) + (top ? 't' : 'm' + Math.min(d, 4)), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, top ? 5 : 9) + 13);
    for (let py = 0; py < 16; py++) for (let p = 0; p < 16; p++) px2(g, p, py, mud[Math.max(0, Math.min(4, (top ? 3 : 2) + (hash(x * 16 + p, y * 16 + py) % 3) - 1 - (top ? 0 : Math.min(d, 3) >> 1)))]);
    if (top) { rect(g, 0, 0, 16, 2, mud[4]); for (let k = 0; k < 16; k += 2) px2(g, k + (hash(x, k) & 1), 2, mud[1]); for (let k = 0; k < 4; k++) px2(g, (r() * 16) | 0, (r() * 2) | 0, '#c8d4c4'); px2(g, (r() * 14) | 0, 0, '#e8f0e0');
      if ((hash(x, 7) & 3) === 0) { const bx = (r() * 13) | 0; for (let q = 0; q < 5; q++) px2(g, bx + (q & 1), -q + 1 < 0 ? 0 : 1, weed[q % 4]); } }
    return c; });
}
/* THE SEA BED: ripple sand, a shell's fleck, a dark weed crown; silt under it */
function bedTile(x, y, top, d) {
  return once('bd' + (x & 7) + (top ? 't' : 'm' + Math.min(d, 4)), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, top ? 5 : 9) + 7);
    for (let py = 0; py < 16; py++) for (let p = 0; p < 16; p++) px2(g, p, py, sand[Math.max(0, Math.min(3, (top ? 2 : 1) + (hash(x * 16 + p, y * 16 + py) % 3) - 1 - (top ? 0 : Math.min(d, 3) >> 1)))]);
    if (top) { for (let k = 0; k < 16; k++) { const rp = 2 + Math.round(Math.sin((x * 16 + k) * 0.55) * 1.2); px2(g, k, rp, sand[3]); px2(g, k, rp + 1, sand[0]); }
      rect(g, 0, 0, 16, 2, sand[2]); for (let k = 0; k < 3; k++) px2(g, (r() * 16) | 0, 1, '#d8e6e0');
      if ((hash(x, 3) & 3) === 0) { const bx = (r() * 13) | 0; for (let q = 0; q < 6; q++) px2(g, bx + (q & 1), -q + 1 < 0 ? 0 : 1, weed[q % 4]); } }
    return c; });
}

/* THE WRECK: tarred storm timber - strakes with a butt joint every 22 px, a rib every 5th column, copper green at the waterline (row 22-23), barnacles, a treenail now and then */
function strake(ax, ay, base) {
  const course = Math.floor(ay / 4), cy = ay - course * 4, wid = 22, off = (course * 7) % wid, sx = ((ax + off) % wid + wid) % wid, pl = (Math.floor((ax + off) / wid) * 31 + course * 13) | 0, tone = (hash(pl, 4) % 3) - 1;
  if (cy === 3) return timber[0]; if (sx === 0) return timber[Math.max(0, base - 2)]; if (cy === 0) return timber[Math.max(0, Math.min(6, base + 1 + tone))];
  if (sx === 11 && cy === 1 && (hash(pl, course) & 3) === 0) return '#8a8a7a';
  const grit = (hash(ax, ay) >> 6) % 9 === 0 ? -1 : 0; return timber[Math.max(0, Math.min(6, base + tone + grit))];
}
function hullTile(x, y, up, eL, eR, d) {
  return once('hu' + (x & 7) + '_' + (y & 7) + (up ? 'u' : '') + (eL ? 'l' : '') + (eR ? 'r' : '') + Math.min(d, 3), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 7) + 71);
    for (let py = 0; py < 16; py++) for (let p = 0; p < 16; p++) px2(g, p, py, strake(x * 16 + p, y * 16 + py, d <= 1 ? 3 : 2));
    if (x % 5 === 0) { rect(g, 6, 0, 4, 16, timber[2]); rect(g, 6, 0, 1, 16, timber[4]); rect(g, 9, 0, 1, 16, timber[0]); for (let k = 2; k < 16; k += 5) px2(g, 7, k, '#8a8a7a'); }   /* a rib, treenailed */
    if (up) { rect(g, 0, 0, 16, 3, timber[5]); rect(g, 0, 0, 16, 1, timber[6]); rect(g, 0, 3, 16, 1, timber[0]); for (let k = 0; k < 3; k++) px2(g, (r() * 16) | 0, 1, '#cfe0e8'); rect(g, 0, 4, 16, 2, '#6a2a22'); rect(g, 0, 4, 16, 1, '#8a3a2a'); }   /* her covering board and a flaked red wale */
    if (y >= 22) { for (let py = 0; py < 16; py++) for (let p = 0; p < 16; p++) if ((p + ((py >> 3) & 1) * 4) % 8 === 0 || py % 8 === 0) px2(g, p, py, '#0a1814'); else if (hash((x * 16 + p) >> 3, (y * 16 + py) >> 3) % 3 === 0) px2(g, p, py, '#22604e'); else if ((p + py) % 7 !== 0) px2(g, p, py, '#143a30');
      for (let k = 0; k < 4; k++) { const bx = (r() * 14) | 0; px2(g, bx, (r() * 14) | 0, '#d6d0bc'); } for (let k = 0; k < 4; k++) { const bx = (r() * 16) | 0, l = 2 + ((r() * 5) | 0); for (let q = 0; q < l; q++) px2(g, bx + (q & 1), 15 - q, weed[q % 4]); } }
    if (eL) { rect(g, 0, 0, 2, 16, timber[5]); } if (eR) { rect(g, 14, 0, 2, 16, timber[1]); } dark(g, [0, 0.04, 0.1, 0.16][Math.min(d, 3)]);
    return c; });
}
/* SHROUDS: the wreck's standing rigging - two tarred uprights and a ratline every four pixels */
function shroudTile(x, y, upEnd, downEnd) {
  return once('sh' + (x & 3) + (y & 1) + (upEnd ? 'u' : '') + (downEnd ? 'd' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, y & 1) + 3), jit = (hash(x, y) % 3) - 1;
    for (const bx of [3 + jit, 11 + jit]) { for (let py = 0; py < 16; py++) { px2(g, bx, py, rope[(py + bx) & 1 ? 3 : 2]); px2(g, bx + 1, py, rope[1]); } px2(g, bx, 0, rope[4]); }
    for (let py = 1; py < 16; py += 4) { for (let p = 3 + jit; p <= 12 + jit; p++) px2(g, p, py, rope[(p + py) & 1 ? 3 : 2]); px2(g, 3 + jit, py, rope[4]); px2(g, 11 + jit, py, rope[4]); }
    if (upEnd) rect(g, 3 + jit, 0, 10, 1, rope[4]); if (r() < 0.25) px2(g, 7, (r() * 14) | 0, rope[4]);
    return c; });
}
/* the kelp ladder / rungs elsewhere: a wet rope ladder with wooden rungs would be off-theme, so iron-and-chain: two chains and an iron bar every four px */
function chainLadder(x, y) {
  return once('cl' + (x & 3) + (y & 1), () => {
    const [c, g] = canvas(16, 16); const jit = (hash(x, y) % 2);
    for (const bx of [4 + jit, 11 + jit]) for (let py = 0; py < 16; py++) { px2(g, bx, py, py & 1 ? iron[3] : iron[1]); px2(g, bx + 1, py, iron[0]); if (!(py & 1)) px2(g, bx - 1, py, iron[2]); }
    for (let py = 2; py < 16; py += 5) { rect(g, 4 + jit, py, 8, 2, iron[2]); rect(g, 4 + jit, py, 8, 1, iron[4]); }
    for (let k = 0; k < 3; k++) px2(g, 3 + ((hash(x, k + y) % 10)), 4 + k * 5, weed[2 + (k & 1)]);
    return c; });
}

/* a FALLEN TOWER's course: ashlar with one arrow-slit and a ragged broken head; the stone is the pilgrims' dressed stone, darker than the road, a pale scar where it sheared */
function towerTile(zone, x, y, up, eL, eR, ox) {
  return once('tw' + zone + '_' + (x & 3) + '_' + (y & 7) + (up ? 'u' : '') + (eL ? 'l' : '') + (eR ? 'r' : '') + ox, () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone], r = mulberry(hash(x & 3, y & 7) + 91);
    fillAshlar(g, zone, x, y, 3, null);
    if (up) { const prof = [0, 3, 1, 5, 2, 7, 0, 4, 2, 0, 6, 2, 4, 0, 3, 5]; for (let p = 0; p < 16; p++) { const k = prof[(p + (hash(x, 4) & 7)) % 16]; for (let py = 0; py < k + 2; py++) g.clearRect(p, py, 1, 1); px2(g, p, k + 2, Z.s[6]); px2(g, p, k + 3, Z.crust); } }
    if (!up && (y & 3) === 2 && (x & 1) === 0 && !eL && !eR) { rect(g, 7, 3, 2, 8, Z.joint); rect(g, 6, 3, 1, 8, Z.s[1]); rect(g, 9, 3, 1, 8, Z.s[5]); }   /* an arrow-slit */
    if (eL) { rect(g, 0, 0, 2, 16, Z.s[5]); } if (eR) { rect(g, 14, 0, 2, 16, Z.s[1]); }
    for (let k = 0; k < 3; k++) px2(g, (r() * 16) | 0, 2 + ((r() * 12) | 0), Z.crust); dark(g, 0.08);
    return c; });
}
/* the CHAPEL: a slate roof (overlapping scallops, a lead ridge) and buttressed walls with a lancet */
function chapelTile(zone, x, y, roof, up, eL, eR) {
  return once('ch' + (x & 3) + '_' + (y & 7) + (roof ? 'r' : '') + (up ? 'u' : '') + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[1];
    if (roof) { for (let py = 0; py < 16; py++) for (let p = 0; p < 16; p++) { const row = py >> 2, sc = ((p + (row & 1) * 4) % 8), edge = py % 4 === 3 || sc === 0; px2(g, p, py, edge ? slate[0] : slate[2 + (hash(x * 4 + (p >> 3), row + y * 4) % 3) + (sc > 5 ? 0 : 0)]); }
      if (up) { rect(g, 0, 0, 16, 2, '#4a5260'); rect(g, 0, 0, 16, 1, '#8a96a8'); } if (eL) rect(g, 0, 0, 1, 16, slate[5]); dark(g, 0.1); return c; }
    fillAshlar(g, 1, x, y, 3, null);
    if (x === 373 || x === 403) { rect(g, 6, 3, 4, 9, Z.joint); rect(g, 7, 2, 2, 1, Z.joint); rect(g, 7, 4, 2, 6, '#e8c070'); rect(g, 7, 4, 1, 6, '#ffe8a0'); rect(g, 6, 12, 4, 1, Z.s[5]); }   /* a lancet lit from inside */
    if (x === 372 || x === 404) { rect(g, 0, 0, 16, 16, Z.s[2]); fillAshlar(g, 1, x, y, 2, null); rect(g, 0, 0, 2, 16, Z.s[4]); }   /* a buttress */
    if (eL) rect(g, 0, 0, 2, 16, Z.s[5]); if (eR) rect(g, 14, 0, 2, 16, Z.s[1]); return c; });
}
/* the LIGHTHOUSE tower: whitewash, one red band, a lit window, brass at the door; its foot is granite */
function lightTile(x, y, up, eL, eR) {
  return once('lt' + (x & 7) + '_' + (y & 15) + (up ? 'u' : '') + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[3], band = (y === 9 || y === 10 || y === 14 || y === 15);
    for (let py = 0; py < 16; py++) for (let p = 0; p < 16; p++) { const sh = (x - 913) < 3 ? 1 : (x - 913) > 4 ? -1 : 0; const lo = band ? ['#4a1410', '#6e1c18', '#8a2a24', '#a8382c'] : [Z.s[3], Z.s[4], Z.s[5], Z.s[6]];
      px2(g, p, py, lo[Math.max(0, Math.min(3, 2 - sh + ((hash(x * 16 + p, y * 16 + py) % 7 === 0) ? -1 : 0) + ((py % 8 === 7) ? -2 : 0)))]); }
    if (!band && y === 11 && (x === 915 || x === 918)) { rect(g, 4, 3, 8, 10, Z.joint); rect(g, 5, 4, 6, 8, '#ffd36b'); rect(g, 5, 4, 6, 2, '#fff0b0'); rect(g, 7, 4, 1, 8, Z.joint); rect(g, 5, 8, 6, 1, Z.joint); }   /* the lit window */
    if (up) { rect(g, 0, 0, 16, 2, Z.s[6]); rect(g, 0, 2, 16, 1, Z.s[2]); }
    if (eL) rect(g, 0, 0, 2, 16, Z.crust); if (eR) { rect(g, 14, 0, 2, 16, Z.s[1]); } return c; });
}
/* THE LAMP GALLERY: iron grating round the lamp room, a rail's shadow */
function grateTile(l, r) {
  return once('gr' + (l ? 'l' : '') + (r ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 4, iron[2]); rect(g, 0, 0, 16, 1, iron[4]); rect(g, 0, 3, 16, 1, iron[0]);
    for (let k = 1; k < 16; k += 3) { rect(g, k, 1, 1, 2, iron[0]); } rect(g, 0, 4, 16, 1, iron[1]); for (let k = 2; k < 16; k += 5) px2(g, k, 0, '#c8d0dc');
    if (l) rect(g, 0, 0, 2, 4, iron[4]); if (r) rect(g, 14, 0, 2, 4, iron[1]); return c; });
}
/* A LEDGE: a stone slab on corbels (pilgrim waymark stones over the road): lit top, a chamfer, corbel brackets under every third cell */
function slabTile(zone, x, y, l, r, v) {
  return once('sl' + zone + '_' + (v) + (l ? 'l' : '') + (r ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone];
    rect(g, 0, 0, 16, 5, Z.s[4]); rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 1, 16, 1, Z.s[5]); rect(g, 0, 3, 16, 1, Z.s[3]); rect(g, 0, 4, 16, 1, Z.s[1]); rect(g, 0, 5, 16, 1, Z.joint);
    if (v === 0) { rect(g, 7, 0, 1, 5, Z.joint); } if (v === 1) { crossAt(g, 8, 2, Z.cross); }
    for (let k = 0; k < 4; k++) px2(g, hash(k + v * 7, 3) % 16, 1 + (hash(k, v) % 3), Z.s[3]);
    if (zone >= 1) { for (let k = 0; k < 16; k++) if (hash(k + v * 16, 13) % 5 === 0) px2(g, k, 0, Z.film); }
    rect(g, 2, 6, 3, 3, Z.s[2]); rect(g, 2, 6, 3, 1, Z.s[4]); rect(g, 11, 6, 3, 3, Z.s[2]); rect(g, 11, 6, 3, 1, Z.s[4]); rect(g, 3, 9, 1, 1, Z.s[1]); rect(g, 12, 9, 1, 1, Z.s[1]);   /* corbels */
    dark(g, 0.05); if (l) rect(g, 0, 0, 2, 5, Z.s[6]); if (r) rect(g, 14, 0, 2, 5, Z.s[1]); return c; });
}
/* THE UNDERSEA STONE (crypt + sea arch): green-black ashlar, voussoir seams in ceilings, silt on floors, weed streaming, a lit pocket of air has its own shine drawn live */
function underTile(x, y, up, down, eL, eR, d) {
  return once('un' + (x & 7) + '_' + (y & 7) + (up ? 'u' : '') + (down ? 'd' : '') + (eL ? 'l' : '') + (eR ? 'r' : '') + Math.min(d, 4), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 7) + 111);
    fillAshlar(g, 2, x, y, up ? 3 : 2, vault);
    if (down) { rect(g, 0, 12, 16, 4, vault[2]); rect(g, 0, 12, 16, 1, vault[4]); rect(g, 0, 15, 16, 1, vault[0]); for (let k = 3; k < 16; k += 8) { rect(g, k, 12, 1, 4, vault[0]); }   /* a vault: voussoirs */
      for (let k = 0; k < 3; k++) { const bx = (r() * 16) | 0; for (let q = 0; q < 2 + ((r() * 5) | 0); q++) px2(g, bx, 15 - q < 0 ? 0 : 15 - q, '#000000'); } }
    if (up) { rect(g, 0, 0, 16, 3, sand[2]); rect(g, 0, 0, 16, 1, sand[4]); for (let k = 0; k < 16; k++) px2(g, k, 3, sand[(k & 3) ? 1 : 0]); for (let k = 0; k < 3; k++) px2(g, (r() * 16) | 0, 0, '#c8d8d0');
      if ((hash(x, 5) & 3) === 0) { const bx = (r() * 13) | 0; for (let q = 0; q < 5; q++) px2(g, bx + (q & 1), 0, weed[q % 4]); } }
    for (let k = 0; k < 5; k++) { const bx = (r() * 16) | 0, l = 2 + ((r() * 6) | 0); for (let q = 0; q < l; q++) px2(g, bx + (q & 1), 15 - q, weed[(q + k) % 4]); }
    for (let k = 0; k < 3; k++) { const bx = (r() * 15) | 0, by = (r() * 15) | 0; px2(g, bx, by, '#8aa4a0'); }
    if (eL) rect(g, 0, 0, 2, 16, vault[5]); if (eR) { rect(g, 14, 0, 2, 16, vault[1]); }
    dark(g, [0.1, 0.12, 0.18, 0.24, 0.3][Math.min(d, 4)], '#020608'); return c; });
}
/* THE PILGRIMS' GATE: an iron-barred gate, bars every 3 px with spear heads, a cross on the lintel row, an iron-bound frame */
function gateTile(y) {
  return once('gt' + (y === 0 ? 't' : y === 23 ? 'b' : 'm') + (y & 1), () => {
    const [c, g] = canvas(16, 16); rect(g, 0, 0, 2, 16, iron[2]); rect(g, 0, 0, 1, 16, iron[4]); rect(g, 14, 0, 2, 16, iron[1]);
    for (let k = 3; k < 14; k += 3) { rect(g, k, 0, 2, 16, iron[(k / 3) & 1 ? 3 : 2]); rect(g, k, 0, 1, 16, iron[4]); }
    rect(g, 2, ((y * 5) % 12) + 2, 12, 2, iron[1]); rect(g, 2, ((y * 5) % 12) + 2, 12, 1, iron[3]);   /* a crossbar */
    for (let k = 3; k < 14; k += 3) { px2(g, k, 15, iron[4]); } if (y === 23) { rect(g, 0, 12, 16, 4, iron[2]); rect(g, 0, 12, 16, 1, iron[4]); }
    if (y === 8) { crossAt(g, 8, 8, '#e8d890'); }
    return c; });
}

export function cw3Tile(t, x, y, at, T, L) {
  void L; if (x >= REACH_X) return null;
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET || v === T.RAIL; };
  const zone = zoneOf(x);
  if (t === T.NET) { if (x >= HULL[0] - 2 && x <= HULL[1] + 2 && y <= 23 && y >= 3) return shroudTile(x, y, at(x, y - 1) !== T.NET, at(x, y + 1) !== T.NET); return chainLadder(x, y); }
  if (t === T.PORT) return gateTile(y);
  if (t === T.PLANK) { return grateTile(at(x - 1, y) !== T.PLANK, at(x + 1, y) !== T.PLANK); }
  if (t === T.ONEWAY) { const same = k => { const v = at(x + k, y); return v === T.PLANK || v === T.ONEWAY; }; return slabTile(zone, x, y, !same(-1), !same(1), ((x * 5 + y) % 3 + 3) % 3); }
  if (t !== T.SOLID) return null;
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0);
  if (y >= BED_ROW) { if (up) return bedTile(x, y, true, 0); let d = 4; for (let k = 1; k <= 3 && d === 4; k++) if (open(0, -k)) d = k; return bedTile(x, y, false, d); }
  const dep = () => { let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } } return d; };
  if (inBox(x, y, HULL)) return hullTile(x, y, up, eL, eR, dep());
  for (const tw of TOWERS) if (inBox(x, y, tw)) return towerTile(zone, x, y, up, eL, eR, tw[0]);
  if (inBox(x, y, LIGHT)) return lightTile(x, y, up, eL, eR);
  if (x >= CHAPEL[0] && x <= CHAPEL[1] && y >= CHAPEL[2] && y <= CHAPEL[3]) return chapelTile(zone, x, y, y <= 9, up, eL, eR);
  if (inBox(x, y, UNDER)) return underTile(x, y, up, down, eL, eR, dep());
  if (up) {
    if (y >= 31 && y <= 38 && ((x >= 160 && x <= 175) || (x >= 759 && x <= 766))) return mudTile(x, y, true, 0);
    if (y === ROAD_ROW) return roadTop(zone, x, y, eL, eR, {});
    if (y === 20 && x >= 359 && x <= 500) return roadTop(zone, x, y, eL, eR, { turf: true });
    if (x >= 904 && x <= 907) return roadTop(zone, x, y, eL, eR, { coping: true, brass: true });
    return copingTop(zone, x, y, eL, eR);
  }
  if (down) return ceilTile(zone, x, y, eL, eR);
  if ((x >= 160 && x <= 175 && y >= 32) || (x >= 759 && x <= 766 && y >= 32)) { let d = 4; for (let k = 1; k <= 3 && d === 4; k++) if (open(0, -k)) d = k; return mudTile(x, y, false, d); }
  if (eL || eR) return faceTile(zone, x, y, eL, eR);
  return massTile(zone, x, y, dep());
}
