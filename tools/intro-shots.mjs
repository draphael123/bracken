// tools/intro-shots.mjs - pictures of the living title scene (claude/intro): the walk-in, the idle scene with the hint, reduce-motion, and (later) an attract clip. Not in the suite.
// usage: PORT=<free port> node tools/intro-shots.mjs <outdir> <tag> [walk|touch|reduce|all]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.argv[2] || 'work/claude/intro'), tag = process.argv[3] || 'shot', which = process.argv[4] || 'all'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
const snap = async name => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(out, tag + '-' + name + '.png'), Buffer.from(r.result.data, 'base64')); console.log(join(out, tag + '-' + name + '.png')); };
const pause = ms => new Promise(r => setTimeout(r, ms));
const want = k => which === 'all' || which === k;
try {
  if (want('walk')) {
    await pg.evalp(`BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.SET.reduceMotion = false; BK.ui.pressCard = true; BK.state = 'title'; BK.step(2); 0`);
    let at = 0;
    for (const s of [0.4, 1.2, 2.2, 3.2, 4.4, 6.5]) { const n = Math.round((s - at) * 60); at = s; await pg.evalp(`BK.step(${n}); 0`); await pause(120); await snap('walk-' + String(s).replace('.', '_') + 's'); }
    await pg.evalp(`BK.step(240); 0`); await pause(120); await snap('idle-hint');
    await pg.evalp(`BK.ui.pressCard = false; BK.step(1); 0`); await pg.evalp(`BK.ui.pressCard = true; 0`);
    console.log('introS now', await pg.evalp('BK.ui.introS()'));
  }
  if (which === 'touch') {   /* a phone: ?touch=1, landscape, real time (the prompt says TAP TO START, the sign sits mid-screen; a tap slides it left for the tall board) */
    await pg.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
    await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1&nosw&noattract' }); await pause(2500);
    for (let i = 0; i < 160; i++) { const r = await pg.evalp('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false); if (r) break; await pause(300); }
    await pause(1800); await snap('touch-walk'); await pause(3500); await snap('touch-idle');
    await pg.evalp('BK.ui.pressCard = false; 0'); await pause(900); await snap('touch-after-tap');
  }
  if (which === 'attract') {   /* the attract clips: a still two seconds and seven seconds into each, and the return to the title on a press */
    await pg.evalp(`BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.SET.reduceMotion = false; BK.ui.pressCard = false; BK.state = 'title'; BK.ui.attract.force = true; BK.step(3); 0`);
    await pg.evalp(`BK.ui.attract.idle = 25; 0`);
    for (let i = 0; i < 80 && !(await pg.evalp('BK.ui.attract.on')); i++) { await pg.evalp('BK.step(5); 0'); await pause(60); }
    let last = -1, shots = 0;
    for (let g = 0; g < 4000 && (await pg.evalp('BK.ui.attract.on')) && shots < 8; g++) {
      const c = await pg.evalp('BK.ui.attract.clip'), t = await pg.evalp('BK.ui.attract.t');
      if (c !== last) { last = c; var done2 = false, done7 = false; }
      if (!done2 && t >= 2) { done2 = true; await snap('attract-clip' + c + '-2s'); shots++; }
      if (!done7 && t >= 7) { done7 = true; await snap('attract-clip' + c + '-7s'); shots++; }
      await pg.evalp('BK.step(15); 0'); await pause(20);
    }
    await pg.evalp('BK.ui.attract.next(); BK.step(3); 0');
    await pg.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 }); await pg.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
    await pg.evalp('BK.step(40); 0'); await pause(150); await snap('attract-return-title');
  }
  if (want('reduce')) {
    await pg.evalp(`BK.SET.reduceMotion = true; BK.ui.pressCard = true; BK.state = 'title'; BK.step(30); 0`); await pause(120); await snap('reduce');
    await pg.evalp(`BK.SET.reduceMotion = false; 0`);
  }
  if (want('after')) {
    await pg.evalp(`BK.SET.reduceMotion = false; BK.ui.pressCard = true; BK.ui.introAt = null; BK.state = 'title'; BK.step(60 * 7); 0`);
    await pg.evalp(`BK.ui.pressCard = false; BK.step(6); 0`); await pause(120); await snap('after-press-0_1s');
    await pg.evalp(`BK.step(60); 0`); await pause(120); await snap('after-press-1s');
  }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
