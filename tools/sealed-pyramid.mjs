// tools/sealed-pyramid.mjs - THE SEALED PYRAMID and THE SCARAB MOTHER, asked in Node (claude/sealedpyramid; the shape of tools/buried-city.mjs). No page.
//   A  THE ROAD: the level is appended (no index moves), needs 'buriedcity', and says the rule the code does
//   B  THE TOMB IS A MACHINE: every trap's plate stands before its reach on footing, the guards walk inside the reaches, every reach meets the walked route,
//      the inner plates are inside their reach, every use is taught and then used again (ARCS: >= 3 uses past their teach)
//   C  THE LOCKS: the reach model, with each verb's work undone, does not get past it - THE GREAT STONE's false door, the second pit, the weighed counterweight
//   D  THE CAST: one new foe (the mummy), roles >= 3, no type over 35%; four seals for a four-seal vault; silver <= 3; checkpoints one a section, one before her
//   E  THE SCARAB MOTHER (pure, in a fake antechamber): left alone she never opens; every move is told before its blow; a trap on her opens her >= 3 s at
//      >= 1.5x (capped, then the shell's floor) and then a told ward a trap glances off; her shell takes >= 0.4x; one new move a phase; the lure works from
//      both plates (her charge stops in the reach a step from the plate), and her opening is longer than the run to her
//     node tools/sealed-pyramid.mjs
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { slopeReachGrid } from '../src/reach-slopes.js';
import * as SPY from '../src/sealed-pyramid.js';
import * as SMM from '../src/scarab-mother.js';
import { ROLES } from './level-quality.mjs';

let fails = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fails++; console.log('  FAIL ' + m); } else if (process.argv.includes('--v')) console.log('  ok   ' + m); };
const lv = LEVELS.find(l => l.id === 'sealedpyramid'), L = lv.build(), W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H) ? T.SOLID : L.grid[y * W + x];
const stand = t => t === T.SOLID || t === T.ONEWAY;

console.log('== A. the road');
ok(LEVELS[LEVELS.length - 1].id === 'sealedpyramid', 'appended last in LEVELS (no index and no save moves)');
ok(lv.needs === 'buriedcity', 'it needs THE BURIED CITY');
ok(lv.rule === SPY.RULE && /PLATE/.test(SPY.RULE) && /REACH/.test(SPY.RULE), 'its rule line is the one the level and the hands play: ' + SPY.RULE);

console.log('== B. the tomb is a machine');
const R = floodReach(slopeReachGrid(L, T), T, { rides: true });
const onRoute = z => { for (let x = z[0]; x <= z[1]; x++) for (let y = z[2]; y <= z[3]; y++) if (R.seen.has(x + ',' + y)) return true; return false; };
for (const t of L.traps) {
  const [zx0, zx1] = t.zone;
  for (const p of t.plates) { if (!Array.isArray(p)) { ok(L.moversExtra.some(m => m.pyr === p.mover && m.plate), t.id + ': its mover plate is a counterweight drawn pale (' + p.mover + ')'); continue; }
    const [x0, x1, row] = p; ok(x1 < zx0 || x0 > zx1 || row - 1 < t.zone[2] || row - 1 > t.zone[3], t.id + ': its plate ' + x0 + '-' + x1 + ' (row ' + row + ') stands before or over its reach ' + zx0 + '-' + zx1 + ' (rows ' + t.zone[2] + '-' + t.zone[3] + '), not in it');
    let foot = true; for (let x = x0; x <= x1; x++) if (!stand(at(x, row)) || at(x, row - 1) !== T.AIR) foot = false; ok(foot, t.id + ': its plate is footing with air over it (' + x0 + '-' + x1 + ' row ' + row + ')'); }
  for (const [x0, x1] of (t.inner || [])) ok(x0 >= zx0 && x1 <= zx1, t.id + ': its pale stones ' + x0 + '-' + x1 + ' lie inside its reach');
  if (!t.arena && !t.on) ok(onRoute(t.zone), t.id + ': its reach meets the walked route');
  if (['g1block', 'g1darts', 'corr', 'warden'].includes(t.id)) ok(L.ents.some(e => e.inTrap && e.guard && e.x >= zx0 && e.x <= zx1 && e.guard[0] >= zx0 && e.guard[1] <= zx1), t.id + ': a guard walks his beat inside the reach');
}
const kinds = new Set(L.traps.map(t => t.kind)); ok(['block', 'darts', 'stone'].every(k => kinds.has(k)), 'all three traps: ' + [...kinds].join(', '));
for (const [use, a] of Object.entries(SPY.ARCS)) ok(Object.keys(a).length >= 1 && Object.values(a).every(([x0, x1]) => x1 >= x0), 'ARCS.' + use + ': ' + Object.keys(a).join(' > '));
const past = Object.values(SPY.ARCS).reduce((s, a) => s + Object.keys(a).filter(k => k !== 'teach').length, 0); ok(past >= 6, 'the rule is used past its teach >= 6 times (remix >= 3 distinct uses): ' + past);
ok(Object.keys(SPY.ARCS).length >= 4, 'distinct uses of the rule: ' + Object.keys(SPY.ARCS).join(', '));

console.log('== C. the locks (the verb undone, the way shut)');
const goal = (RR, x, y) => { for (let dy = -1; dy <= 0; dy++) if (RR.seen.has(x + ',' + (y + dy))) return true; return false; };
const A = L.arena, trig = [Math.floor(A.trigger / 16), A.floor / 16 - 1];
ok(goal(R, trig[0], trig[1]), 'with the rule worked, the reach model gets to her door (' + trig.join(',') + ')');
{ const L2 = { ...L, falseWalls: [] }; const Rn = floodReach(slopeReachGrid(L2, T), T, { rides: true }); ok(!goal(Rn, 337, SPY.SP.pits - 1), 'THE FALSE DOOR unbroken: nothing past the false tomb (the pits\' floor at 337)'); }
{ const L2 = { ...L, pitFill: L.pitFill.filter(p => p[0] !== 360) }; const Rn = floodReach(slopeReachGrid(L2, T), T, { rides: true }); ok(!goal(Rn, 370, SPY.SP.pits - 1), 'THE SECOND PIT unfilled: no jump crosses it (370)'); }
{ const L2 = { ...L, moversExtra: L.moversExtra.filter(m => m.pyr !== 'cw2b'), rigBands: L.rigBands.filter(b => b[0] !== 214) }; const Rn = floodReach(slopeReachGrid(L2, T), T, { rides: true }); ok(!goal(Rn, 226, SPY.SP.corr - 1), 'THE SECOND COUNTERWEIGHT not weighed: the high corridor is out of reach (226)'); }

console.log('== D. the cast, the key, the shrines');
const foes = L.ents.filter(e => !['sign', 'check', 'stray', 'silver', 'tplate', 'tblock', 'dartwall', 'rollstone', 'sealvault', 'gate', 'coin', 'mend', 'scarabmother'].includes(e.t));
const skin = e => e.cnSkin || e.t, by = {}; for (const e of foes) by[skin(e)] = (by[skin(e)] || 0) + 1;
ok(Object.values(by).every(v => v / foes.length <= 0.35 + 1e-9), 'no type over 35%: ' + JSON.stringify(by) + ' of ' + foes.length);
const roleOf = (t, s) => { const of = k => Object.keys(ROLES).filter(r => ROLES[r].includes(k)); const r = s && of(s).length ? of(s) : of(t); return r.length ? r : ['melee']; };
const roles = new Set(foes.flatMap(e => roleOf(e.t, e.cnSkin))); ok(roles.size >= 3, 'roles >= 3: ' + [...roles].join(', '));
ok(foes.every(e => !/gob/i.test(skin(e))), 'no goblin past the Goblin Queen');
const seals = L.ents.filter(e => e.t === 'stray' && e.kind === 'scarabseal').length; ok(seals === 4 && L.quest.n === 4 && L.vaultDoors[0].seals === 4, 'four scarab seals for THE SEALED TOMB\'s four sockets: ' + seals);
ok(L.ents.filter(e => e.t === 'silver').length <= 3 && !L.ents.some(e => e.t === 'relic'), 'silver <= 3 a level, no relic');
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b); ok(checks.length >= 4 && checks[checks.length - 1] >= A.x0 / 16 - 12, 'a shrine a section and one before her: ' + checks.join(', '));
ok(L.ents.some(e => e.t === 'mummy' && e.elite && e.gate), 'THE TOMB-WARDEN: the exam\'s elite, his gate after him');

console.log('== E. THE SCARAB MOTHER');
{ const { SM } = SMM, Ar = A, G = SMM.geom(Ar, 16);
  const fight = () => { const S = SMM.newFight(G), e = { x: G.x0 + 30 * 16, y: G.floorY, hp: 1000, maxHp: 1000, alive: true, mode: 'wake', modeT: 0.1, face: -1, open: 0 }; return { S, e }; };
  const world = log => ({ hit: (b, d, name, o) => { log.push({ k: 'hit', name, o }); return false; }, number: (x, y, t) => log.push({ k: 'say', t }), mark: m => log.push({ k: 'mark', m }), sound: () => {}, fx: () => {}, shake: () => {}, music: () => {}, pits: () => {}, time: () => 0, rng: () => 0.37 });
  /* left alone for a minute (the hero far off at the door, never treading): never open, and every blow comes after its tell */
  { const { S, e } = fight(), log = []; let open = 0, lastMark = -1, untold = 0, i = 0;
    for (; i < 60 * 60; i++) { const hero = [{ x: G.x0 + 40, y: G.floorY, ground: true, alive: true }]; const n0 = log.length; SMM.stepScarabMother(e, S, 1 / 60, hero, world(log)); if (SMM.smOpen(e)) open++;
      for (let k = n0; k < log.length; k++) { if (log[k].k === 'mark') lastMark = i; if (log[k].k === 'hit' && !/BROOD|BURNING/.test(log[k].name) && (i - lastMark) > 60 * 3) untold++; } }
    ok(open === 0, 'left alone for a minute she never opens (B13: no timer opening)');
    ok(untold === 0, 'every blow of hers comes inside 3 s of a told mark (sound + word + colour)');
    ok(Object.keys(S.n.moves).length >= 3, 'phase one shows three told moves: ' + Object.keys(S.n.moves).join(', ')); }
  /* the opening: a trap lands on her -> open >= 3 s, then a told ward a trap glances off */
  { const { S, e } = fight(), log = []; e.mode = 'recover'; e.modeT = 1; const r = SMM.trapped(e, S, world(log), 'block');
    ok(r === 'open' && SMM.smOpen(e) && e.open >= 3, 'a block landing on her opens her for >= 3 s: ' + r + ' ' + e.open);
    ok(SM.openMul >= 1.5 && SM.openMul <= 2 && SM.openCap > 0, 'the opening pays x' + SM.openMul + ' (B15: 1.5-2), capped at ' + SM.openCap + ' of her');
    let t = 0; const hero = [{ x: G.x0 + 60, y: G.floorY, ground: true, alive: true }]; while (SMM.smOpen(e) && t < 10) { SMM.stepScarabMother(e, S, 1 / 60, hero, world(log)); t += 1 / 60; }
    ok(S.ward > 2.5 && log.some(q => q.k === 'say' && /WARDED/.test(q.t)), 'when it ends she shuts her shell: a told ward (' + S.ward.toFixed(1) + ' s)');
    const r2 = SMM.trapped(e, S, world(log), 'darts'); ok(r2 === 'ward' && !SMM.smOpen(e), 'a trap in her ward glances off (B3: no chain-lock): ' + r2); }
  ok(SM.resist >= 0.4 && SM.wardMul >= 0.4, 'her shell takes >= 0.4x outside her openings (B15), her ward ' + SM.wardMul);
  /* one new move a phase */
  { const mv = ph => new Set(SMM.CYCLES[ph].flat()); const p1 = mv(1), p2 = mv(2), p3 = mv(3), add2 = [...p2].filter(m => !p1.has(m)), add3 = [...p3].filter(m => !p2.has(m));
    ok(add2.length === 1 && add3.length === 1, 'one new move a phase (B5): phase two ' + add2 + ', phase three ' + add3); }
  /* B12: the lure - from each plate's far side her charge stops in its reach, a step from the plate; her opening outlasts the run to her */
  for (const kind of ['block', 'darts']) { const T0 = G[kind], from = T0.lure, dir = kind === 'block' ? 1 : -1, stop = from - dir * SM.short;
    ok(SMM.inReach(G, kind, stop), 'the lure (' + kind + '): waiting at ' + Math.round((from - G.x0) / 16) + ', her charge from the ' + (dir > 0 ? 'west' : 'east') + ' stops in the reach (' + Math.round((stop - G.x0) / 16) + ')');
    const run = Math.max(0, Math.abs((T0.plate[0] + T0.plate[1]) / 2 - stop) - 30) / 92; ok(run + 0.6 < SM.openT, 'from the plate to her is ' + run.toFixed(2) + ' s at a walk - inside her ' + SM.openT + ' s opening'); }
  ok(SM.skid > 0.5 + 0.28, 'she skids long enough (' + SM.skid + ' s) for a step onto the plate and the block\'s fall'); }

console.log('== F. THE SECOND HALF (claude/pyramidlevel: the tombs, the gas, the oil, the sluices, THE KING\'S STAIR, the arena slots)');
{ const SPT = await import('../src/sealed-pyramid-tombs.js'), { MINI_SLOT: MS, BOSS_SLOT: BS, ARCS2 } = SPT;
  /* every hazard is the plate rule: each kind has its own traps, plate before the reach (B above), taught > tested > examined */
  const byKind = k => L.traps.filter(t => t.kind === k);
  ok(byKind('gas').length >= 3 && byKind('oil').length >= 3 && byKind('flood').length >= 2, 'the hazards are plate traps: gas ' + byKind('gas').length + ', oil ' + byKind('oil').length + ', flood ' + byKind('flood').length);
  for (const k of ['rise', 'gas', 'burn', 'flood', 'climb']) ok(ARCS2[k] && ARCS2[k].teach && ARCS2[k].exam && Object.keys(ARCS2[k]).length >= 3, 'ARCS2.' + k + ' is taught, used again and examined: ' + Object.keys(ARCS2[k] || {}).join(' > '));
  /* each hazard section's EXAM: one elite on footing, a hazard's reach under him (v2: the weighty foe with the hazard behind) */
  for (const k of ['rise', 'gas', 'burn', 'flood']) { const [x0, x1] = ARCS2[k].exam, el = L.ents.find(e => e.elite && e.x >= x0 - 2 && e.x <= x1 + 2);
    const hz = el && L.traps.find(t => !t.arena && el.x >= t.zone[0] && el.x <= t.zone[1] && el.y >= t.zone[2] - 1 && el.y <= t.zone[3] + 1);
    ok(!!el && stand(at(el.x, el.y + 1)), 'the ' + k + ' exam: an elite on footing (' + (el ? (el.cnSkin || el.t) + ' at ' + el.x + ',' + el.y : 'none') + ')');
    ok(!!hz, 'the ' + k + ' exam: he stands in a trap\'s reach (' + (hz ? hz.id + ' ' + hz.kind : 'none') + ')'); }
  /* THE TOMBS: each holds exactly its one dead (the ent waits: tombWait), standing on footing at the tomb; a mummy's tomb a mummy, a guard's the tomb guard */
  for (const tb of L.tombs) { const es = L.ents.filter(e => e.tombWait === tb.id), e = es[0];
    ok(es.length === 1 && e.t === 'mummy' && (tb.kind === 'skel') === (e.cnSkin === 'tombskel') && Math.abs(e.x - tb.x) <= 1 && e.y === tb.row - 1 && stand(at(e.x, tb.row)), 'tomb ' + tb.id + ': one ' + (tb.kind === 'skel' ? 'tomb guard' : 'mummy') + ' waits in it on footing');
    ok(tb.wake[0] <= tb.x && tb.wake[1] >= tb.x - 2, 'tomb ' + tb.id + ': it wakes when you come to it (' + tb.wake.join('-') + ')'); }
  ok(L.tombs.length >= 12 && L.tombs.filter(t => t.kind === 'skel').length >= 5, 'the dead come from tombs: ' + L.tombs.length + ' tombs, ' + L.tombs.filter(t => t.kind === 'skel').length + ' of them the tomb guard\'s');
  ok(!L.ents.some(e => e.cnSkin === 'tombskel' && e.t !== 'mummy'), 'the tomb guard is the mummy\'s machine (A9: still one new foe)');
  /* THE SLUICES ARE THE LOCKS: without their water nothing gets past the cistern's lip or up to the crypt's high door; with it, the gate */
  const gate = L.ents.find(e => e.t === 'gate'); ok(gate && gate.x === BS.gate && goal(R, gate.x, gate.y), 'with the rule worked the reach model gets to the level\'s gate past the burial chamber (' + (gate ? gate.x + ',' + gate.y : '-') + ')');
  { const L2 = { ...L, pools: L.pools.filter(p => p.id !== 'flood1') }; const Rn = floodReach(slopeReachGrid(L2, T), T, { rides: true }); ok(!goal(Rn, 882, 41), 'THE CISTERN unflooded: its lip is out of reach (882,41)'); }
  { const L2 = { ...L, pools: L.pools.filter(p => p.id !== 'flood2') }; const Rn = floodReach(slopeReachGrid(L2, T), T, { rides: true }); ok(!goal(Rn, 955, 29), 'THE CRYPT unflooded: its high door is out of reach (955,29)'); }
  for (const t of byKind('flood')) { const p = L.pools.find(q => q.id === t.pool); ok(p && p.swim && p.bottom === t.low * 16 && p.y < t.high * 16 + 16, t.id + ': its pool is built at its high mark (the reach model swims it) and the hands drain it to ' + t.low + ' until the plate'); }
  /* THE KING'S STAIR (A14): courses over the scarab well, some of them give, the plate-course fires the volley over the last run */
  const well = []; for (let x = 963; x <= 999; x++) if (at(x, SPT.TH.stair) === T.SPIKE) well.push(x);
  ok(well.length >= 30 && L.crumble.length >= 3, 'THE KING\'S STAIR: a scarab well ' + well.length + ' wide under the courses, ' + L.crumble.length + ' of them give (A14)');
  ok(L.traps.some(t => t.id === 'stairDarts' && t.plates.some(p => Array.isArray(p) && p[0] >= 980)), 'THE KING\'S STAIR: its plate-course fires the volley over the last run');
  /* THE SLOTS (lane B): her lair mid-level (its east door is the arena's wallR, she wakes only inside it), the burial chamber carved at the end with its fittings */
  ok(A.wallR === MS.eastDoor.col && A.until === (MS.sx + MS.W) * 16, 'MINI_SLOT: her east door is the arena\'s east wall (' + A.wallR + ') and she wakes only inside her room');
  { let open = true; for (let y = MS.eastDoor.y0; y <= MS.eastDoor.y1; y++) if (at(MS.eastDoor.col, y) !== T.AIR) open = false; ok(open, 'MINI_SLOT: her east door is cut (' + MS.eastDoor.col + ', rows ' + MS.eastDoor.y0 + '-' + MS.eastDoor.y1 + ')'); }
  { let air = 0, all = 0; for (let x = BS.x0; x <= BS.x1; x++) for (let y = BS.roof; y < BS.floor; y++) { all++; if (at(x, y) === T.AIR || at(x, y) === T.ONEWAY) air++; }
    ok(air === all && BS.ledges.every(l => at(l.x0, l.y) === T.ONEWAY) && L.ents.some(e => e.t === 'check' && e.x === BS.check), 'BOSS_SLOT: the burial chamber is carved ' + (BS.x1 - BS.x0 + 1) + 'x' + (BS.floor - BS.roof) + ', its two ledges, a shrine before it'); }
  ok(L.routePastBoss === true, 'L.routePastBoss: the road goes on past her lair (lane B drops it when she is L.mini)');
  /* shrines: one a section, spaced (A10b) */
  const cps = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b), gaps = cps.slice(1).map((x, i) => x - cps[i]);
  ok(gaps.filter((g, i) => cps[i] >= 440).every(g => g >= 90), 'the second half\'s shrines stand >= 90 columns apart: ' + cps.join(', ')); }

console.log('\n' + (fails ? fails + ' FAIL of ' + n : 'ok  sealed-pyramid: ' + n + ' checks'));
process.exit(fails ? 1 : 0);
