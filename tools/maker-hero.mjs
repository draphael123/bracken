// PAGE TOOL: launches headless Chrome
/* tools/maker-hero.mjs (claude/maker) - WHO PLAYS A MADE-BY-HAND LEVEL, AND THE ARROW SIGN.
   1. A SET HERO plays on the starter kit, and the save's own progress is exactly as it was after the run.
   2. YOUR OWN HERO plays with the save's progress; such a run never marks the level BEATEN, and the level can be shared
      unchecked. A set-hero level can only be shared once beaten.
   3. The ARROW SIGN places, points where its setting says, and plays without errors.   node tools/maker-hero.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(14), audio: false, seed: 4 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'), U = await import('/src/maker-ui.js'); MKR.enter(); U.closePanel(); const r = {};
    const PROG = BKT.PROG, mine = BK.hero ? (typeof BK.hero === 'function' ? BK.hero() : BK.hero) : 'knight';
    BKT.setHeroLevel('knight', 12); PROG.xp.zzMark = 7; const before = JSON.stringify(PROG);
    const lvl = hero => { const d = MKR.blank(60, 28); d.ents = [{ t: 'gate', x: 55, y: 19 }, { t: 'arrow', x: 10, y: 19, dir: 2 }]; d.start = { x: 3, y: 19 }; d.hero = hero; MKR.doc = d; return d; };
    // 1. set hero
    let d = lvl('knight'); MKR.play(); BK.step(10); r.kitLevel = PROG.xp.knight; r.kitApplied = PROG.xp.knight < 1000 && PROG.xp.zzMark === 7;
    BK.tp(55, 19); BK.step(90); r.setWins = BK.state === 'win'; MKR.resume(); r.progBack = JSON.stringify(PROG) === before; r.setCleared = P.isCleared(d) && P.shareReady(d);
    // 2. own hero
    d = lvl('own'); MKR.play(); BK.step(10); r.ownKeeps = JSON.stringify(PROG.xp) === JSON.stringify(JSON.parse(before).xp); BK.tp(55, 19); BK.step(90); MKR.resume();
    r.ownNotCleared = !P.isCleared(d) && P.shareReady(d);
    d = lvl('knight'); r.setNeedsBeat = !P.shareReady(d);
    d = lvl(null); r.oldIsOwn = P.ownHero(d);
    // 3. arrow
    const a = d.ents.find(e => e.t === 'arrow'), row = P.pieceRows(a)[0]; P.stepRow(d, a, row, 1); r.arrowTurns = a.dir === 3 && P.ARROW_DIRS[3] === 'UP-LEFT';
    r.arrowOnTab = U.GROUPS.some(g => g.name === 'DECOR' && g.items.some(q => q.cat === 2 && P.THINGS[q.i] === 'arrow'));
    MKR.play(); BK.step(30); r.arrowPlays = BK.state === 'play'; MKR.resume();
    delete PROG.xp.zzMark; return r;
  })()`, 200000);
  console.log(JSON.stringify(r));
  for (const k of ['kitApplied', 'setWins', 'progBack', 'setCleared', 'ownKeeps', 'ownNotCleared', 'setNeedsBeat', 'oldIsOwn', 'arrowTurns', 'arrowOnTab', 'arrowPlays']) assert(r[k], 'maker hero: ' + k + ' failed ' + JSON.stringify(r));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-hero: a set hero plays on the starter kit and the save comes back untouched, your own hero keeps its progress but never marks a level beaten, and the arrow sign points and plays.');
} finally { pg.close(); }
