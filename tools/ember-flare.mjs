// tools/ember-flare.mjs — THE EMBER FLARE (claude/emberflare, Daniel 2026-10-01): the pyromancer's down is no longer a sustained dome of
// fire (that was "strictly better than a regular guard"). A PRESS of down is a ~0.25 s FLARE round her (src/ember-ward.js):
//   - a yellow blow (or projectile) caught inside the window is CANCELLED, the attacker is SCORCHED and she GAINS HEAT (P.heat, the bar
//     the ember, the jet and the pyre run on)
//   - a flare that catches nothing, with a threat near, FIZZLES: she is rooted and takes extra damage for a moment and cannot flare again
//   - holding down is still the plain duck (a high blow goes over her), and the knight's guard is untouched
// On flat Stockade floor with every foe held far away (>420 px a foe is frozen) and brought in only for the instant a blow is called,
// this fails when:
//   - THE PRESS: a press of down opens no flare window, or one that outlasts FLARE.window, or a down HELD from before opens none again
//   - IN THE WINDOW: a yellow blow is not cancelled, or the attacker is not scorched, or no heat is gained; an arrow is not melted and
//     does not add heat; a RED blow does not break through
//   - OUTSIDE THE WINDOW: a blow after the window lands (blocked, no scorch, no heat) - even with down held the whole time
//   - THE MISTIME: a flare that catches nothing with a foe near does not leave her rooted and exposed (recovery), a blow in recovery does
//     not cost more than the same blow with her at rest, a press in recovery flares again, and with nothing near the flare costs nothing
//   - A REAL FIGHT: the topiary's swipe, the dry run's landing frame known, is not cancelled by a press a few frames before it, or lands
//     for nothing when the press was a half second early
//   - THE REGULAR GUARD: the knight's C no longer blocks a yellow blow; a high blow no longer goes over the pyromancer's held duck
//   - WATER: a flare lights in a pool
//   - OTHER HEROES: the knight, the warden and the paladin open a flare on down, stop ducking, or stop walking on down + a way
//   - the page throws
//   node tools/ember-flare.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const bad = [];
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    if (!BK.ember) return { err: 'no BK.ember: there is no ember ward or flare' };
    const { LEVELS } = await import('/src/level.js');
    const out = {};
    const setUp = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5); };
    setUp('pyro');
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
    let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 7; y < L.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 26 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0);
      if (ok) spot = [x0 + 9, y]; }
    if (!spot) return { err: 'no flat floor' };
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const home = () => { clear(); none(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.hp = P.maxHp; P.vx = 0; P.heat = 0; P.heatGrace = 0; P.hurt = 0; P.face = 1; BK.sim(30); P.heat = 0; P.heatGrace = 0; };
    const hold = () => { BK.P.vx = 0; BK.P.x = spot[0] * 16 + 8; BK.P.inv = 0; };
    const seedRandom = n => { let s = n; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
    const E = () => BK.ember();
    /* a foe held far off (frozen: it does nothing) and brought in only for the instant a blow is called */
    const FAR = 700, NEAR = 130;
    const foeAt = dx => { const [f] = BK.spawnFoe({ t: 'topiary', x: spot[0] + dx, y: spot[1], face: -1 }); return f; };
    const blow = (f, o = {}) => { const P = BK.P, x0 = f.x; f.x = P.x + 20; P.inv = 0; P.hurt = 0; const hp0 = P.hp, h0 = P.heat || 0;
      const res = BKT.damagePlayer(f.x, o.dmg || 10, { who: f, unblockable: !!o.red }); const r = { res: res === 'blocked' ? 'blocked' : res === false ? 'over' : 'hit', lost: hp0 - P.hp, burn: f.burn || 0, heat: (P.heat || 0) - h0 };
      f.x = x0; P.hp = P.maxHp; P.inv = 0; return r; };
    /* press down, n frames pass (BK.sim steps 0.01 s, so the 0.25 s window is 25 frames), then the blow */
    const pressThen = (n, o = {}) => { home(); BK.emberReset(); const f = foeAt(o.far ? FAR : NEAR); f.hp = 9999; if (o.far) f.x = spot[0] * 16 + FAR; K.down = true; hold(); BK.sim(1);
      if (o.release) K.down = false; for (let k = 1; k < n; k++) { hold(); f.x = spot[0] * 16 + (o.far ? FAR : NEAR); BK.sim(1); } hold(); const w = E(); const r = blow(f, o); r.state = { flare: w.flare, rec: w.rec }; r.stats = E().stats; K.down = false; return r; };
    // ---- THE PRESS ----
    { home(); BK.emberReset(); const f = foeAt(NEAR); f.hp = 9999; const r = {}; K.down = true; hold(); BK.sim(1); r.open = E().flare; r.stats1 = E().stats.flares;
      let n = 1; while (E().flare && n < 60) { hold(); BK.sim(1); n++; } r.frames = n; r.window = E().window; K.down = false;
      /* a down held since before the foe came near opens nothing again */
      home(); BK.emberReset(); K.down = true; BK.sim(40); const s0 = E().stats.flares; BK.sim(40); r.heldAgain = E().stats.flares - s0; none(); out.press = r; }
    // ---- IN THE WINDOW: the blow is cancelled, the attacker scorched, the heat gained ----
    out.inWin = pressThen(6);
    out.inWinTap = pressThen(6, { release: true });
    // an arrow in the window melts and heats her; a red blow breaks through
    { home(); BK.emberReset(); const f = foeAt(FAR); K.down = true; hold(); BK.sim(1); const P = BK.P; const s = { x: P.x + 14, y: P.y - 8, vx: -200, vy: 0, g: 0, life: 3, arrow: true }; BK.seeds().push(s); const hp0 = P.hp; hold(); BK.sim(2);
      out.arrow = { dead: !!s.dead, lost: hp0 - P.hp, heat: P.heat || 0 }; none(); }
    out.red = pressThen(6, { red: true });
    // ---- OUTSIDE THE WINDOW: it lands, with down held the whole time or not ----
    out.late = pressThen(40, {});
    out.lateFar = pressThen(80, { far: true });
    out.lateNoPress = (() => { home(); BK.emberReset(); const f = foeAt(FAR); hold(); BK.sim(5); const r = blow(f); K.down = false; return r; })();
    // ---- THE MISTIME: nothing caught, a foe near -> recovery ----
    { home(); BK.emberReset(); const f = foeAt(NEAR); f.hp = 9999; const P = BK.P; const r = {}; K.down = true; hold(); BK.sim(1); K.down = false; for (let k = 0; k < 32; k++) { hold(); f.x = spot[0] * 16 + NEAR; BK.sim(1); }
      r.rec = E().rec; r.missed = E().stats.missed; r.flaring = E().flare;
      /* rooted: a way held does not walk her */ const x0 = P.x; K.right = true; for (let k = 0; k < 12; k++) { f.x = spot[0] * 16 + NEAR; BK.sim(1); } K.right = false; r.moved = Math.abs(P.x - x0);
      const fl0 = E().stats.flares; K.down = true; hold(); BK.sim(1); K.down = false; r.reflare = E().stats.flares - fl0;
      f.x = spot[0] * 16 + NEAR; r.exposed = blow(f).lost; none();
      /* the same blow with her at rest */ r.rest = (() => { home(); BK.emberReset(); const g = foeAt(FAR); hold(); BK.sim(5); return blow(g).lost; })();
      out.miss = r; }
    // with nothing near, the same press costs nothing
    { home(); BK.emberReset(); const f = foeAt(FAR); const P = BK.P, r = {}; K.down = true; hold(); BK.sim(1); K.down = false; for (let k = 0; k < 40; k++) { hold(); BK.sim(1); } r.rec = E().rec; r.flaresDry = E().stats.flares; none(); out.dry = r; }
    // ---- A REAL FIGHT: the topiary's swipe, the landing frame measured with no flare ----
    const fight = (t, dx, secs, o = {}) => { home(); BK.emberReset(); if (o.seed) seedRandom(o.seed);
      const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1 }); if (!f) return { err: t + ' did not spawn' };
      let lost = 0, firstLoss = -1, heat0 = null;
      for (let k = 0; k < secs * 60; k++) { const hp0 = BK.P.hp; K.down = o.holdFrom !== undefined ? k >= o.holdFrom : (o.pressAt !== undefined && k >= o.pressAt && k < o.pressAt + 2);
        hold(); BK.sim(1); if (BK.P.hp < hp0) { lost += hp0 - BK.P.hp; if (firstLoss < 0) firstLoss = k; BK.P.hp = BK.P.maxHp; } if (BK.P.dead) { BK.P.dead = 0; BK.P.hp = BK.P.maxHp; }
        if (o.stopAt && o.stopAt(k)) break; }
      none(); return { lost: Math.round(lost), firstLoss, heat: Math.round(BK.P.heat || 0), burn: f.burn || 0, ducked: BK.duck().ducked, stats: E().stats }; };
    const dry = fight('topiary', 2, 8, { seed: 77, stopAt: k => k > 0 && BK.P.hp < BK.P.maxHp });
    out.dryFight = { firstLoss: dry.firstLoss };
    if (dry.firstLoss > 0) { out.realIn = fight('topiary', 2, 9, { seed: 77, pressAt: Math.max(0, dry.firstLoss - 6), stopAt: k => k > dry.firstLoss + 12 });
      out.realEarly = fight('topiary', 2, 9, { seed: 77, pressAt: Math.max(0, dry.firstLoss - 40), stopAt: k => k > dry.firstLoss + 12 }); }
    // ---- THE REGULAR GUARD: the plain duck still turns a high blow; the knight's C still blocks ----
    out.high = fight('armour', 2, 6, { holdFrom: 0 });
    { setUp('knight'); home(); const P = BK.P; const f = foeAt(FAR); K.block = true; hold(); BK.sim(30); out.knight = blow(f); K.block = false; none(); }
    // ---- WATER ----
    { setUp('pyro'); home(); BK.emberReset(); const P = BK.P, r = {}; const f = foeAt(NEAR); f.hp = 9999;
      const pool = { x0: P.x - 40, x1: P.x + 40, y: P.y - 6, bottom: P.y + 2, shallow: true, emberTest: true }; (BK.L.pools = BK.L.pools || []).push(pool);
      BK.sim(3); K.down = true; hold(); BK.sim(1); r.flareWet = E().flare; r.flaresWet = E().stats.flares; K.down = false; BK.L.pools.splice(BK.L.pools.indexOf(pool), 1); none(); out.water = r; }
    // ---- OTHER HEROES ----
    out.others = [];
    for (const h of ['knight', 'warden', 'paladin']) { setUp(h); home(); const P = BK.P, r = { h }; K.down = true; hold(); BK.sim(12); r.ducking = BK.duck().ducking; r.flares = E().stats.flares;
      const x0 = P.x; K.right = true; BK.sim(30); r.walked = Math.abs(P.x - x0); r.duckWalking = BK.duck().ducking; none(); BK.sim(10); out.others.push(r); }
    Math.random = Math.random;
    return out;
  })()`, 900000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }

if (R.err) bad.push(R.err);
else {
  for (const [k, v] of Object.entries(R)) console.log(k, JSON.stringify(v));
  const Pr = R.press;
  if (!Pr.open || !(Pr.stats1 > 0)) bad.push('a press of down opened no flare window');
  if (!(Pr.frames >= 20 && Pr.frames <= 30)) bad.push(`the flare window lasted ${Pr.frames} frames (BK.sim is 100 frames a second: about 25 for ${Pr.window} s)`);
  if (Pr.heldAgain > 0) bad.push('a down held on and on flared again without a new press');
  for (const [k, W] of [['held', R.inWin], ['tapped', R.inWinTap]]) {
    if (W.res !== 'blocked' || W.lost > 0) bad.push(`a yellow blow inside the flare (down ${k}) was not cancelled: ${JSON.stringify(W)}`);
    if (!(W.burn > 0)) bad.push(`the attacker was not scorched by the flare (down ${k})`);
    if (!(W.heat > 0)) bad.push(`the flare gained no heat (down ${k})`); }
  if (!R.arrow.dead || R.arrow.lost > 0) bad.push(`an arrow in the flare was not melted: ${JSON.stringify(R.arrow)}`);
  if (!(R.arrow.heat > 0)) bad.push('a melted arrow gained no heat');
  if (R.red.res === 'blocked' || !(R.red.lost > 0)) bad.push(`a red blow did not break through the flare: ${JSON.stringify(R.red)}`);
  for (const [k, W] of [['40 frames after the press', R.late], ['80 frames after, down held throughout', R.lateFar], ['with no press at all', R.lateNoPress]]) {
    if (W.res === 'blocked' || !(W.lost > 0)) bad.push(`a blow ${k} did not land: ${JSON.stringify(W)}`);
    if (W.burn > 0) bad.push(`a blow ${k} scorched its attacker`);
    if (W.heat > 0) bad.push(`a blow ${k} gained heat`); }
  const M = R.miss;
  if (!(M.missed > 0) || !(M.rec > 0)) bad.push(`a flare that caught nothing with a foe near left no recovery: ${JSON.stringify(M)}`);
  if (M.moved > 2) bad.push(`she walked ${M.moved} px in the recovery`);
  if (M.reflare > 0) bad.push('a press in the recovery flared again');
  if (!(M.exposed > M.rest)) bad.push(`a blow in the recovery cost ${M.exposed}, no more than the same blow at rest (${M.rest})`);
  if (R.dry.rec > 0) bad.push('a flare with nothing near cost her a recovery');
  if (!(R.dryFight.firstLoss > 0)) bad.push('the dry run never took the swipe (no landing frame to time the flare by)');
  else {
    const I = R.realIn, E0 = R.realEarly;
    if (I.lost > 0 || !(I.stats.caught > 0)) bad.push(`a flare pressed 6 frames before the swipe did not cancel it: ${JSON.stringify(I)}`);
    if (!(I.burn > 0)) bad.push('the real swipe, cancelled, did not scorch the topiary');
    if (!(I.heat > 0)) bad.push('the real swipe, cancelled, gained no heat');
    if (!(E0.lost > 0)) bad.push(`a flare pressed 40 frames before the swipe still kept it off her: ${JSON.stringify(E0)}`); }
  if (R.high.lost > 0 || !(R.high.ducked > 0)) bad.push(`the held duck no longer lets a high swing go over her: ${JSON.stringify(R.high)}`);
  if (R.knight.res !== 'blocked') bad.push(`the knight's guard no longer blocks a yellow blow: ${JSON.stringify(R.knight)}`);
  if (R.water.flareWet || R.water.flaresWet > 0) bad.push('a flare lit in the water');
  for (const o of R.others) { if (o.flares > 0) bad.push(`${o.h}: opened an ember flare`); if (!o.ducking) bad.push(`${o.h}: down no longer ducks`); if (o.duckWalking) bad.push(`${o.h}: still ducked with down + a way`); if (!(o.walked > 4)) bad.push(`${o.h}: down + a way no longer walks (${o.walked} px)`); }
}
assert.deepEqual(bad, [], 'the ember flare:\n  ' + bad.join('\n  '));
console.log('the ember flare holds: a press of down is a 0.25 s flare, a blow caught in it is cancelled, scorches its attacker and gains heat, a blow after it lands, a flare that catches nothing leaves her rooted and exposed, holding down is still the plain duck, the knight guards as ever, and the other heroes keep the plain duck');
