/* tools/ship-fixes.mjs - the small SHIP FIXES (claude/shipfix, Daniel 10-11), each one thing a reviewer would notice:
 *   1. THE BERSERKER'S VOICE: setHeroVoice sent him to the knight's throat. Every hero HERO_KIT has a kit for is accepted by it (so the next hero cannot be forgotten).
 *   2. THE CREDITS PAGE names every CC0 author audio/CREDITS.txt names (voices, grunts, ambience, one-shots), not only Kenney / rubberduck / StumpyStrust.
 *   3. THE OPENING PANELS' file no longer calls its words a first draft.
 *   4. A REAL FAVICON: favicon.ico (16/32/48 PNG-in-ICO), the 32 px png, the app icons at their sizes; index.html links them, the manifest lists the icons that exist.
 *   5. THE BUILD LINE: 'BATCH 86 - 11 OCT' from docs/updates.json (+ the sha when the release stamped src/build.js).
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { SFX_CREDIT_NAMES, creditPages } from '../src/credits.js';
import { setUpdates, versionLine } from '../src/whatsnew.js';
import { BUILD } from '../src/build.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url)), rd = f => readFileSync(join(ROOT, f), 'utf8');

const audio = rd('src/audio.js'), kit = /const HERO_KIT = \{([^\n]*?)\};/.exec(audio), voice = /export function setHeroVoice\(h\) \{([^\n]*)\}/.exec(audio);
assert.ok(kit && voice, 'HERO_KIT and setHeroVoice are where this check expects them');
const heroes = [...kit[1].matchAll(/(?:^|[,{ ])(\w+): \{ kit:/g)].map(m => m[1]); assert.ok(heroes.length >= 8 && heroes.includes('berserker'), 'HERO_KIT lists the heroes: ' + heroes);
for (const h of heroes.filter(h => h !== 'knight')) assert.ok(voice[1].includes("'" + h + "'"), 'setHeroVoice does not know ' + h + ': he would speak with the knight\'s voice');
console.log('ok  1 voices       setHeroVoice accepts all ' + heroes.length + ' heroes in HERO_KIT, the Berserker among them');

const CC0 = ['artisticdude', 'HaelDB', 'cicifyre', 'thebardofblasphemy', 'Badre-Eddine', 'Ogrebane', 'Rango Mango', 'wolfwoot', 'ArcadeParty', 'Exewin', 'StarNinjas', 'RandomMind', 'Zane Little Music', 'jasinski', 'Independent.nu', 'qubodup', 'Dan Knoflicek', 'Kenney', 'rubberduck', 'StumpyStrust'];
const txt = rd('audio/CREDITS.txt').toLowerCase(), listed = creditPages({}).filter(p => p.kind === 'names').flatMap(p => p.names);
for (const n of CC0) { assert.ok(txt.includes(n.toLowerCase()), n + ' is not in audio/CREDITS.txt (the list drifted)'); assert.ok(listed.includes(n), n + ' is not on the in-game credits page'); }
assert.ok(creditPages({}).filter(p => p.kind === 'names').every(p => p.names.length <= 16), 'a names page holds at most 16');
console.log('ok  2 credits      ' + CC0.length + ' CC0 sound authors on the credits page, each also in audio/CREDITS.txt (' + SFX_CREDIT_NAMES.length + ' in SFX_CREDIT_NAMES)');

assert.ok(!/first draft/i.test(rd('src/opening-panels.js')), 'the opening panels still call themselves a first draft');
console.log('ok  3 opening      no "first draft" in the opening panels');

const png = f => { const b = readFileSync(join(ROOT, f)); assert.deepEqual([...b.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], f + ' is a png'); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
for (const [f, s] of [['icons/icon-192.png', 192], ['icons/icon-512.png', 512], ['icons/icon-maskable-512.png', 512], ['icons/apple-touch-icon-180.png', 180], ['icons/favicon-32.png', 32]]) assert.deepEqual(png(f), [s, s], f + ' is ' + s + 'x' + s);
const ico = readFileSync(join(ROOT, 'favicon.ico')); assert.equal(ico.readUInt16LE(0), 0); assert.equal(ico.readUInt16LE(2), 1, 'an icon file'); const n = ico.readUInt16LE(4); assert.ok(n >= 2, 'favicon.ico holds several sizes');
for (let i = 0; i < n; i++) { const off = ico.readUInt32LE(6 + 16 * i + 12), len = ico.readUInt32LE(6 + 16 * i + 8); assert.deepEqual([...ico.subarray(off, off + 4)], [137, 80, 78, 71], 'entry ' + i + ' is a png'); assert.ok(off + len <= ico.length); }
const html = rd('index.html'); assert.match(html, /rel="icon" href="\.\/favicon\.ico"/, 'index.html links favicon.ico'); assert.match(html, /icons\/favicon-32\.png/);
const man = JSON.parse(rd('manifest.webmanifest')); for (const i of man.icons) assert.ok(existsSync(join(ROOT, i.src)), 'the manifest lists ' + i.src + ' and it exists');
assert.ok(!/16-bit platformer: a knight/.test(man.description), 'the manifest description is current');
console.log('ok  4 favicon      favicon.ico (' + n + ' sizes) + png icons at their sizes, linked from index.html, listed in the manifest');

setUpdates([{ date: '2026-10-11', batch: 86, lines: ['x'] }, { date: '2026-10-09', batch: 80, lines: ['y'] }]);
assert.equal(versionLine(), 'BATCH 86 - 11 OCT'); assert.equal(versionLine('abcdef0123'), 'BATCH 86 - 11 OCT abcdef0'); assert.equal(typeof BUILD.sha, 'string');
setUpdates([]); assert.equal(versionLine(), '', 'no list loaded: nothing is drawn');
console.log('ok  5 build line   BATCH n - DATE from docs/updates.json, plus the short sha when stamped');
