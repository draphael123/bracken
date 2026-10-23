// sporewood2_foes.js - SPOREWOOD 2's RESKINNED HEAVIES (claude/sporewood2art; theme fit: no goblins after the Goblin Queen - the proven AIs wear the wood's own people).
//   MYCONID GUARD  (the shieldgob's AI and frames: walk, the slow turn, the shove tell and shove, the hurt and death frames) a fungal soldier: an olive cap where the helm was, cream stalk-flesh, a bark
//                  tunic, a BRACKET-FUNGUS shield (tan, growth rings)
//   CAP BRUTE      (the brute's AI and frames: walk, the overhead's raise, the sweep) a hulk of pale ochre stalk under a great rust-red cap spotted cream, in a moss tunic, with a stalk-bone club
// Same sizes, same frame order, so main.js draws, hurts, kills and names them through its cnSkin machinery (reskinSet, beastName); the level data is untouched (src/main.js gives the skins at spawn).
// bakeMyconidGuard(base) / bakeCapBrute(base) -> { R, L, white, ax, ay, w, h } like every foe set.
import { canvas, flipX, whiten, rgb, outline } from '../px.js';

const OUT = '#1b1626', EYE = '#7fe8c8';   /* the wood's one glow: their eyes burn foxfire under the brim */
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const rampAt = (st, l) => l < 0.5 ? lerpC(st[0], st[1], l * 2) : lerpC(st[1], st[2], (l - 0.5) * 2);
const pack = (frames, base) => ({ R: frames, L: frames.map(c => flipX(c)), white: { R: frames.map(c => whiten(c)), L: frames.map(c => flipX(whiten(c))) }, ax: base.ax, ay: base.ay, w: base.w, h: base.h });
/* the class of a pixel in the goblin's sheet */
const kind = (r, g, b, l) => {
  if (l < 0.13) return 'dark';
  if (g > r + 10 && g > b + 10) return 'skin';                       /* the goblin's green */
  if (r > g + 40 && r > b + 30) return 'red';                         /* the belt, the lit red */
  if (b > g + 8 && b >= r - 10) return l > 0.55 ? 'helm' : 'tunic';  /* the helm's blue-grey and the tunic's purple */
  if (Math.abs(r - g) < 26 && Math.abs(g - b) < 30) return l > 0.82 ? 'rim' : 'helm';   /* the near-white rim stays; grey is helm */
  if (r > g && g > b) return 'wood';                                  /* the shield, the club, the boots */
  return 'other';
};
function recolor(c, map) {
  const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765, k = kind(r, gg, b, l), st = map[k]; if (!st) continue;
    const o = rampAt(st, Math.min(1, l * 1.2)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d;
}
/* where the head is in a frame: the top row of skin and the helm's rows above it */
function headOf(c) {
  const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), p = img.data; let top = -1, helmTop = -1, x0 = 99, x1 = -1, sx = 0, sn = 0;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765, k = kind(r, gg, b, l);
    if (k === 'skin' && top < 0) top = y; if ((k === 'helm' || k === 'rim') && helmTop < 0 && y < (top < 0 ? c.height : top + 8)) helmTop = y; }
  const yy = top < 0 ? 0 : top; for (let y = yy; y < yy + 4; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (!p[i + 3]) continue; const k = kind(p[i], p[i + 1], p[i + 2], (p[i] + p[i + 1] + p[i + 2]) / 765); if (k === 'skin') { x0 = Math.min(x0, x); x1 = Math.max(x1, x); sx += x; sn++; } }
  return { top, helmTop, x0, x1, cx: sn ? Math.round(sx / sn) : (c.width >> 1) };
}
/* a cap drawn as an overlay (own dark outline), then laid over the frame */
function overlay(c, draw) { const [o, g] = canvas(c.width, c.height); draw(g); outline(o, OUT); const [d, k] = canvas(c.width, c.height); k.drawImage(c, 0, 0); k.drawImage(o, 0, 0); return d; }
const px1 = (g, x, y, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, 1, 1); };
const row = (g, x, y, w, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, w | 0, 1); };
/* a dome: top-left lit, w = half width, h rows, drawn with its centre column cx and top row y */
function dome(g, cx, y, w, h, ramp, spots) {
  for (let i = 0; i < h; i++) { const t = (i + 1) / h, ww = Math.max(1, Math.round(w * Math.sqrt(1 - Math.pow(1 - t, 2)))); row(g, cx - ww, y + i, ww * 2 + 1, i === 0 ? ramp[2] : i < h - 1 ? ramp[1] : ramp[0]); row(g, cx - ww, y + i, Math.max(1, Math.round(ww * 0.4)), i === 0 ? ramp[2] : ramp[2]); px1(g, cx + ww, y + i, ramp[0]); }
  for (const [dx, dy] of spots) px1(g, cx + dx, y + dy, '#f4ecd2');
}

/* ------------------------------------------------------------------ THE MYCONID GUARD ------------------------------------------------------------------ */
export function bakeMyconidGuard(base) {
  const cap = ['#1c2812', '#3e5826', '#76923c'], map = {
    skin: ['#6a5a40', '#c8b890', '#f0e6c8'],      /* cream stalk-flesh */
    helm: cap,                                      /* the helm is a cap now */
    tunic: ['#241a12', '#54402a', '#86683e'],      /* bark */
    red: ['#3a1e12', '#7a4222', '#b87c46'],        /* a rusted belt of root */
    wood: ['#5a3e22', '#b6925a', '#e8d4a0'],       /* the shield is a bracket fungus: tan with growth rings (below) */
  };
  const frames = base.R.map(f => { const h = headOf(f); let c = recolor(f, map);
    /* the cap: spots on the dome and a pale gill line under its rim where the helm ended */
    if (h.helmTop >= 0) { const cx = h.cx, y0 = h.helmTop;
      c = overlay(c, g => { dome(g, cx, y0 - 1, 6, 5, cap, [[-3, 1], [1, 0], [3, 2]]); row(g, cx - 6, y0 + 4, 13, '#e8ddc0'); for (let x = cx - 5; x <= cx + 5; x += 2) px1(g, x, y0 + 5, '#9c8c66'); px1(g, cx - 3, y0 + 5, EYE); px1(g, cx + 2, y0 + 5, EYE); }); }
    return c; });
  /* the shield: growth rings over the tan (lighter rings, dark furrows between) */
  frames.forEach(c => { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), p = img.data;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2];
      if (r > 150 && gg > 110 && gg < 215 && b > 60 && b < 175 && r > gg && gg > b && ((x + y * 2) % 4 === 0)) { p[i] = r * 0.78; p[i + 1] = gg * 0.74; p[i + 2] = b * 0.7; } }
    g.putImageData(img, 0, 0); });
  return pack(frames, base);
}

/* ------------------------------------------------------------------ THE CAP BRUTE ------------------------------------------------------------------ */
export function bakeCapBrute(base) {
  const cap = ['#4a1a12', '#963e24', '#d0703e'], map = {
    skin: ['#5a4226', '#a88050', '#dcbe84'],      /* pale ochre stalk */
    tunic: ['#1c2616', '#3c502c', '#6a8448'],      /* a tunic of moss */
    red: ['#4a2a12', '#9a6a28', '#d8a448'],        /* an amber belt */
    wood: ['#5c4c34', '#b8a880', '#ece0bc'],       /* the club is a bone-pale stalk */
    helm: cap,
  };
  const frames = base.R.map(f => { const h = headOf(f); let c = recolor(f, map);
    /* the cap: a great dome over the head, wider than it, a pale rim and gills under it, spotted cream */
    const top = h.top < 0 ? 5 : h.top, cx = h.cx, w = 8;
    c = overlay(c, g => { dome(g, cx, top - 3, w, 6, cap, [[-4, 1], [-1, 0], [3, 1], [5, 3]]); row(g, cx - w, top + 3, w * 2 + 1, '#ece0c0'); for (let x = cx - w + 1; x <= cx + w - 1; x += 2) px1(g, x, top + 4, '#8c7a58'); px1(g, cx - 3, top + 5, EYE); px1(g, cx - 2, top + 5, EYE); px1(g, cx + 2, top + 5, EYE); px1(g, cx + 3, top + 5, EYE); });
    return c; });
  return pack(frames, base);
}

/* ------------------------------------------------------------------ HER BROOD: the puffballs she drops (the sporeling's AI and sheet size) ------------------------------------------------------------------ */
export function bakePuffBrood(base) {
  const fr = Array.from({ length: base.R.length }, (_, f) => { const [c, g] = canvas(base.R[0].width, base.R[0].height), W = c.width, H = c.height, cx = W >> 1, bob = f < 4 && f % 2 ? 1 : 0, swell = f === 4 ? 1 : 0, rad = 4 + swell, cy0 = H - 4 - rad - bob + (swell ? 0 : 1);
    const lo = swell ? '#a06a5a' : '#8a8670', base0 = swell ? '#e8b8a8' : '#d6d0bc', hi = swell ? '#fff0e0' : '#f6f2e2';
    for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) { if (x * x + y * y > rad * rad + 1) continue; const lit = (-x * 0.6 - y * 0.8) / rad; g.fillStyle = lit > 0.4 ? hi : lit > -0.15 ? base0 : lit > -0.6 ? lo : '#5a5444'; g.fillRect(cx + x, cy0 + y, 1, 1); }
    g.fillStyle = '#5a5444'; g.fillRect(cx - 1, cy0 - rad, 3, 1);                                   /* the vent it will burst from */
    g.fillStyle = '#1b1626'; g.fillRect(cx - 3, cy0 - 1, 2, 2); g.fillRect(cx + 2, cy0 - 1, 2, 2); g.fillStyle = EYE; g.fillRect(cx - 3, cy0 - 1, 1, 1); g.fillRect(cx + 2, cy0 - 1, 1, 1);   /* eyes with a foxfire glint */
    g.fillStyle = '#6a5a48'; const s = f < 4 ? (f % 2 ? 1 : -1) : 0; g.fillRect(cx - 3 + s, H - 2, 2, 2); g.fillRect(cx + 1 - s, H - 2, 2, 2);   /* two little feet */
    outline(c, OUT); return c; });
  return pack(fr, base);
}

/* ------------------------------------------------------------------ THE SPORE ARCHER (the goblin archer's AI and frames) ------------------------------------------------------------------ */
export function bakeSporeArcher(base) {
  const cap = ['#1c2812', '#3e5826', '#76923c'], cream = ['#6a5a40', '#c8b890', '#f0e6c8'], rust = ['#3a1e12', '#7a4222', '#b87c46'];
  const frames = base.R.map(f => { const h = headOf(f), [d, g] = canvas(f.width, f.height); g.drawImage(f, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
    for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765, k = kind(r, gg, b, l), yy = (i >> 2) / d.width | 0; let st = null;
      if (k === 'skin') st = l < 0.36 && h.top >= 0 && yy <= h.top + 5 ? cap : cream; else if (k === 'red') st = rust; if (!st) continue; const o = rampAt(st, Math.min(1, l * 1.25)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
    g.putImageData(img, 0, 0); let c = d;
    if (h.top >= 0) { const cx = h.cx, y0 = h.top; c = overlay(c, o => { dome(o, cx, y0 - 2, 5, 4, cap, [[-2, 1], [2, 2]]); row(o, cx - 5, y0 + 2, 11, '#e8ddc0'); }); const k2 = c.getContext('2d'); px1(k2, cx - 2, y0 + 3, EYE); px1(k2, cx + 2, y0 + 3, EYE); }
    return c; });
  return pack(frames, base);
}
