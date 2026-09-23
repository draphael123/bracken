// tools/ore-road.mjs — THE ORE ROAD and THE WINCHMASTER, proved in Node (no browser). The level's promise is that IT MOVES:
// the buckets are the only floor over the drop, every line starts and ends on a deck, a rusted bucket can be hopped off, and
// the Winchmaster's four jobs and his one opening do what src/winchmaster.js says they do.
// usage: node tools/ore-road.mjs
import { LEVELS, T } from '../src/level.js';
import { OR, cableLines, makeCableway, stepCableway, bucketAt, pointAt, lineYAt } from '../src/ore-road.js';
import { WINCH, updateWinchmaster, winchJam, winchTake, winchOpen, winchFrame } from '../src/winchmaster.js';

let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const TS = 16, lv = LEVELS.find(l => l.id === 'oreroad'), L = lv.build(), at = (x, y) => L.grid[y * L.W + x];
const footing = t => t === T.SOLID || t === T.PLANK || t === T.ONEWAY || t === T.NET;
console.log('THE ORE ROAD');
ok(lv.needs === 'storm' && LEVELS.find(l => l.id === 'crown').needs === 'oreroad', 'it sits between Stormhold and Highcrown: it needs Stormhold, and Highcrown needs it');
ok(L.music === 'mineworks' && L.arena.boss === 'winchmaster', "its own theme ('mineworks'), and the Winchmaster in its arena");

/* EVERY LINE STARTS AND ENDS ON A DECK: step on off one, step off onto one */
const C = makeCableway(L.cable);
for (const l of C.lines) { const a = l.pts[0], b = l.pts[l.pts.length - 1], row = y => Math.round(y / TS);
  const onDeck = ([x, y], side) => footing(at(Math.floor(x / TS) + side, row(y))) || footing(at(Math.floor(x / TS), row(y)));
  ok(onDeck(a, l.pts[1][0] > a[0] ? -1 : 1) && onDeck(b, l.pts[1][0] > a[0] ? 0 : -1), `the ${l.id} line starts and ends level with a deck (${Math.round(a[0] / TS)} -> ${Math.round(b[0] / TS)})`); }

/* THE LEVEL MOVES: over each span there is NO footing but the buckets (the pylon's deck is the one rest on the first) */
const bare = (x0, x1, skip = []) => { let n = 0; for (let x = x0; x <= x1; x++) if (!skip.some(([a, b]) => x >= a && x <= b)) for (let y = 0; y < L.H; y++) if (footing(at(x, y))) n++; return n; };
ok(bare(48, 120, [OR.PYLON]) === 0, 'THE FIRST SPAN: nothing to stand on over the gorge but the buckets and the pylon deck');
ok(bare(151, 231) === 0, 'THE CROSSING: nothing to stand on but the buckets (the silver sits on a stuck bucket, a mover)');
ok(bare(247, 310) === 0, 'THE STEEP LINE: nothing to stand on but the buckets');
ok(L.ents.filter(e => e.t === 'check').length >= 6, 'a checkpoint at every station: ' + L.ents.filter(e => e.t === 'check').map(e => e.x).join(' '));
ok(L.ents.filter(e => e.t === 'silver').length === 3, 'three silvers');

/* THE CLOCK: buckets on a line are evenly spaced, and move at the line's speed */
{ const l = C.lines[0], p0 = bucketAt(l, 0), p1 = bucketAt(l, 1); stepCableway(C, 1);
  const q0 = bucketAt(l, 0); ok(p0.vis && q0.vis && Math.abs(Math.hypot(q0.x - p0.x, q0.y - p0.y) - l.speed) < 3, `a bucket goes ${l.speed} px in a second along the first span`);
  const d = [...Array(l.n).keys()].map(i => bucketAt(l, i)).filter(b => b.vis).map(b => b.s).sort((a, b) => a - b);
  ok(d.slice(1).every((s, i) => Math.abs(s - d[i] - l.gap) < 0.01), `and they come ${l.gap} px apart, like a clock`); }

/* A RUSTED BUCKET CAN BE HOPPED OFF: the next one is a jump away in the bucket's own frame (you keep its speed when you leave it) */
{ const l = C.lines.find(q => q.id === 'steep'), hole = l.gap - OR.BUCKET.w, jump = 92 * (2 * 320 / 1000);
  ok(l.cracked === 3 && hole < jump - 6, `on the steep line every ${l.cracked}rd bucket is rust, and the hole to the next is ${hole} px against a ${Math.round(jump)} px running jump`);
  ok(OR.CRACK >= 0.8 && OR.CRACK <= 1.2, `a rusted one holds you ${OR.CRACK} s: long enough to see it shake, short enough to matter`); }

/* THE DRUM LINE is the arena's floor into the drum, and the catwalks are over it where he can cut them */
{ const A = OR.ARENA, l = C.lines.find(q => q.drum);
  ok(l && Math.abs(l.pts[1][0] - A.ledge[0] * TS) < 1, 'the drum line runs from the deck to the drum ledge');
  ok(A.spans.every(([a, b]) => { for (let x = a; x <= b; x++) if (at(x, A.walk + 1) !== T.PLANK) return false; return true; }), 'three catwalks over it, in planks he can cut');
  ok(at(A.house[0], A.housing + 1) === T.SOLID && (A.deck - A.housing) * TS > 51, `his housing is ${(A.deck - A.housing)} rows over the ledge: no jump (51 px) reaches him there`);
  ok([337, 350, A.ledge[0], A.ledge[1]].every(x => at(x, A.spoil + 1) === T.SOLID) && at(338, A.walk + 2) === T.NET && at(338, A.spoil) === T.NET && at(337, A.deck + 2) !== T.NET, 'a fall off the drum line lands on the spoil heap, with a rope up to the catwalks (away from the mouth of the line): a fall costs a climb, not a life'); }

console.log('\nTHE WINCHMASTER');
/* a stub world: the drum line as the level has it, a hero we move by hand, and every world call recorded */
function world(o = {}) {
  const A = OR.ARENA, l = makeCableway(cableLines()).lines.find(q => q.drum), log = [];
  const P = { x: 340 * TS, y: (A.deck + 1) * TS, dead: false, ground: true };
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
