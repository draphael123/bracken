// src/ki-art.js - THE KNOCK-INTO ART PASS + ARMED-ONLY TOUCH (claude/kifollow, scratch/brief-combat2.md '!! 10-11 16:35 KNOCK-INTO BUILT').
// Pure canvas / pose helpers, no DOM state: main.js passes the 2d context and the screen position. Every state here is DRAWN BEFORE IT HURTS
// (design-standard B16: each foe ability its own pose; A3: a state that changes is shown where the player stands).
//
//   1. SPINES   THORNED elites and the Spike Goblin: drawn bone / iron SPIKES (triangles, outlined) on a per-body layout, keyed 0 / 1 / 2 / full
//               plus a FIRE frame (flat out, white hot) - `drawSpinesK`. The old pixel lines (anti-plunge.js drawSpines) stay as the fallback.
//   2. ARMED    urchin, jelly, grub, marshlight: they hurt on touch ONLY while visibly armed (e.arK reaches 1). `armTick` ramps it, `drawArmed`
//               draws each state: the urchin's needles rise, the jelly's tentacles fan and spark, the grub's acid beads and flares, the marshlight's
//               corona. The ramp is the TELL (a partial state never bites); a fully drawn state is the only one that does.
//   3. POSES    the spitter's HOP (crouch, stretch, land) and OFF BALANCE wobble; a small foe's TUMBLE (spin trail, landing dizzy); a guarded
//               foe's SLIDE (braced lean, scraping feet, the guard flashing) - `kiPose` into poseOf, `drawKiExtras` over the sprite.
//   4. ENTRY FX one burst per hazard kind (spikes impale, fire catches, mire / poison splash, water splash, lava sizzle, the press pins, sand takes it).
//
// The numbers live in KA so a tune is one table.
export const KA = {
  arm: {
    urchin: { up: 0.28, down: 0.5 },       /* the needles rise in 0.28 s when a swimmer is within reach; fall in 0.5 s */
    grub: { up: 0.32, down: 0.55, near: { dx: 40, dy: 22 } },
    jelly: { lo: 0.46, hi: 0.60 },          /* e.alpha IS its clock: flared from 0.46 (tentacles stir) to 0.60 (fully fanned = armed) */
    marshlight: { tell: 0.6 },              /* flareTell lasts this long; armed only in the flare itself */
  },
  tumble: { trail: 3 },
  hop: { crouch: 0.22, land: 0.2 },
};
export const ARMED = new Set(['urchin', 'jelly', 'grub', 'marshlight']);
export const armed = e => !!e && (e.arK || 0) >= 1;
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
/* ramp e.arK toward `want` (a boolean): up over `up` s, down over `down` s */
export function armTick(e, dt, want, up, down) {
  const k = e.arK || 0; e.arK = clamp01(k + (want ? dt / up : -dt / down));
  return k < 1 && e.arK >= 1;   /* true on the frame it arms (the caller's chime) */
}
/* each kind's own arming, called from its update */
export function armUpdate(e, dt, P) {
  const A = KA.arm[e.t]; if (!A) return false;
  if (e.t === 'urchin') return armTick(e, dt, !!e.bristle, A.up, A.down);
  if (e.t === 'grub') { const near = P && !P.dead && Math.abs(P.x - e.x) < A.near.dx && Math.abs((P.y - 8) - e.y) < A.near.dy; return armTick(e, dt, near || e.mode === 'spit', A.up, A.down); }
  if (e.t === 'jelly') { const was = e.arK || 0; e.arK = clamp01(((e.alpha === undefined ? 0 : e.alpha) - A.lo) / (A.hi - A.lo)); return was < 1 && e.arK >= 1; }
  if (e.t === 'marshlight') { const was = e.arK || 0; e.arK = e.mode === 'flare' ? 1 : e.mode === 'flareTell' ? clamp01(1 - Math.max(0, e.modeT) / A.tell) * 0.95 : 0; return was < 1 && e.arK >= 1; }
  return false;
}

// ---------------------------------------------------------------- 1. SPINES
/* a pixel spike: from (bx, by) out along `ang` (radians), `len` long, `wid` wide at the root, tapering. Outline underneath, body, bright tip */
function spike(g, bx, by, ang, len, wid, col, tip, out) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  for (let pass = 0; pass < 2; pass++) for (let s = 0; s < len; s++) {
    const w = Math.max(1, Math.round(wid * (1 - s / len))), cx = bx + ca * s, cy = by + sa * s;
    for (let t = -((w - 1) / 2) - (pass ? 0 : 1); t <= (w - 1) / 2 + (pass ? 0 : 1); t++) {
      g.fillStyle = pass ? (s >= len - 2 ? tip : col) : out;
      g.fillRect(Math.round(cx - sa * t), Math.round(cy + ca * t), 1, 1); } }
}
/* PER-BODY LAYOUTS. top: spines along the ridge of head and shoulders; back: down the back (away from where it faces); front: through the guard / chest.
   len / wid in px at full; col / tip the spine, out its outline. THORNED is an affix on these bodies (elite-kit); 'thorn' is the Spike Goblin's iron back. */
export const SPINE_BODY = {
  husk:      { top: 5, back: 2, front: 0, len: 5, wid: 2, col: '#cfc8a8', tip: '#fffbe8', out: '#2a2418', hot: '#ffd36b' },
  thorn:     { top: 4, back: 3, front: 0, len: 6, wid: 2, col: '#6a7280', tip: '#e8eef6', out: '#1a1e26', hot: '#ffffff' },
  shield:    { top: 3, back: 2, front: 3, len: 4, wid: 2, col: '#9aa4b2', tip: '#f2f6fb', out: '#1c2028', hot: '#ffffff' },
  hearthgob: { top: 4, back: 2, front: 0, len: 5, wid: 2, col: '#7a4a2a', tip: '#ff9b2c', out: '#241408', hot: '#ffe08a' },
  troll:     { top: 6, back: 3, front: 0, len: 7, wid: 3, col: '#5a7a38', tip: '#d8e8a0', out: '#162210', hot: '#f2ffc8' },
  brute:     { top: 5, back: 3, front: 0, len: 6, wid: 3, col: '#8a5a3a', tip: '#f0d8b0', out: '#2a1608', hot: '#fff0c8' },
  scarecrow: { top: 5, back: 2, front: 0, len: 6, wid: 2, col: '#c9a23a', tip: '#fff0a0', out: '#3a2a08', hot: '#fffbd0' },
  armour:    { top: 4, back: 2, front: 2, len: 5, wid: 2, col: '#aab4c2', tip: '#ffffff', out: '#1c2028', hot: '#ffffff' },
};
const SPINE_ALIAS = { thorned: 'husk' };
export const spineBody = look => SPINE_BODY[look] || SPINE_BODY[SPINE_ALIAS[look]] || SPINE_BODY.husk;
/* the keyed frame of a rise: 0 none, 1 nubs, 2 half, 3 full */
export const spineStage = k => !(k > 0) ? 0 : k >= 1 ? 3 : k >= 0.45 ? 2 : 1;
/* x, y = the foot centre on the screen; w, h the body; k 0..1 the rise; face; look the body key; fire = the burst frame (flat out, white hot) */
export function drawSpinesK(g, x, y, w, h, k, face, look, time, shake, fire) {
  const st = fire ? 4 : spineStage(k); if (!st) return;
  const B = spineBody(look), f = face || 1, top = Math.round(y - h);
  const len = st === 1 ? Math.max(2, Math.round(B.len * 0.4)) : st === 2 ? Math.round(B.len * 0.7) : B.len + (st === 4 ? 2 : 0);
  const wid = st === 1 ? 1 : st === 2 ? Math.max(1, B.wid - 1) : B.wid, col = st === 4 ? B.hot : B.col, tip = st === 4 ? '#ffffff' : B.tip;
  const j = shake ? ((Math.floor(time * 24) & 1) ? 1 : -1) : 0;
  const fan = st === 4 ? 0.9 : 0.35;   /* the fire frame throws them wide */
  for (let i = 0; i < B.top; i++) {
    const u = B.top === 1 ? 0.5 : i / (B.top - 1), px = Math.round(x - w / 2 + 2 + u * (w - 4)) + (i & 1 ? j : 0);
    const ang = -Math.PI / 2 + (u - 0.5) * 2 * fan - f * 0.18;
    spike(g, px, top + 1, ang, len, wid, col, tip, B.out); }
  const bx = Math.round(x - f * (w / 2));   /* the back: leaning out and a little up */
  for (let i = 0; i < B.back; i++) { const py = Math.round(top + 3 + i * (h * 0.32)) + (i & 1 ? j : 0), ang = f > 0 ? Math.PI + 0.35 + i * 0.25 : -0.35 - i * 0.25;
    spike(g, bx, py, ang, Math.max(2, len - 1), Math.max(1, wid - 1), col, tip, B.out); }
  const fx = Math.round(x + f * (w / 2));   /* the front: through the guard, pointing at whoever swings */
  for (let i = 0; i < B.front; i++) { const py = Math.round(top + 3 + i * (h * 0.28)), ang = f > 0 ? (i - 0.5) * 0.3 : Math.PI - (i - 0.5) * 0.3;
    spike(g, fx, py, ang, Math.max(2, len - 2), 1, col, tip, B.out); }
  if (st >= 3 && !fire && Math.floor(time * 7 + x) % 5 === 0) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(x - w / 2 + 3 + ((Math.floor(time * 13)) % Math.max(1, w - 6))), top - len + 1, 1, 1); }   /* a glint along the points */
}

// ---------------------------------------------------------------- 2. ARMED STATES
const R = Math.round;
/* x, y = the foot centre on the screen (the same frame as the sprite); draws over the sprite. k = e.arK */
export function drawArmed(g, e, x, y, time, still) {
  const k = e.arK || 0, full = k >= 1;
  if (e.t === 'urchin') {
    const cy = y - 7, n = 12, r0 = 5, len = 1 + k * 5 + (full ? 1 : 0), spin = (e.spin || 0) * 0.2;
    for (let i = 0; i < n; i++) { const an = i * Math.PI * 2 / n + spin, c = Math.cos(an), s = Math.sin(an);
      for (let q = 0; q < len; q++) { const px = R(x + c * (r0 + q)), py = R(cy + s * (r0 + q));
        g.fillStyle = q >= len - 1 ? (full ? '#ffffff' : '#c9c4dc') : '#5a5470'; g.fillRect(px, py, 1, 1); } }
    if (full && !still && Math.floor(time * 12) % 2) { g.fillStyle = '#ff6b6b'; g.fillRect(R(x - 5), R(cy - 9), 1, 1); g.fillRect(R(x + 5), R(cy - 9), 1, 1); }   /* the needles stand: a red glint on the points */
    return;
  }
  if (e.t === 'jelly') {
    if (k <= 0) return;
    const bx = R(x), by = R(y), L = 3 + R(k * 9);
    for (let i = -2; i <= 2; i++) { if (!(i & 1) && !full && k < 0.5) continue;
      const sway = still ? 0 : R(Math.sin(time * 6 + i * 1.7) * (1 + k));
      for (let q = 0; q < L; q++) { g.fillStyle = q >= L - 2 ? (full ? '#fffaf0' : '#cdeeff') : full ? '#7fe0ff' : '#5aa8c8'; g.fillRect(bx + i * 2 + (q > 2 ? sway : 0), by + q - 1, 1, 1); } }
    if (full) { g.fillStyle = '#ffe9a8'; for (let i = 0; i < 3; i++) { const t = (time * 9 + i * 2.3) % 6; g.fillRect(R(bx - 5 + ((i * 5 + t * 3) % 11)), R(by + 1 + (t * 1.7) % 9), 1, 1); } }   /* sparks along the filaments: it is live */
    return;
  }
  if (e.t === 'grub') {
    if (k <= 0) return;
    const f = e.face || 1, bx = R(x), by = R(y);
    const beads = 1 + R(k * 3);
    for (let i = 0; i < beads; i++) { const px = bx - 5 + i * 4 + (i & 1), up = R(k * 2) + (i & 1);
      g.fillStyle = '#2c3a08'; g.fillRect(px - 1, by - 8 - up, 3, 3); g.fillStyle = full ? '#f2ff9a' : '#b8d878'; g.fillRect(px, by - 7 - up, 1, 2); g.fillRect(px - 1, by - 6 - up, 3, 1); }
    if (full) { g.fillStyle = '#e8ff9a'; g.globalAlpha = 0.55; g.fillRect(bx - 8, by - 2, 16, 1); g.globalAlpha = 1;
      const d = (time * 14) % 7; g.fillStyle = '#e8ff9a'; g.fillRect(bx - 3 * f, R(by - 1 + d), 1, 2); g.fillRect(bx + 3 * f, R(by - 1 + ((d + 3) % 7)), 1, 2); }   /* acid drips off it */
    return;
  }
  if (e.t === 'marshlight') {
    if (k <= 0) return;
    const cy = y - 5, n = 8, len = 2 + R(k * 6);
    for (let i = 0; i < n; i++) { const an = i * Math.PI / 4 + (still ? 0 : time * (full ? 6 : 2)), c = Math.cos(an), s = Math.sin(an);
      for (let q = 4; q < 4 + len; q++) { g.fillStyle = q >= 3 + len ? '#ffffff' : full ? '#fff0a8' : '#c9b8f0'; g.fillRect(R(x + c * q), R(cy + s * q), 1, 1); } }
    if (full) { g.globalAlpha = 0.4; g.fillStyle = '#fff6c8'; g.fillRect(R(x - 4), R(cy - 4), 8, 8); g.globalAlpha = 1; }
  }
}

// ---------------------------------------------------------------- 3. POSES
/* into poseOf (o: { dx, dy, sx, sy, rot, face }); now = game time; still = reduce motion */
export function kiPose(o, e, now, still, S) {
  /* the sidestep HOP: crouch, stretch through the air, land squashed (S = REACT_AIR.sidestep: { t, hop }) */
  if (e.ssT > 0 && S) { const k = 1 - Math.max(0, e.ssT) / S.t, dir = Math.sign((e.ssTo || 0) - (e.ssFrom || 0)) || 1;
    if (k < 0.2) { o.sy *= 0.74; o.sx *= 1.2; o.dy += 1; }
    else if (k < 0.8) { o.sy *= 1.2; o.sx *= 0.86; o.rot = (o.rot || 0) + dir * 0.22; }
    else { o.sy *= 0.8; o.sx *= 1.16; o.rot = (o.rot || 0) - dir * 0.08; } }
  /* OFF BALANCE: it teeters, the wobble dying away over the stagger */
  else if (e.offBalAt !== undefined && e.broken > 0 && now - e.offBalAt < 1.4 && !still) { const a = now - e.offBalAt, d = Math.max(0, 1 - a / 1.4);
    o.rot = (o.rot || 0) + Math.sin(a * 21) * 0.26 * d; o.sx *= 1 + Math.sin(a * 21) * 0.05 * d; o.dx += Math.round(Math.sin(a * 21) * 1.5 * d); }
  /* a GUARDED foe's slide: braced, leaning into the blow it is turning, feet planted and skidding */
  if (e.kiSlide && e.knock > 0) { const dir = Math.sign(e.kvx || 0) || 1; o.rot = (o.rot || 0) - dir * 0.17; o.sx *= 1.07; o.sy *= 0.95; o.dx -= dir; }
}
/* over the sprite: x, y the foot centre on the screen */
export function drawKiExtras(g, e, x, y, time, still, cx, cy) {
  const h = e.h || 12, w = e.w || 12;
  /* TUMBLE: a launch turning over - speed streaks behind, flying chips, a spin spiral */
  if (e.pctTumble > 0 && e.knock > 0) {
    const dir = Math.sign(e.kvx || 0) || 1, mid = y - h * 0.5;
    for (let i = 0; i < KA.tumble.trail; i++) { g.globalAlpha = 0.55 - i * 0.15; g.fillStyle = i ? '#c9d1dc' : '#ffffff';
      g.fillRect(R(x - dir * (w / 2 + 3 + i * 5)), R(mid + (i - 1) * 3), 3 - (i > 1 ? 1 : 0), 1); }
    g.globalAlpha = 1;
    if (!still) { const a = time * 22; g.fillStyle = '#ffd36b'; for (let q = 0; q < 3; q++) { const aa = a + q * 2.09; g.fillRect(R(x + Math.cos(aa) * (w * 0.7)), R(mid + Math.sin(aa) * (h * 0.7)), 1, 1); } }
  }
  /* LANDED FROM A TUMBLE: dizzy stars circle its head for a beat */
  if (e.tumDizzy > time && e.alive) { const a = time * 9, hy = y - h - 4;
    for (let q = 0; q < 3; q++) { const aa = a + q * 2.09; g.fillStyle = q ? '#ffd36b' : '#fff6c8'; g.fillRect(R(x + Math.cos(aa) * 5), R(hy + Math.sin(aa) * 1.6), 1, 1); } }
  /* GUARDED SLIDE: sparks scrape off the feet and the guard flashes where the blow turned */
  if (e.kiSlide && e.knock > 0) {
    const dir = Math.sign(e.kvx || 0) || 1, fr = -dir;   /* the guard is on the side the blow came from */
    if (!still || Math.floor(time * 14) % 2) { g.fillStyle = '#ffe08a'; g.fillRect(R(x - dir * (w / 2 + 1)), R(y - 1), 1, 1); g.fillRect(R(x - dir * (w / 2 + 3)), R(y - 2), 1, 1);
      g.fillStyle = '#ffffff'; g.fillRect(R(x - dir * (w / 2 + 2)), R(y - 3), 1, 1); }
    g.fillStyle = '#1c2028'; g.fillRect(R(x + fr * (w / 2 + 1)) - (fr < 0 ? 1 : 0), R(y - h * 0.8), 2, R(h * 0.6)); g.fillStyle = Math.floor(time * 16) % 2 ? '#ffffff' : '#c9d1dc'; g.fillRect(R(x + fr * (w / 2 + 1)) - (fr < 0 ? 0 : 0), R(y - h * 0.75), 1, R(h * 0.5));
  }
  /* THE HOP: the dashes left where it left (the departure), and the sweat of a teetering foe */
  if (e.ssT > 0) { g.fillStyle = '#e8e0d0'; const fx = R(e.ssFrom - cx), d = Math.sign(e.ssTo - e.ssFrom) || 1; g.fillRect(fx - d * 3, R(y - 1), 3, 1); g.fillRect(fx - d * 5, R(y - 3), 2, 1); }
  else if (e.offBalAt !== undefined && e.broken > 0 && time - e.offBalAt < 1.4 && !still) { g.fillStyle = '#bfe6f5'; const s = Math.floor(time * 10) % 2 ? 1 : -1; g.fillRect(R(x + s * (w / 2 + 2)), R(y - h - 2), 1, 2); g.fillRect(R(x - s * (w / 2 + 3)), R(y - h + 1), 1, 1); }
}

// ---------------------------------------------------------------- 4. HAZARD ENTRY FX
/* one burst per hazard kind, where the foe went in. api: { parts, ring(x, y, r, col, life) } - the page's own particle list */
export function entryFx(kind, x, y, api) {
  const P = (n, f) => { for (let i = 0; i < n; i++) api.parts.push(f(i, n)); };
  const sp = (a, b) => a + Math.random() * (b - a);
  switch (kind) {
    case 'spikes':   /* IMPALED: sparks up the shafts and a spray of red */
      P(6, () => ({ x: x + sp(-3, 3), y: y - 2, vx: sp(-40, 40), vy: sp(-150, -80), life: 0.35, max: 0.35, col: '#ffffff', size: 1, grav: 380 }));
      P(5, () => ({ x: x + sp(-3, 3), y: y - 4, vx: sp(-60, 60), vy: sp(-110, -40), life: 0.45, max: 0.45, col: '#c43a3a', size: 1, grav: 420 })); break;
    case 'drop':     /* the edge: wind streaks off the lip */
      P(5, i => ({ x: x + sp(-4, 4), y: y - 4 - i * 2, vx: 0, vy: -120 - i * 20, life: 0.3, max: 0.3, col: '#e8eef6', size: 1, grav: 0 })); break;
    case 'water':    /* a white splash and a ring */
      P(10, () => ({ x: x + sp(-3, 3), y, vx: sp(-60, 60), vy: sp(-190, -90), life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#eefaff' : '#bfe6f5', size: 1, grav: 420 })); if (api.ring) api.ring(x, y, 16, '#bfe6f5', 0.4); break;
    case 'lava':     /* a SIZZLE: orange spatter, a plume of grey steam */
      P(8, () => ({ x: x + sp(-3, 3), y, vx: sp(-70, 70), vy: sp(-230, -110), life: 0.55, max: 0.55, col: Math.random() < 0.5 ? '#ff9b2c' : '#ffd36b', size: 1, grav: 480 }));
      P(5, i => ({ x: x + sp(-4, 4), y: y - 2 - i, vx: sp(-8, 8), vy: -28 - i * 6, life: 0.9, max: 0.9, col: '#9a9298', size: 2, grav: -10 })); if (api.ring) api.ring(x, y, 18, '#ff6b2c', 0.45); break;
    case 'fire':     /* the flames CATCH: licks up the body */
      P(9, i => ({ x: x + sp(-4, 4), y: y - 2 - (i % 3) * 3, vx: sp(-18, 18), vy: sp(-90, -40), life: 0.5, max: 0.5, col: i % 3 === 0 ? '#ffe08a' : i % 3 === 1 ? '#ff9b2c' : '#e8501c', size: 1 + (i % 3 === 0 ? 1 : 0), grav: -60 })); break;
    case 'foul':     /* the MIRE: thick brown-green blobs, slow */
      P(8, () => ({ x: x + sp(-3, 3), y, vx: sp(-45, 45), vy: sp(-120, -50), life: 0.55, max: 0.55, col: Math.random() < 0.5 ? '#5c5a24' : '#7a8a3a', size: 2, grav: 360 })); break;
    case 'poison':   /* bubbles that rise, bright green */
      P(8, i => ({ x: x + sp(-5, 5), y: y - i, vx: sp(-10, 10), vy: sp(-60, -25), life: 0.7, max: 0.7, col: i & 1 ? '#a6e04a' : '#5c8a24', size: 1 + (i & 1), grav: -20 })); if (api.ring) api.ring(x, y, 12, '#a6e04a', 0.35); break;
    case 'press':    /* PINNED: a flat ring of dust and chips either side */
      P(8, i => ({ x, y: y - 1, vx: (i < 4 ? -1 : 1) * sp(40, 90), vy: sp(-30, -10), life: 0.35, max: 0.35, col: i % 3 ? '#c9b27c' : '#8a8478', size: 2, grav: 140 })); if (api.ring) api.ring(x, y, 20, '#c9b27c', 0.3); break;
    case 'sand':     /* the SAND takes it: a puff that sinks back */
      P(8, () => ({ x: x + sp(-4, 4), y, vx: sp(-30, 30), vy: sp(-70, -25), life: 0.6, max: 0.6, col: Math.random() < 0.5 ? '#e0cf9a' : '#c9b27c', size: 2, grav: 150 })); break;
    default: break;
  }
}
