// src/title-card.js - THE PRESS ANY KEY CARD (claude/uiscreens, 2026-10-06). The game opens on a dark card: the wood closed over the picture, the name
// of the game and PRESS ANY KEY. The press is also what the browser needs to start the audio, so it replaces the in-level "PRESS A KEY FOR SOUND"
// banner (that banner stays only as the fallback for a run that reaches a wood without ever passing the title: a deep link, a tool).
// Then, in this order: the fronds part (0.9 s), the knight walks in from the left and takes his seat by the fire (about 2 s), and the sign settles
// into place (the title already drops its sign on `since`; main.js sets titleSince to the end of the parting).
// All of it is time-driven pure drawing: main.js owns the state (pressCard, pressAt) and asks these for pictures.

export const PART_S = 0.9;        // the fronds part over this long after the press
export const WALK_FROM = 0.35;    // the knight starts walking this long after the press
export const WALK_S = 1.9;        // and takes this long to cross to his seat
export const SETTLE_S = PART_S;   // the sign starts to drop when the fronds are apart

const ease = k => k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);

/* THE KNIGHT'S WALK IN: where he is `since` seconds after the press (since < 0: the card is still up, he is not on the screen yet) */
export function walkIn(since, seat, face = -1) {
  if (since === null || since === undefined) return { x: seat, walking: false, face, here: true };
  const k = (since - WALK_FROM) / WALK_S;
  if (since < WALK_FROM) return { x: -40, walking: false, face: 1, here: false };
  if (k >= 1) return { x: seat, walking: false, face, here: true };
  return { x: -40 + (seat + 40) * ease(Math.min(1, Math.max(0, k))), walking: true, face: 1, here: false };
}

/* THE WOOD CLOSED OVER THE PICTURE. `open` is 0 (shut) to 1 (apart): the left half of the fronds goes left, the right half right, and the dark lifts. */
export function drawPressFronds(g, time, open, VW, VH) {
  const o = ease(open);
  if (o >= 1) return;
  g.save();
  g.globalAlpha = 0.74 * (1 - o); g.fillStyle = '#070a08'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
  for (let side = 0; side < 2; side++) {
    const dir = side ? 1 : -1;
    for (let i = 0; i < 15; i++) {
      const u = i / 14, rx = side ? VW * (0.5 + 0.55 * u) : VW * (0.5 - 0.55 * u);   // roots spread from the middle outward; the near ones are the tallest
      const h = VH * (1.05 - 0.45 * u) + ((i * 29) % 13), sway = Math.sin(time * 0.9 + i * 1.7 + side) * 2.5;
      const x = rx + dir * o * (VW * 0.62 + 30 * u), base = VH + 6, lean = -dir * (22 - u * 14) * (1 - o * 1.5) + sway;
      const col = i % 3 === 0 ? '#0d1a10' : i % 3 === 1 ? '#13241a' : '#0a140d', tip = i % 2 ? '#2a4a2c' : '#1c3622';
      g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + lean * 0.3, base - h * 0.55, x + lean, base - h); g.stroke();
      for (let f = 1; f <= 9; f++) {
        const t = f / 10, fy = base - h * t, fx = x + lean * t * t * 1.15 + lean * 0.1 * t, sp = (20 - f * 1.6) * (0.65 + 0.35 * Math.sin(Math.PI * Math.min(1, t * 1.1)));
        g.strokeStyle = f > 5 ? tip : col; g.lineWidth = f > 5 ? 2 : 3;
        g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo(fx - sp * 0.6, fy - 3, fx - sp, fy - 11 + sway * 0.2); g.moveTo(fx, fy); g.quadraticCurveTo(fx + sp * 0.6, fy - 3, fx + sp, fy - 11 - sway * 0.2); g.stroke();
      }
    }
  }
  g.restore();
}

/* THE CARD'S WORDS: the name, the line under it and PRESS ANY KEY, blinking. `text` is main.js's text(); `fade` 1 -> 0 as the fronds part. */
export function drawPressText(g, text, UI, time, VW, VH, fade, touch) {
  if (fade <= 0) return;
  g.globalAlpha = fade;
  const bob = Math.round(Math.sin(time * 1.3) * 1.5);
  text('BRACKEN', VW / 2 + 2, 52 + bob + 2, '#3a2214', 'center', 22); text('BRACKEN', VW / 2, 52 + bob, UI.gold, 'center', 22);
  text('a knight, a wood, a mountain', VW / 2, 82, UI.text, 'center', 6);
  if (Math.floor(time * 1.4) % 3 !== 2) text(touch ? 'TAP TO BEGIN' : 'PRESS ANY KEY', VW / 2, 126, '#fff6e0', 'center', 8);
  text(touch ? 'tapping also starts the sound' : 'this also starts the sound', VW / 2, 142, UI.dim, 'center', 6);
  g.globalAlpha = 1;
}
