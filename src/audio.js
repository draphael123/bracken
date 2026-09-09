// audio.js — CC0 sample playback with synth fallbacks, and three music tracks (theme / boss / select).
let ac = null, master = null, musicGain = null, noiseBuf = null;
let vol = 0.5, sfxFiles = true, musicOn = true;
const TRACKS = { theme: './audio/theme.ogg', boss: './audio/boss.ogg', select: './audio/select.ogg' };
const trackBuf = {}, trackPending = {};
let musicSrc = null, currentTrack = null, wantTrack = 'theme', silenced = false;
const clips = {}; // name -> [AudioBuffer]

export function initAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = vol; master.connect(ac.destination);
  musicGain = ac.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  startSynth();
  loadTrack(wantTrack);
  fetch('./audio/manifest.json').then(r => r.json()).then(man => {
    for (const name in man) man[name].forEach((url, i) => fetch(url).then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(ab => ac.decodeAudioData(ab)).then(b => { (clips[name] = clips[name] || [])[i] = b; }).catch(() => {}));
  }).catch(() => {});
}
export const ready = () => !!ac;
export function setVolume(v) { vol = Math.max(0, Math.min(1, v)); if (master) master.gain.value = vol; }
export function setSfxFiles(v) { sfxFiles = !!v; }
export const musicIsFile = () => !!trackBuf[currentTrack];

// ---------- samples ----------
function file(name, v = 0.6, rate = 1) {
  if (!ac || !sfxFiles) return false;
  const arr = clips[name]; if (!arr) return false;
  const opts = arr.filter(Boolean); if (!opts.length) return false;
  const s = ac.createBufferSource(); s.buffer = opts[(Math.random() * opts.length) | 0]; s.playbackRate.value = rate * (0.94 + Math.random() * 0.12);
  const g = ac.createGain(); g.gain.value = v; s.connect(g); g.connect(master); s.start();
  return true;
}

// ---------- synth ----------
function tone(type, f0, f1, dur, v = 0.3, delay = 0, dest = master) {
  if (!ac) return;
  const t = ac.currentTime + delay;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, v = 0.3, freq = 1000, q = 0.8, delay = 0) {
  if (!ac) return;
  const t = ac.currentTime + delay;
  const s = ac.createBufferSource(); s.buffer = noiseBuf;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  const g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
}

export const SFX = {
  jump() { tone('square', 280, 620, 0.12, 0.12); },
  land() { file('land', 0.35) || noise(0.06, 0.12, 300, 0.5); },
  step() { file('step', 0.18); },
  slash() { file('swing', 0.5) || (noise(0.12, 0.22, 1800, 0.6), tone('triangle', 900, 300, 0.09, 0.08)); },
  hit() { file('hit', 0.55) || (tone('square', 220, 70, 0.12, 0.22), noise(0.1, 0.25, 700)); },
  kill() { file('kill', 0.6) || (tone('square', 300, 60, 0.2, 0.25), noise(0.18, 0.3, 500), tone('triangle', 800, 1400, 0.12, 0.12, 0.02)); },
  gobDie() { file('gobDie', 0.5); },
  gobHurt() { file('gobHurt', 0.4); },
  hurt() { file('hurt', 0.6) || (tone('sawtooth', 240, 60, 0.32, 0.25), noise(0.15, 0.2, 400)); },
  pogo() { tone('square', 480, 980, 0.13, 0.18); },
  coin() { file('coin', 0.45) || (tone('square', 880, 880, 0.06, 0.12), tone('square', 1320, 1320, 0.11, 0.12, 0.06)); },
  clank() { file('clang', 0.5) || (tone('square', 1500, 900, 0.05, 0.18), tone('sine', 2300, 2100, 0.16, 0.14), noise(0.05, 0.2, 3200)); },
  parry() { file('parry', 0.5) || tone('square', 1200, 1900, 0.08, 0.16); },
  spit() { tone('sine', 420, 180, 0.13, 0.2); },
  crack() { file('crack', 0.5) || (noise(0.16, 0.3, 900, 0.5), tone('square', 160, 60, 0.12, 0.18)); },
  die() { file('hurt', 0.7, 0.7); tone('sawtooth', 320, 40, 0.7, 0.28); tone('square', 200, 50, 0.5, 0.15, 0.1); },
  check() { [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.25, 0.18, i * 0.09)); },
  win() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone('triangle', f, f, 0.3, 0.2, i * 0.12)); },
  block() { file('clang', 0.45, 1.2) || (tone('square', 900, 700, 0.06, 0.2), tone('sine', 1800, 1500, 0.14, 0.14), noise(0.06, 0.25, 2600)); },
  guardBreak() { file('stagger', 0.6) || (tone('sawtooth', 500, 90, 0.35, 0.3), noise(0.2, 0.3, 900)); },
  dodge() { noise(0.14, 0.18, 1200, 0.4); tone('triangle', 300, 700, 0.1, 0.06); },
  heavy() { file('slam', 0.55) || (tone('square', 140, 40, 0.22, 0.32), noise(0.16, 0.35, 400), tone('triangle', 900, 1500, 0.1, 0.12, 0.02)); },
  charge() { file('roar', 0.35, 1.4) || (tone('sawtooth', 120, 260, 0.35, 0.16), noise(0.3, 0.12, 500)); },
  thud() { file('slam', 0.5, 0.8) || (tone('sine', 90, 40, 0.2, 0.35), noise(0.1, 0.25, 250)); },
  stone() { file('stone', 0.4); },
  roar() { file('roar', 0.6) || tone('sawtooth', 90, 220, 0.6, 0.3); },
  bossHurt() { file('bossHurt', 0.55) || tone('sawtooth', 300, 120, 0.25, 0.25); },
  buzz() { tone('sawtooth', 110, 130, 0.5, 0.12); tone('sawtooth', 220, 200, 0.5, 0.06); },
  ui() { file('ui', 0.35) || tone('square', 700, 700, 0.04, 0.1); },
  uiSel() { tone('square', 900, 1300, 0.08, 0.12); },
  text() { tone('square', 1500, 1500, 0.02, 0.04); },
};

// ---------- music: files, with the synth loop as a fallback for the theme ----------
function loadTrack(name) {
  if (!ac || !TRACKS[name] || trackBuf[name] || trackPending[name]) return;
  trackPending[name] = true;
  fetch(TRACKS[name]).then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status)).then(ab => ac.decodeAudioData(ab)).then(b => { trackBuf[name] = b; if (wantTrack === name) playFile(name); }).catch(() => {}).finally(() => { trackPending[name] = false; });
}
function playFile(name) {
  if (!ac || !trackBuf[name] || currentTrack === name) return;
  if (musicSrc) { try { musicSrc.stop(); } catch {} musicSrc = null; }
  musicSrc = ac.createBufferSource(); musicSrc.buffer = trackBuf[name]; musicSrc.loop = true;
  musicSrc.connect(musicGain); musicSrc.start(); currentTrack = name;
  musicGain.gain.value = musicOn ? (name === 'boss' ? 0.5 : 0.45) : 0;
}
export const music = {
  play(name) { wantTrack = name; silenced = false; if (!ac) return; if (trackBuf[name]) playFile(name); else loadTrack(name); },
  preload(name) { if (ac) loadTrack(name); },
  stop() { wantTrack = null; silenced = true; if (musicSrc) { try { musicSrc.stop(); } catch {} musicSrc = null; } currentTrack = null; },
  loaded(name) { return !!trackBuf[name]; },
  set(v) { musicOn = !!v; if (musicGain && currentTrack) musicGain.gain.value = musicOn ? 0.45 : 0; },
  get on() { return musicOn; },
  get track() { return currentTrack; },
};

// Synth loop: four bars of C-major pentatonic arpeggio over a slow bass, until a file takes over.
const N = { C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, C2: 65.41, G2: 98, A2: 110, F2: 87.31 };
const LEAD = [['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'D4', 'E4'], ['G3', 'B3', 'D4', 'G4', 'D4', 'B3', 'A3', 'B3'], ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'B3', 'C4'], ['F3', 'A3', 'C4', 'F4', 'C4', 'A3', 'G3', 'A3']];
const BASS = ['C2', 'G2', 'A2', 'F2'];
let step = 0, nextT = 0, timer = null;
const STEP = 60 / 112 / 2;
function schedule() {
  if (!ac) return;
  if (currentTrack || silenced) { nextT = ac.currentTime; return; }
  while (nextT < ac.currentTime + 0.25) {
    const bar = Math.floor(step / 8) % 4, i = step % 8;
    if (musicOn) {
      const f = N[LEAD[bar][i]]; const delay = nextT - ac.currentTime;
      tone('triangle', f, f, STEP * 0.9, i === 0 ? 0.5 : 0.32, delay, musicGain);
      if (i === 0) tone('sine', N[BASS[bar]], N[BASS[bar]], STEP * 7, 0.55, delay, musicGain);
      if (i === 4) tone('sine', N[BASS[bar]] * 1.5, N[BASS[bar]] * 1.5, STEP * 3, 0.3, delay, musicGain);
    }
    nextT += STEP; step++;
  }
}
function startSynth() { nextT = ac.currentTime + 0.1; step = 0; if (timer) clearInterval(timer); timer = setInterval(schedule, 100); }
