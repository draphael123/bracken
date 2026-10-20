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
/* a leaf, w wide (24 small / 32 big), in a tint, up or under: the old bakeLilyPad's shape (art.js) with a rim lit along its top-left edge */
export function bakePad(w, kind, under) {
  const key = w + kind + (under ? 'u' : ''); if (memo.has(key)) return memo.get(key);
  const T = PAD_TINT[kind] || PAD_TINT.sink, big = w > 24, h = big ? 9 : 7;
  const col = under ? T.under[0] : T.col, colD = under ? T.under[1] : T.colD, colL = under ? T.under[2] : T.colL;
  const [c, g] = canvas(w, h);
  ellipse(g, w / 2, h / 2, w / 2 - 0.5, h / 2 - 0.5, col, colD); ellipse(g, w / 2 - 2, h / 2 - 1, w / 4, big ? 2 : 1.5, colL, col);
  line(g, w / 2, h / 2 - 0.5, w - 2, 1, colD, 1); px(g, w - 2, 0, 'rgba(0,0,0,0)'); if (big) line(g, w / 2 - 2, h / 2, 5, h - 3, colD, 1);
  if (!under) {   /* THE RIM: the first lit pixel down each column on the left two-thirds, and the first across each row from the left */
    const d = g.getImageData(0, 0, w, h).data, on = (x, y) => d[(y * w + x) * 4 + 3] > 0;
    for (let x = 1; x < Math.round(w * 0.7); x++) for (let y = 0; y < h; y++) if (on(x, y)) { if (!(x >= w / 2 && y <= 1 && x > w - 4)) px(g, x, y, T.rim); break; }
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
/* THE MARSH LIGHT over a lamp pad (drawn AFTER the night's dark, so it shows through it): a cold green-white flame bobbing a tile over the leaf, a halo, and a thin
   reflection on the water. alpha fades it in only while the pad's lamp is lit (it always is - a firm pad's light never goes out). */
export function drawPadLight(g, m, cx, cy, time) {
  const x = Math.round(m.x0 + m.w / 2) - cx, bob = Math.sin(time * 2.2 + m.x0 * 0.05) * 2, y = Math.round(m.y0 - 15 + bob) - cy;
  const fl = 0.85 + 0.15 * Math.sin(time * 9 + m.x0);
  g.globalAlpha = 0.22 * fl; g.fillStyle = '#b8ffd8'; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 0.35 * fl; g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1; g.fillStyle = '#e8fff0'; g.fillRect(x - 1, y - 2, 3, 4); g.fillStyle = '#ffffff'; g.fillRect(x, y - 3, 1, 2); g.fillStyle = '#7fe0a8'; g.fillRect(x - 1, y + 2, 3, 1);
  g.globalAlpha = 0.4 * fl; g.fillStyle = '#b8ffd8'; g.fillRect(x - 3, Math.round(m.y0) - cy + 6, 7, 1); g.globalAlpha = 1;   /* its line on the water */
}
