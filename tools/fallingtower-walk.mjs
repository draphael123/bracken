/* tools/fallingtower-walk.mjs [heroes] - F9 for THE FALLING TOWER (docs/briefs/falling-tower-rework.md): the in-page play bot
   (src/playtest.js), NO god mode, start to gate, once per hero (default knight,warden), then the sweep for art and geometry
   findings. Prints how far it got, where it died and every finding. Not in the suite: it is long, and the bot cannot fight
   (RULES M), so it proves nothing crashes, floats or strands - not that the level is completable. */
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden').split(',');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const rep=await BK.playtest({levels:['fallingtower'],heroes:${JSON.stringify(heroes)},mode:'both',quiet:true,log:false});return rep.text;})()`, 1800000);
  console.log(r);
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
