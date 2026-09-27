/* tools/oreroad-walk.mjs [heroes] — F9 for THE ORE ROAD (docs/briefs/ore-road-mine-life.md): the in-page play bot (src/playtest.js),
   NO god mode, start to gate, once per hero (default knight,warden), then the sweep for art/geometry findings. Prints how far it
   got, where it died, and every finding. Not in the suite: it is long, and the bot cannot fight (RULES M) - it proves nothing
   crashes, floats or strands, not that the level is completable. */
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden').split(',');
const pg = await openPage({ audio: false, fonts: false });
try {
  /* BK.playtest plays whoever is the hero (its 'heroes' option is read by nothing), so each hero is set before its own run */
  const r = await pg.evalp(`(async()=>{ const out = [];
    for (const h of ${JSON.stringify(heroes)}) { BK.setHero(h); const rep = await BK.playtest({ levels: ['oreroad'], mode: 'both', quiet: true, log: false }); out.push('==== ' + h.toUpperCase(), rep.text); }
    return out.join(String.fromCharCode(10)); })()`, 1800000);
  console.log(r);
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
