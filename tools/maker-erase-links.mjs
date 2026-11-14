// PAGE TOOL: launches headless Chrome
/* tools/maker-erase-links.mjs (claude/maker) - ERASE OPTIONS, STYLE LIMITS, THE START GATE AND THE BOSS-LOCKED GOAL.
   1. ERASE: GROUND ONLY leaves pieces, PIECES ONLY leaves ground, ENEMIES ONLY leaves other pieces; a BOX takes a whole area.
   2. STYLE: a castle refuses reeds (the palette greys them), its slopes are cut from castle stone (L.mat on the slope cells).
   3. LINKS: a boss placed now does not lock the goal; LINK boss -> goal locks it (shut in play until it falls); an old level's
      boss (no lockGoal) still locks it. The start gate is where the level starts, even on a PLAY HERE run.   node tools/maker-erase-links.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(13), audio: false, seed: 9 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'), U = await import('/src/maker-ui.js'), { T } = await import('/src/level.js'); MKR.enter(); U.closePanel(); const r = {};
    const W = 60, fresh = () => { const d = MKR.blank(W, 28); d.ents = [{ t: 'gate', x: 55, y: 19 }, { t: 'sprig', x: 20, y: 19 }, { t: 'coin', x: 22, y: 19 }]; MKR.doc = d; MKR.mount(); return d; };
    const eraseIdx = P.TILES.findIndex(t => t[1] === T.AIR);
    // 1. erase filters (one cell)
    let d = fresh(); d.grid[19 * W + 20] = 0; MKR.select(0, eraseIdx);
    U.setEraseMode(false, 'ground'); MKR.place(20, 20); r.groundOnly = d.grid[20 * W + 20] === 0 && d.ents.some(e => e.t === 'sprig');
    U.setEraseMode(false, 'foes'); MKR.place(22, 19); r.foesKeepsCoin = d.ents.some(e => e.t === 'coin'); MKR.place(20, 19); r.foesTakesFoe = !d.ents.some(e => e.t === 'sprig');
    U.setEraseMode(false, 'pieces'); MKR.place(22, 20); r.piecesKeepsGround = d.grid[20 * W + 22] === T.SOLID; MKR.place(22, 19); r.piecesTakesCoin = !d.ents.some(e => e.t === 'coin');
    // (box)
    d = fresh(); r.boxN = MKR.eraseBox({ x: 18, y: 18 }, { x: 24, y: 21 }, 'foes'); r.boxFoes = !d.ents.some(e => e.t === 'sprig') && d.ents.some(e => e.t === 'coin') && d.grid[20 * W + 20] === T.SOLID;
    d = fresh(); MKR.eraseBox({ x: 18, y: 18 }, { x: 24, y: 21 }, 'all'); r.boxAll = !d.ents.some(e => e.t === 'coin' || e.t === 'sprig') && d.grid[20 * W + 20] === 0 && d.grid[22 * W + 20] === T.SOLID;
    U.setEraseMode(false, 'all');
    // 2. style limits and styled slopes
    d = fresh(); d.style = 'masonry'; MKR.mount(); const reed = P.TILES.findIndex(t => t[1] === T.REED); MKR.select(0, reed); MKR.place(30, 19); r.reedRefused = d.grid[19 * W + 30] !== T.REED;
    r.greyed = P.styleBanned('masonry', 0, T.REED) && !P.styleBanned('masonry', 0, T.ONEWAY) && !P.styleBanned(null, 0, T.REED);
    P.rampStart({ x: 10, y: 19 }); P.rampEnd(d, { x: 13, y: 16 }); MKR.mount(); r.slopeStyled = P.engineMat(d)[19 * W + 10] === 'masonry';
    // 3. the boss and the goal; the start gate
    const boss = P.BOSSES[0], bi = P.FOES.indexOf(boss);
    d = fresh(); MKR.select(1, bi); MKR.place(40, 19); const b = d.ents.find(e => e.t === boss); r.newUnlinked = !!b && b.lockGoal === false;
    MKR.play(); BK.step(20); r.openWhenUnlinked = !!BK.L.gateOpen; MKR.resume();
    const say = () => {}; P.linkClick(d, { x: 40, y: 19 }, say); P.linkClick(d, { x: 55, y: 19 }, say); r.linked = P.bossLocks(d.ents.find(e => e.t === boss));
    MKR.play(); BK.step(20); r.shutWhenLinked = !BK.L.gateOpen && BK.L.mkBossLocks === true; MKR.resume();
    P.linkClick(d, { x: 40, y: 19 }, say); P.linkClick(d, { x: 55, y: 19 }, say); r.unlinkAgain = !P.bossLocks(d.ents.find(e => e.t === boss));
    const old = d.ents.find(e => e.t === boss); delete old.lockGoal; r.oldLevelLocks = P.bossLocks(old);
    d = fresh(); d.start = { x: 6, y: 19 }; MKR.playAt({ x: 30, y: 19 }); BK.step(10); r.startGateStays = BK.L.mkStart && BK.L.mkStart.x === 6 && BK.P.x > 25 * 16; MKR.resume();
    return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  for (const k of ['groundOnly', 'foesKeepsCoin', 'foesTakesFoe', 'piecesKeepsGround', 'piecesTakesCoin', 'boxFoes', 'boxAll', 'reedRefused', 'greyed', 'slopeStyled', 'newUnlinked', 'openWhenUnlinked', 'linked', 'shutWhenLinked', 'unlinkAgain', 'oldLevelLocks', 'startGateStays'])
    assert(r[k], 'maker erase/links: ' + k + ' failed ' + JSON.stringify(r));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-erase-links: erase takes only what it says (one cell or a box), a style refuses what it does not hold and cuts its own slopes, a boss locks the goal only when linked (old levels keep theirs), and the start gate stays at START.');
} finally { pg.close(); }
