import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false,fonts:false});
try {
  // This measures navigation, not rendering: stop the unattended animation loop between control calls.
  await pg.evalp('BK.manualSimulation=true',10000);
  const began=Date.now();
  await assert.rejects(pg.evalp('new Promise(() => {})',50),/did not answer|timed out|timeout/i);
  assert.ok(Date.now()-began<5000,'an unresolved browser promise must have a bounded protocol wait');
  for(let i=0;i<20;i++){
    console.log('Fresh-page recovery '+(i+1)+'/20');
    await pg.reload();
    assert.equal(await pg.evalp('BK.manualSimulation=true; !!window.BK && !window.__labReloading',10000),true);
  }
  assert.deepEqual(pg.errors,[]);
  console.log('Unresolved evaluations time out; twenty fresh pages initialize after recovery.');
} finally {pg.close();}
