// tools/sky-art.mjs - THE SKY FIGHT's art, rendered and linted in Node (claude/skyart, lane S4): the drake mount parts, every Demon King POSE x PHASE (src/demon-king.js POSE),
// the sky layers (3 altitudes x 4 ids), checks that a windup never equals its release (B16), that the phases differ, that the flash silhouette matches.
// usage: node tools/sky-art.mjs [out-prefix]   -> writes <prefix>-mount.png, -king.png, -sky.png
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { POSE, TOLD } = await import('../src/demon-king.js');
const { SKY } = await import('../src/sky-mount.js');
const MA = await import('../src/redraw/sky_mount_art.js');
const KA = await import('../src/redraw/demon_king_art.js');
const SL = await import('../src/redraw/sky_layers_art.js');
const bad = []; let n = 0;
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
const out = process.argv[2];
const scaled = (list, o, s = 2) => { const sh = sheet(list, o), c = newCanvas(sh.width * s, sh.height * s), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * s, sh.height * s); return c; };

/* 1. the drake mount */
const parts = [['back', MA.backTile()], ['head calm', MA.neckHead('calm')], ['head tell', MA.neckHead('tell')], ['head roar', MA.neckHead('roar')], ['tail 0', MA.tailSprite(0)], ['tail 4', MA.tailSprite(4)],
  ['wing up near', MA.wingSprite(-1, true)], ['wing down near', MA.wingSprite(1, true)], ['wing mid far', MA.wingSprite(0, false)], ['spines', MA.spineWall()], ['fin', MA.finWall()]];
const ps = new Map();
for (const [name, c] of parts) { n++; const s = sig(c); if (s.k < 120) bad.push('mount ' + name + ': barely drawn (' + s.k + ')'); if (ps.has(s.h)) bad.push('mount ' + name + ' == ' + ps.get(s.h)); ps.set(s.h, name); }
if (out) savePNG(scaled(parts.map(p => p[1]), { maxW: 640, bg: '#4a3a44', pad: 4 }), out + '-mount.png');
if (MA.backTile().width !== MA.BACK.w) bad.push('back tile width');

/* 2. the king: every POSE at every phase */
const names = Object.keys(POSE), K = [], sigs = {};
for (const ph of [1, 2, 3]) for (const nm of names) {
  const p = POSE[nm]; n++;
  const s = KA.kingSprite({ ...p, ph, frame: 0 }), q = sig(s.c); sigs[nm + ph] = q; K.push(s.c);
  if (s.c.width !== KA.KING_ANCHOR.w || s.c.height !== KA.KING_ANCHOR.h) bad.push('king ' + nm + ph + ': size');
  if (q.k < 500) bad.push('king ' + nm + ' P' + ph + ': barely drawn (' + q.k + ')');
  if (!(s.hand[0] >= 0 && s.hand[0] < s.c.width && s.hand[1] >= 0 && s.hand[1] < s.c.height)) bad.push('king ' + nm + ': hand off the sprite');
  const w = KA.kingSprite({ ...p, ph, frame: 0 }, true); if (sig(w.c).k !== q.k) bad.push('king ' + nm + ph + ': flash silhouette differs');
}
for (const [mv, T] of Object.entries(TOLD)) for (const ph of [1, 2, 3]) if (sigs[T.tell + ph] && sigs[T.release + ph] && sigs[T.tell + ph].h === sigs[T.release + ph].h) bad.push('king ' + mv + ' P' + ph + ': windup == release (B16)');
for (const nm of names) { if (sigs[nm + 1].h === sigs[nm + 2].h || sigs[nm + 2].h === sigs[nm + 3].h) bad.push('king ' + nm + ': two phases draw identically (he is regaining power)'); }
/* (identical idle / prone poses - enter, float, climb; downed, beaten - are the same picture on purpose; the orb is drawn on top, not baked) */
if (out) savePNG(scaled(K, { maxW: 11 * (KA.KING_ANCHOR.w + 8), bg: '#4a3a44', pad: 4 }, 1), out + '-king.png');

/* 3. the sky layers */
const layers = [];
for (const alt of ['rim', 'high', 'ash']) for (const [VW, VH] of [[320, 180]]) {
  const [c, g] = [newCanvas(VW, VH), null]; const G = c.getContext('2d'); n++;
  const b = { scroll: 0 }; const shift = (ly, sc, P) => -((sc * ly.k) % P);
  try { const tile = SL.gradientTile(SKY[alt].top, SKY[alt].bot, SKY[alt].glow, VW, VH); G.drawImage(tile, 0, 0);
    for (const ly of SKY[alt].layers) { const art = SL.layerArt ? SL.layerArt(ly.id, VH, ly, SKY[alt]) : null; if (!art) continue; if (art.kind === 'tile') { for (let x = 0; x < VW + 256; x += 256) G.drawImage(art.c, x, Math.round(ly.y * VH)); }
      else if (art.kind === 'cone') G.drawImage(art.c, Math.round(VW * 0.55 - art.c.width / 2), Math.round(ly.y * VH)); } void shift; void b; void g;
  } catch (e) { bad.push('sky ' + alt + ': ' + e.message); }
  layers.push(c);
}
if (out) savePNG(scaled(layers, { maxW: 340, bg: '#000', pad: 4 }, 2), out + '-sky.png');
console.log(JSON.stringify({ checked: n, kingPoses: names.length, bad: bad.length }));
for (const b of bad) console.log('FAIL: ' + b);
process.exit(bad.length ? 1 : 0);
