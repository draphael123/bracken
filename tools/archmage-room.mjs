/* tools/archmage-room.mjs — THE ARCHMAGE'S ROOM (2026-09-23). Node only: no page, no port, no Chrome.
     SKIN    every solid cell in the sky rows is CLAIMED by a skins entry. This is the check that matters, because the
             thing Daniel was looking at - a "grass mat" on the crown of a stone tower - was one unlisted row falling
             through to the default ground kit and painting itself with palette.grass. The parapet was one. THE
             CRENELLATIONS WERE ANOTHER, and nobody had noticed those at all. A per-row assert would have fixed the row
             I was told about and left the merlons green, so this asserts the RULE instead of the instance.
     SAND    the cutting past the second door is solid, walled at both ends, and the gate stands on it - and the gate is
             no longer on the parapet, because the level does not end on the kill any more
     ROOM    the spawn is inside the carpet box and clear of the fire; the fire lies INSIDE the box (a hazard you cannot
             reach is not a hazard) and does not fill it (a hazard you cannot leave is not a hazard either)
     DOOR    the way out is clamped into the room wherever he happens to fall - including into the fire, and into a wall
     FIRE    it warns before it bites, it bites on a beat, it shoves you up, and CLIMBING OUT COSTS AT MOST TWO BITES:
             "hurt, not instantly killed" is a number, so it is measured here and not asserted in prose */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { TOWER, SAND } from '../src/tower-ascent.js';
import { carpetBox, CARPET } from '../src/carpet.js';
import { SANCTUM, fireTop, burnSanctum, openSanctumDoor } from '../src/sanctum.js';

const L = LEVELS.find(l => l.id === 'fallingtower').build();
const { W, X0, X1, SKY } = TOWER, TS = 16;
const at = (x, y) => L.grid[y * W + x];
const skins = L.mage.skins;
const claimed = (x, y) => skins.some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d);

// ---------------------------------------------------------------- 1. NOTHING UP HERE GROWS GRASS
{ const bare = [];
  for (let y = 0; y <= SKY + 1; y++) for (let x = 0; x < W; x++) if (at(x, y) === T.SOLID && !claimed(x, y)) bare.push([x, y]);
  assert.equal(bare.length, 0, bare.length + ' solid cells in the sky rows wear no skin, so they paint as GROUND (grass) on a stone tower: ' + JSON.stringify(bare.slice(0, 8)));
  /* and the two that were bare before this batch are named, so a future edit that drops them fails loudly */
  assert.ok(claimed(35, SKY + 1), 'the parapet walk is unskinned again - this is the grass mat');
  assert.ok(claimed(X0 - 2, SKY - 3) && claimed(X1 + 2, SKY - 3), 'the crenellations are unskinned again');
}

// ---------------------------------------------------------------- 2. THE SANDY PATH
{ for (let x = SAND.x0; x <= SAND.x1; x++) assert.equal(at(x, SAND.row), T.SOLID, 'the sand bank has a hole at x' + x);
  for (let x = SAND.step; x <= SAND.x1; x++) assert.equal(at(x, SAND.row - 1), T.SOLID, 'the rise to the gate has a hole at x' + x);
  assert.equal(at(SAND.x0 - 1, SAND.row - 1), T.SOLID, 'the cutting is open at its near end: you can walk off the world');
  assert.equal(at(SAND.x1 + 1, SAND.row - 2), T.SOLID, 'the cutting is open at its far end');
  const gate = L.ents.find(e => e.t === 'gate');
  assert.ok(gate, 'no gate');
  assert.ok(gate.y < SAND.row && gate.y >= SAND.row - 3, 'the gate is not on the sand (y ' + gate.y + ')');
  assert.ok(gate.y < SKY, 'the gate is still up on the parapet: the level would end where the fight does');
  assert.equal(at(gate.x, gate.y), T.AIR, 'the gate is buried in the bank');
  assert.equal(at(gate.x, gate.y + 1), T.SOLID, 'the gate has no footing under it');
}

// ---------------------------------------------------------------- 3. WHERE THE TWO DOORS PUT YOU
const A = L.arena, S = L.sanctum, box = carpetBox(A, 0), ft = fireTop(A);
{ assert.ok(S, 'the level hands over no sanctum');
  assert.deepEqual(S.in, L.carpetAt, 'the door in has moved off the carpet\'s own board check, so nothing opens it');
  assert.ok(S.spawn.x > box.x0 && S.spawn.x < box.x1, 'you come out through a wall');
  assert.ok(S.spawn.y > box.y0 && S.spawn.y < ft - 40, 'you come out in the ceiling or in the fire');
  /* the sand door: you land ON the path, not in it and not over it */
  assert.equal(at(Math.floor(S.sand.x / TS), Math.floor(S.sand.y / TS) - 1), T.AIR, 'you come out of the second door inside the bank');
  assert.equal(at(Math.floor(S.sand.x / TS), Math.floor(S.sand.y / TS)), T.SOLID, 'you come out of the second door over a hole');
}

// ---------------------------------------------------------------- 4. THE FIRE IS IN THE ROOM, AND THE ROOM IS NOT THE FIRE
{ assert.ok(ft > box.y0, 'the fire is above the ceiling');
  assert.ok(ft < box.y1, 'the fire is below the floor you can reach: it can never be touched');
  const air = ft - box.y0, deep = box.y1 - ft;
  assert.ok(deep > 8, 'the fire is ' + deep + 'px deep - too thin to be a place you can be in');
  assert.ok(air > 120, 'only ' + air + 'px of room over the fire: the hall is a corridor');
}

// ---------------------------------------------------------------- 5. THE DOOR OUT OPENS WHEREVER HE FALLS
for (const [name, x, y] of [['far left', A.x0 - 200, 700], ['far right', A.x1 + 200, 700], ['in the fire', 600, A.floor - 2], ['high', 600, box.y0 - 50]]) {
  const S2 = { open: false, outOpen: 0, t: 0 };
  openSanctumDoor(S2, A, x, y);
  assert.ok(S2.open, 'the door did not open (' + name + ')');
  assert.ok(S2.out.x >= A.x0 + 60 && S2.out.x <= A.x1 - 60, 'the way out opened in a wall (' + name + ': x ' + S2.out.x + ')');
  assert.ok(S2.out.y <= ft - 44, 'the way out opened in the fire (' + name + ': y ' + S2.out.y + ', fire at ' + ft + ')');
  /* and the side this test USED to leave open: a boss who dies high must not put the door in the vault */
  assert.ok(S2.out.y >= box.y0, 'the way out opened above the ceiling (' + name + ': y ' + S2.out.y + ', vault at ' + box.y0 + ')');
  assert.ok(S2.out.y - 19 >= box.y0 - 2, 'the top of the way out is inside the vault (' + name + ')');
}
{ const S2 = { open: true, out: { x: 1, y: 1 }, outOpen: 1 }; openSanctumDoor(S2, A, 600, 600);
  assert.deepEqual(S2.out, { x: 1, y: 1 }, 'the door re-opened somewhere else after it was already open'); }

// ---------------------------------------------------------------- 6. IT HURTS. IT DOES NOT KILL.
const dt = 1 / 60;
const flyer = y => ({ y, x: 600, dead: false, carpet: { hitT: 0 }, vy: 0, burnT: 0 });
{ /* over the fire: nothing, ever */
  const p = flyer(ft - 1); let bites = 0;
  for (let i = 0; i < 600; i++) if (burnSanctum(p, A, dt, { ember: () => {} })) bites++;
  assert.equal(bites, 0, 'the fire bit something that was not in it');
  assert.equal(p.burnT, 0, 'the burn timer runs while you are clear of the floor');
}
{ /* in it: a breath of warning, then a beat */
  const p = flyer(box.y1); let first = -1, bites = 0;
  for (let i = 0; i < 300; i++) { if (burnSanctum(p, A, dt, { ember: () => {} })) { if (first < 0) first = i * dt; bites++; } }
  assert.ok(first >= SANCTUM.warm - dt * 2, 'the fire bit after ' + first.toFixed(2) + 's, before its own warning glow (' + SANCTUM.warm + 's)');
  assert.ok(first <= SANCTUM.warm + dt * 2, 'the fire took ' + first.toFixed(2) + 's to bite: the warning outlasts the warning');
  const want = Math.floor((300 * dt - SANCTUM.warm) / SANCTUM.tick) + 1;
  assert.ok(Math.abs(bites - want) <= 1, 'sitting in the fire for 5s cost ' + bites + ' bites, expected about ' + want);
  assert.ok(p.vy < 0, 'the fire does not shove you out of it');
}
{ /* THE RULE THE ROOM IS FOR, measured both ways: YOU MAY CROSS IT, YOU MAY NOT LIVE ON IT. */
  const cross = flyer(box.y1); let bites = 0, t = 0;                              /* straight up from the deepest point */
  while (cross.y > ft && t < 5) { if (burnSanctum(cross, A, dt, { ember: () => {} })) bites++; cross.y -= CARPET.speed * dt; t += dt; }
  assert.ok(t < 0.5, 'it takes ' + t.toFixed(2) + 's to fly out of the fire: that is a pit, not a floor');
  assert.ok(bites <= 1, 'a clean climb out of the fire costs ' + bites + ' bites - crossing it is meant to be survivable');

  const hover = flyer(box.y1); let hb = 0;                                        /* and a single second of not leaving */
  for (let i = 0; i < 60; i++) if (burnSanctum(hover, A, dt, { ember: () => {} })) hb++;
  assert.ok(hb >= 1, 'a whole second sat in the fire cost nothing: the floor is decoration');

  assert.ok(SANCTUM.warm < (box.y1 - ft) / CARPET.speed, 'the warning (' + SANCTUM.warm + 's) outlasts the ' + (((box.y1 - ft) / CARPET.speed) * 1000 | 0) + 'ms climb out, so the fire can never bite anyone who is leaving OR staying');
  console.log('   crossing the fire: ' + (t * 1000 | 0) + 'ms and ' + bites + ' bite(s); sitting in it: ' + hb + ' bite(s)/s. ' + (box.y1 - ft) + 'px of fire under ' + (ft - box.y0) + 'px of room.');
}

console.log('ok  archmage-room   the crown ends at a door; nothing up here grows grass; the floor burns and lets you out.');
