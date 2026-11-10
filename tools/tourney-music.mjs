// tools/tourney-music.mjs (claude/tourneyart; pure node, no browser): THE TOURNEY's two original synth tracks, 'tourneyfest' (the level) and 'tychampion' / 'tychampion:p2'
// (THE CHAMPION, P1 mounted and P2 on foot). Run through boss-music.js's own scheduler contract against a recording mock audio context: they are known to
// the engine, the level / arena name them, every step plays without a throw, the loop repeats exactly, nothing is silent or a wall of sound, and P2 is
// faster and denser than P1. `node tools/tourney-music.mjs`
import assert from 'node:assert/strict';
const BM = await import('../src/boss-music.js');
const { LEVELS } = await import('../src/level.js');
globalThis.__TY = true;
const { LEVELS: L2 } = await import('../src/level.js?ty=1').catch(() => ({ LEVELS }));
const A = await import('../src/audio.js');

const mock = () => { const ev = [], param = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, value: 0 });
  const node = () => ({ type: '', frequency: param(), gain: param(), detune: param(), Q: param(), connect() {}, disconnect() {}, start() {}, stop() {}, addEventListener() {} });
  const ac = { currentTime: 0, createOscillator() { const n = node(); n.start = () => ev.push(['osc', n.type]); return n; }, createGain: node, createBiquadFilter: node };
  return { ev, env: { ac, dest: {}, noise: (dur, v, freq) => ev.push(['noise', freq, v]), gain: 1 } }; };
const runLoop = name => { const sb = BM.bossSynthOf(name); assert.ok(sb, name + ' is not a synth track'); const out = [];
  for (let i = 0; i < sb.total; i++) { const m = mock(); sb.play(i, i * sb.step, sb.variant, m.env); out.push(m.ev); } return { sb, out }; };
const results = {};
for (const name of ['tourneyfest', 'tychampion', 'tychampion:p2']) {
  const a = runLoop(name), b = runLoop(name);
  assert.deepEqual(a.out, b.out, name + ': the loop does not repeat itself exactly');
  const silent = a.out.filter(e => !e.length).length, per = a.out.reduce((s, e) => s + e.length, 0) / a.out.length;
  let run = 0, worst = 0; for (const e of a.out) { run = e.length ? 0 : run + 1; worst = Math.max(worst, run); } assert.ok(worst <= 2 && silent <= a.sb.total * 0.3, name + ': dead air (' + silent + ' silent steps, the longest gap ' + worst + ')');
  assert.ok(per > 3 && per < 26, name + ': note density ' + per.toFixed(1) + ' per step is off');
  const secs = a.sb.total * a.sb.step; assert.ok(secs > 24 && secs < 45, name + ': loop is ' + secs.toFixed(1) + ' s');
  assert.ok(a.out.some(e => e.some(x => x[0] === 'noise')) && a.out.some(e => e.some(x => x[0] === 'osc')), name + ': no drums or no tones');
  results[name] = { secs: +secs.toFixed(1), perStep: +per.toFixed(1), silent, gap: worst, step: +a.sb.step.toFixed(3) }; }
assert.ok(BM.bossSynthOf('tychampion:p2').step < BM.bossSynthOf('tychampion').step * 0.85, 'P2 is not clearly faster than P1');
assert.ok(results['tychampion:p2'].perStep > results.tychampion.perStep, 'P2 is not denser (tenser) than P1');
for (const n of ['tourneyfest', 'tychampion']) assert.ok(A.MUSIC_NAMES.includes(n) && A.musicKnown(n) && A.MUSIC_CREDITS[n], n + ' is not in the engine / Sound Test / credits');
assert.ok(A.musicKnown('tychampion:p2'), "'tychampion:p2' is not a known track");
const ty = (L2.find(l => l.id === 'tourney'));
if (ty) { const B = ty.build(); assert.equal(B.music, 'tourneyfest', 'the level is not on tourneyfest'); assert.equal(B.arena.music, 'tychampion', 'the arena is not on tychampion'); }
else console.log('(tourney level not in LEVELS with the flag off: wiring checked through tools/tourney.mjs --ty-on instead)');
// flag-off master tracks are untouched
for (const n of ['towpath', 'goblinroyal', 'champion']) assert.ok(BM.bossSynthOf(n), n + ' lost its synth theme');
console.log('tourney-music ok', JSON.stringify(results));
