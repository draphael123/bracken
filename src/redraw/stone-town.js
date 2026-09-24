// stone-town.js — STORMHOLD'S HOUSES (docs/briefs/stormhold-town.md §4). A castle town, not a war camp: the goblins took it,
// they did not build it. Coursed HONEY LIMESTONE on the ground floor - warm, so it never reads as the Queen's blue granite in
// Highcrown next door - a dark oak jetty under the eaves with the upper storey limewashed above it, deep-set windows with
// shutters and amber light behind them, snow on every sill, and here and there an iron bracket with a shop sign still on
// it from before. h = { x0, x1, y0, y1, door, door2, seed } in tiles, the same shape the village's houses use.
import { canvas, rect, px, mulberry } from '../px.js';

const TS = 16;
const STONE = '#9a8566', STONE_L = '#b39c78', STONE_D = '#7a6850', MORTAR = '#5e5040';
const OAK = '#3a2a1e', OAK_L = '#5a4230', WASH = '#b9ae98', WASH_D = '#998e7a';
const LIT = '#ffb84a', LIT_L = '#fff0c0', DARK = '#262230', SNOW = '#eef4ff';

function win(g, x, y, w, h, lit, rnd) {
  rect(g, x - 2, y - 2, w + 4, h + 3, STONE_D); rect(g, x - 2, y - 2, w + 4, 1, STONE_L);   /* the dressed surround */
  rect(g, x, y, w, h, lit ? LIT : DARK);
  if (lit) { rect(g, x + 1, y + 1, 2, 2, LIT_L); rect(g, x + (w >> 1), y, 1, h, OAK); rect(g, x, y + (h >> 1), w, 1, OAK); }
  else { for (let yy = y + 1; yy < y + h; yy += 3) rect(g, x, yy, w, 1, '#3a3040'); }
  /* the shutters, folded back: dark boards either side */
  rect(g, x - 5, y, 3, h, '#4a3424'); rect(g, x + w + 2, y, 3, h, '#4a3424');
  rect(g, x - 5, y + (h >> 1), 3, 1, '#2a1c12'); rect(g, x + w + 2, y + (h >> 1), 3, 1, '#2a1c12');
  rect(g, x - 3, y + h + 1, w + 6, 2, STONE_L); rect(g, x - 3, y + h, w + 6, 1, SNOW);   /* the sill, with snow on it */
  if (rnd() < 0.5) px(g, x + 1 + ((rnd() * (w - 2)) | 0), y + h + 3, SNOW);
}

export function bakeStoneFront(h) {
  const w = (h.x1 - h.x0 + 1) * TS, ht = (h.y1 - h.y0 + 1) * TS, rnd = mulberry(h.seed * 11 + 7);
  const [c, g] = canvas(w, ht);
  const jetty = Math.max(12, Math.min(22, Math.round(ht * 0.34)));   /* the upper storey: limewash over oak */
  // the upper storey: limewash between oak studs, jettied out over the stone
  rect(g, 0, 0, w, jetty, WASH);
  for (let i = 0; i < w * jetty / 30; i++) px(g, (rnd() * w) | 0, (rnd() * jetty) | 0, rnd() < 0.5 ? WASH_D : '#c8bea8');
  rect(g, 0, 0, w, 3, OAK); rect(g, 0, 3, w, 2, 'rgba(20,12,8,0.45)');
  for (let x = 6; x < w - 2; x += 14) { rect(g, x, 5, 2, jetty - 5, OAK); if (rnd() < 0.5 && x + 14 < w) for (let t = 0; t < jetty - 7; t++) px(g, x + 2 + Math.round(t * 10 / (jetty - 7)), 6 + t, OAK); }
  // the ground floor: coursed limestone, eight-pixel courses, the joints broken
  for (let y = jetty; y < ht; y++) { const k = (y - jetty) % 8; rect(g, 0, y, w, 1, k === 7 ? MORTAR : k === 0 ? STONE_L : STONE); }
  for (let row = 0, y = jetty; y < ht; y += 8, row++) for (let x = (row & 1) * 9 - 9; x < w; x += 18 + ((rnd() * 5) | 0)) rect(g, x, y, 1, 7, MORTAR);
  for (let i = 0; i < w * (ht - jetty) / 50; i++) px(g, (rnd() * w) | 0, jetty + ((rnd() * (ht - jetty)) | 0), rnd() < 0.5 ? STONE_D : STONE_L);
  // THE JETTY: the oak bressumer the upper storey stands out on, and the shadow under it - the line that makes it a house
  rect(g, 0, jetty, w, 3, OAK); rect(g, 0, jetty, w, 1, OAK_L); rect(g, 0, jetty + 3, w, 3, 'rgba(12,8,6,0.5)');
  for (let x = 4; x < w; x += 12) rect(g, x, jetty + 3, 2, 3, '#24170e');
  // a plinth of darker stone at the foot, and snow banked against it
  rect(g, 0, ht - 5, w, 5, STONE_D); rect(g, 0, ht - 5, w, 1, MORTAR);
  for (let x = 0; x < w; x++) if (rnd() < 0.55) rect(g, x, ht - 2 - ((rnd() * 2) | 0), 1, 2 + ((rnd() * 2) | 0), SNOW);
  const doorAt = [h.door, h.door2].filter(d => d != null).map(d => (d - h.x0) * TS + 8);
  const nearDoor = x => doorAt.some(d => Math.abs(x - d) < 18);
  // windows: one a bay up in the limewash, one a bay down in the stone where there is no door
  for (let x = 14; x < w - 14; x += 32) {
    if (jetty > 12) win(g, x - 4, 6, 8, Math.min(8, jetty - 10), rnd() < 0.6, rnd);
    const dh = Math.min(12, ht - jetty - 18);
    if (dh >= 6 && !nearDoor(x)) win(g, x - 5, jetty + 9, 10, dh, rnd() < 0.72, rnd);
  }
  // an iron bracket and a shop sign from before the goblins came
  if (w >= 96 && rnd() < 0.8) { const sx = 10 + ((rnd() * (w - 40)) | 0), sy = jetty + 6;
    rect(g, sx, sy, 14, 1, '#2a2a32'); rect(g, sx + 13, sy - 2, 1, 3, '#2a2a32');
    rect(g, sx + 3, sy + 1, 1, 3, '#2a2a32'); rect(g, sx + 10, sy + 1, 1, 3, '#2a2a32');
    rect(g, sx + 1, sy + 4, 12, 8, '#6a4a2a'); rect(g, sx + 1, sy + 4, 12, 1, '#8a6a42'); rect(g, sx + 4, sy + 7, 6, 3, ['#e0b040', '#c9463d', '#8fb0d0'][(rnd() * 3) | 0]); }
  // a door where the house has none of its own: arched, in a stone reveal, shut
  if (!doorAt.length) { const dw = 14, dh = Math.min(26, ht - jetty - 8), dx = (w >> 1) - 7, dy = ht - dh;
    rect(g, dx - 3, dy - 3, dw + 6, dh + 3, STONE_D); rect(g, dx - 3, dy - 3, dw + 6, 1, STONE_L);
    rect(g, dx, dy, dw, dh, '#5a3a22'); for (let k = 3; k < dw; k += 4) rect(g, dx + k, dy, 1, dh, '#3e2616');
    rect(g, dx, dy, 2, 2, STONE_D); rect(g, dx + dw - 2, dy, 2, 2, STONE_D);   /* the arch's shoulders */
    rect(g, dx - 1, dy + 6, dw + 2, 1, '#2a2a32'); rect(g, dx - 1, dy + dh - 8, dw + 2, 1, '#2a2a32'); px(g, dx + dw - 4, dy + (dh >> 1), '#e0b040'); }
  // the house's own doors: a dressed stone surround over each, so the doorway prop stands in a doorway
  for (const d of doorAt) { const x = d - 10; rect(g, x, ht - 30, 20, 2, STONE_L); rect(g, x, ht - 28, 2, 28, STONE_D); rect(g, x + 18, ht - 28, 2, 28, STONE_D); rect(g, x + 7, ht - 32, 6, 3, STONE_L); }
  return c;
}

// THE TOWN BEHIND THE STREET (L.facades kind 'townrow', drawn behind the play by drawFacades). A market square with
// nothing round it is a car park: this is the row of tall houses standing behind the square and the close - stepped
// gables, steep slate with snow on it, chimneys, a lit window here and there - a shade darker and cooler than the
// houses you walk past, so it sits back and never reads as something to stand on.
export function bakeTownRow(tw, th, seed) {
  const W = tw * TS, H = th * TS, rnd = mulberry((seed | 0) * 7 + 3), [c, g] = canvas(W, H);
  const wall = ['#5e5446', '#554c40', '#62574a'], wash = ['#7a7266', '#6e675c'], slate = '#262a36', slateL = '#343a4a';
  let x = -((rnd() * 20) | 0);
  while (x < W) {
    const w = 34 + ((rnd() * 4) | 0) * 8, eaves = Math.round(H * (0.3 + rnd() * 0.2)), peak = Math.max(2, eaves - 16 - ((rnd() * 12) | 0));
    const timber = rnd() < 0.45, body = timber ? wash[(rnd() * 2) | 0] : wall[(rnd() * 3) | 0];
    rect(g, x, eaves, w, H - eaves, body);
    if (!timber) for (let y = eaves + 7; y < H; y += 8) rect(g, x, y, w, 1, '#3e372e');   /* coursed */
    else { for (let k = x + 6; k < x + w - 2; k += 12) rect(g, k, eaves, 2, H - eaves, '#2e241c'); rect(g, x, eaves + 16, w, 2, '#2e241c'); }
    // the gable: a steep slate roof, snow along its slopes
    const mid = x + (w >> 1);
    for (let y = peak; y < eaves + 2; y++) { const half = Math.round((y - peak + 1) / (eaves + 2 - peak) * (w / 2 + 3)); rect(g, mid - half, y, half * 2, 1, (y & 3) === 3 ? slate : slateL);
      if (rnd() < 0.7) { px(g, mid - half, y, '#dfe6f2'); px(g, mid + half - 1, y, '#dfe6f2'); } }
    rect(g, mid - 1, peak - 1, 2, 2, '#dfe6f2');
    if (rnd() < 0.7) { const cx = x + 4 + ((rnd() * (w - 12)) | 0), top = peak + 2 + ((rnd() * 6) | 0); rect(g, cx, top - 8, 5, 10, '#3a3430'); rect(g, cx - 1, top - 9, 7, 2, '#dfe6f2'); }   /* a chimney, snow on its cap */
    // windows: a few lit, most dark - it is late
    for (let wy = eaves + 10; wy < H - 14; wy += 22) for (let wx = x + 7; wx < x + w - 10; wx += 13) {
      const lit = rnd() < 0.3; rect(g, wx - 1, wy - 1, 7, 10, '#2a2420'); rect(g, wx, wy, 5, 8, lit ? '#e8a040' : '#1e1c26'); if (lit) px(g, wx + 1, wy + 1, '#ffe0a0'); }
    rect(g, x + w - 1, eaves, 1, H - eaves, '#2a2420');   /* the party wall */
    x += w;
  }
  // and the whole row pushed back into the night a little
  g.globalAlpha = 0.28; rect(g, 0, 0, W, H, '#141826'); g.globalAlpha = 1;
  return c;
}
