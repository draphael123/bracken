/* tools/audit-bosslab.mjs — THE RANKING'S BOSS NUMBERS (docs/audit/ranking-2026-09-24.md). NOT in the suite.
   Runs BK.bossLab over every arena boss and every mini on the campaign, every hero, one level at a time so a crash
   costs one row not the lot, and writes work/audit/bosslab.json. Dice are pinned per row by src/lab.js, so a rerun
   repeats exactly.
     node tools/audit-bosslab.mjs                 every boss (skips harbor: STORMWRECK is shelved)
     node tools/audit-bosslab.mjs wood,kings:mini  just those (":mini" = the level's mini)
   healthMode 'refill' (default of the lab): the hero never dies, so a long fight is measured to its end and
   damage taken per minute is the danger number. A row that times out is NOT a loss the player would have - it is
   usually a bot that cannot play the boss's mechanic; the report says which. */
import { openPage } from './cdp.mjs';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { LEVELS } from '../src/level.js';

const OUT = new URL('../work/audit/bosslab.json', import.meta.url);
mkdirSync(new URL('../work/audit/', import.meta.url), { recursive: true });
const HEROES = process.env.HEROES ? process.env.HEROES.split(',') : ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper'];
/* KEY suffix: HEROES=reaper writes under 'fallingtower#reaper' so a one-hero rerun does not overwrite the full row */
const SUFFIX = process.env.HEROES ? '#' + process.env.HEROES : '';
let targets = [];
if (process.argv[2]) targets = process.argv[2].split(',').map(s => { const [id, m] = s.split(':'); return { id, mini: m === 'mini' }; });
else for (const lv of LEVELS) { if (lv.id === 'harbor') continue; let L; try { L = lv.build(); } catch { continue; }
  if (L.arena && L.arena.boss) targets.push({ id: lv.id, mini: false }); if (L.mini && L.mini.boss) targets.push({ id: lv.id, mini: true }); }
const maxSecs = +(process.env.MAXSECS || 150);
const res = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const t of targets) {
    const key = t.id + (t.mini ? ':mini' : '') + SUFFIX;
    const t0 = Date.now();
    try {
      /* THE GREAT HOUND carries no `mini` flag in its level entity (kings), so bossLab's mini search (e.t===A.boss && e.mini)
         finds nothing and skips the row. For that row only, the hound is made to answer mini=true
         so the lab can find it. It changes nothing else, and the report says it was done. */
      /* (BK.load cannot be wrapped: window.BK hands bossLab the game's own object. So the flag is a getter on Object.prototype
         that answers `mini` only for a greathound with no own flag, installed for the kings:mini row and removed after it.) */
      const hound = t.id === 'kings' && t.mini;
      const on = hound ? `Object.defineProperty(Object.prototype,'mini',{configurable:true,get(){return this&&this.t==='greathound'?true:undefined;},set(v){Object.defineProperty(this,'mini',{value:v,writable:true,configurable:true,enumerable:true});}});` : '';
      const off = hound ? `delete Object.prototype.mini;` : '';
      const r = await pg.evalp(`(async()=>{BK.SET.speed=1;${on}try{const r=await BK.bossLab({bosses:[${JSON.stringify(t.id)}],heroes:${JSON.stringify(HEROES)},maxSecs:${maxSecs},mini:${t.mini},modes:true});return JSON.parse(JSON.stringify(r.rows));}finally{${off}}})()`, 1800000);
      res[key] = r;
    } catch (e) { res[key] = { error: String(e.message || e).slice(0, 400) }; }
    writeFileSync(OUT, JSON.stringify(res, null, 1));
    const rows = Array.isArray(res[key]) ? res[key] : [];
    console.log(key.padEnd(20), ((Date.now() - t0) / 1000).toFixed(0) + 's', rows.map(r => r.skipped ? r.h + ':skip(' + r.skipped + ')' : r.h + ':' + (r.killed ? 'K' : 'T') + r.secs + 's/' + r.takenPerMin).join(' ') || JSON.stringify(res[key]).slice(0, 200));
  }
  if (pg.errors && pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
