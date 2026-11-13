/* tools/saltlook-stills.mjs <outdir> [only,names] - SALTREACH STILLS AT THE NAMED PLACES (claude/saltlook). Not in the suite. BRACKEN_LW3=1 LW3=1.
   Each shot: hero (god mode) put at a tile, optional bay tide phase (the sim runs until the bay is low / high), a few frames for the camera, then a NATIVE 2x still (629x311 buffer -> 1258x622, no stretch).
   Also: pool crab tell + strike by mode (frame by frame). Prints the page's console errors. */
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2], only = (process.argv[3] || '').split(',').filter(Boolean); mkdirSync(out, { recursive: true });
const SHOTS = [
  { n: 'spawn', tp: [3, 7], face: 1, pre: 120 },
  { n: 'river-seam-left', tp: [352, 25], face: 1, tide: 'low' },
  { n: 'seam-366', tp: [366, 24], face: 1, tide: 'low' },
  { n: 'seam-366-high', tp: [366, 24], face: 1, tide: 'high' },
  { n: 'seam-right', tp: [378, 22], face: 1, tide: 'low' },
  { n: 'quay-village', tp: [376, 22], face: 1, tide: 'low' },
  { n: 'quay-village-b', tp: [402, 22], face: -1, tide: 'high' },
  { n: 'bell-410', tp: [408, 22], face: 1, tide: 'low' },
  { n: 'bell-410-toll', tp: [408, 22], face: 1, tide: 'low', atk: 22 },
  { n: 'sluice-502', tp: [500, 22], face: 1, tide: 'low' },
  { n: 'sluice-502-held', tp: [500, 22], face: 1, tide: 'low', atk: 150 },
  { n: 'sluice-race-460', tp: [458, 27], face: 1 },
  { n: 'pools-low', tp: [430, 30], face: 1, tide: 'low' },
  { n: 'pools-high', tp: [430, 30], face: 1, tide: 'high' },
  { n: 'boat-cove-b1', tp: [381, 22], face: 1, tide: 'high', pre: 200 },
  { n: 'mill-bluff', tp: [468, 26], face: 1, tide: 'low' },
  { n: 'mill-bluff-b', tp: [454, 22], face: -1, tide: 'low' },
  { n: 'trap-526', tp: [524, 19], face: 1, tide: 'low' },
  { n: 'piers-b4', tp: [617, 24], face: 1, tide: 'low' },
  { n: 'lighthouse', tp: [641, 23], face: 1, tide: 'low' },
  { n: 'lighthouse-high', tp: [641, 23], face: 1, tide: 'high' },
  { n: 'herald-arena', tp: [651, 29], face: 1, pre: 30 },
  { n: 'herald-arena-stones', tp: [667, 29], face: 1, pre: 30 },
];
const pg = await openPage({ fonts: false, seed: 11, hints: 'none' });
const shot = async (name) => { const d = await pg.evalp(`(() => { const c = document.createElement('canvas'), b = BK.buf; c.width = b.width * 2; c.height = b.height * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height); return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, 'look-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  const fresh = () => pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.load(__LV.findIndex(l => l.id === 'longwater')); BK.start(); BK.god = true; BK.sim(30); return true; })()`);
  const bayPh = () => pg.evalp(`BK.pirateFleet().tides.find(t => t.id === 'bay').ph`);
  await fresh();
  for (const s of SHOTS) {
    if (only.length && !only.includes(s.n)) continue;
    await pg.evalp(`(() => { BK.tp(${s.tp[0]}, ${s.tp[1]}); BK.P.face = ${s.face}; return true; })()`);
    if (s.tide) { for (let i = 0; i < 40; i++) { const ph = await bayPh(); if (s.tide === 'low' ? (ph === 'low') : (ph === 'high')) break; await pg.evalp(`(() => { for (let k = 0; k < 90; k++) { BK.sim(1); } BK.tp(${s.tp[0]}, ${s.tp[1]}); return true; })()`); } }
    await pg.evalp(`(() => { BK.sim(${s.pre || 330}); BK.P.face = ${s.face}; ${s.atk ? `BK.press('atk'); BK.step(1); for (let k = 0; k < ${s.atk}; k++) BK.step(1);` : 'BK.step(1);'} return true; })()`);
    await shot(s.n); const st = await pg.evalp(`JSON.stringify({ hero: [Math.round(BK.P.x / 16 * 10) / 10, Math.round(BK.P.y / 16 * 10) / 10], bay: BK.pirateFleet().tides[0].ph + ' k' + BK.pirateFleet().tides[0].k.toFixed(2) })`); console.log(s.n, st);
  }
  /* POOL CRAB: tell + strike by mode */
  if (!only.length || only.includes('crab')) {
    await fresh(); await pg.evalp(`(() => { BK.tp(428, 31); BK.sim(30); return true; })()`);
    for (let i = 0; i < 40; i++) { if ((await bayPh()) === 'low') break; await pg.evalp(`(() => { for (let k = 0; k < 90; k++) BK.sim(1); BK.tp(428, 31); return true; })()`); }
    await pg.evalp(`(() => { BK.P.hp = BK.P.maxHp = 9999; BK.sim(20); return true; })()`);
    const seen = new Map(), log = []; let last = null;
    for (let f = 0; f < 60 * 60 && seen.size < 6; f++) {
      const s = await pg.evalp(`(() => { const hs = BK.enemies().filter(e => e.t === 'poolcrab' && e.alive); const P = BK.P; hs.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x)); const e = hs[0]; if (!e) return null; return { id: Math.round(e.x), mode: e.mode, mt: +(e.modeT || 0).toFixed(2), x: Math.round(e.x), y: Math.round(e.y), face: e.face, d: Math.round(e.x - P.x) }; })()`);
      if (!s) { console.log('no crab'); break; }
      if (s.mode !== last) { last = s.mode; log.push([f, s.mode, s.d]); const n = (seen.get(s.mode) || 0) + 1; seen.set(s.mode, n);
        if (n <= 2) { await shot('crab-' + s.mode + '-a' + n); if (/Tell|pinch/.test(s.mode) && n === 1) { for (let k = 0; k < 8; k++) await pg.evalp('BK.step(1)'); await shot('crab-' + s.mode + '-held'); } } }
      await pg.evalp('BK.step(1)');
      if (f % 150 === 149) await pg.evalp(`(() => { const hs = BK.enemies().filter(e => e.t === 'poolcrab' && e.alive); const e = hs[Math.floor(Math.random() * hs.length)]; BK.P.x = e.x - 30 * (Math.random() < 0.5 ? 1 : -1); BK.P.y = e.y - 4; return 1; })()`);
    }
    console.log('crab modes', JSON.stringify([...seen]), JSON.stringify(log.slice(0, 40)));
  }
  console.log('console errors:', JSON.stringify((pg.errors || []).slice(0, 10)));
} finally { await pg.close(); }
