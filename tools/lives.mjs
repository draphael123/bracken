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
import { lowerTarget, lowerMode, lowestMode, LIVES_START, LIVES_PER_COINS, livesOf, lockedOf, setLives, lockIn, startLives, coinTick, loseLife, leftWord, cardTag, modeOf, setMode, stepMode, cardTags, MODE_BLURB, MODE_IDS, LIVES_BY_MODE, livesFor, livesValue, livesBlurb, coinLivesOn } from '../src/lives.js';
import * as DFM from '../src/difficulty.js';
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
ok(startLives({ lives: 'on' }) === 3 && startLives({ lives: 'on', mode: 'easy' }) === 5 && startLives({}) === Infinity && startLives({ lives: 'off' }) === Infinity, 'entering a level: the difficulty count when ON (default NORMAL = 3), no pool when OFF');
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
has(/if \(livesOn\(\)\) \{ const ln = 'x' \+ Math\.max\(0, lives\), lx = [\s\S]{0,400}hudStrip\(2, 28[\s\S]{0,60}g\.drawImage\(PROP\.hudLife, 4, 30\)/, 'the lives row (icon + count, on a strip in the MINIMAL HUD, never idle-hidden) draws only when LIVES is ON on a campaign wood');
has(/text\(PROG\.lives === 'on' \? 'GAME OVER'/, 'the card says GAME OVER');
has(/const newRulesDue = \(\) => !PROG\.rulesSet && !PROG\.heroPicked && !LEVELS\.some/, 'the rules card is due only for a save that has not started');
has(/heroPick\.stage === 'rules'/, 'the rules card is a stage before the hero pick');
has(/LV\.setLives\(PROG, nx, CAMP_IDS\)/, 'the card toggles through the lock-aware setter');
ok(main.includes('LV.cardTags(p)'),'the slot card shows the read-only tags');
ok((main.match(/state = 'gameover'/g) || []).length === 1, 'the only way into GAME OVER is the lives rule');

/* D. SAVES */
{ const p = migrateProgress(null).progress; p.lives = 'on'; p.livesLocked = 1; p.rulesSet = 1;
  const back = migrateProgress(JSON.stringify(p)).progress; ok(back.lives === 'on' && back.livesLocked === 1 && back.rulesSet === 1, 'PROG.lives / livesLocked / rulesSet survive migrateProgress');
  const imp = JSON.parse(exportProgress(p)); ok(imp.lives === 'on' && imp.livesLocked === 1, 'export carries lives and its lock');
  const d = migrateProgress(null).progress; d.lives = 'on'; tag(d, LEVELS);
  const prep = JSON.parse(prepareImport(exportProgress(d), LEVELS)); ok(prep.lives === 'on', 'a demo save imported into the full game keeps LIVES ON');
  const old = migrateProgress(JSON.stringify({ coins: 5 })).progress; ok(livesOf(old) === 'off', 'an old save with no field is OFF'); }

/* E. DIFFPICK: the DIFFICULTY row on the same card */
ok(modeOf({}) === 'normal' && modeOf(null) === 'normal' && modeOf({ mode: 'bogus' }) === 'normal' && modeOf({ mode: 'master' }) === 'master', 'NORMAL is the default and every old save mode');
{ const p = {};
  ok(setMode(p, 'story', IDS) === 'story' && p.mode === 'story', 'an unlocked save can pick VERY EASY');
  ok(setMode(p, 'master', IDS, false) === 'story' && p.mode === 'story', 'MASTER is refused while it is not unlocked');
  ok(setMode(p, 'master', IDS, true) === 'master', '... and allowed once unlocked (or ?difficulty=master)');
  ok(setMode(p, 'nonsense', IDS, true) === 'master', 'a value outside the three is refused');
  setMode(p, 'normal', IDS, true); lockIn(p);
  ok(setMode(p, 'story', IDS, true) === 'normal' && p.mode === 'normal', 'LOCKED with the first level: the mode refuses a change');
  const q = { [IDS[0]]: { cleared: true } }; ok(setMode(q, 'story', IDS) === 'normal', 'an old save with a level record cannot be moved off NORMAL'); }
ok(stepMode('normal', 1) === 'hard' && stepMode('hard', 1) === 'master' && stepMode('hard', -1) === 'normal' && stepMode('normal', -1) === 'easy' && stepMode('easy', -1) === 'story' && stepMode('story', 1) === 'easy' && stepMode('story', -1) === 'story' && stepMode('master', 1) === 'master', 'the row steps VERY EASY - EASY - NORMAL - MASTER without wrapping');
ok(MODE_IDS.join() === 'story,easy,normal,hard,master' && DFM.MODES.hard.label === 'HARD' && DFM.MODES.easy.label === 'EASY' && DFM.MODES.story.label === 'VERY EASY' && DFM.MODES.master.label === 'MASTER', 'labels come from src/difficulty.js');
ok(MODE_IDS.every(id => MODE_BLURB[id] && MODE_BLURB[id].length <= 72), 'one short line per mode (two lines at 6 px on the card)');
ok(MODE_BLURB.easy === 'FOES HIT 7% LESS, +1 FLASK, SHRINE REFILLS ONE FLASK' && MODE_BLURB.hard === 'FOES HIT 14% MORE, -1 FLASK, SHRINE REFILLS ONE FLASK' && /35% MORE/.test(MODE_BLURB.master) && /NONE/.test(MODE_BLURB.master) && /PUNISH/.test(MODE_BLURB.master) && /ALL FLASKS/.test(MODE_BLURB.story), 'each blurb is built from the MODES numbers');
ok(cardTags({}).length === 0 && cardTags({ lives: 'on' }).map(t => t[0]).join() === 'LIVES', 'an old save shows no mode tag (LIVES only if ON)');
ok(cardTags({ rulesSet: 1 }).map(t => t[0]).join() === 'NORMAL' && cardTags({ rulesSet: 1, mode: 'master', lives: 'on' }).map(t => t[0]).join() === 'MASTER,LIVES' && cardTags({ mode: 'story' })[0][0] === 'VERY EASY', 'the slot card shows the chosen mode (then LIVES)');
/* F. LIVES BY DIFFICULTY (Daniel 11-08) + EASY */
ok(LIVES_BY_MODE.story === 10 && LIVES_BY_MODE.easy === 5 && LIVES_BY_MODE.normal === 3 && LIVES_BY_MODE.hard === 2 && LIVES_BY_MODE.master === 1, 'lives per level: VERY EASY 10, EASY 5, NORMAL 3, HARD 2, MASTER 1');
for (const [m, n] of Object.entries(LIVES_BY_MODE)) ok(startLives({ lives: 'on', mode: m }) === n && livesFor({ mode: m }) === n && startLives({ lives: 'off', mode: m }) === Infinity, 'startLives follows the save mode: ' + m + ' ' + n);
ok(MODE_IDS.every(id => LIVES_BY_MODE[id] >= 1 && MODE_BLURB[id]), 'every mode has a count and a line');
ok(livesFor({}) === 3 && livesFor({ mode: 'bogus' }) === 3, 'an old save (no mode) is NORMAL: 3');
ok(livesValue({}) === 'OFF' && livesValue({ lives: 'on' }) === 'ON: 3 LIVES' && livesValue({ lives: 'on', mode: 'story' }) === 'ON: 10 LIVES' && livesValue({ lives: 'on', mode: 'master' }) === 'ON: 1 LIFE' && livesValue({ lives: 'on', mode: 'easy' }) === 'ON: 5 LIVES', 'the card shows the count next to ON');
ok(coinLivesOn({}) && coinLivesOn({ mode: 'story' }) && coinLivesOn({ mode: 'easy' }) && coinLivesOn({ mode: 'hard' }) && !coinLivesOn({ mode: 'master' }), '+1 per 100 coins on every mode but MASTER');
ok(/no coin lives/.test(livesBlurb({ lives: 'on', mode: 'master' })) && /\+1 per 100/.test(livesBlurb({ lives: 'on' })), 'the card blurb says so');
{ const E = DFM.MODES.easy, S = DFM.MODES.story, N = DFM.MODES.normal;   /* EASY sits halfway on every number */
  for (const k of ['take', 'stagger', 'parry', 'open', 'death', 'affix']) ok(E[k] !== N[k] && (E[k] - S[k]) * (E[k] - N[k]) < 0, 'EASY ' + k + ' sits between VERY EASY and NORMAL (' + E[k] + ')');   /* (claude/ladder: tuned off halfway on the measured win rates) */
  ok(E.flaskAdd === 1 && E.shrine === 'one' && E.punish === false && E.flinch === true && E.stale === null && E.poise === 1 && E.gap === 1, 'EASY keeps the whole-number rules: +1 flask, one-flask shrines, no punish'); }
{ const N = DFM.MODES.normal, M = DFM.MODES.master, H = DFM.MODES.hard;   /* HARD sits halfway between NORMAL and MASTER */
  for (const k of ['take', 'stagger', 'poise', 'parry', 'open', 'gap', 'death', 'affix']) ok((H[k] - N[k]) * (H[k] - M[k]) < 0, 'HARD ' + k + ' sits between NORMAL and MASTER (' + H[k] + ')');   /* (claude/ladder) */
  ok(H.flaskAdd === -1 && H.shrine === 'one' && H.punish === false && H.flinch === true, 'HARD whole-number rules: -1 flask (rounded away from Normal like EASY), one-flask shrines, no boss reprisals'); }
{ const p = { mode: 'hard', lives: 'on' }, f = [];
  ok(lowerTarget(p) === 'normal' && lowerTarget({ mode: 'story' }) === null && lowerTarget({}) === 'easy' && lowerTarget({ mode: 'master' }) === 'hard', 'the lower target is one step down, none under VERY EASY');
  for (let i = 0; i < 6; i++) f.push(lowerMode(p));
  ok(f.join() === 'normal,easy,story,,,' && p.mode === 'story' && p.modeStart === 'hard' && p.modeLowered === 3, 'lowering steps down one at a time to VERY EASY and stops (start kept: ' + f.join('/') + ')');
  ok(startLives(p) === 10 && lowestMode('hard', 'easy') === 'easy' && lowestMode(undefined, 'hard') === 'hard' && lowestMode('story', undefined) === 'story', 'lives follow the new mode; a record keeps the lowest');
  ok(!DFM.canSwitch('easy', 'hard') && DFM.canSwitch('hard', 'easy'), 'canSwitch: down yes, up no'); }
has(/function lowerModeAsk\(\)/, 'the pause menu has the lower-difficulty confirm');
has(/'LOWER TO ' \+ LV\.modeLabel\(to\) \+ '\? THIS CANNOT BE UNDONE/, 'the question says what it does and that it cannot be undone');
has(/k !== 'Save mode' \|\| lowerOk\(\)/, 'the row is hidden from Boss Rush, Boss Select, the yard, the duel pit, trials and shops');
ok(DFM.modeId('hard') === 'hard' && DFM.modeId('master') === 'master', '?difficulty=hard is HARD now (it used to mean MASTER)');
ok(DFM.modeId('easy') === 'easy' && DFM.modeId('veryeasy') === 'story' && DFM.modeId('story') === 'story', 'the ?difficulty= names: easy is EASY, veryeasy/story is VERY EASY');
ok(DFM.canSwitch('normal', 'easy') && DFM.canSwitch('easy', 'story') && !DFM.canSwitch('story', 'easy') && DFM.canSwitch('master', 'easy'), 'difficulty.js canSwitch: only down');
has(/function livesCoin\(n\) \{ if \(!livesOn\(\) \|\| !LV\.coinLivesOn\(PROG\)\) return;/, 'MASTER earns no coin lives');
has(/text\('< ' \+ LV\.livesValue\(PROG\) \+ ' >'/, 'the LIVES row shows the count');
has(/hudLife: outline\(fromGrid\(\[/, 'the lives icon is a baked HUD icon');
/* the mode is the save's: handed to difficulty.js, and the ?difficulty= override still wins */
DFM.setOverride(null); DFM.setSaveMode('story'); ok(DFM.mode() === 'story', 'setSaveMode hands the saved mode to difficulty.js');
DFM.setOverride('master'); ok(DFM.mode() === 'master' && DFM.overrideId() === 'master', 'the ?difficulty= override still wins over the save'); DFM.setOverride(null); DFM.setSaveMode('normal');
ok(main.includes("DFM.setSaveMode(PROG.mode); PROG.lives = LV.livesOf(PROG)"), "progDefaults hands PROG.mode to the difficulty module (every load)");
ok(main.includes("PROG.mode = LV.modeOf(PROG); DFM.setSaveMode(PROG.mode)"), "the card stores PROG.mode (NORMAL pre-selected) and applies it at CONTINUE");
ok(main.includes("LV.setMode(PROG, nx, CAMP_IDS, masterOpen()) === nx) { DFM.setSaveMode(nx)"), "the card sets the mode through the lock-aware setter and applies it at once");
ok(main.includes("if (upPress && rulesRow > 0) { rulesRow = 0; SFX.ui(); } else if (downPress && rulesRow < 1) { rulesRow = 1;"), "up / down move between the two rows (keyboard + pad)");
ok(main.includes("rulesRow = 1; rulesToggle(1, 1)"), "the DIFFICULTY row is a touch target");
ok(main.includes("LV.cardTags(p).slice().reverse()"), "the slot card draws the mode tag");
{ const p = migrateProgress(null).progress; p.mode = 'master'; p.rulesSet = 1;
  ok(migrateProgress(JSON.stringify(p)).progress.mode === 'master', 'PROG.mode survives migrateProgress');
  ok(JSON.parse(exportProgress(p)).mode === 'master', 'export carries the mode');
  ok(modeOf(migrateProgress(JSON.stringify({ coins: 5 })).progress) === 'normal', 'an old save with no mode loads as NORMAL'); }

if (fails.length) { console.log('RED ' + fails.length); for (const f of fails) console.log(' - ' + f); process.exit(1); }
console.log('GREEN lives: pick + lock, DIFFICULTY row (default, lock, persistence), 5 lives, +1 per 100, game over -> map, OFF unchanged, saves carry the field');
