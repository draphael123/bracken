// tools/deathknight-pilot.mjs [salts=1] [heroes=knight,warden,pyro] - THE DEATH KNIGHT (src/unburied-foes.js updateBloodKnight; rebuilt from the
// hero's kit, claude/dk3) at NORMAL health, one pass per salt (bossLab pins its dice per row). One life per fight, no refills; the bot is the HUMAN
// one (src/lab.js bossLab's Death Knight branch: it reads each of his moves ~250 ms late). The hero is the level the campaign expects at THE UNBURIED
// FIELD (its depth on the gate chain, no skills - as tools/combat-pilots.mjs). Prints a row a fight (outcome, seconds, health lost, his health left,
// the phase reached, how often he PASSED, stuck his blade, had his ward broken, healed off a coil) and a summary against the band for a NEW boss
// (50-60% wins, Daniel 10-02; no hero at 0/N). Not in the suite: it is too long. Set PORT to a free port.
//   PORT=6721 node tools/deathknight-pilot.mjs 1,2,3,4 knight,warden,pyro      (12 fights)
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const salts = (process.argv[2] || '1').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro').split(',');
const lvl = Math.max(1, depthsOf(LEVELS).unburied ?? 1);
let pg = await openPage({ audio: false, fonts: false }); const rows = [];
const fresh = async () => { for (let k = 0; ; k++) { try { await pg.reload(); return; } catch (e) { if (k >= 2) throw e; try { pg.close(); } catch {} pg = await openPage({ audio: false, fonts: false }); } } };
try {
  for (const salt of salts) for (const h of heroes) { await fresh();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG,h=${JSON.stringify(h)};P0.xp[h]=xpFloor(${lvl});P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
      const st={};
      const o=await BK.bossLab({bosses:['unburied'],heroes:[h],healthMode:'normal',maxSecs:300,modes:true,salt:${salt},onFrame:({boss,h})=>{const q=st[h]=st[h]||{phase:1};q.phase=Math.max(q.phase,boss.phase||1);q.passes=boss.passes||0;q.stucks=boss.stucks||0;q.breaks=boss.breaks||0;q.healed=boss.healed||0;q.grips=boss.grips||0;q.strings=boss.strings||0;q.greed=boss.greedN||0;}});
      return o.rows.map(r=>({h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),bossLeft:r.hpLeftPct,swings:r.swings,modeN:r.modes,...(st[r.h]||{}),hitBy:r.hitBy}));})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x)); rows.push(...r); }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ boss: 'bloodknight', heroLevel: lvl, fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null,
    byHero: Object.fromEntries(heroes.map(h => [h, rows.filter(r => r.h === h && r.out === 'win').length + '/' + rows.filter(r => r.h === h).length])) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
