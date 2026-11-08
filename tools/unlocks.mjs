// tools/unlocks.mjs - THE UNLOCKS SCREEN and THE PLAIN LOCK WORDS (claude/unlocks, Daniel 11-07). Node only: no page, no browser (reads the sources, imports src/unlocks.js, src/level.js, src/demo-slots.js).
//   words    'BEAT KING GORM WITHOUT DYING' everywhere (no 'FALLING' / 'FELL' jargon left in a lock line); every lock line of every real level, every hero's how-to, every feat row WRAPS inside the box it is drawn in
//   rows     the four tabs' rows (name, how, progress, tick); Gorm's progress ('beaten, but you died - try again'); a hidden hero / secret says nothing it should not
//   demo     under the demo flag only demo-slice items (levels in DEMO_IDS, the five demo heroes via PICK, smith rows by level); with it off, everything
//   layout   a selected row is always wholly inside the view (fixTop), the screen state machine (tabs wrap, rows wrap, back closes), the draw runs for every tab and puts no text outside the panel
//   wiring   the title row, the pause row, the inn's board (stations + art list), the map strip wrapped (no fitText on a lock line), the demo-cut pin
import fs from 'fs';
import * as UL from '../src/unlocks.js';
import { LEVELS } from '../src/level.js';
import { DEMO_IDS } from '../src/demo-slots.js';
import { STATIONS, TAVERN_ART } from '../src/tavern.js';
import { PAUSE_ROWS } from '../src/ui-hud.js';
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const read = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const main = read('src/main.js');

/* the game's wrap, with a conservative width: six px a character at size 6 (src/hero-roster.js: 'size 6, 320 wide: six a character') */
const ink = s => String(s).length * 6 - 1;
function wrap(s, maxW) { const words = String(s).split(' '), lines = []; let cur = ''; let longest = 0;
  for (let w of words) { while (!cur && ink(w) > maxW && w.length > 1) { let n = w.length - 1; while (n > 1 && ink(w.slice(0, n)) > maxW) n--; lines.push(w.slice(0, n)); w = w.slice(n); }
    const t = cur ? cur + ' ' + w : w; if (ink(t) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines; }
const MAP_W = 148 - 10, SWAP_W = 320 - 8 - 12 - 12, VW = 320, VH = 180, ROW_W = VW - 8 - 18 - 12, TIP_W = VW - 12;
const fmt = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
const nameOf = id => (LEVELS.find(l => l.id === id) || { name: String(id).toUpperCase() }).name;
const H = { nameOf, fmt, medalsFor: () => [300, 450, 660], killPct: () => 0 };

console.log('words');
ok(UL.GORM_WANT === 'BEAT KING GORM WITHOUT DYING', 'the Gorm lock reads BEAT KING GORM WITHOUT DYING');
ok(/const gormWant = \(\) => UL\.GORM_WANT;/.test(main), 'main.js gormWant is that constant');
{ const bad = []; for (const f of fs.readdirSync(new URL('../src', import.meta.url)).filter(f => f.endsWith('.js'))) { const t = read('src/' + f); for (const m of t.match(/'[^'\n]*'|"[^"\n]*"/g) || []) if (/WITHOUT FALLING|FELL TO GORM|PUT DOWN \d|ONE LIFE, BOTH PHASES|SOMETHING IS STILL OWED/.test(m)) bad.push(f + ' ' + m.slice(0, 60)); }
  ok(!bad.length, 'no jargon lock line left in any string of src/ (WITHOUT FALLING, FELL TO GORM, ONE LIFE, PUT DOWN n, STILL OWED)' + (bad.length ? ': ' + bad[0] : '')); }

console.log('every real level: the lock line wraps in every box it is drawn in');
const prog0 = {}, progs = [{}, { kings: { cleared: true } }, { burningOpen: 1, kings: { cleared: true }, stockade: { cleared: true, best: 123 } }, { lostBanners: { fields: 1 } }, { votive: { v1: 1 } }];
let n = 0, maxMap = 0, maxTip = 0, maxRow = 0;
for (const lv of LEVELS) { if (lv.retired || (lv.hidden && !lv.secret)) continue;
  for (const pr of progs) { const r = UL.levelReq(lv, pr, H), how = UL.reqText(r), pg = UL.reqProgress(r); n++;
    const need = lv.needs ? nameOf(lv.needs) : '', strip = UL.stripLine(r, need, false);
    const w1 = wrap(how, MAP_W).length, w2 = wrap(strip, MAP_W).length, w3 = wrap('LOCKED: ' + how, TIP_W).length, w4 = wrap(pg, TIP_W).length, w5 = wrap(how, ROW_W).length, w6 = wrap(pg, ROW_W).length;
    maxMap = Math.max(maxMap, w1, w2); maxTip = Math.max(maxTip, w3 + w4); maxRow = Math.max(maxRow, w5, w6);
    if (w1 > 3 || w2 > 3) ok(false, lv.id + ': strip wraps to ' + Math.max(w1, w2) + ' lines (3 fit): ' + how);
    if (w3 > 2 || w4 > 1) ok(false, lv.id + ': road tip too tall: ' + how);
    if (w5 > 2 || w6 > 1) ok(false, lv.id + ': screen row too tall: ' + how + ' / ' + pg);
    if (/WITHOUT FALLING|FELL TO/.test(how + pg)) ok(false, lv.id + ': jargon: ' + how); } }
ok(!fails.some(f => /^[a-z_0-9]+: /.test(f)), n + ' level x save lock lines checked: the map strip needs at most ' + maxMap + ' of 3 lines, the road tip ' + maxTip + ' rows, a screen row ' + maxRow + ' lines');
{ const g = LEVELS.find(l => l.id === 'burning'), r = UL.levelReq(g, prog0, H);
  ok(r.kind === 'gorm' && UL.reqText(r) === 'BEAT KING GORM WITHOUT DYING', 'the Burning Village asks for Gorm, in plain words');
  ok(UL.reqProgress(r) === 'NOT BEATEN YET', 'Gorm unbeaten: ' + UL.reqProgress(r));
  ok(UL.reqProgress(UL.levelReq(g, { kings: { cleared: true } }, H)) === 'BEATEN, BUT YOU DIED - TRY AGAIN', 'Gorm beaten but you died (Kingswood cleared, the road shut): try again');
  ok(UL.reqProgress(UL.levelReq(g, { kings: { cleared: true }, burningOpen: 1 }, H)) === 'DONE', 'Gorm beaten clean: done');
  ok(wrap(UL.GORM_WANT, MAP_W).length === 2, 'the Gorm line takes two lines on the map panel (it was cut to WITHOUT FA...): ' + wrap(UL.GORM_WANT, MAP_W).join(' | '));
  ok(UL.stripLine(r, 'THE STOCKADE', false) === 'CLEAR THE STOCKADE FIRST' && UL.stripLine(r, 'THE STOCKADE', true) === UL.GORM_WANT, 'the strip names the next step only'); }
{ const un = LEVELS.find(l => l.id === 'unburied'), h0 = UL.levelRow(un, '? ? ?', UL.levelReq(un, {}, H), false), h1 = UL.levelReq(un, { lostBanners: { fields: 1 } }, H);
  ok(UL.reqText(UL.levelReq(un, {}, H)) === 'A HIDDEN WAY. LOOK OFF THE ROAD.' && UL.reqProgress(UL.levelReq(un, {}, H)) === 'NOT FOUND YET' && !/BANNER|FIELD|WITCHLIGHT|HEXED|BURIAL/.test(h0.how + h0.progress), 'the hidden Unburied Field names nothing before its first banner');
  ok(UL.reqText(h1) === 'FIND ALL 3 LOST BANNERS' && UL.reqProgress(h1) === '1/3 LOST BANNERS', 'after one banner: ' + UL.reqText(h1) + ' / ' + UL.reqProgress(h1));
  const ch = LEVELS.find(l => l.id === 'church'), rc = UL.levelReq(ch, { votive: { v1: 1 } }, H);
  ok(/^LIGHT ALL 3 VOTIVE LAMPS IN /.test(UL.reqText(rc)) && UL.reqProgress(rc) === '1/3 VOTIVE LAMPS', 'the Lit Church (an openly priced secret): ' + UL.reqText(rc)); }

console.log('heroes');
{ const heroes = {};   /* the real feat words, read from src/main.js's HEROES lines (so a reworded rule is swept too) */
  for (const m of main.matchAll(/\{ id: '(\w+)', name: '([^']+)', price: (\d+), silver: true(?:, coinPrice: (\d+), coinNeeds: '(\w+)')?(?:, coinBoss: true)?(?:, feat: '([^']+)', featName: (?:p => SC\.featWords\('\w+', p, '([^']+)'\)|'([^']+)'))?/g)) heroes[m[1]] = { id: m[1], name: m[2], silver: +m[3], coin: +(m[4] || 0), coinLevel: m[5] ? nameOf(m[5]) : '', feat: m[7] || m[8] || null, hasFeat: !!m[6] };
  const berserkWin = /const BZ_WIN = \{ coinPrice: (\d+), coinNeeds: '(\w+)', coinBoss: true, feat: '([^']+)', featName: '([^']+)' \}/.exec(main);
  if (berserkWin) heroes.berserker = { id: 'berserker', name: 'THE BERSERKER', silver: 10, coin: +berserkWin[1], coinLevel: nameOf(berserkWin[2]), feat: berserkWin[4], hasFeat: true };
  ok(['reaper', 'paladin', 'pyro', 'berserker'].every(k => heroes[k]), 'the sweep read the locked heroes out of main.js: ' + Object.keys(heroes).join(','));
  for (const h of Object.values(heroes)) for (const owned of [false, true]) for (const hidden of [false, true]) for (const featDone of [false, true]) {
    const f = { ...h, owned, hidden: hidden && ['reaper', 'paladin'].includes(h.id), featDone, starter: false }, how = UL.heroHow(f), pg = UL.heroProgress(f), row = UL.heroRow(f);
    if (wrap(how, SWAP_W).length > 2) ok(false, h.id + ': the swap panel needs 3+ lines: ' + how);
    if (wrap(how, ROW_W).length > 2 || wrap(pg, ROW_W).length > 1) ok(false, h.id + ': the screen row is too tall: ' + how);
    if (f.hidden && !owned && /UNBURIED|LIT CHURCH|BLOOD KNIGHT|PALADIN|BANNER|LAMP/.test(how + pg + row.name)) ok(false, h.id + ': an unfound secret hero names a place or himself: ' + how + ' / ' + row.name); }
  ok(!fails.some(f => /^[a-z]+: /.test(f)), 'every hero how-to wraps in two lines in the swap panel and the screen row; an unfound secret hero says no place and no name');
  const r = UL.heroHow({ ...heroes.reaper, hidden: false });
  ok(/^BEAT THE BLOOD KNIGHT IN THE UNBURIED FIELD, THEN BUY HIM: 10 SILVER OR 800 GOLD$/.test(r), 'the Blood Knight: ' + r);
  ok(/^BUY HIM AT THE STORE: 10 SILVER OR 800 GOLD \(GOLD ONLY AFTER THE BURNING VILLAGE\)$/.test(UL.heroHow({ ...heroes.pyro })), 'the Pyromancer: ' + UL.heroHow({ ...heroes.pyro }));
  ok(UL.heroHow({ starter: true }) === 'YOU START WITH HIM', 'a starter: free');
  ok(!/\(OR \d+ SILVER\)/.test(main) && /const swapWhy = k => \(!k \|\| !k\.id\) \? '' : UL\.heroHow\(heroFacts\(k\)\)/.test(main), 'the swap panel uses the plain how-to (no more "TO EARN IT (OR 10 SILVER)")');
  ok(/paladin: 'BEAT HIM IN THE LIT CHURCH, THEN BUY: 10 SILVER'/.test(read('src/hero-roster.js')), 'the hero pick card says to beat the Paladin first (it said BUY IN THE STORE)'); }

console.log('feats / skins / other');
ok(UL.featProgress('medals:15', { medals: 7 }) === '7 OF 15 MEDALS' && UL.featProgress('medals:15', { medals: 99 }) === '15 OF 15 MEDALS', 'medal progress: n OF N');
ok(UL.featProgress('boss:warcairn', { done: false }) === 'NOT BEATEN YET' && UL.featProgress('spore', { done: false }) === 'NOT CLEARED YET' && UL.featProgress('iron', { done: false }) === 'NOT DONE YET', 'feat progress words');
ok(UL.featLevel('boss:warcairn') === 'warcairn' && UL.featLevel('spore') === 'spore' && UL.featLevel('medals:30') === null && UL.featLevel('iron') === null, 'featLevel: the level a feat names (the demo filter reads it)');
{ const feats = [...main.matchAll(/featName: '([^']+)'/g)].map(m => m[1]);
  ok(feats.length >= 4 && feats.every(w => wrap(UL.featHow(w), ROW_W).length <= 2), feats.length + ' feat lines (skins, weapons, charm) wrap in two lines or fewer'); }
ok(!/clear a level in Iron Knight/.test(main), 'the Iron Knight feat names the setting and its rule');

console.log('demo filter');
{ const rowsL = LEVELS.filter(l => !l.retired && (!l.hidden || l.secret)).map(l => UL.levelRow(l, l.name, UL.levelReq(l, {}, H), false));
  const facts = { inSlice: id => { const lv = LEVELS.find(l => l.id === id); return !lv || DEMO_IDS.has(lv.id) || (lv.hidden && !lv.secret); },
    levels: rowsL, heroes: [{ name: 'A', how: '', progress: '', done: false, hero: 'knight' }],
    skins: [UL.perk('SPORE', 'x', 'y', false, { level: UL.featLevel('spore') }), UL.perk('AXES', 'x', 'y', false, { level: UL.featLevel('boss:warcairn') }), UL.perk('LAUREL', 'x', 'y', false, { level: UL.featLevel('medals:15') })],
    other: [UL.perk('SLOT 2', 'x', 'y', false), UL.perk('RUSH', 'x', 'y', false, { demoHide: true }), UL.perk('SMITH KINGS', 'x', 'y', false, { level: 'kings' }), UL.perk('SMITH SCREE', 'x', 'y', false, { level: 'scree' })] };
  const off = UL.buildTabs({ ...facts, demo: false }), on = UL.buildTabs({ ...facts, demo: true });
  ok(off.LEVELS.length === rowsL.length && off.SKINS.length === 3 && off.OTHER.length === 4, 'flag off: every row is listed (' + off.LEVELS.length + ' levels)');
  ok(on.LEVELS.length === 10 + 1 && on.LEVELS.every(r => DEMO_IDS.has(r.level)), 'flag on: only the ' + on.LEVELS.length + ' demo-slice levels (the 10 woods + the Burning Village + none past Kingswood): ' + on.LEVELS.map(r => r.level).join(','));
  ok(on.LEVELS.some(r => r.level === 'burning') && on.LEVELS.some(r => r.level === 'kings') && !on.LEVELS.some(r => r.level === 'scree'), 'flag on: Kingswood and the Burning Village stay, the Scree Path is gone');
  ok(on.SKINS.map(r => r.name).join() === 'SPORE,LAUREL' && on.OTHER.map(r => r.name).join() === 'SLOT 2,SMITH KINGS', 'flag on: a skin for a level past the slice, the boss rush and a smith row past the slice are gone: ' + on.SKINS.map(r => r.name) + ' / ' + on.OTHER.map(r => r.name));
  ok(on.HEROES.length === 1, 'flag on: the heroes tab is the caller\'s PICK list (main.js PICK is already the five demo heroes)'); }
ok(/const PICK = DS\.DEMO \? \['knight', 'warden', 'geomancer', 'ranger', 'pyro'\]/.test(main) && /heroes: PICK\.map\(/.test(main), 'main.js feeds the heroes tab from PICK (the demo five under the flag)');
ok(/const unlockDemo = \(\) => DS\.DEMO;/.test(main) && /\[\/\^DS\\\.DEMO\$\/, 'unlocks screen/.test(read('tools/demo-cut.mjs')), 'one new use of DS.DEMO in main.js, pinned in tools/demo-cut.mjs');

console.log('layout and the screen');
{ let bad = 0; for (let t = 0; t < 400; t++) { const hs = Array.from({ length: 1 + (t % 40) }, (_, i) => 12 + ((i * 7 + t * 3) % 23)), view = 60 + (t % 70), sel = (t * 5) % hs.length, top0 = (t * 3) % hs.length;
    const top = UL.fixTop(hs, sel, top0, view); let sum = 0; for (let i = top; i <= sel; i++) sum += hs[i]; if (top > sel || (top < sel && sum > view) || top < 0) bad++; }
  ok(bad === 0, 'fixTop: the selected row is always wholly in view (400 random lists), or alone when it is taller than the view'); }
{ const rows = Array.from({ length: 30 }, (_, i) => ({ name: 'ROW ' + i, how: 'BEAT THE THING IN THE PLACE AND THEN COME BACK AGAIN FOR THE OTHER ONE', progress: 'NOT BEATEN YET', done: i % 3 === 0 })), tabs = { LEVELS: rows, HEROES: rows.slice(0, 5), SKINS: [], OTHER: rows.slice(0, 2) };
  const texts = [], sfx = [], hits = []; const gStub = new Proxy({}, { get: (_, k) => k === 'canvas' ? {} : () => {}, set: () => true });
  const api = { g: () => gStub, VW: () => VW, VH: () => VH, time: () => 0, text: (s, x, y) => texts.push({ s, x, y }), panel: () => {}, hit: (x, y, w, h) => hits.push([x, y, w, h]), sfx: k => sfx.push(k), wrap: (s, w) => wrap(s, w), tabs: () => tabs };
  const U = UL.makeUnlocks(api);
  ok(!U.isOpen && U.input({ left: true }) === false, 'closed: it eats nothing'); U.open('title'); ok(U.isOpen && U.state.tab === 0, 'open: LEVELS first');
  U.input({ right: true }); ok(U.state.tab === 1, 'RIGHT: HEROES'); U.input({ right: true, }); U.input({ right: true }); U.input({ right: true }); ok(U.state.tab === 0, 'RIGHT x4 wraps back to LEVELS'); U.input({ left: true }); ok(U.state.tab === 3, 'LEFT from LEVELS wraps to OTHER');
  U.input({ right: true }); for (let i = 0; i < 31; i++) U.input({ down: true }); ok(U.state.sel[0] === 1, 'DOWN x31 over 30 rows wraps to row 1'); U.input({ up: true }); U.input({ up: true }); ok(U.state.sel[0] === 29, 'UP wraps to the last row');
  for (const t of [0, 1, 2, 3]) { U.state.tab = t; texts.length = 0; U.draw();
    const G = U.geo(), inside = texts.every(q => q.y >= G.y && q.y <= G.y + G.h - 4 && q.x >= 0 && q.x <= VW);
    ok(inside && texts.length > 3, 'tab ' + UL.TABS[t] + ': draws ' + texts.length + ' text lines, all inside the panel'); }
  U.state.tab = 2; texts.length = 0; U.draw(); ok(texts.some(q => q.s === UL.NOTHING), 'an empty tab says NOTHING HERE YET');
  U.state.tab = 0; U.state.sel[0] = 29; texts.length = 0; U.draw(); ok(texts.some(q => q.s === 'ROW 29'), 'the last row is on screen when selected (scrolled)');
  U.input({ back: true }); ok(!U.isOpen && sfx.includes('menuClose'), 'back closes it');
  ok(hits.length > 8, 'touch / mouse: tabs, rows, arrows and BACK are hit boxes (' + hits.length + ')'); }

console.log('wiring');
ok(/\["WHAT'S NEW", 'UNLOCKS', 'OPTIONS'\]/.test(main) && /k === 'UNLOCKS'\) \{ UNLOCK_OPEN\('title'\)/.test(main), 'the title menu has UNLOCKS (both the touch and the full list)');
ok(PAUSE_ROWS.includes('Unlocks') && PAUSE_ROWS.indexOf('Unlocks') > 4 && /k === 'Unlocks'\) \{ UNLOCK_OPEN\('pause'\)/.test(main), 'the pause menu has an Unlocks row after the first screen');
{ const s = STATIONS.find(q => q.id === 'unlocks'); ok(!!s && s.verb === 'UNLOCKS' && /UNLOCKS BOARD/.test(s.name), 'the inn has THE UNLOCKS BOARD station');
  ok(TAVERN_ART.some(a => a[0] === 'unlocks'), 'its art is on the ART list'); const xs = STATIONS.map(q => q.x); ok(xs.every((x, i) => i === 0 || x - xs[i - 1] >= 3), 'the stations stay 3+ tiles apart, west to east: ' + xs.join(','));
  ok(/openUnlocks: \(\) => UNLOCK_OPEN\('inn'\)/.test(main) && /s\.id === 'unlocks'\) \{ if \(api\.openUnlocks\)/.test(read('src/tavern.js')) && /TA\.unlocks\(g, at\('unlocks'\)/.test(read('src/tavern.js')) && /export function unlocks\(/.test(read('src/tavern-art.js')), 'the station opens the screen and is drawn'); }
ok(/if \(UNLUI\.isOpen\) \{ unlockFrame\(dt\); return; \}/.test(main) && /if \(UNLUI\.isOpen\) UNLUI\.draw\(\);/.test(main), 'the screen takes the frame and is drawn over everything');
ok(/detailH = 24;/.test(main) && /wrap\(lockLine\(nd\), MAP_PANEL_W - 10, 6\)\.forEach/.test(main) && !/fitText\(\(LEVELS\[nd\.level\]\.opensOn/.test(main), 'the map panel strip wraps the whole lock line (3 lines), no fitText');
{ const i = main.indexOf('mapTip.t > 0 && mapTip.id === child.id'), seg = main.slice(i, i + 1900); ok(!/fitText\(m, maxW, 6\)|fitText\(spurReqText/.test(seg) && /wrap\(m, maxW, 6\)/.test(seg) && /wrap\(spurReqText/.test(seg), 'the road tips wrap (they cut with fitText before)'); }
ok(/unlockHeroOwned = id =>/.test(main) && (main.match(/unlockHeroOwned\(/g) || []).length === 1, 'hero ownership is read in ONE function (unlockHeroOwned) - switch it when claude/heroroster2 lands');
if (fails.length) { console.log('\n' + fails.length + ' FAILED'); process.exit(1); } console.log('\nunlocks: all ok');
