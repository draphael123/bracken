/* tools/nightwalk-probe.mjs (claude/nightwalk) what the page exposes with the four road flags on. BRACKEN_ROAD=ww,sk,mn,ac PORT=n node tools/nightwalk-probe.mjs */
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false, noWait: true });
try {
  await new Promise(r => setTimeout(r, 25000));
  const st = await pg.evalp(`({ bk: typeof window.BK, href: location.href, flags: [window.__WW, window.__SK, window.__MN, window.__AC].join() })`, 5000).catch(e => 'evalerr ' + e.message);
  console.log(JSON.stringify(st)); console.log('errors', JSON.stringify(pg.errors.slice(0, 6)));
} finally { pg.close(); }
