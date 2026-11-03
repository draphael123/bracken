import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

assert(process.env.CI);
for (const key of ['BRACKEN_RENDERER_MB', 'BRACKEN_RECYCLE_MB', 'BRACKEN_LAB_GC']) assert.equal(process.env[key], undefined);
const control = process.cwd();
const game = path.resolve(process.env.PUBLICATION_STANDING_GAME);
const reference = game;
const out = path.resolve(process.env.PUBLICATION_STANDING_OUT);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const originalController = '1a576c3f4511b6856df9fb4738df5aaae9987e81';
assert.equal(git(game, 'rev-parse', 'HEAD'), originalController);
assert.equal(git(game, 'status', '--porcelain'), '');
const manifestPath = 'tools/sprite-publication-standing-source-nov01/manifest.json';
const proof = JSON.parse(fs.readFileSync('tools/sprite-publication-standing-source-nov01/source-proof.json'));
assert.equal(sha(fs.readFileSync(manifestPath)), proof.manifestSha256);
assert.equal(sha(fs.readFileSync('tools/browser-profile.mjs')), proof.strictProfileSha256);
const files = new Map(JSON.parse(fs.readFileSync(manifestPath)).candidate.map(file => {
  const body = Buffer.from(file.contentBase64, 'base64');
  assert.equal(sha(body), file.sha256);
  return ['/' + file.file, body];
}));
assert.equal(files.size, 4);
fs.mkdirSync(out, { recursive: true });
assert(!fs.existsSync(out + '/receipt.json'));
const r = { controller: git(control, 'rev-parse', 'HEAD'), originalController, manifest: proof.manifestSha256, rows: [], complete: false, scope: 'Four-file baseline first-map reference only' };
const save = () => fs.writeFileSync(out + '/receipt.json', JSON.stringify(r, null, 2) + '\n');
save();
const original=fs.readFileSync(reference+'/tools/cdp.mjs','utf8'),edits=[];let adapter=original.replace(/from\s*(['"])(\.\/[^'"]+)\1/g,(before,q,rel)=>{const target=rel==='./browser-profile.mjs'?path.resolve(control,'tools',rel):path.resolve(reference,'tools',rel),after='from '+JSON.stringify(pathToFileURL(target).href);edits.push({before,after});return after;});function edit(before,after){assert.equal(adapter.split(before).length,2);adapter=adapter.replace(before,after);edits.push({before,after});}edit("fileURLToPath(new URL('..', import.meta.url))",JSON.stringify(game));edit("  await send('Page.navigate', { url: URL0 });","  if(opts.beforeNavigate)await opts.beforeNavigate({send,evalp});\n  await send('Page.navigate', { url: URL0 });");let undo=adapter;for(const e of[...edits].reverse())undo=undo.replace(e.after,e.before);assert.equal(undo,original);fs.writeFileSync(out+'/publication-cdp.mjs',adapter);r.adapter={originalSha256:sha(original),adaptedSha256:sha(adapter),edits,exactUndo:true,strict1536ProfileSha256:proof.strictProfileSha256,nativeGcAdmissionFontsAudioStartupAndClosuresUnchanged:true};save();process.chdir(game);const{admitBrowser}=await import(pathToFileURL(reference+'/tools/browser-admission.mjs').href),{openPage}=await import(pathToFileURL(out+'/publication-cdp.mjs').href);
function firstMap(readCatalogue) {
  BK.manualSimulation = true;
  const initial = Object.getOwnPropertyDescriptor(BK, 'SPR');
  if (!initial?.get || BK.state !== 'title') throw Error('Unexpected starting state');
  let publicationMs = null;
  if (readCatalogue) {
    const start = performance.now();
    void BK.SPR;
    publicationMs = performance.now() - start;
  }
  BK.state = 'map';
  const start = performance.now();
  BK.draw1();
  const mapMs = performance.now() - start;
  const display = document.getElementById('c');
  return {
    publicationMs, mapMs, state: BK.state,
    game: BK.buf.toDataURL(), display: display.toDataURL(),
    view: [BK.view.VW, BK.view.VH, devicePixelRatio],
    rootPublished: 'value' in Object.getOwnPropertyDescriptor(BK, 'SPR'),
  };
}

try {
  for (let round = 1; round <= 3; round++) {
    for (const readCatalogue of round % 2 ? [false, true] : [true, false]) {
      const admission = await admitBrowser();
      assert.equal(admission.required, 4352);
      process.env.BRACKEN_PROCESS_LOG = out + '/' + round + '-' + readCatalogue + '.processes.jsonl';
      let pg, send;
      const served = new Map();
      const errors = [];
      try {
        pg = await openPage({
          audioFiles: false,
          beforeNavigate: async page => {
            send = page.send;
            await send('Fetch.enable', { patterns: [...files.keys()].map(name => ({ urlPattern: '*' + name + '*' })) });
          },
          onEvent: event => {
            if (event.method !== 'Fetch.requestPaused') return;
            void (async () => {
              const { requestId, request } = event.params;
              const name = new URL(request.url).pathname;
              const body = files.get(name);
              if (!body) return send('Fetch.continueRequest', { requestId });
              await send('Fetch.fulfillRequest', {
                requestId, responseCode: 200,
                responseHeaders: [{ name: 'Content-Type', value: 'text/javascript; charset=utf-8' }],
                body: body.toString('base64'),
              });
              served.set(name, sha(body));
            })().catch(error => errors.push(error.message));
          },
        });
        const { game: gameImage, display, ...metrics } = await pg.evalp('(' + firstMap.toString() + ')(' + readCatalogue + ')', 120000);
        r.rows.push({ round, readCatalogue, ...metrics, gameDigest: sha(gameImage), displayDigest: sha(display), served: Object.fromEntries(served) });
        save();
        assert.deepEqual(errors, []);
        assert.deepEqual(pg.errors, []);
        assert.deepEqual(served, new Map([...files].map(([name, body]) => [name, sha(body)])));
        assert.deepEqual(metrics.view, [320, 180, 1]);
        assert.equal(metrics.state, 'map');
        assert.equal(metrics.rootPublished, readCatalogue);
      } finally {
        if (pg) await pg.close();
      }
    }
  }
  r.complete = true;
} finally {
  const events = fs.readdirSync(out).filter(name => name.endsWith('.processes.jsonl')).flatMap(name =>
    fs.readFileSync(out + '/' + name, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse));
  const launches = events.filter(event => event.type === 'launch');
  const closures = events.filter(event => event.type === 'closed');
  r.processes = { launches, closures, interruptions: events.filter(event => event.type === 'interrupted') };
  r.complete &&= launches.length === 6 && closures.length === 6 && launches.every(launch =>
    closures.some(close => close.pid === launch.pid && close.profile === launch.profile && close.peak.rendererMb <= 1536) && !fs.existsSync(launch.profile)) &&
    !r.processes.interruptions.length;
  save();
}
assert(r.complete);


