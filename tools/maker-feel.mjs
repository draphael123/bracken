// PAGE TOOL: launches headless Chrome
/* tools/maker-feel.mjs (claude/maker, the feel batch) - THE MAKER FEELS LIKE A MAKER.
   1. GRAB AND MOVE with the real mouse: a placed piece drags to a new cell; a platform's gold handle drags its reach; a click
      that moves nothing leaves no undo step; a piece will not be dragged into the ground.
   2. PLAY IS INSTANT: no name banner, straight into play; back in the editor the view is centred on the knight; PLAY HERE
      starts the knight where it was asked to.
   3. EVERY PIECE SAYS WHAT IT DOES: each palette entry has a name and a line; each starter foe has its hand-written tags.
   node tools/maker-feel.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(1), audio: false, seed: 1 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'); MKR.enter(); const UI = await import('/src/maker-ui.js'); UI.closePanel();
    const r = {}, W = 120, d = MKR.blank(W, 28);
    d.ents = [{ t: 'gate', x: 110, y: 19 }, P.entFor('mover', 12, 16), { t: 'sprig', x: 30, y: 19 }]; d.start = { x: 3, y: 19 }; MKR.doc = d; MKR.mount(); BK.step(1);
    const ev = (type, tx, ty) => { const [x, y] = MKR.toScreen(tx * 16 + 8 - Math.round(MKR.cam.x), ty * 16 + 8 - Math.round(MKR.cam.y));
      (type === 'mouseup' ? window : document.getElementById('c')).dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, button: 0 })); };
    const drag = (a, b) => { ev('mousedown', a[0], a[1]); ev('mousemove', b[0], b[1]); ev('mouseup', b[0], b[1]); };
    drag([30, 19], [34, 19]); r.moved = d.ents.find(e => e.t === 'sprig').x === 34;
    drag([34, 19], [34, 22]); r.notIntoGround = d.ents.find(e => e.t === 'sprig').y === 19;
    drag([17, 16], [20, 16]); r.handle = d.ents.find(e => e.t === 'mover').range === 7;
    const u0 = MKR.undoDepth; ev('mousedown', 34, 19); ev('mouseup', 34, 19); r.clickNoUndo = MKR.undoDepth === u0;
    MKR.play(); r.instant = BK.state === 'play' && !BK.bannerT; BK.step(30); BK.tp(60, 19); BK.step(5); const px = BK.P.x; MKR.resume(); BK.step(1);
    r.centred = Math.abs(MKR.cam.x + MKR.viewW / 2 - px) < 24;
    const here = P.standIn(d, 50, 0); MKR.playAt(here); BK.step(10); r.playHere = Math.abs(BK.P.x - (50 * 16 + 8)) < 20; MKR.resume();
    r.missingLines = [];
    P.TILES.forEach(t => { const x = P.describe(0, t[1]); if (!x.name || !x.line) r.missingLines.push('tile ' + t[0]); });
    P.THINGS.forEach(t => { const x = P.describe(2, t); if (!x.name || !x.line) r.missingLines.push('thing ' + t); });
    P.FOES.forEach(t => { const x = P.describe(1, t); if (!x.name || !x.line || !x.tags.length) r.missingLines.push('foe ' + t); });
    r.archer = P.describe(1, 'archer').tags.join('/');
    return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  for (const k of ['moved', 'notIntoGround', 'handle', 'clickNoUndo', 'instant', 'centred', 'playHere']) assert(r[k], 'maker feel: ' + k + ' failed ' + JSON.stringify(r));
  assert.deepEqual(r.missingLines, [], 'pieces that do not say what they do: ' + r.missingLines.join(', '));
  assert.equal(r.archer, 'SHOOTS');
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-feel: pieces and handles drag, play is instant and comes back to the knight, play-here starts there, every piece says what it does.');
} finally { pg.close(); }
