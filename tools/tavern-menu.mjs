// tools/tavern-menu.mjs - THE TAVERN's NAME and its PAUSE/SETTINGS MENU (claude/tavernname; Daniel 10-19). Node-only (reads sources, imports the level + pause rows).
//   name      the hidden level is called THE TAVERN; no player-facing 'Co-op Tavern' / 'CO-OP TAVERN' / 'CROSSROADS INN' string is left in src/; the title rows stay LOCAL CO-OP / ONLINE CO-OP
//   menu      the pause menu keeps Resume / Settings / Co-op / Return to map / Quit to title in the inn, and hides the level-only rows (map, level card, hero trial, shrine, restart);
//             Return to map walks out of the inn's door (tavernToMap); settings Back returns to the pause menu and ESC to the play state (the tavern)
//   hands     a JOINED pad player's START (padIntoPlayer) opens the menu in the inn; an UN-JOINED pad's START still joins (tavernPadJoin) and player one's own pad is never a joiner
// A real-page walk (join, press Start, open Settings, Back) is tools/tavern.mjs's page part - the integ runs that; this file is the static pin.
import fs from 'fs';
import { PAUSE_ROWS } from '../src/ui-hud.js';
import { LEVELS } from '../src/level.js';
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const main = fs.readFileSync('src/main.js', 'utf8').replace(/\r\n/g, '\n');
const lv = LEVELS.find(l => l.id === 'tavern');
ok(lv && lv.name === 'THE TAVERN', 'the hidden level is named THE TAVERN: ' + (lv && lv.name));
const bad = [];
for (const f of fs.readdirSync('src').filter(f => f.endsWith('.js')).concat(fs.readdirSync('src/redraw').filter(f => f.endsWith('.js')).map(f => 'redraw/' + f))) {
  const t = fs.readFileSync('src/' + f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');   // strings only: comments may keep the history
  for (const m of t.match(/'[^'\n]*'|"[^"\n]*"/g) || []) if (/co-?op tavern|co-?op inn|crossroads inn|the inn is full: four/i.test(m)) bad.push(f + " " + m);
}
ok(!bad.length, 'no CO-OP TAVERN / CROSSROADS INN / THE INN IS FULL: FOUR wording in any string of src/' + (bad.length ? ': ' + bad[0] : ''));
ok(/LOCAL CO-OP/.test(main) && /ONLINE CO-OP/.test(main), 'the title rows LOCAL CO-OP / ONLINE CO-OP remain (the ways in)');
ok(/THE TAVERN IS FULL: FOUR TO A PARTY/.test(main), 'the full-party callout says THE TAVERN');
for (const k of ['Resume', 'Settings', 'Co-op', 'Return to map', 'Quit to title']) ok(PAUSE_ROWS.includes(k), 'the pause rows include ' + k);
const hide = (main.match(/const TAVERN_MENU_HIDE = (\[[^\]]*\])/) || [])[1];
const H = hide ? JSON.parse(hide.replace(/'/g, '"')) : [];
ok(H.length >= 5 && ['Map', 'Level card', 'Hero trial', 'Back to shrine', 'Restart level'].every(k => H.includes(k)), 'the inn hides the level-only rows: ' + H.join(','));
ok(!['Resume', 'Settings', 'Co-op', 'Return to map', 'Quit to title'].some(k => H.includes(k)), 'the inn never hides Resume / Settings / Co-op / Return to map / Quit to title');
ok(/L && L\.tavern && menuFrom === 'play' \? PAUSE_ITEMS\.filter\(k => !TAVERN_MENU_HIDE\.includes\(k\)\)/.test(main), 'menuItems filters the pause rows in the inn only');
ok(/k === 'Return to map' && L && L\.tavern\) \{ tavernToMap\(\); \}/.test(main), 'Return to map in the inn walks out to the map (tavernToMap)');
ok(/if \(pausePress\) \{ openMenu\('play'\); return; \}/.test(main), 'a pause press in play opens the menu (the inn is a play-state level)');
ok(/if \(k === 'Back'\) \{ if \(menuFrom === 'play'\) \{ menuKind = 'pause'/.test(main.replace(/else if \(k === 'Back'\)/, "if (k === 'Back')")), 'settings Back returns to the pause menu, and ESC from it to play (the Tavern)');
const pip = (main.match(/function padIntoPlayer[\s\S]*?\n\}/) || [''])[0];
ok(/rose\('pause'\) && L && L\.tavern && state === 'play'\) pausePress = true/.test(pip), "a joined pad player's START sets pausePress in the inn (padIntoPlayer)");
const join = (main.match(/function tavernPadJoin[\s\S]*?\n\}/) || [''])[0];
ok(/now\.pause && !was\.pause/.test(join) && /gq\.index === p1Pad\) continue/.test(join), "an un-joined pad's START still joins, and player one's own pad never does");
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nall ok'); process.exit(fails.length ? 1 : 0);
