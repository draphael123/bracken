// src/archmage-chase.js - THE CHASE (claude/fallingtower3; Daniel 10-27 12:21, scratch/brief-fallingtower3.md "BOSS CHANGE"): the Undead
// Archmage's fight becomes a CHASE THROUGH HIS TOWER. At the top of his spiral stair he goes through his ring (where his carpet used to lie),
// and it lets you out in THE ROOMS UNDER HIS STAIR - four rooms stacked one over the next, each a short arena beat with its own ledges - and
// under the last, THE CORE, where his carpet waits and carries the chase up to his hall for the end of it.
//   HIS ATTACKS DO NOT CHANGE: every spell is his fight's own (undead-mage.js: same tells, same timings, same numbers); each room casts a
//   few of them in its own order (ROOMS[k].order), the way his stair taught them one flight at a time. The hall keeps his whole kit and realms.
//   THE OPENING STAYS: strike his spell back at him (or let his death mark find no one, or dodge through his own ring) and HE FALLS - down
//   out of the air onto the room's floor, open (gold, x2) for CH.downT s - HIT HIM - and then he FLEES DOWN THROUGH HIS TOWER:
//     'strike'  he sinks through the floor, and its CRACKED PILLAR lights: STRIKE IT and the floor goes, and you drop after him (the
//               level's verb - src/tower-supports.js - as the boss's exam: you break it to follow him)
//     'pour'    he breaks the floor UNDER YOU (told: the crack runs wall to wall, grit pouring, CH.tearT s) and you are poured down with him
//   The last floor pours you into THE CORE onto his carpet: up you go, through his door, and the rest is fought in his hall (the leg switch:
//   main.js chaseToHall - L.arena becomes the hall, his realms come relative to what is left of him, e.realmAt).
//   He goes no lower than CH.hpFloor of his health in the rooms (a blow past it is only his stagger): the hall always has its realms.
//   A death anywhere in the fight brings you back to the ring you came out of, the rooms whole again (chaseReset) - a boss is fought whole.
// Numbers are tiles unless named px or s.
export const CH = { x0: 80, x1: 105, top: 152, pitch: 15, open: 13, downT: 3.0, riseT: 0.5, sinkT: 0.9, tearT: 1.3, wakeT: 1.2, fallG: 1100, hpFloor: 0.45, hover: 4 };
export const ROOMS = [
  { name: 'THE SCRIPTORIUM', kind: 'library', order: ['fire', 'ice', 'fire', 'mark'], follow: 'strike', pillar: 93,
    ledges: [[83, 5, 3], [98, 5, 3], [88, 4, 6]] },
  { name: 'THE RELIQUARY', kind: 'reading', order: ['fire', 'hand', 'ice', 'poison'], follow: 'pour',
    ledges: [[82, 5, 3], [91, 4, 3], [100, 5, 3], [86, 4, 6], [96, 4, 6]] },
  { name: 'THE CELLAR', kind: 'lab', order: ['fire', 'storm', 'ice', 'mark', 'hand'], follow: 'strike', pillar: 86,
    ledges: [[89, 4, 3], [97, 5, 3], [92, 4, 6]] },
  { name: 'THE FOUNDATION', kind: 'orrery', order: ['fire', 'ice', 'mark', 'poison', 'storm', 'hand'], follow: 'pour', last: true,
    ledges: [[82, 5, 3], [99, 5, 3], [90, 6, 6]] },
];
/* room k in rows: its open rows top..floor-1, its floor two rows (floor, floor + 1); you stand on row floor - 1 */
export const roomOf = k => { const top = CH.top + CH.pitch * k; return { k, top, floor: top + CH.open, ...ROOMS[k] }; };
export const CORE = (() => { const top = CH.top + CH.pitch * ROOMS.length; return { top, bot: top + 24, carpet: { x: Math.round((CH.x0 + CH.x1 + 1) / 2) * 16, y: (top + 23) * 16 } };   /* (the rug a tile over the core's floor: you land on it, or it on you) */ })();
/* the arena's box for room k (px): his sky in it is the room over your head - he hovers CH.hover rows over its floor at the lowest */
export const roomArena = k => { const R = roomOf(k); return { x0: CH.x0 * 16, x1: (CH.x1 + 1) * 16, y0: R.top * 16, floor: R.floor * 16 }; };
export const chaseBox = k => { const R = roomOf(k); return { x0: CH.x0 * 16, x1: (CH.x1 + 1) * 16, y0: R.top * 16, y1: (R.floor - CH.hover) * 16 }; };
/* which room a body at (x, y px) is in (-1: none; ROOMS.length: the core) */
export function roomAt(x, y) { if (x < CH.x0 * 16 - 8 || x > (CH.x1 + 1) * 16 + 8) return -1; const r = y / 16;
  for (let k = 0; k < ROOMS.length; k++) { const R = roomOf(k); if (r > R.top - 0.5 && r <= R.floor + 0.2) return k; }
  return r > CORE.top - 0.5 && r < CORE.bot ? ROOMS.length : -1; }
export const inChase3 = (L, x, y) => !!(L && L.chase3) && roomAt(x, y) >= 0;
/* WHAT EACH ROOM'S FLOOR TAKES WITH IT: its two floor rows wall to wall and every ledge of the room (the room breaks under you) */
export function roomClear(k) { const R = roomOf(k); return [[CH.x0, CH.x1, R.floor, R.floor + 1], ...R.ledges.map(([x0, len, up]) => [x0, x0 + len - 1, R.floor - up, R.floor - up])]; }
/* BUILD IT into the tower's grid (tower-ascent.js's toolkit: rect, ledge, ent, interiors) under the spiral stair, in its own columns */
export function buildChase3(k, T, TS = 16) {
  const { rect, ledge, ent, interiors } = k, supports = [];
  ROOMS.forEach((_, i) => { const R = roomOf(i);
    rect(CH.x0, CH.x1, R.top, R.floor - 1, T.AIR); interiors.push([CH.x0, CH.x1, R.top, R.floor - 1, R.kind]);
    for (const [x0, len, up] of R.ledges) ledge(x0, len, R.floor - up);
    if (R.follow === 'strike') supports.push({ t: 'ftsupport', id: 'chase-' + i, kind: 'floor', room: i, col: R.pillar, row: R.floor - 1, h: 3, x: R.pillar * TS + 8, y: R.floor * TS, arm: true,
      clear: roomClear(i), hold: 'IT HOLDS - HE IS NOT THROUGH IT YET', tellSay: 'THE FLOOR GOES', say: 'THE FLOOR GOES: AFTER HIM' }); });
  rect(CH.x0, CH.x1, CORE.top, CORE.bot - 1, T.AIR); interiors.push([CH.x0, CH.x1, CORE.top, CORE.bot - 1, 'dome']);
  const R0 = roomOf(0);
  ent('ringdoor', CH.x0 + 2, R0.floor - 1, { id: 'chase-top' });
  ent('check', CH.x0 + 4, R0.floor - 1);
  ent('sign', CH.x0 + 6, R0.floor - 1, { text: 'STRIKE HIS SPELLS BACK AT HIM AND HE FALLS. HIT HIM WHERE HE LIES.' });
  ent('sign', ROOMS[0].pillar - 2, R0.floor - 1, { text: 'A CRACKED PILLAR HOLDS THIS FLOOR. WHEN HE IS THROUGH IT, STRIKE IT.' });
  ent('undeadmage', CH.x1 - 5, R0.floor - CH.hover - 2, { face: -1 });
  return { rooms: ROOMS.map((_, i) => roomOf(i)), core: CORE, supports, start: [CH.x0 + 4, R0.floor - 1], trigger: (CH.x0 + 6) * TS };
}
/* THE CHASE, ONE STEP OF HIS (called from inside updateUndeadMage, after his bolts, clouds and rings have moved: true = it took the frame).
   c: { P, say(m, hard), callout(m), sound(k), shake(n), dust(x, y, n), arm(k), clearRoom(k), setRoom(k), away() }. */
const OPENINGS = new Set(['reflected', 'gather', 'breached']);
export const CHASE_MODES = new Set(['fall', 'down', 'rise', 'sink', 'tear', 'below', 'away']);
export function chaseLeg(e, dt, c) {
  if (e.leg !== 'chase') return false;
  const P = c.P, R = roomOf(e.room || 0);
  e.order = R.order; e.noRealm = true;
  if (OPENINGS.has(e.mode)) {   /* HIS OWN SPELL STAGGERS HIM - and on foot, in his tower, he FALLS */
    e.mode = 'fall'; e.modeT = 9; e.vy = 0; e.deathMark = null; e.bones = null; e.orbit = null; e.script = null; e.void = null; e.fireRing = null; e.chained = false;
    for (const q of e.rings || []) q.life = Math.min(q.life, q.t + 0.2);
    c.say('HE FALLS: STRIKE HIM WHERE HE LIES', true); c.sound('crack'); return true; }
  if (!CHASE_MODES.has(e.mode)) return false;
  const floorY = R.floor * 16;
  if (e.mode === 'fall') { e.vy = (e.vy || 0) + CH.fallG * dt; e.y += e.vy * dt;
    if (e.y >= floorY) { e.y = floorY; e.vy = 0; e.mode = 'down'; e.modeT = CH.downT; e.open = CH.downT; e.face = Math.sign(P.x - e.x) || 1; c.sound('heavy'); c.shake(5); c.dust(e.x, floorY, 12); }
    return true; }
  if (e.mode === 'down') { e.y = floorY; if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = CH.riseT; c.say(R.last ? 'HE FLEES DOWN - INTO THE CORE OF HIS TOWER' : 'HE FLEES DOWN THROUGH HIS TOWER', true); c.sound('mageBolt'); } return true; }
  if (e.mode === 'rise') { e.y -= 70 * dt; if (e.modeT > 0) return true;
    if (R.follow === 'strike') { e.mode = 'sink'; e.modeT = CH.sinkT; c.sound('hiss'); }
    else { e.mode = 'tear'; e.modeT = CH.tearT; e.tear = { k: R.k, t: 0 }; c.say('HE BREAKS THE FLOOR UNDER YOU', true); c.sound('rumble'); c.shake(3); }
    return true; }
  if (e.mode === 'sink') { e.y += 60 * dt; if (e.modeT > 0) return true;   /* through the stone, as his kind do: and its pillar lights */
    toBelow(e, R.k + 1); c.arm(R.k); c.callout('STRIKE THE CRACKED PILLAR: THE FLOOR GOES, AND YOU AFTER HIM'); return true; }
  if (e.mode === 'tear') { e.tear.t += dt; if (Math.random() < dt * 20) c.dust(CH.x0 * 16 + Math.random() * (CH.x1 - CH.x0 + 1) * 16, floorY, 1);
    if (e.modeT > 0) return true; e.tear = null; c.clearRoom(R.k); c.sound('stone'); c.shake(8);
    if (R.last) { e.mode = 'away'; e.modeT = 99; c.away(); } else toBelow(e, R.k + 1);
    return true; }
  if (e.mode === 'below') { const N = roomOf(e.waitIn), here = roomAt(P.x, P.y);   /* he waits in the room under; when you are down in it, it is the fight's room */
    e.y = (N.floor - CH.hover - 2) * 16 + Math.sin((e.anim || 0) * 2.3) * 3;
    if (here === N.k && (P.ground || P.y > (N.floor - 2) * 16)) { e.room = N.k; e.mode = 'wake'; e.modeT = CH.wakeT; e.turn = 0; e.order = N.order; e.wardHold = 0; c.setRoom(N.k); c.say(N.name, false); }
    return true; }
  if (e.mode === 'away') return true;
  return false;
}
function toBelow(e, k) { const N = roomOf(k); e.waitIn = k; e.mode = 'below'; e.modeT = 99; e.x = (CH.x1 - 5) * 16; e.y = (N.floor - CH.hover - 2) * 16; e.shots = []; e.clouds = []; e.rings = []; e.echoes = []; e.deathMark = null; }
/* A FRESH FIGHT (a death, a load): him asleep in the first room, every room whole (the caller restores the tiles) */
export function chaseFresh(e) { e.leg = 'chase'; e.room = 0; e.order = ROOMS[0].order; e.noRealm = true; e.realmAt = null; e.tear = null; }
/* THE CRACK RUNNING ACROSS A FLOOR HE BREAKS (greybox: the art lane paints it) */
export function drawChase3(g, e, cx, cy, time, VW) {
  if (!e || !e.alive || !e.tear) return; const R = roomOf(e.tear.k), k = Math.min(1, e.tear.t / CH.tearT), y = Math.round(R.floor * 16 - cy), x0 = Math.round(CH.x0 * 16 - cx), w = (CH.x1 - CH.x0 + 1) * 16;
  const mid = (e.x - cx), reach = w * k;
  g.fillStyle = Math.floor(time * 14) % 2 ? '#ff6b6b' : '#ffd36b';
  for (let x = 0; x < w; x += 3) { const px = x0 + x; if (Math.abs(px - mid) > reach) continue; g.fillRect(px, y + ((x * 5) % 3), 3, 1); }
  g.globalAlpha = 0.25 * k; g.fillStyle = '#ff9a5c'; g.fillRect(x0, y - 2, w, 3); g.globalAlpha = 1; void VW;
}
