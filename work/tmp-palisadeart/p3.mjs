import { edit } from './patch.mjs';
const B = 'src/redraw/palisade_backdrop.js';
edit(B, `    /* the pennant flying from the roofed tower (live) and the smoke of the crew's fire */
    const px = gx - Math.round(54 * s * 0.0) - Math.round((sp.width * ratio) / 2) + Math.round((23 + 14) * u * ratio), py = gy - Math.round(sp.height * ratio) + Math.round((140 - 136) * u * ratio);
    void px; void py;
    g.globalAlpha = 0.22; for (let q = 0; q < 8; q++) { const t = (time * 0.15 + q * 0.125) % 1; g.fillStyle = mix('#e8d0b0', A.P.haze, 0.4); const sz = 4 + Math.round(t * 8); g.fillRect(gx + Math.round(sp.width * ratio * 0.28) + Math.round(Math.sin(time * 0.6 + q) * 5 + t * 18), gy - Math.round(sp.height * ratio * 0.5) - Math.round(t * 70), sz, sz); } g.globalAlpha = 1; }`,
`    LM = { x: gx - Math.round(sp.width * ratio / 2), y: gy - Math.round(sp.height * ratio), w: sp.width * ratio, h: sp.height * ratio, s: ratio * u / 1.0, haze: A.P.haze }; }`);
edit(B, `/* ---- the frame ---- */`, `/* where the gatehouse stood this frame (the live pennant and the crew's smoke are drawn over it by PWH.drawSky: src/palisade-hands.js) */
let LM = null;
export function drawLive(g, time) {
  if (!LM) return; const u = LM.w / 140 / (1 / 1), hz = LM.haze;
  /* the rust pennant on the roofed tower, fluttering: a flag of five ragged strips */
  const fx = LM.x + Math.round(23 * u), fy = LM.y + Math.round(4 * u);
  for (let i = 0; i < 14; i++) { const w = Math.sin(time * 5 - i * 0.5) * (1 + i * 0.12); g.fillStyle = i % 5 === 4 ? RUST[0] : RUST[2]; g.fillRect(fx + Math.round(i * u * 1.1), fy + Math.round(w) + (i > 9 ? 1 : 0), Math.max(1, Math.round(u * 1.2)), Math.max(2, Math.round(7 * u - i * 0.3))); }
  /* the smoke of the crew's fire: pale squares rising and thinning */
  g.globalAlpha = 0.2; for (let q = 0; q < 8; q++) { const t = (time * 0.12 + q * 0.125) % 1, sz = 3 + Math.round(t * 7 * u); g.fillStyle = mix('#e8d0b0', hz, 0.4); g.fillRect(LM.x + Math.round(LM.w * 0.82 + Math.sin(time * 0.6 + q) * 4 + t * 16), LM.y + Math.round(LM.h * 0.9 - t * 70 * u), sz, sz); } g.globalAlpha = 1;
}
/* ---- the frame ---- */`);
const H = 'src/palisade-hands.js';
edit(H, "import { makePalisadeHands }", "import { makePalisadeHands }", {all:false}).toString;
