/* tools/maker-extras.mjs (claude/maker) - THE MAKER's extras hold.
   1. TEST AS another hero: the run is that hero, and your own hero is back afterwards.
   2. SMART HILLS: painting tops makes a hill with a ramp at every one-tile step, and the knight walks over it.
   3. THE EXAMPLES: each has no problem piece, a goal, and plays without an error.
   4. THE GUIDE: each step is ticked off by doing it, in order.
   5. A STROKE PAINTS EVERY CELL IT CROSSES (a quick mouse drag), and TOUCH works: a finger paints a line, a long press opens
      a piece's settings, and the ERASE brush takes a piece.   node tools/maker-extras.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(0), audio: false, seed: 10 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'); MKR.enter(); const UI = await import('/src/maker-ui.js'); UI.closePanel();
    const r = {}, heroOf = () => BK.P.hero;
    let d = MKR.blank(60, 28); d.ents = [{ t: 'gate', x: 55, y: 19 }]; d.hero = 'reaper'; MKR.doc = d; MKR.mount();
    const mine = heroOf(); MKR.play(); BK.step(10); r.heroDuring = heroOf() === 'reaper'; MKR.resume(); r.heroBack = heroOf() === mine;
    d = MKR.blank(80, 28); d.ents = [{ t: 'gate', x: 75, y: 19 }]; d.start = { x: 20, y: 19 }; MKR.doc = d; MKR.mount(); MKR.select(0, P.TILES.findIndex(t => t[1] === 'hill'));
    [[30, 19], [31, 18], [32, 17], [33, 17], [34, 18], [35, 19]].forEach(([x, y]) => MKR.place(x, y));
    r.ramps = [[29, 19, 20], [30, 18, 20], [31, 17, 20], [34, 17, 21], [35, 18, 21], [36, 19, 21]].every(([x, y, v]) => d.grid[y * 80 + x] === v);
    MKR.play(); BK.god = true; BK.step(20); dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); let top = 99; for (let i = 0; i < 40; i++) { BK.step(10); top = Math.min(top, BK.P.y / 16); }
    dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' })); r.overHill = top <= 17.1 && BK.P.x / 16 > 37; MKR.resume();
    r.examples = P.EXAMPLES.map(ex => { const e = ex.make(); let err = ''; MKR.doc = e; MKR.mount(); try { MKR.play(); BK.god = true; BK.step(90); } catch (x) { err = x.message; } MKR.resume();
      return ex.name + ':' + P.problems(e).length + ':' + (e.ents.some(q => q.t === 'gate') ? 'gate' : 'NOGATE') + (err ? ':' + err : ''); });
    const g = P.guideDoc(), c = { played: false }, st = () => P.GUIDE.findIndex(s => !s.last && !s.done(g, c)), steps = [st()];
    for (let x = 22; x <= 27; x++) g.grid[20 * g.W + x] = 1; steps.push(st()); g.ents.push({ t: 'sprig', x: 10, y: 19 }); steps.push(st());
    P.hillPaint(g, 40, 19); steps.push(st()); g.ents.push({ t: 'gate', x: 65, y: 19 }); steps.push(st()); c.played = true; steps.push(st()); r.guide = steps.join(',');
    d = MKR.blank(120, 28); d.ents = [{ t: 'gate', x: 110, y: 19 }, { t: 'sprig', x: 20, y: 19 }]; MKR.doc = d; MKR.mount(); BK.step(1);
    const cv = document.getElementById('c'), pt = (tx, ty) => MKR.toScreen(tx * 16 + 8 - Math.round(MKR.cam.x), ty * 16 + 8 - Math.round(MKR.cam.y));
    const me = (type, tx, ty) => { const [x, y] = pt(tx, ty); (type === 'mouseup' ? window : cv).dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, button: 0 })); };
    MKR.select(0, 1); me('mousedown', 40, 14); me('mousemove', 47, 14); me('mouseup', 47, 14); r.mouseStroke = [40, 41, 42, 43, 44, 45, 46, 47].every(x => d.grid[14 * 120 + x] === 1);
    const tl = ps => ps.map((p, i) => new Touch({ identifier: i + 1, target: cv, clientX: p[0], clientY: p[1] }));
    const T = (type, ps, live) => cv.dispatchEvent(new TouchEvent(type, { touches: tl(live || ps), changedTouches: tl(ps), cancelable: true, bubbles: true }));
    T('touchstart', [pt(30, 15)]); T('touchmove', [pt(36, 15)]); T('touchend', [pt(36, 15)], []); r.touchStroke = [30, 31, 32, 33, 34, 35, 36].every(x => d.grid[15 * 120 + x] === 1);
    T('touchstart', [pt(20, 19)]); await new Promise(res => setTimeout(res, 700)); T('touchend', [pt(20, 19)], []); r.longPress = !!UI.pieceOpen(); UI.closePanel();
    MKR.select(0, 0); MKR.place(20, 19); r.eraseBrush = !d.ents.some(e => e.t === 'sprig');
    return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  for (const k of ['heroDuring', 'heroBack', 'ramps', 'overHill', 'mouseStroke', 'touchStroke', 'longPress', 'eraseBrush']) assert(r[k], 'maker extras: ' + k + ' failed ' + JSON.stringify(r));
  for (const e of r.examples) assert(/:0:gate$/.test(e), 'an example is not clean: ' + e);
  assert.equal(r.guide, '0,1,2,3,4,-1', 'the guide does not tick off in order');
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-extras: test-as-hero, smart hills, the examples, the guide, gap-free strokes and touch all hold.');
} finally { pg.close(); }
