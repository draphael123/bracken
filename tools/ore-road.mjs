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
// and then the Winchmaster's four jobs and his one caused opening, unchanged - his rework is stage two.
// usage: node tools/ore-road.mjs
import { LEVELS, T } from '../src/level.js';
import { readFileSync } from 'node:fs';
import { OR, cableLines, makeCableway, stepCableway, bucketAt, pointAt, lineYAt, brakeStep, liftStep } from '../src/ore-road.js';
import { WINCH, updateWinchmaster, winchJam, winchTake, winchOpen, winchFrame } from '../src/winchmaster.js';

let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const TS = 16, lv = LEVELS.find(l => l.id === 'oreroad'), L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const footing = t => t === T.SOLID || t === T.PLANK || t === T.ONEWAY || t === T.NET;
const JUMP = 92 * (2 * 320 / 1000);                              // the running jump, in pixels: 92 px/s for two thirds of a second at world speed
console.log('THE ORE ROAD');
ok(lv.needs === 'storm' && LEVELS.find(l => l.id === 'crown').needs === 'oreroad', 'it sits between Stormhold and Highcrown: it needs Stormhold, and Highcrown needs it');
ok(L.music === 'mineworks' && L.arena.boss === 'winchmaster', "its own theme ('mineworks'), and the Winchmaster in its arena");

/* ---- THE SKIP. Daniel found this one himself and the whole rework stands on it: at 24 px, against a knight
   whose box is 10 to 14, there was no room to swing or to dodge, so NO FIGHT COULD HAPPEN ON A BUCKET AT ALL. */
ok(OR.BUCKET.w >= 44 && OR.BUCKET.w <= 48, `a skip is ${OR.BUCKET.w} px - about three tiles, two bodies wide, and a place a fight can happen (it was 24)`);

/* ---- THE CLOCK, and the hole between two skips. A 46 px skip on the old 88 px spacing leaves 42 px of hole,
   which is a step across and not a jump, so every spacing was reset against the running jump. */
const C = makeCableway(L.cable);
for (const l of C.lines) { const hole = l.gap - OR.BUCKET.w, hop = !l.riders && !l.drum;   /* a line a rider can be asked to step ALONG: the down line carries goblins the other way and the drum line is the boss's */
  ok(hole > 24 && (!hop || hole < JUMP - 4), `the ${l.id} line leaves ${hole} px between skips` + (hop ? `, which is a jump and not a step against a ${Math.round(JUMP)} px running jump` : ' (nobody is asked to hop this one)')); }

/* ---- EVERY LINE ENDS THREE-QUARTERS OF A TILE INSIDE ITS DECK. A line that ended on the deck's edge let the
   bucket go while its rider still straddled the lip, and at speed he went down between them. THE DRUM LINE IS
   EXEMPT and says so: it does not end on a deck at all, it ends AT THE DRUM, and winchC reads that same pixel. */
for (const l of C.lines) {
  const a = l.pts[0], b = l.pts[l.pts.length - 1], row = y => Math.round(y / TS), dir = Math.sign(b[0] - a[0]);
  if (l.drum) { ok(Math.abs(b[0] - OR.ARENA.ledge[0] * TS) < 1, 'the drum line ends AT THE DRUM and not on a deck, which is the one exemption, and winchC reads the same pixel'); continue; }
  const r = row(b[1]); let c = Math.floor(b[0] / TS);
  while (footing(at(dir > 0 ? c - 1 : c + 1, r))) c += dir > 0 ? -1 : 1;
  const inside = dir > 0 ? b[0] - c * TS : (c + 1) * TS - b[0];
  ok(footing(at(Math.floor(b[0] / TS), r)) && inside >= 0.75 * TS - 0.01, `the ${l.id} line sets its rider down ${inside.toFixed(1)} px inside the deck at column ${Math.floor(b[0] / TS)} (three-quarters of a tile is the floor)`);
  const ra = row(a[1]);
  ok(footing(at(Math.floor(a[0] / TS), ra)) || footing(at(Math.floor(a[0] / TS) + (dir > 0 ? -1 : 1), ra)), `and it leaves from a deck at column ${Math.floor(a[0] / TS)}`);
}

/* ---- AND THE RIDER'S BODY NEVER GOES INTO ROCK ON THE WAY THERE. Ending inside the deck is not enough: the first
   span's last stretch sagged two rows, so the skip came up to the sorting tower's rock FROM BELOW, and a rider still
   15 px under the deck's surface was carried flat into the cliff face and shelled off onto its foot, alive and going
   nowhere (ore-ride, 2026-09-23: "at [136,38], end [137,37]"). A one-way plank is walked up through and does not
   count; SOLID does. Checked over the whole line, at both heights a skip rides (loaded, and emptied OR.BUCKET.lift
   higher), with the widest hero's box (14 x 18), so the next sag anyone adds is caught here and not by a night. */
for (const l of C.lines) {
  if (l.drum) continue;
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

/* THE DRUM LINE is the arena's floor into the drum, and the catwalks are over it where he can cut them */
{ const A = OR.ARENA, l = C.lines.find(q => q.drum);
  ok(A.spans.every(([a, b]) => { for (let x = a; x <= b; x++) if (at(x, A.walk + 1) !== T.PLANK) return false; return true; }), 'three catwalks over it, in planks he can cut');
  ok(at(A.house[0], A.housing + 1) === T.SOLID && (A.deck - A.housing) * TS > 51, `his housing is ${(A.deck - A.housing)} rows over the ledge: no jump (51 px) reaches him there`);
  const heap = A.x0 + 5, mid = Math.round((A.x0 + A.ledge[0]) / 2), rope = A.x0 + 6;
  ok([heap, mid, A.ledge[0], A.ledge[1]].every(x => at(x, A.spoil + 1) === T.SOLID) && at(rope, A.walk + 2) === T.NET && at(rope, A.spoil) === T.NET && at(heap, A.deck + 2) !== T.NET,
    'a fall off the drum line lands on the spoil heap, with a rope up to the catwalks (away from the mouth of the line): a fall costs a climb, not a life'); }

console.log('\nTHE WINCHMASTER');
/* a stub world: the drum line as the level has it, a hero we move by hand, and every world call recorded */
function world(o = {}) {
  const A = OR.ARENA, l = makeCableway(cableLines()).lines.find(q => q.drum), log = [];
  const P = { x: (A.x0 + 4) * TS, y: (A.deck + 1) * TS, dead: false, ground: true };
  const spans = A.spans.map(() => true);
  const c = { P, A: { x0: A.x0 * TS, x1: A.x1 * TS, housingY: (A.housing + 1) * TS, deckY: (A.deck + 1) * TS, ledgeX: (A.ledge[0] + 1.5) * TS, homeX: (A.house[0] + 4) * TS, drumX: A.ledge[0] * TS },
    hit: (x, d, hard, name) => { log.push(['hit', name, d, hard]); return o.block && !hard ? 'blocked' : 'hit'; }, say: m => log.push(['say', m]), sound: () => {}, shake: () => {}, shove: () => log.push(['shove']),
    drive: (dir, mul) => { l.dir = dir; l.mul = mul; log.push(['drive', dir]); }, lineY: x => lineYAt(l, x), crash: () => log.push(['crash']),
    cut: k => { spans[k] = false; log.push(['cut', k]); }, spansLeft: () => spans.map((u, k) => u ? k : -1).filter(k => k >= 0), playerSpan: () => o.span === undefined ? null : spans[o.span] ? o.span : spans.findIndex(Boolean), span: k => ({ x0: 0, x1: 10, y: 0 }),
    riding: () => o.riding ? { coming: l.dir > 0 } : null, onLedge: () => !!o.ledge, atLineMouth: () => !!o.mouth };
  const e = { t: 'winchmaster', alive: true, hp: WINCH.hp, maxHp: WINCH.hp, mode: 'stalk', modeT: 0, cd: 0, x: c.A.homeX, y: c.A.housingY, face: -1 };
  return { c, e, l, log, spans, run(sec) { for (let t = 0; t < sec; t += 1 / 60) updateWinchmaster(e, 1 / 60, c); } };
}
{ const w = world({ riding: true }); w.run(0.1); ok(w.e.mode === 'reverseTell', 'a rider coming at the drum: HE THROWS THE BRAKE');
  w.run(0.6); ok(w.l.dir === -1 && w.l.mul > 1, 'and the line runs back, faster'); w.run(WINCH.revT + 0.2); ok(w.l.dir === 1, 'for as long as the reverse holds, and no longer');
  const W2 = world({ riding: true }); W2.e.revCd = 5; W2.run(0.1); ok(W2.e.mode === 'sendTell', 'with the brake still cooling, a rider gets a BUCKET SENT down the line instead'); }
{ const w = world({ riding: true }); w.e.revCd = 9; w.run(0.1 + WINCH.tell.send + 0.05);
  ok(!!w.e.runaway, 'SEND A BUCKET: a loaded one goes down the line');
  w.c.P.x = w.c.A.drumX - 60; w.c.P.y = lineYAt(w.l, w.c.P.x); w.run(0.5);
  ok(w.log.some(q => q[0] === 'hit' && q[1] === 'A LOADED BUCKET' && q[3] === true), 'and it takes a hero at the line\'s height, and no shield turns it');
  const w3 = world({ riding: true }); w3.e.revCd = 9; w3.run(0.1 + WINCH.tell.send + 0.05); w3.c.P.x = w3.c.A.drumX - 60; w3.c.P.y = lineYAt(w3.l, w3.c.P.x) - 40; w3.run(0.5);
  ok(!w3.log.some(q => q[0] === 'hit'), 'a hero in the air over it is missed'); }
{ const w = world({ span: 2 }); w.e.sendCd = 9; w.run(0.1); ok(w.e.mode === 'cutTell' && w.e.arg === 2, 'a hero on a catwalk: HE CUTS THAT SPAN'); w.run(WINCH.tell.cut + 0.1); ok(!w.spans[2], 'and it is gone');
  w.e.cutCd = 0; w.e.cd = 0; w.run(0.2); w.e.cutCd = 0; w.e.cd = 0; w.run(WINCH.tell.cut + 0.3); w.e.cutCd = 0; w.e.cd = 0; w.run(WINCH.tell.cut + 0.3);
  ok(w.spans.filter(Boolean).length === 1, 'but never the last one: ' + w.spans.filter(Boolean).length + ' left'); }
{ const w = world({ ledge: true, block: true }); w.run(0.1); ok(w.e.mode === 'leverTell', 'a hero on his ledge who did not jam the drum gets THE BRAKE LEVER'); w.run(WINCH.tell.lever + 0.1);
  ok(w.log.some(q => q[0] === 'hit' && q[1] === 'THE BRAKE LEVER' && q[3] === false), 'and it is a blow a shield can turn (yellow)'); }
{ const w = world({ span: 0, mouth: true }); let opened = false; for (let t = 0; t < 40 * 60; t++) { updateWinchmaster(w.e, 1 / 60, w.c); if (winchOpen(w.e)) opened = true; }
  ok(!opened, 'THE OPENING IS CAUSED: forty seconds of him left alone, sending and cutting, and he never once goes down'); }
{ const w = world(); w.run(0.2); ok(winchTake(w.e) === 1 && !winchOpen(w.e), 'on the housing he takes blows as they come (and no jump reaches him)');
  ok(winchJam(w.e, w.c), 'THE OPENING: a rider rides a bucket into the drum and it jams');
  w.run(WINCH.thrownT + 0.05); ok(w.e.mode === 'downed' && Math.abs(w.e.y - w.c.A.deckY) < 1 && Math.abs(w.e.x - w.c.A.ledgeX) < 1, 'he goes off the housing onto his own ledge, DOWNED');
  ok(winchTake(w.e) === 2 && winchOpen(w.e), 'and takes double while he is down');
  ok(!winchJam(w.e, w.c), 'a second jam while he is down does nothing');
  w.run(WINCH.downT + WINCH.climbT + 0.1); ok(w.e.mode === 'stalk' && Math.abs(w.e.y - w.c.A.housingY) < 1, `after ${WINCH.downT} s he hauls himself back up onto the housing`); }
{ const modes = ['stalk', 'leverTell', 'lever', 'reverseTell', 'reverse', 'sendTell', 'send', 'cutTell', 'cut', 'thrown', 'downed', 'climb', 'sleep'];
  ok(modes.every(m => winchFrame({ mode: m }) >= 0 && winchFrame({ mode: m }) <= 12), 'the frame table answers every mode (0-12)'); }
console.log(fails ? `\n${fails} ore road check(s) FAILED` : '\nall ore road checks pass');
process.exit(fails ? 1 : 0);
