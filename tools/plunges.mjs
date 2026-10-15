// tools/plunges.mjs - THE FOUR NEW PLUNGES (claude/plunges, scratch/brief-plunges.md; src/plunges.js). Each hero's plunge owns ONE job, and every one still
// produces the B14 FROM ABOVE key (hurtAs('plunge', ...)). Played in the real page, headless, on the Stockade's open floor:
//   HAMMER OF DAWN (paladin)  POISE: a guarded shield goblin's guard is BROKEN by one slam where the knight's plunge leaves it standing; a heavy foe's bar breaks
//                             where the knight's does not; HOLY LIGHT lands him safe on spikes and on a spiked foe where the knight is bitten
//   BOARDING (freebooter)     CONTROL: lands on a small foe's back and rides it (the stick walks it), into SPIKES by knock-into's rule (the foe dies, INTO THE
//                             SPIKES, the rider unhurt), leaps off with a second jump when the time is up / off a ledge / on jump; a brute, a flyer, an elite, a mini or
//                             a boss is struck and pogoed off instead (the pure rule too, in Node)
//   EARTHFALL (geomancer)     TERRAIN: a stone spike rises where she lands (a hit, FROM ABOVE's tag), stands ~3.5 s as a ONE-TILE step, is never within 3 tiles of a gate,
//                             never under a ceiling, one at a time, and the reach fill (GEO.baseGrid) never counts it as a way
//   AXE SPIN (berserker)      SHRED: five cuts on one target stacking REND (the 4th cracks it, out of a frenzy), then he pogoes off; three on a boss or a mini
//   node tools/plunges.mjs          (PORT for the page)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import * as PL from '../src/plunges.js';

/* ---- NODE: the pure rules ---- */
{ const ok = e => PL.boardable({ alive: true, ...e }, { fly: new Set(['wasp']), knockSkip: new Set(['spit']) });
  assert.ok(ok({ t: 'sprig' }), 'a sprig can be ridden'); assert.ok(ok({ t: 'soldier' }), 'a common soldier can be ridden');
  for (const [why, e] of [['a boss', { t: 'sprig', maxHp: 400 }], ['a mini', { t: 'sprig', mini: true }], ['an elite', { t: 'soldier', elite: true }], ['a brute', { t: 'brute' }], ['a troll', { t: 'troll' }],
    ['a big one', { t: 'sprig', big: true }], ['a flyer', { t: 'wasp' }], ['a ridden one', { t: 'sprig', ridden: true }], ['a pinned one', { t: 'sprig', pinned: 1 }], ['a harmless one', { t: 'sprig', harmless: true }]])
    assert.ok(!ok(e), why + ' cannot be ridden');
  assert.equal(PL.refusal({ maxHp: 9 }), 'TOO BIG TO RIDE'); assert.equal(PL.refusal({ t: 'brute' }), 'TOO HEAVY TO RIDE');
  /* the earthfall spot: open floor ahead; refuses a gate, a low ceiling and no floor */
  const q = o => ({ x: 8 * 16 + 8, y: 10 * 16, face: 1, foes: [], floorRow: () => 10, open: () => true, blocked: () => null, ...o });
  assert.deepEqual(PL.earthSpot(q({})), { tx: 9, fy: 10, onFoe: false }, 'one tile ahead of her');
  assert.equal(PL.earthSpot(q({ foes: [{ x: 8 * 16 + 30, y: 10 * 16 }] })).onFoe, true, 'under the nearest foe in reach');
  assert.ok(PL.earthSpot(q({ blocked: () => 'A GATE' })).why, 'never by a gate');
  assert.ok(PL.earthSpot(q({ open: (tx, ty) => ty > 8 })).why, 'never under a ceiling');
  assert.ok(PL.earthSpot(q({ floorRow: () => null })).why, 'never over a gap');
  assert.equal(PL.EARTH.reachTool, false, 'no reach tool counts it'); assert.equal(PL.EARTH.h, 1, 'a one-tile step');
  console.log('plunges (node): the boarding rule, the refusals and the earthfall spot hold');
}

const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    const { LEVELS, T } = await import('/src/level.js'); const out = { hammer: {}, board: {}, earth: {}, spin: {}, tags: {} };
    const K = BK.keys, P = () => BK.P, flat = n => { const t0 = BK.time; BK.sim(n); return BK.time - t0; };
    BK.manualSimulation = true; BK.SET.speed = 1; BK.log = [];
    const boot = (hero, god = true) => { BK.PROG.hero = hero; BK.setHero && BK.setHero(hero); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.state = 'play'; BK.god = god;
      const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
      for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 12; y < L.H - 2 && !spot; y++) {
        let ok = true; for (let x = x0; x < x0 + 16 && ok; x++) ok = at(x, y + 1) === 1 && [0,1,2,3,4,5,6,7,8,9,10,11].every(k => at(x, y - k) === 0);
        if (ok) spot = [x0 + 8, y]; }
      for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(20); BK.P.hp = BK.P.maxHp; BK.log.length = 0; return spot; };
    const set = (x, y, t) => { BK.L.grid[y * BK.L.W + x] = t; BK.resolveTiles && BK.resolveTiles(); };
    const drop = (x, y, face = 1) => { const p = P(); p.x = x; p.y = y; p.vx = 0; p.vy = 40; p.ground = false; p.plunge = false; p.atk = -1; p.dodge = 0; p.face = face; p.st = p.maxSt; p.hp = p.maxHp; K.down = true; BK.press('atk'); BK.sim(1); K.down = false; };
    const over = (e, a = 40) => drop(e.x, e.y - (e.h || 16) - a);
    const settle = (until, max = 160) => { for (let i = 0; i < max && !until(); i++) BK.sim(1); };
    const plungeTagged = () => BK.log.some(l => l.k === 'dmgE' && (Array.isArray(l.tag) ? l.tag.includes('plunge') : l.tag === 'plunge'));

    /* ====== HAMMER OF DAWN ====== */
    for (const hero of ['knight', 'paladin']) {   /* (the knight first: the paladin's waves outlive a reload, and the control must be clean) */
      { const spot = boot(hero); const [e] = BK.spawnFoe({ t: 'soldier', x: spot[0], y: spot[1] }); BK.sim(10); over(e); settle(() => e.broken > 0 || P().vy < -200); BK.sim(8); out.hammer[hero + 'Shield'] = { broken: +(e.broken || 0).toFixed(2), poise: Math.round(e.poise || 0), hp: e.hp, tagged: plungeTagged() }; }
      { const spot = boot(hero); const [e] = BK.spawnFoe({ t: 'swornsword', x: spot[0], y: spot[1] }); BK.sim(10); over(e); settle(() => e.broken > 0 || P().vy < -200); BK.sim(8); out.hammer[hero + 'Heavy'] = { broken: +(e.broken || 0).toFixed(2), poise: Math.round(e.poise || 0) }; }
      { const spot = boot(hero, false); const p = P(); const row = spot[1]; for (let dx = -3; dx <= 3; dx++) set(spot[0] + dx, row, T.SPIKE);
        BK.L.checkpointStub = 1; drop((spot[0]) * 16 + 8, row * 16 - 70); const hp0 = p.maxHp; settle(() => p.ground, 200); BK.sim(30); out.hammer[hero + 'Spikes'] = { hp: p.hp, maxHp: hp0, dead: !!p.dead }; }
      { const spot = boot(hero, false); const [e] = BK.spawnFoe({ t: 'thorn', x: spot[0] + 6, y: spot[1] }); BK.sim(10); e.brK = 1; over(e, 90); const hp0 = P().maxHp; settle(() => { e.brK = 1; return P().vy < -200 || P().ground; }, 120); out.hammer[hero + 'Thorn'] = { hp: P().hp, maxHp: hp0, name: e.t }; }
    }
    /* ====== BOARDING ====== */
    { const spot = boot('pirate'); const [e] = BK.spawnFoe({ t: 'sprig', x: spot[0], y: spot[1] }); BK.sim(10); const hp0 = e.hp; over(e); settle(() => P().riding, 120);
      const b = out.board; b.rode = !!P().riding; b.ridden = !!e.ridden; b.hpLoss = hp0 - e.hp; b.alive = e.alive; b.tagged = plungeTagged();
      const tr0 = BK.time; const x0 = e.x; K.right = true; flat(40); K.right = false; b.right = Math.round(e.x - x0); b.on = [Math.round(P().x - e.x), Math.round(P().y - e.y)];
      const x1 = e.x; K.left = true; flat(40); K.left = false; b.left = Math.round(e.x - x1);
      let best = 0; for (let i = 0; i < 400 && P().riding; i++) BK.sim(1); b.secs = +(BK.time - tr0).toFixed(2); b.ended = !P().riding; b.vy = Math.round(P().vy); }
    { const spot = boot('pirate'); const [e] = BK.spawnFoe({ t: 'sprig', x: spot[0] - 3, y: spot[1] }); BK.sim(10);
      for (let dx = 3; dx <= 5; dx++) set(spot[0] + dx - 3, spot[1], T.SPIKE);
      over(e); settle(() => P().riding, 120); const hp0 = P().hp; K.right = true; settle(() => !e.alive || !P().riding, 400); K.right = false; BK.sim(12);
      out.board.spikes = { dead: !e.alive, rideEnded: !P().riding, hp: P().hp, hp0, said: BK.knockInto().stats.said.slice(-3), into: BK.knockInto().stats.into, byWhy: BK.knockInto().stats.byWhy, vy: Math.round(P().vy) }; }
    { const spot = boot('pirate'); const [e] = BK.spawnFoe({ t: 'sprig', x: spot[0], y: spot[1] }); BK.sim(10);
      for (let dy = 1; dy <= 6; dy++) for (let dx = 2; dx <= 4; dx++) set(spot[0] + dx, spot[1] + dy, 0);   /* a hole three wide and six deep ahead of it */
      over(e); settle(() => P().riding, 120); K.right = true; let leapt = false; for (let i = 0; i < 300 && P().riding; i++) BK.sim(1); K.right = false; leapt = !P().riding; BK.sim(4);
      out.board.ledge = { leapt, vy: Math.round(P().vy), secs: 0 }; }
    for (const t of ['brute']) { const spot = boot('pirate'); const [e] = BK.spawnFoe({ t, x: spot[0], y: spot[1] }); BK.sim(10); over(e); let best = 0; for (let i = 0; i < 70; i++) { BK.sim(1); if (P().vy < best) best = P().vy; if (P().riding) break; }
      out.board[t] = { rode: !!P().riding, pogo: Math.round(best) }; }
    /* ====== EARTHFALL ====== */
    const flatEarth = () => BK.geo().pieces().filter(q => q.kind === 'earthfall');
    { const spot = boot('geomancer'); const g0 = BK.L.grid.slice(); const p = P(); drop(spot[0] * 16 + 8, spot[1] * 16 - 70, 1); settle(() => p.ground, 200); BK.sim(6);
      const pcs = flatEarth(), q = pcs[0], e1 = out.earth; e1.n = pcs.length; e1.cells = q ? q.cells.length : 0; e1.col = q ? q.cells[0].tx : null; e1.heroCol = Math.floor(p.x / 16); e1.row = q ? q.cells[0].ty : null; e1.floorRow = spot[1];
      e1.solid = q ? BK.L.grid[q.cells[0].i] === T.SOLID : false; e1.base = q ? BK.geo().baseGrid()[q.cells[0].i] : null; e1.tagged = plungeTagged(); e1.life = q ? q.life : null;
      let t = 0; const tt0 = BK.time; settle(() => flatEarth().length === 0, 600); e1.gone = flatEarth().length === 0; e1.secs = +(BK.time - tt0).toFixed(2) + 0; e1.restored = BK.L.grid.every((v, i) => v === g0[i]); }
    { const spot = boot('geomancer'); const [e] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 3, y: spot[1] }); BK.sim(10); const hp0 = e.hp; const p = P(); drop(spot[0] * 16 + 8, spot[1] * 16 - 70, 1); settle(() => p.ground, 200); BK.sim(6);
      out.earth.nearFoe = { hit: hp0 - e.hp, tagged: plungeTagged(), piece: flatEarth().length }; }
    { const spot = boot('geomancer'); const [e] = BK.spawnFoe({ t: 'sprig', x: spot[0], y: spot[1] }); BK.sim(10); const hp0 = e.hp; over(e); settle(() => P().vy < -200, 120); BK.sim(4);
      out.earth.onHead = { hit: hp0 - e.hp, piece: flatEarth().length, pogo: Math.round(P().vy) }; }
    { const spot = boot('geomancer'); const p = P(); set(spot[0] + 2, spot[1] - 2, T.PORT); set(spot[0] + 2, spot[1] - 1, T.PORT); drop(spot[0] * 16 + 8, spot[1] * 16 - 70, 1); settle(() => p.ground, 200); BK.sim(6); out.earth.gate = flatEarth().length; }
    { const spot = boot('geomancer'); const p = P(); for (let dx = -3; dx <= 5; dx++) set(spot[0] + dx, spot[1] - 3, T.SOLID); drop(spot[0] * 16 + 8, spot[1] * 16 - 30, 1); settle(() => p.ground, 200); BK.sim(6); out.earth.ceiling = flatEarth().length; }
    { const spot = boot('geomancer'); const p = P(); drop(spot[0] * 16 + 8, spot[1] * 16 - 70, 1); settle(() => p.ground, 200); BK.sim(6); p.x = (spot[0] + 4) * 16; BK.sim(4); drop(p.x, spot[1] * 16 - 70, 1); settle(() => p.ground, 200); BK.sim(6); out.earth.second = flatEarth().length; }
    { const spot = boot('geomancer'); const p = P(); drop(spot[0] * 16 + 8, spot[1] * 16 - 70, 1); settle(() => p.ground, 200); BK.sim(6);
      const { floodReach } = await import('/src/reachcore.js'); const fresh = LEVELS.find(l => l.id === 'stockade').build();
      const sz = L => { const r = floodReach(L, T, { rides: true }); return r.footing.size; };
      out.earth.reach = { fresh: sz(fresh), base: sz({ ...BK.L, grid: BK.geo().baseGrid() }), piece: flatEarth().length }; }
    /* ====== AXE SPIN ====== */
    { const spot = boot('berserker'); const [e] = BK.spawnFoe({ t: 'sprig', x: spot[0], y: spot[1] }); e.hp = 5000; BK.sim(10); const hp0 = e.hp, st = { ...BK.bz().stats }; P().frenzyT = 0;
      over(e); let n = 0; settle(() => P().spinning, 120); const s = P().spinning; out.spin.spun = !!s; let best = 0; for (let i = 0; i < 260 && P().spinning; i++) { BK.sim(1); } n = s ? s.n : 0;
      for (let i = 0; i < 12; i++) { if (P().vy < best) best = P().vy; BK.sim(1); }
      const st2 = BK.bz().stats; out.spin.hits = n; out.spin.rends = st2.rends - st.rends; out.spin.cracks = st2.cracks - st.cracks; out.spin.hpLoss = hp0 - e.hp; out.spin.dead = !e.alive; out.spin.pogo = Math.round(best); out.spin.tagged = plungeTagged(); out.spin.frenzy = P().frenzyT || 0; }
    { const spot = boot('berserker'); const [e] = BK.spawnFoe({ t: 'sprig', x: spot[0], y: spot[1] }); e.mini = true; e.hp = 5000; BK.sim(10); over(e); settle(() => P().spinning, 120); out.spin.miniMax = P().spinning ? P().spinning.max : null; }
    { const spot = boot('knight'); const [e] = BK.spawnFoe({ t: 'sprig', x: spot[0], y: spot[1] }); e.hp = 5000; BK.sim(10); const hp0 = e.hp; over(e); settle(() => P().vy < -200, 120); out.spin.knightLoss = hp0 - e.hp; }
    { const spot = boot('berserker'); const [e] = BK.spawnFoe({ t: 'sprig', x: spot[0], y: spot[1] }); e.hp = 5000; BK.sim(10); const hp0 = e.hp; over(e); settle(() => P().spinning, 120); settle(() => !P().spinning, 200); out.spin.berserkerLoss = hp0 - e.hp; }
    return out; })()`, 600000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
console.log(JSON.stringify(R));
const bad = [], H = R.hammer, B = R.board, E = R.earth, S = R.spin;
/* HAMMER */
if (!(H.paladinShield.broken > 0)) bad.push('HAMMER: the slam did not break a guarded shield goblin (' + JSON.stringify(H.paladinShield) + ')');
if (H.knightShield.broken > 0) bad.push('HAMMER: the knight\'s plunge broke the same guard (the control must stand): ' + JSON.stringify(H.knightShield));
if (!(H.paladinHeavy.poise >= H.knightHeavy.poise + 30)) bad.push("HAMMER: a heavy bar must take far more than the knights plunge does (" + JSON.stringify([H.paladinHeavy, H.knightHeavy]) + ")");
if (!(H.knightThorn.hp < H.knightThorn.maxHp)) bad.push("HOLY LIGHT control: the knight was NOT bitten by the bristling spiked foe (" + JSON.stringify(H.knightThorn) + ")");
if (!H.paladinShield.tagged) bad.push('HAMMER: the slam is not tagged plunge (B14 FROM ABOVE)');
if (H.paladinSpikes.hp < H.paladinSpikes.maxHp || H.paladinSpikes.dead) bad.push('HOLY LIGHT: the paladin was bitten by the spikes (' + JSON.stringify(H.paladinSpikes) + ')');
if (!(H.knightSpikes.hp < H.knightSpikes.maxHp || H.knightSpikes.dead)) bad.push('HOLY LIGHT control: the knight was NOT bitten by the same spikes (' + JSON.stringify(H.knightSpikes) + ') - the test proves nothing');
if (H.paladinThorn.hp < H.paladinThorn.maxHp) bad.push('HOLY LIGHT: the spiked foe bit the paladin (' + JSON.stringify(H.paladinThorn) + ')');
/* BOARDING */
if (!B.rode || !B.ridden) bad.push('BOARDING: no ride began (' + JSON.stringify(B) + ')');
if (!B.alive || !(B.hpLoss > 0)) bad.push('BOARDING: the landing must hurt and not kill (' + B.hpLoss + ')');
if (!B.tagged) bad.push('BOARDING: the landing is not tagged plunge (B14)');
if (!(B.right > 8) || !(B.left < -8)) bad.push('BOARDING: the stick does not steer it (' + B.right + ' / ' + B.left + ')');
if (Math.abs(B.on[0]) > 6 || B.on[1] > -2) bad.push('BOARDING: he is not on its back ' + B.on);
if (!B.ended || B.secs < 1.2 || B.secs > 2.0 || B.vy > -250) bad.push('BOARDING: the ride must last ~1.5 s and end in a leap (' + JSON.stringify({ e: B.ended, s: B.secs, vy: B.vy }) + ')');
if (!B.spikes.dead || !B.spikes.rideEnded || B.spikes.hp < B.spikes.hp0) bad.push('BOARDING: steered into spikes the foe must die and the rider walk away (' + JSON.stringify(B.spikes) + ')');
if (!(B.spikes.into.spikes >= 1) || !B.spikes.said.includes('INTO THE SPIKES')) bad.push('BOARDING: knock-into\'s rule did not say INTO THE SPIKES (' + JSON.stringify(B.spikes.said) + ')');
if (!B.ledge.leapt) bad.push('BOARDING: riding off a ledge must leap off');
if (B.brute.rode || B.brute.pogo > -300) bad.push('BOARDING: a brute must be struck and pogoed off, not ridden (' + JSON.stringify(B.brute) + ')');
/* EARTHFALL */
if (E.n !== 1 || E.cells !== 1) bad.push('EARTHFALL: one one-tile spike expected (' + E.n + '/' + E.cells + ')');
if (E.col !== E.heroCol + 1 || E.row !== E.floorRow) bad.push('EARTHFALL: not one tile ahead on the floor (' + JSON.stringify({ c: E.col, h: E.heroCol, r: E.row, f: E.floorRow }) + ')');
if (!E.solid || E.base !== 0) bad.push('EARTHFALL: the stone is not real level, or the base grid still has it (' + E.solid + '/' + E.base + ')');
if (!E.gone || !E.restored || E.secs < 2.5 || E.secs > 4.6) bad.push('EARTHFALL: it must stand ~3.5 s and give the level back exactly (' + JSON.stringify({ g: E.gone, r: E.restored, s: E.secs }) + ')');
if (!(E.nearFoe.hit > 0) || !E.nearFoe.tagged || E.nearFoe.piece !== 1) bad.push('EARTHFALL: the spike must hit the foe by her (tag plunge) and stand (' + JSON.stringify(E.nearFoe) + ')');
if (E.onHead.piece !== 1 || E.onHead.pogo > -300) bad.push('EARTHFALL: on a head she still pogoes and the step rises (' + JSON.stringify(E.onHead) + ')');
if (E.gate !== 0) bad.push('EARTHFALL: a spike rose by a gate');
if (E.ceiling !== 0) bad.push('EARTHFALL: a spike rose under a ceiling');
if (E.second !== 1) bad.push('EARTHFALL: one at a time (' + E.second + ')');
if (E.reach.fresh !== E.reach.base || E.reach.piece !== 1) bad.push('EARTHFALL: the reach fill must see the level without her stone (' + JSON.stringify(E.reach) + ')');
/* AXE SPIN */
if (!S.spun || S.hits !== 5) bad.push('AXE SPIN: five cuts expected (' + S.hits + ')');
if (S.rends !== 5 || S.cracks !== 1) bad.push('AXE SPIN: REND must stack five and crack on the fourth, out of a frenzy (' + S.rends + '/' + S.cracks + ')');
if (S.pogo > -300) bad.push('AXE SPIN: he must rebound off it (' + S.pogo + ')');
if (!S.tagged) bad.push('AXE SPIN: the landing is not tagged plunge (B14)');
if (S.miniMax !== 3) bad.push('AXE SPIN: a mini takes three cuts, not ' + S.miniMax);
if (!(S.berserkerLoss > S.knightLoss * 1.5)) bad.push('AXE SPIN: it must shred - the berserker did ' + S.berserkerLoss + ' to the knight\'s ' + S.knightLoss);
assert.deepEqual(bad, [], 'plunges:\n  ' + bad.join('\n  '));
console.log('plunges: hammer of dawn breaks guards, poise and lands safe; boarding rides, steers into knock-into hazards and leaps; earthfall rises, steps, expires and is never a way; axe spin shreds and stacks rend');
