// tools/warden-id.mjs - THE WARDEN'S IDENTITY PASS, static (claude/wardenid; no browser): handicap rows gone, the reach-band and long-thrust numbers, the pin cull, the save migration.
//   node tools/warden-id.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WID, tipStart, bandPay, longBox, driveSpeed } from '../src/warden-id.js';
import { SKILLS, LEGACY_NODES } from '../src/progression-catalog.js';
import { migrateProgress } from '../src/progression.js';
import { xpFloor } from '../src/xp.js';
import * as FB from '../src/flotilla-boss.js';
import * as AC from '../src/admirals-champion.js';
import { COMMIT } from '../src/commit.js';
import { KITE, kiteBoost, idleNow } from '../src/boss-pressure.js';
let n = 0; const ok = (c, m) => { n++; if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('ok  ', m); };
const src = f => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
/* 1. HANDICAP ROWS: every warden multiplier in a boss file is 1.0 (absent) */
ok(FB.tuneOf('warden').in === 1 && FB.tuneOf('warden').out === 1, 'flotilla TUNE: warden 1 / 1');
ok(AC.tuneOf('warden').in === 1 && AC.tuneOf('warden').out === 1, 'admirals-champion TUNE: warden 1 / 1');
for (const f of ['bzchief.js', 'paladin-boss.js', 'deacon.js', 'lance-support.js', 'great-drill.js', 'grubbag.js']) ok(!/warden\s*:\s*[0-9.]+/.test(src(f)), f + ': no warden row');
const main = src('main.js');
ok(!/const DUEL_HERO = [^\n]*warden\s*:/.test(main), 'main.js DUEL_HERO: no warden row');
ok(!/const CAP_HERO = [^\n]*warden\s*:/.test(main), 'main.js CAP_HERO: no warden row');
ok(!/const ARCH_TUNE = [^\n]*warden\s*:/.test(main), 'main.js ARCH_TUNE: no warden row');
ok(!/const LP_HERO = [^\n]*warden\s*:/.test(main), 'main.js LP_HERO: no warden row');
/* 2. THE ANTI-KITE CLOCK replaces the rows: only a boss the hero stays out of reach of, only in his idle moments, only after KITE.after s */
{ const e = { t: 'x', mode: 'walk' }; let f = 1;
  for (let i = 0; i < 60 * 4; i++) f = kiteBoost(e, 1 / 60, KITE.near + 40, false); ok(f === 1, 'kite: 4 s out of reach is still nothing');
  for (let i = 0; i < 60 * 6; i++) f = kiteBoost(e, 1 / 60, KITE.near + 40, false); ok(f > 1.05 && f <= KITE.max + 1e-9, 'kite: 10 s out of reach runs his clock faster (x' + f.toFixed(2) + ', cap ' + KITE.max + ')');
  ok(kiteBoost(e, 1 / 60, KITE.near - 10, false) === 1 && e.kiteT === 0, 'kite: a hero inside reach (her tip counts) resets the clock');
  const t = { t: 'x', mode: 'walk' }; for (let i = 0; i < 60 * 12; i++) kiteBoost(t, 1 / 60, 200, false);
  t.mode = 'slamTell'; ok(kiteBoost(t, 1 / 60, 200, false) === 1, 'kite: a told blow is never sped');
  t.mode = 'walk'; t.open = 1; ok(kiteBoost(t, 1 / 60, 200, false) === 1, 'kite: an opening is never sped');
  t.open = 0; ok(kiteBoost(t, 1 / 60, 200, true) === 1, 'kite: a windup is never sped');
  ok(!idleNow({ mode: 'stunned' }, false), 'kite: stunned is not idle'); }
/* 3. THE REACH BAND + THE LONG THRUST numbers */
ok(tipStart(0) === 28 && tipStart(100) === 18 && tipStart(0, true) === 24, 'tip starts 28 px out at band 0, 18 at 100 (KEEN POINT -4)');
ok(Math.abs(bandPay(0) - 0.92) < 1e-9 && Math.abs(bandPay(100) - 1.04) < 1e-9, 'band pay x0.92 .. x1.04');
{ const far = longBox(0, 0, 1, 0.12), near = longBox(0, 0, 1, 0.095), none = longBox(0, 0, 1, 0.05), L = longBox(0, 0, -1, 0.12);
  ok(far && far.r === WID.long.reach && near.r === WID.long.near && !none, 'long thrust: 60 px on the far frame, 46 on the coil, nothing before it');
  ok(L && L.l === -WID.long.reach, 'long thrust faces left');
  ok(far.b - far.t < 15, 'long thrust is a thin line (10 px) against the first two thrusts (15)'); }
ok(WID.long.reach - 44 === 16, 'long thrust reaches 16 px past the first two thrusts');
ok(driveSpeed(40) === 0 && driveSpeed(20) >= 60 && driveSpeed(0) > driveSpeed(20), 'drive: a foe already at the point is not moved; closer is driven harder');
ok(COMMIT.warden.third === 0.30 && COMMIT.warden.light < 0.1, 'the long thrust recovers slowly (0.30 s) and the first two jabs do not');
/* 4. THE PIN CULL + THE POLE-VAULT MERGE */
{ const w = SKILLS.filter(s => s.hero === 'warden'), ids = new Set(w.map(s => s.id));
  ok(!ids.has('poleSpring') && !ids.has('holdThem') && ids.has('harrier') && ids.has('pinTwist'), 'catalog: POLE SPRING and HOLD THEM DOWN gone; the POLE-VAULT (harrier) and TWIST IT stay');
  ok(w.find(s => s.id === 'harrier').name === 'POLE-VAULT', 'the pole-vault is named');
  const casters = w.filter(s => /\bpins\b/i.test(s.desc)).map(s => s.id).sort();
  ok(JSON.stringify(casters) === JSON.stringify(['javelin', 'rainOfSpears', 'skewer']), 'pin-casting skills are skewer, javelin, rain of spears only (' + casters + ')');
  ok(w.find(s => s.id === 'setSpears').name === 'PHALANX' && !/pin/.test(w.find(s => s.id === 'setSpears').desc.replace(/\bspin/, '')), 'the phalanx is a skill and trips (no pin)'); }
/* 5. SAVE MIGRATION: a save that bought either removed skill keeps it as the merged one, in the same slot */
{ const raw = JSON.stringify({ hero: 'warden', heroes: { warden: true }, xpVersion: 1, xp: { warden: xpFloor(30) }, coins: 5, progressionVersion: 2, skillOwned: { warden: { poleSpring: true, holdThem: true, wheel: true } }, loadouts: { warden: ['poleSpring', 'wheel'] } });
  const r = migrateProgress(raw).progress;
  ok(r.skillOwned.warden.harrier === true && r.skillOwned.warden.pinTwist === true && !('poleSpring' in r.skillOwned.warden) && !('holdThem' in r.skillOwned.warden), 'migration: poleSpring -> harrier, holdThem -> pinTwist');
  ok(r.loadouts.warden.includes('harrier') && !r.loadouts.warden.includes('poleSpring'), 'migration: the loadout slot follows (' + r.loadouts.warden + ')');
  const raw2 = JSON.stringify({ hero: 'warden', heroes: { warden: true }, xpVersion: 1, xp: { warden: xpFloor(30) }, coins: 5, progressionVersion: 2, skillOwned: { warden: { poleSpring: true, harrier: true } }, loadouts: { warden: ['poleSpring', 'harrier'] } });
  const r2 = migrateProgress(raw2).progress; ok(r2.loadouts.warden.filter(Boolean).length === 1, 'migration: a save that owned both keeps one in the loadout (' + r2.loadouts.warden + ')'); }
console.log(n + ' checks' + (process.exitCode ? ' - RED' : ' - green'));
