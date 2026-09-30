// tools/canal-music.mjs - THE FOG CANAL's placeholder track, composed and synthesised here (claude/canal): nothing downloaded, so nothing to
// license (it is ours; audio/CREDITS.txt says so). A slow foggy BARCAROLLE in A minor, 6/8 - the boatman's rocking lilt, bass on one and four,
// the chord between - for a musette ACCORDION (two reeds a hair apart, so it beats like the real thing) and a HURDY-GURDY (a drone on A and E
// that never stops, a buzzing trompette on the strong beats, and the tune bowed on the chanterelle). The A strain is the gurdy's, the B strain the
// accordion's; a far bell every eight bars (the theatre's, through the fog). 24 bars at 132 eighths a minute (about 65 s), written as a loop.
// A Sonnet art/music lane will polish or replace it; the track name 'canal' stays.
//   node tools/canal-music.mjs      writes a .wav into audio/, then (ffmpeg on PATH) audio/canal.ogg, and deletes the wav
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SR = 22050, EPM = 132, E8 = 60 / EPM, BAR = 6 * E8, BARS = 24, LEN = BARS * BAR, N = Math.ceil(LEN * SR);
const out = new Float32Array(N);
const f = n => 440 * Math.pow(2, (n - 69) / 12);
const NOTE = s => { const m = s.match(/^([A-G])(#|b)?(\d)$/); const k = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 12 * (+m[3] + 1) + k; };
const saw = ph => 2 * (ph - Math.floor(ph + 0.5));
/* one voice into the buffer, wrapping at the loop point so the seam carries its tails */
function voice(t0, dur, hz, amp, kind) {
  const tail = kind === 'bell' ? 3 : kind === 'drone' ? 0.05 : 0.5, n = Math.floor((dur + tail) * SR), s0 = Math.floor(t0 * SR);
  for (let i = 0; i < n; i++) { const t = i / SR; let v = 0, env;
    if (kind === 'reed') {   /* THE ACCORDION: two reeds, a few cents apart (the musette's beat), a bellows swell */
      env = Math.min(1, t / 0.06) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.12) : 1) * (0.85 + 0.15 * Math.sin(2 * Math.PI * 0.8 * t));
      v = 0.5 * saw(hz * t) + 0.5 * saw(hz * 1.004 * t) + 0.25 * Math.sin(2 * Math.PI * hz * 2 * t); v *= 0.7; }
    else if (kind === 'gurdy') {   /* THE HURDY-GURDY's chanterelle: bowed (a slow attack), a little vibrato, a nasal buzz */
      const vib = 1 + 0.004 * Math.sin(2 * Math.PI * 5.2 * t) * Math.min(1, t / 0.3);
      env = Math.min(1, t / 0.09) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.15) : 1);
      const ph = hz * vib * t; v = 0.6 * saw(ph) + 0.3 * Math.sign(Math.sin(2 * Math.PI * ph)) * 0.5 + 0.2 * Math.sin(2 * Math.PI * ph * 3); }
    else if (kind === 'drone') { env = 1; v = 0.5 * saw(hz * t) + 0.3 * saw(hz * 1.5 * t); }   /* the drone strings, A and E, held bar to bar */
    else if (kind === 'buzz') { env = Math.exp(-t * 14) * Math.min(1, t * 400); v = Math.sign(Math.sin(2 * Math.PI * hz * t)) * (0.6 + 0.4 * Math.random()); }   /* the trompette's dog: a buzz on the strong beat */
    else if (kind === 'bass') { env = Math.exp(-t * 3.2) * Math.min(1, t * 200); v = Math.sin(2 * Math.PI * hz * t) + 0.35 * saw(hz * t); }
    else { env = Math.exp(-t * 1.0) * Math.min(1, t * 500); v = Math.sin(2 * Math.PI * hz * t) + 0.5 * Math.sin(2 * Math.PI * hz * 2.76 * t) * Math.exp(-t * 2); }   /* the far bell */
    out[(s0 + i) % N] += v * env * amp; }
}
/* THE HARMONY, a bar a chord: [bass, then the chord's three] */
const CH = { Am: ['A2', 'A3', 'C4', 'E4'], Dm: ['D3', 'D3', 'F3', 'A3'], E7: ['E2', 'G#3', 'B3', 'D4'], F: ['F2', 'F3', 'A3', 'C4'], C: ['C3', 'E3', 'G3', 'C4'], G: ['G2', 'G3', 'B3', 'D4'], E: ['E2', 'G#3', 'B3', 'E4'] };
const PROG = ['Am', 'Am', 'Dm', 'E7', 'Am', 'F', 'E7', 'Am',   'Am', 'Am', 'Dm', 'E7', 'F', 'Dm', 'E7', 'Am',   'C', 'G', 'Am', 'E', 'F', 'Dm', 'E7', 'E7'];
/* THE TUNE, six eighths a bar ('-' holds, '.' rests) */
const TUNE = [
  'E4 - - A4 - B4', 'C5 - B4 A4 - .', 'D5 - C5 A4 - F4', 'E4 - - - - .', 'E4 - - A4 - C5', 'F5 - E5 C5 - A4', 'B4 - G#4 E4 - D5', 'C5 - - A4 - .',
  'E5 - - E5 D5 C5', 'B4 - C5 A4 - .', 'F5 - E5 D5 - A4', 'G#4 - - B4 - .', 'A4 - C5 F5 - E5', 'D5 - C5 A4 - F4', 'E4 - G#4 B4 - D5', 'C5 - - A4 - .',
  'G4 - C5 E5 - G5', 'D5 - - B4 - .', 'C5 - A4 E5 - C5', 'B4 - - G#4 - .', 'A4 - C5 F5 - A5', 'F5 - D5 A4 - .', 'G#4 - B4 E5 - D5', 'B4 - G#4 E4 - .'];
for (let b = 0; b < BARS; b++) {
  const t0 = b * BAR, ch = CH[PROG[b]].map(NOTE), part = b < 16 ? 'gurdy' : 'reed';
  /* the left hand: bass on one and four, the chord on the two eighths after each (the rocking of the boat) */
  voice(t0, E8 * 2.6, f(ch[0]), 0.26, 'bass'); voice(t0 + 3 * E8, E8 * 2.6, f(ch[0] + (b % 2 ? 7 : 0)), 0.2, 'bass');
  for (const k of [1, 2, 4, 5]) for (const n of ch.slice(1)) voice(t0 + k * E8, E8 * 0.7, f(n), 0.035, 'reed');
  /* the gurdy's drone, the whole way, and its buzz on the strong beats */
  voice(t0, BAR, f(NOTE('A2')), 0.035, 'drone');
  if (b < 16) { voice(t0, 0.12, f(NOTE('A3')), 0.05, 'buzz'); voice(t0 + 3 * E8, 0.12, f(NOTE('A3')), 0.035, 'buzz'); }
  const beats = TUNE[b].split(' ');
  for (let k = 0; k < 6; k++) { const s = beats[k]; if (s === '-' || s === '.') continue; let d = 1; for (let j = k + 1; j < 6 && beats[j] === '-'; j++) d++;
    voice(t0 + k * E8, d * E8 * 0.95, f(NOTE(s)), part === 'gurdy' ? 0.15 : 0.13, part); }
  if (b % 8 === 0) voice(t0, BAR * 2, f(NOTE('E4')), 0.06, 'bell');   /* the theatre's bell, far off through the fog */
}
/* level it: peak to about -3 dBFS, then a gentle soft clip */
let pk = 0; for (const v of out) pk = Math.max(pk, Math.abs(v)); const g = 0.7 / (pk || 1);
const pcm = Buffer.alloc(44 + N * 2);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 2, 4); pcm.write('WAVE', 8); pcm.write('fmt ', 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { const v = Math.tanh(out[i] * g * 1.2) / Math.tanh(1.2); pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const wav = ROOT + 'audio/canal.wav', ogg = ROOT + 'audio/canal.ogg';
writeFileSync(wav, pcm); console.log('canal-music: ' + BARS + ' bars of 6/8, ' + LEN.toFixed(1) + ' s -> audio/canal.wav');
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libvorbis', '-q:a', '3', ogg], { encoding: 'utf8' });
if (r.status === 0 && existsSync(ogg)) { unlinkSync(wav); console.log('canal-music: audio/canal.ogg (ffmpeg, vorbis q3)'); }
else console.log('canal-music: no ffmpeg (' + (r.error ? r.error.message : r.stderr) + '): the wav is left for a hand conversion');
