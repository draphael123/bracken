// minecart_skins.js - THE DEEP RAILS' goblin cart-riders (claude/minecartart): two reskins of existing foes (no new foe type - tools/one-new-foe.mjs still pins the Deep Rails to NONE; the
// riders are the archer's and the goblin mage's own machines, their frames, their hit boxes, their tells):
//   gobrider   the ARCHER as a mine goblin: grey-olive hide, a leather vest, a miner's iron cap with a lit candle-lamp, a bone-tally cord at the belt
//   gobcaster  the GOBLIN MAGE as the tunnel shaman: a soot-black robe with a violet hem, a brass-banded hat with a lamp at its tip, the rune-book glowing violet (the colour of the rune it lays on your rail)
// Made from the base frames by a recolour and a few drawn pixels (the underwell / canal skins' method). The skins die in their own skin (reskinSet in src/main.js).
import { canvas, flipX, whiten, rgb } from '../px.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const rampAt = (st, l) => l < 0.5 ? lerpC(st[0], st[1], l * 2) : lerpC(st[1], st[2], (l - 0.5) * 2);
function recolor(c, pick) { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765; if (l < 0.13) continue;
    const st = pick(r, gg, b, l); if (!st) continue; const o = rampAt(st, Math.min(1, l * 1.15)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d; }
const grow = (c, pad, draw) => { const [d, g] = canvas(c.width + pad * 2, c.height + pad * 2); g.drawImage(c, pad, pad); if (draw) { g.save(); g.translate(pad, pad); draw(g, pad); g.restore(); } return d; };
const reskin = (set, pick, pad, draw) => { const R = set.R.map((f0, k) => grow(recolor(f0, pick), pad, g => draw(g, k, f0))); return pack(R, set.ax + pad, set.ay + pad, set.w, set.h); };
const dot = (g, x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
/* the top row and the left-most column of a frame's opaque pixels (where the head and the hat are) */
const topRow = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let y = 0; y < c.height; y++) { let x0 = -1, x1 = -1; for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 128) { if (x0 < 0) x0 = x; x1 = x; } if (x0 >= 0) return { y, x0, x1 }; } return { y: 0, x0: 0, x1: 0 }; };

/* THE CART ARCHER: skin grey-olive, vest leather */
const ARCHER_PICK = (r, g, b, l) => (g > r + 8 && g > b + 8) ? ['#1c2616', '#566a3a', '#a4b47a'] : (r > g + 30 && r > b + 30) ? ['#1c1008', '#523620', '#8a6038'] : null;
const bakeCartArcher = base => reskin(base, ARCHER_PICK, 2, (g, k, f0) => {
  const t = topRow(f0), cx = Math.round((t.x0 + t.x1) / 2), y = t.y;
  g.fillStyle = '#1a1a20'; g.fillRect(cx - 3, y - 1, 7, 3); g.fillStyle = '#5a5a66'; g.fillRect(cx - 3, y - 1, 7, 1); g.fillStyle = '#8a8a96'; g.fillRect(cx - 2, y - 1, 2, 1);   /* the iron cap */
  g.fillStyle = '#3a3a44'; g.fillRect(cx + 3, y, 2, 2);   /* its lamp bracket */
  g.fillStyle = '#ffb040'; g.fillRect(cx + 4, y - 1, 2, 2); dot(g, cx + 4, y - 1, '#fff4c0');   /* the candle-lamp */
  g.fillStyle = '#cfc3a4'; g.fillRect(f0.width - 5, f0.height - 4, 1, 3); g.fillRect(f0.width - 7, f0.height - 4, 1, 2);   /* bone tally at the belt */
});
/* THE CART CASTER: the robe soot-black, brass trim kept, the book and its glow violet */
const CASTER_PICK = (r, g, b, l) => (b > r + 15 && b > g + 5) ? ['#0c0810', '#2a2230', '#5a4a68'] : (g > r + 8 && g > b + 8) ? ['#1c2616', '#566a3a', '#a4b47a'] : (r > 150 && g > 110 && b < 110) ? ['#4a3008', '#c8962c', '#ffe49a'] : (r > g + 40 && r > b + 20) ? ['#240c40', '#7a3ab8', '#e0b8ff'] : null;
const bakeCartCaster = base => reskin(base, CASTER_PICK, 2, (g, k, f0) => {
  const t = topRow(f0); dot(g, t.x0, t.y - 1, '#3a3a44'); g.fillStyle = '#ffb040'; g.fillRect(t.x0, t.y - 1, 2, 2); dot(g, t.x0, t.y - 1, '#fff4c0');   /* the lamp at the hat's tip */
  g.fillStyle = '#7a3ab8'; for (let x = 4; x < f0.width - 4; x += 3) g.fillRect(x, f0.height - 2, 2, 1);   /* a violet rune hem */
});
export { bakeCartArcher, bakeCartCaster };
