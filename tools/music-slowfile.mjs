// PAGE TOOL: launches headless Chrome
// tools/music-slowfile.mjs (claude/smallfix11, Daniel 11-03: THE HORNET'S NEST played a generic synth loop for about a minute, then its own track).
// Cause: the music fetch had a 20 s TOTAL timeout; the 2.1 MB hornetnest.ogg on a slow line was aborted and restarted from zero three times (~60 s), then
// trackFailed let the synth stand in until a later retry landed. Now the timeout is a STALL timeout and trackFailed waits for the whole retry budget.
// This asks for a big file track cold on a slow line (default 450 kbit/s: ~38 s for the nest) and asserts the synth never stands in and the file lands.
//   PORT=<free port> TRACK=hornetnest node tools/music-slowfile.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const KBPS = +(process.env.KBPS || 450), TRACK = process.env.TRACK || 'hornetnest', LIMIT_S = +(process.env.LIMIT_S || 90);
const pg = await openPage({ audio: true, fonts: false });
try {
  await pg.send('Network.enable');
  await pg.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: KBPS * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await pg.send('Network.setCacheDisabled', { cacheDisabled: true });
  const r = await pg.evalp(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const A = await import('/src/audio.js'); A.initAudio(); A.music.play(${JSON.stringify(TRACK)});
    const t0 = performance.now(); let at = null, synthGap = 0, polls = 0;
    while (performance.now() - t0 < ${LIMIT_S} * 1000) { await sleep(250); polls++;
      if (A.music.track !== ${JSON.stringify(TRACK)} && A.musicSynthWould()) synthGap++;
      if (A.music.track === ${JSON.stringify(TRACK)}) { at = (performance.now() - t0) / 1000; break; } }
    return { at, synthGap, polls };
  })()`, 150000);
  console.log('music-slowfile ' + TRACK + ' at ' + KBPS + ' kbit/s: playing at ' + (r.at == null ? 'NEVER' : r.at.toFixed(1) + ' s') + ', synth-would-play polls ' + r.synthGap);
  assert.ok(r.at != null, TRACK + ' plays within ' + LIMIT_S + ' s');
  assert.equal(r.synthGap, 0, 'the synth never stands in for a file track that is still downloading');
  assert.deepEqual(pg.errors, [], 'no page exceptions');
  console.log('ok  music-slowfile');
} finally { await pg.close(); }
process.exit(0);
