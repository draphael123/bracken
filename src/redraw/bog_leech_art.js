// bog_leech_art.js - THE BOG LEECH, drawn (claude/fenroad2art). ART ONLY: src/bog-leech.js's LEECH_POSE is the contract (0 lurk, 1 rear, 2 lunge, 3 latched, 4 flop, 5 hurt).
// A fat black-olive leech as long as your arm: a glossy segmented body (rings, a lit back, a pale belly, a dashed ochre dorsal stripe), a small tail sucker, and a head that is all
// ROUND SUCKER MOUTH - a pink-red rim, a dark throat, a ring of white teeth, two eye-dots above it. Each frame is a tube along a spine path, baked once and outlined.
//   0 LURK   the humped back at the waterline, eye-dots         1 REAR   up out of the water in an S, mouth ringed and open      2 LUNGE   stretched long through the air
//   3 LATCHED  curled on you, the body swollen red with you    4 FLOP   writhing on the boards in an S                           5 hurt   clenched, flashed
import { outline } from '../px.js';

const COL = { body: '#34402a', bodyL: '#566a3a', bodyLL: '#7f9650', bodyD: '#1e281a', belly: '#9a9468', bellyD: '#6e6a48', stripe: '#c29a38', ring: '#1a2214', rim: '#c4635a', rimL: '#e28c80', rimD: '#8a3a38', throat: '#2a0c10', tooth: '#f0e8d0', eye: '#f2e8a0', fat: '#7a3a34', fatL: '#a8584c', wet: '#d8e6d4' };
const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
function disc(g, x, y, r, c) { const R = Math.max(0.5, r); for (let dy = -Math.ceil(R); dy <= Math.ceil(R); dy++) { const w = Math.sqrt(Math.max(0, R * R - dy * dy)); if (w < 0.3 && Math.abs(dy) > 0) continue; g.fillStyle = c; g.fillRect(Math.round(x - w), Math.round(y + dy), Math.max(1, Math.round(w * 2)), 1); } }
/* sample a polyline of [x, y] controls into n evenly spaced points with a radius profile rf(t) */
function sample(path, n) { const seg = []; let tot = 0; for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seg.push(d); tot += d; }
  const out = []; for (let k = 0; k <= n; k++) { let d = tot * k / n, i = 0; while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; } const u = seg[i] ? Math.min(1, d / seg[i]) : 0; out.push([path[i][0] + (path[i + 1][0] - path[i][0]) * u, path[i][1] + (path[i + 1][1] - path[i][1]) * u]); } return out; }
/* the tube: o.fat = the colours of a body swollen with blood (belly), o.mouth = draw the sucker at the head end facing dir */
function tube(g, path, rmax, o = {}) {
  const n = o.n || 34, pts = sample(path, n), prof = t => { const s = Math.sin(Math.PI * (0.06 + 0.88 * t)); return rmax * (0.3 + 0.7 * Math.pow(s, 0.7)) * (t > 0.92 ? 1.12 : 1); };
  const body = o.fat ? COL.fat : COL.body, lit = o.fat ? COL.fatL : COL.bodyL, belly = o.fat ? COL.fatL : COL.belly;
  pts.forEach((p, i) => disc(g, p[0], p[1], prof(i / n), body));                                                                             /* the body */
  pts.forEach((p, i) => { const r = prof(i / n), pr = pts[Math.max(0, i - 1)], nx = pts[Math.min(n, i + 1)], dx = nx[0] - pr[0], dy = nx[1] - pr[1], L = Math.hypot(dx, dy) || 1, nxn = -dy / L, nyn = dx / L;   /* the normal: up-left side is the lit back */
    const ux = nyn > 0 ? -nxn : nxn, uy = nyn > 0 ? -nyn : nyn;                                                                              /* (a normal that points up) */
    if (r > 2) { px(g, p[0] + ux * r * 0.55, p[1] + uy * r * 0.55, lit); if (r > 3.2) px(g, p[0] + ux * r * 0.78, p[1] + uy * r * 0.78, o.fat ? COL.fatL : COL.bodyLL); px(g, p[0] - ux * r * 0.6, p[1] - uy * r * 0.6, belly); if (r > 3.4) px(g, p[0] - ux * r * 0.85, p[1] - uy * r * 0.85, o.fat ? COL.fat : COL.bellyD); }
    if (i % 4 === 2 && r > 2) { px(g, p[0] + ux * r * 0.2, p[1] + uy * r * 0.2, o.fat ? COL.rimD : COL.ring); px(g, p[0] - ux * r * 0.3, p[1] - uy * r * 0.3, o.fat ? COL.rimD : COL.ring); px(g, p[0] + ux * r * 0.6, p[1] + uy * r * 0.6, o.fat ? COL.rimD : COL.ring); }   /* the rings */
    if (!o.fat && i % 3 === 0 && r > 2.6 && i / n > 0.12 && i / n < 0.86) px(g, p[0] + ux * r * 0.35, p[1] + uy * r * 0.35, COL.stripe);   /* the dashed ochre stripe */ });
  const h = pts[n], h0 = pts[n - 2], dx = h[0] - h0[0], dy = h[1] - h0[1], L = Math.hypot(dx, dy) || 1, fx = dx / L, fy = dy / L, hr = prof(1);
  /* the tail sucker: a small flat disc at the far end */
  { const t = pts[0], t1 = pts[2], tx = t[0] - t1[0], ty = t[1] - t1[1], tl = Math.hypot(tx, ty) || 1; disc(g, t[0] + tx / tl, t[1] + ty / tl, prof(0) * 0.9, COL.bodyD); px(g, t[0] + tx / tl, t[1] + ty / tl, COL.belly); }
  if (o.mouth) {   /* the head: a round sucker rim facing (fx, fy), dark throat, teeth, the eye-dots above */
    const mx = h[0] + fx * 1.2, my = h[1] + fy * 1.2, rr = hr * 1.2; disc(g, mx, my, rr, COL.rim);
    for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4; px(g, mx + Math.cos(an) * rr * 0.9, my + Math.sin(an) * rr * 0.9, a % 2 ? COL.rimL : COL.rimD); }
    disc(g, mx + fx * 0.4, my + fy * 0.4, rr * 0.55, COL.throat);
    for (let a = 0; a < 6; a++) { const an = a * Math.PI / 3 + 0.3; px(g, mx + fx * 0.4 + Math.cos(an) * rr * 0.5, my + fy * 0.4 + Math.sin(an) * rr * 0.5, COL.tooth); }
    const ex = -fy, ey = fx;   /* eyes either side, behind the rim, on the lit side */
    px(g, h[0] - fx * 2.4 + (ey < 0 ? ex : -ex) * 0 - 0, h[1] - fy * 2.4 - hr * 0.7, COL.eye); px(g, h[0] - fx * 4.2, h[1] - fy * 4.2 - hr * 0.8, COL.eye);
  } else { px(g, h[0], h[1] - hr * 0.5, COL.eye); px(g, h[0] - 2, h[1] - hr * 0.5, COL.eye); }
}

export function bakeLeechSheet(canvasFn, flipX, whiten, LEECH) {
  const CW = 40, CH = 32, ax = 20, ay = 30, frames = [];
  const mk = fn => { const [c, g] = canvasFn(CW, CH); g.imageSmoothingEnabled = false; fn(g); const img = g.getImageData(0, 0, CW, CH), d = img.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; g.putImageData(img, 0, 0); frames.push(outline(c, '#0e140a')); };
  /* 0 LURK: the humped back just clear of the water, a pair of eye-dots at the head end */
  mk(g => { tube(g, [[ax - 11, ay], [ax - 5, ay - 4], [ax + 3, ay - 5], [ax + 11, ay]], 4, { n: 22 }); });
  /* 1 REAR: out of the water in an S, the head high and the ringed mouth open, facing right */
  mk(g => { tube(g, [[ax - 6, ay], [ax - 7, ay - 6], [ax - 3, ay - 12], [ax + 1, ay - 17], [ax + 6, ay - 21]], 4.4, { n: 36, mouth: true }); });
  /* 2 LUNGE: stretched long and thin through the air, the mouth wide, the tail trailing */
  mk(g => { tube(g, [[ax - 17, ay - 9], [ax - 8, ay - 11], [ax + 2, ay - 13], [ax + 13, ay - 15]], 3.4, { n: 40, mouth: true }); });
  /* 3 LATCHED: a thick crescent curled over a shoulder, the mouth fast, the body swollen and red with it */
  mk(g => { tube(g, [[ax - 11, ay - 6], [ax - 10, ay - 14], [ax - 4, ay - 19], [ax + 3, ay - 17], [ax + 6, ay - 11]], 4.8, { n: 36, mouth: true, fat: true }); });
  /* 4 FLOP: an S on the boards, writhing; a few wet drops flying off it */
  mk(g => { tube(g, [[ax - 14, ay - 2], [ax - 8, ay - 8], [ax - 1, ay - 3], [ax + 5, ay - 9], [ax + 12, ay - 6]], 3.8, { n: 38, mouth: true }); px(g, ax - 3, ay - 15, COL.wet); px(g, ax + 4, ay - 17, COL.wet); px(g, ax + 9, ay - 14, COL.wet); });
  /* 5 hurt: clenched into a tight hump, the mouth shut, a flash of white */
  mk(g => { tube(g, [[ax - 8, ay - 1], [ax - 6, ay - 8], [ax + 1, ay - 11], [ax + 7, ay - 6], [ax + 8, ay - 1]], 4.6, { n: 30 }); g.fillStyle = '#fff'; g.fillRect(ax - 1, ay - 14, 3, 1); g.fillRect(ax + 4, ay - 12, 2, 1); });
  const L = frames.map(flipX), white = frames.map(c => whiten(c));
  return { R: frames, L, white: { R: white, L: white.map(flipX) }, ax, ay, w: LEECH.w, h: LEECH.h };
}
