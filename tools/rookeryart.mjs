/* tools/rookeryart.mjs - THE ROOKERY's ART PASS holds (claude/rookeryart). No browser (the sprites bake in the page: tools/rookery-probe.mjs and tools/rookeryart-shots.mjs look at them).
   The level's HASH is the greybox's (art lanes never change it), its art modules are wired in main.js, its harpies are reskinned, its bed and its two tracks are named and credited. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { levelHash } from './level-quality.mjs';
import * as A from '../src/audio.js';
const rd = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8'), main = rd('src/main.js'), lv = LEVELS.find(l => l.id === 'rookery'), L = lv.build();
const ok = (c, m) => { assert.ok(c, m); console.log('ok   ' + m); };
assert.equal(levelHash(lv), '3c07c53af25a', "the Rookery's level hash is not the greybox's (an art lane never changes it; claude/rookery3's extended Bone Stair is 3c07c53af25a - was 4ef21b8a02e5)"); console.log('ok   level hash is the extended greybox (3c07c53af25a, claude/rookery3)');
for (const f of ['rookery_pal', 'rookery_tiles', 'rookery_backdrop', 'rookery_world', 'rookery_foes', 'shriek_sisters_art']) ok(existsSync(new URL('../src/redraw/' + f + '.js', import.meta.url)), 'src/redraw/' + f + '.js exists');
ok(/RKT\.rkTile\(/.test(main) && /RKB\.drawBackdrop\(/.test(main) && /RKB\.drawNear\(/.test(main) && /RKW\.drawUpdraft\(/.test(main) && /RKF\.bakeShrieker\(\)/.test(main) && /RKF\.bakeCragHarpy\(\)/.test(main), 'main.js draws the tile kit, backdrop, near layer, updraft and bakes the two harpy sheets');
ok(L.reskin && L.reskin.harpy === 'cragharpy' && L.palette.fg === 'rookery', 'the crag harpies wear their own skin; the level has its own foreground strip');
ok(L.ambient.every(a => a.kind === 'rookery') && A.AMBIENT_NAMES.includes('rookery') && A.AMBIENT_SOURCES.rookery, "the level's air is its own bed ('rookery', synth)");
ok(L.arena.music === 'shrieksisters' && A.MUSIC_NAMES.includes('shrieksisters') && /Fato Shadow/.test(A.MUSIC_CREDITS.shrieksisters) && existsSync(new URL('../audio/shrieksisters.ogg', import.meta.url)), "THE SHRIEK SISTERS' fight has its own track, named and credited");
ok(/shrieksisters\.ogg/.test(rd('audio/CREDITS.txt')) && /shrieksisters/.test(rd('src/credits.js')), 'its credit is in audio/CREDITS.txt and the credits page');
if (L.music === 'rookery') ok(A.MUSIC_NAMES.includes('rookery') && /Icy Heights/.test(A.MUSIC_CREDITS.rookery) && statSync(new URL('../audio/rookery.ogg', import.meta.url)).size > 1e5, "THE ROOKERY's level track is named, credited and on disk");
const xp = JSON.parse(rd('tools/fixtures/campaign-xp.json')).rows; ok(xp.rookery && xp.rookery.run > 0, "tools/fixtures/campaign-xp.json has THE ROOKERY's row");
const fs = rd('src/forest-supports.js'), fa = rd('src/forest-supports-art.js'); ok(/rk: 1/.test(fs) && /drawRkPier/.test(fa), "its shelves stand on its own piers");
console.log('\nrookeryart: all green');
