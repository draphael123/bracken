/* tools/folly-runtime.mjs — THE MAGE'S FOLLY in the page: the co-op counterweight gate and the wizard's defeat. These lived in
   tower-finish-runtime.mjs beside the old Falling Tower checks; the tower's own now live in tower-ascent.mjs (batch 4). */
import{openPage}from'./cdp.mjs';import{readFileSync}from'node:fs';import assert from'node:assert/strict';
const pg=await openPage({port:5996});
try{const r=await pg.evalp(readFileSync(new URL('./fixtures/folly-browser.js',import.meta.url),'utf8'));
 assert(r.rows.some(x=>x.wizardDefeated),'the wizard can be beaten');assert(r.rows.some(x=>x.protectedSecondPlayer),'the counterweight gate waits for the second player');
 assert.deepEqual(pg.errors,[]);console.log('Co-op counterweight clearance and the final wizard defeat pass.',JSON.stringify(r.rows.map(x=>Object.keys(x)[0])));
}finally{pg.close();}
