// tools/hk-probe.mjs - THE HOURGLASS KING, one fight looked into (claude/buriedcity3): the boss lab's fight (tools/boss-run.mjs fightJs) with HIS READ sampled - the
// phase reached, his moves and openings, the damage BY MOVE he dealt, the great hourglass's flips, the drift. Not in the suite: a measuring hand for the tune lane.
//   PORT=8867 node tools/hk-probe.mjs [heroes=knight,warden,pyro] [seeds=1] [profile=human]
import { fightJs, openRetry } from './boss-run.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), seeds = +(process.argv[3] || 1), profile = process.argv[4] || 'human';
const pg = await openRetry();
try {
  for (const h of heroes) for (let s = 1; s <= seeds; s++) {
    const { js } = fightJs({ r: 'buriedcity', way: 'practiced', h, s, profile, flasks: 'kit' }, 240);
    const js2 = js.replace('profile:' + JSON.stringify(profile), 'profile:' + JSON.stringify(profile) + ',onFrame:(o)=>{if(o.f%20===0){const r=BK.hourglassKingHands().read();if(r){window.__hk=r;window.__why=(window.__why||{});window.__why[o.why]=(window.__why[o.why]||0)+1;}}}');
    if (js2 === js) throw new Error('could not hook onFrame');
    await pg.reload(); const row = await pg.evalp(js2.replace(/return \{maxHp/, 'const HKR=window.__hk,WHY=window.__why;return {HKR,WHY,maxHp'), 1200000);
    console.log(h, 's' + s, row.outcome, row.secs + 's', 'left ' + row.bossLeft + '%', 'taken ' + row.taken, 'drank ' + row.drank);
    if (row.HKR) console.log('   ph', row.HKR.ph, 'n', JSON.stringify(row.HKR.n), '\n   hurt', JSON.stringify(row.HKR.hurt));
    if (row.WHY) console.log('   why', JSON.stringify(Object.entries(row.WHY).sort((a, b) => b[1] - a[1]).slice(0, 12)));
  }
} finally { pg.close(); }
