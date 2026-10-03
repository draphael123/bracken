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
//                'archmage:undead' is the Undead Archmage's own CORRUPTED ECHO of it (see THE UNDEAD ARCHMAGE below): the same spell motif,
//                slower, a semitone flat, a darker mode, on a detuned pipe organ, a low choir, bone percussion and a slow bell.
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
//   'banditking' THE BANDIT KING (claude/welltown-fix, his own theme). D Phrygian dominant, 6/8 at 76 (eighth = 0.263 s), 16 bars = 25 s:
//                a war-drum ostinato, a D-A drone, a reedy zurna lead with a late vibrato, and a half-step off-beat stab. 'banditking:p2' is his
//                second phase: faster (eighth 0.21 s), the zurna an octave up, the drum doubled.
//   'cisternqueen' THE CISTERN QUEEN (claude/welltown3). C# Phrygian, 4/4 at 91, 16 bars = 42 s: a low pulsing drone, scraping percussion, a hissing rising motif;
//                ':p2' (the well shaft) quicker with the motif an octave up, ':p3' (the flood) adds the water: a surge and drips.
export const BOSS_SYNTH_BASE = { archmage: 1, goblinroyal: 1, drownedking: 1, winchmaster: 1, gargoyle: 1, banditking: 1, cisternqueen: 1, gorgecrab: 1 };

/* 'archmage:undead' is one name for the sound test and two for the scheduler: split it once, here. */
/* ...and it has a clock of its own (slower than the living theme's), so a variant may carry its own step / loop / voice. */
export function splitTrack(name) { const s = String(name || ''), i = s.indexOf(':'); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]; }
export const bossSynthOf = name => { const [b, v] = splitTrack(name); return BOSS_SYNTH_BASE[b] ? { base: b, variant: v, ...SYNTH_BOSS[b], ...(SYNTH_VARIANT[b + ':' + v] || null) } : null; };

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
  const bar = Math.floor(i / AM_LEN), s = i % AM_LEN, second = bar >= 8, row = AM_BARS[bar % 8], long = AM_STEP * AM_LEN, g = env.gain;
  const [bass, organ, arp, motif] = row;
  if (s === 0) {   // the bar: a timpani, the bass, the organ and (every four bars) the choir
    pluck(env, 'sine', 84, 0.5, 0.55 * g, delay, { to: 46 });
    pluck(env, 'sine', nf(bass), long * 0.9, 0.4 * g, delay);
    for (const n of organ) held(env, 'sawtooth', nf(n), long * 1.02, (second ? 0.055 : 0.04) * g, delay, { lp: 900, att: 0.08, hold: 0.85 });
    if (second) for (const n of organ) held(env, 'square', nf(n) * 2, long * 1.0, 0.018 * g, delay, { lp: 1200, att: 0.1, hold: 0.85 });
    if (bar % 4 === 0) for (const n of organ) held(env, 'sawtooth', nf(n) * 2, long * 4 * 0.98, (second ? 0.05 : 0.035) * g, delay, { lp: 1250, att: 0.9, hold: 0.7, det: 9 });   // THE CHOIR, four bars a breath
  }
  if (s === 2 || s === 4) pluck(env, 'sine', nf(bass) * 1.5, AM_STEP * 2.4, 0.16 * g, delay);   // the 2+2+3 in the bass
  if (s < 4) {     // the harpsichord: a pluck and its octave
    const n = nf(arp[s]) * (second ? 2 : 1);
    pluck(env, 'square', n, AM_STEP * 1.1, 0.06 * g, delay, { lp: 3800 }); pluck(env, 'triangle', n * 2, AM_STEP * 0.9, 0.05 * g, delay);
  } else {         // the spell: three notes up, the last one held
    const k = s - 4, n = nf(motif[k]);
    pluck(env, 'triangle', n, AM_STEP * (k === 2 ? 3.2 : 1.3), 0.11 * g, delay); pluck(env, 'sine', n * 2, AM_STEP * (k === 2 ? 3.6 : 1.2), 0.05 * g, delay); if (second) pluck(env, 'square', n * 0.5, AM_STEP * (k === 2 ? 3 : 1.2), 0.03 * g, delay, { lp: 1500 });
    if (k === 2 && bar % 4 === 3) noise(env, 0.5, 0.05 * g, 5200, 0.9, delay);   // a shimmer at the end of the phrase
  }
}

// ---------------------------------------------------------------- THE UNDEAD ARCHMAGE: HIS THEME, ROTTED
// A CORRUPTED ECHO of 'archmage' (Daniel, 2026-10-01: "needs to sound a bit different"). The same 16 bars of 7/8 and the same SPELL MOTIF
// (three notes climbing the chord on the last three eighths of the bar, so you know whose it is), but: slower (eighth = 0.30 s against 0.17,
// the loop 33.6 s against 19), a SEMITONE FLAT (everything x 2^(-1/12)), and darker - the fifth of every organ chord is dropped a semitone
// (a Locrian cloud: Dm becomes Db-with-a-flat-fifth, and the Phrygian Eb bar lands a tone under the tonic), the motif's held last note slips a
// semitone more at the end of each four-bar phrase, and no note is quite in tune. The voices change too: a DETUNED PIPE ORGAN carries the
// motif and the chords (no harpsichord), a LOW CHOIR breathes under every four bars, BONE PERCUSSION (dry clicks and knocks on the 2+2+3, a
// rattle of three before each phrase turns) stands in for the timpani, and a slow BELL TOLLS every other bar. The only randomness is
// seeded by the step number, so it repeats exactly on every loop.
export const UD_STEP = 0.30, UD_LEN = AM_LEN;
const FLAT = Math.pow(2, -1 / 12);
const seeded = n => { let t = (n * 2654435761 + 0x6D2B79F5) | 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };   /* a repeatable 0..1 per number */
function undeadmage(i, delay, variant, env) {
  const bar = Math.floor(i / UD_LEN), s = i % UD_LEN, second = bar >= 8, b = bar % 8, [bass, organ, , motif] = AM_BARS[b], long = UD_STEP * UD_LEN, g = env.gain;
  const drift = k => FLAT * Math.pow(2, (seeded(i * 7 + k) - 0.5) * 0.033);   /* each note a little out of tune, up to about 20 cents either way, from the step number alone */
  if (s === 0) {   // the bar: a muffled knock instead of a timpani, the bass, the detuned organ and (every four bars) the choir
    pluck(env, 'sine', 58, 0.6, 0.4 * g, delay, { to: 32 });
    pluck(env, 'sine', nf(bass) * FLAT, long * 0.9, 0.42 * g, delay);
    organ.forEach((n, k) => {   // THE PIPE ORGAN: two saws a wide way apart, its fifth dropped (Bdim's already flat), and a quiet 4-foot square above in the second half
      const f = nf(n) * FLAT * (k === 1 && b !== 6 ? FLAT : 1);
      held(env, 'sawtooth', f, long * 1.02, (second ? 0.058 : 0.045) * g, delay, { lp: 560, att: 0.12, hold: 0.88, det: 26 });
      if (second) held(env, 'square', f * 2, long * 1.0, 0.016 * g, delay, { lp: 900, att: 0.14, hold: 0.85, det: 17 });
    });
    if (bar % 4 === 0) for (const n of organ) held(env, 'sawtooth', nf(n) * FLAT, long * 4 * 0.98, (second ? 0.05 : 0.036) * g, delay, { lp: 430, att: 1.2, hold: 0.7, det: 38 });   // THE LOW CHOIR: the chord itself, not an octave up, four bars a breath
    if (bar % 4 === 0) noise(env, long * 1.6, 0.045 * g, 220, 0.6, delay);   // a low breath under the bar
    if (bar % 2 === 0) for (const [r, m] of [[1, 1], [2.76, 0.4], [5.4, 0.25]]) pluck(env, 'sine', 174 * FLAT * r, 3.4 / (1 + r * 0.2), 0.17 * m * g, delay);   // THE BELL TOLLS, slow: every other bar, a note lower than the living tune's
  }
  // BONE PERCUSSION on the 2+2+3: a knock on the one, a dry click on the 2 and the 4 (a little behind or ahead, seeded), a rattle before the phrase turns
  const late = (seeded(i) - 0.5) * 0.03;
  if (s === 0) { pluck(env, 'sine', 190 * (0.9 + seeded(i + 1) * 0.2), 0.07, 0.2 * g, delay, { to: 110 }); noise(env, 0.03, 0.12 * g, 2600, 6, delay); }
  if (s === 2 || s === 4) { noise(env, 0.025, (s === 2 ? 0.16 : 0.12) * g, 3400 + seeded(i + 2) * 900, 8, delay + late); if (second) pluck(env, 'square', 420 * (0.9 + seeded(i + 3) * 0.2), 0.03, 0.04 * g, delay + late, { lp: 1800 }); }
  if (s === 6 && b % 4 === 3) for (let k = 0; k < 3; k++) noise(env, 0.02, 0.1 * g, 3000 + k * 450, 9, delay + k * 0.07 + 0.02);   // the rattle
  if (s === 2 || s === 4) pluck(env, 'sine', nf(bass) * FLAT * 1.5, UD_STEP * 2.2, 0.15 * g, delay);   // the 2+2+3 in the bass, as before
  if (s >= 4) {         // THE SPELL, the same three notes up, now on the pipe organ: each a semitone flat and out of tune, the held last one slipping more at the phrase end
    const k = s - 4, slip = k === 2 && b % 4 === 3 ? FLAT : 1, n = nf(motif[k]) * drift(k) * slip, len = UD_STEP * (k === 2 ? 3.2 : 1.35);
    held(env, 'sawtooth', n, len, 0.07 * g, delay, { lp: 1100, att: 0.05, hold: 0.55, det: 21 });
    held(env, 'sawtooth', n * 0.5, len, 0.045 * g, delay, { lp: 480, att: 0.07, hold: 0.55, det: 15 });
    if (second) held(env, 'square', n * 2, len, 0.02 * g, delay, { lp: 1300, att: 0.06, hold: 0.5, det: 25 });
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

// ---------------------------------------------------------------- THE BANDIT KING (claude/welltown-fix: his own theme, Daniel's brief 10-02)
// D Phrygian dominant (D Eb F# G A Bb C), 6/8 (two dotted-quarter beats of three eighths), dotted-quarter = 76, eighth = 0.263 s, 16 bars = 25 s.
//   THE WAR DRUM OSTINATO: a big low drum on the one, a second on the four, a dry tek on the three and the six, a ghost on the five; a roll
//     over the last three eighths of every fourth bar.
//   THE DRONE: D and A on two detuned saws under a sub, four bars a breath (Phrygian dominant hangs on its tonic).
//   THE ZURNA: a reedy lead (a narrow square and a quieter saw through a lowpass, a scoop into the note, and a vibrato that comes in late,
//     drawn as frequency automation so it costs no oscillator), climbing the augmented second (Eb - F#) and falling back. Second time round
//     (bars 8-15) a grace note a step above leads into each long note.
//   THE OFF-BEAT STAB: on the "and" of the second beat (eighth five) a low brass stab that steps a HALF-STEP, D and then Eb, two bars each.
// 'banditking:p2' is HIS SECOND PHASE (src/gang-leader.js plays it at half health: THE GANG LEADER, the King's old courtyard, keeps the theme): the same piece faster (eighth 0.21 s), the
// zurna an octave up, the drum doubled on the twos.
const BKM_STEP = 60 / 76 / 3, BKM_LEN = 6, BKM_BARSN = 16, BKM_STEP2 = 60 / 95 / 3;
const BKM_TUNE = [   // the zurna, six eighths a bar ('-' holds the note before)
  ['A4', '-', 'G4', 'F#4', '-', 'Eb4'],
  ['D4', '-', '-', '-', '-', '-'],
  ['D4', 'Eb4', 'F#4', 'G4', '-', 'A4'],
  ['Bb4', 'A4', 'G4', 'A4', '-', '-'],
  ['A4', '-', 'Bb4', 'A4', 'G4', 'F#4'],
  ['G4', '-', 'F#4', 'Eb4', '-', 'F#4'],
  ['Eb4', '-', 'D4', 'C4', '-', 'Eb4'],
  ['D4', '-', '-', '-', '-', '-'],
];
const BKM_STAB = ['D3', 'D3', 'Eb3', 'Eb3'];   // the half-step stab, two bars each
/* A REED (the zurna): a scoop up into the note, then a vibrato that arrives late - automation on the oscillators' own pitch, no LFO oscillator */
function reed(env, f, dur, v, delay, o2) {
  const { ac, dest } = env, opt = { lp: 2600, rate: 6.2, depth: 0.014, late: 0.14, ...o2 }, t = ac.currentTime + delay;
  const lp = ac.createBiquadFilter(), g = ac.createGain(); lp.type = 'lowpass'; lp.frequency.value = opt.lp; lp.Q.value = 1.4;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.025); g.gain.setValueAtTime(v, t + dur * 0.75); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  lp.connect(g); g.connect(dest);
  for (const [type, k, det] of [['square', 1, 0], ['sawtooth', 0.45, 7]]) {
    const o = ac.createOscillator(), og = ac.createGain(); o.type = type; if (det) o.detune.value = det; og.gain.value = k;
    o.frequency.setValueAtTime(f * 0.94, t); o.frequency.linearRampToValueAtTime(f, t + 0.05);
    for (let q = t + opt.late, up = true; q < t + dur; q += 0.5 / opt.rate, up = !up) o.frequency.linearRampToValueAtTime(f * (1 + (up ? opt.depth : -opt.depth)), q);
    o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 0.05);
  }
}
function banditking(i, delay, variant, env) {
  const p2 = variant === 'p2', step = p2 ? BKM_STEP2 : BKM_STEP, bar = Math.floor(i / BKM_LEN), s = i % BKM_LEN, second = bar >= 8, b = bar % 8, g = env.gain, long = step * BKM_LEN;
  // THE WAR DRUM
  if (s === 0) { pluck(env, 'sine', 88, 0.42, 0.95 * g, delay, { to: 40 }); noise(env, 0.06, 0.14 * g, 220, 0.7, delay); }
  if (s === 3) { pluck(env, 'sine', 104, 0.32, 0.7 * g, delay, { to: 50 }); noise(env, 0.05, 0.1 * g, 260, 0.7, delay); }
  if (s === 2 || s === 5) noise(env, 0.05, (s === 5 ? 0.15 : 0.11) * g, 3100, 1.2, delay);              // the teks
  if (s === 4) noise(env, 0.03, 0.06 * g, 3600, 1.4, delay);                                              // the ghost
  if (p2 && (s === 1 || s === 4)) pluck(env, 'sine', 120, 0.16, 0.35 * g, delay, { to: 70 });            // the second phase doubles the drum
  if (b % 4 === 3 && s >= 3) { const tf = [170, 140, 118][s - 3]; pluck(env, 'sine', tf, 0.22, 0.7 * g, delay, { to: tf * 0.55 }); }   // the roll into the next phrase
  // THE DRONE, four bars a breath, and a sub under it every bar
  if (s === 0 && bar % 4 === 0) for (const n of ['D2', 'A2']) held(env, 'sawtooth', nf(n), long * 4 * 0.98, (second || p2 ? 0.055 : 0.045) * g, delay, { lp: 460, att: 0.7, hold: 0.8, det: 11 });
  if (s === 0) pluck(env, 'sine', nf('D2'), long * 0.95, 0.28 * g, delay);
  // THE OFF-BEAT STAB, a half-step: D, then Eb
  if (s === 4) { const r = nf(BKM_STAB[(bar >> 1) % 4]); held(env, 'sawtooth', r, step * 0.9, 0.11 * g, delay, { lp: 900, att: 0.012, hold: 0.3, from: 0.97 }); held(env, 'sawtooth', r * 1.5, step * 0.9, 0.07 * g, delay, { lp: 800, att: 0.015, hold: 0.3, from: 0.97 }); }
  // THE ZURNA (an octave up in his second phase)
  const row = BKM_TUNE[b], nn = row[s];
  if (nn !== '-') { let k = 1; while (s + k < BKM_LEN && row[s + k] === '-') k++;
    const f = nf(nn) * (p2 ? 2 : 1), len = step * k * 0.96, v = (p2 ? 0.075 : 0.085) * g;
    if (second && k >= 2) { reed(env, f * Math.pow(2, 2 / 12), step * 0.3, v * 0.8, delay, { late: 1 }); reed(env, f, len - step * 0.25, v, delay + step * 0.25); }   // a grace note a step above leads into a long note
    else reed(env, f, len, v, delay); }
}

// ---------------------------------------------------------------- THE CISTERN QUEEN (claude/welltown3: her own theme, Daniel's spec 10-02)
// C# Phrygian (C# D E F# G# A B), 4/4, eighth = 0.33 s (quarter = 91), 16 bars = 42 s. Under the town, in the dark: menace that crawls.
//   THE DRONE: a low C# that PULSES - a sub sine struck on every quarter and two detuned saws under a lowpass that breathe in and out over two bars,
//     the fifth (G#) joining in the second half, and the flat second (D) leaning on it in bars 7 and 15.
//   THE SCRAPING: chitin on stone - a narrow high noise scraped on the off-beats (a longer drag on the 'and' of four), a dry click of claws on every
//     eighth (a short square tick, alternating pitch), a low stone knock on the one.
//   THE HISSING MOTIF: three notes that RISE (C# - E - G#, then D - F# - A, then E - G# - B: each bar a step higher) on a thin saw scooped up into each
//     note with a hiss of noise under it, on the last three eighths of every other bar - the tail coming up.
// 'cisternqueen:p2' THE WELL SHAFT (her second phase, src/cistern-queen-hands.js): quicker (eighth 0.27 s), the motif an octave up and every bar,
//   the clicks doubled. 'cisternqueen:p3' THE FLOOD: the same quick clock, and the WATER comes in - a SURGE (a low sine falling a fifth under a
//   swell of wide noise) every two bars and drips (high sine plinks) on the off-beats.
const CQM_STEP = 60 / 91 / 2, CQM_STEP2 = 60 / 111 / 2, CQM_LEN = 8, CQM_BARSN = 16;
const CQM_MOTIF = [['C#4', 'E4', 'G#4'], ['D4', 'F#4', 'A4'], ['E4', 'G#4', 'B4'], ['D4', 'F#4', 'A4']];
function cisternqueen(i, delay, variant, env) {
  const fast = variant === 'p2' || variant === 'p3', flood = variant === 'p3', step = fast ? CQM_STEP2 : CQM_STEP, bar = Math.floor(i / CQM_LEN), s = i % CQM_LEN, second = bar >= 8, g = env.gain, b = bar % 8;
  // THE DRONE: the sub on every quarter, the breathing saws every two bars (the fifth in the second half, the flat second leaning on it)
  if (s % 2 === 0) pluck(env, 'sine', nf('C#1') * (b === 6 && s >= 4 ? Math.pow(2, 1 / 12) : 1), step * 1.9, (s === 0 ? 0.5 : 0.32) * g, delay, { to: nf('C#1') * 0.97 });
  if (s === 0 && bar % 2 === 0) { const ns = second || fast ? ['C#2', 'G#2'] : ['C#2']; for (const n of ns) held(env, 'sawtooth', nf(n), step * CQM_LEN * 2 * 0.98, (fast ? 0.06 : 0.05) * g, delay, { lp: 380, att: step * 6, hold: 0.55, det: 14 }); }
  if (s === 0 && b === 6) held(env, 'sawtooth', nf('D2'), step * CQM_LEN * 0.95, 0.05 * g, delay, { lp: 420, att: 0.4, hold: 0.6, det: 9 });
  // THE SCRAPING: the stone knock, the claws' clicks, the scrape on the off-beats
  if (s === 0) { pluck(env, 'sine', 70, 0.3, 0.6 * g, delay, { to: 38 }); noise(env, 0.05, 0.12 * g, 300, 0.8, delay); }
  pluck(env, 'square', s % 2 ? 1900 : 2400, 0.03, (fast ? 0.035 : 0.028) * g, delay, { lp: 3200 });
  if (fast) pluck(env, 'square', 2150, 0.025, 0.022 * g, delay + step / 2, { lp: 3000 });
  if (s % 2 === 1) noise(env, s === 7 ? step * 0.95 : step * 0.45, (s === 7 ? 0.07 : 0.045) * g, s === 7 ? 4200 : 5200, 9, delay);
  // THE HISSING MOTIF: three notes rising, scooped, with a hiss under each (every other bar; every bar in her later phases)
  if (s >= 5 && (fast || bar % 2 === 1)) { const row = CQM_MOTIF[(bar >> (fast ? 0 : 1)) % 4], n = nf(row[s - 5]) * (variant === 'p2' ? 2 : 1), last = s === 7;
    held(env, 'sawtooth', n, step * (last ? 2.4 : 1.0), 0.05 * g, delay, { lp: 2200, att: 0.03, hold: 0.5, from: 0.88 });
    held(env, 'triangle', n * 2, step * (last ? 2.0 : 0.9), 0.03 * g, delay, { lp: 3000, att: 0.03, hold: 0.4, from: 0.9 });
    noise(env, step * 0.8, 0.04 * g, 6400 + (s - 5) * 900, 4, delay); }
  // THE FLOOD (her third phase): the surge every two bars, drips on the off-beats
  if (flood) { if (s === 0 && bar % 2 === 0) { pluck(env, 'sine', nf('G#2'), step * 6, 0.32 * g, delay, { to: nf('C#2') }); noise(env, step * 5, 0.06 * g, 500, 0.5, delay); }
    if (s % 2 === 1) pluck(env, 'sine', [1660, 1980, 1480, 2220][(bar + s) % 4], 0.12, 0.06 * g, delay, { to: 1200 }); }
}

// ---------------------------------------------------------------- THE GREAT RED CRAB (claude/redgorge-fix, Daniel's approved brief, 10-02)
// A Phrygian (A Bb C D E F G), 4/4 at 110 (eighth = 0.273 s), 16 bars = 35 s. A HEAVY CLACKING STOP-START MARCH: stomping low toms (one, the
// and-of-two, three), a snappy CLAW CLACK on two and four, dry hat clacks on the off-beats, a Phrygian drone (a sub sine and a lowpassed saw on A,
// rubbing up to Bb every fourth bar), a SYNCOPATED STUTTERING BASS RIFF (doubled sixteenths, A - Bb - A - G), and a DETUNED BRASSY LEAD that
// SIDESTEPS IN HALF-STEPS (E - F - E - Eb - E: a crab's walk). The last bar of every four STOPS dead on its third beat - two lone clacks - and the
// next comes back in on a double tom. The second eight bars bring the lead an octave up with a fifth under it.
// PHASE TWO (src/gorge-crab-hands.js sets BOSS_PHASE.gorgecrab = 2 when he turns): the hat clacks double, and every fourth bar a FLOOD SURGE
// sweeps up under the stop (rising noise and a saw sliding up an octave).
export const BOSS_PHASE = { gorgecrab: 1 };
const GCM_STEP = 60 / 110 / 2, GCM_LEN = 8, GCM_BARSN = 16;
const GCM_BASS = [['A1', 2], ['-', 0], ['A1', 1], ['Bb1', 1], ['-', 0], ['A1', 2], ['G1', 1], ['A1', 1]];   // [note, 1 = one stroke / 2 = a stuttered pair]
const GCM_LEAD = [['E4', 1.6], ['-'], ['F4', 0.9], ['E4', 0.9], ['-'], ['Eb4', 0.9], ['E4', 1.8], ['-']];   // the sidestep: E, up a half, back, down a half, back
const GCM_LEAD2 = [['A4', 1.6], ['-'], ['Bb4', 0.9], ['A4', 0.9], ['G#4', 0.9], ['A4', 0.9], ['C5', 0.9], ['Bb4', 1.6]];
function gorgecrab(i, delay, variant, env) {
  const bar = Math.floor(i / GCM_LEN), s = i % GCM_LEN, b = bar % 4, second = bar >= 8, g = env.gain, p2 = BOSS_PHASE.gorgecrab === 2;
  const stop = b === 3 && s >= 4;   // THE STOP: the fourth bar dies on its third beat
  // THE MARCH: stomping toms, the claw clack, the hats
  if (!stop && (s === 0 || s === 3 || s === 4)) pluck(env, 'sine', s === 3 ? 82 : 96, 0.28, (s === 0 ? 0.9 : 0.7) * g, delay, { to: 44 });
  if (b === 0 && s === 0 && bar > 0) pluck(env, 'sine', 120, 0.22, 0.6 * g, delay + GCM_STEP / 2, { to: 50 });   // the double tom: back in after the stop
  if (s === 2 || s === 6) { noise(env, 0.05, 0.24 * g, 3400, 1.6, delay); pluck(env, 'square', 1900, 0.025, 0.07 * g, delay, { lp: 3600 }); }   // THE CLAW CLACK on two and four
  if (s % 2 === 1 || (stop && s === 6)) { noise(env, 0.025, 0.1 * g, 6200, 1.8, delay); if (p2) noise(env, 0.025, 0.08 * g, 6800, 1.8, delay + GCM_STEP / 2); }   // the hats (phase two: doubled)
  if (stop) { if (p2 && s === 4) { for (let k = 0; k < 6; k++) noise(env, 0.12, (0.05 + k * 0.02) * g, 500 + k * 650, 0.8, delay + k * GCM_STEP * 0.6);   // THE FLOOD SURGE
    held(env, 'sawtooth', nf('A2'), GCM_STEP * 3.8, 0.07 * g, delay, { lp: 1400, att: 0.3, hold: 0.8, from: 1, to: 2, slide: true, det: 9 }); } return; }
  // THE DRONE under the dam: A, rubbing up to the flat second every fourth bar
  if (s === 0 && b % 2 === 0) { const r = b === 2 ? 'Bb1' : 'A1'; pluck(env, 'sine', nf(r) * 0.5, GCM_STEP * GCM_LEN * 2 * 0.95, 0.32 * g, delay); held(env, 'sawtooth', nf(r), GCM_STEP * GCM_LEN * 2 * 0.95, 0.05 * g, delay, { lp: 330, att: 0.4, hold: 0.8, det: 13 }); }
  // THE BASS RIFF: syncopated, stuttering
  const [bn, st] = GCM_BASS[s];
  if (bn !== '-') { const f = nf(bn) * (b === 2 ? nf('Bb1') / nf('A1') : 1); pluck(env, 'sawtooth', f, GCM_STEP * 0.45, 0.2 * g, delay, { lp: 520 }); if (st === 2) pluck(env, 'sawtooth', f, GCM_STEP * 0.4, 0.16 * g, delay + GCM_STEP / 2, { lp: 520 }); }
  // THE LEAD: brassy, detuned, sidestepping (bars two and three of each four; every bar in the second half)
  if (b === 1 || b === 2 || second) { const ln = ((bar % 2) ? GCM_LEAD2 : GCM_LEAD)[s];
    if (ln[0] !== '-') { const up = second ? 2 : 1; held(env, 'sawtooth', nf(ln[0]) * up, GCM_STEP * ln[1], 0.075 * g, delay, { lp: second ? 2400 : 1800, att: 0.02, hold: 0.55, det: 12, from: 0.97 });
      if (second) held(env, 'square', nf(ln[0]) * 0.75, GCM_STEP * ln[1], 0.03 * g, delay, { lp: 1200, att: 0.02, hold: 0.5 }); } }
}

export const SYNTH_BOSS = {
  cisternqueen: { step: CQM_STEP, total: CQM_LEN * CQM_BARSN, play: cisternqueen },
  gorgecrab: { step: GCM_STEP, total: GCM_LEN * GCM_BARSN, play: gorgecrab },
  banditking: { step: BKM_STEP, total: BKM_LEN * BKM_BARSN, play: banditking },
  archmage: { step: AM_STEP, total: AM_LEN * AM_BARSN, play: archmage },
  goblinroyal: { step: GR_STEP, total: GR_LEN * GR_BARSN, play: goblinroyal },
  drownedking: { step: DK_STEP, total: DK_LEN * DK_BARSN, play: drownedking },
  winchmaster: { step: WM_STEP, total: WM_LEN * WM_BARSN, play: winchmaster },
  gargoyle: { step: GG_STEP, total: GG_LEN * GG_BARSN, play: gargoyle },
};
/* the variants that are a piece of their own: their own step, loop length and voice (the level matches the living theme: BOSS_SYNTH_GAIN applies to both) */
export const SYNTH_VARIANT = { 'archmage:undead': { step: UD_STEP, total: UD_LEN * AM_BARSN, play: undeadmage },
  'banditking:p2': { step: BKM_STEP2, total: BKM_LEN * BKM_BARSN, play: banditking },
  'cisternqueen:p2': { step: CQM_STEP2, total: CQM_LEN * CQM_BARSN, play: cisternqueen }, 'cisternqueen:p3': { step: CQM_STEP2, total: CQM_LEN * CQM_BARSN, play: cisternqueen } };   /* THE BANDIT KING's second phase: faster, the zurna an octave up */
/* the whole track's loudness, next to a file track's 0.5 x the file's own level (audio.js trackVol) */
export const BOSS_SYNTH_GAIN = 0.62;

function noise(env, dur, v, freq, q, delay) { env.noise(dur, v, freq, q, delay, env.dest); }
