import { openPage } from '../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const code = process.argv[2];
  console.log(JSON.stringify(await pg.evalp(code, 600000), null, 0));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
