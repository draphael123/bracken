// city_tiles.js — THE LAMPLIT STREET: tiles and parallax for a stone city a hundred feet under the sea, lit
// only by the whale-oil lamps that have burned in it since it went down. The whole set is COLD on purpose:
// deep blue-green limestone, black mortar, algae furring every upward face, barnacle white in the joints.
// None of the warm light is baked in, because in this level the light MOVES — every gold pool on the screen
// comes from a lamp object that can be put out, so it is thrown by the lamp pass in main.js and never by a
// tile. That is what makes a dark street read as dark.
// Deliberately a different water from THE LONG WATER's warm dusk coast (lw_tiles.js), THE SHIPWRECK REEF's
// grey-green storm (reef_tiles.js) and THE FLOTILLA's hard noon (flot_tiles.js): here there is no sky at all,
// only a green ceiling a long way up, and the deeper the frame goes the blacker it gets.
// Same conventions as all of those: 16x16 tiles, crisp px.js primitives only (no AA), fixed seeds for the
// tiles so they come out the same every load, the caller's seed for the background layers.
import { canvas, px, rect, mulberry } from './px.js';

const T = 16;
// dressed limestone, drowned. `top` is the walked face (still the palest thing in the set, but cold),
// `m`/`l`/`d` the body, `mor` the mortar, `deep` the shadow in a joint.
const ST = { top: '#7e9490', hi: '#6b8280', l: '#58706f', m: '#46595c', d: '#35454a', deep: '#243036', mor: '#1b2429' };
// the same stone with the algae on it: every upward face in a drowned city is furred
const ALG = { l: '#4e7a58', m: '#39603f', d: '#24402c' };
// barnacle and shell crust, the only white down here
const CRU = ['#d6ddd2', '#a8b2a8', '#76807a'];
// weed: long green-black fronds
const WD = ['#2f5a46', '#1e3d30', '#11241c', '#3f7a54'];
// silt on the floor of the street
const SLT = ['#2a3a3e', '#35484a', '#1f2c30'];
// wrought iron: the lamp cages, the railings, the chains
const IR = { d: '#16191c', m: '#2b3136', l: '#454e55' };
// the city's gold: only ever a lamp's own flame in the parallax, never on a tile
const GLD = ['#ffe9a8', '#f0c05a', '#a87a24'];

// ---------- the stone body ----------
// Every masonry tile in the set runs on one course pitch: a block 4 rows deep with the mortar bed in the
// bottom row, so rows 3, 7, 11 and 15 are always mortar and any tile stacks under any other with the beds
// running straight along a wall of any height. Vertical joints alternate half a block per course (stretcher
// bond), which is what stops a big wall reading as graph paper.
function courseRow(y) { return (y & 3) === 3; }
function ashlar(g, rnd, y0) {
  for (let y = 0; y < T; y++) {
    const k = y & 3;
    const base = k === 0 ? ST.l : k === 3 ? ST.mor : ST.m;
    for (let x = 0; x < T; x++) px(g, x, y, base);
    if (k === 0) for (let x = 0; x < T; x++) if (rnd() < 0.3) px(g, x, y, ST.hi); // the lit top edge of a block
  }
  // the vertical joints: every 8 px, offset half a block on every other course
  for (let y = 0; y < T; y++) {
    const c = ((y + y0) >> 2), off = (c & 1) ? 4 : 0;
    for (let x = 0; x < T; x++) if (((x + off) % 8) === 0 && !courseRow(y)) px(g, x, y, ST.deep);
  }
  // stone grain and pitting, and a shell in a joint now and then
  for (let i = 0; i < 9; i++) { const x = (rnd() * T) | 0, y = (rnd() * T) | 0; if (!courseRow(y)) px(g, x, y, rnd() < 0.5 ? ST.d : ST.l); }
  for (let i = 0; i < 2; i++) { const x = 1 + ((rnd() * 14) | 0), y = 1 + ((rnd() * 13) | 0); px(g, x, y, ST.deep); px(g, x, y + 1, ST.hi); }
  for (let i = 0; i < 2; i++) if (rnd() < 0.5) { const x = (rnd() * 15) | 0, y = 3 + 4 * ((rnd() * 4) | 0); px(g, x, y, CRU[1]); if (rnd() < 0.5) px(g, x + 1, y, CRU[2]); }
}

// paving: big flags with wide joints, laid across the street
function paving(g, rnd) {
  const seam = 1 + ((rnd() * 3) | 0); // which column the flag joint falls on
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) px(g, x, y, y < 2 ? ST.top : y < 6 ? ST.hi : y < 11 ? ST.l : ST.m);
  for (let y = 0; y < T; y++) px(g, seam, y, ST.mor);
  for (let y = 0; y < T; y++) px(g, (seam + 9) % T, y, ST.mor);
  for (let i = 0; i < 10; i++) { const x = (rnd() * T) | 0, y = 2 + ((rnd() * 13) | 0); px(g, x, y, rnd() < 0.5 ? ST.l : ST.m); }
  for (let i = 0; i < 3; i++) { const x = (rnd() * T) | 0; px(g, x, 0, CRU[0]); } // shell grit in the crown of the road
}

// ---------- the tiles ----------

// A walked face: paving, a fur of algae along the lit edge, weed in the joints, and a shell or two. eL/eR
// darken the tile's open sides so a kerb reads as a kerb.
function cityTop(seed, eL, eR) {
  const rnd = mulberry(seed), [c, g] = canvas(T, T);
  paving(g, rnd);
  // the algae: every upward face is furred, thicker where the stone is broken
  for (let x = 0; x < T; x++) { const h = 1 + (rnd() < 0.4 ? 1 : 0); for (let j = 0; j < h; j++) px(g, x, j, j === 0 ? (rnd() < 0.6 ? ALG.m : ALG.l) : ALG.d); }
  for (let i = 0; i < 4; i++) { const x = (rnd() * T) | 0; px(g, x, 0, ALG.l); px(g, x, 1, ALG.m); if (rnd() < 0.4) px(g, x, 2, ALG.d); }
  if (eL) for (let y = 0; y < T; y++) { px(g, 0, y, y < 2 ? ALG.d : ST.deep); if (y > 1 && rnd() < 0.5) px(g, 1, y, ST.d); }
  if (eR) for (let y = 0; y < T; y++) { px(g, T - 1, y, y < 2 ? ALG.d : ST.deep); if (y > 1 && rnd() < 0.5) px(g, T - 2, y, ST.d); }
  return c;
}

// the side of a wall where the street has fallen away: coursed ashlar with a hard shadowed arris
function cityEdge(seed, eL, eR) {
  const rnd = mulberry(seed), [c, g] = canvas(T, T);
  ashlar(g, rnd, 0);
  if (eL) for (let y = 0; y < T; y++) { px(g, 0, y, ST.deep); px(g, 1, y, courseRow(y) ? ST.mor : ST.d); if (rnd() < 0.3) px(g, 2, y, ST.d); }
  if (eR) for (let y = 0; y < T; y++) { px(g, T - 1, y, ST.deep); px(g, T - 2, y, courseRow(y) ? ST.mor : ST.d); if (rnd() < 0.3) px(g, T - 3, y, ST.d); }
  // weed hanging off an exposed course
  for (let i = 0; i < 2; i++) if (rnd() < 0.5) { const x = eL ? 2 + ((rnd() * 4) | 0) : T - 5 + ((rnd() * 4) | 0), y = 3 + 4 * ((rnd() * 3) | 0); px(g, x, y, WD[0]); px(g, x, y + 1, WD[1]); }
  return c;
}

// deep inside a wall: the same bond, darker, with nothing growing on it
function cityFill(seed) {
  const rnd = mulberry(seed), [c, g] = canvas(T, T);
  ashlar(g, rnd, 2);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (rnd() < 0.55) px(g, x, y, courseRow(y) ? ST.mor : ST.d);
  return c;
}

// under shallow water: silt drifted over the paving, with the flags showing through where it has washed clear
function citySilt(seed) {
  const rnd = mulberry(seed), [c, g] = canvas(T, T);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) px(g, x, y, ((y + (rnd() < 0.3 ? 1 : 0)) & 1) ? SLT[0] : SLT[1]);
  for (let i = 0; i < 14; i++) { const x = (rnd() * T) | 0, y = (rnd() * T) | 0; px(g, x, y, rnd() < 0.5 ? SLT[2] : SLT[1]); }
  for (let i = 0; i < 3; i++) { const x = (rnd() * T) | 0, y = (rnd() * T) | 0; px(g, x, y, CRU[2]); } // shell fragments
  for (let x = 0; x < T; x++) if (rnd() < 0.35) px(g, x, 0, SLT[1]);
  return c;
}

// a walked face with the water standing on it: the same paving gone glassy, with a pale sheen line
function cityWet(seed) {
  const rnd = mulberry(seed), [c, g] = canvas(T, T);
  paving(g, rnd);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (((x + y * 2) & 3) === 0) px(g, x, y, y < 4 ? '#5d8a88' : '#3d6664');
  for (let x = 0; x < T; x++) if (rnd() < 0.5) px(g, x, 0, '#86b2ac');
  for (let i = 0; i < 5; i++) { const x = (rnd() * T) | 0; px(g, x, 1, ALG.m); }
  return c;
}

// THE ARCADE: the one-ways are the city's stone cornices and the market's awning rails — a carved bracket
// course with a lip you can stand on, algae on the lip, weed under it.
function cornice(seed, end, v) {
  const rnd = mulberry(seed), [c, g] = canvas(T, T);
  rect(g, 0, 0, T, 2, ST.top); rect(g, 0, 2, T, 2, ST.l); rect(g, 0, 4, T, 1, ST.m); rect(g, 0, 5, T, 1, ST.deep);
  for (let x = 0; x < T; x++) { px(g, x, 0, rnd() < 0.5 ? ALG.m : ALG.l); if (rnd() < 0.35) px(g, x, 1, ALG.d); }
  // the dentil course under the lip: a tooth every four
  for (let x = (v % 2) ? 1 : 3; x < T; x += 4) { rect(g, x, 4, 2, 2, ST.l); px(g, x, 6, ST.deep); px(g, x + 1, 6, ST.d); }
  for (let i = 0; i < 3; i++) if (rnd() < 0.7) { const x = (rnd() * T) | 0; px(g, x, 6, WD[1]); if (rnd() < 0.5) px(g, x, 7, WD[2]); }
  if (end === 'L') { for (let y = 0; y < 6; y++) px(g, 0, y, ST.deep); rect(g, 1, 4, 2, 2, ST.m); }
  if (end === 'R') { for (let y = 0; y < 6; y++) px(g, T - 1, y, ST.deep); rect(g, T - 3, 4, 2, 2, ST.m); }
  return c;
}

export function bakeCityTiles() {
  const top = {}, edge = {};
  for (const eL of [0, 1]) for (const eR of [0, 1]) {
    const k = eL + '' + eR;
    top[k] = [0, 1, 2, 3].map(i => cityTop(5100 + i + eL * 7 + eR * 13, eL, eR));
    if (eL || eR) edge[k] = [0, 1].map(i => cityEdge(5200 + i + eL * 3 + eR * 5, eL, eR));
  }
  return {
    top, edge,
    fill: [0, 1, 2, 3].map(i => cityFill(5300 + i)),
    silt: [0, 1, 2].map(i => citySilt(5400 + i)),
    ledge: [0, 1, 2].map(i => cornice(5500 + i, null, i)), ledgeL: cornice(5510, 'L', 0), ledgeR: cornice(5511, 'R', 0),
    wet: [0, 1, 2].map(i => cityWet(5600 + i)),
  };
}

// ---------- background layers ----------

// Bands of colour from row y0 to y1 across the width, with one checkered row at each change, so the water
// deepens in 16-bit steps rather than a smear. (Same helper as the other three sets.)
function bands(g, w, y0, y1, cols, cuts) {
  const n = y1 - y0, at = r => { const t = r / n; let i = 0; while (i < cuts.length && t >= cuts[i]) i++; return i; };
  for (let r = 0; r < n; r++) {
    const i = at(r), j = at(r + 1), p = r > 0 ? at(r - 1) : i, y = y0 + r;
    if (j !== i) { for (let x = 0; x < w; x++) px(g, x, y, ((x + y) & 1) ? cols[j] : cols[i]); }
    else { rect(g, 0, y, w, 1, cols[i]); if (p !== i) for (let x = 0; x < w; x++) if (((x + 2 * y) & 3) === 0) px(g, x, y, cols[p]); }
  }
}

// THERE IS NO SKY. What is over the city is the underside of the sea, a hundred feet up: a green ceiling with
// the day somewhere beyond it, going black as it comes down toward the street. Stepped in twelfths like every
// other sky in the game so it reads 16-bit.
export function bakeSkyDrowned(h) {
  const [c, g] = canvas(1, h);
  const st = [[0, [44, 104, 96]], [0.14, [32, 84, 78]], [0.3, [24, 64, 62]], [0.48, [18, 48, 50]], [0.66, [13, 34, 38]], [0.82, [10, 24, 28]], [1, [7, 16, 20]]];
  for (let y = 0; y < h; y++) {
    const q = Math.round((y / Math.max(1, h - 1)) * 11) / 11;
    let i = 0; while (i < st.length - 2 && q > st[i + 1][0]) i++;
    const [t0, a] = st[i], [t1, b] = st[i + 1], k = Math.min(1, Math.max(0, (q - t0) / (t1 - t0)));
    px(g, 0, y, 'rgb(' + ((a[0] + (b[0] - a[0]) * k) | 0) + ',' + ((a[1] + (b[1] - a[1]) * k) | 0) + ',' + ((a[2] + (b[2] - a[2]) * k) | 0) + ')');
  }
  return c;
}

// A lamp seen at a distance in the murk: a dot of gold with its halo eaten by the water. The ONE warm thing
// in the backgrounds, and what makes the rows of them read as streets.
function farLamp(g, w, x, y, k) {
  const wrap = v => ((Math.round(v) % w) + w) % w;
  px(g, wrap(x), y, GLD[0]);
  if (k > 0) { px(g, wrap(x - 1), y, GLD[1]); px(g, wrap(x + 1), y, GLD[1]); px(g, wrap(x), y - 1, GLD[1]); px(g, wrap(x), y + 1, GLD[2]); }
  if (k > 1) { px(g, wrap(x - 1), y - 1, GLD[2]); px(g, wrap(x + 1), y - 1, GLD[2]); }
}

// A drowned tower or hall seen through the water: a flat mass one step lighter than the water behind it (the
// murk lifts a silhouette instead of darkening it), a stepped roof, and the black slots of its windows.
function farBlock(g, w, x0, wd, top, base, body, roofc, win, lamps, rnd) {
  const wrap = v => ((Math.round(v) % w) + w) % w;
  for (let x = x0; x < x0 + wd; x++) for (let y = top; y < base; y++) px(g, wrap(x), y, body);
  const ph = Math.max(2, Math.round(wd * 0.3));
  for (let j = 0; j < ph; j++) { const k = Math.round(wd / 2 * (j / ph)); for (let x = x0 + k; x < x0 + wd - k; x++) px(g, wrap(x), top - 1 - j, roofc); }
  for (let y = top + 3; y < base - 2; y += 5) for (let x = x0 + 2; x < x0 + wd - 2; x += 4) { px(g, wrap(x), y, win); px(g, wrap(x), y + 1, win); }
  if (lamps) for (let x = x0 + 3; x < x0 + wd - 2; x += 7) if (rnd() < 0.5) farLamp(g, w, x, base - 4 - ((rnd() * 6) | 0), 0);
}

// THE FAR DISTANCE: the rest of the city, a long way off down the valley it stands in, nearly eaten by the
// water. Roofs and towers in one flat tone, a dead bell tower over the lot of it, and lamps still burning in
// rows where its streets run — the first thing that says the city is big and the second that says it is lit.
export function bakeFarCity(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const H0 = Math.round(h * 0.52);
  const wrap = v => ((Math.round(v) % w) + w) % w;
  // the murk the city stands in: only the bottom half is opaque, the top is open water
  bands(g, w, H0, h, ['#1b4c48', '#16403d', '#113331', '#0d2826'], [0.12, 0.45, 0.78]);
  const body = '#1d4a47', roofc = '#16403e', win = '#0a1e20';
  let x = 2;
  while (x < w + 20) {
    const wd = 7 + ((rnd() * 12) | 0), ht = 10 + ((rnd() * 20) | 0);
    farBlock(g, w, x, wd, h - ht - 2, h - 2, body, roofc, win, true, rnd);
    x += wd + 1 + ((rnd() * 4) | 0);
  }
  // the bell tower: the one landmark, taller than anything and leaning
  { const tx = Math.round(w * 0.31), tw = 9;
    for (let y = H0 - 22; y < h - 2; y++) { const lean = Math.round((h - y) * 0.06); for (let i = 0; i < tw; i++) px(g, wrap(tx + i + lean), y, body); }
    for (let j = 0; j < 6; j++) for (let i = Math.round(tw / 2 * (j / 6)); i < tw - Math.round(tw / 2 * (j / 6)); i++) px(g, wrap(tx + i + 3), H0 - 23 - j, roofc);
    for (let i = 2; i < tw - 2; i++) { px(g, wrap(tx + i + 2), H0 - 16, win); px(g, wrap(tx + i + 2), H0 - 15, win); }
    farLamp(g, w, tx + 5, H0 - 12, 1); }
  // the streets, as rows of lamps going away from you
  for (let r = 0; r < 4; r++) { const y = h - 6 - r * 5; for (let i = 0; i < w / (18 + r * 4); i++) farLamp(g, w, 6 + i * (18 + r * 4) + r * 5, y, r === 0 ? 1 : 0); }
  // and the water itself: motes hanging in it
  for (let i = 0; i < w * h / 900; i++) px(g, (rnd() * w) | 0, H0 + ((rnd() * (h - H0)) | 0), rnd() < 0.5 ? '#2a6460' : '#225450');
  return c;
}

// THE MIDDLE DISTANCE: the far side of the street we are standing in — facades with their doors open to the
// water, string courses, bracket lamps with every second one dead, and the collapsed span of a bridge lying
// across the frame.
export function bakeMidCity(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const wrap = v => ((Math.round(v) % w) + w) % w;
  const body = '#203c42', bodyD = '#183036', roofc = '#142a30', win = '#081418', trim = '#2c4c50';
  const base = h - 1;
  let x = 0;
  while (x < w + 30) {
    const wd = 16 + ((rnd() * 18) | 0), ht = 34 + ((rnd() * 46) | 0), top = base - ht;
    for (let i = 0; i < wd; i++) for (let y = top; y <= base; y++) px(g, wrap(x + i), y, (i === 0 || i === wd - 1) ? bodyD : body);
    for (let i = 0; i < wd; i++) { px(g, wrap(x + i), top, trim); px(g, wrap(x + i), top - 1, roofc); }
    for (let i = 0; i < wd; i++) if (((i + x) & 1) === 0) px(g, wrap(x + i), top + 7, trim);
    // windows: tall slots, black, two or three to a floor
    for (let y = top + 11; y < base - 10; y += 9) for (let i = 3; i < wd - 3; i += 6) { for (let j = 0; j < 5; j++) { px(g, wrap(x + i), y + j, win); px(g, wrap(x + i + 1), y + j, win); } px(g, wrap(x + i), y - 1, trim); px(g, wrap(x + i + 1), y - 1, trim); }
    // the door, open, with the street's silt drifted into it
    { const dx = x + 3 + ((rnd() * Math.max(1, wd - 8)) | 0);
      for (let j = 0; j < 9; j++) for (let i = 0; i < 4; i++) px(g, wrap(dx + i), base - j, j < 2 ? '#15262a' : win);
      for (let i = 0; i < 4; i++) px(g, wrap(dx + i), base - 9, trim); }
    // a bracket lamp on the face, and nearly half of them are out
    { const lx = x + 1 + ((rnd() * (wd - 2)) | 0), ly = base - 14 - ((rnd() * 10) | 0);
      px(g, wrap(lx), ly, IR.m); px(g, wrap(lx + 1), ly, IR.m);
      if (rnd() < 0.55) farLamp(g, w, lx + 2, ly + 1, 1); else { px(g, wrap(lx + 2), ly + 1, IR.l); px(g, wrap(lx + 2), ly + 2, IR.d); } }
    for (let i = 0; i < 3; i++) { const wx = x + ((rnd() * wd) | 0), hh = 3 + ((rnd() * 7) | 0); for (let j = 0; j < hh; j++) px(g, wrap(wx), base - j, j > hh - 3 ? WD[1] : WD[2]); }
    x += wd;
  }
  // THE FALLEN BRIDGE: a span down at an angle across the lot of it, its piers still standing
  { const bx = Math.round(w * 0.62), by = h - 58;
    for (let i = 0; i < 90; i++) { const yy = by + Math.round(i * 0.42); for (let j = 0; j < 4; j++) px(g, wrap(bx + i), yy + j, j === 0 ? trim : bodyD); }
    for (const p of [0, 1]) { const pxx = bx - 10 + p * 104; for (let y = by + p * 40; y < h; y++) for (let i = 0; i < 6; i++) px(g, wrap(pxx + i), y, i < 2 ? bodyD : body); } }
  for (let i = 0; i < w * h / 1400; i++) px(g, (rnd() * w) | 0, (rnd() * h) | 0, '#27585a');
  return c;
}

// THE NEAR SIDE: the buildings we are walking past, big enough to read as architecture — a colonnade with the
// water standing black between its columns, an arched shopfront with its shutters gone, iron railings, and
// chains hanging down out of the frame. Darker than the mid layer, so the street reads as a canyon.
export function bakeNearCity(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const wrap = v => ((Math.round(v) % w) + w) % w;
  const body = '#16282e', bodyL = '#1e343a', dark = '#0c1a1e', trim = '#264244', base = h - 1;
  let x = 0;
  while (x < w + 40) {
    const kind = rnd();
    if (kind < 0.38) { // A COLONNADE: columns with the black water standing between them
      const n = 4 + ((rnd() * 3) | 0), sp = 13, top = base - 96 - ((rnd() * 30) | 0);
      for (let i = 0; i < n * sp + 6; i++) for (let y = top; y < top + 12; y++) px(g, wrap(x + i), y, y < top + 3 ? trim : body);
      for (let k = 0; k < n; k++) { const cx2 = x + 4 + k * sp;
        for (let y = top + 12; y <= base; y++) for (let i = 0; i < 6; i++) px(g, wrap(cx2 + i), y, i === 0 ? dark : i === 1 ? bodyL : i < 5 ? body : dark);
        for (let i = -1; i < 7; i++) { px(g, wrap(cx2 + i), top + 12, trim); px(g, wrap(cx2 + i), base - 3, trim); }
        for (let y = top + 16; y < base - 5; y += 3) for (let i = 1; i < 5; i++) if (((i + y) & 1) === 0) px(g, wrap(cx2 + i), y, bodyL); }
      x += n * sp + 8;
    } else if (kind < 0.72) { // AN ARCHED FRONT: a shop with its shutter gone and the dark standing in it
      const wd = 30 + ((rnd() * 14) | 0), top = base - 104 - ((rnd() * 40) | 0);
      for (let i = 0; i < wd; i++) for (let y = top; y <= base; y++) px(g, wrap(x + i), y, (i < 2 || i > wd - 3) ? dark : body);
      for (let i = 0; i < wd; i++) { px(g, wrap(x + i), top, trim); px(g, wrap(x + i), top + 1, trim); }
      const ar = Math.round((wd - 10) / 2), acx = x + Math.round(wd / 2), ay = base - 34;
      for (let i = -ar; i <= ar; i++) { const dy = Math.round(Math.sqrt(Math.max(0, ar * ar - i * i)) * 0.8); for (let y = ay - dy; y <= base; y++) px(g, wrap(acx + i), y, dark); }
      for (let i = -ar; i <= ar; i++) { const dy = Math.round(Math.sqrt(Math.max(0, ar * ar - i * i)) * 0.8); px(g, wrap(acx + i), ay - dy, trim); px(g, wrap(acx + i), ay - dy - 1, bodyL); }
      for (let y = top + 8; y < ay - Math.round(ar * 0.8) - 6; y += 11) for (let i = 5; i < wd - 5; i += 9) { for (let j = 0; j < 7; j++) for (let q = 0; q < 3; q++) px(g, wrap(x + i + q), y + j, dark); for (let q = -1; q < 4; q++) px(g, wrap(x + i + q), y - 1, trim); }
      { const lx = x + 2, ly = ay - 22; for (let i = 0; i < 4; i++) px(g, wrap(lx + i), ly, IR.m); if (rnd() < 0.6) { farLamp(g, w, lx + 4, ly + 2, 1); px(g, wrap(lx + 4), ly + 1, IR.d); } }
      x += wd;
    } else { // A PLAIN WALL with railings along the top and weed in every joint
      const wd = 20 + ((rnd() * 20) | 0), top = base - 60 - ((rnd() * 50) | 0);
      for (let i = 0; i < wd; i++) for (let y = top; y <= base; y++) px(g, wrap(x + i), y, ((i + y) & 7) === 0 ? bodyL : body);
      for (let i = 0; i < wd; i++) px(g, wrap(x + i), top, trim);
      for (let i = 1; i < wd; i += 3) { px(g, wrap(x + i), top - 1, IR.m); px(g, wrap(x + i), top - 2, IR.m); px(g, wrap(x + i), top - 3, IR.l); }
      for (let i = 0; i < wd; i++) px(g, wrap(x + i), top - 4, IR.m);
      for (let i = 0; i < 5; i++) { const wx = x + ((rnd() * wd) | 0), hh = 4 + ((rnd() * 10) | 0); for (let j = 0; j < hh; j++) px(g, wrap(wx), base - j, j > hh - 3 ? WD[1] : WD[2]); }
      x += wd;
    }
  }
  // CHAINS: the city is full of them, hanging down from something over the frame
  for (let k = 0; k < 5; k++) { const cx2 = (rnd() * w) | 0, len = 40 + ((rnd() * (h - 50)) | 0);
    for (let y = 0; y < len; y++) { const o = Math.round(Math.sin(y * 0.11 + k) * 1.4); px(g, wrap(cx2 + o), y, (y & 1) ? IR.m : IR.l); if ((y & 3) === 0) px(g, wrap(cx2 + o + 1), y, IR.d); } }
  for (let i = 0; i < w * h / 1100; i++) px(g, (rnd() * w) | 0, (rnd() * h) | 0, '#1d3a3e');
  return c;
}

// THE FOREGROUND: what hangs between us and the street — kelp standing up out of the bottom of the frame,
// a chain or two, and a drift of silt. Nearly black, so it frames without hiding anything.
export function bakeFGCity(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const wrap = v => ((Math.round(v) % w) + w) % w;
  for (let k = 0; k < 9; k++) { // kelp: a stipe with blades off it, leaning
    const x0 = (rnd() * w) | 0, ht = Math.round(h * (0.4 + rnd() * 0.55)), lean = (rnd() - 0.5) * 0.3;
    for (let j = 0; j < ht; j++) { const y = h - 1 - j, xx = x0 + Math.round(j * lean + Math.sin(j * 0.08 + k) * 2);
      px(g, wrap(xx), y, '#0b1f18'); px(g, wrap(xx + 1), y, '#132b20');
      if (j > 6 && (j % 9) === 0) { const dir = ((j / 9) | 0) % 2 ? 1 : -1, bl = 4 + ((rnd() * 7) | 0); for (let i = 1; i <= bl; i++) px(g, wrap(xx + dir * i), y - Math.round(i * 0.5), i > bl - 2 ? '#10261c' : '#0b1f18'); } }
  }
  for (let k = 0; k < 3; k++) { const cx2 = (rnd() * w) | 0, len = Math.round(h * (0.3 + rnd() * 0.6));
    for (let y = 0; y < len; y++) { const o = Math.round(Math.sin(y * 0.09 + k * 2) * 2); px(g, wrap(cx2 + o), y, (y & 1) ? '#101418' : '#191f24'); px(g, wrap(cx2 + o + 1), y, '#0a0e11'); } }
  for (let x = 0; x < w; x++) { const hh = 2 + Math.round(2 + Math.sin(x * 0.05) * 2 + rnd() * 2); for (let j = 0; j < hh; j++) px(g, x, h - 1 - j, j === hh - 1 ? '#16282a' : '#0d1a1c'); }
  return c;
}
