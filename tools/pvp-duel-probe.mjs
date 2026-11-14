// PAGE TOOL: launches headless Chrome
// tools/pvp-duel-probe.mjs - hero A against each hero of LIST, N matches each (seats alternate), prints A's wins (claude/pvpduel2).
//   usage: A=warden LIST=knight,pyro N=6 node tools/pvp-duel-probe.mjs      LIST defaults to every other hero
import { openPage } from './cdp.mjs';
import { BOT_HEROES } from '../src/pvp-duel.js';
const ALL = !!process.env.ALL; const A = process.env.A || 'warden', N = +(process.env.N || 6), LIST = process.env.LIST ? process.env.LIST.split(',') : BOT_HEROES.filter(h => h !== A);
let pg = await openPage({ duelBeta: true, audio: false, fonts: false, seed: 5 }); const E = e => pg.evalp(e, 300000);
const di = () => E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__DI=LEVELS.findIndex(l=>l.id==='duel_pit');})()`);
let nPage = 0, tot = 0, totN = 0;
try {
  await di();
  const PAIRS = ALL ? BOT_HEROES.flatMap((a, i) => BOT_HEROES.slice(i + 1).map(b => [a, b])) : LIST.map(b => [A, b]);
  const wins = {}, played = {};
  for (const [A, B] of PAIRS) {
    let w = 0, n = 0;
    for (let s = 1; s <= N; s++) {
      if (nPage >= 6) { await pg.close?.(); pg = await openPage({ duelBeta: true, audio: false, fonts: false, seed: 5 }); await di(); nPage = 0; } nPage++;
      const swap = s % 2 === 0, p1 = swap ? B : A, p2 = swap ? A : B;
      const r = await E(`(async()=>{BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('${p1}');BK.reset({fresh:true});BK.applyUpgrades();BK.load(__DI);BK.start();BK.coopStart('${p2}',false);BK.sim(10);
        const D=BK.duel();D.begin({bots:'all',seed:${s * 31}});let f=0;while(f<21600&&D.debug().m&&D.debug().m.phase!=='over'){BK.sim(60);f+=60;}
        const d=D.debug();return {w:d.m&&d.m.winner};})()`);
      n++; if (r.w === (swap ? 2 : 1)) w++; else if (r.w == null) n--;
    }
    console.log(A + ' v ' + B + ': ' + w + '/' + n + ' (' + Math.round(100 * w / Math.max(1, n)) + '%)'); tot += w; totN += n; wins[A] = (wins[A] || 0) + w; wins[B] = (wins[B] || 0) + n - w; played[A] = (played[A] || 0) + n; played[B] = (played[B] || 0) + n;
  }
  if (ALL) console.log('SHARE ' + BOT_HEROES.map(h => h + ' ' + Math.round(100 * (wins[h] || 0) / Math.max(1, played[h] || 1))).join(', '));
  else console.log('TOTAL ' + A + ' ' + tot + '/' + totN + ' = ' + Math.round(100 * tot / totN) + '%');
} finally { await pg.close?.(); }
