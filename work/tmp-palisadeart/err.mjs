import { openPage } from '../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { await new Promise(r => setTimeout(r, 3000)); console.log(JSON.stringify(pg.errors.slice(0, 5)).slice(0, 1500)); } finally { await pg.close(); }
process.exit(0);
