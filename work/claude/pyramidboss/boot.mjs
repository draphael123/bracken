// work/claude/pyramidboss/boot.mjs - the page's boot errors (a probe)
import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false, noWait: true });
try { await new Promise(r => setTimeout(r, 15000)); console.log('errors', JSON.stringify(pg.errors).slice(0, 2000)); console.log(await pg.evalp('typeof window.BK', 5000)); } finally { pg.close(); }
