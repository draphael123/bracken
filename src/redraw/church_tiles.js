// church_tiles.js - THE LIT CHURCH's own TILE KIT (claude/churchart). It used to wear the shared grey brick. Now:
//   ASHLAR     the nave, transepts, tower and narthex: big cut limestone blocks in a warm grey, chiselled edges, dark joints, a hanging cornice under every floor
//   FLAGS      the nave's, crossing's and chapels' floors (the top face): a chequer of pale and dark marble flags with a worn lip, the gallery's an oak-boarded loft
//   MARBLE     the sanctuary: white marble with a gilt inlay band, a gold-lipped floor
//   CRYPT      the dead's cold blue-grey rough stone with OSSUARY courses: skulls and long bones stacked in dark niches, a bone-dust floor
//   TURF/SOIL  the graveyard: night turf over black earth with roots and bone-pale pebbles, a stone footing under it
//   BONE SPIKES (SPIKE) ribs and femurs stood on end in a heap of bones, iron-tipped
//   LEDGES (ONEWAY) by role: PEWS (carved oak), the TRIFORIUM (a stone corbel table), OSSUARY SHELVES (bone-laden slabs), WELL LANDINGS (iron grating on stone), the gallery's RAIL (oak), plain corbels
// Made from px.js primitives, 16x16, baked once and memoised.   churchTile(t, x, y, at, T, L) -> the canvas for one cell, or null
import { canvas, px, rect } from '../px.js';

export const CK = {
  ash: ['#8c8878', '#807c6e', '#96917f', '#85816f'], ashJoint: '#4a463e', ashHi: '#b8b29e', ashLo: '#5e5a4e', ashDeep: '#3a372f',
  flagA: '#b4ae9c', flagB: '#6e6a62', flagJoint: '#3e3b35', flagHi: '#d4cebc',
  cr: ['#4e546a', '#454a5e', '#585e74', '#4a5066'], crJoint: '#262a38', crHi: '#7a82a0', crLo: '#32364a', crDeep: '#1a1c28',
  bone: '#ddd5bc', boneMid: '#b9af92', boneLo: '#7e7660', niche: '#12101a', nicheHi: '#241f30',
  mar: ['#dcd8d0', '#cfcbc1', '#e6e2d8', '#d4d0c6'], marJoint: '#9a968c', marHi: '#fffdf4', gold: '#d8b040', goldHi: '#fff0a8', goldLo: '#8a6a1c',
  turf: ['#2f4a3a', '#27402f', '#3a5a44', '#233a2c'], turfHi: '#5a8264', soil: ['#3a2e2a', '#2e2420', '#46372e', '#261e1a'], pebble: ['#c8c0a8', '#7a7060', '#5a5246'],
  oak: ['#6a4426', '#5a381e', '#7a5230', '#4e301a'], oakHi: '#a0703c', oakLo: '#2e1c10', iron: '#3a3846', ironHi: '#6a6880', rust: '#6a3a28',
  stone: '#9a9684', rubble: ['#5a5648', '#46423a', '#6e6a5a'],
};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };

/* the level's own map of materials (the cross: nave floor row 37, gallery row 19, crypt floor row 54, south transept floor 41) */
export const ZONES = { nf: 37, gf: 19, cf: 54, sf: 41, yardTo: 43, sanctFrom: 241, cryptX: [46, 178], cryptY0: 39 };
export const matOf = (x, y) => {
  const Z = ZONES;
  if (x <= Z.yardTo && y >= Z.nf) return y >= Z.nf + 5 ? 'footing' : 'earth';
  if (x >= Z.sanctFrom) return 'marble';
  if (x >= Z.cryptX[0] && x <= Z.cryptX[1] + 4 && y >= Z.cryptY0 && y <= 59) return 'crypt';
  if (x >= 179 && y >= 42) return 'crypt';
  if (y >= 55) return 'crypt';
  return 'ash';
};

function ashTile(x, y, o) {
  const key = ['a', x % 5, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.aD ? 'D' : '', o.win || '', o.flag || ''].join('');
  return once(key, () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
      const wx = wx0 + xx, wy = wy0 + yy, r = Math.floor(wy / 12), bw = 22 + (hash(r, 7) % 3) * 6, off = hash(r, 11) % bw, cc = Math.floor((wx + off) / bw), bx = (wx + off) - cc * bw, by = wy - r * 12;
      let col = CK.ash[hash(cc, r) % 4];
      if (by === 11 || bx === bw - 1) col = CK.ashJoint; else if (by === 0 || bx === 0) col = CK.ashHi; else if (by === 10 || bx === bw - 2) col = CK.ashLo;
      else if (hash(wx, wy) % 21 === 0) col = CK.ashLo; else if (hash(wx + 5, wy) % 29 === 0) col = CK.ashHi;
      px(g, xx, yy, col); }
    if (o.flag) { for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy, sq = ((wx >> 3) + (wy >> 3)) & 1;
        let col = yy < 8 ? (sq ? CK.flagB : CK.flagA) : CK.ash[hash(wx >> 4, wy >> 3) % 4]; if (yy < 8 && ((wx & 7) === 7 || (yy === 7))) col = CK.flagJoint; if (yy === 0) col = sq ? '#8a867c' : CK.flagHi; if (yy >= 8) { const by = wy % 12; if (by === 11) col = CK.ashJoint; }
        px(g, xx, yy, col); }
      for (let xx = 0; xx < 16; xx++) { px(g, xx, 8, CK.ashLo); px(g, xx, 9, CK.ashDeep); } }
    else if (o.up) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, CK.ashHi); px(g, xx, 1, CK.ash[0]); px(g, xx, 2, CK.ashLo); } }
    if (o.aL) for (let yy = 0; yy < 16; yy++) { px(g, 0, yy, CK.ashDeep); px(g, 1, yy, CK.ashLo); }
    if (o.aR) for (let yy = 0; yy < 16; yy++) { px(g, 15, yy, CK.ashHi); px(g, 14, yy, CK.ash[0]); }
    if (o.aD) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 15, CK.ashDeep); px(g, xx, 14, CK.ashLo); px(g, xx, 13, xx & 1 ? CK.ashHi : CK.ash[2]); } }   /* the cornice's hanging lip */
    if (o.win === 'slit') { rect(g, 6, 2, 4, 12, CK.ashDeep); rect(g, 7, 3, 2, 10, '#1c2a5a'); rect(g, 7, 3, 2, 3, '#5a78d0'); px(g, 7, 9, '#c8503c'); rect(g, 5, 1, 6, 1, CK.ashHi); }
    return c; });
}
function marbleTile(x, y, o) {
  return once(['m', x % 4, y % 3, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.aD ? 'D' : '', o.band ? 'B' : ''].join(''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy, r = Math.floor(wy / 16), cc = Math.floor((wx + (r & 1) * 12) / 24), bx = (wx + (r & 1) * 12) % 24, by = wy % 16;
      let col = CK.mar[hash(cc, r) % 4]; if (by === 15 || bx === 23) col = CK.marJoint; else if (by === 0) col = CK.marHi; else if ((wx * 3 + wy * 5) % 37 === 0 || (wx * 7 - wy * 3 + 400) % 53 === 0) col = '#b8b8c8';   /* a vein */
      px(g, xx, yy, col); }
    if (o.up) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, CK.goldHi); px(g, xx, 1, CK.gold); px(g, xx, 2, CK.goldLo); } for (let yy = 3; yy < 16; yy += 5) for (let xx = 0; xx < 16; xx++) if (!((xx + yy) & 3)) px(g, xx, yy, CK.marJoint); }
    if (o.band) { rect(g, 0, 6, 16, 3, CK.goldLo); rect(g, 0, 7, 16, 1, CK.gold); for (let xx = 2; xx < 16; xx += 8) { px(g, xx, 7, CK.goldHi); px(g, xx + 1, 6, CK.goldHi); } }
    if (o.aL) for (let yy = 0; yy < 16; yy++) px(g, 0, yy, CK.marJoint);
    if (o.aR) for (let yy = 0; yy < 16; yy++) px(g, 15, yy, CK.marHi);
    if (o.aD) for (let xx = 0; xx < 16; xx++) { px(g, xx, 15, CK.gold); px(g, xx, 14, CK.marJoint); }
    return c; });
}
function cryptTile(x, y, o) {
  const key = ['c', x % 6, y % 5, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.aD ? 'D' : '', o.ossuary || ''].join('');
  return once(key, () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
      const wx = wx0 + xx, wy = wy0 + yy, r = Math.floor(wy / 8), off = (r & 1) * 7, cc = Math.floor((wx + off) / 14), bx = (wx + off) - cc * 14, by = wy - r * 8;
      let col = CK.cr[hash(cc, r) % 4]; if (by === 7 || bx === 13) col = CK.crJoint; else if (by === 0) col = CK.crHi; else if (by === 6) col = CK.crLo; else if (hash(wx, wy) % 17 === 0) col = CK.crLo;
      px(g, xx, yy, col); }
    if (o.ossuary) {   /* a niche of stacked bone: skulls over crossed long bones, a dark recess */
      rect(g, 1, 1, 14, 14, CK.niche); rect(g, 1, 1, 14, 1, CK.crDeep); rect(g, 1, 2, 1, 13, CK.nicheHi);
      const s = o.ossuary === 'skulls';
      if (s) for (let k = 0; k < 3; k++) { const sx = 2 + k * 4 + (hash(x, y + k) % 2); rect(g, sx, 3 + (k & 1) * 4, 4, 4, CK.bone); rect(g, sx + 1, 7 + (k & 1) * 4, 2, 1, CK.boneMid); px(g, sx + 1, 4 + (k & 1) * 4, CK.niche); px(g, sx + 2, 4 + (k & 1) * 4, CK.niche); px(g, sx + 1, 6 + (k & 1) * 4, CK.boneLo); }
      else for (let k = 0; k < 5; k++) { const by = 2 + k * 3, sh = hash(x + k, y) % 3; rect(g, 2 + sh, by, 11 - sh, 2, CK.bone); rect(g, 2 + sh, by + 1, 11 - sh, 1, CK.boneMid); px(g, 2 + sh, by, CK.boneMid); px(g, 12, by + 1, CK.boneLo); }
      rect(g, 1, 14, 14, 1, CK.boneLo); }
    if (o.up) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, CK.crHi); px(g, xx, 1, CK.cr[0]); px(g, xx, 2, hash(wx0 + xx, 5) % 5 === 0 ? CK.bone : CK.crLo); } }   /* bone dust on the floor */
    if (o.aL) for (let yy = 0; yy < 16; yy++) { px(g, 0, yy, CK.crDeep); px(g, 1, yy, CK.crLo); }
    if (o.aR) for (let yy = 0; yy < 16; yy++) { px(g, 15, yy, CK.crHi); px(g, 14, yy, CK.cr[0]); }
    if (o.aD) for (let xx = 0; xx < 16; xx++) { px(g, xx, 15, CK.crDeep); px(g, xx, 14, CK.crLo); }
    return c; });
}
function earthTile(x, y, o) {
  return once(['e', x % 5, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.depth > 2 ? 3 : o.depth].join(''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy; let col = CK.soil[(hash(wx >> 1, wy >> 1) + (wy >> 3)) % 4]; const dp = o.depth * 16 + yy;
      if (hash(wx, wy) % 211 === 0) col = CK.pebble[hash(wx, wy + 3) % 3]; if (dp > 24 && hash(wx, wy) % 397 === 1) col = CK.bone; px(g, xx, yy, col); }
    if (o.up) { for (let xx = 0; xx < 16; xx++) { const h = hash(wx0 + xx, 2) % 3; for (let k = 0; k < 4 + h; k++) px(g, xx, k, CK.turf[(hash(wx0 + xx, k) + k) % 4]); px(g, xx, 0, hash(wx0 + xx, 9) % 3 ? CK.turfHi : CK.turf[2]); if (hash(wx0 + xx, 4) % 5 === 0) px(g, xx, -0, '#7aa484'); } }
    if (o.aL) for (let yy = 0; yy < 16; yy++) px(g, 0, yy, CK.soil[3]);
    return c; });
}
function boneSpike(x) {
  return once('bs' + (x % 3), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    rect(g, 0, 11, 16, 5, CK.crDeep);
    for (let k = 0; k < 8; k++) { const bx = (k * 2 + (hash(wx0, k) % 2)) % 14, by = 10 + (hash(wx0 + k, 5) % 4); rect(g, bx, by, 3, 2, CK.bone); rect(g, bx, by + 1, 3, 1, CK.boneMid); }
    [2, 6, 10, 13].forEach((sx, i) => { const top = 1 + (hash(wx0 + i, 8) % 4), rib = i % 2; for (let yy = top + 3; yy < 12; yy++) { px(g, sx + (rib && yy < top + 6 ? 1 : 0), yy, CK.bone); px(g, sx + 1 + (rib && yy < top + 6 ? 1 : 0), yy, CK.boneLo); }
      px(g, sx, top + 2, CK.ironHi); px(g, sx, top + 1, '#c8c8d8'); px(g, sx, top, '#ffffff'); px(g, sx + 1, top + 2, CK.iron); });
    return c; });
}
/* LEDGES */
function pewLedge(x, l, r) { return once('pw' + (x % 3) + (l ? 'L' : '') + (r ? 'R' : ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
  for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 16; xx++) { let col = yy === 0 ? CK.oakHi : yy < 3 ? CK.oak[0] : CK.oak[1]; if (yy < 3 && hash((wx0 + xx) >> 2, yy) % 7 === 0) col = CK.oak[2]; px(g, xx, yy, col); }
  rect(g, 0, 5, 16, 1, CK.oakLo); if (l) { rect(g, 0, 0, 2, 5, CK.oakLo); px(g, 0, 0, CK.oakHi); } if (r) { rect(g, 14, 0, 2, 5, CK.oakLo); px(g, 15, 0, CK.oakHi); } return c; }); }
function corbelLedge(x, l, r, stone) { const P = stone || CK.ash; return once('cb' + (x % 3) + (l ? 'L' : '') + (r ? 'R' : '') + (stone ? 'c' : ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
  for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) { px(g, xx, yy, yy === 0 ? CK.ashHi : yy < 4 ? P[(xx + wx0 >> 4) % 4] : yy === 4 ? CK.ashLo : CK.ashJoint); }
  for (let k = 0; k < 3; k++) { rect(g, 3 + k * 5, 6, 2, 1, CK.ashDeep); }
  for (let xx = 0; xx < 16; xx += 8) { rect(g, xx + 2, 6, 4, 1, CK.ashLo); rect(g, xx + 3, 7, 2, 1, CK.ashLo); }   /* the corbel */
  if ((wx0 >> 4) % 2 === 0) { px(g, 8, 2, CK.ashJoint); px(g, 7, 3, CK.ashJoint); px(g, 9, 3, CK.ashJoint); }   /* a trefoil nick */
  if (l) { g.clearRect(0, 0, 1, 2); px(g, 0, 2, CK.ashJoint); } if (r) { g.clearRect(15, 0, 1, 2); px(g, 15, 2, CK.ashJoint); } return c; }); }
function shelfLedge(x, l, r) { return once('sh' + (x % 3) + (l ? 'L' : '') + (r ? 'R' : ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
  for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 16; xx++) px(g, xx, yy, yy === 0 ? CK.crHi : yy < 3 ? CK.cr[(xx >> 3) + (x & 1)] : CK.crJoint);
  for (let k = 0; k < 4; k++) { const bx = (hash(wx0, k) % 12); rect(g, bx, -0, 4, 1, CK.bone); px(g, bx + 1, 0, CK.boneMid); } px(g, 4 + (hash(wx0, 9) % 8), 0, CK.bone);   /* bones heaped on the shelf */
  if (l) g.clearRect(0, 0, 1, 1); if (r) g.clearRect(15, 0, 1, 1); return c; }); }
function landingLedge(x, l, r) { return once('ld' + (x % 2) + (l ? 'L' : '') + (r ? 'R' : ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
  rect(g, 0, 0, 16, 2, CK.ironHi); rect(g, 0, 2, 16, 3, CK.iron); for (let xx = 1; xx < 16; xx += 3) { rect(g, xx, 2, 1, 3, '#14121c'); }   /* grating */
  rect(g, 0, 5, 16, 1, CK.rust); for (const bx of [3, 11]) px(g, bx, 1, '#a89878'); if (l) rect(g, 0, 0, 2, 5, CK.rust); if (r) rect(g, 14, 0, 2, 5, CK.rust); return c; }); }
function railLedge(x, l, r) { return once('rl' + (x % 3) + (l ? 'L' : '') + (r ? 'R' : ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
  for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 16; xx++) { let col = yy === 0 ? CK.oakHi : yy < 3 ? CK.oak[1] : CK.oakLo; if (yy < 3 && ((wx0 + xx) & 15) === 15) col = CK.oakLo; px(g, xx, yy, col); }
  for (const nx of [2, 13]) px(g, nx, 1, CK.ironHi); if (l) { rect(g, 0, 0, 2, 5, CK.iron); } if (r) { rect(g, 14, 0, 2, 5, CK.iron); } return c; }); }

const BAND_Y = 33;
export function churchTile(t, x, y, at, T, L) {
  const open = v => v === T.AIR || v === T.ONEWAY || v === T.SPIKE || v === T.PORT;
  const Z = ZONES;
  if (t === T.SPIKE) return boneSpike(x);
  if (t === T.ONEWAY) {
    let a = x, b = x; while (at(a - 1, y) === T.ONEWAY && x - a < 40) a--; while (at(b + 1, y) === T.ONEWAY && b - x < 40) b++;
    const l = x === a, r = x === b; const dc = (L.decor || []).find(d => (d.kind === 'pew' || d.kind === 'triforium' || d.kind === 'shelf') && d.y === y && x >= d.x0 && x <= d.x1);
    if (dc && dc.kind === 'pew') return pewLedge(x, l, r); if (dc && dc.kind === 'shelf') return shelfLedge(x, l, r); if (dc && dc.kind === 'triforium') return corbelLedge(x, l, r);
    if (x >= Z.sanctFrom) return pewLedge(x, l, r);
    if (x >= 158 && x <= 168 && y >= 40 && y <= Z.cf) return landingLedge(x, l, r);
    if (y >= Z.cryptY0 && x <= Z.cryptX[1] + 5) return shelfLedge(x, l, r);
    if (y <= Z.gf - 1 && x < Z.sanctFrom) return railLedge(x, l, r);
    return corbelLedge(x, l, r); }
  if (t !== T.SOLID && t !== T.PORT) return null;
  if (t === T.PORT) return null;
  const up = at(x, y - 1), dn = at(x, y + 1), lf = at(x - 1, y), rt = at(x + 1, y);
  const o = { up: up !== T.SOLID, aL: open(lf), aR: open(rt), aD: dn === T.AIR };
  let depth = 0; while (at(x, y - 1 - depth) === T.SOLID && depth < 40) depth++;
  const m = matOf(x, y);
  if (m === 'earth' || m === 'footing') { if (m === 'footing') return cryptTile(x, y, { up: o.up, aL: o.aL, aR: o.aR, aD: o.aD }); return earthTile(x, y, { up: o.up, aL: o.aL, aR: o.aR, depth }); }
  if (m === 'marble') return marbleTile(x, y, { up: o.up, aL: o.aL, aR: o.aR, aD: o.aD, band: !o.up && depth === 3 });
  if (m === 'crypt') { let oss = ''; if (!o.up && !o.aL && !o.aR && !o.aD && depth >= 1 && depth <= 5 && y >= 40 && y <= 58) { const hv = hash(x >> 1, y); if (hv % 3 === 0) oss = (hv >> 3) % 2 ? 'skulls' : 'longbones'; }
    return cryptTile(x, y, { up: o.up, aL: o.aL, aR: o.aR, aD: o.aD, ossuary: oss }); }
  const flag = o.up && y >= Z.gf && at(x, y - 1) === T.AIR && !(y === Z.gf && false);
  const win = depth >= 3 && depth <= 9 && !o.aL && !o.aR && !o.up && y < Z.nf - 1 && y < Z.gf && hash(x >> 1, y >> 2) % 13 === 0 && (y & 3) === 1 ? 'slit' : '';
  return ashTile(x, y, { up: o.up, aL: o.aL, aR: o.aR, aD: o.aD, win, flag });
}
export const CHURCH_KIT = { churchTile, CK, ZONES };
