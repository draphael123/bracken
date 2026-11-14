/* tools/gq6hitch-still.mjs - GQ6HITCH: pixel identity of the game picture on other levels with the flags OFF (run in two checkouts and compare the lines).
     node tools/gq6hitch-still.mjs [--on] [--levels=a,b,c]    one line per level: id + FNV hash of the whole picture (BK.buf pixels) after 90 frames, then after a resolve (BK.tileProbe().resolve) + 30 frames
   Without --on the flags are off (master's behaviour). A measuring tool, not a check. */
import { openPage } from './cdp.mjs';
const a = process.argv.slice(2); const on = a.includes('--on'); if (on) { process.env.BRACKEN_GQ6S2 = '1'; process.env.BRACKEN_GQ6S3 = '1'; } else { delete process.env.BRACKEN_GQ6S2; delete process.env.BRACKEN_GQ6S3; }
const lv = (a.find(x => x.startsWith('--levels=')) || '').slice(9);
const pg = await openPage({ audio: false, fonts: true, seed: 7 });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const ids = ${JSON.stringify(lv)} ? ${JSON.stringify(lv)}.split(',') : null; const pick = ids || [LEVELS[0].id, LEVELS[Math.floor(LEVELS.length / 3)].id, LEVELS[Math.floor(2 * LEVELS.length / 3)].id, 'crown'];
    const cv = document.createElement('canvas'), out = [];
    const hashBuf = () => { cv.width = BK.buf.width; cv.height = BK.buf.height; const c = cv.getContext('2d', { willReadFrequently: true }); c.drawImage(BK.buf, 0, 0); const d = c.getImageData(0, 0, cv.width, cv.height).data; let h = 2166136261; for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
    for (const id of pick) { const i = LEVELS.findIndex(l => l.id === id); if (i < 0) { out.push(id + ' missing'); continue; }
      BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.state = 'play'; BK.god = true; BK.step(90); const h1 = hashBuf(); BK.tileProbe().resolve(); BK.step(30); const h2 = hashBuf(); out.push(id + ' ' + h1 + ' ' + h2); }
    return out; })()`, 600000);
  console.log((on ? 'ON ' : 'OFF ') + JSON.stringify(r));
} finally { pg.close(); }
