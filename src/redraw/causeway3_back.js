// causeway3_back.js - THE DROWNED CAUSEWAY 2's SKY AND HORIZON (claude/cw3art, 2026-11-07). One storm that BUILDS as you walk (k = how far along the road you are, 0 -> 1):
//   ACT I   a bruised pewter dusk with a warm slit low in the west   -> ACT II a violet dusk, rust at the sea line   -> ACT III night: blue-black, the cloud wall lit only by lightning.
//   SKY     nine stepped 1xVH columns (the same ramp-by-stage) cross-faded by k                                   bakeSky(stage, VH)
//   FAR     640x120 cloud wall with a lit lower lip, in a DUSK and a NIGHT bake, cross-faded; rain curtains slant through it
//   MID     640x44 the far shore: a dark headland, a sea stack with an arch, the CAUSEWAY ITSELF going out to the light on its piers, storm lamps along it - dusk and night bakes
//   THE LIGHT   a lighthouse on the horizon from the first screen: baked at three sizes (one per act), hazed toward the sky, nearer (bigger, higher, sharper) with k; its lamp room is lit
//               from act II, its beam sweeps through the rain (two wedges, brightest when it faces you), a glimmer path lies on the sea under it
//   LIGHTNING (live)  glow (main.js skyGlow, 1.3 -> 0 after a strike) lifts the clouds white-blue and draws a forked bolt from the cloud wall to the sea; the night has a heat flicker too
// drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full, glow) is called from src/main.js's backdrop chain when L.cw3Kit; drawLighthouse(...) from the hands' drawSky (after the sea's far water).
import { canvas, mulberry } from '../px.js';
const R = Math.round;
const memo = {}; const once = (k, fn) => memo[k] || (memo[k] = fn());
const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
const wrap = w => x => ((Math.round(x) % w) + w) % w;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const END = 932 * 16;

/* the one palette */
export const BP = {
  stops: [   /* sky stops per anchor stage: act I dusk, act II violet dusk, act III night. [q, [r,g,b]] */
    [[0, [34, 40, 62]], [0.3, [70, 74, 100]], [0.55, [128, 112, 118]], [0.75, [196, 152, 120]], [0.9, [226, 190, 140]], [1, [200, 170, 140]]],
    [[0, [20, 20, 44]], [0.3, [44, 36, 72]], [0.55, [86, 52, 84]], [0.75, [140, 70, 80]], [0.9, [180, 96, 76]], [1, [150, 80, 70]]],
    [[0, [4, 6, 14]], [0.3, [8, 12, 26]], [0.55, [14, 20, 38]], [0.75, [22, 32, 54]], [0.9, [34, 50, 76]], [1, [30, 44, 66]]]],
  cloudDusk: ['#1c1e2c', '#2a2c40', '#3c3e56', '#58546a', '#7e6a78', '#b08a82'], cloudNight: ['#04060c', '#080c16', '#0e1522', '#162030', '#22344a', '#34506a'],
  rim: ['#e0b078', '#f0c890', '#fff0c8'], rain: ['#6a7490', '#2a3a58'],
  shoreDusk: ['#14161e', '#1e2030', '#2a2c40'], shoreNight: ['#03050a', '#070b14', '#0c121e'],
  tower: ['#2a2e3a', '#444a58', '#6a7080', '#9a9aa0', '#cac4b0'], band: '#7a2a24', lamp: ['#fff6d0', '#ffd36b', '#ff9a30'], beam: '#fff2c0',
};
const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const stopsAt = (stage) => { const k = clamp(stage / 8, 0, 1) * 2, i = Math.min(1, Math.floor(k)), f = k - i; const A = BP.stops[i], B = BP.stops[i + 1]; return A.map(([q, c], n) => [q, mix(c, B[n][1], f)]); };
const rgb = c => 'rgb(' + R(c[0]) + ',' + R(c[1]) + ',' + R(c[2]) + ')';

export function bakeSky(stage, h) {
  return once('sky' + stage + '_' + h, () => {
    const [c, g] = canvas(1, h), st = stopsAt(stage);
    for (let y = 0; y < h; y++) { const q = Math.round((y / Math.max(1, h - 1)) * 15) / 15; let i = 0; while (i < st.length - 2 && q > st[i + 1][0]) i++;
      const [t0, a] = st[i], [t1, b] = st[i + 1]; px(g, 0, y, rgb(mix(a, b, clamp((q - t0) / (t1 - t0), 0, 1)))); }
    return c; });
}

/* a cloud wall: stacked lumpy banks, each with a lit lower lip (the dusk's last light, the night's cold glint), rain curtains slanting down out of it */
function bakeFar(night) {
  return once('far' + night, () => {
    const W = 640, H = 120, [c, g] = canvas(W, H), w = wrap(W), pal = night ? BP.cloudNight : BP.cloudDusk, r = mulberry(night ? 41 : 17);
    for (let bank = 0; bank < 4; bank++) {
      const base = 22 + bank * 20, n = 9 + bank * 2;
      for (let i = 0; i < n; i++) {
        const cx0 = r() * W, rw = 38 + r() * 54, rh = 10 + r() * 14 + bank * 3, y0 = base + (r() - 0.5) * 8;
        for (let x = -rw; x <= rw; x++) { const u = x / rw, top = y0 - rh * Math.sqrt(Math.max(0, 1 - u * u)) * (0.7 + 0.3 * Math.sin(x * 0.4 + i)), bot = y0 + rh * 0.35 * Math.sqrt(Math.max(0, 1 - u * u));
          for (let y = Math.floor(top); y <= bot; y++) { const d = (y - top) / Math.max(1, bot - top), lit = y >= bot - 1.5;
            px(g, w(cx0 + x), y, lit ? pal[night ? 4 : 5] : pal[Math.max(0, Math.min(4, Math.floor(d * 2.4) + (bank > 1 ? 1 : 0) + ((x + y) % 7 === 0 ? 1 : 0)))]); } }
      }
    }
    if (!night) for (let k = 0; k < 14; k++) { const x = r() * W, y = 88 + r() * 6, l = 16 + r() * 30; for (let i = 0; i < l; i++) px(g, w(x + i), y + ((i / 8) | 0) * 0, BP.rim[(i + k) % 3]); }   /* the sun's last glint along a lip */
    for (let k = 0; k < 18; k++) { const x0 = r() * W, y0 = 58 + r() * 14, len = 30 + r() * 40; g.globalAlpha = night ? 0.28 : 0.2; for (let i = 0; i < len; i++) px(g, w(x0 - i * 0.25), y0 + i, BP.rain[(i >> 2) & 1]); g.globalAlpha = 1; }   /* a curtain of rain */
    return c; });
}
/* the far shore: a headland, a sea stack with an arch, and the road itself on its piers running out to the light, a storm lamp on every fourth pier */
function bakeMid(night) {
  return once('mid' + night, () => {
    const W = 640, H = 44, [c, g] = canvas(W, H), w = wrap(W), pal = night ? BP.shoreNight : BP.shoreDusk, r = mulberry(night ? 23 : 9), base = 36;
    for (let x = 0; x < W; x++) { const hill = 8 + 5 * Math.sin(x * 0.011) + 3 * Math.sin(x * 0.037 + 1) + (x > 380 && x < 520 ? 7 * Math.sin((x - 380) * Math.PI / 140) : 0); for (let y = R(base - hill); y <= base; y++) px(g, x, y, y === R(base - hill) ? pal[2] : pal[(x + y) % 5 === 0 ? 1 : 0]); }
    { const sx = 210; for (let x = 0; x < 34; x++) { const hh = 22 - Math.abs(x - 17) * 0.9 + (x % 5 === 0 ? 1 : 0); for (let y = base - R(hh); y <= base; y++) { if (x > 11 && x < 22 && y > base - 12) continue; px(g, w(sx + x), y, y === base - R(hh) ? pal[2] : pal[1]); } } }   /* a sea stack with an arch */
    for (let x = 0; x < W; x += 1) { px(g, x, base - 2, night ? '#0a1018' : '#262838'); }   /* the road */
    for (let x = 6; x < W; x += 14) { rect(g, x, base - 2, 2, 7, pal[1]); if (x % 56 === 6) { rect(g, x, base - 6, 1, 4, pal[2]); px(g, x, base - 7, night ? '#ffd36b' : '#c8a060'); if (night) { px(g, x - 1, base - 7, '#8a6a30'); px(g, x + 1, base - 7, '#8a6a30'); } } }   /* piers; a lamp post each fourth */
    return c; });
}

const wedge = (g, ox, oy, ang, len, spread, a, col) => { g.globalAlpha = a; g.fillStyle = col; const n = 14; for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, d = len * u, w = Math.max(1, spread * d * 2 * 0.5), x = ox + Math.cos(ang) * d, y = oy + Math.sin(ang) * d * 0.28; g.fillRect(R(x - w / 2), R(y - w * 0.18), R(Math.max(2, w)), Math.max(1, R(w * 0.4))); } g.globalAlpha = 1; };

/* THE LIGHT: baked at three heights (one per act); haze is the alpha it is drawn at. Returns a canvas with the tower, gallery and lamp room, and the black holm under it */
function bakeLight(step) {
  return once('lh' + step, () => {
    const h = [40, 64, 92][step], w = [6, 9, 13][step], gal = [3, 4, 5][step], [c, g] = canvas(w * 3 + 24, h + gal * 4 + 14), ox = (w * 3 + 24) >> 1, T = BP.tower, base = h + gal * 4 + 10;
    for (let i = 0; i < h; i++) { const u = i / h, half = R(w * (1 - 0.38 * u) / 2) + 1, y = base - i; for (let x = -half; x <= half; x++) { const side = x < -half * 0.2 ? 3 : x > half * 0.4 ? 1 : 2; { const bandRow = ((i / (h / 4)) | 0) === 1; px(g, ox + x, y, bandRow ? (side === 1 ? '#4a1814' : BP.band) : T[Math.min(4, side + (i % 9 === 0 ? -1 : 0))]); } } }
    const top = base - h, gw = R(w * 0.62) + 4;   /* gallery, lamp room, cap */
    rect(g, ox - gw, top - 1, gw * 2 + 1, 2, T[1]); rect(g, ox - gw, top - 3, 1, 2, T[1]); rect(g, ox + gw, top - 3, 1, 2, T[1]); rect(g, ox - gw, top - 3, gw * 2 + 1, 1, T[2]);
    const lw = R(w * 0.34) + 1; rect(g, ox - lw, top - gal * 2 - 3, lw * 2 + 1, gal * 2, '#ffd36b'); rect(g, ox - lw, top - gal * 2 - 3, lw * 2 + 1, 1, '#fff6d0'); rect(g, ox, top - gal * 2 - 3, 1, gal * 2, '#7a5a28');
    rect(g, ox - lw - 1, top - gal * 2 - 5, lw * 2 + 3, 2, '#2a2e3a'); rect(g, ox - 1, top - gal * 2 - 7, 3, 2, '#2a2e3a'); px(g, ox, top - gal * 2 - 8, '#2a2e3a');
    if (step > 0) { rect(g, ox - 1, base - R(h * 0.45), 2, Math.max(2, R(h * 0.08)), '#ffd36b'); }                       /* a lit window */
    for (let x = -w * 2; x <= w * 2; x++) { const k = Math.abs(x) / (w * 2), hh = R((1 - k * k) * (4 + step * 2)); for (let y = 0; y < hh; y++) px(g, ox + x, base + 1 + y - hh + 3, '#06080c'); }   /* the holm */
    c._ox = ox; c._lampY = top - gal * 2 - 3 + gal; c._base = base; c._h = h;
    return c; });
}
/* THE LIGHT on the horizon: bigger, higher, clearer the further you have come; the beam sweeps; a glimmer path under it. step = act (0,1,2), k = progress. */
export function drawLighthouse(g, cx, cy, VW, VH, time, glow) {
  const k = clamp((cx + VW / 2) / (END - 160), 0, 1);
  if (cx > END - 30 * 16) return;   /* past here the real one stands on the holm (its tiles, and main.js's fog-lamp) */
  const step = k < 0.33 ? 0 : k < 0.66 ? 1 : 2, spr = bakeLight(step);
  const px0 = R(VW * 0.82 - k * VW * 0.3 - (cx % 400) * 0.01), horizon = R(VH * 0.62 - k * 12), x = px0 - spr._ox, y = horizon - spr._base;
  const hz = 0.42 + 0.5 * k + (glow || 0) * 0.3;
  /* the glimmer path on the sea under it */
  g.fillStyle = '#ffd36b'; for (let i = 0; i < 9; i++) { const yy = horizon + 3 + i * 3, w = 2 + i + (((time * 3 + i * 1.7) | 0) % 3), a = 0.30 - i * 0.025; if (a <= 0) break; g.globalAlpha = a * (0.4 + 0.6 * k); g.fillRect(px0 - (w >> 1) + R(Math.sin(time * 1.6 + i) * 2), yy, w, 1); }
  g.globalAlpha = 1;
  /* the beam: two wedges, one way and the other, brightest as it faces you; the lamp swells when it does */
  const ph = time * 0.9, face = Math.max(0, Math.cos(ph)), lampY = y + spr._lampY;
  wedge(g, px0, lampY, Math.PI + 0.1, 180 + 110 * k, 0.07, (0.06 + 0.16 * face) * (0.4 + k), BP.beam);
  wedge(g, px0, lampY, 0.1 * -1, 150 + 90 * k, 0.07, 0.05 + 0.10 * (1 - face), BP.beam);
  g.globalAlpha = Math.min(1, hz); g.drawImage(spr, x, y); g.globalAlpha = 1;
  /* the lamp's halo, and it winks as the beam turns */
  const hr = 3 + step * 2 + face * 3; g.globalAlpha = 0.18 + 0.3 * face; g.fillStyle = '#ffd36b'; g.fillRect(px0 - hr, lampY - 1, hr * 2 + 1, 3); g.fillRect(px0 - 1, lampY - hr, 3, hr * 2 + 1); g.globalAlpha = 1;
}

/* the backdrop proper: sky by stage, the cloud wall, the far shore with the causeway going out to the light, and the storm's flashes */
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full, glow) {
  void L; void cy;
  const k = clamp((cx + VW / 2) / (END - 160), 0, 1), stage = k * 8, s0 = Math.floor(stage), s1 = Math.min(8, s0 + 1), f = stage - s0;
  g.drawImage(bakeSky(s0, VH), 0, 0, 1, VH, 0, 0, VW, VH);
  if (f > 0.02 && s1 !== s0) { g.globalAlpha = f; g.drawImage(bakeSky(s1, VH), 0, 0, 1, VH, 0, 0, VW, VH); g.globalAlpha = 1; }
  const horizon = R(VH * 0.62 - k * 12) + (dY || 0), night = clamp((k - 0.4) / 0.4, 0, 1), flick = Math.max(glow || 0, (k > 0.55 && ((time * 0.37) % 9.1) < 0.14) ? 0.35 : 0);
  /* clouds: the wall's lower lip sits a little above the horizon, drifting slow (and faster at night) */
  const far = bakeFar(false), farN = bakeFar(true), drift = time * (2 + 3 * k), cxo = ((cx * 0.12 + drift) % 640 + 640) % 640, y0 = horizon - 96;
  const blit = (img, a) => { if (a <= 0.01) return; g.globalAlpha = a; for (let x = -cxo; x < VW; x += 640) g.drawImage(img, R(x), y0); g.globalAlpha = 1; };
  blit(far, 1 - night); blit(farN, night);
  if (flick > 0.02) { g.globalAlpha = Math.min(0.42, flick * 0.34); g.fillStyle = '#c8d8ff'; g.fillRect(0, Math.max(0, y0), VW, 100); g.globalAlpha = 1; }   /* the clouds lit from inside */
  /* a forked bolt, cloud wall to the sea, while the glow is high */
  if ((glow || 0) > 0.85) { const seed = Math.floor(time * 2.5) * 977 + 31, r = mulberry(seed); let x = 40 + r() * (VW - 80), y = y0 + 20; g.fillStyle = '#eef4ff'; while (y < horizon) { const nx = x + (r() - 0.5) * 9; g.fillRect(R(Math.min(x, nx)), y, Math.max(1, Math.abs(R(nx - x)) + 1), 3); if (r() < 0.18) { let bx = nx, by = y; for (let i = 0; i < 6; i++) { bx += (r() - 0.3) * 6; by += 3; g.fillRect(R(bx), by, 1, 3); } } x = nx; y += 3; } g.globalAlpha = 0.5; g.fillStyle = '#9ab8ff'; g.fillRect(R(x) - 1, horizon - 2, 3, 3); g.globalAlpha = 1; }
  if (full === false) return;
  /* the far shore and the causeway out to the light: 0.3 parallax, dusk and night bakes cross-faded, the road lit a little by a flash */
  const mid = bakeMid(false), midN = bakeMid(true), mo = ((cx * 0.3) % 640 + 640) % 640, my = horizon - 36;
  const mblit = (img, a) => { if (a <= 0.01) return; g.globalAlpha = a; for (let x = -mo; x < VW; x += 640) g.drawImage(img, R(x), my); g.globalAlpha = 1; };
  mblit(mid, 1 - night); mblit(midN, night);
  if (flick > 0.05) { g.globalAlpha = Math.min(0.3, flick * 0.25); g.fillStyle = '#9ab8e8'; g.fillRect(0, my + 10, VW, 28); g.globalAlpha = 1; }
}
