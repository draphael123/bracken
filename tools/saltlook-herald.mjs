/* tools/saltlook-herald.mjs <outdir> [secs=240] - THE TIDE HERALD IN REAL MOVES, STILLS AT EVERY TELL AND RELEASE (claude/saltlook). Not in the suite. BRACKEN_LW3=1 LW3=1.
   God-mode hero in the arena; the page steps frame by frame (one evaluation a frame); at the first frame of each new boss mode (and a mid-tell frame, and release+5) a NATIVE 2x still is saved
   (629x311 buffer -> 1258x622); for a release a second still carries the move's hitbox (src/tide-herald.js numbers, feet = e.y) as a red outline. The hero is moved between ranges so every move comes
   out; phase 2 from frame 3600 (hp set to 45%). Afterwards the modes the fight did not bring out by itself (mired, reel, callTell, a hurt flash) are FORCED by setting e.mode: pose only. */
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2], secs = +(process.argv[3] || 240); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true, fonts: false, seed: 11, hints: 'none' });
const HB = { sweep: (e, f) => [e.x + (f > 0 ? -6 : -62), e.x + (f > 0 ? 62 : 6), e.y - 14, e.y + 4], thrust: (e, f) => [e.x + (f > 0 ? 0 : -112), e.x + (f > 0 ? 112 : 0), e.y - 30, e.y - 6],
  mael: (e, f) => [e.x - 20, e.x + 20, e.y - 30, e.y + 4] };
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.load(__LV.findIndex(l => l.id === 'longwater')); BK.start(); BK.god = true; BK.sim(60); BK.tp(655, 29); BK.sim(330);
    window.__shot = (hb) => { const b = BK.buf, c = document.createElement('canvas'); c.width = b.width * 2; c.height = b.height * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height);
      const v = BK.view; if (hb) { g.strokeStyle = '#ff2a2a'; g.lineWidth = 2; g.strokeRect(Math.round((hb[0] - v.x) * 2), Math.round((hb[2] - v.y) * 2), Math.round((hb[1] - hb[0]) * 2), Math.round((hb[3] - hb[2]) * 2)); }
      return c.toDataURL('image/png'); };
    window.__H = () => BK.enemies().find(x => x.t === 'herald' && x.lw3);
    window.__S = () => { const e = __H(), P = BK.P; if (!e) return null; return { mode: e.mode, mt: +(e.modeT || 0).toFixed(2), x: Math.round(e.x), y: Math.round(e.y), face: e.face, ph: e.phase, d: Math.round(P.x - e.x) }; }; return true; })()`);
  const seen = new Map(), log = []; let frames = 0, lastMode = null, range = 0;
  const save = async (name, hb) => { const d = await pg.evalp(`__shot(${hb ? JSON.stringify(hb) : 'null'})`); writeFileSync(join(out, 'look-herald-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  const step = async n => { for (let k = 0; k < n; k++) { await pg.evalp('BK.step(1)'); frames++; } };
  const want = ['sweepTell', 'sweep', 'thrustTell', 'thrust', 'spearTell', 'spear', 'raise', 'wave', 'maelTell', 'mael', 'seize', 'rec', 'stride', 'wake'];
  let s = await pg.evalp('__S()');
  while (frames < secs * 60 && s) {
    if (s.mode !== lastMode) { log.push([frames, s.mode, s.mt, s.ph, s.d]); lastMode = s.mode;
      const n = (seen.get(s.mode) || 0) + 1; seen.set(s.mode, n);
      if (n <= 2) { await save(s.mode + '-a' + n); if (HB[s.mode]) await save(s.mode + '-a' + n + '-hitbox', HB[s.mode](s, s.face));
        if (/Tell|raise|seize/.test(s.mode) && n === 1) { await step(Math.max(4, Math.round(s.mt * 60 * 0.6))); await save(s.mode + '-held'); }
        else if (!/Tell/.test(s.mode) && n === 1) { await step(5); await save(s.mode + '-b', HB[s.mode] ? HB[s.mode](s, s.face) : null); } } }
    if (frames % 240 === 0) { range = (range + 1) % 4; const d = [40, 90, 150, 60][range], sgn = (frames / 240) % 2 ? 1 : -1; await pg.evalp(`(() => { const e = __H(); BK.P.x = e.x + ${sgn} * ${d}; BK.P.y = e.y - 6; BK.P.vx = 0; BK.P.vy = 0; return 1; })()`); }
    if (frames === 3600) await pg.evalp(`(() => { const e = __H(); e.hp = Math.round(e.maxHp * 0.45); return 1; })()`);
    await step(1); s = await pg.evalp('__S()');
    if (want.every(w => seen.has(w))) { console.log('all natural modes seen at frame', frames); break; }
  }
  /* forced poses */
  for (const m of ['mired', 'reel', 'callTell']) {
    await pg.evalp(`(() => { const e = __H(); e.mode = ${JSON.stringify(m)}; e.modeT = 3; e.hurtT = 0; return 1; })()`); await step(3); await save(m + '-forced');
    await step(30); await save(m + '-forced-b'); }
  await pg.evalp(`(() => { const e = __H(); e.mode = 'stride'; e.modeT = 1; e.vx = 0; e.hurtT = 0.25; e.flash = 0.25; return 1; })()`); await step(1); await save('hurt-flash-forced');
  console.log('seen', JSON.stringify([...seen])); console.log('log', JSON.stringify(log.slice(0, 80)));
  console.log('errors', JSON.stringify((pg.errors || []).slice(0, 5)));
} finally { await pg.close(); }
