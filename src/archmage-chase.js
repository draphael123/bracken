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
import { paintFloorCrack, paintSink, paintLanding } from './redraw/tower_chase.js';
import { SPIRAL } from './spiral-chase.js';   /* (claude/ft4a) THE ASCENT rises through his spiral stair's well, over the rooms */
export const CH = { x0: 80, x1: 105, top: 152, pitch: 15, open: 13, downT: 3.0, riseT: 0.5, sinkT: 0.9, tearT: 1.3, wakeT: 1.2, fallG: 1100, hpFloor: 0.65, hover: 4 };
/* FALLING TOWER 4 (claude/ft4a, Daniel 10-29 15:33 "the boss CHASE ROOMS should also feel like they are collapsing around you", brief-fallingtower4-1029.md #3).
   His attacks and numbers do not change; the ROOM comes apart round the fight:
   1. HIS MISSES SHAKE THE TOWER: a firebolt or ice lance that hits stone stops on it (stone stops his shots, as on his stair) and knocks masonry loose
      over where it struck - down on a TOLD shadow (FT2's debris: tower-fall2.js, its tell and its 12) at most debMax at a time, one every debEvery s.
      Stone that comes down ON HIM drops him like his own spell ('crushed').
   2. THE ROOM FAILS IN 3 STAGES: cracks run up its walls from the first moment (stage 1); from stage2 s its ledges go one at a time (stage 2: each
      told dropTell s - creak, grit, the crack red - never the one you stand on when it is chosen); then his floor or its pillar (stage 3, as FT3).
   3. THE VAULT PILLAR: a cracked column from floor to vault in every room (ROOMS[k].vault). Strike it while he hovers over its CRUSH box (the ghost
      shows it on the floor) and the vault comes down on him: he FALLS ('crushed', an opening beside his struck-back spell) - one use a room.
   4. COVER: the fallen column lies across the floor (coverW x 2 rows of stone): his shots break on it; his mark and storm ignore it.
   A floor at his rooms' hpFloor: HE HOLDS ON - his 'down' is cut short (heldDown s), so no gold window does nothing. */
/* (ft4a) each room's vault pillar sign, its own words (tools/signs.mjs: no two signs the same) */
const VAULT_SIGNS = ['A CRACKED PILLAR HOLDS THE VAULT. STRIKE IT WITH HIM OVER IT AND IT COMES DOWN ON HIM.', 'ANOTHER CRACKED PILLAR UNDER THE VAULT: BRING IT DOWN ON HIM.', 'THE VAULT HANGS ON A CRACKED PILLAR: WAIT FOR HIM TO HOVER OVER IT.', 'THE LAST CRACKED PILLAR UNDER HIS VAULT: BRING IT DOWN ON HIM.'];
export const FALL4 = { stage2: 5, dropEvery: 4, dropTell: 1.5, debEvery: 1.2, debMax: 2, vaultH: 12, coverW: 3, coverZone: 6, nearMiss: 90, heldDown: 0.35 };
export const ROOMS = [
  { name: 'THE SCRIPTORIUM', kind: 'library', order: ['fire', 'ice', 'fire', 'mark'], follow: 'strike', pillar: 93, vault: 104, crush: [92, 105],
    ledges: [[83, 5, 3], [98, 5, 3], [88, 4, 6]] },
  { name: 'THE RELIQUARY', kind: 'reading', order: ['fire', 'hand', 'ice', 'poison'], follow: 'pour', vault: 81, crush: [80, 93],
    ledges: [[82, 5, 3], [91, 4, 3], [100, 5, 3], [86, 4, 6], [96, 4, 6]] },
  { name: 'THE CELLAR', kind: 'lab', order: ['fire', 'storm', 'ice', 'mark', 'hand'], follow: 'strike', pillar: 86, vault: 103, crush: [92, 105],
    ledges: [[89, 4, 3], [97, 5, 3], [92, 4, 6]] },
  { name: 'THE FOUNDATION', kind: 'orrery', order: ['fire', 'ice', 'mark', 'poison', 'storm', 'hand'], follow: 'pour', last: true, vault: 81, crush: [80, 93],
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
export function roomClear(k) { const R = roomOf(k); return [[CH.x0, CH.x1, R.floor, R.floor + 1], ...R.ledges.map(([x0, len, up]) => [x0, x0 + len - 1, R.floor - up, R.floor - up]), coverOf(k)]; }
/* (ft4a) WHERE THE VAULT PILLAR'S COLUMN MAY LIE when it falls: a zone of coverZone tiles beside its foot toward the room's middle, two rows high. The column is
   coverW of it - laid at the first place in the zone clear of the hero (main.js chase3Vault: never round you - a knight entombed by it stood there to the timeout) */
export const coverSide = k => roomOf(k).vault < (CH.x0 + CH.x1) / 2 ? 1 : -1;
export function coverOf(k) { const R = roomOf(k), d = coverSide(k), a = R.vault + d * 2, b = R.vault + d * (1 + FALL4.coverZone); return [Math.min(a, b), Math.max(a, b), R.floor - 2, R.floor - 1]; }
/* BUILD IT into the tower's grid (tower-ascent.js's toolkit: rect, ledge, ent, interiors) under the spiral stair, in its own columns */
export function buildChase3(k, T, TS = 16) {
  const { rect, ledge, ent, interiors } = k, supports = [];
  ROOMS.forEach((_, i) => { const R = roomOf(i);
    rect(CH.x0, CH.x1, R.top, R.floor - 1, T.AIR); interiors.push([CH.x0, CH.x1, R.top, R.floor - 1, R.kind]);
    for (const [x0, len, up] of R.ledges) ledge(x0, len, R.floor - up);
    if (R.follow === 'strike') supports.push({ t: 'ftsupport', id: 'chase-' + i, kind: 'floor', room: i, col: R.pillar, row: R.floor - 1, h: 3, x: R.pillar * TS + 8, y: R.floor * TS, arm: true,
      clear: roomClear(i), hold: 'IT HOLDS - HE IS NOT THROUGH IT YET', tellSay: 'THE FLOOR GOES', say: 'THE FLOOR GOES: AFTER HIM' });
    /* (ft4a) THE VAULT PILLAR: strike it with him over its crush box and the vault comes down on him; its column lies as cover */
    supports.push({ t: 'ftsupport', id: 'vault-' + i, kind: 'crush', vault: true, optional: true, room: i, col: R.vault, row: R.floor - 1, h: FALL4.vaultH, x: R.vault * TS + 8, y: R.floor * TS,
      crush: [R.crush[0], R.crush[1], R.top, R.floor - 1], cover: coverOf(i), coverDir: coverSide(i), tellSay: 'THE VAULT GIVES', say: 'THE VAULT COMES DOWN' }); });
  rect(CH.x0, CH.x1, CORE.top, CORE.bot - 1, T.AIR); interiors.push([CH.x0, CH.x1, CORE.top, CORE.bot - 1, 'dome']);
  const R0 = roomOf(0);
  ent('ringdoor', CH.x0 + 2, R0.floor - 1, { id: 'chase-top' });   /* (its checkpoint is on the far side of the ring, at the stair's top - tower-ascent.js: never inside his arena, tools/checkpoints.mjs) */
  ent('sign', CH.x0 + 6, R0.floor - 1, { text: 'STRIKE HIS SPELLS BACK AT HIM AND HE FALLS. HIT HIM WHERE HE LIES.' });
  ent('sign', ROOMS[0].pillar - 2, R0.floor - 1, { text: 'A CRACKED PILLAR HOLDS THIS FLOOR. WHEN HE IS THROUGH IT, STRIKE IT.' });
  ROOMS.forEach((R, i) => { if (i && R.follow === 'strike') ent('sign', R.pillar + 3, roomOf(i).floor - 1, { text: 'ANOTHER CRACKED PILLAR: STRIKE IT WHEN HE IS THROUGH.' }); });
  ROOMS.forEach((R, i) => ent('sign', (R.vault - coverSide(i) <= CH.x0 || R.vault - coverSide(i) >= CH.x1) ? R.vault + coverSide(i) : R.vault - coverSide(i), roomOf(i).floor - 1, { text: VAULT_SIGNS[i] }));   /* (ft4a) the vault pillars, signed at the point of use: at the foot on the wall's side (the column falls the other way) */   /* (batch131: a sign ON the shaft wall pierced it - tools pixels - so it stands one tile in, between the pillar and its cover) */
  ent('undeadmage', CH.x1 - 5, R0.floor - CH.hover - 2, { face: -1 });
  return { rooms: ROOMS.map((_, i) => roomOf(i)), core: CORE, supports, start: [CH.x0 + 4, R0.floor - 1], trigger: (CH.x0 + 6) * TS };
}
/* THE CHASE, ONE STEP OF HIS (called from inside updateUndeadMage, after his bolts, clouds and rings have moved: true = it took the frame).
   c: { P, say(m, hard), callout(m), sound(k), shake(n), dust(x, y, n), arm(k), clearRoom(k), setRoom(k), away() }. */
const OPENINGS = new Set(['reflected', 'gather', 'breached', 'crushed']);   /* (ft4a: 'crushed' - the vault, or his own stone, came down on him) */
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
  if (e.mode === 'fall') { if (c.clearOf) e.x = c.clearOf(e.x); e.vy = (e.vy || 0) + CH.fallG * dt; e.y += e.vy * dt;   /* (ft4a: never down INSIDE a fallen column - he lands beside it, where a blade reaches him) */
    if (e.y >= floorY) { e.y = floorY; e.vy = 0; e.mode = 'down'; e.modeT = atFloor(e) ? FALL4.heldDown : CH.downT; e.open = e.modeT; if (atFloor(e)) c.say('HE HOLDS ON - AFTER HIM', true); e.face = Math.sign(P.x - e.x) || 1; c.sound('heavy'); c.shake(5); c.dust(e.x, floorY, 12); }
    return true; }
  if (e.mode === 'down') { e.y = floorY; if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = CH.riseT; c.say(R.last ? 'HE FLEES DOWN - INTO THE CORE OF HIS TOWER' : 'HE FLEES DOWN THROUGH HIS TOWER', true); c.sound('mageBolt'); } return true; }
  if (e.mode === 'rise') { e.y -= 70 * dt; if (e.modeT > 0) return true;
    if (R.follow === 'strike') { e.mode = 'sink'; e.modeT = CH.sinkT; c.sound('hiss'); }
    else { e.mode = 'tear'; e.modeT = CH.tearT; e.tear = { k: R.k, t: 0 }; c.say('HE BREAKS THE FLOOR UNDER YOU', true); c.sound('rumble'); c.shake(3); }
    return true; }
  if (e.mode === 'sink') { e.y += 60 * dt; if (e.modeT > 0) return true;   /* through the stone, as his kind do: and its pillar lights */
    toBelow(e, R.k + 1, P); c.arm(R.k); c.callout('STRIKE THE CRACKED PILLAR: THE FLOOR GOES, AND YOU AFTER HIM'); return true; }
  if (e.mode === 'tear') { e.tear.t += dt; if (Math.random() < dt * 20) c.dust(CH.x0 * 16 + Math.random() * (CH.x1 - CH.x0 + 1) * 16, floorY, 1);
    if (e.modeT > 0) return true; e.tear = null; c.clearRoom(R.k); c.sound('stone'); c.shake(8);
    if (R.last) { e.mode = 'away'; e.modeT = 99; c.away(); } else toBelow(e, R.k + 1, P);
    return true; }
  if (e.mode === 'below') { const N = roomOf(e.waitIn), here = roomAt(P.x, P.y);   /* he waits in the room under; when you are down in it, it is the fight's room */
    e.y = (N.floor - CH.hover - 2) * 16 + Math.sin((e.anim || 0) * 2.3) * 3;
    if (here === N.k && (P.ground || P.y > (N.top + 3) * 16)) {   /* (down in it: not only once you stand - a hero who lands on him stood on nothing) */ e.room = N.k; e.mode = 'wake'; e.modeT = CH.wakeT; e.turn = 0; e.order = N.order; e.wardHold = 0; c.setRoom(N.k); c.say(N.name, false); e.rfx = null; }
    return true; }
  if (e.mode === 'away') return true;
  return false;
}
/* (ft4a) the rooms have had all of him they may: CH.hpFloor of the bar's health (maxHp: his health as the bar shows it) */
export const floorHp = e => Math.ceil((e.maxHp || e.hp0) * CH.hpFloor);
export const atFloor = e => e.hp <= floorHp(e);
/* HE WAITS IN THE ROOM UNDER, on the far side from where you will come down (never under you: you would land on him) */
function toBelow(e, k, P) { const N = roomOf(k), mid = (CH.x0 + CH.x1 + 1) * 8; e.waitIn = k; e.mode = 'below'; e.modeT = 99; e.x = (P && P.x > mid ? CH.x0 + 4 : CH.x1 - 4) * 16; e.y = (N.floor - CH.hover - 2) * 16; e.shots = []; e.clouds = []; e.rings = []; e.echoes = []; e.deathMark = null; }
/* A FRESH FIGHT (a death, a load): him asleep in the first room, every room whole (the caller restores the tiles) */
export function chaseFresh(e) { e.leg = 'chase'; e.room = 0; e.order = ROOMS[0].order; e.noRealm = true; e.realmAt = null; e.tear = null; e.rfx = null; e.holdSaid = false; }
/* THE ROOM COMES DOWN AROUND YOU (ft4a), every frame of the chase leg after his own step. c: { P, solid(x, y) (stone), standable(tx, ty), debris(x, y, top) -> the debris
   (tower-fall2.js's own, told and drawn there), clearLedge(x0, x1, row), say(m, hard), sound(k), shake(n), dust(x, y, n) } */
const STOPS = new Set(['fire', 'ice', 'hand', 'bent', 'trap', 'orb']);
const CASTING = e => !CHASE_MODES.has(e.mode) && !OPENINGS.has(e.mode) && e.mode !== 'wake' && e.mode !== 'sleep' && !(e.wardHold > 0) && !(e.open > 0);
export const vaultReady = e => !!e && e.alive && e.leg === 'chase' && !CHASE_MODES.has(e.mode) && !OPENINGS.has(e.mode) && e.mode !== 'wake' && e.mode !== 'sleep' && !(e.open > 0);
export function chaseRoomStep(e, dt, c) {
  if (!e || !e.alive || e.leg !== 'chase' || e.mode === 'sleep' || e.mode === 'below' || e.mode === 'away') return;
  const R = roomOf(e.room || 0), P = c.P, X = e.rfx && e.rfx.k === R.k ? e.rfx : (e.rfx = { k: R.k, t: 0, debT: 0, mine: [], next: FALL4.stage2, drop: null, gone: [] });
  X.t += dt; X.debT = Math.max(0, X.debT - dt);
  /* 1. HIS MISSES: stone stops them, and shakes masonry loose over where they struck */
  for (const q of e.shots || []) { if (q.reflected || q.gone || !STOPS.has(q.kind)) continue;
    if (!c.solid(q.x, q.y)) { q.free = true; continue; } if (!q.free) continue;   /* (a shot born in the vault's stone - his staff high under the ceiling - is not stopped by it: only stone it flies INTO stops it. Without this every shot from his top station died at birth and the rooms hit no one) */
    if (q.kind === 'orb') { q.vx = q.vy = 0; q.t = Math.min(q.t, 0.001); continue; }   /* (a poison orb bursts on the stone it meets) */
    q.t = 0; q.gone = true; q.hit = true; c.dust(q.x, q.y, 4);
    if ((q.kind === 'fire' || q.kind === 'ice') && X.debT <= 0 && X.mine.filter(d => d.st !== 'land').length < FALL4.debMax) { const sp = debrisSpot(R, Math.abs(q.x - P.x) < FALL4.nearMiss ? P.x + Math.sign(q.x - P.x) * 6 : q.x, c);   /* (a miss NEAR you shakes the stone over YOU: told, step off it) */
      if (sp) { const d = c.debris(sp.x, sp.y, R.top * 16); if (d) { X.mine.push(d); X.debT = FALL4.debEvery; } } } }
  /* ...and stone that comes down ON HIM drops him */
  for (const d of X.mine) if (d.st === 'fall' && !d.him && Math.abs(d.x - e.x) < 14 && d.ry > e.y - 44 && d.ry < e.y + 4 && CASTING(e)) { d.him = true; e.mode = 'crushed'; c.say('HIS OWN STONE COMES DOWN ON HIM', true); c.sound('stone'); c.shake(4); }
  X.mine = X.mine.filter(d => d.st !== 'land' || d.t > 0);
  /* 2. STAGE TWO: the ledges go, one at a time, told */
  if (X.drop) { X.drop.t -= dt; if (Math.random() < dt * 18) c.dust((X.drop.x0 + Math.random() * (X.drop.x1 - X.drop.x0 + 1)) * 16, X.drop.row * 16 + 16, 1);
    if (X.drop.t <= 0) { c.clearLedge(X.drop.x0, X.drop.x1, X.drop.row); X.gone.push(X.drop.i); c.sound('stone'); c.shake(3); X.drop = null; X.next = X.t + FALL4.dropEvery; } }
  else if (X.t >= X.next && !['rise', 'sink', 'tear', 'below', 'away'].includes(e.mode)) {   /* (the room fails while he is down too - not while he flees through its floor) */ const on = l => P.ground && Math.abs(P.y - l[2] * 16) < 4 && P.x > l[0] * 16 - 6 && P.x < (l[1] + 1) * 16 + 6;
    const left = R.ledges.map(([x0, len, up], i) => [x0, x0 + len - 1, R.floor - up, i]).filter(l => !X.gone.includes(l[3]) && !on(l));
    if (left.length) { const l = left[Math.floor((X.t * 7.3) % left.length)]; X.drop = { x0: l[0], x1: l[1], row: l[2], i: l[3], t: FALL4.dropTell }; c.sound('crack'); c.say('A LEDGE GIVES', false); }
    else X.next = X.t + 1; }
}
/* where his stone comes down: over the struck spot, inside the room, on the first footing under the vault (a ledge or the floor) */
function debrisSpot(R, x, c) { const tx = Math.max(CH.x0 + 1, Math.min(CH.x1 - 1, Math.floor(x / 16)));
  for (let ty = R.top + 1; ty <= R.floor; ty++) if (c.standable(tx, ty) && !c.standable(tx, ty - 1)) return { x: tx * 16 + 8, y: ty * 16 };
  return null; }
/* THE FLOOR FX of the chase (claude/fallingtower3art, src/redraw/tower_chase.js): the crack he runs across a floor he breaks, grit pouring; the smoke and green sparks he sinks through
   the stone in; the ring of grit where he lands; the gold halo under him while he lies open */
export function drawChase3(g, e, cx, cy, time, VW) {
  if (!e || !e.alive) return; void VW;
  { const X = e.rfx; if (X && e.leg === 'chase') { const R = roomOf(X.k), up = Math.min(1, X.t / (FALL4.stage2 * 1.5)), y1 = Math.round(R.floor * 16 - cy), y0 = Math.round(y1 - up * CH.open * 16);
      /* stage 1: THE CRACKS run up its walls, longer as the room lasts (greybox: art lane) */
      for (const [wx, sd] of [[CH.x0 * 16 + 1, 1], [(CH.x1 + 1) * 16 - 2, -1]]) { const x = Math.round(wx - cx); g.fillStyle = '#12151e';
        for (let y = y1; y > y0; y -= 3) g.fillRect(x + sd * (((y * 7) % 5) - 1), y - 3, 1, 3);
        g.fillStyle = 'rgba(255,154,92,0.5)'; g.fillRect(x + sd * (((y0 * 7) % 5) - 1), y0, 1, 2); }
      /* stage 2: a ledge in its tell - the crack runs red along it */
      if (X.drop) { const k = 1 - X.drop.t / FALL4.dropTell, x0 = Math.round(X.drop.x0 * 16 - cx), w = (X.drop.x1 - X.drop.x0 + 1) * 16, yy = Math.round(X.drop.row * 16 - cy), jig = Math.round(Math.sin(time * 50) * k);
        g.fillStyle = Math.floor(time * 8) % 2 ? '#ff6b6b' : '#ffb070'; for (let i = 0; i < w * k; i += 3) g.fillRect(x0 + i + jig, yy + 2 + ((i * 5) % 3), 2, 1);
        g.globalAlpha = 0.25 + 0.35 * k; g.fillStyle = '#ff6b6b'; g.fillRect(x0 + jig, yy - 1, w, 2); g.globalAlpha = 1; } } }
  if (e.tear) { const R = roomOf(e.tear.k), k = Math.min(1, e.tear.t / CH.tearT); paintFloorCrack(g, Math.round(CH.x0 * 16 - cx), (CH.x1 - CH.x0 + 1) * 16, Math.round(R.floor * 16 - cy), Math.round(e.x - cx), k, time); }
  if (e.mode === 'sink') paintSink(g, Math.round(e.x - cx), Math.round(roomOf(e.room || 0).floor * 16 - cy), 1 - Math.max(0, e.modeT) / CH.sinkT, time);
  if (e.mode === 'down') { const x = Math.round(e.x - cx), y = Math.round(roomOf(e.room || 0).floor * 16 - cy);
    paintLanding(g, x, y, CH.downT - e.modeT);
    g.globalAlpha = 0.18 + 0.12 * Math.abs(Math.sin(time * 5)); g.fillStyle = '#ffd36b'; g.fillRect(x - 16, y - 2, 32, 2); g.fillRect(x - 10, y - 4, 20, 2); g.globalAlpha = 1; }
}
/* ===================== THE ASCENT (claude/ft4a, Daniel 10-29 16:00 "All four": brief-fallingtower4-1029.md #1 A) =====================================
   THE CUT IS GONE. The last floor pours you into the core and he is IN it, hanging over the rug, not teleported to his hall. The rug rises to catch you
   (main.js), you board where it is, and THE CARPET RIDES BACK UP THE HOLES YOU FELL THROUGH, still fighting - one camera, no snap:
     'well'   an upward auto-scroller up the core and the four broken rooms (their wrecked floors, the fallen columns): the box you fly in is the well,
              win rows tall, its bottom rising ASC.well px/s - the tower coming down behind you (it carries you up: it never kills). He flies at the
              top of it, casting only his fire, ice and hand (ASC.order: his fight's own tells and numbers); strike one back and he is knocked down the
              well toward you, open. Stone off the failing walls falls on TOLD columns (ASC.rock: a red mark at the top of the box and grit, then it falls).
              The ascent takes him no lower than ASC.hpFloor of the bar.
     'plug'   at the stair's floor the stone over the well cracks round (told, ASC.plugTell s) and his bolt blasts it: PLUG (runtime, put back on a retry)
     'spiral' up his spiral stair's well past the flights you climbed, fast; he flees ahead, casting nothing
     'crown'  -> 'sky' the spiral tower's top breaks open (CROWN, runtime) and you burst out into the night; the camera WIDENS over ASC.tween s from the
              well's 26 tiles to his hall's box (tower-ascent.js hallArena, moved over the spiral tower: no sideways jump), and the hall's sky and moon
              come up round you. He settles to his hover spot and his hall's kit starts ASC.firstCast s later - no 'wake' freeze.
   A death anywhere in it is the stair's top, as the rest of the fight (one boss). */
export const ASC = { win: 13, well: 110, breath: 0.5, spiral: 320, sky: 280, plugTell: 1.0, tween: 0.8, firstCast: 1.0, hpFloor: 0.6, hang: 6, fade: 0.7, crownTop: 50,
  order: ['fire', 'ice', 'fire', 'hand'], rock: { first: 2.0, every: 1.8, tell: 1.1, v: 420, dmg: 12, hitW: 13 } };
export const PLUG = () => [CH.x0, CH.x1, SPIRAL.floor, CH.top - 1];   /* the stone between the spiral stair's floor and the first room (rows) */
export const CROWN = () => [CH.x0, CH.x1, ASC.crownTop, SPIRAL.top - 1];   /* the spiral tower's roof, up to the sky rows (tower-ascent.js TOWER.SKY) */
export const ascentClear = () => [PLUG(), CROWN()];   /* (functions: spiral-chase.js and this file can load in either order) */
/* where he hangs in the core when the last floor pours you in: over the rug, ASC.hang rows up the well, to one side */
export const coreHang = () => ({ x: CORE.carpet.x + 5 * 16, y: (CORE.bot - 1 - ASC.hang) * 16 });
/* THE BOX of the ascent at its bottom y (px): the well, win rows tall - in the sky its sides open toward the hall's (k: 0 well .. 1 hall) */
export function ascentBox(y, H, k = 0) { const x0 = CH.x0 * 16, x1 = (CH.x1 + 1) * 16; return { x0: x0 + (H ? (H.x0 - x0) * k : 0), x1: x1 + (H ? (H.x1 - x1) * k : 0), y0: y - ASC.win * 16, floor: y }; }
/* his band in it: the top of the box (station() keeps him to your side, over you) */
export const ascentBand = A => ({ x0: A.x0 + 12, x1: A.x1 - 12, y0: A.y0, y1: A.y0 + 6 * 16 });
export const newAscent = () => ({ ph: 'well', y: CORE.bot * 16, t: 0, k: 0, rocks: [], rockT: ASC.rock.first });
/* ONE STEP of the scroll. A: the arena (its box is moved here), H: his hall's box. c: { P, clear(rect), say(m, hard), callout(m), sound(k), shake(n), dust(x, y, n),
   hurt(x, dmg), lock(x0, x1), toHall(), rnd() }. */
export function ascentStep(e, A, H, dt, c) {
  const S = e.asc || (e.asc = newAscent()), P = c.P; S.t += dt;
  if (S.ph === 'well') { S.y -= ASC.well * dt; if (S.y - ASC.win * 16 <= CH.top * 16) { S.y = Math.min(S.y, CH.top * 16 + ASC.win * 16); S.ph = 'plug'; S.pt = ASC.plugTell; c.callout('THE STAIR\'S FLOOR CRACKS OVER YOU'); c.sound('crack'); c.shake(3); } }
  else if (S.ph === 'plug') { S.pt -= dt; if (Math.random() < dt * 30) c.dust((CH.x0 + Math.random() * (CH.x1 - CH.x0 + 1)) * 16, CH.top * 16, 1);
    if (S.pt <= 0) { c.clear(PLUG()); c.sound('stone'); c.sound('mageBolt'); c.shake(9); S.ph = 'spiral'; c.callout('HE BLASTS THROUGH HIS STAIR: AFTER HIM'); } }
  else if (S.ph === 'spiral') { S.y -= ASC.spiral * dt; if (S.y - ASC.win * 16 <= SPIRAL.top * 16) { c.clear(CROWN()); c.sound('stone'); c.sound('rumble'); c.shake(10); S.ph = 'sky'; S.k = 0; c.callout('OUT OF HIS TOWER: INTO HIS SKY'); } }
  else if (S.ph === 'sky') { S.y -= ASC.sky * dt; S.k = Math.min(1, S.k + dt / ASC.tween); const end = H.floor - 34;
    if (S.y <= end) { S.y = end; S.k = 1; S.ph = 'done'; } }
  Object.assign(A, ascentBox(S.y, H, S.ph === 'sky' || S.ph === 'done' ? S.k : 0));
  c.lock(A.x0, A.x1);
  /* STONE OFF THE FAILING WALLS, on told columns (the well only - and never two at once over you) */
  if (S.ph === 'well') { S.rockT -= dt; if (S.rockT <= 0) { S.rockT = ASC.rock.every; const x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, P.x + (c.rnd() - 0.5) * 120)); S.rocks.push({ x, st: 'tell', t: ASC.rock.tell, ry: 0 }); c.sound('crack'); } }
  for (const r of S.rocks) {
    if (r.st === 'tell') { r.t -= dt; if (r.t <= 0) { r.st = 'fall'; r.ry = A.y0 - 8; } }
    else if (r.st === 'fall') { r.ry += ASC.rock.v * dt; if (!r.hit && !P.dead && Math.abs(P.x - r.x) < ASC.rock.hitW && Math.abs((P.y - 8) - r.ry) < 14) { r.hit = true; c.hurt(r.x, ASC.rock.dmg); } if (r.ry > A.floor + 60) r.st = 'gone'; } }
  S.rocks = S.rocks.filter(r => r.st !== 'gone');
  if (S.ph === 'done') { e.asc = null; c.toHall(); return 'hall'; }
  return S.ph;
}
/* HIM, in the ascent (stepUndeadMage's chase hook: true takes the frame). In the well he fights as in his hall - and his struck-back spell knocks him
   DOWN the well toward you, open; in the plug, the spiral and the sky he flees up ahead, casting nothing */
const ASC_OPEN = new Set(['reflected', 'gather', 'breached']);
export function ascentLeg(e, dt, c) {
  if (e.leg !== 'ascent') return false; const S = e.asc, P = c.P, A = c.A; e.order = ASC.order; e.noRealm = true;
  if (!S || S.ph === 'well') {
    if (e.mode === 'away' || e.mode === 'flee') { e.mode = 'hover'; e.modeT = 0.6; e.ascBreath = true; }   /* (the board: his first cast greets you) */
    /* A BREATH BETWEEN HIS SPELLS in the well (ASC.breath s more hover): his tells and numbers are his fight's, but you are flying a rising shaft with stone coming down - measured: the knight died in it at full cadence */
    if (e.mode === 'hover') { if (!e.ascBreath) { e.modeT += ASC.breath; e.ascBreath = true; } } else e.ascBreath = false;
    if (ASC_OPEN.has(e.mode)) { const tx = P.x + (Math.sign(e.x - P.x) || 1) * 26, ty = P.y - 30, dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy); if (d > 3) { const sp = Math.min(d, 150 * dt); e.x += dx / d * sp; e.y += dy / d * sp; } }
    return false; }
  /* fleeing ahead: up the middle of the well, at the top of the box */
  if (e.mode !== 'flee') { e.mode = 'flee'; e.modeT = 99; e.deathMark = null; e.rings = []; e.bones = null; e.orbit = null; e.script = null; e.void = null; e.fireRing = null; e.open = 0; }
  const tx = (A.x0 + A.x1) / 2 + Math.sin(e.anim || 0) * 30, ty = A.y0 + 40, dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy); if (d > 2) { const sp = Math.min(d, 520 * dt); e.x += dx / d * sp; e.y += dy / d * sp; }
  e.face = Math.sign(P.x - e.x) || e.face; return true;
}
/* THE ASCENT, DRAWN (greybox - the art lane paints it): his told stone (a red mark at the top of the box, grit, then the block), the crack round the
   stair's floor while it holds (the plug's tell) */
export function drawAscent(g, e, A, cx, cy, time) {
  const S = e && e.asc; if (!S || !A) return;
  for (const r of S.rocks) { const x = Math.round(r.x - cx);
    if (r.st === 'tell') { const k = 1 - r.t / ASC.rock.tell, y = Math.round(A.y0 - cy) + 6; if (Math.floor(time * 8) % 2) { g.fillStyle = '#ff6b6b'; g.fillRect(x - 1, y, 2, 5); g.fillRect(x - 1, y + 6, 2, 1); }
      g.fillStyle = 'rgba(168,152,124,0.55)'; for (let i = 0; i < 4; i++) g.fillRect(x - 3 + (i * 3) % 7, y + 10 + Math.round(((time * 90 + i * 23) % 60) * k), 1, 2);
      g.globalAlpha = 0.18 + 0.2 * k; g.fillStyle = '#ff6b6b'; g.fillRect(x - 7, y, 14, Math.round(A.floor - A.y0)); g.globalAlpha = 1; }
    else if (r.st === 'fall') { const y = Math.round(r.ry - cy); g.fillStyle = '#5c6070'; g.fillRect(x - 7, y - 7, 14, 12); g.fillStyle = '#8a8e9c'; g.fillRect(x - 7, y - 7, 14, 2); g.fillStyle = '#2a2c38'; g.fillRect(x - 2, y - 5, 1, 9); } }
  if (S.ph === 'plug') { const k = 1 - Math.max(0, S.pt) / ASC.plugTell, y = Math.round(CH.top * 16 - cy), x0 = Math.round(CH.x0 * 16 - cx), w = (CH.x1 - CH.x0 + 1) * 16;
    g.fillStyle = Math.floor(time * 10) % 2 ? '#ff9a5c' : '#ffd36b'; for (let i = 0; i < w * k; i += 4) g.fillRect(x0 + i, y + ((i * 7) % 5) - 2, 3, 1);
    g.globalAlpha = 0.3 * k; g.fillStyle = '#ffd36b'; g.fillRect(x0, y - 2, w, 3); g.globalAlpha = 1; }
}
