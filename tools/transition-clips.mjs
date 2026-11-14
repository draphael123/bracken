// PAGE TOOL: launches headless Chrome
/* tools/transition-clips.mjs - REVIEW CLIPS of every demo level transition (claude/transland, Daniel 11-06).
   One clip per row of TABLE, real time at the game's own speed, from the boss kill (a gate row: from the party standing at the gate) to control on the arrival
   (the Kingswood > Burning Village row: to the world map). The page records its own canvas (captureStream + MediaRecorder -> .webm); ffmpeg turns it into an
   .mp4 (phones play it) when it can be found.
     node tools/transition-clips.mjs --out=<dir> [--only=<from>><to>[,..]]
   Needs ffmpeg (PATH, or FFMPEG=<exe>), one headless page at a time. A failed row is listed and the next one goes on. */
import { mkdirSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import * as TRM from '../src/transitions.js';
const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').slice(k.length + 3);
const OUT = arg('out'); if (!OUT) { console.log('usage: --out=<dir>'); process.exit(2); } mkdirSync(OUT, { recursive: true });
const only = arg('only') ? arg('only').split(',') : null;
const FF = process.env.FFMPEG || 'ffmpeg';
const { openPage } = await import('./cdp.mjs');
const results = [];
const rows = TRM.TABLE.map((e, i) => ({ e, n: String(i + 1).padStart(2, '0'), key: e.from + '>' + e.to })).filter(r => !only || only.includes(r.key));
for (const { e, n, key } of rows) {
  const name = n + '-' + e.from + '-' + e.to, webm = join(OUT, name + '.webm'), mp4 = join(OUT, name + '.mp4');
  const burning = e.from === 'kings' ? e.to === 'burning' : undefined;
  let pg = null;
  try {
    pg = await openPage({ audio: false, speed: false });
    const r = await pg.evalp(`(async()=>{ const from = ${JSON.stringify(e.from)}, burning = ${JSON.stringify(burning)}; const { LEVELS } = await import('/src/level.js'); const sleep = ms => new Promise(r => setTimeout(r, ms));
      const out = { ok: false };
      BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); delete BK.PROG.transSeen; BK.SET.transitions = 'always'; BK.trans.force(true);
      if (burning === true) BK.PROG.burningOpen = 1; else if (burning === false) delete BK.PROG.burningOpen;
      BK.load(LEVELS.findIndex(l => l.id === from)); BK.start(); BK.sim(20);
      const L = BK.L, A = L.arena, cv = document.querySelector('canvas'); out.cw = cv.width; out.ch = cv.height;
      const dismiss = () => { for (let k = 0; k < 12 && BK.state === 'card'; k++) { for (let i = 0; i < 4 && BK.state === 'card'; i++) { try { BK.cardTake(i); } catch (e) {} } if (BK.state === 'card') { try { BK.cardClose(); } catch (e) {} } } };
      const gateRow = !!L.gateAfterBoss || from === 'stockade';
      let rec = null, chunks = [], t0 = 0;
      const startRec = () => { const st = cv.captureStream(30), mt = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'; rec = new MediaRecorder(st, { mimeType: mt, videoBitsPerSecond: 6000000 }); rec.ondataavailable = ev => { if (ev.data.size) chunks.push(ev.data); }; rec.start(250); t0 = performance.now(); };
      const e = BK.enemies().find(q => q.t === A.boss && q.alive); BK.god = true; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(200);
      if (!gateRow) startRec();
      for (let n = 0; n < 1500 && e && e.alive; n++) { BK.players().forEach(p => { p.inv = 99; p.hp = p.maxHp; }); e.hp = Math.min(e.hp, 1); e.inv = 0; e.open = 9; e.passThrough = true; BKT.hurtEnemy(e, 1e6, e.x + (n % 2 ? 10 : -10), n % 3 === 0); dismiss(); if (e.alive) BK.sim(6); }
      out.killed = !!e && !e.alive;
      BK.manualSimulation = false;   /* from here the page runs on its own requestAnimationFrame loop, at the game's own speed */
      let teleported = false, sawTr = false, doneAt = 0, tStart = performance.now();
      for (let i = 0; i < 1500; i++) {   /* 150 s at most */
        await sleep(100); dismiss();
        if (gateRow && !teleported && (L.gateOpen || (from === 'stockade' && performance.now() - tStart > 3000))) { const g = BK.gate; BK.players().forEach((p, k) => { p.x = g.x - k * 2; p.y = g.y; p.vx = p.vy = 0; }); teleported = true; startRec(); }
        if (BK.trans.tr) sawTr = true;
        const finished = sawTr && !BK.trans.tr && (${JSON.stringify(!!e.endOnMap)} ? (BK.state === 'map') : (BK.state === 'play' && BK.trans.arrive && BK.trans.arrive.done));
        if (finished && !doneAt) doneAt = performance.now();
        if (doneAt && performance.now() - doneAt > 1500) break;
      }
      out.sawTr = sawTr; out.finished = !!doneAt; out.state = BK.state; out.lvl = BK.trans.levelId();
      if (!rec) return out;
      await new Promise(r => { rec.onstop = r; rec.stop(); }); out.secs = (performance.now() - t0) / 1000;
      const blob = new Blob(chunks, { type: 'video/webm' }); out.bytes = blob.size;
      out.b64 = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); });
      out.ok = out.sawTr && out.finished; return out; })()`, 400000);
    if (r.b64) writeFileSync(webm, Buffer.from(r.b64, 'base64'));
    const errs = pg.errors.filter(x => !/favicon/.test(JSON.stringify(x)));
    let size = 0, note = '';
    if (existsSync(webm)) {
      const vf = 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p', args = ['-y', '-loglevel', 'error', '-i', webm, '-vf', vf, '-c:v', 'libx264', '-crf', '27', '-preset', 'medium', '-r', '30', '-movflags', '+faststart', '-an', mp4];
      const f = spawnSync(FF, args, { encoding: 'utf8' }); if (f.status !== 0) note = 'ffmpeg failed: ' + (f.stderr || f.error || '').toString().slice(0, 200);
      size = existsSync(mp4) ? statSync(mp4).size : statSync(webm).size;
    }
    results.push({ name, ok: !!r.ok, secs: r.secs, size, note: note || (r.ok ? '' : JSON.stringify({ ...r, b64: undefined })), errs: errs.length });
    console.log((r.ok ? 'ok   ' : 'FAIL ') + name + '  ' + (r.secs || 0).toFixed(1) + ' s  ' + (size / 1e6).toFixed(2) + ' MB  ' + note);
  } catch (err) { results.push({ name, ok: false, note: String(err && err.message || err) }); console.log('FAIL ' + name + '  ' + (err && err.message)); }
  finally { try { pg && pg.close(); } catch {} }
}
writeFileSync(join(OUT, 'clips.json'), JSON.stringify(results, null, 1));
process.exit(results.some(x => !x.ok) ? 1 : 0);
