import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { console.log(await pg.evalp(process.argv[2], 120000)); } finally { pg.close(); }
