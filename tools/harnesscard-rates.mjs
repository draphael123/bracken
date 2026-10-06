/* tools/harnesscard-rates.mjs - HUMAN-BOT RATE PER HERO, OLD HARNESS vs NEW (claude/harnesscard; a measuring tool, not a check).
   Before HARNESSCARD a bot hero was levelled by XP alone (PROG.xp = xpFloor(n), no level-up card): growthAt(h, lv, null) = no Vigor/Endurance/Might
   picks, a much weaker hero than a real player who spent his n picks. 'old' reproduces that; 'new' is BKT.setHeroLevel (xp + the even card spread).
     PORT=6621 node tools/harnesscard-rates.mjs <levelId>[:mini] [--mode=old|new|both] [--heroes=knight,warden,pyro] [--seeds=4] [--from=1: first seed, to re-run one row] [--secs=240] [--out=file.json]
   The hero is the boss's CAMPAIGN LEVEL (tools/boss-level.mjs campaignLevel: the depth or the road's XP, never under L3 - claude/bot2), no skills,
   normal health. THE BOT is the boss standard's profile (src/bot-profile.js STANDARD, claude/bot2: the calibrated player who reacts to what is
   drawn); --profile=legacy is the old bot, --first a first attempt. claude/botlevel's table (depth levels, old bot) is --profile=legacy --depth. */
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { levelOverride, campaignLevel, campaignLevelDepth, profileOverride } from './boss-level.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const [id, flag] = args.find(a => !a.startsWith('-')).split(':'), mini = flag === 'mini';
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 4), from = +opt('from', 1), secs = +opt('secs', 240), OUT = opt('out', ''), modes = opt('mode', 'both') === 'both' ? ['old', 'new'] : [opt('mode', 'both')];
const lvl = levelOverride() ?? (args.includes('--depth') ? campaignLevelDepth(id) : campaignLevel(id)), rows = [], PROF = profileOverride();   /* (depthsOf: the old rule, --depth) */
let pg = await openPage({ audio: false, fonts: false });
try {
  for (const mode of modes) for (const h of heroes) for (let s = from; s < from + seeds; s++) {
    let row;
    try { await pg.reload();
      row = await pg.evalp(`(async()=>{BK.manualSimulation=true;const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG,h=${JSON.stringify(h)};
        ${mode === 'new' ? `BKT.setHeroLevel(h,${lvl});` : `P0.xp[h]=xpFloor(${lvl});`}P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
        BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();const maxHp=BK.P.maxHp,maxSt=BK.P.maxSt;
        const r=(await BK.bossLab({bosses:[${JSON.stringify(id)}],heroes:[h],maxSecs:${secs},healthMode:'normal',seed:${s},profile:${JSON.stringify(PROF)}${mini ? ',mini:true' : ''}})).rows[0]||{};
        return {maxHp,maxSt,outcome:r.outcome||r.skipped,secs:r.secs,bossLeft:r.hpLeftPct,taken:r.health?Math.round(r.health.damageTaken):null,endHp:r.health?r.health.endHp:null};})()`, 1200000);
    } catch (e) { row = { err: String(e.message).slice(0, 120) }; pg.close(); pg = await openPage({ audio: false, fonts: false }); }
    rows.push({ id, mini, lvl, mode, hero: h, seed: s, ...row }); console.log(id + ' ' + mode + ' ' + h + ' s' + s + ': ' + JSON.stringify(row));
  }
} finally { pg.close(); }
for (const mode of modes) { const by = {}; for (const r of rows.filter(r => r.mode === mode)) { const b = by[r.hero] = by[r.hero] || { wins: 0, n: 0, hp: r.maxHp }; b.n++; if (r.outcome === 'win') b.wins++; }
  console.log('SUMMARY ' + id + (mini ? ':mini' : '') + ' L' + lvl + ' ' + mode + ' ' + PROF + '  ' + Object.entries(by).map(([h, b]) => h + ' ' + b.wins + '/' + b.n + ' hp' + b.hp).join('  ')); }
if (OUT) writeFileSync(OUT, JSON.stringify(rows, null, 1));
