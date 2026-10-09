// fair_creep.js - THE HARVEST FAIR, CREEPIER (claude/faircreepy; Daniel 2026-10-08: "the level is really good - make it more creepy atmospherically"). ART ONLY: nothing here touches the
// level's grid, foes, timings or rules (the level hash is unchanged), nothing is read by a foe, and nothing stands in the play layer: every figure is dressing on the far side of the road.
//   THE DAY DIES AS YOU GO   the sky goes from the harvest dusk to a moonlit night over the stretch (drawSky: a night wash, stars, the moon), the light drains from the edges of the
//                            screen (drawVeil), a LOW FOG rolls through the fair and the corn, thicker the deeper you are (drawFog), and the fairway's lanterns gutter and some go out
//                            behind you (lampCreep: render-only - a lamp's `lit` is the foes' and the night's, only its drawing dims)
//   WATCHING SCARECROWS      field scarecrows in the mid layer TURN THEIR HEADS to follow you (never while anything is in reach of you: the head holds), harvest offerings at their feet
//   GHOST RIDES              a carousel that creaks round with nobody on it and a swing boat that rocks empty, in the mid layer, their bulbs failing (and fair_backdrop's flick() makes
//                            the tent doors and the lantern strings stutter)
//   VANISHING TOWNSFOLK      silhouettes at the stalls in the fog that are GONE as you come close (alpha is the distance to you: no state)
//   THE SKYLINE              the moon, and the Wicker Queen's tall figure on the far hill, ember-eyed, larger as the green comes near
// Pure drawing + a little render state (the scarecrows' head angles). Called from src/main.js: drawSky/drawMid (after the sky, either side of FB.drawBackdrop), drawFog (over the near layer),
// drawVeil (before the HUD plate), lampCreep (the update), depth() (the one number the music and the ambient bed follow too).
import { canvas, px, rect, fillPoly, line, circle, outline, mulberry } from '../px.js';
import { OUT } from '../art.js';
import { midFrame, midColX, flick } from './fair_backdrop.js';
const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const hash = n => { const h = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return h - Math.floor(h); };

/* HOW DEEP: 0 at the gate .. 1 at the green (the hero's column of 620). The one number the sky, the fog, the scarecrows, the music's detune and the ambient bed all follow. */
export const depth = (L, cx, VW) => clamp01(((cx + VW / 2) / TS) / 620);

/* a baked sprite tinted for the hour: the mid layer's own tint (warm at the gate, deep blue at the end), in 6 steps, so a figure sits in the fog and not in front of it */
function tinted(key, bake, d) {
  const st = Math.round(clamp01(d) * 6);
  return once(key + '|' + st, () => { const src = once(key + '|0src', bake), c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const x = c.getContext('2d'), t = smooth(0, 1, st / 6); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-atop';
    x.fillStyle = 'rgba(' + Math.round(lerp(210, 22, t)) + ',' + Math.round(lerp(110, 26, t)) + ',' + Math.round(lerp(96, 64, t)) + ',' + lerp(0.34, 0.72, t).toFixed(3) + ')'; x.fillRect(0, 0, c.width, c.height); return c; });
}
/* the same tint for a colour drawn live (the ride's moving parts) */
const night = (rgb, d) => { const t = smooth(0, 1, d), a = lerp(0.34, 0.72, t), r = lerp(210, 22, t), g = lerp(110, 26, t), b = lerp(96, 64, t); return 'rgb(' + Math.round(lerp(rgb[0], r, a)) + ',' + Math.round(lerp(rgb[1], g, a)) + ',' + Math.round(lerp(rgb[2], b, a)) + ')'; };
const glowSpr = () => once('cglow', () => { const [c, g] = canvas(48, 48), gr = g.createRadialGradient(24, 24, 1, 24, 24, 24); gr.addColorStop(0, 'rgba(255,214,130,1)'); gr.addColorStop(0.4, 'rgba(255,160,70,0.4)'); gr.addColorStop(1, 'rgba(255,110,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 48, 48); return c; });
function glow(g, x, y, r, a) { if (a < 0.03) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, a); g.drawImage(glowSpr(), Math.round(x - r), Math.round(y - r), r * 2, r * 2); g.restore(); }
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

// ====================================================== THE SKY: night wash, stars, the moon, the Wicker Queen ======================================================
let STARS = null;
const moonPos = (VW, cx, d, dY) => ({ x: Math.round(VW * 0.4 - cx * 0.004), y: Math.round(lerp(70, 38, smooth(0.05, 0.8, d)) + dY * 0.1), r: lerp(8, 13, smooth(0, 1, d)) });
/* the Wicker Queen's stance this frame: where she stands (hx, base), her height h, u = h / 100, how near the green is (prox) and how visible she is (a0). null when she is not on the skyline */
function queenAt(L, cx, VW, VH, d, dY) {
  const G = L.green; if (!G) return null; const ref = G.door * TS - VW / 2, far = Math.abs(cx - ref), prox = clamp01(1 - far / Math.max(1, ref)), a0 = smooth(0.2, 0.5, prox) * smooth(0.05, 0.4, d); if (a0 <= 0.02) return null;
  const h = 20 + 48 * Math.pow(prox, 1.5), hx = Math.round(VW / 2 - (cx - ref) * 0.02 + 30); if (hx < -60 || hx > VW + 60) return null;
  return { hx, base: Math.round(VH - 62 + dY * 0.15) - 14, h, u: h / 100, prox, a0 }; }
/* THE MOONLIGHT THROUGH THE NIGHT: the height night (fair_rides.js drawNight) is a dark wash over the upper sky, which would hide the moon and the Queen; main.js hands these world-space points
   to its hole-punching list (a soft light cut out of the dark), so the sky's two lights shine through it. Drawing only. */
export function skyHoles(L, cx, cy, VW, VH, d, dY) {
  const out = [], m = moonPos(VW, cx, d, dY); if (smooth(0.08, 0.6, d) > 0.2) out.push({ x: m.x + cx, y: m.y + cy + 12 });
  const q = queenAt(L, cx, VW, VH, d, dY); if (q && q.a0 > 0.2) { out.push({ x: q.hx + cx, y: q.base - 86 * q.u + cy + 12 }); out.push({ x: q.hx + cx, y: q.base - 50 * q.u + cy + 12 }); }
  return out; }
/* drawn after the sky and its clouds, before the far hills: the dusk sky is darkened by the stretch (a wash heavier at the top), pin stars come out, the moon climbs, and far off on a
   hill (very low parallax, like the big wheel's landmark) a tall woven figure stands against it, closer and bigger as the green does */
export function drawSky(g, cx, cy, VW, VH, L, time, d, dY) {
  const t = smooth(0.12, 1, d);
  if (t > 0.01) { const gr = g.createLinearGradient(0, 0, 0, VH * 0.85); gr.addColorStop(0, 'rgba(6,8,30,' + (0.9 * t).toFixed(3) + ')'); gr.addColorStop(0.6, 'rgba(18,16,46,' + (0.62 * t).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(40,24,50,' + (0.32 * t).toFixed(3) + ')'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
  const sa = smooth(0.35, 0.9, d);
  if (sa > 0.02) { if (!STARS) { const r = mulberry(7311); STARS = Array.from({ length: 70 }, () => ({ u: r(), v: r() * 0.55, p: r() * 6.28, s: r() < 0.15 ? 2 : 1 })); }
    for (const s of STARS) { const a = sa * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * (0.8 + s.p * 0.2) + s.p * 9))) * (1 - s.v * 0.9); if (a < 0.08) continue; g.fillStyle = 'rgba(232,232,255,' + a.toFixed(2) + ')'; g.fillRect(Math.round(s.u * VW - cx * 0.004 * (s.s + 1)), Math.round(s.v * VH + dY * 0.05), s.s, s.s); } }
  const ma = smooth(0.08, 0.6, d);
  if (ma > 0.02) {   // the moon: a low orange harvest moon at first, climbing and going bone-white, a little too big
    const { x: mx, y: my, r } = moonPos(VW, cx, d, dY), warm = 1 - smooth(0.05, 0.75, d);
    glow(g, mx, my, r * 3.2, ma * (0.42 - 0.12 * warm));
    g.save(); g.globalAlpha = ma; g.fillStyle = 'rgb(' + Math.round(lerp(226, 238, 1 - warm)) + ',' + Math.round(lerp(220, 150 + 70 * (1 - warm), 1)) + ',' + Math.round(lerp(196, 120 + 80 * (1 - warm), 1)) + ')';
    g.beginPath(); g.arc(mx, my, r, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(120,112,120,0.34)'; for (const [dx, dy, rr] of [[-0.35, -0.2, 0.26], [0.3, 0.15, 0.2], [-0.05, 0.45, 0.16], [0.42, -0.4, 0.12]]) { g.beginPath(); g.arc(mx + dx * r, my + dy * r, rr * r, 0, 6.3); g.fill(); }
    g.restore(); }
  drawQueen(g, cx, VW, VH, L, time, d, dY);
}
/* THE WICKER QUEEN on the skyline: a tall figure of woven willow on the far hill - skirt, raised arms, a crown of twigs - dark against the moon, with two ember eyes that burn
   brighter the nearer you are. Anchored on the boss green; she is never closer than the far hills, and she does not move (she sways, a little). */
function drawQueen(g, cx, VW, VH, L, time, d, dY) {
  const q = queenAt(L, cx, VW, VH, d, dY); if (!q) return; const { hx, base, u, prox, a0 } = q, sway = Math.sin(time * 0.5) * 0.8;
  const col = 'rgb(' + Math.round(lerp(58, 14, d)) + ',' + Math.round(lerp(34, 14, d)) + ',' + Math.round(lerp(26, 36, d)) + ')', hi = 'rgb(' + Math.round(lerp(96, 34, d)) + ',' + Math.round(lerp(60, 30, d)) + ',' + Math.round(lerp(40, 54, d)) + ')';
  g.save(); g.globalAlpha = a0; g.translate(hx, base); g.fillStyle = col; g.strokeStyle = col;
  g.beginPath(); g.moveTo(-17 * u, 0); g.lineTo(-7 * u + sway * u, -62 * u); g.lineTo(7 * u + sway * u, -62 * u); g.lineTo(17 * u, 0); g.closePath(); g.fill();                 // the skirt, narrowing to the waist
  g.beginPath(); g.moveTo(-8 * u + sway * u, -62 * u); g.lineTo(-11 * u + sway * u, -78 * u); g.lineTo(11 * u + sway * u, -78 * u); g.lineTo(8 * u + sway * u, -62 * u); g.closePath(); g.fill();   // the bodice
  g.lineWidth = Math.max(1, 3 * u); g.beginPath(); g.moveTo(-10 * u + sway * u, -75 * u); g.quadraticCurveTo(-26 * u, -78 * u, -30 * u, -98 * u); g.moveTo(10 * u + sway * u, -75 * u); g.quadraticCurveTo(26 * u, -78 * u, 30 * u, -98 * u); g.stroke();   // arms, raised like branches
  g.lineWidth = Math.max(1, 1.4 * u); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(s * (28 + i) * u, (-90 - i * 3) * u); g.lineTo(s * (34 + i * 2) * u, (-106 - i * 4) * u); g.stroke(); }   // twig fingers
  g.beginPath(); g.arc(sway * u, -86 * u, 7 * u, 0, 6.3); g.fill();                                                                                                        // the head
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo((i * 2.4 + sway) * u, -91 * u); g.lineTo((i * 4.4 + sway) * u, (-104 - (3 - Math.abs(i)) * 2.5) * u); g.stroke(); }  // the crown of twigs
  g.strokeStyle = hi; g.lineWidth = 1; g.globalAlpha = a0 * 0.6; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 5 * u, -4 * u); g.lineTo(i * 2.4 * u + sway * u, -60 * u); g.stroke(); }   // the weave, a few strands catching the moon
  g.restore();
  if (prox > 0.3) { const e = smooth(0.3, 0.9, prox) * (0.7 + 0.3 * Math.sin(time * 3.1)), ey = base - 86 * u; for (const dx of [-2.6, 2.6]) { glow(g, hx + (dx + sway) * u, ey, 5 + 5 * u, e * a0 * 0.9); rc(g, hx + (dx + sway) * u - 1, ey - 1, 2, 2, 'rgba(255,170,70,' + (e * a0).toFixed(2) + ')'); } }
}

// ====================================================== THE MID LAYER: scarecrows, ghost rides, vanishing townsfolk ======================================================
/* where the dressing stands, once per level width: in the mid layer's own coordinates (px along the strip), in the gaps between the tents and stalls the backdrop already put there */
function decor(L, Ly) {
  return once('decor' + L.W, () => {
    const all = Ly.items.map(it => [it.x - it.w / 2, it.x + it.w / 2]), tops = Ly.items.filter(it => it.k === 'top').map(it => [it.x - it.w / 2, it.x + it.w / 2]), taken = [], r = mulberry(8123), wMid = Ly.wMid;   // the strip is crowded (a gap is ~30 px): a scarecrow takes a gap, a ride stands in front of the stalls but never a big top
    const free = (x, half, blockers) => x - half > 20 && x + half < wMid - 40 && !blockers.some(([a, b]) => x + half > a && x - half < b) && !taken.some(([a, b]) => x + half > a && x - half < b);
    const place = (col, half, spread, blockers) => { const x0 = midColX(col); for (let dx = 0; dx <= spread; dx += 4) for (const s of [1, -1]) { const x = x0 + s * dx; if (free(x, half, blockers)) { taken.push([x - half - 2, x + half + 2]); return x; } } return null; };
    const scare = [], rides = [], folk = [];
    for (let col = 44; col < 600; col += 58 + Math.floor(r() * 18)) { const x = place(col, 10, 120, all); if (x !== null) scare.push({ x, col, a: 0, seed: r(), offer: (r() * 3) | 0, flip: r() < 0.5 }); }
    for (const [kind, col] of [['carousel', 168], ['swing', 236], ['carousel', 372], ['swing', 452], ['carousel', 548]]) { const x = place(col, kind === 'carousel' ? 18 : 16, 160, tops); if (x !== null) rides.push({ kind, x, col, seed: r() * 100 }); }
    for (const it of Ly.items) if (it.k === 'stall' && it.x > midColX(46) && r() < 0.62) folk.push({ x: it.x + (r() - 0.5) * it.w * 0.8, seed: r() * 50, v: (r() * 4) | 0, col: Math.round((it.x - 120) / (TS * 0.3)), w: 1 });
    return { scare, rides, folk };
  });
}
// ---- the scarecrow: a pole, a ragged coat on a crossbar, a straw skirt; the head is its own sprite, five looks from left to right ----
function bakeScare() { const [c, g] = canvas(26, 34), r = mulberry(31);
  rect(g, 12, 9, 2, 25, '#5a3c22'); rect(g, 12, 9, 1, 25, '#7a5430'); rect(g, 2, 11, 22, 2, '#5a3c22'); rect(g, 2, 11, 22, 1, '#7a5430');                                                // the pole and the crossbar
  fillPoly(g, [[7, 11], [19, 11], [20, 25], [17, 28], [14, 25], [12, 29], [9, 25], [6, 27]], '#8a6a3c'); rect(g, 8, 14, 4, 4, '#a8452c'); rect(g, 15, 18, 3, 4, '#5a6a3a');      // the coat, with its patches
  for (let i = 0; i < 10; i++) px(g, 8 + i, 12 + ((i * 3) % 3), i & 1 ? '#6a4e2a' : '#9a7a48'); rect(g, 12, 12, 2, 12, '#6a4e2a');
  for (const sx of [-1, 1]) { const x0 = sx < 0 ? 2 : 23; for (let i = 0; i < 7; i++) { const dy = (r() * 4) | 0; line(g, x0, 12, x0 + sx * (1 + (i >> 1)), 15 + dy + (i % 3), i & 1 ? '#e0b858' : '#b88a2c'); } }   // straw out of the cuffs
  for (let i = 0; i < 14; i++) { const x = 6 + ((r() * 14) | 0), y = 26 + ((r() * 7) | 0); line(g, x, y - 2, x + ((r() * 3 - 1) | 0), y + 1, i & 1 ? '#e0b858' : '#b88a2c'); }                  // the straw skirt, frayed
  outline(c, OUT); return c; }
const HEADS = () => once('scHeads', () => Array.from({ length: 5 }, (_, i) => { const [c, g] = canvas(14, 15), o = i - 2;
  fillPoly(g, [[3, 4], [11, 4], [12, 11], [10, 13], [4, 13], [2, 11]], '#cdb784'); rect(g, 3, 4, 8, 1, '#e2d0a0');                                                              // the sack
  rect(g, 1, 3, 12, 2, '#3e2a1c'); rect(g, 3, 0, 8, 4, '#4a3626'); rect(g, 3, 3, 8, 1, '#7a2a20');                                                                           // hat brim, crown, band
  for (const [x, y] of [[2, 8], [12, 7], [1, 9], [12, 10], [3, 12], [10, 12]]) line(g, x, y, x + (x < 7 ? -2 : 2), y + 2, '#c89a30');                                               // straw hair
  const ex = [4, 8].map(x => x + Math.round(o * 0.9));                                                                                                                       // button eyes follow the turn
  for (const x of ex) { rect(g, x, 7, 2, 2, '#1a1210'); px(g, x + (o > 0 ? 1 : 0), 7, '#d8c8a0'); }
  rect(g, 5 + Math.round(o * 0.7), 11, 5, 1, '#3a2418'); for (let k = 0; k < 4; k++) px(g, 5 + k + Math.round(o * 0.7), 10 + (k & 1), '#3a2418');                                // the stitched mouth
  outline(c, OUT); return c; }));
/* the offerings at its feet: a pumpkin, a sheaf, apples, a jar with a candle, wilted flowers, a husk doll - three of them, which three is the scarecrow's own */
function offerings(g, x, y, sc, time, d, k) {
  const set = [[[-9, 'pumpkin'], [-3, 'candle'], [7, 'apples']], [[-8, 'sheaf'], [4, 'doll'], [9, 'pumpkin']], [[-10, 'flowers'], [-2, 'apples'], [6, 'candle']]][sc.offer % 3];
  for (const [dx, kind] of set) { const ox = Math.round(x + dx * (sc.flip ? -1 : 1));
    if (kind === 'pumpkin') { rc(g, ox - 2, y - 4, 5, 4, night([210, 110, 30], d)); rc(g, ox - 1, y - 5, 3, 1, night([176, 80, 20], d)); rc(g, ox, y - 6, 1, 1, night([70, 100, 40], d)); }
    else if (kind === 'apples') { rc(g, ox - 1, y - 2, 2, 2, night([190, 40, 40], d)); rc(g, ox + 1, y - 2, 2, 2, night([210, 70, 50], d)); rc(g, ox, y - 4, 2, 2, night([190, 40, 40], d)); }
    else if (kind === 'sheaf') { for (let i = -2; i <= 2; i++) rc(g, ox + i, y - 7 + Math.abs(i), 1, 7 - Math.abs(i), night([i & 1 ? 224 : 184, i & 1 ? 184 : 138, 44], d)); rc(g, ox - 2, y - 3, 5, 1, night([120, 60, 40], d)); }
    else if (kind === 'flowers') { for (let i = 0; i < 4; i++) { rc(g, ox + i - 2, y - 3 - (i & 1), 1, 3 + (i & 1), night([90, 110, 60], d)); rc(g, ox + i - 2, y - 4 - (i & 1), 1, 1, night([i & 1 ? 140 : 120, 80, 150], d)); } }
    else if (kind === 'doll') { rc(g, ox - 1, y - 7, 3, 3, night([196, 170, 100], d)); rc(g, ox - 1, y - 4, 3, 4, night([150, 110, 60], d)); rc(g, ox - 3, y - 4, 7, 1, night([196, 170, 100], d)); px(g, ox - 1, y - 6, '#1a1210'); px(g, ox + 1, y - 6, '#1a1210'); }
    else { rc(g, ox - 2, y - 6, 5, 6, night([170, 190, 190], d)); rc(g, ox - 1, y - 5, 3, 4, night([240, 220, 160], d)); const fl = 1 + (Math.sin(time * 11 + sc.seed * 40) > 0.2 ? 1 : 0); rc(g, ox, y - 8 - fl + 1, 1, fl, '#ffd36b'); glow(g, ox, y - 7, 9 + 5 * d, (0.25 + 0.5 * d) * (0.8 + 0.2 * Math.sin(time * 9 + sc.seed * 30))); } }
}
function drawScare(g, o, sc, sx, gy, time, dt, d, k) {
  const body = tinted('scBody', bakeScare, d), heads = HEADS(), tgt = clamp01(Math.abs(o.hx - sx) / 90) * Math.sign(o.hx - sx) || 0;
  if (o.calm) sc.a += (tgt - sc.a) * Math.min(1, dt * 1.3);                                                                               // the head swings round, slowly; never while a fight is on (it holds)
  const i = Math.max(0, Math.min(4, Math.round(sc.a * 2) + 2)), x = Math.round(sx), hd = tinted('scHead' + i, () => heads[i], d), over = Math.abs(sc.a) > 0.85 ? 1 : 0;
  g.drawImage(body, x - 13, gy - 34);
  g.drawImage(hd, x - 7 + Math.round(sc.a * 1.4), gy - 41 + over * 0);                                                                  // the head sits on the pole
  offerings(g, x, gy, sc, time, d, k);
  const eg = smooth(0.25, 0.9, d) * Math.abs(sc.a); if (eg > 0.15) for (const ex of [-3, 1]) { const px0 = x - 7 + Math.round(sc.a * 1.4) + 6 + ex + Math.round(sc.a * 0.9); glow(g, px0 + 1, gy - 34, 4, eg * 0.55); rc(g, px0, gy - 35, 2, 2, 'rgba(255,150,60,' + (eg * 0.9).toFixed(2) + ')'); }   // an ember in each button eye once it is looking at you in the dark
}
// ---- ghost rides: nobody aboard ----
function drawCarousel(g, r, sx, gy, time, d, k) {
  const ph = time * 0.34 + 0.9 * Math.sin(time * 0.21 + r.seed) + 0.25 * Math.sin(time * 1.9) * Math.max(0, Math.sin(time * 0.13 + r.seed)), W = 30;   // it creaks round: a lurch now and then
  rc(g, sx - 15, gy - 3, 30, 3, night([90, 60, 40], d)); rc(g, sx - 1, gy - 22, 3, 20, night([200, 170, 90], d));                                                  // the deck and the centre pole
  for (let i = 0; i < 5; i++) { const a = ph + i * 1.2566, x = sx + Math.cos(a) * 11, z = Math.sin(a), y = gy - 4 - 6 + Math.sin(time * 1.4 + i * 2) * 2.5 * (0.5 + 0.5 * z);
    rc(g, x, y - 1, 1, 8, night([200, 170, 90], d)); rc(g, x - 3, y + 1, 7, 4, night([z > 0 ? 220 : 170, z > 0 ? 210 : 190, z > 0 ? 190 : 200], d)); rc(g, x + (Math.cos(a - 1.57) > 0 ? 3 : -4), y - 1, 2, 3, night([220, 210, 190], d)); }   // horses on poles, going up and down
  const top = gy - 28; fillPoly(g, [[sx - 17, top + 6], [sx, top - 6], [sx + 17, top + 6]], night([184, 56, 44], d));
  for (let i = 0; i < 6; i++) rc(g, sx - 17 + i * 6, top + 6, 3, 3, night([236, 224, 196], d)); rc(g, sx - 17, top + 5, 34, 1, night([236, 224, 196], d));                         // striped canopy with a scalloped edge
  const blackout = Math.sin(time * 0.41 + r.seed * 3) + Math.sin(time * 1.13 + r.seed) > 1.5 - 0.5 * k ? 0.08 : 1;                                                   // the whole ride's bulbs go dark for a breath, now and then
  for (let i = 0; i < 9; i++) { const x = sx - 16 + i * 4, on = flick(r.seed + i * 3, time * 1.2, Math.min(1, d + 0.4)) * blackout; const a = on * (0.35 + 0.65 * d); if (a > 0.1) { rc(g, x, top + 9, 2, 2, 'rgba(255,224,150,' + a.toFixed(2) + ')'); glow(g, x + 1, top + 10, 6, a * 0.5); } }
  glow(g, sx, top + 12, 26, 0.12 * d * blackout);
}
function drawSwing(g, r, sx, gy, time, d, k) {
  const th = 0.62 * Math.sin(time * 1.05 + r.seed) * (0.85 + 0.15 * Math.sin(time * 0.17)), top = gy - 34, L0 = 26;
  g.strokeStyle = night([60, 40, 30], d); g.lineWidth = 2; g.beginPath(); g.moveTo(sx - 18, gy); g.lineTo(sx - 3, top); g.lineTo(sx + 3, top); g.lineTo(sx + 18, gy); g.stroke(); rc(g, sx - 5, top - 1, 10, 3, night([184, 56, 44], d));   // the A-frame gantry
  const bx = sx + Math.sin(th) * L0, by = top + Math.cos(th) * L0;
  g.strokeStyle = night([40, 30, 26], d); g.lineWidth = 1; for (const dx of [-7, 7]) { g.beginPath(); g.moveTo(sx + dx * 0.3, top + 1); g.lineTo(bx + dx, by - 3); g.stroke(); }
  g.save(); g.translate(bx, by); g.rotate(-th * 0.9); g.fillStyle = night([184, 56, 44], d); g.beginPath(); g.moveTo(-10, -3); g.lineTo(10, -3); g.lineTo(7, 4); g.lineTo(-7, 4); g.closePath(); g.fill(); g.fillStyle = night([232, 190, 60], d); g.fillRect(-9, -3, 18, 1.5);   // the boat, empty
  g.restore();
  const on = flick(r.seed, time, Math.min(1, d + 0.3)); if (on > 0.5) { glow(g, bx, by - 5, 7, (0.3 + 0.5 * d) * on); rc(g, bx - 1, by - 6, 2, 2, 'rgba(255,224,150,' + (0.4 + 0.5 * d).toFixed(2) + ')'); }
}
// ---- the townsfolk who are not there when you come: four stances, dark, no faces ----
const FOLK = v => once('folk' + v, () => { const [c, g] = canvas(9, 19), k = '#1c1624', k2 = '#2a2236';
  fillPoly(g, [[2, 7], [7, 7], [8, 18], [1, 18]], k); rect(g, 3, 2, 3, 5, k2); rect(g, 2, 1, 5, 2, k);
  if (v === 1) { rect(g, 0, 8, 2, 6, k); rect(g, 7, 8, 2, 5, k); rect(g, 3, 4, 3, 2, k); }       // head bowed, hands clasped
  else if (v === 2) { rect(g, 7, 6, 3, 2, k); rect(g, 9, 4, 1, 3, k); rect(g, 0, 9, 2, 6, k); }   // an arm out, reaching for a prize
  else if (v === 3) { rect(g, 0, 7, 2, 8, k); rect(g, 7, 7, 2, 8, k); px(g, 4, 0, k); px(g, 2, 0, k); px(g, 6, 0, k); }   // arms down, a bonnet's frill
  else { rect(g, 0, 9, 2, 7, k); rect(g, 7, 9, 2, 7, k); }
  return c; });
// ---- the mid layer ----
let lastT = 0;
/* o: { hx: the hero's screen x, calm: false while anything is in reach (the scarecrows' heads hold) } */
export function drawMid(g, cx, cy, VW, VH, L, time, d, dY, o) {
  const F = midFrame(L, cx, VH, dY), D = decor(L, F.Ly), k = depth(L, cx, VW), dt = Math.max(0, Math.min(0.1, time - lastT)); lastT = time;
  const gyAt = x => Math.round(F.y0 + F.Ly.hillMid(x));
  for (const r of D.rides) { const sx = r.x - F.off; if (sx < -50 || sx > VW + 50) continue; if (r.kind === 'carousel') drawCarousel(g, r, Math.round(sx), gyAt(r.x), time, d, k); else drawSwing(g, r, Math.round(sx), gyAt(r.x), time, d, k); }
  for (const f of D.folk) { const sx = f.x - F.off; if (sx < -20 || sx > VW + 20) continue; const dx = sx - o.hx, a = dx > 0 ? smooth(26, 80, dx) : 0, fa = a * smooth(0.0, 0.25, d) * (0.5 + 0.4 * d); if (fa < 0.04) continue;   // gone as you come close, and gone behind you
    g.globalAlpha = fa; g.drawImage(FOLK(f.v), Math.round(sx - 4 + Math.sin(time * 0.6 + f.seed) * 0.7), gyAt(f.x) - 19); g.globalAlpha = 1; }
  for (const sc of D.scare) { const sx = sc.x - F.off; if (sx < -30 || sx > VW + 30) continue; drawScare(g, o, sc, sx, gyAt(sc.x), time, dt, d, k); }
}

// ====================================================== THE FORTUNE CARD: it flips as you pass ======================================================
/* the fortune-teller's caravan (L.fairDress 'caravan', the back lot's hatch) has a card pinned out on a bracket by its door: its back (a gold star on plum) as you come, then, as you walk
   past, it turns over (it shivers first, when you are near) to show a pale card with a scarecrow on its pole under a red moon. It stays turned behind you. Dressing: it is not a sign, not a key. */
const CARD = face => once('card' + face, () => { const [c, g] = canvas(10, 16);
  if (!face) { rect(g, 0, 0, 10, 16, '#e8c23a'); rect(g, 1, 1, 8, 14, '#4a2450'); rect(g, 2, 2, 6, 12, '#5e3066'); px(g, 4, 6, '#e8c23a'); px(g, 5, 6, '#e8c23a'); rect(g, 4, 7, 2, 2, '#e8c23a'); px(g, 3, 7, '#e8c23a'); px(g, 6, 7, '#e8c23a'); px(g, 4, 9, '#e8c23a'); px(g, 5, 9, '#e8c23a'); }
  else { rect(g, 0, 0, 10, 16, '#7a2418'); rect(g, 1, 1, 8, 14, '#e8dcc0'); circle(g, 6, 4, 2, '#b8382c'); rect(g, 4, 6, 2, 6, '#3a2418'); rect(g, 2, 8, 6, 1, '#3a2418'); rect(g, 3, 5, 3, 1, '#3a2418'); px(g, 4, 4, '#3a2418'); rect(g, 3, 12, 4, 1, '#c89a30'); px(g, 2, 13, '#3a2418'); px(g, 7, 13, '#3a2418'); }
  return c; });
export function drawCard(g, cx, cy, VW, L, time, heroX, d) {
  const it = (L.fairDress || []).find(i => i.k === 'caravan'); if (!it) return; const x0 = (it.x + (it.w || 4)) * TS + 8, sx = x0 - cx; if (sx < -20 || sx > VW + 20) return;
  const p = smooth(x0 - 150, x0 + 40, heroX), near = 1 - smooth(60, 220, Math.abs(heroX - x0)), gy = it.row * TS - cy, y = Math.round(gy - 42);
  const ang = p * Math.PI + (p > 0.02 && p < 0.98 ? 0 : Math.sin(time * 14) * 0.18 * near * (1 - p)), cs = Math.cos(ang), w = Math.max(1, Math.round(10 * Math.abs(cs)));   // it shivers as you near, then turns over
  rc(g, sx - 1, gy - 46, 2, 18, '#3a2418'); rc(g, sx - 1, gy - 47, 9, 2, '#3a2418'); rc(g, sx + 6, gy - 46, 1, 3, '#7a5a30');                                                     // the bracket and its hook
  g.save(); g.translate(Math.round(sx + 6 + Math.sin(time * 1.3) * 0.6), y + 2); g.drawImage(CARD(cs < 0 ? 1 : 0), -Math.round(w / 2), 0, w, 16); g.restore();
  if (d > 0.3) glow(g, sx + 6, y + 8, 14, 0.14 * (cs < 0 ? 1.5 : 1));
}

// ====================================================== THE FOG: low, rolling, thicker the deeper you are ======================================================
const FOGW = 512, FOGH = 70;
const fogSpr = warm => once('fog' + warm, () => { const [c, g] = canvas(FOGW, FOGH), r = mulberry(warm ? 5 : 6), col = warm ? '255,226,190' : '150,170,214';
  for (let i = 0; i < 26; i++) { const x = r() * FOGW, y = FOGH * (0.35 + r() * 0.6), rx = 40 + r() * 70, ry = 10 + r() * 16;
    for (const wx of [-FOGW, 0, FOGW]) { g.save(); g.translate(x + wx, y); g.scale(rx / ry, 1); const gr = g.createRadialGradient(0, 0, 1, 0, 0, ry); gr.addColorStop(0, 'rgba(' + col + ',0.34)'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(-ry, -ry, ry * 2, ry * 2); g.restore(); } }
  g.globalCompositeOperation = 'destination-in'; const gv = g.createLinearGradient(0, 0, 0, FOGH); gv.addColorStop(0, 'rgba(0,0,0,0)'); gv.addColorStop(0.45, 'rgba(0,0,0,1)'); gv.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gv; g.fillRect(0, 0, FOGW, FOGH); return c; });
/* three banks of it behind the road (so a foe, a platform and every threat read stay clear of it), at their own speeds and heights, warm and thin at the gate, cold and thick at the green */
export function drawFog(g, cx, cy, VW, VH, L, time, d, k) {
  const floor = (L.green ? L.green.floor : 28) * TS, dens = 0.1 + 0.6 * smooth(0, 1, Math.max(d, k)), cold = smooth(0.15, 0.85, d), W = fogSpr(true), C = fogSpr(false);
  for (let i = 0; i < 3; i++) { const par = [0.42, 0.66, 0.9][i], sp = [7, -11, 16][i], y = Math.round(floor - cy - [40, 52, 34][i] + Math.sin(time * 0.25 + i * 2) * 3), a = dens * [0.62, 0.5, 0.42][i] * (0.85 + 0.15 * Math.sin(time * 0.18 + i));
    if (y > VH + 4 || y + FOGH < 0) continue; const off = ((((cx * par + time * sp) % FOGW) + FOGW) % FOGW);
    for (const [spr, w] of [[W, 1 - cold], [C, cold]]) { if (w < 0.03) continue; g.globalAlpha = a * w; for (let x = -off; x < VW; x += FOGW) g.drawImage(spr, Math.round(x), y); } }
  g.globalAlpha = 1;
}

// ====================================================== THE LIGHT DRAINS: a vignette from the edges, deeper with the night ======================================================
let VIG = null;
export function drawVeil(g, VW, VH, time, d) {
  const t = smooth(0.05, 1, d); if (t < 0.02) return;
  if (!VIG || VIG.width !== VW || VIG.height !== VH) { VIG = document.createElement('canvas'); VIG.width = VW; VIG.height = VH; const x = VIG.getContext('2d'), gr = x.createRadialGradient(VW / 2, VH * 0.55, VH * 0.3, VW / 2, VH * 0.55, VW * 0.62); gr.addColorStop(0, 'rgba(4,6,22,0)'); gr.addColorStop(1, 'rgba(4,6,22,1)'); x.fillStyle = gr; x.fillRect(0, 0, VW, VH); }
  g.globalAlpha = 0.42 * t * (0.93 + 0.07 * Math.sin(time * 0.7)); g.drawImage(VIG, 0, 0); g.globalAlpha = 1;
}

// ====================================================== THE LANTERNS GUTTER: some go out as you pass (drawing only) ======================================================
/* every steady lamp on the fairway may be snuffed once you are three tiles past it: it gutters for a second and a half and is dark until you come back. `l.cb` is only how the lamp is
   DRAWN (src/redraw/fair_world.js drawLamps and the dusk glow); l.lit, l.life and the night's holes are untouched, so no foe and no rule can tell. Returns how many went out this frame. */
export function lampCreep(lamps, heroX, time, dt, L) {
  let out = 0; const unlit = L.unlit || [];
  for (const l of lamps) { if (l.hung || !(l.life >= 1) || unlit.some(([a, b]) => l.x >= a - 2 && l.x <= b + 2)) continue;
    const dk = clamp01(l.x / 620), mine = hash(l.x * 3.7) < 0.28 + 0.4 * dk, lx = l.x * TS + 8;
    if (!mine) continue;
    if (heroX > lx + 48) { const was = l.cbT || 0; l.cbT = was + dt; const u = l.cbT / 1.5; l.cb = u >= 1 ? 0 : u < 0.08 ? 1 : (Math.sin(l.cbT * 31) + Math.sin(l.cbT * 17) > 0 ? 0.6 : 0.12) * (1 - u); if (was < 1.5 && l.cbT >= 1.5) out++; }
    else if (heroX < lx - 160 && l.cbT) { l.cbT = 0; l.cb = 1; }
  }
  return out;
}
/* where the dressing stands (a debug hook for tools/fair-creep.mjs): world columns of the scarecrows, rides and townsfolk */
export const creepStats = (L, VH = 180, cx = 0) => { const F = midFrame(L, cx, VH, 0), D = decor(L, F.Ly); return { scare: D.scare.map(s => s.col + ':' + Math.round(s.x - F.off) + ':' + s.a.toFixed(2)), rides: D.rides.map(s => s.kind + '@' + s.col + ':' + Math.round(s.x - F.off)), folk: D.folk.length }; };
