// tools/combat-part2.mjs - THE COMBAT PASS, PART 2b (claude/combat2, src/foe-react.js): reactive foes, varied swings, squads, the act ramp.
//
// In the page, headless, on a flat floor of a loaded level (everything else in it put away), a god-mode hero and a few common foes:
//   FLANK      four melee foes on the side the hero faces: one walks round to take the ring behind him.
//   MASHED     a hero who only mashes the light attack into one foe meets its GUARD (cuts turned, a clank) and then its RIPOSTE.
//   HEAVY      a heavy blow goes through a raised guard and breaks it.
//   WHIFF      a swing at nothing hands the foe waiting beside him its turn at once (it winds up inside a second).
//   SQUAD      a squad (front shield, back archer, flank cutlass) holds its roles: the archer keeps further off than the shield, and the
//              cutlass and the shield, on both sides of him, are given their turns at once (a pincer).
//   VARIED     over a crowd's forty seconds, swings come held, quick and as feints (a stamp, then the real blow).
//   ACTS       the purse is 2 in the Stockade (act I) and 3 in the Red Gorge (act V); a common foe's blow lands x1.2 in the Long Water.
// Proved red on the base (no src/foe-react.js): BK.tokens().RX is missing and every case fails.
//   node tools/combat-part2.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
const bad = [], out = {};
const setup = lvl => `
  const { LEVELS } = await import('/src/level.js');
  { let a = 20261005 >>> 0; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === ${JSON.stringify(lvl)})); BK.start(); BK.god = true;
  const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
  let spot = null;
  for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 24 && !spot; x0++) for (let y = 4; y < L.H - 2 && !spot; y++) {
    let ok = true; for (let x = x0; x < x0 + 20 && ok; x++) ok = at(x, y + 1) === 1 && at(x, y) === 0 && at(x, y - 1) === 0 && at(x, y - 2) === 0;
    if (ok) spot = [x0 + 10, y]; }
  if (!spot) return { err: 'no flat floor' };
  for (const e of BK.enemies()) e.alive = false;
  BK.tp(spot[0], spot[1]); BK.sim(2);
  const T = BK.tokens(); if (!T.RX) return { err: 'no RX (src/foe-react.js) on BK.tokens()' };
  const P = BK.P, k = BK.keys, st = T.board.stats, clear = () => { k.left = k.right = k.up = k.down = k.jump = k.block = k.atk = false; };
  const spawn = (t, dx, face) => BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face })[0];
  const hold = () => { P.hp = P.maxHp || P.hp; };`;
const run = async (name, lvl, body) => { await pg.reload(); const r = await pg.evalp(`(async()=>{ ${setup(lvl)} ${body} })()`, 600000); out[name] = r; if (r && r.err) bad.push(name + ': ' + r.err); return r || {}; };

try {
  /* FLANK: four sprigs on his right, he faces right and stands */
  { const r = await run('flank', 'stockade', `
      const foes = [3, 5, 7, 9].map(d => spawn('cutlass', d, -1)); P.face = 1; let behind = 0;
      for (let f = 0; f < 1500; f++) { clear(); hold(); P.face = 1; BK.sim(1); for (const e of foes) if (e.alive && e.x < P.x - 20) behind++; }
      return { flanks: st.flanks || 0, behindFrames: behind, alive: foes.filter(e => e.alive).length };`);
    if (!r.err && !(r.flanks >= 1 && r.behindFrames > 30)) bad.push(`flank: ${r.flanks} flanks and ${r.behindFrames} foe-frames behind him over 25 s (want a foe to take the ring at his back)`); }

  /* MASHED: one cutlass in front of him; he only mashes the light attack */
  { const r = await run('mashed', 'stockade', `
      const e = spawn('cutlass', 2, -1); e.hp = e.maxHp = 9999; P.face = 1; let guardFrames = 0, turnedHp = 0, g0 = st.guards || 0, t0 = st.turned || 0, r0 = st.ripostes || 0, windAfterRip = false, ripAt = -1;
      for (let f = 0; f < 1500; f++) { clear(); hold(); if (Math.abs(e.x - P.x) > 10) k[e.x > P.x ? 'right' : 'left'] = true; else P.face = Math.sign(e.x - P.x) || 1; if (P.atk < 0) BK.press('atk');
        const hp = e.hp, tn = st.turned || 0, rp = st.ripostes || 0; BK.sim(1); if (e.rxGuard > 0) guardFrames++;
        if ((st.turned || 0) > tn && e.hp < hp) turnedHp++;
        if ((st.ripostes || 0) > rp) ripAt = f; if (ripAt >= 0 && f - ripAt < 60 && BK.telling(e)) windAfterRip = true; }
      return { guards: (st.guards || 0) - g0, turned: (st.turned || 0) - t0, ripostes: (st.ripostes || 0) - r0, guardFrames, turnedHp, windAfterRip };`);
    if (!r.err) { if (!(r.guards >= 2)) bad.push(`mashed: the cutlass raised its guard ${r.guards} times in 25 s of mashing (want >= 2)`);
      if (!(r.turned >= 2)) bad.push(`mashed: ${r.turned} cuts turned by the guard (want >= 2)`);
      if (r.turnedHp) bad.push(`mashed: ${r.turnedHp} turned cuts still took its health`);
      if (!(r.ripostes >= 1 && r.windAfterRip)) bad.push(`mashed: ${r.ripostes} ripostes, wound up after one: ${r.windAfterRip} (want its guard to drop into its own told blow)`); } }

  /* HEAVY: a heavy blow on a raised guard goes through and breaks it */
  { const r = await run('heavy', 'stockade', `
      const e = spawn('cutlass', 2, -1); e.hp = e.maxHp = 9999; P.face = 1; BK.sim(2); e.rxGuard = 1; e.rxGuardCd = 0; const hp = e.hp, b0 = st.guardBreaks || 0;
      P.atk = 0.05; P.heavy = true; P.heavySwing = true; const turned = T.RX.guards(e, 99, true, true); P.heavy = false; P.heavySwing = false; P.atk = -1;
      return { turned, broke: (st.guardBreaks || 0) - b0, guardLeft: e.rxGuard, stagger: e.stagger };`);
    if (!r.err && (r.turned || r.broke !== 1 || r.guardLeft > 0)) bad.push(`heavy: a heavy blow on a raised guard was turned: ${r.turned}, broke it: ${r.broke}, guard left ${r.guardLeft}`); }

  /* WHIFF: a cutlass waits beside him; he swings at the air the other way */
  { const r = await run('whiff', 'stockade', `
      const e = spawn('cutlass', 4, -1); P.face = 1; let wound = 0, whiffs = 0, tries = 0;
      for (let f = 0; f < 120; f++) { clear(); hold(); BK.sim(1); }
      for (let n = 0; n < 6 && !wound; n++) { e.cd = 3; e.tokRest = 1.5; P.face = -1; for (let f = 0, w0f = -1; f < 70 || (w0f >= 0 && f < w0f + 120); f++) { if (whiffs && w0f < 0) w0f = f; clear(); hold(); P.face = -1; if (f === 2) { BK.press('atk'); tries++; } const w0 = st.whiffs || 0; BK.sim(1); if ((st.whiffs || 0) > w0) whiffs++; if (whiffs && BK.telling(e)) { wound = f; break; } } }
      return { whiffs, wound, tries };`);
    if (!r.err && !(r.whiffs >= 1 && r.wound > 0)) bad.push(`whiff: ${r.whiffs} whiffs punished in ${r.tries} swings at the air, the cutlass wound up after: ${r.wound} (want its turn handed over at once)`); }

  /* SQUAD: a shield and an archer on his right, a cutlass on his left, all one squad */
  { const r = await run('squad', 'stockade', `
      const sh = spawn('shield', 4, -1), ar = spawn('archer', 7, -1), cu = spawn('cutlass', -4, 1); for (const e of [sh, ar, cu]) { e.squad = 'test-1'; e.hp = e.maxHp = 9999; }
      let dS = 0, dA = 0, n = 0; const p0 = st.pincers || 0;
      for (let f = 0; f < 1500; f++) { clear(); hold(); P.face = 1; BK.sim(1); if (f > 240 && sh.alive && ar.alive) { dS += Math.abs(sh.x - P.x); dA += Math.abs(ar.x - P.x); n++; } }
      return { shieldAvg: Math.round(dS / n), archerAvg: Math.round(dA / n), pincers: (st.pincers || 0) - p0 };`);
    if (!r.err) { if (!(r.archerAvg >= 80 && r.archerAvg > r.shieldAvg + 20)) bad.push(`squad: the archer held ${r.archerAvg} px off and the shield ${r.shieldAvg} (want the back behind the front)`);
      if (!(r.pincers >= 1)) bad.push(`squad: ${r.pincers} pincers (want both sides given their turns at once)`); } }

  /* VARIED: a crowd of cutlasses and sailors for forty seconds */
  { const r = await run('varied', 'stockade', `
      const foes = [['cutlass', -3], ['sailor', 3], ['cutlass', -6], ['sailor', 6], ['soldier', 9]].map(([t, d]) => spawn(t, d, d > 0 ? -1 : 1)); for (const e of foes) e.hp = e.maxHp = 9999;
      for (let f = 0; f < 2400; f++) { clear(); hold(); BK.sim(1); }
      return { helds: st.helds || 0, quicks: st.quicks || 0, feints: st.feints || 0, stamps: st.stamps || 0, grants: st.grants };`);
    if (!r.err && !(r.helds >= 1 && r.quicks >= 1 && r.stamps >= 1)) bad.push(`varied: ${r.helds} held, ${r.quicks} quick, ${r.stamps} feint stamps over ${r.grants} turns (want all three)`); }

  /* ACTS: the purse and the damage tier by act */
  for (const [lvl, cap, mul] of [['stockade', 2, 1], ['longwater', 2, 1.2], ['redgorge', 3, 1.3]]) {
    const r = await run('act-' + lvl, lvl, `BK.sim(1); return { cap: T.TOKENS.cap(P), act: T.RX.act().act, dmg: T.RX.tier({ t: 'cutlass', alive: true }, 100) / 100 };`);
    if (!r.err && (r.cap !== cap || Math.abs(r.dmg - mul) > 0.001)) bad.push(`acts: ${lvl} (act ${r.act}) has a purse of ${r.cap} (want ${cap}) and a damage tier x${r.dmg} (want x${mul})`); }
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
console.log(JSON.stringify(out));
assert.deepEqual(bad, [], 'combat part 2:\n  ' + bad.join('\n  '));
console.log('combat part 2: flank, mashed guard + riposte, heavy through the guard, whiff punished, squad roles + pincer, varied swings, the act ramp - all hold');
