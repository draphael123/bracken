// tools/mobile-perf.mjs - THE GAME ON A MID PHONE (claude/mobile2, 2026-10-03: Daniel's real Android, "VERY LAGGY, even the menus").
// The page runs as a 915x412 landscape phone at DPR 2.625 with touch on (auto-detected: NO ?touch=1) and the CPU throttled
// (MP_CPU, default 4x), and is left to run on its own requestAnimationFrame loop (not BK.step) so the numbers are what a thumb feels:
//   BOOT   ms from navigation to window.BK, and to the title, on the throttled CPU
//   SCENES frames per second, the worst frame and the main-thread busy time per frame (CDP Performance TaskDuration) on the title,
//          the map and three levels
//   INPUT  the game-side latency of a touch: touchStart on the stick to keys.left being set
// It writes the table to docs/mobile-perf.json when MP_WRITE=1. A budget (BUDGET below) fails the check on a regression.
//   node tools/mobile-perf.mjs            (a few minutes: it boots the game under 4x throttle)
//   MP_CPU=6 MP_SCENES=title,map node tools/mobile-perf.mjs
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CPU = +(process.env.MP_CPU || 4), W = 915, H = 412, DPR = 2.625;
const SCENES = (process.env.MP_SCENES || 'title,map,wood,welltown,redgorge').split(',');
const SECS = +(process.env.MP_SECS || 4);
/* the budget: what a regression must not pass. Headless Chrome has no phone GPU, so these are the CPU-side numbers (the part the code owns). */
/* (the PC runs other lanes while this runs, so the timing budgets are loose guards against a real regression - the structural guards below, which a busy PC cannot flake, are the sharp ones) */
const BUDGET = { bootMs: +(process.env.MP_BOOT_BUDGET || 150000), fpsMin: +(process.env.MP_FPS_MIN || 40), worstMs: 600, inputMs: 50, canvasMegapixels: 1.3 };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ noWait: true, audio: false, fonts: false });
const fails = [], rows = [], out = { cpu: CPU, viewport: W + 'x' + H + '@' + DPR };
const E = (x, t = 120000) => pg.evalp(x, t);
try {
  await pg.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
  await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await pg.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  await pg.send('Performance.enable');
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?nosw&mp=' + Date.now() + (process.env.MP_QUERY || '') });
  const t0 = Date.now(); let bk = 0, title = 0;
  for (let i = 0; i < 1200 && !title; i++) {
    const r = await E('({ bk: typeof window.BK === "object" && !!window.BK.lookPass, st: window.BK && window.BK.state })', 3000).catch(() => null);
    if (r && r.bk && !bk) bk = Date.now() - t0; if (r && r.bk && r.st === 'title') title = Date.now() - t0; if (!title) await sleep(100); }
  out.bootMs = bk; out.titleMs = title;
  console.log('boot: BK up at ' + (bk / 1000).toFixed(1) + ' s (title ' + (title / 1000).toFixed(1) + ' s) under ' + CPU + 'x CPU throttle');
  if (!title) fails.push('the game never reached the title');
  out.bootTrace = await E('(BKLoad.state.stats && BKLoad.state.stats.trace) || []').catch(() => []);   // [step, ms] pairs: where the boot went
  out.bootScriptMs = Math.round(((await pg.send('Performance.getMetrics')).result.metrics.find(x => x.name === 'TaskDuration') || {}).value * 1000);   // main-thread busy ms across the whole boot: steadier than wall time on a shared PC
  console.log('boot main-thread busy: ' + out.bootScriptMs + ' ms');
  console.log('boot steps (ms): ' + (out.bootTrace || []).map(([k, v]) => k + ' ' + v).join(', '));
  out.perf = await E('({ coarse: matchMedia("(pointer: coarse)").matches, dpr: devicePixelRatio, cv: document.getElementById("c").width + "x" + document.getElementById("c").height, set: { particles: BK.SET.particles, parallax: BK.SET.parallax, motes: BK.SET.motes, touchInit: BK.SET.touchInit } })').catch(() => ({}));
  console.log('page: ' + JSON.stringify(out.perf));
  // STRUCTURAL GUARDS (deterministic): a phone's display canvas is the light one, the context is the low-latency one, the buttons have a layer of their own, and the page preloads its modules
  out.struct = await E('(() => { const c = document.getElementById("c"), t = document.getElementById("touchlayer"); return { mp: c.width * c.height / 1e6, tl: !!t, tlw: t ? t.width : 0, pre: document.querySelectorAll("link[rel=modulepreload]").length, desync: !!(c.getContext("2d").getContextAttributes && c.getContext("2d").getContextAttributes().desynchronized) }; })()');
  console.log('structure: ' + JSON.stringify(out.struct));
  if (process.env.MP_BUDGET !== '0') { const s = out.struct; if (s.mp > BUDGET.canvasMegapixels) fails.push('the phone display canvas is ' + s.mp.toFixed(2) + ' megapixels (budget ' + BUDGET.canvasMegapixels + '): main.js resize() lowRes()'); if (!s.desync) fails.push('the display canvas is not desynchronized on a phone (main.js getContext)'); if (!s.tl) fails.push('no touch layer canvas (src/touch.js overlay)'); if (s.pre < 200) fails.push('index.html preloads only ' + s.pre + ' modules (node tools/modulepreload.mjs --write)'); }
  const metric = async () => { const m = (await pg.send('Performance.getMetrics')).result.metrics, g = n => (m.find(x => x.name === n) || {}).value || 0; return { task: g('TaskDuration'), script: g('ScriptDuration'), layout: g('LayoutDuration'), t: g('Timestamp') }; };
  const measure = async name => {
    await E('(() => { const a = window.__fr = { n: 0, dts: [], last: performance.now(), on: true }; const f = t => { if (!a.on) return; a.n++; a.dts.push(t - a.last); a.last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); })()');
    await sleep(600); await E('(() => { const a = window.__fr; a.n = 0; a.dts = []; })()'); const m0 = await metric(); await sleep(SECS * 1000); const m1 = await metric();
    const r = await E('(() => { const a = window.__fr; a.on = false; const d = a.dts.slice().sort((x, y) => x - y); return { n: a.n, p95: d[Math.floor(d.length * 0.95)] || 0, worst: d[d.length - 1] || 0 }; })()');
    const wall = m1.t - m0.t, row = { scene: name, fps: +(r.n / wall).toFixed(1), p95: +r.p95.toFixed(1), worst: +r.worst.toFixed(1), busyMsPerFrame: +(((m1.task - m0.task) * 1000) / Math.max(1, r.n)).toFixed(1),
      scriptMs: +(((m1.script - m0.script) * 1000) / Math.max(1, r.n)).toFixed(1) };
    rows.push(row); console.log(('  ' + name).padEnd(12) + JSON.stringify(row)); return row; };
  const level = async id => { await E(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.load(LEVELS.findIndex(l => l.id === ${JSON.stringify(id)})); BK.state = 'play'; })()`); await sleep(1500); };
  for (const s of SCENES) {
    if (s === 'title') { await E("BK.state = 'title'"); await measure('title'); }
    else if (s === 'map') { await E("BK.state = 'map'"); await sleep(800); await measure('map'); }
    else { await level(s); await measure(s); }
  }
  out.rows = rows;
  // INPUT: a touch on the stick -> keys.left (the game-side path)
  if (SCENES.some(s => !['title', 'map'].includes(s))) {
    await E("BK.state = 'play'"); await sleep(300);
    const lat = await E(`(async () => { const res = {}, cv = document.getElementById('c');
      const dispatch = (type, x, y, id) => { const t = new Touch({ identifier: id, target: cv, clientX: x, clientY: y }); cv.dispatchEvent(new TouchEvent(type, { touches: type === 'touchend' ? [] : [t], targetTouches: type === 'touchend' ? [] : [t], changedTouches: [t], bubbles: true, cancelable: true })); };
      const cx = innerWidth * 0.15, cy = innerHeight * 0.6;
      const one = () => { const t0 = performance.now(); dispatch('touchstart', cx, cy, 1); dispatch('touchmove', cx - 40, cy, 1); const ms = BK.keys.left ? performance.now() - t0 : -1; dispatch('touchend', cx - 40, cy, 1); return ms; };
      res.firstMs = +one().toFixed(1);   // (the first touch makes the AudioContext: a one-off)
      const xs = [one(), one(), one(), one(), one()].sort((a, b) => a - b); res.stickMs = +xs[2].toFixed(1);
      return res; })()`).catch(e => ({ err: String(e) }));
    out.input = lat; console.log('input: ' + JSON.stringify(lat));
  }
  const err = pg.errors.slice(0, 3); if (err.length) fails.push('the page threw: ' + err.join(' | '));
  if (process.env.MP_WRITE) writeFileSync(ROOT + (process.env.MP_OUT || 'docs/mobile-perf.json'), JSON.stringify(out, null, 1) + '\n');
  if (process.env.MP_BUDGET !== '0') {
    if (bk > BUDGET.bootMs) fails.push('boot to the game took ' + bk + ' ms (budget ' + BUDGET.bootMs + ' ms under ' + CPU + 'x)');
    for (const r of rows) { if (r.fps < BUDGET.fpsMin) fails.push(r.scene + ' ran at ' + r.fps + ' fps (budget ' + BUDGET.fpsMin + ')'); if (r.worst > BUDGET.worstMs) fails.push(r.scene + ' had a ' + r.worst + ' ms frame (budget ' + BUDGET.worstMs + ')'); }
    if (out.input && out.input.stickMs > BUDGET.inputMs) fails.push('touch to keys took ' + out.input.stickMs + ' ms');
  }
} catch (e) { fails.push('mobile-perf failed to run: ' + e.message); }
finally { await pg.close(); }
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); process.exit(1); }
console.log('mobile perf: inside the budget at ' + CPU + 'x CPU on a ' + W + 'x' + H + ' phone.');
