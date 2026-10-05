/* tools/combat-pilots.mjs - THE HUMAN-SPEED BOT ON A SAMPLE OF BOSSES, AT NORMAL HEALTH (claude/combat3, the combat pass; a measuring tool, not a check).
   The boss lab's bot (src/lab.js bossLab: ~250 ms reactions, it guards and rolls on the tells and goes for the openings it knows) fights each
   boss once per hero with NORMAL health - it can die - so a row is a win, a death or a timeout. Daniel's fairness target for a boss is 60-75%
   human-bot wins (docs/NEW-LEVEL-CHECKLIST.md). Run it BEFORE and AFTER a combat change (cost rule: 3 heroes x 1 seed).
     node tools/combat-pilots.mjs <level>[,<level>..] [--heroes=knight,warden,pyro] [--secs=180] [--seed=1919] [--out=file.json] [--mini] [--salts=1,2,3]
   --salts: each hero fights once per salt (bossLab's salt: a fight of its own each time), still one fight per page (claude/archmage2b: 21 fights = 7 salts x 3 heroes) */
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const DEPTH = depthsOf(LEVELS);   /* the hero is the level the campaign expects there (its depth on the gate chain), no skills: as tools/mash-bot.mjs */
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const ids = args.filter(a => !a.startsWith('-')).flatMap(a => a.split(',')), heroes = opt('heroes', 'knight,warden,pyro').split(','), secs = +opt('secs', 180), seed = +opt('seed', 1919), OUT = opt('out', ''), MINI = args.includes('--mini'), SALTS = opt('salts', '').split(',').filter(Boolean).map(Number);
/* (claude/fairfix5) --seed= is passed on to the lab as opts.seed (a different pinned roll per rep): it only seeded the page before, and bossLab re-seeds every row
   from its level|hero|health alone, so three "seeds" replayed one fight three times. Left out, every row replays exactly as before */
const SEEDED = args.some(a => a.startsWith('--seed='));
/* (claude/bosswave2) --nudge=K: with --salts, salt n starts the hero K px off the usual spot (alternating sides: +K, -K, +2K, -2K..; lab.js opts.nudge). Some fights
   (the Herald, the Bullfrog) use no dice the salt can reach and replay exactly under every salt: the start is what varies a human's fight */
const NUDGE = +opt('nudge', 0), nudgeOf = s => NUDGE && s ? (s % 2 ? 1 : -1) * Math.ceil(s / 2) * NUDGE : 0;
const rows = [];
let pg = await openPage({ audio: false, fonts: false });
try {
  for (const id of ids) for (const salt of SALTS.length ? SALTS : [0]) for (const h of heroes) {
    let row;
    try { await pg.reload();
      const lvl = Math.max(1, DEPTH[id] ?? 1);
      row = await pg.evalp(`(async()=>{BK.manualSimulation=true;const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG;BKT.setHeroLevel(${JSON.stringify(h)},${lvl});P0.skillOwned[${JSON.stringify(h)}]={};P0.loadouts[${JSON.stringify(h)}]=[];if(P0.talents)P0.talents[${JSON.stringify(h)}]={};let seed=${seed};Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
        const r=(await BK.bossLab({bosses:[${JSON.stringify(id)}],heroes:[${JSON.stringify(h)}],maxSecs:${secs},healthMode:'normal'${MINI ? ',mini:true' : ''}${salt ? ',salt:' + salt : ''}${nudgeOf(salt) ? ',nudge:' + nudgeOf(salt) : ''}${SEEDED ? ',seed:' + seed : ''}})).rows[0]||{};
        return {outcome:r.outcome,secs:r.secs,bossLeft:r.hpLeftPct,taken:r.health?r.health.damageTaken:null,endHp:r.health?r.health.endHp:null,opened:r.opened,swings:r.swings};})()`, 1200000);
    } catch (e) { row = { err: String(e.message).slice(0, 120) }; pg.close(); pg = await openPage({ audio: false, fonts: false }); }
    rows.push({ id, hero: h, salt, ...row }); console.log(id + ' ' + h + (salt ? ' salt ' + salt : '') + ': ' + JSON.stringify(row));
  }
} finally { pg.close(); }
const by = {}; for (const r of rows) { const b = by[r.id] = by[r.id] || { wins: 0, n: 0 }; b.n++; if (r.outcome === 'win') b.wins++; }
console.log(Object.entries(by).map(([id, b]) => id + ' ' + b.wins + '/' + b.n).join('  '));
if (OUT) writeFileSync(OUT, JSON.stringify(rows, null, 1));
