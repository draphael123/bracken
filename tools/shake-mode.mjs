// tools/shake-mode.mjs - SCREEN SHAKE MODE (claude/shake, 2026-10-01). Daniel: the camera shook on every landing. The default is now ON HIT: the
// camera shakes ONLY when the hero is hurt (a blow taken, going down in co-op, dying). FULL is the old behaviour, OFF and reduce-motion are none.
//   - static: exactly three shakeCam call sites carry the 'hurt' tag (hurt line, goDown, die); every other call in src/ is untagged, so ON HIT silences it
//   - page, ON HIT: a hard landing, a plunge, a landed blow on a foe, a boss-sized slam (untagged shakeCam) all leave BK.shake at 0; damagePlayer shakes
//   - page, FULL: the same events shake, at the strength setting; LOW halves it; OFF and reduce-motion: nothing at all, not even a hurt
//   - old saves: no shakeMode -> ON HIT, unless shake was OFF (shake false / shakeAmt 0) -> OFF; the strength survives
//   node tools/shake-mode.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const bad = [];
const must = (c, m) => { if (!c) bad.push(m); };
const dir = new URL('../src/', import.meta.url);
let tagged = 0;
for (const f of readdirSync(dir)) { if (!f.endsWith('.js')) continue; const s = readFileSync(new URL(f, dir), 'utf8'); tagged += (s.match(/shakeCam\([^;\n)]*'hurt'\)/g) || []).length; }
must(tagged === 3, `${tagged} shakeCam calls carry the 'hurt' tag (want 3: the hero hurt, down, dead)`);
const m = readFileSync(new URL('main.js', dir), 'utf8');
must(/function shakeCam\([^)]*tag[^)]*\)\s*\{[^\n]*'hurt'[^\n]*shakeAdd\(/.test(m), 'shakeCam does not gate on the hurt tag');

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
    BK.SET.reduceMotion = false; BK.god = false; BK.SET.shake = true; BK.SET.shakeAmt = 1;
    const out = {};
    const quiet = () => { for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.P.hp = BK.P.maxHp; BK.sim(150); };
    const peak = fn => { quiet(); fn(); let mx = BK.shake; for (let i = 0; i < 20; i++) { BK.sim(1); mx = Math.max(mx, BK.shake); } return mx; };
    const events = {
      land: () => { BK.P.y -= 10; BK.P.ground = false; BK.P.vy = 430; BK.sim(3); },
      plunge: () => { BK.P.y -= 10; BK.P.ground = false; BK.P.plunge = true; BK.P.vy = 430; BK.sim(3); },
      foehit: () => { const f = BK.spawnFoe({ t: 'brute', x: spot[0] + 1, y: spot[1], face: -1 })[0]; f.hp = f.maxHpx = 9999; BK.sim(2); BK.P.hp = BK.P.maxHp; BK.combat2().strike(f, 'heavy', 20); },
      slam: () => BK.shakeCam(10, 4),
      hurt: () => BK.damagePlayer(spot[0] * 16 - 30, 10, { unblockable: true }),
    };
    const run = () => { const o = {}; for (const k in events) o[k] = peak(events[k]); return o; };
    BK.SET.shakeMode = 'hit'; out.hit = run();
    BK.SET.shakeMode = 'full'; out.full = run();
    BK.SET.shakeAmt = 0.5; out.low = run(); BK.SET.shakeAmt = 1;
    BK.SET.shakeMode = 'off'; out.off = run();
    BK.SET.shakeMode = 'hit'; BK.SET.reduceMotion = true; out.reduce = run(); BK.SET.reduceMotion = false;
    /* the old saves */
    const ui = BK.ui, keep = JSON.stringify(ui.settings());
    const mig = o => { ui.readSettings(JSON.stringify(o)); const S = ui.settings(); return [S.shakeMode, S.shakeAmt, S.shake]; };
    out.migOn = mig({ shake: true, shakeAmt: 1 }); out.migLow = mig({ shake: true, shakeAmt: 0.5 }); out.migOff = mig({ shake: false, shakeAmt: 0 });
    out.migOff2 = mig({ shake: false }); out.migBare = mig({}); out.migKeep = mig({ shakeMode: 'full', shakeAmt: 1, shake: true });
    return out;
  })()`, 300000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
console.log(JSON.stringify(r));
if (r.err) bad.push(r.err);
else {
  for (const k of ['land', 'plunge', 'foehit', 'slam']) must(r.hit[k] === 0, `ON HIT: ${k} shook the camera (${r.hit[k]})`);
  must(r.hit.hurt > 0, 'ON HIT: taking damage did not shake the camera');
  for (const k of ['land', 'plunge', 'foehit', 'slam', 'hurt']) must(r.full[k] > 0, `FULL: ${k} did not shake (${r.full[k]})`);
  must(r.full.slam === 10 && r.low.slam === 5, `FULL strength: a 10 shake is ${r.full.slam} at full and ${r.low.slam} at LOW (want 10 / 5)`);
  must(r.full.hurt === r.hit.hurt, `FULL and ON HIT disagree about a hurt (${r.full.hurt} vs ${r.hit.hurt})`);
  for (const k in r.off) must(r.off[k] === 0, `OFF: ${k} shook (${r.off[k]})`);
  for (const k in r.reduce) must(r.reduce[k] === 0, `reduce-motion: ${k} shook (${r.reduce[k]})`);
  must(JSON.stringify(r.migOn) === '["hit",1,true]', 'old save shake on -> ' + JSON.stringify(r.migOn) + ' (want ON HIT)');
  must(JSON.stringify(r.migLow) === '["hit",0.5,true]', 'old save LOW -> ' + JSON.stringify(r.migLow) + ' (want ON HIT, strength 0.5 kept)');
  must(r.migOff[0] === 'off' && r.migOff[2] === false && r.migOff[1] > 0, 'old save shake OFF -> ' + JSON.stringify(r.migOff) + ' (want OFF)');
  must(r.migOff2[0] === 'off', 'old save {shake:false} -> ' + JSON.stringify(r.migOff2) + ' (want OFF)');
  must(r.migBare[0] === 'hit', 'a save with no shake fields -> ' + JSON.stringify(r.migBare) + ' (want ON HIT)');
  must(r.migKeep[0] === 'full', 'a save that chose FULL was changed to ' + r.migKeep[0]);
}
assert.deepEqual(bad, [], 'shake-mode:\n  ' + bad.join('\n  '));
console.log('Shake mode: ON HIT shakes only when the hero is hurt; FULL keeps every shake; OFF and reduce-motion none; old saves land on ON HIT (OFF stays OFF).');
