/* tools/unburied-walk.mjs [heroes] — F9 for THE UNBURIED FIELD: the in-page play bot (src/playtest.js), NO god mode, start to
   gate, once per hero (default knight,warden), then the sweep for art/geometry findings. Prints how far it got, where it
   died, and every finding. Not in the suite: it is long, and the bot cannot fight (RULES M) - it proves nothing crashes,
   floats or strands, not that the level is completable. Also checks the store: THE DEATH KNIGHT is buyable for coins once
   the field is cleared and not before. */
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden').split(',');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const out={};
    const P=BK.PROG||{};const was=P.unburied;P.unburied={};out.buyBefore=BK.store.coinRoute('reaper');P.unburied={cleared:true};out.buyAfter=BK.store.coinRoute('reaper');P.unburied=was;
    const rep=await BK.playtest({levels:['unburied'],heroes:${JSON.stringify(heroes)},mode:'both',quiet:true,log:false});
    out.text=rep.text;return out;})()`, 1800000);
  console.log('store: reaper buyable before clearing ' + r.buyBefore + ', after ' + r.buyAfter);
  console.log(r.text);
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
