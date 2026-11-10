/* tools/maker-settings.mjs (claude/maker) - THE MAKER's LEVEL SETTINGS work.
   Every BACKGROUND (each of the game's own places) draws in the editor and plays; every TIME OF DAY and WEATHER plays;
   a chosen MUSIC track is the one the level plays; and the settings survive SAVE -> LOAD. The page logs no errors.
   node tools/maker-settings.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(5), audio: false, seed: 511 });
try {
  const run = body => pg.evalp(`(async () => { ${body} })()`, 300000);
  const n = await run(`MKR.enter(); (await import('/src/maker-ui.js')).closePanel();   /* a fresh profile opens the HELP card, which (rightly) takes the keys */
    return (await import('/src/level.js')).LEVELS.filter(l => !l.hidden).length;`);
  const bad = [];
  for (let a = 0; a < n; a += 8) bad.push(...await run(`const bad = [];
    for (let t = ${a}; t < Math.min(${n}, ${a + 8}); t++) { const d = MKR.blank(60, 28); d.ents = [{ t: 'gate', x: 55, y: 19 }, { t: 'sprig', x: 30, y: 19 }]; d.theme = t; MKR.doc = d;
      try { MKR.mount(); BK.step(1); MKR.play(); BK.god = true; BK.step(40); BK.tp(28, 19); BK.step(40); if (BK.state !== 'play') bad.push('theme ' + t + ' ended in ' + BK.state); } catch (e) { bad.push('theme ' + t + ': ' + e.message); }
      try { MKR.resume(); } catch (e) { bad.push('theme ' + t + ' back: ' + e.message); } }
    return bad;`));
  const r = await run(`const UI = await import('/src/maker-ui.js'), r = { bad: [] };
    for (const time of UI.TIMES) for (const weather of UI.WEATHERS) { const d = MKR.blank(60, 28); d.ents = [{ t: 'gate', x: 55, y: 19 }]; d.time = time; d.weather = weather; MKR.doc = d;
      try { MKR.play(); BK.step(30); if (time === 'night' && !BK.L.night) r.bad.push('night is not night'); if (weather && weather !== 'clear' && !(BK.L.weather[0] && BK.L.weather[0].kind === weather)) r.bad.push(weather + ' not set'); if (weather === 'clear' && BK.L.weather.length) r.bad.push('clear has weather'); }
      catch (e) { r.bad.push(time + '/' + weather + ': ' + e.message); } try { MKR.resume(); } catch (e) {} }
    const d = MKR.blank(60, 28); d.ents = [{ t: 'gate', x: 55, y: 19 }]; d.theme = 3; d.music = 'musBeach'; d.time = 'dusk'; d.weather = 'snow'; MKR.doc = d;
    MKR.play(); BK.step(5); r.music = BK.L.music; MKR.resume();
    const KEY = 'bracken.level.2', keep = localStorage.getItem(KEY), kd = k => { dispatchEvent(new KeyboardEvent('keydown', { key: k })); dispatchEvent(new KeyboardEvent('keyup', { key: k })); };
    kd('f'); kd('f'); kd('s'); MKR.doc = MKR.blank(60, 28); kd('l');
    r.loaded = [MKR.doc.theme, MKR.doc.music, MKR.doc.time, MKR.doc.weather].join(','); kd('f');
    if (keep === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, keep);
    return r;`);
  console.log('themes', n, JSON.stringify({ bad, ...r }));
  assert.deepEqual(bad, [], 'backgrounds that break: ' + bad.join(' | '));
  assert.deepEqual(r.bad, [], 'times/weathers that break: ' + r.bad.join(' | '));
  assert.equal(r.music, 'musBeach', 'the chosen music is not what plays');
  assert.equal(r.loaded, '3,musBeach,dusk,snow', 'settings did not survive save -> load');
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-settings: all ' + n + ' backgrounds, every time of day and weather play; the chosen music plays; save/load keeps them.');
} finally { pg.close(); }
