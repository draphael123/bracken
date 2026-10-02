// tools/boss-music.mjs - THE BOSS THEMES (claude/bossmusic): the Archmages share 'archmage' (the Undead Archmage on
// its 'archmage:undead' voicing), the Goblin King and Queen share 'goblinroyal', and neither is a generic boss file.
// Static wiring, then the step scheduler run against a mock AudioContext (no browser): no throws, sane note density,
// a loop that repeats itself exactly, and the two voicings of the Archmages' theme really differ.
import assert from 'node:assert/strict';
const events = [];   // every oscillator / noise start: { t, kind, type, f, dest }
const param = () => { const p = { value: 0, first: null, setValueAtTime(v) { if (p.first === null) p.first = v; }, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime() {}, setValueCurveAtTime() {} }; return p; };
const node = (kind) => { const n = { kind, type: '', frequency: param(), gain: param(), detune: param(), Q: param(), threshold: param(), knee: param(), ratio: param(), attack: param(), release: param(), connect() { return n; }, disconnect() {}, addEventListener() {}, stop() {}, buffer: null };
  n.start = t => { if (kind === 'osc' || kind === 'src') events.push({ t, kind, type: n.type, f: n.frequency.first, d: n.__dest }); }; return n; };
let clock = 0, speed = 12, t0 = Date.now(), frozen = null;   /* time only moves between macrotasks, as a real ac clock effectively does inside one scheduler call */
class AC { constructor() { this.sampleRate = 8000; this.destination = node('dest'); this.state = 'running'; }
  get currentTime() { if (frozen === null) { frozen = clock + (Date.now() - t0) / 1000 * speed; setImmediate(() => { frozen = null; }); } return frozen; }
  createGain() { return node('gain'); } createBiquadFilter() { return node('filter'); } createDynamicsCompressor() { return node('comp'); } createConvolver() { return node('conv'); }
  createOscillator() { return node('osc'); } createBufferSource() { return node('src'); } createBuffer(c, n) { return { length: n, numberOfChannels: c, getChannelData: () => new Float32Array(n), duration: n / 8000 }; }
  resume() {} decodeAudioData() { return Promise.reject(new Error('mock')); } }
globalThis.window = { AudioContext: AC }; globalThis.fetch = () => Promise.reject(new Error('mock'));
const errors = []; process.on('uncaughtException', e => errors.push(e));

try {
// ---- 1. wiring: who plays what
const { LEVELS } = await import('../src/level.js');
const A = await import('../src/audio.js');
const BM = await import('../src/boss-music.js');
const arena = id => LEVELS.find(l => l.id === id).build().arena;
assert.equal(arena('mage').music, 'archmage', "the Archmage's arena is not on the Archmages' theme");
assert.equal(arena('fallingtower').music, 'archmage:undead', "the Undead Archmage's arena is not on the undead voicing of the Archmages' theme (his stair chase plays arena.music from the first step)");
assert.equal(arena('kings').music, 'goblinroyal', "the Goblin King's arena is not on the Goblin royals' theme");
assert.equal(arena('crown').music, 'goblinroyal', "the Goblin Queen's arena is not on the Goblin royals' theme");
assert.equal(arena('keep').music, 'drownedking', "the Drowned King's arena is not on his flooded-hall dirge");
assert.equal(arena('oreroad').music, 'winchmaster', "the Winchmaster's arena is not on his mine-cart chase");
assert.equal(arena('witchlight').music, 'gargoyle', "the Gate Gargoyle's arena is not on his stone-grind theme");
assert.equal(arena('welltown').music, 'cisternqueen', "THE CISTERN QUEEN's hall is not on her own theme");
assert.equal(LEVELS.find(l => l.id === 'welltown').build().mini.music, 'banditking', "THE GANG LEADER's courtyard is not on the old King's theme (his mini keeps it, claude/welltown3)");
assert.ok(A.MUSIC_NAMES.includes('cisternqueen') && A.MUSIC_CREDITS.cisternqueen, 'THE CISTERN QUEEN has no Sound Test entry of her own');
assert.ok(A.MUSIC_NAMES.includes('banditking') && A.MUSIC_CREDITS.banditking, 'THE BANDIT KING has no Sound Test entry of his own');
for (const n of ['archmage', 'archmage:undead', 'goblinroyal', 'drownedking', 'winchmaster', 'gargoyle', 'puppeteer']) assert.ok(A.MUSIC_NAMES.includes(n), n + ' is not in MUSIC_NAMES (the Sound Test)');
const generic = new Set(['boss', 'boss2', 'boss3', 'boss4', 'king', 'queen']);
for (const [id, name] of [['mage', 'archmage'], ['fallingtower', 'undeadmage'], ['kings', 'king'], ['crown', 'gqueen'], ['keep', 'drownedking'], ['oreroad', 'winchmaster'], ['witchlight', 'gargoyle']]) assert.ok(!generic.has(arena(id).music), name + ' is still on a generic boss track');

// ---- 2. the scheduler, both tracks and the undead voicing
A.initAudio(); A.music.set(true);
const grab = async (name, loops) => {
  const S = BM.bossSynthOf(name); assert.ok(S, name + ' is not a synth boss track'); const len = S.total * S.step;
  events.length = 0; clock = 0; t0 = Date.now(); frozen = null; A.music.play(name);
  const end = len * loops + 1, tries = Math.ceil(end / speed / 0.1) + 6;
  for (let i = 0; i < tries; i++) await new Promise(r => setTimeout(r, 100));
  return { S, len, ev: events.slice() };
};
const fmt = e => e.kind + ':' + e.type + ':' + (e.f === null ? '' : Math.round(e.f * 10) / 10);
const results = {};
const MAXGAP = { drownedking: 3 };   /* (the Bandit King's 6/8 has a drum or a tek on every eighth but the second) */   /* the dirge is in 6/8: its beats are three eighths apart, and the drone and choir ring across the gap */
for (const name of ['archmage', 'archmage:undead', 'goblinroyal', 'drownedking', 'winchmaster', 'gargoyle', 'banditking', 'banditking:p2', 'cisternqueen', 'cisternqueen:p2', 'cisternqueen:p3']) {
  const { S, len, ev } = await grab(name, 2);
  const tonal = ev.filter(e => e.kind === 'osc'), T0 = Math.min(...tonal.map(e => e.t)) - 1e-6, first = tonal.filter(e => e.t >= T0 && e.t < T0 + len - 1e-6), sec = tonal.filter(e => e.t >= T0 + len - 1e-6 && e.t < T0 + 2 * len - 1e-6);
  assert.ok(first.length > 150, name + ': only ' + first.length + ' notes in a loop');
  const density = first.length / len; assert.ok(density < 60, name + ': ' + density.toFixed(1) + ' oscillators a second is too dense (a phone would stutter)');
  // the loop repeats itself: note k of pass one is note k of pass two, one loop later (time offset drifts by less than a step)
  const n = Math.min(first.length, sec.length); assert.ok(n > 100, name + ': the second pass is missing');
  let bad = 0; for (let k = 0; k < n; k++) if (fmt(first[k]) !== fmt(sec[k]) || Math.abs(sec[k].t - first[k].t - len) > 0.02) bad++;
  assert.ok(bad <= 2, name + ': the loop does not repeat exactly (' + bad + ' notes differ across the seam)');
  const gaps = []; const ts = [...new Set(ev.filter(e => e.t >= T0 && e.t < T0 + len - 1e-6).map(e => Math.round((e.t - T0) / S.step)))].sort((a, b) => a - b); for (let k = 1; k < ts.length; k++) gaps.push(ts[k] - ts[k - 1]);
  assert.ok(Math.max(...gaps) <= (MAXGAP[name] || 2), name + ': a hole of ' + Math.max(...gaps) + ' steps in the music');
  const clicks = ev.filter(e => e.kind === 'src' && e.t >= T0 && e.t < T0 + len - 1e-6).length;
  results[name] = { clicks, step: S.step, tonal: first, pitches: new Set(first.map(e => Math.round(e.f))), seconds: +len.toFixed(1), oscPerLoop: first.length, perSecond: +density.toFixed(1), hash: first.map(fmt).join('|') };
}
assert.notEqual(results.archmage.hash, results['archmage:undead'].hash, 'the undead voicing is the same notes as the living one');
// THE UNDEAD ARCHMAGE HAS A SOUND OF HIS OWN (Daniel: "needs to sound a bit different"): his theme rotted, not the living one with a filter
{ const L = results.archmage, U = results['archmage:undead'], hz = s => BM.nf(s);
  assert.ok(U.step > L.step * 1.4, 'the undead theme is not slower (step ' + U.step + ' s against ' + L.step + ' s)');
  assert.ok(U.seconds > L.seconds * 1.4, 'the undead loop is not longer than the living one (' + U.seconds + ' s against ' + L.seconds + ' s)');
  const flat = f => [...U.pitches].some(p => Math.abs(p - Math.round(f * Math.pow(2, -1 / 12))) <= 1);
  assert.ok(flat(hz('D3')) && flat(hz('A2')), 'the undead organ is not a semitone flat of the living one (no Db3 / Ab2 in it)');
  const types = r => new Set(r.tonal.map(e => e.type)); assert.ok(types(L).has('triangle') && !types(U).has('triangle'), "the undead theme still has the living harpsichord's triangle voice");
  assert.ok(U.clicks >= 40 && U.clicks > L.clicks * 4, 'the undead theme has no bone percussion: ' + U.clicks + ' dry clicks a loop against the living ' + L.clicks); }
/* THE BANDIT KING (claude/welltown-fix): 6/8, a war drum, a zurna; his second phase faster with the zurna an octave up */
{ const K = results.banditking, K2 = results['banditking:p2'], S = BM.bossSynthOf('banditking');
  assert.equal(S.total / 16, 6, 'his theme is not in 6/8 (six eighths a bar over 16 bars)');
  assert.ok(K2.step < K.step * 0.85, 'his second phase is not faster (' + K2.step + ' s against ' + K.step + ' s)');
  const lead = r => Math.max(...[...r.pitches].filter(p => p < 2000));
  assert.ok(lead(K2) > lead(K) * 1.8, 'his second phase does not take the zurna up an octave (' + lead(K2) + ' Hz against ' + lead(K) + ')');
  const has = n => [...K.pitches].some(p => Math.abs(p - BM.nf(n) * 0.94) <= 1);   /* (a reed's first pitch is its scoop, 0.94 of the note) */
  assert.ok(has('Eb4') && has('F#4'), 'his zurna does not climb the augmented second (Eb - F#: Phrygian dominant)'); }
/* THE CISTERN QUEEN (claude/welltown3): a low pulsing drone, scraping percussion, a hissing rising motif; the shaft quicker and an octave up, the flood adds the water */
{ const Q = results.cisternqueen, Q2 = results['cisternqueen:p2'], Q3 = results['cisternqueen:p3'], S = BM.bossSynthOf('cisternqueen');
  assert.equal(S.total / 16, 8, 'her theme is not 16 bars of eight eighths');
  assert.ok([...Q.pitches].some(p => Math.abs(p - BM.nf('C#1')) <= 1), 'her drone does not pulse on a low C# (C#1)');
  assert.ok(Q.clicks >= 60, 'her theme has no scraping (' + Q.clicks + ' noise strokes a loop)');
  const rise = ['C#4', 'E4', 'G#4'].map(n => BM.nf(n) * 0.88); assert.ok(rise.every(f => [...Q.pitches].some(p => Math.abs(p - f) <= 1)), 'her hissing motif does not rise C# - E - G#');
  assert.ok(Q2.step < Q.step * 0.85, 'the well shaft is not quicker (' + Q2.step + ' s against ' + Q.step + ' s)');
  assert.ok([...Q2.pitches].some(p => Math.abs(p - BM.nf('G#5') * 0.88) <= 1), 'the well shaft does not take her motif up an octave');
  assert.ok(Q3.oscPerLoop > Q2.oscPerLoop + 40 && [...Q3.pitches].some(p => p >= 1400 && p <= 2300 && !Q2.pitches.has(p)), 'the flood does not add the water (drips) to her theme'); }
const hs = Object.values(results).map(r => r.hash); assert.equal(new Set(hs).size, hs.length, 'two of the boss themes play the same notes');
assert.equal(errors.length, 0, 'the scheduler threw: ' + (errors[0] && errors[0].message));
const gainNow = A.debugAudio().musicGain.gain; A.music.play('archmage'); assert.ok(A.debugAudio().wantTrack === 'archmage');
A.music.stop();
console.log('ok  boss-music   Drowned King (keep, drownedking), Winchmaster (oreroad, winchmaster), Gate Gargoyle (witchlight, gargoyle); Archmages (mage) + Undead Archmage (fallingtower, undead voicing) on the archmage theme, Goblin King + Queen on goblinroyal; ' +
  Object.entries(results).map(([k, v]) => k + ' ' + v.seconds + 's ' + v.perSecond + ' osc/s').join(', ') + '; loops repeat exactly');
process.exit(0);
} catch (e) { console.error(e && e.stack || e); process.exit(1); }
