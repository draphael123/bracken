// tools/keep-floods.mjs - UNDERWATER KEEP 2 (claude/keepfloods): THE FLOODGATES + THE DROWNED KING 2. Node only: no page, no port, no Chrome.
//   node tools/keep-floods.mjs        the flag both ways, the chambers (geometry + both states pass + the kit's lint), the hands on a fake world (levers,
//                                     marks, caps, floor-bound knights), and THE KING on the real throne room with a fake body: every move told, the
//                                     floodgate beaches him, the gate pins him, B15 floor in every state, the curse, his tide (the kit's cycle), P2's moves.
// What it is NOT: a play. The real collision, the heroes' routes (real keys), co-op, the boss win-rate WITH flasks are the browser walk, owed.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const h12 = s => createHash('sha1').update(s).digest('hex').slice(0, 12);
const strip = o => JSON.stringify(o, (k, v) => typeof v === 'function' ? undefined : v);

if (args.includes('--off')) {
  delete process.env.KF; const { install } = await import('./node-canvas.mjs'); install();
  const { LEVELS } = await import('../src/level.js'); const L = LEVELS.find(l => l.id === 'keep').build();
  console.log(JSON.stringify({ grid: h12(Buffer.from(L.grid)), ents: h12(strip(L.ents)), all: h12(strip({ ...L, grid: undefined })), whirl: (L.whirlpools || []).length,
    kf: !!(L.keepFloods || L.tides || L.kfThrone || (L.pools || []).some(p => p.kfPool)) }));
  process.exit(0);
}
process.env.KF = '1';
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const KF = await import('../src/keep-floods.js');
const K2M = await import('../src/drowned-king2.js');
const { makeKeepFloodsHands } = await import('../src/keep-floods-hands.js');
const { makePirateFleetHands } = await import('../src/pirate-fleet-hands.js');   /* (claude/sea2) the ONE water wiring: the keep's hands ride its hooks (main.js: PFH.strike, KFH.update, PFH.update) */
const TK = await import('../src/tide-kit.js');
const L0 = LEVELS.find(l => l.id === 'keep').build();

/* ---------- 1. THE FLAG ---------- */
/* the keep as it was on the base (claude/waterkit e08836df8 = master rel144 for this file set). If master changes the keep, re-stamp from --off. */
const BASE = { grid: '94b12ec69f9b', ents: '2a373743b05f', all: '9c01ccca53be' };
{
  ok(KF.KF_SHIPS === false, 'KF_SHIPS is false on the branch (art before live)');
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--off'], { encoding: 'utf8', env: { ...process.env, KF: '' } });
  const off = JSON.parse((r.stdout || '').trim().split('\n').pop());
  ok(off.whirl === 4 && !off.kf, 'flag OFF: the live keep (four whirlpools, no floodgate data) - ' + JSON.stringify(off));
  const same = off.grid === BASE.grid && off.ents === BASE.ents && off.all === BASE.all;
  console.log('  flag OFF build ' + (same ? '== the base keep, cell for cell (grid ' + off.grid + ', ents ' + off.ents + ', all ' + off.all + ')' : 'DIFFERS from the stamped base (master moved the keep? re-stamp BASE): ' + JSON.stringify(off)));
  if (same) n++;
  ok(L0.keepFloods && (L0.whirlpools || []).length === 0 && L0.tides.length === KF.KF_CHAMBERS.length + 2, 'flag ON: the whirlpools are out, ' + KF.KF_CHAMBERS.length + ' chambers + the throne\'s two tides');
  ok(Array.isArray(L0.tides) && L0.pullSignal === 'curse', 'flag ON: the keep declares L.tides (claude/sea2: the one generic water wiring runs them, its words ride the hooks)');
}

/* ---------- 2. THE CHAMBERS: geometry, both states pass, the kit's lint ---------- */
const at = (L, x, y) => L.grid[y * L.W + x], air = (L, x, y) => at(L, x, y) === T.AIR, solid = (L, x, y) => at(L, x, y) === T.SOLID;
{
  const bad = KF.lintFloods(L0, T); ok(!bad.length, 'lintFloods: ' + bad.join('; '));
  const checkpoints = L0.ents.filter(e => e.t === 'check').map(e => ({ x: e.x, y: e.y }));
  const tl = TK.lintTide({ ...L0, tides: L0.tides, checkpoints }, { run: 96 * 0.8 }); ok(!tl.length, 'lintTide on the keep\'s tides: ' + tl.join('; '));
  for (const c of KF.KF_CHAMBERS) {
    ok(c.role && ['teach', 'test', 'remix'].includes(c.role), c.id + ' has its role');
    /* WATER BFS: from the west neighbour's sump to the east neighbour, through air tiles that are under the line */
    const swim = (lineRow, from, to) => { const seen = new Set(), q = [from], key = (x, y) => x + ',' + y;
      while (q.length) { const [x, y] = q.pop(); if (x === to[0] && y === to[1]) return true; if (seen.has(key(x, y))) continue; seen.add(key(x, y));
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < c.x0 - 2 || nx > c.x1 + 2 || ny < c.top || ny > 58) continue; if (!air(L0, nx, ny)) continue; if (ny < lineRow && nx >= c.x0 && nx <= c.x1) continue; q.push([nx, ny]); } }
      return false; };
    const W = [c.x0 - 1, 58], E = [c.x1 + 1, (c.exitE || [c.sump])[0]];
    ok(swim(c.top, W, E), c.id + ' FLOODED: a swimmer goes from the west sump to the east one through the chamber');
    /* DRAINED: the sumps reach the shafts' surfaces, and the floor walks between them (2 rows of head room) */
    ok(swim(c.floor, W, [c.x0 + 2, c.floor]) && swim(c.floor, [c.x1 - 2, c.floor], E), c.id + ' DRAINED: the sumps reach both shafts\' surfaces (in at the floor, out at the floor)');
    let walk = true; for (let x = c.x0 + 5; x <= c.x1 - 5; x++) if (!(solid(L0, x, c.floor) && air(L0, x, c.floor - 1) && air(L0, x, c.floor - 2))) walk = false;
    ok(walk, c.id + ' DRAINED: the floor walks shaft to shaft (' + (c.x1 - c.x0 - 9) + ' tiles, head room 2)');
    ok(c.knights.length >= 1 && c.knights.length <= 2, c.id + ': ' + c.knights.length + ' knight(s) on the floor (S1: the ground makes them worse, not a crowd)');
    /* flooded, is there a way over the knights out of their sight (> 44 px over their heads)? */
    ok(c.floor - c.top >= 8, c.id + ': flooded, ' + (c.floor - c.top) + ' rows of water over the floor (room to swim over them)');
  }
  const t = KF.KF_CHAMBERS.find(c => c.role === 'teach'), te = KF.KF_CHAMBERS.find(c => c.role === 'test'), rm = KF.KF_CHAMBERS.find(c => c.role === 'remix');
  ok(t.airs.length >= 1 && t.knights.length === 1, 'TEACH is safe: flooded it still has an air, one knight');
  ok(te.airs.length === 1 && te.airs[0][3] >= te.floor - 2, 'TEST: flooded, its one air is down at the knights\' feet (under the hanging stack)');
  ok(rm.start === 'drained' && rm.knights.some(k => k[0] < rm.lever[0]) && rm.knights.some(k => k[0] > rm.lever[0]), 'REMIX: it starts DRY, and its lever stands between its two knights');
  const silver = L0.ents.find(e => e.t === 'silver' && e.x >= te.x0 && e.x <= te.x1);
  ok(silver && silver.y < te.floor - 4, 'TEST: the silver is up in the stacks - only the flood reaches it (a reason to keep it flooded)');
}

/* ---------- 3. THE HANDS ON A FAKE WORLD ---------- */
function world(o = {}) {
  const L = LEVELS.find(l => l.id === 'keep').build(), marks = o.marks || new Set(), said = [], hurt = [], calls = {}, sfx = new Proxy({ calls }, { get: (t, k) => k === 'calls' ? calls : () => { calls[k] = (calls[k] || 0) + 1; } });
  const poolLevel = (p, y) => { p.y = y; const d = p.base - y; p.dry = d <= 1; p.depth = Math.max(0, d); p.shallow = d < 18; };
  for (const p of L.pools) if (p.base === undefined) p.base = p.bottom;
  const P = { x: 0, y: 0, w: 10, h: 20, dead: false, swim: true, ground: false, vx: 0, vy: 0, breath: 6, n: 1 };
  const W = { L, P, marks, said, hurt, sfx, enemies: [], boss: null, bossActive: false, lifeN: 0, t: 0, block: false };
  const solidAt = (x, y) => { const tt = L.grid[y * L.W + x]; return tt === T.SOLID || tt === T.PORT; };
  W.hands = makeKeepFloodsHands({ get L() { return L; }, get players() { return [P]; }, get enemies() { return W.enemies; }, get boss() { return W.boss; }, get bossActive() { return W.bossActive; },
    get pfh() { return W.pfh; }, TS, T, hero: () => P, marks: () => marks, life: () => W.lifeN, time: () => W.t, poolLevel, isSolid: solidAt,
    moveBody: (b, dx, dy) => { const nx = b.x + dx, ny = b.y + dy, r = { hitX: false, hitY: false, ground: false };
      if (solidAt(Math.floor(nx / TS), Math.floor((b.y - 4) / TS))) r.hitX = true; else b.x = nx;
      if (dy > 0 && solidAt(Math.floor(b.x / TS), Math.floor(ny / TS))) { r.hitY = true; r.ground = true; b.y = Math.floor(ny / TS) * TS; } else b.y = ny; return r; },
    cellSet: (x, y, t) => { L.grid[y * L.W + x] = t; }, damagePlayer: (x, d, op) => { const res = W.block && !(op && op.unblockable) ? 'blocked' : 'hit'; hurt.push({ d, res, blow: op && op.blow, t: W.t }); return res; },
    number: (x, y, t) => said.push(String(t)), shake: () => {}, sfx });
  W.pfh = makePirateFleetHands({ get L() { return L; }, hooks: () => W.hands.water, get players() { return [P]; }, hero: () => P, marks: () => marks, poolLevel, moveBody: (b, dx, dy) => ({}), holding: () => false, enemies: () => W.enemies, parts: () => [], VW: () => 320,
    view: () => ({ x0: 0, y0: 0, x1: 320, y1: 240 }), burst: () => {}, sparks: () => {}, time: () => W.t, sound: () => {}, number: (x, y, t) => said.push(String(t)), shake: () => {}, TS });
  W.pfh.clear();   /* spawnEntities: the generic wiring builds the kit first */
  W.step = (dt, hb) => { W.t += dt; W.hands.update(dt); if (hb) W.pfh.strike(hb); W.pfh.update(dt); };
  W.hbAt = (tx, ty) => { const x = tx * TS + 8, y = (ty + 1) * TS; return { l: x - 6, r: x + 6, t: y - 20, b: y - 6 }; };
  return W;
}
{
  const W = world(), { L, marks } = W;
  W.step(1 / 60);
  for (const c of KF.KF_CHAMBERS) { const p = L.pools.find(q => q.id === c.id);
    ok(c.start === 'flooded' ? (p.capped && p.y === (c.top - 1) * TS) : (!p.capped && p.y === c.floor * TS), c.id + ' starts ' + c.start + ' (line ' + p.y / TS + ', capped ' + p.capped + ')'); }
  /* a knight in a chamber is floor-bound, one outside is not */
  const kin = { t: 'drownedknight', x: KF.KF_CHAMBERS[0].knights[0][0] * TS + 8, y: (KF.KF_CHAMBERS[0].knights[0][1] + 1) * TS }, kout = { t: 'drownedknight', x: 52 * TS + 8, y: 48 * TS };
  W.enemies.push(kin, kout); W.step(1 / 60);
  ok(kin.floorBound === true && kout.floorBound === false, 'the chamber\'s knight is floor-bound; the court\'s knight still swims');
  /* strike every chamber's lever: it flips, the water moves to the other state in the kit's time, the mark is kept; strike again: back, mark gone */
  for (const c of KF.KF_CHAMBERS) {
    const p = L.pools.find(q => q.id === c.id), hb = W.hbAt(c.lever[0], c.lever[1]);
    W.step(1 / 60, hb); for (let i = 0; i < 60 * 3; i++) W.step(1 / 60);
    const fl = c.start === 'flooded', key = 'tide:' + c.id + ':lever:' + c.lever[0] + ',' + c.lever[1];
    ok(fl ? (p.y === c.floor * TS && !p.capped) : (p.y === (c.top - 1) * TS && p.capped), c.id + ': its lever ' + (fl ? 'DRAINS' : 'FLOODS') + ' it in <= 3 s (line ' + p.y / TS + ')');
    ok(marks.has(key), c.id + ': the thrown lever is a mark (' + key + ')');
    ok(W.said.some(s => /FLOODGATE/.test(s)), c.id + ': it says what it did');
  }
  /* a death keeps them (the mark); a reload keeps them (tideInit reads the marks) */
  W.lifeN++; W.pfh.clear(); W.step(1 / 60);   /* a death reloads: spawnEntities clears the generic wiring, then the hands see the new life */
  for (const c of KF.KF_CHAMBERS) { const p = L.pools.find(q => q.id === c.id); ok(c.start === 'flooded' ? p.y === c.floor * TS : p.y === (c.top - 1) * TS, c.id + ': a death keeps the chamber as the lever left it'); }
  const W2 = world({ marks }); W2.step(1 / 60);
  for (const c of KF.KF_CHAMBERS) { const p = W2.L.pools.find(q => q.id === c.id); ok(c.start === 'flooded' ? p.y === c.floor * TS : p.y === (c.top - 1) * TS, c.id + ': a reload keeps it (the mark)'); }
  for (const c of KF.KF_CHAMBERS) { W.step(1 / 60, W.hbAt(c.lever[0], c.lever[1])); for (let i = 0; i < 60; i++) W.step(1 / 60); }
  ok(KF.KF_CHAMBERS.every(c => !marks.has('tide:' + c.id + ':lever:' + c.lever[0] + ',' + c.lever[1])), 'struck back: every chamber at its start, no marks left');
}

/* ---------- 4. THE DROWNED KING 2 on the real throne room ---------- */
const K2 = K2M.K2;
{
  /* B15: every state he can be in, every multiplier >= 0.4 */
  const e = { t: 'drownedking', hp: 1000, maxHp: 1000 }; K2M.k2Init(e);
  ok(e.maxHp === 1600, 'hp x' + K2.hpMul + ' of the live king (placeholder for the tune lane)');
  let low = 9, seen = 0;
  for (const mode of ['swim', 'walk', 'thrustTell', 'thrust', 'sweep', 'hurlTell', 'decreeTell', 'pinned', 'heave', 'curse', 'graspTell', 'leech', 'prongTell', 'shellTell', 'recoil'])
    for (const k of [0, 1]) for (const out of [false, true]) for (const shell of [false, true]) for (const ward of [0, 1]) for (const ph of [1, 2]) for (const pl of [false, true]) for (const mt of [0.1, 3]) {
      Object.assign(e, { mode, modeT: mt }); Object.assign(e.k2, { k, ph, ward, shell, shellOpenT: 0 }); e.k2.tr.out = out; const m = K2M.k2Mul(e, pl); low = Math.min(low, m); seen++; }
  ok(low >= K2.floor - 1e-9, 'B15: the lowest multiplier over ' + seen + ' states is x' + low + ' (floor ' + K2.floor + ')');
  const at2 = (st) => { const q = { t: 'drownedking', hp: 1000, maxHp: 1000 }; K2M.k2Init(q); Object.assign(q, st.e || {}); Object.assign(q.k2, st.s || {}); return K2M.k2Mul(q, !!st.pl); };
  ok(at2({ e: { mode: 'swim' }, s: { k: 1 } }) === K2.home && at2({ e: { mode: 'walk' }, s: { k: 0 } }) === K2.beached, 'home (flooded) x' + K2.home + ', BEACHED (drained) x' + K2.beached);
  ok(at2({ e: { mode: 'pinned', modeT: 2 }, s: { k: 1 } }) === K2.pinMul, 'PINNED under the gate x' + K2.pinMul);
  ok(at2({ e: { mode: 'swim' }, s: { k: 1, shell: true } }) === K2.floor && at2({ e: { mode: 'swim' }, s: { k: 1, shell: true }, pl: true }) === K2.shellOpen, 'BONE SHELL: x0.4 to a blade, a plunge breaks it (x' + K2.shellOpen + ')');
  for (const [m, v] of Object.entries(K2M.K2_TELLS)) ok(v.t >= 0.5 && (v.answer), 'tell ' + m + ' ' + v.t + ' s ' + (v.mark || '(shown)') + ' -> ' + v.answer);
  for (const m of ['thrustTell', 'thrust', 'sweepTell', 'sweep', 'hurlTell', 'hurl', 'decreeTell', 'decree', 'pinned', 'curse', 'graspTell', 'leechTell', 'prongTell', 'shellTell']) ok(K2M.K2_POSES[m], 'a pose named for ' + m + ' (art lane)');
}
{
  const W = world(), { L } = W, A = L.arena, Th = L.kfThrone, gx = Th.gateCol * TS + 8;
  const king = { t: 'drownedking', x: 738 * TS + 8, y: 52 * TS, w: 30, h: 32, hp: 1000, maxHp: 1000, mode: 'sleep', modeT: 0, face: -1, alive: true, vx: 0, vy: 0 };
  W.enemies.push(king); W.boss = king; W.step(1 / 60);
  ok(W.hands.king(king, 1 / 60) === false, 'asleep, the live code keeps him (nothing changes before the fight)');
  W.bossActive = true; king.mode = 'wake'; king.modeT = 1.6;
  const P = W.P; Object.assign(P, { x: 716 * TS, y: 45 * TS, swim: true });
  const modes = [], tellT = {}; let last = null, lastT = 0, gateSeen = false, gateLifted = false;
  const run = (secs, hb, each) => { for (let i = 0; i < secs * 60; i++) { W.step(1 / 60, i === 0 ? hb : null); W.hands.king(king, 1 / 60);
      const th = L.pools.find(p => p.id === 'kfthrone'); P.swim = !th.dry && P.y > th.y + 8;
      if (king.mode !== last) { if (last && /Tell$/.test(last)) tellT[last] = Math.min(tellT[last] ?? 9, W.t - lastT); modes.push(king.mode); last = king.mode; lastT = W.t; }
      if (L.grid[50 * L.W + Th.gateCol] === T.PORT) gateSeen = true; else if (gateSeen) gateLifted = true;
      if (each) each(i); } };
  run(40, null, i => { if (i % 240 === 0) P.x = (i / 240) % 2 ? 744 * TS : 714 * TS; });   /* the hero changes sides now and then */
  ok(king.k2 && king.maxHp === 1600, 'he wakes as the Drowned King 2 (hp x' + K2.hpMul + ')');
  for (const m of ['thrust', 'hurl', 'decree']) ok(modes.includes(m), 'P1 uses ' + m.toUpperCase() + ' (' + modes.filter(q => q === m).length + 'x in 40 s)');
  for (const [m, t] of Object.entries(tellT)) ok(t >= 0.45, 'told: ' + m + ' held ' + t.toFixed(2) + ' s at least');
  ok(gateSeen && gateLifted, 'ROYAL DECREE drops the portcullis in its column and it goes back up');
  ok(modes.indexOf('thrust') < 0 || modes.slice(0, modes.indexOf('thrust')).includes('thrustTell'), 'no thrust before its tell');
  /* THE FLOODGATE: strike the west lever with him away from the gate - the room drains, he is beached (x1), then he calls the sea back */
  king.k2.decreeT = 99; king.k2.hurlT = 99; king.k2.tr.out = false; king.k2.ward = 0;
  Object.assign(king, { x: 742 * TS, mode: 'swim', modeT: 0.5 }); king.k2.leverCd = 0;
  run(1 / 60 * 2, W.hbAt(Th.levers[0][0], Th.levers[0][1]));
  run(3);
  const thp = L.pools.find(p => p.id === 'kfthrone');
  ok(thp.dry && king.beached && K2M.k2Mul(king) === K2.beached, 'THE FLOODGATE: the throne room drains (line ' + (thp.y / TS) + '), he is BEACHED, x' + K2M.k2Mul(king));
  king.k2.decreeT = 0; run(K2.beachFor + K2.decreeTell + 3);
  ok(!thp.dry && king.swimming, 'beached past ' + K2.beachFor + ' s he decrees and THE SEA COMES BACK');
  /* THE GATE ON HIM: under the raised gate, a lever pins him (x1.5), and the gate stands on him, not through him */
  for (let i = 0; i < 400 && W.hands.debug().gate; i++) run(1 / 60);
  Object.assign(king, { x: gx, mode: 'swim', modeT: 2, vx: 0, vy: 0 }); king.k2.leverCd = 0; king.k2.gateT = 0; king.k2.decreeT = 99; king.k2.thrustT = 99; king.k2.hurlT = 99; king.k2.sweepT = 99;
  run(1 / 60); ok(king.underGate, 'under the raised gate he is marked (the gold column)');
  run(1 / 60 * 2, W.hbAt(Th.levers[1][0], Th.levers[1][1]));
  ok(king.mode === 'pinned' && K2M.k2Mul(king) === K2.pinMul && king.open > 0, 'a lever with him under it: THE GATE COMES DOWN ON HIM (pinned, x' + K2.pinMul + ', open ' + king.open.toFixed(1) + ' s)');
  const headRow = Math.floor((king.y - king.h) / TS); ok(L.grid[(headRow + 1) * L.W + Th.gateCol] !== T.PORT && L.grid[(Th.top) * L.W + Th.gateCol] === T.PORT, 'the pinning gate stands on him (bars above his head, none through him)');
  run(K2.pinT + K2.heave + 0.2);
  ok(king.mode !== 'pinned' && king.k2.ward > 0 && K2M.k2Mul(king) === K2.floor, 'he heaves it off: a told ward after (x' + K2.floor + ', grey), not a stun-lock');
  ok(!W.hands.debug().gate, 'the gate goes back up off him');
  /* THE HURL: bare-handed while it is out = open; it comes back told */
  king.k2.ward = 0; king.k2.hurlT = 0; king.k2.thrustT = 99; king.k2.decreeT = 99; Object.assign(P, { x: 724 * TS, y: 40 * TS }); Object.assign(king, { x: 744 * TS, y: 40 * TS, mode: 'swim', modeT: 0 });
  let bare = false, recalled = false; run(6, null, () => { if (king.k2.tr.out && king.k2.tr.stuck && king.open > 0) bare = true; if (king.mode === 'recallTell') recalled = true; });
  ok(bare && recalled, 'THE HURL: it sticks, he is BARE-HANDED (open, gold), and he calls it back with a tell');
  /* THE CURSE at half, then HIS TIDE (the kit's cycle) */
  king.hp = 790; const tolls0 = W.sfx.calls.seaBell || 0; let curse = false, lowSeen = false, highAgain = false;
  run(30, null, () => { if (king.mode === 'curse') curse = true; const k = TK.kOf(W.hands.debug().kit, 'curse'); if (king.k2.ph === 2 && k <= 0.01) lowSeen = true; if (lowSeen && k >= 0.99) highAgain = true; });
  ok(curse && king.k2.ph === 2 && king.cursed && thp.tide === 'curse', 'AT HALF: THE CURSE TAKES HIM - phase two, the room on his tide');
  ok(lowSeen && highAgain && (W.sfx.calls.seaBell || 0) - tolls0 >= 4, 'HIS TIDE goes out and comes in, told (' + ((W.sfx.calls.seaBell || 0) - tolls0) + ' tolls)');
  const p2 = new Set(); run(60, null, i => { p2.add(king.mode); if (i % 300 === 0) Object.assign(P, { x: (i / 300) % 2 ? 742 * TS : 718 * TS, y: P.swim ? 44 * TS : 58 * TS }); });
  for (const m of ['graspTell', 'prongTell']) ok(p2.has(m), 'P2 uses ' + m.replace('Tell', '').toUpperCase());
  ok(p2.has('leechTell') || p2.has('leech'), 'P2 uses BREATH LEECH');
  king.hp = 380; run(2); ok(king.k2.shell || king.mode === 'shellTell', 'at a quarter: BONE SHELL');
  /* a respawn puts the room back: flooded, gate up, the curse tide parked */
  W.bossActive = false; W.boss = null; W.lifeN++; run(1 / 60 * 3);
  ok(thp.tide === 'throne' && !W.hands.debug().gate, 'the fight over (a death): the throne room back on its floodgate, flooded, the gate up');
  ok(W.hurt.length > 0 && W.hurt.every(h => h.d > 0), 'his blows land through damagePlayer (' + W.hurt.length + ' in the sim)');
}

/* (claude/sea6-d) THE PAGE WIRING: main.js builds the hands with its own ctx and this tool builds them with a ctx of its own, so a ctx member the hands read but main.js never gave
   passed 105 checks while the page threw: kitOf() read ctx.pfh, main.js had no `get pfh`, and the Drowned King 2 threw in k2Step every frame the first time he woke. Every ctx.<name>
   the hands read must be on main.js's KFH ctx line. */
{
  const { readFileSync } = await import('node:fs');
  const hands = readFileSync(new URL('../src/keep-floods-hands.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const line = main.split(/\r?\n/).find(l => l.startsWith('KFH = kfOn() ? makeKeepFloodsHands(')) || '';
  const used = [...new Set([...hands.matchAll(/ctx\.([A-Za-z_]\w*)/g)].map(m => m[1]))];
  const given = k => new RegExp('(?:get\\s+' + k + '\\s*\\(|[,{]\\s*' + k + '\\s*[:,}(])').test(line);
  const missing = used.filter(k => !given(k));
  ok(line.length > 0 && !missing.length, 'main.js KFH ctx carries every ctx.<name> the hands read (' + used.length + ' names)' + (missing.length ? ': MISSING ' + missing.join(', ') : ''));
}

console.log('keep-floods: ' + n + ' checks ok');
