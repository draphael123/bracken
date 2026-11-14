// PAGE TOOL: launches headless Chrome
/* tools/maker-goals.mjs (claude/maker) - THE CLEAR CHECK, LEVEL GOALS AND CO-OP TEST RUNS.
   1. CLEAR: a run from START that reaches the goal clears the level as it stands (SHARE needs that); the win card's confirm goes
      back to the editor; a PLAY HERE win does not clear; any edit un-clears.
   2. GOALS: DEFEAT EVERY ENEMY and COLLECT EVERY COIN hold the gate until done; DO NOT GET HIT and BEAT THE CLOCK start the run again.
   3. PLAYERS: an AI ally plays the test run with you, and the campaign's own party is back after it.
   4. SAVE -> LOAD keeps the goal, the players and the clear.   node tools/maker-goals.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(11), audio: false, seed: 21 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'); MKR.enter(); (await import('/src/maker-ui.js')).closePanel(); const r = {};
    const key = k => { dispatchEvent(new KeyboardEvent('keydown', { key: k })); BK.step(1); dispatchEvent(new KeyboardEvent('keyup', { key: k })); BK.step(2); };
    const toGate = () => { BK.tp(55, 19); BK.step(90); return BK.state; };
    const lvl = (ents, goal) => { const d = MKR.blank(60, 28); d.ents = [{ t: 'gate', x: 55, y: 19 }, ...ents]; d.start = { x: 3, y: 19 }; d.goal = goal || null; d.hero = 'knight'; MKR.doc = d; return d; };   /* a set hero: only its runs mark a level BEATEN */

    // 1. the clear
    let d = lvl([]); r.notYet = !P.isCleared(d);
    MKR.play(); BK.god = true; BK.step(20); r.winState = toGate(); r.cleared = P.isCleared(MKR.doc);
    key('Enter'); if (BK.state !== 'editor') key('z'); r.backToEditor = BK.state === 'editor';
    d.grid[19 * 60 + 30] = 1; r.editUnclears = !P.isCleared(d); d.grid[19 * 60 + 30] = 0; r.undoRecleared = P.isCleared(d);
    d = lvl([]); MKR.playAt({ x: 40, y: 19 }); BK.god = true; BK.step(20); toGate(); r.hereNoClear = !P.isCleared(MKR.doc); MKR.resume();

    // 2. goals
    lvl([{ t: 'sprig', x: 30, y: 19 }], 'foes'); MKR.play(); BK.god = true; BK.step(20); r.foesHold = toGate() === 'play';
    for (const e of BK.enemies()) { e.hp = 0; e.alive = false; } BK.step(30); r.foesOpen = toGate() === 'win'; MKR.resume();
    lvl([{ t: 'coin', x: 20, y: 19 }, { t: 'coin', x: 40, y: 19 }], 'coins'); MKR.play(); BK.god = true; BK.step(20); r.coinsHold = toGate() === 'play';
    BK.tp(20, 19); BK.step(30); BK.tp(40, 19); BK.step(30); r.coinsOpen = toGate() === 'win'; MKR.resume();
    lvl([], 'nohit'); MKR.play(); BK.step(30); BK.tp(30, 19); BK.step(5); BK.P.hp -= 1; BK.step(3); r.hitFails = !!BK.L.mkFailT; BK.step(240); r.hitRestarts = BK.P.x < 8 * 16 && !BK.L.mkFailT; MKR.resume();
    lvl([], 't30'); MKR.play(); BK.god = true; BK.step(20); BK.tp(30, 19); BK.step(5); r.clockEarly = !BK.L.mkFailT; BK.villageWater.levelTime(29.8); for (let i = 0; i < 10 && !BK.L.mkFailT; i++) BK.step(10); r.clockFails = r.clockEarly && !!BK.L.mkFailT; BK.step(240); r.clockRestarts = BK.P.x < 8 * 16; MKR.resume();

    // 3. players
    BK.coopArm(null); d = lvl([]); d.players = 'ally'; MKR.play(); BK.step(30); r.allyIn = BK.players().length === 2;
    MKR.resume(); r.partyBack = BK.players().length === 1;

    // 4. save / load
    d = lvl([], 'coins'); d.players = 'ally'; d.cleared = P.docSig(d); MKR.mount();
    const KEY = 'bracken.level.2', keep = localStorage.getItem(KEY), kd = k => { dispatchEvent(new KeyboardEvent('keydown', { key: k })); dispatchEvent(new KeyboardEvent('keyup', { key: k })); };
    kd('f'); kd('f'); kd('s'); MKR.doc = MKR.blank(60, 28); kd('l'); r.saveLoad = MKR.doc.goal === 'coins' && MKR.doc.players === 'ally' && P.isCleared(MKR.doc); kd('f');
    if (keep === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, keep);
    BK.god = false; return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  for (const k of ['notYet', 'cleared', 'backToEditor', 'editUnclears', 'undoRecleared', 'hereNoClear', 'foesHold', 'foesOpen', 'coinsHold', 'coinsOpen', 'hitFails', 'hitRestarts', 'clockFails', 'clockRestarts', 'allyIn', 'partyBack', 'saveLoad'])
    assert(r[k], 'maker goals: ' + k + ' failed ' + JSON.stringify(r));
  assert.equal(r.winState, 'win', 'reaching the goal should win');
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-goals: a start-to-goal run clears the level for SHARE (edits un-clear it), the win goes back to the editor, every goal holds or fails as it says, an AI ally joins the test run and leaves after, and save/load keeps it all.');
} finally { pg.close(); }
