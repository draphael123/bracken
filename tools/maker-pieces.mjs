// PAGE TOOL: launches headless Chrome
/* tools/maker-pieces.mjs (claude/maker, batch 2) - PIECE SETTINGS reach the game, and a SHARE LINK carries the whole level.
   Every setting row of every kind that has one steps without error; the stepped values are what the game spawns (a
   platform's range and speed, a foe's facing, a crusher's beat, a gate's metal and height - its bars regrown); and a level
   with water, materials, music and time of day survives shareLink -> fromShareCode exactly.   node tools/maker-pieces.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(2), audio: false, seed: 2 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'); MKR.enter(); (await import('/src/maker-ui.js')).closePanel();
    const r = { rowErrors: [] }, W = 100, d = MKR.blank(W, 28);
    d.ents = [{ t: 'gate', x: 95, y: 19 }, P.entFor('mover', 12, 16), P.entFor('mover:up', 16, 18), { t: 'sprig', x: 20, y: 19 }, { t: 'sign', x: 25, y: 19 },
      P.entFor('lockgate:brass', 30, 19), P.entFor('key:brass', 33, 19), P.entFor('crusher', 36, 19), P.entFor('firevent', 40, 19), P.entFor('roller', 44, 19), P.entFor('rockfall', 48, 19), P.entFor('vent', 52, 19), P.entFor('firepit', 56, 19)];
    for (const e of d.ents) P.afterPlace(d, e); d.start = { x: 3, y: 19 }; MKR.doc = d; MKR.mount();
    /* every row of every piece steps both ways without throwing */
    for (const e of d.ents) for (const row of P.pieceRows(e)) { if (row.text) continue; try { P.stepRow(d, e, row, 1); P.stepRow(d, e, row, -1); } catch (x) { r.rowErrors.push(e.t + '.' + row.key + ': ' + x.message); } }
    const mv = d.ents.find(e => e.t === 'mover' && !e.vert), foe = d.ents.find(e => e.t === 'sprig'), gate = d.ents.find(e => e.t === 'lockgate'), cr = d.ents.find(e => e.t === 'crusher');
    const step = (e, key, n) => { const row = P.pieceRows(e).find(q => q.key === key); for (let k = 0; k < n; k++) P.stepRow(d, e, row, 1); };
    step(mv, 'range', 2); step(mv, 'speed', 1); step(foe, 'face', 1); step(cr, 'every', 1); step(gate, 'needs', 1); step(gate, 'h', 2);
    r.want = { range: mv.range, speed: mv.speed, face: foe.face, every: cr.every, needs: gate.needs, h: gate.h };
    r.bars = [...Array(10).keys()].map(k => d.grid[(19 - k) * W + 30] === 12 ? 1 : 0).join('');
    MKR.mount(); MKR.play(); BK.step(5);
    const em = BK.movers().find(q => q.kind !== 'pushblock' && !q.vert), es = BK.enemies().find(e => e.t === 'sprig');
    const props = typeof BK.props === 'function' ? BK.props() : BK.props, pc = props.find(p => p.t === 'crusher'), pg2 = props.find(p => p.t === 'lockgate');
    r.got = { range: em.range / 16, speed: em.speed, face: es.face, every: pc.every, needs: pg2.needs, h: pg2.h };
    MKR.resume();
    d.water = [{ kind: 'water', x0: 60, x1: 66, y0: 20, y1: 22 }]; d.mat = { '70,19': 'cobble' }; d.grid[19 * W + 70] = 1; d.music = 'musBeach'; d.time = 'night'; d.weather = 'rain'; d.ents.find(e => e.t === 'sign').text = 'HELLO THERE';
    const url = await P.shareLink(d), b = await P.fromShareCode(url); r.linkLength = url.length;
    r.share = b.W === d.W && b.H === d.H && b.grid.every((v, i) => v === d.grid[i]) && JSON.stringify(b.ents) === JSON.stringify(d.ents) && JSON.stringify(b.water) === JSON.stringify(d.water)
      && b.mat['70,19'] === 'cobble' && b.music === 'musBeach' && b.time === 'night' && b.weather === 'rain' && b.theme === d.theme && b.name === d.name;
    r.urlHasMaker = url.includes('?maker=1#L=');
    return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  assert.deepEqual(r.rowErrors, [], 'setting rows that throw: ' + r.rowErrors.join(' | '));
  assert.deepEqual(r.got, r.want, 'the game spawned other values than the settings say');
  assert.equal(r.bars, '1111110000', 'a 6-high gate should have 6 bars (and nothing above): ' + r.bars);
  assert(r.share, 'the share link did not bring the level back exactly');
  assert(r.urlHasMaker, 'a share link must open the maker');
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-pieces: every setting steps, the game spawns what the settings say, and a ' + r.linkLength + '-character link carries the whole level.');
} finally { pg.close(); }
