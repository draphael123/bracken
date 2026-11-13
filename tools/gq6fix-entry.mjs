/* tools/gq6fix-entry.mjs - GQ6FIX item 1: the tower-top (phase 2) entry, timed in a real page.
   Drives the hall -> escape skip -> roof (the lab's own skip, same toRoof as the real portal step), then logs each 0.25 s: her mode / hidden / x, the hero x,
   and the first 'told action' (a mode ending Tell, or the teach shard). Arrival = the frame toRoof ran. The hero STANDS STILL (no walking) so a trigger column would show.
   node tools/gq6fix-entry.mjs [outDir] [--off]   (--off = BRACKEN_GQ6FIX=0 where the flag exists) */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
const a = process.argv.slice(2), dir = resolve(ROOT, a.find(x => !x.startsWith('--')) || 'work/claude/shots/gq6fix'); mkdirSync(dir, { recursive: true });
if (a.includes('--off')) process.env.BRACKEN_GQ6FIX = '0';
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const log = []; const shots = {};
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const snap = id => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); };
    const hold = () => { BK.P.hp = BK.P.maxHp; }; const run = k => { for (let i = 0; i < k; i++) { hold(); BK.step(1); } };
    BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.state = 'play'; BK.god = false; BK.step(5);
    const A0 = BK.L.arena; BK.tp(Math.round(A0.trigger / 16) + 1, Math.round(A0.floor / 16) - 1);
    run(300); let q = BK.boss; q.hp = 2; const hu = BK.hurt || (BK.env && BK.env().hurt); if (hu) hu(q, 50, BK.P.x); run(140);
    const H = BK.gqHands(); const ok = H.skipRoof(); const P = BK.P;
    const G52 = H.q52 && H.q52();
    log.push('skipRoof ' + ok + ' stage ' + q.stage + ' hero x ' + Math.round(P.x) + ' y ' + Math.round(P.y) + ' her x ' + Math.round(q.x) + ' hidden ' + q.hidden + ' mode ' + q.mode + ' arena x0 ' + BK.L.arena.x0 + ' x1 ' + BK.L.arena.x1 + ' floor ' + BK.L.arena.floor + ' trigger ' + BK.L.arena.trigger);
    let first = null, snapped = {}; const seen = {};
    for (let f = 0; f <= 60 * 14; f++) { hold(); BK.step(1); const s = f / 60;
      const m = q.mode; const st = G52 && G52.state && G52.state(); const sh = st && st.teach && st.teach.shard;
      if (f % 15 === 0 || m !== seen.m) { log.push(s.toFixed(2) + 's mode ' + m + ' hidden ' + !!q.hidden + ' her x ' + Math.round(q.x) + ' hero x ' + Math.round(P.x) + ' shard ' + (sh ? Math.round(sh.x) : '-') + ' hp ' + Math.round(q.hp)); seen.m = m; }
      if (!first && (/Tell$/.test(m) || sh)) { first = { s, m: sh ? 'teach shard' : m }; }
      for (const t of [0.5, 2, 4, 6]) if (s >= t && !snapped[t]) { snapped[t] = 1; snap('t' + t); } }
    log.push('FIRST TOLD ACTION ' + JSON.stringify(first)); return { log, shots }; })()`, 300000);
  console.log(d.log.join('\n')); for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, 'entry-' + id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
