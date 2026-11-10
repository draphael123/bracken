// tools/gprincess.mjs - THE GOBLIN PRINCESS and HIGHCROWN 3, THE NODE HALF (claude/highcrown3, scratch/lane-reports/hcplan.md). No page, no browser.
//   LAYOUT   +100 columns (the battlements + the bell tower), the Captains Hall and the bakehouse kept; the bell tower is L.mini (gprincess); landing, grate column, inner stair
//            door; the battlements have no spikes and no death fall (the broken stretch's pit has a ladder out); six murder holes; eight shrines; reachable end to end
//   FIGHT    resist 0.5x (0.4x hiding) outside openings, never 0; the bell rope (any seat) -> she bolts -> told glow -> the grate -> PINNED 3.5 s x1.35; cooldown;
//            a missed grate (SHE DUCKED); a parried lunge staggers; a parried tiara stuns (x1.25); the cap a single opening; 'GUARDS!' at 70/35: crank 3 keeps them in,
//            fail and they come (+1 at 3-4 seats); the tantrum at 50 %; at 0 she DIES (gq3: dying 1.8 s, handbell x3, the Great Hall answers; a body; the mini ends); 1-4 seats
//   CHASE    starts at the walk, runs ahead, rings tower 1 and 2 (their guardroom winches), reaches her tower; once per checkpoint life
//   REHEARSAL the banquet's Captain storms to the bell rope, the grate pins him; the servery horn and its winch
//   WIRING   main.js / boss-greed / boss-read / marks / bell-winch / gqueen-hands on the shared code
//   node tools/gprincess.mjs
import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => readFileSync(path.join(ROOT, f), 'utf8');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const { LEVELS, T } = await imp('src/level.js'); const { SH_HALL, G4 } = await imp('src/gq4l.js');
const { HC3 } = await imp('src/highcrown2.js');
const GPX = await imp('src/goblin-princess.js'), { GP, gpMul, gpOpen } = GPX;
const BW = await imp('src/bell-winch.js');
const TS = 16;
const L = LEVELS.find(l => l.id === 'crown').build(), W = L.W, at = (x, y) => L.grid[y * W + x];

console.log('== LAYOUT');
ok(W === 841 + SH_HALL, 'Highcrown is 841 columns (609 + the tower top 56 + 100 for the battlements and the bell tower + 64 for the Queen Stair + 12 for the 60-column tower top): ' + W);
ok(L.ents.some(e => e.t === 'sign' && /CAPTAINS HALL/.test(e.text || '')), 'the Captains Hall is kept (Daniel 11-06 22:34: do NOT cut it)');
ok(L.ents.some(e => e.t === 'sign' && /BAKEHOUSE YARD/.test(e.text || '')) && L.pools.some(p => p.fire), 'the bakehouse yard is kept (its sign and its fire)');
const M = L.mini; ok(!!M && M.boss === 'gprincess' && M.name === 'THE GOBLIN PRINCESS', 'L.mini is THE GOBLIN PRINCESS');
ok(L.ents.filter(e => e.t === 'gprincess' && e.mini).length === 1, 'one gprincess ent, marked mini');
ok(M && M.x0 / TS > HC3.W3[1] && M.x1 / TS <= HC3.BT[1] && L.arena.x0 / TS > M.x1 / TS, 'her tower stands past the battlements and before the Queen\'s hall (' + (M.x0 / TS) + '-' + (M.x1 / TS) + ', the hall ' + (L.arena.x0 / TS) + ')');
let land = true; for (let x = HC3.LAND[0]; x <= HC3.LAND[1]; x++) if (at(x, HC3.LAND_ROW) !== T.ONEWAY) land = false; ok(land, 'the belfry landing is one-way (every hero jumps up through it)');
ok(HC3.S + 1 - HC3.LAND_ROW <= 3, 'the landing is no more than 3 rows over the floor (a plain jump: src/reachcore.js JUMP_UP)');
let col = true; for (let y = M.grate.gy0; y <= M.grate.gy1; y++) if (at(M.grate.col, y) !== T.AIR) col = false; ok(col, 'the tower bell\'s grate column is open air until it drops');
let door = true; for (let y = HC3.EXIT_ROWS[0]; y <= HC3.EXIT_ROWS[1]; y++) if (at(M.gate, y) !== T.PORT) door = false; ok(door, 'the inner stair door (the mini\'s gate, col ' + M.gate + ') is shut until she has gone');
let spikes = 0; for (let x = HC3.AT; x <= HC3.BT[1]; x++) for (let y = 0; y < 40; y++) if (at(x, y) === T.SPIKE) spikes++; ok(spikes === 0, 'no spikes on the battlements or in her tower (no death falls, HCPLAN Q9)');
let pitOut = false; for (let y = HC3.S + 1; y <= HC3.S + 6; y++) if (at(HC3.GAP[1], y) === T.NET) pitOut = true; ok(pitOut && at(HC3.GAP[0] + 2, HC3.S + 7) === T.SOLID, 'the broken stretch drops six rows onto a lower walk, with a ladder back up (time, not a life)');
const holes = L.ents.filter(e => e.t === 'murderhole'); ok(holes.length === 7, 'seven murder holes - the seventh is the Queen Stair gallery (' + holes.map(h => h.x + ',' + h.y).join(' ') + ')');
for (const h of holes) { let solidAbove = at(h.x, h.y - 1) === T.SOLID || at(h.x, h.y - 1) === T.ONEWAY; ok(solidAbove && at(h.x, h.y) === T.AIR, 'murder hole #' + h.n + ' at ' + h.x + ',' + h.y + ' is a slot under stone (or boards) with air below'); }
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b); ok(checks.length === 10, 'ten shrines (gq3: the Queen Stair door 650, the tower top deck 795 - the banquet 524 and her door 717 move) (' + checks.join(' ') + '): the banquet\'s moved to its east door; the hall balcony\'s stays (tools/checkpoint-gaps: <= 200 route tiles)');
ok(checks.includes(HC3.BANQ_SHRINE[0]) && !checks.includes(478), 'the banquet shrine is at its EAST door (after the rehearsal), not before it');
ok(!checks.some(x => x > HC3.BANQ_SHRINE[0] && x < M.x1 / TS), 'no shrine on the battlements walk itself (the chase + her fight is one checkpoint)');
const qShrine = checks.find(x => x > M.x1 / TS); ok(qShrine && qShrine < L.arena.x0 / TS, 'the Queen\'s shrine is past the Princess\'s tower and before her hall (' + qShrine + ')');
ok((L.ambushes || []).some(a => a.name === 'THE BANQUET HALL' && a.waves[0][0][0] === 'heavy' && a.waves[0][0][3].elite), 'the banquet is the ambush room, led by her CAPTAIN (a heavy elite)');
ok(!!L.gpChase && L.gpChase.towers.length === 2 && !!L.gpRehearsal, 'the chase (2 alarm towers) and the rehearsal are laid');
ok(!(L.alarms || []).some(a => a.id === 'leads') && !L.ents.some(e => e.t === 'whelp'), 'the Leads are gone (their alarm, their whelp)');
{ const { floodReach } = await imp('src/reachcore.js'); const R = floodReach(L, T, { rides: true });
  const need = [[HC3.BANQ_SHRINE[0], HC3.BANQ_SHRINE[1], 'the banquet shrine'], [HC3.T1[0] + 3, HC3.S, 'tower 1\'s passage'], [HC3.GAP[1] + 3, HC3.S, 'past the broken stretch'], [HC3.T2[1] - 2, HC3.S, 'tower 2\'s passage'], [HC3.BT[0] + 3, HC3.S, 'her tower floor'], [HC3.LAND[0] + 2, HC3.LAND_ROW - 1, 'the belfry landing']];
  for (const [x, y, nm] of need) ok(R.seen.has(x + ',' + y), 'reach: ' + nm + ' (' + x + ',' + y + ')'); }

/* ---------- a fake world for her hands ---------- */
const make = (seats = 1, opt = {}) => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), A = Lw.mini;
  const st = { shots: [], time: 0, parries: 0, dmg: [], spawned: [], grates: [], said: [], parryNext: false, enemies: [] };
  const mk = x => ({ x, y: A.floor, hp: 100, maxHp: 100, dead: false, ground: true, vy: 0, vx: 0, face: 1, hitSet: new Set(), box: null });
  const heroes = Array.from({ length: seats }, (_, i) => mk(A.x0 + (3 + 2 * i) * TS)); let cur = heroes[0];
  const noop = () => {};
  const ctx = { L: Lw, TS, EHP: { gprincess: 1460 }, sfx: new Proxy({}, { get: () => noop }), hero: () => cur, enemies: () => st.enemies, time: () => st.time, get players() { return heroes; },
    number: (x, y, t) => st.said.push(t), text: noop, burst: noop, dust: noop, shake: noop, hint: noop, music: noop,
    damagePlayer: (x, d, o) => { st.dmg.push({ x, d, o: o || {}, who: cur }); if (st.parryNext && !(o && o.unblockable)) { st.parries++; st.parryNext = false; return 'blocked'; } return 'hit'; },
    asPlayer: (p, fn) => { const c0 = cur; cur = p; try { fn(); } finally { cur = c0; } }, upright: p => !p.dead, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    box: p => ({ l: p.x - 5, r: p.x + 5, t: p.y - 14, b: p.y }), attackBox: () => cur.box, parries: () => st.parries,
    spawnEnt: o => { const e = { ...o, x: o.x * TS + 8, y: (o.y + 1) * TS, alive: true, h: 14 }; st.spawned.push(o); st.enemies.push(e); return [e]; },
    grateDrop: (c, y0, y1, hold) => { st.grates.push({ c, y0, y1, hold, t: st.time }); return true; }, grateClear: noop, shots: () => st.shots };
  const H = GPX.makeGoblinPrincessHands(ctx); H.load();
  const e = H.spawn({ x: A.x0 + 14 * TS, y: A.floor, vx: 0, vy: 0, face: -1, alive: true }); st.enemies.push(e);
  const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { st.time += dt; H.update(e, dt); for (const h of heroes) h.box = null; } };
  const blow = (h, box) => { h.hitSet = new Set(); h.box = box; };
  const ropeBox = { l: A.rope - 3, r: A.rope + 3, t: A.floor - 20, b: A.floor - 2 }, winchBox = { l: A.winch - 3, r: A.winch + 3, t: A.floor - 20, b: A.floor - 2 };
  const ring = (h = heroes[0]) => { blow(h, ropeBox); step(1); };
  /* (claude/hcfix) step until the grate BLAZES (the release window), then strike the winch */
  const toReady = () => { for (let i = 0; i < 60 * 6 && !(H.fight().bolt && H.fight().bolt.state === 'ready'); i++) step(1); return !!(H.fight().bolt && H.fight().bolt.state === 'ready'); };
  const release = (h = heroes[0]) => { blow(h, winchBox); step(1); };
  step(1); step(80);   /* asleep -> awake -> on her feet */
  return { H, st, e, A, heroes, step, blow, ring, toReady, release, ropeBox, winchBox, Lw, ctx };
};
const free = w => { w.e.mode = 'walk'; w.e.modeT = 9; w.e.y = w.A.floor; };

console.log('== RESIST: never invulnerable');
for (const m of ['walk', 'lungeTell', 'lunge', 'flurry', 'fanTell', 'trinketTell', 'tiaraWait', 'stomp', 'tantrum', 'handbell', 'bolt', 'perch', 'hopUp', 'recover', 'wake'])
  ok(gpMul({ mode: m }) >= 0.4 && gpMul({ mode: m }) <= 0.5, m + ': ' + gpMul({ mode: m }) + 'x (>= 0.4, never 0)');
ok(gpMul({ mode: 'walk', hiding: true }) === 0.4, 'hiding behind a guard: 0.4x (the floor)');
ok(gpMul({ mode: 'pinned' }) === 1.15 && gpMul({ mode: 'stunned' }) === 1.15 && gpMul({ mode: 'preen' }) === 1 && gpMul({ mode: 'stagger' }) === 1, 'openings: pinned x1.15, stunned x1.15, preen / stagger x1.0');
ok(GP.hp <= 1600 && GP.resist >= 0.4 && GP.endAt === 0 && GP.hp === 1000 && GP.bell.pin === 2.5, 'hp ' + GP.hp + ' (<= 1600), resist >= 0.4, she ends at 0 (a death, gq3), the pin is 2.5 s');

console.log('== THE TOWER BELL: ring -> she bolts -> told -> the grate BLAZES -> a timed blow on the winch -> PINNED');
{ const w = make(); free(w); const gx = w.A.grate.col * TS + 8;
  w.ring(); ok(w.H.fight().M.rings === 1 && w.st.said.includes('YOU RING THE TOWER BELL'), 'a blow on the rope rings it');
  w.step(2); ok(w.e.mode === 'bolt' && w.st.said.some(s => /BOLTS/.test(s)), 'she bolts for the hatch (told)');
  let glowSeen = false, upSeen = false; for (let i = 0; i < 60 * 6 && !(w.H.fight().bolt && w.H.fight().bolt.state === 'ready'); i++) { w.step(1); if (w.H.fight().glowK > 0) glowSeen = true; if (w.e.y < w.A.floor - 20) upSeen = true; }
  ok(upSeen, 'she hops up onto the landing'); ok(glowSeen, 'the grate column glows before it drops');
  ok(!w.st.grates.length && w.H.fight().bolt.state === 'ready' && w.st.said.includes('NOW!'), 'it does not drop by itself: it BLAZES (NOW!) and waits for the winch');
  w.release();
  ok(w.st.grates.length === 1 && w.st.grates[0].c === w.A.grate.col, 'the grate drops (col ' + w.A.grate.col + ')');
  ok(w.e.mode === 'pinned' && Math.abs(w.e.modeT - GP.bell.pin) < 0.05 && Math.abs(w.e.x - gx) < GP.bell.under, 'under it: PINNED ' + GP.bell.pin + ' s');
  const hp0 = w.e.hp, d = w.H.take(w.e, 10); ok(Math.abs(d - 11.5) < 1e-6, 'a blow while pinned: x1.15 (' + d + ')');
  let tot = 0; for (let i = 0; i < 40; i++) tot += w.H.take(w.e, 30); ok(tot <= w.e.maxHp * GP.capK + 1e-6 && w.H.fight().n.capped > 0, 'one opening takes no more than ' + (GP.capK * 100) + ' % of her bar (' + Math.round(tot) + ' of ' + w.e.maxHp + ')');
  free(w); w.e.x = w.A.x0 + 6 * TS; w.step(60); w.ring(); w.step(5); ok(w.e.mode !== 'bolt' && w.st.said.includes('STILL SWINGING'), 'inside the cooldown: STILL SWINGING');
  w.step(60 * GP.bell.cd); free(w); w.ring(); w.step(3); ok(w.e.mode === 'bolt', 'after ' + GP.bell.cd + ' s it answers again'); }
{ const w = make(); free(w); w.ring(); w.step(2); w.release(); ok(w.e.mode === 'ducked' && w.H.fight().n.early === 1 && w.st.grates.length === 1 && w.H.fight().n.pins === 0, 'the winch struck TOO SOON (she is still running): the grate drops, she sees it and ducks, no pin'); }
{ const w = make(); free(w); w.ring(); w.step(2); ok(w.toReady(), 'the blaze'); w.step(Math.ceil(60 * GP.bell.win) + 2); ok(w.e.mode === 'ducked' && w.H.fight().n.slips === 1 && !w.st.grates.length, 'the blaze passes with no blow: she slips out from under it'); }
{ const w = make(); free(w); w.ring(); w.step(2); w.toReady(); w.st.shots.push({ x: w.A.winch, y: w.A.floor - 10, vx: 300, vy: 0, state: 'fly' }); w.step(1); ok(w.e.mode === 'pinned' && w.st.shots[0].state === 'drop', 'AN ARROW in the winch in the blaze releases it too: PINNED (the arrow drops)'); }
{ const w = make(); free(w); w.st.shots.push({ x: w.A.rope, y: w.A.floor - 10, vx: -300, vy: 0, state: 'fly' }); w.step(1); ok(w.H.fight().M.rings === 1, 'an arrow on the rope rings the bell'); w.step(10); w.st.shots.push(w.st.shots[0]); w.step(1); ok(w.H.fight().M.rings === 1, 'one arrow counts once'); }
{ const w = make(); free(w); w.e.hp = w.e.maxHp * 0.69; w.step(2); const F = w.H.fight(); for (let i = 0; i < 3; i++) { w.st.shots.push({ x: w.A.winch, y: w.A.floor - 8, life: 1 }); w.step(1); w.step(20); } ok(F.n.kept === 1, 'embers on the winch crank it: three keep the guards in'); }
{ const w = make(); const F = w.H.fight(); w.e.mode = 'trinketTell'; w.e.modeT = 0.01; w.step(2); const q = F.gems[0]; ok(!!q, 'a gem flies'); w.st.shots.push({ x: q.x, y: q.y, vx: 300, vy: 0, state: 'fly' }); w.step(1); ok(q.away && F.n.knocked === 1, 'an arrow knocks her gem away'); }
{ const w = make(); free(w); w.ring(); w.step(2); w.toReady(); w.H.fight().bolt.state = 'ready'; w.e.x = w.A.grate.col * TS + 8 + 40; w.e.y = w.A.land.y; w.release(); ok(w.e.mode === 'ducked' && w.st.said.includes('SHE DUCKED'), 'not under it at the drop: SHE DUCKED, no pin'); }
{ const w = make(); w.e.mode = 'lungeTell'; w.e.modeT = 9; w.ring(); w.step(10); ok(w.e.mode === 'lungeTell', 'mid-move she is not yanked out of it'); w.e.mode = 'walk'; w.step(2); ok(w.e.mode === 'bolt', 'a moment later she answers the queued ring'); }
{ const w = make(); free(w); w.ring(); w.step(2); const h = w.heroes[0]; h.x = w.A.grate.col * TS + 8 + 4; h.y = w.A.land.y; w.st.dmg.length = 0; w.toReady(); w.release();
  ok(w.st.dmg.some(q => q.o.name === 'THE GRATE' && q.o.unblockable) && Math.abs(h.x - (w.A.grate.col * TS + 8)) >= 14, 'a hero on the landing under it at the drop is shoved clear (unblockable)'); }

console.log('== PARRIES');
{ const w = make(); const h = w.heroes[0]; h.x = w.e.x - 24; w.e.face = -1; w.e.mode = 'lungeTell'; w.e.modeT = 0.01; w.st.parryNext = true; w.step(12);
  ok(w.e.mode === 'stagger' && w.H.fight().n.staggers === 1, 'a parried lunge: she STAGGERS (' + w.e.mode + ')'); ok(gpOpen(w.e), 'staggered is an opening'); }
{ const w = make(); const h = w.heroes[0]; w.H.fight().ph = 2; h.x = w.e.x - 60; w.e.face = -1; w.e.mode = 'tiaraTell'; w.e.modeT = 0.01; w.step(2); ok(!!w.H.fight().tiara, 'the tiara flies'); w.st.parryNext = true;
  for (let i = 0; i < 120 && w.e.mode !== 'stunned'; i++) w.step(1); ok(w.e.mode === 'stunned' && w.H.fight().n.stuns === 1, 'a parried tiara flies home and conks her: STUNNED'); }
{ const w = make(); const h = w.heroes[0]; w.H.fight().ph = 2; h.x = w.e.x - 60; w.e.mode = 'tiaraTell'; w.e.modeT = 0.01; for (let i = 0; i < 200; i++) w.step(1); ok(w.H.fight().n.stuns === 0 && w.st.dmg.some(q => q.o.name === 'HER TIARA' && !q.o.unblockable), 'unparried: a blockable hit, no stun'); }
{ const w = make(); const h = w.heroes[0]; h.x = w.e.x - 20; w.e.mode = 'stompTell'; w.e.modeT = 0.01; w.st.dmg.length = 0; w.step(30); ok(w.st.dmg.some(q => q.o.name === 'HER STOMP' && q.o.unblockable), 'the stomp ripple: unblockable (jump it)'); }
{ const w = make(); const h = w.heroes[0]; h.x = w.e.x - 20; w.e.face = -1; w.e.mode = 'flurryTell'; w.e.modeT = 0.01; w.step(60); ok(w.H.fight().n.preens === 1, 'after her pokes she PREENS (a free window)'); }

console.log('== GUARDS! (70 / 35 %) and the winch');
{ const w = make(); free(w); w.e.hp = w.e.maxHp * 0.69; w.step(2); const F = w.H.fight(); ok(!!F.wave && F.wave.state === 'open' && w.st.said.includes('GUARDS!'), 'at 70 %: GUARDS! - the door rises, the horn runs');
  for (let i = 0; i < 3; i++) { w.blow(w.heroes[0], w.winchBox); w.step(1); w.step(20); } ok(!F.wave && F.n.kept === 1 && !w.st.spawned.length, 'three blows on the winch, each inside 2 s: kept in'); }
{ const w = make(); free(w); w.e.hp = w.e.maxHp * 0.69; w.step(2); w.step(60 * (GP.guards.horn + 0.3)); ok(w.st.spawned.length === 1 && w.st.spawned[0].t === 'soldier', 'fail and the horn runs out: a soldier comes');
  const g = w.st.enemies.find(q => q.t === 'soldier'); const h = w.heroes[0]; g.x = w.e.x - 20; g.y = w.e.y; h.x = w.e.x - 80; free(w); w.step(2); ok(w.e.hiding && gpMul(w.e) === 0.4, 'she HIDES behind him (0.4x)'); }
{ const w = make(3); free(w); w.e.hp = w.e.maxHp * 0.69; w.step(2); w.step(60 * (GP.guards.horn + 0.3)); ok(w.st.spawned.length === 2, '3 seats: one more soldier (' + w.st.spawned.map(s => s.t).join() + ')'); }
{ const w = make(2); free(w); w.e.hp = w.e.maxHp * 0.69; w.step(2); const F = w.H.fight(); w.blow(w.heroes[0], w.winchBox); w.step(1); w.step(20); w.blow(w.heroes[1], w.winchBox); w.step(1); w.step(20); w.blow(w.heroes[0], w.winchBox); w.step(1); ok(F.n.kept === 1, '2 seats: blows from both seats add up'); }

console.log('== THE TANTRUM, THE ESCAPE');
{ const w = make(); free(w); w.e.hp = w.e.maxHp * 0.49; w.step(2); ok(w.H.fight().ph === 2 && w.st.said.some(s => /TANTRUM/.test(s)), 'below half: the tantrum (phase two)');
  const d0 = w.H.take(w.e, 20); ok(d0 > 0, 'the tantrum is not a free invulnerability (' + d0 + ')'); }
{ const w = make(); free(w); w.e.hp = w.e.maxHp * 0.12; const d = w.H.take(w.e, 9999); w.e.hp -= d;
  ok(w.e.hp >= 1 && w.e.hp <= 1.0001 && w.e.mode === 'dying' && w.st.said.includes('MOTHER...'), 'a killing blow takes her bar to 0 (1 hp held for the last act): MOTHER... and the dying');
  ok(w.H.take(w.e, 50) === 0 && !w.H.escaped(w.e), 'while she rings nothing lands (she is dead, not a guard) and she does not escape');
  w.step(60 * 1.3); ok(w.e.dyRings === 3 && !w.e.dyHeard, 'three weak rings of her handbell, then the hall has not answered yet (0.4 s after the last)');
  w.step(60 * 0.4); ok(w.e.dyHeard && w.st.said.includes('THE QUEEN HAS HEARD'), 'the Great Hall bell answers: THE QUEEN HAS HEARD');
  w.step(60 * 0.3); ok(w.H.dead(w.e), 'the collapse is done (1.8 s in all): main hands her to the ordinary death (a body, miniEnd)'); }

console.log('== CO-OP 1-4 seats');
for (const n of [2, 3, 4]) { const w = make(n); free(w); w.ring(w.heroes[n - 1]); w.step(3); ok(w.e.mode === 'bolt', n + ' seats: the LAST seat rings the bell');
  const v = make(n); for (const h of v.heroes) h.x = v.e.x - 20; v.e.mode = 'stompTell'; v.e.modeT = 0.01; v.st.dmg.length = 0; v.step(30); ok(new Set(v.st.dmg.filter(q => q.o.name === 'HER STOMP').map(q => q.who)).size === n, n + ' seats: the stomp tests every seat'); }

console.log('== THE CHASE and the alarm towers');
{ const w = make(); const Ch = w.Lw.gpChase, h = w.heroes[0]; h.y = Ch.floor; h.x = Ch.x0 - 40; w.H.level(1 / 60); const C0 = w.H.test.chase(); ok(C0 && C0.state === 'idle', 'idle until a hero is on the walk');
  h.x = Ch.x0 + 20; w.H.level(1 / 60); ok(w.H.test.chase().state === 'run' && w.st.said.includes('GUARDS! GUARDS!'), 'she sees you and runs (GUARDS! GUARDS!)');
  const run = secs => { for (let i = 0; i < 60 * secs; i++) { w.st.time += 1 / 60; const C = w.H.test.chase(); if (C && C.x - h.x > 120) h.x += 2.6; w.H.level(1 / 60); h.box = null; } };
  const TW = w.H.test.towers(); for (let k = 0; k < 60 && !TW.has('tower1'); k++) run(0.5); ok(TW.has('tower1'), 'she rings tower 1\'s alarm');
  const W1 = TW.get('tower1'), Tw1 = Ch.towers[0]; const wb = { l: Tw1.winch - 3, r: Tw1.winch + 3, t: Tw1.floor - 20, b: Tw1.floor - 2 };
  if (W1.state === 'open') { for (let i = 0; i < 3; i++) { w.blow(h, wb); w.H.level(1 / 60); h.box = null; w.st.time += 0.3; } } ok(W1.state === 'kept', 'tower 1: three blows on its winch keep the guardroom in');
  run(40); const C = w.H.test.chase(); ok(TW.has('tower2'), 'she rings tower 2\'s alarm');
  ok(C.state === 'in', 'she reaches her bell tower (' + C.state + ', x ' + Math.round(C.x / TS) + ')');
  ok(w.st.spawned.some(s => (G4 ? s.cnSkin === 'gobknight' : s.t === 'pike')), 'tower 2 left alone: its guardroom is out (pike, soldier, hound)');
  w.H.clear(); w.H.level(1 / 60); ok(!w.H.test.chase() || w.H.test.chase().state === 'in', 'a death after she is in her tower: the chase is not replayed'); }
{ const w = make(); const Ch = w.Lw.gpChase, h = w.heroes[0]; h.y = Ch.floor; h.x = Ch.x0 + 20; w.H.level(1 / 60); w.H.clear(); w.H.level(1 / 60); ok(!w.H.test.chase() || w.H.test.chase().state !== 'in', 'a death mid-chase: it starts again'); }

console.log('== THE BANQUET REHEARSAL');
{ const w = make(); const Q = w.Lw.gpRehearsal, h = w.heroes[0]; h.x = Q.x0 + 20; h.y = Q.floor;
  const cap = { t: 'heavy', elite: true, alive: true, x: Q.x1 - 6 * TS, y: Q.floor, h: 22, stagger: 0, face: -1 }; w.st.enemies.push(cap);
  w.H.level(1 / 60); w.blow(h, { l: Q.rope - 3, r: Q.rope + 3, t: Q.floor - 20, b: Q.floor - 2 }); w.H.level(1 / 60); h.box = null;
  let grate = 0; for (let i = 0; i < 60 * 6; i++) { w.st.time += 1 / 60; w.H.level(1 / 60); if (w.st.grates.length) { grate = 1; break; } }
  ok(grate && w.st.grates[0].c === Q.grate.col, 'the bell rope: her Captain storms to the sound, the banquet grate drops');
  ok(cap.gpPinUntil > w.st.time && cap.stagger >= GP.reh.pin - 0.01, 'under it he is pinned ' + GP.reh.pin + ' s (main.js: x' + GP.reh.pinMul + ' while gpPinUntil)');
  for (let i = 0; i < 60 * 5; i++) { w.st.time += 1 / 60; w.H.level(1 / 60); } ok(!!w.H.test.rehearsal().W || w.H.test.rehearsal().joined, 'the servery door horns (its winch keeps the garrison in)');
  for (let i = 0; i < 60 * 8; i++) { w.st.time += 1 / 60; w.H.level(1 / 60); } ok(w.st.spawned.filter(s => ['soldier', 'javelin', 'pike'].includes(s.t)).length === 3, 'left alone, the servery is out: soldier, javelin, pike'); }

console.log('== SHARED RULE CODE (src/bell-winch.js)');
{ const M0 = {}; ok(BW.ringBell(M0, 0, 8, 1) === 'rung' && BW.ringBell(M0, 3, 8, 1) === 'swinging' && BW.ringBell(M0, 8.1, 8, 1) === 'rung', 'ringBell: a cooldown'); const W0 = BW.waveOpen(0, 6);
  ok(BW.crankWinch(W0, 1, 3, 2) === 1 && BW.crankWinch(W0, 4, 3, 2) === 1 && BW.crankWinch(W0, 5, 3, 2) === 2 && BW.crankWinch(W0, 6, 3, 2) === 'kept', 'crankWinch: a slow hand starts again'); }

console.log('== WIRING');
{ const m = rd('src/main.js'), q = rd('src/gqueen-hands.js'), g = rd('src/boss-greed.js'), r = rd('src/boss-read.js'), mk = rd('src/marks.js');
  ok(/case 'gprincess': \{ enemies\.push\(GPH\.spawn\(base\)\)/.test(m) && /GPH\.take\(e, dmg, tag\)/.test(m) && /GPH\.dead\(e\)[^\n]*hurtEnemy\(e, e\.hp \+ 5/.test(m) && !/cameo\(g, cx/.test(rd('src/goblin-princess.js')), 'main.js: her spawn, her take, the dying handing her to the ordinary death (a body); no cameo');
  ok(/case 'murderhole': props\.push\(murderHoleProp\(e\)\)/.test(m) && /function updateMurderHoles/.test(m) && /GPH\.level\(dt\)/.test(m), 'main.js: the murder holes and the level hooks');
  ok(/gprincess: 'HER BELL IS SILENT/.test(m) && /t: 'gprincess', name: 'THE GOBLIN PRINCESS'/.test(m) && /gprincess: GPM\.GP\.hp/.test(m), 'main.js: MINI_DONE, the bestiary, EHP');
  ok(/from '\.\/bell-winch\.js'/.test(q) && /BW\.ringBell\(/.test(q) && /BW\.crankWinch\(/.test(q), 'the Queen\'s hands use the shared rule code');
  ok(/gprincess: e => gpOpen\(e\)/.test(g) && /'gprincess'\]\)/.test(g) && /gprincess:/.test(r), 'boss-greed opening + own cap, boss-read');
  ok(Object.keys(GPX.GP_MODES).every(k => mk.includes("'gprincess|" + k + "'")), 'marks: every told move'); }

console.log(fails ? '\nFAIL gprincess (' + fails + ')' : '\nall ok');
process.exit(fails ? 1 : 0);
