// ============================================================================================
// UNDERLEAF'S OWN GROUND.
// Every other level in BRACKEN stands on rock, sand, deck or coral. A village stands on a road
// that somebody laid, and a road is the one surface here with a HISTORY in it: setts worn round
// by two hundred years of feet, two ruts where the carts always go, grass coming up through the
// joints wherever nobody walks, and the camber falling away to a gutter at each side.
//
// This matters more than usual in this level, because Underleaf is read by EAR and the surface
// under you is the thing that gives you away. Cobbles are loud and moss is silent, so the player
// has to be able to tell them apart AT A GLANCE, in the dark, at sixteen pixels. The textures are
// not decoration here - they are the rule.
// ============================================================================================
import { canvas, rect, px, mulberry } from './px.js';

const T = 16;

// THE COBBLED STREET. Setts laid in rough courses, bigger and squarer up the middle of the road,
// small and broken at the edges where the gutter is. The two cart ruts are polished pale.
function cobbleTop(seed, eL, eR) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, '#2e2a36');                                   // the bedding sand between the stones
  const tone = () => { const t = rnd(); return t < 0.16 ? '#4c4858' : t < 0.42 ? '#5a5666' : t < 0.76 ? '#666274' : '#727084'; };
  // four courses of setts, each offset, each stone its own size so the road never reads as a grid
  let y = 0, row = 0;
  while (y < T) {
    const h = 3 + ((rnd() * 2) | 0);
    let x = -((rnd() * 4) | 0) - (row % 2) * 2;
    while (x < T) {
      const w = 3 + ((rnd() * 3) | 0);
      const col = tone();
      rect(g, x, y, w - 1, h - 1, col);
      rect(g, x, y, w - 1, 1, '#807e94');                           // the crown of each sett, catching what light there is
      if (rnd() < 0.18) px(g, x + 1 + ((rnd() * Math.max(1, w - 2)) | 0), y + 1 + ((rnd() * Math.max(1, h - 2)) | 0), '#3e3a4a');
      x += w;
    }
    y += h; row++;
  }
  // THE RUTS: two pale bands a cart's width apart, worn smooth and dished
  for (const rx of [4, 11]) for (let yy = 0; yy < T; yy++) {
    if (rnd() < 0.72) px(g, rx, yy, '#8e8ca2');
    if (rnd() < 0.38) px(g, rx + 1, yy, '#83819a');
  }
  // grass in the joints, but only away from the ruts - nothing grows where the wheels go
  for (let i = 0; i < 5; i++) { const gx = rnd() < 0.5 ? ((rnd() * 3) | 0) : 13 + ((rnd() * 3) | 0);
    px(g, gx, (rnd() * T) | 0, rnd() < 0.5 ? '#3f6e2c' : '#53894a'); }
  // and the gutter where the road stops
  if (eL) { rect(g, 0, 0, 1, T, '#241f2c'); for (let yy = 1; yy < T; yy += 3) px(g, 1, yy, '#3a4a38'); }
  if (eR) { rect(g, T - 1, 0, 1, T, '#241f2c'); for (let yy = 2; yy < T; yy += 3) px(g, T - 2, yy, '#3a4a38'); }
  return c;
}

// THE EDGE of the road where it breaks off: a kerbstone, and the make-up under it spilling out.
function cobbleEdge(seed, eL, eR) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, '#3a3240');
  for (let i = 0; i < 26; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? '#463c4e' : '#2e2834');
  if (eL) { rect(g, 0, 0, 3, T, '#5a5666'); rect(g, 0, 0, 1, T, '#6e6a80'); }
  if (eR) { rect(g, T - 3, 0, 3, T, '#5a5666'); rect(g, T - 1, 0, 1, T, '#6e6a80'); }
  return c;
}

// WHAT IS UNDER A VILLAGE: made ground. Packed earth with the old foundations of whatever stood
// here before, a few pot sherds, and the roots of the hedges coming down into it.
function villageFill(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, '#332b33');
  for (let i = 0; i < 40; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.4 ? '#3e343c' : rnd() < 0.75 ? '#2a2430' : '#463a42');
  if (rnd() < 0.5) { const bx = (rnd() * 9) | 0, by = (rnd() * 11) | 0;      // a buried course of stone
    rect(g, bx, by, 5 + ((rnd() * 3) | 0), 3, '#4a4452'); rect(g, bx, by, 5, 1, '#57516040'); }
  if (rnd() < 0.28) px(g, (rnd() * T) | 0, (rnd() * T) | 0, '#8a6a48');      // a sherd of somebody's pot
  for (let i = 0; i < 2; i++) { const rx = (rnd() * T) | 0; for (let yy = 0; yy < 4 + ((rnd() * 5) | 0); yy++) px(g, rx + ((rnd() * 3) | 0) - 1, yy, '#2a2220'); }
  return c;
}

// THE DRAIN: brick, laid in a barrel, wet to a line and green below it. Nobody has been down here
// with a light in a long time.
function drainTile(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, '#241f28');
  for (let row = 0, y = 0; y < T; y += 4, row++) for (let x = (row % 2) * 4 - 4; x < T; x += 8) {
    const t = rnd(); rect(g, x + 1, y + 1, 6, 2, t < 0.3 ? '#3e3038' : t < 0.7 ? '#4a3a40' : '#544048');
    if (t < 0.2) px(g, x + 2 + ((rnd() * 4) | 0), y + 1, '#2c2228');
  }
  rect(g, 0, 9, T, 1, '#2a3a34');                                            // the tide line the water leaves
  for (let x = 0; x < T; x++) if (rnd() < 0.55) px(g, x, 10 + ((rnd() * 5) | 0), rnd() < 0.5 ? '#2f4a3a' : '#26402f');
  if (rnd() < 0.2) { const dx = (rnd() * T) | 0; px(g, dx, 0, '#6a8a80'); px(g, dx, 1, '#4a6a60'); }   // something coming through the joint
  return c;
}

// THE GREEN, and the churchyard grass: rough turf, not lawn. Tussocks, seed heads, and the paths
// worn through it where the village always walks.
function turfTop(seed, eL, eR) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, '#2a2a30');
  const worn = rnd() < 0.28;                                                 // one tile in four is a bare path
  const base = worn ? '#4a4238' : '#2f5a33';
  rect(g, 0, 0, T, 5 + ((rnd() * 2) | 0), base);
  for (let x = 0; x < T; x++) {
    const h = worn ? 2 + ((rnd() * 2) | 0) : 3 + ((rnd() * 4) | 0);
    const col = worn ? (rnd() < 0.5 ? '#584e40' : '#4a4238') : (rnd() < 0.3 ? '#3f7a44' : rnd() < 0.7 ? '#356536' : '#2a5030');
    for (let yy = 0; yy < h; yy++) px(g, x, yy, col);
    if (!worn && rnd() < 0.2) { px(g, x, h, '#4a8a50'); if (rnd() < 0.4) px(g, x, h + 1, '#8a9a58'); }   // a seed head
  }
  for (let i = 0; i < 16; i++) px(g, (rnd() * T) | 0, 5 + ((rnd() * 11) | 0), rnd() < 0.5 ? '#332b2e' : '#28222a');
  if (eL) rect(g, 0, 0, 1, 6, '#24401f');
  if (eR) rect(g, T - 1, 0, 1, 6, '#24401f');
  return c;
}

export function bakeVillageTiles() {
  const top = {}, edge = {}, turf = {};
  for (const eL of [0, 1]) for (const eR of [0, 1]) {
    const k = eL + '' + eR;
    top[k] = [0, 1, 2, 3].map(i => cobbleTop(7100 + i * 3 + eL * 11 + eR * 17, eL, eR));
    turf[k] = [0, 1, 2, 3].map(i => turfTop(7300 + i * 3 + eL * 11 + eR * 17, eL, eR));
    if (eL || eR) edge[k] = [0, 1].map(i => cobbleEdge(7200 + i + eL * 5 + eR * 7, eL, eR));
  }
  return {
    top, edge, turf,
    fill: [0, 1, 2, 3].map(i => villageFill(7400 + i)),
    silt: [0, 1, 2].map(i => drainTile(7500 + i)),
    wet: [0, 1, 2].map(i => drainTile(7510 + i)),
    ledge: null, ledgeL: null, ledgeR: null,
  };
}
