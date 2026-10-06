// src/opening-panels.js - THE FIRST-RUN OPENING (claude/uiscreens, 2026-10-06): four illustrated panels shown once, on the first new save of a browser, before the hero pick.
// The wood, the mountain, the road, the knight. Skippable at any point (X or ESC skips all; Z or RIGHT turns the page). Pure drawing: main.js owns the state.
// THE WORDS ARE A FIRST DRAFT (the game has no written backstory): they promise nothing about the plot. Edit OPENING_LINES freely.

export const OPENING_LINES = [
  ['THE WOOD', 'the bracken has grown over the old road.', 'nobody walks it now.'],
  ['THE MOUNTAIN', 'past the wood, past the sea,', 'there is a light on a mountain.'],
  ['THE ROAD', 'people went up with torches.', 'the road remembers every one.'],
  ['THE KNIGHT', 'a sword, a shield, a fire to leave.', 'so you go.'],
];
export const PANELS = OPENING_LINES.length;

const px = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
function frond(g, x, base, h, t, ph, col, tip) {
  const sway = Math.sin(t * 1.1 + ph) * (1 + h * 0.03);
  for (let k = 0; k <= 10; k++) { const u = k / 10, y = base - h * u, xx = x + sway * u * u + u * u * h * 0.3, c = u > 0.55 ? tip : col;
    px(g, xx, y, 2, 3, c); if (k >= 2) { const len = Math.max(1, Math.round((1 - u) * 6 * Math.sin(Math.PI * Math.min(1, u * 1.15)) + 1)); px(g, xx - len, y + 1, len, 1, c); px(g, xx + 2, y + 1, len, 1, c); } }
}
function sky(g, VW, VH, top, bot) { for (let y = 0; y < VH; y += 4) { const k = y / VH; px(g, 0, y, VW, 4, k < 0.5 ? top : bot); } }
function stars(g, t, n, maxY) { for (let i = 0; i < n; i++) px(g, (i * 97 + 13) % 320, (i * 53 + 7) % maxY, 1, 1, Math.floor(t * 2 + i) % 7 === 0 ? '#9aa8a0' : '#4a5a54'); }
function knight(g, x, y, face, t) {   // a small stand-in figure (the real sprite is drawn by main.js on the last panel)
  const b = Math.floor(t * 3) % 2; px(g, x + 2, y - 15 + b, 7, 5, '#c9d1dc'); px(g, x + 3, y - 13 + b, 5, 2, '#1b1626'); px(g, x + 1, y - 10 + b, 9, 6, '#3f7fd0'); px(g, x + 4, y - 10 + b, 3, 6, '#c9463d'); px(g, x + 2, y - 4, 3, 4, '#3a2a1a'); px(g, x + 6, y - 4, 3, 4, '#3a2a1a'); px(g, x + (face > 0 ? 10 : -1), y - 11 + b, 2, 7, '#c9d1dc');
}

/* the picture for panel i, in the 320 x 180 frame, at `t` seconds into it */
export function drawPanel(g, i, t, VW = 320, VH = 180) {
  const GY = 112;   /* (the ground is above the caption bar) */
  if (i === 0) {   // THE WOOD: trunks, bracken over the road, a few fireflies
    sky(g, VW, VH, '#0c1a14', '#14281c'); stars(g, t, 30, 60);
    for (const [x, w] of [[30, 14], [96, 18], [230, 16], [290, 12]]) { px(g, x, 0, w, GY, '#0a120d'); px(g, x + 2, 0, 3, GY, '#14231a'); }
    px(g, 0, GY, VW, VH - GY, '#101c14'); px(g, 120, GY, 90, VH - GY, '#2a2a22'); px(g, 126, GY, 78, VH - GY, '#1c1c18');   // the old road
    for (let k = 0; k < 26; k++) frond(g, (k * 41 + 5) % 330 - 5, GY + 6 + (k % 4) * 10, 24 + (k * 13) % 30, t, k * 1.3, '#0e2214', '#22442a');
    for (let k = 0; k < 8; k++) { const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 3 + k * 2)); g.globalAlpha = a; px(g, 40 + k * 36 + Math.sin(t + k) * 8, 70 + (k * 23) % 50 + Math.cos(t * 1.3 + k) * 5, 2, 2, '#fff0a0'); g.globalAlpha = 1; }
  } else if (i === 1) {   // THE MOUNTAIN: the sea, the peak, the light on top that pulses
    sky(g, VW, VH, '#161230', '#3a2848'); stars(g, t, 40, 70);
    for (let y = 40; y < GY; y++) { const hw = Math.round((y - 40) * 0.8 + ((y * 7) % 5 === 0 ? 2 : 0)); px(g, 200 - hw, y, hw * 2, 1, y < 60 ? '#6a7a98' : '#2c3452'); }
    px(g, 0, GY - 10, VW, VH, '#1a2440'); for (let k = 0; k < 14; k++) { px(g, (k * 29 + Math.floor(t * 12)) % 320, GY - 4 + (k % 4) * 9, 10, 1, '#3a4a78'); }
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2); g.globalAlpha = 0.25 + 0.35 * pulse; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(200, 38, 14 + 6 * pulse, 0, 7); g.fill(); g.globalAlpha = 1; px(g, 198, 35, 5, 5, '#fff6c8');
  } else if (i === 2) {   // THE ROAD: a column of torches climbing the hill, one after another
    sky(g, VW, VH, '#120e22', '#2a1c34'); stars(g, t, 28, 60);
    for (let x = 0; x < VW; x++) { const y = GY - 28 + Math.round(24 * (1 - Math.min(1, x / 300)) * 0 + (x * 0.16) * -1 + Math.sin(x / 38) * 4); px(g, x, y + 30, 1, VH, '#0c0a14'); }
    for (let k = 0; k < 9; k++) { const u = ((t * 0.07 + k / 9) % 1), x = 10 + u * 300, y = GY + 2 - x * 0.16 + Math.sin(x / 38) * 4 + 2;
      g.globalAlpha = 0.16; g.fillStyle = '#ff9a5c'; g.beginPath(); g.arc(x + 3, y - 14, 14, 0, 7); g.fill(); g.globalAlpha = 1;
      px(g, x, y - 8, 4, 8, '#0a0810'); px(g, x + 4, y - 14, 1, 9, '#1a1420'); const f = Math.floor(t * 11 + k) % 3; px(g, x + 3, y - 17 - (f === 1 ? 1 : 0), 3, 4, '#ff9a5c'); px(g, x + 4, y - 16, 1, 2, '#ffd36b'); }
  } else {   // THE KNIGHT: a camp fire he is about to leave
    sky(g, VW, VH, '#0b0a1c', '#1c1830'); stars(g, t, 36, 70);
    px(g, 0, GY, VW, VH - GY, '#16241c'); px(g, 0, GY, VW, 2, '#2e5a2a');
    const fx = 120, fl = Math.floor(t * 9) % 3; g.globalAlpha = 0.18; g.fillStyle = '#ff9a5c'; g.beginPath(); g.ellipse(fx, GY - 8, 54, 34, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    px(g, fx - 9, GY - 3, 18, 3, '#3a2214'); px(g, fx - 5, GY - 13 - (fl === 1 ? 1 : 0), 10, 9, '#d9642a'); px(g, fx - 3, GY - 17 - fl, 6, 7, '#ff9a5c'); px(g, fx - 1, GY - 20, 3, 6, '#ffd36b');
    const walk = Math.min(1, Math.max(0, (t - 1.2) / 3)); knight(g, 148 + walk * 130, GY + 2, 1, walk > 0 && walk < 1 ? t * 5 : t);
    for (let k = 0; k < 20; k++) frond(g, (k * 53 + 9) % 330 - 5, GY + 8, 26 + (k * 11) % 24, t, k, '#0a160e', '#1a3422');
    const gl = Math.floor(t * 1.2) % 4 !== 3; if (gl) px(g, 318, 20, 2, 2, '#ffd36b');
  }
}

/* THE CARD OVER IT: the title of the panel, its two lines, the page dots and the keys. `text` is main.js's text(). */
export function drawPanelText(g, text, UI, i, t, VW, VH, touch) {
  const [title, a, b] = OPENING_LINES[i], k = Math.min(1, t / 0.6);
  g.fillStyle = 'rgba(8,6,14,0.78)'; g.fillRect(0, VH - 52, VW, 52); g.fillStyle = 'rgba(201,178,124,0.5)'; g.fillRect(0, VH - 52, VW, 1);
  g.globalAlpha = k; text(title, VW / 2, VH - 46, UI.gold, 'center', 12); text(a.toUpperCase(), VW / 2, VH - 30, '#fff6e0', 'center', 8); text(b.toUpperCase(), VW / 2, VH - 19, '#fff6e0', 'center', 8); g.globalAlpha = 1;
  for (let d = 0; d < PANELS; d++) px(g, VW / 2 - PANELS * 5 + d * 10 + 1, VH - 8, 5, 3, d === i ? UI.gold : '#4a4058');
  text(touch ? 'tap: next   hold or ESC: skip' : 'Z next    X or ESC skip', VW - 4, VH - 9, UI.dim, 'right', 6);
}
