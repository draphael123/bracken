// tools/ore-road.mjs — THE ORE ROAD and THE WINCHMASTER, proved in Node (no browser).
//
// REWRITTEN 2026-09-25 with the level (docs/briefs/ore-road-rework.md). The old version checked that the level
// MOVED. That was never what was wrong with it: Daniel's verdict was "too short, really only one mechanic, riding
// on lifts is boring, no new enemies", and every one of those is a number this file can hold the level to. So what
// it proves now is the REWORK'S OWN PROMISES, and each check below is one line of section 5 of the brief:
//   the skip is wide enough that a fight can happen on it        (OR.BUCKET.w, the change everything stands on)
//   the hole between two skips is a jump and not a step          (every gap reset against the running jump)
//   seven named sections of 60-100 and no dead stretch           (F1, and the 88-column gap that started this)
//   a checkpoint gap under forty                                 (B6, and the brief's own number)
//   something in the gorge to fall into                          (hazard was ZERO on a level about a gorge)
//   three creatures the game has never fought, none of them the boss   (F10)
//   every tipping frame has a floor under the goblin AND under his stream   (A12)
//   every line ends three-quarters of a tile inside its deck     (the trap that cost a night: ore-ride found it)
// and then THE WINCHMASTER, reworked (brief section 6): three housings no jump reaches, four told attacks forced one by one,
// the caused opening, the circuit round the housings, a phase two you can name, and the room holding up every attack (A12).
// usage: node tools/ore-road.mjs
import { LEVELS, T } from '../src/level.js';
import { readFileSync } from 'node:fs';
import { OR, cableLines, makeCableway, stepCableway, bucketAt, pointAt, lineYAt, brakeStep, liftStep, mineBlocked, WORKS, workSees, MINE_PLACES } from '../src/ore-road.js';
import { WINCH, updateWinchmaster, winchJam, winchTake, winchOpen, winchFrame } from '../src/winchmaster.js';

let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const TS = 16, lv = LEVELS.find(l => l.id === 'oreroad'), L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const footing = t => t === T.SOLID || t === T.PLANK || t === T.ONEWAY || t === T.NET;
const JUMP = 92 * (2 * 320 / 1000);                              // the running jump, in pixels: 92 px/s for two thirds of a second at world speed
console.log('THE ORE ROAD');
ok(lv.needs === 'moor' && LEVELS.find(l => l.id === 'storm').needs === 'oreroad' && LEVELS.find(l => l.id === 'crown').needs === 'storm', 'it sits between Gale Moor and Stormhold (Daniel, 2026-09-23): it needs the Moor, Stormhold needs it, and Highcrown needs Stormhold');
ok(L.music === 'oreroad' && L.arena.boss === 'winchmaster', "its own track ('oreroad', a real recording - 'mineworks' was a synth that played as silence), and the Winchmaster in its arena");
ok(/oreroad: '\.\/audio\/oreroad\.ogg'/.test(readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8')), 'and that track is a FILE in TRACKS, not a name that falls through to the synth');

/* ---- THE SKIP. Daniel found this one himself and the whole rework stands on it: at 24 px, against a knight
   whose box is 10 to 14, there was no room to swing or to dodge, so NO FIGHT COULD HAPPEN ON A BUCKET AT ALL. */
ok(OR.BUCKET.w >= 44 && OR.BUCKET.w <= 48, `a skip is ${OR.BUCKET.w} px - about three tiles, two bodies wide, and a place a fight can happen (it was 24)`);

/* ---- THE CLOCK, and the hole between two skips. A 46 px skip on the old 88 px spacing leaves 42 px of hole,
   which is a step across and not a jump, so every spacing was reset against the running jump. */
const C = makeCableway(L.cable);
for (const l of C.lines) { const hole = l.gap - OR.BUCKET.w, hop = !l.riders && !l.drum;   /* a line a rider can be asked to step ALONG: the down line carries goblins the other way and the drum line is the boss's */
  ok(hole > 24 && (!hop || hole < JUMP - 4), `the ${l.id} line leaves ${hole} px between skips` + (hop ? `, which is a jump and not a step against a ${Math.round(JUMP)} px running jump` : ' (nobody is asked to hop this one)')); }

/* ---- EVERY LINE ENDS THREE-QUARTERS OF A TILE INSIDE ITS DECK. A line that ended on the deck's edge let the
   bucket go while its rider still straddled the lip, and at speed he went down between them. THE DRUM LINES ARE NO
   LONGER EXEMPT: the Winchmaster REVERSES them, so a rider is carried out to their far end as well as in to the drum, and
   BOTH of their ends are held to the rule (a drum line reverses, so its start is checked as an end too). */
for (const l of C.lines) for (const end of l.drum ? [1, 0] : [1]) {
  const a = end ? l.pts[0] : l.pts[l.pts.length - 1], b = end ? l.pts[l.pts.length - 1] : l.pts[0], row = y => Math.round(y / TS), dir = Math.sign(b[0] - a[0]);
  const r = row(b[1]); let c = Math.floor(b[0] / TS);
  while (footing(at(dir > 0 ? c - 1 : c + 1, r))) c += dir > 0 ? -1 : 1;
  const inside = dir > 0 ? b[0] - c * TS : (c + 1) * TS - b[0];
  ok(footing(at(Math.floor(b[0] / TS), r)) && inside >= 0.75 * TS - 0.01, `the ${l.id} line sets its rider down ${inside.toFixed(1)} px inside the deck at column ${Math.floor(b[0] / TS)} (three-quarters of a tile is the floor)`);
  const ra = row(a[1]);
  if (end) ok(footing(at(Math.floor(a[0] / TS), ra)) || footing(at(Math.floor(a[0] / TS) + (dir > 0 ? -1 : 1), ra)), `and it leaves from a deck at column ${Math.floor(a[0] / TS)}`);
}

/* ---- AND THE RIDER'S BODY NEVER GOES INTO ROCK ON THE WAY THERE. Ending inside the deck is not enough: the first
   span's last stretch sagged two rows, so the skip came up to the sorting tower's rock FROM BELOW, and a rider still
   15 px under the deck's surface was carried flat into the cliff face and shelled off onto its foot, alive and going
   nowhere (ore-ride, 2026-09-23: "at [136,38], end [137,37]"). A one-way plank is walked up through and does not
   count; SOLID does. Checked over the whole line, at both heights a skip rides (loaded, and emptied OR.BUCKET.lift
   higher), with the widest hero's box (14 x 18), so the next sag anyone adds is caught here and not by a night. */
for (const l of C.lines) {
  const xs = l.pts.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs); let bad = null;
  for (let x = x0; x <= x1 && !bad; x += 2) { const y0 = lineYAt(l, x); if (y0 == null) continue;
    for (const lift of [0, OR.BUCKET.lift]) { const y = y0 - lift;
      for (let c = Math.floor((x - 7) / TS); c <= Math.floor((x + 6) / TS) && !bad; c++)
        for (let r = Math.floor((y - 18) / TS); r <= Math.floor((y - 1) / TS) && !bad; r++)
          if (at(c, r) === T.SOLID) bad = `x ${Math.round(x)} (column ${c}, row ${r}), riding ${lift ? 'empty' : 'loaded'}`; } }
  ok(!bad, `the ${l.id} line never carries its rider into rock` + (bad ? ` - it does at ${bad}` : ''));
}

/* ---- SEVEN SECTIONS OF 60 TO 100, TILING THE LEVEL (F1). "Too short, really only one mechanic" is answered by
   the shape as much as by the length: eight named places, seven of them walked, none of them the same twice. */
{ const ps = Object.entries(OR.PLACES).sort((a, b) => a[1][0] - b[1][0]);
  ok(ps.length === 8, `eight named places, seven walked and the eighth the arena: ${ps.map(p => p[0]).join(' ')}`);
  ok(ps[0][1][0] === 0 && ps[ps.length - 1][1][1] === L.W - 1 && ps.every(([, r], i) => i === 0 || r[0] === ps[i - 1][1][1] + 1), 'and they tile the level end to end with no hole between them');
  const walked = ps.slice(0, 7);
  ok(walked.every(([, [a, b]]) => b - a + 1 >= 60 && b - a + 1 <= 100), 'every walked section is 60 to 100 columns: ' + walked.map(([n, [a, b]]) => n + ' ' + (b - a + 1)).join(', '));
}

/* ---- AND NO DEAD STRETCH. The 88-column gap with nothing in it was the ride Daniel called boring written as a
   number. The spans are broken by two pylons, a tipple house and a second pillar, so the longest run of level
   with NOTHING to stand on is under forty columns. */
{ let run = 0, worst = 0, at0 = 0;
  for (let x = 0; x < L.W; x++) { let any = false; for (let y = 0; y < L.H && !any; y++) if (footing(at(x, y))) any = true;
    if (any) run = 0; else { run++; if (run > worst) { worst = run; at0 = x - run + 1; } } }
  ok(worst < 40, `the longest run with nothing at all to stand on is ${worst} columns (at ${at0}); it was 88`); }

/* ---- A CHECKPOINT GAP UNDER FORTY (B6, and section 5 of the brief) */
{ const cx = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b), end = Math.round(L.arena.x0 / TS);
  let gap = cx[0]; for (let i = 1; i < cx.length; i++) gap = Math.max(gap, cx[i] - cx[i - 1]);
  gap = Math.max(gap, end - cx[cx.length - 1]);
  ok(cx.length >= 12 && gap < 40, `${cx.length} checkpoints and the worst gap to one is ${gap} columns (it was 88)`); }

/* ---- SOMETHING IN THE GORGE TO FALL INTO. Hazard was ZERO on a level whose whole premise is a gorge. And the
   one hazard the level asks you to CROSS - the crusher in the yard - has a lip to land on and a rope out at each
   end, in plain sight from the bottom of it (C5). The other two are drops, not rooms: nothing can stand in them. */
{ let spikes = 0; for (let i = 0; i < L.grid.length; i++) if (L.grid[i] === T.SPIKE) spikes++;
  ok(spikes > 0, `${spikes} tiles of broken ore in the gorge, where there were none`);
  const lipL = [...Array(L.H).keys()].some(y => at(22, y) === T.SOLID && at(22, y - 1) === T.AIR);
  ok(lipL && at(34, OR.YARD + 3) === T.SOLID, 'the crusher has a lip at each end you can land on');
  ok(at(21, OR.YARD + 2) === T.NET && at(35, OR.YARD + 2) === T.NET, 'and a rope out of it at each end, visible from inside it (C5)');
  /* a spike you can STAND next to at body height would be a killzone, not a hazard: nothing may stand ON one */
  ok(!footing(T.SPIKE), 'and a tooth is never footing, so no route is ever laid across one'); }

/* ---- THREE CREATURES THE GAME HAS NEVER FOUGHT, AND NONE OF THEM IS THE BOSS (F10). This is the rule the Ore
   Road earned by failing it, and the reason its entry has left the grandfather list in tools/one-new-foe.mjs.
   Measured against every level walked BEFORE it, not against a list typed here. */
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const ehp = src.slice(src.indexOf('const EHP = {'));
  const EHP = new Set([...ehp.slice(0, ehp.indexOf('};')).matchAll(/([a-zA-Z][a-zA-Z0-9]*)\s*:/g)].map(m => m[1]));
  const seen = new Set();
  for (const q of LEVELS) { if (q.id === 'oreroad' || /^(shop|trial|custom)/.test(q.id)) continue;
    let R; try { R = q.build(); } catch { continue; }
    for (const e of (R.ents || [])) if (e && e.t && EHP.has(e.t)) seen.add(e.t);
    for (const r of (R.garrison || [])) if (Array.isArray(r) && EHP.has(r[0])) seen.add(r[0]); }
  const bosses = new Set([L.arena && L.arena.boss, L.mini && L.mini.boss].filter(Boolean));
  const mine = new Set((L.ents || []).filter(e => e && e.t && EHP.has(e.t)).map(e => e.t));
  for (const A of (L.ambushes || [])) for (const w of A.waves) for (const f of w) if (EHP.has(f[0])) mine.add(f[0]);
  const fresh = [...mine].filter(t => !seen.has(t) && !bosses.has(t));
  ok(fresh.length >= 3, `it brings ${fresh.length} creatures the game had never fought, and not one of them is its boss: ${fresh.join(', ')}`); }

/* ---- EVERY CHECKPOINT STANDS ON THE FLOOR (Daniel's playtest, 2026-09-25: "a checkpoint lamp standing on a heap of rubble,
   not sitting on the floor"). FIX THE RULE, NOT THE ROW: two halves, and both are checked for every checkpoint in the level.
   THE FLOOR: the three tiles under its 20 px base are all footing (rock or plank - never a rope, never air), the three it
   stands in are clear, and nothing else stands in them. THE MARKER: the level's own checkpoint drawing (main.js shrineKind,
   rendered here from src/art.js) has a FLAT FOOT - its last row is one unbroken run at least 12 px wide - so what you see
   sits on the floor and is not a pile of stones balanced on it. The crag cairn this level used fails the second half at
   every one of its checkpoints, which is what Daniel saw. */
{ const { install } = await import('./node-canvas.mjs'); install();
  const ARTM = await import('../src/art.js'), MAINS = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const kind = /function shrineKind\(\) \{[^\n]*\n\s*if \(L\.oreRoad\) return '(\w+)'/.exec(MAINS)?.[1] || 'crag';
  const cv = ARTM.bakeShrineKind(kind, false), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  let run = 0, best = 0; for (let x = 0; x < cv.width; x++) { if (d[((cv.height - 1) * cv.width + x) * 4 + 3] > 0) { run++; best = Math.max(best, run); } else run = 0; }
  const bad = [];
  for (const e of L.ents.filter(q => q.t === 'check')) {
    const why = [];
    for (const dx of [-1, 0, 1]) { const u = at(e.x + dx, e.y + 1); if (!(u === T.SOLID || u === T.PLANK || u === T.ONEWAY)) why.push(`no floor under column ${e.x + dx}`); if (at(e.x + dx, e.y) !== T.AIR) why.push(`column ${e.x + dx} is not clear`); }
    const crowd = L.ents.filter(q => q !== e && q.t === 'deco' && Math.abs(q.x - e.x) <= 1 && q.y === e.y); if (crowd.length) why.push('a ' + crowd[0].kind + ' in its base');
    if (best < 12) why.push(`its marker ('${kind}') has no flat foot (${best} px)`);
    if (why.length) bad.push(`${e.x},${e.y}: ${why.join(', ')}`); }
  ok(!bad.length, `every checkpoint (${L.ents.filter(q => q.t === 'check').length}) stands on a flat floor under its whole base, and its marker ('${kind}') sits on it with a flat foot ${best} px wide` + (bad.length ? ` - ${bad.length} do not: ` + bad.slice(0, 4).join('; ') : '')); }

/* ---- ONE VAST CAVERN (Daniel's playtest, 2026-09-25): no sky, a rock ceiling that never comes down into anybody's jump, lamps
   to pool the dark around, and seams you can mine that never stand in the way */
{ const P0 = L.palette || {}, lum = c => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  ok(L.dark >= 0.2 && L.night && P0.sky.every(c => lum(c) < 40) && (L.ambient || []).every(a => a.kind === 'cave'), `underground: the engine's dark at ${L.dark}, a black sky, the cave's own ambience (no wind)`);
  const use = new Array(L.W).fill(L.H);
  for (let x = 0; x < L.W; x++) for (let y = 1; y < L.H; y++) if (footing(at(x, y)) && !footing(at(x, y - 1))) { use[x] = y - 1; break; }
  for (const l of cableLines()) for (let x = Math.ceil(Math.min(l.pts[0][0], l.pts[l.pts.length - 1][0]) / TS); x * TS <= Math.max(l.pts[0][0], l.pts[l.pts.length - 1][0]); x++) { const y = lineYAt(l, x * TS + 8); if (y !== null) use[x] = Math.min(use[x], Math.floor((y - OR.BUCKET.hang - 10) / TS)); }
  const HEAD = 5;   /* a jump rises 3 rows (51 px) and a hero is a row and a bit tall: rock nearer than 5 rows is rock he is drawn inside */
  let low = null; for (let x = 0; x < L.W; x++) for (let k = -5; k <= 5; k++) { const c = x + k; if (c < 0 || c >= L.W) continue; if (L.ceil[x] > 0 && L.ceil[x] > use[c] - HEAD) low = low || `column ${x} (row ${L.ceil[x]}) over something at ${c},${use[c]}`; }
  ok(L.ceil.length === L.W && !low, `the ceiling keeps at least ${HEAD} rows over everything anyone uses within five columns (it keeps ${OR.CEIL_GAP}) - a jump never reaches it` + (low ? ' - it does not at ' + low : ''));
  const fl = L.ents.filter(e => e.t === 'bat' || e.t === 'harpy' || e.t === 'crow');
  ok(!L.ents.some(e => e.t === 'crow') && fl.every(e => e.y > L.ceil[e.x]), `the ${fl.length} fliers are under the rock (and a crow is a bat down here)`);
  ok(L.ents.filter(e => e.t === 'rockfall').every(e => e.y === L.ceil[e.x] + 1), 'every rockfall hangs from the ceiling\'s underside: they fall from the stalactites');
  const lamps = L.ents.filter(e => e.t === 'minerlamp'), badL = lamps.filter(e => !(footing(at(e.x, e.y + 1)) && at(e.x, e.y + 1) !== T.NET && at(e.x, e.y) === T.AIR));
  ok(lamps.length >= 20 && !badL.length, `${lamps.length} pit lamps, every one standing on a floor` + (badL.length ? ' - not ' + badL.map(e => e.x).join(',') : ''));
  const V = L.veins || [], badV = V.filter(v => !(at(v.x, v.y) === T.AIR && at(v.x, v.y - 1) === T.AIR && footing(at(v.x, v.y + 1)) && at(v.x, v.y + 1) !== T.NET) || L.ents.some(e => e.t !== 'coin' && e.x === v.x && e.y === v.y));
  ok(V.length >= 12 && !badV.length, `${V.length} seams to mine, each in the back wall over a floor its spill lands on, standing in nobody's way (the cell in front is clear and holds nothing)` + (badV.length ? ' - not ' + badV.map(v => v.x + ',' + v.y).join(' ') : ''));
  ok(OR.VEIN_HITS === 3 && V.every(v => v.coins === OR.VEIN_COINS) && /total \+= \(L\.veins \|\| \[\]\)\.reduce/.test(readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')), `three blows a seam, ${OR.VEIN_COINS} coins each, and main.js counts them into the level's total the way it counts a crate's`); }

/* ---- MORE ORE (docs/briefs/ore-road-mine-life.md, section 1): ore in every rock face the route shows, heaps, spills and carts
   full of it on the floors - VARIED, not one stamp repeated, and NEVER OVER A HAZARD OR A TELL. Each floor prop is asked the
   brief's whole list (mineBlocked: footing, open air, no rope, no spike, no rockfall column, no tippler's stream, no checkpoint,
   sign, lamp, silver or start, no pit, no ambush room, no vein, and nothing in the Winchmaster's room) */
{ const S = L.seams || [], M = L.mine || [];
  const badS = S.filter(([x, y]) => at(x, y) !== T.SOLID || x * TS >= L.arena.x0 || [-1, 0, 1].some(dx => [-1, 0, 1].some(dy => at(x + dx, y + dy) === T.SPIKE)));
  ok(S.length >= 150 && !badS.length, `${S.length} seams of ore in the rock faces, every one IN rock, none beside a spike and none in the Winchmaster's room` + (badS.length ? ' - not ' + JSON.stringify(badS.slice(0, 4)) : ''));
  const combos = new Map(); for (const q of S) combos.set(q[2] + '/' + q[3], (combos.get(q[2] + '/' + q[3]) || 0) + 1);
  const worst = Math.max(...combos.values()) / Math.max(1, S.length);
  ok(new Set(S.map(q => q[2])).size === 4 && new Set(S.map(q => q[3])).size === 4 && worst < 0.2, `varied, not one stamp: four ores and four seam shapes in ${combos.size} pairings, the commonest ${Math.round(worst * 100)}% of them`);
  ok(S.some(q => q[4]) && S.filter(q => q[4]).length < S.length / 2, `${S.filter(q => q[4]).length} of them glint`);
  const why = M.map(it => [it, mineBlocked(L, T, it)]).filter(([, r]) => r);
  ok(M.filter(q => !q.set).length >= 15 && !why.length, `${M.filter(q => !q.set).length} heaps, spills and carts of ore on the floors, every one on footing and clear of every hazard and every tell` + (why.length ? ' - NOT ' + why.map(([it, r]) => it.k + '@' + it.x + ',' + it.y + ': ' + r).join('; ') : ''));
  ok(new Set(M.filter(q => q.k === 'heap').map(q => q.size)).size === 3 && M.some(q => q.k === 'cart' && q.load > 0) && new Set(M.filter(q => !q.set).map(q => q.ore)).size === 4, 'heaps of all three sizes, a cart full of ore, and all four ores on the floors'); }

/* ---- THE WORK LOOPS (section 2), as geometry: every row of WORKS found its goblin (a row that silently matched nobody is a loop
   that does not exist), none of them is the level's own three, the elite or in his room, every miner at work has a seam on his
   own floor to work, every rail and every sack run is floor all the way, and every lift cage has open air to run in. The loops
   themselves - and the rule that a working goblin never hurts you before its alert - are proved in the page (tools/ore-work.mjs) */
{ const W = L.ents.filter(e => e.work), fl = t => t === T.SOLID || t === T.PLANK || t === T.ONEWAY || t === T.NET;
  ok(W.length === WORKS.length && new Set(W.map(e => e.work.key)).size === W.length, `${W.length} goblins at work, one for every row of WORKS (${WORKS.length})`);
  ok(!W.some(e => ['tippler', 'sheargob', 'gaffer'].includes(e.t) || e.elite || e.x * TS >= L.arena.x0), "none of them the level's own three, the elite, or in the Winchmaster's room");
  const idle = W.filter(e => e.work.k === 'pick' && !(L.veins || []).some(v => v.y === e.y && Math.abs(v.x - e.x) <= 6));
  ok(!idle.length, 'every miner at work has a seam on his own floor within six columns' + (idle.length ? ' - not ' + idle.map(e => e.x).join(',') : ''));
  const span = w => w.k === 'cart' ? [Math.floor(Math.min(w.load, w.tip) - 1.3), Math.ceil(Math.max(w.load, w.tip) + 1.3) - 1] : w.k === 'sack' ? [Math.min(w.from, w.to), Math.max(w.from, w.to)] : w.k === 'sort' ? [w.at - 2, w.at + 2] : w.k === 'winch' ? [Math.min(w.at, w.shaft), Math.max(w.at, w.shaft) + 1] : null;
  const gaps = W.filter(e => span(e.work)).filter(e => { const [a, b] = span(e.work); for (let x = a; x <= b; x++) if (!fl(at(x, e.y + 1)) || at(x, e.y) === T.SOLID) return true; return false; });
  ok(!gaps.length, 'every rail, sack run, table and winch stands on floor from end to end' + (gaps.length ? ' - not ' + gaps.map(e => e.work.key).join(', ') : ''));
  const shafts = W.filter(e => e.work.k === 'winch').filter(e => { for (let y = e.work.top + 1; y <= e.y; y++) if (at(e.work.shaft, y) === T.SOLID || at(e.work.shaft, y) === T.NET) return true; return false; });
  ok(W.some(e => e.work.k === 'winch') && !shafts.length, 'every lift cage runs in open air from its floor to its top' + (shafts.length ? ' - not ' + shafts.map(e => e.work.key).join(', ') : ''));
  /* and the rule of the eye: ahead he sees you at the distance every goblin notices you; behind, only close */
  const g0 = { x: 1000, y: 500, face: 1 };
  ok(workSees(g0, { x: 1000 + OR.WORK_SEE - 2, y: 500 }) && !workSees(g0, { x: 1000 - OR.WORK_SEE + 2, y: 500 }) && workSees(g0, { x: 1000 - OR.WORK_HEAR + 2, y: 500 }) && !workSees(g0, { x: 1010, y: 500 - OR.WORK_SEE_Y - 2 }) && !workSees(g0, { x: 1010, y: 500, dead: true }) && OR.WORK_HEAR < OR.WORK_SEE,
    `a goblin at work sees you ${OR.WORK_SEE} px ahead and hears you ${OR.WORK_HEAR} px behind, within ${OR.WORK_SEE_Y} px up or down`); }

/* ---- MINE THEMING (section 3): the furniture keeps the ore's rule (a chute by its foot, and its top on a deck), there is
   shoring, lanterns and an office, and EVERY PLACE HAS ITS OWN LANDMARKS - no place is dressed as another one */
{ const M = L.mine || [], S = M.filter(q => q.set), W = L.ents.filter(e => e.work), fl = t => t === T.SOLID || t === T.PLANK || t === T.ONEWAY;
  const bad = S.map(it => [it, it.k === 'chute' ? (mineBlocked(L, T, { ...it, x0: it.x, x1: it.x }) || (fl(at(it.top[0], it.top[1] + 1)) ? null : 'its top is not on a deck')) : mineBlocked(L, T, it)]).filter(([, r]) => r);
  ok(S.length >= 12 && !bad.length, `${S.length} pieces of the mine's furniture, every one on footing and clear of every hazard and every tell` + (bad.length ? ' - NOT ' + bad.map(([it, r]) => it.k + '@' + it.x + ': ' + r).join('; ') : ''));
  const kinds = new Set(S.map(q => q.k));
  ok(['shore', 'rack', 'tally', 'office', 'chute', 'spoil', 'wreckcart'].every(k => kinds.has(k)) && S.filter(q => q.lit).length >= 3 && W.some(e => e.work.k === 'winch') && W.some(e => e.work.k === 'sort') && W.some(e => e.work.k === 'cart'),
    'timber shoring, tool racks, a tally board, the mine office, an ore chute, a spoil heap, an overturned cart, hanging lanterns - and the lift cages, sorting tables and rails of the goblins at work');
  const wx = e => e.work.k === 'cart' ? (e.work.load + e.work.tip) / 2 : e.work.k === 'sack' ? (e.work.from + e.work.to) / 2 : e.work.at ?? e.x;   /* where the work IS, not where the goblin was put down */
  const has = (x0, x1, k) => k.startsWith('work:') ? W.some(e => e.work.k === k.slice(5) && wx(e) >= x0 && wx(e) <= x1) : S.some(q => q.k === k && q.x >= x0 && q.x <= x1);
  for (const [name, x0, x1, marks] of MINE_PLACES) { const miss = marks.filter(k => !has(x0, x1, k)); ok(!miss.length, `${name} (${x0}-${x1}): ${marks.join(', ')}` + (miss.length ? ' - MISSING ' + miss.join(', ') : '')); }
  const sig = MINE_PLACES.map(p => p[3].slice().sort().join('+'));
  ok(new Set(sig).size === sig.length && MINE_PLACES.length >= 7, `${MINE_PLACES.length} places along the route, and no two of them are dressed alike (F2, F6)`);
  ok(MINE_PLACES.every((p, i) => i === 0 || p[1] > MINE_PLACES[i - 1][2]) && MINE_PLACES[MINE_PLACES.length - 1][2] < L.arena.x0 / TS, "in route order, none overlapping, and all of them short of the Winchmaster's room"); }

/* ---- THE PIT (Daniel's playtest, item 5): nowhere on the road can a fall reach the bottom of the level any more. Every column
   from the yard to the drum house, dropped down from the top, meets something - a floor, a ledge, or a span's spike bed - and
   every spike bed has its turbines, a recovery ledge on the wall at the START of its span, a clear path for the lift from any
   point of the bed to that ledge, and a ladder from the ledge whose top is level with the deck the span starts from. (The page
   half - that it costs a fifth, never a life, and carries you there - is tools/ore-ride.mjs.) */
{ let hole = null;
  for (let x = 0; x < OR.ARENA.x0 && !hole; x++) { if (L.pits.some(q => !q.bed && x >= q.x0 && x <= q.x1)) continue;   /* under a ride the pit's own floor catches you (orePitStep) */
    let y = 0; while (y < L.H && at(x, y) === T.AIR || (y < L.H && at(x, y) === T.NET)) y++; if (y >= L.H) hole = x; }
  ok(!hole, 'no fall anywhere from the yard to the drum house reaches the bottom of the level' + (hole !== null ? ' - column ' + hole + ' falls through' : ''));
  for (const q of L.pits) { const why = [];
    for (let x = q.x0; x <= q.x1; x++) if (q.bed ? (at(x, q.floor) !== T.SPIKE || at(x, q.floor + 1) !== T.SOLID) : [...Array(L.H - q.floor).keys()].some(k => at(x, q.floor + k) !== T.AIR)) { why.push((q.bed ? 'no spike bed at ' : 'tiles in the pit floor at ') + x); break; }
    if (!(q.turbines.length >= 5 && q.turbines.every(t => t > q.x0 && t < q.x1) && q.turbines.every((t, i) => !i || t - q.turbines[i - 1] <= OR.TURBINE_EVERY))) why.push('turbines');
    const [l0, l1, lr] = q.ledge; if (!(at(l0, lr + 1) === T.SOLID && at(l1, lr + 1) === T.SOLID && at(l0 + 1, lr) !== T.SOLID)) why.push('ledge');
    const [lx, ly0, ly1] = q.ladder; for (let y = ly0; y <= ly1; y++) if (at(lx, y) !== T.NET) { why.push('ladder broken at ' + y); break; }
    if (ly1 !== lr || !(lx >= l0 && lx <= l1)) why.push('the ladder does not stand on the ledge');
    if (!(ly0 === q.start[1] + 1 && footing(at(q.start[0], q.start[1] + 1)) && Math.abs(lx - q.start[0]) === 1)) why.push('the ladder\'s top is not level with the start deck beside it');
    const hover = lr - 1; for (let x = Math.min(q.x0, l0); x <= q.x1 && !why.length; x++) { for (let y = hover; y < q.floor; y++) if (at(x, y) === T.SOLID && !(x >= l0 && x <= l1)) { why.push(`the lift's path is blocked at ${x},${y}`); break; } }
    ok(!why.length, `the ${q.id} pit (${q.x0}-${q.x1}): a spike bed under all of it, ${q.turbines.length} turbines, a recovery ledge at ${l0}-${l1} and a ladder home to ${q.start}` + (why.length ? ' - ' + why.slice(0, 3).join('; ') : '')); }
  const M = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/Math\.min\(Math\.round\(P\.maxHp \* OR\.PIT_BITE\), P\.hp - 1\)/.test(M) && OR.PIT_BITE === 0.2, 'the pit takes a fifth of your health and never the last point of it (straight off, not through the difficulty\'s scaling)'); }

/* ---- EVERY FALLING ROCK IS TOLD (Daniel's playtest): a second of warning, never begun off screen, and over the gorge the
   ring is on the cable a rider is on, not a hundred feet under it. (The page half - that each one really falls in view - is
   tools/ore-ride.mjs.) */
{ const rf = L.ents.filter(e => e.t === 'rockfall'), C0 = cableLines();
  const noLane = rf.filter(e => C0.some(l => { const y = lineYAt(l, e.x * TS + 8); return y !== null && y > (e.y + 1) * TS; }) && !(e.lane > 0));
  ok(rf.length >= 5 && rf.every(e => e.tell >= 0.9 && e.seen) && !noLane.length, `every one of the ${rf.length} rockfalls is told for ${OR.ROCK_TELL} s, only on screen, and marked on the cable it crosses` + (noLane.length ? ' - not ' + noLane.map(e => e.x).join(',') : ''));
  const MS = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/if \(pr\.timer <= 0 && pr\.seenT < \(pr\.tellT \|\| 0\.8\)\) pr\.timer = pr\.every/.test(MS) && /if \(pr\.lane\)/.test(MS), 'and main.js honours all three (a beat whose spot was not on screen for its whole tell does not fall, and the ring on the lane)'); }

/* ---- A12: EVERY TIPPING FRAME HAS A FLOOR UNDER THE GOBLIN AND A FLOOR UNDER HIS STREAM. The Tippler's whole
   attack is a column of ore going straight down, so a tippler over open gorge is an attack the room cannot give. */
{ const DROP = 15;   /* TIPPLER.drop in main.js is 230 px, which is fourteen rows and a bit */
  const bad = [];
  for (const e of L.ents) { if (e.t !== 'tippler') continue;
    if (!footing(at(e.x, e.y + 1))) { bad.push(`${e.x},${e.y} stands on nothing`); continue; }
    let hit = 0; for (let y = e.y + 2; y <= e.y + 1 + DROP && y < L.H; y++) if (footing(at(e.x, y))) { hit = y; break; }
    if (!hit) bad.push(`${e.x},${e.y} tips into open air`); }
  ok(!bad.length, `every tipping frame has a floor under it and a floor under its stream (${L.ents.filter(e => e.t === 'tippler').length} of them)` + (bad.length ? ': ' + bad.join('; ') : '')); }

/* ---- THE RIDE IS A VERB: the two pieces of arithmetic the page hangs the ore and the brake on */
{ let b = 0; for (let i = 0; i < 60; i++) b = brakeStep(b, true, 1 / 60);
  ok(Math.abs(b - 1) < 1e-6 && OR.BRAKE <= 0.8, `the brake is all the way on after a second (it takes ${OR.BRAKE} s, and lets go as slowly)`);
  for (let i = 0; i < 60; i++) b = brakeStep(b, false, 1 / 60);
  ok(b === 0, 'and all the way off again when you drop the shield');
  let lift = 0; for (let i = 0; i < 60; i++) lift = liftStep(lift, false, 1 / 60);
  ok(Math.abs(lift - OR.BUCKET.lift) < 1e-6 && OR.BUCKET.lift >= 12, `an emptied skip rides ${OR.BUCKET.lift} px higher, which is most of a tile - you can see which ones are loaded from across the gorge`);
  for (let i = 0; i < 60; i++) lift = liftStep(lift, true, 1 / 60);
  ok(lift === 0, 'and a loaded one hangs back down where it was'); }
/* AND THE BRAKE REALLY STOPS THE LINE (stepCableway reads l.hold) */
{ const D = makeCableway(cableLines()), l = D.lines[0]; l.hold = 1; stepCableway(D, 1); ok(l.t === 0, 'with the brake on, a second of clock moves the line not at all');
  l.hold = 0; stepCableway(D, 1); ok(Math.abs(l.t - l.speed) < 1e-6, 'and with it off the line runs at its own speed again'); }

/* ---- the clock, unchanged: evenly spaced, and moving at the line's speed */
{ const l = C.lines[0], p0 = bucketAt(l, 0); stepCableway(C, 1);
  const q0 = bucketAt(l, 0); ok(p0.vis && q0.vis && Math.abs(Math.hypot(q0.x - p0.x, q0.y - p0.y) - l.speed) < 3, `a bucket goes ${l.speed} px in a second along the first span`);
  const d = [...Array(l.n).keys()].map(i => bucketAt(l, i)).filter(b => b.vis).map(b => b.s).sort((a, b) => a - b);
  ok(d.slice(1).every((s, i) => Math.abs(s - d[i] - l.gap) < 0.01), `and they come ${l.gap} px apart, like a clock`); }

/* A RUSTED BUCKET CAN BE HOPPED OFF: the next one is a jump away in the bucket's own frame (you keep its speed when you leave it) */
{ const l = C.lines.find(q => q.id === 'steep'), hole = l.gap - OR.BUCKET.w;
  ok(l.cracked === 3 && hole < JUMP - 6, `on the steep line every ${l.cracked}rd bucket is rust, and the hole to the next is ${hole} px against a ${Math.round(JUMP)} px running jump`);
  ok(OR.CRACK >= 0.8 && OR.CRACK <= 1.2, `a rusted one holds you ${OR.CRACK} s: long enough to see it shake, short enough to matter`); }

/* ---- THE DRUM HOUSE: THREE HOUSINGS ON TWO LINES, AND - ROUND TWO, Daniel's playtest - A LADDER UP ONTO EVERY ONE. He is a man
   you can climb up to and fight now: each housing has a ladder from its ledge whose top is level with the housing's surface, and
   each ledge a rope up to it from the spoil (or it is the deck's own). The drum's mouth is still on the ledge, for the jam. */
const AR = OR.ARENA;
{ ok(AR.housings.length === 3 && new Set(AR.housings.map(h => h.id)).size === 3, 'THREE HOUSINGS: ' + AR.housings.map(h => h.name).join(', '));
  const lines = C.lines.filter(l => l.drum);
  ok(lines.length === 2 && AR.housings.every(h => lines.some(l => l.id === h.line)), 'on the room\'s two drum lines, and every housing has its drum on one of them');
  ok(/m\.ore && !m\.fallen && rider && keys\.down && !ln\.drum/.test(readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')), "a drum line's skips cannot be tipped (every one of them is loaded, for the jam)");
  for (const h of AR.housings) { const [lx, ly0, ly1] = h.ladder, why = [];
    for (let y = ly0; y <= ly1; y++) if (at(lx, y) !== T.NET) { why.push('broken at row ' + y); break; }
    if (!(lx === h.x0 - 1 || lx === h.x1 + 1)) why.push('not beside the housing');
    if (ly0 !== h.top + 1 || at(lx + (lx < h.x0 ? 1 : -1), h.top + 1) !== T.SOLID) why.push('its top is not level with the housing');
    if (at(lx, ly1 + 1) !== T.SOLID) why.push('its foot stands on nothing');
    ok(at(h.x0, h.top + 1) === T.SOLID && at(h.x1, h.top + 1) === T.SOLID && !why.length, `${h.name}: a ladder up onto it (column ${lx}, rows ${ly0}-${ly1}), its foot on ${lx >= h.ledge[0] && lx <= h.ledge[1] ? 'its ledge' : 'the pit\'s recovery ledge'}` + (why.length ? ' - ' + why.join('; ') : ''));
    ok(h.x1 - h.x0 + 1 >= 6, `and it is a platform to fight on: ${h.x1 - h.x0 + 1} tiles wide (round three: "a bit bigger" - the Head Frame was 5, the Tail Wheel 4)`);
    ok(h.ledgeTop - h.top === 4 && at(h.ledge[0], h.ledgeTop + 1) === T.SOLID && at(h.ledge[1], h.ledgeTop + 1) === T.SOLID, `and its ledge (${h.ledge[0]}-${h.ledge[1]}, row ${h.ledgeTop}) is four rows under it: where a jam throws him`);
    const l = lines.find(q => q.id === h.line), end = h.at === 'end' ? l.pts[l.pts.length - 1] : l.pts[0];
    ok(Math.floor(end[0] / TS) >= h.ledge[0] && Math.floor(end[0] / TS) <= h.ledge[1] && Math.abs(end[1] - (h.ledgeTop + 1) * TS) < 1, `and the ${l.id} line's ${h.at} is ON that ledge, at its height: the drum's mouth is where the ride ends`); } }
/* THE WAY ROUND (round three): the room's floor is the PIT, like every span's - so every housing is reached by a ladder or a ride,
   never by walking the floor. From the entrance deck: the Head Frame's ladder (the deck runs to its foot), the low line to the Great
   Drum's ledge, and from the Head Frame's ledge the high line to the Tail Wheel's. No ledge is a dead end: the low line runs back
   to the deck whenever he is not on or bound for the Great Drum (checked in THE WINCHMASTER below) */
{ const B = AR.housings[1], pit = L.pits.find(q => q.id === 'drum');
  ok(pit && pit.x0 <= AR.x0 + 6 && pit.x1 >= AR.house[0] - 1 && [...Array(pit.x1 - pit.x0 + 1).keys()].every(k => at(pit.x0 + k, pit.floor) === T.AIR), 'the drum house\'s floor is the pit, like every span\'s: spikes, turbines, a recovery ledge and a ladder home');
  ok(footing(at(B.ladder[0] - 1, AR.deck + 1)) && at(B.ladder[0] - 1, AR.deck) === T.AIR && B.ladder[1] <= AR.deck && B.ladder[2] >= AR.deck, 'the entrance deck runs to the Head Frame\'s ladder, and the ladder passes it: step off the deck onto it');
  ok(AR.ropes.length === 0 && [...Array(AR.house[0] - 482).keys()].every(k => at(482 + k, AR.spoil + 1) !== T.SOLID), 'and there is no spoil floor left to walk on (and no ropes up out of it)'); }

console.log('\nTHE WINCHMASTER');
/* THE STUB WORLD: the room's two drum lines as the level builds them, its three housings in pixels exactly as main.js's
   winchHousings() makes them, a hero moved by hand, and every world call written down */
function world(o = {}) {
  const Cw = makeCableway(cableLines()), log = [], lines = Cw.lines;
  const H = AR.housings.map(Hs => { const ln = lines.find(l => l.id === Hs.line), p = ln.pts, near = Hs.at === 'end' ? p[p.length - 1] : p[0], far = Hs.at === 'end' ? p[0] : p[p.length - 1];
    return { id: Hs.id, name: Hs.name, homeX: Hs.home * TS, topY: (Hs.top + 1) * TS, px0: Hs.x0 * TS, px1: (Hs.x1 + 1) * TS, ledgeX: (Hs.at === 'end' ? Hs.ledge[1] + 0.5 : Hs.ledge[0] + 0.5) * TS, ledgeY: (Hs.ledgeTop + 1) * TS, drumX: near[0], mouthY: near[1], away: Math.sign(far[0] - near[0]) || -1, sense: Hs.at === 'end' ? 1 : -1, ln }; });
  const P = { x: 478 * TS, y: (AR.deck + 1) * TS, dead: false, ground: true, vx: 0, vy: 0 };
  const w = { lines, H, log, P, ride: null };   /* ride: { h, dist } puts the hero on housing h's line, dist px short of its drum */
  const place = () => { if (!w.ride) return; const q = H[w.ride.h]; P.x = q.drumX + q.away * w.ride.dist; P.y = lineYAt(q.ln, P.x); };
  const c = { P, A: { x0: AR.x0 * TS, x1: AR.x1 * TS }, H, rand: () => 0.3,
    hit: (x, d, hard, name) => { log.push(['hit', name, d, hard]); return o.block && !hard ? 'blocked' : 'hit'; }, say: m => log.push(['say', m]), sound: () => {}, shake: () => {},
    shove: () => log.push(['shove']), drag: d => log.push(['drag', d]),
    drive: (h, sense, mul) => { H[h].ln.dir = sense * H[h].sense; H[h].ln.mul = mul; log.push(['drive', h, sense, mul]); },
    lineY: (h, x) => lineYAt(H[h].ln, x), crash: () => log.push(['crash']), solidAt: (x, y) => T.SOLID === at(Math.floor(x / TS), Math.floor(y / TS)), pVel: () => [0, 0],
    riding: h => w.ride && w.ride.h === h ? { coming: H[h].ln.dir * H[h].sense > 0 && !(H[h].ln.jam > 0), dist: w.ride.dist } : null,
    atMouth: (h, r) => !P.dead && Math.abs(P.y - H[h].mouthY) < 12 && Math.abs(P.x - H[h].drumX) < r,
    seen: () => o.unseen ? false : true, onLine: () => false, climbing: () => !!w.climbing,
    onHousing: h => w.upOn === h && Math.abs(P.y - H[h].topY) < 3 && P.x > H[h].px0 - 4 && P.x < H[h].px1 + 4,
    rockSpot: x => o.noRoof ? null : { x, y0: 4, gy: 208 }, dropRock: (x, y) => log.push(['rock', x, y]) };
  const e = { t: 'winchmaster', alive: true, hp: WINCH.hp, maxHp: WINCH.hp, mode: 'wake', modeT: 0.1, cd: 0, x: H[0].homeX, y: H[0].topY, face: -1, phase: 1 };
  const modes = new Set();
  Object.assign(w, { c, e, modes, place, step() { place(); updateWinchmaster(e, 1 / 60, c); modes.add(e.mode); }, run(sec) { for (let t = 0; t < sec; t += 1 / 60) w.step(); } });
  return w;
}
const EVERY = new Set();   /* A3: every mode any scenario below reached, so the last check can say every attack FIRED */
const done = w => { for (const m of w.modes) EVERY.add(m); };
{ const w = world(); w.run(0.3); done(w);
  ok(w.e.mode === 'stalk' && w.e.at === 0 && Math.abs(w.e.y - w.H[0].topY) < 1, 'he wakes on THE GREAT DRUM');
  ok(w.H[0].ln.dir === 1 && w.H[1].ln.dir === -1, 'and drives the low line INTO it - and the high line toward THE HEAD FRAME, where he goes next, so you can be on it before he is'); }
/* ---- REVERSE (quiet): a rider coming at him inside revRange gets the line run backwards, faster, and no longer than revT */
{ const w = world(); w.run(0.3); w.ride = { h: 0, dist: WINCH.revRange - 20 }; w.e.cd = 0; w.run(0.05);
  ok(w.e.mode === 'reverseTell', 'REVERSE: a rider coming at his drum inside ' + WINCH.revRange + ' px - HE THROWS THE BRAKE');
  w.run(WINCH.tell.reverse + 0.05); ok(w.H[0].ln.dir === -1 && w.H[0].ln.mul > 1, 'and the line runs back out, faster');
  w.ride = null; w.run(WINCH.revT + 0.1); done(w); ok(w.H[0].ln.dir === 1, 'for as long as the reverse holds, and no longer');
  const W2 = world(); W2.run(0.3); W2.ride = { h: 0, dist: WINCH.revRange + 60 }; W2.e.cd = 0; W2.e.sendCd = 9; W2.e.hookCd = 9; W2.run(0.05);
  ok(W2.e.mode !== 'reverseTell', 'but not at a rider still far out: the reverse is for the one about to reach him'); }
/* ---- SEND (!!): a loaded bucket down HIS line from HIS drum, that takes a hero at the line's height and misses one in the air */
{ const w = world(); w.run(0.3); w.e.revCd = 9; w.ride = { h: 0, dist: 300 }; w.e.cd = 0; w.run(0.05);
  ok(w.e.mode === 'sendTell', 'SEND: with the brake cooling, a rider gets a loaded bucket sent down the line at him');
  w.run(WINCH.tell.send + 0.05); ok(!!w.e.runaway && w.e.runaway.at === 0, 'it goes down the line he stands on');
  w.run(1.4); done(w); ok(w.log.some(q => q[0] === 'hit' && q[1] === 'A LOADED BUCKET' && q[3] === true), 'and takes the rider at the line\'s height, and no shield turns it');
  const w3 = world(); w3.run(0.3); w3.e.revCd = 9; w3.ride = { h: 0, dist: 300 }; w3.e.cd = 0; w3.run(0.05 + WINCH.tell.send + 0.05);
  w3.ride = null; w3.c.P.x = w3.H[0].drumX - 300; w3.c.P.y = w3.H[0].mouthY - 40; w3.run(1.4);
  ok(!w3.log.some(q => q[0] === 'hit'), 'a hero in the air over it is missed');
  /* and on the high line it runs from the housing he is on, the other way along the same cable */
  const w4 = world(); w4.run(0.3); w4.e.at = 2; w4.e.x = w4.H[2].homeX; w4.c.drive(2, 1, 1); w4.e.revCd = 9; w4.e.hookCd = 9; w4.ride = { h: 2, dist: 200 }; w4.e.cd = 0; w4.run(0.05 + WINCH.tell.send + 0.05);
  w4.run(0.9); ok(w4.log.some(q => q[0] === 'hit' && q[1] === 'A LOADED BUCKET'), 'and from THE TAIL WHEEL it comes west down the high line at a rider on it'); }
/* ---- THE HOOK (!!): thrown at where you are going, it catches a hero who stays put and misses one who jumps */
{ const w = world(); w.run(0.3); w.e.revCd = 9; w.e.sendCd = 9; w.e.leverCd = 9; w.ride = null; w.c.P.x = w.H[0].drumX - 60; w.c.P.y = w.H[0].mouthY; w.e.cd = 0; w.run(0.05);
  ok(w.e.mode === 'hookTell', 'THE HOOK: anyone in reach of the chain (' + WINCH.hookR + ' px) gets it thrown at them');
  w.run(WINCH.tell.hook + 0.9); done(w);
  ok(w.log.some(q => q[0] === 'hit' && q[1] === 'THE HOOK' && q[3] === true) && w.log.some(q => q[0] === 'drag' && q[1] === 1), 'it catches a hero who stood still, no shield turns it, and it DRAGS them toward him and off their footing');
  const w2 = world(); w2.run(0.3); w2.e.revCd = 9; w2.e.sendCd = 9; w2.e.leverCd = 9; w2.c.P.x = w2.H[0].drumX - 60; w2.c.P.y = w2.H[0].mouthY; w2.e.cd = 0; w2.run(0.05 + WINCH.tell.hook + 0.02);
  w2.c.P.y -= 44; w2.run(0.9); ok(!w2.log.some(q => q[0] === 'hit'), 'and misses a hero who jumped as it was thrown'); }
/* ---- THE BRAKE BAR (!): the one blow a shield turns, on whoever is at his drum's mouth */
{ const w = world({ block: true }); w.run(0.3); w.ride = { h: 0, dist: 40 }; w.e.cd = 0; w.e.revCd = 9; w.run(0.05);
  ok(w.e.mode === 'leverTell', 'THE BRAKE BAR: a rider at his drum\'s mouth gets the bar before anything else');
  w.run(WINCH.tell.lever + 0.1); done(w);
  ok(w.log.some(q => q[0] === 'hit' && q[1] === 'THE BRAKE BAR' && q[3] === false) && !w.log.some(q => q[0] === 'shove'), 'and it is a blow a shield turns (yellow): shielded, you ride on in');
  const w2 = world(); w2.run(0.3); w2.ride = { h: 0, dist: 40 }; w2.e.cd = 0; w2.e.revCd = 9; w2.run(0.05 + WINCH.tell.lever + 0.1);
  ok(w2.log.some(q => q[0] === 'shove'), 'unshielded, it knocks you off the bucket and out over the drop'); }
/* ---- NEVER A SEND AT THE MOUTH (it would start inside the rider: a blow with no answer), and SEND and THE HOOK take turns */
{ const w = world(); w.run(0.3); w.e.revCd = 99; w.e.leverCd = 99; w.ride = { h: 0, dist: WINCH.sendMin - 4 }; w.e.cd = 0; w.run(6);
  ok(!w.modes.has('sendTell'), `a rider inside ${Math.round(WINCH.sendMin)} px of the drum is never sent a bucket: it would be let go on top of them, and the bar is for the mouth`);
  const w2 = world(); w2.run(0.3); w2.e.revCd = 99; w2.e.leverCd = 99; w2.ride = { h: 0, dist: 120 }; const seq = []; let last = null;
  for (let t = 0; t < 40 * 60; t++) { w2.step(); if (w2.e.mode !== last) { last = w2.e.mode; if (last === 'sendTell' || last === 'hookTell') seq.push(last[0]); }
    if (w2.e.mode === 'stalk') { w2.e.sendCd = w2.e.hookCd = 0; w2.e.runaway = null; w2.e.hk = null; } }   /* both ready every time: only the rotation decides */
  ok(seq.length >= 6 && !/ss|hh/.test(seq.join('')), 'a rider in reach of both gets SEND and THE HOOK in turn, never one starving the other: ' + seq.join('')); }
/* ---- PHASE TWO SENDS TWO: the second never starts on top of a rider who has reached the mouth, and a jam stops it being sent */
{ const w = world(); w.run(0.3); w.e.qMark = -1e9; w.e.phase = 2; w.e.hp = w.e.maxHp * 0.4; w.e.revCd = 99; w.e.hookCd = 99; w.e.leverCd = 99; w.ride = { h: 0, dist: 200 }; w.e.cd = 0;
  w.run(WINCH.tell.send + 0.1); ok(w.e.runaway && w.e.runaway.next, 'phase two: a SEND lets go two buckets, the second half a second behind');
  w.run(0.8); w.ride = { h: 0, dist: 20 }; const n0 = w.log.length; w.run(2.6);   /* the first has passed the rider; now he is at the mouth */   /* the second waits for the first to reach the far end, then half a second */
  ok(!w.log.slice(n0).some(q => q[0] === "hit" && q[1] === "A LOADED BUCKET") && !w.e.runaway, 'and a rider who has reached the mouth by then is not sent the second one on top of them');
  const w2 = world(); w2.run(0.3); w2.e.qMark = -1e9; w2.e.phase = 2; w2.e.hp = w2.e.maxHp * 0.4; w2.e.revCd = 99; w2.e.hookCd = 99; w2.e.leverCd = 99; w2.ride = { h: 0, dist: 200 }; w2.e.cd = 0;
  w2.run(WINCH.tell.send + 0.1); winchJam(w2.e, w2.c); let second = false; for (let r = w2.e.runaway; r; r = r.next) if (r.delay > 0) second = true;
  ok(!second, 'and a jam stops the second going at all: a jammed drum lets nothing go'); }
/* ---- A TELL YOU CANNOT SEE IS NOT TOLD (A1): off the hero's screen he begins nothing - not even at a rider at his drum */
{ const w = world({ unseen: true }); w.run(0.3); w.ride = { h: 0, dist: 100 }; w.e.cd = 0; w.run(20);
  ok(![...w.modes].some(m => m.endsWith('Tell')) && !w.e.runaway && !w.e.hk, "off the hero's screen he begins no tell at all, even with a rider coming at his drum (the page measured 96% of his sends begun off screen)"); }
/* ---- THE OPENING IS CAUSED (A11) */
{ const w = world(); w.c.P.x = 478 * TS; let opened = false; for (let t = 0; t < 60 * 60; t++) { w.step(); if (winchOpen(w.e)) opened = true; } done(w);
  ok(!opened && w.e.at === 0, 'THE OPENING IS CAUSED: a minute of him left alone, sending and hooking, and he never once goes down or leaves his drum'); }
/* ---- THE JAM AND THE CIRCUIT: A -> B -> C -> A, and each time the line into the next housing is driven into it */
{ const w = world(); w.run(0.3);
  ok(winchTake(w.e) === 1 && !winchOpen(w.e), 'on a housing he takes blows as they come (and no jump reaches him)');
  const order = [];
  for (let k = 0; k < 3; k++) { const at0 = w.e.at, q = w.H[at0];
    ok(winchJam(w.e, w.c), `THE OPENING at ${q.name}: a loaded bucket ridden into his drum jams it`);
    w.run(WINCH.thrownT + 0.05); ok(w.e.mode === 'downed' && Math.abs(w.e.y - q.ledgeY) < 1 && Math.abs(w.e.x - q.ledgeX) < 1, 'he goes off the housing onto its ledge, DOWNED');
    ok(winchTake(w.e) === 2 && winchOpen(w.e) && !winchJam(w.e, w.c), 'and takes double while he is down (a second jam does nothing)');
    w.run(WINCH.downT + WINCH.tell.letgo + WINCH.swingT / 2); const nx = w.H[(at0 + 1) % 3].homeX, mid = (w.e.x - q.ledgeX) * (nx - q.ledgeX);
    ok(w.e.mode === 'swing' && mid > 0 && Math.abs(w.e.x - q.ledgeX) < Math.abs(nx - q.ledgeX), 'half way through the swing he is on the cable between the ledge and the next housing');
    w.run(WINCH.swingT / 2 + 0.1); done(w);
    const n = w.H[w.e.at]; order.push(n.id);
    ok(w.e.mode === 'stalk' && w.e.at === (at0 + 1) % 3 && Math.abs(w.e.y - n.topY) < 1, `then he takes the cable and swings on to ${n.name}`);
    ok(n.ln.dir === n.sense, `and drives the ${n.ln.id} line INTO it`); }
  ok(order.join('') === 'BCA', 'the circuit is A -> B -> C -> A: ' + order.join(' -> '));
  ok(w.H[1].ln.dir === w.H[1].sense, 'and back on the Great Drum, the high line has been turned round from the Tail Wheel toward the Head Frame, where he goes next'); }
/* ---- ROUND TWO: UP ON HIS HOUSING. The brake bar sweeps its top (a shield turns it; unshielded, it throws you off toward the
   gorge), and the hook yanks you off its EDGE, toward the drop - not toward him */
{ const put = w => { w.upOn = 0; w.c.P.x = w.H[0].homeX - 40; w.c.P.y = w.H[0].topY; };
  const w = world({ block: true }); w.run(0.3); put(w); w.e.cd = 0; w.e.hookCd = 9; w.run(1.2);
  ok(w.modes.has('leverTell') && w.log.some(q => q[0] === 'hit' && q[1] === 'THE BRAKE BAR' && q[3] === false) && !w.log.some(q => q[0] === 'shove'), 'up on his housing: he comes at you and brings THE BRAKE BAR round, and a shield turns it');
  const w2 = world(); w2.run(0.3); put(w2); w2.e.cd = 0; w2.e.hookCd = 9; w2.run(1.2); done(w2);
  ok(w2.log.some(q => q[0] === 'shove'), 'unshielded, it throws you off his housing');
  const w3 = world(); w3.run(0.3); put(w3); w3.c.P.x = w3.H[0].px0 + 6; w3.e.x = w3.H[0].px1 - 12;   /* he is east of you, the gorge is west: the drag goes WEST, away from him */ w3.e.cd = 0; w3.e.leverCd = 99; w3.e.sendCd = 99; w3.run(WINCH.tell.hook + 1.0);
  ok(w3.log.some(q => q[0] === 'drag' && q[1] === w3.H[0].away), 'and THE HOOK drags you off its edge, toward the gorge (' + (w3.H[0].away > 0 ? 'east' : 'west') + ')');
  const w4 = world(); w4.run(0.3); put(w4); w4.c.P.x = w4.e.x - 30; w4.e.cd = 0; w4.e.leverCd = 99; w4.e.sendCd = 99; w4.run(3);
  ok(!w4.modes.has('hookTell'), "but never from arm's length: inside the bar's reach a hook would be on you before it could be read"); }
/* ---- A CLIMBER IS LEFT TO CLIMB: on a ladder in reach of his hook and on his line, he neither hooks nor sends at you */
{ const w = world(); w.run(0.3); w.climbing = true; w.c.P.x = w.H[0].drumX + 20; w.c.P.y = w.H[0].mouthY + 40; w.e.cd = 0; w.e.leverCd = 99; w.run(8);
  ok(!w.modes.has('hookTell') && !w.modes.has('sendTell'), 'a hero climbing a ladder up to him is neither hooked nor sent a bucket: the climb is the crossing');
  w.climbing = false; w.run(6); ok(w.modes.has('hookTell'), 'and the moment he is off it, the hook comes'); }
/* ---- ROUND TWO: HE RETREATS. A quarter of his health lost on a housing and he takes the cable to the next, told; less, and he stays */
{ const w = world(); w.run(0.3); w.e.hp = w.e.maxHp * (1 - WINCH.retreat + 0.03); w.run(3); ok(w.e.at === 0, `${Math.round((WINCH.retreat - 0.03) * 100)}% of his health gone on the Great Drum: he stays on it`);
  w.e.hp = w.e.maxHp * (1 - WINCH.retreat - 0.01); w.run(WINCH.tell.letgo + WINCH.swingT + 0.2); done(w);
  ok(w.e.at === 1 && w.log.some(q => q[0] === 'say' && /RETREATS/.test(q[1])), `a quarter gone: HE RETREATS - takes the cable, told, and swings on to ${w.H[1].name}`);
  const mark = w.e.hp; w.e.hp = mark - w.e.maxHp * (WINCH.retreat + 0.01); w.run(WINCH.tell.letgo + WINCH.swingT + 0.2);
  ok(w.e.at === 2, 'and the next quarter is counted from where he landed: another quarter, and he is on to ' + w.H[w.e.at].name);
  const n = Math.round(1 / WINCH.retreat) - 1; ok(n >= 3 && n <= 4, `so over a whole fight he retreats ${n} times (Daniel: "3-4 times")`); }
/* ---- ROUND TWO: THE DRUMS SHAKE ROCK LOOSE, told: every rockEvery s a rock over where you stand, told rockTell before it falls; and
   a roof with nowhere on your screen to drop one waits (rockSpot answers null) */
{ const w = world(); w.run(0.3); w.e.revCd = w.e.sendCd = w.e.hookCd = w.e.leverCd = 999; const t0 = [], leads = []; let told = null, n = 0;
  for (let t = 0; t < 30 * 60; t++) { w.step(); if (w.e.rocks && w.e.rocks.length && told === null) told = t; const m = w.log.filter(q => q[0] === 'rock').length; if (m > n) { n = m; t0.push(t); leads.push(told === null ? 0 : (t - told) / 60); told = null; } }
  ok(leads.length && leads.every(l => l >= WINCH.rockTell - 0.02), `every rock that falls is told first: ${leads.map(l => l.toFixed(2) + ' s').join(', ')} of dust and a ring before it drops`);
  const gaps = t0.slice(1).map((t, i) => (t - t0[i]) / 60);
  ok(n >= 3 && gaps.every(g => Math.abs(g - WINCH.rockEvery) < 0.2), `phase one: ${n} rocks in 30 s, one every ${WINCH.rockEvery} s (${gaps.map(g => g.toFixed(1)).join(', ')})`);
  const w2 = world({ noRoof: true }); w2.run(20); ok(!w2.log.some(q => q[0] === 'rock'), 'with nowhere on the screen for one to land, the roof waits'); }
/* ---- A10: PHASE TWO CHANGES SOMETHING YOU CAN NAME (round three): "at half health he will not stay on one housing - he crouches and
   leaps to another, told by a red ring where he will land - while every line runs a quarter faster, he lets two buckets go at a
   time, and the drums shake rock off the roof twice as often". The leap is proved in ROUND THREE below; the drums here */
{ const w = world(); w.run(0.3); w.e.revCd = w.e.sendCd = w.e.hookCd = w.e.leverCd = 999; w.e.qMark = -1e9; w.e.hp = w.e.maxHp * 0.45; w.run(0.1);
  ok(w.e.phase === 2 && w.log.some(q => q[0] === 'say' && /HE LEAPS DRUM TO DRUM/.test(q[1])), 'PHASE TWO, said over him: ENRAGED, HE LEAPS DRUM TO DRUM');
  const t0 = []; let n = 0; for (let t = 0; t < 20 * 60; t++) { w.step(); const m = w.log.filter(q => q[0] === 'rock').length; if (m > n) { n = m; t0.push(t); } }
  const gaps = t0.slice(1).map((t, i) => (t - t0[i]) / 60);
  ok(gaps.length >= 3 && gaps.every(g => Math.abs(g - WINCH.rockEveryP2) < 0.2) && WINCH.rockEveryP2 * 2 === WINCH.rockEvery, `the roof comes down twice as often (every ${WINCH.rockEveryP2} s: ${gaps.map(g => g.toFixed(1)).join(', ')})`);
  ok(w.log.some(q => q[0] === 'drive' && q[2] === 1 && Math.abs(q[3] - WINCH.p2Mul) < 1e-9), `and every line he drives runs ${WINCH.p2Mul}x as fast (the two buckets a SEND are checked above)`); }
/* ---- ROUND THREE, A10: ENRAGED HE LEAPS - told (the crouch, HE CROUCHES TO LEAP, a ring on the housing he will land on), to the
   housing you are up on, and the landing hurts you there; in phase one he never leaps */
{ const w = world(); w.run(0.3); w.e.revCd = w.e.sendCd = w.e.hookCd = w.e.leverCd = 999; w.run(30); done(w); ok(!w.modes.has('leapTell') && w.e.at === 0, 'phase one: thirty seconds on the Great Drum and not one leap');
  const w2 = world(); w2.run(0.3); w2.e.revCd = w2.e.sendCd = w2.e.hookCd = w2.e.leverCd = 999; w2.e.qMark = -1e9; w2.e.hp = w2.e.maxHp * 0.45; w2.upOn = 2; w2.c.P.x = w2.H[2].homeX + 4; w2.c.P.y = w2.H[2].topY;
  let t0 = null, tl = null, ring = false; for (let t = 0; t < (WINCH.leapEvery + 3) * 60; t++) { w2.step(); if (w2.e.mode === 'leapTell' && t0 === null) t0 = t; if (w2.e.mode === 'leapTell' && w2.e.leapTo === 2) ring = true; if (w2.e.mode === 'leap' && tl === null) tl = t; if (tl !== null && w2.e.mode !== 'leap') break; }
  done(w2);
  ok(t0 !== null && tl !== null && (tl - t0) / 60 >= WINCH.tell.leap - 0.02 && ring, `phase two: he crouches ${((tl - t0) / 60).toFixed(2)} s with the ring on the Tail Wheel (where you are), then leaps`);
  ok(w2.e.at === 2 && w2.log.some(q => q[0] === 'hit' && q[1] === 'HIS LANDING' && q[3] === true), 'and lands on the Tail Wheel, and the landing hurts you there (no shield turns it)');
  const w3 = world(); w3.run(0.3); w3.e.qMark = -1e9; w3.e.hp = w3.e.maxHp * 0.45; w3.e.leapCd = 0; w3.e.cd = 0; w3.c.P.x = 9999; w3.run(0.1); ok(w3.e.mode === 'leapTell' && w3.e.leapTo === 1, 'with you on no housing, he leaps on to the next one'); }
/* ---- NO LEDGE IS A DEAD END: the low line runs into the Great Drum only while he is on it, and back to the deck otherwise */
{ const w = world(); w.run(0.3); ok(w.H[0].ln.dir === 1, 'on the Great Drum the low line runs into it');
  w.e.hp = w.e.qMark - w.e.maxHp * (WINCH.retreat + 0.01); w.run(WINCH.tell.letgo + WINCH.swingT + 0.3); ok(w.e.at === 1 && w.H[0].ln.dir === -1, "on the Head Frame it runs back to the deck: a hero on the Great Drum's ledge rides home");
  w.e.hp = w.e.qMark - w.e.maxHp * (WINCH.retreat + 0.01); w.run(WINCH.tell.letgo + WINCH.swingT + 0.3); ok(w.e.at === 2 && w.H[0].ln.dir === -1, "and on the Tail Wheel, bound for the Great Drum next, it STILL runs back: the Great Drum's ledge is never a wait with no way off but the spikes");
  w.e.hp = w.e.qMark - w.e.maxHp * (WINCH.retreat + 0.01); w.run(WINCH.tell.letgo + WINCH.swingT + 0.3); ok(w.e.at === 0 && w.H[0].ln.dir === 1, 'and back on the Great Drum it runs in again'); }
/* ---- A12: THE ROOM SUPPLIES WHAT THE ATTACKS ASSUME, read off the room and not off this file's hopes */
{ const H = world().H;
  ok(H.every(q => Math.abs(q.mouthY - q.ledgeY) < 1), 'THE BRAKE BAR lands at the drum\'s mouth, and every mouth has its ledge at the line\'s own height: there is somewhere to be barred and somewhere to shield it');
  ok(H.every(q => q.ln.len > WINCH.revRange + 40), 'REVERSE is thrown inside ' + WINCH.revRange + ' px, and every line is longer than that: there is a ride to reverse');
  /* THE OPENING MUST OUTLAST THE REVERSE: from wherever a reverse leaves you, waiting for a skip and riding in again takes less than
     what is left of its cooldown - in both phases (A11: an opening the brake always closes is no opening) */
  for (const [ph, cd, mul] of [[1, WINCH.revCd, 1], [2, WINCH.revCdP2, WINCH.p2Mul]]) for (const q of H) { const v = q.ln.speed * mul, back = Math.min(q.ln.len, WINCH.revRange + WINCH.revT * WINCH.revMul * v);
    const need = back / v + q.ln.gap / v; ok(need < cd - WINCH.revT, `phase ${ph}, ${q.name}: after a reverse, ${need.toFixed(1)} s to ride back in against ${(cd - WINCH.revT).toFixed(1)} s of cooldown left`); }
  const reachHook = q => { const hx = q.homeX, hy = q.topY - 26; let n = 0; for (let x = q.ln.pts[0][0]; x <= q.ln.pts[q.ln.pts.length - 1][0]; x += 8) if (Math.hypot(x - hx, lineYAt(q.ln, x) - 9 - hy) < WINCH.hookR * 0.9) n++; return n; };
  ok(H.every(q => reachHook(q) > 4), 'THE HOOK: from every housing, some of the line into it is inside the chain\'s reach - ' + H.map(q => q.id + ' ' + reachHook(q)).join(', '));
  ok(H.every(q => q.ln.len > WINCH.sendR * 4), 'SEND: every line is long enough to send a bucket down, and there is air over all of it to be in'); }
/* ---- A1/A2/A3/A8, read off the files */
{ const wsrc = readFileSync(new URL('../src/winchmaster.js', import.meta.url), 'utf8'), msrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const { BY_HAND, MARK } = await import('../src/marks.js');
  const tells = [...new Set([...wsrc.matchAll(/begin\(e, '([a-z]+)'|can\.push\('([a-z]+)'\)/g)].map(m => (m[1] || m[2]) + 'Tell'))].sort();
  ok(tells.join() === 'hookTell,leapTell,leverTell,reverseTell,sendTell', 'A1: FIVE TOLD ATTACKS (the leap is phase two\'s), each a named Tell with its own say: ' + tells.join(', '));
  ok(tells.every(t => ('winchmaster|' + t) in BY_HAND) && !Object.keys(BY_HAND).some(k => k.startsWith('winchmaster|') && !tells.includes(k.split('|')[1])), 'and every one has a mark row (and there is no row for an attack he no longer has)');
  ok(BY_HAND['winchmaster|leverTell'] === '!' && ['sendTell', 'hookTell', 'leapTell'].every(t => BY_HAND['winchmaster|' + t] === '!!') && BY_HAND['winchmaster|reverseTell'] === '', 'exactly one blow a shield turns (the brake bar, yellow), two it does not (red), and a quiet reverse');
  ok(!MARK || !('winchmaster|cutTell' in MARK), 'the mark table the screen reads no longer shows a cut he does not make');
  ok(/e\.t === 'winchmaster' && typeof e\.mode === 'string' && e\.mode\.endsWith\('Tell'\)/.test(msrc), 'A2: every Tell of his is in windingUp(), so every windup is heard off screen');
  const frames = ['leapTell', 'leap', 'stalk', 'leverTell', 'lever', 'reverseTell', 'reverse', 'sendTell', 'send', 'hookTell', 'hook', 'thrown', 'downed', 'letgo', 'swing', 'sleep', 'wake'];
  ok(frames.every(m => winchFrame({ mode: m }) >= 0 && winchFrame({ mode: m }) <= 12), 'the frame table answers every mode from his 13-frame sheet (0-12)');
  const need = ['hookTell', 'hook', 'leverTell', 'lever', 'sendTell', 'send', 'reverseTell', 'reverse', 'thrown', 'downed', 'letgo', 'swing'];
  const never = need.filter(m => !EVERY.has(m));
  ok(!never.length, 'A3: EVERY ATTACK FORCED AND FIRED in the scenarios above' + (never.length ? ' - NEVER ' + never.join(', ') : ''));
  const wiring = { EHP: /winchmaster:WINCH\.hp/, DMG: /winchSend:WINCH\.dmg\.send/, COLS: /winchmaster:\['#/, spawn: /case 'winchmaster':/, update: /updateWinchBoss\(e, dt\)/, frame: /frame = winchFrame\(e\)/,
    death: /e\.t === 'winchmaster' \|\| e\.t === 'gargoyle'/, bestiary: /t: 'winchmaster', name: 'THE WINCHMASTER'/, bossBar: /winchmaster:'THE WINCHMASTER'/, felled: /winchmaster: 'THE ROAD STOPS RUNNING'/, open: /e\.t === 'winchmaster' \? winchOpen\(e\)/, poise: /POISE_SKIP = new Set\(\['winchmaster'/ };
  const miss = Object.entries(wiring).filter(([, re]) => !re.test(msrc)).map(([k]) => k);
  ok(!miss.length, 'A8: his wiring in main.js is all there (' + Object.keys(wiring).join(', ') + ')' + (miss.length ? ' - MISSING ' + miss.join(', ') : '')); }
console.log(fails ? `\n${fails} ore road check(s) FAILED` : '\nall ore road checks pass');
process.exit(fails ? 1 : 0);
