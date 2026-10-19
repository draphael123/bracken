// src/redraw/church3_art.js - LIT CHURCH 3's drawn pieces (claude/church3art; the greybox was claude/church3's reused props and rectangles).
// THE SANCTUARY (the Paladin's arena): the three BRAZIERS of the order (a gilt sun-rimmed bowl on a stepped stone column: DARK - cold ash, a taper laid by it; LIT - a bed of coals, the
// flame laid live over it; SNUFFED - his hammer's work: the bowl dented, ash spilled down the steps, embers still ticking and a curl of smoke), THE ALTAR FIRE (a fire-bowl on a low stone
// altar with a gilt cross), THE VOTIVE RACK (an iron stand of red-glass cups: the sanctuary door's and the Deacon's crossing's), THE CROSSING'S GRATES (a stone-framed iron grate cut with a
// cross, a cold light under it when the dark is rising) and THE GHOST that comes up through them, THE DOUSED LAMP's read (cold blue smoke and a pulsing ring: his to relight).
// THE PALADIN's live pieces: the CONVICTION PIPS (the hero's HUD suns, five of them in a brass plaque), HIS LIGHT-WARD (the all-round shell: faceted, a rune ring at the foot, flaring when
// it turns a blow), WARD BROKEN (the shell's shards when a brazier is lit beside him), the BRAZIER BREAKING flare (holy fire thrown from the brazier into him), the VERDICT's floor sigil,
// the DAWNFALL ring, and his PRAYER (motes spiralling off the fire into him).
// Pure pixel work (px.js: no paths, so tools/church3art-sheet.mjs bakes it in Node). Baked props are memoised; the live pieces are fillRect only.
import { canvas, px, rect, line, ellipse, circle, outline } from '../px.js';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = Math.round, O = '#14121c';
export const K = {
  iron: '#3a3846', ironHi: '#7a7890', ironLo: '#1e1c28', stone: '#9a9684', stoneHi: '#c4bea8', stoneLo: '#5e5a4e', stoneDp: '#34322a',
  gold: '#d8b040', goldHi: '#fff0a8', goldLo: '#8a6a1c', goldDp: '#5a4410', ash: '#6a6670', ashHi: '#8e8a98', ashLo: '#3e3a46', coal: '#2a1614', ember: '#c8401c', emberHi: '#ff9a3c',
  wax: '#ece4cc', waxLo: '#b8ae90', glass: '#b8242c', glassHi: '#e8584a', glassLo: '#6a1418', blue: '#9ab0e0', blueHi: '#e0eaff', blueLo: '#4a5a9a', flameO: '#ff9a3c', flameY: '#ffd36b', flameW: '#fff6c8',
};
const pt = (g, x, y, c) => px(g, R(x), R(y), c);
/* a ring of single pixels (an ellipse's outline): the live pieces' stroke without a path */
function ring(g, cx, cy, rx, ry, c, dash = 0, rot = 0) { const n = Math.max(24, Math.ceil((rx + ry) * 2.4)); g.fillStyle = c; for (let i = 0; i < n; i++) { if (dash && ((i + Math.floor(rot)) % dash) >= dash / 2) continue; const a = i / n * Math.PI * 2; g.fillRect(R(cx + Math.cos(a) * rx), R(cy + Math.sin(a) * ry), 1, 1); } }

/* ============================================================ THE SANCTUARY BRAZIER */
export const SB_WICK = [16, 14];   /* the flame's foot, from the sprite's top-left */
export function bakeSanctuaryBrazier(state) { return once('sb' + state, () => { const [c, g] = canvas(32, 46); const lit = state === 'lit', sn = state === 'snuffed';
  /* the stepped stone foot and the column */
  rect(g, 5, 41, 22, 5, K.stone); rect(g, 5, 41, 22, 1, K.stoneHi); rect(g, 5, 45, 22, 1, K.stoneDp); rect(g, 8, 37, 16, 4, K.stone); rect(g, 8, 37, 16, 1, K.stoneHi); rect(g, 8, 40, 16, 1, K.stoneLo);
  rect(g, 12, 24, 8, 13, K.stone); rect(g, 12, 24, 2, 13, K.stoneHi); rect(g, 18, 24, 2, 13, K.stoneLo); for (let y = 26; y < 36; y += 3) rect(g, 14, y, 4, 1, K.stoneLo);   /* the fluting */
  rect(g, 10, 22, 12, 3, K.stoneHi); rect(g, 10, 24, 12, 1, K.stoneLo); circle(g, 16, 31, 2.4, K.gold); px(g, 15, 30, K.goldHi); px(g, 17, 32, K.goldLo);              /* the sun roundel on the column */
  for (const [dx, dy] of [[0, -4], [0, 4], [-4, 0], [4, 0]]) px(g, 16 + dx, 31 + dy, K.gold);
  /* the bowl: gilt, a sun's rays round the rim */
  for (let r = 0; r < 8; r++) { const hw = 11 - Math.floor(r * 0.9), yy = 14 + r; rect(g, 16 - hw, yy, hw * 2, 1, r < 2 ? K.goldHi : r < 6 ? K.gold : K.goldLo); px(g, 16 - hw, yy, K.goldDp); px(g, 16 + hw - 1, yy, r < 5 ? K.goldHi : K.gold); }
  rect(g, 4, 13, 24, 2, K.gold); rect(g, 4, 13, 24, 1, K.goldHi); rect(g, 4, 14, 24, 1, K.goldLo);
  for (let x = 6; x < 27; x += 5) { px(g, x, 12, K.gold); px(g, x + 1, 11, K.goldHi); }                                                                                    /* the rays */
  for (let x = 8; x < 25; x += 4) px(g, x, 17, K.goldDp);
  if (sn) { rect(g, 6, 12, 20, 2, K.ashLo); for (let x = 7; x < 25; x += 2) px(g, x, 12, (x >> 1) & 1 ? K.ash : K.ashHi); px(g, 10, 12, K.ember); px(g, 19, 12, K.emberHi); px(g, 14, 13, K.ember); px(g, 22, 12, K.ember);
    rect(g, 2, 14, 3, 1, K.goldLo); px(g, 4, 15, K.gold);                                                                                                                  /* the dent: the rim bent in */
    for (const [x, y] of [[8, 44], [9, 43], [22, 44], [24, 43], [6, 40], [26, 40]]) px(g, x, y, (x + y) & 1 ? K.ash : K.ashLo); for (let x = 9; x < 24; x += 3) px(g, x, 36, K.ash);   /* ash spilled down the steps */ }
  else if (lit) { rect(g, 6, 12, 20, 2, '#5a2214'); for (let x = 7; x < 25; x += 2) px(g, x, 12, (x >> 1) & 1 ? K.emberHi : K.ember); px(g, 16, 11, K.flameW); px(g, 12, 11, K.flameY); px(g, 20, 11, K.flameO); }
  else { rect(g, 6, 12, 20, 2, K.ashLo); for (let x = 7; x < 25; x += 3) px(g, x, 12, K.ash); px(g, 12, 12, K.coal); px(g, 20, 12, K.coal); px(g, 16, 11, K.ashHi);
    rect(g, 3, 44, 7, 1, K.wax); px(g, 3, 43, K.wax); px(g, 9, 44, '#2a2020'); }                                                                                           /* the taper laid by it: THE ONE THING IN THE ROOM THAT WANTS A FLAME */
  outline(c, O); return c; }); }
/* its light pool on the floor (live): a wide warm ellipse under a lit brazier; `big` for the three, the altar fire's wider */
export function drawLightPool(g, x, fy, r, a, time, col = '#ffd890') { const f = 0.85 + 0.15 * Math.sin(time * 9 + x * 0.3); g.globalAlpha = a * 0.16 * f; g.fillStyle = col; for (let i = 0; i < 4; i++) { const k = 1 - i * 0.22; g.fillRect(R(x - r * k), R(fy - 3 * k), R(r * 2 * k), R(5 * k)); } g.globalAlpha = 1; }
/* THE SNUFFED BRAZIER's live read: a thread of grey smoke and the last embers ticking (x, y the bowl's rim on screen); the DARK one has nothing, so the two read apart */
export function drawSnuffedSmoke(g, x, y, time, seed = 0) { for (let k = 0; k < 4; k++) { const t = (time * 0.5 + k * 0.25 + seed * 0.13) % 1; g.globalAlpha = 0.55 * (1 - t); pt(g, x + Math.sin(t * 6 + k + seed) * (2 + t * 3), y - t * 22, k & 1 ? '#9a9ab0' : '#6a6a7e'); if (t < 0.5) pt(g, x + Math.sin(t * 6 + k + seed) * (2 + t * 3) + 1, y - t * 22 + 1, '#6a6a7e'); }
  g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 7 + seed * 3); pt(g, x - 5, y + 1, K.emberHi); pt(g, x + 4, y + 1, K.ember); g.globalAlpha = 1; }
/* a DARK brazier that wants a flame: a faint pulsing pip over it (the carried flame's read) */
export function drawWants(g, x, y, time) { g.globalAlpha = 0.45 + 0.35 * Math.sin(time * 4); const d = 1 + (Math.floor(time * 4) % 2); rect(g, R(x) - 1, R(y) - d, 3, 1, K.flameY); rect(g, R(x), R(y) - d - 1, 1, 3, K.flameY); g.globalAlpha = 1; }

/* ============================================================ THE ALTAR FIRE (the east end) */
export const AF_WICKS = [[11, 11], [20, 8], [29, 11]];
export function bakeAltarFire() { return once('altarfire', () => { const [c, g] = canvas(40, 34);
  rect(g, 2, 28, 36, 6, K.stone); rect(g, 2, 28, 36, 1, K.stoneHi); rect(g, 2, 33, 36, 1, K.stoneDp); rect(g, 5, 22, 30, 6, K.stoneHi); rect(g, 5, 22, 30, 1, '#e8e2cc'); rect(g, 5, 27, 30, 1, K.stoneLo);
  rect(g, 19, 23, 2, 4, K.gold); rect(g, 17, 24, 6, 1, K.gold); px(g, 19, 23, K.goldHi); for (const x of [8, 12, 26, 30]) { rect(g, x, 23, 2, 4, K.stoneLo); px(g, x, 23, K.stone); }        /* a gilt cross, blind arcading */
  rect(g, 6, 16, 28, 6, K.iron); rect(g, 6, 16, 28, 1, K.ironHi); rect(g, 6, 21, 28, 1, K.ironLo); rect(g, 4, 15, 32, 2, K.gold); rect(g, 4, 15, 32, 1, K.goldHi); rect(g, 4, 16, 32, 1, K.goldLo);   /* the fire-trough: iron, gilt-rimmed */
  rect(g, 7, 13, 26, 3, '#5a2214'); for (let x = 8; x < 32; x += 2) px(g, x, 13, (x >> 1) & 1 ? K.emberHi : K.ember);
  for (const x of [5, 15, 25, 33]) { rect(g, x, 17, 2, 3, K.goldLo); }
  outline(c, O); return c; }); }
/* ============================================================ THE VOTIVE RACK */
export const VR_WICKS = [[5, 11], [11, 11], [17, 11], [8, 5], [14, 5]];
export function bakeVotiveRack() { return once('votiverack', () => { const [c, g] = canvas(24, 30);
  rect(g, 3, 27, 18, 3, K.iron); rect(g, 3, 27, 18, 1, K.ironHi); rect(g, 10, 14, 4, 13, K.iron); rect(g, 10, 14, 1, 13, K.ironHi);                                            /* the foot and stem */
  for (const [y, xs] of [[11, [3, 9, 15]], [5, [6, 12]]]) { rect(g, xs[0] - 2, y + 4, xs[xs.length - 1] - xs[0] + 8, 2, K.iron); rect(g, xs[0] - 2, y + 4, xs[xs.length - 1] - xs[0] + 8, 1, K.ironHi);
    for (const x of xs) { rect(g, x, y, 4, 4, K.glass); rect(g, x, y, 1, 4, K.glassHi); rect(g, x + 3, y, 1, 4, K.glassLo); rect(g, x + 1, y - 1, 2, 1, K.wax); px(g, x + 1, y - 2, '#2a2020'); } }   /* red-glass cups with a taper each */
  rect(g, 10, 21, 4, 2, K.goldLo); px(g, 11, 21, K.gold); outline(c, O); return c; }); }

/* ============================================================ THE CROSSING'S GRATES AND THE GHOST */
export function bakeCrossGrate() { return once('crossgrate', () => { const [c, g] = canvas(16, 8);
  rect(g, 0, 0, 16, 8, K.stone); rect(g, 0, 0, 16, 1, K.stoneHi); rect(g, 0, 7, 16, 1, K.stoneDp); rect(g, 2, 1, 12, 6, '#0e0b14');                                        /* the stone kerb, the dark under it */
  for (let x = 3; x < 14; x += 3) rect(g, x, 1, 1, 6, K.iron); rect(g, 2, 3, 12, 1, K.iron); rect(g, 7, 1, 2, 6, K.ironHi); rect(g, 4, 3, 8, 1, K.ironHi);                           /* the bars, a cross of heavier iron */
  px(g, 1, 3, K.goldLo); px(g, 14, 3, K.goldLo); return c; }); }
/* the cold light under a grate while the dark is rising (k 0..1: the build), and THE GHOST coming up it: a pale wisp, a face, the reaching arms (k 1: it has come through) */
export function drawGrateRise(g, x, y, k, time, seed = 0) { /* (x, y) the grate's top-left on screen */
  const a = Math.min(1, k * 1.4); g.globalAlpha = (0.4 + 0.3 * Math.sin(time * 14 + seed)) * a; rect(g, x + 2, y + 1, 12, 6, K.blueLo); rect(g, x + 4, y + 2, 8, 4, K.blue); rect(g, x + 6, y + 3, 4, 2, K.blueHi); g.globalAlpha = 1;
  const h = R(6 + 26 * k), sway = Math.sin(time * 3 + seed) * 2;
  for (let i = 0; i < h; i++) { const t = i / Math.max(1, h), w = t < 0.6 ? 2 + R(5 * Math.sin(t / 0.6 * Math.PI * 0.5 + 0.2)) : 6 - R((t - 0.6) * 12), xx = x + 8 + R(sway * t) - (w >> 1);
    g.globalAlpha = (0.65 - 0.4 * t) * Math.min(1, k * 3); rect(g, xx, y + 2 - i, w, 1, t > 0.55 ? K.blueHi : K.blue); if (i % 3 === 0) { rect(g, xx, y + 2 - i, 1, 1, K.blueLo); } }
  if (k > 0.45) { const hy = y + 2 - h; g.globalAlpha = 0.85; rect(g, x + 5 + R(sway), hy - 1, 6, 6, K.blueHi); rect(g, x + 6 + R(sway), hy + 1, 1, 2, '#14101a'); rect(g, x + 9 + R(sway), hy + 1, 1, 2, '#14101a'); rect(g, x + 7 + R(sway), hy + 3, 2, 2, '#14101a');   /* the face */
    const ar = Math.min(1, (k - 0.45) * 2.4); g.globalAlpha = 0.6; for (const s of [-1, 1]) for (let j = 0; j < 5; j++) rect(g, x + 8 + s * (4 + j) + R(sway), hy + 4 - R(j * ar * 1.4), 2, 1, K.blue); }
  g.globalAlpha = 1; }
/* a ghost that has come through, for the Deacon's crossing: it is the haunt's own sheet; this is the cold hole it leaves in the dark floor */
/* ============================================================ A DOUSED LAMP: HIS TO RELIGHT */
export function drawDoused(g, x, y, time, seed = 0) { /* (x, y) the wick on screen: cold smoke climbing off it, and a ring that pulses - the lamp is HIS, yours to relight */
  for (let k = 0; k < 6; k++) { const t = (time * 0.5 + k / 6 + seed * 0.1) % 1, sx = x + Math.sin(t * 7 + k * 2) * (2 + t * 4); g.globalAlpha = Math.min(1, 1.1 * (1 - t)); rect(g, R(sx), R(y - 2 - t * 26), 2, 2, k & 1 ? K.blue : K.blueHi); rect(g, R(sx) + 1, R(y - 1 - t * 26), 1, 1, K.blueLo); }
  const pl = 0.5 + 0.5 * Math.sin(time * 5), s = 6 + (Math.floor(time * 4) % 2), cy = R(y) - 9; g.globalAlpha = 0.18 + 0.14 * pl; circle(g, R(x), cy, s + 3, K.blue); g.globalAlpha = 0.85 + 0.15 * pl; ring(g, R(x), cy, s, s, K.blueHi); ring(g, R(x), cy, s + 1, s + 1, K.blue); for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) rect(g, R(x) + dx * (s + 3) - 1, cy + dy * (s + 3) - 1, 3, 3, K.blueHi);
  rect(g, R(x) - 1, R(y) - 1, 3, 1, K.blueHi); g.globalAlpha = 1; }
/* ============================================================ THE PALADIN: CONVICTION PIPS */
const SUN = [ '....g....', '.g..G..g.', '..gGGGg..', '..GGWGG..', 'gGGWWWGGg', '..GGWGG..', '..gGGGg..', '.g..G..g.', '....g....' ];
function pip(g, x, y, fill, flash, time) { /* a 9x9 slot at (x, y) top-left: an empty rune socket, a rising gold disc, a full sun */
  const cx = x + 4, cy = y + 4; circle(g, cx, cy, 4.2, '#14101a'); circle(g, cx, cy, 3.4, '#2e2638'); ring(g, cx, cy, 3.4, 3.4, '#4a4058'); pt(g, cx, cy, '#4a4058');
  if (fill <= 0) return;
  if (fill >= 1) { for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) { const q = SUN[j][i]; if (q === '.') continue; px(g, x + i, y + j, flash ? (q === 'W' ? '#ffffff' : '#fff6c8') : q === 'W' ? K.flameW : q === 'G' ? K.flameY : K.gold); }
    if (flash) { rect(g, x - 2, cy, 13, 1, '#ffffff'); rect(g, cx, y - 2, 1, 13, '#ffffff'); } else if (Math.floor(time * 2 + x) % 5 === 0) pt(g, x + 6, y + 1, '#ffffff'); return; }
  const rows = Math.max(1, R(7 * fill)); for (let j = 0; j < rows; j++) { const yy = y + 7 - j, w = j > 5 ? 3 : 5; rect(g, cx - (w >> 1), yy, w, 1, j === rows - 1 ? K.flameY : K.goldLo); } }
/* five pips in a brass plaque over him (bx the centre, by the top); k the conviction 0..n; up/down the change flashes */
export function drawPips(g, bx, by, k, n, up, down, time) { const pw = 9, gap = 2, tot = n * pw + (n - 1) * gap, l = R(bx - tot / 2);
  rect(g, l - 3, by - 3, tot + 6, pw + 6, '#1b1626'); rect(g, l - 2, by - 2, tot + 4, pw + 4, K.goldDp); rect(g, l - 2, by - 2, tot + 4, 1, K.goldLo); rect(g, l - 1, by - 1, tot + 2, pw + 2, '#241c30');
  px(g, l - 3, by - 3, 'rgba(0,0,0,0)'); rect(g, l - 4, by + 3, 2, 3, K.gold); rect(g, l + tot + 2, by + 3, 2, 3, K.gold);   /* the plaque's studs */
  for (let i = 0; i < n; i++) { const f = Math.max(0, Math.min(1, k - i)); pip(g, l + i * (pw + gap), by, f, up > 0 && i === Math.floor(k - 0.01) && f >= 1, time); }
  if (down > 0) { g.globalAlpha = Math.min(1, down / 0.2); rect(g, l, by + pw + 2, tot, 1, K.flameO); g.globalAlpha = 1; } }

/* ============================================================ THE PALADIN: HIS LIGHT-WARD */
/* the shell round him while he guards: a faceted dome (rx x ry), a rune ring at its foot, brighter a beat after it turns a blow (hitK 1..0). (x, y) his feet on screen */
export function drawBossWard(g, x, y, sc, time, hitK) { const rx = R(22 * sc), ry = R(34 * sc), cy = y - R(ry * 0.52), a = 0.45 + 0.4 * hitK;
  g.globalAlpha = 0.12 + 0.12 * hitK; g.fillStyle = '#fff6c8'; for (let j = -ry; j < ry; j += 1) { const w = R(rx * Math.sqrt(1 - (j / ry) * (j / ry))); g.fillRect(x - w, cy + j, w * 2, 1); }
  g.globalAlpha = a; ring(g, x, cy, rx, ry, hitK > 0.3 ? '#ffffff' : '#fff6c8'); ring(g, x, cy, rx - 1, ry - 1, '#ffd36b', 3, time * 8);
  g.globalAlpha = a * 0.5; ring(g, x, cy, R(rx * 0.55), ry, '#fff6c8', 2); for (const f of [-0.55, 0, 0.55]) { const yy = cy + R(ry * f), w = R(rx * Math.sqrt(1 - f * f)); g.fillStyle = '#fff6c8'; for (let i = -w; i < w; i += 2) g.fillRect(x + i, yy, 1, 1); }   /* the facets */
  g.globalAlpha = Math.min(1, a * 1.3); const sh = Math.floor(time * 2.4) % 6; g.fillStyle = '#ffffff'; g.fillRect(x - R(rx * 0.55) + sh * 3, cy - R(ry * 0.6) + sh * 2, 3, 1); g.fillRect(x - R(rx * 0.55) + sh * 3 + 1, cy - R(ry * 0.6) + sh * 2 - 1, 1, 3);                       /* a glint walking over it */
  g.globalAlpha = 0.5 + 0.3 * hitK; ring(g, x, y - 1, rx - 2, 3, '#ffd36b', 4, time * 10); ring(g, x, y - 1, rx - 6, 2, '#fff6c8', 3, -time * 6);                                                    /* the runes at his feet */
  if (hitK > 0.05) { g.globalAlpha = hitK; g.fillStyle = '#ffffff'; g.fillRect(x - 1, cy - ry - 1, 3, 3); g.fillRect(x + rx - 2, cy - 1, 4, 1); g.fillRect(x - rx - 2, cy - 1, 4, 1); }
  g.globalAlpha = 1; }
/* WARD BROKEN: a brazier lit beside him (t 0..1 since): the shell's shards flying out, a ring, the word is the hands' */
export function drawWardBreak(g, x, y, t) { if (t >= 1) return; const cy = y - 24; g.globalAlpha = 1 - t; ring(g, x, cy, R(10 + t * 34), R(14 + t * 40), '#fff6c8', 3, 0);
  for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2, d = 12 + t * 40, yy = cy + Math.sin(an) * d * 1.2 + t * t * 20; g.fillStyle = i % 3 === 0 ? '#ffffff' : i & 1 ? '#ffd36b' : '#fff6c8'; g.fillRect(R(x + Math.cos(an) * d), R(yy), 2 + (i % 3 === 0 ? 1 : 0), 2); }
  g.globalAlpha = 1; }
/* THE BRAZIER BREAKING: holy fire thrown from the lit brazier across to him (t 0..1): a jet of embers on an arc, a flare where it lands */
export function drawBrazierBreak(g, bx0, by0, ex, ey, t) { if (t >= 1) return; const n = 22; for (let i = 0; i < n; i++) { const u = Math.min(1, t * 1.7 - (i / n) * 0.7); if (u <= 0 || u >= 1) continue; const x = bx0 + (ex - bx0) * u, y = by0 + (ey - by0) * u - Math.sin(u * Math.PI) * 16;
    g.globalAlpha = 0.9 * (1 - t * 0.5); g.fillStyle = i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#ffd36b' : '#ff9a3c'; g.fillRect(R(x) - 1, R(y) - 1, i % 3 === 0 ? 3 : 2, i % 3 === 0 ? 3 : 2); }
  if (t > 0.35) { const k = (t - 0.35) / 0.65; g.globalAlpha = 1 - k; ring(g, ex, ey, R(6 + k * 26), R(8 + k * 30), '#ffffff', 0); ring(g, ex, ey, R(3 + k * 16), R(4 + k * 18), '#ffd36b', 0); }
  g.globalAlpha = 1; }
/* THE VERDICT's floor sigil: a ring on the floor where the light will fall, runes round it; blink between white and red as it is told. (x, fy) the centre and the floor, r the radius */
export function drawVerdictFloor(g, x, fy, r, time, blink) { g.globalAlpha = 0.85; ring(g, x, fy - 1, r, 4, blink, 0); ring(g, x, fy - 1, r - 3, 2, blink, 3, time * 8); g.globalAlpha = 0.5; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + time; g.fillStyle = blink; g.fillRect(R(x + Math.cos(a) * (r - 1)), R(fy - 1 + Math.sin(a) * 3), 1, 2); }
  g.fillStyle = blink; g.fillRect(x - 3, fy - 1, 7, 1); g.fillRect(x, fy - 3, 1, 5); g.globalAlpha = 1; }
/* DAWNFALL's ring: where he will land - two rings and a cross hatched between; k 0..1 the leap's progress fills it */
export function drawDawnRing(g, x, fy, r, time, blink, k) { g.globalAlpha = 0.9; ring(g, x, fy - 1, r, 5, blink, 0); ring(g, x, fy - 1, r * 0.6, 3, blink, 4, time * 10); g.globalAlpha = 0.35 + 0.4 * k; g.fillStyle = '#ff6b6b'; for (let i = -r; i <= r; i += 4) { const w = R(5 * Math.sqrt(Math.max(0, 1 - (i / r) * (i / r)))); g.fillRect(x + i, fy - 1 - w, 1, w * 2); }
  g.globalAlpha = 1; g.fillStyle = blink; g.fillRect(x - 5, fy - 1, 11, 1); g.fillRect(x, fy - 4, 1, 7); }
/* HIS PRAYER at a brazier: motes spiralling off the fire into him; (fx, fy) the fire's mouth, (hx, hy) his chest */
export function drawPrayerLight(g, fx, fy, hx, hy, time) { for (let i = 0; i < 12; i++) { const t = (time * 0.9 + i / 12) % 1, x = fx + (hx - fx) * t + Math.sin(t * 9 + i) * 5 * (1 - t), y = fy + (hy - fy) * t - Math.sin(t * Math.PI) * 14;
    g.globalAlpha = 0.9 * Math.sin(t * Math.PI); g.fillStyle = i & 1 ? '#ffd36b' : '#fff6c8'; g.fillRect(R(x), R(y), 1 + (i % 3 === 0 ? 1 : 0), 2); } g.globalAlpha = 1; }

export function sheetItems() { const out = []; const bgc = (w, h) => { const [c, g] = canvas(w, h); rect(g, 0, 0, w, h, '#2a2838'); return [c, g]; };
  for (const st of ['dark', 'lit', 'snuffed']) { const [c, g] = bgc(44, 70); g.drawImage(bakeSanctuaryBrazier(st), 6, 20); if (st === 'lit') { g.globalAlpha = 0.5; drawLightPool(g, 22, 66, 20, 1, 0.3); g.globalAlpha = 1; for (let k = 0; k < 7; k++) rect(g, 20 + (k % 3) * 2, 24 - k * 2, 3 - (k > 4 ? 1 : 0), 2, k < 3 ? K.flameW : k < 5 ? K.flameY : K.flameO); } if (st === 'snuffed') drawSnuffedSmoke(g, 22, 33, 0.3); if (st === 'dark') drawWants(g, 22, 22, 0.2); out.push(c); }
  { const [c, g] = bgc(48, 56); g.drawImage(bakeAltarFire(), 4, 18); for (const [fx, fy] of AF_WICKS) for (let k = 0; k < 6; k++) rect(g, 4 + fx + 1, 18 + fy - k * 2, 3 - (k > 3 ? 1 : 0), 2, k < 2 ? K.flameW : k < 4 ? K.flameY : K.flameO); out.push(c); }
  { const [c, g] = bgc(32, 40); g.drawImage(bakeVotiveRack(), 4, 6); for (const [fx, fy] of VR_WICKS) rect(g, 4 + fx + 1, 6 + fy - 5, 1, 3, K.flameY); out.push(c); }
  { const [c, g] = bgc(24, 20); g.drawImage(bakeCrossGrate(), 4, 8); out.push(c); }
  for (const k of [0.3, 0.7, 1]) { const [c, g] = bgc(32, 56); g.drawImage(bakeCrossGrate(), 8, 46); drawGrateRise(g, 8, 46, k, 0.2); out.push(c); }
  { const [c, g] = bgc(30, 40); rect(g, 10, 30, 10, 3, K.iron); rect(g, 14, 18, 2, 12, K.iron); drawDoused(g, 15, 22, 0.4); out.push(c); }
  { const [c, g] = bgc(150, 24); drawPips(g, 75, 7, 3.4, 5, 0, 0, 0.5); out.push(c); }
  { const [c, g] = bgc(150, 24); drawPips(g, 75, 7, 5, 5, 1, 0, 0.5); out.push(c); }
  { const [c, g] = bgc(80, 90); drawBossWard(g, 40, 80, 1.5, 0.3, 0.1); out.push(c); }
  { const [c, g] = bgc(80, 90); drawBossWard(g, 40, 80, 1.5, 0.3, 1); out.push(c); }
  { const [c, g] = bgc(100, 90); drawWardBreak(g, 50, 80, 0.4); out.push(c); }
  { const [c, g] = bgc(120, 60); drawBrazierBreak(g, 10, 40, 100, 30, 0.6); out.push(c); }
  { const [c, g] = bgc(100, 24); drawVerdictFloor(g, 50, 16, 34, 0.3, '#ff6b6b'); out.push(c); }
  { const [c, g] = bgc(130, 30); drawDawnRing(g, 65, 20, 54, 0.3, '#ff6b6b', 0.6); out.push(c); }
  { const [c, g] = bgc(100, 60); drawPrayerLight(g, 10, 50, 85, 20, 0.3); out.push(c); }
  return out; }
