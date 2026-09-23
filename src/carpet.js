// carpet.js — THE MAGIC CARPET, the Falling Tower's last floor (batch 4, 2026-09-21). At the crown the roof is gone and
// the carpet waits over the parapet walk; stepping on it is a new player mode, P.carpet: free 8-way flight at ~160 px/s,
// a little inertia and a bob, and a slow drift so it never sits dead still (it must not feel like noclip). There is no
// ground and no falling: the sky box holds it. Being hit knocks the carpet back. Attacks are the kite's air swing.
// main.js runs the player's half (carpetPlayer, in updatePlayer) and calls updateCarpet BESIDE the other per-level
// updates - never inside updateSea, which returns early off the ships.
export const CARPET = { speed: 160, accel: 5.5, drift: 9, bob: 2, knock: 230, board: [18, 22] };

/* THE SKY BOX: the arena, and when he is enraged the storm walls close it in from both sides (to 60% of its width) */
export function carpetBox(A, squeeze = 0) {
  const k = Math.max(0, Math.min(1, squeeze)), inset = (A.x1 - A.x0) * 0.2 * k;
  return { x0: A.x0 + 12 + inset, x1: A.x1 - 12 - inset, y0: A.y0 + 24, y1: A.floor - 4 };
}
export function mountCarpet(P, at) {
  P.carpet = { t: 0, bob: 0, hitT: 0, tilt: 0 };
  P.x = at.x; P.y = at.y - 4; P.vx = 0; P.vy = -40;
  Object.assign(P, { atk: -1, plunge: false, block: false, onMover: null, dodge: 0, climb: false, cling: false, ground: false, swim: false });
}
export function dismountCarpet(P) { P.carpet = null; }
/* one step of flight. input = { ax, ay } in -1..1 (diagonals are normalised). Returns the box sides it met. */
export function stepCarpet(P, input, dt, box) {
  const C = P.carpet; if (!C) return null;
  C.t += dt; C.hitT = Math.max(0, C.hitT - dt);
  let ax = input.ax || 0, ay = input.ay || 0; const m = Math.hypot(ax, ay); if (m > 1) { ax /= m; ay /= m; }
  // THE DRIFT: a slow figure-of-eight under whatever you are doing, so a held carpet is still a carpet in the wind
  const tvx = ax * CARPET.speed + Math.sin(C.t * 0.7) * CARPET.drift, tvy = ay * CARPET.speed + Math.sin(C.t * 1.3) * CARPET.drift * 0.5;
  const k = Math.min(1, dt * (C.hitT > 0 ? 1.6 : CARPET.accel));   /* knocked back, it takes a moment to answer the reins again */
  P.vx += (tvx - P.vx) * k; P.vy += (tvy - P.vy) * k;
  P.x += P.vx * dt; P.y += P.vy * dt;
  const hit = {};
  if (P.x < box.x0) { P.x = box.x0; P.vx = Math.abs(P.vx) * 0.3; hit.l = true; }
  if (P.x > box.x1) { P.x = box.x1; P.vx = -Math.abs(P.vx) * 0.3; hit.r = true; }
  if (P.y < box.y0) { P.y = box.y0; P.vy = Math.abs(P.vy) * 0.3; hit.t = true; }
  if (P.y > box.y1) { P.y = box.y1; P.vy = -Math.abs(P.vy) * 0.3; hit.b = true; }   /* the bottom of the sky is the floor you cannot fall through */
  C.bob = Math.sin(C.t * 3.1) * CARPET.bob; C.tilt += ((P.vx / CARPET.speed) * 0.18 - C.tilt) * Math.min(1, dt * 6);
  P.ground = false;
  return hit;
}
/* HIT, THE CARPET GOES BACK: away from where the blow came from, harder than the reins can hold for a moment */
export function knockCarpet(P, fromX, fromY, power = CARPET.knock) {
  if (!P.carpet) return; const dx = P.x - fromX, dy = (P.y - 8) - fromY, d = Math.hypot(dx, dy) || 1;
  P.vx = dx / d * power; P.vy = dy / d * power * 0.8; P.carpet.hitT = 0.35;
}
/* THE LEVEL'S HALF: the carpet waiting over the parapet before it is boarded, and the ruin of the tower going past */
export function updateCarpet(L, P, dt, ctx) {
  if (!L.carpetAt) return;
  const W = L.carpetWait || (L.carpetWait = { t: 0, ruin: [] }); W.t += dt;
  /* THE DOOR STANDS WHERE THE RUG LAY, so this one proximity test opens it and nothing else has to: what changed is
     only WHERE IT PUTS YOU. Without a sanctum you rise off the parapet as before; with one you step through and come
     out inside his hall (src/sanctum.js), and the rug is under you when you get there. */
  if (!P.carpet && !L.carpetUp && !P.dead && Math.abs(P.x - L.carpetAt.x) < CARPET.board[0] && Math.abs(P.y - L.carpetAt.y) < CARPET.board[1]) {
    mountCarpet(P, L.sanctum ? L.sanctum.spawn : L.carpetAt); L.carpetUp = true; ctx.board();
  }
  /* THE TOWER STILL COMING DOWN. In the open sky it fell past you from above the top of the arena; INSIDE HIS HALL that
     would be rubble dropping through a painted stone vault, so in the sanctum it is shaken loose FROM the vault instead,
     and between the room's own walls rather than the arena's wider box. */
  if (L.carpetUp && Math.random() < dt * 5) { const b = L.sanctum ? carpetBox(L.arena, 0) : { x0: L.arena.x0, x1: L.arena.x1 };
    W.ruin.push({ x: b.x0 + Math.random() * (b.x1 - b.x0), y: L.sanctum ? L.arena.y0 + 26 : L.arena.y0 - 40, vy: 40 + Math.random() * 60, s: 2 + (Math.random() * 5 | 0), r: Math.random() * 6, life: 5 }); }
  for (const q of W.ruin) { q.y += q.vy * dt; q.vy += 90 * dt; q.r += dt * 2; q.life -= dt; }
  /* the tower still coming down, seen from inside his room: in the sanctum the rubble goes INTO the fire and is done,
     rather than falling on through a floor that is now burning stone */
  const floor = L.sanctum ? L.arena.floor - 30 : L.arena.floor + 200;
  W.ruin = W.ruin.filter(q => q.life > 0 && q.y < floor);
}
export function resetCarpet(L, P) { if (P) P.carpet = null; L.carpetUp = false; if (L.carpetWait) L.carpetWait.ruin = []; }

// ---- drawing ----
const RUG = ['#5a1a2a', '#9a2a3a', '#c9463d', '#e0b050', '#f3ce77', '#2a3a6a'];
/* the rug itself: 30 px of red and gold with a blue border, tassels at both ends, rippling along its length */
export function drawRug(g, x, y, t, tilt = 0) {
  x = Math.round(x); y = Math.round(y);
  for (let i = 0; i < 30; i++) {
    const wy = y + Math.round(Math.sin(t * 6 + i * 0.45) * 1.2 + (i - 15) * tilt);
    g.fillStyle = RUG[1]; g.fillRect(x - 15 + i, wy, 1, 4);
    g.fillStyle = (i === 0 || i === 29) ? RUG[5] : (i % 6 === 2 ? RUG[3] : RUG[2]); g.fillRect(x - 15 + i, wy + 1, 1, 2);
    if (i % 6 === 2) { g.fillStyle = RUG[4]; g.fillRect(x - 15 + i, wy + 1, 1, 1); }
    g.fillStyle = RUG[0]; g.fillRect(x - 15 + i, wy + 4, 1, 1);
    if (i === 0 || i === 29) { g.fillStyle = RUG[3]; for (let k = 0; k < 3; k++) g.fillRect(x - 15 + i + (i ? 1 : -1) * (1 + (k & 1)), wy + k + Math.round(Math.sin(t * 9 + k) * 0.8), 1, 1); }
  }
}
export function drawCarpetWorld(g, L, P, cx, cy, time) {
  if (!L.carpetAt) return;
  const W = L.carpetWait; if (W) for (const q of W.ruin) { g.fillStyle = q.s > 4 ? '#4a4258' : '#6a6280'; g.fillRect(Math.round(q.x - cx), Math.round(q.y - cy), q.s, q.s); }
  if (!P.carpet && !L.carpetUp && !L.sanctum) {   /* waiting: it hovers a hand over the walk and turns its tassels in the wind (with a sanctum there is a door here instead) */
    const x = L.carpetAt.x - cx, y = L.carpetAt.y - cy - 6 + Math.sin(time * 2.4) * 2;
    drawRug(g, x, y, time); g.fillStyle = 'rgba(224,176,80,.18)'; g.fillRect(Math.round(x) - 16, Math.round(y) + 6, 32, 2);
  }
}
/* the storm walls: when he is enraged the sky closes from both sides, lightning in the cloud */
export function drawStormWalls(g, A, squeeze, cx, cy, time, VW, VH) {
  if (!(squeeze > 0)) return; const b = carpetBox(A, squeeze);
  for (const [x0, x1] of [[A.x0 - 200, b.x0 - 12], [b.x1 + 12, A.x1 + 200]]) {
    const sx = Math.round(x0 - cx), w = Math.round(x1 - x0); if (sx > VW || sx + w < 0) continue;
    g.fillStyle = 'rgba(40,36,70,.72)'; g.fillRect(sx, 0, w, VH);
    const edge = x0 < A.x0 ? sx + w : sx; g.fillStyle = 'rgba(190,190,255,.5)';
    for (let y = 0; y < VH; y += 6) g.fillRect(edge + Math.round(Math.sin(time * 7 + y * 0.3) * 3) - 1, y, 2, 4);
    if (Math.floor(time * 5 + (x0 & 7)) % 7 === 0) { g.fillStyle = '#e9e9ff'; g.fillRect(edge - 1, 0, 2, VH); }
  }
}
