// work/claude/knight-lab.mjs [out.json] [level,level] - THE KNIGHT'S BOSS PILOTS, before and after the knight rework.
// Every arena (and every mini) the campaign has, the knight alone, the dice pinned, in BOTH health modes:
//   refill - the lab's classic number: does the bot kill it inside 180 s, and how long it takes
//   normal - one life: does he win, or die
// Run it in two checkouts (the old code and the new) and compare the files: nothing he could beat may become unbeatable.
import { openPage } from '../../tools/cdp.mjs';
import { portFor } from '../../tools/ports.mjs';
import { LEVELS } from '../../src/level.js';
import { writeFileSync } from 'node:fs';
const [out = 'knight-lab.json', sel] = process.argv.slice(2);
const ids = sel ? sel.split(',') : LEVELS.filter(l => (!l.hidden || l.secret) && l.build().arena).map(l => l.id);
const minis = sel ? [] : LEVELS.filter(l => (!l.hidden || l.secret) && l.build().mini).map(l => l.id);
const jobs = [...ids.map(id => [id, false]), ...minis.map(id => [id, true])];
const pg = await openPage({ port: portFor(7), audio: false, fonts: false });
const rows = [];
try {
  await pg.evalp('window.__base=JSON.parse(JSON.stringify(BKT.PROG));');
  for (const [id, mini] of jobs) for (const mode of ['refill', 'normal']) {
    await pg.reload(); await pg.evalp('window.__base=JSON.parse(JSON.stringify(BKT.PROG));');
    const row = await pg.evalp(`(async()=>{BK.manualSimulation=true;
      const p=BKT.PROG;for(const k of Object.keys(p))delete p[k];Object.assign(p,JSON.parse(JSON.stringify(window.__base)));
      p.xp={};p.skillOwned={};p.loadouts={};p.items={};p.ranks={};for(const k of Object.keys(BK.keys))BK.keys[k]=false;BK.coopEnd();
      const random=Math.random;let seed=1919;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      let par=0,blk=0;
      try{const r=(await BK.bossLab({bosses:[${JSON.stringify(id)}],heroes:['knight'],maxSecs:180,healthMode:'${mode}',mini:${mini}})).rows[0];
        const s=BK.stats();return {...r,parries:s.parries,blocks:s.blocks};}finally{Math.random=random;}})()`, 900000).catch(e => ({ error: e.message }));
    const r = { id, mini, mode, killed: row.killed, secs: row.secs, outcome: row.outcome, hpLeft: row.hpLeftPct, taken: row.takenPerMin, skipped: row.skipped, error: row.error, parries: row.parries, blocks: row.blocks };
    rows.push(r); writeFileSync(out, JSON.stringify(rows, null, 1));
    console.log((id + (mini ? '(mini)' : '')).padEnd(18), mode.padEnd(7), r.skipped ? 'skipped ' + r.skipped : r.error ? 'ERROR ' + r.error : (r.killed ? 'KILLED ' + r.secs + 's' : 'alive ' + r.hpLeft + '%') + ' ' + (r.outcome || ''));
  }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 5));
} finally { pg.close(); }
