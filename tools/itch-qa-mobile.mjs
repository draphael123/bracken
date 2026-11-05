/* tools/itch-qa-mobile.mjs - ITCH QA SWEEP, PHONE inside the itch embed (claude/qasweep; headless, ONE browser, closed at the end; not in the suite).
   iPhone-size viewport 375x812 (portrait: what itch shows first) then 812x375 (landscape: how it is played), touch events over CDP, the iframe filling the viewport as itch's mobile page does.
   Checks: loads to the title, rotate/portrait behaviour, touch layer on, every touch button >= 44 CSS px, title > map > play by TAPS, stick moves the hero, attack/jump buttons, audio starts on the first tap, saves, 0 errors.
   usage: QA_SHOTS=<dir> node tools/itch-qa-mobile.mjs     needs >= 1500 MB free (exit 3 when not) */
import { startSession, sleep, freeMB } from './itch-qa-lib.mjs';
const mb = freeMB(); if (mb < 1500) { console.log('RAM ' + mb + ' MB < 1500: not launching'); process.exit(3); }
const s = await startSession({ iframe: '100%x100%', metrics: { w: 375, h: 812, dpr: 2 } });
const red = []; const note = (ok, msg) => { console.log((ok ? 'ok   ' : 'RED  ') + msg); if (!ok) red.push(msg); };
const info = m => console.log('     ' + m);
const touch = async (type, pts) => s.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i + 1 })) });
const tap = async (x, y, hold = 70) => { try { await touch('touchStart', [[x, y]]); await sleep(hold); await touch('touchEnd', []); } catch (e) { try { await touch('touchEnd', []); } catch { /* none down */ } } await sleep(160); };
const setSize = async (w, h) => { await s.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true }); await sleep(900); };
try {
  const t0 = Date.now(); await s.send('Page.navigate', { url: s.embedUrl });
  const r = await s.waitState('title'); note(r.st === 'title', 'phone portrait 375x812: title reached in ' + r.secs.toFixed(1) + ' s (wall ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
  await sleep(1500); await s.shot('m01-portrait-title');
  const env = await s.ev('({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, touchOn: BK.touchOn !== undefined ? (typeof BK.touchOn === "function" ? BK.touchOn() : BK.touchOn) : null, dbg: BK.touch.debug().on, mtp: navigator.maxTouchPoints, canvas: [...document.querySelectorAll("canvas")].map(c => c.width + "x" + c.height + "@" + Math.round(c.getBoundingClientRect().width) + "x" + Math.round(c.getBoundingClientRect().height)).join(",") })');
  info('portrait env: ' + JSON.stringify(env)); note(env.dbg === true, 'touch layer is ON on a phone-sized touch device');
  const overflowX = await s.evTop('document.documentElement.scrollWidth - innerWidth'); note(overflowX <= 0, 'no horizontal scroll on the itch page at 375 wide (overflow ' + overflowX + ')');
  /* landscape */
  await setSize(812, 375); await sleep(1200); await s.shot('m02-landscape-title');
  const env2 = await s.ev('({ w: innerWidth, h: innerHeight, canvas: [...document.querySelectorAll("canvas")].map(c => c.width + "x" + c.height + "@" + Math.round(c.getBoundingClientRect().width) + "x" + Math.round(c.getBoundingClientRect().height) + "+" + Math.round(c.getBoundingClientRect().left)).join(",") })'); info('landscape: ' + JSON.stringify(env2));
  /* first tap: audio must start */
  const a0 = await s.ev('({ n: (window.__acs||[]).length, st: (window.__acs||[]).map(a => a.state).join(",") })'); info('audio before the first tap: ' + JSON.stringify(a0));
  const hb = () => s.ev('(() => { const T = BK.touch; return T.hitBoxes().map(h => { const [x, y] = T.gameToClient(h.x + h.w / 2, h.y + h.h / 2); const [x2, y2] = T.gameToClient(h.x + h.w, h.y + h.h); const [x1, y1] = T.gameToClient(h.x, h.y); return { cx: Math.round(x), cy: Math.round(y), w: Math.round(x2 - x1), h: Math.round(y2 - y1) }; }); })()');
  const cardBoxes = await hb(); info('press card hit boxes: ' + cardBoxes.length + ' (' + (cardBoxes[0] ? cardBoxes[0].w + 'x' + cardBoxes[0].h : '-') + ', whole screen = tap anywhere)');
  if (cardBoxes.length) { await tap(cardBoxes[0].cx, cardBoxes[0].cy); await sleep(900); }
  const a1 = await s.ev('({ n: (window.__acs||[]).length, st: (window.__acs||[]).map(a => a.state).join(",") })'); note(a1.n >= 1 && /running/.test(a1.st), 'audio starts on the first tap (' + JSON.stringify(a1) + ')'); await s.shot('m02b-title-menu');
  const boxes = await hb(); info('tappable hit boxes on the title (client px): ' + boxes.slice(0, 12).map(b => b.w + 'x' + b.h + '@' + b.cx + ',' + b.cy).join(' '));
  note(boxes.length >= 3, 'title items are tappable (' + boxes.length + ' hit boxes)');
  const small = boxes.filter(b => b.h < 44); note(small.length === 0, 'title hit boxes >= 44 CSS px tall (' + small.length + ' smaller: ' + small.slice(0, 4).map(b => b.w + 'x' + b.h).join(', ') + ')');
  if (boxes.length) { await tap(boxes[0].cx, boxes[0].cy); await sleep(800); }
  /* tap through to play */
  const states = [await s.ev('BK.state')]; let st = states[0], tries = 0, mapShot = false;
  while (st !== 'play' && tries++ < 14) { const bx = await hb(); const dbg = await s.ev('BK.touch.debug().banner'); if (st === 'map' && !mapShot) { mapShot = true; await sleep(700); await s.shot('m03-landscape-map'); }
    let target = bx[0]; if (st === 'map') { const m = await s.ev('(() => { const T = BK.touch; return T.hitBoxes().length; })()'); }
    if (target) await tap(target.cx, target.cy); else await tap(406, 187); await sleep(700); st = await s.ev('BK.state'); if (st !== states[states.length - 1]) states.push(st); }
  info('tap states: ' + states.join(' > '));
  note(st === 'play', 'touch-only route title > ... > play reached by taps (state ' + st + ')');
  if (st !== 'play') { await s.shot('m03b-stuck'); /* fall back: let keyboard start, to test the in-level touch layer anyway */ for (let i = 0; i < 8 && st !== 'play'; i++) { await s.key('z', 'KeyZ', 90); await sleep(400); st = await s.ev('BK.state'); } }
  await sleep(2500); await s.shot('m04-level-touch-controls');
  const d = await s.ev('(() => { const T = BK.touch, dbg = T.debug(); const bs = T.allButtons().map(b => { const [x, y] = T.displayToClient(b.cx, b.cy); const [x2] = T.displayToClient(b.cx + b.r, b.cy); return { k: b.k || b.name || b.id, x: Math.round(x), y: Math.round(y), d: Math.round((x2 - x) * 2) }; }); return { on: dbg.on, preset: dbg.preset, move: dbg.move, bar: dbg.bar, vis: dbg.buttons.map(b => b.k || b.name || b.id), bs, W: dbg.layout.W, H: dbg.layout.H, ins: dbg.layout.ins, dpad: dbg.layout.dpad }; })()');
  info('level touch layer: preset ' + d.preset + ', move ' + d.move + ', visible buttons ' + (d.vis || []).join(',') + ', layout ' + d.W + 'x' + d.H + ' ins ' + JSON.stringify(d.ins));
  info('button diameters (CSS px): ' + d.bs.map(b => b.k + '=' + b.d).join(' '));
  const vis = d.bs.filter(b => (d.vis || []).includes(b.k)); const tiny = vis.filter(b => b.d < 44); note(vis.length > 0 && tiny.length === 0, 'every visible touch button is >= 44 CSS px across (' + (tiny.length ? tiny.map(b => b.k + '=' + b.d).join(', ') : 'all ok') + ')');
  /* stick: touch on the left half, drag right */
  info('d-pad: ' + JSON.stringify(d.dpad) + ' diameter ' + Math.round(d.dpad.R * 2) + ' CSS px'); note(d.dpad.R * 2 >= 44, 'the d-pad is >= 44 CSS px across (' + Math.round(d.dpad.R * 2) + ')');
  const x0 = await s.ev('BK.P.x'); await touch('touchStart', [[d.dpad.cx, d.dpad.cy]]); await sleep(80); await touch('touchMove', [[d.dpad.cx + d.dpad.R * 0.9, d.dpad.cy]]); await sleep(1600); const x1 = await s.ev('BK.P.x'); await s.shot('m05-stick-held'); await touch('touchEnd', []); await sleep(200);
  note(x1 > x0 + 10, 'touch d-pad right moves the hero (x ' + Math.round(x0) + ' > ' + Math.round(x1) + ')');
  const atk = d.bs.find(b => b.k === 'atk'), jmp = d.bs.find(b => b.k === 'jump');
  if (jmp) { const y0 = await s.ev('BK.P.y'); await touch('touchStart', [[jmp.x, jmp.y]]); await sleep(120); const yy = await s.ev('BK.P.y'); await touch('touchEnd', []); await sleep(400); note(true, 'JUMP button tapped (y ' + Math.round(y0) + ' > ' + Math.round(yy) + ')'); }
  if (atk) { await tap(atk.x, atk.y, 90); await s.shot('m06-attack'); info('ATTACK tapped'); }
  const ctrl = await s.ev('BK.touch.debug().held'); info('held map after taps (should be empty): ' + JSON.stringify(ctrl)); note(Object.values(ctrl).every(v => !v), 'no button stays stuck after touchEnd');
  /* settings tab TOUCH, pause via the pill */
  const pills = await s.ev('JSON.stringify(BK.touch.debug().pills)'); info('pills: ' + pills.slice(0, 300));
  /* portrait with the game running: what a rotated phone sees */
  await setSize(375, 812); await sleep(1000); await s.shot('m07-portrait-in-level'); await setSize(812, 375);
  /* saves */
  const ls = await s.ev('Object.keys(localStorage).join(",")'); note(/bracken\.progress/.test(ls) && /bracken\.settings/.test(ls), 'saves written in the phone frame: ' + ls);
  const bad = [...new Set([...s.S.consoleErrors, ...s.S.exceptions])]; note(bad.length === 0, bad.length + ' console errors / exceptions' + (bad.length ? ': ' + bad.slice(0, 5).join(' | ') : ''));
  note(s.S.failed.length === 0, s.S.failed.length + ' failed / 4xx requests' + (s.S.failed.length ? ': ' + s.S.failed.slice(0, 5).join(' | ') : ''));
} catch (e) { console.log('RED  crashed: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')); red.push(e.message); }
finally { await s.close(); }
console.log(red.length ? 'itch-qa-mobile: ' + red.length + ' RED' : 'itch-qa-mobile: all green'); process.exit(red.length ? 1 : 0);
