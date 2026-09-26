/* tools/kraken-pilot.mjs [passes=3] [label] [mode=refill|normal|both] [heroes] - THE KRAKEN (the Drowned Causeway's boss) through
   BK.bossLab (src/lab.js): seven heroes, the ranking's settings (refill health, a 150 s cap, speed 1, modes on), and normal health
   (one life, a 300 s cap), dice pinned per row and one salt per pass so pass two is not pass one again (docs/INTEGRATOR.md).
   Prints a row per fight - outcome, seconds, damage taken, the stage he reached and when each began, what hurt him (his ledger:
   arm cuts, crates, the bell, the pin...) and which of his attacks did the damage - and a summary, and writes
   work/causeway2/pilot-<label>.json. Run before and after a change to him (docs/briefs/kraken-rework.md). Not in the suite: too long. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const passes = +(process.argv[2] || 3), label = process.argv[3] || 'run', which = process.argv[4] || 'both';
const HEROES = process.argv[5] ? process.argv[5].split(',') : ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false }), rows = [];
const one = async (p, mode, secs) => {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{BK.SET.speed=1;const seen={},wet={};
    const o=await BK.bossLab({bosses:['causeway'],heroes:${JSON.stringify(HEROES)},healthMode:'${mode}',maxSecs:${secs},modes:true,salt:'kraken-pass-${p}',
      onFrame:({boss,P,h,f})=>{const A=BK.L.arena,line=[610,601,591,584][boss.tideN||0]*16;if(boss.tideN&&P.x>=line&&P.y>A.floor-12&&!P.swim)wet[h]=(wet[h]||0)+1;if(f%30)return;seen[h]={wetS:Math.round((wet[h]||0)/6)/10,tideHits:boss.tideHits||0,stage:boss.stage,turnAt:(boss.turnAt||[]).map(t=>Math.round(t)),ledger:Object.fromEntries(Object.entries(boss.ledger||{}).map(([k,v])=>[k,Math.round(v)])),tides:(boss.tideLog||[]).length,rung:boss.tideRung||0,heals:boss.heals||0,lookCaused:boss.looksCaused||0,spent:boss.spentRung||0,grabs:boss.grabs||0,drowned:boss.drowned||0,rolledOut:boss.rolledOut||0,inks:boss.inks||0};}});
    return o.rows.map(r=>({pass:${p},mode:'${mode}',h:r.h,out:r.outcome||r.skipped,secs:r.secs,hp:r.bossHp,left:r.hpLeftPct,taken:r.health?Math.round(r.health.damageTaken):null,tpm:r.takenPerMin,died:r.health&&r.health.died,
      ...(seen[r.h]||{}),knelled:(r.modes||{}).knelled||0,looks:(r.modes||{}).look||0,pinned:(r.modes||{}).stuck||0,held:(r.modes||{}).held||0,hitBy:Object.fromEntries(Object.entries(r.hitBy||{}).map(([k,v])=>[k,Math.round(v)]))}));})()`, 3600000);
  rows.push(...r); for (const x of r) console.log(JSON.stringify(x));
};
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
const sum = (rs, lab) => { const w = rs.filter(r => r.out === 'win');
  return { lab, fights: rs.length, wins: w.length, medianWin: med(w.map(r => r.secs)), medianSecs: med(rs.map(r => r.secs)), medianLeftPct: med(rs.map(r => r.left)), medianTaken: med(rs.map(r => r.taken).filter(x => x !== null)), medianTpm: med(rs.map(r => r.tpm)),
    stage3: rs.filter(r => r.stage >= 3).length, deaths: rs.filter(r => r.died).length, bossHp: rs[0] && rs[0].hp }; };
try {
  if (which !== 'normal') for (let p = 0; p < passes; p++) await one(p, 'refill', 150);
  if (which !== 'refill') for (let p = 0; p < passes; p++) await one(p, 'normal', 300);
  const summary = [sum(rows.filter(r => r.mode === 'refill'), 'refill 150s'), sum(rows.filter(r => r.mode === 'normal'), 'normal 300s')];
  console.log(JSON.stringify(summary));
  mkdirSync(new URL('../work/causeway2/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../work/causeway2/pilot-' + label + '.json', import.meta.url), JSON.stringify({ label, at: new Date().toISOString(), summary, rows }, null, 1));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
