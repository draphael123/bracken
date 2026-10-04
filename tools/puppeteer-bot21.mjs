/* tools/puppeteer-bot21.mjs - THE PUPPETEER's HUMAN-SPEED BOT BAND (claude/puppeteer2; a measuring tool, not a check). The boss lab's human bot
   (src/puppeteer.js puppetPlan through src/lab.js) fights THE PUPPETEER at the theatre's campaign depth with no skills, NORMAL health, ONE FIGHT PER
   PAGE (a reload between rows), salts 1..N per hero. Target (scratch/design-standard.md B6): 50-60% across knight/warden/pyro, no hero at 0/N.
     node tools/puppeteer-bot21.mjs [--heroes=knight,warden,pyro] [--salts=7] [--secs=300] [--out=file.json] */
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const heroes = opt('heroes', 'knight,warden,pyro').split(','), salts = +opt('salts', 7), secs = +opt('secs', 300), OUT = opt('out', ''), lvl = Math.max(1, depthsOf(LEVELS).theatre ?? 1);
const rows = []; let pg = await openPage({ audio: false, fonts: false });
try {
  for (let s = +opt('from', 1); s <= salts; s++) for (const h of heroes) { let row;
    try { await pg.reload();
      row = await pg.evalp(`(async()=>{BK.manualSimulation=true;const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG;P0.xp[${JSON.stringify(h)}]=xpFloor(${lvl});P0.card={...(P0.card||{}),[${JSON.stringify(h)}]:(await import('/src/progression.js')).evenCard(${lvl})};P0.skillOwned[${JSON.stringify(h)}]={};P0.loadouts[${JSON.stringify(h)}]=[];if(P0.talents)P0.talents[${JSON.stringify(h)}]={};
        let mx={cycle:0,stag:0,thrown:0,scenes:[]};const r=(await BK.bossLab({bosses:['theatre'],heroes:[${JSON.stringify(h)}],maxSecs:${secs},healthMode:'normal',salt:${s},onFrame:()=>{const q=BK.puppeteer();if(q){mx.cycle=q.cycle;mx.stag=q.n.stagger;mx.thrown=q.n.thrown;mx.slack=q.n.slack;mx.restrung=q.n.restrung;if(!mx.scenes.includes(q.sceneKey))mx.scenes.push(q.sceneKey);mx.hurt=q.hurt;}}})).rows[0]||{};
        return {outcome:r.outcome,secs:r.secs,bossLeft:r.hpLeftPct,taken:r.health?Math.round(r.health.damageTaken):null,...mx};})()`, 1200000);
    } catch (e) { row = { err: String(e.message).slice(0, 120) }; pg.close(); pg = await openPage({ audio: false, fonts: false }); }
    rows.push({ hero: h, salt: s, ...row }); console.log(h + ' s' + s + ': ' + JSON.stringify(row));
  }
} finally { pg.close(); }
const by = {}; for (const r of rows) { const b = by[r.hero] = by[r.hero] || { wins: 0, n: 0, secs: [] }; b.n++; if (r.outcome === 'win') { b.wins++; b.secs.push(r.secs); } }
const tot = rows.filter(r => r.outcome === 'win').length;
console.log(Object.entries(by).map(([h, b]) => h + ' ' + b.wins + '/' + b.n + (b.secs.length ? ' (wins ' + Math.round(Math.min(...b.secs)) + '-' + Math.round(Math.max(...b.secs)) + ' s)' : '')).join('  ') + '   TOTAL ' + tot + '/' + rows.length + ' = ' + Math.round(100 * tot / rows.length) + '%');
if (OUT) writeFileSync(OUT, JSON.stringify(rows, null, 1));
