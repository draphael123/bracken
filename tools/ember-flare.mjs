// tools/ember-flare.mjs — THE FLAME WARD (claude/pyrokit, Daniel 10-30 20:50-20:52; scratch/brief-pyrokit-1101.md 3A). The file keeps its name (the suite and
// the reports call it ember-flare) but it holds the ward that REPLACED the ember flare: the pyromancer's down is no longer her parry (it is STOKE, tools/pyro-kit.mjs);
// TAP C is a 0.45 s dome of fire (src/flame-ward.js WARD):
//   - a yellow blow in its first WARD.perfect (0.15 s) is PARRIED: cancelled, the attacker scorched + burn-marked, heat gained, the shared parry (riposte window)
//   - a yellow blow later in it is BLOCKED for stamina (none lost); with no stamina the ward BREAKS and half the blow comes through
//   - a red blow breaks through; a blow after the ward lands; a ward cannot be held past WARD.t and waits WARD.cd for the next
//   - a foe touching the dome is burned once a ward (and marked); an arrow flying into it melts
//   - a ward that caught/blocked/burned nothing with a foe near ROOTS her (a blow costs more); with nothing near it costs nothing
//   - C HELD to WARD.fold folds the ward into the held fireball - never both on one frame; a ward on its cooldown never stops a charge
//   - WATER: no ward lights; DOWN never raises it; the knight's C still blocks; a real topiary swipe tapped just before it lands is parried
// On flat Stockade floor, every foe held far off (>420 px a foe is frozen) and brought in only for the instant a blow is called. BK.sim is 100 frames a second.
//   node tools/ember-flare.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const bad = [];
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    if (!BK.ward) return { err: 'no BK.ward: there is no flame ward' };
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
    const home = () => { clear(); none(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.hp = P.maxHp; P.st = P.maxSt; P.vx = 0; P.heat = 0; P.heatGrace = 0; P.hurt = 0; P.face = 1; P.fwCd = 0; P.fwRec = 0; P.riposteT = 0; BK.sim(30); P.heat = 0; P.heatGrace = 0; P.st = P.maxSt; BK.wardReset(); };
    const hold = () => { BK.P.vx = 0; BK.P.x = spot[0] * 16 + 8; BK.P.inv = 0; };
    const seedRandom = n => { let s = n; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
    const Wd = () => BK.ward();
    const FAR = 700, NEAR = 130;
    const foeAt = dx => { const [f] = BK.spawnFoe({ t: 'topiary', x: spot[0] + dx, y: spot[1], face: -1 }); f.hp = 9999; return f; };
    const park = (f, d) => { f.x = spot[0] * 16 + (d || FAR); };
    const blow = (f, o = {}) => { const P = BK.P, x0 = f.x; f.x = P.x + 20; P.inv = 0; P.hurt = 0; const hp0 = P.hp, h0 = P.heat || 0, st0 = P.st, m0 = BK.pyroMarked(f);
      const res = BKT.damagePlayer(f.x, o.dmg || 10, { who: f, unblockable: !!o.red }); const r = { res: res === 'blocked' ? 'blocked' : res === false ? 'over' : 'hit', lost: hp0 - P.hp, burn: f.burn || 0, heat: Math.round((P.heat || 0) - h0), st: Math.round(st0 - P.st), marked: BK.pyroMarked(f) && !m0, riposte: (P.riposteT || 0) > 0, parryT: (P.parryT || 0) > 0 };
      f.x = x0; P.hp = P.maxHp; P.inv = 0; return r; };
    /* TAP C: one frame down, then n frames (C up), then the blow */
    const tapThen = (n, o = {}) => { home(); const f = foeAt(o.far ? FAR : NEAR); park(f, o.far ? FAR : NEAR); if (o.st0) BK.P.st = 0;
      K.block = true; hold(); BK.sim(1); K.block = false; for (let k = 1; k < n; k++) { hold(); park(f, o.far ? FAR : NEAR); BK.sim(1); }
      hold(); if (o.st0) BK.P.st = 0; const w = Wd(); const r = blow(f, o); r.state = { up: w.up, t: +w.t.toFixed(2) }; r.stats = Wd().stats; none(); return r; };
    // ---- THE TAP: up at once, WARD.t long, then WARD.cd; a tap in the cooldown raises nothing ----
    { home(); const r = {}; const f = foeAt(FAR); park(f);
      K.block = true; hold(); BK.sim(1); K.block = false; r.upAtOnce = Wd().up; let n = 1; while (Wd().up && n < 120) { hold(); BK.sim(1); n++; } r.frames = n; r.len = Wd().len;
      r.cdAfter = +Wd().cd.toFixed(2); const w0 = Wd().stats.wards; K.block = true; BK.sim(1); K.block = false; BK.sim(2); r.inCd = Wd().stats.wards - w0;
      BK.sim(120); const w1 = Wd().stats.wards; K.block = true; BK.sim(1); K.block = false; r.afterCd = Wd().stats.wards - w1; none(); BK.sim(60);
      /* a long hold is not a long ward: it folds at WARD.fold */
      home(); park(foeAt(FAR)); let both = 0, upFrames = 0; K.block = true; for (let k = 0; k < 80; k++) { hold(); BK.sim(1); const w = Wd(), pk = BK.pyroKit(); if (w.up) upFrames++; if (w.up && pk.fbHold > 0) both++; }
      r.heldUpFrames = upFrames; r.bothFrames = both; r.fbHold = BK.pyroKit().fbHold; r.folded = Wd().stats.folded; K.block = false; BK.sim(5); none();
      /* a ward on its cooldown never stops a charge */
      home(); park(foeAt(FAR)); K.block = true; BK.sim(1); K.block = false; BK.sim(50); const cd = Wd().cd; K.block = true; for (let k = 0; k < 40; k++) { hold(); BK.sim(1); } r.chargeInCd = { cd: +cd.toFixed(2), fbHold: BK.pyroKit().fbHold, up: Wd().up }; K.block = false; BK.sim(3); none();
      /* DOWN never raises it */
      home(); park(foeAt(NEAR), NEAR); K.down = true; for (let k = 0; k < 80; k++) { hold(); BK.sim(1); } r.downWards = Wd().stats.wards; none();
      out.tap = r; }
    // ---- IN THE BEAT: parried ----
    out.parry = tapThen(5);
    out.block = tapThen(30);
    out.broken = tapThen(30, { st0: true });
    out.red = tapThen(5, { red: true });
    out.after = tapThen(60);
    out.rest = (() => { home(); const f = foeAt(FAR); hold(); BK.sim(5); return blow(f); })();
    // an arrow into the ward melts
    { home(); const f = foeAt(FAR); K.block = true; hold(); BK.sim(1); K.block = false; const P = BK.P; const s = { x: P.x + 20, y: P.y - 8, vx: -200, vy: 0, g: 0, life: 3, arrow: true }; BK.seeds().push(s); const hp0 = P.hp; for (let k = 0; k < 6; k++) { hold(); park(f); BK.sim(1); }
      out.arrow = { dead: !!s.dead, lost: hp0 - P.hp, heat: Math.round(P.heat || 0), melted: Wd().stats.melted }; none(); }
    // CONTACT: a foe standing in the dome is burned once, and marked; no mistime
    { home(); const f = foeAt(FAR); const P = BK.P; f.x = P.x + 14; f.mode = 'idle'; const hp0 = f.hp; K.block = true; hold(); BK.sim(1); K.block = false; for (let k = 0; k < 50; k++) { hold(); f.x = P.x + 14; f.vx = 0; BK.sim(1); }
      out.contact = { took: hp0 - f.hp, burn: f.burn || 0, marked: BK.pyroMarked(f), contacts: Wd().stats.contacts, rec: Wd().rec }; park(f); none(); }
    // ---- THE MISTIME: nothing caught, a foe near -> rooted, exposed ----
    { home(); const f = foeAt(NEAR); park(f, NEAR); const P = BK.P, r = {}; K.block = true; hold(); BK.sim(1); K.block = false; for (let k = 0; k < 47; k++) { hold(); park(f, NEAR); BK.sim(1); }
      r.rec = Wd().rec; r.fizzled = Wd().stats.fizzled; const x0 = P.x; K.right = true; for (let k = 0; k < 10; k++) { park(f, NEAR); BK.sim(1); } K.right = false; r.moved = Math.abs(P.x - x0);
      park(f, NEAR); r.exposed = blow(f).lost; out.miss = r; none(); }
    { home(); park(foeAt(FAR)); K.block = true; hold(); BK.sim(1); K.block = false; for (let k = 0; k < 50; k++) { hold(); BK.sim(1); } out.dry = { rec: Wd().rec }; none(); }
    // ---- A REAL FIGHT: the topiary's swipe, its landing frame measured with no ward ----
    const fight = (secs, o = {}) => { home(); if (o.seed) seedRandom(o.seed); const [f] = BK.spawnFoe({ t: 'topiary', x: spot[0] + 2, y: spot[1], face: -1 }); let lost = 0, firstLoss = -1;
      for (let k = 0; k < secs * 100; k++) { const hp0 = BK.P.hp; K.block = o.tapAt !== undefined && k === o.tapAt; hold(); BK.sim(1); if (BK.P.hp < hp0) { lost += hp0 - BK.P.hp; if (firstLoss < 0) firstLoss = k; BK.P.hp = BK.P.maxHp; } if (BK.P.dead) { BK.P.dead = 0; BK.P.hp = BK.P.maxHp; } if (o.stopAt && o.stopAt(k)) break; }
      none(); return { lost: Math.round(lost), firstLoss, burn: f.burn || 0, stats: Wd().stats }; };
    const dry = fight(8, { seed: 77, stopAt: k => k > 0 && BK.P.hp < BK.P.maxHp });
    out.dryFight = { firstLoss: dry.firstLoss };
    if (dry.firstLoss > 0) { out.realIn = fight(9, { seed: 77, tapAt: dry.firstLoss - 6, stopAt: k => k > dry.firstLoss + 12 });
      out.realEarly = fight(9, { seed: 77, tapAt: Math.max(1, dry.firstLoss - 70), stopAt: k => k > dry.firstLoss + 12 }); }
    // ---- WATER ----
    { home(); const P = BK.P; const pool = { x0: P.x - 40, x1: P.x + 40, y: P.y - 6, bottom: P.y + 2, shallow: true, emberTest: true }; (BK.L.pools = BK.L.pools || []).push(pool);
      BK.sim(3); K.block = true; hold(); BK.sim(1); K.block = false; BK.sim(3); out.water = { up: Wd().up, wards: Wd().stats.wards, doused: Wd().stats.doused }; BK.L.pools.splice(BK.L.pools.indexOf(pool), 1); none(); }
    // ---- THE KNIGHT ----
    { setUp('knight'); home(); const f = foeAt(FAR); K.block = true; hold(); BK.sim(30); out.knight = blow(f); K.block = false; none(); }
    Math.random = Math.random;
    return out;
  })()`, 900000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }

if (R.err) bad.push(R.err);
else {
  for (const [k, v] of Object.entries(R)) console.log(k, JSON.stringify(v));
  const T = R.tap;
  if (!T.upAtOnce) bad.push('a tap of C raised no ward on the frame');
  if (!(T.frames >= T.len * 100 - 2 && T.frames <= T.len * 100 + 3)) bad.push(`the ward lasted ${T.frames} frames (want ~${T.len * 100})`);
  if (!(T.cdAfter > 0.8)) bad.push('no cooldown after the ward: ' + T.cdAfter);
  if (T.inCd > 0) bad.push('a tap in the cooldown raised a ward');
  if (T.afterCd !== 1) bad.push('a tap after the cooldown raised no ward');
  if (T.bothFrames > 0) bad.push(`ward and fireball on one frame ${T.bothFrames} times (the conflict matrix)`);
  if (!(T.heldUpFrames <= 36 && T.folded === 1 && T.fbHold >= 1)) bad.push('C held did not fold the ward into the fireball at ~0.35 s: ' + JSON.stringify(T));
  if (!(T.chargeInCd.cd > 0 && T.chargeInCd.fbHold >= 1 && !T.chargeInCd.up)) bad.push('a ward on its cooldown stopped a charge: ' + JSON.stringify(T.chargeInCd));
  if (T.downWards > 0) bad.push('DOWN raised a ward (it is STOKE now)');
  const Pa = R.parry;
  if (Pa.res !== 'blocked' || Pa.lost > 0) bad.push('a yellow blow in the ward\'s beat was not parried: ' + JSON.stringify(Pa));
  if (!(Pa.burn > 0) || !Pa.marked) bad.push('the parried attacker was not scorched + marked: ' + JSON.stringify(Pa));
  if (!(Pa.heat >= 10)) bad.push('the parry gained ' + Pa.heat + ' heat (want >= 10)');
  if (!Pa.riposte || !Pa.parryT || !(Pa.stats.parries > 0)) bad.push('the parry is not the shared parry (riposte window, parryT): ' + JSON.stringify(Pa));
  const B = R.block;
  if (B.res !== 'blocked' || B.lost > 0 || !(B.st > 0) || !(B.stats.blocks > 0) || B.stats.parries > 0) bad.push('a yellow blow late in the ward was not BLOCKED for stamina: ' + JSON.stringify(B));
  if (!(R.broken.lost > 0 && R.broken.lost < R.rest.lost) || !(R.broken.stats.broken > 0)) bad.push(`a block with no stamina did not break the ward and let half through: ${JSON.stringify(R.broken)} vs rest ${R.rest.lost}`);
  if (R.red.res === 'blocked' || !(R.red.lost > 0)) bad.push('a red blow did not break through the ward: ' + JSON.stringify(R.red));
  if (R.after.res === 'blocked' || !(R.after.lost > 0) || R.after.burn > 0) bad.push('a blow after the ward did not land: ' + JSON.stringify(R.after));
  if (!R.arrow.dead || R.arrow.lost > 0 || !(R.arrow.heat > 0)) bad.push('an arrow into the ward was not melted for heat: ' + JSON.stringify(R.arrow));
  const C = R.contact;
  if (!(C.took > 0) || !(C.burn > 0) || !C.marked || C.contacts !== 1 || C.rec > 0) bad.push('a foe in the dome was not burned once and marked (or it cost a mistime): ' + JSON.stringify(C));
  const M = R.miss;
  if (!(M.rec > 0) || !(M.fizzled > 0)) bad.push('an empty ward with a foe near left no mistime: ' + JSON.stringify(M));
  if (M.moved > 2) bad.push(`she walked ${M.moved} px in the mistime`);
  if (!(M.exposed > R.rest.lost)) bad.push(`a blow in the mistime cost ${M.exposed}, no more than at rest (${R.rest.lost})`);
  if (R.dry.rec > 0) bad.push('an empty ward with nothing near cost a mistime');
  if (!(R.dryFight.firstLoss > 0)) bad.push('the dry run never took the swipe');
  else { if (R.realIn.lost > 0 || !(R.realIn.stats.parries > 0)) bad.push('a ward tapped 6 frames before the real swipe did not parry it: ' + JSON.stringify(R.realIn));
    if (!(R.realEarly.lost > 0)) bad.push('a ward tapped 0.7 s early still kept the swipe off her: ' + JSON.stringify(R.realEarly)); }
  if (R.water.up || R.water.wards > 0) bad.push('a ward lit in the water');
  if (R.knight.res !== 'blocked') bad.push('the knight\'s guard no longer blocks: ' + JSON.stringify(R.knight));
}
assert.deepEqual(bad, [], 'the flame ward:\n  ' + bad.join('\n  '));
console.log('the flame ward holds: a tap is a 0.45 s ward then a 1 s wait, its first 0.15 s parries (scorch, mark, heat, riposte), later blocks for stamina (none left: it breaks), red breaks through, contact burns once, arrows melt, an empty ward near a foe roots her, a hold folds it into the fireball (never both), water puts it out, down is not the ward');
