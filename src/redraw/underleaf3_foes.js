// underleaf3_foes.js - UNDERLEAF 3's PEOPLE, reskinned (claude/underleafart). The level's foes are the greybox's proven goblin AIs; their frames are the goblins' own, so here they wear the village's craft
// (same sizes, same frame order, so main.js draws, hurts, kills and names them through its cnSkin machinery: reskinSet, beastName, corpses; the level data is untouched - L.reskin gives the skin at spawn):
//   HERB GATHERER   (sprig)       an olive goblin in a pointed leaf cap, a basket of herbs on his back
//   HERB THIEF      (thief)       a hooded cut-purse in leaf green, a rush satchel with herbs poking out
//   HERB WARDEN     (shield)      a leaf-hooded guard behind a great LEAF SHIELD (midrib, veins, thorn studs)
//   JAR-THROWER     (rockgoblin)  a goblin in burlap and a leaf hat, a bandolier of her jars, a fire-jar in his hand
//   LEAF ARCHER     (archer)      a hooded archer in a leaf cloak, a bone bow
//   THORN-BEAST     (brute)       a hulk wearing a pelt of living bramble, long pale thorns - and THORNBARE: the same beast after a red jar burnt the coat off (charred, embers, stubs)
//   HER BROOD       (sprig)       the small goblins she calls: warm brown, tiny witch hats, green eyes
// bakeX(base) -> { R, L, white, ax, ay, w, h } like every foe set.
import { canvas, flipX, whiten, rgb, outline } from '../px.js';

const OUT = '#1b1626', EYE = '#b8f070';   /* the village's one glow: her potion-light, in their eyes */
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const rampAt = (st, l) => l < 0.5 ? lerpC(st[0], st[1], l * 2) : lerpC(st[1], st[2], (l - 0.5) * 2);
const pack = (frames, base) => ({ R: frames, L: frames.map(c => flipX(c)), white: { R: frames.map(c => whiten(c)), L: frames.map(c => flipX(whiten(c))) }, ax: base.ax, ay: base.ay, w: base.w, h: base.h });
/* the class of a pixel in the goblin's sheets */
const kind = (r, g, b, l) => {
  if (l < 0.13) return 'dark';
  if (r > 200 && g > 150 && b < 110 && r >= g) return 'gold';        /* the shield's boss, the lantern's flame */
  if (g > r + 10 && g > b + 10) return 'skin';                       /* the goblin's green */
  if (r > g + 40 && r > b + 30) return 'red';                         /* the belt, the lit red */
  if (b > g + 8 && b >= r - 10) return l > 0.55 ? 'helm' : 'tunic';  /* the helm's blue-grey and the tunic's purple */
  if (Math.abs(r - g) < 26 && Math.abs(g - b) < 30) return l > 0.82 ? 'rim' : 'helm';   /* the near-white rim stays; grey is helm */
  if (r > g && g > b) return l < 0.34 ? 'wood' : 'tan';              /* the shield, the club, the boots / the sacks and the tunic */
  return 'other';
};
function recolor(c, map, fix) {
  const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765, k = kind(r, gg, b, l), st = map[fix ? fix((i >> 2) % d.width, ((i >> 2) / d.width) | 0, k) : k]; if (!st) continue;
    const o = rampAt(st, Math.min(1, l * 1.2)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d;
}
/* where the head is in a frame: the top row of skin, the helm's rows above it, the skin's centre column */
function headOf(c) {
  const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), p = img.data; let top = -1, helmTop = -1, x0 = 99, x1 = -1, sx = 0, sn = 0;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765, k = kind(r, gg, b, l);
    if (k === 'skin' && top < 0) top = y; if ((k === 'helm' || k === 'rim' || k === 'wood') && helmTop < 0 && y < (top < 0 ? c.height : top + 8)) helmTop = y; }
  const yy = top < 0 ? 0 : top; for (let y = yy; y < yy + 4; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (!p[i + 3]) continue; const k = kind(p[i], p[i + 1], p[i + 2], (p[i] + p[i + 1] + p[i + 2]) / 765); if (k === 'skin') { sx += x; sn++; if (x < x0) x0 = x; if (x > x1) x1 = x; } }
  return { top, helmTop, x0, x1, cx: sn ? Math.round(sx / sn) : (c.width >> 1) };
}
/* an overlay (own dark outline) laid over a frame */
function overlay(c, draw) { const [o, g] = canvas(c.width, c.height); draw(g); outline(o, OUT); const [d, k] = canvas(c.width, c.height); k.drawImage(c, 0, 0); k.drawImage(o, 0, 0); return d; }
const px1 = (g, x, y, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, 1, 1); };
const row = (g, x, y, w, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, w | 0, 1); };
const LEAF = ['#1c3a18', '#3e7a2c', '#86b84a'], MOSS = ['#26361a', '#445c26', '#728e3c'], BURLAP = ['#4a3a22', '#8a7040', '#c8a860'], BARK = ['#241a12', '#54402a', '#86683e'], RUST = ['#3a1e12', '#7a4222', '#b87c46'];
/* a pointed leaf cap: a cone of leaf, tip leaning, a pale midrib; cx = head centre, y = the row above the head, w = half width at the base, lean = tip direction */
function leafCap(g, cx, y, w, h, lean, ramp) {
  for (let i = 0; i < h; i++) { const t = i / (h - 1 || 1), ww = Math.max(0, Math.round(w * t)), tipx = Math.round(lean * (1 - t) * (h * 0.5)); row(g, cx - ww + tipx, y + i, ww * 2 + 1, i === 0 ? ramp[2] : i < h - 1 ? ramp[1] : ramp[0]); if (ww >= 2) px1(g, cx - ww + tipx, y + i, ramp[2]); }
  px1(g, cx + Math.round(lean * h * 0.5), y, ramp[2]);
}

/* ------------------------------------------------------------------ THE HERB GATHERER (the sprig's AI and frames) ------------------------------------------------------------------ */
export function bakeHerbGatherer(base) {
  const map = { skin: ['#2e3a1a', '#6a7a2e', '#a8b45a'], red: RUST, tan: BURLAP, wood: BARK };
  const frames = base.R.map(f => { const h = headOf(f); let c = recolor(f, map);
    c = overlay(c, g => { const top = h.top < 0 ? 1 : h.top, cx = h.cx; leafCap(g, cx, top - 3, 3, 4, 1, LEAF); row(g, cx - 3, top + 1, 7, LEAF[0]);                       /* the leaf cap, a brim */
      const bx = Math.max(0, (h.x0 < 99 ? h.x0 : cx - 3) - 3), by = top + 3;                                                                                         /* a basket on his back */
      row(g, bx, by, 4, BURLAP[2]); row(g, bx, by + 1, 4, BURLAP[1]); row(g, bx, by + 2, 4, BURLAP[0]); px1(g, bx + 1, by - 1, LEAF[2]); px1(g, bx + 2, by - 2, MOSS[2]); px1(g, bx + 3, by - 1, '#b08ac0'); });
    return c; });
  return pack(frames, base);
}
/* ------------------------------------------------------------------ THE HERB THIEF (the thief's AI and frames) ------------------------------------------------------------------ */
export function bakeHerbThief(base) {
  const map = { skin: ['#2e3a1a', '#6a7a2e', '#a8b45a'], wood: ['#12220e', '#2e5a22', '#58903a'], tan: ['#5a4a2a', '#a8904e', '#dcc780'], red: RUST, tunic: BARK };
  const frames = base.R.map(f => { let c = recolor(f, map);
    c = overlay(c, g => { const w = f.width; for (let x = 0; x < 4; x++) px1(g, 1 + x, 4 + (x % 2), x % 2 ? LEAF[2] : '#b08ac0'); px1(g, 2, 3, LEAF[1]); void w; });   /* herbs poking out of the satchel */
    return c; });
  return pack(frames, base);
}
/* ------------------------------------------------------------------ THE HERB WARDEN (the shield-goblin's AI and frames) ------------------------------------------------------------------ */
export function bakeHerbWarden(base) {
  const hood = ['#16301a', '#356a2a', '#70a848'], map = {
    skin: ['#2e3a1a', '#6a7a2e', '#a8b45a'],
    helm: hood,                                        /* the helm is a leaf hood */
    tunic: BARK,                                       /* bark */
    red: RUST,                                         /* a rusted belt */
    wood: ['#22381a', '#4a8a30', '#9acc5a'],          /* the shield is a great leaf: green */
    tan: ['#22381a', '#4a8a30', '#9acc5a'],
    gold: ['#d8c898', '#f0e6c0', '#fff8e0'],          /* its midrib, a pale cream */
    shield: ['#22381a', '#4a8a30', '#9acc5a'],
  };
  const frames = base.R.map(f => { const h = headOf(f); let c = recolor(f, map, (x, y, k) => k === 'red' && x >= (f.width >> 1) + 3 ? 'shield' : k);   /* the shield's brown is the belt's red: told apart by where it is (the right side) */
    if (h.helmTop >= 0) c = overlay(c, g => { const cx = h.cx, y0 = h.helmTop; px1(g, cx - 2, y0 - 1, '#e8dcc0'); px1(g, cx + 2, y0 - 1, '#e8dcc0'); px1(g, cx, y0 - 2, '#e8dcc0'); });   /* three thorns on the hood's crest */
    return c; });
  /* the leaf shield: veins running off its midrib, a dark edge */
  frames.forEach(c => { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), p = img.data;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2];
      if (gg > 110 && gg > r + 25 && gg > b + 40 && gg < 215 && ((x * 2 + y) % 5 === 0)) { p[i] = r * 0.78; p[i + 1] = gg * 0.8; p[i + 2] = b * 0.7; } }
    g.putImageData(img, 0, 0); });
  return pack(frames, base);
}
/* ------------------------------------------------------------------ THE JAR-THROWER (the rock-goblin's AI and frames: it throws her fire-jars) ------------------------------------------------------------------ */
export function bakeJarThrower(base) {
  const map = { skin: ['#2e3a1a', '#6a7a2e', '#a8b45a'], helm: ['#2a3a1a', '#5a7a2e', '#98b84e'], tan: BURLAP, wood: BARK, red: RUST, tunic: BARK };
  const frames = base.R.map(f => { const h = headOf(f); let c = recolor(f, map);
    c = overlay(c, g => { const top = h.top < 0 ? 2 : h.top, cx = h.cx; leafCap(g, cx, top - 3, 3, 4, -1, LEAF);
      /* the bandolier: a strap of twine across the chest with her three jars hung on it */
      const bx = cx - 3, by = top + 5; for (let k = 0; k < 6; k++) px1(g, bx + k, by + (k >> 1), '#cbb888');
      px1(g, bx + 1, by + 2, '#5fae3a'); px1(g, bx + 3, by + 3, '#4a8fd8'); px1(g, bx + 5, by + 4, '#d8502a'); px1(g, bx + 1, by + 3, '#2e5a1c'); px1(g, bx + 3, by + 4, '#24406a'); px1(g, bx + 5, by + 5, '#6a2014'); });
    return c; });
  return pack(frames, base);
}
/* ------------------------------------------------------------------ THE LEAF ARCHER (the goblin archer's AI and frames) ------------------------------------------------------------------ */
export function bakeLeafArcher(base) {
  const frames = base.R.map(f => { const h = headOf(f), [d, g] = canvas(f.width, f.height); g.drawImage(f, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
    for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765, k = kind(r, gg, b, l), yy = (i >> 2) / d.width | 0; let st = null;
      if (k === 'skin') st = l < 0.36 && h.top >= 0 && yy <= h.top + 5 ? LEAF : ['#2e3a1a', '#6a7a2e', '#a8b45a']; else if (k === 'red') st = RUST; else if (k === 'dark' && false) st = null; if (!st) continue; const o = rampAt(st, Math.min(1, l * 1.25)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
    g.putImageData(img, 0, 0); let c = d;
    if (h.top >= 0) c = overlay(c, o => { const cx = h.cx, y0 = h.top; leafCap(o, cx, y0 - 3, 3, 4, 1, LEAF); px1(o, cx - 3, y0 - 1, '#d89458'); px1(o, cx - 4, y0, '#a85a3a'); });   /* a leaf hood and a feather */
    return c; });
  return pack(frames, base);
}
/* ------------------------------------------------------------------ THE THORN-BEAST (the brute's AI and frames) and the same BEAST BURNT BARE ------------------------------------------------------------------ */
const cane = (g, x, y, len, dir, col) => { for (let k = 0; k < len; k++) { px1(g, x + k * dir, y - ((k * 0.6) | 0), col); } };
export function bakeThornBeast(base, bare) {
  const skin = bare ? ['#14160c', '#3a4426', '#6a7a3a'] : ['#1c2a12', '#3a5424', '#6a8a3a'], map = { skin, tunic: bare ? ['#16120e', '#2e241a', '#4a3a28'] : BARK, red: bare ? ['#2a1408', '#5a2a10', '#8a4a1c'] : RUST, wood: bare ? ['#1a1410', '#3a2e22', '#5a4a38'] : BARK };
  const frames = base.R.map((f, fi) => { const h = headOf(f); let c = recolor(f, map); const top = h.top < 0 ? 4 : h.top, W = f.width, x0 = h.x0 < 99 ? h.x0 : 4, x1 = h.x1 > -1 ? h.x1 : W - 5;
    const fx0 = x0 + 1, fx1 = x1 - 1, fy0 = top + 2, fy1 = top + 9, inFace = (x, y) => x >= fx0 && x <= fx1 && y >= fy0 && y <= fy1;   /* the face stays clear */
    c = overlay(c, g => { const rn = (a, b) => ((fi * 131 + a * 17 + b * 29) % 97) / 97;
      if (!bare) { /* THE COAT: a mantle of living bramble over the crown, the shoulders and the back - canes crossing, small leaves, long pale thorns standing up off it; the face is clear */
        for (let y = top - 2; y < top + 14; y++) for (let x = Math.max(0, x0 - 4); x <= Math.min(W - 1, x1 + 4); x++) { if (inFace(x, y)) continue; const crown = y <= top + 1, flank = (x < fx0 || x > fx1) && y <= top + 9, back = false; if (!(crown || flank || back)) continue;
          const v = rn(x, y); if (v < 0.58) px1(g, x, y, v < 0.2 ? '#16200e' : v < 0.4 ? '#243a16' : '#386a24'); }
        for (let k = 0; k < 3; k++) cane(g, x0 - 3, top + 3 + k * 3, 4, 1, '#4a2a16'); for (let k = 0; k < 3; k++) cane(g, x1 + 3, top + 5 + k * 3, 4, -1, '#4a2a16');
        for (let x = x0 - 3; x <= x1 + 3; x += 3) { const v = rn(x, 7); px1(g, x, top - 3 - (v < 0.5 ? 1 : 0), '#e8dcc0'); px1(g, x, top - 2, '#386a24'); }                  /* the crest of thorns, standing up */
        for (let y = top + 1; y < top + 9; y += 3) { px1(g, x0 - 5, y, '#e8dcc0'); px1(g, x1 + 5, y + 1, '#c8bc9c'); } }
      else { /* BARE: scorched; a few burnt stubs on the crown, embers in the shoulders' ashes */
        for (let x = x0 - 2; x <= x1 + 2; x += 3) { const v = rn(x, 3); px1(g, x, top - 1, '#0e0a08'); if (v < 0.5) px1(g, x, top - 2, '#0e0a08'); }
        for (let k = 0; k < 5; k++) { const x = k % 2 ? x1 + 1 + ((rn(k, 5) * 3) | 0) : x0 - 3 + ((rn(k, 5) * 3) | 0), y = top + 3 + ((rn(k, 9) * 8) | 0); if (x >= 0 && x < W) px1(g, x, y, k % 2 ? '#ff9a5c' : '#d8502a'); } }
      px1(g, h.cx - 2, top + 4, EYE); px1(g, h.cx + 2, top + 4, EYE); });                                                                                              /* her light in its eyes */
    return c; });
  return pack(frames, base);
}
/* ------------------------------------------------------------------ HER BROOD (the sprig's AI and frames): little hooded goblins that crowd round her ------------------------------------------------------------------ */
export function bakeGrandBrood(base) {
  const map = { skin: ['#3a2a14', '#8a5e34', '#c89458'], red: ['#2a1a30', '#5a3a6a', '#8a64a0'], tan: BURLAP, wood: BARK };
  const frames = base.R.map(f => { const h = headOf(f); let c = recolor(f, map);
    c = overlay(c, g => { const top = h.top < 0 ? 1 : h.top, cx = h.cx; leafCap(g, cx, top - 4, 3, 5, 1, ['#1a1426', '#3a2a50', '#6a50a0']); row(g, cx - 3, top + 1, 7, '#1a1426'); px1(g, cx - 2, top + 2, EYE); px1(g, cx + 2, top + 2, EYE); px1(g, cx + 3, top - 4, '#ffc860'); });   /* a tiny witch hat, a candle-spark on its tip */
    return c; });
  return pack(frames, base);
}
