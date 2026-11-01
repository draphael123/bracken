// tools/music-levelstart.mjs - EVERY LEVEL'S MUSIC STARTS (claude/smallfix6, Daniel 11-01: "music sometimes doesn't start when a level starts"). No browser:
//   1. static: every music key a level builds (L.music, arena.music, mini.music, and any other `music` string in the built level) is a known track,
//      and a level with no key at all is listed (main.js plays 'theme' for it: L.music || 'theme')
//   2. the player run on a mock AudioContext with a mock network: the track starts after
//        - play before the context exists (the title press makes it later), a context that starts suspended / interrupted,
//        - a fast level -> title -> level -> map -> level hop with files arriving in the wrong order,
//        - a file that fails 3 times (retried), a fetch that never answers (timed out and asked for again),
//        - a restart of the track already up whose copies have all ended,
//      and an unknown key plays the theme instead of silence.
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- mock Web Audio + network ----------
const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime() {}, setValueCurveAtTime() {}, cancelScheduledValues() {} });
let sources = [];
const ctxs = [];
const node = kind => {
  const n = { kind, type: '', frequency: param(), gain: param(), detune: param(), Q: param(), threshold: param(), knee: param(), ratio: param(), attack: param(), release: param(), playbackRate: param(), buffer: null, loop: false,
    connect() { return n; }, disconnect() {}, addEventListener(ev, fn) { (n.ls = n.ls || []).push([ev, fn]); }, stop() { n.stopped = true; } };
  n.start = () => { n.started = true; if (kind === 'src') sources.push(n); };
  return n;
};
const buf = n => ({ length: n, numberOfChannels: 1, sampleRate: 8000, duration: n / 8000, getChannelData: () => Float32Array.from({ length: n }, (_, i) => Math.sin(i / 7)) });
class AC {
  constructor() { this.sampleRate = 8000; this.destination = node('dest'); this.state = 'running'; this.t0 = Date.now(); ctxs.push(this); }
  get currentTime() { return (Date.now() - this.t0) / 1000; }
  createGain() { return node('gain'); } createBiquadFilter() { return node('filter'); } createDynamicsCompressor() { return node('comp'); } createConvolver() { return node('conv'); }
  createOscillator() { return node('osc'); } createBufferSource() { return node('src'); } createBuffer(c, n) { return buf(n); }
  resume() { this.state = 'running'; return Promise.resolve(); }
  decodeAudioData() { return Promise.resolve(buf(80000)); }
}
let fetchPlan = () => ({});   // (url, n) -> { fail, hang, delay }
const fetchCount = {};
globalThis.window = { AudioContext: AC };
globalThis.fetch = (url, opts) => {
  fetchCount[url] = (fetchCount[url] || 0) + 1;
  if (/manifest/.test(url)) return Promise.resolve({ ok: true, json: async () => ({}) });
  const p = fetchPlan(url, fetchCount[url]) || {};
  return new Promise((res, rej) => {
    if (p.hang) { if (opts && opts.signal) opts.signal.addEventListener('abort', () => rej(new Error('aborted'))); return; }
    setTimeout(() => p.fail ? rej(new Error('net')) : res({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }), p.delay || 0);
  });
};
const errs = [];
process.on('uncaughtException', e => errs.push(e)); process.on('unhandledRejection', e => errs.push(e));

const A = await import('../src/audio.js');
const { LEVELS } = await import('../src/level.js');
const { music, MUSIC_RETRY } = A;
MUSIC_RETRY.ms = 60; MUSIC_RETRY.timeoutMs = 120;
const active = () => sources.filter(s => s.started && !s.stopped).length;
const until = async (fn, ms = 2500) => { const t = Date.now(); while (Date.now() - t < ms) { if (fn()) return true; await sleep(15); } return fn(); };

// ---------- 1. static: every level's keys ----------
const none = [], bad = [];
for (const lv of LEVELS) {
  let L; try { L = lv.build(); } catch (e) { continue; }
  const keys = [];
  const walk = (o, path, d) => {
    if (!o || d > 3 || typeof o !== 'object') return;
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (k === 'music' && typeof v === 'string') keys.push([path + '.music', v]);
      else if (['arena', 'mini', 'chase'].includes(k) && v && typeof v === 'object') walk(v, path + '.' + k, d + 1);
      else if (['minis', 'chases'].includes(k) && Array.isArray(v)) v.forEach((q, i) => walk(q, path + '.' + k + '[' + i + ']', d + 1));
    }
  };
  walk(L, lv.id, 0);
  if (!L.music) none.push(lv.id);
  for (const [p, v] of keys) if (!A.musicKnown(v)) bad.push(p + '=' + v);
}
ok(!bad.length, 'music keys that are not a known track (they would play the theme): ' + bad.join(', '));
console.log('levels with no L.music key (main.js falls back to "theme"): ' + (none.length ? none.join(', ') : 'none'));

// ---------- 2. the player ----------
const track = () => music.track;
// a. play before the context exists, then the title press makes it
music.play('stockade'); ok(music.want === 'stockade', 'play before initAudio does not remember the track');
A.initAudio(); ok(await until(() => track() === 'stockade'), 'a track asked for before the context existed never started (got ' + track() + ')');
ok(active() >= 1, 'a started track has no running copy');
// b. suspended / interrupted context: any input resumes it, and so does music.play
ctxs[0].state = 'interrupted'; music.play('marsh');
ok(ctxs[0].state === 'running', 'music.play did not ask an interrupted context to run'); ok(await until(() => track() === 'marsh'), 'marsh did not start on a resumed context');
ctxs[0].state = 'suspended'; A.initAudio(); ok(ctxs[0].state === 'running', 'initAudio did not resume a suspended context');
// c. a fast hop with files arriving in the wrong order
fetchPlan = url => /stockade/.test(url) ? { delay: 120 } : /fenroad/.test(url) ? { delay: 10 } : /select/.test(url) ? { delay: 60 } : {};
music.play('stockade'); music.play('select'); music.play('stockade'); music.play('fenroad'); music.play('stockade');
ok(await until(() => track() === 'stockade'), 'after a hop with files arriving out of order the wanted track is not the one playing (' + track() + ' want ' + music.want + ')');
await sleep(250); ok(music.want === 'stockade' && track() === 'stockade', 'late files changed the track after the hop: ' + track());
// d. restart: the same track asked for with every copy ended
for (const s of sources) { s.stopped = true; (s.ls || []).forEach(([ev, fn]) => ev === 'ended' && fn()); }
music.play('stockade'); await sleep(40); ok(active() >= 1, 'asking for the track already up with no copy running left it silent');
// e. a file that fails three times, then arrives
fetchPlan = (url, n) => /rootway/.test(url) ? (n <= 3 ? { fail: true } : {}) : {};
music.play('rootway'); ok(await until(() => track() === 'rootway', 4000), 'a file that failed its first three tries is never asked for again (track ' + track() + ', fetches ' + fetchCount['./audio/rootway.ogg'] + ')');
// f. a fetch that never answers
fetchPlan = (url, n) => /skyroad/.test(url) ? (n === 1 ? { hang: true } : {}) : {};
music.play('skyroad'); ok(await until(() => track() === 'skyroad', 4000), 'a fetch that never answers kept the track silent for good (fetches ' + fetchCount['./audio/skyroad.ogg'] + ')');
// g. an unknown key plays the theme
fetchPlan = () => ({});
const warn = console.warn; console.warn = () => {}; music.play('no-such-track'); console.warn = warn;
ok(music.want === 'theme', 'an unknown key left want = ' + music.want); ok(await until(() => track() === 'theme'), 'an unknown key is silence instead of the theme');
ok(errs.length === 0, 'uncaught errors: ' + errs.map(String).join(' | '));
if (fails.length) { console.log('music-levelstart: FAIL\n  - ' + fails.join('\n  - ')); process.exit(1); }
console.log('music-levelstart: OK (every level key is a known track; the track starts after a late context, a hop, a failed or hung file; an unknown key plays the theme)');
process.exit(0);
