// tools/reach.mjs — can you actually get there?
// Flood-fills the standable tiles of a level from its START using the knight's real numbers, then
// reports anything the player is expected to touch that the fill never reached: the gate, the
// checkpoints, the silver, the quest items, the relic, the boss.
//
// It cannot model a mover, a swing, a wind vent, a doorway or a lift, so a level that uses those
// will report things it can in fact reach. Every such tile is listed as ASSISTED rather than
// UNREACHABLE, and the levels that lean on them say so at the top.
// usage: node tools/reach.mjs [levelId]
import { LEVELS, T, TS } from '../src/level.js';

const RUN = 100, JUMPV = -320, G = 1000;              // the knight's numbers from main.js
const JUMP_UP = Math.ceil((JUMPV * JUMPV) / (2 * G) / TS);   // 3 tiles of rise
const JUMP_ACROSS = 6;                                        // with a run-up, about six tiles of float
const BOUNCE_UP = Math.ceil((480 * 480) / (2 * G) / TS);      // a spring throws you much higher

const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
const stand = t => solid(t) || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.BOUNCER || t === T.REED || t === T.CRYST;
const climbable = t => t === T.NET || t === T.CLIMB;

const want = process.argv[2];
let bad = 0;
for (const lv of LEVELS) {
  if (lv.hidden) continue;
  if (want && lv.id !== want) continue;
  const L = lv.build(), W = L.W, H = L.H, g = L.grid;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  // doorways the model follows itself (each one names the doorway it lets out at), so they no longer
  // make a level ASSISTED; that used to hide a real miss among the indoor keys
  const doors = (L.ents || []).filter(e => e.t === 'doorway' && e.id);
  const doorTo = new Map(doors.map(d => [d.id, d]));
  // vents (updrafts, thermals) the model follows too: stand in one and you go up the column, and steer
  // off the top onto anything within three tiles of it
  const vents = (L.ents || []).filter(e => e.t === 'vent');
  const assisted = !!(L.moversExtra && L.moversExtra.length) || (L.ents || []).some(e => ['mover', 'cart'].includes(e.t)) || !!(L.gusts && L.gusts.length);

  // every tile you could be standing on
  const key = (x, y) => x + ',' + y;
  const footing = new Set();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    if (stand(at(x, y)) && !solid(at(x, y - 1)) && at(x, y - 1) !== T.SPIKE) footing.add(key(x, y - 1));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (climbable(at(x, y))) footing.add(key(x, y));

  const seen = new Set(), q = [];
  const push = (x, y) => { const k = key(x, y); if (footing.has(k) && !seen.has(k)) { seen.add(k); q.push([x, y]); } };
  // start where the knight starts, and fall to whatever is under it
  { let sy = L.START.y; while (sy < H - 1 && !footing.has(key(L.START.x, sy))) sy++; push(L.START.x, sy); }

  while (q.length) {
    const [x, y] = q.pop();
    const springy = at(x, y + 1) === T.BOUNCER, up = springy ? BOUNCE_UP : JUMP_UP;
    for (const v of vents) if (Math.abs(v.x - x) <= 1 && v.y === y) { const top = Math.floor(v.y + 1 - (v.h || 112) / TS);
      for (let ty = top - 1; ty <= v.y; ty++) for (let dx = -3; dx <= 3; dx++) push(v.x + dx, ty); }
    // stand in a doorway and press talk: you come out at the other one
    for (const dr of doors) if (Math.abs(dr.x - x) <= 1 && dr.y === y) { const to = doorTo.get(dr.to); if (to) { let ty = to.y; while (ty < H - 1 && !footing.has(key(to.x, ty))) ty++; push(to.x, ty); } }
    // walk, and step up or down one
    for (const dx of [-1, 1]) for (const dy of [-1, 0, 1]) push(x + dx, y + dy);
    // climb
    if (climbable(at(x, y))) { push(x, y - 1); push(x, y + 1); }
    if (climbable(at(x, y - 1))) push(x, y - 1);
    // jump: anything within the arc, near side first
    for (let dy = -up; dy <= 0; dy++) {
      const span = Math.round(JUMP_ACROSS * (1 - Math.abs(dy) / (up + 1.5)));
      for (let dx = -span; dx <= span; dx++) push(x + dx, y + dy);
    }
    // fall: straight down, and out to either side
    for (const dx of [-JUMP_ACROSS, -2, 0, 2, JUMP_ACROSS]) { let ny = y;
      while (ny < H - 1 && !footing.has(key(x + dx, ny))) ny++;
      if (footing.has(key(x + dx, ny))) push(x + dx, ny); }
    // crystal gives way under you, so a crystal floor is also a way DOWN (the Sunspire's geodes)
    if (at(x, y + 1) === T.CRYST) { let ny = y + 1;
      while (ny < H - 1 && !footing.has(key(x, ny))) ny++;
      if (footing.has(key(x, ny))) push(x, ny); }
  }

  // is everything you are meant to touch inside the fill?
  const near = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (seen.has(key(x + dx, y + dy))) return true; return false; };
  const WANT = { gate: 'THE GATE', check: 'a checkpoint', silver: 'a silver', stray: 'a quest item', relic: 'the relic', key: 'a key', doorway: 'a doorway' };
  const misses = [];
  for (const e of L.ents) { const w = WANT[e.t]; if (!w) continue; if (!near(e.x, e.y)) misses.push(`${w} at ${e.x},${e.y}`); }
  // and the boss, if the level has one
  if (L.arena && L.arena.boss) { const b = L.ents.find(e => e.t === L.arena.boss); if (b && !near(b.x, b.y)) misses.push(`the boss (${L.arena.boss}) at ${b.x},${b.y}`); }

  const pct = Math.round(seen.size / Math.max(1, footing.size) * 100);
  const head = `== ${lv.id} (${W}x${H})  reached ${pct}% of the footing${assisted ? '   [ASSISTED: has movers/wind/doors the model cannot follow]' : ''}`;
  if (!misses.length) { if (want) console.log(head + '\n  everything is reachable.'); continue; }
  console.log(head);
  for (const m of misses) { console.log('  ' + (assisted ? 'ASSISTED?  ' : 'UNREACHABLE  ') + m); bad++; }
}
console.log(bad ? `\n${bad} to check by hand.` : '\nnothing stranded.');
