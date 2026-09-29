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
import * as WM from '../src/winchmaster.js';
const { WINCH, updateWinchmaster, winchJam, winchTake, winchOpen, winchFrame } = WM;

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
  ok(new Set(S.map(q => q[2])).size === 5 && new Set(S.map(q => q[3])).size === 4 && worst < 0.2, `varied, not one stamp: five ores and four seam shapes in ${combos.size} pairings, the commonest ${Math.round(worst * 100)}% of them`);
  ok(S.some(q => q[4]) && S.filter(q => q[4]).length < S.length / 2, `${S.filter(q => q[4]).length} of them glint`);
  const why = M.map(it => [it, mineBlocked(L, T, it)]).filter(([, r]) => r);
  ok(M.filter(q => !q.set).length >= 15 && !why.length, `${M.filter(q => !q.set).length} heaps, spills and carts of ore on the floors, every one on footing and clear of every hazard and every tell` + (why.length ? ' - NOT ' + why.map(([it, r]) => it.k + '@' + it.x + ',' + it.y + ': ' + r).join('; ') : ''));
  ok(new Set(M.filter(q => q.k === 'heap').map(q => q.size)).size === 3 && M.some(q => q.k === 'cart' && q.load > 0) && new Set(M.filter(q => !q.set).map(q => q.ore)).size === 5, 'heaps of all three sizes, a cart full of ore, and all five ores on the floors'); }

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
  ok(pit && pit.x0 === B.ladder[0] && pit.x1 >= AR.house[0] - 1 && [...Array(pit.x1 - pit.x0 + 1).keys()].every(k => at(pit.x0 + k, pit.floor) === T.AIR), 'the drum house\'s floor is the pit, like every span\'s, from the Head Frame\'s ladder (the deck under the Head Frame is the only floor) to the Great Drum: spikes, turbines, a recovery ledge and a ladder home');
  ok(footing(at(B.ladder[0] - 1, AR.deck + 1)) && at(B.ladder[0] - 1, AR.deck) === T.AIR && B.ladder[1] <= AR.deck && B.ladder[2] >= AR.deck, 'the entrance deck runs to the Head Frame\'s ladder, and the ladder passes it: step off the deck onto it');
  ok(AR.ropes.length === 0 && [...Array(AR.house[0] - B.ladder[0]).keys()].every(k => at(B.ladder[0] + k, AR.spoil + 1) !== T.SOLID), 'and there is no spoil floor left to walk on (and no ropes up out of it)'); }

/* ---- ROUND FIVE (Daniel's playtest, 2026-09-28, decided): "THE PLATFORMS YOU FIGHT THE BOSS ON ARE TOO CLOSE TO THE CEILING AND TOO
   NARROW, WHICH MAKES AVOIDING HIS ATTACKS ARTIFICIALLY DIFFICULT." Every place he is fought - his three housings, their three
   ledges and the entrance deck - keeps FULL JUMP HEADROOM: the tallest real jump (4.5 tiles) with the hero drawn on top of it
   (1.5) never meets rock, the drawn ceiling (L.ceil: the cavern's check above exempts a ceiling that has run out at row 0, which
   is exactly how the old room hid 4 rows) or the top of the level - MIN_HEAD rows, with a tile to spare. A housing's surface is
   also below the camera's own foot line, so standing up there never pins the view to the top of the level. And each is WIDE
   enough to dodge on: a housing is MIN_HOUSING tiles (his leap hurts leapHit px round his landing and his brake bar lands
   leverHit px from him: 8 tiles leaves a stride clear of both beside him), a ledge MIN_LEDGE */
{ const MIN_HEAD = 7, MIN_HOUSING = 8, MIN_LEDGE = 3, msrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const foot = +((msrc.match(/const CAM_FOOT = ([\d.]+)/) || [])[1]), vh = +((msrc.match(/let VW = \d+, VH = (\d+)/) || [])[1]);
  const head = (x0, x1, r) => { let m = r + 1; for (let x = x0; x <= x1; x++) { let y = r; while (y >= 0 && !(at(x, y) === T.SOLID || at(x, y) === T.PLANK)) y--;
      m = Math.min(m, r - Math.max(y, L.ceil[x])); } return m; };   /* rows of air over the standing row r, to the first rock, the drawn ceiling or the top */
  const B = AR.housings[1], spots = [...AR.housings.map(h => [h.name, h.x0, h.x1, h.top]), ...AR.housings.map(h => [h.name + "'s ledge", h.ledge[0], h.ledge[1], h.ledgeTop]), ['the entrance deck', AR.x0 - 1, B.ladder[0] - 1, AR.deck]];
  const rows = spots.map(([n, x0, x1, r]) => [n, head(x0, x1, r)]), low = rows.filter(q => q[1] < MIN_HEAD);
  ok(!low.length, `ROUND FIVE: FULL JUMP HEADROOM (${MIN_HEAD}+ tiles) everywhere he is fought - ` + rows.map(q => q[0] + ' ' + q[1]).join(', ') + (low.length ? ' - TOO LOW: ' + low.map(q => q[0]).join(', ') : ''));
  ok(foot > 0 && vh > 0 && AR.housings.every(h => (h.top + 1) * TS >= foot * vh), `and every housing's surface is at least ${Math.round(foot * vh)} px under the top of the level (the camera's foot line): up there the view is never pinned to the top - ` + AR.housings.map(h => h.name + ' ' + (h.top + 1) * TS + ' px').join(', '));
  const narrow = AR.housings.filter(h => h.x1 - h.x0 + 1 < MIN_HOUSING), tight = AR.housings.filter(h => h.ledge[1] - h.ledge[0] + 1 < MIN_LEDGE);
  ok(!narrow.length && !tight.length, `and WIDE ENOUGH TO DODGE ON: every housing ${MIN_HOUSING}+ tiles, every ledge ${MIN_LEDGE}+ - ` + AR.housings.map(h => h.name + ' ' + (h.x1 - h.x0 + 1) + ' (ledge ' + (h.ledge[1] - h.ledge[0] + 1) + ')').join(', '));
  /* and the pilot reads this table: src/lab.js's hands for him once held their own copies of these columns (482, 501, 509), and a
     room edit that moved one stalled a hero in the pilot while every check here stayed green (claude/oreroad3, item 3) */
  const lsrc = readFileSync(new URL('../src/lab.js', import.meta.url), 'utf8'), i0 = lsrc.indexOf("if(boss.t==='winchmaster'){"), hands = i0 < 0 ? '' : lsrc.slice(i0, lsrc.indexOf("if(boss.t==='gargoyle'){", i0));
  const lit = [...hands.matchAll(/(?<![\w.])(4[6-9]\d|5[0-3]\d)(?![\w.])/g)].map(m => m[1]);
  ok(hands.length > 500 && !lit.length && /OR\.ARENA/.test(hands), "src/lab.js's Winchmaster hands read every column off OR.ARENA - no literal arena column of their own" + (lit.length ? ' - found ' + [...new Set(lit)].join(', ') : '')); }
console.log('\nTHE WINCHMASTER');
/* THE STUB WORLD: the room's two drum lines as the level builds them, its three housings in pixels exactly as main.js's
   winchHousings() makes them, a hero moved by hand, and every world call written down */
function world(o = {}) {
  const Cw = makeCableway(cableLines()), log = [], lines = Cw.lines;
  const H = AR.housings.map(Hs => { const ln = lines.find(l => l.id === Hs.line), p = ln.pts, near = Hs.at === 'end' ? p[p.length - 1] : p[0], far = Hs.at === 'end' ? p[0] : p[p.length - 1];
    return { id: Hs.id, name: Hs.name, homeX: Hs.home * TS, topY: (Hs.top + 1) * TS, px0: Hs.x0 * TS, px1: (Hs.x1 + 1) * TS, ledgeX: (Hs.at === 'end' ? Hs.ledge[1] + 0.5 : Hs.ledge[0] + 0.5) * TS, ledgeY: (Hs.ledgeTop + 1) * TS, drumX: near[0], mouthY: near[1], away: Math.sign(far[0] - near[0]) || -1, sense: Hs.at === 'end' ? 1 : -1, ln }; });
  const P = { x: 478 * TS, y: (AR.deck + 1) * TS, dead: false, ground: true, onMover: null, vx: 0, vy: 0 };
  const w = { lines, H, log, P, ride: null };   /* ride: { h, dist } puts the hero on housing h's line, dist px short of its drum */
  const place = () => { if (!w.ride) return; const q = H[w.ride.h]; P.x = q.drumX + q.away * w.ride.dist; P.y = lineYAt(q.ln, P.x); };
  const c = { P, A: { x0: AR.x0 * TS, x1: AR.x1 * TS }, H, rand: () => 0.3,
    hit: (x, d, hard, name) => { log.push(['hit', name, d, hard]); return o.block && !hard ? 'blocked' : 'hit'; }, say: m => log.push(['say', m]), sound: k => log.push(['sound', k]), shake: n => log.push(['shake', n]),
    stall: t => log.push(['stall', t]),
    shove: () => log.push(['shove']), drag: d => log.push(['drag', d]),
    drive: (h, sense, mul) => { H[h].ln.dir = sense * H[h].sense; H[h].ln.mul = mul; log.push(['drive', h, sense, mul]); },
    lineY: (h, x) => lineYAt(H[h].ln, x), crash: () => log.push(['crash']), solidAt: (x, y) => T.SOLID === at(Math.floor(x / TS), Math.floor(y / TS)), pVel: () => [0, 0],
    riding: h => w.ride && w.ride.h === h ? { coming: H[h].ln.dir * H[h].sense > 0 && !(H[h].ln.jam > 0), dist: w.ride.dist, armed: !!w.ride.armed } : null,
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
  ok(winchTake(w.e) === 0.5 && !winchOpen(w.e), 'ROUND FOUR: on a housing, his drum running, a blow on him lands at HALF (and no jump reaches him)');
  const order = [];
  for (let k = 0; k < 3; k++) { const at0 = w.e.at, q = w.H[at0];
    ok(winchJam(w.e, w.c), `THE OPENING at ${q.name}: a loaded bucket ridden into his drum jams it`);
    ok(winchTake(w.e) === 1, 'ROUND FOUR: and the moment the drum jams the half is off - thrown off the housing he takes blows as they come');
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
  const n = Math.round(1 / WINCH.retreat) - 1; ok(n >= 3 && n <= 4 && Math.abs(WINCH.footAt - WINCH.retreat) < 1e-9, `so over a whole fight he moves on ${n} times (Daniel: "3-4 times") - he retreats at three quarters and at half, and at the last quarter (round six) that move is HE COMES DOWN`); }
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
  w.e.qMark = w.e.hp = w.e.maxHp * 0.6;   /* (round six: a third quarter lost for real would bring him DOWN, not round - so the last lap is run from above it) */
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
/* ---- ROUND FOUR (Daniel, 2026-09-28): HALF UNLESS JAMMED, PHASE TWO RUSTS HIS SKIPS, AND HIS ROOM IS LIT */
{ const msrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(WINCH.chipMul === 0.5 && /if \(e\.t === 'winchmaster'\) \{ const k = winchTake\(e\); dmg = Math\.max\(1, Math\.round\(dmg \* k\)\)/.test(msrc), 'HALF DAMAGE UNLESS HIS DRUM IS JAMMED: every blow on him (and burn, through wardedDamage) is scaled by winchTake - half while his drum runs');
  ok(/k < 1 && !\(e\.chipSaid > 0\)[^\n]*THE IRON TAKES HALF: JAM HIS DRUM/.test(msrc), 'and it is TOLD: a halved blow says THE IRON TAKES HALF: JAM HIS DRUM over him (at most every ' + WINCH.chipSay + ' s)');
  const rust = WM.winchRust, e1 = { alive: true, phase: 1 }, e2 = { alive: true, phase: 2 }, idx = [...Array(9).keys()];
  ok(typeof rust === 'function' && idx.every(i => !rust(e1, i)), 'PHASE TWO RUSTS HIS SKIPS: in phase one none of them is rust');
  ok(typeof rust === 'function' && idx.filter(i => rust(e2, i)).join() === '1,4,7' && !rust({ alive: false, phase: 2 }, 1) && !rust(null, 1), 'from half health every third skip of his is (skips 1, 4, 7 - never two together round a loop), and none once he is dead');
  const ub = (msrc.match(/function updateBucket\(m, dt\) \{[^]*?\n\}/) || [''])[0], ret = (ub.match(/if \(!b\.vis\) \{[^]*?return; \}/) || [''])[0];
  ok(/winchRust\(/.test(ret) && (ub.match(/winchRust\(/g) || []).length === 1 && (msrc.match(/winchRust\(/g) || []).length === 1, 'and a skip only turns to rust IN ITS STATION HOUSE (the return, out of sight): one you can board, you saw rusted - never an untold fall');
  const Cw = makeCableway(L.cable), pit = OR.PITS.find(q => q.id === 'drum'), drums = Cw.lines.filter(l => l.drum);
  ok(typeof rust === 'function' && drums.every(l => l.n >= 3 && [...Array(l.n).keys()].some(i => !rust(e2, i))), 'there is always a sound skip coming on both of his lines: ' + (typeof rust === 'function' ? drums.map(l => l.id + ' ' + [...Array(l.n).keys()].filter(i => rust(e2, i)).length + ' of ' + l.n + ' rust').join(', ') : '(no rust rule)'));
  ok(!!pit && drums.every(l => l.pts.every(p => p[0] >= (pit.x0 - 1) * TS && p[0] <= (pit.x1 + 1) * TS)) && OR.PIT_BITE < 1 && /Math\.min\(Math\.round\(P\.maxHp \* OR\.PIT_BITE\), P\.hp - 1\)/.test(msrc), 'a skip that gives way drops you into THE DRUM PIT under both his lines: a fifth of your health and a climb, never your life');
  const rw = world(); rw.run(0.3); rw.e.revCd = rw.e.sendCd = rw.e.hookCd = rw.e.leverCd = 999; rw.e.qMark = -1e9; rw.e.hp = rw.e.maxHp * 0.45; rw.run(2.5);
  ok(rw.log.some(q => q[0] === 'say' && /HIS SKIPS RUST/.test(q[1])), 'and phase two SAYS it over him: HIS SKIPS RUST: THE RED ONES GIVE WAY');
  const Z = (L.darkZones || []).filter(z => z.x1 > AR.x0 * TS);
  ok(Z.length === 1 && Z[0].x0 === AR.x0 * TS && Z[0].x1 >= L.W * TS && Z[0].y0 <= 0 && Z[0].y1 >= L.H * TS && Z[0].dark <= L.dark * 0.6, `HIS ROOM IS LIT: inside the arena's columns the dark eases to ${Z[0] && Z[0].dark} (the cavern is ${L.dark})`);
  ok((L.darkZones || []).every(z => z.x0 >= AR.x0 * TS), 'and only his room: no zone reaches back into the level before the arena');
  ok(AR.housings.every(Hs => L.ents.some(e => e.t === 'minerlamp' && e.lit && e.y === Hs.top && e.x >= Hs.x0 && e.x <= Hs.x1)), 'a lit lamp stands on every housing: ' + AR.housings.map(Hs => Hs.name).join(', ')); }
/* ---- ROUND SIX (Daniel, 2026-09-29, decided; claude/winch4): 1. A CLEARER JAM - the fight's one rule made obvious */
const recG = () => { const calls = []; let fs = ''; const g = { calls, set fillStyle(v) { fs = v; }, get fillStyle() { return fs; }, globalAlpha: 1, fillRect: (x, y, w, h) => calls.push([fs, x, y, w, h]), drawImage: () => calls.push(['img']), beginPath() {}, arc() {}, fill() {} }; return g; };
{ const live = WM.winchLive, e = { t: 'winchmaster', alive: true, at: 0, phase: 1, mode: 'stalk' }, sk = { ore: true, cracked: false, fallen: 0 };
  ok(typeof live === 'function' && live(e, 0, sk) && live({ ...e, phase: 2 }, 0, sk), 'ROUND SIX: A LIVE SKIP - loaded, sound, on a line running into the drum he stands on - is live, in phase one and two');
  ok(typeof live === 'function' && !live(e, 1, sk) && !live(e, 0, { ...sk, cracked: true }) && !live(e, 0, { ...sk, ore: false }) && !live(e, 0, { ...sk, fallen: 3 }) && !live({ ...e, mode: 'downed' }, 0, sk) && !live({ ...e, phase: 3 }, 0, sk) && !live(null, 0, sk) && !live({ ...e, alive: false }, 0, sk),
    'and a dead one is not: bound for another housing, rusted, emptied, falling, his drum already jammed, him off his drums (phase three), or him dead');
  const { drawBucket } = await import('../src/ore-road.js'), m = { vis: true, x: 100, y: 100, w: OR.BUCKET.w, ore: true, lift: 0, i: 2 };
  const gl = recG(); drawBucket(gl, { ...m, live: true }, 0, 0, 1.3); const gd = recG(); drawBucket(gd, { ...m, live: false }, 0, 0, 1.3);
  const glow = q => q.calls.filter(c => c[0] === '#ff9a3c' || c[0] === '#fff6c8').length;
  ok(glow(gl) >= 4 && glow(gd) === 0, `A LIVE SKIP GLOWS: drawn live it burns (${glow(gl)} rects of ember and white-hot over its ore), drawn dead it has none (${glow(gd)})`);
  const msrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), ub = (msrc.match(/function updateBucket\(m, dt\) \{[^]*?\n\}/) || [''])[0];
  ok(/m\.live = !!ln\.drum && winchLive\(boss && boss\.t === 'winchmaster' && bossActive \? boss : null, winchInto\(ln\), m\)/.test(ub), "and main.js's updateBucket sets it off winchLive every frame, for every skip on his two lines");
  /* THE RUMBLE, and THE JAM TOLD */
  const r1 = world(); r1.run(0.3); r1.e.revCd = r1.e.sendCd = r1.e.hookCd = r1.e.leverCd = 999; r1.ride = { h: 0, dist: 300, armed: true }; const n0 = r1.log.length; r1.run(1.0);
  const rum = r1.log.slice(n0).filter(q => q[0] === 'sound' && q[1] === 'rumble').length;
  const r2 = world(); r2.run(0.3); r2.e.revCd = r2.e.sendCd = r2.e.hookCd = r2.e.leverCd = 999; r2.ride = { h: 0, dist: 300, armed: false }; const n2 = r2.log.length; r2.run(1.0);
  ok(rum >= 2 && !r2.log.slice(n2).some(q => q[0] === 'sound' && q[1] === 'rumble'), `A RIDE THAT WILL JAM HIM RUMBLES (${rum} times in a second); a skip boarded too near the drum to jam it does not`);
  const j1 = world(); j1.run(0.3); j1.e.revCd = j1.e.sendCd = j1.e.hookCd = j1.e.leverCd = 999; j1.ride = { h: 0, dist: WINCH.jamWarn + 30, armed: true }; j1.run(0.3); const far = !!j1.e.jamWarn;
  j1.ride.dist = WINCH.jamWarn - 20; j1.run(0.5); const said = j1.log.filter(q => q[0] === 'say' && /WILL JAM HIS DRUM/.test(q[1])).length;
  const g2 = recG(); WM.drawWinchFx(g2, j1.e, j1.c, 0, 0, 0.05); const chev = g2.calls.filter(c => c[0] === '#ffd36b').length;
  ok(!far && j1.e.jamWarn && said === 1 && chev >= 20, `THE JAM IS TOLD as the ride nears his drum: inside ${WINCH.jamWarn} px it is said once (IT WILL JAM HIS DRUM) and gold chevrons flash on the drum's mouth (${chev} rects) - and not before`);
  const j2 = world(); j2.run(0.3); j2.e.revCd = j2.e.sendCd = j2.e.hookCd = j2.e.leverCd = 999; j2.ride = { h: 0, dist: WINCH.jamWarn - 20, armed: false }; j2.run(0.5);
  ok(!j2.e.jamWarn && !j2.log.some(q => q[0] === 'say' && /WILL JAM/.test(q[1])), 'and a ride that will NOT jam him is never told that it will');
  /* THE CRASH AND THE STALL */
  const c1 = world(); c1.run(0.3); const n1 = c1.log.length; winchJam(c1.e, c1.c); const jl = c1.log.slice(n1);
  ok(jl.some(q => q[0] === 'stall' && q[1] >= 0.1) && jl.some(q => q[0] === 'sound' && q[1] === 'jam') && jl.some(q => q[0] === 'shake' && q[1] >= 8), 'THE JAM CRASHES AND STALLS: the world stops a beat (the hitstop), the drum crashes in its own sound, and the screen shakes hard');
  const g3 = recG(); WM.drawWinchFx(g3, c1.e, c1.c, 0, 0, 0.05); const taut = g3.calls.filter(c => c[0] === '#fff6c8').length;
  let peak = 0; for (let t = 0; t < WINCH.thrownT * 60; t++) { c1.step(); const k = Math.min(1, (t + 1) / 60 / WINCH.thrownT), ly = c1.e.fromY + (c1.e.toY - c1.e.fromY) * k; peak = Math.max(peak, ly - c1.e.y); }
  const g4 = recG(); c1.e.jamT = 0; WM.drawWinchFx(g4, c1.e, c1.c, 0, 0, 0.05);
  ok(taut >= 60 && !g4.calls.some(c => c[0] === '#fff6c8'), `and THE CABLE SNAPS TAUT: the jammed line drawn straight and white-hot, sparking off the drum (${taut} rects), for ${WINCH.jamFx} s`);
  ok(peak >= 30, `and he is FLUNG off the housing, not stepped down: his arc onto the ledge rises ${peak.toFixed(0)} px`);
  ok(/rumble: SFX\.skipRumble, jam: SFX\.drumJam/.test(msrc) && /stall: t => hitstop\(t\)/.test(msrc) && /armed: !!m\.ore && !m\.cracked && \(m\.boardD \?\? 0\) >= WINCH\.rideIn/.test(msrc), "and main.js gives the rumble and the jam their sounds, the stall the game's hitstop, and a ride its 'armed' by updateBucket's own jam rule"); }
/* ---- ROUND SIX, 2. PHASE THREE - HE COMES DOWN (at a quarter of his health), fights on foot among the lines, and the half is off */
const FL = typeof WM.winchFloors === 'function' ? WM.winchFloors() : null;
const p3 = (o = {}) => { const w = world(o); w.run(0.3); w.e.revCd = w.e.sendCd = w.e.hookCd = w.e.leverCd = w.e.leapCd = 999; w.e.qMark = -1e9; w.e.phase = 2; return w; };
const toFoot = w => { w.e.hp = w.e.maxHp * 0.24; w.run(WINCH.tell.descend + WINCH.descendT + 0.1); };
{ const w = p3(); w.c.P.x = 9999; w.e.hp = w.e.maxHp * 0.27; w.run(2); ok(w.e.phase === 2 && w.e.mode !== 'descendTell', 'ROUND SIX: at 27% of his health he is still on his drums');
  w.e.hp = w.e.maxHp * 0.24; w.run(1 / 60); const told = w.e.mode === 'descendTell' && w.log.some(q => q[0] === 'say' && q[1] === 'HE COMES DOWN');
  const g = recG(); WM.drawWinchFx(g, w.e, w.c, 0, 0, 0.05); const ring = g.calls.filter(c => c[0] === '#ff6b6b').length;
  let t0 = 0; while (w.e.mode === 'descendTell' && t0 < 300) { w.step(); t0++; }
  ok(told && ring >= 5 && t0 / 60 >= (WINCH.tell?.descend || 1) - 0.05, `under a quarter HE COMES DOWN, told: said in red, a red ring on the deck where he lands, ${(t0 / 60).toFixed(2)} s before he goes`);
  w.run(WINCH.descendT + 0.1);
  ok(!!FL && w.e.phase === 3 && w.e.mode === 'foot' && Math.abs(w.e.y - FL[0].y) < 1 && w.e.x > FL[0].x0 && w.e.x < FL[0].x1, 'and leaps down onto the entrance deck, on foot' + (FL ? ` (${FL[0].x0 / TS}-${FL[0].x1 / TS} at row ${FL[0].y / TS - 1})` : ''));
  ok(winchTake(w.e) === 1 && !winchJam(w.e, w.c), 'HIS HALF-DAMAGE RULE ENDS: on foot every blow lands whole - and there is no drum to jam');
  ok(w.H[0].ln.dir === -w.H[0].sense && w.H[1].ln.dir === w.H[1].sense, 'the low line runs to the deck he is on (so from the Great Drum\'s ledge you ride to him), and the high line home to the Head Frame (its ladder goes down to the deck)');
  const n0 = w.log.length; w.c.P.x = 9999; w.run(25); ok(!w.log.slice(n0).some(q => q[0] === 'rock') && !w.e.runaway && !w.log.slice(n0).some(q => q[0] === 'say' && /RUST|LEAP/.test(q[1])), 'and it is a clean duel: no roof, no sent buckets, no leaps in phase three');
  const w2 = p3(); w2.c.P.x = 9999; winchJam(w2.e, w2.c); w2.run(WINCH.thrownT + 0.2); w2.e.hp = w2.e.maxHp * 0.2; w2.run(1 / 60);
  ok(w2.e.mode === 'descendTell', 'downed under a quarter, he tears free and comes down (the duel always comes)');
  const w3 = p3(); w3.c.P.x = 9999; winchJam(w3.e, w3.c); w3.e.hp = w3.e.maxHp * 0.2; w3.run(1 / 60); ok(w3.e.mode === 'thrown', 'but never out of the air: thrown, he lands first'); }
{ /* THE HOOK SWUNG (!!, dodge): anyone inside whirlR as it goes round is caught; out of its reach, missed */
  const put = (w, dx) => { w.c.P.x = w.e.x + dx; w.c.P.y = FL[0].y; w.c.P.ground = true; };
  const w = p3(); toFoot(w); w.e.wrenchCd = 999; w.e.cd = 0; put(w, 36); let tell = 0; while (w.e.mode !== 'whirl' && tell < 200) { w.step(); if (w.e.mode === 'whirlTell') tell++; }
  w.run(0.4); ok(tell / 60 >= (WINCH.tell?.whirl || 0.7) - 0.03 && w.log.some(q => q[0] === 'hit' && q[1] === 'THE HOOK, SWUNG' && q[3] === true), `ON FOOT, THE HOOK SWUNG: told ${(tell / 60).toFixed(2)} s (the hook whirling overhead, a red ring at its reach), and it catches a hero inside ${WINCH.whirlR} px - no shield turns it`);
  const w2 = p3(); toFoot(w2); w2.e.wrenchCd = 999; w2.e.cd = 0; put(w2, 36); for (let t = 0; t < 600 && w2.e.mode !== 'whirl'; t++) { w2.step(); if (w2.e.mode === 'whirlTell' && w2.e.modeT < 0.1) put(w2, WINCH.whirlR + 12); }
  w2.run(0.4); ok(!w2.log.some(q => q[0] === 'hit' && q[1] === 'THE HOOK, SWUNG'), 'and misses a hero who stepped out of its reach as it came (the dodge)');
  /* THE WRENCH (!, block): in front of him, a shield turns it, and it bites the planks - the window */
  const w3 = p3({ block: true }); toFoot(w3); w3.e.whirlCd = 999; w3.e.cd = 0; put(w3, 24); w3.run((WINCH.tell?.wrench || 0.5) + 0.3);
  ok(w3.log.some(q => q[0] === 'hit' && q[1] === 'THE WRENCH' && q[3] === false) && !w3.log.some(q => q[0] === 'shove'), 'THE WRENCH: a blow a shield turns (yellow) - shielded, you stand your ground');
  ok(w3.e.mode === 'bitten', `and it BITES THE PLANKS: he hauls it free for ${WINCH.bittenT} s, the duel's window`);
  const w4 = p3(); toFoot(w4); w4.e.whirlCd = 999; w4.e.cd = 0; put(w4, 24); w4.run((WINCH.tell?.wrench || 0.5) + 0.3); ok(w4.log.some(q => q[0] === 'shove'), 'unshielded, it knocks you back');
  /* HE TAKES A SKIP (!!, jump): off his floor, on the other, he rides the low line to you, and the skip takes you at its height */
  const w5 = p3(); toFoot(w5); w5.e.rideCd = 0; w5.e.cd = 0; w5.c.P.x = (FL[1].x0 + FL[1].x1) / 2; w5.c.P.y = FL[1].y; w5.c.P.ground = true; let rt = 0; while (w5.e.mode !== 'ride' && rt < 600) { w5.step(); if (w5.e.mode === 'rideTell') rt++; }
  const rideT = rt / 60; w5.run(3.5);
  ok(rideT >= (WINCH.tell?.ride || 0.8) - 0.03 && w5.log.some(q => q[0] === 'hit' && q[1] === 'HIS SKIP' && q[3] === true), `HE TAKES A SKIP to the floor you are on: told ${rideT.toFixed(2)} s (HE TAKES A SKIP, red dashes down the low line), and it takes you at its height - no shield turns it`);
  ok(w5.e.fl === 1 && Math.abs(w5.e.y - FL[1].y) < 1 && w5.H[0].ln.dir === w5.H[0].sense, "and he steps off onto the Great Drum's ledge, and the low line turns to run there (so from the deck you ride to him)");
  const w6 = p3(); toFoot(w6); w6.e.rideCd = 0; w6.e.cd = 0; w6.c.P.x = (FL[1].x0 + FL[1].x1) / 2; w6.c.P.y = FL[1].y; w6.c.P.ground = true; for (let t = 0; t < 600 && w6.e.mode !== 'ride'; t++) w6.step();
  w6.c.P.y = FL[1].y - 40; w6.c.P.ground = false; w6.run(3.5); ok(!w6.log.some(q => q[0] === 'hit' && q[1] === 'HIS SKIP'), 'and a hero in the air as it passes is missed (the jump)');
  /* NO STUN-LOCKS, NO UNTOLD HITS: stood still beside him for 30 s, every blow comes out of its own full tell, and never two within 1.5 s */
  const w7 = p3(); toFoot(w7); const hits = []; let told = null, tellT = 0, bad = 0;
  for (let t = 0; t < 30 * 60; t++) { put(w7, 20); const m0 = w7.e.mode, n = w7.log.length; w7.step(); if (w7.e.mode.endsWith('Tell')) { if (m0 !== w7.e.mode) { told = w7.e.mode; tellT = 0; } tellT += 1 / 60; }
    for (const q of w7.log.slice(n)) if (q[0] === 'hit') { hits.push(t / 60); const need = WINCH.tell[(told || 'x').replace('Tell', '')] || 9; if (!told || tellT < need - 0.03) bad++; told = null; } }
  const gaps = hits.slice(1).map((t, i) => t - hits[i]);
  ok(hits.length >= 6 && !bad && gaps.every(g => g >= 1.5), `NO STUN-LOCK, NO UNTOLD HIT: 30 s stood beside him on foot, ${hits.length} blows, every one out of its own full tell, the closest two ${gaps.length ? Math.min(...gaps).toFixed(2) : '-'} s apart`);
  const { BY_HAND, ANSWER } = await import('../src/marks.js'), P3 = ['descendTell', 'whirlTell', 'wrenchTell', 'rideTell'];
  ok(BY_HAND['winchmaster|wrenchTell'] === '!' && ['descendTell', 'whirlTell', 'rideTell'].every(t => BY_HAND['winchmaster|' + t] === '!!'), 'the marks: THE WRENCH a yellow ! (the shield turns it), the descent, THE HOOK SWUNG and his skip a red !!');
  const ans = P3.map(t => (ANSWER || {})['winchmaster|' + t]);
  ok(ans.includes('dodge') && ans.includes('block') && ans.every(a => ['block', 'dodge', 'jump', 'duck'].includes(a)), 'and the answer tags: phase three asks for a dodge and a block (' + P3.map((t, i) => t + ' ' + ans[i]).join(', ') + ')'); }
/* ---- A1/A2/A3/A8, read off the files */
{ const wsrc = readFileSync(new URL('../src/winchmaster.js', import.meta.url), 'utf8'), msrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const { BY_HAND, MARK } = await import('../src/marks.js');
  const tells = [...new Set([...wsrc.matchAll(/begin\(e, '([a-z]+)'|can\.push\('([a-z]+)'\)/g)].map(m => (m[1] || m[2]) + 'Tell'))].sort();
  ok(tells.join() === 'descendTell,hookTell,leapTell,leverTell,reverseTell,rideTell,sendTell,whirlTell,wrenchTell', 'A1: NINE TOLD ATTACKS (the leap is phase two\'s; the descent, the hook swung, the wrench and the ride are phase three\'s, round six), each a named Tell with its own say: ' + tells.join(', '));
  ok(tells.every(t => ('winchmaster|' + t) in BY_HAND) && !Object.keys(BY_HAND).some(k => k.startsWith('winchmaster|') && !tells.includes(k.split('|')[1])), 'and every one has a mark row (and there is no row for an attack he no longer has)');
  ok(BY_HAND['winchmaster|leverTell'] === '!' && ['sendTell', 'hookTell', 'leapTell'].every(t => BY_HAND['winchmaster|' + t] === '!!') && BY_HAND['winchmaster|reverseTell'] === '', 'on his drums exactly one blow a shield turns (the brake bar, yellow), the rest it does not (red), and a quiet reverse');
  ok(!MARK || !('winchmaster|cutTell' in MARK), 'the mark table the screen reads no longer shows a cut he does not make');
  ok(/e\.t === 'winchmaster' && typeof e\.mode === 'string' && e\.mode\.endsWith\('Tell'\)/.test(msrc), 'A2: every Tell of his is in windingUp(), so every windup is heard off screen');
  const frames = ['descendTell', 'descend', 'foot', 'whirlTell', 'whirl', 'wrenchTell', 'wrench', 'bitten', 'rideTell', 'ride', 'leapTell', 'leap', 'stalk', 'leverTell', 'lever', 'reverseTell', 'reverse', 'sendTell', 'send', 'hookTell', 'hook', 'thrown', 'downed', 'letgo', 'swing', 'sleep', 'wake'];
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
