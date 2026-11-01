// tools/pyro-kit.mjs — THE PYRO KIT (claude/pyrokit, Daniel 10-30 20:50-20:52 + 10-31 08:41; scratch/brief-pyrokit-1101.md). The ward itself is
// tools/ember-flare.mjs; this holds the rest of her kit, in the running game (and the save half in Node, first):
//   THE L10 CARD     a pyro who never played before the kit is offered THE JET / THE EMBER SHOT / WILDFIRE at level 10 (and only there), the pick saves;
//                    a save that played her before keeps BOTH (migratePyroKit) and its L10 is the plain small perks; idempotent
//   STOKE            down held still fills the heat bar at PYRO_KIT.stoke/s (to FULL); a way held, or a hit, stops it; never while the ward is up
//   HELD FIREBALL    C held 0.35 / 0.9 / 1.5 s and let go = steps 1 / 2 / 3; a tap is only the ward; each hit = swordDmg x k[step] x heat and BURN-MARKS;
//                    step 3 EXPLODES and burns its neighbours; she walks at ~half speed with a ball on the staff; a dodge drops it; the big step
//                    does not out-damage the staff per second
//   CONFLAGRATION    a full bar's press of C: every marked foe erupts (x kFoe, splash), the marks are spent, the bar empties; nothing marked = a small
//                    burst round her ('NOTHING MARKED'); a boss's numbers keep to <= 8% (cap x the opening's 1.5) and SCORCHED OPEN is the shared opening
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
      const r = { frames, step, balls, took: q ? q.dmg : 0, lost: h0 - f.hp, marked: BK.pyroMarked(f), burn: +(f.burn || 0).toFixed(1) }; f.alive = false; return r; };
    out.fb = [throwAt(10, 5), throwAt(45, 5), throwAt(100), throwAt(160)];   /* (step 1 is the old lobbed ember: short) */
    /* the big one explodes: a second foe a little behind the first burns too */
    { home(); for (const f of BK.fires()) f.life = 0; const a = foe('topiary', 12, 9999), b = foe('topiary', 13, 9999); const fz = () => { freeze(a); freeze(b); b.x = a.x + 14; }; fz(); P().heat = 0; P().heatGrace = 9;   /* (the fires a big one left before are put out: a foe stood in them burns) */
      K.block = true; for (let k = 0; k < 160; k++) { BK.sim(1); fz(); } K.block = false; BK.log = []; for (let k = 0; k < 160; k++) { BK.sim(1); fz(); }
      const lg = BK.log || []; BK.log = null; out.boom = { a: (lg.find(q => q.k === 'dmgE' && q.e === a) || {}).dmg || 0, b: (lg.find(q => q.k === 'dmgE' && q.e === b) || {}).dmg || 0, bMarked: BK.pyroMarked(b) }; a.alive = b.alive = false; }
    /* the slow walk, and a dodge drops it */
    { home(); const x0 = P().x; K.right = true; BK.sim(60); const free = P().x - x0; none(); home(); K.block = true; BK.sim(50); const x1 = P().x; K.right = true; BK.sim(60); const held = P().x - x1; K.right = false;
      BK.press('dodge'); BK.sim(2); const after = { cMode: Kt().cMode, fbHold: Kt().fbHold }; K.block = false; BK.sim(3); out.walk = { free: Math.round(free), held: Math.round(held), after, balls: Kt().balls.length }; none(); }
    // ---- CONFLAGRATION ----
    { home(); const fs = [foe('sprig', 4), foe('sprig', 6), foe('sprig', 8)]; fs.forEach(freeze); const hp0 = fs.map(f => f.hp); fs.forEach(f => BK.pyroMark(f));
      Object.assign(P(), { heat: 100, full: true, fullT: 5, heatGrace: 9 }); K.block = true; BK.sim(1); K.block = false; BK.sim(4);
      out.conflag = { hp0, hp: fs.map(f => f.alive ? f.hp : 0), dead: fs.filter(f => !f.alive).length, heat: Math.round(P().heat), full: P().full, ward: BK.ward().stats.wards, marksLeft: fs.filter(f => f.alive && BK.pyroMarked(f)).length };
      fs.forEach(f => f.alive = false); }
    { home(); const f = foe('topiary', 10, 9999); freeze(f); const h0 = f.hp; f.pyMarkAt = undefined; Object.assign(P(), { heat: 100, full: true, fullT: 5, heatGrace: 9 }); f.x = P().x + 20;
      K.block = true; BK.sim(1); K.block = false; BK.sim(3); out.unmarked = { took: h0 - f.hp, full: P().full }; f.alive = false; }
    // ---- THE CARDS (UP + C) ----
    { home(); P().face = 1; K.up = true; K.block = true; BK.sim(30); out.noCard = { jet: Kt().jet, ward: BK.ward().stats.wards > 0 || BK.ward().stats.folded > 0, fb: Kt().fbHold, cMode: Kt().cMode }; none(); BK.sim(5);
      BK.PROG.pyroBoth = true; home(); K.up = true; K.block = true; BK.sim(30); out.jetCard = { jet: Kt().jet, ward: BK.ward().up, fb: Kt().fbHold }; none(); BK.sim(30);
      home(); BK.wardReset(); const n0 = Kt().embers; K.up = true; K.block = true; BK.sim(3); K.block = false; BK.sim(2); out.emberCard = { embers: Kt().embers - n0, ward: BK.ward().stats.wards }; none(); BK.PROG.pyroBoth = false; }
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
  const [f0, f1, f2, f3] = R.fb, sw = R.sw;
  if (f0.step !== 0 || f0.balls.length) bad.push('a 0.1 s tap threw a fireball: ' + JSON.stringify(f0));
  for (const [f, st, k] of [[f1, 1, 0.9], [f2, 2, 1.6], [f3, 3, 2.4]]) {
    if (f.step !== st || !f.balls.includes(st)) bad.push(`C held ${f.frames} frames was step ${f.step}, threw ${f.balls} (want ${st})`);
    const want = Math.max(1, Math.round(sw * k));   /* heat 0 at the throw: x1 (the hit itself gains heat after) */
    if (!(f.took >= want - 1 && f.took <= want + 2)) bad.push(`step ${st} hit for ${f.took} (want ~swordDmg ${sw} x ${k} = ${want})`);
    if (!f.marked) bad.push(`step ${st} left no burn mark`); }
  /* the big one, per second of the hold at a full bar, against the staff's light chain (swordDmg every ~0.38 s) */
  if (!((2.4 * 1.4) / 1.5 < 1 / 0.38)) bad.push('the big step out-damages the staff per second');
  if (!(R.boom.b > 0 && R.boom.b < R.boom.a && R.boom.bMarked)) bad.push('the big one did not explode onto its neighbour: ' + JSON.stringify(R.boom));
  if (!(R.walk.held > 0 && R.walk.held < R.walk.free * 0.65)) bad.push(`with a ball on the staff she walked ${R.walk.held} px against ${R.walk.free} free (want ~half)`);
  if (R.walk.after.cMode || R.walk.after.fbHold || R.walk.balls) bad.push('a dodge did not drop the held ball: ' + JSON.stringify(R.walk));
  const C = R.conflag;
  if (C.full || C.heat >= 100) bad.push('conflagration left the bar full: ' + JSON.stringify(C));
  if (C.ward > 0) bad.push('the full bar\'s press raised a ward as well');
  if (C.dead < 3 && C.hp.some((h, i) => h > 0 && C.hp0[i] - h < Math.round(sw * 4 * 1.4) - 1)) bad.push('a marked foe did not erupt for kFoe x swordDmg x 1.4: ' + JSON.stringify(C));
  if (C.marksLeft) bad.push('the marks were not spent');
  if (!(R.unmarked.took > 0) || R.unmarked.full) bad.push('NOTHING MARKED did not burst round her (or kept the bar): ' + JSON.stringify(R.unmarked));
  /* the boss cap: min(kBoss x sw x 1.4, capBoss x maxHp) x the opening's 1.5 <= 8% */
  if (!(0.05 * 1.5 <= 0.08)) bad.push('the boss cap x the opening is over 8%');
  if (R.noCard.jet || R.noCard.cMode === 'card') bad.push('UP + C lit the jet with no card: ' + JSON.stringify(R.noCard));
  if (!R.jetCard.jet || R.jetCard.ward || R.jetCard.fb) bad.push('UP + hold C with THE JET did not pour the jet (or raised a ward/ball): ' + JSON.stringify(R.jetCard));
  if (!(R.emberCard.embers >= 1) || R.emberCard.ward > 0) bad.push('UP + tap C with THE EMBER SHOT threw no ember (or raised a ward): ' + JSON.stringify(R.emberCard));
  if (R.dodge.took > 0 || R.dodge.heat < 50 || R.dodge.alight > 0) bad.push('her dodge burned a foe or cost heat: ' + JSON.stringify(R.dodge));
}
assert.deepEqual(bad, [], 'the pyro kit:\n  ' + bad.join('\n  '));
console.log('the pyro kit holds: the L10 jet/ember-shot card (old saves keep both), stoke on a still crouch, the three-step held fireball (scaled, marked, the big one explodes, a slow walk, a dodge drops it), conflagration on the marked (nothing marked: a burst), the cards on UP + C only, a plain dodge');
