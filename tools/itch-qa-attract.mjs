/* tools/itch-qa-attract.mjs - ATTRACT MODE IN THE ITCH BUILD (claude/intro; headless, ONE browser; needs dist-itch/site built: node tools/build-itch.mjs). The bot's modules are bundled chunks there:
   forced on (a webdriver page is off by default), 20 s idle on the title plays the first clip in the iframe, the bot moves, a key press ends it on the title with the cursor where it was, and no localStorage key changed.
   usage: QA_SHOTS=<dir> node tools/itch-qa-attract.mjs      needs >= 1500 MB free (exit 3 when not) */
import { startSession, sleep, freeMB } from './itch-qa-lib.mjs';
const mb = freeMB(); if (mb < 1500) { console.log('RAM ' + mb + ' MB < 1500: not launching'); process.exit(3); }
const s = await startSession({ iframe: '960x540' });
const red = []; const note = (ok, msg) => { console.log((ok ? 'ok   ' : 'RED  ') + msg); if (!ok) red.push(msg); };
try {
  await s.send('Page.navigate', { url: s.embedUrl }); const r = await s.waitState('title'); note(r.st === 'title', 'title reached in the iframe (' + r.secs.toFixed(1) + ' s)');
  await sleep(800); await s.click(480, 270); await sleep(400); await s.key('Shift', 'ShiftLeft', 16); await sleep(1200);   /* the first press (a click, then a harmless key, as the desktop sweep does): the sound is unlocked and the prompt is down */
  const store = () => s.ev('JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))');
  await s.ev('BK.manualSimulation = true; BK.ui.attract.force = true; BK.ui.titleSub = null; BK.ui.titleI = 1; BK.step(3); 0');
  const s0 = await store(); note(await s.ev('BK.ui.pressCard') === false, 'the prompt is down after a key'); note(await s.ev('BK.ui.attract.blocked()') === '', 'nothing blocks it (' + await s.ev('BK.ui.attract.blocked()') + ')');
  await s.ev('BK.ui.attract.idle = 25; 0');
  for (let i = 0; i < 60 && !(await s.ev('BK.ui.attract.on')); i++) { await s.ev('BK.step(5); 0'); await sleep(80); }
  note(await s.ev('BK.ui.attract.on') === true && await s.ev('BK.state') === 'play', 'a clip is on in the itch build (the bundled bot modules loaded)');
  const x0 = await s.ev('BK.P.x'); await s.ev('BK.step(240); 0'); const x1 = await s.ev('BK.P.x'); note(Math.abs(x1 - x0) > 40, 'the bot walks (' + Math.round(x1 - x0) + ' px in 4 s)');
  await s.shot('attract-itch-clip');
  await s.key('ArrowDown', 'ArrowDown', 40); await sleep(150); await s.ev('BK.step(3); 0');
  note(await s.ev('BK.ui.attract.on') === false && await s.ev('BK.state') === 'title', 'a key press ends it on the title');
  await s.ev('BK.step(40); 0'); note(await s.ev('BK.ui.titleI') === 1, 'and was not a menu choice (cursor ' + await s.ev('BK.ui.titleI') + ')');
  note((await store()) === s0, 'no localStorage key or value changed');
  note(s.S.consoleErrors.length + s.S.exceptions.length === 0, '0 console errors / exceptions ' + JSON.stringify([...s.S.consoleErrors, ...s.S.exceptions]).slice(0, 200));
} finally { await s.close(); }
console.log(red.length ? 'itch-qa-attract: ' + red.length + ' RED' : 'itch-qa-attract: all green'); if (red.length) process.exit(1);
