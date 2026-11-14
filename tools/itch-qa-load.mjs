// PAGE TOOL: launches headless Chrome
/* tools/itch-qa-load.mjs - ITCH QA SWEEP, LOAD TIME + CONTENT BLOCKER inside the 960x540 cross-site iframe (claude/qasweep; headless, ONE browser, closed at the end; not in the suite).
   Runs: COLD (cache off), WARM (itch-style max-age cache, second visit), CPU x4 + slow-4G (9 Mbps / 170 ms) cold, and COLD WITH A CONTENT BLOCKER (EasyList/EasyPrivacy-style URL patterns blocked at the network layer).
   Each run: seconds to the title, the loading bar sampled every 250 ms (never stalls = no flat stretch > 3 s while the title is not up), bytes by type, the three biggest/slowest files.
   usage: QA_SHOTS=<dir> node tools/itch-qa-load.mjs      needs >= 1500 MB free (exit 3 when not) */
import { startSession, sleep, freeMB } from './itch-qa-lib.mjs';
const mb = freeMB(); if (mb < 1500) { console.log('RAM ' + mb + ' MB < 1500: not launching'); process.exit(3); }
const s = await startSession({ iframe: '960x540', cache: true });
const red = []; const note = (ok, msg) => { console.log((ok ? 'ok   ' : 'RED  ') + msg); if (!ok) red.push(msg); };
const info = m => console.log('     ' + m);
const BLOCK = ['*/ads/*', '*/ad/*', '*/ad-*', '*/ad_*', '*/ads.*', '*admiral*', '*banner*', '*track*', '*analytics*', '*pixel*', '*sponsor*', '*adsense*', '*doubleclick*', '*/advert*', '*beacon*', '*telemetry*', '*/stats/*', '*popup*', '*affiliate*', '*/promo*', '*googletag*', '*adservice*', '*/tag.js*', '*social*', '*/widgets/*'];
async function one(label, { cold, cpu = 1, net = null, block = false, shot = null }) {
  s.S.fetched.length = 0; s.S.failed.length = 0; s.S.consoleErrors.length = 0; s.S.exceptions.length = 0; s.S.blocked = 0; s.S.reqs.clear();
  await s.send('Network.setCacheDisabled', { cacheDisabled: !!cold }); if (cold) await s.send('Network.clearBrowserCache');
  await s.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await s.send('Network.emulateNetworkConditions', net ? { offline: false, latency: net.lat, downloadThroughput: net.down, uploadThroughput: net.up } : { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await s.send('Network.setBlockedURLs', { urls: block ? BLOCK : [] });
  await s.send('Page.navigate', { url: 'about:blank' }); await sleep(300);
  const t0 = Date.now(); await s.send('Page.navigate', { url: s.embedUrl + '?run=' + Math.random().toString(36).slice(2, 6) });
  const samples = []; let st = null, lastPct = -1, flatFrom = Date.now(), maxFlat = 0, flatAt = '';
  for (let i = 0; i < 480; i++) {
    const r = await s.ev('({ st: typeof window.BK === "object" ? BK.state : null, pct: window.BKLoad ? Math.floor(BKLoad.state.disp * 100) : -1, label: window.BKLoad ? BKLoad.state.label : "" })').catch(() => null);
    const now = Date.now(); if (r) { st = r.st; if (r.pct !== lastPct) { if (lastPct >= 0 && r.pct >= 0 && st !== 'title') { const flat = now - flatFrom; if (flat > maxFlat) { maxFlat = flat; flatAt = lastPct + '% ' + (r.label || ''); } } samples.push([(now - t0) / 1000, r.pct]); lastPct = r.pct; flatFrom = now; } }
    if (st === 'title') break; await sleep(250); }
  const secs = (Date.now() - t0) / 1000;
  const fetched = s.S.fetched.slice(); const sizes = await s.evTop('(() => performance.getEntriesByType("resource").length)()').catch(() => 0);
  const bytes = {}; for (const f of fetched) { const e = (f.u.match(/\.([a-z0-9]+)(?:\?|$)/i) || [, 'other'])[1].toLowerCase(); bytes[e] = (bytes[e] || 0) + 1; }
  const res = await s.ev('performance.getEntriesByType("resource").map(e => ({ n: e.name.split("/").pop().slice(0, 40), d: Math.round(e.duration), b: e.encodedBodySize || e.transferSize || 0 })).sort((a, b) => b.d - a.d).slice(0, 3)').catch(() => []);
  const bigs = await s.ev('performance.getEntriesByType("resource").map(e => ({ n: e.name.split("/").pop().slice(0, 40), b: e.encodedBodySize || e.transferSize || 0 })).sort((a, b) => b.b - a.b).slice(0, 3)').catch(() => []);
  const total = await s.ev('Math.round(performance.getEntriesByType("resource").reduce((a, e) => a + (e.encodedBodySize || 0), 0) / 1024 / 1024 * 10) / 10').catch(() => 0);
  const aud = await s.ev('0'); if (shot) { await sleep(1000); await s.shot(shot); }
  console.log('---- ' + label + ': title ' + (st === 'title' ? 'in ' + secs.toFixed(1) + ' s' : 'NOT REACHED after ' + secs.toFixed(0) + ' s') + '; requests ' + fetched.length + '; ~' + total + ' MB body; blocked ' + s.S.blocked);
  info('bar: ' + samples.filter((x, i) => i % Math.max(1, Math.floor(samples.length / 10)) === 0).map(x => x[0].toFixed(1) + 's=' + x[1] + '%').join(' ') + '; longest flat stretch before title ' + (maxFlat / 1000).toFixed(1) + ' s' + (maxFlat ? ' (at ' + flatAt + ')' : ''));
  info('slowest: ' + res.map(r => r.n + ' ' + r.d + 'ms').join(', ') + ' | biggest: ' + bigs.map(r => r.n + ' ' + (r.b / 1024 / 1024).toFixed(2) + 'MB').join(', '));
  info('js: ' + (bytes.js || 0) + ' files, ogg: ' + (bytes.ogg || 0) + ', png: ' + (bytes.png || 0) + ', failed: ' + s.S.failed.length + (s.S.failed.length ? ' [' + s.S.failed.slice(0, 3).join(' | ') + ']' : '') + ', errors: ' + [...s.S.consoleErrors, ...s.S.exceptions].length);
  return { st, secs, maxFlat, failed: s.S.failed.length, errs: [...s.S.consoleErrors, ...s.S.exceptions] };
}
try {
  const cold = await one('COLD, no throttle', { cold: true, shot: 'l01-title-cold' }); note(cold.st === 'title', 'cold load reaches the title (' + cold.secs.toFixed(1) + ' s)'); note(cold.secs < 12, 'cold load under 12 s unthrottled');
  const warm = await one('WARM (itch-style cache, 2nd visit)', { cold: false }); note(warm.st === 'title', 'warm load reaches the title (' + warm.secs.toFixed(1) + ' s)');
  const slow = await one('CPU x4 + slow 4G (9 Mbps, 170 ms), cold', { cold: true, cpu: 4, net: { lat: 170, down: 9e6 / 8, up: 3e6 / 8 }, shot: 'l02-title-slow' }); note(slow.st === 'title', 'throttled load reaches the title (' + slow.secs.toFixed(1) + ' s)'); note(slow.maxFlat < 6000, 'loading bar never flat for 6 s+ while throttled (longest ' + (slow.maxFlat / 1000).toFixed(1) + ' s)');
  await s.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const blk = await one('COLD with a CONTENT BLOCKER (EasyList/EasyPrivacy-style patterns)', { cold: true, block: true, shot: 'l03-title-blocker' }); note(blk.st === 'title', 'with the blocker on: title reached (' + blk.secs.toFixed(1) + ' s)'); note(blk.failed === 0, 'with the blocker on: 0 requests blocked/failed (' + blk.failed + ')');
  note(cold.errs.length + warm.errs.length + slow.errs.length + blk.errs.length === 0, 'no console errors across the four loads' + (cold.errs.concat(warm.errs, slow.errs, blk.errs)[0] ? ': ' + cold.errs.concat(warm.errs, slow.errs, blk.errs)[0] : ''));
} catch (e) { console.log('RED  crashed: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')); red.push(e.message); }
finally { await s.close(); }
console.log(red.length ? 'itch-qa-load: ' + red.length + ' RED' : 'itch-qa-load: all green'); process.exit(red.length ? 1 : 0);
