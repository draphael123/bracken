/* tools/gq6fix-lag.mjs - GQ6FIX item 4: frame cost over the Queen's HALL fight, windowed by event (calm / the bell's hoists / cooling / the throne fire's tell / its burn / after).
   One page, seeded (same frames every run), the hero invulnerable (BK.god) and standing at the bell, who rings it once by a real swing. Each frame = BK.step(1) (one update + one render).
   node tools/gq6fix-lag.mjs [--profile] [--secs=70] [--seed=7] [--out=file.json]
   --profile: Chrome's sampling profiler per window, top self-time functions (it inflates every ms: read the ranking, not the numbers).  Without it: ms per frame, plain.
   Also counts per window (per frame): canvases made, getImageData reads, gradients made, fillText / measureText calls, drawImage calls, shadowBlur sets. */
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'fs';
const a = process.argv.slice(2), opt = (k, d) => { const x = a.find(y => y.startsWith('--' + k + '=')); return x ? x.slice(k.length + 3) : d; };
const prof = a.includes('--profile'), noring = a.includes('--noring'), wave = a.includes('--wave'), secs = +opt('secs', 70), seed = +opt('seed', 7), out = opt('out', '');
const pg = await openPage({ audio: a.includes('--audio'), fonts: !a.includes('--nofonts'), seed });
try {
  const sh = { windows: {}, order: [] };
  const evalw = (x) => pg.evalp(x, 900000);
  await evalw(`(async () => { const { LEVELS } = await import('/src/level.js'); window.__lagLoad = LEVELS.findIndex(l => l.id === 'crown'); return 1; })()`);
  await evalw(`(() => { const hold = () => { BK.P.hp = BK.P.maxHp; }; window.__hold = hold;
    BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(window.__lagLoad); BK.state = 'play'; BK.god = true; BK.step(5);
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); window.__init = []; for (let k = 0; k < 300; k++) { hold(); const t = performance.now(); BK.step(1); window.__init.push(performance.now() - t); }
    const C = CanvasRenderingContext2D.prototype, ce = Document.prototype.createElement; const cnt = window.__cnt = { canvas: 0, gi: 0, grad: 0, text: 0, measure: 0, draw: 0, blur: 0, path: 0 };
    const wrap = (o, k, f) => { const orig = o[k]; o[k] = function (...x) { f(); return orig.apply(this, x); }; };
    wrap(C, 'getImageData', () => cnt.gi++); wrap(C, 'createLinearGradient', () => cnt.grad++); wrap(C, 'createRadialGradient', () => cnt.grad++); wrap(C, 'fillText', () => cnt.text++); wrap(C, 'strokeText', () => cnt.text++); wrap(C, 'measureText', () => cnt.measure++); wrap(C, 'drawImage', () => cnt.draw++); wrap(C, 'fill', () => cnt.path++); wrap(C, 'stroke', () => cnt.path++);
    Document.prototype.createElement = function (t, ...x) { if (String(t).toLowerCase() === 'canvas') cnt.canvas++; return ce.call(this, t, ...x); };
    const sd = Object.getOwnPropertyDescriptor(C, 'shadowBlur'); if (sd && sd.set) Object.defineProperty(C, 'shadowBlur', { get: sd.get, set(v) { if (v) cnt.blur++; sd.set.call(this, v); }, configurable: true });
    const q = BK.boss; const H = BK.gqHands(); const G5 = H.q5(); window.__q = q; window.__G5 = G5; window.__H = H; return 1; })()`);
  if (prof) { await pg.send('Profiler.enable'); await pg.send('Profiler.setSamplingInterval', { interval: 250 }); }
  const winOf = `(() => { const s = window.__G5.state(), q = window.__q, F = s && s.fire; const mw = window.__H.mech && window.__H.mech().wave; if (F) return F.phase === 'tell' ? 'fireTell' : 'burn'; if (mw) return 'wave-' + mw.state; if (false) return F.phase === 'tell' ? 'fireTell' : 'burn'; if (s && s.phase !== 'down') return 'hoists'; if (window.__ringed && s && s.fireDoneAt > 0 && BK.time - 0 > 0 && s.fires > 0) return 'after'; return window.__ringed ? 'cooling' : 'calm'; })()`;
  const frames = Math.round(secs * 60); let cur = null, t0 = 0, rows = {}, startedProf = false, log = [];
  const flush = async (w) => { if (!w) return; const r = rows[w]; if (prof && startedProf) { const p = (await pg.send('Profiler.stop')).result.profile; startedProf = false; const self = new Map(); const byId = new Map(p.nodes.map(n => [n.id, n])); const dt = p.timeDeltas; const tot = dt.reduce((s, v) => s + v, 0) || 1;
      p.samples.forEach((id, i) => { const n = byId.get(id), cf = n.callFrame, k = (cf.functionName || '(anon)') + ' ' + (cf.url || '').split('/').slice(-2).join('/') + ':' + cf.lineNumber; self.set(k, (self.get(k) || 0) + dt[i]); });
      r.top = [...self.entries()].sort((x, y) => y[1] - x[1]).slice(0, 12).map(([k, v]) => (v / tot * 100).toFixed(1) + '% ' + k); } };
  for (let f = 0; f < frames; f += 1) {
    const w = await pg.evalp(winOf);
    if (w !== cur) { await flush(cur); cur = w; rows[w] = rows[w] || { ms: [], cnt: { canvas: 0, gi: 0, grad: 0, text: 0, measure: 0, draw: 0, blur: 0, path: 0 }, n: 0, first: f }; log.push((f / 60).toFixed(1) + 's -> ' + w); if (prof) { await pg.send('Profiler.start'); startedProf = true; } }
    if (f === 30 && wave) await pg.evalp('(() => { window.__q.hp = Math.round(window.__q.maxHp * 0.65); })()'); if (f === 60 * 6 && !noring) await pg.evalp(`(() => { const b = BK.props().find(p => p.t === 'winch' && p.bell && p.bossGate), P = BK.P; P.x = b.x - 14; P.y = b.y; P.vx = 0; P.face = 1; P.ground = true; window.__ringed = true; BK.press('atk'); })()`);
    const r = await pg.evalp(`(() => { const c = window.__cnt; for (const k in c) c[k] = 0; const h0 = performance.memory ? performance.memory.usedJSHeapSize : 0; const t = performance.now(); window.__hold(); BK.step(1); const dt = performance.now() - t; const h1 = performance.memory ? performance.memory.usedJSHeapSize : 0; return { dt, c: { ...c }, heap: h1 - h0 }; })()`);
    const R = rows[cur]; if (r.dt > 14) (R.spikes = R.spikes || []).push({ at: +(f / 60).toFixed(2), ms: +r.dt.toFixed(1), canvas: r.c.canvas, grad: r.c.grad }); R.ms.push(r.dt); R.alloc = (R.alloc || 0) + Math.max(0, r.heap); R.n++; for (const k in r.c) R.cnt[k] += r.c[k];
  }
  await flush(cur);
  const stat = (xs) => { const s = [...xs].sort((p, q) => p - q); return { n: s.length, mean: +(s.reduce((p, q) => p + q, 0) / (s.length || 1)).toFixed(2), p50: +(s[Math.floor(s.length * 0.5)] || 0).toFixed(2), p95: +(s[Math.floor(s.length * 0.95)] || 0).toFixed(2), max: +(s[s.length - 1] || 0).toFixed(1) }; };
  const res = {}; for (const [w, r] of Object.entries(rows)) { res[w] = { ...stat(r.ms), perFrame: Object.fromEntries(Object.entries(r.cnt).map(([k, v]) => [k, +(v / r.n).toFixed(1)])), allocKBperFrame: +((r.alloc || 0) / r.n / 1024).toFixed(1), spikes: (r.spikes || []).slice(0, 8), top: r.top }; }
  console.log(log.join('\n')); console.log(JSON.stringify(res, null, 1)); if (out) writeFileSync(out, JSON.stringify({ log, res }, null, 1)); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
