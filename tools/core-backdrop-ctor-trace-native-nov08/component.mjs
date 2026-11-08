// CLOUD ONLY. Native factory compatibility for the source-specific span proposal.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { OUT, openFixedArtPage } from './component-page.mjs';
import { runPrivateNativeRecorderCases } from './cases.mjs';


assert(process.env.CI);
for (const name of ['BRACKEN_RENDERER_MB', 'BRACKEN_RECYCLE_MB', 'BRACKEN_LAB_GC']) assert.equal(process.env[name], undefined);
const data = new URL('./', import.meta.url);
const manifestBytes = fs.readFileSync(new URL('manifest.json', data));
const manifest = JSON.parse(manifestBytes);
const fixtureBytes = fs.readFileSync(new URL('../retile-repaired-native-source-oct31/fixtures.json', import.meta.url));
const fixtures = JSON.parse(fixtureBytes);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(fixtureBytes), 'e6a8d60e18e34c9fdd874412ac5c005efb12c148fff12f06098a655e3cd24c32');
for (const side of ['baseline', 'candidate']) for (const file of manifest[side]) {
  assert.equal(sha(Buffer.from(file.contentBase64, 'base64')), file.sha256);
}
const game = path.resolve(process.env.FIXED_ART_GAME);
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const hashes = () => Object.fromEntries(walk(game + '/tools').sort().map(file =>
  [path.relative(game, file).replaceAll('\\', '/'), sha(fs.readFileSync(file))]));
const originalHashes = hashes();
assert.equal(Object.keys(originalHashes).length, 921);
fs.mkdirSync(OUT, { recursive: true });
assert(!fs.existsSync(OUT + '/receipt.json'));
fs.writeFileSync(OUT + '/unit-manifest.json', manifestBytes);
fs.writeFileSync(OUT + '/original-tool-hashes.json', JSON.stringify(originalHashes, null, 2) + '\n');
process.env.BRACKEN_PROCESS_LOG = OUT + '/component.processes.jsonl';
const receipt = { time: new Date().toISOString(), status: 'Running native factory compatibility',
  controller: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceProof: manifest.proof, manifestSha256: sha(manifestBytes), fixturesSha256: sha(fixtureBytes),
  casesSha256: sha(fs.readFileSync(new URL('./cases.mjs', import.meta.url))),
  rendererMb: 1536, admissionMb: 4352, complete: false, adopted: false, overallWorkComplete: false };
const save = () => fs.writeFileSync(OUT + '/receipt.json', JSON.stringify(receipt, null, 2) + '\n');
save();
let pg;
try {
  const group=process.env.PRIVATE_NATIVE_RECORDER_GROUP;assert(manifest.groups[group]);receipt.group=group;receipt.rows=[];
  // Each original producer gets a fresh native realm. Revoking a Blob URL does
  // not unload an ESM module graph; retaining every level graph would falsify
  // this component's memory/lifetime scope. No native GC policy is changed.
  for(const config of manifest.groups[group]){
   pg=await openFixedArtPage(false,{audio:false,fonts:false,seed:1919});
   try{const row=await pg.evalp('('+runPrivateNativeRecorderCases.toString()+')('+JSON.stringify(manifest)+','+JSON.stringify(config)+')',240000);receipt.rows.push(row);save();assert(row.exact&&row.rng===0);assert.deepEqual(pg.errors,[]);assert.deepEqual(pg.paletteErrors,[]);}
   finally{await pg.close();pg=null;}
  }
  assert.equal(receipt.rows.length,manifest.groups[group].length);receipt.complete=true;
  receipt.status='Native grid argument/observer and original producer qualification complete. Actual Game benefit and every original gate remain required.';
} catch (error) {
  receipt.complete = false;
  receipt.status = 'Native factory compatibility failed or interrupted. No broader Game dispatch qualified.';
  receipt.error = error.stack;
  process.exitCode = 1;
} finally {
  if (pg) try { await pg.close(); } catch (error) { receipt.closeError = error.stack; receipt.complete = false; process.exitCode = 1; }
  const events = fs.existsSync(process.env.BRACKEN_PROCESS_LOG) ? fs.readFileSync(process.env.BRACKEN_PROCESS_LOG, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse) : [];
  const launches = events.filter(event => event.type === 'launch');
  const closures = events.filter(event => event.type === 'closed');
  receipt.processes = { launches: launches.length, closures: closures.length,
    allClosed: launches.every(event => closures.some(closed => closed.pid === event.pid && closed.profile === event.profile)),
    profileAbsences: launches.map(event => ({ profile: event.profile, absent: !fs.existsSync(event.profile) })),
    interruptions: events.filter(event => event.type === 'interrupted'),
    peakRendererMb: Math.max(0, ...closures.map(event => event.peak.rendererMb)), events };
  receipt.all921OriginalToolHashesMatch = JSON.stringify(hashes()) === JSON.stringify(originalHashes);
  receipt.originalGameSourceUnchanged = execFileSync('git', ['status', '--porcelain'], { cwd: game, encoding: 'utf8' }).trim() === '';
  const log = process.env.BRACKEN_GUARD_READBACK;
  receipt.guardReadbacks = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse) : [];
  receipt.strictGuardVerified = receipt.guardReadbacks.length > 0 && receipt.guardReadbacks.every(row =>
    row.kind === 'strict-profile' && row.hardLimitMb === 1536 && row.sha256 === '9d38b09c585f0054e40125c63b2435e61e8cd6f5cc53e6011edf62178c8c2184');
  const expectedCases=manifest.groups[receipt.group]?.length;
  if (launches.length !== expectedCases || closures.length !== expectedCases || !receipt.processes.allClosed ||
      receipt.processes.profileAbsences.some(row => !row.absent) || receipt.processes.interruptions.length ||
      !receipt.all921OriginalToolHashesMatch || !receipt.originalGameSourceUnchanged || !receipt.strictGuardVerified) {
    receipt.complete = false;
    process.exitCode = 1;
  }
  receipt.time = new Date().toISOString();
  save();
  console.log(JSON.stringify({ complete: receipt.complete, family: receipt.rows?.length, public: receipt.publicRows?.length,
    activation: receipt.activation, peak: receipt.processes.peakRendererMb, error: receipt.error }));
}
