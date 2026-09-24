// work/claude/page-eval.mjs "<js expression>" — evaluate in the real page (this checkout's port block, slot 7) and print JSON
import { openPage } from '../../tools/cdp.mjs';
import { portFor } from '../../tools/ports.mjs';
const pg = await openPage({ port: portFor(7), audio: false });
try { console.log(JSON.stringify(await pg.evalp(process.argv[2], 600000))); console.log('errors', JSON.stringify(pg.errors.slice(0, 3))); } finally { pg.close(); }
