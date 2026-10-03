// tools/redgorge.mjs - THE RED GORGE's own check (claude/redgorge), Node only: no page, a few seconds.
//   - the level is on the road: in LEVELS after THE WELL TOWN (needs 'welltown'), on the desert map, gated by level-quality, one new foe (the raptor)
//   - THE FLOOD NEVER TRAPS A CROSSING: every place to stand in a channel (a bridge's planks over it) is 3 tiles or less from dry footing - the horn's
//     two seconds are a dozen tiles at a run. The two ROPES IN THE CHANNEL (the falls', the narrows') are the deliberate races, and each has a gate over
//     it that holds a flood off it
//   - EVERY MECHANIC IS REQUIRED (a real jump: three rows up, four across, a mantle as the reach model has it): with THE JAM in place the old dam cannot
//     be reached, and washed out it can; without either BASKET the dam cannot be reached; THE OLD NEST's vault holds its silver until it is opened
//   - every gate has a wheel the hero reaches before he needs it, and it sits ABOVE what it holds dry (the falls' rope, the jam, the narrows' rope)
//   - every feather can be got; the old nest can be reached; two checkpoints, the last at the dam's door; the falls' keeper holds his gate
//   - THE GREAT RED CRAB (src/gorge-crab.js, pure): two minutes of him with nothing released never opens him; a burst on him in the channel opens him for
//     3 s or more, and a burst with him out of it does not; every pass of his chain is a new order; in phase two he will not walk into the channel
//     while the gate holds water, and his scuttle still carries him in
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { REDGORGE, BRIDGES } from '../src/red-gorge.js';
import * as GC from '../src/gorge-crab.js';
import { makeGorgeCrabHands } from '../src/gorge-crab-hands.js';
import { GATE } from './level-quality.mjs';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); else console.log('  ok   ' + m); };
const lv = LEVELS.find(l => l.id === 'redgorge'), wi = LEVELS.findIndex(l => l.id === 'welltown');
ok(lv && lv.needs === 'welltown' && LEVELS.indexOf(lv) > wi, 'THE RED GORGE is in LEVELS after THE WELL TOWN, needs welltown');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
ok(/DESERT_NODES\.push\(\{ id: 'redgorge'/.test(main) && /\[170, 136\], \[136, 120\]\]/.test(main), 'it has its node on the desert map, and the road runs to it');
ok(GATE.includes('redgorge'), 'level-quality gates it');
const L = lv.build(), W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
const [C0, C1] = REDGORGE.ch, inCh = x => x >= C0 && x <= C1;

/* THE FLOOD NEVER TRAPS A CROSSING */
const R0 = floodReach(L, T, { rides: true });
let worst = 0, cells = 0;
for (const k of R0.footing) { const [x, y] = k.split(',').map(Number); if (!inCh(x) || y >= REDGORGE.floor - 1 || at(x, y) === T.NET) continue; if (at(x, y + 1) !== T.ONEWAY) continue; cells++;
  let d = 99; for (let xx = 0; xx < W; xx++) if (!inCh(xx) && R0.footing.has(xx + ',' + y)) d = Math.min(d, Math.abs(xx - x)); worst = Math.max(worst, d); }
ok(cells > 0 && worst <= 3, 'every plank to stand on in the channel is ' + worst + ' tiles or less from dry footing (' + cells + ' of them): a crossing caught by the horn can always get off');
const ropes = []; for (let x = C0; x <= C1; x++) { let y0 = null; for (let y = 0; y <= H; y++) { const r = at(x, y) === T.NET; if (r && y0 === null) y0 = y; if (!r && y0 !== null) { ropes.push({ x, y0, y1: y - 1 }); y0 = null; } } }
ok(ropes.length === 2, 'two ropes hang in the channel (the falls\', the narrows\'): the deliberate races ' + JSON.stringify(ropes));
for (const r of ropes) { const g = L.gates.filter(q => q.ch === 'gorge' && q.row < r.y0).sort((a, b) => b.row - a.row)[0];
  ok(g && r.y0 - g.row <= 6, 'the rope in the channel at rows ' + r.y0 + '-' + r.y1 + ' has a gate just over it (' + (g && g.id) + ' at row ' + (g && g.row) + ') that holds a flood off it'); }
ok(BRIDGES.every(y => { for (let x = 3; x <= 44; x++) if (at(x, y) !== T.ONEWAY && !(x >= 17 && x <= 18)) return false; return true; }), 'every section ends on a rope bridge across the gorge (rows ' + BRIDGES.join(', ') + ')');

/* EVERY MECHANIC IS REQUIRED: a real jump, the rides on */
const real = { rides: true, maxUp: 3, across: 4 };
const reachDam = (Lx, extra = {}) => { const R = floodReach(Lx, T, { ...real, ...extra }); let n = 0; for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (x >= L.arena.x0 / 16 && x < L.arena.x1 / 16 && y === L.arena.floor / 16 - 1) n++; } return { n, R }; };
const open = reachDam(lv.build());
ok(open.n > 30, 'with THE JAM washed out and the baskets running, a real jump climbs the whole gorge to the old dam (' + open.n + ' tiles of its floor)');
{ const Ls = lv.build(); Ls.redgorge = false; ok(reachDam(Ls).n === 0, 'with THE JAM in place, the old dam cannot be reached: the jam is a lock'); }
for (const id of ['ledges', 'narrows']) { const Lb = lv.build(); Lb.moversExtra = Lb.moversExtra.filter(m => m.gorge !== id); ok(reachDam(Lb).n === 0, 'without the ' + id + ' basket the old dam cannot be reached: the flood is the only lift up that face'); }
/* every gate's wheel is reached before it is needed (from the start, with THE JAM still in place) */
{ const Ls = lv.build(); Ls.redgorge = false; const R = floodReach(Ls, T, real);
  for (const g of L.gates.filter(q => q.ch === 'gorge')) { const ws = L.ents.filter(e => e.t === 'sluice' && e.gate === g.id); ok(ws.length && ws.some(w => R.seen.has(w.x + ',' + w.y)) || g.id === 'narrows', 'the ' + g.id + ' gate has a wheel the climb reaches' + (g.id === 'narrows' ? ' (past the jam)' : ' with the jam still in place')); }
  const jamWheel = L.ents.find(e => e.t === 'sluice' && e.gate === 'jam'), jg = L.gates.find(q => q.id === 'jam'), j = L.jams[0];
  ok(jamWheel && R.seen.has(jamWheel.x + ',' + jamWheel.y) && jg.row < j.y0, 'THE JAM\'s wheel is reached in front of it, and its gate stands over it (row ' + jg.row + ' over ' + j.y0 + ')'); }
{ const nar = L.gates.find(q => q.id === 'narrows'), rope = ropes.find(r => r.y0 < 70); const ws = L.ents.filter(e => e.t === 'sluice' && e.gate === 'narrows');
  ok(nar && rope && nar.row < rope.y0 && ws.length === 2 && ws.some(w => w.y >= 69) && ws.some(w => w.y <= 65), 'THE NARROWS: its gate over the rope, a wheel at the basket\'s foot and one at its top (the exam: ride on a flood, hold the next)');
  ok(rope && rope.y1 - rope.y0 + 1 >= 20, 'THE NARROWS\' rope is ' + (rope && rope.y1 - rope.y0 + 1) + ' rows (>= 20: racing the next flood up it is a gamble, the gate the safe answer)');
  /* its foot is out of a jump from bridge four: a hero's hand (8 px over his feet) under the rope's foot by more than the highest hero's jump (4.5 tiles) */
  ok(rope && (70 * 16 - 8) - (rope.y1 + 1) * 16 > 4.5 * 16, 'the narrows\' rope\'s foot (row ' + (rope && rope.y1) + ') is out of the highest jump from bridge four: the basket stays required'); }
/* THE JAM IS A FIGHT: a slinger stands on it with an open line down to its wheel (no rock over the wheel's column between them), and two knives
   wait on the overhang for the gate to shut */
{ const jw = L.ents.find(e => e.t === 'sluice' && e.gate === 'jam'), js = L.ents.find(e => e.squad === 'jamSling'), j = L.jams[0];
  let open = !!(jw && js); if (open) for (let y = js.y + 1; y < jw.y; y++) if (at(jw.x, y) === T.SOLID) open = false;
  ok(js && js.x >= j.x0 && js.x <= j.x1 && js.y === j.y0 - 1 && open, 'the jam-lip slinger stands ON THE JAM, and the column over its wheel is open to him (he throws into the bank)');
  ok(L.ents.filter(e => e.squad === 'jamDrop').length === 2, 'two knives wait on the overhang to leap down when the jam\'s gate shuts');
  ok(!L.ents.some(e => e.squad === 'fallsStep'), 'the falls\' step scorpion is gone (the teach must cost less than the exam)'); }
/* THE OLD NEST and its vault */
{ const vx = L.vaultDoors[0], relic = L.ents.find(e => e.t === 'silver' && e.x < vx.x0 && e.y >= vx.y0 && e.y <= vx.y1), nest = L.ents.find(e => e.t === 'oldnest'), Ls = lv.build(); Ls.redgorge = false;
  ok(!L.ents.some(e => e.t === 'relic'), 'no relic in the gorge (Daniel 10-02: relics are cut; the vault pays a silver)');
  const Ln = lv.build(); for (const k of [...Ln.jams]) for (let y = k.y0; y <= k.y1; y++) for (let x = k.x0; x <= k.x1; x++) Ln.grid[y * Ln.W + x] = T.AIR; Ln.redgorge = false;   /* the jam washed, the vault still shut */
  const Rn = floodReach(Ln, T, real);
  ok(relic && !Rn.seen.has(relic.x + ',' + relic.y) && open.R.seen.has(relic.x + ',' + relic.y), 'the vault\'s SILVER is behind THE OLD NEST\'s woven door until four feathers open it');
  ok(nest && open.R.seen.has(nest.x + ',' + nest.y), 'the old nest itself can be reached'); }
const feathers = L.ents.filter(e => e.t === 'stray' && e.kind === 'feather');
ok(feathers.length === 4 && feathers.every(f => open.R.seen.has(f.x + ',' + f.y)) && new Set(feathers.map(f => f.x)).size === 4, 'four feathers, each one can be got (and no two share a column: the quest counts them by column)');
ok(L.quest && L.quest.n === 4 && L.quest.item === 'feather', 'the quest counts four feathers');
const checks = L.ents.filter(e => e.t === 'check');
ok(checks.length === 2 && checks.some(c => c.y <= REDGORGE.summit), 'two checkpoints (the terrace, the dam\'s door): a death in the narrows costs the climb from the falls');
const keeper = L.ents.find(e => e.elite && e.gate !== undefined);
ok(keeper && keeper.gate === 27 && keeper.y === 135, 'THE FALLS\' KEEPER (an elite scorpion) holds the gate between the terrace and the falls\' foot');

/* THE GREAT RED CRAB, pure */
{ const A = { x0: 0, floor: 320 }, dt = 1 / 60, chain = [];
  let F = GC.newFight(A, GC.CRAB.hp), opened = 0;
  for (let i = 0; i < 120 * 60; i++) { const ev = GC.stepFight(F, { x: 100 + 400 * ((i / 600 | 0) % 2) }, F.B.hp, { horn: (i % 600) > 450 && (i % 600) < 540, running: (i % 600) >= 540, held: false, swept: false }, dt);
    for (const v of ev) { if (v.t === 'open') opened++; if (v.t === 'tell') chain.push(v.what); } }
  ok(opened === 0, 'two minutes of him with nothing released opens nothing (' + chain.length + ' blows told)');
  const firsts = []; F = GC.newFight(A, GC.CRAB.hp); let last = -1;
  for (let i = 0; i < 90 * 60; i++) { GC.stepFight(F, { x: 200 }, F.B.hp, {}, dt); if (F.cycle !== last) { last = F.cycle; firsts.push(F.def.chain.join('>')); } }
  ok(new Set(firsts.slice(0, 3)).size === 3, 'every pass of his chain is a new order: ' + firsts.slice(0, 3).join(' | '));
  /* a burst on him in the channel opens him for at least 3 s; one with him out of it does not */
  F = GC.newFight(A, GC.CRAB.hp); F.B.x = (GC.CH.x0 + GC.CH.x1) / 2; F.B.mode = 'walk'; let t = 0, gotOpen = false;
  GC.stepFight(F, { x: F.B.x - 60 }, F.B.hp, { swept: true }, dt); while (F.B.mode === 'open') { GC.stepFight(F, { x: F.B.x - 60 }, F.B.hp, {}, dt); t += dt; gotOpen = true; }
  ok(gotOpen && t >= 3, 'a released burst on him in the channel throws him on his back for ' + t.toFixed(1) + ' s (>= 3)');
  F = GC.newFight(A, GC.CRAB.hp); F.B.x = 560; F.B.mode = 'walk'; GC.stepFight(F, { x: 500 }, F.B.hp, { swept: true }, dt);
  ok(F.B.mode !== 'open', 'a burst with him out of the channel opens nothing');
  /* phase two: held water keeps him out of the channel; his scuttle carries him in */
  F = GC.newFight(A, GC.CRAB.hp); F.B.phase = 2; F.B.hp = GC.CRAB.hp * 0.4; F.phase = 2; F.B.x = GC.CH.x1 + 60; let inWalk = 0, inScuttle = 0;
  for (let i = 0; i < 60 * 60; i++) { const px = i % 900 < 450 ? GC.CH.x0 - 80 : (GC.CH.x0 + GC.CH.x1) / 2; GC.stepFight(F, { x: px }, F.B.hp, { held: true }, dt); const inc = GC.inChannel(F.B.x);
    if (inc && F.B.mode === 'walk' && !F.wasIn) inWalk++; if (inc && F.B.mode === 'act' && F.B.a && F.B.a.name === 'scuttle') inScuttle++; F.wasIn = inc; }
  ok(inWalk === 0 && inScuttle > 0, 'in phase two, with the gate holding water, he never walks into the channel (' + inWalk + ') - only his scuttle carries him in (' + inScuttle + ' frames)');
  /* (claude/crabharden) THE SPRAY DAMPS FIRE: on his back with the released burst still on him, the pyromancer's blow lands x CRAB.douse (half the
     opening); the knight's and the warden's land the whole x openMul, and so does hers once the burst has passed. Told: steam, a hiss, one line */
  { let pyro = true, burst = true; const said = [];
    const ctx = { L: { arena: { boss: 'gorgecrab', x0: 0, floor: 320, ch: [GC.CH.x0, GC.CH.x1] } }, EHP: { gorgecrab: GC.CRAB.hp }, gorge: { dam: () => ({ burst, held: false, horn: false, running: false, gate: 'open' }) },
      pyro: () => pyro, time: () => 0, burst: () => {}, sfx: {}, number: (x, y, t) => said.push(t) };
    const H = makeGorgeCrabHands(ctx), e = H.spawnBoss({ x: 0, y: 0 }), Fh = H.fight(); Fh.B.mode = 'open'; Fh.B.t = 3; Fh.B.x = (GC.CH.x0 + GC.CH.x1) / 2;
    const inSpray = H.take(e); pyro = false; const knight = H.take(e); pyro = true; burst = false; const after = H.take(e);
    ok(inSpray === GC.CRAB.douse && GC.CRAB.douse < GC.CRAB.openMul && knight === GC.CRAB.openMul && after === GC.CRAB.openMul && said.includes('THE SPRAY DAMPS YOUR FIRE'),
      'the burst\'s spray damps the pyromancer\'s blows on his back (x' + inSpray + ', a sword x' + knight + ', hers after the burst x' + after + '; told: ' + said.join(' / ') + ')'); } }

if (fails.length) { for (const f of fails) console.log('  FAIL ' + f); console.log('REDGORGE: ' + fails.length + ' failed'); process.exit(1); }
console.log('REDGORGE: the gorge climbs, its flood never traps a crossing, its jam, baskets and nest are locks, and its crab opens only to released water.');
