/* tools/gq6hitch.mjs - GQ6HITCH (11-13): the worst frame at every burn step of the Highcrown fight (flags ?gq6s2=1&gq6s3=1), headless, one hero by real keys.
     node tools/gq6hitch.mjs [--runs=3] [--hero=knight] [--out=file.json]
   Per run and step: every BK.step(1) (update + render) is timed; reports the worst frame and its phase, the worst 3 frames overall, how many chunk canvases / resolve calls the worst frame made.
   Also hashes the tile sprites (pixels) after each tier is laid so a fast path can be proved identical (--hash prints them). One headless Chrome. Not a check. */
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'fs';
const a = process.argv.slice(2), opt = (k, d) => { const x = a.find(y => y.startsWith('--' + k + '=')); return x ? x.slice(k.length + 3) : d; };
if (a.includes('--off')) { delete process.env.BRACKEN_GQ6S2; delete process.env.BRACKEN_GQ6S3; } else { process.env.BRACKEN_GQ6S2 = '1'; process.env.BRACKEN_GQ6S3 = '1'; }
const RUNS = +opt('runs', 3), HERO = opt('hero', 'knight'), PROOF = a.includes('--proof');
const FN = `async (hero, proof) => {
  const { LEVELS } = await import('/src/level.js');
  const hold = () => { BK.P.hp = BK.P.maxHp; };
  BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero(hero); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.state = 'play'; BK.god = false; BK.step(5);
  const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1);
  const hallT = []; for (let k = 0; k < 300; k++) { hold(); const t0 = performance.now(); BK.step(1); const d0 = performance.now() - t0; if (d0 > 40) hallT.push([k, +d0.toFixed(0), Math.round(performance.memory.usedJSHeapSize / 1e5) / 10]); }
  const q = BK.boss; q.hp = 2; (BK.hurt || (BK.env && BK.env().hurt))(q, 50, BK.P.x); for (let k = 0; k < 140; k++) { hold(); BK.step(1); }
  const H = BK.gqHands(); const entry = []; const w0 = performance.now(); H.skipRoof(); entry.push(['skipRoof', +(performance.now() - w0).toFixed(0)]); for (let k = 0; k < 600; k++) { hold(); const t0 = performance.now(); BK.step(1); const d0 = performance.now() - t0; if (d0 > 40) entry.push([k, +d0.toFixed(0), Math.round(performance.memory.usedJSHeapSize / 1e5) / 10]); if (BK.boss.stage === 'roof' && (BK.boss.mode === 'roofStand' || BK.boss.mode === 'rec') && k > 200) break; }
  if (!H.gq6s2 || !H.gq6s2()) return { hallT, entry, steps: [], all: [], errors: null };
  const g = H.gq6s2(), st = g.state(), P = BK.P, Tw = (BK.L.arena && BK.L.arena.tower) || (BK.L.arenaRoof && BK.L.arenaRoof.tower), cu = Tw.CUPOLA;
  P.x = (cu.x1 + 1) * 16 + 6; P.y = Tw.DECK.floor * 16; P.vx = 0; P.vy = 0;
  const ce = Document.prototype.createElement, cnt = { c: 0 }; Document.prototype.createElement = function (t, ...x) { if (String(t).toLowerCase() === 'canvas') cnt.c++; return ce.call(this, t, ...x); };
  const out = { steps: [], all: [], entry, hallT };
  const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16; const c2 = cv.getContext('2d', { willReadFrequently: true }), hc = new Map();
  const hash = sp => { if (!sp) return 'n'; let v = hc.get(sp); if (v) return v; c2.clearRect(0, 0, 16, 16); c2.drawImage(sp, 0, 0); const d = c2.getImageData(0, 0, 16, 16).data; let a = 5381; for (let i = 0; i < d.length; i++) a = ((a * 33) ^ d[i]) >>> 0; v = sp.width + 'x' + sp.height + ':' + a; hc.set(sp, v); return v; };
  /* the live tile picture (after the burn was told through the cached state) against a full resolveTiles of the very same grid */
  const proofs = (T, i) => { const n = T.spr.length, live = T.spr.map(hash), liveDecorArr = T.decor.map(d => JSON.stringify(d)), liveO = T.spr.slice(), liveDeep = T.deep.slice(), liveDecor = JSON.stringify(T.decor), ch0 = T.chunks(); T.resolve();
    let px = 0, deep = 0, idc = 0; const bad = [], dbad = []; for (let k = 0; k < n; k++) { const h2 = hash(T.spr[k]); if (live[k] !== h2) { px++; if (bad.length < 8) bad.push([k % T.LW, (k / T.LW) | 0]); } if (liveDeep[k] !== T.deep[k]) { deep++; if (dbad.length < 40) dbad.push([k % T.LW, (k / T.LW) | 0, liveDeep[k], T.deep[k], 'g' + T.grid[k]]); } if (liveO[k] !== T.spr[k]) idc++; }
    const after = T.decor.map(d => JSON.stringify(d)), sa = new Set(liveDecorArr), sb = new Set(after); const onlyLive = liveDecorArr.filter(x => !sb.has(x)).slice(0, 4), onlyFresh = after.filter(x => !sa.has(x)).slice(0, 4);
    let fd = -1; for (let q = 0; q < after.length; q++) if (liveDecorArr[q] !== after[q]) { fd = q; break; } let nd = 0; for (let q = 0; q < after.length; q++) if (liveDecorArr[q] !== after[q]) nd++;
    return { step: i, firstDecorDiff: fd, nDecorDiff: nd, a: liveDecorArr[fd], b: after[fd], dbad: dbad.slice(0, 12), onlyLive, onlyFresh, sameSet: onlyLive.length === 0 && onlyFresh.length === 0 && liveDecorArr.length === after.length, cells: n, pxDiff: px, deepDiff: deep, objDiff: idc, bad, decorSame: liveDecor === JSON.stringify(T.decor), decorN: T.decor.length }; }; const keyOff = () => { const k = BK.keys; k.left = k.right = k.up = k.down = k.jump = k.atk = false; };
  const timed = (label, step) => { cnt.c = 0; const t = performance.now(); BK.step(1); const d = performance.now() - t; const r = { label, step, ms: +d.toFixed(1), heap: Math.round(performance.memory.usedJSHeapSize / 1e5) / 10, canv: cnt.c, ph: st.phase, tier: st.tier }; out.all.push(r); return r; };
  for (const [i, thr] of [[0, 0.85], [1, 0.70], [2, 0.50]]) {
    const rec = []; q.hp = Math.min(q.hp, q.maxHp * (thr - 0.004)); let w = 0; BK.god = true;
    while (st.phase !== 'tell' && w++ < 2400) { hold(); rec.push(timed('wait', i)); }
    BK.god = false; const tier0 = st.tier; let f = 0;
    if (proof) { const T = BK.tileProbe(), pr = proofs(T, i); out.proof = (out.proof || []).concat([pr]); }
    while (f++ < 60 * 70) { const r = g.botGoal(P), k = BK.keys; k.left = k.right = k.up = k.down = false; if (r) { const dx = r.goal - P.x; k.left = dx < -3; k.right = dx > 3; k.up = !!r.up; }
      hold(); rec.push(timed(st.phase, i)); if (st.phase === 'on' && st.tier === tier0 + 1) break; }
    keyOff(); BK.god = true; for (let k = 0; k < 240; k++) { hold(); rec.push(timed('settle', i)); } BK.god = false;
    const byPhase = {}; for (const r of rec) { const b = byPhase[r.label] || (byPhase[r.label] = { n: 0, max: 0, canvMax: 0 }); b.n++; b.max = Math.max(b.max, r.ms); b.canvMax = Math.max(b.canvMax, r.canv); }
    const worst = rec.slice().sort((p, q2) => q2.ms - p.ms).slice(0, 3);
    const tellFirst = rec.find(r => r.label === 'tell');
    const ti = rec.findIndex(r => r.label === 'tell'); const slow = rec.map((r, j) => ({ rel: j - ti, label: r.label, ms: r.ms, canv: r.canv, heapMB: r.heap, heapPrev: j ? rec[j - 1].heap : null })).filter(r => r.ms > 40);
    out.steps.push({ slow, step: i, tierFrom: tier0, tierTo: st.tier, worst, tellFirst, byPhase, worstNonWait: Math.max(...rec.filter(r => r.label !== 'wait').map(r => r.ms)), lifts: st.lifts }); }
  keyOff(); Document.prototype.createElement = ce; out.errors = null; return out; }`;
const res = [];
for (let n = 0; n < RUNS; n++) {
  const pg = await openPage({ audio: false, fonts: true, seed: 7 });
  try { const r = await pg.evalp('(' + FN + ')(' + JSON.stringify(HERO) + ',' + PROOF + ')', 900000); r.errors = pg.errors.slice(0, 3); res.push(r);
    console.log('hall frames >40: ' + JSON.stringify(r.hallT) + ' roof entry >40: ' + JSON.stringify(r.entry)); console.log('run ' + (n + 1) + ': ' + r.steps.map(s => 'step' + s.step + ' worst ' + s.worst[0].ms + ' ms @' + s.worst[0].label + ' (canv ' + s.worst[0].canv + '); tellFirst ' + (s.tellFirst && s.tellFirst.ms) + '; worstNonWait ' + s.worstNonWait + ' slow>40 ' + s.slow.map(x => x.label + '@' + x.rel + ':' + x.ms + ' heap ' + x.heapPrev + '>' + x.heapMB).join(',')).join(' | ') + ' errs ' + JSON.stringify(r.errors)); if (r.proof) console.log('proof ' + JSON.stringify(r.proof));
  } finally { pg.close(); }
}
const o = opt('out', ''); if (o) writeFileSync(o, JSON.stringify(res, null, 1));
