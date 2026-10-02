// tools/cisternqueen-shots.mjs - THE CISTERN QUEEN and THE GANG LEADER, pictured (claude/welltown3). Not in the suite: god mode, pictures not a playtest.
//   node tools/cisternqueen-shots.mjs [tag=after]   -> work/claude/welltown3/boss-<tag>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'work/claude/welltown3', 'boss-' + tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'welltown'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4);
    for (const e of BK.enemies()) if (e.t !== 'gangleader' && e.t !== 'cisternqueen') e.alive = false;
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const until = (pred, max = 1800) => { for (let i = 0; i < max && !pred(); i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); };
    /* THE GANG LEADER in his courtyard */
    const M = BK.L.mini; BK.tp(Math.round(M.trigger / 16) + 2, Math.round(M.floor / 16) - 1); run(100); snap('1-gang-leader-wakes');
    const gl = BK.enemies().find(e => e.t === 'gangleader'); until(() => gl.mode === 'throwTell'); snap('2-gang-leader-bottle');
    until(() => gl.mode === 'whirlTell'); snap('3-gang-leader-whirl');
    gl.hp = 1; BKT.hurtEnemy(gl, 50, gl.x - 10, false); run(60);
    /* THE CISTERN QUEEN */
    const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); run(40); snap('4-queen-wakes');
    const q = BK.boss, S = () => BK.cisternQueenHands().show();
    until(() => q.mode === 'walk'); run(20); snap('5-queen-guard');
    until(() => q.mode === 'lanceTell'); run(20); snap('6-queen-tail-lance');
    until(() => q.mode === 'burrow'); run(30); BK.P.skin.sips = 3; run(2); snap('7-queen-burrowed-mound');
    until(() => q.mode === 'strikeTell' || q.mode === 'chargeTell'); run(8); snap('8-queen-strike-told');
    q.hp = Math.round(q.maxHp * 0.6); until(() => S().pose === 'wall' && q.mode === 'cling', 2400); run(4); snap('9-queen-on-the-wall');
    until(() => q.mode === 'sweepLowTell' || q.mode === 'sweepHighTell', 2400); run(10); snap('10-queen-sweep-told');
    until(() => q.mode === 'pounceTell', 3600); run(20); snap('11-queen-pounce-shadow');
    q.hp = Math.round(q.maxHp * 0.3); until(() => S().flood && S().water > 15, 2400); run(30); snap('12-queen-flood');
    until(() => q.mode === 'grabTell', 2400); run(10); snap('13-queen-grab-told');
    q.open = 3; q.mode = 'rear'; q.modeT = 3; run(6); snap('14-queen-rearing-open');
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/welltown3/boss-' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
