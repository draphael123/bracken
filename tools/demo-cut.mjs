/* tools/demo-cut.mjs - THE DEMO CUT (claude/demoend, Daniel 11-03 18:45): the DEMO flag ends the game after King Gorm / Kingswood and locks everything past it; flag OFF is the full game.
   Node only, no page. Asserts:
     SLICE   the live `needs:` chain wood -> hornetsnest -> marsh -> fenroad -> stockade -> spore -> rootway -> underleaf -> palisadewood -> kings, the burning spur (opens on Gorm) and the arena yard are
             exactly the demo's levels (src/demo-slots.js DEMO_IDS); every one is reachable with the demo lock on (none is locked by it), in chain order
     LOCKED  every campaign level that is not in the slice - the Scree Path (needs kings) and everything after it, every other act, every secret - is demoLocked; a hidden shop / trial / tavern with no road is not
     END     the last boss of the slice is Kingswood and only Kingswood ends the demo; the road out of it (scree) is locked, so the card is the only way on
     OFF     with the flag off nothing is locked (demoLocked is false for every level), the flag is read from ?demo=1 only, DEMO_BUILD ships false, and a save that is not a demo save imports as the SAME STRING;
             every use of the flag in src/main.js is pinned (a new use must be added here on purpose, and must be of the form that is a no-op when off)
     NAMES   the new shipped file names carry no ad-block word (EasyList / EasyPrivacy: src/admiral.js stalled the load at 14%, 10-27) */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { DEMO_IDS } from '../src/demo-slots.js';
import * as F from '../src/demo-flag.js';
import { prepareImport, demoShaped, tag } from '../src/demo-save.js';

const byId = Object.fromEntries(LEVELS.map(l => [l.id, l]));
/* ---- SLICE ---- */
const CHAIN = ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings'];
CHAIN.forEach((id, i) => { assert.ok(byId[id], 'the chain level exists: ' + id); if (i) assert.equal(byId[id].needs, CHAIN[i - 1], id + ' needs ' + CHAIN[i - 1] + ' (the live chain moved: update the slice on purpose)'); });
assert.equal(byId.burning.opensOn && byId.burning.opensOn.level, 'kings', 'the Burning Village spur opens on Gorm (Kingswood)');
assert.deepEqual([...DEMO_IDS].sort(), [...CHAIN, 'burning', 'arena_yard', 'lesson'].sort(), 'DEMO_IDS is the chain + the spur + the arena yard + the roadside lesson');
for (const id of DEMO_IDS) assert.ok(byId[id], 'the demo level exists: ' + id);
console.log('ok  SLICE   ' + CHAIN.join(' > ') + ' + burning (spur) + arena_yard + lesson: the live needs chain');
/* ---- LOCKED (flag ON) ---- */
const on = lv => F.outOfSlice(lv);
const lockedIds = LEVELS.filter(on).map(l => l.id);
for (const id of DEMO_IDS) assert.equal(on(byId[id]), false, id + ' is in the slice and must not be locked');
for (const l of LEVELS) if (!DEMO_IDS.has(l.id) && (!l.hidden || l.secret)) assert.equal(on(l), true, l.id + ' is past the slice and must be locked');
for (const l of LEVELS) if (l.hidden && !l.secret && !DEMO_IDS.has(l.id)) assert.equal(on(l), false, 'hidden ' + l.id + ' (a shop / trial / tavern) stays reachable from the slice');
/* the road out of Kingswood: every level that needs (transitively) a locked level, and scree itself, is locked */
assert.equal(byId.scree.needs, 'kings'); assert.ok(on(byId.scree), 'the Scree Path (the road out of Kingswood) is locked');
let grew = true; const afterKings = new Set(['scree']);
while (grew) { grew = false; for (const l of LEVELS) if (l.needs && afterKings.has(l.needs) && !afterKings.has(l.id)) { afterKings.add(l.id); grew = true; } }
for (const id of afterKings) assert.ok(on(byId[id]), id + ' hangs off the road past Kingswood and must be locked');
console.log('ok  LOCKED  ' + lockedIds.length + ' campaign levels locked (the Scree Path and all after it, ' + afterKings.size + ' hang off it), ' + LEVELS.length + ' levels in all');
/* ---- END ---- */
assert.equal(F.DEMO_LAST, 'kings');
assert.equal(F.demoEndsHere('kings'), F.DEMO, 'demoEndsHere follows the flag');
const endsWith = (flag, id) => flag && id === F.DEMO_LAST;
assert.ok(endsWith(F.flagFrom('?demo=1'), 'kings') && !endsWith(true, 'palisadewood') && !endsWith(true, 'burning') && !endsWith(true, 'scree'), 'only Kingswood ends the demo');
console.log('ok  END     the last boss of the slice is King Gorm (kings); the card follows his win card');
/* ---- OFF ---- */
assert.equal(F.DEMO_BUILD, false, 'DEMO_BUILD ships false');
assert.equal(F.DEMO, false, 'no ?demo=1 in node: the flag is off');
for (const l of LEVELS) assert.equal(F.demoLocked(l), false, 'flag off: demoLocked(' + l.id + ') is false');
for (const s of ['', '?', '?demo=0', '?demo=', '?undemo=1', '?x=1&demo=10', '?dev=1']) assert.equal(F.flagFrom(s), false, 'flag off for "' + s + '"');
for (const s of ['?demo=1', '?x=1&demo=1', '?demo=1&x=2']) assert.equal(F.flagFrom(s), true, 'flag on for "' + s + '"');
assert.equal(F.flagFrom('', true), true, 'the build constant turns it on');
const full = JSON.stringify({ hero: 'knight', coins: 5, scree: { cleared: true }, hangingOpen: true, wood: { cleared: true } }, null, 2);
assert.equal(prepareImport(full, LEVELS), full, 'a save with no demo tag imports as the SAME STRING');
assert.equal(prepareImport('not json', LEVELS), 'not json', 'junk comes back for the importer to refuse');
assert.equal(demoShaped(JSON.parse(full), LEVELS), false, 'a full-game save (Scree cleared) is never tagged');
assert.equal(tag({ wood: { cleared: true } }, LEVELS).demoSave, 1); assert.equal(tag({ scree: { cleared: true } }, LEVELS).demoSave, undefined);
/* every use of the flag in src/main.js: pinned, each of the shape that is a no-op when the flag is off */
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const uses = main.split(/\r?\n/).flatMap((ln, i) => [...ln.matchAll(/\bDS\.(DEMO\b|demoLocked|demoEndsHere)[^;]{0,70}/g)].map(m => ({ i, t: m[0] })));
const PINNED = [
  [/^DS\.DEMO && DS\.demoLocked\(lv\)\) \|\|/, 'levelLocked: the lock first, then the full rule untouched'],
  [/^DS\.DEMO && DS\.demoLocked\(LEVELS\[to\]\)\) return false/, 'trnBegin: no walk-out to a locked wood'],
  [/^DS\.DEMO \? bossTable\(\)\.filter/, 'boss select: the slice only'],
  [/^DS\.DEMO \? \[\] : \['THE EDITOR'\]/, 'title: no editor'],
  [/^DS\.DEMO\) DSV\.tag\(PROG, LEVELS\)/, 'progDefaults: tag a demo save'],
  [/^DS\.demoEndsHere\(LEVELS\[levelIndex\]\.id\) \? -1 : partyNextLevel\(\)/, 'win card: no party-next past Gorm'],
  [/^DS\.demoEndsHere\(LEVELS\[levelIndex\]\.id\) && !bossSelectFight/, 'win card: the end card'],
  [/^DS\.DEMO \? \['knight'/, 'hero pick: the five demo heroes'],
  [/^DS\.DEMO \? HEROES\.filter/, 'store: the HEROES rows are the demo five'],
  [/^DS\.DEMO\) DEND\.mapCaption/, 'map: the road-continues caption'],
  [/^DS\.demoLocked\(lv\)\)/, 'map header counters: the slice only (smallfix14)'],
  [/^DS\.DEMO \? MUSIC_NAMES/, 'sound test: only the shipped tracks (smallfix14)'],
  [/^DS\.DEMO && nd\.y < WOOD_Y/, 'demohide: demoOut - the map shows the wood sheet only'],
  [/^DS\.DEMO \? WOOD_Y : 0/, 'demohide: MAP_TOP - the camera stops at the wood sheet'],
  [/^DS\.DEMO$/, 'demohide: MAP_BAKE_ALL - the demo bakes the wood sheet and no road out of it'],
  [/^DS\.DEMO \? WOOD_PATH\.length : PATH\.length/, 'demohide: the dotted unwalked road stops at Kingswood'],
  [/^DS\.demoLocked\(lv\)$/, 'demohide: sliceLv - slot / hero card / title counts are the slice'],
  [/^DS\.DEMO\) \{ g\.fillStyle = 'rgba\(10,8,20/, 'demoend2 DEVOFF: the FPS / UPDATE / DRAW readout is not drawn in the demo, whatever SET.fps says'],
  [/^DS\.DEMO \|\| !SET\.boxes/, 'demoend2 DEVOFF: no hitbox overlay in the demo, whatever SET.boxes says'],
  [/^DS\.DEMO\b/, 'title: no boss rush'],
];
const left = uses.slice();
for (const [re, why] of PINNED) { const k = left.findIndex(u => re.test(u.t)); assert.ok(k >= 0, 'pinned use missing: ' + why + ' | have: ' + uses.map(u => u.t).join(' || ')); left.splice(k, 1); }
assert.equal(left.length, 0, 'an unpinned use of the demo flag in src/main.js (add it to tools/demo-cut.mjs on purpose): ' + left.map(u => 'L' + (u.i + 1) + ' ' + u.t).join(' | '));
console.log('ok  OFF     flag off = nothing locked, untagged saves import as the same string, ' + uses.length + ' pinned uses of the flag in main.js');
/* ---- MENUS + CAPTION (batch143, demoend Q4) ---- */
assert.deepEqual([...F.DEMO_HEROES].sort(), ['geomancer', 'knight', 'pyro', 'ranger', 'warden'], 'the demo shows five heroes: the four free starters + the Pyromancer (her duel is in the Burning Village)');
{ const { mapCaption } = await import('../src/demo-end.js'), { MAP_CAPTION } = await import('../src/demo-end-config.js'); const drawn = [];
  const g = { fillStyle: '', fillRect() {} }, say = (...a) => drawn.push(a[0]), w = s => s.length * 6;
  mapCaption(g, say, w, 320, 0, 'wood', false); assert.equal(drawn.length, 0, 'no caption on an open wood');
  mapCaption(g, say, w, 320, 0, 'kings', false); assert.deepEqual(drawn, [MAP_CAPTION], 'the caption shows at Kingswood, the end of the demo road'); assert.equal(MAP_CAPTION, 'THE ROAD ENDS HERE... FOR NOW'); }
console.log('ok  MENUS   five demo heroes (pick + store rows), the map caption at Kingswood');
/* ---- HIDE (demohide, Daniel 11-07: the demo HIDES the other levels) ----
   the demo's map is the WOOD sheet alone (main.js demoOut: every node with y < WOOD_Y is not shown). So every node on the wood sheet must be a slice level or a store, and no node on any other sheet may be a slice level. */
{ const at = main.indexOf('const WOOD_NODES = ['), cr = main.indexOf('const CRAG_NODES = ['), nn = main.indexOf('const NODES = WOOD_NODES');
  assert.ok(at > 0 && cr > at && nn > cr, 'the node tables are where demohide expects them');
  const ids = (a, b) => [...main.slice(a, b).matchAll(/\{ id: '(\w+)', kind: '(level|store)'/g)].map(m => [m[1], m[2]]);
  const wood = ids(at, cr), other = ids(cr, nn);
  assert.ok(wood.length >= 12 && other.length > 20, 'the sheets were found (' + wood.length + ' wood, ' + other.length + ' other nodes)');
  for (const [id, kind] of wood) assert.ok(kind === 'store' || DEMO_IDS.has(id), 'wood-sheet node ' + id + ' is not in the slice: demohide would show it');
  for (const [id, kind] of other) assert.ok(kind === 'store' || !DEMO_IDS.has(id), 'slice level ' + id + ' sits on a sheet demohide hides');
  assert.ok(/const demoOut = nd => DS\.DEMO && nd\.y < WOOD_Y;/.test(main) && /const nodeSecret = nd => demoOut\(nd\) \|\|/.test(main), 'nodeSecret starts with demoOut (the panel, the steps, the draw and the taps all skip a secret node)');
  console.log('ok  HIDE    ' + wood.length + ' wood-sheet nodes are the slice (+ stores), ' + other.length + ' nodes on the other sheets are hidden by the flag'); }
/* ---- LOCKDOWN (demolock, Daniel 11-07): no God mode / Unlock all levels in the demo; a saved ON does nothing; the file is written back unchanged ---- */
{ const SU = await import('../src/settings-ui.js');
  for (const id of SU.TABS.map(t => t.id)) for (const from of ['title', 'play']) { const rows = SU.tabRows(id, from, true); for (const k of ['God mode', 'Unlock all levels']) assert.ok(!rows.includes(k), 'demo: no ' + k + ' row on tab ' + id); }
  const gp = SU.tabRows('gameplay', 'title', false); assert.ok(gp.includes('God mode') && gp.includes('Unlock all levels'), 'flag off: both rows are listed, as ever');
  assert.deepEqual(SU.tabRows('gameplay', 'title', true), gp.filter(k => k !== 'God mode' && k !== 'Unlock all levels' && !SU.DEMO_DEV_ROWS.includes(k)), 'demo: the gameplay list is the full one minus those two rows and the dev rows');
  const saved = { invincible: true, allLevels: true, music: false }, on = { ...saved, hudV2: 1 }, keep = {};
  SU.demoLock(on, saved, keep, true); assert.equal(on.invincible, false); assert.equal(on.allLevels, false); assert.equal(on.music, false, 'other settings are untouched');
  const out = SU.demoSaveOut(on, keep, true); assert.equal(out.invincible, true, 'the saved God mode is written back as it was'); assert.equal(out.allLevels, true); assert.equal(on.invincible, false, 'the live setting is not mutated by the write');
  const none = {}, on2 = { music: true }; SU.demoLock(on2, { music: true }, none, true); assert.ok(!('invincible' in SU.demoSaveOut(on2, none, true)), 'a demo never adds the two keys to a file that had none');
  const full = { invincible: true, allLevels: true }, k2 = {}; SU.demoLock(full, { invincible: true, allLevels: true }, k2, false); assert.equal(full.invincible, true); assert.equal(SU.demoSaveOut(full, k2, false), full, 'flag off: SET is written as it is');
  assert.ok(SU.rowHidden('God mode', true) && SU.rowHidden('Unlock all levels', true) && !SU.rowHidden('God mode', false) && !SU.rowHidden('Music', true));
  assert.ok(main.includes('SETUI.demoLock(SET, o, DEMO_KEEP)') && main.includes('SETUI.demoSaveOut(SET, DEMO_KEEP)'), 'main.js: readSettings locks, saveSettings writes the kept values');
  assert.ok(main.includes("k === 'Unlock all levels' && !SETUI.rowHidden(k)") && main.includes("k === 'God mode' && !SETUI.rowHidden(k)"), 'main.js: the handlers refuse the two rows in the demo');
  assert.ok(readFileSync(new URL('../src/settings-ui.js', import.meta.url), 'utf8').includes("'Unlock everything' && !isDev()"), 'Unlock everything stays ?dev=1-only');
  console.log('ok  LOCK    demo settings: no God mode / Unlock all levels rows, saved ON ignored, file written back unchanged; flag off unchanged'); }
/* ---- DEVOFF (demoend2, Daniel 11-07): no developer readouts or rows in the demo; a saved value is ignored at the draw, never rewritten ---- */
{ const SU = await import('../src/settings-ui.js');
  for (const id of SU.TABS.map(t => t.id)) for (const from of ['title', 'play']) { const rows = SU.tabRows(id, from, true); for (const k of SU.DEMO_DEV_ROWS) assert.ok(!rows.includes(k), 'demo: no ' + k + ' row on tab ' + id); }
  const dsp = SU.tabRows('display', 'title', false), gp = SU.tabRows('gameplay', 'title', false);
  assert.ok(dsp.includes('FPS counter') && gp.includes('Hitboxes') && gp.includes('- TESTING -'), 'flag off: the dev rows are listed as ever');
  assert.deepEqual(SU.tabRows('display', 'title', true), dsp.filter(k => k !== 'FPS counter'), 'demo: the display list is the full one minus FPS counter');
  assert.deepEqual(SU.tabRows('gameplay', 'title', true), gp.filter(k => !SU.DEMO_DEV_ROWS.includes(k) && !SU.DEMO_HIDDEN_ROWS.includes(k)), 'demo: the gameplay list is the full one minus the dev rows and the two lock rows');
  assert.ok(SU.devRowHidden('FPS counter', true) && !SU.devRowHidden('FPS counter', false) && !SU.devRowHidden('Music', true));
  assert.ok(main.includes('SET.fps && !DS.DEMO') && !/if \(SET\.fps\) \{ g\.fillStyle/.test(main), 'main.js: the readout draw is gated on the flag; no ungated draw is left');
  console.log('ok  DEVOFF  demo settings: no FPS counter / Hitboxes / TESTING rows, the FPS readout and hitbox overlay gated on the flag at the draw (saved values untouched); flag off unchanged'); }
/* ---- END CARD 2 (demoend2): the teaser vignettes and the blank-safe follow button ---- */
{ const TZ = await import('../src/demo-teaser.js'), CFG = await import('../src/demo-end-config.js'), DE = await import('../src/demo-end.js');
  assert.equal(TZ.SCENES.length, 5, 'five teaser vignettes'); assert.deepEqual(TZ.SCENES.map(x => x.label), ['THE BURIED CITY', 'HIGHCROWN', 'THE LONG WATER', 'THE DRAKE', 'THE DEMON KING']);
  const ids = new Set();
  for (const sc of TZ.SCENES) { assert.ok(!ids.has(sc.id), 'unique scene id ' + sc.id); ids.add(sc.id); assert.ok(/^[A-Z' ]+$/.test(sc.label), 'caption charset (pixel font): ' + sc.label);
    const a = TZ.bake(sc.id), b = TZ.bake(sc.id); assert.equal(a.px.length, TZ.W * TZ.H * 4); assert.ok(Buffer.from(a.px).equals(Buffer.from(b.px)), sc.id + ' bakes the same bytes every time');
    let opaque = 0; const cols = new Set(); for (let i = 0; i < a.px.length; i += 4) { if (a.px[i + 3] === 255) opaque++; cols.add(a.px[i] << 16 | a.px[i + 1] << 8 | a.px[i + 2]); }
    assert.equal(opaque, TZ.W * TZ.H, sc.id + ' paints every pixel'); assert.ok(cols.size >= 8 && cols.size <= 400, sc.id + ' is a real picture, not a flat fill (' + cols.size + ' colours)'); }
  assert.throws(() => TZ.bake('nope'), /no such teaser scene/);
  assert.equal(CFG.FOLLOW_URL, '', 'no itch page yet: FOLLOW_URL ships blank (Daniel fills it)'); assert.equal(DE.followUrlOk(), false, 'blank URL: no live follow button');
  for (const bad of ['', 'http://x.io/a', 'javascript:alert(1)', 'https://', 'https://a b', 'itch.io/x']) assert.equal(DE.followUrlOk(bad), false, 'refused: "' + bad + '"');
  assert.equal(DE.followUrlOk('https://someone.itch.io/thornroad'), true);
  const src = readFileSync(new URL('../src/demo-end.js', import.meta.url), 'utf8');
  assert.ok(src.includes('b.disabled = true') && src.includes('CFG.SOON_BTN') && src.includes("window.open(u, '_blank', 'noopener,noreferrer')"), 'blank: a shut COMING SOON button; set: opens noopener');
  assert.ok(src.includes('KEEP YOUR PROGRESS') && src.includes('H.keep()') && src.includes('H.feedback()') && src.includes('H.credits()'), 'KEEP YOUR PROGRESS / GIVE FEEDBACK / CREDITS are still wired');
  assert.ok(!/<img|\.png|\.jpg|fetch\(/.test(readFileSync(new URL('../src/demo-teaser.js', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')), 'the vignettes ship as code: no image file, no fetch');
  console.log('ok  CARD2   5 baked vignettes (deterministic, fully painted), follow button shut + blank-safe until FOLLOW_URL is an https address'); }
/* ---- NAMES ---- */
const NEW_FILES = ['src/demo-flag.js', 'src/demo-save.js', 'src/demo-end.js', 'src/demo-end-config.js', 'src/demo-teaser.js', 'tools/demo-cut.mjs', 'tools/demo-save-carry.mjs'];
const ADBLOCK = /(^|[^a-z])(ad|ads|adv|advert|admiral|banner|sponsor|track|tracker|tracking|analytics|beacon|pixel|promo|popup|affiliate|click|stats)([^a-z]|$)/i;
for (const f of NEW_FILES) { const base = f.split('/').pop().replace(/\.m?js$/, ''); assert.ok(!ADBLOCK.test(base), 'ad-block word in ' + f); }
const shipped = readFileSync(new URL('../src/demo-end.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/demo-save.js', import.meta.url), 'utf8');
assert.ok(!/analytics|googletag|doubleclick|gtag\(/.test(shipped), 'no analytics code');
console.log('ok  NAMES   ' + NEW_FILES.map(f => f.split('/').pop()).join(', ') + ': no ad-block word');
console.log('demo-cut: all green');
