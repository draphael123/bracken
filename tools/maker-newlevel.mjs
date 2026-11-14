// PAGE TOOL: launches headless Chrome
/* tools/maker-newlevel.mjs (claude/maker) - A NEW LEVEL STARTS EMPTY, AND THE START BEGINS IT.
   1. NEW: no ground, no pieces, no START; the START tool is in hand. PLAY refuses until there is a START (and a goal).
   2. Placing the START in the open with nothing under it puts three tiles of ground there; never inside the ground.
   3. A held scroll button moves the view up and down.
   node tools/maker-newlevel.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(15), audio: false, seed: 3 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'), U = await import('/src/maker-ui.js'); MKR.enter(); U.closePanel(); const r = {};
    const kd = k => { dispatchEvent(new KeyboardEvent('keydown', { key: k })); dispatchEvent(new KeyboardEvent('keyup', { key: k })); };
    kd('n'); const d = MKR.doc; r.empty = !d.start && d.ents.length === 0 && [...d.grid].every(v => !v);
    MKR.play(); r.playRefused = BK.state === 'editor';
    MKR.startAt(20, 10); r.startPlaced = d.start && d.start.x === 20 && d.start.y === 10; r.pad = [19, 20, 21].every(x => d.grid[11 * d.W + x] === 1);
    MKR.startAt(20, 11); r.notInGround = d.start.y === 10;
    d.ents.push({ t: 'gate', x: 21, y: 10 }); MKR.mount(); MKR.play(); BK.step(5); r.plays = BK.state === 'play'; MKR.resume();
    // scroll
    const y0 = MKR.cam.y; U.holdScroll(0, 1); for (let i = 0; i < 20; i++) { MKR.drawOnce(); await new Promise(res => setTimeout(res, 16)); } U.mouseUp(); r.scrolled = MKR.cam.y > y0 + 20;
    return r;
  })()`, 200000);
  console.log(JSON.stringify(r));
  for (const k of ['empty', 'playRefused', 'startPlaced', 'pad', 'notInGround', 'plays', 'scrolled']) assert(r[k], 'maker new level: ' + k + ' failed ' + JSON.stringify(r));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-newlevel: a new level is empty with the START in hand, PLAY waits for a START, the START brings its own ground, the scroll buttons move the view.');
} finally { pg.close(); }
