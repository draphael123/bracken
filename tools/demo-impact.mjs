// tools/demo-impact.mjs - THE DEMO IMPACT PASS (claude/demoimpact, Daniel 2026-11-02; src/juice.js landShake / landRumble / parryStop, main.js blowKind(tag))
//   - a skill's hurtAs('heavy'|'dash') lands as the HEAVY class (90 ms) whatever the damage; 'shot' / 'light' stay 40 ms (hitstop never stacks: it is a max)
//   - a landed heavy / finish blow gives a small shake in ON HIT (JUICE.landShake of the row), none when light; OFF and reduce-motion none
//   - a landed heavy blow buzzes the pad (JUICE.landRumble), a light one does not; the Rumble setting turns it off
//   - the Warden's on-the-beat deflect holds the mid pack's freeze (JUICE.parryStop); the Blood Knight's 200 ms reference parry is untouched
//   node tools/demo-impact.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const bad = [], must = (c, m) => { if (!c) bad.push(m); };
const { JUICE, HEAVY_TAGS, stopFor, JUICE2_SHIPS: ON, landShakeShare } = await import('../src/juice.js');
const LS = ON ? 0.065 : 0.04, HS = ON ? 0.11 : 0.09;   /* JUICE2 ships ON (11-10): light 65 / heavy 110 ms; OFF = the old 40 / 90 */
must(JUICE.parryStop >= 0.08 && JUICE.parryStop <= 0.1, 'parryStop should sit in the mid pack (80-100 ms): ' + JUICE.parryStop);
must(JUICE.landRumble.heavy.ms <= 90 && JUICE.landRumble.heavy.mag <= 0.4 && JUICE.landRumble.finish.ms <= 90 && JUICE.landRumble.finish.mag <= 0.4 && !JUICE.landRumble.light, 'landed-blow rumble is short and weak, none on light');
must(HEAVY_TAGS.includes('heavy') && HEAVY_TAGS.includes('dash') && !HEAVY_TAGS.includes('shot'), 'HEAVY_TAGS');
const m = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
must(/hitstop\(beat \? JUICE\.parryStop/.test(m), 'Warden deflect no longer reads JUICE.parryStop');
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
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 12; y < L.H - 8 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 24 && ok; x++) ok = at(x, y + 1) === 1 && at(x, y) === 0 && at(x, y - 1) === 0 && at(x, y - 2) === 0 && at(x, y - 3) === 0;
      if (ok) spot = [x0 + 6, y]; }
    if (!spot) return { err: 'no flat floor' };
    BK.SET.reduceMotion = false; BK.god = false; BK.SET.shake = true; BK.SET.shakeAmt = 1; BK.SET.hitstop = true; BK.SET.rumble = true; BK.SET.shakeMode = 'hit';
    const buzz = []; navigator.getGamepads = () => [{ vibrationActuator: { playEffect: (t, o) => buzz.push(o) } }];
    const quiet = () => { for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.P.hp = BK.P.maxHp; BK.sim(150); };
    const one = (blow, dmg) => { quiet(); buzz.length = 0; const f = BK.spawnFoe({ t: 'brute', x: spot[0] + 1, y: spot[1], face: -1 })[0]; f.hp = f.maxHpx = 9999; BK.sim(2); BK.P.hp = BK.P.maxHp; BK.P.heavy = false; BK.P.combo = 0; BK.P.dash = 0; BK.P.dashAtk = 0;
      const sh0 = BK.shake; BK.combat2().strike(f, blow, dmg); let mx = BK.stop; return { stop: mx, shake: BK.shake, buzz: buzz.length, ms: buzz[0] && buzz[0].duration, mag: buzz[0] && buzz[0].strongMagnitude }; };
    const out = {};
    for (const [k, b, d] of [['light', 'light', 4], ['shot', 'shot', 4], ['heavy', 'heavy', 4], ['dash', 'dash', 4]]) out[k] = one(b, d);
    BK.SET.rumble = false; out.heavyNoRumble = one('heavy', 4); BK.SET.rumble = true;
    BK.SET.reduceMotion = true; out.heavyReduce = one('heavy', 4); BK.SET.reduceMotion = false;
    BK.SET.shakeMode = 'off'; out.heavyOff = one('heavy', 4); BK.SET.shakeMode = 'hit';
    return out;
  })()`, 300000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
console.log(JSON.stringify(r));
if (r.err) bad.push(r.err); else {
  must(Math.abs(r.light.stop - LS) < 0.005 && r.light.shake === 0 && r.light.buzz === 0, 'light: ' + LS * 1000 + ' ms, no shake, no rumble: ' + JSON.stringify(r.light));
  must(Math.abs(r.shot.stop - LS) < 0.005 && r.shot.buzz === 0, "'shot' stays light: " + JSON.stringify(r.shot));
  for (const k of ['heavy', 'dash']) must(Math.abs(r[k].stop - HS) < 0.005 && r[k].shake > 0 && r[k].shake <= JUICE.heavy.shake * landShakeShare() + 0.01 && r[k].buzz === 1 && r[k].ms === JUICE.landRumble.heavy.ms, k + ' tag: ' + HS * 1000 + ' ms, small shake, one buzz: ' + JSON.stringify(r[k]));
  must(r.heavyNoRumble.buzz === 0, 'Rumble OFF still buzzed');
  must(r.heavyReduce.shake === 0 && r.heavyOff.shake === 0, 'reduce-motion / shake OFF still shook');
}
assert.deepEqual(bad.filter(Boolean), [], 'demo-impact:\n  ' + bad.join('\n  '));
console.log('Demo impact: heavy/dash tags freeze 90 ms, shot/light 40; heavy lands shake small + buzz (none light); reduce-motion / OFF / Rumble OFF silent; Warden beat parry at the mid-pack stop.');
