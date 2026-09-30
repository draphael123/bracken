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
//   'drownedking' THE DROWNED KING. G minor, 6/8 at 50 (eighth = 0.4 s), 16 bars = 38 s: a flooded-hall dirge (sawtooth drone, a bell tolled
//                every other bar, a low detuned choir, a triangle lament, water drips) whose second half SURGES (choir an octave up, a saw
//                doubling the tune, drums in: kick on the one, tom and crack on the four, a tom roll and the big bell to end).
//   'winchmaster' THE WINCHMASTER. E minor, 12/8 at 132 (eighth = 0.152 s), 16 bars = 29 s: a mine-cart chase. Chain rattle on every eighth,
//                anvil (inharmonic bell) on beats two and four, kick on one and three, a pumping bass, a driving sawtooth brass riff, and a
//                RATCHETING WINCH (square ticks that double up) on the last beat of every fourth bar.
//   'gargoyle'   THE GATE GARGOYLE. C with Db and Gb (the tritone), 4/4 at 66 (eighth = 0.455 s), 16 bars = 58 s: a grinding sawtooth
//                stone ostinato, a thud on every quarter, tritone stabs, the great bell and a falling peal of four bells every four bars.
export const BOSS_SYNTH_BASE = { archmage: 1, goblinroyal: 1, drownedking: 1, winchmaster: 1, gargoyle: 1 };

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

/* a struck bell: three inharmonic sine partials, long fall */
function bell(env, f, dur, v, delay) { for (const [r, m] of [[1, 1], [2.76, 0.4], [5.4, 0.22]]) pluck(env, 'sine', f * r, dur / (1 + r * 0.2), v * m, delay); }

// ---------------------------------------------------------------- THE DROWNED KING
// G minor, 6/8 (two dotted-quarter beats of three eighths), dotted-quarter = 50, eighth = 0.4 s, 16 bars = 38.4 s. Bars 0-7 are
// the flooded hall, bars 8-15 are the SURGE (nothing in the game tells the music when he lets go, so the second half is built in).
const DK_STEP = 0.4, DK_LEN = 6, DK_BARSN = 16;
const DK_BASS = ['G1', 'Eb2', 'C2', 'D2', 'G1', 'Eb2', 'C2', 'D2'];                                  // bass root, per bar
const DK_CHOIR = [['G3', 'Bb3', 'D4'], ['Eb3', 'G3', 'Bb3'], ['C3', 'Eb3', 'G3'], ['D3', 'F#3', 'A3']];   // Gm - Eb - Cm - D, a chord a bar pair
const DK_TUNE = [   // the dirge tune (triangle), six eighths a bar; second half doubles it an octave up on a soft saw
  ['D4', '-', '-', 'Bb3', '-', 'C4'],
  ['Bb3', '-', '-', 'G3', '-', '-'],
  ['G4', '-', '-', 'Eb4', '-', 'F4'],
  ['F#4', '-', 'D4', 'A4', '-', '-'],
];
function drownedking(i, delay, variant, env) {
  const bar = Math.floor(i / DK_LEN), s = i % DK_LEN, second = bar >= 8, b = bar % 8, g = env.gain, bass = nf(DK_BASS[b]), long = DK_STEP * DK_LEN, chord = DK_CHOIR[b >> 1];
  if (s === 0) {   // the drone, the choir and the bell
    held(env, 'sawtooth', bass, long * 1.02, (second ? 0.07 : 0.05) * g, delay, { lp: 260, att: 0.5, hold: 0.85 });
    held(env, 'sine', bass * 2, long * 1.02, 0.12 * g, delay, { att: 0.4, hold: 0.85 });
    if (b % 2 === 0) for (const n of chord) held(env, 'sawtooth', nf(n), long * 2 * 0.98, (second ? 0.05 : 0.032) * g, delay, { lp: second ? 720 : 480, att: 1.0, hold: 0.7, det: 18 });   // THE LOW CHOIR, two bars a breath
    if (second && b % 2 === 0) for (const n of chord) held(env, 'sawtooth', nf(n) * 2, long * 2 * 0.98, 0.03 * g, delay, { lp: 1100, att: 1.2, hold: 0.7, det: 26 });          // fuller: the choir an octave up too
    if (b % 2 === 0) bell(env, nf(b === 6 ? 'D3' : 'G3'), 4.5, (second ? 0.2 : 0.17) * g, delay);   // the toll, every other bar
  }
  if (s === 0 || s === 3) pluck(env, 'sine', s === 0 ? bass : bass * 1.5, DK_STEP * 2.6, (s === 0 ? 0.36 : 0.16) * g, delay);   // the 6/8 rocking in the bass
  const nn = nf(DK_TUNE[b & 3][s]);
  if (nn) {
    pluck(env, 'triangle', nn, DK_STEP * 2.4, (second ? 0.1 : 0.085) * g, delay);
    if (second) held(env, 'sawtooth', nn * 2, DK_STEP * 2.2, 0.05 * g, delay, { lp: 1500, att: 0.05, hold: 0.5, det: 8 });
  }
  if (!second && s === 4 && b % 3 === 1) pluck(env, 'sine', nf('D6') * (b === 4 ? 1.5 : 1), 0.45, 0.05 * g, delay);       // water dripping in the hall
  if (second) {    // THE SURGE: drums in
    if (s === 0) { pluck(env, 'sine', 96, 0.4, 0.75 * g, delay, { to: 38 }); noise(env, 0.06, 0.12 * g, 200, 0.7, delay); }
    if (s === 3) { pluck(env, 'sine', 150, 0.3, 0.55 * g, delay, { to: 60 }); noise(env, 0.18, 0.3 * g, 1500, 0.5, delay); }
    if (s === 1 || s === 4) pluck(env, 'sine', 110, 0.14, 0.2 * g, delay, { to: 70 });
    if (bar === 15 && s >= 2) { const tf = [200, 170, 140, 110][s - 2]; if (tf) pluck(env, 'sine', tf, 0.25, 0.6 * g, delay, { to: tf * 0.5 }); }
    if (bar === 15 && s === 5) bell(env, nf('G2'), 5, 0.24 * g, delay);   // the loop ends on the big bell
  }
}

// ---------------------------------------------------------------- THE WINCHMASTER
// E minor with the major on the flat-sixth chord, 12/8 (four dotted-quarter beats), dotted-quarter = 132, eighth = 0.152 s, 16 bars = 29 s.
const WM_STEP = 60 / 132 / 3, WM_LEN = 12, WM_BARSN = 16;
const WM_ROOT = [['E2', 3], ['E2', 3], ['C2', 4], ['D2', 4], ['E2', 3], ['G2', 4], ['A2', 3], ['B1', 4]];   // [bass root, the third in semitones]
const WM_RIFF = [[0, 0], [2, 0], [3, 3], [5, 3], [6, 7], [8, 5], [9, 3]];   // [eighth, semitones above the root]: the driving riff, same every bar
function winchmaster(i, delay, variant, env) {
  const bar = Math.floor(i / WM_LEN), s = i % WM_LEN, second = bar >= 8, b = bar % 8, g = env.gain, [rn, third] = WM_ROOT[b], root = nf(rn), off = k => root * Math.pow(2, k / 12);
  // CHAIN AND ANVIL: a chain rattle on every eighth, the anvil on beats two and four, a kick on one and three
  noise(env, 0.04, (s % 3 === 0 ? 0.075 : 0.04) * g, 7000, 0.6, delay);
  if (s === 0 || s === 6) { pluck(env, 'sine', 115, 0.22, 0.85 * g, delay, { to: 44 }); noise(env, 0.04, 0.1 * g, 260, 0.7, delay); }
  if (s === 3 || s === 9) { bell(env, 880, 0.9, 0.2 * g, delay); noise(env, 0.05, 0.22 * g, 3000, 0.9, delay); }   // the anvil
  if (second && (s === 4 || s === 10)) noise(env, 0.1, 0.2 * g, 1800, 0.5, delay);   // a cart-wheel slap
  // the bass, pumping on the dotted beat
  if (s % 3 === 0) pluck(env, 'sawtooth', root, WM_STEP * 2.4, 0.2 * g, delay, { lp: 420 });
  // THE BRASS RIFF
  for (const [e, k] of WM_RIFF) if (e === s) {
    const top = k === 3 ? third : k;
    held(env, 'sawtooth', off(top) * 2, WM_STEP * (e === 9 ? 3 : 1.5), 0.13 * g, delay, { lp: 1700, att: 0.015, hold: 0.5, from: 0.95 });
    if (second) held(env, 'sawtooth', off(top) * 4, WM_STEP * 1.4, 0.05 * g, delay, { lp: 2600, att: 0.015, hold: 0.5, from: 0.96 });
  }
  // THE RATCHET: the last beat of every fourth bar the winch cranks up, ticks doubling as it goes (and two ticks a step on every bar's last beat in the second half)
  if (s >= 9 && (b % 4 === 3 || second)) {
    const n = b % 4 === 3 ? s - 8 : Math.min(2, s - 8);
    for (let k = 0; k < n; k++) pluck(env, 'square', 820 + (s - 9) * 180 + (bar % 4) * 40, 0.03, 0.05 * g, delay + k * WM_STEP / n, { lp: 3200 });
  }
  if (bar === 15 && s === 11) bell(env, 1100, 1.4, 0.22 * g, delay);   // the loop ends on the winch locking off: one more anvil
}

// ---------------------------------------------------------------- THE GATE GARGOYLE
// C with Db and Gb (the tritone is the whole tune), 4/4 at 66, eighth = 0.455 s, 16 bars = 58 s. Heavy, slow, never stops.
const GG_STEP = 60 / 66 / 2, GG_LEN = 8, GG_BARSN = 16;
const GG_GRIND = ['C2', '-', 'C2', '-', 'C2', 'Db2', 'C2', '-'];   // THE STONE OSTINATO, the same every bar; the last bar of a phrase bends one note to the tritone
const GG_PEAL = ['Gb4', 'Eb4', 'C4', 'Ab3'];   // a peal of four bells falling, end of each four-bar phrase
function gargoyle(i, delay, variant, env) {
  const bar = Math.floor(i / GG_LEN), s = i % GG_LEN, second = bar >= 8, b = bar % 4, g = env.gain, long = GG_STEP * GG_LEN;
  // THE GRIND: the ostinato on a dry saw over a sine, and a slow rasp of stone
  const gn = GG_GRIND[s];
  if (gn !== '-') { const f = nf(gn) * (b === 3 && s === 6 ? nf('Gb2') / nf('C2') : 1); pluck(env, 'sawtooth', f, GG_STEP * 1.6, 0.26 * g, delay, { lp: 360 }); pluck(env, 'sine', f * 0.5, GG_STEP * 1.8, 0.3 * g, delay); }
  if (s === 0 || s === 4) noise(env, GG_STEP * 3.6, 0.12 * g, 420, 1.2, delay);   // stone on stone, a long slow scrape
  // the thud: every quarter, relentless
  if (s % 2 === 0) pluck(env, 'sine', 78, 0.35, (s === 0 ? 0.85 : 0.6) * g, delay, { to: 32 });
  if (second && s % 4 === 2) noise(env, 0.1, 0.26 * g, 1100, 0.6, delay);   // a stone clack on two and four
  // THE TRITONE STABS: C against Gb, on the third beat of the odd bars (second half: every bar, and again on the last eighth)
  if ((s === 4 && (b % 2 === 1 || second)) || (s === 7 && second)) for (const n of ['C3', 'Gb3', 'C4']) held(env, 'square', nf(n), GG_STEP * 1.4, 0.05 * g, delay, { lp: 1000, att: 0.01, hold: 0.4, det: 7 });
  // BELL TOWER: the great bell on the one of each four bars, a falling peal in the last half bar
  if (b === 0 && s === 0) bell(env, nf('C3'), 6, 0.26 * g, delay);
  if (b === 3 && s >= 4) bell(env, nf(GG_PEAL[s - 4]), 3.2, (second ? 0.17 : 0.13) * g, delay);
  if (second && b === 2 && s === 0) bell(env, nf('Gb3'), 5, 0.14 * g, delay);
  if (s === 0 && b === 0) for (const n of second ? ['C2', 'Gb2', 'C3'] : ['C2', 'Gb2']) held(env, 'sawtooth', nf(n), long * 4 * 0.98, 0.03 * g, delay, { lp: 380, att: 1.4, hold: 0.7, det: 14 });   // four bars of low breath underneath
}

export const SYNTH_BOSS = {
  archmage: { step: AM_STEP, total: AM_LEN * AM_BARSN, play: archmage },
  goblinroyal: { step: GR_STEP, total: GR_LEN * GR_BARSN, play: goblinroyal },
  drownedking: { step: DK_STEP, total: DK_LEN * DK_BARSN, play: drownedking },
  winchmaster: { step: WM_STEP, total: WM_LEN * WM_BARSN, play: winchmaster },
  gargoyle: { step: GG_STEP, total: GG_LEN * GG_BARSN, play: gargoyle },
};
/* the whole track's loudness, next to a file track's 0.5 x the file's own level (audio.js trackVol) */
export const BOSS_SYNTH_GAIN = 0.62;

function noise(env, dur, v, freq, q, delay) { env.noise(dur, v, freq, q, delay, env.dest); }
