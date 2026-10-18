// A level chosen on the world map must replace the map theme even if its first file request fails.
// The DevTools Fetch domain fails only the first Brackenwood request; subsequent requests are real.
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const target = 'brackenwood', deadlineMs = 10000;
let pg, requests = 0, failed = 0, heldRetry = null, interceptError = null;
try {
  pg = await openPage({ audio: true, fonts: false, onEvent: ev => {
    if (ev.method !== 'Fetch.requestPaused') return;
    requests++;
    if (requests === 2) { heldRetry = ev.params.requestId; return; } // keep the new file unloaded until after the map-entry assertion
    const method = requests === 1 ? 'Fetch.failRequest' : 'Fetch.continueRequest';
    if (requests === 1) failed++;
    const params = method === 'Fetch.failRequest' ? { requestId: ev.params.requestId, errorReason: 'Failed' } : { requestId: ev.params.requestId };
    pg.send(method, params).catch(e => { interceptError = e; });
  } });
  await pg.send('Fetch.enable', { patterns: [{ urlPattern: '*brackenwood.ogg', requestStage: 'Request' }] });
  await pg.evalp(`(()=>{ window.__musicWarnings=[]; const warn=console.warn.bind(console); console.warn=(...args)=>{ window.__musicWarnings.push(args.map(String).join(' ')); warn(...args); }; })()`);
  const onMap = await pg.evalp(`(async()=>{ const { music } = await import('/src/audio.js'); window.__musicStart = music;
    BK.manualSimulation = true; BK.ui.pressCard = false; BKT.PROG.wood = BKT.PROG.wood || {};
    music.play('select'); const until = Date.now() + 10000;
    while (music.track !== 'select' && Date.now() < until) await new Promise(r => setTimeout(r, 40));
    if (music.track !== 'select') throw new Error('map track did not start');
    BK.mapLook('wood'); BK.sim(2); return { state: BK.state, track: music.track }; })()`, 20000);
  assert.equal(onMap.state, 'map');
  assert.equal(onMap.track, 'select', 'preloading does not interrupt map music');
  for (const until = Date.now() + 3000; requests < 1 && Date.now() < until;) await new Promise(r => setTimeout(r, 25));
  assert.ok(requests >= 1, 'resting on the map node preloads its level track before entry');
  const before = await pg.evalp(`(()=>{ BK.press('confirm'); BK.sim(2);
    return { state: BK.state, levelMusic: BK.L.music, want: window.__musicStart.want, track: window.__musicStart.track }; })()`);
  assert.equal(before.state, 'play', 'the map choice enters a level: ' + JSON.stringify(before));
  assert.equal(before.levelMusic, target, 'the map choice entered Brackenwood');
  assert.equal(before.want, target, 'the level requested its own music');
  assert.equal(before.track, null, 'the map music fades immediately while the level track is still unloaded');
  for (const until = Date.now() + 3000; !heldRetry && Date.now() < until;) await new Promise(r => setTimeout(r, 25));
  assert.ok(heldRetry, 'the failed preload is retried');
  await pg.send('Fetch.continueRequest', { requestId: heldRetry });
  const until = Date.now() + deadlineMs;
  let track = before.track;
  while (track !== target && Date.now() < until) {
    await new Promise(r => setTimeout(r, 75));
    track = await pg.evalp('window.__musicStart.track');
  }
  console.log('music-start observed ' + JSON.stringify({ entered: before.state, levelMusic: before.levelMusic, requested: before.want, playing: track, requests, firstFailed: failed }));
  assert.equal(failed, 1, 'the first level-track fetch was failed by interception');
  assert.equal(interceptError, null, 'CDP interception completed');
  assert.ok(requests >= 2, 'the level track was requested again after the failed fetch (' + requests + ' requests)');
  assert.equal(track, target, 'the level track replaces the map within ' + deadlineMs / 1000 + ' s after first-fetch failure (track=' + track + ', requests=' + requests + ')');
  const warnings = await pg.evalp('window.__musicWarnings.filter(x => x.includes("Music track brackenwood failed to load"))');
  assert.equal(warnings.length, 1, 'one warning records the failed load: ' + JSON.stringify(warnings));
  assert.deepEqual(pg.errors, [], 'no page exceptions');
  console.log('ok  music-start  map -> wood plays ' + target + ' within ' + deadlineMs / 1000 + ' s after first fetch fails (' + requests + ' requests)');
} finally { if (pg) await pg.close(); }
