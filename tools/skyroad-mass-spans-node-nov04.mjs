// CLOUD ONLY. Use the frozen original Node canvas shim to exercise the fallback.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

assert(process.env.CI);
const out = path.resolve(process.env.FIXED_ART_LOADER_OUT);
const game = path.resolve(process.env.FIXED_ART_GAME);
const manifestBytes = fs.readFileSync(new URL('./skyroad-mass-spans-nov04/unit-manifest.json', import.meta.url));
const manifest = JSON.parse(manifestBytes);
const fixtureBytes = fs.readFileSync(new URL('./retile-repaired-native-source-oct31/fixtures.json', import.meta.url));
const fixtures = JSON.parse(fixtureBytes);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(fixtureBytes), manifest.proof.fixturesSha256);
for (const side of ['baseline', 'candidate']) {
  const root = out + '/node-' + side;
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(root + '/package.json', '{"type":"module"}\n');
  for (const file of manifest[side]) {
    const bytes = Buffer.from(file.contentBase64, 'base64');
    assert.equal(sha(bytes), file.sha256);
    const exports = fixtures.testExports[file.file];
    const suffix = exports ? '\nexport const __test={' + exports.join(',') + '};\n' : '';
    const target = root + '/' + file.file;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.concat([bytes, Buffer.from(suffix)]));
  }
}
const { install } = await import(pathToFileURL(game + '/tools/node-canvas.mjs').href);
install();
const before = await import(pathToFileURL(out + '/node-baseline/src/level-tile-cache.js').href);
const after = await import(pathToFileURL(out + '/node-candidate/src/level-tile-cache.js').href);
const originalRandom = Math.random;
const rows = [];
let rng = 0;
Math.random = () => { rng++; throw Error('Unexpected global RNG'); };
try {
  for (const [file, jobs] of Object.entries(fixtures.families)) {
    const a = await import(pathToFileURL(out + '/node-baseline/' + file).href);
    const b = await import(pathToFileURL(out + '/node-candidate/' + file).href);
    let group;
    const aliases = new Map();
    const reverse = new Map();
    for (let index = 0; index < jobs.length; index++) {
      const job = jobs[index];
      if (group !== job.group) {
        before.resetLevelTileCaches(); after.resetLevelTileCaches();
        aliases.clear(); reverse.clear(); group = job.group;
      }
      let x;
      let y;
      let ae;
      let be;
      try { x = a.__test[job.method](...job.args); } catch (error) { ae = error.name + ':' + error.message; }
      try { y = b.__test[job.method](...job.args); } catch (error) { be = error.name + ':' + error.message; }
      assert.equal(ae, be, file + ':' + index + ' exception');
      if (!ae) {
        assert.equal(x.width, y.width);
        assert.equal(x.height, y.height);
        assert.deepEqual(x._d, y._d, file + ':' + index + ' pixels');
        for (const key of ['fillStyle', 'globalAlpha', 'globalCompositeOperation', 'imageSmoothingEnabled']) {
          assert.equal(x.getContext('2d')[key], y.getContext('2d')[key], key);
        }
        if (aliases.has(x)) assert.equal(aliases.get(x), y);
        if (reverse.has(y)) assert.equal(reverse.get(y), x);
        aliases.set(x, y); reverse.set(y, x);
      }
      rows.push({ file, method: job.method, index, exact: true, originalUnsupportedException: ae || null });
    }
  }
  const helper = await import(pathToFileURL(out + '/node-candidate/src/skyroad-opaque-rows.js').href);
  const stats = helper.readOpaqueRowStats();
  assert.equal(stats.optimized, 0);
  assert(stats.fallback > 100);
  assert.equal(rows.length, fixtures.expectedFamilyCases);
  assert.equal(rng, 0);
  fs.writeFileSync(out + '/node-receipt.json', JSON.stringify({ time: new Date().toISOString(),
    status: 'Node fallback matrix exact', cases: rows.length, rows, stats, rng,
    manifestSha256: sha(manifestBytes), fixturesSha256: sha(fixtureBytes),
    originalShimSha256: sha(fs.readFileSync(game + '/tools/node-canvas.mjs')), complete: true,
    nativeCompatibilityOrGameQualification: false }, null, 2) + '\n');
} finally { Math.random = originalRandom; }
