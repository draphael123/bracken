// tools/audio-mix.mjs - THE MIX CHECK (claude/audiocombat). Static, no browser, a few seconds (+ ~20 s of ffmpeg when it is installed).
//   1. every pool a file('x') call or a REC row names exists in audio/manifest.json, and every file the manifest lists exists on disk
//   2. the mix constants are sane (voice cap <= 24 and each category cap <= the global, the duck is -1..-6 dB and shorter than 300 ms, one trim per category)
//   3. LOUDNESS STANDARD: every pool this lane added (sw_ blk_ bd_ ld_ + the clang/crack/stone/slam growth) measures mean -30..-14 dB (-18 is the target; hard transients such as rock and wood breaks level lower before their peak limits) and no clipping (decoded peak <= 0 dBFS; the builds aim at -1 and vorbis overshoots)
//      (skipped, with a note, if ffmpeg is not on the PATH)
//   node tools/audio-mix.mjs [--all]   (--all measures every pool in the manifest and prints the loudest and quietest)
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const rd = f => readFileSync(join(ROOT, f), 'utf8');
const man = JSON.parse(rd('audio/manifest.json'));
const src = rd('src/audio.js');
const A = await import('../src/audio.js');
const problems = [];
// 1
for (const m of src.matchAll(/\bfile\('([\w]+)'[,)]/g)) if (!man[m[1]]) problems.push("file('" + m[1] + "') names a pool that is not in audio/manifest.json");
for (const m of src.matchAll(/\bp: '([\w]+)'/g)) if (!man[m[1]]) problems.push("REC row names pool '" + m[1] + "' that is not in audio/manifest.json");
for (const [pool, list] of Object.entries(man)) for (const f of list) if (!existsSync(join(ROOT, f))) problems.push(pool + ' -> ' + f + ' is missing on disk');
// 2
const C = A.MIX_CAP, D = A.DUCK, T = A.SFX_TRIM;
if (!(C.all > 0 && C.all <= 24)) problems.push('MIX_CAP.all must be 1..24');
for (const k of ['combat', 'voice', 'foley']) if (!(C[k] > 0 && C[k] <= C.all)) problems.push('MIX_CAP.' + k + ' must be 1..all');
const db = 20 * Math.log10(D.depth); if (!(db <= -1 && db >= -6)) problems.push('DUCK.depth is ' + db.toFixed(1) + ' dB, want -1..-6');
if (!(D.hold + D.release * 3 < 0.4)) problems.push('DUCK is longer than ~0.4 s');
for (const k of ['combat', 'voice', 'foley', 'other', 'amb', 'ui']) if (!(T[k] > 0 && T[k] <= 2)) problems.push('SFX_TRIM.' + k + ' missing or out of range');
for (const n of ['sw_blade', 'blk_clash', 'bd_flesh', 'bd_heavy', 'bd_plate', 'bd_stone', 'bd_wood', 'ld_jump']) if (A.catOf(n) === 'other') problems.push('catOf(' + n + ') fell through to other');
for (const n of ['swingUp', 'block', 'blockHeavy', 'parry', 'land', 'impact', 'pLand', 'pHurt']) if (typeof A.SFX[n] !== 'function') problems.push('SFX.' + n + ' missing');
// 3
const ff = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
let measured = 0;
if (ff.status !== 0) console.log('ffmpeg not found: loudness pass skipped');
else {
  const mine = /^(sw_blade|blk_clash|bd_flesh|bd_heavy|bd_plate|bd_stone|bd_wood|ld_jump)_\d+\.ogg$/, grown = /^(clang2|crack2|stone2|slam2)_\d+\.ogg$/;
  const all = process.argv.includes('--all'), rows = [];
  const files = new Set(); for (const list of Object.values(man)) for (const f of list) { const b = f.split('/').pop(); if (all || mine.test(b) || grown.test(b)) files.add(f); }
  for (const f of files) {
    const vd = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', join(ROOT, f), '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const mean = parseFloat((/mean_volume: (-?[\d.]+)/.exec(vd) || [])[1]), max = parseFloat((/max_volume: (-?[\d.]+)/.exec(vd) || [])[1]); measured++;
    rows.push({ f, mean, max });
    if (!all || mine.test(f.split('/').pop()) || grown.test(f.split('/').pop())) { if (!(mean >= -30 && mean <= -14)) problems.push(f + ' mean ' + mean + ' dB is outside -30..-14'); if (!(max <= 0.1)) problems.push(f + ' peak ' + max + ' dBFS is above +0.1 (clipped)'); }
  }
  if (all) { rows.sort((a, b) => b.mean - a.mean); console.log('loudest:', rows.slice(0, 5).map(r => r.f.split('/').pop() + ' ' + r.mean).join(', ')); console.log('quietest:', rows.slice(-5).map(r => r.f.split('/').pop() + ' ' + r.mean).join(', ')); }
}
console.log('audio-mix: ' + Object.keys(man).length + ' pools, ' + measured + ' files measured, ' + problems.length + ' problem(s)');
for (const p of problems.slice(0, 40)) console.log('  PROBLEM: ' + p);
process.exit(problems.length ? 1 : 0);
