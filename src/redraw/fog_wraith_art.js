// fog_wraith_art.js - THE FOG WRAITH, drawn (claude/towpath2art; the greybox was src/fog-wraith.js drawWraith). A shape of the fog on the low water: a peaked hood over a dark hollow
// and two pale eyes, long thin arms that hang past the hem, a skirt of cloth that thins to wisps - no legs, it drifts. Two looks: FOG (translucent, soft-edged, dithered at its rim,
// eyes faint: a blade passes through it) and HARDENED in a light (steel-blue cloth with a dark outline and a lit rim, folds, long fingers, the eyes burning pale cyan).
// Frames, each its own (B16): DRIFT A / B (the arms sway), SMOTHER windup (leaning toward the flame, hood bowed, the near hand reaching with fingers spread, the far arm drawn back
// to gather), SMOTHER release (the fist closing on the flame, a puff of smoke and ember sparks falling), RECOIL (flung back, arms up, edges flickering), SHIELDED recoil
// (the flame's bright arc, its arm scorched), DEATH x4 (it comes apart upward in strips, to two glints), and the CHILL on the hero (frost wisps and a shiver).
// Pure drawing on a 2d context g at (x, y) = its centre-bottom on screen.
const R = Math.round;
const rc = (g, x, y, w, h) => g.fillRect(R(x), R(y), R(w), R(h));
const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
const SOFT = [186, 202, 214], HARD = [92, 116, 136], HARD_L = [196, 222, 236], HARD_D = [20, 30, 40];
/* the cloth's half-width by row (0 = the hood's tip, down to 25 = the thinning tail) */
const HW = [1, 2, 3, 4, 4, 4, 3.5, 5, 6.5, 7, 7, 6.8, 6.5, 6.2, 6, 5.8, 5.5, 5.2, 4.8, 4.3, 3.8, 3.2, 2.6, 2, 1.4, 0.8];
const ROWS = HW.length;

/* the cloth: rows from the hood down; lean shifts the upper rows toward f, bow drops the hood */
function cloth(g, x, y, o) {
  const { k, f, lean = 0, bow = 0, alpha = 1, wob = 0, tail = 1, anim = 0 } = o;
  const top = y - 24 + bow, body = k > 0.5 ? HARD : SOFT;
  for (let r = 0; r < ROWS; r++) {
    const t = 1 - r / (ROWS - 1), sx = lean * t * t + Math.sin(anim * 1.6 + r * 0.45) * (r > 14 ? 0.9 + (r - 14) * 0.12 : 0.2) * tail + wob * t, hw = HW[r] * (r > 17 ? 0.9 + 0.1 * tail : 1), yy = top + r + (r > 6 ? -bow * 0.5 : 0);
    const a = (0.3 + 0.5 * k) * alpha * (r > 17 ? 1 - (r - 17) / 12 : 1);
    const x0 = x + sx - hw, w = hw * 2;
    if (k > 0.5) { g.fillStyle = rgba(body, a); rc(g, x0, yy, w, 1);
      const shade = f > 0 ? 1 : -1;   /* lit rim on the side it faces, dark on the far side */
      g.fillStyle = rgba(HARD_L, a * 0.9); rc(g, shade > 0 ? x0 + w - 1.5 : x0, yy, 1.5, 1);
      g.fillStyle = rgba(HARD_D, a * 0.95); rc(g, shade > 0 ? x0 : x0 + w - 1, yy, 1, 1);
      if (r > 7 && r % 5 === 0) { g.fillStyle = rgba(HARD_D, a * 0.5); rc(g, x + sx - hw * 0.4 + (r % 2) * 3, yy, 1, 3); }   /* a fold */
      if (r === 0 || r === ROWS - 1) { g.fillStyle = rgba(HARD_D, a); rc(g, x0 - 0.5, yy, w + 1, 1); }
    } else { g.fillStyle = rgba(body, a); rc(g, x0 + (r % 2 ? 0.5 : 0), yy, w - (r % 2 ? 1 : 0), 1);
      g.fillStyle = rgba(body, a * 0.45); rc(g, x0 - 1, yy, 1, 1); rc(g, x0 + w, yy, 1, 1);   /* (dithered, the rim fades) */
      if (r % 3 === 0) { g.fillStyle = rgba([226, 236, 244], a * 0.35); rc(g, x + sx - hw * 0.5, yy, hw * 0.6, 1); } }
  }
  /* the hood's hollow and its eyes */
  const hx = x + lean + (f > 0 ? 0.5 : -0.5), hy = top + 4;
  g.fillStyle = k > 0.5 ? rgba([8, 14, 20], 0.9 * alpha) : rgba([60, 76, 90], 0.45 * alpha); rc(g, hx - 2.5 + (f > 0 ? 1 : 0), hy, 5, 5); rc(g, hx - 1.5 + (f > 0 ? 1 : 0), hy + 5, 3, 1);
  const eye = k > 0.5 ? rgba([190, 242, 255], 1 * alpha) : rgba([150, 174, 192], 0.55 * alpha);
  g.fillStyle = eye; rc(g, hx - 2 + (f > 0 ? 2 : 0), hy + 1.5, 1.2, 1.4); rc(g, hx + 1 + (f > 0 ? 1 : 0), hy + 1.5, 1.2, 1.4);
  if (k > 0.5) { g.fillStyle = rgba([150, 226, 255], 0.2 * alpha); g.beginPath(); g.arc(R(hx + (f > 0 ? 1.5 : -0.5)), R(hy + 2.5), 5, 0, Math.PI * 2); g.fill(); }
}
/* an arm: a polyline of 2px segments, the hand's fingers at the end (open: spread claws; closed: a fist) */
function arm(g, pts, k, alpha, hand) {
  const body = k > 0.5 ? HARD : SOFT, a = (0.32 + 0.55 * k) * alpha;
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(2, R(Math.hypot(x1 - x0, y1 - y0)));
    for (let s = 0; s <= n; s++) { const x = x0 + (x1 - x0) * s / n, y = y0 + (y1 - y0) * s / n, th = i === 0 ? 2 : 1.5;
      g.fillStyle = rgba(body, a); rc(g, x - th / 2, y - th / 2, th, th); if (k > 0.5 && s % 2 === 0) { g.fillStyle = rgba(HARD_D, a * 0.8); rc(g, x - th / 2, y + th / 2 - 0.5, th, 0.7); } } }
  const [hx, hy] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], dx = Math.sign(hx - px) || 1, dy = Math.sign(hy - py);
  if (hand === 'fist') { g.fillStyle = rgba(k > 0.5 ? HARD_L : SOFT, a); rc(g, hx - 1.5, hy - 1.5, 3, 3); g.fillStyle = rgba(HARD_D, a * 0.7); rc(g, hx - 1.5, hy + 1, 3, 0.8); }
  else { g.fillStyle = rgba(k > 0.5 ? HARD_L : SOFT, a); for (const s of [-1.6, 0, 1.6]) { if (Math.abs(dx) >= Math.abs(dy)) rc(g, hx, hy + s - 0.5, dx * 3.5, 1); else rc(g, hx + s - 0.5, hy, 1, dy * 3.5); } }
}
/* wisps off the hem and the hands */
function wisps(g, x, y, time, k, alpha, n = 4, spread = 6) { for (let i = 0; i < n; i++) { const u = (time * 0.5 + i / n) % 1; g.fillStyle = rgba(SOFT, (0.34 + 0.2 * k) * alpha * (1 - u)); rc(g, x - spread / 2 + Math.sin(time * 2 + i * 1.9) * spread, y - 2 + u * 9, 2, 2); } }
/* a puff / spark helpers for the smother */
function smoke(g, x, y, u, col = [150, 160, 168]) { for (let i = 0; i < 4; i++) { const a = (1 - u) * 0.5; g.fillStyle = rgba(col, a); rc(g, x - 2 + i * 1.4 + Math.sin(i * 2) * 2, y - u * 10 - i * 1.5, 3 - i * 0.4, 2); } }
function embers(g, x, y, u) { for (let i = 0; i < 5; i++) { g.fillStyle = rgba(i % 2 ? [255, 180, 70] : [255, 120, 40], (1 - u) * 0.9); rc(g, x - 3 + i * 1.6 + Math.sin(i * 3.1) * 2, y + u * (6 + i * 2), 1, 1); } }

/* ============ THE WRAITH ============ */
export function drawWraith(g, e, x, y, time) {
  const k = e.hard || 0, f = e.face || 1, anim = e.anim || 0, bob = Math.sin(anim * 2.2) * 1.5, yy = R(y + bob);
  const sm = e.mode === 'smotherTell', rel = (e.rel || 0) > 0, rec = (e.recoil || 0) > 0 && !sm && !rel, shield = rec && e.shielded;
  const swa = Math.sin(anim * 2.2), swb = Math.sin(anim * 1.7 + 1.2);
  g.save();
  if (sm) {   /* THE SMOTHER'S WINDUP: leaning toward the flame, the hood bowed, the near hand reaching (fingers spread), the far arm drawn back to gather */
    const p = Math.max(0, Math.min(1, 1 - Math.max(0, e.modeT) / 0.8)), reach = 7 + 11 * p;
    cloth(g, x, yy, { k: Math.max(k, 0.25), f, lean: f * (1 + 3 * p), bow: R(2 * p), anim });
    arm(g, [[x + f * 4, yy - 15], [x + f * (4 + reach * 0.5), yy - 15 - 1 + p * 2], [x + f * (4 + reach), yy - 14 + p]], k, 1, 'open');   /* the long reaching arm */
    arm(g, [[x - f * 4, yy - 15], [x - f * (7 + 2 * p), yy - 19 - 3 * p], [x - f * (5 + 2 * p), yy - 25 - 4 * p]], k, 1, 'open');   /* the far arm raised, gathering */
    for (let i = 0; i < 4; i++) { g.fillStyle = rgba(SOFT, 0.45 * (1 - p * 0.3)); rc(g, x - f * (8 + i * 3), yy - 12 + i * 2 + Math.sin(time * 6 + i) * 1, 2, 1); }   /* mist streaming back */
  } else if (rel) {   /* THE RELEASE: the arm at full stretch, the hand a fist closed on the flame, smoke and ember sparks */
    const u = 1 - Math.max(0, e.rel) / 0.3;
    cloth(g, x, yy, { k: Math.max(k, 0.4), f, lean: f * 4.5, bow: 3, anim });
    arm(g, [[x + f * 4, yy - 15], [x + f * 12, yy - 15], [x + f * 20, yy - 14]], k, 1, 'fist');
    arm(g, [[x - f * 4, yy - 15], [x - f * 8, yy - 12], [x - f * 9, yy - 6]], k, 1, 'open');
    smoke(g, x + f * 20, yy - 16, u); embers(g, x + f * 20, yy - 14, u);
    g.fillStyle = rgba([255, 230, 160], 0.6 * (1 - u)); rc(g, x + f * 20 - 1, yy - 15, 3, 3);
  } else if (rec) {   /* RECOIL: flung back, arms thrown up, the cloth rippling and flickering; shielded: the flame's arc burns its arm */
    const u = Math.max(0, 1 - Math.max(0, e.recoil) / (e.recoil0 || 0.6)), fl = Math.floor(time * 18) % 2;
    cloth(g, x, yy, { k: shield ? Math.max(k, 0.6) : k, f, lean: -f * (2 + 2 * (1 - u)), bow: 0, alpha: fl ? 0.7 : 1, anim, wob: -f * 1 });
    arm(g, [[x + f * 4, yy - 15], [x + f * 7, yy - 20], [x + f * 6, yy - 27]], k, 1, 'open'); arm(g, [[x - f * 4, yy - 15], [x - f * 9, yy - 18], [x - f * 11, yy - 24]], k, 1, 'open');
    if (shield) { g.fillStyle = rgba([255, 226, 150], 0.65 * (1 - u)); for (let i = 0; i < 6; i++) { const a = -1.1 + i * 0.44; rc(g, x + f * (14 + Math.cos(a) * 7), yy - 15 + Math.sin(a) * 11, 2, 2); }
      g.fillStyle = rgba([255, 150, 60], 0.9 * (1 - u)); rc(g, x + f * 7, yy - 22, 2, 2); rc(g, x + f * 6, yy - 26, 1, 1); }   /* the shield of flame, and the scorch on its hand */
  } else {   /* DRIFT A / B: the arms hang long and sway, a hem of wisps */
    const A = swa > 0;
    cloth(g, x, yy, { k, f, lean: swa * 0.8, anim, wob: swa * 0.5 });
    arm(g, [[x + 5, yy - 15], [x + 7 + swb * 1.5, yy - 9], [x + 6 + swb * 2.5, yy - 2 + (A ? 1 : 0)]], k, 1, 'open');
    arm(g, [[x - 5, yy - 15], [x - 7 - swa * 1.5, yy - 8], [x - 6 - swa * 2.5, yy - 1 + (A ? 0 : 1)]], k, 1, 'open');
    wisps(g, x, yy, time, k, 1);
  }
  g.restore();
}
/* THE DEATH: it comes apart upward - strips of its body lift off, thin and fade, to two glints (u 0..1) */
export function drawDeath(g, x, y, f, u) {
  const k = 1;
  for (let r = 0; r < ROWS; r++) { const lift = u * (3 + r * 0.9) * (r % 2 ? 1 : 0.6) + 0, a = (1 - u * 1.05) * (0.8), hw = HW[r] * (1 - u * 0.4), sx = Math.sin(r * 1.7) * u * 5;
    if (a <= 0.02 || (r % 3 === 1 && u > 0.5)) continue; g.fillStyle = rgba(r % 4 === 0 ? HARD_L : HARD, a); rc(g, x + sx - hw, y - 24 + r - lift, hw * 2 * (1 - u * 0.5), 1);
    if (r % 5 === 0) { g.fillStyle = rgba(HARD_D, a * 0.8); rc(g, x + sx - hw, y - 24 + r - lift, 1, 1); } }
  for (let i = 0; i < 6; i++) { g.fillStyle = rgba(SOFT, (1 - u) * 0.6); rc(g, x - 6 + i * 2.4 + Math.sin(i * 2.3) * 2, y - 8 - u * (10 + i * 5), 2, 1.5); }
  if (u > 0.4) { g.fillStyle = rgba([190, 242, 255], (1 - u) * 1.3); rc(g, x - 2 + (f > 0 ? 2 : 0), y - 20 - u * 18, 1.2, 1.4); rc(g, x + 1 + (f > 0 ? 1 : 0), y - 20 - u * 18, 1.2, 1.4); }
}
/* THE CHILL on the hero: frost-blue wisps spiral off the body, a shiver of the cloak's edge, three flakes (k 1..0 over its life) */
export function drawChill(g, x, y, k, time) {
  for (let i = 0; i < 9; i++) { const a = time * 5 + i * 0.7, rr = 8 + (i % 3) * 3; g.fillStyle = rgba(i % 2 ? [214, 236, 248] : [150, 190, 214], k * 0.7); rc(g, x + Math.cos(a) * rr * 0.8, y - 14 + Math.sin(a * 1.3) * 10 - (1 - k) * 8, 2, 2); }
  for (let i = 0; i < 3; i++) { const fx = x - 8 + i * 8 + Math.sin(time * 9 + i) * 1, fy = y - 24 + ((time * 22 + i * 7) % 18); g.fillStyle = rgba([240, 250, 255], k * 0.85); rc(g, fx, fy - 1, 1, 3); rc(g, fx - 1, fy, 3, 1); }
  g.fillStyle = rgba([120, 170, 210], k * 0.2); g.beginPath(); g.ellipse(R(x), R(y - 12), 11, 15, 0, 0, Math.PI * 2); g.fill();
}
