import { openRetry, fightJs, diffJs } from '../../../tools/boss-run.mjs';
const [h, ...seeds] = process.argv.slice(2);
const pg = await openRetry();
try { for (const s of seeds) { await pg.reload(); await pg.evalp(diffJs());
  const { js: js0 } = fightJs({ r: 'flotilla', way: 'practiced', h, s: +s, profile: 'human', flasks: 'kit' }, 240);
  const js = js0.replace('BK.setHero(h);','BK.chTally={};BK.setHero(h);');
  const row = await pg.evalp(js, 1200000);
  const rd = await pg.evalp('(()=>{const r=BK.championHands().read();if(!r)return null;delete r.G;r.landedOn=r.landedOn.slice(-12);return r;})()');
  console.log(h, s, row.outcome, row.secs, 'left', row.bossLeft, 'taken', row.taken, 'opened', row.opened, 'swings', row.swings);
  console.log(rd.landedOn.map(l=>l.name.slice(4,9)+" dx"+l.dx+" g"+(+l.ground)+" d"+l.dodge+" "+l.mode+" | "+l.bot).join(String.fromCharCode(10))); console.log(JSON.stringify(rd.hurt), JSON.stringify(rd.n.moves)); console.log(JSON.stringify(await pg.evalp('BK.chTally'))); } } finally { pg.close(); }
