// tools/greenteeth-pilot.mjs [salts=1..7] [heroes=knight,warden,pyro] [level=canal] - JENNY GREENTEETH (src/jenny-greenteeth.js) at NORMAL health,
// ONE FIGHT PER PAGE (a fresh page for every hero and salt; bossLab pins its dice per row; docs/INTEGRATOR.md section 6). One life per fight, no refills;
// the bot is the HUMAN one (src/jenny-greenteeth.js PLAN: a quarter-second late, and it misses some). Prints a row a fight (outcome, seconds, health lost,
// her health left, the phase reached, the cycles, her openings - stuck, dazed, aground on the boat, the drain's strand, the flush - and what did the
// damage) and a summary per hero and overall against the new-boss band (50-60% wins, fight ~90-120 s). Not in the suite: it is too long.
//   node tools/greenteeth-pilot.mjs 1,2,3,4,5,6,7      (21 fights: claude/jenny2's measure)
import { openPage } from './cdp.mjs';
const salts = (process.argv[2] || '1,2,3,4,5,6,7').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro').split(',');
const level = process.argv[4] || 'canal';
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const salt of salts) for (const h of heroes) { try { await pg.reload(); } catch { await pg.reload(); }   /* (a slow machine: one retry of the fresh page) */
    const r = await pg.evalp(`(async()=>{const MM=await import('/src/jenny-greenteeth.js');if(!MM.NEW_MOVE)throw new Error('the page is serving another tree');BK.manualSimulation=true;let phase=1,q=null;
      const o=await BK.bossLab({bosses:[${JSON.stringify(level)}],heroes:[${JSON.stringify(h)}],healthMode:'normal',maxSecs:300,modes:true,salt:${salt},onFrame:({boss})=>{phase=Math.max(phase,boss.phase||1);const g=BK.greenteeth();if(g)q={cyc:g.cycle,n:g.n,hurt:g.hurt};}});
      const r=o.rows[0],n=(q&&q.n)||{};return {h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),bossLeft:r.hpLeftPct,phase,cycles:q&&q.cyc,
        stuck:n.stuck,dazed:n.dazed,lure:n.lure,drain:n.drain,flush:n.flush,slams:n.slam,bites:n.bite,charges:n.charge,nets:n.net,held:n.held,hurt:q&&q.hurt};})()`, 3600000);
    console.log(JSON.stringify(r)); rows.push(r); }
  const sum = list => { const wins = list.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
    return { fights: list.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, list.length)), medianWin: secs.length ? secs[secs.length >> 1] : null, medianSecs: list.map(r => r.secs).sort((a, b) => a - b)[list.length >> 1] }; };
  for (const h of heroes) console.log(JSON.stringify({ hero: h, ...sum(rows.filter(r => r.h === h)) }));
  console.log(JSON.stringify({ boss: 'greenteeth', band: '50-60%', ...sum(rows) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
