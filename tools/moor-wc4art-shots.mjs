/* tools/moor-wc4art-shots.mjs [tag] [spot,spot] - THE WINDCALLER 4 ART PASS (claude/windcaller4art): the page's own buffer at named spots, 2x, saved
   to scratch/lane-reports/windcaller4art-<tag>-<spot>.png (beside the repo) and docs/windcaller4art/<tag>-<spot>.png. 'sheet' = his baked frames on one sheet.
   Boss poses are forced (mode + a long modeT, one step) - the picture is the pose, not the fight. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'art', only = process.argv[3] ? process.argv[3].split(',') : null;
const out1 = join(ROOT, '..', 'scratch', 'lane-reports'), out2 = join(ROOT, 'docs/windcaller4art'); mkdirSync(out1, { recursive: true }); mkdirSync(out2, { recursive: true });
const pg = await openPage();
const snap = (s = 2) => `(() => { const c = document.createElement('canvas'); c.width = 320 * ${s}; c.height = 180 * ${s}; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); return c.toDataURL('image/png'); })()`;
const save = (name, png) => { for (const d of [out1, out2]) writeFileSync(join(d, (d === out1 ? 'windcaller4art-' : '') + tag + '-' + name + '.png'), Buffer.from(png.split(',')[1], 'base64')); console.log('shot', name); };
const want = n => !only || only.includes(n);
const boot = `const i = __LV.findIndex(l => l.id === 'moor'); BK.load(i); BK.start(); BK.god = true; BK.sim(300);`;
const clear = `for (const e of BK.enemies()) if (!e.elite && e.t !== 'windcaller') e.alive = false;`;
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); return true; })()`);
  if (want('sheet')) { await pg.evalp('window.__SF=' + (process.env.SF || 0) + ';window.__SS=' + (process.env.SS || 4)); const d = await pg.evalp(`import('/src/redraw/callerram.js').then(M => { const S = M.bakeWindcaller(), N0 = +(window.__SF || 0), n = S.R.length - N0, c = document.createElement('canvas'), SC = +(window.__SS || 4); c.width = n * 44 * SC + 8; c.height = 50 * SC * 2 + 12; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#4a5a6a'; g.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#56667a' : '#4e5e72'; g.fillRect(4 + i * 44 * SC, 4, 44 * SC, 50 * SC); g.drawImage(S.R[i + N0], 4 + i * 44 * SC, 4, 44 * SC, 50 * SC); g.drawImage(S.white.R[i + N0], 4 + i * 44 * SC, 8 + 50 * SC, 44 * SC, 50 * SC); g.fillStyle = '#fff'; g.font = '12px monospace'; g.fillText(String(i + N0), 8 + i * 44 * SC, 16); }
      return c.toDataURL('image/png'); })`, 60000); save('sheet', d); }
  const spots = [['start', 3, 21], ['stair-shelf', 651, 12], ['stair-crag', 662, 6], ['stair-gap', 676, 6], ['stair-gully', 688, 6], ['landing', 699, 12], ['corner', 745, 12], ['pit', 736, 12], ['gully', 689, 14]];
  for (const [name, x, y] of spots) { if (!want(name)) continue;
    const d = await pg.evalp(`(() => { ${boot} BK.tp(${x}, ${y}); BK.sim(40); ${clear} for (let k = 0; k < 300; k++) { BK.P.inv = 9; BK.step(1); } return { png: ${snap()} }; })()`);
    save(name, d.png); }
  if (want('stair-gust')) { const d = await pg.evalp(`(() => { ${boot} BK.tp(651, 12); BK.sim(40); ${clear} for (let k = 0; k < 200; k++) { BK.P.inv = 9; BK.step(1); }
      const W = BK.callerWind && BK.callerWind(); let g = 0; for (let k = 0; k < 900; k++) { BK.P.inv = 9; BK.step(1); const v = BK.L.gusts.find(z => z.stair); if (v) { const ph = ((BK.time + (v.phase || 0)) % v.period); if (ph > 0.6 && ph < 1.2) { g = 1; break; } } }
      return { png: ${snap()}, g }; })()`); save('stair-gust', d.png); }
  /* the summit: the boss in each pose */
  const modes = [['idle', null], ['hurlTell', 'hurlTell'], ['devilTell', 'devilTell'], ['draftTell', 'draftTell'], ['bladeTell', 'bladeTell'], ['blastTell', 'blastTell'], ['howlTell', 'howlTell'], ['reel', 'reel'], ['fallen', 'fallen'], ['rise', 'rise'], ['cast', 'cast']];
  for (const [name, mode] of modes) { if (!want('boss-' + name) && !(only === null)) continue;
    const d = await pg.evalp(`(() => { ${boot} const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 4, Math.round(A.floor / 16) - 1); BK.sim(60); ${clear}
      for (let k = 0; k < 120; k++) { BK.P.inv = 9; BK.step(1); }
      const b = BK.boss; if (!b) return { none: true };
      b.x = (704 + 13) * 16 + 8; b.y = 7 * 16; const M = ${JSON.stringify(mode)};
      if (M === 'reel') { b.reelT = 0.2; b.hits = 1; b.mode = 'cast'; b.castT = 9; } else if (M === 'fallen') { b.mode = 'fallen'; b.modeT = 9; b.y = A.floor; b.x = (704 + 14) * 16; b.fallHp = b.hp; b.fellT = 1; }
      else if (M === 'rise') { b.mode = 'rise'; b.modeT = 9; b.riseX = b.x + 80; b.riseY = b.y - 10; b.hp = b.hp; }
      else if (M === 'cast') { b.mode = 'cast'; b.castT = 9; b.castFlash = 0.2; }
      else if (M) { b.mode = M; b.modeT = 9; b.tellLen = 9; } else { b.mode = 'cast'; b.castT = 9; }
      if (M !== 'fallen' && M !== 'rise') b.y = 7 * 16; BK.P.inv = 9; BK.step(1);
      return { png: ${snap()}, mode: b.mode, x: b.x, y: b.y }; })()`);
    if (d.none) { console.log('no boss'); break; } save('boss-' + name, d.png); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
