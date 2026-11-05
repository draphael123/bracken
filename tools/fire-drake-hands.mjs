/* tools/fire-drake-hands.mjs - THE FIRE DRAKE's WIRING, node only (claude/drakewire, lane D1). No page, no port, no Chrome.
   1. THE ROOM: src/drake-caldera.js is a HIDDEN LEVELS row (no needs: on no road - art before live), its arena is 32 tiles with the seal in the middle,
      every bait spot (src/fire-drake.js baitOf) is inside it, the ledges stand outside the P2 ring and over the breath and the sweep, a shrine near its door.
   2. THE HANDS against a stub world: it sleeps until woken, its blows reach the hero KEYED once a blow (the claw blockable, every red !! not), the
      P3 tear sinks the ledges, an empty bar is SPARED (never killed) - it lunges once more, falls on the split seal, and only then is the fight won
      (ctx.beaten) with the shrine set by the seal. Every pose and every overlay draws without a throw (a recording 2D context).
   3. THE HOOKS: main.js, src/lab.js, src/boss-greed.js, src/boss-read.js and src/hint-lines.js carry the drake's thin hooks.
   node tools/fire-drake-hands.mjs */
import fs from 'fs'; import path from 'path'; import assert from 'assert'; import { fileURLToPath } from 'url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FDM = await import('../src/fire-drake.js'); const { FD, POSE } = FDM;
const { makeFireDrakeHands, drawDrake, SOUND } = await import('../src/fire-drake-hands.js');
const { DC } = await import('../src/drake-caldera.js');
const { LEVELS } = await import('../src/level.js');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const TS = 16;

/* ---------- 1. THE ROOM ---------- */
const row = LEVELS.find(l => l.id === 'drakelab'); ok(row, 'no drakelab LEVELS row');
ok(row.hidden === true && !row.needs && !row.spurOf, 'THE CALDERA must be hidden and on no road (art before live): ' + JSON.stringify({ hidden: row.hidden, needs: row.needs }));
const L = row.build(), A = L.arena;
ok(A.boss === 'firedrake' && L.ents.filter(e => e.t === 'firedrake').length === 1, 'one firedrake, the arena boss');
ok(A.x1 - A.x0 === 32 * TS, 'the caldera is 32 tiles: ' + (A.x1 - A.x0));
ok(A.seal === (A.x0 + A.x1) / 2, 'the seal is in the middle');
const G = FDM.geom(A, TS), S0 = FDM.newFight(G);
for (const ph of [1, 2, 3]) { S0.ph = ph; for (const sd of [-1, 1]) { const b = FDM.baitOf(S0, sd); ok(b > G.x0 + 4 && b < G.x1 - 4, 'P' + ph + ' bait spot ' + b + ' outside the caldera'); } }
S0.ph = 2; for (const [a, b, h] of A.ledges) { ok(Math.min(Math.abs(a - A.seal), Math.abs(b - A.seal)) > FDM.ringOf(S0), 'a ledge inside the P2 ring'); ok(h > FD.breath.h && h > FD.sweep.h, 'a ledge the breath or the sweep reaches'); }
const at = (x, y) => L.grid[y * L.W + x];
for (const [a, b, r] of A.ledgeTiles) for (let x = a; x <= b; x++) ok(at(x, r) !== 0, 'a ledge tile missing at ' + x + ',' + r);
const shrine = L.ents.find(e => e.t === 'check'); ok(shrine && A.wallL - shrine.x <= 14 && shrine.x < A.wallL, 'a shrine within 14 columns of the door');
for (let y = 0; y < A.floor / TS - 6; y++) ok(at(A.wallL, y) !== 0, 'the door lintel is open at row ' + y + ' (the 6-row wall leaves a gap over it)');
for (let y = 0; y < A.floor / TS; y++) ok(at(A.wallR, y) !== 0, 'the far wall is open at row ' + y);

/* ---------- 2. THE HANDS ---------- */
const hero = { x: A.trigger + 24, y: A.floor, vx: 0, vy: 0, ground: true, hp: 100, maxHp: 100, dead: 0, face: 1 };
const calls = { beaten: 0, hits: [], hint: [], sunk: [], checkpoint: null, sounds: new Set() };
let boss = null;
const sfx = new Proxy({}, { get: (_, k) => () => calls.sounds.add(k) });
const EHP = { firedrake: FD.hp };
const ctx = { get L() { return L; }, get players() { return [hero]; }, get boss() { return boss; }, bossActive: true, TS, EHP, sfx, hero: () => hero, time: () => 0,
  number: () => {}, text: () => {}, burst: () => {}, sparks: () => {}, shake: () => {}, ring: () => {},
  damagePlayer: (x, d, o) => { calls.hits.push({ name: o.name, unblockable: o.unblockable }); hero.hp -= 0; return 'hit'; }, asPlayer: (p, fn) => fn(), upright: () => true,
  overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: p => ({ l: p.x - 5, r: p.x + 5, t: p.y - 20, b: p.y }), hint: m => calls.hint.push(m),
  beaten: e => { calls.beaten++; e.alive = false; }, checkpoint: (x, y) => { calls.checkpoint = { x, y }; }, sinkTile: (x, y) => { calls.sunk.push([x, y]); L.grid[y * L.W + x] = 0; } };
const H = makeFireDrakeHands(ctx);
const ent = L.ents.find(e => e.t === 'firedrake');
boss = H.spawnBoss({ x: ent.x * TS + 8, y: (ent.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true, dying: 0, flash: 0, stagger: 0 });
ok(boss && boss.t === 'firedrake' && boss.hp === FD.hp && boss.mode === 'sleep', 'spawnBoss');
ok(H.on() && H.owns(boss), 'on / owns');
const dt = 1 / 60; for (let i = 0; i < 60; i++) H.update(boss, dt); ok(boss.mode === 'sleep', 'it sleeps until bossStart wakes it');
boss.mode = 'wake'; boss.modeT = 1.6;   /* main.js bossStart */
/* a FIXED stand-in hero: it stands at the P1 bait spot (no dodging), the bar drained in steps by blows through H.take, to walk it through every phase */
const S = H.show(); let frames = 0, blows = 0;
const modes = new Set();
while (boss.alive && frames < 60 * 600) {
  frames++; hero.x = Math.max(G.x0 + 10, Math.min(G.x1 - 10, FDM.baitOf(S, -1) + (frames % 600 < 300 ? 0 : 120)));
  H.update(boss, dt); modes.add(boss.mode);
  if (frames % 20 === 0 && boss.alive && boss.mode !== 'sleep' && boss.mode !== 'wake') { const d = H.take(boss, 40); boss.hp -= d; blows++; if (boss.hp <= 0) ok(H.spare(boss), 'spare'); ok(boss.hp > 0, 'an empty bar is held off the death path'); }
}
ok(calls.beaten === 1, 'the fight is won exactly once: ' + calls.beaten);
ok(S.done && S.won && boss.beaten && boss.spent, 'BEATEN, NOT KILLED: done/won/beaten/spent ' + JSON.stringify({ done: S.done, won: S.won, beaten: boss.beaten }));
ok(S.chains === 0 && S.sealStage === 3, 'the last chain parted, the seal split: ' + S.chains + ' / ' + S.sealStage);
ok(calls.checkpoint && Math.abs(calls.checkpoint.x - G.seal) < 80 && calls.checkpoint.y === G.floorY, 'the shrine is set by the seal: ' + JSON.stringify(calls.checkpoint));
ok(S.n.tear === 2 && S.sunk && calls.sunk.length === A.ledgeTiles.reduce((s, [a, b]) => s + b - a + 1, 0), 'two tears; the P3 tear sank every ledge tile: ' + S.n.tear + ' / ' + calls.sunk.length);
for (const m of ['walk', 'tearTell', 'beaten', 'down']) ok(modes.has(m), 'mode never reached: ' + m);
const byName = {}; for (const h of calls.hits) (byName[h.name] = byName[h.name] || []).push(h.unblockable);
ok(Object.keys(byName).length >= 3, 'its blows reached the hero: ' + JSON.stringify(Object.keys(byName)));
for (const [k, v] of Object.entries(byName)) ok(v.every(u => u === (k !== 'claw')), k + ': the claw (yellow !) is blockable, every red !! is not');
ok(H.barName(boss).startsWith('THE FIRE DRAKE'), 'bar name');
ok(H.read() && H.read().won === true, 'read');
/* B16: every move its own sound - no two moves share a first-choice name, and every move has a stand-in */
const firsts = Object.values(SOUND).map(a => a[0]); ok(new Set(firsts).size === firsts.length, 'two moves share a drake sound name');
const tells = ['clawTell', 'claw', 'rattle', 'tail', 'chainGrip', 'chainSweep', 'inhale', 'breath', 'chains', 'lunge', 'twang', 'takeoff', 'wings', 'dive', 'slamTell', 'slam', 'hiss', 'strain', 'snap', 'roar'];
for (const k of tells) ok(SOUND[k] && SOUND[k].length >= 2, 'no sound for ' + k);
const src = fs.readFileSync(path.join(root, 'src/fire-drake.js'), 'utf8'); for (const m of src.matchAll(/w\.sound\('([a-zA-Z]+)'\)/g)) ok(SOUND[m[1]], 'the fight plays ' + m[1] + ' and the hands have no sound for it');
/* THE DRAWING: a recording context, every pose, every overlay (the tells and the read) */
const g = new Proxy({}, { get: (t, k) => (k in t ? t[k] : (t[k] = typeof k === 'string' && /^[a-z]/.test(k) && !['fillStyle', 'strokeStyle', 'lineWidth', 'globalAlpha', 'lineCap', 'lineDashOffset'].includes(k) ? () => {} : undefined)), set: (t, k, v) => { t[k] = v; return true; } });
for (const [k, p] of Object.entries(POSE)) { drawDrake(g, p, { time: 1.3, air: k === 'hover' ? 70 : 0 }); n++; }
const H2 = makeFireDrakeHands({ ...ctx, get boss() { return boss2; } }); let boss2 = H2.spawnBoss({ x: G.seal, y: G.floorY, face: 1, alive: true }); const S2 = H2.show();
S2.vents = [{ x: G.seal - 75, t: 0.5 }, { x: G.seal + 75, t: -0.2 }]; S2.waves = [{ x: G.seal + 40, dir: 1 }]; S2.purse = 100;
for (const m of Object.keys(POSE)) { boss2.mode = m; boss2.modeT = 0.5; boss2.lockX = G.seal + 60; boss2.sweepSide = 1; boss2.air = m === 'hover' || m === 'diveTell' || m === 'dive' ? 40 : 0; S2.ward = m === 'rise' ? 1 : 0; H2.drawBoss(g, boss2, 0, 0, 1.1); H2.drawOver(g, 0, 0, 1.1); n++; }
S2.won = true; S2.downE = { x: G.seal, face: 1 }; boss2.alive = false; H2.drawOver(g, 0, 0, 2); n++;

/* ---------- 3. THE HOOKS ---------- */
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');
const main = rd('src/main.js'), lab = rd('src/lab.js'), greed = rd('src/boss-greed.js'), bread = rd('src/boss-read.js'), hl = rd('src/hint-lines.js');
for (const s of ["import { makeFireDrakeHands } from './fire-drake-hands.js'", "case 'firedrake': { const a = FDH ? FDH.spawnBoss(base)", "if (e.t === 'firedrake' && FDH) dmg = FDH.take(e, dmg, tag)",
  "e.t === 'firedrake' && FDH && FDH.spare(e)", 'if (FDH && FDH.owns(e)) { if (bossActive && e === boss) FDH.update(e, dt); continue; }', 'FDH.drawBoss(g, e, cx, cy, time)', 'if (FDH && FDH.on()) FDH.drawOver(g, cx, cy, time)',
  "boss.t === 'firedrake' && FDH ? FDH.barName(boss)", 'fireDrakeHands: () => FDH', 'FDH = makeFireDrakeHands(', 'EHP.firedrake = FDM_FD.hp', "POISE_SKIP.add('firedrake')", 'if (FDH) FDH.clear()'])
  ok(main.includes(s), 'main.js is missing the hook: ' + s);
{ const sp = main.indexOf('FDH.spare(e)'), kill = main.indexOf('  if (e.hp <= 0) {', sp); ok(sp > 0 && kill > sp && kill - sp < 1500, 'the spare must run just before hurtEnemy0 kills it'); }
ok(lab.includes("if(boss.t==='firedrake'){") && lab.includes("fdPlan({") && lab.includes("boss.t!=='firedrake'"), 'src/lab.js: the drake branch (fdPlan) and the labRest exclusion');
ok(/firedrake: e => fdOpen\(e\) \|\| fdSoft\(e\)/.test(greed) && greed.includes("OWN_WARD.add('firedrake')"), 'src/boss-greed.js: OPEN_RULE + OWN_WARD');
ok(bread.includes("firedrake: e => (e.ward > 0 ? TURN.WARDED : 'SCALES')"), 'src/boss-read.js: the turn word');
ok(hl.includes('...Object.values(FD_SAY)'), 'src/hint-lines.js: FD_SAY');
/* NOT LIVE: the drake is on no road, in no rush, in no boss select, no bestiary card until its art merges */
ok(!/\{ lv: 'drakelab'/.test(main) && !/beastSeen\('firedrake'\)/.test(main), 'the drake is in the rush or the bestiary before its art (art before live)');
console.log('fire-drake-hands: ' + n + ' checks ok (' + frames + ' frames, ' + blows + ' blows, hits ' + JSON.stringify(Object.fromEntries(Object.entries(byName).map(([k, v]) => [k, v.length]))) + ')');
