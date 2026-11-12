// tools/hl-road.mjs - THE HIGH LINES' ROAD: the map node, the save rule, the bookkeeping rows, the bestiary cards (claude/hllive). Node only: no page, no port, no Chrome.
//   node tools/hl-road.mjs      runs BOTH halves, one process after the other (src/level.js reads the flag when it is imported):
//     FLAG OFF (this process)   ROAD_OPEN.highlines false: the High Lines row is hidden + dev and LAST (index 76 - saves count levels by index), the Ore Road needs the Sky Road, the map has no
//                               node, the bestiary no card, the save rule writes nothing (run over the real progDefaults line on fake saves); every hook is behind the flag
//     FLAG ON  (a child: --on)  globalThis.__HL (tools/hl-on.mjs): Sky Road -> High Lines -> Ore Road; the node sits between the two on the map (no overlap, the margin band);
//                               THE SAVE RULE, with the real line out of src/main.js: a fresh save, the Sky Road done, the Ore Road played, past the Ore Road, a save before the Sky
//                               Road, and FIVE SLOTS at once (each its own, byte-identical outside the slot loaded, a second load changes nothing) - no save that had a level open
//                               loses it, the High Lines show UNPLAYED (open, no progress) to a save past the Sky Road, a save that reaches the Sky Road later walks them;
//                               the TIER / EHP / act / exit-gate rows; the two bestiary cards fit and their portraits bake (the pixels, the page's size rule)
// The model of the lock is the needs clause of main.js levelLocked (src/route-insert.js needsOpen); the per-level extra rules (crownOpen and the rest) are other roads' and are not in it.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const { install } = await import('./node-canvas.mjs'); install();
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const rd = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = rd('src/main.js');
const { LEVELS, ROAD_OPEN, HL_SHIPS, HL_INSERT } = await import('../src/level.js');
const RI = await import('../src/route-insert.js');
const HL_INDEX = 76;   /* THE ROW'S PLACE: appended after the academy row, LAST. A level inserted before it (a gd / airship row that ships later) shifts every live save's index: append those AFTER it */
const idx = id => LEVELS.findIndex(l => l.id === id);
const hl = LEVELS.find(l => l.id === 'highlines'), ore = LEVELS.find(l => l.id === 'oreroad'), sky = LEVELS.find(l => l.id === 'skyroad');
const migLine = (/^\s*if \(ROAD_OPEN\.highlines\) roadMigrate\(PROG, HL_INSERT\);.*$/m.exec(main) || [''])[0];
const migRun = (PROG, flag) => { new Function('ROAD_OPEN', 'roadMigrate', 'HL_INSERT', 'PROG', migLine.replace(/\/\*[\s\S]*$/, ''))({ highlines: flag }, RI.roadMigrate, HL_INSERT, PROG); return PROG; };   /* the line in progDefaults, as a function of the flag */
const cl = (...ids) => { const P = {}; for (const i of ids) P[i] = { cleared: true }; return P; };
const clone = o => JSON.parse(JSON.stringify(o));
const ci = process.argv.indexOf('--on');

/* the map's tables, the way tools/map-grammar.mjs reads them (the vm slice of src/main.js) */
const mapOf = () => { const ctx = vm.createContext({ LEVELS }); vm.runInContext(main.slice(main.indexOf('const MAPW ='), main.indexOf('const MAPC =')) + '\nglobalThis.route = { NODES, CRAG_NODES, CRAG_PATH, CRAG_Y };', ctx); return ctx.route; };

ok(HL_INSERT.length === 1 && HL_INSERT[0].id === 'highlines' && HL_INSERT[0].after === 'skyroad' && HL_INSERT[0].before === 'oreroad' && HL_INSERT[0].live === true, 'HL_INSERT is the one row: highlines after skyroad, before oreroad');
ok(idx('highlines') === HL_INDEX && idx('highlines') === LEVELS.length - 1, 'the High Lines row is index ' + HL_INDEX + ' and LAST (saves count levels by index; a later level is appended AFTER it): ' + idx('highlines') + ' of ' + LEVELS.length);
ok(['wispwood', 'silk', 'manor', 'academy'].every((id, i) => idx(id) === HL_INDEX - 4 + i), 'the four shipped night rows keep the four places before it');
ok(/if \(ROAD_OPEN\.highlines\) roadMigrate\(PROG, HL_INSERT\);/.test(main) && main.split('roadMigrate(PROG, HL_INSERT)').length === 2, 'progDefaults runs the High Lines insert once, behind ROAD_OPEN.highlines');
ok(/!roadKept\(PROG, lv\)/.test(main), "levelLocked reads roadKept (the migration's PROG.roadOpen.oreroad): no clause of its own");
ok(/\(LEVELS\.find\(l => l\.id === 'highlines'\) \|\| \{\}\)\.needs\) \{ CRAG_NODES\.splice/.test(main), 'the map node goes in only while the row has `needs` (the road is open at import)');
ok(/if \(ROAD_OPEN\.highlines\) \{ BOSS_T\.push\('skyhook'\); BEASTS\.push\(/.test(main) && /if \(ROAD_OPEN\.highlines\) Object\.assign\(SPR, bakeLineCrewCards\(/.test(main), 'the two bestiary cards and their portraits are behind the flag');

if (ci < 0) {
  console.log('== THE HIGH LINES ROAD, FLAG OFF (ROAD_OPEN.highlines = ' + ROAD_OPEN.highlines + ')');
  ok(ROAD_OPEN.highlines === false && HL_SHIPS === false, 'the ship flag is off and nothing turns it on here (ROAD_OPEN.highlines false)');
  ok(hl.hidden === true && hl.dev === true && !hl.needs, 'flag OFF: the High Lines are hidden + dev with no needs (reached by ?level=highlines)');
  ok(ore.needs === 'skyroad', 'flag OFF: the Ore Road still needs the Sky Road');
  { const r = mapOf(); ok(!r.CRAG_NODES.some(q => q.id === 'highlines') && !r.CRAG_PATH.some(p => p[0] === 296), 'flag OFF: no High Lines node and no road vertex on the crag sheet'); }
  for (const [name, P0] of [['a fresh save', {}], ['the Sky Road done', cl('skyroad')], ['the Ore Road played', { ...cl('skyroad'), oreroad: { medal: 1 } }], ['past the Ore Road', cl('skyroad', 'oreroad', 'minecart')]]) {
    const P = migRun(clone(P0), false); ok(JSON.stringify(P) === JSON.stringify(P0), 'flag OFF, ' + name + ': the save is untouched'); }
  console.log('== the rows that need no flag');
  const child = spawnSync(process.execPath, ['--import', './tools/hl-on.mjs', fileURLToPath(import.meta.url), '--on'], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  process.stdout.write(child.stdout || ''); const bad = child.status !== 0;
  console.log(bad ? '\nTHE HIGH LINES ROAD: FAIL (flag off ' + n + ' ok, then the flag-on half failed)' : '\nTHE HIGH LINES ROAD: all ok (flag off ' + n + ' checks, then flag on)');
  process.exit(bad ? 1 : 0);
}

// ======================================================================= FLAG ON =======================================================================
console.log('== THE HIGH LINES ROAD, FLAG ON (globalThis.__HL)');
ok(ROAD_OPEN.highlines === true && HL_SHIPS === true, 'the flag is on');
ok(!hl.hidden && !hl.dev && hl.needs === 'skyroad' && ore.needs === 'highlines', 'the road: the High Lines need the Sky Road, the Ore Road needs the High Lines, the row is a campaign level');
ok(idx('oreroad') === 38 && idx('skyroad') === 53, 'the Ore Road and the Sky Road keep their indices (38, 53): nothing moved');

/* ---- THE MAP ---- */
{ const r = mapOf(), cn = r.CRAG_NODES, ids = cn.map(q => q.id), a = ids.indexOf('skyroad'), b = ids.indexOf('highlines'), c = ids.indexOf('oreroad'), nd = cn[b];
  ok(a >= 0 && b === a + 1 && c === b + 1, 'the crag list reads skyroad > highlines > oreroad (road order): ' + ids.slice(a, c + 1).join(' > '));
  ok(nd.kind === 'level' && nd.level === idx('highlines') && nd.name === 'THE HIGH LINES', 'the node is the High Lines level (index ' + nd.level + ')');
  const pi = r.CRAG_PATH.findIndex(p => p[0] === nd.x && p[1] === nd.y); ok(pi > 0 && r.CRAG_PATH[pi - 1][0] === cn[a].x && r.CRAG_PATH[pi + 1][0] === cn[c].x, 'the road vertex sits ON the node, between the Sky Road and the Ore Road vertices');
  ok(nd.x <= 320 - 24, 'inside the sheet margin band (x ' + nd.x + ' <= 296)');
  const gap = Math.min(...cn.filter(q => q !== nd).map(q => Math.hypot(q.x - nd.x, q.y - nd.y))); ok(gap >= 24, 'no other crag node within 24 px (nearest ' + gap.toFixed(1) + '): no overlap with a node or its label (tools/map-spacing.mjs lays the plates out)'); }

/* ---- THE SAVE RULE ---- */
const old = LEVELS.map(l => ({ id: l.id, needs: l.id === 'highlines' ? null : l.id === 'oreroad' ? 'skyroad' : (l.needs || null), hidden: l.id === 'highlines' ? true : !!l.hidden }));   /* the rows as the live game has them today */
const openOld = P => new Set(old.filter(l => !l.hidden && RI.needsOpen(P, l)).map(l => l.id));
const openNew = P => new Set(LEVELS.filter(l => !l.hidden && RI.needsOpen(P, l)).map(l => l.id));
const chain = id => { const out = []; let cur = old.find(l => l.id === id); const seen = new Set(); while (cur && cur.needs && !seen.has(cur.needs)) { seen.add(cur.needs); out.push(cur.needs); cur = old.find(l => l.id === cur.needs); } return out; };
const CASES = [
  ['a fresh save', {}],
  ['a save before the Sky Road (the Rookery done)', cl('rookery')],
  ['the Sky Road done', cl('skyroad')],
  ['the Ore Road open and played (not cleared)', { ...cl('skyroad'), oreroad: { medal: 1, best: 321 }, coins: 77 }],
  ['past the Ore Road (the Deep Rails open)', cl(...chain('minecart'), 'oreroad')],
  ['the Ore Road cleared, the Sky Road record gone', cl('oreroad')],
];
for (const [name, P0] of CASES) {
  const was = openOld(P0), P = migRun(clone(P0), true), now = openNew(P), lost = [...was].filter(id => !now.has(id));
  ok(!lost.length, name + ': every level that was open is open after (lost: ' + lost.join(',') + ')');
  for (const k of Object.keys(P0)) ok(JSON.stringify(P[k]) === JSON.stringify(P0[k]), name + ': progress in "' + k + '" is untouched');
  /* the High Lines need the Sky Road CLEARED, exactly as the Ore Road did: a save past it finds them open and unplayed; a save with the Ore Road cleared but no Sky Road record (a pre-Sky-Road save) has the Sky Road itself still to clear, which is open to it as it was */
  ok(now.has('highlines') === !!(P0.skyroad && P0.skyroad.cleared), name + ': the High Lines are open exactly when the Sky Road is cleared');
  if (now.has('highlines')) ok(!P.highlines, name + ': the High Lines show UNPLAYED (no progress), not a wall');
  if (was.has('oreroad')) ok(P.roadOpen && P.roadOpen.oreroad === 1, name + ': the Ore Road is KEPT (PROG.roadOpen.oreroad)');
  else ok(!(P.roadOpen && P.roadOpen.oreroad) && !now.has('oreroad'), name + ': the Ore Road was shut and stays shut (it needs the High Lines now)');
  ok(P.roadMig && P.roadMig.highlines === 1, name + ': the migration is marked done');
  const again = migRun(clone(P), true); ok(JSON.stringify(again) === JSON.stringify(P), name + ': a second load changes nothing (once)');
}
{ /* the fresh save walks it: after the migration ran, the Sky Road is cleared later - the Ore Road needs the High Lines */
  const P = migRun({}, true); P.skyroad = { cleared: true };
  ok(!openNew(P).has('oreroad') && openNew(P).has('highlines'), 'a fresh save that clears the Sky Road LATER: the High Lines open, the Ore Road waits for them');
  P.highlines = { cleared: true }; ok(openNew(P).has('oreroad'), '... and clearing the High Lines opens the Ore Road'); }
{ /* a kept Ore Road never relocks, and clearing the High Lines later changes nothing */
  const P = migRun(cl('skyroad'), true); P.highlines = { cleared: true }; ok(openNew(P).has('oreroad') && openNew(P).has('minecart') === false, 'a kept save that then clears the High Lines: the Ore Road open, the Deep Rails still wait for the Ore Road'); }
{ /* every level of the campaign: a save at each (its whole needs chain cleared) loses nothing */
  let worst = null, saves = 0;
  for (const l of old) { if (l.hidden) continue; const P0 = cl(...chain(l.id)); if (!Object.keys(P0).length) continue; saves++;
    const lost = [...openOld(P0)].filter(id => !openNew(migRun(clone(P0), true)).has(id)); if (lost.length && !worst) worst = l.id + ' loses ' + lost.join(','); }
  ok(!worst, 'a save at each of ' + saves + ' levels keeps every level it had open' + (worst ? ' - ' + worst : '')); }

/* ---- FIVE SLOTS ---- */
{ class Fake { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } }
  const st = new Fake(), key = i => 'bracken.progress.' + i, slots = CASES.slice(0, 5).map(c => c[1]);
  slots.forEach((P, i) => st.setItem(key(i), JSON.stringify(P)));
  const load = i => { const P = migRun(JSON.parse(st.getItem(key(i))), true); st.setItem(key(i), JSON.stringify(P)); return P; };   /* loadSlot: read, progDefaults, saveProgress */
  const before = [0, 1, 2, 3, 4].map(i => st.getItem(key(i)));
  const P2 = load(2), after = [0, 1, 2, 3, 4].map(i => st.getItem(key(i)));
  ok(after.every((t, i) => i === 2 || t === before[i]), 'FIVE SLOTS: loading slot 3 leaves the other four byte-identical');
  ok(P2.roadOpen && P2.roadOpen.oreroad === 1 && P2.roadMig.highlines === 1, 'FIVE SLOTS: slot 3 (the Sky Road done) was migrated');
  const all = [0, 1, 3, 4].map(load);
  ok(all.every((P, j) => P.roadMig && P.roadMig.highlines === 1), 'FIVE SLOTS: every slot is migrated by its own load (not by another slot)');
  ok(all[0].roadOpen === undefined && all[1].roadOpen === undefined, 'FIVE SLOTS: the fresh slot and the pre-Sky-Road slot keep nothing open (they walk the High Lines)');
  ok(all[2].roadOpen.oreroad === 1 && all[3].roadOpen.oreroad === 1, 'FIVE SLOTS: the Ore Road is kept in the Ore-Road-played slot and the past-Ore-Road slot');
  const once = [0, 1, 2, 3, 4].map(i => st.getItem(key(i))); [0, 1, 2, 3, 4].forEach(load);
  ok([0, 1, 2, 3, 4].every(i => st.getItem(key(i)) === once[i]), 'FIVE SLOTS: a second pass over all five changes nothing'); }

/* ---- THE ROWS ---- */
{ const tier = /TIER\.highlines = ([\d.]+); TIER_BOSS\.highlines = ([\d.]+);/.exec(main), row = /const TIER = \{([^}]*)\}/.exec(main)[1], pick = id => +new RegExp('\\b' + id + ': ([\\d.]+)').exec(row)[1];
  ok(tier && +tier[1] >= pick('skyroad') && +tier[1] <= pick('oreroad') && +tier[2] >= pick('skyroad'), 'TIER / TIER_BOSS rows: ' + (tier && tier[1]) + ' between the Sky Road (' + pick('skyroad') + ') and the Ore Road (' + pick('oreroad') + ')');
  ok(/const EHP = \{ hookjack: HKJ\.hp,/.test(main), 'the EHP row for the Hookjack (HK.hp)');
  const { ACTS } = await import('../src/foe-react.js'); const act = ACTS.find(a => a.levels.includes('highlines')); ok(act && act.name === 'THE CRAGS' && act.levels.indexOf('highlines') === act.levels.indexOf('skyroad') + 1, 'the act row: THE CRAGS, after the Sky Road');
  const { kindOf } = await import('../src/exit-gates.js'); ok(kindOf('highlines') === 'mine', 'the exit gate: the lift cage (mine)');
  const { regionOfLevel } = await import('../src/title-region.js'); ok(regionOfLevel(LEVELS, 'highlines') === 'crag', 'the title region walks up the gate chain to the crags'); }

/* ---- THE BESTIARY ---- */
{ const body = main.slice(main.indexOf('const BEASTS = ['), main.indexOf('\n];', main.indexOf('const BEASTS = ['))), subs = [], descs = [];
  for (const m of body.matchAll(/sub: '((?:[^'\\]|\\.)*)'/g)) subs.push(m[1].length); for (const m of body.matchAll(/desc: '((?:[^'\\]|\\.)*)'/g)) descs.push(m[1].length); for (const m of body.matchAll(/desc: "((?:[^"\\]|\\.)*)"/g)) descs.push(m[1].length);
  descs.sort((a, b) => a - b); const p95 = descs[Math.floor(descs.length * 0.95)], maxSub = Math.max(...subs);
  const cards = [...main.matchAll(/\{ t: '(hookjack|skyhook)', name: '([^']*)', sub: '([^']*)', desc: (["'])((?:(?!\4)[^\\]|\\.)*)\4 \}/g)];
  ok(cards.length === 2, 'two cards: ' + cards.map(c => c[1]).join(', '));
  for (const c of cards) { ok(c[3].length <= maxSub, c[1] + ': the line under the name is ' + c[3].length + ' chars (the longest neighbour has ' + maxSub + ')'); ok(c[5].length <= p95, c[1] + ': the text is ' + c[5].length + ' chars (the neighbours\' 95th percentile is ' + p95 + ', ' + descs.length + ' cards)'); ok(c[2] === c[2].toUpperCase() && c[2].length <= 14, c[1] + ': the name ' + c[2]); } }
{ const A = await import('../src/redraw/line_crew_art.js'), px = await import('../src/px.js'), S = A.bakeLineCrewCards(px.canvas, px.flipX, px.whiten);
  const bbox = c => { const d = c._d || c._buf, w = c.width; let n2 = 0, x0 = 1e9, y1 = -1; for (let i = 0; i < c.width * c.height; i++) if (d[i * 4 + 3] > 0) { n2++; x0 = Math.min(x0, i % w); y1 = Math.max(y1, (i / w) | 0); } return { n2, y1 }; };
  for (const [k, s] of Object.entries(S)) {
    ok(s.R.length >= 2 && s.L.length === s.R.length && s.white.R.length === s.R.length && s.white.L.length === s.R.length, k + ': frames, mirrored frames and white frames agree (' + s.R.length + ')');
    ok(s.R.every(c => bbox(c).n2 > 150), k + ': every frame has pixels (a blank card would pass silently otherwise)');
    ok(s.w > 26 && s.h <= 52 && s.ay <= s.h && s.ax <= s.w, k + ': ' + s.w + 'x' + s.h + ' is drawn x1 by the page (width > 26) and fits its 46-px box with the feet at ' + s.ay);
    ok(s.R.every(c => bbox(c).y1 <= s.ay + 2), k + ': nothing is drawn more than a boot sole (2 px) below the feet line'); }
  ok(Object.keys(S).join() === 'hookjackCard,skyhookCard', 'the keys the page reads: SPR.hookjackCard, SPR.skyhookCard'); }
console.log('THE HIGH LINES ROAD (flag on): ' + n + ' checks so far');
