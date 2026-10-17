import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false, noWait: true });
await new Promise(r => setTimeout(r, 15000));
console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
console.log(await pg.evalp('typeof window.BK + " " + document.title', 5000).catch(e => String(e)));
pg.close();
