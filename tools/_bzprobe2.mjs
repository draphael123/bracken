import { openPage } from './cdp.mjs';
import { fightJs } from './boss-run.mjs';
const pg = await openPage({ audio: false, fonts: false });
for (const h of ['knight', 'berserker']) {
  let { js } = fightJs({ r: 'storm', way: 'practiced', h, s: 1, profile: 'human', flasks: 'kit' }, 30);
  js = js.replace("BK.bossLab({", "BK.bossLab({onFrame:(o)=>{const P=BK.P;(window.__lg=window.__lg||[]);if(window.__lg.length<12&&o.f%10===0)window.__lg.push([o.f,Math.round(P.hp),Math.round(P.x),Math.round(P.y),P.ground?1:0,o.boss&&o.boss.mode].join(','));},");
  await pg.reload();
  const r = await pg.evalp(js, 300000);
  console.log(h, r.outcome, r.secs, r.maxHp, r.taken, await pg.evalp("(window.__lg||[]).join(' | ')"));
}
pg.close();
