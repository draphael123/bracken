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
// THE DESERT (round 2, 2026-09-25) replaced THE SANDY PATH: the second door opens onto open sand under THE SUNKEN CARAVAN's own sky, with
// the level's end on it - see "the desert" at the foot of this file. What follows is the path's history.
// THE SANDY PATH is the last ten seconds of this world, and it is warm and full of sand, because the next world is. It used
// to be dressing and nothing else; since 2026-09-24 the gold hole LEADS somewhere: THE SUNKEN CARAVAN needs 'fallingtower'
// and is the desert sheet's first map node (map-redesign §5, reading (a) of §7.4: a needs link and a node, no fight change).
import { DESERT } from './redraw/desert.js';   /* the Caravan's own palette: the desert through the second door and in his rings */
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
/* [hot, body, white core, the deep of it, the char under it]. IT WAS GREEN, AND GREEN FIRE AT THE BOTTOM OF A SCREEN
   IS GRASS. It looked like arcane fire in a Node render and like a verge the moment it was in the game with a boss bar
   sitting on it - which is the exact thing Daniel reported at the top of this tower, one floor up. Violet cannot be
   read as vegetation at any size, it belongs to the tower, and it buys a second thing for nothing: THE ARCHMAGE'S OWN
   SPELLS ARE GREEN, so on a green floor half his telegraphs were camouflaged against the hazard. */
const FIRE = ['#c88aff', '#9a52e0', '#ffe9ff', '#5a2a8a', '#2a1040'];
const NIGHT = ['#241c3c', '#9a8fd0'];   /* what shows through his windows: the tower's own violet night, and a star in it */
/* a steady per-column wobble, so the fire's edge is a line of flame and not a ruled edge */
const lick = (x, t) => Math.sin(x * 0.21 + t * 3.1) * 2 + Math.sin(x * 0.07 - t * 1.7) * 2;

/* THE HALL. Drawn at the UNSQUEEZED box, always: the storm walls close inside the masonry, they do not move it.
   EVERY HORIZONTAL LOOP IN HERE IS CLAMPED TO THE VIEWPORT. The room is a thousand pixels wide and the screen is 320,
   so walking the whole width per frame was ~1000 fillRects a pass for scenery that is almost all off-screen. */
export function drawSanctum(g, L, A, cx, cy, time, box) {
  const x0 = Math.round(box.x0 - cx), x1 = Math.round(box.x1 - cx), w = x1 - x0;
  const top = Math.round(box.y0 - cy), flr = Math.round(A.floor - cy), ft = Math.round(fireTop(A) - cy);
  const H = g.canvas.height, VW = g.canvas.width;
  const L0 = x0 - SANCTUM.wall, R0 = x1 + SANCTUM.wall;
  const vx0 = Math.max(L0, -8), vx1 = Math.min(R0, VW + 8);              /* nothing is drawn past the edges of the screen */
  const band = (x, y, ww, hh, col) => { const a = Math.max(x, -8), b = Math.min(x + ww, VW + 8); if (b > a) { g.fillStyle = col; g.fillRect(a, y, b - a, hh); } };
  // the room's own dark, over the level's sky: inside here there is no sky
  band(L0 - 40, top - SANCTUM.vault - 40, w + SANCTUM.wall * 2 + 80, (flr - top) + SANCTUM.vault + 80, STONE[0]);
  // THE BACK WALL: ashlar courses, a string course, and the tower's night showing through tall lancet windows
  band(x0, top, w, flr - top, STONE[1]);
  for (let y = top; y < flr; y += 11) band(x0, y, w, 1, STONE[2]);
  /* WINDOWS, NOT A BLIND ARCADE. The arcade was dark recesses standing on the floor, and at play size it read as a row
     of gravestones on a lawn. An opening with a LIT JAMB and the night behind it reads as a wall from the first frame,
     and it puts the one cold colour in the room where it can do some good. They sit high, clear of the fire. */
  { const wy = top + 22, wh = Math.min(70, Math.max(24, (ft - 30) - wy));
    for (let ax = x0 + 30 + (((-(x0 + 30) + vx0 - 100) / 86 | 0) * 86); ax < vx1 + 40; ax += 86) {
      if (ax < x0 + 20 || ax + 18 > x1 - 20 || ax > VW + 20 || ax + 18 < -20) continue;
      g.fillStyle = STONE[3]; g.fillRect(ax, wy + 9, 14, wh - 9);
      for (let k = 0; k < 9; k++) g.fillRect(ax + k, wy + 9 - k, 14 - k * 2, 1);          /* the lancet's point, stepped */
      g.fillStyle = NIGHT[0]; g.fillRect(ax + 2, wy + 11, 10, wh - 13);                    /* the night outside his tower */
      g.fillStyle = NIGHT[1]; g.fillRect(ax + 4 + ((ax >> 2) % 5), wy + 16 + ((ax >> 1) % 17), 1, 1);   /* one star in some of them */
      g.fillStyle = STONE[4]; g.fillRect(ax - 2, wy + 8, 2, wh - 8); g.fillRect(ax + 14, wy + 8, 2, wh - 8);   /* the lit jamb */
      g.fillRect(ax - 3, wy + wh - 2, 20, 2);                                              /* and a sill under it */
    } }
  // THE SIDE WALLS, with a lit inner course: the room has to read as held in, not cropped
  for (const [sx, dir] of [[L0, 1], [x1, -1]]) {
    if (sx > VW + 8 || sx + SANCTUM.wall < -8) continue;
    g.fillStyle = STONE[1]; g.fillRect(sx, top - SANCTUM.vault, SANCTUM.wall, (flr - top) + SANCTUM.vault + 8);
    g.fillStyle = STONE[3]; for (let y = top - SANCTUM.vault; y < flr; y += 9) g.fillRect(sx, y, SANCTUM.wall, 1);
    const inner = dir > 0 ? sx + SANCTUM.wall - 2 : sx;
    g.fillStyle = STONE[4]; g.fillRect(inner, top - SANCTUM.vault, 2, (flr - top) + SANCTUM.vault);
    g.fillStyle = 'rgba(200,138,255,0.12)'; g.fillRect(inner - (dir > 0 ? 0 : 2), ft - 40, 4, 40);   /* firelight up the wall */
  }
  // THE VAULT: ribs springing off both walls to a ridge, and black above it
  band(L0, top - SANCTUM.vault - 40, w + SANCTUM.wall * 2, 40, STONE[5]);
  band(x0, top - SANCTUM.vault, w, SANCTUM.vault, STONE[1]);
  g.fillStyle = STONE[3];
  for (let rx = L0 - 40 + ((((vx0 - (L0 - 40)) / 64 | 0)) * 64); rx < vx1 + 64; rx += 64)
    for (let k = 0; k < SANCTUM.vault; k++) { const s = Math.round(k * 1.1); g.fillRect(rx + s, top - SANCTUM.vault + k, 2, 1); g.fillRect(rx + 64 - s - 2, top - SANCTUM.vault + k, 2, 1); }
  band(L0, top - SANCTUM.vault, w + SANCTUM.wall * 2, 1, STONE[4]);
  // THE BRAZIERS on the side walls, burning the same green: the only light in here is his
  for (const [bx, by] of [[x0 + 6, top + 40], [x1 - 10, top + 40], [x0 + 6, ft - 66], [x1 - 10, ft - 66]]) {
    if (by < -20 || by > H + 20 || bx < -20 || bx > VW + 20) continue;
    g.fillStyle = STONE[4]; g.fillRect(bx, by, 4, 12); g.fillRect(bx - 2, by - 3, 8, 3);
    const f = Math.sin(time * 7 + bx) * 1.5;
    g.fillStyle = FIRE[1]; g.fillRect(bx - 1, by - 8 + f, 6, 6); g.fillStyle = FIRE[2]; g.fillRect(bx + 1, by - 6 + f, 2, 3);
  }
  /* THE FLOOR OF FIRE. This was a flat green slab with a wavy top edge, and at play size that is not fire, it is A
     LAWN - the one thing this batch has just finished scraping off the top of the tower. Fire is TONGUES: a charred
     bed you can see between them, each one its own height and its own beat, tapering to a hot tip. */
  if (ft < H + 24 && flr > -24) {
    /* the body of it: DARKER AS IT GOES DOWN, so the fire has a depth. A single flat fill for the whole band was the
       lawn again, just lower down the screen. */
    band(L0, ft + 4, w + SANCTUM.wall * 2, flr - ft + 8, FIRE[3]);
    band(L0, ft + 15, w + SANCTUM.wall * 2, flr - ft - 11, '#3d1a66');
    band(L0, ft + 21, w + SANCTUM.wall * 2, flr - ft - 9, FIRE[4]);
    /* THE TONGUES. Evenly spaced columns of an even height are a level meter, not a fire, so each one takes its height
       from two beats at different rates PLUS a fixed per-column offset, and a third of them are skipped outright to
       leave gaps you can see the burnt bed through. */
    /* THE MOLTEN SURFACE. Without it the tongues were a row of green spikes standing on a dark strip - a level meter.
       A fire needs the thing it is burning ON to be alight too: one continuous glowing line, rolling slowly, and the
       tongues rise out of that. */
    for (let x = vx0; x < vx1; x++) {
      const wx = x + cx, s = Math.round(Math.sin(wx * 0.13 + time * 2.2) * 1.6 + Math.sin(wx * 0.41 - time * 3.1) * 0.9);
      g.fillStyle = FIRE[1]; g.fillRect(x, ft + 12 + s, 1, 5);
      g.fillStyle = FIRE[0]; g.fillRect(x, ft + 12 + s, 1, 2);
      if ((((wx) | 0) + Math.floor(time * 5)) % 23 === 0) { g.fillStyle = FIRE[2]; g.fillRect(x, ft + 12 + s, 1, 1); }
    }
    for (let x = vx0; x < vx1; x += 3) {
      const wx = x + cx, base = ft + 14, seed = Math.sin(wx * 12.9898) * 43758.5453, r = seed - Math.floor(seed);
      if (r < 0.15) continue;
      const h0 = 3 + r * 5 + Math.abs(Math.sin(wx * 0.19 + time * 2.6) + Math.sin(wx * 0.052 - time * 1.5) * 0.7) * 9;
      for (let k = 0; k < h0; k++) {
        const u = k / h0, wid = u > 0.7 ? 1 : u > 0.35 ? 2 : 3;
        g.fillStyle = u > 0.86 ? FIRE[2] : u > 0.42 ? FIRE[0] : FIRE[1];
        g.fillRect(x + ((3 - wid) >> 1), base - k, wid, 1);
      }
      if ((((wx / 3) | 0) + Math.floor(time * 7)) % 11 === 0) { g.fillStyle = FIRE[2]; g.fillRect(x + 1, base - h0 - 3 - (Math.floor(time * 9 + wx) % 4), 1, 2); }   /* embers off the tips */
    }
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 5; k++) band(L0, ft - 6 - k * 9, w + SANCTUM.wall * 2, 9, 'rgba(154,82,224,0.055)');
    g.globalCompositeOperation = 'source-over';
  }
}

/* UNDER THE FIRE IS STONE, NOT THE TOWER (round 2). The hall is painted at the carpet box, and the fight's camera looks some 70 px
   below its floor - where the parapet, its sign and the crown's last checkpoint are real tiles and real props, drawn in the world
   over everything the hall had painted. So the hall is closed at the bottom too: the vault under the burning floor, drawn after the
   world's props, from the foot of the fire to the bottom of the screen. */
export function drawSanctumUnder(g, A, cx, cy) {
  const top = Math.round(A.floor + 12 - cy), H = g.canvas.height, VW = g.canvas.width; if (top >= H) return;
  g.fillStyle = STONE[3]; g.fillRect(0, top, VW, H - top);
  g.fillStyle = STONE[5]; for (let y = top + 6; y < H; y += 9) g.fillRect(0, y, VW, 1);
  g.fillStyle = FIRE[4]; g.fillRect(0, top, VW, 2);
}
// ---------------------------------------------------------------- the doors
/* [spark, hot spark, and the THREE COLOURS OF WHAT IS THROUGH IT, rim inward]. The two doors are opposites on purpose:
   the first is a well going down into his tower and gets darker towards the middle; the second is a hole full of
   MORNING and gets brighter, so that after a whole level of violet night you can see where it goes before you reach it. */
const PORT = {
  in: ['#b07cf0', '#e0c8ff', '#4a2a7a', '#32205a', '#1c1030'],
  out: ['#e0b050', '#ffe9b0', '#a06a24', '#e0975e', '#ffe9b0'],
};
/* A DOOR IN THE AIR: a standing oval, its rim turning, and somewhere else inside it. 28x40.
   `on` runs 0..1 so a portal can open rather than appear. */
export function drawPortal(g, x, y, time, kind = 'in', on = 1) {
  const C = PORT[kind] || PORT.in, k = Math.max(0, Math.min(1, on));
  x = Math.round(x); y = Math.round(y);
  const rw = Math.round(13 * k), rh = Math.round(19 * k); if (rw < 1 || rh < 1) return;
  /* THE WAY OUT IS FULL OF DESERT (round 2): what is through it is what you will stand in */
  if (kind === 'out') drawDesertOval(g, x, y - rh, rw, rh, time, 1.3);
  else for (let dy = -rh; dy <= rh; dy++) {
    const f = 1 - (dy / rh) * (dy / rh); if (f <= 0) continue;
    const half = Math.round(rw * Math.sqrt(f) + Math.sin(time * 4 + dy * 0.5) * 0.8);
    if (half < 1) continue;
    /* the three bands of the other side, so an oval of one flat colour becomes a way THROUGH something */
    for (let dx = -half; dx < half; dx++) {
      const u = Math.max(Math.abs(dx) / Math.max(1, half), Math.abs(dy) / rh);
      g.fillStyle = u > 0.82 ? C[2] : u > 0.45 ? C[3] : C[4];
      g.fillRect(x + dx, y + dy - rh, 1, 1);
    }
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
  /* CLAMPED ON ALL FOUR SIDES. It was clamped on three: never in a wall, never in the fire - and nothing stopped a
     boss who died high from opening the way out INSIDE THE VAULT, where it cannot be flown into. The room's ceiling is
     carpetBox's y0 (A.y0 + 24); the door hangs a portal's height below it. */
  const x0 = A.x0 + 60, x1 = A.x1 - 60, top = A.y0 + 24 + 30, bot = fireTop(A) - 44;
  S.out = { x: Math.max(x0, Math.min(x1, x)), y: Math.max(top, Math.min(bot, y)) };
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

// ---------------------------------------------------------------- the desert
/* THE WAY OUT OPENS ONTO THE DESERT (round 2, docs/briefs/falling-tower-round2.md §2). The sandy path - a sandstone cutting walled at
   both ends, a rise and a sundial - is gone. Through the second door you stand on open sand under THE SUNKEN CARAVAN's own sky, with
   the level's end a few steps on, and the same desert is what you see inside the door before you go through it, and inside every
   ring the Archmage opens in the fight (src/undead-mage.js). One desert, drawn from the Caravan's own palette (src/redraw/desert.js). */

/* A HOLE FULL OF DESERT: an upright oval centred on (cx, cy), rw x rh, with the Caravan's sky, a sun low in it, and dunes under a
   horizon that rolls. Drawn a COLUMN at a time (a few fillRects a column, not one a pixel), so three rings and a door cost little. */
export function drawDesertOval(g, cx, cy, rw, rh, time, seed = 0) {
  cx = Math.round(cx); cy = Math.round(cy); if (rw < 2 || rh < 2) return;
  const b1 = cy - rh * 0.5, b2 = cy - rh * 0.12, b3 = cy + rh * 0.08, sky = [DESERT.sky0, DESERT.sky1, DESERT.sky2, DESERT.sky3];
  for (let dx = -rw; dx <= rw; dx++) {
    const f = 1 - (dx / rw) * (dx / rw); if (f <= 0) continue;
    const hh = Math.round(rh * Math.sqrt(f)), y0 = cy - hh, y1 = cy + hh, x = cx + dx;
    const hz = Math.round(cy + rh * 0.18 + Math.sin(dx * 0.33 + seed + time * 0.4) * rh * 0.07);          /* the far dune line */
    const hz2 = Math.round(cy + rh * 0.52 + Math.sin(dx * 0.21 - seed * 1.7 - time * 0.3) * rh * 0.06);   /* a nearer crest */
    const cuts = [y0, Math.max(y0, Math.min(b1, hz)), Math.max(y0, Math.min(b2, hz)), Math.max(y0, Math.min(b3, hz)), Math.max(y0, Math.min(y1, hz))];
    for (let k = 0; k < 4; k++) if (cuts[k + 1] > cuts[k]) { g.fillStyle = sky[k]; g.fillRect(x, cuts[k], 1, cuts[k + 1] - cuts[k]); }
    if (hz < y1) { g.fillStyle = DESERT.dune; g.fillRect(x, hz, 1, y1 - hz); g.fillStyle = DESERT.duneL; g.fillRect(x, hz, 1, 1);
      if (hz2 < y1 && hz2 > hz) { g.fillStyle = DESERT.duneD; g.fillRect(x, hz2, 1, Math.min(2, y1 - hz2)); g.fillStyle = DESERT.duneL; g.fillRect(x, hz2 - 1, 1, 1); } }
  }
  /* the sun, low over the sand, and the heat off it */
  const sx = cx + Math.round(rw * 0.3), sy = Math.round(cy - rh * 0.05), sr = Math.max(1, Math.round(Math.min(rw, rh) * 0.2));
  for (let dy = -sr; dy <= sr; dy++) { const half = Math.round(Math.sqrt(sr * sr - dy * dy)); if (Math.abs(sx - cx) + half >= rw * 0.9) continue; g.fillStyle = '#fff6e0'; g.fillRect(sx - half, sy + dy, half * 2 + 1, 1); }
  g.fillStyle = 'rgba(242,215,156,0.8)'; for (let i = 0; i < 3; i++) { const t = (time * 0.7 + i * 0.37 + seed) % 1, px = cx - rw * 0.6 + t * rw * 1.2, py = cy + rh * (0.25 + i * 0.12); if (Math.abs(px - cx) < rw * 0.8) g.fillRect(Math.round(px), Math.round(py), 2, 1); }
}

/* THE DESERT ITSELF, behind the sand tiles past the second door: the Caravan's sky and far mesas and middle dunes (baked by main.js
   from src/redraw/desert.js and handed in as D), laid on the horizon of the sand you are standing on, and the road's first wreck
   on it - so the last seconds of the tower look like the first of THE SUNKEN CARAVAN, because they are the road into it. */
export function drawDesertEnd(g, L, cx, cy, time, D) {
  const H = g.canvas.height, W = g.canvas.width, S = L.sanctum, horizon = Math.round((S && S.sand ? S.sand.y : H * 0.8 + cy) - cy);
  g.drawImage(D.sky, 0, 0, 1, D.sky.height, 0, 0, W, H);
  const lay = (c, par, bottom) => { if (!c) return; const w = c.width, y = Math.round(bottom - c.height); let x = -(((cx * par) % w) + w) % w; for (; x < W; x += w) g.drawImage(c, Math.round(x), y); };
  lay(D.far, 0.08, horizon - 14); lay(D.mid, 0.2, horizon + 6);
  /* the road into the next level: a caravan's wreck half in the sand, a skull, a dead tree - where they stand in the world */
  for (const [c, wx] of [[D.tree, S ? S.sand.x - 7 * 16 : 0], [D.wagon, S ? S.sand.x + 24 * 16 : 0], [D.skull, S ? S.sand.x + 8 * 16 : 0]]) { if (!c) continue;
    const x = Math.round(wx - cx - c.width / 2); if (x > W || x + c.width < 0) continue; g.drawImage(c, x, horizon - c.height + 3); }
  /* sand on the wind, the way you are walking */
  for (let i = 0; i < 30; i++) { const px = ((i * 137 + time * 42) % (W + 40)) - 20, py = (i * 53 + Math.sin(time + i) * 6) % H;
    g.fillStyle = i % 3 ? 'rgba(242,201,138,0.30)' : 'rgba(255,233,176,0.45)'; g.fillRect(Math.round(px), Math.round(py), 2, 1); }
}
