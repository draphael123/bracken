// tools/rootway.mjs - THE ROOTWAY's own check (claude/rootway, the greybox). Node only: no page, no port.
//   - the level is on the main road: in LEVELS with needs 'spore', KINGSWOOD needs it, a WOOD map node, gated by level-quality, one new foe (the trophy-hunter)
//   - the reach model reaches every checkpoint, silver, trophy tag, the loft, the Huntmaster and the gate
//   - EVERY REQUIRED USE IS A LOCK: without the root wall's bud, either leaning cap, the hunter's bud, the cellar span, the gap span, any of the three
//     larder cages, the high cleat's span or the lookout's span, the road past it is out of reach (A4: one required use before the boss, and more)
//   - THE HIGH CLEAT is struck only from its grown cap (or the root it raises you to); THE LOOKOUT's cleat by no blade at all - only an arrow struck
//     back through its rope, and the scout stands where his arrow and its way home cross that rope
//   - EVERY WELL IN THE TEACH, TEST AND REMIX is cheap: from its floor the fill climbs back to its near lip and never to its far one
//   - THE EXAM's GAPS ARE REAL FALLS (A10 amended, Daniel 2026-10-07; the fix pass): the lookout chasm and the last leaning cap's gap have no floor at all,
//     each is TOLD (a warning post on its near lip, the sign at checkpoint three) and its crossing verb was TAUGHT over a cheap well first; no floorless gap before the exam
//   - THE TROPHY LOFT IS A LOCK (its door shut, its silver out of reach); four checkpoints 80+ columns apart (the door one excepted); three silvers; four tags
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { readFileSync } from 'node:fs';
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'rootway'), L = lv && lv.build();
ok(!!lv && lv.needs === 'spore' && LEVELS.find(l => l.id === 'kings').needs === 'rootway', 'THE ROOTWAY follows SPOREWOOD and KINGSWOOD follows it');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
ok(/id: 'rootway', kind: 'level'/.test(main), 'a map node on the wood sheet');
const lq = readFileSync(new URL('./level-quality.mjs', import.meta.url), 'utf8'), onf = readFileSync(new URL('./one-new-foe.mjs', import.meta.url), 'utf8');
ok(/GATE = \[[^\]]*'rootway'/.test(lq) && /rootway: \['trophyhunter'\]/.test(onf), 'gated by level-quality; its one new foe is the trophy-hunter');
const at = (e, r) => r.near(e.x, e.y) || r.jumpNear(e.x, e.y);
const KEY = ['check', 'silver', 'stray', 'loft', 'gate', 'huntmaster'];
const full = floodReach(L, T);
{ const miss = L.ents.filter(e => KEY.includes(e.t) && !at(e, full)).map(e => e.t + '@' + e.x + ',' + e.y); ok(!miss.length, 'the fill reaches every checkpoint, silver, tag, the loft, the Huntmaster and the gate ' + miss.join(' ')); }
const ent = (t, x) => L.ents.find(e => e.t === t && e.x === x);
const H = id => L.hoists.find(h => h.id === id);
const budAt = x => L.moversExtra.find(m => m.kind === 'growcap' && Math.round(m.x / TS) === x);
const noHoist = id => floodReach({ ...L, hoists: L.hoists.filter(h => h.id !== id) }, T);
const noBud = x => floodReach({ ...L, moversExtra: L.moversExtra.filter(m => m !== budAt(x)) }, T);
ok(!!budAt(29) && !at(ent('check', 92), noBud(29)), 'the root wall bud is a lock: without it the cellar ends at the wall (the first REQUIRED use)');
ok(!at(ent('check', 92), noHoist('cellarSpan')), 'the cellar span is a lock: without it the pit stops the road');
ok(!!budAt(103) && !at(ent('check', 193), noBud(103)), 'the leaning cap over the root gap is a lock');
ok(!at(ent('check', 193), noHoist('gapSpan')), 'the gap span is a lock');
for (const id of ['larder1', 'larder2', 'larder3']) ok(!at(ent('check', 290), noHoist(id)), 'THE TROPHY LARDER: cage ' + id.slice(-1) + ' is a lock (without it the stair has a four-row step)');
ok(!at(ent('check', 290), noHoist('highCleat')), 'the high cleat\'s span is a lock');
ok(!!budAt(267) && !at(ent('check', 290), noBud(267)), 'the hunter\'s bud is a lock (the root wall past it is four rows)');
ok(!at(ent('check', 384), noHoist('lookout')), 'THE LOOKOUT\'s span is a lock');
ok(!!budAt(339) && !at(ent('check', 384), noBud(339)), 'the last leaning cap is a lock');
{ const r = floodReach({ ...L, vaultDoors: [] }, T); ok(!at(ent('silver', 366), r), 'the trophy loft is a lock: with its door shut its silver is out of reach'); }
/* WHO CAN STRIKE A CLEAT: a hero standing in a reached cell (x, y) - feet at (y+1)*TS - reaches two columns either side and from his feet up to a jump plus a
   rising cut over his head (51 + 44 px); a grown cap's top is a place to stand too. A cleat's box is its cell and the one over it. */
const strikeFrom = (r, h, buds) => { const [cx, cy] = h.cleat, top = (cy - 1) * TS, bot = (cy + 1) * TS, hits = (x, feet) => Math.abs(x - cx) <= 2 && bot > feet - 95 && top < feet;
  for (const k of r.seen) { const [x, y] = k.split(',').map(Number); if (hits(x, (y + 1) * TS)) return k; }
  for (const m of buds) { const x0 = Math.floor(m.x / TS), x1 = Math.floor((m.x + (m.lean || 0) + m.w - 1) / TS); for (let x = x0; x <= x1; x++) if (r.near(x, Math.floor(m.y0 / TS)) && hits(x, m.y1)) return 'cap@' + x; }
  return null; };
{ const buds = L.moversExtra.filter(m => m.kind === 'growcap'), h = H('highCleat');
  ok(!!strikeFrom(full, h, buds), 'the high cleat is struck from its grown cap (' + strikeFrom(full, h, buds) + ')');
  const r = floodReach({ ...L, moversExtra: L.moversExtra.filter(m => m !== budAt(237)), hoists: L.hoists.filter(q => q.id !== 'highCleat') }, T);
  ok(!strikeFrom(r, h, buds.filter(m => m !== budAt(237))), 'the high cleat is out of every blade\'s reach without the cap under it'); }
{ const h = H('lookout'), r = noHoist('lookout'), k = strikeFrom(r, h, L.moversExtra.filter(m => m.kind === 'growcap'));
  ok(!k, 'the lookout\'s cleat is out of every blade\'s reach before its span drops: only an arrow cuts it ' + (k || ''));
  const bow = L.ents.find(e => e.t === 'archer' && e.lookout), lip = { x: h.span[0] - 1, y: h.span[2] - 1 };
  const bx = bow.x * TS + 8, by = (bow.y + 1) * TS, px = lip.x * TS + 8, py = (lip.y + 1) * TS - 10;   /* his feet; the arrow met at the hero's chest on the lip */
  ok(Math.abs(bx - px) < 230 && Math.abs(by - (py + 10)) < 70, 'the lookout scout sees the near lip (dx ' + Math.abs(bx - px) + ' px < 230, dy ' + Math.abs(by - py - 10) + ' < 70)');
  const cx = h.cleat[0] * TS + 8, yAt = by - 5 + (py - (by - 5)) * (bx - cx) / (bx - px);   /* the arrow struck back flies straight at his chest (owner.y - 5) */
  ok(yAt > (h.cleat[1] - 2) * TS && yAt < (h.cleat[1] + 3) * TS && cx > px && cx < bx, 'an arrow struck back from the lip crosses the rope at the cleat (y ' + Math.round(yAt) + ')'); }
/* EVERY WELL BEFORE THE EXAM IS CHEAP: from its floor the fill gets back to the near lip, and never to the far one (with its span not dropped) */
for (const [x0, x1, lip, bottom, id] of [[105, 114, 35, 45, null], [173, 181, 35, 45, 'gapSpan'], [247, 255, 23, 35, 'highCleat'], [53, 60, 38, 42, 'cellarSpan'], [207, 224, 32, 45, 'larder1']]) {
  const Lw = { ...L, hoists: L.hoists.filter(h => !id || !h.id.startsWith(id.replace(/\d$/, ''))), moversExtra: L.moversExtra.filter(m => !m.lean || Math.abs(m.x / TS - x0) > 4), START: { x: x0 + 2, y: bottom - 1 } };
  const r = floodReach(Lw, T); ok(r.seen.has((x0 - 1) + ',' + (lip - 1)) && !r.seen.has((x1 + 1) + ',' + (lip - 1)) && ![...r.seen].some(k => { const [x, y] = k.split(',').map(Number); return x > x1 + 1 && x < x1 + 30 && y < lip; }), 'the well at ' + x0 + '-' + x1 + ': from its floor, back up to the near lip only'); }
/* THE EXAM's GAPS ARE REAL FALLS (A10 amended): open air from the lip to the world's last row in every column; a warning post on the near lip; the sign before
   the exam says it; the verb that crosses each one (the span, the leaning cap) was taught over a cheap well first (above); and no gap before the exam is floorless */
{ const g = (x, y) => L.grid[y * L.W + x], open = (x0, x1, lip) => { for (let x = x0; x <= x1; x++) for (let y = lip; y < L.H; y++) if (g(x, y) !== T.AIR) return false; return true; };
  for (const [x0, x1, lip, verb] of [[304, 311, 19, 'the lookout span'], [341, 350, 19, 'the last leaning cap']]) {
    ok(open(x0, x1, lip), 'the exam gap at ' + x0 + '-' + x1 + ' (' + verb + ') has no floor: a fall is THE FALL');
    ok(L.ents.some(e => e.t === 'deco' && e.kind === 'warnPost' && e.x === x0 - 1 && e.y === lip - 1), 'a warning post on its near lip (' + (x0 - 1) + ')'); }
  ok(L.ents.some(e => e.t === 'sign' && e.x >= 286 && e.x < 304 && /FALL IS THE END/.test(e.text)), 'the sign before the exam tells it: a fall there is the end');
  const floorless = []; for (let x = 1; x < 296; x++) if ([...Array(L.H).keys()].every(y => g(x, y) === T.AIR)) floorless.push(x);
  ok(!floorless.length, 'no floorless column before the exam (the teach and the test stay cheap) ' + floorless.join(',')); }
const ch = L.ents.filter(e => e.t === 'check').sort((a, b) => a.x - b.x);
ok(ch.length === 4 && ch.every((c, i) => !i || c.x - ch[i - 1].x >= 80), 'checkpoints: ' + ch.map(c => c.x).join(', ') + ' (four, 80+ columns apart; the last is the door)');
ok(L.ents.filter(e => e.t === 'silver').length === 3, 'three silvers'); ok(L.ents.filter(e => e.t === 'stray' && e.kind === 'tag').length === L.quest.n, L.quest.n + ' trophy tags');
/* the hoists are drawn data: every span and landing is open air as built, every cleat stands in air, every load hangs over where it lands */
{ const g = (x, y) => L.grid[y * L.W + x], wrong = [];
  for (const h of L.hoists) { if (g(h.cleat[0], h.cleat[1]) !== T.AIR) wrong.push(h.id + ' cleat in rock');
    if (h.span) { for (let x = h.span[0]; x <= h.span[1]; x++) if (g(x, h.span[2]) !== T.AIR) wrong.push(h.id + ' span cell ' + x); if (h.hang >= h.span[2]) wrong.push(h.id + ' hangs under its span'); }
    if (h.land) { for (let y = h.land[1]; y <= h.land[1] + 1; y++) for (let x = h.land[0]; x <= h.land[0] + 1; x++) if (g(x, y) !== T.AIR) wrong.push(h.id + ' landing ' + x + ',' + y);
      if (g(h.land[0], h.land[1] + 2) === T.AIR) wrong.push(h.id + ' lands on air'); if (Math.abs(h.x - (h.land[0] + 1)) > 0.01) wrong.push(h.id + ' rope off its landing'); }
    if (h.top >= h.hang) wrong.push(h.id + ' pulley under its load'); }
  ok(!wrong.length, 'every hoist: cleat in air, span/landing open as built, load over its landing, pulley over its load ' + wrong.join('; ')); }
console.log(bad ? 'rootway: ' + bad + ' FAILED' : 'rootway: all green'); process.exit(bad ? 1 : 0);
