// tools/pyramidart-music.mjs - THE COFFIN KING's theme and THE SEALED PYRAMID's level bed, measured in the real page (claude/pyramidart): renders the synth boss themes offline
// (OfflineAudioContext) and decodes level files, then prints RMS / peak at the volume the game plays them (synth: BOSS_SYNTH_GAIN, files: 0.45 x TRACK_GAIN). Not in the suite. PORT from env.
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const BM = await import('/src/boss-music.js'); const out = {}; const SR = 22050, SEC = 24;
    const rms = (d) => { let s = 0, p = 0; for (let i = 0; i < d.length; i++) { s += d[i] * d[i]; p = Math.max(p, Math.abs(d[i])); } return [Math.sqrt(s / d.length), p]; };
    const nbuf = (ac) => { const b = ac.createBuffer(1, SR * 2, SR), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
    for (const name of ${JSON.stringify(['tombking', 'tombking:p2', 'tombking:p3', 'scarabmother', 'hawkmistress', 'banditking', 'cisternqueen', 'sealedpyramid'])}) {
      const T = BM.SYNTH_BOSS[name] || (BM.SYNTH_VARIANT && BM.SYNTH_VARIANT[name]); if (!T) { out[name] = 'none'; continue; }
      const ac = new OfflineAudioContext(1, SR * SEC, SR), master = ac.createGain(); master.gain.value = BM.BOSS_SYNTH_GAIN; master.connect(ac.destination); const nb = nbuf(ac);
      const noise = (dur, v, freq, q, delay, dest) => { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1000; f.Q.value = q || 1; const g = ac.createGain(); const t = ac.currentTime + delay; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(dest || master); s.start(t); s.stop(t + dur + 0.05); };
      const env = { ac, dest: master, noise, gain: 1, variant: name.split(':')[1] };
      for (let i = 0, t = 0; t < SEC - 2; i++, t += T.step) { env.__t = t; const proxy = { ...env, ac: new Proxy(ac, { get: (o, k) => k === 'currentTime' ? t : (typeof o[k] === 'function' ? o[k].bind(o) : o[k]) }) }; T.play(i % T.total, 0, env.variant, proxy); }
      const buf = await ac.startRendering(), d = buf.getChannelData(0); out[name] = rms(d.slice(SR * 2)); }
    for (const f of ['sealedpyramid', 'buriedcity', 'ksar', 'burial', 'caravan', 'glasssea', 'fields']) { try { const ab = await (await fetch('/audio/' + f + '.ogg')).arrayBuffer(); const ac = new OfflineAudioContext(1, SR * 30, SR); const b = await ac.decodeAudioData(ab); const d = b.getChannelData(0); const n = Math.min(d.length, b.sampleRate * 60); out['file:' + f] = rms(d.slice(0, n)).concat([b.duration]); } catch (e) { out['file:' + f] = String(e); } }
    return out; })()`);
  const f = (v) => Array.isArray(v) ? v.map(x => +x.toFixed(3)).join(' ') : v;
  for (const [k, v] of Object.entries(r)) console.log(k.padEnd(18), f(v));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
