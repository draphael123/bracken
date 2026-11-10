/* tools/maker-editing.mjs (claude/maker, batch 1) - EDITING IN THE MAKER does not corrupt a level or hide a problem.
   1. UNDO after WIDER / NEW gives back the old size (it restored the old grid into the new width: a scrambled level).
   2. A piece cannot be put INSIDE the ground; painting ground over a piece takes the piece away.
   3. A WATER kind out of water is placed but counted as a problem (the red marker), and is fine once in a pool.
   4. Getting around with the real mouse: the WHEEL scrolls, a MIDDLE-button drag pans (and paints nothing), a click on
      the MAP jumps there.
   node tools/maker-editing.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(3), audio: false, seed: 3 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'); MKR.enter(); (await import('/src/maker-ui.js')).closePanel();
    const r = {}, kd = (k, o = {}) => { dispatchEvent(new KeyboardEvent('keydown', { key: k, ...o })); dispatchEvent(new KeyboardEvent('keyup', { key: k, ...o })); };
    const sane = () => MKR.doc.grid.length === MKR.doc.W * MKR.doc.H;
    MKR.doc = MKR.blank(120, 28); MKR.mount(); kd('='); r.wider = MKR.doc.W; kd('z', { ctrlKey: true }); r.undoWider = sane() && MKR.doc.W === 120;
    MKR.doc = MKR.blank(90, 28); MKR.mount(); kd('n'); kd('z', { ctrlKey: true }); r.undoNew = sane() && MKR.doc.W === 90;
    MKR.doc = MKR.blank(60, 28); MKR.mount();
    MKR.select(1, P.FOES.indexOf('sprig')); MKR.place(30, 22); r.buriedRefused = !MKR.doc.ents.some(e => e.t === 'sprig');
    MKR.place(20, 19); MKR.select(0, 1); MKR.place(20, 19); r.coveredGone = !MKR.doc.ents.some(e => e.t === 'sprig');
    MKR.select(1, P.FOES.indexOf('eel')); MKR.place(40, 19); r.eelFlagged = P.problems(MKR.doc).some(p => p.e.t === 'eel' && p.why === 'needs water');
    MKR.doc.water = [{ kind: 'water', x0: 36, x1: 44, y0: 17, y1: 19 }]; r.eelFineInWater = P.problems(MKR.doc).length === 0;
    /* the real mouse */
    const frame = () => new Promise(f => requestAnimationFrame(() => requestAnimationFrame(f)));
    const ev = (type, bx, by, o = {}) => { const [x, y] = MKR.toScreen(bx, by); const t = type === 'mouseup' ? window : document.getElementById('c');
      t.dispatchEvent(type === 'wheel' ? new WheelEvent('wheel', { clientX: x, clientY: y, bubbles: true, cancelable: true, ...o }) : new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, ...o })); };
    MKR.doc = MKR.blank(200, 28); MKR.mount(); await frame();
    const x0 = MKR.cam.x; for (let i = 0; i < 6; i++) ev('wheel', 300, 200, { deltaY: 100 }); r.wheelMoves = MKR.cam.x > x0 + 100;
    const x1 = MKR.cam.x, n0 = MKR.doc.grid.filter(v => v).length;
    ev('mousedown', 200, 200, { button: 1 }); ev('mousemove', 360, 200, { button: 1 }); ev('mouseup', 360, 200, { button: 1 });
    r.dragPans = Math.abs(MKR.cam.x - (x1 - 160)) < 2; r.dragPaintsNothing = MKR.doc.grid.filter(v => v).length === n0;
    BK.step(1);   /* one drawn frame: the MAP learns where it is when it is drawn */
    const m = (await import('/src/maker-ui.js')).mapRect(), mx = m.x + m.w - 3, my = m.y + m.h / 2; r.map = [Math.round(m.x), Math.round(m.y), m.w, m.h];
    ev('mousedown', mx, my, { button: 0 }); ev('mouseup', mx, my, { button: 0 });   /* the right end of the MAP (bottom right) */ r.mapJumps = MKR.cam.x > MKR.doc.W * 16 - 900; r.mapPaintsNothing = MKR.doc.grid.filter(v => v).length === n0;
    return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  for (const k of ['undoWider', 'undoNew', 'buriedRefused', 'coveredGone', 'eelFlagged', 'eelFineInWater', 'wheelMoves', 'dragPans', 'dragPaintsNothing', 'mapJumps', 'mapPaintsNothing'])
    assert(r[k], 'maker editing: ' + k + ' failed ' + JSON.stringify(r));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-editing: undo keeps the size, pieces never go in the ground, water kinds are flagged out of water, the wheel, a middle drag and the MAP move the view.');
} finally { pg.close(); }
