// tools/gq4p.mjs - THE GOBLIN PRINCESS, GQ4P (claude/gq4p-d; scratch gq4-plan.md section 2): THE GATES, THE KEY, THE ADD PHASE, THE PIROUETTE. Node only, no page.
//   BRACKEN_GQ4L=1 BRACKEN_GQ4P=1 node tools/gq4p.mjs     (both flags: the 46-column room is GQ4L's)   flags OFF: node tools/gq4p.mjs just proves the Princess is master's (no gates, hp 1000)
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const { LEVELS } = await imp('src/level.js'); const { G4 } = await imp('src/gq4l.js'); const { P4 } = await imp('src/gq4p.js');
const GPX = await imp('src/goblin-princess.js'), { GP, gpMul, CHAINS } = GPX;
const BWT = await imp('src/bell-winch.js');   /* (gq4tune-d) the add count rides BW.ADDN */
const TS = 16;
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
const pinAt = (w, G) => ({ l: G.pinX - 3, r: G.pinX + 3, t: w.A.floor - 24, b: w.A.floor - 2 });
if (!(P4 && G4)) {
  console.log("== FLAGS OFF: master's Princess");
  const w = make(); ok(GP.hp === 1000 && !w.H.fight().G, 'hp ' + GP.hp + ', no gates'); ok(!CHAINS[2].flat().includes('pirouette') && !CHAINS[1].flat().includes('key'), 'no key, no pirouette in the chains');
  console.log(fails ? '\n' + fails + ' FAIL' : '\nall ok (flags off; run with BRACKEN_GQ4L=1 BRACKEN_GQ4P=1 for the gates)'); process.exit(fails ? 1 : 0);
}
const gm = w => w.H.fight().G;
const w0 = make();
console.log('== LAYOUT + START');
ok(GP.hp === 1080 && GP.resist === 0.4 && GP.capK === 0.10, 'hp 1080, resist 0.4, capK 0.10 kept');
ok(!!w0.A.gq4Gates && ['W', 'E', 'U'].every(k => w0.A.gq4Gates[k]), 'the room carries the three gates (W, E, U)');
ok(gm(w0).W.open && !gm(w0).E.open && gm(w0).U.open, 'start: G-W open, G-E shut, G-U open');
ok(CHAINS[1].flat().includes('key') && CHAINS[2].flat().filter(k => k === 'pirouette').length === 2, 'the key is a phase-one move; the pirouette is in two phase-two chains');
{ const Lw = LEVELS.find(l => l.id === 'crown').build(); ok(!Lw.hcDeco.some(d => d.k === 'guarddoor' && d.id === 'bt'), 'the old guardroom door is retired (the winch stays: it releases the grate)'); }

console.log('== GUARDS! (the call, the lanterns, the goblins)');
{ const w = make(); const F = w.H.fight(); free(w); let said = false; for (let i = 0; i < 60 * 12 && !said; i++) { w.step(1); if (w.e.mode === 'callTell') { said = true; gm(w).E.open = false; } else if (w.e.mode === 'walk') w.e.modeT = Math.min(w.e.modeT, 0.01); }
  ok(said && w.st.said.includes('GUARDS!'), 'her handbell call: GUARDS! (tell mode callTell, 1.0 s)'); ok(F.call && F.call.phase === 'tell', 'a call is live');
  for (let i = 0; i < 90 && F.call && F.call.phase !== 'lit'; i++) w.step(1);
  ok(F.call && F.call.phase === 'lit' && gm(w).W.lit === 1 && gm(w).U.lit === 1 && gm(w).E.lit === 0, "the OPEN gates' lanterns light (W, U), the shut one does not");
  w.step(60 * 3.3); ok(w.st.spawned.length === 0, 'nobody before 3.5 s');
  w.step(60 * 0.5); ok(w.st.spawned.length === 2 && w.st.spawned.some(s => s.t === 'soldier' && s.x === gm(w).W.spawnCol) && w.st.spawned.some(s => s.t === 'javelin' && s.x === gm(w).U.spawnCol && s.y === 13), '3.5 s later one goblin per open gate (soldier at W, javelin at U on the gallery)'); }
{ const w = make(3); const F = w.H.fight(); free(w); F.callAt = 1e9; gm(w).E.open = true; F.call = { phase: 'lit', at: w.st.time + 0.1 }; w.step(10); ok(w.st.spawned.length === 2, '3 seats, 3 open gates: capped at maxAlive 2 alive (GQ4TUNE-t: 3 -> 2) (' + w.st.spawned.length + ')'); }
{ const w = make(); const F = w.H.fight(); F.guards = [1, 2, 3].map(() => ({ alive: true, x: 0 })); F.callAt = 0; free(w); w.e.modeT = 0.01; w.step(30); ok(!F.call && w.e.mode !== 'callTell', 'never more than 3 goblins alive: no call while 3 stand'); }

console.log('== KNOCK A GATE SHUT (a blow or a shot on the chain pin)');
{ const w = make(); const F = w.H.fight(); free(w); F.callAt = 1e9; F.call = { phase: 'lit', at: w.st.time + 3.5 }; const G = gm(w).W;
  w.blow(w.heroes[0], pinAt(w, G)); w.step(1);
  ok(!G.open && w.st.said.includes('GATE SHUT') && F.n.gateKnocks === 1, "one blow on G-W's pin: it drops shut"); w.step(60 * 4); ok(w.st.spawned.length === 1 && w.st.spawned[0].t === 'javelin', "only G-U's goblin comes");
  const U = gm(w).U; U.open = true; w.st.shots.push({ x: U.pinX, y: w.A.floor - 20, state: 'fly', vx: 90, life: 1 }); w.step(1); ok(!U.open, "a SHOT (arrow, ember, axe, pirate ball) at floor height on G-U's pin shuts G-U: the chain hangs to the floor");
  const E = gm(w).E; w.blow(w.heroes[0], pinAt(w, E)); w.step(1); ok(!E.open && F.n.gateKnocks === 2, "a blow on a shut gate's pin does nothing"); }

console.log('== THE KEY');
{ const w = make(); const F = w.H.fight(); free(w); F.callAt = 1e9; const E = gm(w).E; w.e.x = E.keyX + 80; ok(w.H.test.keyBegin(w.e) && w.e.mode === 'keyRun', 'she darts to a shut gate');
  for (let i = 0; i < 120 && w.e.mode !== 'keyTell'; i++) w.step(1); ok(w.e.mode === 'keyTell' && Math.abs(w.e.x - E.keyX) < 6 && Math.abs(w.e.modeT - GP.gate.keyTell) < 0.1, 'at its key: the turn is told 1.2 s (!)');
  w.step(60 * 1.3); ok(E.open && F.n.keys === 1, 'unhindered, the gate opens'); }
{ const w = make(); const F = w.H.fight(); free(w); F.callAt = 1e9; const E = gm(w).E; w.e.x = E.keyX; w.H.test.keyBegin(w.e); for (let i = 0; i < 120 && w.e.mode !== 'keyTell'; i++) w.step(1); w.step(20);
  const d = w.H.take(w.e, 10); ok(w.e.mode === 'stagger' && Math.abs(w.e.modeT - 1.5) < 0.05 && d > 0 && F.n.keyStaggers === 1, 'a blow during the turn: STAGGERED 1.5 s (x1.0 opening)'); w.step(60 * 2); ok(!E.open, 'and the gate stays shut'); }

console.log('== 50 %: ALL GATES! - the add phase');
for (const seats of [1, 2, 3]) { const w = make(seats); const F = w.H.fight(); free(w); w.e.hp = w.e.maxHp * 0.49; w.step(2); const want = Math.min(6, BWT.ADDN.n + seats - 1);
  if (seats === 1) { ok(w.e.mode === 'allGatesTell' && w.e.shimmer && w.st.said.includes('ALL GATES!'), 'at 50 %: ALL GATES! (told 1.5 s), the shimmer starts'); ok(w.H.take(w.e, 50) === 0, 'during the tell she cannot be hurt'); }
  w.step(60 * 1.6); const Gs = gm(w); ok(F.add && F.add.state === 'ads' && Object.values(Gs).every(G => G.open && G.lock), seats + ' seat(s): all 3 gates fly open and LOCK open');
  ok(w.st.spawned.length === want, seats + ' seat(s): ' + want + ' goblins in (' + w.st.spawned.map(s => s.t).join() + ')');
  if (seats === 1) { w.step(40); ok(w.e.mode === 'shimmer' && w.e.y < w.A.floor - 20, 'she perches on the landing in the shimmer'); ok(w.H.take(w.e, 500) === 0 && w.st.said.includes('SHE HIDES'), 'INVINCIBLE: blows glance (SHE HIDES), no damage');
    const G = Gs.W; w.blow(w.heroes[0], pinAt(w, G)); w.step(1); ok(G.open, 'a locked gate cannot be knocked shut');
    for (const g of w.st.enemies) if (g !== w.e) g.alive = false; w.step(3); ok(w.e.mode === 'dazed' && !w.e.shimmer && Math.abs(w.e.modeT - 2.0) < 0.1 && gpMul(w.e) === 1.15, 'last ad down: the shimmer shatters, DAZED 2.0 s x1.15');
    ok(w.H.take(w.e, 10) > 0, 'and she can be cut');
    w.step(60 * 2.1); ok(F.ph === 2 && Object.values(Gs).every(G => !G.open && !G.lock) && w.e.mode === 'tantrum', 'then PHASE 2: the gates slam shut, the tantrum is kept'); } }
{ const w = make(); const F = w.H.fight(); free(w); w.e.hp = w.e.maxHp * 0.49; w.step(2); w.step(60 * 2);
  w.step(60 * (GP.gate.failsafe - 1.5)); ok(F.add && F.add.state === 'ads' && w.e.shimmer, 'ads stuck alive: still shimmering just before the failsafe (' + GP.gate.failsafe + ' s)'); w.step(60 * 2); ok(!w.e.shimmer && F.n.failsafes === 1 && F.ph === 2 && w.st.said.includes('THE SHIMMER CRACKS'), '40 s failsafe: the shimmer cracks, phase 2');
  ok(w.H.take(w.e, 10) > 0 && gpMul(w.e) <= 0.5 && F.n.addKilled === 0, 'she takes 0.4x again and the ads keep fighting'); }

console.log('== THE PIROUETTE (phase 2)');
{ const w = make(); const F = w.H.fight(); free(w); F.ph = 2; w.e.phase = 2; F.callAt = 1e9; F.chain = ['pirouette']; F.step = 0; const h = w.heroes[0]; h.x = w.e.x - 90; w.e.modeT = 0.01; w.step(2);
  ok(w.e.mode === 'pirouetteTell' && GPX.GP_MODES.pirouetteTell === '!!', 'told: the heel click, 0.7 s, !! (mode pirouetteTell)'); w.step(60 * 0.75); ok(w.e.mode === 'pirouette', 'the spin begins');
  const n0 = w.st.dmg.length; for (let i = 0; i < 60 * 4; i++) { h.y = w.A.floor; h.x = w.e.x; w.step(1); if (w.e.mode !== 'pirouette') break; }
  ok(w.st.dmg.length - n0 >= 1 && w.st.dmg.some(d => d.d === GP.pir.dmg && d.o.name === 'HER PIROUETTE'), 'stand in it: ' + GP.pir.dmg + ' damage at shin height');
  ok(w.e.mode === 'dizzy' && Math.abs(w.e.modeT - 1.4) < 0.05 && gpMul(w.e) === 1.0, 'after two passes: DIZZY 1.4 s (x1.0)'); }
{ const w = make(); const F = w.H.fight(); free(w); F.ph = 2; F.callAt = 1e9; F.chain = ['pirouette']; F.step = 0; const h = w.heroes[0]; h.x = w.e.x - 90; w.e.modeT = 0.01; w.step(2); const n0 = w.st.dmg.length;
  for (let i = 0; i < 60 * 8 && w.e.mode !== 'dizzy'; i++) { w.step(1); h.y = w.A.floor - 22; h.x = w.e.x; }
  ok(w.st.dmg.length === n0, 'JUMP it: no damage (the blade is at shin height)'); w.e.mode = 'walk'; F.pirAt = w.st.time + 5; F.chain = ['pirouette', 'lunge']; F.step = 0; w.e.modeT = 0.01; w.step(2); ok(w.e.mode !== 'pirouetteTell', 'cd 9 s: a second pirouette inside it is skipped'); }

console.log(fails ? '\n' + fails + ' FAIL' : '\nall ok'); process.exit(fails ? 1 : 0);
