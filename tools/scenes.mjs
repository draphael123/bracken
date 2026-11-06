/* tools/scenes.mjs - THE SCENES GALLERY, pinned (claude/scenes-gallery, Daniel 11-06 15:37). Node only, no browser.
     node tools/scenes.mjs
   Road order = TABLE order, a short player-facing name for every row (textfit-safe), the unlock rules (seen, back-fill from cleared levels for old saves, the spur flag, ?scenes=all),
   rows() never writes the save, every row's replay timeline runs to done (and skips to done), and the replay path in main.js never credits a clear or writes progress (source checks:
   bossJumpOn first, no winLevel / saveProgress / PROG write between the gallery's markers, trnBegin's replay branch returns before the save-touching lines, trnFinish hands a replay to scenesEnd).
   Exit 1 on any red row. */
import { readFileSync } from 'node:fs';
import * as TRM from '../src/transitions.js';
import * as SG from '../src/scenes-gallery.js';
import { STATIONS, TAVERN_ART, REACH } from '../src/tavern.js';

const rows0 = []; const ok = (name, pass, why = '') => { rows0.push({ name, pass: !!pass }); console.log((pass ? 'ok   ' : 'FAIL ') + name + (pass ? '' : '  ' + why)); };
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const tavSrc = readFileSync(new URL('../src/tavern.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const artSrc = readFileSync(new URL('../src/tavern-art.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const tavTool = readFileSync(new URL('./tavern.mjs', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

/* ---- road order and names ---- */
const all = SG.rows({}, { all: true });
ok('one gallery row per TABLE row, in TABLE order (the road)', all.length === TRM.TABLE.length && all.every((r, i) => r.entry === TRM.TABLE[i] && r.n === i + 1 && r.key === TRM.TABLE[i].from + '>' + TRM.TABLE[i].to));
ok('every row has a short player-facing name of its own (<= ' + SG.NAME_MAX + ' chars, capitals, no ids)', all.every(r => SG.NAMES[r.key] && r.name === SG.NAMES[r.key] && r.name.length <= SG.NAME_MAX), all.filter(r => !SG.NAMES[r.key]).map(r => r.key).join(','));
ok('names are textfit-safe (capitals, space, apostrophe, hyphen only) and unique', all.every(r => /^[A-Z' -]+$/.test(r.name)) && new Set(all.map(r => r.name)).size === all.length);
ok('no name is left over for a row that is gone', Object.keys(SG.NAMES).every(k => all.some(r => r.key === k)));
ok('the named scenes: THE FERRY TO THE MARSH, SMOKE OVER THE KINGSWOOD, a road to the stockade', SG.NAMES['hornetsnest>marsh'] === 'THE FERRY TO THE MARSH' && SG.NAMES['kings>burning'] === 'SMOKE OVER THE KINGSWOOD' && /STOCKADE/.test(SG.NAMES['fenroad>stockade']));
ok('cinematic rows are the ones with a scene on top (ferry, road, smoke) and only those', all.filter(r => r.cinematic).map(r => r.entry.scene).sort().join() === 'ferry,road,smoke' && all.every(r => r.cinematic === !!r.entry.scene));
ok('the road runs wood first and the shut-spur fallback last', all[0].key === 'wood>hornetsnest' && all[all.length - 1].key === 'kings>scree');

/* ---- the unlock rules ---- */
const fresh = {};
ok('a fresh save: nothing unlocked, every row would read ???', SG.countUnlocked(fresh) === 0 && !SG.anyUnlocked(fresh));
const snap = JSON.stringify({ wood: { cleared: true }, transSeen: { 'marsh>fenroad': 1 }, burningOpen: true });
const p1 = JSON.parse(snap); SG.rows(p1); SG.countUnlocked(p1); SG.anyUnlocked(p1);
ok('listing rows never writes the save', JSON.stringify(p1) === snap);
ok('a seen id unlocks exactly its row', (() => { const r = SG.rows({ transSeen: { 'marsh>fenroad': 1 } }).filter(x => x.unlocked); return r.length === 1 && r[0].key === 'marsh>fenroad'; })());
ok('BACK-FILL: an old save with wood cleared (no transSeen) unlocks wood>hornetsnest', SG.rows({ wood: { cleared: true } }).find(r => r.key === 'wood>hornetsnest').unlocked);
ok('BACK-FILL: clearing the NEXT level unlocks the row into it (hornetsnest cleared opens the ferry via its own from, marsh cleared opens it by its to)', SG.rows({ marsh: { cleared: true } }).filter(r => r.unlocked).map(r => r.key).sort().join() === 'hornetsnest>marsh,marsh>fenroad');
ok('BACK-FILL: a save that cleared the whole road unlocks every row of the spur it took (spur open: the smoke, not the scree walk)', (() => { const p = { burningOpen: true }; for (const id of ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings']) p[id] = { cleared: true }; const r = SG.rows(p); return r.filter(x => x.unlocked).length === all.length - 1 && r.find(x => x.key === 'kings>burning').unlocked && !r.find(x => x.key === 'kings>scree').unlocked; })());
ok('BACK-FILL: Kingswood cleared with the spur shut unlocks the scree walk and not the smoke', (() => { const r = SG.rows({ kings: { cleared: true }, burningOpen: false }); return r.find(x => x.key === 'kings>scree').unlocked && !r.find(x => x.key === 'kings>burning').unlocked; })());
ok('an uncleared level unlocks nothing by itself (a level you only reached)', SG.countUnlocked({ marsh: { cleared: false, best: 12 } }) === 0);
ok('?scenes=all unlocks every row', SG.rows({}, { all: true }).every(r => r.unlocked) && SG.countUnlocked({}, { all: true }) === TRM.TABLE.length);
ok('hide() drops rows (the demo\'s locked ends) but ?scenes=all shows them anyway', SG.rows({}, { hide: e => e.to === 'scree' }).length === TRM.TABLE.length - 1 && SG.rows({}, { all: true, hide: e => e.to === 'scree' }).length === TRM.TABLE.length);
ok('markSeen: records once, reports whether it changed, creates the flag table', (() => { const p = {}; return SG.markSeen(p, 'a>b') === true && p.transSeen['a>b'] === 1 && SG.markSeen(p, 'a>b') === false && SG.markSeen(null, 'x') === false; })());

/* ---- the replay timelines: the same runner, every row ends ---- */
ok('every row\'s replay runs to done (a full watch)', all.every(r => { const tl = TRM.start(r.entry); for (let i = 0; i < 4000 && !tl.done; i++) TRM.step(tl, 1 / 30, { ready: true }); return tl.done; }));
ok('every row\'s replay skips to done (a press after the guard)', all.every(r => { const tl = TRM.start(r.entry); for (let i = 0; i < 40; i++) TRM.step(tl, 1 / 30); TRM.step(tl, 1 / 30, { press: true }); for (let i = 0; i < 400 && !tl.done; i++) TRM.step(tl, 1 / 30, { ready: true }); return tl.done; }));
ok('the replay stand column is inside the level for every row (nine tiles short of the way out)', all.every(r => { for (const LW of [300, 560, 620, 800]) { const c = SG.standCol(r.entry, LW); if (c < 4 || c > LW - 4) return false; } return true; }) && SG.standCol({ open: { col: 549 } }, 560) === 540 && SG.standCol({ walk: { to: 600 } }, 640) === 591);

/* ---- main.js: the replay never credits a clear or writes progress ---- */
const a = src.lastIndexOf('/*', src.indexOf('THE SCENES GALLERY (src/scenes-gallery.js')), b = src.indexOf('(claude/actcards) THE BOSS-KILL BEAT.', a);
const block = a >= 0 && b > a ? src.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '') : '';
ok('the gallery block is found in main.js', block.length > 500);
ok('the replay block never calls winLevel, saveProgress, gainXp or a coin/medal credit', !/\b(winLevel|winLevel0|saveProgress|gainXp|profCredit|medal\w*)\s*\(/.test(block), (block.match(/\b(winLevel|saveProgress|gainXp|profCredit)\s*\(/) || [''])[0]);
ok('the replay block assigns nothing on PROG (loadSlot reads it back; the save is the page\'s only)', !/\bPROG(\.\w+|\[[^\]]+\])\s*(=|\+=|-=|\|\|=)(?!=)/.test(block) && !/SG\.markSeen/.test(block));
ok('scenesPlay sets bossJumpOn (the save lock) before it loads anything', (() => { const s = block.indexOf('function scenesPlay'), e = block.indexOf('function scenesStand'); const f = block.slice(s, e); return f.indexOf('bossJumpOn = true') > 0 && f.indexOf('bossJumpOn = true') < f.indexOf('loadThen') && f.indexOf('bossJumpOn = true') < f.indexOf('partyToWant'); })());
ok('the lock is the one saveProgress honours, and only scenesEnd lifts it (after the save is read back)', /function saveProgress\(\) \{ if \(saveBlocked \|\| bossJumpOn\) return;/.test(src) && (() => { const f = block.slice(block.indexOf('function scenesEnd'), block.indexOf('function updateScenes')); return f.indexOf('loadSlot(slot)') > 0 && f.indexOf('loadSlot(slot)') < f.indexOf('bossJumpOn = false'); })());
ok('a locked row buzzes and never starts', /function scenesPlay\(row\) \{\s*if \(!row \|\| !row\.unlocked\) \{ SFX\.buzz\(\); return false; \}/.test(src));
ok('locked rows draw as ???', /r\.unlocked \? fitText\(r\.name, 140, 6\) : '\?\?\?'/.test(src));
const tb = src.slice(src.indexOf('function trnBegin(replay)'), src.indexOf('function trnOpenWay'));
ok('trnBegin\'s replay branch returns before the save-touching lines (seen, policy, saveProgress, demo lock)', tb.indexOf('if (replay)') > 0 && tb.indexOf('return true; }') > 0 && tb.indexOf('return true; }') < tb.indexOf('TRM.policy') && tb.indexOf('return true; }') < tb.indexOf('SG.markSeen') && tb.indexOf('return true; }') < tb.indexOf('saveProgress'));
ok('trnBegin records SEEN for a real transition whether it plays or the setting skips it (once, one save)', (tb.match(/SG\.markSeen\(PROG, key\)/g) || []).length === 1 && /if \(SG\.markSeen\(PROG, key\) \|\| plays\) saveProgress\(\);/.test(tb) && tb.indexOf('SG.markSeen') < tb.indexOf('if (!plays) return false;'));
const tf = src.slice(src.indexOf('function trnFinish()'), src.indexOf('/* THE ARRIVAL:'));
ok('trnFinish hands a replay to scenesEnd before any level loads', tf.indexOf('tr.replay') > 0 && tf.indexOf('scenesEnd()') > 0 && tf.indexOf('scenesEnd()') < tf.indexOf('loadThen') && tf.indexOf('scenesEnd()') < tf.indexOf('endOnMap'));
ok('the gallery is reached from the title (SCENES row) and the inn (the storyteller), and is a state of its own', /\['BOSS SELECT'\], scenesRowOn\(\) \? \['SCENES'\] : \[\]/.test(src) && /k === 'SCENES'\) scenesOpen\('title'\)/.test(src) && /scenes: \(\) => \{ if \(state === 'play'\) scenesOpen\('inn'\); \}/.test(src) && /state === 'scenes'\) \{ updateScenes\(\)/.test(src) && /state === 'scenes'\) drawScenes\(\)/.test(src));
ok('the title row shows only when the save has a scene to show (or ?scenes=all)', /function scenesRowOn\(\) \{ if \(scenesAll\(\)\) return true; const raw = readSlot\(slot\); return !!raw && SG\.anyUnlocked\(raw/.test(src));
ok('hidden ?scenes=all is the only switch that unlocks everything', /function scenesAll\(\) \{ return q\.get\('scenes'\) === 'all'; \}/.test(src) && (src.match(/scenesAll\(\)/g) || []).length === 3);

/* ---- the inn: THE STORYTELLER ---- */
const st = STATIONS.find(s => s.id === 'storyteller'), xs = STATIONS.map(s => s.x);
ok('THE STORYTELLER is a station (verb SCENES) and its art is on the ART list', !!st && st.verb === 'SCENES' && st.name === 'THE STORYTELLER' && TAVERN_ART.some(r => r[0] === 'storyteller'));
ok('the stations stay west to east and 3+ tiles apart with the storyteller in (REACH spacing holds)', xs.every((x, i) => i === 0 || x - xs[i - 1] >= 3) && xs.every((x, i) => i === 0 || (x - xs[i - 1]) * 16 > REACH.x * 2), xs.join(','));
ok('the storyteller sits by the fire (the hearth runs tiles 11-17) with room either side', st.x >= 18 && st.x <= 21);
ok('tavern.js uses it (api.scenes) and draws it (TA.storyteller); tavern-art exports it', /s\.id === 'storyteller'\) \{ if \(api\.scenes\) api\.scenes\(\); return; \}/.test(tavSrc) && /TA\.storyteller\(g, at\('storyteller'\)/.test(tavSrc) && /export function storyteller\(/.test(artSrc));
ok('first-visit glint: the station has a first line and no id collides', !!st.first && st.first.length < 140 && new Set(STATIONS.map(s => s.id)).size === STATIONS.length);
ok('tools/tavern.mjs knows the station (its list check runs over STATIONS: the new row rides it)', /STATIONS/.test(tavTool) && /storyteller/.test(tavTool));

const bad = rows0.filter(r => !r.pass);
console.log(bad.length ? '\n' + bad.length + ' RED of ' + rows0.length : '\nall ' + rows0.length + ' ok');
process.exit(bad.length ? 1 : 0);
