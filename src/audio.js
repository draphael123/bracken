// audio.js — CC0 sample playback with synth fallbacks, and three music tracks (theme / boss / select).
let ac = null, master = null, musicGain = null, sfxGain = null, noiseBuf = null, musicLP = null, uiGain = null, revGain = null, conv = null, revOn = false, trackG = null, muffled = false, lowHp = false, ambVol = 1;
let vol = 0.5, sfxFiles = true, musicOn = true;
const TRACKS = { stormharbor: './audio/stormharbor.wav', burial: './audio/burial.wav', store: './audio/store.wav', hurricane: './audio/hurricane.ogg', drowned: './audio/drowned.ogg', theme: './audio/theme.ogg', theme2: './audio/theme2.ogg', theme3: './audio/theme3.mp3', theme4: './audio/theme4.mp3', boss: './audio/boss.ogg', boss2: './audio/boss2.ogg', boss3: './audio/boss3.ogg', boss4: './audio/boss4.ogg', snow: './audio/snow.ogg', king: './audio/king.mp3', cave: './audio/cave.mp3', town: './audio/town.mp3', adventure: './audio/adventure.mp3', stockade: './audio/stockade.ogg', sunspire: './audio/sunspire.ogg', stormhold: './audio/stormhold.ogg', roc: './audio/roc.ogg', highcrown: './audio/highcrown.ogg', queen: './audio/queen.ogg', ending: './audio/ending.ogg', select: './audio/select.ogg', ambForest: './audio/ambience_forest.mp3', longwater: './audio/longwater.ogg', reef: './audio/reef.mp3', flotilla: './audio/flotilla.ogg', waymeet: './audio/waymeet.ogg', marketday: './audio/marketday.ogg',
  ambWind: './audio/ambWind.ogg', ambTown: './audio/ambTown.ogg', ambShore: './audio/ambShore.ogg', ambShip: './audio/ambShip.ogg', ambCave: './audio/ambCave.ogg', ambDeep: './audio/ambDeep.ogg', ambDrip: './audio/ambDrip.ogg',
  /* CC0: MintoDog's stage-select set, skrjablin's Sailor Waltz, Memoraphile's Spooky Dungeon (audio/CREDITS.txt) */
  musForest: './audio/musForest.ogg', musCastle: './audio/musCastle.ogg', musMountain: './audio/musMountain.ogg', musUnder: './audio/musUnder.ogg',
  musBeach: './audio/musBeach.ogg', musSailor: './audio/musSailor.ogg', musDungeon: './audio/musDungeon.ogg',
  /* ONE THEME PER LEVEL, ONE PER BOSS: all CC0 from OpenGameArt, levelled to the rest (audio/CREDITS.txt) */
  sleepers: './audio/sleepers.ogg', trench: './audio/trench.ogg', barrows: './audio/barrows.ogg', quarry: './audio/quarry.ogg', skysail: './audio/skysail.ogg',
  frogking: './audio/frogking.ogg', sporemother: './audio/sporemother.ogg', ramlord: './audio/ramlord.ogg', owlreeve: './audio/owlreeve.ogg', herald: './audio/herald.ogg', reefmaw: './audio/reefmaw.ogg', closedhelm: './audio/closedhelm.ogg',
  quartermaster: './audio/quartermaster.ogg', houndmaster: './audio/houndmaster.ogg', masthead: './audio/masthead.ogg', causeway: './audio/causeway.ogg', kraken: './audio/kraken.ogg', hilltroll: './audio/hilltroll.ogg', rimewright: './audio/rimewright.ogg', captain: './audio/captain.ogg', tollmaster: './audio/tollmaster.ogg', grandmother: './audio/grandmother.ogg', fields: './audio/fields.ogg', scarecrowking: './audio/scarecrowking.ogg' };
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
/* CHARACTER VOICES OFF: no recorded grunt, shout, cry or laugh from anyone - every one of them has a non-vocal fallback */
let voicesOn = true; export function setVoices(v) { voicesOn = !!v; }
const VOCAL = new Set(['gobDie', 'gobHurt', 'laugh', 'effort', 'hurt', 'roar', 'bossHurt', 'croak']);
export function setMusicVolume(v) { musicVol = Math.max(0, Math.min(1, v)); if (musicGain && currentTrack && musicOn) musicGain.gain.value = trackVol(currentTrack); }
export const musicIsFile = () => !!trackBuf[currentTrack];
export function setUiVolume(v) { if (uiGain) uiGain.gain.value = Math.max(0, Math.min(1, v)); }
export function setReverb(v) { if (!revGain) return; const want = v > 0.08; if (want !== revOn) { revOn = want; try { if (want) sfxGain.connect(conv); else sfxGain.disconnect(conv); } catch {} } revGain.gain.setTargetAtTime(want ? Math.max(0, Math.min(0.5, v)) : 0, ac.currentTime, 0.3); } // the convolver runs only in the halls and galleries that need it
export function setAmbientVolume(v) { ambVol = Math.max(0, Math.min(1, v)); if (ac && ambKind) ambGain.gain.setTargetAtTime(ambTarget(ambKind), ac.currentTime, 0.3); }
const ambTarget = kind => (kind === 'forest' ? 0.3 : kind === 'rain' ? 0.09 : kind === 'water' ? 0.16 : kind === 'wind' ? 0.24 : kind === 'town' ? 0.34 : kind === 'shore' ? 0.3 : kind === 'ship' ? 0.32 : kind === 'cave' ? 0.36 : kind === 'deep' ? 0.34 : kind === 'drip' ? 0.3 : kind === 'tavern' ? 0.32 : kind === 'hold' ? 0.36 : kind === 'hall' ? 0.22 : 0.14) * ambVol;
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
  if (!voicesOn && VOCAL.has(name)) return false;
  const arr = clips[name]; if (!arr) return false;
  const opts = arr.filter(Boolean); if (!opts.length) return false;
  const s = ac.createBufferSource(); s.buffer = opts[takeOf(name, opts.length)]; s.playbackRate.value = rate * (0.94 + Math.random() * 0.12);
  const g = ac.createGain(); g.gain.value = v; s.connect(g); g.connect(dest || out()); s.start();
  return true;
}

// THE SAME TAKE TWICE IN A ROW IS WHAT MAKES A CROWD SOUND LIKE ONE MAN. Every pool remembers the take it
// played last and never plays it again next.
const lastTake = {};
function takeOf(name, n) { let i = (Math.random() * n) | 0; if (n > 1 && i === lastTake[name]) i = (i + 1 + ((Math.random() * (n - 1)) | 0)) % n; lastTake[name] = i; return i; }
// A VOICE: a recorded take from a kit, at a pitch for the body it is coming out of, and through a lowpass when
// that body has a helmet on. Returns false while the clip is still loading, so every caller keeps its synth.
function voice(name, v = 0.5, rate = 1, lp = 0, delay = 0) {
  if (!ac || !sfxFiles || !voicesOn || !name) return false;
  const opts = (clips[name] || []).filter(Boolean); if (!opts.length) return false;
  const s = ac.createBufferSource(); s.buffer = opts[takeOf(name, opts.length)]; s.playbackRate.value = rate * (0.95 + Math.random() * 0.1);
  const g = ac.createGain(); g.gain.value = v;
  if (lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = 0.8; s.connect(f); f.connect(g); } else s.connect(g);
  g.connect(out()); s.start(ac.currentTime + delay); return true;
}
// a kit's pool for an act, falling back to the nearest act it does have, then to a kit that is one pool
const VOK = (kit, act) => { const fb = { alert: 'attack', effort: 'heavy', heavy: 'attack', jump: 'attack', die: 'hurt', attack: 'alert' };
  for (const a of [act, fb[act]]) { const n = 'vo_' + kit + '_' + a; if (clips[n] && clips[n].some(Boolean)) return n; } return 'vo_' + kit; };
// THE HEROES' OWN VOICES. The knight grunted with a pitched goblin; now each hero is a person.
const HERO_KIT = { knight: { kit: 'm5', rate: 1 }, paladin: { kit: 'm3', rate: 0.88 }, pirate: { kit: 'm1', rate: 1 }, reaper: { kit: 'm4', rate: 0.86, lp: 2600 }, pyro: { kit: 'f3', rate: 1 }, warden: { kit: 'f3', rate: 0.93 } };   /* the same voice as the pyromancer, pitched down: a steadier woman, and not a second of the same one */
function heroVo(act, v) { const k = HERO_KIT[heroVoice] || HERO_KIT.knight; return voice(VOK(k.kit, act), v, k.rate, k.lp || 0); }

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
export function setHeroVoice(h) { heroVoice = h === 'pyro' || h === 'paladin' || h === 'pirate' || h === 'reaper' || h === 'warden' ? h : 'knight'; }
const vary = f => f * (0.94 + Math.random() * 0.12);
const chain = (v = 0.03, n = 3) => { for (let i = 0; i < n; i++) tone('square', vary(3000 + i * 260), 2400, 0.03, v, i * 0.022); noise(0.05, v * 2.2, 4200, 1.6); };
const crackle = (n = 4, d0 = 0) => { for (let i = 0; i < n; i++) tone('square', vary(1600 + Math.random() * 1400), 700, 0.018, 0.035, d0 + i * (0.02 + Math.random() * 0.03)); };
export const SFX = {
  pJump() { if (heroVoice === 'pyro') { if (Math.random() < 0.35) heroVo('jump', 0.28); noise(0.12, 0.13, 800, 0.5); tone('sine', vary(330), vary(560), 0.12, 0.07); crackle(2, 0.02); }
    else { if (heroVoice === 'knight' && Math.random() < 0.18) heroVo('jump', 0.24); tone('square', vary(250), vary(540), 0.1, 0.07); chain(0.028, 3); } },
  pLand(surf) { if (heroVoice === 'pyro') { if (surf === 'water') { SFX.land('water'); return; } noise(0.09, 0.14, 520, 0.5); tone('sine', 150, 60, 0.08, 0.1); if (surf === 'wood' || surf === 'stone') file('land', 0.14, 1.25); return; }
    SFX.land(surf); tone('square', vary(1500), 1050, 0.04, 0.05); noise(0.04, 0.07, 3600, 1.4); },
  pStep(surf) { stepN++; if (heroVoice === 'reaper') { if (surf === 'water') { noise(0.06, 0.07, 800, 0.5); return; } noise(0.05, 0.05, 300, 0.5); tone('sine', 88, 48, 0.09, 0.12); if (stepN % 2) { tone('square', vary(900), 600, 0.04, 0.03); } return; }   /* the biggest man in the game walks like it */
    if (heroVoice === 'pirate') { if (surf === 'water') { noise(0.06, 0.08, 900, 0.5); return; } noise(0.035, 0.06, 420, 0.6); if (stepN % 2) tone('sine', 120, 80, 0.04, 0.03); return; }
    if (heroVoice === 'pyro') { if (surf === 'water') { noise(0.06, 0.08, 900, 0.5); return; } noise(0.04, 0.05, vary(650), 0.5); if (stepN % 2) file('step', 0.07, 1.3); return; }
    SFX.step(surf); if (stepN % 2 === 0) tone('square', vary(2900), 2400, 0.025, 0.022); },
  pSlash() { if (gate('heroShout', 1.1) && Math.random() < 0.3) heroVo('attack', 0.3); if (heroVoice === 'reaper') { noise(0.26, 0.13, 900, 0.35, 0.02); tone('sine', vary(180), 70, 0.22, 0.09); tone('triangle', vary(1400), 700, 0.12, 0.03, 0.03); return; }
    if (heroVoice === 'pirate') { noise(0.09, 0.2, 3400, 0.75, 0.01); tone('triangle', vary(2600), 1500, 0.09, 0.045); tone('sine', vary(700), 420, 0.07, 0.03, 0.02); return; }
    if (heroVoice === 'pyro') { file('swing', 0.26, 0.72); noise(0.2, 0.16, 1300, 0.5, 0.02); tone('sine', vary(300), 100, 0.16, 0.08); crackle(4, 0.03); return; }
    file('swing', 0.5) || (noise(0.12, 0.22, 1800, 0.6), tone('triangle', 900, 300, 0.09, 0.08)); tone('triangle', vary(2300), 1900, 0.1, 0.025, 0.03); },
  pHurt() { if (heroVoice === 'reaper') { heroVo('hurt', 0.5); tone('sawtooth', 150, 50, 0.34, 0.12); noise(0.3, 0.12, 500, 0.4); tone('sine', 90, 40, 0.4, 0.12, 0.04); return; }
    if (heroVoice === 'pirate') { heroVo('hurt', 0.55) || file('hurt', 0.5, 0.86) || tone('sawtooth', 210, 70, 0.3, 0.24); noise(0.16, 0.16, 900, 0.5); return; }
    if (heroVoice === 'pyro') { heroVo('hurt', 0.5) || file('hurt', 0.55, 1.3) || tone('sawtooth', 340, 90, 0.28, 0.22); noise(0.22, 0.1, 3000, 0.8, 0.03); return; }
    heroVo('hurt', 0.55) || file('hurt', 0.6) || (tone('sawtooth', 240, 60, 0.32, 0.25), noise(0.15, 0.2, 400)); tone('square', 900, 600, 0.06, 0.07); chain(0.02, 2); },
  pDie() { if (heroVoice === 'pyro') { heroVo('die', 0.65) || file('hurt', 0.6, 1.1); noise(0.9, 0.22, 1800, 0.4); tone('sine', 420, 60, 0.9, 0.18); crackle(6, 0.1); return; }
    if (!heroVo('die', 0.7)) SFX.die(); else tone('sawtooth', 320, 40, 0.7, 0.1); for (let i = 0; i < 5; i++) tone('square', vary(1300 - i * 120), 500, 0.05, 0.06, 0.15 + i * 0.07); },
  pDodge() { if (heroVoice === 'reaper') { noise(0.3, 0.14, 400, 0.3); tone('sine', 220, 80, 0.24, 0.06); return; }
    if (heroVoice === 'pirate') { noise(0.16, 0.2, 1100, 0.45); tone('triangle', 300, 160, 0.1, 0.05); return; }
    if (heroVoice === 'pyro') { noise(0.2, 0.2, 700, 0.4); tone('triangle', 260, 520, 0.12, 0.05); crackle(2, 0.05); return; }
    SFX.dodge(); chain(0.025, 3); tone('sine', 110, 60, 0.1, 0.12, 0.12); },
  pPogo() { if (heroVoice === 'pyro') { noise(0.08, 0.22, 1800, 0.8); tone('triangle', vary(480), vary(920), 0.11, 0.12); crackle(2); return; }
    tone('square', vary(480), vary(980), 0.12, 0.15); tone('sine', vary(1900), 2500, 0.08, 0.06); },
  // THE PLUNGE, as it starts. The pyromancer's fireball always went down with a puff; the rest of them dropped
  // in silence and were only heard when they landed. Each now goes over in its own voice: the knight's chain,
  // the pirate's coat and a cutlass catching the light, the Death Knight's weight going down like a door shutting.
  pPlunge() { if (heroVoice === 'pyro') { SFX.puff(); return; }
    if (heroVoice === 'reaper') { noise(0.24, 0.14, 380, 0.4); tone('sine', vary(240), 70, 0.22, 0.1); tone('square', vary(900), 600, 0.04, 0.03, 0.03); return; }
    if (heroVoice === 'pirate') { noise(0.14, 0.16, 1300, 0.5); tone('triangle', vary(900), 380, 0.1, 0.05); tone('triangle', vary(2400), 1400, 0.06, 0.03, 0.02); return; }
    if (heroVoice === 'warden') { noise(0.22, 0.1, 2200, 1.4); tone('triangle', vary(760), vary(260), 0.2, 0.06); tone('sine', vary(190), 120, 0.1, 0.05, 0.03); return; }   /* the spear going down point first: a long thin hiss of air along the shaft, no mail */
    tone('square', vary(540), vary(200), 0.14, 0.07); chain(0.03, 3); noise(0.16, 0.12, 700, 0.5, 0.02); },
  /* THE DOWN ATTACK LANDING ON A BODY. The pogo's own chirp is the bounce; this is the blow under it, and it is heavier than any
     ground swing: iron through a helm for the knight, the point punching in for the warden (the TIP'S BELL stays hers alone).
     THE PYROMANCER'S own is a soft one - her boots still do no damage (18b5d38), so there is no iron to ring: a hiss of steam
     where the heat meets whatever she landed on, not a blow at all. */
  pPlungeHit() { if (heroVoice === 'warden') { noise(0.06, 0.24, 900, 0.9); tone('sine', vary(150), 60, 0.16, 0.22); tone('square', vary(620), 300, 0.05, 0.05, 0.01); return; }
    if (heroVoice === 'pyro') { noise(0.14, 0.2, 2600, 0.9); tone('sine', vary(340), 120, 0.16, 0.12); crackle(3, 0.02); return; }
    tone('square', vary(240), 70, 0.14, 0.2); noise(0.08, 0.26, 1500, 0.8); tone('sine', 90, 40, 0.2, 0.24); chain(0.03, 2); },
  /* AND ON THE GROUND: the knight's blade rung into the turf and the ring of it going out both ways; the warden's point driven in
     with a dry crack running forward along the floor. Each is the sound of that down attack's shockwave. THE PALADIN AND THE
     DEATH KNIGHT never reach this call at all now (main.js plungeWave skips it, D.wave: null - HAMMERFALL and graveFall
     already have their own). THE PYROMANCER'S is the ring catching: a bloom of fire instead of a ring of iron. */
  pPlungeGround() { if (heroVoice === 'warden') { tone('square', vary(420), 150, 0.07, 0.08); noise(0.16, 0.16, 520, 0.7); tone('triangle', vary(1300), 700, 0.05, 0.04, 0.04); noise(0.1, 0.08, 2600, 1.2, 0.05); return; }
    if (heroVoice === 'pyro') { noise(0.22, 0.2, 1800, 0.8); tone('sine', vary(200), 60, 0.24, 0.14); crackle(5, 0.03); return; }
    tone('sine', 120, 42, 0.26, 0.3); noise(0.2, 0.2, 380, 0.5); bell(660, 0.3, 0.04, 0.01); tone('square', vary(900), 500, 0.05, 0.05); },
  /* THE DASH ATTACK, as a move of its own. The knight throws his weight in behind the shield with the blade out past it - mail, a
     grunt of iron and the rush of air; the warden goes long and low along the shaft - a whip of ash through the air and the heel
     skidding. THE PYROMANCER'S SLIDE is a hiss and a crackle low along the ground, no iron in it anywhere. */
  pDashStrike() { if (heroVoice === 'warden') { noise(0.2, 0.16, 3000, 1.3); tone('triangle', vary(300), vary(900), 0.12, 0.08); noise(0.14, 0.1, 500, 0.6, 0.05); return; }
    if (heroVoice === 'pyro') { noise(0.16, 0.18, 2200, 0.8); tone('sine', vary(260), 500, 0.14, 0.1); crackle(4, 0.02); return; }
    noise(0.18, 0.18, 1600, 0.7); tone('square', vary(200), vary(90), 0.16, 0.12); chain(0.035, 3); tone('triangle', vary(700), 1100, 0.08, 0.05, 0.02); },
  /* AND WHAT IT HITS: a heavy blunt thump, a shade lower when it is stopped dead than when it carries on through */
  pDashHit(stopped) { tone('sine', stopped ? 80 : 120, 40, 0.18, 0.28); noise(0.09, 0.26, stopped ? 600 : 1100, 0.7); if (stopped) tone('square', vary(300), 120, 0.08, 0.08); },
  pEffort() { heroVo('effort', 0.4) || file('effort', 0.22, heroVoice === 'pyro' ? 1.75 : 1.35); },
  /* ---------- THE WARDEN'S SPEAR ---------- */
  /* THE TIP RANG. Her one rule is WHERE along the shaft it landed, and this is how that is heard: a small struck
     bell over a hard tick of steel, the same note every time. The ear learns the good hit before the eye does, and
     a floating word could not say it - the game hides those in play. */
  tipRing() { bell(1568, 0.26, 0.075); tone('triangle', vary(2600), 1900, 0.05, 0.05); noise(0.035, 0.09, 5200, 1.6); },
  /* AND THE HAFT DID NOT. A dull knock of wood on armour: it must not be mistaken for the bell, because the whole
     lesson is the difference between the two. */
  haftKnock() { tone('sine', vary(175), 105, 0.08, 0.1); noise(0.05, 0.07, 700, 0.7); },
  /* THE SHAFT SWEPT ACROSS HER: ash on steel, a woody crack with a bright tick riding over it. It must not be the
     TIP'S BELL - that note means the good hit and nothing else - and it must not be the knight's iron block either. */
  shaftTurn() { tone('square', vary(520), 300, 0.06, 0.05); noise(0.05, 0.08, 1600, 1.1); tone('triangle', vary(2400), 1700, 0.05, 0.04, 0.02); },
  /* the heel going into the turf as she plants it, and a charge dying on the point */
  braceSet() { tone('square', vary(300), 180, 0.07, 0.05); noise(0.07, 0.1, 900, 0.8); tone('sine', 120, 70, 0.11, 0.09, 0.02); },
  /* THE SHAFT SPRINGING: the vault off a thing over a drop. The ash bows under her and throws her on - a low woody
     twang bending up, the grip creaking, air after it. Not the tip's bell (that is the good hit) and not the knight's
     square-wave pogo: you can hear which of them went over the pit. */
  spearVault() { tone('triangle', vary(170), vary(430), 0.14, 0.1); noise(0.05, 0.1, 1200, 0.9); tone('square', vary(340), 250, 0.04, 0.03, 0.01); noise(0.16, 0.06, 2600, 0.6, 0.05); },
  braceStop() { noise(0.18, 0.28, 560, 0.5); tone('sine', 88, 38, 0.32, 0.3); bell(1046, 0.5, 0.085); tone('triangle', vary(2200), 1400, 0.07, 0.05); },
  vigilFull() { bell(1568, 0.5, 0.08); bell(2093, 0.4, 0.05, 0.08); noise(0.3, 0.1, 3000, 0.5); },
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
  slash() { (Math.random() < 0.5 && file('swish', 0.42)) || file('swing', 0.5) || (noise(0.12, 0.22, 1800, 0.6), tone('triangle', 900, 300, 0.09, 0.08)); },   /* two pools of air: three swings was one swing on a loop */
  // WHAT THE BLADE MET. Every hit already THREW the right thing (sparks off plate, chips off wood, dust off stone) and
  // every hit SOUNDED the same. The pools are Kenney's CC0 impacts and a bone-break pack; the synth under them is
  // only there while the files load, or when the player has chosen synth sound.
  impact(mat, heavy) { if (!gate('imp', 0.035)) return;
    const POOL = { steel: 'imp_steel', wood: 'imp_wood', flesh: 'imp_flesh', soft: 'imp_soft', fungus: 'imp_soft', bone: 'imp_bone', stone: 'imp_stone', shell: 'imp_stone', crystal: 'imp_glass', chitin: 'imp_wood' };
    const base = POOL[mat] || 'imp_flesh', name = heavy && clips[base + 'H'] ? base + 'H' : base;
    if (file(name, mat === 'bone' ? 0.3 : 0.38, heavy ? 0.9 : 1)) return;
    if (mat === 'steel') { tone('square', 1760, 1320, 0.05, 0.05); tone('triangle', 2637, 2600, 0.18, 0.04); }
    else if (mat === 'wood' || mat === 'chitin') { noise(0.06, 0.18, 900, 1.2); tone('sine', 180, 120, 0.08, 0.1); }
    else if (mat === 'stone' || mat === 'shell') { noise(0.08, 0.2, 500, 0.8); tone('sine', 110, 70, 0.1, 0.1); }
    else if (mat === 'crystal') { tone('sine', 3136, 3100, 0.25, 0.04); tone('sine', 4186, 4100, 0.2, 0.03, 0.01); }
    else if (mat === 'bone') { noise(0.05, 0.22, 2400, 2); noise(0.05, 0.16, 1200, 2, 0.03); }
    else { noise(0.07, 0.16, 400, 0.7); tone('sine', 140, 80, 0.08, 0.12); } },
  // THE DEATH KNIGHT'S OWN. He was borrowing a wight's touch, a ram's bellow, a keg going up and a golem's foot.
  dkWard() { if (!gate('dkWard', 0.2)) return; noise(0.12, 0.14, 2200, 2.5); tone('sawtooth', 90, 140, 0.25, 0.07, 0.02); pad('sine', 180, 240, 0.5, 0.05, 0.04, 900, 0.08); },   /* the point goes in, and the ward hums up out of it */
  dkWardHit(k = 0.5) { if (!gate('dkWardHit', 0.06)) return; tone('sine', 110 - 30 * k, 60, 0.22, 0.24); noise(0.1, 0.18, 700, 1.2); tone('triangle', 330 + 220 * k, 300 + 200 * k, 0.12, 0.06, 0.01); },   /* a wet thud into it, and a note that climbs as it fills */
  dkNova(k = 0.6) { noise(0.35 + 0.25 * k, 0.16 + 0.12 * k, 260 + 200 * k, 0.8); tone('sine', 90, 34, 0.45 + 0.3 * k, 0.22 + 0.14 * k); pad('sawtooth', 70, 160 + 120 * k, 0.4, 0.05 + 0.05 * k, 0, 800 + 600 * k, 0.01); if (k > 0.8) tone('sine', 55, 30, 0.6, 0.2, 0.12); },   /* the blood going out of him all at once, bigger as the ward was fuller */
  dkWardBreak() { noise(0.35, 0.34, 2800, 0.9); [1480, 1110, 830, 620].forEach((f, i) => tone('triangle', f, f * 0.55, 0.28, 0.1, i * 0.035)); tone('sawtooth', 120, 36, 0.45, 0.2); tone('sine', 70, 30, 0.4, 0.26, 0.02); },   /* THE WARD BREAKS: blood glass going to pieces over a low thud - not the nova's roar, not the return's bell */
  dkReturn() { bell(1320, 0.5, 0.1); bell(660, 0.7, 0.08, 0.02); noise(0.08, 0.3, 3200, 2); tone('square', 1800, 900, 0.1, 0.08); tone('sine', 80, 40, 0.3, 0.26, 0.03); },   /* a bright ring off the ward, and the blow going back down the arm that threw it */
  dkSurge() { pad('sawtooth', 55, 110, 0.7, 0.12, 0, 900, 0.5); pad('square', 110, 220, 0.7, 0.05, 0, 1400, 0.55); noise(0.6, 0.12, 300, 0.9, 0.1);
    for (const [d, v] of [[0.72, 0.34], [0.96, 0.28], [1.4, 0.22]]) tone('sine', 70, 38, 0.22, v, d); tone('sawtooth', 180, 60, 0.5, 0.08, 0.72); },   /* the blood swells toward him, then three beats of it arriving */
  dkPlant() { noise(0.18, 0.2, 2600, 3); tone('sawtooth', 420, 90, 0.2, 0.08); tone('sine', 60, 30, 0.5, 0.36, 0.08); noise(0.5, 0.26, 180, 0.6, 0.08); file('imp_stone', 0.36, 0.7);
    for (let i = 0; i < 3; i++) noise(0.12, 0.07, 3200, 4, 0.22 + i * 0.07); },   /* a scrape, the ground taking the blade, and the bolts hissing out of it */
  hit() { file('hit', 0.55) || (tone('square', 220, 70, 0.12, 0.22), noise(0.1, 0.25, 700)); },
  kill() { file('kill', 0.6) || (tone('square', 300, 60, 0.2, 0.25), noise(0.18, 0.3, 500), tone('triangle', 800, 1400, 0.12, 0.12, 0.02)); },
  gobDie() { file('gobDie', 0.5); },
  gobHurt() { file('gobHurt', 0.4); },
  hurt() { file('hurt', 0.6) || (tone('sawtooth', 240, 60, 0.32, 0.25), noise(0.15, 0.2, 400)); },
  pogo() { tone('square', 480, 980, 0.13, 0.18); },
  strikeTell() { tone('sine', 900, 2600, 0.5, 0.05); tone('sine', 1300, 3100, 0.45, 0.035, 0.05); noise(0.4, 0.05, 5200, 3, 0.1); }, // the air going tight before a bolt
  zap() { noise(0.18, 0.34, 3000, 1.2); tone('sawtooth', 2200, 400, 0.16, 0.14); noise(0.5, 0.12, 1400, 0.7, 0.05); },
  wave() { noise(1.5, 0.30, 320, 0.5); noise(1.2, 0.22, 900, 0.7, 0.15); tone('sine', 70, 34, 1.4, 0.16); },
  waveBreak() { noise(0.9, 0.42, 1500, 0.5); noise(1.4, 0.30, 500, 0.6, 0.05); tone('sine', 90, 30, 0.8, 0.2); },
  // THE LAMPLIT STREET. A lamp going out, the flame coming back, a constable hearing you in the dark, and the
  // bell the Tollmaster names a due on.
  gutter() { noise(0.5, 0.10, 700, 1.4); tone('sine', 300, 120, 0.45, 0.05); noise(0.3, 0.07, 2200, 2, 0.12); }, // a flame guttering under water
  hiss() { noise(0.34, 0.12, 2600, 1.6); noise(0.22, 0.08, 1200, 2.2, 0.06); tone('sine', 520, 180, 0.3, 0.03, 0.04); }, // and the black water putting it out
  lampUp() { tone('triangle', 420, 1100, 0.18, 0.07); tone('sine', 880, 1320, 0.14, 0.05, 0.05); noise(0.12, 0.08, 3200, 1.2); }, // it catches
  heard() { tone('sine', 180, 130, 0.5, 0.06); tone('sine', 92, 70, 0.7, 0.05, 0.08); noise(0.4, 0.06, 420, 1.2, 0.04); }, // something in the dark has you
  tollBell() { tone('sine', 196, 190, 1.6, 0.12); tone('sine', 392, 384, 1.2, 0.05, 0.01); tone('sine', 98, 96, 2, 0.07, 0.02); noise(0.2, 0.05, 900, 1.6); }, // a due named on a dead city's bell
  // a blade in someone else's hand: duller and lower than yours, because that is how you tell them apart
  foeSlash() { noise(0.09, 0.2, 900, 1.2); tone('sawtooth', 380, 170, 0.08, 0.07); noise(0.05, 0.12, 2400, 0.5, 0.04); },
  // a halberd driven out: the haft first, then the head arriving
  haft() { noise(0.06, 0.16, 420, 1.6); tone('square', 210, 130, 0.09, 0.09); tone('triangle', 1500, 800, 0.05, 0.05, 0.05); noise(0.07, 0.14, 2600, 0.5, 0.06); },
  // THE NEW QUESTIONS GET THEIR OWN SOUNDS. A move you have to read should be a move you can hear coming.
  enGarde() { file('imp_steel', 0.16, 1.45); tone('triangle', 1760, 1740, 0.36, 0.06); tone('sine', 2640, 2600, 0.3, 0.035, 0.02); noise(0.1, 0.07, 5200, 2.2); },   /* a blade held out, ringing: she is offering it */
  riposte() { file('parry', 0.34, 1.15); file('swish', 0.28, 1.25); tone('square', 1900, 2700, 0.04, 0.12); tone('sine', 3300, 2900, 0.22, 0.07, 0.02); noise(0.08, 0.26, 3800, 0.9, 0.05); tone('sawtooth', 720, 170, 0.13, 0.09, 0.06); },   /* the bind, and the point coming through it */
  shoulder() { file('stone', 0.2, 0.7); noise(0.32, 0.22, 360, 0.5); tone('sawtooth', 96, 58, 0.3, 0.12); tone('square', vary(1300), 900, 0.04, 0.05, 0.07); tone('square', vary(1250), 880, 0.04, 0.05, 0.19); },   /* a man in plate starting to run */
  anchorSwing() { file('swish', 0.36, 0.55); file('imp_steelH', 0.18, 0.62); noise(0.48, 0.24, 250, 0.6); tone('sine', 110, 52, 0.42, 0.15); for (let i = 0; i < 5; i++) tone('square', vary(2200 - i * 180), 1400, 0.03, 0.03, 0.05 + i * 0.06); noise(0.2, 0.15, 900, 0.8, 0.26); },   /* the chain paying out, and the iron going round */
  rubble() { file('imp_stone', 0.34, 0.9); file('stone', 0.22, 1.15); noise(0.36, 0.3, 680, 0.5); for (let i = 0; i < 4; i++) noise(0.05, 0.12, vary(1800), 2, 0.05 + i * 0.07); tone('sine', 88, 48, 0.22, 0.12); },   /* a shovel of broken floor */
  pierce() { file('imp_wood', 0.36, 1.25); file('imp_steel', 0.16, 1.6); tone('square', 2400, 800, 0.05, 0.1); noise(0.05, 0.3, 1800, 1.4); tone('sine', 520, 250, 0.12, 0.08, 0.03); noise(0.12, 0.14, 600, 0.7, 0.04); },   /* a bolt through the boards of a shield */
  feint() { file('swish', 0.18, 1.45); noise(0.1, 0.12, 1200, 0.8); tone('square', 300, 430, 0.06, 0.05); tone('triangle', 1100, 1500, 0.05, 0.03, 0.04); },   /* the haft checked in the hands */
  grip() { file('imp_steelH', 0.3, 0.78); tone('square', 180, 118, 0.1, 0.12); noise(0.14, 0.2, 2600, 1.2); tone('sine', 72, 40, 0.3, 0.18, 0.05); },   /* a gauntlet closing on your shield rim */
  // a long pole swung through water: a low whoosh with the wood ringing in it
  pole() { noise(0.22, 0.2, 320, 1.8); tone('sine', 160, 80, 0.2, 0.08); tone('triangle', 520, 300, 0.12, 0.05, 0.06); noise(0.1, 0.1, 1400, 0.5, 0.1); },
  // the bog wight: cold air where a mouth should be
  wightTouch() { pad('sine', 320, 140, 0.7, 0.07, 0, 1200, 0.14); noise(0.5, 0.1, 700, 0.6); tone('sine', 90, 60, 0.6, 0.06, 0.05); },
  swingUp(k) { const r = 1 + Math.min(3, k) * 0.09; noise(0.07, 0.16, 1500 * r, 1.1); tone('triangle', 620 * r, 300 * r, 0.06, 0.05); }, // the run of blows climbs
  coin() { tone('triangle', 1046, 1046, 0.07, 0.11); tone('triangle', 1568, 1568, 0.13, 0.085, 0.045); tone('sine', 3136, 3136, 0.06, 0.03); noise(0.03, 0.035, 4200, 2.5); },
  clank() { file('clang', 0.5) || (tone('square', 1500, 900, 0.05, 0.18), tone('sine', 2300, 2100, 0.16, 0.14), noise(0.05, 0.2, 3200)); },
  parry() { file('parry', 0.5) || tone('square', 1200, 1900, 0.08, 0.16); },
  /* THE GLANCE: the wrong tool for that body (main.js, the family table). Not the clank of a guard ringing and not a cut going in: the
     edge skating off something it could not bite - a dry scrape sliding DOWN, a dull knock under it, and no ring left after. Every
     wrong-verb hit in the game makes this one sound, so it is learned once. */
  glance() { noise(0.12, 0.2, 2600, 0.45); tone('sawtooth', vary(880), 340, 0.1, 0.07); tone('triangle', 210, 120, 0.07, 0.12, 0.01); noise(0.05, 0.1, 600, 0.8, 0.02); },
  spit() { tone('sine', 420, 180, 0.13, 0.2); },
  crack() { file('crack', 0.5) || (noise(0.16, 0.3, 900, 0.5), tone('square', 160, 60, 0.12, 0.18)); },
  die() { file('hurt', 0.7, 0.7); tone('sawtooth', 320, 40, 0.7, 0.28); tone('square', 200, 50, 0.5, 0.15, 0.1); },
  check() { [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.25, 0.18, i * 0.09)); },
  win() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone('triangle', f, f, 0.3, 0.2, i * 0.12)); },
  block() { tone('square', 520, 380, 0.07, 0.2); noise(0.09, 0.26, 900, 0.5); tone('sine', 260, 170, 0.12, 0.12, 0.01); }, // a dull wooden-backed shield taking it
  guardBreak() { file('stagger', 0.6) || (tone('sawtooth', 500, 90, 0.35, 0.3), noise(0.2, 0.3, 900)); },
  /* A CREATURE'S POISE BREAKS: not the hurt sound and not the player's guard going (guardBreak) - a dry snap high up, the body going
     slack under it, and two loose knocks as it settles. The big ones snap lower and settle heavier. */
  poiseBreak(big) { const r = big ? 0.72 : 1; noise(0.07, 0.34, 3400 * r, 0.6); tone('square', 2300 * r, 1300 * r, 0.06, 0.16); tone('sawtooth', 300 * r, 52, 0.3, 0.2, 0.03); tone('sine', 96 * r, 38, big ? 0.42 : 0.28, big ? 0.3 : 0.2, 0.05); for (let i = 0; i < 2; i++) tone('triangle', vary(820 - i * 260) * r, 360 * r, 0.05, 0.08, 0.12 + i * 0.07); },
  dodge() { noise(0.14, 0.18, 1200, 0.4); tone('triangle', 300, 700, 0.1, 0.06); },
  heavy() { file('slam', 0.55) || (tone('square', 140, 40, 0.22, 0.32), noise(0.16, 0.35, 400), tone('triangle', 900, 1500, 0.1, 0.12, 0.02)); },
  charge() { noise(0.22, 0.1, 700, 0.8); tone('sawtooth', 150, 300, 0.22, 0.08); tone('square', 300, 520, 0.1, 0.05, 0.1); }, // a breath drawn and a weapon coming back, not a lion
  shieldScrape() { noise(0.26, 0.16, 1300, 0.7); noise(0.2, 0.08, 480, 0.6, 0.04); tone('sawtooth', 95, 70, 0.24, 0.05); }, // the knight's charge: iron feet and a shield rim dragged over the ground as he goes
  shieldSlam() { tone('sine', 120, 48, 0.2, 0.34); noise(0.1, 0.3, 360, 0.6); tone('triangle', 240, 130, 0.1, 0.14); tone('square', 1300, 820, 0.05, 0.12, 0.012); noise(0.06, 0.14, 3000, 1.1, 0.012); }, // oak driven into a body, and the iron rim ringing after it
  /* THE LAST CHARGE has its own three: the war cry as he braces (a shout rising out of the chest, the shield coming up under it),
     the rolling thunder of iron feet under the rush, and the great iron slam it ends in (the body of the blow, the rim ringing on
     after it, and the ground answering). None of them is the shield charge's: a bar spent should not sound like a shove. */
  lcCry() { noise(0.34, 0.2, 700, 0.9); tone('sawtooth', 150, 230, 0.3, 0.12); tone('square', 230, 300, 0.2, 0.06, 0.08); tone('sawtooth', 300, 170, 0.24, 0.08, 0.26); pad('sawtooth', 110, 150, 0.45, 0.06, 0.02, 900, 0.05); tone('square', 1300, 900, 0.05, 0.08, 0.2); },
  lcRoll() { noise(0.72, 0.24, 160, 0.5); noise(0.6, 0.12, 420, 0.7, 0.05); tone('sine', 58, 40, 0.7, 0.26); for (let i = 0; i < 6; i++) noise(0.05, 0.14, vary(260), 1.2, 0.04 + i * 0.1); },
  lcSlam() { file('slam', 0.5, 0.8); tone('sine', 90, 30, 0.5, 0.4); noise(0.3, 0.36, 300, 0.5); tone('square', 1100, 640, 0.08, 0.14, 0.02); tone('sine', 2200, 2150, 0.6, 0.06, 0.02); noise(0.5, 0.14, 120, 0.4, 0.08); },
  thud() { tone('sine', 110, 46, 0.18, 0.32); tone('triangle', 220, 120, 0.1, 0.12); noise(0.08, 0.18, 320, 0.6); }, // something wooden and heavy meeting the ground
  stone() { file('stone', 0.4); },
  roar() { file('roar', 0.6) || tone('sawtooth', 90, 220, 0.6, 0.3); },
  bossHurt() { file('bossHurt', 0.55) || tone('sawtooth', 300, 120, 0.25, 0.25); },
  buzz() { tone('sawtooth', 110, 130, 0.5, 0.12); tone('sawtooth', 220, 200, 0.5, 0.06); },
  ui() { file('ui', 0.35, 1, uiGain) || tone('square', 700, 700, 0.04, 0.1, 0, uiGain); },
  uiSel() { tone('square', 900, 1300, 0.08, 0.12, 0, uiGain); },
  text() { tone('square', 1500, 1500, 0.02, 0.04, 0, uiGain); },
  effort() { file('effort', 0.22, 1.35); },
  gasp() { file('gobHurt', 0.3, 1.5) || tone('sawtooth', 500, 200, 0.2, 0.1); },
  breathIn() { if (!gate('breathIn', 0.5)) return; tone('sine', 220, 520, 0.12, 0.07); noise(0.18, 0.05, 900, 1.2); for (let i = 0; i < 3; i++) tone('sine', 640 + i * 170, 980 + i * 210, 0.05, 0.035, 0.1 + i * 0.05); },   /* THE DEEP: a lungful taken back after a held breath - a gulp, and the bubbles off it */
  laugh() { file('laugh', 0.3, 1.4); },
  sting() { [659, 784, 988, 1319, 1568].forEach((f, i) => tone('triangle', f, f, 0.35, 0.16, i * 0.07)); },
  thunder() { noise(1.2, 0.5, 120, 0.4); tone('sine', 60, 30, 1.0, 0.35); },
  croak() { tone('sawtooth', 70, 110, 0.35, 0.28); tone('square', 140, 90, 0.3, 0.1, 0.05); },
  tongue() { noise(0.12, 0.25, 2500, 0.5); tone('sine', 900, 300, 0.15, 0.15); },
  leap() { tone('sine', 120, 400, 0.25, 0.2); noise(0.1, 0.15, 600); },
  budSpring() { noise(0.08, 0.24, 1700, 1.1); tone('sine', 150, 640, 0.2, 0.22); tone('triangle', 720, 1500, 0.12, 0.08, 0.05); noise(0.2, 0.1, 480, 0.6, 0.06); },   /* a wet pop out of the bud, the stalk going boing under you, and the water it slapped */
  bow() { tone('triangle', 700, 200, 0.12, 0.14); noise(0.08, 0.15, 3000); },
  bird() { tone('sine', 1800, 2600, 0.08, 0.06); tone('sine', 2400, 1900, 0.1, 0.05, 0.1); },
  splash() { noise(0.3, 0.4, 700, 0.5); tone('sine', 300, 120, 0.2, 0.15); },
  coinUp(k) { const r = 1 + Math.min(k, 12) * 0.06; tone('triangle', 1046 * r, 1046 * r, 0.07, 0.11); tone('triangle', 1568 * r, 1568 * r, 0.13, 0.085, 0.045); tone('sine', 3136 * r, 3136 * r, 0.05, 0.03); noise(0.03, 0.03, 4200, 2.5); },
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
  pSlash() { if (gate('heroShout', 1.1) && Math.random() < 0.3) heroVo('attack', 0.3); file('swing', 0.5, 0.7) || noise(0.16, 0.24, 900, 0.5); noise(0.18, 0.12, 380, 0.5, 0.02); tone('sine', vary(170), 60, 0.2, 0.09, 0.06); },
  pHurt() { heroVo('hurt', 0.55) || file('hurt', 0.6, 0.82) || (tone('sawtooth', 200, 55, 0.34, 0.25), noise(0.15, 0.2, 400)); plate(0.07); },
  pDie() { if (!heroVo('die', 0.7)) SFX.die(); for (let i = 0; i < 4; i++) { plate(0.05); tone('sine', 110 - i * 12, 50, 0.12, 0.12, 0.15 + i * 0.1); } bell(523, 1.6, 0.07, 0.55); },
  pDodge() { noise(0.12, 0.22, 320, 0.6); tone('sine', 95, 40, 0.16, 0.22); plate(0.05); },
  pPogo() { tone('square', vary(380), vary(760), 0.12, 0.13); bell(1046, 0.35, 0.05, 0.02); },
  pPlunge() { tone('square', vary(420), vary(160), 0.14, 0.07); plate(0.05); noise(0.18, 0.12, 420, 0.5, 0.02); bell(784, 0.3, 0.035, 0.04); },   /* plate going over, and the bell: the consecration goes down with him */
  // THE SHIELDLESS CHARGE: no shield to throw a shoulder in behind, so it is plate on plate, a maul-heavy grunt and
  // the same iron feet as the shield charge slower and lower - the biggest, slowest dash attack in the wood.
  pDashStrike() { noise(0.2, 0.2, 1200, 0.7); tone('square', vary(140), vary(70), 0.2, 0.14); plate(0.08); tone('triangle', vary(500), 800, 0.08, 0.05, 0.03); },
  pEffort() { heroVo('effort', 0.4) || file('effort', 0.22, 1.1); },
};
for (const k in PAL) { const base = SFX[k]; SFX[k] = (...a) => heroVoice === 'paladin' ? PAL[k](...a) : base(...a); }

// ---------- music: files, with the synth loop as a fallback for the theme ----------
function loadTrack(name) {
  if (!ac || !TRACKS[name] || trackBuf[name] || trackPending[name]) return;
  trackPending[name] = true;
  fetch(TRACKS[name]).then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status)).then(ab => ac.decodeAudioData(ab)).then(b => { trackBuf[name] = b; trackEnd[name] = audibleEnd(b); if (wantTrack === name) playFile(name); }).catch(() => {}).finally(() => { trackPending[name] = false; });
}
// A LOOP ENDS WHERE THE MUSIC DOES, NOT WHERE THE FILE DOES. Copies are played back to back, so a silent tail
// on a file is a hole in the music every time it comes round: the Hurricane's ran 1.77 s of nothing. A tail
// longer than half a second is cut at the last sample you can hear. A shorter one is left alone, because a
// loop cut to the bar (musMountain is 32.00 s to the millisecond) only keeps its beat if it keeps its last rest.
const trackEnd = {};
function audibleEnd(b) {
  const n = b.length; let last = 0;
  for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); let i = n - 1; while (i > last && Math.abs(d[i]) < 0.001) i--; last = Math.max(last, i); }
  return (n - 1 - last) / b.sampleRate > 0.5 ? (last + 1) / b.sampleRate : b.duration;
}
// THE SEAM. Copies butted end to start click wherever a file's last sample and its first do not meet (theme3
// jumped 0.38 of full scale, and five more tracks the same). So every copy fades out over its last LOOP_XF, the
// next starts that much early and fades in under it: an equal-power crossfade, one mechanism for every track.
// Each pass comes round 30 ms sooner than the file's length, which no ear can place.
export const LOOP_XF = 0.03;
const XF_IN = Float32Array.from({ length: 16 }, (_, i) => Math.sin(i / 15 * Math.PI / 2)), XF_OUT = XF_IN.slice().reverse();
export function loopCopy(ctx, b, len, dest, at, first) {
  const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = b; s.connect(g); g.connect(dest);
  if (!first) g.gain.setValueCurveAtTime(XF_IN, at, LOOP_XF);   // the first copy comes in on the track's own fade
  g.gain.setValueCurveAtTime(XF_OUT, at + len - LOOP_XF, LOOP_XF);
  s.start(at, 0, len); s.addEventListener('ended', () => { try { g.disconnect(); } catch {} });
  return s;
}
// the files were mastered all over the place: the cave loop sits 7 dB under the rest and theme3/4 3 dB over
const TRACK_GAIN = { stormharbor: 1.8, burial: 1.8, store: 1.8, hurricane: 1.25, drowned: 1.3, cave: 2.1, adventure: 1.7, theme3: 0.8, theme4: 0.75, reef: 1.5, longwater: 1.25, flotilla: 1.0 };
const trackVol = name => (name === 'boss' ? 0.5 : 0.45) * duckT * musicVol;
function playFile(name) {
  if (!ac || !trackBuf[name] || currentTrack === name) return;
  if (trackG && musicSrcs.length) { const og = trackG, olds = musicSrcs; og.gain.setTargetAtTime(0, ac.currentTime, 0.22); setTimeout(() => { for (const s of olds) { try { s.stop(); } catch {} } try { og.disconnect(); } catch {} }, 1000); if (musicTimer) clearTimeout(musicTimer); musicTimer = null; musicSrcs = []; musicGen++; } else stopMusic(); // the old track fades under the new one
  currentTrack = name;
  const tg = ac.createGain(); tg.gain.value = 0.001; tg.connect(musicGain); trackG = tg; tg.gain.setTargetAtTime(TRACK_GAIN[name] || 1, ac.currentTime + 0.02, 0.28);
  const gen = musicGen, b = trackBuf[name], len = trackEnd[name] || b.duration; let at = ac.currentTime + 0.03;
  const chain = first => {
    if (gen !== musicGen || currentTrack !== name) return;
    const s = loopCopy(ac, b, len, tg, at, first); musicSrcs.push(s); musicSrc = s;
    s.addEventListener('ended', () => { musicSrcs = musicSrcs.filter(q => q !== s); });
    const startAt = at; at += len - LOOP_XF;   // the next copy comes in under the last LOOP_XF of this one
    musicTimer = setTimeout(() => chain(false), Math.max(50, (startAt + len * 0.7 - ac.currentTime) * 1000)); // arm the next pass well before this one ends
  };
  chain(true);
  musicGain.gain.value = musicOn ? trackVol(name) : 0;
}
export const music = {
  play(name) { wantTrack = name; silenced = false; if (!ac) return;
    if (trackBuf[name]) { playFile(name); return; }
    // A TRACK WITH NO FILE IS PLAYED BY THE SYNTH - but the synth only runs while `currentTrack` is null,
    // and nothing was clearing it. So walking into UNDERLEAF left the PREVIOUS level's file playing and
    // the level had no theme of its own at all, which is exactly what it sounded like.
    if (!TRACKS[name]) { stopMusic(); currentTrack = null; nextT = ac.currentTime + 0.05; step = 0; return; }
    loadTrack(name); },
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
const N = { E2: 82.41, A1: 55, E5: 659.25, A5: 880, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, C2: 65.41, G2: 98, A2: 110, F2: 87.31 };
const LEAD = [['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'D4', 'E4'], ['G3', 'B3', 'D4', 'G4', 'D4', 'B3', 'A3', 'B3'], ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'B3', 'C4'], ['F3', 'A3', 'C4', 'F4', 'C4', 'A3', 'G3', 'A3']];
const BASS = ['C2', 'G2', 'A2', 'F2'];
// UNDERLEAF HAS NO FILE, AND DOES NOT WANT ONE. It is the quietest level in the game, so it gets the
// quietest music there is: one low drone, a handful of plucked notes with more rest than note between them,
// and a bell a long way off that never resolves. Nothing here builds, because nothing here is allowed to.
const HUSH_LEAD = [['A3', null, 'C4', null, 'E4', null, null, 'D4'], [null, 'A3', null, null, 'G3', null, 'E3', null],
  ['F3', null, 'A3', null, 'C4', null, null, 'B3'], [null, 'E3', null, null, 'A3', null, null, null]];
const HUSH_BASS = ['A2', 'F2', 'C3', 'E2'];
// THE UNDERCROWN. Slower than the hush and an octave under it: a drone that does not move, a figure that
// takes four bars to say anything, and the ring of a pick on rock somewhere below you that never answers.
const MINE_LEAD = [[null, null, 'D3', null, null, null, 'F3', null], [null, null, null, 'C3', null, null, null, null],
  [null, 'A2', null, null, 'D3', null, null, null], [null, null, null, null, 'A2', null, null, null]];
const MINE_BASS = ['D2', 'D2', 'A1', 'D2'];
// THE DEEP. Two notes a bar and neither of them resolves, over a drone that is barely a note at all, and
// a long way off something that might be a hull settling. Nothing down here is in a hurry.
// WAYMEET. A tune somebody is playing badly in a common room: a three-beat lilt, a fiddle line that
// keeps going where you expect it to stop, and a drone under it like a room full of people talking.
const WAY_LEAD = [['D4', null, 'F4', null, 'A4', null, 'G4', null], ['F4', null, 'A4', null, 'D5', null, 'C5', null],
  ['A4', null, 'G4', null, 'F4', null, 'E4', null], ['D4', null, 'F4', null, 'E4', null, 'D4', null]];
const WAY_BASS = ['D3', 'F3', 'A2', 'D3'];
const DEEP_LEAD = [[null, null, null, 'E3', null, null, null, null], [null, null, 'C3', null, null, null, null, null],
  [null, null, null, null, 'B2', null, null, null], [null, 'E3', null, null, null, null, null, null]];
const DEEP_BASS = ['E2', 'C2', 'E2', 'A1'];
let step = 0, nextT = 0, timer = null;
const STEP = 60 / 112 / 2, STEP_HUSH = 60 / 62 / 2, STEP_MINE = 60 / 48 / 2, STEP_DEEP = 60 / 40 / 2, STEP_TOWN = 60 / 96 / 2;
function schedule() {
  if (!ac) return;
  if (currentTrack || silenced) { nextT = ac.currentTime; return; }
  const hush = wantTrack === 'underleaf', mine = wantTrack === 'mineworks', deep = wantTrack === 'deep', town = wantTrack === 'waymeet', SL = town ? STEP_TOWN : deep ? STEP_DEEP : mine ? STEP_MINE : hush ? STEP_HUSH : STEP;
  while (nextT < ac.currentTime + 0.25) {
    const bar = Math.floor(step / 8) % 4, i = step % 8;
    if (musicOn) {
      const delay = nextT - ac.currentTime;
      if (town) {
        const nm = WAY_LEAD[bar][i];
        if (nm) tone('triangle', N[nm], N[nm], SL * 1.5, 0.11, delay, musicGain);
        if (i === 0 || i === 3) { const b = N[WAY_BASS[bar]]; tone('sine', b, b, SL * 2.6, 0.2, delay, musicGain); }
        if (i === 2 || i === 6) tone('square', N[WAY_BASS[bar]] * 2, N[WAY_BASS[bar]] * 2, SL * 0.7, 0.05, delay, musicGain);  /* somebody keeping time on a table */
        if (bar === 3 && i === 7) tone('triangle', 196, 220, SL * 2, 0.07, delay, musicGain);
      } else if (deep) {
        const nm = DEEP_LEAD[bar][i];
        if (nm) tone('sine', N[nm], N[nm] * 0.995, SL * 3.4, 0.13, delay, musicGain);
        if (i === 0) { const b = N[DEEP_BASS[bar]]; tone('sine', b, b * 0.99, SL * 8.8, 0.36, delay, musicGain); }
        if (bar === 3 && i === 4) { tone('triangle', 70, 52, 1.6, 0.09, delay, musicGain); }   /* a hull settling, a long way off */
        if (bar === 1 && i === 6) { tone('sine', 44, 40, 2.4, 0.11, delay, musicGain); }       /* and the pressure */
      } else if (mine) {
        const nm = MINE_LEAD[bar][i];
        if (nm) tone('triangle', N[nm], N[nm], SL * 2.2, 0.15, delay, musicGain);
        if (i === 0) { const b = N[MINE_BASS[bar]]; tone('sine', b, b, SL * 8.6, 0.34, delay, musicGain); }
        if (i === 4 && bar % 2 === 1) { const b2 = N[MINE_BASS[bar]] * 1.5; tone('sine', b2, b2, SL * 4, 0.1, delay, musicGain); }
        if (bar === 2 && i === 6) { tone('square', N.E5, N.E5 * 0.4, 0.09, 0.035, delay, musicGain); }   /* a pick on rock, a long way down */
        if (bar === 0 && i === 2) { tone('square', N.E5, N.E5 * 0.4, 0.08, 0.028, delay, musicGain); }
      } else if (hush) {
        const nm = HUSH_LEAD[bar][i];
        if (nm) tone('triangle', N[nm], N[nm], SL * 1.7, 0.19, delay, musicGain);
        if (i === 0) { const b = N[HUSH_BASS[bar]]; tone('sine', b, b, SL * 8.4, 0.30, delay, musicGain); }
        if (i === 3 && bar % 2 === 0) { const b2 = N[HUSH_BASS[bar]] * 2; tone('sine', b2, b2, SL * 4, 0.08, delay, musicGain); }
        if (bar === 3 && i === 5) tone('sine', N.A5, N.A5 * 0.998, 2.6, 0.055, delay, musicGain);   /* the bell, somewhere else */
      } else {
        const f = N[LEAD[bar][i]];
        tone('triangle', f, f, SL * 0.9, i === 0 ? 0.5 : 0.32, delay, musicGain);
        if (i === 0) tone('sine', N[BASS[bar]], N[BASS[bar]], SL * 7, 0.55, delay, musicGain);
        if (i === 4) tone('sine', N[BASS[bar]] * 1.5, N[BASS[bar]] * 1.5, SL * 3, 0.3, delay, musicGain);
      }
    }
    nextT += SL; step++;
  }
}
function startSynth() { nextT = ac.currentTime + 0.1; step = 0; if (timer) clearInterval(timer); timer = setInterval(schedule, 100); }

// ---------- ambient beds: forest birds (file), running water, hive drone, rain (synth) ----------
function stopAmb() { for (const n of ambNodes) { try { n.stop(); } catch {} } ambNodes = []; if (ambShotTimer) { clearInterval(ambShotTimer); ambShotTimer = null; } }
// EVERY PLACE HAS ITS OWN AIR. The wood had a recording and everything else was filtered noise - and a level
// with no zone got the wood's birds, so the town, the ships and the mine all had birdsong in them.
const AMB_FILE = { forest: 'ambForest', wind: 'ambWind', town: 'ambTown', shore: 'ambShore', ship: 'ambShip', cave: 'ambCave', deep: 'ambDeep', drip: 'ambDrip', tavern: 'ambTown', hold: 'ambShip', hall: 'ambCave' };
/* INDOORS IS THE SAME AIR THROUGH A WALL: the town behind the inn's shutters, the sea through a hull, the wood through a trunk */
const AMB_LP = { tavern: 1300, hold: 600, hall: 800 };
// AND THE THINGS THAT HAPPEN IN IT: a gull over the shore, the timbers of a ship working, a hammer two streets
// away and somebody calling, a drip in the dark. [pool, volume, lowpass, one in how many seconds]
const AMB_SHOTS = { shore: [['amb_gull', 0.22, 0, 5]], ship: [['amb_creak', 0.3, 1800, 3], ['amb_gull', 0.14, 0, 9]],
  town: [['amb_hammer', 0.12, 1200, 4], ['vo_hum_alert', 0.05, 900, 11]], cave: [['drip', 0, 0, 3]], drip: [['drip', 0, 0, 2]],
  tavern: [['vo_hum_alert', 0.08, 1600, 5], ['sfx:fuse', 0, 0, 3]], hold: [['amb_creak', 0.4, 1200, 2]], hall: [['drip', 0, 0, 4]] };
let ambShotTimer = null;
function ambShots(kind) {
  if (ambShotTimer) clearInterval(ambShotTimer); ambShotTimer = null; const list = AMB_SHOTS[kind]; if (!list) return;
  ambShotTimer = setInterval(() => { if (ambKind !== kind || !ac) return;
    for (const [name, v, lp, every] of list) { if (Math.random() > 1 / every) continue;
      if (name === 'drip') { SFX.drip(); continue; }
      if (name.startsWith('sfx:')) { const f = SFX[name.slice(4)]; if (f) f(); continue; }
      const opts = (clips[name] || []).filter(Boolean); if (!opts.length) continue;
      const s = ac.createBufferSource(); s.buffer = opts[takeOf(name, opts.length)]; s.playbackRate.value = 0.9 + Math.random() * 0.2;
      const gn = ac.createGain(); gn.gain.value = v * ambVol; let tail = s;
      if (lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; s.connect(f); tail = f; }
      tail.connect(gn);
      if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = Math.random() * 1.6 - 0.8; gn.connect(p); p.connect(sfxGain); } else gn.connect(sfxGain);
      s.start(); } }, 1000);
}
export const ambient = {
  set(kind) {
    if (!ac || kind === ambKind) return;
    ambKind = kind; stopAmb();
    if (!kind) { ambGain.gain.setTargetAtTime(0, ac.currentTime, 0.5); return; }
    const start = () => ambGain.gain.setTargetAtTime(ambTarget(kind), ac.currentTime, 0.8);
    const FILE = AMB_FILE[kind];
    if (FILE) {
      const go = () => { if (ambKind !== kind) return; const s = ac.createBufferSource(); s.buffer = trackBuf[FILE]; s.loop = true;
        if (AMB_LP[kind]) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = AMB_LP[kind]; s.connect(f); f.connect(ambGain); } else s.connect(ambGain);
        s.start(); ambNodes.push(s); start(); ambShots(kind); };
      if (trackBuf[FILE]) go(); else { trackPending[FILE] || fetch(TRACKS[FILE]).then(r => r.arrayBuffer()).then(ab => ac.decodeAudioData(ab)).then(b => { trackBuf[FILE] = b; go(); }).catch(() => {}); }
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
  bellow() { file('roar', 0.6, 0.62) || tone('sawtooth', 110, 60, 0.4, 0.3); tone('sawtooth', 70, 44, 0.5, 0.2, 0.04); noise(0.3, 0.3, 220, 0.6); }, // a ram: lower, and it carries
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
  rockLaugh() { file('laugh', 0.3, 1.45) || (tone('square', 320, 260, 0.08, 0.1), tone('square', 360, 300, 0.08, 0.1, 0.1), tone('square', 400, 330, 0.1, 0.1, 0.2)); },
  golemChime() { [1046, 1318, 1568].forEach((f, i) => tone('sine', f, f * 0.98, 0.5, 0.12, i * 0.06)); noise(0.08, 0.08, 5000, 1.2); },
  golemStomp() { tone('sine', 70, 35, 0.3, 0.4); noise(0.2, 0.35, 260, 0.6); tone('sine', 2093, 1568, 0.25, 0.08, 0.08); },
  golemShatter() { noise(0.4, 0.45, 3200, 0.7); [2093, 1760, 1396, 1046, 784].forEach((f, i) => tone('sine', f, f * 0.7, 0.35, 0.12, i * 0.05)); tone('sawtooth', 120, 40, 0.5, 0.2); },
  golemThrow() { noise(0.12, 0.2, 1800, 0.8); tone('sine', 1400, 2200, 0.1, 0.08); },
  kiteChatter() { for (let i = 0; i < 3; i++) tone('square', 900 + i * 120, 1300, 0.04, 0.06, i * 0.05); noise(0.05, 0.08, 2400, 1.2, 0.15); },
  hornDraw() { tone('sawtooth', 96, 150, 1.9, 0.05); tone('square', 48, 75, 1.9, 0.025); },   /* THE STOCKADE'S HORN, drawn breath: a note that climbs the whole time he is putting it to his mouth */
  badgerHuff() { noise(0.12, 0.22, 500, 0.6); tone('sawtooth', 160, 110, 0.12, 0.08); noise(0.08, 0.16, 1600, 0.5, 0.12); noise(0.08, 0.16, 1600, 0.5, 0.26); },   /* a snort, and its claws raking the ground twice */
  badgerCharge() { tone('sawtooth', 120, 70, 0.18, 0.12); noise(0.3, 0.18, 400, 0.6, 0.02); },
  badgerSkid() { noise(0.28, 0.2, 1100, 0.4); tone('square', 300, 180, 0.08, 0.05, 0.05); },
  garRise() { for (let i = 0; i < 4; i++) tone('sine', 500 + i * 180, 900 + i * 180, 0.05, 0.05, i * 0.09); noise(0.2, 0.08, 2200, 0.5); },   /* bubbles coming up */
  garFlop() { noise(0.06, 0.2, 900, 0.5); tone('sine', 220, 120, 0.06, 0.08); },
  hareSqueak() { tone('sine', 1800, 2600, 0.06, 0.08); tone('sine', 2400, 1900, 0.07, 0.06, 0.07); },
  wightMoan() { tone('sawtooth', 90, 70, 0.9, 0.12); tone('sine', 140, 95, 0.9, 0.1, 0.05); noise(0.9, 0.08, 600, 0.3); },
  callerChant() { tone('sawtooth', 220, 262, 0.35, 0.12); tone('sawtooth', 330, 392, 0.35, 0.08, 0.3); noise(0.7, 0.14, 500, 0.4); tone('sine', 880, 1320, 0.5, 0.05, 0.1); },
  callerBlast() { noise(0.6, 0.5, 300, 0.4); tone('sawtooth', 160, 40, 0.5, 0.25); tone('sine', 1200, 300, 0.4, 0.1); },
  forgeHammer() { file('slam', 0.6, 0.8) || tone('sine', 90, 40, 0.25, 0.4); tone('square', 1900, 1200, 0.08, 0.12, 0.02); noise(0.12, 0.3, 3000, 1.1, 0.02); },
  forgeSteam() { noise(0.5, 0.28, 2200, 0.5); noise(0.3, 0.18, 900, 0.5, 0.1); },
  forgeChain() { for (let i = 0; i < 5; i++) { noise(0.04, 0.16, 2600, 1.2, i * 0.07); tone('square', 700 - i * 40, 500, 0.04, 0.06, i * 0.07); } },
  kingLaugh() { file('laugh', 0.5, 0.62) || (tone('sawtooth', 150, 130, 0.12, 0.2), tone('sawtooth', 170, 140, 0.12, 0.2, 0.14), tone('sawtooth', 190, 150, 0.16, 0.2, 0.28)); },
  chiefBark() { file('roar', 0.4, 1.55) || tone('sawtooth', 300, 140, 0.18, 0.22); tone('square', 420, 200, 0.1, 0.12, 0.02); noise(0.1, 0.18, 1200, 0.7); }, // a bark: short, high, clipped
  owlHoot() { tone('sine', 520, 440, 0.18, 0.16); tone('sine', 480, 400, 0.22, 0.14, 0.2); },
  frogBoom() { tone('sawtooth', 60, 90, 0.5, 0.3); tone('square', 120, 80, 0.4, 0.12, 0.05); noise(0.2, 0.12, 300, 0.6); },
  queenShriek() { tone('sawtooth', 900, 1600, 0.3, 0.14); tone('sawtooth', 1200, 700, 0.3, 0.1, 0.1); noise(0.2, 0.1, 3000, 0.8); },
});
// ---------- the paladin's light ----------
Object.assign(SFX, {
  mend() { [523, 659, 784].forEach((f, i) => pad('triangle', f, f * 1.01, 0.7, 0.07, i * 0.07, 3000, 0.08)); bell(1568, 0.8, 0.05, 0.2); noise(0.5, 0.05, 6000, 1.2, 0.1); },
  judgement() { noise(1.0, 0.45, 140, 0.4); tone('sine', 62, 28, 1.0, 0.4); tone('sawtooth', 110, 50, 0.6, 0.14); [784, 1175, 1568].forEach((f, i) => bell(f, 1.3, 0.09, 0.05 + i * 0.03)); },
  lightFull() { bell(1046, 0.9, 0.08); bell(1568, 0.7, 0.05, 0.08); },
  aegis() { bell(880, 0.6, 0.09); bell(1320, 0.45, 0.05, 0.01); tone('sine', 440, 520, 0.12, 0.06); }, // light, not metal
  hammerfall() { SFX.heavy(); tone('sine', 58, 26, 0.5, 0.35); bell(392, 0.9, 0.08, 0.05); },
  // ---- a portcullis: it rattles down its slot and lands, or it grinds up on its chain ----
  gateDrop() { for (let i = 0; i < 5; i++) { noise(0.035, 0.16, 2400, 1.2, i * 0.045); tone('square', 620 - i * 30, 420, 0.03, 0.05, i * 0.045); } },
  gateLand() { tone('sine', 70, 30, 0.5, 0.4); tone('square', 180, 90, 0.16, 0.16); noise(0.35, 0.3, 240, 0.6); bell(140, 0.7, 0.05, 0.02); }, // iron, and a lot of it
  gateLift() { for (let i = 0; i < 9; i++) { tone('square', 300 + (i % 2) * 60, 260, 0.03, 0.05, i * 0.075); noise(0.03, 0.1, 1800, 1.3, i * 0.075); } tone('sine', 70, 90, 0.7, 0.08); },
  // ---- the moor and the town ----
  caw() { if (!gate('caw', 0.35)) return; tone('sawtooth', vary(820), 560, 0.16, 0.1); noise(0.14, 0.12, 1500, 1); tone('sawtooth', vary(760), 520, 0.14, 0.08, 0.2); noise(0.12, 0.1, 1400, 1, 0.2); },
  hornBlast() { pad('sawtooth', 146, 164, 1.35, 0.15, 0, 900, 0.12); pad('sawtooth', 147.5, 166, 1.35, 0.1, 0.01, 700, 0.12); pad('square', 73, 82, 1.3, 0.05, 0, 400, 0.15); noise(0.5, 0.08, 700, 0.5); },
  baleBump() { if (!gate('bale', 0.12)) return; noise(0.08, 0.1, 520, 0.6); tone('sine', 110, 60, 0.07, 0.06); },
  baleBurst() { for (let i = 0; i < 6; i++) noise(0.05, 0.18, 2600 + (i % 3) * 700, 0.9, i * 0.03); tone('sine', 140, 60, 0.12, 0.14); noise(0.4, 0.08, 1800, 0.4, 0.1); },
  sweepPop() { tone('square', 170, 110, 0.08, 0.1); noise(0.28, 0.16, 650, 0.5); [720, 800, 660].forEach((f, i) => tone('square', f, f * 0.9, 0.05, 0.05, 0.12 + i * 0.07)); },
  sweepHide() { noise(0.3, 0.12, 1100, 0.5); tone('sine', 300, 120, 0.25, 0.05); },
  boom() { noise(1.1, 0.34, 140, 0.4); noise(0.5, 0.2, 700, 0.5, 0.01); tone('sine', 90, 28, 0.9, 0.22); tone('square', 60, 30, 0.3, 0.08, 0.02); }, // a gun, and a keg
  bowShot() { tone('square', 900, 500, 0.05, 0.1); noise(0.09, 0.16, 2600, 0.7); tone('sine', 320, 200, 0.08, 0.06, 0.01); },
  grapple() { noise(0.12, 0.14, 900, 0.6); tone('triangle', 420, 260, 0.1, 0.08); },
  ropeHaul() { noise(0.5, 0.09, 500, 0.9); tone('sawtooth', 120, 90, 0.45, 0.05); },
  whistleCall() { tone('sine', 2100, 2600, 0.16, 0.09); tone('sine', 2600, 2200, 0.2, 0.08, 0.15); tone('sine', 2400, 3000, 0.14, 0.07, 0.34); },
  fuse() { noise(0.5, 0.07, 4200, 0.5); noise(0.4, 0.05, 6000, 0.4, 0.12); },
  crumble() { noise(0.4, 0.16, 420, 0.5); noise(0.3, 0.1, 900, 0.6, 0.06); tone('square', 150, 70, 0.2, 0.07); },
  gateOpen() { noise(0.5, 0.12, 300, 0.7); tone('sawtooth', 90, 130, 0.5, 0.08); },
  mawRoar() { noise(0.9, 0.2, 260, 0.4); tone('sawtooth', 90, 46, 0.7, 0.16); tone('square', 60, 40, 0.5, 0.1, 0.05); }, // the moray coming out of its hole
  mawSnap() { file('crack', 0.6) || (noise(0.12, 0.34, 1400, 0.5), tone('square', 220, 70, 0.1, 0.14)); },
  seaBell() { bell(196, 2.4, 0.12); bell(98, 3.0, 0.07, 0.02); }, // Saltreach's bell, as the tide turns
  boreRoar() { noise(1.6, 0.14, 180, 0.3); noise(1.2, 0.08, 700, 0.5, 0.2); tone('sine', 55, 40, 1.4, 0.12); },
  waveCrash() { noise(0.7, 0.16, 900, 0.4); noise(0.5, 0.1, 2400, 0.6, 0.08); },
  sirenSong() { pad('sine', 660, 740, 1.2, 0.05, 0, 3000); pad('triangle', 990, 880, 1.2, 0.03, 0.1, 4000); },
  gust() { noise(0.9, 0.09, 420, 0.4); noise(0.6, 0.05, 900, 0.6); }, // a gale coming down the bridge
  stormChant() { pad('sawtooth', 330, 392, 0.4, 0.06, 0, 1400); pad('sine', 990, 1320, 0.4, 0.04, 0.05, 3000); noise(0.4, 0.06, 600, 0.5); },
  stormZap() { noise(0.12, 0.22, 3200, 0.8); tone('square', 1800, 300, 0.15, 0.07); tone('sine', 700, 200, 0.22, 0.09); },
  /* THE SEA WITCH's call: not the shaman's rattle and chant. A held note over the hiss of a sea running, and her lantern ringing on its crook */
  witchCall() { pad('sine', 262, 330, 0.5, 0.06, 0, 1200); pad('sine', 784, 1046, 0.45, 0.035, 0.06, 3000); noise(0.35, 0.05, 420, 0.5); bell(1568, 0.3, 0.03, 0.12); },
  /* THE GOBLIN PRIEST's rite: a goblin's idea of plainchant (two nasal notes a fourth apart, droned through its nose), the censer's
     chain swinging, and the little bell it took off the altar rung three times. Its blessing lands as the bell and a warm swell;
     its rite breaking is the bell dropped and the pot spilling on the flags */
  priestRite() { pad('sawtooth', 247, 247, 1.3, 0.05, 0, 900); pad('sawtooth', 330, 330, 1.1, 0.035, 0.25, 900); for (let i = 0; i < 3; i++) { bell(2093, 0.25, 0.03, 0.1 + i * 0.45); noise(0.05, 0.05, 4200, 2, 0.3 + i * 0.45); } },
  priestBless() { bell(1568, 0.7, 0.06); bell(2093, 0.6, 0.04, 0.06); pad('sine', 392, 523, 0.6, 0.05, 0, 2200); },
  priestBreak() { tone('sine', 2093, 1500, 0.2, 0.06); SFX.clatter(); noise(0.3, 0.12, 700, 0.5, 0.05); },
  /* THE GOBLIN MAGE reads out of a book it cannot read: pages riffled and a goblin's shout pitched up into something it thinks
     is a word. The bolt leaves the page with a papery crack; the rune is written low (a scratch along the flags and a
     sawtooth growl rising under it) and goes off with a thump and a shriek of torn paper */
  mageBoltTell() { for (let i = 0; i < 4; i++) noise(0.03, 0.08, 5200, 1.6, i * 0.035); tone('square', 520, 880, 0.18, 0.06, 0.12); },
  mageBolt() { noise(0.06, 0.18, 3600, 1.2); tone('triangle', 1400, 500, 0.2, 0.08); tone('sine', 660, 330, 0.25, 0.06, 0.03); },
  mageRuneTell() { for (let i = 0; i < 6; i++) noise(0.05, 0.06, 1800 + i * 300, 2, i * 0.08); pad('sawtooth', 110, 220, 0.9, 0.06, 0.05, 700); tone('square', 400, 700, 0.25, 0.05, 0.1); },
  mageRune() { tone('sine', 160, 50, 0.35, 0.22); noise(0.25, 0.22, 700, 0.6); noise(0.2, 0.12, 4200, 1.4, 0.03); },
  shardBristle() { if (!gate('bristle', 0.3)) return; [1568, 2093, 2637].forEach((f, i) => bell(f, 0.3, 0.035, i * 0.04)); noise(0.1, 0.05, 5200, 1.2); },
  // ---- the telegraph: every enemy that winds up says so, a glint for the small ones, a low bell for the big ----
  tell(big) { if (!gate(big ? 'tellB' : 'tell', 0.12)) return; if (big) { tone('triangle', 523, 1046, 0.12, 0.08); bell(1568, 0.3, 0.04, 0.02); } else { tone('triangle', 1318, 1760, 0.07, 0.05); tone('sine', 2637, 2637, 0.1, 0.025, 0.02); } },
});
// ---------- personality: every goblin has a voice of its own pitch, and the beasts their own calls ----------
const GOB_V = { sprig: 1.25, thief: 1.2, sapper: 1.35, archer: 1.15, pike: 0.95, shield: 0.85, brute: 0.65, hearthgob: 0.75, miner: 0.9, sentry: 1.05, sweep: 1.3, thorn: 0.8, rockgoblin: 0.8, snuffer: 0.9, cutter: 1.0, horn: 0.9, shaman: 1.1, stormshaman: 1.1, master: 0.72, sailer: 1.1, kite: 1.3, masthead: 0.7, gobpriest: 1.05, gobmage: 1.15 };
Object.assign(SFX, {
  // it has seen you: a goblin's startled "hup!", a beast's own cry
  foeNotice(t) { if (!gate('notice', 0.3)) return; { const c = CAST[t]; if (c && (c.human || c.alert) && voice(c.alert || VOK(c.kit, 'alert'), 0.34, c.rate, c.lp || 0)) return; } const r = GOB_V[t];
    if (r) { file('gobHurt', 0.3, r * 1.2) || tone('square', 500 * r, 800 * r, 0.08, 0.08); tone('square', 700 * r, 1150 * r, 0.06, 0.04, 0.03); return; }
    const B = { hound: SFX.bark, greathound: SFX.bark, goat: SFX.bleat, harpy: SFX.screech, spider: SFX.hiss, bat: SFX.chitter, wasp: SFX.buzz, hopper: SFX.ribbit, sporeling: SFX.squelch, wight: SFX.wightMoan, hare: SFX.hareSqueak, badger: SFX.badgerHuff, gar: SFX.garRise, crow: SFX.caw, troll: SFX.bellow, grub: SFX.squelch, shardling: SFX.shardBristle, fledgling: SFX.caw, lurker: SFX.squelch }[t]; if (B) B(); },
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
  flaskClink() { tone('sine', 2400, 2350, 0.12, 0.08); tone('sine', 3100, 3000, 0.1, 0.06, 0.07); noise(0.05, 0.08, 3600, 1.2, 0.02); },   /* THE HOMUNCULUS takes a flask off the shelf: two bottles knock */
  flaskBreak() { noise(0.18, 0.35, 4200, 0.8); [3136, 2637, 2093].forEach((f, i) => tone('triangle', f, f * 0.8, 0.12, 0.07, i * 0.03)); noise(0.5, 0.12, 1800, 1.4, 0.12); tone('sine', 300, 120, 0.3, 0.06, 0.1); },   /* and it breaks: glass, then the acid fizzing */
  rattle(v = 1) { noise(0.05, 0.16 * v, 1400, 0.9); tone('square', 180 + Math.random() * 60, 120, 0.05, 0.05 * v, 0.01); },
  rumble() { tone('sine', 60, 30, 0.7, 0.3); noise(0.6, 0.3, 180, 0.5); tone('sawtooth', 48, 34, 0.5, 0.1, 0.1); },
  heartbeatUI() { tone('sine', 80, 50, 0.12, 0.25); tone('sine', 70, 40, 0.14, 0.2, 0.16); },
  // THE BOO. A small, close, breathy whimper while it drifts (not the wight's long moan - this one is shy, not
  // hungry); and a short muffled catch of breath the instant it covers its eyes and stops.
  booDrift() { tone('sine', 260, 205, 0.45, 0.06); tone('sine', 264, 210, 0.45, 0.04, 0.05); noise(0.35, 0.045, 1300, 0.4); },
  booFreeze() { noise(0.07, 0.12, 2400, 0.6); tone('sine', 480, 200, 0.1, 0.08); },
});
export const debugAudio = () => ({ ac, musicGain, sfxGain, ambGain, musicSrc, currentTrack, wantTrack, ambKind, trackEnd, trackBuf });
// ---------- every creature dies in its own voice, and is hurt in its own voice ----------
const gob = (rate, v = 0.5) => (rate < 0.8 && voice('vo_gobbig_die', v, rate * 1.3)) || file('gobDie', v, rate);     /* a brute is not a sprig slowed down */
const gobH = (rate, v = 0.4) => (rate < 0.8 && voice('vo_gobbig_hurt', v, rate * 1.3)) || file('gobHurt', v, rate);
const DIE = {
  /* THE MAGE'S FOLLY: a hedge falling to bits, a suit coming apart, a bucket over, a chest breaking, a jar's worth of squeal, glass, and the tower's two */
  topiary() { noise(0.3, 0.24, 1600, 0.4); noise(0.2, 0.16, 700, 0.5, 0.1); tone('square', 200, 90, 0.16, 0.06, 0.05); },
  armour() { file('clang', 0.3, 0.55) || tone('sine', 500, 300, 0.2, 0.14); for (let i = 0; i < 4; i++) { tone('square', 1400 - i * 200, 900 - i * 150, 0.14, 0.08, 0.15 + i * 0.12); noise(0.06, 0.2, 2000, 0.5, 0.15 + i * 0.12); } },
  piece() { file('clang', 0.12, 1.4) || tone('sine', 1600, 900, 0.1, 0.06); noise(0.06, 0.1, 2400, 0.5, 0.04); },
  broom() { noise(0.14, 0.22, 800, 0.5); tone('square', 260, 120, 0.16, 0.08); noise(0.24, 0.18, 350, 0.4, 0.1); },
  mimic() { tone('sawtooth', 140, 60, 0.3, 0.14); noise(0.2, 0.26, 600, 0.5, 0.05); for (let i = 0; i < 3; i++) noise(0.05, 0.16, 1500, 0.5, 0.2 + i * 0.1); },
  imp() { tone('sawtooth', 1300, 400, 0.22, 0.1); noise(0.12, 0.14, 2200, 0.5, 0.06); noise(0.3, 0.12, 500, 0.3, 0.14); },
  turret() { tone('triangle', 2200, 600, 0.3, 0.1); noise(0.2, 0.2, 3000, 0.5); for (let i = 0; i < 5; i++) tone('triangle', 3000 - i * 300, 2500 - i * 300, 0.1, 0.05, 0.1 + i * 0.06); },
  homunculus() { tone('sine', 700, 200, 0.5, 0.12); tone('triangle', 1600, 300, 0.4, 0.05, 0.05); noise(0.3, 0.16, 2400, 0.4, 0.3); },
  archmage() { tone('sine', 300, 90, 0.9, 0.16); noise(0.5, 0.2, 800, 0.5, 0.05); for (let i = 0; i < 6; i++) tone('triangle', 2600 - i * 300, 2200 - i * 300, 0.2, 0.06, 0.3 + i * 0.12); tone('sine', 70, 40, 1, 0.12, 0.6); },
  // UNDERLEAF. Everything here dies the way it lived: the assassin without a sound worth the name, the
  // berserker taking the whole street with him, and the old woman's stick going over on the cobbles.
  assassin() { noise(0.1, 0.16, 3200, 0.7); tone('sine', 420, 180, 0.14, 0.05); noise(0.18, 0.1, 900, 0.4, 0.06); tone('triangle', 900, 700, 0.06, 0.05, 0.16); },
  swornsword() { tone('square', 190, 80, 0.26, 0.15); noise(0.2, 0.18, 700, 0.45, 0.05); SFX.clank && SFX.clank(); },
  lancer() { tone('square', 180, 70, 0.3, 0.14); noise(0.24, 0.2, 650, 0.5, 0.05); tone('sawtooth', 520, 300, 0.35, 0.06, 0.12); /* the man, and the horse going on without him */ },
  hedgeknight() { tone('square', 150, 60, 0.36, 0.18); noise(0.3, 0.26, 500, 0.55, 0.06); },
  runner() { tone('square', 330, 180, 0.2, 0.12); noise(0.12, 0.14, 900, 0.35, 0.05); },
  crossbow() { tone('square', 230, 110, 0.22, 0.13); noise(0.16, 0.16, 800, 0.4, 0.04); },
  closedhelm() { tone('sine', 110, 44, 0.9, 0.26, 0.02); noise(0.5, 0.44, 300, 0.6, 0.05); for (let i = 0; i < 3; i++) tone('square', 420 - i * 80, 180, 0.2, 0.08, 0.26 + i * 0.15); tone('sine', 60, 40, 1.2, 0.14, 0.45); },
  prise() { noise(0.3, 0.24, 1400, 0.55); tone('square', 300, 120, 0.2, 0.1, 0.02); noise(0.16, 0.14, 500, 0.4, 0.14); },
  holdfast() { noise(0.36, 0.3, 500, 0.5); tone('sine', 180, 60, 0.4, 0.14, 0.03); },
  drownedking() { tone('sine', 90, 36, 1.1, 0.3, 0.02); noise(0.6, 0.5, 240, 0.7, 0.06); SFX.heavy(); for (let i = 0; i < 3; i++) tone('triangle', 500 - i * 90, 200, 0.22, 0.07, 0.3 + i * 0.16); tone('sine', 50, 34, 1.4, 0.16, 0.5); },
  propman() { tone('square', 210, 90, 0.28, 0.16); noise(0.3, 0.2, 260, 0.5, 0.03); tone('sine', 110, 60, 0.3, 0.1, 0.1); },
  clinger() { noise(0.34, 0.3, 900, 0.6); tone('sine', 320, 90, 0.3, 0.12, 0.02); noise(0.2, 0.16, 260, 0.5, 0.16); },
  prince() { tone('sawtooth', 120, 38, 1.1, 0.2); noise(0.9, 0.3, 180, 0.9, 0.1); SFX.stone(); tone('triangle', 520, 90, 0.9, 0.06, 0.15); for (let i = 0; i < 3; i++) noise(0.12, 0.14, 1200 - i * 250, 0.5, 0.5 + i * 0.16); tone('sine', 60, 28, 1.2, 0.14, 0.4); },   /* a long dry breath going out of him, and the dirt settling */
  berserker() { tone('sawtooth', 190, 60, 0.55, 0.2); noise(0.4, 0.34, 300, 0.7, 0.04); SFX.heavy(); tone('sine', 80, 38, 0.7, 0.14, 0.12); for (let i = 0; i < 2; i++) { tone('triangle', 1400 - i * 260, 500, 0.1, 0.07, 0.24 + i * 0.11); noise(0.12, 0.12, 2200, 0.5, 0.26 + i * 0.11); } },
  grandmother() { tone('sine', 300, 140, 0.5, 0.12); noise(0.22, 0.14, 700, 0.5, 0.05);
    for (let i = 0; i < 4; i++) tone('triangle', 760 - i * 70, 520 - i * 60, 0.09, 0.06, 0.22 + i * 0.1);   /* the stick going over, end over end */
    tone('sine', 90, 44, 0.9, 0.1, 0.3); },
  // THE LAMPLIT STREET: nobody down here dies loudly. A constable goes down in his iron; the Lampreeve's pole
  // rings on the flags; the Tollmaster goes under with his bell still going.
  watch() { SFX.clank(); tone('sine', 140, 60, 0.5, 0.16); noise(0.3, 0.26, 380, 0.6, 0.04); noise(0.2, 0.2, 2400, 0.4, 0.14); },
  lampreeve() { tone('sawtooth', 240, 70, 0.5, 0.18); noise(0.4, 0.3, 800, 0.5, 0.05); for (let i = 0; i < 3; i++) tone('triangle', 1200 - i * 200, 900 - i * 200, 0.12, 0.06, 0.2 + i * 0.13); tone('sine', 70, 34, 0.7, 0.12, 0.2); },
  tollmaster() { tone('sine', 196, 190, 2.2, 0.14); tone('sine', 98, 94, 2.6, 0.1, 0.05); noise(0.8, 0.3, 300, 0.6, 0.1); tone('sine', 60, 28, 1.4, 0.12, 0.4); noise(0.6, 0.2, 900, 0.5, 0.5); },
  // ---- THE SEA ARC: men who work ships, and what lives under them ----
  // pirates: a shout cut off, iron on the deck, and a body going down on planking
  cutlass() { file('gobDie', 0.5, 0.92) || tone('square', 300, 90, 0.26, 0.2); tone('triangle', 900, 400, 0.14, 0.1, 0.04); noise(0.16, 0.24, 2200, 0.4, 0.06); },
  boarder() { file('gobDie', 0.6, 0.7) || tone('sawtooth', 220, 70, 0.34, 0.22); noise(0.3, 0.3, 500, 0.5, 0.05); tone('sine', 90, 44, 0.4, 0.14, 0.12); },
  marine() { file('gobDie', 0.45, 1.12) || tone('square', 420, 120, 0.22, 0.18); tone('triangle', 1400, 600, 0.1, 0.08, 0.03); noise(0.2, 0.2, 3000, 0.35, 0.08); /* the lathe of the bow goes with him */ },
  bosun() { file('gobDie', 0.6, 0.66) || tone('sawtooth', 200, 64, 0.36, 0.22); tone('sine', 2100, 900, 0.26, 0.07, 0.05); /* the call on its lanyard, one last note */ noise(0.26, 0.26, 700, 0.5, 0.1); },
  lookout() { file('gobDie', 0.4, 1.3) || tone('square', 520, 150, 0.2, 0.16); noise(0.18, 0.18, 2600, 0.4, 0.05); tone('triangle', 700, 300, 0.2, 0.06, 0.12); },
  sailor() { file('gobDie', 0.5, 0.86) || tone('sawtooth', 250, 80, 0.3, 0.2); noise(0.24, 0.24, 900, 0.5, 0.06); },
  netter() { file('gobDie', 0.5, 1) || tone('square', 340, 110, 0.24, 0.18); noise(0.3, 0.2, 1600, 0.4, 0.06); /* the net falls in a heap */ },
  // THE MERROW: not a goblin and not a drowned man, so no gobDie file, no gurgled human cry - a low croaking
  // call going out under the water, in its own voice
  merrowspear() { tone('sawtooth', 210, 70, 0.3, 0.2); tone('sine', 140, 50, 0.32, 0.16, 0.04); noise(0.2, 0.24, 1400, 0.4, 0.08); },   /* the harpoon goes down with her */
  merrowcaller() { tone('triangle', 260, 90, 0.34, 0.16); noise(0.3, 0.22, 500, 0.5, 0.08); pad('sine', 300, 120, 0.6, 0.04, 0.1, 1400); },   /* the current she was holding goes out of the water with her */
  merrowbrute() { tone('sawtooth', 160, 50, 0.4, 0.24); noise(0.3, 0.3, 300, 0.6, 0.08); SFX.crack(); },   /* the shell splits */
  // the fish: no voice at all, so all of it is water and body
  eel() { noise(0.3, 0.3, 700, 0.5); tone('sine', 180, 60, 0.34, 0.16); noise(0.2, 0.22, 1800, 0.4, 0.12); },
  scarecrow() { noise(0.4, 0.26, 1200, 0.4); noise(0.3, 0.16, 600, 0.5, 0.1); },   /* it comes apart into what it was stuffed with */
  rook() { tone('sawtooth', 1000, 500, 0.18, 0.12); noise(0.2, 0.12, 3000, 0.8, 0.04); },
  farmhand() { tone('sine', 360, 90, 0.8, 0.12); pad('sine', 540, 200, 0.9, 0.03, 0.02, 2000); },   /* he goes home at last */
  pumpkin() { noise(0.25, 0.3, 500, 0.5); tone('sine', 180, 60, 0.3, 0.14); },
  marshlight() { tone('triangle', 800, 2400, 0.3, 0.08); noise(0.2, 0.1, 5000, 0.6, 0.05); },
  haunt() { SFX.clank(); tone('sine', 900, 300, 0.3, 0.06, 0.05); },
  boo() { tone('sine', 300, 150, 0.4, 0.1); tone('sine', 305, 155, 0.4, 0.07, 0.05); noise(0.35, 0.1, 1600, 0.4); },   /* a small breath let go, and it is gone */
  ploughman() { tone('sawtooth', 120, 40, 1.2, 0.22); noise(0.8, 0.3, 400, 0.6); },   /* the share goes into the furrow for good */
  strawking() { noise(1.4, 0.36, 900, 0.5); tone('sawtooth', 120, 30, 1.6, 0.24); tone('sine', 70, 30, 2, 0.2, 0.2); },   /* the field burning down with him in it */
  kraken() { tone('sawtooth', 110, 28, 1.8, 0.3); tone('sine', 70, 24, 2.2, 0.26, 0.2); noise(1.4, 0.4, 380, 0.7); noise(0.9, 0.3, 1400, 0.5, 0.5); /* a bellow that goes down under the water with it */ },
  feeler() { noise(0.2, 0.26, 900, 0.5); tone('sine', 260, 70, 0.3, 0.12); noise(0.3, 0.2, 500, 0.6, 0.1); /* back down its hole */ },
  urchin() { noise(0.14, 0.26, 3400, 0.3); for (let i = 0; i < 5; i++) tone('triangle', 1600 + i * 200, 900, 0.07, 0.05, i * 0.035); /* the spines go everywhere */ },
  angler() { tone('sawtooth', 200, 70, 0.3, 0.2); noise(0.3, 0.3, 600, 0.5, 0.03); tone('sine', 1200, 300, 0.18, 0.06, 0.06); /* its lamp goes out */ noise(0.24, 0.16, 1400, 0.4, 0.16); },
  petrel() { tone('sawtooth', 1300, 400, 0.16, 0.12); tone('square', 900, 300, 0.12, 0.08, 0.05); noise(0.22, 0.16, 2400, 0.4, 0.08); },
  puffer() { noise(0.1, 0.3, 2600, 0.4); tone('sine', 500, 900, 0.06, 0.07); noise(0.16, 0.14, 800, 0.4, 0.05); /* the last of the air going out of it, all at once */ },
  jelly() { pad('sine', 340, 180, 0.6, 0.04, 0, 1600); noise(0.3, 0.16, 900, 0.4, 0.08); /* it comes apart into the water it was mostly made of */ },
  lamprey() { noise(0.2, 0.3, 500, 0.5); tone('sawtooth', 140, 50, 0.3, 0.16); noise(0.14, 0.14, 1600, 0.4, 0.1); /* a wet mouth losing its hold */ },
  manta() { noise(0.4, 0.36, 500, 0.6); tone('sine', 90, 40, 0.5, 0.14, 0.05); SFX.splash && SFX.splash(); /* a big flat body going down into her own water */ },
  crab() { noise(0.12, 0.3, 2800, 0.35); for (let i = 0; i < 4; i++) noise(0.05, 0.2, 2200 - i * 300, 0.5, 0.06 + i * 0.05); /* the shell comes apart in pieces */ },
  turtle() { noise(0.2, 0.3, 1200, 0.4); tone('square', 260, 90, 0.2, 0.14); tone('sine', 80, 40, 0.4, 0.12, 0.08); },
  heronfoe() { tone('sawtooth', 1000, 300, 0.2, 0.14); tone('square', 1400, 500, 0.14, 0.1, 0.04); noise(0.26, 0.2, 2000, 0.4, 0.1); },
  scout() { tone('sine', 700, 200, 0.24, 0.14); noise(0.2, 0.2, 1800, 0.4); pad('sine', 500, 260, 0.4, 0.04, 0.06, 2400); /* the tidebound go back to water */ },
  siren() { tone('sine', 900, 300, 0.4, 0.14); pad('sine', 660, 240, 0.7, 0.06, 0.04, 2200); noise(0.4, 0.2, 700, 0.5, 0.1); /* the song comes apart */ },
  tideguard() { SFX.clank(); tone('sine', 420, 140, 0.3, 0.14); noise(0.34, 0.26, 900, 0.5, 0.06); tone('sine', 70, 36, 0.5, 0.12, 0.14); },
  spitcap() { noise(0.3, 0.34, 480, 0.5); tone('sine', 200, 60, 0.3, 0.16); noise(0.4, 0.2, 1200, 0.4, 0.12); /* a wet bladder giving up */ },
  weaver() { noise(0.16, 0.26, 3000, 0.35); for (let i = 0; i < 3; i++) tone('sawtooth', 1500 - i * 300, 700, 0.09, 0.07, i * 0.06); noise(0.3, 0.16, 1800, 0.4, 0.14); /* chitin, and the curtain sagging */ },
  squirrel() { tone('square', 1500, 700, 0.09, 0.1); tone('triangle', 1100, 500, 0.07, 0.07, 0.05); noise(0.12, 0.12, 2600, 0.4, 0.03); },
  // ---- and the four that end a level ----
  reefmaw() { tone('sawtooth', 120, 40, 0.7, 0.26); noise(0.7, 0.36, 380, 0.5, 0.05); tone('sine', 60, 28, 1.1, 0.16, 0.2); noise(0.5, 0.24, 1100, 0.4, 0.4); SFX.waveCrash && SFX.waveCrash(); },
  herald() { tone('sine', 300, 90, 0.8, 0.18); pad('sine', 440, 180, 1.2, 0.07, 0.05, 2000); noise(0.8, 0.3, 600, 0.5, 0.1); tone('sine', 55, 26, 1.4, 0.14, 0.3); },
  quarter() { file('gobDie', 0.6, 0.8) || tone('sawtooth', 240, 70, 0.5, 0.22); tone('triangle', 1000, 380, 0.2, 0.1, 0.06); noise(0.5, 0.3, 700, 0.5, 0.08); tone('sine', 70, 32, 0.9, 0.14, 0.2); },
  masthead() { gob(0.7) || tone('sawtooth', 220, 70, 0.6, 0.22); for (let i = 0; i < 4; i++) noise(0.09, 0.2, 700, 0.6, 0.1 + i * 0.1); tone('sine', 90, 36, 1, 0.14, 0.3); SFX.thud(); },   /* and his sail going down after him */
  captain() { tone('sawtooth', 200, 60, 0.7, 0.24); noise(0.6, 0.32, 520, 0.5, 0.04); tone('sine', 196, 190, 1.4, 0.08, 0.1); /* the ship's bell rings itself */ tone('sine', 60, 28, 1.2, 0.15, 0.25); },
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
  badger() { tone('sawtooth', 240, 90, 0.3, 0.14); noise(0.2, 0.24, 700, 0.5, 0.05); tone('sine', 110, 50, 0.3, 0.12, 0.15); },   /* a squall, and a heavy little body going over */
  gar() { noise(0.18, 0.24, 1200, 0.5); tone('sine', 200, 70, 0.3, 0.12, 0.05); noise(0.12, 0.2, 700, 0.5, 0.18); },   /* one last flap on the grass */
  hare() { tone('sine', 2200, 2900, 0.06, 0.1); tone('sine', 2800, 1200, 0.16, 0.1, 0.06); noise(0.12, 0.2, 300, 0.6, 0.2); },
  wight() { tone('sine', 210, 90, 0.9, 0.18); tone('sine', 214, 92, 0.9, 0.1, 0.05); noise(0.9, 0.16, 500, 0.15, 0.1); },
  kite() {},
  folk() { file('gobHurt', 0.35, 1.6) || tone('sawtooth', 700, 300, 0.2, 0.1); },
  crow() { tone('sawtooth', 900, 300, 0.25, 0.12); noise(0.3, 0.15, 2400, 0.4, 0.08); for (let i = 0; i < 3; i++) noise(0.04, 0.08, 3200, 1, 0.12 + i * 0.06); /* a caw cut short, and feathers */ },
  horn() { gob(0.8) || tone('square', 320, 80, 0.3, 0.18); pad('sawtooth', 150, 88, 0.8, 0.09, 0.12, 700); /* the horn sighs out of him */ },
  shardling() { noise(0.3, 0.3, 3600, 0.7); [2637, 2093, 1568, 1175].forEach((f, i) => bell(f, 0.35, 0.05, i * 0.05)); tone('sawtooth', 160, 60, 0.25, 0.1); },
  fledgling() { tone('sawtooth', 1400, 500, 0.18, 0.1); noise(0.2, 0.16, 2600, 0.5, 0.05); for (let i = 0; i < 3; i++) noise(0.04, 0.08, 3600, 1, 0.1 + i * 0.05); /* a cheep cut short, and down */ },
  gobpriest() { gob(1.05) || tone('sawtooth', 300, 90, 0.4, 0.16); pad('sawtooth', 247, 150, 0.6, 0.04, 0.05, 800); tone('sine', 2093, 1200, 0.5, 0.05, 0.15); SFX.clatter(); /* the chant goes out of its nose, and the bell and the censer hit the flags */ },
  gobmage() { gob(1.15) || tone('square', 560, 120, 0.3, 0.16); for (let i = 0; i < 5; i++) noise(0.04, 0.1, 4800, 1.4, 0.1 + i * 0.05); tone('sine', 900, 200, 0.4, 0.05, 0.1); SFX.thud(); /* the pages go everywhere, and the book lands */ },
  sentry() { gob(1.05) || tone('square', 500, 110, 0.22, 0.16); bell(988, 0.8, 0.07, 0.12); SFX.clatter(); /* his bell hits the floor */ },
  hearthgob() { gob(0.7, 0.65) || tone('sawtooth', 240, 60, 0.4, 0.22); noise(0.6, 0.18, 2400, 0.5, 0.12); tone('sine', 90, 40, 0.3, 0.25, 0.1); /* the fire goes out with him */ },
  sweep() { gob(1.25) || tone('square', 560, 120, 0.22, 0.16); noise(0.45, 0.24, 520, 0.4, 0.05); SFX.clatter(); /* a cloud of soot and the brush */ },
  stormshaman() { noise(0.5, 0.28, 900, 0.4); tone('triangle', 900, 200, 0.4, 0.13); SFX.stormZap(); pad('sine', 1200, 300, 0.8, 0.05, 0.2, 2500); },
  seawitch() { tone('sine', 660, 170, 0.5, 0.12); noise(0.5, 0.22, 640, 0.35); SFX.stormZap(); bell(1568, 0.5, 0.05, 0.12); pad('sine', 990, 240, 0.9, 0.045, 0.2, 2400); },   /* the note falls out of her, her lantern breaks, and the weather goes with it */
  cutter() { gob(0.95) || tone('square', 420, 90, 0.25, 0.18); tone('square', 1300, 1200, 0.12, 0.1, 0.1); noise(0.06, 0.2, 2200, 0.5, 0.1); /* the axe drops */ },
  snuffer() { gob(0.9) || tone('square', 380, 90, 0.25, 0.18); tone('triangle', 1700, 1600, 0.1, 0.08, 0.1); SFX.puff(); },
  sailer() { gob(1.1) || tone('square', 520, 110, 0.22, 0.16); for (let i = 0; i < 3; i++) noise(0.07, 0.18, 800, 0.6, 0.08 + i * 0.09); SFX.thud(); /* the sail flaps down */ },
  suncatcher() { [1568, 1319, 1047, 880, 740, 587, 494].forEach((f, i) => bell(f, 0.7, 0.07, i * 0.08)); noise(0.9, 0.4, 3000, 0.5, 0.2); noise(0.6, 0.35, 220, 0.5, 0.6); tone('sine', 55, 25, 0.9, 0.35, 0.6); /* the rime comes off it all at once, and what is under it falls in pieces */ },
  roc() { tone('sawtooth', 2400, 500, 1.1, 0.18); tone('sawtooth', 2430, 480, 1.1, 0.09, 0.02); for (let i = 0; i < 4; i++) noise(0.12, 0.3, 320, 0.6, 0.4 + i * 0.18); tone('sine', 60, 25, 0.6, 0.4, 1.2); noise(0.4, 0.4, 200, 0.6, 1.2); /* the scream, the wings beat out, the fall */ },
  gqueen() { file('roar', 0.62, 0.52) || tone('sawtooth', 110, 40, 1.2, 0.3); gob(0.55, 0.8); [2400, 1900, 1500, 1200, 950].forEach((f, i) => tone('triangle', f, f * 0.9, 0.2, 0.1, 0.8 + i * 0.12)); SFX.thunder(); /* the last of the line, and her crown rolling on the stone */ },
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
// Every creature in the three sea levels had no voice at all and fell back to the same generic hit. These are
// theirs: shelled things click, fish snap and splash, birds squawk, the drowned elves gasp cold and thin, the
// drowned crew groan waterlogged, and the pirates are plain sunburnt people who swear and go down hard.
const HURT = {
  /* THE MAGE'S FOLLY: leaves, plate, a slopped bucket, a wooden jaw, a thing out of a jar, brass, and the two at the top */
  topiary() { noise(0.12, 0.2, 1800, 0.4); noise(0.08, 0.14, 900, 0.5, 0.05); tone('square', 260, 180, 0.06, 0.04, 0.02); },
  armour() { file('clang', 0.2, 0.7) || tone('sine', 700, 500, 0.12, 0.1); noise(0.08, 0.14, 1400, 0.5); },
  piece() { file('clang', 0.1, 1.3) || tone('sine', 1400, 1100, 0.06, 0.06); },
  broom() { noise(0.06, 0.2, 900, 0.5); tone('square', 320, 200, 0.08, 0.06); noise(0.1, 0.1, 400, 0.4, 0.05); },
  mimic() { noise(0.1, 0.22, 700, 0.5); tone('sawtooth', 160, 90, 0.14, 0.1); tone('square', 900, 400, 0.05, 0.04, 0.06); },
  imp() { tone('sawtooth', 1100, 700, 0.1, 0.09); noise(0.05, 0.12, 2600, 0.5); },
  turret() { tone('triangle', 1900, 1300, 0.1, 0.08); tone('sine', 2800, 2600, 0.12, 0.03, 0.02); noise(0.04, 0.1, 3000, 0.6); },
  homunculus() { tone('sine', 620, 380, 0.16, 0.1); tone('triangle', 1400, 1100, 0.08, 0.04, 0.03); noise(0.08, 0.12, 1100, 0.4); },
  archmage() { tone('sine', 280, 160, 0.22, 0.12); noise(0.14, 0.16, 900, 0.5); tone('triangle', 1700, 1500, 0.14, 0.04, 0.05); },
  assassin() { noise(0.08, 0.13, 2800, 0.7); tone('sine', 500, 340, 0.09, 0.05); },
  swornsword() { tone('square', 260, 190, 0.12, 0.1); noise(0.1, 0.12, 1200, 0.4); },
  lancer() { tone('square', 240, 170, 0.12, 0.1); noise(0.12, 0.14, 1000, 0.45); },
  hedgeknight() { tone('square', 200, 150, 0.14, 0.11); noise(0.14, 0.16, 900, 0.45); },
  runner() { tone('square', 420, 300, 0.1, 0.09); },
  crossbow() { tone('square', 300, 220, 0.11, 0.09); },
  closedhelm() { tone('sine', 150, 96, 0.24, 0.16); noise(0.22, 0.26, 420, 0.55); },
  prise() { noise(0.14, 0.18, 1600, 0.5); tone('square', 360, 240, 0.1, 0.08); },
  holdfast() { noise(0.18, 0.22, 600, 0.45); tone('sine', 220, 120, 0.14, 0.08); },
  drownedking() { tone('sine', 130, 80, 0.3, 0.2); noise(0.26, 0.3, 300, 0.6); },
  propman() { tone('square', 260, 180, 0.14, 0.12); noise(0.14, 0.2, 400, 0.5); },
  clinger() { noise(0.16, 0.22, 1100, 0.5); tone('sine', 420, 180, 0.14, 0.08); },
  prince() { tone('sawtooth', 150, 90, 0.26, 0.16); noise(0.2, 0.22, 420, 0.7); tone('triangle', 700, 420, 0.12, 0.05, 0.03); },   /* a hiss through a lipless jaw */
  berserker() { tone('sawtooth', 240, 150, 0.2, 0.18); noise(0.18, 0.28, 360, 0.6); tone('sine', 120, 80, 0.24, 0.1, 0.03); },
  grandmother() { tone('sine', 380, 260, 0.16, 0.09); noise(0.12, 0.12, 900, 0.5); tone('triangle', 700, 600, 0.07, 0.05, 0.08); },
  masthead() { gobH(0.7) || tone('square', 300, 170, 0.14, 0.16); noise(0.12, 0.2, 900, 0.5); tone('sine', 140, 90, 0.18, 0.1, 0.04); },   /* a goblin the size of a door taking one, and his canvas slapping */
  captain() { noise(0.16, 0.26, 700, 0.5); tone('sawtooth', 260, 120, 0.18, 0.16); tone('sine', 150, 90, 0.2, 0.1, 0.04); }, // a big man taking one and not liking it
  watch() { SFX.clank(); noise(0.2, 0.2, 420, 0.6); tone('sine', 160, 96, 0.24, 0.1); }, // a helm, and a chest full of water under it
  lampreeve() { noise(0.22, 0.22, 1100, 0.5); tone('sawtooth', 300, 150, 0.2, 0.12); noise(0.14, 0.14, 2600, 0.6, 0.08); tone('sine', 120, 70, 0.3, 0.08, 0.05); }, // something long and thin, complaining
  tollmaster() { tone('sine', 150, 92, 0.34, 0.14); noise(0.26, 0.24, 520, 0.5); tone('sine', 196, 190, 0.5, 0.05, 0.04); }, // a heavy man, and a bell somewhere behind him
  spitcap() { noise(0.12, 0.3, 500, 0.5); tone('sine', 200, 90, 0.14, 0.1); noise(0.08, 0.16, 1100, 0.4, 0.06); }, // a wet bladder taking a blade
  weaver() { noise(0.07, 0.2, 3000, 0.35); tone('sawtooth', 1400, 800, 0.07, 0.07); noise(0.05, 0.14, 2000, 0.5, 0.05); }, // chitin and a hiss
  drowned() { noise(0.26, 0.3, 380, 0.5); tone('sawtooth', 130, 60, 0.26, 0.16); noise(0.18, 0.18, 900, 0.4, 0.08); tone('sine', 80, 44, 0.3, 0.1, 0.04); }, // a man full of water
  bale() { noise(0.16, 0.24, 1400, 0.4); noise(0.1, 0.14, 700, 0.5, 0.03); }, // dry straw taking a blade
  turtle() { noise(0.06, 0.3, 1800, 0.4); tone('square', 300, 180, 0.07, 0.1); },
  crab() { noise(0.05, 0.26, 2600, 0.35); noise(0.05, 0.2, 1900, 0.4, 0.05); },
  urchin() { noise(0.07, 0.22, 3200, 0.3); tone('sine', 700, 400, 0.08, 0.06); },
  eel() { noise(0.12, 0.26, 900, 0.5); tone('sine', 240, 120, 0.12, 0.12); },
  puffer() { noise(0.05, 0.2, 2400, 0.3); tone('sine', 600, 800, 0.05, 0.05); },
  jelly() { noise(0.14, 0.14, 800, 0.35); tone('sine', 400, 260, 0.1, 0.05); },
  lamprey() { noise(0.1, 0.2, 500, 0.4); tone('sawtooth', 160, 100, 0.08, 0.08); },
  manta() { noise(0.16, 0.24, 450, 0.4); tone('sine', 110, 70, 0.14, 0.08); },
  scarecrow() { noise(0.14, 0.22, 1400, 0.4); noise(0.08, 0.14, 700, 0.5, 0.04); tone('square', 320, 220, 0.08, 0.05, 0.02); },   /* dry straw and something inside it */
  rook() { tone('sawtooth', 900, 620, 0.08, 0.1); noise(0.06, 0.1, 2800, 0.8); },
  farmhand() { tone('sine', 300, 180, 0.3, 0.12); pad('sine', 450, 300, 0.4, 0.03, 0.02, 2200); },   /* a sigh from a long way off */
  pumpkin() { noise(0.1, 0.3, 600, 0.5); tone('sine', 220, 110, 0.12, 0.12); },
  marshlight() { tone('triangle', 1600, 900, 0.1, 0.08); noise(0.05, 0.1, 4000, 0.6); },
  haunt() { SFX.clank(); tone('sine', 1200, 1100, 0.15, 0.04, 0.02); },
  boo() { tone('sine', 340, 220, 0.14, 0.1); noise(0.1, 0.1, 1400, 0.4); },
  ploughman() { tone('sawtooth', 150, 96, 0.22, 0.16); noise(0.18, 0.24, 500, 0.6); },
  strawking() { noise(0.2, 0.3, 1100, 0.4); tone('sawtooth', 130, 80, 0.3, 0.18); tone('sine', 90, 60, 0.3, 0.1, 0.05); },   /* a barn's worth of straw taking a blade, and a laugh under it */
  kraken() { tone('sawtooth', 140, 60, 0.4, 0.22); noise(0.3, 0.3, 500, 0.6); tone('sine', 80, 50, 0.5, 0.16, 0.05); },   /* something the size of a church taking a cut */
  krakenarm() { noise(0.12, 0.3, 700, 0.5); tone('sine', 150, 70, 0.16, 0.14); },
  feeler() { noise(0.1, 0.24, 1000, 0.5); tone('sine', 300, 150, 0.1, 0.1); },
  angler() { noise(0.14, 0.3, 700, 0.5); tone('sawtooth', 180, 80, 0.16, 0.14); },
  reefmaw() { noise(0.3, 0.34, 420, 0.5); tone('sawtooth', 120, 60, 0.3, 0.2); tone('sine', 70, 40, 0.4, 0.14, 0.05); },
  heronfoe() { tone('sawtooth', 900, 1500, 0.1, 0.12); noise(0.08, 0.14, 2400, 0.5, 0.02); },
  petrel() { tone('sawtooth', 1200, 1800, 0.07, 0.1); tone('square', 1500, 900, 0.06, 0.08, 0.06); },
  scout() { tone('sine', 700, 420, 0.12, 0.1); noise(0.1, 0.12, 2200, 0.5); },
  siren() { tone('sine', 880, 500, 0.2, 0.1); pad('sine', 660, 400, 0.3, 0.04, 0.02, 3000); },
  tideguard() { SFX.clank(); tone('sine', 480, 300, 0.14, 0.1); noise(0.1, 0.14, 1400, 0.5); },
  herald() { tone('sine', 320, 200, 0.26, 0.14); pad('sine', 480, 300, 0.4, 0.05, 0.02, 2400); noise(0.16, 0.14, 900, 0.6); },
  sailor() { tone('sawtooth', 200, 110, 0.2, 0.16); noise(0.18, 0.2, 600, 0.6); },
  netter() { tone('sawtooth', 260, 140, 0.16, 0.14); noise(0.14, 0.18, 800, 0.6); },
  merrowspear() { tone('sawtooth', 240, 150, 0.14, 0.14); noise(0.12, 0.16, 1200, 0.5); },
  merrowcaller() { tone('triangle', 300, 180, 0.14, 0.12); noise(0.1, 0.14, 700, 0.5); },
  merrowbrute() { SFX.clank(); tone('sawtooth', 180, 110, 0.16, 0.16); noise(0.14, 0.16, 500, 0.5); },
  cutlass() { file('hurt', 0.4, 1.18) || tone('square', 420, 260, 0.09, 0.14); },
  boarder() { file('hurt', 0.5, 0.86) || tone('square', 300, 180, 0.11, 0.16); },
  marine() { file('hurt', 0.4, 1.3) || tone('square', 480, 300, 0.08, 0.13); },
  bosun() { file('hurt', 0.55, 0.78) || tone('square', 260, 150, 0.12, 0.17); },
  lookout() { file('hurt', 0.35, 1.5) || tone('square', 560, 340, 0.07, 0.12); },
  quarter() { file('hurt', 0.5, 1.05) || tone('square', 380, 230, 0.1, 0.15); tone('sine', 200, 140, 0.14, 0.08, 0.03); },
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
  squirrel() { tone('square', 1700, 1100, 0.06, 0.08); tone('triangle', 1300, 900, 0.05, 0.05, 0.03); }, // a chitter and it is gone
  grub() { noise(0.1, 0.3, 450, 0.5); tone('sine', 260, 140, 0.1, 0.14); },
  troll() { tone('sawtooth', 150, 90, 0.2, 0.2); noise(0.1, 0.2, 200, 0.6); },
  harpy() { SFX.screech(); },
  goat() { SFX.goatCry(); },
  hare() { SFX.hareSqueak(); },
  badger() { SFX.badgerHuff(); },
  gar() { noise(0.1, 0.2, 1400, 0.5); tone('sine', 300, 160, 0.08, 0.08); },
  wight() { tone('sine', 240, 160, 0.25, 0.14); },
  kite() { SFX.kiteChatter(); },
  folk() { file('gobHurt', 0.3, 1.6) || tone('sawtooth', 700, 400, 0.1, 0.08); },
  crow() { tone('sawtooth', 1000, 700, 0.07, 0.1); noise(0.08, 0.1, 3000, 0.8); },
  horn() { gobH(0.8) || tone('square', 380, 240, 0.09, 0.12); },
  shardling() { bell(2637, 0.2, 0.05); noise(0.05, 0.12, 5000, 0.8); },
  fledgling() { tone('square', 1600, 1100, 0.08, 0.08); },
  gobpriest() { gobH(1.05) || tone('square', 480, 300, 0.08, 0.13); bell(2093, 0.12, 0.025, 0.02); /* and the bell on its belt */ },
  gobmage() { gobH(1.15) || tone('square', 620, 380, 0.08, 0.13); noise(0.05, 0.08, 5000, 1.5, 0.02); /* and a page tears */ },
  sentry() { gobH(1.05) || tone('square', 560, 340, 0.08, 0.12); bell(988, 0.25, 0.04, 0.02); },
  hearthgob() { gobH(0.7, 0.5) || tone('sawtooth', 240, 140, 0.14, 0.16); noise(0.12, 0.1, 2400, 0.6); },
  sweep() { gobH(1.3) || tone('square', 640, 400, 0.08, 0.12); noise(0.14, 0.1, 600, 0.5, 0.03); /* a cough of soot */ },
  stormshaman() { tone('triangle', 900, 500, 0.1, 0.12); noise(0.06, 0.14, 3000, 0.8); },
  seawitch() { tone('sine', 740, 460, 0.1, 0.11); noise(0.06, 0.12, 2200, 0.7); bell(1568, 0.12, 0.02, 0.02); },
  cutter() { gobH(0.95) || tone('square', 460, 280, 0.08, 0.14); },
  snuffer() { gobH(0.9) || tone('square', 420, 260, 0.09, 0.14); },
  sailer() { gobH(1.1) || tone('square', 560, 340, 0.08, 0.14); noise(0.06, 0.12, 800, 0.6); },
  suncatcher() { noise(0.06, 0.18, 4200, 0.6); bell(988, 0.25, 0.06); tone('sine', 220, 140, 0.12, 0.08); },   /* the rime cracks, and something under it groans */
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
// UNDERLEAF. A goblin asleep, and a candle being struck in a window across the street.
SFX.snore = () => { if (!gate('snore', 0.4)) return; if (voice('vo_snore', 0.2, 0.9)) return; tone('sawtooth', 90, 58, 0.5, 0.05); noise(0.45, 0.05, 240, 0.8, 0.02); tone('sine', 150, 110, 0.3, 0.03, 0.35); };
/* THE DRUNK. A hiccup: a gulp of air stopped short in the throat. And the slur: a man's shout dragged down and muffled. */
SFX.hic = () => { if (!gate('hic', 0.35)) return; tone('square', 520, 880, 0.05, 0.07); noise(0.04, 0.06, 1400, 0.5, 0.01); tone('sine', 300, 180, 0.06, 0.04, 0.04); };
SFX.slur = () => { if (!gate('slur', 0.7)) return; if (voice(VOK('m3', 'alert'), 0.34, 0.66, 1300)) return; tone('sawtooth', 210, 120, 0.32, 0.08); tone('sine', 160, 110, 0.3, 0.05, 0.08); };
SFX.lampOn = () => { noise(0.09, 0.1, 3400, 0.7); tone('triangle', 900, 1500, 0.08, 0.05, 0.02); tone('sine', 620, 740, 0.22, 0.04, 0.06); };
// THE CAST. A man in this game died on a square wave or on a goblin slowed down. Now: people REPLACE their synth
// with a voice from a kit (bosses keep their synth under it, for the size of the moment), creatures LAYER a voice
// over their own, and whatever the body is made of - plate, mail, cloth - is heard under both.
const CAST = {
  swornsword: { kit: 'm2', rate: 1, mat: 'mail', human: true }, hedgeknight: { kit: 'm4', rate: 0.92, lp: 1600, mat: 'plate', human: true },
  closedhelm: { kit: 'm4', rate: 0.78, lp: 1100, mat: 'plate', human: true, boss: true }, runner: { kit: 'm6', rate: 1.12, mat: 'cloth', human: true, alert: 'vo_hum_alert' },
  crossbow: { kit: 'm5', rate: 1.05, mat: 'mail', human: true }, lancer: { kit: 'm3', rate: 0.95, mat: 'mail', human: true },
  drunk: { kit: 'm3', rate: 0.8, lp: 1700, mat: 'cloth', human: true },   /* THE DRUNK: the serjeant's voice, slowed and blurred */
  cutlass: { kit: 'm1', rate: 1.05, mat: 'cloth', human: true }, boarder: { kit: 'm5', rate: 0.9, mat: 'cloth', human: true }, marine: { kit: 'm6', rate: 1.08, mat: 'cloth', human: true },
  bosun: { kit: 'm4', rate: 0.9, mat: 'cloth', human: true }, lookout: { kit: 'm6', rate: 1.22, mat: 'cloth', human: true }, sailor: { kit: 'm5', rate: 1, mat: 'cloth', human: true },
  seawitch: { kit: 'f3', rate: 1.04, mat: 'cloth', human: true },   /* the only woman in the crew with a voice, and she is not a goblin: no gibberish, no gob laugh */
  netter: { kit: 'm3', rate: 1.05, mat: 'cloth', human: true }, quarter: { kit: 'm1', rate: 0.95, mat: 'cloth', human: true, boss: true }, captain: { kit: 'm4', rate: 0.84, mat: 'cloth', human: true, boss: true },
  merrowspear: { kit: 'm3', rate: 1.05, mat: 'cloth', human: true }, merrowcaller: { kit: 'f3', rate: 0.95, mat: 'cloth', human: true },   /* fish-folk, not goblins: no gibberish, no goblin laugh */
  watch: { kit: 'm5', rate: 0.9, lp: 1800, mat: 'plate', human: true }, lampreeve: { kit: 'm1', rate: 0.82, mat: 'cloth', human: true, boss: true }, tollmaster: { kit: 'm4', rate: 0.72, mat: 'cloth', human: true, boss: true },
  folk: { kit: 'hd', rate: 1, human: true, alert: 'vo_hum_alert' },
  troll: { kit: 'ogre', rate: 1 }, prince: { kit: 'zom', rate: 0.62, lp: 1500, mat: 'cloth' }, courtier: { kit: 'zom', rate: 1.3, lp: 2600 }, berserker: { kit: 'gobbig', rate: 1.1 }, drownedking: { kit: 'ogre', rate: 0.75, lp: 1400 },
  forgemaster: { kit: 'ogre', rate: 0.85, mat: 'plate' }, reefmaw: { kit: 'ogre', rate: 0.7 },
  hound: { kit: 'bark', rate: 1.2 }, greathound: { kit: 'bark', rate: 0.8 },
  harpy: { kit: 'scream', rate: 1.1 }, roc: { kit: 'scream', rate: 0.8 }, petrel: { kit: 'gull', rate: 1 }, queen: { kit: 'scream', rate: 1.05 },
  wasp: { kit: 'bug', rate: 1.3 }, spider: { kit: 'bug', rate: 0.8 }, weaver: { kit: 'bug', rate: 1 }, clinger: { kit: 'bug', rate: 0.9 }, bat: { kit: 'bug', rate: 1.6 },
  sporeling: { kit: 'slime', rate: 1.2 }, lurker: { kit: 'slime', rate: 0.8 }, spitcap: { kit: 'slime', rate: 0.9 }, drone: { kit: 'slime', rate: 1.1 }, gill: { kit: 'slime', rate: 1.3 },
  spit: { kit: 'slime', rate: 1.4 }, grub: { kit: 'slime', rate: 0.9 },
  wight: { kit: 'zom', rate: 0.9, lp: 2200 }, drowned: { kit: 'zom', rate: 0.8, lp: 1600 }, siren: { kit: 'alien', rate: 1.1 }, scout: { kit: 'alien', rate: 1 }, herald: { kit: 'alien', rate: 0.8 },
};
const vbody = (mat, die) => { if (mat === 'plate') file('clang', die ? 0.26 : 0.14, die ? 0.6 : 0.78); else if (mat === 'mail') chain(die ? 0.04 : 0.025, die ? 5 : 3); else if (mat === 'cloth') noise(0.08, die ? 0.08 : 0.05, 900, 0.5); };
SFX.dieOf = t => { const c = CAST[t], d = DIE[t]; if (!c) return d || null;
  return () => { const roll = Math.random(), pool = c.human && c.kit !== 'hd' && roll < 0.25 && clips.vo_dp_die ? 'vo_dp_die' : c.human && c.kit !== 'hd' && roll < 0.45 && clips.vo_ex_die ? 'vo_ex_die' : VOK(c.kit, 'die');
    const ok = voice(pool, c.human ? 0.6 : 0.48, (pool === 'vo_dp_die' || pool === 'vo_ex_die') ? c.rate * 0.97 : c.rate * (c.human ? 1 : 0.92), c.lp || 0);
    if ((!c.human || c.boss || !ok) && d) d(); vbody(c.mat, true); }; };
SFX.hurtOf = t => { const c = CAST[t], h = HURT[t]; if (!c) return h || null;
  return () => { const ok = gate('vh' + t, 0.09) && voice(VOK(c.kit, 'hurt'), c.human ? 0.48 : 0.38, c.rate, c.lp || 0);
    if ((!c.human || !ok) && h) h(); vbody(c.mat, false); }; };
// THE BLOW HAS A SOUND. The instant a wind-up lets go - the same instant its smear is drawn - the air moves: a
// short whoosh for a blade, a long low one for anything heavy, a ring off steel, and now and then a man shouting.
const HEAVY_V = new Set(['closedhelm', 'hedgeknight', 'troll', 'heavy', 'brute', 'prince', 'forgemaster', 'berserker', 'greathound', 'ram', 'golem', 'lance', 'chief', 'king', 'captain', 'tollmaster']);
SFX.foeRelease = (t, mat, big) => { if (!gate('rel', 0.07)) return;
  const heavy = big || HEAVY_V.has(t), dur = heavy ? 0.24 : 0.13, f = heavy ? 560 : 1400;
  noise(dur, heavy ? 0.15 : 0.1, f, 0.7); tone('triangle', vary(f * 0.5), f * 0.2, dur, heavy ? 0.05 : 0.03);
  if (mat === 'steel') tone('sine', vary(2500), 1900, 0.14, 0.018, 0.04);
  const c = CAST[t]; if (c && c.human && gate('shout', 0.9) && Math.random() < 0.4) voice(VOK(c.kit, 'attack'), 0.3, c.rate, c.lp || 0); };
export const castTable = () => CAST;
export const heroKitTable = () => HERO_KIT;
export const kitNames = () => [...new Set(Object.keys(clips).filter(k => k.startsWith('vo_')).map(k => k.slice(3).split('_')[0]))].sort();
export const clipCount = () => Object.fromEntries(Object.entries(clips).map(([k, v]) => [k, v.filter(Boolean).length]));
export const SFX_NAMES = () => Object.keys(SFX).filter(k => typeof SFX[k] === 'function');
export const MUSIC_NAMES = ['stormharbor', 'burial', 'store', 'theme', 'theme2', 'stockade', 'cave', 'mineworks', 'deep', 'waymeet', 'marketday', 'theme3', 'theme4', 'town', 'sunspire', 'adventure', 'underleaf', 'stormhold', 'highcrown', 'longwater', 'reef', 'flotilla', 'hurricane', 'boss', 'boss2', 'drowned', 'king', 'roc', 'queen', 'select', 'ending', 'musForest', 'musCastle', 'musMountain', 'musUnder', 'musBeach', 'musSailor', 'musDungeon', 'sleepers', 'trench', 'barrows', 'quarry', 'skysail', 'frogking', 'sporemother', 'ramlord', 'owlreeve', 'herald', 'reefmaw', 'closedhelm', 'quartermaster', 'houndmaster', 'masthead', 'hilltroll', 'rimewright', 'captain', 'tollmaster', 'grandmother'];
export const AMBIENT_NAMES = ['forest', 'water', 'hive', 'rain', 'wind', 'town', 'shore', 'ship', 'cave', 'deep', 'drip', 'tavern', 'hold', 'hall'];
