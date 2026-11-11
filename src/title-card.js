// src/title-card.js - THE LIVING TITLE SCENE (claude/intro, 2026-11-08; it began as the dark PRESS ANY KEY card of claude/uiscreens, 2026-10-06).
// The game opens on the bright forest title: the sign eases down, the heroes walk in along the road and settle round the fire, and PRESS ANY KEY
// blinks under the sign with what the game takes (keyboard or pad, one to four players; a touch device says TAP TO START). The first press is still
// what the browser needs to start the audio, so it is kept: it starts the sound, and the menu board slides in.
// All of it is time-driven pure drawing: main.js owns the state (pressCard, pressAt, introAt) and asks these for positions and pictures.

export const SIGN_S = 0.7;        // the sign eases down over this long
export const WALK_AT = 0.7;       // the first hero steps onto the road this long into the intro
export const WALK_GAP = 0.42;     // and the next one this much later, the one with the farthest seat first
export const WALK_V = 62;         // px/s along the road
export const PROMPT_AT = 1.5;     // PRESS ANY KEY comes up this long into the intro
export const PROMPT_FADE = 0.35;  // and goes this fast when it is pressed

/* A HERO'S WALK IN. `s` is seconds into the intro (Infinity: simply there - reduce-motion, a tool, a later visit to the title), `order` is his turn (0 first),
   `seat` the x he settles on, `face` the way he faces once he is there. */
export function castAt(s, order, seat, face) {
  if (!isFinite(s)) return { x: seat, walking: false, face, here: true };
  const t = s - WALK_AT - order * WALK_GAP;
  if (t < 0) return { x: -40, walking: false, face: 1, here: false };
  const x = -30 + t * WALK_V;
  return x >= seat ? { x: seat, walking: false, face, here: true } : { x, walking: true, face: 1, here: false };
}

/* WHEN THE LAST HERO HAS SAT DOWN (seconds into the intro), for the tools and for the prompt: it is up before then, and is not waiting on it. */
export function introEnd(seats) {
  const sorted = seats.slice().sort((a, b) => b - a);
  return Math.max(0, ...sorted.map((sx, i) => WALK_AT + i * WALK_GAP + (sx + 30) / WALK_V));
}

/* THE PRESS PROMPT: PRESS ANY KEY (TAP TO START on a touch device), blinking, centred on `cx` at `y`, and under it the line of what the game takes with a
   tiny keycap and a tiny pad. `a` is its alpha (1 -> 0 as it is pressed), `still` is reduce-motion (no blink). `text` is main.js's text(), `inkW` its measure. */
export function drawPrompt(g, text, inkW, UI, time, cx, y, a, touch, still) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const on = still || Math.floor(time * 1.4) % 3 !== 2;
  if (!touch) { const pw = inkW('KEYBOARD OR GAMEPAD - 1 TO 4 PLAYERS', 6) + 40; g.fillStyle = 'rgba(8,6,12,0.42)'; g.fillRect(Math.round(cx - pw / 2), y - 4, pw, 27); }   /* a dim plate under the words: they read over the gate's pale stone */
  else { const pw = inkW('TAP TO START', 8) + 30; g.fillStyle = 'rgba(8,6,12,0.42)'; g.fillRect(Math.round(cx - pw / 2), y - 4, pw, 16); }
  if (on) text(touch ? 'TAP TO START' : 'PRESS ANY KEY', cx, y, '#fff6e0', 'center', 8);
  if (!touch) {
    const line = 'KEYBOARD OR GAMEPAD - 1 TO 4 PLAYERS', w = inkW(line, 6), y2 = y + 13, x0 = Math.round(cx - w / 2);
    text(line, cx, y2, UI.text, 'center', 6);
    drawKeycap(g, x0 - 13, y2 - 1);
    drawPad(g, x0 + w + 5, y2);
  }
  g.restore();
}

/* a keycap, 8x7: pale top, dark underside, a mark on it */
function drawKeycap(g, x, y) {
  g.fillStyle = '#1a1410'; g.fillRect(x, y, 8, 8);
  g.fillStyle = '#7a6a54'; g.fillRect(x + 1, y + 1, 6, 6);
  g.fillStyle = '#e8dcc0'; g.fillRect(x + 1, y + 1, 6, 5);
  g.fillStyle = '#1a1410'; g.fillRect(x + 3, y + 2, 2, 1); g.fillRect(x + 3, y + 4, 2, 1);
}

/* a gamepad, 10x7: a body, a cross on the left, two buttons on the right */
function drawPad(g, x, y) {
  g.fillStyle = '#1a1410'; g.fillRect(x, y + 1, 10, 6); g.fillRect(x + 1, y, 8, 1);
  g.fillStyle = '#8a8478'; g.fillRect(x + 1, y + 1, 8, 5);
  g.fillStyle = '#1a1410'; g.fillRect(x + 2, y + 3, 3, 1); g.fillRect(x + 3, y + 2, 1, 3);
  g.fillStyle = '#e0b040'; g.fillRect(x + 6, y + 2, 1, 1); g.fillStyle = '#8fd160'; g.fillRect(x + 7, y + 4, 1, 1);
}
