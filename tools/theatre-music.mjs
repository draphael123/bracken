// tools/theatre-music.mjs - THE MASKWRIGHT'S THEATRE's placeholder track, composed and synthesised here (claude/theatre): nothing downloaded, so
// nothing to license (it is ours; audio/CREDITS.txt says so). A slow music-hall waltz in D minor after dark: a music-box line over a plucked bass
// and a reed-organ pad, the B half going up to F major and falling back, a tolling bell every eight bars. 32 bars of 3/4 at 116 bpm (about 50 s),
// written as a loop (the last bar turns back to the first). The art/music lane replaces it with a composed track; the name 'theatre' stays.
//   node tools/theatre-music.mjs            writes a .wav into audio/, then (ffmpeg on PATH) audio/theatre.ogg, and deletes the wav
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SR = 22050, BPM = 116, BEAT = 60 / BPM, BAR = 3 * BEAT, BARS = 32, LEN = BARS * BAR, N = Math.ceil(LEN * SR);
const out = new Float32Array(N);
const f = n => 440 * Math.pow(2, (n - 69) / 12);
const NOTE = s => { const m = s.match(/^([A-G])(#|b)?(\d)$/); const k = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 12 * (+m[3] + 1) + k; };
/* one voice into the buffer, wrapping at the loop point so the seam carries its tails */
function voice(t0, dur, hz, amp, kind) {
  const n = Math.floor((dur + (kind === 'bell' ? 3 : 1.2)) * SR), s0 = Math.floor(t0 * SR);
  for (let i = 0; i < n; i++) { const t = i / SR; let v = 0, env;
    if (kind === 'box') { env = Math.exp(-t * 3.2) * Math.min(1, t * 400); v = Math.sin(2 * Math.PI * hz * t) + 0.35 * Math.sin(2 * Math.PI * hz * 4.02 * t) * Math.exp(-t * 9); }
    else if (kind === 'pluck') { env = Math.exp(-t * 5) * Math.min(1, t * 300); const ph = (hz * t) % 1; v = (ph < 0.5 ? 4 * ph - 1 : 3 - 4 * ph) * 0.9 + 0.2 * Math.sin(2 * Math.PI * hz * 2 * t); }
    else if (kind === 'stab') { env = Math.exp(-t * 9) * Math.min(1, t * 200); v = Math.sin(2 * Math.PI * hz * t) + 0.3 * Math.sin(2 * Math.PI * hz * 2 * t) + 0.15 * Math.sin(2 * Math.PI * hz * 3 * t); }
    else if (kind === 'pad') { const a = Math.min(1, t / 0.4), r = t > dur ? Math.max(0, 1 - (t - dur) / 0.6) : 1; env = a * r; v = Math.sin(2 * Math.PI * hz * t + 0.3 * Math.sin(2 * Math.PI * 5 * t)) * 0.7 + 0.3 * Math.sin(2 * Math.PI * hz * 2.003 * t); }
    else { env = Math.exp(-t * 1.1) * Math.min(1, t * 500); v = Math.sin(2 * Math.PI * hz * t) + 0.5 * Math.sin(2 * Math.PI * hz * 2.76 * t) * Math.exp(-t * 2) + 0.25 * Math.sin(2 * Math.PI * hz * 5.4 * t) * Math.exp(-t * 4); }
    if (kind !== 'pad' && kind !== 'bell' && t > dur + 0.02) env *= Math.max(0, 1 - (t - dur) / 0.25);
    out[(s0 + i) % N] += v * env * amp; }
}
/* THE HARMONY, a bar a chord: [root, third, fifth] (MIDI) */
const CH = { Dm: ['D3', 'F3', 'A3'], A7: ['A2', 'C#3', 'G3'], Gm: ['G2', 'Bb2', 'D3'], Bb: ['Bb2', 'D3', 'F3'], A: ['A2', 'C#3', 'E3'], F: ['F2', 'A2', 'C3'], C: ['C3', 'E3', 'G3'], E7: ['E2', 'G#2', 'D3'] };
const PROG = ['Dm', 'A7', 'Dm', 'Gm', 'Bb', 'A7', 'Dm', 'A', 'Dm', 'A7', 'Dm', 'Gm', 'Bb', 'Gm', 'A7', 'Dm',
  'F', 'C', 'Dm', 'A', 'Gm', 'Dm', 'E7', 'A7', 'Dm', 'Gm', 'Dm', 'A7', 'Bb', 'Gm', 'A7', 'A7'];
/* THE TUNE, three beats a bar ('-' holds, '.' rests; a pair in one beat is two eighths) */
const TUNE = [
  'A4 D5 F5', 'E5 - C#5', 'D5 A4 F4', 'G4 Bb4 D5', 'F5 - D5', 'C#5 E5 A5', 'F5 E5 D5', 'E5 - .',
  'A4 D5 F5', 'E5 G5 E5', 'F5 D5 A4', 'Bb4 D5 G5', 'F5 D5 Bb4', 'G4 Bb4 D5', 'C#5 E5 G5', 'F5 - .',
  'A5 G5 F5', 'E5 - C5', 'D5 E5 F5', 'E5 - A4', 'Bb4 D5 G5', 'F5 D5 A4', 'G#4 B4 D5', 'C#5 - E5',
  'D5 F5 A5', 'G5 Bb5 D5', 'F5 E5 D5', 'E5 C#5 A4', 'D5 F5 Bb4', 'D5 - G4', 'A4 C#5 E5', 'G5 F5 E5'];
for (let b = 0; b < BARS; b++) {
  const t0 = b * BAR, ch = CH[PROG[b]].map(NOTE);
  voice(t0, BEAT * 0.9, f(ch[0] - 12 < 36 ? ch[0] : ch[0] - 12), 0.32, 'pluck');           /* the bass on one */
  for (const k of [1, 2]) for (const n of ch.slice(1)) voice(t0 + k * BEAT, BEAT * 0.4, f(n + 12), 0.07, 'stab');   /* the chord on two and three */
  voice(t0, BAR, f(ch[0]), 0.06, 'pad'); voice(t0, BAR, f(ch[2]), 0.045, 'pad');          /* the reed organ under it */
  const beats = TUNE[b].split(' '); let hold = 0;
  for (let k = 0; k < 3; k++) { const s = beats[k]; if (s === '-' || s === '.') continue; let d = 1; for (let j = k + 1; j < 3 && beats[j] === '-'; j++) d++;
    voice(t0 + k * BEAT, d * BEAT * 0.95, f(NOTE(s)), 0.2, 'box'); hold = d; }
  if (b % 8 === 0) voice(t0, BAR * 2, f(NOTE('D4')), 0.12, 'bell');                     /* the house bell, every eight bars */
  if (b % 8 === 7) voice(t0 + 2 * BEAT, BEAT, f(NOTE('A3')), 0.05, 'bell');
}
/* level it: peak to -3 dBFS, then a gentle soft clip */
let pk = 0; for (const v of out) pk = Math.max(pk, Math.abs(v)); const g = 0.7 / (pk || 1);
const pcm = Buffer.alloc(44 + N * 2);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 2, 4); pcm.write('WAVE', 8); pcm.write('fmt ', 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { const v = Math.tanh(out[i] * g * 1.2) / Math.tanh(1.2); pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const wav = ROOT + 'audio/theatre.wav', ogg = ROOT + 'audio/theatre.ogg';
writeFileSync(wav, pcm); console.log('theatre-music: ' + BARS + ' bars, ' + LEN.toFixed(1) + ' s -> audio/theatre.wav');
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libvorbis', '-q:a', '3', ogg], { encoding: 'utf8' });
if (r.status === 0 && existsSync(ogg)) { unlinkSync(wav); console.log('theatre-music: audio/theatre.ogg (ffmpeg, vorbis q3)'); }
else console.log('theatre-music: no ffmpeg (' + (r.error ? r.error.message : r.stderr) + '): the wav is left for a hand conversion');
