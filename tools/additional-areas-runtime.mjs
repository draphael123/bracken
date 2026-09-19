import assert from 'node:assert/strict';
import fs from 'node:fs';
import {openPage} from './cdp.mjs';
const pg=await openPage({port:5996});
try{const r=await pg.evalp(fs.readFileSync(new URL('./fixtures/additional-areas-browser.js',import.meta.url),'utf8'));assert.equal(r.results.length,2);assert(r.results.every(r=>r.gateOpen&&r.exit==='win'&&r.audioSeconds>=40));assert.deepEqual(pg.errors,[]);console.log('Harbor and burial mini-bosses activate, defeat opens their gates, exits finish both levels, and original music decodes.');}finally{pg.close();}
