// src/wall-eel.js - THE WALL EEL (claude/deep3): THE DEEP 3's one new foe (plan-water-1105 item 7; Daniel 10-16 Q1: "wall eels, told by bubbles, in the tower walls").
// PURE: no canvas, no main.js. src/deep3-hands.js binds it to the world and draws it (GREYBOX).
//
// It lives in a hole in a wall and never leaves it. HIDDEN it cannot be reached (a common foe: B15's floor is a boss rule). When a hero comes into its line it
// BUBBLES (the tell, BUBBLES.tell s: a stream out of the hole and its own sound) - then STRIKES along its line (out to `reach`), HANGS out of the wall a moment
// (the punish: it takes a blade whole) and PULLS BACK. A blade during the bubbles does nothing (it is still in the wall) - the answer is to let it strike and
// miss, then cut it. A shield takes the strike (blockable). Two kinds of line: SIDE (out of a wall face, face +-1: the shaft, the tower's walls) and DOWN (out of
// the foot of a curtain wall, at a heavy walker passing under it: the tower's floors).
// Every move: its own pose (eelBubble / eelStrike / eelHang / eelBack) and its own sound (bubble / strike / back).

export const EEL = {
  hp: 20, dmg: 10,
  reach: { side: 48, down: 30 },   /* px out of the hole */
  sense: { along: 64, across: 40 },   /* a hero this close along its line, and coming within this much across it, wakes it: it strikes as he arrives (the tell is long enough to stop for) */
  tell: 0.7, strike: 0.16, hang: 1.0, back: 0.35, rest: 1.5,   /* s */
  w: 14, h: 10,   /* its head's box (px) */
};
export const EEL_SAY = { wall: 'IN THE WALL', bubbles: 'BUBBLES', cut: 'CUT IT NOW' };

/* a new eel from its ent: the hole (px), its line (dx, dy) */
export function newEel(e, TS = 16) {
  const down = e.dir === 'down';
  const hx = down ? e.x * TS + 8 : (e.face > 0 ? (e.wall + 1) * TS : e.wall * TS);
  const hy = down ? (e.wall + 1) * TS : e.y * TS + 8;
  return { hx, hy, dx: down ? 0 : (e.face > 0 ? 1 : -1), dy: down ? 1 : 0, reach: down ? EEL.reach.down : EEL.reach.side, kind: down ? 'down' : 'side',
    mode: 'hidden', modeT: 0.4 + ((e.x * 7 + e.y * 3) % 10) / 10, ext: 0, key: 0, n: { strikes: 0, hits: 0 } };
}
/* how far out it is (0 in the wall .. 1 at full reach) */
export const eelOut = s => s.ext;
/* its head (px) */
export const eelHead = s => ({ x: s.hx + s.dx * s.reach * s.ext, y: s.hy + s.dy * s.reach * s.ext });
/* can a blade reach it? (out of the wall: striking, hanging or pulling back) */
export const eelBare = s => s.mode === 'strike' || s.mode === 'hang' || s.mode === 'back';
/* the box a blade must find (its head and the neck behind it) - null when it is in the wall */
export function eelBox(s) {
  if (!eelBare(s)) return null; const h = eelHead(s), w = EEL.w / 2, d = EEL.h / 2;
  if (s.dy) return { l: h.x - d, r: h.x + d, t: s.hy, b: h.y + w };
  return { l: Math.min(s.hx, h.x) - (s.dx < 0 ? w : 0), r: Math.max(s.hx, h.x) + (s.dx > 0 ? w : 0), t: h.y - d, b: h.y + d };
}
/* is this hero in its line? (px; a hero's x, his feet y) */
export function inLine(s, hx, hy) {
  const cy = hy - 7;   /* his middle */
  if (s.dy) { const along = cy - s.hy; return along > -4 && along < EEL.sense.along && Math.abs(hx - s.hx) < EEL.sense.across; }
  const along = (hx - s.hx) * s.dx; return along > -4 && along < EEL.sense.along && Math.abs(cy - s.hy) < EEL.sense.across;
}
/* ONE STEP. heroes: [{ x, y (feet), alive }]; w: { strike(s, box, dmg, key), sound(k), bubble(x, y) } */
export function stepEel(s, dt, heroes, w) {
  s.modeT -= dt;
  switch (s.mode) {
    case 'hidden': s.ext = 0;
      if (s.modeT <= 0 && heroes.some(h => h.alive && inLine(s, h.x, h.y))) { s.mode = 'bubble'; s.modeT = EEL.tell; w.sound && w.sound('bubble'); }
      break;
    case 'bubble': s.ext = 0.06 * Math.sin(s.modeT * 40);   /* (the hole quivers) */
      if (w.bubble && Math.random() < dt * 30) w.bubble(s.hx + s.dx * 4, s.hy + s.dy * 4);
      if (s.modeT <= 0) { s.mode = 'strike'; s.modeT = EEL.strike; s.key++; s.n.strikes++; w.sound && w.sound('strike'); }
      break;
    case 'strike': s.ext = Math.min(1, 1 - s.modeT / EEL.strike);
      { const h = eelHead(s), r = EEL.w / 2; const bx = s.dy ? { l: h.x - r, r: h.x + r, t: s.hy, b: h.y + r } : { l: Math.min(s.hx, h.x) - r, r: Math.max(s.hx, h.x) + r, t: h.y - r, b: h.y + r };
        if (w.strike && w.strike(s, bx, EEL.dmg, 'eel' + s.key)) s.n.hits++; }
      if (s.modeT <= 0) { s.mode = 'hang'; s.modeT = EEL.hang; s.ext = 1; }
      break;
    case 'hang': s.ext = 1; if (s.modeT <= 0) { s.mode = 'back'; s.modeT = EEL.back; w.sound && w.sound('back'); } break;
    case 'back': s.ext = Math.max(0, s.modeT / EEL.back); if (s.modeT <= 0) { s.mode = 'hidden'; s.modeT = EEL.rest; s.ext = 0; } break;
  }
  return s;
}
/* A BLOW: whole when it is out; nothing in the wall (the hands say IN THE WALL) */
export function eelTake(s, dmg) { return eelBare(s) ? dmg : 0; }
export const TELL_ROWS = [['walleel', 'bubble', '!', 'block', 'low']];   /* (claude/sea3) the rows of src/marks.js: marks.js registers every module's TELL_ROWS, tools/tells.mjs discovers them */
