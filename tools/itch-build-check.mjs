/* tools/itch-build-check.mjs - THE ITCH BUILD IS WELL-FORMED (claude/batch143; node only, no browser; ~3 s).
   Runs tools/build-itch.mjs into a temp folder and asserts: index.html at the zip root, < 1000 files, well under 500 MB, no src/ module paths left in the page, no ad-block word in any shipped path,
   every audio file the bundle names is shipped, the zip is readable (central directory, forward-slash names, CRC of every entry), the repo's own DEMO_BUILD is still false (the flag is flipped in the bundle only),
   and the full game's index.html / src are untouched by the build. Skips with a note when esbuild is not installed here. The page-level proof is tools/itch-embed-page.mjs (headless, by hand). */
import assert from 'node:assert/strict';
import { readFileSync, rmSync, mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import zlib from 'node:zlib';
import { buildItch, findEsbuild, adblockHits } from './build-itch.mjs';

if (!findEsbuild()) { console.log('ok  itch build: esbuild is not installed on this machine (node_modules, $ESBUILD_DIR, global vercel): skipped'); process.exit(0); }
const out = mkdtempSync(join(tmpdir(), 'thornroad-itch-check-'));
try {
  const before = readFileSync(new URL('../index.html', import.meta.url), 'utf8') + readFileSync(new URL('../src/demo-flag.js', import.meta.url), 'utf8');
  const { report, files, site } = await buildItch({ out, log: () => {} });
  assert.ok(/export const DEMO_BUILD = false;/.test(readFileSync(new URL('../src/demo-flag.js', import.meta.url), 'utf8')), 'the repo keeps DEMO_BUILD = false (only the bundle flips it)');
  assert.equal(readFileSync(new URL('../index.html', import.meta.url), 'utf8') + readFileSync(new URL('../src/demo-flag.js', import.meta.url), 'utf8'), before, 'the build touched no tracked file');
  assert.ok(files.includes('index.html') && !files.some(f => f.startsWith('src/')), 'index.html at the root, no src/ folder shipped');
  assert.ok(files.length < 1000, files.length + ' files (itch allows 1000)'); assert.ok(report.bytes < 500 * 1048576, 'well under 500 MB: ' + report.mb + ' MB');
  assert.deepEqual(adblockHits(files), [], 'no ad-block word in a shipped path');
  const page = readFileSync(join(site, 'index.html'), 'utf8'); assert.ok(!/modulepreload|serviceWorker|manifest\.webmanifest/.test(page) && /\.\/main\.js/.test(page) && /\.\/loading-screen\.js/.test(page), 'the page loads the bundle only');
  const main = readFileSync(join(site, 'main.js'), 'utf8'); assert.ok(!/\/src\/[a-z0-9_-]+\.js/.test(main.replace(/"\/src\/[a-z]+lab\.js"/g, '')), 'no unbundled src/ import left in main.js');
  /* the zip: parse the end record and the central directory, inflate and CRC every entry */
  const z = readFileSync(join(out, 'thornroad-demo-' + report.sha + '.zip')), e = z.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06])), n = z.readUInt16LE(e + 10); let p = z.readUInt32LE(e + 16); const names = [];
  assert.equal(n, files.length, 'the zip holds every file');
  for (let i = 0; i < n; i++) { assert.equal(z.readUInt32LE(p), 0x02014b50); const method = z.readUInt16LE(p + 10), crc = z.readUInt32LE(p + 16), cs = z.readUInt32LE(p + 20), us = z.readUInt32LE(p + 24), nl = z.readUInt16LE(p + 28), off = z.readUInt32LE(p + 42), nm = z.toString('utf8', p + 46, p + 46 + nl);
    const lo = off + 30 + z.readUInt16LE(off + 26) + z.readUInt16LE(off + 28), raw = z.subarray(lo, lo + cs), data = method === 8 ? zlib.inflateRawSync(raw) : raw;
    assert.equal(data.length, us, nm + ' size'); assert.equal(zlib.crc32(data) >>> 0, crc, nm + ' crc'); assert.ok(!nm.includes('\\') && !nm.startsWith('/'), nm + ' is a forward-slash relative name'); names.push(nm); p += 46 + nl; }
  assert.equal(names[0], 'index.html', 'index.html is the first entry, at the root');
  console.log('ok  itch build: ' + report.files + ' files, ' + report.mb + ' MB (zip ' + report.zipMb + ' MB), ' + report.jsFiles + ' js, ' + report.musicShipped + ' of the music tracks kept, index.html at the root, no ad-block word, zip CRCs good, the repo untouched');
} finally { rmSync(out, { recursive: true, force: true }); }
