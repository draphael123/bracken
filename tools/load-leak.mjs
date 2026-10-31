// tools/load-leak.mjs - A PAGE THAT LOADS LEVEL AFTER LEVEL DOES NOT GROW (claude/loadleak, 10-16).
// Every BK.load bakes the level's tiles, props and backdrop again (~750 canvases). The sheets of the bake before were simply dropped, and a
// dropped canvas keeps its native memory until a MAJOR garbage collection, which V8 (it cannot see that memory) is in no hurry to run: ~43 MB
// a load piled up between collections, so a tool page doing 40 loads was a ~2.7 GB renderer (the 10-16 PC hang) and a player's session
// carried hundreds of MB of dead sheets. main.js retireBakes now empties the last bake's sheets once the next level is loaded. This holds it:
//   1. GROWTH. A set of levels is loaded once (their one-time caches may fill), then CYCLES rounds of the set, all of a round's loads in one
//      evaluation the way the tools do it, with NO collection forced: the renderer's peak private memory may grow at most BUDGET MB a load
//      (~43 before the fix, ~10 after: what is left is ordinary JS garbage and the small objects the collector takes in its own time).
//      The same rounds again with a collection after each: what a load KEEPS, at most KEPT MB a load (~2 now; a real leak shows here).
//      The renderer is found by the browser's own process list (SystemInfo.getProcessInfo), its memory by the OS.
//   2. NOTHING STILL HOLDS A SHEET IT GAVE BACK. Every level is loaded (and drawn: a draw-time cache is a holder too) once with the audit on (main.js: a weak note of each emptied sheet);
//      after a full collection any of them still alive is held by something other than the bake that made it, and would be drawn empty: a
//      FAIL with the count, so a new cache that keeps a baked sheet is caught here and added to retireBakes' roots instead of shipping blank.
//   node tools/load-leak.mjs [--budget=20] [--kept=5] [--cycles=5]
import { openPage } from './cdp.mjs';
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const BUDGET = +arg('budget', 20), KEPT = +arg('kept', 5), CYCLES = +arg('cycles', 5);
const SET = ['wood', 'marsh', 'stockade', 'moor', 'crown', 'reef'];   /* a forest, a marsh, a fort, a moor, a redressed castle, a sea level */
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };

/* THE RENDERER'S PRIVATE MEMORY, MB: its pids from the browser itself, their memory from the OS */
async function rendererPids(dbg) {
  const v = await (await fetch('http://127.0.0.1:' + dbg + '/json/version', { signal: AbortSignal.timeout(5000) })).json();
  const ws = new WebSocket(v.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  try { const r = await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('SystemInfo.getProcessInfo did not answer')), 10000);
      ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id === 1) { clearTimeout(t); m.error ? rej(new Error(m.error.message)) : res(m.result); } };
      ws.send(JSON.stringify({ id: 1, method: 'SystemInfo.getProcessInfo' })); });
    return r.processInfo.filter(p => p.type === 'renderer').map(p => p.id); } finally { try { ws.close(); } catch { } }
}
function privMB(pids) {
  if (!pids.length) return 0;
  if (process.platform === 'win32') { const o = execFileSync('powershell', ['-NoProfile', '-Command', 'foreach ($i in @(' + pids.join(',') + ')) { $p = Get-Process -Id $i -ErrorAction SilentlyContinue; if ($p) { [int]($p.PrivateMemorySize64 / 1MB) } }; exit 0'], { encoding: 'utf8', windowsHide: true });
    return Math.max(0, ...o.trim().split(/\s+/).filter(Boolean).map(Number)); }
  if (process.platform === 'linux') return Math.max(0, ...pids.map(p => { try { const m = /RssAnon:\s+(\d+)/.exec(readFileSync('/proc/' + p + '/status', 'utf8')); return m ? Math.round(+m[1] / 1024) : 0; } catch { return 0; } }));
  const o = execFileSync('ps', ['-o', 'rss=', '-p', pids.join(',')], { encoding: 'utf8' }); return Math.max(0, ...o.trim().split(/\s+/).filter(Boolean).map(n => Math.round(+n / 1024)));
}

const pg = await openPage({ audio: false, fonts: false, args: ['--js-flags=--expose-gc --max-old-space-size=2048'] });
try {
  const ids = await pg.evalp(`(async () => { window.__LV = (await import('/src/level.js')).LEVELS; BK.manualSimulation = true; BK.god = true; return __LV.map(l => l.id); })()`);
  const set = SET.map(id => ids.indexOf(id)).filter(i => i >= 0);
  ok(set.length >= 4, 'only ' + set.length + ' of the growth set are levels: ' + SET.join(','));
  const pids = await rendererPids(pg.dbg); ok(pids.length > 0, 'no renderer process found');
  if (process.env.LOADLEAK_DEBUG) console.log('renderers', pids.join(','), pids.map(p => privMB([p])).join(','));
  const loadAll = list => pg.evalp(`(() => { for (const i of ${JSON.stringify(list)}) { BK.load(i); BK.state = 'play'; BK.sim(30); } return 1; })()`, 600000);
  /* 1. GROWTH, twice over the same loads: with no collection forced (what a tool page or a long session meets: the dead sheets of each load
     pile up until V8 happens to collect) and with one after every round (what a load KEEPS: a real leak) */
  const collect = () => pg.evalp(`(async () => { gc(); await new Promise(r => setTimeout(r, 200)); gc(); await new Promise(r => setTimeout(r, 200)); return 1; })()`);
  await loadAll(set);   /* the warm-up: every one-time cache these levels fill is filled */
  const loads = CYCLES * set.length;
  for (const forced of CYCLES > 0 ? [false, true] : []) {
    await collect(); const m0 = privMB(pids); let peak = m0; const trail = [m0];
    for (let c = 0; c < CYCLES; c++) { await loadAll(set); if (forced) await collect(); const m = privMB(pids); trail.push(m); peak = Math.max(peak, m);
      if (process.env.LOADLEAK_DEBUG) console.log('  round', c, m, 'MB; js heap', await pg.evalp('(performance.memory.totalJSHeapSize/1048576).toFixed(0) + " MB, used " + (performance.memory.usedJSHeapSize/1048576).toFixed(0)')); }
    const per = (peak - m0) / loads, budget = forced ? KEPT : BUDGET;
    console.log((forced ? 'kept   ' : 'growth ') + loads + ' loads of ' + set.map(i => ids[i]).join(',') + (forced ? ', a collection after each round: ' : ', no collection forced: ') + trail.join(' -> ') + ' MB (peak +' + (peak - m0) + ' MB, ' + per.toFixed(1) + ' MB a load; budget ' + budget + ')');
    ok(per <= budget, forced ? 'the renderer KEPT ' + per.toFixed(1) + ' MB a load over ' + loads + ' loads with a collection after every round (budget ' + budget + ' MB): something a level load makes is never let go'
      : 'the renderer grew ' + per.toFixed(1) + ' MB a load over ' + loads + ' loads (budget ' + budget + ' MB; ~43 before claude/loadleak): a level load is leaving dead native memory for the collector again (main.js retireBakes, src/px.js bakeScope)');
  }
  /* 2. NOTHING STILL HOLDS A RETURNED SHEET */
  /* The audit used to load every level in ONE evaluation (~170 loads, 900 s bound): it hung on master and crashed the page after harnessstall. Now CHUNK levels at a time (the floats tool
     does the same), a collection after each chunk, a time bound per chunk and a bound on the renderer's private memory; the per-chunk result is printed. A sheet given back is judged at the end of its
     own chunk (weak notes do not keep it alive, so chunking changes nothing but the peak). */
  const CHUNK = +arg('chunk', 7), CHUNK_MS = +arg('chunk-ms', 120000), HEAP_MB = +arg('heap', 3000);
  const a = { n: 0, held: 0, at: [], levels: ids.length, bad: [] }, t0 = Date.now(); let chunks = 0;
  for (let from = 0; from < ids.length; from += CHUNK) {
    const to = Math.min(ids.length, from + CHUNK), tc = Date.now();
    const r = await pg.evalp(`(async () => { window.__bakeAudit = []; const bad = [];
      for (let i = ${from}; i < ${to}; i++) { try { BK.load(i); BK.state = 'play'; BK.sim(5); BK.step(2); } catch (e) { bad.push(__LV[i].id + ': ' + String(e && e.message || e).slice(0, 80)); } await new Promise(r => setTimeout(r, 0)); }
      /* the collections run from a timer at the bottom of the stack, several apart: a collector that scans the stack conservatively can keep a stray object or two alive for one
         collection (seen: 2 of 46,000, a different two each run), and only a sheet that something really holds is still there after all of them */
      BK.load(0);   /* retireBakes empties a bake once the NEXT level is loaded: load a neutral one so the chunk's last level is retired too and judged here */
      for (let k = 0; k < 6; k++) await new Promise(r => setTimeout(() => { gc(); r(); }, 100));
      const still = __bakeAudit.filter(r => r.w.deref()), held = still.length, n = __bakeAudit.length; window.__bakeAudit = null; return { n, held, at: [...new Set(still.map(r => r.at))].slice(0, 6), bad, heap: +(performance.memory.usedJSHeapSize / 1048576).toFixed(0) }; })()`, CHUNK_MS).catch(e => ({ err: e.message }));
    chunks++;
    if (r.err) { fails.push('audit chunk ' + ids[from] + '..' + ids[to - 1] + ' (levels ' + from + '-' + (to - 1) + ') did not finish within ' + CHUNK_MS / 1000 + ' s / the page died: ' + r.err); break; }
    const mb = privMB(pids); a.n += r.n; a.held += r.held; a.at.push(...r.at); a.bad.push(...r.bad);
    console.log('  audit chunk ' + chunks + ' levels ' + from + '-' + (to - 1) + ' (' + ids[from] + '..' + ids[to - 1] + '): ' + r.n + ' sheets, ' + r.held + ' held, js heap ' + r.heap + ' MB, renderer ' + mb + ' MB, ' + ((Date.now() - tc) / 1000).toFixed(1) + ' s');
    if (mb > HEAP_MB) { fails.push('audit stopped after chunk ' + chunks + ': renderer private memory ' + mb + ' MB is over the ' + HEAP_MB + ' MB bound (levels ' + from + '-' + (to - 1) + ')'); break; }
  }
  a.at = [...new Set(a.at)].slice(0, 6);
  console.log('audit: ' + a.levels + ' levels loaded in ' + chunks + ' chunks of ' + CHUNK + ' (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s), ' + a.n + ' baked sheets given back, ' + a.held + ' of them still held after a collection');
  if (!fails.length) ok(a.n > a.levels * 100, 'only ' + a.n + ' sheets were given back over ' + a.levels + ' loads: retireBakes is not running');
  ok(a.held === 0, a.held + ' sheets given back (emptied) are still held by something: they would draw empty (baked as ' + a.at.join(', ') + '). Add their holder to main.js retireBakes\' roots');
  ok(!a.bad.length, a.bad.length + ' levels threw on load: ' + a.bad.slice(0, 3).join(' | '));
  ok(!pg.errors.length, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
} catch (e) { fails.push('load-leak failed to run: ' + e.message); }
finally { await pg.close(); }
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); process.exit(1); }
console.log('load-leak ok: growth within ' + BUDGET + ' MB a load, every returned sheet free');
