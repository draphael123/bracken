// tools/village-stakes.mjs — THE BURNING VILLAGE CAN BE LOST (KICKOFF 4%, 2026-09-23): every captive is on a fuse
// (src/burning-village.js stepFuse). Proved in Node, on the module, with the fire counted by hand.
// usage: node tools/village-stakes.mjs
import { CAPTIVE, stepFuse, fuseLeft, buildBurningVillage } from '../src/burning-village.js';
import { LEVELS } from '../src/level.js';
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const run = (pr, secs, near = 0, each) => { const ev = []; for (let t = 0; t < secs; t += 1 / 60) { if (each) each(pr, t); const e = stepFuse(pr, 1 / 60, near); if (e) ev.push(e); } return ev; };
{ const pr = { hot: true }; run(pr, 60); ok(!pr.lost && !(pr.fuse > 0), 'a hot door burns nobody while nobody has heard them call (the fuse waits for the cry)'); }
{ const pr = { hot: true, said: true }; const ev = run(pr, CAPTIVE.hot - 1); ok(!pr.lost, `heard, a hot door holds for ${CAPTIVE.hot} s`); ok(ev.join() === 'half,last', 'and says so at half and at the last fifth: ' + ev.join());
  run(pr, 2); ok(pr.lost, 'then the house has them'); }
{ const pr = { hot: true, said: true }; run(pr, CAPTIVE.hot - 5); pr.cooled = true; run(pr, 12); ok(!pr.lost && fuseLeft(pr) > 0, 'WATER BUYS TIME: a cooled door does not burn down while it is cooled'); pr.cooled = false; run(pr, 6); ok(pr.lost, 'and the fuse picks up where it stopped'); }
{ const pr = { said: true }; run(pr, 60, 1); ok(!pr.lost && !(pr.fuse > 0), `an ordinary door is safe while the fire on its house is under ${CAPTIVE.near} cells`);
  run(pr, CAPTIVE.reached + 0.1, CAPTIVE.near); ok(pr.lost, `and lost after ${CAPTIVE.reached} s of the Pyromancer's fire on it`); }
{ const pr = { hot: true, said: true }; run(pr, 10); pr.freed = true; run(pr, 60); ok(!pr.lost, 'a villager you got out stays out'); }
{ const L = LEVELS.find(l => l.id === 'burning').build(), caps = L.ents.filter(e => e.t === 'captive');
  ok(caps.length === 6 && L.quest.n === 6, 'six captives, and the level asks for all six'); ok(caps.some(c => c.hot), 'at least one hot door, so the clock is always running somewhere'); }
console.log(fails ? `\n${fails} village stakes check(s) FAILED` : '\nall village stakes checks pass');
process.exit(fails ? 1 : 0);
