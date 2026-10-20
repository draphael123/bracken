// lilypad.js - THE LILY PADS, READABLE (claude/marsh3; Daniel 10-20 brief item 2: "LILY PADS EASY TO READ: bright rim + darker water edge per pad; a told wobble +
// ripple as one starts to sink; pads that WILL sink a slightly different tint (plan a route)").
//   EVERY PAD    a dark WATER EDGE round it at the waterline (the leaf stands off the water), a BRIGHT RIM along its top and left edge inside the outline.
//   TWO TINTS    a pad that SINKS (the marsh's rule, the default) is a warmer, yellower leaf - a leaf going over; a pad that HOLDS (firm: true) is the deep cool green
//                with a pale mint rim. A route across the water is planned off the colours.
//   THE TELL     a sinking pad that is stood on WOBBLES (a pixel side to side, faster as it goes) and throws RIPPLE RINGS out across the water from its rim while it
//                goes down; a firm pad only dips a little and lies still.
//   THE NIGHT    a pad with lamp: true (MARSH WOOD's night stretch) carries a MARSH LIGHT over it - a small cold flame bobbing above a firm leaf: in the dark, the lights
//                are the ones that hold (drawn in drawPadLight, after the dark).
// main.js draws every non-wreck pad through drawPad; the bud pad keeps its own sprite (PROP.padSpring) and gets the edge, wobble and ripples.
import { canvas, ellipse, line, px, outline } from '../px.js';

const OUT = '#1b1626';
export const PAD_TINT = {
  sink: { col: '#7c9a46', colD: '#526c2c', colL: '#c2d872', rim: '#f0f6b4', under: ['#5a7234', '#3a4c22', '#7c9a46'] },
  hold: { col: '#3e9a5c', colD: '#246a3e', colL: '#7fdc92', rim: '#cbffd8', under: ['#2e7448', '#1c4c30', '#3e9a5c'] },
};
const memo = new Map();
/* a leaf, w wide (24 small / 32 big), in a tint, up or under. (claude/marsh3art) Shaded per pixel: lit from the top-left, a thick dark underlip on the lower edge, the
   notch a slit cut in from the right, veins radiating from the stem; a SINKING leaf is going over (brown-gold blotches and a curled, spotted edge), a HOLDING one is
   glossy (dew glints, a clean vein). The rim stays: first lit pixel down each column on the left two-thirds and first across each row from the left. */
export function bakePad(w, kind, under) {
  const key = w + kind + (under ? 'u' : ''); if (memo.has(key)) return memo.get(key);
  const T = PAD_TINT[kind] || PAD_TINT.sink, big = w > 24, h = big ? 9 : 7, sinkK = kind === 'sink';
  const col = under ? T.under[0] : T.col, colD = under ? T.under[1] : T.colD, colL = under ? T.under[2] : T.colL;
  const [c, g] = canvas(w, h), cx = w / 2, cy = h / 2, rx = w / 2 - 0.4, ry = h / 2 - 0.2;
  const inside = (x, y) => { const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry; return u * u + v * v <= 1; };
  const hs = (x, y, m) => { let q = (Math.imul(x + w * 31, 374761393) + Math.imul(y + 7, 668265263)) | 0; q = Math.imul(q ^ (q >>> 13), 1274126177); return ((q ^ (q >>> 16)) >>> 0) % m; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!inside(x, y)) continue;
    const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry, d = u * u + v * v, lit = -0.45 * u - 0.75 * v;
    if (u > 0.3 && Math.abs(v) < 0.2 + 0.1 * (u - 0.3)) continue;                       /* the notch, a slit running in from the right edge */
    let cc = lit > 0.42 ? colL : lit < -0.2 ? colD : col;
    if (d > 0.62 && v > 0.15) cc = colD;                                                 /* the underlip: thickness of the leaf at the lower edge */
    else if (d > 0.5 && v < -0.2 && lit > 0.1) cc = colL;
    /* veins: spokes from the stem (a little left of centre) out to the rim */
    const ang = Math.atan2(v * ry, (u + 0.25) * rx), spokes = big ? 7 : 5, sp = Math.abs(((ang + Math.PI) / (Math.PI * 2) * spokes * 2) % 2 - 1);
    if (!under && sp < 0.07 && d > 0.08 && d < 0.78) cc = lit > 0 ? col : colD;
    if (!under && sinkK) {                                                               /* going over: gold-brown blotches near the edge, a darker spotted curl */
      if (d > 0.4 && hs(x, y, 11) === 0) cc = '#a8923c'; else if (d > 0.55 && hs(x + 3, y, 14) === 0) cc = '#6a5a2a';
    } else if (!under && !sinkK) {                                                       /* holding: glossy, dew glints on the lit side */
      if (lit > 0.3 && hs(x, y, 13) === 0) cc = '#e8fff4';
    }
    px(g, x, y, cc);
  }
  if (!under) {   /* THE RIM */
    const d = g.getImageData(0, 0, w, h).data, on = (x, y) => d[(y * w + x) * 4 + 3] > 0;
    for (let x = 1; x < Math.round(w * 0.7); x++) for (let y = 0; y < h; y++) if (on(x, y)) { px(g, x, y, T.rim); break; }
    for (let y = 1; y < h - 1; y++) for (let x = 0; x < w; x++) if (on(x, y)) { px(g, x, y, T.rim); break; }
  }
  const o = outline(c, OUT); memo.set(key, o); return o;
}
/* THE PAD, ITS WATER EDGE, ITS TELL. spr: the leaf to draw (a canvas), dy: its draw offset from m.y, flower: an optional bloom [canvas, dx, dy] */
export function drawPad(g, m, cx, cy, time, spr, dy = 0, flower = null) {
  const w = m.w, h = m.big ? 9 : 7, x0 = Math.round(m.x) - cx, wy = Math.round(m.y0) - cy + (m.spring ? 4 : Math.round(h / 2) + 1);
  /* the water edge: a dark lip on the water round the leaf, where it sits at rest (the leaf goes down into it) */
  g.globalAlpha = 0.5; g.fillStyle = '#0a2422'; g.beginPath(); g.ellipse(Math.round(m.x0) - cx + w / 2, wy, w / 2 + 2, h / 2 + 1.5, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 0.35; g.fillStyle = '#04100f'; g.beginPath(); g.ellipse(Math.round(m.x0) - cx + w / 2, wy + 1, w / 2, h / 2, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  /* THE TELL: a sinking leaf that is going down wobbles and rings the water */
  const going = !m.firm && m.sink > 0.01 && m.sink < 0.995 && m.padOn;
  let wob = 0;
  if (going) {
    wob = Math.round(Math.sin(time * (18 + 22 * m.sink) + m.x0 * 0.1) * (m.sink < 0.85 ? 1 : 0));
    for (let i = 0; i < 2; i++) { const k = (time * 1.7 + i * 0.5) % 1; g.globalAlpha = 0.6 * (1 - k); g.strokeStyle = '#e4f8ec'; g.lineWidth = 1;
      g.beginPath(); g.ellipse(Math.round(m.x0) - cx + w / 2 + 0.5, wy + 0.5, w / 2 + 2 + k * 12, h / 2 + 1 + k * 3, 0, 0, Math.PI * 2); g.stroke(); }
    g.globalAlpha = 1;
  }
  g.drawImage(spr, x0 + wob, Math.round(m.y) - cy + dy);
  if (flower) g.drawImage(flower[0], x0 + wob + flower[1], Math.round(m.y) - cy + flower[2]);
}
/* THE MARSH LIGHT over a lamp pad (drawn AFTER the night's dark, so it shows through it). (claude/marsh3art) A small cold flame - a teardrop with a white heart, a
   green-blue skirt and a tail that streams the way it sways - riding on a soft halo (a baked glow, not arcs), two motes circling it, and its wavering line on the water. */
const HALO = (() => { let c = null; return () => { if (c) return c; let g; [c, g] = canvas(40, 40); for (let r = 19; r > 0; r--) { g.globalAlpha = 0.03 + (19 - r) * 0.0085; g.fillStyle = r > 9 ? '#9af0c0' : '#d8ffe8'; g.beginPath(); g.arc(20, 20, r, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; return c; }; })();
const FLAME = (() => { const cache = []; return sway => { const k = sway + 1; if (cache[k]) return cache[k]; const [c, g] = canvas(9, 11);
  const rows = [[4, 4, '#ffffff'], [3, 5, '#e8fff0'], [3, 5, '#e8fff0'], [2, 6, '#b8ffd8'], [2, 6, '#b8ffd8'], [2, 6, '#7fe0a8'], [3, 5, '#5fd0a0'], [3, 5, '#3aa07a']];   /* [x0, x1, colour] from the tip down */
  rows.forEach(([x0, x1, cl], i) => { const sh = i < 3 ? Math.round(sway * (3 - i) / 3) : 0; for (let x = x0; x <= x1; x++) px(g, x + sh, i + 1, cl); });
  px(g, 4 - sway, 0, '#e8fff0'); px(g, 4, 9, '#2a7a5a'); px(g, 4 + sway, 10, '#1d5a46'); px(g, 3, 6, '#ffffff');   /* the tail streams the other way */
  return (cache[k] = c); }; })();
export function drawPadLight(g, m, cx, cy, time) {
  const x = Math.round(m.x0 + m.w / 2) - cx, bob = Math.sin(time * 2.2 + m.x0 * 0.05) * 2, y = Math.round(m.y0 - 15 + bob) - cy;
  const fl = 0.85 + 0.15 * Math.sin(time * 9 + m.x0), sway = Math.round(Math.sin(time * 3.1 + m.x0 * 0.3));
  g.globalAlpha = 0.9 * fl; g.drawImage(HALO(), x - 20, y - 20); g.globalAlpha = 1;
  g.drawImage(FLAME(sway), x - 4, y - 5);
  for (let i = 0; i < 2; i++) { const a = time * 2.4 + i * Math.PI + m.x0 * 0.1; g.fillStyle = i ? '#b8ffd8' : '#e8fff0'; g.fillRect(x + Math.round(Math.cos(a) * 8), y + Math.round(Math.sin(a) * 4) - 1, 1, 1); }
  const wy = Math.round(m.y0) - cy + 5;   /* its line on the water, wavering and broken */
  for (let i = 0; i < 3; i++) { g.globalAlpha = (0.5 - i * 0.14) * fl; g.fillStyle = i ? '#7fe0a8' : '#b8ffd8'; const ww = 7 - i * 2; g.fillRect(x - (ww >> 1) + Math.round(Math.sin(time * 4 + i * 2 + m.x0) * (1 + i)), wy + 1 + i * 2, ww, 1); }
  g.globalAlpha = 1;
}
