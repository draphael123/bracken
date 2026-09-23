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
import { OR, cableLines, makeCableway, stepCableway, bucketAt, pointAt, lineYAt, brakeStep, liftStep } from '../src/ore-road.js';
import { WINCH, updateWinchmaster, winchJam, winchTake, winchOpen, winchFrame } from '../src/winchmaster.js';

let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const TS = 16, lv = LEVELS.find(l => l.id === 'oreroad'), L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const footing = t => t === T.SOLID || t === T.PLANK || t === T.ONEWAY || t === T.NET;
const JUMP = 92 * (2 * 320 / 1000);                              // the running jump, in pixels: 92 px/s for two thirds of a second at world speed
console.log('THE ORE ROAD');
ok(lv.needs === 'storm' && LEVELS.find(l => l.id === 'crown').needs === 'oreroad', 'it sits between Stormhold and Highcrown: it needs Stormhold, and Highcrown needs it');
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

/* ---- THE DRUM HOUSE (brief section 6): THREE HOUSINGS ON TWO LINES, AND NO JUMP REACHES ANY OF THEM. The old room's reach
   problem was arithmetic, not taste, so this is arithmetic too: a cell a hero can stand on (a tile with air over it, or a skip
   on either drum line, loaded or emptied) reaches a housing if it is no more than 3 rows under it and 4 tiles across (the 51 px
   jump), or above it and 6 across (a fall carries further). Nothing in the room may. */
const AR = OR.ARENA;
{ ok(AR.housings.length === 3 && new Set(AR.housings.map(h => h.id)).size === 3, 'THREE HOUSINGS: ' + AR.housings.map(h => h.name).join(', '));
  const lines = C.lines.filter(l => l.drum);
  ok(lines.length === 2 && AR.housings.every(h => lines.some(l => l.id === h.line)), 'on the room\'s two drum lines, and every housing has its drum on one of them');
  const cells = [];
  for (let x = AR.x0; x < AR.x1; x++) for (let y = 1; y < L.H; y++) if (footing(at(x, y)) && !footing(at(x, y - 1)) && !AR.housings.some(h => x >= h.x0 && x <= h.x1 && y === h.top + 1)) cells.push([x, y - 1, 'tile']);
  ok(/m\.ore && !m\.fallen && rider && keys\.down && !ln\.drum/.test(readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')), "a drum line's skips cannot be tipped, so they never ride high: an emptied one would put a jump onto a housing");
  for (const l of lines) for (let x = l.pts[0][0]; x <= l.pts[l.pts.length - 1][0]; x += 8) for (const lift of [0]) cells.push([Math.floor(x / TS), Math.floor((lineYAt(l, x) - lift - 1) / TS), l.id]);
  for (const h of AR.housings) { const bad = cells.find(([x, r]) => { const dx = x < h.x0 ? h.x0 - x : x > h.x1 ? x - h.x1 : 0; return r >= h.top ? (r - h.top <= 3 && dx <= 4) : dx <= 6; });
    ok(!bad && at(h.x0, h.top + 1) === T.SOLID && at(h.x1, h.top + 1) === T.SOLID, `${h.name} (row ${h.top}, columns ${h.x0}-${h.x1}): no footing in the room reaches it` + (bad ? ` - ${bad[2]} at ${bad[0]},${bad[1]} does` : ''));
    ok(h.ledgeTop - h.top === 4 && at(h.ledge[0], h.ledgeTop + 1) === T.SOLID && at(h.ledge[1], h.ledgeTop + 1) === T.SOLID, `and its ledge (${h.ledge[0]}-${h.ledge[1]}, row ${h.ledgeTop}) is four rows under it: where a jam throws him`);
    const l = lines.find(q => q.id === h.line), end = h.at === 'end' ? l.pts[l.pts.length - 1] : l.pts[0];
    ok(Math.floor(end[0] / TS) >= h.ledge[0] && Math.floor(end[0] / TS) <= h.ledge[1] && Math.abs(end[1] - (h.ledgeTop + 1) * TS) < 1, `and the ${l.id} line's ${h.at} is ON that ledge, at its height: the drum's mouth is where the ride ends`); } }
/* THE WAY ROUND: out of the spoil by rope to the deck (the low line) and to both high ledges (the high line) - and the spoil is
   under the whole room, so every fall off either line costs a climb and never a life (B3) */
{ const [r1, r2, r3] = AR.ropes;
  ok(AR.ropes.every(([x, y0, y1]) => at(x, y0) === T.NET && at(x, y1) === T.NET && at(x, y1 + 1) === T.SOLID), 'three ropes, each standing on the spoil');
  ok(r1[1] === AR.deck + 1 && at(r1[0] - 1, r1[1]) === T.SOLID && at(r1[0] - 1, r1[1] - 1) === T.AIR, 'one to the entrance deck, where the low line starts, its top level with the deck');
  ok([AR.housings[1], AR.housings[2]].every(h => [r2, r3].some(([x, y0]) => y0 === h.ledgeTop + 1 && (x === h.ledge[0] - 1 || x === h.ledge[1] + 1))), 'and one up beside each high ledge, where the high line is boarded, its top level with the ledge');
  let hole = null; for (let x = 481; x < AR.house[0]; x++) if (at(x, AR.spoil + 1) !== T.SOLID) hole = x;
  ok(hole === null, 'the spoil heap runs under the whole room: a fall is a climb, not a death'); }

console.log('\nTHE WINCHMASTER');
/* THE STUB WORLD: the room's two drum lines as the level builds them, its three housings in pixels exactly as main.js's
   winchHousings() makes them, a hero moved by hand, and every world call written down */
function world(o = {}) {
  const Cw = makeCableway(cableLines()), log = [], lines = Cw.lines;
  const H = AR.housings.map(Hs => { const ln = lines.find(l => l.id === Hs.line), p = ln.pts, near = Hs.at === 'end' ? p[p.length - 1] : p[0], far = Hs.at === 'end' ? p[0] : p[p.length - 1];
    return { id: Hs.id, name: Hs.name, homeX: Hs.home * TS, topY: (Hs.top + 1) * TS, ledgeX: (Hs.at === 'end' ? Hs.ledge[1] + 0.5 : Hs.ledge[0] + 0.5) * TS, ledgeY: (Hs.ledgeTop + 1) * TS, drumX: near[0], mouthY: near[1], away: Math.sign(far[0] - near[0]) || -1, sense: Hs.at === 'end' ? 1 : -1, ln }; });
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
    onLine: () => false };
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
/* ---- A10: PHASE TWO CHANGES SOMETHING YOU CAN NAME. Phase one: he stays on a housing until you knock him off it. Phase two:
   he does not wait - he swings on by himself every p2Stay seconds - and every drum he drives runs a quarter faster */
{ const w = world(); w.run(0.3); w.e.hp = w.e.maxHp * 0.6; w.run(40); ok(w.e.at === 0, 'phase one: forty seconds and he is still on the Great Drum');
  w.e.hp = w.e.maxHp * 0.45; w.run(0.1); ok(w.e.phase === 2 && w.log.some(q => q[0] === 'say' && /STAY PUT/.test(q[1])), 'PHASE TWO, said over him: HE WILL NOT STAY PUT');
  w.run(WINCH.p2Stay + WINCH.tell.letgo + WINCH.swingT + 2); done(w); ok(w.e.at !== 0, `and within ${WINCH.p2Stay} s he has left the Great Drum by himself, unjammed (he is on ${w.H[w.e.at].name})`);
  ok(w.log.some(q => q[0] === 'drive' && q[2] === 1 && Math.abs(q[3] - WINCH.p2Mul) < 1e-9), `and drives his lines ${WINCH.p2Mul}x as fast`); }
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
  const tells = [...new Set([...wsrc.matchAll(/begin\(e, '([a-z]+)'/g)].map(m => m[1] + 'Tell'))].sort();
  ok(tells.join() === 'hookTell,leverTell,reverseTell,sendTell', 'A1: FOUR TOLD ATTACKS, each a named Tell with its own say: ' + tells.join(', '));
  ok(tells.every(t => ('winchmaster|' + t) in BY_HAND) && !Object.keys(BY_HAND).some(k => k.startsWith('winchmaster|') && !tells.includes(k.split('|')[1])), 'and every one has a mark row (and there is no row for an attack he no longer has)');
  ok(BY_HAND['winchmaster|leverTell'] === '!' && ['sendTell', 'hookTell'].every(t => BY_HAND['winchmaster|' + t] === '!!') && BY_HAND['winchmaster|reverseTell'] === '', 'exactly one blow a shield turns (the brake bar, yellow), two it does not (red), and a quiet reverse');
  ok(!MARK || !('winchmaster|cutTell' in MARK), 'the mark table the screen reads no longer shows a cut he does not make');
  ok(/e\.t === 'winchmaster' && typeof e\.mode === 'string' && e\.mode\.endsWith\('Tell'\)/.test(msrc), 'A2: every Tell of his is in windingUp(), so every windup is heard off screen');
  const frames = ['stalk', 'leverTell', 'lever', 'reverseTell', 'reverse', 'sendTell', 'send', 'hookTell', 'hook', 'thrown', 'downed', 'letgo', 'swing', 'sleep', 'wake'];
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
