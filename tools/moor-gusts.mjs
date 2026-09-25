/* tools/moor-gusts.mjs - GALE MOOR'S WIND IS A MECHANIC, NOT SCENERY (docs/briefs/gale-moor-rework.md §3). Node only: no page.

   WHY IT EXISTS. The review (level-review group A §9) found thirteen gust zones on the moor and the wind REQUIRED in four
   places: the mill gust was scenery, two zones overlapped and stacked, a gust's only warning was a half-second blink at the
   screen's edge, and on the ground a gust was nothing at all - the legs' 1000 px/s2 beat its 320. A rule like "the wind is the
   verb" is a wish unless something fails when it stops being true, so this reads the BUILT level and runs main.js's own gust
   code in a VM:

   1. EVERY GUST ON THE MOOR IS TOLD: heard and seen building before it blows.
   2. ONE RHYTHM: every gust that shoves keeps the same beat (period, on), and its build-up leaves still air before it.
   3. A RIDE IS A RIDE: the gap under a carrying gust is wider than any jump and inside the carry, both banks stand, and the
      reach model reaches the far bank WITH the carry - and over thorns NOT without it, so the wind is what crosses it,
      while over the bog it does without it too, so a fall there is a wade and not a wound.
   4. A HEADWIND CROSSING IS HOPS, NOT A WALK: the footing under it is stones or posts two or three wide (room to brace, no
      floor to walk braced across), and ONE of them takes more hops than a still spell holds - that is where you brace.
   5. TAUGHT SAFELY FIRST: the first ride and the first headwind on the moor are over ground that cannot hurt you.
   6. THE RUNTIME: the build-up reads as the coming gust's way; unbraced, a headwind walks a standing hero off in well under a
      second and a tailwind carries a jumping one past any jump's speed; braced, neither moves you. The whistle and the drawing
      are wired where they must be, and the Windcaller's howl is the same shove with a brace that breaks it (the page proof of
      his opening is tools/boss-openings.mjs). */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const TS = 16, JUMP_ACROSS = 6, HOP = 0.8;   /* reachcore's jump; a short hop from stone to stone, landed and set, in seconds (tools/moor-gusts-walk.mjs measures it) */
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), audio = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
const L = LEVELS.find(l => l.id === 'moor').build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const stand = t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK;
const tell = +((main.match(/const GUST_TELL = ([\d.]+)/) || [])[1]);
assert(tell > 0.9, 'main.js declares the told gust\'s build-up (GUST_TELL), and it is long enough to hear: ' + tell);
const out = [];

/* 1. told, every one */
const G = L.gusts || [];
assert(G.length >= 8, 'the moor has its gusts: ' + G.length);
assert.deepEqual(G.filter(z => !z.told).map(z => Math.round(z.x0 / TS)), [], 'every gust on the moor is told');

/* 2. one rhythm */
const shoves = G.filter(z => z.shove && !z.arena);
assert(shoves.length >= 5, 'at least five crossings shove: ' + shoves.length);
const beat = [shoves[0].period, shoves[0].on];
for (const z of shoves) { assert.deepEqual([z.period, z.on], beat, 'every gust that shoves keeps one rhythm; ' + Math.round(z.x0 / TS) + ' is ' + [z.period, z.on]);
  assert(z.period - z.on - tell >= 1.5, 'the build-up leaves still air before it: ' + (z.period - z.on - tell)); }
const still = beat[0] - beat[1];   /* the still spell a crossing can use: the build-up is still air, and it is heard */

/* the footing a hero walks along the bottom band of a zone: [x, row] of the highest standable surface per column (or null) */
const surface = (x, y0, y1) => { for (let y = y0; y <= y1; y++) if (stand(at(x, y)) && !stand(at(x, y - 1)) && at(x, y - 1) !== T.SPIKE) return y; return null; };
const zoneCols = z => { const a = Math.floor(z.x0 / TS), b = Math.ceil(z.x1 / TS) - 1, cols = []; for (let x = a; x <= b; x++) cols.push([x, surface(x, Math.floor(z.y0 / TS), Math.ceil(z.y1 / TS))]); return cols; };
const hazardUnder = z => zoneCols(z).some(([x]) => { for (let y = Math.floor(z.y0 / TS); y <= Math.ceil(z.y1 / TS) + 1; y++) if (at(x, y) === T.SPIKE) return true; return false; });

/* 3. rides */
const rides = shoves.filter(z => z.carry > 0);
assert(rides.length >= 2, 'the moor has rides: ' + rides.length);
const withCarry = floodReach(L, T, { rides: true }), noCarry = floodReach({ ...L, gusts: G.map(z => ({ ...z, carry: 0 })) }, T, { rides: true });
for (const z of rides) {
  const a = Math.floor(z.x0 / TS), b = Math.ceil(z.x1 / TS);   /* the zone spans the gap: its first column is the first tile of air */
  const lip = surface(a - 1, 0, L.H - 1), far = surface(b, 0, L.H - 1); assert(lip !== null && far !== null, 'a ride has a bank at each end: ' + a + '..' + b);
  let gap = 0; for (let x = a; x < b; x++) { const s = surface(x, 0, lip + 1); if (s === null || s > lip) gap++; }
  assert(gap > JUMP_ACROSS && gap <= JUMP_ACROSS + z.carry - 1, 'the ride at ' + a + ' is wider than a jump and inside its carry: ' + gap + ' tiles');
  const k = b + ',' + (far - 1); assert(withCarry.seen.has(k), 'the far bank of the ride at ' + a + ' is reached with the gust (' + k + ')');
  if (hazardUnder(z)) assert(!noCarry.seen.has(k), 'over thorns, it is the gust that reaches the far bank and nothing else (' + k + ')');
  else assert(noCarry.seen.has(k), 'over the bog, a fall is a wade to the far bank, not a wound (' + k + ')');
  out.push('ride ' + a + '-' + (b - 1) + ' (' + gap + ' tiles' + (hazardUnder(z) ? ', thorns' : ', bog') + ')');
}

/* 4. headwinds */
const heads = shoves.filter(z => !z.carry && z.dir < 0);
assert(heads.length >= 3, 'the moor has headwind crossings: ' + heads.length);
let braceNeeded = 0;
for (const z of heads) {
  const pieces = []; let run = null, lip = surface(Math.floor(z.x0 / TS) - 1, 0, L.H - 1);   /* what is under the walk, not the bog floor under the posts: the bank's row and above */
  for (const [x, s0] of zoneCols(z)) { const s = s0 !== null && s0 <= lip ? s0 : null; if (s !== null && !(at(x, s) === T.SOLID && x === Math.ceil(z.x1 / TS) - 1)) { if (run && run.s === s && run.b === x - 1) run.b = x; else pieces.push(run = { a: x, b: x, s }); } else run = null; }
  assert(pieces.length >= 2, 'a headwind crossing is stones or posts: ' + Math.round(z.x0 / TS) + ' has ' + pieces.length);
  for (const p of pieces) assert(p.b - p.a + 1 >= 2 && p.b - p.a + 1 <= 3, 'every stone under a headwind has room to brace and no floor to walk braced: ' + p.a + '-' + p.b);
  const hops = pieces.length + 1, secs = hops * HOP;
  if (secs > still) braceNeeded++;
  out.push('headwind ' + Math.round(z.x0 / TS) + '-' + (Math.ceil(z.x1 / TS) - 1) + ' (' + hops + ' hops, ' + secs.toFixed(1) + ' s against ' + still.toFixed(1) + ' s still' + (hazardUnder(z) ? ', thorns' : ', bog') + ')');
}
assert(braceNeeded >= 1, 'at least one crossing is longer than a still spell, so a stone is braced on: ' + braceNeeded);

/* 5. taught safely first */
const first = list => list.slice().sort((a, b) => a.x0 - b.x0)[0];
assert(!hazardUnder(first(rides)), 'the first ride on the moor is over ground that cannot hurt you');
assert(!hazardUnder(first(heads)), 'the first headwind on the moor is over ground that cannot hurt you');
assert(rides.some(hazardUnder) && heads.some(hazardUnder), 'and later both are asked again over thorns');

/* 6. the runtime, on main.js's own code */
const noop = () => {}, P = { x: 0, y: 0, vx: 0, vy: 0, dead: false, ground: true };
const c = vm.createContext({ L, P, time: 0, keys: {}, jumpPress: false, bossActive: false, callerCalm: () => false, dust: noop, boss: null, SFX: new Proxy({}, { get: () => noop }) });
vm.runInContext(main.slice(main.indexOf('const GUST_TELL'), main.indexOf('function drawToldGust')), c);
const put = (z, dx) => { P.x = z.dir > 0 ? z.x0 + dx : z.x1 - dx; P.y = z.y1 - 2 * TS; };
const run = (secs, air) => { for (let t = 0; t < secs; t += 1 / 60) { P.ground = !air; c.updateMoorWind(1 / 60); P.x += P.vx / 60; c.time += 1 / 60; } };
const H = heads[heads.length - 1], R = rides[rides.length - 1];
/* the build-up says which way the COMING gust blows, and the clock is the one written */
c.time = H.period - (H.phase || 0) - 0.6 + H.period * 4; { const g = vm.runInContext('gustNow', c)(H); assert(!g.on && g.tell > 0 && g.tell < 1 && g.dir === -1, 'the build-up of a headwind: ' + JSON.stringify(g)); }
/* a standing hero, unbraced, in a headwind: walked back off a stone in well under a second */
const onAt = z => { c.time = z.period * 6 - (z.phase || 0) + 0.2; };
onAt(H); put(H, 40); P.vx = 0; c.keys.block = false; const x0 = P.x; run(0.3, false); assert(P.x - x0 < -24 && P.vx < -100, 'unbraced, a headwind walks you back: ' + Math.round(P.x - x0) + ' px, ' + Math.round(P.vx) + ' px/s');
/* braced, it cannot move you */
onAt(H); put(H, 40); P.vx = 0; c.keys.block = true; const x1 = P.x; run(1.0, false); assert(Math.abs(P.x - x1) < 2 && Math.abs(P.vx) <= 40, 'braced, a headwind cannot move you: ' + Math.round(P.x - x1) + ' px'); c.keys.block = false;
/* a jumping hero in a tailwind is carried past any jump's speed (RUN 92, and the sprint's +15%) */
onAt(R); put(R, 8); P.vx = 92; run(0.5, true); assert(P.vx > 180, 'a tailwind carries a jump: ' + Math.round(P.vx) + ' px/s');
/* in the still spell nothing pushes */
c.time = R.period * 6 - (R.phase || 0) + R.on + 0.3; put(R, 8); P.vx = 0; run(0.3, false); assert(Math.abs(P.vx) < 1, 'the still spell is still: ' + P.vx);
/* wired where it must be: the whistle exists and is played for a told gust and his howl; the build-up is drawn over the zone */
assert(/gustRise\(\) \{/.test(audio), 'SFX.gustRise exists');
assert(main.includes('if (soon && !z.rose && near) { z.rose = true; SFX.gustRise(); }'), 'the gust loop plays the build-up whistle');
assert(/function drawMoorWeather\(cx,cy\) \{\s*for \(const z of \(L\.gusts \|\| \[\]\)\) if \(z\.told/.test(main), 'drawMoorWeather draws every told gust\'s build-up');
assert(/boss\.mode === 'howl'[^\n]*!gustShove\(boss\.howlDir, CALLER_SHOVE, dt\)\) boss\.braceT/.test(main.slice(main.indexOf('function updateMoorWind'), main.indexOf('function drawToldGust'))), 'the Windcaller\'s howl shoves as the moor does, in the player\'s own update, and a brace held against it is counted on him');
assert(/HIS WIND FAILS[^\n]*knockCaller\(e\)/.test(main), 'braced through, his howl knocks him down (the page proof is tools/boss-openings.mjs)');
{ const n = +(main.match(/HOWL_LEN = ([\d.]+)/) || [])[1], b = +(main.match(/HOWL_BRACE = ([\d.]+)/) || [])[1]; assert(b > n * 0.5 && b < n, 'the brace must hold most of the howl, not all of it: ' + b + ' of ' + n); }
console.log('moor-gusts  ' + G.length + ' gusts, every one told; ' + shoves.length + ' shove on one beat (' + beat.join('/') + ' s, build-up ' + tell + ' s): ' + out.join('; ') + '.');
