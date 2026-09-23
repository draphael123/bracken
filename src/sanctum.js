// sanctum.js — THE ARCHMAGE'S SANCTUM, the Falling Tower's boss room (2026-09-23).
//
// Daniel: "when you reach the area where the boss triggers there should be a portal (it looks like there's a grass mat
// to get to the carpet, which doesn't make sense). You go through the portal and you're fighting over a poison ocean.
// When the boss ends you enter a portal which takes you to the goal, which is on a sandy path." Then, looking at it:
// "the tower look works, maybe it just separates to a separate room in the tower where the floor is all hazardous?
// Doesn't necessarily need to be poison water." And on the sand: "wink at the desert, which will be the next set
// of levels."
//
// So the crown of the tower no longer ends at a rug lying on a mat. It ends at a DOOR. Through it is his sanctum:
// a sealed stone hall with a vault over it and a floor of ARCANE FIRE - the last working he had going when he died,
// still burning, wall to wall. The carpet is how you stay off it.
//
// WHY THE ROOM IS DRAWN AND NOT BUILT. The fight is carpet flight, and a carpet is held by carpetBox() and by nothing
// else: there is not one grid tile in the sky rows and the box is what stops you. Tiling a room there would have put a
// stone lid over THE OPEN CROWN, which is open by name and by design, and would have handed a floating slab to every
// reach and flood check in the suite for no gain. So the masonry is painted at the box's own edges - the room you see
// IS the box you are held by, to the pixel - and the grid up there stays empty.
//
// THE FIRE IS THE POINT. carpetBox's bottom was `A.floor - 4`: an invisible floor you could not fall through, so
// altitude was free and the bottom of the arena was the safest place in it - sit on the floor, swing up. Now the bottom
// 26 px of the room burn. You can go in (it hurts, it does not kill: SANCTUM.dmg a tick and a shove back up, and the
// way out is up, always) but you cannot live there. That is what makes the height you fly at a decision.
//
// THE SANDY PATH is dressing and nothing else: no map node, no `needs:` link, no level behind it. It is the last ten
// seconds of the world, and it is warm and full of sand, because the next world is.
export const SANCTUM = {
  fire: 26,          /* how deep the witchfire lies on the floor of the hall, in px */
  dmg: 12, tick: 0.55, lift: 190,   /* a bite, a breath between bites, and the shove that gives you a chance to leave */
  wall: 22, vault: 26,              /* the masonry: how thick the side walls are, how deep the vault hangs */
  /* HOW LONG THE FIRE LETS YOU BE IN IT BEFORE THE FIRST BITE. It has to be SHORTER than the climb out of the deepest
     point (22px at CARPET.speed = 137ms, measured in tools/archmage-room.mjs) or the floor never bites a diving player
     at all and is not a floor. At 0.10 a dive to the very bottom costs exactly one bite and a moment's hesitation costs
     more, which is the rule the room is for: you may cross it, you may not live on it. */
  warm: 0.10,
  board: [20, 24],                  /* how close you stand to a portal before it takes you */
};
/* THE TOP OF THE FIRE. Everything below this line in the room is burning. */
export const fireTop = A => A.floor - SANCTUM.fire;

/* ONE STEP IN THE FIRE. Returns true on a bite, so the caller can do its own hurt, sound and shake - this module
   knows where the fire is and nothing about the player's health. */
export function burnSanctum(P, A, dt, ctx) {
  if (!P || P.dead || !P.carpet) return false;
  const top = fireTop(A), depth = P.y - top;
  if (depth <= 0) { P.burnT = 0; return false; }
  P.burnT = (P.burnT || 0) + dt;
  ctx.ember(P.x, P.y);
  if (P.burnT < SANCTUM.warm) return false;               /* a breath of warning before the first bite, not on contact */
  if (((P.burnT - SANCTUM.warm) % SANCTUM.tick) > dt) return false;
  P.vy = -SANCTUM.lift; P.carpet.hitT = 0.2;               /* it throws you off it: the way out of the fire is up */
  return true;
}

// ---------------------------------------------------------------- the room
const STONE = ['#1a1428', '#2a2238', '#352c46', '#141020', '#4a4058', '#0e0a18'];
const FIRE = ['#8fffb0', '#3fe08a', '#d9ffe8', '#1d6b46', '#0e2a1c'];
/* a steady per-column wobble, so the fire's edge is a line of flame and not a ruled edge */
const lick = (x, t) => Math.sin(x * 0.21 + t * 3.1) * 2 + Math.sin(x * 0.07 - t * 1.7) * 2;

/* THE HALL. Drawn at the UNSQUEEZED box, always: the storm walls close inside the masonry, they do not move it. */
export function drawSanctum(g, L, A, cx, cy, time, box) {
  const x0 = Math.round(box.x0 - cx), x1 = Math.round(box.x1 - cx), w = x1 - x0;
  const top = Math.round(box.y0 - cy), flr = Math.round(A.floor - cy), ft = Math.round(fireTop(A) - cy);
  const H = g.canvas.height;
  // the room's own dark, over the level's sky: inside here there is no sky
  g.fillStyle = STONE[0]; g.fillRect(x0 - SANCTUM.wall - 40, top - SANCTUM.vault - 40, w + SANCTUM.wall * 2 + 80, (flr - top) + SANCTUM.vault + 80);
  // THE BACK WALL: ashlar courses, and a blind arcade of tall pointed recesses behind him
  g.fillStyle = STONE[1]; g.fillRect(x0, top, w, flr - top);
  g.fillStyle = STONE[2]; for (let y = top; y < flr; y += 11) g.fillRect(x0, y, w, 1);
  for (let ax = x0 + 26; ax < x1 - 20; ax += 78) {
    const ah = Math.min(96, flr - top - 24), ay = flr - 16 - ah;
    g.fillStyle = STONE[3]; g.fillRect(ax, ay + 12, 34, ah - 12);
    for (let k = 0; k < 12; k++) g.fillRect(ax + k, ay + 12 - k, 34 - k * 2, 1);          /* the point of the arch, stepped */
    g.fillStyle = STONE[4]; g.fillRect(ax + 16, ay + 1, 2, 2);                             /* the keystone catches the light */
    g.fillStyle = 'rgba(143,255,176,0.05)'; g.fillRect(ax + 2, ay + 16, 30, ah - 18);      /* his fire gets into every recess */
  }
  // THE SIDE WALLS, with a lit inner course: the room has to read as held in, not cropped
  for (const [sx, dir] of [[x0 - SANCTUM.wall, 1], [x1, -1]]) {
    g.fillStyle = STONE[1]; g.fillRect(sx, top - SANCTUM.vault, SANCTUM.wall, (flr - top) + SANCTUM.vault + 8);
    g.fillStyle = STONE[3]; for (let y = top - SANCTUM.vault; y < flr; y += 9) g.fillRect(sx, y, SANCTUM.wall, 1);
    const inner = dir > 0 ? sx + SANCTUM.wall - 2 : sx;
    g.fillStyle = STONE[4]; g.fillRect(inner, top - SANCTUM.vault, 2, (flr - top) + SANCTUM.vault);
    g.fillStyle = 'rgba(143,255,176,0.10)'; g.fillRect(inner - (dir > 0 ? 0 : 2), ft - 40, 4, 40);   /* firelight up the wall */
  }
  // THE VAULT: ribs springing off both walls to a ridge, and black above it
  g.fillStyle = STONE[5]; g.fillRect(x0 - SANCTUM.wall, top - SANCTUM.vault - 40, w + SANCTUM.wall * 2, 40);
  g.fillStyle = STONE[1]; g.fillRect(x0, top - SANCTUM.vault, w, SANCTUM.vault);
  g.fillStyle = STONE[3];
  for (let rx = x0 - 40; rx < x1 + 40; rx += 64) for (let k = 0; k < SANCTUM.vault; k++) { const s = Math.round(k * 1.1); g.fillRect(rx + s, top - SANCTUM.vault + k, 2, 1); g.fillRect(rx + 64 - s - 2, top - SANCTUM.vault + k, 2, 1); }
  g.fillStyle = STONE[4]; g.fillRect(x0 - SANCTUM.wall, top - SANCTUM.vault, w + SANCTUM.wall * 2, 1);
  // THE BRAZIERS on the side walls, burning the same green: the only light in here is his
  for (const [bx, by] of [[x0 + 6, top + 40], [x1 - 10, top + 40], [x0 + 6, ft - 66], [x1 - 10, ft - 66]]) {
    if (by < -20 || by > H + 20) continue;
    g.fillStyle = STONE[4]; g.fillRect(bx, by, 4, 12); g.fillRect(bx - 2, by - 3, 8, 3);
    const f = Math.sin(time * 7 + bx) * 1.5;
    g.fillStyle = FIRE[1]; g.fillRect(bx - 1, by - 8 + f, 6, 6); g.fillStyle = FIRE[2]; g.fillRect(bx + 1, by - 6 + f, 2, 3);
  }
  // THE FLOOR OF FIRE, wall to wall, and the glow it throws up the room
  if (ft < H && flr > 0) {
    g.fillStyle = FIRE[4]; g.fillRect(x0 - SANCTUM.wall, ft, w + SANCTUM.wall * 2, flr - ft + 8);
    for (let x = x0 - SANCTUM.wall; x < x1 + SANCTUM.wall; x++) {
      const l = lick(x + cx, time), y = ft + Math.round(l);
      g.fillStyle = FIRE[3]; g.fillRect(x, y + 5, 1, flr - y - 3);
      g.fillStyle = FIRE[1]; g.fillRect(x, y + 1, 1, 5);
      g.fillStyle = FIRE[0]; g.fillRect(x, y, 1, 2);
      if ((((x + cx) | 0) + Math.floor(time * 6)) % 17 === 0) { g.fillStyle = FIRE[2]; g.fillRect(x, y - 2 - Math.round(Math.abs(l)), 1, 3); }
    }
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(63,224,138,0.05)'; g.fillRect(x0 - SANCTUM.wall, ft - 8 - k * 9, w + SANCTUM.wall * 2, 9); }
    g.globalCompositeOperation = 'source-over';
  }
}

// ---------------------------------------------------------------- the doors
const PORT = { in: ['#b07cf0', '#e0c8ff', '#4a2a7a', '#2a1840'], out: ['#e0b050', '#ffe9b0', '#8a5a1a', '#3a2410'] };
/* A DOOR IN THE AIR: a standing oval of light, its rim turning, and the dark of somewhere else inside it. 28x40.
   `on` runs 0..1 so a portal can open rather than appear. */
export function drawPortal(g, x, y, time, kind = 'in', on = 1) {
  const C = PORT[kind] || PORT.in, k = Math.max(0, Math.min(1, on));
  x = Math.round(x); y = Math.round(y);
  const rw = Math.round(13 * k), rh = Math.round(19 * k); if (rw < 1 || rh < 1) return;
  for (let dy = -rh; dy <= rh; dy++) {
    const f = 1 - (dy / rh) * (dy / rh); if (f <= 0) continue;
    const half = Math.round(rw * Math.sqrt(f) + Math.sin(time * 4 + dy * 0.5) * 0.8);
    if (half < 1) continue;
    g.fillStyle = C[3]; g.fillRect(x - half, y + dy - rh, half * 2, 1);                       /* the dark of the other side */
    g.fillStyle = C[2]; g.fillRect(x - half, y + dy - rh, 1, 1); g.fillRect(x + half - 1, y + dy - rh, 1, 1);
  }
  /* the rim: sparks running round it, and two that are always brightest */
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + time * 1.6;
    const px = x + Math.round(Math.cos(a) * rw), py = y - rh + Math.round(Math.sin(a) * rh);
    g.fillStyle = (i % 7 === 0) ? C[1] : C[0]; g.fillRect(px, py, 1, 1);
  }
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = kind === 'in' ? 'rgba(176,124,240,0.10)' : 'rgba(224,176,80,0.10)';
  g.fillRect(x - rw - 6, y - rh * 2 - 6, rw * 2 + 12, rh * 2 + 12);
  g.globalCompositeOperation = 'source-over';
}

/* THE WAY OUT. The way IN is the carpet's own board check (carpet.js updateCarpet): the door stands exactly where the
   rug used to lie, so the same proximity test opens it and there is no second system doing one system's job. This is
   the other door - it opens where he fell, because the hole he leaves IS the way out, and it is walked into, never
   pressed, so it cannot be missed. */
export function openSanctumDoor(S, A, x, y) {
  if (!S || S.open) return;
  const b = { x0: A.x0 + 60, x1: A.x1 - 60 };
  S.out = { x: Math.max(b.x0, Math.min(b.x1, x)), y: Math.min(y, fireTop(A) - 44) };   /* never in the fire, never in a wall */
  S.open = true; S.outOpen = 0;
}
export function updateSanctum(L, P, dt, ctx) {
  const S = L.sanctum; if (!S) return;
  S.t = (S.t || 0) + dt;
  if (S.open && S.outOpen < 1) S.outOpen = Math.min(1, S.outOpen + dt * 1.6);
  if (!P || P.dead || !S.open || S.outOpen < 1 || !P.carpet || !S.out) return;
  if (Math.abs(P.x - S.out.x) < SANCTUM.board[0] && Math.abs(P.y - S.out.y) < SANCTUM.board[1]) ctx.leave(S.out);
}
/* BOTH DOORS, drawn. The first only while it is still there to walk into; the second only once it has opened. */
export function drawSanctumDoors(g, L, cx, cy, time) {
  const S = L.sanctum; if (!S) return;
  if (!L.carpetUp) drawPortal(g, S.in.x - cx, S.in.y - cy, time, 'in', 1);
  if (S.open && S.out) drawPortal(g, S.out.x - cx, S.out.y - cy, time, 'out', S.outOpen);
}

// ---------------------------------------------------------------- the sand
/* THE PATH OUT. A warm dawn over dunes, where the whole level has been violet night - the first thing the next world
   will look like, seen for ten seconds at the end of this one. Drawn behind the sand tiles, camera-parallaxed. */
export function drawSandDawn(g, L, cx, cy, time) {
  const H = g.canvas.height, W = g.canvas.width;
  const sky = ['#2a2038', '#5a3a52', '#a8635a', '#e0975e', '#f2c98a'];
  for (let i = 0; i < sky.length; i++) { g.fillStyle = sky[i]; g.fillRect(0, Math.round(H * i / sky.length), W, Math.ceil(H / sky.length) + 1); }
  const sunY = Math.round(H * 0.62 - cy * 0.02);
  g.fillStyle = '#ffe9b0'; for (let dy = -9; dy <= 9; dy++) { const half = Math.round(Math.sqrt(Math.max(0, 81 - dy * dy))); g.fillRect(Math.round(W * 0.7 - half - cx * 0.02), sunY + dy, half * 2, 1); }
  /* two bands of dune, the far one barely moving: it is a long way to the desert yet */
  for (const [par, col, base, amp] of [[0.06, '#8a5a52', 0.78, 7], [0.14, '#c08a5e', 0.9, 11]]) {
    const y0 = Math.round(H * base - cy * par * 0.4);
    for (let x = 0; x < W; x++) { const wx = x + cx * par; g.fillStyle = col; g.fillRect(x, y0 + Math.round(Math.sin(wx * 0.013) * amp + Math.sin(wx * 0.031) * (amp * 0.4)), 1, H); }
  }
  /* sand on the wind, blowing the way you are walking */
  for (let i = 0; i < 30; i++) { const px = ((i * 137 + time * 42) % (W + 40)) - 20, py = (i * 53 + Math.sin(time + i) * 6) % H;
    g.fillStyle = i % 3 ? 'rgba(242,201,138,0.30)' : 'rgba(255,233,176,0.45)'; g.fillRect(Math.round(px), Math.round(py), 2, 1); }
}
