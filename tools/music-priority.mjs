// tools/music-priority.mjs (claude/marsh3, Daniel 10-20: the Frog King played "a generic theme, not real music").
// THE BOSS TRACK ARRIVES IN TIME, AND THE GAP IS NOT THE SYNTH ARPEGGIO. Measured on a 1.6 Mbit/s line (DevTools throttle):
// the boot fetched all 867 sound clips at once, so a music file asked for in the first minute queued behind them - audio/frogking.ogg
// took ~52 s to land, and the C-major synth loop (audio.js schedule()) filled the whole fight. Now: music fetches go first (priority
// high), the clips load eight at a time and wait while a music file is on its way, the arena track is preloaded 100 tiles out (was 40),
// and a track that HAS a file waits for it in silence (the synth stands in only for file-less tracks or a file that failed three times).
// This walks straight into the Croaking Court, cold, throttled, and asserts: frogking is the track within 15 s; while it loads, nothing
// is scheduled by the synth (the schedule guard), and the clip loader is holding.
//   PORT=<free port> node tools/music-priority.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const KBPS = +(process.env.KBPS || 1600), LIMIT_S = +(process.env.LIMIT_S || 15);
const pg = await openPage({ audio: true, fonts: false });
try {
  await pg.send('Network.enable');
  await pg.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: KBPS * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await pg.send('Network.setCacheDisabled', { cacheDisabled: true });
  const r = await pg.evalp(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const A = await import('/src/audio.js'); A.initAudio();
    const lv = await import('/src/level.js'); const i = lv.LEVELS.findIndex(l => l.id === 'marsh');
    const BK = window.BK; BK.setHero('knight'); BK.load(i); BK.state = 'play'; BK.god = true; BK.sim(5);
    const ar = BK.L.arena; if (!ar || ar.music !== 'frogking') return { err: 'the marsh arena does not play frogking: ' + (ar && ar.music) };
    BK.tp(Math.round(ar.trigger / 16) + 1, Math.round(ar.floor / 16) - 1);
    const t0 = performance.now(); let at = null, asked = null, synthGap = 0;
    while (performance.now() - t0 < ${LIMIT_S} * 1000 + 20000) {
      BK.sim(15); await sleep(250);
      if (asked === null && A.music.want === 'frogking') asked = (performance.now() - t0) / 1000;
      if (asked !== null && A.music.track !== 'frogking' && A.musicSynthWould()) synthGap++;
      if (A.music.track === 'frogking') { at = (performance.now() - t0) / 1000; break; }
    }
    return { asked, at, synthGap, lanes: A.SFX_LANES };
  })()`, 120000);
  if (r.err) throw new Error(r.err);
  console.log('music-priority ' + KBPS + ' kbit/s, cold into the court: frogking asked at ' + (r.asked == null ? '-' : r.asked.toFixed(1) + ' s') + ', playing at ' + (r.at == null ? 'NEVER' : r.at.toFixed(1) + ' s') + '; synth frames in the gap ' + r.synthGap + '; clip lanes ' + r.lanes);
  assert.ok(r.asked != null, 'the fight asked for its track');
  assert.ok(r.at != null && r.at <= LIMIT_S, 'frogking plays within ' + LIMIT_S + ' s of entering the court on a ' + KBPS + ' kbit/s line (at ' + r.at + ')');
  assert.equal(r.synthGap, 0, 'the synth arpeggio does not stand in for a track whose file is loading');
  assert.ok(r.lanes > 0 && r.lanes <= 12, 'the clip loader is bounded');
  assert.deepEqual(pg.errors, [], 'no page exceptions');
  console.log('ok  music-priority');
} finally { await pg.close(); }
process.exit(0);
