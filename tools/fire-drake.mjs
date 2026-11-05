// tools/fire-drake.mjs - THE FIRE DRAKE, pure (claude/heartplan; src/fire-drake.js). Node only, a second, no browser:
//   B15 (its scales x0.5, its ward x0.4, never 0 in the fight); THE CHAIN RULE (a lunge past the ring = JERKED x1.75 up to its purse, inside = a bite);
//   the aim follows you through the tell then holds; the dive past the ring is jerked out of the air; the tears (P2 at 60%, P3 at 30%, once each, told,
//   never through a jerk, the ring grows, the seal cracks); P3's slam waves are jumped and the vents glow before they erupt; BEATEN = the last chain
//   parts and it falls on the seal (never killed); B16 (every told move a windup and a release picture); the bot baits, gets under the chin, jumps the tail.
import assert from 'node:assert/strict';
import * as M from '../src/fire-drake.js';
const { FD } = M, TS = 16;
const A = { x0: 100 * TS, x1: 132 * TS, floor: 20 * TS };   // 32 tiles: the seal at 116*16 = 1856, the floor's half-width 256
const G = M.geom(A, TS); let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const world = (log = [], hits = []) => ({ number: (x, y, t) => log.push(t), sound: s => log.push('snd ' + s), shake: () => {}, music: p => log.push('music ' + p), mark: m => log.push('mark ' + m),
  fx: k => log.push('fx ' + k), seal: st => log.push('seal ' + st), push: () => {}, hit: (b, d, name, o) => hits.push({ b, d, name, key: o && o.key }) });
const drake = (x = G.seal) => ({ x, y: G.floorY, hp: FD.hp, maxHp: FD.hp, mode: 'walk', modeT: 0, face: 1, alive: true, air: 0 });
const hero = x => [{ x, y: G.floorY, ground: true, alive: true }];
const run = (e, S, heroX, secs, log = [], hits = [], until = null) => { for (let f = 0; f < secs * 60; f++) { M.stepDrake(e, S, 1 / 60, hero(typeof heroX === 'function' ? heroX(f) : heroX), world(log, hits)); if (until && until(e, S)) break; } return { log, hits }; };
const inBox = (b, x, y = G.floorY) => x + 5 > b[0] && x - 5 < b[1] && y > b[2] && y - 16 < b[3];
// 1. B15
{ const S = M.newFight(G), e = drake();
  ok(M.takeBlow(e, S, 100)[0] === 50 && FD.hide >= 0.4 && M.takeBlow(e, S, 100)[1] === FD_SAYhide(), 'its scales: x' + FD.hide + ' (B15 floor 0.4), told SCALES');
  S.ward = 1; ok(M.takeBlow(e, S, 100)[0] === 40 && M.takeBlow(e, S, 100)[1] === 'WARDED', 'its ward after a jerk: x0.4, told'); S.ward = 0;
  for (const m of ['walk', 'clawTell', 'claw', 'tailTell', 'tail', 'breathTell', 'breath', 'lungeTell', 'lunge', 'tearTell', 'takeoff', 'hover', 'diveTell', 'dive', 'slamTell', 'slam', 'recover', 'rise'])
    { e.mode = m; ok(M.takeBlow(e, S, 100)[0] >= 40, 'never under 0.4 in ' + m + ' (B15: never invulnerable)'); }
  e.mode = 'pant'; ok(M.takeBlow(e, S, 100)[0] === 100, 'panting after the breath: x1 (the soft window)');
  e.mode = 'jerked'; e.modeT = 3; S.purse = e.maxHp * FD.jerk.cap; ok(M.takeBlow(e, S, 40)[0] === 70, 'JERKED: x1.75');
  let got = 70; for (let i = 0; i < 60 && e.modeT > 0; i++) got += M.takeBlow(e, S, 40)[0];
  ok(e.modeT === 0 && Math.abs(got - e.maxHp * FD.jerk.cap) < 2, 'one jerk is worth at most ' + FD.jerk.cap + ' of its bar, then it rises (got ' + got + ')'); }
function FD_SAYhide() { return M.FD_SAY.hide; }
// 2. THE CHAIN RULE
const lungeAt = (heroX, ph = 1) => { const S = M.newFight(G); S.ph = ph; const e = drake(G.seal); e.mode = 'lungeTell'; e.modeT = FD.lunge.tell[ph - 1]; e.lockX = heroX; e.face = Math.sign(heroX - e.x) || 1;
  const log = [], hits = []; run(e, S, heroX, 3, log, hits, x => x.mode === 'jerked' || x.mode === 'recover'); return { e, S, log, hits }; };
{ const r = M.ringOf(M.newFight(G));
  const far = lungeAt(G.seal + r + 30); ok(far.e.mode === 'jerked' && far.S.n.jerk === 1 && far.log.includes(M.FD_SAY.jerked), 'a lunge at a hero outside the ring: the chain snaps taut, JERKED (' + far.e.mode + ')');
  ok(Math.abs(M.jawX(far.e) - (G.seal + r)) < 1, 'jerked with its jaw at the ring\'s edge (the ring is honest)');
  ok(!far.hits.some(h => h.name === 'bite'), 'a jerked lunge bites nothing');
  const near = lungeAt(G.seal + r - 30); ok(near.e.mode === 'recover' && near.S.n.bite === 1 && near.hits.some(h => h.name === 'bite' && inBox(h.b, G.seal + r - 30)), 'a lunge at a hero inside the ring: a BITE that reaches him, not jerked');
  const left = lungeAt(G.seal - r - 30); ok(left.e.mode === 'jerked', 'the rule holds on both sides of the seal');
  const S3 = M.newFight(G); S3.ph = 3; const b3 = M.baitOf(S3, 1); const p3 = lungeAt(b3, 3); ok(p3.e.mode === 'jerked' && b3 < A.x1 - 8, 'P3: the bait spot (past the ring and the claw) is still on the floor (' + (b3 - G.seal) + ' of ' + ((A.x1 - A.x0) / 2) + ')'); }
{ for (const ph of [1, 2, 3]) { const S = M.newFight(G); S.ph = ph; const e = drake(M.bodyMax(S, 1)); e.face = 1; const bx = M.baitOf(S, 1);
    ok(bx - e.x > FD.claw.reach + 5 + 4 && M.outside(S, bx), 'P' + ph + ': from the bait spot a drake at its chain end cannot claw you (' + Math.round(bx - e.x) + ' px)'); } }
{ const S = M.newFight(G), e = drake(M.bodyMax(S, 1)); e.face = 1; S.restT = 0; const log = []; let m = null; for (let k = 0; k < 40 && !m; k++) { e.mode = 'walk'; S.restT = 0; S.last = []; M.stepDrake(e, S, 1 / 60, hero(e.x + 50), world(log)); if (e.mode !== 'walk') { m = e.mode; } }
  ok(m === 'clawTell' || m === 'tailTell', 'a hero at its jaw past the ring is clawed or lashed, not lunged at (' + m + ')'); }
{ const S = M.newFight(G), e = drake(G.seal); e.mode = 'lungeTell'; e.modeT = FD.lunge.tell[0]; e.lockX = G.seal + 40; let px = G.seal + 40, locked = null;
  for (let f = 0; f < 90 && e.mode === 'lungeTell'; f++) { px += 2; M.stepDrake(e, S, 1 / 60, hero(px), world()); if (e.modeT <= FD.lunge.lock && locked === null) locked = e.lockX; }
  ok(locked !== null && Math.abs(e.lockX - locked) < 0.01 && locked > G.seal + 60, 'the lunge\'s aim follows you while the chains glow, then holds for its last ' + FD.lunge.lock + ' s'); }
// 3. THE DIVE (P2+): past the ring it is jerked out of the air; inside it slams the ring
const diveAt = (x) => { const S = M.newFight(G); S.ph = 2; const e = drake(G.seal); e.mode = 'takeoff'; e.modeT = FD.dive.crouch; const log = [], hits = [];
  run(e, S, x, 5, log, hits, q => q.mode === 'jerked' || q.mode === 'recover'); return { e, S, log, hits }; };
{ const r2 = FD.ring[1]; const out = diveAt(G.seal + r2 + 40); ok(out.e.mode === 'jerked' && out.S.n.diveJerk === 1 && out.e.air === 0, 'a dive at a hero outside the ring: jerked out of the air, down on its side');
  const inn = diveAt(G.seal + 60); ok(inn.e.mode === 'recover' && inn.hits.some(h => h.name === 'dive' && inBox(h.b, G.seal + 60)), 'a dive inside the ring slams the red ring where it locked');
  ok(inn.log.includes('mark !!') && inn.log.includes(M.FD_SAY.dive), 'the dive is told (!!, IT TAKES WING) before it falls'); }
// 4. THE TEARS
{ const S = M.newFight(G), e = drake(); e.hp = e.maxHp * 0.59; S.restT = 9; const log = []; run(e, S, G.seal + 300, 3, log);
  ok(S.ph === 2 && S.n.tear === 1 && log.includes(M.FD_SAY.tear2) && log.includes('seal 1') && log.includes('music 2') && M.ringOf(S) === FD.ring[1], 'at 60% it TEARS a chain: P2, told, the seal cracks, the ring grows');
  e.hp = e.maxHp * 0.29; e.mode = 'walk'; S.restT = 9; run(e, S, G.seal + 300, 3, log);
  ok(S.ph === 3 && S.n.tear === 2 && log.includes('seal 2') && S.chains === 1, 'at 30% another: P3, one chain left'); }
{ const S = M.newFight(G), e = drake(); e.hp = e.maxHp * 0.5; e.mode = 'jerked'; e.modeT = 2; S.purse = 999; M.stepDrake(e, S, 1 / 60, hero(G.seal + 200), world()); ok(S.ph === 1, 'never through a jerk: the tear waits for it to be on its feet'); }
{ const S = M.newFight(G), e = drake(); e.hp = e.maxHp * 0.5; e.mode = 'tearTell'; ok(M.takeBlow(e, S, 100)[0] >= 40, 'a tear is not an invulnerable cutscene (B15)'); }
// 5. P3: the slam's waves and the vents
{ const S = M.newFight(G); S.ph = 3; const e = drake(); e.mode = 'slamTell'; e.modeT = 0.01; const hits = []; run(e, S, G.seal + 120, 1.2, [], hits);
  const w = hits.filter(h => h.name === 'wave'); ok(w.length && w.every(h => h.b[2] >= G.floorY - FD.slam.clear), 'the magma waves run low: a jumping hero (feet > ' + FD.slam.clear + ' px up) clears them');
  ok(S.n.slam === 1 && new Set(w.map(h => h.key)).size === 2, 'the slam sends a wave both ways'); }
{ const S = M.newFight(G); S.ph = 3; S.ventT = 0.01; const e = drake(); e.mode = 'sleep'; const hits = [], log = []; let firstHit = null, glow = null;
  for (let f = 0; f < 180; f++) { M.stepDrake(e, S, 1 / 60, hero(G.vents[3]), world(log, hits)); if (glow === null && S.vents.length) glow = f; if (firstHit === null && hits.some(h => h.name === 'vent')) firstHit = f; }
  ok(glow !== null && firstHit !== null && (firstHit - glow) / 60 >= FD.vent.glow - 0.02 && log.includes('snd hiss'), 'a vent GLOWS (and hisses) a full ' + FD.vent.glow + ' s before it erupts'); }
// 6. BEATEN, NOT KILLED
{ const S = M.newFight(G); S.ph = 3; S.chains = 1; const e = drake(); e.hp = 0; const log = []; run(e, S, G.seal + 100, 4, log);
  ok(e.mode === 'down' && S.done && e.alive && S.chains === 0 && log.includes('seal 3') && log.includes(M.FD_SAY.beaten), 'an empty bar: the LAST chain parts, it falls on the seal, the seal splits - it is not killed');
  ok(M.takeBlow(e, S, 100)[0] === 0 && M.readOf(e) === null, 'beaten: the fight is over (no more damage, no read)'); }
{ const S = M.newFight(G); S.ph = 2; const e = drake(); e.mode = 'hover'; e.modeT = 0.5; e.air = 70; e.hp = 0; const log = []; run(e, S, G.seal + 60, 0.2, log); ok(!e.beaten, 'never beaten in mid-air: it lands first'); }
// 7. B16 + the read
const PAIRS = [['sweepTell', 'sweep'], ['clawTell', 'claw'], ['tailTell', 'tail'], ['breathTell', 'breath'], ['lungeTell', 'lunge'], ['diveTell', 'dive'], ['slamTell', 'slam'], ['tearTell', 'jerked'], ['takeoff', 'hover']];
for (const [w, r] of PAIRS) ok(M.POSE[w] && M.POSE[r] && JSON.stringify(M.POSE[w]) !== JSON.stringify(M.POSE[r]), 'B16: ' + w + ' and ' + r + ' are two pictures');
for (const m of ['sleep', 'wake', 'walk', 'recover', 'pant', 'rise', 'beaten', 'down']) ok(M.POSE[m], 'a pose for ' + m);
{ const S = M.newFight(G), e = drake(); e.mode = 'jerked'; e.modeT = 2; e.openT0 = 3.5; ok(M.readOf(e).st === 'open', 'B10: jerked reads OPEN (gold ring + bar)'); e.mode = 'pant'; e.modeT = 0.5; ok(M.readOf(e).st === 'soft', 'panting reads soft'); }
// 8. every move is reached in a long fight against a hero who stands outside then inside (the picker uses them all)
{ const S = M.newFight(G), e = drake(); const log = []; let ph3 = false;
  run(e, S, f => Math.floor(f / 240) % 2 ? G.seal + 60 : M.baitOf(S, 1), 240, log, [], (q, s) => { if (s.ph === 3) ph3 = true; return false; });
  ok(S.n.claw + S.n.tail > 0 && S.n.breath > 0 && S.n.lunge > 0 && S.n.sweep > 0, 'P1 uses claw/tail, breath, lunge and the chain sweep (' + JSON.stringify(S.n) + ')'); }
{ const S = M.newFight(G), e = drake(M.bodyMax(S, 1)); e.face = 1; e.mode = 'sweepTell'; e.modeT = 0.01; e.sweepSide = 1; const hits = []; run(e, S, M.baitOf(S, 1), 0.5, [], hits);
  const h = hits.find(q => q.name === 'sweep'); ok(h && inBox(h.b, M.baitOf(S, 1)) && h.b[2] >= G.floorY - FD.sweep.h, 'THE CHAIN SWEEP covers the bait spot, low (a jump clears it)');
  ok(!inBox(h.b, G.seal + 20), '...and not the middle of the seal'); }
{ const S = M.newFight(G); S.ph = 2; const e = drake(); run(e, S, M.baitOf(S, 1), 120); ok(S.n.dive > 0, 'P2 dives (' + S.n.dive + ')'); }
{ const S = M.newFight(G); S.ph = 3; const e = drake(); run(e, S, M.baitOf(S, 1), 120); ok(S.n.slam > 0 && S.n.vent > 0, 'P3 slams and the vents erupt (' + S.n.slam + ', ' + S.n.vent + ')'); }
// 9. the bot
const plan = (P, e, S, ts = [0, 0.3, 0.6]) => { const mem = {}; let o; for (const t of ts) o = M.fdPlan({ P, e, S, reach: 22, t, mem, rng: () => 0.5, dodge: true, parry: false }); return o; };
const P0 = x => ({ x, y: G.floorY, ground: true, face: 1, atk: -1 });
{ const S = M.newFight(G), e = drake(); const o = plan(P0(G.seal + 30), e, S); ok(M.outside(M.newFight(G), o.gx) && /bait/.test(o.why), 'it walks: the bot stands just outside the ring (' + o.why + ')'); }
{ const S = M.newFight(G), e = drake(G.seal + 40); e.face = 1; e.mode = 'breathTell'; e.modeT = 0.8; const o = plan(P0(G.seal + 120), e, S); ok(Math.abs(o.gx - M.jawX(e)) < 20 && /chin/.test(o.why), 'the breath: under its chin (' + o.why + ')'); }
{ const S = M.newFight(G), e = drake(G.seal); e.face = 1; e.mode = 'tailTell'; e.modeT = 0.1; const o = plan(P0(G.seal - 40), e, S); ok(o.jump && /tail/.test(o.why), 'the tail: jumped (' + o.why + ')'); }
{ const S = M.newFight(G), e = drake(G.seal); e.face = 1; e.mode = 'lungeTell'; e.modeT = 0.6; const o = plan(P0(M.baitOf(S, 1)), e, S); ok(o.gx === M.baitOf(S, 1), 'the lunge with the bot outside: it holds its ground (' + o.why + ')'); }
{ const S = M.newFight(G); S.ph = 2; const e = drake(G.seal); e.mode = 'diveTell'; e.modeT = 0.5; e.lockX = G.seal + 50; S.act = 3; const o = plan(P0(G.seal + 50), e, S); ok(Math.abs(o.gx - e.lockX) > FD.dive.r, 'the dive ring: off it (' + o.why + ')'); }
{ const S = M.newFight(G), e = drake(G.seal + 60); e.mode = 'jerked'; e.modeT = 2; const o = plan(P0(G.seal + 140), e, S, [0]); ok(Math.abs(o.gx - e.x) < FD.w / 2 + 22 && /jerked/.test(o.why), 'jerked: the bot goes in and strikes'); }
{ const S = M.newFight(G), e = drake(G.seal); e.mode = 'sweepTell'; e.modeT = 0.08; e.sweepSide = 1; S.act = 9; const o = plan(P0(M.baitOf(S, 1)), e, S); ok(o.jump && /chain/.test(o.why), 'the bot jumps the chain sweep (' + o.why + ')'); }
console.log('fire-drake: ' + n + ' checks ok');
