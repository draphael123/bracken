// src/redraw/fen_marks.js - (claude/bogtroll2b, Daniel 11-07: "make it clearer which paths stun him when he comes out")
// THE MARK OF A ROTTEN SECTION AT THE TROLL'S CROSSING: cracked boards across its top and a little red rag on a post at its near end. While a hero stands on it during his hunt
// the section PULSES (a red wash over the boards, the rag snaps, two red ticks over it): that is the one he will burst up through. A section a hero LAID gets the same mark.
// Pure canvas; x0 / y = the section's left edge and its road row's top on screen, w in px.
const R = Math.round;
export function drawRotMark(g, x0, w, y, time, seed, pulse) {
  const rc = (x, yy, ww, hh, c) => { g.fillStyle = c; g.fillRect(R(x), R(yy), R(ww), R(hh)); };
  /* the cracks: a dark zig across every board, a paler splinter beside it */
  for (let i = 0; i < w / 16; i++) { const bx = x0 + i * 16, k = (seed * 7 + i * 5) % 4;
    rc(bx + 4 + k, y + 1, 1, 3, '#1a1008'); rc(bx + 5 + k, y + 4, 1, 3, '#1a1008'); rc(bx + 3 + k, y + 7, 1, 3, '#1a1008'); rc(bx + 6 + k, y + 1, 1, 1, '#b79a62'); }
  /* the pulse: a red wash over the boards he will come up through */
  if (pulse) { g.globalAlpha = 0.22 + 0.18 * Math.sin(time * 11); rc(x0, y - 1, w, 5, '#ff4a3a'); g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 11); rc(x0, y - 2, w, 1, '#ff8a5c'); g.globalAlpha = 1; }
  /* the post and its red rag (it snaps in the wind; faster when he is under you) */
  const px = x0 + 1, fl = Math.sin(time * (pulse ? 14 : 3.2) + seed) * (pulse ? 2 : 1);
  rc(px, y - 15, 3, 15, '#4a3422'); rc(px, y - 15, 1, 15, '#6a4a2a'); rc(px - 1, y - 16, 5, 1, '#2a1c10');
  rc(px + 3, y - 14, 3, 4, '#c8281e'); rc(px + 6 + (fl > 0 ? 1 : 0), y - 13 + (fl > 1 ? 1 : 0), 3, 3, '#e03a2c'); rc(px + 9 + R(fl), y - 12 + (fl < -1 ? 1 : 0), 2, 2, '#b01e16');
  if (pulse) { g.globalAlpha = 0.6 + 0.4 * Math.sin(time * 11); rc(x0 + w / 2 - 4, y - 22, 2, 7, '#ff5a44'); rc(x0 + w / 2 - 4, y - 13, 2, 2, '#ff5a44'); rc(x0 + w / 2 + 3, y - 22, 2, 7, '#ff5a44'); rc(x0 + w / 2 + 3, y - 13, 2, 2, '#ff5a44'); g.globalAlpha = 1; }
}
