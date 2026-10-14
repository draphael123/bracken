// tools/fogknight-ledger.mjs - THE FOG KNIGHT 2's fight ledger (claude/towpath2; for the tune lane, not in the suite): one fight per hero and seed, exactly as
// tools/boss-rates.mjs runs it (tools/boss-run.mjs fightJs: campaign level, the human profile, the kit's flasks), then reads his own counters back
// (BK.fogKnight(): what each of his moves took off the hero, how often each came and landed, his openings) - where the fight is won and lost.
//   PORT=8918 node tools/fogknight-ledger.mjs [heroes=knight,warden,pyro] [seeds=1]
import { fightJs, openRetry } from './boss-run.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), seeds = +(process.argv[3] || 1);
for (const h of heroes) for (let s = 1; s <= seeds; s++) {
  const pg = await openRetry();
  try {
    const { js } = fightJs({ r: 'towpath', way: 'practiced', h, s, profile: 'human', flasks: 'kit' }, 240);
    const r = await pg.evalp(js);
    const fk = await pg.evalp('BK.fogKnight && BK.fogKnight()');
    console.log(h, 's' + s, r.outcome, Math.round(r.secs) + 's', 'boss left', r.bossLeft + '%', 'taken', r.taken, 'drank', r.drank);
    if (fk) { console.log('   hurt by:', JSON.stringify(fk.hurt)); const n = fk.n; console.log('   n:', JSON.stringify({ ph: fk.ph, opens: n.opens, burns: n.burns, scatters: n.scatters, landed: n.landed, turned: n.turned, warded: n.warded, reels: n.reels, lashes: n.lashes, hooks: n.hooks, highLashes: n.highLashes, surges: n.surges, surgeHits: n.surgeHits, spearSets: n.spearSets, spearHits: n.spearHits, dplunges: n.dplunges, dplungeHits: n.dplungeHits, cuts: n.cuts, lunges: n.lunges, doubles: n.doubles, steps: n.steps })); }
    if (pg.errors.length) console.log('   PAGE ERRORS:', pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
