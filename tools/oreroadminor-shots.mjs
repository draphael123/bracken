// tools/oreroadminor-shots.mjs - THE ORE ROAD MINOR PASS (lane claude/oreroadminor, Daniel 10-26): pictures + a proof that the new verbs WORK on the real page.
// usage: PORT=6604 node tools/oreroadminor-shots.mjs <tag> [before]     (pictures to work/oreroadminor/<tag>/, a JSON line per probe to stdout)
//   'before' only takes the pictures that exist on master too (the same spots, no new verbs): run it from a checkout of master.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', before = process.argv[3] === 'before';
const out = join(ROOT, 'work/oreroadminor', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
let n = 0;
const snap = `(() => { BK.step(1); const v = BK.view, c = document.createElement('canvas'); c.width = v.VW * 3; c.height = v.VH * 3; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(v.buf, 0, 0, c.width, c.height); return c.toDataURL('image/png'); })()`;
const save = async (name) => { const png = await pg.evalp(snap); const f = String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('shot', 'work/oreroadminor/' + tag + '/' + f); };
const go = (x, y, frames = 80, hero = 'knight') => pg.evalp(`(async () => { BK.god = true; BK.tp(${x}, ${y}); for (let k = 0; k < ${frames}; k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } return true; })()`);
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__i = M.LEVELS.findIndex(l => l.id === 'oreroad'); return true; })`);
  await pg.evalp(`(async () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(window.__i); BK.start(); BK.god = true; BK.sim(120); return true; })()`);
  /* THE LOADING HOUSE */
  await go(55, 36, 120); await save('house-dark');
  if (!before) {
    const r = await pg.evalp(`(async () => { const W = BK.owk(), d = W.data(); const lp = d.lamps[0]; BK.tp(58, 36); BK.sim(30); BK.face = 1; const P = BK.P; P.face = 1; P.x = lp.x - 14; P.y = ${37 * 16}; for (let k = 0; k < 4; k++) { BK.press('atk'); BK.sim(8); } BK.sim(40); return { lit: d.lamps[0].lit, zoneDark: BK.L.darkZones[0].dark, pit: BK.props().filter(p => p.t === 'minerlamp' && p.x > 52 * 16 && p.x < 68 * 16 && p.y > 30 * 16).map(p => p.lit) }; })()`);
    console.log('house sword strike', JSON.stringify(r)); await go(55, 36, 120); await save('house-lit');
  } else { await save('house-lit'); }
  /* THE SORTING DECK */
  await pg.evalp(`(async () => { BK.reset(); return true; })()`);
  await go(147, 28, 120); await save('deck-dark');
  if (!before) {
    const r = await pg.evalp(`(async () => { const W = BK.owk(), d = W.data(), P = BK.P; const hp = d.heaps.find(h => Math.abs(h.x - 148 * 16 - 8) < 4);
      P.x = hp.x; P.y = hp.y; P.face = 1; BK.sim(4); BK.press('talk'); BK.sim(6); const took = W.held(); const lp = d.lamps[1]; const res = [];
      /* find where a throw lights it: walk the hero east until the told arc ends on the lamp, then throw */
      for (let x = Math.round(lp.x) - 140; x < Math.round(lp.x) + 4 && !lp.lit; x += 3) { P.x = x; P.y = hp.y; P.vx = 0; BK.sim(2); if (!W.held()) { P.x = hp.x; BK.sim(2); BK.press('talk'); BK.sim(4); P.x = x; BK.sim(2); } BK.press('atk'); BK.sim(80); if (lp.lit) res.push(x); }
      return { took, lit: lp.lit, from: res, dark: BK.L.darkZones[1].dark, thrown: W.n.thrown }; })()`);
    console.log('deck rock throw', JSON.stringify(r)); await go(160, 28, 140); await save('deck-lit');
  } else { await save('deck-lit'); }
  /* THE LIFTS (taught: floor -> mid deck) */
  if (!before) {
    const r = await pg.evalp(`(async () => { const W = BK.owk(), d = W.data(), P = BK.P, out = []; const lf = d.lifts[0], hp = d.heaps.find(h => Math.abs(h.x - (lf.x - 54)) < 4);
      for (let x = Math.round(lf.g.ax) - 120; x < Math.round(lf.g.ax) + 2 && lf.state === 'rest'; x += 3) { P.x = hp.x; P.y = hp.y; P.face = 1; BK.sim(2); if (!W.held()) { BK.press('talk'); BK.sim(6); } P.x = x; P.y = hp.y; P.vx = 0; BK.sim(2); BK.press('atk'); BK.sim(70); if (lf.state !== 'rest') out.push(x); }
      return { from: out, state: lf.state, load: lf.load, need: lf.need, rise: lf.g.rise }; })()`);
    console.log('lift teach throw', JSON.stringify(r));
    await pg.evalp(`(async () => { BK.sim(3800); return true; })()`);   /* the ore tips out and the pan comes home */
    const rr = await pg.evalp(`(async () => { const W = BK.owk(), d = W.data(), P = BK.P, lf = d.lifts[0], hp = d.heaps.find(h => Math.abs(h.x - (lf.x - 54)) < 4); const st0 = lf.state; P.x = hp.x; P.y = hp.y; P.face = 1; BK.sim(2); BK.press('talk'); BK.sim(6);
      P.x = lf.x + 13; P.y = lf.yLow; P.face = -1; P.vx = 0; BK.sim(3); BK.press('atk'); let mid = null; for (let k = 0; k < 400 && lf.state !== 'top'; k++) { BK.sim(1); if (k === 60) mid = { y: P.y, panY: lf.m.y, on: !!P.onMover }; } BK.sim(10);
      return { st0, state: lf.state, mid, y1: P.y, onMover: !!P.onMover, panY: lf.m.y, yHigh: lf.g.yHigh }; })()`);
    console.log('lift teach ride', JSON.stringify(rr)); await save('lift-teach-top');
  } else { await go(158, 36, 60); await save('lift-spot'); }
  /* THE STEEP LINE */
  await pg.evalp(`(async () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(window.__i); BK.start(); BK.god = true; BK.sim(120); return true; })()`);
  await go(348, 20, 100); await save('steep-edge');
  await go(375, 16, 100); await save('steep-dark');
  if (!before) {
    const r = await pg.evalp(`(async () => { const W = BK.owk(), d = W.data(), P = BK.P; const lp = d.lamps[2]; const hp = d.heaps[d.heaps.length - 1]; const res = [];
      for (let x = Math.round(hp.x) - 4; x < Math.round(lp.x) + 4 && !lp.lit; x += 3) { P.x = hp.x; P.y = hp.y; P.face = 1; BK.sim(2); if (!W.held()) { BK.press('talk'); BK.sim(6); } P.x = x; P.y = hp.y; P.vx = 0; BK.sim(2); BK.press('atk'); BK.sim(80); if (lp.lit) res.push(x); }
      return { lit: lp.lit, from: res, n: W.n, held: W.held(), carry: !!P.carry, px: P.x, py: P.y, lamps: d.lamps.map(q => q.lit) }; })()`);
    console.log('steep rock throw', JSON.stringify(r)); await go(375, 16, 120); await save('steep-lit');
  } else { await save('steep-lit'); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
