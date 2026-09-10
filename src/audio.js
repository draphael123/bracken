// audio.js — CC0 sample playback with synth fallbacks, and three music tracks (theme / boss / select).
let ac = null, master = null, musicGain = null, sfxGain = null, noiseBuf = null, musicLP = null, uiGain = null, revGain = null, conv = null, revOn = false, trackG = null, muffled = false, lowHp = false, ambVol = 1;
let vol = 0.5, sfxFiles = true, musicOn = true;
const TRACKS = { theme: './audio/theme.ogg', theme2: './audio/theme2.ogg', theme3: './audio/theme3.mp3', theme4: './audio/theme4.mp3', boss: './audio/boss.ogg', boss2: './audio/boss2.ogg', king: './audio/king.mp3', cave: './audio/cave.mp3', town: './audio/town.mp3', adventure: './audio/adventure.mp3', ending: './audio/ending.ogg', select: './audio/select.ogg', ambForest: './audio/ambience_forest.mp3' };
let duckT = 1, ambKind = null, ambNodes = [], ambGain = null, musicVol = 1;
const trackBuf = {}, trackPending = {};
let musicSrc = null, musicSrcs = [], musicTimer = null, musicGen = 0, currentTrack = null, wantTrack = 'theme', silenced = false;
// Chrome's AudioBufferSourceNode.loop turns to static after the first pass on buffers longer than ~70s (boss, theme3, theme4),
// so a track loops by chaining fresh sources at the exact end time instead of the loop flag.
function stopMusic() { for (const s of musicSrcs) { try { s.stop(); } catch {} } musicSrcs = []; musicSrc = null; if (musicTimer) clearTimeout(musicTimer); musicTimer = null; musicGen++; }
const clips = {}; // name -> [AudioBuffer]

export function initAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
  sfxGain = ac.createGain(); sfxGain.gain.value = vol; sfxGain.connect(master);
  musicLP = ac.createBiquadFilter(); musicLP.type = 'lowpass'; musicLP.frequency.value = 20000; musicLP.connect(master); // the music dulls behind a menu, a talk box, or a failing heart
  musicGain = ac.createGain(); musicGain.gain.value = 0.16; musicGain.connect(musicLP);
  uiGain = ac.createGain(); uiGain.gain.value = 0.8; uiGain.connect(master); // menu clicks have their own volume
  ambGain = ac.createGain(); ambGain.gain.value = 0; ambGain.connect(sfxGain);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  { // a short stone reverb for the galleries and halls: a decaying noise impulse
    const len = Math.floor(ac.sampleRate * 0.8), ir = ac.createBuffer(1, len, ac.sampleRate); { const c = ir.getChannelData(0); for (let i = 0; i < len; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4); }
    conv = ac.createConvolver(); conv.buffer = ir; revGain = ac.createGain(); revGain.gain.value = 0; conv.connect(revGain); revGain.connect(master); }
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
export function setUiVolume(v) { if (uiGain) uiGain.gain.value = Math.max(0, Math.min(1, v)); }
export function setReverb(v) { if (!revGain) return; const want = v > 0.08; if (want !== revOn) { revOn = want; try { if (want) sfxGain.connect(conv); else sfxGain.disconnect(conv); } catch {} } revGain.gain.setTargetAtTime(want ? Math.max(0, Math.min(0.5, v)) : 0, ac.currentTime, 0.3); } // the convolver runs only in the halls and galleries that need it
export function setAmbientVolume(v) { ambVol = Math.max(0, Math.min(1, v)); if (ac && ambKind) ambGain.gain.setTargetAtTime(ambTarget(ambKind), ac.currentTime, 0.3); }
const ambTarget = kind => (kind === 'forest' ? 0.3 : kind === 'rain' ? 0.09 : kind === 'water' ? 0.16 : kind === 'wind' ? 0.24 : 0.14) * ambVol;
function applyMusicFilter() { if (!musicLP) return; const f = muffled ? 480 : lowHp ? 1500 : 20000; musicLP.frequency.setTargetAtTime(f, ac.currentTime, 0.18); }

// ---------- samples ----------
function file(name, v = 0.6, rate = 1, dest = null) {
  if (!ac || !sfxFiles) return false;
  const arr = clips[name]; if (!arr) return false;
  const opts = arr.filter(Boolean); if (!opts.length) return false;
  const s = ac.createBufferSource(); s.buffer = opts[(Math.random() * opts.length) | 0]; s.playbackRate.value = rate * (0.94 + Math.random() * 0.12);
  const g = ac.createGain(); g.gain.value = v; s.connect(g); g.connect(dest || sfxGain); s.start();
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
function noise(dur, v = 0.3, freq = 1000, q = 0.8, delay = 0, dest = null) {
  if (!ac) return;
  const t = ac.currentTime + delay;
  const s = ac.createBufferSource(); s.buffer = noiseBuf;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  const g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest || sfxGain); s.start(t); s.stop(t + dur + 0.02);
}

export const SFX = {
  jump() { tone('square', 280, 620, 0.12, 0.12); },
  land(surf) { if (surf === 'water') { noise(0.2, 0.3, 800, 0.5); tone('sine', 260, 120, 0.15, 0.1); return; } if (surf === 'wood') { tone('sine', 150, 70, 0.1, 0.2); file('land', 0.25, 1.1); return; } if (surf === 'stone' || surf === 'iron') { noise(0.05, 0.16, surf === 'iron' ? 2200 : 1500, 0.8); file('land', 0.3, 0.95); return; } if (surf === 'snow') { noise(0.1, 0.16, 700, 0.4); return; } file('land', 0.35) || noise(0.06, 0.12, 300, 0.5); },
  step(surf) { if (surf === 'water') { noise(0.08, 0.12, 900, 0.5); return; } if (surf === 'wood') { tone('sine', 170, 90, 0.05, 0.08); file('step', 0.14, 1.15); return; } if (surf === 'stone') { noise(0.03, 0.09, 2600, 1.2); file('step', 0.14, 0.9); return; } if (surf === 'iron') { tone('square', 1200, 900, 0.03, 0.04); noise(0.03, 0.06, 3200, 1.4); return; } if (surf === 'snow') { noise(0.06, 0.08, 800, 0.5); return; } file('step', 0.18); },
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
  ui() { file('ui', 0.35, 1, uiGain) || tone('square', 700, 700, 0.04, 0.1, 0, uiGain); },
  uiSel() { tone('square', 900, 1300, 0.08, 0.12, 0, uiGain); },
  text() { tone('square', 1500, 1500, 0.02, 0.04, 0, uiGain); },
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
  if (trackG && musicSrcs.length) { const og = trackG, olds = musicSrcs; og.gain.setTargetAtTime(0, ac.currentTime, 0.22); setTimeout(() => { for (const s of olds) { try { s.stop(); } catch {} } try { og.disconnect(); } catch {} }, 1000); if (musicTimer) clearTimeout(musicTimer); musicTimer = null; musicSrcs = []; musicGen++; } else stopMusic(); // the old track fades under the new one
  currentTrack = name;
  const tg = ac.createGain(); tg.gain.value = 0.001; tg.connect(musicGain); trackG = tg; tg.gain.setTargetAtTime(1, ac.currentTime + 0.02, 0.28);
  const gen = musicGen, b = trackBuf[name]; let at = ac.currentTime + 0.03;
  const chain = () => {
    if (gen !== musicGen || currentTrack !== name) return;
    const s = ac.createBufferSource(); s.buffer = b; s.connect(tg); s.start(at); musicSrcs.push(s); musicSrc = s;
    s.addEventListener('ended', () => { musicSrcs = musicSrcs.filter(q => q !== s); });
    const startAt = at; at += b.duration;
    musicTimer = setTimeout(chain, Math.max(50, (startAt + b.duration * 0.7 - ac.currentTime) * 1000)); // arm the next pass well before this one ends
  };
  chain();
  musicGain.gain.value = musicOn ? trackVol(name) : 0;
}
export const music = {
  play(name) { wantTrack = name; silenced = false; if (!ac) return; if (trackBuf[name]) playFile(name); else loadTrack(name); },
  preload(name) { if (ac) loadTrack(name); },
  stop() { wantTrack = null; silenced = true; stopMusic(); currentTrack = null; },
  loaded(name) { return !!trackBuf[name]; },
  set(v) { musicOn = !!v; if (musicGain && currentTrack) musicGain.gain.value = musicOn ? trackVol(currentTrack) : 0; },
  duck(on) { const t = on ? 0.35 : 1; if (t === duckT) return; duckT = t; if (musicGain && currentTrack && musicOn) musicGain.gain.setTargetAtTime(trackVol(currentTrack), ac.currentTime, 0.25); },
  get on() { return musicOn; },
  get track() { return currentTrack; },
  muffle(on) { if (!!on === muffled) return; muffled = !!on; applyMusicFilter(); },
  lowHealth(on) { if (!!on === lowHp) return; lowHp = !!on; applyMusicFilter(); },
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
    const start = () => ambGain.gain.setTargetAtTime(ambTarget(kind), ac.currentTime, 0.8);
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

// ---------- the newer creatures, and each boss's own call ----------
Object.assign(SFX, {
  grubSpit() { noise(0.14, 0.24, 700, 0.6); tone('sine', 380, 120, 0.18, 0.14); tone('square', 900, 400, 0.06, 0.05, 0.05); },
  grubDie() { noise(0.3, 0.3, 400, 0.5); tone('sine', 260, 40, 0.35, 0.2); tone('sine', 700, 200, 0.2, 0.08, 0.05); },
  rockLaugh() { file('laugh', 0.35, 1.15) || (tone('square', 320, 260, 0.08, 0.1), tone('square', 360, 300, 0.08, 0.1, 0.1), tone('square', 400, 330, 0.1, 0.1, 0.2)); },
  golemChime() { [1046, 1318, 1568].forEach((f, i) => tone('sine', f, f * 0.98, 0.5, 0.12, i * 0.06)); noise(0.08, 0.08, 5000, 1.2); },
  golemStomp() { tone('sine', 70, 35, 0.3, 0.4); noise(0.2, 0.35, 260, 0.6); tone('sine', 2093, 1568, 0.25, 0.08, 0.08); },
  golemShatter() { noise(0.4, 0.45, 3200, 0.7); [2093, 1760, 1396, 1046, 784].forEach((f, i) => tone('sine', f, f * 0.7, 0.35, 0.12, i * 0.05)); tone('sawtooth', 120, 40, 0.5, 0.2); },
  golemThrow() { noise(0.12, 0.2, 1800, 0.8); tone('sine', 1400, 2200, 0.1, 0.08); },
  kiteChatter() { for (let i = 0; i < 3; i++) tone('square', 900 + i * 120, 1300, 0.04, 0.06, i * 0.05); noise(0.05, 0.08, 2400, 1.2, 0.15); },
  hareSqueak() { tone('sine', 1800, 2600, 0.06, 0.08); tone('sine', 2400, 1900, 0.07, 0.06, 0.07); },
  wightMoan() { tone('sawtooth', 90, 70, 0.9, 0.12); tone('sine', 140, 95, 0.9, 0.1, 0.05); noise(0.9, 0.08, 600, 0.3); },
  callerChant() { tone('sawtooth', 220, 262, 0.35, 0.12); tone('sawtooth', 330, 392, 0.35, 0.08, 0.3); noise(0.7, 0.14, 500, 0.4); tone('sine', 880, 1320, 0.5, 0.05, 0.1); },
  callerBlast() { noise(0.6, 0.5, 300, 0.4); tone('sawtooth', 160, 40, 0.5, 0.25); tone('sine', 1200, 300, 0.4, 0.1); },
  forgeHammer() { file('slam', 0.6, 0.8) || tone('sine', 90, 40, 0.25, 0.4); tone('square', 1900, 1200, 0.08, 0.12, 0.02); noise(0.12, 0.3, 3000, 1.1, 0.02); },
  forgeSteam() { noise(0.5, 0.28, 2200, 0.5); noise(0.3, 0.18, 900, 0.5, 0.1); },
  forgeChain() { for (let i = 0; i < 5; i++) { noise(0.04, 0.16, 2600, 1.2, i * 0.07); tone('square', 700 - i * 40, 500, 0.04, 0.06, i * 0.07); } },
  kingLaugh() { file('laugh', 0.45, 0.7) || (tone('sawtooth', 150, 130, 0.12, 0.2), tone('sawtooth', 170, 140, 0.12, 0.2, 0.14), tone('sawtooth', 190, 150, 0.16, 0.2, 0.28)); },
  chiefBark() { file('roar', 0.45, 1.2) || (tone('sawtooth', 260, 120, 0.25, 0.22), noise(0.12, 0.22, 900)); },
  owlHoot() { tone('sine', 520, 440, 0.18, 0.16); tone('sine', 480, 400, 0.22, 0.14, 0.2); },
  frogBoom() { tone('sawtooth', 60, 90, 0.5, 0.3); tone('square', 120, 80, 0.4, 0.12, 0.05); noise(0.2, 0.12, 300, 0.6); },
  queenShriek() { tone('sawtooth', 900, 1600, 0.3, 0.14); tone('sawtooth', 1200, 700, 0.3, 0.1, 0.1); noise(0.2, 0.1, 3000, 0.8); },
});
// ---------- UI and skill voices ----------
Object.assign(SFX, {
  levelStart() { for (let i = 0; i < 4; i++) tone('square', [330, 415, 494, 659][i], [330, 415, 494, 659][i], 0.11, 0.09, i * 0.09); tone('triangle', 165, 165, 0.4, 0.08, 0.36); },
  menuOpen() { tone('square', 520, 780, 0.06, 0.06, 0, uiGain); tone('square', 780, 1040, 0.06, 0.05, 0.06, uiGain); },
  menuClose() { tone('square', 780, 520, 0.06, 0.06, 0, uiGain); tone('square', 520, 340, 0.06, 0.05, 0.06, uiGain); },
  equip() { tone('square', 660, 660, 0.05, 0.08, 0, uiGain); tone('square', 990, 990, 0.08, 0.08, 0.05, uiGain); tone('triangle', 1320, 1320, 0.14, 0.06, 0.1, uiGain); },
  rankUp() { [523, 659, 784, 1047].forEach((f, i) => tone('square', f, f, 0.12, 0.09, i * 0.07, uiGain)); tone('triangle', 1047, 2093, 0.4, 0.08, 0.3, uiGain); noise(0.2, 0.06, 4000, 0.8, 0.3, uiGain); },
  bossDown() { noise(0.8, 0.5, 200, 0.5); tone('sawtooth', 220, 55, 0.9, 0.3); tone('sawtooth', 165, 41, 0.9, 0.2, 0.05); [392, 466, 587].forEach((f, i) => tone('triangle', f, f, 0.5, 0.14, 0.5 + i * 0.16)); tone('triangle', 784, 784, 0.9, 0.16, 1.0); },
  slashPyro() { noise(0.18, 0.2, 600, 0.5); tone('sine', 320, 110, 0.16, 0.1); file('swing', 0.22, 0.8); if (Math.random() < 0.5) tone('triangle', 1800, 900, 0.08, 0.04, 0.04); },
  hurtPyro() { file('hurt', 0.55, 1.28) || (tone('sawtooth', 340, 90, 0.28, 0.22), noise(0.12, 0.18, 600)); },
  throwWhoosh() { noise(0.28, 0.22, 900, 0.5); for (let i = 0; i < 6; i++) tone('triangle', 700 - i * 60, 500 - i * 60, 0.05, 0.06, i * 0.045); },
  shieldCatch() { tone('square', 900, 400, 0.06, 0.12); noise(0.05, 0.18, 2400, 1.2); tone('sine', 220, 180, 0.12, 0.1, 0.03); },
  medal() { for (let i = 0; i < 3; i++) tone('square', [523, 659, 784][i], [523, 659, 784][i], 0.12, 0.08, i * 0.1); tone('square', 1047, 1047, 0.3, 0.08, 0.3); },
  gillOpen() { tone('sine', 300, 900, 0.35, 0.12); tone('sine', 450, 1200, 0.35, 0.08, 0.05); noise(0.3, 0.1, 3000, 0.8); },
  spark() { noise(0.04, 0.2, 4200, 1.4); tone('square', 2400, 1600, 0.05, 0.08, 0.02); tone('sine', 520, 380, 0.22, 0.1, 0.06); },
  drip() { tone('sine', 1900 + Math.random() * 600, 900, 0.09, 0.05); tone('sine', 2600, 1400, 0.05, 0.03, 0.06); },
  rattle(v = 1) { noise(0.05, 0.16 * v, 1400, 0.9); tone('square', 180 + Math.random() * 60, 120, 0.05, 0.05 * v, 0.01); },
  rumble() { tone('sine', 60, 30, 0.7, 0.3); noise(0.6, 0.3, 180, 0.5); tone('sawtooth', 48, 34, 0.5, 0.1, 0.1); },
  heartbeatUI() { tone('sine', 80, 50, 0.12, 0.25); tone('sine', 70, 40, 0.14, 0.2, 0.16); },
});
export const debugAudio = () => ({ ac, musicGain, sfxGain, ambGain, musicSrc, currentTrack, wantTrack, ambKind });
export const SFX_NAMES = () => Object.keys(SFX).filter(k => typeof SFX[k] === 'function');
export const MUSIC_NAMES = ['theme', 'theme2', 'theme3', 'theme4', 'boss', 'boss2', 'king', 'cave', 'select', 'town', 'adventure', 'ending'];
export const AMBIENT_NAMES = ['forest', 'water', 'hive', 'rain', 'wind'];
