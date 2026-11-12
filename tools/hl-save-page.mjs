// tools/hl-save-page.mjs - THE HIGH LINES' SAVE MIGRATION IN THE REAL PAGE (claude/hlproof, 11-12). tools/hl-road.mjs proves the rule in Node (the real progDefaults line run over fake
// saves); this loads real saves through the page's own loadSlot. TWO PAGES: first a page with the road SHUT (the game as it is live today) writes five saves of the shapes an old player
// has (the page's own fresh PROG + the clears that shape needs, JSON as the save slots hold it); then a page with the road OPEN (BRACKEN_ROAD=hl, the flag-on state) puts those exact
// bytes into bracken.progress.0..4, loadSlot()s each and reads the map's own lock list (BK.mapNodes().locked, the node list the map draws and walks) and PROG:
//   0 FRESH                  nothing cleared: the High Lines and the Ore Road are shut
//   1 SKY ROAD DONE          the High Lines open and unplayed; the Ore Road stays open (the old save had it open)
//   2 ORE ROAD PLAYED        open, with its medal and coins untouched; the High Lines open and unplayed
//   3 PAST THE ORE ROAD      the Ore Road cleared + Deep Rails open: nothing lost; the High Lines open
//   4 BEFORE THE SKY ROAD    (the road's earlier levels done, the Sky Road open, not cleared): High Lines shut, Ore Road shut; then clearing the Sky Road LATER opens the High Lines and leaves the Ore Road shut
// plus: a second load of every slot changes nothing (JSON equal), the slots other than the one loaded are byte-identical in storage, the road order in the map's node list is
// skyroad < highlines < oreroad, and with the road SHUT the same five saves load with the High Lines absent and the Ore Road exactly as before.
// usage: PORT=8644 node tools/hl-save-page.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); }, ok = m => console.log('ok   ' + m);
const chainBack = `(LEVELS, id) => { const by = Object.fromEntries(LEVELS.map(l => [l.id, l])), out = []; for (let l = by[id], g = 0; l && g < 200; l = by[l.needs], g++) out.push(l.id); return out; }`;
/* ---- page 1: the road shut, write the five saves ---- */
delete process.env.BRACKEN_ROAD;
let pg = await openPage({ audio: false, fonts: false, seed: 20261112 });
let saves;
try {
  saves = await pg.evalp(`(async () => { const { LEVELS, ROAD_OPEN } = await import('/src/level.js'); BK.manualSimulation = true; const chain = (${chainBack});
    const mk = f => { BK.reset({ fresh: true }); const P = BKT.PROG; for (const l of LEVELS) delete P[l.id]; delete P.roadOpen; P.coins = 0; f(P); return JSON.stringify(P); };
    const clr = (P, ids) => { for (const id of ids) P[id] = { ...(P[id] || {}), cleared: true, medal: 2, best: 100 }; };
    const upTo = id => chain(LEVELS, id).slice(1);   /* the levels before it on the needs chain */
    const nx = id => LEVELS.find(l => l.needs === id);
    return { road: ROAD_OPEN.highlines, hasHL: LEVELS.some(l => l.id === 'highlines' && !l.hidden), oreNeeds: LEVELS.find(l => l.id === 'oreroad').needs, after: nx('oreroad') && nx('oreroad').id,
      s: [ mk(P => {}),
           mk(P => { clr(P, upTo('skyroad')); clr(P, ['skyroad']); P.skyroad.medal = 3; }),
           mk(P => { clr(P, upTo('oreroad')); clr(P, ['skyroad']); P.oreroad = { best: 4321, medal: 1, coins: 37, cleared: false, slain: 6 }; P.coins = 555; }),
           mk(P => { const a = nx('oreroad').id; clr(P, upTo('oreroad')); clr(P, ['skyroad', 'oreroad']); P.oreroad.medal = 3; P.oreroad.coins = 80; P.coins = 910; P[a] = { best: 1, medal: 0, cleared: false }; }),
           mk(P => { clr(P, upTo('skyroad')); }) ] }; })()`, 60000);
  pg.close();
} catch (e) { console.log('page 1 failed: ' + e.message); try { pg.close(); } catch {} process.exit(2); }
/* (rel164) AFTER THE FLIP (ROAD_OPEN.highlines literal true) no road-shut page exists: page 1 would build its 'old' saves with the High Lines in the chain, not the shape a player has today. The migration was proven green BEFORE the flip (rel164 ran this tool on claude/prephl, flag false: 13/13 ok); flip it back to false to re-run. */
if (saves.road !== false) { console.log('SKIP hl-save-page: the High Lines flag is live, there is no road-shut page to write old-shape saves from (proven green pre-flip; node tools/hl-road.mjs still runs the rule with the real progDefaults line)'); process.exit(0); }
console.log('page 1 (road shut): ROAD_OPEN.highlines=' + saves.road + ', highlines visible=' + saves.hasHL + ', oreroad needs ' + saves.oreNeeds + ', level after the Ore Road: ' + saves.after);

const READ = `(async (raw, openFirst) => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const ls = localStorage; ls.clear();
  for (let i = 0; i < 5; i++) ls.setItem('bracken.progress.' + i, raw[i]);
  const K = i => 'bracken.progress.' + i, snap = () => [0, 1, 2, 3, 4].map(i => ls.getItem(K(i)));
  const view = () => { const n = BK.mapNodes(), at = id => n.ids.indexOf(id), lk = id => (at(id) < 0 ? 'absent' : n.locked[at(id)] ? 'locked' : 'open'); const P = BKT.PROG;
    return { sky: lk('skyroad'), hl: lk('highlines'), ore: lk('oreroad'), order: [at('skyroad'), at('highlines'), at('oreroad')], hlRec: P.highlines || null, oreRec: P.oreroad ? { medal: P.oreroad.medal, best: P.oreroad.best, coins: P.oreroad.coins, cleared: !!P.oreroad.cleared } : null, coins: P.coins, roadOpen: P.roadOpen ? { ...P.roadOpen } : null, oreMedalKept: P.oreroad && P.oreroad.medal, json: JSON.stringify(P) }; };
  const out = []; const before = snap();
  for (let i = 0; i < 5; i++) { BK.loadSlot(i); const v1 = view(); BK.loadSlot(i); const v2 = view(); out.push({ i, v1, again: v1.json === v2.json, hlSame: v1.hl === v2.hl && v1.ore === v2.ore }); }
  const after = snap();
  /* slot 4 (before the Sky Road): clear the Sky Road later, in the page */
  BK.loadSlot(4); const pre = view(); BKT.PROG.skyroad = { cleared: true, medal: 1, best: 100 }; const post = view();
  return { out, bytesSame: before.every((t, i) => t === after[i]), pre: { hl: pre.hl, ore: pre.ore }, post: { hl: post.hl, ore: post.ore, hlRec: post.hlRec } }; })`;
const run = async (road) => {
  if (road) process.env.BRACKEN_ROAD = 'hl'; else delete process.env.BRACKEN_ROAD;
  const p = await openPage({ audio: false, fonts: false, seed: 20261112 });
  try { return await p.evalp(READ + '(' + JSON.stringify(saves.s) + ')', 60000); } finally { p.close(); }
};
const ON = await run(true);
const cases = ['fresh', 'Sky Road done', 'Ore Road played', 'past the Ore Road', 'before the Sky Road'];
const want = [
  v => v.hl === 'locked' && v.ore === 'locked',
  v => v.hl === 'open' && !v.hlRec && v.ore === 'open',
  v => v.hl === 'open' && !v.hlRec && v.ore === 'open' && v.oreRec && v.oreRec.medal === 1 && v.oreRec.best === 4321 && v.oreRec.coins === 37 && !v.oreRec.cleared && v.coins === 555,
  v => v.hl === 'open' && !v.hlRec && v.ore === 'open' && v.oreRec && v.oreRec.cleared && v.oreRec.medal === 3 && v.oreRec.coins === 80 && v.coins === 910,
  v => v.hl === 'locked' && v.ore === 'locked' ];
ON.out.forEach(r => { const v = r.v1; const good = want[r.i](v) && r.again && r.hlSame && v.order[0] < v.order[1] && v.order[1] < v.order[2] && v.order[0] >= 0;
  (good ? ok : fail)('road OPEN, slot ' + (r.i + 1) + ' ' + cases[r.i] + ': sky ' + v.sky + ', HIGH LINES ' + v.hl + (v.hlRec ? ' (HAS A RECORD ' + JSON.stringify(v.hlRec) + ')' : ' unplayed') + ', ORE ROAD ' + v.ore + (v.oreRec ? ' (medal ' + v.oreRec.medal + ', best ' + v.oreRec.best + ', coins ' + v.oreRec.coins + ', cleared ' + v.oreRec.cleared + ')' : '') + ', roadOpen ' + JSON.stringify(v.roadOpen) + ', map order ' + v.order.join('<') + ', second load identical ' + r.again); });
(ON.bytesSame ? ok : fail)('the five saves in storage are byte-identical after every slot was loaded (a load does not write)');
(ON.pre.hl === 'locked' && ON.pre.ore === 'locked' && ON.post.hl === 'open' && !ON.post.hlRec && ON.post.ore === 'locked' ? ok : fail)('a save before the Sky Road (' + JSON.stringify(ON.pre) + ') that clears it LATER: ' + JSON.stringify(ON.post) + ' - the High Lines open, the Ore Road waits behind them');
/* ---- the same saves with the road shut: nothing changes for today's game ---- */
const OFF = await run(false);
OFF.out.forEach(r => { const v = r.v1; const good = v.hl === 'absent' && r.again && (r.i === 0 ? v.ore === 'locked' : r.i === 4 ? v.ore === 'locked' : v.ore === 'open') && (r.i !== 2 || (v.oreRec.best === 4321 && v.oreRec.medal === 1));
  (good ? ok : fail)('road SHUT, slot ' + (r.i + 1) + ' ' + cases[r.i] + ': High Lines ' + v.hl + ', Ore Road ' + v.ore + ', roadOpen ' + JSON.stringify(v.roadOpen)); });
(OFF.bytesSame ? ok : fail)('road SHUT: storage byte-identical after the five loads');
console.log(bad ? bad + ' FAILED' : 'every old save shape loads through the real loadSlot with the road open: nothing lost, the High Lines open and unplayed, the Ore Road kept; road shut = today');
process.exit(bad ? 1 : 0);
