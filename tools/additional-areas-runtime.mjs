import assert from 'node:assert/strict';
import fs from 'node:fs';
import {openPage} from './cdp.mjs';
import { portFor } from './ports.mjs';
const pg=await openPage({port:portFor(6)});
try{const r=await pg.evalp(fs.readFileSync(new URL('./fixtures/additional-areas-browser.js',import.meta.url),'utf8'));assert.equal(r.results.length,2);assert(r.results.every(r=>r.gateOpen&&r.exit==='win'&&r.audioSeconds>=40));assert.deepEqual(pg.errors,[]);console.log('Harbor bosses and Buried Dead activate, death opens exits, summons clear, both levels finish and music decodes.');}finally{pg.close();}
