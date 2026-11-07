/* tools/lives.mjs - THE LIVES OPTION (claude/lives, Daniel 11-07; src/lives.js). NODE ONLY, no page, no browser.
   A. THE PICK     OFF is the default and every old save's value; the pick changes only while unlocked; it LOCKS at the first campaign entry (flag) and for a save
                   that already holds a level record; a locked pick refuses the change and shows read-only (slot card tag)
   B. THE RULE     ON = 5 lives a level (no pool when OFF); +1 per 100 coins picked up (a 9-pile that crosses a hundred counts once);
                   a death costs one life and the last one is GAME OVER; the toast words
   C. THE FLOW     (source greps) every hook is wired: the rules card before the hero pick, the lock at startGame, the +1 LIFE at the pickup sites (a recovered
                   bag is not one), the death cost AND the normal rules, gameover -> world map, the HUD row only when ON, Boss Rush / yard / trial / shop / tavern excluded
   D. SAVES        PROG.lives survives migrateProgress, export, and a demo save's prepareImport; an old save with no field loads as OFF
   Run: node tools/lives.mjs */
import { readFileSync } from 'node:fs';
import { LIVES_START, LIVES_PER_COINS, livesOf, lockedOf, setLives, lockIn, startLives, coinTick, loseLife, leftWord, cardTag } from '../src/lives.js';
import { migrateProgress, exportProgress } from '../src/progression.js';
import { prepareImport, tag } from '../src/demo-save.js';
import { LEVELS } from '../src/level.js';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const IDS = LEVELS.filter(l => !l.hidden).map(l => l.id);

/* A. THE PICK */
ok(livesOf({}) === 'off' && livesOf(null) === 'off' && livesOf({ lives: 'bogus' }) === 'off' && livesOf({ lives: 'on' }) === 'on', 'OFF is the default (an old save, junk, nothing); only the string "on" is ON');
{ const p = {};
  ok(setLives(p, 'on', IDS) === 'on' && p.lives === 'on', 'an unlocked save can pick ON');
  ok(setLives(p, 'off', IDS) === 'off' && p.lives === 'off', '... and back to OFF before the first level');
  ok(setLives(p, 'nonsense', IDS) === 'off', 'a value outside off|on is refused');
  setLives(p, 'on', IDS); lockIn(p);
  ok(lockedOf(p, IDS), 'lockIn locks');
  ok(setLives(p, 'off', IDS) === 'on' && p.lives === 'on', 'a LOCKED save refuses the change (still ON)');
  const q = { lives: 'off', [IDS[0]]: { cleared: true } };
  ok(lockedOf(q, IDS) && setLives(q, 'on', IDS) === 'off', 'a save that already holds a level record is locked even with no flag (old saves cannot be flipped on)');
  ok(!lockedOf({}, IDS), 'a fresh save is not locked'); }
ok(cardTag({ lives: 'on' }) === 'LIVES' && cardTag({}) === '' && cardTag({ lives: 'off' }) === '', 'the slot card says LIVES only for an ON save');

/* B. THE RULE */
ok(LIVES_START === 5 && LIVES_PER_COINS === 100, '5 lives, a life per 100 coins');
ok(startLives({ lives: 'on' }) === 5 && startLives({}) === Infinity && startLives({ lives: 'off' }) === Infinity, 'entering a level: 5 when ON, no pool when OFF');
{ let c = 0, gained = 0; for (let i = 0; i < 250; i++) { const r = coinTick(c, 1); c = r.coins; gained += r.gained; }
  ok(gained === 2 && c === 250, '250 single coins grant exactly 2 lives (' + gained + ')');
  const a = coinTick(95, 9); ok(a.gained === 1 && a.coins === 104, 'a pile of 9 that crosses the hundred grants it once');
  ok(coinTick(99, 1).gained === 1, 'the 100th coin grants a life'); ok(coinTick(100, 1).gained === 0, 'the 101st does not');
  ok(coinTick(0, 0).gained === 0 && coinTick(10, -5).coins === 10, 'zero / negative picks grant nothing and never lower the count'); }
{ let r = { lives: 5, over: false }; for (let i = 0; i < 4; i++) r = loseLife(r.lives);
  ok(r.lives === 1 && !r.over, 'four deaths from 5 leaves 1, not over'); r = loseLife(r.lives); ok(r.lives === 0 && r.over, 'the fifth death is GAME OVER');
  ok(loseLife(0).lives === 0, 'never below zero'); ok(loseLife(6).lives === 5, 'a +1 life earned keeps the run going'); }
ok(leftWord(1) === '1 LIFE LEFT' && leftWord(4) === '4 LIVES LEFT', 'the toast words');

/* C. THE FLOW (source) */
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), has = (re, m) => ok(re.test(main), m);
has(/import \* as LV from '\.\/lives\.js'/, 'main.js imports src/lives.js');
has(/PROG\.lives = LV\.livesOf\(PROG\)/, 'progDefaults normalises PROG.lives (an old save is OFF)');
has(/const livesWood = \(\) => !!L && !rushOn\(\) && !bossSelectFight && !L\.trial && !L\.shop && !L\.tavern && !edTesting && !\(DUELO && DUELO\.on\(\)\)/, 'lives apply on a campaign wood only: not Boss Rush, Boss Select, a trial, a shop, the tavern, the duel pit, an editor test');
has(/livesOn = \(\) => PROG\.lives === 'on' && livesWood\(\)/, 'the coin lives and the HUD row need ON and a campaign wood');
has(/lives = LV\.startLives\(PROG\)/, 'startGame hands the entry pool (5 when ON)');
has(/if \(livesWood\(\) && !PROG\.livesLocked\) \{ LV\.lockIn\(PROG\)/, 'the pick locks at the first campaign entry');
ok((main.match(/livesCoin\(/g) || []).length === 4, 'livesCoin is defined once and called at the three pickup sites (acorn pickup, collectAcorn, pieces of eight): ' + (main.match(/livesCoin\(/g) || []).length);
has(/got\+\+; livesCoin\(1\); dcGot\(1\); if \(P\.score\)/, 'the in-level pickup counts toward the hundred');
has(/function collectAcorn\(a\) \{ a\.got = true; got\+\+; livesCoin\(1\)/, 'collectAcorn counts toward the hundred');
ok(!/got \+= b\.coins; livesCoin/.test(main), 'a dropped bag you win back is NOT a pickup for the hundred');
has(/number\(P\.x, P\.y - 34, '\+1 LIFE'/, 'a clear +1 LIFE word'); has(/SFX\.sting\(\); burst\(P\.x, P\.y - 12, 12, \['#8fd160'/, '... and a sound and a burst');
has(/if \(lifeRule\(\)\) \{ lives = LV\.loseLife\(lives\)\.lives;/, 'a death costs a life in die()');
has(/function die\(killer\)[\s\S]{0,1800}deathCost\(P, killer\)/, 'the normal death rules (deathCost: shrine respawn, salt) still run');
has(/else if \(lifeRule\(\) && lives <= 0 && !bossSelectFight\) \{ state = 'gameover'/, 'no lives left -> the GAME OVER state (otherwise respawn as ever)');
has(/if \(state === 'gameover'\) \{ if \(confirmPress \|\| pausePress\) \{ state = 'map'; gotoLevelNode\(levelIndex\)/, 'GAME OVER -> the WORLD MAP');
has(/if \(livesOn\(\)\) \{ g\.drawImage\(K\.R\.idle\[0\]/, 'the heart row draws only when LIVES is ON on a campaign wood');
has(/text\(PROG\.lives === 'on' \? 'GAME OVER'/, 'the card says GAME OVER');
has(/const newRulesDue = \(\) => !PROG\.rulesSet && !PROG\.heroPicked && !LEVELS\.some/, 'the rules card is due only for a save that has not started');
has(/heroPick\.stage === 'rules'/, 'the rules card is a stage before the hero pick');
has(/LV\.setLives\(PROG, nx, CAMP_IDS\)/, 'the card toggles through the lock-aware setter');
has(/LV\.cardTag\(p\)/, 'the slot card shows the read-only tag');
ok((main.match(/state = 'gameover'/g) || []).length === 1, 'the only way into GAME OVER is the lives rule');

/* D. SAVES */
{ const p = migrateProgress(null).progress; p.lives = 'on'; p.livesLocked = 1; p.rulesSet = 1;
  const back = migrateProgress(JSON.stringify(p)).progress; ok(back.lives === 'on' && back.livesLocked === 1 && back.rulesSet === 1, 'PROG.lives / livesLocked / rulesSet survive migrateProgress');
  const imp = JSON.parse(exportProgress(p)); ok(imp.lives === 'on' && imp.livesLocked === 1, 'export carries lives and its lock');
  const d = migrateProgress(null).progress; d.lives = 'on'; tag(d, LEVELS);
  const prep = JSON.parse(prepareImport(exportProgress(d), LEVELS)); ok(prep.lives === 'on', 'a demo save imported into the full game keeps LIVES ON');
  const old = migrateProgress(JSON.stringify({ coins: 5 })).progress; ok(livesOf(old) === 'off', 'an old save with no field is OFF'); }

if (fails.length) { console.log('RED ' + fails.length); for (const f of fails) console.log(' - ' + f); process.exit(1); }
console.log('GREEN lives: pick + lock, 5 lives, +1 per 100, game over -> map, OFF unchanged, saves carry the field');
