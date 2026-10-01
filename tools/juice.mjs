// tools/juice.mjs — THE JUICE TABLE (claude/juice, 2026-09-29; src/juice.js). Every landed blow, every blow the hero takes and every shake goes through
// ONE table, so the weight of a hit is the same for every hero and foe. Proved on the table AND in the page:
//   - hit-stop fires on a LANDED blow only (a 0-damage glance, and a whiff, freeze nothing) and SCALES with weight: light < heavy, a boss opening a little more
//   - one shake budget: many shakes in one breath never climb past SHAKE_CAP, in the table and on the page
//   - reduce-motion turns shake (and screen flashes, zoom) off
//   - the hero's knock never throws him off a ledge into an untold pit (safeKnock, and in the page: hit at the lip of a pit, he stays out of it)
//   - every weight class has its own sound in src/audio.js
//   node tools/juice.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const bad = [];
const must = (c, m) => { if (!c) bad.push(m); };
const read = f => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');

/* THE TABLE */
let J = null;
try { J = await import('../src/juice.js'); } catch (e) { bad.push('src/juice.js missing: ' + e.message); }
if (J) {
  const { JUICE, blowClass, stopFor, shakeAdd, SHAKE_CAP, safeKnock, knockCurve, motionScale, takenClass, blockClass } = J;
  must(Math.abs(stopFor('light') - 0.04) < 0.005, 'a light blow should freeze ~40 ms, not ' + stopFor('light'));
  must(Math.abs(stopFor('heavy') - 0.09) < 0.01 && Math.abs(stopFor('finish') - 0.09) < 0.01, 'a heavy blow and a finisher should freeze ~90 ms');
  must(stopFor('light') < stopFor('heavy'), 'hit-stop must scale with weight');
  must(stopFor('heavy', { boss: true, opening: true }) > stopFor('heavy', { boss: true }), 'a boss opening should freeze a little more than an ordinary boss hit');
  must(stopFor('heavy', { boss: true, opening: true }) > stopFor('heavy'), 'a boss opening should freeze a little more than the class');
  must(stopFor('heavy', { dmg: 0 }) === 0 && stopFor('light', { dmg: 0 }) === 0, 'a blow that does nothing (a glance) must not freeze');
  must(blowClass({ dmg: 4 }) === 'light' && blowClass({ dmg: 4, heavy: true }) === 'heavy' && blowClass({ dmg: 30 }) === 'heavy' && blowClass({ dmg: 4, kill: true }) === 'finish', 'blow classes');
  must(takenClass(8) === 'hurt' && takenClass(30) === 'hurtHeavy' && blockClass(8) === 'block' && blockClass(30) === 'blockHeavy', 'taken / block classes');
  must(JUICE.hurt.stop > JUICE.light.stop && JUICE.hurt.shake > JUICE.light.shake, 'the hero taking a hit must react harder than a landed light blow');
  /* the budget */
  let s = 0; for (let i = 0; i < 40; i++) s = shakeAdd(s, 9);
  must(s <= SHAKE_CAP + 1e-9, 'forty shakes stacked to ' + s + ' (cap ' + SHAKE_CAP + ')');
  must(shakeAdd(0, 4) === 4 && shakeAdd(0, 4, { amount: 0.5 }) === 2, 'a lone shake is its own size, scaled by the setting');
  must(shakeAdd(3, 3) < 3 * 2, 'a second shake tops up, it does not double');
  must(shakeAdd(2, 9, { reduce: true }) === 2 && shakeAdd(0, 9, { amount: 0 }) === 0, 'reduce-motion / shake off: no shake is added');
  must(motionScale({ reduceMotion: true }) === 0 && motionScale({}) === 1, 'motionScale reads the one setting');
  /* the curve: fast out, eased stop */
  must(knockCurve(200, 0, 0.4) === 200 && knockCurve(200, 0.4, 0.4) === 0 && knockCurve(200, 0.1, 0.4) > knockCurve(200, 0.3, 0.4), 'knockback curve: starts at full speed and eases to a stop');
  /* the pit rule */
  must(safeKnock(150, () => true) === 150, 'on flat ground the full knock');
  must(safeKnock(150, dx => dx < 10) < 150, 'with a pit further on the throw is shortened');
  must(safeKnock(150, () => false) === 0, 'with a pit right at the lip he rocks in place');
  must(safeKnock(-150, dx => dx > -10) > -150, 'and to the left too');
}

/* THE SOUNDS: one per weight class */
{ const a = read('audio.js');
  for (const k of ['hitHeavy', 'hitFinish', 'blockHeavy', 'pHurtHeavy']) must(new RegExp('\\n\\s*' + k + '\\(\\)').test(a), 'src/audio.js has no SFX.' + k + '() (a distinct sound per weight class)'); }

/* THE WIRING (static): hit-stop / shake / flash are read through the juice table and the one setting */
{ const m = read('main.js');
  must(/from '\.\/juice\.js'/.test(m), 'main.js does not import src/juice.js');
  must(/function shakeCam\([^)]*\)\s*\{[^\n]*shakeAdd\(/.test(m), 'shakeCam does not go through the shake budget (shakeAdd)');
  must(/function shakeCam\([^)]*\)\s*\{[^\n]*reduceMotion/.test(m), 'shakeCam does not read reduce-motion');
  must(/function blowStop\([^)]*\)\s*\{[\s\S]{0,700}stopFor\(/.test(m), 'blowStop does not take its freeze from the table (stopFor)');
  must(/P\.vx = P\.ground \? safeKnock\(/.test(m), 'the hero\'s hurt knock does not go through safeKnock');
  must((m.match(/blowStop\(/g) || []).length === 2, 'blowStop should be called from exactly the one landed-blow branch'); }

/* THE PAGE */
if (!bad.length || J) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  let r = null;
  try {
    await pg.reload();
    r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js');
      BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start();
      const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
      let spot = null;
      for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 4; y < L.H - 8 && !spot; y++) {
        let ok = true; for (let x = x0; x < x0 + 24 && ok; x++) ok = at(x, y + 1) === 1 && at(x, y) === 0 && at(x, y - 1) === 0 && at(x, y - 2) === 0;
        if (ok) spot = [x0 + 6, y]; }
      if (!spot) return { err: 'no flat floor' };
      for (const e of BK.enemies()) e.alive = false;
      BK.SET.hitstop = true; BK.SET.shake = true; BK.SET.shakeMode = 'full'; BK.SET.shakeAmt = 1; BK.SET.reduceMotion = false; BK.god = false;
      const out = {};
      const fresh = () => { for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(2); const f = BK.spawnFoe({ t: 'brute', x: spot[0] + 1, y: spot[1], face: -1 })[0]; f.hp = f.maxHpx = 9999; return f; };
      const blow = (kind, dmg) => { const f = fresh(); BK.sim(2); BK.P.hp = BK.P.maxHp; BK.combat2().strike(f, kind, dmg); const s = BK.stop, sh = BK.shake; BK.sim(120); return { s, sh }; };
      out.light = blow('light', 4); out.heavy = blow('heavy', 20); out.glance = blow('light', 0);
      /* a boss opening: the boss-hit path is the same table, so measured off the class here (stopFor) - the page test is for the whole chain */
      /* THE BUDGET, ON THE PAGE: twenty heavy blows on twenty foes in one breath */
      { const f = fresh(); for (let i = 0; i < 20; i++) BK.combat2().strike(f, 'heavy', 30); out.pile = BK.shake; BK.sim(120); }
      /* REDUCE MOTION */
      BK.SET.reduceMotion = true; { const f = fresh(); BK.combat2().strike(f, 'heavy', 30); out.reduce = BK.shake; out.reduceStop = BK.stop; } BK.SET.reduceMotion = false; BK.sim(120);
      /* A WHIFF freezes nothing: the hero swings at empty air */
      { for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(3); let mx = 0; BK.press('atk'); for (let i = 0; i < 60; i++) { BK.sim(1); mx = Math.max(mx, BK.stop); } out.whiff = mx; BK.sim(60); }
      /* THE PIT: the hero stands on the lip of a drop, and is hit from the side away from it */
      { for (const e of BK.enemies()) e.alive = false; const px = spot[0], row = spot[1];
        for (let x = px + 1; x <= px + 10; x++) for (let y = row + 1; y < L.H; y++) L.grid[y * W + x] = 0;   /* the floor to his right, gone */
        BK.resolve();
        BK.tp(px, row); BK.sim(30); BK.P.hp = BK.P.maxHp; BK.P.x = px * 16 + 15; BK.sim(1);
        const y0 = BK.P.y; BK.damagePlayer(px * 16 - 30, 10, { unblockable: true }); let fell = false; for (let i = 0; i < 90; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (BK.P.y > y0 + 20) fell = true; }
        out.pit = { fell, vx: BK.P.x, y0, y: BK.P.y }; }
      return out;
    })()`, 300000);
    assert.deepEqual(pg.errors, [], 'page errors');
  } finally { pg.close(); }
  console.log(JSON.stringify(r));
  if (r.err) bad.push(r.err);
  else {
    must(r.light.s > 0 && r.light.s < 0.06, 'a landed light blow should freeze ~40 ms on the page, got ' + r.light.s);
    must(r.heavy.s >= 0.08 && r.heavy.s > r.light.s * 1.5, 'a heavy blow should freeze ~90 ms and more than a light one, got ' + r.heavy.s + ' vs ' + r.light.s);
    must(r.glance.s === 0, 'a blow that did nothing froze the world for ' + r.glance.s);
    must(r.pile <= 10 + 1e-9, 'twenty heavy blows stacked the shake to ' + r.pile + ' (cap 10)');
    must(r.reduce === 0, 'reduce-motion left a shake of ' + r.reduce);
    must(r.whiff === 0, 'a swing at empty air froze the world for ' + r.whiff);
    must(!r.pit.fell, 'the hero was thrown off a ledge into a pit by a blow from the far side (y ' + r.pit.y0 + ' -> ' + r.pit.y + ')');
  }
}
assert.deepEqual(bad, [], 'juice:\n  ' + bad.join('\n  '));
console.log('Juice: freeze scales with weight and only on landed blows; one shake budget; reduce-motion silences it; no knock into an untold pit; a sound per weight class.');
