// tools/ore-exam.mjs — THE ORE SHAFT (lane claude/oreroad2), pinned so a later merge cannot silently lose it.
//
// The design audit's game-wide pattern #1 ("the last stretch before the boss is a rest, not an exam") named THE ORE ROAD
// by number: "the stretch before the boss (408-475) is on foot", the one gap in its own mechanic map. The audit's own
// plan for THE ORE ROAD (section 10, item 3, EXAM) said what to build: "make the winch house a last ride: one short
// line with one rusted bucket, a sheargob who leaps on, a tippler over the middle and bats. The foot fights... move to
// the landing." This file pins that it is still there - not that it plays well (tools/ore-road.mjs, ore-ride.mjs and
// ore-work.mjs hold the ride and the fights to the level's own geometry rules already) but that THE SHAPE of the fix
// survives: a ride mechanic inside the last 80 route tiles, the rust, the tippler, the flight, and the crew moved off
// the shaft's own floor onto the decks either side of it.
//
// It also pins the rest of this lane's backlog: five ores (not four) with a section bias, a lamp lighting the one room
// that had none (the arena), a slope underfoot (src/slopes.js) and this level's own visual variety per section.
//
// PROVED RED ON MASTER: `git worktree add ../oreroad2-baseline cd35d24 && cd ../oreroad2-baseline && node tools/ore-exam.mjs`
// fails at "the winch line exists" (no such id in cableLines()) and everything after it, because none of this was there.
// usage: node tools/ore-exam.mjs
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { OR, cableLines, ORES, oreBias, MINE_PLACES, WORKS, lineYAt } from '../src/ore-road.js';
import { SLOPE, isSlope } from '../src/slopes.js';

let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const lv = LEVELS.find(l => l.id === 'oreroad'), L = lv.build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
console.log('THE ORE SHAFT, THE FIVE ORES, AND THE SLOPE (lane claude/oreroad2)');

/* ---- THE EXAM (audit item 1 + §10 plan item 3): the last 80 route tiles (roughly 443-523, the winch house and the
   drum house) hold a ride, and it is the level's own rule mechanic - not a new one bolted on */
{ const line = cableLines().find(l => l.id === 'winch');
  ok(!!line, 'the winch line exists - a bucket ride inside the last 80 route tiles before the Winchmaster');
  if (line) { const xs = line.pts.map(p => p[0] / 16);
    ok(Math.min(...xs) >= 408 && Math.max(...xs) <= 475, `it runs ${Math.min(...xs).toFixed(1)}-${Math.max(...xs).toFixed(1)}, inside the winch house (408-475)`);
    ok(line.cracked > 0, 'at least one bucket on it is rust that will not hold you (cracked)'); }
  ok(!!(OR.PITS || []).find(q => q.id === 'winchride'), 'the shaft is a real pit (a fall costs the usual fifth and the turbines carry you home), not a painted gap');
  const bats = (L.encounters || []).find(e => e.name === 'THE SHAFT BATS');
  ok(!!bats && bats.x0 >= 408 && bats.x1 <= 475, 'bats are loose over the ride (THE SHAFT BATS)');
  const tipOverShaft = L.ents.some(e => e.t === 'tippler' && e.x > 420 && e.x < 450);
  ok(tipOverShaft, 'a tippler stands over the middle of the shaft');
  const sheargobAtBoard = L.ents.some(e => e.t === 'sheargob' && e.x >= 415 && e.x <= 421);
  ok(sheargobAtBoard, 'a sheargob waits at the boarding deck - the one who leaps onto your bucket');
  /* the crew moved OFF the shaft's own floor: no foe of THE WINCH CREW or THE DRUM YARD stands over open air in 421-450 */
  const stranded = L.ents.filter(e => ['miner', 'rockgoblin', 'heavy', 'gaffer', 'javelin', 'sapper'].includes(e.t) && e.x > 421 && e.x < 450 && at(e.x, e.y + 1) !== T.SOLID);
  ok(!stranded.length, 'the crew that used to fight on the shaft\'s own floor stands on the decks either side of it, not over the drop' + (stranded.length ? ' - not ' + stranded.map(e => e.t + '@' + e.x).join(',') : '')); }

/* ---- FIVE ORES, SECTIONS BIAS DIFFERENT ONES (Daniel's backlog: "more kinds of ore") ---- */
{ ok(ORES.length === 5, `${ORES.length} ores (copper, iron, silver, gold, gem) - it was four`);
  ok(typeof oreBias === 'function' && oreBias(0) !== oreBias(200) && oreBias(200) !== oreBias(300) && oreBias(300) !== oreBias(450),
    'the yard, the tower/chute, the collapse/steep and the winch/drum each lean a different one of the five'); }

/* ---- A LAMP IN THE ONE DARK ROOM (Daniel's backlog: "a dark boss shaft") ---- */
{ const armLamp = L.ents.some(e => e.t === 'minerlamp' && e.x >= L.arena.x0 / 16); ok(armLamp, 'the drum house (the boss arena) has a lamp of its own - LAMP_EVERY stops short of it, so nothing else ever lit it'); }

/* ---- A SLOPE UNDERFOOT (Daniel's backlog: "SLOPES via src/slopes.js") ---- */
{ let found = 0; for (let x = 0; x < L.W; x++) for (let y = 0; y < L.H; y++) if (isSlope(at(x, y))) found++;
  ok(found >= 2, `${found} slope tile(s) in the level - the spoil heap's ramp (SLOPE.R1), not a jump onto it`);
  ok(isSlope(at(9, 36)) || isSlope(at(10, 35)), 'the ramp sits where the spoil heap is, in THE ORE YARD'); }

/* ---- NOTHING ELSE MOVED: the level still needs the Moor, keeps its boss and its id, and every existing place is where it was ---- */
{ ok(lv.needs === 'moor' && L.arena.boss === 'winchmaster' && lv.id === 'oreroad', 'id, needs and boss untouched');
  ok(MINE_PLACES.length >= 7, `${MINE_PLACES.length} named mine places still on the route`); }

/* ==================================================================================================================
   FOLLOW-UP (Daniel approved, same lane): audit plan items 1 and 2, the veins in all five ores, a real cart-line
   ramp, and the elites fix that came with them. PROVED RED first via a throwaway worktree at this branch's own
   pre-follow-up commit (cd70591), the same way the exam section above was proved red on master. */
console.log('\nFOLLOW-UP: TWIST THE TIP, DEVELOP THE BRAKE, FIVE-ORE VEINS, A CART-LINE RAMP');

/* ---- 0: the elites fix - the gate-holding heavy never stands within two tiles of a checkpoint (tools/elites.mjs's
   own "never at a landing" rule, RULES). This is what was red: a heavy at 455 stood one tile from the check at 454 */
{ const heavy = L.ents.find(e => e.elite && e.t === 'heavy' && e.gate !== undefined);
  const nearCheck = heavy && L.ents.some(c => c.t === 'check' && Math.abs(c.x - heavy.x) <= 2 && Math.abs(c.y - heavy.y) <= 2);
  ok(!!heavy && !nearCheck, 'the drum yard\'s gate-holding heavy stands clear of every checkpoint' + (heavy ? ` (heavy@${heavy.x},${heavy.y})` : ' - no gated heavy found')); }

/* ---- 1: TWIST THE TIP (audit plan item 1, cols 120-135, over the pylon lookouts' deck) - a sapper pair on a deck
   BELOW the first span's own line, so a loaded skip tipped from above lands on them */
{ const deck = (L.encounters || []).find(e => e.name === 'THE UNDER-DECK');
  ok(!!deck && deck.x0 >= 120 && deck.x1 <= 135, 'THE UNDER-DECK sits at the end of span 1 (120-135)');
  const below = L.ents.filter(e => e.t === 'sapper' && e.x >= 120 && e.x <= 135 && e.y > OR.YARD);
  ok(below.length >= 2, `${below.length} sapper(s) stand below the first span's own line (row ${OR.YARD}), tippable from above` + (below.length ? '' : ' - none found under the line')); }

/* ---- 2: DEVELOP THE BRAKE (audit plan item 2, the steep line, 353-407) - a second tippler hangs directly over the
   steep cable's own path (not off on a structure of its own like the brakeman's stage tippler at 346), with a floor
   under its stream that is never the cable's own path (A12, tools/ore-road.mjs already proves every tippler's stream
   lands on real footing; this just proves there are now two tipplers on the steep line, not one) */
{ const steepTipplers = L.ents.filter(e => e.t === 'tippler' && e.x >= 340 && e.x < 407);
  ok(steepTipplers.length >= 2, `${steepTipplers.length} tippler(s) on the steep line - the brakeman's stage one, and one that hangs over the cable itself`);
  const overLine = steepTipplers.find(e => e.x > 384);   /* past the second pillar (PILLAR_BX[1]), astride the cable rather than on a pillar's own stage */
  ok(!!overLine, 'one of them hangs over the line past the second pillar, where braking short of him is the only way to dodge his stream'); }

/* ---- 3: THE MINABLE VEINS IN ALL FIVE ORES (not just gem/not-gem) ---- */
{ const veinOres = new Set((L.veins || []).map(v => v.ore));
  ok(veinOres.size === 5, `veins are struck in ${veinOres.size} of the five ores (it was two: gem, or not)`); }

/* ---- 4: A REAL SLOPE RAMP TO A CART LINE - distinct from the spoil heap's own ramp, and outside the cart rail's
   own checked flat span (tools/ore-work.mjs's span() - the WORKS row for the ore yard's rockgoblin cart) */
{ let cartSlope = false; for (let y = 0; y < L.H; y++) if (isSlope(at(36, y))) cartSlope = true;
  ok(cartSlope, 'a slope sits at column 36, the ore yard cart rail\'s own hitching ramp (one column clear of its checked span)');
  const cartWork = WORKS.find(w => w[3].k === 'cart' && w[1] === 66);
  ok(!!cartWork, 'the ore yard\'s cart line is still where the ramp was built for it'); }

console.log('\nROUND FOUR: ORE WALLS YOU MINE THROUGH (lane claude/oreroad3, item 1)');
/* ---- src/breakable-walls.js, built once so a later 'secret' wall and the future minecart level reuse it. THE ORE
   ROAD gets 2-4 of them, at least one on the main route (409-475, between the Winch House and the arena's boss trigger)
   and at least one off it (a side dig). Each is real solid rock (block()) at build time, not a painted decoration:
   this pins that they exist, sit on the route, and carry every wall its own kind knows how to break. */
{ const { WALL_KINDS, wallHits } = await import('../src/breakable-walls.js');
  const W = L.walls || [];
  ok(W.length >= 2 && W.length <= 4, `${W.length} breakable wall(s): 2-4 of them (it was Daniel's own range)`);
  ok(W.every(w => WALL_KINDS[w.kind] && wallHits(w) >= 2 && w.hits === 0 && w.broken === false), 'every one starts unbroken, at zero hits, in a kind the engine knows');
  ok(W.every(w => w.x0 <= w.x1 && w.y0 <= w.y1), 'every one is a real rectangle of tiles, not a single painted cell mistaken for one');
  ok(W.every(w => { for (let ty = w.y0; ty <= w.y1; ty++) for (let tx = w.x0; tx <= w.x1; tx++) if (at(tx, ty) !== T.SOLID) return false; return true; }), 'every one is solid rock at build time - the route reads right before it is ever struck');
  const main = W.some(w => w.x0 >= 409 && w.x1 <= 475), side = W.some(w => w.x0 < 409 || w.x1 > 475);
  ok(main, 'at least one sits on the main route (409-475, the Winch House to the arena)');
  ok(side, 'and at least one sits off it (the ore yard or the wreck head, a dig for whoever goes looking)');
  const oreWalls = W.filter(w => w.kind === 'ore');
  ok(oreWalls.every(w => w.colour && w.colour.length === 3 && JSON.stringify(w.colour) === JSON.stringify(ORES[oreBias(w.x0)])), "every 'ore' wall carries its own section's ore colour (oreBias), not a fixed one");
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/function wallsStep/.test(src) && /function breakWall/.test(src) && /function wallsMendAll/.test(src), 'main.js has the hook: struck like a vein (wallsStep), opens the grid for real when it gives (breakWall), and mends on respawn (wallsMendAll, called from mendAll)');
  ok(/wallsMendAll\(\)/.test(src) && src.indexOf('mendAll(); wallsMendAll();') >= 0, "NEVER A SOFT-LOCK: respawn's own mendAll() call is followed by wallsMendAll(), so a wall never stays broken past the attempt that broke it"); }

console.log('\nROUND FIVE: PASSING BUCKETS (lane claude/passbuckets, item 4) - AND THE WINCHMASTER\'S WEST WALL, SEALED');
/* ---- PASSING BUCKETS (Daniel, 2026-09-28, decided): THE FIRST SPAN gets a second line, 'pass', running the OTHER
   way. Pinned here: it exists, it runs opposite 'first', and the gap between the two - sampled all along the stretch,
   not just at one spot - is a REAL JUMP (3.2-4.5 tiles by hero, not the reach model's 6), never a step and never out
   of reach. A miss falls into THE FIRST SPAN's own pit (this level's own geometry checks and page ride already hold
   that pit to "a fifth of your health and a climb, never your life" for every span, this one included - nothing new
   needed here for that half of it). */
{ const lines = cableLines(), first = lines.find(l => l.id === 'first'), pass = lines.find(l => l.id === 'pass');
  ok(!!pass, "the 'pass' line exists - a second line over THE FIRST SPAN");
  ok(!!first && !!pass && Math.sign(first.pts[first.pts.length - 1][0] - first.pts[0][0]) === -Math.sign(pass.pts[pass.pts.length - 1][0] - pass.pts[0][0]),
    "and it runs the OPPOSITE way to 'first' (first's pts travel low-to-high x as its clock runs; pass's travel high-to-low, so a bucket on it moves the other direction)");
  if (first && pass) {
    const xs = pass.pts.map(p => p[0] / 16), x0 = Math.min(...xs), x1 = Math.max(...xs);
    ok(x0 >= 68 && x1 <= 135, `it stays on THE FIRST SPAN (68-135): runs ${x0}-${x1}`);
    let worst = null, lo = Infinity, hi = -Infinity;
    for (let x = x0; x <= x1; x += 0.5) { const y1 = lineYAt(first, x * 16), y2 = lineYAt(pass, x * 16); if (y1 === null || y2 === null) continue;
      const rows = Math.abs(y2 - y1) / 16; lo = Math.min(lo, rows); hi = Math.max(hi, rows); if (rows < 3.2 || rows > 4.5) worst = worst ?? [x, rows]; }
    ok(lo >= 3.2 && hi <= 4.5, `the vertical gap between the two lines is ${lo.toFixed(2)}-${hi.toFixed(2)} tiles everywhere they run together - a real jump (3.2-4.5), not a step and not a reach nothing could make` + (worst ? ` - at column ${worst[0]} it is ${worst[1].toFixed(2)}` : ''));
  }
  const sign = L.ents.some(e => e.t === 'sign' && e.x >= 60 && e.x <= 90 && /SECOND LINE/.test(e.text || ''));
  ok(sign, 'and it is TAUGHT: a sign says so before the stretch (C5 - the other line\'s buckets are visible coming; nothing else needed for that)'); }

/* ---- THE WINCHMASTER'S WEST LOCK WALL, SEALED (winch3's Q4, approved, closed in this lane - his own AI in
   src/winchmaster.js is untouched): the wall now runs from THE HEAD FRAME's own top row down to the arena floor at
   every row, where the old 6-row wall left rows open between its low top and the housing's underside - the gap that
   let a hero land on the wall and step back out onto the landing. Pinned geometrically (the runtime toggle itself,
   main.js's setWall, is proved in the page by tools/ore-ride.mjs) - the FIX here is that main.js's own code for it
   reads the Head Frame's row off OR.ARENA rather than a number typed in main.js, so a future room edit cannot make
   the fix stale the way the lab's old literals did (claude/oreroad3, item 3). */
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const i0 = src.indexOf('function setWall(col, solid)'), body = i0 < 0 ? '' : src.slice(i0, src.indexOf('\n}', i0));
  ok(/A\.boss === 'winchmaster' && col === A\.wallL/.test(body), "setWall special-cases only the Winchmaster's own west wall (wallL) - no other boss's wall is touched");
  ok(/top = sealed \? 0 :/.test(body), 'and when it is that wall, it runs from row 0 (the top of the level - past the Head Frame\'s own underside, not merely to it) rather than the generic 6 rows'); }

console.log(failed());
function failed() { return fails ? '\n' + fails + ' ore-exam check(s) FAILED.' : '\nall ore-exam checks pass.'; }
process.exitCode = fails ? 1 : 0;
