// Reopening a cold lab server must not retain an exit listener or its closed child/browser objects per page.
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';
let baseline;
for (let i = 0; i < 3; i++) {
  const pg = await openPage({ audio: false, fonts: false, port: portFor(2) });
  try { assert.equal(await pg.evalp('!!window.BK'), true); } finally { await pg.close(); }
  const count = process.listenerCount('exit');
  if (baseline === undefined) baseline = count; else assert.equal(count, baseline, 'closing a page must remove its server exit hook');
}
console.log('ok cdp-lifecycle: three cold server/page cycles keep a constant exit-listener count (' + baseline + ')');
