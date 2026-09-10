// audio.js — CC0 sample playback with synth fallbacks, and three music tracks (theme / boss / select).
let ac = null, master = null, musicGain = null, sfxGain = null, noiseBuf = null;
let vol = 0.5, sfxFiles = true, musicOn = true;
const TRACKS = { theme: './audio/theme.ogg', theme2: './audio/theme2.ogg', theme3: './audio/theme3.mp3', theme4: './audio/theme4.mp3', boss: './audio/boss.ogg', boss2: './audio/boss2.ogg', ending: './audio/ending.ogg', select: './audio/select.ogg', ambForest: './audio/ambience_forest.mp3' };
let duckT = 1, ambKind = null, ambNodes = [], ambGain = null, musicVol = 1;
const trackBuf = {}, trackPending = {};
let musicSrc = null, currentTrack = null, wantTrack = 'theme', silenced = false;
const clips = {}; // name -> [AudioBuffer]

export function initAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
  sfxGain = ac.createGain(); sfxGain.gain.value = vol; sfxGain.connect(master);
  musicGain = ac.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
  ambGain = ac.createGain(); ambGain.gain.value = 0; ambGain.connect(sfxGain);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  startSynth();
  loadTrack(wantTrack);
  fetch('./audio/manifest.json').then(r => r.json()).then(man => {
    for (const name in man) man[name].forEach((url, i) => fetch(url).then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(ab => ac.decodeAudioData(ab)).then(b => { (clips[name] = clips[name] || [])[i] = b; }).catch(() => {}));
  }).catch(() => {});
}
export const ready = () => !!ac;
export function setVolume(v) { vol = Math.max(0, Math.min(1, v)); if (sfxGain) sfxGain.gain.value = vol; }
export function setSfxFiles(v) { sfxFiles = !!v; }
export function setMusicVolume(v) { musicVol = Math.max(0, Math.min(1, v)); if (musicGain && currentTrack && musicOn) musicGain.gain.value = trackVol(currentTrack); }
export const musicIsFile = () => !!trackBuf[currentTrack];

// ---------- samples ----------
function file(name, v = 0.6, rate = 1) {
  if (!ac || !sfxFiles) return false;
  const arr = clips[name]; if (!arr) return false;
  const opts = arr.filter(Boolean); if (!opts.length) return false;
  const s = ac.createBufferSource(); s.buffer = opts[(Math.random() * opts.length) | 0]; s.playbackRate.value = rate * (0.94 + Math.random() * 0.12);
  const g = ac.createGain(); g.gain.value = v; s.connect(g); g.connect(sfxGain); s.start();
  return true;
}

// ---------- synth ----------
function tone(type, f0, f1, dur, v = 0.3, delay = 0, dest = sfxGain) {
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
  s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + dur + 0.02);
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
  effort() { file('effort', 0.22, 1.35); },
  gasp() { file('gobHurt', 0.3, 1.5) || tone('sawtooth', 500, 200, 0.2, 0.1); },
  laugh() { file('laugh', 0.3, 1.4); },
  sting() { [659, 784, 988, 1319, 1568].forEach((f, i) => tone('triangle', f, f, 0.35, 0.16, i * 0.07)); },
  thunder() { noise(1.2, 0.5, 120, 0.4); tone('sine', 60, 30, 1.0, 0.35); },
  croak() { tone('sawtooth', 70, 110, 0.35, 0.28); tone('square', 140, 90, 0.3, 0.1, 0.05); },
  tongue() { noise(0.12, 0.25, 2500, 0.5); tone('sine', 900, 300, 0.15, 0.15); },
  leap() { tone('sine', 120, 400, 0.25, 0.2); noise(0.1, 0.15, 600); },
  bow() { tone('triangle', 700, 200, 0.12, 0.14); noise(0.08, 0.15, 3000); },
  bird() { tone('sine', 1800, 2600, 0.08, 0.06); tone('sine', 2400, 1900, 0.1, 0.05, 0.1); },
  splash() { noise(0.3, 0.4, 700, 0.5); tone('sine', 300, 120, 0.2, 0.15); },
  coinUp(k) { const r = 1 + k * 0.07; file('coin', 0.45, r) || (tone('square', 880 * r, 880 * r, 0.06, 0.12), tone('square', 1320 * r, 1320 * r, 0.11, 0.12, 0.06)); },
  heart() { tone('sine', 70, 40, 0.14, 0.35); tone('sine', 60, 35, 0.16, 0.28, 0.16); },
  cricket() { const f = 3800 + Math.random() * 600; for (let i = 0; i < 4; i++) tone('sine', f, f, 0.03, 0.035, i * 0.05); },
  fish() { noise(0.12, 0.2, 900, 0.6); tone('sine', 500, 200, 0.1, 0.08); },
};

// ---------- music: files, with the synth loop as a fallback for the theme ----------
function loadTrack(name) {
  if (!ac || !TRACKS[name] || trackBuf[name] || trackPending[name]) return;
  trackPending[name] = true;
  fetch(TRACKS[name]).then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status)).then(ab => ac.decodeAudioData(ab)).then(b => { trackBuf[name] = b; if (wantTrack === name) playFile(name); }).catch(() => {}).finally(() => { trackPending[name] = false; });
}
const trackVol = name => (name === 'boss' ? 0.5 : 0.45) * duckT * musicVol;
function playFile(name) {
  if (!ac || !trackBuf[name] || currentTrack === name) return;
  if (musicSrc) { try { musicSrc.stop(); } catch {} musicSrc = null; }
  musicSrc = ac.createBufferSource(); musicSrc.buffer = trackBuf[name]; musicSrc.loop = true;
  musicSrc.connect(musicGain); musicSrc.start(); currentTrack = name;
  musicGain.gain.value = musicOn ? trackVol(name) : 0;
}
export const music = {
  play(name) { wantTrack = name; silenced = false; if (!ac) return; if (trackBuf[name]) playFile(name); else loadTrack(name); },
  preload(name) { if (ac) loadTrack(name); },
  stop() { wantTrack = null; silenced = true; if (musicSrc) { try { musicSrc.stop(); } catch {} musicSrc = null; } currentTrack = null; },
  loaded(name) { return !!trackBuf[name]; },
  set(v) { musicOn = !!v; if (musicGain && currentTrack) musicGain.gain.value = musicOn ? trackVol(currentTrack) : 0; },
  duck(on) { const t = on ? 0.35 : 1; if (t === duckT) return; duckT = t; if (musicGain && currentTrack && musicOn) musicGain.gain.setTargetAtTime(trackVol(currentTrack), ac.currentTime, 0.25); },
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

// ---------- ambient beds: forest birds (file), running water, hive drone, rain (synth) ----------
function stopAmb() { for (const n of ambNodes) { try { n.stop(); } catch {} } ambNodes = []; }
export const ambient = {
  set(kind) {
    if (!ac || kind === ambKind) return;
    ambKind = kind; stopAmb();
    if (!kind) { ambGain.gain.setTargetAtTime(0, ac.currentTime, 0.5); return; }
    const start = () => ambGain.gain.setTargetAtTime(kind === 'forest' ? 0.3 : kind === 'rain' ? 0.09 : kind === 'water' ? 0.16 : kind === 'wind' ? 0.24 : 0.14, ac.currentTime, 0.8);
    if (kind === 'forest') {
      const go = () => { if (ambKind !== 'forest') return; const s = ac.createBufferSource(); s.buffer = trackBuf.ambForest; s.loop = true; s.connect(ambGain); s.start(); ambNodes.push(s); start(); };
      if (trackBuf.ambForest) go(); else { trackPending.ambForest || fetch(TRACKS.ambForest).then(r => r.arrayBuffer()).then(ab => ac.decodeAudioData(ab)).then(b => { trackBuf.ambForest = b; go(); }).catch(() => {}); }
      return;
    }
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = kind === 'water' ? 900 : kind === 'rain' ? 1400 : kind === 'wind' ? 420 : 140; f.Q.value = kind === 'hive' ? 4 : kind === 'rain' ? 0.4 : 0.6;
    const g = ac.createGain(); g.gain.value = kind === 'hive' ? 0.5 : 1;
    src.connect(f); f.connect(g); g.connect(ambGain); src.start(); ambNodes.push(src);
    if (kind === 'wind') { const lfo = ac.createOscillator(); lfo.frequency.value = 0.16; const lg = ac.createGain(); lg.gain.value = 0.45; lfo.connect(lg); lg.connect(g.gain); lfo.start(); ambNodes.push(lfo); const lfo2 = ac.createOscillator(); lfo2.frequency.value = 0.07; const lg2 = ac.createGain(); lg2.gain.value = 220; lfo2.connect(lg2); lg2.connect(f.frequency); lfo2.start(); ambNodes.push(lfo2); }
    if (kind === 'water') { const lfo = ac.createOscillator(); lfo.frequency.value = 0.3; const lg = ac.createGain(); lg.gain.value = 300; lfo.connect(lg); lg.connect(f.frequency); lfo.start(); ambNodes.push(lfo); }
    if (kind === 'hive') { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 55; const og = ac.createGain(); og.gain.value = 0.12; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; o.connect(lp); lp.connect(og); og.connect(ambGain); o.start(); ambNodes.push(o); const o2 = ac.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 82.5; o2.connect(lp); o2.start(); ambNodes.push(o2); }
    start();
  },
  get kind() { return ambKind; },
};

// ---------- per-creature voices (synth; the CC0 clips stay for the goblins) ----------
Object.assign(SFX, {
  bark() { noise(0.05, 0.3, 700, 1.2); tone('sawtooth', 420, 160, 0.09, 0.16); tone('sawtooth', 380, 140, 0.08, 0.12, 0.11); },
  yelp() { tone('sawtooth', 700, 1400, 0.12, 0.14); noise(0.08, 0.15, 1800, 1.2, 0.04); },
  squelch() { noise(0.16, 0.28, 500, 0.5); tone('sine', 220, 50, 0.2, 0.18); },
  puff() { noise(0.3, 0.3, 900, 0.4); tone('triangle', 320, 70, 0.22, 0.12); },
  chitter() { for (let i = 0; i < 4; i++) tone('square', 1700 + i * 200, 2300, 0.03, 0.05, i * 0.035); },
  hiss() { noise(0.22, 0.22, 3200, 0.6); },
  bleat() { tone('sawtooth', 520, 470, 0.14, 0.1); tone('sawtooth', 560, 500, 0.12, 0.08, 0.16); tone('square', 540, 480, 0.1, 0.05, 0.3); },
  goatCry() { tone('sawtooth', 380, 300, 0.2, 0.12); noise(0.06, 0.2, 1200, 1, 0.02); tone('sawtooth', 400, 320, 0.14, 0.08, 0.22); },
  screech() { tone('sawtooth', 2200, 900, 0.22, 0.12); noise(0.1, 0.18, 2600, 1.3, 0.03); },
  bellow() { file('roar', 0.6, 0.7) || (tone('sawtooth', 110, 60, 0.4, 0.3), noise(0.2, 0.4, 300, 0.6)); },
  snort() { noise(0.14, 0.3, 420, 0.6); tone('sawtooth', 140, 70, 0.16, 0.16); },
  clatter() { tone('square', 1100, 320, 0.06, 0.1); noise(0.06, 0.2, 2600, 1.1); tone('square', 800, 260, 0.05, 0.08, 0.05); },
  ribbit() { file('croak', 0.45, 1.5) || (tone('sawtooth', 200, 300, 0.09, 0.14), tone('sawtooth', 280, 170, 0.1, 0.12, 0.09)); },
  thump() { tone('sine', 110, 40, 0.16, 0.3); noise(0.08, 0.25, 250, 0.7); },
  gobDieLow() { file('gobDie', 0.7, 0.72) || (tone('sawtooth', 220, 60, 0.3, 0.22), noise(0.2, 0.2, 500, 0.6)); },
  gobHurtLow() { file('gobHurt', 0.6, 0.75) || tone('sawtooth', 260, 120, 0.12, 0.18); },
});

// ---------- UI and skill voices ----------
Object.assign(SFX, {
  levelStart() { for (let i = 0; i < 4; i++) tone('square', [330, 415, 494, 659][i], [330, 415, 494, 659][i], 0.11, 0.09, i * 0.09); tone('triangle', 165, 165, 0.4, 0.08, 0.36); },
  menuOpen() { tone('square', 520, 780, 0.06, 0.06); tone('square', 780, 1040, 0.06, 0.05, 0.06); },
  menuClose() { tone('square', 780, 520, 0.06, 0.06); tone('square', 520, 340, 0.06, 0.05, 0.06); },
  throwWhoosh() { noise(0.28, 0.22, 900, 0.5); for (let i = 0; i < 6; i++) tone('triangle', 700 - i * 60, 500 - i * 60, 0.05, 0.06, i * 0.045); },
  shieldCatch() { tone('square', 900, 400, 0.06, 0.12); noise(0.05, 0.18, 2400, 1.2); tone('sine', 220, 180, 0.12, 0.1, 0.03); },
  medal() { for (let i = 0; i < 3; i++) tone('square', [523, 659, 784][i], [523, 659, 784][i], 0.12, 0.08, i * 0.1); tone('square', 1047, 1047, 0.3, 0.08, 0.3); },
  gillOpen() { tone('sine', 300, 900, 0.35, 0.12); tone('sine', 450, 1200, 0.35, 0.08, 0.05); noise(0.3, 0.1, 3000, 0.8); },
  heartbeatUI() { tone('sine', 80, 50, 0.12, 0.25); tone('sine', 70, 40, 0.14, 0.2, 0.16); },
});
export const SFX_NAMES = () => Object.keys(SFX).filter(k => typeof SFX[k] === 'function');
export const MUSIC_NAMES = ['theme', 'theme2', 'theme3', 'boss', 'boss2', 'ending', 'select', 'theme4'];
export const AMBIENT_NAMES = ['forest', 'water', 'hive', 'rain', 'wind'];
