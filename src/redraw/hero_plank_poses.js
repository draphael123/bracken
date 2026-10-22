// hero_plank_poses.js - EVERY HERO CARRIES, LAYS AND THROWS A PLANK (claude/fenroad2art; the hooks were src/fen-planks.js P.plankPose = 'carry' | 'lay' | 'throw', which nothing drew).
// A hero's own baked frames are the body: the nine kits share a 34 x 56 canvas with the feet at (ax, ay) and the body within 10..19 across, the weapon in front of x = 20 (and the
// Berserker's off axe behind x = 10). The weapon and the lead arm are cleared off a copy of the hero's idle / run / crouch frame, and the pose is drawn over it: the hero's OWN sleeve
// and glove colours (HANDS below) reaching to a hand-adzed plank (the same board the bundle holds, FPA). So a Paladin carries it in steel gauntlets and a Pyromancer in red sleeves.
//   CARRY  the plank held up over the head in both hands, a slight rise to the front; standing (idle) and with the run's own legs (the walk is slower: THROW_KIND.plank)
//   LAY    crouched: frame 0 the plank held low and angled out in front, frame 1 set down flat on the boards with the hands still on its near end
//   THROW  the heave: frame 0 both arms flung up and forward, open-handed (the plank has left), frame 1 the follow-through, arms coming down
// poseFrame(K, hero, pose, i) -> the canvas;  install(K, hero) attaches K.R/L/white.plankCarry (idle + run 0-5), plankLay (2), plankThrow (2) once;  keyFor(P, K) -> [key, frame] | null
import { canvas, flipX, whiten } from '../px.js';

const HANDS = {   /* the hero's own arm colours: [sleeve, sleeve shade, glove] */
  knight: ['#7c8fb4', '#4f5f86', '#d4dae2'], warden: ['#2f5a3a', '#1e3c27', '#8a6a3a'], pyro: ['#b8442c', '#7a2a1c', '#e8c8a0'], paladin: ['#c8d0dc', '#8a94a8', '#e8c860'],
  pirate: ['#e6dec8', '#a8a088', '#d8a878'], reaper: ['#7a1c28', '#4a1018', '#2a1a20'], geomancer: ['#55565c', '#34353a', '#9a9a86'], berserker: ['#d88a58', '#a0623a', '#c9a672'], ranger: ['#7a4c2c', '#4e301c', '#b08050'],
};
const CLEAR = { front: 20, frontLow: 23, back: { berserker: 10 } };   /* x from which the weapon is cleared (front); rows within 5 of the feet keep the stride up to frontLow */
const FRESH = ['#6a4c2c', '#8c6a40', '#b08a5a', '#c9a672', '#e0c490'];
const cache = new WeakMap();

function line(g, x0, y0, x1, y1, c, th = 1) {   /* a crisp pixel line, th thick */
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx - dy; g.fillStyle = c;
  for (;;) { g.fillRect(x0, y0, th, th); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } }
}
/* a plank (len px long, 3 thick) centred at (cx, cy), tilted ang (radians, + = front end down), drawn as a pixel line stack: lit top, body, shade, end-grain at the front, hemp loop at the back */
function plank(g, cx, cy, len, ang) {
  const ux = Math.cos(ang), uy = Math.sin(ang), hx = ux * len / 2, hy = uy * len / 2;
  line(g, cx - hx, cy - hy + 2, cx + hx, cy + hy + 2, FRESH[0], 1); line(g, cx - hx, cy - hy + 1, cx + hx, cy + hy + 1, FRESH[1], 1); line(g, cx - hx, cy - hy, cx + hx, cy + hy, FRESH[3], 1); line(g, cx - hx + 2, cy - hy - 1, cx + hx - 2, cy + hy - 1, FRESH[4], 1);
  g.fillStyle = FRESH[4]; g.fillRect(Math.round(cx + hx), Math.round(cy + hy) - 1, 1, 3); g.fillStyle = FRESH[2]; g.fillRect(Math.round(cx + hx) - 1, Math.round(cy + hy), 1, 1);   /* end-grain */
  g.fillStyle = '#c9b27c'; g.fillRect(Math.round(cx - hx) + 2, Math.round(cy - hy) - 1, 2, 4); g.fillStyle = '#8f2f28'; g.fillRect(Math.round(cx - hx) + 1, Math.round(cy - hy) + 3, 1, 2);   /* hemp loop + red tag */
  g.fillStyle = '#f4eed8'; for (const k of [0.3, 0.7]) g.fillRect(Math.round(cx - hx + ux * len * k), Math.round(cy - hy + uy * len * k), 1, 1);   /* nail heads */
}
const arm = (g, hero, sx, sy, hx, hy, back) => { const H = HANDS[hero]; line(g, sx, sy, hx, hy, back ? H[1] : H[0], 2); g.fillStyle = H[2]; g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 2, 2); };

/* a hero's frame with the weapon and lead arm cleared: a copy of K.R[key][i] */
function cleared(K, hero, key, i) {
  const src = K.R[key] ? (Array.isArray(K.R[key]) ? K.R[key][i % K.R[key].length] : K.R[key]) : K.R.idle[0], [c, g] = canvas(src.width, src.height); g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0);
  g.clearRect(CLEAR.front, 0, src.width - CLEAR.front, src.height - 5); g.clearRect(CLEAR.frontLow, src.height - 5, src.width, 5); if (CLEAR.back[hero]) g.clearRect(0, 0, CLEAR.back[hero], src.height);
  /* the top of what is left (the head / hat): where the plank goes */
  const d = g.getImageData(0, 0, src.width, src.height).data; let top = src.height; for (let y = 0; y < src.height && top === src.height; y++) for (let x = 8; x < 22; x++) if (d[(y * src.width + x) * 4 + 3] > 0) { top = y; break; }
  return { c, g, top };
}
const snap = (c, g) => { const img = g.getImageData(0, 0, c.width, c.height), d = img.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; g.putImageData(img, 0, 0); return c; };
function build(K, hero, pose, i) {
  const ax = K.ax, ay = K.ay, sy = ay - 11;   /* shoulders: 11 above the feet (a crouch is lower: 8) */
  if (pose === 'carry') { const base = i === 0 ? ['idle', 0] : ['run', i - 1], { c, g, top } = cleared(K, hero, base[0], base[1]); const py = Math.max(5, top - 4), bob = i > 0 && (i === 2 || i === 5) ? 1 : 0;
    arm(g, hero, ax - 3, sy, ax - 5, py + 2, true); arm(g, hero, ax + 2, sy, ax + 5, py + 1 - 0, false); plank(g, ax + 1, py + bob, 30, -0.1);
    g.fillStyle = HANDS[hero][2]; g.fillRect(ax - 6, py + 1 + bob, 2, 2); g.fillRect(ax + 4, py + 0 + bob, 2, 2); return snap(c, g); }
  if (pose === 'lay') { const { c, g, top } = cleared(K, hero, 'crouch', 0), sh = ay - 8;
    if (i === 0) { arm(g, hero, ax - 1, sh, ax + 6, ay - 7, true); arm(g, hero, ax + 3, sh, ax + 9, ay - 5, false); plank(g, ax + 11, ay - 7, 26, 0.55); }
    else { arm(g, hero, ax - 1, sh, ax + 5, ay - 3, true); arm(g, hero, ax + 3, sh, ax + 7, ay - 2, false); g.fillStyle = FRESH[3]; g.fillRect(ax + 6, ay - 1, 11, 1); void top; }
    return snap(c, g); }
  /* throw */
  { const { c, g } = cleared(K, hero, i === 0 ? 'idle' : 'run', i === 0 ? 0 : 3);
    if (i === 0) { arm(g, hero, ax - 3, sy, ax + 6, sy - 11, true); arm(g, hero, ax + 2, sy, ax + 10, sy - 9, false); g.fillStyle = '#ffffff'; g.globalAlpha = 0.6; g.fillRect(ax + 11, sy - 10, 2, 1); g.fillRect(ax + 12, sy - 8, 2, 1); g.globalAlpha = 1; }
    else { arm(g, hero, ax - 3, sy, ax + 7, sy - 3, true); arm(g, hero, ax + 2, sy, ax + 11, sy - 1, false); }
    return snap(c, g); }
}
export function poseFrame(K, hero, pose, i) {
  let m = cache.get(K); if (!m) cache.set(K, m = {}); const k = pose + i; if (!m[k]) m[k] = build(K, hero, pose, i); return m[k];
}
const N = { plankCarry: 7, plankLay: 2, plankThrow: 2 }, POSE = { plankCarry: 'carry', plankLay: 'lay', plankThrow: 'throw' };
export function install(K, hero) {
  if (K.__plank === hero) return K; K.__plank = hero;
  for (const key of Object.keys(N)) { const R = [], L = [], W = [], WL = []; for (let i = 0; i < N[key]; i++) { const f = poseFrame(K, hero, POSE[key], i), w = whiten(f); R.push(f); L.push(flipX(f)); W.push(w); WL.push(flipX(w)); }
    K.R[key] = R; K.L[key] = L; if (K.white) { K.white.R[key] = W; K.white.L[key] = WL; } }
  return K;
}
/* the pose the draw should show for this hero now: carry (idle or the run's legs), lay, throw - or null (not carrying / in the water) */
export function keyFor(P, K) {
  if (!P.plankPose || P.swim) return null;
  if (P.plankPose === 'lay') return ['plankLay', P.plankPoseT > 0.17 ? 0 : 1];
  if (P.plankPose === 'throw') return ['plankThrow', P.plankPoseT > 0.12 ? 0 : 1];
  if (P.plankPose === 'carry') return ['plankCarry', P.ground && Math.abs(P.vx) > 10 ? 1 + (Math.floor(P.anim * 13) % 6) : 0];
  return null;
}
