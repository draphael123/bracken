// src/tower-supports.js - FALLING TOWER 3 (claude/fallingtower3, scratch/brief-fallingtower3.md section 1): YOU MAKE IT FALL.
// The tower's rule was a hazard you avoided ("cracked stone goes after three beats" - design-standard A2's failure, and the 10-27 hook
// audit's "floor falls, nobody uses it"). It is a VERB now: a CRACKED SUPPORT PILLAR stands under something the tower still holds up.
// STRIKE IT (any blow) and the collapse is TOLD - a creak, grit trickling off its head, the crack running up it in red (SUP.tell s) - and
// then what it held COMES DOWN YOUR WAY:
//   'bridge'  a column topples across a gap: footing laid where there was none (spans)            - the Alchemy Lab (REQUIRED)
//   'ramp'    a bookcase goes over into a stair of shelves: a shortcut up the room (spans)          - the Library (TEACH SAFE, optional)
//   'crush'   the crown's broken masonry comes down on whatever stands under it (crush box)         - the Open Crown (remix, a fight tool)
//   'dark'    rubble plugs the stairwell under you: HIS RISING DARK HOLDS a while (dark s)          - the Spiral Stair (remix, pressure)
//   'floor'   the floor you stand on goes, and you drop after him (clear)                           - THE CHASE (the boss's exam, src/archmage-chase.js)
// One blow, one collapse; a death puts the tower back (supportsReset). A pillar that is not ARMED (s.arm and !s.armed: the chase's floor
// before he is through it) rings off - nothing it holds is ready to go. Every pillar GLOWS FAINTLY as you come near (SUP.glowR, A6) and its
// glint + stall nudge are src/stuck-spots.js rows (done: ['ftsupport', col, row, 'down']); its sign stands at the point of use.
// THE REACH MODEL is told the same (tower-ascent.js L.reachSpans): a span a blow lays is footing to the full fill, never to the plain one.
import { paintPillar, paintStump, paintResting, paintFall } from './redraw/tower_chase.js';
export const SUP = { tell: 1.1, glowR: 96, w: 12, crushDmg: 140, dark: 8, fallT: 0.45 };
export const supportBox = s => ({ l: s.x - SUP.w / 2 - 2, r: s.x + SUP.w / 2 + 2, t: s.y - s.h * 16, b: s.y });
/* every pillar whole again, nothing it held laid (the caller puts the tiles back from the built grid) */
export function supportsReset(L, restore) {
  for (const s of L.ftSupports || []) {
    if (s.st === 'down' && restore) { for (const [x0, x1, row] of s.spans || []) for (let x = x0; x <= x1; x++) restore(x, row); for (const [x0, x1, y0, y1] of s.clear || []) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) restore(x, y); }
    s.st = 'whole'; s.t = 0; s.down = false; s.armed = !s.arm; s.fx = null; s.ring = 0; s.near = 0; }
}
/* ONE STEP. c: { T, strike() -> the hero's blow box or null, set(x, y, t), resolve(), foes() -> live foes, hurt(e, dmg), holdDark(s), say(x, y, s, col),
   callout(s), sound(k), shake(n), dust(x, y, n), burst(x, y, n, cols) }. Returns the pillars that came down this frame. */
export function supportsUpdate(L, P, dt, c) {
  const out = [], hb = c.strike ? c.strike() : null;
  for (const s of L.ftSupports || []) {
    s.ring = Math.max(0, (s.ring || 0) - dt);
    s.near = !P.dead && s.st === 'whole' ? Math.max(0, 1 - Math.hypot(P.x - s.x, (P.y - 12) - (s.y - s.h * 8)) / SUP.glowR) : 0;
    if (s.fx) { s.fx.t += dt; if (s.fx.t > SUP.fallT + 0.6) s.fx = null; }
    if (s.st === 'whole' && hb && !s.struck && overlaps(hb, supportBox(s))) {
      s.struck = true;   /* (one blow is one strike: cleared when the swing ends, below) */
      if (s.arm && !s.armed) { s.ring = 0.4; c.sound('clank'); c.say(s.x, s.y - s.h * 16 - 8, s.hold || 'IT HOLDS', '#bce8fa'); continue; }
      s.st = 'tell'; s.t = SUP.tell; c.sound('crack'); c.shake(2); c.dust(s.x, s.y - s.h * 16, 6); c.say(s.x, s.y - s.h * 16 - 8, s.tellSay || 'IT GIVES', '#ff9a5c');
    }
    if (!hb) s.struck = false;
    if (s.st === 'tell') { s.t -= dt; if (Math.random() < dt * 14) c.dust(s.x + (Math.random() - 0.5) * 10, s.y - s.h * 16, 1);
      if (s.t <= 0) { fall(L, s, c); out.push(s); } }
  }
  return out;
}
function fall(L, s, c) {
  const T = c.T; s.st = 'down'; s.down = true; s.fx = { t: 0 };
  for (const [x0, x1, row] of s.spans || []) for (let x = x0; x <= x1; x++) c.set(x, row, T.ONEWAY);
  for (const [x0, x1, y0, y1] of s.clear || []) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) c.set(x, y, T.AIR);
  c.resolve();
  c.sound('stone'); c.sound('rumble'); c.shake(s.kind === 'floor' ? 7 : 5);
  for (const [x0, x1, row] of s.spans || []) for (let x = x0; x <= x1; x += 2) c.burst(x * 16 + 8, row * 16 + 4, 3, ['#8a8e9c', '#5c6070', '#b8b4a8']);
  if (s.crush) { const [x0, x1, y0, y1] = s.crush; let n = 0;
    for (const e of c.foes()) if (e.x > x0 * 16 && e.x < (x1 + 1) * 16 && e.y > y0 * 16 && e.y <= (y1 + 1) * 16 + 2) { c.hurt(e, SUP.crushDmg); n++; }
    for (let x = x0; x <= x1; x += 2) c.burst(x * 16 + 8, (y1 + 1) * 16 - 4, 3, ['#8a8e9c', '#5c6070', '#b8b4a8']); s.crushed = n; }
  if (s.dark && c.holdDark) c.holdDark(SUP.dark);
  if (s.say) c.callout(s.say);
}
const overlaps = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
/* ---- drawing: src/redraw/tower_chase.js paints it (claude/fallingtower3art) ----
   A cracked stone pillar: courses, flutes, an iron strap, a skull cut in the shaft, a crack up its face; GLOWING faintly gold as you come near (whole) and, when it is the one
   to strike, burning with a chevron over it; in its tell the crack runs red from the foot and it shakes; down, a broken stump and rubble. What it dropped stays where it fell:
   the bookcase's shelves, the column across the poison, the crown's masonry, the stairwell's plug. */
const spanBox = s => { let x0 = s.x - 12, x1 = s.x + 12, y0 = s.y - s.h * 16 - 20, y1 = s.y + 4;
  for (const [a, b, r] of s.spans || []) { x0 = Math.min(x0, a * 16); x1 = Math.max(x1, (b + 1) * 16); y0 = Math.min(y0, r * 16 - 90); y1 = Math.max(y1, r * 16 + 20); }
  if (s.crush) { x0 = Math.min(x0, s.crush[0] * 16); x1 = Math.max(x1, (s.crush[1] + 1) * 16); y0 = Math.min(y0, s.crush[2] * 16 - 40); y1 = Math.max(y1, (s.crush[3] + 1) * 16); }
  for (const [a, b, c, d] of s.clear || []) { x0 = Math.min(x0, a * 16); x1 = Math.max(x1, (b + 1) * 16); y0 = Math.min(y0, c * 16); y1 = Math.max(y1, (d + 1) * 16 + 300); }
  return [x0, x1, y0, y1]; };
export function drawSupports(g, L, cx, cy, time, VW, VH) {
  for (const s of L.ftSupports || []) {
    const x = Math.round(s.x - cx), y = Math.round(s.y - cy), h = s.h * 16, [bx0, bx1, by0, by1] = spanBox(s);
    if (bx1 - cx < -20 || bx0 - cx > VW + 20 || by1 - cy < -20 || by0 - cy > VH + 20) continue;
    if (s.st === 'down') { paintResting(g, s, cx, cy, time); if (s.kind !== 'floor') paintStump(g, x, y, s.fx ? s.fx.t : null); }   /* (a chase floor's pillar went down WITH its floor) */
    else {
      if (s.st === 'whole' && s.near > 0) ghost(g, s, cx, cy, s.near);   /* what it will become, dotted in, as you come near (A6) */
      paintPillar(g, x, y, h, { st: s.st, k: s.st === 'tell' ? 1 - s.t / SUP.tell : 0, time, near: s.near, arm: s.arm, armed: s.armed, ring: s.ring, kind: s.kind });
    }
    if (s.fx && s.fx.t < SUP.fallT + 0.9) paintFall(g, s, cx, cy, s.fx.t, SUP.fallT);
  }
}
/* the shape of what a blow would lay, dotted: the spans' boards, the crush box's floor line (a pale gold the stone would not wear) */
function ghost(g, s, cx, cy, near) {
  g.fillStyle = '#ffe6a0'; g.globalAlpha = 0.45 * Math.min(1, near * 2) * (0.6 + 0.4 * Math.abs(Math.sin(performanceTime() * 3)));
  for (const [x0, x1, row] of s.spans || []) { const px0 = Math.round(x0 * 16 - cx), w = (x1 - x0 + 1) * 16, py = Math.round(row * 16 - cy); for (let i = 0; i < w; i += 4) { g.fillRect(px0 + i, py, 2, 1); g.fillRect(px0 + i + 2, py + 15, 2, 1); } g.fillRect(px0, py, 1, 16); g.fillRect(px0 + w - 1, py, 1, 16); }
  if (s.crush) { const [x0, x1, , y1] = s.crush, py = Math.round((y1 + 1) * 16 - cy); for (let i = x0 * 16; i < (x1 + 1) * 16; i += 6) g.fillRect(Math.round(i - cx), py - 1, 3, 1); }
  g.globalAlpha = 1;
}
const performanceTime = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
