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
  const k = Math.min(1, dt * (C.hitT > 0 ? 1.6 : CARPET.accel * (C.grip ?? 1)));   /* (grip: the Undead Archmage's ice realm takes most of it - src/mage-realms.js) */   /* knocked back, it takes a moment to answer the reins again */
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
    mountCarpet(P, L.chase3 || !L.sanctum ? L.carpetAt : L.sanctum.spawn); L.carpetUp = true; ctx.board();   /* (claude/ft4a) THE CHASE: you board where the rug is - it carries you UP, no door */
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
  if (!P.carpet && !L.carpetUp && (!L.sanctum || L.sanctum.rug)) {   /* waiting: it hovers a hand over the walk and turns its tassels in the wind (with a sanctum there is a door here instead - and since the spiral stair,
     2026-09-29, the door AND the carpet: `sanctum.rug` lays it in front of the door at the top of the stair, src/spiral-chase.js) */
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

/* ================= CARPET 2: THE RIDE (claude/carpet, 11-06; plan-desert-1105 s3.g - EXTENDS this file, the Falling Tower keeps
   every function above exactly as it was). THE FLYING CARPET level (src/flying-carpet.js) rides the Djinn's carpet on its OWN mode,
   P.carpet + P.crRide (src/carpet-hands.js keeps the state; main.js's carpetPlayer calls the hands instead of stepCarpet there):
     THE CARPET RIDES THE WIND - IT ONLY HOLDS YOU WHILE IT'S MOVING.
   - It always flies FORWARD at its air speed `spd` (the auto-scroll IS the carpet: there is no hover). RIGHT pushes, LEFT brakes.
   - UP climbs and COSTS speed; DOWN dives and GAINS it; level flight drifts back toward cruise. In a THERMAL a climb is free.
   - Under RIDE.stall it SAGS (told: the rug flutters, 'IT SAGS - DIVE!') and after RIDE.stallWarn it DROPS you: you fall, the rug
     hangs a breath (RIDE.lag) and then FOLLOWS under you for RIDE.follow s (told) - altitude is the margin; low over the mist a stall kills.
   - JUMP hops off (it follows under you the same way: land back on it). On footing it comes and lies beside you: walk onto it.
   - STONE FRAYS IT: a scrape takes RIDE.scrape off the fray bar (told, a grace between scrapes) and costs speed; it mends after a quiet
     spell. Frayed through, it TEARS and drops you (it comes back, barely holding: RIDE.torn).
   - BLOCK held = LIE FLAT (the hero's box shrinks to RIDE.duckH: under the arches) and braces against a gust (half).
   - In an ARENA (R.mode 'arena') the carpet may TURN: brake under RIDE.turnAt while pressing back and it wheels round; a wall wheels it. */
export const RIDE = { cruise: 110, max: 235, stall: 52, stallWarn: 0.7, diveGain: 90, climbCost: 72, relax: 0.55, recover: 16, push: 40, pushCap: 150, brake: 75,
  pitchV: 100, sagV: 80, pitchK: 6, w: 5, h: 22, duckH: 9, under: 4, scrape: 0.25, scrapeGrace: 0.6, scrapeSlow: 0.55, mendWait: 3, mend: 0.05, torn: 0.4,
  lag: 0.45, follow: 1.1, followV: 360, sink: 60, board: [16, 14], hop: -300, kick: 0.8, turnAt: 80, wallTurn: 0.7, hitSlow: 40 };
export function newRide(o = {}) {
  return { mode: o.mode || 'run', dir: 1, spd: RIDE.cruise, y0: o.y0 ?? 32, y1: o.y1 ?? 99999, x0: o.x0 ?? -1e9, x1: o.x1 ?? 1e9, fray: 1, scrapeT: 0, quietT: 0, stallT: 0,
    sag: false, duck: false, rug: null, n: { scrapes: 0, drops: 0, hops: 0, boards: 0, tears: 0 } };
}
/* the ridden hero's box against stone: px edges, feet at y, the rug under the feet (RIDE.under) */
export function rideBox(P, R) { const h = R && R.duck ? RIDE.duckH : RIDE.h; return { l: P.x - RIDE.w, r: P.x + RIDE.w, t: P.y - h, b: P.y + RIDE.under }; }
export function boxHits(b, solid) {
  for (let y = b.t; ; y = Math.min(b.b, y + 7)) { for (let x = b.l; ; x = Math.min(b.r, x + 7)) { if (solid(x, y)) return true; if (x >= b.r) break; } if (y >= b.b) break; }
  return false;
}
/* ONE STEP OF THE RIDE. input = { ax, ay (DOWN +1 dives, UP -1 climbs), duck }; W = { solid(px, py), lift(px, py) -> px/s UP (thermal +, downdraft -),
   wind(px, py) -> { slow (px/s^2 off the air speed: + headwind, - tailwind), vy (px/s, + down) } }. Returns its events: stallWarn, drop {why}, scrape {fray}, turn, wall. */
export function stepRide(P, R, input, dt, W) {
  const ev = [], C = P.carpet; if (!C) return ev;
  C.t += dt; R.scrapeT = Math.max(0, R.scrapeT - dt); R.quietT += dt;
  const ax = Math.sign(input.ax || 0), ay = Math.sign(input.ay || 0); R.duck = !!input.duck;
  const lift = W.lift ? W.lift(P.x, P.y) : 0, wind = (W.wind && W.wind(P.x, P.y)) || null;
  /* THE AIR SPEED */
  let s = R.spd;
  if (ay > 0) s += RIDE.diveGain * dt; else if (ay < 0) s -= (lift > 0 ? 0 : RIDE.climbCost) * dt;
  else if (s > RIDE.cruise) s += (RIDE.cruise - s) * RIDE.relax * dt;
  else s += Math.min(RIDE.cruise - s, RIDE.recover * dt);   /* level flight recovers slowly: a stall is something you DO (climb, brake, a headwind), not something that just happens */
  if (ax === R.dir) { if (s < RIDE.pushCap) s = Math.min(RIDE.pushCap, s + RIDE.push * dt); } else if (ax === -R.dir) s -= RIDE.brake * dt;
  if (wind && wind.slow) s -= wind.slow * (R.duck ? 0.5 : 1) * dt;
  s = Math.max(0, Math.min(RIDE.max, s));
  if (R.mode === 'arena' && ax === -R.dir && s < RIDE.turnAt) { R.dir = -R.dir; s = Math.max(s, RIDE.turnAt); ev.push({ t: 'turn' }); }
  R.spd = s;
  /* IT ONLY HOLDS YOU WHILE IT'S MOVING */
  const sag = s < RIDE.stall;
  if (sag) { if (!R.sag) ev.push({ t: 'stallWarn' }); R.stallT += dt; if (R.stallT >= RIDE.stallWarn) { R.sag = false; R.stallT = 0; ev.push({ t: 'drop', why: 'stall' }); return ev; } }
  else R.stallT = 0;
  R.sag = sag;
  /* THE LINE */
  const vyT = ay * RIDE.pitchV - lift + (sag ? RIDE.sagV : 0) + ((wind && wind.vy) || 0);
  P.vx = R.dir * s; P.vy += (vyT - P.vy) * Math.min(1, dt * RIDE.pitchK);
  const scrape = why => { R.spd *= RIDE.scrapeSlow; R.quietT = 0; if (R.scrapeT > 0) return; R.scrapeT = RIDE.scrapeGrace; R.fray = Math.max(0, R.fray - RIDE.scrape); R.n.scrapes++; ev.push({ t: 'scrape', fray: R.fray, why });
    if (R.fray <= 0) { R.n.tears++; ev.push({ t: 'drop', why: 'tear' }); } };
  const x0 = P.x; P.x += P.vx * dt;
  if (P.x < R.x0) { P.x = R.x0; if (R.mode === 'arena') { R.dir = 1; R.spd *= RIDE.wallTurn; ev.push({ t: 'wall' }); } }
  if (P.x > R.x1) { P.x = R.x1; if (R.mode === 'arena') { R.dir = -1; R.spd *= RIDE.wallTurn; ev.push({ t: 'wall' }); } }
  if (boxHits(rideBox(P, R), W.solid)) { P.x = x0; scrape('front'); if (R.mode === 'arena') R.dir = -R.dir; }
  const y0 = P.y; P.y += P.vy * dt;
  if (P.y < R.y0) { P.y = R.y0; P.vy = Math.max(0, P.vy); }
  if (P.y > R.y1) { P.y = R.y1; P.vy = Math.min(0, P.vy); }   /* the ridden carpet skims the mist and no lower (a DROPPED hero falls through it) */
  if (boxHits(rideBox(P, R), W.solid)) { const down = P.vy > 0; P.y = y0; P.vy = -P.vy * 0.3; scrape(down ? 'under' : 'over'); }
  if (R.quietT > RIDE.mendWait && R.fray < 1) R.fray = Math.min(1, R.fray + RIDE.mend * dt);
  C.bob = Math.sin(C.t * 3.1) * (sag ? 3 : CARPET.bob) + (sag ? Math.sin(C.t * 31) : 0);
  C.tilt += ((P.vy / RIDE.pitchV) * 0.12 * R.dir - C.tilt) * Math.min(1, dt * 6);
  P.ground = false; P.face = R.dir;
  return ev;
}
/* THE RUG OFF YOUR FEET: lag (it hangs, sinking), follow (it flies under your feet), lost (it gave up: you were too low), park (you are on
   footing: it lies beside you). Returns 'board' when the hero is on it again (the caller mounts and kicks the speed back up), 'lost' once. */
export function newRug(x, y, state = 'lag') { return { x, y, state, t: 0, parked: false }; }
export function rugStep(rug, P, dt, o = {}) {
  rug.t += dt; const near = Math.abs(P.x - rug.x) < RIDE.board[0] && P.y > rug.y - RIDE.board[1] && P.y < rug.y + 8;
  if (rug.state === 'lag') { rug.y += RIDE.sink * dt; if (rug.t >= RIDE.lag) { rug.state = 'follow'; rug.t = 0; } return null; }
  if (rug.state === 'follow') {
    if (near && (P.vy || 0) >= 0) return 'board';
    if (P.ground) { rug.state = 'park'; rug.t = 0; rug.parked = false; return null; }
    if (rug.t > RIDE.follow) { rug.state = 'lost'; rug.t = 0; return 'lost'; }
    const tx = P.x + (P.vx || 0) * 0.05, ty = P.y + 3, dx = tx - rug.x, dy = ty - rug.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, RIDE.followV * dt);
    rug.x += dx / d * st; rug.y += dy / d * st; return null;
  }
  if (rug.state === 'park') {
    if (P.ground && rug.hold) rug.hold = 0;   /* set down from high: it waits till you are on your feet, then follows you again */
    if (!rug.parked) { const px = P.x + (o.side || P.face || 1) * 22, dx = px - rug.x, dy = (P.y - 2) - rug.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, RIDE.followV * dt);
      rug.x += dx / d * st; rug.y += dy / d * st; if (d < 2) rug.parked = true; return null; }
    if (near && (P.ground || (P.vy || 0) >= 0)) return 'board';
    if (!P.ground && !near && (P.vy || 0) > 0 && rug.t > (rug.hold || 0.3)) { rug.state = 'follow'; rug.t = 0; }   /* you went over an edge (or jumped from beside it): it follows again */
    return null;
  }
  if (P.ground) { rug.state = 'park'; rug.t = 0; rug.parked = false; }   /* lost, but you came down on a spire or a ledge: it finds you there */
  return null;   /* lost: it hangs where it stopped; a death brings it back at the checkpoint */
}
