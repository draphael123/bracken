// PAGE TOOL: launches headless Chrome
// tools/douse-agree.mjs - A DOUSED FIRE GOES OUT WHERE IT IS DRAWN (claude/smallfix7, Daniel 11-01: "where you knock water into things, the fire still
// appears visually but doesn't do damage"). Two halves:
//   A. THE PAGE (THE BURNING VILLAGE): light the straw, let it take, splash it. In the SAME FRAME water lands (no sim step in between) every cell in
//      reach is UNLIT AND its entry in `fires` - the thing that hurts and the thing that draws - is gone; steam went up; and the other way round,
//      no `fires` entry of the grid stands over a cell that is not alight. The barn roof's wall: delay > 0 means neither drawn nor hurting.
//   B. THE DRAW SITES (source): each place that paints a flame for something water can put out reads the same state that stops its damage: a doused
//      beam (z.wet), a flame pillar a wave put out (f.outT), a doused burning goblin (e.doused), the hung beam's embers (the cell below alight).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const has = (re, msg) => assert.ok(re.test(src), 'draw site lost its douse guard: ' + msg);
has(/const wet = z\.wet > 0, hot = !wet && z\.t >= 0;/, 'a doused beam/log is drawn alight');
has(/if \(!wet\) for \(let q = 2; q < w; q \+= 5\)/, 'a doused beam still paints flame teeth');
has(/soon = f\.delay < PILLAR\.warn && !\(f\.outT > 0\);[\s\S]{0,200}\n\s+if \(f\.outT > 0\) \{/, 'a doused flame pillar still glows and flickers its warning');
has(/if \(e\.doused > 0\) \{ if \(Math\.random\(\) < 0\.12\) steamPuff/, 'a doused burning goblin still wears its flame');
has(/pr\.state !== 'hung' \|\| \(bc && \(bc\.s === ALIGHT \|\| bc\.s === BURNT\)\)/, 'the hung beam shows embers over a cell that is not burning');
has(/villageOut\(\); number\(fx, fy - 30, n \? 'PUT OUT'/, 'a bucket on a grid cell leaves its flame up a frame');
has(/const n = douse\(VG, Math\.floor\(x \/ TS\), Math\.floor\(\(y - 1\) \/ TS\), r\); villageOut\(\);/, 'a trough/well/tank splash leaves the grid flame up a frame');

const pg = await openPage({ port: portFor(8) });
try {
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    BK.manualSimulation = true;
    const bi = LEVELS.findIndex(l => l.id === 'burning'), out = {};
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(bi); BK.start(); BK.god = true; BK.sim(10); BK.reset();
    const TS = 16, V = () => BKT.vil();
    /* the agreement, both ways: every ALIGHT cell has a live grid flame over it; every grid flame stands over an ALIGHT cell */
    const agree = () => { const { grid, fires } = V(); const gf = fires.filter(f => f.grid && f.life > 0 && !(f.delay > 0));
      const alight = grid.cells.filter(c => c.s === 2);
      return { alight: alight.length, flames: gf.length, missing: alight.filter(c => !gf.some(f => f.x === c.x * TS + 8 && f.y === (c.y + 1) * TS)).length,
        stray: gf.filter(f => !alight.some(c => f.x === c.x * TS + 8 && f.y === (c.y + 1) * TS)).length }; };
    /* a run of straw on the Long Street: the first non-square cell with two non-square neighbours either side */
    const { grid } = V(); const key = c => grid.get(c.x, c.y);
    const c0 = grid.cells.find(c => !c.square && [-2, -1, 1, 2].every(d => { const n = grid.get(c.x + d, c.y); return n && !n.square; }));
    out.c0 = c0 ? { x: c0.x, y: c0.y } : null;
    BK.tp(Math.max(3, c0.x - 40), c0.y - 1);
    BKT.vilIgnite(c0.x, c0.y); BK.sim(60 * 10);
    out.lit = agree();
    const p0 = V().parts;
    BKT.vilSplash(c0.x * TS + 8, (c0.y + 1) * TS, 3, 5);   /* NO sim step after this: the same frame */
    out.after = agree();
    out.inReach = grid.cells.filter(c => !c.square && Math.abs(c.x - c0.x) <= 3 && Math.abs(c.y - c0.y) <= 2 && c.s !== 0).length;
    out.steam = V().parts - p0;
    BK.sim(60 * 2); out.later = agree();
    return out;
  })()`, 600000);
  console.log(JSON.stringify(r));
  assert.ok(r.c0, 'found a run of straw to light');
  assert.ok(r.lit.alight >= 1, 'the straw took: ' + JSON.stringify(r.lit));
  assert.deepEqual([r.lit.missing, r.lit.stray], [0, 0], 'before the water: every burning cell is drawn and every flame stands on a burning cell: ' + JSON.stringify(r.lit));
  assert.equal(r.inReach, 0, 'water left a burning/catching cell in reach');
  assert.deepEqual([r.after.missing, r.after.stray], [0, 0], 'the SAME FRAME water lands, a flame still stands (drawn, hurting) over a cell that is out: ' + JSON.stringify(r.after));
  assert.ok(r.after.alight < r.lit.alight, 'the splash put no fire out');
  assert.ok(r.steam >= 3, 'no steam went up where the fire went out (' + r.steam + ' particles)');
  assert.deepEqual([r.later.missing, r.later.stray], [0, 0], 'later: ' + JSON.stringify(r.later));
  assert.deepEqual(pg.errors, []);
  console.log('A doused fire goes out where it is drawn, in the same frame its damage stops: state and flames agree after a splash, steam went up; the draw sites for beams, pillars, goblins and hung beams read the douse.');
} finally { pg.close(); }
