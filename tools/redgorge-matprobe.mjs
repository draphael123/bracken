/* tools/redgorge-matprobe.mjs - THE RAPTOR MATRIARCH's fight, read from the inside (claude/redgorgerework; a measuring tool, not a check).
   Plays boss-rates' practiced fight (the same page, profile, campaign level and flasks: tools/boss-run.mjs fightJs) and prints, per fight, her own
   counters at the end (src/raptor-matriarch.js S.n: sluice stuns, lures, wasted waves, basket knock-downs, phase times...).
     PORT=8891 node tools/redgorge-matprobe.mjs [--heroes=knight,warden,pyro] [--seeds=2] [--profile=human] [--flasks=kit|bare] */
import { openRetry, fightJs, line } from './boss-run.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const TRACE = args.includes('--trace'), heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 2), profile = opt('profile', 'human'), flasks = opt('flasks', 'kit');
const pg = await openRetry();
try {
  for (const h of heroes) for (let s = 1; s <= seeds; s++) {
    let { lvl, js } = fightJs({ r: 'redgorge', way: 'practiced', h, s, profile, flasks });
    if (TRACE) js = js.replace("healthMode:'normal',", "healthMode:'normal',onFrame:(o)=>{const S=window.__RM_S;if(!S)return;const k=S.ph+': '+o.why;const W=window.__RMW=window.__RMW||{};W[k]=(W[k]||0)+1;},");   /* --trace: what the bot's hands were doing, frames per phase */
    await pg.reload();
    const row = await pg.evalp(js, 1200000);
    const S = await pg.evalp('(()=>{const S=window.__RM_S;return S?{ph:S.ph,clock:Math.round(S.clock||0),n:S.n,hurt:S.hurt||null}:null})()', 20000);
    const n = S ? S.n : {};
    if (TRACE) { const W = await pg.evalp('window.__RMW||{}', 20000); console.log('   trace: ' + Object.entries(W).sort((a, b) => b[1] - a[1]).slice(0, 28).map(([k, v]) => k + ' ' + (v / 60).toFixed(1) + 's').join(' | ')); }
    console.log(line({ row: 'redgorge', way: 'practiced', hero: h, seed: s, lvl, ...row }).slice(0, 80) + '  maxHp ' + row.maxHp + ' flasks ' + row.flasks0 + ' drank ' + row.drank + ' hurt ' + JSON.stringify(S && S.hurt));
    console.log('   ph ' + (S && S.ph) + ' at ' + JSON.stringify(n.phAt || {}) + '  stuns(sluice) ' + (n.sluiceStuns || 0) + ' lures ' + (n.lures || 0) + ' wasted ' + (n.wasted || 0) + ' releases ' + (n.releases || 0)
      + ' held ' + (n.held || 0) + ' | p2: dives ' + (n.dives || 0) + ' stuns ' + (n.stuns || 0) + ' tangles ' + (n.tangles || 0) + ' griefs ' + (n.griefs || 0) + ' knock ' + (n.knocks || 0) + ' press ' + (n.presses || 0) + ' rides ' + (n.basketRides || 0)
      + ' | p3 ' + (n.p3Staggers || 0) + ' | opens ' + (n.opens || 0) + ' guarded ' + (n.guarded || 0) + ' dunks ' + (n.dunks || 0));
  }
} finally { pg.close(); }
