// tools/title-region.mjs - THE TITLE BY REGION (claude/titleregion). Seeds a save for every region (the cleared chain up to the opener's gate, so the
// region's first wood is just unlocked), opens the title and checks: the region id, the backdrop differs from the wood's, the slot's hero stands in
// the scene, no page errors, and the saves in localStorage are byte-identical after (read only). Shots go to work/claude/shots/titleregion/.
// usage: PORT=<free port> node tools/title-region.mjs
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { openPage, ROOT } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import * as TR from '../src/title-region.js';

const out = join(ROOT, 'work/claude/shots/titleregion'); mkdirSync(out, { recursive: true });
const byId = new Map(LEVELS.map(l => [l.id, l])), chainOf = id => { const set = []; for (let g = byId.get(id).needs; g; g = byId.get(g) && byId.get(g).needs) set.push(g); return set; };
const cases = [{ region: 'forest', cleared: [], hero: 'knight' }, ...Object.entries(TR.SPINE).filter(([, r]) => r !== 'forest').map(([id, region], i) => ({ region, cleared: chainOf(id), hero: ['knight', 'warden', 'geomancer', 'pyro', 'paladin', 'pirate', 'reaper'][(i + 1) % 7] }))];
/* a spur resolves to its parent's region, and a hook region is never reached by the road */
assert.equal(TR.regionOfLevel(LEVELS, 'harbor'), 'coast'); assert.equal(TR.regionOfLevel(LEVELS, 'burning'), 'marsh'); assert.equal(TR.regionOfLevel(LEVELS, 'buriedcity'), 'desert');
assert.ok(!LEVELS.some(l => ['frost', 'volcano', 'demon'].includes(TR.regionOfLevel(LEVELS, l.id))), 'no level reaches a hook region yet');

const pg = await openPage({ audio: false });
const pause = ms => new Promise(r => setTimeout(r, ms));
try {
  const seen = {};
  for (const c of cases) {
    const save = { hero: c.hero, heroes: { knight: true, [c.hero]: true }, perHero: 1, heardMusic: Object.fromEntries(TR.REGIONS.map(r => [r.music, 1])), done: { [c.hero]: {} }, coins: 10 };
    for (const id of c.cleared) { save[id] = { cleared: true, medal: 1 }; save.done[c.hero][id] = 1; }
    const r = await pg.evalp(`(async()=>{ BK.manualSimulation = true; localStorage.clear(); localStorage.setItem('bracken.progress.2', ${JSON.stringify(JSON.stringify(save))}); BK.loadSlot(2); BK.setHero(${JSON.stringify(c.hero)});
      const before = JSON.stringify(Object.entries(localStorage).sort());
      BK.ui.pressCard = false; BK.state = 'title'; BK.step(200); const { VW, VH } = BK.view; const g2 = BK.view.buf.getContext('2d');
      const px = Array.from(g2.getImageData(0, 0, VW, 40).data).filter((v, i) => i % 4 < 3).reduce((a, v) => a + v, 0);
      const t0 = performance.now(); BK.step(30); const ms = (performance.now() - t0) / 30;
      return { rg: BK.ui.titleRegion(), track: BK.ui.titleTrack(), state: BK.state, sky: px, ms, same: before === JSON.stringify(Object.entries(localStorage).sort()), hero: BKT.PROG.hero }; })()`);
    assert.equal(r.state, 'title'); assert.equal(r.track, c.region === 'forest' ? null : TR.regionById(c.region).music, 'the title track for ' + c.region); assert.equal(r.rg, c.region, 'region for ' + c.region + ': ' + JSON.stringify(r)); assert.ok(r.same, 'the title wrote to the saves');
    assert.ok(r.ms < 30, 'a title frame costs ' + r.ms.toFixed(1) + 'ms (' + c.region + ')');
    seen[c.region] = r.sky; await pause(200);
    const shot = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(out, c.region + '.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('ok  ' + c.region.padEnd(7) + ' hero ' + c.hero.padEnd(10) + ' track ' + String(r.track).padEnd(10) + ' ' + r.ms.toFixed(1) + 'ms/frame  -> ' + c.region + '.png');
  }
  assert.ok(new Set(Object.values(seen)).size >= 8, 'the regions look different from one another: ' + JSON.stringify(seen));
  assert.equal(pg.errors.length, 0, 'page errors: ' + pg.errors.slice(0, 3).join(' | '));
  console.log('ok  ' + cases.length + ' regions, saves untouched, no page errors');
} finally { pg.close(); }
