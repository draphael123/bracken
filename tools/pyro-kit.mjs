// tools/pyro-kit.mjs — THE PYRO KIT (claude/pyrokit, Daniel 10-30 20:50-20:52 + 10-31 08:41; scratch/brief-pyrokit-1101.md). The ward itself is
// tools/ember-flare.mjs; this holds the rest of her kit, in the running game (and the save half in Node, first):
//   THE L10 CARD     a pyro who never played before the kit is offered THE JET / THE EMBER SHOT / WILDFIRE at level 10 (and only there), the pick saves;
//                    a save that played her before keeps BOTH (migratePyroKit) and its L10 is the plain small perks; idempotent
//   STOKE            down held still fills the heat bar at PYRO_KIT.stoke/s (to FULL); a way held, or a hit, stops it; never while the ward is up
//   HELD FIREBALL    C held 0.18 / 0.9 / 1.5 / 2.0 / 2.5 s and let go = steps 1-5 (claude/pyrocontrols: five); a tap is only the ward; each hit = swordDmg x k[step] x heat and BURN-MARKS;
//                    step 3 EXPLODES and burns its neighbours; she walks at ~half speed with a ball on the staff; a dodge drops it; the big step
//                    does not out-damage the staff per second
//   LIVING BOMB     (claude/pyrokit2) her passive: a hit adds a pip (tapped ball / cut / ward = 1, step 3+ = 2); the 3rd pip bursts the foe (swordDmg x 1.2 x heat) and gives each neighbour a pip;
//                    no pips for 2 s after a burst; a boss/mini burst is capped and only every 3rd staggers; growth L14 / L25 / L40
//   METEOR FALL     a full bar's press of C: a told meteor (ring + 0.9 s) on the most-pipped foe ahead; everything in the blast takes swordDmg x 3 x heat and THREE pips -> chain bursts;
//                    the bar empties and the bursts do not refill it; a boss's blow is capped
//   THE CARDS        UP + tap C = THE EMBER SHOT, UP + hold C = THE JET - only with the card; without it UP + C is the plain ward / fireball
//   PLAIN DODGE      her roll and her air dodge burn nothing and cost no heat; CINDER STEP leaves no fires
//   node tools/pyro-kit.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { migrateProgress, perkOffer, pickMilestone, PYRO_CARDS } from '../src/progression.js';
import { xpFloor } from '../src/xp.js';
import { openPage } from './cdp.mjs';

const bad = [];
/* ---- THE SAVE (Node) ---- */
{ const fresh = migrateProgress(null).progress;
  if (fresh.pyroBoth) bad.push('a fresh save was given both pyro cards');
  fresh.xp = { pyro: xpFloor(10) }; fresh.card = { pyro: { v: 4, e: 3, m: 3, ms: { 5: 'stride' } } };
  const offer = perkOffer(fresh, 'pyro', 10).map(k => k.id);
  if (offer.join() !== 'pjet,pember,pspread') bad.push('the L10 pyro offer is ' + offer.join() + ' (want pjet,pember,pspread)');
  if (perkOffer(fresh, 'pyro', 15).some(k => k.card)) bad.push('the pyro cards were offered past L10');
  if (perkOffer(fresh, 'knight', 10).some(k => k.card)) bad.push('the knight was offered the pyro cards');
  const err = pickMilestone(fresh, 'pyro', 10, 'pjet', 10); if (err) bad.push('picking THE JET at L10: ' + err);
  if (fresh.card.pyro.ms[10] !== 'pjet') bad.push('THE JET pick did not save');
  const old = migrateProgress(JSON.stringify({ progressionVersion: 2, xp: { pyro: xpFloor(12) }, hero: 'pyro' })).progress;
  if (old.pyroBoth !== true) bad.push('a save that played the pyromancer before the kit lost her jet/ember (pyroBoth not set)');
  if (perkOffer(old, 'pyro', 10).some(k => k.card)) bad.push('a pre-kit save (both cards kept) was offered the cards again at L10');
  const again = migrateProgress(JSON.stringify(old)).progress; if (again.pyroBoth !== true || again.pyroKit !== 1) bad.push('the pyro-kit migration is not idempotent');
  const never = migrateProgress(JSON.stringify({ progressionVersion: 2, xp: { knight: xpFloor(12) } })).progress; if (never.pyroBoth) bad.push('a save that never played her was given both cards');
  if (PYRO_CARDS.length !== 2) bad.push('PYRO_CARDS is not the jet + the ember shot'); }

const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    if (!BK.pyroKit) return { err: 'no BK.pyroKit' };
    const { LEVELS } = await import('/src/level.js');
    const out = {};
    const setUp = (h, lv) => { BK.setHero(h); BK.reset({ fresh: true }); if (lv) BKT.setHeroLevel(h, lv); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5); };
    setUp('pyro', 10);
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
    let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 40 && !spot; x0++) for (let y = 7; y < L.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 34 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0);
      if (ok) spot = [x0 + 6, y]; }
    if (!spot) return { err: 'no flat floor' };
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const P = () => BK.P, Kt = () => BK.pyroKit();
    const home = () => { clear(); none(); for (const q of BK.fires()) q.life = 0; BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; Object.assign(P(), { hp: P().maxHp, st: P().maxSt, vx: 0, heat: 0, heatGrace: 0, hurt: 0, face: 1, fwCd: 0, fwRec: 0, full: false, fullT: 0, dodge: 0, dodgeCd: 0 }); BK.sim(30); Object.assign(P(), { heat: 0, heatGrace: 0, st: P().maxSt, full: false, mixN: 0, mixLast: null }); BK.wardReset(); };   /* (mixN: the riposte mix-up chain would multiply a varied verb) */
    const foe = (t, dx, hp) => { const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1 }); if (hp) { f.hp = hp; if (f.maxHp) f.maxHp = hp; } f.frozen = 0; return f; };
    const freeze = f => { f.vx = 0; f.mode = 'idle'; f.modeT = 9; f.cd = 9; };
    const sw = BKT.swordDmg(), KK = Kt().K;
    out.sw = sw;
    // ---- STOKE ----
    { home(); const r = {}; K.down = true; for (let k = 0; k < 200; k++) BK.sim(1); r.heat2s = Math.round(P().heat); r.stoking = Kt().stoking; K.down = false; BK.sim(5);
      home(); K.down = true; K.right = true; BK.sim(150); r.walkHeat = Math.round(P().heat); none();
      home(); K.down = true; BK.sim(60); const f = foe('topiary', 30); f.x = P().x + 20; BKT.damagePlayer(f.x, 5, { who: f }); P().hurt = 0.01; BK.sim(2); const h0 = P().heat; BK.sim(40); r.afterHit = +(P().heat - h0).toFixed(1); f.alive = false; none();
      home(); K.down = true; BK.sim(800); r.full = P().full; none(); P().full = false; P().heat = 0;
      /* never while the ward is up */ home(); K.down = true; BK.sim(30); K.block = true; BK.sim(1); K.block = false; let both = 0; for (let k = 0; k < 40; k++) { BK.sim(1); if (BK.ward().up && Kt().stoking) both++; } r.stokeInWard = both; none();
      out.stoke = r; }
    // ---- THE HELD FIREBALL ----
    /* took = what her fireball HANDED hurtEnemy (BK.log): the foe's own rules after it (a talent, the mix-up chain) are not the kit's number */
    const throwAt = (frames, dx = 14) => { home(); const f = foe('topiary', dx, 9999); freeze(f); const h0 = f.hp; P().heat = 0; P().heatGrace = 9;
      K.block = true; for (let k = 0; k < frames; k++) { BK.sim(1); freeze(f); } const step = Kt().fbHold; K.block = false; BK.log = []; BK.sim(1); const balls = Kt().balls.map(b => b.fb);
      for (let k = 0; k < 160 && f.hp === h0; k++) { BK.sim(1); freeze(f); } const q = (BK.log || []).find(q => q.k === 'dmgE' && q.e === f); BK.log = null;
      const r = { frames, step, balls, took: q ? q.dmg : 0, lost: h0 - f.hp, marked: BK.pyroMarked(f), stk: BK.pyStacks(f), burn: +(f.burn || 0).toFixed(1) }; f.alive = false; return r; };
    out.fb = [throwAt(10, 5), throwAt(45, 5), throwAt(100), throwAt(160), throwAt(210), throwAt(260)];   /* (step 1 is the old lobbed ember: short) */
    /* the big one explodes: a second foe a little behind the first burns too */
    { home(); for (const f of BK.fires()) f.life = 0; const a = foe('topiary', 12, 9999), b = foe('topiary', 13, 9999); const fz = () => { freeze(a); freeze(b); b.x = a.x + 14; }; fz(); P().heat = 0; P().heatGrace = 9;   /* (the fires a big one left before are put out: a foe stood in them burns) */
      K.block = true; for (let k = 0; k < 160; k++) { BK.sim(1); fz(); } K.block = false; BK.log = []; for (let k = 0; k < 160; k++) { BK.sim(1); fz(); }
      const lg = BK.log || []; BK.log = null; out.boom = { a: (lg.find(q => q.k === 'dmgE' && q.e === a) || {}).dmg || 0, b: (lg.find(q => q.k === 'dmgE' && q.e === b) || {}).dmg || 0, bMarked: BK.pyroMarked(b) }; a.alive = b.alive = false; }
    /* the slow walk, and a dodge drops it */
    { home(); const x0 = P().x; K.right = true; BK.sim(60); const free = P().x - x0; none(); home(); K.block = true; BK.sim(50); const x1 = P().x; K.right = true; BK.sim(60); const held = P().x - x1; K.right = false;
      BK.press('dodge'); BK.sim(2); const after = { cMode: Kt().cMode, fbHold: Kt().fbHold }; K.block = false; BK.sim(3); out.walk = { free: Math.round(free), held: Math.round(held), after, balls: Kt().balls.length }; none(); }
    // ---- LIVING BOMB ----
    { home(); const f = foe('topiary', 10, 9999); freeze(f); const h0 = f.hp; P().heat = 0; P().heatGrace = 9; const r = {};
      BK.pyStack(f, 1); r.s1 = BK.pyStacks(f); BK.pyStack(f, 1); r.sGap = BK.pyStacks(f); BK.sim(14); freeze(f); BK.pyStack(f, 1); r.s2 = BK.pyStacks(f); BK.sim(14); freeze(f); BK.pyStack(f, 1); r.s3 = BK.pyStacks(f); r.fuse = f.pyFuse !== undefined;
      BK.sim(12); freeze(f); r.burst = h0 - f.hp; r.after = BK.pyStacks(f); BK.pyStack(f, 1); r.noStack = BK.pyStacks(f); BK.sim(130); freeze(f); BK.pyStack(f, 1); r.restack = BK.pyStacks(f); r.heat = Math.round(P().heat); r.tier = BK.lbTier(); f.alive = false; out.lb = r; }
    { home(); const a = foe('topiary', 10, 9999), b = foe('topiary', 12, 9999), c = foe('topiary', 24, 9999); [a, b, c].forEach(freeze); a.x = P().x + 40; b.x = a.x + 30; c.x = a.x + 120; P().heat = 0; P().heatGrace = 9;
      BK.pyStack(b, 2); BK.pyStack(a, 3); BK.sim(8); [a, b, c].forEach(freeze); const t1 = [BK.pyStacks(b), BK.pyStacks(c)]; BK.sim(25); [a, b, c].forEach(freeze);
      out.lbChain = { bAfterA: t1[0], cFar: t1[1], bBurst: 9999 - b.hp > 0, cStacks: BK.pyStacks(c) }; a.alive = b.alive = c.alive = false; }
    { home(); const f = foe('topiary', 10, 9999); freeze(f); f.maxHp = 1000; f.hp = 1000; P().heat = 0; P().heatGrace = 9; const r = { dmg: [], stag: [] };
      for (let n = 0; n < 3; n++) { f.pyNoStk = 0; f.pyGapAt = -99; f.stagger = 0; const h = f.hp; BK.pyStack(f, 3); BK.sim(12); freeze(f); r.dmg.push(h - f.hp); r.stag.push(+(f.stagger || 0).toFixed(2)); }
      r.cap = Math.round(0.03 * 1000); f.alive = false; out.lbBoss = r; }
    /* the STAFF is a pip too (the generic hook in hurtEnemy): three cuts in a run burst a straw man */
    { home(); const f = foe('topiary', 1, 9999); freeze(f); f.x = P().x + 14; P().heat = 0; P().heatGrace = 9; const r = { stk: [], burst: 0 }; const h0 = f.hp;
      for (let n = 0; n < 4; n++) { BK.press('atk'); for (let k = 0; k < 26; k++) { BK.sim(1); freeze(f); f.x = P().x + 14; } r.stk.push(BK.pyStacks(f)); }
      r.burst = h0 - f.hp; f.alive = false; out.lbStaff = r; }
    // ---- METEOR FALL ----
    { home(); const a = foe('topiary', 9, 9999), b = foe('topiary', 11, 9999), c = foe('topiary', 13, 9999); [a, b, c].forEach(freeze); const h0 = [a, b, c].map(f => f.hp); BK.pyStack(b, 2);
      Object.assign(P(), { heat: 100, full: true, fullT: 5, heatGrace: 9 }); K.block = true; BK.sim(1); K.block = false; BK.sim(1); const m = BK.meteorNow(); const w0 = BK.ward().stats.wards;
      let landed = 0; for (let k = 0; k < 90; k++) { BK.sim(1); [a, b, c].forEach(freeze); if (!landed && !BK.meteorNow()) landed = k; }
      BK.sim(30); [a, b, c].forEach(freeze);
      out.meteor = { aimedAt: m ? Math.round(m.x - b.x) : null, landedAt: landed, loss: [a, b, c].map((f, i) => h0[i] - f.hp), heat: Math.round(P().heat), full: P().full, ward: BK.ward().stats.wards - w0, left: BK.meteorNow() };
      [a, b, c].forEach(f => f.alive = false); }
    { home(); Object.assign(P(), { heat: 100, full: true, fullT: 5, heatGrace: 9 }); K.block = true; BK.sim(1); K.block = false; BK.sim(1); const m = BK.meteorNow(); out.meteorNone = { ahead: m ? Math.round(m.x - P().x) : null }; BK.sim(70); }
    // ---- THE CARDS (UP + C) ----
    { home(); P().face = 1; K.up = true; K.block = true; BK.sim(30); out.noCard = { jet: Kt().jet, ward: BK.ward().stats.wards > 0 || BK.ward().stats.folded > 0, fb: Kt().fbHold, cMode: Kt().cMode }; none(); BK.sim(5);
      BK.PROG.pyroBoth = true; home(); K.up = true; K.block = true; BK.sim(30); out.jetCard = { jet: Kt().jet, ward: BK.ward().up, fb: Kt().fbHold }; none(); BK.sim(30);
      BK.sim(250); home(); BK.wardReset(); const n0 = Kt().embers; K.up = true; K.block = true; BK.sim(3); K.block = false; BK.sim(2); out.emberCard = { embers: Kt().embers - n0, ward: BK.ward().stats.wards }; none(); BK.PROG.pyroBoth = false; }
    // ---- THE PLAIN DODGE ----
    { home(); const f = foe('topiary', 4, 9999); freeze(f); const h0 = f.hp; P().heat = 50; P().heatGrace = 9; BK.press('dodge'); BK.sim(25); freeze(f);
      BK.press('jump'); K.jump = true; BK.sim(8); BK.press('dodge'); BK.sim(25); K.jump = false; BK.sim(30);
      out.dodge = { took: h0 - f.hp, heat: Math.round(P().heat), alight: P().alight || 0 }; f.alive = false; }
    return out;
  })()`, 900000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }

if (R.err) bad.push(R.err);
else {
  for (const [k, v] of Object.entries(R)) console.log(k, JSON.stringify(v));
  const S = R.stoke, K = 14;
  if (!(S.heat2s >= K * 1.6 && S.heat2s <= K * 2.1)) bad.push(`2 s of stoke gave ${S.heat2s} heat (want ~${K * 1.85})`);
  if (S.walkHeat > 3) bad.push('down + a way still stoked: ' + S.walkHeat);
  if (S.afterHit > 1) bad.push('a hit did not break the stoke: +' + S.afterHit + ' heat in the 0.4 s after');
  if (!S.full) bad.push('stoke never filled the bar');
  if (S.stokeInWard > 0) bad.push('stoke ran while the ward was up');
  const [f0, f1, f2, f3, f4, f5] = R.fb, sw = R.sw;
  if (f0.step !== 0 || f0.balls.length) bad.push('a 0.1 s tap threw a fireball: ' + JSON.stringify(f0));
  for (const [f, st, k] of [[f1, 1, 0.9], [f2, 2, 1.6], [f3, 3, 2.4], [f4, 4, 3.3], [f5, 5, 4.6]]) {
    if (f.step !== st || !f.balls.includes(st)) bad.push(`C held ${f.frames} frames was step ${f.step}, threw ${f.balls} (want ${st})`);
    const want = Math.max(1, Math.round(sw * k));   /* heat 0 at the throw: x1 (the hit itself gains heat after) */
    if (!(f.took >= want - 1 && f.took <= want + 2)) bad.push(`step ${st} hit for ${f.took} (want ~swordDmg ${sw} x ${k} = ${want})`);
    if (!f.marked) bad.push(`step ${st} left no burn mark`); }
  /* the big one, per second of the hold at a full bar, against the staff's light chain (swordDmg every ~0.38 s) */
  if (!((2.4 * 1.4) / 1.5 < 1 / 0.38 && (3.3 * 1.4) / 2.0 < 1 / 0.38 && (4.6 * 1.4) / 2.5 < 1 / 0.38)) bad.push('the big step out-damages the staff per second');
  if (!(R.boom.b > 0 && R.boom.b < R.boom.a && R.boom.bMarked)) bad.push('the big one did not explode onto its neighbour: ' + JSON.stringify(R.boom));
  if (!(R.walk.held > 0 && R.walk.held < R.walk.free * 0.65)) bad.push(`with a ball on the staff she walked ${R.walk.held} px against ${R.walk.free} free (want ~half)`);
  if (R.walk.after.cMode || R.walk.after.fbHold || R.walk.balls) bad.push('a dodge did not drop the held ball: ' + JSON.stringify(R.walk));
  for (const f of R.fb) if (f.step >= 1 && f.stk !== (f.step >= 3 ? 2 : 1)) bad.push(`step ${f.step} left ${f.stk} pips (want ${f.step >= 3 ? 2 : 1})`);
  const B = R.lb, want = sw * 1.2;
  if (B.s1 !== 1 || B.sGap !== 1 || B.s2 !== 2 || B.s3 !== 3 || !B.fuse) bad.push('the pips did not count 1,(gap),2,3 + fuse: ' + JSON.stringify(B));
  if (!(B.burst >= want * 0.9 && B.burst <= want * 2.4)) bad.push(`the burst took ${B.burst} (want ~swordDmg ${sw} x 1.2 = ${Math.round(want)})`);
  if (B.after !== 0 || B.noStack !== 0 || B.restack !== 1) bad.push('a foe that burst built pips inside 2 s (or never again): ' + JSON.stringify(B));
  if (B.heat > 12) bad.push('the burst refilled the bar: ' + B.heat);
  if (!(R.lbStaff.stk[0] >= 1 && R.lbStaff.stk.some(s => s >= 2))) bad.push('a staff cut did not leave pips: ' + JSON.stringify(R.lbStaff));
  const Ch = R.lbChain;
  if (!Ch.bBurst || Ch.cFar !== 0) bad.push('the burst did not chain to a neighbour with 2 pips (or reached a far foe): ' + JSON.stringify(Ch));
  const Bo = R.lbBoss;
  if (Bo.dmg.some(d => d <= 0 || d > Bo.cap)) bad.push('a boss burst broke its cap ' + Bo.cap + ': ' + JSON.stringify(Bo));
  if (!(Bo.stag[0] < 0.3 && Bo.stag[1] < 0.3 && Bo.stag[2] > 0.3)) bad.push('only every 3rd boss burst should stagger: ' + JSON.stringify(Bo));
  const Mt = R.meteor;
  if (Mt.aimedAt === null || Math.abs(Mt.aimedAt) > 8) bad.push('METEOR FALL did not aim at the most-pipped foe: ' + JSON.stringify(Mt));
  if (!(Mt.landedAt > 45 && Mt.landedAt < 70)) bad.push('the meteor did not land after its ~0.9 s tell: ' + JSON.stringify(Mt));
  if (Mt.loss.some(l => l < sw * 3)) bad.push('a foe in the blast took less than swordDmg x 3: ' + JSON.stringify(Mt));
  if (Mt.full || Mt.heat > 15 || Mt.ward > 0 || Mt.left) bad.push('METEOR FALL left the bar full / refilled it / raised a ward: ' + JSON.stringify(Mt));
  if (R.meteorNone.ahead === null || R.meteorNone.ahead < 60 || R.meteorNone.ahead > 120) bad.push('with nothing in front the meteor should land ~90 px ahead: ' + JSON.stringify(R.meteorNone));
  if (R.noCard.jet || R.noCard.cMode === 'card') bad.push('UP + C lit the jet with no card: ' + JSON.stringify(R.noCard));
  if (!R.jetCard.jet || R.jetCard.ward || R.jetCard.fb) bad.push('UP + hold C with THE JET did not pour the jet (or raised a ward/ball): ' + JSON.stringify(R.jetCard));
  if (!(R.emberCard.embers >= 1) || R.emberCard.ward > 0) bad.push('UP + tap C with THE EMBER SHOT threw no ember (or raised a ward): ' + JSON.stringify(R.emberCard));
  if (R.dodge.took > 0 || R.dodge.heat < 50 || R.dodge.alight > 0) bad.push('her dodge burned a foe or cost heat: ' + JSON.stringify(R.dodge));
}
assert.deepEqual(bad, [], 'the pyro kit:\n  ' + bad.join('\n  '));
console.log('the pyro kit holds: the L10 jet/ember-shot card (old saves keep both), stoke on a still crouch, the three-step held fireball (scaled, marked, the big one explodes, a slow walk, a dodge drops it), living bomb (pips, burst, chain, boss cap) and meteor fall, the cards on UP + C only, a plain dodge');
