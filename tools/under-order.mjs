// tools/under-order.mjs - THE ROAD ORDER A PLAYER SEES FOLLOWS THE GATE CHAIN. NODE-ONLY (no page, no port, no Chrome).
//   claude/underorder (Daniel 10-24) built it for Kingswood -> Scree -> UNDERLEAF -> Hanging; claude/underleaf4 (Daniel 10-25 08:00) MOVED UNDERLEAF AGAIN, into act I:
//   Sporewood -> THE ROOTWAY -> UNDERLEAF -> THE PALISADE WOOD -> KINGSWOOD (act I ends) ; THE SCREE PATH -> THE HANGING VILLAGE (act II opens).
//   LEVELS is an APPEND LOG (saves and the map count by index), so the array position of a level says nothing about where it sits on the road.
//   This asserts that everything a player sees agrees with the gate chain instead:
//   1. the gate chain, campaign-order's road and depths: rootway > underleaf > palisadewood > kings > scree > hanging, depths one apart;
//   2. the map: NODES lists them in that order (Underleaf on the WOOD sheet now), and the road PATH meets them in that order;
//   3. WIN ROUTING: the next wood after a win (partyNextLevel's walk of NODES) is the next level on the chain;
//   4. THE ACT: Underleaf is in act I straight after the Rootway; act I ends at Kingswood; act II opens at the Scree Path; actOfLevel agrees;
//   5. every non-spur road node reads in the same sequence as the chain's road (no node out of chain order);
//   6. OLD SAVES: the one-time migration lines in src/main.js are run as written against old-save shapes (see SAVES below).
// usage: node tools/under-order.mjs      Exit 1 on any red row.
import fs from 'node:fs';
import vm from 'node:vm';
import { LEVELS } from '../src/level.js';
import { chainOf, depthsOf, gateOf } from '../src/campaign-order.js';
import { ACTS } from '../src/foe-react.js';
import { actOfLevel } from '../src/act-cards.js';
const rows = []; const ok = (n, p, w = '') => { rows.push(!!p); console.log((p ? 'ok   ' : 'FAIL ') + n + (p ? '' : '   ' + w)); };
const lf = u => fs.readFileSync(new URL(u, import.meta.url), 'utf8').split(String.fromCharCode(13)).join('');
const main = lf('../src/main.js');

/* 1. the chain */
const idx = id => LEVELS.findIndex(l => l.id === id), by = Object.fromEntries(LEVELS.map(l => [l.id, l]));
const WALK = ['rootway', 'underleaf', 'palisadewood', 'kings', 'scree', 'hanging'];
ok('gates: underleaf needs rootway, palisadewood needs underleaf, kings needs palisadewood, scree needs kings, hanging needs scree',
  gateOf(by.underleaf) === 'rootway' && gateOf(by.palisadewood) === 'underleaf' && gateOf(by.kings) === 'palisadewood' && gateOf(by.scree) === 'kings' && gateOf(by.hanging) === 'scree', WALK.map(i => i + '<-' + gateOf(by[i])).join(' '));
ok('Underleaf is no secret (no needsTime / hidden)', !by.underleaf.needsTime && !by.underleaf.hidden && !by.underleaf.secret);
const C = chainOf(LEVELS.filter(l => !l.hidden || l.secret)), D = depthsOf(LEVELS.filter(l => !l.hidden || l.secret));
const at = WALK.map(i => C.road.indexOf(i));
ok('chain road: rootway > underleaf > palisadewood > kings > scree > hanging, one step apart', at.every((v, k) => v >= 0 && (k === 0 || v === at[k - 1] + 1)), at.join(','));
ok('depths run one apart down the road', WALK.every((i, k) => k === 0 || D[i] === D[WALK[k - 1]] + 1), WALK.map(i => D[i]).join(','));
ok('the ARRAY order is NOT the road (the append log is kept: underleaf is still far after hanging)', idx('underleaf') > idx('hanging'), 'underleaf ' + idx('underleaf') + ' hanging ' + idx('hanging'));

/* 2. the map */
const ctx = vm.createContext({ LEVELS });
vm.runInContext(main.slice(main.indexOf('const MAPW ='), main.indexOf('const MAPC =')) + '\nglobalThis.route = { NODES, PATH, NODE_AT, WOOD_NODES, CRAG_NODES };', ctx);
const { NODES, NODE_AT, WOOD_NODES, CRAG_NODES } = ctx.route;
const ni = id => NODES.findIndex(n => n.id === id), wi = id => WOOD_NODES.findIndex(n => n.id === id);
ok('map: NODES lists ' + WALK.join(', ') + ' in that order', WALK.every((i, k) => ni(i) >= 0 && (k === 0 || ni(i) > ni(WALK[k - 1]))), WALK.map(ni).join(','));
ok('map: Underleaf is a WOOD-sheet node between the Rootway and the Palisade Wood, not a crag one', !CRAG_NODES.some(n => n.id === 'underleaf') && wi('underleaf') === wi('rootway') + 1 && wi('palisadewood') === wi('underleaf') + 1);
ok('map: nothing sits between them (Rootway, Underleaf, Palisade Wood are neighbours in NODES)', ni('underleaf') === ni('rootway') + 1 && ni('palisadewood') === ni('underleaf') + 1);
ok('map: the node is on the right level (its index is the append-log index of Underleaf)', NODES[ni('underleaf')].level === idx('underleaf'));
ok('map: the road PATH meets them in order (NODE_AT rises)', WALK.every((i, k) => k === 0 || NODE_AT[ni(i)] > NODE_AT[ni(WALK[k - 1])]), WALK.map(i => NODE_AT[ni(i)]).join(','));

/* 5. every non-spur level node reads in chain order */
{ const seq = NODES.filter(n => n.kind === 'level' && !n.spur && !n.ghost && C.road.includes(LEVELS[n.level].id)).map(n => LEVELS[n.level].id);
  const pos = seq.map(i => C.road.indexOf(i)); const bad = []; for (let k = 1; k < pos.length; k++) if (pos[k] < pos[k - 1]) bad.push(seq[k - 1] + ' before ' + seq[k]);
  ok('map: all ' + seq.length + ' road nodes read in the gate chain order', !bad.length, bad.join('; ')); }

/* 3. WIN ROUTING: the walk partyNextLevel makes (first level node after this one that is not a spur / ghost / hidden) */
const nextOf = id => { const i = ni(id); for (let j = i + 1; j < NODES.length; j++) { const n = NODES[j]; if (n.kind !== 'level' || n.spur || n.ghost || (LEVELS[n.level] && LEVELS[n.level].hidden)) continue; return LEVELS[n.level].id; } return null; };
for (let k = 0; k < WALK.length - 1; k++) ok('after ' + WALK[k] + ', the next wood is ' + WALK[k + 1], nextOf(WALK[k]) === WALK[k + 1], nextOf(WALK[k]));
ok('the source still routes a win through the NODES walk (partyNextLevel), not LEVELS[i + 1]', /function partyNextLevel[\s\S]{0,900}for \(let j = i < 0 \? NODES\.length : i \+ 1; j < NODES\.length; j\+\+\)/.test(main) && !/function partyNextLevel[\s\S]{0,900}levelIndex \+ 1/.test(main));

/* 4. THE ACT */
const a1 = ACTS[0], a2 = ACTS[1];
ok('act I (THE GREENWOOD) holds Underleaf straight after the Rootway, and ends at Kingswood', a1.levels.indexOf('rootway') >= 0 && a1.levels.indexOf('underleaf') === a1.levels.indexOf('rootway') + 1 && a1.levels[a1.levels.length - 1] === 'kings', a1.levels.join());
ok('act II (THE CRAGS) opens with scree, hanging, and holds no Underleaf', a2.levels[0] === 'scree' && a2.levels[1] === 'hanging' && !a2.levels.includes('underleaf'), a2.levels.join());
ok('actOfLevel (the act card) says act I for Underleaf and Kingswood, act II for the Scree Path', actOfLevel('underleaf').act === 1 && actOfLevel('kings').act === 1 && actOfLevel('scree').act === 2);
ok('no level is in two acts', (() => { const s = new Set(); for (const a of ACTS) for (const l of a.levels) { if (s.has(l)) return false; s.add(l); } return true; })());

/* 6. MIGRATION. The lines in src/main.js are run as written (10-25's, then 10-24's, the order progDefaults runs them) against old-save shapes; `open` is levelLocked's needs arithmetic. */
const mig4 = (/if \(!PROG\.underleaf4Mig\) \{[^\n]*\}/.exec(main) || [])[0], mig3 = (/if \(!PROG\.underOrderMig\) \{[^\n]*\}/.exec(main) || [])[0];
ok('src/main.js carries the one-time migration (PROG.underleaf4Mig -> PROG.palisadeOpen / PROG.underleafOpen)', !!mig4);
ok('levelLocked honours PROG.palisadeOpen and PROG.underleafOpen', /lv\.id === 'palisadewood' && PROG\.palisadeOpen/.test(main) && /lv\.id === 'underleaf' && PROG\.underleafOpen/.test(main));
const open = (P, id) => { const lv = by[id], cl = k => !!(P[k] && P[k].cleared); return !(lv.needs && !cl(lv.needs) && !cl(id) && !(id === 'hanging' && P.hangingOpen) && !(id === 'kings' && P.kingsOpen) && !(id === 'palisadewood' && P.palisadeOpen) && !(id === 'underleaf' && P.underleafOpen)); };
const load = P => { vm.runInNewContext((mig4 || '') + '\n' + (mig3 || ''), { PROG: P }); return P; };
const IDS = ['underleaf', 'palisadewood', 'kings', 'scree', 'hanging'];
const SAVES = [
  ['cleared the Rootway only (sat at the Palisade Wood)', { rootway: { cleared: 1 }, kingsOpen: 1 }, { underleaf: 1, palisadewood: 1, kings: 1, scree: 0, hanging: 0 }],
  ['cleared the Palisade Wood (sat at Kingswood)', { rootway: { cleared: 1 }, palisadewood: { cleared: 1 } }, { underleaf: 1, palisadewood: 1, kings: 1, scree: 0, hanging: 0 }],
  ['cleared Kingswood + Scree, never Underleaf (the 10-24 road: sat at Underleaf)', { rootway: { cleared: 1 }, palisadewood: { cleared: 1 }, kings: { cleared: 1 }, scree: { cleared: 1 }, underOrderMig: 1, hangingOpen: 1 }, { underleaf: 1, palisadewood: 1, kings: 1, scree: 1, hanging: 1 }],
  ['cleared Underleaf on the 10-24 road', { rootway: { cleared: 1 }, palisadewood: { cleared: 1 }, kings: { cleared: 1 }, scree: { cleared: 1 }, underleaf: { cleared: 1 }, underOrderMig: 1 }, { underleaf: 1, palisadewood: 1, kings: 1, scree: 1, hanging: 1 }],
  ['a FRESH save that clears the Rootway after the change (not grandfathered)', null, { underleaf: 1, palisadewood: 0, kings: 0, scree: 0, hanging: 0 }],
];
for (const [name, p, want] of SAVES) {
  const P = p ? load(JSON.parse(JSON.stringify(p))) : load({ spore: { cleared: 1 } });
  if (!p) P.rootway = { cleared: 1 };   /* migrated first (nothing past Sporewood yet), THEN the player clears the Rootway on the new road */
  const got = Object.fromEntries(IDS.map(i => [i, +open(P, i)]));
  ok('save: ' + name + ' -> ' + JSON.stringify(got), JSON.stringify(got) === JSON.stringify(want), 'want ' + JSON.stringify(want));
}
{ const P = load({ rootway: { cleared: 1 }, underleaf: { cleared: 1 } }); ok('a save with Underleaf cleared keeps it cleared (the migration never touches a clear)', P.underleaf.cleared === 1); }
{ const P = load({}); ok('a brand-new save is NOT grandfathered (palisadeOpen / underleafOpen unset)', !P.palisadeOpen && !P.underleafOpen && P.underleaf4Mig === 1); }

const bad = rows.filter(p => !p).length;
console.log(bad ? 'under-order: ' + bad + ' red row(s)' : 'under-order: all ' + rows.length + ' green');
process.exit(bad ? 1 : 0);
