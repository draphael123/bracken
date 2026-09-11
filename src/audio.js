// audio.js — CC0 sample playback with synth fallbacks, and three music tracks (theme / boss / select).
let ac = null, master = null, musicGain = null, sfxGain = null, noiseBuf = null, musicLP = null, uiGain = null, revGain = null, conv = null, revOn = false, trackG = null, muffled = false, lowHp = false, ambVol = 1;
let vol = 0.5, sfxFiles = true, musicOn = true;
const TRACKS = { theme: './audio/theme.ogg', theme2: './audio/theme2.ogg', theme3: './audio/theme3.mp3', theme4: './audio/theme4.mp3', boss: './audio/boss.ogg', boss2: './audio/boss2.ogg', king: './audio/king.mp3', cave: './audio/cave.mp3', town: './audio/town.mp3', adventure: './audio/adventure.mp3', stockade: './audio/stockade.ogg', sunspire: './audio/sunspire.ogg', stormhold: './audio/stormhold.ogg', roc: './audio/roc.ogg', highcrown: './audio/highcrown.ogg', queen: './audio/queen.ogg', ending: './audio/ending.ogg', select: './audio/select.ogg', ambForest: './audio/ambience_forest.mp3' };
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
  sfxGain = ac.createGain(); sfxGain.gain.value = vol;
  { const comp = ac.createDynamicsCompressor(); comp.threshold.value = -12; comp.knee.value = 10; comp.ratio.value = 3.5; comp.attack.value = 0.003; comp.release.value = 0.18; sfxGain.connect(comp); comp.connect(master); } // twenty things dying at once should not clip
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

// ---------- where a sound comes from ----------
// main.js says where the thing making the next sounds is (emitAt({pan, v})), and every sound made until it says
// otherwise goes through a panned, quieter bus: an archer off the right of the screen is off to the right and
// further away. The player's own sounds are never placed. Buses are cached by rounded pan and volume.
let emit = null; const busCache = {};
export function emitAt(o) { emit = o && (o.v < 0.97 || Math.abs(o.pan) > 0.05) ? o : null; }
export const emitNow = () => emit;
function out() {
  if (!emit || !ac) return sfxGain;
  const p = Math.round(emit.pan * 10) / 10, v = Math.max(1, Math.round(emit.v * 10)) / 10, k = p + '|' + v;
  let n = busCache[k];
  if (!n) { n = ac.createGain(); n.gain.value = v; if (ac.createStereoPanner) { const sp = ac.createStereoPanner(); sp.pan.value = p; n.connect(sp); sp.connect(sfxGain); } else n.connect(sfxGain); busCache[k] = n; }
  return n;
}
// the same sound twice in the same instant is one sound, louder, not two: six crows waking together caw once
const lastAt = {};
const gate = (k, sec) => { if (!ac) return false; const t = ac.currentTime; if (t - (lastAt[k] ?? -9) < sec) return false; lastAt[k] = t; return true; };

// ---------- samples ----------
function file(name, v = 0.6, rate = 1, dest = null) {
  if (!ac || !sfxFiles) return false;
  const arr = clips[name]; if (!arr) return false;
  const opts = arr.filter(Boolean); if (!opts.length) return false;
  const s = ac.createBufferSource(); s.buffer = opts[(Math.random() * opts.length) | 0]; s.playbackRate.value = rate * (0.94 + Math.random() * 0.12);
  const g = ac.createGain(); g.gain.value = v; s.connect(g); g.connect(dest || out()); s.start();
  return true;
}

// ---------- synth ----------
function tone(type, f0, f1, dur, v = 0.3, delay = 0, dest = null) {
  if (!ac) return;
  const t = ac.currentTime + delay;
  const fx = !dest || dest === sfxGain; if (!dest) dest = out();
  if (fx) { const k = 0.97 + Math.random() * 0.06; f0 *= k; f1 *= k; } // no two the same: a fixed pitch is what makes synth sound like a machine
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, v = 0.3, freq = 1000, q = 0.8, delay = 0, dest = null) {
  if (!ac) return;
  const t = ac.currentTime + delay;
  const s = ac.createBufferSource(); s.buffer = noiseBuf;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq * (0.92 + Math.random() * 0.16); f.Q.value = q;
  const g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest || out()); s.start(t); s.stop(t + dur + 0.02);
}
// a held note that swells in and dies away, through a lowpass: horns, chants, drones (tone() only strikes)
function pad(type, f0, f1, dur, v = 0.2, delay = 0, lp = 1800, att = 0.06) {
  if (!ac) return;
  const t = ac.currentTime + delay, o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + dur);
  f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = 0.7;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + att); g.gain.setValueAtTime(v, t + Math.max(att, dur * 0.6)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(f); f.connect(g); g.connect(out()); o.start(t); o.stop(t + dur + 0.05);
}
// a struck bell: the note and two inharmonic partials over it, each dying at its own rate
function bell(f, dur = 0.8, v = 0.1, delay = 0) { tone('sine', f, f * 0.998, dur, v, delay); tone('sine', f * 2.76, f * 2.75, dur * 0.55, v * 0.32, delay); tone('sine', f * 5.4, f * 5.38, dur * 0.3, v * 0.14, delay); }

// THE HERO'S VOICE. Everything the player's own body makes - jumps, landings, steps, the swing, the hurt,
// the death, the roll - comes in two kinds. The knight is steel: chain that jingles when he jumps and on
// every other step, a clank in every landing, a blade that rings. The pyromancer is cloth and fire: a
// robe that flutters, soft steps, a staff that whooshes and crackles, embers that pop, a jet that roars
// for as long as she holds it. Enemies keep the shared sounds; only the player's calls come through here.
let heroVoice = 'knight', stepN = 0, jetSrc = null, jetGain = null;
export function setHeroVoice(h) { heroVoice = h === 'pyro' || h === 'paladin' ? h : 'knight'; }
const vary = f => f * (0.94 + Math.random() * 0.12);
const chain = (v = 0.03, n = 3) => { for (let i = 0; i < n; i++) tone('square', vary(3000 + i * 260), 2400, 0.03, v, i * 0.022); noise(0.05, v * 2.2, 4200, 1.6); };
const crackle = (n = 4, d0 = 0) => { for (let i = 0; i < n; i++) tone('square', vary(1600 + Math.random() * 1400), 700, 0.018, 0.035, d0 + i * (0.02 + Math.random() * 0.03)); };
export const SFX = {
  pJump() { if (heroVoice === 'pyro') { noise(0.12, 0.13, 800, 0.5); tone('sine', vary(330), vary(560), 0.12, 0.07); crackle(2, 0.02); }
    else { tone('square', vary(250), vary(540), 0.1, 0.07); chain(0.028, 3); } },
  pLand(surf) { if (heroVoice === 'pyro') { if (surf === 'water') { SFX.land('water'); return; } noise(0.09, 0.14, 520, 0.5); tone('sine', 150, 60, 0.08, 0.1); if (surf === 'wood' || surf === 'stone') file('land', 0.14, 1.25); return; }
    SFX.land(surf); tone('square', vary(1500), 1050, 0.04, 0.05); noise(0.04, 0.07, 3600, 1.4); },
  pStep(surf) { stepN++; if (heroVoice === 'pyro') { if (surf === 'water') { noise(0.06, 0.08, 900, 0.5); return; } noise(0.04, 0.05, vary(650), 0.5); if (stepN % 2) file('step', 0.07, 1.3); return; }
    SFX.step(surf); if (stepN % 2 === 0) tone('square', vary(2900), 2400, 0.025, 0.022); },
  pSlash() { if (heroVoice === 'pyro') { file('swing', 0.26, 0.72); noise(0.2, 0.16, 1300, 0.5, 0.02); tone('sine', vary(300), 100, 0.16, 0.08); crackle(4, 0.03); return; }
    file('swing', 0.5) || (noise(0.12, 0.22, 1800, 0.6), tone('triangle', 900, 300, 0.09, 0.08)); tone('triangle', vary(2300), 1900, 0.1, 0.025, 0.03); },
  pHurt() { if (heroVoice === 'pyro') { file('hurt', 0.55, 1.3) || tone('sawtooth', 340, 90, 0.28, 0.22); noise(0.22, 0.1, 3000, 0.8, 0.03); return; }
    file('hurt', 0.6) || (tone('sawtooth', 240, 60, 0.32, 0.25), noise(0.15, 0.2, 400)); tone('square', 900, 600, 0.06, 0.07); chain(0.02, 2); },
  pDie() { if (heroVoice === 'pyro') { file('hurt', 0.6, 1.1); noise(0.9, 0.22, 1800, 0.4); tone('sine', 420, 60, 0.9, 0.18); crackle(6, 0.1); return; }
    SFX.die(); for (let i = 0; i < 5; i++) tone('square', vary(1300 - i * 120), 500, 0.05, 0.06, 0.15 + i * 0.07); },
  pDodge() { if (heroVoice === 'pyro') { noise(0.2, 0.2, 700, 0.4); tone('triangle', 260, 520, 0.12, 0.05); crackle(2, 0.05); return; }
    SFX.dodge(); chain(0.025, 3); tone('sine', 110, 60, 0.1, 0.12, 0.12); },
  pPogo() { if (heroVoice === 'pyro') { noise(0.08, 0.22, 1800, 0.8); tone('triangle', vary(480), vary(920), 0.11, 0.12); crackle(2); return; }
    tone('square', vary(480), vary(980), 0.12, 0.15); tone('sine', vary(1900), 2500, 0.08, 0.06); },
  pEffort() { file('effort', 0.22, heroVoice === 'pyro' ? 1.75 : 1.35); },
  // the pyromancer's own fire
  ember() { noise(0.1, 0.2, vary(2200), 0.7); tone('triangle', vary(440), 160, 0.12, 0.1); crackle(2, 0.02); },
  heatFull() { tone('triangle', 880, 880, 0.14, 0.08); tone('triangle', 1320, 1320, 0.2, 0.08, 0.07); noise(0.3, 0.12, 1200, 0.4); },
  pyre() { if (!ac) return; const t = ac.currentTime; const src = ac.createBufferSource(); src.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.35); const gn = ac.createGain(); gn.gain.setValueAtTime(0.001, t); gn.gain.exponentialRampToValueAtTime(0.42, t + 0.08); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.7); src.connect(f); f.connect(gn); gn.connect(sfxGain); src.start(t); src.stop(t + 0.75);
    tone('sawtooth', 110, 45, 0.5, 0.18); tone('sine', 80, 30, 0.6, 0.35, 0.04); crackle(6, 0.05); },
  pyreBoom() { noise(0.55, 0.45, 480, 0.4); tone('sine', 64, 26, 0.75, 0.42); noise(0.25, 0.2, 2600, 0.7, 0.05); crackle(8, 0.08); },
  jet(on) { if (!ac) return;
    if (on && !jetSrc) { jetSrc = ac.createBufferSource(); jetSrc.buffer = noiseBuf; jetSrc.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.6;
      jetGain = ac.createGain(); jetGain.gain.value = 0.0001; jetSrc.connect(f); f.connect(jetGain); jetGain.connect(sfxGain); jetSrc.start(); jetGain.gain.setTargetAtTime(0.14, ac.currentTime, 0.05); }
    else if (!on && jetSrc) { const s0 = jetSrc, g0 = jetGain; g0.gain.setTargetAtTime(0.0001, ac.currentTime, 0.06); setTimeout(() => { try { s0.stop(); } catch {} }, 400); jetSrc = null; jetGain = null; }
    else if (on && jetGain && Math.random() < 0.3) crackle(1); },
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

// THE PALADIN is heavier than the knight: plate, not chain - a dull clank in every step and landing where the
// knight jingles - a maul that whooshes low and lands with a thud, and a little bell in everything holy.
const plate = (v = 0.05) => { tone('square', vary(1150), 800, 0.05, v); tone('square', vary(1480), 1100, 0.04, v * 0.7, 0.012); noise(0.06, v * 1.8, 2400, 1.1); };
const PAL = {
  pJump() { tone('square', vary(200), vary(410), 0.11, 0.07); plate(0.04); noise(0.08, 0.06, 500, 0.6); },
  pLand(surf) { SFX.land(surf); tone('sine', 120, 48, 0.14, 0.2); plate(0.05); },
  pStep(surf) { stepN++; SFX.step(surf); tone('sine', vary(130), 70, 0.05, 0.07); if (stepN % 2) plate(0.02); },
  pSlash() { file('swing', 0.5, 0.7) || noise(0.16, 0.24, 900, 0.5); noise(0.18, 0.12, 380, 0.5, 0.02); tone('sine', vary(170), 60, 0.2, 0.09, 0.06); },
  pHurt() { file('hurt', 0.6, 0.82) || (tone('sawtooth', 200, 55, 0.34, 0.25), noise(0.15, 0.2, 400)); plate(0.07); },
  pDie() { SFX.die(); for (let i = 0; i < 4; i++) { plate(0.05); tone('sine', 110 - i * 12, 50, 0.12, 0.12, 0.15 + i * 0.1); } bell(523, 1.6, 0.07, 0.55); },
  pDodge() { noise(0.12, 0.22, 320, 0.6); tone('sine', 95, 40, 0.16, 0.22); plate(0.05); },
  pPogo() { tone('square', vary(380), vary(760), 0.12, 0.13); bell(1046, 0.35, 0.05, 0.02); },
  pEffort() { file('effort', 0.22, 1.1); },
};
for (const k in PAL) { const base = SFX[k]; SFX[k] = (...a) => heroVoice === 'paladin' ? PAL[k](...a) : base(...a); }

// ---------- music: files, with the synth loop as a fallback for the theme ----------
function loadTrack(name) {
  if (!ac || !TRACKS[name] || trackBuf[name] || trackPending[name]) return;
  trackPending[name] = true;
  fetch(TRACKS[name]).then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status)).then(ab => ac.decodeAudioData(ab)).then(b => { trackBuf[name] = b; if (wantTrack === name) playFile(name); }).catch(() => {}).finally(() => { trackPending[name] = false; });
}
// the files were mastered all over the place: the cave loop sits 7 dB under the rest and theme3/4 3 dB over
const TRACK_GAIN = { cave: 2.1, adventure: 1.7, theme3: 0.8, theme4: 0.75 };
const trackVol = name => (name === 'boss' ? 0.5 : 0.45) * duckT * musicVol;
function playFile(name) {
  if (!ac || !trackBuf[name] || currentTrack === name) return;
  if (trackG && musicSrcs.length) { const og = trackG, olds = musicSrcs; og.gain.setTargetAtTime(0, ac.currentTime, 0.22); setTimeout(() => { for (const s of olds) { try { s.stop(); } catch {} } try { og.disconnect(); } catch {} }, 1000); if (musicTimer) clearTimeout(musicTimer); musicTimer = null; musicSrcs = []; musicGen++; } else stopMusic(); // the old track fades under the new one
  currentTrack = name;
  const tg = ac.createGain(); tg.gain.value = 0.001; tg.connect(musicGain); trackG = tg; tg.gain.setTargetAtTime(TRACK_GAIN[name] || 1, ac.currentTime + 0.02, 0.28);
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
// ---------- the paladin's light ----------
Object.assign(SFX, {
  mend() { [523, 659, 784].forEach((f, i) => pad('triangle', f, f * 1.01, 0.7, 0.07, i * 0.07, 3000, 0.08)); bell(1568, 0.8, 0.05, 0.2); noise(0.5, 0.05, 6000, 1.2, 0.1); },
  judgement() { noise(1.0, 0.45, 140, 0.4); tone('sine', 62, 28, 1.0, 0.4); tone('sawtooth', 110, 50, 0.6, 0.14); [784, 1175, 1568].forEach((f, i) => bell(f, 1.3, 0.09, 0.05 + i * 0.03)); },
  lightFull() { bell(1046, 0.9, 0.08); bell(1568, 0.7, 0.05, 0.08); },
  aegis() { file('clang', 0.4, 0.85) || tone('square', 700, 520, 0.08, 0.16); bell(880, 0.5, 0.07, 0.01); },
  hammerfall() { SFX.heavy(); tone('sine', 58, 26, 0.5, 0.35); bell(392, 0.9, 0.08, 0.05); },
  // ---- a portcullis: it rattles down its slot and lands, or it grinds up on its chain ----
  gateDrop() { for (let i = 0; i < 5; i++) { noise(0.035, 0.16, 2400, 1.2, i * 0.045); tone('square', 620 - i * 30, 420, 0.03, 0.05, i * 0.045); } },
  gateLand() { file('clang', 0.55, 0.7) || tone('square', 500, 300, 0.1, 0.2); tone('sine', 80, 34, 0.35, 0.35); noise(0.25, 0.3, 300, 0.6); },
  gateLift() { for (let i = 0; i < 9; i++) { tone('square', 300 + (i % 2) * 60, 260, 0.03, 0.05, i * 0.075); noise(0.03, 0.1, 1800, 1.3, i * 0.075); } tone('sine', 70, 90, 0.7, 0.08); },
  // ---- the moor and the town ----
  caw() { if (!gate('caw', 0.35)) return; tone('sawtooth', vary(820), 560, 0.16, 0.1); noise(0.14, 0.12, 1500, 1); tone('sawtooth', vary(760), 520, 0.14, 0.08, 0.2); noise(0.12, 0.1, 1400, 1, 0.2); },
  hornBlast() { pad('sawtooth', 146, 164, 1.35, 0.15, 0, 900, 0.12); pad('sawtooth', 147.5, 166, 1.35, 0.1, 0.01, 700, 0.12); pad('square', 73, 82, 1.3, 0.05, 0, 400, 0.15); noise(0.5, 0.08, 700, 0.5); },
  baleBump() { if (!gate('bale', 0.12)) return; noise(0.08, 0.1, 520, 0.6); tone('sine', 110, 60, 0.07, 0.06); },
  baleBurst() { for (let i = 0; i < 6; i++) noise(0.05, 0.18, 2600 + (i % 3) * 700, 0.9, i * 0.03); tone('sine', 140, 60, 0.12, 0.14); noise(0.4, 0.08, 1800, 0.4, 0.1); },
  sweepPop() { tone('square', 170, 110, 0.08, 0.1); noise(0.28, 0.16, 650, 0.5); [720, 800, 660].forEach((f, i) => tone('square', f, f * 0.9, 0.05, 0.05, 0.12 + i * 0.07)); },
  sweepHide() { noise(0.3, 0.12, 1100, 0.5); tone('sine', 300, 120, 0.25, 0.05); },
  mawRoar() { noise(0.9, 0.2, 260, 0.4); tone('sawtooth', 90, 46, 0.7, 0.16); tone('square', 60, 40, 0.5, 0.1, 0.05); }, // the moray coming out of its hole
  mawSnap() { file('crack', 0.6) || (noise(0.12, 0.34, 1400, 0.5), tone('square', 220, 70, 0.1, 0.14)); },
  seaBell() { bell(196, 2.4, 0.12); bell(98, 3.0, 0.07, 0.02); }, // Saltreach's bell, as the tide turns
  boreRoar() { noise(1.6, 0.14, 180, 0.3); noise(1.2, 0.08, 700, 0.5, 0.2); tone('sine', 55, 40, 1.4, 0.12); },
  waveCrash() { noise(0.7, 0.16, 900, 0.4); noise(0.5, 0.1, 2400, 0.6, 0.08); },
  sirenSong() { pad('sine', 660, 740, 1.2, 0.05, 0, 3000); pad('triangle', 990, 880, 1.2, 0.03, 0.1, 4000); },
  gust() { noise(0.9, 0.09, 420, 0.4); noise(0.6, 0.05, 900, 0.6); }, // a gale coming down the bridge
  stormChant() { pad('sawtooth', 330, 392, 0.4, 0.06, 0, 1400); pad('sine', 990, 1320, 0.4, 0.04, 0.05, 3000); noise(0.4, 0.06, 600, 0.5); },
  stormZap() { noise(0.12, 0.22, 3200, 0.8); tone('square', 1800, 300, 0.15, 0.07); tone('sine', 700, 200, 0.22, 0.09); },
  shardBristle() { if (!gate('bristle', 0.3)) return; [1568, 2093, 2637].forEach((f, i) => bell(f, 0.3, 0.035, i * 0.04)); noise(0.1, 0.05, 5200, 1.2); },
  // ---- the telegraph: every enemy that winds up says so, a glint for the small ones, a low bell for the big ----
  tell(big) { if (!gate(big ? 'tellB' : 'tell', 0.12)) return; if (big) { tone('triangle', 523, 1046, 0.12, 0.08); bell(1568, 0.3, 0.04, 0.02); } else { tone('triangle', 1318, 1760, 0.07, 0.05); tone('sine', 2637, 2637, 0.1, 0.025, 0.02); } },
});
// ---------- personality: every goblin has a voice of its own pitch, and the beasts their own calls ----------
const GOB_V = { sprig: 1.25, thief: 1.2, sapper: 1.35, archer: 1.15, pike: 0.95, shield: 0.85, brute: 0.65, hearthgob: 0.75, miner: 0.9, sentry: 1.05, sweep: 1.3, thorn: 0.8, rockgoblin: 0.8, snuffer: 0.9, cutter: 1.0, horn: 0.9, shaman: 1.1, stormshaman: 1.1, master: 0.72, sailer: 1.1, kite: 1.3 };
Object.assign(SFX, {
  // it has seen you: a goblin's startled "hup!", a beast's own cry
  foeNotice(t) { if (!gate('notice', 0.3)) return; const r = GOB_V[t];
    if (r) { file('gobHurt', 0.3, r * 1.2) || tone('square', 500 * r, 800 * r, 0.08, 0.08); tone('square', 700 * r, 1150 * r, 0.06, 0.04, 0.03); return; }
    const B = { hound: SFX.bark, greathound: SFX.bark, goat: SFX.bleat, harpy: SFX.screech, spider: SFX.hiss, bat: SFX.chitter, wasp: SFX.buzz, hopper: SFX.ribbit, sporeling: SFX.squelch, wight: SFX.wightMoan, hare: SFX.hareSqueak, crow: SFX.caw, troll: SFX.bellow, grub: SFX.squelch, shardling: SFX.shardBristle, lurker: SFX.squelch }[t]; if (B) B(); },
  // it hit you, or you fell: the goblins laugh
  foeJeer(t) { if (!gate('jeer', 0.6)) return; const r = GOB_V[t] || 1; file('laugh', 0.28, r * 1.1) || [0, 1, 2].forEach(i => tone('square', 420 * r, 340 * r, 0.07, 0.07, i * 0.11)); },
  // goblin gibberish, muttered to itself while it waits
  foeMutter(t) { const r = GOB_V[t]; if (!r || !gate('mutter', 1.6)) return; const n = 3 + ((Math.random() * 3) | 0); for (let i = 0; i < n; i++) tone('square', vary(240 * r), vary(200 * r), 0.05, 0.025, i * 0.075); },
  foeGasp(t) { if (!gate('gasp', 0.5)) return; const r = GOB_V[t] || 1.2; file('gobHurt', 0.24, r * 1.4) || tone('sawtooth', 600 * r, 300 * r, 0.12, 0.06); },
  foeStep(heavy) { if (!gate(heavy ? 'fstepH' : 'fstep', heavy ? 0.12 : 0.09)) return; if (heavy) { tone('sine', 90, 45, 0.1, 0.12); noise(0.05, 0.08, 300, 0.7); } else noise(0.03, 0.045, vary(900), 0.8); },
  skid() { if (!gate('skid', 0.3)) return; noise(0.18, 0.09, 1800, 0.6); noise(0.1, 0.05, 700, 0.5, 0.05); },
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
// ---------- every creature dies in its own voice, and is hurt in its own voice ----------
const gob = (rate, v = 0.5) => file('gobDie', v, rate);
const gobH = (rate, v = 0.4) => file('gobHurt', v, rate);
const DIE = {
  sprig() { gob(1) || (tone('square', 420, 90, 0.25, 0.2), noise(0.12, 0.2, 800)); },
  archer() { gob(1.18) || tone('square', 520, 110, 0.22, 0.18); tone('triangle', 900, 300, 0.18, 0.12, 0.04); /* the bowstring goes */ },
  sapper() { gob(1.3, 0.4) || tone('square', 600, 140, 0.2, 0.16); noise(0.05, 0.4, 2500, 0.3, 0.1); tone('sine', 900, 1800, 0.12, 0.1, 0.12); /* the fuse pops */ },
  shield() { file('gobDie', 0.6, 0.78) || tone('square', 300, 70, 0.35, 0.2); tone('square', 1200, 1100, 0.18, 0.14); noise(0.16, 0.25, 3000, 0.4); /* iron on the ground */ },
  soldier() { gob(0.85) || tone('square', 340, 80, 0.3, 0.2); tone('square', 1100, 900, 0.14, 0.12, 0.05); noise(0.14, 0.22, 2600, 0.4, 0.05); /* the shield rings on the stones */ },
  javelin() { gob(1.1) || tone('square', 480, 100, 0.24, 0.18); noise(0.05, 0.2, 1600, 0.5, 0.1); },
  heavy() { gob(0.55, 0.8) || tone('sawtooth', 180, 40, 0.6, 0.25); for (let i = 0; i < 4; i++) noise(0.06, 0.3, 2200 - i * 300, 0.4, 0.05 + i * 0.09); tone('sine', 60, 30, 0.4, 0.3, 0.2); /* the plate goes down in pieces */ },
  brute() { gob(0.62, 0.7) || tone('sawtooth', 200, 45, 0.5, 0.25); noise(0.3, 0.35, 220, 0.6, 0.12); tone('sine', 70, 30, 0.35, 0.3, 0.14); },
  pike() { gob(0.9) || tone('square', 380, 90, 0.28, 0.18); for (let i = 0; i < 3; i++) noise(0.04, 0.2, 1800 + i * 300, 0.5, 0.12 + i * 0.06); /* the pike clatters */ },
  thief() { gob(1.1) || tone('square', 480, 110, 0.22, 0.18); [1568, 2093, 1760].forEach((f, i) => tone('triangle', f, f, 0.12, 0.08, 0.06 + i * 0.05)); /* the purse spills */ },
  miner() { gob(0.85) || tone('square', 340, 80, 0.3, 0.18); tone('square', 1500, 1400, 0.12, 0.12, 0.1); noise(0.06, 0.2, 2200, 0.5, 0.1); /* the pick drops */ },
  master() { gob(0.72, 0.7) || tone('square', 300, 70, 0.4, 0.2); tone('triangle', 440, 330, 0.5, 0.14, 0.15); tone('triangle', 330, 220, 0.5, 0.1, 0.35); /* the horn falls silent */ },
  rockgoblin() { tone('square', 260, 420, 0.08, 0.16); tone('square', 420, 120, 0.2, 0.16, 0.08); noise(0.4, 0.35, 300, 0.7, 0.1); noise(0.15, 0.2, 900, 0.5, 0.3); /* it comes apart like scree */ },
  wasp() { tone('sawtooth', 900, 700, 0.12, 0.14); tone('sawtooth', 700, 200, 0.2, 0.14, 0.1); noise(0.05, 0.3, 1500, 0.4, 0.28); },
  spit() { noise(0.14, 0.35, 400, 0.4); tone('sine', 320, 90, 0.18, 0.2); tone('sine', 700, 200, 0.08, 0.08, 0.02); },
  hopper() { tone('sawtooth', 260, 110, 0.22, 0.16); tone('sine', 140, 60, 0.25, 0.18, 0.1); noise(0.1, 0.15, 500, 0.5, 0.15); },
  drone() { noise(0.35, 0.3, 500, 0.5); tone('sine', 220, 60, 0.3, 0.16); },
  sporeling() { noise(0.12, 0.3, 700, 0.5); tone('sine', 500, 120, 0.14, 0.14); tone('sine', 900, 1600, 0.06, 0.08, 0.1); },
  shaman() { noise(0.45, 0.3, 900, 0.4); tone('triangle', 800, 180, 0.4, 0.14); tone('sine', 1200, 400, 0.25, 0.08, 0.1); },
  lurker() { tone('sine', 150, 420, 0.14, 0.2); tone('sine', 420, 90, 0.25, 0.2, 0.14); noise(0.2, 0.25, 350, 0.5, 0.12); },
  gill() { noise(0.06, 0.45, 3000, 0.4); tone('triangle', 640, 180, 0.2, 0.14, 0.02); },
  heart() { tone('sine', 70, 55, 0.18, 0.4); tone('sine', 65, 50, 0.18, 0.4, 0.28); tone('sine', 50, 25, 0.9, 0.3, 0.6); },
  thorn() { for (let i = 0; i < 4; i++) noise(0.04, 0.25, 1400 + i * 250, 0.6, i * 0.05); tone('triangle', 500, 150, 0.25, 0.14, 0.1); },
  hound() { tone('sine', 900, 420, 0.18, 0.2); tone('sine', 520, 240, 0.28, 0.16, 0.17); },
  greathound() { tone('sawtooth', 420, 150, 0.7, 0.22); tone('sawtooth', 415, 140, 0.7, 0.12, 0.03); tone('sine', 300, 80, 0.5, 0.2, 0.5); noise(0.3, 0.3, 200, 0.6, 0.7); },
  bat() { tone('square', 2500, 3600, 0.06, 0.1); tone('square', 3400, 1300, 0.14, 0.1, 0.06); noise(0.06, 0.15, 3000, 0.4, 0.14); },
  spider() { noise(0.18, 0.3, 2400, 0.3); noise(0.08, 0.4, 900, 0.5, 0.16); tone('square', 1800, 600, 0.1, 0.08, 0.14); },
  grub() { SFX.grubDie(); },
  troll() { tone('sawtooth', 130, 34, 1.0, 0.28); tone('sawtooth', 128, 30, 1.0, 0.14, 0.02); noise(0.5, 0.4, 150, 0.7, 0.6); tone('sine', 60, 25, 0.5, 0.35, 0.65); },
  harpy() { tone('sawtooth', 1700, 420, 0.45, 0.14); tone('sawtooth', 1750, 400, 0.45, 0.08, 0.02); noise(0.4, 0.2, 1200, 0.3, 0.25); },
  goat() { tone('sawtooth', 520, 480, 0.12, 0.14); tone('sawtooth', 480, 560, 0.12, 0.14, 0.12); tone('sawtooth', 560, 180, 0.3, 0.14, 0.24); },
  hare() { tone('sine', 2200, 2900, 0.06, 0.1); tone('sine', 2800, 1200, 0.16, 0.1, 0.06); noise(0.12, 0.2, 300, 0.6, 0.2); },
  wight() { tone('sine', 210, 90, 0.9, 0.18); tone('sine', 214, 92, 0.9, 0.1, 0.05); noise(0.9, 0.16, 500, 0.15, 0.1); },
  kite() {},
  folk() { file('gobHurt', 0.35, 1.6) || tone('sawtooth', 700, 300, 0.2, 0.1); },
  crow() { tone('sawtooth', 900, 300, 0.25, 0.12); noise(0.3, 0.15, 2400, 0.4, 0.08); for (let i = 0; i < 3; i++) noise(0.04, 0.08, 3200, 1, 0.12 + i * 0.06); /* a caw cut short, and feathers */ },
  horn() { gob(0.8) || tone('square', 320, 80, 0.3, 0.18); pad('sawtooth', 150, 88, 0.8, 0.09, 0.12, 700); /* the horn sighs out of him */ },
  shardling() { noise(0.3, 0.3, 3600, 0.7); [2637, 2093, 1568, 1175].forEach((f, i) => bell(f, 0.35, 0.05, i * 0.05)); tone('sawtooth', 160, 60, 0.25, 0.1); },
  sentry() { gob(1.05) || tone('square', 500, 110, 0.22, 0.16); bell(988, 0.8, 0.07, 0.12); SFX.clatter(); /* his bell hits the floor */ },
  hearthgob() { gob(0.7, 0.65) || tone('sawtooth', 240, 60, 0.4, 0.22); noise(0.6, 0.18, 2400, 0.5, 0.12); tone('sine', 90, 40, 0.3, 0.25, 0.1); /* the fire goes out with him */ },
  sweep() { gob(1.25) || tone('square', 560, 120, 0.22, 0.16); noise(0.45, 0.24, 520, 0.4, 0.05); SFX.clatter(); /* a cloud of soot and the brush */ },
  stormshaman() { noise(0.5, 0.28, 900, 0.4); tone('triangle', 900, 200, 0.4, 0.13); SFX.stormZap(); pad('sine', 1200, 300, 0.8, 0.05, 0.2, 2500); },
  cutter() { gob(0.95) || tone('square', 420, 90, 0.25, 0.18); tone('square', 1300, 1200, 0.12, 0.1, 0.1); noise(0.06, 0.2, 2200, 0.5, 0.1); /* the axe drops */ },
  snuffer() { gob(0.9) || tone('square', 380, 90, 0.25, 0.18); tone('triangle', 1700, 1600, 0.1, 0.08, 0.1); SFX.puff(); },
  sailer() { gob(1.1) || tone('square', 520, 110, 0.22, 0.16); for (let i = 0; i < 3; i++) noise(0.07, 0.18, 800, 0.6, 0.08 + i * 0.09); SFX.thud(); /* the sail flaps down */ },
  suncatcher() { [2093, 1568, 1319, 1047, 784, 659, 523].forEach((f, i) => bell(f, 0.9, 0.09, i * 0.09)); pad('sine', 1760, 220, 1.3, 0.08, 0.2, 4000); noise(0.6, 0.35, 220, 0.5, 0.6); tone('sine', 55, 25, 0.9, 0.35, 0.6); /* the light goes out of it, note by note, and it lands */ },
  roc() { tone('sawtooth', 2400, 500, 1.1, 0.18); tone('sawtooth', 2430, 480, 1.1, 0.09, 0.02); for (let i = 0; i < 4; i++) noise(0.12, 0.3, 320, 0.6, 0.4 + i * 0.18); tone('sine', 60, 25, 0.6, 0.4, 1.2); noise(0.4, 0.4, 200, 0.6, 1.2); /* the scream, the wings beat out, the fall */ },
  gqueen() { file('roar', 0.6, 0.6) || tone('sawtooth', 110, 40, 1.2, 0.3); gob(0.55, 0.8); [2400, 1900, 1500, 1200, 950].forEach((f, i) => tone('triangle', f, f * 0.9, 0.2, 0.1, 0.8 + i * 0.12)); SFX.thunder(); /* the last of the line, and her crown rolling on the stone */ },
  lance() { gob(0.6, 0.8) || tone('sawtooth', 200, 45, 0.6, 0.25); SFX.heavy(); [1500, 1200, 950, 700, 520].forEach((f, i) => { tone('square', f, f * 0.93, 0.18, 0.12, 0.3 + i * 0.16); noise(0.07, 0.26, f * 2, 0.5, 0.3 + i * 0.16); }); /* he goes down and the plate comes off him */ },
  // ---- bosses and the mini-bosses: a cry of their own over the boss drum ----
  queen() { tone('sawtooth', 2200, 600, 0.9, 0.2); tone('sawtooth', 2230, 590, 0.9, 0.1, 0.02); tone('square', 900, 200, 0.6, 0.1, 0.5); noise(0.6, 0.2, 1800, 0.3, 0.6); },
  frog() { tone('sawtooth', 130, 40, 1.2, 0.3); tone('sawtooth', 128, 38, 1.2, 0.14, 0.03); for (let i = 0; i < 5; i++) noise(0.06, 0.2, 350, 0.6, 0.5 + i * 0.13); /* a long croak, then the bubbles */ },
  chief() { gob(0.62, 0.8) || tone('square', 380, 70, 0.8, 0.25); tone('triangle', 330, 220, 0.6, 0.14, 0.4); tone('triangle', 220, 110, 0.7, 0.12, 0.7); },
  mother() { noise(1.6, 0.35, 220, 0.3); tone('sine', 85, 28, 1.6, 0.3); tone('sine', 170, 40, 1.2, 0.1, 0.2); },
  king() { SFX.kingLaugh(); tone('square', 320, 60, 0.6, 0.2, 0.5); [2400, 1900, 1500, 1200].forEach((f, i) => tone('triangle', f, f * 0.9, 0.16, 0.12, 0.9 + i * 0.11)); /* the crown rolls */ },
  ram() { tone('sawtooth', 300, 60, 1.2, 0.26); tone('sawtooth', 296, 58, 1.2, 0.12, 0.02); noise(0.3, 0.45, 180, 0.6, 1.0); noise(0.3, 0.35, 160, 0.6, 1.3); /* the bellow, then he comes down twice */ },
  owl() { [700, 560, 420].forEach((f, i) => tone('sine', f, f * 0.8, 0.28, 0.18, i * 0.3)); noise(0.8, 0.14, 1500, 0.2, 0.5); /* three hoots, and the feathers */ },
  forgemaster() { SFX.forgeSteam(); [1500, 1100, 800, 600].forEach((f, i) => { tone('square', f, f * 0.95, 0.2, 0.12, 0.3 + i * 0.22); noise(0.06, 0.25, f * 2, 0.5, 0.3 + i * 0.22); }); /* the steam, then the iron comes off him piece by piece */ },
  golem() { SFX.golemShatter(); for (let i = 0; i < 10; i++) tone('triangle', 3200 - i * 220, 2400 - i * 200, 0.25, 0.08, 0.2 + i * 0.07); noise(0.7, 0.2, 4000, 0.3, 0.3); /* the glass comes down */ },
  windcaller() { tone('sine', 520, 1400, 0.5, 0.16); tone('sine', 1400, 300, 0.7, 0.14, 0.5); noise(1.4, 0.3, 700, 0.15, 0.3); noise(0.8, 0.25, 300, 0.2, 0.9); /* the chant runs backwards and the wind goes out of him */ },
};
const HURT = {
  sprig() { gobH(1) || tone('square', 500, 300, 0.08, 0.14); },
  archer() { gobH(1.2) || tone('square', 620, 380, 0.08, 0.14); },
  sapper() { gobH(1.35, 0.35) || tone('square', 700, 450, 0.07, 0.12); },
  shield() { SFX.clank(); gobH(0.85) || tone('square', 380, 240, 0.09, 0.12); },
  soldier() { SFX.clank(); gobH(0.88) || tone('square', 400, 250, 0.09, 0.12); },
  javelin() { gobH(1.12) || tone('square', 560, 340, 0.08, 0.13); },
  heavy() { SFX.clank(); gobH(0.58, 0.6) || tone('sawtooth', 200, 110, 0.14, 0.16); },
  brute() { gobH(0.65, 0.5) || tone('sawtooth', 220, 120, 0.14, 0.16); },
  pike() { gobH(0.92) || tone('square', 460, 280, 0.08, 0.14); },
  thief() { gobH(1.1) || tone('square', 560, 340, 0.08, 0.14); tone('triangle', 1760, 1760, 0.06, 0.06, 0.03); },
  miner() { gobH(0.88) || tone('square', 420, 260, 0.09, 0.14); },
  master() { gobH(0.72, 0.5) || tone('square', 320, 200, 0.12, 0.14); },
  rockgoblin() { noise(0.05, 0.3, 1500, 0.5); tone('square', 300, 180, 0.08, 0.12, 0.02); },
  wasp() { tone('sawtooth', 1100, 800, 0.08, 0.12); },
  spit() { noise(0.08, 0.3, 500, 0.5); tone('sine', 400, 250, 0.08, 0.12); },
  hopper() { SFX.ribbit(); },
  drone() { noise(0.1, 0.2, 600, 0.5); },
  sporeling() { SFX.squelch(); },
  shaman() { tone('triangle', 900, 500, 0.1, 0.12); noise(0.08, 0.2, 1000, 0.5); },
  lurker() { tone('sine', 200, 350, 0.08, 0.16); },
  gill() { noise(0.05, 0.3, 2500, 0.4); tone('triangle', 700, 400, 0.08, 0.1); },
  heart() { SFX.heart(); },
  thorn() { SFX.clatter(); },
  hound() { SFX.yelp(); },
  greathound() { tone('sawtooth', 260, 180, 0.16, 0.18); noise(0.08, 0.2, 400, 0.6); },
  bat() { SFX.chitter(); },
  spider() { SFX.hiss(); },
  grub() { noise(0.1, 0.3, 450, 0.5); tone('sine', 260, 140, 0.1, 0.14); },
  troll() { tone('sawtooth', 150, 90, 0.2, 0.2); noise(0.1, 0.2, 200, 0.6); },
  harpy() { SFX.screech(); },
  goat() { SFX.goatCry(); },
  hare() { SFX.hareSqueak(); },
  wight() { tone('sine', 240, 160, 0.25, 0.14); },
  kite() { SFX.kiteChatter(); },
  folk() { file('gobHurt', 0.3, 1.6) || tone('sawtooth', 700, 400, 0.1, 0.08); },
  crow() { tone('sawtooth', 1000, 700, 0.07, 0.1); noise(0.08, 0.1, 3000, 0.8); },
  horn() { gobH(0.8) || tone('square', 380, 240, 0.09, 0.12); },
  shardling() { bell(2637, 0.2, 0.05); noise(0.05, 0.12, 5000, 0.8); },
  sentry() { gobH(1.05) || tone('square', 560, 340, 0.08, 0.12); bell(988, 0.25, 0.04, 0.02); },
  hearthgob() { gobH(0.7, 0.5) || tone('sawtooth', 240, 140, 0.14, 0.16); noise(0.12, 0.1, 2400, 0.6); },
  sweep() { gobH(1.3) || tone('square', 640, 400, 0.08, 0.12); noise(0.14, 0.1, 600, 0.5, 0.03); /* a cough of soot */ },
  stormshaman() { tone('triangle', 900, 500, 0.1, 0.12); noise(0.06, 0.14, 3000, 0.8); },
  cutter() { gobH(0.95) || tone('square', 460, 280, 0.08, 0.14); },
  snuffer() { gobH(0.9) || tone('square', 420, 260, 0.09, 0.14); },
  sailer() { gobH(1.1) || tone('square', 560, 340, 0.08, 0.14); noise(0.06, 0.12, 800, 0.6); },
  suncatcher() { bell(1319, 0.3, 0.07); bell(1760, 0.25, 0.05, 0.03); noise(0.05, 0.14, 5000, 0.5); },
  roc() { tone('sawtooth', 2000, 1400, 0.14, 0.13); tone('sawtooth', 2030, 1380, 0.14, 0.06, 0.01); },
  gqueen() { gobH(0.55, 0.6) || tone('sawtooth', 200, 120, 0.2, 0.2); tone('triangle', 2100, 2000, 0.08, 0.06, 0.03); },
  lance() { SFX.clank(); gobH(0.6, 0.45) || tone('sawtooth', 220, 130, 0.14, 0.14); },
  queen() { tone('sawtooth', 1900, 1300, 0.14, 0.14); tone('sawtooth', 1920, 1280, 0.14, 0.07, 0.01); },
  frog() { SFX.croak(); },
  chief() { SFX.chiefBark(); },
  mother() { SFX.thump(); },
  king() { tone('square', 260, 150, 0.16, 0.18); tone('triangle', 2100, 2000, 0.1, 0.1, 0.02); /* a grunt and the crown rings */ },
  ram() { SFX.snort(); },
  owl() { tone('sine', 620, 480, 0.12, 0.16); tone('sine', 500, 400, 0.1, 0.12, 0.1); },
  forgemaster() { noise(0.14, 0.3, 2500, 0.3); tone('sawtooth', 180, 120, 0.12, 0.14); /* a hiss of steam and a grunt */ },
  golem() { tone('triangle', 2600, 1900, 0.12, 0.14); tone('triangle', 1300, 1000, 0.1, 0.1, 0.03); noise(0.05, 0.2, 5000, 0.4); },
  windcaller() { tone('square', 700, 420, 0.1, 0.14); tone('sine', 1300, 1700, 0.08, 0.08, 0.04); },
};
SFX.dieOf = t => DIE[t] || null;
SFX.hurtOf = t => HURT[t] || null;
export const SFX_NAMES = () => Object.keys(SFX).filter(k => typeof SFX[k] === 'function');
export const MUSIC_NAMES = ['theme', 'theme2', 'stockade', 'cave', 'theme3', 'theme4', 'town', 'sunspire', 'adventure', 'stormhold', 'highcrown', 'boss', 'boss2', 'king', 'roc', 'queen', 'select', 'ending'];
export const AMBIENT_NAMES = ['forest', 'water', 'hive', 'rain', 'wind'];
