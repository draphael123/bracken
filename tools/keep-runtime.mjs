import assert from 'node:assert/strict';
import fs from 'node:fs';
import {openPage} from './cdp.mjs';
const pg=await openPage({port:5996});
try{const r=await pg.evalp(fs.readFileSync(new URL('./fixtures/keep-browser.js',import.meta.url),'utf8'));assert.equal(r.rows.filter(r=>r.exit==='win').length,2);assert.equal(r.audioSeconds,60);assert.deepEqual(pg.errors,[]);console.log('Deep crab and Keep king activate, attacks resolve, both defeats finish their stages, and Keep music decodes.');}finally{pg.close();}
