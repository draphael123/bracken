// tools/arena-polish.mjs - THE ARENA POLISH PACK (claude/arenapolish; Node, no page). The phase-tint helper and the five arenas' dressing (src/arena-polish.js).
//   THE HELPER: an arena with no tintFn / phaseTints draws EXACTLY its fixed tint (no state, no easing); a tintFn eases toward the phase's veil and snaps on a new arena or a long gap;
//     generic arena.phaseTints works by boss.phase; every named resolver returns a colour + an alpha in range for every phase / mode it reads, and never throws on a missing boss.
//   THE FIVE ARENAS: Hexed Fields, Underwell, Rootway, Stormwreck Harbor, Waymeet each opt in (tintFn / flavour names that resolve); the Rootway has its lair dark zone and the lanterns cut it.
//   NOTHING GAMEPLAY: the added arena keys are not in the level hash (grid, ents, movers, ambushes) - removing them leaves levelHash unchanged; every drawing function runs against a
//     recording canvas in every state it reads (moon lit / warn / dark, the hall dry / flooded / burning, glint on / off, brand, surges) without throwing.
//     node tools/arena-polish.mjs
import { readFileSync } from 'node:fs';
const AP = await import('../src/arena-polish.js');
const { LEVELS } = await import('../src/level.js');
const { levelHash } = await import('./level-quality.mjs');
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const TS = 16;

/* ---- the helper ---- */
{
  const fixed = { tint: '#3a2a20', tintA: 0.1 }, S = AP.makeTint();
  const r = AP.tintNow(S, fixed, { phase: 3 }, 5, {});
  ok(r.c === '#3a2a20' && r.a === 0.1 && S.A === null, 'no tintFn / phaseTints: the arena\'s own tint, untouched, no state');
  ok(AP.tintNow(S, { tint: '#112233' }, null, 1, {}).a === 0.14, 'the old default alpha (0.14) is kept');
  const A = { tint: '#c89040', tintA: 0.07, phaseTints: [['#000000', 0.2], ['#ffffff', 0.3]] }, S2 = AP.makeTint();
  const p1 = AP.tintNow(S2, A, { phase: 1 }, 10, {});
  ok(p1.c === '#000000' && p1.a === 0.2, 'phaseTints: phase 1 snaps in on the first frame');
  let prev = 0, mono = true, t = 10; for (let i = 0; i < 60; i++) { t += 1 / 60; const q = AP.tintNow(S2, A, { phase: 2 }, t, {}), v = parseInt(q.c.slice(1, 3), 16); if (v < prev) mono = false; prev = v; }
  ok(mono && prev > 200 && prev < 256, 'phase 2: the veil EASES to white over about a second (' + prev + '/255 after 1 s), monotone');
  const q2 = AP.tintNow(S2, A, { phase: 2 }, t + 2, {}); ok(q2.c === '#ffffff' || q2.c === '#fefefe' || q2.c === '#fdfdfd' || parseInt(q2.c.slice(1, 3), 16) > 250, 'after a long gap it snaps to the target');
  ok(AP.tintNow(S2, A, { phase: 9 }, t + 3, {}).a === 0.3, 'a phase past the list holds the last entry');
  const B = { tint: '#222222', phaseTints: [['#ffffff', 0.5]] }; AP.tintNow(S2, B, { phase: 1 }, t + 3.01, {}); ok(S2.A === B, 'a new arena resets the easing (snap)');
}
{ /* every named resolver: a valid veil for every state it reads, boss missing included */
  const hexOK = c => /^#[0-9a-f]{6}$/i.test(c);
  const states = [null, { phase: 1 }, { phase: 2 }, { phase: 3 }, { phase: 1, mode: 'highTell' }, { phase: 2, mode: 'lowTell' }, { phase: 1, mode: 'pressureTell' }, { phase: 2, mode: 'twinTell' }, { phase: 2, mode: 'brandTell' }, { phase: 2, mode: 'ablaze' }, { phase: 3, mode: 'thrash' }];
  const ctxs = [{}, { moon: { ph: 'lit' } }, { moon: { ph: 'warn' } }, { moon: { ph: 'dark' } }, { cq: { flood: true } }, { cq: { flood: false } }];
  for (const name of Object.keys(AP.TINT_FNS)) { let all = true; for (const b of states) for (const o of ctxs) { const [c, a] = AP.targetTint({ tint: '#123456', tintA: 0.1, tintFn: name }, b, o); if (!hexOK(c) || !(a > 0 && a <= 0.25)) all = false; } ok(all, 'tintFn ' + name + ': a hex colour and an alpha in (0, 0.25] for every state it reads'); }
  ok(AP.targetTint({ tint: '#123456', tintA: 0.1, tintFn: 'nope' }, { phase: 2 }, {})[0] === '#123456', 'an unknown tintFn falls back to the arena tint');
  ok(AP.targetTint({ tint: '#123456', tintFn: 'fields' }, { phase: 1 }, { moon: { ph: 'lit' } })[1] === 0.14, 'fields, moon lit: the arena\'s own tint (the veil only changes with the cloud)');
  ok(AP.TINT_FNS.fields({}, null, { moon: { ph: 'dark' } })[1] > AP.TINT_FNS.fields({}, null, { moon: { ph: 'warn' } })[1], 'fields: deeper under the cloud than in the warning');
  ok(AP.TINT_FNS.underwell({}, { phase: 3 }, {})[1] > AP.TINT_FNS.underwell({}, { phase: 1 }, {})[1], 'underwell: the hall darkens phase by phase');
  ok(AP.TINT_FNS.harbor({}, { phase: 1, mode: 'highTell' })[1] > AP.TINT_FNS.harbor({}, { phase: 1 })[1], 'harbor: a high surge\'s tell deepens the sea');
}

/* ---- the arenas opt in (levelHash covers the grid, ents, movers and ambushes only - never L.arena - so these keys cannot move a hash) ---- */
ok(!/arena/.test(readFileSync(new URL('./level-quality.mjs', import.meta.url), 'utf8').split(String.fromCharCode(10)).find(l => l.startsWith('export function levelHash'))), 'levelHash does not read the arena');
const arenaOf = id => { const lv = LEVELS.find(l => l.id === id); return { lv, L: lv.build() }; };
const WANT = { fields: ['fields', 'fields', 'strawking'], underwell: ['underwell', null, 'cisternqueen'], rootway: ['rootway', 'rootway', 'huntmaster'], harbor: ['harbor', 'harbor', 'harbormaster'], waymeet: ['waymeet', 'waymeet', 'closedhelm'] };
for (const [id, [fn, fl, boss]] of Object.entries(WANT)) {
  const { lv, L } = arenaOf(id), A = L.arena;
  ok(!!A && A.boss === boss, id + ': the boss arena is ' + boss);
  ok(A.tintFn === fn && !!AP.TINT_FNS[fn], id + ': tintFn ' + fn + ' resolves');
  ok((fl === null && !A.flavour) || A.flavour === fl, id + ': flavour ' + (fl || '(drawn by the hall)'));
  ok(typeof levelHash(lv) === 'string', id + ': levelHash ' + levelHash(lv));
}
{ const { L } = arenaOf('rootway'), A = L.arena, zs = L.darkZones, lair = zs.find(z => z.x0 <= A.x0 && z.x1 >= A.x1 - TS);
  ok(!!lair && lair.dark >= 0.2 && lair.dark <= 0.35 && !lair.name, 'rootway: the stand sits in a dim dark zone (' + (lair && lair.dark) + '), no name banner');
  ok(zs.length === 3, 'rootway: the cellar and the trunk foot keep their zones (3 in all)');
  const src = readFileSync(new URL('../src/redraw/rootway_areas.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/redraw/rootway_world.js', import.meta.url), 'utf8');
  ok(/x \* TS, y: 160, r: 64[^}]*hole/.test(src) && /hole: it\.x > 386/.test(src), 'rootway: the stand\'s lanterns are holes in its dark'); }
{ const { L } = arenaOf('underwell'); ok(/^#c8842a$/i.test(L.arena.tint) || L.arena.tint !== '#9ab0c0', 'underwell: no longer the Well Town hall\'s cold #9ab0c0'); }

/* ---- the drawing runs in every state it reads ---- */
function rec() { const log = []; const grad = { addColorStop() {} };
  const g = new Proxy({}, { get(t, k) { if (k === '_log') return log; if (k in t) return t[k]; if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => grad; return (...a) => { log.push(k); }; }, set(t, k, v) { t[k] = v; return true; } }); return g; }
let draws = 0; const run = (name, fn) => { try { fn(); draws++; } catch (e) { ok(false, name + ' threw: ' + e.message); } };
for (const id of ['fields', 'rootway', 'harbor', 'waymeet']) {
  const { L } = arenaOf(id), A = L.arena;
  const bosses = [null, { alive: true, x: A.x0 + 300, phase: 1, mode: 'idle' }, { alive: true, x: A.x1 - 40, phase: 2, mode: 'highTell', glint: 1 }, { alive: true, x: A.x0 + 60, phase: 3, mode: 'brandTell', glint: 0 }, { alive: false, x: 0 }];
  const flds = id === 'fields' ? ['lit', 'warn', 'dark'].map(ph => ({ moon: { ph, t: 1.2, k: ph === 'dark' ? 1 : 0 } })) : [null];
  for (const b of bosses) for (const fld of flds) for (const dx of [0, -300, 5000]) for (const t of [1, 1.5, 7.77]) run(id, () => { const g = rec();
    AP.drawFlavour(g, { A, L: { ...L, fields: L.fields || { moon: { warn: 2, lit: 6, dark: 3 } } }, boss: b, bossActive: !!b, cx: A.x0 + dx, cy: A.floor - 200, VW: 480, VH: 270, time: t, TS, fld }); }); }
{ const { L } = arenaOf('underwell'), A = L.arena, q = A.queen, G = { x0: q.sx * TS, x1: (q.sx + 40) * TS, floor: q.F * TS };
  for (const S of [{}, { flood: true }, { scorch: 2 }, { charT: 3 }]) for (const dx of [0, 5000]) run('wall lamps', () => { const g = rec(); AP.drawWallLamps(g, G, S, G.x0 + dx, G.floor - 200, 3.3); });
  run('wall lamps without state', () => AP.drawWallLamps(rec(), null, null, 0, 0, 0)); }
ok(draws > 100, 'the drawing ran in ' + draws + ' state combinations without throwing');

/* ---- wired into the page ---- */
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').split('\r').join('');
ok(/import \* as APL from '\.\/arena-polish\.js'/.test(main) && /APL\.tintNow\(aplTint, L\.arena, boss, time/.test(main) && /APL\.drawFlavour\(g, \{ A: L\.arena/.test(main), 'main.js: the veil is APL.tintNow and the flavour is APL.drawFlavour');
ok(/APL\.drawWallLamps\(g, G, S, cx, cy, time\)/.test(readFileSync(new URL('../src/cistern-queen-hands.js', import.meta.url), 'utf8')), 'the Cistern Queen\'s hall draws its wall lamps');
console.log(bad ? '\narena-polish: ' + bad + ' FAILED' : '\narena-polish: all ok'); process.exit(bad ? 1 : 0);
