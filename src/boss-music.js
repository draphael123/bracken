// boss-music.js - THE TWO SYNTH BOSS THEMES (claude/bossmusic, Daniel 2026-09-30): the Archmages share one, the Goblin
// royals share another, and neither is the generic boss recording. Like underleaf / mineworks / deep they have no file:
// audio.js's step scheduler asks SYNTH_BOSS[name] for the step length and the loop length, and calls play() once per
// step with the ac clock offset. Nothing here touches the audio graph except through the `env` audio.js hands in.
//
//   'archmage'   THE ARCHMAGES' THEME. D minor, in 7/8 (grouped 2+2+3), eighth = 0.17 s (about 353 eighths a minute,
//                quarter = 176), 16 bars = 19 s. A harpsichord arpeggio (plucked square + triangle, an octave of sparkle),
//                an organ chord held under it, a choir pad (two detuned saws through a lowpass), a bass on the 2+2+3, a
//                timpani on the bar, and the SPELL MOTIF: three rising notes on the last three eighths of a bar, each a
//                step up the chord (root-third-fifth then a bell an octave over). The chords go Dm - Bb - Gm - A7, then
//                Eb (the flat second: Phrygian) - Cm - Bdim - A7 held, and the second eight bars come round with the
//                organ doubled at the octave, the arpeggio an octave up and the motif doubled below. No drum kit: the only percussion is the timpani.
//                'archmage:undead' is the same 16 bars for the Undead Archmage: the arpeggio an octave down on a
//                sawtooth (a dry rasp, no sparkle), the choir detuned wide and lowpassed dark, the organ a fourth lower,
//                a tolling bell on every fourth bar and a low breath of noise under the bar.
//   'goblinroyal' THE GOBLIN ROYALS' THEME. F Phrygian dominant, 4/4 marched at 116 (eighth = 0.259 s), 16 bars = 33 s.
//                War drums (a low kick on 1 and 3, a cracked snare on 2 and 4, toms falling over every fourth bar),
//                low brass stabs on a swaggering 3+3+2, a CRUDE FANFARE (a sawtooth trumpet, dotted and a little sharp,
//                that gets its last note wrong on purpose) and a MOCKING BASSOON / kazoo line (a narrow lowpassed square with a
//                scoop into every note) that waddles a pompous tune in the second half and ends the loop on a
//                trombone-fail slide down. Menacing, and a little absurd.
export const BOSS_SYNTH_BASE = { archmage: 1, goblinroyal: 1 };

/* 'archmage:undead' is one name for the sound test and two for the scheduler: split it once, here. */
export function splitTrack(name) { const s = String(name || ''), i = s.indexOf(':'); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]; }
export const bossSynthOf = name => { const [b, v] = splitTrack(name); return BOSS_SYNTH_BASE[b] ? { base: b, variant: v, ...SYNTH_BOSS[b] } : null; };

const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/* 'Bb3' -> Hz (A4 = 440); null / '-' -> null */
export function nf(s) {
  if (!s || s === '-') return null; const m = /^([A-G])([#b]?)(\d)$/.exec(s); if (!m) throw new Error('boss-music: bad note ' + s);
  return 440 * Math.pow(2, (SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) - 4) * 12 - 9) / 12);
}

/* the voices. env = { ac, dest, noise(dur, v, freq, q, delay, dest), gain } - gain is the loudness of the whole track */
function pluck(env, type, f, dur, v, delay, extra) {   /* a struck note: tone() minus the sfx detune, with an optional lowpass */
  const { ac, dest } = env, t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, (extra && extra.to) || f), t + dur);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  if (extra && extra.lp) { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = extra.lp; lp.Q.value = 0.7; o.connect(lp); lp.connect(g); } else o.connect(g);
  g.connect(dest); o.start(t); o.stop(t + dur + 0.03);
}
/* a held or blown note: 1-2 oscillators (detuned by +-det cents), a lowpass, a swell in and a fall out. from: start pitch ratio (a scoop) */
function held(env, type, f, dur, v, delay, o2) {
  const { ac, dest } = env, opt = { lp: 1600, att: 0.05, hold: 0.6, det: 0, from: 1, to: 1, ...o2 }, t = ac.currentTime + delay;
  const f1 = ac.createBiquadFilter(), g = ac.createGain(); f1.type = 'lowpass'; f1.frequency.value = opt.lp; f1.Q.value = 0.7;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + opt.att); g.gain.setValueAtTime(v, t + Math.max(opt.att, dur * opt.hold)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  f1.connect(g); g.connect(dest);
  for (const d of opt.det ? [-opt.det, opt.det] : [0]) {
    const o = ac.createOscillator(); o.type = type; if (d) o.detune.value = d;
    o.frequency.setValueAtTime(f * opt.from, t); o.frequency.linearRampToValueAtTime(f * (opt.slide ? opt.to : 1), t + (opt.slide ? dur : Math.min(dur, 0.06 + opt.att)));   /* from: a scoop up into the note; slide: a fall over the whole of it */
    o.connect(f1); o.start(t); o.stop(t + dur + 0.05);
  }
}

// ---------------------------------------------------------------- THE ARCHMAGES
// per bar: [bass, organ chord (low to high), arp (four notes, one per eighth of the first four), motif start (three notes up)]
const AM_BARS = [
  ['D2', ['D3', 'A3', 'F4'],  ['D4', 'F4', 'A4', 'F4'],  ['D5', 'F5', 'A5']],     // Dm
  ['Bb1', ['Bb2', 'F3', 'D4'], ['Bb3', 'D4', 'F4', 'D4'], ['F5', 'A5', 'D6']],    // Bb
  ['G2', ['G2', 'D3', 'Bb3'], ['G3', 'Bb3', 'D4', 'Bb3'], ['D5', 'G5', 'Bb5']],   // Gm
  ['A1', ['A2', 'E3', 'G3'],  ['A3', 'C#4', 'E4', 'G4'],  ['E5', 'G5', 'C#6']],   // A7 (the leading note)
  ['Eb2', ['Eb3', 'Bb3', 'G4'], ['Eb4', 'G4', 'Bb4', 'G4'], ['Bb4', 'D5', 'G5']],  // Eb: the flat second, Phrygian
  ['C2', ['C3', 'G3', 'Eb4'], ['C4', 'Eb4', 'G4', 'Eb4'], ['G4', 'Bb4', 'Eb5']],   // Cm
  ['B1', ['B2', 'F3', 'D4'],  ['B3', 'D4', 'F4', 'D4'],  ['F5', 'Ab5', 'D6']],    // Bdim
  ['A1', ['A2', 'E3', 'G3'],  ['A3', 'E4', 'G4', 'C#5'], ['A5', 'C#6', 'E6']],    // A7 held: the door back to Dm
];
const AM_STEP = 0.17, AM_LEN = 7, AM_BARSN = 16;
function archmage(i, delay, variant, env) {
  const u = variant === 'undead', bar = Math.floor(i / AM_LEN), s = i % AM_LEN, second = bar >= 8, row = AM_BARS[bar % 8], long = AM_STEP * AM_LEN, g = env.gain;
  const [bass, organ, arp, motif] = row;
  if (s === 0) {   // the bar: a timpani, the bass, the organ and (every four bars) the choir
    pluck(env, 'sine', u ? 66 : 84, 0.5, 0.55 * g, delay, { to: u ? 34 : 46 });
    pluck(env, 'sine', nf(bass), long * 0.9, (u ? 0.5 : 0.4) * g, delay);
    for (const n of organ) held(env, 'sawtooth', nf(n) * (u ? 0.75 : 1), long * 1.02, (second ? 0.055 : 0.04) * g, delay, { lp: u ? 500 : 900, att: 0.08, hold: 0.85 });
    if (second) for (const n of organ) held(env, 'square', nf(n) * 2 * (u ? 0.75 : 1), long * 1.0, 0.018 * g, delay, { lp: 1200, att: 0.1, hold: 0.85 });
    if (bar % 4 === 0) for (const n of organ) held(env, 'sawtooth', nf(n) * 2, long * 4 * 0.98, (second ? 0.05 : 0.035) * g, delay, { lp: u ? 620 : 1250, att: 0.9, hold: 0.7, det: u ? 32 : 9 });   // THE CHOIR, four bars a breath
    if (u && bar % 4 === 0) noise(env, long * 1.6, 0.05 * g, 240, 0.6, delay);   // a low breath under the bar
    if (u && bar % 4 === 2) for (const [r, m] of [[1, 1], [2.76, 0.4], [5.4, 0.25]]) pluck(env, 'sine', 196 * r, 2.4 / (1 + r * 0.2), 0.16 * m * g, delay);   // the bell tolls
  }
  if (s === 2 || s === 4) pluck(env, 'sine', nf(bass) * 1.5, AM_STEP * 2.4, 0.16 * g, delay);   // the 2+2+3 in the bass
  if (s < 4) {     // the harpsichord: a pluck and its octave
    const n = nf(arp[s]) * (u ? 0.5 : 1) * (second && !u ? 2 : 1);
    if (u) pluck(env, 'sawtooth', n, AM_STEP * 1.5, 0.08 * g, delay, { lp: 900 });
    else { pluck(env, 'square', n, AM_STEP * 1.1, 0.06 * g, delay, { lp: 3800 }); pluck(env, 'triangle', n * 2, AM_STEP * 0.9, 0.05 * g, delay); }
  } else {         // the spell: three notes up, the last one held
    const k = s - 4, n = nf(motif[k]) * (u ? 0.5 : 1);
    if (u) { pluck(env, 'sawtooth', n, AM_STEP * (k === 2 ? 3 : 1.4), 0.075 * g, delay, { lp: 1200 }); }
    else { pluck(env, 'triangle', n, AM_STEP * (k === 2 ? 3.2 : 1.3), 0.11 * g, delay); pluck(env, 'sine', n * 2, AM_STEP * (k === 2 ? 3.6 : 1.2), 0.05 * g, delay); if (second) pluck(env, 'square', n * 0.5, AM_STEP * (k === 2 ? 3 : 1.2), 0.03 * g, delay, { lp: 1500 }); }
    if (k === 2 && bar % 4 === 3) noise(env, 0.5, 0.05 * g, 5200, 0.9, delay);   // a shimmer at the end of the phrase
  }
}

// ---------------------------------------------------------------- THE GOBLIN ROYALS
const GR_STEP = 60 / 116 / 2, GR_LEN = 8, GR_BARSN = 16;
const GR_ROOT = ['F2', 'F2', 'Db2', 'C2', 'F2', 'Bb1', 'Gb2', 'C2'];   // bass root, per bar of eight
// the crude fanfare (bars 0-3 of each half): call, answer, call lower, and the wrong note
const GR_FAN = [
  ['C4', '-', 'C4', 'C4', 'F4', '-', '-', '-'],
  ['Ab4', '-', 'Ab4', 'G4', 'A4', '-', '-', '-'],
  ['C4', '-', 'C4', 'C4', 'Db4', '-', 'Db4', '-'],
  ['Eb4', 'Db4', 'C4', '-', 'Gb4', '-', '-', '-'],    // Gb over C: not the note the chord wanted
];
// the bassoon tune (second half, bars 4-7): a pompous waddle, staccato, on the off eighths
const GR_BAS = [
  ['F3', '-', 'A3', 'F3', '-', 'C4', '-', 'A3'],
  ['Bb3', '-', 'F3', 'Bb3', '-', 'Db4', '-', 'Bb3'],
  ['Gb3', '-', 'Bb3', 'Gb3', '-', 'Db4', '-', 'C4'],
  ['C4', 'Bb3', 'Ab3', 'F3', '-', '-', '-', '-'],
];
function goblinroyal(i, delay, variant, env) {
  const bar = Math.floor(i / GR_LEN), s = i % GR_LEN, second = bar >= 8, b = bar % 8, g = env.gain, root = nf(GR_ROOT[b]), rootHi = root * 2;
  const fill = b === 3 || b === 7;
  // WAR DRUMS
  if (s === 0 || s === 4) { pluck(env, 'sine', 130, 0.28, 0.9 * g, delay, { to: 42 }); noise(env, 0.05, 0.14 * g, 240, 0.7, delay); }
  if ((s === 2 || s === 6) && !(fill && s === 6)) noise(env, 0.14, 0.42 * g, 1900, 0.5, delay);              // the cracked snare
  if (second && (s === 1 || s === 5)) pluck(env, 'sine', 100, 0.12, 0.25 * g, delay, { to: 62 });            // second time round the drum answers itself
  if (fill && s >= 5) { const tf = [190, 150, 118][s - 5]; pluck(env, 'sine', tf, 0.22, 0.75 * g, delay, { to: tf * 0.55 }); noise(env, 0.06, 0.16 * g, 700, 0.8, delay); }   // toms falling over the bar
  // LOW BRASS STABS on 3 + 3 + 2, the fifth on top
  if (s === 0 || s === 3 || s === 6) {
    const len = s === 6 ? 0.2 : 0.36, v = (s === 0 ? 0.16 : 0.12) * g;
    held(env, 'sawtooth', root * 1.0, len, v, delay, { lp: 720, att: 0.025, hold: 0.35, from: 0.965 });
    held(env, 'sawtooth', root * 1.5, len, v * 0.7, delay, { lp: 620, att: 0.03, hold: 0.35, from: 0.97 });
    if (s === 0 && (second || b % 2 === 0)) held(env, 'sawtooth', rootHi, len * 1.2, v * 0.55, delay, { lp: 900, att: 0.03, hold: 0.4, from: 0.96 });
  }
  // THE CRUDE FANFARE: bars 0-3 of each half (and cut short in the second, so the bassoon can speak)
  if (b < 4) {
    const nn = nf(GR_FAN[b][s]);
    if (nn) { const last = GR_FAN[b][s] === 'Gb4', sharp = s % 2 ? 1.025 : 1.012, len = GR_STEP * (s === 4 || last ? 3.4 : 1.2);
      held(env, 'sawtooth', nn * (last ? 1.03 : sharp), len, (second ? 0.13 : 0.11) * g, delay, { lp: 2400, att: 0.02, hold: 0.6, det: 14, from: 0.94 }); }
  } else if (second) {   // THE MOCKING BASSOON: staccato, scooped, through a narrow lowpass
    const nn = nf(GR_BAS[b - 4][s]);
    if (nn) held(env, 'square', nn, GR_STEP * 1.1, 0.085 * g, delay, { lp: 1000, att: 0.012, hold: 0.5, from: 0.9, det: 6 });
  } else if (s === 0 || s === 4) {   // first time round the bars 4-7 are brass and drum alone, a held mock-solemn chord on the one
    held(env, 'sawtooth', nf('C4') * (b % 2 ? 0.94 : 1), GR_STEP * 3.6, 0.06 * g, delay, { lp: 1100, att: 0.1, hold: 0.7, det: 22 });
  }
  // THE LOOP ENDS ON THE FAIL: bar 15, the last three eighths: a trombone sliding down and losing heart
  if (bar === 15 && s === 5) held(env, 'sawtooth', nf('Db4'), GR_STEP * 3.4, 0.11 * g, delay, { lp: 1500, att: 0.03, hold: 0.3, from: 1, to: 0.55, slide: 1, det: 10 });
}

export const SYNTH_BOSS = {
  archmage: { step: AM_STEP, total: AM_LEN * AM_BARSN, play: archmage },
  goblinroyal: { step: GR_STEP, total: GR_LEN * GR_BARSN, play: goblinroyal },
};
/* the whole track's loudness, next to a file track's 0.5 x the file's own level (audio.js trackVol) */
export const BOSS_SYNTH_GAIN = 0.62;

function noise(env, dur, v, freq, q, delay) { env.noise(dur, v, freq, q, delay, env.dest); }
