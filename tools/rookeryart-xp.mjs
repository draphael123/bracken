/* tools/rookeryart-xp.mjs - add ONLY THE ROOKERY's row to tools/fixtures/campaign-xp.json (claude/rookeryart): the page's BK.xpSim() road, the other rows untouched
   (boss-level.mjs --write-xp rewrites every row; this lane adds the one it owns). Prints the rookery's and the Sky Road's campaign level before / after. */
import { openPage } from './cdp.mjs';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
const XP_FILE = fileURLToPath(new URL('./fixtures/campaign-xp.json', import.meta.url));
const pg = await openPage({ audio: false, fonts: false });
try {
  const rows = await pg.evalp('BK.xpSim()', 600000), r = rows.find(q => q.id === 'rookery'); if (!r) throw new Error('no rookery row from xpSim');
  const j = JSON.parse(readFileSync(XP_FILE, 'utf8')); j.rows.rookery = { run: Math.round(0.8 * r.foeXp) + r.bossXp + r.clear, foeXp: r.foeXp, bossXp: r.bossXp, clear: r.clear };
  writeFileSync(XP_FILE, JSON.stringify(j, null, 1) + '\n'); console.log('rookery row', j.rows.rookery);
} finally { pg.close(); }
process.exit(0);
