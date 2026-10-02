import { openPage } from './cdp.mjs';
import { readFileSync } from 'fs';
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(readFileSync(process.argv[2], 'utf8'), 1800000); console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 1)); if (pg.errors.length) console.log('ERR', pg.errors.slice(0, 3)); } finally { pg.close(); }
