// tools/academy.mjs - THE MAGE ACADEMY and THE HEADMISTRESS (claude/academy, the opus greybox; Node only, no page).
//   node tools/academy.mjs             runs BOTH halves, one process after the other (the flag is read when src/level.js is imported):
//     FLAG OFF (this process)          ACADEMY_SHIPS false and no ?ac: LEVELS, THE WITCHLIGHT STAIR and THE MAGE'S FOLLY are master's (the same signature as master 067c6de7e),
//                                      the old-save rule does nothing (run over fake saves), every main.js hook is guarded
//     FLAG ON  (a child: --on)         the road (Stair > Academy > Folly, appended; src/route-insert.js's rule with the Academy's own row), old saves keep the Folly, the
//                                      build (six sections, START + 2 shrines, no filler), the fill reaches every shrine, silver, lectern and the boss; THE HANDS in a fake
//                                      world with a small copy of the game's arc (src/hero-move.js numbers): a lectern teaches, leaving the room forgets; LEVITATION lifts a
//                                      jump over every climb the rooms ask; BLINK passes a rail and never stone; CONJURE STEP chains over the summoning well; the pits file
//                                      you back; the runes' shutters; THE SPELLBOOK FLOCK (gather, stream, scattered); the reset.
//                                      THE HEADMISTRESS END TO END: a bot sits the exam with her real moves - every lesson answered, the finale's calls, the win.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ON = process.argv.includes('--on');
if (ON) globalThis.__AC = true;
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const { acOn, ACADEMY_SHIPS, AC_INSERT } = await import('../src/ac-flag.js');
const RI = await import('../src/route-insert.js');
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');
const h = v => createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 16);
const mig = /if \(acOn\(\)\) roadMigrate\(PROG, AC_INSERT\);/.exec(main);
const migRun = (PROG, on) => { if (on) RI.roadMigrate(PROG, AC_INSERT); return PROG; };   /* the line in progDefaults, as a function of the flag */

/* SHIPPED STATE (11-10, claude/batch157): all four night areas are live together, so the "this area alone, flag off = master" half only runs while its constant is false;
   with it true the process asserts the shipped state instead and the child (--on) checks the area on the road */
const OFF = !ACADEMY_SHIPS;
if (!ON) {
  console.log('== THE MAGE ACADEMY, FLAG OFF (ACADEMY_SHIPS = ' + ACADEMY_SHIPS + ')');
  if (OFF) ok(!ACADEMY_SHIPS && !acOn(), 'the ship flag is off and nothing turns it on here');
  else ok(ACADEMY_SHIPS && acOn() && LEVELS.some(l => l.id === 'academy'), 'SHIPPED: the ship flag is true and the LEVELS row is there (all four night areas live together)');
  if (OFF) ok(!LEVELS.some(l => l.id === 'academy'), 'no LEVELS row');
  if (OFF) ok(LEVELS.find(l => l.id === 'mage').needs === 'witchlight', "THE MAGE'S FOLLY still needs THE WITCHLIGHT STAIR");
  /* master 067c6de7e's signature (the same hash over this checkout before the lane changed a line) */
  if (OFF) {
  const MASTER = { n: 72, levels: 'e1d37b905059043c', witchlight: 'b2904bf68aaa0cfc', mage: '0899dfe9f3854786' };
  const rows = LEVELS.map(l => [l.id, l.needs || null, l.leadsTo || null, !!l.hidden]);
  const b = id => { const L = LEVELS.find(l => l.id === id).build(); return h([L.W, L.H, Array.from(L.grid), L.ents]); };
  const now = { n: LEVELS.length, levels: h(rows), witchlight: b('witchlight'), mage: b('mage') };
  ok(JSON.stringify(now) === JSON.stringify(MASTER), "LEVELS (ids, needs, order), THE WITCHLIGHT STAIR and THE MAGE'S FOLLY are master's exactly " + JSON.stringify(now));
  }
  ok(!!mig, 'the old-save rule is one guarded line in progDefaults (src/route-insert.js roadMigrate with the Academy\'s own row)');
  if (OFF) for (const [name, P0] of [['a fresh save', {}], ['the Stair cleared', { witchlight: { cleared: true } }], ['past the Folly', { witchlight: { cleared: true }, mage: { cleared: true } }], ['the fields only', { fields: { cleared: true } }]]) {
    const P = migRun(JSON.parse(JSON.stringify(P0)), acOn());
    ok(JSON.stringify(P) === JSON.stringify(P0) && RI.needsOpen(P, LEVELS.find(l => l.id === 'mage')) === RI.needsOpen(P0, LEVELS.find(l => l.id === 'mage')), 'flag off, ' + name + ': the save untouched, the Folly as master locks it'); }
  const tagged = main.split('\n').filter(l => l.includes('(claude/academy)'));
  ok(tagged.length >= 15 && tagged.length <= 22, tagged.length + ' tagged hook lines in src/main.js (single lines)');
  const unguarded = tagged.filter(l => !/acOn\(\)|ACH|HDH|case 'acbooks'|AC_NODE|const EHP = \{|LEVELS\.some\(l => l\.id === 'academy'\)/.test(l));
  ok(!unguarded.length, 'every hook is behind the flag: the road and the old-save rule ask acOn(), the rest need the level (ACH.on() / its ents / its boss) ' + unguarded.map(l => l.slice(0, 60)).join(' | '));
  ok(/if \(LEVELS\.some\(l => l\.id === 'academy'\)\) \{ INLAND_NODES\.splice/.test(main), 'the map node and its road vertex go in only while the LEVELS row is there (acOn() at import)');
  ok(/acOn\(\) && isDev\(\)/.test(main), 'the dev entry needs ?ac=1 and ?dev=1');
  ok(RI.ROAD_INSERTS.every(i => i.id !== 'academy'), 'the desert inserts table is untouched (the Academy brings its own row)');
  const child = spawnSync(process.execPath, ['--import', './tools/ac-on.mjs', fileURLToPath(import.meta.url), '--on'], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  process.stdout.write(child.stdout || ''); if (child.status !== 0) bad++;
  console.log(bad ? '\nTHE MAGE ACADEMY: ' + bad + ' FAIL(S)' : '\nTHE MAGE ACADEMY: all ok (flag off and flag on)');
  process.exit(bad ? 1 : 0);
}

// ======================================================================= FLAG ON =======================================================================
console.log('== THE MAGE ACADEMY, FLAG ON (globalThis.__AC)');
const { AC, SECTIONS } = await import('../src/academy.js');
const { AC_RULE, AC_SAY, HM_SAY } = await import('../src/ac-lines.js');
const { makeAcademyHands, LEV, BL, CJ, PIT, FLOCK } = await import('../src/academy-hands.js');
const HMM = await import('../src/headmistress.js'); const { HM } = HMM;
const { makeHeadmistressHands, POSE, SOUND } = await import('../src/headmistress-hands.js');
const { floodReach } = await import('../src/reachcore.js');
const { THREAT } = await import('../src/threat.js');
const { MARK, ANSWER } = await import('../src/marks.js');
const { MOVE } = await import('../src/hero-move.js');
const lv = LEVELS.find(l => l.id === 'academy');
ok(!!lv && acOn(), 'the LEVELS row is there with the flag on');
if (!lv) process.exit(1);
// ---- THE ROAD ----
const need = id => LEVELS.find(l => l.id === id).needs;
ok(LEVELS.indexOf(lv) === 75 && LEVELS.length === 76 && LEVELS.slice(72).map(l => l.id).join() === 'wispwood,silk,manor,academy', 'APPENDED in ship order (saves count levels by index): the four night areas are rows 72-75 (this one is 75), nothing before them moved');
ok(need('wispwood') === 'burial' && need('silk') === 'wispwood' && need('manor') === 'silk' && need('witchlight') === 'manor' && need('academy') === 'witchlight' && need('mage') === 'academy', 'THE ROAD (shipped, all four live): BURIAL > WISPWOOD > SILK > MANOR > WITCHLIGHT STAIR > ACADEMY > THE MAGE FOLLY');
ok(lv.rule === AC_RULE && /LEARN THE SPELL AT THE LECTERN/.test(lv.rule), 'the rule line: ' + lv.rule);
ok(/GATE = \[[^\]]*'academy'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(['aclectern', 'acrail', 'acwell', 'acrune'].every(k => THREAT[k] === 0) && THREAT.acbooks > 0 && THREAT.headmistress > 0, 'the threat table knows its machines (0), its flock and its boss');
ok(MARK['acbooks|gatherTell'] === '!' && ANSWER['acbooks|gatherTell'] === 'block', "the flock's gather wears a yellow ! answered by a block (src/marks.js)");
{ const mage = { id: 'mage', needs: 'academy' }, ac0 = { id: 'academy', needs: 'witchlight' };
  const past = migRun({ witchlight: { cleared: true } }, true), atFolly = migRun({ witchlight: { cleared: true }, mage: { cleared: true } }, true), fresh = migRun({}, true), again = migRun({ roadMig: { academy: 1 }, witchlight: { cleared: true } }, true);
  ok(RI.needsOpen(past, mage) && RI.needsOpen(atFolly, mage) && past.roadOpen.mage === 1, 'an old save past the Stair keeps the Folly open (PROG.roadOpen.mage, once): ' + JSON.stringify(past));
  ok(!RI.needsOpen(fresh, mage) && RI.needsOpen({ witchlight: { cleared: true } }, ac0), 'a fresh save walks it: the Stair opens the Academy, the Folly waits');
  ok(!RI.needsOpen(again, mage) && RI.needsOpen({ ...again, academy: { cleared: true } }, mage), 'the migration runs once (a save that clears the Stair later walks the Academy), clearing it opens the Folly'); }
// ---- THE BUILD ----
const L = lv.build();
ok(L.W === AC.W && L.H === AC.H && L.academy && L.ac && L.arena && L.arena.boss === 'headmistress', 'built: ' + L.W + ' x ' + L.H + ', the Examination');
ok(L.sections.length === 6 && SECTIONS.length === 6, 'six sections: ' + SECTIONS.map(s => s[0]).join(' / '));
const checks = L.ents.filter(e => e.t === 'check'), silvers = L.ents.filter(e => e.t === 'silver');
ok(checks.length === 2 && L.checkRun === 200, 'START + 2 shrines (cols ' + checks.map(c => c.x).join(', ') + '), checkRun 200: the filler adds none');
ok(silvers.length === 2, 'two silvers (cols ' + silvers.map(s => s.x).join(', ') + ')');
const G0 = L.ac;
ok(G0.rooms.length === 4 && G0.lecterns.length === 9 && G0.rails.length === 4 && G0.wells.length === 4 && G0.runes.length === 3, 'rooms ' + G0.rooms.map(r => r.id + ':' + (r.spell || 'swap')).join(' ') + '; lecterns ' + G0.lecterns.length + ', rails ' + G0.rails.length + ', pits ' + G0.wells.length + ', runes ' + G0.runes.length);
ok(['levitate', 'blink', 'conjure'].every(s => G0.lecterns.filter(l => l.spell === s).length === 3), 'each cantrip is taught three times: its room, the exam hall, the Examination');
ok(L.calm && L.calm.length && !L.ents.some(e => e.t === 'gate') && !L.ents.some(e => /gob/.test(e.t)), 'placed by hand (calm), no exit gate (she ends it), no goblins');
{ const reach = floodReach(L, T, { rides: true }); const want = L.ents.filter(e => ['check', 'silver', 'aclectern', 'acrune', 'headmistress'].includes(e.t));
  const miss = want.filter(e => !reach.jumpNear(e.x, e.y));
  ok(!miss.length, 'the fill (each cantrip room a ride band) reaches every shrine, silver, lectern, rune and the Headmistress' + (miss.length ? ': MISSES ' + JSON.stringify(miss.map(e => [e.t, e.x, e.y])) : ''));
  const plain = floodReach(L, T, { noAssist: true }); const gal = L.ents.find(e => e.t === 'aclectern' && e.x === 104);
  ok(!plain.jumpNear(gal.x, gal.y), 'and legs alone do NOT reach the Lecture Hall (the library\'s door is up in the gallery: the levitation is load-bearing)'); }

// ---- THE HANDS, in a fake world ----
const fakeWorld = (L0, heroes, o = {}) => { let cur = null; const log = []; const fx = { L: L0, TS, T, players: () => heroes, enemies: () => fx.ens, ens: [], time: () => 0, number: (x, y, t) => log.push(t), hint: t => log.push('HINT ' + t),
  asPlayer: (p, fn) => { const o2 = cur; cur = p; try { fn(); } finally { cur = o2; } },
  damage: (x, d, op = {}) => { const p = cur; if (!p || p.dead) return null; if (o.block && o.block(p, op)) return 'blocked'; p.hp -= d; p.hits = (p.hits || 0) + 1; p.took = (p.took || []).concat([[op.name || '?', d, !!op.spare]]); if (p.hp <= 0) { if (op.spare) p.hp = 1; else p.dead = true; } return 'hit'; },
  cellSet: (x, y, t) => { L0.grid[y * L0.W + x] = t; }, upright: p => !p.dead, hitOnce: () => true, shake: () => {}, ring: () => {}, log, hero: () => fx.cur, arenaLit: id => (fx.lit ? fx.lit(id) : false), pitSafe: p => (fx.safe ? fx.safe(p) : null) }; return fx; };
const hero = (x, y, o = {}) => ({ x, y, hp: 400, vx: 0, vy: 0, ground: true, face: 1, w: 10, h: 14, ...o });
const at = (col, row) => [col * TS + 8, (row + 1) * TS];
const cell = (L0, x, y) => L0.grid[y * L0.W + x];
/* A SMALL COPY OF THE GAME'S ARC (src/hero-move.js numbers; main.js updatePlayer's order: the jump, gravity, then the academy's player(), then the move) */
function phys(L0, A, p, dt, { held = false, run = 0 } = {}) {
  const solidC = (x, y) => { const t = cell(L0, x, y); return t === T.SOLID; }, footC = (x, y) => { const t = cell(L0, x, y); return t === T.SOLID || t === T.ONEWAY; };
  if (!p.ground) { const apex = Math.abs(p.vy) < MOVE.APEX_VY, gk = apex ? MOVE.APEX_G : p.vy < 0 ? 1 : MOVE.FALL_G; p.vy = Math.min(MOVE.MAX_FALL, p.vy + MOVE.GRAV * dt * gk); }
  A.player(dt, p, held);
  if (run) { const nx = p.x + run * MOVE.RUN * dt, c = Math.floor((nx + Math.sign(run) * 5) / TS); if (![Math.floor((p.y - 14) / TS), Math.floor((p.y - 1) / TS)].some(r => solidC(c, r))) p.x = nx; }
  const ny = p.y + p.vy * dt;
  if (p.vy > 0) { const c = Math.floor(p.x / TS); for (let r = Math.floor(p.y / TS); r <= Math.floor(ny / TS); r++) if (footC(c, r) && p.y <= r * TS + 0.01) { p.y = r * TS; p.vy = 0; p.ground = true; return; } }
  else if (p.vy < 0) { const c = Math.floor(p.x / TS); if (solidC(c, Math.floor((ny - 14) / TS))) { p.vy = 0; return; } }
  p.y = ny; if (p.vy !== 0) p.ground = false;
  if (p.ground) { const c = Math.floor(p.x / TS); if (!footC(c, Math.floor(p.y / TS))) p.ground = false; }
}
const jump = p => { p.vy = MOVE.JUMPV; p.ground = false; };
/* how high does one jump take him (rows), held all the way, with and without levitation? */
function rise(spell) { const L0 = lv.build(); const P = hero(...at(40, 39)), F = fakeWorld(L0, [P]), A = makeAcademyHands(F); A.reset(); if (spell) A.teach(P, spell, 'library'); P.x = at(40, 39)[0];
  const y0 = P.y; let top = y0; jump(P); for (let t = 0; t < 3 && !(P.ground && t > 0.1); t += 1 / 60) { phys(L0, A, P, 1 / 60, { held: true }); top = Math.min(top, P.y); } return (y0 - top) / TS; }
{ const r0 = rise(null), r1 = rise('levitate');
  ok(r0 < 4 && r1 >= 12.5, 'LEVITATION: a held jump rises ' + r0.toFixed(1) + ' rows on legs, ' + r1.toFixed(1) + ' with the float (' + LEV.meter + ' s at ' + LEV.rise + ' px/s): the stacks (4 rows), the shelf (8) and the exam wall (12) need it, and it is enough'); }
{ const L0 = lv.build(); const P = hero(...at(24, 39)), F = fakeWorld(L0, [P]), A = makeAcademyHands(F); A.reset(); A.update(1 / 60);
  ok(A.spellOf(P) === null, 'no spell before a lectern'); P.x = at(22, 39)[0]; A.update(1 / 60);
  ok(A.spellOf(P) === 'levitate', 'a LECTERN touched teaches its room\'s spell (' + A.spellOf(P) + ')');
  P.x = at(102, 25)[0]; P.y = at(102, 25)[1]; A.update(1 / 60);
  ok(A.spellOf(P) === null && A.show().n.ended === 1, 'IT LASTS THE LESSON: out of the library, levitation is gone');
  P.x = at(104, 25)[0]; A.update(1 / 60); ok(A.spellOf(P) === 'blink', 'the Lecture Hall\'s lectern teaches BLINK');
  const ex = G0.lecterns.filter(l => l.room === 'exam'); P.x = ex[0].x; P.y = ex[0].y; A.update(1 / 60); const s1 = A.spellOf(P); P.x = ex[1].x; A.update(1 / 60); const s2 = A.spellOf(P); P.x = ex[2].x; A.update(1 / 60);
  ok(s1 === 'levitate' && s2 === 'blink' && A.spellOf(P) === 'conjure', 'THE EXAM HALL: three lecterns swap the spell as you go (' + [s1, s2, A.spellOf(P)].join(' > ') + ')');
  const ar = G0.lecterns.find(l => l.arena); P.x = ar.x; P.y = ar.y; A.update(1 / 60); ok(A.spellOf(P) === null, 'the Examination\'s lecterns are dark until she lights one'); }
/* BLINK */
{ const L0 = lv.build(); const P = hero(...at(128, 39)), F = fakeWorld(L0, [P]), A = makeAcademyHands(F); A.reset(); A.teach(P, 'blink', 'lecture');
  ok(A.blink(P, 1) && Math.floor(P.x / TS) > 130 && A.show().n.railBlinks === 1, 'BLINK passes a ward rail (col 128 -> ' + Math.floor(P.x / TS) + ', the rail at 130) and counts it');
  ok(A.blinkedRail(P) && !A.blink(P, 0) === false, 'and the Headmistress can read that a rail was crossed (cooldown ' + BL.cd + ' s spends the press)');
  P.x = at(148, 39)[0]; P.ground = false; P.vy = -40; A.show().hero.get(P).blinkCd = 0; A.blink(P, 1); ok(Math.floor(P.x / TS) >= 152 && P.vy <= 0, 'over THE ORCHESTRA PIT: a blink in the air carries ' + Math.round(BL.dist / TS) + ' tiles and hangs a beat (col ' + Math.floor(P.x / TS) + ')');
  const P2 = hero(...at(94, 39)), F2 = fakeWorld(L0, [P2]), A2 = makeAcademyHands(F2); A2.reset(); A2.teach(P2, 'blink', 'library'); const x0 = P2.x; A2.blink(P2, 1);
  ok(P2.x === x0 && A2.show().n.fizzles === 1, 'and NEVER through stone: at the library\'s east wall it fizzles (no room)');
  const P3 = hero(...at(128, 39)), F3 = fakeWorld(L0, [P3]), A3 = makeAcademyHands(F3); A3.reset(); ok(A3.blink(P3, 1) === false, 'without the lesson the dodge button is the dodge (blink returns false)'); }
/* CONJURE STEP: one step, its life, two at most; then a bot crosses the summoning well on its own steps */
{ const L0 = lv.build(); const P = hero(...at(192, 36), { ground: false }), F = fakeWorld(L0, [P]), A = makeAcademyHands(F); A.reset(); A.teach(P, 'conjure', 'yard');
  P.jbuf = 0.1; A.player(1 / 60, P, false);
  ok([191, 192, 193].every(x => cell(L0, x, 37) === T.ONEWAY) && P.jbuf === 0, 'CONJURE STEP: JUMP in the air lays a 3-cell step under the feet');
  for (let t = 0; t < CJ.life + 0.1; t += 1 / 60) A.update(1 / 60);
  ok([191, 192, 193].every(x => cell(L0, x, 37) === T.AIR), 'it is gone after ' + CJ.life + ' s (it flickers its last ' + CJ.warn + ' s)');
  for (let i = 0; i < 3; i++) { P.x = at(195 + i * 5, 36)[0]; P.jbuf = 0.1; A.show().hero.get(P).stepCd = 0; A.player(1 / 60, P, false); }
  ok(A.steps().length === CJ.max, 'never more than ' + CJ.max + ' a hero (the oldest goes): ' + JSON.stringify(A.steps())); }
function crossWell(useSpell) { const L0 = lv.build(); const P = hero(...at(188, 39)), F = fakeWorld(L0, [P]), A = makeAcademyHands(F); A.reset(); if (useSpell) A.teach(P, 'conjure', 'yard');
  let t = 0, hops = 0, steps = 0; const y0 = P.y; let lastY = P.y;
  while (t < 20 && P.x < 236 * TS && !P.dead) { t += 1 / 60;
    if (P.ground) { jump(P); hops++; lastY = P.y; }
    if (useSpell && !P.ground && P.vy >= 0 && (Math.floor(P.x / TS) >= 229 ? true : P.y >= lastY - 2) && Math.floor(P.x / TS) >= 189) { P.jbuf = 0.1; const n0 = A.show().n.steps; phys(L0, A, P, 1 / 60, { run: 1 }); if (A.show().n.steps > n0) steps++; } else phys(L0, A, P, 1 / 60, { run: 1 });
    A.update(1 / 60); if (A.show().n.filed) break; }
  return { across: P.x >= 236 * TS && !A.show().n.filed, hops, steps, filed: A.show().n.filed, t }; }
{ const a = crossWell(true), b = crossWell(false);
  ok(a.across, 'a bot CROSSES THE SUMMONING WELL (46 tiles, no floor) on its own steps: ' + a.steps + ' steps, ' + a.hops + ' hops, ' + a.t.toFixed(1) + ' s');
  ok(!b.across && b.filed === 1, 'without the lesson the same bot falls in and is FILED BACK (' + PIT.dmg + ', spare)'); }
/* THE PITS, THE RUNES, THE RESET */
{ const L0 = lv.build(), grid0 = Array.from(L0.grid); const P = hero(...at(55, 39)), F = fakeWorld(L0, [P]), A = makeAcademyHands(F); A.reset(); A.update(1 / 60);
  P.x = at(62, 46)[0]; P.y = AC.catchY + 10; P.ground = false; A.update(1 / 60);
  ok(P.hp === 400 - PIT.dmg && Math.abs(P.x - at(55, 39)[0]) < 2 && P.y < AC.catchY && P.took[0][2], 'THE ARCHIVE PIT files you back onto your last firm footing for ' + PIT.dmg + ' (spare: never a death)');
  const r = G0.runes[1]; ok(r.cells.every(([x, y]) => cell(L0, x, y) === T.SOLID), 'a SHORTCUT RUNE\'s shutter is shut in play (open in the built grid, so the reach and quality tools see the cellar)');
  A.strike({ l: r.x - 4, r: r.x + 4, t: r.y - 14, b: r.y - 6 }, P); ok(r.cells.every(([x, y]) => cell(L0, x, y) === T.AIR) && A.show().n.runes === 1, 'struck, it lifts: the prep cellar under the Lecture Hall opens');
  A.teach(P, 'conjure', 'yard'); P.x = at(192, 36)[0]; P.y = at(192, 36)[1]; P.ground = false; P.jbuf = 0.1; A.player(1 / 60, P, false); A.tempRail('t', 200, 30, 39);
  A.reset(); const diff = L0.grid.reduce((n, v, i) => n + (v !== grid0[i] && !G0.runes.some(q => q.cells.some(([x, y]) => y * L0.W + x === i)) ? 1 : 0), 0);
  ok(diff === 0, 'the reset puts every cell back (steps, rails, shutters re-shut): ' + diff + ' cells differ outside the shutters'); }
/* THE SPELLBOOK FLOCK */
{ const mk = (o = {}) => { const L0 = lv.build(); const P = hero(...at(46, 25)), F = fakeWorld(L0, [P], o), A = makeAcademyHands(F); A.reset();
    const sp = L0.ents.find(e => e.t === 'acbooks' && e.squad === 'libFlock'); const e = A.spawn(sp, { x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); F.ens.push(e);
    const step = s => { for (let t = 0; t < s; t += 1 / 60) { A.update(1 / 60); if (e.alive) A.flock(e, 1 / 60); } }; return { P, A, e, step }; };
  { const { P, A, e, step } = mk(); step(0.65); ok(e.mode === 'gatherTell', 'THE SPELLBOOK FLOCK: a hero in reach draws a told GATHER (' + FLOCK.tell + ' s, yellow !)');
    let t = 0; while (t < 3 && !P.hits) { step(1 / 60); t += 1 / 60; } ok(P.hits === 1 && P.hp === 400 - FLOCK.dmg, 'then it STREAMS through where he was (' + FLOCK.dmg + ')'); }
  { const { A, e, step } = mk({ block: (p, op) => op.name === 'A SPELLBOOK FLOCK' }); let t = 0; while (t < 3 && e.mode !== 'scattered') { step(1 / 60); t += 1 / 60; }
    ok(e.mode === 'scattered' && A.show().n.scattered === 1 && A.takeFlock(e, 10) === 20, 'a BLOCKED stream SCATTERS it (' + FLOCK.scatter + ' s) and a scattered flock takes x2'); }
  { const L0 = lv.build(); const P = hero(...at(50, 39)), F = fakeWorld(L0, [P]), A = makeAcademyHands(F); A.reset(); const sp = L0.ents.find(e => e.t === 'acbooks' && e.squad === 'libFlock');
    const e = A.spawn(sp, { x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); F.ens.push(e); for (let t = 0; t < 0.5; t += 1 / 60) A.flock(e, 1 / 60);
    ok(e.mode === 'wheel', 'it hunts the FLOATING: the same hero on the floor under the gallery (' + Math.round((P.y - e.y) / TS) + ' rows below) is out of its reach (' + FLOCK.down + ' px down, ' + FLOCK.up + ' up)'); } }

// ---- THE HEADMISTRESS ----
{ const moves = ['chalk', 'ruler', 'bolt', 'about', 'dispel'];
  ok(moves.every(m => POSE[m + 'Tell'] && POSE[m] && JSON.stringify(POSE[m + 'Tell']) !== JSON.stringify(POSE[m])) && POSE.crumbleTell && POSE.callTell && POSE.stagger && POSE.bell, 'every move has its own windup pose and release pose (B16), and the floor\'s stamp, the call, the stagger, the bell');
  ok(moves.every(m => SOUND[m + 'Tell'] && SOUND[m]) && SOUND.crumbleTell && SOUND.callTell && SOUND.correct && SOUND.work, 'every move its own sound');
  ok(HM.resist >= 0.4 && HM.openMul > 1 && HM.openCap > 0 && HM.fin.cap > 0, 'B15: x' + HM.resist + ' outside an opening (>= 0.4: never untouchable), x' + HM.openMul + ' in one, capped ' + HM.openCap * 100 + '% (finale ' + HM.fin.cap * 100 + '%)'); }
{ const e = { hp: 2600, maxHp: 2600, mode: 'lecture', modeT: 0, x: 100, face: 1 }, S = HMM.newFight(HMM.geom(lv.build()));
  const [d0, w0] = HMM.takeBlow(e, S, 40, null, null);
  S.books = [{ dead: false }, { dead: false }, { dead: false }];
  const [d1] = HMM.takeBlow(e, S, 40, { spell: 'levitate', floated: true }, null); const shielded = !HMM.hmOpen(e);
  S.books[0].dead = true; const [d2] = HMM.takeBlow(e, S, 40, { spell: 'levitate', floated: true }, null);
  ok(d0 === 16 && w0 === 'WORK', 'a 40 blow that does not use the lesson: ' + d0 + ' (x' + HM.resist + ', SHOW YOUR WORK)');
  ok(d1 === 16 && shielded, 'P1: floating, but three shield books still round her: not yet (cut through them first)');
  ok(d2 === 80 && HMM.hmOpen(e), 'floating with the shield cut to ' + HMM.shieldLeft(S) + ': CORRECT - she staggers and the blow lands x2 (' + d2 + ')');
  let sum = 0; for (let i = 0; i < 40; i++) sum += HMM.takeBlow(e, S, 40, null, null)[0]; ok(sum <= HM.openCap * 2600 + 40 * 40 * HM.resist + 1, 'an opening is capped at ' + HM.openCap * 100 + '% of her (then x' + HM.resist + ')');
  const S2 = HMM.newFight(HMM.geom(lv.build())); S2.ph = 2; S2.lesson = 'blink'; const e2 = { ...e, mode: 'lecture', hp: 2000 };
  ok(!HMM.correct(e2, S2, { spell: 'blink', railBlink: true, back: false }) && !HMM.correct(e2, S2, { spell: 'blink', railBlink: false, back: true }) && HMM.correct(e2, S2, { spell: 'blink', railBlink: true, back: true }), 'P2: only a blow on her BACK after a blink THROUGH a rail is correct (front, or walked round: no)');
  S2.ph = 3; S2.lesson = 'conjure'; ok(HMM.correct(e2, S2, { spell: 'conjure', onStep: true }) && !HMM.correct(e2, S2, { spell: 'blink', onStep: true, railBlink: true, back: true }), 'P3: a blow from a conjured step; the wrong spell never counts');
  S2.ph = 4; S2.call = 'levitate'; ok(HMM.correct(e2, S2, { spell: 'levitate', floated: true }) && !HMM.correct(e2, S2, { spell: 'conjure', onStep: true }), 'FINALE: the answer is the lesson she CALLED');
  const e3 = { ...e, mode: 'lecture', hp: 1830 }, S3 = HMM.newFight(HMM.geom(lv.build())); const [d3, w3] = HMM.takeBlow(e3, S3, 40, null, null); ok(d3 === 10 && w3 === 'HOLDS', 'a phase holds at its floor (P1 at ' + HM.floors[0] * 100 + '%) until the move in hand ends'); }

function fight({ seed = 1, swing = 40, every = 0.42, answer = true, react = 0.6 } = {}) {
  const L0 = lv.build(), A0 = L0.arena; let rnd = seed; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const floorY = A0.floor; const P = hero(A0.x0 + 2 * TS, floorY, { hp: 640 }), heroes = [P];   /* 640: the bot's health with its flasks drunk (it never drinks: one pool) */
  let HD = null; const F = fakeWorld(L0, heroes, { block: (p, op) => op.unblockable === false && rand() < 0.45 }); F.cur = P; F.lit = id => HD.arenaLit(id); F.safe = p => HD.pitSafe(p);
  const A = makeAcademyHands(F); A.reset();
  let boss = null; const ctx = { ...F, get L() { return L0; }, get boss() { return boss; }, bossActive: true, EHP: { headmistress: HM.hp }, ac: () => A, hero: () => P };
  HD = makeHeadmistressHands(ctx);
  const sp = L0.ents.find(e => e.t === 'headmistress'); boss = HD.spawnBoss({ x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); boss.mode = 'wake'; boss.modeT = 1.6;
  const modes = new Set(), S = HD.show(); let t = 0, swingT = 0, openDmg = 0, workDmg = 0, lessonT = 0; const dt = 1 / 60, phases = new Set();
  while (t < 500 && boss.alive && !P.dead) {
    t += dt; A.update(dt); HD.update(boss, dt); modes.add(boss.mode); phases.add(S.ph);
    const lesson = S.ph === 4 ? S.call : S.lesson, lit = lesson && L0.ac.lecterns.find(l => l.arena && HD.arenaLit(l.id));
    const st = A.state(P); st.floated = false; const L = answer ? lesson : null, voidAt = x => S.pitStage > 0 || S.ph === 4 ? L0.grid[Math.round(floorY / TS) * L0.W + Math.floor(x / TS)] === T.AIR : false;
    if (L !== 'conjure' || !voidAt(P.x)) { P.ground = true; P.y = floorY; }   /* on the floor (the conjure lesson's bot stays on its steps) */
    if (S.n.dispels > (st.seenDispel || 0)) { st.seenDispel = S.n.dispels; if (rand() > react && A.onStep(P) === false) { P.y = AC.catchY + 10; P.ground = false; A.update(0); } }   /* DISPEL: a slow reader drops into the void (filed back to a ledge) */
    /* dodge what is told (a fair player answers most): chalk circles under him, a bolt down her front */
    const threat = S.sigils.some(s => Math.abs(s.x - P.x) < HM.chalk.w + 4 && s.t < 0.5) || S.bolts.some(b => Math.abs(b.x - P.x) < 40 && Math.sign(P.x - b.x) === b.dir);
    if (threat && rand() < react) { P.x += (P.x < boss.x ? -1 : 1) * 30; P.x = Math.max(A0.x0 + 10, Math.min(A0.x1 - 10, P.x)); continue; }
    if (answer && lit && A.spellOf(P) !== lesson) { const dx = lit.x - P.x; P.x += Math.sign(dx) * Math.min(Math.abs(dx), 92 * dt); lessonT += dt; continue; }   /* walk to the lit lectern: touching it teaches */
    let gx = boss.x - 18 * (boss.face || 1), canHit = false;
    if (L === 'levitate' || (!L && boss.y < floorY - 3 * TS)) { gx = boss.x - 16; if (Math.abs(gx - P.x) < 30 && L) { P.ground = false; P.y = boss.y; st.floated = true; } canHit = Math.abs(P.y - boss.y) < 30; }
    else if (L === 'blink') { const back = boss.x - (boss.face || 1) * 20, front = boss.x + (boss.face || 1) * (HM.about.railDx + 26);
      if (Math.sign(P.x - boss.x) === -(boss.face || 1) && A.blinkedRail(P, HM.blinkWindow)) { gx = back; canHit = true; }
      else { gx = front; if (Math.abs(P.x - front) < 6) { st.blinkCd = 0; A.blink(P, -(boss.face || 1)); } } }
    else if (L === 'conjure') { gx = boss.x - 18; const near = Math.abs(gx - P.x) < 40, wantY = near ? Math.floor((boss.y + 8) / TS) * TS : floorY;   /* chain steps over the void, then a stair of them up to her desk */
      if (voidAt(P.x) || near) { if (!A.onStep(P) || Math.abs(P.y - wantY) > 2) { P.ground = false; P.y = wantY; P.jbuf = 0.1; st.stepCd = 0; A.player(dt, P, false); } P.ground = true; A.update(0); }
      canHit = Math.abs(boss.x - P.x) < 34 && A.onStep(P) && Math.abs(P.y - boss.y) < 30; }
    else canHit = Math.abs(P.y - boss.y) < 30;
    { const dx = gx - P.x; P.x += Math.sign(dx) * Math.min(Math.abs(dx), 92 * dt); P.x = Math.max(A0.x0 + 10, Math.min(A0.x1 - 10, P.x)); }
    /* the dismissed floor: a bot standing over the void (not on a step) falls in - the pit files it back */
    if (!A.onStep(P) && voidAt(P.x) && P.y <= floorY + 2) { if (L === 'conjure' && A.spellOf(P) === 'conjure') { P.ground = false; P.y = floorY; P.jbuf = 0.1; st.stepCd = 0; A.player(dt, P, false); P.ground = true; A.update(0); } else { P.y = AC.catchY + 10; P.ground = false; A.update(0); } }   /* over the void: a step under him (the lesson), or the pit files him back */
    swingT -= dt; if (swingT <= 0 && Math.abs(boss.x - P.x) < 34) { swingT = every; const hb = { l: P.x - 20, r: P.x + 20, t: P.y - 30, b: P.y }; HD.strike(hb);
      if (canHit && !/^(sleep|wake|glide)$/.test(boss.mode)) { const o = HMM.hmOpen(boss), d = HD.take(boss, swing); boss.hp -= d; if (HMM.hmOpen(boss)) openDmg += d; else workDmg += d; void o; if (boss.hp <= 0) { boss.alive = false; HD.end(boss); } } }
  }
  return { won: !boss.alive && !P.dead, t, hpLeft: P.hp, modes, S, HD, A, P, openDmg, workDmg, phases, L0 };
}
{ const R = fight(), n = R.S.n;
  ok(R.won, 'THE HEADMISTRESS, END TO END: the bot passes in ' + R.t.toFixed(0) + ' s with ' + Math.round(R.hpLeft) + ' of 640 health left (hurt by ' + JSON.stringify(Object.fromEntries(Object.entries(R.S.hurt).map(([k, v]) => [k, Math.round(v)]))) + ')');
  ok([1, 2, 3, 4].every(p => R.phases.has(p)), 'every lesson: P1 levitation, P2 blink, P3 conjure step, the finale');
  ok(n.answered.levitate >= 1 && n.answered.blink >= 1 && n.answered.conjure >= 1 && n.calls >= 3, 'SHE MARKS ONLY WHAT USES THE LESSON - every lesson answered: ' + JSON.stringify(n.answered) + ' (' + n.correct + ' CORRECT, ' + n.calls + ' finale calls; ' + Math.round(R.openDmg) + ' dealt open vs ' + Math.round(R.workDmg) + ' as SHOW YOUR WORK)');
  ok(['chalkTell', 'rulerTell', 'boltTell', 'aboutTell', 'dispelTell', 'crumbleTell', 'callTell', 'stagger', 'bell', 'glide'].every(m => R.modes.has(m)), 'every move came out of its own windup: ' + [...R.modes].join(' '));
  ok(n.crumbles >= 2 && n.dispels >= 1 && n.abouts >= 1, 'the floor was dismissed in ' + n.crumbles + ' stages, ' + n.dispels + ' dispels, ' + n.abouts + ' about-faces');
  ok(R.HD.read().won && !R.A.rails().length && R.HD.read().dissolved === 0, 'the win drops her rail and recalls the floor');
  ok(R.t >= 60 && R.t <= 260, 'the exam runs ' + R.t.toFixed(0) + ' s for a node bot (brief: 90-150 s for a player; the tune lane sets hp at n=6)'); }
{ const R = fight({ answer: false }), n = R.S.n;
  ok(n.correct === 0, 'a bot that never uses a lesson never opens her (' + n.work + ' blows all SHOW YOUR WORK at x' + HM.resist + ')');
  ok(!R.won || R.t > fight().t * 1.5, 'and is the slow road (never untouchable, never quick): ' + (R.won ? 'passed in ' + R.t.toFixed(0) + ' s' : (R.P.dead ? 'FAILED' : 'out of time') + ' at ' + R.t.toFixed(0) + ' s')); }
console.log(bad ? 'FLAG ON: ' + bad + ' FAIL(S)' : 'FLAG ON: all ok');
process.exit(bad ? 1 : 0);
