// src/stormhold-art.js - STORMHOLD 3's own pictures (claude/stormhold3art). Art only; no level or fight reads anything here.
//   bakeCitadel()  THE QUEEN'S CASTLE, NEAR: the far castle on the skyline (ART.bakeCastleRange) is a mountain with a roofline; at THE LONG BRIDGE the walls she
//                  has been building toward all level stand across the gorge - a curtain wall under a machicolated crown, six towers with slate cones and
//                  banners, the keep tall in the middle with its windows lit. Baked once, drawn by drawCitadel (main.js) behind the near hills.
import { canvas, rect, px, fillPoly, line, mulberry } from './px.js';

const W = 420, H = 190;
export function bakeCitadel() {
  const [c, g] = canvas(W, H), rnd = mulberry(1027);
  const ST = '#2c2f42', ST2 = '#383c54', LIT = '#4e5470', DK = '#1c1e2c', ROOF = '#3a4260', ROOFL = '#5a6488', GOLD = '#c9a040', WIN = '#ffb64a', BAN = '#5a2f7e', BANL = '#8a4cb4';
  const merlons = (x0, x1, y, col, lit) => { for (let x = x0; x < x1; x += 8) { rect(g, x, y - 5, 5, 5, col); rect(g, x, y - 5, 1, 5, lit); rect(g, x + 1, y - 5, 4, 1, lit); } rect(g, x0, y, x1 - x0, 1, DK); };
  const grain = (x0, y0, x1, y1) => { for (let i = 0; i < (x1 - x0) * (y1 - y0) / 14; i++) { const x = x0 + (rnd() * (x1 - x0)) | 0, y = y0 + (rnd() * (y1 - y0)) | 0; px(g, x, y, rnd() < 0.5 ? DK : ST2); } };
  const windows = (x0, x1, y0, y1, step, litP) => { for (let y = y0; y < y1; y += 13) for (let x = x0 + 4; x < x1 - 4; x += step) { const lit = rnd() < litP;
    rect(g, x, y, 3, 6, lit ? WIN : DK); px(g, x + 1, y - 1, lit ? WIN : DK); if (lit) { px(g, x + 1, y + 1, '#ffe8b0'); } } };
  // the curtain wall: a long crowned wall, a row of dark machicolation corbels under the crenellation, a talus at the foot
  rect(g, 0, 118, W, H - 118, ST); rect(g, 0, 118, W, 1, LIT); grain(0, 118, W, H);
  for (let x = 2; x < W; x += 6) { rect(g, x, 122, 3, 4, DK); rect(g, x, 126, 3, 1, ST2); }
  rect(g, 0, 130, W, 2, DK); merlons(0, W, 118, ST, LIT);
  for (let x = 20; x < W; x += 52) { rect(g, x, 146, 2, 10, DK); }   /* arrow loops */
  fillPoly(g, [[0, H], [0, 172], [W, 172], [W, H]], ST2);
  // towers: [centre x, width, top y, cone height]
  const TW = [[30, 30, 80, 34], [96, 26, 70, 30], [150, 30, 88, 30], [270, 30, 88, 30], [326, 26, 66, 34], [392, 32, 76, 36]];
  for (const [cx, w, top, cone] of TW) { const x0 = cx - w / 2 | 0;
    rect(g, x0, top, w, H - top, ST); rect(g, x0, top, 2, H - top, LIT); rect(g, x0 + w - 2, top, 2, H - top, DK); grain(x0, top, x0 + w, H);
    rect(g, x0 - 2, top, w + 4, 4, ST2); for (let x = x0 - 2; x < x0 + w + 2; x += 3) rect(g, x, top + 4, 2, 3, DK);   /* the corbelled crown */
    fillPoly(g, [[cx, top - cone], [x0 - 3, top], [x0 + w + 3, top]], ROOF); fillPoly(g, [[cx, top - cone], [x0 - 3, top], [cx - 1, top]], ROOFL); line(g, cx, top - cone, cx, top - cone - 7, DK);
    fillPoly(g, [[cx, top - cone - 7], [cx + 8, top - cone - 5], [cx, top - cone - 3]], BAN); line(g, cx, top - cone - 7, cx + 8, top - cone - 5, BANL);
    windows(x0, x0 + w, top + 14, top + 56, 9, 0.5); }
  // the keep: the tallest thing in the sky, a stack of stages with a lit hall, and the Queen's great banner
  { const x0 = 176, w = 70; rect(g, x0, 36, w, H - 36, ST); rect(g, x0, 36, 3, H - 36, LIT); rect(g, x0 + w - 3, 36, 3, H - 36, DK); grain(x0, 36, x0 + w, H);
    merlons(x0 - 4, x0 + w + 4, 36, ST, LIT); rect(g, x0 - 4, 36, w + 8, 3, ST2); for (let x = x0 - 4; x < x0 + w + 4; x += 4) rect(g, x, 39, 2, 4, DK);
    rect(g, x0 + 14, 6, 42, 30, ST); rect(g, x0 + 14, 6, 2, 30, LIT); merlons(x0 + 12, x0 + 58, 6, ST, LIT);
    line(g, x0 + 35, 6, x0 + 35, -2 + 4, DK); fillPoly(g, [[x0 + 35, 0], [x0 + 52, 3], [x0 + 49, 6], [x0 + 52, 9], [x0 + 35, 8]], BAN); line(g, x0 + 35, 0, x0 + 52, 3, GOLD);
    windows(x0 + 4, x0 + w - 4, 52, 112, 12, 0.7);
    for (let x = x0 + 18; x < x0 + 54; x += 8) { rect(g, x, 14, 3, 7, WIN); px(g, x + 1, 13, WIN); }   /* the lantern room, lit */
    // the great gate: an arch under the keep, the portcullis down, torchlit
    rect(g, 191, 138, 40, 40, DK); fillPoly(g, [[191, 140], [196, 130], [226, 130], [231, 140]], DK); for (let x = 193; x < 230; x += 4) rect(g, x, 134, 1, 44, '#5a5e72');
    rect(g, 189, 138, 2, 40, LIT); px(g, 190, 136, WIN); px(g, 232, 136, WIN); px(g, 190, 137, WIN); px(g, 232, 137, WIN); }
  // the stair of the rock under the wall, and the gorge's mist
  for (let x = 0; x < W; x += 10) rect(g, x, 172 + ((x / 10) % 3), 10, H, DK);
  return c;
}
