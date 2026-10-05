/* tools/djinn-rates.mjs - THE DJINN's HUMAN-BOT WIN RATE, PER HERO, OVER SEEDS (claude/djinn2; a measuring tool, not a check). tools/combat-pilots.mjs
   fights one row per hero and its --seed never reaches bossLab (bossLab reseeds Math.random from the row's own key), so every seed there is the same
   fight. This passes the seed INTO bossLab (opts.seed), so each seed is a different sample of his dice and the bot's misreads - the per-hero spread
   Daniel asked for (10-03: "warden was 1/4"). The hero is the level the campaign expects there, no skills, normal health (as combat-pilots).
     PORT=6989 node tools/djinn-rates.mjs [--heroes=knight,warden,pyro] [--seeds=8] [--secs=240] [--level=welltown] [--out=file.json] */
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { levelOverride } from './boss-level.mjs';   /* --hero-level=N (here --level= is the BOSS LEVEL id) */
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 8), secs = +opt('secs', 240), id = opt('level', 'welltown'), OUT = opt('out', '');
const lvl = levelOverride() ?? Math.max(1, depthsOf(LEVELS)[id] ?? 1), rows = [];
let pg = await openPage({ audio: false, fonts: false });
try {
  for (const h of heroes) for (let s = 1; s <= seeds; s++) {
    let row;
    try { await pg.reload();
      row = await pg.evalp(`(async()=>{BK.manualSimulation=true;const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG;BKT.setHeroLevel(${JSON.stringify(h)},${lvl});P0.skillOwned[${JSON.stringify(h)}]={};P0.loadouts[${JSON.stringify(h)}]=[];if(P0.talents)P0.talents[${JSON.stringify(h)}]={};
        const r=(await BK.bossLab({bosses:[${JSON.stringify(id)}],heroes:[${JSON.stringify(h)}],maxSecs:${secs},healthMode:'normal',seed:${s}})).rows[0]||{};
        const d=BK.djinnHands&&BK.djinnHands()&&BK.djinnHands().read();
        return {outcome:r.outcome,secs:r.secs,bossLeft:r.hpLeftPct,taken:r.health?r.health.damageTaken:null,endHp:r.health?r.health.endHp:null,opened:r.opened,ph:d&&d.ph,hurt:d&&d.hurt,n:d&&{mud:d.n.mud,doused:d.n.doused,bailed:d.n.bailed,warded:d.n.warded,wardPassed:d.n.wardPassed}};})()`, 1200000);
    } catch (e) { row = { err: String(e.message).slice(0, 120) }; pg.close(); pg = await openPage({ audio: false, fonts: false }); }
    rows.push({ hero: h, seed: s, ...row }); console.log(h + ' s' + s + ': ' + JSON.stringify(row));
  }
} finally { pg.close(); }
const by = {}; for (const r of rows) { const b = by[r.hero] = by[r.hero] || { wins: 0, n: 0, secs: 0 }; b.n++; b.secs += r.secs || 0; if (r.outcome === 'win') b.wins++; }
const all = rows.filter(r => r.outcome === 'win').length;
console.log(Object.entries(by).map(([h, b]) => h + ' ' + b.wins + '/' + b.n + ' (' + (b.secs / b.n).toFixed(0) + ' s)').join('  ') + '   ALL ' + all + '/' + rows.length + ' = ' + Math.round(100 * all / rows.length) + '%');
if (OUT) writeFileSync(OUT, JSON.stringify(rows, null, 1));
