import { openPage } from './tools/cdp.mjs';
import { readFileSync } from 'fs';
console.log('opening'); const pg = await openPage({ audio: false });
console.log('open');
try { console.log(await pg.evalp(readFileSync('probe.js', 'utf8'), 60000)); console.log('errors', JSON.stringify(pg.errors.slice(0, 5))); } catch (e) { console.log('ERR', e.message); } finally { console.log('closing'); pg.close(); console.log('closed'); }
process.exit(0);
