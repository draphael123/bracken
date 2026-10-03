// redgorge_props.js - THE RED GORGE's WORLD PROPS and WEATHER (claude/redgorge-art). src/red-gorge-hands.js owns the rule and calls these to DRAW it:
//   drawBack(g, S, K)   behind the heroes: the channel's damp, the old dam's ruined face, the flood and the burst (foam, a churning head where a gate stops it), the sluice
//                       gates (a stone-cheeked timber frame: raised / shut / full), the wheels and the rope from each wheel to its gate, the water-wheels (paddles, spray), the
//                       woven baskets on their hoist ropes, THE JAM (logs, driftwood, a cart wheel, an ox skull), the nests, the painted hands, the vault door, the bridges' under-ropes
//   drawOver(g, S, K)   over the heroes: spray at the falls and every bridge a flood crosses, dust motes in the rim's light, heat shimmer at the RIM ONLY (below it is shade)
// S = the hands' state { channels, spans, gates, wheels, wheelsW, jams, nest, vault, phase, t, L }; K = { TS, cx, cy, vw, vh, time, movers, questGot, questN }.
// Everything static is baked once (memo); water is a baked texture scrolled down its span. Pure drawing.
import { mulberry } from '../px.js';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const R = Math.round;
const P = { w0: '#1e1208', w1: '#3a2614', w2: '#5e4022', w3: '#86602e', w4: '#b08848', w5: '#d8b26a', rope: '#c8a868', ropeD: '#7a5c34', ropeL: '#ecd49c', iron: '#3a3a44', ironL: '#7a7a88', stone0: '#2c1612', stone1: '#4a2820', stone2: '#6c3c2e', stone3: '#8e5440',
  bone: '#e8dcc0', boneD: '#a89878', wet: '#3f86b8', wetD: '#2a5f9a', wetL: '#8cc8e8', foam: '#f4fbff', ochre: '#c8902a', ochreL: '#e8b04a' };
/* a stroke with a thickness, drawn as a run of squares (crisp) */
function stick(g, x0, y0, x1, y1, th, col, hi) { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; rc(g, x - th / 2, y - th / 2, th, th, col); if (hi && th >= 3) rc(g, x - th / 2, y - th / 2, th, 1, hi); } }

// ================= THE JAM: brush, bleached driftwood, drowned timber, a cart's wheel, an ox's skull =================
export function jamArt(w, h) {
  return once('jam' + w + 'x' + h, () => { const [c, g] = mk(w, h), r = mulberry(2087); rc(g, 0, 0, w, h, '#1a1008');
    for (let i = 0; i < 60; i++) { const x0 = r() * w, y0 = r() * h, a = r() * Math.PI, len = 14 + r() * 36, th = r() < 0.3 ? 4 : r() < 0.6 ? 3 : 2, tone = r();   /* brush and boughs, any way up */
      stick(g, x0, y0, x0 + Math.cos(a) * len, y0 + Math.sin(a) * len, th, tone < 0.3 ? P.w1 : tone < 0.7 ? P.w2 : P.w3, th >= 3 ? P.w4 : null); }
    for (let i = 0; i < 9; i++) { const y0 = 6 + r() * (h - 14), x0 = -4 + r() * 20, len = w * (0.6 + r() * 0.5), th = 5 + ((r() * 3) | 0), s = r() * 6 - 3;   /* the big drowned timbers: sun-bleached, split, a cut end */
      stick(g, x0, y0, x0 + len, y0 + s, th, '#a89870', '#e8dcc0'); rc(g, x0 + len, y0 + s - th / 2, 2, th, '#6a5a3a'); for (let k = 0; k < 4; k++) rc(g, x0 + r() * len, y0 + s - th / 2 + 1 + r() * (th - 2), 3 + r() * 5, 1, '#7a6a48'); }
    for (let i = 0; i < 40; i++) { const x0 = r() * w, y0 = r() * h, a = r() * Math.PI * 2; stick(g, x0, y0, x0 + Math.cos(a) * (6 + r() * 14), y0 + Math.sin(a) * (6 + r() * 14), 1, r() < 0.5 ? '#7a6a48' : '#5a4630'); }   /* twigs */
    const wx = w * 0.62, wy = h * 0.5, rr = 14;                                                              /* a CART'S WHEEL: rim, hub, eight spokes, caught crosswise */
    for (let a = 0; a < 64; a++) { const t = a / 64 * Math.PI * 2; rc(g, wx + Math.cos(t) * rr - 1, wy + Math.sin(t) * rr - 1, 3, 3, P.w2); rc(g, wx + Math.cos(t) * rr - 1, wy + Math.sin(t) * rr - 1, 3, 1, P.w4); }
    for (let k = 0; k < 8; k++) { const t = k / 8 * Math.PI * 2; stick(g, wx, wy, wx + Math.cos(t) * (rr - 1), wy + Math.sin(t) * (rr - 1), 2, P.w3); } rc(g, wx - 3, wy - 3, 6, 6, P.w1); rc(g, wx - 1, wy - 1, 2, 2, P.iron); for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; rc(g, wx + Math.cos(t) * (rr + 1), wy + Math.sin(t) * (rr + 1), 1, 1, P.iron); }
    const sx = w * 0.22, sy = h * 0.28;                                                                     /* an OX SKULL wedged in the brush: the horns out wide */
    rc(g, sx - 5, sy - 4, 10, 8, P.bone); rc(g, sx - 3, sy + 4, 6, 4, P.bone); rc(g, sx - 4, sy - 1, 3, 3, '#1a1008'); rc(g, sx + 1, sy - 1, 3, 3, '#1a1008'); rc(g, sx - 1, sy + 6, 2, 2, '#1a1008'); rc(g, sx - 5, sy - 4, 10, 1, '#fff6e0');
    stick(g, sx - 5, sy - 3, sx - 14, sy - 8, 2, P.bone); stick(g, sx + 5, sy - 3, sx + 14, sy - 8, 2, P.bone); rc(g, sx - 15, sy - 9, 2, 2, P.boneD); rc(g, sx + 14, sy - 9, 2, 2, P.boneD);
    for (let i = 0; i < 10; i++) rc(g, r() * w, h * 0.55 + r() * h * 0.45, 5 + r() * 9, 2, r() < 0.5 ? '#5a4a30' : '#3a2e1c');                      /* mud and silt, thick low down */
    for (let i = 0; i < 4; i++) { const x = 8 + r() * (w - 16), y = r() * h * 0.7; rc(g, x, y, 1, 10 + r() * 14, '#8a3a2a'); rc(g, x + 1, y + 3, 2, 8, '#6a2a22'); }   /* rags and a red scarf, snagged */
    return c; });
}
// ================= THE OLD NEST: a huge bowl of sticks on the west wall =================
export function nestArt(w, h, sm) {
  return once('nest' + w + 'x' + h + sm, () => { const [c, g] = mk(w, h), r = mulberry(8123 + w), cxn = w / 2, ry = h * 0.2, rimY = h * 0.42, rx = w * 0.47, th = sm ? 2 : 3;
    const ell = (x, y, ax, ay, col) => { for (let yy = -ay; yy <= ay; yy++) { const half = ax * Math.sqrt(Math.max(0, 1 - (yy * yy) / (ay * ay))); rc(g, x - half, y + yy, half * 2, 1, col); } };
    for (let yy = rimY; yy < h - 1; yy++) { const k = (yy - rimY) / (h - 1 - rimY), half = rx * Math.sqrt(Math.max(0, 1 - k * k)); rc(g, cxn - half, yy, half * 2, 1, P.w1); }                  /* the body: a deep bowl, dark under the weave */
    for (let i = 0; i < (sm ? 40 : 150); i++) { const k = r(), yy = rimY + k * (h - 2 - rimY), half = rx * Math.sqrt(Math.max(0, 1 - (k * k))), x0 = cxn - half + r() * half * 2, a = (r() - 0.5) * 1.5, len = (sm ? 7 : 12) + r() * (sm ? 7 : 14);   /* woven sticks, each along the bowl's curve */
      stick(g, Math.max(0, x0 - Math.cos(a) * len / 2), yy - Math.sin(a) * len / 2, Math.min(w - 1, x0 + Math.cos(a) * len / 2), yy + Math.sin(a) * len / 2, th - (r() < 0.4 ? 1 : 0), [P.w1, P.w2, P.w3, P.w2, P.w4][(r() * 5) | 0], P.w5); }
    ell(cxn, rimY, rx, ry, P.w3); ell(cxn, rimY + 1, rx - 2, ry - 1, '#120a05'); ell(cxn, rimY + 2, rx - 5, ry - 3, '#0a0603');                        /* the rim, and the dark hollow of the bowl */
    for (let x = 0; x < w; x++) { const k = (x - cxn) / rx; if (Math.abs(k) > 1) continue; const yy = rimY - ry * Math.sqrt(1 - k * k); rc(g, x, yy - 1, 1, 2, P.w4); if (r() < 0.5) rc(g, x, yy - 2, 1, 1, P.w5); }
    for (let i = 0; i < (sm ? 7 : 22); i++) { const k = (r() * 2 - 1) * 0.92, x = cxn + k * rx, y = rimY - ry * Math.sqrt(1 - k * k); stick(g, x, y, x + (r() - 0.5) * 12, y - 2 - r() * (sm ? 4 : 7), 1, r() < 0.5 ? '#c8a060' : '#8a6a38'); }   /* sticks standing out of the rim */
    return c; });
}
// ================= THE PAINTED HAND: ochre blown round a hand held on the rock =================
export function handArt(v) {
  return once('hand' + v, () => { const W = 40, H = 44, [c, g] = mk(W, H), r = mulberry(v * 17 + 3), cx = 20, cy = 28, m = new Uint8Array(W * H), at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x], lean = (v % 3) - 1;
    const fill = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && x < W && y >= 0 && y < H) m[y * W + x] = 1; };
    fill(cx - 6, cx + 6, cy - 4, cy + 8); fill(cx - 4, cx + 4, cy + 9, cy + 15);                                   /* palm, wrist */
    [[-6, 14], [-2, 18], [2, 17], [6, 13]].forEach(([fx, len], i) => { for (let t = 0; t < len; t++) { const x = cx + fx + Math.round(lean * t / 9 + (i - 1.5) * t / 14); fill(x - 1, x + 1, cy - 4 - t, cy - 4 - t); } });   /* four fingers, fanned */
    for (let t = 0; t < 9; t++) { const x = cx + 6 + t, y = cy + 2 - Math.round(t * 0.9); fill(x, x + 2, y - 1, y + 1); }   /* the thumb, out to the side */
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (m[y * W + x]) continue; let d = 99; for (let q = -5; q <= 5; q++) for (let k = -5; k <= 5; k++) if (at(x + k, y + q)) d = Math.min(d, Math.hypot(k, q));
      if (d <= 5 && r() < 1.0 - d * 0.17) rc(g, x, y, 1, 1, r() < 0.55 ? P.ochre : r() < 0.6 ? P.ochreL : '#8a5a1a'); }   /* the blown pigment: dense at the edge, thinning out */
    return c; });
}
// ================= WATER: a scrolled texture =================
function waterTex(kind) {
  return once('water' + kind, () => { const W = 80, H = 128, [c, g] = mk(W, H), r = mulberry(kind === 'burst' ? 77 : 41), base = kind === 'burst' ? P.wetD : P.wet; rc(g, 0, 0, W, H, base);
    for (let x = 0; x < W; x++) { const e = Math.min(x, W - 1 - x); if (e < 6) { g.globalAlpha = (6 - e) / 6 * 0.6; rc(g, x, 0, 1, H, P.foam); } } g.globalAlpha = 1;   /* foam up both banks */
    for (let i = 0; i < (kind === 'burst' ? 46 : 30); i++) { const x = 3 + r() * (W - 6), y = r() * H, len = 8 + r() * 30; rc(g, x, y, 1 + (r() < 0.3 ? 1 : 0), len, P.wetL); if (y + len > H) rc(g, x, 0, 1, y + len - H, P.wetL); }   /* the long streaks of fast water */
    for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H; rc(g, x, y, 1 + ((r() * 3) | 0), 1, r() < 0.55 ? P.foam : P.wetL); }                                    /* foam flecks */
    for (let i = 0; i < 14; i++) { const x = 4 + r() * (W - 8), y = r() * H; rc(g, x, y, 2, 2, P.foam); rc(g, x + 1, y + 1, 1, 1, P.wetL); }                                  /* bubbles */
    return c; });
}
/* the water down [ya, yb) of a channel wide wpx at screen x: the baked texture, scrolled (a flood scrolls fast; the burst faster) */
function pour(g, kind, x, ya, yb, wpx, off, a, vh) { const t = waterTex(kind), H = 128; ya = Math.max(ya, -2); yb = Math.min(yb, vh + 2); if (yb <= ya) return; g.globalAlpha = a;
  for (let y = ya; y < yb;) { const so = (((y - ya + off) % H) + H) % H, h = Math.min(H - so, yb - y); g.drawImage(t, 0, so, 80, h, x, y, wpx, h); y += h; } g.globalAlpha = 1; }
/* a churning FOAM HEAD where water meets a gate or the floor: white heaps, rising and falling */
function churn(g, x, y, wpx, time, big) { for (let k = 0; k < wpx; k += 5) { const h = 3 + Math.round((Math.sin(time * 9 + k * 0.7) * 0.5 + 0.5) * (big ? 7 : 4)); rc(g, x + k, y - h, 5, h, P.foam); rc(g, x + k, y - h, 5, 1, '#ffffff'); rc(g, x + k + 1, y - 1, 3, 1, P.wetL); } }
/* a sagging rope between two points (a quadratic), `th` thick */
function sag(g, x0, y0, x1, y1, drop, col, hi, th = 1) { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2)); for (let i = 0; i <= n; i++) { const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + drop * 4 * u * (1 - u); rc(g, x, y, th, th, col); if (hi && th > 1) rc(g, x, y, th, 1, hi); } }

/* ---- the flood's pale "scour" and the damp it leaves: a module clock, since the hands keep none ---- */
let lastWet = -99, wetNow = false;
export function drawBack(g, S, K) {
  const { TS, cx, cy, vw, vh, time } = K, onY = (y0, y1) => y1 > cy - 24 && y0 < cy + vh + 24, anyWet = S.spans.length > 0; if (anyWet) { lastWet = time; wetNow = true; } else wetNow = false;
  const damp = anyWet ? 1 : Math.max(0, 1 - (time - lastWet) / 7);
  /* THE OLD DAM'S FACE: a ruined masonry wall behind the plateau, a slot for the spillway, the gate high in it */
  const dam = S.channels.find(c => c.id === 'dam'), dg = S.gates.find(q => q.ch === 'dam');
  if (dam && dg) { const x0 = (dam.x0 - 10) * TS - cx, x1 = (dam.x1 + 1 + 10) * TS - cx, y0 = (dg.row - 3) * TS - cy, y1 = 22 * TS - cy; if (x1 > 0 && x0 < vw && y1 > 0 && y0 < vh) { const dd = damFace(x1 - x0 + cx - cx, y1 - y0, dam.x1 - dam.x0 + 1); g.drawImage(dd, R(x0), R(y0)); } }
  /* THE CHANNEL'S DAMP: after a flood the gully is dark with wet, then dries */
  if (damp > 0.02) for (const c of S.channels) { if (c.id !== 'gorge') continue; const x0 = R(c.x0 * TS - cx), wpx = (c.x1 - c.x0 + 1) * TS; if (x0 > vw || x0 + wpx < 0) continue; g.globalAlpha = 0.34 * damp; g.fillStyle = '#2a1a22'; g.fillRect(x0 + 4, 0, wpx - 8, vh); g.globalAlpha = 0.5 * damp; g.fillStyle = '#6a8aa0'; for (let y = -((cy | 0) % 22); y < vh; y += 22) g.fillRect(x0 + 6 + ((y * 7) & 15), y, 1, 9); g.globalAlpha = 1; }
  /* THE HORN: a trickle down the channel where the flood will run, getting stronger, and a rising rumble of foam at the bed */
  if (S.phase === 'horn') for (const c of S.channels) { const sp = S.floodSpan(c); if (!sp || !onY(sp[0] * TS, (sp[1] + 1) * TS)) continue; const x0 = R(c.x0 * TS - cx), wpx = (c.x1 - c.x0 + 1) * TS, k = 1 - S.t / 2;
    g.globalAlpha = 0.5 + 0.3 * k; g.fillStyle = P.wetL; for (let q = 3; q < wpx; q += 9) for (let y = Math.max(sp[0] * TS, cy); y < Math.min((sp[1] + 1) * TS, cy + vh); y += 11) g.fillRect(x0 + q + (R(time * 30 + y + q) % 3), R(y - cy + (time * 140) % 11), 1, 5); g.globalAlpha = 1; }
  /* THE TORRENT and THE BURST */
  for (const s of S.spans) { const c = S.chOf(s.ch), x0 = R(c.x0 * TS - cx), wpx = (c.x1 - c.x0 + 1) * TS, ya = R(s.y0 * TS - cy), yb = R((s.y1 + 1) * TS - cy); if (yb < -4 || ya > vh + 4 || x0 > vw || x0 + wpx < 0) continue;
    const b = s.kind === 'burst'; pour(g, b ? 'burst' : 'flood', x0, ya, yb, wpx, R(time * (b ? 520 : 380)), b ? 0.9 : 0.82, vh);
    if (yb > 0 && yb < vh + 30) churn(g, x0, yb, wpx, time, b); if (ya > -30 && ya < vh) { g.fillStyle = P.foam; g.fillRect(x0, ya, wpx, 2); }          /* the head where it ends: a churn; the front's lip where it begins */
    if (b) { g.globalAlpha = 0.25; g.fillStyle = '#fff'; g.fillRect(x0 - 2, Math.max(0, ya), 2, Math.max(0, Math.min(vh, yb) - Math.max(0, ya))); g.fillRect(x0 + wpx, Math.max(0, ya), 2, Math.max(0, Math.min(vh, yb) - Math.max(0, ya))); g.globalAlpha = 1; } }
  /* THE BRIDGES' UNDER-ROPES: each rope bridge slung from its posts on two ropes, hangers down to the deck, a post and a knot at each end */
  for (const z of S.L.ledgeZones || []) { const [bx0, bx1, by] = z; if (z[4] !== 'lashed') continue; const ya = by * TS + 9 - cy; if (ya < -30 || ya > vh + 20) continue; const xa = bx0 * TS - cx, xb = (bx1 + 1) * TS - cx, span = xb - xa, dr = Math.min(11, 4 + span / 60);
    const free = x => S.L.grid[(by + 1) * S.L.W + Math.floor((x + cx) / TS)] === 0;   /* only where there is air under the deck */
    for (let x = Math.max(xa, -4); x < Math.min(xb, vw + 4); x += 1) { if (!free(x)) continue; const u = (x - xa) / span, y = ya + 2 + dr * 4 * u * (1 - u); g.fillStyle = P.ropeD; g.fillRect(x, R(y), 1, 2); if ((x & 3) === 0) { g.fillStyle = P.rope; g.fillRect(x, R(y), 1, 1); } }
    for (let hx = xa + 24; hx < xb - 8; hx += 48) { if (hx < -2 || hx > vw + 2 || !free(hx)) continue; const u = (hx - xa) / span, y = ya + 2 + dr * 4 * u * (1 - u); g.fillStyle = P.ropeD; g.fillRect(R(hx), ya - 1, 1, R(y - ya) + 1); g.fillStyle = P.rope; g.fillRect(R(hx), ya + 1, 1, 1); }
    for (const [ex, dir] of [[xa, 1], [xb - 1, -1]]) { if (ex < -12 || ex > vw + 12) continue; g.fillStyle = P.w1; g.fillRect(R(ex) - (dir > 0 ? 1 : 3), by * TS - cy - 14, 4, 18); g.fillStyle = P.w3; g.fillRect(R(ex) - (dir > 0 ? 1 : 3), by * TS - cy - 14, 1, 18); g.fillStyle = P.rope; g.fillRect(R(ex) - (dir > 0 ? 2 : 3), by * TS - cy - 10, 6, 2); g.fillRect(R(ex) - (dir > 0 ? 2 : 3), by * TS - cy - 4, 6, 2); } }
  /* THE GATES: a stone-cheeked timber frame across the channel - the board RAISED between the posts (open), SET DOWN (shut), or SET DOWN with the water banked over it (full) */
  for (const gt of S.gates) { const c = S.chOf(gt.ch), x0 = R(c.x0 * TS - cx), wpx = (c.x1 - c.x0 + 1) * TS, y = R(gt.row * TS - cy); if (y < -60 || y > vh + 40 || x0 > vw + 12 || x0 + wpx < -12) continue;
    const open = gt.state === 'open', full = gt.state === 'full', lift = open ? 26 : 0, jit = gt.fx > 0 ? R(Math.sin(time * 60) * 1.2) : 0;
    /* the cheeks: stone piers either side, courses and a lit top */
    for (const sx of [x0 - 9, x0 + wpx]) { g.fillStyle = P.stone0; g.fillRect(sx, y - 34, 9, 52); for (let ry = -34; ry < 18; ry += 8) { g.fillStyle = (ry & 8) ? P.stone2 : P.stone1; g.fillRect(sx + 1, y + ry + 1, 7, 7); g.fillStyle = P.stone3; g.fillRect(sx + 1, y + ry + 1, 7, 1); } g.fillStyle = '#f6c488'; g.fillRect(sx, y - 35, 9, 1); g.fillStyle = P.stone1; g.fillRect(sx, y - 34, 9, 2); }
    /* the hoist: a beam across the piers, the board hung on two chains from it */
    g.fillStyle = P.w1; g.fillRect(x0 - 6, y - 38, wpx + 12, 5); g.fillStyle = P.w3; g.fillRect(x0 - 6, y - 38, wpx + 12, 1); g.fillStyle = P.iron; for (const k of [x0 + 6, x0 + wpx - 8]) { g.fillRect(k, y - 33, 2, 8 + 0); for (let q = y - 33; q < y - 10 - lift + 0; q += 3) { g.fillStyle = (q & 1) ? P.ironL : P.iron; g.fillRect(k, q, 2, 2); } }
    if (full) { pour(g, 'flood', x0, y - 24, y + 1, wpx, R(time * 60), 0.8, vh); g.fillStyle = 'rgba(244,251,255,0.8)'; g.fillRect(x0, y - 24, wpx, 1); for (let k = 0; k < wpx; k += 10) g.fillRect(x0 + ((k + R(time * 14)) % wpx), y - 23, 5, 1);   /* the banked pool, a skin of ripples */
      g.fillStyle = P.wetL; for (let k = 4; k < wpx; k += 12) g.fillRect(x0 + k, y + 12 + (R(time * 40 + k) % 6), 1, 4); }                                                      /* a drip off the board's lip */
    const by = y - lift + jit; g.fillStyle = P.w1; g.fillRect(x0, by, wpx, 14); for (let k = 0; k < wpx; k += 10) { g.fillStyle = (k / 10) & 1 ? P.w3 : P.w2; g.fillRect(x0 + k + 1, by + 1, 8, 12); g.fillStyle = P.w4; g.fillRect(x0 + k + 1, by + 1, 8, 1); g.fillStyle = P.w0; g.fillRect(x0 + k + 9, by, 1, 14); }
    g.fillStyle = P.iron; g.fillRect(x0, by + 2, wpx, 2); g.fillRect(x0, by + 10, wpx, 2); g.fillStyle = P.ironL; for (let k = 3; k < wpx; k += 10) { g.fillRect(x0 + k, by + 2, 1, 1); g.fillRect(x0 + k, by + 10, 1, 1); }   /* the iron straps and their rivets */
    if (gt.fx > 0) { g.globalAlpha = 0.7; g.fillStyle = '#ffd36b'; g.fillRect(x0, by - 1, wpx, 1); g.globalAlpha = 1; }
    if (open) { g.globalAlpha = 0.5; g.fillStyle = P.wetL; g.fillRect(x0 + 6, y + 6, 1, 8); g.globalAlpha = 1; } }
  /* THE WHEELS: a spoked wooden wheel on a braced post, its hand-pegs lit; and the ROPE from each wheel to its gate's hoist (follow it) */
  for (const w of S.wheels) { const gt = S.gates.find(q => q.id === w.gate), x = R(w.x - cx), y = R(w.y - cy); if (!gt) continue; const c = S.chOf(gt.ch), tx = R((w.x < (c.x0 + c.x1 + 1) * TS / 2 ? c.x0 * TS - 9 : (c.x1 + 1) * TS + 9) - cx), ty = R(gt.row * TS - 38 - cy);
    if ((x > -40 && x < vw + 40 && y > -30 && y < vh + 30) || (tx > -40 && tx < vw + 40 && ty > -30 && ty < vh + 30)) { const a = Math.abs(ty - (y - 24)) > 220 ? 2 : 0; sag(g, tx, ty, x, y - 24, Math.min(26, 6 + Math.hypot(tx - x, ty - y) * 0.05 + a), P.ropeD, null, 2); sag(g, tx, ty - 1, x, y - 25, Math.min(26, 6 + Math.hypot(tx - x, ty - y) * 0.05 + a), P.rope, null, 1); }
    if (x < -30 || x > vw + 30 || y < -30 || y > vh + 30) continue; const spin = gt.fx > 0 ? time * 9 : 0, hubY = y - 18;
    g.fillStyle = P.w1; g.fillRect(x - 2, hubY, 5, 18); g.fillStyle = P.w3; g.fillRect(x - 2, hubY, 1, 18); g.fillStyle = P.w2; g.fillRect(x - 7, y - 2, 15, 3); g.fillRect(x - 6, y - 8, 2, 7); g.fillRect(x + 4, y - 8, 2, 7);   /* the post, its brace, its sill */
    g.strokeStyle = P.w4; g.lineWidth = 2; g.beginPath(); g.arc(x + 0.5, hubY, 9, 0, 6.2832); g.stroke(); g.strokeStyle = P.w1; g.lineWidth = 1; g.beginPath(); g.arc(x + 0.5, hubY, 7.4, 0, 6.2832); g.stroke();
    g.strokeStyle = P.w3; g.lineWidth = 2; g.beginPath(); for (let k = 0; k < 8; k++) { g.moveTo(x + 0.5, hubY); g.lineTo(x + 0.5 + Math.cos(spin + k * Math.PI / 4) * 9, hubY + Math.sin(spin + k * Math.PI / 4) * 9); } g.stroke();
    g.fillStyle = '#ffe9a0'; for (let k = 0; k < 8; k += 2) g.fillRect(R(x + 0.5 + Math.cos(spin + k * Math.PI / 4) * 11) - 1, R(hubY + Math.sin(spin + k * Math.PI / 4) * 11) - 1, 3, 3);   /* the handle pegs */
    g.fillStyle = P.iron; g.fillRect(x - 1, hubY - 1, 4, 4); g.fillStyle = P.ironL; g.fillRect(x, hubY, 1, 1);
    g.fillStyle = gt.state === 'full' ? P.wetL : gt.state === 'shut' ? '#c9b27c' : '#ffb04a'; g.fillRect(x + 6, y - 26, 5, 3); g.fillStyle = P.iron; g.fillRect(x + 8, y - 24, 1, 5); }   /* a tag: blue full, tan shut, amber open */
  /* THE WATER-WHEELS by the baskets: a paddle wheel on a bracket at the channel's lip; it turns only while water runs, and it throws spray when it does */
  for (const w of S.wheelsW) { const x = R(w.x - cx), y = R(w.y - cy); if (y < -30 || y > vh + 30 || x < -30 || x > vw + 30) continue; const run = w.run, a = w.a;
    g.fillStyle = P.w1; g.fillRect(x - 12, y + 6, 24, 4); g.fillRect(x - 2, y, 4, 8); g.fillStyle = P.w3; g.fillRect(x - 12, y + 6, 24, 1);
    g.strokeStyle = P.w2; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 11, 0, 6.2832); g.stroke(); g.strokeStyle = P.w4; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 12, 0, 6.2832); g.stroke();
    for (let k = 0; k < 8; k++) { const t = a + k * Math.PI / 4, px = x + Math.cos(t) * 11, py = y + Math.sin(t) * 11; g.strokeStyle = P.w3; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(px, py); g.stroke();
      g.fillStyle = k & 1 ? P.w4 : P.w3; g.save(); g.translate(px, py); g.rotate(t + Math.PI / 2); g.fillRect(-4, -1, 8, 3); g.restore(); }
    g.fillStyle = P.iron; g.fillRect(x - 2, y - 2, 5, 5); g.fillStyle = P.ironL; g.fillRect(x - 1, y - 1, 1, 1);
    if (run) { g.fillStyle = P.wetL; for (let k = 0; k < 10; k++) { const t = a * 1.3 + k * 0.63, d = 13 + ((k * 7 + R(time * 20)) % 8); g.fillRect(R(x + Math.cos(t) * d), R(y + Math.sin(t) * d), 1, 2); }   /* spray flung off the paddles */
      g.globalAlpha = 0.35; g.fillStyle = P.foam; g.beginPath(); g.arc(x, y, 14, a % 6.28, a % 6.28 + 1.3); g.lineTo(x, y); g.fill(); g.globalAlpha = 1; } }
  /* THE BASKETS: a woven basket on two hoist ropes up to a pulley block; a thick haul rope above the pulley down the shaft's length */
  for (const m of K.movers()) if (m.gorge) { const x = R(m.x - cx), y = R(m.y - cy); if (y < -60 || y > vh + 60) continue; const top = R(m.y1 - 46 - cy), mx = x + m.w / 2;
    g.fillStyle = P.ropeD; g.fillRect(mx, top - 6, 2, Math.max(0, y - top)); g.fillStyle = P.rope; g.fillRect(mx, top - 6, 1, Math.max(0, y - top));      /* the haul rope */
    g.fillStyle = P.iron; g.fillRect(mx - 3, top - 4, 8, 8); g.fillStyle = P.ironL; g.fillRect(mx - 3, top - 4, 8, 1); g.fillRect(mx, top - 1, 2, 2);        /* the pulley block */
    for (const sx of [x + 1, x + m.w - 2]) sag(g, sx, y - 6, mx, top + 3, 0, P.ropeD, null, 1);                                                          /* the hoist ropes, a V */
    g.fillStyle = P.w1; g.fillRect(x - 1, y, m.w + 2, 10);                                                                                                   /* the woven body: staves and weaving */
    for (let k = 0; k < m.w + 2; k += 4) { g.fillStyle = (k / 4) & 1 ? P.w3 : P.w2; g.fillRect(x - 1 + k, y + 1, 3, 9); g.fillStyle = P.w4; g.fillRect(x - 1 + k, y + 1, 3, 1); }
    for (const wy of [y + 3, y + 6]) { g.fillStyle = P.w5; for (let k = 1; k < m.w; k += 8) g.fillRect(x + k, wy, 5, 1); g.fillStyle = P.w0; for (let k = 5; k < m.w; k += 8) g.fillRect(x + k, wy, 4, 1); }
    g.fillStyle = P.w0; g.fillRect(x - 2, y - 1, m.w + 4, 2); g.fillStyle = '#e8c070'; g.fillRect(x - 2, y - 2, m.w + 4, 1);                                  /* the rim, lit */
    g.fillStyle = P.w0; g.fillRect(x + 1, y + 10, m.w - 2, 2); g.fillStyle = '#0a0604'; g.fillRect(x + 2, y + 12, m.w - 4, 1);
    g.fillStyle = P.rope; g.fillRect(x - 1, y + 4, 1, 3); g.fillRect(x + m.w, y + 4, 1, 3); }
  /* THE JAMS */
  for (const j of S.jams) { if (j.open) continue; const x = R(j.x0 * TS - cx), y = R(j.y0 * TS - cy), wpx = (j.x1 - j.x0 + 1) * TS, h = (j.y1 - j.y0 + 1) * TS; if (y > vh || y + h < 0 || x > vw || x + wpx < 0) continue;
    g.drawImage(jamArt(wpx, h), x, y); const full = S.gates.some(q => q.id === 'jam' && q.state === 'full');
    g.fillStyle = P.wetL; for (let k = 0; k < 8; k++) { const dx = 6 + ((k * 23) % (wpx - 10)), dy = ((k * 31 + R(time * (full ? 70 : 28))) % (h - 8)); g.globalAlpha = full ? 0.9 : 0.5; g.fillRect(x + dx, y + 6 + dy, 1, 3); } g.globalAlpha = 1;   /* water seeping through, hard when the bank is full behind it */
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x, y, wpx, 1); }
  /* THE NESTS and THE PAINTED HANDS */
  const n = S.nest; if (n) { const x = R(n.x - cx), y = R(n.y - cy); if (x > -60 && x < vw + 60 && y > -30 && y < vh + 60) { const w = 80, h = 44; g.drawImage(nestArt(w, h, 0), x - w / 2, y - h + 4);
      const got = Math.min(4, K.questGot()), fx = x - 26; for (let i = 0; i < 4; i++) { const on = i < got, fxx = fx + i * 16, fyy = y - h + 6 + (i & 1) * 3; if (!on) { g.globalAlpha = 0.35; g.fillStyle = '#2a1a10'; g.fillRect(fxx, fyy + 6, 4, 2); g.globalAlpha = 1; continue; }
        g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(fxx, fyy + 12); g.lineTo(fxx + 7, fyy - 4); g.stroke(); g.fillStyle = '#c8643a'; for (let k = 0; k < 5; k++) g.fillRect(fxx + k * 1.4, fyy + 9 - k * 3, 3, 2); g.fillStyle = '#7a2e1c'; for (let k = 0; k < 4; k++) g.fillRect(fxx + 3 + k * 1.4, fyy + 10 - k * 3, 2, 1);
        g.globalAlpha = 0.4 + 0.3 * Math.sin(time * 4 + i); g.fillStyle = '#ffe9a0'; g.fillRect(fxx + 7, fyy - 5, 1, 1); g.globalAlpha = 1; } } }
  for (const d of S.L.decor || []) { const x = R(d.x * TS + 8 - cx), y = R((d.y + 1) * TS - cy); if (x < -40 || x > vw + 40 || y < -30 || y > vh + 50) continue;
    if (d.kind === 'nest') g.drawImage(nestArt(30, 16, 1), x - 15, y - 14);
    else if (d.kind === 'hands') for (let k = 0; k < 2; k++) { const hx = x - 16 + k * 26, hy = y - 40 + k * 8; g.drawImage(handArt(k + (d.x & 1) * 2), hx, hy, 28, 31); } }
  /* THE CAVE is cool and dark inside: a blue-black wash over its room (the painted hands glow a little through it) */
  { const cv = (S.L.interiors || []).find(q => q[4] === 'rgCave'); if (cv) { const x = R(cv[0] * TS - cx), y = R(cv[2] * TS - cy), w = (cv[1] - cv[0] + 1) * TS, h = (cv[3] - cv[2] + 1) * TS; if (x < vw && x + w > 0 && y < vh && y + h > 0) { g.fillStyle = 'rgba(14,20,44,0.38)'; g.fillRect(x, y, w, h); } } }
  /* THE VAULT DOOR: woven branches lashed over a frame, a feather sign on it */
  for (const v of S.vault) if (!v.open) { const x = R(v.x0 * TS - cx), y = R(v.y0 * TS - cy), h = (v.y1 - v.y0 + 1) * TS; if (x < -30 || x > vw + 30 || y > vh || y + h < 0) continue; g.fillStyle = P.w0; g.fillRect(x, y, TS, h); g.strokeStyle = P.w3; g.lineWidth = 2; g.beginPath(); for (let k = -TS; k < h; k += 6) { g.moveTo(x, y + k + TS); g.lineTo(x + TS, y + k); } g.stroke(); g.strokeStyle = P.w2; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < h + TS; k += 6) { g.moveTo(x, y + k); g.lineTo(x + TS, y + k + TS); } g.stroke();
    g.fillStyle = P.rope; for (const ly of [y + 8, y + h / 2, y + h - 10]) { g.fillRect(x, R(ly), TS, 3); g.fillStyle = P.ropeD; g.fillRect(x, R(ly) + 2, TS, 1); g.fillStyle = P.rope; }
    g.fillStyle = '#c8643a'; g.fillRect(x + 6, R(y + h / 2) - 8, 3, 8); g.fillStyle = '#e8dcc0'; g.fillRect(x + 7, R(y + h / 2) - 10, 1, 10); }
}

/* the old dam's FACE (baked per size): coursed masonry with a broken crown, the spillway's slot cut through it, stains where the water has run, ivy of dry grass in the cracks */
function damFace(w, h, chTiles) {
  return once('dam' + w + 'x' + h + chTiles, () => { const [c, g] = mk(Math.max(1, w | 0), Math.max(1, h | 0)), r = mulberry(5501), cw = chTiles * 16, cx0 = Math.round((w - cw) / 2); rc(g, 0, 0, w, h, '#2a1214');
    for (let y = 0; y < h; y += 10) { const off = ((y / 10) & 1) ? 12 : 0; for (let x = -off; x < w; x += 24) { const t = r(), col = t < 0.25 ? '#6a3a30' : t < 0.7 ? '#552c26' : '#40201c'; rc(g, x + 1, y + 1, 22, 8, col); rc(g, x + 1, y + 1, 22, 1, '#8a5244'); rc(g, x + 1, y + 8, 22, 1, '#2a1214'); if (r() < 0.12) rc(g, x + 4 + r() * 12, y + 2, 5, 4, '#1a0a0c'); } }
    for (let x = 0; x < w; x += 4) { const top = 8 + Math.round(Math.sin(x * 0.07) * 4 + r() * 6); rc(g, x, 0, 4, top, '#000'); g.clearRect(x, 0, 4, top); }   /* the crown, broken */
    g.clearRect(cx0, 0, cw, h); rc(g, cx0 - 3, 0, 3, h, '#1a0a0c'); rc(g, cx0 + cw, 0, 3, h, '#1a0a0c');                                                         /* the slot: the spillway */
    for (let i = 0; i < 6; i++) { const x = cx0 + 4 + r() * (cw - 8); g.globalAlpha = 0.5; rc(g, x, 10, 2, h - 10, '#8a6a5a'); g.globalAlpha = 1; }
    for (let i = 0; i < 40; i++) rc(g, r() * w, 8 + r() * (h - 8), 1, 1, '#a89060');
    for (let i = 0; i < 14; i++) { const x = r() * w; if (x > cx0 - 4 && x < cx0 + cw + 4) continue; rc(g, x, 6 + r() * 12, 1, 4 + r() * 5, '#7a7a30'); }
    return c; });
}

const SHM = (() => { let sc = null; return (w, h) => { if (!sc || sc[0].width < w) sc = mk(Math.max(w, 640), h); return sc; }; })();
// ================= OVER THE HEROES: spray, dust in the light, heat at the rim =================
export function drawOver(g, S, K) {
  const { TS, cx, cy, vw, vh, time } = K;
  /* SPRAY: at the foot of every flood and burst, off the bed where it lands, and across every bridge deck it crosses */
  for (const s of S.spans) { const c = S.chOf(s.ch), x0 = c.x0 * TS - cx, wpx = (c.x1 - c.x0 + 1) * TS, base = (s.y1 + 1) * TS - cy, ys = [base];
    for (const z of S.L.ledgeZones || []) if (z[4] === 'lashed' && z[2] >= s.y0 && z[2] <= s.y1) ys.push(z[2] * TS - cy + 2);
    for (const by of ys) { if (by < -20 || by > vh + 30 || x0 > vw || x0 + wpx < 0) continue; g.fillStyle = P.foam;
      for (let i = 0; i < 18; i++) { const ph = (time * 2.4 + i * 0.37) % 1, x = x0 + ((i * 53) % wpx) + Math.sin(i * 3 + time * 5) * 4, y = by - ph * 26 * (0.5 + ((i * 7) % 5) / 5); g.globalAlpha = (1 - ph) * 0.8; g.fillRect(R(x), R(y), 1 + (i % 2), 1 + (i % 2)); }
      g.globalAlpha = 0.18 * (s.kind === 'burst' ? 1.4 : 1); g.fillRect(R(x0 - 10), R(by - 16), R(wpx + 20), 14); g.globalAlpha = 1; } }
  /* DUST MOTES: a slow drift, brightest in the warm light by the rim (a world above row ~30), a few dim ones deeper down, parallax 1.15 so they sit in front */
  { const lit = Math.max(0, 1 - (cy - 60) / 520); for (let i = 0; i < 46; i++) { const sx = (i * 97.13) % 1, sy = (i * 61.7) % 1, x = ((sx * (vw + 80) - cx * 1.15 + time * (4 + (i % 5) * 2) + 4000 * (vw + 80)) % (vw + 80)), y = ((sy * (vh + 40) - cy * 1.15 + Math.sin(time * 0.5 + i) * 6 + 4000 * (vh + 40)) % (vh + 40));
      const a = (0.1 + 0.5 * lit) * (0.6 + 0.4 * Math.sin(time * 1.3 + i * 2.1)); if (a < 0.04) continue; g.globalAlpha = a; g.fillStyle = lit > 0.3 ? '#ffd8a0' : '#b8a090'; g.fillRect(R(x) - 40, R(y) - 20, i % 4 === 0 ? 2 : 1, 1); } g.globalAlpha = 1; }
  /* HEAT SHIMMER at the RIM ONLY: a wobble through a thin band at the gorge's top edge, and over the dam's plateau floor - the shaded gorge below has none */
  if (K.shimmer !== false) { const band = (sy0, h, xa, xb) => { sy0 = R(sy0); if (sy0 > vh || sy0 + h < 0 || xb <= xa) return; const sc = SHM(vw, 64), top = Math.max(0, sy0), hh = Math.min(h, vh - top) - Math.max(0, top - sy0); if (hh <= 0) return;   /* one copy of the band, then strips of it back, each nudged: a self-copy per strip cost a whole-canvas copy each */
      sc[1].clearRect(0, 0, sc[0].width, sc[0].height); sc[1].drawImage(g.canvas, xa, top, xb - xa, hh, 0, 0, xb - xa, hh);
      for (let y = 0; y < hh; y += 3) { const sh = Math.round(Math.sin(time * 3.1 + (top + y) * 0.9 + xa * 0.01) * 1.4); if (sh) g.drawImage(sc[0], 0, y, xb - xa, 3, xa + sh, top + y, xb - xa, 3); } };
    band(60 - cy, 44, 0, vw);
    const dam = S.channels.find(c => c.id === 'dam'); if (dam) band(22 * TS - 30 - cy, 30, Math.max(0, (dam.x0 - 14) * TS - cx), Math.min(vw, (dam.x1 + 15) * TS - cx)); }
}
