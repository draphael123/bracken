// CLOUD ONLY. Allocation ownership diagnosis, with no original assertion or timing rerun.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { installReturnedSheetOwnerObserver } from './returned-sheet-owner-observer-nov04.mjs';

assert(process.env.CI);
for (const key of ['BRACKEN_RENDERER_MB', 'BRACKEN_RECYCLE_MB', 'BRACKEN_LAB_GC']) {
  assert.equal(process.env[key], undefined);
}
const game = path.resolve(process.env.OWNER_GAME);
const out = path.resolve(process.env.OWNER_OUT);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: game, encoding: 'utf8' }).trim();
const manifestBytes = fs.readFileSync(new URL('./baseline-memory-profile-source/manifest.json', import.meta.url));
const manifest = JSON.parse(manifestBytes);
assert.equal(git('rev-parse', 'HEAD'), manifest.proof.gameController);
assert.equal(git('rev-parse', 'HEAD:src'), manifest.proof.gameTree);
assert.equal(git('status', '--porcelain'), '');
assert.equal(sha(fs.readFileSync(game + '/src/main.js')), manifest.proof.originalMainSha256);
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const hashes = () => Object.fromEntries(walk(game + '/tools').sort().map(file =>
  [path.relative(game, file).replaceAll('\\', '/'), sha(fs.readFileSync(file))]));
const originalHashes = hashes();
assert.equal(Object.keys(originalHashes).length, 921);
fs.mkdirSync(out, { recursive: true });
assert(!fs.existsSync(out + '/receipt.json'));
process.env.BRACKEN_PROCESS_LOG = out + '/owners.processes.jsonl';
fs.writeFileSync(out + '/original-tool-hashes.json', JSON.stringify(originalHashes, null, 2) + '\n');

const originalCdp = fs.readFileSync(game + '/tools/cdp.mjs', 'utf8');
const edits = [];
let cdp = originalCdp.replace(/from\s*(['"])(\.\/[^'"]+)\1/g, (before, quote, relative) => {
  const after = 'from ' + JSON.stringify(pathToFileURL(path.resolve(game, 'tools', relative)).href);
  edits.push({ before, after });
  return after;
});
for (const [before, after] of [
  ["fileURLToPath(new URL('..', import.meta.url))", JSON.stringify(game)],
  ["  await send('Page.navigate', { url: URL0 });", "  if (opts.beforeNavigate) await opts.beforeNavigate({send, evalp});\n  await send('Page.navigate', { url: URL0 });"]
]) {
  assert.equal(cdp.split(before).length, 2);
  cdp = cdp.replace(before, after);
  edits.push({ before, after });
}
let undo = cdp;
for (const edit of [...edits].reverse()) undo = undo.replace(edit.after, edit.before);
assert.equal(undo, originalCdp);
const cdpFile = out + '/cdp-owner-navigation.mjs';
fs.writeFileSync(cdpFile, cdp);
const ui = manifest.baseline[0];
assert.equal(ui.file, 'src/puppeteer-hands.js');
const uiBytes = Buffer.from(ui.contentBase64, 'base64');
assert.equal(sha(uiBytes), ui.sha256);
const receipt = {
  time: new Date().toISOString(),
  status: 'Running bounded allocation owner diagnosis',
  controller: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  source: manifest.proof,
  manifestSha256: sha(manifestBytes),
  observerSha256: sha(fs.readFileSync(new URL('./returned-sheet-owner-observer-nov04.mjs', import.meta.url))),
  adapter: { originalSha256: sha(originalCdp), adaptedSha256: sha(cdp), exactUndo: true, edits },
  scope: 'One fresh original Task3 document with the shared UI correction. Original load-leak allocation workload including both growth phases and all 64 audit levels, with weak caller census samples. No original assertions, timing trials or candidate comparison.',
  observerLimits: 'getContext is wrapped for diagnostic caller attribution. Weak references and stack tables add overhead. Logical pixels are not resident memory. Observer results cannot qualify Game safety or performance.',
  originalRendererMb: 1536,
  originalAdmissionMb: 4352,
  originalFixtureSha256: originalHashes['tools/load-leak.mjs'],
  rows: [], served: [], complete: false, adopted: false, overallWorkComplete: false
};
const save = () => fs.writeFileSync(out + '/receipt.json', JSON.stringify(receipt, null, 2) + '\n');
save();
let pg;
let transport;
const deliveryErrors = [];
try {
  const { openPage } = await import(pathToFileURL(cdpFile).href);
  pg = await openPage({
    audio: false, fonts: false, gcLoads: false,
    args: ['--js-flags=--expose-gc --max-old-space-size=2048'],
    beforeNavigate: async connection => {
      transport = connection;
      await transport.send('Page.addScriptToEvaluateOnNewDocument', {
        source: '(' + installReturnedSheetOwnerObserver.toString() + ')()'
      });
      await transport.send('Fetch.enable', { patterns: [{ urlPattern: '*/' + ui.file + '*', requestStage: 'Request' }] });
    },
    onEvent: event => {
      if (event.method !== 'Fetch.requestPaused') return;
      void (async () => {
        const request = event.params;
        assert.equal(new URL(request.request.url).pathname, '/' + ui.file);
        await transport.send('Fetch.fulfillRequest', {
          requestId: request.requestId, responseCode: 200,
          responseHeaders: [{ name: 'Content-Type', value: 'text/javascript; charset=utf-8' }],
          body: uiBytes.toString('base64')
        });
        receipt.served.push({ file: ui.file, sha256: sha(uiBytes) });
      })().catch(error => deliveryErrors.push(error.stack));
    }
  });
  const { browserMemory } = await import(pathToFileURL(game + '/tools/process-memory.mjs').href);
  const events = () => fs.readFileSync(process.env.BRACKEN_PROCESS_LOG, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  const launch = events().find(event => event.type === 'launch');
  assert(launch);
  async function sample(label) {
    const owners = await pg.evalp('__returnedSheetOwners.snapshot()', 60000);
    const actual = await pg.evalp('({time:BK.time,game:[BK.view.buf.width,BK.view.buf.height],display:[document.getElementById("c").width,document.getElementById("c").height],dpr:devicePixelRatio})');
    const memory = await browserMemory(launch.pid, launch.profile);
    receipt.rows.push({ label, actual, memory, owners });
    save();
    assert.equal(owners.failures, 0);
    console.log(JSON.stringify({ label, created: owners.totalCreated, collected: owners.collected, rendererMb: memory.rendererMb }));
  }
  const ids = await pg.evalp('(async()=>{window.__LV=(await import("/src/level.js")).LEVELS;BK.manualSimulation=true;BK.god=true;return __LV.map(l=>l.id);})()');
  assert.equal(ids.length, 64);
  const set = ['wood', 'marsh', 'stockade', 'moor', 'crown', 'reef'].map(id => ids.indexOf(id));
  assert(set.every(index => index >= 0));
  const loadAll = () => pg.evalp('(()=>{for(const i of ' + JSON.stringify(set) + '){BK.load(i);BK.state="play";BK.sim(30);}return 1;})()', 600000);
  const collect = () => pg.evalp('(async()=>{gc();await new Promise(r=>setTimeout(r,200));gc();await new Promise(r=>setTimeout(r,200));return 1;})()');
  await sample('boot');
  await loadAll();
  for (const forced of [false, true]) {
    await collect();
    for (let round = 0; round < 5; round++) {
      receipt.active = { phase: forced ? 'kept' : 'growth', round };
      save();
      await loadAll();
      if (forced) await collect();
    }
    await sample(forced ? 'kept-complete' : 'growth-complete');
  }
  await pg.evalp('window.__bakeAudit=[]');
  const deadline = Date.now() + 900000;
  for (let index = 0; index < ids.length; index++) {
    receipt.active = { phase: 'audit', index, id: ids[index] };
    save();
    await pg.evalp('(()=>{BK.load(' + index + ');BK.state="play";BK.sim(5);BK.step(2);return 1;})()', Math.max(1, deadline - Date.now()));
    await pg.send('HeapProfiler.collectGarbage', {}, Math.max(1, Math.min(15000, deadline - Date.now())));
    await pg.send('Memory.simulatePressureNotification', { level: 'critical' }, Math.max(1, Math.min(15000, deadline - Date.now())));
    await sample('audit-' + index + '-' + ids[index]);
  }
  receipt.observerRestored = await pg.evalp('__returnedSheetOwners.restore()');
  assert(receipt.observerRestored);
  assert.deepEqual(deliveryErrors, []);
  assert.deepEqual(pg.errors, []);
  receipt.complete = true;
  receipt.status = 'Complete ownership census only. Original safety, memory and performance gates remain unqualified.';
} catch (error) {
  receipt.error = error.stack;
  receipt.status = 'Partial ownership census. Saved completed samples remain diagnostic only.';
  process.exitCode = 1;
} finally {
  if (pg) {
    try { await pg.close(); } catch (error) { receipt.closeError = error.stack; process.exitCode = 1; }
  }
  const events = fs.existsSync(process.env.BRACKEN_PROCESS_LOG) ? fs.readFileSync(process.env.BRACKEN_PROCESS_LOG, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse) : [];
  const launches = events.filter(event => event.type === 'launch');
  const closures = events.filter(event => event.type === 'closed');
  receipt.processes = { launches: launches.length, closures: closures.length,
    allClosed: launches.every(event => closures.some(closed => closed.pid === event.pid && closed.profile === event.profile)),
    profileAbsences: launches.map(event => ({ profile: event.profile, absent: !fs.existsSync(event.profile) })),
    interruptions: events.filter(event => event.type === 'interrupted'),
    peakRendererMb: Math.max(0, ...closures.map(event => event.peak.rendererMb)), events };
  receipt.all921OriginalToolHashesMatch = JSON.stringify(hashes()) === JSON.stringify(originalHashes);
  receipt.originalGameSourceUnchanged = git('status', '--porcelain') === '';
  receipt.deliveryErrors = deliveryErrors;
  const guardLog = process.env.BRACKEN_GUARD_READBACK;
  receipt.runtimeGuardReadbacks = guardLog && fs.existsSync(guardLog) ?
    fs.readFileSync(guardLog, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse) : [];
  receipt.actualStrictGuardResolutionVerified = receipt.runtimeGuardReadbacks.length > 0 &&
    receipt.runtimeGuardReadbacks.every(row => row.kind === 'strict-profile' && row.hardLimitMb === 1536 &&
      row.sha256 === '9d38b09c585f0054e40125c63b2435e61e8cd6f5cc53e6011edf62178c8c2184' && row.original !== row.actual);
  if (!receipt.processes.allClosed || launches.length !== 1 || closures.length !== 1 ||
      receipt.processes.profileAbsences.some(row => !row.absent) || !receipt.all921OriginalToolHashesMatch ||
      !receipt.originalGameSourceUnchanged || !receipt.actualStrictGuardResolutionVerified || receipt.closeError ||
      receipt.processes.interruptions.length || receipt.served.length !== 1 || deliveryErrors.length) {
    receipt.complete = false;
    process.exitCode = 1;
  }
  receipt.time = new Date().toISOString();
  save();
}
