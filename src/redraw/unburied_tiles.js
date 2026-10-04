// unburied_tiles.js - THE UNBURIED FIELD's TILE KIT (claude/unburiedart, IDENTITY: "a siege that never ended"). The field fell through to the forest's kit:
// one dirt slab with a straw lip end to end, felled-log ledges, bramble "stakes", the stockade's palisade and the castles' brick. This is its own ground, BY SECTION
// of the road (CAMP -> LINES -> KILLING-GROUND -> SIEGE WORKS -> THE WALL -> THE CHAPEL), and its own ledges BY WHAT THEY ARE:
//   camp straw (0-20) · grave spoil with lime streaks (21-129) · churned hoof-cut mud with puddles (130-229) · earth-and-timber siege works (230-264) ·
//   the ravine's wet stone (265-324) · trampled approach (325-359) · flagstones and the Order's carved stone (360-479)
//   trench walls REVETTED (wattle and stakes) wherever a trench or pit wall shows; SPIKE = sharpened stakes and planted pike points (never brambles)
//   PALISADE = per wall: the toppled tower's hide-covered side (x 246), a sapper's gabion wall (104, 154)
//   ledges (L.unburied.ledges: [x0, x1, y0, y1, kind], by column and row): gun-deck planks (the high route), tower decks, wagon beds, duckboards, tomb lids, carved stone
//   T.SOFT = the corpse mound (shrouds, shields, limbs); T.PORT = the Rider's portcullis; the trench "mud" pools are mud (drawMud), not blue water.
// RULES (the canal's and the theatre's kits): every standable edge carries a LIT LIP so it is found from across the field; a hazard reads first (pale cut tips on dark);
// made from px.js primitives, each tile 16x16, baked once and memoised. unburiedTile(t, x, y, at, T, L) -> a canvas, or null (the game's own kit draws it).
import { canvas, px, rect, fillPoly, line, outline, mulberry } from '../px.js';

export const UT = {
  peat0: '#241c18', peat1: '#30261f', peat2: '#3c2f26', peat3: '#4c3c32', peat4: '#604c3e', peat5: '#7a6150',
  straw0: '#6e6238', straw1: '#8e8250', straw2: '#aca276', straw3: '#c8bc88', straw4: '#e0d6a4',
  lime1: '#bdb8a4', lime2: '#d8d4c0', lime3: '#ece8d8',
  mud0: '#2a201c', mud1: '#382a24', mud2: '#47362c', mud3: '#5a4638', mud4: '#6a5646', mud5: '#7e6c5e',
  pud0: '#3a2c3c', pud1: '#5c4458', pud2: '#8a6a78', pud3: '#c49aa0',
  wood0: '#1e1610', wood1: '#2e2218', wood2: '#46321f', wood3: '#684a2c', wood4: '#8a6a3e', wood5: '#b08c54', wood6: '#c8a870',
  hide0: '#4a3a30', hide1: '#5a4a3e', hide2: '#74604c', hide3: '#907a62', hide4: '#a8927a',
  wick0: '#2a1e14', wick1: '#3a2a1c', wick2: '#5a4228', wick3: '#7a5a36', wick4: '#9a7448',
  rav0: '#1e2226', rav1: '#2c3034', rav2: '#3c4248', rav3: '#505860', rav4: '#68727a', rav5: '#8a949c', wet: '#3a5460', wetL: '#5a7a88',
  st0: '#221e20', st1: '#2e2a2c', st2: '#3e3a3c', st3: '#524e4e', st4: '#6c6866', st5: '#908a84', st6: '#b4aca0', st7: '#d0c8b8',
  iron0: '#1a1c20', iron1: '#2a2e34', iron2: '#4a5058', iron3: '#7a828c', iron4: '#a8b0b8', rust: '#6a3a28', cloth: '#a8a49c', cloth2: '#8a867e', cloth3: '#d0ccc0', blood: '#5a3028' };

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const rect2 = (g, x, y, w, h, c) => { x |= 0; y |= 0; w |= 0; h |= 0; const x0 = Math.max(0, x), y0 = Math.max(0, y), x1 = Math.min(16, x + w), y1 = Math.min(16, y + h); if (x1 > x0 && y1 > y0) rect(g, x0, y0, x1 - x0, y1 - y0, c); };
const grain = (g, r, cols, n, y0 = 0, y1 = 16) => { for (let i = 0; i < n; i++) px2(g, (r() * 16) | 0, y0 + ((r() * (y1 - y0)) | 0), cols[(r() * cols.length) | 0]); };
const shade = (g, a) => { g.globalAlpha = a; rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; };

// ---------------------------------------------------------------- GROUND MATERIALS (by section) ----------------------------------------------------------------
const MAT = {
  camp:   { body: UT.peat2, spk: [UT.peat1, UT.peat3, UT.straw0], deep: UT.peat1 },
  spoil:  { body: UT.peat3, spk: [UT.peat2, UT.peat4, UT.peat1], deep: UT.peat2 },
  mud:    { body: UT.mud1, spk: [UT.mud0, UT.mud2, UT.mud3], deep: UT.mud0 },
  works:  { body: UT.peat3, spk: [UT.peat2, UT.peat4, UT.wood1], deep: UT.peat2 },
  approach: { body: UT.peat3, spk: [UT.peat2, UT.peat4, UT.straw0], deep: UT.peat2 },
};
function earthFill(kind, v, deep, bones) {
  return once('ef' + kind + v + deep + bones, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 71 + kind.length * 13 + deep * 5), M = MAT[kind]; rect(g, 0, 0, 16, 16, M.body); grain(g, r, M.spk, 46);
    if (kind === 'spoil') { if (v === 1) grain(g, r, [UT.lime1], 2); if (v === 2) { const x = (r() * 10) | 0, y = 2 + ((r() * 12) | 0); rect2(g, x, y, 3 + ((r() * 3) | 0), 1, UT.lime1); } }   /* lime in the spoil: a streak in a third of it, not salt */
    if (kind === 'mud') { for (let y = 3; y < 16; y += 5) rect2(g, (v * 3) % 5, y, 11, 1, UT.mud0); grain(g, r, [UT.mud4], 5); }
    if (kind === 'works') { /* a bearer timber laid in the earth every few courses, the lashings showing */ if (v === 0) { rect2(g, 0, 6, 16, 4, UT.wood2); rect2(g, 0, 6, 16, 1, UT.wood4); rect2(g, 0, 9, 16, 1, UT.wood0); for (let x = 3; x < 16; x += 6) px2(g, x, 8, UT.iron3); } else grain(g, r, [UT.wood2, UT.peat5], 5); }
    if (kind === 'approach') { grain(g, r, [UT.peat5, UT.straw1], 5); }
    if (kind === 'camp') grain(g, r, [UT.straw1], 3, 0, 6);
    if (bones) { const bx = 2 + ((r() * 6) | 0), by = 3 + ((r() * 8) | 0); rect2(g, bx, by, 6, 1, '#cfc4a4'); px2(g, bx - 1, by - 1, '#e6dcc0'); px2(g, bx - 1, by + 1, '#e6dcc0'); px2(g, bx + 6, by - 1, '#e6dcc0'); px2(g, bx + 6, by + 1, '#e6dcc0');
      if (v === 2) { rect2(g, bx + 1, by + 3, 5, 1, '#b8ae90'); rect2(g, bx + 2, by + 5, 4, 1, '#b8ae90'); } }
    if (deep >= 5) shade(g, 0.16); if (deep >= 9) shade(g, 0.2); return c; });
}
/* the crumbling edge of a bare earth wall (a mound's side, a rampart's) */
function crumble(c0, l, r, v) {
  return once('cr' + c0.__k + l + r + v, () => { const [c, g] = canvas(16, 16); g.drawImage(c0, 0, 0); const q = mulberry(v * 17 + 5);
    if (l) { rect2(g, 0, 0, 1, 16, UT.peat0); for (let y = 0; y < 16; y += 3) px2(g, 1, y + ((q() * 2) | 0), UT.peat1); }
    if (r) { rect2(g, 15, 0, 1, 16, UT.peat0); for (let y = 0; y < 16; y += 3) px2(g, 14, y + ((q() * 2) | 0), UT.peat1); }
    return c; });
}
const tag = (c, k) => { c.__k = k; return c; };

function groundTop(kind, l, r, v, mark) {
  return once('gt' + kind + l + r + v + (mark || ''), () => { const [c, g] = canvas(16, 16), q = mulberry(v * 37 + kind.length * 11 + 3);
    rect(g, 0, 0, 16, 16, MAT[kind].body); grain(g, q, MAT[kind].spk, 36, 4);
    if (kind === 'camp') { /* trampled straw: a mat of it over the peat, the lip a pale tangle */
      rect(g, 0, 1, 16, 3, UT.straw1); rect(g, 0, 0, 16, 1, UT.straw3); for (let i = 0; i < 11; i++) { const x = (q() * 16) | 0, y = (q() * 4) | 0, n = 3 + ((q() * 3) | 0), up = q() < 0.5;
        for (let k = 0; k < n; k++) px2(g, x + k, y + (up ? -((k / 2) | 0) : (k / 2) | 0), q() < 0.45 ? UT.straw3 : UT.straw0); }
      for (let x = 0; x < 16; x++) if (q() < 0.4) px2(g, x, 4, UT.straw1); rect(g, 0, 4, 16, 1, UT.peat1); px2(g, 3 + v * 4, 5, UT.straw1); }
    else if (kind === 'spoil') { /* grave spoil: raw clods with lime streaks through them */
      rect(g, 0, 0, 16, 4, UT.peat4); rect(g, 0, 0, 16, 1, UT.peat5); for (let i = 0; i < 5; i++) { const x = (q() * 14) | 0; px2(g, x, 3, UT.peat3); px2(g, x + 1, 4, UT.peat3); px2(g, x, 1, UT.peat5); }
      const sx = (v * 4 + 1) % 9; rect2(g, sx, 1, 5 + (v & 1), 1, UT.lime2); rect2(g, sx + 1, 2, 4, 1, UT.lime1); px2(g, sx + 6, 2, UT.lime2); rect2(g, 10 - v, 3, 4, 1, UT.lime1); px2(g, 12 - v, 0, UT.lime3);
      rect(g, 0, 4, 16, 1, UT.peat1); }
    else if (kind === 'mud') { /* churned mud: a wet crown, hoofprints, and puddles that hold the dusk */
      rect(g, 0, 0, 16, 4, UT.mud2); rect(g, 0, 0, 16, 1, UT.mud4); for (let x = 0; x < 16; x += 3) if (q() < 0.6) px2(g, x + ((q() * 2) | 0), 1, UT.mud5);
      if (v === 1) { rect2(g, 4, 1, 8, 1, UT.pud1); rect2(g, 3, 2, 10, 1, UT.pud0); rect2(g, 4, 3, 8, 1, UT.pud1); px2(g, 6, 1, UT.pud3); px2(g, 7, 1, UT.pud2); px2(g, 9, 2, UT.pud1); }
      else if (v === 0) { for (const hx of [2, 9]) { px2(g, hx, 1, UT.mud0); px2(g, hx + 1, 2, UT.mud0); px2(g, hx + 2, 1, UT.mud0); px2(g, hx + 1, 1, UT.mud3); } }
      else { rect2(g, 0, 2, 16, 1, UT.mud1); rect2(g, 0, 3, 16, 1, UT.mud0); px2(g, 5, 1, UT.mud5); px2(g, 12, 1, UT.mud5); }
      rect(g, 0, 4, 16, 1, UT.mud0); }
    else if (kind === 'works') { /* packed clay over timber, fascine ends and staked ties showing */
      rect(g, 0, 0, 16, 4, UT.peat5); rect(g, 0, 0, 16, 1, '#a08c68'); rect(g, 0, 3, 16, 1, UT.peat3);
      for (const sx of [2 + v, 10 - v]) { rect2(g, sx, 0, 2, 7, UT.wood1); rect2(g, sx, 0, 1, 7, UT.wood4); px2(g, sx, 0, UT.wood6); }
      rect2(g, 4, 4, 5, 3, UT.wood2); rect2(g, 4, 4, 5, 1, UT.wood4); for (let k = 0; k < 4; k++) px2(g, 5 + k, 5 + (k & 1), UT.wood5); rect(g, 0, 7, 16, 1, UT.peat1); }
    else if (kind === 'approach') { /* the trampled approach: hard packed, wheel ruts and flattened straw */
      rect(g, 0, 0, 16, 4, '#74604a'); rect(g, 0, 0, 16, 1, '#a08a68'); rect2(g, 0, 2, 16, 1, UT.peat3); for (let x = (v * 3) % 5; x < 16; x += 5) px2(g, x, 1, '#8a7658');
      rect2(g, 0, 3, 16, 1, UT.peat2); for (let i = 0; i < 4; i++) { const x = (q() * 14) | 0; rect2(g, x, 0, 3, 1, UT.straw2); } rect(g, 0, 4, 16, 1, UT.peat1); }
    if (mark === 'bone') { rect2(g, 3 + v, 2, 5, 1, '#cfc4a4'); px2(g, 2 + v, 1, '#e6dcc0'); px2(g, 2 + v, 3, '#e6dcc0'); }
    if (l) { rect2(g, 0, 0, 1, 6, MAT[kind].body); px2(g, 0, 0, MAT[kind].spk[0]); } if (r) { rect2(g, 15, 0, 1, 6, MAT[kind].body); px2(g, 15, 0, MAT[kind].spk[0]); }
    return c; });
}
/* the bank's cut stone lip over the ravine, and the stream bed's wet pebbles */
function bankTop(l, r, v) {
  return once('bt' + l + r + v, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 29 + 7); rect(g, 0, 0, 16, 16, UT.rav1); grain(g, q, [UT.rav0, UT.rav2], 30, 4);
    rect(g, 0, 0, 16, 5, UT.rav3); rect(g, 0, 0, 16, 1, UT.rav5); rect(g, 0, 1, 16, 1, UT.rav4); rect(g, 0, 5, 16, 1, UT.rav0);
    rect2(g, 3 + v * 4, 1, 1, 4, UT.rav1); px2(g, 9 - v, 2, UT.wet); px2(g, 5, 3, UT.wet); for (let x = 0; x < 16; x += 4) px2(g, x + ((q() * 3) | 0), 0, UT.straw1);   /* a little trampled grass on the lip */
    if (l) rect2(g, 0, 0, 1, 16, UT.rav0); if (r) rect2(g, 15, 0, 1, 16, UT.rav0); return c; });
}
function bedTop(v) {
  return once('bed' + v, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 41 + 9); rect(g, 0, 0, 16, 16, UT.rav1); grain(g, q, [UT.rav0, UT.rav2, UT.wet], 40);
    rect(g, 0, 0, 16, 4, UT.rav2); rect(g, 0, 0, 16, 1, UT.wetL); for (let i = 0; i < 4; i++) { const x = 1 + i * 4 + ((q() * 2) | 0); rect2(g, x, 1, 3, 2, UT.rav4); px2(g, x, 1, UT.rav5); } rect(g, 0, 4, 16, 1, UT.rav0); return c; });
}
/* the ravine's wet walls: strata, drips, the dark streaks where the stream has been */
function ravineStone(v, deep, face) {
  return once('rs' + v + deep + face, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 53 + 3); rect(g, 0, 0, 16, 16, UT.rav1);
    for (let row = 0; row < 3; row++) { const y = row * 5 + ((v + row) % 3); rect2(g, 0, y, 16, 3, row % 2 ? UT.rav2 : UT.rav3); rect2(g, 0, y, 16, 1, row % 2 ? UT.rav3 : UT.rav4); rect2(g, 0, y + 3, 16, 1, UT.rav0); }
    for (let x = (v * 5) % 7; x < 16; x += 7) rect2(g, x, 0, 1, 16, UT.rav0);
    if (face) for (let i = 0; i < 2; i++) { const x = 1 + ((q() * 13) | 0), h = 5 + ((q() * 10) | 0); for (let y = 0; y < h; y++) px2(g, x, y, y % 4 === 3 ? UT.wetL : UT.wet); }
    grain(g, q, [UT.rav0], 12); if (deep >= 4) shade(g, 0.22); return c; });
}
/* the Order's stone: flagstones on top, ashlar below, carved crosses on a few */
function flag(l, r, v, kind) {
  return once('fl' + l + r + v + kind, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 61 + 11); rect(g, 0, 0, 16, 16, UT.st2);
    rect(g, 0, 0, 16, 7, UT.st4); rect(g, 0, 0, 16, 1, UT.st7); rect(g, 0, 1, 16, 1, UT.st5); rect(g, 0, 5, 16, 1, UT.st3); rect(g, 0, 6, 16, 1, UT.st1); rect(g, 0, 7, 16, 1, UT.st0);
    rect2(g, 7 + v * 2, 1, 1, 5, UT.st2); for (let k = 0; k < 4; k++) px2(g, (v * 5 + k * 4 + 2) % 16, 3, UT.st3);
    if (kind === 'tomb') { rect2(g, 1, 8, 14, 1, UT.st3); }
    for (let row = 0; row < 2; row++) { const y = 8 + row * 4, off = (row & 1) ? 4 : 0; for (let bx = -8; bx < 16; bx += 8) { const x = bx + off; rect2(g, x + 1, y + 1, 7, 3, q() < 0.3 ? UT.st3 : UT.st2); rect2(g, x + 1, y + 1, 7, 1, UT.st3); } rect2(g, 0, y + 4, 16, 1, UT.st0); }
    if (l) rect2(g, 0, 0, 1, 16, UT.st0); if (r) rect2(g, 15, 0, 1, 16, UT.st0); return c; });
}
function ashlar(v, deep, carved) {
  return once('as' + v + deep + carved, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 83 + 1); rect(g, 0, 0, 16, 16, UT.st0);
    for (let row = 0; row < 4; row++) { const off = (row & 1) ? 4 : 0; for (let bx = -8; bx < 16; bx += 8) { const x = bx + off, t = q(); rect2(g, x + 1, row * 4 + 1, 7, 3, t < 0.2 ? UT.st4 : t < 0.35 ? UT.st1 : UT.st2); rect2(g, x + 1, row * 4 + 1, 7, 1, t < 0.3 ? UT.st4 : UT.st3); } }
    if (carved) { rect2(g, 7, 2, 2, 12, UT.st4); rect2(g, 4, 5, 8, 2, UT.st4); rect2(g, 7, 2, 1, 12, UT.st5); rect2(g, 4, 5, 8, 1, UT.st5); }   /* the Order's cross, cut in relief */
    if (deep >= 3) shade(g, 0.28); if (deep >= 6) shade(g, 0.18); return c; });
}
/* TRENCH WALLS REVETTED: stakes driven in and withies woven between them (wattle), lime dust on a pit's */
function wattle(v, lime, top) {
  return once('wa' + v + lime + top, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 47 + 2); rect(g, 0, 0, 16, 16, UT.peat1);
    const posts = [1, 6, 11].map(x => x + ((v + x) % 2));
    for (let y = 0; y < 16; y += 2) { const k = (y >> 1) & 1; rect2(g, 0, y, 16, 2, k ? UT.wick2 : UT.wick3); rect2(g, 0, y, 16, 1, k ? UT.wick3 : UT.wick4); rect2(g, 0, y + 1, 16, 1, UT.wick1);
      posts.forEach((px0, i) => { if (((y >> 1) + i) % 2 === 0) { rect2(g, px0, y, 2, 2, UT.wood2); rect2(g, px0, y, 1, 2, UT.wood4); } }); }
    posts.forEach(px0 => { rect2(g, px0, 0, 2, 16, UT.wood1); rect2(g, px0, 0, 1, 16, UT.wood3); });
    for (let y = 0; y < 16; y += 2) posts.forEach((px0, i) => { if (((y >> 1) + i) % 2 === 1) { rect2(g, px0, y, 2, 1, UT.wick4); } });
    if (lime) { for (let i = 0; i < 6; i++) { const x = (q() * 16) | 0, h = 2 + ((q() * 6) | 0), y = (q() * 8) | 0; for (let k = 0; k < h; k++) px2(g, x, y + k, k % 3 === 2 ? UT.lime1 : UT.lime2); } }
    if (top) { rect2(g, 0, 0, 16, 1, UT.wick4); posts.forEach(px0 => { px2(g, px0, 0, UT.wood6); }); }
    return c; });
}

// ---------------------------------------------------------------- LEDGES, BY WHAT THEY ARE ----------------------------------------------------------------
const nails = (g, x0, y, n, step, c = UT.iron3) => { for (let i = 0; i < n; i++) px2(g, x0 + i * step, y, c); };
/* THE GUN-DECK: heavy planks laid on beams, iron straps, a lit lip, the beam ends under each end */
function gunDeck(l, r, v) {
  return once('gd' + l + r + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 7, UT.wood3); rect(g, 0, 0, 16, 1, UT.wood6); rect(g, 0, 1, 16, 1, UT.wood5); rect(g, 0, 5, 16, 1, UT.wood2); rect(g, 0, 6, 16, 1, UT.wood0);
    rect2(g, 4 + ((v * 5) % 6), 1, 1, 5, UT.wood1); rect2(g, 11, 1, 1, 5, UT.wood1); rect(g, 0, 7, 16, 3, UT.wood1); rect2(g, 0, 7, 16, 1, UT.wood2); rect2(g, 3 + v, 8, 4, 2, UT.wood0);
    if (v === 0) { rect2(g, 6, 0, 3, 8, UT.iron1); rect2(g, 6, 0, 3, 1, UT.iron3); px2(g, 7, 3, UT.iron4); } nails(g, 2, 3, 3, 5);
    if (l) { rect2(g, 0, 0, 2, 10, UT.wood5); rect2(g, 0, 0, 1, 10, UT.wood6); } if (r) { rect2(g, 14, 0, 2, 10, UT.wood5); rect2(g, 15, 0, 1, 10, UT.wood4); } return c; });
}
/* DUCKBOARDS and fascine steps: pale slats over the mud, gaps dark */
function duck(l, r, v) {
  return once('dk' + l + r + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 5, UT.wood4); rect(g, 0, 0, 16, 1, UT.wood6); for (let x = 2 + (v & 1); x < 16; x += 4) rect2(g, x, 1, 1, 4, UT.wood1);
    rect(g, 0, 5, 16, 2, UT.wood2); rect2(g, 0, 6, 16, 1, UT.wood0); for (let x = 1; x < 16; x += 5) px2(g, x, 2, UT.wood2); rect2(g, 1 + v * 3, 7, 3, 2, UT.mud2); rect2(g, 10 - v, 7, 4, 1, UT.mud2);
    if (l) rect2(g, 0, 0, 1, 7, UT.wood1); if (r) rect2(g, 15, 0, 1, 7, UT.wood1); return c; });
}
/* A WAGON BED: tarred boards, an iron rim, a cross-bearer under; where it ends, the corner plate */
function wagonBed(l, r, v) {
  return once('wb' + l + r + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 7, '#5a3e26'); rect(g, 0, 0, 16, 1, UT.wood5); rect(g, 0, 1, 16, 1, UT.wood4); rect(g, 0, 6, 16, 1, UT.wood0);
    for (let x = 3; x < 16; x += 5) rect2(g, x + (v & 1), 1, 1, 5, UT.wood1); rect(g, 0, 7, 16, 2, UT.wood1); rect2(g, 0, 7, 16, 1, UT.wood2); if (v === 1) { rect2(g, 6, 0, 2, 7, UT.iron1); px2(g, 6, 0, UT.iron3); }
    if (l) { rect2(g, 0, 0, 3, 9, UT.iron2); rect2(g, 0, 0, 3, 1, UT.iron4); px2(g, 1, 3, UT.iron4); px2(g, 1, 6, UT.iron4); } if (r) { rect2(g, 13, 0, 3, 9, UT.iron2); rect2(g, 13, 0, 3, 1, UT.iron4); px2(g, 14, 3, UT.iron4); px2(g, 14, 6, UT.iron4); } return c; });
}
/* THE TOWER'S DECKS: wet-dark timber lashed with rope, the hide nailed over the ends */
function towerDeck(l, r, v) {
  return once('td' + l + r + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 7, '#5a4636'); rect(g, 0, 0, 16, 1, '#a08a66'); rect(g, 0, 1, 16, 1, UT.wood4); rect(g, 0, 5, 16, 1, UT.wood1); rect(g, 0, 6, 16, 1, UT.wood0);
    for (let x = 3 + v; x < 16; x += 5) rect2(g, x, 1, 1, 4, UT.wood1); for (let x = 1; x < 16; x += 6) { rect2(g, x, 0, 2, 6, UT.straw2); px2(g, x, 2, UT.straw0); px2(g, x + 1, 4, UT.straw0); }   /* rope lashings */
    rect(g, 0, 7, 16, 2, UT.wood1); rect2(g, 0, 7, 16, 1, UT.wood2);
    if (l) { rect2(g, 0, 0, 3, 9, UT.hide2); rect2(g, 0, 0, 3, 1, UT.hide4); px2(g, 1, 4, UT.wood0); } if (r) { rect2(g, 13, 0, 3, 9, UT.hide2); rect2(g, 13, 0, 3, 1, UT.hide4); px2(g, 14, 4, UT.wood0); } return c; });
}
/* A TOMB LID: a carved slab, the chamfer lit, an effigy's long shape in relief (the arena's two ledges, the crypt's tomb) */
function tombLid(l, r, v, i, n) {
  return once('tl' + l + r + v + i + n, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 9, UT.st4); rect(g, 0, 0, 16, 1, UT.st7); rect(g, 0, 1, 16, 1, UT.st6); rect(g, 0, 7, 16, 1, UT.st2); rect(g, 0, 8, 16, 1, UT.st0);
    const mid = (n - 1) / 2; /* the effigy: head at one end, a long body, the crossed hands at the middle */
    rect2(g, 0, 3, 16, 3, UT.st3); rect2(g, 0, 3, 16, 1, UT.st5); if (i === 0) { rect2(g, 4, 2, 7, 4, UT.st5); rect2(g, 5, 2, 5, 1, UT.st6); px2(g, 6, 3, UT.st1); px2(g, 9, 3, UT.st1); }
    if (Math.abs(i - mid) < 0.8) { rect2(g, 3, 3, 10, 1, UT.st6); rect2(g, 5, 4, 6, 1, UT.st5); }
    if (i === n - 1) { rect2(g, 2, 3, 6, 3, UT.st5); px2(g, 4, 6, UT.st2); px2(g, 6, 6, UT.st2); }
    if (l) { rect2(g, 0, 0, 2, 9, UT.st6); rect2(g, 0, 0, 1, 9, UT.st7); rect2(g, 1, 8, 1, 1, UT.st1); } if (r) { rect2(g, 14, 0, 2, 9, UT.st3); rect2(g, 15, 0, 1, 9, UT.st1); }
    rect2(g, 0, 9, 16, 2, UT.st1); rect2(g, 2, 9, 12, 1, UT.st2); return c; });
}
/* a SAPPER'S BRIDGE DECK (T.PLANK): timber laid across stringers, rope-lashed, mud on the boards - the board sits a few pixels down its tile */
function sapperDeck(l, r, v) {
  return once('sd' + l + r + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 3, 16, 6, UT.wood3); rect(g, 0, 3, 16, 1, UT.wood6); rect(g, 0, 4, 16, 1, UT.wood5); rect(g, 0, 8, 16, 1, UT.wood0); rect(g, 0, 9, 16, 2, UT.wood1);
    for (let x = 2 + (v & 1); x < 16; x += 4) rect2(g, x, 4, 1, 4, UT.wood1); rect2(g, 0, 11, 16, 1, UT.wood0);
    for (const x of [1, 11 - v]) { rect2(g, x, 3, 2, 8, UT.straw1); px2(g, x, 5, UT.straw0); px2(g, x + 1, 7, UT.straw0); }   /* lashings */
    px2(g, 5, 4, UT.mud3); px2(g, 6, 4, UT.mud3); px2(g, 12, 5, UT.mud2);
    if (l) { rect2(g, 0, 3, 2, 8, UT.wood5); } if (r) { rect2(g, 14, 3, 2, 8, UT.wood5); }
    const [c2, g2] = canvas(16, 16); g2.drawImage(c, 0, -2); return c2; });   /* the hero's feet are on the tile's top: the board's lip sits two pixels under it, not three over it */
}

// ---------------------------------------------------------------- HAZARD, WALLS, MOUND, GATE ----------------------------------------------------------------
/* SHARPENED STAKES and planted pike points. A hazard reads first: pale cut tips on dark shafts, a lit point. wet: the stream bed's */
function stakes(v, wet) {
  return once('sp' + v + wet, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 23 + 4); const dirt = wet ? UT.rav1 : UT.peat3;
    rect(g, 0, 13, 16, 3, dirt); rect(g, 0, 13, 16, 1, wet ? UT.rav3 : UT.peat5); grain(g, q, wet ? [UT.rav0, UT.rav2] : [UT.peat1, UT.peat4], 10, 13, 16);
    const xs = [2, 7, 12].map((x, i) => x + ((v + i) % 3) - 1), lean = [1, 0, -1];
    xs.forEach((x, i) => { const top = 1 + ((v * 3 + i * 5) % 4), pike = v === 1 && i === 1;
      for (let y = 13; y >= top; y--) { const k = (13 - y) / (13 - top), dx = Math.round(k * lean[i] * 1.5); rect2(g, x + dx, y, 2, 1, UT.wood1); px2(g, x + dx, y, pike ? UT.wood3 : UT.wood3); }
      const tx = x + Math.round(lean[i] * 1.5); if (pike) { fillPoly(g, [[tx - 1, top + 5], [tx, top - 1], [tx + 2, top + 5]], UT.iron4); px2(g, tx, top, '#ffffff'); rect2(g, tx, top + 1, 1, 4, UT.iron3); rect2(g, tx - 1, top + 5, 4, 1, UT.iron2); }
      else { fillPoly(g, [[tx - 1, top + 4], [tx + 0.5, top - 1], [tx + 2, top + 4]], '#e0d0a0'); px2(g, tx, top, '#fff4cc'); px2(g, tx, top + 1, '#fff0c0'); rect2(g, tx - 1, top + 4, 3, 1, UT.wood5); } });
    return outline(c, '#120c08'); });
}
/* THE TOPPLED TOWER'S SIDE: hide stretched on a frame, wet, stitched, the lashings and nail heads, a few arrows' worth of old holes */
function hideWall(v, l, top, row) {
  return once('hw' + v + l + top + row, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 59 + row * 3 + 1); rect(g, 0, 0, 16, 16, UT.hide2);
    for (let i = 0; i < 6; i++) { const x = (q() * 12) | 0, y = (q() * 12) | 0; rect2(g, x, y, 3 + ((q() * 4) | 0), 3 + ((q() * 4) | 0), q() < 0.5 ? UT.hide1 : UT.hide3); }
    rect2(g, 0, 7 + (row & 1), 16, 1, UT.hide0); for (let x = 1; x < 16; x += 3) { px2(g, x, 6 + (row & 1), UT.wood1); px2(g, x + 1, 8 + (row & 1), UT.wood1); }   /* the seam and its stitches */
    for (let i = 0; i < 5; i++) { const x = (q() * 16) | 0; for (let y = 0; y < 5 + ((q() * 7) | 0); y++) px2(g, x, y + ((q() * 4) | 0), UT.hide0); }   /* wet streaks */
    rect2(g, l ? 0 : 14, 0, 2, 16, UT.wood2); rect2(g, l ? 0 : 14, 0, 1, 16, UT.wood4);   /* the frame's post at the wall's edge */
    if (top) { rect2(g, 0, 0, 16, 2, UT.wood3); rect2(g, 0, 0, 16, 1, UT.wood6); nails(g, 2, 1, 4, 4, UT.iron4); }
    px2(g, 5, 3, UT.iron4); px2(g, 11, 12, UT.iron4); return c; });
}
/* A SAPPER'S GABION WALL: wicker baskets packed with earth, stakes along the top */
function gabion(v, l, r, top, row) {
  return once('gb' + v + l + r + top + row, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 16, UT.wick1);
    for (let y = 0; y < 16; y += 2) { const off = ((y >> 1) + row) % 2 ? 2 : 0; for (let x = -4; x < 16; x += 4) { rect2(g, x + off, y, 3, 1, UT.wick3); rect2(g, x + off + 1, y, 2, 1, UT.wick4); rect2(g, x + off, y + 1, 4, 1, UT.wick0); } }
    for (let x = 1; x < 16; x += 7) rect2(g, x, 0, 2, 16, UT.wood2);
    if (l) rect2(g, 0, 0, 1, 16, UT.wick0); if (r) rect2(g, 15, 0, 1, 16, UT.wick0);
    if (top) { rect2(g, 0, 0, 16, 4, UT.peat4); rect2(g, 0, 0, 16, 1, UT.peat5); for (let x = 1; x < 16; x += 5) { rect2(g, x, 0, 2, 5, UT.wood2); px2(g, x, 0, UT.wood6); } }
    return c; });
}
/* THE CORPSE MOUND (T.SOFT): shrouds, a shield's rim, a limb - a heap, lumpy on top, pale enough to read from across the field */
function mound(v, l, r) {
  return once('mo' + v + l + r, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 31 + 7); rect(g, 0, 0, 16, 16, UT.cloth2);
    const top = x => 3 + Math.round(2 * Math.sin((x + v * 5) * 0.8) + 1.4 * Math.sin((x + v * 3) * 1.9));
    for (let x = 0; x < 16; x++) { g.clearRect(x, 0, 1, top(x)); px2(g, x, top(x), UT.cloth3); px2(g, x, top(x) + 1, UT.cloth); }
    for (let i = 0; i < 5; i++) { const x = (q() * 12) | 0, y = 5 + ((q() * 8) | 0); rect2(g, x, y, 3 + ((q() * 3) | 0), 2, q() < 0.5 ? UT.cloth : UT.cloth3); rect2(g, x, y + 2, 4, 1, '#6a665e'); }
    if (v !== 1) { rect2(g, 3, 8, 8, 1, UT.rust); rect2(g, 4, 9, 6, 1, UT.iron2); rect2(g, 4, 7, 6, 1, UT.iron3); px2(g, 7, 8, UT.iron4); }   /* a shield's rim in the heap */
    rect2(g, 1 + v * 4, 11, 7, 1, '#e0d4b8'); px2(g, v * 4, 10, '#e0d4b8'); px2(g, v * 4, 12, '#e0d4b8');   /* a bone */
    for (let i = 0; i < 3; i++) px2(g, (q() * 16) | 0, 6 + ((q() * 9) | 0), UT.blood);
    if (l) rect2(g, 0, 8, 1, 8, '#6a665e'); if (r) rect2(g, 15, 8, 1, 8, '#6a665e'); return outline(c, '#1b1514'); });
}
/* THE RIDER'S PORTCULLIS (T.PORT): iron bars, cross-rails, pointed feet; the dark of the gate arch behind it */
function portcullis(v, foot) {
  return once('pc' + v + foot, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 16, '#0e0a0a');
    for (let x = 1; x < 16; x += 4) { rect2(g, x, 0, 2, 16, UT.iron2); rect2(g, x, 0, 1, 16, UT.iron3); if (foot) { fillPoly(g, [[x, 13], [x + 0.5, 15.9], [x + 2, 13]], UT.iron3); } }
    rect2(g, 0, 3, 16, 2, UT.iron1); rect2(g, 0, 3, 16, 1, UT.iron3); rect2(g, 0, 10, 16, 2, UT.iron1); rect2(g, 0, 10, 16, 1, UT.iron3); for (let x = 1; x < 16; x += 4) { px2(g, x, 3, UT.iron4); px2(g, x, 10, UT.iron4); }
    if (v === 1) { for (let y = 0; y < 16; y += 3) px2(g, 5, y, UT.rust); } return c; });
}

/* THE TOWER'S FALLEN BASE (the solid block at 257-258): heavy upright timbers, iron-strapped, the crest a lit cap - the foot of the tower the host built */
function timberWall(v, top, l, r, row) {
  return once('tw' + v + top + l + r + (row % 3), () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 16, UT.wood2);
    for (let x = 0; x < 16; x += 4) { rect2(g, x, 0, 3, 16, ((x >> 2) + v) % 2 ? UT.wood3 : UT.wood2); rect2(g, x, 0, 1, 16, UT.wood4); rect2(g, x + 3, 0, 1, 16, UT.wood0); }
    if (row % 3 === 0) { rect2(g, 0, 5, 16, 3, UT.iron1); rect2(g, 0, 5, 16, 1, UT.iron3); nails(g, 2, 6, 3, 5, UT.iron4); }
    if (l) rect2(g, 0, 0, 2, 16, UT.wood1); if (r) rect2(g, 14, 0, 2, 16, UT.wood1);
    if (top) { rect2(g, 0, 0, 16, 3, UT.wood4); rect2(g, 0, 0, 16, 1, UT.wood6); rect2(g, 0, 3, 16, 1, UT.wood0); nails(g, 2, 1, 4, 4, UT.iron4); } return c; });
}

// ---------------------------------------------------------------- THE HOOK ----------------------------------------------------------------
/* the section a column belongs to; the borders are blended (a few columns either side take the neighbour's ground) so no seam is a straight line */
function zoneOf(D, x, y) {
  const z = D.zones; let k = null;
  for (const [name, [a, b]] of z) if (x >= a && x <= b) { k = name; break; }
  if (!k) return 'approach';
  const hsh = ((x * 73856093) ^ (y * 19349663)) >>> 0, rr = (hsh % 1000) / 1000;
  for (let i = 0; i < z.length; i++) if (z[i][0] === k) { const [a, b] = z[i][1];
    if (i > 0 && x - a < 3 && rr < 0.45 - 0.15 * (x - a)) return z[i - 1][0];   /* the last columns of a section take a little of the one before it, and the first of the one after: no seam is a straight line */
    if (i < z.length - 1 && b - x < 3 && rr < 0.45 - 0.15 * (b - x)) return z[i + 1][0]; }
  return k;
}
export function ledgeKindAt(D, x, y) { for (const [x0, x1, y0, y1, kind] of D.ledges) if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return kind; return 'duck'; }

export function unburiedTile(t, x, y, at, T, L) {
  const D = L.unburied; if (!D) return null;
  const air = (dx, dy) => at(x + dx, y + dy) === T.AIR, same = (dx, t2) => at(x + dx, y) === t2, v = ((x * 7 + y * 13) % 3 + 3) % 3, G = D.G;
  const walk = k => k === T.AIR || k === T.ONEWAY || k === T.SPIKE || k === T.PLANK || k === T.NET;
  const stoneZone = x >= D.stoneFrom || (x >= D.gateStone[0] && x <= D.gateStone[1] && y <= G);
  const ravine = x >= D.ravine[0] && x <= D.ravine[1];   /* THE RAVINE WALLS AND BED (265-324): wet stone from the field's own floor down */
  if (t === T.SOLID) {
    const top = air(0, -1) || at(x, y - 1) === T.SPIKE || at(x, y - 1) === T.NET || at(x, y - 1) === T.ONEWAY, l = walk(at(x - 1, y)), r = walk(at(x + 1, y)), below = walk(at(x, y + 1));
    let depth = 0; for (let k = 1; k <= 10; k++) { const q = at(x, y - k); if (q === T.AIR || q === T.ONEWAY || q === T.SPIKE) break; depth++; }
    if (D.towerBase && x >= D.towerBase[0] && x <= D.towerBase[1] && y >= D.towerBase[2] && y <= D.towerBase[3]) return timberWall(v, at(x, y - 1) !== T.SOLID, x === D.towerBase[0], x === D.towerBase[1], y);   /* the tower's base is its timber, not the field's earth */
    if (stoneZone) {
      if (top) return flag(l, r, v, 'flag');
      if (depth >= 1 || l || r || below) return ashlar(v, depth, (x * 5 + y * 3) % 17 === 0);
    }
    const gap = x >= D.gap[0] && x <= D.gap[1];
    if (ravine && y > G + 1) { if (top) return gap && y >= D.bed ? bedTop(v) : bankTop(l, r, v); return ravineStone(v, depth, l || r || below ? 1 : 0); }
    const kind = zoneOf(D, x, y);
    if (top) { if (ravine && y === G + 1 && (l || r)) return bankTop(l, r, v);   /* the bank's cut lip over the drop */
      return groundTop(kind, l, r, v, kind === 'spoil' && (x * 7 + y) % 11 === 0 ? 'bone' : ''); }
    /* a trench's or pit's wall is wattle, not a bare cut: the field's pits (lime on them), the old trench line and the long low trench. A crater's is only earth. */
    if ((l || r) && y >= G + 1 && D.revet.some(([a, b]) => x >= a && x <= b)) { const pit = D.pits.some(([a, b]) => x >= a - 1 && x <= b + 1); return wattle(v, pit ? 1 : 0, false); }
    const bones = kind === 'spoil' && ((x * 13 + y * 29) % 19 === 0);
    const f = tag(earthFill(kind, v, depth, bones ? 1 : 0), 'f' + kind + v + depth + (bones ? 1 : 0));
    return (l || r) ? crumble(f, l, r, v) : f;
  }
  if (t === T.ONEWAY) {
    const l = !same(-1, t), r = !same(1, t), kind = ledgeKindAt(D, x, y);
    if (kind === 'deck') return gunDeck(l, r, v); if (kind === 'wagon') return wagonBed(l, r, v); if (kind === 'tower') return towerDeck(l, r, v);
    if (kind === 'stone') return flag(l, r, v, 'ledge');
    if (kind === 'tomb') { let a = 0; while (at(x - a - 1, y) === t) a++; let b = 0; while (at(x + b + 1, y) === t) b++; return tombLid(l, r, v, a, a + b + 1); }
    return duck(l, r, v);
  }
  if (t === T.PLANK) return sapperDeck(!same(-1, t), !same(1, t), v);
  if (t === T.SPIKE) return stakes(v, x >= D.gap[0] && x <= D.gap[1] && y >= D.bed);
  if (t === T.PALISADE) { const top = at(x, y - 1) !== t, l = at(x - 1, y) !== t; return x >= D.hide[0] && x <= D.hide[1] ? hideWall(v, l, top, y) : gabion(v, l, !l ? at(x + 1, y) !== t : false, top, y); }
  if (t === T.SOFT) return mound(v, !same(-1, t), !same(1, t));
  if (t === T.PORT) return portcullis(v, at(x, y + 1) !== t);
  return null;
}

// ---------------------------------------------------------------- THE TRENCH'S MUD (L.pools with mud: true), drawn by main.js drawWater instead of the blue shallows ----------------------------------------------------------------
export function drawMud(g, p, x0, x1, y, h, cx, time, surface) {
  const d = p.depth || 12;
  if (!surface) { g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(96,70,58,0.82)'; g.fillRect(x0, y, x1 - x0, d); g.globalCompositeOperation = 'source-over'; return; }
  /* over the legs of whoever wades: a dark, slow surface with a sky-pink sheen and the odd slow bubble - never a blue crest */
  const gr = g.createLinearGradient(0, y, 0, y + d); gr.addColorStop(0, 'rgba(72,52,44,0.5)'); gr.addColorStop(1, 'rgba(42,30,26,0.64)'); g.fillStyle = gr; g.fillRect(x0, y, x1 - x0, d);
  g.fillStyle = UT.mud4; g.fillRect(x0, y, x1 - x0, 1); g.fillStyle = UT.mud0; g.fillRect(x0, y + 1, x1 - x0, 1);
  g.fillStyle = UT.pud2; g.globalAlpha = 0.5; for (let x = p.x0 + 5; x < p.x1; x += 17) { const sx = x + Math.round(Math.sin(time * 0.5 + x * 0.3) * 2) - cx; if (sx > x0 && sx < x1 - 5) g.fillRect(sx, y + 1, 5, 1); } g.globalAlpha = 1;
  g.fillStyle = UT.mud5; for (let k = 0; k < 3; k++) { const t = (time * 0.3 + k * 0.41) % 1, bx = p.x0 + 9 + ((k * 61) % Math.max(1, p.x1 - p.x0 - 18)) - cx, by = y + d - t * (d - 2); if (bx > x0 && bx < x1 && t > 0.1) g.fillRect(bx, by, 2, 1); }
  g.fillStyle = UT.mud1; g.fillRect(x0 - 1, y - 2, 2, d + 2); g.fillRect(x1 - 1, y - 2, 2, d + 2);
}
