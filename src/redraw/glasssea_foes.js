// glasssea_foes.js - THE GLASS SEA's CAST, in its own skins (claude/glasssea art pass). Four proven machines under a new skin each and ONE new foe (the skitter); every one reads
// apart from its sand-country twin at 320x180 by SILHOUETTE or COLOUR RAMP, never by a plain tint:
//   GLASS SCORPION   desert_glass.js's pale green-white glass scorpion (the scorpion's own frames and sizes: faceted streaks on every segment, a brittle shine)
//   SHARD THROWER    the rooftop slinger in sea-green glass-miner's rags, a teal headscarf, his sling bag glittering with cut shards (a man, not a blob)
//   NIGHT HUNTER     the cutthroat gone pale: a frost-blue robe, a bone-white mask, cyan eyes, a glass blade, a rime-white sash
//   GLASS SENTINEL   the shield guard in black obsidian plate behind a great green glass shield, a lit rim and a glint
//   THE SKITTER      the crack swarm's crawler: a violet-black glass shell with a spiked crystal back, six legs, a cyan-tipped crest, red eyes (5 frames)
// The remaps are exact-colour tables off each machine's own sheet (tools/_pal-style dump), so every frame keeps its pose, its tells and its hit box.
import { canvas, px, rect, flipX, whiten, outline, line } from '../px.js';
import { bakeGlassScorpion as dgScorpion } from './desert_glass.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const hexOf = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
/* an exact-colour remap of every frame (a colour not in the table stays), then fx(frameIndex, imageData) for glints */
function remap(base, table, fx) {
  const frames = base.R.map((c, fi) => { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
    for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const t = table[hexOf(p[i], p[i + 1], p[i + 2])]; if (t) { p[i] = parseInt(t.slice(1, 3), 16); p[i + 1] = parseInt(t.slice(3, 5), 16); p[i + 2] = parseInt(t.slice(5, 7), 16); } }
    if (fx) fx(fi, img, d.width, d.height); g.putImageData(img, 0, 0); return d; });
  return pack(frames, base.ax, base.ay, base.w, base.h);
}
const setPx = (img, W, x, y, hex) => { if (x < 0 || y < 0 || x >= W || y * W + x >= img.data.length / 4) return; const k = (y * W + x) * 4; if (!img.data[k + 3]) return; img.data[k] = parseInt(hex.slice(1, 3), 16); img.data[k + 1] = parseInt(hex.slice(3, 5), 16); img.data[k + 2] = parseInt(hex.slice(5, 7), 16); };

/* THE GLASS SCORPION: desert_glass.js's own glass scorpion (same frame table as the scorpion: 0,1 walk | 2 claw tell | 3 claw | 4 sting tell | 5 sting | 6 hurt) */
export const bakeGlassScorpion = () => dgScorpion();
/* THE SHARD THROWER (the slinger's frames): tunic tan -> sea-green rags, the red scarf -> teal, the bag's browns kept for leather, glittering with shards */
export const bakeShardThrower = base => remap(base, {
  '#cfae74': '#7aa8a0', '#ead0a0': '#c8ece4', '#e8dcc0': '#e4f8f2', '#9a7a48': '#4e7870', '#b8463a': '#2fa8b8', '#84302a': '#1a6070', '#8a8278': '#8ac8c8' },
  (fi, img, W, H) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4; if (!img.data[k + 3]) continue;
    const r = img.data[k], g = img.data[k + 1], b = img.data[k + 2];
    if (r === 0x8a && g === 0x5a && b === 0x32 && (x + y) % 2 === 0) setPx(img, W, x, y, '#8ae8d8');   /* the pouch's leather glitters with cut glass */
    if (r === 0xc6 && g === 0x8a && b === 0x5c && (x * 3 + y) % 11 === 0) setPx(img, W, x, y, '#e8d0b0'); } });
/* THE NIGHT HUNTER (the cutthroat's frames): indigo robe -> frost blue, face -> bone-white, the yellow eyes -> cyan, the red sash -> rime, the scimitar's steel -> a green glass blade */
export const bakeNightHunter = base => remap(base, {
  '#35305a': '#2e5276', '#2a2640': '#203c58', '#201c38': '#182e48', '#554e86': '#5c92bc', '#b8382c': '#c8ecf8', '#842218': '#7ab0cc', '#b07a52': '#dfe8ee', '#c9962a': '#8af4ff', '#f0dca0': '#e8ffff',
  '#c9d1dc': '#8ae0c8', '#f4f8ff': '#f0fff8', '#4e3e30': '#3a4a5a', '#2a1c12': '#16222e', '#fff6c8': '#ffffff' });
/* THE GLASS SENTINEL (the shield guard's frames): the helm and mail -> black obsidian, the bronze shield -> a great green glass shield with a lit rim, the red robe -> deep ink */
export const bakeGlassSentinel = base => remap(base, {
  '#8a929e': '#1c2a38', '#7a828e': '#141e2c', '#b8c0ca': '#4a7a98', '#d0d8e2': '#8ab8d0', '#8a5a32': '#3a9a78', '#b88450': '#7ae8c0', '#a8583a': '#256a58', '#5a3a1e': '#16463a', '#6a2a1c': '#101a28', '#3e140e': '#08101a', '#2a1410': '#060a12' },
  (fi, img, W, H) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4; if (!img.data[k + 3]) continue; if (img.data[k] === 0x7a && img.data[k + 1] === 0xe8 && img.data[k + 2] === 0xc0 && (x + y) % 3 === 0) setPx(img, W, x, y, '#f0fff8'); } });
/* THE SKITTER: 0,1 run | 2 bite tell (front raised, mandibles open, a bone-white flash) | 3 bite | 4 hurt; 14 x 10, feet on the last row, a 9 x 6 hit box */
export function bakeSkitter() {
  const F = [];
  for (let k = 0; k < 5; k++) { const [c, g] = canvas(14, 10), hurt = k === 4;
    const sh = hurt ? '#ffffff' : '#3a2a62', sh2 = hurt ? '#ffffff' : '#5a46a0', hi = hurt ? '#ffffff' : '#a898f0', leg = hurt ? '#ffffff' : '#1c1430', up = k === 2 ? -2 : 0, fw = k === 3 ? 2 : 0;
    rect(g, 2 + fw, 4 + up, 8, 3, sh); rect(g, 3 + fw, 3 + up, 6, 1, sh2); rect(g, 3 + fw, 3 + up, 4, 1, hi);   /* the glass shell */
    for (let i = 0; i < 3; i++) { const sx = 3 + i * 2 + fw; rect(g, sx, 1 + up + (i & 1), 1, 2, hurt ? '#ffffff' : '#7ad8f0'); px(g, sx, 1 + up + (i & 1), hurt ? '#ffffff' : '#e8ffff'); }   /* the crystal spikes down its back */
    rect(g, 9 + fw, 3 + up, 3, 3, sh); px(g, 11 + fw, 4 + up, hurt ? '#ffffff' : '#ff5a5a'); px(g, 10 + fw, 3 + up, hurt ? '#ffffff' : '#ff9a9a');   /* the head and its eyes */
    if (k === 2) { px(g, 12, 2, '#e8dcb0'); px(g, 13, 3, '#e8dcb0'); px(g, 12, 6, '#e8dcb0'); }   /* mandibles open: the tell */
    if (k === 3) rect(g, 12 + fw - 1, 4, 2, 2, '#e8dcb0');
    for (let i = 0; i < 3; i++) { const lx = 3 + i * 3 + (fw ? 1 : 0), ph = (k + i) % 2; px(g, lx, 7, leg); px(g, lx + (ph ? 1 : -1), 8, leg); px(g, lx + (ph ? 2 : -2), 9, leg); }   /* six legs, alternating */
    outline(c, '#0e0a1a'); F.push(c); }
  return pack(F, 7, 10, 9, 6);
}
/* a contact-sheet list for tools/glasssea-art-sheet.mjs: the bases and the skins, side by side */
export async function sheetItems() {
  const DFA = await import('./desert_foes.js'), CB = await import('./caravan_bandits.js'), DF2A = await import('./desert_foes2.js'), out = [];
  const sc = DFA.bakeScorpion(), cu = CB.bakeCutthroat(), sl = CB.bakeSlinger(), sh = DF2A.bakeShieldGuard();
  for (const [b, s] of [[sc, bakeGlassScorpion()], [cu, bakeNightHunter(cu)], [sl, bakeShardThrower(sl)], [sh, bakeGlassSentinel(sh)]]) out.push(...b.R.slice(0, 7), ...s.R.slice(0, 7));
  out.push(...bakeSkitter().R); return out;
}
