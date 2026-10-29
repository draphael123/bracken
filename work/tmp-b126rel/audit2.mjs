import { openPage } from '../../tools/cdp.mjs';
let paused = null; const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false, args: ['--js-flags=--expose-gc --max-old-space-size=2048'], onEvent: m => { if (m.method === 'Debugger.paused') paused = m.params; } });
try {
  await pg.send('Debugger.enable', {}, 20000);
  const ids = await pg.evalp(`(async () => { window.__LV = (await import('/src/level.js')).LEVELS; BK.manualSimulation = true; BK.god = true; return __LV.map(l => l.id); })()`);
  for (let i = 0; i < ids.length; i++) {
    const r = await pg.evalp(`(() => { try { BK.load(${i}); BK.state = 'play'; BK.sim(5); BK.step(2); return 'ok'; } catch (e) { return 'ERR ' + e.message; } })()`, 25000).catch(e => 'TIMEOUT');
    if (r !== 'ok') console.log(ids[i], r);
    if (r === 'TIMEOUT') {

      await pg.send('Debugger.pause', {}, 60000).catch(e => console.log('pause', e.message));
      for (let k = 0; k < 100 && !paused; k++) await sleep(200);
      if (paused) for (const f of paused.callFrames.slice(0, 16)) console.log('  at ' + (f.functionName || '(anon)') + ' ' + f.url.split('/').pop() + ':' + (f.location.lineNumber + 1) + ':' + f.location.columnNumber);
      else console.log('no paused event');
      if (paused) { const top = paused.callFrames[0];
        for (const sc of top.scopeChain.slice(0, 2)) { const props = await pg.send('Runtime.getProperties', { objectId: sc.object.objectId, ownProperties: true }, 20000).catch(() => null);
          if (props && props.result && props.result.result) console.log('  scope ' + sc.type + ': ' + props.result.result.slice(0, 25).map(p => p.name + '=' + (p.value ? (p.value.value !== undefined ? JSON.stringify(p.value.value) : p.value.type) : '?')).join(' ')); } }
      process.exit(3);
    }
  }
  console.log('done no hang');
} finally { await pg.close(); }
