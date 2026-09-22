// mage_world.js — THE MAGE'S FOLLY: the tower's skins, its rooms, its furniture and the things the potions work on.
// A TOWER INTERIOR: violet-grey stone, brass, glass, violet light. The readability rules: every ledge top carries a lit
// course (main.js edgeLit), no footing darker than the wall behind it, and the fonts, arches, glyphs and cracks all wear
// their own glow so they can be found from across the room. Standing props: the bottom row is the ground contact.
//
// BACKGROUNDS (tileable, transparent above the silhouette)
//   bakeSkyMage(h)          1 x h  a deep violet night, greener at the horizon where his spills have got into the air
//   bakeFarMage(w, h)       320x90  the fields below the hill, far hedges, a moon-lit mist; horizon row ~52
//   bakeMidMage(w, h)       480x140 the garden walls and the yews of the grounds, the tower's outer wall on the right
//   bakeNearMage(w, h)      640x300 yew trunks and hedge tops
// SKINS (16x16, three variants each)   bakeTowerSkins() -> { tower, gate, hedge, hedgeTop, ice, crack, hole }
// ROOM PAINTS   paintRoom(g, st, sx, sy, w, h, tx0) draws a room's back wall: 'library', 'reading', 'orrery', 'clock', 'lab', 'flip', 'dome'
// PROPS (bottom row = ground unless said)
//   bakeGlyph()             28x8    a rune circle on the floor (drawn flipped on a ceiling): it turns the room over
//   bakePlate()             [up, down] 22x6   the counterweight, struck: up on its chain, then dropped
//   bakeVatSpit()           [rest, bubble, spit] 18x16   a brass tap on the vat's rim
//   bakeRunePlate()         [dark, lit] 10x10   the rune on a stack's face
//   bakeBook()              [open A, open B] 28x10   a flying book seen from the side, the platform is its spine
//   bakePlanet(v)           22x22   four worlds (banded, ringed, red, moon)   bakeHub() 18x18
//   bakeOrb()               8x8     a turret's slow orb   bakeGob() 8x8   a vat's gob
//   DECO: bakeUrn 16x22, bakeSundial 18x14, bakeStall 44x34, bakeIvy 24x30, bakeLamppost(lit) 10x32, bakeLectern 14x20,
//         bakeBookpile(v) 18x10, bakeCandelabra 14x26, bakeNest 30x10, bakeGlobe 16x20, bakeCauldron 24x18, bakeBench 40x18,
//         bakeJars(v) 22x14, bakeRetorts 26x18, bakeWineRack(v) 32x22, bakeStill 26x30, bakeOrreryBase 52x26, bakeDesk 30x16,
//         bakeChimneypot(v) 10x16, bakeTelescope 44x44, bakeStarChart 24x18 (hung: top row = the ceiling),
//         bakeReadingDesk 38x20, bakeGears 40x34, bakeClockface 44x46 (hung)
import { canvas, px, rect, fillPoly, line, circle, outline, mulberry } from '../px.js';
import { OUT } from '../art.js';

export const VIOLET = ['#3a1c5a', '#7a3fbf', '#b07cf0', '#e0c8ff'];
export const FORM_COL = { mouse: ['#1e3a7a', '#3f7fdf', '#8ac0ff', '#d8ecff'], bat: ['#3a1c5a', '#7a3fbf', '#b07cf0', '#e0c8ff'], golem: ['#6a3a10', '#c07a20', '#f0b040', '#ffe8a0'] };
const BRASS = ['#5a3c14', '#a8782a', '#e0b050', '#fff0b0'];
const STONE = ['#2e2838', '#4a4258', '#6a6280', '#8e86a4', '#b8b0cc'];
const WOOD = ['#3a2410', '#6a4420', '#9a6a34', '#c89a5c'];
const GLASS = ['#3a5a7a', '#7aa0c0', '#c0e0f0', '#ffffff'];
const LEAF = ['#1e3a22', '#2e5a30', '#4a8a44', '#8ac060'];

// ---------- backgrounds ----------
export function bakeSkyMage(h) {
  const [c, g] = canvas(1, h);
  const bands = [[0, '#0c0a1e'], [0.3, '#181232'], [0.55, '#2a1c4a'], [0.75, '#3a2a5e'], [0.88, '#345048'], [1, '#2e5a44']];
  for (let y = 0; y < h; y++) { const t = y / h; let a = bands[0], b = bands[1]; for (let i = 1; i < bands.length; i++) if (t >= bands[i - 1][0]) { a = bands[i - 1]; b = bands[i]; } px(g, 0, y, t < (a[0] + b[0]) / 2 ? a[1] : b[1]); }
  return c;
}
export function bakeFarMage(w, h, seed = 3) {
  const [c, g] = canvas(w, h), r = mulberry(seed);
  /* the mist over the fields, then the far hedges and a few farm roofs, all in the tower's violet */
  for (let y = 52; y < h; y++) { g.fillStyle = y < 60 ? '#2c2448' : y < 72 ? '#252040' : '#1e1a34'; g.fillRect(0, y, w, 1); }
  g.fillStyle = '#3a3060'; for (let i = 0; i < 40; i++) { const x = (i * 53 + Math.floor(r() * 9)) % w; g.fillRect(x, 50 + Math.floor(r() * 3), 6 + Math.floor(r() * 10), 3); }
  for (let i = 0; i < 9; i++) { const x = (i * 41 + 12) % w, hh = 5 + Math.floor(r() * 5); g.fillStyle = '#16122a'; g.fillRect(x, 54 - hh, 9, hh + 6); g.fillStyle = '#221c3c'; fillPoly(g, [[x - 1, 54 - hh], [x + 4, 50 - hh], [x + 10, 54 - hh]], '#221c3c'); }
  g.fillStyle = '#2a2450'; for (let x = 0; x < w; x += 7) g.fillRect(x, 60 + Math.floor(r() * 4), 4, 1);
  return c;
}
export function bakeMidMage(w, h, seed = 5) {
  const [c, g] = canvas(w, h), r = mulberry(seed), gl = 116;
  /* the garden wall, with yews behind it and urns along it */
  g.fillStyle = '#1a1630'; g.fillRect(0, gl - 26, w, h - gl + 26);
  for (let i = 0; i < 14; i++) { const x = (i * 37 + Math.floor(r() * 12)) % w, hh = 30 + Math.floor(r() * 26); g.fillStyle = '#141028'; fillPoly(g, [[x, gl - 24], [x + 7, gl - 24 - hh], [x + 14, gl - 24]], '#141028'); g.fillStyle = '#1c1834'; fillPoly(g, [[x + 3, gl - 24], [x + 7, gl - 20 - hh], [x + 9, gl - 24]], '#1c1834'); }
  g.fillStyle = '#24203e'; g.fillRect(0, gl - 26, w, 2); for (let x = 0; x < w; x += 48) { g.fillStyle = '#2c2848'; g.fillRect(x + 20, gl - 34, 6, 8); g.fillRect(x + 18, gl - 36, 10, 2); }
  g.fillStyle = '#1e1a36'; for (let x = 0; x < w; x += 9) g.fillRect(x, gl - 26 + ((x / 9) % 2) * 5, 8, 4);
  return c;
}
export function bakeNearMage(w, h, seed = 7) {
  const [c, g] = canvas(w, h), r = mulberry(seed);
  for (let i = 0; i < 10; i++) { const x = (i * 67 + Math.floor(r() * 20)) % w; g.fillStyle = '#100c20'; g.fillRect(x, 60, 10, h - 60); for (let k = 0; k < 5; k++) { const y = 70 + k * 40; g.fillRect(x - 12 + (k % 2) * 20, y, 14, 4); } g.fillStyle = '#181430'; g.fillRect(x + 2, 60, 2, h - 60); }
  g.fillStyle = '#0e0a1c'; g.fillRect(0, h - 30, w, 30); g.fillStyle = '#16122a'; for (let x = 0; x < w; x += 6) g.fillRect(x, h - 30 - (x % 3) * 2, 5, 4);
  return c;
}

// ---------- skins and tiles ----------
export function bakeTowerSkins() {
  const tile = (fn) => [0, 1, 2].map(v => { const [c, g] = canvas(16, 16); fn(g, v); return c; });
  const tower = tile((g, v) => { g.fillStyle = '#4a4258'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a3448'; g.fillRect(0, 7, 16, 1); g.fillRect(0, 15, 16, 1); g.fillRect((v * 5 + 3) % 16, 0, 1, 7); g.fillRect((v * 5 + 11) % 16, 8, 1, 7); g.fillStyle = '#5e5670'; g.fillRect(1, 0, 6, 1); g.fillRect(9, 8, 5, 1); if (v === 1) { g.fillStyle = '#3f3852'; g.fillRect(4, 3, 2, 1); } });
  const gate = tile((g, v) => { g.fillStyle = '#2e2838'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#221c2c'; g.fillRect(0, 7, 16, 1); g.fillRect(0, 15, 16, 1); g.fillRect((v * 7 + 2) % 16, 0, 1, 7); g.fillRect((v * 7 + 9) % 16, 8, 1, 7); g.fillStyle = '#3e3850'; g.fillRect(2, 0, 5, 1); g.fillRect(10, 8, 4, 1); });
  const hedge = tile((g, v) => { g.fillStyle = LEAF[1]; g.fillRect(0, 0, 16, 16); for (let i = 0; i < 14; i++) { const x = (i * 7 + v * 3) % 16, y = (i * 5 + v) % 16; g.fillStyle = (i + v) % 3 ? LEAF[0] : LEAF[2]; g.fillRect(x, y, 2, 1); g.fillRect(x + 1, y + 1, 1, 1); } });
  const hedgeTop = tile((g, v) => { g.fillStyle = LEAF[1]; g.fillRect(0, 2, 16, 14); g.fillStyle = LEAF[2]; for (let x = 0; x < 16; x += 3) g.fillRect(x + (v % 2), 1 + ((x / 3 + v) % 2), 2, 2); g.fillStyle = LEAF[3]; g.fillRect(0, 2, 16, 1); for (let i = 0; i < 8; i++) { const x = (i * 5 + v * 2) % 16, y = 6 + (i * 3) % 9; g.fillStyle = i % 2 ? LEAF[0] : LEAF[2]; g.fillRect(x, y, 2, 1); } });
  const ice = tile((g, v) => { g.fillStyle = '#9ad0e8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#e8f8ff'; g.fillRect(0, 0, 16, 2); g.fillStyle = '#6aa8c8'; g.fillRect(0, 14, 16, 2); g.fillRect((v * 6 + 2) % 16, 3, 1, 10); g.fillStyle = '#c8ecff'; g.fillRect((v * 6 + 8) % 16, 4, 1, 6); });
  const crack = tile((g, v) => { g.fillStyle = '#4a4258'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#5e5670'; g.fillRect(0, 0, 16, 1); g.fillStyle = '#1b1626'; line(g, 2 + v, 1, 7 + v, 8, '#1b1626'); line(g, 7 + v, 8, 4 + v, 15, '#1b1626'); line(g, 7 + v, 8, 13, 11, '#1b1626'); line(g, 9, 1, 11 - v, 5, '#1b1626'); g.fillStyle = FORM_COL.golem[1]; g.fillRect(6 + v, 7, 2, 1); g.fillRect(3 + v, 12, 1, 1); });
  const hole = tile((g, v) => { g.fillStyle = '#2e2838'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1b1626'; g.fillRect(2, 4, 12, 10); g.fillStyle = '#221c2c'; g.fillRect(2, 4, 12, 2); g.fillStyle = FORM_COL.mouse[1]; g.fillRect(3 + v, 12, 2, 1); g.fillRect(10 - v, 13, 2, 1); });
  return { tower, gate, hedge, hedgeTop, ice, crack, hole };
}

// ---------- the rooms' back walls ----------
const xC = (i, sx, w) => sx + 34 + i * 76;   /* where the clock gallery's wheels sit across its wall */
export function paintRoom(g, st, sx, sy, w, h, tx0, time) {
  const hsh = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233 + tx0 * 0.7) * 43758.5453; return v - Math.floor(v); };
  if (st === 'library') {   /* stacks to the ceiling in the wall itself: shelves every 12 rows, the spines in reds, greens and violets */
    g.fillStyle = '#2a2236'; g.fillRect(sx, sy, w, h);
    const cols = ['#5a2a3a', '#2a4a3a', '#3a2a5a', '#5a4a2a', '#2a3a5a', '#4a2a2a'];
    for (let yy = sy + 6; yy < sy + h; yy += 12) { g.fillStyle = '#4a3624'; g.fillRect(sx, yy + 9, w, 2);
      /* THE SPINES BELONG TO THE WALL, NOT TO THE SCREEN: hashing the screen x re-rolled every book as the camera moved (the monastery's
         scriptorium had the same crawl). The world x is the region's tile origin plus how far into the region the spine stands. */
      for (let xx = sx; xx < sx + w; xx += 3) { const k = hsh(tx0 * 16 + (xx - sx), yy - sy); if (k < 0.12) continue; g.fillStyle = cols[Math.floor(k * cols.length)]; const bh = 6 + Math.floor(k * 3); g.fillRect(xx, yy + 9- bh, 2, bh); if (k > 0.8) { g.fillStyle = '#a88a48'; g.fillRect(xx, yy + 9 - bh + 2, 2, 1); } } }
    /* the pilasters between the stacks belong to the wall too, but a room is drawn with no clip round it: take the PHASE from the world
       and still start at sx, or the first pilaster paints over whatever stands to the left of the room */
    g.fillStyle = '#1e1828'; { const ph = (((tx0 * 16) % 96) + 96) % 96; for (let xx = sx + ((40 - ph) % 96 + 96) % 96; xx < sx + w; xx += 96) g.fillRect(xx, sy, 4, h); }
    return true; }
  if (st === 'lab') {   /* white tiles gone yellow, pipes across the top, stains */
    g.fillStyle = '#4a4a52'; g.fillRect(sx, sy, w, h);
    for (let yy = sy; yy < sy + h; yy += 8) for (let xx = sx + ((yy / 8) % 2 ? 4 : 0); xx < sx + w; xx += 8) { const k = hsh(xx, yy); g.fillStyle = k < 0.7 ? '#6a6a72' : k < 0.85 ? '#5e5a60' : '#7a7860'; g.fillRect(xx, yy, 7, 7); }
    g.fillStyle = BRASS[0]; g.fillRect(sx, sy + 10, w, 3); g.fillStyle = BRASS[1]; g.fillRect(sx, sy + 10, w, 1); for (let xx = sx + 20; xx < sx + w; xx += 64) { g.fillStyle = BRASS[0]; g.fillRect(xx, sy + 10, 3, 24); g.fillStyle = BRASS[2]; g.fillRect(xx, sy + 10, 1, 24); }
    g.fillStyle = 'rgba(122,63,191,0.18)'; for (let xx = sx + 30; xx < sx + w; xx += 110) { g.fillRect(xx, sy + h - 30, 12, 30); g.fillRect(xx + 4, sy + h - 44, 5, 14); }
    return true; }
  if (st === 'orrery') {   /* the dome: dark blue with the constellations painted on it, brass ribs */
    g.fillStyle = '#1c2446'; g.fillRect(sx, sy, w, h);
    for (let i = 0; i < w * h / 260; i++) { const rx = sx + ((i * 97 + 13) % w), ry = sy + ((i * 61 + 7) % h); g.fillStyle = (i % 5) ? '#3a4a7a' : '#8aa0d0'; g.fillRect(rx, ry, 1, 1); }
    g.fillStyle = BRASS[0]; for (let xx = sx + 24; xx < sx + w; xx += 72) g.fillRect(xx, sy, 3, h); g.fillStyle = BRASS[1]; for (let xx = sx + 24; xx < sx + w; xx += 72) g.fillRect(xx, sy, 1, h);
    g.fillStyle = '#2a3660'; g.fillRect(sx, sy + h - 24, w, 24); g.fillStyle = '#3a4a80'; for (let xx = sx; xx < sx + w; xx += 16) g.fillRect(xx, sy + h - 24, 15, 1);
    return true; }
  if (st === 'flip') {   /* bare stone, and the runes of the spell that went wrong burnt into it, some of them upside down */
    g.fillStyle = '#3a3448'; g.fillRect(sx, sy, w, h);
    g.fillStyle = '#2e2838'; for (let yy = sy + 7; yy < sy + h; yy += 16) g.fillRect(sx, yy, w, 1);
    for (let xx = sx + 10; xx < sx + w; xx += 28) { const k = hsh(xx, 3), yy = sy + 10 + Math.floor(k * (h - 30)); g.fillStyle = k < 0.5 ? VIOLET[1] : '#b04040'; g.fillRect(xx, yy, 5, 1); g.fillRect(xx + 2, yy - 3, 1, 7); g.fillRect(xx, yy + 3, 5, 1); if (k > 0.7) g.fillRect(xx + 4, yy - 3, 1, 3); }
    return true; }
  if (st === 'reading') {   /* THE READING ROOM: oak panelling to waist height, plaster over it, tall shuttered windows, a frieze of copied letters */
    g.fillStyle = '#332a3e'; g.fillRect(sx, sy, w, h);
    g.fillStyle = '#3e3448'; for (let yy = sy + 5; yy < sy + h; yy += 26) g.fillRect(sx, yy, w, 13);            /* the plaster courses */
    for (let xx = sx + 8; xx < sx + w; xx += 84) {                                                              /* the windows: shuttered, a little night through the slats */
      const k = hsh(tx0 * 16 + (xx - sx), 11), yy = sy + 14 + Math.floor(k * 10);
      g.fillStyle = '#1b1626'; g.fillRect(xx, yy, 22, 46); g.fillStyle = WOOD[1]; g.fillRect(xx - 2, yy - 2, 26, 3); g.fillRect(xx - 2, yy + 46, 26, 3);
      for (let s2 = 0; s2 < 7; s2++) { g.fillStyle = s2 % 2 ? WOOD[2] : WOOD[1]; g.fillRect(xx, yy + 3 + s2 * 6, 22, 5); }
      g.fillStyle = 'rgba(176,124,240,0.16)'; g.fillRect(xx + 2, yy + 3, 18, 40); }
    g.fillStyle = WOOD[0]; g.fillRect(sx, sy + h - 34, w, 34);                                                  /* the panelling */
    g.fillStyle = WOOD[1]; for (let xx = sx; xx < sx + w; xx += 20) g.fillRect(xx, sy + h - 34, 2, 34);
    g.fillStyle = WOOD[2]; g.fillRect(sx, sy + h - 36, w, 2);
    g.fillStyle = '#6a5a80'; for (let xx = sx + 3; xx < sx + w; xx += 6) { const k = hsh(tx0 * 16 + (xx - sx), 29); if (k < 0.3) continue; g.fillRect(xx, sy + h - 44, 3, 1); if (k > 0.66) g.fillRect(xx, sy + h - 42, 2, 1); }   /* the frieze: a line of copied letters, too far off to read */
    return true; }
  if (st === 'clock') {   /* THE PENDULUM GALLERY: the back of the clock - a dark case, its great wheels turning behind the work */
    g.fillStyle = '#241f30'; g.fillRect(sx, sy, w, h);
    g.fillStyle = '#2e2838'; for (let yy = sy; yy < sy + h; yy += 24) g.fillRect(sx, yy, w, 2);
    const t2 = (time || 0) * 0.35;
    for (let i = 0; xC(i, sx, w) < sx + w; i++) {                                                               /* the wheels, each turning a little slower than the last */
      const cxw = xC(i, sx, w), cyw = sy + 30 + ((i % 3) * 46), r = 22 - (i % 3) * 5, a0 = t2 / (1 + i % 3) * (i % 2 ? -1 : 1);
      g.strokeStyle = BRASS[0]; g.lineWidth = 3; g.beginPath(); g.arc(cxw, cyw, r, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = BRASS[1]; g.lineWidth = 1; g.beginPath(); g.arc(cxw, cyw, r, 0, Math.PI * 2); g.stroke();
      for (let k = 0; k < 8; k++) { const a = a0 + k * Math.PI / 4; g.beginPath(); g.moveTo(cxw, cyw); g.lineTo(cxw + Math.cos(a) * r, cyw + Math.sin(a) * r); g.stroke();
        g.fillStyle = BRASS[2]; g.fillRect(Math.round(cxw + Math.cos(a) * (r + 2)) - 1, Math.round(cyw + Math.sin(a) * (r + 2)) - 1, 2, 2); }   /* the teeth */
      g.fillStyle = BRASS[2]; g.fillRect(cxw - 2, cyw - 2, 4, 4); }
    g.lineWidth = 1; g.fillStyle = 'rgba(0,0,0,0.30)'; g.fillRect(sx, sy, w, h);                                /* the case shuts it all back into the dark */
    g.fillStyle = STONE[1]; for (let xx = sx + 6; xx < sx + w; xx += 58) g.fillRect(xx, sy, 5, h);              /* the case's uprights */
    return true; }
  if (st === 'dome') {   /* the observatory: night through the glass, brass ribs, the stars turning */
    g.fillStyle = '#363064'; g.fillRect(sx, sy, w, h);   /* night through the glass, but lit by the moon on it: a black dome read as no room at all */
    const t = (time || 0) * 0.02;
    for (let i = 0; i < w * h / 200; i++) { const rx = sx + ((i * 97 + Math.floor(t * 40)) % w), ry = sy + ((i * 61 + 7) % h); g.fillStyle = (i % 7) ? '#3a4a8a' : '#c8d8ff'; g.fillRect(rx, ry, 1, 1); }
    g.fillStyle = 'rgba(122,63,191,0.12)'; g.fillRect(sx, sy, w, Math.floor(h * 0.3));
    g.fillStyle = BRASS[0]; for (let xx = sx + 16; xx < sx + w; xx += 56) g.fillRect(xx, sy, 4, h); g.fillStyle = BRASS[2]; for (let xx = sx + 16; xx < sx + w; xx += 56) g.fillRect(xx + 1, sy, 1, h);
    g.fillStyle = BRASS[0]; g.fillRect(sx, sy + 12, w, 3); g.fillStyle = BRASS[1]; g.fillRect(sx, sy + 12, w, 1);
    return true; }
  return false;
}

// ---------- the tower's machinery ----------
export function bakeGlyph() {
  const [c, g] = canvas(28, 8);
  for (let x = 0; x < 28; x++) { const d = Math.abs(x - 13.5) / 14, y = 3 + Math.round(Math.sqrt(1 - d * d) * 3); g.fillStyle = VIOLET[2]; g.fillRect(x, 3 - (y - 3), 1, 1); g.fillRect(x, y, 1, 1); }
  rect(g, 12, 1, 4, 6, VIOLET[1]); rect(g, 10, 3, 8, 2, VIOLET[3]); rect(g, 13, 0, 2, 1, VIOLET[3]); rect(g, 13, 7, 2, 1, VIOLET[3]);
  return c;
}
export function bakePlate() {
  return [0, 1].map(down => { const [c, g] = canvas(22, 6); rect(g, 0, 4, 22, 2, STONE[1]); rect(g, 2, down ? 3 : 1, 18, down ? 2 : 4, BRASS[1]); rect(g, 2, down ? 3 : 1, 18, 1, BRASS[2]); rect(g, 3, 5, 16, 1, BRASS[0]); if (!down) { rect(g, 9, 2, 4, 2, FORM_COL.golem[2]); } return outline(c, OUT); });
}
export function bakeVatSpit() {
  return ['rest', 'bubble', 'spit'].map(k => { const [c, g] = canvas(18, 16);
    rect(g, 2, 13, 14, 3, BRASS[1]); rect(g, 2, 13, 14, 1, BRASS[2]); rect(g, 6, 6, 6, 8, BRASS[1]); rect(g, 6, 6, 1, 8, BRASS[2]); rect(g, 11, 6, 1, 8, BRASS[0]);
    rect(g, 4, 3, 10, 4, BRASS[1]); rect(g, 4, 3, 10, 1, BRASS[2]); rect(g, 13, 4, 4, 2, BRASS[0]); rect(g, 13, 4, 4, 1, BRASS[2]);
    if (k === 'bubble') { rect(g, 15, 1, 2, 2, '#b07cf0'); rect(g, 16, 0, 1, 1, '#e0c8ff'); rect(g, 13, 0, 1, 1, '#b07cf0'); }
    if (k === 'spit') { rect(g, 16, 2, 2, 2, '#7a3fbf'); }
    return outline(c, OUT); });
}
export function bakeRunePlate() { return [0, 1].map(lit => { const [c, g] = canvas(10, 10); rect(g, 0, 0, 10, 10, STONE[3]); rect(g, 1, 1, 8, 8, lit ? VIOLET[2] : STONE[1]); rect(g, 4, 2, 2, 6, lit ? VIOLET[3] : VIOLET[1]); rect(g, 2, 4, 6, 2, lit ? VIOLET[3] : VIOLET[1]); rect(g, 2, 2, 1, 1, lit ? VIOLET[3] : VIOLET[0]); rect(g, 7, 7, 1, 1, lit ? VIOLET[3] : VIOLET[0]); return outline(c, OUT); }); }
export function bakeBook() {
  return [0, 1].map(v => { const [c, g] = canvas(28, 10); const f = v ? 2 : 0;
    fillPoly(g, [[1, 2 + f], [14, 6], [27, 2 + f], [27, 8], [14, 9], [1, 8]], '#e8dcc0'); rect(g, 13, 5, 2, 5, WOOD[1]); rect(g, 1, 7, 26, 2, '#c8b898');
    fillPoly(g, [[1, 8], [14, 9], [27, 8], [27, 9], [14, 10], [1, 9]], '#5a2a3a'); for (let x = 3; x < 12; x += 3) rect(g, x, 4 + f, 2, 1, '#8a8070'); for (let x = 16; x < 25; x += 3) rect(g, x, 4 + f, 2, 1, '#8a8070');
    rect(g, 1, 2 + f, 12, 1, '#fff6e0'); rect(g, 15, 2 + f, 12, 1, '#fff6e0');
    return outline(c, OUT); });
}
export function bakePlanet(v) {
  const [c, g] = canvas(22, 22), pal = [['#6a3a10', '#c07a20', '#f0b040'], ['#1e3a7a', '#3f7fdf', '#8ac0ff'], ['#7a1020', '#c03040', '#ff8080'], ['#5a5a6a', '#9a9aa8', '#d0d0e0']][v % 4];
  circle(g, 11, 11, 9, pal[1], pal[0]); for (let y = 3; y < 19; y += 1) { const d = Math.abs(y - 11) / 9, hw = Math.sqrt(Math.max(0, 1 - d * d)) * 9; if ((y + v) % 4 === 0) rect(g, Math.round(11 - hw) + 1, y, Math.round(hw * 2) - 2, 1, pal[2]); }
  circle(g, 8, 8, 3, pal[2]); if (v === 1) { rect(g, 0, 10, 22, 2, BRASS[2]); rect(g, 0, 10, 22, 1, BRASS[3]); }
  return outline(c, OUT);
}
export function bakeHub() { const [c, g] = canvas(18, 18); circle(g, 9, 9, 8, BRASS[1], BRASS[0]); circle(g, 9, 9, 4, BRASS[2]); circle(g, 8, 8, 2, BRASS[3]); for (let k = 0; k < 8; k++) rect(g, 9 + Math.round(Math.cos(k * 0.785) * 6) - 1, 9 + Math.round(Math.sin(k * 0.785) * 6) - 1, 2, 2, BRASS[0]); return outline(c, OUT); }
export function bakeOrb() { const [c, g] = canvas(8, 8); circle(g, 4, 4, 3.5, VIOLET[1]); circle(g, 4, 4, 2, VIOLET[2]); px(g, 3, 3, VIOLET[3]); return c; }
export function bakeGob() { const [c, g] = canvas(8, 8); circle(g, 4, 4, 3.5, '#6a2a9a'); circle(g, 4, 4, 2, '#9a4ad0'); px(g, 3, 3, '#e0c8ff'); return c; }

// ---------- deco ----------
export function bakeUrn() { const [c, g] = canvas(16, 22); rect(g, 3, 19, 10, 3, STONE[2]); rect(g, 5, 14, 6, 5, STONE[1]); fillPoly(g, [[2, 6], [14, 6], [12, 14], [4, 14]], STONE[2]); rect(g, 2, 6, 12, 1, STONE[4]); rect(g, 3, 7, 1, 6, STONE[3]); for (let i = 0; i < 7; i++) { const x = 1 + i * 2, y = 2 + (i % 3); rect(g, x, y, 3, 3, i % 2 ? LEAF[2] : LEAF[1]); } rect(g, 5, 0, 6, 2, LEAF[2]); return outline(c, OUT); }
export function bakeSundial() { const [c, g] = canvas(18, 14); rect(g, 4, 11, 10, 3, STONE[2]); rect(g, 7, 6, 4, 5, STONE[1]); rect(g, 1, 4, 16, 3, STONE[3]); rect(g, 1, 4, 16, 1, STONE[4]); line(g, 9, 4, 13, 0, BRASS[2]); for (let x = 3; x < 16; x += 3) px(g, x, 5, STONE[1]); return outline(c, OUT); }
export function bakeStall() { const [c, g] = canvas(44, 34); rect(g, 2, 30, 40, 4, WOOD[1]); rect(g, 2, 20, 40, 10, WOOD[1]); rect(g, 2, 20, 40, 2, WOOD[3]); for (let x = 4; x < 40; x += 6) rect(g, x, 23, 1, 6, WOOD[0]); rect(g, 4, 6, 3, 14, WOOD[1]); rect(g, 37, 6, 3, 14, WOOD[1]); fillPoly(g, [[0, 8], [22, 0], [44, 8], [44, 12], [0, 12]], '#5a2a7a'); for (let x = 0; x < 44; x += 8) rect(g, x, 8, 4, 4, '#a880e0'); rect(g, 10, 15, 6, 5, BRASS[1]); rect(g, 20, 16, 4, 4, FORM_COL.mouse[1]); rect(g, 27, 14, 5, 6, GLASS[1]); return outline(c, OUT); }
export function bakeIvy() { const [c, g] = canvas(24, 30); const r = mulberry(9); for (let i = 0; i < 50; i++) { const x = Math.floor(r() * 22), y = Math.floor(r() * 28); rect(g, x, y, 3, 2, i % 3 ? LEAF[1] : LEAF[2]); } line(g, 4, 30, 8, 2, LEAF[0]); line(g, 18, 30, 12, 4, LEAF[0]); return c; }
export function bakeLamppost(lit) { const [c, g] = canvas(10, 32); rect(g, 3, 28, 4, 4, '#2a2a34'); rect(g, 4, 8, 2, 20, '#3a3a44'); rect(g, 2, 6, 6, 2, '#2a2a34'); rect(g, 1, 0, 8, 7, '#3a3a44'); rect(g, 2, 1, 6, 5, lit ? VIOLET[3] : '#1b1626'); if (lit) rect(g, 4, 2, 2, 3, '#ffffff'); rect(g, 3, 0, 4, 1, '#5a5a64'); return outline(c, OUT); }
export function bakeLectern() { const [c, g] = canvas(14, 20); rect(g, 3, 17, 8, 3, WOOD[1]); rect(g, 6, 8, 2, 9, WOOD[1]); fillPoly(g, [[1, 6], [13, 3], [13, 8], [1, 11]], WOOD[2]); rect(g, 3, 4, 8, 3, '#e8dcc0'); rect(g, 4, 5, 6, 1, '#8a8070'); return outline(c, OUT); }
export function bakeBookpile(v) { const [c, g] = canvas(18, 10); const cols = ['#5a2a3a', '#2a4a3a', '#3a2a5a', '#5a4a2a']; for (let i = 0; i < 4; i++) { const y = 8 - i * 2, x = 2 + ((i + v) % 2) * 2, w = 12 - (i % 2) * 2; rect(g, x, y, w, 2, cols[(i + v) % 4]); rect(g, x, y, w, 1, '#e8dcc0'); } return outline(c, OUT); }
export function bakeCandelabra() { const [c, g] = canvas(14, 26); rect(g, 4, 23, 6, 3, BRASS[1]); rect(g, 6, 12, 2, 11, BRASS[1]); rect(g, 1, 10, 12, 2, BRASS[1]); for (const x of [1, 6, 11]) { rect(g, x, 4, 2, 6, '#e8e0c8'); rect(g, x, 1, 2, 3, '#ffd36b'); px(g, x, 0, '#fff6c8'); } return outline(c, OUT); }
export function bakeNest() { const [c, g] = canvas(30, 10); const r = mulberry(21); fillPoly(g, [[0, 9], [4, 3], [26, 3], [30, 9]], WOOD[1]); for (let i = 0; i < 40; i++) { const x = Math.floor(r() * 28), y = 3 + Math.floor(r() * 6); rect(g, x, y, 3, 1, i % 2 ? WOOD[2] : WOOD[0]); } rect(g, 11, 0, 3, 3, VIOLET[2]); rect(g, 17, 1, 3, 3, VIOLET[2]); rect(g, 14, 2, 2, 2, '#e8dcc0'); return outline(c, OUT); }
export function bakeGlobe() { const [c, g] = canvas(16, 20); rect(g, 5, 17, 6, 3, BRASS[1]); rect(g, 7, 12, 2, 5, BRASS[1]); circle(g, 8, 7, 6, '#2e5a88', '#3f7fdf'); fillPoly(g, [[4, 5], [9, 3], [11, 8], [6, 9]], LEAF[2]); line(g, 8, 0, 8, 14, BRASS[2]); return outline(c, OUT); }
export function bakeCauldron() { const [c, g] = canvas(24, 18); rect(g, 4, 15, 16, 3, '#2a2a34'); fillPoly(g, [[2, 6], [22, 6], [20, 15], [4, 15]], '#3a3a44'); rect(g, 2, 6, 20, 2, '#5a5a64'); rect(g, 4, 4, 16, 3, VIOLET[1]); rect(g, 6, 4, 4, 1, VIOLET[3]); rect(g, 14, 4, 3, 1, VIOLET[2]); rect(g, 8, 1, 2, 2, VIOLET[2]); rect(g, 15, 0, 2, 2, VIOLET[2]); return outline(c, OUT); }
export function bakeBench() { const [c, g] = canvas(40, 18); rect(g, 2, 15, 3, 3, WOOD[1]); rect(g, 35, 15, 3, 3, WOOD[1]); rect(g, 0, 11, 40, 4, WOOD[2]); rect(g, 0, 11, 40, 1, WOOD[3]); rect(g, 4, 5, 4, 6, GLASS[1]); rect(g, 5, 4, 2, 1, BRASS[1]); rect(g, 12, 7, 6, 4, VIOLET[1]); rect(g, 22, 3, 3, 8, GLASS[2]); rect(g, 22, 8, 3, 3, FORM_COL.golem[1]); rect(g, 29, 6, 5, 5, '#e8dcc0'); rect(g, 30, 7, 3, 1, '#8a8070'); return outline(c, OUT); }
export function bakeJars(v) { const [c, g] = canvas(22, 14); rect(g, 0, 11, 22, 3, WOOD[2]); rect(g, 0, 11, 22, 1, WOOD[3]); const cs = v ? [FORM_COL.mouse[1], VIOLET[1], '#4a8a44'] : [VIOLET[1], FORM_COL.golem[1], '#c04a7a']; for (let i = 0; i < 3; i++) { const x = 2 + i * 7; rect(g, x, 3, 5, 8, GLASS[0]); rect(g, x + 1, 6, 3, 4, cs[i]); rect(g, x + 1, 3, 1, 7, GLASS[2]); rect(g, x + 1, 1, 3, 2, '#4a3020'); } return outline(c, OUT); }
export function bakeRetorts() { const [c, g] = canvas(26, 18); rect(g, 0, 15, 26, 3, WOOD[2]); rect(g, 0, 15, 26, 1, WOOD[3]); circle(g, 7, 10, 5, GLASS[0]); circle(g, 7, 11, 3, VIOLET[1]); rect(g, 6, 2, 2, 5, GLASS[1]); line(g, 8, 4, 18, 8, GLASS[1]); rect(g, 17, 8, 5, 7, GLASS[0]); rect(g, 18, 12, 3, 3, VIOLET[2]); rect(g, 5, 9, 1, 1, GLASS[3]); return outline(c, OUT); }
export function bakeWineRack(v) { const [c, g] = canvas(32, 22); rect(g, 0, 0, 32, 22, WOOD[0]); for (let y = 0; y < 22; y += 7) rect(g, 0, y, 32, 1, WOOD[2]); for (let x = 0; x < 32; x += 8) rect(g, x, 0, 1, 22, WOOD[2]); for (let y = 2; y < 22; y += 7) for (let x = 2; x < 32; x += 8) { if ((x + y + v) % 3 === 0) continue; circle(g, x + 3, y + 2, 2, '#2a1a3a'); px(g, x + 2, y + 1, '#5a2a5a'); } return outline(c, OUT); }
export function bakeStill() { const [c, g] = canvas(26, 30); rect(g, 2, 27, 22, 3, '#2a2a34'); rect(g, 4, 16, 12, 11, BRASS[1]); rect(g, 4, 16, 1, 11, BRASS[2]); rect(g, 14, 16, 2, 11, BRASS[0]); circle(g, 10, 12, 7, BRASS[1], BRASS[0]); circle(g, 8, 10, 2, BRASS[3]); rect(g, 10, 2, 2, 5, BRASS[1]); line(g, 11, 3, 22, 10, BRASS[2]); rect(g, 20, 10, 4, 10, GLASS[0]); rect(g, 21, 16, 2, 3, VIOLET[2]); rect(g, 6, 20, 8, 2, VIOLET[1]); return outline(c, OUT); }
export function bakeOrreryBase() { const [c, g] = canvas(52, 26); rect(g, 6, 22, 40, 4, STONE[2]); rect(g, 6, 22, 40, 1, STONE[4]); rect(g, 20, 12, 12, 10, BRASS[1]); rect(g, 20, 12, 1, 10, BRASS[2]); rect(g, 12, 9, 28, 3, BRASS[1]); rect(g, 12, 9, 28, 1, BRASS[2]); circle(g, 26, 4, 4, BRASS[2], BRASS[1]); for (let a = 0; a < 6; a++) { const x = 26 + Math.round(Math.cos(a) * 12), y = 8 + Math.round(Math.sin(a) * 3); circle(g, x, y, 2, [FORM_COL.mouse[1], VIOLET[2], '#c03040'][a % 3]); } rect(g, 4, 6, 44, 1, BRASS[0]); return outline(c, OUT); }
export function bakeDesk() { const [c, g] = canvas(30, 16); rect(g, 2, 12, 3, 4, WOOD[1]); rect(g, 25, 12, 3, 4, WOOD[1]); rect(g, 0, 8, 30, 4, WOOD[2]); rect(g, 0, 8, 30, 1, WOOD[3]); rect(g, 4, 4, 8, 4, '#e8dcc0'); rect(g, 5, 5, 6, 1, '#8a8070'); rect(g, 16, 2, 3, 6, GLASS[0]); rect(g, 17, 5, 1, 2, VIOLET[2]); rect(g, 22, 1, 1, 7, '#e8dcc0'); rect(g, 21, 0, 3, 2, '#e8dcc0'); return outline(c, OUT); }
export function bakeChimneypot(v) { const [c, g] = canvas(10, 16); rect(g, 1, 12, 8, 4, STONE[1]); rect(g, 2, 3, 6, 9, v ? '#6a4a3a' : '#5a4a4a'); rect(g, 2, 3, 1, 9, v ? '#8a6a5a' : '#7a6a6a'); rect(g, 1, 1, 8, 3, v ? '#8a6a5a' : '#7a6a6a'); rect(g, 3, 0, 4, 1, '#3a3a44'); return outline(c, OUT); }
export function bakeTelescope() { const [c, g] = canvas(44, 44); rect(g, 12, 40, 20, 4, BRASS[0]); rect(g, 20, 26, 4, 14, BRASS[1]); rect(g, 12, 24, 20, 3, BRASS[1]); line(g, 8, 36, 20, 28, BRASS[0]); line(g, 36, 36, 24, 28, BRASS[0]); fillPoly(g, [[6, 30], [36, 6], [42, 12], [12, 36]], BRASS[1]); fillPoly(g, [[6, 30], [36, 6], [38, 8], [8, 32]], BRASS[2]); fillPoly(g, [[36, 4], [43, 11], [41, 13], [34, 6]], GLASS[1]); px(g, 38, 8, GLASS[3]); rect(g, 4, 30, 5, 5, BRASS[0]); return outline(c, OUT); }
export function bakeStarChart() { const [c, g] = canvas(24, 18); rect(g, 10, 0, 4, 3, WOOD[1]); rect(g, 0, 3, 24, 15, '#e8dcc0'); rect(g, 0, 3, 24, 1, '#c8b898'); rect(g, 0, 17, 24, 1, '#c8b898'); for (let i = 0; i < 9; i++) px(g, 2 + (i * 5) % 20, 5 + (i * 3) % 10, '#3a2a5a'); line(g, 3, 6, 9, 9, VIOLET[1]); line(g, 9, 9, 15, 7, VIOLET[1]); circle(g, 17, 12, 2, VIOLET[2]); return outline(c, OUT); }

/* THE READING ROOM's own furniture (the Falling Tower's second floor, 2026-09-22) */
export function bakeReadingDesk() { const [c, g] = canvas(38, 20); rect(g, 3, 15, 4, 5, WOOD[1]); rect(g, 31, 15, 4, 5, WOOD[1]); rect(g, 2, 17, 34, 2, WOOD[0]);
  rect(g, 0, 10, 38, 5, WOOD[2]); rect(g, 0, 10, 38, 1, WOOD[3]);                                            /* the top */
  fillPoly(g, [[6, 10], [16, 10], [14, 3], [8, 3]], '#e8dcc0'); fillPoly(g, [[8, 4], [14, 4], [13, 9], [9, 9]], '#c8b898');   /* an open book on a slope */
  for (let i = 0; i < 4; i++) rect(g, 9, 5 + i, 4, 1, '#8a8070');
  rect(g, 20, 6, 5, 4, VIOLET[1]); rect(g, 20, 6, 5, 1, VIOLET[2]); rect(g, 26, 5, 4, 5, '#5a2a3a'); rect(g, 26, 5, 4, 1, '#8a4050');   /* two stacked volumes */
  rect(g, 33, 4, 2, 6, BRASS[1]); rect(g, 32, 2, 4, 2, BRASS[2]); px(g, 34, 1, '#ffd36b');                    /* a candle stub, still lit */
  return outline(c, OUT); }
/* THE PENDULUM GALLERY's (hung: the top row is the ceiling) */
export function bakeClockface() { const [c, g] = canvas(44, 46); rect(g, 20, 0, 4, 8, BRASS[0]); rect(g, 21, 0, 1, 8, BRASS[2]);   /* the bracket it hangs from */
  circle(g, 22, 28, 18, STONE[1], BRASS[0]); circle(g, 22, 28, 15, '#e8dcc0');
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, r = 13; rect(g, 22 + Math.round(Math.sin(a) * r) - 1, 28 - Math.round(Math.cos(a) * r) - 1, 2, 2, k % 3 ? '#8a8070' : '#3a2e40'); }
  line(g, 22, 28, 22 + 9, 28 - 4, '#3a2e40'); line(g, 22, 28, 22 - 3, 28 - 10, '#3a2e40'); px(g, 22, 28, BRASS[2]);
  rect(g, 20, 8, 4, 2, BRASS[1]);
  return outline(c, OUT); }
export function bakeGears() { const [c, g] = canvas(40, 34); rect(g, 0, 31, 40, 3, STONE[1]); rect(g, 0, 31, 40, 1, STONE[3]);
  for (const [gx, gy, r] of [[12, 18, 11], [29, 22, 8], [22, 8, 6]]) {
    g.strokeStyle = BRASS[0]; g.lineWidth = 3; g.beginPath(); g.arc(gx, gy, r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = BRASS[1]; g.lineWidth = 1; g.beginPath(); g.arc(gx, gy, r, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; line(g, gx, gy, Math.round(gx + Math.cos(a) * r), Math.round(gy + Math.sin(a) * r), BRASS[0]);
      rect(g, Math.round(gx + Math.cos(a) * (r + 2)) - 1, Math.round(gy + Math.sin(a) * (r + 2)) - 1, 2, 2, BRASS[2]); }
    circle(g, gx, gy, 2, BRASS[2]); }
  g.lineWidth = 1; return outline(c, OUT); }
