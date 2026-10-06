// src/map-card.js - THE MAP'S INFO CARD, the parts that are pictures (claude/uiscreens, 2026-10-06): a postcard of the place (the node's region, its hour),
// and the medal legend. Pure draw (no game state): main.js passes what to show. The postcard is NOT the level's own layout (a wood is only built when you
// enter it); it is the country the node sits in, drawn small, so the card says WHERE as well as what.

/* what the map's region at this height is called (the same cut-offs as drawMap's header: desert, road inland, coast, crags, wood) */
export function regionAt(y, E) { return y < E.INLAND ? 'desert' : y < E.COAST ? 'inland' : y < E.CRAG ? 'coast' : y < E.WOOD ? 'crags' : 'wood'; }

const SCENE = {
  desert: { sky: ['#f0b070', '#d8784a'], far: '#b8704a', near: '#d9a860', sun: '#fff0b0' },
  inland: { sky: ['#8ab0d0', '#d0d8c0'], far: '#6a8a6a', near: '#4a7a3a', sun: '#fff6c8' },
  coast: { sky: ['#78a8d8', '#c0dcec'], far: '#7a8a9a', near: '#3a6aa0', sun: '#fff6c8' },
  crags: { sky: ['#6a7a98', '#b0b0c0'], far: '#5a6070', near: '#7a7a84', sun: '#e8e8f0' },
  wood: { sky: ['#1c3a2a', '#3a6a3a'], far: '#12281c', near: '#0e2014', sun: '#c8e090' },
};
const px = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/* A POSTCARD of the region in x, y, w, h. `night` darkens it (the wood is lit at night); `t` moves the sun/moon a pixel and the grass. */
export function drawPostcard(g, x, y, w, h, region, night, t) {
  const S = SCENE[region] || SCENE.wood;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  px(g, x, y, w, h * 0.55, S.sky[0]); px(g, x, y + h * 0.55, w, h * 0.45, S.sky[1]);
  px(g, x + w * 0.68, y + 4 + Math.sin(t * 0.8), 5, 5, S.sun);
  const gy = y + Math.round(h * 0.72);
  if (region === 'coast') { px(g, x, gy - 2, w, h, S.near); for (let i = 0; i < 5; i++) px(g, x + ((i * 11 + Math.floor(t * 6)) % w), gy + 3 + (i % 3) * 3, 5, 1, '#cfe8f6'); for (let i = 0; i < 9; i++) px(g, x + i * 5, gy - 8 - ((i * 7) % 6), 5, 10, S.far); }
  else if (region === 'crags') { for (let i = 0; i < 4; i++) { const cx = x + 4 + i * 11, hh = 10 + (i * 5) % 9; for (let r = 0; r < hh; r++) px(g, cx - r * 0.7, gy - hh + r, 1 + r * 1.4, 1, i % 2 ? S.far : '#6a6e7c'); } px(g, x, gy, w, h, S.near); }
  else if (region === 'desert') { for (let i = 0; i < 3; i++) { const cx = x + 6 + i * 14; px(g, cx, gy - 9 - (i % 2) * 3, 8, 12, S.far); px(g, cx + 1, gy - 10 - (i % 2) * 3, 6, 1, S.far); } px(g, x, gy, w, h, S.near); px(g, x, gy, w, 1, '#f0d890'); }
  else if (region === 'inland') { for (let i = 0; i < 6; i++) px(g, x + i * 9 - 3, gy - 6 - (i * 5) % 5, 12, 10, S.far); px(g, x, gy, w, h, S.near); }
  else { for (let i = 0; i < 7; i++) { const cx = x + 3 + i * 6; px(g, cx, gy - 16 - (i * 3) % 6, 3, 22, S.far); for (let r = 0; r < 4; r++) px(g, cx - 3 + r, gy - 18 - (i * 3) % 6 + r * 3, 9 - r * 2, 3, i % 2 ? '#1c4a2c' : '#164022'); } px(g, x, gy, w, h, S.near); }
  for (let i = 0; i < w; i += 4) px(g, x + i, gy + 1 + (i % 8 ? 0 : 1), 1, 1, 'rgba(255,255,255,0.12)');
  if (night) { g.globalAlpha = 0.5; px(g, x, y, w, h, '#0a0a24'); g.globalAlpha = 1; px(g, x + w * 0.7, y + 4, 3, 3, '#e8e4c8'); }
  g.restore();
  g.strokeStyle = 'rgba(201,178,124,0.7)'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}
